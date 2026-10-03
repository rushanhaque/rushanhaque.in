import { projectAccess } from '@/lib/project-access';
import sourcePages from '@/content/source-pages.json';
import { getPublishedContent } from '@/lib/published-content';
import { siteOrigin } from '@/lib/seo';
export async function GET(){const {projects}=await getPublishedContent();const routes=[...sourcePages.map(p=>'/'+p.slug),'','/projects','/certifications','/reviews','/connect','/schedule','/privacy','/accessibility',...projects.filter(p=>projectAccess(p)!=='visit').map(p=>'/projects/'+p.slug)];return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path=>`<url><loc>${siteOrigin}${path}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});}
