'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { bookingUrl, email, socials } from '@/lib/content';

const nav = [['Works', '/projects'], ['Certificates', '/certifications'], ['Reviews', '/reviews']] as const;
const groups = [
  { title: 'Explore', links: [['Home', '/'], ['Works', '/projects'], ['Certificates', '/certifications'], ['Reviews', '/reviews'], ['Connect', '/connect']] },
] as const;

// Reads the colour of whatever sits under a point, skipping the header itself,
// so the glass can turn dark over the green chapters and light over cream.
const tones = new WeakMap<Element, 'light' | 'dark'>();
function toneAt(x: number, y: number, header: HTMLElement): 'light' | 'dark' {
  const stack = document.elementsFromPoint(x, y);
  for (const start of stack) {
    if (header.contains(start)) continue;
    for (let el: Element | null = start; el; el = el.parentElement) {
      const cached = tones.get(el);
      if (cached) return cached;
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg.match(/[\d.]+/g);
      if (!m) continue;
      const [r, g, b, a = 1] = m.map(Number);
      if (a < .5) continue;
      const tone = (.2126 * r + .7152 * g + .0722 * b) / 255 < .5 ? 'dark' : 'light';
      tones.set(el, tone);
      return tone;
    }
  }
  return 'light';
}

export function SiteHeader({ workCount }: { workCount: number }) {
  const path = usePathname() ?? '/';
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<'light' | 'dark'>('light');
  const [hover, setHover] = useState<number | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  // Scroll: condense, sample the tone underneath, track the homepage section, fill the progress line.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY, header = root.current, b = bar.current;
      setScrolled(y > 24);
      if (header && b) {
        const r = b.getBoundingClientRect();
        setTone(toneAt(r.left + r.width / 2, r.top + r.height / 2, header));
        const max = document.documentElement.scrollHeight - window.innerHeight;
        b.style.setProperty('--progress', String(max > 0 ? Math.min(1, y / max) : 0));
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    const settle = window.setTimeout(update, 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); clearTimeout(settle); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [path]);

  // Refraction is a Chromium-only backdrop filter; other browsers keep the frosted glass.
  useEffect(() => {
    const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
    if (brands?.some(b => /Chromium/.test(b.brand))) document.documentElement.classList.add('gh-liquid');
  }, []);

  const activeIndex = nav.findIndex(([, url]) => path.startsWith(url));
  const shown = hover ?? (activeIndex >= 0 ? activeIndex : null);

  // The liquid pill slides to the hovered link, or rests under the current one.
  const place = useCallback(() => {
    const links = navRef.current?.querySelectorAll<HTMLElement>('a');
    if (shown === null || !links?.[shown]) { setPill(null); return; }
    const a = links[shown];
    setPill({ x: a.offsetLeft, w: a.offsetWidth });
  }, [shown]);
  useLayoutEffect(() => { place(); }, [place, scrolled]);
  useEffect(() => { window.addEventListener('resize', place); return () => window.removeEventListener('resize', place); }, [place]);

  // Menu: Escape and outside clicks close it; focus moves in and comes back out.
  const close = useCallback((restore = true) => { setOpen(false); if (restore) menuButton.current?.focus(); }, []);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) close(false); };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', down);
    const previous = document.body.style.overflow;
    if (window.innerWidth < 900) document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', down); document.body.style.overflow = previous; };
  }, [open, close]);
  // A new page closes the menu.
  const [lastPath, setLastPath] = useState(path);
  if (lastPath !== path) { setLastPath(path); setOpen(false); }

  const current = (url: string) => (url === '/' ? path === '/' : !url.includes('#') && path.startsWith(url)) ? 'page' as const : undefined;
  const sheen = (e: React.PointerEvent) => {
    const r = bar.current!.getBoundingClientRect();
    bar.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    bar.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return <>
    <header ref={root} className={`gh ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`} data-tone={open ? 'light' : tone}>
      <svg className="gh-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id="gh-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="2" seed="11" result="noise"/>
          <feGaussianBlur in="noise" stdDeviation="2.5" result="soft"/>
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="22" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </svg>
      <div className="gh-bar" ref={bar} onPointerMove={sheen}>
        <Link href="/" className="gh-brand">
          <img className="gh-mark" src="/logo-header.webp" alt="Rushan Haque" width="360" height="186"/>
        </Link>
        <nav className="gh-nav" ref={navRef} aria-label="Main" onPointerLeave={() => setHover(null)}>
          <span className="gh-pill" aria-hidden="true" style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w, opacity: 1 } : { opacity: 0 }}/>
          {nav.map(([label, url], i) => <Link key={url} href={url} aria-current={current(url)} onPointerEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
            {label}{label === 'Works' && <sup>{workCount}</sup>}
          </Link>)}
        </nav>
        <div className="gh-actions">
          <Link href="/connect" className="gh-cta">Connect <ArrowUpRight size={15}/></Link>
          <button ref={menuButton} type="button" className="gh-menu" aria-expanded={open} aria-controls="gh-panel" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)}><i/><i/></button>
        </div>
        <i className="gh-progress" aria-hidden="true"/>
      </div>
      <div id="gh-panel" ref={panel} className="gh-panel" inert={!open ? true : undefined}>
        <div className="gh-panel-links">
          {groups.map((g, gi) => <nav key={g.title} aria-label={g.title}>
            <span>{g.title}</span>
            {g.links.map(([label, url], i) => <Link key={url} href={url} aria-current={current(url)} onClick={() => close(false)} style={{ '--i': gi * 6 + i } as React.CSSProperties}>{label}<ArrowUpRight size={18}/></Link>)}
          </nav>)}
        </div>
        <aside className="gh-panel-card">
          <span>Let’s build</span>
          <p>Got something worth building? Send the brief, or just the problem. I answer everything myself, usually within a day.</p>
          <div className="gh-panel-actions">
            <Link href="/connect" className="gh-cta" onClick={() => close(false)}>Start a project <ArrowUpRight size={15}/></Link>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="gh-ghost">Book a call <ArrowUpRight size={15}/></a>
          </div>
          <a className="gh-mail" href={`mailto:${email}`}>{email}</a>
          <div className="gh-socials">{socials.map(s => <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>)}</div>
        </aside>
      </div>
    </header>
    {path !== '/' && <div className="gh-spacer" aria-hidden="true"/>}
  </>;
}
