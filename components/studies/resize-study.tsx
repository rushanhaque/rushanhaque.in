'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import data from '@/content/studies/resize.json';
import { StudyFrame, useNearViewport } from '@/components/studies/study-frame';

const sites = data.sites.filter(s => s.frameable);
const blocked = data.sites.filter(s => !s.frameable);
const { breakpoints, max: MAX } = data;
const MIN = 320, SNAP = 8;
const bpFor = (w: number) => [...breakpoints].reverse().find(b => w >= b.min) ?? breakpoints[0];

// Study 03 — drag the frame's edge and watch a real, live site reflow. The
// iframe keeps its true CSS width; the wrapper only scales it to fit.
export function ResizeStudy() {
  const [site, setSite] = useState(0);
  const [width, setWidth] = useState(390);
  const [stageW, setStageW] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stageRef, near] = useNearViewport<HTMLDivElement>();
  const frame = useRef({ pending: 0, value: 390 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let first = true;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      setStageW(w);
      // Start wide on large screens (so the collapse is visible), narrow on phones.
      if (first) { first = false; setWidth(w >= 900 ? 1280 : 390); }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);

  // Visual width on screen for a CSS width, and back.
  const vMin = Math.min(320, stageW * .5);
  const toVisual = useCallback((w: number) => stageW >= MAX ? w : vMin + ((w - MIN) / (MAX - MIN)) * (stageW - vMin), [stageW, vMin]);
  const toCss = useCallback((v: number) => stageW >= MAX ? v : MIN + ((v - vMin) / Math.max(1, stageW - vMin)) * (MAX - MIN), [stageW, vMin]);
  const clamp = (w: number) => Math.round(Math.min(MAX, Math.max(MIN, w)));
  const snap = (w: number) => { const near = breakpoints.find(b => Math.abs(b.min - w) <= SNAP); return near ? near.min : w; };

  const visual = stageW ? toVisual(width) : 0;
  const scale = width ? visual / width : 1;
  const bp = bpFor(width);
  const stageH = stageW < 600 ? 460 : 560;

  // Pointer drag on the handle, batched to one update per frame.
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !stageRef.current) return;
    const left = stageRef.current.getBoundingClientRect().left;
    frame.current.value = snap(clamp(toCss(e.clientX - left)));
    if (!frame.current.pending) frame.current.pending = requestAnimationFrame(() => { frame.current.pending = 0; setWidth(frame.current.value); });
  };
  const endDrag = () => setDragging(false);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 80 : 16;
    const jump = breakpoints.find(b => b.key === e.key.toUpperCase());
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = width + step;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = width - step;
    else if (e.key === 'Home') next = MIN;
    else if (e.key === 'End') next = MAX;
    else if (jump) next = jump.min;
    if (next !== null) { e.preventDefault(); setWidth(clamp(next)); }
  };

  const current = sites[site];
  const readout = <><b>{width} PX</b><span>{bp.name}</span><span>SCALE {scale.toFixed(2)}×</span><span>{current.name.toUpperCase()}</span></>;
  return <StudyFrame id="study-03" number="03" name="RESIZE ME" title={<>Don’t take my word<br/>for it. <em>Resize it.</em></>}
    truth="Layouts that genuinely adapt. This is a live site, not a screenshot."
    readout={readout} announce={`${width} pixels wide, ${bp.name.toLowerCase()} layout`}
    controls={<div className="study-chips" role="group" aria-label="Choose a live site">{sites.map((s, i) => <button key={s.url} type="button" aria-pressed={site === i} onClick={() => { setSite(i); setLoaded(false); }}>{s.name}</button>)}</div>}
    caption={<><p>Drag the handle, or use the arrow keys (Shift for bigger steps). <kbd>M</kbd> <kbd>T</kbd> <kbd>L</kbd> <kbd>D</kbd> jump to mobile, tablet, laptop and desktop.</p>{blocked.length > 0 && <p className="study-note">{blocked.map((b, i) => <span key={b.url}>{i ? ' and ' : ''}<a href={b.url} target="_blank" rel="noopener noreferrer">{b.name}</a></span>)} can’t be framed here. Open them in a new tab and resize the window.</p>}</>}
    className="study-resize">
    <div className="rz-ruler" aria-hidden="true">{breakpoints.map(b => <span key={b.key} className={b === bp ? 'is-on' : ''} style={{ left: stageW ? toVisual(b.min) : 0 }}><i/>{b.name} · {b.min}</span>)}</div>
    <div className="rz-stage" ref={stageRef} style={{ height: stageH }}>
      <div className="rz-frame" style={{ width: visual || '100%', height: stageH }}>
        <img className="rz-poster" src={current.poster} alt={`${current.name} homepage`} loading="lazy" decoding="async"/>
        {near && stageW > 0 && <iframe key={current.url} src={current.url} title={`${current.name}, live, ${width} pixels wide`} loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)} className={loaded ? 'is-loaded' : ''}
          style={{ width, height: stageH / scale, transform: `scale(${scale})`, pointerEvents: dragging ? 'none' : 'auto' }}/>}
        {!loaded && near && <span className="rz-loading">Loading the live site…</span>}
      </div>
      {stageW > 0 && <button type="button" className={`rz-handle ${dragging ? 'is-dragging' : ''}`} style={{ left: visual }} role="slider" aria-label="Frame width" aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={width} aria-valuetext={`${width} pixels, ${bp.name.toLowerCase()}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown}><span/></button>}
    </div>
  </StudyFrame>;
}
