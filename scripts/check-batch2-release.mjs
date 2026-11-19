import {readFile,access} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isListicleReleased,releaseNow} from '../src/lib/listicle-release.mjs';
import {verifyFactBaseline} from './fact-baseline.mjs';
import {validateEditorial} from './check-scheduled-listicle.mjs';
export const field=(source,key)=>source.match(new RegExp(`^${key}:\\s*(.+)$`,'m'))?.[1]?.trim().replace(/^['"]|['"]$/g,'');
export function validateBatch2Config(config,source){
 if(config.postId!=='APT02'||field(source,'postId')!==config.postId||field(source,'slug')!==config.path||config.siteUrl!=='https://airporttransfersingapore.com'||config.indexPath!=='/blog/'||config.proposedPublishAt!=='2026-11-27T07:46:00+08:00')throw Error('APT02 identity or approved date differs');
 const approved=field(source,'approvedForProduction')==='true';
 if(approved!==config.approvedForProduction||approved!==config.editorialApproved)throw Error('Explicit matching editorial and production approval required');
 if(!approved){if(config.publishAt!==null||['publishAt','publishedAt','nextRefreshAt'].some(k=>field(source,k)!==undefined))throw Error('Held post has publication metadata');}
 else{
  const published=Date.parse(field(source,'publishedAt')),next=Date.parse(field(source,'nextRefreshAt'));
  if(field(source,'publishAt')!==config.proposedPublishAt||config.publishAt!==config.proposedPublishAt||!Number.isFinite(published)||published<Date.parse(config.publishAt)||!Number.isFinite(next)||next-published<26*86400000||next-published>37*86400000)throw Error('Approved publication and 26–37 day eligibility metadata required');
 }
 return approved;
}
// Full paragraph/row carriers are reviewed against all their component records.
// Advice, methodology and approved recommendation labels have explicit exclusions.
export function claimCarriers(source){
 const units=[];let rank=null,section='';
 for(const raw of source.replace(/^---\n[\s\S]*?\n---\n/,'').split('\n')){
  const text=raw.trim();if(!text)continue;
  if(text.startsWith('## ')){section=text.slice(3);rank=null;continue;}
  if(text.startsWith('### ')){const n=text.match(/^### (\d+)\./);rank=n?Number(n[1]):null;continue;}
  if(/^(?:import |<|#|---$|\|(?:-+\|)+$)/.test(text))continue;
  units.push({text,rank,section});
 }return units;
}
export function verifyCoverage(source,facts,coverage){
 const expected=claimCarriers(source);if(expected.length!==coverage.length)throw Error('Complete paragraph and grid coverage required');const ids=new Map(facts.map(f=>[f.id,f]));
 expected.forEach((unit,i)=>{const actual=coverage[i];if(unit.text!==actual.text||unit.rank!==actual.rank||unit.section!==actual.section||!actual.basis)throw Error('Unreviewed or changed claim carrier');if(actual.disposition==='source-or-checked-derivation'){if(!actual.factIds?.length||actual.factIds.some(id=>{const f=ids.get(id);return !f||!f.sentences.includes(unit.text)||(unit.rank!==null&&f.rank!==unit.rank);}))throw Error('Claim carrier has missing or wrong-provider evidence');}else if(!['editorial-advice','declared-method','brand-identity','approved-best-for-label','source-provenance'].includes(actual.disposition))throw Error('Unknown review disposition');});return expected.length;
}
const read=async(path)=>readFile(path,'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e;});
export async function checkBatch2(config,source,root=process.env.LISTICLE_DIST??'dist',production=process.env.SITE_ENV==='production'){
 const armed=validateBatch2Config(config,source),dir=dirname(config.contentPath),load=async name=>JSON.parse(await readFile(join(dir,name),'utf8'));
 const [providers,shots,facts,evidence,audit,coverage,editorial]=await Promise.all(['sources.json','screenshots.json','facts.json','source-evidence.json','facts-audit.json','claim-coverage.json','editorial-evidence.json'].map(load));
 if(providers.length!==12||shots.length!==12||providers.some((p,i)=>p.rank!==i+1||shots[i].rank!==p.rank||shots[i].provider!==p.name||shots[i].image!==p.image||shots[i].capturedAt!==(p.capturedAt??null)))throw Error('Twelve ranked provider/capture records required');
 const rateCard=await readFile(join(dir,'rate-card.md'),'utf8');
 for(const fact of facts.filter(f=>f.type==='price'))if(!rateCard.includes(fact.rateCardSnippet)||fact.rateCardSnippets?.some(line=>!rateCard.includes(line)))throw Error('Price lacks verbatim approved card authority');
 verifyFactBaseline({mdx:source,facts,evidence,providers,audit,armed});
 if(audit.complete){verifyCoverage(source,facts,coverage);validateEditorial(source,editorial,facts,providers,12);}
 const due=isListicleReleased({approvedForProduction:armed,publishAt:config.publishAt},production,releaseNow());
 const [html,index,sitemap,llms,home,first]=await Promise.all([read(join(root,config.path,'index.html')),read(join(root,config.indexPath,'index.html')),Promise.all(['sitemap-index.xml','sitemap-0.xml'].map(name=>read(join(root,name)))).then(parts=>parts.join('\n')),read(join(root,'llms.txt')),read(join(root,'index.html')),read(join(root,'blog/changi-airport-transfer-options-compared/index.html'))]);
 const back='href="'+config.path+'"',firstPath='/blog/changi-airport-transfer-options-compared/';
 if(production&&!due){if(html||[index,sitemap,llms].some(s=>s.includes(config.path))||first.includes(back))throw Error('Future APT02 route, discovery or paired link leaked');console.log('APT02: held out of production, including APT01 backlink.');return;}
 if(!html||!index.includes(back)||!sitemap.includes(config.siteUrl+config.path)||!home.includes('href="/blog/"')||!first.includes(back)||!html.includes('href="'+firstPath+'"'))throw Error('APT02 route, discovery, navigation or paired links missing');
 if(!html.includes(`href="${config.siteUrl}${config.path}"`)||(production?/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html):!html.includes('noindex')))throw Error('Canonical/indexability mismatch');
 const schemas=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{const s=JSON.parse(m[1]);return[s,...s['@graph']??[]];});
 const list=schemas.find(s=>s['@type']==='ItemList'),article=schemas.find(s=>s['@type']==='Article');
 if(list?.itemListElement?.length!==12||list.itemListElement.some((p,i)=>p.position!==i+1||p.name!==providers[i].name||p.url||p.sameAs)||!article||Boolean(article.datePublished)!==armed||article.dateModified!==new Date(field(source,'updatedAt')).toISOString()||(armed&&article.datePublished!==new Date(field(source,'publishedAt')).toISOString())||schemas.some(s=>['Review','AggregateRating'].includes(s['@type'])))throw Error('APT02 provider/date schema mismatch');
 const body=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];if((html.match(/<h1\b/g)||[]).length!==1)throw Error('One article H1 required');
 if(!body||/INTERNAL QA|satellite|[—–“”‘’]/.test(body.replace(/<[^>]+>/g,' ')))throw Error('Forbidden article text');
 for(const m of body.matchAll(/(?:href|src)="([^"]+)"/g)){const url=m[1];if(/^(?:https?:)?\/\//.test(url)&&!url.startsWith(config.siteUrl+'/'))throw Error('Outbound article URL');if(url.startsWith('/')){const pathname=url.split(/[?#]/)[0];await access(join(root,pathname,pathname.endsWith('/')?'index.html':''));}}
 for(const p of providers){if(p.image){await access(join(root,p.image));if(!body.includes(p.image))throw Error('Missing capture');}else if(!(await readFile(join(dir,'capture-report.md'),'utf8')).includes(`FLAG ${p.rank}. ${p.name}`))throw Error('Undocumented capture failure');}
 console.log(`APT02: ${production?'production':'staging'} gates passed; ${facts.length} primary records, twelve providers, paired links and discovery.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const config=JSON.parse(await readFile('scripts/batch2-release.json','utf8'));await checkBatch2(config,await readFile(config.contentPath,'utf8'));}
