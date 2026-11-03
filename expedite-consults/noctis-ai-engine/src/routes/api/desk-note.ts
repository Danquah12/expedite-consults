import { createFileRoute } from "@tanstack/react-router";

/**
 * Desk Note -> Noctis bridge.
 *
 *   POST /api/desk-note   { question: string, history?: {role,content}[] }
 *   GET  /api/desk-note   status + what Noctis knows about Desk Note
 *   OPTIONS               CORS preflight
 *
 * Desk Note calls this from the browser, so the user never leaves Desk Note.
 * Only origins in DESK_NOTE_ORIGINS (comma separated) may call it from a browser.
 */

const DEFAULT_ORIGINS = ["https://desk-note-lime.vercel.app", "http://localhost:5173", "http://localhost:8080"];

function allowedOrigins(): string[] {
  const env = (process.env.DESK_NOTE_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return env.length ? env : DEFAULT_ORIGINS;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const ok = origin && allowedOrigins().includes(origin);
  return {
    "cache-control": "no-store",
    vary: "Origin",
    ...(ok
      ? {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET, POST, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-max-age": "600",
        }
      : {}),
  };
}

const hits = new Map<string, number[]>();
function tooMany(key: string, limit = 20, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const prev = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (prev.length >= limit) return true;
  prev.push(now);
  hits.set(key, prev);
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return false;
}

export const Route = createFileRoute("/api/desk-note")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request) }),

      GET: async ({ request }) => {
        const { DESK_NOTE_DOCS, DESK_NOTE_URL } = await import("@/lib/desk-note-knowledge");
        return Response.json(
          {
            ok: true,
            app: "Desk Note",
            url: DESK_NOTE_URL,
            answeredBy: "Noctis",
            topics: DESK_NOTE_DOCS.map((d) => ({ id: d.id, title: d.title, asOf: d.asOf })),
          },
          { headers: corsHeaders(request) },
        );
      },

      POST: async ({ request }) => {
        const headers = corsHeaders(request);
        const origin = request.headers.get("origin");
        if (origin && !allowedOrigins().includes(origin)) {
          return Response.json({ error: "This site is not allowed to ask Noctis." }, { status: 403, headers });
        }
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
        if (tooMany(`desk-note:${ip}`)) {
          return Response.json({ error: "Too many questions. Wait a few minutes and try again." }, { status: 429, headers });
        }

        const body = (await request.json().catch(() => null)) as {
          question?: unknown;
          history?: { role?: unknown; content?: unknown }[];
        } | null;
        const question = typeof body?.question === "string" ? body.question.trim().slice(0, 800) : "";
        if (!question) return Response.json({ error: "Write a question first." }, { status: 400, headers });

        const { deskNoteContext } = await import("@/lib/desk-note-knowledge");
        const { context, sources } = await deskNoteContext(question);

        const turns: { role: "user" | "assistant"; content: string }[] = [];
        if (Array.isArray(body?.history)) {
          for (const t of body.history.slice(-6)) {
            if ((t?.role === "user" || t?.role === "assistant") && typeof t.content === "string" && t.content.trim()) {
              turns.push({ role: t.role, content: t.content.trim().slice(0, 1200) });
            }
          }
        }
        turns.push({ role: "user", content: question });

        try {
          const { vibeReply } = await import("@/lib/noctis-desk.server");
          let baked = "";
          try {
            const keyMod = await import("virtual:openai-key");
            baked = typeof keyMod.OPENAI_API_KEY === "string" ? keyMod.OPENAI_API_KEY : "";
          } catch {
            baked = "";
          }
          const reply = await vibeReply(turns, baked, { skill: "talk", depth: "plain", language: "English", context });
          if ("text" in reply && reply.text.trim()) {
            return Response.json({ answer: reply.text, answeredBy: "Noctis", sources }, { headers });
          }
        } catch {
          /* fall through to the grounded fallback below */
        }

        // Grounded fallback: if the model path fails, return the matching notes verbatim.
        const { retrieveDeskNoteDocs } = await import("@/lib/desk-note-knowledge");
        const docs = retrieveDeskNoteDocs(question, 2);
        return Response.json(
          {
            answer: docs.map((d) => `${d.title}: ${d.text}`).join("\n\n"),
            answeredBy: "Noctis (notes only)",
            sources,
          },
          { headers },
        );
      },
    },
  },
});
