import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import kjvRaw from "../../public/library/kjv.json?raw";
import type { Evidence, StudyCard } from "@/lib/knowledge-types";

export type { Evidence, StudyCard };

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
  "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const PEOPLE = ["Adam", "Eve", "Noah", "Abraham", "Moses", "David", "Solomon", "Elijah", "Daniel", "Mary", "Jesus", "Peter", "Paul"];
const PLACES = ["Egypt", "Jerusalem", "Babylon", "Nazareth", "Galilee", "Jordan", "Bethlehem", "Rome"];

const bundledBible = import.meta.glob("/public/library/kjv.json", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

let library: { verses: number; rows: Verse[] } | null = null;

const STOP = new Set(["who", "is", "the", "what", "does", "did", "bible", "say", "about", "teach", "book", "how", "why", "are", "was", "were", "from", "with", "that", "this", "and", "for"]);

type Verse = { name: string; testament: string; chapter: number; verse: number; body: string };

async function loadLibrary() {
  if (library) return library;
  let raw = kjvRaw || Object.values(bundledBible)[0] || "";
  if (!raw) {
    for (const file of [
      path.join(process.cwd(), "public/library/kjv.json"),
      path.join(process.cwd(), "library/kjv.json"),
      "/workspace/public/library/kjv.json",
    ]) {
      try {
        raw = await readFile(file, "utf8");
        break;
      } catch {
        raw = "";
      }
    }
  }
  if (!raw) throw new Error("King James file was not found on the server.");
  const books = JSON.parse(raw) as { chapters: string[][] }[];
  const rows: Verse[] = [];
  for (let i = 0; i < BOOKS.length; i++) {
    const name = BOOKS[i]!;
    const testament = i < 39 ? "Old Testament" : "New Testament";
    const chapters = books[i]?.chapters ?? [];
    chapters.forEach((verses, c) => {
      verses.forEach((body, v) => {
        rows.push({ name, testament, chapter: c + 1, verse: v + 1, body });
      });
    });
  }
  library = { verses: rows.length, rows };
  return library;
}

function serverSecret(name: string) {
  if (process.env[name]) return process.env[name]!;
  try {
    const text = readFileSync(path.join(process.cwd(), ".env"), "utf8");
    const line = text.split("\n").find((row) => row.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim() || "";
  } catch {
    return "";
  }
}

function searchQuery(q: string) {
  const words = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
  return words.join(" ") || q.slice(0, 80);
}

function wordsOf(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

function verseSpan(q: string) {
  const clean = q.replace(/[–—−]/g, "-");
  const match = clean.match(/\b(\d{1,3})\s*[:.]\s*(\d{1,3})(?:\s*-\s*(\d{1,3}))?/);
  if (!match) return null;
  const start = Number(match[2]);
  const end = match[3] ? Number(match[3]) : start;
  const lo = Math.min(start, end);
  return { chapter: Number(match[1]), start: lo, end: Math.min(Math.max(start, end), lo + 11) };
}

async function studyNote(reference: string, text: string) {
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        {
          role: "system",
          content:
            "Explain only the quoted King James verses in plain study language. Return JSON with steps, an array of 3 short sentences. Do not quote other verses. Do not add events that are not in the quote.",
        },
        { role: "user", content: `${reference}\n${text}` },
      ],
      { temperature: 0.2, maxTokens: 400, json: true },
    );
    if ("error" in result) return [];
    const parsed = JSON.parse(result.text || "{}") as { steps?: string[] };
    return (parsed.steps ?? []).filter((step) => typeof step === "string").slice(0, 3);
  } catch {
    return [];
  }
}

function shapeSermon(parsed: { title?: unknown; steps?: unknown }) {
  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  const lines: string[] = [];
  if (title && title.length < 80) lines.push(title);
  for (const step of steps) {
    if (!step || typeof step !== "object") continue;
    const heading = String((step as { heading?: unknown }).heading ?? "").trim();
    const body = String((step as { body?: unknown }).body ?? (step as { paragraph?: unknown }).paragraph ?? "").trim();
    if (body.length < 40) continue;
    lines.push(heading ? `${heading}\n\n${body}` : body);
  }
  return lines;
}

function linesFromModel(raw: string) {
  const clean = raw.replace(/```json|```/g, "").trim();
  const collect = (value: unknown, out: string[] = []): string[] => {
    if (typeof value === "string") {
      value
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter((part) => part.length > 80)
        .forEach((part) => out.push(part));
      return out;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => collect(item, out));
      return out;
    }
    if (value && typeof value === "object") Object.values(value).forEach((item) => collect(item, out));
    return out;
  };
  try {
    const parsed = JSON.parse(clean) as { title?: unknown; steps?: unknown };
    const shaped = shapeSermon(parsed);
    if (shaped.some((line) => line.length > 80)) return shaped;
    const loose = collect(parsed);
    if (loose.length) return loose;
  } catch {
    /* a cut-off reply can still hold finished paragraphs */
  }
  const bodies = [...clean.matchAll(/"body"\s*:\s*"((?:\\.|[^"\\])*)"/g)]
    .map((match) => {
      try {
        return JSON.parse(`"${match[1]}"`) as string;
      } catch {
        return "";
      }
    })
    .map((body) => body.trim())
    .filter((body) => body.length > 40);
  return bodies;
}

