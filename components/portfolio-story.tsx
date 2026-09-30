'use client';

import { responsive } from '@/lib/images';
import { useEffect, useRef, useState } from 'react';
import { bookingUrl } from '@/lib/content';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import Link from '@/components/site-link';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

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
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 800px)', mobile: '(max-width: 799px)', motion: '(min-width: 1000px) and (min-height: 800px)' }, context => {
      const cinematic=!!context.conditions?.motion;
      const section = root.current!;
      const desktop = !!context.conditions?.desktop;
      const q = gsap.utils.selector(section);
      gsap.from(q('.opening-letter'), { yPercent: 110, duration: 1.2, stagger: .028, ease: 'power4.out' });
      // No opacity fade: the sculpture is the likely LCP element and must paint immediately.
      gsap.from(q('.opening-object'), { scale: .94, rotation: -8, duration: 2, ease: 'power3.out' });
      gsap.from(q('.opening-meta, .opening-foot'), { opacity: 0, y: 12, duration: 1.2, delay: .55 });
      if (!cinematic) return;
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${window.innerHeight * (desktop ? .85 : .65)}`,
        pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 30,
      }});
      tl.to(q('.opening-first'), { xPercent: 0, yPercent: -6, ease: 'none', duration: 1 }, 0)
        .to(q('.opening-second'), { xPercent: 0, yPercent: 6, ease: 'none', duration: 1 }, 0)
        .to(q('.opening-foot, .opening-meta'), { opacity: 0, duration: .25 }, 0)
        .to(q('.opening-object-wrap'), { rotation: 15, scale: 1.06, yPercent: -5, ease: 'power2.inOut', duration: 1 }, 0)
        .fromTo(q('.perspective-curtain'), { clipPath: 'inset(50% 8% 50% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power3.inOut' }, .3)
        .fromTo(q('.perspective-line > span'), { yPercent: 105 }, { yPercent: 0, stagger: .08, duration: .65, ease: 'power3.out' }, .65)
        .fromTo(q('.perspective-caption'), { opacity: 0 }, { opacity: 1, duration: .35 }, 1)
        .fromTo(q('.perspective-slit'), { scaleX: 0 }, { scaleX: 1, duration: .65, ease: 'power3.out' }, .85)
        .to({}, { duration: .4 });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      const image = section.querySelector('img');
      image?.addEventListener('load', refresh, { once: true });
      return () => image?.removeEventListener('load', refresh);
    }, root);
    return () => mm.revert();
  }, [reduced]);

  return <section className="opening-scene" ref={root} aria-label="Rushan Haque, developer and writer">
    <div className="opening-meta"><span className="opening-edition">INDEPENDENT BY DESIGN</span><span>MORADABAD, INDIA <span className="opening-clock"> / {time || '--:--'} IST</span></span></div>
    <h1 className="opening-heading" aria-label="Rushan Haque. Developer and Writer.">
      <span className="opening-name" aria-hidden="true"><span className="opening-name-rule"/>RUSHAN HAQUE — A MULTIDISCIPLINARY PRACTICE</span>
      <span className="opening-first" aria-hidden="true">{'Developer'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter}</span>)}<span className="opening-period">✳</span></span>
      <span className="opening-second" aria-hidden="true"><em>{'& Writer.'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter === ' ' ? ' ' : letter}</span>)}</em></span>
    </h1>
    <p className="opening-statement">A mind for systems.<br/><em>An eye for the unexpected.</em></p>
    <div className="opening-object-wrap"><span className="object-coordinate" aria-hidden="true">FIG. 01 / OPEN FORM</span><div className="opening-object" ref={tilt} onPointerMove={e => {
      if (reduced || e.pointerType === 'touch') return;
      const box = e.currentTarget.getBoundingClientRect();
      gsap.to(tilt.current, { rotateY: (e.clientX - box.left - box.width / 2) / 18, rotateX: -(e.clientY - box.top - box.height / 2) / 18, duration: .8, overwrite: 'auto' });
    }} onPointerLeave={() => gsap.to(tilt.current, { rotateX: 0, rotateY: 0, duration: 1, overwrite: 'auto' })}>
      <img src="/images/aperture-v2.webp" {...responsive('/images/aperture-v2.webp','(max-width: 799px) 72vw, 38vw')} alt="An open sculptural form in silver and forest green" width="1100" height="1100" fetchPriority="high"/>
    </div><span className="object-study">THINK IN SYSTEMS. FEEL IN STORIES.</span></div>
    <div className="opening-foot"><a href="#selected-work" className="opening-scroll"><span><ArrowDown size={18}/></span>EXPLORE SELECTED WORK</a><p>Considered websites. Expressive words.<br/>From Moradabad to wherever you are.</p><div className="opening-actions"><Link href="/contact" className="button primary roll-host">Have something in mind? <ArrowUpRight size={16}/></Link><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="opening-availability"><span/>Let’s find a time <ArrowUpRight size={14}/></a></div></div>
    <div className="perspective-curtain" aria-hidden="true">
      <span className="perspective-label">BUILT ACROSS DISCIPLINES BECAUSE THE PROBLEMS KEEP OVERLAPPING.</span>
      <div className="perspective-copy"><div className="perspective-line"><span><small>01</small>Development.</span></div><div className="perspective-line"><span><small>02</small>Design.</span></div><div className="perspective-line"><span><small>03</small><em>Writing.</em></span></div></div>
      <div className="perspective-slit"><span/><Plus size={22}/><span/></div>
      <div className="perspective-caption"><span>PRODUCTS, INTERFACES, RESEARCH,<br/>LONG-FORM WRITING.</span><span>ENTER THE WORK <ArrowDown size={16}/></span></div>
    </div>
  </section>;
}
