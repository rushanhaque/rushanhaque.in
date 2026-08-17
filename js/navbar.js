/*! navbar.js — Rushan Haque portfolio
 *  Adds the scrolled state to the fixed navbar and marks the current page. */
(function () {
  'use strict';

  function init() {
    var header = document.getElementById('header');
    if (!header) return;

    /* ---- solid background once scrolled, plus the landing-page reveal ---- */
    var reveals = header.classList.contains('rh-header-reveal');
    var lastScrolled = -1;
    var lastShown = -1;
    function sync() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;

      var scrolled = y > 24;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        header.classList.toggle('rh-scrolled', scrolled);
      }

      if (reveals) {
        var shown = y > 80;
        if (shown !== lastShown) {
          lastShown = shown;
          header.classList.toggle('rh-shown', shown);
        }
      }
    }
    // Lenis swallows the native scroll event, so drive this off the same
    // GSAP ticker Lenis runs on; the listeners are a no-Lenis fallback.
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(sync);
    } else {
      (function tick() {
        sync();
        window.requestAnimationFrame(tick);
      })();
    }
    sync();

    /* ---- mark the active nav item ---- */
    var path = window.location.pathname.split('/').pop().toLowerCase();
    if (!path) path = 'index.html';

    // pages that should light up the same nav item
    var groups = {
      'index.html': 'index.html',
      'index-personal-portfolio.html': 'index.html',
      'works-default.html': 'works-default.html',
      'works-grid.html': 'works-default.html',
      'works-grid-sticky.html': 'works-default.html',
      'project-details.html': 'works-default.html',
      'about-me.html': 'about-me.html',
      'contact.html': 'contact.html'
    };
    var current = groups[path] || path;

    var links = document.querySelectorAll('.rh-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute('href') || '').split('/').pop().toLowerCase();
      if (href === current) links[i].classList.add('is-active');
    }

    initPill(header);
  }

  /* ---- the sliding selection pill ---- */
  function initPill(header) {
    var list = header.querySelector('.rh-nav__list');
    if (!list) return;

    var links = list.querySelectorAll('.rh-nav__link');
    if (!links.length) return;

    var active = list.querySelector('.rh-nav__link.is-active') || links[0];

    var pill = document.createElement('span');
    pill.className = 'rh-nav__pill';
    list.appendChild(pill);
    list.classList.add('has-pill');

    // Both edges travel together at the same rate on a curve that does
    // not overshoot. The pill used to lead with one edge and lag with the
    // other on an overshooting bezier, so it stretched across the gap and
    // wobbled into the new slot — the same wobble that has been removed
    // from every button on the site.
    var LEAD = 320;
    var LAG = 320;
    var EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'; // decelerates, no overshoot

    var still = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function moveTo(el, animate) {
      var lb = list.getBoundingClientRect();
      var b = el.getBoundingClientRect();
      if (!lb.width || !b.width) return;

      var left = b.left - lb.left;
      var right = lb.right - b.right;
      var from = parseFloat(pill.style.left);

      if (!animate || still) {
        pill.style.transition = 'none';
      } else {
        var rightwards = !isNaN(from) && left > from;
        pill.style.transition =
          'left ' + (rightwards ? LAG : LEAD) + 'ms ' + EASE + ', ' +
          'right ' + (rightwards ? LEAD : LAG) + 'ms ' + EASE;
      }

      pill.style.left = left + 'px';
      pill.style.right = right + 'px';
    }

    function settle() { moveTo(active, true); }

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('mouseenter', (function (el) {
        return function () { moveTo(el, true); };
      })(links[i]));
      links[i].addEventListener('focus', (function (el) {
        return function () { moveTo(el, true); };
      })(links[i]));
    }
    list.addEventListener('mouseleave', settle);
    list.addEventListener('focusout', settle);

    window.addEventListener('resize', function () { moveTo(active, false); },
                            { passive: true });

    function place() {
      moveTo(active, false);
      // flush the jump before anything can animate from it
      void pill.offsetWidth;
      pill.classList.add('is-ready');
    }

    // the nav sits in a webfont, so measure only once the face is real
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(place);
    } else {
      place();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
