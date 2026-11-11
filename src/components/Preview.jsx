import { useEffect, useRef, useState } from 'react'
import { device } from '../lib/device'

// The site itself, running, instead of a picture of it. These heroes carry video and animation that a screenshot
// cannot show, so a card can hand its frame over to the real page.
//
// Each one of these is a whole website — its own code, fonts, images and video — so they are rationed hard:
//   · only one runs anywhere on the page at a time, and starting another stops the one before it
//   · a pointer has to rest on a card before it asks for one, so a cursor crossing the row costs nothing
//   · a finger has to come to a stop with the card in the middle of the screen
//   · a slow connection, a data saver or a visitor who asked for less motion never gets one at all
// The picture stays underneath the whole time, so if a site is slow, refuses to be framed, or fails outright,
// the card simply goes on looking the way it always did.
// a real desktop window, in the same shape as the card, so a site lays itself out the way it was built to
const WIDE = 1440
const TALL = 696
const REST = 260
const HOLD = 600

let running = null
const stop = () => { running?.(); running = null }

export default function Preview({ url, title }) {
  const box = useRef(null)
  const [on, setOn] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const d = device()
    const save = navigator.connection?.saveData || /(^|-)2g/.test(navigator.connection?.effectiveType ?? '')
    if (d.reduced || save || d.tier === 'low') return undefined
    const el = box.current
    if (!el) return undefined
    let timer = 0
    let mine = false
    const start = () => {
      if (mine) return
      stop()
      mine = true
      running = () => { mine = false; setOn(false); setReady(false) }
      setOn(true)
    }
    const end = () => {
      clearTimeout(timer)
      if (mine) stop()
    }

    // the frame is only worth filling at the size it was drawn for, scaled down to whatever room the card has
    const fit = () => el.style.setProperty('--k', (el.clientWidth / WIDE).toFixed(5))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)

    let io = null
    const card = el.closest('.card') || el
    if (d.touch) {
      // a finger cannot hover, so the card has to come to rest in the middle of the screen
      io = new IntersectionObserver(([e]) => {
        clearTimeout(timer)
        if (e.isIntersecting) timer = setTimeout(start, HOLD)
        else end()
      }, { rootMargin: '-28% 0px -28% 0px', threshold: 0.6 })
      io.observe(card)
    } else {
      const over = () => { clearTimeout(timer); timer = setTimeout(start, REST) }
      card.addEventListener('pointerenter', over)
      card.addEventListener('pointerleave', end)
      card.addEventListener('focusin', over)
      card.addEventListener('focusout', end)
      return () => {
        clearTimeout(timer)
        if (mine) stop()
        ro.disconnect()
        card.removeEventListener('pointerenter', over)
        card.removeEventListener('pointerleave', end)
        card.removeEventListener('focusin', over)
        card.removeEventListener('focusout', end)
      }
    }
    return () => {
      clearTimeout(timer)
      if (mine) stop()
      ro.disconnect()
      io?.disconnect()
    }
  }, [])

  return (
    <span className={`card__live ${ready ? 'is-ready' : ''}`} ref={box} aria-hidden="true">
      {on && (
        <iframe
          src={url}
          title={`${title}, live`}
          tabIndex={-1}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          style={{ width: `${WIDE}px`, height: `${TALL}px` }}
          onLoad={() => setReady(true)}
        />
      )}
    </span>
  )
}
