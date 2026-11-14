import { useEffect, useRef } from 'react'
import editable from '../data/editable.json'
import { useReveals } from '../lib/reveal'
import Head from '../components/Head'

const clients = editable.clients || []
const FACTS = [['11', 'Brands'], ['4', 'Countries'], ['40+', 'Projects']]

// Clientele, on a pair of rails that drift past one another and never end. A rail arranges itself: it takes whatever
// the admin adds and simply runs longer. Each row holds its names twice over, so the loop is one CSS transform with
// no seam, run by the compositor; it holds still under the pointer, and stops whenever it is off screen.
export default function Clientele() {
  const root = useRef(null)
  const rail = useRef(null)
  useReveals(root)
  useEffect(() => {
    const el = rail.current
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-off', !e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const rows = [clients.filter((_, i) => i % 2 === 0), clients.filter((_, i) => i % 2 === 1)]
  return (
    <section className="names" ref={root} id="clientele" data-tone="ivory" data-chapter="05" data-name="Clientele">
      <div className="wrap">
        <Head no="05" label="In good company" title="Clientele" count={clients.length} lede="Brands across India, Saudi Arabia, Poland and Nepal, most of them export houses selling to buyers in dozens of countries." />
      </div>
      <div className="rail is-off" ref={rail} data-r="lift">
        {rows.map((row, k) => (
          <ul className={`rail__row ${k ? 'is-back' : ''}`} key={k} style={{ '--n': row.length }}>
            {Array.from({ length: 2 * Math.max(1, Math.ceil(2200 / Math.max(1, row.length * 160))) }).map((_, copy) => row.map((c) => (
              <li className={`plate ${c.tone === 'dark' ? 'plate--dark' : ''}`} key={`${c.name}-${copy}`} data-copy={copy ? '' : undefined} aria-hidden={copy ? 'true' : undefined}>
                {c.logo ? <img src={c.logo} alt={copy ? '' : c.name} loading="lazy" decoding="async" /> : <span className="plate__name">{c.name}</span>}
              </li>
            )))}
          </ul>
        ))}
      </div>
      <dl className="names__facts wrap" data-r="stagger">
        {FACTS.map(([v, l]) => <div key={l}><dd className="pillar">{v}</dd><dt className="note">{l}</dt></div>)}
      </dl>
    </section>
  )
}
