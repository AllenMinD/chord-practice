const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../scale-reference-model');
const score=require('../theory-score');
test('scale notation, keyboard pitches and fingerings agree in both hands',()=>{
  for(const scale of model.scales) for(const hand of ['right','left']) {
    const demo=model.get(scale.id,hand);
    assert.equal(demo.notes.length,8);
    assert.equal(demo.notes.at(-1)-demo.notes[0],12);
    assert.equal(demo.fingers.length,8);
    demo.notes.forEach((midi,i)=>{
      assert.doesNotThrow(()=>score.pitch(midi,demo.names[i]));
      assert.ok(demo.fingers[i]>=1 && demo.fingers[i]<=5);
      if([1,3,6,8,10].includes(midi%12))assert.notEqual(demo.fingers[i],1,'thumb should land on a white key');
    });
    assert.match(score.musicXml(demo,{kind:demo.kind}),hand==='left'?/<sign>F<\/sign>/:/<sign>G<\/sign>/);
  }
});
test('all twelve major and natural minor keys have matching relative keys and key signatures',()=>{
  assert.equal(new Set(model.scales.map(s=>s.id)).size,24);
  for(const type of ['major','minor']) {
    const scales=model.scales.filter(s=>s.type===type);
    assert.equal(scales.length,12);
    assert.equal(new Set(scales.map(s=>s.root%12)).size,12);
  }
  for(const scale of model.scales) {
    const relative=model.get(scale.relativeId);
    const demo=model.get(scale.id);
    assert.equal(relative.relativeId,scale.id);
    assert.equal(relative.fifths,scale.fifths);
    assert.deepEqual([...relative.names.slice(0,7)].sort(),[...scale.names].sort());
    const altered=scale.names.filter(n=>n.length>1);
    assert.equal(altered.length,Math.abs(scale.fifths));
    assert.ok(altered.every(n=>n.endsWith(scale.fifths>0?'♯':'♭')));
    assert.deepEqual(demo.notes.slice(1).map((n,i)=>n-demo.notes[i]),
      scale.type==='major'?[2,2,1,2,2,2,1]:[2,1,2,2,1,2,2]);
  }
});
