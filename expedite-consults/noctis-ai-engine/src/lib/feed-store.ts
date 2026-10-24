import { create } from "zustand";
import { actor } from "@/lib/current-user";
import {
  type FeedPost,
  type FeedComment,
  type StoryItem,
  type LiveStreamItem,
  CREWS,
  initialFeedPosts,
  initialStories,
} from "@/lib/feed-data";
import { MUSIC_POSTS } from "@/lib/music-feed";
import { hymnSeedPosts } from "@/lib/hymn-desk";
import { SCRIPTURE_POSTS } from "@/lib/hall-scripture";
import { WILD_POSTS } from "@/lib/edu-wild";
import { MARKET_POSTS } from "@/lib/market-feed";
import { isAiClip } from "@/lib/ai-cut";
import { STUDY_POSTS } from "@/lib/study-desk";
import { CATALOG_POSTS, CATALOG_ROWS } from "@/lib/catalog-sync";
import { PATH_ROWS } from "@/lib/path-ledger";
import { DEFAULT_MIX, nudgeMix, type VibeLane, type VibeMix } from "@/lib/noctis";
import { SPARK_LIMIT, pickClinic } from "@/lib/engine";
import { OTHER_FILMS } from "@/lib/other-films";
import { onTab } from "@/lib/tab-split";
import { emptyWatch, favoriteDesk, leadNew, markArm, markChoice, markDwell, markLove, markPlay, rollWatch, uniqueFilms, visitorSeed, writeReelEntry, type DayWatch } from "@/lib/shuffle";
import { GOALS, XP, type GoalId, type IntentId } from "@/lib/learn";
import { TICKET_DEFAULT, HALL_CARDS, TICKETS, ticketOfPost, type HallId, type HallLens, type TicketId } from "@/lib/hall";
import { fileNote } from "@/lib/admin-api";
import { freezeUrl, isEphemeral, readPersisted, writePersisted } from "@/lib/media-persist";
import { recordDiscovery } from "@/lib/reel-services";
const FILED_KEY = "vibetok-notes-filed-v2";
const QUEUE_KEY = "vibetok-notes-queue";

export type QueuedNote = {
  token: string;
  postId: string;
  author: string;
  text: string;
  clip: string;
  at: string;
  error?: string;
};

function readQueue(): QueuedNote[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((row) => row && typeof row === "object" && typeof (row as QueuedNote).token === "string") as QueuedNote[];
  } catch {
    return [];
  }
}

function writeQueue(rows: QueuedNote[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(rows.slice(0, 200)));
}

export function readQueuedNotes(): QueuedNote[] {
  if (typeof window === "undefined") return [];
  return readQueue();
}

function remember(token: string, note: QueuedNote, error?: string) {
  const rows = readQueue().filter((row) => row.token !== token);
  rows.unshift({ ...note, error });
  writeQueue(rows);
}

function markFiled(token: string) {
  try {
    const raw = JSON.parse(window.localStorage.getItem(FILED_KEY) || "[]") as unknown;
    const ids = Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
    if (!ids.includes(token)) ids.push(token);
    window.localStorage.setItem(FILED_KEY, JSON.stringify(ids.slice(-500)));
  } catch {
    /* the note stays in the queue either way */
  }
}

