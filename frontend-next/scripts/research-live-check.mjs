import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'audits/seo-research-2026-10-14');
const sitemap=await fetch('https://geniemedia.in/sitemap.xml').then(r=>r.text());
fs.writeFileSync(path.join(out,'live-sitemap.xml'),sitemap);
const xml=new JSDOM(sitemap,{contentType:'text/xml'}).window.document;
// Include image locations as asset checks, but report them separately from pages.
const urls=[...xml.querySelectorAll('loc')].map(e=>e.textContent).filter(u=>u.startsWith('https://geniemedia.in/'));
const results=[];
for(let i=0;i<urls.length;i+=6) await Promise.all(urls.slice(i,i+6).map(async url=>{
  try {const r=await fetch(url,{signal:AbortSignal.timeout(30000)});const html=await r.text();const d=new JSDOM(html).window.document;results.push({url,status:r.status,finalUrl:r.url,title:d.title,description:d.querySelector('meta[name="description"]')?.content||'',canonical:d.querySelector('link[rel="canonical"]')?.href||'',robots:d.querySelector('meta[name="robots"]')?.content||'',h1:[...d.querySelectorAll('h1')].map(e=>e.textContent.trim()),schemaCount:d.querySelectorAll('script[type="application/ld+json"]').length});d.defaultView.close();}catch(e){results.push({url,error:e.message});}
}));
fs.writeFileSync(path.join(out,'live-audit.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({pages:results.filter(r=>!r.url.includes('/uploads/')).length,images:results.filter(r=>r.url.includes('/uploads/')).length,failures:results.filter(r=>r.status!==200),missingH1:results.filter(r=>!r.url.includes('/uploads/')&&r.h1?.length!==1).map(r=>r.url)},null,2));
