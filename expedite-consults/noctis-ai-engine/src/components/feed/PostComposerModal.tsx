import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaFileField } from "@/components/feed/MediaFileField";
import { ME } from "@/lib/current-user";
import { inspectLocalFile, isPickingMedia, takeInbound } from "@/lib/local-media";
import { parseYoutubeId, youtubePoster, youtubeWatch } from "@/lib/youtube";
import { parseVimeoId, probeVimeoPublic, vimeoWatch } from "@/lib/vimeo";
import { parsePreziEmbed } from "@/lib/prezi";
import { LANE_LABEL, type VibeLane } from "@/lib/noctis";
import { useFeedStore } from "@/lib/feed-store";
import type { FeedPost, StoryItem } from "@/lib/feed-data";

const LANES: VibeLane[] = ["learn", "laugh", "local"];

export function PostComposerModal({ open, quoteOf, pick }: { open: boolean; quoteOf?: string; pick?: boolean }) {
  const closeModal = useFeedStore((s) => s.closeModal);
  const addPost = useFeedStore((s) => s.addPost);
  const addStory = useFeedStore((s) => s.addStory);
  const posts = useFeedStore((s) => s.posts);
  const quoted = quoteOf ? posts.find((p) => p.id === quoteOf) : undefined;
  const [caption, setCaption] = useState(quoted ? `Echo of @${quoted.author.username}: ` : "");
  const [lane, setLane] = useState<VibeLane>("learn");
  const [kind, setKind] = useState<"image" | "video" | null>(null);
  const [url, setUrl] = useState("");
  const [link, setLink] = useState("");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [vimeoId, setVimeoId] = useState<string | null>(null);
  const [vimeoPoster, setVimeoPoster] = useState<string | undefined>();
  const [preziEmbed, setPreziEmbed] = useState<string | null>(null);
  const [speech, setSpeech] = useState("");
  const [asStory, setAsStory] = useState(false);

  useEffect(() => {
    if (!open) return;
    const inbound = takeInbound();
    if (!inbound) return;
    void inspectLocalFile(inbound).then((inspected) => {
      if (!inspected) return;
      setKind(inspected.kind);
      setUrl(inspected.url);
      setYoutubeId(null);
      setVimeoId(null);
      setPreziEmbed(null);
      setLink("");
    });
  }, [open, pick]);

  function applyLink(value: string) {
    setLink(value);
    const id = parseYoutubeId(value);
    if (id) {
      setYoutubeId(id);
      setVimeoId(null);
      setPreziEmbed(null);
      setKind("video");
      setUrl(youtubePoster(id));
      return;
    }
    if (parseVimeoId(value)) {
      setYoutubeId(null);
      setPreziEmbed(null);
      void probeVimeoPublic(value).then((ok) => {
        if (!ok) {
          setVimeoId(null);
          return;
        }
        setVimeoId(ok.id);
        setVimeoPoster(ok.poster);
        setKind("video");
        setUrl(ok.poster ?? "");
      });
      return;
    }
    const prezi = parsePreziEmbed(value);
    if (prezi) {
      setPreziEmbed(prezi);
      setYoutubeId(null);
      setVimeoId(null);
      setKind("video");
      setUrl(prezi);
      return;
    }
    setYoutubeId(null);
    setVimeoId(null);
    setPreziEmbed(null);
  }

  function publish() {
    const id = `u-${Date.now()}`;
    const hook = caption.trim().slice(0, 48) || "Your Spark";
    const post: FeedPost = {
      id,
      author: { name: ME.name, username: ME.username, avatar: ME.avatarUrl },
      caption: caption.trim() || "A Spark from the hall.",
      lane,
      mediaType: kind ?? "image",
      mediaUrl: youtubeId ? youtubeWatch(youtubeId) : vimeoId ? vimeoWatch(vimeoId) : preziEmbed ?? url,
      posterUrl: youtubeId ? youtubePoster(youtubeId) : vimeoPoster,
      youtubeId: youtubeId ?? undefined,
      vimeoId: vimeoId ?? undefined,
      preziEmbed: preziEmbed ?? undefined,
      speech: preziEmbed ? speech.trim() || undefined : undefined,
      views: 1,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      isFollowing: false,
      hashtags: youtubeId || vimeoId ? ["#clinic", "#learn"] : ["#clinic"],
      musicTitle: youtubeId || vimeoId ? "ConnectLn lecture" : preziEmbed ? "Training deck" : undefined,
      teach: {
        hook,
        stamp: "Hall week",
        prompt: "What should stick from this Spark?",
        options: [
          { id: "a", label: hook, ok: true },
          { id: "b", label: "Whatever the comments say", ok: false },
          { id: "c", label: "Skip the drill", ok: false },
        ],
      },
    };
    if (url || youtubeId || preziEmbed) addPost(post);
    else addPost({ ...post, mediaType: "image", mediaUrl: ME.avatarUrl });
    if (asStory && url && !youtubeId && !preziEmbed) {
      const story: StoryItem = {
        id: `st-${id}`,
        username: ME.username,
        displayName: "Your Spark",
        avatar: ME.avatarUrl,
        mediaUrl: url,
        mediaType: kind ?? "image",
        caption: caption.trim(),
        isUser: true,
      };
      addStory(story);
    }
    setCaption("");
    setUrl("");
    setKind(null);
    setLink("");
    setYoutubeId(null);
    setPreziEmbed(null);
    setSpeech("");
    closeModal();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPickingMedia()) closeModal();
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => {
          if (isPickingMedia()) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isPickingMedia()) e.preventDefault();
        }}
        onFocusOutside={(e) => {
          if (isPickingMedia()) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Post a Spark</DialogTitle>
          <DialogDescription>
            Paste a lecture link, including a Prezi Live room, or attach the MP4 you exported.
          </DialogDescription>
        </DialogHeader>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          placeholder="The one thing that should stick."
          className="w-full resize-none rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
        />
        <input
          value={link}
          onChange={(e) => applyLink(e.target.value)}
          placeholder="Paste a YouTube, Vimeo, or Prezi Live link"
          className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
        />
        {preziEmbed ? (
          <textarea
            value={speech}
            onChange={(e) => setSpeech(e.target.value)}
            rows={4}
            placeholder="Speech for this presentation. It is read aloud while the Prezi is open."
            className="mt-3 w-full resize-none rounded-xl bg-elevated px-3 py-2 text-sm outline-none"
          />
        ) : null}
        <div className="mt-3 flex gap-2">
          {LANES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLane(l)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${lane === l ? "bg-primary text-primary-fg" : "bg-elevated text-muted"}`}
            >
              {LANE_LABEL[l]}
            </button>
          ))}
        </div>
        {youtubeId ? (
          <div className="clip-plate mt-3 overflow-hidden rounded-xl bg-bg">
            <img src={youtubePoster(youtubeId)} alt="" className="max-h-48 w-full object-cover" />
            <p className="px-3 py-2 text-[11px] text-muted">On ConnectLn · add the Echo, then post</p>
          </div>
        ) : preziEmbed ? (
          <div className="mt-3 overflow-hidden rounded-xl bg-elevated px-3 py-8 text-center">
            <p className="text-sm font-semibold">Deck ready</p>
            <p className="mt-1 text-[11px] text-muted">Must be public or “anyone with the link”. Add the Echo, then post.</p>
          </div>
        ) : url ? (
          <div className="clip-plate mt-3 overflow-hidden rounded-xl bg-bg">
            {kind === "video" ? (
              <video src={url} controls className="max-h-48 w-full object-cover" />
            ) : (
              <img src={url} alt="" className="max-h-48 w-full object-cover" />
            )}
          </div>
        ) : (
          <label
            htmlFor="composer-file"
            className="mt-3 flex h-24 cursor-pointer items-center justify-center rounded-xl bg-elevated text-xs font-semibold text-muted"
          >
            Attach photo or video
          </label>
        )}
        <MediaFileField
          id="composer-file"
          onPicked={(_file, nextKind, nextUrl) => {
            setKind(nextKind);
            setUrl(nextUrl);
            setYoutubeId(null);
            setPreziEmbed(null);
            setLink("");
          }}
        />
        <label className="mt-3 flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={asStory} onChange={(e) => setAsStory(e.target.checked)} disabled={Boolean(youtubeId || preziEmbed)} />
          Also add to stories
        </label>
        <Button className="mt-4 w-full" onClick={publish}>
          Post Spark
        </Button>
      </DialogContent>
    </Dialog>
  );
}
