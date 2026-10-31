import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from '../lib/gsap'
import { site } from '../config/site'
import { works } from '../data/content'
import { titleFor } from '../lib/pages'
import { TLink } from './Transition'
import Mark from './Logo'
import Icon from './Icon'

export function Clock({ tz = site.tz }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  return <span className="clock">{new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now)}</span>
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
 * bottom edge is a hairline that fills as you read down the page.
 */
export default function Header() {
  const { pathname } = useLocation()
  const root = useRef(null)
  const marks = useRef([])
  const [tone, setTone] = useState('light')
  const [solid, setSolid] = useState(false)
  const [folded, setFolded] = useState(false)
  const [list, setList] = useState([])
  const [on, setOn] = useState(-1)
  const [head, setHead] = useState({ cur: null, prev: null })

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
  const name = on >= 0 && list[on] ? list[on].name : PAGE(pathname)
  const no = on >= 0 ? two(on + 1) : '—'
  useEffect(() => {
    setHead((h) => (h.cur?.name === name ? h : { cur: { name, no }, prev: h.cur }))
    const t = setTimeout(() => setHead((h) => ({ ...h, prev: null })), 700)
    return () => clearTimeout(t)
  }, [name, no])

  const current = (url) => (pathname.startsWith(url) ? 'page' : undefined)
  return (
    <>
      <header ref={root} className={`fo ${solid ? 'is-solid' : ''} ${folded ? 'is-folded' : ''}`} data-tone={tone}>
        <div className="fo__bar">
          <TLink to="/" className="fo__mark" label="Index" aria-label={`${site.name}, home`}>
            <Mark size={30} />
            <span className="fo__fold"><span className="fo__name">Rushan Haque</span></span>
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
            <TLink to="/contact" className="fo__cta">Let’s talk <Icon name="arrowUpRight" size={14} /></TLink>
          </div>
        </div>

        {/* the reading line: how far down the page you are */}
        <div className="fo__ruler" aria-hidden="true">
          <span className="fo__track"><i className="fo__fill" /></span>
        </div>
      </header>
    </>
  )
}
