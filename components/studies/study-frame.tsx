'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

// Returns `value`, updated at most once per `ms` (with a trailing update), so a
// continuously changing readout does not flood a screen reader.
export function useThrottled<T>(value: T, ms = 900) {
  const [out, setOut] = useState(value);
  const last = useRef(0);
  useEffect(() => {
    const wait = Math.max(0, ms - (Date.now() - last.current));
    const timer = window.setTimeout(() => { last.current = Date.now(); setOut(value); }, wait);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return out;
}

// True once the element has come near the viewport (for lazy work).
export function useNearViewport<T extends Element>(margin = '300px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);
  return [ref, near] as const;
}

// The lab-study frame shared by every study: numbered label, crosshair corner
// marks, a live readout and a caption. `announce` is the throttled text read to
// assistive technology; the visible readout can change every frame.
export function StudyFrame({ id, number, name, title, truth, readout, announce, caption, children, className = '', controls }: {
  id: string; number: string; name: string; title: ReactNode; truth: string; readout: ReactNode; announce?: string; caption?: ReactNode; children: ReactNode; className?: string; controls?: ReactNode;
}) {
  const spoken = useThrottled(announce ?? '', 1200);
  return <section id={id} className={`study ${className}`} aria-labelledby={`${id}-title`}>
    <header className="study-head">
      <span className="study-label">STUDY {number} — {name}</span>
      <h2 id={`${id}-title`}>{title}</h2>
      <p className="study-truth"><span>WHAT IT PROVES</span>{truth}</p>
    </header>
    {controls && <div className="study-controls">{controls}</div>}
    <div className="study-stage">
      <i className="study-corner is-tl" aria-hidden="true"/><i className="study-corner is-tr" aria-hidden="true"/><i className="study-corner is-bl" aria-hidden="true"/><i className="study-corner is-br" aria-hidden="true"/>
      {children}
    </div>
    <div className="study-readout" aria-hidden="true"><span className="study-dot"/>{readout}</div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{spoken}</p>
    {caption && <div className="study-caption">{caption}</div>}
  </section>;
}
