/* GradientWaves — vanilla WebGL2, no dependencies */
(function () {
  'use strict';

  const VS = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const FS = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c) * dir;

  if (uEnableMouse) {
    float yaw   = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col  = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}`;

  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!r) return [1, 1, 1];
    return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
  }

  function detailToSteps(detail) {
    if (detail === 'low') return 40.0;
    if (detail === 'high') return 110.0;
    return 70.0;
  }

  function compile(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
      console.error('Shader error:', gl.getShaderInfoLog(sh));
    return sh;
  }

  function createProgram(gl) {
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      console.error('Program error:', gl.getProgramInfoLog(prog));
    return prog;
  }

  function GradientWaves(container, opts) {
    opts = Object.assign({
      horizonColor: '#5227FF',
      waveColor: '#FF9FFC',
      crestColor: '#FFFFFF',
      speed: 0.4,
      amplitude: 2.5,
      waveScale: 0.6,
      waveRatio: 0.9,
      swell: 35,
      turbulence: 20,
      tilt: 1.11,
      zoom: 1.0,
      height: 5.5,
      fogDepth: 15,
      detail: 'medium',
      brightness: 1.0,
      opacity: 1.0,
      mouseInteraction: true,
      parallaxStrength: 0.5,
      grain: true,
      grainIntensity: 0.05
    }, opts);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    container.insertBefore(canvas, container.firstChild);

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { console.warn('WebGL2 not supported'); return; }

    gl.clearColor(0, 0, 0, 0);
    const prog = createProgram(gl);
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    ['iTime','iResolution','uSpeed','uAmplitude','uWaveScale','uWaveRatio','uSwell',
     'uTurbulence','uTilt','uZoom','uHeight','uFogDepth','uSteps','uBrightness',
     'uOpacity','uGrain','uGrainIntensity','uMouse','uParallax','uEnableMouse',
     'uHorizonColor','uWaveColor','uCrestColor'
    ].forEach(n => U[n] = gl.getUniformLocation(prog, n));

    // Set static-ish uniforms from opts
    function applyOpts() {
      const hc = hexToRgb(opts.horizonColor);
      const wc = hexToRgb(opts.waveColor);
      const cc = hexToRgb(opts.crestColor);
      gl.uniform1f(U.uSpeed,        opts.speed);
      gl.uniform1f(U.uAmplitude,    opts.amplitude);
      gl.uniform1f(U.uWaveScale,    opts.waveScale);
      gl.uniform1f(U.uWaveRatio,    opts.waveRatio);
      gl.uniform1f(U.uSwell,        opts.swell);
      gl.uniform1f(U.uTurbulence,   opts.turbulence);
      gl.uniform1f(U.uTilt,         opts.tilt);
      gl.uniform1f(U.uZoom,         opts.zoom);
      gl.uniform1f(U.uHeight,       opts.height);
      gl.uniform1f(U.uFogDepth,     opts.fogDepth);
      gl.uniform1f(U.uSteps,        detailToSteps(opts.detail));
      gl.uniform1f(U.uBrightness,   opts.brightness);
      gl.uniform1f(U.uOpacity,      opts.opacity);
      gl.uniform1f(U.uGrain,        opts.grain ? 1.0 : 0.0);
      gl.uniform1f(U.uGrainIntensity, opts.grainIntensity);
      gl.uniform1f(U.uParallax,     opts.parallaxStrength);
      gl.uniform1i(U.uEnableMouse,  opts.mouseInteraction ? 1 : 0);
      gl.uniform3f(U.uHorizonColor, hc[0], hc[1], hc[2]);
      gl.uniform3f(U.uWaveColor,    wc[0], wc[1], wc[2]);
      gl.uniform3f(U.uCrestColor,   cc[0], cc[1], cc[2]);
    }
    applyOpts();

    const mouse = [0.5, 0.5];
    const target = [0.5, 0.5];

    function onMove(e) {
      const rect = container.getBoundingClientRect();
      target[0] = (e.clientX - rect.left) / rect.width;
      target[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    }
    function onLeave() { target[0] = 0.5; target[1] = 0.5; }
    if (opts.mouseInteraction) {
      container.addEventListener('pointermove', onMove);
      container.addEventListener('pointerleave', onLeave);
    }

    /* A raymarcher is fill-rate bound: the cost of a frame is the number
       of fragments, and this canvas covers a whole section — 1280x3155
       already, before device pixel ratio. Capping DPR alone is not
       enough, because a tall section on a 4K display would still ask for
       nine megapixels every frame.
       So the budget is expressed in pixels, not in DPR: pick the largest
       ratio (never above 1.5, never below 0.75) that keeps the buffer
       under ~3.2 megapixels. At this blur radius the resolution loss is
       invisible; the frame-time saving is not. */
    const PIXEL_BUDGET = 3.2e6;
    function resize() {
      const cw = Math.max(1, container.offsetWidth);
      const ch = Math.max(1, container.offsetHeight);
      const wanted = Math.min(window.devicePixelRatio || 1, 1.5);
      const fit = Math.sqrt(PIXEL_BUDGET / (cw * ch));
      const dpr = Math.max(0.75, Math.min(wanted, fit));

      const w = Math.max(1, Math.floor(cw * dpr));
      const h = Math.max(1, Math.floor(ch * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.iResolution, w, h);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let raf = 0;
    const t0 = performance.now();

    function loop(now) {
      gl.uniform1f(U.iTime, (now - t0) * 0.001);
      mouse[0] += 0.05 * (target[0] - mouse[0]);
      mouse[1] += 0.05 * (target[1] - mouse[1]);
      gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    }

    let isVisible = true;
    let isPageVisible = !document.hidden;

    function tryStart() {
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    }
    function tryStop() {
      if (raf !== 0) { cancelAnimationFrame(raf); raf = 0; }
    }

    const io = new IntersectionObserver(([e]) => {
      isVisible = e.isIntersecting;
      isVisible ? tryStart() : tryStop();
    }, { threshold: 0 });
    io.observe(container);

    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    });

    tryStart();
  }

  // Init on the #works section.
  //
  // Gated deliberately. This is a raymarched wave field re-rendered every
  // frame across a full section; on a phone GPU that is the single most
  // expensive thing on the page, and it is pure decoration. So it only
  // runs where it is affordable and wanted:
  //   · a fine pointer on a wide viewport (i.e. an actual desktop)
  //   · motion not reduced
  //   · more than 4 logical cores, and no low device-memory signal
  // Everything else gets the clean paper ground, which is not a
  // degraded experience — just a quieter one.
  function affordable() {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
      if (!window.matchMedia('(min-width: 1200px)').matches) return false;
    }
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return false;
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;
    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!affordable()) return;
    const section = document.getElementById('works');
    if (!section) return;
    // Section needs position:relative for absolute canvas
    if (getComputedStyle(section).position === 'static') {
      section.style.position = 'relative';
    }
    GradientWaves(section, {
      horizonColor: '#b0b0b0',
      waveColor: '#e0e0e0',
      crestColor: '#FFFFFF',
      speed: 0.4,
      amplitude: 2.5,
      waveScale: 0.6,
      waveRatio: 0.9,
      swell: 35,
      turbulence: 20,
      tilt: 1.11,
      zoom: 1.0,
      height: 5.5,
      fogDepth: 15,
      detail: 'medium',
      brightness: 1.0,
      opacity: 1.0,
      mouseInteraction: true,
      parallaxStrength: 0.5,
      grain: true,
      grainIntensity: 0.05
    });
  });
})();
