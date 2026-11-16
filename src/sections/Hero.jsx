import { useEffect, useRef } from 'react'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
import { scrollToEl } from '../lib/scroll'
import Btn from '../components/Btn'
import { BookBtn } from '../components/Booking'

const CODE = 'abcdefghijklmnopqrstuvwxyz{}[]()<>/=;:.*+-_'
const pick = () => CODE[Math.floor(Math.random() * CODE.length)]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Text resolving out of noise: the finished letters arrive left to right, the rest keep flickering until they do.
function scramble(el, text, duration) {
  return new Promise((done) => {
    const start = performance.now()
    let last = 0
    const step = (now) => {
      if (!el.isConnected) return done()
      const p = Math.min(1, (now - start) / duration)
      if (now - last > 45 || p === 1) {
        last = now
        const keep = Math.floor(text.length * p)
        const len = Math.max(keep, Math.round(text.length * Math.min(1, p * 2.2)))
        el.textContent = text.slice(0, keep) + Array.from({ length: len - keep }, pick).join('')
      }
      if (p < 1) requestAnimationFrame(step)
      else { el.textContent = text; done() }
    }
    requestAnimationFrame(step)
  })
}

// "Developer" resolves out of code, then "& writer." joins it, and they play again while they are on screen.
function Roles() {
  const dev = useRef(null)
  const wri = useRef(null)
  useEffect(() => {
    if (device().reduced) return undefined
    const a = dev.current
    const b = wri.current
    let alive = true
    let seen = true
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting })
    io.observe(a)
    const write = async (el, code, text, lit) => {
      if (!alive) return
      el.className = 'hx__role is-code'
      await scramble(el, code, 650)
      if (!alive) return
      el.className = `hx__role${lit ? ' is-lit' : ''}`
      await scramble(el, text, 850)
    }
    const run = async () => {
      await sleep(document.documentElement.classList.contains('intro') ? 3200 : 1900)
      while (alive) {
        if (seen) {
          a.textContent = ''
          b.textContent = ''
          await write(a, '<developer />', 'Developer', false)
          await sleep(150)
          await write(b, '// & writer', '& writer.', true)
        }
        await sleep(5200)
      }
    }
    run()
    return () => { alive = false; io.disconnect() }
  }, [])
  return (
    <p className="hx__roles">
      <span className="sr-only">Developer and writer.</span>
      <span className="hx__role" ref={dev} aria-hidden="true">Developer</span>{' '}
      <span className="hx__role is-lit" ref={wri} aria-hidden="true">&amp; writer.</span>
    </p>
  )
}

let n = 0
const letters = (word) => word.split('').map((c) => <span className="hx__ch" key={n} style={{ '--i': n++ }}>{c}</span>)

// The first screen, and nothing more than it needs: the name, what I do, and the two ways in.
export default function Hero() {
  const root = useRef(null)
  const glow = useRef(null)
  n = 0

  // a soft light drifts after the pointer; only its position ever changes
  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced || d.tier === 'low') return undefined
    const el = root.current
    const p = { x: 0.5, y: 0.42 }
    const write = () => { glow.current.style.transform = `translate3d(${(p.x * 100).toFixed(2)}vw, ${(p.y * 100).toFixed(2)}vh, 0)` }
    const fx = follow(p, 'x', { duration: 1.8, onUpdate: write })
    const fy = follow(p, 'y', { duration: 1.8, onUpdate: write })
    const move = (e) => { fx(e.clientX / innerWidth); fy(e.clientY / innerHeight) }
    el.addEventListener('pointermove', move, { passive: true })
    return () => { el.removeEventListener('pointermove', move); fx.stop(); fy.stop() }
  }, [])

  // The film behind the name: a diary and a laptop, the camera drifting slowly between them, softened and veiled so
  // it never competes with the words. Its still frame is there from the first paint (a few kilobytes); the moving
  // version (about 100 KB) loads only after the page has settled, never on a slow device, with reduced motion or
  // when data is being saved, and it rests whenever the hero is out of view.
  const film = useRef(null)
  useEffect(() => {
    const d = device()
    const v = film.current
    if (!v || d.reduced || d.tier === 'low' || navigator.connection?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches) return undefined
    let io = null
    let idle = 0
    const start = () => {
      const kind = innerWidth > innerHeight ? 'wide' : 'tall'
      const type = v.canPlayType('video/webm; codecs="vp9"') ? 'webm' : 'mp4'
      v.src = `/video/hero-${kind}.${type}`
      v.addEventListener('playing', () => v.classList.add('is-on'), { once: true })
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() })
      io.observe(root.current)
    }
    const later = () => { idle = (window.requestIdleCallback || setTimeout)(start, { timeout: 2500 }) }
    if (document.readyState === 'complete') later(); else addEventListener('load', later, { once: true })
    return () => { removeEventListener('load', later); (window.cancelIdleCallback || clearTimeout)(idle); io?.disconnect(); v.pause(); v.removeAttribute('src'); v.load() }
  }, [])

  return (
    <section className="hx" ref={root} id="top" data-tone="ivory" aria-label="Rushan Haque">
      <div className="hx__film" aria-hidden="true">
        {/* the film's still, painted at once: the moving film later lands on top at exactly its size, so the page's
            largest paint is this instant still, not a film that fades in seconds later */}
        <picture>
          <source media="(max-aspect-ratio: 1/1)" srcSet="/video/hero-tall.webp" />
          <img className="hx__still" src="/video/hero-wide.webp" alt="" fetchPriority="high" decoding="async" />
        </picture>
        <video ref={film} className="hx__video" muted loop playsInline preload="none" disablePictureInPicture disableRemotePlayback tabIndex={-1} />
      </div>
      <span className="hx__glow" ref={glow} aria-hidden="true" />
      <div className="hx__in wrap">
        <h1 className="hx__name">
          <span className="hx__word">{letters('Rushan')}</span>{' '}
          <span className="hx__word">{letters('Haque')}</span>
        </h1>
        <Roles />
        <div className="hx__cta">
          <Btn to="/work" variant="solid">See the work</Btn>
          <BookBtn />
        </div>
      </div>
      <button type="button" className="hx__down" aria-label="Scroll down" onClick={() => { const next = root.current?.nextElementSibling; if (next) scrollToEl(next) }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6" /></svg>
      </button>
    </section>
  )
}
