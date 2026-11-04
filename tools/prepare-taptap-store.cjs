const {createRequire}=require('node:module'),path=require('node:path'),fs=require('node:fs/promises'),crypto=require('node:crypto');
const rt=createRequire(path.join(process.env.WWM_NODE_MODULES||'C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules','_wwm.cjs'));
const {chromium}=rt('playwright'),sharp=rt('sharp');
(async()=>{
 const output=path.resolve(__dirname,'../release/taptap/store');await fs.mkdir(path.join(output,'screenshots'),{recursive:true});
 const icon=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#142329"/><circle cx="341" cy="218" r="103" fill="#f0ddb0" opacity=".04"/><path d="M112 236L170 294 112 352 54 294Z" fill="#322f45" stroke="#baafe2" stroke-width="9" stroke-dasharray="13 9"/><path d="M112 265V323M83 294H141" stroke="#baafe2" stroke-width="6"/><path d="M187 286L211 260M222 255L246 229M257 224L281 198" stroke="#b4c5a1" stroke-width="16"/><circle cx="342" cy="187" r="63" fill="#f0ddb0"/><circle cx="325" cy="166" r="18" fill="#fff7d9"/></svg>`;
 await fs.writeFile(path.join(output,'icon.svg'),icon);await sharp(Buffer.from(icon)).png().toFile(path.join(output,'icon.png'));
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await b.newPage();await page.goto('file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/'));await page.waitForFunction(()=>window.WWMRenderer);
 const art=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1560;c.height=1440;const context=c.getContext('2d');context.scale(2,2);const original=document.createElement('canvas');original.width=780;original.height=720;original.getContext('2d').fillText=()=>{};new WWMRenderer(original).cover(0);context.drawImage(original,0,0);return c.toDataURL().split(',')[1];});
 const image=Buffer.from(art,'base64');
 for(const format of [{name:'banner',w:1920,h:1080},{name:'square-promo',w:1440,h:1440}]){
  const c=await b.newPage({viewport:{width:format.w,height:format.h},deviceScaleFactor:1});
  const square=format.w===format.h;
  await c.setContent(`<html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:${format.w}px;height:${format.h}px;background:#111e23;color:#f0e8d0;font-family:'Microsoft YaHei',sans-serif;overflow:hidden}.title{position:absolute;left:${square?120:130}px;top:${square?96:300}px;font-size:${square?125:138}px;letter-spacing:12px;font-weight:300}.en{position:absolute;left:${square?128:140}px;top:${square?265:490}px;font-family:Georgia,serif;font-size:${square?36:38}px;letter-spacing:10px;color:#b7c9bb}.line{position:absolute;left:${square?128:142}px;top:${square?355:610}px;font-size:28px;color:#bdcfbf;letter-spacing:3px}.art{position:absolute;width:${square?1260:1120}px;height:${square?1164:1034}px;left:${square?90:830}px;top:${square?340:35}px}.tag{position:absolute;left:${square?128:142}px;bottom:${square?65:110}px;font-size:18px;letter-spacing:4px;color:#9ab1a7}</style></head><body><img class="art" src="data:image/png;base64,${image.toString('base64')}"><div class="title">回声同行</div><div class="en">WALK WITH ME</div><div class="line">让过去的脚步，点亮前路。</div><div class="tag">录制 · 回放 · 与过去的自己同行</div></body></html>`);
  // TapTap's actual preaudit requires promotion images to contain only the title/logo.
  await c.locator('.line,.tag').evaluateAll(es=>es.forEach(e=>e.remove()));
  await c.screenshot({path:path.join(output,format.name+'.png')});await c.close();
 }
 const captures=[];for(const [source,name]of [['02-first-echo.png','game-1.png'],['04-room-3.png','game-2.png'],['05-room-4.png','game-3.png']]){
  const input=path.resolve(__dirname,'../artifacts',source),target=path.join(output,'screenshots',name);await fs.copyFile(input,target);const metadata=await sharp(target).metadata();captures.push({file:name,width:metadata.width,height:metadata.height,sha256:crypto.createHash('sha256').update(await fs.readFile(target)).digest('hex'),source:'actual browser gameplay through keyboard; Chinese UI; no state injection; not a physical mobile capture'});
 }
 await fs.writeFile(path.join(output,'sources.json'),JSON.stringify({icon:'original SVG shapes, square background, no rounded outer corners',promos:'original native Canvas/HTML composition using this game’s renderer; title only after actual TapTap preaudit feedback; not a gameplay screenshot',screenshots:captures,gameplayVideo:'6056250; actual continuous keyboard-driven browser walkthrough, about60s, silent, unaccelerated; physical phone test separately reported by entrant'},null,2));
 console.log('Prepared 512×512 icon, 1920×1080 banner, 1440×1440 square, and 3 actual 1440×1059 gameplay screenshots.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
