export const PROMPT_PACES = [
  { id: "sermon", label: "Sermon", wpm: 90 },
  { id: "news", label: "News", wpm: 140 },
  { id: "fast", label: "Fast", wpm: 180 },
  { id: "voice", label: "Voice", wpm: 0 },
] as const;

export type PromptPace = (typeof PROMPT_PACES)[number]["id"];

export function scriptWords(script: string) {
  return script
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function displayWords(script: string) {
  return script.trim().split(/\s+/).filter(Boolean);
}

export function wordsAtWpm(elapsedMs: number, wpm: number) {
  if (wpm <= 0) return 0;
  return Math.floor((elapsedMs / 60000) * wpm);
}

/** Advance through the script from what SpeechRecognition just heard. */
export function followVoice(words: string[], cursor: number, heard: string) {
  const tokens = scriptWords(heard);
  let i = cursor;
  for (const token of tokens) {
    const window = words.slice(i, i + 8);
    const hit = window.findIndex((w) => sameWord(w, token));
    if (hit >= 0) i += hit + 1;
  }
  return Math.min(i, words.length);
}

function sameWord(script: string, heard: string) {
  if (script === heard) return true;
  if (heard.length >= 4 && script.startsWith(heard.slice(0, 4))) return true;
  if (script.length >= 4 && heard.startsWith(script.slice(0, 4))) return true;
  return false;
}

type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean } & { length: number }> }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechCtor = new () => SpeechRec;

export function speechEngine(): SpeechRec | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";
  return rec;
}