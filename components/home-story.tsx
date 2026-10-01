'use client';
import { LiquidHover } from '@/components/liquid-hover';
import profile from '@/content/profile.json';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Star } from 'lucide-react';
import Link from '@/components/site-link';
import { useContent } from '@/components/content-provider';
import { useMotion } from '@/components/site-motion';
import { responsive } from '@/lib/images';
import { stats } from '@/lib/content';

gsap.registerPlugin(ScrollTrigger);

export function SectionHead({ id, kicker, title, accent, children }: { id?: string; kicker: string; title: string; accent: string; children?: React.ReactNode }) {
  return <header className="story-head"><span className="story-kicker">{kicker}</span><h2 id={id} data-split>{title} <em>{accent}</em></h2>{children}</header>;
}

/* 01 — Selected works: a pinned horizontal reel that the page scrolls through. */
export function WorksReel() {
  const { projects } = useContent();
  const works = projects.filter(p => p.category === 'Client work' && p.image).slice(0, 5);
  const root = useRef<HTMLElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 640px)', () => {
      const track = section.querySelector<HTMLElement>('.reel-track')!;
      const cards = gsap.utils.toArray<HTMLElement>('.reel-card', section);
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);
      section.classList.add('is-pinned');
      let travel = distance();
      let step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      const tween = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 20,
          onRefresh: () => { travel = distance(); step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1; },
          onUpdate: self => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            if (count.current) count.current.textContent = String(Math.min(works.length, Math.round(self.progress * travel / Math.max(1, step)) + 1)).padStart(2, '0');
          },
        },
      });
      // Keyboard users: bring a focused card into view along the reel.
      const focus = (event: FocusEvent) => {
        const card = (event.target as Element).closest<HTMLElement>('.reel-card, .reel-end');
        const st = tween.scrollTrigger;
        if (!card || !st) return;
        const ratio = Math.min(1, card.offsetLeft / Math.max(1, track.scrollWidth - section.clientWidth));
        window.scrollTo({ top: st.start + ratio * (st.end - st.start), behavior: 'instant' });
      };
      section.addEventListener('focusin', focus);
      let disposed = false;
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(() => { if (!disposed) refresh(); });
      return () => { disposed = true; section.removeEventListener('focusin', focus); section.classList.remove('is-pinned'); };
    });
    return () => mm.revert();
  }, [reduced, works.length]);

  return <section id="selected-work" className="works-reel" data-scene="forest" ref={root} aria-labelledby="works-title">
    <div className="reel-head">
      <span className="story-kicker">01 / SELECTED WORKS</span>
      <h2 id="works-title" data-split>Built to <em>belong.</em></h2>
      <p>Different worlds. A considered approach to each.<br/>Selected websites, designed and developed end to end.</p>
      <div className="reel-count" aria-hidden="true"><span ref={count}>01</span> / {String(works.length).padStart(2, '0')}<i><span ref={bar}/></i></div>
      <span className="reel-touch-hint">SWIPE TO EXPLORE <span>{String(works.length).padStart(2, '0')} SELECTED PROJECTS →</span></span>
    </div>
    <div className="reel-track">
      {works.map((work, i) => <article className="reel-card" key={work.slug}>
        <Link href={`/projects/${work.slug}`} className="reel-media" data-cursor="Explore" aria-label={`${work.title} — project details`}>
          {work.image
            ? <LiquidHover><img src={work.image} {...responsive(work.image, '(max-width: 899px) 88vw, 62vw')} alt="" width="1600" height="780" loading="lazy" decoding="async"/></LiquidHover>
            : <div className="reel-cover"><span>W/{String(i + 1).padStart(2, '0')}</span><strong>{work.title}</strong><span>{work.status.toUpperCase()}</span></div>}
        </Link>
        <div className="reel-meta">
          <span className="reel-index">W/{String(i + 1).padStart(2, '0')}</span>
          <h3>{work.title}</h3>
          <span className="reel-kind">Design & development <span> / {work.year}</span></span>
          {work.url && work.status !== 'Coming soon'
            ? <a className="reel-visit roll-host" href={work.url} target="_blank" rel="noopener noreferrer">Visit site <ArrowUpRight size={14}/></a>
            : work.status === 'Completed'
              ? <Link className="reel-visit" href={`/projects/${work.slug}`}>View project <ArrowUpRight size={14}/></Link>
              : <span className="reel-soon">{work.status}</span>}
        </div>
      </article>)}
      <div className="reel-end">
        <span className="story-kicker">CURIOSITY DOESN’T STOP HERE</span><p><strong>There’s more<br/>to the story.</strong></p><p className="reel-end-note">Client work, independent projects, and ideas made real. Explore the full collection.</p>
        <Link href="/projects" className="button primary">Open the archive <ArrowUpRight size={16}/></Link>
      </div>
    </div>
  </section>;
}

