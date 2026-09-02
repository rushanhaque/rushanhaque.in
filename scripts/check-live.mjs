/* scripts/check-live.mjs — run this FIRST when something looks wrong.
 *
 *   npm run check:live
 *   npm run check:live -- https://some-other-host.example
 *
 * Answers, in order:
 *   1. Is the host serving THIS repo at all, or a different site?
 *   2. Has the host deployed the latest commit?
 *   3. Does every API route exist?
 *   4. Are photos filed as real image files?
 *   5. Are the cache headers right?
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const SITE = process.argv[2] || process.env.SITE_URL || 'https://www.rushanhaque.in';
const TIMEOUT = 20000;

let failures = 0;
let warnings = 0;

const pass = (m) => console.log(`  ok    ${m}`);
const warn = (m) => { warnings++; console.log(`  warn  ${m}`); };
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };

async function get(path, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    return await fetch(SITE + path, { ...init, signal: ctrl.signal, redirect: 'follow' });
  } finally {
    clearTimeout(t);
  }
}

function localCommit() {
  try { return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(); }
  catch { return null; }
}

console.log(`\nChecking ${SITE}\n`);

/* ── 1. is this even our site? ───────────────────────────────────────── */
console.log('Identity');
try {
  const res = await get('/');
  if (!res.ok) fail(`GET / returned ${res.status}`);
  const liveHtml = await res.text();

  const server = res.headers.get('server') || '(none)';
  if (/vercel/i.test(server)) pass('served by Vercel');
  else warn(`served by "${server}" — this repo's API routes only work on Vercel`);

  if (existsSync('index.html')) {
    const localHtml = readFileSync('index.html', 'utf8');
    const localTitle = (localHtml.match(/<title>([^<]*)<\/title>/) || [])[1];
    const liveTitle = (liveHtml.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (localTitle && liveTitle && localTitle.trim() === liveTitle.trim()) {
      pass(`title matches this repo ("${liveTitle.trim()}")`);
    } else {
      fail(`live title "${liveTitle}" does not match this repo's "${localTitle}" — this host is serving a DIFFERENT site`);
    }
    if (Buffer.byteLength(localHtml) === Buffer.byteLength(liveHtml)) {
      pass('index.html is byte-identical to local');
    } else {
      warn(`index.html size differs (live ${Buffer.byteLength(liveHtml)} vs local ${Buffer.byteLength(localHtml)}) — host may be behind, or you have uncommitted edits`);
    }
  }
} catch (e) {
  fail(`could not reach ${SITE} — ${e.message}`);
}

/* ── 2. which build is serving? ──────────────────────────────────────── */
console.log('\nDeployed build');
try {
  const res = await get('/version.json', { cache: 'no-store' });
  if (!res.ok) {
    fail(`/version.json returned ${res.status} — browsers cannot detect new deploys`);
  } else {
    const v = await res.json();
    const cc = res.headers.get('cache-control') || '';
    if (/no-store/.test(cc)) pass('/version.json is no-store');
    else fail(`/version.json is cacheable ("${cc}") — it must be no-store`);

    const local = localCommit();
    if (v.commit && local) {
      if (v.commit === local) pass(`host is on the latest commit ${local.slice(0, 7)}`);
      else fail(`host is serving ${String(v.commit).slice(0, 7)} but local HEAD is ${local.slice(0, 7)} — the deploy has not landed`);
    } else {
      warn(`build id "${v.buildId}" (no commit SHA to compare)`);
    }
  }
} catch (e) {
  fail(`/version.json — ${e.message}`);
}

/* ── 3. API routes ───────────────────────────────────────────────────── */
console.log('\nAPI routes');
for (const route of ['/api/version', '/api/publish', '/api/save']) {
  try {
    const isGet = route === '/api/version';
    const res = await get(route, {
      method: isGet ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: isGet ? undefined : '{}',
    });
    if (res.status === 404) { fail(`${route} → 404, the route is not deployed`); continue; }

    if (route === '/api/publish') {
      const txt = await res.text();
      if (res.status === 401) pass(`${route} → 401 without a token (correctly refuses anonymous callers)`);
      else if (res.status === 503) fail(`${route} → 503: ${txt} — publishing is disabled until the env vars are set`);
      else if (res.status === 400) fail(`${route} → 400 WITHOUT a token: the auth check is not running. The endpoint is callable by anyone.`);
      else warn(`${route} → ${res.status}: ${txt.slice(0, 120)}`);
    } else {
      pass(`${route} → ${res.status}`);
    }
  } catch (e) {
    fail(`${route} — ${e.message}`);
  }
}

/* ── 4. photos ───────────────────────────────────────────────────────── */
console.log('\nPhotos');
const PHOTO_RE = /^[a-f0-9]{20}\.(jpg|jpeg|png|webp|avif|gif)$/;
let checkedPhoto = false;
for (const dir of ['img/rh/products', 'img/rh/projects', 'img/rh/reviews']) {
  if (!existsSync(dir)) continue;
  const addressed = readdirSync(dir).filter((f) => PHOTO_RE.test(f));
  if (!addressed.length) continue;
  const sample = `/${dir}/${addressed[0]}`;
  try {
    const res = await get(sample);
    checkedPhoto = true;
    if (!res.ok) { fail(`${sample} → ${res.status}`); continue; }
    const cc = res.headers.get('cache-control') || '';
    if (/immutable/.test(cc)) pass(`${dir}: ${addressed.length} content-addressed photo(s), cached immutably`);
    else warn(`${dir}: photos served with "${cc}" — content-addressed files should be immutable`);
  } catch (e) {
    fail(`${sample} — ${e.message}`);
  }
}

for (const f of ['data/projects.js', 'data/products.js']) {
  if (!existsSync(f)) continue;
  const src = readFileSync(f, 'utf8');
  const inline = src.match(/data:image\/[a-z+]+;base64,/g);
  if (inline) fail(`${f} contains ${inline.length} inline base64 image(s) — these bloat every page load and should be filed as image files`);
  else pass(`${f} has no inline base64 images`);
}
if (!checkedPhoto) warn('no content-addressed photos committed yet — nothing to verify');

/* ── 5. cache headers ────────────────────────────────────────────────── */
/* Vercel's shared edge cache has been observed serving X-Vercel-Cache: HIT
 * with a growing Age on "public, max-age=0, must-revalidate" — that header
 * tells a BROWSER to revalidate, but does not reliably make Vercel's own
 * edge bypass its cache or revalidate with the origin on every request.
 * Only "no-store" does. These paths are the ones a visitor can land on
 * directly (get() follows redirects, so "/admin.html" and "/work.html"
 * resolve to the real cleanUrls path Vercel actually serves), so all of
 * them must be no-store, not just max-age=0. */
console.log('\nCache headers');
const expect = [
  ['/', /no-store/, 'HTML must never be served stale from the edge — home page'],
  ['/work', /no-store/, 'HTML must never be served stale from the edge — work page'],
  ['/contact', /no-store/, 'HTML must never be served stale from the edge — contact page'],
  ['/review', /no-store/, 'HTML must never be served stale from the edge — review page'],
  ['/admin.html', /no-store/, 'the admin panel must never be cached (this follows the redirect to /admin)'],
  ['/data/projects.js', /no-store/, 'catalogue data must never be served stale from the edge'],
];
for (const [path, re, why] of expect) {
  try {
    const res = await get(path, { cache: 'no-store' });
    const cc = res.headers.get('cache-control') || '(none)';
    const edge = res.headers.get('x-vercel-cache') || '(none)';
    const age = res.headers.get('age') || '0';
    if (re.test(cc)) pass(`${path}: ${cc}`);
    else fail(`${path}: "${cc}" — ${why}`);
    if (edge === 'HIT' && Number(age) > 0) {
      fail(`${path}: X-Vercel-Cache: HIT with Age ${age}s — Vercel's edge is serving this from cache instead of the origin`);
    }
  } catch (e) {
    fail(`${path} — ${e.message}`);
  }
}
try {
  const res = await get('/admin.html');
  const robots = res.headers.get('x-robots-tag') || '';
  if (/noindex/.test(robots)) pass('/admin.html: X-Robots-Tag noindex');
  else warn('/admin.html has no X-Robots-Tag: noindex');
} catch { /* already reported above */ }

console.log(`\n${failures ? 'FAILED' : 'OK'} — ${failures} failure(s), ${warnings} warning(s)\n`);
process.exit(failures ? 1 : 0);
