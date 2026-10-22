import { BuildingList, WorksList } from '@/components/works-showcase';
import { getPublishedContent } from '@/lib/published-content';
import { placementOf } from '@/lib/project-access';
import { pageMetadata } from '@/lib/seo';
import { Split } from '@/components/split';
import './works.css';
export const metadata=pageMetadata('/projects','Website portfolio — client work','Websites designed and built by Rushan Haque for businesses in India and abroad: live client sites, and the ones being built right now.');
export default async function Projects() {
  const {projects}=await getPublishedContent();
  const works=projects.filter(p=>placementOf(p)==='work'), building=projects.filter(p=>placementOf(p)==='building');
  const two=(n:number)=>String(n).padStart(2,'0');
  return <main id="main-content" className="wk-page">
    <header className="wk-intro container no-fit">
      <span className="eyebrow">WORKS · {two(works.length)} SELECTED{building.length?` · ${two(building.length)} IN PROGRESS`:''}</span>
      <Split as="h1" hero text="Websites, built *from scratch.*"/>
      <div className="wk-intro-foot">
        <p>Websites for businesses in India and abroad, each designed and coded from scratch.</p>
      </div>
    </header>
    <WorksList works={works}/>
    <BuildingList items={building}/>
  </main>;
}
