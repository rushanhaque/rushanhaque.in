import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, reduced } from '../lib/gsap'
import { scrollTo } from '../lib/lenis'
import { serve } from '../data/content'
import { Kicker } from '../components/Head'

// One world Mercator plane, 1000 units wide, cropped at 76°N (the map data is drawn on it).
const W = 1000
const K = W / (2 * Math.PI)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const TOP = merc(76)
const project = (lon, lat) => [((lon + 180) * Math.PI / 180) * K, (TOP - merc(lat)) * K]
const unproject = (x, y) => [(x / K) * (180 / Math.PI) - 180, (2 * Math.atan(Math.exp(TOP - y / K)) - Math.PI / 2) * (180 / Math.PI)]
const arc = (a, b, bend) => {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  return `M${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${(mx + (b[1] - a[1]) * bend).toFixed(2)} ${(my - (b[0] - a[0]) * bend).toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`
}
const SIDE = { r: ['.9em', '.35em', 'start'], l: ['-.9em', '.35em', 'end'], t: ['0', '-.95em', 'middle'], b: ['0', '1.6em', 'middle'] }
const CORE = ['Uttar Pradesh']
const NEAR = ['Uttarakhand', 'NCT of Delhi']
const TZ = { Riyadh: 'Asia/Riyadh', Warsaw: 'Europe/Warsaw', Kathmandu: 'Asia/Kathmandu', Dubai: 'Asia/Dubai', London: 'Europe/London', 'New York': 'America/New_York', Sydney: 'Australia/Sydney' }
// a round length for the scale bar: 1, 2 or 5 times a power of ten
const nice = (v) => { const p = 10 ** Math.floor(Math.log10(v)); const m = v / p; return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p }
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// Frame a [west, south, east, north] box into the open part of the stage: right of the copy on
// wide screens, between the title and the story on phones.
const frame = (box, w, h, s) => {
  const wide = window.innerWidth >= 900
  const [rx0, rx1, ry0, ry1] = wide ? [0.44, 0.95, 0.16, 0.8] : [0.05, 0.95, 0.27, 0.6]
  const [x0, y0] = project(box[0], box[3])
  const [x1, y1] = project(box[2], box[1])
  const m = s === 2 ? 1 : 0.86
  const rw = w * (rx1 - rx0) * m
  const rh = h * (ry1 - ry0) * m
  const k = Math.max((x1 - x0) / rw, (y1 - y0) / rh)
  return { x: (x0 + x1) / 2 - w * ((rx0 + rx1) / 2) * k, y: (y0 + y1) / 2 - h * ((ry0 + ry1) / 2) * k, w: w * k, h: h * k }
}

/**
 * 05 — Where I serve. A paper map fills the stage and opens as the section arrives. The scroll
 * carries the camera from home in Moradabad, out across India, then the world: routes draw
 * as you go, pins land as each route arrives, and the counters count up with them.
 */
