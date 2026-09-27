/**
 * Noir sound engine — every sound on the site, synthesised with the Web Audio
 * API (no files to download).
 *
 * Voices
 *   ambience  café room tone (brown noise, low-passed, breathing) with a felt
 *             piano drifting through it and the odd cup set down far away
 *   pour      espresso pour — band-passed flow with bubbling and a low gurgle
 *   steam     steam wand hiss — high-passed noise that swells and fades
 *   grinder   burr grinder — motor hum with gritty chatter
 *   beans     coffee beans — a scatter of small, bright clicks
 *   cup       ceramic cup — a short inharmonic clink
 *   note      one felt-piano note (favourites)
 *   confirm   a cup set down and a soft felt-piano chord (confirmations)
 *
 * Behaviour
 *   · Muted by default. Sound starts only from a user gesture (the toggle),
 *     which also satisfies autoplay policies; the choice is kept per session.
 *   · The master bus fades in/out (~1.2s); one-shots are no-ops while muted.
 *   · The audio context suspends while the tab is hidden and resumes on return.
 *   · Optional recorded ambience: setAmbienceSource("/audio/room.mp3").
 */

export type Voice = "pour" | "steam" | "grinder" | "beans" | "cup" | "note" | "confirm";

const PREF_KEY = "noir:sound";
const MASTER = 0.9;
const AMBIENCE_GAIN = 0.12;
const FADE_S = 1.2;
/** A–minor pentatonic around middle C — calm, never dissonant. */
const PIANO_NOTES = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];

