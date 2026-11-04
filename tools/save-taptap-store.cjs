const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../release/taptap');
const read=file=>JSON.parse(fs.readFileSync(path.join(base,file),'utf8').replace(/^\uFEFF/,''));
const fields={};for(const module of ['basic-info','assets-upload','developer-info','profile-promotion','platform-status'])Object.assign(fields,read(module+'.json').data.result.fields);
const media=name=>{const d=read('store/upload-'+name+'.json').data;return {url:d.url,info:d.info};};
const description=`《回声同行 / Walk With Me》是一款与“几秒前的自己”合作的微型解谜游戏。\n\n录下最长 12 秒的脚步，房间回到起点。回声按原来的时间重走路线，最后留在终点，替你踩住机关。你则跨过它点亮的桥，继续前行。\n\n四个房间，依次体验相遇、同行、等待与告别。默认英语，支持完整简体中文切换。目标首次游玩约 5—8 分钟，实际时间取决于解谜过程。\n\n操作：WASD / 方向键移动；R 开始或结束录制；T 重置本关；Esc 暂停。手机横屏使用方向按钮与录制按钮。光桥在松开机关后保留 2.4 秒，消失时若仍在桥上，本次尝试会重置。\n\n单机，无广告、内购、排行榜或联网功能。可关闭音效。\n\nAI 使用披露：本作使用 OpenAI Codex（本开发会话标识为基于 GPT-6）辅助生成代码、关卡实现、中英文文字、程序绘制画面、合成音效及构建测试工具；人工提供概念、约束和方向。未使用外部美术、采样音乐或官方主题录音。`;
const message=`你好，我们是 RainStar工作室。\n\n这是一款为 thatgamejam #02 准备的新作。我们希望让“陪伴”成为玩家亲手完成的操作：留下过去的脚步，为现在的自己开一条路。\n\nWindows x64 版与 H5 版均已完成；中英文可切换。Windows 版需要 .NET Framework 4.8 与 Microsoft Edge WebView2 Runtime。四关通过了脚本驱动的实际键盘通关测试；TapTap 官方手机自测入口已由作者反馈正常，不代表所有设备均已验证。\n\nAI 使用：OpenAI Codex 辅助代码、英文及中文文字、程序画面、图标、关卡实现和音效代码。音效为程序合成；没有使用主题录音或第三方音乐。\n\n当前主题音频尚未完成实际聆听与创作关联复核，不声称已完成听后分析。活动报名与普通游戏上架分别确认，尚未把上架成功当作参赛成功。\n\n感谢你和过去的自己一起走过这一小段路。`;
const groups={
 'store-profile':{description,icon:media('icon'),author_name:'RainStar工作室',developer_message:message},
 'store-art':{banner_4:media('banner'),square_promo_image:media('square'),screenshots:[media('shot1'),media('shot2'),media('shot3')],promotion_material_type:'BANNER_4',promotion_text:'让过去的脚步，为此刻的你点亮桥。'}
};
for(const[name,values]of Object.entries(groups)){
 const changes=Object.entries(values).map(([field_id,value])=>{if(!fields[field_id])throw Error('Missing live field: '+field_id);const f=fields[field_id];return {field_id,value,expected:f.current_value===undefined||f.current_value===null?[]:f.current_value,...(Array.isArray(value)?{op:'replace'}:{})};});
 fs.writeFileSync(path.join(base,name+'-request.json'),JSON.stringify({changes},null,2));
}
console.log('Prepared two read-before-write store batches from current field snapshots and uploaded media handles.');
