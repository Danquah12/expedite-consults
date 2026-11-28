import fsSync from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import { INITIAL_STORE_DATA } from "./seed";
import type {
  CardOrder,
  DigitalInvitation,
  EmailCampaign,
  EmailConfig,
  EmailDeliveryLog,
  EmailProvider,
  EmailRecipient,
  InvitationRsvp,
  KeepsakeStoreData,
  SharedCardSnapshot,
  SocialChannelConfig,
  SocialDispatchLog,
} from "./types";

const PRIMARY_DIR = path.join(process.cwd(), ".data");
const PRIMARY_FILE = path.join(PRIMARY_DIR, "connectln-cards.json");
const PUBLIC_URL_FILE = path.join(PRIMARY_DIR, "public-url.txt");
const FALLBACK_FILE = path.join(os.tmpdir(), "connectln-cards.json");

export function isLocalhostUrl(rawUrl?: string): boolean {
  if (!rawUrl) return true;
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return (
      host === "127.0.0.1" ||
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]"
    );
  } catch {
    return true;
  }
}

export function isStaleEphemeralTunnelUrl(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return host.endsWith(".trycloudflare.com");
  } catch {
    return false;
  }
}

export function readTunnelPublicUrl(): string {
  const envUrl = process.env.PUBLIC_SHARE_URL?.trim();
  if (
    envUrl &&
    /^https?:\/\//i.test(envUrl) &&
    !isLocalhostUrl(envUrl) &&
    !isStaleEphemeralTunnelUrl(envUrl)
  ) {
    return envUrl.replace(/\/+$/, "");
  }
  try {
    if (fsSync.existsSync(PUBLIC_URL_FILE)) {
      const fileUrl = fsSync.readFileSync(PUBLIC_URL_FILE, "utf8").trim();
      if (
        fileUrl &&
        /^https?:\/\//i.test(fileUrl) &&
        !isLocalhostUrl(fileUrl) &&
        !isStaleEphemeralTunnelUrl(fileUrl)
      ) {
        return fileUrl.replace(/\/+$/, "");
      }
    }
  } catch {
    // Ignore unreadable tunnel URL file
  }
  return "";
}

export async function getEffectivePublicBaseUrl(
  request?: Request
): Promise<string> {
  if (request) {
    const rawHost = (
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      ""
    )
      .split(",")[0]
      .trim();
    const rawProto = (request.headers.get("x-forwarded-proto") || "")
      .split(",")[0]
      .trim();
    if (rawHost) {
      const isLocalHost =
        rawHost.startsWith("127.0.0.1") ||
        rawHost.startsWith("localhost") ||
        rawHost.startsWith("[::1]");
      if (!isLocalHost && !rawHost.endsWith(".trycloudflare.com")) {
        const proto = rawProto || "https";
        return `${proto}://${rawHost}`.replace(/\/+$/, "");
      }
    }
  }

  const tunnelUrl = readTunnelPublicUrl();
  if (tunnelUrl) return tunnelUrl;

  const emailConfig = await getEmailConfig();
  if (
    emailConfig.publicBaseUrl &&
    /^https?:\/\//i.test(emailConfig.publicBaseUrl) &&
    !isLocalhostUrl(emailConfig.publicBaseUrl) &&
    !isStaleEphemeralTunnelUrl(emailConfig.publicBaseUrl)
  ) {
    return emailConfig.publicBaseUrl.replace(/\/+$/, "");
  }

  if (request) {
    try {
      const origin = new URL(request.url).origin.replace(/\/+$/, "");
      if (!isLocalhostUrl(origin)) return origin;
    } catch {
      // Ignore malformed request.url
    }
  }

  return "https://connectln-cards.vercel.app";
}

let cachedParentEnv: Record<string, string> | null = null;

function readParentWorkspaceEnv(): Record<string, string> {
  if (cachedParentEnv) return cachedParentEnv;
  const parsed: Record<string, string> = {};
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "..", ".env.local"),
  ];
  for (const filePath of candidates) {
    try {
      if (!fsSync.existsSync(filePath)) continue;
      const raw = fsSync.readFileSync(filePath, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx <= 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key && !(key in parsed)) {
          parsed[key] = val;
        }
      }
    } catch {
      // Ignore unreadable env file
    }
  }
  cachedParentEnv = parsed;
  return parsed;
}

