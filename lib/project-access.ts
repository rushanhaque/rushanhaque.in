import type { z } from 'zod';
import type { projectsSchema } from '@/lib/content-schema';
type P = z.infer<typeof projectsSchema>[number];
export type ProjectAccess = 'visit' | 'soon' | 'request';
export type Placement = NonNullable<P['placement']>;
// Where a project shows on the site, set in the admin: the Works list, the "Currently building"
// list, the Products shelf on the Works page, or nowhere. Older entries without a choice show client work and hide experiments.
export function placementOf(p: Pick<P, 'category' | 'placement'>): Placement {
  return p.placement ?? (p.category === 'Client work' ? 'work' : 'hidden');
}
// Client work with a live site is visited, unreleased work is coming soon, and experiments are shown on request.
export function projectAccess(p: Pick<P, 'category' | 'url' | 'status'>): ProjectAccess {
  if (p.category === 'Experiments') return 'request';
  // A project with a link opens it, unless its label says it is not out yet.
  return p.url && !/soon|develop|progress|draft|upcoming/i.test(p.status) ? 'visit' : 'soon';
}
// Live client sites open the site itself; everything else opens its page here.
export function projectLink(p: Pick<P, 'category' | 'url' | 'status' | 'slug'>) {
  return projectAccess(p) === 'visit'
    ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: `/projects/${p.slug}` };
}
