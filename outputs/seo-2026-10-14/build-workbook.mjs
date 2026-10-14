import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const base=path.resolve('frontend-next');
const folder=path.join(base,'audits/seo-research-2026-10-14');
const raw=JSON.parse(await fs.readFile(path.join(folder,'raw-research.json'),'utf8'));
const audit=JSON.parse(await fs.readFile(path.join(folder,'page-audit.json'),'utf8'));
const competitors=JSON.parse(await fs.readFile(path.join(folder,'competitor-keywords.json'),'utf8'));
const output=path.resolve('outputs/seo-2026-10-14');
const wb=Workbook.create();
const mapping={};
for(const [file,section] of [['dmServicePages.ts','digital_marketing'],['webDevPages.ts','web_development'],['podcastPages.ts','podcast_studio']]) {
 const text=await fs.readFile(path.join(base,'src/content',file),'utf8');
 const chunks=text.split(/\n\s+slug: "/).slice(1);
 for(const chunk of chunks){const slug=chunk.split('"')[0];const primary=chunk.match(/primaryKeyword: "([^"]+)"/)?.[1]||slug;const secondary=chunk.match(/secondaryKeywords: \[([^\]]+)\]/)?.[1].match(/"([^"]+)"/g)?.map(s=>s.slice(1,-1))||[];const long=chunk.match(/longTail: \[([^\]]+)\]/)?.[1].match(/"([^"]+)"/g)?.map(s=>s.slice(1,-1))||[];mapping[`/${section}/${slug}`]={primary,secondary,long};}
}
const overrides={
 '/':['Genie Media & Studio Vizag','creative media agency Vizag; marketing and production studio'],
 '/digital_marketing':['digital marketing agency in vizag','digital marketing in Visakhapatnam; digital marketing agency Vizag'],
 '/web_development':['website development company in Vizag','web development companies in Visakhapatnam; custom website development'],
 '/production_house':['production house in vizag','video production company in Visakhapatnam; corporate video production'],
 '/podcast_studio':['podcast studio in vizag','podcast recording studio Visakhapatnam; podcast studio Yendada'],
 '/web_development/website-design':['website designers in vizag','web designing company in Visakhapatnam; mobile-friendly website design'],
 '/web_development/website-development':['custom website development services','website development process; website integrations'],
 '/podcast_studio/rental':['podcast studio rental','hourly podcast studio hire Vizag; podcast recording room rental'],
 '/podcast_studio/pricing':['podcast studio rental rates','podcast studio prices Vizag; studio recording packages'],
 '/podcast_studio/booking':['book podcast studio Vizag','podcast studio availability; reserve recording session'],
 '/services':['Genie Media services','marketing website video and podcast services'],
 '/about':['about Genie Media & Studio','Genie Media team Visakhapatnam'],
 '/contact':['Genie Media contact','Genie Media Yendada address; studio directions'],
 '/projects':['Genie Media website portfolio','website development projects; ecommerce website examples'],
 '/case-studies':['Genie Media case studies','client project stories; website project approach'],
 '/blogs':['Genie Media digital marketing blog','marketing guides; website tips; SEO articles'],
 '/reviews':['Genie Media reviews','client testimonials; Genie Media studio reviews'],
 '/privacy-policy':['Genie Media privacy policy','personal information; enquiry data'],
 '/terms-and-conditions':['Genie Media terms and conditions','website terms; service enquiry terms']
};
for(const [url,[primary,secondary]] of Object.entries(overrides))mapping[url]={...mapping[url],primary,secondary:secondary.split('; '),long:mapping[url]?.long||[]};
const measuredRoute={
 'seo services in vizag':'/digital_marketing/seo-services','local seo services':'/digital_marketing/local-seo','technical seo services':'/digital_marketing/technical-seo','on page seo services':'/digital_marketing/on-page-seo','ecommerce seo services':'/digital_marketing/ecommerce-seo','seo audit services':'/digital_marketing/seo-audit','answer engine optimization services':'/digital_marketing/aeo','generative engine optimization services':'/digital_marketing/geo','google ads agency':'/digital_marketing/google-ads','content marketing services':'/digital_marketing/content-marketing','social media marketing agency in vizag':'/digital_marketing/social-media-marketing','lead generation services':'/digital_marketing/lead-generation','conversion rate optimization services':'/digital_marketing/conversion-optimization','wordpress development services':'/web_development/wordpress','shopify development services':'/web_development/shopify','woocommerce development services':'/web_development/woocommerce','react development company':'/web_development/react-development','next js development company':'/web_development/nextjs-development','react native development company':'/web_development/react-native','website redesign services':'/web_development/website-redesign','website maintenance services':'/web_development/website-maintenance','website speed optimization services':'/web_development/website-speed-optimization','ecommerce website development':'/web_development/ecommerce-websites','podcast editing services':'/podcast_studio/editing','podcast production services':'/podcast_studio/production','video podcast studio':'/podcast_studio/video-podcast'};
