import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = process.cwd();
const creatorDealUrl = 'https://whop.com/creator-deal-test';
const quantForensicsUrl = 'https://quantforensicsfx.com/?utm_source=instagram&utm_medium=organic&utm_campaign=quant_launch&utm_content=bio_links';
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
    const quantLink = page.getByRole('link', { name: /Quant Forensics/ });
    await assertVisible(quantLink, 'Quant Forensics link');
    assert.equal(await quantLink.getAttribute('href'), quantForensicsUrl);
    assert.equal(await quantLink.getAttribute('target'), '_blank');
    assert.equal(await quantLink.getAttribute('rel'), 'noopener noreferrer');
    assert.equal(await quantLink.getAttribute('data-links-track'), 'quantforensics_link_click');
    await assertVisible(quantLink.getByText('NUEVO', { exact: true }), 'Quant Forensics badge');
    await assertVisible(quantLink.getByText('Audita tu estrategia →', { exact: true }), 'Quant Forensics CTA');
    assert.equal(await quantLink.getByText(/9,49|24,99|Core/).count(), 0, 'Quant Forensics card should not expose prices');
    const quantParams = new URL(await quantLink.getAttribute('href')).searchParams;
    assert.equal(quantParams.get('utm_source'), 'instagram');
    assert.equal(quantParams.get('utm_medium'), 'organic');
    assert.equal(quantParams.get('utm_campaign'), 'quant_launch');
    assert.equal(quantParams.get('utm_content'), 'bio_links');

    const primaryLinks = await page.locator('.links-list > a').evaluateAll((links) => links.map((link) => ({
      title: link.querySelector('b')?.textContent.trim() || '',
      description: link.querySelector('small')?.textContent.trim() || '',
      href: link.getAttribute('href'),
      track: link.getAttribute('data-links-track'),
      target: link.getAttribute('target'),
      rel: link.getAttribute('rel'),
      hidden: link.hidden
    })));
    assert.equal(primaryLinks[0].track, 'quantforensics_link_click', 'Quant Forensics should be first');
    assert.deepEqual(primaryLinks.slice(1), [
      { title: 'Solicitar auditoría', description: 'Detecta dónde se enfría tu captación.', href: 'auditoria.html', track: 'links_audit_click', target: null, rel: null, hidden: false },
      { title: 'Analiza tu próximo brand deal', description: 'Entiende qué está comprando realmente la marca.', href: null, track: 'links_creator_deal_click', target: '_blank', rel: 'noopener noreferrer', hidden: true },
      { title: 'Explorar OperatorStack', description: 'Detecta fugas de margen y convierte costes en decisiones.', href: 'https://getoperatorstack.com', track: 'links_operatorstack_click', target: '_blank', rel: 'noopener noreferrer', hidden: false },
      { title: 'Explorar agentes de IA', description: 'Sistemas y agentes que ejecutan trabajo real.', href: 'agentes.html', track: 'links_agents_click', target: null, rel: null, hidden: false },
      { title: 'Entrar al canal de Telegram', description: 'Builds, agentes y recursos. Directo al canal.', href: 'https://t.me/javiperezchallenger', track: 'links_telegram_click', target: '_blank', rel: 'noopener noreferrer', hidden: false },
      { title: 'Hablar conmigo por WhatsApp', description: 'Cuéntame qué estás construyendo o dónde se frena.', href: 'https://wa.me/34644289776?text=Hola%20Javi%2C%20vengo%20de%20tu%20p%C3%A1gina%20de%20enlaces.', track: 'links_whatsapp_click', target: '_blank', rel: 'noopener noreferrer', hidden: false }
    ], 'existing primary links must remain byte-for-byte equivalent in content and attributes');

    const socialLinks = await page.locator('.links-social > a').evaluateAll((links) => links.map((link) => ({
      text: link.textContent.trim(), href: link.getAttribute('href'), track: link.getAttribute('data-links-track'),
      platform: link.getAttribute('data-social-platform'), target: link.getAttribute('target'), rel: link.getAttribute('rel')
    })));
    assert.deepEqual(socialLinks, [
      { text: 'Instagram', href: 'https://www.instagram.com/javiperezbuilds/', track: 'links_social_click', platform: 'instagram', target: '_blank', rel: 'noopener noreferrer' },
      { text: 'TikTok', href: 'https://www.tiktok.com/@javiperezbuilds', track: 'links_social_click', platform: 'tiktok', target: '_blank', rel: 'noopener noreferrer' },
      { text: 'LinkedIn', href: 'https://www.linkedin.com/in/javi-perez-guides', track: 'links_social_click', platform: 'linkedin', target: '_blank', rel: 'noopener noreferrer' },
      { text: 'X', href: 'https://twitter.com/javiperezbuilds', track: 'links_social_click', platform: 'x', target: '_blank', rel: 'noopener noreferrer' }
    ], 'existing social links must remain unchanged and in the same relative order');
    assert.equal(await page.getByRole('link', { name: 'Legal y privacidad' }).getAttribute('href'), 'legal.html');
    await assertVisible(page.getByRole('link', { name: /Solicitar auditoría/ }), 'audit link');
    const operatorStackLink = page.getByRole('link', { name: /Explorar OperatorStack/ });
    await assertVisible(operatorStackLink, 'OperatorStack link');
    assert.equal(await operatorStackLink.getAttribute('href'), 'https://getoperatorstack.com');
    assert.equal(await operatorStackLink.getAttribute('data-links-track'), 'links_operatorstack_click');
    await assertVisible(page.getByRole('link', { name: /Explorar agentes de IA/ }), 'agents link');
    const telegramLink = page.getByRole('link', { name: /Entrar al canal de Telegram/ });
    await assertVisible(telegramLink, 'telegram channel link');
    assert.equal(await telegramLink.getAttribute('href'), 'https://t.me/javiperezchallenger');
    assert.equal(await telegramLink.getAttribute('data-links-track'), 'links_telegram_click');
    const whatsappLink = page.getByRole('link', { name: /Hablar conmigo por WhatsApp/ });
    await assertVisible(whatsappLink, 'WhatsApp contact link');
    assert.match(await whatsappLink.getAttribute('href'), /^https:\/\/wa\.me\/34644289776\?text=/);
    assert.equal(await whatsappLink.getAttribute('data-links-track'), 'links_whatsapp_click');
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
    await page.getByRole('link', { name: /Quant Forensics/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Solicitar auditoría/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Entrar al canal de Telegram/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Explorar OperatorStack/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Hablar conmigo por WhatsApp/ }).evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
    await page.getByRole('link', { name: /Quant Forensics/ }).click();
    await page.getByRole('link', { name: /Solicitar auditoría/ }).click();
    await page.getByRole('link', { name: /Entrar al canal de Telegram/ }).click();
    await page.getByRole('link', { name: /Explorar OperatorStack/ }).click();
    await page.getByRole('link', { name: /Hablar conmigo por WhatsApp/ }).click();
    const events = await page.evaluate(() => ({
      quant: window.dataLayer.filter((item) => item.event === 'quantforensics_link_click'),
      audit: window.dataLayer.filter((item) => item.event === 'links_audit_click').length,
      telegram: window.dataLayer.filter((item) => item.event === 'links_telegram_click').length,
      operatorStack: window.dataLayer.filter((item) => item.event === 'links_operatorstack_click').length,
      whatsapp: window.dataLayer.filter((item) => item.event === 'links_whatsapp_click').length
    }));
    assert.deepEqual(events.quant, [{
      event: 'quantforensics_link_click',
      source: 'instagram',
      placement: 'bio_links',
      product: 'quant_forensics',
      destination: 'quantforensicsfx.com'
    }], 'Quant Forensics analytics should fire once with the expected non-PII payload');
    assert.equal(events.audit, 1, 'audit click analytics should fire once');
    assert.equal(events.telegram, 1, 'Telegram click analytics should fire once');
    assert.equal(events.operatorStack, 1, 'OperatorStack click analytics should fire once');
    assert.equal(events.whatsapp, 1, 'WhatsApp click analytics should fire once');
    await assertNoRuntimeErrors('analytics click', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links analytics fires once per click');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ viewport: { width: 390, height: 844 } });
    await context.route('https://quantforensicsfx.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Quant Forensics</title><h1>Quant Forensics</h1>' });
    });
    await page.goto(`${baseURL}/links`, { waitUntil: 'networkidle' });
    const popupPromise = context.waitForEvent('page');
    await page.getByRole('link', { name: /Quant Forensics/ }).click();
    const quantPage = await popupPromise;
    await quantPage.waitForLoadState('load');
    assert.equal(quantPage.url(), quantForensicsUrl, 'Quant Forensics click should preserve the exact destination and UTMs');
    await assertNoRuntimeErrors('Quant Forensics destination', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ Quant Forensics click opens the exact destination');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
    await page.goto(`${baseURL}/links`, { waitUntil: 'load' });
    await assertVisible(page.getByRole('heading', { name: 'Javi Pérez' }), 'no-JS H1');
    await assertVisible(page.getByRole('link', { name: /Quant Forensics/ }), 'no-JS Quant Forensics link');
    await assertVisible(page.getByRole('link', { name: /Solicitar auditoría/ }), 'no-JS audit link');
    await assertVisible(page.getByRole('link', { name: /Explorar OperatorStack/ }), 'no-JS OperatorStack link');
    await assertVisible(page.getByRole('link', { name: /Entrar al canal de Telegram/ }), 'no-JS telegram channel link');
    await assertVisible(page.getByRole('link', { name: /Hablar conmigo por WhatsApp/ }), 'no-JS WhatsApp contact link');
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
    assert.match(focusedLabel, /Quant Forensics/, 'keyboard should focus Quant Forensics as the first primary link');
    await assertNoHorizontalOverflow(page, 'reduced motion links');
    await assertNoRuntimeErrors('reduced motion links', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ /links keyboard and reduced motion');
  }

  {
    for (const viewport of [
      { width: 320, height: 740 },
      { width: 390, height: 844 },
      { width: 768, height: 900 },
      { width: 1440, height: 1000 }
    ]) {
      const { context, page, consoleErrors, pageErrors } = await newTrackedPage({ viewport });
      await page.goto(`${baseURL}/links`, { waitUntil: 'networkidle' });
      await assertNoHorizontalOverflow(page, `/links ${viewport.width}px`);
      const quantLayout = await page.getByRole('link', { name: /Quant Forensics/ }).evaluate((link) => {
        const rect = link.getBoundingClientRect();
        return {
          clientWidth: link.clientWidth,
          scrollWidth: link.scrollWidth,
          left: rect.left,
          right: rect.right,
          viewportWidth: document.documentElement.clientWidth
        };
      });
      assert(quantLayout.clientWidth >= 44, `Quant Forensics touch target should be at least 44px at ${viewport.width}px`);
      assert(quantLayout.scrollWidth <= quantLayout.clientWidth, `Quant Forensics card should not clip content at ${viewport.width}px`);
      assert(quantLayout.left >= 0 && quantLayout.right <= quantLayout.viewportWidth, `Quant Forensics card should remain inside the viewport at ${viewport.width}px`);
      await assertNoRuntimeErrors(`/links ${viewport.width}px`, consoleErrors, pageErrors);
      await context.close();
    }
    console.log('✓ /links responsive layout at 320, 390, 768 and 1440px');
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
