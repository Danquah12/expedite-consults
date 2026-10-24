import { useState } from "react";
import { loadFilmSpeech } from "@/lib/video-mind-api";
import { askNoctis } from "@/lib/ask-noctis";

export function SayToNoctis({ youtubeId, title }: { youtubeId?: string | null; title: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={(event) => {
        event.stopPropagation();
        setBusy(true);
        void loadFilmSpeech({ data: { youtubeId: youtubeId || "", title } })
          .then((speech) => {
            const words = speech.spoken.trim();
            const ask = words
              ? `Knowledge film: ${title}\nLanguage: ${speech.language || "unknown"}\nSpoken words:\n${words}\n\nSay what they are saying. If the words are not English, give the meaning in English. Use only these words. Do not add a fact that is not in them.`
              : `Knowledge film: ${title}\nThe spoken words did not come back. Say that. Do not invent what the speaker said.`;
            askNoctis(ask);
          })
          .catch(() => {
            askNoctis(`Knowledge film: ${title}\nThe spoken words did not come back. Say that. Do not invent what the speaker said.`);
          })
          .finally(() => setBusy(false));
      }}
      className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-fg"
    >
      {busy ? "Reading the words…" : "What are they saying"}
    </button>
  );
}
