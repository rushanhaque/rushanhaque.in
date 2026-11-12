import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { site } from '../config/site'
import { certifications, stats, languages, skills, writings } from '../data/content'
import editable from '../data/editable.json'
import Btn from '../components/Btn'
import Footer from '../components/Footer'
import Head from '../components/Head'
import Journey from '../components/Journey'
import { ArrowUpRight, CalendarBlank, X } from '../components/glyphs'

const KINDS = ['All', ...new Set(certifications.map((c) => c.kind))]

function Cred({ c, onOpen }) {
  const inner = (
    <>
      <span className="cred__media">
        {c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" /> : <span className="cred__seal pillar">{(c.issuer || c.title).split(' ')[0]}</span>}
      </span>
      <span className="note">{[c.kind, c.date].filter(Boolean).join(', ')}</span>
      <strong className="cred__t">{c.title}</strong>
      {c.issuer && <span className="small">{c.issuer.replace(' · ', ', ')}</span>}
    </>
  )
  return c.image
    ? <button type="button" className="cred" onClick={() => onOpen(c)} data-cursor="Open">{inner}</button>
    : <div className="cred">{inner}</div>
}

export default function About() {
  const root = useRef(null)
  const shut = useRef(null)
  const [kind, setKind] = useState('All')
  const [open, setOpen] = useState(null)
  const [all, setAll] = useState(false)
  useMeta({ title: 'About. Rushan Haque', description: 'Rushan Haque is a website designer, full-stack developer and writer based in Moradabad, India.', path: '/about' })
  useReveals(root)
  useChapter(root, { id: 'about-page', name: 'About', hidden: true, time: [15, 18] })
  const matching = certifications.filter((c) => kind === 'All' || c.kind === kind)
  const list = all ? matching : matching.slice(0, 8)
  useEffect(() => { ScrollTrigger.refresh() }, [all, kind])
  useEffect(() => {
    if (!open) return undefined
    const back = document.activeElement
    shut.current?.focus()
    const key = (e) => e.key === 'Escape' && setOpen(null)
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); back?.focus?.() }
  }, [open])

  return (
    <div className="ab" ref={root}>
      <div data-tone="ivory">
      <header className="phead wrap">
        <div className="phead__title">
          <h1 className="h1">Rushan Haque</h1>
        </div>
      </header>

      <section className="ab__intro wrap grid">
        <div className="ab__bio">
          <p className="h3" data-r="sweep" data-start="top 88%" data-end="bottom 62%">{editable.aboutBio}</p>
          <div className="ab__cta">
            <Btn to="/contact" variant="solid" title="Contact">Work with me</Btn>
            <Btn href={site.booking} icon={CalendarBlank}>Book a call</Btn>
          </div>
        </div>
        <dl className="ab__facts" data-r="stagger">
          <div><dt className="note">Based in</dt><dd>{site.location}</dd></div>
          <div><dt className="note">Languages</dt><dd>{languages.join(', ')}</dd></div>
          <div><dt className="note">Technical</dt><dd>{skills.Technical.join(', ')}</dd></div>
          <div><dt className="note">Professional</dt><dd>{skills.Professional.join(', ')}</dd></div>
        </dl>
      </section>

      <dl className="ab__stats wrap grid">
        {stats.map((s) => (
          <div key={s.label} className="ab__stat" data-r="fade">
            <dd className="pillar"><span data-r="count" data-value={s.value}>{s.value}</span>{s.suffix}</dd>
            <dt className="small">{s.label.replace(' - ', ': ')}</dt>
          </div>
        ))}
      </dl>
      </div>

      <Journey />

      <section className="ab__sect wrap" id="credentials" data-tone="ivory">
        <Head label="Credentials" title={<>Seventeen <em>certificates,</em> trainings &amp; simulations.</>} />
        <div className="tabs" role="group" aria-label="Filter credentials">
          {KINDS.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} className={kind === k ? 'is-on' : ''} onClick={() => { setKind(k); setAll(false) }}>
              {k}<sup>{k === 'All' ? certifications.length : certifications.filter((c) => c.kind === k).length}</sup>
            </button>
          ))}
        </div>
        <div className="creds">{list.map((c) => <Cred key={c.title} c={c} onOpen={setOpen} />)}</div>
        <div className="creds__foot">
          <p className="note">Job simulations are virtual experience programmes, not employment.</p>
          {matching.length > 8 && (
            <button type="button" className="tlink" onClick={() => setAll((v) => !v)} aria-expanded={all}>
              {all ? 'Show fewer' : `Show all ${matching.length}`}
            </button>
          )}
        </div>
      </section>

      <section className="ab__sect wrap" data-tone="ivory">
        <Head label="Papers and books" title="Writing" />
        <ul className="wlist">
          {writings.map((w) => {
            const body = (
              <>
                <span className="h4">{w.title}</span>
                <span className="small">{w.sub}</span>
                <span className="note">{w.kind}, {w.year}</span>
                {w.url && <ArrowUpRight className="wlist__go" size={17} aria-hidden="true" />}
              </>
            )
            return <li key={w.slug} data-r="fade">{w.url ? <a className="wlist__row" href={w.url} target="_blank" rel="noopener noreferrer" data-cursor="Read">{body}</a> : <div className="wlist__row">{body}</div>}</li>
          })}
        </ul>
      </section>

      <Footer dark />

      {open && (
        <div className="lightbox" data-fixed="night" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={open.image} alt={open.title} />
            <figcaption>
              <strong>{open.title}</strong>
              <span className="note">{[open.issuer?.replace(' · ', ', '), open.date].filter(Boolean).join(', ')}</span>
            </figcaption>
            <button type="button" ref={shut} className="lightbox__x" onClick={() => setOpen(null)} aria-label="Close"><X size={18} /></button>
          </figure>
        </div>
      )}
    </div>
  )
}
