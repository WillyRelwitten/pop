/** Satisfying bubble-pop SFX via Web Audio (no asset files). */

let ctx: AudioContext | null = null;

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

  // Soft low thump
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

  // Bright mid "pop"
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

  // High airy click / fizz
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
