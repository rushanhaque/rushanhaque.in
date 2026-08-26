/* test/publish.test.mjs — the publish endpoint and its validation.
 *
 *   npm test
 *
 * No browser and no network: global fetch is stubbed with a fake GitHub.
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePayload,
  buildTreeEntries,
  base64ByteLength,
  isAllowedPhotoPath,
  isValidBlobSha,
  MAX_PHOTO_BYTES,
} from '../api/_github.mjs';

import handler from '../api/publish.js';

const SECRET = 'test-secret-value';
const HEAD_SHA = 'a'.repeat(40);
const TREE_SHA = 'b'.repeat(40);
const BLOB_SHA = 'c'.repeat(40);
const NEW_COMMIT = 'd'.repeat(40);

const b64 = (s) => Buffer.from(s).toString('base64');

function req(body, { token = SECRET, method = 'POST' } = {}) {
  return new Request('https://example.test/api/publish', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token == null ? {} : { 'x-admin-token': token }),
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

/* A fake GitHub that records every call, so we can assert on what was sent. */
function fakeGitHub({ headSha = HEAD_SHA, existingPaths = [], refPatchStatus = 200 } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (url, init = {}) => {
      const u = String(url);
      const method = init.method || 'GET';
      calls.push({ url: u, method, body: init.body ? JSON.parse(init.body) : null });

      const json = (status, obj) =>
        new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

      if (u.includes('/git/ref/heads/')) return json(200, { object: { sha: headSha } });
      if (u.includes('/git/commits/')) return json(200, { tree: { sha: TREE_SHA } });
      if (u.includes('/contents/')) {
        const path = decodeURI(u.split('/contents/')[1].split('?')[0]);
        return existingPaths.includes(path)
          ? json(200, { sha: 'existing' })
          : json(404, { message: 'Not Found' });
      }
      if (u.endsWith('/git/blobs')) return json(201, { sha: BLOB_SHA });
      if (u.endsWith('/git/trees')) return json(201, { sha: 'e'.repeat(40) });
      if (u.endsWith('/git/commits')) return json(201, { sha: NEW_COMMIT });
      if (u.includes('/git/refs/heads/')) {
        return refPatchStatus === 200
          ? json(200, { object: { sha: NEW_COMMIT } })
          : json(refPatchStatus, { message: 'Update is not a fast forward' });
      }
      throw new Error(`unexpected call: ${method} ${u}`);
    },
  };
}

const ENV = ['ADMIN_PUBLISH_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];
let savedEnv;
let realFetch;

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV.map((k) => [k, process.env[k]]));
  realFetch = globalThis.fetch;
  process.env.ADMIN_PUBLISH_SECRET = SECRET;
  process.env.GITHUB_TOKEN = 'gh-token';
  process.env.GITHUB_OWNER = 'owner';
  process.env.GITHUB_REPO = 'repo';
  process.env.GITHUB_BRANCH = 'main';
});

afterEach(() => {
  for (const k of ENV) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  globalThis.fetch = realFetch;
});

