# Production note

Built 22 September 2026. Since 23 September 2026 the Cloudflare Pages project `vecgostov` is connected to this repository (Git integration): every push to `main` publishes to https://vecgostov.pages.dev, and every other branch gets a preview URL (see [DEPLOY.md](DEPLOY.md)). Custom domain: **https://vecgostov.com** (bought at Cloudflare; `vecgostov.com` and `www.vecgostov.com` are CNAMEs to `vecgostov.pages.dev`, proxied).

## Design direction

**Idea: the postcard.** Holidays are remembered in postcards, and a postcard is also the most direct message a guest can send a host. The whole site uses that one motif and nothing else decorative:

- **Hero:** a full-width photo of a sunlit apartment with a paper postcard lying on it. The headline and the main button are the "message"; the three benefits sit on the address lines; a perforated stamp and a postmark sit in the corner. A second postcard (Lake Bled, "Pozdrav iz Alp") tilts slightly in 3D with the mouse.
- **Stamps** carry every icon (services, calculator), with the same perforated edge.
- **Examples:** each demo is shown as a live desktop + phone mock-up built in HTML (not a screenshot), captioned like a postcard ("Pozdrav z Bleda").
- **Pricing:** tickets with a perforated tear line.
- **Contact:** the back of a postcard. The message is on the left, and e-mail, phone and WhatsApp are the address lines on the right.
- **Footer:** illustrated alpine ridges rise into the green footer, with a sun coming up behind them as you scroll.

**Palette:** linen `#FAF6EF` ground, paper `#FFFDF9` cards, ink `#2A2420` text, terracotta `#B04A25` for actions, honey `#E4A23A` for stamps and highlights (decorative only), river blue `#1D6479` for links and focus, alpine green `#2E4B3C` for the footer and the featured package. Every text/background pair used passes WCAG AA (ink 14.2:1, ink-soft 7.2:1, terracotta 5.1:1, white on terracotta 5.5:1).

**Type:** Fraunces with its "soft" axis on (rounded, warm serif) for headings, with the italic used for one accent word per headline; Figtree for body text. Both are self-hosted (no requests to Google), subset to Latin + Slovenian/German/Italian characters, about 85 KB for all three files, with metric-matched fallbacks so text doesn't jump when they load.

**Motion:** sections fade up once as they scroll into view; the hero photo and the lake postcard move at slightly different speeds (parallax); the footer ridges rise at different depths. All of it is `transform`/`opacity` only, and all of it is off with *reduce motion*. With JavaScript off, everything is visible and usable.

**Something owners can use, not just read:** a commission calculator in the "why" section. Owners move sliders for their own nightly price, nights per year and platform commission, and see what they pay per year and what direct bookings would keep. It is arithmetic on their numbers, calculated in the browser; nothing is sent anywhere.

**Style tile:** `/style-tile/`, built from the same `tokens.css` as the site (palette, type, buttons, a service card, the postcard photo, stamps).

## What was built

| Page | URL |
| --- | --- |
| Landing page (SL / EN) | `/`, `/en/` |
| Demo: Apartma Brin (alpine, Lake Bled photo) | `/primeri/brin/`, `/en/examples/brin/` |
| Demo: Hiša Smaragd (Soča valley) | `/primeri/smaragd/`, `/en/examples/smaragd/` |
| Demo: Studio Sol (Piran) | `/primeri/sol/`, `/en/examples/sol/` |
| Legal notice & privacy (SL / EN) | `/pravno/`, `/en/legal/` (linked from every footer) |
| 404 (Slovenian, with an English line) | any unknown URL |
| Style tile | `/style-tile/` (not indexed) |

The demos are fictional properties. Every demo page has a honey "Demo · izmišljena nastanitev" bar at the top, the example cards say "Demo", and a notice under them says they are design demos, not client work. The demo inquiry form is a static picture of a form with a visible note that it doesn't send anything: there is no working form or booking anywhere. Demo pages are `noindex`.

## Placeholders you still need to fill (all in `content/site.json`)

