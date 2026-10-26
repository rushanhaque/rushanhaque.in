import { BuildingList, ProductsList, WorksList } from '@/components/works-showcase';
import { getPublishedContent } from '@/lib/published-content';
import { placementOf } from '@/lib/project-access';
import { jsonLd, pageMetadata, siteOrigin } from '@/lib/seo';
import { breadcrumbs, ids } from '@/lib/schema';
import { projectAccess } from '@/lib/project-access';
import { Split } from '@/components/split';
import './works.css';
export const metadata=pageMetadata('/projects','Website portfolio — client work','Websites designed and built by Rushan Haque for businesses in India and abroad: live client sites, and the ones being built right now.');
export default async function Projects() {
  const {projects}=await getPublishedContent();
  const works=projects.filter(p=>placementOf(p)==='work'), building=projects.filter(p=>placementOf(p)==='building'), products=projects.filter(p=>placementOf(p)==='product');
  const two=(n:number)=>String(n).padStart(2,'0');
  // The works as a list of creative works, each linking to the live site or its page here.
  const list = { '@context': 'https://schema.org', '@type': 'CollectionPage', url: `${siteOrigin}/projects`, name: 'Website portfolio', isPartOf: { '@id': ids.website }, author: { '@id': ids.person },
    mainEntity: { '@type': 'ItemList', itemListElement: works.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'CreativeWork', name: p.title, description: p.description, creator: { '@id': ids.person }, url: projectAccess(p) === 'visit' ? p.url : `${siteOrigin}/projects/${p.slug}` } })) } };
  return <main id="main-content" className="wk-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([list, breadcrumbs([['Works', '/projects']])]) }}/>
    <header className="wk-intro container no-fit">
      <span className="eyebrow">WORKS · {two(works.length)} SELECTED{building.length?` · ${two(building.length)} IN PROGRESS`:''}</span>
      <Split as="h1" hero text="Websites, built *from scratch.*"/>
      <div className="wk-intro-foot">
        <p>Websites for businesses in India and abroad, each designed and coded from scratch.</p>
      </div>
    </header>
    <WorksList works={works}/>
    <BuildingList items={building}/>
    <ProductsList items={products}/>
  </main>;
}
