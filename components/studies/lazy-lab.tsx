'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// The Lab carries the heaviest code and data on the page (screenshots, code
// excerpts, two years of contributions), so it loads only as you approach it.
const LabSection = dynamic(() => import('@/components/studies/lab-section').then(m => m.LabSection), { ssr: false });

export function LazyLab() {
  const anchor = useRef<HTMLElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    // A link straight to the Lab starts loading at once (the observer fires immediately).
    const margin = location.hash === '#lab' || location.hash.startsWith('#study-') ? '100000px 0px' : '1600px 0px';
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return show ? <LabSection/> : <section ref={anchor} id="lab" className="lab lab-pending" aria-label="The lab"/>;
}
