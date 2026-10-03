import { PageIntro } from '@/components/page-intro';
import { ProjectArchive } from '@/components/project-archive';
import { getPublishedContent } from '@/lib/published-content';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('/projects','The work','Client websites and experiments by Rushan Haque.');
export default async function Projects({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {projects}=await getPublishedContent();
  const params=await searchParams;
  const value=(key:string)=>typeof params[key]==='string'?(params[key] as string).slice(0,100):'';
  const years=[...new Set(projects.map(p=>p.year))].sort().reverse();const statuses=[...new Set(projects.map(p=>p.status))];
  const category=['Client work','Experiments'].includes(value('category'))?value('category'):'All';
  const year=years.includes(value('year'))?value('year'):'All';const status=statuses.some(status=>status===value('status'))?value('status'):'All';const q=value('q');
  const matches=projects.filter(p=>(category==='All'||p.category===category)&&(year==='All'||p.year===year)&&(status==='All'||p.status===status)&&`${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  
  return <main id="main-content"><PageIntro eyebrow={`WORK / ${projects.length}`} title="Ideas, made" accent="real." description="Client work, experiments, and the things I built to find out whether they’d work."/><ProjectArchive items={matches} total={matches.length} filters={{category,q,year,status}} years={years} statuses={statuses}/></main>;
}
