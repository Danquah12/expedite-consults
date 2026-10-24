export type FilmMark = { postId: string; at: number; note: string };

const KEY = "vibetok-film-marks";

export function filmMarks(postId: string): FilmMark[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as FilmMark[];
    return (Array.isArray(raw) ? raw : []).filter((row) => row.postId === postId).slice(-8);
  } catch {
    return [];
  }
}

export function addFilmMark(postId: string, at: number) {
  if (typeof localStorage === "undefined") return [];
  const all = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as FilmMark[];
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  })();
  const next = [...all.filter((row) => !(row.postId === postId && Math.abs(row.at - at) < 2)), { postId, at: Math.max(0, Math.round(at)), note: "Marked on this film" }].slice(-40);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next.filter((row) => row.postId === postId);
}

export function clockLabel(at: number) {
  const safe = Math.max(0, Math.round(at));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
