// Uses the official visible questionnaire. Private member facts are excluded from release archives.
const fs=require('node:fs/promises'),path=require('node:path');
const{chromium}=require('C:/Users/34813/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const data=JSON.parse(await fs.readFile(path.resolve(__dirname,'../.local-browser/jam-entry.json'),'utf8'));
 const b=await chromium.connectOverCDP('http://127.0.0.1:9338');
 try{
  const p=b.contexts()[0].pages().find(p=>p.url().includes('/activity-center/18/post-form'));
  if(!p)throw new Error('Official questionnaire is not open');
  async function text(label,value){const item=p.locator('.ant-form-item').filter({has:p.locator('label').filter({hasText:label})});if(await item.count()!==1)throw new Error('Ambiguous label: '+label);await item.locator('textarea,input[placeholder="请输入"]').fill(value);}
  await text('游戏说明：启动步骤、操作方式、玩法概述',data.instructions);
  await text('团队成员 1 的姓名和邮箱（必填），其余成员最多到 5 人，填写姓名、邮箱和 Discord ID',data.member);
  await text('是否使用了 AI 生成内容',data.ai);
  await text('国家/地区',data.country);
  if(data.video)await text('游戏演示视频链接（完整流程走一遍）',data.video);
  if(data.links)await text('预告片或其他视频素材、设计文档或 pitch deck 链接',data.links);
  for(const [n,value] of ['学生','是','是，专门为 thatgamejam#2 制作'].entries()){
   const control=p.getByRole('combobox').nth(n).locator('xpath=ancestor::div[contains(@class,"ant-select-single")][1]');
   if((await control.innerText()).trim()===value)continue;
   await control.click();
   await p.locator('.ant-select-dropdown:visible .ant-select-item-option-content').getByText(value,{exact:true}).click();
  }
  await p.getByRole('button',{name:'保存草稿',exact:true}).click();
  await p.waitForTimeout(1200);
  console.log((await p.locator('body').innerText()).replaceAll(data.member,'[member redacted]').slice(-10000));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
