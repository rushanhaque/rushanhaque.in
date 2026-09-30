'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, List } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

gsap.registerPlugin(ScrollTrigger);

const chapters = [
  ['.opening-scene', 'Introduction'], ['.works-reel', 'Selected works'],
  ['.numbers', 'By the numbers'], ['.writing-list', 'Writing'],
  ['.tieups', 'Beyond the build'], ['.journey', 'Journey'], ['.reviews-wall', 'Reviews'],
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
  return <nav className="journey-control is-visible" hidden={active === 0} aria-label="Portfolio journey">
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button className="journey-trigger" aria-label="Explore the chapters"><span className="journey-ring"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14"/><circle ref={progress} cx="18" cy="18" r="14" className="journey-progress"/></svg><span>{String(active + 1).padStart(2, '0')}</span></span><span className="journey-current"><small>THE JOURNEY</small><span key={active}>{chapters[active][1]}</span></span><List size={15}/></button></PopoverTrigger><PopoverContent onCloseAutoFocus={event => { if (jumping.current) { event.preventDefault(); jumping.current = false; } }} side="top" align="end" sideOffset={12} className="journey-menu" aria-label="Choose a chapter"><div className="journey-menu-title">Follow your curiosity.<span>{chapters.length} CHAPTERS</span></div>{chapters.map(([, label], i) => <button key={label} onClick={() => jump(i)} aria-current={i === active ? 'location' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{label}<ArrowUpRight size={14}/></button>)}</PopoverContent></Popover>
    <button className="journey-next" onClick={() => jump(Math.min(active + 1, chapters.length - 1))} aria-label="Next chapter" disabled={active === chapters.length - 1}><ArrowDown size={16}/></button>
  </nav>;
}
