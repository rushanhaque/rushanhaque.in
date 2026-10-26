// Draws each work screenshot as an architect's line drawing (ink on paper), saved
// beside the 800px variants as /images/plan/<name>.webp. The homepage and the works
// pages open on the drawing and scan across to the real site as you scroll.
// Runs before dev and build; images added later through the studio get a drawing
// on the next build, and until then simply show without one.
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const source = 'public/images';
const target = join(source, 'plan');
const width = 1000;
mkdirSync(target, { recursive: true });
mkdirSync('generated', { recursive: true });

let sharp = null;
try { sharp = (await import('sharp')).default; } catch { console.warn('sharp unavailable: no plan drawings.'); }

// Ink and paper, in the site's own colours.
const INK = [7, 36, 26], PAPER = [255, 255, 255];

async function draw(file, out) {
  const { data, info } = await sharp(file).resize({ width }).greyscale().blur(.8).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const g = (x, y) => data[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  const mag = new Float32Array(w * h);
  let max = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // Sobel: the strength of every edge, in any direction.
    const gx = -g(x - 1, y - 1) - 2 * g(x - 1, y) - g(x - 1, y + 1) + g(x + 1, y - 1) + 2 * g(x + 1, y) + g(x + 1, y + 1);
    const gy = -g(x - 1, y - 1) - 2 * g(x, y - 1) - g(x + 1, y - 1) + g(x - 1, y + 1) + 2 * g(x, y + 1) + g(x + 1, y + 1);
    const m = Math.sqrt(gx * gx + gy * gy);
    mag[y * w + x] = m;
    if (m > max) max = m;
  }
  // Soft threshold: faint texture drops away, real edges read as pen lines.
  const lo = max * .07, hi = max * .32;
  const px = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const t = Math.min(1, Math.max(0, (mag[i] - lo) / (hi - lo)));
    const a = Math.pow(t, .8) * .92;
    for (let c = 0; c < 3; c++) px[i * 3 + c] = Math.round(PAPER[c] + (INK[c] - PAPER[c]) * a);
  }
  await sharp(px, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 60, effort: 6 }).toFile(out);
}

const manifest = {};
const projects = JSON.parse(readFileSync('content/projects.json', 'utf8'));
for (const p of (Array.isArray(projects) ? projects : projects.projects)) {
  if (!p.image || !p.image.startsWith('/images/')) continue;
  const name = p.image.slice('/images/'.length);
  const file = join(source, name);
  if (!existsSync(file) || name.includes('/')) continue;
  const outName = name.replace(/\.(webp|jpe?g|png)$/i, '.webp');
  const out = join(target, outName);
  try {
    if (sharp && (!existsSync(out) || statSync(file).mtimeMs > statSync(out).mtimeMs)) await draw(file, out);
    if (existsSync(out)) manifest[p.image] = `/images/plan/${outName}`;
  } catch (error) { console.warn(`No plan for ${name}: ${error.message}`); }
}
writeFileSync('generated/plans.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Plan drawings: ${Object.keys(manifest).length}`);
