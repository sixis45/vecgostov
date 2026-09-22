// Landing page (one per language).
import {
  esc, emph, fill, icon, value, isPlaceholder, picture, langSwitch, stamp, postmark,
  wordmark, contactLinks, money, footer, document,
} from './lib.mjs';

function header(ctx) {
  const { t, site } = ctx;
  return `<a class="skip" href="#main">${esc(t.ui.skip)}</a>
<header class="hdr" data-header>
  <div class="wrap hdr__in">
    <a class="wordmark" href="${ctx.homeUrl}" aria-label="${esc(t.ui.home)}">${wordmark(site.BRAND_NAME)}</a>
    <nav class="nav" id="nav" aria-label="${esc(t.ui.navLabel)}">
      <ul class="nav__list" role="list">
        ${t.nav.map((n) => `<li><a href="#${t.ids[n.key]}">${esc(n.label)}</a></li>`).join('\n        ')}
      </ul>
      <div class="nav__extra">
        ${langSwitch(ctx)}
        <a class="btn btn--primary" href="#${t.ids.contact}">${esc(t.cta.short)}</a>
      </div>
    </nav>
    <div class="hdr__lang">${langSwitch(ctx)}</div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" data-menu-button data-label-open="${esc(t.ui.menuOpen)}" data-label-close="${esc(t.ui.menuClose)}">
      <span class="sr-only" data-menu-label>${esc(t.ui.menuOpen)}</span>${icon('menu')}${icon('close')}
    </button>
  </div>
</header>`;
}

