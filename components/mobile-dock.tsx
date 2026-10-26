'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { phone } from '@/lib/content';

// Phones only: the two ways to start, within reach of a thumb. The dock rises once the
// first screen has scrolled by, and steps aside wherever the page already offers the same
// thing (the closing card, a guide's call to action, the footer), while a field is being
// typed in, and while the menu is open. Styles: app/finish.css (.m-dock).
const ASIDE = 'footer, .tl-close, .sx-cta';
const SKIP = ['/connect', '/schedule', '/studio'];

export function MobileDock() {
  const path = usePathname();
  const [past, setPast] = useState(false);
  const [aside, setAside] = useState(false);
  const skip = SKIP.some(p => path === p || path.startsWith(p + '/'));

  useEffect(() => {
    if (skip) return;
    let frame = 0;
    const read = () => { frame = 0; setPast(window.scrollY > window.innerHeight * .7); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    frame = requestAnimationFrame(read);
    window.addEventListener('scroll', onScroll, { passive: true });
    const seen = new Set<Element>();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setAside(seen.size > 0);
    });
    const watch = () => document.querySelectorAll(ASIDE).forEach(el => io.observe(el));
    watch();
    const late = window.setTimeout(watch, 1500);
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); io.disconnect(); clearTimeout(late); };
  }, [path, skip]);

  if (skip) return null;
  return <nav className={`m-dock ${past && !aside ? 'is-on' : ''}`} aria-label="Start a project">
    <a className="ft-btn" href={phone.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>WhatsApp<span className="sr-only"> (opens in a new tab)</span></a>
    <Link className="ft-btn is-solid" href="/connect">Start a project <ArrowUpRight size={17}/></Link>
  </nav>;
}
