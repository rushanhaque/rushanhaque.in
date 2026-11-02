// POST signs the owner in with the admin password; DELETE signs out; GET says whether signed in.
import { password, same, sessionCookie, clearCookie, signedIn, sameOrigin, send } from '../_admin.js'

export default async function handler(req, res) {
  if (req.method === 'GET') return send(res, 200, { signedIn: signedIn(req), configured: !!password() })
  if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin.' })
  if (req.method === 'DELETE') return send(res, 200, { signedIn: false }, { 'Set-Cookie': clearCookie() })
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' })
  if (!password()) return send(res, 503, { error: 'No admin password is set on Vercel (ADMIN_PUBLISH_SECRET).' })
  // a wrong password costs a moment, so guessing is slow
  await new Promise((r) => setTimeout(r, 600))
  if (!same(req.body?.password || '', password())) return send(res, 401, { error: 'That password is not right.' })
  return send(res, 200, { signedIn: true }, { 'Set-Cookie': sessionCookie() })
}
