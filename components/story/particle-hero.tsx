'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useMotion } from '@/components/site-motion';
import { onStoryReady } from '@/components/story/preloader';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
// Phone address bars resize the viewport while scrolling; re-measuring then makes pinned scenes jump.
ScrollTrigger.config({ ignoreMobileResize: true });

const NAME = 'Rushan Haque';
const FONT = (size: number) => `650 ${size}px "Geist Variable", Arial, sans-serif`;

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; dx: number; dy: number; seed: number; size: number };

// Draws the name on an offscreen canvas: one line on wide screens, two on narrow ones.
function layout(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const lines = width < 700 ? ['Rushan', 'Haque'] : [NAME];
  let size = lines.length > 1 ? Math.min(width * .3, height * .2) : Math.min(width * .17, height * .3);
  ctx.font = FONT(size);
  const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
  if (widest > width * .84) { size *= (width * .84) / widest; ctx.font = FONT(size); }
  const lead = size * .98, top = height * .47 - ((lines.length - 1) * lead) / 2;
  return { lines, size, lead, top };
}
// Draws the name at 1/step scale, so every pixel read is one candidate point.
// That keeps the read-back tiny even on large screens.
function sample(width: number, height: number, step: number) {
  const w = Math.ceil(width / step), h = Math.ceil(height / step);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.scale(1 / step, 1 / step);
  const { lines, lead, top } = layout(ctx, width, height);
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((line, i) => ctx.fillText(line, width / 2, top + i * lead));
  const data = ctx.getImageData(0, 0, w, h).data;
  const points: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) points.push([(x + .5 + (Math.random() - .5) * .5) * step, (y + .5 + (Math.random() - .5) * .5) * step]);
  return points;
}

// "Developer" resolves first, then "& writer." joins it, so the two end up
// together. They hold, then the whole line plays again.
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
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .3, delay: 2.4 });
    tl.call(() => { d.textContent = ''; w.textContent = ''; })
      .add(word(d, '<developer />', 'Developer', false))
      .add(word(w, '// & writer', '& writer.', true), '+=.15')
      .to({}, { duration: 2.6 });
    return () => { tl.kill(); d.textContent = 'Developer'; d.className = 'tl-role'; w.textContent = '& writer.'; w.className = 'tl-role is-serif'; };
  }, [reduced]);
  return <p className="tl-hero-roles"><span className="sr-only">Developer and writer.</span><span className="tl-role" ref={dev} aria-hidden="true">Developer</span>{' '}<span className="tl-role is-serif" ref={wri} aria-hidden="true">&amp; writer.</span></p>;
}

