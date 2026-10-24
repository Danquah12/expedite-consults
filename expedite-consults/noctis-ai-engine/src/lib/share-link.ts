import { createServerFn } from "@tanstack/react-start";

export type ShareNote = { code: string; name: string; avatar: string; body: string };

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

function cleanCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase();
}

async function db() {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql.query(`create table if not exists share_link (
    code text primary key,
    name text not null,
    avatar text not null default '',
    body text not null,
    created_at timestamptz not null default now()
  )`);
  return sql;
}

function freshCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export const saveShareLink = createServerFn({ method: "POST" })
  .validator((input: { name?: string; avatar?: string; body?: string }) => ({
    name: String(input?.name ?? "Noctis").replace(/\s+/g, " ").trim().slice(0, 80) || "Noctis",
    avatar: String(input?.avatar ?? "").startsWith("https://") ? String(input.avatar).slice(0, 800) : "",
    body: String(input?.body ?? "").replace(/\s+/g, " ").trim().slice(0, 1800),
  }))
  .handler(async ({ data }): Promise<ShareNote> => {
    const sql = await db();
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const code = freshCode();
      try {
        await sql`insert into share_link (code, name, avatar, body) values (${code}, ${data.name}, ${data.avatar}, ${data.body})`;
        return { code, name: data.name, avatar: data.avatar, body: data.body };
      } catch {
        /* another code if this one is already used */
      }
    }
    throw new Error("Could not save a short link.");
  });

export const readShareLink = createServerFn({ method: "GET" })
  .validator((input: { code?: string }) => ({ code: cleanCode(String(input?.code ?? "")) }))
  .handler(async ({ data }): Promise<ShareNote | null> => {
    if (!data.code) return null;
    const sql = await db();
    const rows = await sql<ShareNote>`select code, name, avatar, body from share_link where code = ${data.code} limit 1`;
    return rows[0] ?? null;
  });
