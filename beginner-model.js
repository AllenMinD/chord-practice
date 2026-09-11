(function (root) {
  "use strict";
  const chord = (id, name, notes, midi) => ({ id, name, notes, midi, pcs: midi.map(n => ["C","Cs","D","Ds","E","F","Fs","G","Gs","A","As","B"][n % 12]), html: id.replace(/(maj7|m7|m|7)$/, "<sup>$1</sup>") });
  const chords = [
    chord("C", "C 大和弦", ["C","E","G"], [60,64,67]),
    chord("Cm", "C 小和弦", ["C","E♭","G"], [60,63,67]),
    chord("F", "F 大和弦", ["F","A","C"], [65,69,72]),
    chord("Fm", "F 小和弦", ["F","A♭","C"], [65,68,72]),
    chord("Cmaj7", "C 大七和弦", ["C","E","G","B"], [60,64,67,71]),
    chord("C7", "C 属七和弦", ["C","E","G","B♭"], [60,64,67,70]),
    chord("Cm7", "C 小七和弦", ["C","E♭","G","B♭"], [60,63,67,70])
  ];
  const getChord = id => chords.find(item => item.id === id);
  const lessons = [
    { id: "first", title: "弹出第一个和弦", description: "找到 C，弹出 C，再让它变成 Cm。", duration: "约 5 分钟", symbols: ["C","Cm"], steps: [
      { id: "find-c", mode: "find", title: "先找到 C", text: "看两颗一组的黑键。它们左边紧挨着的白键叫 C，点一下这颗白键。", target: "C", expected: [60], labels: "c", hints: true, success: "找到了！C 是这颗琴键的名字。往右弹，声音会越来越高。" },
      { id: "build-c", mode: "build", title: "再认识 E 和 G", text: "依次点选亮起的 C、E、G。每点一下，听听它自己的声音。", target: "C", labels: "all", hints: true, success: "三个音都找到了。下一步，让它们一起响。" },
      { id: "hear-c", mode: "listen", title: "三个音，一起响", text: "点“一起听”，让刚才的 C、E、G 同时发声。这组声音叫 C 大和弦，谱上通常只写 C。", target: "C", labels: "all", hints: true, success: "看到和弦代号 C，你现在有了一种弹法：C、E、G 一起弹。" },
      { id: "recall-c", mode: "recall", title: "只看 C，自己找一次", text: "这次没有高亮提示。找到刚才的三个音，点选后检查。忘了也可以要一点提示。", target: "C", labels: "all", success: "你把代号 C 和它的三个音连起来了。" },
      { id: "move-cm", mode: "transform", title: "只移动一个音", text: "保留 C 和 G。先点 E 取消它，再点 E 左边紧邻的黑键 E♭（读作“降 E”）。", target: "Cm", from: "C", labels: "all", hints: true, success: "C 变成了 Cm！m 表示“小和弦”。E 到 E♭ 的距离叫半音：移到紧邻的琴键，黑键、白键都算。" },
      { id: "recall-cm", mode: "recall", title: "看到 Cm，你会怎么弹？", text: "这次只留下 C 的位置。自己找到三个音，再听听你拼出的声音。", target: "Cm", labels: "c", success: "找对了。Cm 的三个音是 C、E♭、G。" },
      { id: "play-first", mode: "duet", title: "把它们放进一小段音乐", text: "先听 4 下准备拍。橙色框会提示当前和弦，跟着点下方的 C 或 Cm；每个和弦持续 4 拍。", target: "C", sequence: ["C","Cm","C","Cm"], labels: "all", hints: true, success: "你已经用 C 和 Cm 完成一段屏幕跟弹。到真实钢琴上，再试试同时按下这些音。" }
    ] },
    { id: "move", title: "换个起点，也能读懂", description: "认识 F，把“大变小”的方法再用一次。", duration: "约 4 分钟", symbols: ["F","Fm"], steps: [
      { id: "find-f", mode: "find", title: "现在，找到 F", text: "三颗一组的黑键，左边紧挨着的白键叫 F。点一下它。", target: "F", expected: [65], labels: "all", hints: true, success: "找到了 F。琴键的字母按 C、D、E、F、G、A、B 循环，右边又是一个 C。" },
      { id: "build-f", mode: "build", title: "从 F 开始的三个音", text: "选中 F、A，以及最右边的 C。这里的 C 比前一课的 C 高，它们名字相同、位置不同。", target: "F", labels: "all", hints: true, success: "F、A、C 组成 F 大和弦，代号只写 F。" },
      { id: "hear-f", mode: "listen", title: "听听这个新和弦", text: "字母告诉你从哪个音建立和弦。C 和 F 的起点不同，但它们都是大和弦。点“一起听”听听 F。", target: "F", labels: "all", hints: true, success: "你又认识了一个大和弦：F。" },
      { id: "move-fm", mode: "transform", title: "把 F 变成 Fm", text: "还记得 m 吗？保留两边的 F 和 C，把中间的 A 向左移到紧邻的琴键。你来找找看。", target: "Fm", from: "F", labels: "all", success: "对了，是 A♭。和 C 变 Cm 一样：把大三和弦中间的音降低半音，就变成小三和弦。" },
      { id: "recall-fm", mode: "recall", title: "撤掉提示，再弹 Fm", text: "从 F 开始，找到刚才的三个音。需要时可以再看一遍提示。", target: "Fm", labels: "all", success: "你已经把 m 的规则用到了一个新起点。" },
      { id: "play-move", mode: "duet", title: "用两个起点做小伴奏", text: "这次轮流弹 C 和 F。先在屏幕上跟着 4 拍换一次，再到琴上尝试。", target: "C", sequence: ["C","F","C","F"], labels: "all", hints: true, success: "完成了 C 与 F 的屏幕跟弹。琴上换和弦时，可以先停下来找齐三个音，再慢慢连接。" }
    ] },
    { id: "sevenths", title: "看懂 m、7 和 maj7", description: "从三个音到四个音，看清后缀改变了什么。", duration: "约 6 分钟", symbols: ["Cmaj7","C7","Cm7"], steps: [
      { id: "add-maj7", mode: "transform", title: "在 C 上，再加一个 B", text: "保留 C、E、G，点选 B。这四个音组成 Cmaj7，读作“C 大七和弦”。先把 maj7 当作一个完整标记来认识。", target: "Cmaj7", from: "C", labels: "all", hints: true, success: "Cmaj7 = C、E、G、B。代号里的 7 不是“按七颗键”，它描述的是音的关系。" },
      { id: "lower-seven", mode: "transform", title: "maj7 和 7，只差这里", text: "保留 C、E、G，把 B 移到左边紧邻的黑键 B♭。注意代号从 Cmaj7 变成了 C7。", target: "C7", from: "Cmaj7", labels: "all", hints: true, success: "C7 加入的是 B♭，Cmaj7 加入的是 B。点两边的示范，反复听这个差别。" },
      { id: "recall-maj7", mode: "recall", title: "现在自己拼出 Cmaj7", text: "想一想：在 C 的三个音上，maj7 加入的是哪颗键？", target: "Cmaj7", labels: "all", success: "对了，Cmaj7 的第四个音是 B。" },
      { id: "recall-seven", mode: "recall", title: "再试一次 C7", text: "这次没有 maj。自己点选四颗琴键，再检查。", target: "C7", labels: "all", success: "C7 的第四个音是 B♭。两个代号的差别，现在能在键盘上找出来了。" },
      { id: "make-m7", mode: "transform", title: "m 和 7，可以组合", text: "从 C7 出发，保留 C、G、B♭，把 E 移到左边紧邻的 E♭。这就是 Cm7：小和弦再加 B♭。", target: "Cm7", from: "C7", labels: "all", hints: true, success: "Cm7 = C、E♭、G、B♭。m 改变三音，7 告诉你这里加入小七音。" },
      { id: "recall-m7", mode: "recall", title: "独立找到 Cm7", text: "把 m 和 7 的变化合起来，用四个音拼出这个和弦。", target: "Cm7", labels: "all", success: "四个音都找对了。你已经能组合两个后缀的含义。" },
      { id: "play-sevenths", mode: "duet", title: "让代号变成连续的声音", text: "跟着提示，依次点 C、Cmaj7、C7、Cm7。留意每次新增或移动的那一个音。", target: "C", sequence: ["C","Cmaj7","C7","Cm7"], labels: "all", hints: true, success: "这段变化完成了。接下来可以进入歌曲与和弦库，认识这些代号在音乐里的用法。" }
    ] }
  ];
  const storageKey = "chord-practice.beginner.v1";
  const expected = step => step.expected || getChord(step.target).midi;
  const sameNotes = (a, b) => a.length === b.length && [...a].sort((x,y) => x-y).every((n,i) => n === [...b].sort((x,y) => x-y)[i]);
  function assess(step, selected) {
    const target = expected(step);
    const missing = target.filter(n => !selected.includes(n));
    const extra = selected.filter(n => !target.includes(n));
    return { correct: !missing.length && !extra.length, missing, extra };
  }
  function freshProgress() { return { version: 1, checkpoints: {}, recalls: {}, completedOn: {}, lastLesson: "first", practiceDays: [] }; }
  function cleanProgress(raw) {
    const state = freshProgress();
    if (!raw || raw.version !== 1) return state;
    for (const lesson of lessons) {
      const count = Number(raw.checkpoints?.[lesson.id]);
      state.checkpoints[lesson.id] = Number.isInteger(count) ? Math.max(0, Math.min(lesson.steps.length, count)) : 0;
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw.completedOn?.[lesson.id] || "")) state.completedOn[lesson.id] = raw.completedOn[lesson.id];
    }
    for (const item of chords) {
      const record = raw.recalls?.[item.id];
      if (record && /^\d{4}-\d{2}-\d{2}$/.test(record.date || "")) state.recalls[item.id] = { date: record.date, reviewed: record.reviewed === true };
    }
    if (lessons.some(l => l.id === raw.lastLesson)) state.lastLesson = raw.lastLesson;
    state.practiceDays = Array.isArray(raw.practiceDays) ? [...new Set(raw.practiceDays.filter(day => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day)))].slice(-90) : [];
    return state;
  }
  function completeStep(progress, lessonId, index, unassisted, day) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || !lesson.steps[index]) return progress;
    const next = cleanProgress(progress);
    // A checkpoint only moves through completed steps, never over an unplayed step.
    const frontier = next.checkpoints[lessonId] || 0;
    if (index > frontier) return next;
    next.checkpoints[lessonId] = Math.max(frontier, index + 1);
    next.lastLesson = lessonId;
    next.practiceDays = [...new Set([...next.practiceDays, day])].slice(-90);
    const step = lesson.steps[index];
    if ((step.mode === "recall" || (step.mode === "transform" && !step.hints)) && unassisted) {
      const previous = next.recalls[step.target];
      next.recalls[step.target] = { date: day, reviewed: !!previous && (previous.reviewed || previous.date < day) };
    }
    if (next.checkpoints[lessonId] === lesson.steps.length) next.completedOn[lessonId] = next.completedOn[lessonId] || day;
    return next;
  }
  function learnedChords(progress) {
    const ids = ["C","Cm"];
    for (const lesson of lessons) {
      lesson.steps.slice(0, progress.checkpoints[lesson.id] || 0).forEach(step => { if (step.mode !== "find") ids.push(step.target); });
    }
    return [...new Set(ids)].map(getChord);
  }
  const api = { chords, getChord, lessons, storageKey, expected, sameNotes, assess, freshProgress, cleanProgress, completeStep, learnedChords };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BeginnerCourse = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
