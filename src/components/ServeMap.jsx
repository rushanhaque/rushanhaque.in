import { useEffect, useRef, useState } from 'react'
import { serve } from '../data/content'
import { device } from '../lib/device'
import { ease, killTweensOf, tween } from '../lib/motion'
import { useReveals } from '../lib/reveal'
import Head from './Head'

// Where I serve: a clean map that travels from home, across India, out to the world as you read the three steps
// beside it. Land, India and Uttar Pradesh are drawn as flat shapes on a plain 2D canvas from a small file of
// outlines (public/data/map.bin, built by scripts/build-map.mjs), and only while the camera moves.
const TAU = Math.PI * 2
const C = Math.cos((20 * Math.PI) / 180)
const HOME = serve.home

let geoP = null
function loadGeo() {
  geoP ??= fetch('/data/map.bin').then((r) => r.arrayBuffer()).then((buf) => {
    const head = new Int32Array(buf, 0, 3)
    const all = new Int16Array(buf, 12)
    const parts = []
    let at = 0
    for (const n of head) {
      const rings = []
      let cur = []
      for (let i = at; i < at + n; i += 2) {
        if (all[i] === 32767) { if (cur.length) rings.push(ring(cur)); cur = [] } else cur.push(all[i] / 100, all[i + 1] / 100)
      }
      parts.push(rings)
      at += n
    }
    return { land: parts[0], states: parts[1], up: parts[2] }
  })
  return geoP
}
// each ring with its bounds, so the ones off screen are skipped
function ring(pts) {
  const xy = Float32Array.from(pts)
  let w = 180, e = -180, s = 90, n = -90
  for (let i = 0; i < xy.length; i += 2) { w = Math.min(w, xy[i]); e = Math.max(e, xy[i]); s = Math.min(s, xy[i + 1]); n = Math.max(n, xy[i + 1]) }
  return { xy, w, e, s, n }
}

function camFor(box, W, H) {
  const [w, s, e, n] = box
  const k = Math.min(W / ((e - w) * C), H / (n - s)) * 0.92
  return { lon: (w + e) / 2, lat: (s + n) / 2, z: Math.log(k) }
}

