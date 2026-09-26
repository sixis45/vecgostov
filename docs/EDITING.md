# Editing the site

All text, prices, contact details, FAQ, demo properties and the image list are in one file: **`content/site.json`**. You never need to touch a template to change content.

After an edit, run `npm run dev` (or `npm run build`). If the JSON has a typo (a missing comma or quote), the build stops and tells you the position.

## How the file is organised

| Key | What it holds |
| --- | --- |
| `BRAND_NAME` | The wordmark, used everywhere. Change it here only. |
| `site.domain` | Empty until the real domain is known (see docs/DEPLOY.md). |
| `site.locales` | Languages that get built, e.g. `["sl", "en"]`. The first page (`/`) is `defaultLocale`. |
| `contact` | E-mail, phone, WhatsApp number. Shared by both languages. |
| `company` | Provider details for the legal page (name, address, registration and tax numbers, VAT). |
| `prices` | Package prices, shared by both languages. |
| `calculator` | Starting values of the commission calculator. |
| `images` | Every photo: its source file, credit/licence, crop focus. |
| `demos` | The three example properties: photos, facts, amenities, theme. |
| `testimonials` | Empty on purpose. See below. |
| `i18n.sl`, `i18n.en` | All copy, one complete block per language, with identical structure. |

Keys that start with `_` (`_note`, `_readme`) are comments for you; the site ignores them.

## Common edits

### Contact details (placeholders now)

```json
"contact": {
  "email": "info@vecgostov.si",
  "phone": "+386 41 123 456",
  "whatsapp": "+386 41 123 456"
}
```

Use international format for phone and WhatsApp. The site builds the `mailto:` (with a prefilled subject and message in the visitor's language), `tel:` and `https://wa.me/…` links for you. The prefilled texts are `i18n.<lang>.contact.emailSubject`, `emailBody` and `whatsappText`.

### Company details and the legal page (placeholders now)

Slovenian law requires a business website to show who runs it. The page is `/pravno/` (SL) and `/en/legal/` (EN), linked from every footer. Fill in `company`:

```json
"company": {
  "name": "Ime Priimek s.p.",
  "address": "Ulica 1, 1000 Ljubljana",
  "registrationNumber": "1234567000",
  "taxNumber": "12345678",
  "vatId": "",
  "responsiblePerson": "Matej Doljak",
  "legalUpdated": "2026-09-26",
  "legalReviewed": false
}
```

`vatId`: your VAT ID (e.g. `SI12345678`), or `""` if you are not registered for VAT (the page then says so). The privacy text is in `i18n.<lang>.legal.privacy`. It describes what the site actually does: no cookies, no tracking, no forms, hosting at Cloudflare, contact by e-mail, phone or WhatsApp. Read it (have it checked if you like), then set `legalReviewed` to `true` and `legalUpdated` to that day; the "Draft" note on the page disappears. If you later add analytics or a form, update the privacy text too.

### Prices (placeholders now)

```json
"prices": { "start": "€690", "plus": "€1.190", "complete": "od €1.790", "care": "€90" }
```

Write the price exactly as it should appear. Package names and features are per language in `i18n.<lang>.pricing.packages`. The "ask about this package" buttons open an e-mail with the package name in the subject.

### FAQ answers marked as drafts

Every answer with `"confirm": true` shows a small **Osnutek / Draft** tag on the page. Check the wording, adjust it if needed, then set `"confirm": false` in both languages.

### Any other text

Find the sentence in `i18n.sl` and change it, then do the same in `i18n.en`. In headlines, words in `{braces}` are set in italic terracotta, e.g. `"Več gostov, ki rezervirajo {neposredno} pri vas."`.

### Replacing a photo

1. Copy the new photo into `photos/` (for example `photos/stock/terasa.jpg`). Keep very large camera files in `photos/originals/`; git ignores that folder.
2. In `images`, point the entry's `src` to the new file, set `"placeholder": false`, and fill in `credit`, `license` and `sourceUrl` for stock photos.
3. Update the alt text in **both** `i18n.sl.alt` and `i18n.en.alt`.
4. Optional: `position` sets which part of the photo stays in view when it is cropped, e.g. `"50% 30%"`.
5. Run `npm run images` (it only re-processes changed photos), then commit `src/assets/img/`.

Eight images are currently illustrated stand-ins (`"placeholder": true`). Their `wanted` field describes the photo that would replace each one.

### Social preview image

`src/assets/og/og-sl.jpg` and `og-en.jpg` are generated from the headline and the hero photo. After changing either, regenerate them with `npx -y -p playwright@1 node scripts/og.mjs` and commit.

### Testimonials (real ones only)

The section is built but switched off. Add real quotes (with the client's permission) and turn it on:

```json
"testimonials": {
  "enabled": true,
  "items": [
    { "name": "Ana K.", "place": "Bohinj", "quote": { "sl": "…", "en": "…" } }
  ]
}
```

### Adding a language (German, Italian)

1. Copy the whole `i18n.en` block to `i18n.de` and translate every value.
2. Set its `paths`, e.g. `"home": "/de/", "demos": "/de/beispiele/"`, its section `ids` (e.g. `"leistungen"`), `langName` and `ogLocale` (`de_DE`).
3. Add `"de"` to `site.locales`, and alt texts under `i18n.de.alt`.
4. Build. The build refuses to finish if the German block is missing any key the Slovenian one has, and tells you which.

The language switch, `hreflang` tags and sitemap pick up the new language automatically.

## Design changes

- Colours, fonts, spacing: `src/styles/tokens.css`. The style tile at `/style-tile/` uses the same file, so it always shows the current values.
- Section styles: `src/styles/home.css`, demo pages: `src/styles/demo.css`.
