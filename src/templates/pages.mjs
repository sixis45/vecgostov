// 404 page and the style tile.
import { esc, emph, icon, stamp, postmark, wordmark, picture, document, footerLandscape } from './lib.mjs';

export function renderNotFound(ctx) {
  const { t, site } = ctx;
  const n = t.notFound;
  const other = site.site.locales.find((l) => l !== ctx.lang);
  const body = `<main id="main" class="nf">
  <div class="wrap nf__in">
    <a class="wordmark" href="${ctx.homeUrl}">${wordmark(site.BRAND_NAME)}</a>
    <div class="postcard nf__card">
      <div class="nf__marks">${postmark('404 · ' + site.BRAND_NAME)}${stamp('404', { cls: 'nf__stamp' })}</div>
      <p class="kicker">404</p>
      <h1>${esc(n.title)}</h1>
      <p>${esc(n.body)}</p>
      <p><a class="btn btn--primary btn--lg" href="${ctx.homeUrl}">${esc(n.home)}${icon('arrow', 'icon--arrow')}</a></p>
      ${other ? `<p class="nf__other" lang="${other}">${esc(n.english)} <a href="${site.i18n[other].paths.home}" hreflang="${other}">${esc(n.englishLink)}</a></p>` : ''}
    </div>
  </div>
  ${footerLandscape()}
</main>`;
  return document(ctx, {
    title: `404 — ${n.title} · ${site.BRAND_NAME}`,
    description: n.body,
    body,
    bodyClass: 'page-404',
    path: '/404.html',
    styles: ctx.css(['tokens', 'base', 'pages']),
    preload: ctx.preloadFonts(),
    noindex: true,
  });
}

export function renderStyleTile(ctx, tokens) {
  const { t, site } = ctx;
  const s = t.styleTile;
  const colours = [
    ['--linen', 'Linen'], ['--paper', 'Paper'], ['--sand', 'Sand'], ['--ink', 'Ink'], ['--ink-soft', 'Ink soft'],
    ['--terra', 'Terracotta'], ['--sun', 'Honey sun'], ['--river', 'River'], ['--alpine', 'Alpine'],
  ];
  const hex = (name) => (tokens.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,8})`)) || [])[1] || '';
  const body = `<main id="main" class="tile">
  <div class="wrap">
    <header class="tile__head">
      <p class="kicker">${esc(s.title)}</p>
      <p class="tile__brand wordmark">${wordmark(site.BRAND_NAME)}</p>
      <p class="tile__intro">${esc(s.intro)}</p>
    </header>

    <div class="tile__grid">
      <section class="tile__block tile__block--palette" aria-labelledby="tile-palette">
        <h2 id="tile-palette" class="tile__label">${esc(s.palette)}</h2>
        <ul class="swatches" role="list">
          ${colours.map(([v, name]) => `<li><span class="swatch swatch${v}"></span><span><b>${name}</b><code>${v} · ${hex(v)}</code></span></li>`).join('\n          ')}
        </ul>
      </section>

      <section class="tile__block" aria-labelledby="tile-type">
        <h2 id="tile-type" class="tile__label">${esc(s.type)}</h2>
        <p class="tile__display">${emph(s.headingSample.replace(/(\S+)\.$/, '{$1}.'))}</p>
        <p class="tile__meta">Fraunces (soft) · 300–600 · <em>italic</em></p>
        <p class="tile__body">${esc(s.bodySample)}</p>
        <p class="tile__meta">Figtree · 300–900</p>
      </section>

      <section class="tile__block" aria-labelledby="tile-buttons">
        <h2 id="tile-buttons" class="tile__label">${esc(s.buttons)}</h2>
        <div class="tile__buttons">
          <a class="btn btn--primary btn--lg" href="#main">${esc(t.cta.primary)}${icon('arrow', 'icon--arrow')}</a>
          <a class="btn btn--ghost" href="#main">${esc(t.hero.secondary)}</a>
          <a class="btn btn--sun" href="#main">${esc(t.pricing.cta)}</a>
          <a href="#main">${esc(s.linkSample)}</a>
        </div>
        <p class="kicker">${esc(t.services.kicker)}</p>
      </section>

      <section class="tile__block" aria-labelledby="tile-card">
        <h2 id="tile-card" class="tile__label">${esc(s.card)}</h2>
        <article class="svc">
          <div class="svc__top">${stamp(icon('pin'), { cls: 'svc__stamp', face: 'stamp__face--river' })}<span class="svc__num" aria-hidden="true">02</span></div>
          <h3>${esc(t.services.items[1].title)}</h3>
          <p>${esc(t.services.items[1].body)}</p>
        </article>
      </section>

      <section class="tile__block tile__block--image" aria-labelledby="tile-image">
        <h2 id="tile-image" class="tile__label">${esc(s.image)}</h2>
        <figure class="tile__photo">
          <div class="photo-card">${picture(ctx, 'lake', { sizes: '(min-width: 62em) 30rem, 90vw' })}${stamp('SI', { cls: 'hero__front-stamp' })}</div>
          <figcaption>${esc(t.hero.photoCard)}</figcaption>
        </figure>
        <div class="tile__marks">${postmark(t.hero.postcard.postmark)}${stamp(icon('sun'))}${stamp(esc(t.examples.badge))}</div>
      </section>
    </div>
  </div>
</main>`;
  return document(ctx, {
    title: `${s.title} — ${site.BRAND_NAME}`,
    description: s.intro,
    body,
    bodyClass: 'page-tile',
    path: '/style-tile/',
    styles: ctx.css(['tokens', 'base', 'home', 'pages']),
    preload: ctx.preloadFonts(),
    noindex: true,
  });
}
