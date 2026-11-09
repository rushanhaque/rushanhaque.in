// Shared shader code. The jali lives here: every patch of sun on every wall is this one function.
export const NOISE = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), f.x), mix(hash21(i + vec2(0., 1.)), hash21(i + vec2(1., 1.)), f.x), f.y);
}
`

export const JALI = /* glsl */ `
// the eight-pointed star: two squares, one turned 45 degrees (negative inside)
float star8(vec2 p, float r){
  vec2 q = abs(p);
  float a = max(q.x, q.y) - r;
  vec2 t = abs(vec2(p.x - p.y, p.x + p.y) * .70710678);
  float b = max(t.x, t.y) - r;
  return min(a, b);
}
// one square of lattice: a star in the middle, a small diamond on each corner.
// Returns the distance to the nearest opening (negative where light passes).
float jaliSD(vec2 uv, float r){
  vec2 g = fract(uv) - .5;
  float s = star8(g, r);
  vec2 c = fract(uv + .5) - .5;
  float d = (abs(c.x) + abs(c.y)) * .70710678 - r * .19;
  return min(s, d);
}
float jali(vec2 uv, float r, float soft){ return smoothstep(soft, -soft, jaliSD(uv, r)); }
`
