const chords = [
  {
    id: "Cmaj7", html: "C<sup>maj7</sup>", name: "C 大七和弦", mood: "朦胧 · 温暖", notes: ["C", "E", "G", "B"], pcs: ["C", "E", "G", "B"], midi: [48, 52, 55, 59], formula: ["1", "3", "5", "7"],
    song: "Imagine", artist: "John Lennon · 1971", progression: "C — Cmaj7 — F", context: "前奏的 C 向 Cmaj7 轻轻下行，让稳定的大和弦多了一点怀旧感。",
    usage: { title: "前奏与主歌", cue: "开场 4 小节先由 C 下行到 Cmaj7，再进入 F；每段主歌开头都会重复。", sections: [["前奏", true], ["主歌", true], ["桥段", false], ["尾奏", false]] },
    theory: "在大三和弦 1–3–5 上叠加大七度音。maj7 中的 “maj” 只修饰七度：三和弦本身仍然是大三和弦。"
  },
  {
    id: "Dbmaj7", html: "D♭<sup>maj7</sup>", name: "降 D 大七和弦", mood: "丝滑 · 都市", notes: ["D♭", "F", "A♭", "C"], pcs: ["Cs", "F", "Gs", "C"], midi: [49, 53, 56, 60], formula: ["1", "3", "5", "7"],
    song: "Just the Two of Us", artist: "Grover Washington Jr. · 1981", progression: "Dbmaj7 — C7 — Fm7", context: "开头的大七和弦奠定柔软、精致的都会色彩，随后半音下行到属七和弦。",
    usage: { title: "主循环的起点", cue: "在前奏、主歌和副歌的主要循环中，D♭maj7 都是第一个落下的和弦。", sections: [["前奏", true], ["主歌", true], ["副歌", true], ["桥段", false]] },
    theory: "D♭–F–A♭ 构成大三和弦，再加入大七度 C。大七度距离根音只差一个半音到八度，因此既亲近又有张力。"
  },
  {
    id: "C7", html: "C<sup>7</sup>", name: "C 属七和弦", mood: "推动 · 紧张", notes: ["C", "E", "G", "B♭"], pcs: ["C", "E", "G", "As"], midi: [48, 52, 55, 58], formula: ["1", "3", "5", "♭7"],
    song: "Just the Two of Us", artist: "Grover Washington Jr. · 1981", progression: "Dbmaj7 — C7 — Fm7", context: "C7 像一扇倾斜的门：E 与 B♭ 形成三全音，强烈地把听感推向 Fm7。",
    usage: { title: "主循环的第二个和弦", cue: "紧跟在 D♭maj7 后面；听见和声突然收紧、准备落向 Fm7 的位置，就是 C7。", sections: [["前奏", true], ["主歌", true], ["副歌", true], ["桥段", false]] },
    theory: "不写 maj 的 7 通常表示小七度。大三和弦加小七度得到属七和弦；它最典型的功能是向下方纯五度的和弦解决。"
  },
  {
    id: "Fm7", html: "F<sup>m7</sup>", name: "F 小七和弦", mood: "柔和 · 内省", notes: ["F", "A♭", "C", "E♭"], pcs: ["F", "Gs", "C", "Ds"], midi: [53, 56, 60, 63], formula: ["1", "♭3", "5", "♭7"],
    song: "Just the Two of Us", artist: "Grover Washington Jr. · 1981", progression: "Dbmaj7 — C7 — Fm7", context: "C7 的张力在 Fm7 落地，却没有完全收紧；小七度让和弦保持流动。",
    usage: { title: "主循环的落点", cue: "主循环的第三个和弦；C7 的紧张感在这里释放，是最容易听见的解决点。", sections: [["前奏", true], ["主歌", true], ["副歌", true], ["桥段", false]] },
    theory: "小三和弦 1–♭3–5 再叠加小七度 ♭7。相比纯小三和弦，m7 更松弛，常见于 R&B、Soul 与爵士流行。"
  },
  {
    id: "Fmaj7", html: "F<sup>maj7</sup>", name: "F 大七和弦", mood: "漂浮 · 开阔", notes: ["F", "A", "C", "E"], pcs: ["F", "A", "C", "E"], midi: [53, 57, 60, 64], formula: ["1", "3", "5", "7"],
    song: "Dreams", artist: "Fleetwood Mac · 1977", progression: "Fmaj7 — G", context: "反复摆动的两个和弦几乎不急着回家，Fmaj7 让整个律动像悬浮在空气中。",
    usage: { title: "贯穿全曲的两和弦循环", cue: "本练习里 Fmaj7 与 G 逐小节交替，Fmaj7 是每轮先落下的和弦。", sections: [["前奏", true], ["主歌", true], ["副歌", true], ["间奏", true]] },
    theory: "同一种 maj7 结构移到 F：F–A–C–E。先识别符号结构，再把它移到任何根音，是读谱的关键能力。"
  },
  {
    id: "Em7", html: "E<sup>m7</sup>", name: "E 小七和弦", mood: "松弛 · 低回", notes: ["E", "G", "B", "D"], pcs: ["E", "G", "B", "D"], midi: [52, 55, 59, 62], formula: ["1", "♭3", "5", "♭7"],
    song: "Wonderwall", artist: "Oasis · 1995", progression: "Em7 — G — Dsus4 — A7sus4", context: "保留高音弦的开放音，让 Em7 与后续和弦共享音色，形成标志性的连续感。",
    usage: { title: "前奏与主歌主循环", cue: "标志性吉他循环从 Em7 开始；进入预副歌和副歌后，它仍会作为重要落点出现。", sections: [["前奏", true], ["主歌", true], ["预副歌", true], ["副歌", true]] },
    theory: "E 小三和弦加入小七度 D。m 表示小三度，7 表示小七度；两个符号分别告诉你三度和七度的性质。"
  },
  {
    id: "Dsus4", html: "D<sup>sus4</sup>", name: "D 挂四和弦", mood: "悬而未决", notes: ["D", "G", "A"], pcs: ["D", "G", "A"], midi: [50, 55, 57], formula: ["1", "4", "5"],
    song: "Wonderwall", artist: "Oasis · 1995", progression: "Em7 — G — Dsus4 — A7sus4", context: "把决定大小调的三音拿走，换成四音，和弦因此停在一个等待解决的位置。",
    usage: { title: "前奏、主歌与预副歌", cue: "在主循环中它位于 G 之后；预副歌里又连接 Cadd9 与 Em7，持续制造悬念。", sections: [["前奏", true], ["主歌", true], ["预副歌", true], ["副歌", false]] },
    theory: "sus 是 suspended 的缩写。sus4 用纯四度替代三度，所以它既不是大和弦也不是小和弦；四音常会下行到三音。"
  },
  {
    id: "Cadd9", html: "C<sup>add9</sup>", name: "C 加九和弦", mood: "清亮 · 通透", notes: ["C", "E", "G", "D"], pcs: ["C", "E", "G", "D"], midi: [48, 52, 55, 62], formula: ["1", "3", "5", "9"],
    song: "Wonderwall", artist: "Oasis · 1995", progression: "Cadd9 — Dsus4 — A7sus4", context: "开放弦编配中的 D 作为九音持续发声，为普通的 C 大三和弦增加明亮空气感。",
    usage: { title: "主歌末尾、预副歌与副歌", cue: "主歌结尾先引出 Cadd9；预副歌和副歌也从它展开，听感会突然变得更明亮。", sections: [["前奏", false], ["主歌末", true], ["预副歌", true], ["副歌", true]] },
    theory: "add9 表示在完整三和弦上直接增加九音，并不自动包含七音。C9 通常含 B♭，而 Cadd9 不含七音——这是读谱时最容易混淆的一点。"
  }
];


