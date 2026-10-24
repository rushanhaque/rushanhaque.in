'use client';
import { useEffect, useRef } from 'react';

// The Selected Work window, drawn on one WebGL canvas. A change of site runs a liquid
// wipe: a noise-edged front rises through the page (or falls, scrolling back) with a
// thin brass seam and a split of colour along it, while the old site sinks back and the
// new one settles from a zoom. Under the cursor the page bulges softly, like glass.
// Each site arrives as its line drawing (scripts/plan-variants.mjs), and once the wipe
// has passed, a brass scan builds the drawing into the site. It renders only while
// something moves. Without WebGL, or on a phone, the plain frames underneath carry on.
const VERT = `attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D uFrom,uTo,uFromP;
uniform float uFromA,uToA,uA,uP,uDir,uT,uH,uS;
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
  float on=step(.001,uS)*step(uS,.999);
  float built=1.-smoothstep(uS-.0015,uS+.0015,uv.x);
  vec3 from=mix(texture2D(uFromP,fuv).rgb,texture2D(uFrom,fuv).rgb,built);
  from+=vec3(.76,.61,.36)*(exp(-pow((uv.x-uS)/.0028,2.))*.9+exp(-pow((uv.x-uS)/.035,2.))*.16)*on;
  from*=1.-.4*uP;
  vec2 t=(uv-.5)/(1.+.14*(1.-uP))+.5-push*.5;
  float k=seam*.008;
  vec3 to=vec3(texture2D(uTo,cover(t+vec2(k,0.),uToA)).r,texture2D(uTo,cover(t,uToA)).g,texture2D(uTo,cover(t-vec2(k,0.),uToA)).b);
  vec3 col=mix(from,to,m)+vec3(.96,.8,.5)*seam*.3;
  col+=vec3(1.)*uH*smoothstep(.42,.36,r)*smoothstep(.3,.38,r)*.05;
  gl_FragColor=vec4(col,1.);
}`;

