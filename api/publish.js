/* api/publish.js — atomic publish from admin.html.
 *
 * Commits the catalogue files AND any new product photos in a SINGLE commit
 * using the Git Data API (blobs -> tree -> commit -> fast-forward ref), so the
 * site never sees a half-published state.
 *
 * Required env vars on Vercel:
 *   ADMIN_PUBLISH_SECRET — shared secret the admin panel must send. REQUIRED.
 *   GITHUB_TOKEN         — fine-grained PAT, Contents: read & write on this repo
 *   GITHUB_OWNER         — e.g. "rushanhaque"
 *   GITHUB_REPO          — e.g. "rushanhaque.in"
 *   GITHUB_BRANCH        — defaults to "main"
 */

import { validatePayload, buildTreeEntries, isValidBlobSha } from './_github.mjs';

export const config = { runtime: 'edge' };

const json = (status, obj) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  /* ── auth: fail CLOSED ──────────────────────────────────────────────────
   * If the secret is not configured the endpoint refuses to run. It must
   * never be callable without credentials. */
  const secret = process.env.ADMIN_PUBLISH_SECRET;
  if (!secret) {
    return json(503, {
      error: 'Publishing is disabled: ADMIN_PUBLISH_SECRET is not set on the server.',
    });
  }
  const presented = req.headers.get('x-admin-token') || '';
  if (!timingSafeEqual(presented, secret)) {
    return json(401, { error: 'Unauthorized' });
  }

  /* ── parse + validate before any network call ───────────────────────── */
  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Bad JSON' });
  }

  const v = validatePayload(body);
  if (!v.ok) return json(v.status, { error: v.error });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !owner || !repo) {
    return json(503, {
      error: 'Server not configured: GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO are required.',
    });
  }

  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'rushanhaque-admin-publish',
  };

  const gh = async (path, init) => {
    const res = await fetch(`${base}${path}`, { ...init, headers });
    const text = await res.text();
    let parsed = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { /* keep raw */ }
    return { ok: res.ok, status: res.status, body: parsed, text };
  };

  /* Server clock — never trust the browser's timezone for updatedAt. */
  const updatedAt = new Date().toISOString();

  try {
    /* 1. current branch head */
    const ref = await gh(`/git/ref/heads/${branch}`);
    if (!ref.ok) {
      return json(502, { error: `Could not read branch "${branch}": ${ref.text}` });
    }
    const headSha = ref.body.object.sha;

    /* If the admin told us what it based this publish on and the branch has
     * moved since, stop. Report the conflict — never force-push. */
    if (body.baseSha && body.baseSha !== headSha) {
      return json(409, {
        error: 'The branch moved while you were editing. Reload the admin panel to pick up the latest published catalogue, then publish again.',
        expected: body.baseSha,
        actual: headSha,
      });
    }

    /* 2. parent commit -> its tree */
    const parent = await gh(`/git/commits/${headSha}`);
    if (!parent.ok) return json(502, { error: `Could not read commit: ${parent.text}` });
    const baseTree = parent.body.tree.sha;

    /* 3. stage photos as blobs (skipping ones already committed) */
    const photoBlobs = [];
    let staged = 0;
    let reused = 0;

    for (const p of v.photos) {
      /* Content-addressed: if the path already exists, the bytes are identical,
       * so there is nothing to upload. This is the dedupe. */
      const existing = await gh(
        `/contents/${encodeURI(p.path)}?ref=${encodeURIComponent(branch)}`,
        { method: 'GET' }
      );
      if (existing.ok) {
        reused++;
        continue;
      }

      if (p.sha) {
        if (!isValidBlobSha(p.sha)) {
          return json(400, { error: `Invalid blob sha for ${p.path}` });
        }
        photoBlobs.push({ path: p.path, sha: p.sha });
        staged++;
        continue;
      }

      const blob = await gh('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: p.contentBase64, encoding: 'base64' }),
      });
      if (!blob.ok) {
        if (blob.status === 413) {
          return json(413, { error: `Photo ${p.path} is too large for GitHub.` });
        }
        return json(502, { error: `Could not stage ${p.path}: ${blob.text}` });
      }
      photoBlobs.push({ path: p.path, sha: blob.body.sha });
      staged++;
    }

    /* 4. stamp the publish time with the SERVER clock, into the commit */
    const files = v.files.slice();
    files.push({
      path: 'data/published.json',
      content: JSON.stringify({ updatedAt, branch }, null, 2) + '\n',
    });

    /* 5. one tree, one commit, one fast-forward */
    const tree = await gh('/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTree,
        tree: buildTreeEntries(files, photoBlobs),
      }),
    });
    if (!tree.ok) return json(502, { error: `Could not create tree: ${tree.text}` });

    const summary =
      `chore(admin): publish ${files.length} file(s)` +
      (staged ? ` + ${staged} photo(s)` : '') +
      `\n\nupdatedAt: ${updatedAt}`;

    const commit = await gh('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: summary, tree: tree.body.sha, parents: [headSha] }),
    });
    if (!commit.ok) return json(502, { error: `Could not create commit: ${commit.text}` });

    /* force:false — a non-fast-forward is reported, never forced. */
    const patch = await gh(`/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.body.sha, force: false }),
    });
    if (!patch.ok) {
      if (patch.status === 422) {
        return json(409, {
          error: 'Someone else pushed while this publish was in flight. Nothing was overwritten. Reload the admin panel and publish again.',
        });
      }
      return json(502, { error: `Could not update branch: ${patch.text}` });
    }

    return json(200, {
      ok: true,
      commit: commit.body.sha,
      updatedAt,
      photosStaged: staged,
      photosReused: reused,
    });
  } catch (e) {
    return json(502, { error: `Publish failed: ${e.message}` });
  }
}

/* Constant-time-ish comparison so the secret cannot be probed byte by byte. */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