// 按自然音根音分组，先认识三和弦，再比较小七与大七。
const libraryRoots = ["C", "D", "E", "F", "G", "A", "B"];
const libraryRootPitches = [0, 2, 4, 5, 7, 9, 11];
const libraryQualities = [
  { suffix: "", name: "大三和弦", steps: [0, 4, 7], formula: ["1", "3", "5"], mood: "明亮 · 稳定", theory: "不带后缀的字母表示大三和弦，由根音、大三度和纯五度组成。" },
  { suffix: "m", name: "小三和弦", steps: [0, 3, 7], formula: ["1", "♭3", "5"], mood: "柔和 · 内省", theory: "m 表示小三和弦：把同根音大三和弦的三音降低半音，根音和五音不变。" },
  { suffix: "m7", name: "小七和弦", steps: [0, 3, 7, 10], formula: ["1", "♭3", "5", "♭7"], mood: "松弛 · 柔和", theory: "在小三和弦上加入小七度。m 指小三度，7 指小七度；它们分别描述两个音的关系。" },
  { suffix: "maj7", name: "大七和弦", steps: [0, 4, 7, 11], formula: ["1", "3", "5", "7"], mood: "温暖 · 细腻", theory: "在大三和弦上加入大七度。maj7 是一个完整后缀，最高音与高八度根音相差半音。" }
];
libraryRoots.forEach((root, rootIndex) => {
  libraryQualities.forEach(quality => {
    const id = root + quality.suffix;
    if (chords.some(chord => chord.id === id)) return;
    const midi = quality.steps.map(step => 48 + libraryRootPitches[rootIndex] + step);
    const notes = quality.steps.map((step, index) => {
      const letterIndex = (rootIndex + index * 2) % 7;
      let alteration = (libraryRootPitches[rootIndex] + step - libraryRootPitches[letterIndex] + 12) % 12;
      if (alteration > 6) alteration -= 12;
      return libraryRoots[letterIndex] + (alteration > 0 ? "♯".repeat(alteration) : "♭".repeat(-alteration));
    });
    chords.push({ id, html: `${root}${quality.suffix ? `<sup>${quality.suffix}</sup>` : ""}`,
      name: `${root} ${quality.name}`, mood: quality.mood, notes, midi,
      pcs: midi.map(note => ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"][note % 12]),
      formula: quality.formula, theory: quality.theory, song: null });
  });
});
const librarySuffixOrder = ["", "m", "m7", "maj7", "7", "sus2", "sus4", "add9"];
chords.sort((a, b) => {
  const parts = chord => /^([A-G])([b#]?)(.*)$/.exec(chord.id);
  const left = parts(a), right = parts(b);
  const rank = suffix => { const index = librarySuffixOrder.indexOf(suffix); return index < 0 ? librarySuffixOrder.length : index; };
  return libraryRoots.indexOf(left[1]) - libraryRoots.indexOf(right[1])
    || Number(Boolean(left[2])) - Number(Boolean(right[2]))
    || rank(left[3]) - rank(right[3]);
});

let audioContext;
let soundEnabled = true;
let pianoOutput;
let pianoLoadPromise;
const pianoVolumeBoost = 1.65;
const pianoSamples = new Map();
const pianoSampleManifest = [
  { midi: 48, file: "C3.mp3" },
  { midi: 51, file: "Ds3.mp3" },
  { midi: 54, file: "Fs3.mp3" },
  { midi: 57, file: "A3.mp3" },
  { midi: 60, file: "C4.mp3" },
  { midi: 63, file: "Ds4.mp3" },
  { midi: 66, file: "Fs4.mp3" },
  { midi: 69, file: "A4.mp3" }
];
const noteNames = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
const displayNames = { C:"C", Cs:"C♯", D:"D", Ds:"D♯", E:"E", F:"F", Fs:"F♯", G:"G", Gs:"G♯", A:"A", As:"A♯", B:"B" };

function context() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const compressor = audioContext.createDynamicsCompressor();
    const warmth = audioContext.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 6200;
    warmth.Q.value = .25;
    compressor.threshold.value = -15;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = .004;
    compressor.release.value = .22;
    warmth.connect(compressor);
    compressor.connect(audioContext.destination);
    pianoOutput = warmth;
  }
  return audioContext;
}

function loadPianoSamples() {
  if (pianoLoadPromise) return pianoLoadPromise;
  if (location.protocol === "file:") {
    pianoSampleManifest.forEach(sample => {
      const audio = new Audio(`assets/piano/${sample.file}`);
      audio.preload = "auto";
    });
    pianoLoadPromise = Promise.resolve();
    return pianoLoadPromise;
  }
  const ctx = context();
  pianoLoadPromise = Promise.all(pianoSampleManifest.map(async sample => {
    const response = await fetch(`assets/piano/${sample.file}`);
    if (!response.ok) throw new Error(`Unable to load piano sample: ${sample.file}`);
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    pianoSamples.set(sample.midi, buffer);
  })).catch(error => {
    console.warn("Piano samples could not be loaded.", error);
    pianoLoadPromise = null;
  });
  return pianoLoadPromise;
}

function nearestPianoSample(midi) {
  return pianoSampleManifest.reduce((nearest, sample) =>
    Math.abs(sample.midi - midi) < Math.abs(nearest.midi - midi) ? sample : nearest
  );
}

function playMidi(midi, duration = 1.8, delay = 0, gainValue = .1) {
  if (!soundEnabled) return;
  if (location.protocol === "file:") {
    const sample = nearestPianoSample(midi);
    const audio = new Audio(`assets/piano/${sample.file}`);
    audio.preload = "auto";
    audio.playbackRate = Math.pow(2, (midi - sample.midi) / 12);
    audio.preservesPitch = false;
    audio.volume = Math.min(1, Math.max(.12, gainValue * 1.9 * pianoVolumeBoost));
    const timer = setTimeout(() => {
      if (soundEnabled) audio.play().catch(error => console.warn("Piano playback was blocked.", error));
    }, delay * 1000);
    return () => { clearTimeout(timer); audio.pause(); };
  }
  const ctx = context();
  if (!pianoSamples.size) {
    loadPianoSamples().then(() => {
      if (pianoSamples.size) playMidi(midi, duration, delay, gainValue);
    });
    return;
  }
  if (ctx.state === "suspended") ctx.resume();
  const start = ctx.currentTime + delay;
  const sample = nearestPianoSample(midi);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = pianoSamples.get(sample.midi);
  source.playbackRate.value = Math.pow(2, (midi - sample.midi) / 12);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.04, gainValue * 1.65 * pianoVolumeBoost), start + .008);
  gain.gain.setTargetAtTime(Math.max(.025, gainValue * .72 * pianoVolumeBoost), start + .06, .55);
  gain.gain.setTargetAtTime(.0001, start + duration, .32);
  source.connect(gain);
  gain.connect(pianoOutput);
  source.start(start);
  source.stop(start + duration + 1.5);
  return () => { try { source.stop(); } catch {} };
}

