// Real browser input; the read-only snapshot is used for observation, never state injection.
const {createRequire}=require('node:module'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict');
const requireRuntime=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm_test.cjs'));
const {chromium}=requireRuntime('playwright');
const {execFileSync}=require('node:child_process');
(async()=>{
 const browser=process.env.WWM_CDP?await chromium.connectOverCDP(process.env.WWM_CDP):await chromium.launch({channel:'msedge',headless:true});
 const context=process.env.WWM_CDP?browser.contexts()[0]:await browser.newContext({viewport:{width:1440,height:1000},...(process.env.WWM_VIDEO?{recordVideo:{dir:path.resolve(process.env.WWM_VIDEO),size:{width:1440,height:1000}}}:{})});
 const page=process.env.WWM_CDP?(context.pages().find(p=>p.url().includes('index.html'))||context.pages()[0]||await context.waitForEvent('page')):await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const dir=path.resolve(__dirname,'../artifacts');await fs.mkdir(dir,{recursive:true});
 const snap=()=>page.evaluate(()=>WWMDebug.snapshot());
 function restoreNative(){if(process.env.WWM_CDP&&process.env.WWM_PROCESS_ID)execFileSync('powershell',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'desktop-window.ps1'),'-GameProcessId',process.env.WWM_PROCESS_ID,'-Action','restore'],{stdio:'ignore'});}
 async function stepTo(x,y){
   for(const [axis,target,positive,negative] of [['x',x,'ArrowRight','ArrowLeft'],['y',y,'ArrowDown','ArrowUp']]){
     let state=await snap();if(Math.abs(state.player[axis]-target)<.085)continue;
     const key=state.player[axis]<target?positive:negative;await page.keyboard.down(key);
     const deadline=Date.now()+16000;let previousTime=state.time,stalledAt=Date.now();
     while(Date.now()<deadline){await page.waitForTimeout(25);state=await snap();
       if(state.time!==previousTime){previousTime=state.time;stalledAt=Date.now();}
       else if(Date.now()-stalledAt>1000&&process.env.WWM_PROCESS_ID){restoreNative();stalledAt=Date.now();console.log('NOTE restored externally minimized desktop test window');await page.keyboard.down(key);}
       if(state.paused&&state.modal==='pause'){
         // Native automation can lose foreground to the desktop app; resume through the UI.
         console.log('NOTE external focus loss paused play; clicked Resume and restored held direction');
         await page.locator('#modal-actions button').first().click();await page.keyboard.down(key);continue;
       }
       if(state.won||Math.abs(state.player[axis]-target)<.085||(key===positive?state.player[axis]>target:state.player[axis]<target))break;}
     await page.keyboard.up(key);
     // Input delivery can overshoot a tile center on a busy desktop. Correct with
     // short real key taps instead of changing game state or treating it as a game fault.
     state=await snap();
     for(let correction=0;correction<5&&!state.won&&Math.abs(state.player[axis]-target)>.16;correction++){
       if(state.paused&&state.modal==='pause')await page.locator('#modal-actions button').first().click();
       const fix=state.player[axis]<target?positive:negative;
       await page.keyboard.down(fix);await page.waitForTimeout(Math.min(65,Math.abs(state.player[axis]-target)/3.2*700));await page.keyboard.up(fix);await page.waitForTimeout(20);state=await snap();
     }
     if(!state.won)assert.ok(Math.abs(state.player[axis]-target)<.18,`could not reach ${axis}=${target}: ${JSON.stringify(state)}`);
   }
 }
 async function recordA(startX){await page.keyboard.press('r');await stepTo(3,9);await stepTo(3,3);await page.keyboard.press('r');const s=await snap();assert.equal(s.mode,'playback');assert.ok(Math.abs(s.player.x-startX)<.001);}
 try{
  if(!process.env.WWM_CDP)await page.goto(process.env.TEST_URL||'http://localhost:5183');
  else await page.waitForURL('**/index.html');
  restoreNative();
  await page.waitForFunction(()=>window.WWMDebug);
  const wantedLanguage=process.env.WWM_LANGUAGE||'en';
  if((await snap()).language!==wantedLanguage)await page.locator('#language').click();
  await page.screenshot({path:path.join(dir,'01-title.png'),fullPage:true});
  await page.locator('#begin').click();await recordA(4);
  await page.waitForFunction(()=>WWMDebug.snapshot().echo?.finished);
  assert.equal((await snap()).plates[0].active,true);
  await page.screenshot({path:path.join(dir,'02-first-echo.png'),fullPage:true});
  await stepTo(4,8);await stepTo(16,8);await stepTo(16,6);await stepTo(18,6);
  assert.equal((await snap()).won,true);assert.equal((await snap()).modal,'win');
  console.log('PASS room 1: actual R + arrow input; echo holds A, bridge crossed, exit reached');
  await page.screenshot({path:path.join(dir,'03-first-complete.png'),fullPage:true});
  if(process.env.WWM_FIRST_ONLY==='1'){assert.deepEqual(errors,[]);return;}
  await page.locator('#modal-actions button').first().click();assert.equal((await snap()).index,1);
  await recordA(4);await page.waitForFunction(()=>WWMDebug.snapshot().echo?.finished);
  await stepTo(4,8);await stepTo(10,8);
  assert.ok((await snap()).plates.every(p=>p.active));
  await stepTo(16,8);await stepTo(16,6);await stepTo(18,6);
  assert.equal((await snap()).won,true);console.log('PASS room 2: two separate plates held; generous afterglow crossing');
  await page.locator('#modal-actions button').first().click();
  for(const room of [2,3]){
    assert.equal((await snap()).index,room);await page.keyboard.press('r');
    await stepTo(3,9);await stepTo(3,3);await page.waitForTimeout(3000);await stepTo(3,9);if(room===3)await stepTo(6,9);
    await page.keyboard.press('r');assert.equal((await snap()).mode,'playback');
    await stepTo(5,5);await stepTo(12,5);await stepTo(12,8);
    if(room===3){await stepTo(14,8);await page.waitForFunction(()=>WWMDebug.snapshot().plates.find(p=>p.id==='B').active);assert.ok((await snap()).bridges[1].open);}
    await page.screenshot({path:path.join(dir,`0${room+2}-room-${room+1}.png`),fullPage:true});
    await stepTo(20,8);assert.equal((await snap()).won,true);
    console.log(`PASS room ${room+1}: recorded A → wait 3s → B; actual timed crossings and exit`);
    await page.locator('#modal-actions button').first().click();
  }
  assert.equal((await snap()).screen,'ending');await page.waitForTimeout(4000);
  await page.screenshot({path:path.join(dir,'06-ending.png'),fullPage:true});
  console.log('PASS title → all 4 rooms → ending, without state injection');
  if(process.env.WWM_DEMO_ONLY==='1'){assert.deepEqual(errors,[]);return;}
  await page.locator('#again').click();await page.keyboard.press('r');
  await page.waitForTimeout(12300);assert.equal((await snap()).mode,'playback');assert.ok(Math.abs((await snap()).echo.duration-12)<.001);
  console.log('PASS automatic 12-second recording cutoff');
  await page.keyboard.press('Escape');const frozen=await snap();await page.waitForTimeout(500);
  assert.equal((await snap()).time,frozen.time);await page.locator('#modal-actions button').first().click();
  await page.waitForTimeout(200);assert.ok((await snap()).time>frozen.time);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal((await snap()).paused,true);
  const away=await snap();await page.waitForTimeout(450);assert.equal((await snap()).time,away.time);
  await page.locator('#modal-actions button').first().click();
  console.log('PASS Esc and window-blur pause freeze replay time; resume continues');
  await page.keyboard.press('t');let clean=await snap();assert.equal(clean.echo,null);assert.equal(clean.samples,0);assert.equal(clean.time,0);assert.ok(clean.plates.every(p=>!p.active));assert.ok(clean.bridges.every(b=>!b.open));
  for(let i=0;i<4;i++){await page.keyboard.press('r');await page.waitForTimeout(120);await page.keyboard.press('r');assert.equal((await snap()).mode,'playback');}
  await page.keyboard.press('r');assert.equal((await snap()).echo,null);await page.keyboard.press('t');
  console.log('PASS early finish, repeated re-recording, and clean reset');
  // WASD uses the same physical input path, tested separately from arrow-key solutions.
  let before=(await snap()).player.x;await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');assert.ok((await snap()).player.x>before+.4);
  await page.keyboard.press('t');await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');await page.locator('#sound').click();
  if(!process.env.WWM_CDP){
    await page.setViewportSize({width:960,height:720});await page.keyboard.down('a');await page.waitForTimeout(180);await page.keyboard.up('a');
    assert.ok((await snap()).player.x<4);await page.screenshot({path:path.join(dir,'07-desktop-small.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.keyboard.press('t');
    const button=page.locator('[data-dir="right"]');const b=await button.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(250);await page.mouse.up();assert.ok((await snap()).player.x>4.4);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(dir,'08-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
  }
  console.log('PASS WASD, sound mute, resize, and touch-control pointer input (browser only for resize)');
  assert.deepEqual(errors,[]);
 }finally{if(!process.env.WWM_CDP)await context.close();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
