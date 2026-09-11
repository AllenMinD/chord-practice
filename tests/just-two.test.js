const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {Midi}=require("@tonejs/midi");
const study=require("../just-two-model");

test("study is traceable to the downloaded saxophone melody, preserving its note order",()=>{
  const source=new Midi(fs.readFileSync(require.resolve("../assets/reference/just-the-two-of-us-demo.mid")));
  const track=source.tracks[study.data.source.trackIndex];
  assert.equal(track.instrument.name,"tenor sax");
  assert.equal(study.data.melody.length,46);
  const sha=require("node:crypto").createHash("sha256").update(fs.readFileSync(require.resolve("../assets/reference/just-the-two-of-us-demo.mid"))).digest("hex");
  assert.equal(sha,study.data.source.sha256);
  for(const n of study.data.melody){
    const original=track.notes.find(x=>x.ticks===n.sourceTick&&x.midi===n.sourceMidi);
    assert.ok(original);
    assert.ok(Math.abs(n.start-(n.sourceTick-study.data.source.startTick)/120)<=.5);
    assert.ok(Math.abs(n.midi-n.octaveShift-n.sourceMidi)<=1,"piano transcription uses sustained bend pitch, not an invented melody");
  }
});

test("melody contains the reference's syncopation, rests, and full beat coverage",()=>{
  assert.ok(study.data.melody.some(n=>n.start%4!==0));
  assert.ok(new Set(study.data.melody.map(n=>n.duration)).size>=4);
  assert.ok(study.melodyFragments().some(n=>n.rest));
  const fragments=study.melodyFragments();
  for(let measure=0;measure<8;measure++)assert.equal(fragments.filter(n=>Math.floor(n.start/16)===measure).reduce((sum,n)=>sum+n.duration,0),16);
  for(let i=1;i<fragments.length;i++)assert.equal(fragments[i].start,fragments[i-1].start+fragments[i-1].duration);
});

test("score subdivisions preserve tied melody notes and do not create extra attacks",()=>{
  for(const n of study.data.melody){
    const fragments=study.melodyFragments().filter(f=>f.id===n.id);
    assert.equal(fragments.reduce((total,f)=>total+f.duration,0),n.duration);
    assert.equal(study.playbackEvents("right").filter(e=>e.id===n.id).length,1);
    if(fragments.length>1){assert.ok(fragments[0].tieStart);assert.ok(fragments.at(-1).tieStop);}
  }
});

test("left-hand chord pitches and durations match the source harmony",()=>{
  assert.deepEqual(study.harmony.slice(0,4).map(h=>h.chord),["Dbmaj7","C7","Bmaj7","Bb7"]);
  assert.equal(study.harmony.at(-1).start+study.harmony.at(-1).duration,128);
  assert.ok(!study.harmony.some(h=>h.chord==="Fm7"));
  const source=new Midi(fs.readFileSync(require.resolve("../assets/reference/just-the-two-of-us-demo.mid")));
  for(const h of study.harmony){
    const tick=3840+h.start*120;
    const sourceNotes=source.tracks[1].notes.filter(n=>Math.abs(n.ticks-tick)<40);
    const original=[...new Set(sourceNotes.map(n=>n.midi%12))].sort((a,b)=>a-b);
    const voicing=[...new Set(h.notes.map(n=>n%12))].sort((a,b)=>a-b);
    assert.deepEqual(voicing,original,`harmony at ${h.start} retains source pitch classes`);
  }
});

test("highlighting follows current harmony and learned status, not entire bars",()=>{
  assert.equal(study.chordAt(7).chord,"Dbmaj7");assert.equal(study.chordAt(8).chord,"C7");
  assert.equal(study.related(72,"Dbmaj7"),true);assert.equal(study.related(70,"Dbmaj7"),false);
  assert.equal(study.related(70,"C7"),true);
  assert.ok(!study.musicXml().includes(study.colors.learned));
  const xml=study.musicXml(new Set(["C7"]));
  assert.ok(xml.includes(study.colors.learned));
  assert.equal((xml.match(/<measure number=/g)||[]).length,8);
  assert.ok(xml.includes('<backup><duration>16</duration></backup>'));
  assert.equal(study.labelId("Dbmaj7"),"Dbmaj7");
  assert.equal(study.labelId("D♭maj7"),"Dbmaj7");
  assert.equal(study.labelId("Ab7/Gb"),"Ab7/Gb");
  assert.equal(study.labelId("Piano"),undefined);
});

test("solo, clipped ranges, pause positions, and loop boundaries return only playable events",()=>{
  assert.ok(study.playbackEvents("right").every(n=>n.hand==="right"));
  assert.ok(study.playbackEvents("left").every(n=>n.hand==="left"));
  for(const range of [[0,16],[0,64],[64,128],[9.5,64]]){
    const events=study.playbackEvents("both",range);
    assert.ok(events.length);
    assert.ok(events.every(n=>n.start>=0&&n.duration>0&&n.start+n.duration<=range[1]-range[0]));
  }
});

test("manual accompaniment leaves only the current chord empty and keeps the melody on time",()=>{
  for(const range of [[0,128],[0,16],[64,128],[9.5,64]]){
    const full=study.playbackEvents("both",range);
    for(const chord of ["C7","Dbmaj7"]){
      const manual=study.playbackEvents("both",range,chord);
      assert.deepEqual(manual,full.filter(n=>n.hand!=="left"||n.chord!==chord));
      assert.deepEqual(manual.filter(n=>n.hand==="right"),study.playbackEvents("right",range));
      assert.ok(!study.playbackEvents("left",range,chord).some(n=>n.chord===chord));
    }
    assert.deepEqual(study.playbackEvents("both",range,"Fm7"),full,"an absent lesson chord never mutes other chords");
    assert.deepEqual(study.playbackEvents("both",range,null),full,"turning manual input off restores accompaniment");
  }
});
