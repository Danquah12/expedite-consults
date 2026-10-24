import { pushPlayback, readPlaybackTools } from "@/lib/playback-desk";

export type PlaybackTools = {
  play_on_focus: "on" | "off";
  one_player: "on" | "off";
  preload_next: "on" | "off";
};

const FALLBACK: PlaybackTools = {
  play_on_focus: "on",
  one_player: "on",
  preload_next: "on",
};

let tools: PlaybackTools = FALLBACK;
const bag = new Map<string, { n: number; ms: number }>();
let timer = 0;

export function playbackTools() {
  return tools;
}

export function loadPlaybackTools() {
  if (typeof window === "undefined") return;
  void readPlaybackTools()
    .then((rows) => {
      const next = { ...FALLBACK };
      for (const row of rows) {
        if (row.key in next) next[row.key as keyof PlaybackTools] = row.value === "off" ? "off" : "on";
      }
      tools = next;
    })
    .catch(() => undefined);
}

export function notePlayback(key: "focus" | "started" | "tapped" | "stalled" | "sound", ms = 0) {
  if (typeof window === "undefined") return;
  const row = bag.get(key) ?? { n: 0, ms: 0 };
  row.n += 1;
  row.ms += Math.max(0, Math.round(ms));
  bag.set(key, row);
  if (!timer) timer = window.setTimeout(flushPlayback, 4000);
}

function flushPlayback() {
  timer = 0;
  if (!bag.size) return;
  const rows = [...bag.entries()].map(([key, row]) => ({ key, n: row.n, ms: row.ms }));
  bag.clear();
  void pushPlayback({ data: { rows } }).catch(() => undefined);
}
