import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:5173';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) throw Error('CMS verification is local only.');
const signIn = await fetch(origin + '/signin-with-chatgpt?return_to=/studio', { redirect: 'manual' });
const cookie = signIn.headers.get('set-cookie')?.split(';')[0];
assert.ok(cookie, 'Local sign-in cookie');
const headers = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };
const read = async () => { const response = await fetch(origin + '/api/admin/content?file=projects', { headers }); assert.equal(response.status, 200, await response.clone().text()); return response.json(); };
const post = (path, data, extra = {}) => fetch(origin + path, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(data) });
assert.equal((await fetch(origin + '/api/admin/content?file=projects')).status, 403);
assert.equal((await fetch(origin + '/api/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
const original = await read();
const draft = structuredClone(original.data);
draft[0].title = 'CMS verification — temporary local draft';
let response = await post('/api/admin/content', { file: 'projects', action: 'save', data: draft, revision: original.revision, baseSha: original.baseSha }, { Origin: 'https://other.example' });
assert.ok([400, 403].includes(response.status), 'Cross-origin edit rejected');
response = await post('/api/admin/content', { file: 'projects', action: 'save', data: draft, revision: original.revision, baseSha: original.baseSha });
assert.equal(response.status, 200, await response.clone().text());
const saved = await response.json();
try {
  response = await post('/api/admin/content', { file: 'projects', action: 'save', data: draft, revision: original.revision, baseSha: original.baseSha });
  assert.equal(response.status, 409, 'Stale draft cannot overwrite');
  assert.ok(!(await (await fetch(origin + '/projects/' + draft[0].slug)).text()).includes(draft[0].title), 'Draft remains private');
  response = await post('/api/admin/publish', { file: 'projects', action: 'publish', revision: saved.revision, publicationRevision: original.publicationRevision });
  assert.equal(response.status, 200, await response.clone().text());
  const published = await response.json();
  try {
    const html = await (await fetch(origin + '/projects/' + draft[0].slug)).text();
    assert.ok(html.includes(draft[0].title), 'Published title appears in server-rendered detail page');
    const home = await (await fetch(origin + '/')).text();
    assert.ok(home.includes(draft[0].title), 'Home receives published content');
    response = await post('/api/admin/publish', { file: 'projects', action: 'publish', revision: saved.revision, publicationRevision: original.publicationRevision });
    assert.equal(response.status, 409, 'Stale publication rejected');
  } finally {
    response = await post('/api/admin/publish', { file: 'projects', action: 'rollback', revision: saved.revision, publicationRevision: published.publicationRevision });
    assert.equal(response.status, 200, 'Previous publication restored');
  }
  assert.ok(!(await (await fetch(origin + '/projects/' + draft[0].slug)).text()).includes(draft[0].title), 'Rollback reaches public page');
} finally {
  const latest = await read();
  response = await post('/api/admin/content', { file: 'projects', action: 'save', data: original.data, revision: latest.revision, baseSha: original.baseSha });
  assert.equal(response.status, 200, 'Original local draft restored');
}
console.log('PASS: owner access, origin protection, private drafts, conflict detection, direct publishing, server-rendered content, rollback, and draft restoration.');
