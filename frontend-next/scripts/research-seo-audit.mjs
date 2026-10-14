import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'audits/seo-research-2026-10-14');
const dist = path.join(root, 'dist');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() && !e.name.startsWith('_next') ? walk(path.join(dir,e.name)) : e.name.endsWith('.html') ? [path.join(dir,e.name)] : []);
const rows = [];
const issues = [];
const titles = new Map(), descriptions = new Map();
for (const file of walk(dist)) {
  const route = '/' + path.relative(dist,file).replaceAll('\\','/').replace(/index\.html$/, '').replace(/\.html$/, '');
  const doc = new JSDOM(fs.readFileSync(file,'utf8')).window.document;
  const meta = name => doc.querySelector(`meta[name="${name}"]`)?.content || '';
  const noindex = meta('robots').includes('noindex');
  const canonical = doc.querySelector('link[rel="canonical"]')?.href || '';
  const main = doc.querySelector('main') || doc.body;
  const h1 = [...main.querySelectorAll('h1')].map(e=>e.textContent.trim());
  const problems = [];
  const schemas = [];
  for(const s of doc.querySelectorAll('script[type="application/ld+json"]')) {try {const j=JSON.parse(s.textContent); schemas.push(...(j['@graph']||[j]));} catch {problems.push('Invalid JSON-LD');}}
  if(!noindex) {
    if(!doc.title) problems.push('Missing title');
    if(!meta('description')) problems.push('Missing description');
    if(h1.length!==1) problems.push(`H1 count ${h1.length}`);
    if(!canonical) problems.push('Missing canonical');
    if(!doc.querySelector('meta[property="og:title"]')) problems.push('Missing Open Graph');
    if(doc.querySelector('meta[name="keywords"]')) problems.push('Meta keywords tag');
    for(const [map,value,label] of [[titles,doc.title,'title'],[descriptions,meta('description'),'description']]) {
      if(map.has(value)) problems.push(`Duplicate ${label} with ${map.get(value)}`); else map.set(value,route);
    }
    for(const a of main.querySelectorAll('a[href^="/"]')) {
      const href=a.getAttribute('href'); if(href.startsWith('//')) continue;
      const target=decodeURIComponent(href.split(/[?#]/)[0]);
      const local=path.join(dist,target==='/'?'index.html':target.slice(1));
      if(!fs.existsSync(local)&&!fs.existsSync(local+'.html')) problems.push(`Broken internal link ${href}`);
    }
    for(const img of main.querySelectorAll('img')) if(!img.hasAttribute('alt')) problems.push('Image missing alt');
    let previous=1;
    for(const h of main.querySelectorAll('h1,h2,h3,h4,h5,h6')) {const level=Number(h.tagName[1]);if(level>previous+1) problems.push(`Heading skip ${previous} to ${level}: ${h.textContent.slice(0,55)}`);previous=level;}
  }
  rows.push({route,title:doc.title,description:meta('description'),h1:h1.join(' | '),canonical,noindex,schema:schemas.map(n=>n['@type']).flat().join(', '),problems:[...new Set(problems)]});
  issues.push(...[...new Set(problems)].map(issue=>({route,issue})));
  doc.defaultView.close();
}
const xml=new JSDOM(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8'),{contentType:'text/xml'}).window.document;
const urls=[...xml.querySelectorAll('url')].map(e=>e.querySelector('loc').textContent);
for(const url of urls) {const r=rows.find(r=>r.canonical===url);if(!r||r.noindex)issues.push({route:url,issue:'Sitemap URL missing or noindex'});}
fs.writeFileSync(path.join(out,'page-audit.json'),JSON.stringify({date:'2026-10-14',rows,issues,sitemapUrls:urls},null,2));
console.log(JSON.stringify({pages:rows.length,indexable:rows.filter(r=>!r.noindex).length,sitemapUrls:urls.length,issues},null,2));