| What | Where | Now |
| --- | --- | --- |
| E-mail | `contact.email` | `ponudba@example.com` |
| Phone | `contact.phone` | `+386 00 000 000` |
| WhatsApp | `contact.whatsapp` | `+386 00 000 000` |
| Package prices | `prices.start`, `.plus`, `.complete` | `€XXX` |
| Hosting & care per year | `prices.care` | `€XX` |
| Package contents | `i18n.*.pricing.packages[].features` | drafted from the brief, please confirm |
| FAQ answers | `i18n.*.faq.items[]` with `"confirm": true` (5 of 7) | drafted, shown with a "Draft" tag |
| Calculator starting values | `calculator` | 80 €/night, 120 nights, 15 % commission, 20 % direct. Example numbers visitors change; adjust if you prefer others |
| Company details (legally required) | `company.name`, `.address`, `.registrationNumber`, `.taxNumber`, `.vatId` | placeholders, shown on `/pravno/` |
| Legal page text | `i18n.*.legal`, then `company.legalReviewed: true` | drafted to match how the site works, shown with a "Draft" note |
| Domain | `site.domain` | done: `https://vecgostov.com` |
| Testimonials | `testimonials` | empty and switched off on purpose |

Placeholders are shown on the page with a dashed outline and a "Začasno / Placeholder" tag, so none can go live unnoticed. Every build prints what is still missing. Placeholder contact details are never linked (no `mailto:` to example.com, no dialling a made-up number): they render as plain text, and the package and FAQ buttons point to the contact section until a real e-mail is set.

## Assumptions

- Slovenian copy uses the formal *vi*. The copy says the Booking.com/Airbnb commission applies to returning guests too and that direct inquiries have no platform commission; both are general facts. There are no numbers, client counts, results or testimonials anywhere.
- "Several units or subpages", "up to 4 languages" and the 360° tour in packages are my draft split of the services in the brief. Adjust freely.
- The Google Business Profile service mentions "the right details, good photos and a link", not rankings or guaranteed results.
- The footer credit reads "Ustvarja Matej Doljak" (SL) / "Studio by Matej Doljak" (EN) and links to matejdoljak.com in the same tab.

## Images and licences

