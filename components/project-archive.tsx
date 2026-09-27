'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ArrowUpRight, LayoutGrid, List, Search } from 'lucide-react';
import Link from '@/components/site-link';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/lib/content';
import { useMotion } from '@/components/site-motion';
import { useWebMCP } from '@/lib/webmcp';
gsap.registerPlugin(Flip);
export type ArchiveFilters = { category: string; q: string; year: string; status: string; page: number };
export function ProjectArchive({items,total,filters,years,statuses}:{items:Project[];total:number;filters:ArchiveFilters;years:string[];statuses:string[]}) {
  const [view,setView]=useState('grid');
  const grid=useRef<HTMLDivElement>(null);
  const flip=useRef<ReturnType<typeof Flip.getState>|null>(null);
  const {reduced}=useMotion();
  // Restore this browser-only preference after the server markup hydrates.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{try{if(localStorage.getItem('rushan-archive-view')==='list')setView('list');}catch{}},[]);
  useLayoutEffect(()=>{if(!flip.current||reduced)return;const animation=Flip.from(flip.current,{duration:.45,ease:'power3.inOut',absolute:true,prune:true});flip.current=null;return()=>{animation.kill();};},[view,reduced]);
  function changeView(value:string){if(grid.current&&!reduced)flip.current=Flip.getState(grid.current.children);setView(value);try{localStorage.setItem('rushan-archive-view',value);}catch{}}
  function pageUrl(page:number){const p=new URLSearchParams();for(const key of ['category','q','year','status'] as const)if(filters[key]&&filters[key]!=='All')p.set(key,filters[key]);if(page>1)p.set('page',String(page));return `/projects${p.size?'?'+p:''}`;}
  useWebMCP({name:'filter_project_collection',description:'Navigate to a shareable filtered project collection.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['All','Client work','Experiments']},query:{type:'string',maxLength:100}},required:['category','query'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const value=input as {category?:unknown;query?:unknown};if(!value||typeof value.query!=='string'||value.query.length>100||typeof value.category!=='string'||!['All','Client work','Experiments'].includes(value.category))throw new Error('Choose a valid category and search term.');const params=new URLSearchParams({category:value.category,q:value.query});window.location.assign(`/projects?${params}`);return{navigating:true};}});
  const pages=Math.max(1,Math.ceil(total/12));
  return <section className="container archive-section">
    <form action="/projects" method="get" className="archive-query">
      <label>Collection<select name="category" defaultValue={filters.category}>{['All','Client work','Experiments'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Year<select name="year" defaultValue={filters.year}><option value="All">All years</option>{years.map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={filters.status}><option value="All">All statuses</option>{statuses.map(v=><option key={v}>{v}</option>)}</select></label>
      <label className="archive-search">Search<input name="q" defaultValue={filters.q} maxLength={100} placeholder="Title, idea, or technology" type="search"/></label>
      <button className="button primary" type="submit"><Search size={16}/>Find work</button>
      <Link href="/projects" className="text-link">Clear filters</Link>
    </form>
    <div className="archive-count" aria-live="polite"><span>{total} {total===1?'project':'projects'} · Page {filters.page} of {pages}</span><div className="archive-view" role="group" aria-label="Project layout"><button onClick={()=>changeView('grid')} aria-label="Grid view" aria-pressed={view==='grid'}><LayoutGrid size={20}/></button><button onClick={()=>changeView('list')} aria-label="List view" aria-pressed={view==='list'}><List size={20}/></button></div></div>
    <div ref={grid} className={`archive-grid ${view==='list'?'archive-list':''}`}>{items.map(project=><div key={project.slug} data-flip-id={project.slug}>{view==='grid'?<ProjectCard project={project}/>:<Link className="archive-list-row" href={`/projects/${project.slug}`}><span>{project.number}</span><h2>{project.title}</h2><span>{project.discipline}</span><span>{project.status}</span><span>{project.year}</span><ArrowUpRight size={20}/>{project.image&&<img className="archive-row-preview" src={project.image} alt="" width="180" height="100" loading="lazy"/>}</Link>}</div>)}</div>
    {!total&&<div className="empty-state"><h2>No matching projects.</h2><p>Try a broader search or clear your filters.</p><Link className="button primary" href="/projects">Show all projects</Link></div>}
    {pages>1&&<nav className="archive-pagination" aria-label="Project pages">{Array.from({length:pages},(_,i)=><Link key={i} href={pageUrl(i+1)} aria-current={filters.page===i+1?'page':undefined}>Page {i+1}</Link>)}</nav>}
  </section>;
}
