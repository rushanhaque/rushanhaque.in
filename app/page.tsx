import { pageMetadata } from '@/lib/seo';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { ParticleHero } from '@/components/story/particle-hero';
import { WorksDeck, VelocityMarquee, ServiceIndex, Bookshelf, TypeWall, Person, Voices } from '@/components/story/chapters';
import './two-languages.css';
import './home-polish.css';
import './studies.css';
import { LazyLab } from '@/components/studies/lazy-lab';
import { StoryMotion } from '@/components/story/story-motion';

export const metadata=pageMetadata('/','Website Designer & Developer in Moradabad — Rushan Haque','Website designer and developer in Moradabad. Custom business websites, e-commerce and web apps, built from scratch, fast, and made to rank on Google and AI search.');

// "Two languages": the homepage told as one story, from code to verse.
export default async function Home(){
  const content = await getPublishedContent();
  return <ContentProvider value={content}><main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/>
    <ParticleHero/>
    <WorksDeck/>
    <VelocityMarquee words={['Developer', 'Project manager', 'Writer', 'Designer', 'Curious', 'Moradabad']}/>
    <ServiceIndex/>
    <Bookshelf/>
    <TypeWall/>
    <Person/>
    <Voices/>
    <LazyLab/>
    <StoryMotion/>
  </main></ContentProvider>;
}
