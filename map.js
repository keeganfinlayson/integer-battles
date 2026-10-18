/* Exact integer geometry; continuous travel and independent per-point arrivals. */
(function(root){'use strict';
const UNIT=48,ZERO=887,LIMIT=198,RAMP=.15;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function position(n){if(!Number.isFinite(n)||Math.abs(n)>LIMIT)throw new RangeError('Map coordinate outside ±198');return {x:ZERO+n*UNIT,y:535+30*Math.sin(n/13)+18*Math.sin(n/31)};}
function baseMarker(n){return Number.isInteger(n)&&Math.abs(n)<=LIMIT&&(Math.abs(n)%5===0||Math.abs(n)===LIMIT);}
function distanceFraction(q){q=clamp(q,0,1);return q<RAMP?q*q/(2*RAMP*(1-RAMP)):q>1-RAMP?1-(1-q)*(1-q)/(2*RAMP*(1-RAMP)):(q-RAMP/2)/(1-RAMP);}
function inverseFraction(r){r=clamp(r,0,1);const edge=RAMP/(2*(1-RAMP));return r<edge?Math.sqrt(r*2*RAMP*(1-RAMP)):r>1-edge?1-Math.sqrt((1-r)*2*RAMP*(1-RAMP)):r*(1-RAMP)+RAMP/2;}
function makeJourney(result,random=Math.random){
 if(!Number.isInteger(result)||Math.abs(result)>LIMIT)throw new RangeError('Integer result required within ±198');
 const magnitude=Math.abs(result),direction=Math.sign(result),entry=.66+random()*.12;
 // Bigger journeys move faster per integer; ±198 takes about 7.4 seconds of travel.
 const duration=magnitude?.5+.32*Math.sqrt(magnitude)+.012*magnitude:0,step=magnitude?duration/magnitude:0;
 const variant=Math.floor(random()*3),tilt=(random()-.5)*.14,phase=random()*Math.PI*2;
 const particles=Array.from({length:4},()=>({x:(random()-.5)*44,y:-20-random()*40,delay:random()*.18,life:.22+random()*.18}));
 return {result,magnitude,direction,entry,duration,step,variant,tilt,phase,particles,travelEnd:entry+duration,end:magnitude?entry+duration+.62:entry+.72};
}
function pointTime(j,n){return j.entry+(j.magnitude?j.duration*inverseFraction(Math.abs(n)/j.magnitude):0);}
function pointScale(j,n,t){const p=clamp((t-pointTime(j,n))/.28,0,1),q=p-1;return 1+2.2*q*q*q+1.2*q*q;}
function sample(j,t){
 const q=j.duration?clamp((t-j.entry)/j.duration,0,1):0,progress=j.magnitude*distanceFraction(q),occupied=clamp(Math.floor(progress+1e-8),0,j.magnitude),n=j.direction*progress,p=position(n);
 const state=t<j.entry?'idle':!j.magnitude?'zero':q>=1?'arrival':'charge';
 const age=occupied?t-pointTime(j,occupied):Infinity,contact=Math.max(0,1-age/.28);
 return {state,progress,n,occupied,x:p.x,y:p.y,cameraX:p.x-ZERO,hop:0,contact,done:t>=j.end};
}
const api={UNIT,ZERO,LIMIT,position,baseMarker,makeJourney,sample,pointTime,pointScale};root.IntegerMap=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
