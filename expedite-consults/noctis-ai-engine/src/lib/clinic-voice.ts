let utterance: SpeechSynthesisUtterance | null = null;
let token = 0;

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => /en-GB/i.test(v.lang) && /Google|Daniel|Female|Natural/i.test(v.name)) ??
    voices.find((v) => /^en/i.test(v.lang) && /Google|Samantha|Natural|Female/i.test(v.name)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    null
  );
}

export function stopClinicVoice() {
  token += 1;
  utterance = null;
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

export function speakClinic(text: string) {
  stopClinicVoice();
  const line = text.replace(/\s+/g, " ").trim();
  if (!line || typeof window === "undefined" || !window.speechSynthesis) return;
  const mine = token;
  const parts = line.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [line];
  const talk = (index = 0) => {
    if (mine !== token || index >= parts.length) return;
    const u = new SpeechSynthesisUtterance(parts[index] ?? "");
    u.rate = 0.94;
    u.pitch = 0.98;
    u.volume = 1;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = () => talk(index + 1);
    utterance = u;
    window.speechSynthesis.speak(u);
  };
  if (window.speechSynthesis.getVoices().length) talk();
  else window.speechSynthesis.addEventListener("voiceschanged", () => talk(), { once: true });
}
