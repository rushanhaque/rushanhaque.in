'use client';
import { useContent } from '@/components/content-provider';
import Link from '@/components/site-link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { bookingUrl } from '@/lib/content';

const links=[['Home','/'],['Works','/projects'],['Writing','/writing'],['Journey','/#journey'],['Services','/services'],['Areas served','/areas-served'],['Products','/products'],['Beyond the build','/#services'],['Certificates','/certifications'],['The lab','/studies'],['Reviews','/reviews'],['Contact','/contact']];
const primary=[['Work','/projects'],['Writing','/writing'],['Journey','/#journey'],['Reviews','/reviews']];

// Appears after the visitor has scrolled past the fold and starts heading back up.
function useFloatingNav(){
  const [shown,setShown]=useState(false);
  useEffect(()=>{
    let last=window.scrollY,frame=0;
    const update=()=>{frame=0;const y=window.scrollY;const delta=y-last;if(Math.abs(delta)<6)return;setShown(y>640&&delta<0);last=y;};
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',onScroll);};
  },[]);
  return shown;
}

export function SiteHeader(){
  const {projects}=useContent();
  const [open,setOpen]=useState(false); const path=usePathname();
  const floating=useFloatingNav();
  const current=(url:string)=>url==='/'?(path==='/'?'page':undefined):!url.includes('#')&&path?.startsWith(url)?'page':undefined;
  return <Sheet open={open} onOpenChange={setOpen}>
    <header className="site-header container">
      <Link href="/" className="wordmark" aria-label="Rushan Haque home">rushan<span>haque<span className="brand-dot">.</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{primary.map(([label,url])=><Link key={url} href={url}  aria-current={current(url)}>{label}{label==='Work'&&<span>{projects.length}</span>}</Link>)}</nav>
      <div className="header-actions"><Link className="header-contact" href="/contact">Let’s talk <ArrowUpRight size={16}/></Link><SheetTrigger asChild><button className="menu-trigger" aria-label="Open navigation"><Menu size={21}/></button></SheetTrigger></div>
    </header>
    <div className={`float-nav ${floating&&!open?'is-shown':''}`} inert={!floating||open?true:undefined}>
      <Link href="/" className="float-nav-mark" aria-label="Rushan Haque home">rh<span>.</span></Link>
      <nav aria-label="Quick navigation">{primary.map(([label,url])=><Link key={url} href={url}  aria-current={current(url)}>{label}</Link>)}</nav>
      <Link href="/contact" className="float-nav-cta">Let’s talk<ArrowUpRight size={14}/></Link>
      <SheetTrigger asChild><button className="float-nav-menu" aria-label="Open navigation"><Menu size={18}/></button></SheetTrigger>
    </div>
    <SheetContent className="navigation-sheet"><SheetTitle className="nav-title">Menu</SheetTitle><SheetDescription>Everything, in one place.</SheetDescription><nav aria-label="All pages" className="overlay-nav">{links.map(([label,url],i)=><SheetClose key={url} asChild><Link href={url}  aria-current={current(url)} style={{'--i':i} as React.CSSProperties}><span>{String(i+1).padStart(2,'0')}</span>{label}<ArrowUpRight size={22}/></Link></SheetClose>)}</nav><div className="nav-bottom"><SheetClose asChild><a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="button primary">Schedule a call <ArrowUpRight size={17}/></a></SheetClose><SheetClose asChild><Link href="/write-a-review" className="text-link">Write a review <ArrowUpRight size={16}/></Link></SheetClose></div></SheetContent>
  </Sheet>;
}

