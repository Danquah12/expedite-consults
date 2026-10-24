import { useState } from "react";
import type { FeedPost } from "@/lib/feed-data";
import { addFilmMark, clockLabel, filmMarks } from "@/lib/film-marks";
import { useFeedStore } from "@/lib/feed-store";

export function FilmPass({ post, at }: { post: FeedPost; at: number }) {
  const [marks, setMarks] = useState(() => filmMarks(post.id));
  const learn = (post.teach.hook || post.caption || "").replace(/\s+/g, " ").trim().slice(0, 140);
  const term = post.teach.stamp?.trim();
  const before = at < 3;

  return (
    <div className="pointer-events-auto mt-1.5 max-w-full rounded-xl bg-black/55 px-2.5 py-2 text-white">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">{before ? "Before · What you'll learn" : "During"}</p>
      <p className="mt-0.5 text-[11px] leading-snug">{learn || "This film has no teaching line yet."}</p>
      {!before && term ? <p className="mt-1 text-[11px] leading-snug text-white/80">Word on the film: {term}. A definition is not added unless the caption states it.</p> : null}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMarks(addFilmMark(post.id, at));
          }}
          className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold"
        >
          Bookmark {clockLabel(at)}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            useFeedStore.getState().openModal({ type: "video", postId: post.id });
          }}
          className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold"
        >
          Ask Noctis about this
        </button>
      </div>
      {marks.length ? (
        <p className="mt-1 text-[10px] text-white/70">Bookmarks: {marks.map((mark) => clockLabel(mark.at)).join(" · ")}</p>
      ) : null}
    </div>
  );
}
