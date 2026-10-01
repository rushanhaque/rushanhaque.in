import variants from '@/generated/images.json';
import dimensions from '@/generated/image-dimensions.json';

const small = variants as Record<string, string>;
const originals = dimensions as Record<string, { width: number; height: number }>;

// `srcSet`/`sizes` for images that have a generated 800px variant; images added
// later without one keep their single source.
export function responsive(src: string | null | undefined, sizes: string) {
  const variant = src ? small[src] : undefined;
  const original = src ? originals[src] : undefined;
  return variant && original ? { srcSet: `${variant} 800w, ${src} ${original.width}w`, sizes } : {};
}

// The smallest available file, for thumbnails.
export function thumbnail(src: string) {
  return small[src] ?? src;
}
