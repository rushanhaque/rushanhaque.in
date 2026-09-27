export const dynamic='force-dynamic';
import Link from '@/components/site-link';
import { ArrowUpRight, Plus } from 'lucide-react';
import { OpeningScene, WorkCinema } from '@/components/portfolio-story';
import { ServiceStack } from '@/components/service-stack';
import { TypeLaboratory } from '@/components/type-laboratory';
import { WritingDesk, MakingOf } from '@/components/studio-chapters';
import { ServiceAccordion, ReviewCarousel } from '@/components/interactive';
import { getPublishedContent } from '@/lib/published-content';
import { ConnectionStory, DetailChoreography, JourneyControl } from '@/components/experience-director';

import { DesignDecision } from '@/components/design-decision';
import { pageMetadata } from '@/lib/seo';
import { StudyIndex, PerspectiveStudy, DirectionStudy, DecisionsStudy, EchoStudy, EditionStudy } from '@/components/portfolio-experiments';
import { SignatureExperience } from '@/components/signature-experience';
export const metadata=pageMetadata('/','Rushan Haque — Designer, Developer & Writer','Expressive websites, considered words, and an independent creative practice.');
export default async function Home() {const {experience,insights,certifications,projects}=await getPublishedContent();
  return <main id="main-content" className="perspective-home">
    <DetailChoreography/>
    <OpeningScene/><JourneyControl/>
    <WorkCinema/>
    <div className="collection-invitation"><p>A few selected perspectives.<br/>There’s more to the story.</p><Link href="/projects">The complete collection <span>{projects.length}</span><ArrowUpRight/></Link></div>
    <StudyIndex/><PerspectiveStudy/><SignatureExperience/><DirectionStudy/><ConnectionStory/>{projects.some(project => project.slug === 'erfolg-living') && <DesignDecision/>}<DecisionsStudy/><TypeLaboratory/>
    <EchoStudy/><WritingDesk/>
    <MakingOf/><ServiceStack/>
    <section className="practice-section" aria-labelledby="practice-title">
      <div className="practice-heading"><span className="chapter-kicker">05 / ONE MIND. A FEW DIFFERENT HATS.</span><h2 id="practice-title">The common thread?<br/><em>Curiosity.</em></h2><span className="practice-cross" aria-hidden="true"><Plus strokeWidth={.6}/></span></div>
      <div className="practice-body"><div className="practice-person"><span className="practice-signature">Rushan.</span><p>I’m a designer, developer, and writer based in Moradabad, India. I build expressive websites and explore ideas through technology, research, and poetry.</p><p>The work changes. The need to make it mean something stays.</p><Link href="/about" className="text-link">A little more about me <ArrowUpRight size={16}/></Link><div className="practice-stats"><Link href="/projects"><strong>40<span>+</span></strong><span>Projects contributed to <ArrowUpRight size={12}/></span></Link><Link href="/certifications"><strong>20<span>+</span></strong><span>Certifications & awards <ArrowUpRight size={12}/></span></Link></div></div><div className="practice-services"><span className="chapter-kicker">WHAT WE CAN MAKE TOGETHER</span><ServiceAccordion/><Link className="practice-tieup" href="/collaborations">Have something bigger in mind? <span>Let’s collaborate <ArrowUpRight size={14}/></span></Link></div></div>
      <div className="practice-experience"><div className="practice-experience-title"><span className="chapter-kicker">A PRACTICE SHAPED BY DOING</span><Link href="/experience">The full journey <ArrowUpRight size={15}/></Link></div>{experience.slice(0, 3).map(item => <Link href="/experience" className="practice-experience-row" key={item.role}><span>{item.period}</span><h3>{item.role}</h3><span>{item.company}</span><ArrowUpRight size={18}/></Link>)}</div>
    </section>
    <section className="selected-credentials container"><span className="eyebrow">SELECTED LEARNING</span><div>{certifications.slice(0,3).map(c=><Link key={c.title} href="/certifications"><small>{c.issuer} · {c.date}</small>{c.title}<ArrowUpRight size={18}/></Link>)}</div></section>
    <section className="perspective-reviews" aria-labelledby="review-heading"><div><span className="chapter-kicker">06 / ON THE OTHER SIDE OF THE WORK</span><h2 id="review-heading">An impression<br/>that <em>stays.</em></h2><Link href="/reviews" className="text-link">The people I’ve worked with <ArrowUpRight size={16}/></Link></div><ReviewCarousel/></section>
    <section className="margin-notes" aria-labelledby="notes-heading"><div className="margin-notes-heading"><span className="chapter-kicker">07 / THOUGHTS IN THE MARGINS</span><h2 id="notes-heading">Still <em>thinking.</em></h2><Link href="/insights">All personal insights <ArrowUpRight size={16}/></Link></div>{insights.map((insight, i) => <Link className="margin-note" href={`/insights/${insight.slug}`} key={insight.slug}><span className="margin-index">0{i + 1} / {insight.tag}</span><h3>{insight.title}</h3><p>{insight.text}</p><span className="margin-arrow"><ArrowUpRight size={23}/></span></Link>)}</section>
    <EditionStudy/>
  </main>;
}
