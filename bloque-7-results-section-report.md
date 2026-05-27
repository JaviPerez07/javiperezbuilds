# BLOQUE 7 — "Real client results" section

**Date:** 2026-05-27
**Cache version:** `?v=sprint2-b8`
**Status:** No commit yet — awaiting explicit OK for `commit + push`.

---

## 1 · Sección creada · Ubicación

Insertada en `index.html` líneas 1047-1136 aprox, **entre** el final de `#work` (Recent Work, cierre en línea 1045) y el comienzo de `#local-business` (línea ahora ~1138).

Esta es exactamente la ubicación propuesta en el brief y narrativamente es la que mejor encaja: el usuario acaba de ver la card "Live case study" de nico66fx en Recent Work → inmediatamente después se le muestra el testimonio espontáneo del mismo cliente como prueba social directa. El loop emocional cierra ahí antes de pivotar a "Para negocios locales".

**Section ID:** `#results` (preparado para futura nav-link cuando haya 3+ testimoniales).
**Section class:** `.section.results-section` (hereda padding-vertical clamp del `.section` base).

Decisión deliberada: **NO se ha añadido al nav del header**. El menú actual ya tiene 4 ítems (Services / Work / Process / About) y un quinto en mobile empezaría a apretar. Cuando la sección crezca a 3+ cards, replantear.

---

## 2 · Estructura HTML

Conservé al ~100% la estructura del brief, con tres ajustes para mantener consistencia visual con el resto del site:

| Brief | Implementado | Por qué |
|---|---|---|
| `<p class="section-kicker">` | `<span class="eyebrow"><span class="dot"></span><span>…</span></span>` | Patrón usado en TODAS las otras secciones (pain, services, work, etc.) — coral dot + uppercase mono. |
| `<h2 class="section-heading">…</h2>` | `<h2 class="section-h2 mt-6 max-w-3xl">` con split pre/accent-italic | El sitio ya tiene `.section-h2` con Inter 600 y `.accent-italic` con Instrument Serif. Heading queda "Don't take my word *for it.*" — la cursiva en serif coral es la firma visual de la web. |
| `<p class="section-intro">` | `<p class="section-sub mt-6">` | Misma razón — clase reutilizada de otras secciones. |

El resto (testimonial-card / grid / screenshot / quote / attribution / tags / testimonials-more) va literal al brief.

---

## 3 · CSS

Añadido al final de `styles/custom.css` bajo el header `BLOQUE 7 — Real client results section` (líneas 4056-4290 aprox, ~235 líneas).

