import { FULLSCREEN, Program, createImageTexture, createPixel } from '../core'
import { NOISE, JALI } from '../glsl'
import { corridor, BAY, WALL, ROOF, PLATE_W, PLATE_Y } from '../../lib/corridor'
import { works } from '../../data/content'

// The long gallery, and the only room with a canvas behind it. There is no mesh here: every pixel fires a
// ray and works out exactly what it hits in a dark corridor of pointed arches. The sun comes in through a
// jali window in each bay and lands on honed stone, and the air between catches it. Each picture is a line
// drawing until you get near, then a lattice opens on the real thing, and it lights the room it hangs in.
const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform vec2 uRes;
uniform vec3 uCam, uFwd, uRight, uUp, uSunDir, uSun, uSkyTint, uColA, uColB;
uniform float uFocal, uSunPower, uAmb, uVol;
uniform int uVolSteps, uReflect;
uniform sampler2D uRealA, uPlanA, uRealB, uPlanB;
uniform vec4 uA, uB; // z, height, open, reveal
${NOISE}
${JALI}

const float D = ${BAY.toFixed(1)};
const float W = ${WALL.toFixed(1)};
const float H = ${ROOF.toFixed(1)};
const float T = 1.5;
const float AW = 5.6;
const float AS = 5.2;
const float AC = 2.3;
const float AR = AW + AC;
const float PW = ${PLATE_W.toFixed(2)};
const float PY = ${PLATE_Y.toFixed(2)};

float archSD(vec2 q){
  float x = abs(q.x);
  if (q.y < AS) return x - AW;
  return length(vec2(x + AC, q.y - AS)) - AR;
}
vec2 archGrad(vec2 q){
  float x = abs(q.x), s = q.x < 0. ? -1. : 1.;
  if (q.y < AS) return vec2(s, 0.);
  vec2 g = normalize(vec2(x + AC, q.y - AS));
  return vec2(g.x * s, g.y);
}

struct Hit { float t; vec3 n; int id; vec2 uv; };

void plate(vec3 ro, vec3 rd, vec4 P, inout Hit h, int id){
  if (rd.z >= 0.) return;
  float t = (P.x - ro.z) / rd.z;
  if (t <= 0. || t >= h.t) return;
  vec3 q = ro + rd * t;
  if (abs(q.y - PY) > P.y * .5) return;
  // a picture is also a pair of doors: as it opens, each half slides into the wall
  float s = P.z * PW * .72;
  float ax = abs(q.x);
  if (ax < s || ax > PW * .5 + s || ax > W) return;
  float u = (q.x < 0. ? -(ax - s) : (ax - s)) / PW + .5;
  h.t = t; h.id = id; h.n = vec3(0., 0., 1.);
  h.uv = vec2(u, (q.y - PY) / P.y + .5);
}

Hit trace(vec3 ro, vec3 rd){
  Hit h; h.t = 1e5; h.id = 0; h.n = vec3(0.); h.uv = vec2(0.);
  float tx = rd.x > 0. ? (W - ro.x) / rd.x : (-W - ro.x) / rd.x;
  float ty = rd.y > 0. ? (H - ro.y) / rd.y : (-ro.y) / rd.y;
  if (tx < ty) { h.t = tx; h.n = vec3(-sign(rd.x), 0., 0.); h.id = 0; }
  else { h.t = ty; h.n = vec3(0., -sign(rd.y), 0.); h.id = rd.y > 0. ? 2 : 1; }
  if (rd.z < 0.) {
    float k0 = ceil((-ro.z - T) / D);
    for (int i = 0; i < 5; i++) {
      float zf = -(k0 + float(i)) * D;
      float tf = (zf - ro.z) / rd.z;
      if (tf > h.t) break;
      if (tf > 0. && archSD(ro.xy + rd.xy * tf) > 0.) { h.t = tf; h.id = 3; h.n = vec3(0., 0., 1.); break; }
      float tb = (zf - T - ro.z) / rd.z;
      if (tb > 0. && tb < h.t && archSD(ro.xy + rd.xy * tb) > 0.) {
        float a = max(tf, 0.), b = tb;
        for (int j = 0; j < 5; j++) { float m = .5 * (a + b); if (archSD(ro.xy + rd.xy * m) > 0.) b = m; else a = m; }
        h.t = b; h.id = 4;
        h.n = normalize(vec3(-archGrad(ro.xy + rd.xy * b), 0.));
        break;
      }
    }
  }
  plate(ro, rd, uA, h, 5);
  plate(ro, rd, uB, h, 6);
  return h;
}

