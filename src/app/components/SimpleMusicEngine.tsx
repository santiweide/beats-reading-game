import { useRef, useEffect } from 'react';

export class SimpleMusicEngine {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = 0.3;
    }
  }

  // Simple beat sound - like a metronome tick
  playBeat() {
    if (!this.audioContext || !this.masterGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.1
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Background music loop
  startBackgroundMusic(bpm: number = 120) {
    if (!this.audioContext || !this.masterGainNode) return;

    const beatDuration = (60 / bpm) * 1000; // Convert BPM to milliseconds
    const noteDuration = beatDuration / 4; // 4 notes per beat

    const notes = [
      { freq: 261.63, time: 0 },              // C4
      { freq: 329.63, time: noteDuration },   // E4
      { freq: 392.0, time: noteDuration * 2 }, // G4
      { freq: 329.63, time: noteDuration * 3 }, // E4
    ];

    const playLoop = () => {
      notes.forEach(note => {
        setTimeout(() => {
          this.playNote(note.freq);
        }, note.time);
      });
    };

    playLoop();
    return setInterval(playLoop, beatDuration);
  }

  private playNote(frequency: number) {
    if (!this.audioContext || !this.masterGainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  setVolume(volume: number) {
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = volume;
    }
  }
}

export function useMusicEngine() {
  const musicEngineRef = useRef<SimpleMusicEngine | null>(null);

  useEffect(() => {
    if (!musicEngineRef.current) {
      musicEngineRef.current = new SimpleMusicEngine();
    }
  }, []);

  return musicEngineRef.current;
}