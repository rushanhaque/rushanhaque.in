'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { CoverImage } from '@/components/cover-image';
import { useMotion } from '@/components/site-motion';

export type PreviewItem = { href: string; label: string; title: string; line: string; kicker: string; glyph: string; word: string; tone: string; ink: string; cursor?: string; external?: boolean; image?: string; imageBlurred?: boolean };

// An index of rows. Hovering a row sweeps it in the item's colour, rolls the
// title into italic, and brings up a preview card that trails the pointer.
export function PreviewList({ id, className = '', scene, heading, items }: { id?: string; className?: string; scene?: string; heading: ReactNode; items: PreviewItem[] }) {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const { reduced } = useMotion();

  // The card trails the pointer and leans into its horizontal velocity.
  useEffect(() => {
    const section = root.current, card = preview.current;
    if (!section || !card || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, frame = 0, started = false;
    const tick = () => {
      const dx = x - cx;
      cx += dx * .14; cy += (y - cy) * .14;
      card.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${Math.max(-12, Math.min(12, dx * .06))}deg)`;
      frame = Math.abs(dx) > .2 || Math.abs(y - cy) > .2 ? requestAnimationFrame(tick) : 0;
    };
    const move = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      x = Math.max(0, Math.min(event.clientX - box.left, box.width - 340)); y = Math.max(160, Math.min(event.clientY - box.top, box.height - 160));
      if (!started) { cx = x; cy = y; started = true; }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    section.addEventListener('pointermove', move, { passive: true });
    return () => { cancelAnimationFrame(frame); section.removeEventListener('pointermove', move); };
  }, [reduced]);

  return <section id={id} className={`preview-list ${className}`} data-scene={scene} ref={root} onPointerLeave={() => setActive(null)}>
    {heading}
    <ol className="pl-list">{items.map((item, i) => <li key={item.href + item.title}>
      <Link href={item.href} {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`pl-row ${item.image?'has-cover':''} ${active === i ? 'is-active' : ''}`} data-cursor={item.cursor ?? 'Open'} onPointerEnter={() => setActive(i)} onFocus={() => setActive(null)} onBlur={() => setActive(null)} style={{ '--tone': item.tone, '--ink': item.ink } as React.CSSProperties}>
        <span className="pl-row-number">{item.label}</span>
        <CoverImage src={item.image} title={item.title} blurred={item.imageBlurred}/><span className="pl-row-title"><span>{item.title}</span><em aria-hidden="true">{item.title}</em></span>
        <span className="pl-row-line">{item.line}</span>
        <span className="pl-row-arrow"><ArrowUpRight size={20}/></span>
      </Link>
    </li>)}</ol>
    <div className={`pl-preview ${active !== null ? 'is-visible' : ''}`} ref={preview} aria-hidden="true">{items.map((item, i) => <div key={item.href + item.title} className={`pl-preview-card ${active === i ? 'is-active' : ''}`} style={{ '--tone': item.tone, '--ink': item.ink } as React.CSSProperties}>
      <span>{item.kicker}</span>{item.image?<CoverImage src={item.image} title={item.title} blurred={item.imageBlurred}/>:<strong>{item.glyph}</strong>}<em>{item.word}</em>
    </div>)}</div>
  </section>;
}
