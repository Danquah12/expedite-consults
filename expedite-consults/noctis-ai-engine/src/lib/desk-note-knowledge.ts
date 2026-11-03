/**
 * Desk Note knowledge base for Noctis.
 *
 * Desk Note (https://desk-note-lime.vercel.app/) is a separate app. This file is how Noctis
 * "knows" it. To teach Noctis more (repo READMEs, code summaries, rating updates), append
 * entries to DESK_NOTE_DOCS. Keep each entry factual and dated; Noctis answers only from these.
 */

export type DeskNoteDoc = {
  id: string;
  title: string;
  keywords: string[];
  text: string;
  source: string;
  asOf: string;
};

export const DESK_NOTE_URL = "https://desk-note-lime.vercel.app/";

export const DESK_NOTE_DOCS: DeskNoteDoc[] = [
  {
    id: "overview",
    title: "What Desk Note is",
    keywords: ["what", "desk note", "about", "overview", "purpose", "wording", "score", "verdict", "app"],
    text:
      "Desk Note is a 'wording desk'. Headlines and hearings are scored from the words, with the source named and the number kept separate from a verdict. " +
      "The score rates wording, not truth and not whether a person is right. Higher means fewer sweeping words and a named source. " +
      "Tagline: 'Hearing desk'. Live headlines stay current; five scripted briefings make up the hearing desk. Notes from the 'previous studio' are quoted, not adopted.",
    source: "desk-note-lime.vercel.app home page",
    asOf: "2026-10-24",
  },
  {
    id: "features",
    title: "Features and navigation",
    keywords: ["feature", "tab", "category", "region", "search", "notify", "push", "export", "copy", "check links", "sign in", "add a source", "note", "pwa", "install", "settings"],
    text:
      "Category tabs: All, Front page, Channels, Weather, Sports, Breaking News, Jobs, Midterms, Major news, Hearings, Add a source. " +
      "Region selector: United States, Africa, Europe, Asia, South America, Middle East, Oceania, Canada and Mexico, Central America and the Caribbean. " +
      "Search box: 'Search the desk' (hearing, speaker, statute, or a phrase). " +
      "'Notify this phone' enables push notifications; each new headline is its own breaking note. " +
      "Per hearing line: Export report, Copy, Check links, and a personal 'Your note' (a remark that does not change the score). " +
      "'Add a source' needs sign-in; an approved signed-in account can paste a transcript or fetch a public page. " +
      "It installs as a phone app (PWA manifest). Live feeds load in the browser after the page opens.",
    source: "desk-note-lime.vercel.app home page",
    asOf: "2026-10-24",
  },
  {
    id: "scoring",
    title: "How the hearing score works",
    keywords: ["score", "scoring", "points", "calculate", "formula", "55", "weighted", "average", "source", "higher", "lower", "sweeping"],
    text:
      "Each hearing line starts at 55 and only looks at the words. A line gains points when it names a source the desk knows (e.g. +22 for naming Article VI and 8 U.S. Code section 1357). " +
      "Sweeping words lower the score. Case notes do not change the number. " +
      "A briefing's overall score is a time-weighted average of its lines. Example, Sanctuary briefing: 63 = (77x25 + 59x40 + 59x40) / 105 seconds. " +
      "Naming a real source does not prove every later sentence in a speech.",
    source: "desk-note-lime.vercel.app hearing desk",
    asOf: "2026-10-24",
  },
  {
    id: "hearing-sanctuary",
    title: "Hearing briefing: Sanctuary (score 63)",
    keywords: ["sanctuary", "homan", "ice", "immigration", "nyc", "harboring", "removals", "arizona", "supremacy", "1357", "article vi"],
    text:
      "Briefing 'NYC sanctuary policies', speaker Tom Homan, described as a law-enforcement conference address, dated February 2026 by the old studio. Scripted lines, not a recording, and not proof the event happened as described. Hearing score 63. " +
      "Line 1 (00:00-00:25, score 77): federal immigration officers have constitutional supremacy under Article VI and authority under 8 U.S. Code 1357 to execute apprehensions anywhere in the U.S. " +
      "Line 2 (00:25-01:05, score 59): any mayor or council member refusing to notify ICE on releasing a foreign detainee would be charged personally with felony alien harboring. " +
      "Line 3 (01:05-01:45, score 59): nationwide interior removals up five hundred percent in thirty days without extra appropriations. " +
      "Sources shown: 8 U.S.C. 1357 (Office of the Law Revision Counsel); Arizona v. United States, 567 U.S. 387 (2012) - the Court said Arizona could not write its own immigration crimes, but it does not say a mayor commits a felony for not calling ICE; Supremacy Clause, U.S. Const. art. VI - federal law wins over conflicting state law, but does not by itself make a mayor a criminal. " +
      "The old studio's claim that Arizona v. United States gives federal supremacy regardless of local ordinances was quoted, not adopted.",
    source: "desk-note-lime.vercel.app hearing desk",
    asOf: "2026-10-24",
  },
  {
    id: "hearing-others",
    title: "Other hearing topics",
    keywords: ["ballots", "tariffs", "detention", "ukraine", "hearing", "briefing", "topics"],
    text:
      "The hearing desk has five scripted briefings with overall scores: Sanctuary 63, Ballots 40, Tariffs 39, Detention 44, Ukraine 42. " +
      "Only the Sanctuary briefing's lines and sources were read in detail by Noctis. For the other four, only the topic and score are known; do not invent their lines.",
    source: "desk-note-lime.vercel.app hearing desk",
    asOf: "2026-10-24",
  },
  {
    id: "jobs",
    title: "Jobs: September 2026 employment report",
    keywords: ["jobs", "employment", "unemployment", "payroll", "bls", "bureau of labor", "wages", "earnings", "barr", "federal reserve", "health care", "construction", "manufacturing", "september"],
    text:
      "September 2026 report, released October 2. Employers added 29,000 jobs; unemployment was 4.2 percent (4.1 in August). BLS said both changed little. Seasonally adjusted; August and September payroll changes still preliminary. " +
      "Payroll changes: July -10,000; August +133,000 (preliminary); September +29,000 (preliminary). Three-month average 51,000; prior-12-month average 45,000. " +
      "Private employers +46,000; government -17,000. Health care +17,000 (vs 33,000 prior-year average); construction +11,000; manufacturing +9,000. " +
      "Average hourly earnings $37.81, up 5 cents on the month and 3.0 percent over the year. Labor force participation 61.8 percent. " +
      "On September 29, before the release, Governor Barr said job creation averaged around 80,000 a month in 2026 and unemployment was 4.1 percent; Desk Note labels that the Board's comment, not the September count. The Federal Reserve Board does not run this survey.",
    source: "Employment Situation, September 2026 (BLS), as shown on Desk Note",
    asOf: "2026-10-02",
  },
  {
    id: "midterms",
    title: "Midterms: ratings and power ranking",
    keywords: ["midterm", "midterms", "election", "house", "senate", "cook", "rating", "north carolina", "new hampshire", "kansas", "michigan", "maine", "democrats", "republicans", "majority", "toss", "lean", "likely", "winner", "loser", "predict", "forecast", "flip", "seats"],
    text:
      "Desk Note's Midterms section quotes Cook Political Report ratings; a rating is not a vote and Election Day is still ahead. " +
      "U.S. House: Cook says the Republican majority is on track to flip. Democrats hold 215 seats and need a net of 3 for 218. Published range is a Democratic gain of 5 to 15 (220 to 230 seats). As of Sept 25, Democrats were favored in 208 races rated Solid/Likely/Lean and Republicans in 205; toss-ups unsettled. " +
      "Senate (Cook, Oct 6 update): North Carolina moved Lean Democrat to Likely Democrat. New Hampshire moved Toss Up to Lean Democrat. Kansas moved Lean Republican to Toss Up. " +
      "Senate majority: Democrats need a net of 4 seats; Cook's range is a gain of 2 to 6. A Republican pickup in Michigan and hold in Maine could keep the gain under 4; those are named paths, not ratings. " +
      "Desk Note's 'Paths' graph: Path 1 House majority changes hands (cost 2), Path 2 Republicans keep the Senate (cost 6), Path 3 Democrats clear a Senate majority (cost 7; NC, NH, KS links do not add up to a net of 4). Cost means how settled the public rating is, not network security. " +
      "Projected winners are only forecasts. Toss-up and unrated races have no projected winner.",
    source: "Cook Political Report (Oct 6, 2026 Senate; Sept 25 House count), as shown on Desk Note",
    asOf: "2026-10-06",
  },
  {
    id: "tech",
    title: "Desk Note technical details",
    keywords: ["tech", "stack", "built", "framework", "react", "tanstack", "tailwind", "vercel", "grok", "repository", "repo", "code", "deploy", "url", "link", "domain"],
    text:
      "Public URL: https://desk-note-lime.vercel.app/ (Vercel). Built with React, TanStack Router with server-side rendering, and Tailwind, generated with Grok App Builder. " +
      "Fonts: Newsreader and Source Sans 3. The Desk Note source repository is not stored in this Noctis workspace; only what is visible on the live page is known. " +
      "A standalone Midterm forecast table component exists in the expedite-consults workspace under desk-note-midterms/MidtermForecastTable.tsx.",
    source: "desk-note-lime.vercel.app page source",
    asOf: "2026-10-24",
  },
];