function filedSet() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(FILED_KEY) || "[]") as unknown;
    return new Set(Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function pushNote(postId: string, author: string, text: string, token: string) {
  if (typeof window === "undefined" || !text.trim()) return;
  const clip = useFeedStore.getState().posts.find((p) => p.id === postId)?.caption ?? "";
  const note: QueuedNote = { token, postId, author, text, clip, at: new Date().toISOString() };
  remember(token, note);
  if (filedSet().has(token)) return;
  void import("@/lib/activity-api")
    .then((mod) => mod.recordClipAct({ data: { postId, text, clip } }))
    .then((res) => {
      if (res?.ok) {
        markFiled(token);
        return;
      }
      return fileNote({ data: { postId, author, text, clip, token } }).then((saved) => {
        if (saved?.ok) markFiled(token);
        else remember(token, note, saved && "error" in saved ? saved.error : "Could not save");
      });
    })
    .catch(() => {
      void fileNote({ data: { postId, author, text, clip, token } })
        .then((res) => {
          if (res?.ok) markFiled(token);
          else remember(token, note, res && "error" in res ? res.error : "Could not save");
        })
        .catch((err: unknown) => {
          remember(token, note, err instanceof Error ? err.message : "Could not save");
        });
    });
}

export function syncFiledNotes() {
  if (typeof window === "undefined") return;
  const have = filedSet();
  const { engage, posts } = useFeedStore.getState();
  for (const [postId, row] of Object.entries(engage)) {
    const clip = posts.find((p) => p.id === postId)?.caption ?? "";
    if (row.liked && !have.has(`like:${postId}`)) pushNote(postId, actor().name, actLine("like"), `like:${postId}`);
    if (row.reposted && !have.has(`repost:${postId}`)) pushNote(postId, actor().name, actLine("repost"), `repost:${postId}`);
    if (row.saved && !have.has(`save:${postId}`)) pushNote(postId, actor().name, "Saved this clip", `save:${postId}`);
    for (const comment of row.comments ?? []) {
      const token = `c:${comment.id}`;
      if (!comment.text || have.has(token)) continue;
      const text = comment.text.startsWith("Sent to ") ? comment.text : comment.text.startsWith("Comment · ") || comment.text.startsWith("Reel comment") || comment.text.startsWith("Study comment") || comment.text.startsWith("Hub comment") ? comment.text : actLine("comment", comment.text);
      const author = comment.name || actor().name;
      if (typeof window === "undefined") continue;
      const note: QueuedNote = { token, postId, author, text, clip, at: new Date().toISOString() };
      remember(token, note);
      void fileNote({ data: { postId, author, text, clip, token } })
        .then((res) => {
          if (res?.ok) markFiled(token);
          else remember(token, note, res && "error" in res ? res.error : "Could not save");
        })
        .catch((err: unknown) => remember(token, note, err instanceof Error ? err.message : "Could not save"));
    }
  }
  for (const [username, on] of Object.entries(useFeedStore.getState().followOn)) {
    const postId = useFeedStore.getState().followFrom[username];
    const token = postId ? `follow:${username}:${postId}` : "";
    if (!on || !token || have.has(token)) continue;
    const post = posts.find((p) => p.id === postId);
    const name = post?.author.name || username;
    const hook = post?.teach.hook || post?.caption || "this video";
    pushNote(postId, actor().name, `Followed ${name} · ${hook}`, token);
  }
}

export function actLine(kind: "like" | "repost" | "send" | "comment", extra = "") {
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const place = path.startsWith("/reels") ? "reel" : path.startsWith("/study") ? "study" : path.startsWith("/hub") ? "hub" : "clip";
  if (kind === "like") return place === "clip" ? "Liked this clip" : `Liked this ${place}`;
  if (kind === "repost") return place === "clip" ? "Reposted this clip" : `Reposted this ${place}`;
  if (kind === "send") {
    if (extra) return `Sent to ${extra}`;
    return place === "clip" ? "Send" : `Sent this ${place}`;
  }
  if (place === "reel") return `Reel comment · ${extra}`;
  if (place === "study") return `Study comment · ${extra}`;
  if (place === "hub") return `Hub comment · ${extra}`;
  return `Comment · ${extra}`;
}

export function fileClip(postId: string, text: string, token?: string) {
  pushNote(postId, actor().name, text, token || `${postId}:${text}`.slice(0, 120));
}
import { endPick } from "@/lib/local-media";
import { type IngestReport, type IngestRow, pullSlot, postDesk, type ClinicDeskId } from "@/lib/ingest-sources";

export type FeedMode = "MIX" | "CREWS" | "DROPS";
export type ViewStyle = "stream" | "theater";
export type Surface = "feed" | "takes" | "board";

export type UiModal =
  | { type: "none" }
  | { type: "recorder" }
  | { type: "composer"; quoteOf?: string; pick?: boolean }
  | { type: "story"; index: number }
  | { type: "live"; streamId: string }
  | { type: "smarter" }
  | { type: "lesson"; postId: string }
  | { type: "meaning"; postId: string }
  | { type: "settings" }
  | { type: "lesson-song" }
  | { type: "hall-drill"; ticket: TicketId; cardId: string }
  | { type: "create" }
  | { type: "hall-nav" }
  | { type: "send"; postId: string }
  | { type: "comments"; postId: string }
  | { type: "analyze"; claim: string; offered?: string }
  | { type: "think"; claim: string }
  | { type: "video"; postId: string; title?: string; caption?: string; youtubeId?: string }
  | { type: "alerts"; page?: "explain" | "explore" | "versus" | "prefs" | "algo" | "weights" | "diversity" | "spread" }
  | { type: "calls" }
  | { type: "phone"; video?: boolean; join?: string };

type HeartBurst = { x: number; y: number; id: number } | null;

const RAW_SEED = [...SCRIPTURE_POSTS, ...STUDY_POSTS, ...MUSIC_POSTS, ...hymnSeedPosts(), ...CATALOG_POSTS, ...WILD_POSTS, ...initialFeedPosts, ...MARKET_POSTS, ...OTHER_FILMS];
const SEED_POSTS = (() => {
  const seen = new Set<string>();
  return RAW_SEED.filter((p) => {
    const key = p.youtubeId ?? p.id;
    if (seen.has(key) || isAiClip(p)) return false;
    seen.add(key);
    return true;
  });
})();

type Engage = {
  liked?: boolean;
  likeDelta?: number;
  saved?: boolean;
  reposted?: boolean;
  shareDelta?: number;
  comments?: FeedComment[];
  react?: string;
};

type PersistSlice = {
  posts: FeedPost[];
  engage: Record<string, Engage>;
  vibeMix: VibeMix;
  joinedCrews: string[];
  flipped: Record<string, boolean>;
  earnedStamps: string[];
  sparks: number;
  echosDone: number;
  drillPassed: Record<string, boolean>;
  drillMissed: Record<string, number>;
  xp: number;
  goal: GoalId;
  intent: IntentId;
  ingestAt: number;
  ingestCount: number;
  ingestLog: IngestReport[];
  blockedYoutube: string[];
  waveIds: string[];
  priorWaveIds: string[];
  dayWatch: DayWatch;
  bells: string[];
  alerts: ClipAlert[];
  notifyReleases: boolean;
  followOn: Record<string, boolean>;
  followFrom: Record<string, string>;
};

export type ClipAlert = {
  id: string;
  postId: string;
  username: string;
  name: string;
  title: string;
  at: number;
  read: boolean;
};

function ringNew(fresh: FeedPost[], bells: string[], alerts: ClipAlert[], notifyReleases = true): ClipAlert[] {
  if (!notifyReleases) return alerts;
  const mine = actor().username;
  const next: ClipAlert[] = [];
  for (const post of fresh) {
    if (post.mediaType !== "video") continue;
    if (!post.author.username || post.author.username === mine) continue;
    if (!bells.includes(post.author.username)) continue;
    const id = `al-${post.id}`;
    if (alerts.some((row) => row.id === id) || next.some((row) => row.id === id)) continue;
    next.push({
      id,
      postId: post.id,
      username: post.author.username,
      name: post.author.name,
      title: post.teach.hook.slice(0, 160),
      at: Date.now(),
      read: false,
    });
  }
  return next.length ? [...next, ...alerts].slice(0, 40) : alerts;
}

type FeedState = PersistSlice & {
  stories: StoryItem[];
  liveStreams: LiveStreamItem[];
  feedMode: FeedMode;
  viewStyle: ViewStyle;
  surface: Surface;
  isMuted: boolean;
  soundUnlocked: boolean;
  modal: UiModal;
  heartBurst: HeartBurst;
  clinicPostId: string | null;
  playingId: string | null;
  pipId: string | null;
  pipClip: FeedPost | null;
  heldPlayId: string | null;
  lastNotedId: string | null;
  watchStartedAt: number;
  hall: HallId;
  ticket: TicketId;
  hallLens: HallLens;
  hallFocus: "all" | "hall" | "ticket";
  clinicDesk: ClinicDeskId | "all";
  deckSeed: number;
  reelSeed: number;
  reelStartId: string | null;
  setFeedMode: (mode: FeedMode) => void;
  openClinic: () => void;
  setViewStyle: (style: ViewStyle) => void;
  setSurface: (surface: Surface) => void;
  toggleMute: (postId?: string) => void;
  unlockSound: () => void;
  openModal: (modal: UiModal) => void;
  closeModal: () => void;
  toggleLike: (id: string, burst?: { x: number; y: number }, note?: string) => void;
  toggleSave: (id: string) => void;
  toggleFollow: (username: string, postId?: string) => void;
  toggleBell: (username: string, postId?: string) => void;
  openAlert: (id: string) => void;
  markAlertsRead: () => void;
  setNotifyReleases: (on: boolean) => void;
  addPost: (post: FeedPost) => void;
  addStory: (story: StoryItem) => void;
  addComment: (postId: string, text: string, replyTo?: string) => void;
  sharePost: (id: string) => Promise<void>;
  toggleRepost: (id: string, note?: string) => void;
  sendClip: (id: string, tag?: string) => void;
  setMix: (mix: VibeMix) => void;
  boostLane: (lane: VibeLane) => void;
  toggleCrew: (crewId: string) => void;
  toggleFlip: (postId: string) => void;
  noteWatch: (postId: string) => void;
  rewardClip: (postId: string, kind: "finish" | "drill") => void;
  awardXp: (amount: number) => void;
  earnStamp: (name: string) => void;
  completeDrill: (postId: string) => void;
  noteStruggle: (postId: string) => void;
  setPlayingId: (id: string | null) => void;
  openPip: (id: string) => void;
  closePip: () => void;
  openReel: (id: string) => void;
  enterReels: (fromId?: string) => void;
  setGoal: (goal: GoalId) => void;
  setIntent: (intent: IntentId) => void;
  setHall: (hall: HallId) => void;
  setTicket: (ticket: TicketId) => void;
  setClinicDesk: (desk: ClinicDeskId | "all", learn?: boolean) => void;
  setHallLens: (lens: HallLens) => void;
  reshuffle: () => void;
  absorbIngest: (incoming: FeedPost[], rows?: IngestRow[]) => void;
  syncCatalog: () => void;
  dropGatedYoutube: (youtubeId: string) => void;
};

function persist(s: FeedState) {
  pending = s;
  if (persistTimer) return;
  const write = () => {
    persistTimer = 0;
    const cur = pending;
    if (!cur) return;
    const mine = cur.posts.filter((p) => p.id.startsWith("u-") && !isEphemeral(p.mediaUrl));
    writePersisted({
      posts: mine,
      engage: cur.engage,
      vibeMix: cur.vibeMix,
      joinedCrews: cur.joinedCrews,
      flipped: cur.flipped,
      earnedStamps: cur.earnedStamps,
      sparks: cur.sparks,
      echosDone: cur.echosDone,
      drillPassed: cur.drillPassed,
      drillMissed: cur.drillMissed,
      xp: cur.xp,
      goal: cur.goal,
      intent: cur.intent,
      ingestAt: cur.ingestAt,
      ingestCount: cur.ingestCount,
      ingestLog: cur.ingestLog.slice(0, 20),
      blockedYoutube: cur.blockedYoutube.slice(-200),
      waveIds: cur.waveIds.slice(0, 120),
      priorWaveIds: cur.priorWaveIds.slice(0, 120),
      dayWatch: rollWatch(cur.dayWatch),
      bells: (cur.bells ?? []).slice(0, 80),
      alerts: (cur.alerts ?? []).slice(0, 40),
      notifyReleases: cur.notifyReleases !== false,
      followOn: cur.followOn ?? {},
      followFrom: cur.followFrom ?? {},
    });
  };
  if (typeof window === "undefined") {
    write();
    return;
  }
  persistTimer = window.setTimeout(write, 700);
}

let pending: FeedState | null = null;
let persistTimer = 0;

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (!persistTimer) return;
    window.clearTimeout(persistTimer);
    persistTimer = 0;
    const cur = pending;
    if (!cur) return;
    writePersisted({
      posts: cur.posts.filter((p) => p.id.startsWith("u-") && !isEphemeral(p.mediaUrl)),
      engage: cur.engage,
      vibeMix: cur.vibeMix,
      joinedCrews: cur.joinedCrews,
      flipped: cur.flipped,
      earnedStamps: cur.earnedStamps,
      sparks: cur.sparks,
      echosDone: cur.echosDone,
      drillPassed: cur.drillPassed,
      drillMissed: cur.drillMissed,
      xp: cur.xp,
      goal: cur.goal,
      intent: cur.intent,
      ingestAt: cur.ingestAt,
      ingestCount: cur.ingestCount,
      ingestLog: cur.ingestLog.slice(0, 20),
      blockedYoutube: cur.blockedYoutube.slice(-200),
      waveIds: cur.waveIds.slice(0, 120),
      priorWaveIds: cur.priorWaveIds.slice(0, 120),
      dayWatch: rollWatch(cur.dayWatch),
      bells: (cur.bells ?? []).slice(0, 80),
      alerts: (cur.alerts ?? []).slice(0, 40),
      notifyReleases: cur.notifyReleases !== false,
      followOn: cur.followOn ?? {},
      followFrom: cur.followFrom ?? {},
    });
  });
}

