/* Pure timeline: signed units keep their identities through conversion and pairing. */
(function(root){'use strict';
const W=1774,CENTER=W/2,SPEED=405,HALF_CONTACT=13,CANCEL_GAP=92,SPRITE_SIZE=180,RUN_FRAMES=8,SCREEN_CAPACITY=16,COSTUME_TIME=1.12,TURN_TIME=.48,STANCE_TIME=.55,CHARGE_START=.80;
function valid(a,b,operation='add'){return ['add','subtract'].includes(operation)&&Number.isInteger(a)&&Number.isInteger(b)&&Math.abs(a)<=99&&Math.abs(b)<=99;}
function openingStance(t){return t<STANCE_TIME?0:t<CHARGE_START?(t<.675?1:2):null;}
function makeBattle(a,b,random=Math.random,operation='add'){
 if(!valid(a,b,operation))throw new RangeError('Enter integers from −99 through +99.');
 const subtract=operation==='subtract',effectiveB=subtract?-b:b,result=a+effectiveB;
 const opposing=a*effectiveB<0,pairs=opposing?Math.min(Math.abs(a),Math.abs(b)):0,units=[],collisions=[];
 const count=Math.max(Math.abs(a),Math.abs(b)),groupSize=count>=50?10:count>=15?5:1;
 let arrival=CHARGE_START+2.55*245/405;
 for(let i=0;i<count;i++){
  if(i){if(groupSize===1)arrival+=(.38+random()*.10)*245/405;else{const f=i/Math.max(1,count-1),bulk=Math.pow(Math.sin(Math.PI*f),1.5),minimum=groupSize===10?.035:.06;arrival+=.22-(.22-minimum)*bulk+(i%groupSize===0?.08*(1-bulk):0)+random()*.008;}}
  const member=i%groupSize,lane=(i%3)*2;

  for(const side of ['left','right']){const value=side==='left'?a:b;if(i>=Math.abs(value))continue;
   const direction=side==='left'?1:-1;
   units.push({id:side+'-'+i,side,sign:Math.sign(value),effectiveSign:side==='left'?Math.sign(a):Math.sign(effectiveB),index:i,group:Math.floor(i/groupSize),member,paired:i<pairs,arrival,phase:random()*6,cycle:1.04+random()*.16,lane,startX:CENTER-direction*HALF_CONTACT-direction*SPEED*(arrival-CHARGE_START)});
  }
 }
 const stage=(subtract&&b!==0)||!opposing;
 const battle={a,b,operation,subtract,effectiveB,result,opposing,pairs,stage,conversion:subtract&&b!==0,groupSize,units,collisions,lastCancel:0};
 if(stage&&units.length){
  for(const u of units){const direction=u.side==='left'?1:-1,columns=Math.min(10,Math.abs(u.side==='left'?a:b)),row=Math.floor(u.index/columns),column=u.index%columns;
   u.centerTarget=CENTER-direction*((opposing?110:70)+column*(count>=50?24:32)+(row%2)*6);u.centerArrival=CHARGE_START+Math.abs(u.centerTarget-u.startX)/SPEED;u.lane=(row%3)*2+(column%2);
  }
  battle.costumeStart=Math.max(...units.filter(u=>u.index<3).map(u=>u.centerArrival))+.12;
  battle.release=battle.costumeStart+(battle.conversion?COSTUME_TIME:TURN_TIME);
  battle.fireRunStart=battle.waterRunStart=battle.release;
  for(const u of units){u.stopTime=Math.min(u.centerArrival,battle.costumeStart);u.targetX=u.startX+(u.side==='left'?1:-1)*SPEED*(u.stopTime-CHARGE_START);}
  if(opposing){
   let previous=battle.release;
   for(let i=0;i<count;i++){const rank=units.filter(u=>u.index===i),distance=Math.max(...rank.map(u=>Math.abs(CENTER-(u.side==='left'?1:-1)*(u.paired?CANCEL_GAP:HALF_CONTACT)-u.targetX)));
    const time=Math.max(battle.release+distance/SPEED,previous+(i?groupSize===1?.24:groupSize===10?.085:.11:0));
    for(const u of rank)u.arrival=time;previous=time;
   }
  }
 }
 if(!stage)for(const u of units)if(u.paired)u.arrival-=(CANCEL_GAP-HALF_CONTACT)/SPEED;
 for(let i=0;i<pairs;i++){const u=units.find(u=>u.side==='left'&&u.index===i);collisions.push({time:u.arrival,steamScale:1+Math.min(.85,i*.028),leftSign:Math.sign(a),x:CENTER+(random()-.5)*26,y:360+random()*14,drift:(random()-.5)*32,lift:30+random()*24,curve:(random()-.5)*22,opacity:.70+random()*.14,life:.72+random()*.18,width:42+random()*18});}
 battle.lastCancel=collisions.length?collisions[collisions.length-1].time:0;
 let finalExit=battle.release||CHARGE_START;
 for(const u of units){if(u.paired)continue;
  const sign=u.effectiveSign;
  if(!opposing){u.exit=battle.release+Math.max(.02,(sign>0?W+SPRITE_SIZE-u.targetX:u.targetX+SPRITE_SIZE)/SPEED);}
  else u.exit=u.arrival+(sign>0?W+SPRITE_SIZE-CENTER+HALF_CONTACT:CENTER+HALF_CONTACT+SPRITE_SIZE)/SPEED;
  finalExit=Math.max(finalExit,u.exit);
 }
 battle.finalExit=finalExit;battle.lastFireExit=finalExit;battle.end=Math.max(finalExit,battle.lastCancel?battle.lastCancel+.95:0);
 if(!units.length){battle.costumeStart=CHARGE_START;battle.release=CHARGE_START;battle.end=CHARGE_START;}
 battle.mapAt=mapTransitionTime(battle);
 return battle;
}
function pose(b,u,t){
 if(u.paired&&t>=u.arrival||!u.paired&&t>=u.exit)return null;
 const incoming=u.side==='left'?1:-1;
 let x,sign=u.sign,direction=incoming,stanceFrame=openingStance(t),costumeFrame=null,conversionProgress=null,conversionRow=null,turnScale=1;
 if(b.stage){
  if(t<b.release){
   x=t>=u.stopTime?u.targetX:u.startX+incoming*SPEED*Math.max(0,t-CHARGE_START);
   if(t>=u.stopTime)stanceFrame=0;

   if(b.conversion&&u.side==='right'&&t>=b.costumeStart){conversionProgress=Math.min(1,(t-b.costumeStart)/COSTUME_TIME);costumeFrame=Math.min(5,Math.floor(conversionProgress*6));conversionRow=u.sign<0?0:1;stanceFrame=null;direction=conversionProgress<.5?incoming:(b.opposing?incoming:u.effectiveSign);}
  }else{
   sign=u.effectiveSign;stanceFrame=null;
   if(!b.opposing){direction=sign;x=u.targetX+direction*SPEED*(t-b.release);}
   else if(t<u.arrival){const contact=CENTER-incoming*(u.paired?CANCEL_GAP:HALF_CONTACT);x=u.targetX+(contact-u.targetX)*(t-b.release)/(u.arrival-b.release);}
   else{direction=sign;x=CENTER-incoming*HALF_CONTACT+direction*SPEED*(t-u.arrival);}
  }
 }else{
  if(!u.paired&&t>=u.arrival){direction=u.effectiveSign;x=CENTER-incoming*HALF_CONTACT+direction*SPEED*(t-u.arrival);}
  else x=u.startX+incoming*SPEED*Math.max(0,t-CHARGE_START);
 }
 let turnProgress=null;
 if(b.stage&&t<b.release&&t>=b.release-TURN_TIME&&incoming!==u.effectiveSign&&!(b.conversion&&u.side==='right'))turnProgress=(t-(b.release-TURN_TIME))/TURN_TIME;
 if(b.opposing&&!u.paired&&incoming!==u.effectiveSign&&t>=u.arrival-TURN_TIME/2&&t<u.arrival+TURN_TIME/2)turnProgress=(t-u.arrival+TURN_TIME/2)/TURN_TIME;
 const laneFactor=u.paired&&(!b.stage||t>=b.release)?Math.min(1,Math.max(0,(u.arrival-t)/.35)):1;
 const moving=stanceFrame===null&&costumeFrame===null&&turnProgress===null;
 // One complete left/right gait per two sprite widths; phase follows path length.
 // Waiting at the crossing cannot advance feet. Turning preserves accumulated distance.
 const traveled=b.stage&&t>=b.release?Math.abs(u.targetX-u.startX)+Math.abs(x-u.targetX):Math.abs(x-u.startX);
 const cycle=traveled/(SPRITE_SIZE*2)+u.phase/6;
 return {x,y:480+u.lane*laneFactor+(moving?-Math.abs(Math.sin(cycle*Math.PI*2))*3:0),frame:Math.floor(cycle*RUN_FRAMES)%RUN_FRAMES,runPhase:(cycle%1)*RUN_FRAMES,turnProgress,turnDirection:incoming,direction,sign,stanceFrame,costumeFrame,conversionProgress,conversionRow,turnScale};
}
// A screenful of the winning stream may hand over to the map before its tail exits.
// Cancellation and costume changes always complete before this gate opens.
function screenReady(b,t){
 if(!b.result||Math.abs(b.result)<SCREEN_CAPACITY||t<Math.max(b.release||CHARGE_START,b.lastCancel?b.lastCancel+.16:0))return false;
 const visible=[];for(const u of b.units){if(u.paired)continue;const p=pose(b,u,t);if(p&&p.direction===Math.sign(b.result)&&p.stanceFrame===null&&p.costumeFrame===null&&p.turnProgress===null&&p.x>=-SPRITE_SIZE/2&&p.x<=W+SPRITE_SIZE/2)visible.push(p.x);}
 if(visible.length<SCREEN_CAPACITY)return false;visible.sort((a,b)=>a-b);
 return visible[visible.length-1]-visible[0]+SPRITE_SIZE>=W*.5&&visible.every((x,i)=>!i||x-visible[i-1]<=SPRITE_SIZE);
}
function mapTransitionTime(b){
 if(Math.abs(b.result)<SCREEN_CAPACITY)return b.end;
 const gate=Math.max(b.release||CHARGE_START,b.lastCancel?b.lastCancel+.16:0),candidates=[gate];
 for(const u of b.units)if(!u.paired)candidates.push(u.exit-(W+SPRITE_SIZE*1.5)/SPEED+.002,u.arrival+TURN_TIME/2+.002,u.exit-SPRITE_SIZE*1.5/SPEED);
 candidates.sort((a,b)=>a-b);
 for(const t of candidates)if(t>=gate&&t<b.end&&screenReady(b,t))return t;
 return b.end;
}
const api={W,CENTER,SPEED,SPRITE_SIZE,RUN_FRAMES,SCREEN_CAPACITY,screenReady,CANCEL_GAP,COSTUME_TIME,TURN_TIME,STANCE_TIME,CHARGE_START,valid,makeBattle,pose};root.IntegerBattle=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
