'use client';
import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

type Chapter = { label: string; el: HTMLElement };
const anchorOf = (el: HTMLElement) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el) as HTMLElement;

// The homepage's connective tissue: headings rise out of a mask as each
// chapter arrives, the green chapters open out to full width, and a rail
// on the left keeps track of where you are in the story.
export function StoryMotion() {
  const { reduced } = useMotion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);
  const [away, setAway] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Each heading rises out of its own baseline: a clip that grows as the heading lifts,
    // so the text never changes shape and the one-line heading fit is untouched.
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.tl h2').forEach(h => {
        if (h.getBoundingClientRect().top < window.innerHeight * .9) return;
        gsap.fromTo(h, { yPercent: 70, clipPath: 'inset(-30% -8% 100% -8%)' }, { yPercent: 0, clipPath: 'inset(-30% -8% -30% -8%)', duration: 1.25, ease: 'expo.out', clearProps: 'transform,clipPath', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('.tl .tl-kicker').forEach(k => {
        if (k.getBoundingClientRect().top < window.innerHeight * .9) return;
        gsap.from(k, { opacity: 0, y: 14, letterSpacing: '.42em', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: k, start: 'top 92%', once: true } });
      });
    });
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine)', () => {
      ['.tl-wall', '.tl-voices'].forEach(sel => {
        const el = document.querySelector<HTMLElement>(sel);
        if (el) gsap.fromTo(el, { clipPath: 'inset(0% 3.2% round 40px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 20%', scrub: .4 } });
      });
    });
    return () => { ctx.revert(); mm.revert(); };
  }, [reduced]);

  // Chapter rail: the current chapter is the last one whose top has passed the middle of the
  // screen. Chapters are re-read whenever the page grows (the lab loads late).
  useEffect(() => {
    let list: Chapter[] = [], frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * .55;
      let index = 0;
      list.forEach((c, i) => { if (anchorOf(c.el).getBoundingClientRect().top <= line) index = i; });
      setActive(index);
      const footer = document.querySelector('.ft');
      setAway(!!footer && footer.getBoundingClientRect().top < window.innerHeight * .7);
    };
    const collect = () => {
      list = Array.from(document.querySelectorAll<HTMLElement>('main.tl [data-chapter]')).map(el => ({ label: el.dataset.chapter!, el }));
      setChapters(list);
      update();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    collect();
    const main = document.querySelector('main.tl');
    const grow = new ResizeObserver(collect);
    if (main) grow.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); grow.disconnect(); window.removeEventListener('scroll', schedule); };
  }, []);

  const go = (c: Chapter) => window.scrollTo({ top: anchorOf(c.el).getBoundingClientRect().top + window.scrollY + 2, behavior: 'smooth' });
  if (!chapters.length) return null;
  const current = chapters[active]?.label ?? '';
  return <nav className={`tl-rail ${away ? 'is-away' : ''}`} aria-label="Chapters">
    <ol>{chapters.map((c, i) => <li key={c.label}><button type="button" className={i === active ? 'is-on' : ''} aria-current={i === active ? 'step' : undefined} onClick={() => go(c)}><span className="sr-only">{c.label}</span></button></li>)}</ol>
    <span className="tl-rail-label" aria-hidden="true" key={current}>{current}</span>
  </nav>;
}
