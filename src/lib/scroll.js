import { gsap, ScrollTrigger } from './gsap'
import { device } from './device'

let lenis = null

// Smooth wheel scrolling on desktop. On touch the browser's own scrolling is left alone: nothing feels
// better in the hand, and nothing is cheaper.
export async function initScroll() {
  if (typeof window === 'undefined') return null
  const d = device()
  if (lenis || d.reduced || d.touch) return lenis
  const { default: Lenis } = await import('lenis')
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.85, smoothWheel: true, syncTouch: false, autoRaf: false })
  // something already holding the page (the intro, an open menu) holds the smooth scroll too, from its first frame
  if (locks > 0) lenis.stop()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  if (import.meta.env.DEV) window.__lenis = lenis
  return lenis
}

export const getLenis = () => lenis

export function scrollTo(target, opts = {}) {
  if (lenis) return lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts })
  const top = typeof target === 'number' ? target : (typeof target === 'string' ? document.querySelector(target) : target)?.getBoundingClientRect().top + scrollY
  window.scrollTo({ top, behavior: device().reduced ? 'auto' : 'smooth' })
}

export function jumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  window.scrollTo(0, y)
}

export function jumpTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
}

// Measuring the page again while a finger is on the glass, or while a flick is still carrying the page, can stop the
// flick dead or nudge the page under it: on a phone that reads as a jump to somewhere you did not scroll to. So the
// page is only measured again once the hand is off and the scroll has come to rest.
let lastScroll = 0
let touching = false
if (typeof window !== 'undefined') {
  const moved = () => { lastScroll = performance.now() }
  addEventListener('scroll', moved, { passive: true })
  addEventListener('touchstart', () => { touching = true }, { passive: true })
  addEventListener('touchend', () => { touching = false; moved() }, { passive: true })
  addEventListener('touchcancel', () => { touching = false; moved() }, { passive: true })
}
export function whenStill(fn) {
  const check = () => {
    if (touching || performance.now() - lastScroll < 240) setTimeout(check, 120)
    else fn()
  }
  check()
}

let locks = 0
export const lockScroll = () => {
  locks++
  lenis?.stop()
  if (!lenis) document.documentElement.classList.add('scroll-lock')
}
export const unlockScroll = () => {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  lenis?.start()
  document.documentElement.classList.remove('scroll-lock')
}
