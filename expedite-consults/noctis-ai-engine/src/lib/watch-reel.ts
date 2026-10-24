import { useFeedStore } from "@/lib/feed-store";

export function useWatchReel() {
  const openReel = useFeedStore((s) => s.openReel);
  return (id: string) => openReel(id);
}
