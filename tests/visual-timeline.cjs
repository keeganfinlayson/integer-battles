/* Run with node tests/visual-timeline.cjs. No packages or browser needed. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const battle=require('../battle.js'),map=require('../map.js');
const scope={IntegerMap:map};scope.window=scope;
vm.runInNewContext(fs.readFileSync(require.resolve('../map-render.js'),'utf8'),scope);
const cases=[[3,-4],[-3,4],[3,4],[-3,-4],[0,-4],[0,4],[99,-99],[-99,99],[99,99],[-99,-99],[1,-1],[-1,1],[0,0],[3,0]];
let sequences=0;
for(const operation of ['add','subtract'])for(const [a,b]of cases){
 const scene=battle.makeBattle(a,b,()=>.5,operation);
 assert.equal(scene.result,operation==='add'?a+b:a-b);
 assert.equal(scene.units.length,Math.abs(a)+Math.abs(b));
 assert.equal(scene.pairs,Math.min(Math.abs(a),Math.abs(b))*(a*(operation==='add'?b:-b)<0));
 if(scene.conversion){
  // The wizard owns a real gap, while every counted character stays put until release.
  for(const unit of scene.units){
   const start=battle.pose(scene,unit,0),held=battle.pose(scene,unit,scene.release-.001);
   assert.equal(start.x,held.x);assert(Math.abs(start.x-battle.CENTER)>=340);
   const changed=battle.pose(scene,unit,scene.release+.001);
   if(changed)assert.equal(changed.sign,unit.effectiveSign);
  }
 }
 // Early handoff may omit the offscreen tail; every previously visible unit must be gone.
 const draining=scene.drainIds?scene.units.filter(u=>scene.drainIds.includes(u.id)):scene.units;
 for(const unit of draining)assert.equal(battle.pose(scene,unit,scene.mapAt+.001),null);
 sequences++;
}
for(let result=-198;result<=198;result++){
 const journey=map.makeJourney(result,()=>.5),end=map.sample(journey,journey.end);
 assert.equal(end.n,result);assert.equal(end.occupied,Math.abs(result));assert(end.done);
 assert.equal(end.x,map.position(result).x);
 for(const fraction of [0,.1,.5,.9,1]){
  const state=map.sample(journey,journey.entry+journey.duration*fraction);
  const bounds=scope.integerMapRevealBounds(journey,state);
  assert.equal(bounds.left,Math.min(map.ZERO,state.x));
  assert.equal(bounds.right,Math.max(map.ZERO,state.x));
  assert(bounds.right-bounds.left<=map.distance(result)+1e-6);
 }
}
let previousGap=Infinity;
for(let n=0;n<map.LIMIT;n++){
 const gap=map.position(n+1).x-map.position(n).x;
 assert(gap>0&&gap<previousGap);previousGap=gap;
 assert(Math.abs(map.integerAtX(map.position(n+.5).x)-(n+.5))<1e-9);
 assert(Math.abs(map.position(-n).x+map.position(n).x-2*map.ZERO)<1e-9);
}
assert(map.position(1).x-map.ZERO>175);
for(const result of [-2,-1,1,2]){
 const j=map.makeJourney(result,()=>.5),end=map.sample(j,j.end);
 assert.equal(end.cameraX,0);assert(Math.abs(end.x-end.cameraX-map.ZERO)>175);
 assert(j.duration>1.3);
}
for(let n=-198;n<=198;n++){
 const p=map.position(n),screenX=p.x-map.cameraOffset(p.x);
 assert(screenX>=map.ZERO-480-1e-8&&screenX<=map.ZERO+480+1e-8);
}
assert.equal(map.position(map.LIMIT).x,map.ZERO+map.LIMIT*map.UNIT);
// The emblem passes each point at precisely that point's independent bloop time.
for(const result of [-198,-23,23,198]){
 const j=map.makeJourney(result,()=>.5);
 for(let n=1;n<=Math.abs(result);n++){
  const s=map.sample(j,map.pointTime(j,n));
  assert(Math.abs(s.n-Math.sign(result)*n)<1e-8);
  assert.equal(s.occupied,n);
 }
}
console.log(`${sequences} battle cases and 397 map destinations passed, including held groups, drained exits, and exact reveal boundaries.`);
