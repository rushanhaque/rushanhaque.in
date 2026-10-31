import { useEffect, useRef, useState } from 'react'
import { writings } from '../data/content'
import Head from '../components/Head'
import Icon from '../components/Icon'

/**
 * 08 — Writing. Papers, notes and books stand on a shelf as 3D volumes — cover, spine, page
 * block. Hover or focus one and it turns to face you; on phones, swipe along the shelf.
 */
export default function Library({ id = 'writing', n = '08' }) {
  const [sel, setSel] = useState(0)
  const shelf = useRef(null)
  const b = writings[sel]
  useEffect(() => {
    if (window.innerWidth >= 1000) return
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setSel(+e.target.dataset.i)), { root: shelf.current, rootMargin: '0px -42% 0px -42%', threshold: 0 })
    shelf.current.querySelectorAll('.lib__slot').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <section className="lib sec" data-theme="stone" data-chapter="Writing" id={id}>
      <div className="wrap">
        <Head n={n} label="Papers and books" title={<em>Writing</em>} count={writings.length} lede="Research on what AI does to the way we think, a book contribution, Urdu poetry — and a book on the architecture of thought, in progress." />
        <div className="lib__room">
          <ul className="lib__shelf" ref={shelf} aria-label="Writing">
            {writings.map((w, i) => (
              <li className="lib__slot" key={w.slug} data-i={i}>
                <button
                  className={`book ${i === sel ? 'is-sel' : ''}`}
                  style={{ '--c': w.color, '--ink': w.ink, '--t': `${22 + (i % 3) * 7}px`, '--h': `${200 + ((i * 37) % 44)}px` }}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  onClick={() => setSel(i)}
                  aria-pressed={i === sel}
                >
                  <span className="book__body">
                    <span className="book__cover">
                      <small>{w.kind}</small>
                      <strong>{w.title}</strong>
                      <span className="book__rule" />
                      <span className="book__author">Rushan Haque</span>
                    </span>
                    <span className="book__spine"><span>{w.title}</span></span>
                    <span className="book__pages" />
                    <span className="book__back" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <article className="lib__detail" key={b.slug} aria-live="polite">
            <div className="lib__meta"><span>{b.kind}</span><span>{b.year}</span><span className={`status ${b.status === 'Published' ? 'status--live' : 'status--wip'}`}><i />{b.status}</span></div>
            <h3>{b.title}</h3>
            <p className="lib__sub">{b.sub}</p>
            <p className="lib__text">{b.text}</p>
            {b.url ? (
              <a className="lib__link" href={b.url} target="_blank" rel="noopener noreferrer">Read it <Icon name="arrowUpRight" size={14} /></a>
            ) : (
              <span className="lib__link is-muted">Coming soon</span>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
