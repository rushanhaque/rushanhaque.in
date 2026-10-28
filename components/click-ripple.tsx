'use client';
import { useEffect } from 'react';

// Every press on a link or button leaves a mark where it landed: a fine ring opens out
// from the exact point and fades, with a soft dot at its centre. It takes the element's own
// colour (white on the green, green or wine on white), so it never brings a new colour in.
// Styles: app/finish.css (.ck-ring).
const TARGET = 'a, button, [role="button"], summary, label, input[type="submit"]';

export function ClickRipple() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(TARGET);
      if (!el || el.closest('.ft-mark, [data-no-ripple]')) return;
      const s = getComputedStyle(el);
      // Pill buttons draw their label as a text shadow over transparent text; their ink is --b-ink.
      let colour = s.color;
      if (/rgba?\([^)]*,\s*0\)|transparent/.test(colour)) colour = s.getPropertyValue('--b-ink').trim() || '#07241a';
      const ring = document.createElement('span');
      ring.className = 'ck-ring';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${colour}`;
      document.body.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
      window.setTimeout(() => ring.remove(), 1200);
    };
    document.addEventListener('pointerdown', down, { passive: true });
    return () => document.removeEventListener('pointerdown', down);
  }, []);
  return null;
}
