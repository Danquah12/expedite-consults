import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { STUDY_HOUSES } from "@/lib/study-desk";

const INTERESTS = new Set(STUDY_HOUSES.map((house) => house.id).filter((id) => id !== "all"));

function interestOf(raw: unknown) {
  const interest = String(raw ?? "").trim();
  if (!INTERESTS.has(interest as never)) throw new Error("Pick a subject first");
  return interest;
}

export const listStudyGroups = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { interest?: string }) => ({ interest: interestOf(input?.interest) }))
  .handler(async ({ context, data }) => {
    const { listCircles } = await import("@/lib/study-group.server");
    return listCircles(context.userId, data.interest);
  });

export const createStudyGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { interest?: string; title?: string }) => {
    const title = String(input?.title ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (title.length < 3) throw new Error("Give the group a name");
    return { interest: interestOf(input?.interest), title };
  })
  .handler(async ({ context, data }) => {
    const { openCircle } = await import("@/lib/study-group.server");
    const created = await openCircle(context.userId, data.interest, data.title);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({ userId: context.userId, action: "study", detail: `Opened a study group · ${data.title}`, target: data.title, surface: "study" });
    return created;
  });

export const joinStudyGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => {
    const id = String(input?.id ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Bad group");
    return { id };
  })
  .handler(async ({ context, data }) => {
    const { enterCircle } = await import("@/lib/study-group.server");
    const joined = await enterCircle(context.userId, data.id);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({ userId: context.userId, action: "study-join", detail: "Joined a study group", target: data.id, surface: "study" });
    return joined;
  });

export const leaveStudyGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string }) => {
    const id = String(input?.id ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Bad group");
    return { id };
  })
  .handler(async ({ context, data }) => {
    const { leaveCircle } = await import("@/lib/study-group.server");
    const left = await leaveCircle(context.userId, data.id);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({ userId: context.userId, action: "study-leave", detail: "Left a study group", target: data.id, surface: "study" });
    return left;
  });

function groupIdOf(raw: unknown) {
  const id = String(raw ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Bad group");
  return id;
}

export const studyLiveBeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; cursor?: number }) => ({
    groupId: groupIdOf(input?.groupId),
    cursor: Math.max(0, Number(input?.cursor) || 0),
  }))
  .handler(async ({ context, data }) => {
    const { beatLive } = await import("@/lib/study-group.server");
    return beatLive(context.userId, data.groupId, data.cursor);
  });

export const studyLiveSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; to?: string; kind?: string; payload?: string }) => {
    const kind = input?.kind === "offer" || input?.kind === "answer" || input?.kind === "ice" || input?.kind === "stage" ? input.kind : "";
    const payload = String(input?.payload ?? "");
    if (!kind || payload.length < 2 || payload.length > 20000) throw new Error("Bad signal");
    const to = String(input?.to ?? "").trim();
    if (!to || to.length > 80) throw new Error("Bad peer");
    return { groupId: groupIdOf(input?.groupId), to, kind, payload };
  })
  .handler(async ({ context, data }) => {
    const { pushSignal } = await import("@/lib/study-group.server");
    return pushSignal(context.userId, data.groupId, data.to, data.kind, data.payload);
  });

export const studyLiveLeave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string }) => ({ groupId: groupIdOf(input?.groupId) }))
  .handler(async ({ context, data }) => {
    const { dropLive } = await import("@/lib/study-group.server");
    return dropLive(context.userId, data.groupId);
  });

export const studyRoom = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string }) => ({ groupId: groupIdOf(input?.groupId) }))
  .handler(async ({ context, data }) => {
    const { listRoom } = await import("@/lib/study-group.server");
    return listRoom(context.userId, data.groupId);
  });

export const studySavePhone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; phone?: string }) => {
    const raw = String(input?.phone ?? "").trim();
    if (!raw) return { groupId: groupIdOf(input?.groupId), phone: "" };
    const phone = raw.replace(/[^\d+]/g, "").slice(0, 20);
    if (phone.replace(/\D/g, "").length < 7) throw new Error("Enter a real phone number");
    return { groupId: groupIdOf(input?.groupId), phone };
  })
  .handler(async ({ context, data }) => {
    const { savePhone } = await import("@/lib/study-group.server");
    return savePhone(context.userId, data.groupId, data.phone);
  });

export const studyChat = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; after?: number; channel?: string }) => ({
    groupId: groupIdOf(input?.groupId),
    after: Math.max(0, Number(input?.after) || 0),
    channel: String(input?.channel ?? "general"),
  }))
  .handler(async ({ context, data }) => {
    const { listChat } = await import("@/lib/study-group.server");
    return listChat(context.userId, data.groupId, data.after, data.channel);
  });

export const studySend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; body?: string; replyName?: string; replyBody?: string; channel?: string; media?: string; mediaName?: string; mediaKind?: string }) => {
    const body = String(input?.body ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
    const media = String(input?.media ?? "");
    const mediaKind = input?.mediaKind === "image" || input?.mediaKind === "voice" || input?.mediaKind === "file" ? input.mediaKind : "";
    if (!body && !media) throw new Error("Write a message");
    if (media && (media.length > 750_000 || !/^data:(image\/(png|jpeg|jpg|webp)|audio\/[a-z0-9.+-]+|application\/pdf|text\/plain)[;,]/i.test(media))) {
      throw new Error("That file is too large or not allowed");
    }
    const replyName = String(input?.replyName ?? "").trim().slice(0, 80);
    const replyBody = String(input?.replyBody ?? "").trim().slice(0, 180);
    return {
      groupId: groupIdOf(input?.groupId),
      body,
      replyName,
      replyBody,
      channel: String(input?.channel ?? "general"),
      media,
      mediaName: String(input?.mediaName ?? "").slice(0, 80),
      mediaKind,
    };
  })
  .handler(async ({ context, data }) => {
    const { sendChat } = await import("@/lib/study-group.server");
    const reply = data.replyBody ? { name: data.replyName || "Someone", body: data.replyBody } : undefined;
    const media = data.media ? { data: data.media, name: data.mediaName, kind: data.mediaKind } : undefined;
    const sent = await sendChat(context.userId, data.groupId, data.body, reply, data.channel, media);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({
      userId: context.userId,
      action: "study-chat",
      detail: data.body || data.mediaKind || "attachment",
      target: data.groupId,
      surface: "study",
    });
    return sent;
  });

