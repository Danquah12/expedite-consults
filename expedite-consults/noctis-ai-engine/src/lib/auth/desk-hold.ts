/** Desk sign-in kept in this browser. Noctis sign-out does not clear it. */
const KEY = "vibetok.desk.hold";

export function readDeskHold(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function writeDeskHold(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(KEY, token);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}
