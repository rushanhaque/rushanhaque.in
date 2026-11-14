import { useEffect, useRef } from 'react'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
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

  // a soft brass light drifts after the pointer; only its position ever changes
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

  return (
    <section className="hx" ref={root} id="top" data-tone="ivory" aria-label="Rushan Haque">
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
    </section>
  )
}
