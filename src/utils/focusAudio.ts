// Web Audio API Focus Ambient Sound System
// Provides synthesized, legal, zero-network, high-fidelity soothing ambient sounds:
// - No Sound (none)
// - Soft Rain (rain)
// - Cozy Café (cafe)
// - Nature (nature)
// - Gentle Waves (waves)
// - Calm Ambient (ambient)
// - Gentle White Noise (white)

export type FocusSoundId = 'none' | 'rain' | 'cafe' | 'nature' | 'waves' | 'ambient' | 'white';

export interface FocusSoundInfo {
  id: FocusSoundId;
  label: string;
  emoji: string;
  desc: string;
}

export const FOCUS_SOUND_OPTIONS: FocusSoundInfo[] = [
  { id: 'none', label: 'No Sound', emoji: '🔇', desc: 'Silence for pure concentration' },
  { id: 'rain', label: 'Soft Rain', emoji: '🌧️', desc: 'Cozy drops on a window pane' },
  { id: 'cafe', label: 'Cozy Café', emoji: '☕', desc: 'Gentle warm chatter & study murmur' },
  { id: 'nature', label: 'Nature', emoji: '🌿', desc: 'Forest breeze & distant chimes' },
  { id: 'waves', label: 'Gentle Waves', emoji: '🌊', desc: 'Rhythmic ocean tide swells' },
  { id: 'ambient', label: 'Calm Ambient', emoji: '🎶', desc: 'Warm relaxing lofi drone pad' },
  { id: 'white', label: 'Gentle White Noise', emoji: '☁️', desc: 'Smooth static for deep focus' },
];

class FocusAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSoundGain: GainNode | null = null;
  private currentSoundStopFn: (() => void) | null = null;
  private currentSoundId: FocusSoundId = 'none';
  private targetVolume: number = 0.5;
  private isMusicEnabled: boolean = false;
  private isBlockedByAutoplay: boolean = false;
  private listeners: Set<() => void> = new Set();
  private waveInterval: any = null;
  private natureInterval: any = null;
  private cafeInterval: any = null;

  constructor() {
    // Load persisted preferences
    try {
      const savedSound = localStorage.getItem('bloom_focus_sound') as FocusSoundId;
      if (savedSound && FOCUS_SOUND_OPTIONS.some((o) => o.id === savedSound)) {
        this.currentSoundId = savedSound;
      }
      const savedVol = localStorage.getItem('bloom_focus_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.targetVolume = v;
        }
      }
      const savedEnabled = localStorage.getItem('bloom_focus_music_enabled');
      // Always default to false on first visit as per requirements (User controls the music, never auto-start)
      this.isMusicEnabled = savedEnabled === 'true';
    } catch (e) {
      // localStorage fallback
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx || this.ctx.state === 'closed') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('AudioContext creation blocked:', e);
        return null;
      }
    }
    return this.ctx;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getSoundId(): FocusSoundId {
    return this.currentSoundId;
  }

  public getVolume(): number {
    return this.targetVolume;
  }

  public isEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public isBlocked(): boolean {
    return this.isBlockedByAutoplay;
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.targetVolume = clamped;
    try {
      localStorage.setItem('bloom_focus_volume', String(clamped));
    } catch {}

    if (this.masterGain && this.ctx && this.isMusicEnabled && this.currentSoundId !== 'none') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.1);
    }
    this.notify();
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    try {
      localStorage.setItem('bloom_focus_music_enabled', String(enabled));
    } catch {}

    if (enabled) {
      if (this.currentSoundId === 'none') {
        // Switch to soft rain if user turned on music from 'none'
        this.currentSoundId = 'rain';
        try {
          localStorage.setItem('bloom_focus_sound', 'rain');
        } catch {}
      }
      this.startPlayback();
    } else {
      this.stopPlaybackWithFade();
    }
    this.notify();
  }

  public setSound(soundId: FocusSoundId) {
    if (soundId === this.currentSoundId && this.isMusicEnabled) return;

    this.currentSoundId = soundId;
    try {
      localStorage.setItem('bloom_focus_sound', soundId);
    } catch {}

    if (soundId === 'none') {
      this.isMusicEnabled = false;
      try {
        localStorage.setItem('bloom_focus_music_enabled', 'false');
      } catch {}
      this.stopPlaybackWithFade();
    } else {
      // User explicitly picked an ambient sound -> enable music
      this.isMusicEnabled = true;
      try {
        localStorage.setItem('bloom_focus_music_enabled', 'true');
      } catch {}
      this.startPlayback();
    }
    this.notify();
  }

  // Explicit user interaction resume (satisfies browser autoplay restriction)
  public async resumeAudioContext(): Promise<boolean> {
    const ctx = this.initContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isBlockedByAutoplay = false;
        this.notify();
        if (this.isMusicEnabled && this.currentSoundId !== 'none') {
          this.startPlayback();
        }
        return true;
      } catch (e) {
        this.isBlockedByAutoplay = true;
        this.notify();
        return false;
      }
    }
    this.isBlockedByAutoplay = false;
    return true;
  }

  private async startPlayback() {
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        this.isBlockedByAutoplay = false;
      } catch (e) {
        this.isBlockedByAutoplay = true;
        this.notify();
        return;
      }
    }

    if (this.currentSoundId === 'none') {
      this.stopPlaybackWithFade();
      return;
    }

    const now = ctx.currentTime;

    // Fade out and clean up previous sound node smoothly
    if (this.currentSoundGain) {
      try {
        this.currentSoundGain.gain.cancelScheduledValues(now);
        this.currentSoundGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      } catch {}
      const oldStop = this.currentSoundStopFn;
      setTimeout(() => {
        try {
          if (oldStop) oldStop();
        } catch {}
      }, 550);
      this.currentSoundGain = null;
      this.currentSoundStopFn = null;
    }

    this.clearModulationIntervals();

    // Create new sound generator
    const newSoundGain = ctx.createGain();
    newSoundGain.gain.setValueAtTime(0.0001, now);
    newSoundGain.connect(this.masterGain!);

    const stopFn = this.buildSoundGenerator(ctx, newSoundGain, this.currentSoundId);
    this.currentSoundGain = newSoundGain;
    this.currentSoundStopFn = stopFn;

    // Smooth fade in
    newSoundGain.gain.linearRampToValueAtTime(1.0, now + 0.6);
    this.masterGain!.gain.cancelScheduledValues(now);
    this.masterGain!.gain.linearRampToValueAtTime(this.targetVolume, now + 0.6);
  }

  private stopPlaybackWithFade() {
    this.clearModulationIntervals();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    } catch {}

    const oldStop = this.currentSoundStopFn;
    setTimeout(() => {
      try {
        if (oldStop) oldStop();
        if (this.currentSoundGain) {
          this.currentSoundGain.disconnect();
          this.currentSoundGain = null;
        }
      } catch {}
    }, 650);
  }

  private clearModulationIntervals() {
    if (this.waveInterval) clearInterval(this.waveInterval);
    if (this.natureInterval) clearInterval(this.natureInterval);
    if (this.cafeInterval) clearInterval(this.cafeInterval);
    this.waveInterval = null;
    this.natureInterval = null;
    this.cafeInterval = null;
  }

  // Synthesize ambient sounds using Web Audio graph
  private buildSoundGenerator(
    ctx: AudioContext,
    destinationGain: GainNode,
    soundId: FocusSoundId
  ): () => void {
    const cleanupNodes: Array<() => void> = [];

    // Helper: generate looped pink/brown noise buffer
    const createNoiseBuffer = (seconds = 3, type: 'pink' | 'white' | 'brown' = 'pink') => {
      const bufferSize = ctx.sampleRate * seconds;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastBrown = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'white') {
          data[i] = white * 0.15;
        } else if (type === 'brown') {
          lastBrown = (lastBrown + 0.02 * white) / 1.02;
          data[i] = lastBrown * 0.9;
        } else {
          // Pink noise filter (Paul Kellet's method)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        }
      }
      return buffer;
    };

    if (soundId === 'rain') {
      // 🌧️ Rain: Lowpass filtered pink noise + subtle droplet texture
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(3, 'pink');
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(destinationGain);
      noiseSrc.start();

      cleanupNodes.push(() => {
        try {
          noiseSrc.stop();
          noiseSrc.disconnect();
          filter.disconnect();
        } catch {}
      });
    } else if (soundId === 'waves') {
      // 🌊 Waves: Brown noise with periodic LFO sweeping filter
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(4, 'brown');
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);
      filter.Q.setValueAtTime(2.5, ctx.currentTime);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(waveGain);
      waveGain.connect(destinationGain);
      noiseSrc.start();

      // Smooth rhythmic swell (8s cycle)
      let phase = 0;
      this.waveInterval = setInterval(() => {
        if (!ctx || ctx.state === 'closed') return;
        phase += 0.25;
        const cycle = (Math.sin(phase * 0.4) + 1) / 2; // 0 to 1
        const freq = 180 + cycle * 580; // 180Hz to 760Hz
        const vol = 0.25 + cycle * 0.45;
        const now = ctx.currentTime;
        try {
          filter.frequency.setTargetAtTime(freq, now, 0.4);
          waveGain.gain.setTargetAtTime(vol, now, 0.4);
        } catch {}
      }, 250);

      cleanupNodes.push(() => {
        try {
          noiseSrc.stop();
          noiseSrc.disconnect();
          filter.disconnect();
          waveGain.disconnect();
        } catch {}
      });
    } else if (soundId === 'cafe') {
      // ☕ Café: warm lowpass background murmur + subtle gentle harmonic acoustic clinks
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(3, 'pink');
      noiseSrc.loop = true;

      const murmurFilter = ctx.createBiquadFilter();
      murmurFilter.type = 'bandpass';
      murmurFilter.frequency.setValueAtTime(450, ctx.currentTime);
      murmurFilter.Q.setValueAtTime(1.0, ctx.currentTime);

      noiseSrc.connect(murmurFilter);
      murmurFilter.connect(destinationGain);
      noiseSrc.start();

      // Occasional gentle cup clink sound
      this.cafeInterval = setInterval(() => {
        if (!ctx || ctx.state === 'closed' || Math.random() > 0.4) return;
        try {
          const osc = ctx.createOscillator();
          const clinkGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400 + Math.random() * 400, ctx.currentTime);
          clinkGain.gain.setValueAtTime(0.015, ctx.currentTime);
          clinkGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          osc.connect(clinkGain);
          clinkGain.connect(destinationGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } catch {}
      }, 3500);

      cleanupNodes.push(() => {
        try {
          noiseSrc.stop();
          noiseSrc.disconnect();
          murmurFilter.disconnect();
        } catch {}
      });
    } else if (soundId === 'nature') {
      // 🌿 Nature: Gentle forest breeze + distant soft chime
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(3, 'pink');
      noiseSrc.loop = true;

      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(500, ctx.currentTime);
      breezeFilter.Q.setValueAtTime(1.0, ctx.currentTime);

      noiseSrc.connect(breezeFilter);
      breezeFilter.connect(destinationGain);
      noiseSrc.start();

      // Distant soft nature chime / wind ping
      const naturePitches = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      this.natureInterval = setInterval(() => {
        if (!ctx || ctx.state === 'closed' || Math.random() > 0.45) return;
        try {
          const osc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          const pitch = naturePitches[Math.floor(Math.random() * naturePitches.length)];
          osc.type = 'sine';
          osc.frequency.setValueAtTime(pitch, ctx.currentTime);
          chimeGain.gain.setValueAtTime(0.018, ctx.currentTime);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          osc.connect(chimeGain);
          chimeGain.connect(destinationGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.65);
        } catch {}
      }, 4000);

      cleanupNodes.push(() => {
        try {
          noiseSrc.stop();
          noiseSrc.disconnect();
          breezeFilter.disconnect();
        } catch {}
      });
    } else if (soundId === 'ambient') {
      // 🎶 Calm Ambient: Soft warm pentatonic chord drone (C3, G3, D4, E4)
      const freqs = [130.81, 196.0, 293.66, 329.63];
      const oscillators: OscillatorNode[] = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Subtle warm detuning for lush chorus
        osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.3 : -0.2), ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(destinationGain);
        osc.start();
        oscillators.push(osc);
      });

      cleanupNodes.push(() => {
        oscillators.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
      });
    } else if (soundId === 'white') {
      // ☁️ White noise: Gentle filtered static
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = createNoiseBuffer(3, 'white');
      noiseSrc.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      noiseSrc.connect(filter);
      filter.connect(destinationGain);
      noiseSrc.start();

      cleanupNodes.push(() => {
        try {
          noiseSrc.stop();
          noiseSrc.disconnect();
          filter.disconnect();
        } catch {}
      });
    }

    return () => {
      cleanupNodes.forEach((fn) => fn());
    };
  }

  public dispose() {
    this.clearModulationIntervals();
    this.stopPlaybackWithFade();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
    }
    this.ctx = null;
  }
}

// Global Singleton
export const focusAudio = new FocusAudioManager();
