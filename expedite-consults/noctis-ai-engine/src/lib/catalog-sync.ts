import { FACE, type FeedPost, type Teach } from "@/lib/feed-data";
import type { IngestRow } from "@/lib/ingest-sources";
import { NETWORK, type DeskId, type NetworkHouse } from "@/lib/source-network";
import type { StudyHouse } from "@/lib/study-desk";
import { SOURCE } from "@/lib/source";
import { youtubeWatch } from "@/lib/youtube";

const FACES = Object.values(FACE);

function teachOf(house: NetworkHouse): Teach {
  const ok = house.concepts[0] ?? house.name;
  return {
    hook: house.name,
    stamp: `${house.name} clinic`,
    prompt: "What belongs on this clinic?",
    options: [
      { id: "a", label: ok.slice(0, 48), ok: true },
      { id: "b", label: "A louder clip", ok: false },
      { id: "c", label: "Whatever trended", ok: false },
    ],
  };
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "hall";
}

export function studyHouseForDesk(desk: DeskId, id: string): StudyHouse {
  if (desk === "cyber") return "cyber";
  if (desk === "space" || desk === "climate") return "space";
  if (id.includes("jhu") || id.includes("hopkins")) return "jhu";
  if (id.includes("nih") || id.includes("niaid")) return "nih";
  if (id.includes("cdc")) return "cdc";
  if (id.includes("hhmi")) return "hhmi";
  if (id.includes("nature")) return "nature";
  if (id.includes("cern")) return "cern";
  if (desk === "medical") return "jhu";
  if (id.includes("nist") || id.includes("cisa")) return "nist";
  if (id.includes("loc") || desk === "history" || desk === "museums") return "loc";
  if (desk === "universities" || desk === "oer" || desk === "code") return "yale";
  if (desk === "research" || desk === "labs" || desk === "government") return "nih";
  return "yale";
}

export function catalogFilms(): NetworkHouse[] {
  const seen = new Set<string>();
  const out: NetworkHouse[] = [];
  for (const house of NETWORK) {
    const yt = house.youtubeId;
    if (!yt || seen.has(yt)) continue;
    seen.add(yt);
    out.push(house);
  }
  return out;
}

export function catalogPost(house: NetworkHouse, i: number): FeedPost | null {
  const yt = house.youtubeId;
  if (!yt) return null;
  const deskTag = `#${house.desk}`;
  const study = studyHouseForDesk(house.desk, house.id);
  return {
    id: `in-${yt}`,
    author: {
      name: house.name,
      username: slug(house.name),
      avatar: FACES[i % FACES.length] ?? FACE.kwesi,
    },
    caption: `${house.blurb} Source · ${SOURCE}.`,
    lane: "learn",
    mediaType: "video",
    mediaUrl: youtubeWatch(yt),
    posterUrl: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    youtubeId: yt,
    views: 4200 + i * 17,
    likes: 80 + i,
    comments: 12,
    shares: 6,
    isLiked: false,
    isSaved: false,
    isFollowing: true,
    hashtags: [deskTag, `#${study}`, "#catalog", `#${house.shelf.replace(/\s+/g, "").toLowerCase()}`],
    musicTitle: `${house.name} · ${SOURCE}`,
    teach: teachOf(house),
  };
}

export function catalogPack(): { posts: FeedPost[]; rows: IngestRow[] } {
  const posts: FeedPost[] = [];
  const rows: IngestRow[] = [];
  catalogFilms().forEach((house, i) => {
    const post = catalogPost(house, i);
    if (!post || !post.youtubeId) return;
    posts.push(post);
    rows.push({
      postId: post.id,
      youtubeId: post.youtubeId,
      title: house.name,
      house: house.name,
      author: house.name,
      stamp: post.teach.stamp,
      lane: "learn",
      url: post.mediaUrl,
    });
  });
  return { posts, rows };
}

export const CATALOG_POSTS = catalogPack().posts;
export const CATALOG_ROWS = catalogPack().rows;
