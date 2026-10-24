import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CREWS } from "@/lib/feed-data";
import { PEOPLE } from "@/lib/directory";
import { clinicUrl, instagramHint, NETWORKS, shareLine, shareMessage, brandFiles } from "@/lib/share";
import { useFeedStore } from "@/lib/feed-store";

export function SendSheet({ open, postId }: { open: boolean; postId: string }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const posts = useFeedStore((s) => s.posts);
  const sendClip = useFeedStore((s) => s.sendClip);
  const post = posts.find((p) => p.id === postId);
  const [q, setQ] = useState("");
  const url = clinicUrl(postId, post?.youtubeId);
  const line = shareLine(post?.caption ?? "");
  const needle = q.trim().toLowerCase();
  const people = useMemo(
    () => PEOPLE.filter((p) => !needle || p.name.toLowerCase().includes(needle) || p.username.toLowerCase().includes(needle)).slice(0, 8),
    [needle],
  );
  const crews = useMemo(
    () => CREWS.filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.id.toLowerCase().includes(needle)),
    [needle],
  );

  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const lane = document.querySelector("[data-feed-lane]");
    const laneTop = lane instanceof HTMLElement ? lane.scrollTop : 0;
    const putBack = () => {
      window.scrollTo(0, y);
      if (lane instanceof HTMLElement) lane.scrollTop = laneTop;
    };
    putBack();
    const frame = window.requestAnimationFrame(putBack);
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function go(href: string, label: string) {
    sendClip(postId);
    window.open(href, "_blank", "noopener,noreferrer");
    toast.success(`Opening ${label}`);
    closeModal();
  }

  async function instagram() {
    const text = instagramHint(url, line);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    sendClip(postId);
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    toast.success("Caption copied — paste it in Instagram");
    closeModal();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareMessage(post?.caption ?? "", url));
      toast.success("Link copied");
    } catch {
      toast.message(url);
    }
    sendClip(postId);
  }

  async function thisPhone() {
    const files = await brandFiles();
    if (typeof navigator.share === "function") {
      try {
        const data: ShareData = { title: "Noctis Clinic", text: line, url };
        if (files) data.files = files;
        await navigator.share(data);
        sendClip(postId);
        closeModal();
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await copy();
  }

  return (
    <Dialog open={open} modal={false} onOpenChange={(next) => !next && closeModal()}>
      <DialogContent
        className="max-h-[min(92dvh,640px)] overflow-y-auto"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="font-display text-lg font-semibold">Send this clip</DialogTitle>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-elevated">
          <div className="flex gap-3 p-2">
            <img src="/og.jpg" alt="Noctis Clinic" className="size-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 py-0.5">
              <p className="text-sm font-semibold">Noctis Clinic</p>
              <p className="text-xs text-muted">Watch a Spark. Pass a drill. Take the stamp.</p>
              <p className="mt-1 truncate text-[11px] text-muted">{url.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
          <p className="border-t border-border px-3 py-2 text-sm">{line}</p>
        </div>
        <button
          type="button"
          onClick={() => void thisPhone()}
          className="mt-4 w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-fg"
        >
          Share from this phone
        </button>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {NETWORKS.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.href(url, line), n.label)}
              className="rounded-2xl bg-elevated px-2 py-3 text-xs font-semibold hover:bg-bg"
            >
              {n.label}
            </button>
          ))}
          <button type="button" onClick={() => void instagram()} className="rounded-2xl bg-elevated px-2 py-3 text-xs font-semibold hover:bg-bg">
            Instagram
          </button>
        </div>
        <button type="button" onClick={() => void copy()} className="mt-2 w-full rounded-full bg-elevated py-2.5 text-xs font-semibold">
          Copy link
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a person or crew"
          className="mt-4 w-full rounded-full bg-elevated px-3 py-2 text-xs outline-none"
        />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted">People</p>
        <ul className="mt-1 space-y-1">
          {people.map((p) => (
            <li key={p.username}>
              <button
                type="button"
                onClick={() => {
                  sendClip(postId, `@${p.username}`);
                  toast.success(`Sent to ${p.name}`);
                  closeModal();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-elevated"
              >
                <img src={p.avatar} alt="" className="size-8 rounded-full object-cover" />
                <span>
                  <span className="block text-xs font-semibold">{p.name}</span>
                  <span className="block text-[11px] text-muted">@{p.username}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">Crews</p>
        <ul className="mt-1 space-y-1">
          {crews.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  sendClip(postId, `#${c.id}`);
                  toast.success(`Sent to ${c.name}`);
                  closeModal();
                }}
                className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-elevated"
              >
                <span className="text-xs font-semibold">{c.name}</span>
                <span className="text-[11px] text-muted">#{c.id}</span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
