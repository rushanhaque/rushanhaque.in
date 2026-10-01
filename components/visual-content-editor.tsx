'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Search, Trash2 } from 'lucide-react';
import editorial from '@/content/editorial.json';
import type { ContentFile } from '@/lib/content-schema';

type Value = undefined | string | number | boolean | null | Value[] | { [key: string]: Value };
const label = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
function blank(value: Value): Value {
  if (Array.isArray(value)) return value.length ? [blank(value[0])] : [];
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blank(item)]));
  return value === null ? null : typeof value === 'boolean' ? false : typeof value === 'number' ? 0 : '';
}
const emptyCaseStudy = () => ({ context: '', role: '', decisions: [{ title: '', text: '' }, { title: '', text: '' }], reflection: '' });
const options: Record<string, string[]> = { category: ['Client work', 'Experiments'], status: ['Completed', 'In progress', 'Coming soon'] };

function Fields({ value, onChange, name, project = false }: { value: Value; onChange: (v: Value) => void; name: string; project?: boolean }) {
  if (Array.isArray(value)) return <fieldset className="cms-array"><legend>{label(name)}</legend>{value.map((item, index) => <div className="cms-array-item" key={index}><Fields value={item} name={`${name} ${index + 1}`} onChange={next => onChange(value.map((v, i) => i === index ? next : v))}/><button type="button" className="cms-icon" aria-label={`Remove ${name} ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 size={15}/></button></div>)}<button type="button" className="text-link" onClick={() => onChange([...value, name === 'decisions' ? { title: '', text: '' } : value.length ? blank(value[0]) : ''])}><Plus size={14}/> Add {name === 'decisions' ? 'decision' : 'item'}</button></fieldset>;
  if (value !== null && typeof value === 'object') return <div className="cms-fields">{Object.entries(value).map(([key, item]) => <Fields key={key} name={key} value={item} project={project} onChange={next => onChange({ ...value, [key]: next })}/>)}</div>;
  if (typeof value === 'boolean') return <label className="cms-field"><span>{label(name)}</span><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/></label>;
  const choices = project ? options[name] : name === 'status' ? ['Published', 'Ongoing', 'Forthcoming'] : undefined;
  const long = ['description', 'context', 'reflection', 'text', 'quote'].includes(name) || name.startsWith('paragraphs');
  return <label className={`cms-field ${long ? 'cms-field-wide' : ''}`}><span>{label(name)}</span>{choices ? <select value={String(value ?? '')} onChange={e => onChange(e.target.value)}>{choices.map(v => <option key={v}>{v}</option>)}</select> : long ? <textarea rows={4} value={String(value ?? '')} onChange={e => onChange(e.target.value)}/> : <input value={String(value ?? '')} onChange={e => onChange(name === 'image' && !e.target.value ? (project?null:undefined) : e.target.value)} spellCheck={!['slug', 'url', 'image', 'id'].includes(name)}/>} {name === 'image' && <small>Existing asset path, for example /images/erfolg.webp. Leave empty for a typographic cover.</small>}</label>;
}

export function VisualContentEditor({ file, draft, onChange, disabled }: { file: ContentFile; draft: string; onChange: (v: string) => void; disabled: boolean }) {
  const [collection, setCollection] = useState('writings');
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState('');
  const [remove, setRemove] = useState(false);
  if (!draft) return <p role="status">Loading collection…</p>;
  let data: Value;
  try { data = JSON.parse(draft); } catch { return <p role="status">Load a collection, or correct the JSON in advanced mode, to use the visual editor.</p>; }
  if (!data || typeof data !== 'object' || (file === 'editorial' && Array.isArray(data))) return <p role="status">Correct the collection structure in advanced mode before using visual fields.</p>;
  const rows = (file === 'projects' ? data : (data as Record<string, Value>)[collection]) as Record<string, Value>[];
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) return <p role="status">This collection must be a list of records. Correct it in advanced mode.</p>;
  const index = Math.min(selected, Math.max(0, rows.length - 1));
  const row = rows[index];
  function update(next: Record<string, Value>[]) { onChange(JSON.stringify(file === 'projects' ? next : { ...(data as object), [collection]: next }, null, 2)); }
  function add() {
    const record: Record<string, Value> = file === 'projects'
      ? { slug: '', title: '', category: 'Client work', discipline: '', year: String(new Date().getFullYear()), description: '', tags: [], url: '', image: null, status: 'In progress', number: '' }
      : blank(JSON.parse(JSON.stringify(editorial[collection as keyof typeof editorial][0]))) as Record<string, Value>;
    if ('year' in record) record.year = String(new Date().getFullYear());
    if (file === 'editorial' && 'status' in record) record.status = 'Forthcoming';
    if ('title' in record) record.title = 'Untitled entry';
    if ('slug' in record) record.slug = `new-entry-${crypto.randomUUID().slice(0, 8)}`;
    if ('number' in record) record.number = String(rows.length + 1).padStart(2, '0');
    update([...rows, record]); setSelected(rows.length); setQuery(''); setRemove(false);
  }
  function move(direction: number) { const next = [...rows]; const target = index + direction; [next[index], next[target]] = [next[target], next[index]]; update(next); setSelected(target); }
  return <fieldset className="cms-visual" disabled={disabled}><div className="cms-collection-bar">{file === 'editorial' && <label>Section<select value={collection} onChange={e => { setCollection(e.target.value); setSelected(0); setQuery(''); setRemove(false); }}>{Object.keys(editorial).map(key => <option value={key} key={key}>{label(key)}</option>)}</select></label>}<span>{rows.length} entries</span><button className="button primary" type="button" onClick={add}><Plus size={16}/> New entry</button></div><div className="cms-workspace"><aside className="cms-records"><label className="cms-search"><Search size={16}/><input aria-label="Find an entry" placeholder="Find an entry…" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="cms-record-list">{rows.map((entry, i) => ({ entry, i })).filter(({ entry }) => String(entry.title || entry.role || entry.name || '').toLowerCase().includes(query.toLowerCase())).map(({ entry, i }) => <button type="button" key={i} aria-pressed={i === index} onClick={() => { setSelected(i); setRemove(false); }}><small>{String(i + 1).padStart(2, '0')} / {String(entry.status || entry.category || collection)}</small><strong>{String(entry.title || entry.role || entry.name || 'Untitled')}</strong></button>)}</div></aside><div className="cms-detail">{row ? <><div className="cms-detail-top"><span>ENTRY {String(index + 1).padStart(2, '0')}</span><div><button className="cms-icon" disabled={index === 0} onClick={() => move(-1)} aria-label="Move entry up"><ArrowUp size={17}/></button><button className="cms-icon" disabled={index === rows.length - 1} onClick={() => move(1)} aria-label="Move entry down"><ArrowDown size={17}/></button><button className="cms-icon" onClick={() => setRemove(!remove)} aria-label="Delete entry"><Trash2 size={17}/></button></div></div>{remove && <div className="cms-delete"><p>Remove this entry from the draft?</p><button className="button outline" onClick={() => { update(rows.filter((_, i) => i !== index)); setSelected(Math.max(0, index - 1)); setRemove(false); }}>Remove entry</button><button className="text-link" onClick={() => setRemove(false)}>Keep entry</button></div>}{typeof row.image === 'string' && /^\/images\/[a-zA-Z0-9._-]+$/.test(row.image) && <img className="cms-image-preview" src={row.image} alt="Selected project preview" width={640} height={310}/>}{file === 'projects' && <button type="button" className="button outline" onClick={() => { const next = { ...row }; if (next.caseStudy) delete next.caseStudy; else next.caseStudy = emptyCaseStudy(); update(rows.map((entry, i) => i === index ? next : entry)); }}>{row.caseStudy ? 'Remove case study from draft' : 'Add case study'}</button>}<Fields value={row} name="entry" project={file === 'projects'} onChange={value => update(rows.map((entry, i) => i === index ? value as Record<string, Value> : entry))}/></> : <p>This section is empty. Add an entry to begin.</p>}</div></div></fieldset>;
}