for(const [keyword,url] of Object.entries(measuredRoute)){mapping[url].primary=keyword;}
const routeFor=k=>measuredRoute[k]||Object.keys(mapping).find(url=>mapping[url].primary.toLowerCase()===k.toLowerCase())||(/marketing/.test(k)?'/digital_marketing':/podcast/.test(k)?'/podcast_studio':/production/.test(k)?'/production_house':'/web_development');
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
function sheet(name,headers,rows,widths){const s=wb.worksheets.add(name);s.getRange(`A1:${col(headers.length-1)}${rows.length+1}`).values=[headers,...rows];s.getRange(`A1:${col(headers.length-1)}${rows.length+1}`).format.font={name:'Aptos',size:11,color:'#16324F'};s.getRange(`A1:${col(headers.length-1)}1`).format.fill='#16324F';s.getRange(`A1:${col(headers.length-1)}1`).format.font={bold:true,color:'#FFFFFF',size:11};s.getRange(`A1:${col(headers.length-1)}${rows.length+1}`).format.wrapText=true;s.getRange(`A1:${col(headers.length-1)}1`).format.rowHeight=34; s.getRange(`A2:${col(headers.length-1)}${rows.length+1}`).format.rowHeight=65;headers.forEach((_,i)=>s.getRange(`${col(i)}1:${col(i)}${rows.length+1}`).format.columnWidth=widths?.[i]||25);s.tables.add(`A1:${col(headers.length-1)}${rows.length+1}`,true,name.replaceAll(' ','')+'Table');return s;}
const shortlist=raw.shortlist.map(({data:d})=>({...d,route:routeFor(d.keyword)})).sort((a,b)=>(b.search_volume||0)/Math.max(1,b.seo_difficulty||1)-(a.search_volume||0)/Math.max(1,a.seo_difficulty||1));
sheet('Keyword priorities',['Keyword','Monthly volume','SEO difficulty','CPC USD','Intent','Intent source','Market','Target page','Priority decision','Opportunity score','Source / retrieved','Latest volume month'],shortlist.map(d=>[d.keyword,d.search_volume??null,d.seo_difficulty??null,d.cpc??null,d.search_intent||'Commercial','Ubersuggest'+(!d.search_intent?' unavailable; analyst inferred':''),'India / English',d.route,d.search_volume===0?'Local relevance only; reported zero, not proven no demand':d.seo_difficulty<=30?'Prioritize service fit and supporting evidence':'Longer-term; strengthen proof and content',null,'Ubersuggest keyword_overview / 2026-10-14',d.monthly_searches?.at(-1)?.period||'Unavailable']),[42,15,15,13,20,32,20,47,49,19,44,21]);
const priority=wb.worksheets.getItem('Keyword priorities');
priority.getRange(`J2:J${shortlist.length+1}`).formulas=shortlist.map((_,i)=>[`=IF(OR(B${i+2}="",C${i+2}=""),"",B${i+2}*IF(E${i+2}="Transactional",3,IF(E${i+2}="Commercial",2,1))/MAX(1,C${i+2}))`]);
priority.getRange(`D2:D${shortlist.length+1}`).setNumberFormat('0.000');priority.getRange(`J2:J${shortlist.length+1}`).setNumberFormat('0.0');
const pageRows=audit.rows.filter(r=>!r.noindex).map(r=>{let m=mapping[r.route];if(!m){const audience=r.route.includes('right-message');const partner=r.route.includes('digital-partner');m={primary:audience?'how to identify your target audience':partner?'how to choose a digital marketing partner':'Genie Media digital marketing approach',secondary:audience?['customer research','audience segmentation']:['digital marketing services','agency selection'],long:[],};}const measured=shortlist.find(d=>d.keyword.toLowerCase()===m.primary.toLowerCase());return [r.route,m.primary,m.secondary.join('; '),(m.long||[]).join('; '),r.route.startsWith('/blog/')?'Informational':/^\/(about|contact|reviews|projects|case-studies|services|privacy|terms)/.test(r.route)||r.route==='/'?'Navigational':'Commercial',r.route.includes('/podcast_studio')&&!/editing|production|repurposing/.test(r.route)?'Physical studio: Yendada / Vizag': 'Vizag / Andhra Pradesh; remote India where relevant',r.title,r.description,r.h1,measured?'Exact researched term':'Editorial mapping; no exact metric claimed',r.canonical,r.schema,r.route.includes('top-10')?'Review unsupported top-10 claim with evidence; preserve URL until redirect plan approved':r.route==='/case-studies'?'Publish verified project stories; no published studies yet':r.route==='/web_development/website-development'?'Differentiate custom build process from main service hub':'Maintain useful content; link to specialist and contact pages'];});
sheet('Page mapping',['Page','Primary keyword','Secondary keywords','Long-tail variations','Intent','Location scope','Rendered SEO title','Rendered description','Rendered H1','Metric evidence','Canonical','Structured data','Next action'],pageRows,[45,38,55,60,20,50,58,75,60,35,55,50,65]);
const variants=[];for(const call of raw.research)for(const d of [...(call.data.searched_keywords||[]),...(call.data.results||[])])variants.push([d.keyword,d.volume??null,d.sd??null,d.cpcDollars??null,call.args.locId===2356?'India':'Visakhapatnam',d.searchIntent?.join(', ')||'Unavailable',/course|job|salary|tutorial|houston|nyc|chicago|dubai|toronto|london|equipment|rodecaster|maono|yrf|yash raj|red chillies/i.test(d.keyword)?'Exclude: other intent, location or brand':'Candidate only; validate service fit','Ubersuggest keyword_suggestions / 2026-10-14',d.updated_at?new Date(d.updated_at*1000).toISOString().slice(0,10):'Unavailable']);
sheet('Keyword variations',['Keyword','Monthly volume','SEO difficulty','CPC USD','Metric market','Provider intent codes','Selection note','Source / retrieved','Provider updated'],variants,[47,15,15,13,23,24,51,49,23]);
const compRows=competitors.flatMap(({domain,data})=>(data.results||[]).map(d=>[domain,d.keyword,d.position,d.volume,d.sd,d.cpc,d.search_intent||'Unavailable',d.url,/vizag|visakhapatnam/.test(d.keyword)&&!/jobs|course/.test(d.keyword)?'Relevant local gap candidate':'Exclude brand, unrelated location/topic or employment','Ubersuggest domain_keywords / India / 2026-10-14']));
sheet('Competitor keywords',['Domain','Keyword','Provider position','Volume','SEO difficulty','CPC USD','Provider intent','Ranking URL','Decision','Source'],compRows,[29,48,20,15,16,14,20,75,54,58]);
sheet('Tracking baseline',['Keyword','Landing page','Location','Device','Baseline position','Baseline date','Baseline status','Next measurement'],shortlist.flatMap(d=>['India','Visakhapatnam'].map(location=>[d.keyword,d.route,location,'Desktop; collect mobile separately',null,'2026-10-14','Unavailable: domain report empty; project has no tracked keywords','Add exact query/location to existing project; weekly rank and landing URL capture'])),[43,48,22,36,19,19,65,72]);
sheet('Method and actions',['Priority','Action / method','Evidence / limitation'],[
 ['P0','Deploy tested build, then re-crawl the public site','Code changes are local. Existing CMS metadata overrides four service hubs; rendered values are in Page mapping.'],
 ['P0','Restore or replace three missing blog images','Live sitemap image URLs returned 404; files need original media or verified replacements.'],
 ['P1','Own one search intent per page','Homepage = brand and service overview; digital marketing hub = agency queries; design = designers; rental/pricing/booking = different tasks.'],
 ['P1','Local quick wins: digital marketing agency in Vizag, SEO services in Vizag, website designers in Vizag','India volumes 390 / 260 / 110; difficulty 11 / 11 / 12. Estimates retrieved 2026-10-14, not guarantees.'],
 ['P1','National opportunities: local SEO, ecommerce SEO, content marketing, ecommerce development, redesign','Use existing specialist pages; support claims with real projects, process, deliverables and clear enquiries.'],
 ['P1','Configure Search Console and GA4 measurement','No connected performance data available. Export preceding 28 days and compare 28/56/90 days after release by query/page/device/country.'],
 ['P1','Track Vizag and India separately each week','Existing Ubersuggest project has zero keywords, India location, desktop only, no analytics profile. Tracking worksheet is a plan; account settings were not changed.'],
 ['P1','Measure qualified enquiries','Verify successful form submit, phone and WhatsApp events. Report leads and lead quality, not ranking alone. Search Console does not provide city-level keyword data.'],
 ['P2','Review business profile and local proof','Use the verified Yendada address; add genuine photos, services and reviews. Do not imply offices in MVP Colony or Madhurawada.'],
 ['Method','Opportunity score = volume × intent weight / MAX(1, difficulty)','Commercial weight 2; transactional 3; other 1. Worksheet row order begins with volume/difficulty; use filters to sort calculated scores. Service fit and location remain manual decisions.'],
 ['Method','CPC is USD','Overview CPC is documented USD. Suggestions use explicit cpcDollars; ambiguous raw cpc is preserved only in raw JSON.'],
 ['Method','Zero and missing differ','Zero is retained where provider reported it. Blank means unavailable. Zero-volume neighbourhood terms support useful local copy, not duplicate pages.'],
 ['Method','Keyword market differs from keyword location modifier','India rows are national estimates even when query includes Vizag. Separate Visakhapatnam suggestion rows have city-targeted metrics.'],
 ['Limit','Neighbourhood location IDs unavailable','MVP Colony, Madhurawada and Yendada returned no IDs; use query modifiers, not guessed geographic IDs. Andhra Pradesh lookup returned cities rather than a verified state ID.'],
 ['Limit','Semrush data unavailable','Active subscription but insufficient API units. No Keyword Magic metrics included. https://www.semrush.com/mcp-access'],
 ['Limit','Baseline unavailable does not mean rank zero or outside top 100','No domain ranking rows returned; not equivalent to a measured SERP position. Competitor report positions are provider snapshots.'],
 ['Limit','Metrics have mixed data freshness','Retrieval date is 2026-10-14. Latest monthly history varies by keyword; provider intent may differ from analyst interpretation.'],
 ['Limit','Runway not needed','No generated media required for these SEO fixes; preserve real studio and portfolio images.'],
 ],[17,85,110]);
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'Keyword priorities!A1:J5',include:'values,formulas',tableMaxRows:5,tableMaxCols:10,maxChars:1800})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!',options:{useRegex:true,maxResults:20},maxChars:1000})).ndjson);
for(const name of ['Keyword priorities','Page mapping','Keyword variations','Competitor keywords','Tracking baseline','Method and actions']) {const blob=await wb.render({sheetName:name,range:name==='Method and actions'?'A1:C5':'A1:F5',scale:1});await fs.writeFile(path.join(output,name.replaceAll(' ','-')+'.png'),new Uint8Array(await blob.arrayBuffer()));}
await (await SpreadsheetFile.exportXlsx(wb)).save(path.join(output,'Genie-Media-SEO-Research.xlsx'));
await fs.writeFile(path.join(folder,'page-mapping.json'),JSON.stringify(pageRows,null,2));
console.log(JSON.stringify({shortlist:shortlist.length,variations:variants.length,pages:pageRows.length,competitorKeywords:compRows.length}));
