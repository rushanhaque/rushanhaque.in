// Shared by the admin functions (files starting with _ are not routes on Vercel).
// The admin signs in with ADMIN_PUBLISH_SECRET and publishes by committing src/data/editable.json
// to GitHub with GITHUB_TOKEN; the commit makes Vercel rebuild the site. These are the names the
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
  return { value: { aboutBio: bio } }
}
