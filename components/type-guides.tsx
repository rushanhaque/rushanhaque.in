'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// The page title set on a type specimen, like the name on the homepage: cap height,
// x-height, baseline and descender lines measured from the title's own fonts, line by
// line, drawn in once the title has landed. The lines live in their own layer on the
// body, outside React's tree, and are re-measured when the layout changes.
const TITLES = '.ab-hero h1, .wk-intro h1, .pd-head h1, .page-intro h1';
const KINDS: [string, (m: (ch: string) => TextMetrics, base: number) => number][] = [
  ['Cap height', (m, b) => b - m('H').actualBoundingBoxAscent],
  ['x-height', (m, b) => b - m('x').actualBoundingBoxAscent],
  ['Baseline', (_, b) => b],
  ['Descender', (m, b) => b + m('p').actualBoundingBoxDescent],
];

export function TypeGuides() {
  const pathname = usePathname();
  useEffect(() => {
    const title = document.querySelector<HTMLElement>(TITLES);
    if (!title) return;
    const layer = document.createElement('div');
    layer.className = 'type-guides';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const ctx = document.createElement('canvas').getContext('2d')!;

    const measure = () => {
      // Every line of the title, in the font of its first word (a line can mix two).
      const lines: { top: number; bottom: number; font: string }[] = [];
      const walk = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      while (walk.nextNode()) {
        const node = walk.currentNode as Text;
        if (!node.data.trim()) continue;
        const style = getComputedStyle(node.parentElement!);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of Array.from(range.getClientRects())) {
          if (!r.width) continue;
          const mid = (r.top + r.bottom) / 2;
          if (!lines.some(l => mid > l.top - window.scrollY && mid < l.bottom - window.scrollY)) lines.push({ top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, font });
        }
      }
      lines.sort((x, y) => x.top - y.top);
      const narrow = window.innerWidth < 900;
      const placed: { y: number; name: string }[] = [];
      lines.forEach(({ top, font }, n) => {
        ctx.font = font;
        const m = (ch: string) => ctx.measureText(ch);
        // A text box's top sits the font's ascent above its baseline.
        const base = top + m('H').fontBoundingBoxAscent;
        KINDS.forEach(([name, at], k) => {
          if (narrow && k !== 0 && k !== 2) return;
          const y = Math.round(at(m, base));
          // Lines that would crowd one already drawn (a descender meeting the next cap) are left out.
          if (!placed.some(p => Math.abs(p.y - y) < 12)) placed.push({ y, name: n === 0 ? name : '' });
        });
      });
      // Same set of lines as before: just move them, so a late re-measure never restarts the drawing.
      if (layer.children.length === placed.length) { placed.forEach((p, k) => { (layer.children[k] as HTMLElement).style.top = `${p.y}px`; }); return; }
      layer.innerHTML = placed.map((p, k) => `<i class="tl-guide" style="top:${p.y}px;--i:${k}">${p.name ? `<span>${p.name}</span>` : ''}</i>`).join('');
    };

    let timer = 0;
    const later = () => { clearTimeout(timer); timer = window.setTimeout(measure, 150); };
    measure();
    // Titles rise in and fonts settle: measure again once they have.
    const settle = [900, 2200, 3600].map(ms => window.setTimeout(measure, ms));
    title.addEventListener('animationend', later);
    title.addEventListener('transitionend', later);
    document.fonts?.ready.then(later);
    const ro = new ResizeObserver(later);
    ro.observe(title); ro.observe(document.body);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { window.setTimeout(() => layer.classList.add('is-drawn'), 350); io.disconnect(); } });
    io.observe(title);
    return () => { title.removeEventListener('animationend', later); title.removeEventListener('transitionend', later); clearTimeout(timer); settle.forEach(clearTimeout); ro.disconnect(); io.disconnect(); layer.remove(); };
  }, [pathname]);
  return null;
}
