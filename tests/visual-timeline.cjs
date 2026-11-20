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
 assert.equal(end.x,map.ZERO+result*map.UNIT);
 for(const fraction of [0,.1,.5,.9,1]){
  const state=map.sample(journey,journey.entry+journey.duration*fraction);
  const bounds=scope.integerMapRevealBounds(journey,state);
  assert.equal(bounds.left,Math.min(map.ZERO,state.x));
  assert.equal(bounds.right,Math.max(map.ZERO,state.x));
  assert(bounds.right-bounds.left<=Math.abs(result)*map.UNIT+1e-6);
 }
}
console.log(`${sequences} battle cases and 397 map destinations passed, including held groups, drained exits, and exact reveal boundaries.`);
