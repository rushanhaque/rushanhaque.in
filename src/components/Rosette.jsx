import { useEffect, useId, useRef, useState } from 'react'
import { device } from '../lib/device'
import { ticker } from '../lib/motion'

// A guilloché rosette: the engraving on a watch dial or a banknote, the craft of the Brass City where most of the
// work on this site is made. Three bands of interlaced waves and a few hairline rings, worked out in the browser
// (the HTML stays light), drawn on stroke by stroke as it arrives, and turned very slowly. With a mouse, light
// catches the engraving where the pointer passes.
const TAU = Math.PI * 2
function band({ r, a, k, n, m = 0, b = 0, step = 14 }) {
  const out = []
  for (let j = 0; j < n; j++) {
    const ph = (j / n) * (TAU / k)
    const steps = k * step
    let d = ''
    for (let s = 0; s <= steps; s++) {
      const t = (s / steps) * TAU
      const rr = r + a * Math.sin(k * t + ph * k) * (1 - b + b * Math.cos(m * t))
      const x = 500 + rr * 500 * Math.cos(t)
      const y = 500 + rr * 500 * Math.sin(t)
      d += `${s ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    }
    out.push(`${d}Z`)
  }
  return out
}
function build() {
  return [
    { cls: 'is-a', paths: band({ r: 0.86, a: 0.055, k: 54, n: 7, m: 6, b: 0.35 }) },
    { cls: 'is-b', paths: band({ r: 0.6, a: 0.11, k: 22, n: 9, m: 4, b: 0.25, step: 20 }) },
    { cls: 'is-c', paths: band({ r: 0.31, a: 0.13, k: 12, n: 8, step: 28 }) },
  ]
}
const RINGS = [0.97, 0.935, 0.74, 0.46, 0.165]

export default function Rosette({ className = '', glint = true }) {
  const root = useRef(null)
  const [bands, setBands] = useState(null)
  const art = `ros-${useId().replace(/[^a-z0-9]/gi, '')}`
  useEffect(() => {
    // after the first paint, and only once it is near the screen: the words come first, the ornament a breath later
    let id = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      id = requestAnimationFrame(() => setBands(build()))
    }, { rootMargin: '60% 0px' })
    io.observe(root.current)
    return () => { io.disconnect(); cancelAnimationFrame(id) }
  }, [])

  useEffect(() => {
    const d = device()
    const el = root.current
    if (!bands || !glint || !d.fine || d.reduced || d.tier !== 'high') return undefined
    el.classList.add('has-glint')
    const p = { x: -999, y: -999, on: false }
    const write = () => { el.style.setProperty('--mx', `${p.x}px`); el.style.setProperty('--my', `${p.y}px`); ticker.remove(write) }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      p.x = Math.round(e.clientX - r.left)
      p.y = Math.round(e.clientY - r.top)
      ticker.add(write)
    }
    addEventListener('pointermove', move, { passive: true })
    return () => { removeEventListener('pointermove', move); ticker.remove(write) }
  }, [bands, glint])

  const svg = (use) => (
    <svg className="ros__svg" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      {use ? <use href={`#${art}`} /> : (
        <g id={art}>
          {RINGS.map((r, i) => <circle key={i} className="ros__ring" cx="500" cy="500" r={r * 500} pathLength="1" style={{ '--d': `${i * 0.12}s` }} />)}
          {bands?.map((b, bi) => (
            <g key={b.cls} className={`ros__band ${b.cls}`}>
              {b.paths.map((d, i) => <path key={i} d={d} pathLength="1" style={{ '--d': `${0.2 + bi * 0.35 + i * 0.07}s` }} />)}
            </g>
          ))}
        </g>
      )}
    </svg>
  )
  return (
    <div className={`ros ${bands ? 'is-drawn' : ''} ${className}`} ref={root} aria-hidden="true">
      {svg(false)}
      {bands && glint && <div className="ros__glint">{svg(true)}</div>}
    </div>
  )
}
