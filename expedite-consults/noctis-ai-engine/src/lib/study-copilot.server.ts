import { strategySheet } from "@/lib/noctis-hard";
import { parseCopilot } from "@/lib/study-copilots";
import type { Evidence, StudyCard } from "@/lib/knowledge-types";

function focus(ask: string) {
  const hit = ask.match(/\b(paul|grace|faith|salvation|church|moses|david|jesus|love|lions?|ephesians)\b/i);
  return hit?.[1] || ask;
}

async function wikiNotes(question: string) {
  const query = question
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^(?:please\s+|can you\s+|could you\s+)?(?:explain(?:\s+in\s+detail|\s+deeply|\s+clearly|\s+simply)?|what\s+is|what\s+are|who\s+is|how\s+does|how\s+do|tell\s+me\s+about|define|describe)\s+/i, "")
    .replace(/^(?:a|an|the)\s+/i, "")
    .replace(/\s+(?:is|are|work|works|mean|means)\s*\??$/i, "")
    .trim()
    .slice(0, 160);
  if (query.length < 2) return { notes: "", evidence: [] as Evidence[] };
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=2&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exchars=700&format=json`,
      { headers: { "user-agent": "Noctis" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return { notes: "", evidence: [] as Evidence[] };
    const data = (await res.json()) as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: boolean; index?: number }> } };
    const evidence: Evidence[] = Object.values(data.query?.pages ?? {})
      .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
      .filter((page) => page.title && page.extract && !page.missing)
      .slice(0, 2)
      .map((page) => ({
        source: page.title || "Wikipedia",
        type: "Wikipedia",
        relevance: "Retrieved page",
        href: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || "")}`,
        passage: (page.extract || "").replace(/\s+/g, " ").trim().slice(0, 700),
      }));
    return { notes: evidence.map((row) => `${row.source} (${row.href}): ${row.passage}`).join("\n\n"), evidence };
  } catch {
    return { notes: "", evidence: [] as Evidence[] };
  }
}

export async function runTutor(question: string, spoken = "English", level: "beginner" | "intermediate" | "advanced" | "expert" = "beginner") {
  const { parseTutor } = await import("@/lib/tutors");
  const parsed = parseTutor(question);
  if (!parsed) return null;
  const { tutor, ask } = parsed;
  const { depthStance } = await import("@/lib/depth");
  const cardBase = (sentence: string, steps: string[], note: string, confidence: StudyCard["confidence"] = "supported"): { text: string; card: StudyCard } => ({
    text: [sentence, ...steps].filter(Boolean).join("\n\n"),
    card: { question, sentence, domain: tutor.id, confidence, steps, evidence: [], next: [], note: `${tutor.label}. Tool: ${tutor.tool}. ${note}` },
  });
  if (tutor.id === "math") {
    const { solveWork } = await import("@/lib/calc");
    const work = solveWork(ask);
    if (!work) return cardBase("The calculator did not parse that. No number was guessed.", ["Say the expression in digits, such as (6 * 7) + 5."], "The calculator is the only math tool.", "insufficient");
    const body = work.full || work.short;
    return cardBase(work.title || "Calculated", body.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 12), "The number was computed, not recalled.", "verified");
  }
  if (tutor.id === "research") {
    const { researchReport } = await import("@/lib/video-mind.server");
    const report = await researchReport(`Research this topic: ${ask}`);
    const text = "text" in report ? report.text : "error" in report ? report.error : "No report.";
    return cardBase(text.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 400) || "Research report", text.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 16), "Sources were searched and cited.");
  }
  if (tutor.id === "career") {
    const { CAREERS } = await import("@/lib/career-nav");
    const words = ask.toLowerCase().split(/[^a-z0-9+]+/).filter((word) => word.length > 3);
    const hits = CAREERS.filter((career) => {
      const hay = `${career.name} ${career.category} ${career.skills.join(" ")} ${career.description}`.toLowerCase();
      return words.some((word) => hay.includes(word));
    }).slice(0, 3);
    if (!hits.length) return cardBase("No career on the stored list matched that. Name a trade, such as electrician. None was guessed.", [], "The career list is the only source.", "insufficient");
    const steps = hits.map((career) => `${career.name}. ${career.description} First step on the stored path: ${career.stages[0]?.title || "not listed"}. This is a study path, not a job offer.`);
    return cardBase(steps[0] || "Career", steps, "Taken from the stored career list.", "supported");
  }
  if (tutor.id !== "writing") return null;
  if (ask.length < 12) return cardBase("Paste the words you want coached. Nothing was rewritten.", [], "The writing coach uses only the text you give.", "insufficient");
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        { role: "system", content: `${tutor.voice} ${depthStance(level, ask)} ${spoken.toLowerCase() === "english" ? "Write in English." : `Write in ${spoken}.`} ${strategySheet(ask)}` },
        { role: "user", content: ask.slice(0, 4000) },
      ],
      { temperature: 0.2, maxTokens: 500 },
    );
    if ("error" in result) return cardBase("The writing coach could not revise that.", [], "No new draft was invented.", "insufficient");
    const answer = result.text.trim();
    if (!answer) return cardBase("The writing coach returned nothing.", [], "No new draft was invented.", "insufficient");
    return cardBase(answer.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 400) || "Revision", answer.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 12), "Revised from the text you gave. No fact was added.");
  } catch {
    return cardBase("The writing coach could not revise that.", [], "No new draft was invented.", "insufficient");
  }
}

