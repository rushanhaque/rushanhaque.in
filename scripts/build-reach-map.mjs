// Bakes the map under the chart that stands in for the globe in Where I serve (components/ReachPlate.jsx).
//   src/data/reach-map.js   world land, country borders, the client countries and the Indian states, as SVG paths
// Land and borders are Natural Earth (public domain) through world-atlas. Indian states are DataMeet (simplified),
// from the previous site's map (scripts/india-states.json). Borders touching India are left out on purpose: India
// is drawn from its own states, so the map always shows its whole official outline and never a disputed line.
// Usage: node scripts/build-reach-map.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { feature, mesh } from 'topojson-client'
import { LON0, K, YTOP, project } from '../src/lib/reach.js'
import { serve } from '../src/data/content.js'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))
const landTopo = read('../node_modules/world-atlas/land-50m.json')
const countryTopo = read('../node_modules/world-atlas/countries-50m.json')
const india = read('./india-states.json')
if (india.lon0 !== LON0 || india.k !== K || india.yTop !== YTOP) throw new Error('india-states.json is on a different plane')

// South Asia keeps its detail, since the chart comes close there; the rest of the world only needs its shape
const NEAR = { w: project(56, 0)[0], e: project(104, 0)[0], n: project(0, 44)[1], s: project(0, 0)[1] }
const near = ([x, y]) => x > NEAR.w && x < NEAR.e && y > NEAR.n && y < NEAR.s

// Douglas-Peucker
function simplify(pts, tol) {
  if (pts.length < 4) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a]
    const dx = pts[b][0] - ax
    const dy = pts[b][1] - ay
    const len = Math.hypot(dx, dy) || 1
    let far = -1
    let at = -1
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len
      if (d > far) { far = d; at = i }
    }
    if (far > tol) { keep[at] = 1; stack.push([a, at], [at, b]) }
  }
  return pts.filter((_, i) => keep[i])
}
// a closed ring starts and ends on the same point, which gives the line above nothing to measure from: it is cut in
// two at the point farthest from its start, and each half thinned on its own
function simplifyRing(pts, tol) {
  if (pts.length < 5) return pts
  let m = 1
  let far = -1
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1])
    if (d > far) { far = d; m = i }
  }
  return [...simplify(pts.slice(0, m + 1), tol).slice(0, -1), ...simplify(pts.slice(m), tol)]
}

// a line of the world, projected, thinned by where it is, and dropped if it is too small to ever be seen
function prep(lonlat, closed) {
  // A shape that crosses the 180th meridian (the far east of Russia) would jump from one edge of a flat map to the
  // other and rule a line across the whole world. It is unwrapped as it is walked instead: past the meridian it
  // simply carries on, off the edge of anything the chart looks at.
  let shift = 0
  const pts = lonlat.map(([lon, lat], i) => {
    if (i) {
      const step = lon + shift - (lonlat[i - 1][0] + shift)
      if (step > 180) shift -= 360
      else if (step < -180) shift += 360
    }
    return project(lon + shift, Math.max(-84, Math.min(84, lat)))
  })
  const isNear = pts.some(near)
  const out = (closed ? simplifyRing : simplify)(pts, isNear ? 1 : 7)
  const xs = out.map((p) => p[0])
  const ys = out.map((p) => p[1])
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  if (out.length < (closed ? 4 : 2) || size < (isNear ? 3 : 30)) return null
  return { pts: out, dp: 0 }
}

// compact path data: an absolute start, then relative steps between the rounded points, so nothing drifts
const num = (v) => { const s = String(v); return s.startsWith('0.') ? s.slice(1) : s.startsWith('-0.') ? '-' + s.slice(2) : s }
function encode(lines, closed) {
  let d = ''
  for (const { pts, dp } of lines) {
    const f = 10 ** dp
    const r = pts.map(([x, y]) => [Math.round(x * f), Math.round(y * f)])
    d += `M${num(r[0][0] / f)} ${num(r[0][1] / f)}l`
    let step = ''
    for (let i = 1; i < r.length; i++) {
      const dx = (r[i][0] - r[i - 1][0]) / f
      const dy = (r[i][1] - r[i - 1][1]) / f
      if (!dx && !dy) continue
      for (const v of [dx, dy]) { const s = num(v); step += (s.startsWith('-') || !step ? '' : ' ') + s }
    }
    d += step + (closed ? 'z' : '')
  }
  return d
}

