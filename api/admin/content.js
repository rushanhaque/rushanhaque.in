// GET reads the editable content as it is on GitHub; PUT publishes a change by committing it.
// The commit makes Vercel rebuild the site, so a change is live about a minute later.
import { github, FILE, signedIn, sameOrigin, send, validate } from '../_admin.js'

async function gh(path, init = {}) {
  return fetch(`https://api.github.com/repos/${github.repo()}/contents/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${github.token()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'rushanhaque-admin', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: AbortSignal.timeout(20000),
  })
}
const explain = (status, action) =>
  status === 401 ? `GitHub rejected the token while trying to ${action}. Check that GITHUB_TOKEN on Vercel is valid and not expired.`
    : status === 403 || status === 404 ? `GitHub refused to ${action}. The token needs “Contents: Read and write” access to ${github.repo()}.`
      : status === 409 || status === 422 ? 'The content changed since you opened the admin. Reload, then make your change again.'
        : `GitHub could not ${action} (status ${status}).`

export default async function handler(req, res) {
  if (!signedIn(req)) return send(res, 401, { error: 'Sign in first.' })
  if (!github.token()) return send(res, 503, { error: 'No GitHub token is set on Vercel (GITHUB_TOKEN), so changes cannot be published.' })

  if (req.method === 'GET') {
    const r = await gh(`${FILE}?ref=${encodeURIComponent(github.branch())}`)
    if (!r.ok) return send(res, 502, { error: explain(r.status, 'read the content') })
    const file = await r.json()
    return send(res, 200, { sha: file.sha, content: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) })
  }

  if (req.method === 'PUT') {
    if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin.' })
    const { value, error } = validate(req.body?.content)
    if (error) return send(res, 400, { error })
    if (typeof req.body?.sha !== 'string') return send(res, 400, { error: 'Reload the admin and try again.' })
    const r = await gh(FILE, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Admin: update the About text',
        content: Buffer.from(JSON.stringify(value, null, 2) + '\n', 'utf8').toString('base64'),
        sha: req.body.sha,
        branch: github.branch(),
      }),
    })
    if (!r.ok) return send(res, 502, { error: explain(r.status, 'publish the change') })
    const out = await r.json()
    return send(res, 200, { sha: out.content?.sha, content: value })
  }

  return send(res, 405, { error: 'Method not allowed.' })
}