/* ────────────────────────────────────────────────────────────────────── */
describe('payload validation', () => {
  test('accepts a well-formed catalogue + photo payload', () => {
    const v = validatePayload({
      files: [{ path: 'data/products.js', content: 'window.RH_PRODUCTS = [];' }],
      photos: [{ path: 'img/rh/products/' + 'f'.repeat(20) + '.webp', contentBase64: b64('bytes') }],
    });
    assert.equal(v.ok, true);
    assert.equal(v.files.length, 1);
    assert.equal(v.photos.length, 1);
  });

  test('rejects a path traversal attempt in a photo path', () => {
    for (const bad of [
      'img/rh/products/../../../../etc/passwd',
      '../secrets.env',
      '/etc/passwd',
      'img/rh/products/../../index.html',
      'img/rh/products/nested/aaaaaaaaaaaaaaaaaaaa.png',
      'img/rh/products/AAAAAAAAAAAAAAAAAAAA.png',   // uppercase hex
      'img/rh/products/aaaaaaaaaaaaaaaaaaaa.svg',   // svg can carry script
      'img/rh/products/aaaaaaaaaaaaaaaaaaa.png',    // 19 chars, not 20
    ]) {
      assert.equal(isAllowedPhotoPath(bad), false, `should reject ${bad}`);
      const v = validatePayload({ photos: [{ path: bad, contentBase64: b64('x') }] });
      assert.equal(v.ok, false, `should reject ${bad}`);
      assert.equal(v.status, 400);
    }
  });

  test('rejects a file path outside the catalogue allowlist', () => {
    const v = validatePayload({ files: [{ path: 'index.html', content: '<h1>pwned</h1>' }] });
    assert.equal(v.ok, false);
    assert.equal(v.status, 400);
    assert.match(v.error, /Invalid file path/);
  });

  test('rejects an invalid blob sha', () => {
    for (const bad of ['', 'xyz', 'A'.repeat(40), 'a'.repeat(39), 'a'.repeat(41), 123]) {
      assert.equal(isValidBlobSha(bad), false, `should reject ${bad}`);
    }
    assert.equal(isValidBlobSha('a'.repeat(40)), true);

    const v = validatePayload({
      photos: [{ path: 'img/rh/products/' + 'a'.repeat(20) + '.png', sha: 'not-a-sha' }],
    });
    assert.equal(v.ok, false);
    assert.match(v.error, /Invalid blob sha/);
  });

  test('reports an oversized photo as 413, not a generic failure', () => {
    const huge = 'A'.repeat(Math.ceil(((MAX_PHOTO_BYTES + 1024) * 4) / 3));
    const v = validatePayload({
      photos: [{ path: 'img/rh/products/' + 'a'.repeat(20) + '.jpg', contentBase64: huge }],
    });
    assert.equal(v.ok, false);
    assert.equal(v.status, 413);
    assert.match(v.error, /limit/i);
  });

  test('the same photo staged twice is committed once', () => {
    const path = 'img/rh/products/' + '1'.repeat(20) + '.png';
    const v = validatePayload({
      photos: [
        { path, contentBase64: b64('same') },
        { path, contentBase64: b64('same') },
      ],
    });
    assert.equal(v.ok, true);
    assert.equal(v.photos.length, 1);
  });

  test('base64ByteLength measures without decoding', () => {
    assert.equal(base64ByteLength(b64('hello')), 5);
    assert.equal(base64ByteLength(b64('a'.repeat(1000))), 1000);
    assert.equal(base64ByteLength(''), 0);
  });

  test('buildTreeEntries inlines file content and references photos by sha', () => {
    const entries = buildTreeEntries(
      [{ path: 'data/products.js', content: 'x' }],
      [{ path: 'img/rh/products/aaaaaaaaaaaaaaaaaaaa.png', sha: BLOB_SHA }]
    );
    assert.equal(entries.length, 2);
    assert.equal(entries[0].content, 'x');
    assert.equal(entries[0].sha, undefined);
    assert.equal(entries[1].sha, BLOB_SHA);
    assert.equal(entries[1].content, undefined);
    for (const e of entries) assert.equal(e.mode, '100644');
  });
});

