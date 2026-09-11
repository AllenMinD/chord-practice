(function(root) {
  "use strict";
  const patterns = {
    major: { name: "大调音阶", steps: [0, 2, 4, 5, 7, 9, 11], degrees: ["1", "2", "3", "4", "5", "6", "7"] },
    minor: { name: "自然小调音阶", steps: [0, 2, 3, 5, 7, 8, 10], degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"] },
    mixolydian: { name: "混合利底亚音阶", steps: [0, 2, 4, 5, 7, 9, 10], degrees: ["1", "2", "3", "4", "5", "6", "♭7"] }
  };
  const choices = {
    Cmaj7: ["major", ["C", "D", "E", "F", "G", "A", "B"]],
    Dbmaj7: ["major", ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"]],
    C7: ["mixolydian", ["C", "D", "E", "F", "G", "A", "B♭"]],
    Fm7: ["minor", ["F", "G", "A♭", "B♭", "C", "D♭", "E♭"]],
    Fmaj7: ["major", ["F", "G", "A", "B♭", "C", "D", "E"]],
    Em7: ["minor", ["E", "F♯", "G", "A", "B", "C", "D"]],
    Dsus4: ["major", ["D", "E", "F♯", "G", "A", "B", "C♯"]],
    Cadd9: ["major", ["C", "D", "E", "F", "G", "A", "B"]]
  };
  function forChord(chord) {
    const choice = choices[chord.id];
    if (!choice) return null;
    const [kind, names] = choice, pattern = patterns[kind];
    const rootMidi = chord.midi[0];
    const tones = new Set(chord.midi.map(midi => midi % 12));
    return {
      name: `${names[0]} ${pattern.name}`,
      notes: [...pattern.steps, 12].map((step, index) => ({
        midi: rootMidi + step,
        name: names[index % 7],
        degree: index === 7 ? "8" : pattern.degrees[index],
        role: step % 12 === 0 ? "root" : tones.has((rootMidi + step) % 12) ? "tone" : "scale"
      })),
      hint: chord.id === "Dsus4"
        ? "这里用 D 大调练习找音。音阶中的 F♯ 是三音，不属于 Dsus4；弹挂四和弦时只按 D、G、A。"
        : chord.id === "C7"
          ? "可以把它看成 C 大调把 B 降为 B♭，这样就包含了 C7 的四个音。歌曲里 C7 接 Fm7 时，还可能使用别的音阶。"
          : chord.id === "Cadd9"
            ? "D 在音阶里是第 2 级；升高一个八度就是和弦里的 9 音，仍是同名琴键。"
            : "先从根音出发，按高亮琴键从左到右逐个弹；最后回到高一个八度的同名音。"
    };
  }
  const api = { forChord };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.LessonScales = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
