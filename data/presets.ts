import { Preset } from '../types';

const EMPTY_16 = Array(16).fill(false);
const KICK_4_FLOOR = Array(16).fill(false).map((_, i) => i % 4 === 0);
const SNARE_BACKBEAT = Array(16).fill(false).map((_, i) => i === 4 || i === 12);
const HIHAT_8TH = Array(16).fill(false).map((_, i) => i % 2 === 0);
const HIHAT_16TH = Array(16).fill(true);

export const PRESETS: Preset[] = [
  // --- PHONK ---
  {
    id: 'drift-phonk-cowbell',
    name: 'Drift Phonk Cowbell',
    category: 'Phonk',
    bpm: 160,
    kit: 'phonk',
    description: 'High speed, aggressive cowbell melody.',
    pattern: {
        kick: [true, false, false, false, true, false, false, false, true, false, false, true, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: HIHAT_8TH,
        synth: [622, 622, 622, 0, 523, 0, 622, 0, 698, 698, 0, 0, 523, 0, 0, 0] // Cowbell melody
    }
  },
  {
    id: 'murder-phonk-dark',
    name: 'Murder Phonk Dark',
    category: 'Phonk',
    bpm: 145,
    kit: 'phonk',
    description: 'Distorted 808s and sinister vibes.',
    pattern: {
        kick: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
        hihat: HIHAT_16TH,
        synth: [523, 0, 0, 523, 0, 0, 587, 0, 523, 0, 0, 466, 0, 0, 0, 0]
    }
  },
  {
    id: 'chill-phonk-lofi',
    name: 'Chill Phonk Lofi',
    category: 'Phonk',
    bpm: 120,
    kit: 'phonk',
    description: 'Slower, jazzier cowbell chops.',
    pattern: {
        kick: [true, false, false, false, false, false, false, false, true, false, false, false, true, false, false, false],
        snare: SNARE_BACKBEAT,
        hihat: [true, false, true, true, true, false, true, false, true, false, true, true, true, false, true, false],
        synth: [880, 0, 0, 783, 0, 0, 698, 0, 0, 0, 0, 0, 0, 0, 783, 0]
    }
  },
  {
    id: 'memphis-doom',
    name: 'Memphis Doom',
    category: 'Phonk',
    bpm: 135,
    kit: 'phonk',
    description: 'Heavy 808s with relentless hi-hats.',
    pattern: {
        kick: [true, false, false, true, true, false, false, false, true, false, false, true, true, false, false, true],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, true, true, false, true, true, true, false, true, true, true, false, true, true, true, false],
        synth: [523, 0, 0, 0, 0, 0, 0, 0, 523, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  {
    id: 'sahara-drift',
    name: 'Sahara Drift',
    category: 'Phonk',
    bpm: 170,
    kit: 'phonk',
    description: 'Extreme speed drift phonk.',
    pattern: {
        kick: [true, false, true, false, false, false, true, false, true, false, true, false, false, false, true, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        synth: [1046, 0, 880, 0, 783, 0, 698, 0, 783, 0, 880, 0, 1046, 0, 0, 0]
    }
  },

  // --- EVENTS ---
  {
    id: 'wedding-party-entrance',
    name: 'Wedding Party Entrance',
    category: 'Events',
    bpm: 105,
    kit: 'afro',
    description: 'Joyful, bouncy Afro-pop for celebrations.',
    pattern: {
      kick: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
      snare: [false, false, false, true, false, false, true, false, false, false, false, true, false, false, true, false],
      hihat: HIHAT_16TH,
      synth: [523, 0, 587, 0, 659, 0, 587, 0, 523, 0, 0, 0, 523, 587, 659, 0] // Happy ascending melody
    }
  },
  {
    id: 'birthday-jazz-swing',
    name: 'Birthday Jazz Swing',
    category: 'Events',
    bpm: 124,
    kit: 'default',
    description: 'Upbeat swing rhythm for happy vibes.',
    pattern: {
        kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, true, true, true, false, true, false, true, false, true, true, true, false, true, false],
        synth: [523, 0, 0, 440, 0, 0, 392, 0, 349, 0, 329, 0, 0, 0, 523, 0]
    }
  },
  {
    id: 'birthday-trap-remix',
    name: 'Birthday Trap Remix',
    category: 'Events',
    bpm: 140,
    kit: 'trap',
    description: 'Hype birthday song style beat.',
    pattern: {
        kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
        snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
        hihat: HIHAT_16TH,
        synth: [523, 0, 523, 0, 587, 0, 523, 0, 698, 0, 659, 0, 0, 0, 0, 0]
    }
  },
  {
    id: 'tech-event-intro',
    name: 'Tech Event Intro',
    category: 'Events',
    bpm: 124,
    kit: 'electronic',
    description: 'Futuristic, driving, clean energy.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth: [261, 261, 0, 261, 261, 0, 261, 0, 392, 0, 0, 0, 392, 0, 0, 0] // Pulsing root notes
    }
  },
  {
    id: 'tech-reveal-swell',
    name: 'Tech Product Reveal',
    category: 'Events',
    bpm: 110,
    kit: 'electronic',
    description: 'Suspenseful build up for announcements.',
    pattern: {
        kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
        snare: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
        hihat: [true, false, false, false, true, false, false, false, true, false, true, false, true, true, true, true],
        synth: [130, 0, 130, 0, 130, 0, 130, 0, 261, 261, 261, 261, 523, 523, 523, 523]
    }
  },
  {
    id: 'horror-spine-chiller',
    name: 'Horror Spine Chiller',
    category: 'Cinematic',
    bpm: 70,
    kit: 'trap',
    description: 'Scary, dissonant, sparse tension.',
    pattern: {
      kick: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, false, true, false, false, true, false, false, false, false, false, true, false, false, false],
      synth: [261, 0, 0, 311, 0, 0, 0, 0, 370, 0, 0, 0, 261, 0, 311, 0] // Dissonant intervals (tritone/minor 2nd)
    }
  },
  {
    id: 'horror-chase-scene',
    name: 'Horror Chase Scene',
    category: 'Cinematic',
    bpm: 160,
    kit: 'trap',
    description: 'Fast, frantic, anxiety inducing.',
    pattern: {
        kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
        snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        hihat: HIHAT_16TH,
        synth: [600, 0, 0, 580, 0, 0, 560, 0, 600, 0, 0, 580, 0, 0, 560, 0]
    }
  },
  
  // --- AMAPIANO ---
  {
    id: 'amapiano-deep-log',
    name: 'Amapiano Deep Log',
    category: 'Amapiano',
    bpm: 112,
    kit: 'amapiano',
    description: 'Swing-heavy, off-beat emphasis.',
    pattern: {
      kick: [true, false, false, false, true, false, false, true, false, false, true, false, true, false, false, false],
      snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat: HIHAT_16TH,
      synth: [0, 80, 0, 0, 110, 0, 80, 0, 0, 98, 0, 0, 73, 0, 0, 0]
    }
  },
  {
    id: 'amapiano-club',
    name: 'Amapiano Club',
    category: 'Amapiano',
    bpm: 114,
    kit: 'amapiano',
    description: 'Strong groove, punchy kick.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: [false, false, false, true, false, false, false, true, false, false, false, true, false, true, false, true],
      hihat: [true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true],
      synth: [110, 0, 110, 0, 98, 0, 0, 123, 0, 110, 0, 98, 0, 87, 87, 0]
    }
  },
  // --- AFRO ---
  {
    id: 'afrobeats-classic',
    name: 'Afrobeats Classic',
    category: 'Afro',
    bpm: 100,
    kit: 'afro',
    description: 'Bounce groove, syncopated.',
    pattern: {
      kick: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
      snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat: [true, true, false, true, true, true, false, true, true, true, false, true, true, true, false, true],
      synth: [440, 0, 0, 523, 0, 0, 392, 0, 440, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  {
    id: 'afro-pop-bright',
    name: 'Afro Pop Bright',
    category: 'Afro',
    bpm: 105,
    kit: 'afro',
    description: 'Clean, straight groove.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: [false, false, false, true, false, false, true, false, false, false, false, true, false, false, true, false],
      hihat: HIHAT_16TH,
      synth: [523, 0, 0, 587, 0, 523, 0, 0, 659, 0, 0, 587, 0, 0, 523, 0]
    }
  },
  {
    id: 'afro-fusion-global',
    name: 'Afro Fusion',
    category: 'Afro',
    bpm: 98,
    kit: 'afro',
    description: 'Hybrid African + western.',
    pattern: {
      kick: [true, false, true, false, false, false, true, false, true, false, true, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, false, true, true, true, false, true, false, true, false, true, true, true, false],
      synth: [392, 0, 440, 0, 0, 0, 329, 0, 0, 0, 392, 0, 0, 0, 0, 0]
    }
  },
  {
    id: 'afro-soul-warm',
    name: 'Afro Soul Warm',
    category: 'Afro',
    bpm: 90,
    kit: 'afro',
    description: 'Loose, emotional.',
    pattern: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: SNARE_BACKBEAT,
      hihat: HIHAT_8TH,
      synth: [261, 0, 329, 0, 392, 0, 0, 0, 261, 0, 329, 0, 392, 0, 0, 0]
    }
  },
  // --- HIPHOP / TRAP ---
  {
    id: 'afro-drill-dark',
    name: 'Afro Drill Dark',
    category: 'Hip-Hop',
    bpm: 142,
    kit: 'trap',
    description: 'Aggressive, sliding patterns.',
    pattern: {
      kick: [true, false, false, false, false, false, false, false, true, false, false, true, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, true, true, false, true, false, true, true, true, false, true, false, true, false],
      synth: [0, 0, 150, 0, 0, 0, 0, 0, 0, 0, 150, 0, 0, 0, 140, 0]
    }
  },
  {
    id: 'trap-afro-fusion',
    name: 'Trap Afro Fusion',
    category: 'Hip-Hop',
    bpm: 135,
    kit: 'trap',
    description: 'Trap bounce + Afro swing.',
    pattern: {
      kick: [true, false, false, false, true, false, false, false, true, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      hihat: HIHAT_16TH,
      synth: [300, 0, 0, 0, 0, 0, 280, 0, 0, 0, 0, 0, 0, 0, 260, 0]
    }
  },
  // --- R&B ---
  {
    id: 'rnb-afro-chill',
    name: 'R&B Afro Chill',
    category: 'R&B',
    bpm: 88,
    kit: 'default',
    description: 'Slow, laid-back.',
    pattern: {
      kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      snare: SNARE_BACKBEAT,
      hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true],
      synth: [261, 261, 0, 0, 293, 293, 0, 0, 329, 329, 0, 0, 0, 0, 0, 0]
    }
  },
  {
    id: 'late-night-rnb',
    name: 'Late Night R&B',
    category: 'R&B',
    bpm: 89,
    kit: 'trap',
    description: 'Minimal, intimate.',
    pattern: {
      kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
      snare: SNARE_BACKBEAT,
      hihat: HIHAT_8TH,
      synth: [150, 0, 0, 0, 0, 0, 0, 0, 130, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  // --- POP ---
  {
    id: 'epop-future',
    name: 'E-Pop Future',
    category: 'Pop',
    bpm: 120,
    kit: 'default',
    description: 'Tight, digital.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: SNARE_BACKBEAT,
      hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth: [261, 0, 0, 261, 329, 0, 0, 329, 392, 0, 0, 392, 523, 0, 0, 0]
    }
  },
  {
    id: 'afro-edm-festival',
    name: 'Afro EDM Festival',
    category: 'Pop',
    bpm: 126,
    kit: 'electronic',
    description: 'Build-drop structure.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
      hihat: HIHAT_8TH,
      synth: [440, 440, 440, 0, 440, 440, 440, 0, 523, 523, 523, 0, 392, 392, 392, 0]
    }
  },
  // --- TRADITIONAL ---
  {
    id: 'tribal-afro-raw',
    name: 'Tribal Afro Raw',
    category: 'Traditional',
    bpm: 95,
    kit: 'afro',
    description: 'Polyrhythmic, raw.',
    pattern: {
      kick: [true, false, true, true, false, false, true, false, true, false, true, true, false, false, true, false],
      snare: [false, true, false, false, true, false, false, true, false, true, false, false, true, false, false, true],
      hihat: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, true],
      synth: [0, 0, 261, 0, 0, 0, 293, 0, 0, 0, 261, 0, 0, 0, 392, 0]
    }
  },
  {
    id: 'afro-cinematic',
    name: 'Afro Cinematic',
    category: 'Cinematic',
    bpm: 85,
    kit: 'default',
    description: 'Slow, dramatic.',
    pattern: {
      kick: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false],
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      hihat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      synth: [261, 261, 261, 261, 329, 329, 329, 329, 392, 392, 392, 392, 523, 523, 523, 523]
    }
  },
  // --- SOCIAL ---
  {
    id: 'tiktok-afro-loop',
    name: 'TikTok Afro Loop',
    category: 'Social',
    bpm: 103,
    kit: 'afro',
    description: 'Simple, catchy, minimal kit.',
    pattern: {
      kick: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false],
      snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      hihat: HIHAT_8TH,
      synth: [523, 0, 0, 0, 523, 0, 0, 0, 587, 0, 0, 0, 587, 0, 0, 0]
    }
  },
  {
    id: 'freestyle-neutral',
    name: 'Freestyle Neutral',
    category: 'Social',
    bpm: 94,
    kit: 'trap',
    description: 'Simple, open.',
    pattern: {
      kick: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: SNARE_BACKBEAT,
      hihat: HIHAT_16TH,
      synth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  },
  // --- FUTURE ---
  {
    id: 'afro-future-bass',
    name: 'Afro Future Bass',
    category: 'Future',
    bpm: 116,
    kit: 'electronic',
    description: 'Bouncy, modern.',
    pattern: {
      kick: [true, false, true, false, false, false, true, false, false, false, true, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      synth: [261, 0, 0, 261, 0, 0, 329, 0, 0, 392, 0, 0, 523, 0, 0, 0]
    }
  },
  {
    id: 'ambient-afro',
    name: 'Ambient Afro',
    category: 'Future',
    bpm: 78,
    kit: 'default',
    description: 'Sparse, pads.',
    pattern: {
      kick: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      hihat: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      synth: [392, 0, 392, 0, 440, 0, 440, 0, 329, 0, 329, 0, 261, 0, 261, 0]
    }
  },
  {
    id: 'club-afro-tech',
    name: 'Club Afro Tech',
    category: 'Future',
    bpm: 125,
    kit: 'electronic',
    description: 'Driving, repetitive.',
    pattern: {
      kick: KICK_4_FLOOR,
      snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      synth: [110, 0, 110, 0, 110, 0, 110, 0, 110, 0, 110, 0, 110, 0, 110, 0]
    }
  }
];