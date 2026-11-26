"use client"

/**
 * ConnectLn Client-Side Web Crypto E2EE, Encrypted Backup Vault & Deterministic SVG QR Matrix
 * -------------------------------------------------------------------------------------------
 * Private keys are generated inside browser WebCrypto (`ECDH P-256`) and never leave the device.
 */

export interface E2eeIdentityRecord {
  version: 1
  userKey: string
  publicJwk: JsonWebKey
  privateJwk: JsonWebKey
  fingerprint: string
  createdAtIso: string
}

export interface E2eeEnvelopePayload {
  v: 1
  alg: "ECDH-P256-AES256GCM" | "SELF-AES256GCM"
  spub: JsonWebKey
  rpub?: JsonWebKey | null
  fp?: string
  iv: string
  ct: string
}

const E2EE_ENVELOPE_PREFIX = "[[E2EE_V1|"
const E2EE_ENVELOPE_SUFFIX = "]]"
const IDENTITY_STORAGE_PREFIX = "connectln_e2ee_identity_v1_"

function normalizeIdentityKey(raw?: string): string {
  return String(raw || "member")
    .toLowerCase()
    .replace(/[^a-z0-9+@._-]/g, "_")
    .trim() || "member"
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ""
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i])
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(b64u: string): Uint8Array {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64u.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i)
  }
  return out
}

function canonicalPublicKeyString(jwk: JsonWebKey): string {
  return JSON.stringify({
    crv: jwk.crv || "P-256",
    kty: jwk.kty || "EC",
    x: jwk.x || "",
    y: jwk.y || "",
  })
}

export async function computePublicKeyFingerprint(jwk: JsonWebKey): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return "0000 0000 0000 0000"
  }
  const encoded = new TextEncoder().encode(canonicalPublicKeyString(jwk))
  const digest = await window.crypto.subtle.digest("SHA-256", encoded)
  const arr = Array.from(new Uint8Array(digest)).slice(0, 12)
  const hex = arr.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join("")
  return hex.match(/.{1,4}/g)?.join(" ") || hex
}

export async function getOrCreateE2eeIdentity(userKey: string): Promise<E2eeIdentityRecord | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null
  const norm = normalizeIdentityKey(userKey)
  const storageKey = `${IDENTITY_STORAGE_PREFIX}${norm}`

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as E2eeIdentityRecord
      if (parsed?.publicJwk?.x && parsed?.privateJwk?.d) {
        if (!parsed.fingerprint) {
          parsed.fingerprint = await computePublicKeyFingerprint(parsed.publicJwk)
        }
        return parsed
      }
    }
  } catch {
    // Regenerate cleanly if corrupted
  }

  try {
    const pair = await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    )
    const publicJwk = await window.crypto.subtle.exportKey("jwk", pair.publicKey)
    const privateJwk = await window.crypto.subtle.exportKey("jwk", pair.privateKey)
    const fingerprint = await computePublicKeyFingerprint(publicJwk)

    const record: E2eeIdentityRecord = {
      version: 1,
      userKey: norm,
      publicJwk,
      privateJwk,
      fingerprint,
      createdAtIso: new Date().toISOString(),
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(record))
    } catch {}
    return record
  } catch {
    return null
  }
}

export function importE2eeIdentityRecord(record: E2eeIdentityRecord): boolean {
  if (typeof window === "undefined" || !record?.publicJwk?.x || !record?.privateJwk?.d) return false
  const norm = normalizeIdentityKey(record.userKey)
  try {
    window.localStorage.setItem(`${IDENTITY_STORAGE_PREFIX}${norm}`, JSON.stringify(record))
    return true
  } catch {
    return false
  }
}

async function derivePairwiseAesKey(
  myPrivateJwk: JsonWebKey,
  peerPublicJwk: JsonWebKey
): Promise<CryptoKey> {
  const priv = await window.crypto.subtle.importKey(
    "jwk",
    myPrivateJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits"]
  )
  const pub = await window.crypto.subtle.importKey(
    "jwk",
    peerPublicJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  )
  const sharedBits = await window.crypto.subtle.deriveBits(
    { name: "ECDH", public: pub },
    priv,
    256
  )
  const hkdfBase = await window.crypto.subtle.importKey("raw", sharedBits, "HKDF", false, [
    "deriveKey",
  ])
  return window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("connectln-e2ee-v1-salt"),
      info: new TextEncoder().encode("connectln-e2ee-v1-aes256gcm"),
    },
    hkdfBase,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

