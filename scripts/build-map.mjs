// Bakes public/data/map.bin, the "Where I serve" map: the world's land (Natural Earth 50m, through world-atlas), and
// India and its states as the previous site drew them (scripts/source/reach-map.json). South Asia keeps its detail;
// the rest of the world is thinned to what a whole-world view can show. Run once: node scripts/build-map.mjs
//
// Format: three Int32 counts, then three runs of Int16 pairs (hundredths of a degree, lon then lat), each ring ended
// by a 32767 pair: the land, the Indian states, and Uttar Pradesh.
import fs from 'node:fs'
import path from 'node:path'

const here = import.meta.dirname
const read = (f) => JSON.parse(fs.readFileSync(path.join(here, 'source', f), 'utf8'))

// -- the land, decoded from TopoJSON by hand (it is only quantised, delta-encoded arcs)
const topo = read('land-50m.json')
const { scale, translate } = topo.transform
const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]] }) })
const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse())
const ring = (ids) => ids.flatMap((i, k) => (k ? arc(i).slice(1) : arc(i)))
const land = []
for (const g of topo.objects.land.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs
  for (const p of polys) for (const r of p) land.push(ring(r))
}

// -- India's states, from the previous map's plane (world Mercator, 1000 units wide, cropped at 76N)
const reach = read('reach-map.json')
const K = 1000 / (2 * Math.PI)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const TOP = merc(76)
const unproject = (x, y) => [(x / K) * (180 / Math.PI) - 180, (2 * Math.atan(Math.exp(TOP - y / K)) - Math.PI / 2) * (180 / Math.PI)]
const [ix, iy, is] = reach.india
const states = reach.states.map((s) => ({
  name: s.n,
  rings: s.d.split('M').filter(Boolean).map((sub) => sub.replace(/Z/g, '').split('L').map((p) => {
    const [x, y] = p.split(',').map(Number)
    return unproject(ix + x * is, iy + y * is)
  })),
}))

// -- thinning: keep every turn near home, only the shape far away
const near = ([lon, lat]) => lon > 58 && lon < 102 && lat > 2 && lat < 42
function thin(line, far = 0.75, close = 0.05) {
  const out = [line[0]]
  for (let i = 1; i < line.length - 1; i++) {
    const a = out[out.length - 1]
    if (Math.hypot(line[i][0] - a[0], line[i][1] - a[1]) > (near(line[i]) ? close : far)) out.push(line[i])
  }
  out.push(line[line.length - 1])
  return out
}
const BREAK = 32767
const pack = (rings) => rings.filter((r) => r.length > 3).flatMap((r) => [...thin(r).flatMap(([lon, lat]) => [Math.round(lon * 100), Math.round(lat * 100)]), BREAK, BREAK])
const parts = [
  pack(land.filter((r) => r.length > 14 || r.some(near))),
  pack(states.flatMap((s) => s.rings)),
  pack(states.filter((s) => s.name === 'Uttar Pradesh').flatMap((s) => s.rings)),
]
const head = new Int32Array(parts.map((p) => p.length))
const body = Int16Array.from(parts.flat())
const to = path.join(here, '../public/data/map.bin')
fs.writeFileSync(to, Buffer.concat([Buffer.from(head.buffer), Buffer.from(body.buffer)]))
console.log(`map.bin ${(fs.statSync(to).size / 1024).toFixed(1)} kB (land ${parts[0].length / 2}, states ${parts[1].length / 2}, UP ${parts[2].length / 2} points)`)
