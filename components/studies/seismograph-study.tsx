'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import contributions from '@/content/studies/contributions.json';
import repos from '@/content/studies/repos.json';
import { ArrowUpRight } from 'lucide-react';
import { useMotion } from '@/components/site-motion';
import { StudyFrame } from '@/components/studies/study-frame';

type Week = { start: string; count: number; iso: number; year: number };
const DAY = 86400000;
const isoWeek = (d: Date) => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return { week: Math.ceil(((t.getTime() - y0.getTime()) / DAY + 1) / 7), year: t.getUTCFullYear() }; };
const fmt = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function buildWeeks(days: [string, number][]) {
  const firstActive = days.findIndex(([, c]) => c > 0);
  const series = firstActive < 0 ? days : days.slice(Math.max(0, firstActive - 14));
  const weeks: Week[] = [];
  for (const [date, count] of series) {
    const d = new Date(date + 'T00:00:00Z');
    const monday = new Date(d.getTime() - (((d.getUTCDay() || 7) - 1) * DAY)).toISOString().slice(0, 10);
    const last = weeks[weeks.length - 1];
    if (last && last.start === monday) last.count += count;
    else { const { week, year } = isoWeek(d); weeks.push({ start: monday, count, iso: week, year }); }
  }
  let streak = 0, run = 0;
  for (const [, c] of days) { run = c > 0 ? run + 1 : 0; streak = Math.max(streak, run); }
  return { weeks, streak, total: days.reduce((s, [, c]) => s + c, 0) };
}

// Catmull-Rom spline through points, as cubic Béziers.
function spline(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}

