'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Upload } from 'lucide-react';
import data from '@/content/studies/handover.json';
import { useMotion } from '@/components/site-motion';
import { StudyFrame } from '@/components/studies/study-frame';

type Draft = { photo: number; name: string; finish: string; ready: boolean };
const initial: Draft = { photo: 0, name: data.products[0].name, finish: data.finishes[0], ready: false };
const STEPS = ['Checked', 'Saved', 'Live on the storefront'];

// Study 07 — the admin panel I hand over, as a working model: change a real
// Taif product and the storefront card updates as you type.
export function HandoverStudy() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [published, setPublished] = useState<Draft | null>(null);
  const [step, setStep] = useState(-1);
  const timers = useRef<number[]>([]);
  const { reduced } = useMotion();
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const product = data.products[draft.photo];
  const base = published ?? initial;
  const changed = (['photo', 'name', 'finish', 'ready'] as const).filter(k => draft[k] !== base[k]).length;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft(d => ({ ...d, [key]: value })); setStep(-1); };

  const publish = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    if (reduced) { setStep(STEPS.length - 1); setPublished(draft); return; }
    STEPS.forEach((_, i) => timers.current.push(window.setTimeout(() => { setStep(i); if (i === STEPS.length - 1) setPublished(draft); }, 380 * (i + 1))));
    setStep(0);
  };
  const reset = () => { timers.current.forEach(clearTimeout); setDraft(initial); setPublished(null); setStep(-1); };

  const status = changed ? 'DRAFT' : published ? 'PUBLISHED' : 'LIVE';
  const readout = <><b>{changed} FIELD{changed === 1 ? '' : 'S'} CHANGED</b><span>PREVIEW LIVE</span><span>{status}</span><span>0 LINES OF CODE</span></>;

  return <StudyFrame id="study-07" number="07" name="YOURS TO RUN" title={<>After launch,<br/>it’s <em>yours to run.</em></>}
    truth="You won’t need me to change a price, a photo or a product name. Every commerce site leaves with an admin like this."
    readout={readout} announce={`${changed} fields changed, ${status.toLowerCase()}`}
    caption={<><p>Edit the product and watch the storefront update. A working model with a real Taif International product; nothing leaves your browser.</p><ul className="ho-evidence">{data.evidence.map(e => <li key={e}>{e}</li>)}</ul></>}
    className="study-handover">
    <div className="ho-split">
      <form className="ho-admin" onSubmit={e => { e.preventDefault(); publish(); }} aria-label="Product editor">
        <div className="ho-bar"><span>ADMIN · CATALOGUE</span><span className={`ho-pill ${changed ? 'is-draft' : ''}`}>{changed ? 'Unpublished changes' : 'Up to date'}</span></div>
        <label className="ho-field"><span>Product name</span><input value={draft.name} maxLength={60} onChange={e => set('name', e.target.value)}/></label>
        <fieldset className="ho-field"><legend>Photo</legend><div className="ho-photos">{data.products.map((p, i) => <label key={p.image} className={draft.photo === i ? 'is-on' : ''}><input type="radio" name="ho-photo" checked={draft.photo === i} onChange={() => setDraft(d => ({ ...d, photo: i, name: d.name === data.products[d.photo].name ? p.name : d.name }))}/><img src={p.image} alt={p.name} width="160" height="160" loading="lazy" decoding="async"/></label>)}</div></fieldset>
        <fieldset className="ho-field"><legend>Finish</legend><div className="study-chips">{data.finishes.map(f => <label key={f} className="ho-chip"><input type="radio" name="ho-finish" checked={draft.finish === f} onChange={() => set('finish', f)}/><span>{f}</span></label>)}</div></fieldset>
        <label className="ho-toggle"><input type="checkbox" checked={draft.ready} onChange={e => set('ready', e.target.checked)}/><span aria-hidden="true"><i/></span>Ready to ship <small>(otherwise: made to order)</small></label>
        <div className="ho-actions">
          <button type="submit" className="study-button is-primary" disabled={!changed}><Upload size={16}/>Publish</button>
          <button type="button" className="study-button" onClick={reset}><RotateCcw size={15}/>Reset</button>
        </div>
        <ol className="ho-log" aria-live="polite">{STEPS.map((s, i) => <li key={s} className={step >= i ? 'is-done' : ''}><Check size={13}/>{s}</li>)}</ol>
      </form>
      <div className="ho-store" aria-label="Storefront preview">
        <div className="ho-store-bar"><b>TAIF</b><span>Collections</span><span>Shows</span><span>Contact</span></div>
        <article className="ho-card" key={draft.photo}>
          <div className="ho-card-media"><img src={product.image} alt="" width="720" height="720" loading="lazy" decoding="async"/><span className={`ho-stock ${draft.ready ? 'is-ready' : ''}`}>{draft.ready ? 'Ready to ship' : 'Made to order'}</span></div>
          <div className="ho-card-body">
            <span>{product.category}</span>
            <h3>{draft.name.trim() || 'Untitled product'}</h3>
            <p>{product.material} · {draft.finish} finish</p>
            <span className="ho-card-cta">Request a quote →</span>
          </div>
        </article>
      </div>
    </div>
  </StudyFrame>;
}
