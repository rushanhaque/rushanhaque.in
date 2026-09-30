import variants from '@/generated/images.json';

const small = variants as Record<string, string>;

// `srcSet`/`sizes` for images that have a generated 800px variant; images added
// later without one keep their single source.
export function responsive(src: string | null | undefined, sizes: string) {
  const variant = src ? small[src] : undefined;
  return variant ? { srcSet: `${variant} 800w, ${src} 1600w`, sizes } : {};
}

// The smallest available file, for thumbnails.
export function thumbnail(src: string) {
  return small[src] ?? src;
}
