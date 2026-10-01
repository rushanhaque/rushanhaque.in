import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const source=path.resolve(process.argv[2]||'D:/Code/azurio-digital-agency-and-personal-portfolio-html-template/Atelys');
const read=p=>fs.readFileSync(path.join(source,p),'utf8');
// Parse data literals only; never execute scripts from the source portfolio.
function literal(n){if(ts.isStringLiteral(n))return n.text;if(ts.isNumericLiteral(n))return Number(n.text);if(n.kind===ts.SyntaxKind.TrueKeyword)return true;if(n.kind===ts.SyntaxKind.FalseKeyword)return false;if(ts.isArrayLiteralExpression(n))return n.elements.map(literal);if(ts.isObjectLiteralExpression(n))return Object.fromEntries(n.properties.map(p=>{if(!ts.isPropertyAssignment(p))throw Error('Unsupported source data');return [p.name.text,literal(p.initializer)];}));throw Error('Non-literal source data');}
const ast=ts.createSourceFile('projects.js',read('data/projects.js'),ts.ScriptTarget.Latest,true);
const assignment=ast.statements.find(s=>ts.isExpressionStatement(s)&&ts.isBinaryExpression(s.expression));
const items=literal(assignment.expression.right);
const projects=JSON.parse(fs.readFileSync('content/projects.json','utf8'));
const editorial=JSON.parse(fs.readFileSync('content/editorial.json','utf8'));
const assets=[];
function copy(relative,name){const bytes=fs.readFileSync(path.join(source,relative));const target='/images/'+name;fs.copyFileSync(path.join(source,relative),'public'+target);assets.push({source:relative,target,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});return target;}
const key=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
for(const p of projects){const original=items.find(i=>i.category!=='Personal'&&key(i.title)===key(p.title));if(!original)throw Error('Unmapped project: '+p.title);if(original.image)p.image=copy(original.image,'work-'+p.slug+path.extname(original.image));p.imageBlurred=!!original.isBlurred;if(original.tags.includes('In Progress')||/in development/i.test(original.description))p.status='In progress';if(original.tags.includes('Coming Soon'))p.status='Coming soon';}
for(const w of editorial.writings){const original=items.find(i=>i.category==='Personal'&&(key(i.title)===key(w.originalTitle)||w.slug==='feedback-loop-collapse'&&i.title==='Feedback Loop Collapse'));if(!original)throw Error('Unmapped writing: '+w.slug);w.image=copy(original.image,'writing-'+w.slug+path.extname(original.image));w.imageBlurred=!!original.isBlurred;w.author=w.slug==='to-the-moon-and-beyond'?'':w.slug==='feedback-loop-collapse'?'Rushan Ul Haque':'Rushan Haque';}
const docs=[
['cisco-python.png','Python Essentials 1','Cisco Networking Academy','Training','October 2024'],
['oracle-cloud.png','Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate','Oracle University','Training','October 2025'],
['oracle-fusion-ai.png','Oracle Fusion AI','Oracle University','Training'],
['google-gemini.png','Gemini Certified Student — University','Google for Education','Training','2026'],
['anthropic-mcp.jpg','Model Context Protocol','Anthropic','Training'],
['claude-ai.jpg','Claude Code in Action','Anthropic','Training','March 2026'],
['ethical-hacking.png','Ethical Hacking Masterclass','See document','Training'],
['deloitte-tech.png','Technology Job Simulation','Deloitte Australia · Forage','Job simulations'],
['jpmorgan-se.png','Software Engineering Job Simulation','JPMorgan Chase · Forage','Job simulations'],
['tata-job.png','GenAI Data Analytics Job Simulation','Tata · Forage','Job simulations'],
['python-training.png','Python Training','See document','Training'],
['ai-digital-marketing.jpeg','AI in Digital Marketing','See document','Training'],
['ai-tools-workshop.jpeg','AI Tools Workshop','See document','Training'],
['power-bi.jpeg','Power BI Workshop','See document','Training'],
['web-dev-offer.jpeg','Web Development Offer Letter','See document','Offer letters'],
['cosmic365-internship.png','Internship Offer','COSMIC365','Offer letters'],
['campus-ambassador.png','Campus Ambassador Internship','See document','Offer letters'],
['nayepankh.png','Foundation Offer Letter','NayePankh Foundation','Offer letters'],
['she-can.png','Foundation Selection Letter','She Can Foundation','Offer letters'],
['merchandiser-exp.jpeg','Merchandiser Experience Letter','See document','Experience'],
['ducat-visit.png','DUCAT Visit','DUCAT','Visits']];
for(const [file,title,issuer,category,date] of docs){let entry=editorial.certifications.find(c=>c.title===title);if(!entry){entry={title,issuer,date:date||'See document',id:''};editorial.certifications.push(entry);}entry.category=category;entry.image=copy('img/cert/'+file,'credential-'+file);}
for(const c of editorial.certifications)c.category??=c.title.includes('Simulation')?'Job simulations':'Training';
const profile={name:'Rushan Haque',portrait:copy('img/rh/pfp.jpeg','rushan-haque.jpeg'),location:'Moradabad, Uttar Pradesh, India',languages:['English','Hindi','Urdu'],bio:'I’m a web developer, designer, and writer based in Moradabad. I build websites, interfaces, and applications for businesses across India and internationally, with a practice that also makes room for research and Urdu poetry.',references:['llms.txt','index.html','data/journey.js','data/reviews.js','certificates.html']};
for(const [file,data] of Object.entries({projects,editorial,profile,'atelys-import':{source:'Atelys',assets,notes:['Existing detailed project narratives retained.','Journey (6 roles, 2 education entries) and 9 reviews reconciled with existing records.','Duplicate certificate exports omitted; original document scans preserved.','Unreferenced template assets and unfinished project screenshots not published.','Book attribution omitted where the source does not establish authorship.']}}))fs.writeFileSync('content/'+file+'.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({assets:assets.length,projects:projects.length,writings:editorial.writings.length,credentials:editorial.certifications.length}));
