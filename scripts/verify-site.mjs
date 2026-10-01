import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const origin = process.env.TEST_ORIGIN || 'http://localhost:5173';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) throw Error('Use a local preview only.');
const projects = JSON.parse(readFileSync('content/projects.json', 'utf8'));
const editorial = JSON.parse(readFileSync('content/editorial.json', 'utf8'));
const sourcePages = JSON.parse(readFileSync('content/source-pages.json','utf8'));
const routes = [...sourcePages.map(p=>'/'+p.slug),'/products','/', '/projects', '/writing', '/certifications', '/reviews', '/privacy', '/accessibility', '/contact', '/schedule', '/write-a-review', '/studio', ...projects.map(p => '/projects/' + p.slug), ...editorial.writings.map(w => '/writing/' + w.slug)];
const assets = new Set(), internalLinks = new Set();
for (const route of routes) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.ok(html.includes('main-content'), route + ' has main content');
  assert.ok(!html.includes('Internal Server Error'), route + ' renders');
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#]*)"/g)) {
    const path = match[1].replaceAll('&amp;', '&');
    if (path.startsWith('/images/') || path.startsWith('/fonts/')) assets.add(path);
    else if (!path.startsWith('/_next/') && !path.startsWith('/api/')) internalLinks.add(path);
  }
}
for (const path of [...assets, ...internalLinks]) assert.equal((await fetch(origin + path)).status, 200, 'Link or asset: ' + path);
for (const route of ['/not-a-real-page', '/projects/does-not-exist', '/writing/does-not-exist']) assert.equal((await fetch(origin + route)).status, 404, route);
for (const route of ['/about', '/experience', '/playground', '/insights', '/review', '/certificates']) assert.equal((await fetch(origin + route, { redirect: 'manual' })).status, 308, route + ' redirect');
for(const page of sourcePages){const response=await fetch(origin+'/'+page.slug+'.html',{redirect:'manual'});assert.equal(response.status,308,page.slug+' legacy redirect');assert.ok(response.headers.get('location')?.endsWith('/'+page.slug),page.slug+' destination');}
const report = { origin, routes: routes.length, assets: assets.size, internalLinks: internalLinks.size, notFound: 3, redirects: 6 + sourcePages.length, submissions: 'not requested' };
for (const hostname of ['localhost', '127.0.0.1']) {
  const alias = new URL(origin); alias.hostname = hostname;
  const response = await fetch(alias.origin + '/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: alias.origin }, body: '{}' });
  assert.equal(response.status, 422, hostname + ' reaches validation through the same-origin guard');
}
// Opt in only against a disposable local database, never a production connection.
if (process.env.TEST_SUBMISSIONS === '1') {
  const id = crypto.randomUUID();
  const payload = { id, kind: 'contact', name: 'Portfolio QA', email: 'portfolio-qa@example.com', company: 'Local test', service: 'Digital experiences', budget: 'Let’s discuss', timeline: 'Just exploring', message: 'An isolated local test of the portfolio enquiry flow.', consent: true, website: '' };
  const post = (data, headers = {}) => fetch(origin + '/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers }, body: JSON.stringify(data) });
  let response = await post(payload);
  assert.equal(response.status, 201, await response.clone().text());
  assert.equal((await response.json()).id, id);
  response = await post(payload);
  assert.equal(response.status, 200, 'idempotent retry');
  assert.equal((await response.json()).id, id);
  const review = { ...payload, id: crypto.randomUUID(), kind: 'review', rating: 5, publishConsent: true };
  assert.equal((await post(review)).status, 201, 'review saved');
  const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  assert.equal((await post({ ...payload, id: crypto.randomUUID(), kind: 'call', date: tomorrow, time: '10:00', timezone: 'Asia/Kolkata' })).status, 201, 'call saved');
  assert.equal((await post({ ...payload, id: crypto.randomUUID(), email: 'invalid' })).status, 422, 'email validation');
  assert.equal((await post({ ...payload, id: crypto.randomUUID(), consent: false })).status, 422, 'privacy consent');
  assert.equal((await post({ ...payload, id: crypto.randomUUID(), website: 'bot.example' })).status, 422, 'honeypot');
  assert.equal((await post(payload, { Origin: 'https://elsewhere.example' })).status, 403, 'origin validation');
  assert.equal((await post({ ...payload, message: 'a'.repeat(17000) })).status, 400, 'body limit');
  assert.equal((await post({ ...payload, id: crypto.randomUUID(), kind: 'call', date: '2020-01-01', time: '10:00', timezone: 'Asia/Kolkata' })).status, 422, 'past date');
  assert.equal((await post({ ...review, id: crypto.randomUUID(), rating: 6 })).status, 422, 'rating bound');
  assert.equal((await post({ ...review, id: crypto.randomUUID(), publishConsent: false })).status, 422, 'publication consent');
  report.submissions = 'contact, review, call, idempotency and eight validation cases passed';
}
mkdirSync('outputs', { recursive: true });
writeFileSync('outputs/site-verification.json', JSON.stringify(report, null, 2));
console.log('PASS', report);
