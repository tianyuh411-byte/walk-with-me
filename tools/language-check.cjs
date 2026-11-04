const{createRequire}=require('node:module'),path=require('node:path'),assert=require('node:assert/strict'),fs=require('node:fs/promises');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
const packs=require('../js/strings.js');
function sameKeys(a,b,label){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),label);}
sameKeys(packs.en,packs.zh,'language keys');sameKeys(packs.en.staticHTML,packs.zh.staticHTML,'HTML keys');sameKeys(packs.en.aria,packs.zh.aria,'ARIA keys');
packs.en.rooms.forEach((r,i)=>sameKeys(r,packs.zh.rooms[i],`room ${i}`));
(async()=>{
 const b=await rt('playwright').chromium.launch({channel:'msedge',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto(process.env.TEST_URL||'http://localhost:5183');await p.waitForFunction(()=>window.WWMDebug);assert.equal(await p.getAttribute('html','lang'),'en');
  await p.click('#language');assert.equal(await p.getAttribute('html','lang'),'zh-CN');assert.ok((await p.textContent('h1')).includes('独自前行'));
  await p.screenshot({path:path.join(__dirname,'../artifacts/10-title-zh.png'),fullPage:true});
  await p.reload();await p.waitForFunction(()=>window.WWMDebug);assert.equal(await p.getAttribute('html','lang'),'zh-CN');
  await p.click('#begin');assert.equal(await p.textContent('#room-title'),'相遇');await p.keyboard.press('r');await p.waitForTimeout(250);
  const before=await p.evaluate(()=>WWMDebug.snapshot());await p.click('#language');const after=await p.evaluate(()=>WWMDebug.snapshot());assert.equal(after.mode,'recording');assert.ok(after.time>=before.time);assert.equal(after.samples>=before.samples,true);
  await p.click('#language');await p.keyboard.press('r');const echo=await p.evaluate(()=>WWMDebug.snapshot().echo);assert.ok(echo);await p.click('#language');assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).echo.duration,echo.duration);await p.click('#language');
  await p.keyboard.press('Escape');assert.equal(await p.textContent('#modal-title'),'停下来，歇一会儿。');const frozen=await p.evaluate(()=>WWMDebug.snapshot().time);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>WWMDebug.snapshot().time),frozen);await p.click('#modal-actions button:first-child');
  await p.click('#help');assert.ok((await p.textContent('#modal-copy')).includes('2.4 秒'));await p.click('#modal-actions button:last-child');assert.equal(await p.textContent('#modal-actions button:last-child'),'查看完整路线');await p.click('#modal-actions button:last-child');assert.ok((await p.textContent('#modal-copy')).includes('向左'));await p.click('#modal-actions button:first-child');
  await p.screenshot({path:path.join(__dirname,'../artifacts/11-room-zh.png'),fullPage:true});
  for(const width of [320,390,960]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);}
  await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(__dirname,'../artifacts/12-mobile-zh.png'),fullPage:true});
  await p.click('#language');assert.equal(await p.getAttribute('html','lang'),'en');await p.setViewportSize({width:320,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'English 320 overflow');await p.reload();await p.waitForFunction(()=>window.WWMDebug);assert.equal(await p.getAttribute('html','lang'),'en');
  assert.deepEqual(errors,[]);console.log('PASS full EN/ZH key parity, English default, saved language, recording/playback preservation, Chinese pause/help/full-route, 320/390/960 layouts, switch back to English');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
