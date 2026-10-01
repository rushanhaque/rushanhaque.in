'use client';
import { useState } from 'react';
import { useContent } from '@/components/content-provider';
import { ArrowUpRight, Asterisk } from 'lucide-react';
import { thumbnail } from '@/lib/images';
export function CredentialCatalogue(){
 const {certifications}=useContent();const [query,setQuery]=useState('');const [type,setType]=useState('All');
 const category=(c:typeof certifications[number])=>c.category??(c.title.includes('Simulation')?'Job simulations':'Training');
 const results=certifications.filter(c=>(type==='All'||category(c)===type)&&`${c.title} ${c.issuer} ${c.date}`.toLowerCase().includes(query.toLowerCase()));
 return <section className="container"><div className="catalogue-controls"><label>Find a document<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or issuer"/></label><label>Document type<select value={type} onChange={e=>setType(e.target.value)}>{['All','Training','Job simulations','Offer letters','Experience','Visits'].map(t=><option key={t}>{t}</option>)}</select></label><span aria-live="polite">{results.length} {results.length===1?'document':'documents'}</span></div><div className="credential-grid">{results.map(c=><article className="credential-card" key={c.title}>{c.image&&<a className="credential-scan" href={c.image} target="_blank" rel="noopener noreferrer" aria-label={`Open original: ${c.title}`}><img src={thumbnail(c.image)} alt={`${c.title} document`} loading="lazy" decoding="async"/></a>}<div><span>{category(c)}</span><Asterisk size={24}/></div>{c.issuer!=='See document'&&<span className="eyebrow">{c.issuer}</span>}<h2>{c.title}</h2>{c.date!=='See document'&&<p>{c.date}</p>}{c.id&&<span className="credential-id">Credential ID: {c.id}</span>}{c.image?<a href={c.image} target="_blank" rel="noopener noreferrer" className="text-link">Open original document <ArrowUpRight size={15}/></a>:<p className="small-note">Listed credential · scan not available.</p>}</article>)}</div>{!results.length&&<div className="empty-state"><p>No documents match these filters.</p><button className="button outline" onClick={()=>{setQuery('');setType('All');}}>Clear filters</button></div>}</section>;
}
