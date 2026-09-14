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
