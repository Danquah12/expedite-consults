import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env.server";

function required() {
  return {
    account: env("TWILIO_ACCOUNT_SID"),
    key: env("TWILIO_API_KEY"),
    secret: env("TWILIO_API_SECRET"),
    app: env("TWILIO_TWIML_APP_SID"),
    caller: env("TWILIO_CALLER_ID"),
    auth: env("TWILIO_AUTH_TOKEN"),
  };
}

export function voipConfigured() {
  const row = required();
  return Boolean(row.account && row.key && row.secret && row.app && row.caller && row.auth);
}

function b64url(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function mintVoiceToken(userId: string) {
  const row = required();
  if (!row.account || !row.key || !row.secret || !row.app) return "";
  const identity = userId.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 80) || "member";
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT", cty: "twilio-fpa;v=1" }));
  const payload = b64url(
    JSON.stringify({
      jti: `${row.key}-${now}`,
      iss: row.key,
      sub: row.account,
      exp: now + 3600,
      grants: {
        identity,
        voice: {
          outgoing: { application_sid: row.app },
          incoming: { allow: true },
        },
      },
    }),
  );
  const body = `${header}.${payload}`;
  const sig = createHmac("sha256", row.secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function toE164(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return "";
}

export function voiceTwiml(to: string) {
  const caller = env("TWILIO_CALLER_ID") ?? "";
  const dest = toE164(to);
  const from = toE164(caller);
  if (!dest || !from) return `<?xml version="1.0" encoding="UTF-8"?><Response><Say>That number cannot be called.</Say></Response>`;
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="${from}" answerOnBridge="true"><Number>${dest}</Number></Dial></Response>`;
}

export function twilioSigned(url: string, params: Record<string, string>, signature: string) {
  const token = env("TWILIO_AUTH_TOKEN");
  if (!token || !signature) return false;
  const data = url + Object.keys(params).sort().map((key) => key + (params[key] ?? "")).join("");
  const expected = createHmac("sha1", token).update(data).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
