'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowDown, ArrowUpRight, List, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const chapters = [
  ['.opening-scene', 'The introduction'], ['.work-cinema', 'Selected work'],
  ['.signature-section', 'The intersection'], ['.connection-story', 'The intention'], ['.type-lab', 'A little play'],
  ['.writing-desk', 'The written word'], ['.making-section', 'The making of'],
  ['.discipline-section', 'The practice'], ['.practice-section', 'The person'], ['.perspective-reviews', 'The relationships'],
  ['.margin-notes', 'The open questions'],
] as const;

export function JourneyControl() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const progress = useRef<SVGCircleElement>(null);
  const jumping = useRef(false);
  useEffect(() => {
    let positions: number[] = [], frame = 0, disposed = false;
    const measure = () => {
      if (disposed) return;
      positions = chapters.map(([selector]) => {
        const section = document.querySelector(selector);
        const anchor = section?.closest('.pin-spacer') || section;
        return anchor ? anchor.getBoundingClientRect().top + window.scrollY : Infinity;
      });
      update();
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const index = positions.reduce((last, top, i) => top <= y + window.innerHeight * .25 ? i : last, 0);
      setActive(index);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.strokeDashoffset = String(88 * (1 - Math.min(1, y / Math.max(total, 1))));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(measure);
    const main = document.querySelector('main');
    if (main) resize.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    ScrollTrigger.addEventListener('refresh', measure);
    document.fonts.ready.then(measure);
    measure();
    return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); ScrollTrigger.removeEventListener('refresh', measure); };
  }, []);

  function jump(index: number) {
    const section = document.querySelector(chapters[index][0]);
    const anchor = section?.closest('.pin-spacer') || section;
    if (!anchor) return;
    jumping.current = true;
    setOpen(false);
    // Direct chapter selection must remain stable when lazy images refresh scroll measurements.
    window.scrollTo({ top: anchor.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
    if (section instanceof HTMLElement) { section.tabIndex = -1; section.focus({ preventScroll: true }); }
  }
  return <nav className="journey-control is-visible" aria-label="Portfolio journey">
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button className="journey-trigger" aria-label="Explore the chapters"><span className="journey-ring"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14"/><circle ref={progress} cx="18" cy="18" r="14" className="journey-progress"/></svg><span>{String(active + 1).padStart(2, '0')}</span></span><span className="journey-current"><small>THE JOURNEY</small><span key={active}>{chapters[active][1]}</span></span><List size={15}/></button></PopoverTrigger><PopoverContent onCloseAutoFocus={event => { if (jumping.current) { event.preventDefault(); jumping.current = false; } }} side="top" align="end" sideOffset={12} className="journey-menu" aria-label="Choose a chapter"><div className="journey-menu-title">Follow your curiosity.<span>10 CHAPTERS</span></div>{chapters.map(([, label], i) => <button key={label} onClick={() => jump(i)} aria-current={i === active ? 'location' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{label}<ArrowUpRight size={14}/></button>)}</PopoverContent></Popover>
    <button className="journey-next" onClick={() => jump(Math.min(active + 1, chapters.length - 1))} aria-label="Next chapter" disabled={active === chapters.length - 1}><ArrowDown size={16}/></button>
  </nav>;
}

const intentions = [
  { word: 'Attention.', label: 'MAKE THE FIRST SECOND COUNT', text: 'A distinct point of view. Something that makes the right person pause.' },
  { word: 'Trust.', label: 'MAKE EVERY NEXT STEP FEEL NATURAL', text: 'Clarity in the structure. Care in the details. An experience that works.' },
  { word: 'Connection.', label: 'GIVE THE IMPRESSION SOMEWHERE TO GO', text: 'A story worth staying with. A reason to begin a conversation.' },
];

export function ConnectionStory() {
  const root = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 800px)', () => {
      const section = root.current!;
      section.classList.add('connection-pinned');
      setPinned(true);
      const q = gsap.utils.selector(section);
      const panels = q('.connection-step');
      gsap.set(panels.slice(1), { autoAlpha: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 2.5}`, pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 10 } });
      timeline.current = tl;
      tl.addLabel('intent-0', 0).to(q('.connection-frame'), { rotation: 90, scale: .85, duration: 1.2, ease: 'none' }, 0);
      panels.slice(1).forEach((panel, i) => {
        const at = .65 + i * 1.15;
        tl.to(panels[i], { autoAlpha: 0, y: -45, duration: .3 }, at)
          .fromTo(panel, { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: .55, ease: 'power3.out' }, at + .32)
          .to(q('.connection-frame'), { rotation: 180 + i * 90, borderRadius: i ? '50%' : '24%', scale: i ? 1.3 : 1, duration: .85, ease: 'power2.inOut' }, at)
          .addLabel(`intent-${i + 1}`, at + .8);
      });
      tl.to(section, { backgroundColor: '#072319', color: '#f3f3de', duration: 1.055 }, 1.95)
        .to(q('.connection-frame'), { borderColor: '#dce6be66', duration: .75 }, 1.95)
        .to({}, { duration: .5 }, 2.7);
      tl.eventCallback('onUpdate', () => { const time = tl.time(); setActive(time < .9 ? 0 : time < 2.05 ? 1 : 2); });
      return () => { timeline.current = null; section.classList.remove('connection-pinned'); setPinned(false); };
    }, root);
    mm.add('(max-width: 999px), (max-height: 799px)', () => {
      root.current!.querySelectorAll<HTMLElement>('.connection-step').forEach(step => {
        gsap.from(step.querySelector('h3'), { y: 24, opacity: .55, ease: 'none', scrollTrigger: { trigger: step, start: 'top 95%', end: 'center 55%', scrub: 1 } });
        gsap.from(step.querySelector('p'), { y: 20, opacity: 0, duration: .7, scrollTrigger: { trigger: step, start: 'top 65%', once: true } });
      });
    }, root);
    return () => mm.revert();
  }, [reduced]);
  function choose(index: number) {
    const st = timeline.current?.scrollTrigger;
    if (st) window.scrollTo({ top: st.labelToScroll(`intent-${index}`), behavior: 'smooth' });
  }
  return <section className="connection-story" ref={root} aria-labelledby="connection-title"><div className="connection-top"><span>THE IDEA BEHIND THE WORK</span><Plus size={15}/><span>FORM FOLLOWS FEELING</span></div><h2 id="connection-title" className="sr-only">Attention. Trust. Connection.</h2><div className="connection-frame" aria-hidden="true"><i/><i/></div><div className="connection-scenes">{intentions.map((intent, i) => <div className="connection-step" key={intent.word} aria-hidden={pinned && active !== i ? true : undefined}><span className="connection-step-label">0{i + 1} / {intent.label}</span><h3>{intent.word}</h3><p>{intent.text}</p></div>)}</div><div className="connection-bottom"><span>A WEBSITE SHOULD MOVE PEOPLE.</span>{pinned ? <div role="group" aria-label="Explore the design intentions">{intentions.map((intent, i) => <button key={intent.word} onClick={() => choose(i)} aria-pressed={active === i}><span>0{i + 1}</span>{intent.word.replace('.', '')}<i/></button>)}</div> : <span>THAT’S THE INTENTION.</span>}</div></section>;
}

export function DetailChoreography() {
  const { reduced } = useMotion();
  useLayoutEffect(() => {
    if (reduced) return;
    const splits: SplitText[] = [];
    const mm = gsap.matchMedia();
    mm.add('all', () => {
      document.querySelectorAll<HTMLElement>('.lab-intro h2, .desk-heading h2, .making-sticky h2, .practice-heading h2, .perspective-reviews h2, .margin-notes-heading h2').forEach(heading => {
        const readable = heading.innerText.replace(/\s+/g, ' ').trim();
        splits.push(SplitText.create(heading, { type: 'lines,words', mask: 'lines', autoSplit: true, linesClass: 'editorial-line', wordsClass: 'editorial-word', onSplit: self => {
          heading.setAttribute('aria-label', readable);
          return gsap.from(self.words, { yPercent: 115, rotation: 0, duration: 1.3, stagger: .065, ease: 'power4.out', scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
        } }));
      });
      document.querySelectorAll<HTMLElement>('.practice-experience-row, .margin-note').forEach((row, i) => {
        gsap.from(row, { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power3.inOut', delay: i % 3 * .07, scrollTrigger: { trigger: row, start: 'top 92%', once: true } });
      });
      gsap.from('.practice-stats strong', { y: 35, opacity: 0, stagger: .12, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: '.practice-stats', start: 'top 90%', once: true } });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      return () => { splits.forEach(split => split.revert()); splits.length = 0; };
    });
    mm.add('(hover: hover) and (pointer: fine)', () => {
      const cleanup: (() => void)[] = [];
      document.querySelectorAll<HTMLElement>('.header-contact, .collection-invitation a>svg, .footer-big-link>svg, .cinema-arrows button').forEach(element => {
        const x = gsap.quickTo(element, 'x', { duration: .45, ease: 'power3.out' });
        const y = gsap.quickTo(element, 'y', { duration: .45, ease: 'power3.out' });
        const move = (event: PointerEvent) => { const box = element.getBoundingClientRect(); x((event.clientX - box.left - box.width / 2) * .22); y((event.clientY - box.top - box.height / 2) * .25); };
        const leave = () => { x(0); y(0); };
        element.addEventListener('pointermove', move); element.addEventListener('pointerleave', leave);
        cleanup.push(() => { element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', leave); });
      });
      document.querySelectorAll<HTMLElement>('.work-art-link').forEach(link => {
        const disc = link.querySelector<HTMLElement>('.work-hover-disc');
        if (!disc) return;
        gsap.set(disc, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
        const x = gsap.quickTo(disc, 'x', { duration: .55, ease: 'power3.out' });
        const y = gsap.quickTo(disc, 'y', { duration: .55, ease: 'power3.out' });
        const move = (event: PointerEvent) => { const box = link.getBoundingClientRect(); x((event.clientX - box.left - box.width / 2) * .65); y((event.clientY - box.top - box.height / 2) * .65); };
        const leave = () => { x(0); y(0); };
        link.addEventListener('pointermove', move); link.addEventListener('pointerleave', leave);
        cleanup.push(() => { link.removeEventListener('pointermove', move); link.removeEventListener('pointerleave', leave); });
      });
      return () => cleanup.forEach(fn => fn());
    });
    return () => mm.revert();
  }, [reduced]);
  return null;
}
