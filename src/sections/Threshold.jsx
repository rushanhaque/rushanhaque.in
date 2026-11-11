import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReady } from '../lib/ready'
import { device } from '../lib/device'
import HeroShader from '../components/HeroShader'
import NameDots from '../components/NameDots'
import { site } from '../config/site'
import Wordmark from '../components/Wordmark'

const LINE = ['Interfaces,', 'builds', 'and', 'the', 'client', 'care', 'in', 'between.']
const CODE = 'abcdefghijklmnopqrstuvwxyz{}[]()<>/=;:.*+-_'
const range = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const easeIn = (t) => t * t
const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t)

// As on the previous site: "Developer" resolves out of code, then "& writer." joins it. They hold, and play again,
// but only while the name is there to read beside them.
function Roles({ ready, line }) {
  const dev = useRef(null)
  const wri = useRef(null)
  useGSAP(() => {
    const d = dev.current
    const w = wri.current
    if (!ready || device().reduced) return undefined
    const write = (el, code, text, lit) => gsap.timeline()
      .call(() => { el.className = 'thr__role is-code'; el.textContent = '' })
      .to(el, { duration: 0.7, ease: 'none', scrambleText: { text: code, chars: CODE, speed: 0.9, revealDelay: 0.1 } })
      .call(() => { el.className = `thr__role${lit ? ' is-lit' : ''}` })
      .to(el, { duration: 0.9, ease: 'none', scrambleText: { text, chars: CODE, speed: 0.6, revealDelay: 0.2 } })
    const first = document.documentElement.classList.contains('intro')
    if (first) { d.textContent = ''; w.textContent = '' }
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3, delay: first ? 1.5 : 0.7 })
      .call(() => { d.textContent = ''; w.textContent = '' })
      .add(write(d, '<developer />', 'Developer', false))
      .add(write(w, '// & writer', '& writer.', true), '+=0.15')
      .to({}, { duration: 4.6 })
    line.current = tl
    return () => {
      tl.kill()
      line.current = null
      d.textContent = 'Developer'
      d.className = 'thr__role'
      w.textContent = '& writer.'
      w.className = 'thr__role is-lit'
    }
  }, { dependencies: [ready] })
  return (
    <p className="thr__roles">
      <span className="sr-only">Developer and writer.</span>
      <span className="thr__role" ref={dev} aria-hidden="true">Developer</span>
      <span className="thr__role is-lit" ref={wri} aria-hidden="true">&amp; writer.</span>
    </p>
  )
}

