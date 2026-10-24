'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { responsive } from '@/lib/images';
import { placementOf, projectAccess, projectLink } from '@/lib/project-access';
import { hostOf, storyOf } from '@/lib/work-stories';
import { BrowserShot, DraftWindow } from '@/components/works-showcase';
import { AuditCard } from '@/components/story/audit-card';
import { LiquidWindow } from '@/components/story/liquid-window';

gsap.registerPlugin(ScrollTrigger, SplitText);
const two = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Intro (on /about): what a good website does, in one sentence    */
/* that lights up as you read it, with real sites set into the line.   */
/* ------------------------------------------------------------------ */
type Piece = string | { em: string } | { img: string; cap: string };
const STORY: Piece[] = [
  'A good website', { img: '/images/pill/taif.webp', cap: 'taifinternational.co' }, 'loads in a blink on any phone,', { img: '/images/pill/erfolg.webp', cap: 'erfolgliving.com' }, 'shows up when people search,', { img: '/images/pill/casa.webp', cap: 'casaandcrop.com' },
  'and turns visitors into', { em: 'customers.' }, 'I design and build websites like that, from scratch,', { img: '/images/pill/velora.webp', cap: 'veloralivings.in' }, 'from the first conversation', { em: 'to long after launch.' },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      // Walk the sentence in reading order, so each picture opens exactly where it sits.
      // A phone screen is short, so there the sentence finishes lighting while it is still in view.
      const phone = window.matchMedia('(max-width: 899px)').matches;
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.tl-mf-text', start: phone ? 'top 88%' : 'top 78%', end: phone ? 'bottom 66%' : 'bottom 52%', scrub: .6 } });
      section.querySelectorAll<HTMLElement>('.tl-mf-text > *').forEach(el => {
        if (el.classList.contains('tl-mf-pill')) tl.fromTo(el, { clipPath: 'inset(0 50% 0 50% round 999px)' }, { clipPath: 'inset(0 0% 0 0% round 999px)', duration: .6 }, '>-0.2').fromTo(el.querySelector('img'), { scale: 1.6 }, { scale: 1, duration: .8 }, '<');
        else tl.fromTo(el, { opacity: .14 }, { opacity: 1, duration: .3 }, '>-0.22');
      });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  let key = 0;
  return <section id="story" className="tl-mf" ref={root} data-chapter="I — Intro">
    <span className="tl-kicker">I — INTRO</span>
    <p className="tl-mf-text">{STORY.flatMap(piece => {
      if (typeof piece === 'string') return piece.split(' ').map(w => <span className="tl-mf-w" key={key++}>{w} </span>);
      if ('em' in piece) return piece.em.split(' ').map(w => <span className="tl-mf-w is-em" key={key++}><em>{w}</em> </span>);
      return [<span className="tl-mf-pill" key={key++}><img src={piece.img} alt="" width="400" height="160" loading="lazy" decoding="async"/><span className="tl-mf-cap">{piece.cap}</span></span>];
    })}</p>
  </section>;
}

// A title set letter by letter (each carries its index as --c), kept whole word by word.
function Letters({ text }: { text: string }) {
  let c = 0;
  return <span aria-hidden="true">{text.split(' ').map((word, w) => <span key={w}>{w > 0 && ' '}<span className="wd">{[...word].map(ch => <span key={c} className="ch" style={{ '--c': c++ } as React.CSSProperties}>{ch}</span>)}</span></span>)}</span>;
}

