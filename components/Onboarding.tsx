import React, { useState } from 'react';
import { Sparkles, Smartphone, Music, CheckCircle, Mic, ArrowRight, Calendar, Ghost } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: <Music className="text-white" size={40} />,
    title: "Welcome to BeatGenius",
    description: "Your professional pocket music studio. Create beats, loops, and rhythms instantly.",
    color: "from-cyan-500 to-blue-600"
  },
  {
    icon: <Sparkles className="text-white" size={40} />,
    title: "AI Powered Creation",
    description: "Stuck? Just type a description like 'Amapiano groove' or 'Fast tech beat' and let AI write the music.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: <Calendar className="text-white" size={40} />,
    title: "For Every Occasion",
    description: "Presets ready for Weddings, Tech Events, Birthday Parties, and even Scary Movie scores.",
    color: "from-amber-500 to-orange-600"
  },
  {
    icon: <Mic className="text-white" size={40} />,
    title: "Record & Share",
    description: "Record your sessions in high quality without background noise and save them to your device.",
    color: "from-emerald-500 to-green-600"
  },
  {
    icon: <Smartphone className="text-white rotate-90" size={40} />,
    title: "Pro Tip: Landscape",
    description: "For the best experience, rotate your phone to landscape mode to see the full studio grid.",
    color: "from-zinc-500 to-zinc-700"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const content = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-md w-full flex flex-col items-center gap-6 md:gap-8 relative">
        
        {/* Progress Dots */}
        <div className="flex gap-2 mb-4">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${content.color} flex items-center justify-center shadow-2xl shadow-zinc-900/50 mb-2 transition-all duration-500 transform`}>
          {content.icon}
        </div>

        {/* Text */}
        <div className="space-y-4 min-h-[140px] px-2">
            <h1 key={content.title} className="text-3xl md:text-4xl font-bold text-white animate-slideIn">
              {content.title}
            </h1>
            <p key={content.description} className="text-zinc-400 text-base md:text-lg animate-fadeIn">
              {content.description}
            </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3 mt-4">
            <button 
                onClick={handleNext}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-white/10"
            >
                {currentSlide === SLIDES.length - 1 ? (
                  <>Enter Studio <CheckCircle size={20} /></>
                ) : (
                  <>Next <ArrowRight size={20} /></>
                )}
            </button>
            
            {currentSlide < SLIDES.length - 1 && (
              <button 
                onClick={onComplete}
                className="text-zinc-500 text-sm font-medium hover:text-white transition-colors py-2"
              >
                Skip Intro
              </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default Onboarding;