async function modelPages(system: string, user: string, tries = 2) {
  let best: string[] = [];
  const wordsOf = (lines: string[]) => lines.join(" ").split(/\s+/).filter(Boolean).length;
  const { modelChat } = await import("@/lib/video-mind.server");
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const result = await modelChat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { temperature: 0.3, maxTokens: 3500, json: true },
      );
      if ("error" in result) continue;
      const lines = linesFromModel(result.text || "");
      if (wordsOf(lines) > wordsOf(best)) best = lines;
      if (best.length) return best;
    } catch {
      /* the source brief still ships */
    }
  }
  return best;
}

async function writeSermon(reference: string, text: string, notes: string[]) {
  return modelPages(
    "Write an excellent sermon a congregation could hear, about two pages, from the quoted King James text only. Return JSON {\"title\":\"at most eight words\",\"steps\":[{\"heading\":\"Opening\",\"body\":\"\"},{\"heading\":\"The Text\",\"body\":\"\"},{\"heading\":\"What the Words Mean\",\"body\":\"\"},{\"heading\":\"The Warning\",\"body\":\"\"},{\"heading\":\"The Comfort\",\"body\":\"\"},{\"heading\":\"This Week\",\"body\":\"\"},{\"heading\":\"Prayer\",\"body\":\"\"}]}. Each body is at least 120 words. Spoken English. No lists. Do not quote other verses. Do not invent names or events.",
    `${reference}\n${text}\nNotes:\n${notes.join(" ")}`,
  );
}

async function writePaper(subject: string, sourceText: string) {
  return modelPages(
    "Write a clear two-page white paper from the source text only. Return JSON {\"title\":\"at most eight words\",\"steps\":[{\"heading\":\"Abstract\",\"body\":\"\"},{\"heading\":\"The Question\",\"body\":\"\"},{\"heading\":\"What the Source Says\",\"body\":\"\"},{\"heading\":\"Why It Matters\",\"body\":\"\"},{\"heading\":\"Limits of the Evidence\",\"body\":\"\"},{\"heading\":\"What to Do Next\",\"body\":\"\"}]}. Each body is at least 80 words. Plain professional English. No lists. When you use a fact, name the source title it came from. Do not invent authors, papers, statistics, dates, or URLs that are not in the source.",
    `Subject: ${subject}\nSources:\n${sourceText.slice(0, 3500)}`,
    1,
  );
}

function noteFromCard(topic: string, evidence: Evidence[], lines: string[]) {
  const points = lines.map((line) => line.replace(/\*\*/g, "").replace(/^\d+\.\s*/, "").trim()).filter((line) => line.length > 20).slice(0, 4);
  const source = evidence[0]?.source || "the retrieved page";
  const line = evidence[0]?.passage || points[0] || topic;
  return [
    `Study note: ${topic}`,
    `In one line\n\n${line}`,
    `Key points\n\n${points.join(" ") || "The retrieved page did not add more points."}`,
    `Check\n\nWhat does ${source} say about this? The answer is the line above.`,
    `Remember\n\n${source} is the source. A fact that page did not state is not part of this note.`,
  ];
}

function paperFromSources(topic: string, evidence: Evidence[]) {
  const short = topic.replace(/\s+/g, " ").trim().split(" ").slice(0, 8).join(" ") || "White paper";
  const passages = evidence.map((row) => row.passage).filter((line) => line && line.length > 40);
  const text = passages.join(" ");
  const sentences = text.split(/(?<=\.)\s+/).filter((line) => line.length > 30);
  const take = (count: number, fallback: string) => {
    const slice = sentences.splice(0, count);
    return slice.join(" ") || fallback;
  };
  const named = evidence.map((row) => row.source).filter(Boolean).join(", ") || "the question";
  return [
    short,
    `Abstract\n\n${take(2, `This brief is about ${topic}. It uses only the pages that were retrieved.`)}`,
    `The Question\n\n${topic}`,
    `What the Source Says\n\n${take(3, `${named} was retrieved for this subject. The page did not supply a longer passage.`)}`,
    `Why It Matters\n\n${take(2, "The retrieved pages are the evidence for this brief. They are not a new finding.")}`,
    "Limits of the Evidence\n\nThese pages are summaries. They do not establish a new result, a statistic, or a paper that was not named in the source.",
    "What to Do Next\n\nOpen the referenced pages and read them before treating this brief as settled.",
  ];
}

function searchVerses(rows: Verse[], q: string, book: string | null, chapter: number | null, verseNo: number | null) {
  if (book && chapter && verseNo) {
    return rows.filter((row) => row.name === book && row.chapter === chapter && row.verse === verseNo);
  }
  const words = wordsOf(q);
  if (!words.length) return [];
  const ranked: { score: number; row: Verse }[] = [];
  for (const row of rows) {
    if (book && row.name !== book) continue;
    if (chapter && row.chapter !== chapter) continue;
    const hay = row.body.toLowerCase();
    if (!words.every((word) => hay.includes(word))) continue;
    let score = words.length * 2;
    if (/call his name jesus/.test(hay)) score += 8;
    if (hay.includes("jesus christ")) score += 4;
    if (hay.includes("son of god")) score += 3;
    if (row.testament === "New Testament") score += 1;
    ranked.push({ score, row });
  }
  ranked.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: Verse[] = [];
  for (const item of ranked) {
    const key = `${item.row.name}:${item.row.chapter}`;
    if (seen.has(key) && out.length > 2) continue;
    seen.add(key);
    out.push(item.row);
    if (out.length >= 5) break;
  }
  return out;
}

