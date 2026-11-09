// What this device can carry. Decided once, in the browser, before anything heavy loads.
//   high  every scene at full detail
//   mid   every scene with fewer pixels and samples (phones, tablets, modest laptops)
//   low   no canvas: the same rooms on a still wall (very old devices, data saver)
// A visitor asking for reduced motion gets the plain, unpinned layout whatever the device.
const SERVER = { tier: 'low', gl: false, touch: false, reduced: false, phone: false }
let cached = null

export function device() {
  if (typeof window === 'undefined') return SERVER
  if (cached) return cached
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches
  const phone = Math.min(innerWidth, screen.width || innerWidth) < 760
  const memory = navigator.deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const save = navigator.connection?.saveData || /(^|-)2g/.test(navigator.connection?.effectiveType ?? '')
  const hasGL = !!window.WebGL2RenderingContext
  const query = new URLSearchParams(location.search)
  let tier = 'high'
  if (!hasGL || save || memory <= 2 || cores <= 2) tier = 'low'
  else if (touch || memory <= 4 || cores <= 4) tier = 'mid'
  if (query.get('tier')) tier = query.get('tier')
  cached = { tier, gl: tier !== 'low' && !reduced, touch, reduced, phone }
  return cached
}
