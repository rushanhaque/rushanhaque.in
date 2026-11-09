// GET reads the editable content as it is on GitHub; PUT publishes a change as one commit: the text, the client list
// and any new logos together, with logos nobody uses any more removed. The commit makes Vercel rebuild the site, so a
// change is live about a minute later.
import { github, FILE, signedIn, sameOrigin, send, validate, validateUploads, logosIn } from '../_admin.js'

async function gh(path, init = {}) {
  return fetch(`https://api.github.com/repos/${github.repo()}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${github.token()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'rushanhaque-admin', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    signal: AbortSignal.timeout(20000),
  })
}
const post = (path, body, method = 'POST') => gh(path, { method, body: JSON.stringify(body) })
const explain = (status, action) =>
  status === 401 ? `GitHub rejected the token while trying to ${action}. Check that GITHUB_TOKEN on Vercel is valid and not expired.`
    : status === 403 || status === 404 ? `GitHub refused to ${action}. The token needs “Contents: Read and write” access to ${github.repo()}.`
      : status === 409 || status === 422 ? 'The content changed since you opened the admin. Reload, then make your change again.'
        : `GitHub could not ${action} (status ${status}).`

const readFile = async () => {
  const r = await gh(`contents/${FILE}?ref=${encodeURIComponent(github.branch())}`)
  if (!r.ok) return { status: r.status }
  const file = await r.json()
  return { sha: file.sha, content: JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')) }
}

export default async function handler(req, res) {
  if (!signedIn(req)) return send(res, 401, { error: 'Sign in first.' })
  if (!github.token()) return send(res, 503, { error: 'No GitHub token is set on Vercel (GITHUB_TOKEN), so changes cannot be published.' })

  if (req.method === 'GET') {
    const f = await readFile()
    if (!f.sha) return send(res, 502, { error: explain(f.status, 'read the content') })
    return send(res, 200, { sha: f.sha, content: f.content })
  }

  if (req.method === 'PUT') {
    if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin.' })
    if (typeof req.body?.sha !== 'string') return send(res, 400, { error: 'Reload the admin and try again.' })
    const now = await readFile()
    if (!now.sha) return send(res, 502, { error: explain(now.status, 'read the content') })
    if (now.sha !== req.body.sha) return send(res, 409, { error: explain(409) })

    const { value, error } = validate(req.body.content)
    if (error) return send(res, 400, { error })
    const had = logosIn(now.content)
    const uploads = validateUploads(req.body.uploads, value, had)
    if (uploads.error) return send(res, 400, { error: uploads.error })

    const fail = (r, action) => send(res, 502, { error: explain(r.status, action) })
    const branch = encodeURIComponent(github.branch())
    const ref = await gh(`git/ref/heads/${branch}`)
    if (!ref.ok) return fail(ref, 'read the branch')
    const parent = (await ref.json()).object.sha
    const commit = await gh(`git/commits/${parent}`)
    if (!commit.ok) return fail(commit, 'read the latest commit')
    const baseTree = (await commit.json()).tree.sha

    const tree = [{ path: FILE, mode: '100644', type: 'blob', content: JSON.stringify(value, null, 2) + '\n' }]
    for (const [path, base64] of uploads.files) {
      const blob = await post('git/blobs', { content: base64, encoding: 'base64' })
      if (!blob.ok) return fail(blob, 'store a logo')
      tree.push({ path: `public${path}`, mode: '100644', type: 'blob', sha: (await blob.json()).sha })
    }
    const using = logosIn(value)
    for (const old of had) if (!using.has(old)) tree.push({ path: `public${old}`, mode: '100644', type: 'blob', sha: null })

    const made = await post('git/trees', { base_tree: baseTree, tree })
    if (!made.ok) return fail(made, 'prepare the change')
    const next = await post('git/commits', { message: 'Admin: update the site content', tree: (await made.json()).sha, parents: [parent] })
    if (!next.ok) return fail(next, 'publish the change')
    const moved = await post(`git/refs/heads/${branch}`, { sha: (await next.json()).sha }, 'PATCH')
    if (!moved.ok) return fail(moved, 'publish the change')

    const after = await readFile()
    return send(res, 200, { sha: after.sha, content: value })
  }

  return send(res, 405, { error: 'Method not allowed.' })
}
