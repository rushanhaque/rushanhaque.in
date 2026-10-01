import { readFileSync,existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateContent } from '../lib/content-schema.ts';
for(const file of ['projects','editorial']){
 const data=validateContent(file,JSON.parse(readFileSync(`content/${file}.json`,'utf8')));
 const records=file==='projects'?data:[...data.writings,...data.certifications];
 for(const item of records){if(item.year&&Number(item.year)>new Date().getFullYear())throw Error(`Future year: ${item.slug}`);if(item.image&&!existsSync('public'+item.image))throw Error(`Missing image: ${item.image}`);}
}
const profile=JSON.parse(readFileSync('content/profile.json','utf8'));
if(!existsSync('public'+profile.portrait))throw Error('Missing portrait');
const manifest=JSON.parse(readFileSync('content/atelys-import.json','utf8'));
for(const asset of manifest.assets){const hash=createHash('sha256').update(readFileSync('public'+asset.target)).digest('hex');if(hash!==asset.sha256)throw Error('Imported asset changed: '+asset.target);}
console.log(`PASS: content schemas, unique slugs, URLs, years, all referenced images, and ${manifest.assets.length} imported asset checksums.`);
const sourcePages=JSON.parse(readFileSync('content/source-pages.json','utf8'));
const migration=JSON.parse(readFileSync('content/page-migration.json','utf8'));
if(new Set(sourcePages.map(p=>p.slug)).size!==sourcePages.length)throw Error('Duplicate migrated route');
for(const page of sourcePages){if(!page.title||!page.sections.length)throw Error('Empty imported page: '+page.slug);for(const html of page.sections){if(/<(script|iframe|form|style)\b|\son\w+\s*=|javascript:/i.test(html))throw Error('Unsafe imported markup: '+page.slug);}}
if(migration.filter(p=>p.status==='imported-full-page'&&p.textPreserved).length!==sourcePages.length)throw Error('Incomplete migration accounting');
console.log(`PASS: ${sourcePages.length} complete imported pages; ${migration.length} source HTML files accounted for.`);
