import sourcePages from './content/source-pages.json';
import projects from './content/projects.json';
import { placementOf, projectAccess } from './lib/project-access';
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
      // Image file names are never reused (the admin uploads under new names), so they cache for a year.
      { source: '/images/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }, { key: 'X-Robots-Tag', value: 'noindex' }] },
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
    // One canonical host: the bare domain answers with a permanent move to www, so Google never sees two copies of each page.
    {source:'/:path*',has:[{type:'host',value:'rushanhaque.in'}],destination:'https://www.rushanhaque.in/:path*',permanent:true},
    // Live client sites have no inner page; old links go straight to the site.
    ...projects.filter(p=>projectAccess(p as Parameters<typeof projectAccess>[0])==='visit').map(p=>({source:`/projects/${p.slug}`,destination:p.url,permanent:true})),
    // Works hidden in the admin have no page; their old addresses go to the Works page (temporarily, so showing one again restores it).
    ...projects.filter(p=>placementOf(p as Parameters<typeof placementOf>[0])==='hidden'&&projectAccess(p as Parameters<typeof projectAccess>[0])!=='visit').map(p=>({source:`/projects/${p.slug}`,destination:'/projects',permanent:false})),
    ...sourcePages.map(page=>({source:`/${page.slug}.html`,destination:`/${page.slug}`,permanent:true})),
    {source:'/admin.html',destination:'/studio',permanent:true},
    {source:'/work',destination:'/projects',permanent:true},{source:'/index.html',destination:'/',permanent:true},{source:'/contact.html',destination:'/connect',permanent:true},{source:'/contact',destination:'/connect',permanent:true},{source:'/write-a-review',destination:'/reviews',permanent:true},
    // v2 folds these pages into the homepage story (or removes them).
    {source:'/about.html',destination:'/about',permanent:true},{source:'/experience',destination:'/about',permanent:true},
    {source:'/collaborations',destination:'/#services',permanent:true},
    {source:'/playground',destination:'/',permanent:true},{source:'/lab',destination:'/about#lab',permanent:true},{source:'/studies',destination:'/about#lab',permanent:true},
    {source:'/insights',destination:'/',permanent:true},{source:'/insights/:slug',destination:'/',permanent:true},
    // Pages that no longer exist go home.
    {source:'/writing',destination:'/',permanent:true},{source:'/writing/:slug',destination:'/',permanent:true},{source:'/products',destination:'/',permanent:true},{source:'/services',destination:'/#services',permanent:true},{source:'/areas-served',destination:'/website-designer-in-moradabad',permanent:true},
    {source:'/pricing',destination:'/website-cost-in-moradabad',permanent:true},{source:'/price',destination:'/website-cost-in-moradabad',permanent:true},{source:'/exporters',destination:'/website-for-exporters-moradabad',permanent:true},{source:'/hindi',destination:'/website-banwaye-moradabad',permanent:true},{source:'/feed.xml',destination:'/',permanent:true},
    // Paths from the previous portfolio.
    {source:'/review',destination:'/reviews',permanent:true},{source:'/certificates',destination:'/certifications',permanent:true},
    {source:'/work.html',destination:'/projects',permanent:true},{source:'/works-default.html',destination:'/projects',permanent:true},
    {source:'/certificates.html',destination:'/certifications',permanent:true},{source:'/review.html',destination:'/reviews',permanent:true},

  ];}
};

export default nextConfig;
