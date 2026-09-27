import { readFileSync, writeFileSync } from 'node:fs';
const raw = readFileSync('content/source-projects.txt', 'utf8');
const source = JSON.parse(raw.slice(raw.indexOf('= [') + 2).trim().replace(/;\s*$/, '').replace(/,\s*([}\]])/g, '$1'));
const slugs = { ErfolgLiving: 'erfolg-living', 'Casa&Crop': 'casa-and-crop', Taif: 'taif', 'GitHub Auto-Push': 'github-auto-push', AuraAI: 'aura-ai', ShadowChat: 'shadow-chat', ShadowKill: 'shadow-kill', DeadDrop: 'dead-drop' };
const available = ['erfolg','casa-crop','taif','aurelio','quorum','upsidesound','velora'];
const projects = source.filter(p => p.category !== 'Personal').map((p, index) => ({
  slug: slugs[p.title] || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, ''),
  title: p.title === 'ErfolgLiving' ? 'Erfolg Living' : p.title,
  category: p.kind === 'Freelance' ? 'Client work' : 'Experiments',
  discipline: p.niche, year: p.year, description: p.description, tags: p.tags,
  url: p.url, image: available.find(x => p.image.endsWith('/'+x+'.webp')) ? '/images/'+p.image.split('/').pop() : null,
  status: p.description.includes('Coming soon') ? 'Coming soon' : p.description.includes('In development') ? 'In progress' : 'Completed',
  number: String(index+1).padStart(2,'0'),
}));
writeFileSync('content/projects.json', JSON.stringify(projects, null, 2)+'\n');