// Does the sun reach this point? It must come through the jali window in the side wall of this bay.
float sunLit(vec3 P, float softBase){
  float sx = sign(uSunDir.x);
  float t = (sx * W - P.x) / uSunDir.x;
  if (t < 0.) return 0.;
  vec3 Q = P + uSunDir * t;
  float cell = floor(P.z / D);
  if (floor(Q.z / D) != cell) return 0.;
  float zl = Q.z - (cell + .5) * D, yl = Q.y - 8.6;
  float gate = smoothstep(.06, -.06, abs(zl) - 5.8) * smoothstep(.06, -.06, abs(yl) - 3.3);
  if (gate <= 0.) return 0.;
  return gate * jali(vec2(zl, yl) * .52 + 41., .32, softBase + t * .0018);
}

vec3 plateGlow(vec3 P, vec3 N, vec4 pl, vec3 col){
  vec3 L = vec3(0., PY, pl.x) - P;
  float d2 = dot(L, L);
  float nl = max(dot(N, L / sqrt(d2)), 0.);
  float front = smoothstep(-1., 1.5, P.z - pl.x);
  return col * nl * front * 15. / (d2 + 10.);
}

vec3 surface(Hit h, vec3 ro, vec3 rd){
  vec3 P = ro + rd * h.t;
  vec3 N = h.n;
  vec2 st = h.id == 1 ? P.xz : h.id == 2 ? P.xz * .7 : h.id == 3 ? P.xy : h.id == 4 ? vec2(P.z, P.x + P.y) : P.zy;
  float b = noise(st * .23 + 7.) * .6 + noise(st * .62 + 3.) * .4;
  float m = noise(st * 1.3 + b * 2.);
  vec3 alb;
  if (h.id == 1) {
    // honed dark stone, laid in big slabs
    vec2 sl = fract(P.xz / vec2(7.4)) - .5;
    float seam = smoothstep(.494, .4985, max(abs(sl.x), abs(sl.y)));
    alb = vec3(.44, .4, .36) * (.86 + m * .28) * (1. - seam * .34);
  } else {
    alb = vec3(.66, .62, .56) * (.82 + b * .3) * (.95 + noise(st * 26.) * .1);
    if (h.id == 4) alb *= 1.12;
  }
  float lit = sunLit(P + N * .03, .018);
  vec3 col = alb * uSun * lit * max(dot(N, uSunDir), 0.) * uSunPower;
  col += alb * uSun * exp(-pow(P.y * .11, 2.)) * .012 * uSunPower;
  col += alb * plateGlow(P, N, uA, uColA);
  col += alb * plateGlow(P, N, uB, uColB) * .7;
  float dx = W - abs(P.x), dy = min(P.y, H - P.y);
  float zLocal = mod(-P.z, D);
  float ao = 1.;
  if (h.id <= 2) ao = smoothstep(0., 2.6, min(dx, h.id == 0 ? dy : 2.6)) * .7 + .3;
  ao *= smoothstep(-.1, 3., min(zLocal, D - zLocal)) * .55 + .45;
  if (h.id == 3) ao *= smoothstep(0., 1.6, archSD(P.xy)) * .35 + .65;
  col += alb * uSkyTint * uAmb * ao * (.45 + P.y * .05) * 2.5;
  return col;
}

vec3 picture(int which, vec2 uv, vec4 P){
  vec3 real = which == 5 ? texture(uRealA, uv, -.6).rgb : texture(uRealB, uv, -.6).rgb;
  vec3 plan = which == 5 ? texture(uPlanA, uv).rgb : texture(uPlanB, uv).rgb;
  // Before it arrives, the plate is a dark panel set into the wall, with the drawing the site began as etched on
  // it in brass. No sheet of white paper: the real site simply comes up out of the dark.
  float ink = 1. - dot(plan, vec3(.333));
  vec3 lines = mix(vec3(.055, .05, .047), vec3(.38, .29, .17), clamp(ink * 1.5, 0., 1.));
  // the picture arrives through a lattice opening outward from its centre
  float aspect = PW / P.y;
  vec2 g = (uv - .5) * vec2(aspect, 1.);
  float wave = clamp((P.w * 2.05 - length(g)) * 3.2, 0., 1.);
  float cell = jali(g * 9. + 50., .58 * wave, .012);
  vec3 c = mix(lines, real, wave >= 1. ? 1. : cell);
  // the frame's edge catches the sun
  vec2 e = min(uv, 1. - uv) * vec2(aspect, 1.);
  c += uSun * smoothstep(.005, .0, min(e.x, e.y)) * .16;
  return c;
}

