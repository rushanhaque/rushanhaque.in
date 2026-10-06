import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { PageIntro } from '@/components/page-intro';
import sourcePages from '@/content/source-pages.json';
import type { Project } from '@/lib/content';
import { responsive } from '@/lib/images';
import { projectAccess, projectLink } from '@/lib/project-access';
type SourcePage=typeof sourcePages[number];

const domain=(url:string)=>{try{return new URL(url).hostname.replace(/^www\./,'');}catch{return '';}};

// Live client sites, shown as quiet thumbnails before the questions.
function RecentWork({works}:{works:Project[]}){
  return <section className="source-section source-work" aria-labelledby="source-work-title">
    <div className="source-section-label"><span>Recent work</span><span>Recent work</span><span/></div>
    <div className="source-work-head"><h2 suppressHydrationWarning id="source-work-title">Websites I’ve built recently.</h2><Link href="/projects" className="source-work-all">See all work</Link></div>
    <ul className="source-work-grid">{works.map(w=><li key={w.slug}><a {...projectLink(w)} className="source-work-card">
      <span className="source-work-image"><img src={w.image!} {...responsive(w.image,'(max-width: 650px) 46vw, 520px')} alt={`${w.title} website`} width="1600" height="1000" loading="lazy" decoding="async"/></span>
      <span className="source-work-meta"><strong>{w.title}</strong><span>{domain(w.url)}<span className="sr-only"> (opens in a new tab)</span></span></span>
      <span className="source-work-desc">{w.description}</span>
    </a></li>)}</ul>
  </section>;
}

export function ImportedPage({page,projects}:{page:SourcePage;projects:Project[]}){
  const works=projects.filter(p=>p.category==='Client work'&&p.image&&projectAccess(p)==='visit').slice(0,4);
  const questions=page.sections.findIndex(html=>/source-section-label">\s*<span>[^<]*<\/span>\s*<span>Questions/.test(html));
  const at=questions>=0?questions:page.sections.length-1;
  return <main id="main-content" className="imported-page"><PageIntro eyebrow={page.kind.toUpperCase()} title={page.title} accent="" description={page.description.split(/(?<=[.!?])\s+/)[0]}/><div className="container source-content">{page.sections.map((html,i)=>[
    i===at&&works.length>0&&<RecentWork key="work" works={works}/>,
    <section className="source-section" key={i} dangerouslySetInnerHTML={{__html:html}}/>,
  ])}</div><nav className="container source-directory" aria-label="Explore services and locations"><h2 suppressHydrationWarning>Explore</h2><div><section><h3>Services</h3>{sourcePages.filter(p=>p.kind==='Service').map(p=><Link key={p.slug} href={'/'+p.slug} aria-current={p.slug===page.slug?'page':undefined}>{p.title}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5}/></Link>)}</section><section><h3>Areas served</h3>{sourcePages.filter(p=>p.kind==='Location').map(p=><Link key={p.slug} href={'/'+p.slug} aria-current={p.slug===page.slug?'page':undefined}>{p.title.replace('Website designer in ','')}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5}/></Link>)}</section></div></nav></main>;}
