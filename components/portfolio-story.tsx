'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

export function OpeningScene() {
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
      gsap.from(q('.opening-letter'), { yPercent: 115, rotation: 0, duration: 1.65, stagger: .045, ease: 'power4.out' });
      gsap.from(q('.opening-object'), { scale: .94, rotation: -8, opacity: 0, duration: 2, ease: 'power3.out' });
      gsap.from(q('.opening-meta, .opening-foot'), { opacity: 0, y: 12, duration: 1.2, delay: .55 });
      if (!cinematic) return;
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${window.innerHeight * (desktop ? 1.3 : 1.2)}`,
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

  return <section className="opening-scene" ref={root} aria-label="An independent point of view">
    <div className="opening-meta"><span>RUSHAN HAQUE — INDEPENDENT PRACTICE</span><span>DESIGN / DEVELOPMENT / WORDS</span></div>
    <h1 className="opening-heading" aria-label="Different by design.">
      <span className="opening-first" aria-hidden="true">{'Different'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter}</span>)}<span className="opening-period">✳</span></span>
      <span className="opening-second" aria-hidden="true"><em>{'by design.'.split('').map((letter, i) => <span className="opening-letter" key={i}>{letter === ' ' ? '\u00a0' : letter}</span>)}</em></span>
    </h1>
    <div className="opening-object-wrap"><div className="opening-object" ref={tilt} onPointerMove={e => {
      if (reduced || e.pointerType === 'touch') return;
      const box = e.currentTarget.getBoundingClientRect();
      gsap.to(tilt.current, { rotateY: (e.clientX - box.left - box.width / 2) / 18, rotateX: -(e.clientY - box.top - box.height / 2) / 18, duration: .8, overwrite: 'auto' });
    }} onPointerLeave={() => gsap.to(tilt.current, { rotateX: 0, rotateY: 0, duration: 1, overwrite: 'auto' })}>
      <img src="/images/aperture.webp" alt="An open sculptural form in silver and forest green" width="1100" height="1100" fetchPriority="high"/>
    </div><span className="object-study">001 — AN OPEN FRAME OF MIND</span></div>
    <div className="opening-foot"><a href="#selected-work" className="opening-scroll"><span><ArrowDown size={18}/></span>SCROLL TO CHANGE YOUR PERSPECTIVE</a><p>Expressive digital experiences.<br/>For people with something to say.</p><Link href="/contact" className="opening-availability"><span/>Available for select projects <ArrowUpRight size={14}/></Link></div>
    <div className="perspective-curtain" aria-hidden="true">
      <span className="perspective-label">A GOOD WEBSITE MAKES AN IMPRESSION.</span>
      <div className="perspective-copy"><div className="perspective-line"><span>A great one</span></div><div className="perspective-line"><span>changes your</span></div><div className="perspective-line"><span><em>perspective.</em></span></div></div>
      <div className="perspective-slit"><span/><Plus size={22}/><span/></div>
      <div className="perspective-caption"><span>A DESIGNER’S EYE. A DEVELOPER’S INSTINCT.<br/>A WRITER’S NEED TO ASK WHY.</span><span>ENTER THE WORK <ArrowDown size={16}/></span></div>
    </div>
  </section>;
}

const selectionStyles = [
  { slug: 'erfolg-living', title: 'Erfolg Living', line: 'Space to slow down.', label: 'COMMERCE, CONSIDERED', image: '/images/erfolg.webp', text: 'An online presence for a world of considered interiors.', year: '2026', className: 'erfolg' },
  { slug: 'casa-and-crop', title: 'Casa & Crop', line: 'A place to belong.', label: 'CHARACTER IN EVERY CORNER', image: '/images/casa-crop.webp', text: 'An expressive digital home for objects and the spaces they shape.', year: '2026', className: 'casa' },
  { slug: 'quorum', title: 'Quorum', line: 'A more honest circle.', label: 'AN EXPERIMENT IN CONNECTION', image: '/images/quorum.webp', text: 'Four people. Four private perspectives. Feedback, revealed together.', year: '2025', className: 'quorum' },
];

export function WorkCinema() {
  const {projects}=useContent();
  const selected=projects.slice(0,3).map((p,i)=>({...selectionStyles[i],slug:p.slug,title:p.title,image:p.image!,year:p.year,text:p.description,line:p.discipline,label:p.category.toUpperCase()}));
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(0);
  const [choreographed, setChoreographed] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced || !root.current) { setChoreographed(false); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 700px)', () => {
      const section = root.current!;
      const q = gsap.utils.selector(section);
      section.classList.add('is-choreographed');
      setChoreographed(true);
      const panels = q('.work-scene') as HTMLElement[];
      gsap.set(panels.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      const tl = gsap.timeline({ scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${window.innerHeight * panels.length}`,
        pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 20,
      }});
      timeline.current = tl;
      tl.addLabel('work-0', 0).to(q('.work-scene:first-child .work-art'), { scale: 1, yPercent: 0, duration: 1.3, ease: 'none' }, 0);
      panels.slice(1).forEach((panel, i) => {
        const position = .9 + i * 1.5;
        tl.to(panel, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power2.inOut' }, position)
          .fromTo(panel.querySelector('.work-art'), { yPercent: 0, scale: 1.06, rotation: 0 }, { yPercent: 0, scale: 1, rotation: 0, duration: 1.05, ease: 'power3.out' }, position)
          .fromTo(panel.querySelectorAll('.work-title > span'), { yPercent: 105 }, { yPercent: 0, stagger: .08, duration: .7, ease: 'power3.out' }, position + .35)
          .addLabel(`work-${i + 1}`, position + .9);
      });
      tl.to({}, { duration: .65 }, Math.max(1.3, .35 + (panels.length - 1) * 1.5));
      tl.eventCallback('onUpdate', () => { const time = tl.time(); setActive(Math.min(panels.length - 1, time < 1.35 ? 0 : 1 + Math.floor((time - 1.35) / 1.5))); });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      const images = Array.from(section.querySelectorAll('img'));
      images.forEach(img => img.addEventListener('load', refresh, { once: true }));
      return () => {
        images.forEach(img => img.removeEventListener('load', refresh));
        timeline.current = null;
        section.classList.remove('is-choreographed');
        setChoreographed(false);
      };
    }, root);
    mm.add('(max-width: 999px), (max-height: 699px)', () => {
      const q = gsap.utils.selector(root.current);
      (q('.work-scene') as HTMLElement[]).forEach(panel => {
        gsap.fromTo(panel.querySelector('.work-art'), { yPercent: 0, scale: .97 }, { yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        gsap.from(panel.querySelectorAll('.work-title > span'), { yPercent: 105, stagger: .08, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 75%', once: true } });
      });
    }, root);
    return () => mm.revert();
  }, [reduced, projects]);

  function goTo(index: number) {
    if(!selected.length)return;
    const target = (index + selected.length) % selected.length;
    const st = timeline.current?.scrollTrigger;
    if (st) window.scrollTo({ top: st.labelToScroll(`work-${target}`), behavior: reduced ? 'instant' : 'smooth' });
  }

  return <section id="selected-work" className="work-cinema" ref={root} aria-label="Selected projects">
    <div className="work-scenes">{selected.map((project, i) => <article key={project.slug} className={`work-scene work-${project.className}`} inert={choreographed && active !== i ? true : undefined}>
      <div className="work-top"><span>SELECTED WORK / 0{i + 1}</span><span>{project.label}</span><span>{project.year}</span></div>
      <div className="work-watermark" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
      <Link href={`/projects/${project.slug}`} className="work-art-link" aria-label={`Explore ${project.title}`}><div className="work-art"><>{project.image?<img src={project.image} alt={`${project.title} website`} width="1600" height="775" loading="lazy"/>:<div className="work-type-cover"><span>AN INDEPENDENT EXPLORATION</span><strong>{project.title}</strong><span>{project.year} / {project.line}</span></div>}</><span className="work-image-label">VIEW PROJECT <ArrowUpRight size={16}/></span><span className="work-hover-disc" aria-hidden="true">Look<br/><em>closer.</em><ArrowUpRight size={22}/></span></div></Link>
      <div className="work-detail"><div><h2 className="work-title"><span>{project.title}</span></h2><p>{project.line}</p></div><div className="work-description"><p>{project.text}</p><Link href={`/projects/${project.slug}`} className="work-case-link">Explore the project <ArrowUpRight size={18}/></Link></div></div>
    </article>)}</div>
    {choreographed && <div className="cinema-controls"><span>THE SELECTED INDEX</span><div className="cinema-dots" role="group" aria-label="Jump to a selected project">{selected.map((project, i) => <button key={project.slug} onClick={() => goTo(i)} aria-label={`Show ${project.title}`} aria-pressed={active === i}><span>0{i + 1}</span><i/></button>)}</div><div className="cinema-arrows"><button aria-label="Previous selected project" onClick={() => goTo(active - 1)}><ArrowLeft size={16}/></button><button aria-label="Next selected project" onClick={() => goTo(active + 1)}><ArrowRight size={16}/></button></div></div>}
  </section>;
}
