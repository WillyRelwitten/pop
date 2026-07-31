/** Satisfying bubble-pop SFX via Web Audio (no asset files). */

let ctx: AudioContext | null = null;
let clubStopAt = 0;
let clubNodes: AudioNode[] = [];

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
}

export function playPopSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.55;
  master.connect(c.destination);

  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(140, t0);
  thump.frequency.exponentialRampToValueAtTime(48, t0 + 0.12);
  thumpGain.gain.setValueAtTime(0.45, t0);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
  thump.connect(thumpGain);
  thumpGain.connect(master);
  thump.start(t0);
  thump.stop(t0 + 0.15);

  const pop = c.createOscillator();
  const popGain = c.createGain();
  pop.type = "triangle";
  pop.frequency.setValueAtTime(620 + Math.random() * 80, t0);
  pop.frequency.exponentialRampToValueAtTime(180, t0 + 0.08);
  popGain.gain.setValueAtTime(0.35, t0);
  popGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
  pop.connect(popGain);
  popGain.connect(master);
  pop.start(t0);
  pop.stop(t0 + 0.1);

  const noiseBuf = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.015));
  }
  const noise = c.createBufferSource();
  noise.buffer = noiseBuf;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1800;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.28, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(t0);
  noise.stop(t0 + 0.08);
}

/** Cork + fizz + bigger pop for the champagne egg. */
export function playChampagneCork() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.7;
  master.connect(c.destination);

  // Cork pop
  const cork = c.createOscillator();
  const corkG = c.createGain();
  cork.type = "square";
  cork.frequency.setValueAtTime(980, t0);
  cork.frequency.exponentialRampToValueAtTime(120, t0 + 0.09);
  corkG.gain.setValueAtTime(0.22, t0);
  corkG.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
  cork.connect(corkG);
  corkG.connect(master);
  cork.start(t0);
  cork.stop(t0 + 0.11);

  // Deep thump
  const thump = c.createOscillator();
  const thumpG = c.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(90, t0);
  thump.frequency.exponentialRampToValueAtTime(35, t0 + 0.2);
  thumpG.gain.setValueAtTime(0.55, t0);
  thumpG.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
  thump.connect(thumpG);
  thumpG.connect(master);
  thump.start(t0);
  thump.stop(t0 + 0.23);

  // Champagne fizz
  const nLen = Math.floor(c.sampleRate * 0.45);
  const nBuf = c.createBuffer(1, nLen, c.sampleRate);
  const nData = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) {
    nData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.12));
  }
  const fizz = c.createBufferSource();
  fizz.buffer = nBuf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2400;
  const fizzG = c.createGain();
  fizzG.gain.setValueAtTime(0.001, t0);
  fizzG.gain.exponentialRampToValueAtTime(0.32, t0 + 0.02);
  fizzG.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);
  fizz.connect(hp);
  hp.connect(fizzG);
  fizzG.connect(master);
  fizz.start(t0);
  fizz.stop(t0 + 0.45);

  // Sparkle chime
  for (const freq of [1318.5, 1568, 2093]) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.001, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
    o.connect(g);
    g.connect(master);
    o.start(t0 + 0.04);
    o.stop(t0 + 0.56);
  }
}

function stopClubMusic() {
  for (const n of clubNodes) {
    try {
      if ("stop" in n && typeof (n as OscillatorNode).stop === "function") {
        (n as OscillatorNode).stop();
      }
      n.disconnect();
    } catch {
      /* already stopped */
    }
  }
  clubNodes = [];
  clubStopAt = 0;
}

/**
 * ~5s four-on-the-floor club sting (procedural — no audio files).
 * Championship energy without shipping mp3s.
 */
export function playClubSting(durationSec = 5) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  stopClubMusic();

  const t0 = c.currentTime;
  const master = c.createGain();
  master.gain.setValueAtTime(0.001, t0);
  master.gain.exponentialRampToValueAtTime(0.42, t0 + 0.08);
  master.gain.setValueAtTime(0.42, t0 + durationSec - 0.45);
  master.gain.exponentialRampToValueAtTime(0.001, t0 + durationSec);
  master.connect(c.destination);
  clubNodes.push(master);

  const bpm = 128;
  const beat = 60 / bpm;
  const beats = Math.floor(durationSec / beat);

  // Kick
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * beat;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.85, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.2);
    clubNodes.push(osc, g);
  }

  // Offbeat open hat (noise)
  const hatLen = Math.floor(c.sampleRate * 0.05);
  const hatBuf = c.createBuffer(1, hatLen, c.sampleRate);
  const hatData = hatBuf.getChannelData(0);
  for (let i = 0; i < hatLen; i++) {
    hatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.008));
  }
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * beat + beat * 0.5;
    if (t >= t0 + durationSec - 0.05) break;
    const src = c.createBufferSource();
    src.buffer = hatBuf;
    const bp = c.createBiquadFilter();
    bp.type = "highpass";
    bp.frequency.value = 7000;
    const g = c.createGain();
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + 0.06);
    clubNodes.push(src, bp, g);
  }

  // Clap on 2 and 4
  for (let i = 0; i < beats; i++) {
    if (i % 2 !== 1) continue;
    const t = t0 + i * beat;
    const nLen = Math.floor(c.sampleRate * 0.12);
    const nBuf = c.createBuffer(1, nLen, c.sampleRate);
    const d = nBuf.getChannelData(0);
    for (let j = 0; j < nLen; j++) {
      d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.02));
    }
    const src = c.createBufferSource();
    src.buffer = nBuf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + 0.13);
    clubNodes.push(src, bp, g);
  }

  // Bass stab riff (minor party)
  const notes = [55, 55, 65.41, 73.42, 82.41, 73.42, 65.41, 55]; // A1 pattern-ish
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * beat;
    const freq = notes[i % notes.length]!;
    const osc = c.createOscillator();
    const g = c.createGain();
    const filt = c.createBiquadFilter();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(420, t);
    filt.frequency.exponentialRampToValueAtTime(180, t + beat * 0.85);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
    osc.connect(filt);
    filt.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + beat);
    clubNodes.push(osc, filt, g);
  }

  // Supersaw-ish lead stabs every 4 beats
  for (let i = 0; i < beats; i += 4) {
    const t = t0 + i * beat;
    for (const det of [-7, 0, 7]) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 220 * Math.pow(2, det / 1200);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.5);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + beat * 1.6);
      clubNodes.push(osc, g);
    }
  }

  clubStopAt = t0 + durationSec;
  window.setTimeout(() => {
    if (getCtx() && getCtx()!.currentTime >= clubStopAt - 0.05) {
      stopClubMusic();
    }
  }, durationSec * 1000 + 100);
}
