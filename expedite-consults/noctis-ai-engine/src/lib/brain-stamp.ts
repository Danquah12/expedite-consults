import { readFileSync } from "node:fs";
import { claimStanding, judgeEvidence, stripStatus, transparencyBlock } from "@/lib/evidence";

function xaiKey() {
  const env = process.env.XAI_API_KEY?.trim();
  if (env) return env;
  try {
    const text = readFileSync(".env", "utf8");
    const line = text.split(/\r?\n/).find((row) => row.startsWith("XAI_API_KEY="));
    return line?.slice("XAI_API_KEY=".length).trim().replace(/^['"]|['"]$/g, "") || "";
  } catch {
    return "";
  }
}

async function grokCheck(draft: string, notes: string) {
  const key = xaiKey();
  if (!key || !draft.trim() || notes.trim().length < 40) return "";
  const packet = `Notes:\n${notes.trim().slice(0, 8000)}\n\nDraft:\n${draft.slice(0, 6000)}`;
  for (const model of ["grok-3-mini", "grok-3"]) {
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          model,
          temperature: 0,
          max_tokens: 220,
          messages: [
            {
              role: "system",
              content:
                "You check a draft against notes. The notes are the only facts. Do not rewrite the answer. Do not add a fact. Reply in exactly two lines:\nVerdict: Supported | Partially supported | Not supported\nGaps: one sentence, or None",
            },
            { role: "user", content: packet },
          ],
        }),
      });
      if (res.status === 404) continue;
      if (!res.ok) return "";
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      if (!/^Verdict:/im.test(text)) return "";
      return text.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3).join("\n");
    } catch {
      return "";
    }
  }
  return "";
}

export async function stampBrain(text: string, notes: string, opts?: { strict?: boolean }) {
  const strict = opts?.strict === true;
  const ground = notes.trim();
  const checked = await grokCheck(text, ground);
  const verdict = (checked.split("\n").find((line) => /^Verdict:/i.test(line)) || "").toLowerCase();
  const gaps = checked.split("\n").find((line) => /^Gaps:/i.test(line))?.replace(/^Gaps:\s*/i, "") || "";
  let body = stripStatus(text);
  if (verdict.includes("not supported") && strict) body = `Not in the record. ${gaps || "The notes do not support that draft."}`;
  const frame = judgeEvidence(ground);
  const sources = frame.sources.length;
  const sourcesConflict = frame.status === "Conflicting" || /sources disagree|conflicting reports/i.test(ground);
  const unsupported = verdict.includes("not supported");
  const strength =
    !ground || frame.status === "Insufficient" || unsupported || sourcesConflict
      ? "Insufficient evidence"
      : verdict.includes("partial") || frame.status === "Partially supported" || !checked
        ? "Moderate"
        : "High";
  const compared =
    sources > 1
      ? `${sources} sources were opened and compared.`
      : sources === 1
        ? "One source was opened. Nothing else was found to compare."
        : ground
          ? "Notes were opened, but no separate source link was found to compare."
          : "No source was opened.";
  const contradictions = sourcesConflict
    ? "Contradictions: the retrieved notes do not agree, so no side was chosen."
    : unsupported
      ? `Contradictions: ${gaps && gaps.toLowerCase() !== "none" ? gaps : "the draft adds a claim the sources do not contain."}`
      : "Contradictions: none in the retrieved notes.";
  const hallucination = !ground
    ? "The claim was not checked against a source."
    : verdict.includes("not supported") || verdict.includes("partial")
      ? gaps || "Part of the draft is not in the sources."
      : checked
        ? "The draft matches the sources that were opened."
        : "Sources were opened, but the second check did not return.";
  const standing = claimStanding(ground, verdict);
  const label = strength === "Insufficient evidence" ? "Insufficient evidence" : `Evidence strength: ${strength}`;
  return [body, `Claim standing: ${standing}`, "This is not a true or false label.", label, `Compared: ${compared}`, contradictions, hallucination, transparencyBlock(ground, strength, standing)].filter(Boolean).join("\n\n");
}
