import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Praveen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve('dist');
const output=path.resolve('audits/seo-research-2026-10-14');
const server=http.createServer((req,res)=>{let name=new URL(req.url,'http://localhost').pathname;let p=path.join(root,name==='/'?'index.html':name);if(!fs.existsSync(p)||fs.statSync(p).isDirectory())p+='.html';if(!fs.existsSync(p)){res.writeHead(404).end();return;}const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};res.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));});
await new Promise(r=>server.listen(5184,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'C:/Users/Praveen/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',headless:true});
const results=[];
try {for(const width of [375,1440])for(const route of ['/','/digital-marketing','/web-development/website-design','/production-house','/podcast-studio','/contact']) {
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5184'+route,{waitUntil:'networkidle'});
 const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelector('h1')?.textContent,viewport:!!document.querySelector('meta[name="viewport"]'),forms:document.querySelectorAll('form').length}));
 results.push({route,width,...state});
 if(route==='/')await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:false});
 await page.close();
}}finally{await browser.close();server.close();}
fs.writeFileSync(path.join(output,'mobile-check.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));

