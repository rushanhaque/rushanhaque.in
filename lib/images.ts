import variants from '@/generated/images.json';
import largeVariants from '@/generated/images-1400.json';
import dimensions from '@/generated/image-dimensions.json';
import plans from '@/generated/plans.json';

const small = variants as Record<string, string>;
const large = largeVariants as Record<string, string>;
const originals = dimensions as Record<string, { width: number; height: number }>;

// `srcSet`/`sizes` for images that have a generated 800px variant (and a 1400px one
// when the original is wider still); images added later without one keep their single source.
export function responsive(src: string | null | undefined, sizes: string) {
  const variant = src ? small[src] : undefined;
  const original = src ? originals[src] : undefined;
  if (!variant || !original) return {};
  const big = large[src!];
  return { srcSet: [`${variant} 800w`, big && `${big} 1400w`, `${src} ${original.width}w`].filter(Boolean).join(', '), sizes };
}

// The line drawing of a work screenshot (scripts/plan-variants.mjs), if one has been drawn.
export function planOf(src: string | null | undefined) {
  return src ? (plans as Record<string, string>)[src] : undefined;
}

// The smallest available file, for thumbnails.
export function thumbnail(src: string) {
  return small[src] ?? src;
}
