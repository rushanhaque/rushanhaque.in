import { pageMetadata } from '@/lib/seo';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { ParticleHero } from '@/components/story/particle-hero';
import { VelocityMarquee, ServiceIndex, Bookshelf, TypeWall, Person, Voices } from '@/components/story/chapters';
import { Manifesto, SelectedWork, Process, Encore } from '@/components/story/narrative';
import './two-languages.css';
import './home-polish.css';
import './studies.css';
import './narrative.css';
import { LazyLab } from '@/components/studies/lazy-lab';
import { StoryMotion } from '@/components/story/story-motion';
import { HomeFaq } from '@/components/home-faq';

export const metadata=pageMetadata('/','Website Designer & Developer in Moradabad, India | Rushan Haque','Website designer & developer in Moradabad, India. Custom business websites, online stores and web apps, fast on mobile and built to rank on Google. Fixed written quote.');

// "Two languages": the homepage told as one story, from code to verse.
export default async function Home(){
  const content = await getPublishedContent();
  return <ContentProvider value={content}><main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/>
    <ParticleHero/>
    <Manifesto/>
    <SelectedWork/>
    <VelocityMarquee words={['Developer', 'Project manager', 'Writer', 'Designer', 'Curious', 'Moradabad']}/>
    <ServiceIndex/>
    <Process/>
    <Bookshelf/>
    <TypeWall/>
    <Person/>
    <Voices/>
    <HomeFaq/>
    <LazyLab/>
    <Encore/>
    <StoryMotion/>
  </main></ContentProvider>;
}
