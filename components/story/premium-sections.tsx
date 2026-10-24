'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { ClientMap } from '@/components/client-map';
import { withoutEmoji } from '@/lib/text';
import { hostOf, storyOf } from '@/lib/work-stories';
import { CapArt } from '@/components/story/cap-art';
import { planOf } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);
const two = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* II — Clientele: a ruled plan of the clients, one cell each. Logos   */
/* come from the admin; until one is uploaded, the name is set instead. */
/* ------------------------------------------------------------------ */
export function Clientele() {
  const { clients, projects } = useContent();
  const list = clients ?? [];
  // A client with a site in the works carries that site's field as a caption.
  const workOf = (url: string) => { const h = hostOf(url); return h ? projects.find(x => hostOf(x.url) === h) : undefined; };
  const fieldOf = (url: string) => { const p = workOf(url); return p ? storyOf(p).field : ''; };
  // Under the pointer, a client's cell fills with forest and shows the drawing of the site built for them.
  const drawingOf = (url: string) => { const plan = planOf(workOf(url)?.image); return plan ? { '--plan': `url(${plan})` } as React.CSSProperties : undefined; };
  if (!list.length) return null;
  return <section id="clientele" className="tl-clients" data-chapter="II — Clientele">
    <div className="tl-clients-head">
      <span className="tl-kicker">II — CLIENTELE</span>
      <h2 suppressHydrationWarning>Selected <em>clientele.</em></h2>
    </div>
    <ul className="tl-clients-grid">{list.map((c, i) => {
      const inner = <>
        <small aria-hidden="true">{two(i + 1)}</small>
        {c.logo ? <img src={c.logo} alt={c.name} loading="lazy" decoding="async"/> : <span className="tl-client-name">{c.name}</span>}
        {fieldOf(c.url) && <span className="tl-client-field" aria-hidden="true">{fieldOf(c.url)}</span>}
      </>;
      return <li key={c.name + i} style={{ '--i': i } as React.CSSProperties}>{c.url
        ? <a className={`tl-client ${drawingOf(c.url) ? 'has-plan' : ''}`} style={drawingOf(c.url)} href={c.url} target="_blank" rel="noopener noreferrer">{inner}<ArrowUpRight className="tl-client-go" size={16} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
        : <div className="tl-client">{inner}</div>}</li>;
    })}</ul>
  </section>;
}

/* ------------------------------------------------------------------ */
/* IV — Capabilities: what else I take on, as a ruled directory on the */
/* forest, each entry lit softly under the pointer.                     */
/* ------------------------------------------------------------------ */
export function Capabilities() {
  const { services } = useContent();
  if (!services.length) return null;
  return <section id="services" className="tl-caps" data-chapter="V — Capabilities">
    <div className="tl-caps-head">
      <span className="tl-kicker">V — CAPABILITIES</span>
      <h2 suppressHydrationWarning>Beyond <em>the build.</em></h2>
      <p>Websites are the core. With partners I trust, I take on the rest and stay your one point of contact.</p>
      <Link href="/connect" className="tl-link">Talk it through <ArrowUpRight size={16}/></Link>
    </div>
    <ul className="tl-caps-grid">{services.map((s, i) => <li key={s.title} className="tl-cap spot">
      <span className="tl-cap-top"><span className="tl-cap-n">{two(i + 1)}</span><span className="tl-cap-tag">{s.subtitle}</span></span>
      <CapArt title={`${s.title} ${s.subtitle}`}/>
      <h3>{s.title}</h3>
      <p>{s.description}</p>
    </li>)}</ul>
  </section>;
}

/* ------------------------------------------------------------------ */
/* VI — Reviews: notes pinned to a board, over the dotted map of where  */
/* clients wrote from. On a desktop, pick them up and throw them; on a  */
/* phone they line up to be swiped through.                             */
/* ------------------------------------------------------------------ */
const SPOTS = [[4, 8, -6], [30, 3, 3], [57, 10, -2], [78, 4, 6], [10, 46, 4], [36, 40, -4], [62, 48, 5], [82, 42, -7], [46, 72, 2]];
export function Voices() {
  const { reviews } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  const ratings = reviews.map(r => Number(r.rating) || 5);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (hover: hover) and (pointer: fine)', () => {
      const board = section.querySelector<HTMLElement>('.tl-board')!;
      const notes = gsap.utils.toArray<HTMLElement>('.tl-note', board);
      gsap.from(notes, { y: 90, rotate: () => gsap.utils.random(-8, 8), opacity: 0, duration: 1.2, ease: 'power3.out', stagger: { each: .06, from: 'random' }, scrollTrigger: { trigger: board, start: 'top 75%', once: true } });
      // Dragging is desktop-only, so its plugins load only here, and only once the board is near.
      let z = 10, live = true;
      let drags: { kill: () => void }[] = [];
      const arm = ScrollTrigger.create({ trigger: board, start: 'top 150%', once: true, onEnter: async () => {
        const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import('gsap/Draggable'), import('gsap/InertiaPlugin')]);
        if (!live) return;
        gsap.registerPlugin(Draggable, InertiaPlugin);
        drags = Draggable.create(notes, { type: 'x,y', bounds: board, inertia: true, edgeResistance: .7,
          onPress() { (this.target as HTMLElement).style.zIndex = String(++z); gsap.to(this.target, { scale: 1.06, rotate: 0, boxShadow: '0 40px 60px -30px rgba(7,36,26,.45)', duration: .3 }); },
          onRelease() { gsap.to(this.target, { scale: 1, rotate: 0, boxShadow: '0 18px 40px -26px rgba(7,36,26,.4)', duration: .7, ease: 'power3.out' }); } });
      } });
      return () => { live = false; arm.kill(); drags.forEach(d => d.kill()); };
    });
    mm.add('(max-width: 899px), (hover: none)', () => {
      gsap.from(section.querySelectorAll('.tl-note'), { x: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: section.querySelector('.tl-board'), start: 'top 85%', once: true } });
    });
    return () => mm.revert();
  }, [reduced]);
  return <section id="reviews" className="tl-voices" ref={root} data-chapter="VI — Reviews">
    <ClientMap/>
    <div className="tl-voices-head">
      <div><span className="tl-kicker">VI — REVIEWS</span><h2 suppressHydrationWarning>What <em>they said.</em></h2></div>
      <div className="tl-score"><b data-count>{average}</b><span><span className="tl-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0}/>)}</span>{reviews.length} client reviews</span></div>
    </div>
    <div className="tl-board" data-native-scroll="">{reviews.map((r, i) => { const [x, y, rot] = SPOTS[i % SPOTS.length]; return <figure className="tl-note" key={r.name + i} style={{ '--x': `${x}%`, '--y': `${y}%`, '--r': `${rot}deg` } as React.CSSProperties}>
      <span className="tl-note-pin" aria-hidden="true"/>
      <blockquote>“{withoutEmoji(r.quote)}”</blockquote>
      <figcaption><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span>{r.date && <time>{r.date}</time>}</figcaption>
    </figure>; })}</div>
    <p className="tl-board-hint" aria-hidden="true"><span className="is-fine">Pick a note up and throw it.</span><span className="is-touch">Swipe through the notes <small>{two(reviews.length)} REVIEWS</small></span></p>
    <div className="tl-voices-actions"><Link href="/reviews" className="tl-button">Read all reviews <ArrowUpRight size={16}/></Link><Link href="/reviews" className="tl-link">Write a review <ArrowUpRight size={16}/></Link></div>
  </section>;
}
