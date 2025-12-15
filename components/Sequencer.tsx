import React, { memo } from 'react';
import { Track, InstrumentType } from '../types';
import { Volume2, VolumeX, ChevronRight, Trash2, PlusCircle, Music } from 'lucide-react';

interface SequencerProps {
  tracks: Track[];
  currentStep: number;
  onToggleStep: (trackId: string, stepIndex: number) => void;
  onToggleMute: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onRemoveTrack: (trackId: string) => void;
  onAddTrack: (type: InstrumentType) => void;
}

const Sequencer: React.FC<SequencerProps> = ({ 
  tracks, 
  currentStep, 
  onToggleStep, 
  onToggleMute, 
  onVolumeChange,
  onRemoveTrack,
  onAddTrack
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-1 md:p-4 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col gap-2 relative">
      
      {/* Mobile Scroll Hint */}
      <div className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-40 animate-pulse text-white">
        <ChevronRight size={24} />
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto pb-2 no-scrollbar relative rounded-xl">
        <div className="min-w-[600px] md:min-w-[700px] flex flex-col gap-2 pr-2"> 
          
          {/* Header/Ruler */}
          <div className="flex gap-2 mb-1 sticky left-0 z-10">
            {/* Sticky Spacer */}
            <div className="w-28 md:w-48 flex-shrink-0 sticky left-0 bg-zinc-900 z-20 border-r border-transparent"></div> 
            <div className="flex-1 flex gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-1.5 md:h-2 rounded-full transition-colors duration-200 ${
                    i === currentStep ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-110' : 
                    i % 4 === 0 ? 'bg-zinc-700' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="flex gap-2 items-stretch group relative animate-fadeIn">
              {/* Sticky Track Controls */}
              <div className="w-28 md:w-48 flex-shrink-0 flex flex-col justify-center bg-zinc-900/95 backdrop-blur-md p-2 rounded-xl border border-zinc-800 sticky left-0 z-20 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${track.color} shadow-[0_0_8px_currentColor] flex-shrink-0`}></div>
                        <span className="text-xs md:text-sm font-bold tracking-tight text-zinc-200 truncate">{track.name}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                      onClick={() => onToggleMute(track.id)}
                      className={`w-6 h-6 flex items-center justify-center rounded transition-all flex-shrink-0 ${
                          track.muted 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                      title={track.muted ? "Unmute" : "Mute"}
                      >
                      {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                      
                      <button
                        onClick={() => onRemoveTrack(track.id)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-500 hover:bg-red-900/30 hover:text-red-400 transition-all flex-shrink-0"
                        title="Delete Track"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                </div>
                
                {/* Track Volume Slider */}
                <div className="flex items-center h-4 relative group/slider px-1">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={track.volume}
                        onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-400 hover:accent-cyan-400 focus:outline-none transition-all"
                    />
                </div>
              </div>

              {/* Grid Steps */}
              <div className="flex-1 flex gap-1">
                {track.steps.map((step, index) => {
                   const isActive = step.active;
                   const isCurrent = index === currentStep;
                   
                   let cellClass = "flex-1 rounded-lg cursor-pointer transition-all duration-100 border relative overflow-hidden ";
                   cellClass += "h-[3rem] md:h-full md:min-h-[4rem] "; 
                   
                   if (isActive) {
                       cellClass += `${track.color.replace('bg-', 'bg-').replace('500', '500')} border-transparent shadow-lg `;
                       cellClass += isCurrent ? "brightness-125 scale-95 ring-2 ring-white/50 " : "brightness-100 ";
                   } else {
                       cellClass += "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 ";
                       cellClass += isCurrent ? "bg-zinc-800 border-zinc-700 " : "";
                       if (index % 4 === 0) cellClass += "bg-zinc-900/60 ";
                   }

                   return (
                    <div
                      key={index}
                      onPointerDown={() => onToggleStep(track.id, index)} 
                      className={cellClass}
                    >
                        {isCurrent && isActive && (
                            <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                        )}
                        {isActive && track.type === 'synth' && (
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        )}
                    </div>
                   );
                })}
              </div>
            </div>
          ))}

          {/* ADD TRACK ROW */}
          <div className="flex gap-2 items-center mt-2 opacity-100 transition-opacity">
            <div className="w-28 md:w-48 flex-shrink-0 sticky left-0 z-20 flex flex-col gap-2">
                <div className="text-[10px] uppercase font-bold text-zinc-500 text-center">Add Instrument</div>
                <div className="grid grid-cols-2 gap-1">
                  {(['kick', 'snare', 'hihat', 'synth'] as InstrumentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onAddTrack(type)}
                      className="flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-cyan-400 py-2 rounded-lg text-xs font-bold transition-all border border-zinc-800 hover:border-zinc-600"
                    >
                      {type === 'kick' && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                      {type === 'snare' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      {type === 'hihat' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                      {type === 'synth' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
            </div>
            
            {/* Dashed placeholder for visual balance */}
            <div className="flex-1 border-2 border-dashed border-zinc-800/50 rounded-xl h-20 flex items-center justify-center text-zinc-700 font-medium">
               <Music size={24} className="opacity-20" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default memo(Sequencer);