const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
if (toggle && nav) {
  document.documentElement.classList.add('js');
  const close = (returnFocus = false) => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', toggle.dataset.open);
    nav.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? toggle.dataset.close : toggle.dataset.open);
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) close(true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') close(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) close();
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.site-header')) close();
  });
  matchMedia('(min-width: 1050px)').addEventListener('change', () => close());
}
// Keep the current section when switching languages; real links also work without JS.
document.querySelectorAll('.language-switch a').forEach(link => {
  link.addEventListener('click', () => { if (location.hash) link.hash = location.hash; });
});