const saved = readPersisted<PersistSlice>({
  posts: SEED_POSTS,
  engage: {},
  vibeMix: DEFAULT_MIX,
  joinedCrews: CREWS.filter((c) => c.joined).map((c) => c.id),
  flipped: {},
  earnedStamps: ["Calc clinic", "Packet ghost", "After lecture"],
  sparks: 0,
  echosDone: 0,
  drillPassed: {},
  drillMissed: {},
  xp: 120,
  goal: "exam",
  intent: "learn",
  ingestAt: 0,
  ingestCount: 0,
  ingestLog: [],
  blockedYoutube: [],
  waveIds: [],
  priorWaveIds: [],
  dayWatch: emptyWatch(),
  bells: [],
  alerts: [],
  notifyReleases: true,
  followOn: {},
  followFrom: {},
});

const seedById = new Map(SEED_POSTS.map((p) => [p.id, p]));
const savedById = new Map(saved.posts.map((p) => [p.id, p]));

function engageFromSaved(): Record<string, Engage> {
  const out: Record<string, Engage> = { ...(saved.engage ?? {}) };
  for (const prev of saved.posts) {
    if (prev.id.startsWith("u-") || out[prev.id]) continue;
    const seed = seedById.get(prev.id);
    const extra = (prev.commentsList ?? []).filter((c) => c.id.startsWith("c-"));
    const likeDelta = seed ? prev.likes - seed.likes : 0;
    const shareDelta = seed ? prev.shares - seed.shares : 0;
    if (!prev.isLiked && !prev.isSaved && !prev.isReposted && !likeDelta && !shareDelta && extra.length === 0) continue;
    out[prev.id] = {
      liked: prev.isLiked,
      likeDelta,
      saved: prev.isSaved,
      reposted: prev.isReposted,
      shareDelta,
      comments: extra,
    };
  }
  return out;
}