| Image | Used for | Source | Licence |
| --- | --- | --- | --- |
| `photos/stock/interior.jpg` | Hero, Brin and Sol galleries | EZcurtain Life, [Unsplash](https://unsplash.com/photos/cozy-living-room-with-neutral-tones-and-natural-light-srzKmNLovaQ) | Unsplash License |
| `photos/stock/lake.jpg` | Lake postcard, Brin hero, style tile | Fajar Al Hadi, [Unsplash](https://unsplash.com/photos/scenic-view-of-lake-bled-and-its-island-NK-GQrcM0Ko) | Unsplash License |
| `photos/placeholders/*.svg` (8) | Demo heroes and galleries (Soča river, Piran, stone house, rooms, balconies) | Illustrated for this site | Own work |

The two photos are the originals you supplied (1800 px). This sandbox can't reach unsplash.com, so I could not re-check their licence pages myself; please open both links once before launch and make sure neither is an Unsplash+ image. The eight illustrations are marked `"placeholder": true` in `content/site.json`, each with a `wanted` note describing the photo that should replace it. Nothing on the site presents any image as client work.

Every image is served as AVIF → WebP → JPEG in five widths (480–2000 px) with `srcset`/`sizes`, explicit width/height, and lazy loading everywhere except the hero, which loads first with `fetchpriority="high"`.

## Verification

Tested in Chromium (Playwright 1.56) against **Cloudflare's own Pages runtime** (`wrangler pages dev dist`, Wrangler 4), plus `npm run check` (static checks, part of the repo) and axe-core 4.13 for accessibility. 78 automated browser checks, all passing on the final build.

| Area | Result | Evidence |
| --- | --- | --- |
| First impression | **passed** | Brand, headline and the primary button are on the first screen at 1440×900 (button bottom 680 px), 1280×720 (569), 390×844 (757), 375×667 (375), 320×568 (387) and 844×390 landscape (224). On short phones the button moves directly under the headline; in landscape the text sits beside the photo. |
| Layout | **passed** | 7 pages × 1440, 768, 390, 320 and 844×390 landscape: 0 px horizontal overflow, no clipped text, 0 broken images, 0 console errors. Screenshots reviewed by eye at 1440 and 390 for every section, plus 320×568, landscape and the open menu. |
| Language | **passed** | SL and EN have identical structure (the build refuses to finish otherwise). The switch keeps your place: SL `#paketi` → EN `/en/#pricing` → back to `/#paketi`; demo pages switch to the same demo. No English words left in the Slovenian main text and vice versa (automated scan). |
| Conversion | **passed** (format) / **not tested** (real apps) | Every in-page anchor resolves; all 875 internal links and assets resolve (`npm run check`). Mobile menu: 44×44 px button, `aria-expanded`, opens with focus on the first link, Escape closes and returns focus, link click closes and lands below the fixed header, focus is kept inside the open menu. `mailto:` has a subject and multi-line body in the page's language, `tel:+386…`, `https://wa.me/386…?text=…`; package buttons put the package name in the subject. **Not tested:** actually opening Mail, the dialer and WhatsApp on real phones, because the contact values are placeholders. |
| Accessibility | **passed** | axe-core (WCAG 2.1 A/AA + best practice): 0 violations on SL, EN, two demos, 404 and style tile at 1440 and 390. Keyboard: first Tab reaches the skip link; 40/40 focused elements show a visible focus ring. Alt text on every image in both languages. Reduced motion: nothing held back for reveal, no parallax, no smooth scroll. JavaScript off: all content visible, all 5 nav links shown inline on mobile, the calculator shows its default result. One `<h1>` per page. |
| Production | **passed** | `npm run build` succeeds (10 pages, ~0.1 s). `dist/` contains `_headers`, `_redirects`, `404.html`, `robots.txt`, favicons. Under Wrangler: fingerprinted CSS/JS/fonts/images return `Cache-Control: public, max-age=31536000, immutable`, HTML `public, max-age=0, must-revalidate`, icons one day. Security headers present: `nosniff`, `strict-origin-when-cross-origin`, `DENY`, `Permissions-Policy`, and a CSP that allows only the site's own files and the exact inline CSS (sha256 hashes written by the build); no CSP errors in any page. `/sl/…` → 301 to `/…`, `/examples/…` → 301 to `/en/examples/…`, `/en` → `/en/`, unknown URLs → 404 status with the styled 404 page. |
| Performance | **measured** | See below. No Lighthouse or Core Web Vitals scores were run, so none are claimed. |

### Page weight

Measured in Chromium against `wrangler pages dev`, first visit, empty cache. "Brotli" applies Brotli (quality 11) to the text files, as Cloudflare serves them; images and fonts are already compressed.

| Page | Device | First screen (no scroll) | Whole page (scrolled to the end) |
| --- | --- | --- | --- |
| `/` | Phone 390×844 @2x | 6 requests · 206 KB raw · **123 KB with Brotli** | 12 requests · 295 KB · **212 KB** |
| `/` | Desktop 1440×900 @1x | 7 requests · 273 KB raw · **190 KB with Brotli** | 9 requests · 281 KB · **198 KB** |
| `/en/` | Phone / Desktop | 123 KB / 189 KB with Brotli | 212 KB / 197 KB |
| `/primeri/brin/` | Phone / Desktop | 179 KB / 293 KB with Brotli | same |

First screen on a phone: HTML with all critical CSS inlined 15.7 KB (Brotli), hero photo 21 KB (AVIF, 800 px), fonts 83 KB, JavaScript 2.6 KB. Built HTML is 91 KB uncompressed because the CSS is inlined, so there is no separate render-blocking stylesheet request.

## Known limitations

- **Eight illustrated stand-ins.** Real photos will sell the demos better. Each entry in `content/site.json` says what photo would replace it.
- **Browsers:** tested in Chromium only. Safari (iOS/macOS) and Firefox were not tested; there are no real-device tests either. The CSS uses widely supported features (`svh`, `text-wrap: balance`, CSS masks for the stamp edge); where one is missing, the stamp shows without its perforated edge and headings wrap normally.
- **Social previews** use absolute `https://vecgostov.com/…` URLs now that `site.domain` is set; check one share (e.g. in WhatsApp) once the domain is live.
- **The claude.ai preview link** was a convenience build of the same pages. Contact links and some page-to-page navigation may not work inside that frame; the real test is `vecgostov.pages.dev`.
- **Unsplash licences** could not be re-verified from this environment (see above).
- The social images in `src/assets/og/` are regenerated with an optional script (`scripts/og.mjs`, needs Playwright) when the headline or hero photo changes.
