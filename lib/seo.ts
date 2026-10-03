import type { Metadata } from 'next';
export const siteOrigin='https://www.rushanhaque.in';
export function pageMetadata(path:string,title:string,description:string):Metadata{return{title,description,alternates:{canonical:siteOrigin+path},openGraph:{type:'website',title,description,url:siteOrigin+path,siteName:'Rushan Haque',images:[{url:'/og.jpg',width:1200,height:630,alt:'Rushan Haque'}]},twitter:{card:'summary_large_image',title,description,images:['/og.jpg']}};}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
