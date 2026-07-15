import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = process.cwd();
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url, 'http://127.0.0.1').pathname;
    const relativePath = requestPath === '/auditoria' || requestPath === '/auditoria/' ? 'auditoria.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath || 'auditoria.html');
    assert(filePath.startsWith(`${root}${path.sep}`));
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseURL = `http://127.0.0.1:${port}/auditoria`;
const browser = await chromium.launch({ headless: true });

async function fillValidForm(page) {
  await page.locator('#f-name').fill('Ada Example');
  await page.locator('#f-company').fill('Example Studio');
  await page.locator('#f-city').fill('Almería');
  await page.locator('#f-sector').fill('Clínica dental');
  await page.locator('#f-website').fill('https://example.com/landing');
  await page.locator('input[name="has_active_ad"][value="Sí"]').check();
  await page.locator('#f-ad-desc').fill('Campaña local');
  await page.locator('#f-channel').selectOption({ label: 'Meta' });
  await page.locator('#f-spend').selectOption({ label: '300–1000€' });
  await page.locator('#f-valid-lead').fill('Una persona que solicita una cita');
  await page.locator('#f-contact').fill('ada@example.com');
}

async function runScenario(name, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport || { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const notifyPayloads = [];
  let web3Calls = 0;
  let notifyCalls = 0;

  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('https://api.web3forms.com/submit', async (route) => {
    web3Calls += 1;
    await route.fulfill({
      status: options.web3Success === false ? 400 : 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: options.web3Success !== false })
    });
  });
  await page.route('**/api/audit-notify', async (route) => {
    notifyCalls += 1;
    notifyPayloads.push(JSON.parse(route.request().postData() || '{}'));
    await route.fulfill({
      status: options.notifySuccess === false ? 502 : 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: options.notifySuccess !== false })
    });
  });

  await page.goto(baseURL, { waitUntil: 'load' });
  await page.evaluate(() => {
    window.__auditEvents = [];
    window.JP_TRACK = (eventName, data) => window.__auditEvents.push({ eventName, data });
  });
  await fillValidForm(page);

  if (options.honeypot) {
    await page.evaluate(() => { document.querySelector('[name="botcheck"]').checked = true; });
  }
  if (options.doubleSubmit) {
    await page.evaluate(() => {
      const form = document.getElementById('audit-form');
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  } else {
    await page.locator('#audit-submit').click();
  }

  if (options.honeypot) {
    await page.waitForTimeout(150);
    assert.equal(web3Calls, 0, `${name}: honeypot Web3Forms calls`);
    assert.equal(notifyCalls, 0, `${name}: honeypot notification calls`);
  } else if (options.web3Success === false) {
    await page.locator('#audit-error.is-visible').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#audit-thanks').isVisible(), false, `${name}: thanks hidden`);
    assert.equal(notifyCalls, 0, `${name}: notification not called`);
    assert.equal(await page.locator('#audit-submit').isEnabled(), true, `${name}: submit re-enabled`);
  } else {
    await page.locator('#audit-thanks').waitFor({ state: 'visible' });
    assert.equal(web3Calls, 1, `${name}: single Web3Forms submission`);
    assert.equal(notifyCalls, 1, `${name}: single Brevo notification`);
    assert.equal(notifyPayloads[0].company, 'Example Studio');
    assert.equal(notifyPayloads[0].contact_whatsapp_email, 'ada@example.com');
    assert.equal('access_key' in notifyPayloads[0], false, `${name}: Web3Forms key excluded`);
    assert(notifyPayloads[0].source_url.startsWith(baseURL), `${name}: source URL included`);
  }

  const events = await page.evaluate(() => window.__auditEvents);
  const serializedEvents = JSON.stringify(events);
  assert(!serializedEvents.includes('Ada Example'), `${name}: tracking excludes name`);
  assert(!serializedEvents.includes('Example Studio'), `${name}: tracking excludes company`);
  assert(!serializedEvents.includes('ada@example.com'), `${name}: tracking excludes contact`);

  if (options.web3Success === false) {
    assert(events.some((event) => event.eventName === 'audit_form_submit_failed'), `${name}: Web3Forms failure event`);
  } else if (options.notifySuccess === false) {
    assert(events.some((event) => event.eventName === 'audit_notification_failed'), `${name}: notification failure event`);
    const note = await page.locator('[data-thanks-note]').textContent();
    assert(note.includes('guardada correctamente'), `${name}: stored message`);
  } else if (!options.honeypot) {
    assert(events.some((event) => event.eventName === 'audit_form_submit_success'), `${name}: success event`);
  }

  const unexpectedConsoleErrors = consoleErrors.filter((message) => {
    if (options.notifySuccess === false && message.includes('502 (Bad Gateway)')) return false;
    if (options.web3Success === false && message.includes('400 (Bad Request)')) return false;
    return true;
  });
  assert.deepEqual(unexpectedConsoleErrors, [], `${name}: unexpected console errors`);
  assert(!JSON.stringify(consoleErrors).includes('ada@example.com'), `${name}: console excludes contact`);
  assert.deepEqual(pageErrors, [], `${name}: page errors`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth), true, `${name}: overflow`);
  await context.close();
  console.log(`✓ ${name}`);
}

try {
  await runScenario('Web3Forms success + Brevo success + double submit', { doubleSubmit: true });
  await runScenario('Web3Forms success + Brevo error', { notifySuccess: false });
  await runScenario('Web3Forms error', { web3Success: false });
  await runScenario('honeypot', { honeypot: true });
  await runScenario('mobile 390px', { viewport: { width: 390, height: 844 } });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
