'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMotion } from '@/components/site-motion';

// One delegated pointer engine for the whole site: a custom cursor with
// contextual labels, magnetic controls, spotlight surfaces, 3D tilt and
// direction-aware button fills. It only runs for fine pointers with motion on,
// writes CSS custom properties once per frame, and never touches layout.

const LABELS: [string, string][] = [
  ['[data-cursor]', ''],
  ['.work-art-link', 'View'],
  ['.project-card, .archive-list-row', 'Open'],
  ['.desk-cover, .writing-index-row, .margin-note, .insight-card', 'Read'],
  ['.type-lab canvas', 'Play'],
  ['.opening-object', 'Tilt'],
  ['input[type="range"], [role="slider"]', 'Drag'],
];
const INTERACTIVE = 'a, button, summary, label, select, [role="tab"], [role="button"]';
const MAGNETIC = '[data-magnetic], .header-contact, .menu-trigger, .journey-next, .cinema-arrows button, .review-controls button, .opening-availability, .opening-scroll > span, .footer-big-link > svg, .float-nav-cta, .back-to-top';
const FILL = '.button, .header-contact, .study-button, .float-nav-cta, .fx-bloom';
const TEXT = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';

export function PointerEffects() {
  const { reduced } = useMotion();
  const path = usePathname();
  const cursor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const node = cursor.current;
    if (reduced || !fine.matches || !node) return;
    const root = document.documentElement;
    const label = node.querySelector<HTMLElement>('.cursor-label')!;
    root.classList.add('has-cursor');

    let x = -100, y = -100, rx = -100, ry = -100, frame = 0, shown = false;
    let magnet: HTMLElement | null = null, spot: HTMLElement | null = null, tilt: HTMLElement | null = null, dots: HTMLElement | null = null;
    let pending: { target: Element | null; x: number; y: number } | null = null, toneTarget: Element | null = null;
    const tones = new WeakMap<Element, string>();
    // Reads the nearest opaque background once per element and caches it,
    // so the cursor stays visible on the forest-green chapters and footer.
    const toneOf = (el: Element) => {
      const cached = tones.get(el);
      if (cached) return cached;
      let tone = 'light';
      for (let node: Element | null = el; node; node = node.parentElement) {
        const background = getComputedStyle(node).backgroundColor;
        const srgb = background.startsWith('color(srgb');
        const match = background.startsWith('rgb') || srgb ? background.match(/[\d.]+/g) : null;
        if (!match) continue;
        const [r, g, b, a = 1] = match.map(Number), scale = srgb ? 1 : 255;
        if (a < .5) continue;
        tone = (.2126 * r + .7152 * g + .0722 * b) / scale < .45 ? 'dark' : 'light';
        break;
      }
      tones.set(el, tone);
      return tone;
    };

    const render = () => {
      frame = 0;
      if (pending) apply(pending.target, pending.x, pending.y);
      pending = null;
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      node.style.setProperty('--cx', `${x}px`); node.style.setProperty('--cy', `${y}px`);
      node.style.setProperty('--rx', `${rx}px`); node.style.setProperty('--ry', `${ry}px`);
      if (Math.abs(x - rx) > .1 || Math.abs(y - ry) > .1) frame = requestAnimationFrame(render);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };

    const release = (el: HTMLElement | null, props: string[]) => { if (el) props.forEach(p => el.style.removeProperty(p)); };

    function apply(target: Element | null, clientX: number, clientY: number) {
      // Cursor state
      let text = '', state = '';
      if (target?.closest(TEXT)) state = 'text';
      else {
        for (const [selector, value] of LABELS) {
          const match = target?.closest<HTMLElement>(selector);
          if (match) { text = match.dataset.cursor ?? value; break; }
        }
        state = text ? 'label' : target?.closest(INTERACTIVE) ? 'link' : '';
      }
      if (node!.dataset.state !== state) node!.dataset.state = state;
      if (target && target !== toneTarget) { toneTarget = target; const tone = toneOf(target); if (node!.dataset.tone !== tone) node!.dataset.tone = tone; }
      if (label.textContent !== text && text) label.textContent = text;

      // Magnetic pull, using the independent `translate` property so GSAP transforms are untouched.
      const nextMagnet = target?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (nextMagnet !== magnet) { release(magnet, ['--mag-x', '--mag-y']); magnet?.classList.remove('is-magnetic'); magnet = nextMagnet; magnet?.classList.add('is-magnetic'); }
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const strength = magnet.dataset.magnetic ? Number(magnet.dataset.magnetic) : .3;
        magnet.style.setProperty('--mag-x', `${(clientX - box.left - box.width / 2) * strength}px`);
        magnet.style.setProperty('--mag-y', `${(clientY - box.top - box.height / 2) * strength}px`);
      }

      // Spotlight surfaces follow the pointer with a soft radial light.
      const nextSpot = target?.closest<HTMLElement>('.fx-spot') ?? null;
      if (nextSpot !== spot) { spot = nextSpot; }
      if (spot) {
        const box = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${clientX - box.left}px`);
        spot.style.setProperty('--my', `${clientY - box.top}px`);
      }

      // Edge light: a lit arc on the card border turns to face the pointer.
      const edge = spot?.classList.contains('fx-edge') ? spot : null;
      if (edge) {
        const box = edge.getBoundingClientRect();
        edge.style.setProperty('--edge-angle', `${Math.atan2(clientY - box.top - box.height / 2, clientX - box.left - box.width / 2) * 180 / Math.PI + 90}deg`);
      }

      // Dot grids light up only around the pointer.
      const nextDots = target?.closest<HTMLElement>('.fx-dots') ?? null;
      if (nextDots !== dots) { dots?.classList.remove('is-lit'); dots = nextDots; dots?.classList.add('is-lit'); }
      if (dots) {
        const box = dots.getBoundingClientRect();
        dots.style.setProperty('--dx', `${clientX - box.left}px`);
        dots.style.setProperty('--dy', `${clientY - box.top}px`);
      }

      // Gentle 3D tilt for media frames.
      const nextTilt = target?.closest<HTMLElement>('[data-tilt]') ?? null;
      if (nextTilt !== tilt) { release(tilt, ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y']); tilt = nextTilt; }
      if (tilt) {
        const box = tilt.getBoundingClientRect();
        const px = (clientX - box.left) / box.width, py = (clientY - box.top) / box.height;
        tilt.style.setProperty('--tilt-x', `${((px - .5) * 7).toFixed(2)}deg`);
        tilt.style.setProperty('--tilt-y', `${((.5 - py) * 7).toFixed(2)}deg`);
        tilt.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
        tilt.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
      }
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX; y = event.clientY; pending = { target: event.target instanceof Element ? event.target : null, x, y };
      if (!shown) { shown = true; rx = x; ry = y; node.classList.add('is-visible'); }
      schedule();
    };
    // Direction-aware fills start where the pointer enters and leave where it exits.
    const edge = (event: PointerEvent, entering: boolean) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(FILL) : null;
      if (!target) return;
      const related = event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (related && target.contains(related)) return;
      const box = target.getBoundingClientRect();
      target.style.setProperty('--fill-x', `${event.clientX - box.left}px`);
      target.style.setProperty('--fill-y', `${event.clientY - box.top}px`);
      target.classList.toggle('is-filled', entering);
    };
    const over = (event: PointerEvent) => edge(event, true);
    const out = (event: PointerEvent) => edge(event, false);
    // Content moves under a still pointer while scrolling; re-read what is beneath it.
    const scroll = () => { if (!shown) return; pending = { target: document.elementFromPoint(x, y), x, y }; schedule(); };
    const down = () => node.classList.add('is-pressed');
    const up = () => node.classList.remove('is-pressed');
    const hide = () => { shown = false; node.classList.remove('is-visible'); };

    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    document.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('pointerup', up, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
      document.removeEventListener('pointerdown', down);
      window.removeEventListener('scroll', scroll);
      document.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', hide);
      release(magnet, ['--mag-x', '--mag-y']); magnet?.classList.remove('is-magnetic');
      release(tilt, ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y']);
      dots?.classList.remove('is-lit');
      root.classList.remove('has-cursor');
      node.classList.remove('is-visible');
    };
  }, [reduced, path]);

  return <div className="cursor" ref={cursor} aria-hidden="true"><span className="cursor-ring"><span className="cursor-label"/></span><span className="cursor-dot"/></div>;
}
