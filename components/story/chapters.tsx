'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import profile from '@/content/profile.json';
import { BookCover, toneStyle } from '@/components/book-cover';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });


/* ------------------------------------------------------------------ */
/* Writeups and blogs: a shelf of books that pull out to show their covers.  */
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
      gsap.from('.tl-book', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: '.tl-shelf', start: 'top 80%', once: true } });
      gsap.from('.tl-shelf-plank', { scaleX: .6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tl-shelf', start: 'top 85%', once: true } });
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  const book = writings[active];
  return <section id="writing" className="tl-writing" ref={root} data-chapter="III — Writeups and blogs">
    <div className="tl-writing-head"><span className="tl-kicker">III — WRITEUPS AND BLOGS</span><h2 suppressHydrationWarning>Writeups and <em>blogs.</em></h2></div>
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
/* Journey: an aperture opens on the portrait; a line traces the */
/* journey through every role.                                          */
/* ------------------------------------------------------------------ */
export function Person({ n = 'II' }: { n?: string }) {
  const { experience, education, stats } = useContent();
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
      gsap.fromTo(bio.words, { opacity: .12 }, { opacity: 1, stagger: .05, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.tl-bio', start: 'top 95%', end: 'bottom 78%', scrub: .3 } });
      gsap.utils.toArray<HTMLElement>('.tl-fact b').forEach(el => gsap.from(el, { duration: 1.2, scrambleText: { text: el.textContent ?? '', chars: '0123456789', revealDelay: .3 }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
      const line = path.current, tip = head.current;
      if (line) {
        const len = line.getTotalLength();
        const follow = (p: number) => { if (!tip) return; const pt = line.getPointAtLength(len * p); tip.setAttribute('transform', `translate(${pt.x} ${pt.y})`); tip.style.opacity = p > .002 && p < .998 ? '1' : '0'; };
        gsap.fromTo(line, { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: '.tl-path-list', start: 'top 82%', end: 'bottom 78%', scrub: .3 }, onUpdate() { follow(this.progress()); } });
      }
      gsap.utils.toArray<HTMLElement>('.tl-path-item').forEach(item => ScrollTrigger.create({ trigger: item, start: 'top 84%', onEnter: () => item.classList.add('is-lit'), onLeaveBack: () => item.classList.remove('is-lit') }));
      section.classList.add('is-live');
    }, section);
    return () => { ctx.revert(); section.classList.remove('is-live'); };
  }, [reduced, d]);

  return <section id="journey" className="tl-person" ref={root} data-chapter={`${n} — Journey`}>
    <div className="tl-person-intro">
      <div className="tl-person-copy">
        <span className="tl-kicker">{n} — JOURNEY</span>
        <h2 suppressHydrationWarning><em>Journey.</em></h2>
        <p className="tl-bio">{profile.bio}</p>
        <div className="tl-facts">
          {stats.map(f => <span className="tl-fact" key={f.label}><b>{f.value}</b>{f.label}</span>)}
        </div>
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
