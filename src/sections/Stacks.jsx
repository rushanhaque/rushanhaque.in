import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { writings } from '../data/content'
import Head from '../components/Head'

const INK = ['paper', 'sand', 'stone', 'ink', 'paper', 'sand']

// Papers and books, standing on one shelf: every cover whole, and each one leans out as you reach for it.
export default function Stacks() {
  const root = useRef(null)
  useReveals(root)
  useChapter(root, { id: 'writing', name: 'Writing', time: [19.4, 20.6] })

  return (
    <section className="shelf wrap" ref={root} id="writing" data-tone="ivory">
      <Head label="Papers and books" title="Writing" count={writings.length} lede="Research on what AI does to the way we think, a book contribution, Urdu poetry, and a book on the architecture of thought." />
      <ul className="shelf__row" data-r="shelve">
        {writings.map((w, i) => {
          const inner = (
            <>
              <span className={`cover cover--${INK[i]}`}>
                <span className="cover__kind note">{w.kind}</span>
                <span className="cover__title pillar">{w.title}</span>
              </span>
              <span className="shelf__sub">{w.sub}</span>
              <span className="note">{[w.year, w.status].filter(Boolean).join(', ')}</span>
            </>
          )
          return (
            <li key={w.slug}>
              {w.url
                ? <a className="shelf__item" href={w.url} target="_blank" rel="noopener noreferrer" data-cursor="Read">{inner}</a>
                : <div className="shelf__item">{inner}</div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
