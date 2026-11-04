(function () {
  const TAU=Math.PI*2;
  const noise=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};
  function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill();}
  function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  function actor(c,x,y,echo=false,scale=1,alpha=1){
    c.save();c.globalAlpha=alpha;glow(c,x,y,40*scale,echo?'#b5a0e62a':'#ffe6a52b');
    c.strokeStyle=echo?'#c6b6eb':'#efe6c6';c.lineWidth=1.5*scale;c.beginPath();
    if(echo){c.setLineDash([3*scale,3*scale]);c.arc(x,y,12*scale,0,TAU);c.stroke();c.setLineDash([]);circle(c,x,y,6*scale,'#b8a5da99');c.beginPath();c.moveTo(x-4*scale,y);c.lineTo(x+4*scale,y);c.moveTo(x,y-4*scale);c.lineTo(x,y+4*scale);c.stroke();}
    else{circle(c,x,y+2*scale,11*scale,'#0004');circle(c,x,y,10*scale,'#f4e7be');circle(c,x-2.5*scale,y-3*scale,3*scale,'#fff8df');c.beginPath();c.arc(x,y,15*scale,-.8,.8);c.strokeStyle='#eedfb366';c.stroke();}
    c.restore();
  }
  class Renderer{
    constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
    background(t){
      const c=this.c,w=this.canvas.width,h=this.canvas.height;c.fillStyle='#111e23';c.fillRect(0,0,w,h);
      const g=c.createRadialGradient(w*.5,h*.42,0,w*.5,h*.5,w*.65);g.addColorStop(0,'#233d3b66');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<90;i++){const x=noise(i*7)*w,y=noise(i*7+1)*h;circle(c,x,y,.5+noise(i*7+2),`rgba(173,208,186,${.035+noise(i*7+3)*.12})`);}
      c.strokeStyle='#799c8910';c.lineWidth=1;for(let i=0;i<4;i++){c.beginPath();c.ellipse(w*.5,h*.52,w*(.23+i*.12),h*(.19+i*.1),-.15,0,TAU);c.stroke();}
    }
    draw(g,t){
      const c=this.c,S=48;this.background(t);
      // Floating stone islands; the per-tile edges also make walkable areas legible.
      for(const r of g.level.floors){
        const x=(r[0]-.5)*S,y=(r[1]-.5)*S,w=(r[2]-r[0]+1)*S,h=(r[3]-r[1]+1)*S;
        c.fillStyle='#080f1455';c.fillRect(x-4,y+11,w+8,h+7);
        c.fillStyle='#1e3337';c.fillRect(x,y,w,h);c.strokeStyle='#4a69614f';c.strokeRect(x+.5,y+.5,w-1,h-1);
        c.fillStyle='#344e4777';c.fillRect(x+2,y+1,w-4,2);
        for(let yy=r[1];yy<=r[3];yy++)for(let xx=r[0];xx<=r[2];xx++){
          const n=noise(xx*17+yy*23);c.fillStyle=`rgba(143,169,147,${n*.026})`;c.fillRect((xx-.5)*S+2,(yy-.5)*S+2,S-4,S-4);
          c.strokeStyle='#a6cbb009';c.lineWidth=.5;c.strokeRect((xx-.5)*S+1,(yy-.5)*S+1,S-2,S-2);
          if(n>.64){c.strokeStyle='#8bac8733';c.beginPath();c.moveTo(xx*S+13,yy*S+9);c.lineTo(xx*S+10,yy*S+4);c.moveTo(xx*S+13,yy*S+9);c.lineTo(xx*S+15,yy*S+3);c.stroke();}
        }
        // Sparse edge lights.
        for(let i=0;i<Math.floor(w/65);i++){const lx=x+20+i*65;circle(c,lx,y+4,1,'#a1bfa466');}
      }
      for(const b of g.bridges){
        for(const [x,y] of b.tiles){
          const xx=x*S,yy=y*S; c.save();
          if(b.open){
            const pulse=(!b.held&&!this.reduced)?(.72+.28*Math.sin(t*16)):1;c.globalAlpha=pulse;
            glow(c,xx,yy,50,b.held?'#c9c69d18':'#ecb78226');c.fillStyle=b.held?'#73877a':'#967e59';c.fillRect(xx-24,yy-20,48,40);
            c.strokeStyle=b.held?'#d0d6ac':'#f0cca0';c.lineWidth=1;c.strokeRect(xx-24,yy-20,48,40);
            c.strokeStyle='#e9e7be55';c.beginPath();for(let j=-16;j<=20;j+=9){c.moveTo(xx+j-10,yy+15);c.lineTo(xx+j+9,yy-15);}c.stroke();
          }else{c.strokeStyle='#9da68b35';c.lineWidth=1;c.setLineDash([3,6]);c.strokeRect(xx-22,yy-18,44,36);c.setLineDash([]);circle(c,xx,yy,1.5,'#a9bb9833');}
          c.restore();
        }
        const mid=b.tiles[Math.floor(b.tiles.length/2)];c.font='10px Arial';c.textAlign='center';c.fillStyle=b.open?'#d6d2aa':'#7e9891';c.fillText(b.requires.join(' + '),mid[0]*S-24,mid[1]*S-35);
        if(b.open&&!b.held){c.fillStyle='#e8c89c';c.fillText(b.remaining.toFixed(1)+'s',mid[0]*S-24,mid[1]*S+37);}
      }
      // Recorded footsteps: quietly persistent, with a dashed route distinct from terrain.
      if(g.samples.length>1){
        c.save();c.strokeStyle=g.mode==='recording'?'#ebc8a660':'#b9a7dc42';c.lineWidth=2;c.setLineDash([2,10]);c.lineCap='round';c.beginPath();
        g.samples.forEach((p,i)=>{if(i%5===0||i===g.samples.length-1){if(i===0)c.moveTo(p.x*S,p.y*S);else c.lineTo(p.x*S,p.y*S);}});c.stroke();c.restore();
      }
      for(const p of g.plates){
        const x=p.x*S,y=p.y*S;c.save();if(p.active)glow(c,x,y,65,'#dacd8d35');c.translate(x,y);c.rotate(Math.PI/4);c.strokeStyle=p.active?'#f4e6b0':'#b5b58d';c.lineWidth=1.5;c.fillStyle=p.active?'#a4985e':'#3e4f46';c.fillRect(-13,-13,26,26);c.strokeRect(-13,-13,26,26);c.strokeStyle=p.active?'#f0e7b744':'#a1ad7b44';c.strokeRect(-18,-18,36,36);c.restore();
        c.fillStyle=p.active?'#fff1bf':'#c0c7ac';c.font='11px Arial';c.textAlign='center';c.fillText(p.id,x,y-31);
        if(p.active){c.strokeStyle='#f7e9b8';c.lineWidth=1.8;c.beginPath();c.moveTo(x-5,y);c.lineTo(x-1,y+4);c.lineTo(x+6,y-5);c.stroke();}
      }
      const ex=g.level.exit.x*S,ey=g.level.exit.y*S;
      glow(c,ex,ey,60,'#cce8b717');c.strokeStyle='#b4d6ad66';c.lineWidth=1;c.beginPath();c.ellipse(ex,ey+13,19,7,0,0,TAU);c.stroke();
      c.beginPath();c.moveTo(ex-13,ey+10);c.lineTo(ex-13,ey-13);c.arc(ex,ey-13,13,Math.PI,0);c.lineTo(ex+13,ey+10);c.strokeStyle='#d0e8c4';c.lineWidth=2;c.stroke();c.strokeStyle='#c9e8b92a';c.lineWidth=6;c.stroke();
      c.font='9px Arial';c.textAlign='center';c.fillStyle='#a6c8ab';c.fillText(WWMText[window.WWMLanguage||'en'].exit,ex,ey+35);
      // Fixed starting point.
      c.strokeStyle='#a8c9b233';c.beginPath();c.arc(g.level.start.x*S,g.level.start.y*S,15,0,TAU);c.stroke();
      if(g.echo)actor(c,g.echo.x*S,g.echo.y*S,true);
      actor(c,g.player.x*S,g.player.y*S,false);
      if(g.mode==='recording'){c.strokeStyle='#edb69f99';c.setLineDash([3,4]);c.beginPath();c.arc(g.player.x*S,g.player.y*S,20,0,TAU);c.stroke();c.setLineDash([]);}
      c.textAlign='left';
    }
    cover(t){
      const c=this.c;this.background(t);c.save();c.translate(387,350);c.rotate(-.48);c.scale(1,.75);
      const island=(x,y,w,h)=>{c.fillStyle='#0a141a66';c.fillRect(x-4,y+20,w+8,h);c.fillStyle='#2c4546';c.fillRect(x,y,w,h);c.strokeStyle='#a8c3a33b';c.strokeRect(x,y,w,h);c.fillStyle='#63817355';c.fillRect(x,y,w,3);c.strokeStyle='#a0c3ac0b';for(let i=x+32;i<x+w;i+=32){c.beginPath();c.moveTo(i,y);c.lineTo(i,y+h);c.stroke();}for(let i=y+32;i<y+h;i+=32){c.beginPath();c.moveTo(x,i);c.lineTo(x+w,i);c.stroke();}};
      island(-235,15,175,160);island(54,-175,190,174);
      for(let i=0;i<5;i++){const x=-59+i*23,y=6-i*23;glow(c,x+10,y,42,'#f0dbaa0d');c.fillStyle='#8b9981';c.fillRect(x,y-16,23,38);c.strokeStyle='#d4d4aa77';c.strokeRect(x,y-16,23,38);c.strokeStyle='#e9e7be55';c.beginPath();c.moveTo(x+3,y+14);c.lineTo(x+20,y-12);c.stroke();}
      c.setLineDash([2,10]);c.lineWidth=2;c.lineCap='round';c.strokeStyle='#c8b6e375';c.beginPath();c.moveTo(-210,140);c.bezierCurveTo(-140,140,-110,100,-135,65);c.stroke();c.setLineDash([]);
      c.save();c.translate(-135,65);c.rotate(Math.PI/4);c.strokeStyle='#dddaa4';c.fillStyle='#8f8f5d';c.fillRect(-17,-17,34,34);c.strokeRect(-17,-17,34,34);c.restore();
      c.strokeStyle='#cce1b975';c.beginPath();c.ellipse(195,-120,14,6,0,0,TAU);c.stroke();c.beginPath();c.moveTo(184,-123);c.lineTo(184,-150);c.arc(195,-150,11,Math.PI,0);c.lineTo(206,-123);c.stroke();
      for(let i=0;i<20;i++){const x=-230+noise(i*5)*460,y=-170+noise(i*5+2)*340;circle(c,x,y,1,'#deebac66');}
      // Undo vertical squashing for the two characters.
      c.save();c.translate(-135,65);c.scale(1,1/.75);actor(c,0,0,true,1.3);c.restore();c.save();c.translate(115,-86);c.scale(1,1/.75);actor(c,0,0,false,1.3);c.restore();c.restore();
      c.font='11px Georgia';c.fillStyle='#a4b9aa88';c.textAlign='center';c.fillText(WWMText[window.WWMLanguage||'en'].remembered,245,600);c.textAlign='left';
    }
    ending(samples,t){
      const c=this.c,w=this.canvas.width,h=this.canvas.height;c.clearRect(0,0,w,h);
      const points=samples.filter((p,i)=>i%18===0);const n=Math.min(points.length,Math.floor(t*16));
      if(!points.length)return;
      const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
      // The ending lights are the actual final recording, fitted to this wide frame.
      const position=p=>({x:maxX-minX<.01?w/2:100+(p.x-minX)/(maxX-minX)*(w-200),y:maxY-minY<.01?h/2:35+(p.y-minY)/(maxY-minY)*(h-70)});
      for(let i=0;i<n;i++){const {x,y}=position(points[i]);glow(c,x,y,25,'#f3d99c2a');circle(c,x,y,2.2,'#e6d5a9');}
      if(n>0){const {x,y}=position(points[n-1]);actor(c,x,y,true,1,Math.max(0,1-t/6));}
    }
  }
  window.WWMRenderer=Renderer;
})();
