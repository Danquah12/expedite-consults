import { strategySheet } from "@/lib/noctis-hard";
import type { StudyCard } from "@/lib/knowledge-types";

export function needsCurrent(question: string) {
  const q = question.trim();
  if (q.length < 10) return false;
  if (/\bwho was\b|\bformer\b|\bpreviously\b|\bin 19\d\d\b|\bin 20[0-1]\d\b/i.test(q) && !/\b(current|today|now|incumbent)\b/i.test(q)) return false;
  if (/\b(president|prime minister|premier|chancellor|pope|governor|mayor)\b/i.test(q) && /\b(who(?:'s| is)|current|today|now|latest|in office)\b/i.test(q)) return true;
  if (/\b(price of|stock price|exchange rate|how much does .{2,40} cost)\b/i.test(q)) return true;
  if (/\b(latest|today'?s|this week'?s|breaking)\b/i.test(q) && /\b(news|cve|vulnerabilit|exploit|version|release|election|discovery|launch|patch)\b/i.test(q)) return true;
  if (/\b(who won|who is leading)\b/i.test(q)) return true;
  if (/\b(known exploited|threat landscape|vulnerabilities currently|exploited now)\b/i.test(q)) return true;
  if (/\b(currently|right now|this week)\b/i.test(q) && /\bvulnerabilit|\bexploit|\bcve\b|\bpatch\b/i.test(q)) return true;
  return false;
}

function topic(question: string) {
  return question.replace(/^(Bible|Cyber|Science|Engineering) copilot,\s*[^:]+:\s*/i, "").replace(/\s+/g, " ").trim().slice(0, 180);
}

async function newsNotes(query: string) {
  try {
    const res = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, {
      headers: { Accept: "application/rss+xml", "User-Agent": "Noctis/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const xml = await res.text();
    const rows: string[] = [];
    for (const item of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
      const title = (item[1].match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
      const date = (item[1].match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim();
      const publisher = item[1].match(/<source\b([^>]*)>([\s\S]*?)<\/source>/i);
      const href = publisher?.[1]?.match(/url="([^"]+)"/i)?.[1] || "";
      const name = (publisher?.[2] || "").replace(/<[^>]+>/g, "").trim();
      if (title) rows.push(`- ${title}${name ? ` — ${name}` : ""}${date ? ` (${date})` : ""}${/^https?:\/\//i.test(href) ? ` (${href})` : ""}`);
      if (rows.length >= 5) break;
    }
    return rows.length ? `Google News:\n${rows.join("\n")}` : "";
  } catch {
    return "";
  }
}

async function officeNotes(query: string) {
  const hit = query.match(/\b(president|prime minister|premier)s?\s+of\s+(?:the\s+)?([A-Za-z][A-Za-z .'-]{1,40})/i);
  if (!hit) return "";
  const role = /prime minister|premier/i.test(hit[1] || "") ? "prime ministers" : "presidents";
  const place = (hit[2] || "").replace(/\s+(who|what|and)\b.*$/i, "").trim();
  if (!place) return "";
  const title = `List of ${role} of ${place}`;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&redirects=1&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exchars=1400&format=json`,
      { headers: { "User-Agent": "Noctis/1.0" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return "";
    const data = (await res.json()) as { query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; missing?: string }> } };
    const page = Object.values(data.query?.pages ?? {}).find((row) => row.extract && !row.missing);
    if (!page?.extract) return "";
    return `Wikipedia — ${page.title}${page.fullurl ? ` (${page.fullurl})` : ""}: ${page.extract.replace(/\s+/g, " ").trim().slice(0, 1400)}`;
  } catch {
    return "";
  }
}

async function kevNotes(query: string) {
  if (!/vulnerabilit|exploited|kev|threat landscape/i.test(query)) return "";
  try {
    const res = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
      headers: { Accept: "application/json", "User-Agent": "Noctis/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { vulnerabilities?: { cveID?: string; vulnerabilityName?: string; shortDescription?: string; dateAdded?: string }[] };
    const rows = [...(data.vulnerabilities ?? [])]
      .filter((row) => row.cveID && row.shortDescription)
      .sort((a, b) => (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""))
      .slice(0, 4);
    if (!rows.length) return "";
    return `CISA Known Exploited Vulnerabilities:\n${rows.map((row) => `- ${row.cveID} (${row.dateAdded || "undated"}): ${row.vulnerabilityName || ""} ${row.shortDescription}`).join("\n")}`;
  } catch {
    return "";
  }
}

export async function currentAnswer(question: string, spoken = "English"): Promise<{ text: string; card: StudyCard } | null> {
  if (!needsCurrent(question)) return null;
  const q = topic(question);
  const today = new Date().toISOString().slice(0, 10);
  const [news, office, kev] = await Promise.all([newsNotes(q), officeNotes(q), kevNotes(q)]);
  const packet = [`Today's date is ${today}.`, news, office, kev].filter(Boolean).join("\n\n");
  const thin = packet.replace(`Today's date is ${today}.`, "").trim().length < 40;
  const honest = `As of ${today}, the sources opened for this question did not return the fact. It was not taken from memory.`;
  if (thin) {
    const text = thin ? honest : `${honest}\n\n${packet}`;
    return {
      text,
      card: {
        question: q,
        sentence: honest,
        domain: "current",
        confidence: "insufficient",
        steps: ["The question needs a current source.", "The sources opened today did not contain the fact.", "Nothing was filled from memory."],
        evidence: [],
        next: [],
        note: `Current check. Retrieved ${today}.`,
      },
    };
  }
  const language = spoken.toLowerCase() === "english" ? "Write in English." : `Write in ${spoken}. Keep names, dates, and numbers unchanged.`;
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        { role: "system", content: `This question needs current information. Answer only from the notes. Start with "As of ${today}". Name the source. If the notes do not contain the fact, say today's sources did not return it. Do not use an older name, price, version, or event from memory. ${language} ${strategySheet(q)}` },
        { role: "user", content: `Question: ${q}\n\n${packet.slice(0, 7000)}` },
      ],
      { temperature: 0, maxTokens: 500 },
    );
    if ("error" in result) return { text: honest, card: { question: q, sentence: honest, domain: "current", confidence: "insufficient", steps: [honest], evidence: [], next: [], note: `Current check. Retrieved ${today}.` } };
    const answer = result.text.trim() || honest;
    const { stampBrain } = await import("@/lib/brain-stamp");
    const text = await stampBrain(answer, packet, { strict: false });
    return {
      text,
      card: {
        question: q,
        sentence: answer.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 400) || answer.slice(0, 400),
        domain: "current",
        confidence: "supported",
        steps: answer.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 6),
        evidence: [],
        next: [],
        note: `Current check. Searched today's sources on ${today}, then checked the draft against those notes.`,
      },
    };
  } catch {
    return { text: honest, card: { question: q, sentence: honest, domain: "current", confidence: "insufficient", steps: [honest], evidence: [], next: [], note: `Current check. Retrieved ${today}.` } };
  }
}
