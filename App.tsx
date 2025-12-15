import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sequencer from './components/Sequencer';
import Onboarding from './components/Onboarding';
import { Track, Step, PatternData, SCALES, Preset, KitType, SynthWaveform } from './types';
import { audioEngine } from './services/audioEngine';
import { generatePattern } from './services/geminiService';
import { PRESETS } from './data/presets';
import { Play, Pause, Sparkles, RefreshCw, AlertCircle, Loader2, Activity, Music2, ChevronRight, X, Volume2, Menu, Settings2, Sliders, Disc, Download } from 'lucide-react';

// Default State
const DEFAULT_TRACKS: Track[] = [
  { 
    id: 'kick', 
    name: 'Kick', 
    type: 'kick', 
    color: 'bg-rose-500', 
    muted: false,
    volume: 0.8,
    steps: Array(16).fill(null).map(() => ({ active: false })) 
  },
  { 
    id: 'snare', 
    name: 'Snare', 
    type: 'snare', 
    color: 'bg-amber-500', 
    muted: false,
    volume: 0.75,
    steps: Array(16).fill(null).map(() => ({ active: false })) 
  },
  { 
    id: 'hihat', 
    name: 'HiHat', 
    type: 'hihat', 
    color: 'bg-cyan-500', 
    muted: false,
    volume: 0.6,
    steps: Array(16).fill(null).map(() => ({ active: false })) 
  },
  { 
    id: 'synth', 
    name: 'Synth', 
    type: 'synth', 
    color: 'bg-purple-500', 
    muted: false,
    volume: 0.7,
    steps: Array(16).fill(null).map(() => ({ active: false, pitch: 0 })) 
  },
];

const KITS: KitType[] = ['default', 'phonk', 'amapiano', 'afro', 'trap', 'lofi', 'electronic'];

// Initialize with a basic beat
DEFAULT_TRACKS[0].steps[0].active = true;
DEFAULT_TRACKS[0].steps[4].active = true;
DEFAULT_TRACKS[0].steps[8].active = true;
DEFAULT_TRACKS[0].steps[12].active = true;
DEFAULT_TRACKS[2].steps.forEach((s, i) => i % 2 === 0 ? s.active = true : null);

