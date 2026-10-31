import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { site } from '../config/site'
import { experience, stats } from '../data/content'
import Head from '../components/Head'
import { Clock, Monogram } from '../components/Header'
import { Odometer } from '../components/Motion'
import Button from '../components/Button'

/**
 * 09 — About. A dossier: a profile card with the local time and availability, beside the facts and numbers.
 */
export default function Profile() {
  const root = useRef(null)
  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      gsap.from(q('.pro__card > *'), { y: 24, autoAlpha: 0, stagger: 0.07, duration: 1.1, scrollTrigger: { trigger: q('.pro__card')[0], start: 'top 80%', once: true } })
    },
    { scope: root },
  )
  const now = experience[0]
  const facts = [
    ['Now', `${now.role}, ${now.company}`],
    ['Studying', 'B.Tech CS (IoT), MIT Moradabad'],
    ['Based in', site.location],
    ['Focus', 'UI/UX design, client relationships, development'],
  ]
  return (
    <section className="pro sec" ref={root} data-theme="ivory" data-chapter="About" id="about">
      <div className="wrap">
        <Head n="09" label="Who I am" title={<em>About</em>} lede="A developer and writer from Moradabad, working with businesses in India and abroad." />
        <div className="pro__dossier">
          <aside className="pro__card" data-spot>
            <span className="pro__mark"><Monogram size={40} /></span>
            <div className="pro__who">
              <p className="pro__sig">Rushan <em>Haque</em></p>
              <p className="pro__role">{site.role}</p>
            </div>
            <ul className="pro__meta">
              <li><span>Local time</span><b><Clock /> IST</b></li>
              <li><span>Status</span><b className="status status--live"><i />Available for projects</b></li>
            </ul>
            <div className="pro__ctas">
              <Button to="/about" variant="solid">More about me</Button>
              <Button href={site.booking} variant="ghost" icon="calendar">Book a call</Button>
            </div>
          </aside>

          <div className="pro__main">
            <p className="pro__bio" data-reveal>I’m a developer and writer based in India, studying Computer Science (IoT). I specialise in UI/UX design, client relationships and the development work in between: discovery, interface design, builds, hosting and handover. I stay in touch long after a project goes live.</p>
            <dl className="pro__facts" data-stagger>
              {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            <div className="pro__stats">
              {stats.map((s) => (
                <div className="pro__stat" key={s.label}>
                  <Odometer value={s.value} suffix={s.suffix} className="pro__num" />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
