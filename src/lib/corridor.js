import { works } from '../data/content'
import { pointer } from './pointer'

// The long gallery, as arithmetic: where you stand after walking so far, and where each picture falls on
// the screen from there, so a real link can lie exactly over the picture the canvas is drawing.
export const BAY = 20
export const WALL = 7.4
export const ROOF = 13.5
export const PLATE_W = 9.2
export const PLATE_Y = 4.5
const EYE = 3.15

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

export const corridor = {
  u: 0,
  focal: 1.6,
  aspect: 1.78,
  w: 1,
  h: 1,
  cam: [0, EYE, BAY * 0.62],
  fwd: [0, 0, -1],
  right: [1, 0, 0],
  up: [0, 1, 0],
  yaw: 0,
  pitch: 0,
  a: 0,
  b: 1,
  sway: true,
  // the clear band of the screen a picture may use, as fractions of the height: from under the bar to the top
  // of its caption, and to the top of the big title before the walk begins
  region: { top: 0.1, bottom: 0.68, lead: 0.58 },
  plates: works.map((w) => ({ ratio: w.w / w.h, z: 0, h: 0, open: 0, reveal: 0, rect: null })),

  // how far to stand and how far to tilt so a picture fills a band of the screen, centred in it
  frame(ratio, top, bottom, widthShare) {
    const f = this.focal
    const h = PLATE_W / ratio
    const share = Math.max(0.05, Math.min(bottom - top, (widthShare * this.aspect) / ratio))
    const d = (h * f) / share
    const level = 0.5 - ((PLATE_Y - EYE) * f) / d
    return { d, tilt: ((top + bottom) / 2 - level) / f }
  },

  update(u, W, H) {
    this.u = u
    this.w = W
    this.h = H
    this.aspect = W / H
    this.focal = this.aspect < 1 ? 0.8 : 1.6
    const n = this.plates.length
    const w = u - 0.5
    const i0 = Math.floor(w)
    const frac = w - i0
    const R = this.region
    const narrow = this.aspect < 1
    const stand = (i) => {
      if (i < 0) {
        const f = this.frame(this.plates[0].ratio, R.top, R.lead, narrow ? 0.72 : 0.42)
        return { z: -BAY * 0.5 + f.d, tilt: f.tilt }
      }
      if (i >= n) return { z: -n * BAY - BAY * 0.2, tilt: 0 }
      const f = this.frame(this.plates[i].ratio, R.top, R.bottom, narrow ? 0.92 : 0.62)
      return { z: -(i + 0.5) * BAY + f.d, tilt: f.tilt }
    }
    const walk = ease(clamp01((frac - 0.3) / 0.4))
    const A = stand(i0)
    const B = stand(i0 + 1)
    const z = A.z + (B.z - A.z) * walk + (frac - 0.5) * -0.3
    const tilt = A.tilt + (B.tilt - A.tilt) * walk

    // look about a little with the pointer: sideways freely, up and down only a hair, so nothing is crowded
    const k = 0.09
    const sx = this.sway ? pointer.sx : 0
    const sy = this.sway ? pointer.sy : 0
    this.yaw += (sx * 0.03 - this.yaw) * k
    this.pitch += (sy * 0.005 - this.pitch) * k
    const fx = this.yaw
    const fy = this.pitch + tilt
    const fl = Math.hypot(fx, fy, 1)
    this.fwd = [fx / fl, fy / fl, -1 / fl]
    const rl = Math.hypot(this.fwd[2], this.fwd[0])
    this.right = [-this.fwd[2] / rl, 0, this.fwd[0] / rl]
    const [rx, ry, rz] = this.right
    const [dx, dy, dz] = this.fwd
    this.up = [ry * dz - rz * dy, rz * dx - rx * dz, rx * dy - ry * dx]
    this.cam = [sx * 0.2, EYE + sy * 0.03 + Math.sin(walk * Math.PI * 2) * 0.03, z]

    let a = 0
    while (a < n - 1 && -(a + 0.5) * BAY > z - 0.2) a++
    this.a = a
    this.b = Math.min(n - 1, a + 1)

    const cam = this.cam
    const project = (x, y, pz) => {
      const v = [x - cam[0], y - cam[1], pz - cam[2]]
      const zc = dot(v, this.fwd)
      if (zc <= 0.05) return null
      const f = this.focal / zc
      return [0.5 + (dot(v, this.right) * f) / this.aspect, 0.5 - dot(v, this.up) * f]
    }
    this.plates.forEach((p, i) => {
      const pz = -(i + 0.5) * BAY
      p.z = pz
      p.h = PLATE_W / p.ratio
      p.open = ease(i < i0 ? 1 : i === i0 ? clamp01((w - i - 0.22) / 0.26) : 0)
      p.reveal = clamp01((u - i + 0.2) / 0.55)
      const tl = project(-PLATE_W / 2, PLATE_Y + p.h / 2, pz)
      const br = project(PLATE_W / 2, PLATE_Y - p.h / 2, pz)
      p.rect = tl && br ? { x: tl[0] * W, y: tl[1] * H, w: (br[0] - tl[0]) * W, h: (br[1] - tl[1]) * H } : null
    })
    return this
  },
}
