const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../sight-reading-model');
test('landmarks retain correct staff, octave and MIDI',()=>{
  const expected=[['C4',60,'treble'],['G4',67,'treble'],['F3',53,'bass']];
  expected.forEach(([name,midi,clef],i)=>{const q=M.question(0,()=>i/3);assert.equal(q.notes[0].name,name);assert.equal(q.notes[0].midi,midi);assert.equal(q.clef,clef);});
});
test('all question variants have corresponding written pitches and legal durations',()=>{
  for(let l=0;l<6;l++)for(let i=0;i<100;i++){
    const q=M.question(l,()=>i/100),xml=M.xml(q);
    assert.equal(q.notes.length,q.beats.length);
    assert.ok(q.notes.every(n=>n.midi>=36&&n.midi<=88));
    q.notes.forEach(n=>assert.ok(xml.includes(`<step>${n.step}</step><octave>${n.octave}</octave>`)));
    if(l>=4)assert.equal(q.beats.reduce((a,b)=>a+b),4);
    if(l===3)assert.equal(Number(q.answer),Math.abs(q.notes[0].position-q.notes[1].position)+1);
    if(l===5)assert.equal(q.answer.length,4);
    assert.ok(!xml.includes('<lyric>'));
  }
});
test('rhythm timing ignores start offset, scales by tempo and rejects missing or uneven taps',()=>{
  assert.equal(M.rhythmResult([.5,.5,1,2],[5000,5500,6000,7000],60).ok,true);
  assert.equal(M.rhythmResult([.5,.5,1,2],[100,350,600,1100],120).ok,true);
  assert.equal(M.rhythmResult([1,1,1,1],[0,1000,1700,3000],60).ok,false);
  assert.equal(M.rhythmResult([1,1,1,1],[0,1000],60).ok,false);
});
