/* api/save.js — Vercel serverless function
 * DEPRECATED: single-file, non-atomic publish kept for backwards compatibility.
 * New publishes go through /api/publish, which commits every file and photo
 * in one atomic commit. This route now requires a secret and fails closed.
 *
 * Required Vercel env variables (set in your Vercel project dashboard):
 *   GITHUB_TOKEN   — fine-grained PAT with Contents: read & write on this repo
 *   GITHUB_OWNER   — your GitHub username, e.g. "rushanhaque"
 *   GITHUB_REPO    — repository name, e.g. "my-portfolio"
 *   GITHUB_BRANCH  — branch to commit to, e.g. "main"
 */

export const config = { runtime: 'edge' };

const ALLOWED_FILES = new Set([
  'data/projects.js',
  'data/products.js',
  'data/reviews.js',
  'data/journey.js',
]);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  /* ── auth check — fails CLOSED ───────────────────────────────────────
   * Previously this block was skipped entirely when ADMIN_TOKEN was unset,
   * which left the endpoint callable by anyone on the internet. It now
   * refuses to run at all unless a secret is configured. */
  const adminToken = process.env.ADMIN_PUBLISH_SECRET || process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return new Response('Publishing is disabled: ADMIN_PUBLISH_SECRET is not set.', { status: 503 });
  }
  const auth = req.headers.get('x-admin-token') || '';
  if (auth.length !== adminToken.length) {
    return new Response('Unauthorized', { status: 401 });
  }
  let diff = 0;
  for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ adminToken.charCodeAt(i);
  if (diff !== 0) {
    return new Response('Unauthorized', { status: 401 });
  }

  /* ── parse body ──────────────────────────────────────────────────────── */
  let body;
  try { body = await req.json(); }
  catch { return new Response('Bad JSON', { status: 400 }); }

  const { path, content } = body;

  if (!path || !ALLOWED_FILES.has(path)) {
    return new Response('Invalid path', { status: 400 });
  }
  if (typeof content !== 'string' || !content.trim()) {
    return new Response('Empty content', { status: 400 });
  }

  /* ── GitHub API ──────────────────────────────────────────────────────── */
  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_OWNER;
  const repo   = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return new Response('Server not configured', { status: 503 });
  }

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  /* get current SHA (needed to update an existing file) */
  let sha;
  try {
    const get = await fetch(`${apiBase}?ref=${branch}`, { headers });
    if (get.ok) {
      const j = await get.json();
      sha = j.sha;
    } else if (get.status !== 404) {
      const t = await get.text();
      return new Response(`GitHub GET error: ${t}`, { status: 502 });
    }
  } catch (e) {
    return new Response(`GitHub GET failed: ${e.message}`, { status: 502 });
  }

  /* commit */
  const putBody = {
    message: `chore: update ${path} via admin`,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
    ...(sha ? { sha } : {}),
  };

  try {
    const put = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });
    if (!put.ok) {
      const t = await put.text();
      return new Response(`GitHub PUT error: ${t}`, { status: 502 });
    }
  } catch (e) {
    return new Response(`GitHub PUT failed: ${e.message}`, { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
