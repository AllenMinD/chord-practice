const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {Midi}=require("@tonejs/midi");
const catalog=require("../practice-catalog.js"),factory=require("../practice-model.js");

test("all song lessons use the shared practice model with stable links",()=>{
  for(const song of ["Just the Two of Us","Imagine","Wonderwall","Dreams","晴天","遇见","爱爱爱"])assert.ok(catalog.forSong(song));
  assert.equal(new Set(catalog.studies.map(s=>s.config.id)).size,catalog.studies.length);
  assert.equal(new Set(catalog.studies.map(s=>s.config.song)).size,catalog.studies.length);
  for(const study of catalog.studies){
    assert.equal(catalog.forSong(study.config.song),study);
    assert.equal(catalog.fromAnchor(`#${catalog.anchor(study)}`),study);
    assert.ok(study.voicings[study.config.defaultLesson]);
    for(const field of ["description","sectionLabel","simplification","sourceLabel","sourceNotice","tuning"])assert.ok(study.config[field]);
  }
  assert.equal(catalog.anchor(catalog.studies[0]),"just-two-study");
  assert.equal(catalog.forSong("Not a song"),undefined);
});

for(const study of catalog.studies.slice(1)){
  test(`${study.config.song}: melody is traceable to the archived source and declared transposition`,()=>{
    const source=study.data.source;
    const bytes=fs.readFileSync(path.join(__dirname,"../assets/reference",source.file));
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),source.sha256);
    if(source.format==='score'){
      const transcription=fs.readFileSync(path.join(__dirname,'..',source.transcriptionFile));
      assert.equal(crypto.createHash('sha256').update(transcription).digest('hex'),source.transcriptionSha256);
      for(const page of source.pages){
        const image=fs.readFileSync(path.join(__dirname,'../assets/reference',page.file));
        assert.equal(image.subarray(1,4).toString(),'PNG');
        assert.equal(crypto.createHash('sha256').update(image).digest('hex'),page.sha256);
      }
      for(const note of study.data.melody){
        assert.equal(note.midi,note.sourceMidi+source.transpose);
        assert.equal(note.duration,note.sourceSegments.reduce((sum,s)=>sum+s.duration,0));
        let cursor=note.start;
        for(const segment of note.sourceSegments){
          assert.ok(source.pages.some(page=>page.measures.includes(segment.measure)));
          assert.equal(segment.midi,note.sourceMidi);
          assert.equal((segment.measure-source.firstMeasure)*16+segment.offset,cursor);
          cursor+=segment.duration;
        }
      }
      assert.equal(study.barCount,source.lastMeasure-source.firstMeasure+1);
      return;
    }
    const midi=new Midi(bytes),track=midi.tracks[source.trackIndex];
    assert.equal(track.instrument.name,source.instrument);
    assert.ok(study.data.melody.length>0);
    for(const note of study.data.melody){
      assert.ok(track.notes.some(n=>n.ticks===note.sourceTick&&n.midi===note.sourceMidi&&n.durationTicks===note.sourceDuration));
      assert.equal(note.midi,note.sourceMidi+note.transpose+note.octaveShift+note.bendShift);
      assert.equal(note.start,Math.max(0,Math.round((note.sourceTick-source.startTick)/(source.ppq/4))));
      assert.equal(note.transpose,source.transpose);assert.equal(note.octaveShift,source.octaveShift);
    }
  });
}

test("each score has complete simultaneous staff durations and preserves melody attacks",()=>{
  for(const study of catalog.studies){
    const xml=study.musicXml(new Set([study.config.defaultLesson]));
    const measures=[...xml.matchAll(/<measure number="\d+">([\s\S]*?)<\/measure>/g)];
    assert.equal(measures.length,study.barCount);
    for(const [,measure] of measures){
      const totals={1:0,2:0};
      for(const [note] of measure.matchAll(/<note\b[\s\S]*?<\/note>/g)){
        if(note.includes("<chord/>"))continue;
        totals[Number(note.match(/<staff>(\d)<\/staff>/)[1])]+=Number(note.match(/<duration>(\d+)<\/duration>/)[1]);
      }
      assert.deepEqual(totals,{1:16,2:16},study.config.id);
    }
    assert.equal(study.playbackEvents("right").length,study.data.melody.length);
    assert.equal(study.melodyFragments().reduce((sum,n)=>sum+n.duration,0),study.totalTicks);
    assert.ok(xml.includes(study.colors.learned));
  }
});

