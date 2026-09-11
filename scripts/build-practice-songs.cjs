// Reproducible, short local-study excerpts. See PRACTICE_SONGS.md.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {Midi}=require('@tonejs/midi');
const root=path.resolve(__dirname,'..');
const voicings={
 A:{label:'A',notes:[45,49,52],names:['A','C♯','E'],kind:'major',root:'A'},
 D:{label:'D',notes:[50,54,57],names:['D','F♯','A'],kind:'major',root:'D'},
 Am:{label:'Am',notes:[45,48,52],names:['A','C','E'],kind:'minor',kindText:'m',root:'A'},
 Bm:{label:'Bm',notes:[47,50,54],names:['B','D','F♯'],kind:'minor',kindText:'m',root:'B'},
 Csm:{label:'C♯m',notes:[49,52,56],names:['C♯','E','G♯'],kind:'minor',kindText:'m',root:'C',alter:1},
 C:{label:'C',notes:[48,52,55],names:['C','E','G'],kind:'major',root:'C'},
 Cmaj7:{label:'Cmaj7',notes:[48,52,55,59],names:['C','E','G','B'],kind:'major-seventh',root:'C'},
 F:{label:'F',notes:[53,57,60],names:['F','A','C'],kind:'major',root:'F'},
 Fmaj7:{label:'Fmaj7',notes:[53,57,60,64],names:['F','A','C','E'],kind:'major-seventh',root:'F'},
 G:{label:'G',notes:[55,59,62],names:['G','B','D'],kind:'major',root:'G'},
 Em7:{label:'Em7',notes:[52,55,59,62],names:['E','G','B','D'],kind:'minor-seventh',root:'E'},
 Dsus4:{label:'Dsus4',notes:[50,55,57],names:['D','G','A'],kind:'suspended-fourth',root:'D'},
 A7sus4:{label:'A7sus4',scoreAliases:['Asus4(b7)'],notes:[45,50,52,55],names:['A','D','E','G'],kind:'suspended-fourth',kindText:'7sus4',degree:{value:7,alter:-1,type:'add'},root:'A'},
 Cadd9:{label:'Cadd9',scoreAliases:['C(9)'],notes:[48,52,55,62],names:['C','E','G','D'],kind:'major',kindText:'add9',degree:{value:9,alter:0,type:'add'},root:'C'}
};
const specs=[
 {id:'imagine',song:'Imagine',defaultLesson:'Cmaj7',sectionLabel:'主歌旋律',bpm:73,file:'imagine-melody.mid',track:8,startBeat:20,beats:32,transpose:0,octaveShift:0,
 url:'https://bitmidi.com/john-lennon-imagine-mid',sourceLabel:'BitMidi · John Lennon - Imagine.mid',
 description:'右手弹出熟悉的主歌旋律，左手在 C、Cmaj7 与 F 之间转换。留意每两小节中，Cmaj7 只在第一个小节的最后一拍出现。',
 tuning:'C 大调 · 主歌节选',
 simplification:'从公开 MIDI 编配的 harmonica 主旋律轨提取 8 小节，保留音高顺序、休止与长音，节奏整理到十六分音符。左手将原编配的钢琴脉冲简化为 C–Cmaj7–F；省略起始的 D 色彩音与装饰性低音。这里是主歌旋律的钢琴简化版，不是原曲录音。',
 harmony:Array.from({length:4},(_,i)=>[['C',i*32,12],['Cmaj7',i*32+12,4],['F',i*32+16,16]]).flat()},
 {id:'wonderwall',song:'Wonderwall',defaultLesson:'Em7',sectionLabel:'主歌旋律',bpm:87,file:'wonderwall-demo.mid',track:8,startBeat:12,beats:32,transpose:-2,octaveShift:0,
 url:'https://www.mididb.com/oasis/wonderwall-midi/',sourceLabel:'MIDIdb 免费 Demo · AUD_HO0971.mid',
 description:'右手保留主歌的重复音与切分，左手接住吉他和声。先听完整旋律，再练 Em7、Dsus4 或 Cadd9 出现时的接力。',
 tuning:'教学调 E 小调 · 比源 MIDI 低全音',
 simplification:'从 Demo 的 oboe 主旋律轨提取 8 小节，全曲统一降低两个半音，对应本课 Em7、Dsus4 与 Cadd9 的键位；源 MIDI 是 F♯ 小调，原录音变调夹后的实际音高也更高。保留旋律走向与切分，滑音取稳定音高，速度固定为 87。吉他扫弦简化为左手紧凑和弦，Dsus4 省去持续的 E 色彩音，转位统一为根音在下；Cadd9 后提前进入 Dsus4 的位置保留。',
 harmony:[['Em7',0,8],['G',8,8],['Dsus4',16,8],['A7sus4',24,8],['Em7',32,8],['G',40,8],['Dsus4',48,8],['A7sus4',56,8],['Cadd9',64,7],['Dsus4',71,9],['A7sus4',80,16],['Em7',96,8],['G',104,8],['Dsus4',112,8],['A7sus4',120,8]]},
 {id:'dreams',song:'Dreams',defaultLesson:'Fmaj7',sectionLabel:'副歌旋律',bpm:120,file:'dreams-melody.mid',track:2,startBeat:104,beats:32,transpose:0,octaveShift:12,
 url:'https://www.midis101.com/free-midi/45440-fleetwood-mac-dreams',sourceLabel:'Midis101 · Fleetwood Mac Dreams',
 description:'右手弹副歌旋律，左手在 Fmaj7 与 G 之间轻轻摆动。先保持长音和休止，再找到每次 Fmaj7 落下的位置。',
 tuning:'原音级 · 旋律提高一个八度',
 simplification:'从公开 MIDI 编配的 Melody / flute 轨提取副歌 8 小节，整体提高一个八度，便于右手弹奏。保留音高顺序、切分和休止，时值整理到十六分音符，末尾跨出节选的长音在谱尾收住。左手取该编配的 Fmaj7–G 交替和声并简化排列；此版本的 G 没有加入 E，因此准确标为 G。',
 harmony:Array.from({length:8},(_,i)=>[i%2?'G':'Fmaj7',i*16,16])}
];
function bendRange(track,at){
 let msb=127,lsb=127,range=2;
 const events=[100,101,6].flatMap(cc=>(track.controlChanges[cc]||[]).map(e=>({...e,cc}))).sort((a,b)=>a.ticks-b.ticks);
 for(const e of events){if(e.ticks>at)break;const value=Math.round(e.value*127);if(e.cc===101)msb=value;else if(e.cc===100)lsb=value;else if(msb===0&&lsb===0)range=value;}
 return range;
}
function bendShift(track,n){
 let cursor=n.ticks,value=track.pitchBends.filter(b=>b.ticks<=cursor).at(-1)?.value||0;
 const end=n.ticks+n.durationTicks,weights=new Map(),range=bendRange(track,cursor);
 for(const b of [...track.pitchBends.filter(b=>b.ticks>cursor&&b.ticks<end),{ticks:end,value}]){
  const shift=Math.round(value*range);weights.set(shift,(weights.get(shift)||0)+b.ticks-cursor);cursor=b.ticks;value=b.value;
 }
 return [...weights].sort((a,b)=>b[1]-a[1])[0][0];
}
const configs=specs.map(spec=>{
 const bytes=fs.readFileSync(path.join(root,'assets/reference',spec.file)),midi=new Midi(bytes),track=midi.tracks[spec.track],ppq=midi.header.ppq;
 const startTick=spec.startBeat*ppq,endTick=startTick+spec.beats*ppq,unit=ppq/4;
 const melody=track.notes.filter(n=>Math.round((n.ticks-startTick)/unit)>=0&&Math.round((n.ticks-startTick)/unit)<spec.beats*4&&n.durationTicks>=unit*.35).map((n,i)=>{
  const bend=bendShift(track,n);
  return {id:`melody-${i}`,start:Math.round((n.ticks-startTick)/unit),duration:Math.max(1,Math.round(n.durationTicks/unit)),midi:n.midi+spec.transpose+spec.octaveShift+bend,sourceTick:n.ticks,sourceMidi:n.midi,sourceDuration:n.durationTicks,transpose:spec.transpose,octaveShift:spec.octaveShift,bendShift:bend};
 });
 melody.forEach((n,i)=>n.duration=Math.min(n.duration,(melody[i+1]?.start??spec.beats*4)-n.start,spec.beats*4-n.start));
 if(melody.some(n=>n.duration<=0))throw Error(`Overlapping melody quantization in ${spec.id}; inspect the source instead of inventing notes.`);
 const used=[...new Set(spec.harmony.map(h=>h[0]))];
 return {id:spec.id,song:spec.song,defaultLesson:spec.defaultLesson,sectionLabel:spec.sectionLabel,description:spec.description,tuning:spec.tuning,sourceLabel:spec.sourceLabel,simplification:spec.simplification,
 sourceNotice:spec.id==='wonderwall'?'来源页注明允许下载 Demo；此节选保留在本机学习原型中。':'来自公开提供的 MIDI 编配，仅用于本机学习节选；不代表原曲录音或公开发行授权。',
 data:{title:`${spec.song} · ${spec.sectionLabel}钢琴练习`,bpm:spec.bpm,beats:spec.beats,divisions:4,
 source:{url:spec.url,file:spec.file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),startTick,endTick,ppq,trackIndex:spec.track,instrument:track.instrument.name,transpose:spec.transpose,octaveShift:spec.octaveShift},melody},
 voicings:Object.fromEntries(used.map(id=>[id,voicings[id]])),harmony:spec.harmony.map(([chord,start,duration])=>({chord,start,duration}))};
});
// A sheet source has its own provenance; it must not pretend to be a MIDI track.
const scoreFile='scripts/score-excerpts.cjs';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const pitch=name=>{const m=/^([A-G])([#b]?)([0-8])$/.exec(name);if(!m)throw Error(`Invalid written pitch ${name}`);return (Number(m[3])+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+({'#':1,b:-1}[m[2]]||0);};
for(const spec of require('./score-excerpts.cjs')){
 const pages=spec.pages.map(page=>({...page,sha256:sha(fs.readFileSync(path.join(root,'assets/reference',page.file)))}));
 const melody=[];let position=0;
 spec.measures.forEach((measure,bar)=>{
  let offset=0;
  for(const [written,duration,tied=false] of measure){
   if(!Number.isInteger(duration)||duration<=0)throw Error(`Invalid score duration in ${spec.id}`);
   if(written){
    const sourceMidi=pitch(written),segment={measure:spec.firstMeasure+bar,offset,duration,written,midi:sourceMidi};
    if(tied){const prev=melody.at(-1);if(!prev||prev.start+prev.duration!==position||prev.sourceMidi!==sourceMidi)throw Error(`Invalid score tie in ${spec.id}`);prev.duration+=duration;prev.sourceSegments.push(segment);}
    else melody.push({id:`melody-${melody.length}`,start:position,duration,midi:sourceMidi+spec.transpose,sourceMidi,transpose:spec.transpose,octaveShift:0,sourceSegments:[segment]});
   }else if(tied)throw Error('A rest cannot be tied');
   position+=duration;offset+=duration;
  }
  if(offset!==16)throw Error(`Incomplete score measure ${spec.id}/${bar+spec.firstMeasure}: ${offset}`);
 });
 const used=[...new Set(spec.harmony.map(h=>h[0]))];
 configs.push({pitchNames:spec.pitchNames,id:spec.id,song:spec.song,artist:spec.artist,defaultLesson:spec.defaultLesson,sectionLabel:spec.sectionLabel,description:spec.description,tuning:spec.tuning,tempoLabel:spec.tempoLabel,sourceLabel:spec.sourceLabel,simplification:spec.simplification,
  sourceNotice:'来源为公开提供的网友改编谱，仅作本机个人学习的短节选；保留原预览与署名，不是原曲录音。',
  data:{title:`${spec.song} · ${spec.sectionLabel}钢琴练习`,bpm:spec.bpm,beats:position/4,divisions:4,
   source:{format:'score',url:spec.url,file:pages[0].file,sha256:pages[0].sha256,pages,firstMeasure:spec.firstMeasure,lastMeasure:spec.firstMeasure+spec.measures.length-1,voice:'右手主旋律声部',transpose:spec.transpose,octaveShift:0,transcriptionFile:scoreFile,transcriptionSha256:sha(fs.readFileSync(path.join(root,scoreFile)))},melody},
  voicings:Object.fromEntries(used.map(id=>[id,voicings[id]])),harmony:spec.harmony.map(([chord,start,duration])=>({chord,start,duration}))});
}
fs.writeFileSync(path.join(root,'practice-song-data.js'),`// Generated by scripts/build-practice-songs.cjs. Local study excerpts.\n(function(root){const songs=${JSON.stringify(configs,null,2)};if(typeof module!=="undefined"&&module.exports)module.exports=songs;else root.PracticeSongData=songs;})(typeof globalThis!=="undefined"?globalThis:this);\n`);
for(const c of configs)console.log(`${c.song}: ${c.data.melody.length} melody notes / ${c.data.beats/4} bars`);
