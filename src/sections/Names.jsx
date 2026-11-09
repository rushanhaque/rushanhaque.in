import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { device } from '../lib/device'
import editable from '../data/editable.json'
import Head from '../components/Head'
import { ArrowLeft, ArrowRight } from '../components/glyphs'

const clients = editable.clients || []
const SPEED = 30 // pixels a second, when left alone

// A client on a card: the logo, or the name until a logo has been uploaded in the admin.
function Client({ c }) {
  return (
    <li className={`logo ${c.tone === 'dark' ? 'logo--dark' : ''}`}>
      {c.logo ? <img src={c.logo} alt={c.name} loading="lazy" decoding="async" draggable="false" /> : <span className="logo__name">{c.name}</span>}
    </li>
  )
}

// The clients, on cards in an endless row. It drifts by itself, stops for a pointer or the pause button, can be
// dragged or flicked, and only runs while it is on screen. Only the row's position ever changes.
export default function Names() {
  const root = useRef(null)
  const frame = useRef(null)
  const track = useRef(null)
  const api = useRef(null)
  const [paused, setPaused] = useState(false)
  useReveals(root)
  useChapter(root, { id: 'clientele', name: 'Clientele', time: [15, 16] })

  useEffect(() => {
    const fr = frame.current
    const tr = track.current
    if (device().reduced || !clients.length) return undefined
    fr.classList.add('is-live')
    const cards = [...tr.children]
    const s = { x: 0, vel: -SPEED, held: false, over: false, paused: false, stepping: false, seen: false, lastY: scrollY, boost: 0 }
    let setW = 1
    let cardW = 1
    let extras = []
    const measure = () => {
      extras.forEach((n) => n.remove())
      extras = []
      const last = cards[cards.length - 1]
      const gap = parseFloat(getComputedStyle(tr).columnGap) || 0
      cardW = cards[0].offsetWidth + gap
      setW = last.offsetLeft + last.offsetWidth + gap - cards[0].offsetLeft
      const sets = Math.ceil(fr.clientWidth / setW) + 1
      for (let i = 0; i < sets; i++) {
        cards.forEach((c) => {
          const copy = c.cloneNode(true)
          copy.setAttribute('aria-hidden', 'true')
          copy.querySelector('img')?.setAttribute('alt', '')
          tr.append(copy)
          extras.push(copy)
        })
      }
    }
    const write = () => { tr.style.transform = `translate3d(${(((s.x % setW) - setW) % setW).toFixed(2)}px,0,0)` }
    const tick = (_, deltaMs) => {
      const dt = Math.min(deltaMs / 1000, 0.05)
      const y = scrollY
      if (y !== s.lastY) { s.boost = Math.max(-260, Math.min(260, (y - s.lastY) / Math.max(dt, 0.008) * 0.14)); s.lastY = y }
      s.boost *= Math.exp(-dt * 4)
      if (s.held || s.stepping) return
      const want = s.over || s.paused ? 0 : -SPEED
      s.vel += (want - s.vel) * (1 - Math.exp(-dt * 2.4))
      const move = s.vel - (s.paused ? 0 : s.boost)
      if (Math.abs(move) < 0.01) return
      s.x += move * dt
      write()
    }
    let px = 0
    let pt = 0
    const down = (e) => {
      if (e.button) return
      s.held = true
      px = e.clientX
      pt = performance.now()
      s.vel = 0
      gsap.killTweensOf(s)
      s.stepping = false
      fr.setPointerCapture(e.pointerId)
      fr.classList.add('is-held')
    }
    const move = (e) => {
      if (!s.held) return
      const now = performance.now()
      const dx = e.clientX - px
      s.x += dx
      s.vel = (dx / Math.max(now - pt, 8)) * 1000 * 0.6 + s.vel * 0.4
      px = e.clientX
      pt = now
      write()
    }
    const up = () => {
      s.held = false
      fr.classList.remove('is-held')
      if (performance.now() - pt > 90) s.vel = 0
      s.vel = Math.max(-2400, Math.min(2400, s.vel))
    }
    const enter = (e) => { if (e.pointerType === 'mouse') s.over = true }
    const leave = () => { s.over = false }
    fr.addEventListener('pointerdown', down)
    fr.addEventListener('pointermove', move)
    fr.addEventListener('pointerup', up)
    fr.addEventListener('pointercancel', up)
    fr.addEventListener('pointerenter', enter)
    fr.addEventListener('pointerleave', leave)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === s.seen) return
      s.seen = e.isIntersecting
      s.lastY = scrollY
      if (s.seen) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    })
    io.observe(fr)
    api.current = {
      step: (dir) => {
        s.stepping = true
        s.vel = 0
        gsap.to(s, { x: s.x - dir * cardW, duration: 0.9, ease: 'expo.out', overwrite: true, onUpdate: write, onComplete: () => { s.stepping = false } })
      },
      pause: (v) => { s.paused = v },
    }
    measure()
    write()
    let w = innerWidth
    const resized = () => { if (innerWidth !== w) { w = innerWidth; measure(); write() } }
    addEventListener('resize', resized)
    return () => {
      io.disconnect()
      gsap.ticker.remove(tick)
      gsap.killTweensOf(s)
      removeEventListener('resize', resized)
      fr.removeEventListener('pointerdown', down)
      fr.removeEventListener('pointermove', move)
      fr.removeEventListener('pointerup', up)
      fr.removeEventListener('pointercancel', up)
      fr.removeEventListener('pointerenter', enter)
      fr.removeEventListener('pointerleave', leave)
      extras.forEach((n) => n.remove())
      fr.classList.remove('is-live')
      tr.style.transform = ''
      api.current = null
    }
  }, [])

  const toggle = () => {
    const next = !paused
    setPaused(next)
    api.current?.pause(next)
  }

  return (
    <section className="names" ref={root} id="clientele" data-tone="night">
      <div className="wrap">
        <Head label="Brands I work with" title="Clientele" count={clients.length} lede="Brands in India, Saudi Arabia, Poland and Nepal, most of them export houses selling to buyers in dozens of countries." />
      </div>
      <div className="logos" ref={frame} data-r="fade">
        <ul className="logos__track" ref={track}>
          {clients.map((c) => <Client c={c} key={c.name} />)}
        </ul>
      </div>
      <div className="logos__foot wrap">
        <span className="pager">
          <button type="button" onClick={() => api.current?.step(-1)} aria-label="Previous clients"><ArrowLeft size={16} /></button>
          <button type="button" onClick={toggle} aria-pressed={paused} aria-label={paused ? 'Keep the row moving' : 'Stop the row moving'}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">{paused ? <path d="M3.5 1.5v11l9-5.5z" /> : <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" />}</svg>
          </button>
          <button type="button" onClick={() => api.current?.step(1)} aria-label="Next clients"><ArrowRight size={16} /></button>
        </span>
      </div>
    </section>
  )
}