// `sources` is the image paths joined by '|', so the canvas is rebuilt only when they change.
export function LiquidWindow({ sources, plans, active }: { sources: string; plans: string; active: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const go = useRef<(i: number) => void>(() => {});
  const want = useRef(active);

  useEffect(() => { want.current = active; go.current(active); }, [active]);

  useEffect(() => {
    const el = canvas.current;
    const win = el?.closest<HTMLElement>('.tl-sw-window');
    if (!el || !win || !window.matchMedia('(min-width: 1024px)').matches) return;
    const images = sources.split('|'), drawings = plans.split('|');
    let gl: WebGLRenderingContext | null = null, raf = 0, dead = false;
    const tex: (WebGLTexture | null)[] = images.map(() => null), aspect = images.map(() => 1);
    // A site without a drawing uses its own picture for one, so it simply arrives built.
    const ptex: (WebGLTexture | null)[] = images.map(() => null);
    // sc: how far the current site is built (0 = drawing); scan: when its scan starts, or -1.
    const s = { cur: want.current, to: -1, p: 0, dir: 1, start: 0, t: 0, h: 0, ht: 0, m: [.5, .5], mt: [.5, .5], sc: 0, scan: -1, seen: false };
    let u: Record<string, WebGLUniformLocation | null> = {};

    const draw = () => {
      if (!gl || !tex[s.cur]) return;
      const next = s.to >= 0 ? s.to : s.cur;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[s.cur]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, ptex[next] ?? tex[next]);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, ptex[s.cur] ?? tex[s.cur]);
      gl.uniform1f(u.uS, ptex[s.cur] ? s.sc : 1);
      gl.uniform1f(u.uFromA, aspect[s.cur]); gl.uniform1f(u.uToA, aspect[s.to >= 0 ? s.to : s.cur]);
      gl.uniform1f(u.uA, el.width / el.height); gl.uniform1f(u.uP, s.p); gl.uniform1f(u.uDir, s.dir);
      gl.uniform1f(u.uT, s.t); gl.uniform1f(u.uH, s.h); gl.uniform2f(u.uM, s.m[0], s.m[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const ease = (x: number) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const tick = (now: number) => {
      raf = 0;
      let busy = false;
      if (s.to >= 0) {
        const x = Math.min(1, (now - s.start) / 1350);
        s.p = ease(x); s.t += .016; busy = true;
        if (x >= 1) { s.cur = s.to; s.to = -1; s.p = 0; s.sc = 0; s.scan = now + 120; }
      }
      if (s.scan >= 0) {
        const x = Math.min(1, Math.max(0, (now - s.scan) / 1700));
        s.sc = ease(x); busy = true;
        if (x >= 1) s.scan = -1;
      }
      s.h += (s.ht - s.h) * .09; s.m[0] += (s.mt[0] - s.m[0]) * .14; s.m[1] += (s.mt[1] - s.m[1]) * .14;
      if (Math.abs(s.ht - s.h) > .002 || Math.hypot(s.mt[0] - s.m[0], s.mt[1] - s.m[1]) > .0015) busy = true;
      draw();
      if (busy) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf && !dead) raf = requestAnimationFrame(tick); };
    go.current = (i: number) => {
      if (!gl || i === s.cur && s.to < 0) return;
      if (!tex[i]) return;
      if (s.to >= 0) { s.cur = s.to; s.sc = 0; }
      if (i === s.cur) { s.to = -1; s.p = 0; s.scan = performance.now(); wake(); return; }
      s.scan = -1;
      s.dir = i > s.cur ? 1 : -1; s.to = i; s.start = performance.now(); s.p = 0;
      wake();
    };

    const init = () => {
      gl = el.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
      if (!gl) return;
      const shader = (type: number, src: string) => { const sh = gl!.createShader(type)!; gl!.shaderSource(sh, src); gl!.compileShader(sh); return sh; };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      u = Object.fromEntries(['uFrom', 'uTo', 'uFromP', 'uFromA', 'uToA', 'uA', 'uP', 'uDir', 'uT', 'uH', 'uM', 'uS'].map(n => [n, gl!.getUniformLocation(prog, n)]));
      gl.uniform1i(u.uFrom, 0); gl.uniform1i(u.uTo, 1); gl.uniform1i(u.uFromP, 2);
      size();
      // The current site first, then the rest in the background.
      const order = [s.cur, ...images.map((_, i) => i).filter(i => i !== s.cur)];
      const load = (src: string, done: (t: WebGLTexture, img: HTMLImageElement) => void) => {
        const img = new Image();
        img.decoding = 'async'; img.src = src;
        img.decode().then(() => {
          if (dead || !gl) return;
          const t = gl.createTexture()!;
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
          done(t, img);
        }).catch(() => {});
      };
      order.forEach(i => {
        // The drawing comes first, so the first site can open on it.
        if (drawings[i]) load(drawings[i], t => { ptex[i] = t; if (i === s.cur) draw(); });
        load(images[i], (t, img) => {
          tex[i] = t; aspect[i] = img.naturalWidth / img.naturalHeight;
          if (i === s.cur) { draw(); win.classList.add('is-gl'); }
          if (i === want.current && i !== s.cur) go.current(i);
        });
      });
    };
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      el.width = Math.max(1, Math.round(r.width * dpr)); el.height = Math.max(1, Math.round(r.height * dpr));
      gl?.viewport(0, 0, el.width, el.height);
      draw();
    };

    // Start only as the section comes near, so the homepage's first load is untouched.
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); init(); } }, { rootMargin: '100% 0px' });
    near.observe(el);
    // The first site opens as a drawing and builds once the window is properly in view.
    const intro = new IntersectionObserver(([e]) => { if (!e.isIntersecting || s.seen) return; s.seen = true; intro.disconnect(); if (s.to < 0 && s.scan < 0 && s.sc < 1) { s.scan = performance.now() + 900; wake(); } }, { threshold: .55 });
    intro.observe(el);
    const ro = new ResizeObserver(() => size());
    ro.observe(el);
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); s.mt = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; s.ht = 1; wake(); };
    const leave = () => { s.ht = 0; wake(); };
    const lost = (e: Event) => { e.preventDefault(); win.classList.remove('is-gl'); gl = null; };
    win.addEventListener('pointermove', move); win.addEventListener('pointerleave', leave);
    el.addEventListener('webglcontextlost', lost);
    return () => {
      dead = true; cancelAnimationFrame(raf); near.disconnect(); intro.disconnect(); ro.disconnect();
      win.removeEventListener('pointermove', move); win.removeEventListener('pointerleave', leave); el.removeEventListener('webglcontextlost', lost);
      win.classList.remove('is-gl');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      go.current = () => {};
    };
  }, [sources, plans]);

  return <canvas ref={canvas} className="tl-sw-gl" aria-hidden="true"/>;
}