export default function Serve() {
  const root = useRef(null)
  const svg = useRef(null)
  const hud = useRef(null)
  const bar = useRef(null)
  const ratio = useRef(null)
  const [data, setData] = useState(null)
  const [step, setStep] = useState(0)
  const [now, setNow] = useState(null)
  const cam = useRef({ x: 0, y: 0, w: W, h: 522 })
  const current = useRef(0)

  // the map data loads when the section is two screens away
  useEffect(() => {
    let alive = true
    const st = ScrollTrigger.create({
      trigger: root.current, start: 'top 300%', once: true,
      onEnter: () => import('../data/reach-map.json').then((m) => alive && setData(m.default)),
    })
    return () => { alive = false; st.kill() }
  }, [])

  // the clocks tick only while the worldwide step is showing
  useEffect(() => {
    if (step !== 2) return
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(id)
  }, [step])

  const home = project(serve.home.lon, serve.home.lat)
  const places = serve.places.map((p) => ({ ...p, at: project(p.lon, p.lat) }))

  // everything that follows the camera: the viewBox, line weights, coordinates and the scale
  const apply = () => {
    const el = svg.current
    if (!el) return
    const c = cam.current
    const px = Math.max(1, el.clientWidth)
    const u = c.w / px
    el.setAttribute('viewBox', `${c.x.toFixed(2)} ${c.y.toFixed(2)} ${c.w.toFixed(2)} ${c.h.toFixed(2)}`)
    el.style.setProperty('--u', u.toFixed(4))
    const [lon, lat] = unproject(c.x + c.w * (window.innerWidth >= 900 ? 0.695 : 0.5), c.y + c.h * (window.innerWidth >= 900 ? 0.48 : 0.435))
    if (hud.current) hud.current.textContent = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`
    const kmPerPx = u * (360 / W) * 111.32 * Math.cos((Math.max(-60, Math.min(60, lat)) * Math.PI) / 180)
    const km = nice(kmPerPx * 96)
    if (bar.current) { bar.current.style.width = `${(km / kmPerPx).toFixed(1)}px`; bar.current.dataset.km = `${group(km)} km` }
    if (ratio.current) ratio.current.textContent = `1 : ${group(Number(((kmPerPx * 1e6) / 0.2646).toPrecision(2)))}`
  }

  // the map opens from an inset card to the full stage as the section arrives
  useGSAP(
    () => {
      if (reduced()) return
      const phone = window.innerWidth < 900
      gsap.fromTo(root.current.querySelector('.serve__map'),
        { clipPath: phone ? 'inset(4% 3% 4% 3% round 20px)' : 'inset(7% 4% 7% 4% round 28px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top top', scrub: true } })
    },
    { scope: root },
  )

  // The story is scrubbed: the camera, the routes, the pins and the counters all follow the
  // scroll, eased a little so a flick of the wheel still glides.
  useGSAP(
    () => {
      if (!data) return
      const el = svg.current
      const q = gsap.utils.selector(el)
      const routes = q('.sv__route')
      const runs = q('.sv__run')
      const pins = q('.sv__pin')
      const labels = q('.sv__label')
      const homeLabel = q('.sv__home-label')[0]
      const dots = q('.sv__dots')[0]
      const rest = q('.sv__state.is-rest')
      const cities = root.current.querySelector('[data-count="cities"]')
      const countries = root.current.querySelector('[data-count="countries"]')
      const still = reduced()
      const ease = gsap.parseEase('power2.inOut')
      let frames = []
      let arrive = 0
      let goal = 0
      let shown = 0
      let last = -1
      let dirty = true
      const drawn = routes.map(() => -1)
      const lit = pins.map(() => null)

      const layout = () => {
        frames = serve.steps.map((st, i) => frame(st.box, el.clientWidth, el.clientHeight, i))
        dirty = true
      }
      // zoom travels in log space, so going from a district to the world feels even
      const camAt = (v) => {
        const k = Math.min(Math.floor(v), frames.length - 2)
        const f = v - k
        const t = f <= 0.12 ? 0 : f >= 0.88 ? 1 : ease((f - 0.12) / 0.76)
        const a = frames[k]
        const b = frames[k + 1]
        const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t)
        const h = w * (a.h / a.w)
        const cx = a.x + a.w / 2 + (b.x + b.w / 2 - a.x - a.w / 2) * t
        const cy = a.y + a.h / 2 + (b.y + b.h / 2 - a.y - a.h / 2) * t
        return { x: cx - w / 2, y: cy - h / 2, w, h }
      }
      const paint = () => {
        if (!frames.length) return
        Object.assign(cam.current, camAt(shown))
        apply()
        // a stage's routes draw as the camera reaches it; the home routes draw as the section arrives
        const stageDone = (s) => (s === 0 ? arrive : Math.min(1, Math.max(0, (shown - (s - 1) - 0.25) / 0.55)))
        routes.forEach((r, i) => {
          const d = Math.round(stageDone(+r.dataset.stage) * 1000) / 1000
          if (d !== drawn[i]) { drawn[i] = d; r.style.strokeDashoffset = 1 - d; runs[i].classList.toggle('is-on', d >= 1) }
          const on = d >= 0.96
          if (on !== lit[i]) { lit[i] = on; pins[i].classList.toggle('is-on', on) }
        })
        const step = Math.round(shown)
        labels.forEach((t) => t.classList.toggle('is-on', +t.dataset.stage === step && stageDone(+t.dataset.stage) >= 0.96))
        homeLabel.classList.toggle('is-on', step !== 1)
        dots.style.opacity = (0.16 + Math.min(1, Math.max(0, shown - 1)) * 0.5).toFixed(3)
        rest.forEach((p) => (p.style.fillOpacity = (0.35 + Math.min(1, shown) * 0.65).toFixed(3)))
        if (cities) cities.textContent = String(Math.round(1 + Math.min(1, Math.max(0, shown)) * 31))
        if (countries) countries.textContent = String(Math.round(1 + Math.min(1, Math.max(0, shown - 1)) * 3))
        serve.steps.forEach((_, i) => root.current.style.setProperty(`--f${i}`, Math.min(1, Math.max(0, shown - i + 1)).toFixed(3)))
        if (step !== last) { last = step; setStep(step) }
      }
      const tick = () => {
        const d = goal - shown
        if (Math.abs(d) > 0.0005) { shown += d * 0.09; dirty = true } else if (shown !== goal) { shown = goal; dirty = true }
        if (dirty) { dirty = false; paint() }
      }

      layout()
      if (still) { arrive = 1; goal = shown = 0; paint() }
      const enter = ScrollTrigger.create({ trigger: root.current, start: 'top 75%', end: 'top top', onUpdate: (s) => { arrive = still ? 1 : s.progress; dirty = true } })
      const st = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { goal = s.progress * (frames.length - 1); if (still) shown = Math.round(goal); dirty = true } })
      goal = shown = st.progress * (serve.steps.length - 1)
      arrive = enter.progress || (st.progress > 0 ? 1 : 0)
      gsap.ticker.add(tick)
      const ro = new ResizeObserver(layout)
      ro.observe(el)
      return () => { gsap.ticker.remove(tick); st.kill(); enter.kill(); ro.disconnect() }
    },
    { scope: root, dependencies: [data] },
  )

  const go = (i) => {
    const el = root.current
    const top = el.getBoundingClientRect().top + window.scrollY
    scrollTo(top + (el.offsetHeight - window.innerHeight) * [0.02, 0.5, 0.98][i], { duration: 1.6 })
  }
  const cls = (n) => (CORE.includes(n) ? 'is-core' : NEAR.includes(n) ? 'is-near' : 'is-rest')
  const time = (tz) => (now ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now) : '--:--')
  const clocks = places.filter((p) => TZ[p.name])
  const s = serve.steps[step]

  return (
    <section className="serve" ref={root} data-theme="ivory" data-chapter="Where I serve" id="serve" aria-label="Where I serve">
      <div className="serve__stage">
        <div className="serve__map">
          <svg ref={svg} className={`sv ${data ? 'is-ready' : ''}`} viewBox="0 0 1000 522" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map: home in Moradabad, cities served across India, and client countries abroad">
            {data && (
              <>
                <path className="sv__dots" d={data.dots} />
                <g transform={`translate(${data.india[0]} ${data.india[1]}) scale(${data.india[2]})`}>
                  {data.states.map((st) => <path key={st.n} d={st.d} className={`sv__state ${cls(st.n)}`} />)}
                </g>
                <g>{places.map((p) => <path key={p.name} className={`sv__route ${p.client ? 'is-client' : ''}`} data-stage={p.stage} pathLength="1" d={arc(home, p.at, p.stage === 2 ? 0.24 : 0.3)} />)}</g>
                <g>{places.map((p) => <path key={p.name} className={`sv__run ${p.client ? 'is-client' : ''}`} pathLength="1" d={arc(home, p.at, p.stage === 2 ? 0.24 : 0.3)} />)}</g>
                <g>{places.map((p) => <circle key={p.name} className={`sv__pin ${p.client ? 'is-client' : ''}`} data-stage={p.stage} cx={p.at[0]} cy={p.at[1]} r="1" />)}</g>
                <circle className="sv__ping" cx={home[0]} cy={home[1]} r="1" />
                <circle className="sv__home" cx={home[0]} cy={home[1]} r="1.4" />
                <g>
                  {places.filter((p) => p.label).map((p) => {
                    const [dx, dy, anchor] = SIDE[p.label]
                    return <text key={p.name} className={`sv__label ${p.client ? 'is-client' : ''}`} data-stage={p.stage} x={p.at[0]} y={p.at[1]} dx={dx} dy={dy} textAnchor={anchor}>{p.name}</text>
                  })}
                  <text className="sv__home-label" x={home[0]} y={home[1]} dy="-1.3em" textAnchor="middle">Moradabad</text>
                </g>
              </>
            )}
          </svg>
          <span className="serve__shade" aria-hidden="true" />
        </div>

        <div className="serve__copy">
          <Kicker n="05" label="Moradabad · India · World" />
          <h2 className="serve__title" data-split>Where I <em>serve</em></h2>
          <div className="serve__story" aria-live="polite">
            <span className="serve__num" key={`n${step}`}>0{step + 1}</span>
            <div key={`s${step}`}>
              <span className="serve__label">{s.label}</span>
              <p className="serve__h">{s.title}</p>
              <p className="serve__d">{s.text}</p>
              {step === 2 && (
                <ul className="serve__clocks" aria-label="Local time where clients are">
                  {clocks.map((c, i) => <li key={c.name} style={{ '--i': i }}><span>{c.name}</span><time>{time(TZ[c.name])}</time></li>)}
                </ul>
              )}
            </div>
          </div>
          <dl className="serve__stats">
            {serve.stats.map((x, i) => <div key={x.label}><dt>{x.label}</dt><dd data-count={['home', 'cities', 'countries'][i]}>{x.value}</dd></div>)}
          </dl>
        </div>

        <div className="serve__hud" aria-hidden="true">
          <span className="serve__live">Live view</span>
          <span ref={hud}>28.84° N  78.77° E</span>
        </div>
        <svg className="serve__north" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" /><path d="M20 6 25 22 20 19 15 22Z" /><text x="20" y="35">N</text></svg>
        <div className="serve__scale" aria-hidden="true">
          <span className="serve__bar" ref={bar} data-km="50 km" />
          <span>Scale <b ref={ratio}>1 : 400 000</b></span>
        </div>

        <ol className="serve__tabs">
          {serve.steps.map((x, i) => (
            <li key={x.key}>
              <button type="button" className={i === step ? 'is-on' : i < step ? 'is-past' : ''} aria-current={i === step ? 'step' : undefined} onClick={() => go(i)}>
                <small>0{i + 1}</small><span>{x.key}</span><i style={{ '--f': `var(--f${i}, 0)` }} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
