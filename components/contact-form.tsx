'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { email as myEmail, phone, formspreeId } from '@/lib/content';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => /^[+()\d][\d\s().-]{6,}$/.test(v) && v.replace(/\D/g, '').length >= 7;

// The whole contact flow: where to reach you, and optionally what it's about.
export function ContactForm() {
  const [contact, setContact] = useState('');
  // Links elsewhere on the site can pre-fill the message (?message= or ?project=).
  const [message, setMessage] = useState(() => { if (typeof window === 'undefined') return ''; const p = new URLSearchParams(window.location.search); return (p.get('message') || (p.get('project') ? `About: ${p.get('project')}` : '')).slice(0, 1500); });
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);


  const value = contact.trim();
  const kind = isEmail(value) ? 'email' : isPhone(value) ? 'phone' : '';
  const summary = () => [`${kind === 'phone' ? 'Phone' : 'Email'}: ${value}`, message.trim() ? `\n${message.trim()}` : ''].join('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFallback(false);
    if (!kind) { setError('Enter an email address or a phone number so I can reach you.'); return; }
    if (!formspreeId) { setFallback(true); setError('Send this by email or WhatsApp below; it’s already written.'); return; }
    setBusy(true);
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `New message from ${value}`, ...(kind === 'email' ? { _replyto: value, email: value } : { phone: value }), _gotcha: trap, form: 'contact', message: message.trim() || '(no message)' }) });
      if (res.status >= 500) { setFallback(true); throw new Error('This could not be sent from here. Send it by email or WhatsApp below; it’s already written.'); }
      if (!res.ok) { const b = await res.json().catch(() => ({})) as { errors?: { message: string }[] }; throw new Error(b.errors?.[0]?.message || 'Could not send. Please try again.'); }
      setDone(true);
    } catch (err) {
      if ((err as Error).name === 'TypeError') { setFallback(true); setError('Your connection dropped. Send it by email or WhatsApp below; it’s already written.'); }
      else setError((err as Error).message);
    } finally { setBusy(false); }
  };

  if (done) return <div className="cf cf-done" role="status">
    <span className="cf-tick"><Check size={26}/></span>
    <h2>Got it, thank you.</h2>
    <p>I’ll reach out on <b>{value}</b>, usually within a day.</p>
    <button type="button" className="cf-again" onClick={() => { setDone(false); setContact(''); setMessage(''); }}>Send another</button>
  </div>;

  return <form className="cf" onSubmit={submit} noValidate>
    <label className="cf-field"><span>Email or phone</span>
      <input value={contact} onChange={e => setContact(e.target.value)} placeholder="you@email.com or +91 …" autoComplete="email" inputMode="email" maxLength={120} required autoFocus/>
    </label>
    <label className="cf-field"><span>Anything I should know? <small>Optional</small></span>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="What you’re building, a deadline, a link… or nothing at all." rows={4} maxLength={1500}/>
    </label>
    <input className="cf-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true"/>
    {error && <p className="cf-error" role="alert">{error}</p>}
    {fallback && <div className="cf-fallback">
      <a className="cf-btn" href={`mailto:${myEmail}?subject=${encodeURIComponent('Hello from your site')}&body=${encodeURIComponent(summary())}`}>Send by email <ArrowUpRight size={16}/></a>
      <a href={`${phone.whatsapp}?text=${encodeURIComponent(summary())}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp <ArrowUpRight size={15}/></a>
    </div>}
    {!fallback && <button type="submit" className="cf-btn" disabled={busy}>{busy ? <><Loader2 size={17} className="cf-spin"/>Sending…</> : <>Send <ArrowUpRight size={17}/></>}</button>}
    <small className="cf-note">I read everything myself and reply within a day.</small>
  </form>;
}
