import { readFileSync,existsSync } from 'node:fs';
import { validateContent } from '../lib/content-schema.ts';
for(const file of ['projects','editorial']){const data=validateContent(file,JSON.parse(readFileSync(`content/${file}.json`,'utf8')));if(file==='projects'){for(const project of data){if(Number(project.year)>new Date().getFullYear())throw Error(`Future project year: ${project.slug}`);if(project.image&&!existsSync('public'+project.image))throw Error(`Missing project image: ${project.image}`);}}}
console.log('PASS: content schemas, unique slugs, URL schemes, project years, and project assets.');