export default function App() {
  // Check localStorage for onboarding
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('onboarding_complete') === 'true';
  });
  
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false); // Acts as Sidebar toggle
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [currentKit, setCurrentKit] = useState<KitType>('default');
  const [masterVolume, setMasterVolume] = useState(0.8);
  
  // Advanced Settings
  const [swing, setSwing] = useState(0); 
  const [reverb, setReverb] = useState(false);
  const [waveform, setWaveform] = useState<SynthWaveform>('sine');

  // Audio Scheduling Refs
  const nextNoteTime = useRef(0.0);
  const currentStepRef = useRef(0);
  const timerID = useRef<number | null>(null);
  const tracksRef = useRef(tracks);
  
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // s

  const completeOnboarding = () => {
      setHasOnboarded(true);
      localStorage.setItem('onboarding_complete', 'true');
  };

  // Keep refs in sync
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    audioEngine.setKit(currentKit);
  }, [currentKit]);

  useEffect(() => {
    audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    audioEngine.setReverb(reverb);
  }, [reverb]);

  useEffect(() => {
    audioEngine.setWaveform(waveform);
  }, [waveform]);

  // Audio Logic
  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    // Basic swing logic calculation applied to the grid time advancement
    let stepDuration = 0.25;
    if (swing > 0) {
        if (currentStepRef.current % 2 === 0) {
            stepDuration += (swing * 0.1); 
        } else {
            stepDuration -= (swing * 0.1);
        }
    }

    nextNoteTime.current += stepDuration * secondsPerBeat;
    currentStepRef.current = (currentStepRef.current + 1) % 16;
    setCurrentStep(currentStepRef.current);
  }, [bpm, swing]);

  const scheduleNote = useCallback((stepNumber: number, time: number) => {
    tracksRef.current.forEach(track => {
      if (track.muted) return;
      const step = track.steps[stepNumber];
      if (step.active) {
        audioEngine.playSound(track.type, time, step.pitch || 440, track.volume);
      }
    });
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioEngine.getContext();
    if (!ctx) return;

    while (nextNoteTime.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(currentStepRef.current, nextNoteTime.current);
      nextNote();
    }
    timerID.current = window.setTimeout(scheduler, lookahead);
  }, [nextNote, scheduleNote]);

  useEffect(() => {
    if (isPlaying) {
      const ctx = audioEngine.getContext();
      if (ctx?.state === 'suspended') ctx.resume();
      if (ctx) {
          if (nextNoteTime.current < ctx.currentTime) {
             nextNoteTime.current = ctx.currentTime + 0.05;
             currentStepRef.current = 0;
             setCurrentStep(0);
          }
          scheduler();
      }
    } else {
      if (timerID.current) {
        window.clearTimeout(timerID.current);
        timerID.current = null;
      }
    }
    return () => {
      if (timerID.current) window.clearTimeout(timerID.current);
    };
  }, [isPlaying, scheduler]);

  // Handlers
  const toggleStep = (trackId: string, stepIndex: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id !== trackId) return track;
      const newSteps = [...track.steps];
      const isActive = !newSteps[stepIndex].active;
      
      let pitch = 0;
      if (isActive && track.type === 'synth') {
        let scale = SCALES.Pentatonic;
        if (currentKit === 'amapiano') scale = SCALES.LogDrum;
        if (currentKit === 'phonk') scale = SCALES.Phonk;
        
        pitch = scale[Math.floor(Math.random() * scale.length)];
      }

      newSteps[stepIndex] = { ...newSteps[stepIndex], active: isActive, pitch };
      return { ...track, steps: newSteps };
    }));
  };

  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume } : t));
  };

  const clearPattern = () => {
    setTracks(prev => prev.map(t => ({
      ...t,
      steps: t.steps.map(() => ({ active: false }))
    })));
    setSelectedPresetId(null);
  };

  const handleRecordingToggle = async () => {
    if (!isRecording) {
        audioEngine.startRecording();
        setIsRecording(true);
        // Auto-play if not already playing
        if (!isPlaying) setIsPlaying(true);
    } else {
        const blob = await audioEngine.stopRecording();
        setIsRecording(false);
        if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
            a.href = url;
            a.download = `beat-genius-${timestamp}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
  };

  const loadPreset = (preset: Preset) => {
    setBpm(preset.bpm);
    setCurrentKit(preset.kit);
    setSelectedPresetId(preset.id);
    setTracks(prev => prev.map(track => {
      let newSteps: boolean[] = [];
      let pitchData: number[] = [];
      
      if (track.id === 'kick') newSteps = preset.pattern.kick;
      else if (track.id === 'snare') newSteps = preset.pattern.snare;
      else if (track.id === 'hihat') newSteps = preset.pattern.hihat;
      else if (track.id === 'synth') pitchData = preset.pattern.synth;

      if (track.id === 'synth') {
        return {
          ...track,
          steps: pitchData.map(p => ({ active: p > 0, pitch: p > 0 ? p : undefined }))
        };
      } else {
        return {
          ...track,
          steps: newSteps.map(active => ({ active }))
        };
      }
    }));
    if (window.innerWidth < 1024) {
        setShowPresets(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const pattern: PatternData = await generatePattern(prompt);
      setTracks(prev => prev.map(track => {
        let newSteps: Step[] = [];
        if (track.id === 'kick') newSteps = pattern.kick.map(active => ({ active }));
        else if (track.id === 'snare') newSteps = pattern.snare.map(active => ({ active }));
        else if (track.id === 'hihat') newSteps = pattern.hihat.map(active => ({ active }));
        else if (track.id === 'synth') newSteps = pattern.synth.map(val => ({ active: val > 0, pitch: val > 0 ? val : undefined }));
        else return track;
        return { ...track, steps: newSteps };
      }));
      setSelectedPresetId(null);
    } catch (err) {
      setError("Could not generate beat. Try a simpler prompt.");
    } finally {
      setIsGenerating(false);
    }
  };

  const presetCategories = React.useMemo(() => {
    const groups: Record<string, Preset[]> = {};
    PRESETS.forEach(p => {
        if (!groups[p.category]) groups[p.category] = [];
        groups[p.category].push(p);
    });
    return groups;
  }, []);

  if (!hasOnboarded) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-zinc-950 text-white overflow-hidden font-sans h-dvh w-full">
      
      {/* 
        SIDEBAR NAVIGATION 
        - Full height on desktop
        - Drawer on mobile
      */}
      <aside className={`
          absolute inset-y-0 left-0 z-50 w-72 bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
          lg:relative lg:transform-none lg:bg-zinc-950/50 lg:backdrop-blur-none lg:shadow-none lg:z-auto
          ${showPresets ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0 h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <Activity className="text-white" size={18} />
                </div>
                <h2 className="font-bold text-lg text-zinc-100">BeatGenius</h2>
              </div>
              <button onClick={() => setShowPresets(false)} className="lg:hidden text-zinc-400 p-1 hover:bg-zinc-800 rounded">
                  <X size={20} />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(presetCategories).map(([category, presets]) => (
                  <div key={category}>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 ml-1">{category}</h3>
                      <div className="space-y-1">
                          {(presets as Preset[]).map(preset => (
                              <button
                                  key={preset.id}
                                  onClick={() => loadPreset(preset)}
                                  className={`w-full text-left p-2.5 rounded-lg text-sm transition-all group relative overflow-hidden ${
                                      selectedPresetId === preset.id 
                                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' 
                                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                                  }`}
                              >
                                  <div className="flex justify-between items-center relative z-10">
                                      <span className="font-medium truncate pr-2">{preset.name}</span>
                                      <span className="text-[10px] bg-zinc-950/50 px-1.5 py-0.5 rounded text-zinc-500 font-mono">{preset.bpm}</span>
                                  </div>
                                  {selectedPresetId === preset.id && (
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-purple-500"></div>
                                  )}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </aside>

      {/* MOBILE BACKDROP */}
      {showPresets && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowPresets(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 shadow-2xl relative">
                <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sliders size={20} className="text-cyan-400" /> Studio Settings
                </h2>
                
                <div className="space-y-6">
                    {/* Swing */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex justify-between">
                            Swing Amount
                            <span className="text-zinc-500 font-mono">{Math.round(swing * 100)}%</span>
                        </label>
                        <input 
                            type="range" min="0" max="0.5" step="0.05" 
                            value={swing} onChange={e => setSwing(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Reverb Toggle */}
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                        <span className="text-sm font-medium text-zinc-300">Space / Reverb</span>
                        <button 
                           onClick={() => setReverb(!reverb)}
                           className={`w-12 h-6 rounded-full transition-colors relative ${reverb ? 'bg-cyan-500' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${reverb ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {/* Synth Waveform */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Synth Tone</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['sine', 'triangle', 'square', 'sawtooth'].map((wf) => (
                                <button
                                    key={wf}
                                    onClick={() => setWaveform(wf as SynthWaveform)}
                                    className={`p-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                                        waveform === wf 
                                        ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'
                                    }`}
                                >
                                    {wf.slice(0,3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Header - Compact for Mobile Landscape */}
        <header className="p-2 md:p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-30 shrink-0 sticky top-0 flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
                <button onClick={() => setShowPresets(true)} className="lg:hidden p-2 text-zinc-300 hover:bg-zinc-800 rounded-lg">
                    <Menu size={20} />
                </button>
                {/* Play/Stop Main Control */}
                <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95 ${
                    isPlaying 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
                >
                    {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" className="ml-1" size={20} />}
                </button>

                {/* Record Button */}
                 <button
                onClick={handleRecordingToggle}
                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-95 relative ${
                    isRecording
                    ? 'bg-red-500/10 text-red-500 border border-red-500/50 animate-pulse' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                }`}
                title="Record & Download"
                >
                    {isRecording ? <div className="w-3 h-3 bg-red-500 rounded-sm"></div> : <Disc fill="currentColor" size={20} />}
                    {isRecording && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>}
                </button>
            </div>

            {/* Middle Controls (BPM/Vol) */}
            <div className="flex-1 max-w-2xl overflow-x-auto no-scrollbar flex items-center gap-4 px-2">
                 {/* Tempo */}
                 <div className="flex flex-col gap-1 min-w-[100px] flex-1">
                    <div className="flex justify-between text-[9px] uppercase text-zinc-500 font-bold tracking-wider">
                        <span>Tempo</span>
                        <span className="text-cyan-400 font-mono">{bpm}</span>
                    </div>
                    <input 
                        type="range" min="60" max="200" value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                    />
                 </div>
                 
                 <div className="w-px h-8 bg-zinc-800/50"></div>

                 {/* Volume */}
                 <div className="flex flex-col gap-1 min-w-[100px] flex-1">
                     <div className="flex items-center gap-1 text-[9px] uppercase text-zinc-500 font-bold tracking-wider">
                        <Volume2 size={10} /> Master
                     </div>
                     <input 
                        type="range" min="0" max="1" step="0.05" value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
                    />
                 </div>
                 
                 <div className="w-px h-8 bg-zinc-800/50"></div>

                 <div className="flex gap-2">
                    {/* Settings Trigger */}
                    <button onClick={() => setShowSettings(true)} className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors active:scale-95">
                        <Sliders size={18} />
                    </button>
                    
                    <button onClick={clearPattern} className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors active:scale-95" title="Clear">
                        <RefreshCw size={18} />
                    </button>
                 </div>
            </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-6 flex flex-col items-center gap-4 relative w-full scroll-smooth">
             {/* AI Section */}
             <div className="w-full max-w-3xl flex gap-2 shrink-0">
                <div className="flex-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex items-center relative overflow-hidden group shadow-lg transition-shadow hover:shadow-cyan-500/5">
                    <div className="pl-3 pr-2 text-zinc-500">
                        <Sparkles size={16} className={isGenerating ? "animate-pulse text-purple-400" : ""} />
                    </div>
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Describe a beat..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 p-2 text-sm min-w-0"
                        disabled={isGenerating}
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : "Generate"}
                    </button>
                </div>
             </div>

             {/* Kit Selector - STICKY AND VISIBLE */}
             <div className="w-full sticky top-0 z-40 py-2 -my-2 bg-zinc-950/95 backdrop-blur-sm flex justify-center border-b border-zinc-800/50 transition-all">
                <div className="w-full max-w-5xl flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar px-1 mask-linear-fade">
                      {KITS.map(kit => (
                          <button 
                              key={kit}
                              onClick={() => setCurrentKit(kit)}
                              className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all border flex-shrink-0 active:scale-95 ${
                                  currentKit === kit 
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600'
                              }`}
                          >
                              {kit}
                          </button>
                      ))}
                </div>
             </div>

             {/* Sequencer */}
             <Sequencer 
                tracks={tracks}
                currentStep={currentStep}
                onToggleStep={toggleStep}
                onToggleMute={toggleMute}
                onVolumeChange={handleTrackVolumeChange}
            />
            
            <div className="h-8"></div> {/* Bottom Spacer */}
        </main>
      </div>
    </div>
  );
}