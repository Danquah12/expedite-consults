export function formatCount(num: number): string {
  if (num >= 1_000_000) {
    const n = num / 1_000_000;
    return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + "M";
  }
  if (num >= 1_000) {
    const n = num / 1_000;
    return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)) + "K";
  }
  return num.toLocaleString();
}

export function formatClock(sec: number) {
  const n = Math.max(0, Math.floor(sec));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatWhen(ms: number) {
  if (!ms) return "Not yet";
  return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
