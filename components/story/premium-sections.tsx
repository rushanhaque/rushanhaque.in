'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { ClientMap } from '@/components/client-map';
import { withoutEmoji } from '@/lib/text';
import { hostOf, storyOf } from '@/lib/work-stories';

const two = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* II — Clientele: a ruled plan of the clients, one cell each. Logos   */
/* come from the admin; until one is uploaded, the name is set instead. */
/* ------------------------------------------------------------------ */
export function Clientele() {
  const { clients, projects } = useContent();
  const list = clients ?? [];
  // A client with a site in the works carries that site's field as a caption.
  const fieldOf = (url: string) => { const h = hostOf(url); const p = h ? projects.find(x => hostOf(x.url) === h) : undefined; return p ? storyOf(p).field : ''; };
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
      return <li key={c.name + i}>{c.url
        ? <a className="tl-client" href={c.url} target="_blank" rel="noopener noreferrer">{inner}<ArrowUpRight className="tl-client-go" size={16} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>
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
  return <section id="services" className="tl-caps" data-chapter="IV — Capabilities">
    <div className="tl-caps-head">
      <span className="tl-kicker">IV — CAPABILITIES</span>
      <h2 suppressHydrationWarning>Beyond <em>the build.</em></h2>
      <p>Websites are the core. With partners I trust, I take on the rest and stay your one point of contact.</p>
      <Link href="/connect" className="tl-link">Talk it through <ArrowUpRight size={16}/></Link>
    </div>
    <ul className="tl-caps-grid">{services.map((s, i) => <li key={s.title} className="tl-cap spot">
      <span className="tl-cap-top"><span className="tl-cap-n">{two(i + 1)}</span><span className="tl-cap-tag">{s.subtitle}</span></span>
      <h3>{s.title}</h3>
      <p>{s.description}</p>
    </li>)}</ul>
  </section>;
}

/* ------------------------------------------------------------------ */
/* V — Testimonials: one review at a time, set large, over the map of  */
/* where clients wrote from. It moves on by itself and pauses while you */
/* read or choose from the index.                                       */
/* ------------------------------------------------------------------ */
export function Testimonials() {
  const { reviews } = useContent();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ratings = reviews.map(r => Number(r.rating) || 5);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';

  useEffect(() => {
    if (paused || reviews.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setActive(i => (i + 1) % reviews.length), 7000);
    return () => window.clearTimeout(t);
  }, [active, paused, reviews.length]);

  const r = reviews[active];
  if (!r) return null;
  const hold = { onPointerEnter: () => setPaused(true), onPointerLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) };
  return <section id="reviews" className="tl-testi" data-chapter="V — Testimonials">
    <ClientMap/>
    <div className="tl-testi-head">
      <div><span className="tl-kicker">V — TESTIMONIALS</span><h2 suppressHydrationWarning>In their <em>own words.</em></h2></div>
      <div className="tl-testi-score"><b data-count>{average}</b><span><span className="tl-testi-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0}/>)}</span>{reviews.length} client reviews</span></div>
    </div>
    <div className="tl-testi-body" {...hold}>
      <figure className="tl-testi-quote" key={active}>
        <span className="tl-testi-mark" aria-hidden="true">“</span>
        <blockquote>{withoutEmoji(r.quote)}</blockquote>
        <figcaption><strong>{r.name}</strong><span>{[r.company, r.location].filter(Boolean).join(' · ')}</span></figcaption>
      </figure>
      <div className={`tl-testi-meter ${paused ? 'is-paused' : ''}`} aria-hidden="true"><i key={active}/></div>
      <ol className="tl-testi-index" aria-label="Reviews">{reviews.map((x, i) => <li key={x.name + i}>
        <button type="button" aria-pressed={i === active} onClick={() => setActive(i)}><span>{two(i + 1)}</span>{x.name}</button>
      </li>)}</ol>
    </div>
    <div className="tl-testi-actions"><Link href="/reviews" className="tl-button">Read all reviews <ArrowUpRight size={16}/></Link><Link href="/reviews" className="tl-link">Write a review <ArrowUpRight size={16}/></Link></div>
  </section>;
}
