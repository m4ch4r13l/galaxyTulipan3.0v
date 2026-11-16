// Romantic nocturnal celesta & warm pad procedural song engine (Key: C Major / A Minor)

interface ChordProgressionStep {
  name: string;
  bass: number;
  pad: number[];
  arp: number[];
  melodyPhrase: Array<{ freq: number | null; accent?: number }>;
}

// 8-bar romantic ballad progression (~70 BPM, 8 eighth-note steps per bar)
const SONG_PROGRESSION: ChordProgressionStep[] = [
  {
    name: 'Cmaj9',
    bass: 130.81, // C3
    pad: [261.63, 329.63, 392.0, 493.88, 587.33], // C4 E4 G4 B4 D5
    arp: [261.63, 329.63, 392.0, 493.88, 587.33, 493.88, 392.0, 329.63],
    melodyPhrase: [
      { freq: 659.25, accent: 1.0 }, // E5
      { freq: null },
      { freq: 587.33, accent: 0.75 }, // D5
      { freq: 523.25, accent: 0.85 }, // C5
      { freq: 587.33, accent: 0.9 }, // D5
      { freq: null },
      { freq: 783.99, accent: 0.95 }, // G5
      { freq: null },
    ],
  },
  {
    name: 'Am9',
    bass: 110.0, // A2
    pad: [220.0, 261.63, 329.63, 392.0, 493.88], // A3 C4 E4 G4 B4
    arp: [220.0, 261.63, 329.63, 493.88, 523.25, 493.88, 329.63, 261.63],
    melodyPhrase: [
      { freq: 659.25, accent: 0.95 }, // E5
      { freq: null },
      { freq: 523.25, accent: 0.8 }, // C5
      { freq: 493.88, accent: 0.75 }, // B4
      { freq: 440.0, accent: 0.9 }, // A4
      { freq: null },
      { freq: 523.25, accent: 0.8 }, // C5
      { freq: 587.33, accent: 0.7 }, // D5
    ],
  },
  {
    name: 'Fmaj9',
    bass: 87.31, // F2
    pad: [174.61, 261.63, 329.63, 392.0, 440.0], // F3 C4 E4 G4 A4
    arp: [174.61, 261.63, 329.63, 440.0, 523.25, 440.0, 329.63, 261.63],
    melodyPhrase: [
      { freq: 659.25, accent: 1.0 }, // E5
      { freq: 698.46, accent: 0.75 }, // F5
      { freq: 659.25, accent: 0.85 }, // E5
      { freq: null },
      { freq: 523.25, accent: 0.9 }, // C5
      { freq: null },
      { freq: 440.0, accent: 0.8 }, // A4
      { freq: 523.25, accent: 0.75 }, // C5
    ],
  },
  {
    name: 'G6sus4',
    bass: 98.0, // G2
    pad: [196.0, 246.94, 293.66, 329.63, 392.0], // G3 B3 D4 E4 G4
    arp: [196.0, 246.94, 293.66, 392.0, 493.88, 392.0, 293.66, 246.94],
    melodyPhrase: [
      { freq: 587.33, accent: 1.0 }, // D5
      { freq: null },
      { freq: 659.25, accent: 0.8 }, // E5
      { freq: 587.33, accent: 0.75 }, // D5
      { freq: 493.88, accent: 0.9 }, // B4
      { freq: null },
      { freq: 392.0, accent: 0.75 }, // G4
      { freq: 493.88, accent: 0.8 }, // B4
    ],
  },
  {
    name: 'Em7',
    bass: 82.41, // E2
    pad: [164.81, 246.94, 293.66, 392.0, 493.88], // E3 B3 D4 G4 B4
    arp: [164.81, 246.94, 329.63, 392.0, 493.88, 392.0, 329.63, 246.94],
    melodyPhrase: [
      { freq: 783.99, accent: 1.0 }, // G5
      { freq: null },
      { freq: 659.25, accent: 0.8 }, // E5
      { freq: 587.33, accent: 0.75 }, // D5
      { freq: 493.88, accent: 0.9 }, // B4
      { freq: null },
      { freq: 587.33, accent: 0.8 }, // D5
      { freq: 659.25, accent: 0.85 }, // E5
    ],
  },
  {
    name: 'Am7',
    bass: 110.0, // A2
    pad: [220.0, 261.63, 329.63, 392.0, 523.25], // A3 C4 E4 G4 C5
    arp: [220.0, 261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 261.63],
    melodyPhrase: [
      { freq: 880.0, accent: 1.0 }, // A5
      { freq: null },
      { freq: 783.99, accent: 0.8 }, // G5
      { freq: 659.25, accent: 0.85 }, // E5
      { freq: 523.25, accent: 0.9 }, // C5
      { freq: null },
      { freq: 587.33, accent: 0.8 }, // D5
      { freq: 659.25, accent: 0.75 }, // E5
    ],
  },
  {
    name: 'Dm9',
    bass: 73.42, // D2
    pad: [146.83, 220.0, 261.63, 329.63, 440.0], // D3 A3 C4 E4 A4
    arp: [146.83, 220.0, 261.63, 329.63, 440.0, 349.23, 293.66, 220.0],
    melodyPhrase: [
      { freq: 698.46, accent: 0.95 }, // F5
      { freq: null },
      { freq: 659.25, accent: 0.85 }, // E5
      { freq: 587.33, accent: 0.8 }, // D5
      { freq: 523.25, accent: 0.9 }, // C5
      { freq: 440.0, accent: 0.75 }, // A4
      { freq: 523.25, accent: 0.85 }, // C5
      { freq: null },
    ],
  },
  {
    name: 'G7_Resolve',
    bass: 98.0, // G2
    pad: [196.0, 246.94, 293.66, 349.23, 440.0], // G3 B3 D4 F4 A4
    arp: [196.0, 246.94, 293.66, 392.0, 493.88, 392.0, 349.23, 293.66],
    melodyPhrase: [
      { freq: 587.33, accent: 0.95 }, // D5
      { freq: null },
      { freq: 523.25, accent: 0.8 }, // C5
      { freq: 493.88, accent: 0.85 }, // B4
      { freq: 440.0, accent: 0.8 }, // A4
      { freq: 493.88, accent: 0.85 }, // B4
      { freq: 523.25, accent: 0.95 }, // C5
      { freq: null },
    ],
  },
];

