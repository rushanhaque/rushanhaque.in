// Builds the Contact page's map of Moradabad: real roads, railways, rivers and water from OpenStreetMap, drawn as
// one light SVG in the site's own colours. Usage: node scripts/build-contact-map.mjs <overpass-result.json>
// (the Overpass query is in the comment at the bottom). Map data © OpenStreetMap contributors, ODbL.
import fs from 'node:fs'
import path from 'node:path'

const src = process.argv[2]
if (!src) { console.error('usage: node scripts/build-contact-map.mjs <overpass.json>'); process.exit(1) }
const data = JSON.parse(fs.readFileSync(src, 'utf8'))

const BOX = { s: 28.735, n: 28.945, w: 78.62, e: 78.93 }
const HOME = { lat: 28.8386, lon: 78.7733 }
const W = 2000
const k = Math.cos((HOME.lat * Math.PI) / 180)
const H = Math.round((W * (BOX.n - BOX.s)) / ((BOX.e - BOX.w) * k))
const X = (lon) => ((lon - BOX.w) / (BOX.e - BOX.w)) * W
const Y = (lat) => ((BOX.n - lat) / (BOX.n - BOX.s)) * H

// Douglas-Peucker: drop points that change the line by less than `tol` units
function simplify(pts, tol) {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a]
    const [bx, by] = pts[b]
    const dx = bx - ax
    const dy = by - ay
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

const KIND = (t) => {
  if (t.natural === 'water') return 'water'
  if (t.waterway === 'river') return 'river'
  if (t.waterway === 'canal') return 'canal'
  if (t.railway === 'rail') return 'rail'
  if (/^(motorway|trunk|primary)$/.test(t.highway)) return 'major'
  if (/^(secondary|tertiary)$/.test(t.highway)) return 'mid'
  return 'minor'
}
const TOL = { minor: 0.9, mid: 0.6, major: 0.5, rail: 0.6, river: 0.6, canal: 0.8, water: 0.7 }
const paths = {}
for (const el of data.elements) {
  if (!el.geometry || !el.tags) continue
  const kind = KIND(el.tags)
  const pts = simplify(el.geometry.map((g) => [X(g.lon), Y(g.lat)]), TOL[kind])
  if (pts.length < 2) continue
  if (pts.every(([x, y]) => x < -50 || x > W + 50 || y < -50 || y > H + 50)) continue
  const d = 'M' + pts.map(([x, y], i) => `${i ? 'L' : ''}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + (kind === 'water' ? 'Z' : '')
  ;(paths[kind] ||= []).push(d.replace(/L/g, ' '))
}

const style = `
.water{fill:#b08a4f;fill-opacity:.16;stroke:#b08a4f;stroke-opacity:.35;stroke-width:1}
.river{stroke:#b08a4f;stroke-opacity:.55;stroke-width:3.4}
.canal{stroke:#b08a4f;stroke-opacity:.4;stroke-width:1.4}
.minor{stroke:#201814;stroke-opacity:.12;stroke-width:.8}
.mid{stroke:#201814;stroke-opacity:.3;stroke-width:1.6}
.major{stroke:#42242d;stroke-opacity:.62;stroke-width:2.8}
.rail{stroke:#201814;stroke-opacity:.45;stroke-width:1.3;stroke-dasharray:7 5}
path{fill:none;stroke-linecap:round;stroke-linejoin:round}`
const order = ['water', 'river', 'canal', 'minor', 'mid', 'rail', 'major']
const body = order.filter((o) => paths[o]).map((o) => `<path class="${o}" d="${paths[o].join('')}"/>`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${style.replace(/\n/g, '')}</style>${body}</svg>`
const out = path.resolve(import.meta.dirname, '../public/img/bg/moradabad.svg')
fs.writeFileSync(out, svg)
console.log(`wrote ${out}: ${(svg.length / 1024).toFixed(0)} KB, ${W}x${H}, home at ${(X(HOME.lon) / W).toFixed(4)}, ${(Y(HOME.lat) / H).toFixed(4)}`)

/* The Overpass query:
[out:json][timeout:90];(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified)$"](28.78,78.68,28.91,78.86);
  way["railway"="rail"](28.70,78.60,28.98,78.95);
  way["waterway"~"^(river|canal)$"](28.70,78.60,28.98,78.95);
  way["natural"="water"](28.70,78.60,28.98,78.95);
);out geom;
*/
