'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown } from 'lucide-react';
import { useMotion } from '@/components/site-motion';
import { onStoryReady } from '@/components/story/preloader';

gsap.registerPlugin(ScrollTrigger);

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
function sample(width: number, height: number, step: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const { lines, lead, top } = layout(ctx, width, height);
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((line, i) => ctx.fillText(line, width / 2, top + i * lead));
  const data = ctx.getImageData(0, 0, width, height).data;
  const points: [number, number][] = [];
  for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) if (data[(y * width + x) * 4 + 3] > 140) points.push([x + (Math.random() - .5) * step * .5, y + (Math.random() - .5) * step * .5]);
  return points;
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
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    let W = 0, H = 0, particles: P[] = [], target: [number, number][] = [];
    let frame = 0, visible = true, explode = 0, intro = 0, disposed = false;
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
      const count = Math.min(mobile ? 5200 : 13000, target.length);
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
        const speed = Math.min(1, Math.abs(p.vx) + Math.abs(p.vy));
        ctx.globalAlpha = Math.max(0, 1 - spread * 1.1) * (.92 + .08 * (1 - speed * .5));
        ctx.fillStyle = speed > .6 || p.size > 2 ? '#07241a' : '#07241a';
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    const wake = () => { if (!frame && visible) frame = requestAnimationFrame(draw); };

    const move = (e: PointerEvent) => { const b = canvas.getBoundingClientRect(); pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top; pointer.active = true; };
    const leave = () => { pointer.active = false; };
    section.addEventListener('pointermove', move, { passive: true });
    section.addEventListener('pointerleave', leave);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); });
    io.observe(section);
    const onVisibility = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
    document.addEventListener('visibilitychange', onVisibility);
    let resizeTimer = 0;
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(build, 180); };
    window.addEventListener('resize', resize);

    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom top', scrub: true, onUpdate: self => { explode = self.progress; } });
    // A context so every inline style it sets is restored if motion is switched off.
    const motionCtx = gsap.context(() => {
      gsap.to(section.querySelectorAll('.tl-hero-meta, .tl-hero-foot'), { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: '40% top', scrub: true } });
    }, section);

    section.classList.add('is-live');
    const stopReady = onStoryReady(() => {
      if (disposed) return;
      gsap.to({ v: 0 }, { v: 1, duration: 2.4, ease: 'expo.out', onUpdate() { intro = this.targets()[0].v; } });
      motionCtx.add(() => gsap.from(section.querySelectorAll('.tl-hero-meta > *, .tl-hero-foot > *'), { y: 20, opacity: 0, duration: 1.2, stagger: .08, ease: 'expo.out', delay: .4 }));
    });
    document.fonts.ready.then(() => { if (!disposed) { build(); wake(); } });
    build(); wake();

    return () => {
      disposed = true; cancelAnimationFrame(frame); stopReady(); st.kill(); motionCtx.revert(); io.disconnect();
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', resize); clearTimeout(resizeTimer);
      section.classList.remove('is-live');
    };
  }, [reduced]);

  return <section className="tl-hero" ref={root} data-chapter="Prologue">
    <canvas ref={canvasRef} className="tl-hero-canvas" aria-hidden="true"/>
    <h1 className="tl-hero-fallback">Rushan Haque</h1>
    <div className="tl-hero-meta"><span>MORADABAD, IN · IST {time || '--:--'}</span><span>Building at the intersection of logic and language</span></div>
    <div className="tl-hero-foot"><p>Logic in one hand,<br/>language in the <em>other.</em></p><a href="#two-languages" className="tl-scroll-cue"><span>Scroll</span><i><ArrowDown size={16}/></i></a></div>
  </section>;
}
