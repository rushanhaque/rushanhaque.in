// Holding a scene on a touch screen. A scene pinned while the page scrolls under it shakes on
// iPhones, so here the page itself stops instead: the flick that brought it there is cut short,
// the finger no longer scrolls, and each swipe is handed to the scene to play its next step.
// Nothing moves while it holds, so there is nothing to shake. `unlock` gives the page back.

export function createHold(onSwipe) {
  const html = document.documentElement
  let on = false
  let from = null
  const start = (e) => { from = e.touches[0]?.clientY ?? null }
  const end = (e) => {
    if (from == null) return
    const dy = from - (e.changedTouches[0]?.clientY ?? from)
    from = null
    if (on && Math.abs(dy) > 24) onSwipe(dy > 0 ? 1 : -1)
  }
  // while it holds, a finger drags nothing
  const block = (e) => { if (on && e.cancelable) e.preventDefault() }
  window.addEventListener('touchstart', start, { passive: true })
  window.addEventListener('touchend', end, { passive: true })
  window.addEventListener('touchmove', block, { passive: false })

  return {
    get on() { return on },
    // `y`: where the page should stand while it holds (cuts a flick short and lines the scene up)
    lock(y) {
      on = true
      // stopping the scroll comes first: an iPhone ignores a jump while its flick still runs, so
      // the page is lined up again once the flick has ended
      html.style.overflow = 'hidden'
      if (y == null) return
      const put = () => { if (on && Math.abs(window.scrollY - y) > 0.5) window.scrollTo(0, y) }
      put()
      requestAnimationFrame(() => { put(); requestAnimationFrame(put) })
      setTimeout(put, 120)
      setTimeout(put, 320)
    },
    unlock() {
      on = false
      html.style.overflow = ''
    },
    kill() {
      if (on) this.unlock()
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchend', end)
      window.removeEventListener('touchmove', block)
    },
  }
}
