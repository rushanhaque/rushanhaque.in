import { FULLSCREEN, Program } from '../core'
import { CITIES, HOME, axes, camera, plateLayout, toVec } from '../../lib/places'

// The globe: the real earth seen from space, on one disc. Land, India and home come from a baked world map,
// sharp at any distance because the coastlines, borders and state lines are drawn over it as real geometry.
// See lib/places.js for the camera.
const hex = (h) => [1, 3, 5].map((i) => Math.pow(parseInt(h.slice(i, i + 2), 16) / 255, 2.2))
const glsl = (h) => { const c = hex(h); return `vec3(${c.map((v) => v.toFixed(5)).join(',')})` }

const BACK_F = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uCenter, uRes;
uniform float uR, uClip, uLod, uHasMap;
uniform mat3 uRot;
uniform sampler2D uMask;
const float PI = 3.14159265;
const vec3 GROUND = ${glsl('#120a0c')};
const vec3 OCEAN = ${glsl('#1f1216')};
const vec3 LAND = ${glsl('#57413f')};
const vec3 INDIA = ${glsl('#75594a')};
const vec3 NEAR = ${glsl('#7f6249')};
const vec3 CORE = ${glsl('#8f6f4c')};
const vec3 BRASS = ${glsl('#d9b97e')};
void main(){
  vec2 d = vUv * uRes - uCenter;
  float rl = length(d) / uClip;
  vec3 col = GROUND;
  if (rl < 1.01) {
    vec2 p = d / uR;
    float rr = length(p);
    vec3 g = GROUND;
    // the air around the earth
    if (rr >= 1.) g += BRASS * .16 * exp(-(rr - 1.) * uR / (uClip * .022));
    if (rr < 1.) {
      float z = sqrt(1. - rr * rr);
      vec3 n = vec3(p, z);
      vec3 v = transpose(uRot) * n;
      float lat = asin(clamp(v.y, -1., 1.));
      float lon = atan(v.x, v.z);
      vec2 uv = vec2(lon / (2. * PI) + .5, .5 - lat / PI);
      float m = 0.;
      if (uHasMap > .5) {
        vec2 t = vec2(1.3 / 4096., 1.3 / 2048.);
        m = (textureLod(uMask, uv, uLod).r * 2. + textureLod(uMask, uv + t * vec2(1., .4), uLod).r + textureLod(uMask, uv + t * vec2(-1., -.4), uLod).r
          + textureLod(uMask, uv + t * vec2(-.4, 1.), uLod).r + textureLod(uMask, uv + t * vec2(.4, -1.), uLod).r) / 6.;
      }
      vec3 c = mix(OCEAN, LAND, smoothstep(.14, .3, m));
      c = mix(c, INDIA, smoothstep(.45, .56, m));
      c = mix(c, NEAR, smoothstep(.66, .72, m));
      c = mix(c, CORE, smoothstep(.84, .95, m));
      // lines of latitude and longitude, every 15 degrees
      float step = PI / 12.;
      float a = abs(fract(lon / step + .5) - .5) * step * cos(lat);
      float b = abs(fract(lat / step + .5) - .5) * step;
      float w = 1.1 / uR;
      float grid = 1. - smoothstep(0., w, min(a, b));
      c += BRASS * .035 * grid;
      // the sun over one shoulder, and the thin bright edge of the atmosphere
      c *= .68 + .42 * max(dot(n, normalize(vec3(-.45, .55, .7))), 0.);
      c += BRASS * pow(1. - z, 3.) * .2;
      g = mix(g, c, smoothstep(1., 1. - 1.5 / uR, rr));
    }
    col = mix(g, GROUND, smoothstep(1. - 1.2 / uClip, 1. + 1.2 / uClip, rl));
    // the rim of the disc
    col += BRASS * .22 * (1. - smoothstep(0., 1.3 / uClip, abs(rl - 1.)));
  }
  o = vec4(col, 1.);
}`

const LINE_V = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in float aT;
uniform vec2 uCenter, uRes;
uniform float uR, uPointSize;
uniform mat3 uRot;
out float vZ;
out float vT;
void main(){
  vec3 q = uRot * aPos;
  vZ = q.z;
  vT = aT;
  gl_Position = vec4((uCenter + q.xy * uR) / uRes * 2. - 1., 0., 1.);
  gl_PointSize = uPointSize;
}`

const LINE_F = /* glsl */ `#version 300 es
precision highp float;
in float vZ;
in float vT;
uniform vec2 uCenter;
uniform vec3 uColor;
uniform float uAlpha, uClip, uRound, uReach, uFade;
out vec4 o;
void main(){
  float a = uAlpha;
  if (vT > uReach) discard;
  if (vZ < 0.) discard;
  a *= mix(1., smoothstep(0., .22, vZ), uFade);
  if (uRound > .5) a *= smoothstep(.5, .36, length(gl_PointCoord - .5));
  float r = length(gl_FragCoord.xy - uCenter) / uClip;
  a *= 1. - smoothstep(.985, 1., r);
  o = vec4(uColor, a);
}`

const INK = hex('#f6e6c8')
const BRASS = hex('#ecc98a')
const WHITE = hex('#ffffff')

