import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authMiddleware } from "@/lib/auth/middleware";
import { env } from "@/lib/env.server";

function escapeHtml(value: string): string {
  let out = "";
  for (const ch of value) {
    if (ch === "&") out += "&" + "amp;";
    else if (ch === "<") out += "&" + "lt;";
    else if (ch === ">") out += "&" + "gt;";
    else if (ch === '"') out += "&" + "quot;";
    else if (ch === "'") out += "&" + "#39;";
    else out += ch;
  }
  return out;
}

export const sendMeetInvite = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { to?: string; groupId?: string; title?: string; note?: string; origin?: string }) => {
    const list = [
      ...new Set(
        (String(input?.to ?? "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? []).map((item) => item.toLowerCase()),
      ),
    ];
    if (!list.length || list.some((to) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 120)) {
      throw new Error("Enter real email addresses, separated by commas.");
    }
    if (list.length > 20) throw new Error("Send up to 20 emails at a time.");
    const groupId = String(input?.groupId ?? "").trim();
    if (!/^[0-9a-f-]{16,}$/i.test(groupId)) throw new Error("Start the meeting first.");
    const title = String(input?.title ?? "Noctis meeting").replace(/\s+/g, " ").trim().slice(0, 80) || "Noctis meeting";
    const note = String(input?.note ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
    let origin = "";
    try {
      const url = new URL(String(input?.origin ?? ""));
      if (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1") origin = url.origin;
    } catch {
      origin = "";
    }
    return { to: list, groupId, title, note, origin };
  })
  .handler(async ({ data }) => {
    const key = env("RESEND_API_KEY") || "";
    const from = env("RESEND_FROM") || "Noctis <meet@meet.expediteconsults.com>";
    if (!key || !from) throw new Error("Add RESEND_API_KEY and RESEND_FROM, then send again.");
    const request = getRequest();
    const forwarded = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(",")[0]?.trim() ?? "";
    const hostOrigin = forwarded && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(forwarded) ? `https://${forwarded.replace(/:\d+$/, "")}` : "";
    const origin = (data.origin || hostOrigin || env("BETTER_AUTH_URL") || new URL(request.url).origin).replace(/\/+$/, "");
    const link = `${origin}/?join=${data.groupId}`;
    const safeTitle = escapeHtml(data.title);
    const safeLink = escapeHtml(link);
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,sans-serif;color:#111;">
<p style="font-size:16px;margin:0 0 12px;">You are invited to a Noctis meeting.</p>
<p style="font-size:20px;font-weight:700;margin:0 0 16px;">${safeTitle}</p>
<p style="margin:0 0 16px;"><a href="${safeLink}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:12px 18px;border-radius:8px;">Join the meeting</a></p>
<p style="font-size:14px;line-height:1.5;margin:0;">Or open this link:<br><a href="${safeLink}">${safeLink}</a></p>
</body></html>`;
    const text = `You are invited to a Noctis meeting.\n${data.title}\n\nJoin the meeting:\n${link}\n`;
    const messages = data.to.map((to) => ({
      from,
      to: [to],
      reply_to: "asiedudanquah@gmail.com",
      subject: `Join the Noctis meeting: ${data.title}`,
      text,
      html,
    }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    if (!res.ok) {
      const failed: string[] = [];
      for (const to of data.to) {
        const one = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify(messages.find((row) => row.to[0] === to)),
        });
        if (!one.ok) {
          const detail = await one.text().catch(() => "");
          failed.push(detail ? `${to} (${detail.slice(0, 140)})` : to);
        }
      }
      if (failed.length === data.to.length) throw new Error(failed[0]?.includes("(") ? `The email did not send. ${failed[0]}` : "The email did not send. Check the Resend sender address.");
      if (failed.length) throw new Error(`Sent ${data.to.length - failed.length}. Not sent: ${failed.join(", ")}`);
    }
    return { sent: data.to.length };
  });