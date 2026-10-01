'use client';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import data from '@/content/studies/constraints.json';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { responsive } from '@/lib/images';
import { StudyFrame } from '@/components/studies/study-frame';

gsap.registerPlugin(Flip);
type Story = { story: string; source: string; confirmed: boolean };

// Study 05 — pick the constraints you're facing; the projects that solved them
// rise to the top and say how. Cards move with FLIP, so nothing jumps.
export function ConstraintStudy() {
  const { projects } = useContent();
  const { reduced } = useMotion();
  const [picked, setPicked] = useState<string[]>([]);
  const grid = useRef<HTMLDivElement>(null);
  const flip = useRef<Flip.FlipState | null>(null);

  const cards = useMemo(() => data.projects.map((entry, order) => {
    const p = projects.find(x => x.slug === entry.slug);
    return p ? { ...p, order, constraints: entry.constraints as Record<string, Story> } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x), [projects]);

  const ranked = useMemo(() => cards.map(card => ({ card, matches: picked.filter(k => card.constraints[k]) }))
    .sort((a, b) => b.matches.length - a.matches.length || Number(b.card.year) - Number(a.card.year) || a.card.order - b.card.order), [cards, picked]);

  const matching = ranked.filter(r => r.matches.length > 0);
  const best = picked.length ? matching[0]?.card.title : undefined;
  const labels = Object.fromEntries(data.chips.map(c => [c.key, c.label]));

  const toggle = (key: string) => {
    if (!reduced && grid.current) flip.current = Flip.getState(grid.current.querySelectorAll('.cm-card'));
    setPicked(cur => cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
  };
  useLayoutEffect(() => {
    if (!flip.current) return;
    const tween = Flip.from(flip.current, { duration: .75, ease: 'expo.out', scale: true, nested: true, simple: true });
    flip.current = null;
    return () => { tween.kill(); };
  }, [picked]);

  const message = picked.length
    ? `Hi Rushan, my project has these constraints: ${picked.map(k => labels[k]).join(', ')}. `
    : 'Hi Rushan, here’s the constraint my project is facing: ';
  const readout = <><b>{picked.length} CONSTRAINT{picked.length === 1 ? '' : 'S'}</b><span>{matching.length} MATCHING PROJECT{matching.length === 1 ? '' : 'S'}</span><span>BEST FIT: {best ? best.toUpperCase() : '—'}</span></>;

  return <StudyFrame id="study-05" number="05" name="BRING ME A PROBLEM" title={<>Tell me what’s<br/>in the way. <em>I’ve likely solved it.</em></>}
    truth="Whatever’s in your way, I’ve likely met it before. Here’s the proof."
    readout={readout} announce={picked.length ? `${matching.length} matching projects${best ? `, best fit ${best}` : ''}` : 'No constraints selected'}
    controls={<div className="study-chips cs-chips" role="group" aria-label="Your constraints">{data.chips.map(c => <button key={c.key} type="button" aria-pressed={picked.includes(c.key)} onClick={() => toggle(c.key)}>{c.label}</button>)}{picked.length > 0 && <button type="button" className="cs-clear" onClick={() => { if (!reduced && grid.current) flip.current = Flip.getState(grid.current.querySelectorAll('.cm-card')); setPicked([]); }}>Clear</button>}</div>}
    caption={<p>Pick constraints. Projects that met them rise; the rest step back.</p>}
    className="study-constraints">
    <div className="cs-grid" ref={grid}>
      {ranked.map(({ card, matches }) => <article key={card.slug} data-flip-id={card.slug} className={`cm-card ${picked.length && !matches.length ? 'is-dim' : ''} ${matches.length ? 'is-match' : ''}`}>
        <Link href={`/projects/${card.slug}`} className="cs-media" tabIndex={-1} aria-hidden="true">{card.image && <img src={card.image} {...responsive(card.image, '(max-width: 700px) 90vw, 30vw')} alt="" loading="lazy" decoding="async"/>}</Link>
        <div className="cs-body">
          <div className="cs-top"><h3><Link href={`/projects/${card.slug}`}>{card.title}</Link></h3><span>{card.year}</span></div>
          {matches.length > 0 ? <ul className="cs-stories">{matches.map(k => <li key={k}><span>{labels[k]}</span>{card.constraints[k].story}</li>)}</ul>
            : <p className="cs-quiet">{Object.keys(card.constraints).length ? `${Object.keys(card.constraints).map(k => labels[k]).join(' · ')}` : card.discipline}</p>}
        </div>
      </article>)}
      <Link data-flip-id="cs-ask" href={`/contact?message=${encodeURIComponent(message)}`} className="cm-card cs-ask"><span>Not listed?</span><strong>Tell me your constraint <ArrowUpRight size={20}/></strong>{picked.length > 0 && <small>I’ll include your {picked.length} picks.</small>}</Link>
    </div>
  </StudyFrame>;
}
