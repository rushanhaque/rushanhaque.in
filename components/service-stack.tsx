'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);
const disciplines = [
  { name: 'Design.', line: 'First, make them feel.', description: 'A distinctive visual language. A clear hierarchy. A website with a point of view, from its first impression to its smallest detail.', tags: ['Art direction', 'Interface design', 'Interaction'], image: '/images/erfolg.webp', caption: 'ERFOLG LIVING / A SENSE OF PLACE', href: '/projects/erfolg-living' },
  { name: 'Develop.', line: 'Then, make it work.', description: 'Custom React experiences that turn visual ambition into something useful. Considered motion, responsive layouts, and care beneath the surface.', tags: ['React development', 'Creative coding', 'GSAP motion'], image: '/images/quorum.webp', caption: 'QUORUM / AN IDEA MADE TANGIBLE', href: '/projects/quorum' },
  { name: 'Question.', line: 'Always, make it mean.', description: 'Research, technical notes, and poetry. Different ways of looking closer, finding a more interesting question, and giving an idea its own voice.', tags: ['Technical writing', 'Research', 'Poetry'], image: '', caption: 'WORDS / ANOTHER WAY OF SEEING', href: '/writing' },
];

export function ServiceStack() {
  const { projects } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 700px)', () => {
      const cards = Array.from(root.current!.querySelectorAll<HTMLElement>('.discipline-card'));
      cards.forEach(card => {
        gsap.from(card.querySelector('.discipline-copy'), { y: 28, opacity: .5, duration: 1.3, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 80%', once: true } });
        gsap.fromTo(card.querySelector('.discipline-art-inner'), { scale: 1.045 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 90px', scrub: 1.2 } });
      });
      gsap.fromTo(root.current!.querySelector('.discipline-ribbon-track'), { xPercent: 8 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    });
    return () => mm.revert();
  }, [reduced]);
  return <section ref={root} className="discipline-section" aria-labelledby="discipline-title">
    <div className="discipline-intro"><span className="chapter-kicker">ONE PRACTICE / THREE WAYS IN</span><h2 id="discipline-title">A feeling.<br/>A function.<br/><em>A point of view.</em></h2><p>Not every project needs everything.<br/>Every project needs intention.</p></div>
    <div className="discipline-stack">{disciplines.map((item, i) => <article className={`discipline-card discipline-${i}`} key={item.name}>
      <div className="discipline-surface"><div className="discipline-copy"><div className="discipline-meta"><span>0{i + 1} / THE PRACTICE</span><ArrowUpRight size={22}/></div><div><h3>{item.name}</h3><p className="discipline-line">{item.line}</p><p className="discipline-description">{item.description}</p></div><ul>{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>
      <Link className="discipline-art" href={item.href.startsWith('/projects/') && !projects.some(project => '/projects/' + project.slug === item.href) ? '/projects' : item.href} aria-label={i === 2 ? 'Explore the writing collection' : `Explore ${i === 0 ? 'Erfolg Living' : 'Quorum'}`}><div className="discipline-art-inner">{item.image ? <img src={item.image} width="1600" height="800" loading="lazy" alt={i === 0 ? 'Erfolg Living architectural website' : 'Quorum private feedback website'}/> : <div className="discipline-poem"><span>NOTES FROM AN<br/>INDEPENDENT MIND</span><p>What if<br/><em>we looked</em><br/>again?</p><span>RESEARCH · REFLECTION · VERSE</span></div>}</div><span className="discipline-art-label">{item.caption}<span className="discipline-open"><ArrowUpRight size={22}/></span></span></Link></div>
    </article>)}</div>
    <div className="discipline-ribbon" aria-hidden="true"><div className="discipline-ribbon-track">MAKE IT FEEL. <em>MAKE IT MATTER.</em> MAKE IT FEEL.</div></div>
    <div className="discipline-outro"><span>Bring the ambition. We’ll find the right form.</span><Link href="/services">Explore the services <ArrowUpRight size={18}/></Link></div>
  </section>;
}