/* ────────────────────────────────────────────────────────────────────── */
describe('publish endpoint', () => {
  test('refuses an anonymous caller with 401', async () => {
    const gh = fakeGitHub();
    globalThis.fetch = gh.fetch;
    const res = await handler(req({ files: [{ path: 'data/products.js', content: 'x' }] }, { token: null }));
    assert.equal(res.status, 401);
    assert.equal(gh.calls.length, 0, 'must not touch GitHub without credentials');
  });

  test('refuses a wrong token with 401', async () => {
    const gh = fakeGitHub();
    globalThis.fetch = gh.fetch;
    const res = await handler(req({ files: [{ path: 'data/products.js', content: 'x' }] }, { token: 'wrong-secret-val' }));
    assert.equal(res.status, 401);
    assert.equal(gh.calls.length, 0);
  });

  test('fails closed with 503 when no secret is configured', async () => {
    delete process.env.ADMIN_PUBLISH_SECRET;
    const gh = fakeGitHub();
    globalThis.fetch = gh.fetch;
    const res = await handler(req({ files: [{ path: 'data/products.js', content: 'x' }] }, { token: null }));
    assert.equal(res.status, 503);
    assert.equal(gh.calls.length, 0);
  });

  test('commits a valid photo and the catalogue in ONE commit', async () => {
    const gh = fakeGitHub();
    globalThis.fetch = gh.fetch;
    const photoPath = 'img/rh/products/' + '9'.repeat(20) + '.webp';

    const res = await handler(req({
      files: [{ path: 'data/products.js', content: 'window.RH_PRODUCTS = [];' }],
      photos: [{ path: photoPath, contentBase64: b64('image-bytes') }],
    }));

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.commit, NEW_COMMIT);
    assert.equal(body.photosStaged, 1);

    const blobCalls = gh.calls.filter((c) => c.url.endsWith('/git/blobs'));
    assert.equal(blobCalls.length, 1, 'photo staged as a git blob');
    assert.equal(blobCalls[0].body.encoding, 'base64');

    const commitCalls = gh.calls.filter((c) => c.url.endsWith('/git/commits') && c.method === 'POST');
    assert.equal(commitCalls.length, 1, 'exactly one commit — atomic');

    const tree = gh.calls.find((c) => c.url.endsWith('/git/trees')).body.tree;
    const photoEntry = tree.find((e) => e.path === photoPath);
    assert.ok(photoEntry, 'photo is in the tree');
    assert.equal(photoEntry.sha, BLOB_SHA, 'photo referenced by blob sha, not inlined');
    assert.ok(tree.find((e) => e.path === 'data/products.js'), 'catalogue in the same tree');
  });

  test('stamps updatedAt from the server clock, not the browser', async () => {
    globalThis.fetch = fakeGitHub().fetch;
    const before = Date.now();
    const res = await handler(req({
      files: [{ path: 'data/products.js', content: 'x' }],
      updatedAt: '1999-01-01T00:00:00.000Z',   // a browser-supplied value, to be ignored
    }));
    const body = await res.json();
    const stamped = Date.parse(body.updatedAt);
    assert.ok(stamped >= before, 'updatedAt comes from the server clock');
    assert.notEqual(body.updatedAt, '1999-01-01T00:00:00.000Z');
  });

  test('a photo already committed is reused, not re-uploaded', async () => {
    const photoPath = 'img/rh/products/' + '7'.repeat(20) + '.png';
    const gh = fakeGitHub({ existingPaths: [photoPath] });
    globalThis.fetch = gh.fetch;

    const res = await handler(req({
      files: [{ path: 'data/products.js', content: 'x' }],
      photos: [{ path: photoPath, contentBase64: b64('same-bytes') }],
    }));

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.photosReused, 1);
    assert.equal(body.photosStaged, 0);
    assert.equal(gh.calls.filter((c) => c.url.endsWith('/git/blobs')).length, 0, 'no blob uploaded');
  });

  test('a branch that moved under the publish returns 409 and does not force-push', async () => {
    const gh = fakeGitHub({ headSha: 'f'.repeat(40) });
    globalThis.fetch = gh.fetch;

    const res = await handler(req({
      files: [{ path: 'data/products.js', content: 'x' }],
      baseSha: HEAD_SHA,   // what the admin thought it was based on
    }));

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.match(body.error, /moved/i);
    assert.equal(gh.calls.filter((c) => c.method === 'PATCH').length, 0, 'no ref update attempted');
    assert.equal(gh.calls.filter((c) => c.url.endsWith('/git/commits') && c.method === 'POST').length, 0);
  });

  test('a non-fast-forward ref update returns 409, and force is never set', async () => {
    const gh = fakeGitHub({ refPatchStatus: 422 });
    globalThis.fetch = gh.fetch;

    const res = await handler(req({ files: [{ path: 'data/products.js', content: 'x' }] }));

    assert.equal(res.status, 409);
    const patch = gh.calls.find((c) => c.method === 'PATCH');
    assert.ok(patch, 'a ref update was attempted');
    assert.equal(patch.body.force, false, 'force must never be true');
  });

  test('rejects a traversal path before making any GitHub call', async () => {
    const gh = fakeGitHub();
    globalThis.fetch = gh.fetch;
    const res = await handler(req({
      photos: [{ path: 'img/rh/products/../../../index.html', contentBase64: b64('x') }],
    }));
    assert.equal(res.status, 400);
    assert.equal(gh.calls.length, 0, 'validation happens before the network');
  });

  test('rejects non-POST', async () => {
    const res = await handler(req(null, { method: 'GET' }));
    assert.equal(res.status, 405);
  });
});
