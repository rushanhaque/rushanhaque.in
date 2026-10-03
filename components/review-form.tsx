'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Loader2, Star } from 'lucide-react';
import { email as myEmail, phone, formspreeId } from '@/lib/content';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// The review form: name, role, email, a star rating and the review itself.
export function ReviewForm() {
  const [f, setF] = useState({ name: '', company: '', email: '', message: '' });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(x => ({ ...x, [k]: e.target.value }));

  const summary = () => [
    `Name: ${f.name.trim()}`,
    ...(f.company.trim() ? [`Role / company: ${f.company.trim()}`] : []),
    ...(f.email.trim() ? [`Email: ${f.email.trim()}`] : []),
    `Rating: ${rating} / 5`, '', f.message.trim(),
  ].join('\n');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFallback(false);
    if (f.name.trim().length < 2) { setError('Add your name.'); return; }
    if (!rating) { setError('Choose a star rating.'); return; }
    if (f.message.trim().length < 10) { setError('Write a few words about how it went.'); return; }
    if (f.email.trim() && !isEmail(f.email.trim())) { setError('That email address doesn’t look right.'); return; }
    if (!formspreeId) { setFallback(true); setError('Send this by email or WhatsApp below; it’s already written.'); return; }
    setBusy(true);
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `New review from ${f.name.trim()} (${rating}/5)`, ...(f.email.trim() ? { _replyto: f.email.trim(), email: f.email.trim() } : {}), _gotcha: trap, form: 'review', name: f.name.trim(), company: f.company.trim(), rating, message: f.message.trim() }) });
      if (res.status >= 500) { setFallback(true); throw new Error('This could not be sent from here. Send it by email or WhatsApp below; it’s already written.'); }
      if (!res.ok) { const b = await res.json().catch(() => ({})) as { errors?: { message: string }[] }; throw new Error(b.errors?.[0]?.message || 'Could not send. Please try again.'); }
      setDone(true);
    } catch (err) {
      if ((err as Error).name === 'TypeError') { setFallback(true); setError('Your connection dropped. Send it by email or WhatsApp below; it’s already written.'); }
      else setError((err as Error).message);
    } finally { setBusy(false); }
  };

  if (done) return <div className="rvf rvf-done" role="status">
    <span className="rvf-tick"><Check size={26}/></span>
    <h3>Thank you, {f.name.trim().split(' ')[0]}.</h3>
    <p>Your review is with me. It goes up as you wrote it.</p>
  </div>;

  const shown = hover || rating;
  return <form className="rvf" onSubmit={submit} noValidate>
    <label><span>Your name <b>*</b></span><input value={f.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name" maxLength={100} required/></label>
    <label><span>Role / company</span><input value={f.company} onChange={set('company')} placeholder="Product Lead, Acme" maxLength={120}/></label>
    <label><span>Your email <small>Stays private</small></span><input type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" maxLength={254}/></label>
    <fieldset className="rvf-stars"><legend>Rating <b>*</b></legend>
      <div role="radiogroup" aria-label="Rating" onPointerLeave={() => setHover(0)}>{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} onPointerEnter={() => setHover(n)}><Star size={26} fill={n <= shown ? 'currentColor' : 'none'} strokeWidth={1.5}/></button>)}</div>
    </fieldset>
    <label><span>Your review <b>*</b></span><textarea value={f.message} onChange={set('message')} placeholder="What was it like working together?" rows={5} maxLength={1500} required/></label>
    <input className="rvf-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true"/>
    {error && <p className="rvf-error" role="alert">{error}</p>}
    {fallback && <div className="rvf-fallback">
      <a className="rvf-send" href={`mailto:${myEmail}?subject=${encodeURIComponent('A review for your portfolio')}&body=${encodeURIComponent(summary())}`}>Send by email <ArrowUpRight size={16}/></a>
      <a href={`${phone.whatsapp}?text=${encodeURIComponent('A review\n\n' + summary())}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp <ArrowUpRight size={15}/></a>
    </div>}
    <div className="rvf-actions">
      {!fallback && <button type="submit" className="rvf-send" disabled={busy}>{busy ? <><Loader2 size={17} className="rvf-spin"/>Sending…</> : <>Send review</>}</button>}
      <small>Published as written, with your name and company.</small>
    </div>
  </form>;
}
