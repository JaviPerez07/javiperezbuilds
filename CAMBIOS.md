# CAMBIOS — Iteración 5: enlaces de Stripe reales cableados

**Fecha:** 2026-06-11 · **Estado:** EN PRODUCCIÓN (push con OK de Javi)

- **27 enlaces de pago cableados** (buy.stripe.com verificados HTTP 200): bundle
  Polígrafo 99€, 3 packs quant 39,99€, 5 sueltas web y 14 sueltas quant a 12,99€.
- **Schema actualizado:** ofertas con enlace vivo pasan de PreOrder a InStock.
- **COMPLETADO en el segundo pase:** Pack Web Forense (…9fW0z) y
  /javiperez-regime (…9fW0y) cableados (5 botones más, verificados HTTP 200).
  **Cero placeholders data-stripe="PENDIENTE" en el sitio: los 32 botones de
  compra cobran.** Todas las ofertas del schema en InStock.

---

# CAMBIOS — Iteración 4: 40 ventas + límite 50 + comandos /javiperez-* + gemelos

**Fecha:** 2026-06-17 · **Estado:** build local, SIN commit ni deploy (esperando OK)

## Decisiones

1. **Prueba social hero (dato confirmado por ti: 40 ventas):** stat principal **"+40 traders y builders ya usan mis skills"** (count-up) + secundarias **20 skills** y **149 tests en verde**. Fuera "1er pack vendido en horas". i18n EN+ES (402/402).
2. **Urgencia con límite real en TODOS los pricing:** *"Precio fundador: solo las primeras 50 ventas. Después sube."* — aplicada en /skills (×3), web-forense (×2, incl. FAQ) y Polígrafo (×2, incl. hero). Cero "plazas/packs limitados". OG de /skills actualizado.
3. **Comandos de trading renombrados a /javiperez-\*** en `~/Documents/quant-forensics/` (MI versión de venta):
   - **Backup previo:** `quant-forensics-BACKUP-20260617-pre-rename/` (261 archivos, diff verificado). La versión distribuida antigua NO se ha tocado (vive en el canal del colaborador; además queda el backup pre-reorg del día 15).
   - **Qué cambió:** el `name:` del frontmatter de los 15 SKILL.md (la activación) + H1 de cada SKILL.md con el formato `# /javiperez-x (nombre-técnico)`. **Carpetas y rutas intactas** (el orquestador no se toca) → `run_all_regressions.sh`: **15/15 PASS, exit 0**.
   - **Mapeo completo:**
     | Técnico (carpeta) | Comando nuevo |
     |---|---|
     | curve-fit-detector | `/javiperez-curvefit` |
     | backtest-report-analyzer | `/javiperez-backtest` |
     | monte-carlo-robustness | `/javiperez-montecarlo` |
     | walk-forward-analyzer | `/javiperez-walkforward` |
     | optimization-analyzer | `/javiperez-optimizer` |
     | ea-logic-reconstructor | `/javiperez-ealogic` |
     | mql-auditor | `/javiperez-mqlaudit` |
     | lookahead-detector | `/javiperez-lookahead` |
     | mql-skeleton-generator | `/javiperez-mqlskeleton` |
     | tick-data-auditor | `/javiperez-tickdata` |
     | strategy-deconstructor | `/javiperez-deconstruct` |
     | portfolio-combiner | `/javiperez-portfolio` |
     | edge-decay-monitor | `/javiperez-edgedecay` |
     | regime-classifier | `/javiperez-regime` |
     | strategy-stress-tester | `/javiperez-stresstest` |
   - README raíz y `bienvenida-javiperez.html/pdf` actualizados con los comandos (PDF regenerado).
   - En la web, todos los comandos de trading visibles usan ya `/javiperez-*` (terminales, listas, "siguiente:"). **Los IDs de Stripe (`#stripe-qf-curve-fit-detector`…) NO cambian** — son identificadores de producto, no comandos.
   - ⚠️ **Detectado:** las skills de quant solo traen SKILL.md (Claude Code); **no hay variante Codex** (webblood sí la tiene). La web/FAQ dice "Claude Code y Codex" — decide: añadir AGENTS.md al producto o matizar la FAQ.
