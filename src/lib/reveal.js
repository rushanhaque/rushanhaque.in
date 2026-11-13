import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'
import { device } from './device'
import { whenStill } from './scroll'

// The site's vocabulary of arrival, kept deliberately short. Asked for in markup with data-r.
//   lines   text comes up out of a mask, line by line
//   sweep   read it and it fills in, word by word, tied to the scroll
//   fade    a slow, heavy settle
//   rule    a hairline draws itself across
//   stagger the children arrive one after another
//   head    a section heading: the hairline draws, the title comes up out of its mask, the summary settles
//   plate   a picture opens upward from its bottom edge while it settles in its frame
//   shelve  books standing edge-on turn to face you, one after another
//   count   digits roll up like a mechanical counter
//   lift    a card arrives: it comes up out of the page and settles, on a long curve
//   deal    a set of cards arrives, one after another, as sheets laid onto a board
//
// Nothing is prepared until it is about to be seen. A page of sixty pictures sets up nothing when it loads: the
// browser's observer says when each is arriving, and only then is its text split or its tween made. Everything
// is visible in the HTML by default. Whatever is not on the first screen is hidden by one class, from the
// stylesheet, once the page is running, and only transforms and opacity move, apart from the clip a plate opens.

// Far enough to be a movement rather than a twitch, on a curve that spends almost all of its time slowing down:
// the card is nearly home before you have finished noticing it left. The whisper of scale is what separates this
// from a slide — it reads as something coming up out of the page rather than across it.
const TRAVEL = 44
// One curve for every arrival: it glides in and eases off evenly, rather than jumping most of the way at once
// and then creeping, which reads as a pop. Things start as they come into view, not once they are well inside it.
const EASE = 'power3.out'
const SETTLE = { duration: 1.35, ease: EASE }

function arrive(targets, extra = {}) {
  return gsap.fromTo(
    targets,
    { y: TRAVEL, scale: 0.985, opacity: 0 },
    { y: 0, scale: 1, opacity: 1, ...SETTLE, ...extra, clearProps: 'transform,opacity' },
  )
}

function rise(el, delay = 0) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', aria: 'none', tag: 'span', linesClass: 'split-line' })
  // once it has landed the text goes back to being plain text, which also lets it rewrap on any later resize
  gsap.from(split.lines, { yPercent: 108, duration: 1.35, delay, stagger: 0.06, ease: EASE, onComplete: () => split.revert() })
}

const PLAY = {
  lines: (el) => rise(el),

  fade: (el) => {
    gsap.from(el, { y: 18, opacity: 0, duration: 1.4, delay: parseFloat(el.dataset.delay || 0) * 0.6, ease: EASE, clearProps: 'transform,opacity' })
  },

  rule: (el) => {
    gsap.from(el, { scaleX: 0, transformOrigin: '0 50%', duration: 1.4, ease: 'power2.inOut', clearProps: 'transform' })
  },

  lift: (el) => {
    arrive(el, { delay: parseFloat(el.dataset.delay || 0) * 0.6 })
  },

  // A set of them, dealt out one after another. Always the direct children, so a single rule in the stylesheet
  // can hold the whole group back before it arrives.
  deal: (el) => {
    arrive(el.children, { stagger: parseFloat(el.dataset.gap || 0.085) * 0.75 })
  },

  stagger: (el) => {
    gsap.from(el.children, { y: 18, opacity: 0, duration: 1.3, stagger: parseFloat(el.dataset.gap || 0.06) * 0.75, ease: EASE, clearProps: 'transform,opacity' })
  },

  head: (el) => {
    const rule = el.querySelector('.kick i')
    const label = el.querySelector('.kick span')
    const title = el.querySelector('.sh__title')
    const lede = el.querySelector('.sh__lede')
    if (rule) gsap.from(rule, { scaleX: 0, transformOrigin: '0 50%', duration: 1.5, ease: 'power2.inOut', clearProps: 'transform' })
    if (label) gsap.from(label, { opacity: 0, y: 10, duration: 1.2, ease: EASE, clearProps: 'transform,opacity' })
    if (title) rise(title, 0.04)
    if (lede) gsap.from(lede, { opacity: 0, y: 14, duration: 1.4, delay: 0.12, ease: EASE, clearProps: 'transform,opacity' })
  },

  plate: (el, { drifts }) => {
    const pics = el.querySelectorAll('img')
    // the margins leave room for the frame's shadow, which would otherwise appear all at once at the end
    gsap.fromTo(el, { clipPath: 'inset(100% -80px -80px -80px)' }, { clipPath: 'inset(-80px -80px -80px -80px)', duration: 1.6, ease: 'power3.inOut', clearProps: 'clipPath' })
    const drift = drifts && el.dataset.drift != null
    if (pics.length) gsap.fromTo(pics, { scale: drift ? 1.18 : 1.1 }, { scale: drift ? 1.07 : 1, duration: 2, ease: EASE })
  },

  shelve: (el) => {
    gsap.from(el.querySelectorAll('.shelf__item'), {
      rotateY: 74,
      transformPerspective: 1100,
      transformOrigin: '0% 50%',
      opacity: 0,
      duration: 1.6,
      stagger: 0.07,
      ease: EASE,
      clearProps: 'transform,opacity',
    })
  },

  count: (el) => {
    const value = el.dataset.value
    const reels = document.createElement('span')
    reels.className = 'reels'
    reels.setAttribute('aria-hidden', 'true')
    const read = document.createElement('span')
    read.className = 'sr-only'
    read.textContent = value
    const cols = []
    value.split('').forEach((c, i) => {
      if (!/\d/.test(c)) { const s = document.createElement('span'); s.textContent = c; reels.append(s); return }
      const reel = document.createElement('span')
      reel.className = 'reel'
      const size = document.createElement('span')
      size.className = 'reel__size'
      size.textContent = c
      const col = document.createElement('span')
      col.className = 'reel__col'
      // once round and on to the digit, so that every reel really travels
      const run = 10 + Number(c)
      for (let k = 0; k <= run; k++) { const b = document.createElement('b'); b.textContent = k % 10; col.append(b) }
      reel.append(size, col)
      reels.append(reel)
      cols.push([col, run, i])
    })
    el.textContent = ''
    el.append(read, reels)
    // once they have stopped, the reels go and the plain number takes their place: same size, nothing left to carry
    let left = cols.length
    cols.forEach(([col, run, i]) => {
      gsap.fromTo(col, { yPercent: 0 }, {
        yPercent: (-100 * run) / (run + 1),
        duration: 2.1 + i * 0.3,
        ease: 'power3.inOut',
        force3D: true,
        onComplete: () => { if (--left === 0) el.textContent = value },
      })
    })
  },
}

