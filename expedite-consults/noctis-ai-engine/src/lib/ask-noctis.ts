import { useFeedStore } from "@/lib/feed-store";

function rememberReturn() {
  try {
    if (window.location.pathname === "/noctis") return;
    sessionStorage.setItem("noctis-return", `${window.location.pathname}${window.location.search}`);
  } catch {
    /* the page still opens */
  }
}

function storeAsk(text: string, picture?: string) {
  sessionStorage.setItem("vibe-ask", text);
  const shot = (picture || "").trim();
  if (/^data:image\/(png|jpeg|jpg|webp);/i.test(shot) && shot.length < 500_000) sessionStorage.setItem("vibe-picture", shot);
  else if (/^https:\/\//i.test(shot) && !/\.(mp4|webm|mov)(\?|$)/i.test(shot)) sessionStorage.setItem("vibe-picture", shot.slice(0, 800));
  else sessionStorage.removeItem("vibe-picture");
}

/** Ask from the page you are on. Vibe chat takes it on /vibe. Every other page answers in place. */
export function askNoctis(question: string, picture?: string) {
  const text = question.trim();
  if (!text || typeof window === "undefined") return;
  if (window.location.pathname === "/noctis") {
    storeAsk(text, picture);
    window.dispatchEvent(new Event("vibe:ask-now"));
    return;
  }
  window.dispatchEvent(new CustomEvent("study:ask", { detail: text }));
}

/** Leave Hall. The item waits in Ask anything until the user clicks it. */
export function openHallAsk(title: string, ask: string) {
  if (typeof window === "undefined") return;
  const subject = title.trim();
  const item = ask.trim();
  if (!subject || !item) return;
  sessionStorage.setItem("vibe-hall", JSON.stringify({ title: subject, ask: item }));
  sessionStorage.removeItem("vibe-ask");
  useFeedStore.getState().closeModal();
  if (window.location.pathname === "/noctis") {
    window.dispatchEvent(new Event("vibe:hall-ask"));
    return;
  }
  rememberReturn();
  window.location.assign("/noctis");
}

/** Open Vibe and send this question. */
export function openNoctis(question: string, picture?: string) {
  const text = question.trim();
  if (!text || typeof window === "undefined") return;
  storeAsk(text, picture);
  useFeedStore.getState().closeModal();
  if (window.location.pathname === "/noctis") {
    window.dispatchEvent(new Event("vibe:ask-now"));
    return;
  }
  rememberReturn();
  window.location.assign("/noctis");
}