4. **/skills — dos bloques gemelos de igual jerarquía:** hero corto neutro (*"Un método: medir, demostrar, tratar."*) con 2 CTAs ancla → **#web** (mini-landing completa: dolor, terminal webblood animada, 5 skills con compra suelta, pricing pack vs sueltas + pago) y **#trading** (mini-landing gemela: "Tu backtest miente. El Polígrafo lo demuestra.", terminal /javiperez-curvefit animada, 3 packs resumidos, bundle 99€ con pago, link al detalle). Mismo peso visual (fondo alterno bg-elevated en trading). Anti-humo + FAQ + contacto + **CTA final dual** compartidos. **Eliminados:** sección "familias", flujo, ¿para quién? (viven en las páginas de detalle) y la banda sticky del pack web (con dos productos en página confundía; la jerarquía la lleva cada bloque).
5. **/links:** nuevo botón feature con glow **"⚡ Mis Skills — diagnóstico forense para Claude Code y Codex"** → /skills (bajo Telegram) + dos gemelos sutiles: **"🔧 Skills Web — encuentra y cobra"** → /skills#web y **"📊 El Polígrafo — tu backtest miente"** → /skills/poligrafo. Jerarquía: Telegram + Skills destacados; gemelos secondary. Noscript replicado. (El botón feature antiguo del Polígrafo queda sustituido por este sistema.)

**Placeholders Stripe:** 32 botones, mismos 25 IDs únicos (§11 del bloque anterior).
**Dogfooding** (informes en repo): home **72,1** · /skills **71,6** · /poligrafo **71,9** — mismos artefactos de localhost documentados (HTTPS/cabeceras → Cloudflare; checks de negocio-local en páginas de producto; Tailwind CDN home). El 90+ se verifica contra el dominio tras deploy.
**Cache:** todo a `?v=funnel4` · sitemap lastmod 2026-06-17.

---

# CAMBIOS — Iteración 3: eslogan multi-nicho + El Polígrafo + pirámide de precios

**Fecha:** 2026-06-16 · **Estado:** build local, SIN commit ni deploy (esperando OK)
**Nota:** la otra terminal había dejado a medias el punto 1 (H1/sub/stats solo en HTML, sin i18n y con el contador de tests a 0) — detectado y completado desde ahí.

## Decisiones de esta iteración

1. **Eslogan home:** *"Skills que encuentran lo que está roto. Y te dicen cómo cobrarlo."* (la versión que dejó la otra terminal, completada). Sub con "medir, demostrar, tratar" + webs/trading/lo próximo. i18n EN+ES sincronizado (400/400).
2. **Nombre del pack de trading: "El Polígrafo"** (opción 1 — sin colisiones: 0 apariciones previas del término en el sitio; encaja con la marca forense y el gancho "tu backtest miente... lo demuestra"). Tagline: *"El detector de mentiras de tu trading algorítmico"*. Los comandos de las skills NO se tocaron.
   - URL: `/skills/quant-forensics` → **`/skills/poligrafo`** con 301 en `_redirects` (2 reglas: con y sin .html). Canonical/OG/schema/sitemap/título actualizados. Todos los enlaces internos (home, /skills, web-forense, /links) apuntan a la nueva URL.
