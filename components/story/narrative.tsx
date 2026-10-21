'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { bookingUrl } from '@/lib/content';
import { responsive } from '@/lib/images';
import { placementOf, projectAccess, projectLink } from '@/lib/project-access';
import { hostOf, storyOf } from '@/lib/work-stories';
import { BrowserShot } from '@/components/works-showcase';
import { LiquidWindow } from '@/components/story/liquid-window';

gsap.registerPlugin(ScrollTrigger, SplitText);
const two = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* I — The short version: one sentence that lights up as you read it,  */
/* with the work itself set into the line.                             */
/* ------------------------------------------------------------------ */
type Piece = string | { em: string } | { img: string; cap: string };
const STORY: Piece[] = [
  'Moradabad has shaped', { em: 'brass' }, { img: '/images/pill/taif.webp', cap: 'Taif · brass & copper' }, 'for centuries and ships it', { img: '/images/pill/casa.webp', cap: 'Casa&Crop · 34 countries' }, 'to every corner of the world.',
  'Its makers deserve websites as finely made as', { em: 'the things they make.' }, { img: '/images/pill/erfolg.webp', cap: 'Erfolg · a copper bath' },
  'I design and build them', { img: '/images/pill/velora.webp', cap: 'Velora · hand-raised brass' }, 'from the first conversation', { em: 'to long after launch.' },
];
// The short facts under the sentence: who, how, and with whom.
const FACTS = [['Clients in', 'India, Saudi Arabia, Poland and Nepal'], ['Working over', 'Calls, WhatsApp and email, with a live preview link'], ['You speak to', 'The person writing the code']] as const;

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
      gsap.from('.tl-mf-foot > *', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '.tl-mf-foot', start: 'top 88%', once: true } });
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  let key = 0;
  return <section id="story" className="tl-mf" ref={root} data-chapter="I — The short version">
    <span className="tl-kicker">I — THE SHORT VERSION</span>
    <p className="tl-mf-text">{STORY.flatMap(piece => {
      if (typeof piece === 'string') return piece.split(' ').map(w => <span className="tl-mf-w" key={key++}>{w} </span>);
      if ('em' in piece) return piece.em.split(' ').map(w => <span className="tl-mf-w is-em" key={key++}><em>{w}</em> </span>);
      return [<span className="tl-mf-pill" key={key++}><img src={piece.img} alt="" width="400" height="160" loading="lazy" decoding="async"/><span className="tl-mf-cap">{piece.cap}</span></span>];
    })}</p>
    <div className="tl-mf-foot">
      <div className="tl-mf-stamp">
        <span className="tl-mf-seal" aria-hidden="true">
          <svg viewBox="0 0 100 100"><defs><path id="tl-mf-ring" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/></defs><text><textPath href="#tl-mf-ring">DESIGNED · CODED · HANDED OVER · </textPath></text></svg>
          <b>RH</b>
        </span>
        <span><small>Independent since 2024</small><strong><em>Moradabad, U.P.</em></strong></span>
      </div>
      <dl className="tl-mf-facts">{FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <Link href="#journey" className="tl-link">The longer version <ArrowUpRight size={16}/></Link>
    </div>
  </section>;
}

// A title set letter by letter (each carries its index as --c), kept whole word by word.
function Letters({ text }: { text: string }) {
  let c = 0;
  return <span aria-hidden="true">{text.split(' ').map((word, w) => <span key={w}>{w > 0 && ' '}<span className="wd">{[...word].map(ch => <span key={c} className="ch" style={{ '--c': c++ } as React.CSSProperties}>{ch}</span>)}</span></span>)}</span>;
}

