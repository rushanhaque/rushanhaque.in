/* api/version.js — the build ID currently being served.
 *
 * Served at both /api/version and /version.json (see the rewrite in
 * vercel.json). Always no-store, so a browser can never be told a stale
 * build is the current one.
 *
 * The build ID is the git commit Vercel deployed, which needs no build step
 * and cannot drift from what is actually live.
 */

export const config = { runtime: 'edge' };

export default async function handler() {
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    'dev';

  return new Response(
    JSON.stringify({
      buildId,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      env: process.env.VERCEL_ENV || 'development',
      servedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  );
}
