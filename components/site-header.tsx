'use client';
import { useContent } from '@/components/content-provider';
import Link from '@/components/site-link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const links=[['Selected work','/projects'],['Writing & ideas','/writing'],['The person','/about'],['Services','/services'],['Experience','/experience'],['Certifications','/certifications'],['Collaborations','/collaborations'],['The playground','/playground']];
export function SiteHeader(){
  const {projects}=useContent();
  const [open,setOpen]=useState(false); const path=usePathname();
  return <header className="site-header container"><Link href="/" className="wordmark" aria-label="Rushan Haque home">rushan<span>haque<span className="brand-dot">.</span></span></Link><nav className="desktop-nav" aria-label="Main navigation">{[['Work','/projects'],['Writing','/writing'],['About','/about'],['Services','/services']].map(([label,url])=><Link key={url} href={url} aria-current={path?.startsWith(url)?'page':undefined}>{label}{label==='Work'&&<span>{projects.length}</span>}</Link>)}</nav><div className="header-actions"><Link className="header-contact" href="/contact">Let’s talk <ArrowUpRight size={16}/></Link><Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className="menu-trigger" aria-label="Open navigation"><Menu size={21}/></button></SheetTrigger><SheetContent className="navigation-sheet"><SheetTitle className="nav-title">An open invitation.</SheetTitle><SheetDescription>Explore the work. Get to know the mind behind it.</SheetDescription><nav aria-label="All pages" className="overlay-nav">{links.map(([label,url],i)=><SheetClose key={url} asChild><Link href={url} style={{'--i':i} as React.CSSProperties}><span>0{i+1}</span>{label}<ArrowUpRight size={22}/></Link></SheetClose>)}</nav><div className="nav-bottom"><SheetClose asChild><Link href="/schedule" className="button primary">Schedule a call <ArrowUpRight size={17}/></Link></SheetClose><SheetClose asChild><Link href="/reviews" className="text-link">Kind words <ArrowUpRight size={16}/></Link></SheetClose></div></SheetContent></Sheet></div></header>;
}
