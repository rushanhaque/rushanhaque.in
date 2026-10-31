import { useEffect, useRef, useState, Fragment } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReveals } from '../lib/useReveals'
import { site } from '../config/site'
import { certifications, insights, languages, skills } from '../data/content'
import Library from '../sections/Library'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { Kicker } from '../components/Head'
import Icon from '../components/Icon'
import Journey from '../components/Journey'

const KINDS = ['All', ...new Set(certifications.map((c) => c.kind))]

/** A credential card; a soft light follows the cursor across the print. */
function Cred({ c, onOpen }) {
  const ref = useRef(null)
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
    ref.current.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  return (
    <button className="cred" ref={ref} onPointerMove={move} onClick={() => c.image && onOpen(c)} aria-label={`${c.title}${c.issuer ? `, ${c.issuer}` : ''}`}>
      <span className="cred__media">
        {c.image ? <img src={c.image} alt="" loading="lazy" /> : <span className="cred__seal">{c.issuer.split(' ')[0]}</span>}
        <span className="cred__glare" />
      </span>
      <span className="cred__kind">{c.kind}{c.date && ` · ${c.date}`}</span>
      <strong>{c.title}</strong>
      {c.issuer && <span className="cred__issuer">{c.issuer}</span>}
    </button>
  )
}

export default function About() {
  const root = useRef(null)
  const [kind, setKind] = useState('All')
  const [open, setOpen] = useState(null)
  useReveals(root, 'ivory')

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.timeline({ delay: 0.15 })
      .from(q('.ab__title .ch'), { yPercent: 120, rotateX: -90, stagger: 0.035, duration: 1.4 })
      .from(q('.ab__intro > *'), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1.1 }, 0.5)
  }, { scope: root })

  useEffect(() => {
    if (!open) return
    const key = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open])

  const [all, setAll] = useState(false)
  const matching = certifications.filter((c) => kind === 'All' || c.kind === kind)
  const list = all ? matching : matching.slice(0, 8)
  // the page below moves when the grid grows or shrinks, so the scroll triggers are measured again
  useEffect(() => { ScrollTrigger.refresh() }, [all, kind])
  return (
    <div className="page page--about" ref={root}>
      <section className="ab" data-theme="ivory">
        <div className="wrap ab__grid">
          <div className="ab__copy">
            <Kicker label="About" />
            <h1 className="ab__title" aria-label="Rushan Haque">
              {['Rushan', 'Haque'].map((w, k) => <Fragment key={w}>{k > 0 && ' '}<span className={`ab__w ${k ? 'is-em' : ''}`}>{w.split('').map((c, j) => <span className="ch" key={j}>{c}</span>)}</span></Fragment>)}
            </h1>
            <div className="ab__intro">
              <p className="ab__lede">My name means <em>light</em> — and that is the job, really: to bring good businesses into the light, where the people looking for them can find them.</p>
              <p>I’m a developer and writer based in India, studying Computer Science (IoT). I specialise in UI/UX design, client relationships and the development work in between: discovery, interface design, builds, hosting and handover. I stay in touch long after a project goes live.</p>
              <p>Most of my clients are makers in Moradabad, India’s City of Brass: export houses working in brass, copper and wood. And I write: research on what AI does to the way we think, a book contribution, and Urdu poetry.</p>
              <div className="ab__ctas"><Button to="/contact" variant="solid">Work with me</Button><Button href={site.booking} variant="ghost" icon="calendar">Book a call</Button></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ab__facts wrap" data-theme="ivory">
        <dl>
          <div data-reveal><dt>Based</dt><dd>{site.location}</dd></div>
          <div data-reveal data-delay="0.05"><dt>Languages</dt><dd>{languages.join(' · ')}</dd></div>
          <div data-reveal data-delay="0.1"><dt>Technical</dt><dd>{skills.Technical.join(' · ')}</dd></div>
          <div data-reveal data-delay="0.15"><dt>Professional</dt><dd>{skills.Professional.join(' · ')}</dd></div>
        </dl>
      </section>

      <Journey n="01" />

      <section className="creds wrap" data-theme="ivory" data-chapter="Credentials" id="credentials">
        <header className="creds__head">
          <Kicker n="02" label="Credentials" />
          <h2 data-split>Seventeen <em>certificates,</em> trainings &amp; simulations.</h2>
          <div className="lab__tabs" role="tablist">
            {KINDS.map((k) => <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? 'is-on' : ''} onClick={() => setKind(k)}>{k}<sup>{k === 'All' ? certifications.length : certifications.filter((c) => c.kind === k).length}</sup></button>)}
          </div>
        </header>
        <div className="creds__grid">{list.map((c) => <Cred key={c.title} c={c} onOpen={setOpen} />)}</div>
        <div className="creds__foot">
          <p className="creds__note">Job simulations are virtual experience programmes, not employment.</p>
          {matching.length > 8 && (
            <button type="button" className="creds__more" onClick={() => setAll((v) => !v)} aria-expanded={all}>
              {all ? 'Show fewer' : `Show all ${matching.length}`}<Icon name={all ? 'arrowUp' : 'arrowDown'} size={14} />
            </button>
          )}
        </div>
      </section>

      <Library id="writing" n="03" />

      <section className="notes wrap" data-theme="ivory" data-chapter="Notes on the craft" id="notes">
        <header className="notes__head"><Kicker n="04" label="Notes on the craft" /><h2 data-split>Three things I <em>believe.</em></h2></header>
        <div className="notes__grid">
          {insights.map((n, k) => (
            <article key={n.title} data-reveal data-delay={k * 0.08}>
              <span className="notes__tag">0{k + 1} — {n.tag}</span>
              <h3>{n.title}</h3>
              <p>{n.text}</p>
            </article>
          ))}
        </div>
      </section>

      <Footer />

      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={open.image} alt={open.title} />
            <figcaption><strong>{open.title}</strong><span>{[open.issuer, open.date].filter(Boolean).join(' · ')}</span></figcaption>
            <button className="lightbox__x" onClick={() => setOpen(null)} aria-label="Close"><Icon name="close" /></button>
          </figure>
        </div>
      )}
    </div>
  )
}

