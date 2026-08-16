/*! cordes.js — Rushan Haque portfolio
 *  Pluckable-string rows, ported from the Maison Quinté "Cordes" section.
 *  Drag a string down/up and release — it rings, and the label rides the wave.
 *  Silent (no audio) and reduced-motion aware. */
(function () {
  'use strict';

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function strokeColor() {
    // read the theme's ink colour so it works in light and dark
    var rgb = getComputedStyle(document.documentElement)
                .getPropertyValue('--base-opp-rgb').trim() || '15, 15, 15';
    return 'rgba(' + rgb + ', 0.42)';
  }

  function init() {
    var rows = [].slice.call(document.querySelectorAll('.rh-corde'));
    if (!rows.length) return;

    var states = [];

    rows.forEach(function (row, idx) {
      var strip = row.querySelector('.rh-corde__strip');
      var info  = row.querySelector('.rh-corde__info');
      if (!strip || !info) return;

      var cnv = document.createElement('canvas');
      strip.appendChild(cnv);

      var st = {
        cnv: cnv, ctx: cnv.getContext('2d'), info: info, idx: idx,
        w: 0, h: 0, dpr: 1, mode: 'idle', px: 0, pull: 0, A: 0, raf: 0
      };
      states.push(st);

      function restY() { return st.h * 0.5; }

      function shape(x, px, w) {
        return Math.sin(Math.PI * x / w) *
               (0.35 + 0.65 * Math.exp(-Math.pow(x - px, 2) / (2 * Math.pow(w * 0.2, 2))));
      }

      function draw(dispFn) {
        var ctx = st.ctx, w = st.w, h = st.h;
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = strokeColor();
        ctx.lineWidth = 1.2 * st.dpr;
        ctx.beginPath();
        for (var s = 0; s <= 30; s++) {
          var x = w * s / 30;
          var y = restY() + (dispFn ? dispFn(x) : 0);
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      st.draw = draw;

      function ring() {
        var w = st.w, px = st.px, A = st.A;
        var fv = 3 + st.idx * 0.45;
        var t0 = performance.now();
        cancelAnimationFrame(st.raf);
        st.mode = 'ring';
        (function vib(now) {
          var t = (now - t0) / 1000;
          var amp = A * Math.exp(-3.4 * t);
          if (Math.abs(amp) < 0.5) {
            st.mode = 'idle';
            draw(null);
            st.info.style.transform = '';
            return;
          }
          var dispFn = function (x) {
            return amp * Math.cos(2 * Math.PI * fv * t) * shape(x, px, w);
          };
          draw(dispFn);
          st.info.style.transform =
            'translateY(' + (dispFn(w * 0.5) / st.dpr * 0.25).toFixed(2) + 'px)';
          st.raf = requestAnimationFrame(vib);
        })(t0);
      }

      st.pluck = function (a) {
        st.px = st.w * 0.35;
        st.A = a * st.dpr;
        if (!RM) ring();
      };

      if (!COARSE && !RM) {
        strip.addEventListener('pointermove', function (e) {
          var r = strip.getBoundingClientRect();
          st.px = (e.clientX - r.left) * st.dpr;
          st.pull = clamp(((e.clientY - r.top) * st.dpr) - restY(), -16 * st.dpr, 16 * st.dpr);
          if (st.mode !== 'drag') { cancelAnimationFrame(st.raf); st.mode = 'drag'; }
          draw(function (x) {
            return st.pull *
              Math.exp(-Math.pow(x - st.px, 2) / (2 * Math.pow(st.w * 0.16, 2))) *
              Math.sin(Math.PI * x / st.w) * 1.1;
          });
        }, { passive: true });

        strip.addEventListener('pointerleave', function () {
          if (st.mode === 'drag' && Math.abs(st.pull) > 2.5 * st.dpr) {
            st.A = st.pull;
            ring();
          } else {
            st.mode = 'idle';
            draw(null);
          }
        });
      }
    });

    function sizeAll() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      states.forEach(function (st) {
        var r = st.cnv.getBoundingClientRect();
        if (!r.width) return;
        st.dpr = dpr;
        st.w = st.cnv.width  = Math.round(r.width * dpr);
        st.h = st.cnv.height = Math.round(r.height * dpr);
        st.draw(null);
      });
    }
    sizeAll();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(sizeAll, 180);
    });

    /* gentle strum when the block first scrolls into view */
    if (!RM && 'IntersectionObserver' in window) {
      var host = rows[0].closest('.rh-cordes') || rows[0].parentNode;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          io.disconnect();
          states.forEach(function (st, i) {
            setTimeout(function () { st.pluck(9); }, 400 + i * 150);
          });
        });
      }, { threshold: 0.35 });
      io.observe(host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