// What follows the scroll has to exist before it comes into view, but only just before.
const NEAR = {
  sweep: (el) => {
    const split = SplitText.create(el, { type: 'words', aria: 'none', tag: 'span' })
    gsap.fromTo(split.words, { opacity: 0.62 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: el.dataset.start || 'top 78%', end: el.dataset.end || 'bottom 52%', scrub: 0.4 },
    })
  },
  // with a mouse, a picture also drifts inside its frame as the page moves past. On a phone the page scrolls on its
  // own thread and a scroll-tied picture would shake, so there it stays still.
  drift: (el) => {
    const pics = el.querySelectorAll('img')
    if (!pics.length) return
    gsap.set(pics, { scale: 1.07 })
    gsap.fromTo(pics, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
  },
}

export function useReveals(root, deps = []) {
  const ran = useRef(false)
  useGSAP(
    (_, safe) => {
      if (!root.current || device().reduced) return undefined
      const q = gsap.utils.selector(root)
      const items = q('[data-r]')
      const drifts = !device().touch
      const again = ran.current
      ran.current = true
      const undo = []
      const play = safe((el) => {
        el.classList.remove('r-wait')
        if (el.dataset.r === 'count') undo.push(() => { el.textContent = el.dataset.value })
        PLAY[el.dataset.r]?.(el, { drifts })
      })
      const prepare = safe((el) => {
        if (el.dataset.r === 'sweep') NEAR.sweep(el)
        if (drifts && el.dataset.drift != null) NEAR.drift(el)
      })

      const arriving = new IntersectionObserver((list) => {
        for (const e of list) if (e.isIntersecting) { arriving.unobserve(e.target); play(e.target) }
      }, { rootMargin: '0px 0px 4% 0px' })
      const near = new IntersectionObserver((list) => {
        for (const e of list) if (e.isIntersecting) { near.unobserve(e.target); prepare(e.target) }
      }, { rootMargin: '70% 0px' })
      // the first look: what is on screen already stays as it is, and the rest waits out of sight
      const first = new IntersectionObserver((list) => {
        for (const e of list) {
          first.unobserve(e.target)
          // (a counter still rolls: it has nothing to lose by starting from nought in plain view)
          if (e.isIntersecting && !again && e.target.dataset.r !== 'count') continue
          if (e.isIntersecting) { play(e.target); continue }
          e.target.classList.add('r-wait')
          arriving.observe(e.target)
        }
      })
      for (const el of items) {
        if (el.dataset.r === 'sweep' || el.dataset.drift != null) near.observe(el)
        if (PLAY[el.dataset.r]) first.observe(el)
      }
      return () => {
        first.disconnect()
        arriving.disconnect()
        near.disconnect()
        for (const el of items) el.classList.remove('r-wait')
        undo.forEach((f) => f())
      }
    },
    { scope: root, dependencies: deps, revertOnUpdate: true },
  )
}

// fonts and late images move things: measure again once they have settled
export function refreshSoon() {
  whenStill(() => requestAnimationFrame(() => ScrollTrigger.refresh()))
}
