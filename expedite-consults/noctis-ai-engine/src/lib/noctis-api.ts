import { createServerFn } from "@tanstack/react-start";
import { noctisSkill, type NoctisSkillId } from "@/lib/noctis-skills";
import { clipTurn, retainSources } from "@/lib/noctis-hard";

export type VibeTurn = { role: "user" | "assistant"; content: string; images?: string[] };

function cleanImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  const images: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(item)) {
      if (item.length > 1_400_000) continue;
    } else if (!(/^https:\/\/\S+$/i.test(item) && item.length < 800 && !/\.(mp4|webm|mov)(\?|$)/i.test(item))) continue;
    images.push(item);
    if (images.length >= 2) break;
  }
  return images;
}

export const askNoctis = createServerFn({ method: "POST" })
  .validator((input: { turns?: VibeTurn[]; desk?: unknown; think?: unknown; code?: unknown; skill?: unknown; depth?: unknown; level?: unknown; context?: unknown; language?: unknown }) => {
    const turns: VibeTurn[] = [];
    if (Array.isArray(input?.turns)) {
      for (const turn of input.turns) {
        if (!turn || (turn.role !== "user" && turn.role !== "assistant") || typeof turn.content !== "string") continue;
        const content = clipTurn(turn.role, turn.content);
        const images = turn.role === "user" ? cleanImages(turn.images) : [];
        if (!content && !images.length) continue;
        turns.push({ role: turn.role, content: content || "Look at the uploaded image.", ...(images.length ? { images } : {}) });
      }
    }
    const picked = noctisSkill(typeof input?.skill === "string" ? input.skill : "talk");
    const levels = ["beginner", "intermediate", "advanced", "expert"] as const;
    const level = levels.find((item) => item === input?.level) ?? "beginner";
    return {
      turns: retainSources(turns),
      desk: input?.desk === "study" ? ("study" as const) : ("chat" as const),
      think: input?.think === true,
      code: input?.code === true,
      skill: picked.id as NoctisSkillId,
      depth: input?.depth === "deep" ? ("deep" as const) : ("plain" as const),
      level,
      context: typeof input?.context === "string" ? input.context.slice(0, 1800) : "",
      language: typeof input?.language === "string" ? input.language.trim().slice(0, 40) : "English",
    };
  })
  .handler(async ({ data }) => {
    if (!data.turns.some((turn) => turn.role === "user")) return { error: "Write a question first." };
    try {
      const { getSessionUser } = await import("@/lib/auth/verify.server");
      const who = await getSessionUser();
      const asked = [...data.turns].reverse().find((turn) => turn.role === "user");
      if (who && asked?.content) {
        const { recordActivity } = await import("@/lib/activity.server");
        await recordActivity({
          userId: who.id,
          action: "vibe",
          detail: asked.content.replace(/\s+/g, " ").trim().slice(0, 180),
          surface: data.desk,
        });
      }
    } catch {
      /* asking Vibe still works if the trail cannot be written */
    }
    const { vibeReply } = await import("@/lib/noctis-desk.server");
    const { callerKey, guardRate } = await import("@/lib/security.server");
    let whoId = "";
    try {
      const { getSessionUser } = await import("@/lib/auth/verify.server");
      whoId = (await getSessionUser())?.id || "";
    } catch {
      whoId = "";
    }
    await guardRate(`vibe:${callerKey(whoId)}`, 20, 10 * 60 * 1000);
    let baked = "";
    try {
      const keyMod = await import("virtual:openai-key");
      baked = typeof keyMod.OPENAI_API_KEY === "string" ? keyMod.OPENAI_API_KEY : "";
    } catch {
      baked = "";
    }
    return vibeReply(data.turns, baked, { desk: data.desk, think: data.think, code: data.code, skill: data.skill, depth: data.depth, level: data.level, context: data.context, language: data.language });
  });

async function bakedKey() {
  try {
    const keyMod = await import("virtual:openai-key");
    return typeof keyMod.OPENAI_API_KEY === "string" ? keyMod.OPENAI_API_KEY : "";
  } catch {
    return "";
  }
}

export const drawVibe = createServerFn({ method: "POST" })
  .validator((input: { prompt?: unknown }) => ({ prompt: typeof input?.prompt === "string" ? input.prompt.slice(0, 1000) : "" }))
  .handler(async ({ data }) => {
    const { vibeDraw } = await import("@/lib/noctis-desk.server");
    return vibeDraw(data.prompt, await bakedKey());
  });

export const hearVibe = createServerFn({ method: "POST" })
  .validator((input: { audio?: unknown }) => {
    const audio = typeof input?.audio === "string" ? input.audio : "";
    return { audio: audio.startsWith("data:audio/") && audio.length < 6_000_000 ? audio : "" };
  })
  .handler(async ({ data }) => {
    if (!data.audio) return { error: "That recording could not be read." };
    const { vibeHear } = await import("@/lib/noctis-desk.server");
    return vibeHear(data.audio, await bakedKey());
  });

export const sayVibe = createServerFn({ method: "POST" })
  .validator((input: { text?: unknown; voice?: unknown; speed?: unknown }) => ({
    text: typeof input?.text === "string" ? input.text.slice(0, 4000) : "",
    voice: input?.voice === "onyx" || input?.voice === "nova" || input?.voice === "alloy" ? input.voice : "",
    speed: typeof input?.speed === "number" && input.speed >= 0.7 && input.speed <= 1.1 ? input.speed : 0,
  }))
  .handler(async ({ data }) => {
    const { vibeSay } = await import("@/lib/noctis-desk.server");
    return vibeSay(data.text, await bakedKey(), data.voice, data.speed);
  });

export const trainVibe = createServerFn({ method: "POST" })
  .validator((input: { action?: unknown; question?: unknown; answer?: unknown; rule?: unknown }) => ({
    action: input?.action === "train" || input?.action === "rule" || input?.action === "export" ? input.action : ("status" as const),
    question: typeof input?.question === "string" ? input.question.trim().slice(0, 800) : "",
    answer: typeof input?.answer === "string" ? input.answer.trim().slice(0, 6000) : "",
    rule: typeof input?.rule === "string" ? input.rule.trim().slice(0, 320) : "",
  }))
  .handler(async ({ data }) => {
    const { trainPair, rememberRule, trainingStatus, exportTrainingJsonl } = await import("@/lib/noctis-train.server");
    if (data.action === "train") {
      const res = await trainPair(data.question, data.answer, "user-taught");
      const status = await trainingStatus();
      return { ok: res.ok, reason: res.reason || "", status };
    }
    if (data.action === "rule") {
      const res = await rememberRule(data.rule);
      const status = await trainingStatus();
      return { ok: res.ok, reason: res.reason || "", status };
    }
    if (data.action === "export") {
      const jsonl = await exportTrainingJsonl();
      const status = await trainingStatus();
      return { ok: true, jsonl, status };
    }
    const status = await trainingStatus();
    return { ok: true, status };
  });
