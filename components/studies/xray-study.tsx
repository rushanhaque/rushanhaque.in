'use client';
import { useEffect, useRef, useState } from 'react';
import data from '@/content/studies/xray.json';
import { useMotion } from '@/components/site-motion';
import { StudyFrame } from '@/components/studies/study-frame';

const W = data.width, H = data.height;
const LAYERS = ['WIREFRAME', 'COMPONENTS', 'CODE'] as const;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;
// Smallest component under a point wins (the most specific name).
const hit = (x: number, y: number) => [...data.components].filter(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h).sort((a, b) => a.w * a.h - b.w * b.h)[0];

// A tiny JSX highlighter: tags, attributes, strings, braces and comments.
function highlight(code: string) {
  const out: React.ReactNode[] = [];
  const re = /(\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b[a-zA-Z-]+(?==))|([{}()])/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 't' : m[4] ? 'a' : 'p';
    out.push(<span key={k++} className={`hl-${cls}`}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

// Study 01 — a lens over a finished page shows the same spot as wireframe,
// named components, or the real source code that draws it.
export function XrayStudy() {
  const stage = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState(1);
  const [lens, setLens] = useState({ x: W * .5, y: H * .42 });
  const [scale, setScale] = useState(1);
  const { reduced } = useMotion();
  const drag = useRef({ active: false, moved: false, pending: 0, next: { x: 0, y: 0 } });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const mobile = scale * W < 700;
  const radius = (mobile ? 120 : 180) / 2 / Math.max(scale, .01); // in page pixels

  const move = (clientX: number, clientY: number) => {
    const box = stage.current!.getBoundingClientRect();
    drag.current.next = { x: Math.max(0, Math.min(W, (clientX - box.left) / scale)), y: Math.max(0, Math.min(H, (clientY - box.top) / scale)) };
    if (!drag.current.pending) drag.current.pending = requestAnimationFrame(() => { drag.current.pending = 0; setLens(drag.current.next); });
  };
  // Mouse: the lens follows. Touch: drag moves it, a tap changes the layer.
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') move(e.clientX, e.clientY);
    else if (drag.current.active) { drag.current.moved = true; move(e.clientX, e.clientY); }
  };
  const onPointerDown = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') { e.currentTarget.setPointerCapture(e.pointerId); drag.current.active = true; drag.current.moved = false; } };
  const onPointerUp = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') { if (!drag.current.moved) setLayer(l => (l + 1) % 3); drag.current.active = false; } };
  // Once engaged (clicked or focused), the wheel cycles layers instead of
  // scrolling. It is released when the pointer or focus leaves, so passing
  // over the frame never traps the page.
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    const el = stage.current;
    if (!el || !engaged) return;
    let last = 0;
    const wheel = (e: WheelEvent) => { e.preventDefault(); const now = Date.now(); if (now - last < 350) return; last = now; setLayer(l => (l + (e.deltaY > 0 ? 1 : 2)) % 3); };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, [engaged]);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 24 / Math.max(scale, .01);
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) { e.preventDefault(); setLens(l => ({ x: Math.max(0, Math.min(W, l.x + moves[e.key][0])), y: Math.max(0, Math.min(H, l.y + moves[e.key][1])) })); }
    if (['1', '2', '3'].includes(e.key)) setLayer(Number(e.key) - 1);
  };

  const under = hit(lens.x, lens.y);
  const lensStyle = { '--lx': pct(lens.x, W), '--ly': pct(lens.y, H), '--lr': `${radius * scale}px`, '--fs': `${Math.max(5, 11 * scale * 1.15)}px` } as React.CSSProperties;
  const readout = <><b>LAYER {layer + 1} / {LAYERS[layer]}</b><span>{under ? under.name : 'NO COMPONENT'}</span>{under && <span>{under.fileLines} LINES · {under.file.split('/').pop()}</span>}</>;

  return <StudyFrame id="study-01" number="01" name="X-RAY" title={<>Look underneath<br/>the <em>polish.</em></>}
    truth="The polish is the easy part to see. This is what holds it up, on Taif International."
    readout={readout} announce={`Layer ${layer + 1}, ${LAYERS[layer].toLowerCase()}${under ? `, over ${under.name}` : ''}`}
    controls={<div className="study-chips" role="group" aria-label="Lens layer">{LAYERS.map((l, i) => <button key={l} type="button" aria-pressed={layer === i} onClick={() => setLayer(i)}><kbd>{i + 1}</kbd>{l[0] + l.slice(1).toLowerCase()}</button>)}</div>}
    caption={<><p>Move the lens over the page. Press <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> or scroll to change layer. Arrow keys move it; on a phone, drag and tap.</p><p className="study-note">Captured from live <a href={data.url} target="_blank" rel="noopener noreferrer">taifinternational.co</a> at 1440 px. Outlines are real element boxes; the code is from the project’s source.</p></>}
    className="study-xray">
    <div className={`xr-stage ${reduced ? 'is-still' : ''} ${engaged ? 'is-engaged' : ''}`} ref={stage} tabIndex={0} role="group" aria-label={`Taif International homepage. Lens over ${under?.name ?? 'the page'}. Use the arrow keys to move the lens and 1, 2 or 3 to change layer.`}
      style={{ ...lensStyle, aspectRatio: `${W} / ${H}` }} onPointerMove={onPointerMove} onPointerDown={e => { setEngaged(true); onPointerDown(e); }} onPointerUp={onPointerUp} onPointerLeave={() => setEngaged(false)} onFocus={() => setEngaged(true)} onBlur={() => setEngaged(false)} onKeyDown={onKeyDown}>
      <img className="xr-shot" src={data.screenshot} alt="Taif International homepage: the collections vitrine with six collection tiles" width={W} height={H} loading="lazy" decoding="async"/>
      <div className="xr-lens" aria-hidden="true">
        {layer === 0 && <svg className="xr-wire" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <rect width={W} height={H} className="xr-wire-bg"/>
          {data.wireframe.map((b, i) => b.t === 'img' || b.t === 'svg'
            ? <g key={i}><rect x={b.x} y={b.y} width={b.w} height={b.h} className="xr-wire-img"/><path d={`M${b.x} ${b.y}L${b.x + b.w} ${b.y + b.h}M${b.x + b.w} ${b.y}L${b.x} ${b.y + b.h}`} className="xr-wire-x"/></g>
            : b.txt ? <rect key={i} x={b.x} y={b.y + b.h * .3} width={b.w} height={Math.max(3, b.h * .4)} rx={2} className="xr-wire-text"/>
            : <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} className="xr-wire-box"/>)}
        </svg>}
        {layer === 1 && <div className="xr-comp"><img src={data.screenshot} alt=""/>{data.components.map((c, i) => <span key={i} className={`xr-box ${under === c ? 'is-hot' : ''}`} style={{ left: pct(c.x, W), top: pct(c.y, H), width: pct(c.w, W), height: pct(c.h, H) }}><b>{c.name}</b></span>)}</div>}
        {layer === 2 && <div className="xr-code">{[...data.components].sort((a, b) => b.w * b.h - a.w * a.h).map((c, i) => <pre key={i} style={{ left: pct(c.x, W), top: pct(c.y, H), width: pct(c.w, W), height: pct(c.h, H) }}><span className="xr-code-file">{c.file} · line {c.from}</span>{highlight(c.code)}</pre>)}</div>}
      </div>
      <span className="xr-ring" aria-hidden="true"/>
      <span className="xr-hint" aria-hidden="true">{engaged ? 'Scroll to change layer' : 'Click, then scroll to change layer'}</span>
    </div>
  </StudyFrame>;
}
