import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduced, isTouch } from './gsap'
import { low } from './device'

let lenis = null

export function initLenis() {
  // entry-level phones and reduced motion keep the browser's own scrolling
  if (lenis || reduced() || low()) return lenis
  const touch = isTouch()
  lenis = new Lenis({
    duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95,
    // On phones the finger's scroll runs through Lenis too: it glides with a soft follow, and
    // every held (sticky) scene moves in the same frame as the page, so nothing shakes (iPhones
    // otherwise draw a held scene from a stale scroll position).
    ...(touch ? { syncTouch: true, syncTouchLerp: 0.085, touchInertiaExponent: 1.6, touchMultiplier: 1, allowNestedScroll: true } : {}),
  })
  lenis.on('scroll', ScrollTrigger.update)
  // page heights change with every route and pinned scene, so re-measure whenever the triggers do
  ScrollTrigger.addEventListener('refresh', () => lenis?.resize())
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  // the intro may already have paused scrolling before this runs
  if (document.documentElement.style.overflow === 'hidden') { document.documentElement.style.overflow = ''; lenis.stop() }
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
