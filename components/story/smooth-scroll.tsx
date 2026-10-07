'use client';
import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';

// Inertial wheel scrolling for the homepage story. The page keeps its native
// scroll position (keyboard, scrollbar, touch and anchors still work); only
// mouse-wheel input is eased, so pinned scenes glide instead of stepping.
export function SmoothScroll() {
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    let target = window.scrollY, current = window.scrollY, frame = 0, driving = false;
    const max = () => root.scrollHeight - window.innerHeight;
    const tick = () => {
      // Quick to respond, still eased: a slower follow reads as lag.
      current += (target - current) * .16;
      if (Math.abs(target - current) < .4) current = target;
      driving = true;
      window.scrollTo(0, current);
      frame = current !== target ? requestAnimationFrame(tick) : 0;
      if (!frame) driving = false;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented || document.body.style.overflow === 'hidden') return;
      const el = event.target instanceof Element ? event.target : null;
      if (el?.closest('[data-native-scroll], [role="dialog"], textarea, select')) return;
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 36 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
      target = Math.max(0, Math.min(max(), target + delta));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Any scroll we did not drive (keys, scrollbar, anchors) becomes the new origin.
    const sync = () => { if (!driving) { target = current = window.scrollY; } };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('scroll', sync, { passive: true });
    ScrollTrigger.refresh();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('wheel', wheel); window.removeEventListener('scroll', sync); root.style.scrollBehavior = previous; };
  }, [reduced]);
  return null;
}
