import type { Project } from '@/lib/content';

// One line of story per client site, used wherever the works are told. Works added later in
// the admin fall back to their own description.
const STORIES: Record<string, { line: string; field: string }> = {
  taif: { line: 'Brass, copper and wood, shipped to 42 countries.', field: 'Handicrafts · Export' },
  'erfolg-living': { line: 'Copper baths and lighting, made by hand.', field: 'Interiors · Living' },
  'casa-and-crop': { line: 'Home metalware for 34 countries.', field: 'Homeware · Export' },
  velora: { line: 'Brass, bronze and silver, raised by hand.', field: 'Atelier · Metalware' },
  aurelio: { line: 'Furniture and light, in metal and wood.', field: 'Furniture · Lighting' },
};

export function storyOf(p: Project) {
  return STORIES[p.slug] ?? { line: p.description, field: p.discipline };
}

// The address a visitor would type, for the browser bar drawn above each screenshot.
export function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
