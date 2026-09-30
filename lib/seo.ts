import type { Metadata } from 'next';
export const siteOrigin='https://www.rushanhaque.in';
export function pageMetadata(path:string,title:string,description:string):Metadata{return{title,description,alternates:{canonical:siteOrigin+path},openGraph:{type:'website',title,description,url:siteOrigin+path,siteName:'Rushan Haque'},twitter:{card:'summary',title,description}};}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
