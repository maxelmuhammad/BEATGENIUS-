import { GoogleGenAI, Type } from "@google/genai";
import { PatternData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const STYLES_INSTRUCTION = `
You are an expert music producer specializing in Afro, Amapiano, Hip-Hop, and Electronic music.
Understand the following Style IDs and their characteristics to generate authentic patterns:

1. amapiano_deep_log (108-113 BPM): Swing-heavy, off-beat emphasis. Soft kick, shakers, rim. Deep log drum glide.
2. amapiano_club (112-115 BPM): Strong groove, punchy kick, layered perc, aggressive log bass.
3. afrobeats_classic (98-104 BPM): Bounce groove, syncopated. Kick, snare, conga, rim. Warm sub.
4. afro_pop_bright (102-108 BPM): Clean, straight groove. Snappy snares, claps, tight bass.
5. afro_fusion_global (94-102 BPM): Hybrid African/Western. Organic perc + electronic. Smooth sub.
6. afro_soul_warm (88-94 BPM): Loose, emotional. Soft snares, brushed drums, warm bass.
7. afro_drill_dark (138-145 BPM): Aggressive sliding 808s, drill hats, punchy kicks. Dark.
8. trap_afro_fusion (130-140 BPM): Trap bounce + Afro swing. Trap kit + percussion. Distorted 808.
9. rnb_afro_chill (85-92 BPM): Slow, laid-back. Soft kicks, snaps, smooth sub.
10. late_night_rnb (88-90 BPM): Minimal, intimate. Sparse drums, deep sub.
11. epop_future (118-124 BPM): Tight, digital. Clean electronic drums, synth bass.
12. afro_edm_festival (122-128 BPM): Build-drop structure. Big kicks, claps, sidechained bass.
13. tribal_afro_raw (90-100 BPM): Polyrhythmic. Talking drums, hand percussion.
14. afro_cinematic (80-90 BPM): Slow, dramatic. Strings, pads, deep drums.
15. tiktok_afro_loop (100-105 BPM): Simple, catchy, minimal kit, strong hook.
16. freestyle_neutral (92-98 BPM): Simple, open, basic kick/snare.
17. afro_future_bass (112-118 BPM): Bouncy, modern. Modulated synth bass.
18. ambient_afro (70-85 BPM): Sparse, pads, textures.
19. club_afro_tech (124-128 BPM): Driving, repetitive. Tech kicks + Afro perc.
20. vocal_ready_space: Clean, uncluttered, minimal.

Use these styles to inform step placement (swing vs straight) and density.
`;

export async function generatePattern(description: string): Promise<PatternData> {
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    ${STYLES_INSTRUCTION}
    
    Create a 16-step sequencer pattern for Kick, Snare, HiHat, and a simple Synth melody based on the user's description.
    The output must be strictly 16 steps per instrument.
    For the synth, provide frequencies in Hertz from the C Major Pentatonic scale (roughly 261 to 659 Hz) or specific low frequencies (60-150Hz) for log drums if the style demands it.
    If the description matches a Style ID or name, STRICTLY adhere to that style's rhythm and vibe.
    0 means silence for synth.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Description: ${description}. Generate a 16-step beat.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          kick: {
            type: Type.ARRAY,
            items: { type: Type.BOOLEAN },
            description: "16 boolean steps for Kick drum"
          },
          snare: {
            type: Type.ARRAY,
            items: { type: Type.BOOLEAN },
            description: "16 boolean steps for Snare drum"
          },
          hihat: {
            type: Type.ARRAY,
            items: { type: Type.BOOLEAN },
            description: "16 boolean steps for HiHat"
          },
          synth: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "16 steps for Synth. 0 for rest, >0 for frequency (Hz)"
          }
        },
        required: ["kick", "snare", "hihat", "synth"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(text) as PatternData;
    // Validate length ensures 16 steps
    if (data.kick.length !== 16 || data.snare.length !== 16 || data.hihat.length !== 16 || data.synth.length !== 16) {
        // Fallback or pad if AI messes up length (unlikely with schema)
        console.warn("AI returned incorrect pattern length. Adjusting.");
    }
    return data;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to parse musical pattern.");
  }
}