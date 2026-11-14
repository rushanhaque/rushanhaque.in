import { device } from './device'
import { ticker } from './motion'

let lenis = null
// Lenis only needs frames while it is moving; the shared loop stops by itself when nothing asks for it
const raf = (t) => lenis?.raf(t)
const wake = () => ticker.add(raf)

// Smooth wheel scrolling, only on capable desktops. On touch, and on older machines, the browser's own scrolling is
// left alone: nothing feels better in the hand, and nothing is cheaper.
export async function initScroll() {
  if (typeof window === 'undefined' || lenis) return lenis
  const d = device()
  if (d.reduced || d.touch || d.tier !== 'high') return null
  const { default: Lenis } = await import('lenis')
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false, autoRaf: false })
  addEventListener('wheel', wake, { passive: true })
  addEventListener('keydown', wake, { passive: true })
  lenis.on('scroll', () => { if (!lenis.isScrolling) ticker.remove(raf) })
  document.documentElement.classList.add('lenis')
  return lenis
}

export const getLenis = () => lenis

export function scrollToY(y, { smooth = true } = {}) {
  if (lenis) {
    wake()
    return lenis.scrollTo(y, smooth ? { duration: 1.4, easing: (t) => 1 - (1 - t) ** 4, onComplete: () => ticker.remove(raf) } : { immediate: true, force: true })
  }
  window.scrollTo({ top: y, behavior: smooth && !device().reduced ? 'smooth' : 'auto' })
}

export function scrollToEl(el, opts) {
  if (!el) return
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  scrollToY(el.getBoundingClientRect().top + scrollY - pad, opts)
}

export function jumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  window.scrollTo(0, y)
}

let locks = 0
export const lockScroll = () => {
  locks++
  lenis?.stop()
  document.documentElement.classList.add('scroll-lock')
}
export const unlockScroll = () => {
  locks = Math.max(0, locks - 1)
  if (locks) return
  lenis?.start()
  document.documentElement.classList.remove('scroll-lock')
}
