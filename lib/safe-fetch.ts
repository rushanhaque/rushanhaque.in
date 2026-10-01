import { lookup as dnsLookup, type LookupAddress } from 'node:dns';
import { isIP } from 'node:net';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';

// Fetches a public web page for the site-check study without letting a visitor
// reach private infrastructure (SSRF). Every hop is re-validated, the address is
// checked at connection time (so DNS rebinding cannot swap it afterwards), and
// size and time are capped.

export class UnsafeTargetError extends Error {}

function ipv4ToInt(ip: string) { return ip.split('.').reduce((n, part) => (n << 8) + Number(part), 0) >>> 0; }
const V4_BLOCKS: [string, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
];
export function isPublicAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) {
    const n = ipv4ToInt(ip);
    return !V4_BLOCKS.some(([base, bits]) => (n >>> (32 - bits)) === (ipv4ToInt(base) >>> (32 - bits)));
  }
  if (kind === 6) {
    const v6 = ip.toLowerCase();
    const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    if (v6 === '::' || v6 === '::1') return false;
    if (/^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || /^ff/.test(v6) || v6.startsWith('2001:db8') || v6.startsWith('64:ff9b')) return false;
    return true;
  }
  return false;
}

// Normalises visitor input into a public http(s) URL or throws.
export function parsePublicUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 300) throw new UnsafeTargetError('Enter a website address.');
  let url: URL;
  try { url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`); } catch { throw new UnsafeTargetError('That does not look like a website address.'); }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new UnsafeTargetError('Only http and https websites can be checked.');
  if (url.username || url.password) throw new UnsafeTargetError('Remove the username or password from the address.');
  if (url.port && url.port !== '80' && url.port !== '443') throw new UnsafeTargetError('Only standard web ports can be checked.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host) ? !isPublicAddress(host) : !/\./.test(host) || /\.(local|localhost|internal|lan|home|corp)$/i.test(host) || host === 'localhost') throw new UnsafeTargetError('That address is not a public website.');
  url.hash = '';
  return url;
}

// A lookup that refuses to connect to any non-public address.
function guardedLookup(hostname: string, options: object, callback: (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void) {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, '');
    const list = addresses as LookupAddress[];
    if (!list.length || list.some(a => !isPublicAddress(a.address))) return callback(Object.assign(new UnsafeTargetError('That address is not a public website.'), { code: 'EUNSAFE' }), '');
    const wantsAll = (options as { all?: boolean }).all;
    if (wantsAll) callback(null, list);
    else callback(null, list[0].address, list[0].family);
  });
}

export type SafeResponse = { url: string; status: number; headers: http.IncomingHttpHeaders; body: string; bytes: number; ttfbMs: number; redirects: number };

function once(url: URL, timeoutMs: number, maxBytes: number): Promise<SafeResponse & { location?: string }> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, {
      method: 'GET', lookup: guardedLookup as never, timeout: timeoutMs,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RushanHaque-SiteCheck/1.0; +https://www.rushanhaque.in/studies)', Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5', 'Accept-Encoding': 'gzip, deflate, br' },
    }, res => {
      const ttfbMs = Math.round(performance.now() - started);
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400 && res.headers.location) { res.resume(); return resolve({ url: url.href, status, headers: res.headers, body: '', bytes: 0, ttfbMs, redirects: 0, location: res.headers.location }); }
      const enc = String(res.headers['content-encoding'] || '').toLowerCase();
      const stream = enc.includes('br') ? res.pipe(zlib.createBrotliDecompress()) : enc.includes('gzip') ? res.pipe(zlib.createGunzip()) : enc.includes('deflate') ? res.pipe(zlib.createInflate()) : res;
      const chunks: Buffer[] = []; let bytes = 0, wire = 0;
      res.on('data', (c: Buffer) => { wire += c.length; });
      stream.on('data', (c: Buffer) => { bytes += c.length; if (bytes > maxBytes) { req.destroy(); stream.destroy(); resolve({ url: url.href, status, headers: res.headers, body: Buffer.concat(chunks).toString('utf8'), bytes: wire, ttfbMs, redirects: 0 }); return; } chunks.push(c); });
      stream.on('end', () => resolve({ url: url.href, status, headers: res.headers, body: Buffer.concat(chunks).toString('utf8'), bytes: wire, ttfbMs, redirects: 0 }));
      stream.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('The website took too long to respond.')));
    req.on('error', reject);
    req.end();
  });
}

export async function safeFetch(input: URL, { timeoutMs = 8000, maxBytes = 1_500_000, maxRedirects = 4 } = {}): Promise<SafeResponse> {
  let url = input, redirects = 0;
  for (;;) {
    const res = await once(url, timeoutMs, maxBytes);
    if (!res.location) return { ...res, redirects };
    if (++redirects > maxRedirects) throw new Error('Too many redirects.');
    url = parsePublicUrl(new URL(res.location, url).href);
  }
}
