'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

const process = [
  { title: 'Question everything.', name: 'Discovery', copy: 'The ambition. The audience. The thing nobody has asked yet. We find the real brief before drawing the first line.' },
  { title: 'Find the character.', name: 'Direction', copy: 'Typography, composition, colour. A visual language with a point of view, built around the story only you can tell.' },
  { title: 'Give it a pulse.', name: 'Development', copy: 'Custom React development, purposeful motion, and considered interactions. Every screen receives the same care.' },
  { title: 'Sweat the small things.', name: 'Refinement', copy: 'Performance, accessibility, and the last two pixels. Test, refine, and make the handover as thoughtful as the website.' },
];

export function MakingOf() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);
  const { reduced } = useMotion();
  useEffect(() => {
    if (!root.current) return;
    const steps = Array.from(root.current.querySelectorAll<HTMLElement>('.making-step'));
    let frame = 0;
    let visible = false;
    // Read the final document geometry: preceding responsive pins can change its offset.
    const updatePhase = () => {
      frame = 0;
      const threshold = window.innerHeight * .65;
      const current = steps.reduce((index, step, i) => step.getBoundingClientRect().top < threshold ? i : index, 0);
      setPhase(current);
    };
    const onScroll = () => { if (visible && !frame) frame = requestAnimationFrame(updatePhase); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) onScroll(); });
    observer.observe(root.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const ctx = gsap.context(() => {
      if (!reduced) gsap.to('.draft-rule', { scaleX: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'bottom 80%', scrub: .4 } });
    }, root);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); ctx.revert(); };
  }, [reduced]);
  return <section className="making-section" ref={root} aria-labelledby="making-title">
    <div className="making-sticky"><span className="chapter-kicker">04 / NOTHING HERE IS ARBITRARY</span><h2 id="making-title">From a question<br/>to <em>something real.</em></h2>
      <div className={`draft-stage draft-phase-${phase}`} aria-hidden="true"><div className="draft-top"><span>THE MAKING OF AN EXPERIENCE</span><Plus size={13}/></div><div className="draft-browser"><div className="draft-browser-bar"><i/><i/><i/><span>AN IDEA, TAKING SHAPE</span></div><div className="draft-content"><div className="draft-layout-grid"/><span className="draft-rule rule-one"/><span className="draft-rule rule-two"/><div className="draft-title">A considered<br/><em>perspective.</em></div><img src="/images/erfolg.webp" alt="" width="1600" height="775" loading="lazy"/><div className="draft-mark">Built to be felt. <ArrowUpRight size={14}/></div></div></div><div className="draft-footer"><span>0{phase + 1} / {process[phase].name.toUpperCase()}</span><span className="draft-phase-dots">{process.map((_, i) => <i key={i} className={i <= phase ? 'is-filled' : ''}/>)}</span></div></div>
    </div>
    <div className="making-steps">{process.map((step, i) => <article className={`making-step ${phase === i ? 'is-current' : ''}`} key={step.name}><span className="making-number">0{i + 1}</span><div><span className="chapter-kicker">{step.name}</span><h3>{step.title}</h3><p>{step.copy}</p></div><ArrowDown size={18} aria-hidden="true"/></article>)}</div>
  </section>;
}

const bookStyles = [
  { category: '01 / TECHNICAL NOTE', title: <>The feedback<br/>loop.</>, sub: 'On artificial intelligence learning from its own reflection.', slug: 'feedback-loop-collapse', bottom: 'PUBLISHED ON ZENODO / 2026', style: 'technical' },
  { category: '02 / URDU POETRY', title: <>Aabshar-e-<br/><em>Khayaal.</em></>, sub: 'A different language for the things that stay with us.', slug: 'aabshar-e-khayaal', bottom: 'AN ONGOING COLLECTION / 2024', style: 'poetry' },
  { category: '03 / WORK IN PROGRESS', title: <>The Psychology<br/><em>Framework.</em></>, sub: 'The architecture of how we think. A book taking shape.', slug: 'the-psychology-framework', bottom: 'FORTHCOMING', style: 'book' },
];

export function WritingDesk() {
  const {writings}=useContent();
  const books=writings.slice(0,3).map((w,i)=>({...bookStyles[i],slug:w.slug,title:w.title,sub:w.description,category:`0${i+1} / ${w.category.toUpperCase()}`,bottom:`${w.status.toUpperCase()} / ${w.year}`}));
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 800px)', () => {
      const items = root.current!.querySelectorAll('.desk-item');
      gsap.fromTo(items, { y: 36, opacity: .5 }, { y: 0, opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'center 60%', scrub: 1.2 } });
    }, root);
    return () => mm.revert();
  }, [reduced]);
  return <section className="writing-desk" ref={root} aria-labelledby="desk-title"><div className="desk-heading"><span className="chapter-kicker">03 / ANOTHER SIDE OF THE SAME MIND</span><h2 id="desk-title">Between the lines,<br/><em>there’s a little more of me.</em></h2><Link href="/writing" className="desk-all">Enter the reading room <ArrowUpRight size={18}/></Link></div><div className="desk-shelf">{books.map(book => <article className="desk-item" key={book.slug}><Link href={`/writing/${book.slug}`} className={`desk-cover desk-${book.style}`}><span className="desk-category">{book.category}</span><h3>{book.title}</h3><div className="desk-art" aria-hidden="true">{book.style === 'technical' ? <><span>RE</span><span>RE</span><span>RE</span></> : book.style === 'poetry' ? <><span>خیال</span><i/></> : <><span>( ? )</span><i/></>}</div><p>{book.sub}</p><div className="desk-bottom"><span>{book.bottom}</span><ArrowUpRight size={18}/></div></Link></article>)}</div></section>;
}
