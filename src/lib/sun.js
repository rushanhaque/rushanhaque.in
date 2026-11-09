// The time of day. Scrolling sets the hour; the hour sets the two colours of daylight on the wall: warm
// where the sun lands, cool where only the sky reaches. The site's accent stays sandstone red throughout;
// the sun itself is the small dot on the sundial.
const C = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
const KEYS = [
  [0, '#e9ebfa', '#c9cadb', '#5c6bb5'],
  [5.5, '#ffe9de', '#d4d3dc', '#e8744f'],
  [6.6, '#fff0e2', '#d8d6db', '#e8744f'],
  [8, '#fff4e6', '#dbd9dc', '#e9974a'],
  [10, '#fff8ef', '#dddcdd', '#e9ad4a'],
  [12.5, '#fffffb', '#e0dfdd', '#e9b949'],
  [15, '#fff5e3', '#dcd9d9', '#e5953b'],
  [17, '#ffedd2', '#d8d2d4', '#de6f2e'],
  [18.3, '#ffe2cf', '#d4ccd3', '#d2472a'],
  [19.5, '#fae3df', '#cfcad7', '#b4476f'],
  [21, '#efecfa', '#cbcbdb', '#5c6bb5'],
  [24, '#e9ebfa', '#c9cadb', '#5c6bb5'],
  [28.4, '#ffe9de', '#d4d3dc', '#e8744f'],
  [30, '#fff4e6', '#dbd9dc', '#e9974a'],
].map(([t, a, b, d]) => [t, C(a), C(b), C(d)])

export const sun = {
  hour: 6.4,
  lit: [1, 1, 1],
  shade: [0.8, 0.8, 0.86],
  dot: [0.9, 0.5, 0.3],
  azimuth: 0,
  elevation: 0,
  listeners: new Set(),
}

const lerp3 = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]

export function setHour(h) {
  if (h === sun.hour && sun.ready) return
  sun.ready = true
  sun.hour = h
  const t = Math.max(0, Math.min(30, h))
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++
  const k0 = KEYS[i]
  const k1 = KEYS[i + 1]
  const k = (t - k0[0]) / (k1[0] - k0[0] || 1)
  const s = k * k * (3 - 2 * k)
  sun.lit = lerp3(k0[1], k1[1], s)
  sun.shade = lerp3(k0[2], k1[2], s)
  sun.dot = lerp3(k0[3], k1[3], s)
  // the sun's path: up in the east at 6, overhead at 12:30, down in the west at 19
  const day = ((h % 24) - 6) / 13
  sun.azimuth = (day - 0.5) * Math.PI * 0.92
  sun.elevation = Math.sin(Math.min(1, Math.max(0, day)) * Math.PI) * 1.18 + 0.1
  sun.listeners.forEach((f) => f(sun))
}

export const onSun = (f) => {
  sun.listeners.add(f)
  f(sun)
  return () => sun.listeners.delete(f)
}

export function clock(h) {
  const v = ((h % 24) + 24) % 24
  const hh = Math.floor(v)
  const mm = Math.floor((v - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
