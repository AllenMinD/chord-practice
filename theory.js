(function () {
  "use strict";
  const model = window.ChordTheory;
  const notation = window.TheoryScore;
  const host = document.querySelector("#theory-workspace");
  let progress;
  let storageWarning = "";
  try { progress = model.cleanProgress(JSON.parse(localStorage.getItem(model.storageKey))); }
  catch { progress = model.cleanProgress(); storageWarning = "无法读取本机进度；你仍可以学习，当前进度会在本次页面内保留。"; }
  let lesson = model.lessons.find(l => l.id === progress.lastLesson);
  let page = 0;
  let demoIndex = 0;
  let questionIndex = 0;
  let selected = [];
  let solved = false;
  let generation = 0;
  let timers = new Set();
  let scoreLayout = "steps";
  let showNoteNames = true;
  let soundingNotes = [];
  let inspectedNote = null;
  let readingIndex = 0;
  const readingExamples = {
    notes:[3,4,2], intervals:[0,1,2], scale:[0,1,0], triads:[0,0,1],
    diatonic:[1,4,3], progressions:[0,2,1], sevenths:[0,1,2], sus:[0,1,2],
    add9:[0,1,2], bass:[0,1,2], borrowed:[1,1,2], secondary:[0,1,2],
    extensions:[1,0,2], diminished:[0,1,2]
  };
  const instrument = ChordInstrument.create({
    canPlay: () => soundEnabled && !document.hidden && document.querySelector("#theory-view.active"),
    onNotes: notes => { soundingNotes = notes; paintVisuals(); },
    onError: message => { stop(); status(message); }
  });
  function paintVisuals() {
    host.querySelectorAll("[data-theory-pitch]").forEach(element=>{
      const note = Number(element.dataset.theoryPitch);
      element.classList.toggle("sounding",soundingNotes.includes(note));
      element.classList.toggle("is-inspected",note === inspectedNote);
    });
  }
  function inspectNote(midi, spelling, kind) {
    inspectedNote = midi;
    paintVisuals();
    const info = host.querySelector("#theory-note-position");
    if(info) info.textContent = notation.describe(midi,spelling,kind);
  }
  function save() {
    try { localStorage.setItem(model.storageKey,JSON.stringify(progress)); storageWarning = ""; }
    catch { storageWarning = "浏览器未允许保存进度；当前页面内可以继续，刷新后可能丢失。"; }
    const notice = host.querySelector("#theory-storage");
    if (notice) notice.textContent = storageWarning || "进度只保存在本机 · 可以随时停下，下次接着学";
  }
  function status(message) {
    const target = host.querySelector("#theory-audio-status");
    if (target) target.textContent = message;
  }
  function stop(message) {
    generation++;
    timers.forEach(clearTimeout); timers.clear();
    instrument.stop();
    host.querySelectorAll(".is-playing").forEach(el => el.classList.remove("is-playing"));
    const button = host.querySelector("[data-theory-stop]");
    if (button) button.disabled = true;
    if (message) status(message);
  }
  function later(fn, delay, token) {
    const timer = setTimeout(() => { timers.delete(timer); if (token === generation) fn(); },delay);
    timers.add(timer);
  }
  async function play(events) {
    stop();
    if (!soundEnabled) { status("声音已关闭，请先点击右上角的声音开关。"); return; }
    const token = generation;
    status("正在准备钢琴音色…");
    try {
      if (location.protocol !== "file:") {
        const ctx = context();
        if (ctx.state === "suspended") await ctx.resume();
        await loadPianoSamples();
        if (!pianoSamples.size || ctx.state !== "running") throw Error("钢琴音色未准备好，请检查本机服务后重试。");
      }
      if (token !== generation) return;
      const stopButton = host.querySelector("[data-theory-stop]");
      if (stopButton) stopButton.disabled = false;
      events.forEach(event => later(() => {
        instrument.stop();
        if (event.index !== undefined) {
          demoIndex = event.index;
          renderDemo();
          host.querySelector(`[data-demo="${demoIndex}"]`)?.classList.add("is-playing");
        }
        status(`正在试听：${event.label}`);
        instrument.playChord(event.notes, event.duration);
      },event.at,token));
      const last = events[events.length-1];
      later(() => stop("试听结束。可以反复对比，或点琴键听单音。"),last.at + last.duration * 1000 + 300,token);
    } catch (error) { if (token === generation) { stop(); status(error.message); } }
  }
  function playDemo(sequential = false) {
    const demo = lesson.demos[demoIndex];
    const notes = demo.notes;
    play(sequential ? notes.map((note,i) => ({ notes:[note],at:i*550,duration:.45,label:demo.names[i] })) : [{ notes,at:0,duration:1.8,label:demo.label }]);
  }
  function keyboard(demo, { pool, editable = false } = {}) {
    const range = pool || lesson.demos.flatMap(d=>d.notes);
    const low = Math.floor(Math.min(...range)/12)*12;
    const high = Math.ceil(Math.max(...range)/12)*12;
    const end = Math.max(low+12,high);
    const all = Array.from({length:end-low+1},(_,i) => low+i);
    const black = n => [1,3,6,8,10].includes(n%12);
    const whites = all.filter(n => !black(n));
    const name = n => {
      const i = demo.notes.indexOf(n);
      return i < 0 ? model.noteName(n) : notation.pitch(n,demo.names[i]).name;
    };
    const key = n => `<button type="button" class="theory-key ${black(n) ? "black" : "white"}${demo.notes.includes(n)?" selected":""}${n===60?" central-c":""}" style="${black(n)?`left:${whites.filter(w=>w<n).length/whites.length*100}%;width:${62/whites.length}%`: `width:${100/whites.length}%`}" data-theory-key="${n}" data-theory-pitch="${n}" ${editable?`aria-pressed="${demo.notes.includes(n)}" ${!pool.includes(n)?"disabled":""}`:""} aria-label="${editable?"选择":"试听"} ${name(n)}${demo.notes.includes(n)?editable?"，已选音":"，示范组成音":""}${n===60?"，中央 C":""}">${demo.notes.includes(n)?`<b class="theory-note-number">${demo.notes.indexOf(n)+1}</b>`:""}<span>${showNoteNames || editable ? name(n) : n===60?"中央 C":""}</span></button>`;
    return `<div class="theory-keyboard-scroll"><div class="theory-keyboard" role="group" aria-label="示范键盘，绿色为组成音，橙色边框为正在发声" style="min-width:${whites.length*43}px">${whites.map(key).join("")}${all.filter(black).map(key).join("")}</div></div><p class="theory-keyboard-hint">谱面或琴键显示不全时，可以在各自区域左右滑动。</p>`;
  }
  function scoreHelp(demo) {
    const kind = notation.clef(demo.notes);
    return `<div class="theory-staff-guide"><strong>${kind==="bass"?"低音谱号 𝄢":"高音谱号 𝄞"} · ${scoreLayout==="chord"?"竖着叠在一起 = 同时弹":"从左往右，逐个找位置"}</strong><details><summary>第一次看五线谱？认识线、间与加线</summary><p>五条横线从下往上数为第 1–5 线，两条线中间叫“间”。符头越高，琴键位置通常越靠右；谱表外的短横线叫“加线”。${kind==="bass"?"这组音较低，用低音谱表更容易看清。":"中央 C（C4）在五线谱下方的第一条加线上。"}</p><p>先点一个音符，再看下方哪个琴键亮起。此处先看音高，节奏作等时值示范；“叠成和弦”用全音符表示同时发声。</p></details></div>`;
  }
  function visualPanel() {
    return `<section class="theory-visual-lab" aria-label="五线谱与键盘对应示例"><div class="theory-visual-title"><strong>看谱上的位置，再找同一颗琴键</strong><span>五线谱 ↔ 琴键 ↔ 声音</span></div><div class="theory-demo-tabs">${lesson.demos.map((demo,i)=>`<button data-demo="${i}" aria-pressed="${i===demoIndex}">${demo.label}</button>`).join("")}</div><div class="theory-notation-controls"><button data-score-layout="steps" aria-pressed="${scoreLayout==="steps"}">逐个看位置</button><button data-score-layout="chord" aria-pressed="${scoreLayout==="chord"}">叠成和弦</button><label><input type="checkbox" data-score-labels ${showNoteNames?"checked":""}> 显示音名辅助</label></div><div id="theory-demo"></div><p id="theory-note-position" class="theory-note-position" aria-live="polite">点一个谱上音符或琴键，看看这个音在哪里。</p><div class="theory-audio-actions"><button class="primary-button" data-theory-chord>▶ 一起听</button><button class="secondary-button" data-theory-arpeggio>♪ 逐音听</button><button class="text-button" data-theory-stop disabled>■ 停止</button></div>${lesson.sequences?`<div class="theory-sequences"><span>对比顺序</span>${lesson.sequences.map((seq,i)=>`<button class="secondary-button" data-theory-sequence="${i}">▶ ${seq.label}</button>`).join("")}</div>`:""}<p class="theory-audio-status" id="theory-audio-status" role="status">绿色是当前示例的组成音；播放时，谱上音符和琴键同步亮橙色。</p><p class="theory-small">同一个编号对应同一个音，只帮助找位置，不是级数或指法。音名后的数字表示音区。</p></section>`;
  }
  function bindVisualPanel() {
    renderDemo();
    host.querySelectorAll("[data-demo]").forEach(button=>button.addEventListener("click",()=>{stop();demoIndex=Number(button.dataset.demo);inspectedNote=null;renderDemo();playDemo(!!lesson.demos[demoIndex].sequential);}));
    host.querySelectorAll("[data-score-layout]").forEach(button=>button.addEventListener("click",()=>{
      stop();scoreLayout=button.dataset.scoreLayout;renderDemo();
    }));
    host.querySelector("[data-score-labels]").addEventListener("change",event=>{stop();showNoteNames=event.target.checked;renderDemo();});
    host.querySelector("[data-theory-chord]").addEventListener("click",()=>playDemo());
    host.querySelector("[data-theory-arpeggio]").addEventListener("click",()=>playDemo(true));
    host.querySelector("[data-theory-stop]").addEventListener("click",()=>stop("已停止。准备好可以再听一次。"));
    host.querySelectorAll("[data-theory-sequence]").forEach(button=>button.addEventListener("click",()=>{
      const seq=lesson.sequences[Number(button.dataset.theorySequence)];
      play(seq.indices.map((i,n)=>({notes:lesson.demos[i].notes,at:n*1800,duration:1.5,label:lesson.demos[i].label,index:i})));
    }));
  }
  function renderDemo() {
    const demo = lesson.demos[demoIndex];
    const kind = notation.clef(demo.notes);
    host.querySelector("#theory-demo").innerHTML = `<div class="theory-demo-heading"><strong>${demo.label}</strong><span>${demo.notes.map((n,i)=>notation.pitch(n,demo.names[i]).name).join(" · ")}</span></div><p>${demo.caption}</p>${scoreHelp(demo)}<div class="theory-score-scroll" id="theory-score" aria-label="${demo.label} 五线谱"></div><p class="theory-small">↓ 在键盘上找到上面这些音。点音符或琴键可以试听。</p>${keyboard(demo)}<div id="theory-extra-note" hidden><p class="theory-small">你刚才探索的琴键 · 额外单音对照</p><div class="theory-score-scroll" id="theory-extra-score"></div></div>`;
    host.querySelectorAll("[data-score-layout]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.scoreLayout===scoreLayout)));
    host.querySelectorAll("[data-demo]").forEach(button => {
      button.setAttribute("aria-pressed",String(Number(button.dataset.demo) === demoIndex));
      button.classList.remove("is-playing");
    });
    const inspect = (midi,spelling)=>inspectNote(midi,spelling,kind);
    const playNote = (midi,spelling)=>{
      inspect(midi,spelling);
      play([{notes:[midi],at:0,duration:.8,label:notation.pitch(midi,spelling).name}]);
    };
    notation.render(host.querySelector("#theory-score"),demo,{layout:scoreLayout,labels:showNoteNames,kind,onNote:playNote,onInspect:inspect,onReady:paintVisuals});
    host.querySelectorAll("[data-theory-key]").forEach(button => {
      const midi = Number(button.dataset.theoryKey);
      const spelling = demo.names[demo.notes.indexOf(midi)] || model.noteName(midi).replace(/\d+$/,"");
      button.addEventListener("mouseenter",()=>inspect(midi,spelling));
      button.addEventListener("focus",()=>inspect(midi,spelling));
      button.addEventListener("click",()=>{
        const extra=host.querySelector("#theory-extra-note");
        extra.hidden=demo.notes.includes(midi);
        if(!extra.hidden)notation.render(host.querySelector("#theory-extra-score"),{notes:[midi],names:[spelling]},{kind,labels:showNoteNames,onNote:playNote,onReady:paintVisuals});
        playNote(midi,spelling);
      });
    });
    const index = Math.max(0,demo.notes.indexOf(inspectedNote));
    inspect(demo.notes[index],demo.names[index]);
    paintVisuals();
  }
  function mark(step) {
    progress.checkpoints[lesson.id] = Math.max(progress.checkpoints[lesson.id], step);
    save();
  }
  function openLesson(id, resume = true) {
    stop();
    lesson = model.lessons.find(l => l.id === id) || lesson;
    progress.lastLesson = lesson.id;
    page = resume ? Math.min(2,progress.checkpoints[lesson.id]) : 0;
    if (progress.checkpoints[lesson.id] === 3) page = 0;
    demoIndex = readingExamples[lesson.id]?.[0] || 0; readingIndex=0; questionIndex = 0; selected = []; solved = false; scoreLayout="steps";inspectedNote=null;
    save(); renderLesson();
  }
  function renderReading() {
    const target = host.querySelector("#theory-reading");
    target.innerHTML = `<div class="theory-reading-controls"><strong>一点点看 · ${readingIndex+1} / ${lesson.paragraphs.length}</strong><div>${lesson.paragraphs.map((_,i)=>`<button data-reading="${i}" aria-label="讲解第 ${i+1} 步" ${readingIndex===i?'aria-current="step"':""}>${i+1}</button>`).join("")}</div></div><p>${lesson.paragraphs[readingIndex]}</p><div class="theory-reading-actions"><span>下方图例对应这一步。也可以点示例按钮自由比较。</span><button class="text-button" data-reading-next>${readingIndex<lesson.paragraphs.length-1?"下一点讲解 ↓":"再看第 1 点 ↺"}</button></div>`;
    const advance = index => {
      stop();readingIndex=index;demoIndex=readingExamples[lesson.id]?.[index] || 0;
      inspectedNote=null;renderReading();renderDemo();
    };
    target.querySelectorAll("[data-reading]").forEach(button=>button.addEventListener("click",()=>advance(Number(button.dataset.reading))));
    target.querySelector("[data-reading-next]").addEventListener("click",()=>advance((readingIndex+1)%lesson.paragraphs.length));
  }
  function overview() {
    stop();
    const completed = model.lessons.filter(l => progress.checkpoints[l.id] === 3).length;
    const current = progress.checkpoints[progress.lastLesson] < 3 ? lesson : model.lessons.find(l => progress.checkpoints[l.id] < 3);
    const groups = [...new Set(model.lessons.map(l=>l.stage))];
    host.innerHTML = `<div class="theory-hero"><div><span class="eyebrow"><i></i> 零基础也能听懂 · 每课约 4–7 分钟</span><h1>和弦乐理，<br>一次弄懂一点。</h1><p>从音名到流行和弦，把陌生代号拆成看得见、听得到的小变化。无需会读谱，也不需要连接钢琴。</p><button class="primary-button" data-theory-continue="${current?.id || model.lessons[0].id}">${completed === model.lessons.length?"从头复习":completed || progress.checkpoints[current?.id]?"继续学习":"从第 1 课开始"} <span>→</span></button></div><div class="theory-route-summary"><span>你的乐理路线</span><strong>${completed}<small> / ${model.lessons.length} 课</small></strong><progress value="${completed}" max="${model.lessons.length}" aria-label="乐理课程完成进度"></progress><p>读懂一点 → 对比试听 → 自己试试</p><small>每课两道小练习，答错可重试。建议按顺序学，也可以自由查阅。</small></div></div>
      <p class="theory-storage" id="theory-storage" role="status">${storageWarning || "进度只保存在本机 · 可以随时停下，下次接着学"}</p>
      ${groups.map((group,groupIndex)=>`<section class="theory-group"><div class="theory-group-heading"><span>0${groupIndex+1}</span><h2>${group}</h2></div><div class="theory-course-grid">${model.lessons.filter(l=>l.stage===group).map(l=>`<button class="theory-course-card" data-theory-lesson="${l.id}"><div><span>第 ${model.lessons.indexOf(l)+1} 课 · ${l.minutes} 分钟</span><span class="theory-badge ${progress.checkpoints[l.id]===3?"done":""}">${progress.checkpoints[l.id]===3?"✓ 已完成":progress.checkpoints[l.id]?"学习中":"未开始"}</span></div><h3>${l.title}</h3><p>${l.subtitle}</p><small>${l.goal}</small><span class="theory-card-arrow" aria-hidden="true">↗</span></button>`).join("")}</div></section>`).join("")}
      <div class="theory-endnote"><p>这里的音组与和声进行用于说明概念，不是歌曲旋律。学到七和弦或 sus、add9 后，可以进入歌曲与和弦库练真实节选。</p><details><summary>术语参考与学习说明</summary><p>课程以常见十二平均律钢琴和流行和弦符号为基础；听感描述仅作提示。进度表示完成屏幕阅读和小练习，不代表已掌握实琴演奏。</p><a href="https://viva.pressbooks.pub/openmusictheory/chapter/seventh-chords/" target="_blank" rel="noopener noreferrer">Open Music Theory · 七和弦</a> · <a href="https://viva.pressbooks.pub/openmusictheory/chapter/tonicization/" target="_blank" rel="noopener noreferrer">次属与临时主音化</a></details></div>`;
    host.querySelectorAll("[data-theory-lesson]").forEach(b=>b.addEventListener("click",()=>openLesson(b.dataset.theoryLesson)));
    host.querySelector("[data-theory-continue]").addEventListener("click",event=>openLesson(event.currentTarget.dataset.theoryContinue));
  }
  function renderLesson(focus = true) {
    stop();
    const index = model.lessons.indexOf(lesson);
    host.innerHTML = `<div class="theory-lesson-top"><button class="text-button" data-theory-overview>← 乐理路线</button><span>第 ${index+1} / ${model.lessons.length} 课 · ${lesson.stage}</span><label>跳到 <select id="theory-jump" aria-label="选择乐理课程">${model.lessons.map(l=>`<option value="${l.id}" ${l===lesson?"selected":""}>${model.lessons.indexOf(l)+1}. ${l.title}</option>`).join("")}</select></label></div>
      <div class="theory-steps" aria-label="本课学习步骤">${["读懂一点","对比试听","自己试试"].map((label,i)=>`<button data-theory-step="${i}" ${i===page?'aria-current="step"':''}><span>0${i+1}</span>${label}</button>`).join("")}</div>
      <article class="theory-stage"><header><span class="eyebrow">${lesson.subtitle}</span><h1 tabindex="-1" id="theory-heading">${lesson.title}</h1><p>这课学会：${lesson.goal}</p></header><div id="theory-content"></div></article>
      <p class="theory-storage" id="theory-storage" role="status">${storageWarning || "进度只保存在本机 · 可以随时停下，下次接着学"}</p>`;
    host.querySelector("[data-theory-overview]").addEventListener("click",overview);
    host.querySelector("#theory-jump").addEventListener("change",event=>openLesson(event.target.value));
    host.querySelectorAll("[data-theory-step]").forEach(button=>button.addEventListener("click",()=>{
      page=Number(button.dataset.theoryStep); questionIndex=0; selected=[]; solved=false; renderLesson();
    }));
    const content = host.querySelector("#theory-content");
    if (page === 0) {
      content.innerHTML = `<div id="theory-reading" class="theory-reading"></div>${visualPanel()}<div class="theory-anchor">${lesson.anchor}</div><aside class="theory-takeaway"><strong>先记住这一点</strong><p>${lesson.takeaway}</p></aside><div class="theory-actions"><button class="primary-button" data-theory-next>读过了，听听看 <span>→</span></button></div>`;
      renderReading();
      bindVisualPanel();
      content.querySelector("[data-theory-next]").addEventListener("click",()=>{mark(1);page=1;renderLesson();});
    } else if (page === 1) {
      content.innerHTML = `<p class="theory-listen-instruction">${lesson.listen}</p>${visualPanel()}<div class="theory-actions"><button class="primary-button" data-theory-next>准备好了，自己试试 <span>→</span></button></div>`;
      bindVisualPanel();
      content.querySelector("[data-theory-next]").addEventListener("click",()=>{mark(2);page=2;questionIndex=0;selected=[];solved=false;renderLesson();});
    } else renderQuestion();
    if (focus) host.querySelector("#theory-heading").focus({preventScroll:true});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function renderQuestion() {
    stop();
    const question=lesson.questions[questionIndex];
    const content=host.querySelector("#theory-content");
    content.innerHTML=`<div class="theory-question-count">小练习 ${questionIndex+1} / ${lesson.questions.length} · 不计时，随时回看前两步</div><h2>${question.prompt}</h2><p class="theory-small">${question.type==="notes"?"直接点下面的琴键选音，再点一次取消。你选的音会出现在五线谱上；绿色只表示已选，不代表答对。灰色琴键不在本题选项里。":"选择一个答案，再检查。不确定时可以展开五线谱与键盘，边看边想。"}</p>${question.type==="notes"?'<div id="theory-answer-visual" class="theory-answer-visual"></div>':`<div class="theory-answers" role="group" aria-label="练习答案">${question.options.map((option,i)=>`<button data-theory-answer="${i}" aria-pressed="false">${option}</button>`).join("")}</div><details class="theory-question-reference"><summary>打开五线谱与键盘，边看边想</summary><div id="theory-question-reference"></div></details>`}<details class="theory-hint"><summary>给我一点提示</summary><p>${question.hint}</p></details><p class="theory-feedback" id="theory-feedback" role="status">还没有选择答案。</p><div class="theory-actions"><button class="primary-button" data-theory-check disabled>检查答案 <span>→</span></button><button class="secondary-button" data-theory-question-next hidden>${questionIndex===lesson.questions.length-1?"完成本课 ✓":"下一题 →"}</button></div>`;
    const selectAnswer = index => {
      if(solved)return;
      if(question.type==="notes") {
        const note=question.pool[index];
        selected=selected.includes(note)?selected.filter(n=>n!==note):[...selected,note];
        renderAnswerVisual(question);
        content.querySelector(`[data-theory-key="${note}"]`)?.focus({preventScroll:true});
        inspectNote(note,undefined,"treble");
        play([{notes:[note],at:0,duration:.65,label:model.noteName(note)}]);
      } else selected=[index];
      content.querySelectorAll("[data-theory-answer]").forEach(b=>b.setAttribute("aria-pressed",String(selected.includes(question.type==="notes"?question.pool[Number(b.dataset.theoryAnswer)]:Number(b.dataset.theoryAnswer)))));
      content.querySelector("[data-theory-check]").disabled=!selected.length;
      const feedback=content.querySelector("#theory-feedback");
      feedback.className="theory-feedback";
      feedback.textContent=question.type==="notes"?`已选：${selected.map(model.noteName).join("、") || "暂无"}`:"已选择，可以检查答案。";
    };
    content.querySelectorAll("[data-theory-answer]").forEach(button=>button.addEventListener("click",()=>selectAnswer(Number(button.dataset.theoryAnswer))));
    function renderAnswerVisual(question) {
      const target = content.querySelector("#theory-answer-visual");
      const notes = [...selected].sort((a,b)=>a-b);
      const demo = {notes,names:notes.map(n=>model.noteName(n).replace(/\d+$/,""))};
      target.innerHTML = `<strong>你选的琴键，会写在这里</strong><p class="theory-small">${notes.length?"上面看符头的位置，下面看已选琴键。点击谱上音符也可以听。":"五条线从下往上数；中央 C 在下加一线。先在键盘选一颗，看看符头落在哪里。"}</p><div id="theory-answer-score" class="theory-score-scroll"></div>${keyboard(demo,{pool:question.pool,editable:true})}<p id="theory-note-position" class="theory-note-position" aria-live="polite">符头和琴键通过相同编号对应；编号不是级数或指法。</p><div class="theory-audio-actions"><button class="secondary-button" data-answer-listen ${notes.length?"":"disabled"}>▶ 听我选的音</button><button class="text-button" data-answer-clear ${notes.length&&!solved?"":"disabled"}>清空已选琴键</button><button class="text-button" data-theory-stop disabled>■ 停止</button></div><p id="theory-audio-status" class="theory-audio-status" role="status">先选琴键，再检查，不用着急。</p>`;
      notation.render(target.querySelector("#theory-answer-score"),demo,{kind:"treble",labels:showNoteNames,onNote:(midi,spelling)=>{
        inspectNote(midi,spelling,"treble");play([{notes:[midi],at:0,duration:.8,label:model.noteName(midi)}]);
      },onReady:paintVisuals});
      target.querySelectorAll("[data-theory-key]").forEach(button=>{
        if(solved)button.disabled=true;
        button.addEventListener("click",()=>selectAnswer(question.pool.indexOf(Number(button.dataset.theoryKey))));
      });
      target.querySelector("[data-answer-listen]").addEventListener("click",()=>play([{notes,at:0,duration:1.8,label:"我选的音"}]));
      target.querySelector("[data-answer-clear]").addEventListener("click",()=>{
        stop();selected=[];inspectedNote=null;renderAnswerVisual(question);
        content.querySelector("[data-theory-check]").disabled=true;
        content.querySelector("#theory-feedback").textContent="已清空，请重新选琴键。";
      });
      target.querySelector("[data-theory-stop]").addEventListener("click",()=>stop("已停止试听。"));
    }
    if(question.type==="notes")renderAnswerVisual(question);
    else content.querySelector(".theory-question-reference").addEventListener("toggle",event=>{
      const target=content.querySelector("#theory-question-reference");
      if(event.currentTarget.open && !target.children.length){target.innerHTML=visualPanel();bindVisualPanel();}
      if(!event.currentTarget.open){stop();target.replaceChildren();}
    });
    content.querySelector("[data-theory-check]").addEventListener("click",()=>{
      const result=model.assess(question,question.type==="notes"?selected:selected[0]);
      const feedback=content.querySelector("#theory-feedback");
      feedback.className=`theory-feedback ${result.correct?"correct":"retry"}`;
      feedback.textContent=result.correct?`✓ 答对了。${question.explanation}`:question.type==="notes"?`${result.missing.length?`还缺：${result.missing.map(model.noteName).join("、")}。`:""}${result.extra.length?`多选：${result.extra.map(model.noteName).join("、")}。`:""}调整后再试一次。`:`还差一点。${question.explanation} 再选一次试试。`;
      if(result.correct){solved=true;content.querySelectorAll("[data-theory-answer], #theory-answer-visual [data-theory-key], [data-answer-clear]").forEach(b=>b.disabled=true);content.querySelector("[data-theory-check]").disabled=true;content.querySelector("[data-theory-question-next]").hidden=false;}
    });
    content.querySelector("[data-theory-question-next]").addEventListener("click",()=>{
      if(!solved)return;
      if(questionIndex<lesson.questions.length-1){questionIndex++;selected=[];solved=false;renderQuestion();}
      else{mark(3);complete();}
    });
  }
  function library() {
    navigate("learn");
    if(lesson.library)selectLesson(lesson.library);
  }
  function complete() {
    stop();
    const next=model.lessons[model.lessons.indexOf(lesson)+1];
    host.querySelector("#theory-content").innerHTML=`<div class="theory-complete"><span>✓ 本课已完成</span><h2>${next?"又弄懂了一点。":"第一轮乐理学习完成了。"}</h2><p>${lesson.takeaway}</p><small>完成了本课两道屏幕练习。以后能自己解释、在琴上找出这些音，还需要多次复习。</small><div class="theory-actions">${next?`<button class="primary-button" data-theory-next-lesson>下一课：${next.title} →</button>`:`<button class="primary-button" data-theory-library>去歌曲里练一练 →</button>`}<button class="secondary-button" data-theory-repeat>重学本课</button>${lesson.library?'<button class="text-button" data-theory-library>到歌曲里试试 →</button>':""}</div></div>`;
    host.querySelector("[data-theory-next-lesson]")?.addEventListener("click",()=>openLesson(next.id));
    host.querySelector("[data-theory-repeat]").addEventListener("click",()=>openLesson(lesson.id,false));
    host.querySelector("[data-theory-library]")?.addEventListener("click",library);
  }
  document.addEventListener("chord:navigate",event=>{stop();if(event.detail.view==="theory")overview();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop("页面已离开，试听已停止。回来后可以重新播放。");});
  document.querySelector("#sound-toggle").addEventListener("click",()=>{if(!soundEnabled)stop("声音已关闭。打开右上角声音开关后可以重新试听。");});
  window.addEventListener("pagehide",()=>stop());
  overview();
})();
