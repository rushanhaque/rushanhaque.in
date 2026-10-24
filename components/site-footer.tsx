'use client';
import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { bookingUrl, email, phone, socials } from '@/lib/content';

const columns = [
  { title: 'Explore', links: [['Home', '/'], ['Works', '/projects'], ['About', '/about'], ['Certificates', '/certifications'], ['Reviews', '/reviews'], ['Connect', '/connect']] },
  { title: 'Websites', links: [['Website design', '/website-designer-in-moradabad'], ['E-commerce websites', '/ecommerce-website-development'], ['Websites for exporters', '/website-for-exporters-moradabad'], ['SEO & AI search', '/seo-services']] },
];
// A short footer: one invitation, three small lists, and a single closing line.
export function SiteFooter() {
  // The signature is drawn in outline, then inked in, the first time it comes into view.
  const mark = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = mark.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-drawn'); io.disconnect(); } }, { threshold: .35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <footer className="ft">
    <div className="ft-inner container">
      <section className="ft-cta" aria-labelledby="ft-title">
        <h2 suppressHydrationWarning id="ft-title">Got something <em>worth building?</em></h2>
        <div className="ft-actions">
          <Link href="/connect" className="ft-btn is-solid">Start a project <ArrowUpRight size={17}/></Link>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="ft-btn">Book a call <ArrowUpRight size={17}/></a>
        </div>
        <p className="ft-mail"><a href={`mailto:${email}?subject=Hello%20from%20your%20site`}>{email}</a><a href={phone.whatsapp} target="_blank" rel="noopener noreferrer">{phone.label}</a></p>
      </section>
      <div className="ft-cols">
        {columns.map(c => <nav key={c.title} aria-label={c.title}>
          <span>{c.title}</span>
          {c.links.map(([label, url]) => <Link key={url} href={url}>{label}</Link>)}
        </nav>)}
        <nav aria-label="Connect">
          <span>Connect</span>
          {socials.map(s => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>)}
        </nav>
      </div>
    </div>
    <div className="ft-base container">
      <p className="ft-legal">© {new Date().getFullYear()} Rushan Haque · Designed and built by hand</p>
      <a href="#top" className="ft-top">Back to top <ArrowUpRight size={14}/></a>
    </div>
    {/* The signature: the name set across the full width, cut by the page's edge. */}
    <svg className="ft-mark" ref={mark} viewBox="0 0 1000 118" aria-hidden="true" focusable="false">
      <defs><linearGradient id="ft-mark-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f1e6" stopOpacity=".95"/><stop offset="1" stopColor="#f3f1e6" stopOpacity=".12"/></linearGradient></defs>
      <text x="0" y="150" textLength="1000" lengthAdjust="spacing" fill="url(#ft-mark-ink)">Rushan Haque</text>
    </svg>
  </footer>;
}
