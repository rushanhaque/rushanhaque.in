/* api/save.js — Vercel serverless function
 * Receives a data file from admin.html and commits it to GitHub.
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

  /* ── auth check ─────────────────────────────────────────────────────── */
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken) {
    const auth = req.headers.get('x-admin-token') || '';
    if (auth !== adminToken) {
      return new Response('Unauthorized', { status: 401 });
    }
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
