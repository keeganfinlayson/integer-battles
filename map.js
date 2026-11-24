/* Gentle signed-log map spacing; continuous travel and exact per-point arrivals. */
(function(root){'use strict';
const UNIT=18,ZERO=887,LIMIT=198,RAMP=.15;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// Linear + log1p opens the first integers without a singularity or cramped outer tail.
// Normalize to retain the existing endpoints and panorama geography.
const rawDistance=n=>n+120*Math.log1p(n/3),NORMALIZE=LIMIT*UNIT/rawDistance(LIMIT);
function distance(n){return rawDistance(Math.abs(n))*NORMALIZE;}
function integerAtX(x){
 const delta=x-ZERO,target=clamp(Math.abs(delta),0,LIMIT*UNIT);
 if(!target)return 0;if(target>=LIMIT*UNIT)return Math.sign(delta)*LIMIT;
 let low=0,high=LIMIT;for(let i=0;i<44;i++){const middle=(low+high)/2;if(distance(middle)<target)low=middle;else high=middle;}
 return Math.sign(delta)*(low+high)/2;
}
function position(n){if(!Number.isFinite(n)||Math.abs(n)>LIMIT)throw new RangeError('Map coordinate outside ±198');return {x:ZERO+Math.sign(n)*distance(n),y:530+5*Math.sin(n/32)};}
function cameraOffset(x){
 const delta=x-ZERO,over=Math.max(0,Math.abs(delta)-360);
 if(!over)return 0;
 // Keep zero fixed for the opening steps, then ease into following the marker.
 return Math.sign(delta)*(over-120*(1-Math.exp(-over/120)));
}
function baseMarker(n){return Number.isInteger(n)&&Math.abs(n)<=LIMIT&&(Math.abs(n)%5===0||Math.abs(n)===LIMIT);}
function distanceFraction(q){q=clamp(q,0,1);return q<RAMP?q*q/(2*RAMP*(1-RAMP)):q>1-RAMP?1-(1-q)*(1-q)/(2*RAMP*(1-RAMP)):(q-RAMP/2)/(1-RAMP);}
function inverseFraction(r){r=clamp(r,0,1);const edge=RAMP/(2*(1-RAMP));return r<edge?Math.sqrt(r*2*RAMP*(1-RAMP)):r>1-edge?1-Math.sqrt((1-r)*2*RAMP*(1-RAMP)):r*(1-RAMP)+RAMP/2;}
function makeJourney(result,random=Math.random){
 if(!Number.isInteger(result)||Math.abs(result)>LIMIT)throw new RangeError('Integer result required within ±198');
 const magnitude=Math.abs(result),direction=Math.sign(result),entry=.66+random()*.12;
 // Small results get time for a readable step; longer journeys cover more ground per second.
 const duration=magnitude?.95+.38*Math.sqrt(magnitude)+.012*magnitude:0,step=magnitude?duration/magnitude:0;
 const variant=Math.floor(random()*3),tilt=(random()-.5)*.14,phase=random()*Math.PI*2;
 const particles=Array.from({length:4},()=>({x:(random()-.5)*44,y:-20-random()*40,delay:random()*.18,life:.22+random()*.18}));
 return {result,magnitude,direction,entry,duration,step,variant,tilt,phase,particles,travelEnd:entry+duration,end:magnitude?entry+duration+.62:entry+.72};
}
function pointTime(j,n){return j.entry+(j.magnitude?j.duration*inverseFraction(distance(n)/distance(j.magnitude)):0);}
function pointScale(j,n,t){const p=clamp((t-pointTime(j,n))/.28,0,1),q=p-1;return 1+2.2*q*q*q+1.2*q*q;}
function sample(j,t){
 const q=j.duration?clamp((t-j.entry)/j.duration,0,1):0,n=q>=1?j.result:integerAtX(ZERO+j.direction*distance(j.magnitude)*distanceFraction(q)),progress=Math.abs(n),occupied=clamp(Math.floor(progress+1e-8),0,j.magnitude),p=position(n);
 const state=t<j.entry?'idle':!j.magnitude?'zero':q>=1?'arrival':'charge';
 const age=occupied?t-pointTime(j,occupied):Infinity,contact=Math.max(0,1-age/.28);
 return {state,progress,n,occupied,x:p.x,y:p.y,cameraX:cameraOffset(p.x),hop:0,contact,done:t>=j.end};
}
const api={UNIT,ZERO,LIMIT,distance,integerAtX,position,cameraOffset,baseMarker,makeJourney,sample,pointTime,pointScale};root.IntegerMap=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
