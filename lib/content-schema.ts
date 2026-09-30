import { z } from 'zod';
const text=z.string().trim().min(1).max(10000);
const url=z.string().max(2000).refine(v=>!v||/^https:\/\//.test(v),'Use an HTTPS URL or leave empty.');
const slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const unique=<T extends {slug:string}>(items:T[])=>new Set(items.map(i=>i.slug)).size===items.length;
export const projectsSchema=z.array(z.object({slug,title:text,category:z.enum(['Client work','Experiments']),discipline:text,year:z.string().regex(/^20\d{2}$/),description:text,tags:z.array(text).max(15),url,image:z.string().regex(/^\/images\/[a-zA-Z0-9._-]+$/).nullable(),status:z.enum(['Completed','In progress','Coming soon']),number:z.string().regex(/^\d{2,3}$/),caseStudy:z.object({context:text,role:text,decisions:z.array(z.object({title:text,text}).strict()).min(2).max(6),reflection:text}).strict().optional()}).strict()).min(1).max(300).refine(unique,'Project slugs must be unique.');
export const editorialSchema=z.object({
 writings:z.array(z.object({slug,title:text,originalTitle:text,category:text,year:z.string().regex(/^20\d{2}$/),status:z.enum(['Published','Ongoing','Forthcoming']),url,description:text,paragraphs:z.array(text).min(1).max(100),source:text}).strict()).min(1).max(100).refine(unique,'Writing slugs must be unique.'),
 experience:z.array(z.object({role:text,company:text,period:text,description:text}).strict()).max(50),
 education:z.array(z.object({title:text,institution:text,detail:z.string().max(200)}).strict()).max(20),
 certifications:z.array(z.object({title:text,issuer:text,date:text,id:z.string().max(200)}).strict()).max(100),
 reviews:z.array(z.object({name:text,company:z.string().max(200),location:z.string().max(100),date:z.string().max(40),rating:z.string().regex(/^([1-5](\.\d)?)?$/,'Use a rating from 1 to 5, e.g. 5.0.'),quote:text}).strict()).max(100),
 services:z.array(z.object({title:text,subtitle:text,description:text,items:z.array(text).max(20)}).strict()).max(20),
 insights:z.array(z.object({slug,title:text,tag:text,text,paragraphs:z.array(text).min(1).max(100)}).strict()).max(100).refine(unique,'Insight slugs must be unique.'),
}).strict();
export const contentFiles=['projects','editorial'] as const;
export type ContentFile=typeof contentFiles[number];
export function validateContent(file:ContentFile,value:unknown){return file==='projects'?projectsSchema.parse(value):editorialSchema.parse(value);}
