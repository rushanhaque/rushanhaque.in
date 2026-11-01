import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { low } from '../lib/device'

// The showcase window from the previous portfolio, drawn on one WebGL canvas. A change of site
// runs a liquid wipe: a noise-edged front rises through the page (or falls, scrolling back)
// with a thin seam and a split of colour along it, while the old site sinks back and the new
// one settles from a zoom. Under the cursor the page bulges softly, like glass, and a lens
// ringed in brass shows the site's line drawing beneath it. It draws only while something
// moves. Without WebGL, or on an entry-level phone,
// the plain frames underneath carry on.
const VERT = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}'
const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D uFrom,uTo,uFromP;
uniform float uFromA,uToA,uA,uP,uDir,uT,uH;
uniform vec2 uM;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
vec2 cover(vec2 uv,float a){if(a>uA){uv.x=(uv.x-.5)*(uA/a)+.5;}else{uv.y*=a/uA;}return uv;}
void main(){
  vec2 uv=v;
  vec2 d=uv-uM;d.x*=uA;
  float r=length(d);
  uv-=(uv-uM)*uH*smoothstep(.42,0.,r)*.14;
  float y=uDir>0.?1.-uv.y:uv.y;
  float n=fbm(vec2(uv.x*4.,y*2.4)+uT*.45)-.5;
  float edge=y-(uP*1.6-.3)+n*.34;
  float m=smoothstep(.035,-.035,edge);
  float seam=exp(-pow(edge/.055,2.))*step(.001,uP)*step(uP,.999);
  vec2 push=vec2(0.,seam*.05*(uDir>0.?-1.:1.));
  vec2 fuv=cover((uv-.5)/(1.+.07*uP)+.5+push,uFromA);
  float lens=uH*(1.-uP);
  vec3 from=mix(texture2D(uFrom,fuv).rgb,texture2D(uFromP,fuv).rgb,lens*smoothstep(.235,.215,r));
  from+=vec3(.69,.54,.31)*lens*exp(-pow((r-.225)/.0045,2.))*.8;
  from*=1.-.4*uP;
  vec2 t=(uv-.5)/(1.+.14*(1.-uP))+.5-push*.5;
  float k=seam*.008;
  vec3 to=vec3(texture2D(uTo,cover(t+vec2(k,0.),uToA)).r,texture2D(uTo,cover(t,uToA)).g,texture2D(uTo,cover(t-vec2(k,0.),uToA)).b);
  vec3 col=mix(from,to,m)+vec3(.72,.58,.42)*seam*.3;
  gl_FragColor=vec4(col,1.);
}`

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** `items` carry `image` and, optionally, `plan` (the line drawing, shown under the cursor); `active` is the site shown. */
export default function LiquidWindow({ items, active }) {
  const canvas = useRef(null)
  const go = useRef(() => {})
  const want = useRef(active)
  const sources = items.map((w) => `${w.image}>${w.plan || ''}`).join('|')

  useEffect(() => { want.current = active; go.current(active) }, [active])

  useEffect(() => {
    const el = canvas.current
    const win = el?.closest('.sc__window')
    // nothing to draw where the window is not shown (touch screens show each site in the list)
    if (!el || !win || low() || !win.offsetParent) return
    const pairs = sources.split('|').map((p) => p.split('>'))
    let gl = null
    let running = false
    let dead = false
    const tex = pairs.map(() => null)
    const aspect = pairs.map(() => 1)
    // a site without a drawing shows its own picture under the lens
    const ptex = pairs.map(() => null)
    const s = { cur: want.current, to: -1, p: 0, dir: 1, start: 0, t: 0, h: 0, ht: 0, m: [0.5, 0.5], mt: [0.5, 0.5] }
    let u = {}

    const draw = () => {
      if (!gl || !tex[s.cur]) return
      const next = s.to >= 0 ? s.to : s.cur
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[s.cur])
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[next])
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, ptex[s.cur] ?? tex[s.cur])
      gl.uniform1f(u.uFromA, aspect[s.cur]); gl.uniform1f(u.uToA, aspect[next])
      gl.uniform1f(u.uA, el.width / el.height); gl.uniform1f(u.uP, s.p); gl.uniform1f(u.uDir, s.dir)
      gl.uniform1f(u.uT, s.t); gl.uniform1f(u.uH, s.h); gl.uniform2f(u.uM, s.m[0], s.m[1])
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    const tick = () => {
      const now = performance.now()
      let busy = false
      if (s.to >= 0) {
        const x = Math.min(1, (now - s.start) / 1350)
        s.p = ease(x); s.t += 0.016; busy = true
        if (x >= 1) { s.cur = s.to; s.to = -1; s.p = 0 }
      }
      s.h += (s.ht - s.h) * 0.09; s.m[0] += (s.mt[0] - s.m[0]) * 0.14; s.m[1] += (s.mt[1] - s.m[1]) * 0.14
      if (Math.abs(s.ht - s.h) > 0.002 || Math.hypot(s.mt[0] - s.m[0], s.mt[1] - s.m[1]) > 0.0015) busy = true
      draw()
      if (!busy) { gsap.ticker.remove(tick); running = false }
    }
    const wake = () => { if (!running && !dead) { running = true; gsap.ticker.add(tick) } }
    go.current = (i) => {
      if (!gl || (i === s.cur && s.to < 0)) return
      if (!tex[i]) return
      if (s.to >= 0) s.cur = s.to
      if (i === s.cur) { s.to = -1; s.p = 0; wake(); return }
      s.dir = i > s.cur ? 1 : -1; s.to = i; s.start = performance.now(); s.p = 0
      wake()
    }

    const size = () => {
      const r = el.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      el.width = Math.max(1, Math.round(r.width * dpr)); el.height = Math.max(1, Math.round(r.height * dpr))
      gl?.viewport(0, 0, el.width, el.height)
      draw()
    }
    const init = () => {
      gl = el.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false })
      if (!gl) return
      const shader = (type, src) => { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); return sh }
      const prog = gl.createProgram()
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return }
      gl.useProgram(prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'p')
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      u = Object.fromEntries(['uFrom', 'uTo', 'uFromP', 'uFromA', 'uToA', 'uA', 'uP', 'uDir', 'uT', 'uH', 'uM'].map((k) => [k, gl.getUniformLocation(prog, k)]))
      gl.uniform1i(u.uFrom, 0); gl.uniform1i(u.uTo, 1); gl.uniform1i(u.uFromP, 2)
      size()
      // the current site first, then the rest in the background
      const order = [s.cur, ...pairs.map((_, i) => i).filter((i) => i !== s.cur)]
      const load = (src, done) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = src
        img.decode().then(() => {
          if (dead || !gl) return
          const t = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, t)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
          done(t, img)
        }).catch(() => {})
      }
      order.forEach((i) => load(pairs[i][0], (t, img) => {
        tex[i] = t
        aspect[i] = img.naturalWidth / img.naturalHeight
        if (i === s.cur) { draw(); win.classList.add('is-gl') }
        if (i === want.current && i !== s.cur) go.current(i)
      }))
      // the drawings are only seen under the cursor, so they load after the pictures
      order.forEach((i) => pairs[i][1] && load(pairs[i][1], (t) => { ptex[i] = t }))
    }

    // start only as the section comes near, so the first load of the page is untouched
    const near = ScrollTrigger.create({ trigger: el, start: 'top 200%', once: true, onEnter: init })
    const ro = new ResizeObserver(size)
    ro.observe(el)
    const move = (e) => { const r = el.getBoundingClientRect(); s.mt = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; s.ht = 1; wake() }
    const leave = () => { s.ht = 0; wake() }
    const lost = (e) => { e.preventDefault(); win.classList.remove('is-gl'); gl = null }
    win.addEventListener('pointermove', move)
    win.addEventListener('pointerleave', leave)
    el.addEventListener('webglcontextlost', lost)
    return () => {
      dead = true
      gsap.ticker.remove(tick)
      near.kill(); ro.disconnect()
      win.removeEventListener('pointermove', move); win.removeEventListener('pointerleave', leave); el.removeEventListener('webglcontextlost', lost)
      win.classList.remove('is-gl')
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
      go.current = () => {}
    }
  }, [sources])

  return <canvas ref={canvas} className="sc__gl" aria-hidden="true" />
}
