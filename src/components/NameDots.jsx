import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { device } from '../lib/device'

// "Rushan" in pale ivory, "Haque" in brass
const INK = ['#f6eee4', '#e4c78f']

// The name in a few thousand dots, as on the previous portfolio. The letters are not type here: they are the drawn
// wordmark (lib/letters.js), traced straight onto a sampling canvas from its own paths, so the dots sit exactly on
// the letterforms at whatever size the page has given them. They gather into the name as the page opens, part
// around the cursor, and blow apart as the first screen scrolls away. On a phone the drawn name holds until the
// first touch of scroll, and the dots take over from it then.
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
    const typeFirst = phone || d.touch
    let shattering = false
    const px = (v) => Math.max(1, Math.round(v * dpr)) / dpr
    let W = 0
    let H = 0
    let groups = [[], []]
    let disposed = false
    let calm = 0
    let last = -1
    let visible = true
    const s = { intro: 0 }
    const pointer = { x: -9999, y: -9999, on: false }

    // One word, read off the page. It is drawn once onto a small canvas in the very font, size and spacing the
    // page has given it, and every inked pixel becomes a dot. Nothing in here knows the letterforms: whatever the
    // stylesheet says the name is set in, the dots take that shape.
    const sample = (el, step, wobble) => {
      const box = canvas.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      if (!r.width) return []
      const w = Math.ceil(W / step)
      const h = Math.ceil(H / step)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d', { willReadFrequently: true })
      const cs = getComputedStyle(el)
      g.scale(1 / step, 1 / step)
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing
      g.fillStyle = '#000'
      g.textBaseline = 'alphabetic'
      const text = el.textContent
      const m = g.measureText(text)
      g.translate(r.left - box.left, r.top - box.top + m.fontBoundingBoxAscent)
      // a canvas cannot reach the font's optical-size axis, so the word is stretched to the width the page gave it
      if (m.width) g.scale(r.width / m.width, 1)
      g.fillText(text, 0, 0)
      const data = g.getImageData(0, 0, w, h).data
      const pts = []
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) pts.push({ x: (x + 0.5 + (Math.random() - 0.5) * wobble) * step, y: (y + 0.5 + (Math.random() - 0.5) * wobble) * step })
      }
      return pts
    }

    const build = () => {
      const box = canvas.getBoundingClientRect()
      W = Math.round(box.width)
      H = Math.round(box.height)
      if (!W || !H) return
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const words = [...section.querySelectorAll('.mark__word')]
      if (words.length < 2) return
      const step = phone ? 1.3 : W > 1700 ? 3.5 : 3
      const budget = phone ? (d.tier === 'low' ? 4000 : d.tier === 'mid' ? 6000 : 8000) : (lite ? 6000 : 10000)
      const targets = words.map((el) => sample(el, step, phone ? 0 : 0.5))
      const total = targets.reduce((n, t) => n + t.length, 0)
      if (!total) return
      groups = targets.map((t, k) => {
        const n = Math.min(t.length, Math.round((budget * t.length) / total))
        const old = groups[k] || []
        return Array.from({ length: n }, (_, i) => {
          const p = old[i] || { x: W / 2 + (Math.random() - 0.5) * W, y: H / 2 + (Math.random() - 0.5) * H, vx: 0, vy: 0, dx: Math.random() - 0.5, dy: Math.random() - 0.5, seed: Math.random(), size: px(Math.random() < 0.12 ? (phone ? 1.7 : 2.6) : phone ? 1.25 : 1.8) }
          const q = t[Math.floor((i / n) * t.length)] || { x: W / 2, y: H / 2 }
          p.tx = q.x
          p.ty = q.y
          if (typeFirst && !old[i]) { p.x = q.x; p.y = q.y }
          return p
        })
      })
      if (!typeFirst) section.classList.add('is-dots')
      else s.intro = 1
      calm = 0
    }

    const draw = () => {
      if (disposed || !visible || document.hidden || !W) return
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
      if (calm > 20 && pr === last && !pointer.on) return
      const e = Math.min(1, pr / spreadEnd)
      const spread = e * e
      const alpha = Math.max(0, 1 - spread * 1.15) * (typeFirst ? Math.min(1, pr / 0.03) : 1)
      const t = s.intro
      ctx.clearRect(0, 0, W, H)
      let motion = 0
      groups.forEach((ps, k) => {
        ctx.fillStyle = INK[k]
        ctx.globalAlpha = alpha
        for (const p of ps) {
          const tx = p.tx + p.dx * spread * W * 1.6 + Math.sin(p.seed * 30 + t * 6) * (1 - t) * 220
          const ty = p.ty + p.dy * spread * H * 1.6 - spread * 140
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
          if (alpha > 0.01) ctx.fillRect(Math.round(p.x * dpr) / dpr, Math.round(p.y * dpr) / dpr, p.size, p.size)
        }
      })
      ctx.globalAlpha = 1
      const n = groups[0].length + groups[1].length || 1
      calm = t > 0.995 && pr === last && motion / n < 0.01 ? calm + 1 : 0
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
    // the drawing is laid out in CSS, so it is sampled after the fonts and the first paint have settled
    document.fonts.ready.then(() => !disposed && requestAnimationFrame(() => !disposed && build()))
    api.current = { s, wake: () => { calm = 0 } }
    return () => {
      disposed = true
      gsap.ticker.remove(draw)
      io.disconnect()
      clearTimeout(timer)
      removeEventListener('resize', resize)
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      section.classList.remove('is-dots', 'is-shatter')
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the dots gather into the name as the cover lifts
  useEffect(() => {
    const a = api.current
    if (!intro || !a || a.s.intro >= 1) return
    gsap.to(a.s, { intro: 1, duration: 2.4, ease: 'expo.out', onUpdate: a.wake })
  }, [intro])

  return <canvas className="thr__dots" ref={ref} aria-hidden="true" />
}
