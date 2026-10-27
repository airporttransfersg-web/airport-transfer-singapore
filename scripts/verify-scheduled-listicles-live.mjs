import {readFile,writeFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('scripts/listicle-schedule.json','utf8'));if(Date.now()<Date.parse(config.publishAt)){console.log(`${config.postId} not due; no article indexing permitted by the production sitemap.`);process.exit(0)}
const origin=config.siteUrl,url=origin+config.path,deadline=Date.now()+30*60_000;let last;
while(Date.now()<deadline){try{
 const get=async path=>{const r=await fetch(new URL(path,origin).href+'?release-check='+Date.now(),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error(`${path} HTTP ${r.status}`);if(/noindex/i.test(r.headers.get('x-robots-tag')??''))throw Error(`${path} noindex response header`);return r.text()};
 const [html,index,home]=await Promise.all([get(config.path),get(config.indexPath),get('/')]);
 if(/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html))throw Error('Article meta noindex');
 const canonical=html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];if(canonical!==url)throw Error('Wrong canonical');
 if(!html.includes(config.postId==='F101'?'Grand Prix':'<h1'))throw Error('Article content missing');
 if(!index.includes(config.path)||!home.includes('href="'+config.indexPath+'"'))throw Error('Article index/footer navigation missing');
 let xml=await get('/'+(config.postId==='APT01'?'sitemap-index.xml':'sitemap.xml'));if(/<sitemapindex/.test(xml)){const child=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]));if(child.some(u=>u.origin!==origin))throw Error('Unexpected sitemap origin');xml=(await Promise.all(child.map(u=>get(u.pathname)))).join('\n')}
 if(!xml.includes(url))throw Error('Article not in live sitemap');
 await writeFile('listicle-live-result.json',JSON.stringify({url,status:200,canonical,indexable:true,indexLinked:true,footerLinked:true,sitemap:true,verifiedAt:new Date().toISOString()},null,2)+'\n');console.log(`${config.postId} live, indexable, linked and in sitemap.`);process.exit(0);
 }catch(e){last=e.message;console.log(`${last}. Retrying in 20 seconds.`);await new Promise(r=>setTimeout(r,20000))}}
throw Error('Scheduled listicle release did not verify: '+last);
