import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
export const site = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const out = path.join(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Unsafe build output path');
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'assets'), { recursive: true });
const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = s => e(s).replaceAll('\n', '<br>');
const assets = {};
async function asset(file, directory = 'src') {
  const data = await readFile(path.join(root, directory, file));
  const ext = path.extname(file), name = path.basename(file, ext);
  const hash = createHash('sha256').update(data).digest('hex').slice(0, 10);
  const dest = `${name}.${hash}${ext}`;
  await writeFile(path.join(out, 'assets', dest), data);
  return `/assets/${dest}`;
}
assets.css = await asset('style.css');
assets.js = await asset('main.js');
assets.favicon = await asset('favicon.svg');
for (const name of await readdir(path.join(root, 'assets'))) {
  if (/\.(webp|jpg|woff2)$/.test(name) && !name.includes('original')) assets[name] = await asset(name, 'assets');
}
function pic(key, lang, { hero = false, sizes = '(max-width: 700px) 100vw, 50vw', cls = '' } = {}) {
  const img = site.images[key];
  const widths = [480, 900, 1600];
  const srcset = ext => widths.map(w => `${assets[`${img.file}-${w}.${ext}`]} ${w}w`).join(', ');
  if (!assets[`${img.file}-900.jpg`]) throw new Error(`Missing image ${img.file}. Run image preparation.`);
  return `<picture class="${cls}"><source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}"><img src="${assets[`${img.file}-900.jpg`]}" srcset="${srcset('jpg')}" sizes="${sizes}" alt="${e(img.alt[lang])}" width="1600" height="1200" ${hero ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"></picture>`;
}
const hrefHome = lang => lang === 'sl' ? '/' : `/${lang}/`;
const demoHref = (lang, slug) => `${hrefHome(lang)}demo/${slug}/`;
const arrow = '<span aria-hidden="true">↗</span>';
const btn = (text, href, extra = '') => `<a class="button ${extra}" href="${e(href)}">${e(text)}${arrow}</a>`;
const titleBlock = (h, extra = '') => `<div class="section-heading ${extra}"><p class="eyebrow">${e(h.label)}</p><h2>${lines(h.title)}</h2>${h.body ? `<p class="intro">${e(h.body)}</p>` : ''}</div>`;
function langLinks(lang, suffix = '') {
  return `<div class="language-switch" aria-label="${e(site.locales[lang].language)}">${Object.keys(site.locales).map(l => `<a class="${l === lang ? 'active' : ''}" href="${hrefHome(l)}${suffix}" lang="${l}" hreflang="${l}" ${l === lang ? 'aria-current="page"' : ''}>${l.toUpperCase()}</a>`).join('<span aria-hidden="true">/</span>')}</div>`;
}
function header(lang, suffix = '') {
  const c = site.locales[lang], home = hrefHome(lang);
  return `<a class="skip-link" href="#main">${e(c.skip)}</a><header class="site-header"><div class="header-inner"><a class="wordmark" href="${home}">${e(site.BRAND_NAME)}<span aria-hidden="true">.</span></a><button class="menu-toggle" aria-controls="navigation" aria-expanded="false" aria-label="${e(c.menu)}" data-open="${e(c.menu)}" data-close="${e(c.closeMenu)}"><span></span><span></span></button><nav id="navigation" aria-label="${e(c.menu)}">${c.nav.map((n, i) => `<a href="${home}#${['storitve','primeri','potek','paketi'][i]}">${e(n)}</a>`).join('')}${btn(c.cta, `${home}#kontakt`, 'header-cta')}</nav>${langLinks(lang, suffix)}</div></header>`;
}
function footer(lang) {
  const c = site.locales[lang];
  return `<footer class="footer wrap"><div class="footer-top"><div><a class="wordmark" href="${hrefHome(lang)}">${e(site.BRAND_NAME)}<span aria-hidden="true">.</span></a><p>${e(c.footerLine)}</p></div><div class="footer-links"><a href="${hrefHome(lang)}#kontakt">${e(c.footerContact)}</a>${langLinks(lang)}</div></div><div class="footer-bottom"><a href="https://matejdoljak.com" target="_blank" rel="noopener noreferrer">${e(c.footerCredit)} ${arrow}</a><span>${e(c.footerDemo)}</span><span>© ${new Date().getFullYear()} ${e(site.BRAND_NAME)}</span></div></footer>`;
}
function head(lang, title, description, route) {
  const domain = site.domain.replace(/\/$/, '');
  const og = assets['interior-1600.jpg'];
  return `<!doctype html><html lang="${lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="theme-color" content="#faf8f3"><meta property="og:type" content="website"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:site_name" content="${e(site.BRAND_NAME)}"><meta property="og:locale" content="${lang === 'sl' ? 'sl_SI' : 'en_GB'}"><meta property="og:image" content="${domain}${og}"><meta property="og:image:alt" content="${e(site.images.interior.alt[lang])}">${domain ? `<link rel="canonical" href="${domain}${route}"><meta property="og:url" content="${domain}${route}">${Object.keys(site.locales).map(l => `<link rel="alternate" hreflang="${l}" href="${domain}${hrefHome(l)}${route.slice(hrefHome(lang).length)}">`).join('')}` : ''}<link rel="icon" type="image/svg+xml" href="${assets.favicon}"><link rel="stylesheet" href="${assets.css}"><script src="${assets.js}" defer></script></head><body>`;
}
function contact(lang) {
  const c = site.locales[lang];
  const destinations = {
    email: site.contact.email ? `mailto:${site.contact.email}?subject=${encodeURIComponent(c.emailSubject)}&body=${encodeURIComponent(c.emailBody)}` : '',
    phone: site.contact.phone ? `tel:${site.contact.phone.replace(/[^+\d]/g, '')}` : '',
    whatsapp: site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(c.whatsappMessage)}` : ''
  };
  return `<section id="kontakt" class="contact-section"><div class="wrap contact-grid">${titleBlock(c.contactHeading)}<div class="contact-actions"><p class="contact-note">${e(c.contactFree)}</p>${Object.entries(destinations).map(([kind, dest]) => dest ? `<a class="contact-link" href="${e(dest)}"><span>${e(c.contactLabels[kind])}<small>${e(site.contact[kind])}</small></span>${arrow}</a>` : `<div class="contact-link pending" aria-disabled="true"><span>${e(c.contactLabels[kind])}<small>${e(site.contact.placeholders[kind])}</small></span><span class="pending-label">${e(c.contactMissing)}</span></div>`).join('')}${Object.values(destinations).some(d => !d) ? `<p class="placeholder-note">${e(c.contactPending)}</p>` : ''}</div></div></section>`;
}
function serviceCard(s) { return `<article class="service-card"><p class="eyebrow">${e(s.tag)}</p><h3>${e(s.title)}</h3><p>${e(s.body)}</p></article>`; }
function landing(lang) {
  const c = site.locales[lang];
  const html = head(lang, c.meta.title, c.meta.description, hrefHome(lang)) + header(lang) + `<main id="main">
    <section class="hero"><div class="hero-copy"><p class="eyebrow">${e(c.eyebrow)}</p><h1>${c.hero.title.map((line,i) => `<span${i === 2 ? ' class="accent"' : ''}>${e(line)}</span>`).join('')}</h1><p class="hero-description">${e(c.hero.body)}</p><div class="hero-actions">${btn(c.cta, '#kontakt')}<a class="text-link" href="#primeri">${e(c.viewExamples)} <span aria-hidden="true">↓</span></a></div><p class="hero-note">${e(c.hero.note)}</p></div><div class="hero-visual">${pic('interior',lang,{hero:true,cls:'hero-photo'})}<span class="photo-label">${e(c.hero.photoLabel)}</span><div class="postcard"><span class="postcard-stamp" aria-hidden="true">VG</span><p>${lines(c.hero.postcard)}</p><span class="postcard-signature">${e(site.BRAND_NAME)}</span></div><span class="photo-caption">${e(c.hero.photoDisclaimer)}</span></div></section>
    <div class="promise-strip wrap">${c.strip.map((t,i) => `<span><span class="strip-number" aria-hidden="true">0${i+1}</span>${e(t)}</span>`).join('')}</div>
    <section class="problem wrap section"><div><p class="eyebrow">${e(c.problem.label)}</p><h2>${lines(c.problem.title)}</h2></div><div class="problem-copy"><p class="lead">${e(c.problem.body)}</p><p>${e(c.problem.detail)}</p><a class="text-link" href="#kontakt">${e(c.problem.link)} ${arrow}</a></div></section>
    <section id="storitve" class="services section"><div class="wrap">${titleBlock(c.servicesHeading)}<div class="service-grid">${c.services.map(serviceCard).join('')}</div><aside class="addon"><span class="addon-symbol" aria-hidden="true">360°</span><div><p class="eyebrow">${e(c.addon.label)}</p><h3>${e(c.addon.title)}</h3><p>${e(c.addon.body)}</p></div><a class="text-link" href="#kontakt">${e(c.addon.link)} ${arrow}</a></aside></div></section>
    <section id="primeri" class="examples section wrap"><div class="examples-heading">${titleBlock(c.examplesHeading)}<span class="editorial-note" aria-hidden="true">${e(c.editorialNote)}</span></div><div class="demo-grid">${c.demos.map((d,i) => `<article class="demo-card"><a class="demo-preview ${i ? 'sunlit' : 'lakehouse'}" href="${demoHref(lang,d.slug)}" aria-label="${e(c.demoOpen)}: ${e(d.name)}"><div class="browser-bar"><span aria-hidden="true">● ● ●</span><span>${e(c.demoLabel)}</span></div><div class="demo-scene">${pic(d.image,lang)}<div class="demo-scene-text"><p>${e(d.name)}</p><h3>${lines(d.heading)}</h3><span>${e(c.demoOpen)} ${arrow}</span></div></div></a><div class="demo-info"><div><h3>${e(d.name)}</h3><p>${e(d.tag)}</p></div><a class="circle-link" href="${demoHref(lang,d.slug)}" aria-label="${e(c.demoOpen)}: ${e(d.name)}">${arrow}</a></div></article>`).join('')}</div><p class="fine-print">${e(c.demoNotice)}</p></section>
    <section id="potek" class="process section"><div class="wrap">${titleBlock(c.processHeading)}<ol class="steps">${c.steps.map((s,i) => `<li><span class="step-number">0${i+1}</span><h3>${e(s.title)}</h3><p>${e(s.body)}</p></li>`).join('')}</ol></div></section>
    <section id="paketi" class="pricing section wrap">${titleBlock(c.pricingHeading)}<div class="price-grid">${c.packages.map((p,i) => `<article class="price-card ${i ? 'featured' : ''}">${i ? `<p class="package-ribbon">${e(c.recommended)}</p>` : ''}<h3>${e(p.name)}</h3><p>${e(p.description)}</p><div class="price"><span>${e(p.price)}</span><span class="eyebrow">${e(c.priceLabel)}</span></div><p class="fine-print">${e(c.priceSuffix)}</p><ul>${p.features.map(f => `<li>${e(f)}</li>`).join('')}</ul>${btn(c.packageCta,'#kontakt',i ? '' : 'button-outline')}</article>`).join('')}</div><p class="fine-print price-disclaimer">${e(c.pricingNote)}</p></section>
    <section class="faq section wrap">${titleBlock(c.faqHeading)}<div>${c.faq.map(f => `<details><summary>${e(f.q)}<span aria-hidden="true">+</span></summary><div class="faq-answer"><p>${e(f.a)}</p>${f.needsConfirmation ? `<small class="draft-note">${e(c.confirmation)}</small>` : ''}</div></details>`).join('')}</div></section>
    ${contact(lang)}</main>${footer(lang)}</body></html>`;
  return html;
}
async function save(route, html) { const file = path.join(out, route); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, html); }
for (const [lang,c] of Object.entries(site.locales)) {
  await save(`${hrefHome(lang)}index.html`, landing(lang));
  for (const d of c.demos) {
    const route = demoHref(lang,d.slug);
    await save(`${route}index.html`, head(lang,`${d.name} — ${c.demoLabel} | ${site.BRAND_NAME}`,d.body,route) + header(lang,`demo/${d.slug}/`) + `<main id="main" class="demo-page"><div class="demo-notice wrap"><span class="eyebrow">${e(c.demoLabel)}</span><a class="text-link" href="${hrefHome(lang)}#primeri">← ${e(c.demoBack)}</a></div><section class="demo-full-hero">${pic(d.image,lang,{hero:true,sizes:'100vw'})}<div><p>${e(d.name)}</p><h1>${lines(d.heading)}</h1></div></section><section class="section wrap demo-story"><p class="eyebrow">${e(d.name)}</p><h2>${e(d.tag)}</h2><p class="lead">${e(d.body)}</p><ul>${d.details.map(t=>`<li>${e(t)}</li>`).join('')}</ul><p class="fine-print">${e(c.demoNoBooking)}</p><h3>${e(c.demoBottom)}</h3>${btn(c.cta,`${hrefHome(lang)}#kontakt`)}</section></main>${footer(lang)}</body></html>`);
  }
  const s = c.style;
  await save(`${hrefHome(lang)}style-tile/index.html`, head(lang,`${s.title} | ${site.BRAND_NAME}`,s.body,`${hrefHome(lang)}style-tile/`) + header(lang,'style-tile/') + `<main id="main" class="style-tile wrap section"><p class="eyebrow">${e(site.BRAND_NAME)}</p><h1>${e(s.title)}</h1><p class="lead">${e(s.body)}</p><h2>${e(s.palette)}</h2><div class="swatches">${['paper','ink','accent','blue','sand'].map(t=>`<div class="swatch ${t}"><span>${t}</span></div>`).join('')}</div><h2>${e(s.typography)}</h2><p class="display-sample">${e(s.typeSample)}</p><p>${e(s.bodySample)}</p><h2>${e(s.buttons)}</h2><div class="hero-actions">${btn(c.cta,`${hrefHome(lang)}#kontakt`)}<a class="text-link" href="${hrefHome(lang)}#primeri">${e(c.viewExamples)} ${arrow}</a></div><h2>${e(s.card)}</h2>${serviceCard(c.services[0])}<h2>${e(s.image)}</h2><div class="tile-photo">${pic('interior',lang)}</div></main>${footer(lang)}</body></html>`);
}
const n = site.locales.sl.notFound;
await save('404.html', head('sl',`404 | ${site.BRAND_NAME}`,n.body,'/404.html') + header('sl') + `<main id="main" class="error-page wrap"><p class="eyebrow">${e(n.label)}</p><h1>${e(n.title)}</h1><p>${e(n.body)}</p>${btn(n.link,'/')}<p lang="en"><a class="text-link" href="/en/">${e(n.english)}</a></p></main>${footer('sl')}</body></html>`);
for (const file of ['_headers','_redirects']) await copyFile(path.join(root,'public',file),path.join(out,file));
await save('robots.txt', `User-agent: *\nAllow: /\n${site.domain ? `Sitemap: ${site.domain.replace(/\/$/,'')}/sitemap.xml\n` : ''}`);
if (site.domain) await save('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(site.locales).map(l=>`<url><loc>${e(site.domain.replace(/\/$/,''))}${hrefHome(l)}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(out,'asset-manifest.json'),JSON.stringify(assets,null,2));
console.log(`Built ${Object.keys(site.locales).join(', ')} landing pages, demos, style tiles and 404 → dist/`);

