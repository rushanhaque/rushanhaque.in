'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { z } from 'zod';
import { ArrowDown, ArrowUp, Check, ExternalLink, ImagePlus, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { projectsSchema, editorialSchema, validateContent, type ContentFile } from '@/lib/content-schema';

type Project = z.infer<typeof projectsSchema>[number];
type Editorial = z.infer<typeof editorialSchema>;
type Writing = Editorial['writings'][number];
type Review = Editorial['reviews'][number];
type Stat = Editorial['stats'][number];
type Files = { projects: { sha: string; data: Project[] }; editorial: { sha: string; data: Editorial } };
type Status = { ready: boolean; repository: string; branch: string };
type Tab = 'projects' | 'blogs' | 'reviews' | 'numbers';
type Publish = { file: ContentFile; state: 'saving' | 'building' | 'live' | 'slow'; url?: string; hash?: string };

const TABS: { id: Tab; label: string; file: ContentFile }[] = [
  { id: 'projects', label: 'Works', file: 'projects' },
  { id: 'blogs', label: 'Blogs', file: 'editorial' },
  { id: 'reviews', label: 'Reviews', file: 'editorial' },
  { id: 'numbers', label: 'Numbers', file: 'editorial' },
];
const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
const uniqueSlug = (base: string, taken: string[]) => { let s = slugify(base), n = 2; while (taken.includes(s)) s = `${slugify(base)}-${n++}`; return s; };
const year = String(new Date().getFullYear());
const month = new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Something went wrong.';
const issue = (e: unknown) => { const z = e as { issues?: { path: (string | number)[]; message: string }[] }; return z?.issues?.[0] ? `${z.issues[0].path.join(' › ')}: ${z.issues[0].message}` : errorText(e); };

// Resizes an image to at most 1800px wide and converts it to WebP before upload.
async function toWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob(b => b ? ok(b) : fail(Error('Could not convert the image.')), 'image/webp', .84));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="ad-field"><span>{label}{hint && <small>{hint}</small>}</span>{children}</label>;
}

