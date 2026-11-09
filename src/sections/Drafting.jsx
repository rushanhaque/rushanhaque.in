import { useRef } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { building } from '../data/content'
import Lens from '../components/Lens'
import Btn from '../components/Btn'
import Head from '../components/Head'

// Sites still being built. Each one shows the drawing it began as wherever you point.
export default function Drafting() {
  const root = useRef(null)
  useReveals(root)
  useChapter(root, {
    id: 'drafting',
    name: 'Currently building',
    time: [12, 13],
  })
  return (
    <section className="draft wrap" ref={root} id="drafting" data-tone="ivory">
      <Head label="On the drawing board" title={<>Currently <em>building</em></>} count={building.length} lede="Sites in progress right now, each a preview you can open today. Move across a site to see the drawing it began as." />
      <div className="draft__plates">
        {building.map((b, i) => (
          <article className={`draft__plate draft__plate--${i}`} key={b.slug}>
            <a href={b.url} target="_blank" rel="noopener noreferrer" data-r="plate" data-cursor="Open preview" aria-label={`${b.title}, open the preview`}>
              <Lens image={b.image} plan={b.plan} width={b.w} height={b.h} alt={`${b.title} home page`} radius={0.24} />
            </a>
            <div className="draft__info" data-r="stagger">
              <h3 className="h3">{b.title}</h3>
              <p className="small">{b.description}</p>
              <p className="note">{b.field}</p>
              <Btn href={b.url}>Open preview</Btn>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
