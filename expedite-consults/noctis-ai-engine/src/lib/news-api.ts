import { createServerFn } from "@tanstack/react-start";

export type NewsStory = { id: string; videoId: string; title: string; publishedAt: string; live?: boolean };

export const loadLiveNews = createServerFn({ method: "GET" }).handler(async (): Promise<NewsStory[]> => {
  try {
    const { resolveLiveNews } = await import("@/lib/news-live.server");
    return await resolveLiveNews();
  } catch {
    return [];
  }
});
