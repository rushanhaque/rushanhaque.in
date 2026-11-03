import { useRef } from 'react'
import { gsap, useGSAP, isTouch } from '../lib/gsap'
import { srcSet } from '../lib/img'
import { products } from '../data/content'
import { TLink } from '../components/Transition'
import Head from '../components/Head'
import Icon from '../components/Icon'

/** 03 — Products. Software for businesses to run on; each screen rises out of the desk and settles flat, and opens the product's own page. */
export default function Instruments() {
  const root = useRef(null)
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      q('.prod__item').forEach((item) => {
        const frame = item.querySelector('.prod__frame')
        // on a phone the page scrolls on its own thread, so a frame reshaped by the scroll lags a
        // frame behind and shakes; there it rises once instead of following the finger
        if (isTouch()) gsap.from(frame, { y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo', scrollTrigger: { trigger: item.querySelector('.prod__stage'), start: 'top 85%', once: true } })
        else gsap.fromTo(frame, { rotateX: 24, scale: 0.88, y: 60 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: item.querySelector('.prod__stage'), start: 'top bottom', end: 'top 30%', scrub: 0.6 } })
        gsap.timeline({ scrollTrigger: { trigger: item.querySelector('.prod__steps'), start: 'top 85%', end: 'bottom 60%', scrub: 0.5 } })
          .fromTo(item.querySelector('.prod__line'), { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
          .fromTo(item.querySelectorAll('.prod__step'), { opacity: 0.3 }, { opacity: 1, stagger: 0.3, ease: 'none' }, 0)
      })
    },
    { scope: root },
  )
  return (
    <section className="prod sec" ref={root} data-theme="ivory" data-chapter="Products" id="products">
      <div className="wrap">
        <Head n="03" label="Software" title={<em>Products</em>} count={products.length} lede="Beyond websites: tools that teams open every morning, built for the jobs people used to do by hand." />
        {products.map((p, i) => (
          <article className={`prod__item ${i % 2 ? 'is-flip' : ''}`} key={p.slug}>
            <div className="prod__copy">
              <span className="prod__no">{String(i + 1).padStart(2, '0')} · {p.field}</span>
              <h3><TLink to={`/products/${p.slug}`} label={p.title} className="prod__name">{p.title}</TLink></h3>
              <p>{p.description}</p>
              <ul className="prod__does" data-stagger>
                {p.does.map((d) => <li key={d}><Icon name="check" size={16} />{d}</li>)}
              </ul>
              <TLink to={`/products/${p.slug}`} label={p.title} className="prod__more">Explore the product and request a quote <Icon name="arrowRight" size={15} /></TLink>
            </div>
            <div className="prod__stage">
              <TLink to={`/products/${p.slug}`} label={p.title} className="prod__frame" data-spot aria-label={`${p.title}: explore the product`}>
                <span className="prod__bar" aria-hidden="true"><i /><i /><i /></span>
                <img src={p.image} srcSet={srcSet(p.image)} sizes="(max-width: 899px) 92vw, 58vw" alt={`${p.title} interface`} width={p.w} height={p.h} loading="lazy" decoding="async" />
              </TLink>
            </div>
            <ol className="prod__steps" style={{ '--n': p.steps.length }}>
              <span className="prod__line" aria-hidden="true" />
              {p.steps.map((s, k) => (
                <li className="prod__step" key={s.title}>
                  <span className="prod__dot">{k + 1}</span>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}
