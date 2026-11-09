import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { device } from '../lib/device'
import { reviews } from '../data/content'
import Head from '../components/Head'

// where each note hangs in its place on the board: which side, how far down, and its turn on the pin
const SPOTS = [['start', 0, -2.4], ['center', 34, 1.8], ['end', 6, -1.2], ['end', 22, 2.2], ['start', 0, -1.6], ['center', 30, 2.6], ['center', 6, 1.4], ['start', 28, -2.8], ['end', 0, 1.6]]
const STIFF = 46 // how hard a note swings back to hanging straight
const DAMP = 2.6 // how soon it stops
const clamp = (v, a) => Math.max(-a, Math.min(a, v))

const Star = () => <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6 12.6 7l5.9.7-4.4 4 1.2 5.8L10 14.6l-5.3 2.9 1.2-5.8-4.4-4L7.4 7z" /></svg>

// Client notes pinned to a drawing board, in their own words. Each note really hangs from its pin: it swings when
// it lands, when the page moves, when the pointer brushes past and when another note is thrown into it. With a mouse
// any note can be picked up and thrown, and it stays where it lands. On a phone they are a row you swipe, swinging as
// they go. Everything stops once they have settled, and only transforms ever change.
export default function Reflections() {
  const root = useRef(null)
  const board = useRef(null)
  const api = useRef(null)
  const [moved, setMoved] = useState(false)
  const [fine, setFine] = useState(false)
  useReveals(root)
  useChapter(root, { id: 'reviews', name: 'Reviews', time: [18.2, 19.4] })

  useEffect(() => {
    if (device().reduced) return undefined
    const el = board.current
    const canThrow = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches
    setFine(canThrow)
    const notes = [...el.querySelectorAll('.ref__note')].map((n) => ({ n, x: 0, y: 0, drop: 0, vx: 0, vy: 0, a: 0, w: 0, tilt: 0, held: false, free: false, wrote: '', box: null, hits: new Set() }))
    let lastY = scrollY
    let lastX = el.scrollLeft
    let running = false
    const write = (s) => {
      const t = `translate3d(${s.x.toFixed(1)}px,${(s.y + s.drop).toFixed(1)}px,0) rotate(${s.a.toFixed(4)}rad)`
      if (t !== s.wrote) { s.n.style.transform = t; s.wrote = t }
    }
    const measure = () => {
      const b = el.getBoundingClientRect()
      notes.forEach((s) => {
        const r = s.n.getBoundingClientRect()
        s.box = { left: r.left - b.left - s.x, top: r.top - b.top - s.y - s.drop, w: r.width, h: r.height }
      })
      return b
    }
    const tick = (_, deltaMs) => {
      const dt = Math.min(deltaMs / 1000, 0.05)
      const y = scrollY
      const x = el.scrollLeft
      // the page moving, or the row being swiped, shakes the board
      const shake = clamp((y - lastY) * 0.0028 + (x - lastX) * 0.004, 0.9)
      lastY = y
      lastX = x
      notes.forEach((s, i) => {
        if (shake) s.w += shake * (i % 2 ? 1 : -1) * (0.7 + (i % 3) * 0.25)
        if (s.free) {
          s.x += s.vx * dt
          s.y += s.vy * dt
          const f = Math.exp(-dt * 3)
          s.vx *= f
          s.vy *= f
          const b = s.limits
          if (s.x < b.minX || s.x > b.maxX) { s.x = Math.max(b.minX, Math.min(b.maxX, s.x)); s.vx *= -0.45; s.w += s.vx * 0.002 }
          if (s.y < b.minY || s.y > b.maxY) { s.y = Math.max(b.minY, Math.min(b.maxY, s.y)); s.vy *= -0.45 }
          if (Math.abs(s.vx) + Math.abs(s.vy) < 6) { s.free = false; s.tilt = 0 }
        }
        if (s.held || s.free) {
          // a note on the move knocks the ones it reaches
          notes.forEach((o) => {
            if (o === s || !s.box || !o.box) return
            const hit = s.box.left + s.x < o.box.left + o.x + o.box.w && o.box.left + o.x < s.box.left + s.x + s.box.w && s.box.top + s.y < o.box.top + o.y + o.box.h && o.box.top + o.y < s.box.top + s.y + s.box.h
            if (hit && !s.hits.has(o)) { s.hits.add(o); o.w += clamp(s.vx * 0.004, 2.6) + 0.5 }
            if (!hit) s.hits.delete(o)
          })
          s.tilt = clamp(-s.vx * 0.00045, 0.5)
        }
        s.w += (-STIFF * (s.a - s.tilt) - DAMP * s.w) * dt
        s.a += s.w * dt
        if (Math.abs(s.w) < 0.0006 && Math.abs(s.a - s.tilt) < 0.0006) { s.w = 0; s.a = s.tilt }
        write(s)
      })
    }
    const run = (on) => {
      if (on === running) return
      running = on
      lastY = scrollY
      lastX = el.scrollLeft
      if (on) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    }

    // the notes land on the board one after another, and swing on their pins
    let landed = false
    const land = () => {
      if (landed) return
      landed = true
      el.classList.remove('is-waiting')
      const order = gsap.utils.shuffle(notes.slice())
      order.forEach((s, i) => {
        s.drop = -80
        gsap.fromTo(s.n, { opacity: 0 }, { opacity: 1, duration: 0.45, delay: i * 0.07, ease: 'power2.out', clearProps: 'opacity' })
        gsap.to(s, { drop: 0, duration: 0.8, delay: i * 0.07, ease: 'power3.out', onStart: () => { s.w = (i % 2 ? 1 : -1) * 1.9 } })
      })
    }
    let first = true
    const io = new IntersectionObserver(([e]) => {
      run(e.isIntersecting)
      if (first) {
        first = false
        if (!e.isIntersecting) el.classList.add('is-waiting')
        else landed = true
      } else if (e.isIntersecting) {
        land()
      }
    }, { threshold: 0.04 })
    io.observe(el)

    // brushing past a note sets it swinging
    const brush = (e) => {
      if (e.pointerType !== 'mouse' || e.buttons) return
      const s = notes.find((k) => k.n === e.target.closest?.('.ref__note'))
      if (s) s.w += clamp(e.movementX * 0.05, 1.3)
    }
    el.addEventListener('pointerover', brush)

    // picking a note up
    let z = 2
    let grab = null
    const down = (e) => {
      if (e.button) return
      const s = notes.find((k) => k.n === e.target.closest?.('.ref__note'))
      if (!s) return
      const b = measure()
      gsap.killTweensOf(s)
      s.held = true
      s.free = false
      s.vx = 0
      s.vy = 0
      s.limits = { minX: -s.box.left + 6, maxX: b.width - s.box.left - s.box.w - 6, minY: -s.box.top + 10, maxY: b.height - s.box.top - s.box.h - 6 }
      s.n.style.zIndex = ++z
      s.n.classList.add('is-held')
      s.n.setPointerCapture(e.pointerId)
      grab = { s, dx: e.clientX - s.x, dy: e.clientY - s.y, t: performance.now() }
      e.preventDefault()
    }
    const move = (e) => {
      if (!grab) return
      const { s } = grab
      const now = performance.now()
      const nx = Math.max(s.limits.minX, Math.min(s.limits.maxX, e.clientX - grab.dx))
      const ny = Math.max(s.limits.minY, Math.min(s.limits.maxY, e.clientY - grab.dy))
      const span = Math.max(now - grab.t, 8) / 1000
      s.vx = s.vx * 0.5 + ((nx - s.x) / span) * 0.5
      s.vy = s.vy * 0.5 + ((ny - s.y) / span) * 0.5
      s.x = nx
      s.y = ny
      grab.t = now
      if (Math.abs(s.x) + Math.abs(s.y) > 2) setMoved(true)
    }
    const up = () => {
      if (!grab) return
      const { s } = grab
      s.held = false
      s.n.classList.remove('is-held')
      if (performance.now() - grab.t > 90) { s.vx = 0; s.vy = 0 }
      s.vx = clamp(s.vx, 2600)
      s.vy = clamp(s.vy, 2600)
      s.free = true
      grab = null
    }
    if (canThrow) {
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
    }
    api.current = {
      tidy: () => {
        notes.forEach((s, i) => {
          s.free = false
          s.vx = 0
          s.vy = 0
          gsap.to(s, { x: 0, y: 0, duration: 1, delay: i * 0.035, ease: 'expo.inOut', overwrite: true, onComplete: () => { s.w += (i % 2 ? 1 : -1) * 1.4 } })
        })
        setMoved(false)
      },
    }
    return () => {
      io.disconnect()
      run(false)
      notes.forEach((s) => { gsap.killTweensOf(s); gsap.killTweensOf(s.n); s.n.style.transform = ''; s.n.style.zIndex = ''; s.n.style.opacity = '' })
      el.classList.remove('is-waiting')
      el.removeEventListener('pointerover', brush)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      api.current = null
    }
  }, [])

  const aside = (
    <p className="ref__score">
      <b className="pillar"><span data-r="count" data-value="5.0">5.0</span></b>
      <span className="ref__scoretxt">
        <span className="ref__stars" role="img" aria-label="Five stars out of five">{[0, 1, 2, 3, 4].map((k) => <Star key={k} />)}</span>
        <span className="note">{reviews.length} client reviews, every one five stars</span>
      </span>
    </p>
  )

  return (
    <section className="ref wrap" ref={root} id="reviews" data-tone="ivory">
      <Head label="What clients say" title="Reviews" count={reviews.length} aside={aside} />
      <div className="ref__board" ref={board} role="group" aria-label="Client reviews" tabIndex={0}>
        {reviews.map((r, i) => {
          const [side, top, turn] = SPOTS[i % SPOTS.length]
          const size = r.quote.length < 24 ? 'is-short' : r.quote.length > 60 ? 'is-long' : ''
          return (
            <figure className={`ref__note ${size}`} key={r.name} style={{ '--side': side, '--top': `${top}px`, '--turn': `${turn}deg` }}>
              <span className="ref__pin" aria-hidden="true" />
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <strong>{r.name}</strong>
                <span className="small">{[r.company.replace(' · ', ', '), r.location].filter(Boolean).join(', ')}</span>
                <time className="note">{r.date}</time>
              </figcaption>
            </figure>
          )
        })}
      </div>
      <div className="ref__foot">
        <p className="note">{fine ? 'Pick a note up and throw it.' : 'Swipe through the notes.'}</p>
        {moved && <button type="button" className="tlink" onClick={() => api.current?.tidy()}>Pin them back</button>}
      </div>
    </section>
  )
}
