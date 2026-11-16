import { useRef } from 'react'
import { products } from '../data/live'
import { useReveals } from '../lib/reveal'
import { small, srcSet, blur } from '../lib/img'
import { A } from '../lib/router'
import Btn from '../components/Btn'
import Head from '../components/Head'
import { ArrowRight, Check } from '../components/glyphs'

// A product with its own page opens it; one added in the admin opens its own site.
const Go = ({ p, children, ...rest }) => (p.to ? <A to={p.to} {...rest}>{children}</A> : <a href={p.href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>)

// Software for businesses to run on. Each screen rises off the desk and settles flat as it comes up the page (a
// scroll-driven CSS animation, off the main thread), with what it does beside it and how it goes underneath.
export default function Products() {
  const root = useRef(null)
  useReveals(root)
  return (
    <section className="prod wrap" ref={root} id="products" data-tone="ivory" data-chapter="03" data-name="Products">
      <Head no="03" label="Software" title={<>In-house <em>products</em></>} count={products.length} lede="Beyond websites: tools teams open every morning, for work once done by hand." />
      {products.map((p, i) => (
        <article className={`prod__item ${i % 2 ? 'is-flip' : ''}`} key={p.slug}>
          <div className="prod__copy">
            <span className="prod__no note">{String(i + 1).padStart(2, '0')}, {p.field}</span>
            <h3 className="h2"><Go p={p} className="prod__name">{p.title}</Go></h3>
            <p className="prod__desc">{p.description}</p>
            {p.does.length > 0 && (
              <ul className="prod__does" data-r="deal">
                {p.does.map((d) => <li key={d}><Check size={16} />{d}</li>)}
              </ul>
            )}
            {p.to ? <Btn to={p.to} variant="solid" icon={ArrowRight}>{p.to.startsWith('/products/') ? 'Explore and request a quote' : 'Ask about it'}</Btn> : <Btn href={p.href} variant="solid">Open the product</Btn>}
          </div>
          <div className="prod__stage">
            <Go p={p} className="prod__frame" aria-label={`${p.title}: explore the product`} data-cursor="Explore" tabIndex={-1}>
              <span className="prod__bar" aria-hidden="true"><i /><i /><i /></span>
              <img src={small(p.image)} srcSet={srcSet(p.image)} sizes="(max-width: 899px) 92vw, 58vw" alt={`${p.title} interface`} width={p.w} height={p.h} loading="lazy" decoding="async" style={blur(p.image)} />
            </Go>
          </div>
          {p.steps.length > 0 && <ol className="prod__steps" style={{ '--n': p.steps.length }} data-r="stagger">
            {p.steps.map((s, k) => (
              <li className="prod__step" key={s.title}>
                <span className="prod__dot">{k + 1}</span>
                <strong>{s.title}</strong>
                <span className="small">{s.text}</span>
              </li>
            ))}
          </ol>}
        </article>
      ))}
    </section>
  )
}
