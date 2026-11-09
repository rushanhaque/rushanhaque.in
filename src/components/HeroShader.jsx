import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { device } from '../lib/device'

const VERT = 'attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }'

// From the previous portfolio: wine and lacquer moving like liquid silk, a brass horizon, and a lens that follows the
// cursor. Kept as it was, and finished: the silk catches the light where the liquid folds, brighter near the
// cursor; and a slow tide of light rises
// through it as you scroll, so the opening of the ring feels like a sunrise inside the liquid.
const FRAG = `
precision mediump float;
uniform float uTime, uHover, uIntro, uScroll;
uniform vec2 uRes, uMouse;
uniform vec3 uA, uB, uC;
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
vec3 lin(vec3 c) { return c * c; }
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

  vec3 A = uA, B = uB, C = uC;
  vec3 col = mix(A, B, clamp(f * f * 2.4, 0.0, 1.0));
  col = mix(col, C, clamp(pow(length(r), 3.0) * 0.55, 0.0, 1.0) * 0.3);

  // silk: where the liquid folds over on itself it catches the light, more so near the cursor
  float silk = pow(1.0 - abs(sin(f * 9.0 + r.x * 4.0)), 18.0);
  col += C * silk * 0.16 * (0.35 + f) * (1.0 + lens * 1.5);

  // the brass horizon, breathing slowly, and the tide of light that rises through it as the page moves
  float hy = p.y + 0.36 - uScroll * 0.5 + (f - 0.5) * 0.22;
  float horizon = exp(-abs(hy) * 14.0) * 0.7 + exp(-abs(hy) * 3.2) * 0.1;
  col += C * horizon * (0.55 + 0.45 * sin(uTime * 0.4)) * (1.0 + uScroll * 1.2);

  col += vec3(1.0) * lens * 0.02;
  col *= smoothstep(1.55, 0.25, length(p * vec2(0.75, 1.0)));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col * uIntro, 1.0);
}`

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] }

// One fragment shader on one triangle, at a fraction of the pixels (the liquid is soft), drawn only while it is on
// screen and while the first screen is in view. Without WebGL, or on a modest device, the CSS gradient shows.
export default function HeroShader({ intro, progress, colors = ['#0c0607', '#3a1f27', '#d9b97e'] }) {
  const wrap = useRef(null)
  const api = useRef(null)

  useEffect(() => {
    const d = device()
    const el = wrap.current
    if (d.reduced || d.tier === 'low') return undefined
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true })
    if (!gl) return undefined
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return undefined
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return undefined
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = Object.fromEntries(['uTime', 'uRes', 'uMouse', 'uHover', 'uIntro', 'uScroll', 'uA', 'uB', 'uC'].map((k) => [k, gl.getUniformLocation(prog, k)]))
    colors.forEach((c, i) => gl.uniform3fv(u[['uA', 'uB', 'uC'][i]], rgb(c)))
    el.appendChild(canvas)

    const scale = (innerWidth < 900 ? 0.5 : 0.62) * (d.tier === 'mid' ? 0.8 : 1) * Math.min(devicePixelRatio || 1, 1.5)
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
    const aim = { x: 0.5, y: 0.42, h: 0 }
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      aim.x = (e.clientX - r.left) / r.width
      aim.y = 1 - (e.clientY - r.top) / r.height
      aim.h = 1
    }
    const out = () => { aim.h = 0 }
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseleave', out)

    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    let last = 0
    const tick = (time) => {
      const p = progress.current || 0
      if (!visible || document.hidden || p > 0.8) return
      // the liquid moves slowly: a phone draws it at half the rate and nobody can tell
      if (d.touch && time - last < 1 / 31) return
      last = time
      s.mx += (aim.x - s.mx) * 0.06
      s.my += (aim.y - s.my) * 0.06
      s.h += (aim.h - s.h) * 0.04
      gl.uniform1f(u.uTime, time)
      gl.uniform2f(u.uMouse, s.mx, s.my)
      gl.uniform1f(u.uHover, s.h)
      gl.uniform1f(u.uIntro, s.intro)
      gl.uniform1f(u.uScroll, p)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gsap.ticker.add(tick)
    const lost = () => { gsap.ticker.remove(tick); canvas.remove(); api.current = null }
    canvas.addEventListener('webglcontextlost', lost)
    api.current = { s }
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      gsap.ticker.remove(tick)
      removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', out)
      ro.disconnect()
      io.disconnect()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const a = api.current
    if (!intro || !a) return
    gsap.to(a.s, { intro: 1, duration: 2.4, ease: 'power2.out' })
  }, [intro])

  return <div className="thr__gl" ref={wrap} aria-hidden="true" />
}