const rings = (geom) => {
  if (!geom) return []
  if (geom.type === 'Polygon') return geom.coordinates
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat()
  return []
}

// -- land, without Antarctica
const land = feature(landTopo, landTopo.objects.land)
const landRings = (land.features ?? [land]).flatMap((f) => rings(f.geometry)).filter((r) => r.some(([lon, lat]) => lat > -50 && lat < 74 && lon > -125))
const LAND = encode(landRings.map((r) => prep(r, true)).filter(Boolean), true)

// -- borders between countries, none of them touching India, nor the one through Indian-claimed Kashmir
const geoms = countryTopo.objects.countries
const skip = (a, b) => a === b || a.id === '356' || b.id === '356' || (new Set([a.id, b.id]).has('586') && new Set([a.id, b.id]).has('156'))
const BORDERS = encode(mesh(countryTopo, geoms, (a, b) => !skip(a, b)).coordinates.map((l) => prep(l, false)).filter(Boolean), false)

// -- the countries that matter in the last step: clients, and the places the copy names as open to
const KIND = { 682: 'client', 616: 'client', 524: 'client', 784: 'open', 826: 'open', 840: 'open', 702: 'open', '036': 'open' }
const COUNTRIES = geoms.geometries
  .filter((g) => KIND[g.id] && g.properties.name !== 'Ashmore and Cartier Is.')
  .map((g) => ({ n: g.properties.name, k: KIND[g.id], d: encode(rings(feature(countryTopo, g).geometry).map((r) => prep(r, true)).filter(Boolean), true) }))

// -- Indian states, on the same plane already: parsed, lightly thinned, and told which step they belong to
const parse = (d) => d.split('M').filter(Boolean).map((sub) => sub.replace(/Z/g, '').split('L').map((p) => p.split(',').map(Number)))
const inside = ([x, y], ringsList) => {
  let c = false
  for (const r of ringsList) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i]
      const [xj, yj] = r[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
    }
  }
  return c
}
const home = project(serve.home.lon, serve.home.lat)
const STATES = india.states.map((s) => {
  const rs = parse(s.d)
  let t = null
  if (inside(home, rs)) t = 'home'
  else {
    for (const c of serve.places) if (inside(project(c.lon, c.lat), rs) && (t === null || c.stage < t)) t = c.stage
  }
  const lines = rs.map((r) => ({ pts: simplifyRing(r, 0.12), dp: 1 })).filter((l) => l.pts.length >= 4)
  return { n: s.n, t, d: encode(lines, true) }
})

const out = `// Baked by scripts/build-reach-map.mjs. Do not edit by hand.
// Land and borders: Natural Earth (public domain). Indian states: DataMeet (simplified).
export const LAND = ${JSON.stringify(LAND)}
export const BORDERS = ${JSON.stringify(BORDERS)}
export const COUNTRIES = ${JSON.stringify(COUNTRIES)}
export const STATES = ${JSON.stringify(STATES)}
`
writeFileSync(new URL('../src/data/reach-map.js', import.meta.url), out)
const kb = (s) => (s.length / 1024).toFixed(0)
console.log(`land ${kb(LAND)} kB, borders ${kb(BORDERS)} kB, countries ${kb(JSON.stringify(COUNTRIES))} kB, states ${kb(JSON.stringify(STATES))} kB, total ${kb(out)} kB`)
console.log('lit states:', STATES.filter((s) => s.t !== null).map((s) => `${s.n}=${s.t}`).join(', '))