function getEnvValue(key: string): string {
  const direct = process.env[key];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const fromParent = readParentWorkspaceEnv()[key];
  return typeof fromParent === "string" ? fromParent.trim() : "";
}

function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  const candidate = (match ? match[1] : raw).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : "";
}

export function getDefaultEmailConfig(): EmailConfig {
  const rawProvider = getEnvValue("EMAIL_PROVIDER").toLowerCase();
  const resendKey = getEnvValue("RESEND_API_KEY");
  const sendgridKey = getEnvValue("SENDGRID_API_KEY");
  const smtpHost = getEnvValue("SMTP_HOST");
  const resendFormEmail = extractEmailAddress(getEnvValue("RESEND_FORM_EMAIL"));

  const provider: EmailProvider =
    rawProvider === "smtp" ||
    rawProvider === "resend" ||
    rawProvider === "sendgrid" ||
    rawProvider === "ethereal"
      ? rawProvider
      : resendKey
        ? "resend"
        : sendgridKey
          ? "sendgrid"
          : smtpHost
            ? "smtp"
            : "ethereal";

  const defaultFromEmail =
    extractEmailAddress(getEnvValue("SMTP_FROM_EMAIL")) ||
    resendFormEmail ||
    (provider === "resend" ? "onboarding@resend.dev" : "cards@connectln.app");

  return {
    provider,
    fromName: getEnvValue("SMTP_FROM_NAME") || "ConnectLn Keepsake",
    fromEmail: defaultFromEmail,
    replyTo: getEnvValue("SMTP_REPLY_TO") || "",
    smtpHost,
    smtpPort: Number(getEnvValue("SMTP_PORT") || "465") || 465,
    smtpSecure: getEnvValue("SMTP_SECURE") !== "false",
    smtpUser: getEnvValue("SMTP_USER") || "",
    smtpPass: getEnvValue("SMTP_PASS") || "",
    resendApiKey: resendKey,
    sendgridApiKey: sendgridKey,
    publicBaseUrl:
      readTunnelPublicUrl() ||
      getEnvValue("NEXT_PUBLIC_APP_URL") ||
      "https://connectln-cards.vercel.app",
  };
}

function normalizeEmailConfig(raw?: Partial<EmailConfig> | null): EmailConfig {
  const defaults = getDefaultEmailConfig();
  if (!raw) return defaults;

  const activeTunnel = readTunnelPublicUrl();

  let validProvider: EmailProvider =
    raw.provider === "ethereal" ||
    raw.provider === "smtp" ||
    raw.provider === "resend" ||
    raw.provider === "sendgrid"
      ? raw.provider
      : defaults.provider;

  const savedResendKey =
    typeof raw.resendApiKey === "string" && raw.resendApiKey.trim()
      ? raw.resendApiKey.trim()
      : defaults.resendApiKey;

  let resolvedFromEmail =
    typeof raw.fromEmail === "string" && raw.fromEmail.trim()
      ? raw.fromEmail.trim()
      : defaults.fromEmail;

  // Auto-promote default sandbox to real Resend delivery when workspace key is configured
  if (
    validProvider === "ethereal" &&
    !raw.resendApiKey?.trim() &&
    defaults.resendApiKey
  ) {
    validProvider = "resend";
    if (!raw.fromEmail?.trim() || raw.fromEmail === "cards@connectln.app") {
      resolvedFromEmail = defaults.fromEmail;
    }
  }

  return {
    provider: validProvider,
    fromName:
      typeof raw.fromName === "string" && raw.fromName.trim()
        ? raw.fromName
        : defaults.fromName,
    fromEmail: resolvedFromEmail,
    replyTo: typeof raw.replyTo === "string" ? raw.replyTo : defaults.replyTo,
    smtpHost: typeof raw.smtpHost === "string" ? raw.smtpHost : defaults.smtpHost,
    smtpPort:
      typeof raw.smtpPort === "number" && Number.isFinite(raw.smtpPort)
        ? raw.smtpPort
        : defaults.smtpPort,
    smtpSecure:
      typeof raw.smtpSecure === "boolean" ? raw.smtpSecure : defaults.smtpSecure,
    smtpUser: typeof raw.smtpUser === "string" ? raw.smtpUser : defaults.smtpUser,
    smtpPass: typeof raw.smtpPass === "string" ? raw.smtpPass : defaults.smtpPass,
    resendApiKey: savedResendKey,
    sendgridApiKey:
      typeof raw.sendgridApiKey === "string" && raw.sendgridApiKey.trim()
        ? raw.sendgridApiKey
        : defaults.sendgridApiKey,
    publicBaseUrl:
      activeTunnel &&
      (!raw.publicBaseUrl?.trim() ||
        isLocalhostUrl(raw.publicBaseUrl.trim()) ||
        isStaleEphemeralTunnelUrl(raw.publicBaseUrl.trim()))
        ? activeTunnel
        : typeof raw.publicBaseUrl === "string" &&
            raw.publicBaseUrl.trim() &&
            !isLocalhostUrl(raw.publicBaseUrl.trim()) &&
            !isStaleEphemeralTunnelUrl(raw.publicBaseUrl.trim())
          ? raw.publicBaseUrl.trim().replace(/\/+$/, "")
          : defaults.publicBaseUrl,
  };
}

