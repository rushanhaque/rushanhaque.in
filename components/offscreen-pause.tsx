'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Looping decoration (a pen plotting, map arcs, orbiting lines, live dots) pauses while
// its section is off screen and picks up where it left off on return, so the page only
// ever animates what can be seen. Styles: app/finish.css ([data-offscreen]).
export function OffscreenPause() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(entries => entries.forEach(e => (e.target as HTMLElement).toggleAttribute('data-offscreen', !e.isIntersecting)), { rootMargin: '15% 0px' });
    const seen = new WeakSet<Element>();
    const watch = () => document.querySelectorAll('main section, main > header, footer.ft').forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
    watch();
    // Sections that mount later (the lab, the map) join in.
    let timer = 0;
    const mo = new MutationObserver(() => { clearTimeout(timer); timer = window.setTimeout(watch, 300); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(timer); };
  }, [pathname]);
  return null;
}
