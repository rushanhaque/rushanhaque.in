// ─────────────────────────────────────────────────────────────
//  Particle morph, after the "Why Axiom" field. A picture is laid out as a grid of particles,
//  one per cell, so at rest they tile it exactly. Morphing to the next picture, every particle
//  sets off at its own moment, swirls on a curling current as it flies, rounds into a soft
//  grain and settles into its place in the new picture: the card pours apart and re-forms.
//  Particles are paired by brightness (the darkest of one picture becomes the darkest of the
//  next), so it is the same grains rearranging themselves, not a fade of colour. Plain WebGL,
//  one draw call.
// ─────────────────────────────────────────────────────────────

const vert = `
precision highp float;
attribute vec2 aFrom;
attribute vec2 aTo;
attribute vec3 aCA;
attribute vec3 aCB;
attribute vec4 aR;
uniform vec2 uRes;
uniform vec4 uCard;
uniform float uMix;
uniform float uTime;
uniform float uCell;
uniform float uK;
uniform float uLeft;
varying vec3 vCol;
varying float vFly;
varying float vAlpha;

void main() {
  // each particle departs at its own moment, so the change pours rather than snaps
  float m = smoothstep(0.0, 1.0, clamp((uMix - aR.w * 0.4) / 0.6, 0.0, 1.0));
  float fly = sin(m * 3.14159265);
  vec2 size = uCard.zw;
  vec2 p = uCard.xy + mix(aFrom, aTo, m) * size;

  // a curling current carries it while it flies; less of it spills over the words on the left
  vec2 q = (p - uCard.xy) / uK;
  vec2 sw = vec2(
    sin(q.y * 0.011 + uTime * 0.9 + aR.x * 6.2831),
    sin(q.x * 0.009 + uTime * 1.1 + aR.y * 6.2831)
  );
  if (sw.x < 0.0) sw.x *= uLeft;
  p += sw * fly * (40.0 + aR.z * 120.0) * uK;

  // and it lifts a little towards you, the cloud swelling about the card's middle
  float z = fly * (0.25 + aR.z * 0.55);
  vec2 cc = uCard.xy + 0.5 * size;
  p = cc + (p - cc) * (1.0 + z * 0.32);

  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  // a square tile while it is part of a picture, a soft round grain in flight
  gl_PointSize = (uCell + 0.9) * mix(1.0, 0.7 + aR.x * 0.5 + z * 0.8, smoothstep(0.0, 0.35, fly));
  vCol = mix(aCA, aCB, m);
  vFly = smoothstep(0.02, 0.3, fly);
  vAlpha = 1.0 - fly * 0.3 * aR.y;
}
`

const frag = `
precision mediump float;
varying vec3 vCol;
varying float vFly;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (mix(max(abs(c.x), abs(c.y)), r, vFly) > 0.5) discard;
  float a = mix(1.0, smoothstep(0.5, 0.18, r), vFly) * vAlpha;
  gl_FragColor = vec4(vCol * a, a);
}
`

/** Samples a picture into cols × rows RGB floats, cropped like object-fit: cover, top-aligned. */
export function sample(img, cols, rows) {
  const c = document.createElement('canvas')
  c.width = cols
  c.height = rows
  const g = c.getContext('2d', { willReadFrequently: true })
  const ar = cols / rows
  let sw = img.naturalWidth
  let sh = sw / ar
  if (sh > img.naturalHeight) { sh = img.naturalHeight; sw = sh * ar }
  g.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, 0, 0, cols, rows)
  const d = g.getImageData(0, 0, cols, rows).data
  const out = new Float32Array(cols * rows * 3)
  for (let i = 0, j = 0; i < d.length; i += 4, j += 3) {
    out[j] = d[i] / 255
    out[j + 1] = d[i + 1] / 255
    out[j + 2] = d[i + 2] / 255
  }
  return out
}

