import { forwardRef } from 'react'
import { CITIES, HOME } from '../lib/places'

// The plate that stands in for the globe whenever the canvas cannot draw it. Not a picture of the earth but a
// drawing of the reach: home at the centre, and every place laid at its true compass bearing from Moradabad, a
// little farther out the farther away it really is. Three rings, one for each step of the story: close by,
// across India, and the world. The section lights one ring at a time as you scroll (data-stage).
const RAD = Math.PI / 180
const C = 500
// each step's band, as [inner, outer] radius in the 1000-unit drawing
const BANDS = [[86, 196], [238, 356], [398, 436]]
const RINGS = [212, 374, 452]
const RING_NAMES = ['Close by', 'Across India', 'The world']
// where a name sits on the plate when its globe side would put it on top of a neighbour
const SIDE = { Hyderabad: 't', Bengaluru: 'b', Lucknow: 'b' }

function bearing(lat1, lon1, lat2, lon2) {
  const p1 = lat1 * RAD, p2 = lat2 * RAD, dl = (lon2 - lon1) * RAD
  const y = Math.sin(dl) * Math.cos(p2)
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)
  return Math.atan2(y, x)
}
function distance(lat1, lon1, lat2, lon2) {
  const p1 = lat1 * RAD, p2 = lat2 * RAD
  const a = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(((lon2 - lon1) * RAD) / 2) ** 2
  return 2 * Math.asin(Math.min(1, Math.sqrt(a))) * 6371
}
const r1 = (v) => Math.round(v * 10) / 10

// worked out once, the same on the server and in the browser
const PLACES = (() => {
  const raw = CITIES.map((c) => ({ ...c, b: bearing(HOME.lat, HOME.lon, c.lat, c.lon), d: distance(HOME.lat, HOME.lon, c.lat, c.lon) }))
  const span = [0, 1, 2].map((s) => {
    const ds = raw.filter((c) => c.stage === s).map((c) => Math.log(c.d))
    return [Math.min(...ds), Math.max(...ds)]
  })
  return raw.map((c, i) => {
    const [lo, hi] = span[c.stage]
    const t = hi > lo ? (Math.log(c.d) - lo) / (hi - lo) : 0.5
    const [a, b] = BANDS[c.stage]
    const r = a + (b - a) * t
    const x = r1(C + r * Math.sin(c.b))
    const y = r1(C - r * Math.cos(c.b))
    // the route bows a little to one side, as a flight path does on a flat chart
    const mx = (C + x) / 2, my = (C + y) / 2
    const bow = r * 0.14
    const qx = r1(mx + Math.cos(c.b) * bow), qy = r1(my + Math.sin(c.b) * bow)
    const side = SIDE[c.name] || c.label || (Math.sin(c.b) > 0.3 ? 'r' : Math.sin(c.b) < -0.3 ? 'l' : Math.cos(c.b) > 0 ? 't' : 'b')
    return { ...c, i, x, y, path: `M${C} ${C}Q${qx} ${qy} ${x} ${y}`, side }
  })
})()

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = i * 5 * RAD
  const long = i % 6 === 0
  const r0 = long ? 470 : 476
  return { x1: r1(C + r0 * Math.sin(a)), y1: r1(C - r0 * Math.cos(a)), x2: r1(C + 488 * Math.sin(a)), y2: r1(C - 488 * Math.cos(a)), long }
})

const ReachPlate = forwardRef(function ReachPlate(_, ref) {
  return (
    <div className="reach" ref={ref} data-stage="0" aria-hidden="true">
      <svg className="reach__svg" viewBox="0 0 1000 1000" fill="none">
        <defs>
          <radialGradient id="reach-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.14 }} />
            <stop offset="0.55" style={{ stopColor: "var(--accent)", stopOpacity: 0.04 }} />
            <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r="492" fill="url(#reach-glow)" />
        {/* the bezel turns as you scroll */}
        <g className="reach__bezel">
          <circle cx={C} cy={C} r="492" className="reach__rim" />
          <circle cx={C} cy={C} r="464" className="reach__hair" />
          {TICKS.map(({ long, ...t }, i) => <line key={i} {...t} className={long ? 'reach__tick is-long' : 'reach__tick'} />)}
        </g>
        <g className="reach__cross">
          <line x1={C} y1="40" x2={C} y2="960" />
          <line x1="40" y1={C} x2="960" y2={C} />
        </g>
        {RINGS.map((r, s) => <circle key={r} cx={C} cy={C} r={r} className="reach__ring" data-s={s} />)}
        {PLACES.map((p) => <path key={p.name} d={p.path} pathLength="1" className={`reach__route${p.client ? ' is-client' : ''}`} data-s={p.stage} style={{ '--k': p.i % 12 }} />)}
        {PLACES.map((p) => (
          <g key={p.name} className={`reach__pt${p.client ? ' is-client' : ''}`} data-s={p.stage} style={{ '--k': p.i % 12 }}>
            {p.client && <circle cx={p.x} cy={p.y} r="11" className="reach__halo" />}
            <circle cx={p.x} cy={p.y} r={p.client ? 5 : p.stage === 2 ? 4 : 3.2} />
          </g>
        ))}
        <circle cx={C} cy={C} r="16" className="reach__pulse" />
        <circle cx={C} cy={C} r="7" className="reach__home" />
      </svg>
      {RINGS.map((r, s) => (
        <span key={r} className="reach__ringname note" data-s={s} style={{ top: `${((s === 2 ? C + r : C - r) / 10).toFixed(1)}%` }}>{RING_NAMES[s]}</span>
      ))}
      <span className="reach__label is-home is-t" style={{ left: '50%', top: '50%' }}><b>{HOME.name}</b></span>
      {PLACES.filter((p) => p.label || p.client).map((p) => (
        <span key={p.name} className={`reach__label is-${p.side}${p.client ? ' is-client' : ''}`} data-s={p.stage} style={{ left: `${p.x / 10}%`, top: `${p.y / 10}%` }}><b>{p.name}</b></span>
      ))}
    </div>
  )
})

export default ReachPlate
