// The eight-pointed star (khatam): two squares, one turned 45 degrees. It is the unit of every jali in
// this building, the mark, the iris between pages and the mask on the pictures.
export function starPoints(cx, cy, r, inner = 0.7654) {
  const pts = []
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * inner
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad])
  }
  return pts
}

export const starPath = (cx, cy, r, inner) =>
  'M' + starPoints(cx, cy, r, inner).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z'

// a clip-path that leaves a star-shaped hole in a full-screen sheet
export const holePath = (w, h, cx, cy, r) => `path(evenodd, "M0 0H${w}V${h}H0Z${starPath(cx, cy, r)}")`
export const solidPath = (cx, cy, r) => `path("${starPath(cx, cy, r)}")`

// the radius a star needs before it covers the whole screen from a given point
export function coverRadius(w, h, cx, cy) {
  const dx = Math.max(cx, w - cx)
  const dy = Math.max(cy, h - cy)
  return Math.hypot(dx, dy) / 0.72
}