// The first screen, as on the previous portfolio and finished: the name set in Geist and carried by a few thousand dots, over liquid wine with a brass horizon, and what it does written out of code beneath it. Scrolling
// holds the screen, blows the name apart and
// opens a ring of light; inside it is ivory and the next line, and as the ring fills the screen the whole page turns
// from night to day (lib/tone.js, at the marker below). The real letters stay in the page for search engines, screen
// readers and anyone without motion.
const RING = [0.02, 0.87]
const OPEN = [0.08, 0.93]
const TURN = 0.78
export default function Threshold() {
  const root = useRef(null)
  const name = useRef(null)
  const roles = useRef(null)
  const cue = useRef(null)
  const meta = useRef(null)
  const ring = useRef(null)
  const aperture = useRef(null)
  const next = useRef(null)
  const line = useRef(null)
  const progress = useRef(0)
  const m = useRef({ p: 0, last: -1, words: [] })
  const ready = useReady()

  const paint = (p) => {
    const s = m.current
    progress.current = p
    const w = innerWidth
    const h = innerHeight
    // the words around the name step aside first
    const away = 1 - range(p, 0, 0.2)
    if (roles.current) {
      roles.current.style.opacity = away.toFixed(3)
      roles.current.style.transform = away >= 1 ? '' : `translateY(${((1 - away) * -24).toFixed(1)}px)`
      roles.current.style.visibility = away < 0.01 ? 'hidden' : 'visible'
    }
    const quick = (1 - range(p, 0, 0.15)).toFixed(3)
    if (cue.current) cue.current.style.opacity = quick
    if (meta.current) meta.current.style.opacity = quick
    if (line.current) line.current.paused(away < 0.01)
    // the name lifts towards you and fades as the ring opens behind it
    if (name.current) {
      const t = easeIn(range(p, 0, 0.6))
      name.current.style.transform = t > 0 ? `scale(${(1 + t * 0.3).toFixed(4)})` : ''
      name.current.style.opacity = (1 - range(p, 0.12, 0.5)).toFixed(3)
    }
    // the ring of light, exactly on the edge of the opening
    const cx = w / 2
    const cy = h * 0.55
    const full = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 2
    const r = easeIn(range(p, OPEN[0], OPEN[1])) * full
    if (ring.current) {
      const k = easeIn(range(p, RING[0], RING[1]))
      const unit = Math.max(w, h) * 0.2
      ring.current.style.transform = `scale(${(Math.max(0.2, r / unit)).toFixed(4)})`
      ring.current.style.opacity = (range(p, RING[0], RING[0] + 0.08) * (1 - range(p, 0.84, 0.93)) * (k > 0 ? 1 : 0)).toFixed(3)
    }
    if (aperture.current) {
      aperture.current.style.visibility = r < 1 ? 'hidden' : 'visible'
      aperture.current.style.clipPath = r >= full - 1 ? 'none' : `circle(${r.toFixed(1)}px at 50% 55%)`
    }
    // and what was behind it, rising word by word
    if (next.current) {
      next.current.style.opacity = easeOut(range(p, 0.6, 0.76)).toFixed(3)
      s.words.forEach((el, i) => {
        const k = easeOut(range(p, 0.62 + i * 0.014, 0.86 + i * 0.014))
        el.style.transform = k >= 1 ? 'none' : `translateY(${((1 - k) * 116).toFixed(1)}%)`
      })
    }
  }

  useEffect(() => { m.current.words = [...root.current.querySelectorAll('.thr__w i')] }, [])

  useChapter(root, {
    id: 'threshold',
    name: 'Start',
    time: [6.4, 6.9],
    frame: ({ stick }) => {
      const s = m.current
      s.p += (stick - s.p) * 0.14
      if (Math.abs(stick - s.p) < 0.0006) s.p = stick
      if (s.p === s.last) return
      s.last = s.p
      paint(s.p)
    },
    // a jump straight past it must not leave it half open
    leave: () => { const s = m.current; s.p = 1; s.last = 1; paint(1) },
  })

  let k = 0
  return (
    <section className="thr pin" ref={root} id="threshold" aria-label="Rushan Haque" data-fixed="night" style={{ '--turn': TURN }}>
      <i className="thr__dawn" data-tone="ivory" aria-hidden="true" />
      <div className="pin__stage thr__stage">
        <HeroShader intro={ready} progress={progress} />
        <NameDots intro={ready} progress={progress} />
        <div className="thr__center">
          <h1 className="thr__name" ref={name}>
            <span className="sr-only">{site.name}</span>
            <Wordmark />
          </h1>
          <div ref={roles}><Roles ready={ready} line={line} /></div>
        </div>
        <span className="thr__cue" ref={cue} aria-hidden="true"><i /></span>
        <div className="thr__meta" ref={meta} aria-hidden="true">
          <p>{site.city}, India <span>28.84° N, 78.77° E</span></p>
          <p>Selected works <span>2024 to {new Date().getFullYear()}</span></p>
        </div>
        <span className="thr__ring" ref={ring} aria-hidden="true" />
        <div className="thr__open" ref={aperture} data-fixed="ivory">
          <div className="thr__next wrap" ref={next}>
            <span className="note">{site.role}, {site.city}</span>
            <p className="thr__line">{LINE.map((w, i) => <span key={w}><span className="thr__w"><i className={i > 5 ? 'lit' : undefined}>{w}</i></span>{' '}</span>)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
