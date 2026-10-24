'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// The house reveal, sitewide: blocks below the fold fade and rise once as they
// arrive, on a timed ease rather than tied to the scroll position, so nothing
// drifts under a finger on a phone. Anything already on screen when the page
// loads is never touched, and nothing is hidden until this script has run, so
// text paints in the first frame. Styles live in reveal.css and premium.css.
//
// The same pass gives the site its smaller motions: split headings rise word by
// word, labels decode like a departure board, numbers count up and cards glow
// under the cursor. None of it needs GSAP.
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
// Split headings inside a block above play with that block (premium.css).
const SPLITS = '[data-split=""]';
const LABELS = ['.eyebrow', '.tl-kicker', '.wb-kicker', '.lab-kicker', '.sx-label-name', '.cn-kicker', '.sx-cta-label'].join(',');
const COUNTS = '[data-count]';
// Footer links decode on hover only (they sit in their own rows, so nothing shifts).
const HOVER = '.ft-cols a';
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const finals = new WeakMap<Text, string>();

const textsOf = (el: Element) => {
  const out: Text[] = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) { const t = walk.currentNode as Text; if (t.data.trim()) out.push(t); }
  return out;
};

// Letters cycle through random glyphs, then settle from left to right. The label
// keeps its height while it runs, so nothing below it moves.
function decode(el: HTMLElement, ms = 950) {
  if (el.dataset.dec === 'run') return;
  const nodes = textsOf(el);
  nodes.forEach(t => { if (finals.get(t) !== t.data) finals.set(t, t.data); });
  const words = nodes.map(t => finals.get(t)!);
  // Only Latin labels: random capitals over Devanagari would read as noise.
  if (!words.length || words.some(w => /[^\x20-\x7E·—–’&]/.test(w))) return;
  const total = words.reduce((n, w) => n + w.length, 0);
  el.dataset.dec = 'run';
  // Random glyphs run wider than the label and could wrap it onto a new line: hold its height exactly.
  const height = `${el.offsetHeight}px`;
  el.style.minHeight = height; el.style.maxHeight = height; el.style.overflow = 'hidden';
  const start = performance.now();
  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / ms);
    let at = 0;
    nodes.forEach((t, k) => {
      let out = '';
      for (const ch of words[k]) {
        const settled = p >= .3 + .7 * (at++ / total);
        const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        out += settled || !/[A-Za-z0-9]/.test(ch) ? ch : ch === ch.toLowerCase() && /[a-z]/.test(ch) ? g.toLowerCase() : g;
      }
      t.data = out;
    });
    if (p < 1) return requestAnimationFrame(frame);
    nodes.forEach((t, k) => { t.data = words[k]; });
    el.style.minHeight = ''; el.style.maxHeight = ''; el.style.overflow = '';
    el.dataset.dec = 'done';
  };
  requestAnimationFrame(frame);
}

// Counts up to the number the page already shows, keeping its leading zero and decimals.
function countUp(el: HTMLElement, ms = 1600) {
  const t = textsOf(el)[0];
  const m = t?.data.match(/^(\D*)(\d+(?:\.\d+)?)([^]*)$/);
  if (!t || !m) return;
  const [, pre, num, post] = m, end = parseFloat(num), dec = (num.split('.')[1] ?? '').length, width = num.length;
  const start = performance.now();
  const frame = (now: number) => {
    const p = Math.min(1, (now - start) / ms), v = end * (1 - Math.pow(2, -10 * p));
    t.data = pre + (p < 1 ? v : end).toFixed(dec).padStart(width, '0') + post;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}


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

    // Labels and numbers play once each, the moment they are on screen.
    const seen = new WeakSet<Element>();
    const once = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      once.unobserve(el);
      if (el.matches(COUNTS)) countUp(el); else decode(el);
    }), { rootMargin: '0px 0px -8% 0px' });

    const scan = () => {
      const fold = window.innerHeight;
      document.querySelectorAll<HTMLElement>(`${LABELS},${COUNTS}`).forEach(el => {
        if (seen.has(el)) return;
        seen.add(el);
        once.observe(el);
      });
      document.querySelectorAll<HTMLElement>(SPLITS).forEach(el => {
        if (el.dataset.rv !== undefined || el.closest(TARGETS)) return;
        if (el.getBoundingClientRect().top < fold) { el.dataset.rv = 'in'; return; }
        el.dataset.rv = '';
        io.observe(el);
      });
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
    // On a desktop, hovering a label decodes it again.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hover = (e: PointerEvent) => { const el = (e.target as Element).closest?.<HTMLElement>(`${LABELS},${HOVER}`); if (el) decode(el, 700); };
    if (fine) document.addEventListener('pointerover', hover);
    return () => { io.disconnect(); once.disconnect(); mo.disconnect(); document.removeEventListener('pointerover', hover); clearTimeout(timer); clearTimeout(sweep); window.removeEventListener('scroll', onScroll); window.removeEventListener('beforeprint', print); };
  }, [pathname]);

  // Cards marked .spot carry a soft glow under the cursor. One listener for the page, one write per frame.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0, last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const e = last!, spot = (e.target as Element).closest?.<HTMLElement>('.spot');
      if (!spot) return;
      const r = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${e.clientX - r.left}px`); spot.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const move = (e: PointerEvent) => { last = e; if (!frame) frame = requestAnimationFrame(apply); };
    document.addEventListener('pointermove', move, { passive: true });
    return () => { cancelAnimationFrame(frame); document.removeEventListener('pointermove', move); };
  }, []);
  return null;
}
