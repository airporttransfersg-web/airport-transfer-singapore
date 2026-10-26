import {readFile} from 'node:fs/promises';
const report=JSON.parse(await readFile(process.argv[2],'utf8'));
const repo=process.env.GITHUB_REPOSITORY, token=process.env.GITHUB_TOKEN;
const branch='codex/listicle-deployment-evidence';
const api=async(path,method='GET',data)=>{
 const r=await fetch(`https://api.github.com/repos/${repo}/${path}`,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'},...(data?{body:JSON.stringify(data)}:{})});
 const body=await r.json();return {ok:r.ok,status:r.status,body};
};
let ref=await api(`git/ref/heads/${branch}`);
if(ref.status===404){const created=await api('git/refs','POST',{ref:`refs/heads/${branch}`,sha:process.env.GITHUB_SHA});if(!created.ok)throw Error(`Evidence branch creation failed: HTTP ${created.status}`);}
const path='listicle-deployment-evidence.json';const old=await api(`contents/${path}?ref=${encodeURIComponent(branch)}`);
const saved=await api(`contents/${path}`,'PUT',{message:'Record listicle deployment evidence [skip ci]',branch,content:Buffer.from(JSON.stringify(report,null,2)+'\n').toString('base64'),...(old.ok?{sha:old.body.sha}:{})});
if(!saved.ok)throw Error(`Evidence write failed: HTTP ${saved.status}`);
console.log(`Saved deployment evidence to ${branch}/${path}`);