export async function runCopilot(question: string, spoken = "English", level: "beginner" | "intermediate" | "advanced" | "expert" = "beginner") {
  const parsed = parseCopilot(question);
  if (!parsed) return null;
  if (/sermon|white paper|overview of the book|CVE-\d{4}-\d+|\b\d{1,3}\s*:\s*\d{1,3}\b/i.test(question)) return null;
  const blocks: string[] = [];
  const evidence: Evidence[] = [];
  const { curatedCard } = await import("@/lib/knowledge-engine");
  const curated = curatedCard(parsed.ask);
  if (curated?.evidence.length) {
    blocks.push(`Vibe shelf\n${curated.sentence}\n${curated.steps.join("\n")}`);
    evidence.push(...curated.evidence);
  }
  const { walkGraph, formatMap } = await import("@/lib/knowledge-graph");
  const walk = walkGraph(`${parsed.mode?.label ?? ""} ${parsed.ask}`);
  if (walk) blocks.push(formatMap(walk));
  if (parsed.copilot.id === "bible") {
    const { bibleNotes } = await import("@/lib/knowledge.server");
    const bible = await bibleNotes(focus(parsed.ask));
    if (bible) {
      blocks.push(`King James text\n${bible.notes}`);
      evidence.push(...bible.evidence);
    }
  } else {
    const wiki = await wikiNotes(parsed.ask);
    if (wiki.notes) blocks.push(wiki.notes);
    evidence.push(...wiki.evidence);
  }
  const packet = blocks.filter(Boolean).join("\n\n");
  const { depthStance } = await import("@/lib/depth");
  const language = spoken.toLowerCase() === "english" ? "Write in English." : `Write in ${spoken}. Keep names, verses, and numbers unchanged.`;
  if (packet.trim().length < 40) {
    const text = `${parsed.copilot.label} copilot · ${parsed.mode?.label ?? "Study"}\n\nNothing was retrieved for that, so it was not guessed.`;
    const card: StudyCard = {
      question,
      sentence: "Nothing was retrieved for that copilot, so it was not guessed.",
      domain: parsed.copilot.id,
      confidence: "insufficient",
      steps: [parsed.job],
      evidence,
      next: [],
      note: `${parsed.copilot.label} copilot. ${parsed.copilot.line}`,
    };
    return { text, card };
  }
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        { role: "system", content: `You are the ${parsed.copilot.label} copilot. ${parsed.job} Use only the notes below. ${language} ${depthStance(level, parsed.ask)} ${strategySheet(parsed.ask)}` },
        { role: "user", content: `Job: ${parsed.mode?.label ?? "Study"}\nQuestion: ${parsed.ask.slice(0, 600)}\n\n${packet.slice(0, 7000)}` },
      ],
      { temperature: 0, maxTokens: 600 },
    );
    if ("error" in result) return null;
    const answer = result.text.trim();
    if (!answer) return null;
    const { stampBrain } = await import("@/lib/brain-stamp");
    const text = await stampBrain(answer, packet, { strict: false });
    const card: StudyCard = {
      question,
      sentence: answer.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 500) || answer.slice(0, 500),
      domain: parsed.copilot.id,
      confidence: "supported",
      steps: answer.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 8),
      evidence: evidence.slice(0, 6),
      next: [],
      note: `${parsed.copilot.label} copilot · ${parsed.mode?.label ?? "Study"}. ${parsed.copilot.line}`,
    };
    return { text, card };
  } catch {
    return null;
  }
}
