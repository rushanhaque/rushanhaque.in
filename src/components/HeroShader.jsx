import { useEffect, useRef } from 'react'
import { gsap, isTouch, reduced } from '../lib/gsap'
import { low, tier } from '../lib/device'

const vert = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

// Domain-warped liquid in wine and lacquer, a brass horizon, and a lens that follows the cursor.
const frag = `
precision mediump float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHover;
uniform float uIntro;
uniform float uScroll;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  float d = length(p - m);
  float lens = smoothstep(0.42, 0.0, d) * uHover;
  p -= (p - m) * lens * 0.35;

  float t = uTime * 0.05;
  p *= 1.0 + uScroll * 0.6;
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.5 + 3.2 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 3.2 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.1 + 2.6 * r);

  vec3 col = mix(uA, uB, clamp(f * f * 2.4, 0.0, 1.0));
  col = mix(col, uC, clamp(pow(length(r), 3.0) * 0.55, 0.0, 1.0) * 0.3);

  float silk = pow(1.0 - abs(sin(f * 9.0 + r.x * 4.0)), 18.0);
  col += uC * silk * 0.18 * (0.4 + f);

  float hy = p.y + 0.36 + (f - 0.5) * 0.22;
  float horizon = exp(-abs(hy) * 14.0) * 0.75 + exp(-abs(hy) * 3.2) * 0.1;
  col += uC * horizon * (0.55 + 0.45 * sin(uTime * 0.4));

  col += uC * smoothstep(0.012, 0.0, abs(d - 0.42 * (0.6 + 0.4 * uHover))) * 0.1 * uHover;
  col += vec3(1.0) * lens * 0.035;

  col *= smoothstep(1.55, 0.25, length(p * vec2(0.75, 1.0)));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.04;
  col *= uIntro;
  gl_FragColor = vec4(col, 1.0);
}
`

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/**
 * The hero's background: one fragment shader on a full-screen triangle, drawn at reduced
 * resolution and only while it is on screen. Without WebGL the section's CSS gradient shows.
 */
export default function HeroShader({ intro = false, progress, colors = ['#0c0607', '#33191d', '#d9b97e'] }) {
  const wrap = useRef(null)
  const api = useRef(null)

  useEffect(() => {
    const el = wrap.current
    // an entry-level phone keeps the section's CSS gradient and spends nothing on WebGL
    if (low()) return
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false })
    if (!gl) return
    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = compile(gl.VERTEX_SHADER, vert)
    const fs = compile(gl.FRAGMENT_SHADER, frag)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = Object.fromEntries(['uTime', 'uRes', 'uMouse', 'uHover', 'uIntro', 'uScroll', 'uA', 'uB', 'uC'].map((k) => [k, gl.getUniformLocation(prog, k)]))
    colors.forEach((c, i) => gl.uniform3fv(u[['uA', 'uB', 'uC'][i]], rgb(c)))
    el.appendChild(canvas)

    // the noise is soft, so a fraction of the pixels is enough
    const scale = (window.innerWidth < 900 ? 0.5 : 0.62) * (tier() === 'mid' ? 0.75 : 1) * Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      canvas.width = Math.max(1, Math.round(el.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(el.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(u.uRes, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const s = { intro: 0, mx: 0.5, my: 0.42, h: 0 }
    const target = { x: 0.5, y: 0.42, h: 0 }
    const move = (e) => {
      const r = el.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width
      target.y = 1 - (e.clientY - r.top) / r.height
      target.h = 1
    }
    const out = () => (target.h = 0)
    if (!isTouch()) {
      window.addEventListener('pointermove', move, { passive: true })
      document.addEventListener('mouseleave', out)
    }

    const draw = (time) => {
      s.mx += (target.x - s.mx) * 0.06
      s.my += (target.y - s.my) * 0.06
      s.h += (target.h - s.h) * 0.04
      gl.uniform1f(u.uTime, time)
      gl.uniform2f(u.uMouse, s.mx, s.my)
      gl.uniform1f(u.uHover, s.h)
      gl.uniform1f(u.uIntro, s.intro)
      gl.uniform1f(u.uScroll, progress?.current || 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const still = reduced()
    const tick = (time) => { if (visible && !document.hidden) draw(time) }
    if (!still) gsap.ticker.add(tick)
    api.current = { s, draw, still }

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', out)
      ro.disconnect()
      io.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
      api.current = null
    }
  }, [])

  useEffect(() => {
    const a = api.current
    if (!intro || !a) return
    if (a.still) { a.s.intro = 1; a.draw(12) }
    else gsap.to(a.s, { intro: 1, duration: 2.4, ease: 'power2.out' })
  }, [intro])

  return <div className="hero__gl" ref={wrap} aria-hidden="true" />
}
