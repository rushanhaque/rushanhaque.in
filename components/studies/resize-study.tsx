'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import data from '@/content/studies/resize.json';
import { StudyFrame, useNearViewport } from '@/components/studies/study-frame';

const allSites = data.sites.filter(s => s.frameable) as ((typeof data.sites)[number] & { allowedHosts?: string[] })[];
const { breakpoints, max: MAX } = data;
const MIN = 320, SNAP = 8;
const bpFor = (w: number) => [...breakpoints].reverse().find(b => w >= b.min) ?? breakpoints[0];

// Study 02 — drag the frame's edge and watch a real, live site reflow. The
// iframe keeps its true CSS width; the wrapper only scales it to fit.
export function ResizeStudy() {
  const [width, setWidth] = useState(390);
  const [stageW, setStageW] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // The drag hint stays until the visitor has moved the frame once.
  const [touched, setTouched] = useState(false);
  // A site that only allows certain addresses to frame it is skipped anywhere else (local and preview copies).
  const [host, setHost] = useState('');
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHost(location.hostname); }, []);
  const sites = allSites.filter(s => !s.allowedHosts || (host && s.allowedHosts.includes(host)));
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
  // On a phone the range stops at laptop width and the frame always fills at
  // least 55% of the stage, so it stays readable and the handle stays reachable.
  const narrow = stageW > 0 && stageW < 700;
  const top = narrow ? 1024 : MAX;
  const vMin = narrow ? stageW * .55 : Math.min(320, stageW * .5);
  const toVisual = useCallback((w: number) => !narrow && stageW >= MAX ? w : vMin + ((w - MIN) / (top - MIN)) * (stageW - vMin), [stageW, vMin, narrow, top]);
  const toCss = useCallback((v: number) => !narrow && stageW >= MAX ? v : MIN + ((v - vMin) / Math.max(1, stageW - vMin)) * (top - MIN), [stageW, vMin, narrow, top]);
  const clamp = (w: number) => Math.round(Math.min(top, Math.max(MIN, w)));
  const snap = (w: number) => { const near = breakpoints.find(b => Math.abs(b.min - w) <= SNAP); return near ? near.min : w; };

  const visual = stageW ? toVisual(width) : 0;
  const scale = width ? visual / width : 1;
  const bp = bpFor(width);
  const stageH = narrow ? 500 : 560;

  // Pointer drag on the handle, batched to one update per frame.
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true); setTouched(true);
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
    else if (e.key === 'End') next = top;
    else if (jump) next = jump.min;
    if (next !== null) { e.preventDefault(); setWidth(clamp(next)); setTouched(true); }
  };

  const current = sites[0];
  return <StudyFrame id="study-02" number="02" name="RESIZE ME" title={<>Resize <em>it.</em></>}
    truth="Layouts that genuinely adapt. This is a live site, not a screenshot."
    announce={`${width} pixels wide, ${bp.name.toLowerCase()} layout`}
    className="study-resize">
    <div className={`rz-ruler ${narrow ? 'is-narrow' : ''}`} aria-hidden="true">{breakpoints.filter(b => b.min <= top).map(b => <span key={b.key} className={b === bp ? 'is-on' : ''} style={{ left: stageW ? toVisual(b.min) : 0 }}><i/>{b.name} · {b.min}</span>)}</div>
    <div className="rz-stage" ref={stageRef} style={{ height: stageH }}>
      <div className="rz-frame" style={{ width: visual || '100%', height: stageH }}>
        <img className="rz-poster" src={current.poster} alt={`${current.name} homepage`} loading="lazy" decoding="async"/>
        {near && stageW > 0 && host && <iframe key={current.url} src={current.url} title={`${current.name}, live, ${width} pixels wide`} loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)} className={loaded ? 'is-loaded' : ''}
          style={{ width, height: stageH / scale, transform: `scale(${scale})`, pointerEvents: dragging || narrow ? 'none' : 'auto' }}/>}
        {!loaded && near && <span className="rz-loading">Loading the live site…</span>}
      </div>
      {stageW > 0 && <button type="button" className={`rz-handle ${dragging ? 'is-dragging' : ''}`} style={{ left: visual }} role="slider" aria-label="Frame width" aria-valuemin={MIN} aria-valuemax={top} aria-valuenow={width} aria-valuetext={`${width} pixels, ${bp.name.toLowerCase()}`}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={onKeyDown}><span/></button>}
      {stageW > 0 && <span className={`rz-hint ${touched ? 'is-gone' : ''} ${visual > stageW - (narrow ? 112 : 190) ? 'is-left' : ''}`} style={{ left: visual }} aria-hidden="true"><i>←</i>{narrow ? 'Drag' : 'Drag to resize'}<i>→</i></span>}
    </div>
  </StudyFrame>;
}
