import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduced, isTouch } from './gsap'
import { low } from './device'

let lenis = null
let normalizer = null

// iPhone and iPad (every browser there is WebKit) scroll on their own thread but draw a held
// (sticky) scene from the scroll position the page last saw, so the scene shakes a pixel or two
// whenever anything else on the page updates. Scrolling from script keeps the two in step.
const ios = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function initLenis() {
  if (!normalizer && !reduced() && isTouch() && ios()) {
    normalizer = ScrollTrigger.normalizeScroll({ allowNestedScroll: true })
    // the intro may already have paused scrolling before this runs
    if (document.documentElement.style.overflow === 'hidden') normalizer?.disable()
  }
  // native scrolling is the smoothest there is on phones and tablets (Lenis only smooths wheels)
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
  normalizer?.disable()
  if (lenis) lenis.stop()
  else document.documentElement.style.overflow = 'hidden'
}
export function startScroll() {
  normalizer?.enable()
  if (lenis) lenis.start()
  else document.documentElement.style.overflow = ''
}
