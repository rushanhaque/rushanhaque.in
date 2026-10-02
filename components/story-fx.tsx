'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+×·';

// Decodes an element's text from random glyphs, left to right.
export function scramble(el: HTMLElement, duration = 700) {
  const final = el.dataset.text ?? (el.dataset.text = el.textContent ?? '');
  if (el.dataset.scrambling) return;
  el.dataset.scrambling = '1';
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', final);
  const start = performance.now();
  const frame = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const settled = Math.floor(progress * final.length);
    el.textContent = [...final].map((char, i) => i < settled || char === ' ' ? char : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
    if (progress < 1) requestAnimationFrame(frame);
    else { el.textContent = final; delete el.dataset.scrambling; }
  };
  requestAnimationFrame(frame);
}

type Scene = 'forest' | 'paper' | 'sage';
const scenes: Record<Scene, { bg: string; fg: string }> = {
  forest: { bg: '#07241a', fg: '#f3f3de' },
  paper: { bg: '#fbfcf8', fg: '#07241a' },
  sage: { bg: '#eae8e4', fg: '#07241a' },
};

// Each chapter marked `data-scene` morphs the page from the previous chapter's
// colours into its own as it rises into view, so chapters flow instead of cut.
export function SceneColors() {
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced) return;
    const sections = gsap.utils.toArray<HTMLElement>('main [data-scene]');
    const tweens = sections.slice(1).map((section, i) => {
      const from = scenes[sections[i].dataset.scene as Scene], to = scenes[section.dataset.scene as Scene];
      if (!from || !to || from === to) return null;
      return gsap.fromTo(section, { backgroundColor: from.bg, color: from.fg }, { backgroundColor: to.bg, color: to.fg, ease: 'none', immediateRender: false, scrollTrigger: { trigger: section, start: 'top 92%', end: 'top 30%', scrub: true } });
    });
    return () => {
      tweens.forEach(t => { t?.scrollTrigger?.kill(); t?.kill(); });
      sections.forEach(s => { s.style.removeProperty('background-color'); s.style.removeProperty('color'); });
    };
  }, [reduced]);
  return null;
}

// A full-screen pause between chapters: the sentence holds still while it
// lights up word by word, sharpening out of a blur as you scroll through it.
export function Interlude({ kicker, text, accent }: { kicker: string; text: string; accent?: string }) {
  const root = useRef<HTMLElement>(null);
  const { reduced } = useMotion();
  const words = text.split(' ');
  useEffect(() => {
    const section = root.current;
    if (!section || reduced) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 640px)', () => {
      section.classList.add('is-live');
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      tl.fromTo('.iw', { opacity: .22, yPercent: 20 }, { opacity: 1, yPercent: 0, stagger: .12, ease: 'power2.out', duration: .6 })
        .fromTo('.interlude-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: words.length * .12 + .5 }, 0)
        .to('.interlude-ghost', { xPercent: -30, ease: 'none', duration: words.length * .12 + .5 }, 0);
      return () => section.classList.remove('is-live');
    }, section);
    return () => mm.revert();
  }, [reduced, words.length]);
  return <section className="interlude" data-scene="forest" ref={root} aria-label={text}>
    <div className="interlude-sticky">
      <span className="interlude-ghost" aria-hidden="true">{accent ?? words[words.length - 1]}</span>
      <span className="story-kicker">{kicker}</span>
      <p aria-hidden="true">{words.map((word, i) => <span className="iw" key={i}>{word}</span>)}</p>
      <i className="interlude-rule" aria-hidden="true"/>
    </div>
  </section>;
}

// Headings flip up character by character from their baseline; chapter labels decode.
export function HeadingChoreography() {
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced) return;
    const splits: SplitText[] = [];
    const triggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>('h2[data-split]').forEach(heading => {
      const readable = heading.innerText.replace(/\s+/g, ' ').trim();
      splits.push(SplitText.create(heading, { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', autoSplit: true, onSplit: self => {
        heading.setAttribute('aria-label', readable);
        return gsap.from(self.chars, { rotateX: -95, yPercent: 60, opacity: 0, transformOrigin: '50% 100% -12px', transformPerspective: 600, duration: 1.1, ease: 'expo.out', stagger: { each: .022, from: 'start' }, scrollTrigger: { trigger: heading, start: 'top 86%', once: true } });
      } }));
    });
    document.querySelectorAll<HTMLElement>('.story-kicker').forEach(label => triggers.push(ScrollTrigger.create({ trigger: label, start: 'top 92%', once: true, onEnter: () => scramble(label, 900) })));
    return () => { splits.forEach(s => s.revert()); triggers.forEach(t => t.kill()); };
  }, [reduced]);
  return null;
}

// The footer sign-off rises letter by letter and ripples when hovered.
export function FooterFinale() {
  const { reduced } = useMotion();
  useEffect(() => {
    const link = document.querySelector<HTMLElement>('.footer-big-link');
    if (!link || reduced) return;
    const split = SplitText.create(link.querySelectorAll('.footer-big-line'), { type: 'chars', charsClass: 'finale-char' });
    const reveal = gsap.from(split.chars, { yPercent: 110, rotate: 12, opacity: 0, duration: 1, ease: 'expo.out', stagger: .025, scrollTrigger: { trigger: link, start: 'top 90%', once: true } });
    const wave = () => gsap.fromTo(split.chars, { yPercent: 0 }, { yPercent: -18, duration: .28, ease: 'power2.out', yoyo: true, repeat: 1, stagger: .018, overwrite: true });
    link.addEventListener('pointerenter', wave);
    return () => { link.removeEventListener('pointerenter', wave); reveal.scrollTrigger?.kill(); reveal.kill(); split.revert(); };
  }, [reduced]);
  return null;
}
