import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { device } from '../lib/device'
import { small, srcSet } from '../lib/img'
import { products } from '../data/content'
import { TLink } from '../components/Transition'
import Btn from '../components/Btn'
import Head from '../components/Head'
import { ArrowRight, Check } from '../components/glyphs'

// Software for businesses to run on. Each screen rises off the desk and settles flat, with what it does
// beside it and how it goes underneath. It opens the product's own page.
export default function Workshop() {
  const root = useRef(null)
  useReveals(root)
  useChapter(root, { id: 'products', name: 'Products', time: [13, 15] })
  useGSAP(() => {
    const d = device()
    if (d.reduced) return
    gsap.utils.toArray('.prod__item', root.current).forEach((item) => {
      const frame = item.querySelector('.prod__frame')
      const stage = item.querySelector('.prod__stage')
      // on a phone the page scrolls on its own thread, so a frame reshaped by the scroll would shake:
      // there it rises once instead of following the finger
      if (d.touch) gsap.from(frame, { y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: stage, start: 'top 85%', once: true } })
      else gsap.fromTo(frame, { rotateX: 24, scale: 0.88, y: 60 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top 30%', scrub: 0.6 } })
      gsap.fromTo(item.querySelector('.prod__line'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: item.querySelector('.prod__steps'), start: 'top 85%', end: 'bottom 60%', scrub: 0.5 } })
    })
  }, { scope: root })

  return (
    <section className="prod wrap" ref={root} id="products" data-tone="ivory">
      <Head label="Software" title="Products" count={products.length} lede="Beyond websites: tools teams open every morning, for the jobs once done by hand." />
      {products.map((p, i) => (
        <article className={`prod__item ${i % 2 ? 'is-flip' : ''}`} key={p.slug}>
          <div className="prod__copy">
            <span className="prod__no note">{String(i + 1).padStart(2, '0')}, {p.field}</span>
            <h3 className="h2"><TLink to={`/products/${p.slug}`} title={p.short} className="prod__name">{p.title}</TLink></h3>
            <p className="prod__desc">{p.description}</p>
            <ul className="prod__does" data-r="deal" data-gap="0.07">
              {p.does.map((d) => <li key={d}><Check size={16} />{d}</li>)}
            </ul>
            <Btn to={`/products/${p.slug}`} title={p.short} variant="solid" icon={ArrowRight}>Explore the product and request a quote</Btn>
          </div>
          <div className="prod__stage">
            <TLink to={`/products/${p.slug}`} title={p.short} className="prod__frame" aria-label={`${p.title}: explore the product`} data-cursor="Explore" data-morph="">
              <span className="prod__bar" aria-hidden="true"><i /><i /><i /></span>
              <img src={small(p.image)} srcSet={srcSet(p.image)} sizes="(max-width: 899px) 92vw, 58vw" alt={`${p.title} interface`} width={p.w} height={p.h} loading="lazy" decoding="async" />
            </TLink>
          </div>
          <ol className="prod__steps" style={{ '--n': p.steps.length }}>
            <span className="prod__line" aria-hidden="true" />
            {p.steps.map((s, k) => (
              <li className="prod__step" key={s.title}>
                <span className="prod__dot">{k + 1}</span>
                <strong>{s.title}</strong>
                <span className="small">{s.text}</span>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </section>
  )
}