function mulberry(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds the morph on a canvas. Returns null without WebGL.
 *   setPair(a, b)   colour arrays (from `sample`) for the two pictures
 *   layout(rect)    the card's rectangle in canvas CSS pixels
 *   draw(mix)       0 = picture A whole, 1 = picture B whole
 */
export function createParticles(canvas, { cols, rows, seed = 7 }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, powerPreference: 'high-performance' })
  if (!gl) return null
  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = compile(gl.VERTEX_SHADER, vert)
  const fs = compile(gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const N = cols * rows
  const r = mulberry(seed)
  const rand = new Float32Array(N * 4)
  for (let i = 0; i < rand.length; i++) rand[i] = r()
  // the middle of every cell, as a share of the card
  const cell = new Float32Array(N * 2)
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const i = y * cols + x; cell[i * 2] = (x + 0.5) / cols; cell[i * 2 + 1] = (y + 0.5) / rows }

  // the cells of a picture, darkest first (with a whisper of noise so flat areas still mix),
  // worked out once per picture
  const ranks = new WeakMap()
  const rank = (c) => {
    if (ranks.has(c)) return ranks.get(c)
    const lum = new Float32Array(N)
    for (let i = 0; i < N; i++) lum[i] = c[i * 3] * 0.299 + c[i * 3 + 1] * 0.587 + c[i * 3 + 2] * 0.114 + rand[i * 4 + 3] * 0.04
    const order = new Uint32Array(N)
    for (let i = 0; i < N; i++) order[i] = i
    order.sort((a, b) => lum[a] - lum[b])
    ranks.set(c, order)
    return order
  }

  const attr = (name, data, size, usage = gl.STATIC_DRAW) => {
    const loc = gl.getAttribLocation(prog, name)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, usage)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
    return buf
  }
  attr('aR', rand, 4)
  const bufFrom = attr('aFrom', new Float32Array(N * 2), 2, gl.DYNAMIC_DRAW)
  const bufTo = attr('aTo', new Float32Array(N * 2), 2, gl.DYNAMIC_DRAW)
  const bufA = attr('aCA', new Float32Array(N * 3), 3, gl.DYNAMIC_DRAW)
  const bufB = attr('aCB', new Float32Array(N * 3), 3, gl.DYNAMIC_DRAW)
  const U = Object.fromEntries(['uRes', 'uCard', 'uMix', 'uTime', 'uCell', 'uK', 'uLeft'].map((k) => [k, gl.getUniformLocation(prog, k)]))
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const from = new Float32Array(N * 2)
  const to = new Float32Array(N * 2)
  const ca = new Float32Array(N * 3)
  const cb = new Float32Array(N * 3)
  const put = (buf, data) => { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, data) }
  const t0 = performance.now()

  return {
    setPair(a, b) {
      const oa = rank(a)
      const ob = rank(b)
      for (let k = 0; k < N; k++) {
        const i = oa[k]
        const j = ob[k]
        from[k * 2] = cell[i * 2]; from[k * 2 + 1] = cell[i * 2 + 1]
        to[k * 2] = cell[j * 2]; to[k * 2 + 1] = cell[j * 2 + 1]
        ca[k * 3] = a[i * 3]; ca[k * 3 + 1] = a[i * 3 + 1]; ca[k * 3 + 2] = a[i * 3 + 2]
        cb[k * 3] = b[j * 3]; cb[k * 3 + 1] = b[j * 3 + 1]; cb[k * 3 + 2] = b[j * 3 + 2]
      }
      put(bufFrom, from)
      put(bufTo, to)
      put(bufA, ca)
      put(bufB, cb)
    },
    layout(rect, { left = 1, ratio = window.devicePixelRatio || 1 } = {}) {
      const dpr = Math.min(ratio, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      gl.viewport(0, 0, w, h)
      gl.uniform2f(U.uRes, w, h)
      gl.uniform4f(U.uCard, rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr)
      gl.uniform1f(U.uCell, (rect.w * dpr) / cols)
      gl.uniform1f(U.uK, (rect.w * dpr) / 1000)
      gl.uniform1f(U.uLeft, left)
    },
    draw(mix) {
      gl.uniform1f(U.uMix, mix)
      gl.uniform1f(U.uTime, (performance.now() - t0) / 1000)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, N)
    },
    destroy() {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