async function saveCard(card: StudyCard) {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const id = `kn-${Date.now().toString(36)}`;
    await sql`insert into study_object (id, question, summary, domain, confidence, evidence) values (${id}, ${card.question}, ${card.sentence}, ${card.domain}, ${card.confidence}, ${JSON.stringify(card.evidence)}::jsonb)`;
  } catch {
    /* the answer still stands if the desk table is not ready */
  }
}

function bookWanted(q: string) {
  const n = ` ${q.toLowerCase()} `;
  const bible = /\b(bible|scripture|verse|kjv|testament|gospel|epistle|psalm)\b/i.test(q) || /\bbook of\b/i.test(q);
  const common = new Set(["numbers", "job", "mark", "acts", "kings", "judges"]);
  return [...BOOKS].sort((a, b) => b.length - a.length).find((name) => {
    const word = name.toLowerCase();
    const hit = new RegExp(`[^a-z0-9]${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^a-z0-9]`, "i").test(n);
    if (!hit) return false;
    if (!common.has(word)) return true;
    if (bible) return true;
    return new RegExp(`\\b${word}\\s+(?:chapter\\s+)?\\d{1,3}\\b`, "i").test(q);
  }) ?? null;
}

function aboutComputers(q: string) {
  return /cve|nvd|github|exploit|cwe|\bcode\b|kubernetes|cyber|malware|vulnerabilit|oauth|\bjwt\b|\bapi\b|python|linux|firewall|programming|software|computer/i.test(q);
}

function links(q: string) {
  const query = encodeURIComponent(q.slice(0, 180));
  if (!aboutComputers(q)) {
    return [
      {
        source: "Open web",
        type: "Search",
        relevance: "Lectures and articles on this subject",
        href: `https://www.google.com/search?q=${encodeURIComponent(`${q.slice(0, 140)} explained`)}`,
        passage: "Search for more on this subject. This is not a computer or security source.",
      },
    ] satisfies Evidence[];
  }
  return [
    { source: "GitHub", type: "Code", relevance: "Search, not a stored copy", href: `https://github.com/search?q=${query}&type=repositories`, passage: "" },
    { source: "NVD", type: "Security", relevance: "Official CVE search", href: `https://nvd.nist.gov/vuln/search/results?query=${query}`, passage: "" },
    { source: "ExploitDB", type: "Security", relevance: "Index only. No exploit stored here.", href: `https://www.exploit-db.com/search?q=${query}`, passage: "" },
    { source: "CWE", type: "Security", relevance: "Weakness catalog", href: `https://cwe.mitre.org/data/definitions/`, passage: "" },
  ] satisfies Evidence[];
}

async function cisaLandscape(q: string): Promise<StudyCard | null> {
  try {
    const res = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", {
      headers: { Accept: "application/json", "User-Agent": "NoctisStudy" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      count?: number;
      vulnerabilities?: { cveID?: string; vulnerabilityName?: string; shortDescription?: string; dateAdded?: string }[];
    };
    const rows = [...(data.vulnerabilities ?? [])]
      .filter((row) => row.cveID && row.shortDescription)
      .sort((a, b) => (b.dateAdded ?? "").localeCompare(a.dateAdded ?? ""))
      .slice(0, 4);
    if (!rows.length) return null;
    const first = rows[0]!;
    return {
      question: q,
      sentence: `${first.cveID}: ${first.shortDescription}`,
      domain: "cyber",
      confidence: "verified",
      steps: [
        "CISA lists vulnerabilities known to be exploited.",
        `${data.count ?? rows.length} entries are in the catalog.`,
        "The newest additions are shown here. Open each CVE on NVD.",
      ],
      evidence: rows.map((row) => ({
        source: `${row.cveID} · ${row.dateAdded ?? ""}`,
        type: "CISA KEV",
        relevance: row.vulnerabilityName || "Known exploited vulnerability",
        href: `https://nvd.nist.gov/vuln/detail/${row.cveID}`,
        passage: row.shortDescription || "",
      })),
      next: ["NVD", "CISA KEV"],
      note: "Verified from the CISA Known Exploited Vulnerabilities catalog. Exploit code is not stored here.",
    };
  } catch {
    return null;
  }
}

async function nvdHit(q: string): Promise<Evidence | null> {
  const id = q.match(/CVE-\d{4}-\d+/i)?.[0]?.toUpperCase();
  const key = serverSecret("NVD_API_KEY");
  if (!id || !key) return null;
  try {
    const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${id}`, {
      headers: { apiKey: key },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      vulnerabilities?: { cve?: { id?: string; descriptions?: { lang: string; value: string }[] } }[];
    };
    const cve = data.vulnerabilities?.[0]?.cve;
    const text = cve?.descriptions?.find((row) => row.lang === "en")?.value;
    if (!cve?.id || !text) return null;
    return {
      source: cve.id,
      type: "NVD",
      relevance: "Official record",
      href: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      passage: text,
    };
  } catch {
    return null;
  }
}

async function githubHits(q: string): Promise<Evidence[]> {
  if (!/\bjwt\b|github|\bcode\b|\bauth\b|\bpython\b|kubernetes|\bapi\b|oauth/i.test(q)) return [];
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "NoctisStudy" };
  const token = serverSecret("GITHUB_TOKEN");
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery(q))}&per_page=3&sort=stars`, {
      headers,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: { full_name: string; html_url: string; description: string | null; stargazers_count: number }[] };
    const wanted = searchQuery(q).split(" ").filter((word) => word.length > 3);
    return (data.items ?? [])
      .filter((item) => {
        const hay = `${item.full_name} ${item.description ?? ""}`.toLowerCase();
        return wanted.length === 0 || wanted.some((word) => hay.includes(word));
      })
      .map((item) => ({
      source: item.full_name,
      type: "GitHub",
      relevance: `${item.stargazers_count} stars`,
      href: item.html_url,
      passage: item.description && item.description.length < 180 ? item.description : "Repository returned by GitHub search.",
    }));
  } catch {
    return [];
  }
}

