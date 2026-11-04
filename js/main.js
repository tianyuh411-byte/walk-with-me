(function () {
  'use strict';
  const $=id=>document.getElementById(id),{Game,STEP,LIMIT}=WWMEngine;
  let language='en';try{const savedLanguage=localStorage.getItem('walk-with-me.language');if(Object.hasOwn(WWMText,savedLanguage))language=savedLanguage;}catch{}
  let text=WWMText[language];
  const sound=new WWMSound(), renderer=new WWMRenderer($('stage')),cover=new WWMRenderer($('cover')),ending=new WWMRenderer($('ending-art'));
  let screen='home',index=0,game=new Game(WWMLevels[0]),keys={},last=0,accumulator=0,notice='',noticeUntil=0,modalKind='',endTime=0,lastSteps=[],hintStage=0;
  let save=null;try{save=JSON.parse(localStorage.getItem('walk-with-me.v1'));if(!save||!Number.isInteger(save.room)||save.room<0||save.room>=WWMLevels.length)save=null;}catch{}
  if(save&&!save.complete)$('continue').classList.remove('hidden');
  const setHint=(message,seconds=5)=>{notice=message;noticeUntil=performance.now()+seconds*1000;};
  function updateRoomHeading(){
    $('chapter').textContent=language==='zh'?`第 ${String(index+1).padStart(2,'0')} 关 / 共 ${String(WWMLevels.length).padStart(2,'0')} 关`:`${text.room} ${String(index+1).padStart(2,'0')} / ${String(WWMLevels.length).padStart(2,'0')}`;
    $('room-title').textContent=game.level.name;$('room-subtitle').textContent=game.level.subtitle;
  }
  function applyLanguage(){
    text=WWMText[language];window.WWMLanguage=language;
    document.documentElement.lang=text.htmlLang;document.title=text.title;document.querySelector('meta[name="description"]').content=text.metaDescription;
    Object.entries(text.staticHTML).forEach(([selector,html])=>{document.querySelector(selector).innerHTML=html;});
    Object.entries(text.aria).forEach(([selector,label])=>{document.querySelector(selector).setAttribute('aria-label',label);});
    WWMLevels.forEach((level,i)=>Object.assign(level,text.rooms[i]));
    $('language').textContent=text.languageLabel;$('language').setAttribute('aria-label',text.languageAria);
    $('sound').firstChild.textContent=(sound.enabled?text.soundOn:text.soundOff)+' ';$('sound').setAttribute('aria-label',sound.enabled?text.muteSound:text.enableSound);
    noticeUntil=0;updateRoomHeading();updateUI();
  }
  function store(complete=false){save={room:index,complete};try{localStorage.setItem('walk-with-me.v1',JSON.stringify(save));}catch{}}
  function clearInput(){keys={};accumulator=0;last=0;}
  function showScreen(next){screen=next;['home','play','ending'].forEach(s=>$(s).classList.toggle('hidden',s!==next));clearInput();}
  function loadRoom(i){index=i;game=new Game(WWMLevels[i]);hintStage=0;notice='';showScreen('play');updateRoomHeading();$('progress').innerHTML=WWMLevels.map((_,j)=>`<span class="${j===i?'current':j<i?'done':''}"></span>`).join('');store();updateUI();$('record').focus({preventScroll:true});}
  function closeModal(){if($('modal').open)$('modal').close();modalKind='';game.paused=false;clearInput();sound.resume();}
  function modal(kind,title,tag,copy,actions){
    if($('modal').open)$('modal').close();game.paused=true;clearInput();sound.pause();modalKind=kind;
    $('modal-title').textContent=title;$('modal-tag').textContent=tag;$('modal-copy').innerHTML=copy;$('modal-actions').replaceChildren();
    actions.forEach(([label,action])=>{const b=document.createElement('button');b.textContent=label;b.addEventListener('click',action);$('modal-actions').append(b);});$('modal').showModal();
  }
  function pause(auto=false){if(screen!=='play'||game.won||$('modal').open)return;modal('pause',text.pauseTitle,text.pauseTag,auto?text.autoPause:text.pauseCopy,[[text.resume,closeModal],[text.restart,()=>{closeModal();reset();}],[text.home,()=>{closeModal();showScreen('home');if(save&&!save.complete)$('continue').classList.remove('hidden');}]]);}
  function help(){
    const actions=[[text.close,closeModal]];
    if(screen==='play')actions.push([hintStage?text.solution:text.hint,()=>{hintStage++;$('modal-copy').innerHTML=`<p>${hintStage===1?game.level.hint:game.level.solution}</p>`;$('modal-actions').lastElementChild.textContent=text.solution;}]);
    modal('help',text.helpTitle,text.helpTag,text.helpCopy,actions);
  }
  function reset(){if(screen!=='play')return;game.reset();clearInput();setHint(text.reset);updateUI();}
  function record(){if(screen!=='play'||game.paused||game.won)return;game.record();clearInput();notice='';events();updateUI();}
  function win(){
    store(index===WWMLevels.length-1);
    modal('win',text.winTitle,text.winTag,text.winCopy,[[index===WWMLevels.length-1?text.lastNext:text.next,()=>{
      const final=index===WWMLevels.length-1;lastSteps=game.samples.map(p=>({...p}));closeModal();
      if(final){endTime=performance.now();showScreen('ending');$('continue').classList.add('hidden');}
      else loadRoom(index+1);
    }],[text.restart,()=>{closeModal();reset();}]]);
  }
  function events(){for(const event of game.drain()){sound.event(event.type);if(event.type==='reset'&&event.data==='bridge-faded')setHint(text.fell,9);if(event.type==='win')win();}}
  function updateUI(){
    if(screen!=='play')return;
    $('status').textContent=text[game.mode];$('status-led').className='status-led '+game.mode;
    $('status-detail').textContent=game.mode==='ready'?text.readyDetail:game.mode==='recording'?text.recordingDetail:game.echo?.finished?text.heldDetail:text.playbackDetail;
    $('record-label').textContent=game.mode==='recording'?text.finish:game.mode==='playback'?text.rerecord:text.record;
    $('record').querySelector('.record-mark').textContent=game.mode==='recording'?'■':'●';
    const duration=game.mode==='recording'?game.time:game.echo?game.echo.duration:0;
    const ratio=game.mode==='playback'?Math.min(game.time,game.echo.duration)/LIMIT:duration/LIMIT;
    $('tape-fill').style.width=`${(duration/LIMIT)*100}%`;$('tape-head').style.left=`${ratio*100}%`;
    $('timer').textContent=game.mode==='recording'?(Math.max(0,LIMIT-game.time).toFixed(1)+'s'):game.mode==='playback'?(Math.min(game.time,game.echo.duration).toFixed(1)+' / '+game.echo.duration.toFixed(1)+'s'):'12.0s';
    $('tape-label').textContent=game.mode==='recording'?text.tapeRecording:game.mode==='playback'?(game.echo.finished?text.tapeHeld:text.tapePlayback):text.tapeReady;
    const fading=game.bridges.some(b=>b.open&&!b.held);
    let hint=game.mode==='ready'?text.readyHint:game.mode==='recording'?(index===0?text.recordingHint:game.level.hint):text.playbackHint;
    if(index===0&&game.mode==='playback'&&game.plates[0].active)hint=text.plateHeld;
    if(fading)hint=text.fading;
    if(performance.now()<noticeUntil)hint=notice;
    $('context-hint').textContent=hint;
    $('stage-note').textContent=index===0?(game.mode==='ready'?text.firstReady:game.mode==='recording'?text.firstRecording:text.firstPlayback):game.level.hint;
  }
  const directions={w:'up',ArrowUp:'up',s:'down',ArrowDown:'down',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};
  window.addEventListener('keydown',e=>{
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)&&screen==='play')e.preventDefault();
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(directions[k]&&!game.paused&&screen==='play')keys[directions[k]]=true;
    if(e.repeat)return;
    if(k==='Escape'){e.preventDefault();if($('modal').open&&modalKind!=='win')closeModal();else pause();}
    if(k==='r')record();if(k==='t'&&screen==='play'&&!game.paused)reset();
  });
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(directions[k])delete keys[directions[k]];});
  window.addEventListener('blur',()=>{clearInput();pause(true);});
  document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden)pause(true);});
  $('modal').addEventListener('cancel',e=>{e.preventDefault();if(modalKind!=='win')closeModal();});
  $('begin').addEventListener('click',()=>loadRoom(0));$('continue').addEventListener('click',()=>loadRoom(save?.room||index));
  $('again').addEventListener('click',()=>loadRoom(0));$('record').addEventListener('click',record);$('retry').addEventListener('click',reset);$('pause').addEventListener('click',()=>pause());$('help').addEventListener('click',help);
  $('language').addEventListener('click',()=>{language=language==='en'?'zh':'en';try{localStorage.setItem('walk-with-me.language',language);}catch{}applyLanguage();});
  $('home-link').addEventListener('click',e=>{e.preventDefault();if(screen==='play')pause();else showScreen('home');});
  $('sound').addEventListener('click',()=>{const on=sound.toggle();$('sound').firstChild.textContent=(on?text.soundOn:text.soundOff)+' ';$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?text.muteSound:text.enableSound);if(on)sound.note(440,.2,.035);});
  document.querySelectorAll('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(!game.paused){keys[b.dataset.dir]=true;b.setPointerCapture(e.pointerId);}});const release=()=>delete keys[b.dataset.dir];b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);});
  function frame(now){
    if(last===0)last=now;const dt=Math.min(.1,(now-last)/1000);last=now;
    if(screen==='play'){
      if(!game.paused){accumulator+=dt;while(accumulator>=STEP&&!game.paused){game.tick(STEP,keys);accumulator-=STEP;events();}}
      renderer.draw(game,now/1000);updateUI();
    }else if(screen==='home')cover.cover(now/1000);
    else ending.ending(lastSteps,(now-endTime)/1000);
    requestAnimationFrame(frame);
  }
  applyLanguage();requestAnimationFrame(frame);
  // Read-only diagnostics; tests operate the game through real keyboard / pointer events.
  Object.defineProperty(window,'WWMDebug',{value:{snapshot:()=>({screen,index,language,mode:game.mode,time:game.time,paused:game.paused,won:game.won,player:{...game.player},echo:game.echo?{...game.echo}:null,plates:game.plates.map(p=>({...p})),bridges:game.bridges.map(b=>({...b})),samples:game.samples.length,modal:modalKind})},writable:false});
})();
