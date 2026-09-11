const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { forChord } = require("../lesson-scales.js");
// Read the actual lesson catalog without starting the DOM application.
const app = fs.readFileSync(require.resolve("../app.js"), "utf8");
const chords = vm.runInNewContext(app.slice(0, app.indexOf("let audioContext;")) + ";chords");
const pitches = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };

test("every lesson has an ascending octave with correctly spelled notes and all its chord tones", () => {
  for (const chord of chords) {
    const scale = forChord(chord);
    assert.ok(scale, chord.id);
    assert.equal(scale.notes.length, 8);
    assert.equal(scale.notes[0].midi, chord.midi[0]);
    assert.equal(scale.notes[7].midi, chord.midi[0] + 12);
    assert.equal(scale.notes[0].role, "root");
    assert.equal(scale.notes[7].role, "root");
    for (const [index, note] of scale.notes.entries()) {
      const accidental = note.name.includes("♭") ? -1 : note.name.includes("♯") ? 1 : 0;
      assert.equal(note.midi % 12, (pitches[note.name[0]] + accidental + 12) % 12, `${chord.id}: ${note.name}`);
      assert.ok(note.midi >= 48 && note.midi <= 71, "note fits the displayed keyboard");
      if (index) assert.ok(note.midi > scale.notes[index - 1].midi);
    }
    const highlightedTones = new Set(scale.notes.filter(n => n.role !== "scale").map(n => n.midi % 12));
    assert.deepEqual(highlightedTones, new Set(chord.midi.map(midi => midi % 12)), chord.id);
  }
});

test("accidentals, suspended thirds and the ninth keep their musical meaning", () => {
  const get = id => forChord(chords.find(chord => chord.id === id));
  assert.deepEqual(get("Dbmaj7").notes.map(n => n.name), ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C", "D♭"]);
  assert.equal(get("C7").notes[6].name, "B♭");
  assert.equal(get("Dsus4").notes[2].role, "scale");
  assert.equal(get("Dsus4").notes[3].role, "tone");
  assert.equal(get("Cadd9").notes[1].role, "tone");
  assert.equal(forChord({ id: "unknown" }), null);
});
