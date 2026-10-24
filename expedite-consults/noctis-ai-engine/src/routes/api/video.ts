import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { kind?: unknown; title?: string; caption?: string; author?: string; youtubeId?: string; question?: string } | null;
        try {
          const mind = await import("@/lib/video-mind.server");
          if (body?.kind === "lesson") {
            const reply = await mind.videoLesson({
              title: String(body.title || "").slice(0, 180),
              caption: String(body.caption || "").slice(0, 1200),
              author: String(body.author || "").slice(0, 80),
              youtubeId: String(body.youtubeId || "").slice(0, 11),
            });
            return Response.json(reply, { headers: { "cache-control": "no-store" } });
          }
          if (body?.kind === "research") {
            const reply = await mind.researchReport(String(body.question || "").slice(0, 500));
            return Response.json(reply, { headers: { "cache-control": "no-store" } });
          }
          if (body?.kind === "tutor") {
            const reply = await mind.tutorReply([{ role: "user", content: String(body.question || "").slice(0, 500) }]);
            return Response.json(reply, { headers: { "cache-control": "no-store" } });
          }
          if (body?.kind === "make") {
            const { makeLesson } = await import("@/lib/lesson-make.server");
            const reply = await makeLesson(String(body.question || "").slice(0, 500));
            return Response.json(reply, { headers: { "cache-control": "no-store" } });
          }
          return Response.json({ error: "Unknown request." });
        } catch {
          return Response.json({ error: "Vibe could not finish that." });
        }
      },
    },
  },
});
