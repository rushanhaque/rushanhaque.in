import release from '@/generated/release.json';
import { noStoreHeaders } from '@/lib/cache-policy';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  return Response.json({ ...release, env: process.env.VERCEL_ENV || 'development', servedAt: new Date().toISOString() }, {
    headers: { ...noStoreHeaders, 'X-Robots-Tag': 'noindex', 'X-Portfolio-Build': release.buildId },
  });
}