/* ------------------------------------------------------------------ */
/* II — Selected work: the stories scroll on the left while a browser  */
/* window holds still on the right and changes site as each one passes. */
/* ------------------------------------------------------------------ */
export function SelectedWork() {
  const { projects } = useContent();
  const works = projects.filter(p => placementOf(p) === 'work' && p.image);
  const building = projects.filter(p => placementOf(p) === 'building');
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
  return <section id="selected-work" className="tl-sw" data-chapter="II — Selected work">
    <div className="tl-sw-head">
      <span className="tl-kicker">II — SELECTED WORK</span>
      <h2 suppressHydrationWarning>Made in <em>Moradabad.</em></h2>
      <p>Websites for makers and exporters, each one designed and coded from scratch. Scroll to move through them, or open one to see it live.</p>
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
            <span className="tl-sw-desc">{w.description}</span>
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
      {building.length > 0 && <Link href="/projects#building" className="tl-sw-now"><i/><span>Now building</span><b>{building.map(b => b.title).join(', ')}</b><ArrowUpRight size={16}/></Link>}
      <Link href="/projects" className="tl-sw-all"><span>All <em>works</em></span><b><span data-count>{two(works.length)}</span><ArrowUpRight size={30} strokeWidth={1.5}/></b></Link>
    </div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* IV — How it works: four steps on one line that draws itself in.     */
/* ------------------------------------------------------------------ */
const STEPS = [
  ['A conversation', 'A call or a WhatsApp message. You tell me about the business; I ask what the website has to do for it.', 'Call · WhatsApp · Email'],
  ['A fixed, written quote', 'Scope, price and timeline in writing before any work begins. No surprises later.', 'Fixed price'],
  ['Design, then code', 'You see and approve the design first. Then it is coded from scratch, and you watch it come together on a live preview link.', 'Live preview link'],
  ['Launch, and after', 'Domain, hosting and Google Search Console, all set up in your name. After launch, I am still a message away.', 'Yours to own'],
] as const;

export function Process() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { section.classList.add('is-in'); io.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(section.querySelector('.tl-steps')!);
    return () => io.disconnect();
  }, []);
  return <section id="process" className="tl-process" ref={root} data-chapter="IV — How it works">
    <div className="tl-process-head">
      <span className="tl-kicker">IV — HOW IT WORKS</span>
      <h2 suppressHydrationWarning>From hello <em>to handover.</em></h2>
      <p>One person from the first call to the last fix, so nothing gets lost between a salesperson, a designer and a developer.</p>
    </div>
    <ol className="tl-steps"><li className="tl-steps-spark" aria-hidden="true"/>{STEPS.map(([title, text, tag], i) => <li key={title} className="spot" style={{ '--i': i } as React.CSSProperties}>
      <span className="tl-step-dot" aria-hidden="true"/>
      <span className="tl-step-n">{two(i + 1)}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <small>{tag}</small>
    </li>)}</ol>
    <div className="tl-process-foot"><Link href="/connect" className="tl-button">Start with a conversation <ArrowUpRight size={16}/></Link><Link href="/website-cost-in-moradabad" className="tl-link">What a website costs <ArrowUpRight size={16}/></Link></div>
  </section>;
}

/* ------------------------------------------------------------------ */
/* X — Your chapter: the story ends on the reader. A forest card opens */
/* as it arrives, its headline flips in letter by letter like a        */
/* departure board, and a ring of words turns slowly around the way in. */
/* ------------------------------------------------------------------ */
const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
export function Encore() {
  const { projects } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  const works = projects.filter(p => placementOf(p) === 'work').length, building = projects.filter(p => placementOf(p) === 'building').length;
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.tl-close-card', { clipPath: 'inset(12% 7% 12% 7% round 64px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 25%', scrub: .6 } });
      const title = section.querySelector<HTMLElement>('.tl-close-title')!;
      const split = SplitText.create(title, { type: 'chars,words', charsClass: 'tl-close-ch' });
      gsap.from(split.chars, { rotateX: -100, yPercent: 40, opacity: 0, transformOrigin: '50% 100% -20px', duration: 1.2, ease: 'expo.out', stagger: .028, scrollTrigger: { trigger: title, start: 'top 82%', once: true }, onComplete: () => { split.revert(); (window as Window & { __fitHeadings?: () => void }).__fitHeadings?.(); } });
      gsap.from('.tl-close-copy > *', { opacity: 0, y: 30, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.tl-close-copy', start: 'top 85%', once: true } });
      gsap.fromTo('.tl-close-orb', { yPercent: 30 }, { yPercent: -20, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.tl-close-lines ellipse', { scale: .2, opacity: 0, transformOrigin: '50% 50%', duration: 2, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: section, start: 'top 70%', once: true } });
    }, section);
    // The lab above loads late and grows the page; measure the triggers again when it does.
    let timer = 0;
    const ro = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(() => ScrollTrigger.refresh(), 250); });
    ro.observe(section.parentElement!);
    return () => { ctx.revert(); ro.disconnect(); clearTimeout(timer); };
  }, [reduced]);
  return <section id="next" className="tl-close" ref={root} data-chapter="X — Your chapter">
    <div className="tl-close-card spot">
      <svg className="tl-close-lines" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="is-a">{Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx="400" cy="400" rx={50 + i * 44} ry="360"/>)}</g>
        <g className="is-b">{Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx="400" cy="400" rx="380" ry={36 + i * 50}/>)}</g>
      </svg>
      <div className="tl-close-copy">
        <span className="tl-kicker">X — YOUR CHAPTER</span>
        <h2 className="tl-close-title" suppressHydrationWarning>Your business, <em>next in line.</em></h2>
        <p>{COUNT[works] ?? works} makers have trusted me with their websites{building ? `, and ${COUNT[building]?.toLowerCase() ?? building} more ${building === 1 ? 'is' : 'are'} on the desk` : ''}. Tell me about yours and you will have a fixed, written quote before any work begins.</p>
        <div className="tl-close-actions"><Link href="/connect" className="tl-button">Start a project <ArrowUpRight size={16}/></Link><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="tl-link">Book a call <ArrowUpRight size={16}/><span className="sr-only"> (opens in a new tab)</span></a></div>
      </div>
      <Link href="/connect" className="tl-close-orb" aria-label="Start a project">
        <svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="tl-close-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text><textPath href="#tl-close-ring">START A PROJECT · START A PROJECT · </textPath></text></svg>
        <ArrowUpRight size={38} strokeWidth={1.3}/>
      </Link>
    </div>
  </section>;
}
