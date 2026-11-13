import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CITIES, HOME } from '../lib/places'
import { project, unproject, kmPerUnit } from '../lib/reach'

// The chart that stands in for the globe whenever the canvas cannot draw it: a flat map of the real earth, framed
// like an instrument's live view. It walks the same three steps as the globe, and the scroll drives it the same
// way: close over Moradabad and the towns around it, out over India as the states light up, then out to the
// world and the client countries. Routes fan out from home and run with light while their step is on.
//
// Two layers, one camera. The map underneath only redraws when the camera moves; everything that moves on its
// own (the routes running, the pins, the pulse) lives on the layer above, so it never asks the map to redraw.
// The map itself (scripts/build-reach-map.mjs) loads only when this chart is actually going to be seen.

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const range = (v, a, b) => clamp01((v - a) / (b - a))
const smooth = (t) => t * t * (3 - 2 * t)
const lerp = (a, b, t) => a + (b - a) * t
const f1 = (v) => v.toFixed(1)

const [HX, HY] = project(HOME.lon, HOME.lat)

// where a name sits when the side it takes on the globe would put it on top of a neighbour on the flat map
const SIDE = { Rudrapur: 'r', Haldwani: 'r', Hyderabad: 'r', Bengaluru: 'l', Chennai: 'r', Lucknow: 'b', Dubai: 'b', Kathmandu: 'r' }
// a few routes carry something along them while their step is on
const PACKETS = ['Bijnor', 'Bareilly', 'Rampur', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Kolkata', 'Riyadh', 'Warsaw', 'Kathmandu']

const PLACES = CITIES.map((c, i) => {
  const [x, y] = project(c.lon, c.lat)
  const dx = x - HX
  const dy = y - HY
  const len = Math.hypot(dx, dy) || 1
  // each route bows a little to one side; the long ones bow north, the way flights do on a flat chart
  let nx = -dy / len
  let ny = dx / len
  if (c.stage === 2 && ny > 0) { nx = -nx; ny = -ny }
  const k = c.stage === 2 ? 0.2 : 0.15
  const qx = (HX + x) / 2 + nx * len * k
  const qy = (HY + y) / 2 + ny * len * k
  return {
    ...c,
    i,
    x,
    y,
    d: `M${f1(HX)} ${f1(HY)}Q${f1(qx)} ${f1(qy)} ${f1(x)} ${f1(y)}`,
    side: SIDE[c.name] || c.label || (dx >= 0 ? 'r' : 'l'),
    kind: c.client ? 'client' : c.stage === 2 ? 'open' : 'city',
    named: c.stage === 0 || !!c.label || !!c.client,
    pk: PACKETS.includes(c.name),
  }
})
const LB = {
  r: { x: 8, y: 3.6, textAnchor: 'start' },
  l: { x: -8, y: 3.6, textAnchor: 'end' },
  t: { x: 0, y: -8.5, textAnchor: 'middle' },
  b: { x: 0, y: 15, textAnchor: 'middle' },
}

// lines of latitude and longitude: every ten degrees over the world, and every degree over the subcontinent for
// when the chart is close enough to need them
function graticule(step, lon0, lon1, lat0, lat1) {
  let d = ''
  for (let lon = lon0; lon <= lon1; lon += step) {
    const [x, ya] = project(lon, lat1)
    d += `M${f1(x)} ${f1(ya)}V${f1(project(lon, lat0)[1])}`
  }
  for (let lat = lat0; lat <= lat1; lat += step) {
    const [xa, y] = project(lon0, lat)
    d += `M${f1(xa)} ${f1(y)}H${f1(project(lon1, lat)[0])}`
  }
  return d
}
const WIDE = graticule(30, -180, 180, -60, 60)
const COARSE = graticule(10, -180, 180, -70, 80)
const FINE = graticule(1, 60, 100, 0, 40)

// The three views, as [west, south, east, north], each fitted to the panel's shape with room for its readouts.
const BOXES = [[77.6, 28.0, 79.9, 29.68, 1.08, 1.34], [66.5, 6.5, 98.5, 37.4, 1.08, 1.34], [-78, -36, 156, 56, 1.12, 1.25]]
function fit([w, s, e, n, padW, padH], aspect) {
  const [x0, y0] = project(w, n)
  const [x1, y1] = project(e, s)
  let bw = (x1 - x0) * padW
  const bh = (y1 - y0) * padH
  if (bw / bh < aspect) bw = bh * aspect
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: bw }
}
// Zoomed by the logarithm of the width, and panned in step with how far the zoom has come, so the near view drifts
// out from home rather than sliding off it. Every stretch of the scroll moves something: the holds push in slowly.
function travel(a, b, t) {
  const w = Math.exp(lerp(Math.log(a.w), Math.log(b.w), t))
  const s = Math.abs(b.w - a.w) > 1e-6 ? (w - a.w) / (b.w - a.w) : t
  return { w, cx: lerp(a.cx, b.cx, s), cy: lerp(a.cy, b.cy, s) }
}
function camera(p, aspect) {
  const [b0, b1, b2] = BOXES.map((b) => fit(b, aspect))
  const india = { ...b1, w: b1.w * (1 - 0.06 * range(p, 0.3, 0.52)) }
  const world = { ...b2, w: b2.w * (1 - 0.08 * range(p, 0.78, 1)) }
  const first = travel(b0, india, smooth(range(p, 0.03, 0.3)))
  const t2 = smooth(range(p, 0.52, 0.78))
  return t2 > 0 ? travel(first, world, t2) : first
}
const stageOf = (p) => (p < 0.24 ? 0 : p < 0.6 ? 1 : 2)

