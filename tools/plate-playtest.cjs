// Actual keyboard input in the desktop game; read-only observations only.
const assert=require('node:assert/strict'),path=require('node:path');
const{chromium}=require(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','playwright'));
(async()=>{
 const b=process.env.WWM_CDP?await chromium.connectOverCDP(process.env.WWM_CDP):await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=process.env.WWM_CDP?b.contexts()[0].pages().find(p=>p.url().includes('walkwithme.local')):await b.newPage();
  if(!process.env.WWM_CDP)await p.goto(process.env.TEST_URL||'http://localhost:5183');
  const snap=()=>p.evaluate(()=>WWMDebug.snapshot());
  async function go(x,y){
   for(const[axis,target,pos,neg]of[['x',x,'ArrowRight','ArrowLeft'],['y',y,'ArrowDown','ArrowUp']]){
    let s=await snap();if(Math.abs(s.player[axis]-target)<.08)continue;
    const key=s.player[axis]<target?pos:neg;await p.keyboard.down(key);
    try{await p.waitForFunction(({axis,target,pos,key})=>{const s=WWMDebug.snapshot();return Math.abs(s.player[axis]-target)<.08||(key===pos?s.player[axis]>target:s.player[axis]<target);},{axis,target,pos,key},{timeout:8000});}finally{await p.keyboard.up(key);}
    s=await snap();
    for(let i=0;i<5&&Math.abs(s.player[axis]-target)>.16;i++){
     const fix=s.player[axis]<target?pos:neg;await p.keyboard.down(fix);await p.waitForTimeout(Math.min(65,Math.abs(s.player[axis]-target)/3.2*700));await p.keyboard.up(fix);await p.waitForTimeout(20);s=await snap();
    }
    assert.ok(Math.abs(s.player[axis]-target)<.2);
   }
  }
  async function tape(){await p.keyboard.press('r');await go(3,3);await p.waitForTimeout(4500);await go(3,9);await p.keyboard.press('r');}
  await p.reload();await p.waitForFunction(()=>window.WWMDebug);await p.click('#begin');
  await tape();await go(3,3);assert.ok((await snap()).plates[0].active);assert.ok((await snap()).bridges[0].held);
  await go(4,3);assert.ok((await snap()).bridges[0].held,'echo keeps bridge held when player leaves');
  await go(3,3);await p.waitForFunction(()=>WWMDebug.snapshot().echo.finished);
  assert.ok((await snap()).bridges[0].held,'player keeps bridge held after echo leaves');
  await go(4,3);assert.equal((await snap()).bridges[0].held,false);assert.ok((await snap()).bridges[0].open);
  await p.waitForTimeout(2600);assert.equal((await snap()).bridges[0].open,false);
  console.log('PASS actual pressure overlap/handoffs: either actor retains bridge, both absent gives 2.4-second fade and closure');
  await tape();await go(4,8);await go(12,8);assert.ok((await snap()).bridges[0].open);
  await p.waitForFunction(()=>WWMDebug.snapshot().mode==='ready',null,{timeout:12000});
  const clean=await snap();assert.equal(clean.echo,null);assert.equal(clean.samples,0);assert.equal(clean.time,0);assert.ok(clean.plates.every(p=>!p.active));assert.ok(clean.bridges.every(b=>!b.open));assert.ok(Math.abs(clean.player.x-4)<.001&&Math.abs(clean.player.y-9)<.001);
  console.log('PASS actual bridge disappearance under player: complete clean reset with feedback');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
