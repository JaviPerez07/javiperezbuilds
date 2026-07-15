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
const stylesheet = await readFile(path.join(root, 'styles/operator-atelier.css'), 'utf8');

const server = http.createServer(async (request, response) => {
  try {
    const requestPath = new URL(request.url, 'http://127.0.0.1').pathname;
    const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(root, relativePath);
    assert(filePath.startsWith(`${root}${path.sep}`) || filePath === path.join(root, 'index.html'));
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

async function verifyPage(name, options = {}) {
  const context = await browser.newContext({
    javaScriptEnabled: options.javaScriptEnabled !== false,
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    viewport: options.viewport || { width: 1440, height: 1000 }
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  if (options.breakIntersectionObserver) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'IntersectionObserver', {
        configurable: true,
        value: function BrokenIntersectionObserver() {
          throw new Error('forced observer initialization failure');
        }
      });
    });
  }

  if (options.staleRevealCss) {
    await page.route('**/styles/operator-atelier.css*', (route) => route.fulfill({
      status: 200,
      contentType: 'text/css; charset=utf-8',
      body: `${stylesheet}\n[data-oa-reveal]{opacity:0;transform:translateY(24px)}`
    }));
  }

  const response = await page.goto(baseURL, { waitUntil: 'load' });
  assert.equal(response.status(), 200, `${name}: home should respond 200`);

  const h1 = page.locator('h1');
  const cta = page.locator('.oa-hero .oa-btn--primary');
  const panel = page.locator('[data-oa-signal]');
  await Promise.all([
    assertVisible(h1, `${name}: H1`),
    assertVisible(cta, `${name}: audit CTA`),
    assertVisible(panel, `${name}: signal panel`)
  ]);

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight
  }));
  assert.equal(layout.scrollWidth, layout.clientWidth, `${name}: horizontal overflow`);
  assert(layout.scrollHeight > 1000, `${name}: full page content should be present`);
  assert.deepEqual(consoleErrors, [], `${name}: console errors`);
  assert.deepEqual(pageErrors, [], `${name}: unhandled page errors`);

  await context.close();
  console.log(`✓ ${name}`);
}

async function assertVisible(locator, label) {
  assert.equal(await locator.count(), 1, `${label} should exist once`);
  assert.equal(await locator.isVisible(), true, `${label} should be visible`);
  const styles = await locator.evaluate((element) => {
    const computed = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { opacity: Number(computed.opacity), visibility: computed.visibility, width: rect.width, height: rect.height };
  });
  assert(styles.opacity > 0.9, `${label} should not be transparent`);
  assert.equal(styles.visibility, 'visible', `${label} visibility`);
  assert(styles.width > 0 && styles.height > 0, `${label} should have dimensions`);
}

try {
  await verifyPage('desktop');
  await verifyPage('mobile 390px', { viewport: { width: 390, height: 844 } });
  await verifyPage('reduced motion', { reducedMotion: true });
  await verifyPage('motion initialization failure', { breakIntersectionObserver: true });
  await verifyPage('JavaScript disabled desktop', { javaScriptEnabled: false });
  await verifyPage('JavaScript disabled mobile', { javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await verifyPage('cached stylesheet with JavaScript disabled', { javaScriptEnabled: false, staleRevealCss: true });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
