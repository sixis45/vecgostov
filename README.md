# Več gostov

Website for **Več gostov**: modern websites, Google Maps presence and direct inquiries for apartment and holiday-rental owners in Slovenia. A studio by [Matej Doljak](https://matejdoljak.com).

- Slovenian at `/`, English at `/en/`
- Three demo apartment sites (fictional properties) at `/primeri/…` and `/en/examples/…`
- Style tile at `/style-tile/`
- Static site, no framework. Hosted on Cloudflare Pages, deployed from `main`.

## Run it locally

Requires Node 20 or newer (`.nvmrc` pins 22).

```bash
npm install
npm run dev        # builds, serves http://localhost:4321, rebuilds when you save
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Build + local server + rebuild on every change in `content/` or `src/` |
| `npm run build` | Build the site into `dist/` (this is what Cloudflare runs) |
| `npm run preview` | Build, then serve `dist/` with Cloudflare's rules (`_headers`, `_redirects`, 404) |
| `npm run check` | Build, then check links, anchors, headings, alt text and the CSP |
| `npm run images` | Re-process photos after you add or change one (see below) |

## Change text, prices, contact details or photos

Everything lives in **one file: [`content/site.json`](content/site.json)**. The step-by-step guide is in **[docs/EDITING.md](docs/EDITING.md)**.

Quick version:

- **Contact:** `contact.email`, `contact.phone`, `contact.whatsapp`
- **Prices:** `prices.start`, `prices.plus`, `prices.complete`, `prices.care`
- **Copy:** `i18n.sl.*` (Slovenian) and `i18n.en.*` (English), one block per language
- **Brand name:** `BRAND_NAME`

Until a placeholder (`€XXX`, `example.com`, `00 000 000`) is replaced, the page shows it with a dashed outline and a "Začasno / Placeholder" tag, and every build lists what is still missing. A contact detail that is still a placeholder is shown as plain text, not a link, and the package buttons scroll to the contact section instead of opening e-mail; real `mailto:`, `tel:` and WhatsApp links appear as soon as the real value is in.

## Photos

Source photos live in `photos/` (`photos/stock/` for the two Unsplash photos, `photos/placeholders/` for the illustrated stand-ins). To swap one:

1. Put the new photo in `photos/` (large camera originals go in `photos/originals/`, which git ignores).
2. Point the image's `src` in `content/site.json` to it and set `"placeholder": false`.
3. Run `npm run images`, then commit `src/assets/img/`.

The build never processes photos itself, so Cloudflare builds stay fast.

## Deploy

GitHub → Cloudflare Pages Git integration: every push to `main` goes live, and every other branch gets a preview URL. Exact dashboard steps, the manual `wrangler` fallback and the custom-domain guide: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

Cloudflare settings in short: build command `npm run build`, output directory `dist`, production branch `main`.

## Project layout

```
content/site.json        all copy, contact details, prices, FAQ, demos, image list
src/templates/           page templates (home, demo, 404, style tile, shared parts)
src/styles/tokens.css    colours, type, spacing (shared by the site and the style tile)
src/styles/*.css         base, home, demo, 404/style tile
src/scripts/site.js      the only script: menu, reveal, parallax, calculator
src/static/              _headers, _redirects, favicons (copied into dist/)
src/assets/              fonts, optimized images (+ manifest), social images
photos/                  source photos (input for npm run images)
scripts/                 build, dev server, image and font tools, checks
docs/                    editing guide, deploy guide, production note
```

## More

- [docs/PRODUCTION.md](docs/PRODUCTION.md): design direction, what is still a placeholder, image licences, verification results and measurements.
