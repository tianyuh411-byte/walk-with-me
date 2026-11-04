const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Game, STEP } = require('../js/engine.js');
const levels = require('../js/levels.js');
function walk(g, key, tiles) { for (let i=0; i<Math.round(tiles/3.2/STEP); i++) g.tick(STEP, { [key]: true }); }
test('first room: record, reset, echo holds plate, player crosses and exits', () => {
  const g = new Game(levels[0]); g.record(); walk(g,'left',1); walk(g,'up',6); g.record();
  assert.deepEqual(g.player, levels[0].start); assert.equal(g.mode,'playback');
  walk(g,'up',1); walk(g,'right',12); walk(g,'up',2); walk(g,'right',2);
  assert.equal(g.won,true); assert.ok(g.echo.finished); assert.ok(g.plates[0].active);
});
test('12 second cap, held endpoint and reset without leftovers', () => {
  const g = new Game(levels[0]); g.record();
  for(let i=0;i<720;i++) g.tick(STEP);
  assert.equal(g.mode,'playback'); assert.ok(Math.abs(g.echo.duration-12)<1e-6);
  for(let i=0;i<750;i++) g.tick(STEP);
  assert.equal(g.echo.finished,true); assert.deepEqual({x:g.echo.x,y:g.echo.y},levels[0].start);
  g.record(); assert.equal(g.echo,null); assert.equal(g.time,0);
  g.reset(); assert.equal(g.samples.length,0); assert.equal(g.plates.some(p=>p.active),false);
  assert.equal(g.bridges.some(b=>b.open),false);
});
test('paused time and echo do not advance', () => {
  const g = new Game(levels[0]); g.record(); walk(g,'left',1); g.finish();
  g.paused=true; for(let i=0;i<300;i++) g.tick(STEP,{up:true});
  assert.equal(g.time,0); assert.equal(g.echo.x,levels[0].start.x);
});
function idle(g,seconds){for(let i=0;i<seconds/STEP;i++)g.tick(STEP);}
test('both actors participate in pressure handoff without a one-frame bridge closure',()=>{
 const g=new Game(levels[0]);g.player={x:3,y:3};g.echo={x:3,y:3,duration:0,cursor:0,finished:true};g.samples=[{t:0,x:3,y:3}];g.mode='playback';g.updateBridges(0);
 assert.equal(g.bridges[0].held,true);g.player={x:5,y:5};g.tick(STEP);assert.equal(g.bridges[0].held,true);
 g.player={x:3,y:3};g.echo=null;g.tick(STEP);assert.equal(g.bridges[0].held,true);
 g.player={x:5,y:5};g.tick(STEP);assert.equal(g.bridges[0].held,false);assert.equal(g.bridges[0].open,true);
 idle(g,2.5);assert.equal(g.bridges[0].open,false);
});
test('closing bridge beneath player resets the whole attempt',()=>{
 const g=new Game(levels[0]);g.player={x:12,y:8};g.mode='playback';g.bridges[0].remaining=.005;g.bridges[0].open=true;g.tick(STEP);
 assert.deepEqual(g.player,levels[0].start);assert.equal(g.mode,'ready');assert.equal(g.echo,null);assert.equal(g.time,0);
 assert.ok(g.drain().some(e=>e.data==='bridge-faded'));
});
test('echo endpoint holds forever, passes through closed bridges, and cannot finish room',()=>{
 const g=new Game(levels[0]);g.mode='playback';g.samples=[{t:0,x:10,y:8},{t:1,x:18,y:6}];g.echo={x:10,y:8,duration:1,cursor:0,finished:false};
 idle(g,2);assert.equal(g.echo.x,18);assert.equal(g.echo.y,6);assert.equal(g.won,false);idle(g,20);assert.equal(g.echo.x,18);
});
test('all four planned solutions are feasible with >= 3-second intentional waits',()=>{
 for(let room=1;room<levels.length;room++){
  const g=new Game(levels[room]);g.record();walk(g,'left',room<2?1:2);walk(g,'up',6);
  if(room>=2){idle(g,3);walk(g,'down',6);if(room===3)walk(g,'right',3);}
  g.finish();
  if(room===1){idle(g,3);walk(g,'up',1);walk(g,'right',12);walk(g,'up',2);walk(g,'right',2);}
  else{walk(g,'up',4);walk(g,'right',8);walk(g,'down',3);if(room===3)walk(g,'right',2);idle(g,4);walk(g,'right',10);}
  assert.equal(g.won,true,`room ${room+1}`);
 }
});
