// Creates 800px-wide WebP variants for responsive `srcset`s and records which
// images have one. Idempotent: existing variants are kept. Images added later
// through the studio still work without a variant; they simply get no srcset.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const source = 'public/images';
const target = join(source, '800');
const width = 800;
mkdirSync(target, { recursive: true });
mkdirSync('generated', { recursive: true });

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('sharp unavailable: using existing image variants only.'); }

const manifest = {};
for (const name of readdirSync(source)) {
  const file = join(source, name);
  if (!statSync(file).isFile() || !/\.(webp|jpe?g|png)$/i.test(name)) continue;
  const out = join(target, name.replace(/\.(jpe?g|png)$/i, '.webp'));
  try {
    if (!existsSync(out) && sharp) {
      const meta = await sharp(file).metadata();
      if ((meta.width || 0) <= width) continue;
      await sharp(file).resize({ width }).webp({ quality: 78 }).toFile(out);
    }
    if (existsSync(out)) manifest[`/images/${name}`] = `/images/800/${out.split(/[\\/]/).pop()}`;
  } catch (error) { console.warn(`Skipped ${name}: ${error.message}`); }
}
writeFileSync('generated/images.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Image variants: ${Object.keys(manifest).length}`);