function playChord(chord, arpeggiate = true) {
  const item = typeof chord === "string" ? chords.find(c => c.id === chord) || BeginnerCourse.getChord(chord) : chord;
  if (!item) return;
  item.midi.forEach((midi, index) => playMidi(midi, 2.1, arpeggiate ? index * .065 : 0, .075));
}

function navigate(view) {
  if (!document.querySelector(`[data-view-panel="${view}"]`)) return;
  stopLessonDemo();
  document.querySelectorAll("[data-view-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.viewPanel === view));
  document.querySelectorAll(".nav-item, .mobile-nav button").forEach(button => button.classList.toggle("active", button.dataset.view === (view === "beginner" ? "home" : view)));
  const labels = { songs: "乐曲练习 / 把学过的和弦弹进音乐", reading: "读谱训练 / 从认音到连续识读", scales: "常用音阶速查 / 看谱找键与指法", home: "我的学习 / 从零开始", beginner: "跟着弹 / 一次学会一点", theory: "和弦乐理 / 一次弄懂一点", learn: "延伸探索 / 现代和弦库", ear: "听听区别 / 可以反复试听", piano: "看代号找键 / 独立试一试" };
  document.querySelector("#page-kicker").textContent = labels[view];
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "ear" && !earState.ready) newEarQuestion();
  if (view === "piano" && !pianoState.ready) newPianoQuestion();
  document.dispatchEvent(new CustomEvent("chord:navigate", { detail: { view } }));
}