// Unique delicate 3-note harmonic nuance for each of the 7 tulip photos/messages
const MEMORY_NUANCE_MOTIFS: Array<{
  notes: number[];
  filterHz: number;
}> = [
  { notes: [523.25, 659.25, 987.77], filterHz: 3400 }, // 1: Cmaj7 shimmer
  { notes: [440.0, 523.25, 783.99], filterHz: 2900 }, // 2: Am7 tender bloom
  { notes: [349.23, 523.25, 659.25], filterHz: 3200 }, // 3: Fmaj7 warm rise
  { notes: [392.0, 493.88, 880.0], filterHz: 3800 }, // 4: G6/9 radiant lift
  { notes: [329.63, 493.88, 783.99], filterHz: 2700 }, // 5: Em7 nocturnal glow
  { notes: [293.66, 440.0, 659.25], filterHz: 3100 }, // 6: Dm9 sweet sigh
  { notes: [523.25, 659.25, 783.99, 1046.5], filterHz: 4100 }, // 7: Starry Cmaj resolution
];

const STEP_DURATION_MS = 420; // ~71 BPM eighth-note pulse

export class AmbientChimePlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private songGain: GainNode | null = null;
  private cueGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  private isPlaying = false;
  private timerId: number | null = null;
  private stopFadeTimerId: number | null = null;
  private barIndex = 0;
  private stepIndex = 0;
  private currentTintHz = 3400;

  private ensureAudioGraph(): AudioContext | null {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      if (!this.audioContext) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.78, ctx.currentTime);

        const songGain = ctx.createGain();
        songGain.gain.setValueAtTime(0, ctx.currentTime);

        const cueGain = ctx.createGain();
        cueGain.gain.setValueAtTime(1.0, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.currentTintHz, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        // Warm ambient echo bus
        const delay = ctx.createDelay(1.0);
        delay.delayTime.setValueAtTime(0.38, ctx.currentTime);

        const delayFilter = ctx.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.setValueAtTime(1750, ctx.currentTime);

        const feedback = ctx.createGain();
        feedback.gain.setValueAtTime(0.28, ctx.currentTime);

        const wetGain = ctx.createGain();
        wetGain.gain.setValueAtTime(0.32, ctx.currentTime);

        songGain.connect(filter);
        cueGain.connect(filter);

        filter.connect(master);
        filter.connect(delay);
        delay.connect(delayFilter);
        delayFilter.connect(feedback);
        feedback.connect(delay);
        delayFilter.connect(wetGain);
        wetGain.connect(master);

        master.connect(ctx.destination);

        this.audioContext = ctx;
        this.masterGain = master;
        this.songGain = songGain;
        this.cueGain = cueGain;
        this.filterNode = filter;
        this.delayNode = delay;
        this.delayFeedback = feedback;
      }

      if (this.audioContext.state === 'suspended') {
        void this.audioContext.resume();
      }

      return this.audioContext;
    } catch {
      return null;
    }
  }

  public start(): void {
    const ctx = this.ensureAudioGraph();
    if (!ctx || !this.songGain) return;

    // Cancel any active fade-out so toggling quickly swells back smoothly
    if (this.stopFadeTimerId !== null) {
      window.clearTimeout(this.stopFadeTimerId);
      this.stopFadeTimerId = null;
    }

    const now = ctx.currentTime;
    const currentGain = this.songGain.gain.value;
    this.songGain.gain.cancelScheduledValues(now);
    this.songGain.gain.setValueAtTime(currentGain, now);
    this.songGain.gain.linearRampToValueAtTime(1.0, now + 1.15);

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.stepIndex = 0;
    this.scheduleNextStep(40);
  }

  public stop(): void {
    if (!this.isPlaying && this.stopFadeTimerId === null) return;

    const ctx = this.audioContext;
    if (ctx && this.songGain) {
      const now = ctx.currentTime;
      const currentGain = this.songGain.gain.value;
      this.songGain.gain.cancelScheduledValues(now);
      this.songGain.gain.setValueAtTime(currentGain, now);
      this.songGain.gain.linearRampToValueAtTime(0, now + 1.0);
    }

    if (this.stopFadeTimerId !== null) {
      window.clearTimeout(this.stopFadeTimerId);
    }

    this.stopFadeTimerId = window.setTimeout(() => {
      this.stopFadeTimerId = null;
      this.isPlaying = false;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
    }, 1020);
  }

  public playEnterChord(): void {
    const ctx = this.ensureAudioGraph();
    if (!ctx || !this.cueGain) return;

    const notes = [261.63, 392.0, 493.88, 659.25];
    const baseTime = ctx.currentTime + 0.02;
    notes.forEach((freq, idx) => {
      this.triggerCelestaVoice(ctx, freq, baseTime + idx * 0.085, 0.036, 2.8, this.cueGain!);
    });
  }

  public playMemoryCue(memoryIndex: number): void {
    const ctx = this.ensureAudioGraph();
    if (!ctx || !this.filterNode || !this.cueGain) return;

    const motif =
      MEMORY_NUANCE_MOTIFS[
        ((memoryIndex % MEMORY_NUANCE_MOTIFS.length) + MEMORY_NUANCE_MOTIFS.length) %
          MEMORY_NUANCE_MOTIFS.length
      ];

    // Gently shift song timbre filter toward this memory's harmonic brightness
    this.currentTintHz = motif.filterHz;
    this.filterNode.frequency.setTargetAtTime(motif.filterHz, ctx.currentTime, 0.45);

    const baseTime = ctx.currentTime + 0.015;
    motif.notes.forEach((freq, idx) => {
      const noteStart = baseTime + idx * 0.095;
      this.triggerCelestaVoice(ctx, freq, noteStart, 0.042, 2.4, this.cueGain!);
    });
  }

  public dispose(): void {
    if (this.stopFadeTimerId !== null) {
      window.clearTimeout(this.stopFadeTimerId);
      this.stopFadeTimerId = null;
    }
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.audioContext) {
      this.masterGain?.disconnect();
      this.songGain?.disconnect();
      this.cueGain?.disconnect();
      this.filterNode?.disconnect();
      this.delayNode?.disconnect();
      this.delayFeedback?.disconnect();
      void this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.masterGain = null;
      this.songGain = null;
      this.cueGain = null;
      this.filterNode = null;
      this.delayNode = null;
      this.delayFeedback = null;
    }
  }

  private scheduleNextStep(delayMs: number): void {
    if (!this.isPlaying) return;
    this.timerId = window.setTimeout(() => {
      if (!this.isPlaying) return;
      this.playSongStep();
      // Subtle expressive micro-rubato (+/- 10ms)
      const jitter = (Math.random() - 0.5) * 20;
      this.scheduleNextStep(STEP_DURATION_MS + jitter);
    }, delayMs);
  }

  private playSongStep(): void {
    const ctx = this.ensureAudioGraph();
    if (!ctx || !this.songGain) return;

    const chord = SONG_PROGRESSION[this.barIndex];
    const now = ctx.currentTime;

    // 1. On beat 0 of every bar: trigger warm pad chord + soft bass anchor
    if (this.stepIndex === 0) {
      this.triggerWarmPad(
        ctx,
        chord.bass,
        chord.pad,
        now,
        (STEP_DURATION_MS * 8) / 1000,
        this.songGain,
      );
    }

    // 2. Flowing harp/piano arpeggio on each step
    const arpFreq = chord.arp[this.stepIndex % chord.arp.length];
    const arpGain = this.stepIndex % 2 === 0 ? 0.032 : 0.022;
    this.triggerSoftHarp(ctx, arpFreq, now, arpGain, 1.5, this.songGain);

    // 3. Expressive singing celesta melody phrase
    const melodyNote = chord.melodyPhrase[this.stepIndex];
    if (melodyNote?.freq) {
      const vel = (melodyNote.accent ?? 0.85) * 0.052;
      this.triggerCelestaVoice(ctx, melodyNote.freq, now, vel, 2.3, this.songGain);
    }

    this.stepIndex += 1;
    if (this.stepIndex >= 8) {
      this.stepIndex = 0;
      this.barIndex = (this.barIndex + 1) % SONG_PROGRESSION.length;
    }
  }

  private triggerWarmPad(
    ctx: AudioContext,
    bassFreq: number,
    chordNotes: number[],
    startTime: number,
    durationSec: number,
    destination: AudioNode,
  ): void {
    // Warm sub-bass note
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, startTime);

    bassGain.gain.setValueAtTime(0.0001, startTime);
    bassGain.gain.linearRampToValueAtTime(0.055, startTime + 0.55);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec + 0.6);

    bassOsc.connect(bassGain);
    bassGain.connect(destination);
    bassOsc.start(startTime);
    bassOsc.stop(startTime + durationSec + 0.65);

    // Lush chord pad (pick 3 lush voices so it stays airy and transparent)
    const padVoices = [chordNotes[0], chordNotes[2], chordNotes[3]];
    padVoices.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime((idx - 1) * 4, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.016, startTime + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec + 0.5);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.55);
    });
  }

  private triggerSoftHarp(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    peakGain: number,
    decaySec: number,
    destination: AudioNode,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySec);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + decaySec + 0.05);
  }

  private triggerCelestaVoice(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    peakGain: number,
    decaySec: number,
    destination: AudioNode,
  ): void {
    // Fundamental sine + gentle 2nd harmonic shimmer for bell/celesta character
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    gain1.gain.setValueAtTime(0.0001, startTime);
    gain1.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySec);

    gain2.gain.setValueAtTime(0.0001, startTime);
    gain2.gain.linearRampToValueAtTime(peakGain * 0.22, startTime + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySec * 0.45);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(destination);
    gain2.connect(destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + decaySec + 0.05);
    osc2.stop(startTime + decaySec * 0.5 + 0.05);
  }
}
