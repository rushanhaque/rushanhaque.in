'use client';
import { Search } from 'lucide-react';
import Link from '@/components/site-link';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/lib/content';
import { useWebMCP } from '@/lib/webmcp';
export type ArchiveFilters = { category: string; q: string; year: string; status: string };
export function ProjectArchive({items,total,filters,years,statuses}:{items:Project[];total:number;filters:ArchiveFilters;years:string[];statuses:string[]}) {
  useWebMCP({name:'filter_project_collection',description:'Navigate to a shareable filtered project collection.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['All','Client work','Experiments']},query:{type:'string',maxLength:100}},required:['category','query'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const value=input as {category?:unknown;query?:unknown};if(!value||typeof value.query!=='string'||value.query.length>100||typeof value.category!=='string'||!['All','Client work','Experiments'].includes(value.category))throw new Error('Choose a valid category and search term.');const params=new URLSearchParams({category:value.category,q:value.query});window.location.assign(`/projects?${params}`);return{navigating:true};}});
  return <section className="container archive-section">
    <form action="/projects" method="get" className="archive-query">
      <label>Collection<select name="category" defaultValue={filters.category}>{['All','Client work','Experiments'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Year<select name="year" defaultValue={filters.year}><option value="All">All years</option>{years.map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Status<select name="status" defaultValue={filters.status}><option value="All">All statuses</option>{statuses.map(v=><option key={v}>{v}</option>)}</select></label>
      <label className="archive-search">Search<input name="q" defaultValue={filters.q} maxLength={100} placeholder="Title, idea, or technology" type="search"/></label>
      <button className="button primary" type="submit"><Search size={16}/>Find work</button>
      <Link href="/projects" className="text-link">Clear filters</Link>
    </form>
    <div className="archive-count" aria-live="polite"><span>{total} {total===1?'project':'projects'}</span></div>
    <div className="archive-grid">{items.map(project=><div key={project.slug}><ProjectCard project={project}/></div>)}</div>
    {!total&&<div className="empty-state"><h2 suppressHydrationWarning>No matching projects.</h2><p>Try a broader search or clear your filters.</p><Link className="button primary" href="/projects">Show all projects</Link></div>}
  </section>;
}
