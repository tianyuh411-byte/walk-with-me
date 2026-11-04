// Upload only the sanitized source staging directory through GitHub's visible file picker.
const fs=require('node:fs/promises'),path=require('node:path');
const{chromium}=require('C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=path.resolve(process.env.WWM_PUBLISH_STAGE||path.join(__dirname,'../release/github-repo'));
 const entries=await fs.readdir(root,{recursive:true,withFileTypes:true});
 const files=[];
 for(const e of entries){if(!e.isFile())continue;const full=path.join(e.parentPath||e.path,e.name),name=path.relative(root,full).replaceAll('\\','/');if(name.split('/').some(p=>['.local-browser','.git','vendor','node_modules','artifacts','release'].includes(p)))throw Error('Excluded path '+name);files.push({name,mimeType:'application/octet-stream',buffer:await fs.readFile(full)});}
 if(files.length>100)throw Error('Too many files for the browser upload');
 const b=await chromium.connectOverCDP('http://127.0.0.1:9338');
 try{const p=b.contexts()[0].pages().find(p=>p.url().includes('github.com/tianyuh411-byte/walk-with-me/upload'));
 if(!p)throw Error('Official repository upload page is not open');
 await p.locator('input[type=file]').setInputFiles(files);
 await p.waitForTimeout(6000);
 console.log((await p.locator('body').innerText()).slice(0,15000));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
