import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const sessionCookie = process.env.NODE_ENV === 'production' ? '__Host-portfolio-admin' : 'portfolio-admin';
export const sessionLifetime = 8 * 60 * 60;
const key = () => process.env.CMS_SESSION_SECRET || process.env.ADMIN_PUBLISH_SECRET || '';
export function matchesSecret(presented: string, expected: string) {
  if (!expected || expected.length < 16) return false;
  const digest = (value: string) => createHmac('sha256', expected).update(value).digest();
  return timingSafeEqual(digest(presented), digest(expected));
}
export function createSession(now = Date.now()) {
  if (key().length < 16) throw Error('Admin authentication is not configured.');
  const payload = Buffer.from(JSON.stringify({ exp: now + sessionLifetime * 1000, nonce: randomBytes(24).toString('hex') })).toString('base64url');
  return payload + '.' + createHmac('sha256', key()).update(payload).digest('base64url');
}
export function verifySession(token?: string, now = Date.now()) {
  if (!token || token.length > 1024 || key().length < 16) return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', key()).update(payload).digest('base64url');
  if (!matchesSecret(signature, expected)) return false;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof value.exp === 'number' && value.exp > now && value.exp <= now + sessionLifetime * 1000 && typeof value.nonce === 'string';
  } catch { return false; }
}
