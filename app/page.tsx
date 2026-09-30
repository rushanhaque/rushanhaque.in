import { OpeningScene } from '@/components/portfolio-story';
import { getPublishedContent } from '@/lib/published-content';
import { JourneyControl } from '@/components/experience-director';
import { Interlude, HeadingChoreography } from '@/components/story-fx';
import { WorksReel, Numbers, TieUps, Journey, ReviewsWall } from '@/components/home-story';
import { PreviewList, type PreviewItem } from '@/components/preview-list';
import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import './home.css';

export const metadata=pageMetadata('/','Rushan Haque — Developer & Writer','Web developer, designer and writer in Moradabad, India. Selected works, writing, and the journey so far.');

// Cover art for each piece in the writing index, keyed by slug.
const covers: Record<string, Pick<PreviewItem, 'glyph' | 'word' | 'tone' | 'ink'>> = {
  'feedback-loop-collapse': { glyph: 'RE', word: 'published on Zenodo', tone: '#173c2b', ink: '#e6e9cc' },
  'to-the-moon-and-beyond': { glyph: '☾', word: 'Blue Rose Publishers', tone: '#dfe3f0', ink: '#252b4d' },
  'aabshar-e-khayaal': { glyph: 'خیال', word: 'Urdu poetry', tone: '#e7e9d6', ink: '#173c2b' },
  'the-psychology-framework': { glyph: '( ? )', word: 'coming soon', tone: '#f4d4b2', ink: '#5b2a1c' },
  samundar: { glyph: '∿∿', word: 'coming soon', tone: '#d7e6e8', ink: '#123a40' },
};

export default async function Home() {
  const {writings}=await getPublishedContent();
  const pieces:PreviewItem[]=writings.map((w,i)=>({href:`/writing/${w.slug}`,label:`P/${String(i+1).padStart(2,'0')}`,title:w.originalTitle,line:`${w.category} · ${w.status==='Forthcoming'?'Coming soon':w.status}`,kicker:`P/${String(i+1).padStart(2,'0')} · ${w.category.toUpperCase()}`,cursor:'Read',...(covers[w.slug]??{glyph:w.originalTitle.slice(0,2),word:w.category,tone:'#e7e9d6',ink:'#173c2b'})}));
  return <main id="main-content" className="perspective-home story-home">
    <HeadingChoreography/>
    <OpeningScene/><JourneyControl/>
    <WorksReel/>
    <Numbers/>
    <Interlude kicker="THE OTHER HALF OF THE PRACTICE" text="Some ideas need a different kind of language." accent="words."/>
    <PreviewList id="writing" className="writing-list" scene="paper" items={pieces} heading={<header className="pl-heading story-head"><span className="story-kicker">03 / THE WRITTEN WORLD</span><h2 data-split>A life between <em>lines.</em></h2><p>Research asks questions. Poetry makes room for them. Books follow the thought a little further.</p><Link href="/writing" className="text-link">Enter the reading room <ArrowUpRight size={16}/></Link></header>}/>
    <TieUps/>
    <Journey/>
    <ReviewsWall/>
  </main>;
}