type Project = (typeof repos.projects)[number];
const monthYear = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// Study 03 — paper runs under a needle; the line is my real weekly GitHub
// activity, and every public project is flagged at the week it began.
export function SeismographStudy() {
  const { weeks, total } = useMemo(() => buildWeeks(contributions.days as [string, number][]), []);
  const marks = useMemo(() => (repos.projects as Project[]).map(p => ({ ...p, week: weeks.findIndex(w => w.start <= p.date && p.date < new Date(new Date(w.start + 'T00:00:00Z').getTime() + 7 * DAY).toISOString().slice(0, 10)) })).filter(p => p.week >= 0), [weeks]);
  const max = Math.max(1, ...weeks.map(w => w.count));
  const since = useMemo(() => (contributions.days as [string, number][]).find(([, c]) => c > 0)?.[0], []);
  const [cursor, setCursor] = useState(weeks.length - 1);
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const state = useRef({ c: weeks.length - 1, v: 0, dragging: false, lastX: 0, frame: 0, visible: false, jitter: 0 });
  const { reduced } = useMotion();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = canvas.current, box = wrap.current;
    if (!el || !box || !weeks.length) return;
    const ctx = el.getContext('2d')!;
    const s = state.current;
    let W = 0, H = 0, dpr = 1, px = 26;
    const resize = () => { dpr = Math.min(2, window.devicePixelRatio || 1); W = box.clientWidth; H = box.clientHeight; el.width = W * dpr; el.height = H * dpr; px = W < 600 ? 30 : 46; draw(); };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const needle = W * .64, base = H * .66, amp = H * .34;
      const xOf = (i: number) => needle + (i - s.c) * px;
      // Paper: faint weekly grid, stronger month lines, year labels.
      for (let i = Math.max(0, Math.floor(s.c - needle / px) - 1); i <= Math.min(weeks.length - 1, Math.ceil(s.c + (W - needle) / px) + 1); i++) {
        const x = xOf(i), w = weeks[i], month = w.start.slice(5, 7), prev = weeks[i - 1];
        const newMonth = !prev || prev.start.slice(5, 7) !== month;
        ctx.fillStyle = newMonth ? 'rgb(7 36 26 / 0.16)' : 'rgb(7 36 26 / 0.06)';
        ctx.fillRect(Math.round(x), 0, 1, H);
        if (newMonth) { ctx.fillStyle = 'rgb(7 36 26 / 0.45)'; ctx.font = '500 10px ui-monospace, Consolas, monospace'; ctx.fillText(new Date(w.start + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase() + (month === '01' || !prev ? ` ${w.start.slice(0, 4)}` : ''), x + 4, H - 10); }
      }
      ctx.fillStyle = 'rgb(7 36 26 / 0.18)'; ctx.fillRect(0, base, W, 1);
      // Projects: a staff and a flag at the week each began. Labels take the
      // first of five rows with room; crowded flags go unlabelled. Staffs are
      // drawn first so no line ever crosses a label.
      const rows = [-1e9, -1e9, -1e9, -1e9, -1e9];
      ctx.font = '600 10.5px system-ui, sans-serif';
      const placed: { x: number; y: number; label: string; lw: number; done: boolean; row: number }[] = [];
      for (const m of marks) {
        const x = xOf(m.week) + (marks.filter(o => o.week === m.week).indexOf(m)) * 4;
        if (x < -220 || x > W + 20) continue;
        const label = m.title.length > 20 ? m.title.slice(0, 19) + '…' : m.title, lw = ctx.measureText(label).width;
        const row = rows.findIndex(end => end < x - 4);
        if (row >= 0) rows[row] = x + 12 + lw + 6;
        placed.push({ x, y: 12 + (row < 0 ? 5 : row) * 15, label, lw, done: m.week <= s.c, row });
      }
      for (const f of placed) {
        ctx.setLineDash([2, 4]); ctx.strokeStyle = f.done ? 'rgb(7 36 26 / 0.4)' : 'rgb(7 36 26 / 0.15)'; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, H - 26); ctx.stroke(); ctx.setLineDash([]);
      }
      for (const f of placed) {
        ctx.fillStyle = f.done ? '#07241a' : 'rgb(7 36 26 / 0.35)';
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + 8, f.y + 4); ctx.lineTo(f.x, f.y + 8); ctx.fill();
        if (f.row < 0) continue;
        ctx.fillStyle = 'rgb(251 248 239 / 0.94)'; ctx.fillRect(f.x + 9, f.y - 2, f.lw + 5, 12);
        ctx.fillStyle = f.done ? '#07241a' : 'rgb(7 36 26 / 0.45)'; ctx.fillText(f.label, f.x + 11, f.y + 8);
      }
      // Ink: two points per week so the trace oscillates like a seismograph.
      const pts: [number, number][] = [];
      const end = Math.min(weeks.length - 1, Math.floor(s.c));
      for (let i = Math.max(0, Math.floor(s.c - needle / px) - 2); i <= end; i++) {
        const a = Math.pow(weeks[i].count / max, .6) * amp;
        pts.push([xOf(i), base - a]); pts.push([xOf(i) + px / 2, base + a * .45]);
      }
      const tip = Math.pow((weeks[Math.max(0, Math.min(weeks.length - 1, Math.round(s.c)))]?.count ?? 0) / max, .6) * amp;
      pts.push([needle, base - tip + s.jitter]);
      ctx.lineWidth = 1.6; ctx.strokeStyle = '#07241a'; ctx.lineJoin = 'round';
      ctx.beginPath(); spline(ctx, pts); ctx.stroke();
      // Needle.
      ctx.fillStyle = '#07241a'; ctx.fillRect(needle - .5, 0, 1, base - tip + s.jitter);
      ctx.beginPath(); ctx.arc(needle, base - tip + s.jitter, 4, 0, Math.PI * 2); ctx.fillStyle = '#f3f1e6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#07241a'; ctx.stroke();
    };
    const tick = () => {
      s.frame = 0;
      if (!s.dragging && Math.abs(s.v) > .002 && !reduced) { s.c = Math.max(0, Math.min(weeks.length - 1, s.c + s.v)); s.v *= .9; }
      else if (!s.dragging) s.v = 0;
      s.jitter = reduced ? 0 : Math.sin(performance.now() / 70) * .8 + (Math.random() - .5) * .9;
      setCursor(Math.round(s.c));
      draw();
      if (s.visible && !reduced) s.frame = requestAnimationFrame(tick);
    };
    const wake = () => { if (!s.frame) s.frame = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) wake(); }, { rootMargin: '100px' });
    io.observe(box);
    const ro = new ResizeObserver(resize); ro.observe(box);
    resize(); setLive(true);
    const down = (e: PointerEvent) => { box.setPointerCapture(e.pointerId); s.dragging = true; s.v = 0; s.lastX = e.clientX; };
    const move = (e: PointerEvent) => { if (!s.dragging) return; const dx = e.clientX - s.lastX; s.lastX = e.clientX; const d = -dx / px; s.c = Math.max(0, Math.min(weeks.length - 1, s.c + d)); s.v = d; wake(); if (reduced) { setCursor(Math.round(s.c)); draw(); } };
    const up = () => { s.dragging = false; if (reduced) { s.c = Math.round(s.c); setCursor(s.c); draw(); } wake(); };
    const wheel = (e: WheelEvent) => { if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return; e.preventDefault(); const d = (e.shiftKey ? e.deltaY : e.deltaX) / px; s.c = Math.max(0, Math.min(weeks.length - 1, s.c + d)); wake(); if (reduced) { setCursor(Math.round(s.c)); draw(); } };
    box.addEventListener('pointerdown', down); box.addEventListener('pointermove', move); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up); box.addEventListener('wheel', wheel, { passive: false });
    (box as HTMLDivElement & { __seek?: (i: number) => void }).__seek = (i: number) => { s.v = 0; s.c = Math.max(0, Math.min(weeks.length - 1, i)); setCursor(Math.round(s.c)); draw(); };
    return () => { cancelAnimationFrame(s.frame); s.frame = 0; io.disconnect(); ro.disconnect(); box.removeEventListener('pointerdown', down); box.removeEventListener('pointermove', move); box.removeEventListener('pointerup', up); box.removeEventListener('pointercancel', up); box.removeEventListener('wheel', wheel); };
  }, [weeks, marks, max, reduced]);

  const seek = (i: number) => (wrap.current as (HTMLDivElement & { __seek?: (i: number) => void }) | null)?.__seek?.(i);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1, PageUp: 52, PageDown: -52 };
    if (e.key in map) { e.preventDefault(); seek(cursor + map[e.key]); }
    if (e.key === 'Home') { e.preventDefault(); seek(0); }
    if (e.key === 'End') { e.preventDefault(); seek(weeks.length - 1); }
  };
  const w = weeks[cursor];
  const here = marks.filter(m => m.week === cursor);
  const started = marks.filter(m => m.week <= cursor).length;
  const readout = w ? <><b>WEEK {w.iso} · {w.year}</b><span>{w.count} CONTRIBUTION{w.count === 1 ? '' : 'S'}</span><span>{started} / {marks.length} PROJECTS</span>{here.length > 0 && <span>⚑ {here.map(h => h.title.toUpperCase()).join(', ')}</span>}</> : <b>NO DATA YET</b>;
  const spark = weeks.map((wk, i) => `${(i / Math.max(1, weeks.length - 1)) * 1000},${100 - Math.pow(wk.count / max, .6) * 90}`).join(' ');

  const first = marks[0]?.date;
  return <StudyFrame id="study-03" number="03" name="THE SEISMOGRAPH" title={<>Steady,<br/><em>not sudden.</em></>}
    truth={`Every project I’ve put on GitHub, flagged where it began: ${marks.length} of them${first ? ` since ${monthYear(first)}` : ''}, on my real public activity.`}
    readout={readout} announce={w ? `Week ${w.iso}, ${w.year}: ${w.count} contributions${here.length ? `. Started: ${here.map(h => h.title).join(', ')}` : ''}` : ''}
    caption={<><p>Drag, scroll sideways, or use the arrow keys (<kbd>Page Up</kbd> / <kbd>Page Down</kbd> move a year). Pick any project below to find it on the line. {total} public contributions{since ? ` since ${fmt(since)}` : ''}{contributions.fetchedAt ? `, as of ${fmt(contributions.fetchedAt)}` : ''}.</p>
      <ol className="sm-projects" aria-label="All projects">{[...marks].reverse().map(m => <li key={m.name} className={m.week === cursor ? 'is-here' : ''}>
        <button type="button" onClick={() => seek(m.week)} aria-label={`Find ${m.title}, started ${monthYear(m.date)}, on the graph`}><strong>{m.title}</strong><small>{monthYear(m.date)}{m.language ? ` · ${m.language}` : ''}</small></button>
        <a href={m.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${m.title}${m.url === m.repo ? ' on GitHub' : ''}`}><ArrowUpRight size={15}/></a>
      </li>)}</ol>
      <p className="study-note">Public repositories only. Private client work isn’t counted.</p></>}
    className="study-seismo">
    <div className={`sm-paper ${live ? 'is-live' : ''}`} ref={wrap} tabIndex={0} role="slider" aria-label="Week" aria-valuemin={0} aria-valuemax={Math.max(0, weeks.length - 1)} aria-valuenow={cursor} aria-valuetext={w ? `Week ${w.iso}, ${w.year}, ${w.count} contributions` : 'No data'} onKeyDown={onKeyDown}>
      <canvas ref={canvas} aria-hidden="true"/>
      <svg className="sm-fallback" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true"><polyline points={spark}/></svg>
    </div>
  </StudyFrame>;
}
