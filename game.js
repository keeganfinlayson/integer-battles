(function(){'use strict';
const model=window.IntegerBattle,canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'),left=document.getElementById('left'),right=document.getElementById('right'),run=document.getElementById('run'),status=document.getElementById('status'),emblem=document.getElementById('emblem'),result=document.getElementById('result'),operation=document.getElementById('operation'),resultShield=document.getElementById('resultShield');
const game=document.querySelector('.game');
let journey=null,mapStart=0,mapArtPositive,mapArtNegative;
let stances;
const SPRITE_LAYOUT={"run":[[{"x":0,"y":0,"w":314,"h":314,"foot":0.9745222929936306,"anchor":0.5154760409984517},{"x":314,"y":0,"w":313,"h":314,"foot":0.9808917197452229,"anchor":0.5150846593333402},{"x":627,"y":0,"w":314,"h":314,"foot":0.9808917197452229,"anchor":0.5023535421458647},{"x":941,"y":0,"w":313,"h":314,"foot":0.9745222929936306,"anchor":0.5171499491498864},{"x":0,"y":314,"w":314,"h":313,"foot":0.9584664536741214,"anchor":0.5297055884760562},{"x":314,"y":314,"w":313,"h":313,"foot":0.9616613418530351,"anchor":0.5261367798783093},{"x":627,"y":314,"w":314,"h":313,"foot":0.9616613418530351,"anchor":0.5184060010279482},{"x":941,"y":314,"w":313,"h":313,"foot":0.9456869009584664,"anchor":0.5171291425442758}],[{"x":0,"y":627,"w":314,"h":314,"foot":0.89171974522293,"anchor":0.5152911748839069},{"x":314,"y":627,"w":313,"h":314,"foot":0.8949044585987261,"anchor":0.5221109008757508},{"x":627,"y":627,"w":314,"h":314,"foot":0.8949044585987261,"anchor":0.5046035464698483},{"x":941,"y":627,"w":313,"h":314,"foot":0.89171974522293,"anchor":0.5174523300260737},{"x":0,"y":941,"w":314,"h":313,"foot":0.8466453674121406,"anchor":0.528781145700706},{"x":314,"y":941,"w":313,"h":313,"foot":0.8562300319488818,"anchor":0.5336290315169745},{"x":627,"y":941,"w":314,"h":313,"foot":0.8562300319488818,"anchor":0.5258147768025018},{"x":941,"y":941,"w":313,"h":313,"foot":0.8370607028753994,"anchor":0.5155721940703767}]],"ready":[[{"x":0,"y":0,"w":512,"h":512,"foot":0.98633},{"x":512,"y":0,"w":512,"h":512,"foot":0.98633},{"x":1024,"y":0,"w":512,"h":512,"foot":0.98242}],[{"x":0,"y":512,"w":512,"h":512,"foot":0.91992},{"x":512,"y":512,"w":512,"h":512,"foot":0.91016},{"x":1024,"y":512,"w":512,"h":512,"foot":0.91602}]],"change":[[{"x":0,"y":0,"w":360,"h":364,"foot":0.989010989010989,"anchor":0.5},{"x":360,"y":0,"w":361,"h":364,"foot":0.989010989010989,"anchor":0.5},{"x":721,"y":0,"w":360,"h":364,"foot":0.989010989010989,"anchor":0.5},{"x":1081,"y":0,"w":360,"h":364,"foot":0.989010989010989,"anchor":0.5},{"x":1441,"y":0,"w":361,"h":364,"foot":0.989010989010989,"anchor":0.5},{"x":1802,"y":0,"w":360,"h":364,"foot":0.989010989010989,"anchor":0.5}],[{"x":0,"y":364,"w":360,"h":363,"foot":0.9366391184573003,"anchor":0.5},{"x":360,"y":364,"w":361,"h":363,"foot":0.9366391184573003,"anchor":0.5},{"x":721,"y":364,"w":360,"h":363,"foot":0.9366391184573003,"anchor":0.5},{"x":1081,"y":364,"w":360,"h":363,"foot":0.9366391184573003,"anchor":0.5},{"x":1441,"y":364,"w":361,"h":363,"foot":0.9366391184573003,"anchor":0.5},{"x":1802,"y":364,"w":360,"h":363,"foot":0.9366391184573003,"anchor":0.5}]],"turn":[[{"x":0,"y":0,"w":361,"h":364,"foot":0.98,"anchor":0.5},{"x":361,"y":0,"w":360,"h":364,"foot":0.98,"anchor":0.5},{"x":721,"y":0,"w":361,"h":364,"foot":0.98,"anchor":0.5},{"x":1082,"y":0,"w":361,"h":364,"foot":0.98,"anchor":0.5},{"x":1443,"y":0,"w":360,"h":364,"foot":0.98,"anchor":0.5},{"x":1803,"y":0,"w":361,"h":364,"foot":0.98,"anchor":0.5}],[{"x":0,"y":364,"w":361,"h":363,"foot":0.98,"anchor":0.5},{"x":361,"y":364,"w":360,"h":363,"foot":0.98,"anchor":0.5},{"x":721,"y":364,"w":361,"h":363,"foot":0.98,"anchor":0.5},{"x":1082,"y":364,"w":361,"h":363,"foot":0.98,"anchor":0.5},{"x":1443,"y":364,"w":360,"h":363,"foot":0.98,"anchor":0.5},{"x":1803,"y":364,"w":361,"h":363,"foot":0.98,"anchor":0.5}]],"reveal":[[{"x":0,"y":0,"w":361,"h":364,"foot":0.9945054945054945,"anchor":0.5},{"x":361,"y":0,"w":360,"h":364,"foot":0.9945054945054945,"anchor":0.5},{"x":721,"y":0,"w":361,"h":364,"foot":0.9945054945054945,"anchor":0.5},{"x":1082,"y":0,"w":361,"h":364,"foot":0.9945054945054945,"anchor":0.5},{"x":1443,"y":0,"w":360,"h":364,"foot":0.9945054945054945,"anchor":0.5},{"x":1803,"y":0,"w":361,"h":364,"foot":0.9945054945054945,"anchor":0.5}],[{"x":0,"y":364,"w":361,"h":363,"foot":0.9586776859504132,"anchor":0.5},{"x":361,"y":364,"w":360,"h":363,"foot":0.9586776859504132,"anchor":0.5},{"x":721,"y":364,"w":361,"h":363,"foot":0.9586776859504132,"anchor":0.5},{"x":1082,"y":364,"w":361,"h":363,"foot":0.9586776859504132,"anchor":0.5},{"x":1443,"y":364,"w":360,"h":363,"foot":0.9586776859504132,"anchor":0.5},{"x":1803,"y":364,"w":361,"h":363,"foot":0.9586776859504132,"anchor":0.5}]]};
const expression=document.getElementById('expression');
const integerText=n=>Number.isFinite(n)?String(n).replace('-','−'):'?';
const equationText=(a,b,op,answer)=>'('+integerText(a)+') '+(op==='subtract'?'−':'+')+' ('+integerText(b)+')'+(answer===undefined?'':' = '+integerText(answer));
function updateExpression(answer){expression.textContent=equationText(value(left),value(right),operation.value,answer);}
let mapBridge,crossingArt;
let sprites,costumes,reveals,turns,shieldWater,shieldFire,ready=false,battle=null,start=0,running=false,raf=0;
const image=src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load '+src));img.src=src;});
function value(input){return /^[+-]?\d{1,2}$/.test(input.value.trim())?Number(input.value):NaN;}
const signed=n=>n>0?'+'+n:String(n);
function sync(){const a=value(left),b=value(right);document.getElementById('leftControl').classList.toggle('fire',a<0);document.getElementById('rightControl').classList.toggle('fire',b<0);run.disabled=!ready||running||!model.valid(a,b,operation.value);if(!running)updateExpression();if(!running&&ready)status.textContent=model.valid(a,b,operation.value)?(operation.value==='subtract'?'Subtract: the second group changes its sign before combining.':'Water = +1 · Fire = −1 · Matching signs join; opposites cancel.'):'Choose integers from −99 through +99.';}
function clearResult(){emblem.hidden=true;battle=null;journey=null;game.classList.remove('map-scene');if(ready)renderIdle();}
[left,right].forEach(input=>{input.addEventListener('input',()=>{clearResult();sync();});input.addEventListener('blur',()=>{const n=value(input);if(Number.isFinite(n))input.value=signed(n);});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!run.disabled)run.click();});});
document.querySelectorAll('[data-delta]').forEach(button=>button.addEventListener('click',()=>{const input=button.dataset.side==='left'?left:right;const n=value(input);input.value=signed(Math.max(-99,Math.min(99,(Number.isFinite(n)?n:0)+Number(button.dataset.delta))));clearResult();sync();}));
function scenery(){ctx.clearRect(0,0,1774,887);ctx.drawImage(mapBridge,648,417,478,180);
 // One continuous rope, extending beyond both canvas edges. No bridge rails.
 ctx.save();ctx.lineWidth=13;ctx.lineCap='round';ctx.strokeStyle='#5b330f';ctx.beginPath();ctx.moveTo(-30,490);ctx.lineTo(1804,490);ctx.stroke();ctx.lineWidth=8;ctx.strokeStyle='#d7a348';ctx.stroke();
 ctx.save();ctx.beginPath();ctx.rect(0,485,1774,10);ctx.clip();ctx.lineWidth=2;ctx.strokeStyle='#f1c779';for(let x=-15;x<1790;x+=11){ctx.beginPath();ctx.moveTo(x,484);ctx.lineTo(x+8,496);ctx.stroke();}ctx.restore();
 for(let n=-8;n<=8;n++){const x=887+n*98;ctx.fillStyle='#70451c';ctx.fillRect(x-3,474,6,27);ctx.fillStyle='#fbe4b4';ctx.strokeStyle='#623b17';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x-22,487,44,38,5);ctx.fill();ctx.stroke();ctx.fillStyle='#191709';ctx.font='bold 29px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),x,507);}
 ctx.fillStyle='#f8e5bb';ctx.font='bold 32px Georgia';ctx.fillText('…',34,507);ctx.fillText('…',1740,507);ctx.restore();}
