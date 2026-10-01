'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useMotion } from '@/components/site-motion';

// A local SVG filter keeps the source image accessible and needs no canvas copies.
export function LiquidHover({children}:{children:ReactNode}){
 const root=useRef<HTMLSpanElement>(null);const noise=useRef<SVGFETurbulenceElement>(null);const displacement=useRef<SVGFEDisplacementMapElement>(null);const {reduced}=useMotion();const id='water-'+useId().replace(/[^a-zA-Z0-9]/g,'');
 useEffect(()=>{
  const element=root.current;const target=element?.closest('a');const picture=element?.querySelector('img');
  if(!element||!target||!picture||reduced||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
  let frame=0,active=false,strength=0,phase=0,last=0;
  const draw=(time:number)=>{if(time-last<30){frame=requestAnimationFrame(draw);return;}last=time;phase+=.035;strength+=(active?8-strength:-strength)*.14;displacement.current?.setAttribute('scale',strength.toFixed(2));noise.current?.setAttribute('baseFrequency',`${.008+Math.sin(phase)*.002} ${.018+Math.cos(phase*.8)*.004}`);if(active||strength>.05)frame=requestAnimationFrame(draw);else{picture.style.removeProperty('filter');frame=0;}};
  const enter=()=>{active=true;picture.style.filter=`url(#${id})${picture.classList.contains('unreleased-preview')?' blur(5px)':''}`;if(!frame)frame=requestAnimationFrame(draw);};
  const leave=()=>{active=false;};
  target.addEventListener('pointerenter',enter);target.addEventListener('pointerleave',leave);target.addEventListener('focusin',enter);target.addEventListener('focusout',leave);
  return()=>{cancelAnimationFrame(frame);picture.style.removeProperty('filter');target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);target.removeEventListener('focusin',enter);target.removeEventListener('focusout',leave);};
 },[id,reduced]);
 return <span ref={root} className="liquid-hover">{children}<svg className="liquid-defs" aria-hidden="true" focusable="false"><defs><filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feTurbulence ref={noise} type="fractalNoise" baseFrequency=".008 .02" numOctaves="2" seed="7" result="noise"/><feDisplacementMap ref={displacement} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg></span>;
}
