import { gsap } from '../lib/gsap'
import { device } from '../lib/device'
import { pointer } from '../lib/pointer'
import { sun } from '../lib/sun'
import { director } from '../lib/director'
import { FULLSCREEN, Program, createContext, createPixel, createTarget } from './core'

// The last lens every scene passes through: a soft shoulder so highlights roll off instead of clipping,
// a vignette, the sRGB curve, and a fixed grain that stops any soft gradient of light from banding.
const COMPOSITE = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D t;
uniform vec2 uScale, uPx;
uniform float uAA, uVig;
vec3 shoulder(vec3 c){ vec3 x = max(c - .82, 0.); return min(c, vec3(.82)) + .18 * x / (x + .18); }
float rnd(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float luma(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
void main(){
  vec2 uv = vUv * uScale;
  vec3 col = texture(t, uv).rgb;
  if (uAA > .5) {
    // a small FXAA, for the only scene that has hard edges
    float lm = sqrt(luma(col));
    float nw = sqrt(luma(texture(t, uv + vec2(-1., 1.) * uPx).rgb));
    float ne = sqrt(luma(texture(t, uv + vec2( 1., 1.) * uPx).rgb));
    float sw = sqrt(luma(texture(t, uv + vec2(-1.,-1.) * uPx).rgb));
    float se = sqrt(luma(texture(t, uv + vec2( 1.,-1.) * uPx).rgb));
    float lo = min(lm, min(min(nw, ne), min(sw, se)));
    float hi = max(lm, max(max(nw, ne), max(sw, se)));
    if (hi - lo > max(.03, hi * .08)) {
      vec2 d = vec2(-((nw + ne) - (sw + se)), (nw + sw) - (ne + se));
      float rd = 1. / (min(abs(d.x), abs(d.y)) + .02);
      d = clamp(d * rd, -4., 4.) * uPx;
      vec3 a = .5 * (texture(t, uv + d * (1. / 3. - .5)).rgb + texture(t, uv + d * (2. / 3. - .5)).rgb);
      vec3 b = a * .5 + .25 * (texture(t, uv - d * .5).rgb + texture(t, uv + d * .5).rgb);
      float lb = sqrt(luma(b));
      col = (lb < lo || lb > hi) ? a : b;
    }
  }
  col = shoulder(col);
  vec2 v = vUv - .5;
  col *= 1. - uVig * dot(v, v) * 1.6;
  col = pow(max(col, 0.), vec3(1. / 2.2));
  col += (rnd(gl_FragCoord.xy) - .5) * .014;
  o = vec4(col, 1.);
}`

// How many CSS pixels' worth of detail each kind of scene asks for. Soft light needs far fewer pixels
// than you would think, which is most of why this runs on phones.
const LEVELS = [1, 0.84, 0.7, 0.58, 0.46]
// how long a still scene may go without being drawn again
const IDLE = 0.9

export class Engine {
  constructor(canvas) {
    const gl = createContext(canvas)
    if (!gl) throw new Error('no-webgl')
    this.gl = gl
    this.canvas = canvas
    const d = device()
    this.tier = d.tier
    this.phone = d.phone
    this.touch = d.touch
    const hasFloat = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'))
    gl.getExtension('OES_texture_float_linear')
    this.hdr = hasFloat
    this.vao = gl.createVertexArray()
    this.out = Math.min(devicePixelRatio || 1, this.tier === 'high' ? 2 : 1.5)
    this.main = createTarget(gl, 4, 4, hasFloat)
    this.comp = new Program(gl, FULLSCREEN, COMPOSITE)
    this.compU = { t: this.main.tex, uScale: [1, 1], uPx: [0.001, 0.001], uAA: 0, uVig: 0 }
    this.stages = new Map()
    this.blank1 = createPixel(gl, 0, 0, 0)
    this.factories = new Map()
    this.level = 0
    this.ctx = { time: 0, dt: 0.016, w: 1, h: 1, aspect: 1, tier: this.tier, phone: this.phone, touch: this.touch, pointer, sun, gl, engine: this }
    this.lastY = -1
    this.lastHour = -1
    this.lastStage = null
    this.lastDraw = -1
    this.forceFrames = 4
    this.times = []
    this.tunedAt = 0
    this.badStreak = 0
    this.visible = !document.hidden
    this.alive = true
    // coming back to the tab, or to the window, can hand back a canvas with nothing in it: draw again at once
    this.onVisibility = () => { this.visible = !document.hidden; this.forceFrames = 3; this.times.length = 0 }
    document.addEventListener('visibilitychange', this.onVisibility)
    addEventListener('focus', this.onVisibility)
    addEventListener('pageshow', this.onVisibility)
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.kill() })
    this.resize = this.resize.bind(this)
    this.tick = this.tick.bind(this)
    let lastW = innerWidth
    this.onResize = () => {
      // on a phone the address bar sliding away is not a resize worth reacting to
      if (this.touch && innerWidth === lastW) return
      lastW = innerWidth
      this.resize()
    }
    addEventListener('resize', this.onResize)
    this.resize()
    gsap.ticker.add(this.tick)
  }

  register(name, factory) { this.factories.set(name, factory) }

  stage(name) {
    if (!name) return null
    let s = this.stages.get(name)
    if (!s && this.factories.has(name)) {
      s = this.factories.get(name)(this)
      this.stages.set(name, s)
      s.resize?.(this.ctx)
    }
    return s || null
  }

  resize() {
    const w = innerWidth
    const h = Math.max(innerHeight, document.documentElement.clientHeight)
    Object.assign(this.ctx, { w, h, aspect: w / h })
    this.canvas.width = Math.round(w * this.out)
    this.canvas.height = Math.round(h * this.out)
    this.main.resize(this.canvas.width, this.canvas.height)
    this.compU.uPx = [1 / this.canvas.width, 1 / this.canvas.height]
    this.stages.forEach((s) => s.resize?.(this.ctx))
    this.forceFrames = 3
  }

  // Hold the frame rate by giving up pixels, then effects; never by dropping frames. If even that is
  // not enough the canvas retires and the page carries on looking right without it.
  tune(dt, now) {
    this.times.push(dt)
    if (this.times.length < 30) return
    const sorted = [...this.times].sort((a, b) => a - b)
    const typical = sorted[Math.floor(sorted.length * 0.6)]
    this.times.length = 0
    if (now - this.tunedAt < 1.2) return
    if (typical > 1 / 40) {
      this.tunedAt = now
      if (this.level < LEVELS.length - 1) {
        this.level++
      } else if (typical > 1 / 24) {
        this.badStreak++
        if (this.badStreak >= 3) this.kill()
      }
      this.stages.forEach((s) => s.onLevel?.(this.level))
    } else if (typical < 1 / 58 && this.level > 0 && now - this.tunedAt > 6) {
      this.tunedAt = now
      this.level--
      this.badStreak = 0
      this.stages.forEach((s) => s.onLevel?.(this.level))
    }
  }

  kill() {
    if (!this.alive) return
    this.alive = false
    gsap.ticker.remove(this.tick)
    removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    removeEventListener('focus', this.onVisibility)
    removeEventListener('pageshow', this.onVisibility)
    director.engine = null
    this.canvas.classList.remove('is-on')
    document.documentElement.classList.remove('has-gl', 'can-gl')
    document.documentElement.classList.add('no-gl')
  }

  // Asks for a scene's shaders ahead of time; the driver compiles them off the main thread.
  prepare(name) { this.stage(name) }

  tick(time, deltaMs) {
    if (!this.visible || !this.alive) return
    const dt = Math.min(deltaMs / 1000, 0.05)
    const ctx = this.ctx
    ctx.time = time
    ctx.dt = dt
    const st = director.state
    if (!st.stage) {
      if (this.shown) { this.shown = false; this.canvas.classList.remove('is-on') }
      this.lastDraw = time
      return
    }
    const stage = this.stage(st.stage)
    if (!stage || !stage.ready() || !this.comp.ready) return
    if (!this.shown) this.forceFrames = Math.max(this.forceFrames, 2)

    const y = scrollY
    const moved = y !== this.lastY || sun.hour !== this.lastHour || stage !== this.lastStage
      || Math.abs(pointer.nx - pointer.sx) + Math.abs(pointer.ny - pointer.sy) > 0.0015
    const eased = stage.update?.(ctx)
    const anim = stage.animating?.(ctx) || eased
    if (!moved && !anim && this.forceFrames <= 0 && time - this.lastDraw < IDLE) {
      // nothing has changed, so nothing is drawn: the page costs no battery while you read it. A canvas left
      // untouched for too long can still be dropped by the browser, so one frame a second keeps it alive.
      this.times.length = 0
      this.wasMoving = false
      return
    }
    // idle life, as opposed to something the visitor is doing, can run at half speed
    if (!moved && anim && this.forceFrames <= 0 && time - this.lastDraw < (this.tier === 'high' ? 1 / 61 : 1 / 31)) return
    this.forceFrames = Math.max(0, this.forceFrames - 1)
    this.lastY = y
    this.lastHour = sun.hour
    this.lastStage = stage

    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.disable(gl.DEPTH_TEST)
    gl.disable(gl.CULL_FACE)
    gl.disable(gl.BLEND)

    // the pixels this scene gets this frame
    const look = stage.look || {}
    const base = Math.min(this.out, look.res ?? 1)
    const f = Math.min(1, base * LEVELS[this.level])
    const pix = base * LEVELS[this.level]
    const vw = Math.max(2, Math.round(ctx.w * pix))
    const vh = Math.max(2, Math.round(ctx.h * pix))
    ctx.vw = vw
    ctx.vh = vh
    ctx.quality = this.level
    void f
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.main.fb)
    gl.viewport(0, 0, vw, vh)
    stage.draw(gl, ctx)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.bindVertexArray(this.vao)
    gl.disable(gl.BLEND)
    const u = this.compU
    u.uScale = [vw / this.main.w, vh / this.main.h]
    u.uPx = [1 / this.main.w, 1 / this.main.h]
    u.uVig = look.vignette || 0
    u.uAA = look.aa ? 1 : 0
    this.comp.use(u)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    // only frames we wanted back to back say anything about how the GPU is coping
    if (moved && this.wasMoving) this.tune(dt, time)
    this.wasMoving = moved
    if (!this.shown) {
      this.shown = true
      this.canvas.classList.add('is-on')
      document.documentElement.classList.remove('no-gl')
      document.documentElement.classList.add('has-gl')
    }
    this.lastDraw = time
  }
}

export function fullscreen(gl) { gl.drawArrays(gl.TRIANGLES, 0, 3) }
