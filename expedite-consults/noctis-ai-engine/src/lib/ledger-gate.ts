import { SOURCE } from "@/lib/source";
import { isAiClip } from "@/lib/ai-cut";
import type { IngestHouse } from "@/lib/ingest-sources";

export type RightsLabel = "Open license" | "Authorized embed" | "Partner" | "External" | "Creator" | "Restricted";
export type VerifyLabel = "University" | "Instructor" | "Researcher" | "Organization" | "Hall";

export type LedgerLabels = {
  title: string;
  house: string;
  stamp: string;
  kind: string;
  tags: string[];
  rights: RightsLabel;
  verify: VerifyLabel;
  source: string;
};

export type GateClip = {
  videoId?: string;
  title?: string;
  description?: string;
  author?: string;
  liveNow?: boolean;
  isUpcoming?: boolean;
  isFamilyFriendly?: boolean;
  premium?: boolean;
};

export type GateResult =
  | { pass: true; labels: LedgerLabels; line: string }
  | { pass: false; reason: string; labels: Partial<LedgerLabels> };

const BANNED = /\bage[- ]restricted\b|\bmembers? only\b|\bsign in to\b|\blogin to watch\b|\bprivate video\b|\byoutube premium\b/i;

function verifyOf(house: string, author: string): VerifyLabel {
  const blob = `${house} ${author}`;
  if (/university|open course|ocw|\bmit\b|stanford|harvard|yale|berkeley|oxford|cambridge|college/i.test(blob)) return "University";
  if (/\bnasa\b|\bnih\b|\bcdc\b|\bnist\b|\bcisa\b|\bted\b|khan academy|archive|smithsonian|noaa/i.test(blob)) return "Organization";
  if (/research|laboratory|paper|journal/i.test(blob)) return "Researcher";
  if (author && author !== house) return "Instructor";
  return "Hall";
}

function rightsOf(house: string, banned: boolean): RightsLabel {
  if (banned) return "Restricted";
  if (/mit open|khan academy|nasa|internet archive|ted-ed|ocw/i.test(house)) return "Open license";
  return "Authorized embed";
}

function lineOf(labels: LedgerLabels) {
  return `${labels.verify} · ${labels.kind} · ${labels.rights} · ${labels.source}`;
}

/** Every ledger film must carry a full label set before it can be seated. */
export function gateLedgerClip(clip: GateClip, house: IngestHouse): GateResult {
  const title = (clip.title ?? "").replace(/\s+/g, " ").trim();
  const houseName = house.house.trim();
  const stamp = house.stamp.trim();
  const kind = (house.kind ?? "Lesson").trim();
  const tags = house.tags.map((tag) => tag.trim()).filter(Boolean);
  const author = (clip.author ?? houseName).trim();
  const blob = `${title} ${clip.description ?? ""}`;
  const banned = Boolean(clip.liveNow || clip.isUpcoming || clip.premium || clip.isFamilyFriendly === false || BANNED.test(blob));
  const rights = rightsOf(houseName, banned);
  const verify = verifyOf(houseName, author);
  const labels: LedgerLabels = {
    title,
    house: houseName,
    stamp,
    kind,
    tags,
    rights,
    verify,
    source: SOURCE,
  };

  const missing: string[] = [];
  if (!clip.videoId || !/^[a-zA-Z0-9_-]{11}$/.test(clip.videoId)) missing.push("playable id");
  if (title.length < 8) missing.push("title");
  if (/^youtube\b/i.test(title)) missing.push("title");
  if (!houseName) missing.push("house");
  if (!stamp) missing.push("stamp");
  if (!kind) missing.push("kind");
  if (!tags.length) missing.push("tags");
  if (!verify) missing.push("verify");
  if (!SOURCE) missing.push("source");
  if (rights === "Restricted" || banned) missing.push("rights");
  if (
    isAiClip({
      caption: `${title} ${houseName} ${stamp}`,
      hashtags: tags,
      teach: { hook: title, stamp },
      author: { name: author },
    })
  ) {
    missing.push("not an AI film");
  }

  if (missing.length) return { pass: false, reason: missing.join(", "), labels };
  return { pass: true, labels, line: lineOf(labels) };
}
