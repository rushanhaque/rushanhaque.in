import { useEffect, useMemo, useRef, useState } from 'react'
import editable from '../data/editable.json'
import * as base from '../data/content'
import { LISTS, cleanList, small800 } from '../../api/_schema.js'
import { logoPath, prepareLogo, preparePicture, picturePath } from '../lib/logo'
import Btn from '../components/Btn'
import { Trash } from '../components/glyphs'

// The owner's admin. Sign in with the admin password, change anything on the tabs, and publish: the change is
// committed to GitHub and Vercel rebuilds the site, so it is live about a minute later. Kept out of search.
const MAX = 1200
const TABS = [['about', 'About'], ['works'], ['building'], ['products'], ['clients', 'Clients'], ['reviews'], ['experiments'], ['certifications']]
  .map(([k, label]) => [k, label || LISTS[k].label])
const KEYS = Object.keys(LISTS)

let nextKey = 1
const withKeys = (list) => (list || []).map((c) => ({ ...c, _k: nextKey++ }))
const strip = (key, it) => {
  const spec = LISTS[key]
  const o = {}
  for (const k of [...spec.fields.map((f) => f.k), ...spec.keep]) if (it[k] !== undefined && it[k] !== '') o[k] = it[k]
  return o
}
// the content as the admin edits it: every list, from the published file or, until a list is first published, the site's own
const fromContent = (c) => ({
  aboutBio: c.aboutBio || '',
  clients: withKeys(c.clients || []),
  ...Object.fromEntries(KEYS.map((k) => [k, withKeys((Array.isArray(c[k]) ? c[k] : base[k] || []).map((it) => strip(k, it)))])),
})
const plain = (doc) => ({
  aboutBio: doc.aboutBio.replace(/\s+/g, ' ').trim(),
  clients: doc.clients.map(({ name, logo, tone }) => ({ name: name.replace(/\s+/g, ' ').trim(), logo, tone })),
  ...Object.fromEntries(KEYS.map((k) => [k, doc[k].map(({ _k, ...it }) => it)])),
})
const parts = (doc) => {
  const p = plain(doc)
  return { about: JSON.stringify(p.aboutBio), clients: JSON.stringify(p.clients), ...Object.fromEntries(KEYS.map((k) => [k, JSON.stringify(p[k])])) }
}
const call = async (url, method = 'GET', body) => {
  const r = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}
const titleOf = (key, it) => it.title || it.name || `New ${LISTS[key].one}`
const subOf = (key, it) => (key === 'reviews' ? [it.company, it.location].filter(Boolean).join(', ') || it.quote : [it.field || it.kind || it.issuer, it.year || it.date].filter(Boolean).join(' · '))

function Field({ f, it, onChange, onPicture, preview }) {
  const id = `f-${it._k}-${f.k}`
  const label = <span>{f.label}{f.req && <b className="adm__req" aria-hidden="true"> *</b>}</span>
  if (f.type === 'image') {
    const src = it.image && (preview(it.image) || it.image)
    return (
      <div className="field adm__pic">
        {label}
        <div className="adm__picrow">
          <span className="adm__thumb is-big">{src ? <img src={src} alt="" /> : <i>No picture yet</i>}</span>
          <div className="adm__tools">
            <label className="adm__file">{it.image ? 'Replace picture' : 'Choose picture'}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPicture} aria-label={f.label} />
            </label>
            {it.image && !f.req && <button type="button" className="adm__ghost" onClick={() => onChange({ image: '', w: undefined, h: undefined })}>Remove</button>}
          </div>
        </div>
        <small className="adm__hint">A JPG, PNG or WebP. It is resized for you.</small>
      </div>
    )
  }
  if (f.options) {
    return (
      <label className="field" htmlFor={id}>{label}
        <select id={id} value={it[f.k] || ''} onChange={(e) => onChange({ [f.k]: e.target.value })}>
          {!f.req && <option value="">Not set</option>}
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    )
  }
  if (f.type === 'tags' || f.type === 'lines') {
    const joiner = f.type === 'tags' ? ', ' : '\n'
    const value = Array.isArray(it[f.k]) ? it[f.k].join(joiner) : it[f.k] || ''
    const set = (v) => onChange({ [f.k]: v.split(f.type === 'tags' ? ',' : '\n').map((s) => s.trimStart()).slice(0, f.count + 1) })
    return (
      <label className="field" htmlFor={id}>{label}
        {f.type === 'tags'
          ? <input id={id} value={value} onChange={(e) => set(e.target.value)} placeholder="Inventory, Catalogues, Quotations" />
          : <textarea id={id} value={value} onChange={(e) => set(e.target.value)} rows={Math.min(5, f.count)} />}
      </label>
    )
  }
  const Tag = f.area ? 'textarea' : 'input'
  return (
    <label className="field" htmlFor={id}>{label}
      <Tag id={id} value={it[f.k] || ''} onChange={(e) => onChange({ [f.k]: e.target.value })} maxLength={f.max} placeholder={f.ph} rows={f.area ? 3 : undefined} type={f.type === 'url' ? 'url' : undefined} inputMode={f.type === 'url' ? 'url' : undefined} />
    </label>
  )
}

