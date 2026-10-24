import type { ClinicDeskId } from "@/lib/ingest-sources";
import type { ReelCat } from "@/lib/reel-cats";
import type { StudyHouse } from "@/lib/study-desk";
import type { HallId, TicketId } from "@/lib/hall";

export type HallTabId =
  | "clinic"
  | "reels"
  | "music"
  | "study"
  | "hub"
  | "battle"
  | "map"
  | "tickets"
  | "openings"
  | "ledger"
  | "crews";

export type HallSurface = {
  id: ClinicDeskId;
  tabs: HallTabId[];
  reel?: ReelCat;
  study?: StudyHouse | "all";
  hub?:
    | "/hub"
    | "/hub/tracks"
    | "/hub/range"
    | "/hub/nist"
    | "/hub/careers"
    | "/hub/sources"
    | "/hub/cyber"
    | "/study"
    | "/openings"
    | "/ledger"
    | "/paths";
  ticketHall?: HallId;
  ticket?: TicketId;
  crew?: string;
  map?: string;
  opening?: string;
  lab?: string;
};

export const TAB_LINE: Record<HallTabId, string> = {
  clinic: "The feed for this hall.",
  reels: "Short clips from this hall.",
  music: "Listen, then learn why it matters.",
  study: "Curriculum and drills.",
  hub: "Courses, range, academies.",
  battle: "One question. Pass it.",
  map: "What you know next in this hall.",
  tickets: "The job this hall trains.",
  openings: "Seats, stamps, and boards.",
  ledger: "What we pulled, and the lab.",
  crews: "People who sit in this hall.",
};

/** Knowledge trees on Your map → hall. */
export const TREE_HALL: Record<string, ClinicDeskId> = {
  calc: "math",
  cyber: "cyber",
  robotics: "maker",
  rhythm: "arts",
  lens: "arts",
  campus: "campus",
  music: "arts",
};

/**
 * Where each hall lives. Clinic + Ledger hold every hall (feed + catalog).
 * Other apps only get a hall when that app has a real job for it.
 */
export const HALL_SURFACES: HallSurface[] = [
  {
    id: "campus",
    tabs: ["clinic", "reels", "study", "hub", "map", "ledger", "crews"],
    reel: "campus",
    study: "all",
    hub: "/hub/tracks",
    crew: "commonwealth",
    map: "campus",
  },
  {
    id: "code",
    tabs: ["clinic", "reels", "study", "hub", "battle", "map", "tickets", "openings", "ledger", "crews"],
    reel: "code",
    study: "all",
    hub: "/hub/tracks",
    ticketHall: "builders",
    ticket: "developer",
    crew: "compile",
    map: "code",
    opening: "challenge",
    lab: "code",
  },
  {
    id: "ai",
    tabs: ["clinic", "reels", "study", "hub", "battle", "ledger"],
    reel: "ai",
    study: "cyber",
    hub: "/hub/tracks",
  },
  {
    id: "cyber",
    tabs: ["clinic", "reels", "study", "hub", "battle", "map", "tickets", "openings", "ledger", "crews"],
    reel: "cyber",
    study: "cyber",
    hub: "/hub/nist",
    ticketHall: "builders",
    ticket: "developer",
    crew: "cyber",
    map: "cyber",
    opening: "certs",
    lab: "cyber",
  },
  {
    id: "cloud",
    tabs: ["clinic", "reels", "study", "hub", "battle", "map", "openings", "ledger"],
    reel: "cloud",
    study: "cyber",
    hub: "/hub/range",
    map: "cloud",
    opening: "jobs",
    lab: "cloud",
  },
  {
    id: "data",
    tabs: ["clinic", "reels", "study", "hub", "battle", "map", "openings", "ledger", "crews"],
    reel: "data",
    study: "all",
    hub: "/hub/tracks",
    crew: "tables",
    map: "data",
    opening: "jobs",
    lab: "data",
  },
  {
    id: "research",
    tabs: ["clinic", "study", "hub", "battle", "ledger"],
    study: "cern",
    hub: "/hub/sources",
    lab: "research",
  },
  {
    id: "care",
    tabs: ["clinic", "reels", "study", "battle", "map", "tickets", "openings", "ledger", "crews"],
    reel: "care",
    study: "jhu",
    ticketHall: "care",
    ticket: "physician",
    crew: "ward",
    map: "care",
    opening: "jobs",
    lab: "care",
  },
  {
    id: "mind",
    tabs: ["clinic", "reels", "study", "battle", "ledger", "crews"],
    reel: "mind",
    study: "yale",
    crew: "quiet",
    lab: "mind",
  },
  {
    id: "math",
    tabs: ["clinic", "reels", "study", "battle", "map", "ledger"],
    reel: "math",
    study: "all",
    map: "calc",
  },
  {
    id: "science",
    tabs: ["clinic", "reels", "study", "battle", "ledger", "crews"],
    reel: "science",
    study: "hhmi",
    crew: "bench",
  },
  {
    id: "maker",
    tabs: ["clinic", "reels", "hub", "battle", "map", "tickets", "ledger", "crews"],
    reel: "maker",
    hub: "/hub/range",
    ticketHall: "builders",
    ticket: "designer",
    crew: "robotics",
    map: "robotics",
  },
  {
    id: "space",
    tabs: ["clinic", "reels", "study", "battle", "ledger", "crews"],
    reel: "space",
    study: "space",
    crew: "skycrew",
  },
  {
    id: "sky",
    tabs: ["clinic", "reels", "study", "battle", "ledger"],
    reel: "sky",
    study: "space",
  },
  {
    id: "business",
    tabs: ["clinic", "reels", "battle", "map", "openings", "ledger"],
    reel: "business",
    map: "business",
    opening: "challenge",
    lab: "business",
  },
  {
    id: "civic",
    tabs: ["clinic", "reels", "study", "hub", "battle", "ledger", "crews"],
    reel: "civic",
    study: "nist",
    hub: "/hub/nist",
    crew: "civiccrew",
    lab: "civic",
  },
  {
    id: "history",
    tabs: ["clinic", "reels", "study", "battle", "ledger"],
    reel: "history",
    study: "loc",
  },
  {
    id: "language",
    tabs: ["clinic", "reels", "study", "battle", "map", "ledger", "crews"],
    reel: "language",
    crew: "tongues",
    map: "language",
    lab: "language",
  },
  {
    id: "arts",
    tabs: ["clinic", "reels", "battle", "map", "ledger", "crews"],
    reel: "arts",
    crew: "lens",
    map: "lens",
    lab: "arts",
  },
  {
    id: "faith",
    tabs: ["clinic", "reels", "music", "ledger", "crews"],
    reel: "faith",
    crew: "pulpit",
  },
  {
    id: "trades",
    tabs: ["clinic", "reels", "battle", "map", "tickets", "openings", "ledger", "crews"],
    reel: "trades",
    ticketHall: "trades",
    ticket: "electrician",
    crew: "shop",
    map: "trades",
    opening: "jobs",
  },
  {
    id: "ag",
    tabs: ["clinic", "reels", "battle", "ledger", "crews"],
    reel: "ag",
    crew: "farm",
  },
  {
    id: "career",
    tabs: ["clinic", "study", "hub", "battle", "map", "tickets", "openings", "ledger"],
    study: "career",
    hub: "/hub/careers",
    ticketHall: "builders",
    ticket: "developer",
    map: "career",
    opening: "jobs",
    lab: "career",
  },
  {
    id: "teach",
    tabs: ["clinic", "reels", "study", "hub", "map", "tickets", "ledger", "crews"],
    reel: "teach",
    study: "all",
    hub: "/hub/tracks",
    ticketHall: "classroom",
    ticket: "teacher",
    crew: "classroom",
    map: "teach",
  },
  {
    id: "news",
    tabs: ["clinic", "reels", "study", "battle", "ledger"],
    reel: "news",
    study: "news",
    lab: "news",
  },
];

