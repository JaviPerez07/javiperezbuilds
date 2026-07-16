import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = process.cwd();
const checkoutUrl = 'https://buy.stripe.com/fZu7sLf6bbHIasv7gH9fW0I';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function safeFilePath(requestPath) {
  const routeMap = {
    '/': '/index.html',
    '/agentes': '/agentes.html',
    '/agentes/lead-scout': '/agentes/lead-scout.html',
    '/agentes/gracias': '/agentes/gracias.html',
    '/agentes/web': '/agentes/web.html',
    '/agentes/trading': '/agentes/trading.html',
    '/auditoria': '/auditoria.html',
    '/links': '/links.html',
    '/legal': '/legal.html'
  };
  const pathname = routeMap[requestPath] || requestPath;
  const filePath = path.resolve(root, pathname.replace(/^\/+/, ''));
  assert(filePath.startsWith(`${root}${path.sep}`));
  return filePath;
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const filePath = safeFilePath(url.pathname);
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
const baseURL = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });

async function newPage(options = {}) {
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
  if (options.javaScriptEnabled !== false) {
    await page.addInitScript(() => { window.dataLayer = []; });
  }
  return { context, page, consoleErrors, pageErrors };
}

async function assertVisible(locator, label) {
  assert.equal(await locator.count(), 1, `${label} should exist once`);
  assert.equal(await locator.isVisible(), true, `${label} should be visible`);
}

async function assertNoOverflow(page, label) {
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.equal(layout.scrollWidth, layout.clientWidth, `${label}: horizontal overflow`);
}

function assertNoErrors(label, consoleErrors, pageErrors) {
  assert.deepEqual(consoleErrors, [], `${label}: console errors`);
  assert.deepEqual(pageErrors, [], `${label}: page errors`);
}