3. **Terminal del Polígrafo → hero** (lo primero que se ve), con urgencia honesta destacada debajo: *"Precio fundador activo. Sube al salir de lanzamiento."*
4. **Pirámide de precios en el Polígrafo:** banda bundle con glow ENCIMA de los packs ("Las 15 — 99€ · ahorra vs packs 119,97€ y sueltas 194,85€") + bloque bundle grande al final · botones de pack tamaño medio · compra suelta inline discreta por skill (15 pills de 12,99€ junto a cada línea; los desplegables anteriores eliminados).
5. **Precio fuera del hero del Polígrafo:** el hero vende dolor + demo; CTA "Quiero auditar el mío →" hace scroll a `#comprar`. El precio solo aparece en la sección de compra.
6. **Favicon definitivo derivado del wordmark:** tile `/j` renderizado con JetBrains Mono real (Chrome headless) → `favicon.svg` + PNG 32/180/192/512. El wordmark `/javiperez` sigue en todos los headers. El `/J` geométrico anterior queda en `assets/logo-propuestas/`.
7. **Prueba social del hero: OPCIÓN B** (la A — "+40 traders" — no es verificable por mí; la regla era confirmarla antes de usarla). Stats reales con count-up:
   - **20** skills construidas y vendiéndose (5 + 15 ✓)
   - **149** tests automáticos en verde — contados de los repos reales: 130 casos en quant-forensics (suma de PASS= de las 15 suites) + 19 de webblood. **"150+" habría sido inventar**; 149 es el número.
   - **1er** pack: vendido en horas con un solo vídeo (afirmación tuya del brief).
8. **/skills — "Elige tu camino":** dos cards de familia arriba (tras el hero): *Webs que convierten* (→ ancla al bloque web) y *Trading bajo El Polígrafo* (→ /skills/poligrafo), cada una con nicho, a quién sirve, comando de ejemplo y CTA con glow.
9. **Métodos de pago bajo los CTAs grandes:** fila de pills monocromas (Tarjeta con glifo SVG, Apple Pay, Google Pay, Klarna, Link, Amazon Pay) — bajo el bundle (×2 en Polígrafo), bajo el pricing final y CTA final de /skills, y bajo el pricing de web-forense. Sutiles a propósito (no compiten con el CTA).

**Placeholders Stripe:** 31 botones (los 25 productos de antes + el de la banda bundle nueva; mismo set de IDs — ver §11 abajo).

**Dogfooding (informes en repo: `informe-webblood-{home,skills,poligrafo}.md`):**
home **72,1** · /skills **74,7** · /poligrafo **71,9**. Los módulos <90 son los mismos artefactos documentados abajo (§10): HTTPS/cabeceras de localhost (los sirve Cloudflare en producción), checks de negocio-local no aplicables a páginas de producto, y Tailwind CDN en home (pendiente arquitectónico). Sin regresiones por el rename.

**Cache:** páginas tocadas bumpeadas a `?v=funnel3`.

---

# CAMBIOS — Superprompt: web-funnel completa + Quant Forensics premium

**Fecha:** 2026-06-15 · **Estado:** build local, SIN commit ni deploy (esperando OK)
**Para revisar:** `python3 -m http.server 8791` → `localhost:8791`, `/skills.html`, `/skills/web-forense.html`, `/skills/poligrafo.html`, `/legal.html`

---

## 1 · Home (index.html)

- **Hero "vender la pala":** H1 *"Encuentra lo que está roto en cualquier web. Cobra por arreglarlo."* (EN: *"Find what's broken in any website. Get paid to fix it."*). Sub con `/javiperez-webblood` como comando protagonista. Hook: "Skills vendidas como comandos: /javiperez-*".
- **Microcopy bajo la terminal:** *"El comando lleva mi nombre. El informe lleva tu venta."* (sustituye al caption de Almería).
- **CTAs:** "Ver las skills →" → /skills · "Trabajo por encargo →" → #services.
- **Almería eliminada en TODAS las apariciones** (hero, about, footer, schemas ×2, i18n EN+ES) → "España"/"Spain". La demo de web-forense usaba Almería como ciudad de un cliente ficticio → cambiada a Sevilla.
- **Foto:** `javi-perfil.jpg` confirmada en todas las posiciones (about + schemas; el hero ya no lleva foto, lleva terminal).
- **Servicios unificados "Trabajo por encargo":** UNA sección con AI Site Build (AdSense) + AI Site Deploy + las 3 cards locales compactadas (`service-card--mini`) + strip de prueba local (Leo Cano, nico66fx) + cierre con WhatsApp y email. **Claude Code Production Setup y AI Workflow Automation aparcados** en `<template id="parked-services">` dentro de la misma sección (reactivables moviéndolos de vuelta al grid). La sección local-business desapareció como sección propia.
- **Card Quant del home** → ahora apunta a `skills/quant-forensics.html` (interna), badge "Lanzamiento fundador".
- **Dopamina:** count-up en los números del hero (9/20), pulso sutil en CTAs primarios, animaciones on-scroll.
- Testimonios (Nico, Leo Cano) y prensa: **intactos**.

