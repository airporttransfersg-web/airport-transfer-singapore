import {spawnSync} from 'node:child_process';import {mkdtemp,cp,rm,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';import {readFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('scripts/listicle-schedule.json','utf8'));const baseEnv={...process.env,SITE_ENV:'production'};delete baseEnv.LISTICLE_RELEASE_TEST_NOW;
const build=env=>{const r=spawnSync('npm',['run','build:production'],{stdio:'inherit',env});if(r.status!==0)throw Error(`Production release build failed (${r.status})`)};
build(baseEnv);const saved=await mkdtemp(join(tmpdir(),'listicle-before-'));await cp('dist',join(saved,'dist'),{recursive:true});const future=new Date(Math.max(Date.now(),Date.parse(config.publishAt))+1000).toISOString();
try{build({...baseEnv,LISTICLE_RELEASE_TEST_NOW:future});await writeFile('listicle-build-verification.json',JSON.stringify({postId:config.postId,publishAt:config.publishAt,normalProductionBuild:'passed',releaseBoundaryBuild:'passed',releaseClock:future,verifiedAt:new Date().toISOString()},null,2)+'\n')}
finally{await rm('dist',{recursive:true,force:true});await cp(join(saved,'dist'),'dist',{recursive:true});await rm(saved,{recursive:true,force:true})}
console.log(`${config.postId}: real-date and release-date builds passed; restored real-date output.`);
