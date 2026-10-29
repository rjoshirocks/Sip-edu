/**
 * Telecom Audio Engine using Web Audio API
 * Generates authentic dual-tone multi-frequency (DTMF) dialpad sounds,
 * ringing tones, dial tones, busy tones, and call state signals.
 */

class TelecomAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeLoopOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  private loopInterval: number | null = null;

  // Standard DTMF tone frequencies (Hz): row (low) & column (high)
  private dtmfFrequencies: Record<string, [number, number]> = {
    '1': [697, 1209],
    '2': [697, 1336],
    '3': [697, 1477],
    'A': [697, 1633],
    '4': [770, 1209],
    '5': [770, 1336],
    '6': [770, 1477],
    'B': [770, 1633],
    '7': [852, 1209],
    '8': [852, 1336],
    '9': [852, 1477],
    'C': [852, 1633],
    '*': [941, 1209],
    '0': [941, 1336],
    '#': [941, 1477],
    'D': [941, 1633],
  };

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopContinuousTone();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a dual-tone (like DTMF, dial tone, ringback)
   */
  public playDualTone(f1: number, f2: number, durationMs: number = 180, volume: number = 0.12) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const durationSec = durationMs / 1000;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.015);
      gainNode.gain.setValueAtTime(volume, now + durationSec - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + durationSec);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + durationSec);
      osc2.stop(now + durationSec);
    } catch {
      // Audio play error graceful handle
    }
  }

  /**
   * Play DTMF tone for a keypad button
   */
  public playDTMF(digit: string) {
    const freqs = this.dtmfFrequencies[digit.toUpperCase()];
    if (freqs) {
      this.playDualTone(freqs[0], freqs[1], 140, 0.15);
    }
  }

  /**
   * US Standard Dial Tone: 350 Hz + 440 Hz
   */
  public startDialTone() {
    this.stopContinuousTone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.setValueAtTime(350, now);
      osc2.frequency.setValueAtTime(440, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      this.activeLoopOscillators = { osc1, osc2, gain: gainNode };
    } catch {
      // ignore
    }
  }

  /**
   * Ringback Tone: 440 Hz + 480 Hz (repeating 1.5s on, 2s off)
   */
  public startRingbackTone() {
    this.stopContinuousTone();
    const playRingCycle = () => {
      this.playDualTone(440, 480, 1600, 0.1);
    };

    playRingCycle();
    this.loopInterval = window.setInterval(playRingCycle, 3600);
  }

  /**
   * Busy Tone: 480 Hz + 620 Hz (fast pulse: 0.5s on, 0.5s off)
   */
  public startBusyTone() {
    this.stopContinuousTone();
    const playBusyCycle = () => {
      this.playDualTone(480, 620, 450, 0.12);
    };

    playBusyCycle();
    this.loopInterval = window.setInterval(playBusyCycle, 1000);
  }

  /**
   * Call Connected Chime (Success)
   */
  public playConnectedChime() {
    this.stopContinuousTone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  /**
   * Hang up tone (Click + drop)
   */
  public playHangupTone() {
    this.stopContinuousTone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // ignore
    }
  }

  /**
   * Packet swoosh effect when messages transmit
   */
  public playPacketSwoosh() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  /**
   * Stop active continuous tones
   */
  public stopContinuousTone() {
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.activeLoopOscillators) {
      try {
        const { osc1, osc2, gain } = this.activeLoopOscillators;
        if (this.ctx) {
          const now = this.ctx.currentTime;
          gain.gain.linearRampToValueAtTime(0, now + 0.05);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
            } catch {
              // ignore
            }
          }, 60);
        }
      } catch {
        // ignore
      }
      this.activeLoopOscillators = null;
    }
  }
}

export const audioEngine = new TelecomAudioEngine();