const viewBox = (v, aspect) => {
  const h = v.w / aspect
  return `${(v.cx - v.w / 2).toFixed(2)} ${(v.cy - h / 2).toFixed(2)} ${v.w.toFixed(2)} ${h.toFixed(2)}`
}
const VB0 = viewBox(camera(0, 1.15), 1.15)
const coordText = (lon, lat) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`
// a round distance for the scale bar, about the length it is given
const nice = (km) => {
  const e = 10 ** Math.floor(Math.log10(km))
  const f = km / e
  return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * e
}

let mapLoad = null
const wantMap = () => {
  if (!mapLoad) mapLoad = import('../data/reach-map.js').catch((err) => { mapLoad = null; throw err })
  return mapLoad
}

const ReachPlate = forwardRef(function ReachPlate(_, ref) {
  const root = useRef(null)
  const base = useRef(null)
  const over = useRef(null)
  const coord = useRef(null)
  const bar = useRef(null)
  const dist = useRef(null)
  const [map, setMap] = useState(null)
  const s = useRef({ w: 0, h: 0, p: 0, vb: '', z: '', grid: '', stage: '0', coord: '', km: '', bar: '' })

  // asked for as often as it likes (every frame while the chart stands in): only the first ask does anything
  const asked = useRef(false)
  const load = useCallback(() => {
    if (asked.current) return
    asked.current = true
    wantMap().then((m) => setMap(m)).catch(() => { asked.current = false /* asked for again the next time it is needed */ })
  }, [])

  const update = useCallback((p) => {
    const el = root.current
    const st = s.current
    if (!el) return
    if (!st.w) { st.w = el.clientWidth; st.h = el.clientHeight }
    if (!st.w || !st.h) return
    st.p = p
    const aspect = st.w / st.h
    const v = camera(p, aspect)
    const vb = viewBox(v, aspect)
    if (vb !== st.vb) {
      st.vb = vb
      base.current?.setAttribute('viewBox', vb)
      over.current?.setAttribute('viewBox', vb)
    }
    // map units per screen pixel: pins and names are drawn at this scale, so they keep one size at any distance
    const zn = v.w / st.w
    const z = zn.toFixed(4)
    if (z !== st.z) { st.z = z; el.style.setProperty('--z', z) }
    // each distance gets its own grid: a degree apart up close, ten over the country, thirty over the world
    const grid = `${clamp01((1.1 - zn) / 0.8).toFixed(2)} ${clamp01((14 - zn) / 7).toFixed(2)} ${clamp01((zn - 8) / 8).toFixed(2)}`
    if (grid !== st.grid) {
      st.grid = grid
      const [fine, mid, wide] = grid.split(' ')
      el.style.setProperty('--fine', fine)
      el.style.setProperty('--mid', mid)
      el.style.setProperty('--wide', wide)
    }
    const stage = String(stageOf(p))
    if (stage !== st.stage) { st.stage = stage; el.dataset.stage = stage }
    const [lon, lat] = unproject(v.cx, v.cy)
    const c = coordText(lon, lat)
    if (c !== st.coord && coord.current) { st.coord = c; coord.current.textContent = c }
    const kmPx = zn * kmPerUnit(lat)
    const km = nice(kmPx * 84)
    const label = `${km.toLocaleString('en-IN')} km`
    if (label !== st.km && dist.current) { st.km = label; dist.current.textContent = label }
    const w = (km / kmPx).toFixed(0)
    if (w !== st.bar && bar.current) { st.bar = w; bar.current.style.width = `${w}px` }
  }, [])

  useImperativeHandle(ref, () => ({ update, load }), [update, load])

  useEffect(() => {
    const el = root.current
    const html = document.documentElement
    const still = html.classList.contains('static')
    // without motion the walk does not run, so the chart shows where it ends: the whole reach at once
    if (still) s.current.p = 1
    const ro = new ResizeObserver(() => {
      const st = s.current
      st.w = el.clientWidth
      st.h = el.clientHeight
      st.vb = ''
      update(st.p)
    })
    ro.observe(el)
    // The map comes while the section is still two screens away, for everyone. Even a device that can draw the globe
    // may find, on the day, that it does not (a busy GPU, a lost context, a canvas handed back empty), and a chart
    // that arrives as routes over nothing reads as broken. Being ready costs one small file, fetched in good time.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { load(); io.disconnect() } }, { rootMargin: '200% 0px' })
    io.observe(el)
    return () => { ro.disconnect(); io.disconnect() }
  }, [update, load])

  return (
    <div className="rp" ref={root} data-stage="0" aria-hidden="true">
      <div className="rp__map">
        <svg ref={base} className="rp__base" viewBox={VB0} preserveAspectRatio="xMidYMid slice">
          <path className="rp__grid is-wide" d={WIDE} />
          <path className="rp__grid is-mid" d={COARSE} />
          <path className="rp__grid is-fine" d={FINE} />
          {map && (
            <g className="rp__geo">
              <path className="rp__land" d={map.LAND} />
              {map.COUNTRIES.map((c) => <path key={c.n} className={`rp__ct is-${c.k}`} d={c.d} />)}
              <path className="rp__border" d={map.BORDERS} />
              {map.STATES.map((st) => <path key={st.n} className={`rp__st t-${st.t ?? 'x'}`} d={st.d} />)}
              {map.STATES.filter((st) => st.t === 'home').map((st) => <path key="edge" className="rp__edge" d={st.d} />)}
            </g>
          )}
        </svg>
        <svg ref={over} className="rp__over" viewBox={VB0} preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rp-glow">
              <stop offset="0" style={{ stopColor: 'var(--accent)', stopOpacity: 0.32 }} />
              <stop offset="0.45" style={{ stopColor: 'var(--accent)', stopOpacity: 0.08 }} />
              <stop offset="1" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
            </radialGradient>
            {PLACES.filter((p) => p.pk).map((p) => <path key={p.name} id={`rp-m-${p.i}`} d={p.d} />)}
          </defs>
          <g transform={`translate(${f1(HX)} ${f1(HY)})`}>
            <g className="rp__s"><circle r="96" fill="url(#rp-glow)" /></g>
          </g>
          <g>
            {PLACES.map((p) => (
              <path key={p.name} className={`rp__rt is-${p.kind}`} d={p.d} pathLength="1" data-s={p.stage} style={{ '--k': p.i % 12 }} />
            ))}
          </g>
          <g>
            {PLACES.filter((p) => p.named).map((p) => <path key={p.name} className={`rp__fl is-${p.kind}`} d={p.d} data-s={p.stage} />)}
          </g>
          <g>
            {PLACES.filter((p) => p.pk).map((p, j) => (
              <g key={p.name} className="rp__pk" data-s={p.stage}>
                <animateMotion dur={`${(2.8 + (j % 3) * 0.8).toFixed(1)}s`} begin={`${(-j * 0.9).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1">
                  <mpath href={`#rp-m-${p.i}`} />
                </animateMotion>
                <g className="rp__s"><circle r="2.6" className="rp__pkc" /></g>
              </g>
            ))}
          </g>
          <g>
            {PLACES.map((p) => (
              <g key={p.name} className={`rp__pt is-${p.kind}`} data-s={p.stage} transform={`translate(${f1(p.x)} ${f1(p.y)})`} style={{ '--k': p.i % 12 }}>
                <g className="rp__s">
                  <g className="rp__pop">
                    {p.client && <circle r="8.5" className="rp__halo" />}
                    <circle r={p.client ? 4.2 : 3.2} className="rp__dot" />
                  </g>
                </g>
              </g>
            ))}
          </g>
          <g transform={`translate(${f1(HX)} ${f1(HY)})`} className="rp__home">
            <g className="rp__s">
              <circle r="8" className="rp__radar" />
              <circle r="8" className="rp__radar is-late" />
              <circle r="5.6" className="rp__core" />
            </g>
          </g>
          <g>
            {PLACES.filter((p) => p.named).map((p) => (
              <g key={p.name} className={`rp__lb is-${p.kind}`} data-s={p.stage} transform={`translate(${f1(p.x)} ${f1(p.y)})`}>
                <g className="rp__s"><text {...LB[p.side]}>{p.name}</text></g>
              </g>
            ))}
            {/* over home while the view is close; up and to the right, where the map is empty, once it pulls back */}
            <g className="rp__lb is-home" transform={`translate(${f1(HX)} ${f1(HY)})`}>
              <g className="rp__s">
                <text className="is-near" x="0" y="-13" textAnchor="middle">{HOME.name}</text>
                <text className="is-far" x="9" y="-9" textAnchor="start">{HOME.name}</text>
              </g>
            </g>
          </g>
        </svg>
      </div>
      <i className="rp__frame" />
      <div className="rp__hud is-top">
        <span className="rp__live"><i />Live reach</span>
        <span className="rp__coord" ref={coord}>{coordText(HOME.lon, HOME.lat)}</span>
      </div>
      <div className="rp__hud is-bot">
        <span className="rp__scale"><i ref={bar} /><b ref={dist}>20 km</b></span>
        <span className="rp__legend">
          <span><i className="is-home" />Home</span>
          <span><i className="is-city" />Served</span>
          <span><i className="is-client" />Client</span>
        </span>
      </div>
      <span className="rp__credit">Natural Earth · DataMeet</span>
    </div>
  )
})

export default ReachPlate
