import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Split on sentence marks. No lookbehind, so older phones outside the US can open the app. */
export function splitSentences(text: string, marks = ".?!") {
  const out: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (ch === "\n") {
      const line = buf.replace(/\s+/g, " ").trim();
      if (line) out.push(line);
      buf = "";
      continue;
    }
    buf += ch;
    if (marks.includes(ch)) {
      const line = buf.replace(/\s+/g, " ").trim();
      if (line) out.push(line);
      buf = "";
    }
  }
  const rest = buf.replace(/\s+/g, " ").trim();
  if (rest) out.push(rest);
  return out;
}
