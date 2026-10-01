'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { responsive } from '@/lib/images';
import profile from '@/content/profile.json';
import { BookCover, toneStyle } from '@/components/book-cover';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin, Draggable, InertiaPlugin, SplitText);

const desktop = '(min-width: 900px) and (min-height: 620px)';
const scrambleChars = 'abcdefghijklmnopqrstuvwxyz{}[]()<>/=;:.*+-_';

/* ------------------------------------------------------------------ */
/* I — Two languages: code that rewrites itself into prose.             */
/* ------------------------------------------------------------------ */
const LINES = [
  { code: 'build(thing).works === true;', prose: 'I build things that work.' },
  { code: 'thing.feeling = "something";', prose: 'Then make them feel like something.' },
  { code: '// developer, by discipline', prose: 'Developer by discipline.' },
  { code: '// writer, by temperament', prose: 'Writer by temperament.' },
];

export function TwoLanguages() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add(desktop, () => {
      section.classList.add('is-pinned');
      const lines = gsap.utils.toArray<HTMLElement>('.tl-code-line', section);
      lines.forEach((line, i) => { const text = line.querySelector<HTMLElement>('.tl-code-text')!; text.textContent = LINES[i].code; line.classList.remove('is-prose'); });
      gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', toggleActions: 'play none none reverse' } })
        .from('.tl-two-title .tl-split-line > span', { yPercent: 110, stagger: .1, duration: 1, ease: 'expo.out' })
        .from(lines, { opacity: 0, x: -40, stagger: .08, duration: .8, ease: 'power3.out' }, '<.25');
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=240%', pin: true, scrub: .8, anticipatePin: 1 } });
      tl.to({}, { duration: .3 });
      lines.forEach((line, i) => {
        const text = line.querySelector<HTMLElement>('.tl-code-text')!;
        tl.set(line, { className: 'tl-code-line is-prose' }, `swap${i}`)
          .to(text, { duration: 1, ease: 'none', scrambleText: { text: LINES[i].prose, chars: scrambleChars, revealDelay: .25, speed: .6 } }, `swap${i}`)
          .to(line.querySelector('.tl-code-gutter'), { opacity: .25, duration: .4 }, `swap${i}`);
      });
      tl.to('.tl-two-ghost', { xPercent: -25, opacity: .9, duration: 2, ease: 'none' }, 0)
        .fromTo('.tl-two-coda', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .6 }, '>-0.2')
        .to({}, { duration: .5 });
      return () => lines.forEach((line, i) => { section.classList.remove('is-pinned'); line.classList.remove('is-prose'); line.querySelector<HTMLElement>('.tl-code-text')!.textContent = LINES[i].code; });
    });
    return () => mm.revert();
  }, [reduced]);
  return <section id="two-languages" className="tl-two" ref={root} data-chapter="I — Two languages">
    <span className="tl-two-ghost" aria-hidden="true">خیال</span>
    <div className="tl-two-head">
      <span className="tl-kicker">I — TWO LANGUAGES</span>
      <h2 className="tl-two-title"><span className="tl-split-line"><span>I write in</span></span><span className="tl-split-line"><span><em>two languages.</em></span></span></h2>
    </div>
    <ol className="tl-code" aria-label="I build things that work. Then make them feel like something. Developer by discipline. Writer by temperament.">
      {LINES.map((line, i) => <li className="tl-code-line" key={i} aria-hidden="true"><span className="tl-code-gutter">{String(i + 1).padStart(2, '0')}</span><span className="tl-code-text">{line.code}</span><span className="tl-code-prose">{line.prose}</span></li>)}
    </ol>
    <p className="tl-two-coda">One in <code>code</code>, one in <em>verse</em>. Same instinct, different material.</p>
  </section>;
}

