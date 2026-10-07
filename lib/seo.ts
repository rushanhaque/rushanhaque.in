import type { Metadata } from 'next';
export const siteOrigin='https://www.rushanhaque.in';
type Options={languages?:Record<string,string>;locale?:string};
export function pageMetadata(path:string,title:string,description:string,options:Options={}):Metadata{
  const url=siteOrigin+path;
  const languages=options.languages?Object.fromEntries(Object.entries(options.languages).map(([lang,p])=>[lang,siteOrigin+p])):undefined;
  return{title,description,alternates:{canonical:url,...(languages?{languages}:{})},openGraph:{type:'website',locale:options.locale??'en_IN',title,description,url,siteName:'Rushan Haque',images:[{url:'/og.jpg',width:1200,height:630,alt:'Rushan Haque — website designer and developer in Moradabad'}]},twitter:{card:'summary_large_image',title,description,images:['/og.jpg']}};
}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