## 2 · Logo + favicon

- **Stitch:** proyecto creado, pero **6 generaciones fallaron por timeout** (ninguna pantalla llegó a registrarse en el servidor). Documentado; las 4 propuestas se diseñaron a mano siguiendo la dirección del brief.
- **4 propuestas en `assets/logo-propuestas/`** (+ `sheet-preview.html` para verlas juntas con preview a 32/16px):
  1. `/javiperez` wordmark (JetBrains Mono, barra naranja) ← **header**
  2. `JP` monograma geométrico
  3. `/J` slash-monograma ← **favicon**
  4. `javiperez_` con cursor de terminal
- **Elegida: sistema dual 1+3** — el wordmark `/javiperez` en el header de todas las páginas (la barra de comando ES la identidad y a tamaño header se lee perfecto) y el monograma `/J` como favicon (a 16px un wordmark es ilegible; el `/J` geométrico se lee incluso a 16px y es coherente con la terminal).
- Generados: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`. Manifest sin cambios de rutas.

## 3 · /skills — funnel agresivo (reescrita)

- **Pricing nuevo (ancla matemática real):** suelta 12,99€ · 5 sueltas = 64,95€ · pack 39,99€ → **ahorro 38,4%** (matemática verificable, cero "valorado en").
- **Sin mensualidad** (eliminada).
- Estructura AIDA: (1) hero dolor *"Cada web local rota es un cliente que no sabes cerrar. Todavía."* → (2) **terminal animada** (webblood con count-up de score) → (3) 5 cards con CTA de compra suelta + card-push del pack + **banda sticky inferior** con el ahorro 38% (se oculta al llegar al pricing final para no duplicar CTAs) → (4) flujo diagnosticar→tratar→demostrar → (5) ¿para quién? (agencia/vendes webs/negocio) → (6) bloque anti-humo → (7) pricing final pack vs sueltas → (8) FAQ + CTA final.
- CTAs repetidos tras demo, skills, flujo y al final.
- FAQ en lenguaje llano + mención del **PDF de instalación** (×2). El PDF del pack web NO se ha generado (como pediste).
- Card Quant → `skills/quant-forensics.html`.

## 4 · /skills/web-forense (actualizada)

- Pricing al modelo nuevo (sueltas 12,99 / pack 39,99, ancla 64,95), schema Product actualizado, FAQ sin mensualidad + PDF, footer → quant interna, strip de contacto pre-venta.

## 5 · /skills/quant-forensics (NUEVA)

- Hero *"Tu backtest miente. Estas 15 skills descubren dónde."* + ángulo no negociable (educativo, nunca señales) en hero, "Qué NO es", FAQ y schema.
- **Terminal animada propia:** curve-fit-detector con PBO 0,64 / Deflated Sharpe 0,31 / sensibilidad — veredicto "CURVE-FITTING PROBABLE".
- **3 packs** con su pregunta de dolor, 5 skills en 1 línea, pack 39,99€ + desplegable de compra suelta por skill (12,99€).
- **Bundle héroe: 99€** — ancla real: packs por separado 119,97€ · sueltas 194,85€.
- "Qué incluye esta versión" (diferenciación honesta): 3 packs por caso de uso + PDF paso a paso + actualizaciones. Solo lo que es verdad.
- **Cero menciones al otro canal ni a su precio** — verificado con grep en todo el sitio (0 resultados para quantforensicsfx / 9,49).
- /links: el botón Quant ahora apunta aquí (sublabel "Bundle fundador 99€ · 3 packs").

## 6 · Carpeta ~/Documents/quant-forensics (7A)

- **Backup completo:** `~/Documents/quant-forensics-BACKUP-20260615/` (258 archivos, verificado con diff).
- **División en 3 packs validada tras leer los 15 SKILL.md** (sin cambios sobre la propuesta — coherente por caso de uso):
  - `pack-backtest-forense/` (¿tu backtest dice la verdad?): curve-fit-detector, backtest-report-analyzer, monte-carlo-robustness, walk-forward-analyzer, optimization-analyzer
  - `pack-codigo-ea/` (¿qué hace de verdad tu robot?): ea-logic-reconstructor, mql-auditor, lookahead-detector, mql-skeleton-generator, tick-data-auditor — *nota: ea-logic-reconstructor trabaja desde el historial, no el código, pero responde la misma pregunta del pack; tick-data-auditor audita el insumo del EA*
  - `pack-riesgo-real/` (¿sobrevivirá en real?): strategy-deconstructor, portfolio-combiner, edge-decay-monitor, regime-classifier, strategy-stress-tester
- Skills NO modificadas por dentro. `run_all_regressions.sh` actualizado a las rutas nuevas → **las 15 pasan, exit 0**.
- **`bienvenida-javiperez.html` + `.pdf` (NUEVOS):** sin upsell del colaborador, sin "5 skills extra", sin sus links de Stripe. Contiene: bienvenida + índice de los 3 packs (1 línea por skill) + instalación paso a paso (refleja las 3 subcarpetas) + recomendación de modelo + disclaimer + soporte mío (email/Telegram/web). **`bienvenida.html`/`.pdf` originales intactos.** Al empaquetar el zip de MI canal: incluir `bienvenida-javiperez.pdf` y EXCLUIR `bienvenida.{html,pdf}` del colaborador.
- README raíz: estructura de 3 packs, comando de instalación actualizado, soporte → mi canal.

## 7 · Legal (nuevo, necesario para Stripe)

- `legal.html`: aviso legal + privacidad RGPD + cookies + **política de reembolso 14 días** + descargo de trading. Enlazada desde todos los footers.
- ⚠️ **[PENDIENTE] NIF y domicilio fiscal** marcados como placeholder visible — complétalos antes de activar pagos.

## 8 · Dopamina global

- `scripts/animations.js` (NUEVO, ~3KB): reveals on-scroll `[data-reveal]`, count-up `.count-up[data-count]`, lógica de la banda sticky. `scripts/terminal.js` (~5KB) + terminal inline de quant (~2KB). **Presupuesto JS de animación total ≈ 10KB** (límite: 25KB). Todo transform/opacity, IntersectionObserver, `prefers-reduced-motion` → estático.
- Glow naranja en hovers (cards, botones), pulso sutil en CTAs primarios.

## 9 · SEO

- Titles/meta/OG/Twitter únicos por página, og:locale es_ES en las páginas de venta, canonicals limpios.
- **Product schema** con offers reales: /skills (pack 39,99 + 5 sueltas 12,99) · /skills/web-forense (pack + suelta) · /skills/quant-forensics (bundle 99 + 3 packs 39,99 + suelta 12,99). FAQPage en las tres.
- sitemap.xml: + /skills/quant-forensics, lastmod 2026-06-15.

## 10 · DOGFOODING (webblood real, los 3 informes en el repo)

`informe-webblood-{home,skills,quant}.md` — ejecutados contra el build local (localhost, --no-psi).

| Página | Score | seo | rend | móvil | conv | conf | a11y | salud | cont |
|---|---|---|---|---|---|---|---|---|---|
| home | **72,1** | 89 | 61 | 100 | 83 | 19 | 100 | 50 | 75 |
| /skills | **74,7** | 81 | 90 | 100 | 62 | 31 | 100 | 50 | 88 |
| /quant | **74,5** | 81 | 90 | 100 | 71 | 19 | 100 | 50 | 88 |

**Arreglado en esta pasada** (la regla "<90 → arregla"): contacto pre-venta en las 3 páginas de venta (conv 21→62 y 29→71), legal.html enlazada (conf +12), title/meta de quant recortados (seo 69→81), tel: en home.

**Módulos <90 restantes — desglose honesto:**
- **confianza/salud_tecnica:** dominados por "Sin HTTPS" + "sin HSTS/cabeceras" — **artefactos de localhost**. En producción Cloudflare sirve HTTPS forzado (`_redirects` 301!) y todas las cabeceras (`_headers`: HSTS, XFO, XCTO, Referrer-Policy). Verificable post-deploy re-corriendo webblood contra el dominio.
- **conversion (62/71 en ventas):** los checks restantes son de negocio-local (tel: pulsable, formulario, CTA "reservar cita") — en una página de producto digital el canal correcto es WhatsApp/email/Telegram, que ya están. No aplico tel: en páginas de venta a propósito.
- **seo_local 81-89:** "Sin schema LocalBusiness" — correcto NO ponerlo: son páginas de producto (Product schema) y marca personal (Person/ProfessionalService), no fichas de negocio local.
- **rendimiento home 61:** Tailwind CDN bloqueante (migración a CSS compilado = pendiente arquitectónico ya acordado) + 4 JPG contados que en realidad se sirven como WebP vía `<picture>` (el detector cuenta el fallback).
- **confianza "reseñas sin schema":** deliberado — el schema de auto-reseñas viola las directrices de Google (lo eliminamos en junio tras los errores de Search Console).

## 11 · PLACEHOLDERS STRIPE (30 botones, 25 productos únicos) — para crear los links

**Pack Web (6):** `#stripe-pack-web` (39,99€) · `#stripe-skill-webblood` · `#stripe-skill-seolocal` · `#stripe-skill-speed` · `#stripe-skill-businessdna` · `#stripe-skill-reviews` (12,99€ c/u)

