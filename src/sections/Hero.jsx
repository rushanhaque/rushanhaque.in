import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site'
import { works, stats, serve } from '../data/content'
import { device } from '../lib/device'
import { follow } from '../lib/motion'
import { small } from '../lib/img'
import Btn from '../components/Btn'
import Clock from '../components/Clock'
import Split from '../components/Split'
import Star from '../components/Star'
import { BookBtn } from '../components/Booking'
import { ArrowDown } from '../components/glyphs'

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

// As on the previous site: "Developer" resolves out of code, then "& writer." joins it, and they play again while seen.
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
      await sleep(document.documentElement.classList.contains('intro') ? 3000 : 1600)
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
    <span className="hx__roles">
      <span className="sr-only">Developer and writer</span>
      <span className="hx__role" ref={dev} aria-hidden="true">Developer</span>{' '}
      <span className="hx__role is-lit" ref={wri} aria-hidden="true">&amp; writer.</span>
    </span>
  )
}

// A window set into the sentence, cycling through the client sites. Only the first picture loads with the page; the
// rest follow once it has settled.
function WorkPill() {
  const [now, setNow] = useState(0)
  const [all, setAll] = useState(false)
  const box = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => setAll(true), 1800)
    if (device().reduced) return () => clearTimeout(t)
    let seen = true
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting })
    io.observe(box.current)
    const i = setInterval(() => { if (seen && !document.hidden) setNow((n) => (n + 1) % works.length) }, 2600)
    return () => { clearTimeout(t); clearInterval(i); io.disconnect() }
  }, [])
  return (
    <span className="hx__pill hx__pill--work" ref={box} aria-hidden="true">
      {works.map((w, i) => (all || i === 0) && (
        <img key={w.slug} className={i === now ? 'is-on' : i === (now + works.length - 1) % works.length ? 'is-prev' : ''} src={small(w.image)} alt="" width="800" height="387" decoding="async" fetchPriority={i ? 'low' : 'high'} />
      ))}
    </span>
  )
}

function StarPill() {
  return <span className="hx__pill hx__pill--star" aria-hidden="true"><Star className="hx__star" /></span>
}

const PROOF = [
  { value: stats[0].value + stats[0].suffix, label: 'Projects shipped' },
  { value: stats[2].value, label: 'Average review' },
  { value: serve.stats[2].value, label: 'Client countries' },
]

// The first screen: the promise, in one sentence, with the work set right into it. Words rise into place and the two
// windows open after them; a soft brass light drifts after the pointer. All of it is HTML and CSS first, so it paints
// before any script on any device.
export default function Hero() {
  const root = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced || d.tier === 'low') return undefined
    const el = root.current
    const p = { x: 0.72, y: 0.3 }
    const write = () => { glow.current.style.transform = `translate3d(${(p.x * 100).toFixed(2)}vw, ${(p.y * 100).toFixed(2)}vh, 0)` }
    const fx = follow(p, 'x', { duration: 1.6, onUpdate: write })
    const fy = follow(p, 'y', { duration: 1.6, onUpdate: write })
    const move = (e) => { fx(e.clientX / innerWidth); fy(e.clientY / innerHeight) }
    el.addEventListener('pointermove', move, { passive: true })
    return () => { el.removeEventListener('pointermove', move); fx.stop(); fy.stop() }
  }, [])

  return (
    <section className="hx" ref={root} id="top" data-tone="ivory" aria-label="Rushan Haque">
      <span className="hx__glow" ref={glow} aria-hidden="true" />
      <div className="hx__in wrap">
        <div className="hx__head">
          <p className="hx__who"><span className="hx__sig">Rushan Haque</span><i className="hx__sep" aria-hidden="true" /><Roles /></p>
          <p className="hx__where note"><span className="hx__pin" aria-hidden="true" />{site.city}, India <span className="hx__coord">{site.coords}</span></p>
        </div>
        <h1 className="hx__title">
          <Split>I design &amp; build websites <WorkPill /> for the <em>makers</em> <StarPill /> of beautiful things.</Split>
        </h1>
        <div className="hx__foot">
          <p className="hx__say">Interfaces, builds and the <em>client care</em> in between.</p>
          <div className="hx__cta">
            <Btn to="/work" variant="solid">See the work</Btn>
            <BookBtn />
          </div>
        </div>
      </div>
      <div className="hx__bar wrap">
        <dl className="hx__proof">
          {PROOF.map((s) => <div key={s.label}><dd className="pillar">{s.value}</dd><dt className="note">{s.label}</dt></div>)}
        </dl>
        <p className="hx__meta note" aria-hidden="true"><span className="hx__cue"><ArrowDown size={13} /> Scroll</span><span><Clock /> IST</span></p>
      </div>
    </section>
  )
}