export const studyEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; chatId?: number; body?: string }) => {
    const chatId = Number(input?.chatId);
    const body = String(input?.body ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (!Number.isInteger(chatId) || chatId < 1) throw new Error("Pick a message");
    if (!body) throw new Error("Write a message");
    return { groupId: groupIdOf(input?.groupId), chatId, body };
  })
  .handler(async ({ context, data }) => {
    const { editChat } = await import("@/lib/study-group.server");
    return editChat(context.userId, data.groupId, data.chatId, data.body);
  });

export const studyHide = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; chatId?: number }) => {
    const chatId = Number(input?.chatId);
    if (!Number.isInteger(chatId) || chatId < 1) throw new Error("Pick a message");
    return { groupId: groupIdOf(input?.groupId), chatId };
  })
  .handler(async ({ context, data }) => {
    const { hideChat } = await import("@/lib/study-group.server");
    return hideChat(context.userId, data.groupId, data.chatId);
  });

export const studyPin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; chatId?: number }) => {
    const chatId = Number(input?.chatId);
    if (!Number.isInteger(chatId) || chatId < 1) throw new Error("Pick a message");
    return { groupId: groupIdOf(input?.groupId), chatId };
  })
  .handler(async ({ context, data }) => {
    const { pinChat } = await import("@/lib/study-group.server");
    return pinChat(context.userId, data.groupId, data.chatId);
  });

export const studyBlock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; aboutId?: string }) => {
    const aboutId = String(input?.aboutId ?? "").trim();
    if (!aboutId) throw new Error("Pick a person");
    return { groupId: groupIdOf(input?.groupId), aboutId };
  })
  .handler(async ({ context, data }) => {
    const { blockPerson } = await import("@/lib/study-group.server");
    return blockPerson(context.userId, data.groupId, data.aboutId);
  });

export const studyReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; aboutId?: string; note?: string }) => {
    const aboutId = String(input?.aboutId ?? "").trim();
    if (!aboutId) throw new Error("Pick a person");
    return { groupId: groupIdOf(input?.groupId), aboutId, note: String(input?.note ?? "Reported from chat").slice(0, 240) };
  })
  .handler(async ({ context, data }) => {
    const { reportPerson } = await import("@/lib/study-group.server");
    return reportPerson(context.userId, data.groupId, data.aboutId, data.note);
  });

export const studyReact = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; chatId?: number; emoji?: string }) => {
    const chatId = Number(input?.chatId);
    if (!Number.isInteger(chatId) || chatId < 1) throw new Error("Pick a message");
    return { groupId: groupIdOf(input?.groupId), chatId, emoji: String(input?.emoji ?? "👍") };
  })
  .handler(async ({ context, data }) => {
    const { reactChat } = await import("@/lib/study-group.server");
    return reactChat(context.userId, data.groupId, data.chatId, data.emoji);
  });

export const studyBrief = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string }) => ({ groupId: groupIdOf(input?.groupId) }))
  .handler(async ({ context, data }) => {
    const { briefChat } = await import("@/lib/study-group.server");
    return briefChat(context.userId, data.groupId);
  });

export const studyOpenCall = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title?: string }) => ({ title: String(input?.title ?? "").replace(/\s+/g, " ").trim().slice(0, 60) }))
  .handler(async ({ context, data }) => {
    const { openCall } = await import("@/lib/study-group.server");
    return openCall(context.userId, data.title);
  });

export const studyInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; to?: string }) => {
    const to = String(input?.to ?? "").trim();
    if (!to || to.length > 80) throw new Error("Pick a person");
    return { groupId: groupIdOf(input?.groupId), to };
  })
  .handler(async ({ context, data }) => {
    const { inviteToCall } = await import("@/lib/study-group.server");
    return inviteToCall(context.userId, data.groupId, data.to);
  });

export const studyRing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { groupId?: string; to?: string }) => {
    const to = String(input?.to ?? "").trim();
    if (!to || to.length > 80) throw new Error("Pick a person");
    return { groupId: groupIdOf(input?.groupId), to };
  })
  .handler(async ({ context, data }) => {
    const { ringPerson } = await import("@/lib/study-group.server");
    return ringPerson(context.userId, data.groupId, data.to);
  });

export const studyRings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listRings } = await import("@/lib/study-group.server");
    return listRings(context.userId);
  });

export function dialHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "";
  const e164 = digits.length === 10 ? `1${digits}` : digits;
  return `tel:+${e164}`;
}

export const studyJoined = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { listJoined } = await import("@/lib/study-group.server");
    return listJoined(context.userId);
  });

export const studyClearRing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: number }) => {
    const id = Number(input?.id);
    if (!Number.isFinite(id)) throw new Error("Bad call");
    return { id };
  })
  .handler(async ({ context, data }) => {
    const { clearRing } = await import("@/lib/study-group.server");
    return clearRing(context.userId, data.id);
  });


