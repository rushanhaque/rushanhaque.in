import { ProductStatus } from '@/components/product-status';
import Link from '@/components/site-link';
import { PageIntro } from '@/components/page-intro';
import { ProjectArchive } from '@/components/project-archive';
import { getPublishedContent } from '@/lib/published-content';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('/projects','The work','A collection of client websites, personal products, and experiments by Rushan Haque.');
export default async function Projects({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const {projects}=await getPublishedContent();
  const params=await searchParams;
  const value=(key:string)=>typeof params[key]==='string'?(params[key] as string).slice(0,100):'';
  const years=[...new Set(projects.map(p=>p.year))].sort().reverse();const statuses=[...new Set(projects.map(p=>p.status))];
  const category=['Client work','Experiments'].includes(value('category'))?value('category'):'All';
  const year=years.includes(value('year'))?value('year'):'All';const status=statuses.some(status=>status===value('status'))?value('status'):'All';const q=value('q');
  const matches=projects.filter(p=>(category==='All'||p.category===category)&&(year==='All'||p.year===year)&&(status==='All'||p.status===status)&&`${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const page=Math.max(1,Math.min(Math.ceil(matches.length/12)||1,Math.floor(Number(value('page')))||1));
  return <main id="main-content"><PageIntro eyebrow={`THE COLLECTION / ${projects.length} PROJECTS`} title="Ideas, made" accent="real." description="Client work. Personal curiosities. A few things still taking shape. Every project is another way of asking: what could this become?"/><ProjectArchive items={matches.slice((page-1)*12,page*12)} total={matches.length} filters={{category,q,year,status,page}} years={years} statuses={statuses}/><section className="container archive-writing-link"><h2>The other half of the practice.</h2><Link href="/writing" className="text-link">Explore all five books and writing projects ↗</Link></section><ProductStatus/></main>;
}