try {
  {
    for (const route of ['/', '/agentes', '/agentes/lead-scout', '/agentes/gracias', '/agentes/web', '/agentes/trading', '/auditoria', '/links', '/legal']) {
      const response = await fetch(`${baseURL}${route}`);
      assert.equal(response.status, 200, `${route} should remain available`);
    }
    console.log('✓ existing and new routes remain available');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage();
    const response = await page.goto(`${baseURL}/agentes`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await assertVisible(page.getByRole('heading', { name: /Agentes que hacen trabajo/ }), 'catalog H1');
    await assertVisible(page.getByRole('link', { name: /Ver el primer drop/ }), 'first drop CTA');
    await assertVisible(page.getByRole('link', { name: /Entrar al Telegram/ }), 'Telegram CTA');
    const catalog = page.locator('.as-catalog-grid');
    await assertVisible(catalog.getByRole('heading', { name: 'Lead Scout — Agente de Prospección Local' }), 'Lead Scout card');
    await assertVisible(catalog.getByText('Próximamente', { exact: true }), 'upcoming label');
    assert.equal(await catalog.getByText(/trading/i).count(), 0, 'new catalog should not list trading agents');
    const catalogCheckout = catalog.getByRole('link', { name: 'Comprar por 3 €' });
    await assertVisible(catalogCheckout, 'catalog checkout CTA');
    assert.equal(await catalogCheckout.getAttribute('href'), checkoutUrl, 'catalog checkout should use the real Stripe URL');
    assert.equal(await catalogCheckout.getAttribute('target'), null, 'catalog checkout should open in the same tab');
    assert.equal(await catalog.locator('.as-product-card--soon').getByRole('link').count(), 0, 'upcoming card should not have a link');
    const telegram = page.getByRole('link', { name: /Entrar al Telegram/ });
    await telegram.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()));
    await telegram.click();
    const events = await page.evaluate(() => ({
      view: window.dataLayer.filter((item) => item.event === 'view_agent_catalog').length,
      telegram: window.dataLayer.filter((item) => item.event === 'click_telegram').length
    }));
    assert.equal(events.view, 1, 'catalog view should track once');
    assert.equal(events.telegram, 1, 'Telegram click should track once');
    await assertNoOverflow(page, 'catalog mobile');
    assertNoErrors('catalog', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ agent catalog content, scope and analytics');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage();
    const response = await page.goto(`${baseURL}/agentes/lead-scout`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await assertVisible(page.getByRole('heading', { name: /Encuentra negocios con señales reales/ }), 'Lead Scout H1');
    const sectionHeadings = [
      /Así pasa de un encargo concreto/,
      /De una búsqueda amplia a una lista/,
      /El sistema completo, no una frase/,
      /Tres pasos con una decisión humana/,
      /Probado en Claude Code con navegación web real/,
      'Para quién es',
      'Para quién no es',
      /Información pública, revisión humana/,
      '¿Quieres que lo instale y adapte a tu negocio?',
      /Lo que conviene saber antes de comprar/
    ];
    for (const sectionName of sectionHeadings) {
      await assertVisible(page.getByRole('heading', { name: sectionName, exact: typeof sectionName === 'string' }), String(sectionName));
    }
    const pricePanel = page.locator('.as-price-panel');
    await assertVisible(pricePanel.getByText('3 €', { exact: true }), 'launch price');
    const checkout = pricePanel.getByRole('link', { name: 'Comprar con Stripe' });
    await assertVisible(checkout, 'checkout CTA');
    const checkoutLinks = page.locator('[data-lead-checkout]');
    assert.equal(await checkoutLinks.count(), 5, 'hero, price, intermediate, final and sticky CTAs should exist');
    for (let index = 0; index < await checkoutLinks.count(); index += 1) {
      assert.equal(await checkoutLinks.nth(index).getAttribute('href'), checkoutUrl, `checkout CTA ${index + 1} should use the real Stripe URL`);
      assert.equal(await checkoutLinks.nth(index).getAttribute('target'), null, `checkout CTA ${index + 1} should open in the same tab`);
      assert.equal(await checkoutLinks.nth(index).getAttribute('aria-disabled'), null, `checkout CTA ${index + 1} should be enabled`);
    }
    await assertVisible(page.getByText('Pago seguro con Stripe. Recibirás Lead Scout de forma privada en el email utilizado durante el pago.'), 'private delivery checkout state');
    await assertVisible(page.getByText('Ejemplo demostrativo con datos ficticios'), 'demo disclosure');
    await assertVisible(page.getByText('Clínica Dental Ejemplo Ficticia'), 'verified fictitious demo lead');
    await assertVisible(page.getByText('Revisión humana requerida'), 'human review requirement');
    for (const fact of [
      'Pago único.',
      'Funciona con Claude Code.',
      'Instalación guiada.',
      'Sin suscripción.',
      'No envía mensajes automáticamente.',
      'Usa información empresarial pública.',
      'No garantiza respuestas, reuniones ni ventas.'
    ]) {
      await assertVisible(page.locator('.as-purchase-facts').getByText(fact, { exact: true }), `purchase fact: ${fact}`);
    }
    assert.equal(await page.locator('s').count(), 0, 'launch price must not use a crossed-out reference price');
    assert.equal(await page.getByText(/48\s*(horas|h)|cuenta atrás|countdown/i).count(), 0, 'launch price must not use fake time pressure');
    assert.equal(await page.getByText(/placeholder|pendiente de conectar|pendiente de confirmación/i).count(), 0, 'Lead Scout launch content should not expose pending placeholders');
    await page.evaluate(() => document.querySelector('#requisitos').scrollIntoView());
    await page.waitForFunction(() => document.body.classList.contains('mobile-buy-visible'));
    assert.equal(await page.locator('.as-mobile-buy').isVisible(), true, 'mobile buy bar should appear after the hero checkout leaves view');
    const schemaState = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => ({
      hasProduct: scripts.some((script) => /"@type"\s*:\s*"Product"/.test(script.textContent)),
      hasOffer: scripts.some((script) => /"price"\s*:\s*"3\.00"/.test(script.textContent) && /"priceCurrency"\s*:\s*"EUR"/.test(script.textContent) && /schema\.org\/InStock/.test(script.textContent)),
      hasRating: scripts.some((script) => /AggregateRating|aggregateRating|reviewCount/.test(script.textContent))
    }));
    assert.equal(schemaState.hasProduct, true, 'connected offer should publish Product schema');
    assert.equal(schemaState.hasOffer, true, 'Product schema should match Stripe price, currency and availability');
    assert.equal(schemaState.hasRating, false, 'Product schema must not invent ratings');
    const demoLink = page.getByRole('link', { name: /Ver cómo funciona/ });
    await demoLink.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()));
    await demoLink.click();
    const events = await page.evaluate(() => ({
      view: window.dataLayer.filter((item) => item.event === 'view_lead_scout').length,
      demo: window.dataLayer.filter((item) => item.event === 'click_lead_scout_demo').length
    }));
    assert.equal(events.view, 1, 'product view should track once');
    assert.equal(events.demo, 1, 'demo click should track once');
    await assertNoOverflow(page, 'Lead Scout mobile');
    assertNoErrors('Lead Scout', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ Lead Scout sections, responsible demo and live checkout');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${baseURL}/agentes/lead-scout`, { waitUntil: 'networkidle' });
    const checkout = page.locator('.as-price-panel').getByRole('link', { name: 'Comprar con Stripe' });
    assert.equal(await checkout.getAttribute('href'), checkoutUrl, 'configured checkout should hydrate exact URL');
    assert.equal(await checkout.getAttribute('aria-disabled'), null);
    await checkout.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()));
    await checkout.click();
    await checkout.click();
    const beginEvents = await page.evaluate(() => window.dataLayer.filter((item) => item.event === 'begin_lead_scout_checkout').length);
    assert.equal(beginEvents, 1, 'begin checkout should track once');
    const setup = page.getByRole('link', { name: /Solicitar configuración/ });
    await setup.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()));
    await setup.click();
    const setupEvents = await page.evaluate(() => window.dataLayer.filter((item) => item.event === 'click_agent_setup').length);
    assert.equal(setupEvents, 1, 'setup click should track once');
    await assertNoOverflow(page, 'Lead Scout desktop');
    assertNoErrors('configured checkout', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ checkout configuration, same-tab behavior, double-click guard and conversion events');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage({ viewport: { width: 390, height: 844 } });
    await page.route('https://buy.stripe.com/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Stripe checkout test</title><h1>Stripe checkout test</h1>' });
    });
    await page.goto(`${baseURL}/agentes/lead-scout`, { waitUntil: 'networkidle' });
    await page.locator('.as-product-hero').getByRole('link', { name: 'Conseguir Lead Scout por 3 €' }).click();
    await page.waitForURL(checkoutUrl);
    assert.equal(page.url(), checkoutUrl, 'checkout should navigate to the exact Stripe URL in the same tab');
    assertNoErrors('Stripe checkout navigation', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ real Stripe link opens in the same tab');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
    await page.goto(`${baseURL}/agentes/lead-scout`, { waitUntil: 'load' });
    await assertVisible(page.getByRole('heading', { name: /Encuentra negocios con señales reales/ }), 'no-JS Lead Scout H1');
    const noJsCheckout = page.locator('.as-price-panel').getByRole('link', { name: 'Comprar con Stripe' });
    await assertVisible(noJsCheckout, 'no-JS checkout state');
    assert.equal(await noJsCheckout.getAttribute('href'), checkoutUrl, 'checkout must work without JavaScript');
    await assertVisible(page.getByText('Clínica Dental Ejemplo Ficticia'), 'no-JS responsible demo');
    await assertNoOverflow(page, 'Lead Scout no-JS 320');
    assertNoErrors('Lead Scout no-JS', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ Lead Scout remains usable without JavaScript at 320px');
  }

  {
    const { context, page, consoleErrors, pageErrors } = await newPage({ reducedMotion: true, viewport: { width: 768, height: 900 } });
    const response = await page.goto(`${baseURL}/agentes/gracias`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await assertVisible(page.getByRole('heading', { name: 'Tu acceso a Lead Scout está en camino.' }), 'thanks H1');
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow,noarchive');
    assert.equal(await page.locator('a[href$=".zip"], a[download]').count(), 0, 'thanks page must not expose downloads');
    await assertVisible(page.getByText('Utilizaremos el email de tu compra para enviarte el paquete y la guía de instalación. Revisa también las carpetas de promociones y spam.'), 'exact private delivery copy');
    await assertVisible(page.getByText(/Si no lo has recibido, contacta con/), 'existing support channel');
    await assertNoOverflow(page, 'thanks page');
    assertNoErrors('thanks page', consoleErrors, pageErrors);
    await context.close();
    console.log('✓ secure post-purchase instructions and reduced motion');
  }

  {
    for (const width of [320, 390, 768, 1440]) {
      const { context, page, consoleErrors, pageErrors } = await newPage({ viewport: { width, height: width >= 768 ? 1000 : 844 } });
      await page.goto(`${baseURL}/agentes/lead-scout`, { waitUntil: 'networkidle' });
      await assertNoOverflow(page, `Lead Scout ${width}px`);
      const firstCheckout = page.locator('[data-lead-checkout]').first();
      await firstCheckout.focus();
      assert.equal(await firstCheckout.evaluate((link) => document.activeElement === link), true, `checkout should be keyboard focusable at ${width}px`);
      assertNoErrors(`Lead Scout ${width}px`, consoleErrors, pageErrors);
      await context.close();
    }
    console.log('✓ responsive and keyboard QA at 320, 390, 768 and 1440px');
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
