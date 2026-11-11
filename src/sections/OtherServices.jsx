import { useEffect, useRef, useState } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { services } from '../data/content'
import Btn from '../components/Btn'
import Head from '../components/Head'
import { ArrowLeft, ArrowRight } from '../components/glyphs'

const GLYPH = {
  design: 'M32 6 L46 38 L32 58 L18 38 Z M32 6 V33 M28 37 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M12 58 H52',
  code: 'M22 18 L8 32 L22 46 M42 18 L56 32 L42 46 M37 10 L27 54',
  bag: 'M12 22 H52 L48 57 H16 Z M23 22 V17 a9 9 0 0 1 18 0 V22 M22 31 a10 10 0 0 0 20 0',
  grid: 'M9 9 H28 V28 H9 Z M36 9 H55 V28 H36 Z M9 36 H28 V55 H9 Z M36 36 H55 V55 H36 Z',
  search: 'M9 27 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0 M40 40 L56 56',
  phone: 'M21 5 H43 a5 5 0 0 1 5 5 V54 a5 5 0 0 1 -5 5 H21 a5 5 0 0 1 -5 -5 V10 a5 5 0 0 1 5 -5 Z M28 51 H36',
  cloud: 'M17 47 a11 11 0 0 1 1 -21.9 a15 15 0 0 1 28.6 -2.2 a12 12 0 0 1 1.4 24.1 Z',
  spark: 'M32 5 V21 M32 43 V59 M5 32 H21 M43 32 H59 M13 13 L24 24 M40 40 L51 51 M51 13 L40 24 M24 40 L13 51',
  chat: 'M8 11 H56 V41 H29 L17 53 V41 H8 Z',
  play: 'M8 12 H56 V52 H8 Z M26 22 L42 32 L26 42 Z',
}
const two = (n) => String(n).padStart(2, '0')
const TOTAL = services.length + 1

