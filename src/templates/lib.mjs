// Shared helpers and partials used by every page template.
import { icon } from './icons.mjs';

export { icon };

export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Text with {braces} → the braced words become <em>. */
export const emph = (text) => esc(text).replace(/\{(.+?)\}/g, '<em>$1</em>');

/** Fills {name} slots. Values are inserted as-is (escape them first if needed). */
export const fill = (template, vars) => String(template).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

/** Values still containing placeholder markers (XXX, example.com, 00 000 000). */
export const isPlaceholder = (value) => /XXX|example\.com|00 000 000|\[\[/.test(String(value ?? ''));

/** Placeholder-aware inline value: dashed outline + tag until replaced. */
export function value(ctx, text, { tag = true } = {}) {
  if (!isPlaceholder(text)) return esc(text);
  ctx.report.placeholders.add(String(text));
  return `<span class="ph">${esc(text)}</span>${tag ? `<span class="ph-tag">${esc(ctx.t.ui.placeholder)}</span>` : ''}`;
}

export const digits = (phone) => String(phone).replace(/[^\d+]/g, '');

/** Brand name with the first "č" picked out in the accent colour. */
export function wordmark(name) {
  const safe = esc(name);
  const i = safe.indexOf('č');
  const inner = i === -1 ? safe : `${safe.slice(0, i)}<span class="wordmark__accent">č</span>${safe.slice(i + 1)}`;
  return `<span class="wordmark__text">${inner}</span>`;
}

export function plural(ctx, forms, n) {
  const rule = new Intl.PluralRules(ctx.lang).select(n);
  return fill(forms[rule] ?? forms.other, { n });
}

export function money(ctx, amount) {
  return new Intl.NumberFormat(ctx.t.ogLocale.replace('_', '-'), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(amount);
}

// ---- Contact links ----------------------------------------------------------
/**
 * mailto/tel/wa.me URLs. A detail that is still a placeholder gets `null`, so
 * a live site never sends a visitor to example.com or a made-up number.
 */
export function contactLinks(ctx, { subject, body } = {}) {
  const c = ctx.site.contact;
  const s = subject ?? ctx.t.contact.emailSubject;
  const b = body ?? ctx.t.contact.emailBody;
  const real = (key, url) => (isPlaceholder(c[key]) ? null : url);
  return {
    email: real('email', `mailto:${c.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`),
    phone: real('phone', `tel:${digits(c.phone)}`),
    whatsapp: real('whatsapp', `https://wa.me/${digits(c.whatsapp).replace(/^\+/, '')}?text=${encodeURIComponent(ctx.t.contact.whatsappText)}`),
  };
}

/** A link when `href` is set, otherwise the same content as plain text. */
export const linkOrText = (href, inner, extra = '') => (href ? `<a href="${esc(href)}"${extra}>${inner}</a>` : `<span class="is-pending">${inner}</span>`);

// ---- Images -----------------------------------------------------------------
/**
 * <picture> with AVIF + WebP + JPEG at every width. `sizes` must describe the
 * rendered width; `eager` for the one above-the-fold image only.
 */
export function picture(ctx, key, { sizes = '100vw', eager = false, alt, cls = '', imgCls = '' } = {}) {
  const m = ctx.manifest[key];
  if (!m) throw new Error(`Image "${key}" is not in src/assets/img/manifest.json — run \`npm run images\`.`);
  ctx.report.images.add(key);
  const set = (ext) => m.files[ext].map(([w, file]) => `${ctx.asset(`img/${file}`)} ${w}w`).join(', ');
  const fallback = m.files.jpg.find(([w]) => w >= 1200) ?? m.files.jpg[m.files.jpg.length - 1];
  const altText = alt ?? ctx.t.alt[key];
  if (altText === undefined) throw new Error(`Missing alt text for image "${key}" in i18n.${ctx.lang}.alt`);
  const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<picture class="pic${cls ? ' ' + cls : ''}">` +
    `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img class="obj-${key}${imgCls ? ' ' + imgCls : ''}" src="${ctx.asset(`img/${fallback[1]}`)}" srcset="${set('jpg')}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${esc(altText)}" ${loading} decoding="${eager ? 'sync' : 'async'}">` +
    `</picture>`;
}

// ---- Page chrome ------------------------------------------------------------
export function langSwitch(ctx, { cls = '' } = {}) {
  const items = ctx.site.site.locales.map((l) => {
    const label = l.toUpperCase();
    const name = ctx.site.i18n[l].langName;
    if (l === ctx.lang) return `<span aria-current="page" title="${esc(name)}">${label}</span>`;
    const ids = esc(JSON.stringify(ctx.site.i18n[l].ids));
    return `<a href="${ctx.alternates[l]}" hreflang="${l}" lang="${l}" data-lang-switch data-ids="${ids}"><span class="sr-only">${esc(name)} — </span>${label}</a>`;
  });
  return `<div class="lang${cls ? ' ' + cls : ''}" role="group" aria-label="${esc(ctx.t.ui.language)}">${items.join('')}</div>`;
}

export function stamp(text, { cls = '', face = '' } = {}) {
  return `<span class="stamp-wrap${cls ? ' ' + cls : ''}" aria-hidden="true"><span class="stamp"><span class="stamp__face${face ? ' ' + face : ''}">${text}</span></span></span>`;
}

export function postmark(text, { cls = '' } = {}) {
  return `<span class="postmark${cls ? ' ' + cls : ''}" aria-hidden="true"><svg class="postmark__waves" viewBox="0 0 72 26"><path d="M0 5c6 0 6-4 12-4s6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4M0 13c6 0 6-4 12-4s6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4M0 21c6 0 6-4 12-4s6 4 12 4 6-4 12-4 6 4 12 4 6-4 12-4 6 4 12 4"/></svg><span>${String(text).split(' · ').map((part) => `<span>${esc(part)}</span>`).join('')}</span></span>`;
}

// Without JavaScript the mobile menu button can't open anything, so the links
// are shown inline under the header instead.
const NOSCRIPT_CSS = '@media (max-width:61.99em){html .hdr{position:static}html body.has-fixed-header{padding-top:0}html .hdr__in{flex-wrap:wrap;height:auto;padding-block:.5rem}html .menu-btn{display:none}html .hdr .nav{position:static;visibility:visible;opacity:1;transform:none;box-shadow:none;border:0;padding:0;flex-basis:100%;background:none;max-height:none;z-index:auto;overflow:visible}html .nav__list{flex-direction:row;flex-wrap:wrap;gap:0 1.1rem}html .hdr .nav__list a{min-height:44px;border:0;font-family:var(--font-body);font-size:1rem}html .nav__extra{display:flex;flex-wrap:wrap;align-items:center;margin:.25rem 0 .5rem}html .nav__extra .btn{width:auto}}';

export function document(ctx, { title, description, body, bodyClass = '', path, styles, preload = [], noindex = false }) {
  const { site, t, lang } = ctx;
  const domain = site.site.domain.replace(/\/$/, '');
  const og = ctx.asset(`og/og-${lang}.jpg`, { optional: true });
  const canonical = domain ? `<link rel="canonical" href="${domain}${path}">` +
    Object.entries(ctx.alternates).map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${domain}${href}">`).join('') +
    `<link rel="alternate" hreflang="x-default" href="${domain}${ctx.alternates[site.site.defaultLocale]}">` +
    `<meta property="og:url" content="${domain}${path}">` : '';
  const ogImage = og ? `<meta property="og:image" content="${domain}${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(t.meta.ogImageAlt)}"><meta name="twitter:card" content="summary_large_image">` : '';
  const alternateLocales = site.site.locales.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${site.i18n[l].ogLocale}">`).join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="${esc(site.site.themeColor)}">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.BRAND_NAME)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="${t.ogLocale}">${alternateLocales}
${ogImage}${canonical}
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${preload.join('\n')}
<style>${styles}</style>
<noscript><style>${NOSCRIPT_CSS}</style></noscript>
<script src="${ctx.asset('site.js')}" defer></script>
</head>
<body class="${bodyClass}">
${body}
</body>
</html>
`;
}

export function footerLandscape() {
  // Layered ridges for the footer; the last layer matches the footer colour.
  return `<div class="landscape" aria-hidden="true">
<svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice">
<g class="landscape__sun" data-depth="1.6"><circle cx="1180" cy="150" r="120" fill="#fbe3b0" opacity=".55"/><circle cx="1180" cy="150" r="54" fill="#f1b54f"/></g>
<g data-depth="1.05"><path fill="#bcd0cf" d="M0 190 L90 150 L170 170 L260 96 L330 140 L420 118 L520 60 L610 128 L700 110 L780 140 L870 74 L960 132 L1060 104 L1140 140 L1250 70 L1330 118 L1420 96 L1510 136 L1600 110 V300 H0 Z"/><path fill="#f7f3ea" d="M500 71 L520 60 L541 76 L530 78 L520 72 L510 80 Z M852 84 L870 74 L889 88 L878 90 L869 84 L860 91 Z M1231 81 L1250 70 L1270 84 L1259 86 L1250 80 L1240 88 Z"/></g>
<g data-depth="0.7"><path fill="#86a79a" d="M0 214 C120 190 210 170 320 184 C430 198 520 150 640 160 C760 170 850 204 980 186 C1100 170 1200 140 1330 158 C1450 174 1530 196 1600 188 V300 H0 Z"/></g>
<g data-depth="0.38"><path fill="#557a67" d="M0 244 C140 220 260 214 400 230 C540 246 640 206 780 214 C920 222 1020 250 1160 236 C1300 222 1420 206 1600 224 V300 H0 Z"/></g>
<g data-depth="0"><path fill="#2e4b3c" d="M0 272 C160 256 320 262 480 270 C640 278 800 252 960 256 C1120 260 1280 276 1440 266 C1520 261 1570 258 1600 260 V300 H0 Z"/></g>
</svg>
</div>`;
}

export function footer(ctx, { home = true } = {}) {
  const { site, t } = ctx;
  const links = contactLinks(ctx);
  const sectionHref = (key) => `${home ? '' : ctx.homeUrl}#${t.ids[key]}`;
  const year = new Date().getFullYear();
  return `${footerLandscape()}
<footer class="ftr">
  <div class="wrap">
    <div class="ftr__grid">
      <div>
        <a class="wordmark" href="${ctx.homeUrl}">${wordmark(site.BRAND_NAME)}</a>
        <p class="ftr__tagline">${esc(t.footer.tagline)}</p>
        ${langSwitch(ctx)}
      </div>
      <div>
        <h2 class="ftr__title">${esc(t.footer.sections)}</h2>
        <ul class="ftr__list">
          ${t.nav.map((n) => `<li><a href="${sectionHref(n.key)}">${esc(n.label)}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h2 class="ftr__title">${esc(t.footer.contact)}</h2>
        <ul class="ftr__list">
          <li>${linkOrText(links.email, `${icon('mail')}${value(ctx, site.contact.email, { tag: false })}`)}</li>
          <li>${linkOrText(links.phone, `${icon('call')}${value(ctx, site.contact.phone, { tag: false })}`)}</li>
          <li>${linkOrText(links.whatsapp, `${icon('chat')}WhatsApp${links.whatsapp ? `<span class="sr-only"> (${esc(t.ui.external)})</span>` : ''}`, ' target="_blank" rel="noopener"')}</li>
        </ul>
      </div>
    </div>
    <div class="ftr__bottom">
      <p>© ${year} ${esc(site.BRAND_NAME)}</p>
      <p><a href="${esc(site.site.studio.url)}">${esc(fill(t.footer.studio, { name: site.site.studio.name }))}</a></p>
    </div>
  </div>
</footer>`;
}
