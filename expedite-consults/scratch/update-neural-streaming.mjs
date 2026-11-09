import fs from 'node:fs';

const voiceFile = 'noctis-ai/src/lib/noctis-voice.ts';
let content = fs.readFileSync(voiceFile, 'utf8');

const targetSection = `  // 1. Try Studio-Quality Human Neural TTS if available (OpenAI tts-1 for <= 3800 chars)
  if (persona !== "natural" && cleaned.length <= 3800) {
    try {
      const { sayVibe } = await import("@/lib/noctis-api");
      let ttsVoice = "alloy";
      if (["onyx", "spruce", "cove", "arbor", "rivage", "miko", "neer", "rindo", "hanul", "tinta"].includes(persona)) {
        ttsVoice = "onyx";
      } else if (["nova", "maple", "breeze", "juniper", "viola", "vale", "aube", "sonna", "leher", "himari", "haetsal", "arrullo"].includes(persona)) {
        ttsVoice = "nova";
      } else if (persona === "echo") {
        ttsVoice = "echo";
      }

      const res = await sayVibe({
        data: {
          text: cleaned,
          voice: ttsVoice,
          speed: options?.rate || 1.0,
          keyOverride: options?.apiKey || "",
        },
      });
      const bag = res && typeof res === "object" ? (res as { audio?: unknown; result?: unknown; error?: unknown }) : {};
      const inner = bag.result && typeof bag.result === "object" ? (bag.result as { audio?: unknown; error?: unknown }) : bag;
      const audioUrl = typeof inner.audio === "string" ? inner.audio : "";
      if (audioUrl && audioUrl.startsWith("data:audio/")) {
        const played = await new Promise<boolean>((resolve) => {
          try {
            const audio = new Audio(audioUrl);
            currentAudioElement = audio;
            if (options?.onStart) options.onStart();
            audio.onended = () => {
              currentAudioElement = null;
              if (options?.onEnd) options.onEnd();
              resolve(true);
            };
            audio.onerror = () => {
              currentAudioElement = null;
              resolve(false);
            };
            audio.play().catch(() => {
              currentAudioElement = null;
              resolve(false);
            });
          } catch {
            currentAudioElement = null;
            resolve(false);
          }
        });

        if (played) {
          return true;
        }
      }
    } catch {
      // Fallback seamlessly to native browser speech synthesis
    }
  }`;

const replacementSection = `  // 1. Studio-Quality Human Neural TTS (OpenAI tts-1 / tts-1-hd)
  if (persona !== "natural") {
    try {
      const { sayVibe } = await import("@/lib/noctis-api");
      let ttsVoice = "alloy";
      if (["onyx", "spruce", "cove", "arbor", "rivage", "miko", "neer", "rindo", "hanul", "tinta"].includes(persona)) {
        ttsVoice = "onyx";
      } else if (["nova", "maple", "breeze", "juniper", "viola", "aube", "sonna", "leher", "himari", "haetsal", "arrullo"].includes(persona)) {
        ttsVoice = "nova";
      } else if (persona === "echo") {
        ttsVoice = "echo";
      } else if (["vale", "fable"].includes(persona)) {
        ttsVoice = "fable";
      } else if (["shimmer", "sol", "bubbie"].includes(persona)) {
        ttsVoice = "shimmer";
      }

      const playAudio = (url: string, isFirst = false, isLast = false): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
          try {
            const audio = new Audio(url);
            currentAudioElement = audio;
            if (isFirst && options?.onStart) options.onStart();
            audio.onended = () => {
              currentAudioElement = null;
              if (isLast && options?.onEnd) options.onEnd();
              resolve(true);
            };
            audio.onerror = () => {
              currentAudioElement = null;
              resolve(false);
            };
            audio.play().catch(() => {
              currentAudioElement = null;
              resolve(false);
            });
          } catch {
            currentAudioElement = null;
            resolve(false);
          }
        });
      };

      if (cleaned.length <= 3800) {
        const res = await sayVibe({
          data: {
            text: cleaned,
            voice: ttsVoice,
            speed: options?.rate || 1.0,
            keyOverride: options?.apiKey || "",
          },
        });
        const bag = res && typeof res === "object" ? (res as { audio?: unknown; result?: unknown; error?: unknown }) : {};
        const inner = bag.result && typeof bag.result === "object" ? (bag.result as { audio?: unknown; error?: unknown }) : bag;
        const audioUrl = typeof inner.audio === "string" ? inner.audio : "";
        if (audioUrl && audioUrl.startsWith("data:audio/")) {
          const played = await playAudio(audioUrl, true, true);
          if (played) return true;
        }
      } else {
        // Multi-chunk continuous studio neural streaming for long texts
        const neuralChunks = splitIntoSpokenChunks(cleaned, 3000);
        let allPlayed = true;
        for (let i = 0; i < neuralChunks.length; i++) {
          const res = await sayVibe({
            data: {
              text: neuralChunks[i],
              voice: ttsVoice,
              speed: options?.rate || 1.0,
              keyOverride: options?.apiKey || "",
            },
          });
          const bag = res && typeof res === "object" ? (res as { audio?: unknown; result?: unknown; error?: unknown }) : {};
          const inner = bag.result && typeof bag.result === "object" ? (bag.result as { audio?: unknown; error?: unknown }) : bag;
          const audioUrl = typeof inner.audio === "string" ? inner.audio : "";
          if (audioUrl && audioUrl.startsWith("data:audio/")) {
            const played = await playAudio(audioUrl, i === 0, i === neuralChunks.length - 1);
            if (!played) { allPlayed = false; break; }
          } else {
            allPlayed = false;
            break;
          }
        }
        if (allPlayed) return true;
      }
    } catch {
      // Fallback seamlessly to native browser speech synthesis
    }
  }`;

// Use regex match to avoid line ending issues
const targetRegex = /\/\/ 1\. Try Studio-Quality Human Neural TTS if available[\s\S]*?\/\/ Fallback seamlessly to native browser speech synthesis\s*\}\s*\}/;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacementSection);
  fs.writeFileSync(voiceFile, content, 'utf8');
  console.log('Successfully updated speakNoctisVoice in noctis-voice.ts');
} else {
  console.error('Target regex did not match in noctis-voice.ts');
}
