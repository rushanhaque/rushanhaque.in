// How much the device can carry, decided once. 'low' is an entry-level phone, Data Saver or a
// slow connection: the WebGL scenes give way to their plain fallbacks and scrolling stays
// native. 'mid' keeps every scene but draws it with fewer pixels and particles.
let cached = null

export function tier() {
  if (cached) return cached
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  const net = navigator.connection || {}
  const slow = !!net.saveData || /(^|-)2g|3g/.test(net.effectiveType || '') || window.matchMedia?.('(prefers-reduced-data: reduce)').matches
  cached = slow || cores <= 2 || memory <= 2 ? 'low' : cores <= 4 || memory <= 4 ? 'mid' : 'high'
  document.documentElement.dataset.tier = cached
  return cached
}

export const low = () => tier() === 'low'