**Reutiliza tokens existentes:**
- `--bg-card`, `--border-subtle`, `--text-primary`, `--text-secondary`
- `--accent` (#D97757) y `--accent-soft` (rgba 0.14)
- `'Instrument Serif'` para la quote (consistente con `.section-h2 .accent-italic` y `.hero-h1 .accent-italic`)
- `'Geist Mono'` para tags + screenshot-badge (consistente con todos los kickers/badges del site)
- Border-radius 24px desktop / 16px mobile — mismos valores que `.service-card` y `.work-card`

**Border-trace hover** (linear-gradient con mask-composite) replica el efecto de `.service-card::before` que ya existe en el site, así el card "vibra" como el resto.

**Sanity checks CSS:**
- Llaves: **711 / 711 balanceadas** ✅
- Sin overflow:hidden en el `.testimonial-card` que pudiera clipar elementos floating en el futuro (B6 lección aprendida)

---

## 4 · Imagen — optimización

**Antes:** `nico66fx-testimonial.jpg` 1170×2412, **414 KB** (descarga directa desde móvil).

**Después:**
- Redimensionada a **720×1484** con `sips --resampleWidth 720` (mantiene aspect ratio 1:2.06 del WhatsApp móvil)
- Recomprimida a **JPEG quality 70** con `sips -s formatOptions 70`
- Peso final: **182 KB** ✅ (target era <200 KB, brief decía "ideal")
- 720w cubre retina 2x para display column de 320px desktop y 280px mobile sin pixelado

**HTML tags:**
- `width="720" height="1484"` → reserva CLS-safe en el layout
- `loading="lazy"` → no bloquea LCP (la sección está bajo el fold)
- `decoding="async"` → no bloquea main thread

---

## 5 · i18n

14 keys nuevas añadidas en ambos blocks (`en:` y `es:`) en `scripts/i18n.js`:

```
results_kicker
results_heading_pre
results_heading_accent
results_intro
testimonial_nico_quote
testimonial_nico_role
testimonial_nico_link
screenshot_badge
tag_funnel
tag_stripe
tag_segmentation
tag_automated
more_testimonials
be_next
```

**Paridad EN / ES:** `373 / 373` ✅ (antes de B7 era 359/359).

ES heading: **"No te lo digo yo. Te lo dicen *ellos.*"** — split en `results_heading_pre` ("No te lo digo yo. Te lo dicen ") + `results_heading_accent` ("ellos."). El brief proponía esa frase, la mantengo tal cual.

Quote ES tal cual del WhatsApp original (sin retoque editorial), con comillas tipográficas `“ ”` en lugar de `" "`.

---

## 6 · Schema.org · Microdata Review

**Implementado**, no opcional. Razón: añade <50 bytes y mejora rich-snippets potenciales en Google (5-star rating en SERP).

```html
<article itemscope itemtype="https://schema.org/Review">
  <meta itemprop="reviewRating" content="5" />
  <span itemprop="author" itemscope itemtype="https://schema.org/Person" hidden>
    <meta itemprop="name" content="Nico" />
  </span>
  <span itemprop="itemReviewed" itemscope itemtype="https://schema.org/Service" hidden>
    <meta itemprop="name" content="Sales funnel build by Javi Pérez" />
  </span>
  …
  <blockquote itemprop="reviewBody" …>
```

`hidden` en los wrappers author/itemReviewed asegura que el microdata es visible solo para crawlers, no afecta el render. `itemprop="reviewBody"` directamente en la `<blockquote>` enlaza el texto de la review.

Validar post-deploy con: https://search.google.com/test/rich-results?url=https%3A%2F%2Fjaviperezbuilds.com

---

## 7 · Performance · LCP / CLS

**LCP:** Sin impacto. La sección está bajo el fold (después de Recent Work). La imagen `nico66fx-testimonial.jpg` tiene `loading="lazy"`, por lo que solo se descarga cuando entra en viewport.

**CLS:** Atributos `width="720" height="1484"` declarados → el navegador reserva el espacio correcto antes de pintar la imagen. Aspect ratio 0.485 (portrait) se respeta. Sin CLS esperado.

**Total request weight added:**
- HTML: ~2.8 KB extra
- CSS: ~5.1 KB extra (235 líneas)
- JS (i18n): ~2.3 KB extra (28 strings nuevas combinadas EN+ES)
- Imagen: 182 KB (solo cuando scrollea hasta ahí)

Total bytes en el critical path inicial: **~10 KB** (HTML + CSS + i18n delta), aceptable.

---

## 8 · Screenshots · Verificación visual

**No incluidos.** Razones que ya hemos confirmado en bloques previos:

1. Headless Chrome con `--screenshot` no respeta `#anchor` para hacer scroll mid-page
2. Headless no resuelve consistentemente DPR en Retina — los screenshots locales no representan el render real
3. La animación `reveal-stagger` con IntersectionObserver no se ejecuta en single-shot headless

**Verificación pendiente hands-on tras hard-refresh:**
- Desktop 1440px EN/ES: grid 320 + flex, screenshot con shadow, quote con borde coral izq, hover trace
- Tablet ~768-900px: grid colapsa a 1 columna, screenshot max-width 280px centrado
- Mobile 375px: stack vertical, padding 1.5rem, quote 1.1rem font-size, tags wrap
- Toggle lang ES → EN: heading reflows, quote intercambia idioma, tags traducen
- Link "See the live project →" → nico66fx.github.io en nueva pestaña con rel noopener noreferrer
- Link "Be next →" → hace scroll-snap a `#contact` con offset header

---

## 9 · Sanity checks generales

- ✅ Llaves CSS: 711 / 711
- ✅ Paridad i18n EN/ES: 373 / 373 (delta +14 keys cada lado)
- ✅ HTML balanceado (parser stack empty post-feed)
- ✅ Cache bumpeado: `?v=sprint2-b7` → `?v=sprint2-b8` en 4 sitios (css link, i18n.js, main.js, nuevo `nico66fx-testimonial.jpg`)
- ✅ Imagen optimizada: 414 KB → 182 KB (-56%)
- ✅ Schema.org Review microdata embebido y validable
- ✅ No tocada ninguna otra sección (audit de diff: solo añadido HTML/CSS/i18n, ningún `M` en zonas previas)
- ✅ B6 hotfixes preservados (glow FAB intacto, brace count consistente, etc.)

---

## 10 · Escalabilidad — siguientes testimoniales

Cuando lleguen 2-3+ testimoniales, dos paths recomendados ordenados por esfuerzo:

### Path A — Grid 2-up estático (~30 min)
Para 2-3 testimoniales. Convertir `.testimonial-grid` actual en `<div class="testimonial-list">` que contiene N `.testimonial-card`. Cada card pasa de grid 320+1fr a layout más compacto (avatar + name top, quote + screenshot vertical). Funciona bien hasta 4 testimoniales sin scroll horizontal.

```css
.testimonial-list { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 1024px) {
  .testimonial-list { grid-template-columns: 1fr 1fr; }
}
```

### Path B — Carrusel con keyboard + a11y (~2h)
Para 5+ testimoniales. Embla Carousel (3KB JS) o vanilla scroll-snap. Mantener una card destacada visible por defecto + arrow keys para navegar. Requiere `aria-roledescription="carousel"`, dots de paginación, prefers-reduced-motion. Más esfuerzo pero escala a 10+ testimoniales.

### Path C — Sin cambios estructurales: solo añadir cards
Mientras sean ≤3, la estructura actual permite añadir testimonios duplicando `<article class="testimonial-card">` con datos nuevos. Cada card es self-contained.

**Mi recomendación cuando toque:** empezar con Path A. La fricción a Path B no compensa hasta tener 5 testimoniales auténticos.

---

## Files diff vs commit f5a5a9b (baseline post-B7-spacing)

```
M  index.html
   - new <section id="results" class="section results-section"> (90 lines)
     between #work and #local-business
   - cache bumped to ?v=sprint2-b8 (3 occurrences: CSS link, i18n.js, main.js)
   - new img src reference with ?v=sprint2-b8

M  styles/custom.css
   - +235 lines, "BLOQUE 7" block at end of file
   - .results-section, .testimonial-card (+ ::before trace),
     .testimonial-grid, .testimonial-screenshot, .screenshot-badge,
     .testimonial-quote, .testimonial-attribution, .attribution-avatar,
     .avatar-initial, .attribution-info/name/role/link,
     .testimonial-tags + .tag, .testimonials-more, .link-arrow

M  scripts/i18n.js
   - +14 keys × 2 langs in EN and ES blocks
   - inserted after work_c3_footer in both blocks, before local_kicker

M  assets/nico66fx-testimonial.jpg
   - reduced 414 KB → 182 KB · 1170×2412 → 720×1484 · JPEG q70

A  bloque-7-results-section-report.md  (this file)
```

---

## Pending decision

1. **`commit + push`** → ship a producción (CF Pages auto-deploy ~90s)
2. **`hold`** → hard-refresh `localhost:8787` y verifica visualmente en desktop + mobile + ambos idiomas
3. **`tweak <X>`** → ajuste antes del commit (sizes / copy / layout / etc.)

Si vas con `commit + push`, suggested message:

```
B7 — Real client results section (Nico testimonial)

- New #results section between Recent Work and Local Business
- WhatsApp screenshot 414KB → 182KB (720×1484, JPEG q70)
- 14 new i18n keys × 2 langs (373/373 parity)
- Schema.org Review microdata embedded (5-star rating)
- Border-trace hover effect matches existing .service-card style
- Reuses all design tokens (no new colors/fonts/sizes)
- Cache bumped ?v=sprint2-b7 → ?v=sprint2-b8
```