const hydratedPosts = [
  ...SEED_POSTS,
  ...saved.posts.filter((p) => p.id.startsWith("u-") && !seedById.has(p.id) && !isEphemeral(p.mediaUrl)),
];
const openedEngage = engageFromSaved();

const LIBRARY_CAP = 1800;
const SEED_KEYS = new Set(SEED_POSTS.flatMap((p) => [p.id, p.youtubeId ?? p.id]));

function mergeLibrary(mine: FeedPost[], fresh: FeedPost[], rest: FeedPost[], protect: Set<string>) {
  const seen = new Set<string>();
  const out: FeedPost[] = [];
  const push = (list: FeedPost[]) => {
    for (const p of list) {
      const key = p.youtubeId ?? p.id;
      if (seen.has(key) || seen.has(p.id) || isAiClip(p)) continue;
      seen.add(key);
      seen.add(p.id);
      out.push(p);
    }
  };
  push(mine);
  push(fresh);
  push(rest);
  if (out.length <= LIBRARY_CAP) return out;
  const keep: FeedPost[] = [];
  const overflow: FeedPost[] = [];
  for (const p of out) {
    const key = p.youtubeId ?? p.id;
    if (p.id.startsWith("u-") || SEED_KEYS.has(p.id) || SEED_KEYS.has(key) || protect.has(p.id) || protect.has(key)) {
      keep.push(p);
    } else overflow.push(p);
  }
  return [...keep, ...overflow.slice(0, Math.max(0, LIBRARY_CAP - keep.length))];
}

const clinic = pickClinic(hydratedPosts, saved.drillPassed);

const HOLDS_FEED = new Set(["story", "live", "phone"]);