const STOP = new Set(["the", "a", "an", "is", "are", "of", "to", "in", "on", "and", "or", "for", "it", "this", "that", "what", "how", "does", "do", "me", "about", "tell", "with", "was", "were"]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Pick the most relevant docs for a question. Falls back to overview + features. */
export function retrieveDeskNoteDocs(question: string, max = 3): DeskNoteDoc[] {
  const q = question.toLowerCase();
  const words = new Set(tokens(question));
  const scored = DESK_NOTE_DOCS.map((doc) => {
    let score = 0;
    for (const k of doc.keywords) {
      if (k.includes(" ") ? q.includes(k) : words.has(k)) score += 3;
    }
    for (const w of tokens(doc.title)) if (words.has(w)) score += 2;
    return { doc, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return DESK_NOTE_DOCS.filter((d) => d.id === "overview" || d.id === "features");
  return scored.slice(0, max).map((s) => s.doc);
}

type RepoChunk = { path: string; lines: string; text: string };
type RepoIndex = { repo: string; url: string; commit: string; syncedAt: string; chunks: RepoChunk[] };

let repoIndex: RepoIndex | null | undefined;
/** The indexed Desk Note repository (built by scripts/sync-desk-note.mjs). Null if not synced yet. */
export async function loadDeskNoteRepo(): Promise<RepoIndex | null> {
  if (repoIndex !== undefined) return repoIndex;
  try {
    const mod = (await import("./desk-note-repo.generated.json")) as unknown as { default: RepoIndex };
    repoIndex = mod.default?.chunks?.length ? mod.default : null;
  } catch {
    repoIndex = null;
  }
  return repoIndex;
}

/** Score repo chunks by how many question words appear in them (path hits count extra). */
export function retrieveRepoChunks(index: RepoIndex, question: string, max = 4): RepoChunk[] {
  const words = [...new Set(tokens(question))].filter((w) => w.length > 2);
  if (!words.length) return [];
  return index.chunks
    .map((c) => {
      const hay = c.text.toLowerCase();
      const p = c.path.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (hay.includes(w)) score += 1;
        if (p.includes(w)) score += 3;
      }
      return { c, score };
    })
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((s) => s.c);
}

export type DeskNoteSource = { title: string; source: string; asOf: string };

/** Context block handed to Noctis. Grounds the answer and forbids invention. */
export async function deskNoteContext(question: string): Promise<{ context: string; sources: DeskNoteSource[] }> {
  const docs = retrieveDeskNoteDocs(question);
  const notes = docs.map((d) => `## ${d.title} (source: ${d.source}, as of ${d.asOf})\n${d.text}`).join("\n\n");
  const sources: DeskNoteSource[] = docs.map((d) => ({ title: d.title, source: d.source, asOf: d.asOf }));

  let code = "";
  const index = await loadDeskNoteRepo();
  if (index) {
    const hits = retrieveRepoChunks(index, question);
    code = hits
      .map((c) => `### ${c.path} lines ${c.lines}\n${c.text.slice(0, 1800)}`)
      .join("\n\n");
    for (const c of hits) {
      sources.push({ title: `${c.path}:${c.lines}`, source: `${index.url} @ ${index.commit.slice(0, 7)}`, asOf: index.syncedAt.slice(0, 10) });
    }
  }

  const context =
    "You are Noctis answering a question asked inside Desk Note (" + DESK_NOTE_URL + "). " +
    "Answer ONLY from the Desk Note notes and source excerpts below. If they do not contain the answer, say Desk Note's notes do not cover it and say what is known; never invent ratings, scores, quotes or results. " +
    "When code explains the answer, say what it does in plain words and name the file. " +
    "Midterm items are forecasts, not results. Keep the answer short and plain, and name the source and date when you give a number.\n\n" +
    "DESK NOTE NOTES:\n" +
    notes +
    (code ? "\n\nDESK NOTE SOURCE EXCERPTS (repo Danquah12/desk-note):\n" + code : "");
  return { context, sources };
}