operation.addEventListener('change',()=>{clearResult();sync();});
function spriteCell(atlas,kind,row,frame,x,y,direction=1,scaleX=1,angle=0,size=180,alpha=1){
 const rect=SPRITE_LAYOUT[kind][row][frame];ctx.save();ctx.translate(x,y);ctx.scale(direction*scaleX,1);ctx.rotate(angle);ctx.globalAlpha=alpha;ctx.drawImage(atlas,rect.x,rect.y,rect.w,rect.h,-size/2,-size*rect.foot,size,size);ctx.restore();
}
// Cache premultiplied in-between poses once; no extra network assets or per-unit canvases.
const poseCache=new Map();
function smoothSprite(atlas,kind,row,phase,x,y,direction=1,scaleX=1,angle=0,loop=false){
 const cells=SPRITE_LAYOUT[kind][row],count=cells.length;
 const sample=loop?((phase%count)+count)%count:Math.max(0,Math.min(count-1,phase));
 const a=Math.floor(sample),b=loop?(a+1)%count:Math.min(count-1,a+1),fraction=Math.round((sample-a)*8)/8;
 const key=kind+':'+row+':'+a+':'+b+':'+fraction;
 let tile=poseCache.get(key);
 if(!tile){if(poseCache.size>=160){const oldest=poseCache.keys().next().value;tile=poseCache.get(oldest);poseCache.delete(oldest);}else{tile=document.createElement('canvas');tile.width=tile.height=216;}const g=tile.getContext('2d');g.clearRect(0,0,216,216);
  // Add weighted premultiplied colors so silhouettes stay opaque during the blend.
  for(const [frame,weight]of [[a,1-fraction],[b,fraction]]){if(!weight)continue;const r=cells[frame];g.globalAlpha=weight;g.globalCompositeOperation='lighter';g.drawImage(atlas,r.x,r.y,r.w,r.h,18+(0.5-(r.anchor??0.5))*180,204-180*r.foot,180,180);}
  poseCache.set(key,tile);
 }
 ctx.save();ctx.translate(x,y);ctx.scale(direction*scaleX,1);ctx.rotate(angle);ctx.drawImage(tile,-108,-204);ctx.restore();
}
function warrior(u,p){
 if(!p||p.x< -190||p.x>1964)return;
 if(p.turnProgress!==null&&p.turnProgress!==undefined){smoothSprite(turns,'turn',p.sign>0?0:1,p.turnProgress*5,p.x,p.y,p.turnDirection);return;}
 if(p.costumeFrame!==null&&p.costumeFrame!==undefined){
  const incoming=u.side==='left'?1:-1,reverse=!battle.opposing&&incoming!==u.effectiveSign;
  // The drawn pivot supplies the change of view; no cosine squash or sudden mirror.
  smoothSprite(reverse?costumes:reveals,reverse?'change':'reveal',p.conversionRow,p.conversionProgress*5,p.x,p.y,incoming);return;
 }
 if(p.stanceFrame!==null&&p.stanceFrame!==undefined){
  const opening=running?Math.max(0,(performance.now()-start)/1000):0;
  const phase=p.stanceFrame===0?0:Math.min(2,Math.max(0,(opening-model.STANCE_TIME)/(model.CHARGE_START-model.STANCE_TIME)*2));
  smoothSprite(stances,'ready',p.sign>0?0:1,phase,p.x,p.y,p.direction,p.turnScale||1);return;
 }
 smoothSprite(sprites,'run',p.sign>0?0:1,p.runPhase,p.x,p.y,p.direction,p.turnScale||1,0,true);
}
function dissolve(c,t){
 const age=t-c.time;if(age<0||age>=.14)return;
 const progress=age/.14,frame=Math.min(2,Math.floor(progress*3)),size=180*(1-progress*.10);
 // Fade the current symbolic sprite upwards, never an old equipment-bearing frame.
 for(let side=0;side<2;side++){
  const sign=side===0?c.leftSign:-c.leftSign,row=sign>0?0:1,direction=side===0?1:-1,rect=SPRITE_LAYOUT.run[row][frame];
  ctx.save();ctx.translate(model.CENTER+(side===0?-model.CANCEL_GAP:model.CANCEL_GAP),480-progress*18);ctx.scale(direction,1);
  for(let band=0;band<10;band++){ctx.globalAlpha=Math.pow(1-progress,1.5)*Math.max(0,1-progress*(1-band/12));ctx.drawImage(sprites,rect.x,rect.y+band*rect.h/10,rect.w,rect.h/10,-size/2,-size*rect.foot+band*size/10,size,size/10+.4);}
  ctx.restore();
 }
}
function steam(c,t){
 const age=t-c.time;if(age<0||age>=c.life)return;
 const p=age/c.life,alpha=c.opacity*Math.min(1,age/.045)*Math.pow(1-p,1.1);
 ctx.save();ctx.translate(c.x+c.drift*p,c.y-c.lift*p);ctx.rotate(c.curve*p/180);ctx.scale((1+p*.24)*c.steamScale,(1.55+p*.18)*Math.sqrt(c.steamScale));ctx.globalAlpha=alpha;ctx.lineCap='round';
 // Two narrow rising ribbons: a soft cool edge keeps the white vapor readable over the waterfall.
 for(let ribbon=0;ribbon<2;ribbon++){
  const shift=ribbon?c.width*.35:0,sway=Math.sin(p*Math.PI*1.5+ribbon)*5;
  const path=()=>{ctx.beginPath();ctx.moveTo(shift-5,18);ctx.bezierCurveTo(shift-c.width*.65+sway,5,shift+c.width*.6+sway,-9,shift+2,-22);ctx.bezierCurveTo(shift-c.width*.32,-30,shift+c.width*.25,-36,shift+5,-43);};
  ctx.strokeStyle='rgba(80,105,118,.55)';ctx.lineWidth=ribbon?14:20;ctx.shadowColor='rgba(61,85,99,.3)';ctx.shadowBlur=7;path();ctx.stroke();
  const vapor=ctx.createLinearGradient(0,18,0,-43);vapor.addColorStop(0,'rgba(242,252,255,.25)');vapor.addColorStop(.35,'rgba(255,255,255,.95)');vapor.addColorStop(1,'rgba(243,251,255,.08)');
  ctx.strokeStyle=vapor;ctx.lineWidth=ribbon?9:13;ctx.shadowColor='rgba(246,253,255,.6)';ctx.shadowBlur=10;path();ctx.stroke();
 }
 ctx.restore();
}
function renderIdle(){scenery();const a=value(left),b=value(right);if(!model.valid(a,b,operation.value))return;const idle=model.makeBattle(a,b,()=>.5,operation.value);idle.units.slice().sort((a,b)=>a.lane-b.lane).forEach(u=>{warrior(u,model.pose(idle,u,0));});}
function paintShield(value){
 const g=resultShield.getContext('2d'),art=value<0?shieldFire:shieldWater;
 g.clearRect(0,0,768,1024);g.save();
 if(value===0)g.filter='grayscale(.9)';
 const scale=Math.min(768/art.width,1024/art.height),w=art.width*scale,h=art.height*scale;
 g.drawImage(art,(768-w)/2,(1024-h)/2,w,h);g.restore();
 const text=signed(value);let size=210;g.font='bold '+size+'px Georgia';while(g.measureText(text).width>560){size-=4;g.font='bold '+size+'px Georgia';}
 g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=8;g.strokeStyle=value<0?'#35180d':'#09283a';g.shadowColor='#000';g.shadowBlur=9;g.shadowOffsetY=5;
 g.strokeText(text,384,455);g.fillStyle=value<0?'#fff0cf':'#effdff';g.fillText(text,384,455);g.shadowBlur=0;g.shadowOffsetY=0;
}
function finish(){running=false;emblem.className='emblem '+(battle.result<0?'fire':battle.result>0?'water':'neutral');result.textContent=signed(battle.result);paintShield(battle.result);emblem.hidden=false;left.disabled=right.disabled=operation.disabled=false;document.querySelectorAll('[data-delta]').forEach(b=>b.disabled=false);sync();updateExpression(battle.result);status.textContent=expression.textContent;window.drawIntegerMap(ctx,journey,journey.end,battle.result<0?mapArtNegative:mapArtPositive,mapBridge);}
function frame(now){
 if(journey){const t=(now-mapStart)/1000;window.drawIntegerMap(ctx,journey,t,battle.result<0?mapArtNegative:mapArtPositive,mapBridge);if(window.IntegerMap.sample(journey,t).done){finish();return;}raf=requestAnimationFrame(frame);return;}
 const t=(now-start)/1000;if(battle.stage){const message=t<model.CHARGE_START?'The characters get ready to run…':t<battle.costumeStart?'The front characters approach zero…':t<battle.release?(battle.conversion?(battle.b<0?'Fire lifts its hood and turns into water…':'Water lifts its hood and turns into fire…'):'The groups turn to join…'):battle.opposing?'Opposite units cancel in zero pairs…':battle.result<0?'Both groups run left together…':'Both groups run right together…';if(status.textContent!==message)status.textContent=message;}scenery();battle.units.slice().sort((a,b)=>a.lane-b.lane).forEach(u=>{const p=model.pose(battle,u,t);if(p)warrior(u,p);});battle.collisions.forEach(c=>{dissolve(c,t);steam(c,t);});
 if(t>=battle.mapAt){journey=window.IntegerMap.makeJourney(battle.result);mapStart=now;game.classList.add('map-scene');status.textContent=battle.result===0?'All units canceled. Zero’s Crossing remains at 0.':'The '+Math.abs(battle.result)+' remaining units move '+(battle.result>0?'to the right.':'to the left.');window.drawIntegerMap(ctx,journey,0,battle.result<0?mapArtNegative:mapArtPositive,mapBridge);}
 raf=requestAnimationFrame(frame);
}
run.addEventListener('click',()=>{const a=value(left),b=value(right);if(!ready||running||!model.valid(a,b,operation.value))return;cancelAnimationFrame(raf);battle=model.makeBattle(a,b,Math.random,operation.value);emblem.hidden=true;journey=null;updateExpression();game.classList.remove('map-scene');running=true;left.disabled=right.disabled=operation.disabled=true;document.querySelectorAll('[data-delta]').forEach(b=>b.disabled=true);status.textContent='The characters get ready, then run toward zero…';sync();start=performance.now();raf=requestAnimationFrame(frame);});
Promise.all([image('assets/symbolic-run-v3.webp'),image('assets/battle-painted.webp'),image('assets/shield-water.png'),image('assets/shield-fire.png'),image('assets/symbolic-change-v2.webp'),image('assets/map-positive-v3.webp'),image('assets/map-negative-v4.webp'),image('assets/symbolic-ready.webp'),image('assets/symbolic-turn.webp'),image('assets/map-bridge.webp'),image('assets/symbolic-reveal.webp'),image('assets/map-crossing.webp')]).then(images=>{[sprites,,shieldWater,shieldFire,costumes,mapArtPositive,mapArtNegative,stances,turns,mapBridge,reveals,crossingArt]=images;window.IntegerMapWorld={positive:mapArtPositive,negative:mapArtNegative,crossing:crossingArt,bridge:mapBridge};ready=true;renderIdle();sync();}).catch(error=>{status.textContent=error.message+' — keep the assets folder beside index.html.';run.disabled=true;});
sync();
})();
