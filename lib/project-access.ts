import type { z } from 'zod';
import type { projectsSchema } from '@/lib/content-schema';
type P = z.infer<typeof projectsSchema>[number];
export type ProjectAccess = 'visit' | 'soon' | 'request';
// Client work with a live site is visited, unreleased work is coming soon, and experiments are shown on request.
export function projectAccess(p: Pick<P, 'category' | 'url' | 'status'>): ProjectAccess {
  if (p.category === 'Experiments') return 'request';
  return p.url && p.status !== 'Coming soon' ? 'visit' : 'soon';
}
