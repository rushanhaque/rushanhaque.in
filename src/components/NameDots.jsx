import { useEffect, useRef } from 'react'
import { gsap, isTouch, reduced } from '../lib/gsap'
import { tier } from '../lib/device'

const INK = ['#f6eee4', '#e4c78f']

/**
 * The name in a few thousand dots. The real name stays in the page, laid out but invisible,
 * and each word is sampled from exactly where it sits, so the dots match the type at any size.
 * The dots gather into the name, part around the cursor, and blow apart as the hero scrolls on.
 * `progress` is the hero's scroll progress; the dots are fully scattered by `spreadEnd`.
 */
export default function NameDots({ intro = false, progress, spreadEnd = 0.55 }) {
  const ref = useRef(null)
  const api = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const section = canvas.parentElement
    if (reduced()) return
    const ctx = canvas.getContext('2d')
    const lite = tier() !== 'high'
    const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
    const phone = window.innerWidth < 900
    let W = 0
    let H = 0
    let groups = [[], []]
    let disposed = false
    let calm = 0
    let last = -1
    let visible = true
    const s = { intro: 0 }
    const pointer = { x: -9999, y: -9999, on: false }

    // draw each word where the page set it, at 1/step scale, and keep the inked pixels
    const sample = (el, step) => {
      const w = Math.ceil(W / step)
      const h = Math.ceil(H / step)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d', { willReadFrequently: true })
      const cs = getComputedStyle(el)
      const box = canvas.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      g.scale(1 / step, 1 / step)
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      if ('letterSpacing' in g) g.letterSpacing = cs.letterSpacing
      g.fillStyle = '#000'
      g.textBaseline = 'alphabetic'
      const text = el.textContent
      const m = g.measureText(text)
      // the canvas cannot set the optical-size axis, so stretch the word to the width the page gave it
      g.translate(r.left - box.left, r.top - box.top + m.fontBoundingBoxAscent)
      g.scale(r.width / m.width, 1)
      g.fillText(text, 0, 0)
      const data = g.getImageData(0, 0, w, h).data
      const pts = []
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 140) pts.push([(x + 0.5 + (Math.random() - 0.5) * 0.5) * step, (y + 0.5 + (Math.random() - 0.5) * 0.5) * step])
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
      const words = [section.querySelector('.hero__l1 .hero__txt'), section.querySelector('.hero__l2 em')]
      const step = phone ? 2 : W > 1700 ? 3.5 : 3
      const budget = phone ? (lite ? 3000 : 5200) : (lite ? 6000 : 10000)
      const targets = words.map((el) => (el ? sample(el, step) : []))
      const total = targets[0].length + targets[1].length || 1
      groups = targets.map((t, k) => {
        const n = Math.min(t.length, Math.round((budget * t.length) / total))
        const old = groups[k] || []
        return Array.from({ length: n }, (_, i) => {
          const p = old[i] || { x: W / 2 + (Math.random() - 0.5) * W, y: H / 2 + (Math.random() - 0.5) * H, vx: 0, vy: 0, dx: Math.random() - 0.5, dy: Math.random() - 0.5, seed: Math.random(), size: Math.random() < 0.12 ? (phone ? 2.4 : 2.6) : phone ? 1.9 : 1.8 }
          const [x, y] = t[Math.floor((i / n) * t.length)] || [W / 2, H / 2]
          p.tx = x
          p.ty = y
          return p
        })
      })
      section.classList.add('is-dots')
      calm = 0
    }

    const draw = () => {
      if (disposed || !visible || document.hidden || !W) return
      const pr = progress?.current || 0
      if (calm > 20 && pr === last && !pointer.on) return
      const e = Math.min(1, pr / spreadEnd)
      const spread = e * e
      const alpha = Math.max(0, 1 - spread * 1.15)
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
              const d = Math.sqrt(d2) || 1
              ax += (ddx / d) * f
              ay += (ddy / d) * f
            }
          }
          p.vx = (p.vx + ax) * 0.82
          p.vy = (p.vy + ay) * 0.82
          p.x += p.vx
          p.y += p.vy
          motion += Math.abs(p.vx) + Math.abs(p.vy)
          if (alpha > 0.01) ctx.fillRect(p.x, p.y, p.size, p.size)
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
    if (!isTouch()) {
      section.addEventListener('pointermove', move, { passive: true })
      section.addEventListener('pointerleave', leave)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; calm = 0 })
    io.observe(canvas)
    let lastW = window.innerWidth
    let timer = 0
    const resize = () => {
      if (isTouch() && window.innerWidth === lastW) return
      lastW = window.innerWidth
      clearTimeout(timer)
      timer = setTimeout(build, 180)
    }
    window.addEventListener('resize', resize)
    // sample once the fonts are in, after the first paint
    document.fonts.ready.then(() => !disposed && requestAnimationFrame(() => !disposed && build()))
    api.current = { s, wake: () => (calm = 0) }

    return () => {
      disposed = true
      gsap.ticker.remove(draw)
      io.disconnect()
      clearTimeout(timer)
      window.removeEventListener('resize', resize)
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      section.classList.remove('is-dots')
      api.current = null
    }
  }, [])

  // the dots gather into the name when the intro lifts
  useEffect(() => {
    const a = api.current
    if (!intro || !a) return
    gsap.to(a.s, { intro: 1, duration: 2.4, ease: 'expo.out', onUpdate: a.wake })
  }, [intro])

  return <canvas className="hero__dots" ref={ref} aria-hidden="true" />
}
