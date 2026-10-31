import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduced } from './gsap'
import { low } from './device'

let lenis = null

export function initLenis() {
  // native scrolling is the smoothest there is on an entry-level phone
  if (lenis || reduced() || low()) return lenis
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

export const stopScroll = () => (lenis ? lenis.stop() : (document.documentElement.style.overflow = 'hidden'))
export const startScroll = () => (lenis ? lenis.start() : (document.documentElement.style.overflow = ''))
