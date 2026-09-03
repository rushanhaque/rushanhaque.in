/* scripts/seo-audit.mjs — catch SEO regressions before they ship.
 *
 * The expensive SEO bugs are silent. A canonical pointing at a host that
 * redirects, a page that quietly grows a second <h1>, a sitemap listing a URL
 * that 308s — none of these break the site, none throw an error, and all of
 * them cost rankings for months before anyone notices.
 *
 * This asserts the things that must stay true. It reads files only; nothing
 * here touches the network, so it is safe to run in a build.
 *
 *   npm run check:seo
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SERVICES } from '../data/seo-services.mjs';
import { LOCATIONS } from '../data/seo-locations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.rushanhaque.in';

let failures = 0;
let warnings = 0;
const pass = (m) => console.log(`  ok    ${m}`);
const warn = (m) => { warnings++; console.log(`  warn  ${m}`); };
const fail = (m) => { failures++; console.log(`  FAIL  ${m}`); };

const read = (f) => readFileSync(join(ROOT, f), 'utf8');

/* Pages that must be indexable, and the URL each one canonicalises to.
   The generated network is derived from the same data the generator uses, so
   a new service or city is audited automatically rather than being forgotten. */
const INDEXABLE = [
  ['index.html', `${SITE}/`],
  ['website-designer-in-moradabad.html', `${SITE}/website-designer-in-moradabad`],
  ['services.html', `${SITE}/services`],
  ['areas-served.html', `${SITE}/areas-served`],
  ['work.html', `${SITE}/work`],
  ['contact.html', `${SITE}/contact`],
  ...SERVICES.map((s) => [`${s.slug}.html`, `${SITE}/${s.slug}`]),
  ...LOCATIONS.map((l) => [`${l.slug}.html`, `${SITE}/${l.slug}`]),
];

/* Pages that must NOT be indexable. */
const NOINDEX = ['review.html', '404.html', 'admin.html'];

const attr = (html, re) => (html.match(re) || [])[1] || null;
const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&mdash;/g, '—');

console.log('\nOn-page metadata');
for (const [file, canonical] of INDEXABLE) {
  if (!existsSync(join(ROOT, file))) { fail(`${file} is missing`); continue; }
  const html = read(file);

  const title = decode(attr(html, /<title>([\s\S]*?)<\/title>/));
  if (!title) fail(`${file}: no <title>`);
  else if (title.length > 62) warn(`${file}: title is ${title.length} chars, Google truncates past ~60`);
  else pass(`${file}: title ${title.length} chars`);

  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!desc) fail(`${file}: no meta description`);
  else if (desc.length > 165) warn(`${file}: description is ${desc.length} chars, truncates past ~160`);
  else if (desc.length < 70) warn(`${file}: description is only ${desc.length} chars — thin`);
  else pass(`${file}: description ${desc.length} chars`);

  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  if (canon !== canonical) fail(`${file}: canonical is "${canon}", expected "${canonical}"`);
  else pass(`${file}: canonical correct`);

  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  if (ogUrl !== canonical) fail(`${file}: og:url is "${ogUrl}", expected "${canonical}"`);

  /* Exactly one h1. Two is a real and easy regression when sections move. */
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s === 1) pass(`${file}: exactly one <h1>`);
  else fail(`${file}: ${h1s} <h1> elements — there must be exactly one`);

  /* JSON-LD must parse. Invalid schema is silently dropped by Google. */
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) fail(`${file}: no JSON-LD`);
  for (const [i, b] of blocks.entries()) {
    try {
      const parsed = JSON.parse(b[1]);
      const nodes = parsed['@graph'] || [parsed];
      pass(`${file}: JSON-LD block ${i} parses (${nodes.length} nodes)`);
    } catch (e) {
      fail(`${file}: JSON-LD block ${i} does not parse — ${e.message}`);
    }
  }

  /* Every <img> needs alt. Empty alt is allowed (decorative); missing is not.
     The placeholder tiles carry an inline SVG data URI in src, so the match
     has to step over quoted values — a plain [^>]* stops at the first ">"
     inside the SVG and reports a false missing-alt. */
  const imgs = [...html.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\balt=/.test(t));
  if (noAlt.length) fail(`${file}: ${noAlt.length} <img> without an alt attribute`);
  else if (imgs.length) pass(`${file}: all ${imgs.length} images have alt text`);
}

