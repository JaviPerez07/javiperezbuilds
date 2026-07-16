import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = process.cwd();
const creatorDealUrl = 'https://whop.com/creator-deal-test';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function safeFilePath(requestPath) {
  const pathname = requestPath === '/links' ? '/links.html' : requestPath;
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  assert(filePath.startsWith(`${root}${path.sep}`) || filePath === path.join(root, 'index.html'));
  return filePath;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const filePath = safeFilePath(url.pathname);
    let body = await readFile(filePath, 'utf8');
    if (url.searchParams.get('creator') === '1' && path.basename(filePath) === 'links.html') {
      body = body.replace('var CREATOR_DEAL_WHOP_URL = "";', `var CREATOR_DEAL_WHOP_URL = "${creatorDealUrl}";`);
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'text/plain; charset=utf-8' });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseURL = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });

async function newTrackedPage(options = {}) {
  const context = await browser.newContext({
    javaScriptEnabled: options.javaScriptEnabled !== false,
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    viewport: options.viewport || { width: 390, height: 844 }
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.dataLayer = [];
  });
  return { context, page, consoleErrors, pageErrors };
}

async function assertNoRuntimeErrors(label, consoleErrors, pageErrors) {
  assert.deepEqual(consoleErrors, [], `${label}: console errors`);
  assert.deepEqual(pageErrors, [], `${label}: unhandled page errors`);
}

async function assertNoHorizontalOverflow(page, label) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.equal(layout.scrollWidth, layout.clientWidth, `${label}: horizontal overflow`);
}

async function assertVisible(locator, label) {
  assert.equal(await locator.count(), 1, `${label} should exist once`);
  assert.equal(await locator.isVisible(), true, `${label} should be visible`);
}

try {
  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage();
    const response = await page.goto(`${baseURL}/links`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, 'links should respond 200');
    await assertVisible(page.getByRole('heading', { name: 'Javi Pérez' }), 'H1');
    await assertVisible(page.getByRole('link', { name: /Solicitar auditoría/ }), 'audit link');
    await assertVisible(page.getByRole('link', { name: /Explorar agentes de IA/ }), 'agents link');
    const telegramLink = page.getByRole('link', { name: /Entrar al canal de Telegram/ });
    await assertVisible(telegramLink, 'telegram channel link');
    assert.equal(await telegramLink.getAttribute('href'), 'https://t.me/javiperezchallenger');
    assert.equal(await telegramLink.getAttribute('data-links-track'), 'links_telegram_click');
    await assertVisible(page.getByRole('link', { name: 'Instagram' }), 'instagram link');
    await assertVisible(page.getByRole('link', { name: 'TikTok' }), 'tiktok link');
    await assertVisible(page.getByRole('link', { name: 'LinkedIn' }), 'linkedin link');
    await assertVisible(page.locator('a[data-social-platform="x"]'), 'x link');
    assert.equal(await page.getByRole('link', { name: /YouTube/ }).count(), 0, 'YouTube should stay hidden without a verified URL');
    assert.equal(await page.getByRole('link', { name: /Analiza tu próximo brand deal/ }).count(), 0, 'Creator Deal should stay hidden without Whop URL');

    const hrefs = await page.locator('a').evaluateAll((links) => links
      .filter((link) => !link.hidden && link.getAttribute('href') !== null)
      .map((link) => link.getAttribute('href')));
    assert(hrefs.length > 0, 'links should exist');
    for (const href of hrefs) {
      assert(href && href !== '#', `invalid href: ${href}`);
    }
    await assertNoHorizontalOverflow(page, 'mobile links');
    await assertNoRuntimeErrors('mobile links', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links visible links and valid hrefs');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${baseURL}/links?creator=1`, { waitUntil: 'networkidle' });
    const creator = page.getByRole('link', { name: /Analiza tu próximo brand deal/ });
    await assertVisible(creator, 'Creator Deal link');
    assert.equal(await creator.getAttribute('href'), creatorDealUrl, 'Creator Deal should use configured Whop URL');
    await assertNoHorizontalOverflow(page, 'desktop creator links');
    await assertNoRuntimeErrors('desktop creator links', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links Creator Deal appears only with Whop URL');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ viewport: { width: 375, height: 812 } });
    await page.goto(`${baseURL}/links?debug_track=1`, { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /Solicitar auditoría/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Entrar al canal de Telegram/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Solicitar auditoría/ }).click();
    await page.getByRole('link', { name: /Entrar al canal de Telegram/ }).click();
    const events = await page.evaluate(() => ({
      audit: window.dataLayer.filter((item) => item.event === 'links_audit_click').length,
      telegram: window.dataLayer.filter((item) => item.event === 'links_telegram_click').length
    }));
    assert.equal(events.audit, 1, 'audit click analytics should fire once');
    assert.equal(events.telegram, 1, 'Telegram click analytics should fire once');
    await assertNoRuntimeErrors('analytics click', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links analytics fires once per click');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
    await page.goto(`${baseURL}/links`, { waitUntil: 'load' });
    await assertVisible(page.getByRole('heading', { name: 'Javi Pérez' }), 'no-JS H1');
    await assertVisible(page.getByRole('link', { name: /Solicitar auditoría/ }), 'no-JS audit link');
    await assertVisible(page.getByRole('link', { name: /Entrar al canal de Telegram/ }), 'no-JS telegram channel link');
    await assertNoHorizontalOverflow(page, 'no-JS 320px links');
    await assertNoRuntimeErrors('no-JS 320px links', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links works without JavaScript at 320px');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ reducedMotion: true, viewport: { width: 768, height: 900 } });
    await page.goto(`${baseURL}/links`, { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    const focusedLabel = await page.evaluate(() => document.activeElement?.textContent || '');
    assert.match(focusedLabel, /Solicitar auditoría/, 'keyboard should focus first primary link');
    await assertNoHorizontalOverflow(page, 'reduced motion links');
    await assertNoRuntimeErrors('reduced motion links', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links keyboard and reduced motion');
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
