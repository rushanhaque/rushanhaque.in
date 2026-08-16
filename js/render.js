/*! render.js — Rushan Haque portfolio
 *
 *  Fills the Works, Products and Personal-projects sections from data/*.js
 *  using the TEMPLATE'S OWN markup and classes, so all of Atelys' animations
 *  (perspective list, sticky cards, image reveals, text scramble, card stagger)
 *  bind to it exactly as they would to hand-written HTML.
 *
 *  IMPORTANT: this file must be loaded AFTER the data files but BEFORE app.js,
 *  and it renders synchronously — app.js initialises on DOMContentLoaded, so the
 *  markup has to be in the DOM before that fires. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function year(d) { var m = String(d || '').match(/^(\d{4})/); return m ? m[1] : ''; }

  function tags(list, cls) {
    if (!Array.isArray(list) || !list.length) return '';
    return list.map(function (t) {
      return '<span class="' + cls + ' mxd-scramble">' + esc(t) + '</span>';
    }).join('\n                          ');
  }

  /* On-brand placeholder tile, generated inline as an SVG data URI.
     No network request, no third-party dependency, and it picks up the
     site's beige palette instead of the old grey stock image. */
  function placeholder(w, h, label) {
    var text = String(label || 'Coming soon');
    if (text.length > 22) text = text.slice(0, 21) + '…';
    var size = Math.round(Math.min(w, h) * 0.085);
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'>" +
        "<rect width='" + w + "' height='" + h + "' fill='%23F0F0F0'/>" +
        "<text x='50%' y='50%' fill='%23999999' text-anchor='middle'" +
        " dominant-baseline='middle' font-family='Manrope, sans-serif'" +
        " font-size='" + size + "' letter-spacing='" + (size * 0.06) + "'>" +
        text.replace(/&/g, '&amp;').replace(/</g, '').replace(/>/g, '') +
        "</text>" +
      "</svg>";
    return 'data:image/svg+xml,' + svg.replace(/#/g, '%23').replace(/"/g, "'");
  }

  /* Live landing-page screenshot for a project URL. Falls back to an
     on-brand name tile when there is no URL yet (coming-soon entries). */
  function previewFor(p, w, h) {
    if (p.image) return esc(p.image);
    if (p.url) {
      return 'https://image.thum.io/get/width/' + w + '/crop/' + h +
             '/noanimate/' + esc(p.url);
    }
    return placeholder(w, h, p.title || p.name || 'Coming soon');
  }

  /* ============================================================
     WORKS — template "projects grid x2 showcase" markup
     ============================================================ */
  function projectItem(p, size) {
    var wide = size === 'wide';
    var col  = wide ? 'col-12 col-md-6 col-xl-7' : 'col-12 col-md-6 col-xl-4';
    var extra = wide ? '' : ' mxd-project-item-s mxd-project-item-sticky';
    var cover = wide ? 'mxd-cover-06' : 'mxd-cover-03';
    var href  = p.url || '#0';
    var blank = p.url ? ' target="_blank" rel="noopener"' : '';
    var isBlurred = p.isBlurred || (Array.isArray(p.tags) && p.tags.indexOf('Coming Soon') !== -1);
    var blurClass = isBlurred ? ' rh-coming-soon-card' : '';
    var cursorText = (isBlurred || !p.url) ? 'Coming Soon' : 'Visit Site';

    var media = '<img loading="lazy" src="' + previewFor(p, 1500, 1000) +
                '" alt="' + esc(p.title) + ' Preview">';
    media += '\n                        <div class="mxd-cover ' + cover + '"></div>';
    if (p.video) {
      media +=
        '\n                        <div class="mxd-project-item__videowrap">' +
        '\n                          <video class="mxd-project-item__video" preload="auto" autoplay muted loop playsinline>' +
        '\n                            <source type="video/mp4" src="' + esc(p.video) + '">' +
        '\n                          </video>' +
        '\n                        </div>';
    }

    return '' +
'                    <div class="' + col + ' mxd-project-item animate-card-2' + extra + blurClass + '">\n' +
'                      <a class="mxd-project-item__media active-cursor-permanent" data-cursor-text="' + cursorText + '" href="' + esc(href) + '"' + blank + '>\n' +
'                        ' + media + '\n' +
'                      </a>\n' +
'                      <div class="mxd-project-item__caption">\n' +
'                        <div class="mxd-project-item__name">\n' +
'                          <a class="project-name-s" href="' + esc(href) + '"' + blank + '>' + esc(p.title) + '</a>\n' +
'                        </div>\n' +
'                        <div class="mxd-project-item__tags">\n' +
'                          ' + tags(p.tags, 'tag tag-s tag-medium') + '\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>';
  }

  function renderWorks() {
    var host = document.getElementById('rh-works');
    if (!host) return;
    var items = (window.RH_PROJECTS || []).filter(function (p) {
      return String(p.category || '').toLowerCase() === 'industry';
    });
    if (!items.length) { host.innerHTML = ''; return; }

    var rows = [], i = 0;
    while (i < items.length) {
      var a = items[i], b = items[i + 1];
      var inner;
      if (b) {
        // alternate which side is wide, like the template does
        inner = (rows.length % 2 === 0)
          ? projectItem(a, 'small') + '\n                    <div class="col-12 col-xl-1 mxd-project-divider"></div>\n' + projectItem(b, 'wide')
          : projectItem(a, 'wide')  + '\n                    <div class="col-12 col-xl-1 mxd-project-divider"></div>\n' + projectItem(b, 'small');
        i += 2;
      } else {
        inner = projectItem(a, 'wide');
        i += 1;
      }
      rows.push('                  <div class="row g-0 mxd-projects-grid__gallery">\n' + inner + '\n                  </div>');
    }
    host.innerHTML = rows.join('\n');
  }

  /* ============================================================
     ARCHIVE - template "projects list" markup (works-default.html)
     Renders every project, so the admin panel controls this page too.
     ============================================================ */
  function splitTitle(t) {
    /* the template styles the tail of the name differently; split off a
       trailing capitalised word so "ErfolgLiving" -> "Erfolg<span>Living</span>" */
    var m = String(t || '').match(/^(.+?)([A-Z][a-z]+)$/);
    if (m && m[1].length > 2 && !/\s$/.test(m[1])) {
      return esc(m[1]) + '<span>' + esc(m[2]) + '</span>';
    }
    return esc(t);
  }

  function archiveRow(p) {
    var isShowcase = p.category === 'Showcase';
    var href  = isShowcase ? '#0' : (p.url || '#0');
    var blank = (!isShowcase && p.url) ? ' target="_blank" rel="noopener"' : '';
    var noNav = isShowcase ? ' data-no-redirect="true" onclick="event.preventDefault()"' : '';
    var status = isShowcase
      ? 'Request Access'
      : (Array.isArray(p.tags) && p.tags.indexOf('Coming Soon') !== -1)
        ? 'Coming Soon'
        : (p.url ? 'Visit Site' : 'In Progress');
    var cursorImg = p.image ? ' data-cursor-image="' + esc(p.image) + '"' : '';

    var metas = (Array.isArray(p.tags) ? p.tags : []).map(function (t) {
      return '<span class="meta-tag mxd-scramble">' + esc(t) + '</span>';
    }).join('\n                          ');

    // Showcase rows: description spans title+meta columns; no cursor image
    var middleCols = isShowcase
      ? (
'                      <div class="col-12 col-xl-8 mxd-grid-padding">\n' +
'                        <div class="mxd-projects-list__title">\n' +
'                          <h3>' + splitTitle(p.title) + '</h3>\n' +
'                        </div>\n' +
'                        <p class="rh-archive-desc">' + esc(p.description || '') + '</p>\n' +
'                      </div>\n'
        )
      : (
'                      <div class="col-12 col-xl-6 mxd-grid-padding">\n' +
'                        <div class="mxd-projects-list__title">\n' +
'                          <h3>' + splitTitle(p.title) + '</h3>\n' +
'                        </div>\n' +
'                      </div>\n' +
'                      <div class="col-6 col-md-6 col-xl-2 mxd-grid-padding">\n' +
'                        <div class="mxd-projects-list__meta">\n' +
'                          ' + metas + '\n' +
'                        </div>\n' +
'                      </div>\n'
        );

    return '' +
'                <a class="mxd-projects-list__item active-cursor-image active-cursor-permanent"' + cursorImg + ' data-cursor-text="' + status + '" href="' + esc(href) + '"' + blank + noNav + '>\n' +
'                  <div class="mxd-projects-list__divider top"></div>\n' +
'                  <div class="container-fluid px-0 mxd-projects-list__inner">\n' +
'                    <div class="row gx-0">\n' +
'                      <div class="col-12 col-xl-2 mxd-grid-padding">\n' +
'                        <div class="mxd-projects-list__niche">\n' +
'                          <span class="meta-niche mxd-scramble">' + esc(p.niche || 'Web') + '</span>\n' +
'                        </div>\n' +
'                      </div>\n' +
                        middleCols +
'                      <div class="col-6 col-md-6 col-xl-2 mxd-grid-padding">\n' +
'                        <div class="mxd-projects-list__date">\n' +
'                          <span class="meta-date mxd-scramble">' + esc(p.kind || 'Personal') + '</span>\n' +
'                          <span class="meta-date mxd-scramble">' + esc(p.year || '') + '</span>\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                  <div class="mxd-projects-list__divider bottom"></div>\n' +
'                </a>';
  }

  function renderArchive() {
    var host = document.getElementById('rh-archive');
    if (!host) return;
    var order = { Industry: 0, Showcase: 1, Personal: 2 };
    var items = (window.RH_PROJECTS || []).slice().sort(function (a, b) {
      var d = (order[a.category] === undefined ? 9 : order[a.category]) -
              (order[b.category] === undefined ? 9 : order[b.category]);
      if (d) return d;
      return String(b.year || '').localeCompare(String(a.year || ''));
    });
    host.innerHTML = items.map(archiveRow).join('\n');
  }

  /* ============================================================
     PRODUCTS — template "capabilities / perspective list" markup
     ============================================================ */
  function renderProducts() {
    var host = document.getElementById('rh-products');
    if (!host) return;

    var items = (window.RH_PRODUCTS || []).slice();
    items.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    if (!items.length) {
      host.innerHTML =
'              <div class="mxd-cpb-list__item mxd-perspective-list__item">\n' +
'                <div class="mxd-cpb-list__divider top"></div>\n' +
'                <div class="mxd-cpb-list__inner mxd-perspective-list__inner">\n' +
'                  <div class="container-fluid p-0">\n' +
'                    <div class="row g-0">\n' +
'                      <div class="col-12 col-xl-4 mxd-grid-item mxd-cpb-list__title">\n' +
'                        <div class="mxd-cpb-list__number"><span class="meta-tag">[01]</span></div>\n' +
'                        <p class="mxd-cpb-list__name">In the works</p>\n' +
'                      </div>\n' +
'                      <div class="col-12 col-md-6 col-xl-4 mxd-grid-item mxd-cpb-list__image">\n' +
'                        <img src="' + placeholder(1200, 980, 'Soon') + '" alt="Coming soon" loading="lazy" decoding="async">\n' +
'                      </div>\n' +
'                      <div class="col-12 col-md-6 col-xl-4 mxd-cpb-list__data">\n' +
'                        <div class="mxd-cpb-list__descr mxd-grid-item">\n' +
'                          <p class="t-large t-bold">Maybe too busy building, <span>connect directly to enquire about products</span></p>\n' +
'                        </div>\n' +
'                        <div class="mxd-cpb-list__tags">\n' +
'                          <div class="container-fluid p-0"><div class="row g-0">\n' +
'                            <div class="col-6 mxd-grid-item mxd-cpb-list__meta">\n' +
'                              <span class="meta-tag mxd-scramble">Building</span>\n' +
'                            </div>\n' +
'                          </div></div>\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                </div>\n' +
'                <div class="mxd-cpb-list__divider bottom"></div>\n' +
'              </div>';
      return;
    }

    host.innerHTML = items.map(function (p, i) {
      var href  = p.url || '#0';
      var blank = p.url ? ' target="_blank" rel="noopener"' : '';
      var name  = p.url
        ? '<a href="' + esc(href) + '"' + blank + '>' + esc(p.name) + '</a>'
        : esc(p.name);
      var img = p.image
        ? esc(p.image)
        : placeholder(1200, 980, p.name || '');

      var meta = (Array.isArray(p.tags) ? p.tags : []).slice();
      if (p.status) meta.unshift(p.status);
      if (p.price)  meta.push(p.price);
      var half = Math.ceil(meta.length / 2) || 1;

      function col(arr) {
        return arr.map(function (t) {
          return '<span class="meta-tag mxd-scramble">' + esc(t) + '</span>';
        }).join('\n                              ');
      }

      return '' +
'              <div class="mxd-cpb-list__item mxd-perspective-list__item">\n' +
'                <div class="mxd-cpb-list__divider top"></div>\n' +
'                <div class="mxd-cpb-list__inner mxd-perspective-list__inner">\n' +
'                  <div class="container-fluid p-0">\n' +
'                    <div class="row g-0">\n' +
'                      <div class="col-12 col-xl-4 mxd-grid-item mxd-cpb-list__title">\n' +
'                        <div class="mxd-cpb-list__number"><span class="meta-tag">[' + pad(i + 1) + ']</span></div>\n' +
'                        <p class="mxd-cpb-list__name">' + name + '</p>\n' +
'                      </div>\n' +
'                      <div class="col-12 col-md-6 col-xl-4 mxd-grid-item mxd-cpb-list__image">\n' +
'                        <img src="' + img + '" alt="' + esc(p.name) + '">\n' +
'                      </div>\n' +
'                      <div class="col-12 col-md-6 col-xl-4 mxd-cpb-list__data">\n' +
'                        <div class="mxd-cpb-list__descr mxd-grid-item">\n' +
'                          <p class="t-large t-bold">' + esc(p.tagline || '') + '</p>\n' +
'                        </div>\n' +
'                        <div class="mxd-cpb-list__tags">\n' +
'                          <div class="container-fluid p-0"><div class="row g-0">\n' +
'                            <div class="col-6 mxd-grid-item mxd-cpb-list__meta">\n' +
'                              ' + col(meta.slice(0, half)) + '\n' +
'                            </div>\n' +
'                            <div class="col-6 mxd-grid-item mxd-cpb-list__meta">\n' +
'                              ' + col(meta.slice(half)) + '\n' +
'                            </div>\n' +
'                          </div></div>\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                </div>\n' +
'                <div class="mxd-cpb-list__divider bottom"></div>\n' +
'              </div>';
    }).join('\n');
  }

  /* ============================================================
     PERSONAL PROJECTS — template "blog preview grid x3" markup
     ============================================================ */
  function renderPersonal() {
    var host = document.getElementById('rh-personal');
    if (!host) return;

    var items = (window.RH_PROJECTS || []).filter(function (p) {
      return String(p.category || '').toLowerCase() === 'personal';
    });
    if (!items.length) { host.innerHTML = ''; return; }

    host.innerHTML = items.map(function (p) {
      var href  = p.url || '#0';
      var blank = p.url ? ' target="_blank" rel="noopener"' : '';
      var img = previewFor(p, 1200, 800);
      var blurClass = (p.isBlurred || p.title === 'Coming Soon') ? ' rh-coming-soon-card' : '';
      var cursorText = (p.isBlurred || p.title === 'Coming Soon' || !p.url) ? 'Coming Soon' : 'Visit Site';
      var metaLabel = (Array.isArray(p.tags) && p.tags[0]) ? p.tags[0] : 'Writing';
      var isShifted = (p.isBlurred || p.title === 'Coming Soon' || (p.image && p.image.indexOf('samundaro') !== -1));
      var shiftClass = isShifted ? ' rh-shifted-card' : '';

      return '' +
'                    <div class="col-12 col-md-6 col-lg-4 mxd-blog-item animate-card-3' + blurClass + shiftClass + '">\n' +
'                      <div class="mxd-blog-item__date">\n' +
'                        <span class="meta-date">' + esc(metaLabel) + '</span>\n' +
'                      </div>\n' +
'                      <a class="mxd-blog-item__media active-cursor-permanent" data-cursor-text="' + cursorText + '" href="' + esc(href) + '"' + blank + '>\n' +
'                        <img class="" src="' + img + '" alt="' + esc(p.title) + '">\n' +
'                      </a>\n' +
'                      <div class="mxd-blog-item__caption">\n' +
'                        <div class="mxd-blog-item__title">\n' +
'                          <a class="blog-name-m" href="' + esc(href) + '"' + blank + '>' + esc(p.title) + '</a>\n' +
'                        </div>\n' +
'                        <div class="mxd-blog-item__tags">\n' +
'                          ' + tags(p.tags, 'tag tag-s tag-medium') + '\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>';
    }).join('\n');
  }

  /* ============================================================
     JOURNEY - timeline rail (experience + education)
     ============================================================ */
  function journeyRow(e, i, isCurrent) {
    var period = [e.from, e.to].filter(Boolean).join(' \u2014 ');
    var hasLink = !!e.url;
    var tag = hasLink ? 'a' : 'div';
    var attrs = hasLink
      ? ' href="' + esc(e.url) + '" target="_blank" rel="noopener"'
      : '';

    return '' +
'                <' + tag + ' class="rh-jr__row' + (isCurrent ? ' is-current' : '') + '"' + attrs + '>\n' +
'                  <span class="rh-jr__marker" aria-hidden="true"></span>\n' +
'                  <span class="rh-jr__no">' + pad(i + 1) + '</span>\n' +
'                  <span class="rh-jr__body">\n' +
'                    <span class="rh-jr__head">\n' +
'                      <span class="rh-jr__role">' + esc(e.role) + '</span>\n' +
'                      <span class="rh-jr__org">' + esc(e.org) + '</span>\n' +
'                    </span>\n' +
(e.note
? '                    <span class="rh-jr__note">' + esc(e.note) + '</span>\n'
: '') +
'                  </span>\n' +
'                  <span class="rh-jr__period">' + esc(period) + '</span>\n' +
'                </' + tag + '>';
  }

  function renderJourneyList(hostId, items) {
    var host = document.getElementById(hostId);
    if (!host) return;
    var list = Array.isArray(items) ? items : [];
    if (!list.length) { host.innerHTML = ''; return; }
    host.innerHTML = list.map(function (e, i) {
      var isCurrent = /present|current/i.test(String(e.to || ''));
      return journeyRow(e, i, isCurrent);
    }).join('\n');
  }

  function renderJourney() {
    var data = window.RH_JOURNEY || {};
    renderJourneyList('rh-experience', data.experience);
    renderJourneyList('rh-education', data.education);
  }

  /* ============================================================
     REVIEWS — template "testimonials card" markup
     ============================================================ */
  function initials(name) {
    var p = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '—';
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  var QUOTE_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 4.4 3.3">' +
    '<path d="M1.1,1.1v2.2H0V1.1h1.1ZM1.1,1.1V0h1.1v1.1h-1.1ZM3.3,1.1v2.2h-1.1V1.1h1.1ZM4.4,0v1.1h-1.1V0h1.1Z"/>' +
    '</svg>';

  function stars(n) {
    n = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="' + (i <= n ? 'is-full' : 'is-empty') + '">&#9733;</span>';
    }
    return out;
  }

  function renderReviews() {
    var host = document.getElementById('rh-reviews');
    if (!host) return;

    var list = (window.RH_REVIEWS || []).slice();
    if (!list.length) {
      host.innerHTML =
'                <div class="col-12 mxd-grid-item">\n' +
'                  <div class="mxd-reviews-empty anim-uni-in-up">\n' +
'                    <p>No reviews yet — if we’ve worked together, yours would be the first.</p>\n' +
'                  </div>\n' +
'                </div>';
      return;
    }

    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    host.innerHTML = list.map(function (r) {
      var photo = r.image
        ? '<img src="' + esc(r.image) + '" alt="' + esc(r.name) + '">'
        : '<span class="mxd-reviews-initials">' + esc(initials(r.name)) + '</span>';

      return '' +
'                <div class="col-12 col-md-6 col-xl-4 mxd-grid-item mxd-reviews-item animate-card-3">\n' +
'                  <div class="mxd-testimonials-card fullheight">\n' +
'                    <div class="mxd-testimonials-card__content">\n' +
'                      <div class="mxd-testimonials-card__controls">\n' +
'                        <div class="mxd-testimonials-card__quote">' + QUOTE_SVG + '</div>\n' +
'                        <div class="mxd-reviews-stars" aria-label="' + esc(r.rating || 0) + ' out of 5">' + stars(r.rating) + '</div>\n' +
'                      </div>\n' +
'                      <p class="mxd-testimonials-card__descr">' + esc(r.text) + '</p>\n' +
'                    </div>\n' +
'                    <div class="mxd-testimonials-card__author">\n' +
'                      <div class="mxd-testimonials-card__photo">' + photo + '</div>\n' +
'                      <div class="mxd-testimonials-card__data">\n' +
'                        <p class="mxd-testimonials-card__name">' + esc(r.name) + '</p>\n' +
(r.role
? '                        <p class="mxd-testimonials-card__position">' + esc(r.role) + '</p>\n'
: '') +
'                      </div>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                </div>';
    }).join('\n');
  }

  /* run immediately — app.js initialises on DOMContentLoaded, after this */
  renderWorks();
  renderArchive();
  renderProducts();
  renderPersonal();
  renderJourney();
  renderReviews();
})();
