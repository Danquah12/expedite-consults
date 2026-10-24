import { useEffect } from "react";
import { auditYoutube, pullClinic } from "@/lib/ingest-api";
import { pullSlot } from "@/lib/ingest-sources";
import { ingestSalt } from "@/lib/shuffle";
import { useFeedStore } from "@/lib/feed-store";

let pulling = false;

async function runPull() {
  if (pulling) return;
  pulling = true;
  try {
    const state = useFeedStore.getState();
    const seen = state.posts.map((p) => p.youtubeId).filter((id): id is string => Boolean(id)).slice(0, 800);
    const res = await pullClinic({ data: { slot: pullSlot(), salt: ingestSalt() ^ seen.length, seen } });
    if (!res.ok) return;
    useFeedStore.getState().absorbIngest(res.posts, res.rows);
    const ids = useFeedStore
      .getState()
      .posts.map((post) => post.youtubeId)
      .filter((id): id is string => Boolean(id))
      .slice(0, 48);
    if (!ids.length) return;
    const audit = await auditYoutube({ data: { ids } });
    for (const id of audit.blocked) useFeedStore.getState().dropGatedYoutube(id);
  } finally {
    pulling = false;
  }
}

export function HydrateIngest() {
  useEffect(() => {
    let dead = false;
    const kick = () => {
      if (dead) return;
      useFeedStore.getState().syncCatalog();
      void runPull();
    };
    const idle = window.setTimeout(kick, 0);
    return () => {
      dead = true;
      window.clearTimeout(idle);
    };
  }, []);
  return null;
}