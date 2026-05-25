# javiperezbuilds.com

Personal B2B landing for **Javi Pérez** — builder of production AI systems.
Single-page, static, no build step.

## Stack

- **HTML5** · single `index.html`
- **Tailwind CSS** via CDN (no build pipeline)
- **Vanilla JS** for interactions (no framework)
- **Lenis 1.1.13** via CDN for smooth scroll
- **Inter / Instrument Serif / Geist Mono** via Google Fonts

## File tree (production)

```
.
├── index.html
├── _headers              # Cloudflare Pages: security + cache headers
├── _redirects            # Cloudflare Pages: http→https + www→root (301!)
├── robots.txt
├── sitemap.xml
├── README.md
├── assets/
│   ├── favicon.svg
│   ├── javi-portrait.jpg
│   └── og-image.jpg
├── styles/
│   └── custom.css
└── scripts/
    ├── main.js
    └── build-og.py       # offline tool — only run when portrait or OG copy changes
```

`serve.py` and `.claude/` are local-dev only and are git-ignored.

## Lighthouse scores (last run, both form factors)

| Category | Score |
|---|---|
| Performance | 93 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Core Web Vitals: LCP 2.7s · CLS 0.002 · TBT 0 ms.

## Local development

The site is fully static. Any static server works.

```bash
# Python (no deps)
python3 -m http.server 8787
# → http://localhost:8787/
```

Or with the included helper (avoids cwd issues in sandboxed shells):

```bash
python3 serve.py
```

## Regenerating the OG image

Only needed if the portrait or hero copy changes:

```bash
python3 scripts/build-og.py
# → writes assets/og-image.jpg (1200×630, ~73 KB)
```

Requires Pillow (`pip install Pillow`).

## Deploying to Cloudflare Pages

1. Push this repo to GitHub (`gh repo create javiperezguides-landing --public --source=. --remote=origin`).
2. In Cloudflare Pages dashboard → **Create a project** → **Connect to Git** → select this repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Add custom domain `javiperezbuilds.com` in **Custom domains** tab.
5. Cloudflare Pages auto-detects `_headers` and `_redirects` — no extra config needed.

The 301! force-redirect rules in `_redirects` collapse:
- `http://javiperezbuilds.com/*` → `https://javiperezbuilds.com/`
- `http://www.javiperezbuilds.com/*` → `https://javiperezbuilds.com/`
- `https://www.javiperezbuilds.com/*` → `https://javiperezbuilds.com/`

## Editing content

- **Hero / services / work / process / about** copy → `index.html` (single source of truth)
- **Animations & micro-interactions** → `scripts/main.js`
- **Design tokens (colors, fonts, spacing)** → `styles/custom.css` (`:root` block)

Do not extract Tailwind utility classes into the stylesheet — the project relies on
the CDN compiler to handle them at load time.

## Contact

javiperezguides@gmail.com
