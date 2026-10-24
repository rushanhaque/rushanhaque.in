import { pageMetadata } from '@/lib/seo';
import { Choreography } from '@/components/story/choreography';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { Manifesto } from '@/components/story/narrative';
import { Bookshelf, Person } from '@/components/story/chapters';
import { LazyLab } from '@/components/studies/lazy-lab';
import { StoryMotion } from '@/components/story/story-motion';
import { Split } from '@/components/split';
import { jsonLd, siteOrigin } from '@/lib/seo';
import { breadcrumbs, ids } from '@/lib/schema';
import '../two-languages.css';
import '../home-polish.css';
import '../studies.css';
import '../narrative.css';
import '../premium-sections.css';

export const metadata=pageMetadata('/about','About — website designer & developer','Rushan Haque designs and builds websites for businesses in India and abroad: the short version, the journey so far, writing, and two small experiments you can try.');

// About: the person behind the work. The intro, the journey, the writing and the lab.
export default async function About(){
  const content = await getPublishedContent();
  const countries = ['India', ...Array.from(new Set(content.reviews.map(r => r.location).filter((l): l is string => !!l && l !== 'India')))];
  // A profile page for search engines and AI assistants, pointing at the one Person in the site graph.
  const profile = { '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': `${siteOrigin}/about#page`, url: `${siteOrigin}/about`, name: 'About Rushan Haque', mainEntity: { '@id': ids.person }, isPartOf: { '@id': ids.website } };
  return <ContentProvider value={content}><main id="main-content" className="tl ab">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([profile, breadcrumbs([['About', '/about']])]) }}/>
    <header className="ab-hero no-fit">
      <span className="tl-kicker">ABOUT</span>
      <Split as="h1" hero text="Rushan Haque, *designer & developer.*"/>
      {/* The facts in one place, set as a drawing's title block: for visitors, and for search and AI answers. */}
      <dl className="ab-facts">
        <div><dt>Role</dt><dd>Freelance website designer &amp; full-stack developer</dd></div>
        <div><dt>Based in</dt><dd>Moradabad, India · IST (UTC+5:30)</dd></div>
        <div><dt>Clients in</dt><dd>{countries.join(', ')}</dd></div>
        <div><dt>Builds</dt><dd>Business websites, online stores, export catalogues, web apps</dd></div>
        <div><dt>Stack</dt><dd>Next.js, React, TypeScript, cloud hosting</dd></div>
        <div><dt>Languages</dt><dd>English, Hindi, French</dd></div>
      </dl>
    </header>
    <SmoothScroll/>
    <Manifesto/>
    <Person/>
    <Bookshelf/>
    <LazyLab/>
    <StoryMotion/>
    <Choreography/>
  </main></ContentProvider>;
}
