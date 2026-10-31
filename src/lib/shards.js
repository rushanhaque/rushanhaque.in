// ─────────────────────────────────────────────────────────────
//  Shard morph. A picture is laid out as a grid of square particles, one per cell, and the
//  cells are grouped into irregular glass shards (a Voronoi tiling). Morphing from picture A
//  to picture B, each shard lifts towards the viewer, turns over like a tile (A on its face,
//  B on its back), crumbles a little into particles at the top of its flight, and settles
//  back into place, its grains drifting apart and rounding as they go. Shards leave in a sweep
//  from left to right. Plain WebGL, one draw call.
// ─────────────────────────────────────────────────────────────

const vert = `
precision highp float;
attribute vec2 aUV;
attribute vec2 aShard;
attribute vec4 aR;
attribute vec2 aJ;
attribute vec3 aCA;
attribute vec3 aCB;
uniform vec2 uRes;
uniform vec4 uCard;
uniform float uMix;
uniform float uCell;
uniform float uK;
uniform float uLeft;
varying vec3 vCol;
varying float vShade;
varying float vRound;

float ease(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }

void main() {
  float delay = aShard.x * 0.55 + aR.x * 0.15;
  float t = clamp(uMix * 1.7 - delay, 0.0, 1.0);
  float e = ease(t);
  float fly = sin(3.14159265 * e);
  float flip = cos(3.14159265 * e);
  vec2 size = uCard.zw;

  // the shard turns over about its own vertical axis, and tilts a little as it flies
  vec2 rel = (aUV - aShard) * size;
  rel.x *= max(abs(flip), 0.035);
  float ang = fly * (aR.y - 0.5) * 1.1;
  float c = cos(ang), s = sin(ang);
  rel = vec2(rel.x * c - rel.y * s, rel.x * s + rel.y * c);

  // it drifts out from the middle of the card and lifts; shards on the left are held back
  vec2 cc = uCard.xy + 0.5 * size;
  vec2 sc = uCard.xy + aShard * size;
  vec2 dir = sc - cc;
  float dl = length(dir);
  dir = dl > 0.001 ? dir / dl : vec2(0.0, -1.0);
  if (dir.x < 0.0) dir.x *= uLeft;
  sc += dir * fly * (26.0 + aR.z * 74.0) * uK;
  sc.y -= fly * (12.0 + aR.w * 40.0) * uK;

  // in flight the shard comes apart into grains: each drifts off on its own line, carried a
  // little up and to the right as if by a breeze, then finds its place again
  float loose = pow(fly, 1.4);
  vec2 grain = (aJ - 0.5) * uCell * 20.0 * loose;
  float turn = (aJ.x - 0.5) * 6.2831 * loose;
  grain = vec2(grain.x * cos(turn) - grain.y * sin(turn), grain.x * sin(turn) + grain.y * cos(turn));
  vec2 wind = vec2(0.75, -0.28) * loose * (16.0 + aJ.y * 60.0) * uK;
  vec2 p = sc + rel + grain + wind;
  float z = fly * (0.18 + 0.42 * aR.w);
  p = cc + (p - cc) * (1.0 + z * 0.22);

  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, -z * 0.5, 1.0);
  // square while it is part of the picture, a small round grain once it is loose
  gl_PointSize = (uCell + 0.8) * (1.0 + z * 0.5) * mix(1.0, 0.62 + aJ.x * 0.3, smoothstep(0.0, 0.6, fly));
  vRound = smoothstep(0.05, 0.4, fly);
  vCol = e < 0.5 ? aCA : aCB;
  vShade = (0.72 + 0.28 * abs(flip) + fly * 0.06) * (1.0 + (aJ.y - 0.5) * 0.22 * fly);
}
`

const frag = `
precision mediump float;
varying vec3 vCol;
varying float vShade;
varying float vRound;
void main() {
  vec2 c = abs(gl_PointCoord - 0.5) * 2.0;
  if (mix(max(c.x, c.y), length(c), vRound) > 1.0) discard;
  gl_FragColor = vec4(vCol * vShade, 1.0);
}
`

function mulberry(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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

/**
 * Builds the morph on a canvas. Returns null without WebGL.
 *   setPair(a, b)   colour arrays (from `sample`) for the two pictures
 *   layout(rect)    the card's rectangle in canvas CSS pixels
 *   draw(mix)       0 = picture A whole, 1 = picture B whole
 */
export function createShards(canvas, { cols, rows, shard = 12, seed = 7 }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, depth: true, powerPreference: 'high-performance' })
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

  // the grid, and the Voronoi shards it is cut into
  const N = cols * rows
  const r = mulberry(seed)
  const sx = Math.max(2, Math.round(cols / shard))
  const sy = Math.max(2, Math.round(rows / shard))
  const seeds = []
  for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) seeds.push([(i + 0.15 + r() * 0.7) / sx, (j + 0.15 + r() * 0.7) / sy])
  const owner = new Int32Array(N)
  const uv = new Float32Array(N * 2)
  const sum = new Float32Array(seeds.length * 3)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const u = (x + 0.5) / cols
      const v = (y + 0.5) / rows
      uv[i * 2] = u
      uv[i * 2 + 1] = v
      // only the neighbouring seeds can be nearest, so search the 3 × 3 block around the cell
      const gx = Math.min(sx - 1, Math.floor(u * sx))
      const gy = Math.min(sy - 1, Math.floor(v * sy))
      let best = 0
      let bd = Infinity
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = gx + ox
        const cy = gy + oy
        if (cx < 0 || cy < 0 || cx >= sx || cy >= sy) continue
        const k = cy * sx + cx
        const dx = (u - seeds[k][0]) * (cols / rows)
        const dy = v - seeds[k][1]
        const d = dx * dx + dy * dy
        if (d < bd) { bd = d; best = k }
      }
      owner[i] = best
      sum[best * 3] += u
      sum[best * 3 + 1] += v
      sum[best * 3 + 2] += 1
    }
  }
  const shardRand = seeds.map(() => [r(), r(), r(), r()])
  const shardAt = new Float32Array(N * 2)
  const rand = new Float32Array(N * 4)
  const jit = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    const k = owner[i]
    const n = sum[k * 3 + 2] || 1
    shardAt[i * 2] = sum[k * 3] / n
    shardAt[i * 2 + 1] = sum[k * 3 + 1] / n
    rand.set(shardRand[k], i * 4)
    jit[i * 2] = r()
    jit[i * 2 + 1] = r()
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
  attr('aUV', uv, 2)
  attr('aShard', shardAt, 2)
  attr('aR', rand, 4)
  attr('aJ', jit, 2)
  const bufA = attr('aCA', new Float32Array(N * 3), 3, gl.DYNAMIC_DRAW)
  const bufB = attr('aCB', new Float32Array(N * 3), 3, gl.DYNAMIC_DRAW)
  const U = Object.fromEntries(['uRes', 'uCard', 'uMix', 'uCell', 'uK', 'uLeft'].map((k) => [k, gl.getUniformLocation(prog, k)]))
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clearColor(0, 0, 0, 0)

  let dpr = 1
  return {
    setPair(a, b) {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufA)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, a)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufB)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, b)
    },
    layout(rect, { left = 1, ratio = window.devicePixelRatio || 1 } = {}) {
      dpr = Math.min(ratio, 2)
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
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, N)
    },
    destroy() {
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
