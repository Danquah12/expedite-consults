import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { clipIdOf, clipNodes, focusSkipped, isIOS, kickFocusedPlay, meetingHeld, observeFocus, pickVisiblePost, playHeld, silenceStage, wantMute } from "@/lib/playback";
import { loadPlaybackTools, notePlayback, playbackTools } from "@/lib/playback-metrics";
import { noteEvent } from "@/lib/learn-events";
import { ytCommand } from "@/lib/youtube";
import { useFeedStore } from "@/lib/feed-store";

export function FeedPlaybackSync() {
  const librarySize = useFeedStore((s) => s.posts.length);
  const playingId = useFeedStore((s) => s.playingId);
  const pipId = useFeedStore((s) => s.pipId);
  const setPlayingId = useFeedStore((s) => s.setPlayingId);
  const isMuted = useFeedStore((s) => s.isMuted);
  const soundUnlocked = useFeedStore((s) => s.soundUnlocked);
  const noteWatch = useFeedStore((s) => s.noteWatch);
  const surface = useFeedStore((s) => s.surface);
  const viewStyle = useFeedStore((s) => s.viewStyle);
  const modalType = useFeedStore((s) => s.modal.type);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const onDesk = path.startsWith("/desk");
  const onReels = path.startsWith("/reels");
  const watched = useRef(new Set<string>());

  useEffect(() => {
    loadPlaybackTools();
  }, []);

  useEffect(() => {
    if (onDesk || onReels || viewStyle === "theater") return;
    let stop: (() => void) | undefined;

    const take = (id: string | null) => {
      if (meetingHeld()) {
        silenceStage();
        return;
      }
      if (!id) return;
      if (playbackTools().play_on_focus === "off") return;
      if (focusSkipped(id)) return;
      const st = useFeedStore.getState();
      if (st.modal.type === "story" || st.modal.type === "live") return;
      if (st.pipId) return;
      if (playHeld() && st.playingId && id !== st.playingId) return;
      if (id !== st.playingId) {
        setPlayingId(id);
        notePlayback("focus");
        const post = st.posts.find((row) => row.id === id);
        if (post) noteEvent("watch", post.teach.stamp || post.teach.hook);
      }
      window.setTimeout(() => kickFocusedPlay(), 40);
      window.setTimeout(() => kickFocusedPlay(), 280);
    };

    const attach = () => {
      stop?.();
      const nodes = clipNodes();
      if (nodes.length === 0) {
        const first = pickVisiblePost();
        if (first) take(first);
        return;
      }
      stop = observeFocus(nodes, clipIdOf, take);
      const visible = pickVisiblePost();
      if (visible) take(visible);
    };

    let raf = 0;
    let delay = 0;
    const attachSoon = () => {
      if (delay) return;
      delay = window.setTimeout(() => {
        delay = 0;
        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(() => {
          raf = 0;
          attach();
        });
      }, 180);
    };

    attach();
    const phoneKicks = isIOS()
      ? [500, 1200, 2200].map((ms) =>
          window.setTimeout(() => {
            const st = useFeedStore.getState();
            if (!st.playingId) {
              const id = pickVisiblePost();
              if (id) take(id);
            }
            kickFocusedPlay();
          }, ms),
        )
      : [];
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        const id = pickVisiblePost();
        if (id) take(id);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const mo = new MutationObserver((records) => {
      if (records.every((r) => {
        const t = r.target as Element;
        return Boolean(t.closest?.("iframe, [data-youtube], [data-pip]"));
      })) return;
      attachSoon();
    });
    const lane = document.querySelector("[data-feed-lane]") ?? document.querySelector("[data-feed-stream]");
    mo.observe(lane ?? document.body, { childList: true, subtree: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      if (delay) window.clearTimeout(delay);
      phoneKicks.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
      stop?.();
    };
  }, [librarySize, surface, viewStyle, setPlayingId, onDesk, onReels]);

  useEffect(() => {
    if (onDesk) return;
    if (meetingHeld()) {
      silenceStage();
      return;
    }
    document.querySelectorAll<HTMLVideoElement>("video[data-story-still]").forEach((node) => {
      node.pause();
      node.muted = true;
    });
    if (modalType === "story" || modalType === "live" || modalType === "hall-drill") {
      document.querySelectorAll<HTMLIFrameElement>("article[id^='post-'] iframe").forEach((frame) => {
        ytCommand(frame, "pauseVideo");
        ytCommand(frame, "mute");
      });
      document.querySelectorAll<HTMLMediaElement>("article[id^='post-'] video, article[id^='post-'] audio").forEach((node) => {
        node.pause();
        node.muted = true;
      });
      return;
    }
    if (playbackTools().one_player !== "off") {
      document.querySelectorAll<HTMLIFrameElement>("article[id^='post-'] iframe, [data-youtube] iframe").forEach((frame) => {
        if (frame.closest("[data-pip]") || frame.closest("[data-hall-stage]")) return;
        const id =
          frame.closest("article")?.id.replace(/^post-/, "") ??
          frame.closest("[data-youtube]")?.getAttribute("data-youtube");
        if (id === playingId && id !== pipId) return;
        ytCommand(frame, "pauseVideo");
        ytCommand(frame, "mute");
      });
    }
    const nodes = document.querySelectorAll<HTMLMediaElement>("article[id^='post-'] video, article[id^='post-'] audio");
    const mute = wantMute();
    nodes.forEach((node) => {
      const article = node.closest("article");
      const id = article?.id.replace(/^post-/, "");
      node.playbackRate = 1;
      node.volume = 1;
      if (id === playingId && id !== pipId) {
        node.muted = true;
        if (node.paused) {
          void node
            .play()
            .then(() => {
              node.muted = mute;
              if (id && !watched.current.has(id)) {
                watched.current.add(id);
                noteWatch(id);
              }
            })
            .catch(() => {
              node.muted = true;
              void node.play().catch(() => undefined);
            });
        } else {
          node.muted = mute;
        }
      } else {
        node.pause();
        node.muted = true;
      }
    });
    if (playbackTools().preload_next !== "off" && playingId) {
      const articles = [...document.querySelectorAll<HTMLElement>("article[id^='post-']")];
      const at = articles.findIndex((el) => el.id === `post-${playingId}`);
      const next = articles[at + 1]?.querySelector("video");
      if (next) next.preload = "auto";
    }
    const t = window.setTimeout(() => kickFocusedPlay(), 200);
    const t2 = window.setTimeout(() => kickFocusedPlay(), 700);
    const t3 = window.setTimeout(() => kickFocusedPlay(), 1400);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [playingId, pipId, noteWatch, modalType, onDesk]);

  useEffect(() => {
    if (!playingId) return;
    const mute = wantMute();
    const root = document.getElementById(`post-${playingId}`);
    root?.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.closest("[data-live]")) return;
      if (mute) {
        ytCommand(frame, "mute");
        return;
      }
      ytCommand(frame, "unMute");
      ytCommand(frame, "setVolume", [100]);
    });
    root?.querySelectorAll<HTMLMediaElement>("video, audio").forEach((node) => {
      if (node.hasAttribute("data-story-still")) return;
      node.muted = mute;
      node.volume = 1;
    });
  }, [isMuted, soundUnlocked, playingId]);

  return null;
}
