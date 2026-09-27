export const dynamic='force-dynamic';
import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedContent } from '@/lib/published-content';
import { PageIntro } from '@/components/page-intro';
export const metadata=pageMetadata('/insights','In the margins','Short reflections on design, interaction, and the practice of asking better questions.');
export default async function Insights(){const {insights}=await getPublishedContent();return <main id="main-content"><PageIntro eyebrow="PERSONAL INSIGHTS / IN THE MARGINS" title="Small notes." accent="Open questions." description="A place for observations about making, thinking, and paying closer attention."/><section className="container insight-grid">{insights.map((item,i)=><Link className="insight-card" href={`/insights/${item.slug}`} key={item.slug} data-reveal><span className="insight-number">0{i+1} / {item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight size={22}/></Link>)}</section></main>;}
