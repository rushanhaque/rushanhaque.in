from pathlib import Path
from bs4 import BeautifulSoup, Comment
import json,hashlib,re
root=Path('D:/Code/azurio-digital-agency-and-personal-portfolio-html-template/Atelys')
alias={'index':'/','work':'/projects','certificates':'/certifications','review':'/write-a-review','contact':'/contact','admin':'/studio','404':'/404'}
pages=[]; inventory=[]
allowed={'div','section','p','a','h2','h3','h4','ul','ol','li','span','b','strong','em','br','details','summary','blockquote','dl','dt','dd'}
for file in sorted(root.rglob('*.html')):
 if any(x in file.parts for x in ['node_modules','.git']):continue
 rel=file.relative_to(root).as_posix();soup=BeautifulSoup(file.read_text(encoding='utf8'),'html.parser');main=soup.find('main')
 record={'source':rel,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'title':soup.title.get_text(' ',strip=True) if soup.title else file.stem}
 if rel.startswith('_trash-review/'):
  record.update(status='archived-template',reason='Discarded template demo; not personal portfolio content.')
 elif file.stem in alias:
  record.update(status='existing-equivalent',route=alias[file.stem],text=main.get_text(' ',strip=True) if main else '')
 else:
  if not main:raise Exception('Missing main: '+rel)
  original=main.get_text(' ',strip=True)
  heading=main.find('h1');title=heading.get_text(' ',strip=True);heading.decompose();original=main.get_text(' ',strip=True)
  for x in main(['script','style','svg','noscript']):x.decompose()
  for x in main.find_all(string=lambda t:isinstance(t,Comment)):x.extract()
  for x in list(main.find_all(True)):
   if x.name not in allowed:x.unwrap();continue
   attrs={}
   if x.name=='a':
    href=x.get('href','');href=re.sub(r'\.html(?=[#?]|$)','',href)
    if href.startswith(('https://','mailto:','tel:','/','#')):
     parts=href.split('#',1);stem=parts[0].strip('/');parts[0]=alias.get(stem,parts[0]);attrs['href']='#'.join(parts)
    else:raise Exception('Review link '+href+' in '+rel)
   if x.get('id'):attrs['id']=x['id']
   classes=x.get('class',[])
   if 'a-index' in classes:attrs['class']='source-section-label'
   elif 'a-contact-facts' in classes:attrs['class']='source-facts'
   elif 'a-faq' in classes:attrs['class']='source-faq'
   elif 'a-faq__no' in classes:attrs['class']='source-question-number'
   elif 'a-disc__item' in classes:attrs['class']='source-card'
   elif 'rh-local__clients' in classes:attrs['class']='source-links'
   elif 'a-hero-actions' in classes:attrs['class']='source-actions'
   x.attrs=attrs
  sections=[str(x) for x in main.find_all(recursive=False) if getattr(x,'name',None)]
  description=soup.find('meta',attrs={'name':'description'})
  pages.append({'slug':file.stem,'title':title,'description':description.get('content','') if description else title,'kind':'Location' if file.stem.startswith('website-designer-in-') or file.stem=='areas-served' else 'Service','sections':sections})
  # Every source text node must survive sanitation (except the separately rendered title).
  normalized=lambda t:re.sub(r'\s+',' ',t).strip()
  assert ''.join(normalized(original).split())==''.join(normalized(main.get_text(' ',strip=True)).split()),rel
  record.update(status='imported-full-page',route='/'+file.stem,sections=len(sections),textPreserved=True)
 inventory.append(record)
Path('content/source-pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
Path('content/page-migration.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print({'newPages':len(pages),'inventoried':len(inventory),'existing':len(alias)})



