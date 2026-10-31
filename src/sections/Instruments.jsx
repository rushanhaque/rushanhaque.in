import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { srcSet } from '../lib/img'
import { products } from '../data/content'
import { TLink } from '../components/Transition'
import Head from '../components/Head'
import Icon from '../components/Icon'

/** 03 — Products. Software for businesses to run on; each screen rises out of the desk and settles flat. */
export default function Instruments() {
  const root = useRef(null)
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      q('.prod__item').forEach((item) => {
        const frame = item.querySelector('.prod__frame')
        gsap.fromTo(frame, { rotateX: 24, scale: 0.88, y: 60 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: item.querySelector('.prod__stage'), start: 'top bottom', end: 'top 30%', scrub: 0.6 } })
        gsap.timeline({ scrollTrigger: { trigger: item.querySelector('.prod__steps'), start: 'top 85%', end: 'bottom 60%', scrub: 0.5 } })
          .fromTo(item.querySelector('.prod__line'), { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
          .fromTo(item.querySelectorAll('.prod__step'), { opacity: 0.3 }, { opacity: 1, stagger: 0.3, ease: 'none' }, 0)
      })
    },
    { scope: root },
  )
  return (
    <section className="prod sec" ref={root} data-theme="stone" data-chapter="Products" id="products">
      <div className="wrap">
        <Head n="03" label="Software" title={<em>Products</em>} count={products.length} lede="Beyond websites: tools that teams open every morning, built for the jobs people used to do by hand." />
        {products.map((p, i) => (
          <article className={`prod__item ${i % 2 ? 'is-flip' : ''}`} key={p.slug}>
            <div className="prod__copy">
              <span className="prod__no">{String(i + 1).padStart(2, '0')} · {p.field}</span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <ul className="prod__does" data-stagger>
                {p.does.map((d) => <li key={d}><Icon name="check" size={16} />{d}</li>)}
              </ul>
              <TLink to={`/work/${p.slug}`} className="prod__link">Read the case <Icon name="arrowRight" size={14} /></TLink>
            </div>
            <div className="prod__stage">
              <div className="prod__frame" data-spot>
                <div className="prod__bar" aria-hidden="true"><i /><i /><i /></div>
                <img src={p.image} srcSet={srcSet(p.image)} sizes="(max-width: 899px) 92vw, 58vw" alt={`${p.title} interface`} width={p.w} height={p.h} loading="lazy" decoding="async" />
              </div>
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