function ListTab({ k, items, setItems, open, setOpen, preview, choosePicture }) {
  const spec = LISTS[k]
  const [sure, setSure] = useState(null)
  const update = (key, patch) => setItems(items.map((it) => (it._k === key ? { ...it, ...patch } : it)))
  const move = (i, d) => {
    const next = [...items]
    const [it] = next.splice(i, 1)
    next.splice(i + d, 0, it)
    setItems(next)
  }
  const add = () => {
    const blank = { _k: nextKey++ }
    for (const f of spec.fields) if (f.options && f.req !== false && k !== 'certifications' && k !== 'experiments') blank[f.k] = f.options[0]
    setItems([blank, ...items])
    setOpen(blank._k)
  }
  return (
    <div className="adm__list">
      <div className="adm__listhead">
        <p className="small">{spec.hint}</p>
        <button type="button" className="adm__add" onClick={add}>+ Add {spec.one}</button>
      </div>
      {items.length === 0 && <p className="small adm__empty">Nothing here yet.</p>}
      <ol className="adm__rows">
        {items.map((it, i) => {
          const isOpen = open === it._k
          const thumb = it.image && (preview(it.image) || it.image)
          return (
            <li key={it._k} className={`adm__row ${isOpen ? 'is-open' : ''}`}>
              <div className="adm__line">
                <button type="button" className="adm__summary" onClick={() => setOpen(isOpen ? null : it._k)} aria-expanded={isOpen}>
                  {spec.fields.some((f) => f.type === 'image') && <span className="adm__thumb">{thumb ? <img src={thumb} alt="" /> : <i />}</span>}
                  <span className="adm__names"><strong>{titleOf(k, it)}</strong><small>{subOf(k, it)}</small></span>
                </button>
                {sure === it._k ? (
                  <div className="adm__confirm" role="group" aria-label={`Delete ${titleOf(k, it)}?`}>
                    <span>Delete?</span>
                    <button type="button" className="is-danger" onClick={() => { setItems(items.filter((x) => x._k !== it._k)); setSure(null); if (isOpen) setOpen(null) }}>Yes</button>
                    <button type="button" onClick={() => setSure(null)}>No</button>
                  </div>
                ) : (
                  <div className="adm__order">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${titleOf(k, it)} up`}>↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${titleOf(k, it)} down`}>↓</button>
                    <button type="button" className="adm__del" onClick={() => setSure(it._k)} aria-label={`Delete ${titleOf(k, it)}`} title="Delete"><Trash size={17} /></button>
                  </div>
                )}
              </div>
              {isOpen && (
                <div className="adm__edit">
                  {spec.fields.map((f) => (
                    <Field key={f.k} f={f} it={it} preview={preview} onChange={(patch) => update(it._k, patch)} onPicture={(e) => choosePicture(k, it, e, (patch) => update(it._k, patch))} />
                  ))}
                  <div className="adm__editfoot">
                    <button type="button" className="adm__ghost" onClick={() => setOpen(null)}>Done</button>
                    <button type="button" className="adm__ghost" onClick={() => setSure(it._k)}>Delete this {spec.one}</button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function Admin() {
  const root = useRef(null)
  const [phase, setPhase] = useState('checking') // checking | login | loading | edit
  const [pw, setPw] = useState('')
  const [doc, setDoc] = useState(() => fromContent(editable))
  const [saved, setSaved] = useState(() => parts(fromContent(editable)))
  const [fresh, setFresh] = useState({}) // new pictures: address -> { preview, base64 }
  const [tab, setTab] = useState('works')
  const [open, setOpen] = useState(null)
  const [sha, setSha] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState({ kind: '', text: '' })

  const load = async () => {
    setPhase('loading')
    const r = await call('/api/admin/content')
    if (r.status === 401) return setPhase('login')
    if (!r.ok) { setPhase('edit'); return setNote({ kind: 'error', text: r.data.error || 'Could not read the content.' }) }
    const d = fromContent(r.data.content)
    setSha(r.data.sha)
    setDoc(d)
    setSaved(parts(d))
    setFresh({})
    setPhase('edit')
  }

  useEffect(() => {
    document.title = 'Admin. Rushan Haque'
    call('/api/admin/session').then((r) => {
      if (!r.ok || typeof r.data.configured !== 'boolean') { setPhase('login'); return setNote({ kind: 'error', text: 'The admin service is not reachable from here.' }) }
      if (!r.data.configured) setNote({ kind: 'error', text: 'No admin password is set on Vercel (ADMIN_PUBLISH_SECRET).' })
      return r.data.signedIn ? load() : setPhase('login')
    }).catch(() => { setPhase('login'); setNote({ kind: 'error', text: 'The admin service is not reachable from here.' }) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = useMemo(() => parts(doc), [doc])
  const dirty = Object.keys(now).filter((k) => now[k] !== saved[k])
  const preview = (path) => fresh[path]?.preview

  const signIn = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote({ kind: '', text: '' })
    const r = await call('/api/admin/session', 'POST', { password: pw }).catch(() => ({ ok: false, data: {} }))
    setBusy(false)
    if (!r.ok) return setNote({ kind: 'error', text: r.data.error || 'Could not sign in.' })
    setPw('')
    load()
  }

  // checked here first, with the same rules the server uses, so a mistake points at its tab straight away
  const problem = () => {
    if (doc.aboutBio.trim().length < 40) return ['about', 'The About text needs at least 40 characters.']
    if (doc.clients.some((c) => !c.name.trim())) return ['clients', 'Every client needs a name.']
    for (const k of KEYS) { const r = cleanList(k, plain(doc)[k]); if (r.error) return [k, r.error] }
    return null
  }

  const publish = async () => {
    const p = problem()
    if (p) { setTab(p[0]); return setNote({ kind: 'error', text: p[1] }) }
    setBusy(true)
    setNote({ kind: '', text: '' })
    const content = plain(doc)
    const used = new Set([...content.clients.map((c) => c.logo), ...KEYS.flatMap((k) => content[k].map((it) => it.image))].filter(Boolean).flatMap((x) => [x, small800(x)]))
    const uploads = Object.fromEntries(Object.entries(fresh).filter(([path]) => used.has(path)).map(([path, f]) => [path, f.base64]))
    const r = await call('/api/admin/content', 'PUT', { sha, content, uploads }).catch(() => ({ ok: false, data: {} }))
    setBusy(false)
    if (r.status === 401) { setPhase('login'); return setNote({ kind: 'error', text: 'Your session ended. Sign in again. Your changes are still here.' }) }
    if (!r.ok) return setNote({ kind: 'error', text: r.data.error || 'Could not publish.' })
    const d = fromContent(r.data.content)
    setSha(r.data.sha)
    setDoc(d)
    setSaved(parts(d))
    setNote({ kind: 'done', text: 'Published. The site is rebuilding; the changes are live in about a minute.' })
  }

  const discard = () => { setDoc(fromContent(JSON.parse(`{"aboutBio":${saved.about},"clients":${saved.clients},${KEYS.map((k) => `"${k}":${saved[k]}`).join(',')}}`))); setFresh({}); setNote({ kind: '', text: '' }) }

  const signOut = async () => {
    await call('/api/admin/session', 'DELETE').catch(() => {})
    setPhase('login')
    setNote({ kind: '', text: '' })
  }

  const choosePicture = async (k, it, e, apply) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setNote({ kind: '', text: 'Preparing the picture' })
    try {
      const made = await preparePicture(file)
      const path = picturePath(k, it.title || it.name || file.name.replace(/\.[^.]+$/, ''))
      setFresh((f) => ({ ...f, [path]: made.big, [small800(path)]: made.small }))
      apply({ image: path, w: made.w, h: made.h })
      setNote({ kind: '', text: '' })
    } catch (err) {
      setNote({ kind: 'error', text: err.message })
    }
  }

  const setClient = (key, patch) => setDoc((d) => ({ ...d, clients: d.clients.map((c) => (c._k === key ? { ...c, ...patch } : c)) }))
  const chooseLogo = async (c, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setNote({ kind: '', text: '' })
    try {
      const made = await prepareLogo(file)
      const path = logoPath(c.name || file.name.replace(/\.[^.]+$/, ''), made.ext)
      setFresh((f) => ({ ...f, [path]: made }))
      setClient(c._k, { logo: path, tone: made.tone })
    } catch (err) {
      setNote({ kind: 'error', text: err.message })
    }
  }

  return (
    <section className="adm wrap" ref={root} data-tone="ivory">
      <header className="adm__top">
        <h1 className="h2">Edit the site</h1>
        {phase === 'edit' && <button type="button" className="adm__ghost" onClick={signOut}>Sign out</button>}
      </header>

      {(phase === 'checking' || phase === 'loading') && <p className="small">{phase === 'checking' ? 'Checking your session' : 'Loading the content'}</p>}

      {phase === 'login' && (
        <form className="form panel" onSubmit={signIn}>
          <label className="field"><span>Admin password</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
          </label>
          {note.text && <p className={note.kind === 'error' ? 'form__err' : 'small'} role="alert">{note.text}</p>}
          <Btn type="submit" variant="solid" disabled={busy || !pw}>{busy ? 'Signing in' : 'Sign in'}</Btn>
        </form>
      )}

      {phase === 'edit' && (
        <>
          <nav className="adm__tabs" aria-label="What to edit">
            {TABS.map(([k, label]) => (
              <button key={k} type="button" className={tab === k ? 'is-on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => { setTab(k); setOpen(null) }}>
                {label}{k !== 'about' && <small>{(k === 'clients' ? doc.clients : doc[k]).length}</small>}{dirty.includes(k) && <i className="adm__dot" aria-label="changed" />}
              </button>
            ))}
          </nav>

          <div className="adm__panel">
            {tab === 'about' && (
              <label className="field"><span>About text <small>On the About page</small></span>
                <textarea value={doc.aboutBio} onChange={(e) => setDoc((d) => ({ ...d, aboutBio: e.target.value }))} rows={8} maxLength={MAX} />
                <small className="adm__hint">{doc.aboutBio.trim().length} / {MAX}</small>
              </label>
            )}

            {tab === 'clients' && (
              <div className="adm__list">
                <div className="adm__listhead">
                  <p className="small">The names in Clientele on the home page. Upload a logo for each; a PNG or SVG with a see-through background looks best. Until then the card shows the name.</p>
                  <button type="button" className="adm__add" onClick={() => setDoc((d) => ({ ...d, clients: [...withKeys([{ name: '', logo: '', tone: 'light' }]), ...d.clients] }))}>+ Add client</button>
                </div>
                <div className="adm__clients">
                  {doc.clients.map((c) => (
                    <div className="adm__client" key={c._k}>
                      <div className={`plate ${c.tone === 'dark' ? 'plate--dark' : ''}`}>
                        {c.logo ? <img src={fresh[c.logo]?.preview || c.logo} alt="" /> : <span className="plate__name">{c.name || 'New client'}</span>}
                      </div>
                      <input value={c.name} onChange={(e) => setClient(c._k, { name: e.target.value })} maxLength={60} placeholder="Client name" aria-label="Client name" />
                      <div className="adm__tools">
                        <label className="adm__file">{c.logo ? 'Replace logo' : 'Upload logo'}
                          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => chooseLogo(c, e)} aria-label={`Logo for ${c.name || 'new client'}`} />
                        </label>
                        {c.logo && <button type="button" className="adm__ghost" onClick={() => setClient(c._k, { logo: '', tone: 'light' })}>Remove logo</button>}
                        <button type="button" className="adm__ghost" onClick={() => setDoc((d) => ({ ...d, clients: d.clients.filter((x) => x._k !== c._k) }))}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {KEYS.includes(tab) && (
              <ListTab k={tab} items={doc[tab]} setItems={(items) => setDoc((d) => ({ ...d, [tab]: items }))} open={open} setOpen={setOpen} preview={preview} choosePicture={choosePicture} />
            )}
          </div>

          <div className="adm__bar">
            <p className={note.kind === 'error' ? 'form__err' : 'small'} role={note.kind === 'error' ? 'alert' : 'status'}>
              {note.text || (dirty.length ? `Unpublished changes in ${dirty.map((k) => TABS.find((t) => t[0] === k)[1]).join(', ')}` : 'Everything matches the live site')}
            </p>
            <div className="adm__actions">
              <button type="button" className="adm__ghost" onClick={discard} disabled={!dirty.length || busy}>Discard</button>
              <Btn type="button" variant="solid" onClick={publish} disabled={busy || !dirty.length || !sha}>{busy ? 'Publishing' : 'Publish'}</Btn>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
