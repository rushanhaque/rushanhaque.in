import { useEffect, useRef, useState } from 'react'
import { useReveals } from '../lib/useReveals'
import editable from '../data/editable.json'
import Icon from '../components/Icon'

const MAX = 1200
const call = async (url, method = 'GET', body) => {
  const r = await fetch(url, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
  const data = await r.json().catch(() => ({}))
  return { ok: r.ok, status: r.status, data }
}

/**
 * The owner's admin: sign in with the admin password, edit the About text, publish. Publishing
 * commits the change to GitHub and Vercel rebuilds the site, so it is live about a minute later.
 * Kept out of search engines and the sitemap.
 */
export default function Admin() {
  const root = useRef(null)
  useReveals(root, 'ivory')
  const [phase, setPhase] = useState('checking') // checking | login | loading | edit
  const [pw, setPw] = useState('')
  const [text, setText] = useState(editable.aboutBio)
  const [saved, setSaved] = useState(editable.aboutBio)
  const [sha, setSha] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState({ kind: '', text: '' })

  const load = async () => {
    setPhase('loading')
    const r = await call('/api/admin/content')
    if (r.status === 401) return setPhase('login')
    if (!r.ok) { setPhase('edit'); return setNote({ kind: 'error', text: r.data.error || 'Could not read the content.' }) }
    setSha(r.data.sha)
    setText(r.data.content.aboutBio)
    setSaved(r.data.content.aboutBio)
    setPhase('edit')
  }

  useEffect(() => {
    call('/api/admin/session').then((r) => {
      if (!r.ok || typeof r.data.configured !== 'boolean') { setPhase('login'); return setNote({ kind: 'error', text: 'The admin service is not reachable from here.' }) }
      if (!r.data.configured) setNote({ kind: 'error', text: 'No admin password is set on Vercel (ADMIN_PUBLISH_SECRET).' })
      return r.data.signedIn ? load() : setPhase('login')
    }).catch(() => { setPhase('login'); setNote({ kind: 'error', text: 'The admin service is not reachable from here.' }) })
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
    const r = await call('/api/admin/content', 'PUT', { sha, content: { aboutBio: text } }).catch(() => ({ ok: false, data: {} }))
    setBusy(false)
    if (r.status === 401) { setPhase('login'); return setNote({ kind: 'error', text: 'Your session ended. Sign in again.' }) }
    if (!r.ok) return setNote({ kind: 'error', text: r.data.error || 'Could not publish.' })
    setSha(r.data.sha)
    setText(r.data.content.aboutBio)
    setSaved(r.data.content.aboutBio)
    setNote({ kind: 'done', text: 'Published. The site is rebuilding; the new text is live in about a minute.' })
  }

  const signOut = async () => {
    await call('/api/admin/session', 'DELETE').catch(() => {})
    setPhase('login')
    setNote({ kind: '', text: '' })
  }

  const changed = text.replace(/\s+/g, ' ').trim() !== saved
  return (
    <div className="page page--admin" ref={root}>
      <section className="adm wrap" data-theme="ivory">
        <header className="adm__head">
          <span className="eyebrow">Admin</span>
          <h1>Edit the <em>site.</em></h1>
        </header>

        {phase === 'checking' || phase === 'loading' ? <p className="adm__wait">{phase === 'checking' ? 'Checking your session…' : 'Loading the content…'}</p> : null}

        {phase === 'login' && (
          <form className="cf adm__card" onSubmit={signIn}>
            <label className="cf-field"><span>Admin password</span>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required autoFocus />
            </label>
            {note.text && <p className={note.kind === 'error' ? 'cf-error' : 'adm__done'} role="alert">{note.text}</p>}
            <button type="submit" className="cf-btn hb" disabled={busy || !pw}>{busy ? <><span className="cf-spin" aria-hidden="true" />Signing in…</> : <>Sign in <Icon name="arrowRight" size={17} /></>}</button>
          </form>
        )}

        {phase === 'edit' && (
          <form className="cf adm__card" onSubmit={publish}>
            <label className="cf-field"><span>About text <small>On the About page and the home page’s About section</small></span>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={MAX} />
            </label>
            <div className="adm__meta">
              <span>{text.trim().length} / {MAX}</span>
              {changed ? <span>Unpublished changes</span> : <span>Matches the live site</span>}
            </div>
            {note.text && <p className={note.kind === 'error' ? 'cf-error' : 'adm__done'} role={note.kind === 'error' ? 'alert' : 'status'}>{note.text}</p>}
            <div className="adm__actions">
              <button type="submit" className="cf-btn hb" disabled={busy || !changed || !sha}>{busy ? <><span className="cf-spin" aria-hidden="true" />Publishing…</> : <>Publish <Icon name="arrowUpRight" size={17} /></>}</button>
              <button type="button" className="adm__ghost" onClick={() => setText(saved)} disabled={!changed || busy}>Discard changes</button>
              <button type="button" className="adm__ghost" onClick={signOut}>Sign out</button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
