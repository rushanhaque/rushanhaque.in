// Creates 800px- and 1400px-wide WebP variants for responsive `srcset`s (a phone's
// sharp screen takes the 1400, a laptop the 800) and records which
// images have one and their real dimensions. Variants refresh when sources change. Images added later
// through the studio still work without a variant; they simply get no srcset.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const source = 'public/images';
const target = join(source, '800');
const width = 800;
const largeTarget = join(source, '1400');
const large = 1400;
mkdirSync(target, { recursive: true });
mkdirSync(largeTarget, { recursive: true });
mkdirSync('generated', { recursive: true });

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('sharp unavailable: serving original images without responsive variants.'); }

const manifest = {};
const largeManifest = {};
const dimensions = {};
for (const name of readdirSync(source)) {
  const file = join(source, name);
  if (!statSync(file).isFile() || !/\.(webp|jpe?g|png)$/i.test(name)) continue;
  const out = join(target, name.replace(/\.(jpe?g|png)$/i, '.webp'));
  try {
    if (!sharp) continue;
    const meta = await sharp(file).metadata();
    dimensions[`/images/${name}`] = { width: meta.width, height: meta.height };
    if (!existsSync(out) || statSync(file).mtimeMs > statSync(out).mtimeMs) {
      if ((meta.width || 0) <= width) continue;
      await sharp(file).resize({ width }).webp({ quality: 78 }).toFile(out);
    }
    if (existsSync(out)) manifest[`/images/${name}`] = `/images/800/${out.split(/[\\/]/).pop()}`;
    // The large tier only where the original is clearly wider than it.
    const big = join(largeTarget, name.replace(/\.(jpe?g|png)$/i, '.webp'));
    if ((meta.width || 0) > large * 1.15 && (!existsSync(big) || statSync(file).mtimeMs > statSync(big).mtimeMs)) await sharp(file).resize({ width: large }).webp({ quality: 74 }).toFile(big);
    if (existsSync(big)) largeManifest[`/images/${name}`] = `/images/1400/${big.split(/[\\/]/).pop()}`;
  } catch (error) { console.warn(`Skipped ${name}: ${error.message}`); }
}
writeFileSync('generated/images.json', JSON.stringify(manifest, null, 2) + '\n');
writeFileSync('generated/images-1400.json', JSON.stringify(largeManifest, null, 2) + '\n');
writeFileSync('generated/image-dimensions.json', JSON.stringify(dimensions, null, 2) + '\n');
console.log(`Image variants: ${Object.keys(manifest).length}`);
