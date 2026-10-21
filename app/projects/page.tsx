import { Fragment } from 'react';
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
        <p>Online stores, export catalogues and brand websites for businesses in India and abroad. Each one is designed around how its customers decide, coded from scratch, fast on a phone and built to be found on Google and in AI answers.</p>
        <dl>
          <div><dt>Built</dt><dd>From scratch, no templates</dd></div>
          <div><dt>For</dt><dd>Businesses in India &amp; abroad</dd></div>
          <div><dt>Covers</dt><dd>Design, code, launch &amp; support</dd></div>
        </dl>
      </div>
    </header>
    <div className="wk-ticker" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{works.map((p, i) => <Fragment key={p.slug}><b className={i % 2 ? 'is-serif' : 'is-line'}>{p.title}</b><svg viewBox="0 0 24 24"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/></svg></Fragment>)}</span>)}</div></div>
    <WorksList works={works}/>
    <BuildingList items={building}/>
  </main>;
}
