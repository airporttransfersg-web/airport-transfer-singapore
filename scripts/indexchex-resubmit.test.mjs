import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,writeFile,readFile,copyFile,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {spawnSync} from 'node:child_process';
const config=JSON.parse(await readFile('scripts/listicle-schedule.json','utf8'));const url=config.siteUrl+config.path;
test('IndexChex history, explicit resubmission, and off-sitemap rejection use no real API',async()=>{
 const temp=await mkdtemp(join(tmpdir(),'listicle-index-'));
 try{
  await mkdir(join(temp,'scripts'));await mkdir(join(temp,'dist'));await mkdir(join(temp,'src/content/pages'),{recursive:true});
  await copyFile(resolve('scripts/submit-indexchex.mjs'),join(temp,'scripts/submit-indexchex.mjs'));
  await writeFile(join(temp,'dist/sitemap.xml'),`<urlset><url><loc>${url}</loc></url></urlset>`);
  await writeFile(join(temp,'src/content/pages/article.mdx'),`---\nslug: ${config.path}\npublishAt: 2020-01-01T00:00:00Z\nupdatedAt: 2026-10-27T04:00:00Z\n---\n`);
  await writeFile(join(temp,'mock.mjs'),`import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';globalThis.fetch=async(u,o={})=>{if(o.method==='POST'){const b=JSON.parse(o.body);assert.deepEqual(b.urls,[${JSON.stringify(url)}]);assert.equal('instantIndex' in b,false);await writeFile('posted.json',JSON.stringify(b));return new Response(JSON.stringify({job_id:'mock-job',code:0,task_id:'mock-task'}),{status:200})}if(String(u).includes('/v2/task/google/list/'))return new Response('{"code":0,"result":[]}',{status:200});if(String(u).includes('sitemap.xml'))return new Response(${JSON.stringify(`<urlset><url><loc>${url}</loc></url></urlset>`)});throw Error('Unexpected mocked request '+u)};`);
  const history=join(temp,'history.txt');
  const run=resubmit=>spawnSync(process.execPath,['scripts/submit-indexchex.mjs'],{cwd:temp,encoding:'utf8',env:{...process.env,NODE_OPTIONS:'--import='+join(temp,'mock.mjs'),INDEXCHEX_API_KEY:'mock-key',INDEXCHEX_API_BASE_URL:'https://mock.invalid/api',INDEXCHEX_HISTORY_PATH:history,INDEXCHEX_SITE_URL:config.siteUrl,INDEXCHEX_LOCAL_SITEMAP:'dist/sitemap.xml',INDEXCHEX_SITEMAP_PATH:'dist/sitemap.xml',INDEXCHEX_SITEMAP_URL:config.siteUrl+'/sitemap.xml',INDEXCHEX_URL_LIMIT:'0',INDEXCHEX_RESUBMIT_URLS:resubmit}});
  await writeFile(history,url+'\n');let r=run('');assert.equal(r.status,0,r.stderr);await assert.rejects(readFile(join(temp,'posted.json')));
  r=run(url);assert.equal(r.status,0,r.stderr);assert.deepEqual(JSON.parse(await readFile(join(temp,'posted.json'),'utf8')).urls,[url]);assert.equal((await readFile(history,'utf8')).trim(),url);
  await rm(join(temp,'posted.json'));r=run('https://example.com/');assert.notEqual(r.status,0);await assert.rejects(readFile(join(temp,'posted.json')));
 }finally{await rm(temp,{recursive:true,force:true})}
});
