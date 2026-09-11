const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../theory-model.js");
const score = require("../theory-score.js");

test("every example keeps source spelling and actual sounding pitch in both notation layouts",()=>{
  for(const lesson of model.lessons)for(const demo of lesson.demos)for(const layout of ["steps","chord"]) {
    const xml=score.musicXml(demo,{layout});
    const pitches=[...xml.matchAll(/<pitch><step>([A-G])<\/step>(?:<alter>(-?\d)<\/alter>)?<octave>(-?\d+)<\/octave><\/pitch>/g)];
    assert.equal(pitches.length,demo.notes.length,demo.label);
    pitches.forEach((match,i)=>{
      const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
      const actual=(Number(match[3])+1)*12+natural[match[1]]+Number(match[2]||0);
      assert.equal(actual,demo.notes[i],`${demo.label}: ${demo.names[i]}`);
      assert.equal(match[1],demo.names[i][0]);
    });
    assert.equal((xml.match(/<chord\/>/g)||[]).length,layout==="chord"?demo.notes.length-1:0);
    assert.equal((xml.match(/<lyric>/g)||[]).length,layout==="chord"?0:demo.notes.length);
  }
});
test("accidentals change sounding pitch without incorrectly moving the written staff position",()=>{
  assert.equal(score.pitch(60,"C").position,score.pitch(61,"C♯").position);
  assert.notEqual(score.pitch(61,"C♯").position,score.pitch(61,"D♭").position);
  assert.equal(score.pitch(59,"C♭").octave,4);
  assert.equal(score.pitch(60,"B♯").octave,3);
  assert.equal(score.positionLabel(score.pitch(60,"C"),"treble"),"下加第 1 线");
  assert.equal(score.positionLabel(score.pitch(64,"E"),"treble"),"第 1 线");
  assert.equal(score.positionLabel(score.pitch(65,"F"),"treble"),"第 1 间");
  assert.equal(score.positionLabel(score.pitch(72,"C"),"treble"),"第 3 间");
  assert.equal(score.positionLabel(score.pitch(55,"G"),"bass"),"第 4 间");
  assert.throws(()=>score.pitch(61,"C"));
});
test("blank answer staff reveals no correct notes and hiding names removes notation labels",()=>{
  const blank=score.musicXml({notes:[],names:[]});
  assert.ok(blank.includes('<note print-object="no"><rest/>'));
  assert.equal(blank.includes("<pitch>"),false);
  const hidden=score.musicXml({notes:[60,64,67],names:["C","E","G"]},{labels:false});
  assert.equal(hidden.includes("<lyric>"),false);
  assert.equal(score.clef([53,57]),"bass");
  assert.equal(score.clef([53,60]),"treble");
});
