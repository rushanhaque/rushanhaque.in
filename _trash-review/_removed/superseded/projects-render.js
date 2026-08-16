/*! projects-render.js — Rushan Haque portfolio
 *  Renders Works (industry) and Personal projects from data/projects.js.
 *  Add or remove entries in admin.html — both grids update automatically. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function media(p) {
    if (p.video) {
      return (p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '">' : '') +
        '<div class="rh-card__videowrap">' +
          '<video class="rh-card__video" preload="auto" autoplay muted loop playsinline>' +
            '<source type="video/mp4" src="' + esc(p.video) + '">' +
          '</video>' +
        '</div>';
    }
    if (p.image) return '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '">';
    return '<span class="rh-card__glyph" aria-hidden="true">' +
           esc((p.title || '?').trim().charAt(0).toUpperCase()) + '</span>';
  }

  function card(p) {
    var hasLink = !!p.url;
    var tag = hasLink ? 'a' : 'div';
    var attrs = hasLink
      ? ' href="' + esc(p.url) + '" target="_blank" rel="noopener"' +
        ' class="rh-card active-cursor-permanent" data-cursor-text="Visit Site"'
      : ' class="rh-card"';

    return '' +
      '<' + tag + attrs + '>' +
        '<div class="rh-card__media">' + media(p) + '</div>' +
        '<div class="rh-card__body">' +
          '<h3 class="rh-card__title">' + esc(p.title) + '</h3>' +
          (p.description ? '<p class="rh-card__descr">' + esc(p.description) + '</p>' : '') +
          (Array.isArray(p.tags) && p.tags.length
            ? '<div class="rh-card__tags">' + p.tags.map(function (t) {
                return '<span class="tag tag-s tag-medium">' + esc(t) + '</span>';
              }).join('') + '</div>'
            : '') +
        '</div>' +
      '</' + tag + '>';
  }

  function fill(id, items, emptyMsg) {
    var grid = document.getElementById(id);
    if (!grid) return;
    if (!items.length) {
      grid.innerHTML = '<div class="rh-cards__empty"><p>' + emptyMsg + '</p></div>';
      return;
    }
    grid.innerHTML = items.map(card).join('');
  }

  function init() {
    var all = (window.RH_PROJECTS || []).slice();
    var byCat = function (c) {
      return all.filter(function (p) {
        return String(p.category || '').toLowerCase() === c;
      });
    };

    fill('rh-works-grid', byCat('industry'), 'Client work will appear here.');
    fill('rh-personal-grid', byCat('personal'), 'Personal projects will appear here.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
