import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const listCreatorWorks = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublished } = await import("@/lib/creator-market.server");
  return listPublished();
});

export const listMyWorks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listMine } = await import("@/lib/creator-market.server");
    return listMine(context.userId);
  });

export const draftCreatorWork = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind?: string; title?: string; body?: string }) => ({
    kind: String(input?.kind ?? "").slice(0, 20),
    title: String(input?.title ?? "").replace(/\s+/g, " ").trim().slice(0, 140),
    body: String(input?.body ?? "").replace(/\s+/g, " ").trim().slice(0, 2000),
  }))
  .handler(async ({ context, data }) => {
    if (!data.title || !data.body) throw new Error("A title and the work itself are required.");
    const { saveDraft } = await import("@/lib/creator-market.server");
    const id = await saveDraft(context.userId, data.kind, data.title, data.body);
    return { id, status: "draft" as const };
  });

export const publishCreatorWork = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: number }) => ({ id: Number(input?.id) || 0 }))
  .handler(async ({ context, data }) => {
    const { publishMine } = await import("@/lib/creator-market.server");
    await publishMine(context.userId, data.id);
    return { ok: true as const };
  });