async function deriveSelfAesKey(identity: E2eeIdentityRecord): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(
    `${identity.privateJwk.d || ""}|${identity.publicJwk.x || ""}|connectln-self-e2ee`
  )
  const digest = await window.crypto.subtle.digest("SHA-256", secretBytes)
  return window.crypto.subtle.importKey("raw", digest, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ])
}

export function isE2eeEnvelope(text?: string): boolean {
  const trimmed = String(text || "").trim()
  return trimmed.startsWith(E2EE_ENVELOPE_PREFIX) && trimmed.endsWith(E2EE_ENVELOPE_SUFFIX)
}

export async function encryptE2eeEnvelope(
  plaintext: string,
  myIdentity: E2eeIdentityRecord,
  recipientPublicJwk?: JsonWebKey | null
): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return plaintext
  }
  const hasPeerKey = Boolean(recipientPublicJwk && recipientPublicJwk.x && recipientPublicJwk.y)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const aesKey = hasPeerKey
    ? await derivePairwiseAesKey(myIdentity.privateJwk, recipientPublicJwk!)
    : await deriveSelfAesKey(myIdentity)

  const ctBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(plaintext)
  )

  const payload: E2eeEnvelopePayload = {
    v: 1,
    alg: hasPeerKey ? "ECDH-P256-AES256GCM" : "SELF-AES256GCM",
    spub: myIdentity.publicJwk,
    rpub: hasPeerKey ? recipientPublicJwk : null,
    fp: myIdentity.fingerprint,
    iv: bytesToBase64Url(iv),
    ct: bytesToBase64Url(new Uint8Array(ctBuffer)),
  }

  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  return `${E2EE_ENVELOPE_PREFIX}${encoded}${E2EE_ENVELOPE_SUFFIX}`
}

export async function decryptE2eeEnvelope(
  text: string,
  myIdentity: E2eeIdentityRecord | null
): Promise<{ ok: boolean; plaintext?: string; alg?: string; reason?: string }> {
  if (!isE2eeEnvelope(text)) {
    return { ok: true, plaintext: text }
  }
  if (!myIdentity || typeof window === "undefined" || !window.crypto?.subtle) {
    return {
      ok: false,
      reason: "Browser WebCrypto identity unavailable — unlock or restore your E2EE backup.",
    }
  }

  try {
    const inner = text.trim().slice(E2EE_ENVELOPE_PREFIX.length, -E2EE_ENVELOPE_SUFFIX.length)
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(inner))
    ) as E2eeEnvelopePayload

    const iv = base64UrlToBytes(payload.iv)
    const ct = base64UrlToBytes(payload.ct)
    const myPubCanon = canonicalPublicKeyString(myIdentity.publicJwk)
    const senderPubCanon = payload.spub ? canonicalPublicKeyString(payload.spub) : ""
    const recipPubCanon = payload.rpub ? canonicalPublicKeyString(payload.rpub) : ""

    if (payload.alg === "SELF-AES256GCM") {
      if (senderPubCanon && senderPubCanon !== myPubCanon) {
        return {
          ok: false,
          alg: payload.alg,
          reason: "Encrypted on another device — import your encrypted backup to decrypt.",
        }
      }
      const selfKey = await deriveSelfAesKey(myIdentity)
      const ptBuf = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        selfKey,
        ct as BufferSource
      )
      return {
        ok: true,
        alg: payload.alg,
        plaintext: new TextDecoder().decode(ptBuf),
      }
    }

    let peerKey: JsonWebKey | null = null
    if (senderPubCanon === myPubCanon && payload.rpub) {
      peerKey = payload.rpub
    } else if (recipPubCanon === myPubCanon && payload.spub) {
      peerKey = payload.spub
    }

    if (!peerKey) {
      return {
        ok: false,
        alg: payload.alg,
        reason: "Encrypted on another device — import your encrypted backup to decrypt.",
      }
    }

    const aesKey = await derivePairwiseAesKey(myIdentity.privateJwk, peerKey)
    const ptBuf = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      aesKey,
      ct as BufferSource
    )
    return {
      ok: true,
      alg: payload.alg,
      plaintext: new TextDecoder().decode(ptBuf),
    }
  } catch {
    return {
      ok: false,
      reason: "Encrypted on another device or key mismatch — import your encrypted backup to decrypt.",
    }
  }
}

