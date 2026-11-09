import { serve } from '../data/content'

// The globe's arithmetic, with no drawing in it. An orthographic globe seen from straight above one point:
// the camera starts just above Moradabad, pulls back over India until the whole earth fits the disc, and then
// turns the earth west so every client country passes in front of you.
const RAD = Math.PI / 180
const smooth = (t) => { const k = Math.min(1, Math.max(0, t)); return k * k * (3 - 2 * k) }
const range = (v, a, b) => (v - a) / (b - a)
const lerp = (a, b, t) => a + (b - a) * t

export const CITIES = serve.places
export const HOME = serve.home

// The disc sits in the room the page leaves for it: under the bar, inside the margins, and clear of the text.
export function plateLayout(w, h) {
  const bar = w <= 760 ? 56 : 64
  const m = Math.max(Math.min(64, Math.max(20, w * 0.04)), (w - 1680) / 2)
  const grid = w - m * 2
  if (w / h > 1) {
    const room = h - bar - 32
    const R = Math.min(room / 2, grid * 0.29)
    return { cx: w - m - R, cy: bar + 16 + room / 2, R, m }
  }
  const top = bar + 96
  const bottom = h - 186
  const R = Math.min((w - m * 2) / 2, (bottom - top) / 2 - 6)
  return { cx: w / 2, cy: (top + bottom) / 2, R, m }
}

// p runs 0 to 1 through the section; clip is the radius of the disc
export function camera(p, clip) {
  const t1 = smooth(range(p, 0.24, 0.44))
  const t2 = smooth(range(p, 0.58, 0.76))
  const spin = smooth(range(p, 0.74, 1))
  const logR = lerp(lerp(Math.log(clip / Math.sin(2.5 * RAD)), Math.log(clip / Math.sin(19 * RAD)), t1), Math.log(clip * 0.93), t2)
  return {
    R: Math.exp(logR),
    lat: lerp(lerp(HOME.lat, 23, t1), 20, t2),
    lon: lerp(lerp(lerp(HOME.lon, 80, t1), 105, t2), 8, spin),
  }
}

// the three axes of the view, as [x, y, z] per world direction
export function axes(cam) {
  const p = cam.lat * RAD
  const l = cam.lon * RAD
  const sp = Math.sin(p), cp = Math.cos(p), sl = Math.sin(l), cl = Math.cos(l)
  return { E: [cl, 0, -sl], N: [-sp * sl, cp, -sp * cl], C: [cp * sl, sp, cp * cl] }
}

export const toVec = (lat, lon) => {
  const p = lat * RAD
  const l = lon * RAD
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]
}

// where a place falls on screen: x and y in CSS pixels, how far it faces you, how far out on the disc
export function placeOn(lat, lon, cam, l) {
  const { E, N, C } = axes(cam)
  const v = toVec(lat, lon)
  const dot = (a) => a[0] * v[0] + a[1] * v[1] + a[2] * v[2]
  const x = dot(E) * cam.R
  const y = dot(N) * cam.R
  return [l.cx + x, l.cy - y, dot(C), Math.hypot(x, y) / l.R]
}
