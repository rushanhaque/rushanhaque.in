import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduced, isTouch } from './gsap'
import { low } from './device'

let lenis = null

export function initLenis() {
  // Phones and tablets keep the browser's own scrolling, the smoothest there is. Nothing on a
  // touch screen is held still while the page moves (a held scene shakes under it on iPhones),
  // so it needs no help from script. Lenis only smooths a mouse wheel.
  if (lenis || reduced() || low() || isTouch()) return lenis
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  // page heights change with every route and pinned scene, so re-measure whenever the triggers do
  ScrollTrigger.addEventListener('refresh', () => lenis?.resize())
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis
export const velocity = () => (lenis ? lenis.velocity : 0)

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.resize()
    return lenis.scrollTo(target, { duration: 1.6, ...opts })
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const top = typeof target === 'number' ? target : el?.getBoundingClientRect ? el.getBoundingClientRect().top + window.scrollY + (opts.offset || 0) : 0
  window.scrollTo({ top, behavior: opts.immediate ? 'auto' : 'smooth' })
}

export function stopScroll() {
  if (lenis) lenis.stop()
  else document.documentElement.style.overflow = 'hidden'
}
export function startScroll() {
  if (lenis) lenis.start()
  else document.documentElement.style.overflow = ''
}
