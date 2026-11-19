import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {captureFailure,captureStatus} from './capture-state.mjs';
const require=createRequire(import.meta.url);
// Optional capture dependencies may live outside this site's production dependency tree.
const modules=process.env.CAPTURE_MODULE_ROOT??'.';
const {chromium}=require(modules+'/node_modules/playwright'), sharp=require(modules+'/node_modules/sharp');
const source='src/content/listicle-reviews/APT02/sources.json';
const providers=JSON.parse(await readFile(source,'utf8'));
const date=process.env.CAPTURE_DATE??new Date().toISOString();
const stamp=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date)).replaceAll('-','');
const out='public/images/listicles/APT02';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
const selected=(process.env.CAPTURE_RANKS??'').split(',').filter(Boolean).map(Number);
const report=selected.length?(await readFile('src/content/listicle-reviews/APT02/capture-report.md','utf8')).split('\n').filter(line=>!selected.some(rank=>new RegExp(`^- (?:FLAG )?${rank}\\.`).test(line))):['# APT02 capture report','',`Captured: ${date}`,''];
if(selected.length)report.push(`Selected entries recaptured: ${date}`);
const failedRanks=new Set();
try {
 for(const provider of providers){
  if(selected.length&&!selected.includes(provider.rank))continue;
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await context.newPage();let problem;
  for(let attempt=0;attempt<2;attempt++){
   try{
    const response=await page.goto(provider.home,{waitUntil:'networkidle',timeout:45000});
    if(!response?.ok())throw Error(`HTTP ${response?.status()}`);
    await page.waitForTimeout(2000);
    const declineName=/^(decline(?: all)?(?: cookies)?|reject(?: all)?(?: cookies)?|(?:use |allow )?(?:only )?necessary(?: cookies)?(?: only)?|essential only)$/i;
    const decline=page.getByRole('button',{name:declineName}).or(page.getByRole('link',{name:declineName})).or(page.getByText(declineName,{exact:true})).filter({visible:true}).first();
    if(await decline.isVisible().catch(()=>false)){
      await decline.click({timeout:2000});
      await decline.waitFor({state:'hidden',timeout:5000}).catch(()=>{});
    }
    const body=(await page.locator('body').innerText()).trim();
    if(body.length<150||/^(access denied|forbidden|just a moment|checking your browser)/i.test(body)||/domain (is |may be )?for sale|buy this domain|this site can.t be reached/i.test(body))throw Error('Blank, error, challenge or parked page');
    const target=`${out}/${provider.slug}-home-${stamp}.webp`;
    await sharp(await page.screenshot({fullPage:false})).resize({width:1200}).webp({quality:80}).toFile(target);
    provider.image='/'+target.replace('public/','');provider.capturedAt=date;
    provider.pages=[...new Set([...provider.pages,page.url()])];
    await writeFile(target+'.json',JSON.stringify({source:page.url(),capturedAt:date,viewport:'1440x900',width:1200,quality:80,prompt:`Homepage screenshot of ${page.url()}, captured ${date}, above the fold at 1440x900, resized proportionally to 1200px wide, WebP quality 80. No cropping, hiding or generation.`},null,2)+'\n');
    report.push(`- ${provider.rank}. ${provider.name}: captured ${page.url()}`);console.log(`Captured ${provider.rank}: ${provider.name}`);problem=null;break;
   }catch(error){problem=error.message.replace(/\u001b\[[0-9;]*m/g,'').split('\n')[0];}
  }
  if(problem){failedRanks.add(provider.rank);report.push(captureFailure(provider,problem));console.log(`FLAG ${provider.name}: ${problem}`);}
  await context.close();
 }
}finally{await browser.close();}
await writeFile(source,JSON.stringify(providers,null,2)+'\n');
await writeFile('src/content/listicle-reviews/APT02/screenshots.json',JSON.stringify(providers.map(p=>({rank:p.rank,provider:p.name,source:p.home,image:p.image,capturedAt:p.capturedAt??null,status:captureStatus(p,failedRanks.has(p.rank))})),null,2)+'\n');
await writeFile('src/content/listicle-reviews/APT02/capture-report.md',report.join('\n')+'\n');
