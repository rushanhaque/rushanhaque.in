export const dynamic='force-dynamic';
import type { Metadata } from 'next';
import { ReadingTools } from '@/components/reading-tools';
import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getPublishedContent } from '@/lib/published-content';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {insights}=await getPublishedContent();const {slug}=await params;const item=insights.find(i=>i.slug===slug);return pageMetadata('/insights/'+slug,item?.title||'Insight not found',item?.text||'A personal insight.');}
export default async function InsightDetail({params}:Props){const {insights}=await getPublishedContent();const {slug}=await params;const item=insights.find(i=>i.slug===slug);if(!item)notFound();return <main id="main-content"><article className="article container"><Link href="/insights" className="back-link"><ArrowLeft size={15}/>In the margins</Link><header><span className="eyebrow">A NOTE ON {item.tag.toUpperCase()}</span><h1 data-reveal>{item.title}</h1><p className="article-deck">{item.text}</p></header><p className="draft-note">Editorial draft · September 2026 · Prepared for this portfolio</p><ReadingTools text={item.paragraphs.join(" ")}/><div className="article-body">{item.paragraphs.map(p=><p key={p}>{p}</p>)}<p className="article-signature">Keep an open mind.</p></div></article></main>;}
