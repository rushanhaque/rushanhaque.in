import { useEffect, useRef, useState } from 'react'
import { site } from '../config/site'
import { stats, languages, skills } from '../data/content'
import { certifications } from '../data/live'
import editable from '../data/editable.json'
import { useReveals } from '../lib/reveal'
import { blur } from '../lib/img'
import { lockScroll, unlockScroll } from '../lib/scroll'
import Btn from '../components/Btn'
import Head from '../components/Head'
import Split from '../components/Split'
import Journey from '../components/Journey'
import ServeMap from '../components/ServeMap'
import { BookBtn } from '../components/Booking'
import { X } from '../components/glyphs'

const KINDS = ['All', ...new Set(certifications.map((c) => c.kind))]

function Cred({ c, onOpen }) {
  const inner = (
    <>
      <span className="cred__media card-pic">
        {c.image ? <img src={c.image} alt="" loading="lazy" decoding="async" style={blur(c.image)} /> : <span className="cred__seal pillar">{(c.issuer || c.title).split(' ')[0]}</span>}
      </span>
      <span className="note">{[c.kind, c.date].filter(Boolean).join(', ')}</span>
      <strong className="cred__t">{c.title}</strong>
      {c.issuer && <span className="small">{c.issuer.replace(' · ', ', ')}</span>}
    </>
  )
  return c.image
    ? <button type="button" className="cred" onClick={() => onOpen(c)} data-cursor="Open" data-r="card">{inner}</button>
    : <div className="cred" data-r="card">{inner}</div>
}

function Credentials({ no }) {
  const root = useRef(null)
  const shut = useRef(null)
  const [kind, setKind] = useState('All')
  const [open, setOpen] = useState(null)
  const [all, setAll] = useState(false)
  useReveals(root, [kind, all])
  const matching = certifications.filter((c) => kind === 'All' || c.kind === kind)
  const list = all ? matching : matching.slice(0, 8)
  useEffect(() => {
    if (!open) return undefined
    const back = document.activeElement
    lockScroll()
    shut.current?.focus()
    const key = (e) => e.key === 'Escape' && setOpen(null)
    addEventListener('keydown', key)
    return () => { unlockScroll(); removeEventListener('keydown', key); back?.focus?.() }
  }, [open])
  return (
    <section className="ab__sect wrap" ref={root} id="credentials" data-tone="ivory" data-chapter={no} data-name="Certificates">
      <Head no={no} label="Credentials" title={<>Seventeen <em>certificates,</em> trainings &amp; simulations.</>} />
      <div className="tabs" role="group" aria-label="Filter credentials">
        {KINDS.map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} className={kind === k ? 'is-on' : ''} onClick={() => { setKind(k); setAll(false) }}>
            {k}<sup>{k === 'All' ? certifications.length : certifications.filter((c) => c.kind === k).length}</sup>
          </button>
        ))}
      </div>
      <div className="creds" key={kind + all}>{list.map((c) => <Cred key={c.title} c={c} onOpen={setOpen} />)}</div>
      <div className="creds__foot">
        <p className="note">Job simulations are virtual experience programmes, not employment.</p>
        {matching.length > 8 && (
          <button type="button" className="tlink" onClick={() => setAll((v) => !v)} aria-expanded={all}>
            {all ? 'Show fewer' : `Show all ${matching.length}`}
          </button>
        )}
      </div>
      {open && (
        <div className="lightbox" data-tone="night" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
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
    </section>
  )
}

// Who I am: in brief, then the road so far, where I work, and what I have learned on the way.
export default function About() {
  const root = useRef(null)
  useReveals(root)
  return (
    <div className="ab">
      <div ref={root} data-tone="ivory" data-chapter="01" data-name="About">
        <header className="phead wrap ab__head">
          <p className="note phead__kick">About <i /></p>
          <h1 className="phead__title"><Split>Rushan <em>Haque</em></Split></h1>
          <p className="ab__role note">{site.role}, {site.location}</p>
        </header>
        <section className="ab__intro wrap grid">
          <div className="ab__bio">
            <p className="h3" data-r="sweep" data-start="1" data-end="0.97"><Split>{editable.aboutBio}</Split></p>
            <div className="ab__cta">
              <Btn to="/contact" variant="solid">Work with me</Btn>
              <BookBtn />
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
            <div key={s.label} className="ab__stat" data-r="up">
              <dd className="pillar"><span data-r="count" data-value={s.value}>{s.value}</span>{s.suffix}</dd>
              <dt className="small">{s.label.replace(' - ', ': ')}</dt>
            </div>
          ))}
        </dl>
      </div>
      <Journey no="02" />
      <ServeMap no="03" />
      <Credentials no="04" />
    </div>
  )
}
