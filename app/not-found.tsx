import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound(){return <main id="main-content" className="container not-found"><span className="eyebrow">404</span><h1>Nothing here.<br/><em>Plenty elsewhere.</em></h1><p>This page has moved on. Let’s do the same.</p><Link href="/" className="button primary">Go home <ArrowUpRight size={17}/></Link><Link href="/projects" className="text-link">See the work <ArrowUpRight size={17}/></Link></main>;}