export function ContentStudio() {
  const [files, setFiles] = useState<Files | null>(null);
  const [saved, setSaved] = useState<Record<ContentFile, string>>({ projects: '', editorial: '' });
  const [status, setStatus] = useState<Status | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('projects');
  const [pick, setPick] = useState<Record<Tab, number>>({ projects: 0, blogs: 0, reviews: 0, numbers: 0 });
  const [publish, setPublish] = useState<Publish | null>(null);
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const poll = useRef(0);
  // Items added in this session take their address (slug) from their title until published.
  const [fresh, setFresh] = useState<string[]>([]);

  const load = useCallback(async () => {
    setError(''); setFiles(null);
    try {
      const r = await fetch('/api/admin/content', { cache: 'no-store' });
      const body = await r.json();
      if (!r.ok) throw Error(body.error);
      setFiles(body.files); setStatus(body.status); setReadOnly(body.readOnly);
      setSaved({ projects: JSON.stringify(body.files.projects.data), editorial: JSON.stringify(body.files.editorial.data) });
    } catch (e) { setError(errorText(e)); }
  }, []);
  // Loading the content is what this effect synchronises with.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); return () => window.clearInterval(poll.current); }, [load]);

  const dirty = useMemo(() => files ? { projects: JSON.stringify(files.projects.data) !== saved.projects, editorial: JSON.stringify(files.editorial.data) !== saved.editorial } : { projects: false, editorial: false }, [files, saved]);
  useEffect(() => {
    if (!dirty.projects && !dirty.editorial) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (error && !files) return <div className="ad-panel ad-empty"><p>{error}</p><button className="ad-btn" onClick={load}><RotateCcw size={15}/>Try again</button></div>;
  if (!files || !status) return <div className="ad-panel ad-empty"><Loader2 className="ad-spin" size={20}/><p>Loading your content from GitHub…</p></div>;

  const file = TABS.find(t => t.id === tab)!.file;
  const projects = files.projects.data, ed = files.editorial.data;
  const setProjects = (next: Project[]) => setFiles({ ...files, projects: { ...files.projects, data: next } });
  const setEd = (next: Partial<Editorial>) => setFiles({ ...files, editorial: { ...files.editorial, data: { ...ed, ...next } } });
  const list: unknown[] = tab === 'projects' ? projects : tab === 'blogs' ? ed.writings : tab === 'reviews' ? ed.reviews : ed.stats;
  const index = Math.min(pick[tab], Math.max(0, list.length - 1));
  const select = (i: number) => setPick({ ...pick, [tab]: i });
  const setList = (next: unknown[]) => {
    if (tab === 'projects') setProjects(next as Project[]);
    else setEd(tab === 'blogs' ? { writings: next as Writing[] } : tab === 'reviews' ? { reviews: next as Review[] } : { stats: next as Stat[] });
  };
  const update = <T,>(patch: Partial<T>) => {
    const current = list[index] as { slug?: string };
    const named = (patch as { title?: string; originalTitle?: string }).originalTitle ?? (patch as { title?: string }).title;
    let extra = {};
    if (current.slug && fresh.includes(current.slug) && named && (tab === 'projects' || tab === 'blogs')) {
      const slug = uniqueSlug(named, (list as { slug: string }[]).filter((_, i) => i !== index).map(x => x.slug));
      extra = { slug }; setFresh(f => [...f.filter(x => x !== current.slug), slug]);
    }
    setList(list.map((item, i) => i === index ? { ...(item as object), ...patch, ...extra } : item));
  };
  const move = (dir: -1 | 1) => { const j = index + dir; if (j < 0 || j >= list.length) return; const next = [...list]; [next[index], next[j]] = [next[j], next[index]]; setList(next); select(j); };
  const remove = () => {
    const item = list[index] as { title?: string; originalTitle?: string; name?: string; label?: string };
    if (!window.confirm(`Delete “${item.originalTitle || item.title || item.name || item.label || 'this item'}”? It disappears from the site once you publish.`)) return;
    setList(list.filter((_, i) => i !== index)); select(Math.max(0, index - 1));
  };
  const add = () => {
    let item: unknown;
    if (tab === 'projects') {
      const number = String(Math.max(0, ...projects.map(p => Number(p.number))) + 1).padStart(2, '0');
      item = { slug: uniqueSlug('new-project', projects.map(p => p.slug)), title: 'New project', category: 'Client work', discipline: 'Web design & development', year, description: 'A short line about the project.', tags: [], url: '', image: null, status: 'Client work', number } satisfies Project;
    } else if (tab === 'blogs') {
      item = { slug: uniqueSlug('new-writing', ed.writings.map(w => w.slug)), title: 'New writing', originalTitle: 'New writing', category: 'Blog', year, status: 'Published', url: '', description: 'A short line about this piece.', paragraphs: ['A short line about this piece.'], source: 'Rushan Haque' } satisfies Writing;
    } else if (tab === 'reviews') {
      item = { name: 'Name', company: '', location: '', date: month, rating: '5.0', quote: 'What they said.' } satisfies Review;
    } else item = { value: '0', label: 'New number' } satisfies Stat;
    const slug = (item as { slug?: string }).slug; if (slug) setFresh(f => [...f, slug]);
    setList([item, ...list]); select(0);
  };

  async function upload(f: File | undefined, apply: (path: string) => void, base: string) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { setNotice('Use a JPG, PNG or WebP image.'); return; }
    if (f.size > 10 * 1024 * 1024) { setNotice('That image is over 10 MB.'); return; }
    setUploading(true); setNotice('');
    try {
      const r = await fetch('/api/admin/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${slugify(base)}.webp`, data: await toWebp(f) }) });
      const body = await r.json(); if (!r.ok) throw Error(body.error);
      apply(body.path); setNotice('Image uploaded. Publish to put it on the site.');
    } catch (e) { setNotice(errorText(e)); } finally { setUploading(false); }
  }

  async function publishFile(target: ContentFile) {
    if (!files) return;
    let data: unknown;
    try {
      // Keep derived fields consistent before validating.
      if (target === 'editorial') data = { ...ed, writings: ed.writings.map(w => ({ ...w, title: w.title || w.originalTitle, paragraphs: w.paragraphs?.length ? w.paragraphs : [w.description] })) };
      else data = projects;
      data = validateContent(target, data);
    } catch (e) { setNotice(`Fix this before publishing — ${issue(e)}`); return; }
    setPublish({ file: target, state: 'saving' }); setNotice('');
    try {
      const r = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: target, data, sha: files[target].sha, message: `Update ${target === 'projects' ? 'projects' : 'blogs, reviews and numbers'} from admin` }) });
      const body = await r.json(); if (!r.ok) throw Error(body.error);
      setFiles({ ...files, [target]: { sha: body.sha, data } });
      setSaved(s => ({ ...s, [target]: JSON.stringify(data) })); setFresh([]);
      setPublish({ file: target, state: 'building', url: body.url, hash: body.hash });
      // Vercel rebuilds from the commit; the new build reports the new content hash.
      const started = Date.now();
      window.clearInterval(poll.current);
      poll.current = window.setInterval(async () => {
        try {
          const v = await (await fetch('/api/version', { cache: 'no-store' })).json() as { content?: Record<string, string> };
          if (v.content?.[target] === body.hash) { window.clearInterval(poll.current); setPublish(p => p && { ...p, state: 'live' }); }
          else if (Date.now() - started > 6 * 60000) { window.clearInterval(poll.current); setPublish(p => p && { ...p, state: 'slow' }); }
        } catch { /* keep waiting */ }
      }, 8000);
    } catch (e) { setPublish(null); setNotice(errorText(e)); }
  }

  const item = list[index] as Record<string, unknown> | undefined;
  const titleOf = (it: unknown) => { const x = it as Record<string, string>; return tab === 'projects' ? x.title : tab === 'blogs' ? x.originalTitle : tab === 'reviews' ? x.name : `${x.value} · ${x.label}`; };
  const subOf = (it: unknown) => { const x = it as Record<string, string>; return tab === 'projects' ? `${x.category} · ${x.year}` : tab === 'blogs' ? `${x.category} · ${x.year}` : tab === 'reviews' ? [x.company, x.date].filter(Boolean).join(' · ') : ''; };

  return <div className="ad">
    <div className="ad-connection">
      <span className={status.ready ? 'is-ok' : 'is-bad'}>{status.ready ? <Check size={14}/> : '!'}</span>
      <p>{status.ready ? <>Connected to <b>{status.repository}</b> on <b>{status.branch}</b>. Publishing commits there and Vercel updates the site.</> : <>No GitHub token on Vercel, so you can browse but not publish. Add <code>GITHUB_TOKEN</code> (a fine-grained token with Contents: read and write on {status.repository}) and redeploy.</>}</p>
    </div>

    <div className="ad-tabs" role="tablist">{TABS.map(t => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}<small>{t.id === 'projects' ? projects.length : t.id === 'blogs' ? ed.writings.length : t.id === 'reviews' ? ed.reviews.length : ed.stats.length}</small></button>)}</div>

    <div className="ad-bar">
      <p>{tab === 'projects' ? 'The first five client projects with an image appear in Recent works on the homepage. Use the arrows to reorder.' : tab === 'blogs' ? 'Blogs and books appear on the homepage shelf. Each opens its link.' : tab === 'reviews' ? 'Reviews appear on the homepage and the Reviews page, in this order.' : 'The numbers in the Journey section of the homepage.'}</p>
      <div className="ad-bar-actions">
        {dirty[file] && <span className="ad-unsaved">Unpublished changes</span>}
        {dirty[file] && <button className="ad-btn is-ghost" onClick={() => { if (window.confirm('Discard your unpublished changes?')) setFiles({ ...files, [file]: { ...files[file], data: JSON.parse(saved[file]) } }); }}><RotateCcw size={15}/>Discard</button>}
        <button className="ad-btn is-solid" disabled={readOnly || !dirty[file] || publish?.state === 'saving'} onClick={() => publishFile(file)}>{publish?.state === 'saving' && publish.file === file ? <><Loader2 className="ad-spin" size={15}/>Publishing…</> : 'Publish changes'}</button>
      </div>
    </div>
    {publish && publish.state !== 'saving' && <div className={`ad-live is-${publish.state}`} role="status">
      {publish.state === 'building' && <><Loader2 className="ad-spin" size={15}/>Saved to GitHub. Vercel is rebuilding the site, usually 1–2 minutes…</>}
      {publish.state === 'live' && <><Check size={15}/>Live on the website now.</>}
      {publish.state === 'slow' && <>Saved to GitHub. The rebuild is taking longer than usual; check Vercel if it doesn’t appear soon.</>}
      {publish.url && <a href={publish.url} target="_blank" rel="noopener noreferrer">View commit <ExternalLink size={13}/></a>}
    </div>}
    {notice && <div className="ad-notice" role="alert"><span>{notice}</span>{notice.includes('changed on GitHub') && <button className="ad-btn is-ghost" onClick={() => { setNotice(''); void load(); }}><RotateCcw size={15}/>Reload latest</button>}</div>}

    <div className="ad-work">
      <aside className="ad-list">
        <button className="ad-add" onClick={add}><Plus size={16}/>Add {tab === 'projects' ? 'work' : tab === 'blogs' ? 'blog' : tab === 'reviews' ? 'review' : 'number'}</button>
        <ol>{list.map((it, i) => <li key={i}><button aria-current={i === index} onClick={() => select(i)}><strong>{titleOf(it) || 'Untitled'}</strong>{subOf(it) && <small>{subOf(it)}</small>}</button></li>)}</ol>
      </aside>

      {item ? <section className="ad-form" key={`${tab}-${index}`}>
        <div className="ad-form-head">
          <h3>{titleOf(item) || 'Untitled'}</h3>
          <div><button className="ad-icon" onClick={() => move(-1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={16}/></button><button className="ad-icon" onClick={() => move(1)} disabled={index === list.length - 1} aria-label="Move down"><ArrowDown size={16}/></button><button className="ad-icon is-danger" onClick={remove} aria-label="Delete"><Trash2 size={16}/></button></div>
        </div>

        {tab === 'projects' && (() => { const p = item as unknown as Project; return <div className="ad-grid">
          <Field label="Title"><input value={p.title} onChange={e => update<Project>({ title: e.target.value })} maxLength={120}/></Field>
          <Field label="Collection"><select value={p.category} onChange={e => update<Project>({ category: e.target.value as Project['category'] })}><option>Client work</option><option>Experiments</option></select></Field>
          <Field label="Discipline"><input value={p.discipline} onChange={e => update<Project>({ discipline: e.target.value })}/></Field>
          <Field label="Year"><input value={p.year} inputMode="numeric" maxLength={4} onChange={e => update<Project>({ year: e.target.value })}/></Field>
          <Field label="Label" hint="Shown on the card. Pick one or write your own">
            <input list="status-options" value={p.status} maxLength={40} onChange={e => update<Project>({ status: e.target.value })}/>
            <datalist id="status-options"><option value="Client work"/><option value="Under development"/><option value="Coming soon"/><option value="In progress"/><option value="Experiment"/><option value="Live"/></datalist>
          </Field>
          <Field label="Website link" hint="Leave empty if not public"><input value={p.url} placeholder="https://" onChange={e => update<Project>({ url: e.target.value.trim() })}/></Field>
          <Field label="Short description" hint="Shown on the Works page"><textarea rows={3} value={p.description} maxLength={400} onChange={e => update<Project>({ description: e.target.value })}/></Field>
          <label className="ad-check"><input type="checkbox" checked={!!p.showDescription || !p.image} disabled={!p.image} onChange={e => update<Project>({ showDescription: e.target.checked })}/><span>{p.image ? 'Show the description under this work on the Works page' : 'No preview image, so the description is shown on the Works page automatically'}</span></label>
          <Field label="Tags" hint="Comma separated"><input value={p.tags.join(', ')} onChange={e => update<Project>({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean).slice(0, 15) })}/></Field>
          <Field label="Preview image" hint="Optional. Works without one show their description">
            <div className="ad-image">{p.image ? <img src={p.image} alt=""/> : <span>No image</span>}
              <label className="ad-btn is-ghost">{uploading ? <Loader2 className="ad-spin" size={15}/> : <ImagePlus size={15}/>}{p.image ? 'Replace' : 'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => upload(e.target.files?.[0], path => update<Project>({ image: path }), p.slug)}/></label>
              {p.image && <button className="ad-btn is-ghost" onClick={() => update<Project>({ image: null })}>Remove</button>}
            </div>
          </Field>
          <p className="ad-meta">Address on the site: /projects/{p.slug} · Number {p.number}</p>
        </div>; })()}

        {tab === 'blogs' && (() => { const w = item as unknown as Writing; return <div className="ad-grid">
          <Field label="Title"><input value={w.originalTitle} onChange={e => update<Writing>({ originalTitle: e.target.value, title: e.target.value })} maxLength={140}/></Field>
          <Field label="Type" hint="e.g. Technical note, Book, Blog"><input value={w.category} onChange={e => update<Writing>({ category: e.target.value })}/></Field>
          <Field label="Year"><input value={w.year} inputMode="numeric" maxLength={4} onChange={e => update<Writing>({ year: e.target.value })}/></Field>
          <Field label="Status"><select value={w.status} onChange={e => update<Writing>({ status: e.target.value as Writing['status'] })}><option>Published</option><option>Ongoing</option><option>Forthcoming</option></select></Field>
          <Field label="Link" hint="Where the book opens"><input value={w.url} placeholder="https://" onChange={e => update<Writing>({ url: e.target.value.trim() })}/></Field>
          <Field label="Description"><textarea rows={3} value={w.description} onChange={e => update<Writing>({ description: e.target.value, paragraphs: [e.target.value] })}/></Field>
          <Field label="Cover image" hint="Optional">
            <div className="ad-image">{w.image ? <img src={w.image} alt=""/> : <span>Designed cover</span>}
              <label className="ad-btn is-ghost">{uploading ? <Loader2 className="ad-spin" size={15}/> : <ImagePlus size={15}/>}{w.image ? 'Replace' : 'Upload'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => upload(e.target.files?.[0], path => update<Writing>({ image: path }), `writing-${w.slug}`)}/></label>
              {w.image && <button className="ad-btn is-ghost" onClick={() => update<Writing>({ image: undefined })}>Remove</button>}
            </div>
          </Field>
        </div>; })()}

        {tab === 'reviews' && (() => { const r = item as unknown as Review; return <div className="ad-grid">
          <Field label="Name"><input value={r.name} onChange={e => update<Review>({ name: e.target.value })} maxLength={100}/></Field>
          <Field label="Company or role"><input value={r.company} onChange={e => update<Review>({ company: e.target.value })} maxLength={200}/></Field>
          <Field label="Location"><input value={r.location} onChange={e => update<Review>({ location: e.target.value })} maxLength={100}/></Field>
          <Field label="Date" hint="e.g. Oct 2026"><input value={r.date} onChange={e => update<Review>({ date: e.target.value })} maxLength={40}/></Field>
          <Field label="Rating"><select value={r.rating || '5.0'} onChange={e => update<Review>({ rating: e.target.value })}>{['5.0', '4.5', '4.0', '3.5', '3.0', '2.0', '1.0'].map(v => <option key={v}>{v}</option>)}</select></Field>
          <Field label="Review"><textarea rows={5} value={r.quote} onChange={e => update<Review>({ quote: e.target.value })}/></Field>
        </div>; })()}

        {tab === 'numbers' && (() => { const s = item as unknown as Stat; return <div className="ad-grid">
          <Field label="Number" hint="e.g. 40+"><input value={s.value} maxLength={12} onChange={e => update<Stat>({ value: e.target.value })}/></Field>
          <Field label="Label"><input value={s.label} maxLength={80} onChange={e => update<Stat>({ label: e.target.value })}/></Field>
        </div>; })()}
      </section> : <section className="ad-form ad-empty"><p>Nothing here yet.</p><button className="ad-btn" onClick={add}><Plus size={15}/>Add the first one</button></section>}
    </div>
  </div>;
}
