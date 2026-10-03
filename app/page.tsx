import { pageMetadata } from '@/lib/seo';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { ParticleHero } from '@/components/story/particle-hero';
import { WorksDeck, VelocityMarquee, Bookshelf, TypeWall, Person, Voices } from '@/components/story/chapters';
import './two-languages.css';
import './home-polish.css';
import './studies.css';
import { LabSection } from '@/components/studies/lab-section';

export const metadata=pageMetadata('/','Rushan Haque — Project Manager & Full-Stack Developer','Project manager and full-stack developer in Moradabad, India. Client websites and software, delivered end to end, plus writing and research.');

// "Two languages": the homepage told as one story, from code to verse.
export default function Home(){
  return <main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/>
    <ParticleHero/>
    <WorksDeck/>
    <VelocityMarquee words={['Developer', 'Project manager', 'Writer', 'Designer', 'Curious', 'Moradabad']}/>
    <Bookshelf/>
    <TypeWall/>
    <Person/>
    <Voices/>
    <LabSection/>
  </main>;
}
