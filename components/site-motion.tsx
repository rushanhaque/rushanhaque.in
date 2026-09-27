'use client';
import { createContext, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const MotionContext=createContext({reduced:false});
export function MotionProvider({children}:{children:React.ReactNode}){
  const reduced=false; const path=usePathname();
  useEffect(()=>{
    document.documentElement.dataset.motion=reduced?'reduce':'full';
    if(reduced)return;
    const mm=gsap.matchMedia();
    const timer=window.setTimeout(()=>{
      mm.add('all',()=>{
        if(document.querySelector('.hero-line')){const intro=gsap.timeline({defaults:{ease:'power3.out'}});
        intro.from('.hero-line > span',{yPercent:105,rotation:3,duration:1.05,stagger:.12})
          .from('.hero-kicker, .hero-copy > p, .hero-actions',{y:18,opacity:0,duration:.65,stagger:.08},.18)
          .from('.sculpture-image',{rotation:-12,scale:.86,opacity:0,duration:1.35},.08);}
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>{
          gsap.from(el,{y:22,opacity:0,duration:1.25,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 93%',once:true}});
        });
        if(document.querySelector('.hero-object'))gsap.to('.hero-object',{y:55,rotation:6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
        gsap.utils.toArray<HTMLElement>('.manifesto-word').forEach((word,i)=>gsap.fromTo(word,{opacity:.22},{opacity:1,ease:'none',scrollTrigger:{trigger:'.manifesto',start:`top ${82-i*2.4}%`,end:`top ${55-i*2.4}%`,scrub:true}}));
        if(document.querySelector('.scroll-type'))gsap.to('.scroll-type',{xPercent:-22,ease:'none',scrollTrigger:{trigger:'.type-rail',start:'top bottom',end:'bottom top',scrub:1}});
        const steps=gsap.utils.toArray<HTMLElement>('.process-step');
        steps.forEach((step,i)=>ScrollTrigger.create({trigger:step,start:'top 55%',end:'bottom 55%',onToggle:self=>{step.classList.toggle('is-active',self.isActive);if(self.isActive){document.querySelectorAll('.process-orbit').forEach(el=>{(el as HTMLElement).style.setProperty('--phase',String(i));});}}}));
        gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:'main',start:'top top',end:'bottom bottom',scrub:true}});
        const refresh=()=>ScrollTrigger.refresh();document.fonts.ready.then(refresh);
        // Fixed media dimensions reserve layout; lazy image loads must not interrupt navigation.
      });
      mm.add('(hover: hover) and (pointer: fine)',()=>{
        const cursor=document.querySelector<HTMLElement>('.project-cursor');if(!cursor)return;
        const xTo=gsap.quickTo(cursor,'x',{duration:.4,ease:'power3.out'});const yTo=gsap.quickTo(cursor,'y',{duration:.4,ease:'power3.out'});
        let active:Element|null=null;
        const move=(event:PointerEvent)=>{const target=(event.target as Element)?.closest('.project-card .project-image');xTo(event.clientX);yTo(event.clientY);if(target!==active){active=target;gsap.to(cursor,{opacity:target?1:0,scale:target?1:.6,duration:.5,overwrite:true});}};
        const hide=()=>{active=null;gsap.to(cursor,{opacity:0,duration:.2});};
        document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',hide);window.addEventListener('scroll',hide,{passive:true});
        return()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',hide);window.removeEventListener('scroll',hide);gsap.killTweensOf(cursor);cursor.style.opacity='0';};
      });
    },100);
    return()=>{clearTimeout(timer);mm.revert();};
  },[path,reduced]);
  return <MotionContext.Provider value={{reduced}}><div className="reading-progress" aria-hidden="true"/><div className="project-cursor" aria-hidden="true">Take a<br/><em>closer look.</em> ↗</div>{children}</MotionContext.Provider>;
}
export function useMotion(){return useContext(MotionContext);}
