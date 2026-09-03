/* The one guarantee this site cannot afford to lose again: the work is in the
 * HTML as served. If these fail, a crawler, a link preview, or an AI assistant
 * that does not run JS sees a portfolio with no portfolio in it. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');

/* Strip every <script> body so we are asserting on what a JS-less client
   actually gets, not on the data files that happen to be inlined nearby. */
function withoutScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

test('homepage ships its work without JavaScript', () => {
  const html = withoutScripts(read('index.html'));
  for (const needle of ['ErfolgLiving', 'Aurelio', 'Casa&amp;Crop']) {
    assert.ok(html.includes(needle), `index.html is missing "${needle}" in served HTML`);
  }
});

test('homepage ships its testimonials without JavaScript', () => {
  const html = withoutScripts(read('index.html'));
  assert.ok(html.includes('Danish Faiz'), 'index.html is missing testimonial content');
  assert.ok(html.includes('Erfolg Living'), 'index.html is missing testimonial attribution');
});

test('work archive ships every project without JavaScript', () => {
  const html = withoutScripts(read('work.html'));
  for (const needle of ['ErfolgLiving', 'Quorum', 'Superlatives', 'CodeSense AI']) {
    assert.ok(html.includes(needle), `work.html is missing "${needle}" in served HTML`);
  }
});

test('prerendered HTML is up to date with data/', () => {
  /* Fails loudly if data/*.js changed and nobody re-ran the prerender. */
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'prerender.mjs'), '--check'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
});

test('canonical URLs point at the live host', () => {
  /* www, not the apex. The apex 308-redirects to www, so an apex canonical
     names a URL that never returns 200 — Google then has to resolve the
     conflict itself and may pick a canonical you did not intend. */
  for (const [file, expected] of [
    ['index.html', 'https://www.rushanhaque.in/'],
    ['work.html', 'https://www.rushanhaque.in/work'],
    ['contact.html', 'https://www.rushanhaque.in/contact'],
    ['website-designer-in-moradabad.html', 'https://www.rushanhaque.in/website-designer-in-moradabad'],
  ]) {
    const html = read(file);
    assert.ok(
      html.includes(`<link rel="canonical" href="${expected}">`),
      `${file} canonical is not ${expected}`
    );
    assert.ok(!html.includes('rushanhaque.online'), `${file} still references the old domain`);
    assert.ok(
      !/https:\/\/rushanhaque\.in/.test(html),
      `${file} still references the redirecting apex host`
    );
  }
});

const PAGES = ['index.html', 'work.html', 'contact.html', 'review.html', '404.html'];

test('every page offers a skip link to the main landmark', () => {
  for (const f of PAGES) {
    const html = read(f);
    assert.ok(
      html.includes('<a class="rh-skip" href="#mxd-page-content">'),
      `${f} has no skip link`
    );
    assert.ok(html.includes('id="mxd-page-content"'), `${f} has no skip-link target`);
  }
});

test('keyboard focus is never blanket-disabled on buttons', () => {
  const css = read('css/main.css');
  assert.ok(
    !/button:active,\s*button:focus\s*\{\s*outline:\s*none/.test(css),
    'main.css disables the focus ring for all button focus, keyboard included'
  );
  assert.ok(
    css.includes('button:focus:not(:focus-visible)'),
    'the button outline reset should be scoped to :not(:focus-visible)'
  );
});

test('meta keywords are gone', () => {
  for (const f of PAGES) {
    assert.ok(!read(f).includes('name="keywords"'), `${f} still ships <meta keywords>`);
  }
});

test('the review form is off the public pages and noindexed', () => {
  assert.ok(!read('index.html').includes('rh-review-form'), 'review form is still on the homepage');
  const review = read('review.html');
  assert.ok(review.includes('rh-review-form'), '/review lost the form');
  assert.ok(
    review.includes('<meta name="robots" content="noindex, nofollow">'),
    '/review is not noindexed'
  );
});

test('project images describe the project, not the medium', () => {
  const html = read('work.html');
  assert.ok(!/alt="[^"]*Preview"/.test(html), 'generic "… Preview" alt text is back');
  assert.ok(html.includes('alt="ErfolgLiving — Web freelance project"'), 'descriptive alt missing');
});