**Quant (19):** `#stripe-qf-bundle` (99€) · `#stripe-qf-pack-backtest` · `#stripe-qf-pack-codigo` · `#stripe-qf-pack-riesgo` (39,99€ c/u) · y 15 sueltas a 12,99€: `#stripe-qf-curve-fit-detector`, `#stripe-qf-backtest-report-analyzer`, `#stripe-qf-monte-carlo-robustness`, `#stripe-qf-walk-forward-analyzer`, `#stripe-qf-optimization-analyzer`, `#stripe-qf-ea-logic-reconstructor`, `#stripe-qf-mql-auditor`, `#stripe-qf-lookahead-detector`, `#stripe-qf-mql-skeleton-generator`, `#stripe-qf-tick-data-auditor`, `#stripe-qf-strategy-deconstructor`, `#stripe-qf-portfolio-combiner`, `#stripe-qf-edge-decay-monitor`, `#stripe-qf-regime-classifier`, `#stripe-qf-strategy-stress-tester`

Todos con `data-stripe="PENDIENTE"` — buscar y reemplazar el href cuando tengas los payment links.

## 12 · Pendientes

1. **Stripe:** crear los 25 productos/links y sustituir placeholders.
2. **legal.html:** completar NIF + domicilio fiscal.
3. **og-image:** sigue siendo el composite antiguo ("burning money") — regenerar con el claim nuevo.
4. **PDF del pack web** (instalación con capturas): hacer al cerrar el pack. El de Quant ya existe (`bienvenida-javiperez.pdf`).
5. **Tailwind CDN → CSS compilado** (home): pendiente arquitectónico, mejora rendimiento.
6. **Empaquetado del zip de Quant para mi canal:** incluir bienvenida-javiperez.pdf, excluir la bienvenida del colaborador.
7. Verificación visual fina en navegador real (el preview integrado sigue caído) — el build está validado por HTML/CSS/JS/schema/curl, no a píxel.
