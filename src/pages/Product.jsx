import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveals } from '../lib/useReveals'
import { scrollTo } from '../lib/lenis'
import { srcSet } from '../lib/img'
import { site } from '../config/site'
import { products, productBySlug } from '../data/content'
import { TLink } from '../components/Transition'
import { Kicker } from '../components/Head'
import Button from '../components/Button'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import NotFound from './NotFound'

const two = (n) => String(n).padStart(2, '0')
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isPhone = (v) => /^[+()\d][\d\s().-]{6,}$/.test(v) && v.replace(/\D/g, '').length >= 7
const SIZES = ['Just me', '2–10 people', '11–50 people', 'More than 50']

/** A quote request for one product: who is asking, how to reach them, and what they need. */
function QuoteForm({ product }) {
  const [f, setF] = useState({ name: '', business: '', contact: '', size: '', message: '' })
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))

  const value = f.contact.trim()
  const kind = isEmail(value) ? 'email' : isPhone(value) ? 'phone' : ''
  const summary = () => [
    `Quote request: ${product.title}`,
    `Name: ${f.name.trim()}`,
    f.business.trim() && `Business: ${f.business.trim()}`,
    `${kind === 'phone' ? 'Phone' : 'Email'}: ${value}`,
    f.size && `Team: ${f.size}`,
    f.message.trim() && `\n${f.message.trim()}`,
  ].filter(Boolean).join('\n')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setFallback(false)
    if (!f.name.trim()) return setError('Add your name, so I know who to reply to.')
    if (!kind) return setError('Enter an email address or a phone number so I can reach you.')
    if (!site.formspree) { setFallback(true); return setError('Send this by email or WhatsApp below; it’s already written.') }
    setBusy(true)
    try {
      const res = await fetch(`https://formspree.io/f/${site.formspree}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Quote request: ${product.title} — ${f.name.trim()}`,
          ...(kind === 'email' ? { _replyto: value, email: value } : { phone: value }),
          _gotcha: trap, form: 'product-quote', product: product.title,
          name: f.name.trim(), business: f.business.trim() || '(not given)', team: f.size || '(not given)', message: f.message.trim() || '(no message)',
        }),
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
        <h2>Request received.</h2>
        <p>I’ll send a quote for {product.title} to <b>{value}</b>, usually within a day.</p>
        <button type="button" className="cf-again" onClick={() => { setDone(false); setF({ name: '', business: '', contact: '', size: '', message: '' }) }}>Send another</button>
      </div>
    )
  }

  return (
    <form className="cf pr__form" onSubmit={submit} noValidate>
      <div className="pr__pair">
        <label className="cf-field"><span>Your name</span><input value={f.name} onChange={set('name')} autoComplete="name" maxLength={80} required /></label>
        <label className="cf-field"><span>Business <small>Optional</small></span><input value={f.business} onChange={set('business')} autoComplete="organization" maxLength={120} /></label>
      </div>
      <label className="cf-field"><span>Email or phone</span>
        <input value={f.contact} onChange={set('contact')} placeholder="you@email.com or +91 …" autoComplete="email" inputMode="email" maxLength={120} required />
      </label>
      <fieldset className="pr__size">
        <legend>How many people will use it? <small>Optional</small></legend>
        <div>{SIZES.map((s) => <label key={s} className={f.size === s ? 'is-on' : ''}><input type="radio" name="size" value={s} checked={f.size === s} onChange={set('size')} />{s}</label>)}</div>
      </fieldset>
      <label className="cf-field"><span>What do you need it to do? <small>Optional</small></span>
        <textarea value={f.message} onChange={set('message')} placeholder="How you work today, what slows you down, anything it must fit with…" rows={4} maxLength={1500} />
      </label>
      <input className="cf-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {error && <p className="cf-error" role="alert">{error}</p>}
      {fallback ? (
        <div className="cf-fallback">
          <a className="cf-btn hb" href={`mailto:${site.email}?subject=${encodeURIComponent(`Quote request: ${product.title}`)}&body=${encodeURIComponent(summary())}`}>Send by email <Icon name="arrowUpRight" size={16} /></a>
          <a href={`${site.phone.whatsapp}?text=${encodeURIComponent(summary())}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp <Icon name="arrowUpRight" size={15} /></a>
        </div>
      ) : (
        <button type="submit" className="cf-btn hb" disabled={busy}>{busy ? <><span className="cf-spin" aria-hidden="true" />Sending…</> : <>Request a quote <Icon name="arrowUpRight" size={17} /></>}</button>
      )}
      <small className="cf-note">I read every request myself and reply with a quote within a day.</small>
    </form>
  )
}

/**
 * A product, in full: what it is, what it does, how it works, and the two ways to take it
 * further, a quote request or a call.
 */
export default function Product() {
  const { slug } = useParams()
  const p = productBySlug(slug)
  return p ? <ProductPage p={p} key={p.slug} /> : <NotFound />
}

function ProductPage({ p }) {
  const root = useRef(null)
  useReveals(root, 'ivory')
  const i = products.indexOf(p)
  const other = products[(i + 1) % products.length]
  const words = p.title.split(' ')
  const lead = words.length > 1 ? words.slice(0, -1).join(' ') : ''
  const last = words[words.length - 1]

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    gsap.timeline({ delay: 0.15 })
      .from(q('.pr__title > span'), { yPercent: 110, stagger: 0.08, duration: 1.3 })
      .from(q('.pr__intro > *'), { y: 24, autoAlpha: 0, stagger: 0.07, duration: 1 }, 0.35)
      .fromTo(q('.pr__shot'), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4 }, 0.45)
  }, { scope: root })

  const quote = () => scrollTo('#quote', { offset: -80 })

  return (
    <div className="page page--product" ref={root}>
      <section className="pr" data-theme="ivory">
        <header className="pr__head wrap">
          <TLink to="/#products" label="Products" className="pr__back"><Icon name="arrowLeft" size={14} /> All products</TLink>
          <Kicker n={two(i + 1)} label={`Product · ${p.field}`} />
          <h1 className="pr__title" aria-label={p.title}>
            {lead && <span aria-hidden="true">{lead} </span>}
            <span aria-hidden="true"><em>{last}</em></span>
          </h1>
          <div className="pr__intro">
            <p className="pr__lede">{p.description}</p>
            <ul className="pr__tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="pr__ctas">
              <Button onClick={quote} variant="solid" icon="arrowDown">Request a quote</Button>
              <Button href={site.booking} variant="ghost" icon="calendar">Schedule a call</Button>
            </div>
          </div>
        </header>

        <figure className="pr__shot wrap">
          <div className="pr__frame">
            <div className="pr__bar" aria-hidden="true"><i /><i /><i /><span>{p.title}</span></div>
            <img src={p.image} srcSet={srcSet(p.image)} sizes="(max-width: 899px) 92vw, 86vw" alt={`${p.title} interface`} width={p.w} height={p.h} fetchpriority="high" />
          </div>
        </figure>

        <section className="pr__block wrap">
          <header className="pr__sub"><span className="eyebrow">What it does</span><h2 data-split>Built for the work <em>you do every day.</em></h2></header>
          <ol className="pr__does">
            {p.does.map((d, k) => (
              <li key={d} data-reveal data-delay={k * 0.08}><span className="pr__n">{two(k + 1)}</span><p>{d}</p></li>
            ))}
          </ol>
        </section>

        <section className="pr__block wrap">
          <header className="pr__sub"><span className="eyebrow">How it works</span><h2 data-split>From first step <em>to finished.</em></h2></header>
          <ol className="pr__steps" style={{ '--n': p.steps.length }}>
            {p.steps.map((s, k) => (
              <li key={s.title} data-reveal data-delay={k * 0.07}><span>Step {k + 1}</span><strong>{s.title}</strong><p>{s.text}</p></li>
            ))}
          </ol>
        </section>

        <section className="pr__quote wrap" id="quote" aria-labelledby="pr-quote">
          <div className="pr__ask">
            <span className="eyebrow">Get {p.short === p.title ? p.title : `the ${p.short.toLowerCase()} software`}</span>
            <h2 id="pr-quote">Request a <em>quote.</em></h2>
            <p>Tell me about your business and how you would use {p.title}, and I’ll reply with a quote, usually within a day.</p>
            <div className="pr__call">
              <span className="pr__call-icon"><Icon name="calendar" size={22} /></span>
              <div>
                <strong>Rather talk it through?</strong>
                <p>Book a call at a time that suits you and we can go through it together.</p>
                <div className="pr__call-links">
                  <a href={site.booking} target="_blank" rel="noopener noreferrer" className="pr__link">Schedule a call <Icon name="arrowUpRight" size={14} /></a>
                  <a href={`${site.phone.whatsapp}?text=${encodeURIComponent(`Hello, I’d like to know more about ${p.title}.`)}`} target="_blank" rel="noopener noreferrer" className="pr__link">WhatsApp {site.phone.label} <Icon name="arrowUpRight" size={14} /></a>
                </div>
              </div>
            </div>
          </div>
          <QuoteForm product={p} />
        </section>

        {other !== p && (
          <TLink to={`/products/${other.slug}`} label={other.title} className="pr__next wrap">
            <span className="eyebrow">Next product</span>
            <span className="pr__next-title">{other.title} <Icon name="arrowRight" size={28} stroke={1.2} /></span>
            <span className="pr__next-line">{other.description}</span>
          </TLink>
        )}
      </section>
      <Footer />
    </div>
  )
}
