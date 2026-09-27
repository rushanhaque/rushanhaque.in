'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MoveUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from '@/components/site-link';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);
const lenses = [
  { name: 'Design', heading: 'Make it felt.', text: 'A clear point of view. A considered rhythm. An experience that feels unmistakably yours.', detail: 'Art direction / Interfaces / Digital experiences', word: 'Feeling', color: '#cdddbe' },
  { name: 'Development', heading: 'Make it work.', text: 'The care you see on the surface should run all the way through. Responsive, accessible, and built to last.', detail: 'Creative development / Responsive systems / Interaction', word: 'Function', color: '#dce8ed' },
  { name: 'Writing', heading: 'Make it mean something.', text: 'Find the thought worth sharing. Give it a voice. Leave enough room for someone else to see themselves in it.', detail: 'Poetry / Research / Storytelling', word: 'Meaning', color: '#eadfce' },
];

export function SignatureExperience() {
  const root = useRef<HTMLElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.signature-rail-inner', { xPercent: 4 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('.lens-statement, .lens-controls', { y: 32, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.lens-layout', start: 'top 82%', once: true } });
      gsap.fromTo('.lens-orbit', { rotate: -25 }, { rotate: 35, ease: 'none', scrollTrigger: { trigger: '.lens-art', start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  return <section ref={root} className="signature-section" aria-labelledby="signature-heading">
    <div className="signature-rail" aria-hidden="true"><div className="signature-rail-inner">A little different. <em>By intention.</em> <span>✳</span> A little different. <em>By intention.</em> <span>✳</span></div></div>
    <div className="lens-layout"><div className="lens-statement"><span className="chapter-kicker">THREE LENSES / ONE POINT OF VIEW</span><h2 id="signature-heading">Good things happen<br/>at the <em>intersection.</em></h2><p>Some ideas need a designer. Others need a developer, or the right words. The best ones bring them together.</p><Link className="text-link" href="/services">Explore the practice <ArrowUpRight size={16}/></Link></div>
      <div className="lens-art" ref={art} style={{ '--lens-color': lenses[active].color } as React.CSSProperties} onPointerMove={event => {
        if (reduced || event.pointerType === 'touch') return;
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--lens-x', `${(event.clientX - box.left) / box.width * 100}%`);
        event.currentTarget.style.setProperty('--lens-y', `${(event.clientY - box.top) / box.height * 100}%`);
      }}><div className="lens-grid"/><span className="lens-coordinate">RH / STUDY 00{active + 1}</span><div className="lens-orbit" aria-hidden="true"><i/><i/><i/></div><span className="lens-word" key={active}>{lenses[active].word}<sup>0{active + 1}</sup></span><MoveUpRight className="lens-corner" size={26}/><span className="lens-caption">A SHIFT IN PERSPECTIVE</span></div>
      <div className="lens-controls"><div role="tablist" aria-label="Explore three disciplines">{lenses.map((lens, i) => <button key={lens.name} id={`lens-tab-${i}`} role="tab" aria-selected={active === i} aria-controls="lens-panel" tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={event => { const next = event.key === 'ArrowRight' ? (i + 1) % 3 : event.key === 'ArrowLeft' ? (i + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : -1; if (next >= 0) { event.preventDefault(); setActive(next); document.getElementById(`lens-tab-${next}`)?.focus(); } }}><small>0{i + 1}</small>{lens.name}<ArrowUpRight size={18}/></button>)}</div><div id="lens-panel" role="tabpanel" aria-labelledby={`lens-tab-${active}`} tabIndex={0}><h3>{lenses[active].heading}</h3><p>{lenses[active].text}</p><small>{lenses[active].detail}</small></div></div>
    </div>
  </section>;
}
