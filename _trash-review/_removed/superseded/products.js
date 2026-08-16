/*! products.js — Rushan Haque portfolio
 *  Renders the Products section from data/products.js. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function statusClass(status) {
    var s = String(status || '').toLowerCase();
    if (s.indexOf('coming') === 0) return 'is-soon';
    if (s.indexOf('beta') === 0) return 'is-beta';
    return 'is-live';
  }

  function card(p) {
    var hasLink = !!p.url;
    var tag = hasLink ? 'a' : 'div';
    var attrs = hasLink
      ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener" data-cursor-text="Open" class="rh-product active-cursor-permanent"'
      : ' class="rh-product"';

    var media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">'
      : '<span class="rh-product__glyph" aria-hidden="true">' + esc((p.name || '?').trim().charAt(0).toUpperCase()) + '</span>';

    return '' +
      '<' + tag + attrs + '>' +
        '<div class="rh-product__media">' + media +
          '<span class="rh-product__status ' + statusClass(p.status) + '">' + esc(p.status || 'Live') + '</span>' +
        '</div>' +
        '<div class="rh-product__body">' +
          '<h3 class="rh-product__name">' + esc(p.name) + '</h3>' +
          (p.tagline ? '<p class="rh-product__tagline">' + esc(p.tagline) + '</p>' : '') +
          '<div class="rh-product__meta">' +
            (Array.isArray(p.tags) && p.tags.length
              ? '<div class="rh-product__tags">' + p.tags.map(function (t) {
                  return '<span class="tag tag-s tag-medium">' + esc(t) + '</span>';
                }).join('') + '</div>'
              : '<span></span>') +
            (p.price ? '<span class="rh-product__price">' + esc(p.price) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</' + tag + '>';
  }

  function init() {
    var grid = document.getElementById('rh-products-grid');
    if (!grid) return;

    var list = (window.RH_PRODUCTS || []).slice();

    if (!list.length) {
      grid.innerHTML =
        '<div class="rh-products__empty">' +
          '<p class="rh-products__empty-title">Nothing shipped here yet.</p>' +
          '<p>Products I launch will show up in this space — follow along on ' +
          '<a href="https://github.com/rushanhaque" target="_blank" rel="noopener">GitHub</a>.</p>' +
        '</div>';
      return;
    }

    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    grid.innerHTML = list.map(card).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
