/* Scenery and medallion rendering; all positions come from IntegerMap. */
(function(root){'use strict';
const M=root.IntegerMap,W=1774,H=887,cache=new WeakMap(),crossingCache=new WeakMap();
const signedProgress=(t,j)=>Math.max(0,Math.min(1,(t-j.entry)/j.duration));
const signed=n=>n>0?'+'+n:n<0?'−'+Math.abs(n):'0';
function medallion(g,x,y,sign,state,t,j,contact=0){
 const fire=sign<0,color=fire?'#e95018':'#139cca';
 const idle=state==='idle',charge=state==='charge',arrival=state==='arrival'||state==='zero';
 let angle=idle?j.tilt*Math.sin(t*5+j.phase):charge?sign*.045*Math.sin(Math.PI*(j.magnitude?signedProgress(t,j):0)):arrival?j.tilt*Math.exp(-Math.max(0,t-j.travelEnd)*8):0;
 const bob=idle&&j.variant===1?Math.sin(t*6+j.phase)*2:0,squash=1,scale=arrival?1+Math.sin(Math.min(1,Math.max(0,(t-j.travelEnd)/.5))*Math.PI)*.055:1;
 g.save();g.translate(x,240+bob);g.rotate(angle);g.scale(scale*1.8,squash*1.8);
 g.shadowColor='#39230d88';g.shadowBlur=9;g.shadowOffsetY=5;
 let metal=g.createLinearGradient(-42,-40,42,40);metal.addColorStop(0,'#fff0bd');metal.addColorStop(.18,'#b48639');metal.addColorStop(.36,'#4e4d45');metal.addColorStop(.52,'#dbe2dd');metal.addColorStop(.73,'#766342');metal.addColorStop(1,'#f4d68a');
 g.fillStyle=metal;g.strokeStyle='#3b2817';g.lineWidth=3;g.beginPath();g.arc(0,0,43,0,Math.PI*2);g.fill();g.stroke();g.shadowBlur=0;g.shadowOffsetY=0;
 g.strokeStyle='#f6d394';g.lineWidth=1.5;g.beginPath();g.arc(0,0,38,0,Math.PI*2);g.stroke();
 const stone=g.createRadialGradient(-12,-17,2,0,0,35);stone.addColorStop(0,fire?'#ffda6a':'#bcf6ff');stone.addColorStop(.28,fire?'#ed6c24':'#259cd2');stone.addColorStop(.65,fire?'#852316':'#105b86');stone.addColorStop(1,fire?'#361619':'#0d2639');g.fillStyle=stone;g.strokeStyle='#30291f';g.lineWidth=2;g.beginPath();g.arc(0,0,33,0,Math.PI*2);g.fill();g.stroke();
 // Fine mineral veins and engraved elemental symbol, deliberately unlike a warrior.
 g.save();g.beginPath();g.arc(0,0,31,0,Math.PI*2);g.clip();g.strokeStyle=fire?'#f7ad5355':'#8befff55';g.lineWidth=1;g.beginPath();g.moveTo(-30,-7);g.lineTo(-12,-3);g.lineTo(-6,10);g.lineTo(14,17);g.lineTo(30,27);g.stroke();g.restore();
 const jewel=g.createLinearGradient(-8,-24,12,24);jewel.addColorStop(0,'#fffad5');jewel.addColorStop(.4,fire?'#ffc243':'#b7f5ff');jewel.addColorStop(1,fire?'#ed4b18':'#42bde3');g.fillStyle=jewel;g.strokeStyle=fire?'#6c2515':'#063f62';g.lineWidth=2;g.beginPath();
 if(fire){g.moveTo(0,-25);g.bezierCurveTo(16,-10,4,-4,15,1);g.quadraticCurveTo(30,28,0,26);g.quadraticCurveTo(-28,26,-17,5);g.quadraticCurveTo(-12,15,-9,1);g.quadraticCurveTo(-7,-13,0,-25);}else{g.moveTo(0,-25);g.bezierCurveTo(8,-10,20,1,20,11);g.bezierCurveTo(20,33,-20,33,-20,11);g.bezierCurveTo(-20,1,-8,-10,0,-25);}g.fill();g.stroke();
 g.fillStyle='#fff8dc';g.globalAlpha=.7;g.beginPath();g.ellipse(-7,5,3,8,.35,0,Math.PI*2);g.fill();g.globalAlpha=1;
 for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*39,y=Math.sin(a)*39;g.fillStyle='#493829';g.beginPath();g.arc(x,y,2.8,0,Math.PI*2);g.fill();g.fillStyle='#eacb85';g.beginPath();g.arc(x-.6,y-.8,1,0,Math.PI*2);g.fill();}
 // A narrow traveling reflection; no burst, smoke, or duplicate frame overlay.
 const shine=(Math.sin(t*4+j.phase)+1)/2;g.strokeStyle='rgba(255,250,215,'+(.2+shine*.35)+')';g.lineWidth=2.5;g.beginPath();g.arc(0,0,40,-2.8+shine*.3,-2.1+shine*.3);g.stroke();
 g.restore();
}
function scenery(g,art,sign,camera,s,t){
 g.fillStyle='#e8c48b';g.fillRect(0,0,W,H);
 const overlap=180,marginBlend=80,profile=sign<0?{zero:2.887,end:.1/.79,firstBand:.79}:{zero:.267,end:2.760,firstBand:1};
 const panel=(M.LIMIT*M.UNIT+2*overlap)/Math.abs(profile.end-profile.zero),stride=panel-overlap;
 const offset=M.ZERO-profile.zero*panel+Math.floor(profile.zero)*overlap,sourceH=art.height/3;
 // Prepare soft alpha overlaps once; avoid per-frame strip seams and oversized textures.
 let tiles=cache.get(art);
 if(!tiles){
  tiles=[];
  for(let i=0;i<3;i++){
   const tile=document.createElement('canvas');tile.width=art.width;tile.height=sourceH;const q=tile.getContext('2d');
   q.drawImage(art,0,i*sourceH,art.width*(i===0?profile.firstBand:1),sourceH,0,0,art.width,sourceH);
   q.globalCompositeOperation='destination-in';
   if(i===0){
    const fade=q.createLinearGradient(0,0,marginBlend*art.width/panel,0);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(1,'white');q.fillStyle=fade;q.fillRect(0,0,tile.width,sourceH);
   }else{
    // An organic terrain boundary with a narrow feather avoids straight panel cuts
    // and the double mountains/trees caused by a broad translucent overlay.
    const span=overlap*art.width/panel,feather=span*.1,mask=document.createElement('canvas');mask.width=tile.width;mask.height=tile.height;const m=mask.getContext('2d');
    for(let y=0;y<tile.height;y++){
     const edge=span*(.45+.15*Math.sin(y*.027+i)+.1*Math.sin(y*.071));
     const fade=m.createLinearGradient(edge,0,edge+feather,0);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(1,'white');m.fillStyle=fade;m.fillRect(0,y,tile.width,1);
    }
    q.drawImage(mask,0,0);
   }
   if(i===2){const fade=q.createLinearGradient(art.width-marginBlend*art.width/panel,0,art.width,0);fade.addColorStop(0,'white');fade.addColorStop(1,'rgba(255,255,255,0)');q.fillStyle=fade;q.fillRect(0,0,tile.width,sourceH);}
   q.globalCompositeOperation='source-over';tiles.push(tile);
  }
  cache.set(art,tiles);
 }
 // Terrain-only margins avoid repeating the castle or crossing landmarks.
 const margin=1000,sourceMargin=art.width*(margin+marginBlend)/panel,leftEdge=offset-camera,rightEdge=offset+2*stride+panel-camera;
 if(leftEdge>-marginBlend)g.drawImage(art,art.width*.38,0,sourceMargin,sourceH,leftEdge-margin,0,margin+marginBlend,H);
 if(rightEdge<W+marginBlend)g.drawImage(art,art.width*.35,2*sourceH,sourceMargin,sourceH,rightEdge-marginBlend,0,margin+marginBlend,H);
 for(let i=0;i<3;i++){const x=offset+i*stride-camera;if(x>W||x+panel<0)continue;g.drawImage(tiles[i],x,0,panel,H);}
 // End destinations are withheld until their exact coordinate has been reached.
 const endX=M.position(sign*M.LIMIT).x-camera,arrival=s.progress>=M.LIMIT;
 if(!arrival){g.save();const a=sign>0?endX-650:endX+650,b=sign>0?endX-450:endX+450;const veil=g.createLinearGradient(a,0,b,0);veil.addColorStop(0,'rgba(232,196,139,0)');veil.addColorStop(1,'#e8c48b');g.fillStyle=veil;g.fillRect(sign>0?a:0,0,sign>0?W-a:a,H);g.restore();}
}
function joinedScenery(g,world,camera,s,t){
 const zeroX=M.ZERO-camera;
 for(const [art,sign,left,right]of [[world.negative,-1,0,Math.min(W,zeroX)],[world.positive,1,Math.max(0,zeroX),W]]){
  if(right<=left)continue;g.save();g.beginPath();g.rect(left,0,right-left,H);g.clip();scenery(g,art,sign,camera,s,t);g.restore();
 }
 // One shared waterfall crossing joins the banks in world coordinates, independent of result sign.
 if(world.crossing&&zeroX>-W/2&&zeroX<W*1.5){let tile=crossingCache.get(world.crossing);if(!tile){tile=document.createElement('canvas');tile.width=world.crossing.width;tile.height=world.crossing.height;const q=tile.getContext('2d');q.drawImage(world.crossing,0,0);q.globalCompositeOperation='destination-in';const mask=document.createElement('canvas');mask.width=tile.width;mask.height=tile.height;const m=mask.getContext('2d');for(let y=0;y<tile.height;y++){const left=tile.width*(.06+.02*Math.sin(y*.008)+.012*Math.sin(y*.021)),right=tile.width*(.94+.02*Math.sin(y*.009+1)+.012*Math.sin(y*.017)),feather=20,fade=m.createLinearGradient(left,0,right,0);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(feather/(right-left),'white');fade.addColorStop(1-feather/(right-left),'white');fade.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=fade;m.fillRect(0,y,tile.width,1);}q.drawImage(mask,0,0);crossingCache.set(world.crossing,tile);}g.drawImage(tile,zeroX-tile.width/2,0,tile.width,H);}
}
function route(g,camera,sign,s,t,j,bridge){
 const lo=Math.max(-198,Math.floor((camera-M.ZERO)/M.UNIT)-2),hi=Math.min(198,Math.ceil((camera+W-M.ZERO)/M.UNIT)+2);
 const path=(dy=0)=>{g.beginPath();for(let n=lo;n<=hi;n+=.25){const p=M.position(n);if(n===lo)g.moveTo(p.x-camera,p.y+dy);else g.lineTo(p.x-camera,p.y+dy);}};
 // Matte ochre road with broken brush edges; geometry still follows exact integer positions.
 g.lineCap='round';g.lineJoin='round';g.strokeStyle='#9c784b88';g.lineWidth=70;path();g.stroke();
 const ribbon=(half,color)=>{g.fillStyle=color;g.beginPath();for(let n=lo;n<=hi;n+=.2){const p=M.position(n),edge=half+2.6*Math.sin(n*7.1)+1.5*Math.sin(n*17.3);if(n===lo)g.moveTo(p.x-camera,p.y-edge);else g.lineTo(p.x-camera,p.y-edge);}for(let n=hi;n>=lo;n-=.2){const p=M.position(n),edge=half+2.1*Math.sin(n*8.3)+1.8*Math.cos(n*13.1);g.lineTo(p.x-camera,p.y+edge);}g.closePath();g.fill();};
 ribbon(31,'#c4a16acc');ribbon(24,'#dfbf85bb');
 for(let n=lo;n<=hi;n+=.36){const p=M.position(n),x=p.x-camera,noise=Math.sin(n*19.3)*Math.cos(n*7.7);g.strokeStyle=noise>0?'#f0d39b55':'#84654044';g.lineWidth=1.5;g.beginPath();g.moveTo(x-5,p.y+noise*24);g.lineTo(x+6,p.y+noise*24+Math.sin(n*13)*2);g.stroke();}
 // A fine hand-inked line keeps the mathematical route legible on the painted road.
 g.strokeStyle='#675136bb';g.lineWidth=3;path(-12);g.stroke();
 const zeroX=M.ZERO-camera;
 if(bridge&&zeroX>-300&&zeroX<W+300){g.save();g.globalAlpha=.96;g.drawImage(bridge,zeroX-239,M.position(0).y-43,478,133);g.restore();}
 const linePosition=n=>{const p=M.position(n);return {x:p.x,y:p.y-12};};
 const color=sign<0?'#d84a1b':sign===0?'#95886d':'#119fd0';
 for(let n=lo;n<=hi;n++){
  const p=linePosition(n),x=p.x-camera,occupied=n!==0&&Math.sign(n)===sign&&Math.abs(n)<=s.occupied,base=M.baseMarker(n);
  if(!base&&!occupied)continue;
  g.fillStyle=n===0?color:occupied?color:'#edd396';g.strokeStyle=occupied||n===0?'#39382c':'#715123';g.lineWidth=n===0?3:2;g.beginPath();g.arc(x,p.y,n===0?17:occupied?8.5*M.pointScale(j,n,t):6.5,0,Math.PI*2);g.fill();g.stroke();
  if(occupied&&M.pointScale(j,n,t)>.6){g.fillStyle='#fff9d9';g.globalAlpha=.65;g.beginPath();g.arc(x-2,p.y-2,2,0,Math.PI*2);g.fill();g.globalAlpha=1;}
  if(base){if(Math.abs(n)<=1){g.fillStyle='#f9e3b8';g.strokeStyle='#7d582b';g.lineWidth=1.5;g.beginPath();g.roundRect(x-22,p.y+(n===0?17:11),44,n===0?38:36,4);g.fill();g.stroke();}g.fillStyle='#33230f';g.font='bold '+(n===0?34:30)+'px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(signed(n),x,p.y+(n===0?35:25));}
 }
 // Keep the current intermediate integer explicit beyond the five-unit labels.
 if(s.state==='arrival'&&s.occupied>20&&s.occupied%5!==0&&s.occupied!==M.LIMIT){const n=sign*s.occupied,p=linePosition(n);g.fillStyle='#33230f';g.font='bold 30px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(signed(n),p.x-camera,p.y+25);}
 // One contact ring on the exact occupied integer, with a short fade.
 if(s.contact>0&&s.occupied){const point=linePosition(sign*s.occupied);g.strokeStyle=sign<0?'rgba(185,60,17,'+(s.contact*.55)+')':'rgba(0,126,185,'+(s.contact*.55)+')';g.lineWidth=2;g.beginPath();g.arc(point.x-camera,point.y,10+(1-s.contact)*7,0,Math.PI*2);g.stroke();}
 if(s.state==='idle'||s.state==='zero'){
  const strength=s.state==='zero'?.65:.32;g.strokeStyle='rgba(243,240,205,'+strength+')';g.lineWidth=2;g.beginPath();g.arc(zeroX,linePosition(0).y,20+Math.sin(t*5)*(j.variant===0?3:1),0,Math.PI*2);g.stroke();
 }
}
function location(g,x,y,name){
 // Ink belongs to the world: no plaques or viewport-following labels.
 g.save();g.textAlign='center';g.textBaseline='middle';
 g.font='italic bold 30px Georgia';g.lineJoin='round';g.lineWidth=5;
 g.strokeStyle='rgba(245,218,169,.82)';g.fillStyle='#49331e';
 const article=name.startsWith('The '),main=article?name.slice(4):name;
 if(article){g.font='italic 18px Georgia';g.strokeText('The',x,y-22);g.fillText('The',x,y-22);g.font='italic bold 30px Georgia';}
 g.strokeText(main,x,y);g.fillText(main,x,y);g.restore();
}
function draw(g,j,t,art,bridge,world=root.IntegerMapWorld){
 const s=M.sample(j,t),sign=j.direction,camera=s.cameraX;g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.clearRect(0,0,W,H);if(world)joinedScenery(g,world,camera,s,t);else scenery(g,art,sign||1,camera,s,t);
 route(g,camera,sign,s,t,j,bridge);
 const places=sign<0?[
  [-45,'The Lowlands',455,-80,-30],[-100,'The Absolute Oasis',455,-125,-80],[-170,'The Lower Lands',455,-198,-125],[-170,'Odds & Ends Hollow',680,-198,-125]
 ]:[
  [8,'The Negative Marshes',680,0,24],[55,'The Absolute Wilds',455,20,82],[55,'Evenfall',680,30,82],[105,'Sumwhere',455,82,133],[157,'The Higher Ground',680,133,198]
 ];
 places.push([-12,'The Opposite Shore',455,-24,-1],[12,'The Opposite Shore',455,1,24]);
 // Place names pan with their landscape positions rather than sticking to the camera.
 for(const [n,name,y]of places){const x=M.position(n).x-camera;if(x>-300&&x<W+300)location(g,x,y,name);}
 if(s.progress>=198)location(g,M.position(j.result).x-camera,455,sign<0?'The Fire Fortress':'Positive Palace',s.done);
 const crossingX=M.ZERO-camera;if(crossingX>-250&&crossingX<W+250)location(g,crossingX,445,"Zero’s Crossing",s.done);
 if(s.state==='idle'&&j.variant===2){for(const p of j.particles){const age=t-p.delay;if(age<0||age>p.life)continue;g.globalAlpha=.35*Math.sin(age/p.life*Math.PI);g.fillStyle='#fff5cf';g.beginPath();g.arc(M.ZERO+p.x,495+p.y-age*8,1.5,0,Math.PI*2);g.fill();}g.globalAlpha=1;}
 if(sign!==0&&!s.done)medallion(g,s.x-camera,s.y-s.hop,sign,s.state,t,j,s.contact);
 // Thin book-map trim is a viewport overlay, never a stitched panel border.
 g.strokeStyle='#5e361c';g.lineWidth=9;g.strokeRect(4.5,4.5,W-9,H-9);g.strokeStyle='#c89348';g.lineWidth=2;g.strokeRect(12,12,W-24,H-24);
}
root.drawIntegerMap=draw;root.drawIntegerMedallion=medallion;
})(window);
