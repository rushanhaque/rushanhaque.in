'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { withoutEmoji } from '@/lib/text';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { responsive } from '@/lib/images';
import profile from '@/content/profile.json';
import { BookCover, toneStyle } from '@/components/book-cover';
import { projectLink } from '@/lib/project-access';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, Draggable, InertiaPlugin, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });


/* ------------------------------------------------------------------ */
/* I — Two languages: code that rewrites itself into prose.             */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* II — Works: a deck of projects that fly past the camera.             */
/* ------------------------------------------------------------------ */
const STORIES: Record<string, { line: string; field: string }> = {
  'erfolg-living': { line: 'Handmade luxury metalwork.', field: 'Interiors & living' },
  taif: { line: 'Handicrafts in brass, copper and wood.', field: 'Objects & interiors' },
  aurelio: { line: 'Furniture and lighting in metal and wood.', field: 'Brand & commerce' },
  velora: { line: 'Hand-raised metalware. Still being built.', field: 'In development' },
  'casa-and-crop': { line: 'Home metalware, exported worldwide.', field: 'Lifestyle & commerce' },
};

export function WorksDeck() {
  const { projects } = useContent();
  const works = projects.filter(p => p.category === 'Client work' && p.image).slice(0, 5);
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-height: 520px)', () => {
      // Switch to the pinned layout before anything is measured.
      section.classList.add('is-pinned');
      setPinned(true);
      const cards = gsap.utils.toArray<HTMLElement>('.tl-deck-card', section);
      const titles = gsap.utils.toArray<HTMLElement>('.tl-deck-ghost', section);
      const place = (_card: HTMLElement, depth: number) => ({ xPercent: -50, yPercent: -50, z: -depth * 140, y: -depth * 34, rotateX: 0, rotateZ: 0, scale: 1 - depth * .04, opacity: depth > 3 ? 0 : 1, filter: `brightness(${1 - depth * .16})` });
      cards.forEach((card, i) => gsap.set(card, { ...place(card, i), zIndex: cards.length - i }));
      gsap.set(titles, { yPercent: 100, opacity: 0 }); gsap.set(titles[0], { yPercent: 0, opacity: 1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${cards.length * 95}%`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => setActive(Math.min(cards.length - 1, Math.round(self.progress * (cards.length - .6)))) } });
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const at = i;
        tl.to(card, { y: '-125vh', z: 320, rotateX: 38, rotateZ: i % 2 ? 7 : -7, duration: 1, ease: 'power2.in' }, at)
          .to(titles[i], { yPercent: -100, opacity: 0, duration: .6, ease: 'power2.in' }, at + .2)
          .fromTo(titles[i + 1], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'power3.out' }, at + .45);
        cards.slice(i + 1).forEach((next, j) => tl.to(next, { ...place(next, j), duration: 1, ease: 'power2.inOut' }, at));
      });
      tl.to({}, { duration: .4 });
      return () => { section.classList.remove('is-pinned'); setPinned(false); };
    });
    return () => mm.revert();
  }, [reduced, works.length]);

  const current = works[active];
  return <section id="selected-work" className={`tl-deck ${pinned ? 'is-pinned' : ''}`} ref={root} data-chapter="I — Recent work">
    <div className="tl-deck-head"><span className="tl-kicker">I — RECENT WORK</span><h2 suppressHydrationWarning>Recent <em>work.</em></h2><p className="tl-deck-sub">Websites I’ve built for clients recently. The archive has everything else.</p></div>
    <div className="tl-deck-ghosts" aria-hidden="true">{works.map(w => <span className="tl-deck-ghost" key={w.slug}>{`${w.title} · ${w.title} · ${w.title}`}</span>)}</div>
    <div className="tl-deck-stage">{works.map((work, i) => <a key={work.slug} {...projectLink(work)} className="tl-deck-card" inert={i !== active ? true : undefined}>
      <img src={work.image!} {...responsive(work.image, '(max-width: 899px) 92vw, 62vw')} alt="" width="1600" height="900" loading={i < 2 ? 'eager' : 'lazy'} decoding="async"/>
      <span className="tl-deck-card-index">W/{String(i + 1).padStart(2, '0')}</span>
      <span className="tl-deck-card-title">{work.title}<em>{STORIES[work.slug]?.line}</em></span>
      <span className="tl-deck-card-visit">Visit site <ArrowUpRight size={14}/><span className="sr-only"> (opens in a new tab)</span></span>
    </a>)}</div>
    {current && <div className="tl-deck-info" aria-hidden="true">
      <span className="tl-deck-count"><b>{String(active + 1).padStart(2, '0')}</b> / {String(works.length).padStart(2, '0')}</span>
      <i className="tl-deck-progress"><span style={{ transform: `scaleX(${(active + 1) / works.length})` }}/></i>
    </div>}
    <Link href="/projects" className="tl-deck-archive"><span>Open the <em>archive</em></span><b>{projects.length}<ArrowUpRight size={34}/></b></Link>
  </section>;
}

/* ------------------------------------------------------------------ */
/* Interlude — a ribbon of words that runs faster as you scroll.        */
/* ------------------------------------------------------------------ */
// An eight-spoked asterisk drawn as lines, so no phone can swap it for an emoji.
function Spark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/></svg>;
}
export function VelocityMarquee({ words }: { words: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const rows = gsap.utils.toArray<HTMLElement>('.tl-marquee-row', el);
    const loops = rows.map((row, i) => gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 28, ease: 'none', repeat: -1 }));
    const skew = gsap.quickTo(rows, 'skewX', { duration: .5, ease: 'power3.out' });
    // The loops only run while the ribbon is on screen.
    loops.forEach(l => l.pause());
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: self => loops.forEach(l => self.isActive ? l.resume() : l.pause()), onUpdate: self => {
      const v = self.getVelocity();
      skew(gsap.utils.clamp(-14, 14, v / -180));
      loops.forEach(l => gsap.to(l, { timeScale: (1 + Math.abs(v) / 260) * self.direction, duration: .2, overwrite: true, onComplete: () => { gsap.to(l, { timeScale: self.direction, duration: 1.2 }); skew(0); } }));
    } });
    return () => { st.kill(); loops.forEach(l => l.kill()); };
  }, [reduced]);
  const content = words.map((w, i) => <span key={i}>{i % 2 ? <em>{w}</em> : w}<i><Spark/></i></span>);
  return <div className="tl-marquee" ref={root} aria-hidden="true">
    <div className="tl-marquee-row">{content}{content}</div>
    <div className="tl-marquee-row is-outline">{content}{content}</div>
  </div>;
}

/* ------------------------------------------------------------------ */
/* II — What I build: the core services, each opening its own page.     */
/* ------------------------------------------------------------------ */
const BUILD = [
  ['website-design-development', 'Business websites', 'Designed and coded from scratch, around your customers.'],
  ['ecommerce-website-development', 'E-commerce stores', 'Online stores with Razorpay, PayU, Cashfree or Stripe.'],
  ['website-for-exporters-moradabad', 'Export catalogues', 'Searchable catalogues and enquiries for overseas buyers.'],
  ['web-application-development', 'Web applications', 'Portals, dashboards and tools built around how you work.'],
  ['landing-page-design', 'Landing pages', 'One page, one offer, built to turn visits into enquiries.'],
  ['website-redesign', 'Redesigns', 'Rebuild what is costing you leads, and keep your rankings.'],
  ['website-speed-optimization', 'Speed', 'Faster pages that pass Core Web Vitals on mobile networks.'],
  ['seo-services', 'SEO', 'Technical and local SEO, so people nearby find you first.'],
  ['generative-engine-optimization', 'AI search (GEO)', 'Be the business ChatGPT, Gemini and Perplexity recommend.'],
] as const;
export function ServiceIndex() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      // Each row rises out of its own line (the list item clips it), and the rule beneath draws in.
      const reveal = { trigger: '.tl-build-list', start: 'top 82%', once: true };
      gsap.fromTo('.tl-build-row', { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .07, clearProps: 'transform', scrollTrigger: reveal });
      gsap.fromTo('.tl-build-list li', { '--line': 0 }, { '--line': 1, duration: 1.5, ease: 'expo.out', stagger: .07, scrollTrigger: reveal });
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  return <section id="what-i-build" className="tl-build" ref={root} data-chapter="II — What I build">
    <div className="tl-build-head">
      <span className="tl-kicker">II — WHAT I BUILD</span>
      <h2 suppressHydrationWarning>Websites, <em>end to end.</em></h2>
      <p>Designed and built from scratch in Moradabad, for businesses here and abroad. Each one opens a page on what it involves, what it costs and how long it takes.</p>
      <div className="tl-build-links"><Link href="/website-cost-in-moradabad" className="tl-link">What it costs <ArrowUpRight size={16}/></Link><Link href="/website-designer-in-moradabad" className="tl-link">Website designer in Moradabad <ArrowUpRight size={16}/></Link></div>
    </div>
    <ol className="tl-build-list">{BUILD.map(([slug, name, line], i) => <li key={slug}>
      <Link href={'/' + slug} className="tl-build-row">
        <span className="tl-build-n">{String(i + 1).padStart(2, '0')}</span>
        <span className="tl-build-name">{name}</span>
        <span className="tl-build-line">{line}</span>
        <ArrowUpRight className="tl-build-go" size={22} strokeWidth={1.5} aria-hidden="true"/>
      </Link>
    </li>)}</ol>
  </section>;
}

/* ------------------------------------------------------------------ */
/* III — Writing: a shelf of books that pull out to show their covers.  */
/* ------------------------------------------------------------------ */
// Spine thickness and height per book, in px at desktop scale.
const SHAPE: Record<string, [number, number]> = {
  'feedback-loop-collapse': [30, 372],
  'to-the-moon-and-beyond': [56, 398],
  'aabshar-e-khayaal': [46, 360],
  'the-psychology-framework': [64, 410],
  samundar: [52, 386],
};
export function Bookshelf() {
  const { writings } = useContent();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.tl-book', { y: -70, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .09, scrollTrigger: { trigger: '.tl-shelf', start: 'top 80%', once: true } });
      gsap.from('.tl-shelf-plank', { scaleX: .6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tl-shelf', start: 'top 85%', once: true } });
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  const book = writings[active];
  return <section id="writing" className="tl-writing" ref={root} data-chapter="III — Writing">
    <div className="tl-writing-head"><span className="tl-kicker">III — WRITING</span><h2 suppressHydrationWarning>Notes and <em>books.</em></h2><p>Writing alongside the code: a research note, a book contribution and a book in progress. Pick a spine to see what it’s about.</p></div>
    <div className="tl-shelf">
      <div className="tl-shelf-books">{writings.map((w, i) => {
        const [t, h] = SHAPE[w.slug] ?? [48, 380];
        const Book = (w.url ? 'a' : 'div') as 'a';
        const role = w.url ? undefined : 'group';
        return <Book key={w.slug} {...(w.url ? { href: w.url, target: '_blank', rel: 'noopener noreferrer' } : { tabIndex: 0, role })} className={`tl-book ${active === i ? 'is-active' : ''}`} onPointerEnter={e => { if (e.pointerType === 'mouse') setActive(i); }} onFocus={() => setActive(i)}
          onClick={(e: React.MouseEvent) => { if (active !== i) { e.preventDefault(); setActive(i); } }}
          style={{ ...toneStyle(w.slug), '--t': t, '--h': h, '--w': Math.round(h * .68) } as React.CSSProperties} aria-label={`${w.originalTitle} — ${w.category}, ${w.status}`}>
          <span className="tl-book-3d" aria-hidden="true">
            <span className="tl-book-spine"><span className="tl-book-band"/><b>{w.originalTitle}</b><span className="tl-book-band"/><small>RH<br/>{w.year}</small></span>
            <span className="tl-book-side"><BookCover book={w} size="shelf"/></span>
            <span className="tl-book-top"/>
          </span>
        </Book>;
      })}<span className="tl-bookend" aria-hidden="true"/></div>
      <div className="tl-shelf-plank"><i/></div>
    </div>
    {book && <div className="tl-book-info" aria-live="polite"><span>{String(active + 1).padStart(2, '0')} / {String(writings.length).padStart(2, '0')} · {book.category.toUpperCase()} · {book.status === 'Forthcoming' ? 'COMING SOON' : book.status.toUpperCase()}</span><h3 key={book.slug}>{book.originalTitle}</h3><p>{book.description}</p></div>}
  </section>;
}

/* ------------------------------------------------------------------ */
/* IV — Beyond the build: a wall of words, inverted by a roaming lens.  */
/* ------------------------------------------------------------------ */
export function TypeWall() {
  const { services } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      const drift = window.matchMedia('(max-width: 899px)').matches ? 6 : 18;
      gsap.utils.toArray<HTMLElement>('.tl-wall-row').forEach((row, i) => gsap.fromTo(row, { xPercent: i % 2 ? drift : -drift }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'top 45%', scrub: .6 } }));
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  return <section id="services" className="tl-wall" ref={root} data-chapter="IV — More services">
    <div className="tl-wall-head">
      <span className="tl-kicker">IV — MORE SERVICES</span>
      <h2 suppressHydrationWarning>Beyond the <em>build.</em></h2>
      <div className="tl-wall-intro"><p><strong>Need more than a website?</strong> With partners I’ve worked with and trust, I can also take on marketing, hosting, apps and business software. I scope it with you and stay your single point of contact.</p><Link href="/connect" className="tl-link">Talk it through <ArrowUpRight size={16}/></Link></div>
    </div>
    <ul className="tl-wall-list">{services.map((s, i) => <li className="tl-wall-row" key={s.title}>
      <Link href="/connect">
        <span className="tl-wall-num">{String(i + 1).padStart(2, '0')}</span>
        <span className="tl-wall-word">{s.title}</span>
        <span className="tl-wall-desc"><small>{s.subtitle}</small>{s.description}</span>
      </Link>
    </li>)}</ul>
  </section>;
}

/* ------------------------------------------------------------------ */
/* V — The person: an aperture opens on the portrait; a line traces the */
/* journey through every role.                                          */
/* ------------------------------------------------------------------ */
export function Person() {
  const { experience, education, stats } = useContent();
  const skills = profile.skills as Record<string, string[]>;
  const root = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const [d, setD] = useState('');
  const { reduced } = useMotion();

  // Draws a winding path through each role's marker.
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const list = section.querySelector<HTMLElement>('.tl-path-list')!;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const pts = Array.from(list.querySelectorAll<HTMLElement>('.tl-path-dot')).map(dot => { const r = dot.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top]; });
      if (pts.length < 2) return;
      // The line sways inside the centre lane only, so it never crosses the text.
      const sway = box.width >= 900 ? 58 : 9;
      let next = `M ${pts[0][0]} ${pts[0][1] - 70} L ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const s = (i % 2 ? 1 : -1) * sway, k = (y1 - y0) * .5; next += ` C ${x0 + s} ${y0 + k}, ${x1 + s} ${y1 - k}, ${x1} ${y1}`; }
      const [lx, ly] = pts[pts.length - 1]; next += ` L ${lx} ${ly + 70}`;
      setD(next);
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(list);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section || reduced || !d) return;
    const ctx = gsap.context(() => {
      const bio = SplitText.create('.tl-bio', { type: 'words', aria: 'none' });
      gsap.fromTo(bio.words, { opacity: .12 }, { opacity: 1, stagger: .05, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.tl-bio', start: 'top bottom', end: 'bottom 50%', scrub: .5 } });
      gsap.utils.toArray<HTMLElement>('.tl-fact b').forEach(el => gsap.from(el, { duration: 1.2, scrambleText: { text: el.textContent ?? '', chars: '0123456789', revealDelay: .3 }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
      const line = path.current, tip = head.current;
      if (line) {
        const len = line.getTotalLength();
        const follow = (p: number) => { if (!tip) return; const pt = line.getPointAtLength(len * p); tip.setAttribute('transform', `translate(${pt.x} ${pt.y})`); tip.style.opacity = p > .002 && p < .998 ? '1' : '0'; };
        gsap.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: '.tl-path-list', start: 'top 62%', end: 'bottom 62%', scrub: .5 }, onUpdate() { follow(this.progress()); } });
      }
      gsap.utils.toArray<HTMLElement>('.tl-path-item').forEach(item => ScrollTrigger.create({ trigger: item, start: 'top 62%', onEnter: () => item.classList.add('is-lit'), onLeaveBack: () => item.classList.remove('is-lit') }));
      section.classList.add('is-live');
    }, section);
    return () => { ctx.revert(); section.classList.remove('is-live'); };
  }, [reduced, d]);

  return <section id="journey" className="tl-person" ref={root} data-chapter="V — Journey">
    <div className="tl-person-intro">
      <div className="tl-person-copy">
        <span className="tl-kicker">V — JOURNEY</span>
        <h2 suppressHydrationWarning><em>Journey.</em></h2>
        <p className="tl-bio"><strong>I work across management, design and code, because client projects need all three.</strong> {profile.bio} Below is where I’ve worked and studied.</p>
        <div className="tl-facts">
          {stats.map(f => <span className="tl-fact" key={f.label}><b>{f.value}</b>{f.label}</span>)}
        </div>
        <dl className="tl-skills">{Object.entries(skills).map(([group, list]) => <div key={group}><dt>{group}</dt><dd>{list.join(' · ')}</dd></div>)}</dl>
        <Link href="/certifications" className="tl-link">Certificates & credentials <ArrowUpRight size={16}/></Link>
      </div>
    </div>
    <div className="tl-path">
      <div className="tl-path-head-row"><span className="tl-kicker">[01] EXPERIENCE · [02] EDUCATION</span><span className="tl-path-legend" aria-hidden="true"><i className="is-work"/>Experience<i className="is-study"/>Education</span></div>
      <div className="tl-path-list">
        <svg className="tl-path-svg" aria-hidden="true">
          <defs><linearGradient id="tl-path-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f1e6"/><stop offset=".35" stopColor="#07241a"/><stop offset="1" stopColor="#07241a"/></linearGradient></defs>
          <path className="tl-path-track" d={d}/>
          <path className="tl-path-ink" ref={path} d={d}/>
          <g className="tl-path-head" ref={head}><circle r="14"/><circle r="4.5"/></g>
        </svg>
        <span className="tl-path-end is-now" aria-hidden="true">Now</span>
        {[...experience.map(e => ({ title: e.role, place: e.company, period: e.period, note: e.description, study: false })), ...education.map(e => ({ title: e.title, place: e.institution, period: e.detail, note: '', study: true }))].map((item, i) => <article className={`tl-path-item ${i % 2 ? 'is-right' : ''} ${item.study ? 'is-study' : ''}`} key={item.title + item.place}>
          <span className="tl-path-dot" aria-hidden="true"/>
          <div><span className="tl-path-period">{item.period}</span><h3>{item.title}</h3><span className="tl-path-place">{item.place}</span>{item.note && <p>{item.note}</p>}</div>
        </article>)}
      </div>
    </div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* VI — Voices: notes pinned to a board. Pick them up; throw them.       */
