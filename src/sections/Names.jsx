import { useEffect, useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import editable from '../data/editable.json'
import Head from '../components/Head'

const clients = editable.clients || []

// Clientele, on a pair of rails that drift past one another and never end.
//
// A wall of cards has to be arranged, and it looks sparse at eleven names and cramped at thirty. A rail arranges
// itself: it takes whatever the admin adds and simply runs longer. The two rows travel opposite ways, which reads
// as a procession rather than a list, and it is the same thing on a phone as on a desktop — no grid to collapse.
//
// Each row holds its names twice over, so the loop can be a single transform with no seam, and the second copy is
// hidden from anyone reading the page. It holds still under the pointer so a name can be read, and it stops
// altogether whenever it is off screen, so a page nobody is looking at costs nothing.
export default function Names() {
  const root = useRef(null)
  const rail = useRef(null)
  useReveals(root)
  useChapter(root, { id: 'clientele', name: 'Clientele', time: [15, 16] })

  useEffect(() => {
    const el = rail.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-off', !e.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const rows = [clients.filter((_, i) => i % 2 === 0), clients.filter((_, i) => i % 2 === 1)]

  return (
    <section className="names" ref={root} id="clientele" data-tone="night">
      <div className="wrap">
        <Head label="Brands I work with" title="Clientele" count={clients.length} lede="Brands in India, Saudi Arabia, Poland and Nepal, most of them export houses selling to buyers in dozens of countries." />
      </div>
      <div className="rail is-off" ref={rail} data-r="lift">
        {rows.map((row, k) => (
          // Each half of a rail has to be at least a screen wide, or the loop shows daylight behind it when it
          // comes round. A short list is simply repeated until it is.
          <ul className={`rail__row ${k ? 'is-back' : ''}`} key={k} style={{ '--n': row.length }}>
            {Array.from({ length: 2 * Math.max(1, Math.ceil(2200 / Math.max(1, row.length * 160))) }).map((_, copy) => row.map((c) => (
              <li
                className={`plate ${c.tone === 'dark' ? 'plate--dark' : ''}`}
                key={`${c.name}-${copy}`}
                data-copy={copy ? '' : undefined}
                aria-hidden={copy ? 'true' : undefined}
              >
                {c.logo
                  ? <img src={c.logo} alt={copy ? '' : c.name} loading="lazy" decoding="async" />
                  : <span className="plate__name">{c.name}</span>}
              </li>
            )))}
          </ul>
        ))}
      </div>
    </section>
  )
}