/* ------------------------------------------------------------------ */
/* II — Works: a deck of projects that fly past the camera.             */
/* ------------------------------------------------------------------ */
const STORIES: Record<string, { line: string; field: string }> = {
  'erfolg-living': { line: 'A room. A rhythm. A feeling.', field: 'Interiors & living' },
  taif: { line: 'Objects with a point of view.', field: 'Objects & interiors' },
  aurelio: { line: 'Make the first impression count.', field: 'Brand & commerce' },
  velora: { line: 'A world still taking shape.', field: 'In development' },
  'casa-and-crop': { line: 'Rooted in the everyday.', field: 'Lifestyle & commerce' },
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
    mm.add(desktop, () => {
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
  return <section id="selected-work" className={`tl-deck ${pinned ? 'is-pinned' : ''}`} ref={root} data-chapter="II — Selected works">
    <div className="tl-deck-head"><span className="tl-kicker">II — WORKS</span><h2>Different worlds.<br/><em>One curious mind.</em></h2></div>
    <div className="tl-deck-ghosts" aria-hidden="true">{works.map(w => <span className="tl-deck-ghost" key={w.slug}>{w.title}</span>)}</div>
    <div className="tl-deck-stage">{works.map((work, i) => <Link key={work.slug} href={`/projects/${work.slug}`} className="tl-deck-card" aria-label={`${work.title} — ${STORIES[work.slug]?.line ?? work.description}`}>
      <img src={work.image!} {...responsive(work.image, '(max-width: 899px) 92vw, 62vw')} alt="" width="1600" height="900" loading={i < 2 ? 'eager' : 'lazy'} decoding="async"/>
      <span className="tl-deck-card-index">W/{String(i + 1).padStart(2, '0')}</span>
      <span className="tl-deck-card-title">{work.title}<em>{STORIES[work.slug]?.line}</em></span>
    </Link>)}</div>
    {current && <div className="tl-deck-info" aria-hidden="true">
      <span className="tl-deck-count"><b>{String(active + 1).padStart(2, '0')}</b> / {String(works.length).padStart(2, '0')}</span>
      <span className="tl-deck-field">{STORIES[current.slug]?.field ?? current.discipline} · {current.year}</span>
      <i className="tl-deck-progress"><span style={{ transform: `scaleX(${(active + 1) / works.length})` }}/></i>
    </div>}
    <Link href="/projects" className="tl-deck-archive"><span>There’s considerably more.<br/><em>The archive has the rest.</em></span><b>{projects.length}<ArrowUpRight size={34}/></b></Link>
  </section>;
}

/* ------------------------------------------------------------------ */
/* Interlude — a ribbon of words that runs faster as you scroll.        */
/* ------------------------------------------------------------------ */
export function VelocityMarquee({ words }: { words: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const rows = gsap.utils.toArray<HTMLElement>('.tl-marquee-row', el);
    const loops = rows.map((row, i) => gsap.fromTo(row, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 28, ease: 'none', repeat: -1 }));
    const skew = gsap.quickTo(rows, 'skewX', { duration: .5, ease: 'power3.out' });
    const st = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: self => {
      const v = self.getVelocity();
      skew(gsap.utils.clamp(-14, 14, v / -180));
      loops.forEach(l => gsap.to(l, { timeScale: (1 + Math.abs(v) / 260) * self.direction, duration: .2, overwrite: true, onComplete: () => { gsap.to(l, { timeScale: self.direction, duration: 1.2 }); skew(0); } }));
    } });
    return () => { st.kill(); loops.forEach(l => l.kill()); };
  }, [reduced]);
  const content = words.map((w, i) => <span key={i}>{i % 2 ? <em>{w}</em> : w}<i>✳</i></span>);
  return <div className="tl-marquee" ref={root} aria-hidden="true">
    <div className="tl-marquee-row">{content}{content}</div>
    <div className="tl-marquee-row is-outline">{content}{content}</div>
  </div>;
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
  return <section id="writing" className="tl-writing" ref={root} data-chapter="III — The written world">
    <div className="tl-writing-head"><span className="tl-kicker">III — WRITING</span><h2>Not everything<br/>needs to <em>compile.</em></h2><p>Research, verse and the occasional book. The other half of the practice.</p><Link href="/writing" className="tl-link">Read the writing <ArrowUpRight size={16}/></Link></div>
    <div className="tl-shelf">
      <div className="tl-shelf-books">{writings.map((w, i) => {
        const [t, h] = SHAPE[w.slug] ?? [48, 380];
        return <Link key={w.slug} href={`/writing/${w.slug}`} className={`tl-book ${active === i ? 'is-active' : ''}`} onPointerEnter={e => { if (e.pointerType === 'mouse') setActive(i); }} onFocus={() => setActive(i)}
          onClick={e => { if (active !== i) { e.preventDefault(); setActive(i); } }}
          style={{ ...toneStyle(w.slug), '--t': t, '--h': h, '--w': Math.round(h * .68) } as React.CSSProperties} aria-label={`${w.originalTitle} — ${w.category}, ${w.status}`}>
          <span className="tl-book-3d" aria-hidden="true">
            <span className="tl-book-spine"><span className="tl-book-band"/><b>{w.originalTitle}</b><span className="tl-book-band"/><small>RH<br/>{w.year}</small></span>
            <span className="tl-book-side"><BookCover book={w} size="shelf"/></span>
            <span className="tl-book-top"/>
          </span>
        </Link>;
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
  const blob = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current, lens = blob.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.tl-wall-row').forEach((row, i) => gsap.fromTo(row, { xPercent: i % 2 ? 18 : -18 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'top 45%', scrub: .6 } }));
    }, section);
    let cleanup = () => {};
    if (lens && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const x = gsap.quickTo(lens, 'x', { duration: .55, ease: 'power3.out' }), y = gsap.quickTo(lens, 'y', { duration: .55, ease: 'power3.out' });
      const move = (e: PointerEvent) => { const b = section.getBoundingClientRect(); x(e.clientX - b.left); y(e.clientY - b.top); };
      const over = (e: PointerEvent) => gsap.to(lens, { scale: (e.target as Element).closest('.tl-wall-row') ? 1 : .35, duration: .5, ease: 'expo.out' });
      const enter = () => gsap.to(lens, { opacity: 1, duration: .3 }), leave = () => gsap.to(lens, { opacity: 0, scale: .2, duration: .4 });
      section.addEventListener('pointermove', move); section.addEventListener('pointerover', over); section.addEventListener('pointerenter', enter); section.addEventListener('pointerleave', leave);
      cleanup = () => { section.removeEventListener('pointermove', move); section.removeEventListener('pointerover', over); section.removeEventListener('pointerenter', enter); section.removeEventListener('pointerleave', leave); };
    }
    return () => { cleanup(); ctx.revert(); };
  }, [reduced]);
  return <section id="services" className="tl-wall" ref={root} data-chapter="IV — Beyond the build">
    <div className="tl-wall-lens" ref={blob} aria-hidden="true"/>
    <div className="tl-wall-head"><span className="tl-kicker">IV — SERVICES</span><p>The build is mine. Growth, infrastructure and everything after launch come through partners I trust.</p><Link href="/services" className="tl-link">Every service <ArrowUpRight size={16}/></Link></div>
    <ul className="tl-wall-list">{services.map((s, i) => <li className="tl-wall-row" key={s.title}>
      <Link href="/contact">
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
  const { experience, education, certifications } = useContent();
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
      gsap.fromTo('.tl-portrait', { clipPath: 'circle(7% at 50% 52%)' }, { clipPath: 'circle(75% at 50% 52%)', ease: 'none', scrollTrigger: { trigger: '.tl-person-intro', start: 'top 85%', end: 'center 45%', scrub: .6 } });
      gsap.fromTo('.tl-portrait img', { scale: 1.35, filter: 'grayscale(1) contrast(1.15)' }, { scale: 1, filter: 'grayscale(0) contrast(1)', ease: 'none', scrollTrigger: { trigger: '.tl-person-intro', start: 'top 85%', end: 'bottom 40%', scrub: .6 } });
      const bio = SplitText.create('.tl-bio', { type: 'words' });
      gsap.fromTo(bio.words, { opacity: .12 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.tl-bio', start: 'top 80%', end: 'bottom 50%', scrub: .5 } });
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

  const learning = certifications.filter(c => c.category === 'Training' || c.category === 'Job simulations').length;
  return <section id="journey" className="tl-person" ref={root} data-chapter="V — The person">
    <div className="tl-person-intro">
      <figure className="tl-portrait"><img src={profile.portrait} alt="Rushan Haque" width="853" height="878" loading="lazy" decoding="async"/></figure>
      <div className="tl-person-copy">
        <span className="tl-kicker">V — THE PERSON</span>
        <h2>Still learning.<br/><em>Always looking.</em></h2>
        <p className="tl-bio">{profile.bio}</p>
        <div className="tl-facts">
          <span className="tl-fact"><b>{learning}</b>Certifications</span>
          <span className="tl-fact"><b>03</b>Languages spoken</span>
          <span className="tl-fact"><b>{String(experience.length).padStart(2, '0')}</b>Roles held</span>
          <span className="tl-fact"><b>40+</b>Projects contributed to</span>
        </div>
        <Link href="/certifications" className="tl-link">Certificates & credentials <ArrowUpRight size={16}/></Link>
      </div>
    </div>
    <div className="tl-path">
      <div className="tl-path-head-row"><span className="tl-kicker">THE ROUTE SO FAR</span><span className="tl-path-legend" aria-hidden="true"><i className="is-work"/>Work<i className="is-study"/>Study</span></div>
      <div className="tl-path-list">
        <svg className="tl-path-svg" aria-hidden="true">
          <defs><linearGradient id="tl-path-ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9f26f"/><stop offset=".35" stopColor="#3f7a5c"/><stop offset="1" stopColor="#072319"/></linearGradient></defs>
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
  return <section id="reviews" className="tl-voices" ref={root} data-chapter="VI — Voices">
    <div className="tl-voices-head">
      <div><span className="tl-kicker">VI — VOICES</span><h2>Good work.<br/><em>Real people.</em></h2></div>
      <div className="tl-score"><b>{average}</b><span><span className="tl-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0}/>)}</span>{reviews.length} reviews · published unedited</span></div>
    </div>
    <p className="tl-board-hint" aria-hidden="true">Pick one up. They’re all real ↗</p>
    <div className="tl-board">{reviews.map((r, i) => { const [x, y, rot] = SPOTS[i % SPOTS.length]; return <figure className="tl-note" key={r.name + i} style={{ '--x': `${x}%`, '--y': `${y}%`, '--r': `${rot}deg` } as React.CSSProperties}>
      <span className="tl-note-pin" aria-hidden="true"/>
      <blockquote>“{r.quote}”</blockquote>
      <figcaption><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span>{r.date && <time>{r.date}</time>}</figcaption>
    </figure>; })}</div>
    <div className="tl-voices-actions"><Link href="/write-a-review" className="tl-button">Leave your own <ArrowUpRight size={16}/></Link><Link href="/reviews" className="tl-link">Read all reviews <ArrowUpRight size={16}/></Link></div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* VII — The lab: a door to the seven instrument studies.               */
/* ------------------------------------------------------------------ */
const LAB = [
  ['01', 'Look underneath', 'An X-ray lens over a live site.'],
  ['02', 'Rewind the build', 'Scrub a real build, commit by commit.'],
  ['03', 'Resize me', 'Drag a live site from phone to desktop.'],
  ['04', 'The seismograph', 'Two years of real GitHub activity.'],
  ['05', 'Bring me a problem', 'Pick constraints; matching projects rise.'],
  ['06', 'Your site, under the lens', 'Seventeen real checks on your website.'],
  ['07', 'Yours to run', 'Edit a real product in the admin I hand over.'],
];
export function LabTeaser() {
  return <section id="lab" className="tl-lab" data-chapter="VII — The lab" aria-labelledby="lab-title">
    <div className="tl-lab-head"><span className="tl-kicker">VII — THE LAB</span><h2 id="lab-title">Don’t take my word.<br/><em>Test it.</em></h2><p>Seven small instruments. Each one measures something, so you don’t have to take anything on faith.</p><Link href="/studies" className="tl-button">Enter the lab <ArrowUpRight size={16}/></Link></div>
    <ol className="tl-lab-list">{LAB.map(([n, name, line]) => <li key={n}><Link href={`/studies#study-${n}`}><span>STUDY {n}</span><strong>{name}</strong><small>{line}</small><ArrowUpRight size={18}/></Link></li>)}</ol>
  </section>;
}

/* ------------------------------------------------------------------ */
/* Chapter rail and cursor                                              */
/* ------------------------------------------------------------------ */
export function ChapterRail() {
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const { reduced } = useMotion();
  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>('main [data-chapter]');
    const chapters = sections.filter(s => s.dataset.chapter !== 'Prologue');
    // The active chapter is read from layout on every update, so fast jumps never leave a stale label.
    let current: HTMLElement | null = null;
    const pick = () => {
      const line = window.innerHeight * .55;
      let next: HTMLElement | null = null;
      for (const section of sections) if (section.getBoundingClientRect().top <= line) next = section;
      if (!next || next === current || !label.current) return;
      current = next;
      setShown(next.dataset.chapter !== 'Prologue');
      setIndex(chapters.indexOf(next) + 1);
      const text = (next.dataset.chapter ?? '').replace(/^[IVX]+ — /, '');
      if (reduced) label.current.textContent = text;
      else gsap.to(label.current, { duration: .7, overwrite: true, scrambleText: { text, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: .8 } });
    };
    // Measured after the pinned scenes add their spacing.
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    const progress = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`; pick(); }, onRefresh: pick });
    const first = requestAnimationFrame(() => { setCount(chapters.length); pick(); });
    return () => { cancelAnimationFrame(first); window.clearTimeout(settle); progress.kill(); };
  }, [reduced]);
  return <div className={`tl-rail ${shown ? 'is-shown' : ''}`} aria-hidden="true">
    <span className="tl-rail-num"><b>{String(index).padStart(2, '0')}</b>/{String(count).padStart(2, '0')}</span>
    <i>{Array.from({ length: count }, (_, k) => <em key={k} className={k < index ? 'is-past' : ''} style={{ bottom: `${count > 1 ? (k / (count - 1)) * 100 : 0}%` }}/>)}<b ref={bar}/></i>
    <span className="tl-rail-label" ref={label}>Prologue</span>
  </div>;
}