document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", event => {
  if (button.matches("a")) event.preventDefault();
  navigate(button.dataset.view);
  if (button.dataset.openChord) selectLesson(button.dataset.openChord);
}));

document.querySelectorAll("[data-play-chord]").forEach(button => button.addEventListener("click", () => playChord(button.dataset.playChord)));
document.querySelector("#sound-toggle").addEventListener("click", event => {
  soundEnabled = !soundEnabled;
  stopLessonDemo();
  event.currentTarget.style.opacity = soundEnabled ? "1" : ".35";
  event.currentTarget.setAttribute("aria-label", soundEnabled ? "关闭声音" : "开启声音");
});

let activeLesson = null;
let lessonKeyboardMode = "chord";
let lessonDemoRun = 0;
const lessonDemoTimers = new Set();
const lessonDemoStops = new Set();

function stopLessonDemo() {
  lessonDemoRun++;
  lessonDemoTimers.forEach(clearTimeout);
  lessonDemoTimers.clear();
  lessonDemoStops.forEach(stop => stop());
  lessonDemoStops.clear();
  document.querySelectorAll(".demo-key.sounding").forEach(key => key.classList.remove("sounding"));
  const button = document.querySelector(".demo-play");
  if (button) {
    if (button.dataset.playing === "true") document.querySelector(".demo-status").textContent = "已停止试听。点击琴键可以重新试听。";
    button.dataset.playing = "false";
    button.innerHTML = `<span>▶</span> ${lessonKeyboardMode === "scale" ? "顺序听音阶" : "聆听和弦"}`;
    button.setAttribute("aria-label", lessonKeyboardMode === "scale" ? "顺序播放音阶" : "播放和弦");
  }
}

async function playLessonDemo(notes, sequential = false) {
  stopLessonDemo();
  const run = lessonDemoRun;
  const status = document.querySelector(".demo-status");
  if (!soundEnabled) { status.textContent = "声音已关闭，请先打开右上角的声音开关。"; return; }
  const button = document.querySelector(".demo-play");
  button.dataset.playing = "true";
  button.innerHTML = "<span>■</span> 停止试听";
  button.setAttribute("aria-label", "停止试听");
  status.textContent = "正在准备钢琴音色…";
  try {
    if (location.protocol !== "file:") {
      const ctx = context();
      if (ctx.state === "suspended") await ctx.resume();
      await loadPianoSamples();
      if (!pianoSamples.size || ctx.state !== "running") throw Error("audio unavailable");
    }
    if (run !== lessonDemoRun) return;
    status.textContent = sequential ? "跟着深色边框，从低到高逐个弹。" : "正在试听。你也可以点击任意琴键听单音。";
    const later = (fn, ms) => {
      const timer = setTimeout(() => { lessonDemoTimers.delete(timer); if (run === lessonDemoRun) fn(); }, ms);
      lessonDemoTimers.add(timer);
    };
    notes.forEach((midi, index) => {
      const delay = sequential ? index * 480 : 0;
      const duration = sequential ? .38 : 1.4;
      const stop = playMidi(midi, duration, delay / 1000, .075);
      if (stop) lessonDemoStops.add(stop);
      later(() => document.querySelector(`.demo-key[data-midi="${midi}"]`)?.classList.add("sounding"), delay);
      later(() => document.querySelector(`.demo-key[data-midi="${midi}"]`)?.classList.remove("sounding"), delay + duration * 1000);
    });
    later(() => { stopLessonDemo(); status.textContent = "试听结束。点击琴键，自己试一遍。"; }, sequential ? notes.length * 480 + 250 : 2200);
  } catch {
    if (run !== lessonDemoRun) return;
    stopLessonDemo();
    status.textContent = "钢琴音色未能加载，请再点一次试听。";
  }
}

