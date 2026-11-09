import { useEffect, useRef, useState } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { site, localTime } from '../config/site'
import { experience } from '../data/content'
import editable from '../data/editable.json'
import Btn from '../components/Btn'
import Head from '../components/Head'
import { CalendarBlank } from '../components/glyphs'

function LocalTime() {
  const [t, setT] = useState('')
  useEffect(() => {
    const up = () => setT(localTime())
    up()
    const i = setInterval(up, 15000)
    return () => clearInterval(i)
  }, [])
  return <>{t || '--:--'}</>
}

// Who this is, in his own words.
export default function Study() {
  const root = useRef(null)
  useReveals(root)
  useChapter(root, {
    id: 'about',
    name: 'About',
    time: [20.6, 22],
  })
  const now = experience[0]
  const facts = [
    ['Now', `${now.role}, ${now.company}`],
    ['Studying', 'B.Tech CS (IoT), MIT Moradabad'],
    ['Based in', site.location],
    ['Focus', 'UI/UX design, client relationships, development'],
  ]
  return (
    <section className="study wrap" ref={root} id="about" data-tone="night">
      <Head label="Who I am" title="About" lede="A developer and writer from Moradabad, working with businesses in India and abroad." />
      <div className="grid study__grid">
        <div className="study__main">
                    <p className="study__bio h3" data-r="sweep" data-start="top 82%" data-end="bottom 60%">{editable.aboutBio}</p>
          <div className="study__cta" data-r="fade">
            <Btn to="/about" variant="solid" title="About">More about me</Btn>
            <Btn href={site.booking} icon={CalendarBlank}>Book a call</Btn>
          </div>
        </div>
        <dl className="study__facts" data-r="stagger">
          {facts.map(([k, v]) => <div key={k}><dt className="note">{k}</dt><dd>{v}</dd></div>)}
          <div><dt className="note">Local time</dt><dd><LocalTime /> IST</dd></div>
          <div><dt className="note">Status</dt><dd className="lit">Available for projects</dd></div>
        </dl>
      </div>
    </section>
  )
}
