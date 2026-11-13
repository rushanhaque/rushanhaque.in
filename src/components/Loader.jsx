import { useEffect } from 'react'
import { gsap } from '../lib/gsap'
import { lockScroll, unlockScroll } from '../lib/scroll'
import { holePath, coverRadius } from '../lib/star'

// The first seconds of a first visit to the home page. The cover is painted by the HTML itself, before
// any script: sandstone, and the word written across it right to left, the way it is written. When the
// page behind it is ready, a star opens in the middle, and the morning is on the other side.
export default function Loader({ onDone }) {
  useEffect(() => {
    const html = document.documentElement
    const cover = document.getElementById('cover')
    // the page is held still under the cover, and let go exactly once, however this ends
    let held = false
    const release = () => { if (held) { held = false; unlockScroll() } }
    const finish = () => {
      release()
      try { sessionStorage.setItem('rh-seen', '1') } catch { /* private mode */ }
      cover?.remove()
      html.classList.remove('intro')
    }
    if (!cover || !html.classList.contains('intro')) {
      cover?.remove()
      onDone()
      return
    }
    held = true
    lockScroll()
    // the cover lifts itself after seven seconds whatever happens (index.html); the page is never held longer
    const safety = setTimeout(release, 7500)
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
    // Long enough to finish writing the word, and no longer than the page needs. The word's own animation says
    // when it is written (it starts at first paint, not at navigation, so a clock from navigation cuts it short);
    // then it is held a breath so it can be read before the star opens.
    const HOLD = 260
    const later = (ms) => new Promise((r) => setTimeout(r, ms))
    const anims = cover.querySelector('svg')?.getAnimations?.() || []
    const written = anims.length
      ? Promise.race([Promise.all(anims.map((a) => a.finished)), later(2600)])
      : later(Math.max(0, 1300 - performance.now()))
    const fonts = Promise.race([document.fonts?.load?.('400 200px "Six Caps"'), later(1800)])
    let timer = 0
    Promise.all([written, fonts]).catch(() => {}).then(() => { timer = setTimeout(open, HOLD) })
    return () => {
      cancelled = true
      clearTimeout(timer)
      clearTimeout(safety)
      tween?.kill()
      release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
