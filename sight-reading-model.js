(function(root){
  'use strict';
  const letters='CDEFGAB', semitones=[0,2,4,5,7,9,11];
  const levels=[
    {title:'地标音',desc:'先记住中央 C、高音谱号的 G、低音谱号的 F。线与间都从下往上数。',kind:'note'},
    {title:'高音谱表',desc:'从中央 C 到高音 F：相邻线与间相差一个音名。先找地标，再向上或向下数。',kind:'note'},
    {title:'低音与加线',desc:'低音谱号两点夹住第四线 F3。注意谱号变化；上下加线也是五线谱的延伸。',kind:'note'},
    {title:'看音程形状',desc:'相邻线与间是二度；线到相邻线、间到相邻间是三度。这里判断几度，不区分大小。',kind:'interval'},
    {title:'节奏先行',desc:'4/4 拍中四分音符 1 拍，二分音符 2 拍，八分音符半拍。先数「1 和 2 和 3 和 4 和」，再按节奏敲击。',kind:'rhythm'},
    {title:'连续读谱',desc:'先默读整组，再依次输入音名；眼睛尝试比手提前一个音。此关练音高连续识读，节拍在上一关练习。',kind:'sequence'}
  ];
  function note(position){const octave=Math.floor(position/7),i=((position%7)+7)%7;return {position,name:letters[i]+octave,step:letters[i],octave,midi:(octave+1)*12+semitones[i]};}
  function pool(level){return level===0?[{p:28,clef:'treble'},{p:32,clef:'treble'},{p:24,clef:'bass'}]:Array.from({length:level===2?15:11},(_,i)=>({p:(level===2?16:28)+i,clef:level===2?'bass':'treble'}));}
  function question(level,random=Math.random){
    const pick=a=>a[Math.min(a.length-1,Math.floor(random()*a.length))];
    const entry=pick(pool(level));let notes=[note(entry.p)],beats=[1];
    if(level===3){const delta=pick([-4,-3,-2,-1,1,2,3,4]);notes.push(note(entry.p+delta));beats=[1,1];}
    if(level===4){beats=pick([[1,1,1,1],[2,1,1],[1,2,1],[.5,.5,1,2],[1,.5,.5,1,1]]);notes=beats.map(()=>note(32));}
    if(level===5){const base=pick([28,30,32]);notes=[0,1,2,1].map((d,i)=>note(base+(random()>.5?d:-d)));beats=[1,1,1,1];}
    return {level,clef:entry.clef,notes,beats,answer:level===3?String(Math.abs(notes[1].position-notes[0].position)+1):notes.map(n=>n.step).join('')};
  }
  function xml(q){const types={'.5':'eighth','0.5':'eighth','1':'quarter','2':'half'};return `<?xml version="1.0"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name>读谱训练</part-name></score-part></part-list><part id="P1"><measure number="1" implicit="yes"><attributes><divisions>2</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>${q.clef==='bass'?'F':'G'}</sign><line>${q.clef==='bass'?4:2}</line></clef></attributes>${q.notes.map((n,i)=>`<note><pitch><step>${n.step}</step><octave>${n.octave}</octave></pitch><duration>${q.beats[i]*2}</duration><type>${types[q.beats[i]]}</type></note>`).join('')}<barline location="right"><bar-style>light-heavy</bar-style></barline></measure></part></score-partwise>`;}
  function rhythmResult(beats,taps,bpm){const unit=60000/bpm;const errors=taps.slice(1).map((t,i)=>Math.abs(t-taps[i]-beats[i]*unit)/unit);return {ok:taps.length===beats.length&&errors.every(e=>e<=.25),error:errors.length?Math.round(errors.reduce((a,b)=>a+b,0)/errors.length*100):0};}
  const api={levels,note,pool,question,xml,rhythmResult};if(typeof module!=='undefined')module.exports=api;root.SightReading=api;
})(typeof window!=='undefined'?window:globalThis);
