import type { Project } from '@/lib/content';

// One line of story per client site, used wherever the works are told. Works added later in
// the admin fall back to their own description.
const STORIES: Record<string, { line: string; field: string }> = {
  taif: { line: 'Handicrafts in brass, copper and wood.', field: 'Handicrafts · Export' },
  'erfolg-living': { line: 'Handmade luxury metalwork.', field: 'Interiors · Living' },
  'casa-and-crop': { line: 'Home metalware, exported worldwide.', field: 'Homeware · Export' },
  velora: { line: 'Hand-raised metalware. Still being built.', field: 'Atelier · Metalware' },
  aurelio: { line: 'Furniture and lighting in metal and wood.', field: 'Furniture · Lighting' },
};

export function storyOf(p: Project) {
  return STORIES[p.slug] ?? { line: p.description, field: p.discipline };
}

// The address a visitor would type, for the browser bar drawn above each screenshot.
export function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
