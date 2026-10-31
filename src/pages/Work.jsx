import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveals } from '../lib/useReveals'
import { works } from '../data/content'
import Footer from '../components/Footer'
import { Kicker } from '../components/Head'
import Showcase from '../components/Showcase'

/** Work: the client sites, one at a time, in a single browser window that wipes between them. */
export default function Work() {
  const root = useRef(null)
  useReveals(root, 'ivory')

  useGSAP(() => {
    gsap.from(root.current.querySelectorAll('.wk__title .ch'), { yPercent: 120, rotateX: -80, stagger: 0.04, duration: 1.4, delay: 0.2 })
  }, { scope: root })

  return (
    <div className="page page--work" ref={root}>
      <section className="wk" data-theme="ivory">
        <div className="wrap">
          <header className="wk__head">
            <Kicker label={`Work · ${works.length} client sites`} />
            <h1 className="wk__title" aria-label="Selected work">
              {'Selected work'.split('').map((c, i) => <span className="ch" key={i}>{c === ' ' ? ' ' : c}</span>)}
              <em className="wk__count">({String(works.length).padStart(2, '0')})</em>
            </h1>
            <p className="wk__lede" data-reveal>Websites for businesses that make beautiful things, each designed and built from the first conversation to launch. Scroll through them one at a time.</p>
          </header>
          <Showcase items={works} />
        </div>
      </section>
      <Footer />
    </div>
  )
}
