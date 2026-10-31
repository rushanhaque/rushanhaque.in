import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveals } from '../lib/useReveals'
import { site } from '../config/site'
import Icon from '../components/Icon'

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isPhone = (v) => /^[+()\d][\d\s().-]{6,}$/.test(v) && v.replace(/\D/g, '').length >= 7

/** The whole contact flow from the previous portfolio: where to reach you, and optionally what it's about. */
function ContactForm() {
  const [contact, setContact] = useState('')
  // links elsewhere can pre-fill the message (?message= or ?project=)
  const [message, setMessage] = useState(() => {
    if (typeof window === 'undefined') return ''
    const p = new URLSearchParams(window.location.search)
    return (p.get('message') || (p.get('project') ? `About: ${p.get('project')}` : '')).slice(0, 1500)
  })
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)

  const value = contact.trim()
  const kind = isEmail(value) ? 'email' : isPhone(value) ? 'phone' : ''
  const summary = () => [`${kind === 'phone' ? 'Phone' : 'Email'}: ${value}`, message.trim() ? `\n${message.trim()}` : ''].join('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setFallback(false)
    if (!kind) return setError('Enter an email address or a phone number so I can reach you.')
    if (!site.formspree) { setFallback(true); return setError('Send this by email or WhatsApp below; it’s already written.') }
    setBusy(true)
    try {
      const res = await fetch(`https://formspree.io/f/${site.formspree}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `New message from ${value}`, ...(kind === 'email' ? { _replyto: value, email: value } : { phone: value }), _gotcha: trap, form: 'contact', message: message.trim() || '(no message)' }),
      })
      if (res.status >= 500) { setFallback(true); throw new Error('This could not be sent from here. Send it by email or WhatsApp below; it’s already written.') }
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.errors?.[0]?.message || 'Could not send. Please try again.') }
      setDone(true)
    } catch (err) {
      if (err.name === 'TypeError') { setFallback(true); setError('Your connection dropped. Send it by email or WhatsApp below; it’s already written.') } else setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="cf cf-done" role="status">
        <span className="cf-tick"><Icon name="check" size={26} /></span>
        <h2>Got it, thank you.</h2>
        <p>I’ll reach out on <b>{value}</b>, usually within a day.</p>
        <button type="button" className="cf-again" onClick={() => { setDone(false); setContact(''); setMessage('') }}>Send another</button>
      </div>
    )
  }

  return (
    <form className="cf" onSubmit={submit} noValidate>
      <label className="cf-field"><span>Email or phone</span>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@email.com or +91 …" autoComplete="email" inputMode="email" maxLength={120} required />
      </label>
      <label className="cf-field"><span>Anything I should know? <small>Optional</small></span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What you’re building, a deadline, a link… or nothing at all." rows={3} maxLength={1500} />
      </label>
      <input className="cf-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {error && <p className="cf-error" role="alert">{error}</p>}
      {fallback ? (
        <div className="cf-fallback">
          <a className="cf-btn hb" href={`mailto:${site.email}?subject=${encodeURIComponent('Hello from your site')}&body=${encodeURIComponent(summary())}`}>Send by email <Icon name="arrowUpRight" size={16} /></a>
          <a href={`${site.phone.whatsapp}?text=${encodeURIComponent(summary())}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp <Icon name="arrowUpRight" size={15} /></a>
        </div>
      ) : (
        <button type="submit" className="cf-btn hb" disabled={busy}>{busy ? <><span className="cf-spin" aria-hidden="true" />Sending…</> : <>Send <Icon name="arrowUpRight" size={17} /></>}</button>
      )}
      <small className="cf-note">I read everything myself and reply within a day.</small>
    </form>
  )
}

/** Connect, as in the previous portfolio: everything on one screen, over a map of Moradabad. */
export default function Contact() {
  const root = useRef(null)
  useReveals(root, 'ivory')

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.timeline({ delay: 0.15 })
      .from(q('.cn-intro > *'), { y: 30, autoAlpha: 0, stagger: 0.07, duration: 1.1 })
      .from(q('.cn-form'), { y: 40, autoAlpha: 0, duration: 1.1 }, 0.25)
  }, { scope: root })

  return (
    <div className="page page--contact" ref={root}>
      <section className="cn" data-theme="ivory" aria-labelledby="cn-title">
        {/* Moradabad at zoom 12, baked once from OpenStreetMap tiles into one softened image */}
        <div className="cn-map" aria-hidden="true">
          <img src="/img/bg/moradabad-map.webp" alt="" width="1792" height="1280" decoding="async" fetchpriority="low" />
          <span className="cn-pin"><i /></span>
        </div>
        <small className="cn-credit">Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</small>
        <div className="cn-grid">
          <div className="cn-intro">
            <span className="cn-kicker">Connect</span>
            <h1 id="cn-title">So, what are we <em>building?</em></h1>
            <p>A project, a half-formed idea, or just hello. I reply to everything myself, usually within a day.</p>
            <div className="cn-direct">
              <a className="cn-card is-primary" href={site.phone.whatsapp} target="_blank" rel="noopener noreferrer">
                <span className="cn-icon"><Icon name="whatsapp" size={22} /></span>
                <span className="cn-text"><small>WhatsApp, fastest</small><strong>{site.phone.label}</strong></span>
                <Icon name="arrowUpRight" size={20} className="cn-go" />
              </a>
              <a className="cn-card" href={`mailto:${site.email}?subject=Hello%20from%20your%20site`}>
                <span className="cn-icon"><Icon name="mail" size={22} /></span>
                <span className="cn-text"><small>Email</small><strong>{site.email}</strong></span>
                <Icon name="arrowUpRight" size={20} className="cn-go" />
              </a>
            </div>
            <a className="cn-book hb" href={site.booking} target="_blank" rel="noopener noreferrer"><Icon name="calendar" size={18} />Book a call<Icon name="arrowUpRight" size={16} /><span className="sr-only"> (opens in a new tab)</span></a>
            <p className="cn-meta"><span>{site.location}</span></p>
          </div>
          <section className="cn-form" aria-label="Send a note"><ContactForm /></section>
        </div>
      </section>
    </div>
  )
}
