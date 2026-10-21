import { BuildingList, WorksList } from '@/components/works-showcase';
import { getPublishedContent } from '@/lib/published-content';
import { placementOf } from '@/lib/project-access';
import { pageMetadata } from '@/lib/seo';
import { Split } from '@/components/split';
import './works.css';
export const metadata=pageMetadata('/projects','Website portfolio — client work','Websites designed and built by Rushan Haque for makers and exporters in Moradabad: live client sites, and the ones being built right now.');
export default async function Projects() {
  const {projects}=await getPublishedContent();
  const works=projects.filter(p=>placementOf(p)==='work'), building=projects.filter(p=>placementOf(p)==='building');
  const two=(n:number)=>String(n).padStart(2,'0');
  return <main id="main-content" className="wk-page">
    <header className="wk-intro container no-fit">
      <span className="eyebrow">WORKS · {two(works.length)} SELECTED{building.length?` · ${two(building.length)} IN PROGRESS`:''}</span>
      <Split as="h1" hero text="Websites for people *who make things.*"/>
      <div className="wk-intro-foot">
        <p>Moradabad has worked brass, copper and wood for centuries, and ships it all over the world. These are the sites I designed and coded for some of its makers: each one from scratch, each one built to sell to buyers who will never visit the workshop.</p>
        <dl>
          <div><dt>Built</dt><dd>From scratch, no templates</dd></div>
          <div><dt>For</dt><dd>Makers &amp; exporters</dd></div>
          <div><dt>From</dt><dd>Moradabad, India</dd></div>
        </dl>
      </div>
    </header>
    <WorksList works={works}/>
    <BuildingList items={building}/>
  </main>;
}
