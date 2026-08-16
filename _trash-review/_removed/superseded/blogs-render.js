/*! blogs-render.js — Rushan Haque portfolio
 *  Renders the Blogs & writings section from data/blogs.js. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function year(d) {
    var m = String(d || '').match(/^(\d{4})/);
    return m ? m[1] : '';
  }

  function card(b) {
    var hasLink = !!b.url;
    var tag = hasLink ? 'a' : 'div';
    var attrs = hasLink
      ? ' href="' + esc(b.url) + '" target="_blank" rel="noopener"' +
        ' class="rh-card active-cursor-permanent" data-cursor-text="Read"'
      : ' class="rh-card"';

    var media = b.image
      ? '<img src="' + esc(b.image) + '" alt="' + esc(b.title) + '">'
      : '<span class="rh-card__glyph" aria-hidden="true">' +
        esc((b.title || '?').trim().charAt(0).toUpperCase()) + '</span>';

    var meta = [b.kind, year(b.date)].filter(Boolean).join(' · ');

    return '' +
      '<' + tag + attrs + '>' +
        '<div class="rh-card__media">' + media +
          (meta ? '<span class="rh-card__badge">' + esc(meta) + '</span>' : '') +
        '</div>' +
        '<div class="rh-card__body">' +
          '<h3 class="rh-card__title">' + esc(b.title) + '</h3>' +
          (b.excerpt ? '<p class="rh-card__descr">' + esc(b.excerpt) + '</p>' : '') +
          (Array.isArray(b.tags) && b.tags.length
            ? '<div class="rh-card__tags">' + b.tags.map(function (t) {
                return '<span class="tag tag-s tag-medium">' + esc(t) + '</span>';
              }).join('') + '</div>'
            : '') +
        '</div>' +
      '</' + tag + '>';
  }

  function init() {
    var grid = document.getElementById('rh-blogs-grid');
    if (!grid) return;

    var list = (window.RH_BLOGS || []).slice();
    if (!list.length) {
      grid.innerHTML = '<div class="rh-cards__empty"><p>Writing and research will appear here.</p></div>';
      return;
    }
    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    grid.innerHTML = list.map(card).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
