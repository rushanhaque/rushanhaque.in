import { PageIntro } from '@/components/page-intro';
import Link from '@/components/site-link';
import { pageMetadata } from '@/lib/seo';
export const metadata=pageMetadata('/products','Products','Independent tools by Rushan Haque. Nothing shipped yet.');
export default function Products(){return <main id="main-content"><PageIntro eyebrow="PRODUCTS" title="Nothing shipped yet." accent="Two on the bench." description="I build tools for myself first. The ones that survive real work get released, with version and price in plain sight."/><section className="container product-empty"><span className="eyebrow">IN DEVELOPMENT</span><p>Released experiments are in the archive.</p><Link href="/projects?category=Experiments" className="text-link">Experiments ↗</Link></section></main>;}
