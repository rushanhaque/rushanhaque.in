import editorial from '@/content/editorial.json';
import projectData from '@/content/projects.json';
export const projects = projectData;
export type Project = import('zod').z.infer<typeof import('@/lib/content-schema').projectsSchema>[number];
export const email = 'rushanulhaque@gmail.com';
export const phone = { label: '+91 76680 47608', whatsapp: 'https://wa.me/917668047608' };
export const address = { label: '94 Qazi tola, Moradabad, 244001, India', map: 'https://maps.google.com/?q=Moradabad,+India' };
export const bookingUrl = 'https://cal.com/rushan-haque-emssbo/call';
export const socials = [
  {name:'LinkedIn',url:'https://www.linkedin.com/in/rushanhaque/'},
  {name:'GitHub',url:'https://github.com/rushanhaque'},
  {name:'Instagram',url:'https://www.instagram.com/rushzxcvbnm/'},
  {name:'WhatsApp',url:phone.whatsapp},
];
export const stats = [
  { value: 20, label: 'Professional certifications & awards' },
  { value: 3, label: 'Languages spoken', plain: true },
  { value: 40, label: 'Projects contributed to' },
  { value: 5, label: 'Roles across dev, design & writing' },
];
export const writings = editorial.writings;
export const experience = editorial.experience;
export const certifications = editorial.certifications;
export const reviews = editorial.reviews;
export const services = editorial.services;