export async function encryptVaultBackup(
  payload: Record<string, unknown>,
  passphrase: string
): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("WebCrypto is required for encrypted backups.")
  }
  const cleanPass = String(passphrase || "")
  if (cleanPass.length < 6) {
    throw new Error("Please use a passphrase of at least 6 characters.")
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(cleanPass),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  const aesKey = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  )

  const ctBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(payload))
  )

  return JSON.stringify(
    {
      format: "connectln-e2ee-backup-v1",
      alg: "PBKDF2-SHA256-AES256GCM",
      iter: 150000,
      salt: bytesToBase64Url(salt),
      iv: bytesToBase64Url(iv),
      ct: bytesToBase64Url(new Uint8Array(ctBuffer)),
      createdAtIso: new Date().toISOString(),
    },
    null,
    2
  )
}

export async function decryptVaultBackup(
  rawJson: string,
  passphrase: string
): Promise<Record<string, unknown>> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("WebCrypto is required to restore backups.")
  }
  const parsed = JSON.parse(rawJson)
  if (parsed?.format !== "connectln-e2ee-backup-v1" || !parsed?.salt || !parsed?.iv || !parsed?.ct) {
    throw new Error("Unrecognized backup format (expected connectln-e2ee-backup-v1).")
  }

  const salt = base64UrlToBytes(parsed.salt)
  const iv = base64UrlToBytes(parsed.iv)
  const ct = base64UrlToBytes(parsed.ct)
  const iterations = Number(parsed.iter) || 150000

  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  const aesKey = await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  )

  try {
    const ptBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      aesKey,
      ct as BufferSource
    )
    return JSON.parse(new TextDecoder().decode(ptBuffer)) as Record<string, unknown>
  } catch {
    throw new Error("Wrong backup passphrase or tampered backup file.")
  }
}

/**
 * Generates a deterministic 25x25 QR-style matrix with 3 corner finder patterns and timing tracks.
 */
export function renderQrMatrix(text: string): boolean[][] {
  const size = 25
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r
        const cc = colOffset + c
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
        reserved[rr][cc] = true
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          grid[rr][cc] = false
        } else {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4
          grid[rr][cc] = isOuter || isCenter
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Alignment marker at (16,16)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = 16 + r
      const cc = 16 + c
      reserved[rr][cc] = true
      grid[rr][cc] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)
    }
  }

  // Timing strips
  for (let i = 8; i < size - 8; i++) {
    reserved[6][i] = true
    reserved[i][6] = true
    grid[6][i] = i % 2 === 0
    grid[i][6] = i % 2 === 0
  }

  // Deterministic PRNG seeded from FNV-1a hashes of input text
  let h1 = 2166136261
  let h2 = 374761393
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 ^= ch
    h1 = Math.imul(h1, 16777619)
    h2 ^= ch * (i + 1)
    h2 = Math.imul(h2, 2246822519)
  }

  let state = (h1 ^ h2) >>> 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue
      state = (Math.imul(state ^ (r * 31 + c), 1664525) + 1013904223) >>> 0
      grid[r][c] = ((state >>> 24) & 1) === 1
    }
  }
  return grid
}

export function buildQrSvgDataUrl(text: string): string {
  const matrix = renderQrMatrix(text || "https://conectln.com")
  const size = matrix.length
  const rects: string[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#1C1917"/>`)
      }
    }
  }
  const viewSize = size + 4
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="${viewSize}" height="${viewSize}" fill="#FFFFFF"/>${rects.join("")}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
