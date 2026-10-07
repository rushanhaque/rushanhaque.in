import { PageIntro } from '@/components/page-intro';
import sourcePages from '@/content/source-pages.json';
import extras from '@/content/seo-extras.json';
import { Directory, GuideBlock, JsonLd, RecentWork, type GuideSection } from '@/components/guide-blocks';
import type { Project } from '@/lib/content';
import { breadcrumbs, faqPage, faqsFromHtml, servicePage } from '@/lib/schema';
type SourcePage=typeof sourcePages[number];
type Extra={metaTitle?:string;alternate?:string;sections:GuideSection[]};
export const pageExtras=extras as Record<string,Extra>;

export function ImportedPage({page,projects}:{page:SourcePage;projects:Project[]}){
  const path='/'+page.slug;
  const extra=pageExtras[page.slug];
  const questions=page.sections.findIndex(html=>/source-section-label">\s*<span>[^<]*<\/span>\s*<span>Questions/.test(html));
  const at=questions>=0?questions:page.sections.length-1;
  const faqs=faqsFromHtml(page.sections);
  const area=page.kind==='Location'?page.title.replace('Website designer in ',''):undefined;
  return <main id="main-content" className="imported-page">
    <JsonLd data={servicePage({path,name:page.title,description:page.description,area})}/>
    {faqs.length>0&&<JsonLd data={faqPage(faqs)}/>}
    <JsonLd data={breadcrumbs([[page.title,path]])}/>
    <PageIntro eyebrow={page.kind.toUpperCase()} title={page.title} accent="" description={page.description.split(/(?<=[.!?])\s+/)[0]}/>
    <div className="container source-content">{page.sections.map((html,i)=>[
      i===at&&extra?.sections.map((s,j)=><GuideBlock key={'x'+j} section={s}/>),
      i===at&&<RecentWork key="work" projects={projects}/>,
      <section className="source-section" key={i} dangerouslySetInnerHTML={{__html:html}}/>,
    ])}</div>
    <Directory current={page.slug}/>
  </main>;
}
