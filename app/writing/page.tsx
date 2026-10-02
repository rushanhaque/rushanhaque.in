import { BookObject } from '@/components/book-cover';
import { pageMetadata } from '@/lib/seo';
import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedContent } from '@/lib/published-content';
import { PageIntro } from '@/components/page-intro';
export const metadata=pageMetadata('/writing','Writing & ideas','Technical notes and books by Rushan Haque.');
export default async function Writing(){const {writings}=await getPublishedContent();return <main id="main-content"><PageIntro eyebrow="WRITING" title="A mind that makes." accent="A mind that wonders." description="Research, verse and books in progress. Written slowly, on purpose."/><section className="container writing-index">{writings.map((w,i)=><Link href={`/writing/${w.slug}`} className="writing-index-row" key={w.slug} data-reveal><span className="writing-index-number">0{i+1}</span><BookObject book={w}/><div><span className="eyebrow">{w.category} / {w.year}</span><h2>{w.title}</h2><p>{w.description}</p><span className="writing-original">{w.originalTitle} · {w.status}</span></div><ArrowUpRight size={30}/></Link>)}</section><section className="container section more-writing"><span className="eyebrow">ELSEWHERE</span><a href="https://medium.com/@rushanulhaque" target="_blank" rel="noopener noreferrer" className="text-link">Follow on Medium <ArrowUpRight size={17}/></a><a href="/feed.xml" className="text-link">Subscribe by RSS <ArrowUpRight size={17}/></a></section></main>;}
