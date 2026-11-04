const{createRequire}=require('node:module'),path=require('node:path'),fs=require('node:fs/promises');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
(async()=>{
 const b=await rt('playwright').chromium.launch({channel:'msedge',headless:true});
 try{const p=await b.newPage();await p.goto('https://www.taptap.cn/game-jam/thatgamejam2026',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2500);
 const data=await p.evaluate(()=>({text:document.body.innerText.slice(0,18000),links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText,url:a.href})),scripts:[...document.scripts].map(s=>s.src).filter(Boolean)}));
 await fs.writeFile(path.join(__dirname,'../release/taptap/docs/event-browser.json'),JSON.stringify(data,null,2));console.log(JSON.stringify(data,null,2));
 const button=p.getByRole('button',{name:'上传作品'});if(await button.count()){p.context().on('page',popup=>{console.log('UPLOAD OPENS:',popup.url());popup.on('framenavigated',frame=>{if(frame===popup.mainFrame())console.log('UPLOAD DESTINATION:',frame.url());});});await button.click();await p.waitForTimeout(4000);for(const page of p.context().pages())console.log('OPEN PAGE:',page.url());await p.screenshot({path:path.join(__dirname,'../artifacts/jam-upload-entry.png')});}
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
