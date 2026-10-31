import { gsap, ScrollTrigger, SplitText, useGSAP, reduced } from './gsap'
import { setTheme } from './theme'
import { useApp } from './app'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Page choreography from attributes inside `scope`. Only transform, opacity, clip-path and
 * `scale` are animated, so every reveal stays on the compositor and phones scroll smoothly.
 *   .kick__label                     section labels settle letter by letter, like a departure board
 *   data-split | ="lines"            words rise out of their masks with a slight turn / whole lines rise
 *   data-reveal | ="clip" | ="arch"  fade-up / wipe / arch-shaped opening
 *   data-img                         the frame wipes open while the picture settles from a zoom
 *   data-colorize                    pictures bloom from grey into colour while they cross the middle
 *   data-stagger / data-batch        children arrive in sequence / grid children in batches
 *   data-line                        a hairline draws itself from the left
 *   data-parallax="0.12"             the inner image drifts against the scroll
 *   .beam                            its travelling light runs only while on screen
 *   data-theme | data-theme-from     the header and cursor switch palette as the section arrives
 */
export function useReveals(scope, initialTheme = 'ivory') {
  const { ready } = useApp()

  useGSAP(
    () => {
      setTheme(initialTheme, true)
      if (!ready) return
      const root = scope.current
      const once = (el, start = 'top 88%') => ({ trigger: el, start, once: true })

      // the palette is whichever room sits under the header, read after every crossing settles,
      // so a long jump (an anchor, the command palette) can never leave the wrong one behind
      const themed = [...root.querySelectorAll('[data-theme]')]
      let queued = false
      const resolve = () => {
        if (queued) return
        queued = true
        queueMicrotask(() => {
          queued = false
          const under = themed.filter((el) => el.getBoundingClientRect().top <= 72).pop()
          if (under) return setTheme(under.dataset.theme)
          const first = themed[0]
          setTheme(first?.dataset.themeFrom && first.getBoundingClientRect().top < window.innerHeight * 1.4 ? first.dataset.themeFrom : initialTheme)
        })
      }
      themed.forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 72px', onToggle: resolve }))
      root.querySelectorAll('.beam').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', toggleClass: { targets: el, className: 'is-live' } }))
      root.querySelectorAll('[data-colorize]').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 64%', end: 'bottom 36%', toggleClass: { targets: el, className: 'is-color' } }))
      if (reduced()) return

      root.querySelectorAll('.kick__label').forEach((el) => {
        const text = el.textContent
        gsap.to(el, { duration: 1.1, ease: 'none', scrambleText: { text, chars: GLYPHS, revealDelay: 0.25, speed: 0.6 }, scrollTrigger: once(el, 'top 94%') })
      })

      root.querySelectorAll('[data-split]').forEach((el) => {
        const lines = el.dataset.split === 'lines'
        const delay = parseFloat(el.dataset.delay || 0)
        SplitText.create(el, {
          type: lines ? 'lines' : 'words,lines',
          mask: lines ? 'lines' : 'words',
          linesClass: 'split-line',
          autoSplit: true,
          // split into whole words and lines, the text still reads correctly, so no label is added
          aria: 'none',
          onSplit(self) {
            return lines
              ? gsap.from(self.lines, { yPercent: 115, stagger: 0.09, duration: 1.3, delay, scrollTrigger: once(el) })
              : gsap.from(self.words, { yPercent: 118, rotate: 4, transformOrigin: '0% 100%', stagger: 0.045, duration: 1.3, delay, scrollTrigger: once(el) })
          },
        })
      })

      gsap.utils.toArray('[data-reveal]', root).forEach((el) => {
        const kind = el.dataset.reveal
        const delay = parseFloat(el.dataset.delay || 0)
        if (kind === 'clip' || kind === 'arch') {
          const r = kind === 'arch' ? '999px 999px 0px 0px' : '16px'
          gsap.fromTo(el, { clipPath: `inset(100% 0% 0% 0% round ${r})` }, { clipPath: `inset(0% 0% 0% 0% round ${r})`, duration: 1.5, delay, ease: 'silk', clearProps: 'clipPath', scrollTrigger: once(el, 'top 92%') })
        } else {
          gsap.from(el, { y: 40, autoAlpha: 0, duration: 1.2, delay, clearProps: 'transform', scrollTrigger: once(el, 'top 92%') })
        }
      })

      gsap.utils.toArray('[data-img]', root).forEach((el) => {
        const img = el.querySelector('img')
        gsap.fromTo(el, { clipPath: 'inset(16% 10% 16% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'silk', clearProps: 'clipPath', scrollTrigger: once(el, 'top 92%') })
        if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, clearProps: 'scale', scrollTrigger: once(el, 'top 92%') })
      })

      gsap.utils.toArray('[data-stagger]', root).forEach((el) => {
        gsap.from(el.children, { y: 28, autoAlpha: 0, stagger: 0.06, duration: 1.1, clearProps: 'transform', scrollTrigger: once(el, 'top 90%') })
      })

      gsap.utils.toArray('[data-batch]', root).forEach((el) => {
        const kids = [...el.children]
        gsap.set(kids, { autoAlpha: 0, y: 48 })
        ScrollTrigger.batch(kids, { start: 'top 94%', once: true, onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 1.1, clearProps: 'transform' }) })
      })

      gsap.utils.toArray('[data-line]', root).forEach((el) => {
        gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'silk', scrollTrigger: once(el, 'top 95%') })
      })

      gsap.utils.toArray('[data-parallax]', root).forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || 0.12) * 100
        const img = el.querySelector('img') || el
        gsap.fromTo(img, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })

      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope, dependencies: [ready] },
  )
}
