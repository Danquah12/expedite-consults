import { randomBytes } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";

type Spot = { city: string; region: string; country: string; latitude: number | null; longitude: number | null };

function clientIp(hinted?: string | null) {
  const request = getRequest();
  const header = request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || request?.headers.get("cf-connecting-ip") || "";
  const forwarded = header.split(",")[0]?.trim() || "";
  return (hinted || forwarded || "").replace(/^::ffff:/, "");
}

function localAddress(ip: string) {
  return !ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

async function fromIp(ip: string): Promise<Spot> {
  if (localAddress(ip)) return { city: "This network", region: "", country: "Local", latitude: null, longitude: null };
  const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(5000) });
  const data = (await res.json()) as { success?: boolean; city?: string; region?: string; country?: string; latitude?: number; longitude?: number };
  if (!data.success) return { city: "", region: "", country: "", latitude: null, longitude: null };
  return {
    city: data.city || "",
    region: data.region || "",
    country: data.country || "",
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
  };
}

async function fromDevice(lat: number, lng: number): Promise<Spot> {
  const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`, {
    signal: AbortSignal.timeout(5000),
  });
  const data = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string; countryName?: string };
  return {
    city: data.city || data.locality || "",
    region: data.principalSubdivision || "",
    country: data.countryName || "",
    latitude: lat,
    longitude: lng,
  };
}

export async function recordLoginPlace(
  userId: string,
  kind: "created" | "login",
  gps?: { lat?: number; lng?: number },
  hintedIp?: string | null,
) {
  if (!userId) return;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  if (kind === "created") {
    const existing = await sql<{ id: string }>`select id from login_place where user_id = ${userId} and kind = 'created' limit 1`;
    if (existing[0]) return;
  }
  const ip = clientIp(hintedIp);
  const hasGps = typeof gps?.lat === "number" && typeof gps?.lng === "number" && Number.isFinite(gps.lat) && Number.isFinite(gps.lng);
  if (kind === "login" && hasGps) {
    const recent = await sql<{ id: string }>`
      select id from login_place
      where user_id = ${userId} and kind = 'login' and at > now() - interval '30 minutes'
      order by at desc limit 1
    `;
    if (recent[0]) {
      const spot = await fromDevice(gps.lat as number, gps.lng as number).catch(() => null);
      await sql`
        update login_place
        set latitude = ${gps.lat as number},
            longitude = ${gps.lng as number},
            city = ${spot?.city || ""},
            region = ${spot?.region || ""},
            country = ${spot?.country || ""},
            source = 'device'
        where id = ${recent[0].id}
      `;
      return;
    }
  }
  const spot = hasGps ? await fromDevice(gps.lat as number, gps.lng as number).catch(() => null) : await fromIp(ip).catch(() => null);
  const id = `lp-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  await sql`
    insert into login_place (id, user_id, kind, ip, city, region, country, latitude, longitude, source)
    values (
      ${id},
      ${userId},
      ${kind},
      ${ip || null},
      ${spot?.city || ""},
      ${spot?.region || ""},
      ${spot?.country || ""},
      ${spot?.latitude ?? null},
      ${spot?.longitude ?? null},
      ${hasGps ? "device" : "network"}
    )
  `;
}

export async function recordFailedSignIn(input: { email: string; door: "clinic" | "desk"; reason: string }) {
  const email = input.email.trim().toLowerCase().slice(0, 160);
  const door = input.door === "desk" ? "desk" : "clinic";
  const reason = input.reason.replace(/\s+/g, " ").trim().slice(0, 180) || "Sign-in did not open";
  if (!email) return;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const ip = clientIp();
  const anonymous = email === "(sso)" || email === "(google)" || !email.includes("@");
  if (!anonymous) {
    const recent = await sql<{ id: string }>`
      select id from login_fail
      where lower(email) = ${email} and door = ${door} and ip is not distinct from ${ip || null}
        and at > now() - interval '2 minutes'
      limit 1
    `.catch(() => []);
    if (recent[0]) return;
  }
  const known = await sql<{ id: string }>`select id from "user" where lower(email) = ${email} limit 1`.catch(() => []);
  const spot = await fromIp(ip).catch(() => null);
  const id = `lf-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  await sql`
    insert into login_fail (id, email, door, reason, user_id, ip, city, region, country, latitude, longitude)
    values (
      ${id},
      ${email},
      ${door},
      ${reason},
      ${known[0]?.id ?? null},
      ${ip || null},
      ${spot?.city || ""},
      ${spot?.region || ""},
      ${spot?.country || ""},
      ${spot?.latitude ?? null},
      ${spot?.longitude ?? null}
    )
  `;
}

export function formatPlace(row: { city: string; region: string; country: string; latitude: number | null; longitude: number | null; ip: string | null }) {
  const where = [row.city, row.region, row.country].filter(Boolean).join(", ") || "Place not resolved";
  const pin = row.latitude != null && row.longitude != null ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}` : "";
  return {
    where: pin ? `${where} · ${pin}` : where,
    from: row.ip || "This network",
  };
}