// The name, drawn in a few thousand particles. They gather into the name,
// scatter from the pointer, and blow apart as you scroll on.
export function ParticleHero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState('');
  const { reduced } = useMotion();

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const tick = () => setTime(format.format(new Date()));
    tick(); const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const section = root.current, canvas = canvasRef.current;
    if (!section || !canvas || reduced) return;
    const ctx = canvas.getContext('2d')!;
    // Lighter on slower devices: fewer particles and a 1x canvas.
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lite = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4 || !!nav.connection?.saveData;
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0, particles: P[] = [], target: [number, number][] = [];
    let frame = 0, visible = true, explode = 0, intro = 0, disposed = false, calm = 0, lastExplode = -1;
    const pointer = { x: -9999, y: -9999, active: false };
    const mobile = window.matchMedia('(max-width: 799px)').matches;

    const build = () => {
      const box = section.getBoundingClientRect();
      W = Math.round(box.width); H = Math.round(box.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const step = mobile ? 3 : W > 1700 ? 4 : 3;
      target = sample(W, H, step);
      const count = Math.min(mobile ? (lite ? 2400 : 4200) : (lite ? 6000 : 10000), target.length);
      const old = particles;
      particles = Array.from({ length: count }, (_, i) => old[i] ?? { x: W / 2 + (Math.random() - .5) * W, y: H / 2 + (Math.random() - .5) * H, vx: 0, vy: 0, tx: 0, ty: 0, dx: Math.random() - .5, dy: Math.random() - .5, seed: Math.random(), size: Math.random() < .1 ? (mobile ? 2.3 : 2.7) : (mobile ? 1.8 : 2.1) });
      particles.length = count;
      assign();
    };
    const assign = () => {
      const t = target;
      if (!t.length) return;
      // Shuffle-free stable mapping keeps the morph readable: each particle takes a nearby slot.
      particles.forEach((p, i) => { const [x, y] = t[Math.floor((i / particles.length) * t.length)]; p.tx = x; p.ty = y; });
    };

    const draw = () => {
      frame = 0;
      if (!visible || disposed) return;
      ctx.clearRect(0, 0, W, H);
      const spread = explode * explode;
      // One colour and one alpha per frame keeps the inner loop to arithmetic and fillRect.
      ctx.fillStyle = '#07241a';
      ctx.globalAlpha = Math.max(0, 1 - spread * 1.1);
      // Fully blown away: nothing would show, so skip the fill and keep only the motion.
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
      // Once everything has settled, stop drawing until the pointer or scroll moves it.
      const still = intro > .995 && !pointer.active && explode === lastExplode && motion / Math.max(1, particles.length) < .01;
      lastExplode = explode;
      calm = still ? calm + 1 : 0;
      if (calm < 20) frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };

    const move = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; pointer.active = true; calm = 0; wake(); };
    const leave = () => { pointer.active = false; calm = 0; wake(); };
    section.addEventListener('pointermove', move, { passive: true });
    section.addEventListener('pointerleave', leave);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); });
    io.observe(section);
    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    document.addEventListener('visibilitychange', onVisibility);
    let resizeTimer = 0, lastW = window.innerWidth;
    const touch = window.matchMedia('(pointer: coarse)').matches;
    // On touch screens only a width change re-samples the name; an address bar sliding away does not.
    const resize = () => { if (touch && window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => { build(); calm = 0; wake(); }, 180); };
    window.addEventListener('resize', resize);

    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom top', scrub: true, onUpdate: self => { explode = self.progress; calm = 0; wake(); } });
    // A context so every inline style it sets is restored if motion is switched off.
    const motionCtx = gsap.context(() => {
      gsap.to(section.querySelectorAll('.tl-hero-meta, .tl-hero-foot'), { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: '40% top', scrub: true } });
    }, section);

    section.classList.add('is-live');
    // The name gathers once the intro curtain opens (at once on return visits).
    const stopReady = onStoryReady(() => { if (!disposed) gsap.to({ v: 0 }, { v: 1, duration: 2.4, ease: 'expo.out', onUpdate() { intro = this.targets()[0].v; calm = 0; wake(); } }); });
    // Sample the name after the first paint, so it never delays the page appearing.
    const idle = (cb: () => void) => { const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }; if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout: 600 }); else setTimeout(cb, 120); };
    idle(() => { if (!disposed) { build(); wake(); } });
    document.fonts.ready.then(() => { if (!disposed) idle(() => { if (!disposed) { build(); calm = 0; wake(); } }); });

    return () => {
      disposed = true; cancelAnimationFrame(frame); stopReady(); st.kill(); motionCtx.revert(); io.disconnect();
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', resize); clearTimeout(resizeTimer);
      section.classList.remove('is-live');
    };
  }, [reduced]);

  return <section className="tl-hero" ref={root} data-chapter="Prologue">
    <canvas ref={canvasRef} className="tl-hero-canvas" aria-hidden="true"/>
    <h1 suppressHydrationWarning className="tl-hero-fallback">Rushan Haque</h1>
    <div className="tl-hero-meta"><span>MORADABAD, IN · IST {time || '--:--'}</span><span>Project manager &amp; full-stack developer · Writer</span></div>
    <div className="tl-hero-foot"><p>Logic in one hand,<br/>language in the <em>other.</em></p><span className="tl-scroll-cue" aria-hidden="true"><i/></span><HeroRoles/></div>
  </section>;
}
