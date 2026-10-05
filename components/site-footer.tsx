'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useMotion } from '@/components/site-motion';
import { address, bookingUrl, email, phone, socials } from '@/lib/content';

const columns = [
  { title: 'Explore', links: [['Home', '/'], ['Works', '/projects'], ['Certificates', '/certifications'], ['Reviews', '/reviews'], ['Connect', '/connect']] },
];
const NAME = 'Rushan Haque';

// The closing scene: one invitation, the map of the site, and the name set
// across the full width. Its letters thicken where the pointer passes.
export function SiteFooter() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = word.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: .25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The name is sized to fill the footer's width exactly, at any screen size.
  useEffect(() => {
    const el = word.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = '100px';
      const natural = Array.from(el.children).reduce((w, c) => w + (c as HTMLElement).offsetWidth, 0) + 22 * (el.children.length - 1);
      const avail = el.clientWidth;
      if (natural > 0) el.style.fontSize = `${Math.floor(100 * avail / natural * .985)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  // Pointer: a soft light across the footer and a weight swell in the name.
  useEffect(() => {
    const footer = root.current, wrap = word.current;
    if (!footer || !wrap || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const letters = Array.from(wrap.querySelectorAll<HTMLElement>('.ft-l'));
    let frame = 0, px = -1e4, py = -1e4;
    const paint = () => {
      frame = 0;
      const box = footer.getBoundingClientRect();
      footer.style.setProperty('--gx', `${px - box.left}px`);
      footer.style.setProperty('--gy', `${py - box.top}px`);
      for (const l of letters) {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), (py - (r.top + r.height / 2)) * .6);
        const k = Math.max(0, 1 - d / 420);
        l.style.fontWeight = String(Math.round(380 + 420 * k * k));
      }
    };
    const move = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!frame) frame = requestAnimationFrame(paint); };
    const leave = () => { px = py = -1e4; if (!frame) frame = requestAnimationFrame(paint); };
    footer.addEventListener('pointermove', move, { passive: true });
    footer.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(frame); footer.removeEventListener('pointermove', move); footer.removeEventListener('pointerleave', leave); letters.forEach(l => { l.style.fontWeight = ''; }); };
  }, [reduced]);


  return <footer className="ft" ref={root}>
    <div className="ft-inner container">
      <section className="ft-cta" aria-labelledby="ft-title">
        <h2 suppressHydrationWarning id="ft-title">Got something <em>worth building?</em></h2>
        <p>Send the brief, or just the problem. I answer everything myself, usually within a day.</p>
        <div className="ft-actions">
          <Link href="/connect" className="ft-btn is-solid">Start a project <ArrowUpRight size={17}/></Link>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ft-btn">Book a call <ArrowUpRight size={17}/></a>
        </div>
        <dl className="ft-details">
          <div><dt>Email</dt><dd><a href={`mailto:${email}?subject=Hello%20from%20your%20site`}>{email}</a></dd></div>
          <div><dt>WhatsApp</dt><dd><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{phone.label}</a></dd></div>
          <div><dt>Studio</dt><dd><a href={address.map} target="_blank" rel="noopener noreferrer">{address.label}</a></dd></div>
        </dl>
      </section>
      <div className="ft-cols">
        {columns.map(c => <nav key={c.title} aria-label={c.title}>
          <span>{c.title}</span>
          {c.links.map(([label, url]) => <Link key={url} href={url}>{label}<ArrowUpRight size={14}/></Link>)}
        </nav>)}
        <nav aria-label="Connect">
          <span>Connect</span>
          {socials.map(s => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}<ArrowUpRight size={14}/></a>)}
        </nav>
      </div>
    </div>
    <div className={`ft-word container ${inView || reduced ? 'is-in' : ''}`} ref={word} aria-hidden="true">
      {NAME.split(' ').map((part, w, all) => { const offset = all.slice(0, w).join('').length; return <span key={w} className="ft-w">{part.split('').map((ch, i) => <span key={i} className="ft-l" style={{ '--i': offset + i } as React.CSSProperties}>{ch}</span>)}</span>; })}
    </div>
  </footer>;
}