/* ------------------------------------------------------------------ */
const SPOTS = [[4, 8, -6], [30, 3, 3], [57, 10, -2], [78, 4, 6], [10, 46, 4], [36, 40, -4], [62, 48, 5], [82, 42, -7], [46, 72, 2]];
export function Voices() {
  const { reviews } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  const ratings = reviews.map(r => Number(r.rating)).filter(Boolean);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine)', () => {
      const board = section.querySelector<HTMLElement>('.tl-board')!;
      const notes = gsap.utils.toArray<HTMLElement>('.tl-note', board);
      gsap.from(notes, { y: 260, rotate: () => gsap.utils.random(-40, 40), opacity: 0, duration: 1.3, ease: 'expo.out', stagger: { each: .07, from: 'random' }, scrollTrigger: { trigger: board, start: 'top 75%', once: true } });
      let z = 10;
      const drags = Draggable.create(notes, { type: 'x,y', bounds: board, inertia: true, edgeResistance: .7,
        onPress() { (this.target as HTMLElement).style.zIndex = String(++z); gsap.to(this.target, { scale: 1.06, rotate: 0, boxShadow: '0 40px 60px -30px rgba(0,0,0,.6)', duration: .3 }); },
        onRelease() { gsap.to(this.target, { scale: 1, rotate: gsap.utils.random(-6, 6), boxShadow: '0 18px 40px -26px rgba(0,0,0,.5)', duration: .6, ease: 'back.out(2)' }); } });
      return () => drags.forEach(d => d.kill());
    });
    return () => mm.revert();
  }, [reduced]);
  return <section id="reviews" className="tl-voices" ref={root} data-chapter="VI — Reviews">
    <div className="tl-voices-head">
      <div><span className="tl-kicker">VI — REVIEWS</span><h2 suppressHydrationWarning>What <em>they said.</em></h2></div>
      <div className="tl-score"><b>{average}</b><span><span className="tl-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0}/>)}</span>{reviews.length} reviews from clients, in their own words</span></div>
    </div>
    <p className="tl-board-hint" aria-hidden="true"><span className="is-fine">Drag a note <ArrowUpRight size={18} strokeWidth={1.5}/></span><span className="is-touch">Swipe through the notes <ArrowRight size={17} strokeWidth={1.5}/></span><small className="is-touch">{reviews.length} NOTES</small></p>
    <div className="tl-board">{reviews.map((r, i) => { const [x, y, rot] = SPOTS[i % SPOTS.length]; return <figure className="tl-note" key={r.name + i} style={{ '--x': `${x}%`, '--y': `${y}%`, '--r': `${rot}deg` } as React.CSSProperties}>
      <span className="tl-note-pin" aria-hidden="true"/>
      <blockquote>“{withoutEmoji(r.quote)}”</blockquote>
      <figcaption><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span>{r.date && <time>{r.date}</time>}</figcaption>
    </figure>; })}</div>
    <div className="tl-voices-actions"><Link href="/reviews" className="tl-button">Add a review <ArrowUpRight size={16}/></Link><Link href="/reviews" className="tl-link">Read all reviews <ArrowUpRight size={16}/></Link></div>
  </section>;
}
