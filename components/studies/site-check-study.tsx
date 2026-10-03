'use client';
import { useState } from 'react';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import type { SiteReport } from '@/lib/site-check';
import { StudyFrame } from '@/components/studies/study-frame';
import { auditFormId, email as myEmail, phone } from '@/lib/content';

const FOCUS = ['Speed', 'Search & AI visibility', 'Mobile', 'Design', 'Getting more enquiries'];
const STEPS = [
  ['01', 'I look at it myself', 'A person reviews your site, not a bot.'],
  ['02', 'A short, honest audit', 'Speed, search and AI visibility, mobile, accessibility.'],
  ['03', 'Fixes in priority order', 'What to change first, and why. Within 48 hours.'],
  ['04', 'No obligation', 'Keep the audit whether or not we work together.'],
];
const hostOf = (u: string) => { try { return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Study 04 — the visitor leaves a website and an email; I review the site by hand
// and write back. A quick automated scan rides along so my review starts informed.
export function SiteCheckStudy() {
  const [url, setUrl] = useState('');
  const [mail, setMail] = useState('');
  const [focus, setFocus] = useState<string[]>([]);
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fallback, setFallback] = useState(false);

  const site = hostOf(url.trim());
  const summary = () => [`Website: ${url.trim()}`, `Email: ${mail.trim()}`, focus.length ? `Most interested in: ${focus.join(', ')}` : ''].filter(Boolean).join('\n');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setFallback(false);
    if (!site || !site.includes('.')) { setError('Enter your website address, for example yourbusiness.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())) { setError('Enter an email address I can send the audit to.'); return; }
    if (!auditFormId) { setFallback(true); setError('Send this request by email or WhatsApp below; it’s already written.'); return; }
    setBusy(true);
    // A quick automated scan, attached for my reference. It never blocks the request.
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
        body: JSON.stringify({ _subject: `Audit request: ${site}`, _replyto: mail.trim(), _gotcha: trap, website: url.trim(), email: mail.trim(), interested_in: focus.join(', ') || 'Not specified', ...scan }) });
      if (res.status >= 500) { setFallback(true); throw new Error('The request could not be sent from here. Send it by email or WhatsApp below; it’s already written.'); }
      if (!res.ok) { const body = await res.json().catch(() => ({})) as { errors?: { message: string }[] }; throw new Error(body.errors?.[0]?.message || 'Could not send your request. Please try again.'); }
      setDone(true);
    } catch (err) {
      if ((err as Error).name === 'TypeError') { setFallback(true); setError('Your connection dropped. Send the request by email or WhatsApp below; it’s already written.'); }
      else setError((err as Error).message);
    } finally { setBusy(false); }
  };

  return <StudyFrame id="study-04" number="04" name="YOUR SITE, UNDER THE LENS" title={<>Bring your <em>website.</em></>}
    truth="Leave your website and email. I’ll review it myself and send you a short audit of what I’d fix."
    announce={done ? `Request sent for ${site}` : error}
    className="study-check">
    <div className="ar">
      {done ? <div className="ar-done" role="status">
        <span className="ar-tick"><Check size={26}/></span>
        <span className="ar-kicker">REQUEST RECEIVED</span>
        <h3>I’ll take a look at <em>{site}</em>.</h3>
        <p>Your audit will reach <b>{mail.trim()}</b>, usually within 48 hours. If I need anything, I’ll ask there first.</p>
        <button type="button" className="ar-again" onClick={() => { setDone(false); setUrl(''); setMail(''); setFocus([]); }}>Request another audit</button>
      </div> : <form className="ar-form" onSubmit={submit} noValidate>
        <span className="ar-kicker">FREE WEBSITE AUDIT</span>
        <label className="ar-field"><span>Your website</span>
          <span className="ar-input"><i aria-hidden="true">https://</i><input value={url} onChange={e => setUrl(e.target.value)} placeholder="yourbusiness.com" inputMode="url" autoComplete="url" spellCheck={false} maxLength={200} required/></span>
        </label>
        <label className="ar-field"><span>Where should I send it?</span>
          <span className="ar-input"><input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder="you@yourbusiness.com" autoComplete="email" maxLength={254} required/></span>
        </label>
        <fieldset className="ar-focus"><legend>What matters most? <small>Optional</small></legend>
          <div>{FOCUS.map(f => <button key={f} type="button" aria-pressed={focus.includes(f)} onClick={() => setFocus(x => x.includes(f) ? x.filter(y => y !== f) : [...x, f])}>{f}</button>)}</div>
        </fieldset>
        <input className="ar-trap" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} aria-hidden="true"/>
        {error && <p className="ar-error" role="alert">{error}</p>}
        {fallback && <div className="ar-fallback">
          <a className="ar-submit" href={`mailto:${myEmail}?subject=${encodeURIComponent(`Audit request: ${site}`)}&body=${encodeURIComponent(summary())}`}>Send by email <ArrowUpRight size={16}/></a>
          <a className="ar-link" href={`${phone.whatsapp}?text=${encodeURIComponent(`Audit request\n\n${summary()}`)}`} target="_blank" rel="noopener noreferrer">Send on WhatsApp <ArrowUpRight size={15}/></a>
        </div>}
        {!fallback && <button type="submit" className="ar-submit" disabled={busy}>{busy ? <><Loader2 size={17} className="ar-spin"/>Sending…</> : <>Request my audit <ArrowUpRight size={17}/></>}</button>}
        <small className="ar-note">Free. Reviewed by me, not a bot. Your details are only used to send the audit.</small>
      </form>}
      <ol className="ar-steps" aria-label="What you’ll get">{STEPS.map(([n, t, d]) => <li key={n}><b>{n}</b><div><strong>{t}</strong><span>{d}</span></div></li>)}</ol>
    </div>
  </StudyFrame>;
}
