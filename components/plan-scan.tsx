'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Drives every site drawing (components/plan.tsx). Below the fold, the scan follows
// the scroll: the drawing builds into the site as it rises up the screen, and draws
// itself again if you scroll back. Anything already on screen, or marked
// data-plan="time", plays once by itself. No GSAP, so it runs on every page.
const smooth = (t: number) => t * t * (3 - 2 * t);
const glide = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function PlanScan() {
  const pathname = usePathname();
  useEffect(() => {
    const set = (el: HTMLElement, p: number) => {
      el.style.setProperty('--scan', p.toFixed(4));
      el.classList.toggle('is-scanning', p > .001 && p < .999);
      el.classList.toggle('is-done', p >= .999);
    };
    // A page holds a handful of drawings at most, so each scroll frame simply measures them all.
    const live: HTMLElement[] = [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight, from = vh * .92, to = vh * .32;
      live.forEach(el => {
        const box = el.getBoundingClientRect();
        if (!box.height || box.bottom < -vh || box.top > vh * 2) return;
        set(el, smooth(Math.min(1, Math.max(0, (from - box.top) / (from - to)))));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const play = (el: HTMLElement) => {
      const delay = Number(el.dataset.delay || 300), length = 2000;
      let start = 0;
      const step = (now: number) => {
        if (!start) start = now + delay;
        const p = Math.min(1, Math.max(0, (now - start) / length));
        set(el, glide(p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const timed = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      timed.unobserve(e.target);
      play(e.target as HTMLElement);
    }), { threshold: .4 });

    // Once a site is built, a lens under the pointer shows its drawing again (mouse only).
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const lenses: [HTMLElement, () => void][] = [];
    const lens = (el: HTMLElement) => {
      const host = el.parentElement;
      if (!fine || !host) return;
      const move = (e: PointerEvent) => {
        if (!el.classList.contains('is-done')) return;
        const box = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - box.left}px`);
        el.style.setProperty('--my', `${e.clientY - box.top}px`);
        el.classList.add('is-lens');
      };
      const leave = () => el.classList.remove('is-lens');
      host.addEventListener('pointermove', move);
      host.addEventListener('pointerleave', leave);
      lenses.push([el, () => { host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); }]);
    };
    const seen = new WeakSet<Element>();
    const scan = () => document.querySelectorAll<HTMLElement>('.plan').forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      lens(el);
      if (el.dataset.plan === 'lens') set(el, 1);
      else if (el.dataset.plan === 'time' || el.getBoundingClientRect().top < window.innerHeight * .8) timed.observe(el);
      else { set(el, 0); live.push(el); }
    });
    scan();
    schedule();
    let timer = 0;
    const mo = new MutationObserver(() => { clearTimeout(timer); timer = window.setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { lenses.forEach(([, off]) => off()); live.length = 0; timed.disconnect(); mo.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [pathname]);
  return null;
}
