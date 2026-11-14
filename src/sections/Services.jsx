import { useEffect, useRef } from 'react'
import { services } from '../data/content'
import { useReveals } from '../lib/reveal'
import { device } from '../lib/device'
import { ticker } from '../lib/motion'
import { A } from '../lib/router'
import Head from '../components/Head'
import { ArrowUpRight } from '../components/glyphs'

export const GLYPH = {
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

export function Glyph({ name, className = '' }) {
  return (
    <svg className={`glyph ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d={GLYPH[name]} pathLength="1" />
    </svg>
  )
}

// Where each service leads: its own page where the site has one, otherwise an enquiry that already names it.
const PAGE = {
  'UI/UX design': '/website-design-development',
  'Web development': '/web-application-development',
  'E-commerce & catalogues': '/ecommerce-website-development',
  'SEO & AI search': '/seo-services',
  'Digital marketing': '/landing-page-design',
}
const AREA = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const SHAPE = { 0: 'is-feature', 1: 'is-wide', 4: 'is-wide' }

// Everything else, laid out as one bench of tiles sized to the screen, so all of it is in view at once.
// A soft light follows the pointer across the bench, each pictogram is drawn as it arrives and again when you reach
// for it, and every tile leads somewhere useful.
export default function Services() {
  const root = useRef(null)
  const bench = useRef(null)
  useReveals(root)

  useEffect(() => {
    const d = device()
    if (!d.fine || d.reduced || d.tier === 'low') return undefined
    const el = bench.current
    let tile = null
    const p = { x: 0, y: 0 }
    const write = () => { ticker.remove(write); if (tile) { tile.style.setProperty('--mx', `${p.x}px`); tile.style.setProperty('--my', `${p.y}px`) } }
    const move = (e) => {
      const t = e.target.closest?.('.bento__tile')
      if (!t) return
      tile = t
      const r = t.getBoundingClientRect()
      p.x = Math.round(e.clientX - r.left)
      p.y = Math.round(e.clientY - r.top)
      ticker.add(write)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => { el.removeEventListener('pointermove', move); ticker.remove(write) }
  }, [])

  return (
    <section className="svc wrap" ref={root} id="services" data-tone="ivory" data-chapter="04" data-name="Other services">
      <Head no="04" label="Beyond the website" title={<>Other <em>services</em></>} count={services.length} lede="Ten disciplines, one standard: considered, measurable and built to last." />
      <ul className="bento" ref={bench} data-r="deal">
        {services.map((s, i) => {
          const page = PAGE[s.title]
          const to = page || `/contact?project=${encodeURIComponent(s.title)}`
          return (
            <li className={`bento__tile ${SHAPE[i] || ''}`} key={s.title} style={{ gridArea: AREA[i] }} {...(i === 0 ? { 'data-tone': 'wine' } : {})}>
              <A to={to} className="bento__link" data-cursor={page ? 'Explore' : 'Enquire'}>
                <span className="bento__top">
                  <Glyph name={s.icon} className="bento__glyph" />
                  <span className="bento__tag note"><span className="bento__no">{two(i + 1)}</span><span className="bento__go">{page ? 'Explore' : 'Enquire'}<ArrowUpRight size={13} /></span></span>
                </span>
                <div className="bento__body">
                  <h3 className="bento__name">{s.title}</h3>
                  <p className="bento__text">{s.text}</p>
                  {i === 0 && <p className="bento__pills">{s.items.map((t) => <span key={t}>{t}</span>)}</p>}
                </div>
              </A>
            </li>
          )
        })}
        <li className="bento__tile is-ask" style={{ gridArea: 'k' }}>
          <A to="/contact" className="bento__link" data-cursor="Write">
            <span className="bento__top"><span className="bento__tag note"><span className="bento__no">{two(services.length + 1)}</span></span></span>
            <div className="bento__body">
              <p className="bento__name">Something <em>else</em> in mind?</p>
              <span className="bento__cta">Tell me about it <i><ArrowUpRight size={15} /></i></span>
            </div>
          </A>
        </li>
      </ul>
    </section>
  )
}