const studyOffered = new Set<string>();

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: hydratedPosts,
  engage: openedEngage,
  stories: initialStories,
  liveStreams: [],
  feedMode: "MIX",
  viewStyle: "stream",
  surface: "feed",
  isMuted: false,
  soundUnlocked: true,
  modal: { type: "none" },
  heartBurst: null,
  vibeMix: { ...DEFAULT_MIX, ...saved.vibeMix },
  joinedCrews: saved.joinedCrews,
  flipped: saved.flipped,
  earnedStamps: saved.earnedStamps,
  sparks: saved.sparks,
  echosDone: saved.echosDone,
  clinicPostId: clinic?.id ?? null,
  playingId: null,
  pipId: null,
  pipClip: null,
  heldPlayId: null,
  lastNotedId: null,
  watchStartedAt: 0,
  drillPassed: saved.drillPassed,
  drillMissed: saved.drillMissed ?? {},
  xp: saved.xp,
  goal: saved.goal,
  intent: saved.intent,
  hall: "all",
  ticket: "teacher",
  hallLens: null,
  hallFocus: "all",
  clinicDesk: "all",
  deckSeed: visitorSeed("feed"),
  reelSeed: visitorSeed("reels"),
  reelStartId: null,
  ingestCount: saved.ingestCount ?? 0,
  ingestAt: saved.ingestAt ?? 0,
  ingestLog: saved.ingestLog ?? [],
  blockedYoutube: saved.blockedYoutube ?? [],
  waveIds: saved.waveIds?.length
    ? saved.waveIds
    : (saved.ingestLog?.[0]?.clips.filter((c) => !c.title.includes("already seated")).map((c) => c.postId) ?? []),
  priorWaveIds: saved.priorWaveIds ?? [],
  dayWatch: rollWatch(saved.dayWatch),
  bells: saved.bells ?? [],
  alerts: saved.alerts ?? [],
  notifyReleases: saved.notifyReleases !== false,
  followOn: saved.followOn ?? {},
  followFrom: saved.followFrom ?? {},
  setFeedMode: (mode) => set({ feedMode: mode }),
  openClinic: () =>
    set({
      feedMode: "MIX",
      surface: "feed",
      viewStyle: "stream",
      hall: "all",
      hallFocus: "all",
      clinicDesk: "all",
    }),
  setViewStyle: (style) => set({ viewStyle: style }),
  setSurface: (surface) => set({ surface }),
  toggleMute: (postId) => {
    const pip = get().pipId;
    set({ isMuted: !get().isMuted, soundUnlocked: true, playingId: pip ?? postId ?? get().playingId });
  },
  unlockSound: () => {
    if (get().soundUnlocked) return;
    set({ soundUnlocked: true, isMuted: false });
  },
  openModal: (modal) => {
    if (HOLDS_FEED.has(modal.type)) {
      const now = get();
      set({
        modal,
        heldPlayId: now.playingId ?? now.heldPlayId,
        playingId: null,
        pipId: null,
        pipClip: null,
      });
      return;
    }
    set({ modal });
  },
  closeModal: () => {
    endPick();
    const now = get();
    const resume = HOLDS_FEED.has(now.modal.type) ? now.heldPlayId : now.playingId;
    set({ modal: { type: "none" }, playingId: resume ?? now.playingId, heldPlayId: null });
  },
  toggleLike: (id, burst, note) => {
    const post = get().posts.find((p) => p.id === id);
    const cur = get().engage[id];
    const liked = note && cur?.react === note ? false : note ? true : !(cur?.liked ?? post?.isLiked ?? false);
    const engage = {
      ...get().engage,
      [id]: { ...cur, liked, likeDelta: (cur?.likeDelta ?? 0) + (liked === (cur?.liked ?? post?.isLiked ?? false) ? 0 : liked ? 1 : -1), react: liked ? note || cur?.react : undefined },
    };
    set({
      engage,
      heartBurst: burst && liked ? { ...burst, id: Date.now() } : get().heartBurst,
      sparks: liked && get().sparks < SPARK_LIMIT ? get().sparks + 1 : get().sparks,
      dayWatch: liked ? markLove(rollWatch(get().dayWatch), post) : get().dayWatch,
    });
    persist(get());
    const place = typeof window !== "undefined" && window.location.pathname.startsWith("/reels") ? "reel" : "clip";
    if (liked) fileClip(id, note ? `Liked this ${place} · ${note}` : actLine("like"), `like:${id}:${note || "heart"}`);
    else if (note) fileClip(id, `Removed like · ${note}`, `unlike:${id}:${note}:${Date.now()}`);
  },
  toggleSave: (id) => {
    const post = get().posts.find((p) => p.id === id);
    const cur = get().engage[id];
    const savedOn = !(cur?.saved ?? post?.isSaved ?? false);
    set({ engage: { ...get().engage, [id]: { ...cur, saved: savedOn } } });
    if (savedOn) {
      get().awardXp(XP.save);
      fileClip(id, actLine("like").replace("Liked", "Saved"), `save:${id}`);
    }
    persist(get());
  },
  toggleFollow: (username, postId) => {
    if (!username || username === actor().username) return;
    const sample = get().posts.find((p) => p.id === postId) ?? get().posts.find((p) => p.author.username === username);
    const seed = sample?.isFollowing ?? false;
    const current = username in get().followOn ? get().followOn[username] : seed;
    const now = !current;
    const from = postId || get().followFrom[username] || sample?.id || "";
    set({
      followOn: { ...get().followOn, [username]: now },
      followFrom: from ? { ...get().followFrom, [username]: from } : get().followFrom,
    });
    persist(get());
    if (now && from) {
      const hook = sample?.teach.hook || sample?.caption || "this video";
      fileClip(from, `Followed ${sample?.author.name || username} · ${hook}`, `follow:${username}:${from}`);
    }
  },
  toggleBell: (username, postId) => {
    if (!username || username === actor().username) return;
    const on = get().bells.includes(username);
    set({ bells: on ? get().bells.filter((name) => name !== username) : [...get().bells, username].slice(0, 80) });
    persist(get());
    if (on) return;
    const sample = get().posts.find((p) => p.id === postId) ?? get().posts.find((p) => p.author.username === username);
    const from = postId || sample?.id || "";
    if (!from) return;
    const hook = sample?.teach.hook || sample?.caption || "this video";
    fileClip(from, `Subscribed to ${sample?.author.name || username} · ${hook}`, `sub:${username}:${from}:${Date.now()}`);
  },
  openAlert: (id) => {
    const row = get().alerts.find((item) => item.id === id);
    if (!row) return;
    set({
      alerts: get().alerts.map((item) => (item.id === id ? { ...item, read: true } : item)),
      clinicPostId: row.postId,
      playingId: row.postId,
      surface: "feed",
      modal: { type: "none" },
    });
    persist(get());
  },
  markAlertsRead: () => {
    if (!get().alerts.some((item) => !item.read)) return;
    set({ alerts: get().alerts.map((item) => ({ ...item, read: true })) });
    persist(get());
  },
  setNotifyReleases: (on) => {
    set({ notifyReleases: on });
    persist(get());
  },
  addPost: (post) => {
    void freezeUrl(post.id, post.mediaUrl);
    set({
      posts: [post, ...get().posts],
      alerts: ringNew([post], get().bells, get().alerts, get().notifyReleases),
    });
    persist(get());
  },
  addStory: (story) => {
    set({ stories: [story, ...get().stories.filter((s) => s.id !== story.id)] });
  },
  addComment: (postId, text, replyTo) => {
    const who = actor();
    const row = {
      id: `c-${Date.now()}`,
      name: who.name,
      username: who.username,
      avatar: who.avatarUrl,
      text,
      replyTo,
    };
    const cur = get().engage[postId];
    set({
      engage: { ...get().engage, [postId]: { ...cur, comments: [...(cur?.comments ?? []), row] } },
    });
    persist(get());
    fileClip(postId, actLine("comment", text), `c:${row.id}`);
  },
  sharePost: async (id) => {
    const post = get().posts.find((row) => row.id === id);
    const url = `${window.location.origin}/?${new URLSearchParams({
      ...(post?.youtubeId ? { v: post.youtubeId } : {}),
      p: id,
    }).toString()}`;
    const cur = get().engage[id];
    set({
      engage: { ...get().engage, [id]: { ...cur, shareDelta: (cur?.shareDelta ?? 0) + 1 } },
    });
    persist(get());
    const { shareLine, brandFiles } = await import("@/lib/share");
    const line = shareLine(post?.caption ?? "");
    const files = await brandFiles();
    try {
      await navigator.clipboard.writeText(`${line}\n${url}`);
    } catch {
      /* ignore */
    }
    try {
      if (navigator.share) {
        const data: ShareData = { url, title: "Noctis Clinic", text: line };
        if (files) data.files = files;
        await navigator.share(data);
      }
    } catch {
      /* ignore */
    }
    const { trail } = await import("@/lib/activity-client");
    trail("share", (post?.caption || post?.teach.hook || "a clip").slice(0, 180), id);
  },
  toggleRepost: (id, note) => {
    const post = get().posts.find((p) => p.id === id);
    const cur = get().engage[id];
    const on = !(cur?.reposted ?? post?.isReposted ?? false);
    set({
      engage: {
        ...get().engage,
        [id]: { ...cur, reposted: on, shareDelta: (cur?.shareDelta ?? 0) + (on ? 1 : -1) },
      },
    });
    persist(get());
    if (on) fileClip(id, note || actLine("repost"), `repost:${id}`);
  },
  sendClip: (id, tag) => {
    const cur = get().engage[id];
    const who = actor();
    const row = tag
      ? {
          id: `c-${Date.now()}`,
          name: who.name,
          username: who.username,
          avatar: who.avatarUrl,
          text: `Sent to ${tag}`,
        }
      : null;
    const already = cur?.reposted ?? get().posts.find((p) => p.id === id)?.isReposted;
    set({
      engage: {
        ...get().engage,
        [id]: {
          ...cur,
          reposted: true,
          shareDelta: (cur?.shareDelta ?? 0) + (already ? 0 : 1),
          comments: row ? [...(cur?.comments ?? []), row] : cur?.comments,
        },
      },
    });
    persist(get());
    fileClip(id, actLine("send", tag), tag ? `send:${id}:${tag}` : `send:${id}`);
  },
  setMix: (mix) => {
    set({ vibeMix: mix });
    persist(get());
  },
  boostLane: (lane) => {
    set({ vibeMix: nudgeMix(get().vibeMix, lane) });
    persist(get());
  },
  toggleCrew: (crewId) => {
    const has = get().joinedCrews.includes(crewId);
    set({ joinedCrews: has ? get().joinedCrews.filter((c) => c !== crewId) : [...get().joinedCrews, crewId] });
    persist(get());
  },
  toggleFlip: (postId) => {
    const on = !get().flipped[postId];
    set({ flipped: { ...get().flipped, [postId]: on } });
    persist(get());
  },
  noteWatch: (postId) => {
    const now = Date.now();
    const prevId = get().lastNotedId;
    let watch = rollWatch(get().dayWatch);
    if (prevId && prevId !== postId && get().watchStartedAt) {
      const prev = get().posts.find((p) => p.id === prevId);
      const dwell = now - get().watchStartedAt;
      watch = markDwell(watch, prev, dwell);
      if (prev?.mediaType === "video" && dwell >= 20000 && get().modal.type === "none" && !studyOffered.has(prevId)) {
        studyOffered.add(prevId);
        queueMicrotask(() => get().openModal({ type: "video", postId: prevId }));
      }
    }
    if (prevId === postId) return;
    watch = markPlay(watch, postId);
    set({ lastNotedId: postId, watchStartedAt: now, dayWatch: watch });
    if ((watch.counts[postId] ?? 0) === 1) {
      const post = get().posts.find((row) => row.id === postId);
      if (post?.mediaType === "video" && post.teach) {
        try {
          recordDiscovery(post);
        } catch {
          /* a film with a missing lesson card must not take the feed down */
        }
      }
    }
    persist(get());
  },
  rewardClip: (postId, kind) => {
    const post = get().posts.find((p) => p.id === postId) ?? HALL_CARDS.find((c) => c.post.id === postId)?.post;
    if (!post) return;
    set({ dayWatch: markArm(rollWatch(get().dayWatch), postDesk(post), kind === "drill" ? 4 : 3, 0) });
    persist(get());
  },
  awardXp: (amount) => {
    set({ xp: get().xp + amount });
    persist(get());
  },
  earnStamp: (name) => {
    if (get().earnedStamps.includes(name)) return;
    set({ earnedStamps: [...get().earnedStamps, name], xp: get().xp + XP.lab });
    persist(get());
  },
  completeDrill: (postId) => {
    if (get().drillPassed[postId]) return;
    const post = get().posts.find((p) => p.id === postId) ?? HALL_CARDS.find((c) => c.post.id === postId)?.post;
    const stamps =
      post && !get().earnedStamps.includes(post.teach.stamp)
        ? [...get().earnedStamps, post.teach.stamp]
        : get().earnedStamps;
    set({
      drillPassed: { ...get().drillPassed, [postId]: true },
      echosDone: get().echosDone + 1,
      earnedStamps: stamps,
      xp: get().xp + XP.drill,
      flipped: { ...get().flipped, [postId]: false },
      dayWatch: post ? markArm(rollWatch(get().dayWatch), postDesk(post), 4, 0) : get().dayWatch,
    });
    persist(get());
  },
  noteStruggle: (postId) => {
    const post = get().posts.find((p) => p.id === postId) ?? HALL_CARDS.find((c) => c.post.id === postId)?.post;
    if (!post) return;
    set({
      drillMissed: { ...get().drillMissed, [postId]: (get().drillMissed[postId] ?? 0) + 1 },
      dayWatch: markArm(rollWatch(get().dayWatch), postDesk(post), 0, 2),
    });
    persist(get());
  },
  setPlayingId: (id) => {
    if (get().pipId) return;
    if (get().playingId === id) return;
    set({ playingId: id });
  },
  openPip: (id) => {
    const clip = get().posts.find((p) => p.id === id) ?? get().pipClip;
    if (!clip) return;
    set({ pipId: id, pipClip: clip, playingId: id, heldPlayId: id });
  },
  closePip: () => {
    if (typeof document !== "undefined" && document.pictureInPictureElement) {
      void document.exitPictureInPicture().catch(() => undefined);
    }
    set({ pipId: null, pipClip: null });
  },
  openReel: (id) => {
    get().enterReels(id);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/reels")) {
      window.location.assign("/reels");
    }
  },
  enterReels: (fromId) => {
    writeReelEntry(get().reelSeed, fromId ?? null);
    set({
      reelStartId: fromId ?? null,
      playingId: fromId ?? null,
      pipId: null,
      pipClip: null,
    });
  },
  setGoal: (goal) => {
    const mix = GOALS.find((g) => g.id === goal)?.mix ?? get().vibeMix;
    set({ goal, vibeMix: mix });
    persist(get());
  },
  setIntent: (intent) => {
    set({ intent });
    persist(get());
  },
  setHall: (hall) => {
    set({
      hall,
      ticket: hall === "all" ? get().ticket : TICKET_DEFAULT[hall],
      hallFocus: hall === "all" ? "all" : "hall",
      deckSeed: hall === "all" ? (visitorSeed("feed") ^ Date.now()) >>> 0 : visitorSeed(`hall-${hall}`),
    });
  },
  setTicket: (ticket) =>
    set({
      ticket,
      hall: TICKETS.find((t) => t.id === ticket)?.hall ?? get().hall,
      hallFocus: "ticket",
      deckSeed: visitorSeed(`ticket-${ticket}`),
    }),
  setClinicDesk: (desk, learn = true) => {
    const dayWatch = learn ? markChoice(rollWatch(get().dayWatch), desk) : rollWatch(get().dayWatch);
    set({
      clinicDesk: desk,
      hallFocus: "all",
      dayWatch,
      deckSeed: desk === "all" ? (visitorSeed("feed") ^ Date.now()) >>> 0 : visitorSeed(`desk-${desk}`),
    });
    if (learn && desk !== "all") persist(get());
  },
  setHallLens: (lens) => set({ hallLens: lens }),
  reshuffle: () =>
    set({
      deckSeed: (visitorSeed("feed") ^ Date.now()) >>> 0,
    }),
  absorbIngest: (incoming, rows = []) => {
    const blocked = new Set(get().blockedYoutube);
    const have = new Set(get().posts.map((p) => p.youtubeId ?? p.id));
    const fresh = incoming.filter((p) => {
      if (p.youtubeId && blocked.has(p.youtubeId)) return false;
      if (isAiClip(p)) return false;
      return !have.has(p.youtubeId ?? p.id) && !have.has(p.id);
    });
    const addedIds = new Set(fresh.map((p) => p.id));
    const report: IngestReport = {
      id: `lg-${Date.now()}`,
      at: Date.now(),
      houses: [...new Set(rows.map((r) => r.house))],
      added: fresh.length,
      skipped: Math.max(0, (rows.length || incoming.length) - fresh.length),
      clips: (rows.length
        ? rows
        : incoming.map((p) => ({
            postId: p.id,
            youtubeId: p.youtubeId ?? "",
            title: p.teach.hook,
            house: p.author.name,
            author: p.author.name,
            stamp: p.teach.stamp,
            lane: p.lane,
            url: p.mediaUrl,
          }))
      ).map((row) => ({ ...row, title: addedIds.has(row.postId) ? row.title : `${row.title} (already seated)` })),
    };
    const mine = get().posts.filter((p) => p.id.startsWith("u-"));
    const rest = get().posts.filter((p) => !p.id.startsWith("u-"));
    const waveIds = fresh.length ? fresh.map((p) => p.id) : hourLead(get().posts, get().waveIds);
    const priorWaveIds = fresh.length ? get().waveIds : get().priorWaveIds;
    const protect = new Set([...waveIds, ...priorWaveIds]);
    const wave = pullSlot();
    set({
      posts: mergeLibrary(mine, fresh, rest, protect),
      alerts: ringNew(fresh, get().bells, get().alerts, get().notifyReleases),
      ingestCount: get().ingestCount + fresh.length,
      ingestAt: Date.now(),
      ingestLog: [report, ...get().ingestLog].slice(0, 40),
      waveIds,
      priorWaveIds,
    });
    persist(get());
  },
  syncCatalog: () => {
    const log = get().ingestLog;
    const haveCatalog = log.some((r) => r.id === "lg-catalog");
    const havePaths = log.some((r) => r.id === "lg-paths");
    if (haveCatalog && havePaths) return;
    const have = new Set(get().posts.map((p) => p.youtubeId ?? p.id));
    const fresh = haveCatalog ? [] : CATALOG_POSTS.filter((p) => p.youtubeId && !isAiClip(p) && !have.has(p.youtubeId) && !have.has(p.id));
    const reports = [];
    if (!havePaths) {
      reports.push({
        id: "lg-paths",
        at: Date.now(),
        houses: [...new Set(PATH_ROWS.map((r) => r.house))],
        added: 0,
        skipped: PATH_ROWS.length,
        clips: PATH_ROWS.map((row) => ({ ...row, title: `${row.title} (already seated)` })),
      });
    }
    if (!haveCatalog) {
      reports.push({
        id: "lg-catalog",
        at: Date.now(),
        houses: [...new Set(CATALOG_ROWS.map((r) => r.house))],
        added: fresh.length,
        skipped: CATALOG_ROWS.length - fresh.length,
        clips: CATALOG_ROWS,
      });
    }
    const mine = get().posts.filter((p) => p.id.startsWith("u-"));
    const rest = get().posts.filter((p) => !p.id.startsWith("u-"));
    const protect = new Set([...get().waveIds, ...get().priorWaveIds, ...fresh.map((p) => p.id)]);
    set({
      posts: mergeLibrary(mine, fresh, rest, protect),
      alerts: ringNew(fresh, get().bells, get().alerts, get().notifyReleases),
      ingestCount: get().ingestCount + fresh.length,
      ingestLog: [...reports, ...log].slice(0, 40),
      waveIds: fresh.length ? fresh.map((p) => p.id) : get().waveIds,
      priorWaveIds: fresh.length ? get().waveIds : get().priorWaveIds,
    });
    persist(get());
  },
  dropGatedYoutube: (youtubeId) => {
    if (!youtubeId || get().blockedYoutube.includes(youtubeId)) return;
    const blockedYoutube = [...get().blockedYoutube, youtubeId].slice(-400);
    const posts = get().posts.filter((p) => p.youtubeId !== youtubeId);
    const playing = get().posts.find((p) => p.id === get().playingId);
    const pipHolds =
      get().pipClip?.youtubeId === youtubeId || get().posts.find((p) => p.id === get().pipId)?.youtubeId === youtubeId;
    set({
      blockedYoutube,
      posts,
      playingId:
        playing?.youtubeId === youtubeId && !pipHolds
          ? (posts.find((p) => p.mediaType === "video")?.id ?? null)
          : get().playingId,
    });
    persist(get());
  },
}));

