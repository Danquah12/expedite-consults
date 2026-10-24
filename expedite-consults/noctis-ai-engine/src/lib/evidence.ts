export type EvidenceStatus = "Verified" | "Partially supported" | "Conflicting" | "Insufficient";

export type EvidenceFrame = {
  status: EvidenceStatus;
  sources: { name: string; href: string }[];
};

const PRIMARY = /(?:^|\.)(?:nvd\.nist\.gov|cisa\.gov|microsoft\.com|msrc\.microsoft\.com|csrc\.nist\.gov|first\.org|owasp\.org|github\.com|nih\.gov|ncbi\.nlm\.nih\.gov)$/i;
const SKIP = /(?:^|\.)(?:youtube\.com|youtu\.be)$|^google\.com$/i;

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function judgeEvidence(notes: string): EvidenceFrame {
  const hrefs = [...notes.matchAll(/https?:\/\/[^\s)>\]]+/g)].map((match) => match[0].replace(/[.,]+$/, ""));
  const byHost = new Map<string, string>();
  for (const href of hrefs) {
    const host = hostOf(href);
    if (!host || SKIP.test(host) || byHost.has(host)) continue;
    byHost.set(host, href);
  }
  const sources = [...byHost.entries()].slice(0, 6).map(([name, href]) => ({ name, href }));
  const primary = sources.filter((row) => PRIMARY.test(row.name));
  const conflict = /sources disagree|conflicting reports|contradict(?:s|ed|ion)?/i.test(notes);
  const thin = notes.trim().length < 40 && !sources.length;
  const status: EvidenceStatus = thin
    ? "Insufficient"
    : conflict
      ? "Conflicting"
      : primary.length
        ? "Verified"
        : sources.length || notes.trim().length > 80
          ? "Partially supported"
          : "Insufficient";
  return { status, sources };
}

export type ClaimStanding = "Strongly supported" | "Supported" | "Unclear" | "Disputed" | "Contradicted" | "Insufficient evidence";

export function claimStanding(notes: string, verdict = ""): ClaimStanding {
  const frame = judgeEvidence(notes);
  const conflict = frame.status === "Conflicting" || /sources disagree|conflicting reports/i.test(notes);
  const said = verdict.toLowerCase();
  if (!notes.trim() || frame.status === "Insufficient") return "Insufficient evidence";
  if (conflict && said.includes("not supported")) return "Disputed";
  if (said.includes("not supported")) return "Contradicted";
  if (conflict) return "Disputed";
  if (!said || said.includes("partial")) return "Unclear";
  if (said.includes("supported") && frame.sources.length > 1) return "Strongly supported";
  if (said.includes("supported") || frame.sources.length) return "Supported";
  return "Unclear";
}

export function transparencyBlock(notes: string, strength: string, standing = "") {
  const frame = judgeEvidence(notes);
  const today = new Date().toISOString().slice(0, 10);
  const sourceLines = frame.sources.length ? frame.sources.map((row) => `- ${row.name} — ${row.href}`) : ["- None retrieved"];
  const passage = notes
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 80 && !line.startsWith("http"));
  const titles = [...notes.matchAll(/Wikipedia — ([^(:\n]+)/g)].map((match) => match[1].trim()).filter(Boolean);
  const related = [...new Set(titles)].slice(0, 4);
  const confidence = strength === "Insufficient evidence" ? "Insufficient evidence" : strength;
  return [
    "Sources",
    ...sourceLines,
    "Evidence",
    passage ? passage.slice(0, 320) : "No passage was retrieved.",
    "Related documents",
    related.length ? related.map((title) => `- ${title}`).join("\n") : "- None retrieved",
    "Last verified",
    today,
    "Confidence",
    confidence,
    "Claim standing",
    standing || claimStanding(notes),
  ].join("\n");
}

export function stripStatus(text: string) {
  return text
    .replace(/\n*Evidence status:[^\n]*/gi, "")
    .replace(/\n*Evidence strength:[^\n]*/gi, "")
    .replace(/\n*Claim standing:[^\n]*/gi, "")
    .trim();
}
