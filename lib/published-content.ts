import { cache } from 'react';
import projects from '@/content/projects.json';
import editorial from '@/content/editorial.json';
import { projectsSchema, editorialSchema } from '@/lib/content-schema';
import { placementOf } from '@/lib/project-access';

// Only content committed with this release is public. Private drafts and
// historical publications must never shadow a newer GitHub deployment.
export const getPublishedContent = cache(async () => ({
  // Hidden projects never reach public pages or payloads. Experiments are shown on request,
  // so their links never do either.
  projects: projectsSchema.parse(projects).filter(p=>placementOf(p)!=='hidden').map(p=>p.category==='Experiments'?{...p,url:''}:p),
  ...editorialSchema.parse(editorial),
}));