type Listener = () => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private ambience: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private pianoTimer: number | undefined;
  private clinkTimer: number | undefined;
  private recorded: string | null = null;
  private listeners = new Set<Listener>();
  enabled = false;

  get supported() {
    return typeof window !== "undefined" && "AudioContext" in window;
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  setAmbienceSource(src: string | null) {
    this.recorded = src;
  }

  /** Was sound left on earlier this session? (Resumes on the next gesture.) */
  get remembered() {
    try {
      return sessionStorage.getItem(PREF_KEY) === "on";
    } catch {
      return false;
    }
  }

  private graph() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const fx = ctx.createGain();
    fx.gain.value = 0.5;
    fx.connect(master);
    const ambience = ctx.createGain();
    ambience.gain.value = AMBIENCE_GAIN;
    ambience.connect(master);

    // Two seconds of white noise, shared by every noisy voice.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    Object.assign(this, { ctx, master, fx, ambience, noise });
    this.startAmbience();
    document.addEventListener("visibilitychange", this.onVisibility);
    return ctx;
  }

  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else if (this.enabled) void this.ctx.resume();
  };

  /** Turn sound on (must be called from a user gesture) or off, with a fade. */
  async setEnabled(on: boolean) {
    if (!this.supported) return;
    this.enabled = on;
    try {
      sessionStorage.setItem(PREF_KEY, on ? "on" : "off");
    } catch {}
    this.emit();
    if (!on && !this.ctx) return;
    const ctx = this.graph();
    if (on && ctx.state !== "running") await ctx.resume();
    const g = this.master!.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setTargetAtTime(on ? MASTER : 0, ctx.currentTime, FADE_S / 3);
    if (on) this.scheduleAmbientEvents();
    else this.stopAmbientEvents();
  }

  toggle() {
    return this.setEnabled(!this.enabled);
  }

  /** Play a one-shot. Silent (and free) while muted. */
  play(voice: Voice) {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime + 0.01;
    switch (voice) {
      case "pour": return this.pour(t);
      case "steam": return this.steam(t);
      case "grinder": return this.grinder(t);
      case "beans": return this.beans(t);
      case "cup": return this.cup(t, this.fx!);
      case "note": return this.piano(t, PIANO_NOTES[4], 0.22, this.fx!);
      case "confirm":
        this.cup(t, this.fx!);
        [PIANO_NOTES[1], PIANO_NOTES[3], PIANO_NOTES[5]].forEach((f, i) => this.piano(t + 0.18 + i * 0.07, f, 0.14, this.fx!));
        return;
    }
  }

  // ── Voices ──────────────────────────────────────────────────────────────

  private noiseSource(t: number, duration: number) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(t, Math.random() * 1.5);
    src.stop(t + duration + 0.1);
    return src;
  }

  private envelope(t: number, attack: number, hold: number, release: number, peak: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    return g;
  }

  private pour(t: number, duration = 2.6) {
    const ctx = this.ctx!;
    const band = new BiquadFilterNode(ctx, { type: "bandpass", frequency: 900, Q: 1.1 });
    // Bubbling: the band's centre wanders quickly.
    const wobble = new OscillatorNode(ctx, { frequency: 7 });
    const depth = new GainNode(ctx, { gain: 260 });
    wobble.connect(depth).connect(band.frequency);
    wobble.start(t);
    wobble.stop(t + duration);
    const env = this.envelope(t, 0.25, duration - 0.9, 0.6, 0.5);
    this.noiseSource(t, duration).connect(band).connect(env).connect(this.fx!);
    // Low gurgle underneath.
    const gurgle = new OscillatorNode(ctx, { type: "sine", frequency: 140 });
    gurgle.frequency.setValueAtTime(140, t);
    gurgle.frequency.linearRampToValueAtTime(110, t + duration);
    const gEnv = this.envelope(t, 0.3, duration - 1, 0.6, 0.08);
    gurgle.connect(gEnv).connect(this.fx!);
    gurgle.start(t);
    gurgle.stop(t + duration);
  }

  private steam(t: number, duration = 1.4) {
    const ctx = this.ctx!;
    const hp = new BiquadFilterNode(ctx, { type: "highpass", frequency: 3800, Q: 0.7 });
    const env = this.envelope(t, 0.35, duration - 0.8, 0.45, 0.28);
    this.noiseSource(t, duration).connect(hp).connect(env).connect(this.fx!);
  }

  private grinder(t: number, duration = 1.6) {
    const ctx = this.ctx!;
    const motor = new OscillatorNode(ctx, { type: "sawtooth", frequency: 105 });
    const lp = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 700 });
    const mEnv = this.envelope(t, 0.12, duration - 0.4, 0.3, 0.12);
    motor.connect(lp).connect(mEnv).connect(this.fx!);
    motor.start(t);
    motor.stop(t + duration);
    // Burr chatter: grit gated at ~28Hz.
    const band = new BiquadFilterNode(ctx, { type: "bandpass", frequency: 2200, Q: 0.9 });
    const gate = new GainNode(ctx, { gain: 0.5 });
    const chatter = new OscillatorNode(ctx, { type: "square", frequency: 28 });
    const chatterDepth = new GainNode(ctx, { gain: 0.5 });
    chatter.connect(chatterDepth).connect(gate.gain);
    chatter.start(t);
    chatter.stop(t + duration);
    const env = this.envelope(t, 0.12, duration - 0.4, 0.3, 0.3);
    this.noiseSource(t, duration).connect(band).connect(gate).connect(env).connect(this.fx!);
  }

  private beans(t: number) {
    const ctx = this.ctx!;
    const count = 22;
    for (let i = 0; i < count; i++) {
      // Dense at first, thinning out like beans settling.
      const at = t + Math.pow(i / count, 1.8) * 0.55 + Math.random() * 0.02;
      const band = new BiquadFilterNode(ctx, { type: "bandpass", frequency: 2800 + Math.random() * 2600, Q: 4 });
      const env = this.envelope(at, 0.001, 0.004, 0.03 + Math.random() * 0.03, 0.35 * (1 - i / count) + 0.08);
      this.noiseSource(at, 0.08).connect(band).connect(env).connect(this.fx!);
    }
  }

  private cup(t: number, out: AudioNode, level = 0.18) {
    const ctx = this.ctx!;
    // Inharmonic partials of a small ceramic body.
    [2093, 3322, 4987, 6620].forEach((f, i) => {
      const osc = new OscillatorNode(ctx, { type: "sine", frequency: f * (1 + (Math.random() - 0.5) * 0.004) });
      const env = this.envelope(t, 0.002, 0, 0.35 - i * 0.06, level / (i + 1));
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  private piano(t: number, freq: number, level: number, out: AudioNode) {
    const ctx = this.ctx!;
    // Felt piano: soft attack, muffled top end, long decay, a touch of detune.
    const lp = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 1400, Q: 0.4 });
    lp.connect(out);
    [1, 2, 3, 4.01].forEach((h, i) => {
      const osc = new OscillatorNode(ctx, { type: "sine", frequency: freq * h, detune: (Math.random() - 0.5) * 6 });
      const env = this.envelope(t, 0.012, 0.02, 2.6 - i * 0.45, level / (1 + i * 1.6));
      osc.connect(env).connect(lp);
      osc.start(t);
      osc.stop(t + 3);
    });
  }

  // ── Ambience ────────────────────────────────────────────────────────────

  private startAmbience() {
    const ctx = this.ctx!;
    if (this.recorded) {
      const audio = new Audio(this.recorded);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      ctx.createMediaElementSource(audio).connect(this.ambience!);
      void audio.play().catch(() => {});
      return;
    }
    // Brown-noise room tone, low-passed, with a slow swell like a room breathing.
    const seconds = 4;
    const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.2;
      }
    }
    const src = new AudioBufferSourceNode(ctx, { buffer, loop: true });
    const lp = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 520 });
    const swell = new GainNode(ctx, { gain: 0.85 });
    const lfo = new OscillatorNode(ctx, { frequency: 0.07 });
    const lfoDepth = new GainNode(ctx, { gain: 0.15 });
    lfo.connect(lfoDepth).connect(swell.gain);
    src.connect(lp).connect(swell).connect(this.ambience!);
    src.start();
    lfo.start();
  }

  /** Felt-piano phrases and far-off cups, at random, only while sound is on. */
  private scheduleAmbientEvents() {
    this.stopAmbientEvents();
    const piano = () => {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime + 0.05;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const f = PIANO_NOTES[Math.floor(Math.random() * PIANO_NOTES.length)];
        this.piano(t + i * (0.45 + Math.random() * 0.3), f, 0.05, this.ambience!);
      }
      this.pianoTimer = window.setTimeout(piano, 5000 + Math.random() * 7000);
    };
    const clink = () => {
      if (!this.enabled || !this.ctx) return;
      this.cup(this.ctx.currentTime + 0.05, this.ambience!, 0.05);
      this.clinkTimer = window.setTimeout(clink, 9000 + Math.random() * 14000);
    };
    this.pianoTimer = window.setTimeout(piano, 2500);
    this.clinkTimer = window.setTimeout(clink, 6000);
  }

  private stopAmbientEvents() {
    window.clearTimeout(this.pianoTimer);
    window.clearTimeout(this.clinkTimer);
  }
}

/** The one engine for the page. */
export const sound = new SoundEngine();
