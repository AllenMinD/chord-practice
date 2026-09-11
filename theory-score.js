(function (root) {
  "use strict";
  const natural = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
  const letters = "CDEFGAB";
  const fallback = ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"];
  const escape = text => String(text).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]));
  function pitch(midi, spelling = fallback[midi % 12]) {
    if (!Number.isInteger(midi) || midi < 0 || midi > 127 || !/^[A-G][♯♭]*$/.test(spelling)) throw Error("无效的示范音高或音名");
    const step = spelling[0];
    const alter = [...spelling.slice(1)].reduce((n,c) => n + (c === "♯" ? 1 : -1), 0);
    const octave = (midi - natural[step] - alter)/12 - 1;
    if (!Number.isInteger(octave) || Math.abs(alter)>2) throw Error("谱面音名与示范音高不一致");
    return { midi, step, alter, octave, name: `${spelling}${octave}`, position: octave*7 + letters.indexOf(step) };
  }
  function clef(notes) { return notes.length && Math.max(...notes) < 60 ? "bass" : "treble"; }
  function positionLabel(note, kind) {
    const bottom = kind === "bass" ? 2*7+4 : 4*7+2; // G2 / E4
    const distance = note.position - bottom;
    if (distance >= 0 && distance <= 8) return distance%2 ? `第 ${(distance+1)/2} 间` : `第 ${distance/2+1} 线`;
    const outside = distance < 0 ? -distance : distance-8;
    return `${distance < 0 ? "下" : "上"}加${outside%2 ? `第 ${(outside+1)/2} 间` : `第 ${outside/2} 线`}`;
  }
  function describe(midi, spelling, kind = "treble") {
    const note = pitch(midi,spelling);
    const location = `${kind === "bass" ? "低音" : "高音"}谱表的${positionLabel(note,kind)}`;
    const alteration = note.alter ? `前面的${note.alter<0?"降":"升"}号让这个音${note.alter<0?"降低":"升高"}${Math.abs(note.alter)===2?"两个":"一个"}半音；符头仍在同一个线 / 间位置。` : "";
    return `${note.name}：符头在${location}，对应键盘上的${[1,3,6,8,10].includes(midi%12)?"黑":"白"}键。${alteration}`;
  }
  function musicXml(demo, { layout = "steps", labels = true, kind = clef(demo.notes) } = {}) {
    const notes = demo.notes.map((n,i)=>pitch(n,demo.names[i]));
    const simultaneous = layout === "chord";
    const count = simultaneous ? 1 : Math.max(1,notes.length);
    const duration = simultaneous ? 4 : 1;
    const accidental = {"-2":"flat-flat","-1":"flat","1":"sharp","2":"double-sharp"};
    const body = notes.length ? notes.map((note,i)=>`<note color="#274c3d">${simultaneous && i ? "<chord/>" : ""}<pitch><step>${note.step}</step>${note.alter ? `<alter>${note.alter}</alter>` : ""}<octave>${note.octave}</octave></pitch><duration>${duration}</duration><type>${simultaneous?"whole":"quarter"}</type>${note.alter?`<accidental>${accidental[note.alter]}</accidental>`:""}${!simultaneous && labels?`<lyric><text>${escape(`${i+1} · ${note.name}`)}</text></lyric>`:""}</note>`).join("") : '<note print-object="no"><rest/><duration>1</duration><type>quarter</type></note>';
    return `<?xml version="1.0" encoding="utf-8"?><score-partwise version="4.0"><part-list><score-part id="P1"><part-name>音高示例</part-name></score-part></part-list><part id="P1"><measure number="1" implicit="yes"><attributes><divisions>1</divisions><key><fifths>0</fifths></key><time print-object="no"><beats>${simultaneous?4:count}</beats><beat-type>4</beat-type></time><clef><sign>${kind==="bass"?"F":"G"}</sign><line>${kind==="bass"?4:2}</line></clef></attributes>${body}<barline location="right"><bar-style>none</bar-style></barline></measure></part></score-partwise>`;
  }
  async function render(container,demo,options = {}) {
    const kind = options.kind || clef(demo.notes);
    const OSMD = root.opensheetmusicdisplay?.OpenSheetMusicDisplay || root.OpenSheetMusicDisplay;
    const token = {};
    container.theoryScoreToken = token;
    const current = () => container.isConnected && container.theoryScoreToken === token;
    container.dataset.scoreReady = "false";
    container.innerHTML = '<p class="theory-small">正在排五线谱…</p>';
    try {
      if(!OSMD)throw Error("谱面库未加载");
      const canvas = document.createElement("div");
      canvas.className = "theory-score-canvas";
      // Give the engraver the unzoomed width it needs for separated lyric labels.
      // Otherwise a large beginner-friendly zoom can squeeze labels into each other.
      canvas.style.width = `${(options.layout==="chord"?350:Math.max(350,150+demo.notes.length*90))*1.7}px`;
      container.replaceChildren(canvas);
      const score = new OSMD(canvas,{autoResize:false,backend:"svg",drawingParameters:"compacttight",drawTitle:false,drawComposer:false,drawPartNames:false,drawMeasureNumbers:false,drawTimeSignatures:false,coloringEnabled:true,colorStemsLikeNoteheads:true,coloringMode:0,followCursor:false});
      await score.load(musicXml(demo,{...options,kind}));
      if(!current())return;
      score.Zoom = 1.7;
      score.render(); score.enableOrDisableCursors(true);
      const cursor = score.cursor;
      cursor.reset();
      let guard = 0;
      while(!cursor.Iterator.EndReached && guard++ < 100) {
        for(const graphical of cursor.GNotesUnderCursor()) {
          const source = graphical.sourceNote.Pitch;
          if(!source)continue;
          const midi = (source.Octave + root.opensheetmusicdisplay.Pitch.OctaveXmlDifference + 1)*12 + source.FundamentalNote + source.AccidentalHalfTones;
          const i = demo.notes.indexOf(midi);
          if(i<0)throw Error("谱面与琴键映射不一致");
          // OSMD returns every head in the shared VexFlow chord. Use this
          // GraphicalNote's chord index, otherwise every head becomes the top pitch.
          const heads = graphical.getNoteheadSVGs?.() || [];
          const head = heads[graphical.vfnote?.[1] ?? 0];
          for(const element of head ? [head] : []) {
            const bounds = element.getBBox();
            const hit = document.createElementNS("http://www.w3.org/2000/svg","rect");
            hit.classList.add("theory-note-hit");
            hit.setAttribute("x",bounds.x-4);hit.setAttribute("y",bounds.y-1);
            hit.setAttribute("width",bounds.width+8);hit.setAttribute("height",bounds.height+2);
            hit.setAttribute("fill","transparent");hit.setAttribute("pointer-events","all");
            element.prepend(hit);
            element.classList.add("theory-score-note");
            element.dataset.theoryPitch = midi;
            element.setAttribute("role","button");
            element.setAttribute("tabindex","0");
            element.setAttribute("aria-label",`试听 ${pitch(midi,demo.names[i]).name}，${positionLabel(pitch(midi,demo.names[i]),kind)}`);
            const activate = () => options.onNote?.(midi,demo.names[i]);
            element.addEventListener("click",activate);
            element.addEventListener("keydown",event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();activate();}});
            element.addEventListener("mouseenter",()=>options.onInspect?.(midi,demo.names[i]));
            element.addEventListener("focus",()=>options.onInspect?.(midi,demo.names[i]));
          }
        }
        cursor.next();
      }
      cursor.reset();cursor.hide();
      canvas.querySelectorAll("svg").forEach(svg=>{
        svg.setAttribute("role","group");svg.setAttribute("aria-label",`${kind==="bass"?"低音":"高音"}谱表，可点击音符试听`);
        // Crop the engraver's unused page margins, keeping the actual notation large.
        const bounds=svg.getBBox();
        const width=Math.ceil(bounds.width+40),height=Math.ceil(bounds.height+36);
        svg.setAttribute("viewBox",`${bounds.x-20} ${bounds.y-18} ${width} ${height}`);
        svg.setAttribute("width",width);svg.setAttribute("height",height);
        canvas.style.width=`${width}px`;
      });
      container.dataset.scoreReady = "true";
      options.onReady?.();
    } catch(error) {
      if(!current())return;
      container.dataset.scoreReady = "error";
      container.innerHTML = '<p class="theory-score-error" role="status">五线谱暂时无法显示，请刷新本机页面重试。下方键盘仍可使用。</p>';
      console.warn("Theory score rendering failed",error);
    }
  }
  const api = { pitch, clef, positionLabel, describe, musicXml, render };
  if(typeof module !== "undefined" && module.exports)module.exports = api;
  root.TheoryScore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
