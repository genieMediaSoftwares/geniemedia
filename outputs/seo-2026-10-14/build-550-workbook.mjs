import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve('frontend-next/audits/seo-research-2026-10-14');
const out=path.resolve('outputs/seo-2026-10-14');
const read=async n=>JSON.parse(await fs.readFile(path.join(root,n),'utf8'));
const rows=await read('verified-keywords.json');
const counts=await read('research-counts.json');
const pages=(await read('page-audit.json')).rows.filter(r=>!r.noindex);
const oldMap=await read('page-mapping.json');
assert.equal(rows.length,550);assert.equal(new Set(rows.map(r=>r.keyword)).size,550);
for(const r of rows){assert(r.source.startsWith('Ubersuggest'));assert(pages.some(p=>p.route===r.target),`Unknown target ${r.target}`);}
const wb=Workbook.create();
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
function add(name,headers,data,widths){const s=wb.worksheets.add(name);const end=col(headers.length-1);s.getRange(`A1:${end}${data.length+1}`).values=[headers,...data];const all=s.getRange(`A1:${end}${data.length+1}`);all.format.font={name:'Aptos',size:11,color:'#17324D'};all.format.wrapText=true;all.format.verticalAlignment='center';all.format.rowHeight=64;headers.forEach((_,i)=>s.getRange(`${col(i)}1:${col(i)}${data.length+1}`).format.columnWidth=widths?.[i]||24);s.getRange(`A1:${end}1`).format.fill='#17324D';s.getRange(`A1:${end}1`).format.font={name:'Aptos',size:11,bold:true,color:'#FFFFFF'};s.getRange(`A1:${end}1`).format.rowHeight=40;s.tables.add(`A1:${end}${data.length+1}`,true,'T'+name.replace(/[^a-z]/gi,''));return s;}
const weight=r=>r.analystIntent==='Transactional'?3:r.analystIntent==='Commercial'?2:1;
const score=r=>r.volume===null||r.difficulty===null?null:r.volume*weight(r)/Math.max(1,r.difficulty);
const matrix=r=>[r.keyword,r.volume,r.difficulty,r.cpc,r.intent||'Unavailable',r.intentCodes?.join(', ')||'Unavailable',r.keyword.startsWith('genie media')?'Navigational':r.analystIntent,r.location,r.language,r.cluster,r.target,r.source,r.retrieved,r.updated||'Unavailable',r.flag,r.volume===null?'Unavailable':r.volume===0?'Reported zero; not proof of no demand':r.volume>=1000?'1,000+ searches/month':r.volume>=100?'100–999 searches/month':'1–99 searches/month',score(r)];
const headers=['Keyword','Monthly searches','SEO difficulty','CPC USD','Provider intent label','Provider intent codes','Analyst intent (inferred)','Metric geography','Language','Service cluster','Recommended target page','Source tool','Retrieved date','Metrics updated','Relevance / usage flag','Volume band','Opportunity score'];
const widths=[48,18,16,14,24,24,27,24,18,27,58,58,20,22,70,38,22];
const all=add('All keyword suggestions',headers,rows.map(matrix),widths);
all.getRange(`D2:D551`).setNumberFormat('0.000');
all.getRange('Q2:Q551').formulas=rows.map((r,i)=>[`=IF(OR(B${i+2}="",C${i+2}=""),"",B${i+2}*${weight(r)}/MAX(1,C${i+2}))`]);all.getRange('Q2:Q551').setNumberFormat('0.0');
const clusters=['Digital Marketing','Website Development','SEO Services','Production House','Podcast Studio Rentals','Other internal pages'];
const priority=clusters.flatMap(c=>rows.filter(r=>r.cluster===c&&r.volume>0&&r.difficulty<=35&&r.analystIntent!=='Informational').sort((a,b)=>(score(b)||0)-(score(a)||0)).slice(0,8));
add('Highest-priority opportunities',['Service','Keyword','Monthly searches','Difficulty','CPC USD','Target page','Reason / limits','Score'],priority.map(r=>[r.cluster,r.keyword,r.volume,r.difficulty,r.cpc,r.target,`${r.volume} estimated monthly searches; difficulty ${r.difficulty}. ${r.location} dataset. ${/near me|podcast studio/.test(r.keyword)?'Local demand is not all addressable from Vizag.':'Check service fit and current SERP before expansion.'}`,score(r)]),[28,49,19,15,15,60,80,18]);
for(const c of clusters)add(c,headers,rows.filter(r=>r.cluster===c).map(matrix),widths);
const local=rows.filter(r=>/vizag|visakhapatnam|mvp colony|madhurawada|yendada|andhra pradesh|india|near me/.test(r.keyword));
add('Location-specific keywords',[...headers,'Geographic interpretation'],local.map(r=>[...matrix(r),/mvp colony|madhurawada|yendada/.test(r.keyword)?'Neighbourhood ID unavailable; phrase metric is India-wide':r.location==='Visakhapatnam'?'City-targeted provider database':/near me/.test(r.keyword)?'National near-me estimate; do not call this Vizag volume':'National database with location modifier']),[...widths,75]);
const changed=new Set(['/digital_marketing/local-seo','/digital_marketing/ecommerce-seo','/digital_marketing/content-marketing','/digital_marketing/social-media-marketing','/web_development/website-redesign','/web_development/website-maintenance','/production_house']);
const mapping=pages.map(p=>{const prior=oldMap.find(r=>r[0]===p.route);const mapped=rows.filter(r=>r.target===p.route).sort((a,b)=>(score(b)||0)-(score(a)||0));let primary=prior?.[1]||p.h1;const fixes={'/':'genie media and studio','/services':'genie media services','/digital_marketing/social-media-marketing':'social media marketing services'};primary=fixes[p.route]||primary;const exact=rows.find(r=>r.keyword.toLowerCase()===primary.toLowerCase());return[p.route,primary,mapped.filter(r=>r.keyword!==primary).slice(0,8).map(r=>r.keyword).join('; '),mapped.filter(r=>r.analystIntent==='Informational').slice(0,3).map(r=>r.keyword).join('; '),mapped.length,p.title,p.description,p.h1,p.canonical,p.schema,exact?`Ubersuggest: ${exact.volume??'unavailable'} volume / ${exact.difficulty??'unavailable'} difficulty`:'Editorial page label; no keyword metrics claimed',changed.has(p.route)?'Changed this pass; all other pages audited and retained':'Audited; preserve existing page/CMS settings',p.route.startsWith('/podcast_studio')&&!/editing|production|repurposing/.test(p.route)?'Physical recording in Yendada, Vizag':'Local and remote service scope where appropriate'];});
add('Page-to-keyword mapping',['Existing page','Primary query / page intent','Secondary researched phrases (up to 8)','Question / supporting phrases','Assigned keywords','Rendered title','Rendered description','Rendered H1','Canonical URL','Structured data','Primary evidence','Implementation status','Location scope'],mapping,[57,47,95,85,20,65,90,70,65,60,65,65,70]);
for(const s of wb.worksheets.items)if(s.name==='Page-to-keyword mapping')s.getRange('A2:M52').format.rowHeight=160;
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'All keyword suggestions!A1:G5',include:'values,formulas',tableMaxRows:5,tableMaxCols:7,maxChars:1400})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:20},maxChars:500})).ndjson);
// Independently check formula output and restore an input after a sensitivity check.
const first=rows[0];const initial=all.getRange('Q2').values[0][0];assert(Math.abs(initial-score(first))<1e-8);
if(first.volume!==null){all.getRange('B2').values=[[first.volume+10]];wb.recalculate();assert(Math.abs(all.getRange('Q2').values[0][0]-(first.volume+10)*weight(first)/Math.max(1,first.difficulty))<1e-8);all.getRange('B2').values=[[first.volume]];}
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(out,'Genie-Media-550-Keywords.xlsx'));
for(const s of wb.worksheets.items){const blob=await wb.render({sheetName:s.name,range:s.name==='Page-to-keyword mapping'?'A1:C4':'A1:F5',scale:1});await fs.writeFile(path.join(out,'550-'+s.name.replace(/[^a-z]/gi,'-')+'.png'),new Uint8Array(await blob.arrayBuffer()));}
const csv=values=>values.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
await fs.writeFile(path.join(out,'Genie-Media-550-Keywords.csv'),'\ufeff'+csv([headers,...rows.map(matrix)]));
await fs.writeFile(path.join(root,'final-page-mapping.json'),JSON.stringify(mapping,null,2));
console.log(JSON.stringify({...counts,sheets:wb.worksheets.items.length,mappedPages:mapping.length,priorityRows:priority.length}));
