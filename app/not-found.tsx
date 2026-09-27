import Link from '@/components/site-link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound(){return <main id="main-content" className="container not-found"><span className="eyebrow">404 / A SMALL DETOUR</span><h1>Nothing here.<br/><em>Plenty elsewhere.</em></h1><p>This page may have moved, or the link may be a little off.</p><Link href="/" className="button primary">Find your way home <ArrowUpRight size={17}/></Link><Link href="/projects" className="text-link">Explore the work <ArrowUpRight size={17}/></Link></main>;}