test("every current chord can be left empty without muting melody or unrelated chords",()=>{
  for(const study of catalog.studies){
    for(const chord of Object.keys(study.voicings)){
      for(const range of [[0,study.totalTicks],[7.5,16],[study.totalTicks/2,study.totalTicks]]){
        const events=study.playbackEvents("both",range);
        assert.deepEqual(study.playbackEvents("both",range,chord),events.filter(n=>n.hand!=="left"||n.chord!==chord));
      }
    }
  }
});

test("chord labels and short harmonic changes retain their actual meaning",()=>{
  const imagine=catalog.forSong("Imagine"),wonderwall=catalog.forSong("Wonderwall"),dreams=catalog.forSong("Dreams");
  assert.equal(imagine.chordAt(11).chord,"C");assert.equal(imagine.chordAt(12).chord,"Cmaj7");assert.equal(imagine.chordAt(16).chord,"F");
  assert.equal(wonderwall.chordAt(70).chord,"Cadd9");assert.equal(wonderwall.chordAt(71).chord,"Dsus4");
  const xml=wonderwall.musicXml();
  assert.ok(xml.includes('<kind text="m7" use-symbols="no">minor-seventh</kind>'));
  assert.ok(xml.includes('<kind text="sus4" use-symbols="no">suspended-fourth</kind>'));
  assert.ok(xml.includes('<degree-value>9</degree-value>'));
  assert.ok(xml.includes('<degree-value>7</degree-value><degree-alter>-1</degree-alter>'));
  assert.equal(wonderwall.labelId("Asus4(b7)"),"A7sus4");assert.equal(wonderwall.labelId("C(9)"),"Cadd9");
  assert.equal(dreams.chordAt(16).chord,"G");assert.equal(dreams.voicings.G6,undefined);
});

test("future songs can have a different bar count and harmony crossing a bar line",()=>{
  const config=structuredClone(catalog.forSong("Imagine").config);
  config.id="synthetic-validation";config.data.beats=24;
  config.data.melody=[{id:"held",start:0,duration:96,midi:67}];
  config.harmony=[{chord:"C",start:0,duration:20},{chord:"F",start:20,duration:76}];
  const study=factory.create(config);
  assert.equal(study.barCount,6);assert.equal(study.totalTicks,96);
  assert.equal((study.musicXml().match(/<measure number=/g)||[]).length,6);
  assert.equal(study.playbackEvents("right").length,1);
  assert.equal(study.playbackEvents("left").reduce((sum,n)=>sum+n.duration,0),96);
  assert.ok(study.melodyFragments().at(-1).tieStop);
});

test("incomplete new songs fail validation rather than becoming misleading exercises",()=>{
  const copy=()=>structuredClone(catalog.forSong("Imagine").config);
  let config=copy();delete config.data.source;assert.throws(()=>factory.create(config),/provenance/);
  config=copy();config.harmony[1].start++;assert.throws(()=>factory.create(config),/Harmony/);
  config=copy();config.data.melody[1].start=config.data.melody[0].start;assert.throws(()=>factory.create(config),/Melody/);
  config=copy();config.data.beats=31;assert.throws(()=>factory.create(config),/4\/4/);
});


test("Chinese excerpts retain checked melodic motifs, ties, rests and honest arrangement labels",()=>{
  const jay=catalog.forSong('晴天'),sun=catalog.forSong('遇见'),fong=catalog.forSong('爱爱爱');
  assert.deepEqual(jay.data.melody.slice(0,9).map(n=>n.midi),[62,67,67,71,72,71,69,67,69]);
  assert.deepEqual(sun.data.melody.slice(0,7).map(n=>[n.midi,n.duration]),[[69,2],[71,2],[72,2],[71,4],[72,2],[74,2],[76,6]]);
  assert.deepEqual(fong.data.melody.slice(0,8).map(n=>[n.midi,n.duration]),[[73,16],[74,2],[76,2],[74,2],[73,4],[71,2],[69,2],[71,2]]);
  assert.equal(fong.noteName(73,'Em7'),'C♯');assert.equal(jay.noteName(66,'G'),'F♯');
  assert.equal(fong.chordAt(16).chord,'Em7');assert.equal(fong.chordAt(24).chord,'A');
  assert.equal(fong.config.tempoLabel,'练习速度');
  for(const study of [jay,sun])assert.match(study.config.simplification,/教学|另配/);
  // Melody across the Fmaj7 → G boundary stays a single audio attack;
  // its score changes from an unselected E to a selected chord tone only where appropriate.
  const held=sun.data.melody.find(n=>n.start===14);assert.equal(held.duration,6);
  assert.equal(sun.playbackEvents('right').filter(n=>n.start===16).length,0);
  assert.equal(sun.related(76,'Fmaj7'),true);assert.equal(sun.related(76,'G'),false);
  assert.ok(sun.musicXml(new Set(['Fmaj7'])).includes('<tie type="stop"/>'));
});
