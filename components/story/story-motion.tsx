'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

type Chapter = { label: string; el: HTMLElement; dark: boolean };
const anchorOf = (el: HTMLElement) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el) as HTMLElement;
const isDark = (el: HTMLElement) => {
  const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if (!m) return false;
  const [r, g, b, a = 1] = m.map(Number);
  return a > .5 && (.2126 * r + .7152 * g + .0722 * b) / 255 < .5;
};

// The homepage's connective tissue: headings rise out of a mask as each
// chapter arrives, and a rail
// on the left keeps track of where you are in the story.
export function StoryMotion() {
  const { reduced } = useMotion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [state, setState] = useState({ active: 0, away: false });
  const last = useRef('');

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
    return () => ctx.revert();
  }, [reduced]);

  // Chapter rail: the current chapter is the last one whose top has passed the middle of the
  // screen. Chapters are re-read whenever the page grows (the lab loads late). State only
  // changes when the chapter does, so scrolling never re-renders anything.
  useEffect(() => {
    let list: Chapter[] = [], frame = 0;
    const footer = document.querySelector<HTMLElement>('.ft');
    const update = () => {
      frame = 0;
      const line = window.innerHeight * .55;
      let active = 0;
      for (let i = 0; i < list.length; i++) { if (anchorOf(list[i].el).getBoundingClientRect().top <= line) active = i; else break; }
      const away = !!footer && footer.getBoundingClientRect().top < window.innerHeight * .7;
      const key = active + ':' + away;
      if (key !== last.current) { last.current = key; setState({ active, away }); }
    };
    const collect = () => {
      list = Array.from(document.querySelectorAll<HTMLElement>('main.tl [data-chapter]')).map(el => ({ label: el.dataset.chapter!, el, dark: isDark(el) }));
      last.current = '';
      setChapters(list);
      update();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    collect();
    const main = document.querySelector('main.tl');
    let timer = 0;
    const grow = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(collect, 200); });
    if (main) grow.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); grow.disconnect(); window.removeEventListener('scroll', schedule); };
  }, []);

  const go = (c: Chapter) => window.scrollTo({ top: anchorOf(c.el).getBoundingClientRect().top + window.scrollY + 2, behavior: 'smooth' });
  if (!chapters.length) return null;
  const current = chapters[state.active];
  return <nav className={`tl-rail ${state.away ? 'is-away' : ''} ${current?.dark ? 'is-dark' : ''}`} aria-label="Chapters">
    <ol>{chapters.map((c, i) => <li key={c.label}><button type="button" className={i === state.active ? 'is-on' : ''} aria-current={i === state.active ? 'step' : undefined} onClick={() => go(c)}><span className="sr-only">{c.label}</span></button></li>)}</ol>
    <span className="tl-rail-label" aria-hidden="true" key={current?.label}>{current?.label}</span>
  </nav>;
}
