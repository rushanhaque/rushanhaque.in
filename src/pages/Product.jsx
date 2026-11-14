import { useRef, useState } from 'react'
import { products, productBySlug } from '../data/content'
import { contactKind, mailto, send, whatsapp } from '../lib/forms'
import { useReveals } from '../lib/reveal'
import { small, srcSet } from '../lib/img'
import { A } from '../lib/router'
import Btn from '../components/Btn'
import Head from '../components/Head'
import Split from '../components/Split'
import { BookBtn } from '../components/Booking'
import { CheckCircle } from '../components/glyphs'
import NotFound from './NotFound'

const SIZES = ['Just me', '2-10 people', '11-50 people', 'More than 50']

function QuoteForm({ product }) {
  const [f, setF] = useState({ name: '', business: '', contact: '', size: '', message: '' })
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }))
  const value = f.contact.trim()
  const kind = contactKind(value)
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
    setBusy(true)
    try {
      await send({
        _subject: `Quote request: ${product.title}, ${f.name.trim()}`,
        ...(kind === 'email' ? { _replyto: value, email: value } : { phone: value }),
        _gotcha: trap, form: 'product-quote', product: product.title,
        name: f.name.trim(), business: f.business.trim() || '(not given)', team: f.size || '(not given)', message: f.message.trim() || '(no message)',
      })
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
        <h3 className="h3">Got it, thank you.</h3>
        <p className="small">I will reach out on <b>{value}</b>, usually within a day.</p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form__row">
        <label className="field"><span>Your name</span><input value={f.name} onChange={set('name')} autoComplete="name" maxLength={80} required /></label>
        <label className="field"><span>Business <small>Optional</small></span><input value={f.business} onChange={set('business')} autoComplete="organization" maxLength={120} /></label>
      </div>
      <div className="form__row">
        <label className="field"><span>Email or phone</span><input value={f.contact} onChange={set('contact')} inputMode="email" autoComplete="email" maxLength={120} required aria-invalid={!!error && !kind} /></label>
        <label className="field"><span>Team size <small>Optional</small></span>
          <select value={f.size} onChange={set('size')}>
            <option value="">Choose</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label className="field"><span>What do you need it to do? <small>Optional</small></span><textarea rows={3} value={f.message} onChange={set('message')} maxLength={1500} /></label>
      <input className="trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {error && <p className="form__err" role="alert">{error}</p>}
      {fallback ? (
        <div className="form__alt">
          <Btn href={mailto(summary(), `Quote request: ${product.title}`)} variant="solid">Send by email</Btn>
          <Btn href={whatsapp(summary())}>Send on WhatsApp</Btn>
        </div>
      ) : (
        <Btn type="submit" variant="solid" disabled={busy}>{busy ? 'Sending' : 'Ask for a quote'}</Btn>
      )}
    </form>
  )
}

export default function Product({ params }) {
  const p = productBySlug(params?.slug)
  if (!p) return <NotFound />
  return <Inner p={p} />
}

function Inner({ p }) {
  const root = useRef(null)
  const other = products.find((x) => x.slug !== p.slug)
  useReveals(root)
  return (
    <article className="pp" ref={root} data-tone="ivory">
      <header className="pp__head wrap">
        <nav className="crumb note" aria-label="Breadcrumb"><A to="/work">Works</A><span aria-hidden="true">/</span><span aria-current="page">{p.short}</span></nav>
        <h1 className="case__title"><Split>{p.title}</Split></h1>
        <p className="lede pp__intro" data-r="up">{p.description}</p>
        <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="pp__cta"><Btn href="#quote" variant="solid">Request a quote</Btn><BookBtn /></div>
      </header>
      <div className="pp__view wrap">
        <div className="prod__frame pp__frame">
          <span className="prod__bar" aria-hidden="true"><i /><i /><i /></span>
          <img src={small(p.image)} srcSet={srcSet(p.image)} sizes="(max-width: 760px) 92vw, 90vw" alt={`${p.title} interface`} width={p.w} height={p.h} fetchPriority="high" decoding="async" />
        </div>
      </div>
      <section className="pp__does wrap">
        <Head label="What it does" title={<>Built for the work <em>you do every day.</em></>} />
        <ul className="pp__doeslist" data-r="stagger">
          {p.does.map((d) => <li key={d} className="h4">{d}</li>)}
        </ul>
      </section>
      <section className="pp__how wrap">
        <Head label="How it works" title={<>From first step <em>to finished.</em></>} />
        <ol className="pp__steps" data-r="deal">
          {p.steps.map((s, i) => (
            <li key={s.title}>
              <span className="pillar" aria-hidden="true">{i + 1}</span>
              <h3 className="h4">{s.title}</h3>
              <p className="small">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="pp__quote wrap grid" id="quote">
        <div className="pp__quotehead">
          <h2 className="h2" data-r="rise"><Split>Request a <em>quote.</em></Split></h2>
          <p className="lede" data-r="up">Tell me about your team and I will send you a price. I read everything myself and reply within a day.</p>
        </div>
        <div className="panel pp__quoteform" data-r="lift"><QuoteForm product={p} /></div>
      </section>
      <A to={`/products/${other.slug}`} className="case__next wrap" data-cursor="Next">
        <span className="case__nexttxt">
          <span className="note">Also in the workshop</span>
          <span className="h2">{other.short}</span>
          <span className="small">{other.field}</span>
        </span>
        <span className="case__nextpic" style={{ aspectRatio: `${other.w} / ${other.h}` }} data-r="plate">
          <img src={small(other.image)} srcSet={srcSet(other.image)} sizes="(max-width: 760px) 92vw, 46vw" alt="" loading="lazy" decoding="async" />
        </span>
      </A>
    </article>
  )
}
