import { useEffect } from 'react'
import { device } from './device'
import { scrub } from './motion'

// The site's vocabulary of arrival, asked for in markup with data-r, and played by CSS transitions (styles/base.css),
// so the browser's compositor does the moving, not script.
//   up      settles up out of the page
//   lift    a card comes up and settles, on a long curve
//   deal    a set of cards, one after another
//   stagger the children arrive one after another
//   rule    a hairline draws itself across
//   rise    words come up out of their masks (the markup is split by <Split>)
//   head    a section heading: the hairline draws, the title rises, the summary settles
//   plate   a picture opens upward from its bottom edge
//   shelve  books standing edge-on turn to face you
//   count   digits roll up like a mechanical counter
//   sweep   read it and it fills in, word by word, tied to the scroll
//
// Everything is visible in the HTML. On arrival, whatever is on screen already stays as it is; the rest is put in
// its waiting pose out of sight, and released as it comes into view.

const STAGGER = { deal: 1, stagger: 1, shelve: 1 }

function prepare(el) {
  const kind = el.dataset.r
  if (STAGGER[kind]) {
    const kids = kind === 'shelve' ? el.querySelectorAll('.shelf__item') : el.children
    ;[...kids].forEach((c, i) => c.style.setProperty('--i', i))
  }
}

function count(el) {
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
    col.style.transitionDuration = `${2.1 + i * 0.3}s`
    reel.append(size, col)
    reels.append(reel)
    cols.push([col, run])
  })
  el.textContent = ''
  el.append(read, reels)
  let left = cols.length
  requestAnimationFrame(() => requestAnimationFrame(() => {
    cols.forEach(([col, run]) => {
      col.addEventListener('transitionend', () => { if (--left === 0) el.textContent = value }, { once: true })
      col.style.transform = `translate3d(0, ${(-100 * run) / (run + 1)}%, 0)`
    })
  }))
  if (!cols.length) el.textContent = value
}

function play(el) {
  if (el.dataset.r === 'count') { el.classList.remove('r-wait'); count(el); return }
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('r-wait')))
}

export function useReveals(root, deps = []) {
  useEffect(() => {
    const host = root.current
    if (!host || device().reduced) return undefined
    const items = [...host.querySelectorAll('[data-r]')]
    const undo = []

    const arriving = new IntersectionObserver((list) => {
      for (const e of list) if (e.isIntersecting) { arriving.unobserve(e.target); play(e.target) }
    }, { rootMargin: '0px 0px -7% 0px' })
    const first = new IntersectionObserver((list) => {
      for (const e of list) {
        first.unobserve(e.target)
        const el = e.target
        if (el.dataset.r === 'sweep') continue
        if (e.isIntersecting && el.dataset.r !== 'count') continue
        if (e.isIntersecting) { play(el); continue }
        prepare(el)
        el.classList.add('r-wait')
        arriving.observe(el)
      }
    })
    for (const el of items) {
      if (el.dataset.r === 'sweep') {
        const words = el.querySelectorAll('.w')
        el.style.setProperty('--n', words.length)
        el.classList.add('is-sweep')
        undo.push(scrub(el, { start: parseFloat(el.dataset.start || 0.88), end: parseFloat(el.dataset.end || 0.5), smooth: 0.25, onUpdate: (p) => el.style.setProperty('--sp', p.toFixed(4)) }))
        continue
      }
      first.observe(el)
      if (el.dataset.r === 'count') undo.push(() => { el.textContent = el.dataset.value })
    }
    return () => {
      first.disconnect()
      arriving.disconnect()
      for (const el of items) el.classList.remove('r-wait', 'is-sweep')
      undo.forEach((f) => f())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
