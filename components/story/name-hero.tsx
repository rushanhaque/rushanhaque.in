'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
// Phone address bars resize the viewport while scrolling; re-measuring then makes scrubbed scenes jump.
ScrollTrigger.config({ ignoreMobileResize: true });

// "Developer" resolves out of code first, then "& writer." joins it. They hold, then play again.
function HeroRoles() {
  const dev = useRef<HTMLSpanElement>(null);
  const wri = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();
  useEffect(() => {
    const d = dev.current, w = wri.current;
    if (!d || !w || reduced) return;
    const chars = 'abcdefghijklmnopqrstuvwxyz{}[]()<>/=;:.*+-_';
    const word = (el: HTMLElement, code: string, text: string, serif: boolean) => {
      const tl = gsap.timeline();
      tl.call(() => { el.className = 'tl-role is-code' + (serif ? ' is-serif-slot' : ''); el.textContent = ''; })
        .to(el, { duration: .7, ease: 'none', scrambleText: { text: code, chars, speed: .9, revealDelay: .1 } })
        .call(() => { el.className = 'tl-role' + (serif ? ' is-serif' : ''); })
        .to(el, { duration: .9, ease: 'none', scrambleText: { text, chars, speed: .6, revealDelay: .2 } });
      return tl;
    };
    // The first pass waits for the name to finish flipping in.
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .3, delay: 2.6 });
    tl.call(() => { d.textContent = ''; w.textContent = ''; })
      .add(word(d, '<developer />', 'Developer', false))
      .add(word(w, '// & writer', '& writer.', true), '+=.15')
      .to({}, { duration: 3.2 });
    // Off screen the loop rests.
    const st = ScrollTrigger.create({ trigger: d, start: 'top bottom', end: 'bottom top', onToggle: self => { if (self.isActive) tl.resume(); else tl.pause(); } });
    return () => { st.kill(); tl.kill(); d.textContent = 'Developer'; d.className = 'tl-role'; w.textContent = '& writer.'; w.className = 'tl-role is-serif'; };
  }, [reduced]);
  return <p className="tl-hero-roles"><span className="sr-only">Developer and writer.</span><span className="tl-role" ref={dev} aria-hidden="true">Developer</span>{' '}<span className="tl-role is-serif" ref={wri} aria-hidden="true">&amp; writer.</span></p>;
}

// The name, set large, flipping into place letter by letter like a departure board each
// time the site opens (pure CSS, so it starts with the first paint; the intro holds it
// until the curtain opens). Behind it, a writer's manuscript and a developer's code.
// As you leave, the name tips back like a drawing laid on the table, and lifts away.
export function NameHero() {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const ctx = gsap.context(() => {
      const phone = window.matchMedia('(max-width: 799px)').matches;
      gsap.set('.tl-hero-plane', { transformPerspective: 1600, transformOrigin: '50% 50%' });
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: .4 } })
        .to('.tl-hero-plane', { rotateX: phone ? 38 : 50, rotateZ: phone ? -10 : -18, scale: phone ? .9 : .82, yPercent: -6, duration: .65 }, 0)
        .to('.tl-hero-plane', { opacity: 0, yPercent: -16, duration: .35 }, .65)
        .to('.tl-hero-art', { scale: 1.12, yPercent: 8, duration: 1 }, 0);
    }, section);
    return () => ctx.revert();
  }, [reduced]);

  let i = 0;
  const word = (w: string) => <span className="tl-name-w">{[...w].map(c => <span key={i} className="ch" style={{ '--i': i++ } as React.CSSProperties}>{c}</span>)}</span>;
  return <section className="tl-hero is-name" ref={root} data-chapter="Prologue">
    <img className="tl-hero-art" src="/images/bg/desk.svg" alt="" aria-hidden="true" width="1600" height="1000" decoding="async" fetchPriority="low"/>
    <div className="tl-hero-plane">
      <h1 className="tl-hero-name">
        <span className="sr-only">Rushan Haque, website designer and developer</span>
        <span className="tl-name" aria-hidden="true">{word('Rushan')} {word('Haque')}</span>
      </h1>
      <HeroRoles/>
    </div>
  </section>;
}
