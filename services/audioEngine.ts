import { InstrumentType, KitType, SynthWaveform } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  
  // Recording
  private dest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private currentKit: KitType = 'default';
  private currentWaveform: SynthWaveform = 'sine';
  private masterVolume: number = 0.75;
  private reverbEnabled: boolean = false;

  constructor() {
    // Lazy initialization
  }

  public setKit(kit: KitType) {
    this.currentKit = kit;
  }

  public setWaveform(waveform: SynthWaveform) {
    this.currentWaveform = waveform;
  }

  public setReverb(enabled: boolean) {
    this.reverbEnabled = enabled;
    if (this.reverbGain) {
        this.reverbGain.gain.setTargetAtTime(enabled ? 0.3 : 0, this.ctx?.currentTime || 0, 0.1);
    }
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02);
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      // RECORDING: Create a destination node to record the output stream directly
      // This avoids recording microphone input/background noise.
      this.dest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.dest);

      // Simple Reverb Setup
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = this.reverbEnabled ? 0.3 : 0;
      this.reverbNode = this.ctx.createConvolver();
      this.createReverbImpulse();
      
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startRecording() {
    this.init();
    if (!this.dest) return;
    
    this.audioChunks = [];
    
    // Determine supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
    }

    try {
        this.mediaRecorder = new MediaRecorder(this.dest.stream, { mimeType });
        
        this.mediaRecorder.ondataavailable = (evt) => {
          if (evt.data.size > 0) {
            this.audioChunks.push(evt.data);
          }
        };
        
        this.mediaRecorder.start();
    } catch (e) {
        console.error("Recording failed to start", e);
    }
  }

  public async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.audioChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private createReverbImpulse() {
    // Synthetic reverb impulse
    if (!this.ctx || !this.reverbNode) return;
    const rate = this.ctx.sampleRate;
    const length = rate * 1.5; // 1.5 seconds
    const decay = 2.0;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = i; // reverse index not needed for simple noise burst reverb
        const val = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        left[i] = val;
        right[i] = val;
    }
    this.reverbNode.buffer = impulse;
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public getContext() {
    this.init();
    return this.ctx;
  }

  public playSound(type: InstrumentType, time: number, pitch?: number, trackVolume: number = 1.0) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // Route based on Kit
    switch (type) {
      case 'kick':
        if (this.currentKit === 'phonk') this.playPhonkKick(time, trackVolume);
        else if (this.currentKit === 'trap') this.play808Kick(time, trackVolume);
        else if (this.currentKit === 'amapiano') this.playDeepKick(time, trackVolume);
        else this.playKick(time, trackVolume);
        break;
      case 'snare':
        if (this.currentKit === 'amapiano') this.playShaker(time, false, trackVolume); 
        else if (this.currentKit === 'afro') this.playRimshot(time, trackVolume);
        else if (this.currentKit === 'trap') this.playTrapSnare(time, trackVolume);
        else if (this.currentKit === 'phonk') this.playPhonkSnare(time, trackVolume);
        else this.playSnare(time, trackVolume);
        break;
      case 'hihat':
        if (this.currentKit === 'amapiano' || this.currentKit === 'afro') this.playShaker(time, true, trackVolume);
        else if (this.currentKit === 'trap' || this.currentKit === 'phonk') this.playTrapHiHat(time, trackVolume);
        else this.playHiHat(time, trackVolume);
        break;
      case 'synth':
        if (this.currentKit === 'phonk') {
          // PHONK SPECIAL: Split synth track. Low pitch = Bass, High pitch = Cowbell
          if (pitch && pitch < 200) {
            this.playPhonkBass(time, pitch, trackVolume);
          } else {
            this.playCowbell(time, pitch, trackVolume);
          }
        }
        else if (this.currentKit === 'amapiano') this.playLogDrum(time, pitch, trackVolume);
        else if (this.currentKit === 'afro') this.playKalimba(time, pitch, trackVolume);
        else if (this.currentKit === 'trap') this.playDarkSynth(time, pitch, trackVolume);
        else this.playSynth(time, pitch, trackVolume);
        break;
    }
  }

  // Helper to connect node to master and reverb
  private connectOutput(node: AudioNode) {
     if (!this.masterGain || !this.reverbNode) return;
     node.connect(this.masterGain);
     node.connect(this.reverbNode); // Send to reverb
  }

  // --- Kicks ---

  private playKick(time: number, vol: number) {
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain!); // Kicks usually bypass reverb to stay tight

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    gain.gain.setValueAtTime(1 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playDeepKick(time: number, vol: number) { // For Amapiano
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.3);

    gain.gain.setValueAtTime(0.9 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    osc.start(time);
    osc.stop(time + 0.4);
  }

  private play808Kick(time: number, vol: number) { // For Trap
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    // Saturation for 808 grit
    const distortion = this.ctx!.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(50); 
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.masterGain!);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

    gain.gain.setValueAtTime(1 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2); // Long decay

    osc.start(time);
    osc.stop(time + 1.2);
  }

  private playPhonkKick(time: number, vol: number) { 
    // Heavier distortion and click for Phonk
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    const distortion = this.ctx!.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(400); // Massive distortion
    
    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.masterGain!);

    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.08); // Fast drop

    gain.gain.setValueAtTime(1 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  // --- Snares / Percussion ---

  private playSnare(time: number, vol: number) {
    // Noise
    const noise = this.ctx!.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = this.ctx!.createGain();
    noise.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.8 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    noise.start(time);
    noise.stop(time + 0.2);

    // Tone
    const osc = this.ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, time);
    const oscGain = this.ctx!.createGain();
    osc.connect(oscGain);
    this.connectOutput(oscGain);

    oscGain.gain.setValueAtTime(0.5 * vol, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playTrapSnare(time: number, vol: number) {
    const noise = this.ctx!.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    const gain = this.ctx!.createGain();
    noise.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);
    
    gain.gain.setValueAtTime(1 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    noise.start(time);
    noise.stop(time + 0.15);
    
    // High pitch tone
    const osc = this.ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
    const oscGain = this.ctx!.createGain();
    osc.connect(oscGain);
    this.connectOutput(oscGain);

    oscGain.gain.setValueAtTime(0.4 * vol, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playPhonkSnare(time: number, vol: number) {
    // Aggressive, distorted Memphis snare (909-ish with grit)
    const noise = this.ctx!.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const gain = this.ctx!.createGain();
    
    // Add distortion for grit
    const distortion = this.ctx!.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(150);

    noise.connect(filter);
    filter.connect(distortion);
    distortion.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(1.2 * vol, time); 
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    noise.start(time);
    noise.stop(time + 0.12);

    // Tonal body
    const osc = this.ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.08);
    const oscGain = this.ctx!.createGain();
    osc.connect(oscGain);
    this.connectOutput(oscGain);

    oscGain.gain.setValueAtTime(0.9 * vol, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  private playRimshot(time: number, vol: number) { // For Afro
    const osc = this.ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, time);
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.6 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.start(time);
    osc.stop(time + 0.08);

    // Filtered noise pop
    const noise = this.ctx!.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    const nGain = this.ctx!.createGain();
    noise.connect(filter);
    filter.connect(nGain);
    this.connectOutput(nGain);

    nGain.gain.setValueAtTime(0.4 * vol, time);
    nGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playShaker(time: number, soft: boolean = false, vol: number) {
    const noise = this.ctx!.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    const gain = this.ctx!.createGain();
    noise.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    const volume = (soft ? 0.3 : 0.5) * vol;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  // --- HiHats ---

  private playHiHat(time: number, vol: number) {
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = this.ctx!.createGain();
    source.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.6 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    source.start(time);
    source.stop(time + 0.05);
  }

  private playTrapHiHat(time: number, vol: number) {
    // Very tight, high pitch metallic
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 9000;
    const gain = this.ctx!.createGain();
    source.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.7 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
    source.start(time);
    source.stop(time + 0.03);
  }

  // --- Synths / Melodic ---

  private playSynth(time: number, pitch: number = 440, vol: number) {
    const osc = this.ctx!.createOscillator();
    osc.type = this.currentWaveform; // Use selected waveform
    osc.frequency.setValueAtTime(pitch, time);
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.4 * vol, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  // THE LOG DRUM (Signature Amapiano Sound)
  private playLogDrum(time: number, pitch: number = 80, vol: number) {
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine'; // Fundamental
    
    // Add a second harmonic for "wood" texture
    const osc2 = this.ctx!.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = pitch * 2;
    const gain2 = this.ctx!.createGain();
    gain2.gain.value = 0.2;
    osc2.connect(gain2);

    const mainGain = this.ctx!.createGain();
    osc.connect(mainGain);
    gain2.connect(mainGain);
    mainGain.connect(this.masterGain!); // Log drum usually dry

    // Pitch envelope: Starts slightly high, drops fast
    let effectivePitch = pitch;
    while (effectivePitch > 150) effectivePitch /= 2;

    osc.frequency.setValueAtTime(effectivePitch, time);
    osc2.frequency.setValueAtTime(effectivePitch * 2, time); 

    // Volume Envelope: Plucky
    mainGain.gain.setValueAtTime(0, time);
    mainGain.gain.linearRampToValueAtTime(0.8 * vol, time + 0.02); // Fast attack
    mainGain.gain.exponentialRampToValueAtTime(0.01, time + 0.6); // Medium decay

    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.6);
    osc2.stop(time + 0.6);
  }

  // PHONK BASS (Reese Bass Style)
  private playPhonkBass(time: number, pitch: number = 100, vol: number) {
    const osc1 = this.ctx!.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(pitch, time);
    
    const osc2 = this.ctx!.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(pitch, time);
    osc2.detune.value = 15; // Detuned for reese width

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    
    // Distortion for grit
    const distortion = this.ctx!.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(100);

    const gain = this.ctx!.createGain();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(distortion);
    distortion.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.8 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.5);
    osc2.stop(time + 0.5);
  }

  // PHONK COWBELL
  private playCowbell(time: number, pitch: number = 523, vol: number) {
    const createPulse = (freq: number, detune: number) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        osc.detune.value = detune;
        return osc;
    };

    const osc1 = createPulse(pitch, 0);
    const osc2 = createPulse(pitch * 1.5, 10); // Fifth above roughly

    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(pitch * 2, time);

    const gain = this.ctx!.createGain();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(1.0 * vol, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2); // Short decay

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.2);
    osc2.stop(time + 0.2);
  }

  private playKalimba(time: number, pitch: number = 440, vol: number) {
    const osc = this.ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, time);
    const gain = this.ctx!.createGain();
    osc.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5 * vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3); // Short decay

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playDarkSynth(time: number, pitch: number = 440, vol: number) {
    const osc = this.ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch, time);
    
    // Lowpass filter for dark vibe
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.5);

    const gain = this.ctx!.createGain();
    osc.connect(filter);
    filter.connect(gain);
    this.connectOutput(gain);

    gain.gain.setValueAtTime(0.3 * vol, time);
    gain.gain.linearRampToValueAtTime(0.3 * vol, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  // Helper
  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const audioEngine = new AudioEngine();