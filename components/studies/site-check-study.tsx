'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import Link from '@/components/site-link';
import type { SiteReport, Check } from '@/lib/site-check';
import { StudyFrame } from '@/components/studies/study-frame';

const SAMPLES = ['taifinternational.co', 'aurelio.in'];
const SERVICES: Check['service'][] = ['Performance', 'SEO + GEO', 'Development', 'Accessibility'];

// Study 06 — type any public website address; the server runs seventeen real
// checks and the report maps every gap to the service that closes it.
export function SiteCheckStudy() {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<SiteReport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const run = async (target: string) => {
    const value = target.trim();
    if (!value) { setError('Enter a website address.'); return; }
    controller.current?.abort();
    const ac = new AbortController(); controller.current = ac;
    setBusy(true); setError(''); setReport(null); setUrl(value);
    try {
      const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: value }), signal: ac.signal });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'The check could not run.');
      setReport(body as SiteReport);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally { if (controller.current === ac) setBusy(false); }
  };

  const host = report ? new URL(report.finalUrl).hostname.replace(/^www\./, '') : '';
  const fixes = report?.checks.filter(c => c.status === 'fix') ?? [];
  const message = report ? `Hi Rushan, I ran ${host} through your site check: ${report.summary.pass} of ${report.summary.total} passed. I’d like help with: ${fixes.map(f => f.label.toLowerCase()).join('; ')}.` : '';
  const readout = report
    ? <><b>{report.summary.total} CHECKS</b><span>{report.summary.pass} PASS</span><span>{report.summary.fix} TO FIX</span><span>GEO-READY: {report.summary.geoReady ? 'YES' : 'NO'}</span><span>{host.toUpperCase()}</span></>
    : busy ? <><b>SCANNING</b><span>{url.toUpperCase()}</span></> : <><b>READY</b><span>ENTER A URL</span></>;

  return <StudyFrame id="study-06" number="06" name="YOUR SITE, UNDER THE LENS" title={<>Bring your website.<br/><em>I’ll show what I’d fix.</em></>}
    truth="Give me a URL and I’ll show you what I’d fix. Every gap maps to something I do."
    readout={readout} announce={report ? `${report.summary.pass} of ${report.summary.total} checks passed for ${host}` : busy ? `Checking ${url}` : error}
    caption={<p>Seventeen checks on the page you enter: security, speed, search, AI readiness and accessibility. Public sites only. Nothing is stored.</p>}
    className="study-check">
    <form className="sc-form" onSubmit={e => { e.preventDefault(); void run(url); }}>
      <label htmlFor="sc-url" className="sr-only">Website address</label>
      <span className="sc-prefix" aria-hidden="true">https://</span>
      <input id="sc-url" type="text" inputMode="url" autoComplete="url" spellCheck={false} placeholder="yourbusiness.com" value={url} onChange={e => setUrl(e.target.value)} maxLength={300}/>
      <button type="submit" className="study-button is-primary" disabled={busy}><Search size={16}/>{busy ? 'Checking…' : 'Check it'}</button>
    </form>
    <div className="sc-samples">Or try mine: {SAMPLES.map(s => <button key={s} type="button" onClick={() => void run(s)} disabled={busy}>{s}</button>)}</div>
    {error && <p className="sc-error" role="alert">{error}</p>}
    <div className={`sc-sheet ${busy ? 'is-busy' : ''} ${report ? 'is-done' : ''}`}>
      {!report && <div className="sc-empty"><span className="sc-beam" aria-hidden="true"/><p>{busy ? `Reading ${url}…` : 'The report appears here.'}</p></div>}
      {report && <>
        <header className="sc-head">
          <div><span className="sc-kicker">DIAGNOSIS · {new Date(report.checkedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span><h3>{report.title || host}</h3><a href={report.finalUrl} target="_blank" rel="noopener noreferrer">{report.finalUrl}</a></div>
          <div className="sc-score" aria-label={`${report.summary.pass} of ${report.summary.total} checks passed`}><b>{report.summary.pass}</b><span>/ {report.summary.total}</span><i style={{ '--p': report.summary.pass / report.summary.total } as React.CSSProperties}/></div>
        </header>
        <div className="sc-groups">{SERVICES.map(service => {
          const items = report.checks.filter(c => c.service === service);
          if (!items.length) return null;
          return <section key={service} className="sc-group"><h4>{service}<span>{items.filter(i => i.status === 'pass').length}/{items.length}</span></h4>
            <ul>{items.map((c, k) => <li key={c.id} className={`is-${c.status}`} style={{ '--k': k } as React.CSSProperties}><span className="sc-badge">{c.status === 'pass' ? 'PASS' : 'FIX'}</span><div><strong>{c.label}</strong><small>{c.detail}</small></div></li>)}</ul></section>;
        })}</div>
        {fixes.length > 0 ? <Link href={`/contact?message=${encodeURIComponent(message)}`} className="sc-cta">Fix these {fixes.length} with me <ArrowUpRight size={18}/></Link> : <p className="sc-clean">Every check passed. That’s rare. <Link href="/contact">Let’s talk about what’s next <ArrowUpRight size={14}/></Link></p>}
      </>}
    </div>
  </StudyFrame>;
}
