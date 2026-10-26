'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useMotion } from '@/components/site-motion';
import { onStoryReady } from '@/components/story/preloader';

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
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .3, delay: 2.6 });
    tl.call(() => { d.textContent = ''; w.textContent = ''; })
      .add(word(d, '<developer />', 'Developer', false))
      .add(word(w, '// & writer', '& writer.', true), '+=.15')
      .to({}, { duration: 3.2 });
    const st = ScrollTrigger.create({ trigger: d, start: 'top bottom', end: 'bottom top', onToggle: self => { if (self.isActive) tl.resume(); else tl.pause(); } });
    return () => { st.kill(); tl.kill(); d.textContent = 'Developer'; d.className = 'tl-role'; w.textContent = '& writer.'; w.className = 'tl-role is-serif'; };
  }, [reduced]);
  return <p className="tl-hero-roles"><span className="sr-only">Developer and writer.</span><span className="tl-role" ref={dev} aria-hidden="true">Developer</span>{' '}<span className="tl-role is-serif" ref={wri} aria-hidden="true">&amp; writer.</span></p>;
}

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; dx: number; dy: number; seed: number; size: number };

// The name in a few thousand dots. The real name stays in the page, laid out but
// invisible, and every letter is sampled from exactly where it sits, so the dots match
// the type at any screen size. The dots gather into the name, scatter from the pointer,
// and blow apart as you scroll on. Behind it, a writer's manuscript and a developer's code.
export function NameHero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const section = root.current, canvas = canvasRef.current;
    if (!section || !canvas || reduced) return;
    const ctx = canvas.getContext('2d')!;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lite = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4 || !!nav.connection?.saveData;
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    const mobile = window.matchMedia('(max-width: 799px)').matches;
    let W = 0, H = 0, particles: P[] = [], target: [number, number][] = [];
    let frame = 0, visible = true, explode = 0, intro = 0, disposed = false, calm = 0, lastExplode = -1;
    const pointer = { x: -9999, y: -9999, active: false };

    // Draws each letter where the page set it, at 1/step scale, and keeps the inked pixels.
    const sample = (step: number) => {
      const w = Math.ceil(W / step), h = Math.ceil(H / step);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true })!;
      g.scale(1 / step, 1 / step); g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
      const box = section.getBoundingClientRect();
      section.querySelectorAll<HTMLElement>('.tl-name .ch').forEach(ch => {
        const s = getComputedStyle(ch);
        g.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
        const range = document.createRange(); range.selectNodeContents(ch);
        const r = range.getBoundingClientRect();
        g.fillText(ch.textContent || '', r.left - box.left, r.top - box.top + g.measureText('H').fontBoundingBoxAscent);
      });
      const data = g.getImageData(0, 0, w, h).data, pts: [number, number][] = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) pts.push([(x + .5 + (Math.random() - .5) * .5) * step, (y + .5 + (Math.random() - .5) * .5) * step]);
      return pts;
    };
    const build = () => {
      const box = section.getBoundingClientRect();
      W = Math.round(box.width); H = Math.round(box.height);
      if (!W || !H) { window.setTimeout(() => { if (!disposed) { build(); wake(); } }, 400); return; }
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      target = sample(mobile ? 3 : W > 1700 ? 4 : 3);
      const count = Math.min(mobile ? (lite ? 2000 : 3400) : (lite ? 6000 : 10000), target.length);
      const old = particles;
      particles = Array.from({ length: count }, (_, i) => old[i] ?? { x: W / 2 + (Math.random() - .5) * W, y: H / 2 + (Math.random() - .5) * H, vx: 0, vy: 0, tx: 0, ty: 0, dx: Math.random() - .5, dy: Math.random() - .5, seed: Math.random(), size: Math.random() < .1 ? (mobile ? 2.3 : 2.7) : (mobile ? 1.8 : 2.1) });
      particles.length = count;
      particles.forEach((p, i) => { const [x, y] = target[Math.floor((i / particles.length) * target.length)] ?? [W / 2, H / 2]; p.tx = x; p.ty = y; });
      section.classList.add('is-dots');
    };
    const draw = () => {
      frame = 0;
      if (!visible || disposed) return;
      ctx.clearRect(0, 0, W, H);
      const spread = explode * explode;
      ctx.fillStyle = '#07241a';
      ctx.globalAlpha = Math.max(0, 1 - spread * 1.1);
      const hidden = ctx.globalAlpha < .01;
      let motion = 0;
      for (const p of particles) {
        const tx = p.tx + p.dx * spread * W * 1.6 + Math.sin(p.seed * 30 + intro * 6) * (1 - intro) * 220;
        const ty = p.ty + p.dy * spread * H * 1.6 - spread * 120;
        let ax = (tx - p.x) * .055, ay = (ty - p.y) * .055;
        if (pointer.active) {
          const ddx = p.x - pointer.x, ddy = p.y - pointer.y, d2 = ddx * ddx + ddy * ddy;
          if (d2 < 16000) { const f = (1 - d2 / 16000) * 5.5; const d = Math.sqrt(d2) || 1; ax += (ddx / d) * f; ay += (ddy / d) * f; }
        }
        p.vx = (p.vx + ax) * .82; p.vy = (p.vy + ay) * .82;
        p.x += p.vx; p.y += p.vy;
        motion += Math.abs(p.vx) + Math.abs(p.vy);
        if (!hidden) ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      const still = intro > .995 && !pointer.active && explode === lastExplode && motion / Math.max(1, particles.length) < .01;
      lastExplode = explode;
      calm = still ? calm + 1 : 0;
      if (calm < 20) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };

    // Only a mouse stirs the dots: a finger on a phone is scrolling, not pointing.
    const move = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; const b = canvas.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; pointer.active = true; calm = 0; wake(); };
    const leave = () => { pointer.active = false; calm = 0; wake(); };
    section.addEventListener('pointermove', move, { passive: true });
    section.addEventListener('pointerleave', leave);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
    io.observe(section);
    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    document.addEventListener('visibilitychange', onVisibility);
    let resizeTimer = 0, lastW = window.innerWidth;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const resize = () => { if (touch && window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => { build(); calm = 0; wake(); }, 180); };
    window.addEventListener('resize', resize);

    // Scrolling on blows the name apart; the roles lift and fade, the desk drifts.
    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom top', scrub: true, onUpdate: self => { explode = self.progress; calm = 0; wake(); } });
    const motionCtx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top top', end: '60% top', scrub: .4 } })
        .to('.tl-hero-roles', { yPercent: -60, opacity: 0, duration: 1 }, 0)
        .to('.tl-hero-art', { scale: 1.08, yPercent: 8, duration: 1 }, 0);
    }, section);

    const stopReady = onStoryReady(() => { if (!disposed) gsap.to({ v: 0 }, { v: 1, duration: 2.4, ease: 'expo.out', onUpdate() { intro = this.targets()[0].v; calm = 0; wake(); } }); });
    // Sample once the fonts are in, after the first paint.
    document.fonts.ready.then(() => { if (!disposed) requestAnimationFrame(() => { build(); calm = 0; wake(); }); });

    return () => {
      disposed = true; cancelAnimationFrame(frame); stopReady(); st.kill(); motionCtx.revert(); io.disconnect();
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', resize); clearTimeout(resizeTimer);
      section.classList.remove('is-dots');
    };
  }, [reduced]);

  let i = 0;
  const word = (w: string) => <span className="tl-name-w">{[...w].map(c => <span key={i} className="ch" style={{ '--i': i++ } as React.CSSProperties}>{c}</span>)}</span>;
  return <section className="tl-hero is-name" ref={root} data-chapter="Prologue">
    <img className="tl-hero-art" src="/images/bg/desk.svg" alt="" aria-hidden="true" width="1600" height="1000" decoding="async" fetchPriority="low"/>
    <canvas ref={canvasRef} className="tl-hero-canvas" aria-hidden="true"/>
    <div className="tl-hero-plane">
      <h1 className="tl-hero-name">
        <span className="sr-only">Rushan Haque, website designer and developer</span>
        <span className="tl-name" aria-hidden="true">{word('Rushan')} {word('Haque')}</span>
      </h1>
      <HeroRoles/>
    </div>
  </section>;
}