/* 02 — By the numbers: odometer wheels spin up to each figure, and spin again on hover. */
function Odometer({ value }: { value: number }) {
  return <span className="odo" role="img" aria-label={String(value)}>{String(value).split('').map((digit, i) => <span className="odo-digit" aria-hidden="true" key={i}>
    <span className="odo-strip" data-digit={digit} style={{ '--d': digit } as React.CSSProperties}>{Array.from({ length: 20 }, (_, k) => <span key={k}>{k % 10}</span>)}</span>
  </span>)}</span>;
}

export function Numbers() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      const strips = gsap.utils.toArray<HTMLElement>('.odo-strip');
      const target = (strip: HTMLElement) => -(10 + Number(strip.dataset.digit)) * 5;
      gsap.fromTo(strips, { y: 0, yPercent: 0 }, { yPercent: i => target(strips[i]), duration: 2.4, ease: 'expo.out', stagger: .09, scrollTrigger: { trigger: '.stats-grid', start: 'top 85%', once: true } });
      gsap.from('.stat', { y: 60, opacity: 0, stagger: .1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%', once: true } });
      gsap.from('.stat-rule', { scaleX: 0, transformOrigin: 'left', stagger: .1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%', once: true } });
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  return <section className="numbers fx-dots" id="numbers" data-scene="paper" ref={root} aria-labelledby="numbers-title">
    <header className="story-head"><span className="story-kicker">02 / THE PRACTICE IN PERSPECTIVE</span><h2 id="numbers-title" data-split>Always a <em>student.</em></h2><p>Building, learning, and connecting ideas across disciplines. A few markers along the way.</p></header>
    <div className="stats-grid">{stats.map(stat => <div className="stat" key={stat.label}><i className="stat-rule"/><strong><Odometer value={stat.value}/>{!stat.plain && <em>+</em>}</strong><span>{stat.label}</span></div>)}</div>
  </section>;
}

/* 04 — Tie-ups: the intro holds while six services unfold beside it. */
export function TieUps() {
  const { services } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.tieup-card').forEach((card, i) => {
        gsap.from(card, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', delay: (i % 2) * .08, clearProps: 'transform,opacity', scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
        gsap.from(card.querySelector('.tieup-number'), { yPercent: 100, duration: .9, ease: 'power3.out', delay: .2 + (i % 2) * .08, scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
      });
    }, section);
    return () => ctx.revert();
  }, [reduced]);
  return <section className="tieups" id="services" data-scene="sage" ref={root} aria-labelledby="tieups-title">
    <div className="tieups-intro">
      <span className="story-kicker">04 / TIE-UPS & OTHER SERVICES</span>
      <h2 id="tieups-title" data-split>Beyond the <em>build.</em></h2>
      <p>Through vetted partners, the work extends past launch.</p>
      <p>Growth, infrastructure, and the systems that run behind the scenes — scoped and delivered alongside people I trust.</p>
      <Link href="/contact" className="button primary">Talk it through <ArrowUpRight size={16}/></Link>
    </div>
    <div className="tieups-grid">{services.map((service, i) => <article className="tieup-card fx-spot fx-edge" data-tilt="soft" key={service.title}>
      <span className="tieup-number"><span>{String(i + 1).padStart(2, '0')}</span></span>
      <span className="tieup-tag">{service.subtitle}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
    </article>)}</div>
  </section>;
}

/* 05 — Journey: a line draws down the timeline and lights each role as it passes. */
export function Journey() {
  const { experience, education } = useContent();
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    section.classList.add('is-live');
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.journey-column').forEach(column => {
        gsap.fromTo(column.querySelector('.journey-line'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: column.querySelector('ol'), start: 'top 65%', end: 'bottom 55%', scrub: .6 } });
        column.querySelectorAll<HTMLElement>('.journey-item').forEach(item => ScrollTrigger.create({ trigger: item, start: 'top 62%', onEnter: () => item.classList.add('is-lit'), onLeaveBack: () => item.classList.remove('is-lit') }));
      });
    }, section);
    return () => { ctx.revert(); section.classList.remove('is-live'); };
  }, [reduced]);
  const column = (label: string, items: { title: string; place: string; detail: string; period: string }[]) => <div className="journey-column">
    <span className="journey-label">{label}</span>
    <div className="journey-rail"><i className="journey-line"/>
      <ol>{items.map((item, i) => <li className="journey-item" data-year={item.period.match(/20\d\d/)?.[0] ?? ''} key={item.title + item.place}>
        <span className="journey-dot" aria-hidden="true"/>
        <span className="journey-index">{String(i + 1).padStart(2, '0')}</span>
        <div><h3>{item.title}</h3><span className="journey-place">{item.place}</span>{item.detail && <p>{item.detail}</p>}</div>
        <span className="journey-period">{item.period}</span>
      </li>)}</ol>
    </div>
  </div>;
  return <section className="journey fx-dots" id="journey" data-scene="paper" ref={root} aria-labelledby="journey-title">
    <SectionHead id="journey-title" kicker="05 / JOURNEY" title="A practice in" accent="progress."><p>Products, interfaces, research, long-form writing. Here’s how it went.</p></SectionHead>
    <div className="journey-profile"><img src={profile.portrait} alt="Rushan Haque" width="853" height="878" loading="lazy"/><div><span className="eyebrow">{profile.location}</span><p>{profile.bio}</p><span className="profile-languages">Working across {profile.languages.join(' · ')}</span></div></div><div className="journey-grid">
      {column('[01] EXPERIENCE', experience.map(e => ({ title: e.role, place: e.company, detail: e.description, period: e.period })))}
      {column('[02] EDUCATION', education.map(e => ({ title: e.title, place: e.institution, detail: '', period: e.detail })))}
    </div>
    <Link href="/certifications" className="text-link journey-more">Credentials & experience <ArrowUpRight size={16}/></Link>
  </section>;
}

