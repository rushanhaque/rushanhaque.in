'use client';

import { responsive } from '@/lib/images';
import { useEffect, useRef, useState } from 'react';
import { bookingUrl } from '@/lib/content';
import { gsap } from 'gsap';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useMotion } from '@/components/site-motion';



// Local time in Moradabad, filled in after hydration so server and client markup match.
function useIstTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => window.clearInterval(timer);
  }, []);
  return time;
}

export function OpeningScene() {
  const time = useIstTime();
  const root = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.opening-letter', { yPercent: 105, duration: .9, stagger: .018, ease: 'power3.out', clearProps: 'transform' });
      gsap.from('.opening-object', { scale: .96, rotation: -8, duration: 1.6, ease: 'power3.out', clearProps: 'transform' });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return <section className="opening-scene" ref={root} aria-label="Rushan Haque, developer and writer">
    <div className="opening-meta"><span className="opening-edition">INDEPENDENT BY DESIGN</span><span>MORADABAD, INDIA <span className="opening-clock"> / {time || '--:--'} IST</span></span></div>
    <div className="opening-copy"><h1 className="opening-heading" aria-label="Rushan Haque. Developer and Writer.">
      <span className="opening-name" aria-hidden="true"><span className="opening-name-rule"/>RUSHAN HAQUE — A MULTIDISCIPLINARY PRACTICE</span>
      <span className="opening-first" aria-hidden="true">{'Developer'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter}</span>)}<span className="opening-period">✳</span></span>
      <span className="opening-second" aria-hidden="true"><em>{'& Writer.'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter === ' ' ? ' ' : letter}</span>)}</em></span>
    </h1>
    <p className="opening-statement">A mind for systems.<br/><em>An eye for the unexpected.</em></p></div>
    <div className="opening-object-wrap"><span className="object-coordinate" aria-hidden="true">FIG. 01 / OPEN FORM</span><div className="opening-object" ref={tilt} onPointerMove={e => {
      if (reduced || e.pointerType === 'touch') return;
      const box = e.currentTarget.getBoundingClientRect();
      gsap.to(tilt.current, { rotateY: (e.clientX - box.left - box.width / 2) / 18, rotateX: -(e.clientY - box.top - box.height / 2) / 18, duration: .8, overwrite: 'auto' });
    }} onPointerLeave={() => gsap.to(tilt.current, { rotateX: 0, rotateY: 0, duration: 1, overwrite: 'auto' })}>
      <img src="/images/aperture-v2.webp" {...responsive('/images/aperture-v2.webp','(max-width: 799px) 72vw, 38vw')} alt="An open sculptural form in silver and forest green" width="1100" height="1100" fetchPriority="high"/>
    </div><span className="object-study">THINK IN SYSTEMS. FEEL IN STORIES.</span></div>
    <div className="opening-foot"><a href="#selected-work" className="opening-scroll"><span><ArrowDown size={18}/></span>EXPLORE SELECTED WORK</a><p>Considered websites. Expressive words.<br/>From Moradabad to wherever you are.</p><div className="opening-actions"><Link href="/contact" className="button primary roll-host">Have something in mind? <ArrowUpRight size={16}/></Link><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="opening-availability"><span/>Let’s find a time <ArrowUpRight size={14}/></a></div></div>
  </section>;
}
