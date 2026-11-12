import { useEffect, useRef, useState } from 'react'
import { device } from '../lib/device'

// The site itself, running, instead of a picture of it. These heroes carry video and animation that a screenshot
// cannot show, so a card hands its frame over to the real page as soon as the card is on screen — no hovering,
// no tapping, nothing to find.
//
// Each one is a whole website, though, so two things hold them back. Nothing starts while the page is moving —
// scrolling past a row should cost nothing at all, and a site is only worth loading for someone who has stopped
// to look at it. And when they do start they come up in a queue rather than together, because a row arriving
// would otherwise ask for six sites in the same frame and stutter as it did. Any card that leaves the screen
// gives its place up. A slow connection, a data saver or a visitor who asked for less motion never gets one.
// The picture stays underneath throughout, so a site that is slow, refuses to be framed or fails outright
// leaves the card exactly as it was.
const WIDE = 1440
const TALL = 696
const STILL = 550
const APART = 380

// has the page stopped moving? One listener for all of the cards, started with the first of them
let still = false
let stillTimer = 0
let watching = false
const watchers = new Set()
const settle = () => {
  still = false
  clearTimeout(stillTimer)
  stillTimer = setTimeout(() => { still = true; for (const f of [...watchers]) f() }, STILL)
}
const watchScroll = () => {
  if (watching) return
  watching = true
  addEventListener('scroll', settle, { passive: true })
  settle()
}

// one queue for the whole page, so the cards cannot race each other
const waiting = []
let busy = false
const pump = () => {
  if (busy) return
  const next = waiting.shift()
  if (!next) return
  busy = true
  next()
  setTimeout(() => { busy = false; pump() }, APART)
}
const join = (go) => { waiting.push(go); pump() }
const leave = (go) => { const i = waiting.indexOf(go); if (i >= 0) waiting.splice(i, 1) }

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
    let here = false
    const go = () => setOn(true)
    // in view and the page has come to rest: only then is it worth loading a whole site
    const maybe = () => { if (here && still) join(go) }
    watchScroll()
    watchers.add(maybe)

    // the frame is only worth filling at the size it was drawn for, scaled down to whatever room the card has
    const fit = () => el.style.setProperty('--k', (el.clientWidth / WIDE).toFixed(5))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)

    // it plays while it is on screen, and gives up its place the moment it is not
    const card = el.closest('.card') || el
    const io = new IntersectionObserver(([e]) => {
      here = e.isIntersecting
      if (here) { maybe(); return }
      leave(go)
      setOn(false)
      setReady(false)
      // On a desktop a whole row is in front of you and the row plays. On a phone only one card is ever really
      // being looked at, so only the one near the middle plays: two at once is twice the website for no gain.
    }, d.touch ? { rootMargin: '-22% 0px -22% 0px', threshold: 0.6 } : { rootMargin: '0px 0px -10% 0px', threshold: 0.45 })
    io.observe(card)

    return () => {
      watchers.delete(maybe)
      leave(go)
      ro.disconnect()
      io.disconnect()
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
