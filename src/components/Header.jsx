import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from '../lib/gsap'
import { scrollTo } from '../lib/lenis'
import { site } from '../config/site'
import { works } from '../data/content'
import { titleFor } from '../lib/pages'
import { TLink } from './Transition'
import Contents from './Contents'
import Icon from './Icon'

export function Clock({ tz = site.tz }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span className="clock">{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now)}</span>
}

export function Monogram({ size = 30 }) {
  return (
    <svg className="mono" width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M8 36V17a12 12 0 0 1 24 0v19" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 36V18a6 6 0 0 1 12 0v18" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <path d="M4 36h32" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

const DARK = ['night', 'wine']
const two = (n) => String(n).padStart(2, '0')
// what the running head reads before the first chapter, or on a page without chapters
const PAGE = (p) => {
  if (p === '/') return 'Introduction'
  if (p === '/work') return 'Selected work'
  if (p.startsWith('/work/')) return 'Case study'
  if (p === '/about') return 'About'
  if (p === '/contact') return 'Connect'
  const slug = p.slice(1)
  return titleFor(slug) || 'Page'
}
// a chapter that is itself pinned takes up the room its pin makes
const room = (s) => (s.parentElement?.classList.contains('pin-spacer') ? s.parentElement : s)

/**
 * The Folio. The header reads like the running head of a book: the name on the left folds to
 * initials once you leave the cover, the middle names the chapter you are in, and the bar's
 * bottom edge is a ruler of the whole page, a tick for every chapter. Hover the ruler and it
 * opens into a timeline you can click or drag to travel the page; Contents opens the book's
 * contents page.
 */
export default function Header() {
  const { pathname } = useLocation()
  const root = useRef(null)
  const ruler = useRef(null)
  const toc = useRef(null)
  const marks = useRef([])
  const [open, setOpen] = useState(false)
  const [tone, setTone] = useState('light')
  const [solid, setSolid] = useState(false)
  const [folded, setFolded] = useState(false)
  const [list, setList] = useState([])
  const [on, setOn] = useState(-1)
  const [head, setHead] = useState({ cur: null, prev: null })
  const [hover, setHover] = useState(null)

  // the bar takes the palette of the room under it
  useEffect(() => {
    const html = document.documentElement
    const read = () => setTone(DARK.includes(html.dataset.theme) ? 'dark' : 'light')
    read()
    const mo = new MutationObserver(read)
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  // where each chapter begins, as a share of the page; measured again whenever the page is
  const measure = useCallback(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const mid = window.innerHeight * 0.55
    const els = [...document.querySelectorAll('main [data-chapter]')]
    marks.current = els.map((s) => {
      const top = room(s).getBoundingClientRect().top + window.scrollY
      return { id: s.id, name: s.dataset.chapter, top, at: Math.min(1, Math.max(0, (top - mid) / max)) }
    })
    setList((prev) => {
      const next = marks.current.map(({ id, name, at }) => ({ id, name, at: Math.round(at * 10000) / 10000 }))
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    })
  }, [])

  // on scroll: fold the name, fill the ruler and name the chapter
  const track = useCallback(() => {
    const y = window.scrollY
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    const p = Math.min(1, y / max)
    root.current?.style.setProperty('--p', p.toFixed(4))
    setSolid(y > 8)
    setFolded(y > 80)
    let i = -1
    marks.current.forEach((m, k) => { if (p >= m.at - 0.0005) i = k })
    setOn(i)
  }, [])

  useEffect(() => {
    measure()
    track()
    const again = () => { measure(); track() }
    // the new page's scenes are built a moment after it mounts, and its images arrive later still
    const timers = [120, 600, 1500].map((t) => setTimeout(again, t))
    ScrollTrigger.addEventListener('refresh', again)
    // follows the same scroll updates as every scene on the page (Lenis drives them)
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: track })
    window.addEventListener('resize', again)
    return () => {
      timers.forEach(clearTimeout)
      ScrollTrigger.removeEventListener('refresh', again)
      st.kill()
      window.removeEventListener('resize', again)
    }
  }, [pathname, measure, track])

  // the running head rolls the old chapter out as the new one comes in
  const name = open ? 'Contents' : on >= 0 && list[on] ? list[on].name : PAGE(pathname)
  const no = open ? '§' : on >= 0 ? two(on + 1) : '—'
  useEffect(() => {
    setHead((h) => (h.cur?.name === name ? h : { cur: { name, no }, prev: h.cur }))
    const t = setTimeout(() => setHead((h) => ({ ...h, prev: null })), 700)
    return () => clearTimeout(t)
  }, [name, no])

  useEffect(() => setOpen(false), [pathname])
  const close = useCallback(() => { setOpen(false); toc.current?.focus({ preventScroll: true }) }, [])

  // the ruler: a click goes to the start of the chapter under it, a drag scrubs the page
  const drag = useRef(null)
  const at = (e) => {
    const r = ruler.current.getBoundingClientRect()
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  }
  const chapterAt = (f) => { let i = -1; list.forEach((m, k) => { if (f >= m.at) i = k }); return i }
  const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const onDown = (e) => {
    if (e.button !== 0) return
    ruler.current.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, moved: false }
  }
  const onMove = (e) => {
    const f = at(e)
    setHover({ f, i: chapterAt(f) })
    if (!drag.current) return
    if (Math.abs(e.clientX - drag.current.x) > 4) drag.current.moved = true
    if (drag.current.moved) scrollTo(f * max(), { immediate: true, force: true })
  }
  const onUp = (e) => {
    if (!drag.current) return
    const { moved } = drag.current
    drag.current = null
    if (moved) return
    const i = chapterAt(at(e))
    scrollTo(i >= 0 ? marks.current[i].top : 0, { duration: 1.6 })
  }

  const current = (url) => (pathname.startsWith(url) ? 'page' : undefined)
  const segs = [{ name: PAGE(pathname), at: 0, i: -1 }, ...list.map((m, i) => ({ ...m, i }))].filter((s, k, a) => k > 0 || (a[1]?.at ?? 1) > 0.002)
  return (
    <>
      <header ref={root} className={`fo ${solid && !open ? 'is-solid' : ''} ${folded && !open ? 'is-folded' : ''} ${open ? 'is-open' : ''}`} data-tone={open ? 'light' : tone}>
        <div className="fo__bar">
          <TLink to="/" className="fo__mark" label="Index" aria-label={`${site.name}, home`}>
            <span className="fo__w">R<span className="fo__fold"><span>ushan</span></span><span className="fo__dot" aria-hidden="true"><span>.</span></span></span>{' '}
            <em className="fo__w">H<span className="fo__fold"><span>aque</span></span><span className="fo__dot" aria-hidden="true"><span>.</span></span></em>
          </TLink>

          <p className="fo__head" aria-live="polite">
            <span className="fo__roll">
              {head.prev && <span className="fo__line is-out" key={`p${head.prev.name}`}><b>{head.prev.no}</b>{head.prev.name}</span>}
              {head.cur && <span className="fo__line is-in" key={`c${head.cur.name}`}><b>{head.cur.no}</b>{head.cur.name}</span>}
            </span>
          </p>

          <div className="fo__end">
            <nav className="fo__nav" aria-label="Main">
              <TLink to="/work" aria-current={current('/work')}>Work<sup>{two(works.length)}</sup></TLink>
              <TLink to="/about" aria-current={current('/about')}>About</TLink>
            </nav>
            <button ref={toc} type="button" className="fo__toc" aria-expanded={open} aria-controls="contents" onClick={() => setOpen((o) => !o)}>
              <span className="fo__toc-label" aria-hidden="true"><span>Contents</span><span>Close</span></span>
              <span className="sr-only">{open ? 'Close contents' : 'Open contents'}</span>
              <span className="fo__toc-ico" aria-hidden="true"><i /><i /></span>
            </button>
            <TLink to="/contact" className="fo__cta">Let’s talk <Icon name="arrowUpRight" size={14} /></TLink>
          </div>
        </div>

        <div
          className="fo__ruler"
          ref={ruler}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
          onPointerLeave={() => setHover(null)}
          style={hover ? { '--h': hover.f } : undefined}
        >
          <span className="fo__track" aria-hidden="true"><i className="fo__fill" /></span>
          <span className="fo__reader" aria-hidden="true" />
          {hover && <span className="fo__cursor" aria-hidden="true" />}
          {/* pointer travel only; Contents is the way through for keyboards and screen readers */}
          <ol className="fo__segs" aria-hidden="true">
            {segs.map((s, k) => {
              const end = segs[k + 1]?.at ?? 1
              return (
                <li key={s.name + k} style={{ left: `${s.at * 100}%`, width: `${(end - s.at) * 100}%` }} className={`${s.i === on ? 'is-on' : ''} ${hover && hover.i === s.i ? 'is-hover' : ''}`}>
                  <b>{s.i >= 0 ? two(s.i + 1) : '00'}</b><span>{s.name}</span>
                </li>
              )
            })}
          </ol>
        </div>
      </header>
      <Contents open={open} onClose={close} here={pathname === '/' && on >= 0 ? list[on]?.id : null} />
    </>
  )
}
