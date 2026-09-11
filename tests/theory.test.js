const test = require("node:test");
const assert = require("node:assert/strict");
const theory = require("../theory-model.js");

test("lesson demonstrations have correctly spelled, ordered pitches and usable exercises", () => {
  const pitch = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  assert.equal(new Set(theory.lessons.map(l=>l.id)).size,14);
  for (const lesson of theory.lessons) {
    assert.ok(lesson.goal && lesson.takeaway && lesson.paragraphs.length >= 3,lesson.id);
    for (const demo of lesson.demos) {
      assert.equal(demo.notes.length,demo.names.length,`${lesson.id}: ${demo.label}`);
      demo.notes.forEach((note,i)=>{
        const name = demo.names[i];
        const accidentals = [...name.slice(1)].reduce((sum,char)=>sum+(char==="♭"?-1:char==="♯"?1:NaN),0);
        assert.equal(((pitch[name[0]]+accidentals)%12+12)%12,note%12,`${demo.label}: ${name}`);
        assert.ok(Number.isInteger(note) && note >= 48 && note <= 84);
        if(i)assert.ok(note > demo.notes[i-1],demo.label);
      });
    }
    for(const sequence of lesson.sequences || []) {
      assert.ok(sequence.indices.length >= 2);
      sequence.indices.forEach(i=>assert.ok(lesson.demos[i]));
    }
    assert.equal(lesson.questions.length,2);
    for (const question of lesson.questions) {
      assert.ok(question.hint && question.explanation);
      assert.equal(theory.assess(question,question.answer).correct,true,lesson.id);
      if(question.type === "notes") question.answer.forEach(n=>assert.ok(question.pool.includes(n)));
      else assert.ok(question.options[question.answer]);
    }
  }
});

test("quiz feedback rejects wrong thirds/sevenths and identifies missing and extra notes",()=>{
  const seventh = theory.lessons.find(l=>l.id==="sevenths").questions[1];
  assert.deepEqual(theory.assess(seventh,[60,64,67,71]),{correct:false,missing:[70],extra:[71]});
  const minor = theory.lessons.find(l=>l.id==="triads").questions[1];
  assert.deepEqual(theory.assess(minor,[60,64,67]),{correct:false,missing:[63],extra:[64]});
  assert.equal(theory.assess(minor,[]).correct,false);
  assert.equal(theory.assess(seventh,[70,67,64,60]).correct,true);
  const choice = theory.lessons[0].questions[0];
  assert.equal(theory.assess(choice,"0").correct,false);
  assert.equal(theory.assess(choice,undefined).correct,false);
});

test("progress tolerates absent, corrupt and obsolete saved values without losing valid checkpoints",()=>{
  for(const invalid of [null,undefined,[],"bad",42]) {
    const result=theory.cleanProgress(invalid);
    assert.equal(result.lastLesson,"notes");
    assert.ok(Object.values(result.checkpoints).every(n=>n===0));
  }
  const result=theory.cleanProgress({lastLesson:"missing",checkpoints:{notes:3,intervals:99,triads:-2,scale:"3",sus:1,obsolete:3}});
  assert.equal(result.checkpoints.notes,3);
  assert.equal(result.checkpoints.intervals,3);
  assert.equal(result.checkpoints.triads,0);
  assert.equal(result.checkpoints.scale,0);
  assert.equal(result.checkpoints.sus,1);
  assert.equal(result.checkpoints.obsolete,undefined);
  assert.deepEqual(theory.cleanProgress(result),result);
});

test("voicings preserve the distinctions taught by add, sus, slash and seventh symbols",()=>{
  const demo=(lesson,label)=>theory.lessons.find(l=>l.id===lesson).demos.find(d=>d.label===label).notes;
  assert.deepEqual(demo("add9","Csus2"),[60,62,67]);
  assert.deepEqual(demo("add9","Cadd9"),[60,64,67,74]);
  assert.deepEqual(demo("add9","C9"),[60,64,67,70,74]);
  assert.equal(demo("bass","C/E")[0]%12,4);
  assert.equal(demo("secondary","E7")[1]%12,8);
  assert.deepEqual(demo("diminished","Bm7♭5"),[59,62,65,69]);
  assert.deepEqual(demo("diminished","Bdim7"),[59,62,65,68]);
});
