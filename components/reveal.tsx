'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// The house reveal, sitewide: blocks below the fold fade and rise once as they
// arrive, on a timed ease rather than tied to the scroll position, so nothing
// drifts under a finger on a phone. Anything already on screen when the page
// loads is never touched, and nothing is hidden until this script has run, so
// text paints in the first frame. Styles live in reveal.css.
const TARGETS = [
  '[data-reveal]',
  '.source-section:not(:first-child)', '.source-directory section', '.source-work-grid li',
  '.guide-items li', '.guide-steps li',
  '.sx-head', '.sx-rows li', '.sx-steps li', '.sx-faqs details', '.sx-pills', '.sx-prose', '.sx-cta', '.sx .guide-table',
  '.archive-grid>div', '.credential-card',
  '.project-how-head', '.project-how-steps li', '.project-how-foot',
  '.rvp-top', '.rvp-rev', '.review-card',
  '.ft-cta', '.ft-cols>nav',
].join(',');

export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    // Rows that arrive together step in one after another.
    const io = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((e, i) => {
          const el = e.target as HTMLElement;
          io.unobserve(el);
          el.style.setProperty('--rv-d', `${Math.min(i, 5) * 70}ms`);
          el.dataset.rv = 'in';
        });
    }, { rootMargin: '0px 0px -6% 0px' });

    const scan = () => {
      const fold = window.innerHeight;
      document.querySelectorAll<HTMLElement>(TARGETS).forEach(el => {
        if (el.dataset.rv === 'in') return;
        // Still waiting from an earlier pass (a re-run of this effect): watch it again.
        if (el.dataset.rv === '') { io.observe(el); return; }
        if (el.querySelector(TARGETS)) return;
        // On screen (or above it) at load: leave it exactly as painted.
        if (el.getBoundingClientRect().top < fold) { el.dataset.rv = 'in'; return; }
        el.dataset.rv = '';
        io.observe(el);
      });
    };
    scan();

    // Content that mounts later (filtered grids, lazy sections) joins in.
    let timer = 0;
    const mo = new MutationObserver(() => { clearTimeout(timer); timer = window.setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
    // A fling or a jump can carry a block past the screen between two frames, so the
    // observer never sees it. A few times a second, anything already passed is shown.
    let sweep = 0;
    const passed = () => { sweep = 0; document.querySelectorAll<HTMLElement>('[data-rv=""]').forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) { io.unobserve(el); el.dataset.rv = 'in'; } }); };
    const onScroll = () => { if (!sweep) sweep = window.setTimeout(passed, 250); };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Never leave anything hidden in a printout.
    const print = () => document.querySelectorAll<HTMLElement>('[data-rv=""]').forEach(el => { el.dataset.rv = 'in'; });
    window.addEventListener('beforeprint', print);
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(timer); clearTimeout(sweep); window.removeEventListener('scroll', onScroll); window.removeEventListener('beforeprint', print); };
  }, [pathname]);
  return null;
}
