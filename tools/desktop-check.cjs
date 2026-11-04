const{createRequire}=require('node:module'),{execFileSync}=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
(async()=>{
 const b=await rt('playwright').chromium.connectOverCDP(process.env.WWM_CDP||'http://127.0.0.1:9337');
 try{
  const p=b.contexts()[0].pages().find(p=>p.url().includes('walkwithme.local'));assert.ok(p,'Desktop game page');
  const act=action=>execFileSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'desktop-window.ps1'),'-GameProcessId',process.env.WWM_PROCESS_ID,'-Action',action],{encoding:'utf8'});
  act('restore');await p.waitForTimeout(400);await p.reload();await p.waitForFunction(()=>window.WWMDebug);await p.click('#begin');await p.keyboard.press('r');await p.waitForTimeout(500);
  assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).mode,'recording');
  act('minimize');await p.waitForTimeout(400);const frozen=await p.evaluate(()=>WWMDebug.snapshot());assert.equal(frozen.paused,true);
  await p.waitForTimeout(800);assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).time,frozen.time);
  act('restore');await p.waitForTimeout(300);assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).paused,true);
  await p.click('#modal-actions button:first-child');await p.waitForFunction(t=>WWMDebug.snapshot().time>t,frozen.time,{timeout:5000});
  console.log('PASS native Windows minimize pauses recording, restore keeps pause, explicit resume continues');
  await p.keyboard.press('r');act('resize');await p.waitForTimeout(400);
  assert.ok(await p.evaluate(()=>innerWidth<1050));assert.equal((await p.evaluate(()=>WWMDebug.snapshot())).mode,'playback');
  const before=await p.evaluate(()=>WWMDebug.snapshot().player.x);await p.keyboard.down('d');await p.waitForTimeout(300);await p.keyboard.up('d');assert.ok((await p.evaluate(()=>WWMDebug.snapshot().player.x))>before+.4);
  await p.screenshot({path:path.join(__dirname,'../artifacts/09-windows-resized.png'),fullPage:true});
  console.log('PASS native Windows window resize preserves playback and movement');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
