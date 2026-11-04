const{createRequire}=require('node:module'),path=require('node:path'),assert=require('node:assert/strict');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
(async()=>{
 const b=await rt('playwright').chromium.launch({channel:'msedge',headless:true});
 try{for(const size of [{width:844,height:390},{width:740,height:360}]){
  const c=await b.newContext({viewport:size,isMobile:true,hasTouch:true});const p=await c.newPage();await p.goto(process.env.TEST_URL||'http://localhost:5183');await p.waitForFunction(()=>window.WWMDebug);
  await p.click('#language');await p.click('#begin');const button=p.locator('[data-dir="right"]');const box=await button.boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=size.width&&box.y+box.height<=size.height);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const before=await p.evaluate(()=>WWMDebug.snapshot().player.x);
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(350);await p.mouse.up();assert.ok((await p.evaluate(()=>WWMDebug.snapshot().player.x))>before+.6);
  await p.click('#record');assert.equal(await p.textContent('#status'),'正在录制');await p.click('#record');assert.equal(await p.textContent('#status'),'回声回放');
  await p.screenshot({path:path.join(__dirname,`../artifacts/taptap-landscape-${size.width}.png`),fullPage:true});await c.close();
 }console.log('PASS 844×390 and 740×360 landscape touch layouts: visible controls, actual movement and recording/playback, no overflow (not a real TapTap device test).');}finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
