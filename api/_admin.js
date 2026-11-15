// Shared by the admin functions (files starting with _ are not routes on Vercel).
// The admin signs in with ADMIN_PUBLISH_SECRET and publishes by committing src/data/editable.json and any
// client logos to GitHub with GITHUB_TOKEN; the commit makes Vercel rebuild the site. These are the names the
// previous site's admin used, so settings already on Vercel carry over.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { LISTS, LOGO, UPLOAD, cleanList, picturesIn, small800 } from './_schema.js'

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
  const value = { aboutBio: bio, clients }
  // the other lists; one the admin did not send is left out, so the site keeps its original version of it
  for (const key of Object.keys(LISTS)) {
    if (input?.[key] === undefined) continue
    const r = cleanList(key, input[key])
    if (r.error) return r
    value[key] = r.value
  }
  return { value }
}

const MAX_LOGO = 400 * 1024
const MAX_BIG = 1200 * 1024
const MAX_SMALL = 400 * 1024
const MAX_TOTAL = 2900 * 1024
// pictures the admin uploaded (and so may remove again): client logos and everything in /img/up/
const owned = (p) => LOGO.test(p) || UPLOAD.test(p)
export const logosIn = (content) => new Set([...picturesIn(content)].filter(owned))

// A new picture must be a real WebP or PNG of a sensible size, at an address the content is using; a picture in
// /img/up/ comes with its 800px version. A picture the content points at has to be new or already on the site.
export function validateUploads(input, value, had) {
  const files = []
  const using = logosIn(value)
  const wanted = new Set([...using].flatMap((p) => (UPLOAD.test(p) ? [p, small800(p)] : [p])))
  let total = 0
  for (const [path, base64] of Object.entries(input && typeof input === 'object' ? input : {})) {
    if (!wanted.has(path) || typeof base64 !== 'string') return { error: 'A picture could not be read. Choose it again.' }
    const bytes = Buffer.from(base64, 'base64')
    total += bytes.length
    const webp = bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP'
    const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    if (!(path.endsWith('.webp') ? webp : png)) return { error: 'A picture is not the kind of file it says it is. Choose it again.' }
    const limit = LOGO.test(path) ? MAX_LOGO : path.endsWith('-800.webp') ? MAX_SMALL : MAX_BIG
    if (bytes.length > limit) return { error: 'A picture is too large. Choose a smaller one.' }
    files.push([path, base64])
  }
  if (total > MAX_TOTAL) return { error: 'That is too many new pictures to publish at once. Publish a few, then the rest.' }
  const fresh = new Set(files.map(([p]) => p))
  for (const p of wanted) if (!fresh.has(p) && !had.has(p.replace(/-800\.webp$/, '.webp'))) return { error: 'A picture is missing. Choose it again.' }
  return { files }
}
