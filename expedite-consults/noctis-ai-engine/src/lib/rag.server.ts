import { strategySheet } from "@/lib/noctis-hard";
import type { Evidence, StudyCard } from "@/lib/knowledge-types";

export type RagDomain = "bible" | "science" | "engineering" | "cybersecurity";

const DOMAINS: { id: RagDomain; test: RegExp }[] = [
  { id: "bible", test: /\b(bible|scripture|psalm|gospel|verse)\b/i },
  { id: "cybersecurity", test: /\b(cyber|cybersecurity|phishing|malware|cia triad|least privilege|nvd|nist|vulnerability|vulnerabilities)\b/i },
  { id: "engineering", test: /\b(engineering|ohm|si units|factor of safety|circuit|voltage)\b/i },
  { id: "science", test: /\b(science|photosynthesis|scientific method|newton|physics|chemistry|biology|\bdna\b)\b/i },
];

export function ragDomain(question: string): RagDomain | null {
  const hit = DOMAINS.find((row) => row.test.test(question));
  return hit?.id ?? null;
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
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=4&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exchars=700&format=json`,
      { headers: { "user-agent": "Noctis" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return { notes: "", evidence: [] as Evidence[] };
    const data = (await res.json()) as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: boolean; index?: number }> } };
    const pages = Object.values(data.query?.pages ?? {})
      .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
      .filter((page) => page.title && page.extract && !page.missing);
    const evidence: Evidence[] = pages.slice(0, 4).map((page) => ({
      source: page.title || "Wikipedia",
      type: "Wikipedia",
      relevance: "Retrieved page",
      href: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title || "")}`,
      passage: (page.extract || "").replace(/\s+/g, " ").trim().slice(0, 700),
    }));
    const notes = evidence.map((row) => `${row.source} (${row.href}): ${row.passage}`).join("\n\n");
    return { notes, evidence };
  } catch {
    return { notes: "", evidence: [] as Evidence[] };
  }
}

export async function runRag(question: string, spoken = "English", level: "beginner" | "intermediate" | "advanced" | "expert" = "beginner"): Promise<{ text: string; card: StudyCard } | null> {
  const q = question.trim();
  if (q.length < 8) return null;
  if (/CVE-\d{4}-\d+/i.test(q) || /sermon|white paper/i.test(q) || /\b\d{1,3}\s*:\s*\d{1,3}\b/.test(q)) return null;
  const domain = ragDomain(q);
  if (!domain) return null;

  const { curatedCard } = await import("@/lib/knowledge-engine");
  const curated = curatedCard(q);
  const blocks: string[] = [];
  const evidence: Evidence[] = [];
  if (curated?.evidence.length) {
    blocks.push(`Vibe knowledge shelf: ${curated.domain}\n${curated.sentence}\n${curated.steps.join("\n")}`);
    evidence.push(...curated.evidence);
  }
  if (domain === "bible") {
    const { bibleNotes } = await import("@/lib/knowledge.server");
    const bible = await bibleNotes(q);
    if (bible) {
      blocks.push(`King James text retrieved for this question:\n${bible.notes}`);
      evidence.push(...bible.evidence);
    }
  } else {
    const wiki = await wikiNotes(q);
    if (wiki.notes) blocks.push(`Retrieved pages:\n${wiki.notes}`);
    evidence.push(...wiki.evidence);
  }
  const { walkGraph, formatMap } = await import("@/lib/knowledge-graph");
  const walk = walkGraph(q);
  if (walk) {
    blocks.push(formatMap(walk));
    for (const node of [...walk.chain, ...walk.also]) {
      if (!node.href) continue;
      evidence.push({ source: node.label, type: "Related", relevance: node.link || "Connected", href: node.href, passage: node.note });
    }
  }
  const related = [
    ...(curated?.next ?? []),
    ...(walk?.chain.slice(1).map((node) => node.label) ?? []),
    ...(walk?.also.map((node) => node.label) ?? []),
  ].filter((label, index, all) => label && all.indexOf(label) === index).slice(0, 6);
  const packet = blocks.filter(Boolean).join("\n\n");
  if (packet.trim().length < 40) return null;

  const language = spoken && spoken.toLowerCase() !== "english" ? `Write the explanation in ${spoken}. Keep verse text, names, and numbers unchanged.` : "Write in English.";
  const { depthStance } = await import("@/lib/depth");
  const system = `${domain === "bible"
    ? `You explain a Bible question from the retrieved King James text only. Quote each verse exactly as retrieved. Do not add a verse, a name, or an event that is not in the retrieval. If the retrieval does not answer the question, say it is not in the retrieved text. ${language} ${depthStance(level, q)}`
    : `You answer from the retrieved Vibe shelf, the relationship chain, and the pages only. Follow the chain in order. Do not add an entity that is not on it. Do not add a number, a date, a name, or a source that is not written below. If the retrieval is thin, say what it does not settle. ${language} ${depthStance(level, q)}`} ${strategySheet(q)}`;

  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        { role: "system", content: system },
        { role: "user", content: `Question: ${q.slice(0, 800)}\n\n${packet.slice(0, 7000)}` },
      ],
      { temperature: 0, maxTokens: 700 },
    );
    if ("error" in result) return null;
    const answer = result.text.trim();
    if (!answer) return null;
    const { stampBrain } = await import("@/lib/brain-stamp");
    const text = await stampBrain(answer, packet, { strict: false });
    const card: StudyCard = {
      question: q,
      sentence: answer.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 500) || answer.slice(0, 500),
      domain,
      confidence: "supported",
      steps: answer.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 8),
      evidence: evidence.filter((row, index, all) => all.findIndex((item) => item.href === row.href) === index).slice(0, 6),
      next: related,
      note: "RAG: the question was matched to a shelf, sources were retrieved, the answer was written from those sources, then checked.",
    };
    return { text, card };
  } catch {
    return null;
  }
}
