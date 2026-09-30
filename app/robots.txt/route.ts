import { siteOrigin } from '@/lib/seo';
// Public launch: allow crawling of the portfolio; keep the private studio and APIs out.
export function GET(){return new Response(`User-agent: *\nAllow: /\nDisallow: /studio\nDisallow: /api/\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});}
