import { cache } from 'react';
import { getDatabase } from '@/lib/database';
import projects from '@/content/projects.json';
import editorial from '@/content/editorial.json';
import { projectsSchema, editorialSchema } from '@/lib/content-schema';

const fallbackEditorial = editorialSchema.parse(editorial);
const fallback = { projects: projectsSchema.parse(projects), ...fallbackEditorial };

// React cache deduplicates within a render, never across visitors or releases.
export const getPublishedContent = cache(async () => {
  try {
    const { results } = await getDatabase().prepare('SELECT key, body FROM content_publications WHERE key IN (?, ?)').bind('projects', 'editorial').all<{ key: string; body: string }>();
    const projectRow = results.find(row => row.key === 'projects');
    const editorialRow = results.find(row => row.key === 'editorial');
    return { projects: projectRow ? projectsSchema.parse(JSON.parse(projectRow.body)) : fallback.projects, ...(editorialRow ? editorialSchema.parse(JSON.parse(editorialRow.body)) : fallbackEditorial) };
  } catch (error) {
    console.error('Published content unavailable; serving bundled content.', error instanceof Error ? error.message : 'Unknown storage error');
    return fallback;
  }
});
