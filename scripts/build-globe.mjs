// Bakes the data for the globe in Where I serve, once, so the browser never does this work.
//   public/data/globe.bin       coastlines, country borders and Indian state lines, as lon/lat
//   public/data/globe-mask.png  a world map, one grey level per kind of ground
// Land and borders are Natural Earth (public domain) through world-atlas. Indian states come from the
// previous site's map.
import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync, crc32 } from 'node:zlib'
import { feature, mesh } from 'topojson-client'

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)))
const landTopo = read('../node_modules/world-atlas/land-50m.json')
const countryTopo = read('../node_modules/world-atlas/countries-50m.json')
const reach = read('./reach-map.json')

// -- South Asia keeps every point; the rest of the world is thinned to what a whole globe can show
const near = ([lon, lat]) => lon > 58 && lon < 102 && lat > 2 && lat < 42
const thin = (line, tol = 0.22) => {
  const out = [line[0]]
  for (let i = 1; i < line.length - 1; i++) {
    const a = out[out.length - 1]
    if (near(line[i]) || Math.hypot(line[i][0] - a[0], line[i][1] - a[1]) > tol) out.push(line[i])
  }
  out.push(line[line.length - 1])
  return out
}

const land = feature(landTopo, landTopo.objects.land)
const polygons = []
for (const f of land.features ?? [land]) {
  if (f.geometry.type === 'Polygon') polygons.push(f.geometry.coordinates)
  if (f.geometry.type === 'MultiPolygon') polygons.push(...f.geometry.coordinates)
}
const coast = polygons.flat().map((r) => thin(r))
const borders = mesh(countryTopo, countryTopo.objects.countries, (a, b) => a !== b).coordinates.map((l) => thin(l))

// -- the previous map's plane: world Mercator, 1000 units wide, cropped at 76N
const K = 1000 / (2 * Math.PI)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const TOP = merc(76)
const unproject = (x, y) => [(x / K) * (180 / Math.PI) - 180, (2 * Math.atan(Math.exp(TOP - y / K)) - Math.PI / 2) * (180 / Math.PI)]
const [ix, iy, is] = reach.india
const stateRings = reach.states.map((s) => ({
  name: s.n,
  rings: s.d.split('M').filter(Boolean).map((sub) => sub.replace(/Z/g, '').split('L').map((p) => {
    const [x, y] = p.split(',').map(Number)
    return unproject(ix + x * is, iy + y * is)
  })),
}))
const states = stateRings.flatMap((s) => s.rings)

// -- the lines, as 16-bit hundredths of a degree, with a break value between strips
const BREAK = 32767
const pack = (lines) => lines.flatMap((l) => [...l.flatMap(([lon, lat]) => [Math.round(lon * 100), Math.round(lat * 100)]), BREAK, BREAK])
const parts = [pack(coast), pack(borders), pack(states)]
const head = new Int32Array(parts.map((p) => p.length))
const body = Int16Array.from(parts.flat())
writeFileSync(new URL('../public/data/globe.bin', import.meta.url), Buffer.concat([Buffer.from(head.buffer), Buffer.from(body.buffer)]))

// -- the mask: an even-odd scanline fill on an equirectangular plane
const W = 4096
const H = 2048
const px = new Uint8Array(W * H)
const fill = (rings, value) => {
  const rows = new Map()
  for (const r of rings) {
    for (let i = 0; i < r.length - 1; i++) {
      const x0 = ((r[i][0] + 180) / 360) * W
      const y0 = ((90 - r[i][1]) / 180) * H
      const x1 = ((r[i + 1][0] + 180) / 360) * W
      const y1 = ((90 - r[i + 1][1]) / 180) * H
      if (y0 === y1) continue
      const from = Math.ceil(Math.min(y0, y1) - 0.5)
      const to = Math.floor(Math.max(y0, y1) - 0.5)
      for (let y = from; y <= to; y++) {
        if (y < 0 || y >= H) continue
        const x = x0 + ((y + 0.5 - y0) / (y1 - y0)) * (x1 - x0)
        if (!rows.has(y)) rows.set(y, [])
        rows.get(y).push(x)
      }
    }
  }
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b)
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.max(0, Math.round(xs[i])); x < Math.min(W, Math.round(xs[i + 1])); x++) {
        const k = y * W + x
        if (px[k] < value) px[k] = value
      }
    }
  }
}
polygons.forEach((p) => fill(p, 90))
for (const s of stateRings) {
  const value = s.name === 'Uttar Pradesh' ? 255 : s.name === 'Uttarakhand' || s.name === 'NCT of Delhi' ? 190 : 150
  s.rings.forEach((r) => fill([r], value))
}

// -- a plain greyscale PNG
const chunk = (type, data) => {
  const t = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8
const raw = Buffer.alloc((W + 1) * H)
for (let y = 0; y < H; y++) Buffer.from(px.buffer, y * W, W).copy(raw, y * (W + 1) + 1)
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
writeFileSync(new URL('../public/data/globe-mask.png', import.meta.url), png)
console.log(`lines ${(body.byteLength / 1024).toFixed(0)} kB, mask ${(png.length / 1024).toFixed(0)} kB`)