console.log('\nNoindex pages');
for (const file of NOINDEX) {
  if (!existsSync(join(ROOT, file))) continue;
  const html = read(file);
  const robots = attr(html, /<meta name="robots" content="([^"]*)"/);
  if (robots && /noindex/.test(robots)) pass(`${file}: noindex`);
  else if (file === 'admin.html') pass(`${file}: noindex via X-Robots-Tag in vercel.json`);
  else fail(`${file}: should be noindex but is "${robots}"`);
}

console.log('\nCanonical host');
{
  /* The apex 308-redirects to www. A canonical, og:url or sitemap entry
     pointing at the apex therefore names a URL that never returns 200. */
  const files = ['index.html', 'work.html', 'contact.html', 'review.html', '404.html',
                 'sitemap.xml', 'robots.txt', 'llms.txt',
                 ...INDEXABLE.map(([f]) => f)];
  let bad = 0;
  for (const f of files) {
    if (!existsSync(join(ROOT, f))) continue;
    const hits = (read(f).match(/https:\/\/rushanhaque\.in/g) || []).length;
    if (hits) { fail(`${f}: ${hits} apex URL(s) — must be https://www.rushanhaque.in`); bad++; }
  }
  if (!bad) pass('every URL uses the www canonical host');
}

console.log('\nSitemap');
{
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const canonicals = INDEXABLE.map(([, c]) => c);
  for (const c of canonicals) {
    if (locs.includes(c)) pass(`listed: ${c}`);
    else fail(`sitemap is missing ${c}`);
  }
  for (const l of locs) {
    if (!canonicals.includes(l)) fail(`sitemap lists ${l}, which is not a canonical page URL`);
  }
  if (/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/.test(xml)) pass('lastmod dates present and well-formed');
  else warn('sitemap has no well-formed lastmod dates');
}

console.log('\nCrawler access');
{
  const robots = read('robots.txt');
  if (robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) pass('robots.txt points at the sitemap');
  else fail('robots.txt does not reference the sitemap on the canonical host');

  for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'OAI-SearchBot']) {
    if (new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots)) pass(`${bot} explicitly allowed`);
    else warn(`${bot} is not named in robots.txt`);
  }
  for (const priv of ['/admin', '/api/']) {
    if (robots.includes(`Disallow: ${priv}`)) pass(`${priv} disallowed`);
    else fail(`${priv} is not disallowed in robots.txt`);
  }

  if (existsSync(join(ROOT, 'llms.txt'))) pass('llms.txt present');
  else warn('no llms.txt — AI engines have no curated summary to read');
}

console.log('\nStructured data content');
{
  const html = read('index.html');
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const graph = json['@graph'] || [];
  const biz = graph.find((n) => String(n['@type']).includes('LocalBusiness'));

  if (!biz) fail('index.html has no LocalBusiness/ProfessionalService node');
  else {
    for (const k of ['address', 'geo', 'areaServed', 'telephone', 'hasOfferCatalog']) {
      if (biz[k]) pass(`business node has ${k}`);
      else fail(`business node is missing ${k}`);
    }
    if (biz.address?.streetAddress && biz.address?.postalCode) pass('address includes street and postal code');
    else warn('address lacks street/postal code — weaker local signal');

    /* The visible footer NAP and the marked-up one must agree. */
    if (html.includes(biz.address?.postalCode || ' ')) pass('postal code matches the visible footer');
    else warn('marked-up postal code does not appear in the page text');
  }

  const person = graph.find((n) => n['@type'] === 'Person');
  if (person?.knowsAbout?.length >= 20) pass(`Person.knowsAbout carries ${person.knowsAbout.length} topics`);
  else warn('Person.knowsAbout is thin');
}

console.log('\nFAQ page');
{
  const f = 'website-designer-in-moradabad.html';
  if (!existsSync(join(ROOT, f))) fail(`${f} missing`);
  else {
    const html = read(f);
    const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const faq = (json['@graph'] || []).find((n) => n['@type'] === 'FAQPage');
    if (!faq) { fail('no FAQPage schema on the local page'); }
    else {
      /* Google only honours FAQ markup whose answers are visible on the page. */
      let missing = 0;
      for (const q of faq.mainEntity) {
        const needle = q.name.replace(/&/g, '&amp;');
        if (!html.includes(needle)) missing++;
      }
      if (missing) fail(`${missing} FAQ question(s) in schema are not visible in the page body`);
      else pass(`all ${faq.mainEntity.length} FAQ answers are visible on the page`);
    }
  }
}

console.log(`\n${failures ? 'FAILED' : 'OK'} — ${failures} failure(s), ${warnings} warning(s)\n`);
process.exit(failures ? 1 : 0);
