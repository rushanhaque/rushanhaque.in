import { projectAccess } from '@/lib/project-access';
import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import extras from '@/content/seo-extras.json';
import { getPublishedContent } from '@/lib/published-content';
import { siteOrigin } from '@/lib/seo';
import release from '@/generated/release.json';

type Entry = { path: string; priority: string; alternates?: Record<string, string> };
export async function GET(){
  const {projects}=await getPublishedContent();
  const today=(release as {builtAt?:string}).builtAt?.slice(0,10)??new Date().toISOString().slice(0,10);
  const hindi=guides.find(g=>g.lang==='hi');
  const pair=hindi&&'alternate' in hindi?{'en-IN':hindi.alternate as string,'hi-IN':'/'+hindi.slug}:undefined;
  const entries:Entry[]=[
    {path:'',priority:'1.0'},
    {path:'/website-designer-in-moradabad',priority:'0.9',alternates:'website-designer-in-moradabad' in extras?pair:undefined},
    ...guides.map(g=>({path:'/'+g.slug,priority:'0.8',alternates:g.lang==='hi'?pair:undefined})),
    ...sourcePages.filter(p=>p.slug!=='website-designer-in-moradabad').map(p=>({path:'/'+p.slug,priority:p.kind==='Service'?'0.8':'0.7'})),
    {path:'/projects',priority:'0.7'},{path:'/connect',priority:'0.7'},{path:'/reviews',priority:'0.6'},{path:'/certifications',priority:'0.5'},{path:'/schedule',priority:'0.5'},
    ...projects.filter(p=>projectAccess(p)!=='visit').map(p=>({path:'/projects/'+p.slug,priority:'0.4'})),
    {path:'/privacy',priority:'0.2'},{path:'/accessibility',priority:'0.2'},
  ];
  const url=(e:Entry)=>`<url><loc>${siteOrigin}${e.path}</loc><lastmod>${today}</lastmod><priority>${e.priority}</priority>${e.alternates?Object.entries(e.alternates).map(([l,p])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${siteOrigin}${p}"/>`).join(''):''}</url>`;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.map(url).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