/* ------------------------------------------------------------------ */
/* I — Recent works: the stories scroll on the left while a browser  */
/* window holds still on the right and changes site as each one passes. */
/* ------------------------------------------------------------------ */
export function SelectedWork() {
  const { projects } = useContent();
  const works = projects.filter(p => placementOf(p) === 'work' && p.image);
  const list = useRef<HTMLOListElement>(null);
  const stage = useRef<HTMLAnchorElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();

  // The chapter crossing the middle of the screen is the one in the window.
  useEffect(() => {
    const items = Array.from(list.current?.children ?? []) as HTMLElement[];
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }), { rootMargin: '-48% 0px -48% 0px' });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, [works.length]);

  // On a desktop the window opens like a shutter the first time it comes into view,
  // the site inside settling from a zoom.
  useEffect(() => {
    const win = stage.current;
    if (!win || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      gsap.timeline({ scrollTrigger: { trigger: win, start: 'top 88%', once: true } })
        .fromTo(win.querySelector('.wk-shot'), { clipPath: 'inset(16% 12% 16% 12% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.7, ease: 'expo.inOut', clearProps: 'clipPath' })
        .fromTo(win.querySelector('.tl-sw-frames'), { scale: 1.35 }, { scale: 1, duration: 2.1, ease: 'expo.out', clearProps: 'transform' }, 0);
    });
    return () => mm.revert();
  }, [reduced]);

  const current = works[active];
  if (!current) return null;
  return <section id="selected-work" className="tl-sw" data-chapter="I — Recent works">
    <div className="tl-sw-head">
      <span className="tl-kicker">I — RECENT WORKS</span>
      <h2 suppressHydrationWarning>Recent <em>works.</em></h2>
    </div>
    <div className="tl-sw-body">
      <ol className="tl-sw-list" ref={list}>{works.map((w, i) => {
        const story = storyOf(w), visit = projectAccess(w) === 'visit', host = hostOf(w.url);
        return <li key={w.slug} data-i={i} className={i === active ? 'is-on' : ''}>
          <Link {...projectLink(w)} className="tl-sw-item">
            <span className="tl-sw-shot"><BrowserShot project={w} sizes="(max-width: 1023px) 92vw, 1px"/></span>
            <span className="tl-sw-n">{two(i + 1)}<i/>{story.field}</span>
            <span className="tl-sw-title"><span className="sr-only">{w.title}</span><Letters text={w.title}/></span>
            <span className="tl-sw-line"><em>{story.line}</em></span>
            <span className="tl-sw-visit">{visit && host ? `Visit ${host}` : 'About the project'}<ArrowUpRight size={16}/>{visit && <span className="sr-only"> (opens in a new tab)</span>}</span>
          </Link>
        </li>;
      })}</ol>
      <div className="tl-sw-stage">
        <Link {...projectLink(current)} className="tl-sw-window" ref={stage} tabIndex={-1} aria-hidden="true">
          <span className="wk-shot">
            <span className="wk-bar"><i/><i/><i/><span key={current.slug}>{hostOf(current.url) || current.title.toLowerCase()}</span></span>
            <span className="tl-sw-frames">{works.map((w, i) => <span key={w.slug} className={i < active ? 'is-past' : i === active ? 'is-on' : ''}>
              <img src={w.image!} {...responsive(w.image, '(max-width: 1023px) 1px, 56vw')} alt="" width="1600" height="772" loading="lazy" decoding="async"/>
            </span>)}<LiquidWindow sources={works.map(w => w.image).join('|')} active={active}/></span>
          </span>
          <span className="tl-sw-cursor">{projectAccess(current) === 'visit' ? 'Visit site' : 'View project'}<ArrowUpRight size={15}/></span>
        </Link>
        <div className="tl-sw-meter" aria-hidden="true">
          <b>{two(active + 1)}</b><span>/ {two(works.length)}</span>
          <i><span style={{ transform: `scaleX(${(active + 1) / works.length})` }}/></i>
          <small key={current.slug}>{current.status}</small>
        </div>
      </div>
    </div>
    <div className="tl-sw-foot">
      <Link href="/projects" className="tl-sw-all"><span>All <em>works</em></span><b><span data-count>{two(works.length)}</span><ArrowUpRight size={30} strokeWidth={1.5}/></b></Link>
    </div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* VI — Next in line: the one closing ask. Leave your website and an    */
/* email, and I send back an audit. A forest card opens as it arrives.  */
/* ------------------------------------------------------------------ */
export function Encore() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.tl-close-card', { clipPath: 'inset(12% 7% 12% 7% round 64px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 35%', scrub: .6 } });
      const title = section.querySelector<HTMLElement>('.tl-close-title')!;
      const split = SplitText.create(title, { type: 'chars,words', charsClass: 'tl-close-ch' });
      gsap.from(split.chars, { rotateX: -100, yPercent: 40, opacity: 0, transformOrigin: '50% 100% -20px', duration: 1.2, ease: 'expo.out', stagger: .028, scrollTrigger: { trigger: title, start: 'top 85%', once: true }, onComplete: () => { split.revert(); (window as Window & { __fitHeadings?: () => void }).__fitHeadings?.(); } });
      gsap.from('.tl-close-copy > :not(h2):not(.tl-kicker)', { opacity: 0, y: 28, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.tl-close-copy', start: 'top 80%', once: true } });
    }, section);
    let timer = 0;
    const ro = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(() => ScrollTrigger.refresh(), 250); });
    ro.observe(section.parentElement!);
    return () => { ctx.revert(); ro.disconnect(); clearTimeout(timer); };
  }, [reduced]);
  return <section id="next" className="tl-close" ref={root} data-chapter="VI — Your website">
    <div className="tl-close-card spot">
      <svg className="tl-close-lines" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="is-a">{Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx="400" cy="400" rx={50 + i * 44} ry="360"/>)}</g>
        <g className="is-b">{Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx="400" cy="400" rx="380" ry={36 + i * 50}/>)}</g>
      </svg>
      <div className="tl-close-copy">
        <span className="tl-kicker">VI — YOUR WEBSITE</span>
        <h2 className="tl-close-title" suppressHydrationWarning>Your business, <em>next in line.</em></h2>
        <p>Send me your website and I will send back a free audit.</p>
        <AuditCard/>
      </div>
    </div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* III — Currently working on: what is on the desk right now, as cards. */
/* ------------------------------------------------------------------ */
export function CurrentlyBuilding() {
  const { projects } = useContent();
  const items = projects.filter(p => placementOf(p) === 'building');
  if (!items.length) return null;
  return <section id="currently" className="tl-now" data-chapter="III — Currently working on">
    <div className="tl-now-head">
      <span className="tl-kicker"><i className="tl-live-dot"/>III — CURRENTLY WORKING ON</span>
      <h2 suppressHydrationWarning>Currently <em>working on.</em></h2>
    </div>
    <ul className="tl-now-grid">{items.map(p => <li key={p.slug}>
      <Link {...projectLink(p)} className="tl-now-card spot">
        <DraftWindow project={p} sizes="(max-width: 899px) 92vw, 40vw"/>
        <span className="tl-now-body"><span className="tl-now-status">{p.status}</span><strong>{p.title}</strong><span className="tl-now-line">{storyOf(p).line}</span></span>
        <ArrowUpRight className="tl-now-go" size={22} strokeWidth={1.5}/>
      </Link>
    </li>)}</ul>
  </section>;
}
