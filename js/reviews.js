/*! reviews.js — Rushan Haque portfolio
 *  Handles the review submission form only.
 *  (The review CARDS are rendered by js/render.js, which must run before app.js
 *   so the template's card animations bind to them.)
 *
 *  SETUP: the send-to endpoint is configured once in js/form-config.js.
 *  Until it is set, the form opens the visitor's email app pre-filled. */
(function () {
  'use strict';

  /* Configured once in js/form-config.js */
  function endpoint() { return window.RH_FORM_ENDPOINT || ""; }
  function fallbackEmail() { return window.RH_CONTACT_EMAIL || 'rushanulhaque@gmail.com'; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------------- form ---------------- */
  function initForm() {
    var form = document.getElementById('rh-review-form');
    if (!form) return;

    var msg     = form.querySelector('.rh-form-msg');
    var submit  = form.querySelector('.rh-submit');
    var ratingI = form.querySelector('input[name="rating"]');
    var picker  = form.querySelector('.rh-stars-input');

    /* star picker */
    if (picker) {
      picker.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var val = parseInt(btn.getAttribute('data-value'), 10);
        ratingI.value = val;
        Array.prototype.forEach.call(picker.querySelectorAll('button'), function (b, i) {
          b.classList.toggle('is-on', i < val);
          b.setAttribute('aria-checked', i < val ? 'true' : 'false');
        });
      });
    }

    function say(text, kind) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'rh-form-msg' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      if (!String(data.get('name') || '').trim() || !String(data.get('review') || '').trim()) {
        say('Please add your name and a short review.', 'error');
        return;
      }
      if (!ratingI.value) { say('Please pick a star rating.', 'error'); return; }

      /* No endpoint configured yet — fall back to a prefilled email. */
      if (!endpoint()) {
        var subject = encodeURIComponent('Website review from ' + data.get('name'));
        var body = encodeURIComponent(
          'Name: '   + data.get('name')   + '\n' +
          'Role: '   + (data.get('role') || '-') + '\n' +
          'Rating: ' + ratingI.value + '/5\n\n' +
          data.get('review')
        );
        window.location.href = 'mailto:' + fallbackEmail() + '?subject=' + subject + '&body=' + body;
        say('Opening your email app so you can send it directly.', 'ok');
        return;
      }

      submit.disabled = true;
      say('Sending…');

      fetch(endpoint(), {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('bad status ' + res.status);
        form.reset();
        ratingI.value = '';
        if (picker) Array.prototype.forEach.call(picker.querySelectorAll('button'), function (b) {
          b.classList.remove('is-on');
        });
        say('Thank you — your review was sent. I read every one.', 'ok');
      }).catch(function () {
        say('Something went wrong. You can email me at ' + fallbackEmail() + ' instead.', 'error');
      }).then(function () {
        submit.disabled = false;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else { initForm(); }
})();
