import { useRef, useState } from 'react'
import { useChapter } from '../lib/director'
import { useReveals } from '../lib/reveal'
import { useMeta } from '../lib/meta'
import { site } from '../config/site'
import { faq } from '../data/content'
import { contactKind, mailto, send, whatsapp } from '../lib/forms'
import Btn from '../components/Btn'
import Footer from '../components/Footer'
import Head from '../components/Head'
import { CalendarBlank, CheckCircle, EnvelopeSimple, Plus, WhatsappLogo, ArrowUpRight } from '../components/glyphs'

function ContactForm() {
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState(() => {
    if (typeof window === 'undefined') return ''
    const p = new URLSearchParams(location.search)
    return (p.get('message') || (p.get('project') ? `About: ${p.get('project')}` : '')).slice(0, 1500)
  })
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)
  const value = contact.trim()
  const kind = contactKind(value)
  const summary = () => [`${kind === 'phone' ? 'Phone' : 'Email'}: ${value}`, message.trim() ? `\n${message.trim()}` : ''].join('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setFallback(false)
    if (!kind) return setError('Enter an email address or a phone number so I can reach you.')
    setBusy(true)
    try {
      await send({ _subject: `New message from ${value}`, ...(kind === 'email' ? { _replyto: value, email: value } : { phone: value }), _gotcha: trap, form: 'contact', message: message.trim() || '(no message)' })
      setDone(true)
    } catch (err) {
      setError(err.message)
      setFallback(!!err.fallback)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="form form--done" role="status">
        <CheckCircle size={36} aria-hidden="true" />
        <h2 className="h3">Got it, thank you.</h2>
        <p className="small">I will reach out on <b>{value}</b>, usually within a day.</p>
        <button type="button" className="tlink" onClick={() => { setDone(false); setContact(''); setMessage('') }}>Send another</button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <label className="field"><span>Email or phone</span>
        <input value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" inputMode="email" maxLength={120} required aria-invalid={!!error && !kind} />
      </label>
      <label className="field"><span>Anything I should know? <small>Optional</small></span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1500} placeholder="What you are building, a deadline, a link, or nothing at all." />
      </label>
      <input className="trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {error && <p className="form__err" role="alert">{error}</p>}
      {fallback ? (
        <div className="form__alt">
          <Btn href={mailto(summary())} variant="solid">Send by email</Btn>
          <Btn href={whatsapp(summary())}>Send on WhatsApp</Btn>
        </div>
      ) : (
        <Btn type="submit" variant="solid" disabled={busy}>{busy ? 'Sending' : 'Send'}</Btn>
      )}
      <p className="note">I read everything myself and reply within a day.</p>
    </form>
  )
}

function CopyEmail() {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setDone(true)
      setTimeout(() => setDone(false), 2200)
    } catch {
      location.href = `mailto:${site.email}`
    }
  }
  return <button type="button" className="tlink" onClick={copy} aria-live="polite">{done ? 'Email address copied' : 'Copy email address'}</button>
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq wrap" data-tone="ivory">
      <Head label="Questions" title={<>Asked <em>often</em></>} />
      <ul className="faq__list">
        {faq.map((f, i) => (
          <li key={f.q} className={open === i ? 'is-open' : ''}>
            <h3>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <Plus size={18} aria-hidden="true" />
              </button>
            </h3>
            <div className="faq__a"><div><p className="small">{f.a}</p></div></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// The easiest page on the site to leave a note on.
export default function Contact() {
  const root = useRef(null)
  useMeta({ title: 'Contact. Rushan Haque', description: 'Write to Rushan Haque about a website, a store or software. He replies to everything himself, usually within a day.', path: '/contact' })
  useReveals(root)
  useChapter(root, { id: 'contact', name: 'Contact', hidden: true, time: [6.9, 9] })
  return (
    <div className="cn" ref={root}>
      <section className="cn__top" aria-labelledby="cn-title" data-tone="ivory">
        {/* Moradabad's real roads, railways and the Ramganga, drawn from OpenStreetMap (scripts/build-contact-map.mjs) */}
        <div className="cn-map" aria-hidden="true">
          <img src="/img/bg/moradabad.svg" alt="" width="2000" height="1547" decoding="async" />
          <span className="cn-pin"><i /><b className="note">Moradabad<span>28.84° N, 78.77° E</span></b></span>
        </div>
        <small className="cn-credit">Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</small>
        <div className="cn__in wrap grid">
          <div className="cn__say">
            <span className="cn-kicker">Connect</span>
            <h1 className="h1" id="cn-title">So, what are we <em>building?</em></h1>
            <p className="lede">A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.</p>
            <div className="cn__direct">
              <a className="cn-card is-primary" data-fixed="wine" href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer">
                <span className="cn-icon"><WhatsappLogo size={22} /></span>
                <span className="cn-text"><small>WhatsApp, fastest</small><strong>{site.phone.label}</strong></span>
                <ArrowUpRight size={20} className="cn-go" />
              </a>
              <a className="cn-card" href={`mailto:${site.email}?subject=Hello%20from%20your%20site`}>
                <span className="cn-icon"><EnvelopeSimple size={22} /></span>
                <span className="cn-text"><small>Email</small><strong>{site.email}</strong></span>
                <ArrowUpRight size={20} className="cn-go" />
              </a>
              <div className="cn__row">
                <Btn href={site.booking} icon={CalendarBlank}>Book a call</Btn>
                <CopyEmail />
              </div>
            </div>
            <p className="cn__meta">{site.location}</p>
          </div>
          <div className="panel cn__card"><ContactForm /></div>
        </div>
      </section>
      <Faq />
      <Footer lead={false} />
    </div>
  )
}
