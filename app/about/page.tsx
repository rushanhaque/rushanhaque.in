import { pageMetadata } from '@/lib/seo';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { Manifesto } from '@/components/story/narrative';
import { Bookshelf, Person } from '@/components/story/chapters';
import { LazyLab } from '@/components/studies/lazy-lab';
import { StoryMotion } from '@/components/story/story-motion';
import { Split } from '@/components/split';
import '../two-languages.css';
import '../home-polish.css';
import '../studies.css';
import '../narrative.css';
import '../premium-sections.css';

export const metadata=pageMetadata('/about','About — website designer & developer','Rushan Haque designs and builds websites for businesses in India and abroad: the short version, the journey so far, writing, and two small experiments you can try.');

// About: the person behind the work. The intro, the journey, the writing and the lab.
export default async function About(){
  const content = await getPublishedContent();
  return <ContentProvider value={content}><main id="main-content" className="tl ab">
    <header className="ab-hero no-fit">
      <span className="tl-kicker">ABOUT</span>
      <Split as="h1" hero text="Rushan Haque, *designer & developer.*"/>
    </header>
    <SmoothScroll/>
    <Manifesto/>
    <Person/>
    <Bookshelf/>
    <LazyLab/>
    <StoryMotion/>
  </main></ContentProvider>;
}