/* Reviews move only while visible, with a persistent pause control. */
export function ReviewsWall() {
  const { reviews } = useContent();
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const loop = useRef<gsap.core.Tween | null>(null);
  const pausePreference = useRef(false);
  const { reduced } = useMotion();
  const ratings = reviews.map(r => Number(r.rating)).filter(n => n > 0);
  const average = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '';

  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (hover: hover)', () => {
      section.classList.add('reviews-animated');
      loop.current = gsap.to(section.querySelector('.rw-inner'), { xPercent: -50, ease: 'none', duration: 85, repeat: -1, paused: true });
      let visible = false;
      const row = section.querySelector<HTMLElement>('.rw-row')!;
      const sync = () => loop.current?.paused(!visible || pausePreference.current || document.hidden || row.matches(':hover'));
      const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
      observer.observe(section);
      row.addEventListener('pointerenter', sync);
      row.addEventListener('pointerleave', sync);
      document.addEventListener('visibilitychange', sync);
      gsap.from('.rw-score strong', { yPercent: 100, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.rw-score', start: 'top 85%', once: true } });
      gsap.from('.rw-stars svg', { scale: 0, rotate: -90, stagger: .08, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '.rw-score', start: 'top 85%', once: true } });
      return () => { observer.disconnect(); row.removeEventListener('pointerenter', sync); row.removeEventListener('pointerleave', sync); document.removeEventListener('visibilitychange', sync); loop.current = null; section.classList.remove('reviews-animated'); };
    }, section);
    return () => mm.revert();
  }, [reduced]);

  const card = (review: typeof reviews[number], key: string) => <figure className="rw-card fx-bloom" key={key}>
    <div className="rw-card-top"><span className="rw-card-stars" aria-label={`${review.rating || 5} out of 5`}>{'★★★★★'}</span><span>{review.rating}</span></div>
    <blockquote>{review.quote}</blockquote>
    <figcaption><span className="review-avatar">{review.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('')}</span><span><strong>{review.name}</strong><small>{[review.company, review.location].filter(Boolean).join(' · ')}</small></span><time>{review.date}</time></figcaption>
  </figure>;

  return <section className="reviews-wall" id="reviews" data-scene="forest" ref={root} aria-labelledby="reviews-title">
    <div className="rw-head">
      <SectionHead id="reviews-title" kicker="06 / IN THEIR WORDS" title="Good work." accent="Good people."/>
      {average && <div className="rw-score"><span className="rw-mask"><strong>{average}</strong></span><span>/ 5.0</span><span className="rw-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={18} fill="currentColor" strokeWidth={0}/>)}</span><small>{reviews.length} REVIEWS · COLLECTED DIRECT · PUBLISHED UNEDITED</small></div>}
    </div>
    <div className="rw-row"><div className="rw-inner"><div className="rw-group">{reviews.map((r, i) => card(r, `a${i}`))}</div><div className="rw-group rw-copy" aria-hidden="true">{reviews.map((r, i) => card(r, `b${i}`))}</div></div></div>
    <div className="rw-actions"><Link href="/reviews" className="button primary">Read all reviews <ArrowUpRight size={16}/></Link><Link href="/write-a-review" className="text-link">Leave a few words <ArrowUpRight size={16}/></Link><button type="button" className="review-pause" aria-pressed={paused} onClick={() => { pausePreference.current = !paused; setPaused(!paused); loop.current?.paused(!paused); }}>{paused ? 'Resume motion' : 'Pause motion'}</button></div>
  </section>;
}