// Other services, laid out like sheets on a drawing board. On wide screens the section holds still and the scroll
// slides the row along, and each pictogram is drawn as its sheet arrives. On a phone they become a column of compact
// rows, each one drawing its own pictogram as you reach it.
export default function OtherServices() {
  const root = useRef(null)
  const track = useRef(null)
  const row = useRef(null)
  const m = useRef({ wide: false, n: 3, w: 1, gap: 0, step: 1, cur: 0, last: -1, first: -1 })
  const [page, setPage] = useState({ at: 1, of: TOTAL })

  const show = (first) => {
    const s = m.current
    if (first === s.first) return
    s.first = first
    const cards = track.current.children
    for (let k = 0; k < cards.length; k++) {
      const on = k >= first && k < first + s.n
      cards[k].classList.toggle('is-on', on)
      if (on) cards[k].classList.add('is-drawn')
    }
    setPage({ at: first + 1, of: Math.max(1, TOTAL - s.n + 1) })
  }

  useEffect(() => {
    const el = root.current
    const s = m.current
    const size = () => {
      const view = row.current.clientWidth - (parseFloat(getComputedStyle(row.current).paddingLeft) || 0) * 2
      const vw = innerWidth
      s.wide = vw >= 900 && innerHeight >= 620 && !document.documentElement.classList.contains('static')
      s.n = vw >= 1200 ? 3 : vw >= 640 ? 2 : 1
      const pad = parseFloat(getComputedStyle(track.current).paddingLeft) || 0
      // on narrow screens the gap equals the margin, so the next sheet starts exactly off the edge
      s.gap = s.wide ? Math.max(14, Math.min(22, vw * 0.014)) : pad
      s.w = (view - pad * 2 - (s.n - 1) * s.gap) / s.n
      s.step = s.w + s.gap
      track.current.style.setProperty('--cw', `${s.w.toFixed(2)}px`)
      track.current.style.setProperty('--cg', `${s.gap.toFixed(2)}px`)
      el.style.height = s.wide ? `calc(100vh + ${(TOTAL - s.n) * 36}vh)` : ''
      if (s.wide) { s.last = -1 } else { track.current.style.transform = '' }
      s.first = -1
      // every sheet gives its words the same room, so the titles and text line up across the row
      const bodies = [...track.current.querySelectorAll('.osv__body')]
      track.current.style.setProperty('--osv-body', '0px')
      track.current.style.setProperty('--osv-body', `${Math.max(...bodies.map((b) => b.offsetHeight))}px`)
      show(s.wide ? Math.round(s.cur / s.step) : 0)
      watch()
    }
    // in a column, each sheet draws its own pictogram as it arrives
    let io = null
    const watch = () => {
      io?.disconnect()
      io = null
      if (s.wide) return
      io = new IntersectionObserver((list) => {
        for (const e of list) if (e.isIntersecting) { e.target.classList.add('is-on', 'is-drawn'); io.unobserve(e.target) }
      }, { rootMargin: '0px 0px -12% 0px' })
      for (const c of track.current.children) io.observe(c)
    }
    size()
    addEventListener('resize', size)
    document.fonts?.ready.then(size)
    let queued = false
    const onRow = () => {
      if (queued || s.wide) return
      queued = true
      requestAnimationFrame(() => { queued = false; show(Math.round(row.current.scrollLeft / s.step)) })
    }
    const r = row.current
    r.addEventListener('scroll', onRow, { passive: true })
    return () => { io?.disconnect(); removeEventListener('resize', size); r.removeEventListener('scroll', onRow) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useChapter(root, {
    id: 'services',
    name: 'Other services',
    time: [17.2, 18.2],
    frame: ({ stick }) => {
      const s = m.current
      if (!s.wide) return
      // the row slides along with the scroll, evenly, and stops where the scroll stops
      const goal = Math.min(1, Math.max(0, stick * 1.04 - 0.02)) * (TOTAL - s.n) * s.step
      s.cur += (goal - s.cur) * 0.3
      if (Math.abs(goal - s.cur) < 0.05) s.cur = goal
      if (s.cur === s.last) return
      s.last = s.cur
      track.current.style.transform = `translate3d(${(-s.cur).toFixed(1)}px,0,0)`
      show(Math.round(s.cur / s.step))
    },
  })
  useReveals(root)

  const swipe = (dir) => {
    const s = m.current
    row.current.scrollBy({ left: dir * s.step, behavior: 'smooth' })
  }

  return (
    <section className="osv" ref={root} id="services" data-tone="ivory">
      <div className="osv__stage pin__stage">
        <div className="wrap">
          <Head label="What else I do" title={<>Other <em>services</em></>} count={services.length} lede="Design and development lead, and the rest of what a business needs online comes with them, handled by the same person." />
        </div>
        <div className="osv__viewport" ref={row}>
          <ul className="osv__track" ref={track}>
            {services.map((s, i) => (
              <li className="osv__card" key={s.title}>
                <div className="osv__plate">
                  <span className="osv__no">{two(i + 1)}</span>
                  <span className="osv__of">{s.items[0]}</span>
                  <svg className="osv__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path pathLength="1" d={GLYPH[s.icon]} /></svg>
                  <i className="osv__tick" aria-hidden="true" />
                </div>
                <div className="osv__body">
                  <h3 className="osv__name">{s.title}</h3>
                  <p className="osv__text">{s.text}</p>
                  <ul className="osv__tags">{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              </li>
            ))}
            <li className="osv__card osv__card--cta" data-fixed="wine">
              <span className="osv__ctaNo note">Not on the list?</span>
              <p className="osv__ask">If it lives online, <em>ask me.</em></p>
              <Btn to="/contact" title="Contact" variant="solid">Start a conversation</Btn>
            </li>
          </ul>
        </div>
        <div className="osv__pager wrap">
          <span className="note">{two(page.at)} / {two(page.of)}</span>
          <span className="pager">
            <button type="button" onClick={() => swipe(-1)} disabled={page.at <= 1} aria-label="Previous services"><ArrowLeft size={16} /></button>
            <button type="button" onClick={() => swipe(1)} disabled={page.at >= page.of} aria-label="More services"><ArrowRight size={16} /></button>
          </span>
        </div>
      </div>
    </section>
  )
}
