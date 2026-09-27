'use client';
import { useEffect } from 'react';
export function UsageEvents(){useEffect(()=>{
 if(navigator.doNotTrack==='1'||('globalPrivacyControl' in navigator&&navigator.globalPrivacyControl))return;
 const send=(event:string)=>{void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,path:location.pathname}),keepalive:true}).catch(()=>{});};
 const click=(event:MouseEvent)=>{const link=(event.target as Element)?.closest('a');if(!link)return;const url=new URL(link.href,location.origin);if(url.origin!==location.origin)return;if(url.pathname.startsWith('/projects/'))send('project_open');else if(url.pathname==='/contact')send('contact_intent');else if(url.pathname==='/schedule')send('schedule_intent');};
 let started=false;const focus=(event:FocusEvent)=>{if(!started&&(event.target as Element)?.closest('.inquiry-form')){started=true;send('form_start');}};
 document.addEventListener('click',click);document.addEventListener('focusin',focus);
 return()=>{document.removeEventListener('click',click);document.removeEventListener('focusin',focus);};
 },[]);return null;}
