import { pageMetadata } from '@/lib/seo';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { ParticleHero } from '@/components/story/particle-hero';
import { TwoLanguages, WorksDeck, VelocityMarquee, Bookshelf, TypeWall, Person, Voices, LabTeaser, ChapterRail } from '@/components/story/chapters';
import './two-languages.css';
import './home-polish.css';

export const metadata=pageMetadata('/','Rushan Haque — Developer & Writer','Two languages, one thought. Websites, writing and a multidisciplinary practice by Rushan Haque in Moradabad, India.');

// "Two languages": the homepage told as one story, from code to verse.
export default function Home(){
  return <main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/><ChapterRail/>
    <ParticleHero/>
    <TwoLanguages/>
    <WorksDeck/>
    <VelocityMarquee words={['Developer', 'Writer', 'خیال', 'Designer', 'Curious', 'Moradabad']}/>
    <Bookshelf/>
    <TypeWall/>
    <Person/>
    <Voices/>
    <LabTeaser/>
  </main>;
}