function mountLessonKeyboard(chord) {
  const demo = document.querySelector(".lesson-keyboard-demo");
  demo.querySelectorAll("[data-keyboard-mode]").forEach(button => button.addEventListener("click", () => {
    stopLessonDemo();
    lessonKeyboardMode = button.dataset.keyboardMode;
    demo.outerHTML = renderLessonKeyboard(chord);
    mountLessonKeyboard(chord);
    document.querySelector(`[data-keyboard-mode="${lessonKeyboardMode}"]`).focus({ preventScroll: true });
  }));
  demo.querySelectorAll("[data-midi]").forEach(key => key.addEventListener("click", () => playLessonDemo([Number(key.dataset.midi)])));
  demo.querySelector(".demo-play").addEventListener("click", event => {
    if (event.currentTarget.dataset.playing === "true") {
      stopLessonDemo();
      demo.querySelector(".demo-status").textContent = "已停止试听。";
      return;
    }
    const scaleMode = lessonKeyboardMode === "scale";
    playLessonDemo(scaleMode ? LessonScales.forChord(chord).notes.map(note => note.midi) : chord.midi, scaleMode);
  });
}
function renderChordList() {
  const list = document.querySelector("#chord-list");
  const picker = document.querySelector("#chord-picker");
  picker.addEventListener("keydown", event => {
    if (event.key === "Escape" && picker.open) {
      picker.open = false;
      picker.querySelector("summary").focus();
      event.preventDefault();
    }
  });
  document.addEventListener("click", event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  list.innerHTML = chords.map((chord, index) => `
    <button class="chord-item ${index === 0 ? "active" : ""}" data-chord-id="${chord.id}">
      <span class="num">${String(index + 1).padStart(2, "0")}</span><span class="symbol">${chord.html}</span>
      <span class="desc"><strong>${chord.name}</strong><small>${chord.mood}</small></span>
    </button>`).join("");
  list.querySelectorAll(".chord-item").forEach(button => button.addEventListener("click", () => {
    const id=button.dataset.chordId;
    const study=PracticeCatalog.forSong(activeLesson?.song);
    selectLesson(id,study?.voicings[id]?study.config.song:undefined);
    picker.open = false;
    picker.querySelector("summary").focus({ preventScroll: true });
  }));
}

function renderLessonKeyboard(chord) {
  const scale = LessonScales.forChord(chord);
  const scaleMode = lessonKeyboardMode === "scale" && scale;
  const whitePitchClasses = new Set(["C", "D", "E", "F", "G", "A", "B"]);
  const rootMidi = chord.midi[0];
  const rootIsWhite = whitePitchClasses.has(noteNames[rootMidi % 12]);
  const firstMidi = scaleMode ? rootMidi - (rootIsWhite ? 0 : 1) : 48;
  const lastMidi = scaleMode ? rootMidi + 12 + (rootIsWhite ? 0 : 1) : 71;
  const keys = Array.from({ length: lastMidi - firstMidi + 1 }, (_, index) => {
    const midi = firstMidi + index;
    const pc = noteNames[midi % 12];
    return { midi, pc, white: whitePitchClasses.has(pc) };
  });
  const whiteKeys = keys.filter(key => key.white);
  const blackKeys = keys.filter(key => !key.white).map(key => ({
    ...key,
    left: whiteKeys.filter(white => white.midi < key.midi).length / whiteKeys.length * 100
  }));
  const labelFor = key => {
    const scaleNote = scaleMode && scale.notes.find(note => note.midi % 12 === key.midi % 12);
    if (scaleNote) return scaleNote.name;
    const noteIndex = chord.midi.indexOf(key.midi);
    if (noteIndex >= 0) return chord.notes[noteIndex];
    const octave = Math.floor(key.midi / 12) - 1;
    return key.pc === "C" ? `${displayNames[key.pc]}${octave}` : displayNames[key.pc];
  };
  const keyClass = midi => {
    if (scaleMode) {
      const note = scale.notes.find(note => note.midi === midi);
      return note ? ` active ${note.role}` : "";
    }
    return chord.midi.includes(midi) ? ` active ${midi === chord.midi[0] ? "root" : "tone"}` : "";
  };
  const renderKey = key => {
    const note = scaleMode && scale.notes.find(note => note.midi === key.midi);
    const chordIndex = chord.midi.indexOf(key.midi);
    const role = note ? ({root:"根音", tone:"和弦音", scale:"其余音阶音"}[note.role]) : !scaleMode && chordIndex >= 0 ? "和弦音" : "未高亮";
    return `<button type="button" class="demo-key ${key.white ? "white" : "black"}${keyClass(key.midi)}" data-midi="${key.midi}" ${key.white ? "" : `style="left:calc(${key.left}% - ${30 / whiteKeys.length}%);width:${60 / whiteKeys.length}%"`} aria-label="${labelFor(key).replace(/[0-9]/g, "")}${Math.floor(key.midi / 12) - 1}，${role}${note ? `，第 ${note.degree} 级` : ""}，点击试听"><b>${labelFor(key)}</b></button>`;
  };
  return `
    <section class="lesson-keyboard-demo" aria-label="${chord.name} 键盘演示">
      <div class="demo-mode" role="group" aria-label="键盘显示内容">
        <button type="button" data-keyboard-mode="chord" aria-pressed="${!scaleMode}">和弦按键</button>
        ${scale ? `<button type="button" data-keyboard-mode="scale" aria-pressed="${Boolean(scaleMode)}">对应音阶</button>` : ""}
      </div>
      <div class="demo-heading">
        <div><span class="tag">${scaleMode ? "SCALE · 音阶找键" : "KEYBOARD DEMO"}</span><h3>${scaleMode ? scale.name : "这些键要一起弹下去"}</h3></div>
        <div class="demo-legend"><span><i class="root-dot"></i>根音</span><span><i class="tone-dot"></i>和弦音</span>${scaleMode ? '<span><i class="scale-dot"></i>其余音阶音</span>' : ""}</div>
      </div>
      ${scaleMode ? `<p class="demo-explanation">音阶是一个个弹的音，和弦是几个音一起响。下面是一种入门练习选择；实际配曲还要看调性与前后和弦。</p>` : ""}
      <div class="demo-keyboard-scroller">
        <div class="demo-keyboard${scaleMode ? " scale-keyboard" : ""}" ${scaleMode ? `style="min-width:${whiteKeys.length * 32}px"` : ""} aria-label="${scaleMode ? scale.notes.map(note => note.name).join("、") : chord.notes.join("、")} 已高亮">
          ${keys.map(key => renderKey(key.white ? key : blackKeys.find(black => black.midi === key.midi))).join("")}
        </div>
      </div>
      ${scaleMode ? `<div class="demo-scale-notes" aria-label="音阶音名与级数">${scale.notes.map(note => `<span class="${note.role}"><b>${note.name}</b><small>${note.degree}</small></span>`).join("")}</div><p class="demo-explanation">${scale.hint}</p>` : ""}
      <div class="demo-bottom">
        <p><strong>${chord.html}</strong><span>${scaleMode ? "从根音到高八度" : chord.notes.join(" · ")}</span></p>
        <button type="button" class="demo-play" aria-label="${scaleMode ? "顺序播放音阶" : `播放 ${chord.name} 键盘演示`}"><span>▶</span> ${scaleMode ? "顺序听音阶" : "聆听和弦"}</button>
      </div>
      <p class="demo-status" role="status">点击任意琴键可以试听单音。${scaleMode ? "级数按同根音大调标记，8 表示高八度。" : "橙色是根音，绿色是其余和弦音。"}</p>
    </section>`;
}

function renderSongUsage(chord) {
  return `
    <div class="song-location" aria-label="${chord.name} 在歌曲中的出现位置">
      <div class="location-heading">
        <span>出现位置</span>
        <strong>${chord.usage.title}</strong>
      </div>
      <div class="song-section-track">
        ${chord.usage.sections.map(([label, active]) => `
          <span class="song-section ${active ? "active" : ""}"><i></i><b>${label}</b></span>
        `).join("")}
      </div>
      <p class="listening-cue"><span>↳</span>${chord.usage.cue}</p>
    </div>`;
}

function renderSongScore(chord) {
  const study=PracticeCatalog.forSong(chord.song);
  if(!study)return "";
  return `<a class="jt-score-jump" href="#${PracticeCatalog.anchor(study)}"><strong>↓ 打开下方的${study.config.sectionLabel}练习谱</strong><small>${study.barCount} 小节 · 4 拍预备 · 双手 / 分手 · 已学和弦高亮 · 手动伴奏</small></a>`;
}
function renderFinalPracticePiece(chord) {
  return window.PracticePlayer?.render(chord)||"";
}

function selectLesson(id, song) {
  stopLessonDemo();
  window.PracticePlayer?.dispose();
  const base=chords.find(item=>item.id===id)||chords[0];
  const study=PracticeCatalog.forSong(song||base.song);
  let chord=base;
  if(study&&study.config.song!==base.song){
    const locations=[...new Set(study.harmony.filter(h=>h.chord===id).map(h=>Math.floor(h.start/16)+1))];
    chord={...base,song:study.config.song,artist:study.config.artist||chords.find(c=>c.song===study.config.song)?.artist||'',
      context:study.config.description,
      progression:study.harmony.map(h=>study.voicings[h.chord].label).join(' — '),
      usage:{title:`本练习的${study.config.sectionLabel}`,cue:locations.length?`${study.voicings[id].label} 出现在第 ${locations.join('、')} 小节。先听旋律，再开启手动模式，只接手这个和弦。`:`这段没有 ${base.id}；可以先练上面的键盘，或换一首歌。`,sections:Array.from({length:study.barCount},(_,i)=>[`第 ${i+1} 小节`,locations.includes(i+1)])}};
  }
  activeLesson=chord;
  document.querySelector("#chord-picker-label").textContent = `${chord.id.replace("Db", "D♭")} · ${chord.name}`;
  document.querySelectorAll(".chord-item").forEach(button => button.classList.toggle("active", button.dataset.chordId === chord.id));
  document.querySelector("#lesson-panel").innerHTML = `
    <div class="lesson-top">
      <div><span class="tag">SYMBOL · ${chord.mood}</span><h2>${chord.html}</h2><p>${chord.name} · ${chord.notes.join(" — ")}</p></div>
      <button class="lesson-play" aria-label="播放 ${chord.name}">▶</button>
    </div>
    ${renderLessonKeyboard(chord)}
    ${chord.song ? `<div class="song-context">
      <div><span class="tag">从这首歌开始</span><h3>《${chord.song}》</h3><p>${chord.artist}<br>${chord.context}</p></div>
      <div class="song-progression">${chord.progression.replace(chord.id.replace("Db", "Db"), `<b>${chord.id}</b>`)}</div>
      ${renderSongScore(chord)}
      ${renderSongUsage(chord)}
    </div>` : `<p class="demo-explanation">先逐个听组成音，再一起弹响。可以和同根音的其他和弦对比，听听三音与七音如何改变色彩。</p>`}
    <details class="theory-details"><summary>想知道为什么？展开构成公式与乐理</summary>
    <p>这里的数字表示音之间的关系，不是手指编号。可以先照着上面的琴键弹，学过基础后再回来读。</p>
    <div class="theory-grid">
      <div class="theory-block"><h3>01 / 构成公式</h3><div class="formula">${chord.formula.map(note => `<span>${note}</span>`).join("")}</div><p>组成音：<strong>${chord.notes.join(" · ")}</strong></p></div>
      <div class="theory-block"><h3>02 / 符号怎么读</h3><p>${chord.theory}</p></div>
    </div>
    </details>
    <div class="lesson-foot"><span>${chord.song ? "歌曲用于定位听感；不同现场或改编版本的调性可能不同。" : "先认识组成音，再点击右侧按钮练习找键。"}</span><button data-send-practice>自己找出这个和弦 →</button></div>
    ${renderFinalPracticePiece(chord)}`;
  document.querySelector(".lesson-play").addEventListener("click", () => playChord(chord));
  mountLessonKeyboard(chord);
  document.querySelector("[data-send-practice]").addEventListener("click", () => { navigate("piano"); newPianoQuestion(chord); });
  window.PracticePlayer?.mount(chord);
}

const earState = { ready: false, step: 1, score: 0, target: null, answered: false, heard: false, pair: [] };
function sample(array) { return array[Math.floor(Math.random() * array.length)]; }
function shuffle(array) { return [...array].sort(() => Math.random() - .5); }
function newEarQuestion() {
  earState.ready = true; earState.answered = false; earState.heard = false;
  const learned = (window.ChordLearning?.getPracticeChords() || BeginnerCourse.chords.slice(0,2)).map(c => c.id);
  const pairs = [["C","Cm"],["F","Fm"],["Cmaj7","C7"],["C7","Cm7"]].filter(pair => pair.every(id => learned.includes(id)));
  earState.pair = sample(pairs).map(BeginnerCourse.getChord);
  earState.target = sample(earState.pair);
  const options = earState.pair;
  document.querySelector(".ear-shell > p").textContent = `先听 ${options[0].id} 和 ${options[1].id} 的示范，再听题目。两个和弦从同一个音开始，只比较它们的区别。`;
  document.querySelector("#ear-examples").innerHTML = options.map(chord => `<button data-ear-example="${chord.id}">▶ 试听 ${chord.html}</button>`).join("");
  document.querySelectorAll("[data-ear-example]").forEach(button => button.addEventListener("click", () => playPracticeChord(BeginnerCourse.getChord(button.dataset.earExample))));
  document.querySelector("#answer-grid").innerHTML = options.map(chord => `<button class="answer-button" data-answer="${chord.id}" disabled><strong>${chord.html}</strong><span>${chord.name}</span></button>`).join("");
  document.querySelectorAll(".answer-button").forEach(button => button.addEventListener("click", answerEar));
  document.querySelector("#ear-feedback").className = "feedback-row";
  document.querySelector("#ear-feedback span").textContent = "点中间的播放按钮听题目，再选择答案。";
  document.querySelector("#next-ear").disabled = true;
  document.querySelector("#ear-step-label").textContent = `第 ${earState.step} / 10 题`;
  document.querySelector("#next-ear").textContent = earState.step === 10 ? "再练一组 →" : "下一题 →";
  document.querySelector("#ear-progress").style.width = `${earState.step * 10}%`;
}
function answerEar(event) {
  if (earState.answered || !earState.heard) return;
  earState.answered = true;
  const selected = event.currentTarget.dataset.answer;
  const correct = selected === earState.target.id;
  if (correct) earState.score++;
  document.querySelectorAll(".answer-button").forEach(button => {
    button.disabled = true;
    if (button.dataset.answer === earState.target.id) button.classList.add("correct");
    else if (button.dataset.answer === selected) button.classList.add("wrong");
  });
  const feedback = document.querySelector("#ear-feedback");
  feedback.className = `feedback-row ${correct ? "success" : "error"}`;
  const from = earState.pair[0], to = earState.pair[1];
  const before = from.notes.filter(n => !to.notes.includes(n));
  const after = to.notes.filter(n => !from.notes.includes(n));
  const change = `${from.id} 里的 ${before.join("、")}，在 ${to.id} 中变成 ${after.join("、")}。可以再听上面的示范。`;
  feedback.querySelector("span").textContent = `${correct ? "听对了！" : `这次是 ${earState.target.id}。`}${change}${earState.step === 10 ? ` 这一组答对 ${earState.score} / 10 题。` : ""}`;
  document.querySelector("#next-ear").disabled = false;
}
async function playPracticeChord(chord) {
  if (window.ChordLearning) return window.ChordLearning.playNotes(chord.midi);
  playChord(chord,false);
  return true;
}
document.querySelector("#quiz-play").addEventListener("click", async () => {
  const target = earState.target;
  if(!target) return;
  const played = await playPracticeChord(target);
  if(!played) { document.querySelector("#ear-feedback span").textContent = "请打开右上角的声音，再播放题目。若仍没有声音，请稍后重试。"; return; }
  if(earState.target !== target) return;
  earState.heard = true;
  if(!earState.answered) document.querySelectorAll(".answer-button").forEach(button => button.disabled = false);
  const orbit = document.querySelector(".audio-orbit"); orbit.classList.add("playing"); setTimeout(() => orbit.classList.remove("playing"), 1500);
});
document.querySelector("#next-ear").addEventListener("click", () => {
  if(earState.step === 10) earState.score = 0;
  earState.step = earState.step >= 10 ? 1 : earState.step + 1;
  newEarQuestion();
});

const pianoState = { ready: false, step: 1, target: null, selected: new Map() };
function buildKeyboard() {
  const keyboard = document.querySelector("#keyboard");
  const whites = [0,2,4,5,7,9,11];
  const blackOffsets = {1: 1, 3: 2, 6: 4, 8: 5, 10: 6};
  let html = "";
  for (let octave = 3; octave <= 4; octave++) {
    whites.forEach(pc => { const midi = (octave + 1) * 12 + pc; html += `<button class="piano-key white" data-midi="${midi}" data-pc="${noteNames[pc]}">${displayNames[noteNames[pc]]}${octave}</button>`; });
    Object.entries(blackOffsets).forEach(([pc, left]) => { const midi = (octave + 1) * 12 + Number(pc); html += `<button class="piano-key black" style="left:${(Number(left) + (octave - 3) * 7) / 14 * 100}%" data-midi="${midi}" data-pc="${noteNames[pc]}">${displayNames[noteNames[pc]]}</button>`; });
  }
  keyboard.innerHTML = html;
  keyboard.querySelectorAll(".piano-key").forEach(key => key.addEventListener("click", toggleKey));
}
function newPianoQuestion(forcedChord) {
  const pool = window.ChordLearning?.getPracticeChords() || BeginnerCourse.chords.slice(0,2);
  pianoState.ready = true; pianoState.selected.clear(); pianoState.target = forcedChord || sample(pool);
  document.querySelector("#challenge-chord").innerHTML = pianoState.target.html;
  document.querySelector("#challenge-hint").textContent = `找到 ${pianoState.target.notes.length} 个不同的音。需要时可以看提示。`;
  document.querySelector("#piano-step-label").textContent = `第 ${pianoState.step} 次练习`;
  document.querySelector("#piano-show-hint").disabled = false;
  document.querySelectorAll(".piano-key").forEach(key => {
    const label = practiceNoteLabel(key.dataset.pc);
    key.textContent = label;
    key.setAttribute("aria-label",`${label}，第 ${Math.floor(Number(key.dataset.midi)/12)-1} 组`);
  });
  document.querySelector("#piano-progress").style.width = `${Math.min(pianoState.step, 10) * 10}%`;
  clearKeys();
}
function toggleKey(event) {
  const key = event.currentTarget; const midi = Number(key.dataset.midi); const pc = key.dataset.pc;
  if(window.ChordLearning) window.ChordLearning.playNotes([midi],.8); else playMidi(midi, .8, 0, .11);
  if (pianoState.selected.has(midi)) pianoState.selected.delete(midi); else pianoState.selected.set(midi, pc);
  key.classList.toggle("selected"); key.setAttribute("aria-pressed",String(pianoState.selected.has(midi))); updateSelectedNotes();
  document.querySelector("#check-keys").dataset.next = "false";
  document.querySelector("#check-keys").innerHTML = `检查答案 <span>→</span>`;
  document.querySelector("#piano-feedback").className = "piano-feedback";
  document.querySelector("#piano-feedback").textContent = "改好了可以再检查一次。";
}
function practiceNoteLabel(pc) {
  const index = pianoState.target?.pcs.indexOf(pc) ?? -1;
  return index >= 0 ? pianoState.target.notes[index] : ({Cs:"D♭",Ds:"E♭",Fs:"G♭",Gs:"A♭",As:"B♭"}[pc] || displayNames[pc]);
}
function updateSelectedNotes() {
  const holder = document.querySelector("#selected-notes");
  const values = [...pianoState.selected.values()];
  const slots = Math.max(pianoState.target?.pcs.length || 4, values.length);
  holder.innerHTML = Array.from({length:slots}, (_,i) => `<span class="${values[i] ? "filled" : ""}">${values[i] ? practiceNoteLabel(values[i]) : "—"}</span>`).join("");
}
function clearKeys() {
  pianoState.selected.clear(); document.querySelectorAll(".piano-key").forEach(key => { key.classList.remove("selected"); key.setAttribute("aria-pressed","false"); }); updateSelectedNotes();
  const feedback = document.querySelector("#piano-feedback"); feedback.className = "piano-feedback"; feedback.textContent = "同名的高音、低音都可以选。这里检查组成音；到琴上再练同时按下。";
  document.querySelector("#check-keys").innerHTML = `检查答案 <span>→</span>`; document.querySelector("#check-keys").dataset.next = "false";
}
document.querySelector("#clear-keys").addEventListener("click", clearKeys);
document.querySelector("#piano-show-hint").addEventListener("click", () => {
  const target = pianoState.target;
  document.querySelector("#challenge-hint").textContent = `先找到 ${target.notes[0]}，再选 ${target.notes.slice(1).join("、")}。它们一起响，就是 ${target.id}。`;
});
document.querySelector("#check-keys").addEventListener("click", event => {
  if (event.currentTarget.dataset.next === "true") { pianoState.step++; newPianoQuestion(); return; }
  const selectedPcs = [...new Set(pianoState.selected.values())].sort();
  const expectedPcs = [...pianoState.target.pcs].sort();
  const correct = selectedPcs.length === expectedPcs.length && selectedPcs.every((pc,i) => pc === expectedPcs[i]);
  const feedback = document.querySelector("#piano-feedback"); feedback.className = `piano-feedback ${correct ? "success" : "error"}`;
  if (correct) {
    feedback.textContent = `漂亮！${pianoState.target.name} = ${pianoState.target.notes.join(" · ")}`;
    playPracticeChord(pianoState.target); event.currentTarget.innerHTML = `下一题 <span>→</span>`; event.currentTarget.dataset.next = "true";
  } else {
    const missing = pianoState.target.pcs.filter(pc => !selectedPcs.includes(pc)).map(practiceNoteLabel);
    const extra = selectedPcs.filter(pc => !expectedPcs.includes(pc)).map(practiceNoteLabel);
    const kept = selectedPcs.filter(pc => expectedPcs.includes(pc)).map(practiceNoteLabel);
    feedback.textContent = selectedPcs.length ? `${kept.length ? `${kept.join("、")} 已经找对了。` : ""}${extra.length ? `先取消 ${extra.join("、")}。` : ""}${missing.length ? `再找 ${missing.join("、")}。` : ""}` : "先在键盘上选择一个音。可以点“给我一点提示”。";
  }
});

renderChordList();
selectLesson("Cmaj7");
buildKeyboard();
loadPianoSamples();
