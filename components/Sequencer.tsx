import React, { memo } from 'react';
import { Track, Step } from '../types';
import { Play, Volume2, VolumeX, Activity, ChevronRight } from 'lucide-react';

interface SequencerProps {
  tracks: Track[];
  currentStep: number;
  onToggleStep: (trackId: string, stepIndex: number) => void;
  onToggleMute: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
}

const Sequencer: React.FC<SequencerProps> = ({ tracks, currentStep, onToggleStep, onToggleMute, onVolumeChange }) => {
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
            {/* Sticky Spacer matching track control width - Updated to w-28 for mobile */}
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
            <div key={track.id} className="flex gap-2 items-stretch group relative">
              {/* Sticky Track Controls - Widened for better mobile usability */}
              <div className="w-28 md:w-48 flex-shrink-0 flex flex-col justify-center bg-zinc-900/95 backdrop-blur-md p-2 rounded-xl border border-zinc-800 sticky left-0 z-20 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${track.color} shadow-[0_0_8px_currentColor] flex-shrink-0`}></div>
                        <span className="text-xs md:text-sm font-bold tracking-tight text-zinc-200 truncate">{track.name}</span>
                    </div>
                    <button
                    onClick={() => onToggleMute(track.id)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                        track.muted 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                    title={track.muted ? "Unmute" : "Mute"}
                    >
                    {track.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                </div>
                
                {/* Track Volume Slider - Improved height and styling */}
                <div className="flex items-center h-4 relative group/slider">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={track.volume}
                        onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-200 hover:accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    />
                </div>
              </div>

              {/* Grid Steps */}
              <div className="flex-1 flex gap-1">
                {track.steps.map((step, index) => {
                   const isActive = step.active;
                   const isCurrent = index === currentStep;
                   
                   let cellClass = "flex-1 rounded-lg cursor-pointer transition-all duration-100 border relative overflow-hidden ";
                   // Reduced height for mobile to fit more rows in landscape
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
                      onPointerDown={() => onToggleStep(track.id, index)} // Use pointerDown for faster touch response
                      className={cellClass}
                    >
                        {isCurrent && isActive && (
                            <div className="absolute inset-0 bg-white/40 animate-pulse"></div>
                        )}
                        {/* Visual indicator for pitch/active */}
                        {isActive && track.type === 'synth' && (
                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                        )}
                    </div>
                   );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(Sequencer);