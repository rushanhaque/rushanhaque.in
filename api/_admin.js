// Shared by the admin functions (files starting with _ are not routes on Vercel).
// The admin signs in with ADMIN_PUBLISH_SECRET and publishes by committing src/data/editable.json and any
// client logos to GitHub with GITHUB_TOKEN; the commit makes Vercel rebuild the site. These are the names the
// previous site's admin used, so settings already on Vercel carry over.
import { createHmac, timingSafeEqual } from 'node:crypto'

const env = (...names) => names.map((n) => process.env[n]).find(Boolean) || ''
export const password = () => env('ADMIN_PUBLISH_SECRET', 'ADMIN_PASSWORD')
const signingKey = () => env('CMS_SESSION_SECRET', 'ADMIN_SESSION_SECRET') || password()
export const github = {
  token: () => env('GITHUB_CONTENT_TOKEN', 'GITHUB_TOKEN', 'GITHUB_PAT', 'GH_TOKEN'),
  repo: () => env('GITHUB_CONTENT_REPOSITORY', 'GITHUB_REPOSITORY') || 'rushanhaque/rushanhaque.in',
  branch: () => env('GITHUB_CONTENT_BRANCH', 'GITHUB_BRANCH') || 'main',
}
export const FILE = 'src/data/editable.json'

const COOKIE = 'rh_admin'
const HOURS = 12

export const same = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}
const sign = (v) => createHmac('sha256', signingKey()).update(v).digest('base64url')

export function sessionCookie() {
  const exp = String(Date.now() + HOURS * 3600e3)
  return `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${HOURS * 3600}`
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

export function signedIn(req) {
  if (!password()) return false
  const raw = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`))
  if (!raw) return false
  const [exp, mac] = raw.slice(COOKIE.length + 1).split('.')
  return !!exp && !!mac && Number(exp) > Date.now() && same(mac, sign(exp))
}

// writes must come from this site's own pages
export function sameOrigin(req) {
  try {
    return new URL(req.headers.origin).host === String(req.headers['x-forwarded-host'] || req.headers.host).split(',')[0].trim()
  } catch {
    return false
  }
}

export function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

// what the admin may change, and the rules each value must keep
export function validate(input) {
  const bio = typeof input?.aboutBio === 'string' ? input.aboutBio.replace(/\s+/g, ' ').trim() : ''
  if (bio.length < 40) return { error: 'The About text needs at least 40 characters.' }
  if (bio.length > 1200) return { error: 'The About text can be at most 1,200 characters.' }
  if (/[<>]/.test(bio)) return { error: 'The About text cannot contain < or >.' }
  const list = input?.clients
  if (!Array.isArray(list) || list.length > 40) return { error: 'The client list could not be read, or has more than 40 clients.' }
  const clients = []
  const seen = new Set()
  for (const c of list) {
    const name = typeof c?.name === 'string' ? c.name.replace(/\s+/g, ' ').trim() : ''
    if (!name || name.length > 60 || /[<>]/.test(name)) return { error: 'Every client needs a name of up to 60 characters, without < or >.' }
    if (seen.has(name.toLowerCase())) return { error: `${name} is on the list twice.` }
    seen.add(name.toLowerCase())
    const logo = typeof c.logo === 'string' ? c.logo : ''
    if (logo && !LOGO.test(logo)) return { error: `The logo for ${name} has an address the site cannot use.` }
    clients.push({ name, logo, tone: c.tone === 'dark' ? 'dark' : 'light' })
  }
  return { value: { aboutBio: bio, clients } }
}

const LOGO = /^\/img\/clients\/[a-z0-9-]+\.(webp|png)$/
const MAX_LOGO = 400 * 1024
const MAX_TOTAL = 3 * 1024 * 1024
export const logosIn = (content) => new Set((content?.clients || []).map((c) => c.logo).filter(Boolean))

// A new logo must be a real WebP or PNG of a sensible size, at the address a client is using. A logo a client points
// at has to be either new or already on the site.
export function validateUploads(input, value, had) {
  const files = []
  const entries = Object.entries(input && typeof input === 'object' ? input : {})
  const using = logosIn(value)
  let total = 0
  for (const [path, base64] of entries) {
    if (!LOGO.test(path) || !using.has(path) || typeof base64 !== 'string') return { error: 'A logo could not be read. Choose it again.' }
    const bytes = Buffer.from(base64, 'base64')
    total += bytes.length
    const webp = bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP'
    const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    if (!(path.endsWith('.webp') ? webp : png)) return { error: 'A logo is not the kind of picture it says it is. Choose it again.' }
    if (bytes.length > MAX_LOGO) return { error: 'A logo is too large. Choose a simpler file.' }
    files.push([path, base64])
  }
  if (total > MAX_TOTAL) return { error: 'That is too many new logos to publish at once. Publish a few, then the rest.' }
  const fresh = new Set(files.map(([p]) => p))
  for (const logo of using) if (!fresh.has(logo) && !had.has(logo)) return { error: 'A logo is missing. Choose it again.' }
  return { files }
}
