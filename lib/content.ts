import editorial from '@/content/editorial.json';
import projectData from '@/content/projects.json';
export const projects = projectData;
export type Project = import('zod').z.infer<typeof import('@/lib/content-schema').projectsSchema>[number];
export const email = 'rushanulhaque@gmail.com';
export const socials = [
  {name:'LinkedIn',url:'https://www.linkedin.com/in/rushanhaque/'},
  {name:'GitHub',url:'https://github.com/rushanhaque'},
  {name:'Instagram',url:'https://www.instagram.com/rushzxcvbnm/'},
  {name:'Medium',url:'https://medium.com/@rushanulhaque'},
];
export const writings = editorial.writings;
export const experience = editorial.experience;
export const certifications = editorial.certifications;
export const reviews = editorial.reviews;
export const services = editorial.services;
export const insights = editorial.insights;
