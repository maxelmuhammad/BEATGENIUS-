export type InstrumentType = 'kick' | 'snare' | 'hihat' | 'synth';

export type KitType = 'default' | 'amapiano' | 'afro' | 'trap' | 'lofi' | 'electronic' | 'phonk';

export type SynthWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface Step {
  active: boolean;
  pitch?: number; // Frequency for synth
}

export interface Track {
  id: string;
  name: string;
  type: InstrumentType;
  steps: Step[];
  muted: boolean;
  color: string;
  volume: number; // 0.0 to 1.0
}

export interface PatternData {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  synth: number[]; // 0 means inactive, >0 means pitch
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  bpm: number;
  kit: KitType;
  description: string;
  pattern: PatternData;
}

export const SCALES = {
  Pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25], // C Major Pentatonic
  LogDrum: [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47], // Deep bass notes
  Phonk: [523.25, 622.25, 698.46, 783.99, 880.00, 1046.50] // High tension cowbell notes (C5, D#5, F5, G5, A5, C6)
};