/* test/pages.test.mjs — the generated service and location network.
 *
 * Twenty generated pages are twenty chances for a silent regression: a shell
 * change that stops propagating, a page that loses its canonical, a doorway
 * page that creeps in because two cities ended up with the same body text.
 * These assert the properties that make the network legitimate and indexable.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SERVICES } from '../data/seo-services.mjs';
import { LOCATIONS, locationFAQ } from '../data/seo-locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(ROOT, f), 'utf8');
const SITE = 'https://www.rushanhaque.in';

const ALL = [
  ...SERVICES.map((s) => ({ slug: s.slug, title: s.title, kind: 'service' })),
  ...LOCATIONS.map((l) => ({ slug: l.slug, title: l.title, kind: 'location' })),
];

test('generated pages are up to date with their data', () => {
  execFileSync(process.execPath, [join(ROOT, 'scripts', 'build-pages.mjs'), '--check'], {
    cwd: ROOT, stdio: 'pipe',
  });
});

test('every generated page exists and canonicalises to its own URL', () => {
  for (const p of [...ALL, { slug: 'services' }, { slug: 'areas-served' }]) {
    const file = `${p.slug}.html`;
    assert.ok(existsSync(join(ROOT, file)), `${file} is missing`);
    const html = read(file);
    assert.ok(
      html.includes(`<link rel="canonical" href="${SITE}/${p.slug}">`),
      `${file} does not canonicalise to ${SITE}/${p.slug}`
    );
  }
});

test('every generated page has exactly one h1', () => {
  for (const p of ALL) {
    const n = (read(`${p.slug}.html`).match(/<h1[\s>]/g) || []).length;
    assert.equal(n, 1, `${p.slug}.html has ${n} <h1> elements`);
  }
});

test('every generated page carries parseable JSON-LD with a FAQPage', () => {
  for (const p of ALL) {
    const html = read(`${p.slug}.html`);
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(m, `${p.slug}.html has no JSON-LD`);
    const graph = JSON.parse(m[1])['@graph'];
    assert.ok(Array.isArray(graph), `${p.slug}.html JSON-LD has no @graph`);
    assert.ok(
      graph.some((n) => n['@type'] === 'FAQPage'),
      `${p.slug}.html has no FAQPage node`
    );
    assert.ok(
      graph.some((n) => n['@type'] === 'Service'),
      `${p.slug}.html has no Service node`
    );
  }
});

test('every FAQ answer in schema is visible in the page body', () => {
  /* Google only honours FAQPage markup whose answers are on the page. This is
     the assertion that keeps the generator and the schema honest. */
  for (const loc of LOCATIONS) {
    const html = read(`${loc.slug}.html`);
    for (const [q] of locationFAQ(loc)) {
      const needle = q.replace(/&/g, '&amp;');
      assert.ok(html.includes(needle), `${loc.slug}.html is missing visible FAQ: "${q}"`);
    }
  }
  for (const svc of SERVICES) {
    const html = read(`${svc.slug}.html`);
    for (const [q] of svc.faq) {
      const needle = q.replace(/&/g, '&amp;');
      assert.ok(html.includes(needle), `${svc.slug}.html is missing visible FAQ: "${q}"`);
    }
  }
});

test('location pages are not doorway pages — each body is substantially unique', () => {
  /* The spam-policy line: near-identical pages differing only by a place name.
     Comparing the industry prose, which is the part written per city, catches
     a future city added by copy-pasting another one's content. */
  const seen = new Map();
  for (const loc of LOCATIONS) {
    const body = loc.industry.prose.join(' ');
    assert.ok(body.length > 400, `${loc.slug}: industry prose is too thin (${body.length} chars)`);
    for (const [otherSlug, otherBody] of seen) {
      assert.notEqual(body, otherBody, `${loc.slug} duplicates ${otherSlug}`);
      /* crude overlap check: no two cities should share most of their words */
      const a = new Set(body.toLowerCase().split(/\W+/));
      const b = new Set(otherBody.toLowerCase().split(/\W+/));
      const shared = [...a].filter((w) => b.has(w)).length;
      const ratio = shared / Math.min(a.size, b.size);
      assert.ok(ratio < 0.75, `${loc.slug} and ${otherSlug} overlap ${(ratio * 100).toFixed(0)}%`);
    }
    seen.set(loc.slug, body);
  }
});

test('every generated page reaches the hubs and the contact page', () => {
  for (const p of ALL) {
    const html = read(`${p.slug}.html`);
    assert.ok(html.includes('href="/contact"'), `${p.slug}.html has no contact link`);
    assert.ok(html.includes('href="/services"'), `${p.slug}.html has no services hub link`);
    assert.ok(html.includes('href="/areas-served"'), `${p.slug}.html has no areas hub link`);
  }
});

test('every city page has more than one inbound link', () => {
  /* A page linked only from the hub is close enough to orphaned that it will
     not be crawled or ranked seriously. */
  const files = [...ALL.map((p) => `${p.slug}.html`), 'services.html', 'areas-served.html',
                 'index.html', 'work.html', 'contact.html'];
  for (const loc of LOCATIONS) {
    const inbound = files.filter(
      (f) => f !== `${loc.slug}.html` && existsSync(join(ROOT, f)) &&
             read(f).includes(`href="/${loc.slug}"`)
    ).length;
    assert.ok(inbound >= 2, `${loc.slug} has only ${inbound} inbound link(s)`);
  }
});

test('generated pages use the www canonical host everywhere', () => {
  for (const p of ALL) {
    const html = read(`${p.slug}.html`);
    assert.ok(
      !/https:\/\/rushanhaque\.in/.test(html),
      `${p.slug}.html references the redirecting apex host`
    );
  }
});

test('service and city slugs are unique across the whole network', () => {
  const slugs = [...ALL.map((p) => p.slug), 'services', 'areas-served',
                 'website-designer-in-moradabad', 'work', 'contact', 'review'];
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  assert.deepEqual(dupes, [], `duplicate slugs would collide as files: ${dupes.join(', ')}`);
});
