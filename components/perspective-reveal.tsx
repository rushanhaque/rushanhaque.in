'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMotion } from '@/components/site-motion';
gsap.registerPlugin(ScrollTrigger);
export function PerspectiveReveal(){const root=useRef<HTMLElement>(null);const {reduced}=useMotion();useEffect(()=>{if(reduced||!root.current)return;const ctx=gsap.context(()=>{gsap.from('.practice-reveal-line>span',{yPercent:105,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:root.current,start:'top 85%',end:'center 65%',scrub:.7}});gsap.from('.practice-reveal-rule',{scaleX:0,transformOrigin:'left',scrollTrigger:{trigger:root.current,start:'top 80%',end:'bottom 90%',scrub:.7}});},root);return()=>ctx.revert();},[reduced]);return <section className="practice-reveal" ref={root} data-scene="forest" aria-label="Across disciplines"><div className="container"><span className="eyebrow">BUILT ACROSS DISCIPLINES BECAUSE THE PROBLEMS KEEP OVERLAPPING.</span><h2>{['Development.','Design.','Writing.'].map((word,i)=><span className="practice-reveal-line" key={word}><span><small>0{i+1}</small>{i===2?<em>{word}</em>:word}</span></span>)}</h2><div className="practice-reveal-rule"/><p>Products, interfaces, research, long-form writing.</p></div></section>;}