export class Atlas {
  constructor(e) {
    this.e = e
    const gl = e.gl
    this.back = new Program(gl, FULLSCREEN, BACK_F)
    this.prog = new Program(gl, LINE_V, LINE_F)
    this.look = { res: e.phone ? 1.5 : e.tier === 'high' ? 1.5 : 1.25 }
    this.progress = 0
    this.lines = {}
    this.mask = null
    this.routes = [[], [], []]
    this.points = [[], [], []]
    this.build()
    fetch('/data/globe.bin').then((r) => r.arrayBuffer()).then((b) => this.load(b)).catch(() => {})
    const img = new Image()
    img.src = '/data/globe-mask.png'
    img.decode().then(() => this.upload(img)).catch(() => {})
  }

  vao(pos, t) {
    const gl = this.e.gl
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const put = (loc, size, data) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    }
    put(0, 3, new Float32Array(pos))
    put(1, 1, new Float32Array(t || new Float32Array(pos.length / 3)))
    gl.bindVertexArray(this.e.vao)
    return { vao, count: pos.length / 3 }
  }

  // the routes rise off the surface in great circles, higher the farther they go
  build() {
    const home = toVec(HOME.lat, HOME.lon)
    const segs = [{ p: [], t: [] }, { p: [], t: [] }, { p: [], t: [] }]
    const dots = [[], [], []]
    for (const c of CITIES) {
      const v = toVec(c.lat, c.lon)
      dots[c.stage].push(...v)
      const ang = Math.acos(Math.min(1, home[0] * v[0] + home[1] * v[1] + home[2] * v[2]))
      const n = c.stage === 2 ? 48 : 20
      const s = Math.sin(ang) || 1
      const at = (k) => {
        const f = k / n
        const a = Math.sin((1 - f) * ang) / s
        const b = Math.sin(f * ang) / s
        const lift = 1 + Math.sin(f * Math.PI) * ang * 0.14
        return [(a * home[0] + b * v[0]) * lift, (a * home[1] + b * v[1]) * lift, (a * home[2] + b * v[2]) * lift]
      }
      for (let k = 0; k < n; k++) {
        segs[c.stage].p.push(...at(k), ...at(k + 1))
        segs[c.stage].t.push(k / n, (k + 1) / n)
      }
    }
    this.routes = segs.map((s) => this.vao(s.p, s.t))
    this.points = dots.map((d) => this.vao(d))
    this.home = this.vao(home)
  }

  load(buf) {
    const head = new Int32Array(buf, 0, 3)
    const body = new Int16Array(buf, 12)
    let at = 0
    const names = ['coast', 'borders', 'states']
    names.forEach((name, i) => {
      const end = at + head[i]
      const pos = []
      let prev = null
      for (let k = at; k < end; k += 2) {
        if (body[k] === 32767) { prev = null; continue }
        const v = toVec(body[k + 1] / 100, body[k] / 100)
        if (prev) pos.push(...prev, ...v)
        prev = v
      }
      at = end
      this.lines[name] = this.vao(pos)
    })
    this.e.forceFrames = 2
  }

  upload(img) {
    const gl = this.e.gl
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, img)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.mask = tex
    this.e.forceFrames = 2
  }

  ready() { return this.prog.ready && this.back.ready }
  update() { return false }
  animating() { return false }

  draw(gl, ctx) {
    this.drawn = true
    const k = ctx.vw / ctx.w
    const l = plateLayout(ctx.w, ctx.h)
    const clip = l.R * k
    const p = this.progress
    const cam = camera(p, clip)
    const { E, N, C } = axes(cam)
    const uRot = new Float32Array([E[0], N[0], C[0], E[1], N[1], C[1], E[2], N[2], C[2]])
    const base = { uCenter: [l.cx * k, (ctx.h - l.cy) * k], uRes: [ctx.vw, ctx.vh], uR: cam.R, uClip: clip, uRot }

    this.back.use({ ...base, uMask: this.mask || this.e.blank1, uHasMap: this.mask ? 1 : 0, uLod: Math.max(0, Math.log2(4096 / (2 * Math.PI * cam.R))) })
    gl.bindVertexArray(this.e.vao)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const dpr = ctx.vw / ctx.w
    // the closer you are, the more the lines matter
    const near = Math.min(1, Math.max(0, (cam.R / clip - 1.2) / 3))
    const draw = (g, mode, o) => {
      if (!g) return
      this.prog.use({ ...base, uColor: INK, uAlpha: 1, uRound: 0, uReach: 2, uFade: 1, uPointSize: 1, ...o })
      gl.bindVertexArray(g.vao)
      gl.drawArrays(mode, 0, g.count)
    }
    draw(this.lines.borders, gl.LINES, { uAlpha: 0.1 + near * 0.08 })
    draw(this.lines.states, gl.LINES, { uAlpha: 0.14 + near * 0.26 })
    draw(this.lines.coast, gl.LINES, { uAlpha: 0.42 })
    const reach = [Math.min(1, p / 0.1), (p - 0.3) / 0.2, (p - 0.6) / 0.2]
    reach.forEach((r, i) => {
      if (r > 0) draw(this.routes[i], gl.LINES, { uColor: BRASS, uAlpha: i === 2 ? 0.75 : 0.5, uReach: r, uFade: 0 })
      if (r > 0.95) draw(this.points[i], gl.POINTS, { uColor: BRASS, uPointSize: (i === 2 ? 7 : 5) * dpr, uRound: 1 })
    })
    draw(this.home, gl.POINTS, { uColor: WHITE, uPointSize: 9 * dpr, uRound: 1 })
    gl.disable(gl.BLEND)
    gl.bindVertexArray(this.e.vao)
  }
}
