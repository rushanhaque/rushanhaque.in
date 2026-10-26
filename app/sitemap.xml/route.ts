import { placementOf, projectAccess } from '@/lib/project-access';
import sourcePages from '@/content/source-pages.json';
import guides from '@/content/guides.json';
import { getPublishedContent } from '@/lib/published-content';
import { siteOrigin } from '@/lib/seo';
import release from '@/generated/release.json';

type Entry = { path: string; priority: string; lastmod?: string; alternates?: Record<string, string>; images?: string[] };
export async function GET(){
  const {projects}=await getPublishedContent();
  const today=(release as {builtAt?:string}).builtAt?.slice(0,10)??new Date().toISOString().slice(0,10);
  // English and Hindi versions of a page point at each other, in both directions.
  const pairs:Record<string,Record<string,string>>={};
  for(const g of guides){if(!('alternate' in g)||!g.alternate)continue;const self='/'+g.slug,alt=g.alternate as string;const pair=g.lang==='hi'?{'en-IN':alt,'hi-IN':self}:{'en-IN':self,'hi-IN':alt};pairs[self]=pairs[alt]=pair;}
  const updated=(g:{updated?:string})=>g.updated&&g.updated<=today?g.updated:today;
  // Screenshots of the work go in with the pages that show them, for image search.
  const shown=projects.filter(p=>placementOf(p)!=='hidden'&&p.image);
  const shots=(list:typeof projects)=>list.map(p=>p.image!).filter(Boolean);
  const entries:Entry[]=[
    {path:'',priority:'1.0',images:shots(shown.filter(p=>placementOf(p)==='work'||placementOf(p)==='building'))},
    {path:'/about',priority:'0.8'},
    {path:'/website-designer-in-moradabad',priority:'0.9'},
    {path:'/website-designer-in-india',priority:'0.9'},
    ...guides.filter(g=>g.slug!=='website-designer-in-india').map(g=>({path:'/'+g.slug,priority:g.slug==='hire-website-developer'?'0.9':'0.8',lastmod:updated(g)})),
    ...sourcePages.filter(p=>p.slug!=='website-designer-in-moradabad').map(p=>({path:'/'+p.slug,priority:p.kind==='Service'?'0.8':'0.7'})),
    {path:'/projects',priority:'0.7',images:shots(shown)},{path:'/connect',priority:'0.7'},{path:'/reviews',priority:'0.6'},{path:'/certifications',priority:'0.5'},{path:'/schedule',priority:'0.5'},
    // Live client sites redirect to the site itself, so only pages served here are listed.
    ...projects.filter(p=>projectAccess(p)!=='visit').map(p=>({path:'/projects/'+p.slug,priority:'0.4',images:p.image?[p.image]:undefined})),
    {path:'/privacy',priority:'0.2'},{path:'/accessibility',priority:'0.2'},
  ].map(e=>({...e,alternates:pairs[e.path]}));
  const url=(e:Entry)=>`<url><loc>${siteOrigin}${e.path}</loc><lastmod>${e.lastmod??today}</lastmod><priority>${e.priority}</priority>${e.alternates?Object.entries(e.alternates).map(([l,p])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${siteOrigin}${p}"/>`).join(''):''}${(e.images??[]).map(i=>`<image:image><image:loc>${siteOrigin}${i}</image:loc></image:image>`).join('')}</url>`;
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.map(url).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
}
