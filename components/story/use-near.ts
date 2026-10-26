'use client';
import { useEffect, useState, type RefObject } from 'react';

// True once the element is within `screens` screen-heights of the viewport, and true from
// then on. Sections far down the page wait for it before they measure, split their titles
// and build their scroll scenes, so none of that work lands on the page load.
export function useNear(ref: RefObject<Element | null>, screens = 1.5) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: `${screens * 100}% 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, screens, near]);
  return near;
}
