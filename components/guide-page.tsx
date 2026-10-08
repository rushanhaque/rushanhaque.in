import guides from '@/content/guides.json';
import { PageIntro } from '@/components/page-intro';
import { accentTitle, Directory, FaqBlock, GuideBlock, GuideLead, JsonLd, NextStep, RecentWork, type GuideSection } from '@/components/guide-blocks';
import type { Project } from '@/lib/content';
import { siteOrigin } from '@/lib/seo';
import { breadcrumbs, faqPage, ids, servicePage } from '@/lib/schema';

export type Guide = (typeof guides)[number] & { area?: string; alternate?: string };

// A long-form page answering one search intent: price, an industry, a comparison or a language.
export function GuidePage({ guide, projects }: { guide: Guide; projects: Project[] }) {
  const path = '/' + guide.slug;
  const hi = guide.lang === 'hi';
  const page = guide.schema === 'article'
    ? { '@context': 'https://schema.org', '@type': 'Article', '@id': `${siteOrigin}${path}#article`, headline: guide.title, description: guide.description, inLanguage: 'en-IN', url: siteOrigin + path, mainEntityOfPage: siteOrigin + path, datePublished: guide.updated, dateModified: guide.updated, image: `${siteOrigin}/og.jpg`, author: { '@id': ids.person }, publisher: { '@id': ids.person }, about: { '@id': ids.business } }
    : { ...servicePage({ path, name: guide.title, description: guide.description, area: guide.area }), inLanguage: hi ? 'hi-IN' : 'en-IN' };
  const faqLabel = String(guide.sections.length + 1).padStart(2, '0');
  return <main id="main-content" className="imported-page guide-page" lang={hi ? 'hi' : undefined}>
    <JsonLd data={page}/>
    <JsonLd data={faqPage(guide.faqs)}/>
    <JsonLd data={breadcrumbs([[guide.title, path]])}/>
    <PageIntro eyebrow={guide.eyebrow.toUpperCase()} title={accentTitle(guide.title, guide.lang)[0]} accent={accentTitle(guide.title, guide.lang)[1]} description={guide.intro}/>
    <div className="container source-content">
      <GuideLead facts={guide.facts} updated={guide.updated} lang={guide.lang}/>
      {guide.sections.map((s, i) => <GuideBlock key={i} section={s as GuideSection}/>)}
      <RecentWork projects={projects} title={hi ? 'हाल में बनाई गई वेबसाइटें' : 'Websites I’ve built recently.'} label={hi ? 'हाल का काम' : 'Recent work'}/>
      <FaqBlock label={faqLabel} faqs={guide.faqs} title={hi ? 'अक्सर पूछे जाने वाले सवाल' : 'Questions people actually ask'}/>
      <NextStep text={guide.cta} lang={guide.lang}/>
    </div>
    <Directory current={guide.slug}/>
  </main>;
}