void main(){
  vec2 p = (vUv - .5) * vec2(uRes.x / uRes.y, 1.);
  vec3 ro = uCam;
  vec3 rd = normalize(uFwd * uFocal + uRight * p.x + uUp * p.y);
  Hit h = trace(ro, rd);
  vec3 col;
  if (h.id >= 5) {
    col = picture(h.id, h.uv, h.id == 5 ? uA : uB);
  } else {
    col = surface(h, ro, rd);
    if (h.id == 1 && uReflect > 0) {
      // the floor is polished: follow the reflected ray once
      vec3 P = ro + rd * h.t;
      vec3 r2 = reflect(rd, vec3(0., 1., 0.));
      Hit h2 = trace(P + vec3(0., .002, 0.), r2);
      vec3 rc;
      if (h2.id >= 5) {
        // honed stone, not a mirror: the picture smears as it falls away from the floor line
        vec4 Pp = h2.id == 5 ? uA : uB;
        vec3 img = (h2.id == 5 ? textureLod(uRealA, h2.uv, 3.5) : textureLod(uRealB, h2.uv, 3.5)).rgb;
        float e = smoothstep(0., .1, min(h2.uv.x, 1. - h2.uv.x)) * smoothstep(0., .22, h2.uv.y) * smoothstep(0., .06, 1. - h2.uv.y);
        rc = img * e * clamp(Pp.w * 1.5, 0., 1.) * .9;
      } else rc = surface(h2, P, r2);
      float f = pow(1. - max(-rd.y, 0.), 3.5);
      col += rc * mix(.1, .62, f) * exp(-h2.t * .018);
    }
  }
  // the air: walk the ray, and count how much of it the sun reaches
  if (uVol > .001) {
    float tEnd = min(h.t, 46.);
    float j = .25 + hash21(gl_FragCoord.xy * .73) * .5;
    float acc = 0.;
    float dt = tEnd / float(uVolSteps);
    for (int i = 0; i < uVolSteps; i++) acc += sunLit(ro + rd * ((float(i) + j) * dt), .05) * dt;
    float phase = 1. + 1.6 * pow(max(dot(rd, uSunDir), 0.), 5.);
    col += uSun * acc * uVol * phase * (h.id >= 5 ? .0022 : .0075);
  }
  // and a little haze, so the far bays fall away into soft light. A picture is left out of it: a client's site
  // should be seen as it really is, not through the air of the room.
  float haze = (1. - exp(-h.t * .02)) * (h.id >= 5 ? .14 : .42);
  col = mix(col, vec3(.70, .66, .61), haze);
  o = vec4(col, 1.);
}`

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const mix3 = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s]
const DAWN = [1, 0.58, 0.3]
const NOON = [1, 0.86, 0.68]

export class Gallery {
  constructor(e) {
    this.e = e
    const gl = e.gl
    this.prog = new Program(gl, FULLSCREEN, FRAG)
    const hi = e.tier === 'high'
    this.look = { res: e.phone ? 1.25 : hi ? 1.25 : 1, aa: true, vignette: 0.18 }
    this.aniso = gl.getExtension('EXT_texture_filter_anisotropic')
    this.blank = createPixel(gl, 8, 8, 8)
    this.items = works.map(() => ({ real: this.blank, plan: this.blank, avg: [0.5, 0.45, 0.4], asked: false }))
    this.full = hi && !e.phone
    this.u = {
      uRes: [1, 1], uCam: [0, 3, 10], uFwd: [0, 0, -1], uRight: [1, 0, 0], uUp: [0, 1, 0], uSunDir: [-0.6, 0.6, 0.1],
      uSun: [1, 1, 1], uSkyTint: [1, 1, 1], uColA: [0, 0, 0], uColB: [0, 0, 0], uFocal: 1.6, uSunPower: 9, uAmb: 0.2,
      uVol: 1, uVolSteps: hi ? 12 : 8, uReflect: 1,
      uRealA: this.blank, uPlanA: this.blank, uRealB: this.blank, uPlanB: this.blank, uA: [0, 4, 0, 0], uB: [0, 4, 0, 0],
    }
    this.need(0)
    this.need(1)
  }

  ready() { return this.prog.ready }

  onLevel(level) {
    this.u.uVol = level < 3 ? 1 : 0
    this.u.uReflect = level < 4 ? 1 : 0
  }

  texture(src) {
    const gl = this.e.gl
    const tex = createImageTexture(gl, src)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    if (this.aniso) gl.texParameterf(gl.TEXTURE_2D, this.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8)
    return tex
  }

  // a picture's two images are fetched only as you come near it
  need(i) {
    const it = this.items[i]
    if (!it || it.asked) return
    it.asked = true
    const w = works[i]
    const small = (s) => s.replace('.webp', '-800.webp')
    const load = (url, done) => {
      const img = new Image()
      img.src = url
      img.decode().then(() => { done(img); this.e.forceFrames = 2 }).catch(() => {})
    }
    load(this.full ? w.image : small(w.image), (img) => {
      it.real = this.texture(img)
      it.avg = average(img)
    })
    load(small(w.plan), (img) => { it.plan = this.texture(img) })
  }

  update(ctx) {
    const u = this.u
    const c = corridor
    u.uCam = c.cam
    u.uFwd = c.fwd
    u.uRight = c.right
    u.uUp = c.up
    u.uFocal = c.focal
    // the morning climbs: low raking amber early on, higher and paler later
    const day = clamp01((ctx.sun.hour - 6.5) / 6)
    u.uSun = mix3(DAWN, NOON, day)
    u.uSkyTint = [0.55 + u.uSun[0] * 0.45, 0.55 + u.uSun[1] * 0.45, 0.6 + u.uSun[2] * 0.4]
    const elev = 0.26 + day * 0.72
    const dx = -Math.cos(elev), dy = Math.sin(elev), dz = 0.2 - day * 0.32
    const l = Math.hypot(dx, dy, dz)
    u.uSunDir = [dx / l, dy / l, dz / l]
    u.uSunPower = 9 + day * 7
    u.uAmb = 0.13 + day * 0.17
    const A = c.plates[c.a]
    const B = c.plates[c.b]
    const ia = this.items[c.a]
    const ib = this.items[c.b]
    this.need(c.a)
    this.need(c.b)
    this.need(c.b + 1)
    u.uA = [A.z, A.h, A.open, A.reveal]
    u.uRealA = ia.real
    u.uPlanA = ia.plan
    const ka = 0.18 + 0.82 * A.reveal
    u.uColA = [ia.avg[0] * ka, ia.avg[1] * ka, ia.avg[2] * ka]
    if (c.b !== c.a) {
      u.uB = [B.z, B.h, B.open, B.reveal]
      u.uRealB = ib.real
      u.uPlanB = ib.plan
      const kb = 0.18 + 0.82 * B.reveal
      u.uColB = [ib.avg[0] * kb, ib.avg[1] * kb, ib.avg[2] * kb]
    } else {
      u.uB = [-99999, 0.001, 0, 1]
    }
    return false
  }

  animating() { return false }

  draw(gl, ctx) {
    this.u.uRes = [ctx.vw, ctx.vh]
    this.prog.use(this.u)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

// the colour a picture throws on the room it hangs in
function average(img) {
  try {
    const c = document.createElement('canvas')
    c.width = 16
    c.height = 8
    const x = c.getContext('2d', { willReadFrequently: true })
    x.drawImage(img, 0, 0, 16, 8)
    const d = x.getImageData(0, 0, 16, 8).data
    let r = 0, g = 0, b = 0
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
    const n = d.length / 4
    const lin = (v) => Math.pow(v / n / 255, 2.2)
    return [lin(r), lin(g), lin(b)]
  } catch {
    return [0.5, 0.45, 0.4]
  }
}
