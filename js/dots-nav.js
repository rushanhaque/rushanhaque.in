/*! dots-nav.js — Rushan Haque portfolio
 *  The three-dot navigation in the header, mobile only.
 *  CSS hides the whole component at >=992px, so this stays inert there. */
(function () {
  'use strict';

  function init() {
    var root = document.querySelector('.rh-dots');
    if (!root) return;

    var btn  = root.querySelector('.rh-dots__btn');
    var menu = root.querySelector('.rh-dots__menu');
    if (!btn || !menu) return;

    function open()  {
      root.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      root.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      if (root.classList.contains('is-open')) close(); else open();
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    /* clicking anywhere else dismisses it */
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) close();
    });

    /* Escape dismisses it */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) close();
    });

    /* close on navigation so the panel is never left open mid-transition */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.rh-dots__link')) close();
    });

    /* if the viewport grows past the mobile breakpoint, drop the open state */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 992) close();
    });

    /* mark the current page */
    var here = location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(menu.querySelectorAll('.rh-dots__link'), function (a) {
      if (a.getAttribute('href') === here) a.classList.add('is-active');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
