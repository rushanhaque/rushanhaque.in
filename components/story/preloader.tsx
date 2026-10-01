'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const READY_EVENT = 'tl:ready';
const KEY = 'tl-intro-seen';

// Decides before first paint whether to show the intro (once per session, motion on).
export const preloadScript = `try{if(document.documentElement.dataset.motion!=='reduce'&&!sessionStorage.getItem('${KEY}'))document.documentElement.classList.add('tl-preload')}catch(e){}`;

// A short counted intro: the count climbs, the name rises, and the screen
// splits open onto the hero. Skipped on return visits and for reduced motion.
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const html = document.documentElement;
    const done = () => { html.classList.remove('tl-preload'); try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ } (window as Window & { __tlReady?: boolean }).__tlReady = true; window.dispatchEvent(new Event(READY_EVENT)); };
    const el = root.current;
    if (!el || !html.classList.contains('tl-preload')) { done(); return; }
    const count = el.querySelector<HTMLElement>('.tl-loader-count')!;
    const value = { n: 0 };
    const tl = gsap.timeline({ onComplete: done });
    tl.from(el.querySelectorAll('.tl-loader-name span'), { yPercent: 110, duration: .9, stagger: .04, ease: 'expo.out' }, 0)
      .to(value, { n: 100, duration: 1.5, ease: 'power3.inOut', onUpdate: () => { count.textContent = String(Math.round(value.n)).padStart(3, '0'); } }, 0)
      .to(el.querySelector('.tl-loader-bar i'), { scaleX: 1, duration: 1.5, ease: 'power3.inOut' }, 0)
      .to(el.querySelectorAll('.tl-loader-name span'), { yPercent: -110, duration: .6, stagger: .02, ease: 'expo.in' }, 1.55)
      .to(el.querySelector('.tl-loader-top'), { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 1.9)
      .to(el.querySelector('.tl-loader-bottom'), { yPercent: 100, duration: 1, ease: 'expo.inOut' }, 1.9)
      .add(() => window.dispatchEvent(new Event(READY_EVENT)), 2.15);
    return () => { tl.kill(); };
  }, []);
  return <div className="tl-loader" ref={root} aria-hidden="true">
    <div className="tl-loader-top"/><div className="tl-loader-bottom"/>
    <div className="tl-loader-inner">
      <span className="tl-loader-name">{'Rushan Haque'.split('').map((c, i) => <span key={i}>{c === ' ' ? ' ' : c}</span>)}</span>
      <div className="tl-loader-foot"><span>DEVELOPER &amp; WRITER — MORADABAD</span><span className="tl-loader-count">000</span></div>
      <div className="tl-loader-bar"><i/></div>
    </div>
  </div>;
}

// Runs the callback once the intro has finished (or immediately if there is none).
export function onStoryReady(callback: () => void) {
  if ((window as Window & { __tlReady?: boolean }).__tlReady || !document.documentElement.classList.contains('tl-preload')) { callback(); return () => {}; }
  window.addEventListener(READY_EVENT, callback, { once: true });
  return () => window.removeEventListener(READY_EVENT, callback);
}
