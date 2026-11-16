import { useRef } from 'react'
import { building } from '../data/live'
import { useReveals } from '../lib/reveal'
import Lens from '../components/Lens'
import { small, srcSet, blur } from '../lib/img'
import Btn from '../components/Btn'
import Head from '../components/Head'

// Sites still being built. Each one shows the drawing it began as wherever you point.
export default function Building() {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="draft wrap" ref={root} id="drafting" data-tone="ivory" data-chapter="02" data-name="Currently building">
      <Head no="02" label="On the drafting table" title={<>Currently <em>building</em></>} count={building.length} lede="Work in progress, open to preview today. Sweep across a site to see the drawing beneath it." />
      <div className="draft__plates">
        {building.map((b, i) => (
          <article className="draft__plate" key={b.slug} data-r="card" style={{ '--d': `${i * 0.12}s` }}>
            <a href={b.url} target="_blank" rel="noopener noreferrer" className="draft__pic card-pic" data-cursor="Open preview" aria-label={`${b.title}, open the preview`}>
              {b.plan ? <Lens image={b.image} plan={b.plan} width={b.w} height={b.h} alt={`${b.title} home page`} /> : <img className="draft__img" src={small(b.image)} srcSet={srcSet(b.image)} sizes="(max-width: 899px) 92vw, 46vw" alt={`${b.title} home page`} width={b.w} height={b.h} loading="lazy" decoding="async" style={blur(b.image)} />}
            </a>
            <div className="draft__info card-txt">
              <p className="note draft__sheet"><span className="draft__pulse" aria-hidden="true" />In progress <span>Sheet {b.sheet}</span></p>
              <h3 className="h3">{b.title}</h3>
              <p className="small">{b.description} <span className="draft__field">{b.field}</span></p>
              <Btn href={b.url}>Open preview</Btn>
            </div>
            <span className="draft__no pillar" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
