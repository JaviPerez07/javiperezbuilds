/* Invariantes de la reestructuración comercial (estático, sin navegador).
   Verifica: trading retirado + redirigido a Quant Forensics, pack SEO a 9,49€ como
   producto único, Lead Scout intacto, terminología sin "skills" visible. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => readFileSync(path.join(root, p), 'utf8');

const redirects = read('_redirects');
const sitemap = read('sitemap.xml');
const tradingStub = read('agentes/trading.html');
const agentes = read('agentes.html');
const web = read('agentes/web.html');
const storeConfig = read('scripts/agent-store-config.js');
const QUANT = 'quantforensicsfx.com';
const SEO_LINK = 'https://buy.stripe.com/00w14n6zFaDEgQTfNd9fW0J';
const LEAD_LINK = 'https://buy.stripe.com/fZu7sLf6bbHIasv7gH9fW0I';

function group(name, fn) { fn(); console.log(`✓ ${name}`); }

// 1 · Redirects de trading → Quant Forensics, sin cadenas
group('trading redirige 301 a Quant Forensics (sin cadena)', () => {
  const rules = redirects.split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => l.trim().split(/\s+/)); // [source, destination, code]
  for (const src of ['/agentes/trading', '/agentes/trading.html', '/skills/poligrafo', '/skills/quant-forensics']) {
    const rule = rules.find((r) => r[0].endsWith(src));
    assert(rule, `falta regla de redirección para ${src}`);
    const [, dest, code] = rule;
    assert(dest.includes(QUANT), `${src} debe redirigir a ${QUANT} (actual: ${dest})`);
    assert(code === '301' || code === '301!', `${src} debe ser 301`);
    // sin cadena: el destino es Quant, no una ruta interna de trading
    assert(!/javiperezbuilds\.com\/agentes\/trading/.test(dest), `${src} no debe encadenar por /agentes/trading`);
  }
});

// 2 · Sitemap sin trading
group('sitemap no lista /agentes/trading', () => {
  assert(!sitemap.includes('/agentes/trading'), 'sitemap no debe contener /agentes/trading');
  assert(sitemap.includes('/agentes/web'), 'sitemap debe conservar /agentes/web');
});

// 3 · Stub de trading: redirige a Quant, sin precios ni checkout
group('agentes/trading.html es stub de redirección sin precios', () => {
  assert(tradingStub.includes(`https://${QUANT}`), 'stub debe apuntar a Quant Forensics');
  assert(/http-equiv=["']refresh["']/i.test(tradingStub), 'stub debe tener meta refresh');
  assert(tradingStub.includes(`rel="canonical" href="https://${QUANT}/"`), 'canonical a Quant');
  for (const bad of ['buy.stripe.com', '99€', '39,99', '12,99']) {
    assert(!tradingStub.includes(bad), `stub no debe contener "${bad}"`);
  }
});

// 4 · Catálogo sin trading; puntero a Quant
group('agentes.html sin trading en nav/footer, con puntero a Quant', () => {
  const nav = agentes.match(/<nav class="sk-nav-links"[\s\S]*?<\/nav>/)[0];
  assert(!/>\s*Trading\s*</i.test(nav), 'nav no debe tener enlace Trading');
  assert(!agentes.includes('href="agentes/trading.html"'), 'sin enlaces a la página de trading');
  assert(!agentes.includes('id="qf-term"') && !agentes.includes("getElementById('qf-term')"), 'terminal de trading eliminada');
  assert(agentes.includes(`https://${QUANT}/?from=jpb`), 'debe existir puntero a Quant Forensics');
  assert(agentes.includes('data-track="trading_redirect_to_quant"'), 'evento trading_redirect_to_quant presente');
  assert(!agentes.includes('poligrafo.webp') && !agentes.includes('testi-poligrafo'), 'sin testimonios de trading');
});

// 5 · Pack SEO = producto único 9,49€, sin compra individual, sin anclas
group('pack SEO a 9,49€, checkout único, sin sueltos ni anclas', () => {
  for (const bad of ['49,99', '12,99', '64,99', '142,89', '−65%']) {
    assert(!web.includes(bad), `web.html no debe contener precio viejo "${bad}"`);
  }
  assert(web.includes('9,49€'), 'web.html debe mostrar 9,49€');
  assert(web.includes('data-seo-checkout'), 'checkout SEO por fuente única');
  assert(web.split(SEO_LINK).length - 1 >= 2, 'el checkout del pack usa el Payment Link SEO');
  assert(!web.includes('00w00jcY3cLMasv8kL9fW0e'), 'el checkout individual de webblood debe eliminarse');
  const mainStrikes = (web.match(/<s>/g) || []).length;
  assert.equal(mainStrikes, 0, 'sin precios tachados <s> (anclas falsas)');
  assert(/"price":\s*"9\.49"/.test(web), 'JSON-LD Offer debe ser 9.49');
  assert(!/"price":\s*"49\.99"/.test(web) && !/"price":\s*"12\.99"/.test(web), 'JSON-LD sin ofertas viejas');
});

// 6 · Fuente única de verdad de precios en config
group('config: SEO 949¢ / 9,49€ y Lead Scout intacto a 3', () => {
  assert(/SEO_PACK_PRICE:\s*"9,49€"/.test(storeConfig), 'SEO_PACK_PRICE 9,49€');
  assert(/SEO_PACK_PRICE_CENTS:\s*949/.test(storeConfig), 'SEO_PACK_PRICE_CENTS 949');
  assert(storeConfig.includes(SEO_LINK), 'SEO checkout URL en config');
  assert(/LEAD_SCOUT_PRICE:\s*3\b/.test(storeConfig), 'Lead Scout sigue a 3');
  assert(storeConfig.includes(LEAD_LINK), 'Lead Scout checkout URL intacto');
});

// 7 · Terminología: sin "skills" en títulos visibles
group('sin "skills" en <title> de catálogo y pack SEO', () => {
  for (const [name, html] of [['agentes.html', agentes], ['web.html', web]]) {
    const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
    assert(!/skill/i.test(title), `${name}: <title> no debe contener "skill(s)": "${title}"`);
  }
});

console.log('\n✓ restructure invariants OK');
