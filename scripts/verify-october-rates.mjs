import {readFile,writeFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('scripts/october-rate-targets.json','utf8'));
const mode=process.argv[2]??'local';
const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
function verify(html){
 const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>strip(x[1])));
 for(const [name,prices] of config.rows){
  const matches=rows.filter(r=>r[0]?.startsWith(name));
  if(!matches.some(r=>JSON.stringify([...r.join(' ').matchAll(/S\$([\d,]+)/g)].map(x=>Number(x[1].replaceAll(',',''))))===JSON.stringify(prices)))throw Error(`Rate row mismatch: ${name} expected ${prices.join('/')}`);
 }
}
if(mode==='local'){verify(await readFile(`dist${config.path}index.html`,'utf8'));console.log(`${config.site}: local rate rows match the approved card`);}
else{
 const deadline=Date.now()+12*60_000;let problem;let success=false;
 do{try{const r=await fetch(config.url+config.path+'?rate-check='+Date.now(),{signal:AbortSignal.timeout(20000),headers:{'Cache-Control':'no-cache'}});if(!r.ok)throw Error(`HTTP ${r.status}`);verify(await r.text());success=true;break;}catch(e){problem=e.message;console.log(problem);if(process.env.VERIFY_ONCE==='1')break;await new Promise(done=>setTimeout(done,20000));}}while(Date.now()<deadline);
 await writeFile('rate-live-result.json',JSON.stringify({success,url:config.url+config.path,checkedAt:new Date().toISOString(),...(success?{}:{problem})},null,2));
 if(!success)throw Error(problem);console.log(`${config.site}: LIVE rate rows verified`);
}
