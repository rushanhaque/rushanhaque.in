'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import type { SiteReport } from '@/lib/site-check';
import { auditFormId, email as myEmail, phone } from '@/lib/content';

const hostOf = (u: string) => { try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, ''); } catch { return ''; } };

// The closing ask, kept to two fields: leave a website and an email, and I send back a short audit.
// A quick automated scan rides along so my review starts informed; it never blocks the request.
export function AuditCard() {
  const [url, setUrl] = useState('');
  const [mail, setMail] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);
  const site = hostOf(url.trim());
  const summary = () => `Website: ${url.trim()}\nEmail: ${mail.trim()}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFallback(false);
    if (!site || !site.includes('.')) { setError('Enter your website address, for example yourbusiness.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) { setError('Enter an email address I can send the audit to.'); return; }
    if (!auditFormId) { setFallback(true); setError('Send this by email or WhatsApp below; it is already written.'); return; }
    setBusy(true);
    let scan: Record<string, string> = {};
    try {
      const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }), signal: AbortSignal.timeout(9000) });
      if (res.ok) {
        const r = await res.json() as SiteReport;
        scan = { scan_score: `${r.summary.pass} / ${r.summary.total}`, scan_gaps: r.checks.filter(c => c.status === 'fix').map(c => `${c.label}: ${c.detail}`).join('\n') };
      }
    } catch { /* the request still goes through */ }
    try {
      const res = await fetch(`https://formspree.io/f/${auditFormId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Audit request: ${site}`, _replyto: mail.trim(), _gotcha: trap, website: url.trim(), email: mail.trim(), interested_in: 'Not specified', ...scan }) });
      if (res.status >= 500) { setFallback(true); throw new Error('That could not be sent from here. Send it by email or WhatsApp below; it is already written.'); }
      if (!res.ok) { const body = await res.json().catch(() => ({})) as { errors?: { message: string }[] }; throw new Error(body.errors?.[0]?.message || 'Could not send your request. Please try again.'); }
      setDone(true);
    } catch (err) {
      if ((err as Error).name === 'TypeError') { setFallback(true); setError('Your connection dropped. Send it by email or WhatsApp below; it is already written.'); }
      else setError((err as Error).message);
    } finally { setBusy(false); }
  };

  if (done) return <div className="tl-audit-done" role="status">
    <span className="tl-audit-tick"><Check size={24}/></span>
    <h3>Got it. I will look at <em>{site}</em>.</h3>
    <p>Your audit will reach {mail.trim()}, usually within 48 hours.</p>
  </div>;

  return <form className="tl-audit-form" onSubmit={submit} noValidate>
    <label><span className="sr-only">Your website</span><input value={url} onChange={e => setUrl(e.target.value)} placeholder="yourbusiness.com" inputMode="url" autoComplete="url" spellCheck={false} maxLength={200} required/></label>
    <label><span className="sr-only">Your email</span><input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder="you@yourbusiness.com" autoComplete="email" maxLength={254} required/></label>
    <input className="tl-audit-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true"/>
    {!fallback && <button type="submit" className="tl-button" disabled={busy}>{busy ? <><Loader2 size={16} className="tl-audit-spin"/>Sending…</> : <>Send my website <ArrowUpRight size={16}/></>}</button>}
    {fallback && <div className="tl-audit-fallback">
      <a className="tl-button" href={`mailto:${myEmail}?subject=${encodeURIComponent(`Audit request: ${site}`)}&body=${encodeURIComponent(summary())}`}>Send by email <ArrowUpRight size={16}/></a>
      <a className="tl-link" href={`${phone.whatsapp}?text=${encodeURIComponent(`Audit request\n\n${summary()}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={15}/></a>
    </div>}
    {error && <p className="tl-audit-error" role="alert">{error}</p>}
  </form>;
}
