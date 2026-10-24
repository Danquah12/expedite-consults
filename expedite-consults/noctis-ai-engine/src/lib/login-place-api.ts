import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const stampWhere = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { lat?: number; lng?: number } | undefined) => ({
    lat: typeof input?.lat === "number" ? input.lat : undefined,
    lng: typeof input?.lng === "number" ? input.lng : undefined,
  }))
  .handler(async ({ context, data }) => {
    const { recordLoginPlace } = await import("@/lib/login-place.server");
    await recordLoginPlace(context.userId, "login", data);
    return { ok: true as const };
  });

export const noteFailedSignIn = createServerFn({ method: "POST" })
  .validator((input: { email?: string; door?: string; reason?: string }) => ({
    email: String(input?.email ?? "").trim().toLowerCase().slice(0, 160),
    door: input?.door === "desk" ? ("desk" as const) : ("clinic" as const),
    reason: String(input?.reason ?? "Sign-in did not open").replace(/\s+/g, " ").trim().slice(0, 180),
  }))
  .handler(async ({ data }) => {
    const { recordFailedSignIn } = await import("@/lib/login-place.server");
    await recordFailedSignIn(data);
    return { ok: true as const };
  });
