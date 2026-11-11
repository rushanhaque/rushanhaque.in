import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import editable from '../data/editable.json'
import Head from '../components/Head'

const clients = editable.clients || []

// The clients, as a wall of small cards: a few rows of them, each one a logo, or the name until a logo has been
// uploaded in the admin. They arrive one after another as the wall comes into view, and nothing moves after that.
export default function Names() {
  const root = useRef(null)
  useReveals(root)
  useChapter(root, { id: 'clientele', name: 'Clientele', time: [15, 16] })

  return (
    <section className="names wrap" ref={root} id="clientele" data-tone="night">
      <Head label="Brands I work with" title="Clientele" count={clients.length} lede="Brands in India, Saudi Arabia, Poland and Nepal, most of them export houses selling to buyers in dozens of countries." />
      <ul className="logos" data-r="deal" data-gap="0.05">
        {clients.map((c) => (
          <li className={`logo ${c.tone === 'dark' ? 'logo--dark' : ''}`} key={c.name}>
            {c.logo
              ? <img src={c.logo} alt={c.name} loading="lazy" decoding="async" />
              : <span className="logo__name">{c.name}</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
