import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { device } from '../lib/device'
import { STROKE } from '../lib/letters'

const NS = 'http://www.w3.org/2000/svg'
// "Rushan" in pale ivory, "Haque" in brass
const INK = ['#f6eee4', '#e4c78f']
// the beat the drawn strokes are given in styles/sections.css: about a second for a letter, the next one just behind
const DRAW = 1.15
const LAG = 0.085
// how far behind the point of the pen its dots are still landing, as a share of the letter
const FEATHER = 0.11
// how many pieces each stroke is cut into: a dot remembers which piece it fell in, and so when its turn comes
const SLICES = 32
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t)

// cubic-bezier(.62, .02, .2, 1), solved: the very curve the drawn strokes use, so the dots keep step with them
const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  return (t) => {
    let u = t
    for (let i = 0; i < 6; i++) {
      const off = ((ax * u + bx) * u + cx) * u - t
      const slope = (3 * ax * u + 2 * bx) * u + cx
      if (slope === 0 || Math.abs(off) < 1e-5) break
      u -= off / slope
    }
    return ((ay * u + by) * u + cy) * u
  }
}
const EASE = bezier(0.62, 0.02, 0.2, 1)

// The name in a few thousand dots, as on the previous portfolio. The letters are not type: they are the drawn
// wordmark (lib/letters.js), traced from its own paths, so the dots sit exactly on the letterforms at whatever size
// the page has given them. And they do not simply appear — the name writes itself on, stroke by stroke and in the
// order a hand would take them, because every dot knows how far along its letter it fell. Afterwards they part
// around the cursor, and blow apart as the first screen scrolls away.
export default function NameDots({ intro, progress, spreadEnd = 0.55 }) {
  const ref = useRef(null)
  const api = useRef(null)

  useEffect(() => {
    const d = device()
    const canvas = ref.current
    const section = canvas.closest('.thr')
    if (d.reduced) return undefined
    const ctx = canvas.getContext('2d')
    const lite = d.tier !== 'high'
    const dpr = Math.min(devicePixelRatio || 1, 3)
    const phone = innerWidth < 900
    // a device too old for any of this keeps the drawn strokes, and the dots only take over on the scroll
    const typeFirst = d.tier === 'low'
    let shattering = false
    const px = (v) => Math.max(1, Math.round(v * dpr)) / dpr
    let W = 0
    let H = 0
    let groups = [[], []]
    let pen = new Float32Array(1)
    let fly = 60
    let job = 0
    let disposed = false
    let calm = 0
    let last = -1
    let visible = true
    const s = { intro: 0, span: 2, want: false, built: false, playing: false }
    const pointer = { x: -9999, y: -9999, on: false }

    // a path of its own to measure with, so the lengths owe nothing to how the wordmark happens to be marked up
    const scratch = document.createElementNS(NS, 'svg')
    scratch.setAttribute('aria-hidden', 'true')
    scratch.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none')
    const probe = document.createElementNS(NS, 'path')
    scratch.appendChild(probe)
    section.appendChild(scratch)

    // One word, opened for tracing. Each letter is stroked onto a small canvas a slice at a time, the last slice
    // first, so that wherever the ink lands it carries the moment a pen would have reached it: red says how far
    // along its letter the slice was, green says which letter. That one trick is what lets the dots draw themselves
    // on in the right order — nothing else in here knows anything about the shapes.
    const open = (svg, base, step) => {
      const box = canvas.getBoundingClientRect()
      const r = svg.getBoundingClientRect()
      if (!r.width || !r.height) return null
      const vb = svg.viewBox.baseVal
      const k = r.width / vb.width
      // room for the one stroke that hangs outside its box: the tail of the Q
      const pad = Math.ceil(r.height * 0.2) + 2
      const x0 = Math.floor(r.left - box.left) - pad
      const y0 = Math.floor(r.top - box.top) - pad
      const w = Math.ceil((r.width + pad * 2) / step)
      const h = Math.ceil((r.height + pad * 2) / step)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d')
      const q = k / step
      const home = [q, 0, 0, q, (r.left - box.left - x0) / step - vb.x * q, (r.top - box.top - y0) / step - vb.y * q]
      g.lineWidth = STROKE
      g.lineCap = 'butt'
      g.lineJoin = 'miter'
      g.miterLimit = 4
      const paths = [...svg.querySelectorAll('path')]
      return {
        n: paths.length,
        height: r.height,
        ink(li) {
          const path = paths[li]
          const at = path.transform.baseVal.consolidate()?.matrix
          const parts = path.getAttribute('d').split(/(?=M)/).filter(Boolean)
          const lens = parts.map((p) => { probe.setAttribute('d', p); return probe.getTotalLength() })
          const whole = lens.reduce((a, b) => a + b, 0) || 1
          g.setTransform(...home)
          if (at) g.transform(at.a, at.b, at.c, at.d, at.e, at.f)
          let before = 0
          parts.forEach((p, j) => {
            const L = lens[j]
            const n = Math.max(2, Math.round((SLICES * L) / whole))
            const unit = L / n
            const shape = new Path2D(p)
            // the slices overlap, so that a corner is always well inside one of them and keeps its proper join
            g.setLineDash([unit * 1.7, L * 2])
            for (let b = n - 1; b >= 0; b--) {
              g.lineDashOffset = -b * unit
              const f = (before + (b + 0.5) * unit) / whole
              g.strokeStyle = `rgb(${4 + Math.round(f * 248)},${4 + li * 20},0)`
              g.stroke(shape)
            }
            before += L
          })
          g.setLineDash([])
        },
        read() {
          const data = g.getImageData(0, 0, w, h).data
          const out = []
          for (let iy = 0; iy < h; iy++) {
            for (let ix = 0; ix < w; ix++) {
              const i = (iy * w + ix) * 4
              if (data[i + 3] < 120) continue
              out.push({
                x: x0 + (ix + 0.5) * step,
                y: y0 + (iy + 0.5) * step,
                li: base + Math.round((data[i + 1] - 4) / 20),
                f: clamp01((data[i] - 4) / 248),
              })
            }
          }
          return out
        },
      }
    }

    const settle = (sheets) => {
      const targets = sheets.map((sh) => sh.read())
      const all = targets.reduce((n, t) => n + t.length, 0)
      if (!all) return
      const letters = sheets.reduce((n, sh) => n + sh.n, 0)
      pen = new Float32Array(letters)
      s.span = DRAW + LAG * (letters - 1)
      fly = Math.max(26, sheets[0].height * 0.55)
      const budget = phone ? (d.tier === 'low' ? 4000 : 6500) : (lite ? 8000 : 13000)
      const done = s.intro >= 1
      groups = targets.map((t, gi) => {
        const n = Math.min(t.length, Math.round((budget * t.length) / all))
        const old = groups[gi] || []
        return Array.from({ length: n }, (_, i) => {
          const q = t[Math.floor((i / n) * t.length)] || t[0]
          const p = old[i] || { x: 0, y: 0, vx: 0, vy: 0, dx: Math.random() - 0.5, dy: Math.random() - 0.5, size: px(Math.random() < 0.12 ? (phone ? 1.9 : 2.2) : phone ? 1.45 : 1.5) }
          p.tx = q.x
          p.ty = q.y
          p.li = q.li
          // its own moment along the letter, nudged a little so the pen's edge never arrives in steps
          p.f = clamp01(q.f + (Math.random() - 0.5) / SLICES)
          const a = Math.random() * Math.PI * 2
          const far = fly * (0.3 + Math.random() * 0.7)
          p.ox = Math.cos(a) * far
          p.oy = Math.sin(a) * far
          if (!old[i]) {
            p.x = q.x + (done ? 0 : p.ox)
            p.y = q.y + (done ? 0 : p.oy)
          }
          return p
        })
      })
      s.built = true
      calm = 0
      play()
    }

    // The tracing is cut into small pieces and spread over a few frames: a phone must never spend a long slice of
    // the main thread on it while the first screen is still arriving.
    const build = () => {
      cancelAnimationFrame(job)
      const box = canvas.getBoundingClientRect()
      W = Math.round(box.width)
      H = Math.round(box.height)
      if (!W || !H) return
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const words = [...section.querySelectorAll('.mark__word')]
      if (words.length < 2) return
      const step = phone ? 1.3 : W > 1700 ? 2.1 : 1.8
      let base = 0
      const sheets = []
      for (const svg of words) {
        const sh = open(svg, base, step)
        if (!sh) return
        base += sh.n
        sheets.push(sh)
      }
      const jobs = []
      sheets.forEach((sh) => { for (let i = 0; i < sh.n; i++) jobs.push([sh, i]) })
      let at = 0
      const run = () => {
        if (disposed) return
        const until = Math.min(jobs.length, at + 3)
        for (; at < until; at++) jobs[at][0].ink(jobs[at][1])
        if (at < jobs.length) { job = requestAnimationFrame(run); return }
        settle(sheets)
      }
      job = requestAnimationFrame(run)
    }

    // The dots take the name over from the drawn strokes at the moment they are ready to carry it, and not before.
    const play = () => {
      if (!s.want || !s.built || s.playing) return
      s.playing = true
      if (typeFirst) { s.intro = 1; return }
      section.classList.add('is-dots')
      gsap.to(s, { intro: 1, duration: s.span, ease: 'none', onUpdate: () => { calm = 0 } })
    }

    const draw = () => {
      if (disposed || !visible || document.hidden || !W || !groups[0].length) return
      const pr = progress.current || 0
      if (typeFirst) {
        // the drawn name stands until the scroll begins, then hands over to the dots
        const live = pr > 0.004
        if (live !== shattering) {
          shattering = live
          section.classList.toggle('is-shatter', live)
          if (!live) {
            ctx.clearRect(0, 0, W, H)
            groups.forEach((ps) => ps.forEach((p) => { p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0 }))
          }
          calm = 0
        }
        if (!live) { last = pr; return }
      }
      const writing = s.intro < 1
      if (calm > 20 && pr === last && !pointer.on && !writing) return
      const e = Math.min(1, pr / spreadEnd)
      const spread = e * e
      const alpha = Math.max(0, 1 - spread * 1.15) * (typeFirst ? Math.min(1, pr / 0.03) : 1)
      // where the pen has reached on each letter: one behind the next, on the strokes' own curve. It is carried a
      // little past the end so that the last dots of a letter land too.
      if (writing) {
        const t = s.intro * s.span
        for (let i = 0; i < pen.length; i++) pen[i] = EASE(clamp01((t - i * LAG) / DRAW)) * (1 + FEATHER)
      }
      ctx.clearRect(0, 0, W, H)
      let motion = 0
      let live = 0
      groups.forEach((ps, gi) => {
        ctx.fillStyle = INK[gi]
        ctx.globalAlpha = alpha
        for (const p of ps) {
          let k = 1
          if (writing) {
            k = (pen[p.li] - p.f) / FEATHER
            // the pen has not come this way yet: the dot is not there to be moved or drawn
            if (k <= 0) continue
            if (k > 1) k = 1
          }
          live++
          const back = (1 - k) * (1 - k)
          const tx = p.tx + p.dx * spread * W * 1.6 + p.ox * back
          const ty = p.ty + p.dy * spread * H * 1.6 - spread * 140 + p.oy * back
          let ax = (tx - p.x) * 0.055
          let ay = (ty - p.y) * 0.055
          if (pointer.on) {
            const ddx = p.x - pointer.x
            const ddy = p.y - pointer.y
            const d2 = ddx * ddx + ddy * ddy
            if (d2 < 16000) {
              const f = (1 - d2 / 16000) * 5.5
              const dd = Math.sqrt(d2) || 1
              ax += (ddx / dd) * f
              ay += (ddy / dd) * f
            }
          }
          p.vx = (p.vx + ax) * 0.82
          p.vy = (p.vy + ay) * 0.82
          p.x += p.vx
          p.y += p.vy
          motion += Math.abs(p.vx) + Math.abs(p.vy)
          if (alpha <= 0.01) continue
          const x = Math.round(p.x * dpr) / dpr
          const y = Math.round(p.y * dpr) / dpr
          if (k >= 1) { ctx.fillRect(x, y, p.size, p.size) } else {
            // just laid down: a touch larger and still gathering its colour
            const sz = p.size * (1 + (1 - k) * 0.8)
            const lit = k * 2.2
            if (lit < 1) {
              ctx.globalAlpha = alpha * lit
              ctx.fillRect(x, y, sz, sz)
              ctx.globalAlpha = alpha
            } else ctx.fillRect(x, y, sz, sz)
          }
        }
      })
      ctx.globalAlpha = 1
      calm = !writing && pr === last && motion / (live || 1) < 0.01 ? calm + 1 : 0
      last = pr
    }
    gsap.ticker.add(draw)

    // only a mouse stirs the dots: a finger on a phone is scrolling, not pointing
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      const b = canvas.getBoundingClientRect()
      pointer.x = e.clientX - b.left
      pointer.y = e.clientY - b.top
      pointer.on = true
      calm = 0
    }
    const leave = () => { pointer.on = false; calm = 0 }
    section.addEventListener('pointermove', move, { passive: true })
    section.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; calm = 0 })
    io.observe(canvas)
    let lastW = innerWidth
    let timer = 0
    const resize = () => {
      if (d.touch && innerWidth === lastW) return
      lastW = innerWidth
      clearTimeout(timer)
      timer = setTimeout(build, 180)
    }
    addEventListener('resize', resize)
    // the drawing is laid out in CSS, so it is traced once the fonts and the first paint have settled
    document.fonts.ready.then(() => !disposed && requestAnimationFrame(() => !disposed && build()))
    api.current = { s, play, wake: () => { calm = 0 } }
    return () => {
      disposed = true
      gsap.ticker.remove(draw)
      cancelAnimationFrame(job)
      io.disconnect()
      clearTimeout(timer)
      removeEventListener('resize', resize)
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      section.classList.remove('is-dots', 'is-shatter')
      scratch.remove()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the name is written on as the cover lifts, and not before
  useEffect(() => {
    const a = api.current
    if (!intro || !a) return
    a.s.want = true
    a.play()
  }, [intro])

  return <canvas className="thr__dots" ref={ref} aria-hidden="true" />
}
