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

  /* Where a renderer is allowed to write.
     scripts/prerender.mjs runs these same renderers at build time and stamps
     each container it filled with data-rh-prerendered. When that stamp is
     present the markup is already in the document as served, so re-building it
     here would throw away identical HTML and cost a reflow for nothing. The
     browser path is now an enhancement over real content, not the only way to
     get any. */
  function mount(id) {
    var host = document.getElementById(id);
    if (!host) return null;
    if (host.hasAttribute('data-rh-prerendered')) return null;
    return host;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function year(d) { var m = String(d || '').match(/^(\d{4})/); return m ? m[1] : ''; }

  /* Card shells for entries that may or may not have somewhere to go.
     A card with no URL used to render as <a href="#0">: it looked and
     behaved like a link, but clicking it only stamped "#0" onto the
     address bar and pushed a dead entry onto the history stack, so the
     next Back press appeared to do nothing. Anything without a
     destination is now a plain element instead — the classes are what
     the cursor effect and the GSAP stagger bind to, not the tag, so
     the card is pixel-identical and simply stops pretending.
     `journeyRow` has always worked this way; this is the same idea
     applied to the rest of the renderers. */
  function shellOpen(url, cls, attrs) {
    var tag = url ? 'a' : 'span';
    return '<' + tag + ' class="' + cls + '"' +
           (url ? ' href="' + esc(url) + '" target="_blank" rel="noopener"' : '') +
           (attrs || '') + '>';
  }
  function shellClose(url) { return url ? '</a>' : '</span>'; }

  /* Alt text that describes the project rather than the file.
     "ErfolgLiving Preview" tells a screen-reader user the medium and
     nothing else; every image on the page was a "Preview". The niche and
     kind are already in the data, so the alt can say what the thing
     actually is: "ErfolgLiving — Web freelance project". */
  function altFor(p) {
    var parts = [];
    if (p.niche) parts.push(String(p.niche));
    if (p.kind)  parts.push(String(p.kind).toLowerCase());
    parts.push('project');
    return esc(p.title) + ' — ' + esc(parts.join(' '));
  }

  function tags(list, cls) {
    if (!Array.isArray(list) || !list.length) return '';
    return list.map(function (t) {
      return '<span class="' + cls + ' mxd-scramble">' + esc(t) + '</span>';
    }).join('\n                          ');
  }

  /* "DEC ’25" — a date stamp in the mono voice used for all metadata. */
  var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function stamp(iso) {
    var m = String(iso || '').match(/^(\d{4})-(\d{2})/);
    if (!m) return '';
    var mi = parseInt(m[2], 10) - 1;
    if (mi < 0 || mi > 11) return m[1];
    return MONTHS[mi] + ' ’' + m[1].slice(2);
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

  /* Responsive image attributes.
     A card slot is ~300px on a phone and ~700px on a wide desktop, but the
     source art is up to 1600px — without a srcset every phone downloads and
     decodes five times the pixels it can show. `sizes` describes the slot at
     each breakpoint; the widths come from js/img-manifest.js, which is
     generated from what is actually on disk, so we never point at a variant
     that was never written. */
  var IMG_WIDTHS = window.RH_IMG_WIDTHS || {};

  function srcsetFor(src, sizes) {
    var widths = IMG_WIDTHS[src];
    if (!widths || widths.length < 2) return '';
    var base = src.replace(/\.webp$/, '');
    var max = Math.max.apply(null, widths);
    var set = widths.map(function (w) {
      return (w === max ? src : base + '-' + w + '.webp') + ' ' + w + 'w';
    }).join(', ');
    return ' srcset="' + esc(set) + '" sizes="' + esc(sizes) + '"';
  }

  /* ============================================================
     WORKS — template "projects grid x2 showcase" markup
     ============================================================ */
  /* Works card.
     The media now sits inside `.a-shot` — the outer tray of the
     double-bezel enclosure — with the sheet number floating on it and a
     caption bar underneath carrying the name, the tags and the trailing
     well. The template's own classes (`mxd-project-item__media`,
     `animate-card-2`, `active-cursor-permanent`) are all preserved so
     the GSAP card stagger and the custom cursor still bind. */
  function projectItem(p, size, index) {
    var wide = size === 'wide';
    var col  = wide ? 'col-12 col-md-6 col-xl-7' : 'col-12 col-md-6 col-xl-4';
    var extra = wide ? '' : ' mxd-project-item-s mxd-project-item-sticky';
    var cover = wide ? 'mxd-cover-06' : 'mxd-cover-03';
    var href  = p.url || '';
    var isBlurred = p.isBlurred || (Array.isArray(p.tags) && p.tags.indexOf('Coming Soon') !== -1);
    var blurClass = isBlurred ? ' rh-coming-soon-card' : '';
    var live = !isBlurred && !!p.url;
    var cursorText = live ? 'Visit Site' : 'Coming Soon';

    /* small cards sit at ~1/3 of the grid on desktop, full width on a phone */
    var slot = wide
      ? '(min-width: 1200px) 58vw, (min-width: 768px) 50vw, 81vw'
      : '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 81vw';
    var src = previewFor(p, 1500, 1000);
    var media = '<img loading="lazy" decoding="async" width="1600" height="770" src="' + src + '"' +
                srcsetFor(src, slot) +
                ' alt="' + altFor(p) + '">';
    media += '\n                          <div class="mxd-cover ' + cover + '"></div>';
    if (p.video) {
      media +=
        '\n                          <div class="mxd-project-item__videowrap">' +
        '\n                            <video class="mxd-project-item__video" preload="metadata" autoplay muted loop playsinline>' +
        '\n                              <source type="video/mp4" src="' + esc(p.video) + '">' +
        '\n                            </video>' +
        '\n                          </div>';
    }

    var badgeLabel = isBlurred ? 'Coming Soon' : (live ? 'Visit Site' : 'In Progress');
    var badgeClass = isBlurred ? 'rh-cs-badge--soon' : (live ? 'rh-cs-badge--live' : 'rh-cs-badge--progress');
    /* On a live card the link's own label already ends "— visit site",
       so the badge is decoration and stays hidden. On a card that is not
       a link there is no label to carry the status, and the badge is the
       only thing saying "Coming Soon" — so it is left readable. */
    var cardBadge = '\n                          <span class="rh-cs-badge ' + badgeClass + '"' +
                    (live ? ' aria-hidden="true"' : '') + '>' + badgeLabel + '</span>';

    return '' +
'                    <div class="' + col + ' mxd-project-item animate-card-2' + extra + blurClass + '">\n' +
'                      <div class="a-shot a-ticks">\n' +
'                        <span class="a-shot__no">W/' + pad(index + 1) + '</span>\n' +
'                        ' + shellOpen(href, 'mxd-project-item__media active-cursor-permanent',
                             ' data-cursor-text="' + cursorText + '"' +
                             (href ? ' aria-label="' + esc(p.title) + ' — visit site"' : '')) + '\n' +
'                          ' + media + cardBadge + '\n' +
'                        ' + shellClose(href) + '\n' +
'                        <div class="rh-card-name">\n' +
'                          ' + shellOpen(href, 'rh-card-name__link') + esc(p.title) + shellClose(href) + '\n' +
'                        </div>\n' +
'                      </div>\n' +
'                    </div>';
  }

  function renderWorks() {
    var host = mount('rh-works');
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
          ? projectItem(a, 'small', i) + '\n                    <div class="col-12 col-xl-1 mxd-project-divider"></div>\n' + projectItem(b, 'wide', i + 1)
          : projectItem(a, 'wide', i)  + '\n                    <div class="col-12 col-xl-1 mxd-project-divider"></div>\n' + projectItem(b, 'small', i + 1);
        i += 2;
      } else {
        inner = projectItem(a, 'wide', i);
        i += 1;
      }
      rows.push('                  <div class="row g-0 mxd-projects-grid__gallery">\n' + inner + '\n                  </div>');
    }

    /* the sheet closes with a count and one way through to everything */
    rows.push('' +
'                  <div class="a-sec-foot mxd-grid-item anim-uni-in-up">\n' +
'                    <p class="a-sec-foot__note">' + items.length +
       ' builds here. The archive has the rest — personal projects, tools, the things I made to find out if they would work.</p>\n' +
'                    <a class="a-cta a-cta--ghost" href="works-default.html">\n' +
'                      <span>Open the archive</span>\n' +
'                    </a>\n' +
'                  </div>');

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
    /* Showcase entries are deliberately not linked out, and a project
       with no URL has nowhere to go — both render as a plain row rather
       than a link to "#0" that the inline onclick then had to cancel. */
    var href  = isShowcase ? '' : (p.url || '');
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

    var thumbSrc = p.image ? esc(p.image)
      : p.url ? ('https://image.thum.io/get/width/640/crop/400/noanimate/' + esc(p.url))
      : '';
    var thumbHtml = thumbSrc
      ? '\n                  <div class="rh-archive-thumb"><img src="' + thumbSrc + '" alt="' + altFor(p) + '" loading="lazy" decoding="async" width="640" height="400"></div>'
      : '';

    var statusClass = status === 'Visit Site' ? 'rh-row-status--live'
      : status === 'Request Access' ? 'rh-row-status--request'
      : 'rh-row-status--soon';
    var statusPill = '<span class="rh-row-status ' + statusClass + '">' + esc(status) + '</span>';

    return '' +
'                ' + shellOpen(href, 'mxd-projects-list__item active-cursor-image active-cursor-permanent',
                     cursorImg + ' data-cursor-text="' + status + '"') + '\n' +
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
'                      <div class="col-12 col-xl-0 mxd-grid-padding rh-row-status-col">\n' +
'                        ' + statusPill + '\n' +
'                      </div>\n' +
'                    </div>\n' +
'                  </div>\n' +
                  thumbHtml + '\n' +
'                  <div class="mxd-projects-list__divider bottom"></div>\n' +
'                ' + shellClose(href);
  }

  function renderArchive() {
    var host = mount('rh-archive');
    if (!host) return;
    var order = { Industry: 0, Showcase: 1, Personal: 2 };
    var items = (window.RH_PROJECTS || []).filter(function (p) {
      return !p.hideFromArchive;
    }).sort(function (a, b) {
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
    var host = mount('rh-products');
    if (!host) return;

    var items = (window.RH_PRODUCTS || []).slice();
    items.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    /* Nothing shipped yet. Rather than a stub row pretending to be a
       product, this is a deliberate plate: it says what the state is
       and gives the visitor the one action that makes sense. */
    if (!items.length) {
      host.innerHTML =
'              <div class="a-plate a-plate--ink anim-uni-in-up">\n' +
'                <div class="a-plate__in">\n' +
'                  <div class="a-empty__body">\n' +
'                    <div>\n' +
'                      <span class="a-eyebrow"><span class="a-dot"></span>In development</span>\n' +
'                      <h3 class="a-empty__title" style="color:#FFFFFF">Nothing shipped yet. <br>Two on the bench.</h3>\n' +
'                      <p class="a-empty__note" style="color:rgba(255,255,255,0.56)">I build tools for myself first. The ones that survive real work get released. When one ships it lands here — version and price in plain sight.</p>\n' +
'                    </div>\n' +
'                    <a class="a-cta" href="contact.html" style="background-color:#FFFFFF;border-color:#FFFFFF;color:#0A0A0A">\n' +
'                      <span>Ask what I am building</span>\n' +
'                    </a>\n' +
'                  </div>\n' +
'                </div>\n' +
'              </div>';
      return;
    }

    host.innerHTML = items.map(function (p, i) {
      var name  = p.url
        ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name) + '</a>'
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
    var host = mount('rh-personal');
    if (!host) return;

    var items = (window.RH_PROJECTS || []).filter(function (p) {
      return String(p.category || '').toLowerCase() === 'personal';
    });
    if (!items.length) { host.innerHTML = ''; return; }

    host.innerHTML = items.map(function (p, i) {
      var href  = p.url || '';
      var img = previewFor(p, 1200, 800);
      var blurClass = (p.isBlurred || p.title === 'Coming Soon') ? ' rh-coming-soon-card' : '';
      var live = !(p.isBlurred || p.title === 'Coming Soon' || !p.url);
      var cursorText = live ? 'Read' : 'Coming Soon';
      var metaLabel = (Array.isArray(p.tags) && p.tags[0]) ? p.tags[0] : 'Writing';
      var isShifted = (p.isBlurred || p.title === 'Coming Soon' || (p.image && (p.image.indexOf('samundaro') !== -1 || p.image.indexOf('psychology') !== -1)));
      var shiftClass = isShifted ? ' rh-shifted-card' : '';

      var blogBadgeLabel = live ? 'Read' : 'Coming Soon';
      var blogBadgeClass = live ? 'rh-cs-badge--live' : 'rh-cs-badge--soon';

      return '' +
'                    <div class="col-12 col-md-6 col-lg-4 mxd-blog-item animate-card-3' + blurClass + shiftClass + '">\n' +
'                      <div class="mxd-blog-item__date">\n' +
'                        <span class="meta-date">P/' + pad(i + 1) + ' · ' + esc(metaLabel) + '</span>\n' +
'                      </div>\n' +
'                      <div class="a-shot a-ticks">\n' +
'                        ' + shellOpen(href, 'mxd-blog-item__media active-cursor-permanent',
                             ' data-cursor-text="' + cursorText + '"' +
                             (href ? ' aria-label="' + esc(p.title) + '"' : '')) + '\n' +
'                          <img src="' + img + '"' + srcsetFor(img, '(min-width: 992px) 32vw, (min-width: 768px) 48vw, 81vw') + ' alt="' + altFor(p) + '" width="1536" height="1024" loading="lazy" decoding="async">\n' +
'                          <span class="rh-cs-badge ' + blogBadgeClass + '"' + (live ? ' aria-hidden="true"' : '') + '>' + blogBadgeLabel + '</span>\n' +
'                        ' + shellClose(href) + '\n' +
'                      </div>\n' +
'                      <div class="mxd-blog-item__caption">\n' +
'                        <div class="mxd-blog-item__title">\n' +
'                          ' + shellOpen(href, 'a-cap__name') + esc(p.title) + shellClose(href) + '\n' +
'                          <div class="a-cap__tags">\n' +
'                            ' + tags(p.tags, 'mxd-scramble') + '\n' +
'                          </div>\n' +
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
    var host = mount(hostId);
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

  /* Five stars — filled for earned, outlined for the rest. */
  function scoreBar(n) {
    n = Math.max(0, Math.min(5, parseInt(n, 10) || 0));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += i <= n
        ? '<i>★</i>'
        : '<i class="is-off">☆</i>';
    }
    return out;
  }

  /* "SIAAM logistics / Saudi Arab" carries two facts. Split them so the
     affiliation and the territory can be set in different voices, and
     tolerate the entries that only have one half (e.g. "/ Nepal"). */
  function splitRole(role) {
    var s = String(role || '').trim();
    if (!s) return '';
    var at = s.indexOf('/');
    if (at === -1) return esc(s);
    var org = s.slice(0, at).trim();
    var place = s.slice(at + 1).trim();
    if (!org) return esc(place);
    if (!place) return esc(org);
    return esc(org) + ' <span aria-hidden="true">·</span> ' + esc(place);
  }

  function renderReviews() {
    var host = mount('rh-reviews');
    if (!host) return;

    var list = (window.RH_REVIEWS || []).slice();
    if (!list.length) {
      host.innerHTML =
'                <div class="mxd-reviews-empty anim-uni-in-up">\n' +
'                  <p>No reviews yet — if we’ve worked together, yours would be the first.</p>\n' +
'                </div>';
      return;
    }

    list.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });

    /* the aggregate, computed rather than asserted */
    var rated = list.filter(function (r) { return parseInt(r.rating, 10) > 0; });
    var mean = rated.length
      ? rated.reduce(function (s, r) { return s + parseInt(r.rating, 10); }, 0) / rated.length
      : 0;
    var meanTxt = (Math.round(mean * 10) / 10).toFixed(1);

    var summary = '' +
'                <div class="a-rv-sum anim-uni-in-up">\n' +
'                  <span class="a-rv-sum__score"><b>' + meanTxt + '</b><span>/ 5.0</span></span>\n' +
'                  <span class="a-rv__bar" aria-hidden="true">' + scoreBar(Math.round(mean)) + '</span>\n' +
'                  <span class="a-meta">' + list.length + ' review' + (list.length === 1 ? '' : 's') + '</span>\n' +
'                  <span class="a-rv-sum__rule"></span>\n' +
'                  <span class="a-meta">Collected direct &middot; published unedited</span>\n' +
'                </div>';

    /* The first plate runs at double width, so it should be the review
       that has something to say — not merely the newest one. Promote the
       longest quote among the top-rated entries; everything else keeps
       its newest-first order. */
    if (list.length > 2) {
      var best = 0;
      var top = Math.max.apply(null, list.map(function (r) { return parseInt(r.rating, 10) || 0; }));
      list.forEach(function (r, i) {
        if ((parseInt(r.rating, 10) || 0) < top) return;
        if (String(r.text || '').length > String(list[best].text || '').length) best = i;
      });
      if (best > 0) list.unshift(list.splice(best, 1)[0]);
    }

    /* Specimen plates. The first one runs wide so the grid opens on an
       accent instead of three identical rectangles. */
    var cards = list.map(function (r, i) {
      var wide = i === 0 ? ' a-rv--wide' : '';
      var rating = parseInt(r.rating, 10) || 0;
      var mono = r.image
        ? '<img src="' + esc(r.image) + '" alt="" loading="lazy" decoding="async">'
        : esc(initials(r.name));
      var when = stamp(r.date);
      var role = splitRole(r.role);

      return '' +
'                  <article class="a-rv animate-card-3' + wide + '">\n' +
'                    <div class="a-rv__tray">\n' +
'                      <div class="a-rv__core">\n' +
'                        <header class="a-rv__rail">\n' +
'                          <span class="a-rv__no">R/' + pad(i + 1) + '</span>\n' +
'                          <span class="a-rv__score">\n' +
'                            <span class="a-rv__bar" role="img" aria-label="Rated ' + rating + ' out of 5">' + scoreBar(rating) + '</span>\n' +
'                            <span class="a-rv__num">' + rating.toFixed(1) + '</span>\n' +
'                          </span>\n' +
'                        </header>\n' +
'                        <div class="a-rv__body">\n' +
'                          <blockquote class="a-rv__quote">' + esc(r.text) + '</blockquote>\n' +
'                        </div>\n' +
'                        <footer class="a-rv__foot">\n' +
'                          <span class="a-rv__mono" aria-hidden="true">' + mono + '</span>\n' +
'                          <span class="a-rv__who">\n' +
'                            <p class="a-rv__name">' + esc(r.name) + '</p>\n' +
(role
? '                            <p class="a-rv__role">' + role + '</p>\n'
: '') +
'                          </span>\n' +
(when
? '                          <span class="a-rv__date">' + when + '</span>\n'
: '') +
'                        </footer>\n' +
'                      </div>\n' +
'                    </div>\n' +
'                  </article>';
    }).join('\n');

    host.innerHTML = summary + '\n                <div class="a-rv-grid">\n' + cards + '\n                </div>';
  }

  /* run immediately — app.js initialises on DOMContentLoaded, after this */
  renderWorks();
  renderArchive();
  renderProducts();
  renderPersonal();
  renderJourney();
  renderReviews();
})();
