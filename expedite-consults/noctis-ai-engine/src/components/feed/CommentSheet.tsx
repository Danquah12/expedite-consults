import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { FeedComment } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { holdPlay } from "@/lib/playback";
import { formatCount } from "@/lib/format";
import { actor } from "@/lib/current-user";
import { discussion } from "@/lib/discuss";
import { readDiscussion } from "@/lib/discuss-api";
import { cn } from "@/lib/utils";

const NO_COMMENTS: FeedComment[] = [];

export function CommentSheet({ open, postId }: { open: boolean; postId: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const addComment = useFeedStore((s) => s.addComment);
  const post = useFeedStore((s) => s.posts.find((p) => p.id === postId));
  const extra = useFeedStore((s) => s.engage[postId]?.comments) ?? NO_COMMENTS;
  const list = [...(post?.commentsList ?? []), ...extra];
  const count = (post?.comments ?? 0) + extra.length;
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const me = actor();
  const talk = discussion(list.map((row) => ({ id: row.id, name: row.name, text: row.text, replyTo: row.replyTo })));
  const [read, setRead] = useState<{ viewpoints: string[]; misunderstandings: string[]; useful: string[] } | null>(null);

  useEffect(() => {
    if (!open || list.length < 4) return;
    let stop = false;
    const comments = list.slice(0, 40).map((row) => ({ name: row.name, text: row.text }));
    void readDiscussion({ data: { comments } })
      .then((next) => {
        if (!stop && next && "viewpoints" in next) setRead(next);
      })
      .catch(() => {
        if (!stop) setRead(null);
      });
    return () => {
      stop = true;
    };
  }, [open, postId, list.length]);

  useEffect(() => {
    if (!open) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    const y = window.scrollY;
    const lane = document.querySelector<HTMLElement>("[data-feed-lane]");
    const reel = document.querySelector<HTMLElement>(".reel-scroller");
    const laneTop = lane?.scrollTop ?? 0;
    const reelTop = reel?.scrollTop ?? 0;
    const root = document.documentElement;
    root.dataset.sheet = "1";
    holdPlay(60_000);
    const body = document.body;
    const prev = body.style.cssText;
    if (coarse) {
      body.style.position = "fixed";
      body.style.top = `-${y}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      if (reel) reel.style.overflow = "hidden";
    }
    return () => {
      body.style.cssText = prev;
      delete root.dataset.sheet;
      if (reel) reel.style.overflow = "";
      window.scrollTo(0, y);
      if (lane) lane.scrollTop = laneTop;
      if (reel) reel.scrollTop = reelTop;
      holdPlay(900);
    };
  }, [open]);

  function send() {
    const text = draft.trim();
    if (!text || !post) return;
    addComment(post.id, text, replyTo ?? undefined);
    setDraft("");
    setReplyTo(null);
  }

  return (
    <Dialog open={open} modal={false} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent
        className="flex max-h-[min(92dvh,680px)] flex-col overflow-hidden p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b border-border px-4 pb-3 pt-4 pr-12">
          <DialogTitle className="text-center font-display text-base font-semibold">Comments</DialogTitle>
          <p className="mt-0.5 text-center text-xs text-muted">{formatCount(count)}</p>
          {list.length ? (
            <div className="mt-3 rounded-2xl bg-elevated px-3 py-2 text-left text-xs leading-relaxed">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Discussion</p>
              <p className="mt-1">{talk.questions.length} questions · {talk.unanswered.length} unanswered · {talk.duplicates.length} asked more than once · {talk.resources.length} links</p>
              {talk.unanswered.slice(0, 3).map((row) => (
                <p key={row.id} className="mt-1">{row.text}</p>
              ))}
              {talk.resources.map((row) => (
                <a key={row.href} href={row.href} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-primary">{row.href}</a>
              ))}
              {read?.viewpoints.length ? <p className="mt-2">Viewpoints · {read.viewpoints.join(" · ")}</p> : null}
              {read?.misunderstandings.length ? <p className="mt-1">Misunderstandings · {read.misunderstandings.join(" · ")}</p> : null}
              {read?.useful.length ? <p className="mt-1">Useful · {read.useful.join(" · ")}</p> : null}
              {list.length < 4 ? <p className="mt-1 text-muted">Too few comments to name a viewpoint.</p> : null}
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {list.length ? (
            list.map((c) => (
              <div key={c.id} className="flex gap-2">
                <img src={c.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="rounded-2xl bg-elevated px-3 py-2">
                    <p className="text-sm font-semibold leading-tight">{c.name}</p>
                    {c.replyTo ? <p className="text-[11px] text-muted">Replying to {c.replyTo}</p> : null}
                    <p className="text-sm leading-snug">{c.text}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 px-2 text-xs font-semibold text-muted">
                    <span>Just now</span>
                    <button
                      type="button"
                      className={cn(liked[c.id] && "text-primary")}
                      onClick={() => setLiked((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                    >
                      Like
                    </button>
                    <button type="button" onClick={() => setReplyTo(c.name)}>
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted">No comments yet. Be the first.</p>
          )}
        </div>
        <form
          className="border-t border-border px-3 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          {replyTo ? (
            <p className="mb-1 flex items-center justify-between px-1 text-[11px] text-muted">
              Replying to {replyTo}
              <button type="button" className="font-semibold" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <img src={me.avatarUrl} alt="" className="size-8 shrink-0 rounded-full object-cover" />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo}…` : "Write a comment…"}
              aria-label="Write a comment"
              className="min-h-10 min-w-0 flex-1 rounded-full bg-elevated px-4 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send comment"
              className="grid size-9 shrink-0 place-items-center rounded-full text-primary disabled:text-muted"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}