import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export const voipReady = createServerFn({ method: "GET" }).handler(async () => {
  const { voipConfigured } = await import("@/lib/voip.server");
  return { ready: voipConfigured() };
});

export const voipToken = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { mintVoiceToken, voipConfigured } = await import("@/lib/voip.server");
    if (!voipConfigured()) throw new Error("Internet calling is not turned on yet.");
    const token = mintVoiceToken(context.userId);
    if (!token) throw new Error("Internet calling is not turned on yet.");
    return { token };
  });
