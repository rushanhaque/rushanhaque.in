import { pageMetadata } from '@/lib/seo';
import { Person } from '@/components/story/chapters';
import { Reach } from '@/components/story/reach';
import { Choreography } from '@/components/story/choreography';
import { ContentProvider } from '@/components/content-provider';
import { getPublishedContent } from '@/lib/published-content';
import { Preloader, preloadScript } from '@/components/story/preloader';
import { SmoothScroll } from '@/components/story/smooth-scroll';
import { NameHero } from '@/components/story/name-hero';
import { SelectedWork, CurrentlyBuilding, Encore } from '@/components/story/narrative';
import { Clientele, Capabilities, Voices } from '@/components/story/premium-sections';
import { StoryMotion } from '@/components/story/story-motion';
import { ProductsList } from '@/components/works-showcase';
import { placementOf } from '@/lib/project-access';
import './two-languages.css';
import './home-polish.css';
import './narrative.css';
import './premium-sections.css';
import './projects/works.css';

export const metadata=pageMetadata('/','Rushan Haque | Website Designer & Developer','Website designer and developer for businesses in India and abroad. Custom websites, online stores and web apps, fast on mobile and built to rank on Google.');

// The homepage keeps to the work: what has been built, for whom, what is on the desk,
// what else I take on, what clients say, and the next step. The person lives on /about.
export default async function Home(){
  const content = await getPublishedContent();
  return <ContentProvider value={content}><main id="main-content" className="tl">
    <script dangerouslySetInnerHTML={{ __html: preloadScript }}/>
    <Preloader/><SmoothScroll/>
    <NameHero/>
    <SelectedWork/>
    <Reach/>
    <Person n="III"/>
    <CurrentlyBuilding/>
    {/* The products, as on the Works page. */}
    {content.projects.some(p => placementOf(p) === 'product') && <ProductsList items={content.projects.filter(p => placementOf(p) === 'product')}/>}
    <Capabilities/>
    <Voices/>
    <Clientele/>
    <Encore n={(content.clients ?? []).some(c => c.logo) ? 'VIII' : 'VII'}/>
    <StoryMotion/>
    <Choreography/>
  </main></ContentProvider>;
}
