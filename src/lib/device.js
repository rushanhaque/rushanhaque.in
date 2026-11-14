// What this device can carry. The tier is decided once by the inline script in index.html, before anything paints:
//   high  every flourish (smooth wheel scrolling, pointer light, scroll-tied motion)
//   mid   phones, tablets and modest laptops: the same site, a little less moving at once
//   low   very old devices or data saver: everything readable and responsive, the costly flourishes off
// A visitor asking for reduced motion gets the still version whatever the device.
const SERVER = { tier: 'low', touch: false, fine: false, reduced: false, phone: false }
let cached = null

export function device() {
  if (typeof window === 'undefined') return SERVER
  if (cached) return cached
  const mq = (q) => matchMedia(q).matches
  cached = {
    tier: document.documentElement.dataset.tier || 'high',
    reduced: mq('(prefers-reduced-motion: reduce)'),
    touch: mq('(hover: none), (pointer: coarse)'),
    fine: mq('(hover: hover) and (pointer: fine)'),
    phone: Math.min(innerWidth, screen.width || innerWidth) < 760,
  }
  return cached
}

export const isServer = typeof window === 'undefined'