if (typeof window !== "undefined") {
  window.setTimeout(() => persist(useFeedStore.getState()), 1500);
}

function hourLead(posts: FeedPost[], current: string[]) {
  const films = onTab(posts, "clinic").filter((p) => p.mediaType === "video" || p.youtubeId);
  if (!films.length) return current;
  const slot = pullSlot();
  const pick = films[slot % films.length];
  if (!pick) return current;
  return [pick.id, ...current.filter((id) => id !== pick.id)].slice(0, 40);
}

export function rankFeed(
  posts: FeedPost[],
  mix: VibeMix,
  mode: FeedMode,
  joined: string[],
  clinicId: string | null,
  seed = 1,
  hall: HallId = "all",
  ticket: TicketId = "teacher",
  hallFocus: "all" | "hall" | "ticket" = "all",
  ledgerIds: string[] = [],
  clinicDesk: ClinicDeskId | "all" = "all",
  priorIds: string[] = [],
  watch?: DayWatch,
  protectId?: string | null,
) {
  let list = uniqueFilms(onTab(posts, "clinic"));
  void mode;
  void joined;
  void mix;
  void seed;
  void clinicId;
  void priorIds;
  void protectId;
  const played = new Set(watch?.played ?? []);
  const films = list.filter((p) => p.mediaType === "video" || p.youtubeId);
  const notes = list.filter((p) => p.mediaType !== "video" && !p.youtubeId);
  const mine = films.filter((p) => p.id.startsWith("u-"));
  const library = films.filter((p) => !p.id.startsWith("u-"));
  const fresh = library.filter((p) => !played.has(p.id));
  const seen = library.filter((p) => played.has(p.id));
  let ordered = [...yearFirst(fresh), ...mine, ...yearFirst(seen), ...notes];

  if (hallFocus === "all") {
    if (clinicDesk !== "all") {
      const hit = ordered.filter((p) => p.id.startsWith("u-") || postDesk(p) === clinicDesk);
      const tail = ordered.filter((p) => !p.id.startsWith("u-") && postDesk(p) !== clinicDesk);
      ordered = [...yearFirst(hit), ...yearFirst(tail)];
    }
    return ordered;
  }

  const hallTickets = new Set(TICKETS.filter((t) => t.hall === hall).map((t) => t.id));
  const hot = new Set(ledgerIds);
  const head = ordered.filter((p) => hot.has(p.id) || p.id.startsWith("u-"));
  const hit: FeedPost[] = [];
  const plain: FeedPost[] = [];
  const other: FeedPost[] = [];
  for (const post of ordered) {
    if (hot.has(post.id) || post.id.startsWith("u-")) continue;
    const t = ticketOfPost(post);
    const isHit = hallFocus === "ticket" ? t === ticket : Boolean(t && hallTickets.has(t));
    if (isHit) hit.push(post);
    else if (t) other.push(post);
    else plain.push(post);
  }
  return seatHour([...head, ...hit, ...plain, ...other], watch);
}

function yearFirst(posts: FeedPost[]) {
  return [...posts].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

function seatHour(ordered: FeedPost[], watch?: DayWatch) {
  const films = ordered.filter((p) => p.mediaType === "video" || p.youtubeId);
  if (films.length < 2) return ordered;
  const played = new Set(watch?.played ?? []);
  const slot = pullSlot();
  const outside = films.filter((p) => !p.youtubeId && /ted\.com|archive\.org|vimeo\.com|dailymotion\.com/i.test(p.mediaUrl));
  const bag = slot % 2 === 0 && outside.length ? outside : films;
  let pick = bag[slot % bag.length];
  if (!pick || played.has(pick.id)) {
    pick = films.find((p) => p.id !== pick?.id && !played.has(p.id)) ?? films[(slot + 1) % films.length];
  }
  if (!pick) return ordered;
  return [pick, ...ordered.filter((p) => p.id !== pick.id)];
}
