import { cache } from 'react';
import projects from '@/content/projects.json';
import editorial from '@/content/editorial.json';
import { projectsSchema, editorialSchema } from '@/lib/content-schema';

// Only content committed with this release is public. Private drafts and
// historical publications must never shadow a newer GitHub deployment.
export const getPublishedContent = cache(async () => ({
  projects: projectsSchema.parse(projects),
  ...editorialSchema.parse(editorial),
}));