function cloneInitial(): KeepsakeStoreData {
  const base = JSON.parse(JSON.stringify(INITIAL_STORE_DATA)) as KeepsakeStoreData;
  return {
    ...base,
    emailConfig: getDefaultEmailConfig(),
    emailCampaigns: [],
    emailLogs: [],
    socialConfig: getDefaultSocialConfig(),
    socialLogs: [],
    sharedCards: [],
  };
}

async function resolveReadablePath(): Promise<string | null> {
  for (const candidate of [PRIMARY_FILE, FALLBACK_FILE]) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

async function writeStore(data: KeepsakeStoreData): Promise<void> {
  const payload = JSON.stringify(data, null, 2);
  try {
    await fs.mkdir(PRIMARY_DIR, { recursive: true });
    await fs.writeFile(PRIMARY_FILE, payload, "utf-8");
    return;
  } catch {
    // fallback to tmpdir if workspace isn't writable
  }
  try {
    await fs.writeFile(FALLBACK_FILE, payload, "utf-8");
  } catch {
    // ignore if completely read-only environment
  }
}

export async function readStore(): Promise<KeepsakeStoreData> {
  const existing = await resolveReadablePath();
  if (!existing) {
    const seeded = cloneInitial();
    await writeStore(seeded);
    return seeded;
  }

  try {
    const raw = await fs.readFile(existing, "utf-8");
    const parsed = JSON.parse(raw) as Partial<KeepsakeStoreData>;
    const normalized: KeepsakeStoreData = {
      orders: Array.isArray(parsed.orders)
        ? parsed.orders
        : cloneInitial().orders,
      invitations: Array.isArray(parsed.invitations)
        ? parsed.invitations
        : cloneInitial().invitations,
      emailConfig: normalizeEmailConfig(parsed.emailConfig),
      emailCampaigns: Array.isArray(parsed.emailCampaigns)
        ? parsed.emailCampaigns
        : [],
      emailLogs: Array.isArray(parsed.emailLogs) ? parsed.emailLogs : [],
      socialConfig: normalizeSocialConfig(parsed.socialConfig),
      socialLogs: Array.isArray(parsed.socialLogs) ? parsed.socialLogs : [],
      sharedCards: Array.isArray(parsed.sharedCards) ? parsed.sharedCards : [],
    };
    return normalized;
  } catch {
    const seeded = cloneInitial();
    await writeStore(seeded);
    return seeded;
  }
}

export async function getOrders(): Promise<CardOrder[]> {
  const store = await readStore();
  return store.orders;
}

export async function findOrdersByQuery(query: string): Promise<CardOrder[]> {
  const q = query.trim().toLowerCase();
  const store = await readStore();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  return store.orders.filter(
    (order) =>
      order.id.toLowerCase() === q ||
      order.id.toLowerCase().includes(q) ||
      (digits.length >= 4 &&
        order.recipientPhone.replace(/\D/g, "").includes(digits))
  );
}

export async function addOrder(order: CardOrder): Promise<CardOrder> {
  const store = await readStore();
  store.orders.unshift(order);
  await writeStore(store);
  return order;
}

export async function getInvitations(): Promise<DigitalInvitation[]> {
  const store = await readStore();
  return store.invitations;
}

export async function getInvitationBySlug(
  slug: string
): Promise<DigitalInvitation | null> {
  const store = await readStore();
  return (
    store.invitations.find(
      (inv) => inv.slug.toLowerCase() === slug.toLowerCase()
    ) ?? null
  );
}

export async function createInvitation(
  invitation: DigitalInvitation
): Promise<DigitalInvitation> {
  const store = await readStore();
  const baseSlug =
    invitation.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || `invite-${Date.now()}`;

  let uniqueSlug = baseSlug;
  let counter = 2;
  while (store.invitations.some((inv) => inv.slug === uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const saved: DigitalInvitation = {
    ...invitation,
    slug: uniqueSlug,
  };
  store.invitations.unshift(saved);
  await writeStore(store);
  return saved;
}

export async function addRsvpToInvitation(
  slug: string,
  rsvp: InvitationRsvp
): Promise<DigitalInvitation | null> {
  const store = await readStore();
  const idx = store.invitations.findIndex(
    (inv) => inv.slug.toLowerCase() === slug.toLowerCase()
  );
  if (idx === -1) return null;

  store.invitations[idx].rsvps.unshift(rsvp);
  await writeStore(store);
  return store.invitations[idx];
}

export async function getEmailConfig(): Promise<EmailConfig> {
  const store = await readStore();
  return normalizeEmailConfig(store.emailConfig);
}

export async function saveEmailConfig(
  updates: Partial<EmailConfig>
): Promise<EmailConfig> {
  const store = await readStore();
  const current = normalizeEmailConfig(store.emailConfig);
  const next = normalizeEmailConfig({
    ...current,
    ...updates,
    smtpPass:
      typeof updates.smtpPass === "string" &&
      updates.smtpPass.trim() &&
      !updates.smtpPass.includes("••••")
        ? updates.smtpPass.trim()
        : updates.smtpPass === ""
          ? ""
          : current.smtpPass,
    resendApiKey:
      typeof updates.resendApiKey === "string" &&
      updates.resendApiKey.trim() &&
      !updates.resendApiKey.includes("••••")
        ? updates.resendApiKey.trim()
        : updates.resendApiKey === ""
          ? ""
          : current.resendApiKey,
    sendgridApiKey:
      typeof updates.sendgridApiKey === "string" &&
      updates.sendgridApiKey.trim() &&
      !updates.sendgridApiKey.includes("••••")
        ? updates.sendgridApiKey.trim()
        : updates.sendgridApiKey === ""
          ? ""
          : current.sendgridApiKey,
  });

  store.emailConfig = next;
  await writeStore(store);
  return next;
}

export async function recordEmailCampaign(
  campaign: EmailCampaign | null,
  logs: EmailDeliveryLog[]
): Promise<void> {
  const store = await readStore();
  const campaigns = Array.isArray(store.emailCampaigns)
    ? store.emailCampaigns
    : [];
  const existingLogs = Array.isArray(store.emailLogs) ? store.emailLogs : [];

  if (campaign) {
    campaigns.unshift(campaign);
  }
  store.emailCampaigns = campaigns.slice(0, 100);
  store.emailLogs = [...logs, ...existingLogs].slice(0, 500);
  await writeStore(store);
}

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  const store = await readStore();
  return store.emailCampaigns ?? [];
}

export async function getEmailLogs(): Promise<EmailDeliveryLog[]> {
  const store = await readStore();
  return store.emailLogs ?? [];
}

export async function getSavedRecipients(): Promise<EmailRecipient[]> {
  const store = await readStore();
  const byEmail = new Map<string, EmailRecipient>();

  for (const order of store.orders) {
    for (const rec of order.recipientEmails ?? []) {
      const key = rec.email.trim().toLowerCase();
      if (key && !byEmail.has(key)) {
        byEmail.set(key, {
          email: key,
          name: rec.name?.trim() || order.recipientName || undefined,
        });
      }
    }
  }

  for (const log of store.emailLogs ?? []) {
    const key = log.recipientEmail.trim().toLowerCase();
    if (key && !byEmail.has(key)) {
      byEmail.set(key, {
        email: key,
        name: log.recipientName?.trim() || undefined,
      });
    } else if (key && log.recipientName && !byEmail.get(key)?.name) {
      byEmail.set(key, { email: key, name: log.recipientName.trim() });
    }
  }

  return Array.from(byEmail.values());
}

export function getDefaultSocialConfig(): SocialChannelConfig {
  return {
    connectlnBaseUrl:
      process.env.CONNECTLN_SOCIAL_URL || "https://conectln.com",
    connectlnAutoPost: false,
    whatsappPhoneId: process.env.WHATSAPP_PHONE_ID || "",
    whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    whatsappDefaultPrefix: "+1",
    facebookPageId: process.env.FACEBOOK_PAGE_ID || "",
    facebookPageToken: process.env.FACEBOOK_PAGE_TOKEN || "",
    instagramAccountId: process.env.INSTAGRAM_ACCOUNT_ID || "",
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || "",
    xBearerToken: process.env.X_BEARER_TOKEN || "",
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeSocialConfig(
  cfg?: Partial<SocialChannelConfig>
): SocialChannelConfig {
  const defaults = getDefaultSocialConfig();
  const rawConnectlnUrl = (cfg?.connectlnBaseUrl || "").trim();
  const resolvedConnectlnUrl =
    rawConnectlnUrl &&
    !isLocalhostUrl(rawConnectlnUrl) &&
    !isStaleEphemeralTunnelUrl(rawConnectlnUrl)
      ? rawConnectlnUrl
      : defaults.connectlnBaseUrl;
  return {
    connectlnBaseUrl: resolvedConnectlnUrl,
    connectlnAutoPost: Boolean(cfg?.connectlnAutoPost),
    whatsappPhoneId: cfg?.whatsappPhoneId?.trim() ?? defaults.whatsappPhoneId,
    whatsappAccessToken:
      cfg?.whatsappAccessToken?.trim() ?? defaults.whatsappAccessToken,
    whatsappDefaultPrefix:
      cfg?.whatsappDefaultPrefix?.trim() || defaults.whatsappDefaultPrefix || "+1",
    facebookPageId: cfg?.facebookPageId?.trim() ?? defaults.facebookPageId,
    facebookPageToken:
      cfg?.facebookPageToken?.trim() ?? defaults.facebookPageToken,
    instagramAccountId:
      cfg?.instagramAccountId?.trim() ?? defaults.instagramAccountId,
    instagramAccessToken:
      cfg?.instagramAccessToken?.trim() ?? defaults.instagramAccessToken,
    xBearerToken: cfg?.xBearerToken?.trim() ?? defaults.xBearerToken,
    updatedAt: cfg?.updatedAt || defaults.updatedAt,
  };
}

export async function getSocialConfig(): Promise<SocialChannelConfig> {
  const store = await readStore();
  return normalizeSocialConfig(store.socialConfig);
}

function mergeSecret(
  incoming: string | undefined,
  existing: string | undefined
): string {
  if (typeof incoming === "string") {
    const trimmed = incoming.trim();
    if (trimmed === "") return "";
    if (!trimmed.includes("••••")) return trimmed;
  }
  return existing ?? "";
}

export async function saveSocialConfig(
  updates: Partial<SocialChannelConfig>
): Promise<SocialChannelConfig> {
  const store = await readStore();
  const current = normalizeSocialConfig(store.socialConfig);
  const next = normalizeSocialConfig({
    ...current,
    ...updates,
    whatsappAccessToken: mergeSecret(
      updates.whatsappAccessToken,
      current.whatsappAccessToken
    ),
    facebookPageToken: mergeSecret(
      updates.facebookPageToken,
      current.facebookPageToken
    ),
    instagramAccessToken: mergeSecret(
      updates.instagramAccessToken,
      current.instagramAccessToken
    ),
    xBearerToken: mergeSecret(updates.xBearerToken, current.xBearerToken),
    updatedAt: new Date().toISOString(),
  });
  store.socialConfig = next;
  await writeStore(store);
  return next;
}

export async function recordSocialLogs(
  logs: SocialDispatchLog[]
): Promise<void> {
  const store = await readStore();
  const existing = Array.isArray(store.socialLogs) ? store.socialLogs : [];
  store.socialLogs = [...logs, ...existing].slice(0, 300);
  await writeStore(store);
}

export async function getSocialLogs(): Promise<SocialDispatchLog[]> {
  const store = await readStore();
  return store.socialLogs ?? [];
}

export async function createSharedCard(
  input: Omit<SharedCardSnapshot, "id" | "createdAt">
): Promise<SharedCardSnapshot> {
  const store = await readStore();
  const snapshot: SharedCardSnapshot = {
    ...input,
    id: `CRD-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  const existing = Array.isArray(store.sharedCards) ? store.sharedCards : [];
  store.sharedCards = [snapshot, ...existing].slice(0, 200);
  await writeStore(store);
  return snapshot;
}

export async function getSharedCardById(
  id: string
): Promise<SharedCardSnapshot | null> {
  const store = await readStore();
  const list = Array.isArray(store.sharedCards) ? store.sharedCards : [];
  return list.find((item) => item.id === id) ?? null;
}

export function encodeSharedCardSnapshotToken(
  snapshot: SharedCardSnapshot
): string {
  try {
    const compact = {
      id: snapshot.id,
      c: snapshot.cardId,
      a: snapshot.artworkKey,
      t: snapshot.title,
      o: snapshot.occasion,
      m: snapshot.message,
      s: snapshot.senderName,
      e: snapshot.envelopeColor,
      p: snapshot.paperStock,
      i: snapshot.imageUrl,
      d: snapshot.createdAt,
    };
    return Buffer.from(JSON.stringify(compact), "utf8").toString("base64url");
  } catch {
    return "";
  }
}

export function decodeSharedCardSnapshotToken(
  token?: string | null,
  fallbackId?: string
): SharedCardSnapshot | null {
  if (!token || typeof token !== "string") return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(token.trim(), "base64url").toString("utf8")
    ) as Record<string, unknown>;
    const title = typeof decoded.t === "string" ? decoded.t.trim() : "";
    const message = typeof decoded.m === "string" ? decoded.m.trim() : "";
    if (!title || !message) return null;
    return {
      id:
        (typeof decoded.id === "string" && decoded.id.trim()) ||
        fallbackId ||
        "CRD-SHARED",
      cardId: typeof decoded.c === "string" ? decoded.c : undefined,
      artworkKey:
        typeof decoded.a === "string"
          ? (decoded.a as SharedCardSnapshot["artworkKey"])
          : "thanksgiving",
      title,
      occasion: typeof decoded.o === "string" ? decoded.o : "Celebration",
      message,
      senderName:
        typeof decoded.s === "string" && decoded.s.trim()
          ? decoded.s.trim()
          : "ConnectLn Keepsake",
      envelopeColor:
        typeof decoded.e === "string" && decoded.e.trim()
          ? decoded.e.trim()
          : "Cotton Ivory",
      paperStock:
        typeof decoded.p === "string" && decoded.p.trim()
          ? decoded.p.trim()
          : "350gsm Cotton",
      imageUrl:
        typeof decoded.i === "string" && decoded.i.trim()
          ? decoded.i.trim()
          : "/cards/thanksgiving.png",
      createdAt:
        typeof decoded.d === "string" && decoded.d.trim()
          ? decoded.d.trim()
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function resolveSharedCardSnapshot(
  rawId: string,
  token?: string | null
): Promise<SharedCardSnapshot | null> {
  const cleanId = (rawId || "").trim();
  if (!cleanId) return null;

  const fromStore = await getSharedCardById(cleanId);
  if (fromStore) return fromStore;

  const fromToken = decodeSharedCardSnapshotToken(token, cleanId);
  if (fromToken) return fromToken;

  if (cleanId.toUpperCase().startsWith("CRD-")) {
    return {
      id: cleanId,
      cardId: "golden-harvest",
      artworkKey: "thanksgiving",
      title: "Golden Harvest",
      occasion: "Thanksgiving",
      message:
        "Grateful for every shared table, warm conversation, and autumn memory we gather this season.",
      senderName: "ConnectLn Keepsake",
      envelopeColor: "Cotton Ivory",
      paperStock: "350gsm Cotton",
      imageUrl: "/cards/thanksgiving.png",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}