export type HallWingId = "all" | "campus" | "care" | "stem" | "code" | "world" | "trades";

export const HALL_WINGS: { id: HallWingId; label: string; line: string; desks: ClinicDeskId[] }[] = [
  { id: "all", label: "All", line: "Every hall", desks: [] },
  { id: "care", label: "Care", line: "Body and mind", desks: ["care", "mind"] },
  { id: "code", label: "Code", line: "Compute and defend", desks: ["code", "ai", "cyber", "cloud", "data", "research"] },
  { id: "stem", label: "STEM", line: "Math, science, space", desks: ["math", "science", "maker", "space", "sky"] },
  { id: "world", label: "World", line: "People, law, story", desks: ["business", "civic", "history", "language", "arts", "faith", "news"] },
  { id: "trades", label: "Trades", line: "Hands and work", desks: ["trades", "ag", "career"] },
  { id: "campus", label: "Campus", line: "School and teaching", desks: ["campus", "teach"] },
];

export function hallsOn(tab: HallTabId) {
  return HALL_SURFACES.filter((h) => h.tabs.includes(tab));
}

export function wingOf(desk: ClinicDeskId | "all"): HallWingId {
  if (desk === "all") return "all";
  return HALL_WINGS.find((w) => w.id !== "all" && w.desks.includes(desk))?.id ?? "all";
}

export function desksInWing(wing: HallWingId, tab: HallTabId): ClinicDeskId[] {
  if (wing === "all") return [];
  const allowed = new Set(hallsOn(tab).map((h) => h.id));
  return (HALL_WINGS.find((w) => w.id === wing)?.desks ?? []).filter((id) => allowed.has(id));
}

export function wingsOn(tab: HallTabId) {
  return HALL_WINGS.filter((w) => w.id === "all" || desksInWing(w.id, tab).length > 0);
}


export function surfaceOf(id: ClinicDeskId | "all") {
  if (id === "all") return undefined;
  return HALL_SURFACES.find((h) => h.id === id);
}

export function hallOnTab(id: ClinicDeskId | "all", tab: HallTabId) {
  if (id === "all") return false;
  return Boolean(surfaceOf(id)?.tabs.includes(tab));
}
