/* scripts/prerender.mjs — put the content into the HTML before it ships.
 *
 * The site used to build its own body in the browser: index.html and work.html
 * shipped empty <div id="rh-works">-style containers and js/render.js filled
 * them on DOMContentLoaded. That works in a browser and nowhere else. Google
 * indexed a portfolio with no portfolio in it, link previews had nothing to
 * quote, and the assistants the site sells GEO services against — which do not
 * reliably execute JS — could not see a single project.
 *
 * This runs the SAME js/render.js at build time against a minimal DOM shim,
 * captures what each renderer produced, and writes it into the HTML on disk.
 * render.js is unchanged and still runs in the browser; it now finds the
 * markup already there and leaves it alone (see the data-rh-prerendered guard
 * at the top of each renderer). Client-side rendering became progressive
 * enhancement instead of the only path to content.
 *
 *   node scripts/prerender.mjs           # write
 *   node scripts/prerender.mjs --check   # verify committed HTML is current
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

/* Which container ids each page owns. A page only gets the hosts it has. */
const PAGES = {
  'index.html': ['rh-works', 'rh-products', 'rh-personal', 'rh-experience', 'rh-education', 'rh-reviews'],
  'work.html': ['rh-archive', 'rh-products'],
  'review.html': ['rh-reviews'],
};

/* Sections that should not ship at all while their data is empty.
 *
 * An empty section is worse than a missing one: a heading with nothing under
 * it reads as neglect, and "Products — nothing shipped yet" is an answer to a
 * question no buyer asked. These are hidden while the list is empty and come
 * back on their own the moment there is something real to put in them, so
 * nobody has to remember to re-enable them.
 *
 *   section id in the HTML  <-  the data array that fills it
 */
const HIDE_WHEN_EMPTY = [
  { section: 'products', data: 'RH_PRODUCTS' },
];

/* ------------------------------------------------------------------
   Run render.js with just enough DOM for it to do its job.
   render.js touches exactly two APIs — document.getElementById and
   .innerHTML — so the shim is honest rather than a fake browser.
   ------------------------------------------------------------------ */
function collectRenderedHTML() {
  const captured = new Map();

  const sandbox = {
    window: {},
    document: {
      getElementById(id) {
        if (!captured.has(id)) {
          captured.set(id, {
            innerHTML: '',
            /* nothing is prerendered yet at build time — that is what this
               script is for — so the mount() guard in render.js must pass. */
            hasAttribute: () => false,
          });
        }
        return captured.get(id);
      },
    },
    console,
  };
  sandbox.window.document = sandbox.document;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  /* data first, then the image manifest, then the renderer — the same
     order the pages load them in. */
  for (const file of [
    'data/projects.js',
    'data/products.js',
    'data/journey.js',
    'data/reviews.js',
    'js/img-manifest.js',
    'js/render.js',
  ]) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    try {
      vm.runInContext(src, sandbox, { filename: file });
    } catch (err) {
      throw new Error(`prerender: ${file} threw — ${err.message}`);
    }
  }

  return { captured, data: sandbox.window };
}

/* Toggle a whole section in or out of the document.
   `hidden` alone is not enough — the template's own display rules outrank the
   UA stylesheet — so the inline display goes with it. Both are removed again
   when the section has content, which is what makes this reversible. */
