import type { FeedPost } from "@/lib/feed-data";
import type { DayWatch } from "@/lib/shuffle";

const KEY = "vibetok-passport";

const TRACKS: { label: string; test: RegExp }[] = [
  { label: "Bible", test: /bible|scripture|gospel|psalm|covenant/i },
  { label: "Cybersecurity", test: /cyber|malware|authenticat|encrypt|nist|phish/i },
  { label: "Science", test: /biolog|physics|chemist|\bcell\b|climate|planet/i },
  { label: "Engineering", test: /circuit|voltage|engine|mechanical|electron/i },
  { label: "Media literacy", test: /claim|source|misinfo|headline|opinion/i },
  { label: "Civic knowledge", test: /civic|court|election|budget|congress|ballot/i },
];

export function passportOn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setPassport(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
}

export function passportBars(posts: FeedPost[], watch: DayWatch, passed: Record<string, boolean>) {
  const byId = new Map(posts.map((post) => [post.id, post]));
  return TRACKS.map((track) => {
    let seen = 0;
    let pass = 0;
    for (const id of watch.played ?? []) {
      const post = byId.get(id);
      if (!post) continue;
      const text = `${post.teach.stamp} ${post.teach.hook} ${post.caption}`;
      if (!track.test.test(text)) continue;
      seen += 1;
      if (passed[id]) pass += 1;
    }
    return {
      label: track.label,
      pass,
      seen,
      pct: seen ? Math.round((pass / seen) * 100) : 0,
    };
  });
}
