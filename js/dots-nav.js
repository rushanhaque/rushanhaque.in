/*! dots-nav.js — Rushan Haque portfolio
 *  Three-dot nav (mobile) + desktop quick-actions dropdown. */
(function () {
  'use strict';

  // Update these hrefs to match your live URLs.
  var QUICK_ACTIONS = [
    { label: 'Write a review',   href: '/review'  },
    { label: 'View certificate', href: '/certificates' },
    { label: 'Schedule a call',  href: 'https://cal.com/rushan-haque-emssbo/call' },
  ];

  /* ── mobile dots menu ──────────────────────────────────────── */
  function initMobileMenu() {
    var root = document.querySelector('.rh-dots');
    if (!root) return;

    var btn  = root.querySelector('.rh-dots__btn');
    var menu = root.querySelector('.rh-dots__menu');
    if (!btn || !menu) return;

    function open()  { root.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    function close() { root.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    function toggle() { if (root.classList.contains('is-open')) close(); else open(); }

    btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggle(); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) close(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('.rh-dots__link')) close(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 992) close(); });

    /* inject separator + quick-action links */
    var sep = document.createElement('div');
    sep.className = 'rh-dots__sep';
    menu.appendChild(sep);

    QUICK_ACTIONS.forEach(function (action) {
      var a = document.createElement('a');
      a.className = 'rh-dots__link rh-dots__link--action';
      a.href = action.href;
      a.textContent = action.label;
      menu.appendChild(a);
    });

    /* mark the current page (runs after all links are in the DOM) */
    var here = location.pathname.replace(/\/$/, '') || '/';
    Array.prototype.forEach.call(menu.querySelectorAll('.rh-dots__link'), function (a) {
      var href = a.getAttribute('href').replace(/\/$/, '') || '/';
      if (href === here) a.classList.add('is-active');
    });
  }

  /* ── desktop quick-actions ─────────────────────────────────── */
  function initDesktopQuick() {
    var header = document.querySelector('.mxd-header');
    if (!header) return;

    /* build component */
    var quick = document.createElement('div');
    quick.className = 'rh-quick';

    var btnEl = document.createElement('button');
    btnEl.className = 'rh-quick__btn';
    btnEl.type = 'button';
    btnEl.setAttribute('aria-label', 'Quick actions');
    btnEl.setAttribute('aria-expanded', 'false');
    btnEl.setAttribute('aria-controls', 'rh-quick-menu');
    btnEl.innerHTML = '<span></span><span></span><span></span>';

    var menuEl = document.createElement('div');
    menuEl.className = 'rh-quick__menu';
    menuEl.id = 'rh-quick-menu';

    QUICK_ACTIONS.forEach(function (action) {
      var a = document.createElement('a');
      a.className = 'rh-quick__link';
      a.href = action.href;
      a.textContent = action.label;
      menuEl.appendChild(a);
    });

    quick.appendChild(btnEl);
    quick.appendChild(menuEl);

    /* insert before rh-dots (which is display:none on desktop) */
    var dots = document.querySelector('.rh-dots');
    if (dots) header.insertBefore(quick, dots);
    else       header.appendChild(quick);

    /* behaviour */
    function openQ()   { quick.classList.add('is-open'); btnEl.setAttribute('aria-expanded', 'true'); }
    function closeQ()  { quick.classList.remove('is-open'); btnEl.setAttribute('aria-expanded', 'false'); }
    function toggleQ() { quick.classList.contains('is-open') ? closeQ() : openQ(); }

    btnEl.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggleQ(); });
    document.addEventListener('click', function (e) { if (!quick.contains(e.target)) closeQ(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.keyCode === 27) closeQ(); });
    menuEl.addEventListener('click', function (e) { if (e.target.closest('.rh-quick__link')) closeQ(); });
    window.addEventListener('resize', function () { if (window.innerWidth < 992) closeQ(); });
  }

  function init() {
    initMobileMenu();
    initDesktopQuick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
