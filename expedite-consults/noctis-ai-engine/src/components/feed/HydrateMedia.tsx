import { useEffect } from "react";
import { getClip } from "@/lib/media-persist";
import { useFeedStore } from "@/lib/feed-store";

export function HydrateMedia() {
  useEffect(() => {
    const { posts, stories } = useFeedStore.getState();
    for (const post of posts) {
      if (post.mediaUrl) continue;
      void getClip(post.id).then((url) => {
        if (!url) return;
        useFeedStore.setState({
          posts: useFeedStore.getState().posts.map((p) => (p.id === post.id ? { ...p, mediaUrl: url } : p)),
        });
      });
    }
    for (const story of stories) {
      if (story.mediaUrl) continue;
      void getClip(story.id).then((url) => {
        if (!url) return;
        useFeedStore.setState({
          stories: useFeedStore.getState().stories.map((s) => (s.id === story.id ? { ...s, mediaUrl: url } : s)),
        });
      });
    }
    if (window.location.hash) {
      const node = document.getElementById(window.location.hash.slice(1));
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  return null;
}