function hero(ctx) {
  const { t } = ctx;
  const h = t.hero;
  return `<section class="hero" data-key="top" aria-labelledby="hero-title">
  <div class="hero__photo" data-parallax="0.14">
    ${picture(ctx, 'hero', { eager: true, sizes: '100vw' })}
  </div>
  <div class="wrap hero__wrap">
    <div class="postcard hero__card">
      <div class="hero__msg">
        <p class="kicker">${esc(h.kicker)}</p>
        <h1 id="hero-title" class="hero__title">${emph(h.title)}</h1>
        <p class="hero__lead">${esc(h.lead)}</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#${t.ids.contact}">${esc(t.cta.primary)}${icon('arrow', 'icon--arrow')}</a>
          <a class="btn btn--ghost btn--lg" href="#${t.ids.examples}">${esc(h.secondary)}</a>
        </div>
        <p class="hero__note">${icon('check')}${esc(h.note)}</p>
      </div>
      <div class="hero__addr">
        <div class="hero__marks">${postmark(h.postcard.postmark)}${stamp(icon('sun'), { cls: 'hero__stamp' })}</div>
        <p class="hero__addr-title">${esc(h.postcard.title)}</p>
        <ul class="hero__addr-list" role="list">
          ${h.postcard.items.map((i) => `<li>${icon('check')}<span>${esc(i)}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
    <figure class="hero__front" data-parallax="-0.08" data-tilt>
      <div class="photo-card">
        ${picture(ctx, 'lake', { sizes: '(min-width: 62em) 18rem, 12rem' })}
        ${stamp('SI', { cls: 'hero__front-stamp' })}
      </div>
      <figcaption>${esc(h.photoCard)}</figcaption>
    </figure>
  </div>
</section>`;
}

function calculator(ctx) {
  const { t, site } = ctx;
  const c = t.calc;
  const cfg = site.calculator;
  const year = cfg.price * cfg.nights * (cfg.commission / 100);
  const keep = year * (cfg.direct / 100);
  const pct = (n) => new Intl.NumberFormat(ctx.t.ogLocale.replace('_', '-'), { style: 'percent', maximumFractionDigits: 0 }).format(n / 100);
  const field = (key, label, display) => {
    const [min, max, step] = cfg.ranges[key];
    return `<div class="calc__field">
          <div class="calc__label"><label for="calc-${key}">${esc(label)}</label><output id="calc-${key}-out" for="calc-${key}" data-calc-out="${key}">${esc(display)}</output></div>
          <input class="calc__range" type="range" id="calc-${key}" name="${key}" min="${min}" max="${max}" step="${step}" value="${cfg[key]}" data-calc-in="${key}">
        </div>`;
  };
  return `<div class="calc postcard" data-calc data-locale="${esc(ctx.t.ogLocale.replace('_', '-'))}" data-nights-unit="${esc(c.nightsUnit)}" data-keep-template="${esc(c.keep)}">
      <div class="calc__head">
        <h3 class="calc__title">${esc(c.title)}</h3>
        ${stamp('%', { cls: 'calc__stamp', face: 'stamp__face--river' })}
      </div>
      <p class="calc__intro">${esc(c.intro)}</p>
      <div class="calc__fields">
        ${field('price', c.price, money(ctx, cfg.price))}
        ${field('nights', c.nights, `${cfg.nights} ${c.nightsUnit}`)}
        ${field('commission', c.commission, pct(cfg.commission))}
      </div>
      <div class="calc__result">
        <p class="calc__year-label">${esc(c.year)}</p>
        <p class="calc__year" data-calc-result="year">${esc(money(ctx, year))}</p>
      </div>
      <div class="calc__fields calc__fields--direct">
        ${field('direct', c.direct, pct(cfg.direct))}
      </div>
      <p class="calc__keep" data-calc-result="keep">${fill(esc(c.keep), { share: `<strong>${esc(pct(cfg.direct))}</strong>`, keep: `<strong>${esc(money(ctx, keep))}</strong>` })}</p>
    </div>`;
}

function why(ctx) {
  const { t } = ctx;
  const w = t.why;
  return `<section class="section why" id="${t.ids.why}" data-key="why" aria-labelledby="why-title">
  <div class="wrap">
    <header class="head" data-reveal>
      <p class="kicker">${esc(w.kicker)}</p>
      <h2 id="why-title">${esc(w.title)}</h2>
      <p>${esc(w.body)}</p>
    </header>
    <div class="why__grid">
      <ul class="why__points" role="list">
        ${w.points.map((p) => `<li class="why__point" data-reveal>
          <span class="why__icon">${icon(p.icon)}</span>
          <div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>
        </li>`).join('\n        ')}
      </ul>
      <div class="why__calc" data-reveal>
        ${calculator(ctx)}
      </div>
    </div>
    <p class="why__calm" data-reveal>${icon('sun')}<span>${esc(w.calm)}</span></p>
  </div>
</section>`;
}

function services(ctx) {
  const { t } = ctx;
  const s = t.services;
  const faces = ['', 'stamp__face--river', 'stamp__face--alpine', 'stamp__face--terra'];
  return `<section class="section section--sand services" id="${t.ids.services}" data-key="services" aria-labelledby="services-title">
  <div class="wrap">
    <header class="head" data-reveal>
      <p class="kicker">${esc(s.kicker)}</p>
      <h2 id="services-title">${esc(s.title)}</h2>
      <p>${esc(s.intro)}</p>
    </header>
    <div class="services__grid">
      ${s.items.map((item, i) => `<article class="svc" data-reveal>
        <div class="svc__top">
          ${stamp(icon(item.icon), { cls: 'svc__stamp', face: faces[i % faces.length] })}
        </div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.body)}</p>
        <ul class="ticks" role="list">
          ${item.points.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}
        </ul>
      </article>`).join('\n      ')}
      <article class="svc svc--addon" data-reveal>
        ${stamp(icon('tour'), { cls: 'svc__stamp', face: 'stamp__face--sun' })}
        <div>
          <p class="svc__kicker">${esc(s.addon.kicker)}</p>
          <h3>${esc(s.addon.title)}</h3>
          <p>${esc(s.addon.body)}</p>
        </div>
      </article>
    </div>
  </div>
</section>`;
}

function miniSite(ctx, demo, d, { phone = false } = {}) {
  const img = picture(ctx, demo.hero, { sizes: phone ? '7rem' : '(min-width: 62em) 22rem, 80vw', alt: '' });
  return `<div class="mini${phone ? ' mini--phone' : ''}">
          <div class="mini__nav"><b>${esc(d.name)}</b>${phone ? '<i></i>' : '<i></i><i></i><i></i><em></em>'}</div>
          <div class="mini__hero">${img}
            <div class="mini__text"><span class="mini__greet">${esc(d.greeting)}</span><span class="mini__name">${esc(d.name)}</span><span class="mini__btn"></span></div>
          </div>
          <div class="mini__rows"><i></i><i></i><i></i></div>
        </div>`;
}

function examples(ctx) {
  const { t, site } = ctx;
  const e = t.examples;
  const tilt = ['-1.4deg', '1deg', '-0.6deg'];
  return `<section class="section examples" id="${t.ids.examples}" data-key="examples" aria-labelledby="examples-title">
  <div class="wrap">
    <header class="head" data-reveal>
      <p class="kicker">${esc(e.kicker)}</p>
      <h2 id="examples-title">${esc(e.title)}</h2>
      <p>${esc(e.intro)}</p>
    </header>
    <ul class="demos" role="list">
      ${site.demos.map((demo, i) => {
        const d = t.demo.items[demo.slug];
        const path = `${t.paths.demos}${demo.slug}/`;
        return `<li class="demo-card theme-${demo.theme} tilt-${i % 3}" data-reveal>
        <div class="devices" aria-hidden="true">
          <div class="device device--desktop">
            <div class="device__bar"><i></i><i></i><i></i><span>${esc(path)}</span></div>
            ${miniSite(ctx, demo, d)}
          </div>
          <div class="device device--phone">
            ${miniSite(ctx, demo, d, { phone: true })}
          </div>
        </div>
        <div class="demo-card__body">
          ${stamp(esc(e.badge), { cls: 'demo-card__stamp' })}
          <p class="demo-card__greet">${esc(d.greeting)}</p>
          <h3 class="demo-card__name"><a href="${path}">${esc(d.name)}</a></h3>
          <p class="demo-card__place">${esc(d.place)}</p>
          <p class="demo-card__open" aria-hidden="true">${esc(e.open)}${icon('arrow')}</p>
        </div>
      </li>`;
      }).join('\n      ')}
    </ul>
    <p class="examples__notice">${icon('info')}<span>${esc(e.notice)}</span></p>
  </div>
</section>`;
}

function process(ctx) {
  const { t } = ctx;
  const p = t.process;
  return `<section class="section section--sand process" id="${t.ids.process}" data-key="process" aria-labelledby="process-title">
  <div class="wrap">
    <header class="head" data-reveal>
      <p class="kicker">${esc(p.kicker)}</p>
      <h2 id="process-title">${esc(p.title)}</h2>
      <p>${esc(p.intro)}</p>
    </header>
    <ol class="route" role="list">
      ${p.steps.map((s, i) => `<li class="route__stop" data-reveal>
        <span class="route__num" aria-hidden="true">${i + 1}</span>
        <h3><span class="sr-only">${i + 1}. </span>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
}

function pricing(ctx) {
  const { t, site } = ctx;
  const p = t.pricing;
  const anyPlaceholder = Object.entries(site.prices).some(([k, v]) => !k.startsWith('_') && isPlaceholder(v));
  return `<section class="section pricing" id="${t.ids.pricing}" data-key="pricing" aria-labelledby="pricing-title">
  <div class="wrap">
    <header class="head" data-reveal>
      <p class="kicker">${esc(p.kicker)}</p>
      <h2 id="pricing-title">${esc(p.title)}</h2>
      <p>${esc(p.intro)}</p>
    </header>
    <div class="tickets">
      ${p.packages.map((pkg) => {
        const links = contactLinks(ctx, { subject: fill(p.emailSubject, { name: pkg.name }) });
        return `<article class="ticket${pkg.featured ? ' ticket--featured' : ''}" data-reveal>
        <div class="ticket__head">
          ${pkg.featured ? `<p class="ticket__badge">${icon('sun')}${esc(p.recommended)}</p>` : ''}
          <h3 class="ticket__name">${esc(pkg.name)}</h3>
          <p class="ticket__for">${esc(pkg.for)}</p>
          <p class="price"><span class="price__amount">${value(ctx, site.prices[pkg.id], { tag: false })}</span> <span class="price__note">${esc(p.oneOff)}</span></p>
        </div>
        <div class="ticket__tear" aria-hidden="true"></div>
        <div class="ticket__body">
          <ul class="ticks" role="list">
            ${pkg.features.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('\n            ')}
          </ul>
          <a class="btn ${pkg.featured ? 'btn--sun' : 'btn--ghost'} btn--block" href="${esc(links.email)}">${esc(p.cta)}${icon('arrow', 'icon--arrow')}</a>
        </div>
      </article>`;
      }).join('\n      ')}
    </div>
    <p class="pricing__care">${icon('info')}<span>${fill(esc(p.care), { price: value(ctx, site.prices.care, { tag: false }) })}</span></p>
    ${anyPlaceholder ? `<p class="pricing__pending"><span class="ph-tag">${esc(t.ui.placeholder)}</span> ${esc(p.pending)}</p>` : ''}
  </div>
</section>`;
}

function faq(ctx) {
  const { t } = ctx;
  const f = t.faq;
  const links = contactLinks(ctx);
  return `<section class="section section--sand faq" id="${t.ids.faq}" data-key="faq" aria-labelledby="faq-title">
  <div class="wrap faq__grid">
    <div class="faq__intro" data-reveal>
      <header class="head">
        <p class="kicker">${esc(f.kicker)}</p>
        <h2 id="faq-title">${esc(f.title)}</h2>
      </header>
      <p class="faq__aside">${esc(f.aside)} <a class="link-arrow" href="${esc(links.email)}">${esc(f.asideLink)}${icon('arrow')}</a></p>
    </div>
    <div class="faq__list" data-reveal>
      ${f.items.map((item) => {
        if (item.confirm) ctx.report.drafts.add(item.q);
        return `<details class="qa">
        <summary><span>${esc(item.q)}</span>${icon('plus')}</summary>
        <div class="qa__a"><p>${esc(item.a)}${item.confirm ? `<span class="draft-tag">${esc(t.ui.draft)}</span>` : ''}</p></div>
      </details>`;
      }).join('\n      ')}
    </div>
  </div>
</section>`;
}

function testimonials(ctx) {
  const { t, site } = ctx;
  if (!site.testimonials.enabled || !site.testimonials.items.length) return '';
  const tt = t.testimonials;
  return `<section class="section testimonials" id="${t.ids.testimonials}" data-key="testimonials" aria-labelledby="testimonials-title">
  <div class="wrap">
    <header class="head"><p class="kicker">${esc(tt.kicker)}</p><h2 id="testimonials-title">${esc(tt.title)}</h2></header>
    <div class="quotes">
      ${site.testimonials.items.map((q) => `<figure class="quote postcard"><blockquote><p>${esc(q.quote?.[ctx.lang] ?? q.quote)}</p></blockquote><figcaption>${esc(q.name)}${q.place ? ` · ${esc(q.place)}` : ''}</figcaption></figure>`).join('')}
    </div>
  </div>
</section>`;
}

function contact(ctx) {
  const { t, site } = ctx;
  const c = t.contact;
  const links = contactLinks(ctx);
  const pending = ['email', 'phone', 'whatsapp'].some((k) => isPlaceholder(site.contact[k]));
  const line = (key, ic, label, shown, extra = '') => `<li><a class="line-btn" href="${esc(links[key])}"${extra}>
            <span class="line-btn__icon">${icon(ic)}</span>
            <span class="line-btn__text"><span class="line-btn__label">${esc(label)}</span><span class="line-btn__value">${value(ctx, shown, { tag: false })}</span></span>
            ${icon('arrow', 'line-btn__arrow')}
          </a></li>`;
  return `<section class="section contact" id="${t.ids.contact}" data-key="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <div class="postcard letter" data-reveal>
      <div class="letter__msg">
        <p class="kicker">${esc(c.kicker)}</p>
        <h2 id="contact-title">${esc(c.title)}</h2>
        <p>${esc(c.body)}</p>
        <p class="letter__sign">— ${esc(c.sign)}</p>
      </div>
      <div class="letter__addr">
        <div class="letter__marks">${postmark(c.postmark)}${stamp(esc(c.stamp), { cls: 'letter__stamp' })}</div>
        <ul class="letter__lines" role="list">
          ${line('email', 'mail', c.email, site.contact.email)}
          ${line('phone', 'call', c.phone, site.contact.phone)}
          ${line('whatsapp', 'chat', c.whatsapp, site.contact.whatsapp, ' target="_blank" rel="noopener"')}
        </ul>
        ${pending ? `<p class="letter__pending"><span class="ph-tag">${esc(t.ui.placeholder)}</span> ${esc(c.pending)}</p>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

export function renderHome(ctx) {
  const { t } = ctx;
  const body = `${header(ctx)}
<main id="main">
${hero(ctx)}
${why(ctx)}
${services(ctx)}
${examples(ctx)}
${process(ctx)}
${pricing(ctx)}
${faq(ctx)}
${testimonials(ctx)}
${contact(ctx)}
</main>
${footer(ctx)}`;
  return document(ctx, {
    title: t.meta.title,
    description: t.meta.description,
    body,
    bodyClass: 'home has-fixed-header',
    path: ctx.homeUrl,
    styles: ctx.css(['tokens', 'base', 'home']),
    preload: ctx.preloadFonts(),
  });
}
