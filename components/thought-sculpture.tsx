'use client';
import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/site-motion';

/** A projected torus knot: one continuous idea, seen from different angles. */
export function ThoughtSculpture(){
 const canvas=useRef<HTMLCanvasElement>(null);const {reduced}=useMotion();
 useEffect(()=>{
  const element=canvas.current;if(!element)return;const context=element.getContext('2d');if(!context)return;
  let width=1,height=1,frame=0,time=0,last=0,visible=false,px=0,py=0,tx=0,ty=0;
  const draw=()=>{context.clearRect(0,0,width,height);const size=Math.min(width,height)*.146;const angle=.62+px*.22;const tilt=.85+py*.25;const ca=Math.cos(angle),sa=Math.sin(angle),ct=Math.cos(tilt),st=Math.sin(tilt);
   for(let strand=0;strand<38;strand++){const offset=(strand/37-.5)*.56;context.beginPath();for(let j=0;j<=280;j++){const u=j/280*Math.PI*2;const wave=Math.cos(3*u+time*.18);const r=2+wave*.72+offset;const x=r*Math.cos(2*u),y=r*Math.sin(2*u),z=Math.sin(3*u+time*.18)*.82+offset*Math.sin(3*u)*.9;const a=x*ca-z*sa,b=x*sa+z*ca,c=y*ct-b*st;const depth=y*st+b*ct;const perspective=1+depth*.065;const xx=width*.5+a*size*perspective,yy=height*.5+c*size*perspective;if(j===0)context.moveTo(xx,yy);else context.lineTo(xx,yy);}context.strokeStyle=strand%7===0?'rgb(7 36 26 / 0.76)':'rgb(7 36 26 / 0.34)';context.lineWidth=strand%7===0?1:.65;context.stroke();}
  };
  const animate=(now:number)=>{frame=0;if(!visible||document.hidden||reduced)return;if(now-last>=33){time+=.015;px+=(tx-px)*.04;py+=(ty-py)*.04;draw();last=now;}frame=requestAnimationFrame(animate);};
  const start=()=>{if(visible&&!document.hidden&&!reduced&&!frame)frame=requestAnimationFrame(animate);};
  const resize=()=>{const box=element.getBoundingClientRect();width=box.width;height=box.height;const dpr=Math.min(devicePixelRatio,2);element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);draw();start();};
  const move=(event:PointerEvent)=>{if(reduced||event.pointerType==='touch')return;const box=element.getBoundingClientRect();tx=(event.clientX-box.left)/box.width-.5;ty=(event.clientY-box.top)/box.height-.5;};const leave=()=>{tx=ty=0;};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else start();});observer.observe(element);const sizes=new ResizeObserver(resize);sizes.observe(element);element.addEventListener('pointermove',move);element.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',start);resize();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',start);};
 },[reduced]);
 return <div className="px-sculpture"><svg viewBox="0 0 600 500" aria-hidden="true" className="px-sculpture-fallback">{Array.from({length:24},(_,i)=><ellipse key={i} cx="300" cy="250" rx={205-i*3} ry={75+i*2} transform={`rotate(${i*5-55} 300 250)`} fill="none" stroke="#07241a" strokeOpacity=".35"/>)}</svg><canvas ref={canvas} aria-label="A continuous, gently turning line sculpture" role="img"/></div>;
}
