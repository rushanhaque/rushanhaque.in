'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RotateCcw, Shuffle } from 'lucide-react';
import { useMotion } from '@/components/site-motion';

type Glyph = { letter: string; x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; size: number; width: number };
const thoughts = [['MAKE IT', 'MATTER.'], ['STAY', 'CURIOUS.'], ['WHAT', 'IF?']];

export function TypeLaboratory() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -1000, y: -1000, down: false });
  const impulse = useRef(0);
  const reset = useRef(false);
  const loosened = useRef(false);
  const wake = useRef<() => void>(() => {});
  const [thought, setThought] = useState(0);
  const [loose, setLoose] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, glyphs: Glyph[] = [], frame = 0, visible = false, disposed = false, last = 0;
    let mode = impulse.current;
    const layout = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = width * dpr; element.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const words = thoughts[thought];
      let size = Math.min(height * .37, width * .21);
      ctx.font = `500 ${size}px "Geist Variable", Arial, sans-serif`;
      size *= Math.min(1, width * .86 / Math.max(...words.map(word => ctx.measureText(word).width)));
      ctx.font = `500 ${size}px "Geist Variable", Arial, sans-serif`;
      glyphs = [];
      words.forEach((word, row) => {
        const total = ctx.measureText(word).width;
        let x = (width - total) / 2;
        [...word].forEach(letter => {
          const glyphWidth = ctx.measureText(letter).width;
          glyphs.push({ letter, x: x + glyphWidth / 2, y: height / 2 + (row - .5) * size * .97, homeX: x + glyphWidth / 2, homeY: height / 2 + (row - .5) * size * .97, vx: 0, vy: 0, size, width: glyphWidth });
          x += glyphWidth;
        });
      });
      draw(0);
    };
    const draw = (time: number) => {
      if (disposed) return;
      frame = 0;
      let energy = 0;
      const delta = last ? Math.min((time - last) / 16.67, 2) : 1;
      last = time;
      ctx.clearRect(0, 0, width, height);
      const p = pointer.current;
      const burst = mode !== impulse.current;
      mode = impulse.current;
      if (!reduced && (p.down || loosened.current)) {
        ctx.strokeStyle = '#dce5c523'; ctx.lineWidth = .6;
        ctx.beginPath();
        glyphs.forEach((g, i) => { if (i === 0) ctx.moveTo(g.x, g.y); else ctx.lineTo(g.x, g.y); });
        ctx.stroke();
      }
      glyphs.forEach((g, i) => {
        if (!reduced) {
          const dx = g.x - p.x, dy = g.y - p.y, distance = Math.hypot(dx, dy);
          const radius = Math.min(width * .3, 200);
          if (distance < radius && distance > 0) {
            const force = (1 - distance / radius) * (p.down ? 7 : 2.4);
            g.vx += dx / distance * force * delta;
            g.vy += dy / distance * force * delta;
          }
          if (burst) { g.vx += Math.cos(i * 2.4) * 25; g.vy += Math.sin(i * 2.4) * 25; }
          const spring = loosened.current ? .003 : .025;
          g.vx += (g.homeX - g.x) * spring * delta;
          g.vy += (g.homeY - g.y) * spring * delta;
          g.vx *= Math.pow(.85, delta); g.vy *= Math.pow(.85, delta);
          g.x += g.vx * delta; g.y += g.vy * delta;
          energy += Math.abs(g.vx) + Math.abs(g.vy);
          g.x = Math.max(g.width * .4, Math.min(width - g.width * .4, g.x));
          g.y = Math.max(g.size * .4, Math.min(height - g.size * .4, g.y));
        }
        if (reset.current || reduced) { g.x = g.homeX; g.y = g.homeY; g.vx = 0; g.vy = 0; }
        ctx.save(); ctx.translate(g.x, g.y);
        if (!reduced) ctx.rotate(Math.max(-.3, Math.min(.3, g.vx * .016)));
        ctx.font = `500 ${g.size}px "Geist Variable", Arial, sans-serif`;
        ctx.fillStyle = '#edf0d9'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(g.letter, 0, 0); ctx.restore();
      });
      reset.current = false;
      const pointerInside = p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height;
      if (visible && !reduced && !document.hidden && (energy > .04 || pointerInside)) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); frame = 0; last = 0; if (visible && !document.hidden) frame = requestAnimationFrame(draw); };
    wake.current = () => { if (!frame && visible && !reduced && !document.hidden) { last = 0; frame = requestAnimationFrame(draw); } };
    const resize = new ResizeObserver(() => { layout(); restart(); });
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; cancelAnimationFrame(frame); if (visible) restart(); }, { rootMargin: '60px' });
    resize.observe(element); observer.observe(element);
    document.addEventListener('visibilitychange', restart);
    document.fonts.ready.then(() => { if (!disposed) { layout(); restart(); } });
    return () => { disposed = true; wake.current = () => {}; cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange', restart); };
  }, [thought, reduced]);

  return <section className="type-lab" aria-labelledby="type-lab-title">
    <div className="lab-intro"><div><span className="chapter-kicker">02 / THE SPACE BETWEEN IDEAS</span><h2 id="type-lab-title">A little friction.<br/><em>A new perspective.</em></h2></div><p>Some things make more sense<br/>when you get your hands on them.</p></div>
    <div className="lab-field">
      <div className="lab-topline"><span>AN INTERACTIVE TYPE STUDY</span><span>NO. 0{thought + 1} / 03</span></div>
      <canvas ref={canvas} aria-label={`Interactive typography reading ${thoughts[thought].join(' ')}. Move your pointer or touch to push the letters. The buttons below also control the composition.`}
        onPointerMove={event => { const rect = event.currentTarget.getBoundingClientRect(); pointer.current.x = event.clientX - rect.left; pointer.current.y = event.clientY - rect.top; wake.current(); }}
        onPointerDown={event => { const rect = event.currentTarget.getBoundingClientRect(); pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, down: true }; wake.current(); }}
        onPointerUp={() => { pointer.current.down = false; }}
        onPointerCancel={() => { pointer.current = { x: -1000, y: -1000, down: false }; }}
        onPointerLeave={() => { pointer.current = { x: -1000, y: -1000, down: false }; }}
      >{thoughts[thought].join(' ')}</canvas>
      <div className="lab-bottomline"><span>{reduced ? 'A STILL COMPOSITION. THE IDEA REMAINS.' : 'MOVE THROUGH THE LETTERS. PRESS TO PUSH FURTHER.'}</span><span aria-hidden="true">↔</span></div>
    </div>
    <div className="lab-toolbar"><button onClick={() => { loosened.current = !loose; setLoose(!loose); impulse.current++; wake.current(); }} aria-pressed={loose} disabled={reduced}><Shuffle size={14}/>{loose ? 'Bring it together' : 'Loosen the rules'}</button><button onClick={() => { setThought(value => (value + 1) % thoughts.length); setLoose(false); loosened.current = false; }}><ArrowUpRight size={15}/>Another thought</button><button onClick={() => { reset.current = true; setLoose(false); loosened.current = false; wake.current(); }}><RotateCcw size={14}/>Reset composition</button></div>
  </section>;
}