function setSectionHidden(html, sectionId, hide) {
  const re = new RegExp(`<([a-zA-Z][\\w-]*)\\b([^>]*\\bid=["']${sectionId}["'][^>]*)>`, 'i');
  const m = re.exec(html);
  if (!m) return { html, found: false };

  let attrs = m[2]
    .replace(/\s*\bhidden\b(?:=(["']).*?\1)?/gi, '')
    .replace(/\s*\bdata-rh-empty\b(?:=(["']).*?\1)?/gi, '')
    .replace(/\s*style=(["'])\s*display\s*:\s*none\s*;?\s*\1/gi, '');

  if (hide) attrs += ' hidden data-rh-empty style="display:none"';

  return {
    html: html.slice(0, m.index) + `<${m[1]}${attrs}>` + html.slice(m.index + m[0].length),
    found: true,
  };
}

/* ------------------------------------------------------------------
   Find the matching close tag for the element that opens at `openEnd`.
   A regex cannot do this: the containers hold nested divs, so we count
   depth over the tags that actually nest.
   ------------------------------------------------------------------ */
function findCloseTag(html, openEnd, tagName) {
  const re = new RegExp(`<(/?)${tagName}\\b[^>]*?(/?)>`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1;
  let m;
  while ((m = re.exec(html)) !== null) {
    const isClose = m[1] === '/';
    const selfClosing = m[2] === '/';
    if (selfClosing) continue;
    depth += isClose ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

/* Locate <tag ... id="theId" ...> and return where its children start/end. */
function locateHost(html, id) {
  const re = new RegExp(`<([a-zA-Z][\\w-]*)\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i');
  const m = re.exec(html);
  if (!m) return null;

  const tagName = m[1];
  const openStart = m.index;
  const openEnd = m.index + m[0].length;
  const closeStart = findCloseTag(html, openEnd, tagName);
  if (closeStart === -1) {
    throw new Error(`prerender: no matching </${tagName}> for #${id}`);
  }
  return { tagName, openStart, openTag: m[0], openEnd, closeStart };
}

/* Stamp the container so render.js knows the work is already done. */
function markOpenTag(openTag) {
  if (/\bdata-rh-prerendered\b/.test(openTag)) return openTag;
  return openTag.replace(/\s*\/?>$/, (end) => ' data-rh-prerendered' + end);
}

function inject(html, id, contentHTML) {
  const host = locateHost(html, id);
  if (!host) return { html, found: false };

  const body = contentHTML.trim()
    ? `\n<!-- rh:prerender ${id} — generated by scripts/prerender.mjs, do not edit by hand -->\n` +
      contentHTML.replace(/\s+$/, '') +
      `\n<!-- /rh:prerender ${id} -->\n`
    : '';

  const next =
    html.slice(0, host.openStart) +
    markOpenTag(host.openTag) +
    body +
    html.slice(host.closeStart);

  return { html: next, found: true };
}

/* ------------------------------------------------------------------ */
const { captured, data } = collectRenderedHTML();
const stale = [];
let wrote = 0;

for (const [file, ids] of Object.entries(PAGES)) {
  const path = join(ROOT, file);
  const original = readFileSync(path, 'utf8');
  let html = original;
  const missing = [];

  for (const id of ids) {
    const cap = captured.get(id);
    const content = cap ? String(cap.innerHTML || '') : '';
    const res = inject(html, id, content);
    if (!res.found) missing.push(id);
    html = res.html;
  }

  if (missing.length) {
    throw new Error(`prerender: ${file} is missing container(s): ${missing.join(', ')}`);
  }

  for (const { section, data: key } of HIDE_WHEN_EMPTY) {
    const list = data[key];
    const empty = !Array.isArray(list) || list.length === 0;
    const res = setSectionHidden(html, section, empty);
    if (res.found && empty) console.log(`  ${file} — #${section} hidden (${key} is empty)`);
    html = res.html;
  }

  if (html === original) {
    console.log(`  ${file} — already current`);
    continue;
  }

  if (CHECK) {
    stale.push(file);
  } else {
    writeFileSync(path, html);
    wrote++;
    console.log(`  ${file} — prerendered ${ids.length} container(s)`);
  }
}

if (CHECK && stale.length) {
  console.error(
    `\nPrerendered HTML is out of date: ${stale.join(', ')}\n` +
    `Run "npm run prerender" and commit the result.`
  );
  process.exit(1);
}

console.log(CHECK ? 'Prerendered HTML is current.' : `Prerender OK (${wrote} file(s) written).`);
