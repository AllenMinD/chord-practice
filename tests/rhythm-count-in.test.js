const test=require('node:test');
const assert=require('node:assert/strict');
const {create}=require('../rhythm-count-in');
function setup(resume=async()=>{}) {
  const jobs=[],notes=[],beats=[];let ready=0,errors=0;
  const ctx={currentTime:10,state:'running',resume,destination:{},createOscillator(){const n={frequency:{},connect(){},disconnect(){},start(at){this.at=at;},stop(){this.stops=(this.stops||0)+1;}};notes.push(n);return n;},createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
  const control=create({getContext:()=>ctx,onBeat:n=>beats.push(n),onReady:()=>ready++,onError:()=>errors++,schedule(fn,ms){const job={fn,ms};jobs.push(job);return job;},cancel:j=>{j.cancelled=true;}});
  return {control,ctx,jobs,notes,beats,get ready(){return ready;},get errors(){return errors;}};
}
test('four audible beats follow BPM with first-beat accent and a full final beat before input',async()=>{
  for(const bpm of [60,80,100]){
    const s=setup();await s.control.start(bpm);
    assert.equal(s.notes.length,4);
    assert.ok(s.notes[0].frequency.value>s.notes[1].frequency.value);
    s.notes.forEach((n,i)=>assert.ok(Math.abs(n.at-(10.08+i*60/bpm))<1e-9));
    assert.ok(Math.abs(s.jobs[4].ms-(80+4*60000/bpm))<1e-8);
    s.jobs.slice(0,4).forEach(j=>j.fn());assert.equal(s.ready,0);assert.deepEqual(s.beats,[1,2,3,4]);
    s.jobs[4].fn();assert.equal(s.ready,1);
  }
});
test('cancel silences scheduled sources and stale callbacks cannot re-enable input',async()=>{
  const s=setup();await s.control.start(60);s.control.stop();
  assert.ok(s.jobs.every(j=>j.cancelled));assert.ok(s.notes.every(n=>n.stops===2));
  s.jobs.forEach(j=>j.fn());assert.equal(s.ready,0);assert.deepEqual(s.beats,[]);
});
test('cancellation while audio resumes prevents late count-in; errors are reported',async()=>{
  let resolve;const s=setup(()=>new Promise(r=>{resolve=r;}));const pending=s.control.start(60);s.control.stop();resolve();await pending;assert.equal(s.notes.length,0);
  const failed=setup(async()=>{throw Error('blocked');});await failed.control.start(60);assert.equal(failed.errors,1);assert.equal(failed.ready,0);
});
test('tap feedback starts immediately, survives scoring and is stopped by reset or mute',()=>{
  const s=setup();assert.equal(s.control.tap(),true);
  assert.equal(s.notes[0].at,10);assert.equal(s.notes[0].type,'triangle');
  s.control.stop({keepFeedback:true});assert.equal(s.notes[0].stops,1);
  s.control.tap();assert.equal(s.notes.length,2);
  s.control.stop();assert.ok(s.notes.every(n=>n.stops===2));
});

test('background metronome continues at the same tempo and stops with the exercise',async()=>{
  for(const bpm of [60,80,100]) {
    const s=setup();await s.control.start(bpm);
    for(let i=4;i<10;i++) {
      s.ctx.currentTime=10.08+i*60/bpm-.1;
      const pump=s.jobs.filter(j=>j.ms===50).at(-1);pump.fn();
      assert.ok(Math.abs(s.notes.at(-1).at-(10.08+i*60/bpm))<1e-8);
      assert.equal(s.notes.at(-1).frequency.value,i%4===0?1100:800);
    }
    const last=s.jobs.filter(j=>j.ms===50).at(-1),count=s.notes.length;
    s.control.stop({keepFeedback:true});last.fn();assert.equal(s.notes.length,count);
    assert.ok(s.notes.every(n=>n.stops===2));
  }
});
