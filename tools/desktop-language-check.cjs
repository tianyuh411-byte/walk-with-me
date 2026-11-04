const{createRequire}=require('node:module'),path=require('node:path'),assert=require('node:assert/strict');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
(async()=>{
 const b=await rt('playwright').chromium.connectOverCDP(process.env.WWM_CDP||'http://127.0.0.1:9337');
 try{
  const context=b.contexts()[0];const p=context.pages().find(p=>p.url().includes('walkwithme.local'))||context.pages()[0]||await context.waitForEvent('page');await p.waitForURL('**/index.html');await p.reload();await p.waitForFunction(()=>window.WWMDebug);
  if(await p.getAttribute('html','lang')!=='zh-CN')await p.click('#language');
  assert.ok((await p.textContent('h1')).includes('独自前行'));await p.click('#begin');assert.equal(await p.textContent('#room-title'),'相遇');
  await p.keyboard.press('r');await p.waitForTimeout(300);await p.keyboard.press('r');assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).mode,'playback');
  await p.click('#language');assert.equal(await p.textContent('#status'),'Playback');assert.ok((await p.evaluate(()=>WWMDebug.snapshot())).echo);
  await p.click('#language');assert.equal(await p.textContent('#status'),'回声回放');
  await p.keyboard.press('Escape');assert.equal(await p.textContent('#modal-title'),'停下来，歇一会儿。');await p.click('#modal-actions button:first-child');
  await p.reload();await p.waitForFunction(()=>window.WWMDebug);assert.equal(await p.getAttribute('html','lang'),'zh-CN');
  await p.screenshot({path:path.join(__dirname,'../artifacts/13-final-windows-zh.png'),fullPage:true});
  await p.click('#language');assert.equal(await p.getAttribute('html','lang'),'en');
  console.log('PASS final Windows executable: complete Chinese title/room/status/pause, live EN/ZH switch preserving echo, preference persistence, return to English');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
