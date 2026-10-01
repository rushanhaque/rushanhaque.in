import { checkSite } from '@/lib/site-check';
import { UnsafeTargetError } from '@/lib/safe-fetch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

// Best-effort per-visitor limit (per server instance): six checks per ten minutes.
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now(), recent = (hits.get(key) ?? []).filter(t => now - t < 600_000);
  recent.push(now); hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 6;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const expectedOrigin = `${requestUrl.protocol}//${request.headers.get('host') || requestUrl.host}`;
  if (request.headers.get('origin') !== expectedOrigin) return json({ error: 'Run the check from the website.' }, 403);
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (limited(ip)) return json({ error: 'A few too many checks. Try again in ten minutes.' }, 429);
  let url = '';
  try { const body = await request.json() as { url?: unknown }; url = typeof body.url === 'string' ? body.url : ''; } catch { return json({ error: 'Send a website address.' }, 400); }
  try {
    return json(await checkSite(url));
  } catch (error) {
    const message = error instanceof UnsafeTargetError ? error.message
      : error instanceof Error && /too long|redirects|HTTP \d|web page/.test(error.message) ? error.message
      : 'That website could not be reached. Check the address and try again.';
    return json({ error: message }, error instanceof UnsafeTargetError ? 422 : 502);
  }
}
