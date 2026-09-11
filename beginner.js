(function () {
  "use strict";
  const course = BeginnerCourse;
  const home = document.querySelector("#beginner-home");
  const workspace = document.querySelector("#beginner-workspace");
  const names = ["C","D♭","D","E♭","E","F","G♭","G","A♭","A","B♭","B"];
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  let storageAvailable = true;
  let progress;
  try { progress = course.cleanProgress(JSON.parse(localStorage.getItem(course.storageKey))); }
  catch { progress = course.freshProgress(); }
  let session = null;
  let audioGeneration = 0;
  let timers = [];
  let playingSources = [];
  let audioBusy = false;
  let activeDuet = null;
  const done = lesson => (progress.checkpoints[lesson.id] || 0) >= lesson.steps.length;
  const unlocked = i => i === 0 || done(course.lessons[i-1]);
  const selectedChord = () => course.getChord(session.step.target);
  const nameFor = midi => names[midi % 12];
  function save() {
    try { localStorage.setItem(course.storageKey, JSON.stringify(progress)); }
    catch { storageAvailable = false; }
    updateStats();
  }
  function updateStats() {
    const count = course.lessons.filter(done).length;
    document.querySelector("#sidebar-progress").innerHTML = `${count}<small>/ 3 课</small>`;
    document.querySelector("#learner-status").textContent = count ? `已完成 ${count} 节起步课程` : "从第一颗琴键开始";
    document.querySelector("#learning-status").textContent = progress.practiceDays.includes(today()) ? "今天又向前了一点" : "一次学会一点";
    document.querySelector(".local-progress-note").textContent = storageAvailable ? "学习进度保存在这台设备" : "暂时无法保存；本次仍可继续学习";
  }
  function keyboard(step, selected = [], preview = false) {
    const white = [60,62,64,65,67,69,71,72];
    const black = [61,63,66,68,70];
    const expected = course.expected(step);
    const render = (midi, blackKey) => {
      const isSelected = selected.includes(midi);
      const hint = step.hints && expected.includes(midi) && !isSelected;
      const showLabel = step.labels === "all" || midi === 60 || (step.labels === "c" && midi === 72);
      const left = blackKey ? `${white.filter(n => n < midi).length / white.length * 100}%` : "";
      return `<button type="button" class="learn-key ${blackKey ? "black" : "white"}${isSelected ? " is-selected" : ""}${hint ? " is-hint" : ""}" ${blackKey ? `style="left:${left}"` : ""} ${preview ? "data-preview-key" : "data-beginner-key"}="${midi}" aria-label="${nameFor(midi)}${midi === 72 ? "，右边的高音" : ""}" aria-pressed="${isSelected}"><span class="key-marker" aria-hidden="true">${isSelected ? "●" : hint ? "○" : ""}</span><span class="key-name">${showLabel ? nameFor(midi) : ""}</span></button>`;
    };
    return `<div class="learning-keyboard" role="group" aria-label="从 C 到高音 C 的钢琴键盘">${white.map(n => render(n,false)).join("")}${black.map(n => render(n,true)).join("")}</div>`;
  }
  function renderHome() {
    const current = course.lessons.find(l => !done(l)) || course.lessons[0];
    const started = (progress.checkpoints[current.id] || 0) > 0;
    const complete = course.lessons.every(done);
    const due = Object.entries(progress.recalls).filter(([,v]) => v.date < today());
    const totalSteps = course.lessons.reduce((n,l) => n + l.steps.length, 0);
    const completedSteps = Object.values(progress.checkpoints).reduce((a,b) => a+b,0);
    home.innerHTML = `
      <div class="beginner-hero">
        <div class="beginner-intro"><span class="eyebrow"><i></i> ${complete ? "继续巩固" : "从零开始 · 每次几分钟"}</span>
          <h1>${complete ? "学过的和弦，<br>再自己弹一次。" : started || current.id !== "first" ? `接着学，<br>${current.title}。` : "今天，学会<br><span>C</span> 和 <span>Cm</span>。"}</h1>
          <p>${complete ? "撤掉提示，看看还记得哪些声音。也可以去歌曲里，试试新的用法。" : "从找到一颗琴键开始，跟着声音一点点学。你可以先在屏幕上试，有钢琴时再跟着弹。"}</p>
          <button class="primary-button" data-start-lesson="${current.id}">${complete ? "重新练习第 1 课" : started ? "继续这一课" : `开始第 ${course.lessons.indexOf(current)+1} 课`} <span>→</span></button>
          <span class="intro-duration">${current.duration} · 随时可以停下来</span>
        </div>
        <div class="home-listen"><div class="home-listen-heading"><span>先听一听，你将学会的声音</span><span class="audio-dot" aria-hidden="true"></span></div>
          <div class="preview-chords"><button class="preview-chord active" data-preview-chord="C" aria-pressed="true"><strong>C</strong><span>▶ C 大和弦</span></button><button class="preview-chord" data-preview-chord="Cm" aria-pressed="false"><strong>C<sup>m</sup></strong><span>▶ C 小和弦</span></button></div>
          <div id="home-keyboard">${keyboard({target:"C",labels:"all"},course.getChord("C").midi,true)}</div>
          <p id="preview-caption" role="status">C · 三个亮起的琴键，一起发声</p>
        </div>
      </div>
      ${due.length ? `<div class="review-reminder"><div><strong>隔了一天，还记得吗？</strong><p>${due.map(([id]) => id).join("、")} 可以再独立找一次。</p></div><button class="secondary-button" data-review>复习学过的和弦 →</button></div>` : ""}
      <section class="learning-route" aria-labelledby="route-title"><div class="route-heading"><h2 id="route-title">你的起步路线</h2><span>${completedSteps} / ${totalSteps} 小步</span></div>
      <div class="route-cards">${course.lessons.map((lesson,i) => `<button class="route-card ${done(lesson) ? "is-complete" : unlocked(i) ? "is-current" : "is-locked"}" data-start-lesson="${lesson.id}" ${unlocked(i) ? "" : "disabled"}>
        <span class="route-top"><span class="route-number">0${i+1}</span><span>${done(lesson) ? "✓ 已完成，可重练" : unlocked(i) ? progress.checkpoints[lesson.id] ? "继续学习" : "从这里开始" : `完成第 ${i} 课后开启`}</span></span>
        <strong>${lesson.title}</strong><p>${lesson.description}</p><div class="route-symbols">${lesson.symbols.map(id => `<span>${course.getChord(id).html}</span>`).join("")}</div>
        <div class="route-bottom"><span>${lesson.duration}</span><span>${done(lesson) ? lesson.steps.length : progress.checkpoints[lesson.id] || 0} / ${lesson.steps.length} 步 <b>↗</b></span></div>
        <span class="route-progress"><i style="width:${(progress.checkpoints[lesson.id] || 0)/lesson.steps.length*100}%"></i></span>
      </button>`).join("")}</div></section>
      <div class="learning-footer"><p><strong>认识 → 独立找回 → 到琴上弹</strong><br>屏幕练习记录的是找音和跟弹体验。真正的双手配合，留给你在琴上慢慢练。</p><button class="text-button" data-library>已经有基础？探索歌曲与和弦库 ↗</button></div>`;
    home.querySelectorAll("[data-start-lesson]").forEach(button => button.addEventListener("click", () => startLesson(button.dataset.startLesson)));
    home.querySelectorAll("[data-preview-chord]").forEach(button => button.addEventListener("click", async () => {
      const chord = course.getChord(button.dataset.previewChord);
      home.querySelectorAll("[data-preview-chord]").forEach(b => { b.classList.toggle("active",b === button); b.setAttribute("aria-pressed",String(b === button)); });
      home.querySelector("#home-keyboard").innerHTML = keyboard({target:chord.id,labels:"all"},chord.midi,true);
      home.querySelector("#preview-caption").textContent = `${chord.id} · ${chord.notes.join("、")} 一起发声${chord.id === "Cm" ? "，只有中间的音变了" : ""}`;
      bindPreviewKeys();
      await playNotes(chord.midi);
    }));
    bindPreviewKeys();
    home.querySelector("[data-library]").addEventListener("click", () => navigate("learn"));
    home.querySelector("[data-review]")?.addEventListener("click", () => {
      const id = due[0][0];
      const lesson = course.lessons.find(l => l.steps.some(s => s.target === id && s.mode === "recall"));
      startLesson(lesson.id, lesson.steps.findIndex(s => s.target === id && s.mode === "recall"));
    });
    updateStats();
  }
  function bindPreviewKeys() {
    home.querySelectorAll("[data-preview-key]").forEach(button => button.addEventListener("click", () => playNotes([Number(button.dataset.previewKey)])));
  }
  function stopAudio() {
    audioGeneration++;
    timers.forEach(clearTimeout); timers = [];
    playingSources.forEach(source => { try { if (source.pause) source.pause(); else source.stop(); } catch {} });
    playingSources = []; audioBusy = false; activeDuet = null;
  }
  async function prepareAudio() {
    if (!soundEnabled) throw new Error("声音已关闭。点右上角的声音按钮打开，再试一次。");
    if (location.protocol === "file:") return;
    const ctx = context();
    if (ctx.state === "suspended") await ctx.resume();
    await loadPianoSamples();
    if (!pianoSamples.size || ctx.state !== "running") throw new Error("钢琴音色暂时没有加载好，请再点一次播放。");
  }
  function emitNotes(notes, duration = 1.1, volume = .11) {
    if (!soundEnabled) return Promise.resolve(false);
    const pending = [];
    notes.forEach(midi => {
      const sample = nearestPianoSample(midi);
      if (location.protocol === "file:") {
        const audio = new Audio(`assets/piano/${sample.file}`);
        audio.playbackRate = Math.pow(2,(midi-sample.midi)/12);
        audio.preservesPitch = false;
        audio.volume = Math.min(1,volume*2.6);
        playingSources.push(audio);
        pending.push(audio.play().then(() => true, () => { audioError("声音没有播放成功，请再点一次。"); return false; }));
        timers.push(setTimeout(() => { audio.pause(); playingSources = playingSources.filter(s => s !== audio); },(duration+.35)*1000));
        return;
      }
      const ctx = context();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = pianoSamples.get(sample.midi);
      source.playbackRate.value = Math.pow(2,(midi-sample.midi)/12);
      gain.gain.setValueAtTime(volume*1.65,ctx.currentTime);
      gain.gain.setTargetAtTime(.0001,ctx.currentTime+duration,.15);
      source.connect(gain); gain.connect(pianoOutput);
      playingSources.push(source);
      source.onended = () => { source.disconnect(); gain.disconnect(); playingSources = playingSources.filter(s => s !== source); };
      source.start(); source.stop(ctx.currentTime+duration+.8);
    });
    return Promise.all(pending).then(results => results.every(Boolean));
  }
  function audioError(message) {
    const feedback = workspace.querySelector("#step-feedback");
    if (session && document.querySelector("#beginner-view.active") && feedback) { feedback.textContent = message; feedback.className = "step-feedback error"; }
    else if (document.querySelector("#ear-view.active")) document.querySelector("#ear-feedback span").textContent = message;
    else if (document.querySelector("#piano-view.active")) document.querySelector("#piano-feedback").textContent = message;
    else if (home.querySelector("#preview-caption")) home.querySelector("#preview-caption").textContent = message;
  }
  async function playNotes(notes, duration = 1.1) {
    const generation = audioGeneration;
    try { await prepareAudio(); if (generation !== audioGeneration) return false; const played = await emitNotes(notes,duration); return generation === audioGeneration && played; }
    catch (error) { if(generation === audioGeneration) audioError(error.message); return false; }
  }
  function startLesson(id, at) {
    const i = course.lessons.findIndex(l => l.id === id);
    if (i < 0 || !unlocked(i)) return;
    const lesson = course.lessons[i];
    const index = Number.isInteger(at) ? at : done(lesson) ? 0 : progress.checkpoints[id] || 0;
    progress.lastLesson = id;
    navigate("beginner");
    loadStep(lesson, index);
  }
  function loadStep(lesson, index) {
    stopAudio();
    const step = lesson.steps[index];
    session = { lesson, index, step, selected: new Set(step.from ? course.getChord(step.from).midi : step.mode === "listen" ? course.expected(step) : []), passed: false, assisted: false, feedback: "", error: false };
    renderStep(true);
  }
  function physicalTip(chord) {
    const hands = {
      C: "右手：拇指按 C，中指按 E，小指按 G。", Cm: "右手：拇指按 C，中指按 E♭，小指按 G。",
      F: "右手：拇指按 F，中指按 A，小指按右边的 C。", Fm: "右手：拇指按 F，中指按 A♭，小指按右边的 C。",
      Cmaj7: "可以先分给双手：左手弹低一点的 C，右手弹 E、G、B。", C7: "可以先分给双手：左手弹低一点的 C，右手弹 E、G、B♭。", Cm7: "可以先分给双手：左手弹低一点的 C，右手弹 E♭、G、B♭。"
    };
    return `<details class="physical-tip"><summary>有钢琴？在真实琴键上试试 <span>＋</span></summary><p>${hands[chord.id]} 手指自然弯曲，先一起按下，再一起松开。</p><p>这是一个起步弹法。代号说明组成音，同一个和弦还可以换位置、分给两只手，或按不同节奏弹。</p><small>拇指到小指常编号 1–5。以后看到构成公式里的 1、3、5，它们表示音的关系，不是手指编号。</small></details>`;
  }
  function renderStep(focusHeading = false) {
    const { lesson, index, step } = session;
    const chord = selectedChord();
    const hintStep = {...step,hints:step.hints || session.assisted};
    workspace.innerHTML = `<div class="lesson-navigation"><button class="text-button" data-exit>← 我的学习</button><span>第 ${course.lessons.indexOf(lesson)+1} 课 · ${lesson.title}</span><span>${index+1} / ${lesson.steps.length}</span></div>
      <div class="lesson-step-progress" role="progressbar" aria-label="本课进度" aria-valuemin="0" aria-valuemax="${lesson.steps.length}" aria-valuenow="${index}">${lesson.steps.map((_,i) => `<i class="${i < index ? "done" : i === index ? "current" : ""}"></i>`).join("")}</div>
      <article class="beginner-stage">
        <div class="step-heading"><span class="eyebrow"><i></i> ${({find:"认识琴键",build:"跟着找",listen:"一起听",recall:"自己试一次",transform:"看看变化",duet:"一起做音乐"})[step.mode]}</span><h1 id="step-title" tabindex="-1">${step.title}</h1><p>${step.text}</p></div>
        ${step.from ? `<div class="chord-change"><button data-example="${step.from}" aria-label="试听 ${step.from}"><strong>${course.getChord(step.from).html}</strong><small>▶ 变化前</small></button><span class="change-arrow">→</span><button data-example="${step.target}" aria-label="试听 ${step.target}"><strong>${chord.html}</strong><small>▶ 变化后</small></button></div>` : step.mode !== "find" && step.mode !== "duet" ? `<div class="step-symbol">${chord.html}<small>${step.mode === "recall" ? "看代号，找到琴键" : chord.name}</small></div>` : ""}
        ${step.mode === "find" ? `<div class="black-key-guide"><span class="${step.target === "C" ? "active" : ""}">两颗黑键一组 · 左边是 C</span><span class="${step.target === "F" ? "active" : ""}">三颗黑键一组 · 左边是 F</span></div>` : ""}
        ${step.mode === "duet" ? `<div class="duet-track">${step.sequence.map((id,i) => `<div class="duet-bar" data-bar="${i}"><span>第 ${i+1} 组</span><strong>${course.getChord(id).html}</strong><div class="beat-dots">${[0,1,2,3].map(beat => `<i data-beat="${beat}"></i>`).join("")}</div></div>`).join("")}</div><p class="duet-cue" id="duet-cue" role="status">准备好后开始 · 72 拍 / 分钟</p>` : ""}
        <div class="step-keyboard" id="step-keyboard">${keyboard(hintStep,[...session.selected])}</div>
        ${step.mode === "duet" ? `<div class="duet-pads">${[...new Set(step.sequence)].map(id => `<button class="duet-pad" data-strike="${id}">弹 ${course.getChord(id).html}<small>${course.getChord(id).notes.join(" · ")}</small></button>`).join("")}</div>` : `<div class="keyboard-help"><span>${step.mode === "listen" ? "三个亮起的琴键，同时发声" : "点一下选中，再点一下取消"}</span><span id="selection-count">${session.selected.size} / ${course.expected(step).length} 颗键</span></div>`}
        <div class="step-feedback ${session.passed ? "success" : session.error ? "error" : ""}" id="step-feedback" role="status" aria-live="polite">${session.feedback || (step.mode === "recall" ? "慢慢找，不计时。想不起来时，提示一直在。" : "准备好就试一试。")}</div>
        <div class="step-actions"><div class="step-tools">${step.mode === "duet" ? `<button class="secondary-button" id="duet-start">▶ 开始跟弹</button>` : `<button class="secondary-button" id="step-play">▶ ${step.mode === "listen" ? "一起听" : "听我选的音"}</button>`}${!["listen","duet"].includes(step.mode) ? `<button class="text-button" data-clear>重新选</button>` : ""}${!step.hints && step.mode !== "duet" ? `<button class="text-button" data-hint>给我一点提示</button>` : ""}</div>
        <button class="primary-button" id="step-check" ${["listen","duet"].includes(step.mode) ? "hidden" : ""}>检查一下 <span>✓</span></button><button class="primary-button" id="step-next" ${session.passed ? "" : "hidden"}>${index === lesson.steps.length-1 ? "完成这一课" : "下一小步"} <span>→</span></button></div>
        ${step.mode !== "find" ? physicalTip(chord) : ""}
      </article><div class="step-bottom"><button class="text-button" data-previous ${index === 0 ? "disabled" : ""}>← 上一小步</button><span>${storageAvailable ? "完成的小步会自动保存" : "暂时无法保存，可继续本次学习"}</span></div>`;
    workspace.querySelector("[data-exit]").addEventListener("click", () => navigate("home"));
    workspace.querySelector("[data-previous]").addEventListener("click", () => { if(index > 0) loadStep(lesson,index-1); });
    bindKeys();
    workspace.querySelectorAll("[data-example]").forEach(button => button.addEventListener("click", () => playNotes(course.getChord(button.dataset.example).midi)));
    workspace.querySelector("[data-clear]")?.addEventListener("click", () => { session.selected.clear(); session.passed = false; session.feedback = "重新选一次，慢慢来。"; session.error = false; refreshKeys(); });
    workspace.querySelector("[data-hint]")?.addEventListener("click", () => { session.assisted = true; session.feedback = `先找 ${chord.notes[0]}，再找 ${chord.notes.slice(1).join("、")}。空心圆标出了要找的琴键。`; session.error = false; refreshKeys(); });
    workspace.querySelector("#step-play")?.addEventListener("click", async () => {
      if (audioBusy) return;
      if (!session.selected.size) { setFeedback("先点选一颗琴键，再听听看。",true); return; }
      const current = session;
      audioBusy = true;
      const played = await playNotes([...session.selected]);
      audioBusy = false;
      if (played && current === session && step.mode === "listen") { session.passed = true; setFeedback(step.success); }
    });
    workspace.querySelector("#step-check").addEventListener("click", checkStep);
    workspace.querySelector("#step-next").addEventListener("click", nextStep);
    workspace.querySelector("#duet-start")?.addEventListener("click", startDuet);
    workspace.querySelectorAll("[data-strike]").forEach(button => button.addEventListener("click", () => strike(button.dataset.strike)));
    if (focusHeading) workspace.querySelector("#step-title").focus({preventScroll:true});
    updateActions();
  }
  function bindKeys() {
    workspace.querySelectorAll("[data-beginner-key]").forEach(button => button.addEventListener("click", () => {
      if (session.step.mode === "duet") { playNotes([Number(button.dataset.beginnerKey)]); return; }
      if (session.step.mode === "listen") { playNotes([Number(button.dataset.beginnerKey)]); return; }
      const midi = Number(button.dataset.beginnerKey);
      if (session.selected.has(midi)) session.selected.delete(midi);
      else { if(session.step.mode === "find") session.selected.clear(); session.selected.add(midi); }
      session.passed = false; session.error = false; session.feedback = "";
      // Update in place so keyboard focus stays on the key being played.
      refreshKeys(false);
      playNotes([midi]);
      if (session.step.mode === "find") checkStep();
    }));
  }
  function refreshKeys(replace = true) {
    const {step,selected} = session;
    const hinted = step.hints || session.assisted;
    if (replace) { workspace.querySelector("#step-keyboard").innerHTML = keyboard({...step,hints:hinted},[...selected]); bindKeys(); }
    else workspace.querySelectorAll("[data-beginner-key]").forEach(button => {
      const midi = Number(button.dataset.beginnerKey);
      const chosen = selected.has(midi);
      const hint = hinted && course.expected(step).includes(midi) && !chosen;
      button.classList.toggle("is-selected",chosen); button.classList.toggle("is-hint",hint);
      button.setAttribute("aria-pressed",String(chosen));
      button.querySelector(".key-marker").textContent = chosen ? "●" : hint ? "○" : "";
    });
    const count = workspace.querySelector("#selection-count");
    if(count) count.textContent = `${selected.size} / ${course.expected(step).length} 颗键`;
    setFeedback(session.feedback || "点选好后，检查一下。",session.error);
  }
  function setFeedback(message, error = false) {
    session.feedback = message; session.error = error;
    const feedback = workspace.querySelector("#step-feedback");
    feedback.textContent = message;
    feedback.className = `step-feedback ${error ? "error" : session.passed ? "success" : ""}`;
    updateActions();
  }
  function updateActions() {
    workspace.querySelector("#step-next").hidden = !session.passed;
    workspace.querySelector("#step-check").hidden = session.passed || ["listen","duet"].includes(session.step.mode);
  }
  function checkStep() {
    const result = course.assess(session.step,[...session.selected]);
    if(result.correct) {
      session.passed = true;
      setFeedback(session.step.success + (session.assisted ? " 这次用了提示，之后可以再独立试一次。" : ""));
      if(session.step.mode !== "find") playNotes([...session.selected]);
      return;
    }
    session.passed = false;
    if(!session.selected.size) { setFeedback("先在键盘上选一颗键。空心圆可以帮你找到位置。",true); return; }
    const kept = course.expected(session.step).filter(n => session.selected.has(n)).map(nameFor);
    const prefix = kept.length ? `${kept.join(" 和 ")} 已经找对了。` : "再看一眼琴键的位置。";
    const movement = result.extra.length === 1 && result.missing.length === 1 && Math.abs(result.extra[0]-result.missing[0]) === 1;
    const correction = movement ? `把 ${nameFor(result.extra[0])} 向${result.missing[0] < result.extra[0] ? "左" : "右"}移到紧邻的 ${nameFor(result.missing[0])}。` : `${result.extra.length ? `取消 ${result.extra.map(nameFor).join("、")}。` : ""}${result.missing.length ? `再找 ${result.missing.map(nameFor).join("、")}。` : ""}`;
    session.assisted = true;
    setFeedback(prefix+correction,true);
  }
  function nextStep() {
    if(!session.passed) return;
    const {lesson,index} = session;
    progress = course.completeStep(progress,lesson.id,index,!session.assisted,today());
    save();
    if(index+1 < lesson.steps.length) loadStep(lesson,index+1);
    else showCompletion(lesson);
  }
  function showCompletion(lesson) {
    stopAudio();
    const i = course.lessons.indexOf(lesson);
    const next = course.lessons[i+1];
    const independent = lesson.symbols.filter(id => progress.recalls[id]);
    workspace.innerHTML = `<article class="lesson-complete"><span class="completion-mark" aria-hidden="true">✓</span><span class="eyebrow">第 ${i+1} 课完成</span><h1 tabindex="-1">这些代号，<br>已经有了声音。</h1><div class="complete-symbols">${lesson.symbols.map(id => `<span>${course.getChord(id).html}</span>`).join("")}</div><p>你完成了「${lesson.title}」。${independent.length ? `${independent.join("、")} 已经独立找对过。` : "下次可以撤掉提示，再独立找一次。"}</p><div class="completion-note"><strong>下一次，试试还能不能自己找回来。</strong><p>到琴上练时，先分别找到每个音，再一起按下。屏幕跟弹完成，并不代表双手已经练熟。</p></div><div class="completion-actions"><button class="primary-button" data-continue>${next ? `继续：${next.title}` : "去歌曲里探索"} <span>→</span></button><button class="secondary-button" data-home>今天先到这里</button><button class="text-button" data-repeat>再练一次本课</button></div><small>${storageAvailable ? "进度已保存在这台设备" : "本次进度暂时无法保存，请保持页面打开"}</small></article>`;
    workspace.querySelector("[data-home]").addEventListener("click",() => navigate("home"));
    workspace.querySelector("[data-repeat]").addEventListener("click",() => startLesson(lesson.id,0));
    workspace.querySelector("[data-continue]").addEventListener("click",() => next ? startLesson(next.id) : navigate("learn"));
    workspace.querySelector("h1").focus({preventScroll:true});
  }
  async function startDuet() {
    if(audioBusy) return;
    if(activeDuet) { stopAudio(); workspace.querySelector("#duet-start").textContent = "▶ 重新开始"; workspace.querySelector("#duet-cue").textContent = "已停止。准备好可以再来一次。"; return; }
    stopAudio();
    const generation = audioGeneration;
    audioBusy = true;
    try { await prepareAudio(); } catch(error) { audioBusy=false; audioError(error.message); return; }
    if(generation !== audioGeneration) return;
    audioBusy = false;
    session.passed = false; updateActions();
    activeDuet = { bar: -1, hits: new Set(), started: performance.now(), generation };
    workspace.querySelector("#duet-start").textContent = "■ 停止跟弹";
    setFeedback("先听准备拍，再跟着橙色框点和弦。每组点一次就好。");
    const beatMs = 60000/72;
    const sequence = session.step.sequence;
    const melodies = { C:[76,79,76,79], Cm:[75,79,75,79], F:[77,81,79,77], Cmaj7:[76,79,71,79], C7:[76,79,70,79], Cm7:[75,79,70,79] };
    workspace.querySelectorAll(".duet-bar").forEach(el => el.classList.remove("played"));
    // Compute each next tick against one clock to avoid accumulated timer drift.
    const start = performance.now();
    const tick = n => {
      if(!activeDuet || activeDuet.generation !== generation) return;
      if(n >= (sequence.length+1)*4) {
        const hits = activeDuet.hits.size;
        activeDuet = null;
        workspace.querySelector("#duet-start").textContent = "▶ 再跟弹一次";
        workspace.querySelector("#duet-cue").textContent = `这一轮，跟上了 ${hits} / ${sequence.length} 次换和弦`;
        session.passed = hits >= 3;
        setFeedback(session.passed ? session.step.success : "再来一次：看到橙色框移到哪个代号，就点下方对应的和弦。跟上至少 3 组就能继续。",!session.passed);
        return;
      }
      const beat = n % 4;
      const bar = Math.floor(n/4)-1;
      activeDuet.bar = bar;
      workspace.querySelectorAll(".duet-bar").forEach((el,i) => { el.classList.toggle("current",i === bar); el.querySelectorAll("[data-beat]").forEach((dot,j) => dot.classList.toggle("active",i===bar && j <= beat)); });
      workspace.querySelector("#duet-cue").textContent = bar < 0 ? `准备 · ${beat+1} / 4` : `现在弹 ${sequence[bar]} · 第 ${beat+1} 拍`;
      if(bar < 0) emitNotes([beat === 0 ? 84 : 79],.08,.055);
      else {
        const chord = course.getChord(sequence[bar]);
        if(beat === 0) emitNotes([chord.midi[0]-12],2.4,.09);
        const melody = melodies[sequence[bar]];
        emitNotes([melody[beat]],.38,.055);
      }
      timers.push(setTimeout(() => tick(n+1),Math.max(0,start+(n+1)*beatMs-performance.now())));
    };
    tick(0);
  }
  async function strike(id) {
    const chord = course.getChord(id);
    const current = session;
    const duet = activeDuet;
    if(duet) emitNotes(chord.midi,1.5,.11);
    else if(!await playNotes(chord.midi)) return;
    if(current !== session) return;
    session.selected = new Set(chord.midi);
    workspace.querySelector("#step-keyboard").innerHTML = keyboard({target:id,labels:"all"},chord.midi);
    bindKeys();
    if(duet && duet === activeDuet && duet.bar >= 0) {
      if(session.step.sequence[duet.bar] === id) {
        duet.hits.add(duet.bar);
        workspace.querySelector(`[data-bar="${duet.bar}"]`).classList.add("played");
      } else setFeedback(`这一组是 ${session.step.sequence[duet.bar]}，再点一下它。`);
    }
  }
  document.addEventListener("chord:navigate",event => {
    stopAudio();
    if(event.detail.view === "home") renderHome();
  });
  document.addEventListener("visibilitychange",() => {
    if(document.hidden) {
      const wasDuet = !!activeDuet;
      stopAudio();
      if(wasDuet && workspace.querySelector("#duet-start")) { workspace.querySelector("#duet-start").textContent = "▶ 重新开始"; workspace.querySelector("#duet-cue").textContent = "已暂停。回到这里后，可以重新开始。"; }
    }
  });
  document.querySelector("#sound-toggle").addEventListener("click",() => {
    if(!soundEnabled) {
      const wasDuet = !!activeDuet;
      stopAudio();
      if(wasDuet) { workspace.querySelector("#duet-start").textContent = "▶ 重新开始"; setFeedback("声音已关闭，跟弹已停止。打开声音后可以重新开始。"); }
    }
  });
  window.ChordLearning = { getProgress: () => course.cleanProgress(progress), getPracticeChords: () => course.learnedChords(progress), playNotes };
  save();
  renderHome();
})();
