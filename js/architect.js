/*! ------------------------------------------------
 * File name: architect.js
 * Project:   Rushan Haque — Portfolio
 *
 * The small amount of behaviour the drafting-sheet design needs that
 * CSS cannot express. Everything here is deliberately cheap:
 *
 *   · the reading rail and the loader bar are driven off the GSAP
 *     ticker that Lenis already runs on, so no second rAF loop and no
 *     `scroll` listener competing with ScrollTrigger
 *   · every write is a transform, never a layout property
 *   · reveals use IntersectionObserver, not scroll position
 *   · magnetic hover is desktop-only and unsubscribes on leave
 *
 * Loaded after app.js so `gsap` is available; degrades to rAF if not.
 * ------------------------------------------------ */
(function () {
  'use strict';

  var still = window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* One shared per-frame subscription. Lenis swallows the native scroll
     event, so anything that needs scroll position has to be sampled on
     the ticker Lenis drives. Batching every sampler into a single
     callback keeps that to one subscription total. */
  var frameJobs = [];
  function onFrame(fn) { frameJobs.push(fn); }
  function pump() {
    for (var i = 0; i < frameJobs.length; i++) frameJobs[i]();
  }
  function startPump() {
    if (window.gsap && window.gsap.ticker) {
      window.gsap.ticker.add(pump);
    } else {
      (function tick() { pump(); requestAnimationFrame(tick); })();
    }
  }

  /* ============================================================
     Reading rail — a hairline filling down the left edge
     ============================================================ */
  function initRail() {
    var fill = document.querySelector('.a-rail__fill');
    var rail = document.querySelector('.a-rail');
    if (!fill || !rail || still) return;

    var last = -1;
    onFrame(function () {
      var doc = document.documentElement;
      var max = (doc.scrollHeight || 0) - window.innerHeight;
      if (max <= 0) return;

      var y = window.scrollY || doc.scrollTop || 0;
      /* quantised to 1/500th so we skip the write on most frames */
      var p = Math.round(Math.min(1, Math.max(0, y / max)) * 500) / 500;
      if (p === last) return;
      last = p;

      fill.style.transform = 'scaleY(' + p + ')';
      rail.classList.toggle('is-live', p > 0.005);
    });
  }

  /* ============================================================
     Local clock — the "where and when" half of the hero title block
     ============================================================ */
  function initClock() {
    var els = document.querySelectorAll('.a-clock');
    if (!els.length) return;

    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      /* environment without full ICU — fall back to the +5:30 offset */
      fmt = null;
    }

    function paint() {
      var text;
      if (fmt) {
        text = fmt.format(new Date());
      } else {
        var d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
        text = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      }
      for (var i = 0; i < els.length; i++) {
        if (els[i].textContent !== text) els[i].textContent = text;
      }
    }

    paint();
    /* a clock showing minutes needs one tick a minute, nothing more */
    setInterval(paint, 20000);
  }

  /* ============================================================
     Reveals — for the blocks the template's own GSAP hooks don't cover
     ============================================================ */
  /* Reveal everything, unconditionally. The safety valve for every path
     below: content is never allowed to stay invisible because an
     animation did not run. */
  function revealAll() {
    var t = document.querySelectorAll('.a-reveal');
    for (var i = 0; i < t.length; i++) t[i].classList.add('is-in');
    var r = document.querySelectorAll('.a-index__rule');
    for (var j = 0; j < r.length; j++) r[j].style.transform = 'scaleX(1)';
  }

  function initReveals() {
    var targets = document.querySelectorAll('.a-reveal');
    if (!targets.length) return;

    if (still || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    /* The hidden start state lives behind `.a-js`, which is stamped here
       and nowhere else. If this file never runs — blocked, errored, or
       an old browser — the class is absent, the `.a-reveal` rule never
       matches, and the content is simply visible. Hiding content in a
       stylesheet and relying on script to bring it back is how a
       JavaScript error turns into a blank section. */
    document.documentElement.classList.add('a-js');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        /* per-element stagger, set from data-reveal-delay in the markup */
        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-reveal-delay') || '0');
        if (delay) el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);

    /* Belt and braces: if anything has still not been revealed after
       three seconds — a throttled background tab, a compositor that
       never delivered an intersection record — show it anyway. */
    setTimeout(revealAll, 3000);
  }

  /* ============================================================
     Loader bar — mirrors the counter app.js is already animating
     ============================================================ */
  function initLoaderBar() {
    var fill = document.querySelector('.a-load__fill');
    var count = document.querySelector('.count__text');
    var loader = document.querySelector('.mxd-loader');
    if (!fill || !count || !loader) return;
    /* app.js sets display:flex only when the loader will actually run */
    if (getComputedStyle(loader).display === 'none') return;

    var last = -1;
    (function tick() {
      if (!loader.isConnected || loader.style.display === 'none') return;
      var v = parseInt(count.textContent, 10);
      if (!isNaN(v) && v !== last) {
        last = v;
        fill.style.transform = 'scaleX(' + (v / 100) + ')';
      }
      requestAnimationFrame(tick);
    })();
  }

  /* NOTE: this file used to add a magnetic hover to `.a-cta` — the pill
     leaning a few pixels toward the cursor. Buttons on this site are now
     static by design, so that behaviour is gone rather than disabled;
     css/sections.css section 18c enforces the same rule for every other
     button on the site. */

  /* ============================================================
     Section index rules — draw in as each section arrives
     ============================================================ */
  function initIndexRules() {
    var rules = document.querySelectorAll('.a-index__rule');
    if (!rules.length) return;

    if (still || !('IntersectionObserver' in window)) return;

    Array.prototype.forEach.call(rules, function (r) {
      r.style.transform = 'scaleX(0)';
      r.style.transition = 'transform 1s cubic-bezier(0.32, 0.72, 0, 1)';
    });

    /* threshold 0, deliberately. These rules are 1px tall, and asking for
       50% of a 1px box to intersect is a coin flip once sub-pixel layout
       and device pixel ratio are involved — a rule that never fires stays
       at scaleX(0), i.e. invisible. Any intersection at all is the right
       trigger for a line that is about to be drawn. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.transform = 'scaleX(1)';
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(rules, function (r) { io.observe(r); });
  }

  function init() {
    initRail();
    initClock();
    initReveals();
    initLoaderBar();
    initIndexRules();
    if (frameJobs.length) startPump();
  }

  /* Every script on the page is `defer`, so this file executes while
     readyState is still "interactive" — before DOMContentLoaded, and
     therefore before app.js's own DOMContentLoaded handler has decided
     whether the loader runs. Waiting for the event puts this callback
     after app.js's (listeners fire in registration order, and app.js
     registered first), which is what initLoaderBar needs. */
  if (document.readyState === 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
