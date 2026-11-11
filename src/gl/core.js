// A very small WebGL2 layer: programs, render targets, textures. Everything this site draws is a
// fragment shader, some instanced quads or some lines, so a full 3D library would be 150 kB of code
// nobody runs. This file is all of it.

export const FULLSCREEN = /* glsl */ `#version 300 es
precision highp float;
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2. - 1., 0., 1.);
}`

export function createContext(canvas) {
  return canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    // kept, so that a frame the engine chooses not to redraw cannot be dropped and leave the canvas blank
    preserveDrawingBuffer: true,
    // software rendering is never worth it: the page looks right without a canvas at all
    failIfMajorPerformanceCaveat: true,
  })
}

// Compiles in the background where the browser can, so shaders never block scrolling.
export class Program {
  constructor(gl, vs, fs) {
    this.gl = gl
    this.parallel = gl.getExtension('KHR_parallel_shader_compile')
    const p = gl.createProgram()
    const add = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      gl.attachShader(p, s)
      return s
    }
    this.vs = add(gl.VERTEX_SHADER, vs)
    this.fs = add(gl.FRAGMENT_SHADER, fs)
    gl.linkProgram(p)
    this.p = p
    this.linked = false
    this.failed = false
    this.uniforms = []
  }

  get ready() {
    if (this.linked) return true
    if (this.failed) return false
    const gl = this.gl
    if (this.parallel && !gl.getProgramParameter(this.p, this.parallel.COMPLETION_STATUS_KHR)) return false
    if (!gl.getProgramParameter(this.p, gl.LINK_STATUS)) {
      this.failed = true
      console.error('Shader failed:', gl.getProgramInfoLog(this.p), gl.getShaderInfoLog(this.fs), gl.getShaderInfoLog(this.vs))
      return false
    }
    const n = gl.getProgramParameter(this.p, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) {
      const a = gl.getActiveUniform(this.p, i)
      this.uniforms.push({ name: a.name, type: a.type, loc: gl.getUniformLocation(this.p, a.name) })
    }
    this.linked = true
    return true
  }

  use(values) {
    const gl = this.gl
    gl.useProgram(this.p)
    let unit = 0
    for (const u of this.uniforms) {
      const v = values[u.name]
      if (v === undefined) continue
      switch (u.type) {
        case gl.FLOAT: gl.uniform1f(u.loc, v); break
        case gl.INT: gl.uniform1i(u.loc, v); break
        case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break
        case gl.FLOAT_VEC3: gl.uniform3fv(u.loc, v); break
        case gl.FLOAT_VEC4: gl.uniform4fv(u.loc, v); break
        case gl.FLOAT_MAT3: gl.uniformMatrix3fv(u.loc, false, v); break
        case gl.FLOAT_MAT4: gl.uniformMatrix4fv(u.loc, false, v); break
        case gl.SAMPLER_2D:
          gl.activeTexture(gl.TEXTURE0 + unit)
          gl.bindTexture(gl.TEXTURE_2D, v)
          gl.uniform1i(u.loc, unit)
          unit++
          break
        default: break
      }
    }
  }

  attrib(name) { return this.gl.getAttribLocation(this.p, name) }

  dispose() {
    const gl = this.gl
    gl.deleteShader(this.vs)
    gl.deleteShader(this.fs)
    gl.deleteProgram(this.p)
  }
}

// A colour target, half-float where the GPU allows it, so a soft gradient of light never bands.
export function createTarget(gl, w, h, hdr) {
  const tex = gl.createTexture()
  const fb = gl.createFramebuffer()
  const t = { tex, fb, w: 0, h: 0 }
  const internal = hdr ? gl.RGBA16F : gl.RGBA8
  const type = hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE
  t.resize = (W, H) => {
    if (W === t.w && H === t.h) return
    t.w = W
    t.h = H
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, W, H, 0, gl.RGBA, type, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  }
  t.resize(w, h)
  t.dispose = () => { gl.deleteTexture(tex); gl.deleteFramebuffer(fb) }
  return t
}

// one channel of distances, filterable
export function createFieldTexture(gl, w, h, data) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.FLOAT, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

export function createImageTexture(gl, source) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, source)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  return tex
}

export function createPixel(gl, r, g, b) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  return tex
}

// the two bits of matrix maths the instanced dome needs
export function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

export function lookAt(eye, target, out = new Float32Array(16)) {
  let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2]
  let l = Math.hypot(zx, zy, zz) || 1
  zx /= l; zy /= l; zz /= l
  // up is (0, 1, 0)
  let xx = zz, xy = 0, xz = -zx
  l = Math.hypot(xx, xz) || 1
  xx /= l; xz /= l
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx
  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2])
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2])
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2])
  out[15] = 1
  return out
}
