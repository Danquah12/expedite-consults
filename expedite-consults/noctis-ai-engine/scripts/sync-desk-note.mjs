#!/usr/bin/env node
/**
 * Sync the Desk Note repository into Noctis.
 *
 *   node scripts/sync-desk-note.mjs <path-to-desk-note-checkout>
 *   (default: ../desk-note-src)
 *
 * Reads the app's own source (scoring engine, library, midterms, jobs, UI copy, schema),
 * splits it into chunks, and writes src/lib/desk-note-repo.generated.json.
 * Noctis retrieves from these chunks to answer questions about Desk Note.
 * Re-run after Desk Note changes. Secrets are never indexed: .env files and anything
 * that looks like a key are skipped or redacted.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoDir = path.resolve(process.argv[2] || "../desk-note-src");
const out = path.resolve("src/lib/desk-note-repo.generated.json");
if (!existsSync(path.join(repoDir, "package.json"))) {
  console.error(`Not a Desk Note checkout: ${repoDir}`);
  process.exit(1);
}

// What answers questions about the product. Auth, PWA plumbing, tests, and the 74KB
// vibe-hard module are left out on purpose.
const INCLUDE = [
  "src/lib/engine.ts",
  "src/lib/library.ts",
  "src/lib/case-law.ts",
  "src/lib/midterms.functions.ts",
  "src/lib/power-graph.ts",
  "src/lib/regions.ts",
  "src/lib/story-card.ts",
  "src/lib/worked-figures.ts",
  "src/lib/major.functions.ts",
  "src/lib/notify.ts",
  "src/lib/clips.functions.ts",
  "src/lib/marks.functions.ts",
  "src/lib/notes.functions.ts",
  "src/lib/push.functions.ts",
  "src/lib/source.functions.ts",
  "src/lib/sports.functions.ts",
  "src/lib/weather.functions.ts",
  "src/lib/vibe.functions.ts",
  "src/lib/vibe-answer.server.ts",
  "src/components/FrontPage.tsx",
  "src/components/JobsBoard.tsx",
  "src/components/MidtermDesk.tsx",
  "src/components/PowerRank.tsx",
  "src/components/MajorDesk.tsx",
  "src/components/ScoreDetail.tsx",
  "src/components/ChannelsDesk.tsx",
  "src/components/WeatherDesk.tsx",
  "src/components/SportsDesk.tsx",
  "src/components/StoryBar.tsx",
  "src/components/StorySummary.tsx",
  "src/components/StoryThread.tsx",
  "src/components/LensApp.tsx",
  "migrations/0002_notes.sql",
  "migrations/0003_marks.sql",
  "package.json",
  "src/routes/index.tsx",
];

const SECRET = /(sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{12,}["'])/gi;
const CHUNK = 1800;

function chunk(text) {
  const lines = text.split(/\r?\n/);
  const parts = [];
  let buf = [];
  let size = 0;
  let start = 1;
  lines.forEach((line, i) => {
    if (size + line.length > CHUNK && buf.length) {
      parts.push({ start, end: i, text: buf.join("\n") });
      buf = [];
      size = 0;
      start = i + 1;
    }
    buf.push(line);
    size += line.length + 1;
  });
  if (buf.length) parts.push({ start, end: lines.length, text: buf.join("\n") });
  return parts;
}

let commit = "unknown";
try {
  commit = execFileSync("git", ["-C", repoDir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  /* not a git checkout; keep "unknown" */
}

const chunks = [];
const skipped = [];
for (const rel of INCLUDE) {
  const file = path.join(repoDir, rel);
  if (!existsSync(file)) {
    skipped.push(rel);
    continue;
  }
  const raw = readFileSync(file, "utf8").replace(SECRET, "[redacted]");
  for (const c of chunk(raw)) {
    chunks.push({ path: rel, lines: `${c.start}-${c.end}`, text: c.text });
  }
}

writeFileSync(
  out,
  JSON.stringify({ repo: "Danquah12/desk-note", url: "https://github.com/Danquah12/desk-note", commit, syncedAt: new Date().toISOString(), chunks }),
);
console.log(`Indexed ${chunks.length} chunks from ${INCLUDE.length - skipped.length} files @ ${commit.slice(0, 7)} -> ${path.relative(process.cwd(), out)}`);
if (skipped.length) console.log("Missing (skipped):", skipped.join(", "));
