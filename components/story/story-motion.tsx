'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

type Chapter = { label: string; el: HTMLElement; dark: boolean };
const anchorOf = (el: HTMLElement) => (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el) as HTMLElement;
const isDark = (el: HTMLElement) => {
  const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if (!m) return false;
  const [r, g, b, a = 1] = m.map(Number);
  return a > .5 && (.2126 * r + .7152 * g + .0722 * b) / 255 < .5;
};

// The homepage's connective tissue: headings are set line by line as each
// chapter arrives (its label decodes itself, see components/reveal.tsx), and a rail
// on the left keeps track of where you are in the story.
export function StoryMotion() {
  const { reduced } = useMotion();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [state, setState] = useState({ active: 0, away: false });
  const last = useRef('');

  useEffect(() => {
    if (reduced) return;
    let near: IntersectionObserver | null = null;
    // Each heading is set line by line: every line rises out of its own mask and
    // un-tilts, like type being set. Once it lands the split is undone, so the
    // one-line heading fit and any later resize see plain text again.
    // Section leads follow a beat later, rising out of a soft blur on desktops.
    const ctx = gsap.context(() => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      // Each heading is split only as it comes within half a screen, so the page's first
      // moments are not spent measuring headings far below.
      const set = (h: HTMLElement) => ctx.add(() => {
        const split = SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'tl-line' });
        gsap.from(split.lines, { yPercent: 118, rotate: 3.5, transformOrigin: '0% 100%', duration: 1.45, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 90%', once: true }, onComplete: () => { split.revert(); (window as Window & { __fitHeadings?: () => void }).__fitHeadings?.(); } });
      });
      const heads = gsap.utils.toArray<HTMLElement>('.tl h2').filter(h => h.getBoundingClientRect().top >= window.innerHeight * .9 && !h.closest('.tl-close'));
      near = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; near?.unobserve(e.target); set(e.target as HTMLElement); }), { rootMargin: '0px 0px 60% 0px' });
      heads.forEach(h => near!.observe(h));
      const leads = gsap.utils.toArray<HTMLElement>('.tl-sw-head p, .tl-process-head p, .tl-wall-intro, .tl-writing-head p, .tl-build-head p, .tl-voices-actions, .tl-process-foot, .tl-sw-foot').filter(el => el.getBoundingClientRect().top >= window.innerHeight);
      gsap.set(leads, fine ? { opacity: 0, y: 44, filter: 'blur(8px)' } : { opacity: 0, y: 36 });
      ScrollTrigger.batch(leads, { start: 'top 90%', once: true, onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, ...(fine ? { filter: 'blur(0px)' } : {}), duration: 1.25, delay: .15, stagger: .1, ease: 'expo.out', clearProps: 'filter,transform,opacity' }) });
    });
    return () => { near?.disconnect(); ctx.revert(); };
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
