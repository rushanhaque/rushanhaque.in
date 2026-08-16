/*! flicker.js — Rushan Haque portfolio
 *  Rapidly cycles the typeface of any .rh-flicker element.
 *  The word is locked to the widest face up front so the surrounding
 *  line never reflows while the faces swap. */
(function () {
  'use strict';

  var FACES = [
    { f: '"Manrope", sans-serif',                              s: 'normal',  w: '700' },
    { f: 'Georgia, serif',                                     s: 'italic',  w: '400' },
    { f: '"JetBrains Mono", monospace',                        s: 'normal',  w: '400' },
    { f: '"Times New Roman", Times, serif',                    s: 'italic',  w: '700' },
    { f: '"Courier New", Courier, monospace',                  s: 'normal',  w: '700' },
    { f: '"Trebuchet MS", sans-serif',                         s: 'italic',  w: '400' },
    { f: 'Impact, Haettenschweiler, sans-serif',               s: 'normal',  w: '900' },
    { f: '"Brush Script MT", "Segoe Script", cursive',         s: 'normal',  w: '400' },
    { f: 'Verdana, Geneva, sans-serif',                        s: 'normal',  w: '700' },
    { f: '"Palatino Linotype", "Book Antiqua", Palatino, serif', s: 'italic', w: '400' },
    { f: '"Garamond", "Baskerville", serif',                   s: 'italic',  w: '400' },
    { f: '"Lucida Sans Unicode", "Lucida Grande", sans-serif', s: 'normal',  w: '300' },
    { f: '"Arial Black", "Arial Bold", Gadget, sans-serif',    s: 'normal',  w: '900' },
    { f: '"Comic Sans MS", "Comic Sans", cursive',             s: 'normal',  w: '400' },
    { f: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif',   s: 'italic',  w: '600' },
    { f: '"Didot", "Bodoni MT", "Playfair Display", serif',    s: 'italic',  w: '700' },
    { f: '"Futura", "Century Gothic", "Trebuchet MS", sans-serif', s: 'normal', w: '700' },
    { f: '"Rockwell", "Courier Bold", Courier, serif',         s: 'normal',  w: '700' },
    { f: '"Baskerville", "Baskerville Old Face", serif',       s: 'italic',  w: '400' },
    { f: '"Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif', s: 'normal', w: '500' }
  ];

  var INTERVAL = 80; // ms between faces

  function applyFace(el, face) {
    el.style.fontFamily  = face.f;
    el.style.fontStyle   = face.s;
    el.style.fontWeight  = face.w;
  }

  function start(el) {
    // reserve the widest box so the line holds still
    var widest = 0;
    for (var i = 0; i < FACES.length; i++) {
      applyFace(el, FACES[i]);
      var w = el.getBoundingClientRect().width;
      if (w > widest) widest = w;
    }
    applyFace(el, FACES[0]);
    /* +8px buffer absorbs italic overhang so the surrounding text never shifts */
    if (widest) el.style.width = (Math.ceil(widest) + 8) + 'px';

    var prev = -1;
    setInterval(function () {
      if (document.hidden) return;
      var n;
      do { n = Math.floor(Math.random() * FACES.length); } while (n === prev);
      prev = n;
      applyFace(el, FACES[n]);
    }, INTERVAL);
  }

  function init() {
    var els = document.querySelectorAll('.rh-flicker');
    if (!els.length) return;

    // a fast strobe is exactly what reduced-motion users opt out of
    var still = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    for (var i = 0; i < els.length; i++) {
      if (still) {
        applyFace(els[i], FACES[1]);
      } else {
        start(els[i]);
      }
    }
  }

  function boot() {
    // measure against the real webfonts, not the fallbacks
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
