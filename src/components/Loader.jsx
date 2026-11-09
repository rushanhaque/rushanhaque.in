import { useEffect } from 'react'
import { gsap } from '../lib/gsap'
import { holePath, coverRadius } from '../lib/star'

// The first seconds of a first visit to the home page. The cover is painted by the HTML itself, before
// any script: sandstone, and the word written across it right to left, the way it is written. When the
// page behind it is ready, a star opens in the middle, and the morning is on the other side.
export default function Loader({ onDone }) {
  useEffect(() => {
    const html = document.documentElement
    const cover = document.getElementById('cover')
    const finish = () => {
      try { sessionStorage.setItem('rh-seen', '1') } catch { /* private mode */ }
      cover?.remove()
      html.classList.remove('intro')
    }
    if (!cover || !html.classList.contains('intro')) {
      cover?.remove()
      onDone()
      return
    }
    let tween
    let cancelled = false
    const open = () => {
      if (cancelled) return
      const w = innerWidth
      const h = innerHeight
      const R = coverRadius(w, h, w / 2, h / 2)
      const s = { r: 0 }
      onDone()
      tween = gsap.to(s, {
        r: R,
        duration: 0.9,
        ease: 'expo.inOut',
        onStart: () => {
          gsap.to(cover.firstElementChild, { autoAlpha: 0, scale: 0.97, duration: 0.45, ease: 'power2.in' })
          gsap.fromTo('.bar', { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.75, ease: 'expo.out', clearProps: 'all' })
        },
        onUpdate: () => { cover.style.clipPath = holePath(w, h, w / 2, h / 2, s.r) },
        onComplete: finish,
      })
    }
    // long enough to finish writing the word, and no longer than the page needs
    const wait = Math.max(0, 900 - performance.now())
    const fonts = Promise.race([document.fonts?.load?.('400 200px "Six Caps"'), new Promise((r) => setTimeout(r, 1800))])
    const timer = setTimeout(() => { fonts.finally(open) }, wait)
    return () => {
      cancelled = true
      clearTimeout(timer)
      tween?.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