export default function ServeMap({ no }) {
  const root = useRef(null)
  const stage = useRef(null)
  const canvas = useRef(null)
  const homeEl = useRef(null)
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const m = useRef({ cam: null, f: 0, arc: 0, W: 0, H: 0, dpr: 1, g: null, step: 0 })
  useReveals(root)

  // which step you are reading
  // wide: the step crossing the middle of the screen; narrow: the card mostly in view in the swiped row
  const row = useRef(null)
  useEffect(() => {
    const steps = [...root.current.querySelectorAll('.srv__step')]
    const narrow = innerWidth < 900
    const io = new IntersectionObserver((list) => {
      for (const e of list) if (e.isIntersecting) setStep(steps.indexOf(e.target))
    }, narrow ? { root: row.current, threshold: 0.6 } : { rootMargin: '-42% 0px -42% 0px' })
    steps.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
  const go = (i) => {
    setStep(i)
    const card = row.current?.children[i]
    if (card && innerWidth < 900) row.current.scrollTo({ left: card.offsetLeft - row.current.offsetLeft - parseFloat(getComputedStyle(row.current).paddingLeft || 0), behavior: 'smooth' })
  }

  const draw = () => {
    const s = m.current
    const cv = canvas.current
    if (!s.g || !s.cam || !cv) return
    const ctx = cv.getContext('2d')
    const { W, H, dpr } = s
    const { lon, lat } = s.cam
    const k = Math.exp(s.cam.z)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const at = (lo, la) => [W / 2 + (lo - lon) * k * C, H / 2 - (la - lat) * k]
    const vw = W / (k * C) / 2 + 1
    const vh = H / k / 2 + 1
    const shape = (rings) => {
      const p = new Path2D()
      for (const r of rings) {
        if (r.e < lon - vw || r.w > lon + vw || r.n < lat - vh || r.s > lat + vh) continue
        const { xy } = r
        p.moveTo(W / 2 + (xy[0] - lon) * k * C, H / 2 - (xy[1] - lat) * k)
        for (let i = 2; i < xy.length; i += 2) p.lineTo(W / 2 + (xy[i] - lon) * k * C, H / 2 - (xy[i + 1] - lat) * k)
        p.closePath()
      }
      return p
    }
    const land = shape(s.g.land)
    ctx.fillStyle = '#dcd1c4'
    ctx.fill(land)
    const india = shape(s.g.states)
    ctx.fillStyle = 'rgba(176, 138, 79, 0.3)'
    ctx.fill(india)
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(247, 244, 241, 0.95)'
    ctx.lineWidth = 0.8
    ctx.stroke(india)
    const up = shape(s.g.up)
    ctx.fillStyle = 'rgba(66, 36, 45, 0.16)'
    ctx.fill(up)
    ctx.strokeStyle = 'rgba(66, 36, 45, 0.7)'
    ctx.lineWidth = 1.2
    ctx.stroke(up)
    const [hx, hy] = at(HOME.lon, HOME.lat)
    // the client arcs, out from home
    if (s.arc > 0) {
      ctx.save()
      ctx.strokeStyle = 'rgba(66, 36, 45, 0.85)'
      ctx.lineWidth = 1.3
      for (const c of serve.places.filter((p) => p.client)) {
        const [cx, cy] = at(c.lon, c.lat)
        const mx = (hx + cx) / 2
        const my = (hy + cy) / 2 - Math.hypot(cx - hx, cy - hy) * 0.32
        ctx.beginPath()
        ctx.moveTo(hx, hy)
        const n = 40
        for (let i = 1; i <= n * s.arc; i++) {
          const t = i / n
          ctx.lineTo((1 - t) ** 2 * hx + 2 * (1 - t) * t * mx + t * t * cx, (1 - t) ** 2 * hy + 2 * (1 - t) * t * my + t * t * cy)
        }
        ctx.stroke()
      }
      ctx.restore()
    }
    // the places, each in its own step
    ctx.font = '11px "DM Mono", ui-monospace, monospace'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    for (const p of serve.places) {
      const a = Math.max(0, 1 - Math.abs(s.f - p.stage) * 1.7)
      if (a <= 0.01) continue
      const [px, py] = at(p.lon, p.lat)
      if (px < -60 || px > W + 60 || py < -20 || py > H + 20) continue
      ctx.globalAlpha = a
      ctx.fillStyle = p.client ? '#42242d' : '#b08a4f'
      ctx.beginPath()
      ctx.arc(px, py, p.client ? 3.6 : 2.6, 0, TAU)
      ctx.fill()
      if (W < 560 && !p.label) continue
      const side = p.label || 'r'
      ctx.textAlign = side === 'l' ? 'right' : side === 'r' ? 'left' : 'center'
      const tx = px + (side === 'l' ? -8 : side === 'r' ? 8 : 0)
      const ty = py + (side === 't' ? -12 : side === 'b' ? 12 : 0)
      ctx.strokeStyle = 'rgba(247, 244, 241, 0.92)'
      ctx.lineWidth = 3.5
      ctx.strokeText(p.name, tx, ty)
      ctx.fillStyle = p.client ? '#42242d' : 'rgba(32, 24, 20, 0.86)'
      ctx.fillText(p.name, tx, ty)
    }
    ctx.globalAlpha = 1
    if (homeEl.current) homeEl.current.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`
  }

  // the canvas: sized to its stage, and the mask loaded once the section is near
  useEffect(() => {
    const s = m.current
    const cv = canvas.current
    const fit = () => {
      const r = stage.current.getBoundingClientRect()
      s.W = Math.round(r.width)
      s.H = Math.round(r.height)
      s.dpr = Math.min(devicePixelRatio || 1, device().tier === 'high' ? 2 : 1.5)
      cv.width = Math.round(s.W * s.dpr)
      cv.height = Math.round(s.H * s.dpr)
      s.cam = camFor(serve.steps[s.step].box, s.W, s.H)
      draw()
    }
    let ro = null
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      Promise.all([loadGeo(), document.fonts?.load?.('11px "DM Mono"')]).then(([g]) => {
        s.g = g
        fit()
        setReady(true)
        ro = new ResizeObserver(fit)
        ro.observe(stage.current)
      }).catch(() => {})
    }, { rootMargin: '80% 0px' })
    io.observe(root.current)
    return () => { io.disconnect(); ro?.disconnect(); killTweensOf(s); killTweensOf(s.cam) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // travelling between steps: a slow, eased flight, the zoom taken in log space so it feels even
  useEffect(() => {
    const s = m.current
    s.step = step
    if (!ready || !s.cam) return
    const to = camFor(serve.steps[step].box, s.W, s.H)
    killTweensOf(s.cam)
    killTweensOf(s)
    if (device().reduced) { Object.assign(s.cam, to); s.f = step; s.arc = step === 2 ? 1 : 0; draw(); return }
    tween(s.cam, to, { duration: 1.7, ease: ease.expoInOut, onUpdate: draw })
    tween(s, { f: step }, { duration: 1.5, ease: ease.power3InOut, onUpdate: draw })
    if (step === 2) { s.arc = 0; tween(s, { arc: 1 }, { duration: 1.4, delay: 1.1, ease: ease.power3InOut, onUpdate: draw }) } else s.arc = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, ready])

  return (
    <section className="srv wrap" ref={root} id="serve" data-tone="ivory" data-chapter={no} data-name="Where I serve">
      <Head no={no} label="Moradabad, India, the world" title={<>Where I <em>serve</em></>} lede="Based in Moradabad, working with clients wherever they are." />
      <div className="srv__grid">
        <div className="srv__tabs" role="group" aria-label="Choose a view">
          {serve.steps.map((st, i) => <button key={st.key} type="button" className={i === step ? 'is-on' : ''} aria-pressed={i === step} onClick={() => go(i)}>{st.key}</button>)}
        </div>
        <ol className="srv__steps" ref={row}>
          {serve.steps.map((st, i) => (
            <li className={`srv__step ${i === step ? 'is-on' : ''}`} key={st.key}>
              <p className="note srv__label"><b>{String(i + 1).padStart(2, '0')}</b> {st.label}</p>
              <h3 className="h3">{st.title}</h3>
              <p className="small">{st.text}</p>
              <ul className="srv__places">{serve.places.filter((p) => p.stage === i).map((p) => <li key={p.name} className={p.client ? 'is-client' : ''}>{p.name}</li>)}</ul>
            </li>
          ))}
        </ol>
        <div className="srv__stage" ref={stage}>
          <canvas ref={canvas} className={`srv__map ${ready ? 'is-ready' : ''}`} aria-label="Map of the places I work with, from Moradabad to the world" role="img" />
          <span className="srv__home" ref={homeEl} aria-hidden="true"><i /><b className="note">Moradabad</b></span>
          <p className="srv__where note" aria-hidden="true">{serve.steps[step].label}</p>
        </div>
      </div>
      <dl className="srv__stats" data-r="stagger">
        {serve.stats.map((s) => <div key={s.label}><dd className="pillar">{s.value}</dd><dt className="note">{s.label}</dt></div>)}
      </dl>
    </section>
  )
}
