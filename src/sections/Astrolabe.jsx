import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useChapter, ramp, director } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { serve } from '../data/content'
import { CITIES, HOME, camera, plateLayout, placeOn } from '../lib/places'

const STEPS = serve.steps
const LABEL_H = 16

// Where I serve, on the real earth. The camera starts just above Moradabad, pulls back over India until the
// whole globe fits the disc, then turns it west past every client country. See lib/places.js for how.
export default function Astrolabe() {
  const root = useRef(null)
  const labels = useRef([])
  const home = useRef(null)
  const stepEls = useRef([])
  const counted = useRef([])
  const widths = useRef(null)
  useReveals(root)

  // the canvas starts, and the map data loads, when the section is two screens away
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { director.wantGL?.(true); io.disconnect() } }, { rootMargin: '200% 0px' })
    io.observe(root.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => director.onEngine((e) => {
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top 300%', once: true, onEnter: () => e.prepare('atlas') })
    return () => st.kill()
  }), [])

  useEffect(() => {
    const reset = () => { widths.current = null }
    addEventListener('resize', reset)
    document.fonts?.ready.then(reset)
    return () => removeEventListener('resize', reset)
  }, [])

  useChapter(root, {
    id: 'serve',
    name: 'Where I serve',
    time: [16, 17.2],
    stage: 'atlas',
    frame: ({ stick, stageH, engine }) => {
      const p = stick
      const a = engine?.stages.get('atlas')
      if (a) a.progress = p
      // the picture stands in whenever the canvas is not drawing this scene right now, whatever the reason: the
      // shaders still compiling, the context lost, the engine given up. The section is never empty.
      const live = !!engine?.alive && engine.shown && director.state.stage === 'atlas'
      if (root.current && live !== root.current.classList.contains('is-live')) root.current.classList.toggle('is-live', live)
      const H = engine ? engine.ctx.h : stageH
      const l = plateLayout(innerWidth, H)
      const cam = camera(p, l.R)
      const stage = p < 0.36 ? 0 : p < 0.7 ? 1 : 2

      if (!widths.current) widths.current = { home: home.current?.firstChild.offsetWidth || 70, cities: labels.current.map((el) => el?.firstChild.offsetWidth || 60) }

      // Names are placed one at a time, most important first. Each takes the side it prefers if that is free,
      // then any other side; if no side is free it waits, so two names never sit on each other.
      const placed = []
      const free = (x, y, w) => {
        if (x < l.m || x + w > innerWidth - l.m) return false
        if (Math.hypot(Math.max(Math.abs(x - l.cx), Math.abs(x + w - l.cx)), Math.max(Math.abs(y - l.cy), Math.abs(y + LABEL_H - l.cy))) > l.R * 0.98) return false
        return placed.every((q) => x + w + 6 < q[0] || q[0] + q[2] + 6 < x || y + LABEL_H + 2 < q[1] || q[1] + LABEL_H + 2 < y)
      }
      const put = (px, py, w, pref) => {
        const spots = { r: [px + 9, py - LABEL_H / 2], l: [px - w - 9, py - LABEL_H / 2], t: [px - w / 2, py - LABEL_H - 8], b: [px - w / 2, py + 8] }
        for (const side of [pref, 'r', 'l', 't', 'b']) {
          const s = spots[side]
          if (s && free(s[0], s[1], w)) { placed.push([s[0], s[1], w]); return s }
        }
        return null
      }
      const write = (el, s) => {
        const vis = s ? 1 : 0
        if (el._v !== vis) { el._v = vis; el.style.opacity = vis }
        if (s) el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px)`
      }
      if (home.current) {
        const [x, y, z, r] = placeOn(HOME.lat, HOME.lon, cam, l)
        write(home.current, z > 0.12 && r < 0.97 ? put(x, y, widths.current.home, 't') : null)
      }
      const order = CITIES.map((c, i) => [c, i]).sort((A, B) => (B[0].client ? 1 : 0) - (A[0].client ? 1 : 0))
      for (const [c, i] of order) {
        const el = labels.current[i]
        if (!el) continue
        const [x, y, z, r] = placeOn(c.lat, c.lon, cam, l)
        // a name belongs to the scale it was chosen for, and the client countries stay on after
        const wanted = (c.stage === stage && (c.label || stage === 0)) || (c.client && stage >= c.stage)
        write(el, wanted && z > 0.12 && r < 0.97 ? put(x, y, widths.current.cities[i], c.label) : null)
      }

      const f = p * STEPS.length
      STEPS.forEach((_, i) => {
        const el = stepEls.current[i]
        if (!el) return
        const inn = i === 0 ? 1 : ramp(f, i + 0.02, i + 0.14)
        const out = i === STEPS.length - 1 ? 1 : 1 - ramp(f, i + 0.86, i + 0.98)
        const v = inn * out
        el.style.opacity = v.toFixed(3)
        el.style.transform = `translateY(${((1 - inn) * 14 - (1 - out) * 14).toFixed(1)}px)`
        el.style.visibility = v < 0.005 ? 'hidden' : 'visible'
      })
      counted.current.forEach((el, i) => { if (el) el.dataset.on = p > [0, 0.33, 0.66][i] ? '1' : '0' })
    },
  })

  return (
    <section className="atl pin" ref={root} id="serve" aria-label="Where I serve" data-fixed="night">
      <div className="pin__stage atl__stage">
        <img className="atl__still" src="/img/atlas.webp" alt="" loading="lazy" decoding="async" />
        <div className="atl__copy">
          <div className="kick"><span>Moradabad, India, world</span><i /></div>
          <h2 className="sh__title">Where I <em>serve</em></h2>
          <div className="atl__steps">
            {STEPS.map((s, i) => (
              <div className="atl__step" key={s.key} ref={(el) => { stepEls.current[i] = el }} style={i === 0 ? undefined : { visibility: 'hidden', opacity: 0 }}>
                <span className="note">{s.label}</span>
                <h3 className="h4">{s.title}</h3>
                <p className="small">{s.text}</p>
              </div>
            ))}
          </div>
          <dl className="atl__stats">
            {serve.stats.map((s, i) => (
              <div key={s.label} ref={(el) => { counted.current[i] = el }}>
                <dd className="pillar">{s.value}</dd>
                <dt className="note">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="atl__labels" aria-hidden="true">
          <span className="atl__city is-home" ref={home}><b>{HOME.name}</b></span>
          {CITIES.map((c, i) => (
            <span key={c.name} ref={(el) => { labels.current[i] = el }} className={`atl__city ${c.client ? 'is-client' : ''}`}><b>{c.name}</b></span>
          ))}
        </div>
      </div>
    </section>
  )
}
