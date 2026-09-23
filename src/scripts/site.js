// Več gostov — the only script on the site. Everything works without it;
// this adds the mobile menu, scroll reveal, soft parallax and the calculator.
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  root.classList.add('js');

  // ---- Header: shadow once the page has scrolled ---------------------------
  const header = document.querySelector('[data-header]');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // ---- Mobile menu ---------------------------------------------------------
  const button = document.querySelector('[data-menu-button]');
  const nav = button && document.getElementById(button.getAttribute('aria-controls'));
  if (button && nav && header) {
    const label = button.querySelector('[data-menu-label]');
    const desktop = window.matchMedia('(min-width: 62em)');
    const setOpen = (open, { focusButton = false } = {}) => {
      header.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? button.dataset.labelClose : button.dataset.labelOpen;
      document.body.classList.toggle('menu-open', open);
      if (open) {
        const first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (focusButton) {
        button.focus();
      }
    };
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) setOpen(false, { focusButton: true });
    });
    // Keep keyboard focus inside the open menu.
    header.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !header.classList.contains('is-open')) return;
      const items = [...header.querySelectorAll('a[href], button')].filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (header.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
    });
    desktop.addEventListener('change', () => setOpen(false));
  }

  // ---- Language switch keeps your place on the page -------------------------
  document.querySelectorAll('[data-lang-switch]').forEach((link) => {
    link.addEventListener('click', () => {
      let ids;
      try { ids = JSON.parse(link.dataset.ids || '{}'); } catch { return; }
      const sections = [...document.querySelectorAll('[data-key]')];
      const line = window.innerHeight * 0.35;
      let current = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.dataset.key;
      if (current && ids[current]) link.hash = ids[current];
    });
  });

  // ---- Reveal on scroll (only for elements that start below the fold) ------
  const revealables = [...document.querySelectorAll('[data-reveal]')];
  if (!reduceMotion.matches && 'IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    const fold = window.innerHeight;
    revealables.forEach((el) => {
      if (el.getBoundingClientRect().top < fold * 0.92) return; // already on screen: leave it alone
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
      const i = siblings.indexOf(el);
      if (i > 0) el.style.setProperty('--reveal-delay', `${Math.min(i, 4) * 90}ms`);
      el.classList.add('reveal-ready');
      io.observe(el);
    });
  }

  // ---- Soft parallax: hero photo, the lake postcard and the footer ridges --
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const landscape = document.querySelector('.landscape');
  const ridges = landscape ? [...landscape.querySelectorAll('[data-depth]')] : [];
  if (!reduceMotion.matches && (layers.length || ridges.length)) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      // Hero layers sit at the top of the page, so the offset is simply the
      // distance scrolled: nothing moves until the visitor scrolls.
      const y = Math.max(0, window.scrollY);
      for (const el of layers) {
        const box = el.parentElement.getBoundingClientRect();
        if (box.bottom < 0) continue;
        const speed = parseFloat(el.dataset.parallax) || 0;
        el.style.setProperty('--parallax', `${(y * speed).toFixed(1)}px`);
      }
      if (landscape) {
        const box = landscape.getBoundingClientRect();
        if (box.bottom >= 0 && box.top <= vh) {
          const progress = Math.min(1, Math.max(0, (vh - box.top) / (vh * 0.9)));
          for (const g of ridges) {
            const depth = parseFloat(g.dataset.depth) || 0;
            g.style.transform = `translateY(${((1 - progress) * depth * 38).toFixed(1)}px)`;
          }
        }
      }
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  // ---- Gentle 3D tilt on the lake postcard (desktop, mouse only) -----------
  const tilt = document.querySelector('[data-tilt]');
  if (tilt && finePointer.matches && !reduceMotion.matches) {
    const area = tilt.closest('section') || tilt;
    area.addEventListener('pointermove', (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      tilt.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
      tilt.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
    });
    area.addEventListener('pointerleave', () => {
      tilt.style.setProperty('--ry', '0deg');
      tilt.style.setProperty('--rx', '0deg');
    });
  }

  // ---- Commission calculator ------------------------------------------------
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const locale = calc.dataset.locale || 'sl-SI';
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' });
    const pct = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
    const inputs = Object.fromEntries([...calc.querySelectorAll('[data-calc-in]')].map((i) => [i.dataset.calcIn, i]));
    const outs = Object.fromEntries([...calc.querySelectorAll('[data-calc-out]')].map((o) => [o.dataset.calcOut, o]));
    const yearEl = calc.querySelector('[data-calc-result="year"]');
    const keepEl = calc.querySelector('[data-calc-result="keep"]');
    const template = calc.dataset.keepTemplate || '';
    const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const render = () => {
      const v = Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, Number(i.value)]));
      const labels = {
        price: money.format(v.price),
        nights: `${v.nights} ${calc.dataset.nightsUnit || ''}`.trim(),
        commission: pct.format(v.commission / 100),
        direct: pct.format(v.direct / 100),
      };
      for (const [k, text] of Object.entries(labels)) {
        if (outs[k]) outs[k].textContent = text;
        if (inputs[k]) {
          inputs[k].setAttribute('aria-valuetext', text);
          const [min, max] = [Number(inputs[k].min), Number(inputs[k].max)];
          inputs[k].style.setProperty('--fill', `${((v[k] - min) / (max - min)) * 100}%`);
        }
      }
      const year = v.price * v.nights * (v.commission / 100);
      const keep = year * (v.direct / 100);
      yearEl.textContent = money.format(year);
      keepEl.innerHTML = escapeHtml(template)
        .replace('{share}', `<strong>${escapeHtml(labels.direct)}</strong>`)
        .replace('{keep}', `<strong>${escapeHtml(money.format(keep))}</strong>`);
    };
    Object.values(inputs).forEach((i) => i.addEventListener('input', render));
    render();
  }
})();
