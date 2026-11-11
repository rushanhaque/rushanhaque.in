import { useEffect, useRef, useState } from 'react'
import { useChapter } from '../lib/director'
import editable from '../data/editable.json'
import { logoPath, prepareLogo } from '../lib/logo'
import Btn from '../components/Btn'

const MAX = 1200
let nextKey = 1
const keyed = (list) => (list || []).map((c) => ({ ...c, key: nextKey++ }))
const plain = (list) => list.map(({ name, logo, tone }) => ({ name: name.replace(/\s+/g, ' ').trim(), logo, tone }))
const call = async (url, method = 'GET', body) => {
  const r = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

// The owner's admin: sign in with the admin password, edit the About text and the clients and their logos, publish.
// Publishing commits the change to GitHub and Vercel rebuilds the site, so it is live about a minute later. Kept out of search.
export default function Admin() {
  const root = useRef(null)
  const [phase, setPhase] = useState('checking') // checking | login | loading | edit
  const [pw, setPw] = useState('')
  const [text, setText] = useState(editable.aboutBio)
  const [saved, setSaved] = useState(editable.aboutBio)
  const [clients, setClients] = useState(() => keyed(editable.clients))
  const [savedClients, setSavedClients] = useState(() => JSON.stringify(plain(editable.clients || [])))
  const [fresh, setFresh] = useState({}) // new logos: address -> { preview, base64 }
  const [sha, setSha] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState({ kind: '', text: '' })

  useChapter(root, { id: 'admin', name: 'Admin', time: [10, 10.1], hidden: true })

  const load = async () => {
    setPhase('loading')
    const r = await call('/api/admin/content')
    if (r.status === 401) return setPhase('login')
    if (!r.ok) { setPhase('edit'); return setNote({ kind: 'error', text: r.data.error || 'Could not read the content.' }) }
    setSha(r.data.sha)
    setText(r.data.content.aboutBio)
    setSaved(r.data.content.aboutBio)
    const list = r.data.content.clients || editable.clients || []
    setClients(keyed(list))
    setSavedClients(JSON.stringify(plain(list)))
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

  const publish = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNote({ kind: '', text: '' })
    const used = new Set(clients.map((c) => c.logo))
    const uploads = Object.fromEntries(Object.entries(fresh).filter(([p]) => used.has(p)).map(([p, f]) => [p, f.base64]))
    const r = await call('/api/admin/content', 'PUT', { sha, content: { aboutBio: text, clients: plain(clients) }, uploads }).catch(() => ({ ok: false, data: {} }))
    setBusy(false)
    if (r.status === 401) { setPhase('login'); return setNote({ kind: 'error', text: 'Your session ended. Sign in again.' }) }
    if (!r.ok) return setNote({ kind: 'error', text: r.data.error || 'Could not publish.' })
    setSha(r.data.sha)
    setText(r.data.content.aboutBio)
    setSaved(r.data.content.aboutBio)
    setSavedClients(JSON.stringify(plain(r.data.content.clients)))
    setNote({ kind: 'done', text: 'Published. The site is rebuilding; the changes are live in about a minute.' })
  }

  const signOut = async () => {
    await call('/api/admin/session', 'DELETE').catch(() => {})
    setPhase('login')
    setNote({ kind: '', text: '' })
  }

  const setClient = (key, patch) => setClients((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)))
  const chooseLogo = async (c, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setNote({ kind: '', text: '' })
    try {
      const made = await prepareLogo(file)
      const path = logoPath(c.name || file.name.replace(/\.[^.]+$/, ''), made.ext)
      setFresh((f) => ({ ...f, [path]: made }))
      setClient(c.key, { logo: path, tone: made.tone })
    } catch (err) {
      setNote({ kind: 'error', text: err.message })
    }
  }

  const changed = text.replace(/\s+/g, ' ').trim() !== saved || JSON.stringify(plain(clients)) !== savedClients
  const named = clients.every((c) => c.name.trim())
  return (
    <section className="adm wrap" ref={root} data-tone="ivory">
      <h1 className="h2">Edit the site</h1>

      {(phase === 'checking' || phase === 'loading') && <p className="small">{phase === 'checking' ? 'Checking your session' : 'Loading the content'}</p>}

      {phase === 'login' && (
        <form className="form card" onSubmit={signIn}>
          <label className="field"><span>Admin password</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
          </label>
          {note.text && <p className={note.kind === 'error' ? 'form__err' : 'small'} role="alert">{note.text}</p>}
          <Btn type="submit" variant="solid" disabled={busy || !pw}>{busy ? 'Signing in' : 'Sign in'}</Btn>
        </form>
      )}

      {phase === 'edit' && (
        <form className="form card" onSubmit={publish}>
          <label className="field"><span>About text <small>On the About page and the home page’s About section</small></span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={MAX} />
          </label>
          <p className="note adm__meta"><span>{text.trim().length} / {MAX}</span></p>
          <h2 className="h4">Clients</h2>
          <p className="small">Upload a logo for each client. A PNG or SVG with a see-through background looks best. Until there is a logo, the card shows the name.</p>
          <div className="adm__clients">
            {clients.map((c) => (
              <div className="adm__client" key={c.key}>
                <div className={`plate ${c.tone === 'dark' ? 'plate--dark' : ''}`}>
                  {c.logo ? <img src={fresh[c.logo]?.preview || c.logo} alt="" /> : <span className="plate__name">{c.name || 'New client'}</span>}
                </div>
                <label className="field"><span className="sr-only">Client name</span>
                  <input value={c.name} onChange={(e) => setClient(c.key, { name: e.target.value })} maxLength={60} placeholder="Client name" aria-label="Client name" />
                </label>
                <div className="adm__tools">
                  <label className="adm__file">{c.logo ? 'Replace logo' : 'Upload logo'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => chooseLogo(c, e)} aria-label={`Logo for ${c.name || 'new client'}`} />
                  </label>
                  {c.logo && <button type="button" className="adm__ghost" onClick={() => setClient(c.key, { logo: '', tone: 'light' })}>Remove logo</button>}
                  <button type="button" className="adm__ghost" onClick={() => setClients((l) => l.filter((k) => k.key !== c.key))}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="adm__ghost" onClick={() => setClients((l) => [...l, ...keyed([{ name: '', logo: '', tone: 'light' }])])}>Add a client</button>
          <p className="note adm__meta"><span>{clients.length} clients</span><span>{changed ? 'Unpublished changes' : 'Matches the live site'}</span></p>
          {note.text && <p className={note.kind === 'error' ? 'form__err' : 'small'} role={note.kind === 'error' ? 'alert' : 'status'}>{note.text}</p>}
          <div className="adm__actions">
            <Btn type="submit" variant="solid" disabled={busy || !changed || !sha || !named}>{busy ? 'Publishing' : 'Publish'}</Btn>
            <button type="button" className="adm__ghost" onClick={() => { setText(saved); setClients(keyed(JSON.parse(savedClients))); setFresh({}) }} disabled={!changed || busy}>Discard changes</button>
            <button type="button" className="adm__ghost" onClick={signOut}>Sign out</button>
          </div>
        </form>
      )}
    </section>
  )
}
