import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Public pages are rendered at build time from content committed with each
// release, so every deployment produces fresh HTML. Browsers revalidate on
// each visit (cheap 304s via ETags) instead of re-rendering on every request.
const revalidate = 'public, max-age=0, must-revalidate';
const noStore = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
  { key: 'CDN-Cache-Control', value: 'no-store' },
  { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  async headers() {
    return [
      { source: '/:path((?!_next/static|images/|fonts/|api/|studio).*)', headers: [{ key: 'Cache-Control', value: revalidate }] },
      { source: '/images/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/studio/:path*', headers: noStore },
      { source: '/studio', headers: noStore },
      { source: '/api/:path*', headers: noStore },
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ] },
    ];
  },
  async rewrites() { return [{ source: '/version.json', destination: '/api/version' }]; },
  async redirects(){return [
    {source:'/work',destination:'/projects',permanent:true},{source:'/index.html',destination:'/',permanent:true},{source:'/contact.html',destination:'/contact',permanent:true},
    // v2 folds these pages into the homepage story (or removes them).
    {source:'/about',destination:'/#journey',permanent:true},{source:'/about.html',destination:'/#journey',permanent:true},{source:'/experience',destination:'/#journey',permanent:true},
    {source:'/services',destination:'/#services',permanent:true},{source:'/collaborations',destination:'/#services',permanent:true},
    {source:'/playground',destination:'/',permanent:true},{source:'/lab',destination:'/',permanent:true},
    {source:'/insights',destination:'/writing',permanent:true},{source:'/insights/:slug',destination:'/writing',permanent:true},
    // Paths from the previous portfolio.
    {source:'/review',destination:'/write-a-review',permanent:true},{source:'/certificates',destination:'/certifications',permanent:true},
    {source:'/work.html',destination:'/projects',permanent:true},{source:'/works-default.html',destination:'/projects',permanent:true},
    {source:'/certificates.html',destination:'/certifications',permanent:true},{source:'/review.html',destination:'/write-a-review',permanent:true},
    {source:'/services.html',destination:'/#services',permanent:true},
    {source:'/:page(seo-services|generative-engine-optimization|website-design-development|web-application-development|ecommerce-website-development|landing-page-design|website-redesign|website-speed-optimization){.html}?',destination:'/#services',permanent:true},
    {source:'/:page(areas-served|website-designer-in-[a-z-]+){.html}?',destination:'/',permanent:true},
  ];}
};

export default nextConfig;
