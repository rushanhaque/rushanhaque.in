'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Pause, Play } from 'lucide-react';
import data from '@/content/studies/rewind.json';
import { useMotion } from '@/components/site-motion';
import { StudyFrame } from '@/components/studies/study-frame';

const { commits, milestones } = data;
const STEPS = 1000;
const first = new Date(commits[0].date + 'T00:00:00Z').getTime();
const shortDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

// Study 02 — scrub the playhead through the real history of a shipped site:
// milestone renders cross-fade, and the commit board flips past in step.
export function RewindStudy() {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { reduced } = useMotion();
  const tween = useRef<gsap.core.Tween | null>(null);

  const span = milestones.length - 1;
  const raw = (pos / STEPS) * span;
  const a = Math.min(span, Math.floor(raw)), b = Math.min(span, a + 1), t = raw - a;
  const commitIndex = Math.round(milestones[a].index + (milestones[b].index - milestones[a].index) * t);
  const commit = commits[commitIndex];
  const week = Math.floor((new Date(commit.date + 'T00:00:00Z').getTime() - first) / 604800000) + 1;
  // The board shows the real commits around the playhead; untitled ones say so.
  const board = useMemo(() => {
    const start = Math.max(0, Math.min(commits.length - 5, commitIndex - 2));
    return commits.slice(start, start + 5).map((c, k) => ({ ...c, current: start + k === commitIndex }));
  }, [commitIndex]);

  const play = () => {
    if (isPlaying) { tween.current?.kill(); setPlaying(false); return; }
    const state = { p: pos >= STEPS ? 0 : pos };
    setPlaying(true);
    tween.current = gsap.to(state, { p: STEPS, duration: 8 * (1 - state.p / STEPS) || 8, ease: 'none', onUpdate: () => setPos(Math.round(state.p)), onComplete: () => setPlaying(false) });
  };
  useEffect(() => () => { tween.current?.kill(); }, []);
  // Switching motion off mid-play stops the tween; the button reads as paused.
  useEffect(() => { if (reduced) tween.current?.kill(); }, [reduced]);
  const isPlaying = playing && !reduced;

  const readout = <><b>COMMIT {commitIndex + 1} / {commits.length}</b><span>WEEK {week}</span><span>{shortDate(commit.date).toUpperCase()}</span><span className="rw-msg">{commit.placeholder ? 'UNTITLED COMMIT' : `“${commit.message}”`}</span></>;

  return <StudyFrame id="study-02" number="02" name="REWIND THE BUILD" title={<>The final design<br/>was <em>earned, not lucky.</em></>}
    truth="Good design is rarely an accident. Here’s one, commit by commit."
    readout={readout} announce={`${milestones[t < .5 ? a : b].label}, ${shortDate(commit.date)}, commit ${commitIndex + 1} of ${commits.length}`}
    caption={<><p>Drag the playhead, or use the arrow keys (<kbd>Home</kbd> and <kbd>End</kbd> jump to the ends). Every frame is the real Casa &amp; Crop site at that commit.</p><p className="study-note">From 5 August, most commits are the client publishing from the admin I built.</p></>}
    className="study-rewind">
    <div className="rw-frame">
      {milestones.map((m, i) => <img key={m.image + i} src={m.image} alt={i === (t < .5 ? a : b) ? `Casa & Crop at commit ${m.hash}, ${m.date}: ${m.caption}` : ''} aria-hidden={i === (t < .5 ? a : b) ? undefined : true}
        loading={i < 2 ? 'eager' : 'lazy'} decoding="async" style={{ opacity: i === a ? 1 : i === b ? t : 0, zIndex: i === b ? 2 : 1 }}/>)}
      <span className="rw-stamp"><b>{milestones[t < .5 ? a : b].label}</b>{shortDate(milestones[t < .5 ? a : b].date)} · {milestones[t < .5 ? a : b].hash}</span>
    </div>
    <ol className="rw-board" aria-label="Commits around the playhead">{board.map(c => <li key={c.hash} className={`${c.current ? 'is-current' : ''} ${c.placeholder ? 'is-untitled' : ''}`}><span>{c.hash}</span><span>{shortDate(c.date)}</span><span>{c.placeholder ? 'untitled commit' : c.message}</span></li>)}</ol>
    <div className="rw-timeline">
      <button type="button" className="rw-play" onClick={play} disabled={reduced} aria-label={isPlaying ? 'Pause the history' : 'Play the whole history'}>{isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
      <div className="rw-track">
        <input type="range" min={0} max={STEPS} step={10} value={pos} onChange={e => { tween.current?.kill(); setPlaying(false); setPos(Number(e.target.value)); }}
          aria-label="Project history" aria-valuetext={`${milestones[t < .5 ? a : b].label}, ${shortDate(commit.date)}, commit ${commitIndex + 1} of ${commits.length}`}/>
        <div className="rw-ticks" aria-hidden="true">{milestones.map((m, i) => <span key={m.label} style={{ left: `${(i / span) * 100}%` }} className={i === (t < .5 ? a : b) ? 'is-on' : ''}><i/>{m.label}</span>)}</div>
      </div>
    </div>
  </StudyFrame>;
}
