(function(root){
  "use strict";
  function create(config){
    const data=config.data,totalTicks=data.beats*4,barCount=totalTicks/16;
    if(!config.id||!config.song||!data.source?.url||!data.source?.sha256||!data.melody?.length)throw Error("Practice songs require identity, source provenance and a melody.");
    if(!Number.isInteger(barCount)||barCount<2||!Number.isFinite(data.bpm)||data.bpm<=0)throw Error("Practice songs must have complete 4/4 bars and a valid tempo.");
    for(const v of Object.values(config.voicings)){
      if(!v.label||!v.kind||!v.root||!v.notes?.length||v.notes.length!==v.names?.length||v.notes.some(n=>!Number.isInteger(n)||n<0||n>127))throw Error("Chord voicings require matching names, pitches and MusicXML chord kinds.");
    }
    let end=0;
    for(const h of config.harmony){
      if(h.start!==end||!Number.isInteger(h.duration)||h.duration<=0||!config.voicings[h.chord])throw Error("Harmony must cover the study without gaps or unknown chord symbols.");
      end=h.start+h.duration;
    }
    if(end!==totalTicks)throw Error("Harmony duration must match the study.");
    end=0;
    for(const n of data.melody){
      if(!Number.isInteger(n.start)||!Number.isInteger(n.duration)||n.duration<=0||n.start<end||n.start+n.duration>totalTicks||!Number.isInteger(n.midi)||n.midi<0||n.midi>127)throw Error("Melody notes must be valid, ordered, non-overlapping and within the study.");
      end=n.start+n.duration;
    }
  const colors = { learned:"#287143", ink:"#292820", other:"#746F63" };
  const voicings=config.voicings;
  const harmony=config.harmony.map((h,i)=>({...h,id:h.id||`harmony-${i}`,notes:voicings[h.chord].notes}));
  const chordAt = tick => harmony.find(h => tick >= h.start && tick < h.start+h.duration);
  function noteName(midi,chord) {
    const v = voicings[chord];
    const i = v?.notes.findIndex(n => n%12 === midi%12) ?? -1;
    return i>=0 ? v.names[i] : config.pitchNames?.[midi%12] || ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"][midi%12];
  }
  const related = (midi,chord) => voicings[chord]?.notes.some(n=>n%12===midi%12) || false;
  const normalizeSymbol = value => value.replaceAll("♭","b").replaceAll("♯","#").replace(/\s+/g,"");
  const labelId = value => Object.keys(voicings).find(id=>[voicings[id].label,...(voicings[id].scoreAliases||[])].some(label=>normalizeSymbol(label)===normalizeSymbol(value)));
  const escape = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const typeMap = {1:["16th",false],2:["eighth",false],3:["eighth",true],4:["quarter",false],6:["quarter",true],8:["half",false],12:["half",true],16:["whole",false]};
  function splitSpan(start,duration) {
    const result=[]; let remaining=duration, at=start;
    while(remaining>0){
      const boundary=Math.min(16-at%16,at%4 ? 4-at%4 : 16);
      const size=[16,12,8,6,4,3,2,1].find(n=>n<=remaining && n<=boundary);
      result.push({start:at,duration:size,type:typeMap[size][0],dot:typeMap[size][1]});at+=size;remaining-=size;
    }
    return result;
  }
  function melodyFragments() {
    const spans=[];let cursor=0;
    for(const note of data.melody){
      if(note.start>cursor)spans.push({start:cursor,duration:note.start-cursor,rest:true});
      spans.push(note);cursor=note.start+note.duration;
    }
    if(cursor<totalTicks)spans.push({start:cursor,duration:totalTicks-cursor,rest:true});
    return spans.flatMap(n=>{
      const parts=splitSpan(n.start,n.duration);
      return parts.map((p,i)=>({...n,...p,name:n.rest ? null : noteName(n.midi,chordAt(n.start).chord),tieStart:!n.rest && i<parts.length-1,tieStop:!n.rest && i>0}));
    });
  }
  function pitch(midi,name) {
    const alter = name.includes("♭") ? -1 : name.includes("♯") ? 1 : 0;
    return `<pitch><step>${name[0]}</step>${alter ? `<alter>${alter}</alter>` : ""}<octave>${Math.floor(midi/12)-1}</octave></pitch>`;
  }
  function noteXml(fragment,staff,learned,chordNote=false) {
    const h=chordAt(fragment.start);
    const highlight=!fragment.rest && learned.has(h.chord) && related(fragment.midi,h.chord);
    const color=highlight ? colors.learned : fragment.rest ? colors.other : colors.ink;
    const ties=`${fragment.tieStop ? '<tie type="stop"/>' : ""}${fragment.tieStart ? '<tie type="start"/>' : ""}`;
    const notation=fragment.tieStop || fragment.tieStart ? `<notations>${fragment.tieStop ? '<tied type="stop"/>' : ""}${fragment.tieStart ? '<tied type="start"/>' : ""}</notations>` : "";
    return `<note color="${color}">${chordNote ? "<chord/>" : ""}${fragment.rest ? "<rest/>" : pitch(fragment.midi,fragment.name)}<duration>${fragment.duration}</duration>${ties}<voice>${staff}</voice><type>${fragment.type}</type>${fragment.dot ? "<dot/>" : ""}${!fragment.rest ? `<notehead color="${color}">normal</notehead>` : ""}<staff>${staff}</staff>${notation}</note>`;
  }
  function musicXml(learned=new Set(),tempo=data.bpm) {
    const melody=melodyFragments();
    const measures=Array.from({length:barCount},(_,bar)=>{
      const begin=bar*16;
      const attrs=bar===0 ? '<attributes><divisions>4</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>' : "";
      const tempoMark=bar===0 ? `<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${tempo}</per-minute></metronome></direction-type><sound tempo="${tempo}"/></direction>` : "";
      const harmonies=harmony.filter(h=>h.start>=begin&&h.start<begin+16);
      const labels=harmonies.map(h=>{
        const v=voicings[h.chord];const color=learned.has(h.chord)?colors.learned:colors.ink;
        const suffix=v.kindText??({"major-seventh":"maj7","minor-seventh":"m7",dominant:"7","suspended-fourth":"sus4"}[v.kind]||"");
        return `<harmony color="${color}"><root><root-step>${v.root}</root-step>${v.alter?`<root-alter>${v.alter}</root-alter>`:""}</root><kind text="${escape(suffix)}" use-symbols="no">${v.kind}</kind>${v.bass?`<bass><bass-step>${v.bass}</bass-step><bass-alter>${v.bassAlter}</bass-alter></bass>`:""}${v.degree?`<degree print-object="no"><degree-value>${v.degree.value}</degree-value><degree-alter>${v.degree.alter}</degree-alter><degree-type>${v.degree.type}</degree-type></degree>`:""}<offset>${h.start-begin}</offset><staff>1</staff></harmony>`;
      }).join("");
      const upper=melody.filter(n=>n.start>=begin&&n.start<begin+16).map(n=>noteXml(n,1,learned)).join("");
      const lower=harmony.flatMap(h=>splitSpan(h.start,h.duration).map(part=>({...h,...part}))).filter(part=>part.start>=begin&&part.start<begin+16).map(part=>part.notes.map((midi,i)=>noteXml({...part,midi,name:voicings[part.chord].names[i]},2,learned,i>0)).join("")).join("");
      return `<measure number="${bar+1}">${bar>0&&bar%2===0?'<print new-system="yes"/>':""}${attrs}${tempoMark}${labels}${upper}<backup><duration>16</duration></backup>${lower}${bar===barCount-1?'<barline location="right"><bar-style>light-heavy</bar-style></barline>':""}</measure>`;
    }).join("");
    return `<?xml version="1.0" encoding="UTF-8"?><score-partwise version="3.1"><work><work-title>${escape(data.title)}</work-title></work><identification><creator type="arranger">CHORD · Local piano study</creator></identification><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1">${measures}</part></score-partwise>`;
  }
  function playbackEvents(mode="both",range=[0,totalTicks],manualChord=null) {
    const [start,end]=range;
    const melody=mode==="left"?[]:data.melody.map(n=>({...n,hand:"right",notes:[n.midi]}));
    // Accompaniment attacks use the same duration fragments written to the score.
    const left=mode==="right"?[]:harmony.filter(h=>h.chord!==manualChord).flatMap(h=>splitSpan(h.start,h.duration).map(p=>({...h,...p,hand:"left"})));
    return [...melody,...left].filter(n=>n.start<end&&n.start+n.duration>start).map(n=>({...n,start:Math.max(n.start,start)-start,duration:Math.min(n.start+n.duration,end)-Math.max(n.start,start)})).sort((a,b)=>a.start-b.start);
  }
    return {config,data,totalTicks,barCount,colors,voicings,harmony,chordAt,noteName,related,labelId,splitSpan,melodyFragments,musicXml,playbackEvents};
  }
  const api={create};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.PracticeModel=api;
})(typeof globalThis!=="undefined"?globalThis:this);