async function modelCard(q: string): Promise<StudyCard | null> {
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        {
          role: "system",
          content:
            "You write a short study card. Return JSON with sentence (one clear explanation), steps (3 short strings), and next (up to 3 related topics). Do not invent URLs. If you are unsure, say so in the sentence.",
        },
        { role: "user", content: q },
      ],
      { temperature: 0.2, maxTokens: 700, json: true },
    );
    if ("error" in result) return null;
    const parsed = JSON.parse(result.text || "{}") as { sentence?: string; steps?: string[]; next?: string[] };
    if (!parsed.sentence) return null;
    return {
      question: q,
      sentence: parsed.sentence,
      domain: "research",
      confidence: "supported",
      steps: (parsed.steps ?? []).slice(0, 4),
      evidence: [],
      next: (parsed.next ?? []).slice(0, 3),
      note: "Written by the model. It was not checked against the stored library. Verify it before you rely on it.",
    };
  } catch {
    return null;
  }
}

function topicTerms(q: string) {
  const cleaned = q.replace(/^research this as a [^.]+\.\s*/i, "");
  const skip = /^(research|researcher|mathematician|generate|verify|should|before|rather|evidence|claim|claims|system|systems|using|about|would|could|their|there|which|when|where|than|into|from|this|that|with|have|been|only|also|such|each|most|more|some|what|does|make|show|says|stated|supports|separated|shows|result|optimal|merely|better|sample|machine|picture|checked|illustrated|meaningful|falsify|journey|today|story|matter|study|people|thing|things|something|without|relying|known|find|while|avoiding|explain|explained|explaining|detail|details|detailed|define|definition|describe|meaning|overview|summary|summarize|please|tell|give|teach|lesson)$/;
  const words = searchQuery(cleaned).split(" ").filter((word) => word.length >= 2 && !skip.test(word));
  const terms: string[] = [];
  if (words.length >= 2 && words.length <= 4) terms.push(words.join(" "));
  for (let i = 0; i < words.length - 1; i += 1) terms.push(`${words[i]} ${words[i + 1]}`);
  for (const word of words) if (word.length >= 2) terms.push(word);
  return [...new Set(terms)].slice(0, 5);
}

