const test = require("node:test");
const assert = require("node:assert/strict");
const course = require("../beginner-model.js");

test("chord spellings and the one-note changes match the teaching", () => {
  assert.deepEqual(course.getChord("Cm").midi,[60,63,67]);
  assert.deepEqual(course.getChord("Fm").midi,[65,68,72]);
  assert.deepEqual(course.getChord("Cmaj7").midi,[60,64,67,71]);
  assert.deepEqual(course.getChord("C7").midi,[60,64,67,70]);
  assert.deepEqual(course.getChord("Cm7").midi,[60,63,67,70]);
  for (const lesson of course.lessons) for (const step of lesson.steps) {
    assert.ok(course.expected(step).every(n => n >= 60 && n <= 72), `${step.id} must fit the visible keyboard`);
    if(step.from) {
      const from = course.getChord(step.from).midi;
      const to = course.expected(step);
      assert.ok(to.filter(n => !from.includes(n)).length <= 1,`${step.id} introduces at most one changed note`);
    }
  }
});

test("find-a-key checks one note, while chord questions reject both missing and extra notes", () => {
  const [find,build] = course.lessons[0].steps;
  assert.equal(course.assess(find,[60]).correct,true);
  assert.equal(course.assess(find,[60,64,67]).correct,false);
  assert.equal(course.assess(build,[67,60,64]).correct,true);
  assert.deepEqual(course.assess(build,[60,63,67]),{correct:false,missing:[64],extra:[63]});
  assert.equal(course.assess(build,[]).correct,false);
});

test("progress cannot skip an unfinished step and completion requires the final duet", () => {
  let state = course.freshProgress();
  state = course.completeStep(state,"first",5,true,"2026-09-07");
  assert.equal(state.checkpoints.first,0);
  for(let i=0;i<6;i++) state = course.completeStep(state,"first",i,true,"2026-09-07");
  assert.equal(state.checkpoints.first,6);
  assert.equal(state.completedOn.first,undefined);
  state = course.completeStep(state,"first",6,true,"2026-09-07");
  assert.equal(state.completedOn.first,"2026-09-07");
  assert.deepEqual(state.practiceDays,["2026-09-07"]);
});

test("using hints does not claim independent recall; review must happen on a later day", () => {
  let state = course.freshProgress();
  for(let i=0;i<3;i++) state = course.completeStep(state,"first",i,true,"2026-09-07");
  state = course.completeStep(state,"first",3,false,"2026-09-07");
  assert.equal(state.recalls.C,undefined);
  state = course.completeStep(state,"first",3,true,"2026-09-07");
  assert.equal(state.recalls.C.reviewed,false);
  state = course.completeStep(state,"first",3,true,"2026-09-07");
  assert.equal(state.recalls.C.reviewed,false);
  state = course.completeStep(state,"first",3,true,"2026-09-08");
  assert.equal(state.recalls.C.reviewed,true);
  assert.equal(state.checkpoints.first,4);
});

test("stored progress tolerates missing, old, and malformed records", () => {
  assert.deepEqual(course.cleanProgress(null),course.freshProgress());
  assert.deepEqual(course.cleanProgress({version:0}),course.freshProgress());
  const state = course.cleanProgress({version:1,checkpoints:{first:999,move:-5,sevenths:"oops"},recalls:{C:{date:"bad"}},practiceDays:["2026-09-07","2026-09-07",null,{}]});
  assert.equal(state.checkpoints.first,7);
  assert.equal(state.checkpoints.move,0);
  assert.equal(state.checkpoints.sevenths,0);
  assert.deepEqual(state.recalls,{});
  assert.deepEqual(state.practiceDays,["2026-09-07"]);
});

test("the independent practice pool grows with completed teaching, not future lessons", () => {
  let state = course.freshProgress();
  assert.deepEqual(course.learnedChords(state).map(c => c.id),["C","Cm"]);
  state.checkpoints = {first:7,move:4,sevenths:0};
  assert.deepEqual(course.learnedChords(state).map(c => c.id),["C","Cm","F","Fm"]);
  state.checkpoints.sevenths = 1;
  assert.ok(course.learnedChords(state).some(c => c.id === "Cmaj7"));
  assert.ok(!course.learnedChords(state).some(c => c.id === "C7"));
});
