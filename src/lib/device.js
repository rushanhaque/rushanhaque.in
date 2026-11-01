// How much the device can carry, decided once. 'low' is an entry-level phone, Data Saver or a
// 2G connection: the WebGL scenes give way to their plain fallbacks and scrolling stays
// native. 'mid' keeps every scene but draws it with fewer pixels.
let cached = null

export function tier() {
  if (cached) return cached
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  const net = navigator.connection || {}
  // Chrome's effectiveType is a guess from recent timings and reads "3g" on good connections,
  // so only a stated wish to save data, or a truly 2G link, counts as slow
  const slow = !!net.saveData || /(^|-)2g$/.test(net.effectiveType || '') || window.matchMedia?.('(prefers-reduced-data: reduce)').matches
  cached = slow || cores <= 2 || memory <= 2 ? 'low' : cores <= 4 || memory <= 4 ? 'mid' : 'high'
  document.documentElement.dataset.tier = cached
  return cached
}

export const low = () => tier() === 'low'
