'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';

gsap.registerPlugin(ScrollTrigger);

// The story pages' entrances, on every screen size (phones included): each block
// arrives in its own way as it scrolls in. Headings and labels are handled by
// StoryMotion and reveal.tsx.
export function Choreography() {
  const { reduced } = useMotion();
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {});
    const watchers: IntersectionObserver[] = [];
    const once = (trigger: Element | string, start = 'top 86%') => ({ trigger, start, once: true });
    const all = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
    // Each block is set up only as it comes within a screen and a bit, so loading the page
    // never pays for animations far below. Blocks missing from a page are skipped.
    const near = (sel: string, setup: () => void) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); ctx.add(setup); }, { rootMargin: '0px 0px 120% 0px' });
      io.observe(el);
      watchers.push(io);
    };
    const from = (sel: string, trigger: string, vars: gsap.TweenVars, start?: string) => near(trigger, () => { const t = all(sel); if (t.length) gsap.from(t, { ...vars, scrollTrigger: once(trigger, start) }); });

    // Section labels: the ruled line draws out from the label.
    all('main.tl .tl-kicker').forEach(k => { const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); ctx.add(() => gsap.fromTo(k, { '--rule': 0 }, { '--rule': 1, duration: 1.6, ease: 'expo.out', scrollTrigger: once(k, 'top 92%') })); }, { rootMargin: '0px 0px 80% 0px' }); io.observe(k); watchers.push(io); });

    // Recent works on phones and tablets: the picture opens as its drawing and the scan builds it
    // (components/plan-scan.tsx); here the title climbs in letter by letter.
    if (window.matchMedia('(max-width: 1023px)').matches) all('.tl-sw-list > li').forEach((li, i) => near(`.tl-sw-list > li:nth-child(${i + 1})`, () => {
      gsap.from(li.querySelectorAll('.tl-sw-title .ch'), { yPercent: 110, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .022, scrollTrigger: once(li.querySelector('.tl-sw-title')!, 'top 90%') });
      gsap.from(li.querySelectorAll('.tl-sw-n, .tl-sw-line, .tl-sw-visit'), { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, scrollTrigger: once(li.querySelector('.tl-sw-n')!, 'top 92%') });
    }));

    // Clientele: the grid is ruled line by line, like a sheet being drawn up, then the names set in.
    near('.tl-clients-grid', () => {
      const grid = document.querySelector('.tl-clients-grid')!;
      ScrollTrigger.create({ trigger: grid, start: 'top 82%', once: true, onEnter: () => grid.classList.add('is-ruled') });
      gsap.from(grid.querySelectorAll('.tl-client > *:not(.tl-client-go)'), { y: 26, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .06, delay: .45, scrollTrigger: once(grid, 'top 82%') });
    });

    // Currently working on: each sheet rises, then its drawing is unveiled from below.
    near('.tl-now-grid', () => all('.tl-now-card').forEach((card, i) => {
      const tl = gsap.timeline({ scrollTrigger: once(card, 'top 90%') });
      tl.from(card, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', delay: (i % 2) * .12 })
        .from(card.querySelectorAll('.wb-draft, .tl-now-slot'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, '<.1')
        .from(card.querySelectorAll('.tl-now-top, strong, .tl-now-line, .tl-now-spec'), { y: 20, opacity: 0, duration: .9, ease: 'expo.out', stagger: .07 }, '<.5');
    }));

    // Capabilities: the forest opens out from a framed panel to the full width as it arrives,
    // and the directory fills in cell by cell, each title rising out of a mask.
    near('.tl-caps', () => {
      gsap.fromTo('.tl-caps', { clipPath: 'inset(0% 4% 0% 4% round 44px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.tl-caps', start: 'top bottom', end: 'top 25%', scrub: .5 } });
      const caps = all('.tl-cap');
      gsap.set(caps, { opacity: 0, y: 40 });
      gsap.set(caps.map(c => c.querySelector('h3')), { clipPath: 'inset(0% 0% 100% 0%)', y: 24 });
      ScrollTrigger.batch(caps, { start: 'top 90%', once: true, onEnter: batch => {
        batch.forEach((c, i) => gsap.delayedCall(.25 + i * .09, () => c.classList.add('is-drawn')));
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .09 });
        gsap.to(batch.map(c => c.querySelector('h3')), { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, ease: 'expo.out', stagger: .09, delay: .1 });
      } });
    });
    from('.tl-caps-head > :not(.tl-kicker):not(h2)', '.tl-caps-head', { y: 26, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }, 'top 80%');

    // About: the facts count in, the journey rows slide toward the line.
    from('.tl-fact', '.tl-facts', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08 });
    near('.tl-path-list', () => all('.tl-path-item').forEach(item => gsap.from(item.querySelector('div'), { x: item.classList.contains('is-right') ? 40 : -40, opacity: 0, duration: .9, ease: 'expo.out', scrollTrigger: once(item, 'top 95%') })));
    from('.tl-book-info > *', '.tl-book-info', { y: 22, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08 }, 'top 92%');

    // Footer: the signature rises into the foot of the page.
    from('.ft-mark text', '.ft-mark', { y: 90, duration: 1.6, ease: 'expo.out' }, 'top 100%');
    // Each chapter is a sheet in the set: its label ends in its sheet number, after the rule.
    const kickers = Array.from(document.querySelectorAll<HTMLElement>('main.tl [data-chapter]')).map(c => c.querySelector<HTMLElement>('.tl-kicker')).filter((k): k is HTMLElement => !!k);
    const tags = kickers.map((k, i) => {
      const tag = document.createElement('span');
      tag.className = 'tl-sheet';
      tag.setAttribute('aria-hidden', 'true');
      tag.textContent = `Sheet ${String(i + 1).padStart(2, '0')} / ${String(kickers.length).padStart(2, '0')}`;
      k.appendChild(tag);
      return tag;
    });
    // Late content (fonts, lazy sections) moves things down; re-measure once it settles.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => { clearTimeout(refresh); watchers.forEach(w => w.disconnect()); tags.forEach(t => t.remove()); ctx.revert(); };
  }, [reduced]);
  return null;
}