async function wikiLookup(term: string, question: string): Promise<StudyCard | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3&prop=extracts|info&inprop=url&exintro=1&explaintext=1&format=json`,
      { headers: { "User-Agent": "NoctisStudy" }, signal: AbortSignal.timeout(6000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { title?: string; extract?: string; fullurl?: string; index?: number }> };
    };
    const pages = Object.values(data.query?.pages ?? {})
      .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
      .filter((p) => p.title && p.extract);
    const termWords = term.toLowerCase().split(" ").filter((word) => word.length >= 2);
    const page = pages.find((p) => {
      const hay = `${p.title || ""} ${p.extract || ""}`;
      return !termWords.length || termWords.some((word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(hay));
    });
    if (!page || !page.extract) return null;
    const title = page.title || term;
    return {
      question,
      sentence: page.extract,
      domain: "science",
      confidence: "supported",
      steps: ["Read the source page.", "This is an encyclopedia summary.", "Check the references on that page."],
      evidence: [{
        source: title,
        type: "Wikipedia",
        relevance: "Encyclopedia summary",
        href: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        passage: page.extract,
      }],
      next: [],
      note: "Summary from Wikipedia. The copilot did not write it.",
    };
  } catch {
    return null;
  }
}

async function wikiHits(term: string): Promise<Evidence[]> {
  try {
    const found = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=3&namespace=0&format=json`,
      { headers: { "User-Agent": "NoctisStudy" }, signal: AbortSignal.timeout(6000) },
    );
    const list = (await found.json()) as [string, string[]];
    const titles = list[1] ?? [];
    const termWords = term.toLowerCase().split(" ").filter((word) => word.length > 3);
    const out: Evidence[] = [];
    for (const title of titles) {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`, {
        headers: { Accept: "application/json", "User-Agent": "NoctisStudy" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const page = (await res.json()) as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
      if (!page.extract) continue;
      const titleL = (page.title || title).toLowerCase();
      if (termWords.length && !termWords.some((word) => titleL.includes(word))) continue;
      out.push({
        source: page.title || title,
        type: "Wikipedia",
        relevance: "Retrieved page",
        href: page.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        passage: page.extract,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function sourcesForPaper(topic: string) {
  const terms = topicTerms(topic);
  const found: Evidence[] = [];
  const seen = new Set<string>();
  for (const term of terms.length ? terms : [topic.slice(0, 80)]) {
    const rows = await wikiHits(term);
    for (const row of rows) {
      if (seen.has(row.href)) continue;
      seen.add(row.href);
      found.push(row);
      if (found.length >= 3) return found;
    }
    if (found.length) return found;
  }
  return found;
}

async function wikiCard(q: string): Promise<StudyCard | null> {
  const terms = topicTerms(q);
  for (const term of terms) {
    const card = await wikiLookup(term, q);
    if (card) return card;
  }
  return null;
}

function chapterOf(question: string, book: string) {
  const at = question.toLowerCase().indexOf(book.toLowerCase());
  if (at < 0) return null;
  const hit = question.slice(at + book.length, at + book.length + 24).match(/^\s*(?:chapter\s+)?(\d{1,3})\b/i);
  const n = hit ? Number(hit[1]) : 0;
  return n > 0 && n < 200 ? n : null;
}

export async function bibleNotes(question: string) {
  try {
    const lib = await loadLibrary();
    const book = bookWanted(question);
    const chapter = book ? chapterOf(question, book) : null;
    const rows = chapter
      ? lib.rows.filter((row) => row.name === book && row.chapter === chapter).slice(0, 8)
      : searchVerses(lib.rows, question, book, null, null).slice(0, 5);
    if (!rows.length) return null;
    const evidence: Evidence[] = rows.map((row) => ({
      source: `${row.name} ${row.chapter}:${row.verse}`,
      type: row.testament,
      relevance: "Exact stored verse",
      href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${row.name} ${row.chapter}:${row.verse}`)}&version=KJV`,
      passage: row.body,
    }));
    const notes = rows.map((row) => `${row.name} ${row.chapter}:${row.verse} ${row.body}`).join("\n");
    return { notes, evidence };
  } catch {
    return null;
  }
}

export async function bibleStudyCard(question: string): Promise<StudyCard | null> {
  if (!/\b(explain|study)\b/i.test(question) || !bookWanted(question) || /this lesson|do not turn it into a bible/i.test(question)) return null;
  const found = await bibleNotes(question);
  if (!found) {
    return {
      question,
      sentence: "That passage is not in the stored King James text.",
      domain: "bible",
      confidence: "insufficient",
      steps: [
        "Context: not attached to the stored text.",
        "Passage: not stored.",
        "Explanation: not added.",
        "Themes: none named, because the verses were not stored.",
        "Cross references: none retrieved.",
        "Historical background: the stored text has no history attached.",
        "Questions: none. A question was not invented.",
        "Application: not in the stored text.",
        "Related lessons: none retrieved.",
      ],
      evidence: [],
      next: [],
      note: "Bible study. Only stored verses are used.",
    };
  }
  const verses = found.notes.split("\n").filter(Boolean);
  return {
    question,
    sentence: verses[0] || "Stored verse",
    domain: "bible",
    confidence: "verified",
    steps: [
      `Passage: ${verses.join(" ")}`,
      "Explanation: the words above are the passage. An explanation that is not in those verses is not added.",
      "Themes: only a word that appears in the passage. No theme was added beside it.",
      "Cross references: none. No other verse was retrieved with this passage.",
      "Historical background: the stored text has no history attached.",
      "Questions: what do these stored verses say? The answer is the passage itself.",
      "Application: not written in the stored verses, so none is added.",
      "Related lessons: open the same book and chapter when you want the next stored verses.",
    ],
    evidence: found.evidence,
    next: [],
    note: "Bible study. Context, passage, and questions use the stored verses. History and application were not invented.",
  };
}

export async function askStudy(question: string, teach = false): Promise<StudyCard> {
  const card = await buildStudy(question, teach);
  const { hardRows, attachHard } = await import("@/lib/noctis-hard");
  const q = card.question || question;
  if (!hardRows(q).length || card.steps.some((step) => step.includes("Independent check"))) return card;
  const body = [card.sentence, ...card.steps].join("\n");
  const extra = attachHard(q, body).slice(body.length).trim();
  return extra ? { ...card, steps: [...card.steps, extra] } : card;
}

async function buildStudy(question: string, teach = false): Promise<StudyCard> {
  const q = question.trim().slice(0, 1600).replace(/^research this as a [^.]+\.\s*/i, "").replace(/^lesson action\.\s*/i, "");
  const onThis = /this lesson|this film|hall lesson|use only these facts|do not turn it into a bible/i.test(q);
  if (onThis) {
    const take = (label: string) => q.match(new RegExp(`^${label}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";
    const title = take("Title") || "This lesson";
    const kept = [take("Summary"), take("Insight"), take("Why it matters")].filter((line) => line && !/not stored/i.test(line));
    const lines = kept.filter((line, index) => kept.findIndex((other) => other.toLowerCase() === line.toLowerCase()) === index);
    const careers = take("Careers");
    const certs = take("Certifications");
    const remember = lines[lines.length - 1] || title;
    let sentence = lines[0] || title;
    let steps = lines.slice(0, 4);
    if (/quiz|three questions/i.test(q)) {
      sentence = `Quiz on ${title}`;
      steps = [
        `1. What is this about? ${title}`,
        `2. What should you remember? ${remember}`,
        `3. Which career is named? ${careers && careers !== "none" ? careers : "None stored on this lesson."}`,
      ];
    } else if (/study notes|create notes/i.test(q)) {
      sentence = `Notes: ${title}`;
      steps = (lines.length ? lines : [title]).map((line) => `• ${line}`);
    } else if (/remember/i.test(q)) {
      sentence = `Study ${title}`;
      steps = [`Remember: ${remember}`];
    } else if (/careers listed/i.test(q)) {
      sentence = careers && careers !== "none" ? `Careers for ${title}: ${careers}` : `No career is stored for ${title}.`;
      steps = [];
    } else if (/certifications listed/i.test(q)) {
      sentence = certs && certs !== "none" ? `Certifications for ${title}: ${certs}` : `No certification is stored for ${title}.`;
      steps = [];
    }
    const card: StudyCard = {
      question: q,
      sentence,
      domain: "teacher",
      confidence: "supported",
      steps: steps.length ? steps : [title],
      evidence: [],
      next: [],
      note: `Only ${title}. No other shelf was opened.`,
    };
    await saveCard(card);
    return card;
  }
  if (/\b(?:30-minute lesson|create a lesson)\b/i.test(q)) {
    const { curatedCard } = await import("@/lib/knowledge-engine");
    const { teacherPack } = await import("@/lib/teacher-pack");
    const topic = q.replace(/.*\b(?:on|about)\s+/i, "").replace(/[.?!].*$/, "").trim();
    const card = curatedCard(topic || q);
    const text = teacherPack(topic || q, card ? { sentence: card.sentence, steps: card.steps, source: card.evidence[0]?.source || "" } : null);
    const draft: StudyCard = {
      question: q,
      sentence: text.split("\n")[0] || "Draft",
      domain: "teacher",
      confidence: card ? "supported" : "insufficient",
      steps: text.split("\n").filter(Boolean),
      evidence: card?.evidence ?? [],
      next: [],
      note: "Teacher draft. It is not published.",
    };
    await saveCard(draft);
    return draft;
  }
  if (/write a study note\b/i.test(q)) {
    const subject = q
      .replace(/^.*?write a study note(?:\s+on|\s+about|\s+from)?\s*/i, "")
      .replace(/\.\s*Use only[\s\S]*$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const topic = subject || q;
    const { curatedCard } = await import("@/lib/knowledge-engine");
    const { walkGraph } = await import("@/lib/knowledge-graph");
    const curated = curatedCard(topic);
    const evidence = await sourcesForPaper(topic);
    const walk = walkGraph(topic);
    const graph = walk
      ? [...walk.chain, ...walk.also].filter((node) => node.href).map((node) => ({
          source: node.label,
          type: "Related",
          relevance: node.link || "Connected",
          href: node.href || "",
          passage: node.note,
        }))
      : [];
    const kept = [...(curated?.evidence ?? []), ...evidence, ...graph].filter((row, index, all) => row.href && all.findIndex((item) => item.href === row.href) === index).slice(0, 6);
    const related = [
      ...(curated?.next ?? []),
      ...(walk?.chain.slice(1).map((node) => node.label) ?? []),
      ...(walk?.also.map((node) => node.label) ?? []),
    ].filter((label, index, all) => label && all.indexOf(label) === index).slice(0, 6);
    const sourceText = [topic, ...(curated?.steps ?? []), ...kept.map((row) => `${row.source}: ${row.passage}`)].join("\n");
    const written = await modelPages(
      "Write a study note a student can keep. Return JSON {\"title\":\"at most eight words\",\"steps\":[{\"heading\":\"In one line\",\"body\":\"\"},{\"heading\":\"Key points\",\"body\":\"\"},{\"heading\":\"Check\",\"body\":\"\"},{\"heading\":\"Remember\",\"body\":\"\"}]}. Key points is three short sentences. Check is one question and its answer. Use only the source. Do not invent a fact.",
      `Subject: ${topic}\nSources:\n${sourceText.slice(0, 3500)}`,
      1,
    );
    const steps = written.length ? written : noteFromCard(topic, kept, curated?.steps ?? []);
    if (kept.length) steps.push(`Sources\n\n${kept.map((row, index) => `${index + 1}. ${row.source}. ${row.type}. ${row.href}`).join("\n")}`);
    if (related.length) steps.push(`Related documents\n\n${related.join("\n")}`);
    const card: StudyCard = {
      question: q,
      sentence: steps[0] || `Study note: ${topic}`,
      domain: "research",
      confidence: kept.length ? "supported" : "insufficient",
      steps,
      evidence: kept,
      next: related,
      note: "Study note is written. It uses only the retrieved source.",
    };
    await saveCard(card);
    return card;
  }
  const passage = await bibleStudyCard(q);
  if (passage) {
    await saveCard(passage);
    return passage;
  }
  if (/^research this\b/i.test(q)) {
    const { researchReport } = await import("@/lib/video-mind.server");
    const report = await researchReport(q);
    const text = "text" in report ? report.text : "error" in report ? report.error : "No report.";
    const card: StudyCard = {
      question: q,
      sentence: text.split("\n").map((line) => line.trim()).filter(Boolean)[0]?.slice(0, 400) || "Research report",
      domain: "research",
      confidence: /nothing was retrieved/i.test(text) ? "insufficient" : "supported",
      steps: text.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 16),
      evidence: [],
      next: [],
      note: "Research report. Sources were searched, compared, and cited. A disagreement is named only when the notes conflict.",
    };
    await saveCard(card);
    return card;
  }
  const { needsCurrent, currentAnswer } = await import("@/lib/current.server");
  if (needsCurrent(q)) {
    const current = await currentAnswer(q).catch(() => null);
    if (current) {
      await saveCard(current.card);
      return current.card;
    }
  }
  const { runTutor } = await import("@/lib/study-copilot.server");
  const tutored = await runTutor(q).catch(() => null);
  if (tutored) {
    await saveCard(tutored.card);
    return tutored.card;
  }
  const paperAsk = /^write a (?:two[- ]page )?white paper\b/i.test(q);
  if (paperAsk) {
    const subject = q.replace(/^.*?white paper(?:\s+on|\s+about|\s+from)?\s*/i, "").replace(/\s+/g, " ").trim();
    const topic = subject && !/white paper/i.test(subject) ? subject : q;
    const evidence = await sourcesForPaper(topic);
    const sourceText = [topic, ...evidence.map((row) => `${row.source} (${row.href}): ${row.passage}`)]
      .filter((line) => line && !/not in the stored library|Nothing was guessed/i.test(line))
      .join("\n");
    const written = await writePaper(topic, sourceText || topic);
    const paper = written.length ? written : paperFromSources(topic, evidence);
    const cited = evidence.length
      ? `References\n\n${evidence.map((row, index) => `${index + 1}. ${row.source}. ${row.type}. ${row.href}`).join("\n")}`
      : "References\n\nNo retrieved page matched this subject. No source was invented.";
    const card: StudyCard = {
      question: q,
      sentence: evidence[0]?.passage || `A two-page white paper on ${topic}.`,
      domain: "research",
      confidence: "supported",
      steps: [...paper, cited],
      evidence,
      next: [],
      note: "This white paper is two pages written by Vibe from the retrieved sources. The references are those pages. It is not the source itself.",
    };
    await saveCard(card);
    return card;
  }
  const security = /cve|nvd|exploit|cwe|\battack\b|nist|vulnerabilit|threat|cisa|\bkev\b/i.test(q);

  const lookup = /CVE-\d{4}-\d+/i.test(q) || /where do i look up a cve|threat landscape|known exploited/i.test(q);
  if (security && lookup) {
    if (/threat|vulnerabilit|landscape|cisa|\bkev\b/i.test(q) && !/CVE-\d{4}-\d+/i.test(q)) {
      const landscape = await cisaLandscape(q);
      if (landscape) {
        await saveCard(landscape);
        return landscape;
      }
    }
    const live = await nvdHit(q);
    const code = await githubHits(q);
    const card: StudyCard = {
      question: q,
      sentence: live?.passage || "Look up a CVE on the National Vulnerability Database. The official page is the record.",
      domain: "cyber",
      confidence: live ? "verified" : "supported",
      steps: [
        "Open NVD and search the CVE id.",
        "Read the description and severity on that page.",
        "Exploit code is not stored here.",
      ],
      evidence: [live, ...code, ...links(q)].filter((row): row is Evidence => Boolean(row)).slice(0, 6),
      next: ["NVD", "CWE", "MITRE ATT&CK"],
      note: live ? "Verified from the NVD record." : "NVD is the place to look. A live record appears when the question includes a CVE id.",
    };
    await saveCard(card);
    return card;
  }

  if (/\bjwt\b|github|kubernetes|\bpython\b|oauth|\bapi\b/i.test(q)) {
    const code = await githubHits(q);
    const jwt = /jwt/i.test(q);
    if (jwt || code.length) {
      const spec: Evidence = {
        source: "RFC 7519",
        type: "Specification",
        relevance: "The JWT standard",
        href: "https://www.rfc-editor.org/rfc/rfc7519",
        passage: "JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties.",
      };
      const card: StudyCard = {
        question: q,
        sentence: jwt
          ? "A JWT carries claims in a signed header and payload. The receiver checks the signature before trusting those claims."
          : code[0]?.passage || "GitHub returned these repositories.",
        domain: "technology",
        confidence: "supported",
        steps: jwt
          ? ["Read RFC 7519.", "A token is header, payload, and signature.", "Reject the token if the signature or claims fail."]
          : ["Open the repository.", "Read the code there.", "A search hit is not a procedure."],
        evidence: jwt ? [spec, ...code] : code,
        next: ["GitHub"],
        note: jwt ? "The definition is the RFC 7519 abstract. Repositories are live GitHub search." : serverSecret("GITHUB_TOKEN") ? "Retrieved with the GitHub token." : "Retrieved from public GitHub search.",
      };
      await saveCard(card);
      return card;
    }
  }

  const { curatedCard } = await import("@/lib/knowledge-engine");
  const { runCopilot } = await import("@/lib/study-copilot.server");
  const copilot = await runCopilot(q).catch(() => null);
  if (copilot) {
    await saveCard(copilot.card);
    return copilot.card;
  }
  const { runRag } = await import("@/lib/rag.server");
  const rag = await runRag(q).catch(() => null);
  if (rag) {
    await saveCard(rag.card);
    return rag.card;
  }
  const curated = curatedCard(q);
  if (curated) {
    await saveCard(curated);
    return curated;
  }

  const bookName = bookWanted(q);
  const biblical = Boolean(bookName) || /\bbible\b/i.test(q);
  if (!biblical) {
    const wiki = await wikiCard(q);
    const explained = await modelCard(q);
    if (explained) {
      if (wiki?.evidence.length) explained.evidence = wiki.evidence;
      explained.note = wiki
        ? "Written by Noctis from the retrieved source. Check the page before you rely on it."
        : explained.note;
      await saveCard(explained);
      return explained;
    }
    if (wiki) {
      await saveCard(wiki);
      return wiki;
    }
  }

  let lib: Awaited<ReturnType<typeof loadLibrary>>;
  try {
    lib = await loadLibrary();
  } catch {
    const wiki = await wikiCard(q);
    if (wiki) {
      await saveCard(wiki);
      return wiki;
    }
    const explained = await modelCard(q);
    if (explained) {
      await saveCard(explained);
      return explained;
    }
    return {
      question: q,
      sentence: "This question is not in the stored library.",
      domain: "research",
      confidence: "insufficient",
      steps: ["No verse matched.", "No encyclopedia page matched.", "Nothing was guessed."],
      evidence: links(q),
      next: [],
      note: "Insufficient evidence.",
    };
  }
  const book = bookWanted(q);
  const ref = q.match(/\b(\d{1,3})\s*:\s*(\d{1,3})\b/);
  const chapter = book && ref ? Number(ref[1]) : null;
  const verseNo = book && ref ? Number(ref[2]) : null;
  const inBook = book ? lib.rows.filter((row) => row.name === book) : [];
  const span = book ? verseSpan(q) : null;
  if (book && span) {
    const picked = lib.rows.filter(
      (row) => row.name === book && row.chapter === span.chapter && row.verse >= span.start && row.verse <= span.end,
    );
    if (picked.length) {
      const label = span.start === span.end ? `${book} ${span.chapter}:${span.start}` : `${book} ${span.chapter}:${span.start}-${span.end}`;
      const quoted = picked.map((row) => `${row.verse} ${row.body}`).join(" ");
      const preaching = /sermon|preach|homily/i.test(q);
      const note = preaching ? [] : await studyNote(label, quoted);
      const sermon = preaching ? await writeSermon(label, quoted, note) : [];
      const card: StudyCard = {
        question: q,
        sentence: picked.length === 1 ? picked[0]!.body : quoted,
        domain: "bible",
        confidence: sermon.length ? "supported" : "verified",
        steps: sermon.length ? sermon : note.length ? note : preaching ? ["The sermon did not come back. Press Write a sermon again."] : [label, "Stored King James text."],
        evidence: picked.map((row) => ({
          source: `${row.name} ${row.chapter}:${row.verse}`,
          type: row.testament,
          relevance: "Exact stored verse",
          href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${row.name} ${row.chapter}:${row.verse}`)}&version=KJV`,
          passage: row.body,
        })),
        next: [],
        note: sermon.length
          ? `${label} is the stored King James text. The sermon is at least two pages, written by the model from that verse. It is not scripture.`
          : preaching
            ? `${label} is the stored King James text. The sermon was not returned. Press Write a sermon again.`
            : note.length
              ? `${label} is the stored King James text. The steps explain that quote. They are not extra scripture.`
              : `${label} is the stored King James text. Nothing was added.`,
      };
      await saveCard(card);
      return card;
    }
  }

  if (book && (teach || /about|structure|overview/i.test(q))) {
    const first = inBook.find((row) => row.chapter === 1 && row.verse === 1);
    const people = PEOPLE.filter((name) => inBook.some((row) => row.body.includes(name)));
    const places = PLACES.filter((name) => inBook.some((row) => row.body.includes(name)));
    const testament = BOOKS.indexOf(book) < 39 ? "Old Testament" : "New Testament";
    const chapters = inBook.reduce((max, row) => Math.max(max, row.chapter), 0);
    const card: StudyCard = {
      question: q,
      sentence: first?.body ?? `${book} is in the library.`,
      domain: "bible",
      confidence: "verified",
      steps: [
        `${book} · ${testament}`,
        `${chapters} chapters stored`,
        people.length ? `People named in the text: ${people.join(", ")}` : "No listed names found in this book.",
        places.length ? `Places named in the text: ${places.join(", ")}` : "No listed places found in this book.",
      ],
      evidence: first
        ? [{
            source: "King James Version",
            type: "Bible",
            relevance: "Opening verse, stored locally",
            href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(book + " 1")}&version=KJV`,
            passage: first.body,
          }]
        : [],
      next: BOOKS.filter((name) => name !== book).slice(BOOKS.indexOf(book) + 1, BOOKS.indexOf(book) + 4),
      note: "Verified from the stored King James text. Nothing was added.",
    };
    await saveCard(card);
    return card;
  }

  const verses = searchVerses(lib.rows, q, book, chapter, verseNo);
  if (verses.length) {
    const booksHit = [...new Set(verses.map((row) => row.name))];
    const card: StudyCard = {
      question: q,
      sentence: verses[0]!.body,
      domain: "bible",
      confidence: "verified",
      steps: booksHit.map((name) => name),
      evidence: verses.map((row) => ({
        source: `${row.name} ${row.chapter}:${row.verse}`,
        type: row.testament,
        relevance: "Exact stored verse",
        href: `https://www.biblegateway.com/passage/?search=${encodeURIComponent(`${row.name} ${row.chapter}:${row.verse}`)}&version=KJV`,
        passage: row.body,
      })),
      next: booksHit.slice(1),
      note: "Verified from the stored King James text. Nothing was added.",
    };
    await saveCard(card);
    return card;
  }

  const wiki = await wikiCard(q);
  if (wiki) {
    await saveCard(wiki);
    return wiki;
  }

  const explained = await modelCard(q);
  if (explained) {
    await saveCard(explained);
    return explained;
  }

  const card: StudyCard = {
    question: q,
    sentence: "This is not in the stored library.",
    domain: "research",
    confidence: "insufficient",
    steps: ["No verse matched.", "No official card matched.", "Nothing was guessed."],
    evidence: links(q),
    next: [],
    note: "Insufficient evidence. The links search outside the library. They are not an answer.",
  };
  await saveCard(card);
  return card;
}

export async function listStudies() {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    return await sql<{ id: string; question: string; summary: string; domain: string; confidence: string; created_at: string }>`
      select id, question, summary, domain, confidence, created_at from study_object order by created_at desc limit 12`;
  } catch {
    return [];
  }
}

export async function libraryCounts() {
  try {
    const lib = await loadLibrary();
    let studies = 0;
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<{ n: number }>`select count(*)::int as n from study_object`;
      studies = rows[0]?.n ?? 0;
    } catch {
      studies = 0;
    }
    return { verses: lib.verses, books: BOOKS.length, studies };
  } catch {
    return { verses: 0, books: BOOKS.length, studies: 0 };
  }
}
