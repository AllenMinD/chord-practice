(function(root) {
  'use strict';
  // Schedule audio against the audio clock; UI timers never determine click timing.
  function create({ getContext, onBeat, onReady, onError, onPulse = () => {}, schedule = setTimeout, cancel = clearTimeout }) {
    let generation = 0, timers = new Set(), sources = [], feedbackSources = [];
    function stop({keepFeedback = false} = {}) {
      generation++;
      timers.forEach(cancel); timers.clear();
      sources.forEach(source => { try { source.stop(); } catch {} }); sources = [];
      if (!keepFeedback) { feedbackSources.forEach(source => { try { source.stop(); } catch {} }); feedbackSources = []; }
    }
    function later(fn, delay) {
      const id = schedule(() => { timers.delete(id); fn(); }, delay);
      timers.add(id);
    }
    function click(ctx, at, accent, quiet = false) {
      const source = ctx.createOscillator(), gain = ctx.createGain();
      source.frequency.value = accent ? 1100 : 800;
      gain.gain.setValueAtTime(.0001, at);
      gain.gain.exponentialRampToValueAtTime(quiet ? (accent ? .08 : .05) : (accent ? .22 : .13), at + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, at + .07);
      source.connect(gain); gain.connect(ctx.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); sources = sources.filter(item => item !== source); };
      sources.push(source); source.start(at); source.stop(at + .08);
    }
    async function start(bpm) {
      stop();
      const current = generation;
      try {
        if (!Number.isFinite(bpm) || bpm <= 0) throw Error('无效速度');
        const ctx = getContext();
        await ctx.resume();
        if (current !== generation) return;
        if (ctx.state !== 'running') throw Error('音频未启动');
        const step = 60 / bpm, beginning = ctx.currentTime + .08;
        for (let i = 0; i < 4; i++) {
          const at = beginning + i * step;
          click(ctx, at, i === 0);
          later(() => { if (current === generation) onBeat(i + 1); }, Math.max(0, (at - ctx.currentTime) * 1000));
        }
        later(() => { if (current === generation) onReady(); }, Math.max(0, (beginning + 4 * step - ctx.currentTime) * 1000));
        let beat = 4;
        function pump() {
          if (current !== generation) return;
          try {
            // Look ahead on the audio clock; skip missed beats instead of bursting after a stall.
            while (beginning + beat * step < ctx.currentTime) beat++;
            while (beginning + beat * step <= ctx.currentTime + .15) {
              const at = beginning + beat * step, number = beat % 4 + 1;
              click(ctx, at, number === 1, true);
              later(() => { if (current === generation) onPulse(number); }, Math.max(0, (at - ctx.currentTime) * 1000));
              beat++;
            }
            later(pump, 50);
          } catch (error) { stop(); onError(error); }
        }
        pump();
      } catch (error) {
        if (current !== generation) return;
        stop(); onError(error);
      }
    }
    function tap() {
      try {
        const ctx = getContext();
        if (ctx.state !== 'running') return false;
        const at = ctx.currentTime, source = ctx.createOscillator(), gain = ctx.createGain();
        // A lower, short woodblock-like tone distinguishes the learner from the count-in.
        source.type = 'triangle'; source.frequency.value = 560;
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.28, at + .003);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .09);
        source.connect(gain); gain.connect(ctx.destination);
        source.onended = () => { source.disconnect(); gain.disconnect(); feedbackSources = feedbackSources.filter(item => item !== source); };
        feedbackSources.push(source); source.start(at); source.stop(at + .1);
        return true;
      } catch { return false; }
    }
    return {start, stop, tap};
  }
  if (typeof module !== 'undefined') module.exports = {create};
  root.RhythmCountIn = {create};
})(typeof window !== 'undefined' ? window : globalThis);
