const {createRequire}=require('node:module'),path=require('node:path'),fs=require('node:fs/promises');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
(async()=>{
 const b=await rt('playwright').chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage();await p.goto('file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.WWMRenderer);
  const data=await p.evaluate(()=>{
   const c=document.createElement('canvas');c.width=630;c.height=500;const ctx=c.getContext('2d');ctx.fillStyle='#111e23';ctx.fillRect(0,0,630,500);
   const art=document.createElement('canvas');art.width=780;art.height=720;new WWMRenderer(art).cover(0);ctx.drawImage(art,85,72,500,460);
   ctx.fillStyle='#b4d9c7';ctx.font='9px Arial';ctx.fillText('A SMALL PUZZLE ABOUT COMPANY',40,37);
   ctx.fillStyle='#f1e8d1';ctx.font='52px Georgia';ctx.fillText('Walk With Me',38,96);
   ctx.fillStyle='#a8c2b8';ctx.font='italic 15px Georgia';ctx.fillText('A past step. A new possibility.',42,128);
   ctx.fillStyle='#f0ddb0';ctx.font='9px Arial';ctx.fillText('RECORD. REWIND. WALK TOGETHER.',40,467);
   ctx.fillStyle='#8fa8a2';ctx.textAlign='right';ctx.fillText('FOUR QUIET ROOMS',590,467);
   return c.toDataURL('image/png').split(',')[1];
  });
  const media=path.resolve(__dirname,'../release/media');await fs.mkdir(media,{recursive:true});await fs.writeFile(path.join(media,'cover.png'),Buffer.from(data,'base64'));
  for(const [source,dest]of [['02-first-echo.png','room-1.png'],['04-room-3.png','room-3.png'],['05-room-4.png','room-4.png']])await fs.copyFile(path.resolve(__dirname,'../artifacts',source),path.join(media,dest));
  console.log('Created cover.png (630×500) and 3 actual gameplay screenshots.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
