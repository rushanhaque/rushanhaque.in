import { pageMetadata } from '@/lib/seo';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { ParticleHero } from '@/components/story/particle-hero';
import { Bookshelf, TypeWall, Person, Voices } from '@/components/story/chapters';
import { Manifesto, SelectedWork, CurrentlyBuilding, Process, Encore } from '@/components/story/narrative';
import './two-languages.css';
import './home-polish.css';
import './studies.css';
import './narrative.css';
import './projects/works.css';
import { LazyLab } from '@/components/studies/lazy-lab';
import { StoryMotion } from '@/components/story/story-motion';

export const metadata=pageMetadata('/','Rushan Haque | Website Designer & Developer','Website designer and developer for businesses in India and abroad. Custom websites, online stores and web apps, fast on mobile and built to rank on Google.');

// The homepage as one short story: who I am, the work, what is on the desk, how it goes, and the next step.
export default async function Home(){
  const content = await getPublishedContent();
  return <ContentProvider value={content}><main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/>
    <ParticleHero/>
    <Manifesto/>
    <SelectedWork/>
    <CurrentlyBuilding/>
    <Process/>
    <Bookshelf/>
    <TypeWall/>
    <Person/>
    <Voices/>
    <LazyLab/>
    <Encore/>
    <StoryMotion/>
  </main></ContentProvider>;
}
