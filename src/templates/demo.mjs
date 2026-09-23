// Demo apartment page: a small, complete one-page site for a fictional
// property. Same template for every demo; the theme changes the character.
import { esc, icon, picture, langSwitch, plural, stamp, document } from './lib.mjs';

const AMENITY_ICONS = {
  wifi: 'wifi', parking: 'parking', kitchen: 'kitchen', balcony: 'balcony', washer: 'washer',
  bike: 'bike', garden: 'garden', grill: 'grill', pets: 'pets', aircon: 'aircon', coffee: 'coffee', nocar: 'nocar',
};

export function renderDemo(ctx, demo) {
  const { t, site } = ctx;
  const T = t.demo;
  const d = T.items[demo.slug];
  const ids = T.ids;
  const facts = [
    demo.facts.guests && [icon('users'), plural(ctx, T.facts.guests, demo.facts.guests)],
    demo.facts.bedrooms && [icon('bed'), plural(ctx, T.facts.bedrooms, demo.facts.bedrooms)],
    demo.facts.size && [icon('size'), esc(demo.facts.size)],
  ].filter(Boolean);
  const homeExamples = `${ctx.homeUrl}#${t.ids.examples}`;
  const [g1, g2, g3] = demo.gallery;

  const body = `<a class="skip" href="#main">${esc(t.ui.skip)}</a>
<aside class="demo-bar" aria-label="${esc(t.examples.badge)}">
  <div class="wrap demo-bar__in">
    <p>${stamp(esc(t.examples.badge), { cls: 'demo-bar__stamp' })}<span>${esc(T.bar)}</span></p>
    <a class="demo-bar__back" href="${homeExamples}">${icon('arrow-left')}<span>${esc(T.back)}</span></a>
  </div>
</aside>
<header class="hdr d-hdr" data-header>
  <div class="wrap hdr__in">
    <a class="wordmark d-logo" href="#main">${esc(d.name)}</a>
    <nav class="nav" id="nav" aria-label="${esc(t.ui.navLabel)}">
      <ul class="nav__list" role="list">
        ${['about', 'gallery', 'area', 'inquiry'].map((k) => `<li><a href="#${ids[k]}">${esc(T.nav[k])}</a></li>`).join('')}
      </ul>
      <div class="nav__extra">
        ${langSwitch(ctx)}
        <a class="btn d-btn" href="#${ids.inquiry}">${esc(T.checkDates)}</a>
      </div>
    </nav>
    <div class="hdr__lang">${langSwitch(ctx)}</div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" data-menu-button data-label-open="${esc(t.ui.menuOpen)}" data-label-close="${esc(t.ui.menuClose)}">
      <span class="sr-only" data-menu-label>${esc(t.ui.menuOpen)}</span>${icon('menu')}${icon('close')}
    </button>
  </div>
</header>
<main id="main">
  <section class="d-hero" aria-labelledby="d-title">
    <div class="d-hero__photo" data-parallax="0.18">${picture(ctx, demo.hero, { eager: true, sizes: '100vw' })}</div>
    <div class="wrap d-hero__content">
      <p class="d-hero__greet">${esc(d.greeting)}</p>
      <h1 id="d-title" class="d-hero__name">${esc(d.name)}</h1>
      <p class="d-hero__place">${icon('pin')}${esc(d.place)}</p>
      <p class="d-hero__tagline">${esc(d.tagline)}</p>
      <ul class="d-facts" role="list">
        ${facts.map(([ic, text]) => `<li>${ic}<span>${text}</span></li>`).join('')}
      </ul>
      <a class="btn d-btn btn--lg" href="#${ids.inquiry}">${esc(T.checkDates)}${icon('arrow', 'icon--arrow')}</a>
    </div>
  </section>

  <section class="d-section" id="${ids.about}" data-key="about" aria-labelledby="d-about">
    <div class="wrap d-about">
      <div class="d-about__text" data-reveal>
        <h2 id="d-about" class="d-h2">${esc(d.tagline)}</h2>
        ${d.about.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
      <div class="d-amenities" data-reveal>
        <h3 class="d-h3">${esc(T.amenitiesTitle)}</h3>
        <ul role="list">
          ${demo.amenities.map((a) => `<li>${icon(AMENITY_ICONS[a])}<span>${esc(T.amenities[a])}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>

  <section class="d-section d-section--tint" id="${ids.gallery}" data-key="gallery" aria-labelledby="d-gallery">
    <div class="wrap">
      <h2 id="d-gallery" class="d-h2" data-reveal>${esc(T.galleryTitle)}</h2>
      <div class="d-gallery">
        <figure class="d-gallery__a" data-reveal>${picture(ctx, g1, { sizes: '(min-width: 62em) 44rem, 100vw' })}</figure>
        <figure class="d-gallery__b" data-reveal>${picture(ctx, g2, { sizes: '(min-width: 62em) 28rem, 100vw' })}</figure>
        <figure class="d-gallery__c" data-reveal>${picture(ctx, g3, { sizes: '(min-width: 62em) 28rem, 100vw' })}</figure>
      </div>
    </div>
  </section>

  <section class="d-section" id="${ids.area}" data-key="area" aria-labelledby="d-area">
    <div class="wrap">
      <h2 id="d-area" class="d-h2" data-reveal>${esc(T.areaTitle)}</h2>
      <ul class="d-area" role="list">
        ${d.area.map((a) => `<li class="d-area__item" data-reveal>
          <p class="d-area__dist">${esc(a.distance)}</p>
          <h3 class="d-h3">${esc(a.title)}</h3>
          <p>${esc(a.body)}</p>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="d-section d-section--tint" id="${ids.inquiry}" data-key="inquiry" aria-labelledby="d-inquiry">
    <div class="wrap d-inquiry">
      <div class="d-inquiry__text" data-reveal>
        <h2 id="d-inquiry" class="d-h2">${esc(T.inquiryTitle)}</h2>
        <p>${esc(T.inquiryBody)}</p>
        <p class="d-inquiry__note">${icon('info')}<span>${esc(T.mockNote)}</span></p>
      </div>
      <figure class="d-form" data-reveal aria-describedby="d-mock-note">
        <div class="d-form__row">
          <div class="d-field"><span class="d-field__label">${esc(T.form.arrival)}</span><span class="d-field__value">${esc(T.form.sampleArrival)}</span></div>
          <div class="d-field"><span class="d-field__label">${esc(T.form.departure)}</span><span class="d-field__value">${esc(T.form.sampleDeparture)}</span></div>
        </div>
        <div class="d-field"><span class="d-field__label">${esc(T.form.guests)}</span><span class="d-field__value">${esc(T.form.sampleGuests)}</span></div>
        <div class="d-form__row">
          <div class="d-field"><span class="d-field__label">${esc(T.form.name)}</span><span class="d-field__value d-field__value--empty"></span></div>
          <div class="d-field"><span class="d-field__label">${esc(T.form.email)}</span><span class="d-field__value d-field__value--empty"></span></div>
        </div>
        <div class="d-field d-field--tall"><span class="d-field__label">${esc(T.form.message)}</span><span class="d-field__value">${esc(T.form.sampleMessage)}</span></div>
        <span class="d-form__submit" aria-hidden="true">${esc(T.form.submit)}</span>
        <figcaption id="d-mock-note" class="sr-only">${esc(T.mockNote)}</figcaption>
      </figure>
    </div>
  </section>
</main>
<footer class="d-ftr">
  <div class="wrap d-ftr__in">
    <div>
      <p class="d-ftr__title">${esc(T.footerTitle)}</p>
      <p class="d-ftr__note">${esc(T.footerNote)}</p>
    </div>
    <div class="d-ftr__actions">
      <a class="btn btn--primary btn--lg" href="${ctx.homeUrl}#${t.ids.contact}">${esc(t.cta.primary)}${icon('arrow', 'icon--arrow')}</a>
      <a class="d-ftr__brand" href="${homeExamples}">${icon('arrow-left')}${esc(T.back)}</a>
    </div>
  </div>
</footer>`;

  return document(ctx, {
    title: `${d.name} — ${d.place} · Demo · ${site.BRAND_NAME}`,
    description: `${d.tagline} ${T.bar}`,
    body,
    bodyClass: `demo theme-${demo.theme}`,
    path: ctx.alternates[ctx.lang],
    styles: ctx.css(['tokens', 'base', 'demo']),
    preload: ctx.preloadFonts(),
    noindex: true,
  });
}
