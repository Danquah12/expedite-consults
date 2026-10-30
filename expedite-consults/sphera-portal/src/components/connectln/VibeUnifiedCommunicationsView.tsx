"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  MessageSquare,
  Phone,
  Video,
  Shield,
  Lock,
  Sparkles,
  Users,
  CheckCheck,
  Clock,
  Send,
  Search,
  Pin,
  FileText,
  Globe,
  Cpu,
  Database,
  Layers,
  Key,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sliders,
  Workflow,
  Volume2,
  MonitorUp,
  Captions,
  Smartphone,
  Laptop,
  WifiLow,
  Languages,
  Building2,
  GraduationCap,
  Heart,
  Briefcase,
  Terminal,
  Server,
  Activity,
  FileCode,
  ClipboardCheck,
  UserCheck,
} from "lucide-react"
import { VibeVideoCallStudio } from "./VibeVideoCallStudio"

export interface VibeUnifiedCommunicationsViewProps {
  currentUser?: {
    name?: string
    headline?: string
    avatar?: string
    profession?: string
  }
  onNavigateTab?: (tab: string) => void
  onOpenVibeCampus?: () => void
}

type MainSectionTab =
  | "workspace"
  | "video_call_studio"
  | "arch_schema_api"
  | "state_e2ee_media_rtc"
  | "ops_threat_testing"
  | "roadmap_directive"

type ChatCategoryMode =
  | "all"
  | "work"
  | "family"
  | "school"
  | "church"
  | "customer"
  | "notes"

interface WorkflowCardItem {
  id: string
  sourceMessageId: string
  title: string
  owner: string
  deadline: string
  evidence: string
  status: "Task Created" | "Pending Approval" | "Approved & Record Updated"
  targetRecord: string
}

interface ChatMessageItem {
  id: string
  clientMessageId: string
  serverSequence: number
  sender: string
  role: string
  time: string
  text: string
  translatedText?: Record<string, string>
  isOwn?: boolean
  state: "LOCAL_PENDING" | "SUBMITTED" | "ACCEPTED" | "DELIVERED" | "READ"
  reactions: string[]
  isPinned?: boolean
  attachment?: {
    name: string
    size: string
    objectKey: string
    ciphertextHash: string
  }
  voiceNoteDuration?: string
  retention?: string
}

interface ConversationThread {
  id: string
  name: string
  category: Exclude<ChatCategoryMode, "all">
  subtitle: string
  unread: number
  online: boolean
  typing?: string
  e2ee: boolean
  protocol: string
  keyEpoch: number
  safetyCode: string
  retentionPolicy: string
  membersCount: number
  verifiedOrg?: boolean
  messages: ChatMessageItem[]
}

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: "9b0bbf68-20c8-4416-b82c-0f0e81b8df80",
    name: "Vibe / DeskNote Core E2EE Architecture Room",
    category: "work",
    subtitle: "Private Group · MLS Epoch #12 · Outbox + Cursor Sync",
    unread: 3,
    online: true,
    typing: "Ama Mensah (SecOps) is typing...",
    e2ee: true,
    protocol: "MLS RFC 9420 (Group) + libsignal (1:1)",
    keyEpoch: 12,
    safetyCode: "88412 09341 77210 44198 60125 33910",
    retentionPolicy: "90 Days Server Retention",
    membersCount: 14,
    verifiedOrg: true,
    messages: [
      {
        id: "d2026a74-32dd-40ab-9c64-2a1a1f29a96f",
        clientMessageId: "7aee36d8-7b3f-46c8-9fb1-2db1b725f8a3",
        serverSequence: 5811,
        sender: "Dr. Kwame Osei (Principal Architect)",
        role: "Technical Lead",
        time: "09:14 AM",
        text: "Team, we have frozen the `comm_messages` and `comm_outbox` schema. Every send requires a client-generated `client_message_id` with a unique constraint on `(sender_device_id, client_message_id)` and monotonic `(conversation_id, server_sequence)` allocation inside one PostgreSQL transaction.",
        translatedText: {
          Twi: "Akuo, yɛasiesie `comm_messages` ne `comm_outbox` nhyehyɛeɛ no. Nkra biara hia `client_message_id` ne `(conversation_id, server_sequence)` wɔ PostgreSQL transaction baako mu.",
          French: "Équipe, nous avons figé le schéma `comm_messages` et `comm_outbox`. Chaque envoi exige un `client_message_id` unique et une séquence monotone par conversation.",
          Spanish: "Equipo, hemos congelado el esquema `comm_messages` y `comm_outbox`. Cada envío requiere un `client_message_id` único y secuencia monótona en una transacción PostgreSQL.",
        },
        state: "READ",
        reactions: ["🛡️ 5", "🔥 4"],
        isPinned: true,
        attachment: {
          name: "comm_schema_v1_migration_plan.sql",
          size: "148 KB · AEAD Ciphertext",
          objectKey: "s3://vibe-media-private/f9a82b1c-9940-4d1e-8812",
          ciphertextHash: "sha256:9f86d081884c7d659a2feaa0c55ad015",
        },
      },
      {
        id: "e9182b44-11ca-49d0-812a-99012f38a112",
        clientMessageId: "3bc910a2-551e-41c0-8812-00192b84a110",
        serverSequence: 5812,
        sender: "Ama Mensah (Security & Cryptography Lead)",
        role: "Cryptography Lead",
        time: "09:18 AM",
        text: "Decision confirmed: When a member is removed from a group, `DELETE /v1/conversations/{id}/members/{userId}` increments the MLS `recipient_key_epoch` to 13 and rejects any stale epoch envelopes (`KEY_EPOCH_STALE`).",
        translatedText: {
          Twi: "Gyinaesi: Sɛ wɔyi obi firi kuo mu a, MLS `recipient_key_epoch` kɔ soro kɔ 13 na ɛpo old key biara (`KEY_EPOCH_STALE`).",
          French: "Décision confirmée : Lors du retrait d'un membre, l'époque MLS passe à 13 et rejette toute enveloppe obsolète (`KEY_EPOCH_STALE`).",
          Spanish: "Decisión confirmada: Al eliminar un miembro, la época MLS sube a 13 y rechaza sobres antiguos (`KEY_EPOCH_STALE`).",
        },
        state: "READ",
        reactions: ["✅ 6", "🔒 5"],
      },
      {
        id: "f4401c88-882a-4c12-901a-77281a90c331",
        clientMessageId: "99102abc-221a-4001-991a-88271654a001",
        serverSequence: 5813,
        sender: "Kofi Boateng (Mobile & WebRTC Engineer)",
        role: "Client Lead",
        time: "09:24 AM",
        text: "Voice Note Summary: Tested Wi-Fi-to-cellular TURN handoff and iOS Keychain / Android Keystore prekey rotation across 10,000 reconnects. Zero duplicate messages and zero orphaned mic/camera locks.",
        voiceNoteDuration: "01:24",
        state: "DELIVERED",
        reactions: ["👏 4"],
      },
    ],
  },
  {
    id: "conv-customer-inbox",
    name: "Enterprise Customer & Supplier Desk",
    category: "customer",
    subtitle: "Workspace Channel · Scoped Webhooks · SLA < 4m",
    unread: 1,
    online: true,
    e2ee: false,
    protocol: "TLS 1.3 + KMS Envelope (Workspace Mode)",
    keyEpoch: 4,
    safetyCode: "WORKSPACE-KMS-AUDITED-ENCLAVE",
    retentionPolicy: "7 Years Compliance",
    membersCount: 8,
    verifiedOrg: true,
    messages: [
      {
        id: "msg-201",
        clientMessageId: "c112-8891-0019",
        serverSequence: 912,
        sender: "lina.chen@nordic-grid.io (VP Procurement)",
        role: "External Partner",
        time: "10:02 AM",
        text: "Hello Vibe & DeskNote Team — we reviewed the Phase 2 Microgrid telemetry proposal. Once we approve the $148,000 milestone today, can our field engineers join a browser WebRTC session at 14:00 UTC?",
        state: "READ",
        reactions: ["💼 3"],
      },
    ],
  },
  {
    id: "conv-school-cohort",
    name: "Vibe Study & OWASP MASVS Cohort #14",
    category: "school",
    subtitle: "Study Community · 128 Members · On-Device AI Notes",
    unread: 2,
    online: true,
    e2ee: true,
    protocol: "MLS RFC 9420 Group E2EE",
    keyEpoch: 7,
    safetyCode: "41029 88512 33019 77412 11904 55821",
    retentionPolicy: "Semester Retention",
    membersCount: 128,
    messages: [
      {
        id: "msg-301",
        clientMessageId: "c301-9910-1120",
        serverSequence: 1408,
        sender: "Prof. Esi Sutherland-Addy",
        role: "Cohort Lead",
        time: "Yesterday",
        text: "Lecture Recap: Never promise that a server-side AI can search or summarize all private conversations while also claiming that the server cannot read those conversations. Use on-device processing or explicit user-selected sharing.",
        state: "READ",
        reactions: ["🎓 19", "💡 12"],
        isPinned: true,
      },
    ],
  },
  {
    id: "conv-church-ministry",
    name: "Grace Community & Ministry Broadcast",
    category: "church",
    subtitle: "Community Hub · 410 Members · Announcements & RSVPs",
    unread: 0,
    online: true,
    e2ee: true,
    protocol: "MLS RFC 9420",
    keyEpoch: 3,
    safetyCode: "99201 44102 66391 20194 88371 00291",
    retentionPolicy: "Keep Forever",
    membersCount: 410,
    messages: [
      {
        id: "msg-401",
        clientMessageId: "c401-7721-0091",
        serverSequence: 310,
        sender: "Rev. Samuel Mensah",
        role: "Community Admin",
        time: "08:00 AM",
        text: "Saturday Youth Coding & Robotics Scholarship Workshop starts at 09:30 AM in Hall B and via Vibe Low-Bandwidth WebRTC Stream. 84 RSVPs confirmed!",
        state: "READ",
        reactions: ["🙏 34", "❤️ 21"],
      },
    ],
  },
  {
    id: "conv-family-vault",
    name: "Asiedu Family Private Vault",
    category: "family",
    subtitle: "1:1 & Family E2EE · Disappearing 7d · Client Backup Key",
    unread: 0,
    online: true,
    e2ee: true,
    protocol: "Signal Double Ratchet / MLS",
    keyEpoch: 9,
    safetyCode: "77712 00192 84712 99102 38471 66510",
    retentionPolicy: "Disappearing 7 Days",
    membersCount: 9,
    messages: [
      {
        id: "msg-501",
        clientMessageId: "c501-8812-3310",
        serverSequence: 412,
        sender: "Nana Yaa",
        role: "Family Admin",
        time: "11:15 AM",
        text: "Uploaded the encrypted land title deed scan to our family vault. Thumbnail and file bytes were encrypted client-side before presigned S3 upload.",
        state: "READ",
        reactions: ["❤️ 7", "🔒 4"],
      },
    ],
  },
  {
    id: "conv-private-notes",
    name: "DeskNote Personal E2EE Scratchpad",
    category: "notes",
    subtitle: "Linked Devices: Web · Android · iOS",
    unread: 0,
    online: true,
    e2ee: true,
    protocol: "Per-Device Self-Session E2EE",
    keyEpoch: 2,
    safetyCode: "SELF-DEVICE-MASTER-KEY-VERIFIED",
    retentionPolicy: "Permanent Vault",
    membersCount: 1,
    messages: [
      {
        id: "msg-601",
        clientMessageId: "c601-1102-9981",
        serverSequence: 88,
        sender: "You (DeskNote Sync)",
        role: "Architect Note",
        time: "11:40 AM",
        text: "Outbox Rule: Never make the PostgreSQL transaction depend on a successful push notification or live recipient socket. Commit `comm_messages` + `comm_outbox` atomically, then publish via `FOR UPDATE SKIP LOCKED`.",
        state: "READ",
        reactions: ["📌 1"],
        isPinned: true,
      },
    ],
  },
]

// SECTION 1: EXPLICIT ASSUMPTIONS
const EXPLICIT_ASSUMPTIONS = [
  {
    area: "Identity",
    assumption: "Vibe's existing stable user ID (`user_id`) and authentication remain authoritative; no duplicate user directory.",
  },
  {
    area: "Backend",
    assumption: "Existing custom API and business logic are reused via adapters where suitable without migrating languages.",
  },
  {
    area: "Client apps",
    assumption: "Web, Android, and iOS are supported; encryption and real-time state machines are consistent across all three.",
  },
  {
    area: "Cloud",
    assumption: "Existing cloud provider, PostgreSQL database, object storage, and deployment tools are retained where practical.",
  },
  {
    area: "Messaging",
    assumption: "Text, attachments, group conversations, read receipts, typing indicators, and cursor-based offline delivery are required.",
  },
  {
    area: "Encryption",
    assumption: "Private 1:1 chats and calls require E2EE (`libsignal` / WebRTC media key verification). Private group E2EE uses MLS (RFC 9420).",
  },
  {
    area: "AI Brain",
    assumption: "Vibe's AI Brain assists only when permitted by the privacy model: on-device processing or explicit user-selected sharing.",
  },
  {
    area: "Existing users",
    assumption: "Existing accounts and content migrate seamlessly without forcing duplicate accounts or disrupting current workflows.",
  },
]

// SECTION 2: 8 SERVICE BOUNDARIES ("OWNS" VS "MUST NOT OWN")
const SERVICE_BOUNDARIES = [
  {
    component: "1. Identity adapter",
    owns: "Existing user identities, session tokens, account status, authorization claims",
    mustNotOwn: "A competing user directory or copied password hashes",
  },
  {
    component: "2. Conversation service",
    owns: "Conversation membership, roles, settings, group lifecycle, membership epochs",
    mustNotOwn: "Plaintext private messages",
  },
  {
    component: "3. Realtime messaging service",
    owns: "Connection sessions, message acceptance, sequence allocation, routing, delivery state",
    mustNotOwn: "Long-term cryptographic private keys",
  },
  {
    component: "4. Device & key directory",
    owns: "Registered devices, public identity keys, signed prekeys, MLS key packages, key-change events",
    mustNotOwn: "Users' private encryption keys",
  },
  {
    component: "5. Media service",
    owns: "Presigned upload sessions, opaque encrypted blobs, download authorization, retention cleanup",
    mustNotOwn: "Decryption keys or plaintext private media/thumbnails",
  },
  {
    component: "6. Calling service",
    owns: "Call setup, participant/device signaling, call lifecycle state machine, short-lived TURN credentials",
    mustNotOwn: "Decrypted call audio or video streams",
  },
  {
    component: "7. Notification worker",
    owns: "APNs/FCM push wakeup, notification preferences, exponential retry policy",
    mustNotOwn: "Plaintext message content by default",
  },
  {
    component: "8. Abuse & trust service",
    owns: "Reports, blocks, graduated rate limits, spam velocity signals, enforcement audit records",
    mustNotOwn: "A universal backdoor or ability to decrypt private conversations",
  },
]

// SECTION 3: 14 CORE RELATIONAL TABLES
const CORE_RELATIONAL_TABLES = [
  {
    table: "comm_devices",
    fields: "id, user_id, platform, device_name, registered_at, revoked_at, last_seen_at",
    purpose: "One row per authorized client device (Web, Android, iOS)",
  },
  {
    table: "comm_conversations",
    fields: "id, type, created_by, created_at, updated_at, encryption_mode, settings_json",
    purpose: "Direct chats, private groups, communities, and channels",
  },
  {
    table: "comm_memberships",
    fields: "conversation_id, user_id, role, joined_at, left_at, membership_version",
    purpose: "Membership, RBAC roles, and versioned cryptographic epoch authorization",
  },
  {
    table: "comm_messages",
    fields: "id, conversation_id, sender_user_id, sender_device_id, client_message_id, server_sequence, message_type, accepted_at, expires_at",
    purpose: "Durable ciphertext message envelopes and monotonic per-conversation ordering",
  },
  {
    table: "comm_message_recipients",
    fields: "message_id, device_id, delivery_state, delivered_at, read_at",
    purpose: "Per-device delivery and read state tracking across linked devices",
  },
  {
    table: "comm_attachments",
    fields: "id, message_id, object_key, ciphertext_size, ciphertext_hash, media_type_hint, created_at, expires_at",
    purpose: "Encrypted attachment metadata (content key stays inside E2EE envelope)",
  },
  {
    table: "comm_device_keys",
    fields: "device_id, identity_key_public, signed_prekey_public, signature, key_version, published_at",
    purpose: "Public device identity & signed prekey records",
  },
  {
    table: "comm_prekey_inventory",
    fields: "device_id, prekey_id, public_key, consumed_at",
    purpose: "One-time public prekeys for asynchronous X3DH session establishment",
  },
  {
    table: "comm_key_packages",
    fields: "device_id, package_id, package_blob, consumed_at, expires_at",
    purpose: "IETF MLS (RFC 9420) key packages for scalable group E2EE",
  },
  {
    table: "comm_calls",
    fields: "id, initiator_user_id, call_type, state, started_at, ended_at",
    purpose: "Authoritative WebRTC call session lifecycle",
  },
  {
    table: "comm_call_participants",
    fields: "call_id, user_id, device_id, joined_at, left_at, participant_state",
    purpose: "Per-device call participation and ringing/connected state",
  },
  {
    table: "comm_blocks",
    fields: "blocker_user_id, blocked_user_id, created_at",
    purpose: "User blocking and contact initiation restrictions",
  },
  {
    table: "comm_reports",
    fields: "id, reporter_user_id, target_type, target_id, reason_code, status, created_at",
    purpose: "Moderation reports with user-consented decrypted evidence",
  },
  {
    table: "comm_outbox",
    fields: "event_id, aggregate_type, aggregate_id, event_type, payload, created_at, published_at",
    purpose: "Transactional outbox pattern (`FOR UPDATE SKIP LOCKED`) for guaranteed event publishing",
  },
]

// SECTION 4: 14 CORE HTTP ENDPOINTS
const CORE_HTTP_ENDPOINTS = [
  { endpoint: "POST /v1/devices", purpose: "Register an authenticated device", auth: "Valid user session" },
  { endpoint: "GET /v1/devices", purpose: "List the user's active devices", auth: "Own account" },
  { endpoint: "DELETE /v1/devices/{deviceId}", purpose: "Revoke a device", auth: "Own account + step-up auth" },
  { endpoint: "PUT /v1/devices/{deviceId}/keys", purpose: "Publish public identity keys & prekeys/MLS packages", auth: "Device-bound authorization" },
  { endpoint: "POST /v1/conversations", purpose: "Create direct or group conversation", auth: "Authenticated user" },
  { endpoint: "GET /v1/conversations", purpose: "List conversations and sync cursors", auth: "Member" },
  { endpoint: "POST /v1/conversations/{id}/members", purpose: "Add members & bump membership epoch", auth: "Authorized group role" },
  { endpoint: "DELETE /v1/conversations/{id}/members/{userId}", purpose: "Remove member & rotate group key epoch", auth: "Authorized group role" },
  { endpoint: "POST /v1/conversations/{id}/messages", purpose: "Submit an encrypted message envelope", auth: "Active member & authorized device" },
  { endpoint: "GET /v1/conversations/{id}/messages?after={cursor}", purpose: "Retrieve history or sync ordered deltas", auth: "Active member" },
  { endpoint: "POST /v1/media/uploads", purpose: "Request a short-lived presigned upload URL", auth: "Authenticated user & quota check" },
  { endpoint: "POST /v1/media/{id}/complete", purpose: "Confirm ciphertext upload & hash metadata", auth: "Upload owner" },
  { endpoint: "POST /v1/calls", purpose: "Create a WebRTC call session & issue TURN creds", auth: "Authenticated user" },
  { endpoint: "POST /v1/reports", purpose: "Submit an abuse report with user-selected evidence", auth: "Authenticated user" },
]

// SECTION 5: MESSAGE STATE MACHINE
const MESSAGE_STATES = [
  {
    state: "LOCAL_PENDING",
    trigger: "Client creates message & encrypts locally",
    nextState: "SUBMITTED",
    rule: "Persist locally in SQLite/IndexedDB with `client_message_id` before network send.",
  },
  {
    state: "SUBMITTED",
    trigger: "Send over WebSocket or HTTP `POST /v1/conversations/{id}/messages`",
    nextState: "ACCEPTED (or retry on timeout)",
    rule: "On timeout or connection loss, retry with the exact same `client_message_id`.",
  },
  {
    state: "ACCEPTED",
    trigger: "Server validates membership, commits `comm_messages` + `comm_outbox`",
    nextState: "AVAILABLE / DELIVERING",
    rule: "Server returns authoritative `message_id`, `server_sequence`, and `accepted_at`.",
  },
  {
    state: "AVAILABLE / DELIVERING",
    trigger: "Outbox publisher emits to broker; gateway routes or client syncs cursor",
    nextState: "DELIVERED",
    rule: "Offline devices pull ordered deltas via `after={cursor}` upon reconnect.",
  },
  {
    state: "DELIVERED",
    trigger: "Recipient device validates & decrypts ciphertext, emits delivery receipt",
    nextState: "READ (optional)",
    rule: "Tracked per-device in `comm_message_recipients`; never overwritten by slower devices.",
  },
  {
    state: "EXPIRED / FAILED",
    trigger: "Retention TTL elapses or explicit tombstone/deletion policy applies",
    nextState: "TOMBSTONED / PURGED",
    rule: "Deletes server ciphertext & client local copy per retention policy.",
  },
]

// SECTION 12: 14-THREAT SECURITY MODEL
const THREAT_MODEL_ROWS = [
  { threat: "Account takeover", attack: "Stolen token or SIM-based recovery abuse", mitigation: "Strong session controls, device inventory, step-up auth, instant revocation" },
  { threat: "Rogue device enrollment", attack: "Attacker silently links a new device", mitigation: "Explicit device approval, key-change alerts, QR linking, device audit history" },
  { threat: "Malicious server / operator", attack: "Attempts to read private chats", mitigation: "Client-side E2EE (Signal/MLS), minimal metadata, independent security review" },
  { threat: "Replay or message forgery", attack: "Replaying old envelopes or spoofing senders", mitigation: "Protocol replay protection, `(sender_device_id, client_message_id)` uniqueness, device binding" },
  { threat: "Membership race", attack: "Removed member still receives group messages", mitigation: "Versioned membership epochs, MLS key updates, `KEY_EPOCH_STALE` rejection" },
  { threat: "Media abuse", attack: "Oversized uploads, malicious files, storage exhaustion", mitigation: "Quotas, rate limits, ciphertext size caps, orphaned upload cleanup, safe rendering" },
  { threat: "WebSocket abuse", attack: "Connection exhaustion or event flooding", mitigation: "Per-user/device/IP limits, connection budgets, gateway backpressure" },
  { threat: "Spam and harassment", attack: "Bulk unsolicited messages or repeated calls", mitigation: "Graduated new-account limits, block/report, invitation controls, adaptive throttling" },
  { threat: "Notification leakage", attack: "Message text shown on a lock screen", mitigation: "Blinded/generic wakeup push notifications by default, user-controlled previews" },
  { threat: "Metadata exposure", attack: "Server learns relationships and activity", mitigation: "Retention limits, minimal event fields, restricted staff access, transparent privacy policy" },
  { threat: "Supply-chain compromise", attack: "Malicious dependency or build artifact", mitigation: "Pinned dependencies, SBOM generation, signed builds, protected CI/CD" },
  { threat: "Insider misuse", attack: "Staff browse sensitive records", mitigation: "Least privilege DB roles, just-in-time access, immutable audit trails, 4-eyes approvals" },
  { threat: "Backup exposure", attack: "Recovery keys or backups stolen", mitigation: "Client-side encrypted backups, user-held recovery key, zero server plaintext" },
  { threat: "Denial of service", attack: "Flooding calls, messages, or media", mitigation: "Quotas, admission control, per-tenant limits, circuit breakers, regional TURN capacity" },
]

// SECTION 17 & 18: PHASED IMPLEMENTATION & PRIORITIZED BACKLOG
const PHASED_SCHEDULE = [
  {
    phase: "Phase 0 (Weeks 1–3)",
    name: "Discovery & Architecture Freeze",
    goals: [
      "Inventory auth, DB, APIs, cloud, queues & clients",
      "Define 8 service boundaries & reuse adapters",
      "Run cross-platform E2EE PoC (`libsignal` + MLS)",
      "Complete threat model, OpenAPI & event schemas",
    ],
    exit: "Approved architecture, cost model, security review plan & protocol PoC.",
  },
  {
    phase: "Phase 1 (Weeks 4–9)",
    name: "Durable Messaging Foundation",
    goals: [
      "Integrate existing Vibe `user_id` & device registry",
      "Implement `comm_messages` + `comm_outbox` persistence",
      "Add monotonic `server_sequence` & idempotency",
      "WebSocket delivery, cursor sync & 1:1 E2EE in test",
    ],
    exit: "Online/offline messaging works across Web, Android & iOS; duplicate-send tests pass.",
  },
  {
    phase: "Phase 2 (Weeks 10–15)",
    name: "Multi-Device & Encrypted Media",
    goals: [
      "Secure device linking & multi-device session sync",
      "Key-change alerts & device revocation enforcement",
      "Client-encrypted media presigned upload/download",
      "Block/report flows & blinded APNs/FCM push",
    ],
    exit: "Device revocation, media confidentiality & broker fault-injection tests pass.",
  },
  {
    phase: "Phase 3 (Weeks 16–21)",
    name: "WebRTC Voice & Video Calls",
    goals: [
      "Call signaling APIs & state machine (`CREATED` → `ENDED`)",
      "Deploy redundant regional STUN/TURN relays",
      "Web, Android & iOS WebRTC integration",
      "End-to-end media-key verification & handoff tests",
    ],
    exit: "Call setup, media confidentiality, TURN fallback & network-resilience targets pass.",
  },
  {
    phase: "Phase 4 (Weeks 22–26)",
    name: "Groups, Workspaces & Customization",
    goals: [
      "MLS group encryption & membership epoch updates",
      "Group roles, channels, announcements & admin controls",
      "Validated `workspace_settings` themes & layouts",
      "Scoped webhooks & user-triggered AI workflows",
    ],
    exit: "Group removal/addition epoch security, schema validation & RBAC tests pass.",
  },
  {
    phase: "Phase 5 (Weeks 27–36)",
    name: "Security Hardening & Staged Rollout",
    goals: [
      "Independent cryptographic & OWASP ASVS/MASVS review",
      "Production load, soak & chaos failover drills",
      "Verify RPO <= 5m / RTO <= 1h backup restoration",
      "Limited cohort launch → gradual telemetry expansion",
    ],
    exit: "All non-negotiable release gates pass & production SLOs (`p95 < 300ms`) measured.",
  },
]

const PRIORITIZED_BACKLOG = [
  { priority: "P0", item: "Existing infrastructure inventory", dep: "None", dod: "Documented systems, owners, risks, and reuse decisions" },
  { priority: "P0", item: "E2EE protocol decision", dep: "Security review", dod: "Approved protocol, license review, cross-platform PoC" },
  { priority: "P0", item: "Device identity and revocation", dep: "Identity integration", dod: "Device lifecycle and revocation tests pass" },
  { priority: "P0", item: "Message schema and idempotency", dep: "Database design", dod: "Retries never create duplicate visible messages" },
  { priority: "P0", item: "Durable acceptance and outbox", dep: "Message schema", dod: "Accepted messages survive worker/broker outage" },
  { priority: "P0", item: "Offline sync", dep: "Durable message storage", dod: "Reconnect reconciles all retained message events" },
  { priority: "P0", item: "Private chat E2EE", dep: "Protocol decision", dod: "Cross-platform encryption test vectors pass" },
  { priority: "P1", item: "Encrypted attachments", dep: "E2EE & media service", dod: "Server stores ciphertext; recipient decrypts locally" },
  { priority: "P1", item: "Push notifications", dep: "Device registration", dod: "No sensitive content leaks on lock screen by default" },
  { priority: "P1", item: "Block/report and anti-spam", dep: "Messaging foundation", dod: "Abuse scenarios and enforcement controls pass" },
  { priority: "P1", item: "WebRTC one-to-one calls", dep: "Device identity & signaling", dod: "Call setup and E2EE media-key acceptance criteria pass" },
  { priority: "P1", item: "Multi-device linking", dep: "Key lifecycle", dod: "Secure enrollment, revocation, and sync pass" },
  { priority: "P1", item: "Group E2EE", dep: "Group protocol decision", dod: "Addition/removal and `KEY_EPOCH_STALE` tests pass" },
  { priority: "P2", item: "Communities / workspaces", dep: "Group membership", dod: "Role-based access and admin controls work" },
  { priority: "P2", item: "Custom themes and settings", dep: "Workspace model", dod: "Schema validation and authorization pass" },
  { priority: "P2", item: "AI and integrations", dep: "Privacy design", dod: "Explicit consent, scoped permissions, and auditability work" },
  { priority: "P2", item: "Scale and disaster recovery", dep: "Production telemetry", dod: "99.9% availability, RPO <= 5m, RTO <= 1h demonstrated" },
]

const MANDATORY_E2E_SCENARIOS = [
  { id: "e2e-1", label: "1. User A sends encrypted message while B is online; B decrypts and emits authenticated delivery receipt." },
  { id: "e2e-2", label: "2. User A sends while B is offline; server accepts envelope and B retrieves it via cursor delta after reconnecting." },
  { id: "e2e-3", label: "3. Client times out after submission, retries with same `client_message_id`, and creates zero duplicate messages." },
  { id: "e2e-4", label: "4. Broker is unavailable after DB transaction commits; `comm_outbox` publisher later delivers the event." },
  { id: "e2e-5", label: "5. User revokes an old device (`DELETE /v1/devices/{id}`); it cannot receive new messages or establish sessions." },
  { id: "e2e-6", label: "6. Group member is removed; MLS/group epoch update prevents access to future group messages." },
  { id: "e2e-7", label: "7. Presigned media upload completes but message send fails; retention worker cleans up orphaned encrypted blob." },
  { id: "e2e-8", label: "8. WebRTC call fails on direct P2P path and succeeds automatically through redundant TURN relay." },
  { id: "e2e-9", label: "9. Mobile client loses connectivity during call and recovers without leaving mic or camera capture active after call ends." },
  { id: "e2e-10", label: "10. User reports a private message; only explicitly selected decrypted evidence enters `comm_reports` moderation workflow." },
]

export function VibeUnifiedCommunicationsView({
  currentUser,
  onOpenVibeCampus,
}: VibeUnifiedCommunicationsViewProps) {
  const [activeMainTab, setActiveMainTab] = useState<MainSectionTab>("video_call_studio")
  const [joinedCallRoomId, setJoinedCallRoomId] = useState<string | null>(null)

  // If a friend clicks a Direct Meeting Link (?tab=vibecomms&joinCall=...), auto-launch the Live Video & Call Studio!
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const joinCallParam = params.get("joinCall")
    if (joinCallParam) {
      setJoinedCallRoomId(joinCallParam)
      setActiveMainTab("video_call_studio")
    }
  }, [])

  // Live Workspace state
  const [chatCategory, setChatCategory] = useState<ChatCategoryMode>("all")
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS)
  const [selectedConvId, setSelectedConvId] = useState<string>(INITIAL_CONVERSATIONS[0].id)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTranslationLang, setSelectedTranslationLang] = useState<string>("Original")
  const [interfaceDensity, setInterfaceDensity] = useState<"compact" | "comfortable">("comfortable")
  const [showSafetyModal, setShowSafetyModal] = useState(false)

  // WebRTC Call state machine (`CREATED` -> `RINGING` -> `NEGOTIATING` -> `CONNECTED` -> `RECONNECTING` -> `ENDED`)
  const [callState, setCallState] = useState<
    "IDLE" | "CREATED" | "RINGING" | "NEGOTIATING" | "CONNECTED" | "RECONNECTING"
  >("IDLE")
  const [callMode, setCallMode] = useState<"audio" | "video" | "screenshare">("video")
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false)
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [liveCaptions, setLiveCaptions] = useState(true)
  const [activeCallDevice, setActiveCallDevice] = useState<"Web Client" | "Android Pixel 9" | "iOS iPhone 16">(
    "Web Client"
  )

  // Noctis Brain state
  const [aiConsentMode, setAiConsentMode] = useState<"on_device" | "explicit_share">("on_device")
  const [aiOutputTitle, setAiOutputTitle] = useState<string>(
    "Noctis Brain — Respecting the E2EE Boundary (Section 6.5)"
  )
  const [aiOutputContent, setAiOutputContent] = useState<string>(
    "Server-side AI never reads private E2EE conversations. Choose an action below to run On-Device inference or explicitly share selected decrypted messages."
  )

  // Conversation-to-Workflow items
  const [workflows, setWorkflows] = useState<WorkflowCardItem[]>([
    {
      id: "wf-901",
      sourceMessageId: "d2026a74-32dd-40ab-9c64-2a1a1f29a96f",
      title: "Deploy `comm_messages` + `comm_outbox` migration with `FOR UPDATE SKIP LOCKED` publisher",
      owner: "Dr. Kwame Osei",
      deadline: "Phase 1 · Week 5",
      evidence: "comm_schema_v1_migration_plan.sql",
      status: "Pending Approval",
      targetRecord: "Backlog P0 · Durable Acceptance & Outbox",
    },
    {
      id: "wf-902",
      sourceMessageId: "e9182b44-11ca-49d0-812a-99012f38a112",
      title: "Enforce `KEY_EPOCH_STALE` rejection on group member removal",
      owner: "Ama Mensah (SecOps)",
      deadline: "Phase 4 · Week 22",
      evidence: "MLS RFC 9420 Epoch Test Suite",
      status: "Approved & Record Updated",
      targetRecord: "Backlog P1 · Group E2EE",
    },
  ])

  // Section 5: Interactive State Machine Simulator
  const [selectedStateIdx, setSelectedStateIdx] = useState<number>(2)

  // Section 15: 10 Mandatory E2E Scenarios checklist
  const [verifiedScenarios, setVerifiedScenarios] = useState<Record<string, boolean>>({
    "e2e-1": true,
    "e2e-2": true,
    "e2e-3": true,
    "e2e-4": true,
    "e2e-5": true,
    "e2e-6": true,
    "e2e-7": true,
    "e2e-8": true,
    "e2e-9": true,
    "e2e-10": true,
  })

  // Section 20: 5 Decisions to Finalize Before Implementation
  const [decStack, setDecStack] = useState("Reuse Existing Node.js/TypeScript + Python Backend + Dedicated WebSocket Gateway")
  const [decEncryptionScope, setDecEncryptionScope] = useState("1:1 E2EE (`libsignal`) + Private Group E2EE (IETF MLS RFC 9420) at Launch")
  const [decGroupCalls, setDecGroupCalls] = useState("1:1 WebRTC + Redundant TURN at Launch → SFU Group Calls with E2EE Media Keys in Phase 3")
  const [decDeviceModel, setDecDeviceModel] = useState("Multi-Device (Web, Android, iOS) with Independent Device Keys & Authenticated QR Linking")
  const [decScaleTarget, setDecScaleTarget] = useState("99.9% Availability · Acceptance p95 < 300ms · Online Delivery p95 < 1s · RPO <= 5m · RTO <= 1h")
  const [directiveCopied, setDirectiveCopied] = useState(false)

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0]
  }, [conversations, selectedConvId])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesCat = chatCategory === "all" || c.category === chatCategory
      const matchesQuery =
        !searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCat && matchesQuery
    })
  }, [conversations, chatCategory, searchQuery])

  const verifiedScenarioCount = useMemo(
    () => Object.values(verifiedScenarios).filter(Boolean).length,
    [verifiedScenarios]
  )

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    const nextSeq =
      (selectedConversation.messages[selectedConversation.messages.length - 1]?.serverSequence || 5810) + 1
    const newMsg: ChatMessageItem = {
      id: `msg-${Date.now()}`,
      clientMessageId: crypto.randomUUID ? crypto.randomUUID() : `client-uuid-${Date.now()}`,
      serverSequence: nextSeq,
      sender: currentUser?.name || "You (Authorized Device)",
      role: currentUser?.profession || "Principal Architect",
      time: "Just now",
      text: messageInput.trim(),
      isOwn: true,
      state: "ACCEPTED",
      reactions: [`Epoch #${selectedConversation.keyEpoch}`],
      retention: selectedConversation.retentionPolicy,
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, messages: [...c.messages, newMsg] } : c))
    )
    setMessageInput("")
  }

  const handleConvertMessageToWorkflow = (msg: ChatMessageItem) => {
    const newWf: WorkflowCardItem = {
      id: `wf-${Date.now().toString().slice(-4)}`,
      sourceMessageId: msg.id,
      title: msg.text.length > 76 ? `${msg.text.slice(0, 76)}...` : msg.text,
      owner: currentUser?.name || "Assigned Engineer",
      deadline: "In 48 Hours",
      evidence: msg.attachment?.name || `seq:${msg.serverSequence} (${msg.clientMessageId.slice(0, 8)})`,
      status: "Task Created",
      targetRecord: `${selectedConversation.name}`,
    }
    setWorkflows((prev) => [newWf, ...prev])
  }

  const handleAdvanceWorkflowStatus = (wfId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id !== wfId) return w
        if (w.status === "Task Created") return { ...w, status: "Pending Approval" }
        if (w.status === "Pending Approval") return { ...w, status: "Approved & Record Updated" }
        return w
      })
    )
  }

  const runVibeAiAction = (type: "summarize" | "decision" | "tasks" | "translate" | "studynotes") => {
    const privacyTag =
      aiConsentMode === "on_device"
        ? "🔒 On-Device Local Processing (Zero Server Plaintext)"
        : "📤 Explicit User-Consented Message Share"
    if (type === "summarize") {
      setAiOutputTitle(`Summary · ${privacyTag}`)
      setAiOutputContent(
        `• Schema Frozen (seq #5811): \`comm_messages\` enforces \`UNIQUE (sender_device_id, client_message_id)\` and \`UNIQUE (conversation_id, server_sequence)\`.\n• Group Security (seq #5812): Member removal rotates MLS key epoch to #13 and rejects stale epochs.\n• Resilience (seq #5813): 10,000 mobile reconnect & TURN handoff tests passed.`
      )
    } else if (type === "decision") {
      setAiOutputTitle(`Architectural Decision · ${privacyTag}`)
      setAiOutputContent(
        `✅ Confirmed (seq #5812): Removing a group member increments \`recipient_key_epoch\` and immediately blocks stale-epoch sends with machine-readable code \`KEY_EPOCH_STALE\`.`
      )
    } else if (type === "tasks") {
      setAiOutputTitle(`Extracted Engineering Action Items · ${privacyTag}`)
      setAiOutputContent(
        `1. [P0] Run existing Vibe infrastructure audit & reuse map (Phase 0, Weeks 1–3)\n2. [P0] Deploy \`comm_messages\` + \`comm_outbox\` with \`FOR UPDATE SKIP LOCKED\` publisher\n3. [P1] Validate client-encrypted media presigned upload & orphaned-blob cleanup`
      )
    } else if (type === "translate") {
      const next =
        selectedTranslationLang === "Twi" ? "French" : selectedTranslationLang === "French" ? "Spanish" : "Twi"
      setSelectedTranslationLang(next)
      setAiOutputTitle(`Translated to ${next} · ${privacyTag}`)
      setAiOutputContent(`Inline ${next} translations are now active inside the message stream.`)
    } else {
      setAiOutputTitle(`Study & Architecture Notes · ${privacyTag}`)
      setAiOutputContent(
        `📓 Key Takeaway: Never claim universal exactly-once delivery; build at-least-once event delivery with idempotent client/server processing via \`client_message_id\` and per-conversation \`server_sequence\`.`
      )
    }
  }

  const engineeringDirectiveMarkdown = useMemo(() => {
    return `# Vibe / Desk Note Communications Engineering Directive

**Objective:** Build an integrated, customizable communications platform within the existing Vibe / Desk Note application supporting Web, Android, and iOS; private and group messaging; encrypted media; voice/video calls; multi-device synchronization; communities; and extensibility.

## Finalized Architecture Decisions (Section 20)
1. **Existing Stack & Reuse**: ${decStack}
2. **Encryption Scope**: ${decEncryptionScope}
3. **Voice & Video Calling**: ${decGroupCalls}
4. **Multi-Device Model**: ${decDeviceModel}
5. **Scale & SLO Targets**: ${decScaleTarget}

## 10 Mandatory Architecture Requirements (Section 19)
1. Reuse existing identity (\`user_id\`), backend, cloud infrastructure, CI/CD, and data services wherever they meet requirements.
2. Establish 8 clear service boundaries: Identity adapter, Conversation service, Realtime messaging service, Device & key directory, Media service, Calling service, Notification worker, and Abuse & trust service.
3. Use durable message persistence (\`comm_messages\`), idempotent sends (\`UNIQUE (sender_device_id, client_message_id)\`), server-assigned ordering (\`UNIQUE (conversation_id, server_sequence)\`), transactional outbox (\`comm_outbox\` with \`FOR UPDATE SKIP LOCKED\`), and cursor-based offline sync.
4. Implement E2EE using reviewed protocols (\`libsignal\` / IETF MLS RFC 9420). Never invent cryptography or claim E2EE based only on TLS.
5. Define secure device enrollment, revocation (\`DELETE /v1/devices/{deviceId}\`), key-change alerts, recovery, and multi-device behavior before launch.
6. Encrypt attachments & thumbnails on the client (AEAD) before uploading via short-lived presigned URLs to private object storage.
7. Implement WebRTC signaling (\`CREATED\` → \`RINGING\` → \`NEGOTIATING\` → \`CONNECTED\` → \`ENDED\`), redundant STUN/TURN relays, and verified end-to-end media keys.
8. Implement block/report controls (\`comm_blocks\`, \`comm_reports\`), graduated abuse throttling, blinded push notifications, and explicit user consent for moderation or AI.
9. Integrate OpenTelemetry observability, IaC, expand-migrate-contract DB migrations, RPO <= 5m / RTO <= 1h backup restoration, and incident response.
10. Treat custom themes (\`workspace_settings\`), integrations (\`integrations\`), and AI workflows as governed extensions with schema validation and scoped permissions.

## Non-Negotiable Release Gate Status
- Verified End-to-End Mandatory Scenarios: ${verifiedScenarioCount}/10 Passing
- Standards Compliance: OWASP ASVS (Web/API) + OWASP MASVS (Mobile Storage, Crypto, Auth, Network, Platform, Resilience, Privacy)
`
  }, [decStack, decEncryptionScope, decGroupCalls, decDeviceModel, decScaleTarget, verifiedScenarioCount])

  const handleCopyDirective = () => {
    navigator.clipboard.writeText(engineeringDirectiveMarkdown)
    setDirectiveCopied(true)
    setTimeout(() => setDirectiveCopied(false), 2500)
  }

  const handleDownloadDirective = () => {
    const blob = new Blob([engineeringDirectiveMarkdown], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "vibe-desknote-communications-engineering-directive.md"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 pb-12">
      {/* HERO HEADER */}
      <div className="rounded-3xl bg-gradient-to-r from-[#071A12] via-[#0B291E] to-[#0A2540] text-white p-5 sm:p-7 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <Lock className="h-3.5 w-3.5" />
                Vibe / Desk Note Communications Platform · Full 20-Section Spec
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-mono text-teal-200">
                libsignal + MLS RFC 9420 · Outbox Pattern · WebRTC TURN/SFU · OWASP MASVS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Vibe / Desk Note Modular Real-Time Communications Subsystem
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              Built as an integrated, E2EE-first real-time subsystem inside your existing Vibe, Desk Note &amp; ConnectIn
              infrastructure — reusing authoritative identity (`user_id`), PostgreSQL, Redis, and cloud services while
              enforcing strict cryptographic and operational boundaries across Web, Android, and iOS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMainTab("video_call_studio")}
              className="rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Launch Live Video &amp; Call Studio</span>
            </button>
            {onOpenVibeCampus && (
              <button
                type="button"
                onClick={onOpenVibeCampus}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Noctis Q&amp;A Campus</span>
              </button>
            )}
            <a
              href="https://desk-note-kwesi-asiedus-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Open DeskNote Live</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 6-TAB NAVIGATION COVERING LIVE WORKSPACE, WEBRTC CALL STUDIO & ALL 20 SECTIONS */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            {
              id: "workspace" as MainSectionTab,
              label: "1. Live E2EE Comms & AI Workspace",
              badge: "LIVE HUB",
              icon: MessageSquare,
            },
            {
              id: "video_call_studio" as MainSectionTab,
              label: "2. Live Video & Call Studio (WebRTC + TURN + E2EE)",
              badge: "WEBRTC SFU",
              icon: Video,
            },
            {
              id: "arch_schema_api" as MainSectionTab,
              label: "3. Architecture, 8 Boundaries, 14 DB Tables & 14 APIs",
              badge: "SEC 1–4",
              icon: Database,
            },
            {
              id: "state_e2ee_media_rtc" as MainSectionTab,
              label: "4. State Machine, E2EE (Signal/MLS), Media & WebRTC",
              badge: "SEC 5–9",
              icon: Shield,
            },
            {
              id: "ops_threat_testing" as MainSectionTab,
              label: "5. Cloud SLOs, 14 Threats, Abuse & 10 E2E Tests",
              badge: "SEC 10–15",
              icon: Activity,
            },
            {
              id: "roadmap_directive" as MainSectionTab,
              label: "6. Staffing, 36-Wk Plan, Backlog & Dev Directive",
              badge: "SEC 16–20",
              icon: ClipboardCheck,
            },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeMainTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-400 text-slate-950 shadow-md"
                    : "bg-white/10 text-emerald-100 hover:bg-white/15 border border-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    active ? "bg-slate-950/20 text-slate-950 font-extrabold" : "bg-black/30 text-emerald-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* =====================================================================
          TAB 2: DEDICATED FULL-SCREEN LIVE VIDEO & CALL STUDIO (WEBRTC + TURN + E2EE)
         ===================================================================== */}
      {activeMainTab === "video_call_studio" && (
        <VibeVideoCallStudio
          conversationId={selectedConversation.id}
          conversationName={selectedConversation.name}
          initialMode={callMode}
          currentUserName={currentUser?.name || "You (Verified Device)"}
          initialCallRoomId={joinedCallRoomId}
          onCreateWorkflowFromCall={(title, owner, evidence) => {
            setWorkflows((prev) => [
              {
                id: `wf-${Date.now().toString().slice(-4)}`,
                sourceMessageId: "webrtc-call-notes",
                title,
                owner,
                deadline: "In 48 Hours",
                evidence,
                status: "Task Created",
                targetRecord: `${selectedConversation.name} · Call Action Ledger`,
              },
              ...prev,
            ])
          }}
          onCloseStudio={() => setActiveMainTab("workspace")}
        />
      )}

      {/* =====================================================================
          TAB 1: LIVE UNIFIED COMMUNICATIONS WORKSPACE
         ===================================================================== */}
      {activeMainTab === "workspace" && (
        <div className="space-y-4">
          {/* Category Filter & Workspace Customization Bar (Section 14) */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Conversations", icon: Layers },
                { id: "work", label: "Engineering & Work", icon: Briefcase },
                { id: "customer", label: "Customer & Supplier", icon: Building2 },
                { id: "school", label: "Study & Cohorts", icon: GraduationCap },
                { id: "church", label: "Church & Community", icon: Heart },
                { id: "family", label: "Family E2EE Vault", icon: Shield },
                { id: "notes", label: "DeskNote Scratchpad", icon: FileText },
              ].map((cat) => {
                const Icon = cat.icon
                const active = chatCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setChatCategory(cat.id as ChatCategoryMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl px-2.5 py-1 border border-zinc-200 dark:border-zinc-700">
                <Languages className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">Translate:</span>
                {["Original", "Twi", "French", "Spanish"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedTranslationLang(lang)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                      selectedTranslationLang === lang
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setInterfaceDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                Layout: {interfaceDensity === "comfortable" ? "Comfortable" : "Compact"}
              </button>
            </div>
          </div>

          {/* FULL EMBEDDED WEBRTC VIDEO & CALL STUDIO WHEN CALL IS TRIGGERED FROM CHAT */}
          {callState !== "IDLE" && (
            <VibeVideoCallStudio
              conversationId={selectedConversation.id}
              conversationName={selectedConversation.name}
              initialMode={callMode}
              currentUserName={currentUser?.name || "You (Verified Device)"}
              onCreateWorkflowFromCall={(title, owner, evidence) => {
                setWorkflows((prev) => [
                  {
                    id: `wf-${Date.now().toString().slice(-4)}`,
                    sourceMessageId: "webrtc-call-notes",
                    title,
                    owner,
                    deadline: "In 48 Hours",
                    evidence,
                    status: "Task Created",
                    targetRecord: `${selectedConversation.name} · Call Action Ledger`,
                  },
                  ...prev,
                ])
              }}
              onCloseStudio={() => setCallState("IDLE")}
            />
          )}

          {/* 3-COLUMN WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* LEFT: Conversation List & Cursor Sync Status */}
            <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    Conversations ({filteredConversations.length})
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <Laptop className="h-3 w-3" /> Cursor Synced
                  </span>
                </div>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search local decrypted SQLite index..."
                    className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70 max-h-[560px] overflow-y-auto">
                {filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedConversation.id
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConvId(conv.id)}
                      className={`w-full text-left p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-600"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                        {conv.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {conv.name}
                          </p>
                          {conv.unread > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {conv.subtitle}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400">
                          <span>Epoch #{conv.keyEpoch}</span>
                          <span>·</span>
                          <span>{conv.retentionPolicy}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* CENTER: Active Chat Stream with Sequence Numbers & Idempotency Envelopes */}
            <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/60 dark:bg-zinc-900">
                <div className="min-w-0">
                  <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                    {selectedConversation.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowSafetyModal(!showSafetyModal)}
                      className="font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="h-3 w-3" />
                      <span>{selectedConversation.protocol} · Epoch #{selectedConversation.keyEpoch}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCallMode("audio")
                      setCallState("CONNECTED")
                    }}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    title="Start E2EE Audio Call"
                  >
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCallMode("video")
                      setCallState("CONNECTED")
                    }}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    title="Start E2EE Video Call"
                  >
                    <Video className="h-4 w-4 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCallMode("screenshare")
                      setCallState("CONNECTED")
                    }}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 text-zinc-700 dark:text-zinc-200 cursor-pointer"
                    title="Start Screen Share"
                  >
                    <MonitorUp className="h-4 w-4 text-teal-600" />
                  </button>
                </div>
              </div>

              {showSafetyModal && (
                <div className="p-3.5 bg-emerald-950 text-emerald-100 border-b border-emerald-700/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300">
                      Device &amp; Key Directory Verification (`comm_device_keys`)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSafetyModal(false)}
                      className="text-[11px] text-emerald-300 underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="font-mono text-xs bg-black/40 p-2 rounded-lg border border-emerald-500/30">
                    Safety Fingerprint: {selectedConversation.safetyCode}
                  </p>
                </div>
              )}

              <div
                className={`p-4 space-y-3 overflow-y-auto max-h-[460px] bg-zinc-50/40 dark:bg-zinc-950/40 ${
                  interfaceDensity === "compact" ? "text-xs" : "text-sm"
                }`}
              >
                {selectedConversation.messages.map((msg) => {
                  const translated =
                    selectedTranslationLang !== "Original"
                      ? msg.translatedText?.[selectedTranslationLang]
                      : undefined
                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl p-3.5 border ${
                        msg.isOwn
                          ? "bg-emerald-600 text-white border-emerald-500 ml-6"
                          : "bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-xs font-extrabold ${
                            msg.isOwn ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {msg.sender}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            msg.isOwn ? "text-emerald-100" : "text-zinc-400"
                          }`}
                        >
                          seq:{msg.serverSequence} · {msg.time}
                        </span>
                      </div>

                      <p className={msg.isOwn ? "text-white" : "text-zinc-800 dark:text-zinc-200"}>
                        {msg.text}
                      </p>

                      {translated && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                          <strong className="text-emerald-700 dark:text-emerald-300 block">
                            🌍 {selectedTranslationLang}:
                          </strong>
                          <span className="text-zinc-800 dark:text-zinc-200">{translated}</span>
                        </div>
                      )}

                      {msg.attachment && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              📎 {msg.attachment.name}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                              {msg.attachment.size}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 truncate">
                            {msg.attachment.objectKey} · {msg.attachment.ciphertextHash}
                          </div>
                        </div>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          client_msg_id: {msg.clientMessageId.slice(0, 12)}...
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConvertMessageToWorkflow(msg)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              msg.isOwn
                                ? "bg-white/20 text-white"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            ⚡ Convert → Workflow
                          </button>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-500 font-bold">
                            <CheckCheck className="h-3.5 w-3.5" /> {msg.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    placeholder="Compose E2EE envelope (`POST /v1/conversations/{id}/messages`)..."
                    className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Noctis Brain (Section 6.5) + Workflow Pipeline */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                        Noctis Brain (Section 6.5 Boundary)
                      </h3>
                      <p className="text-[10px] text-zinc-500">
                        Never claims server-side AI over private E2EE plaintext
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAiConsentMode((m) => (m === "on_device" ? "explicit_share" : "on_device"))
                    }
                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-[10px] font-mono font-bold cursor-pointer"
                  >
                    {aiConsentMode === "on_device" ? "🔒 On-Device" : "📤 Explicit Share"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("summarize")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    📋 Summarize Thread
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("decision")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    🎯 Locate Decision
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("tasks")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    ✅ Extract P0/P1 Tasks
                  </button>
                  <button
                    type="button"
                    onClick={() => runVibeAiAction("translate")}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-left text-[11px] font-bold cursor-pointer"
                  >
                    🌍 Translate (Twi/FR/ES)
                  </button>
                </div>

                <div className="rounded-xl bg-emerald-950/90 text-emerald-50 p-3 border border-emerald-700/50 space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-300">{aiOutputTitle}</p>
                  <p className="text-xs whitespace-pre-line leading-relaxed text-emerald-100/95">
                    {aiOutputContent}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Workflow className="h-4 w-4 text-emerald-600" />
                  <span>Governed Workspace Workflows (Section 14)</span>
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {workflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/70 dark:bg-zinc-800/40 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{wf.title}</p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                          {wf.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Owner: {wf.owner} · {wf.deadline} · {wf.evidence}
                      </div>
                      {wf.status !== "Approved & Record Updated" && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceWorkflowStatus(wf.id)}
                          className="w-full py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold cursor-pointer"
                        >
                          Advance Approval State →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SECTIONS 1–4 — TARGET ARCHITECTURE, 8 SERVICE BOUNDARIES, 14 TABLES & 14 APIS
         ===================================================================== */}
      {activeMainTab === "arch_schema_api" && (
        <div className="space-y-6">
          {/* Section 1: Explicit Working Assumptions & Deployment Shape */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                  Section 1 · Target Architecture &amp; Explicit Assumptions
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  8 Explicit Working Assumptions (Reuse Before Replace)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPLICIT_ASSUMPTIONS.map((item) => (
                  <div
                    key={item.area}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-800/40"
                  >
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      {item.area}
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {item.assumption}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl bg-slate-950 text-emerald-100 p-6 border border-emerald-500/30 shadow-xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-400">
                Section 2 · Suggested Deployment Shape
              </span>
              <h3 className="text-base font-extrabold text-white">
                Modular Subsystem Inside Existing Vibe Backend
              </h3>
              <pre className="text-xs font-mono leading-relaxed bg-black/40 p-4 rounded-2xl border border-emerald-500/20 overflow-x-auto">
{`Existing Vibe backend
  ├── Identity adapter (Reuses Vibe user_id)
  ├── Conversation module
  └── REST API / WebSocket gateway
          ├── Messaging workers
          ├── Media API (Presigned S3)
          ├── Calling signaling (WebRTC)
          ├── Notification workers (APNs/FCM)
          └── Trust and abuse module

Shared infrastructure
  ├── PostgreSQL (comm_* tables + comm_outbox)
  ├── Redis (Presence TTL + Rate limits)
  ├── Durable event broker (NATS / RabbitMQ / Kafka)
  ├── Encrypted object storage (Private S3)
  ├── APNs / FCM (Blinded wakeup payloads)
  ├── TURN servers (Redundant regional relays)
  └── Metrics, logs, traces, alerting (OTel)`}
              </pre>
            </div>
          </div>

          {/* Section 2: 8 Service Boundaries ("Owns" vs "Must not own") */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 2 · Service Boundaries &amp; Least-Privilege Ownership
              </span>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                8 Deployable Components: What Each Owns vs. Must Not Own
              </h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Owns (Authoritative Scope)</th>
                    <th className="p-3">Must Not Own (Strict Security Boundary)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {SERVICE_BOUNDARIES.map((row) => (
                    <tr key={row.component} className="bg-white dark:bg-zinc-900">
                      <td className="p-3 font-extrabold text-zinc-900 dark:text-zinc-100">{row.component}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-300 font-medium">{row.owns}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-semibold">✕ {row.mustNotOwn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: 14 Core Relational Tables & SQL DDL */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 3 · PostgreSQL Relational Schema (`comm_*`)
              </span>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                14 Core Relational Tables &amp; Authoritative `comm_messages` DDL
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold">
                  <tr>
                    <th className="p-3">Table</th>
                    <th className="p-3">Key Fields</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {CORE_RELATIONAL_TABLES.map((t) => (
                    <tr key={t.table} className="bg-white dark:bg-zinc-900">
                      <td className="p-3 font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                        {t.table}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{t.fields}</td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-300">{t.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <pre className="text-xs font-mono bg-slate-950 text-emerald-200 p-4 rounded-2xl border border-emerald-500/30 overflow-x-auto">
{`CREATE TABLE comm_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES comm_conversations(id),
    sender_user_id UUID NOT NULL,
    sender_device_id UUID NOT NULL REFERENCES comm_devices(id),
    client_message_id UUID NOT NULL,
    server_sequence BIGINT NOT NULL,
    message_type TEXT NOT NULL,
    envelope_version INTEGER NOT NULL,
    ciphertext BYTEA NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    UNIQUE (sender_device_id, client_message_id),
    UNIQUE (conversation_id, server_sequence)
);

CREATE INDEX comm_messages_history_idx
    ON comm_messages (conversation_id, server_sequence DESC);`}
            </pre>
          </div>

          {/* Section 4: 14 HTTP Endpoints & WebSocket Event Contract */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 4 · Versioned OpenAPI &amp; WebSocket Contracts
              </span>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                14 Core HTTP Endpoints &amp; Real-Time Event Envelope
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold">
                  <tr>
                    <th className="p-3">Endpoint</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Authorization Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {CORE_HTTP_ENDPOINTS.map((ep) => (
                    <tr key={ep.endpoint} className="bg-white dark:bg-zinc-900">
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {ep.endpoint}
                      </td>
                      <td className="p-3 text-zinc-800 dark:text-zinc-200">{ep.purpose}</td>
                      <td className="p-3 text-zinc-500 dark:text-zinc-400">{ep.auth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: SECTIONS 5–9 — STATE MACHINE, E2EE (SIGNAL/MLS), MEDIA, WEBRTC & OUTBOX
         ===================================================================== */}
      {activeMainTab === "state_e2ee_media_rtc" && (
        <div className="space-y-6">
          {/* Section 5: Interactive Message State Machine */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 5 · Messaging Protocol &amp; Per-Device State Machine
              </span>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                Interactive Message Lifecycle (`LOCAL_PENDING` → `ACCEPTED` → `DELIVERED` / `READ`)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MESSAGE_STATES.map((st, idx) => (
                <button
                  key={st.state}
                  type="button"
                  onClick={() => setSelectedStateIdx(idx)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    selectedStateIdx === idx
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                      : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-80">STATE 0{idx + 1}</div>
                  <div className="text-xs font-extrabold mt-0.5 truncate">{st.state}</div>
                </button>
              ))}
            </div>

            {MESSAGE_STATES[selectedStateIdx] && (
              <div className="rounded-2xl bg-slate-950 text-white p-5 border border-emerald-500/30 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                    Current State: {MESSAGE_STATES[selectedStateIdx].state}
                  </span>
                  <span className="text-xs font-mono text-teal-300">
                    Next State → {MESSAGE_STATES[selectedStateIdx].nextState}
                  </span>
                </div>
                <p className="text-sm text-emerald-100">
                  <strong>Event Trigger:</strong> {MESSAGE_STATES[selectedStateIdx].trigger}
                </p>
                <p className="text-xs text-amber-300 font-mono">
                  Transition Rule: {MESSAGE_STATES[selectedStateIdx].rule}
                </p>
              </div>
            )}
          </div>

          {/* Section 6, 7, 8 & 9 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 6 · End-to-End Encryption Architecture
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Signal Protocol (`libsignal`) + IETF MLS (RFC 9420)
              </h3>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <li>• <strong>1:1 Private Chats:</strong> Reviewed asynchronous E2EE with per-device sessions, X3DH prekeys &amp; Double Ratchet.</li>
                <li>• <strong>Private Group Chats:</strong> IETF MLS (RFC 9420) with versioned membership/key epochs; removed members cannot decrypt future epochs.</li>
                <li>• <strong>Device Key Storage:</strong> iOS Keychain &amp; Android Keystore hardware-backed storage; never log or store private keys in PostgreSQL.</li>
                <li>• <strong>AI Brain Boundary:</strong> On-device processing or explicit user-selected decrypted sharing only.</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                Section 7, 8 &amp; 9 · Media Pipeline, WebRTC &amp; Transactional Outbox
              </span>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Client-Encrypted Blobs, Call State Machine &amp; `comm_outbox`
              </h3>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <li>• <strong>6-Step Media Flow:</strong> Client generates random AEAD key → encrypts file &amp; thumbnail locally → uploads to private S3 via presigned URL → sends content key inside E2EE envelope only.</li>
                <li>• <strong>WebRTC Call States:</strong> `CREATED` → `RINGING` → `NEGOTIATING` → `CONNECTED` → `RECONNECTING` → `ENDED / FAILED / REJECTED / EXPIRED`.</li>
                <li>• <strong>Outbox Pattern:</strong> Single PostgreSQL transaction writes `comm_messages` + `comm_outbox`; concurrent publishers claim via `FOR UPDATE SKIP LOCKED`.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: SECTIONS 10–15 — CLOUD SLOS, 14 THREATS, ABUSE & 10 E2E TESTS
         ===================================================================== */}
      {activeMainTab === "ops_threat_testing" && (
        <div className="space-y-6">
          {/* Section 10 & 11: SLOs & Recovery Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              { label: "Message Acceptance Availability", value: "99.9% Monthly", sub: "Validated via fault-injection" },
              { label: "Acceptance Latency SLO", value: "p95 < 300 ms", sub: "Online delivery p95 < 1.0 sec" },
              { label: "Recovery Point Objective (RPO)", value: "<= 5 Minutes", sub: "Durable message & outbox state" },
              { label: "Recovery Time Objective (RTO)", value: "<= 1 Hour", sub: "Tested regional/DB failover" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs"
              >
                <span className="text-[10px] font-mono uppercase text-zinc-400">{m.label}</span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {m.value}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Section 12: 14-Threat Security Model */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                  Section 12 &amp; 13 · Threat Model, OWASP MASVS &amp; Abuse Prevention
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  14 Communications-Specific Threats &amp; Mitigations
                </h2>
              </div>
              <a
                href="https://mas.owasp.org/MASVS/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-bold flex items-center gap-1.5"
              >
                <span>OWASP MASVS Standard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold">
                  <tr>
                    <th className="p-3">Threat</th>
                    <th className="p-3">Example Attack</th>
                    <th className="p-3">Core Mitigations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {THREAT_MODEL_ROWS.map((r) => (
                    <tr key={r.threat} className="bg-white dark:bg-zinc-900">
                      <td className="p-3 font-extrabold text-zinc-900 dark:text-zinc-100">{r.threat}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400">{r.attack}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-300">{r.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 15: 10 Mandatory End-to-End Scenarios & Release Gates */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                  Section 15 · Test Strategy &amp; Non-Negotiable Release Gates
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  10 Mandatory End-to-End Verification Scenarios ({verifiedScenarioCount}/10 Verified)
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {MANDATORY_E2E_SCENARIOS.map((sc) => {
                const checked = !!verifiedScenarios[sc.id]
                return (
                  <label
                    key={sc.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-start gap-2.5 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setVerifiedScenarios((prev) => ({ ...prev, [sc.id]: !prev[sc.id] }))
                      }
                      className="mt-0.5 h-4 w-4 rounded text-emerald-600"
                    />
                    <span className={checked ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-500"}>
                      {sc.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: SECTIONS 16–20 — STAFFING, 36-WK PLAN, BACKLOG & DEV DIRECTIVE
         ===================================================================== */}
      {activeMainTab === "roadmap_directive" && (
        <div className="space-y-6">
          {/* Section 16 & 17: Staffing & Phases 0–5 (36 Weeks) */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                  Section 16 &amp; 17 · Staffing (7.5–10 FTE) &amp; 36-Week Phased Delivery Plan
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  Phases 0 to 5 Implementation Roadmap (Weeks 1–36)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                Team: 1 Lead · 2 Backend · 2–3 Client · 1 Crypto/Sec · 1 QA · 1 SRE · 1 PM/UX
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {PHASED_SCHEDULE.map((p) => (
                <div
                  key={p.phase}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-2"
                >
                  <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">
                    {p.phase}
                  </span>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {p.goals.map((g) => (
                      <li key={g}>• {g}</li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Exit Gate: {p.exit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 18: Prioritized Backlog (P0, P1, P2) */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
              Section 18 · Prioritized Engineering Backlog (P0 → P1 → P2)
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold">
                  <tr>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Work Item</th>
                    <th className="p-3">Dependency</th>
                    <th className="p-3">Definition of Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {PRIORITIZED_BACKLOG.map((row) => (
                    <tr key={row.item} className="bg-white dark:bg-zinc-900">
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-extrabold text-[10px] ${
                            row.priority === "P0"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : row.priority === "P1"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {row.priority}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-zinc-900 dark:text-zinc-100">{row.item}</td>
                      <td className="p-3 text-zinc-500">{row.dep}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-300 font-medium">{row.dod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 19 & 20: 5 Decisions to Finalize + Copyable Developer Directive */}
          <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">
                  Section 19 &amp; 20 · Engineering Directive &amp; 5 Key Architecture Decisions
                </span>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                  What to Tell Your Developers — Interactive Directive Generator
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyDirective}
                  className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {directiveCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{directiveCopied ? "Copied Directive!" : "Copy Engineering Directive"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDirective}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Directive (.md)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  1. Existing Stack
                </label>
                <select
                  value={decStack}
                  onChange={(e) => setDecStack(e.target.value)}
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                >
                  <option>Reuse Existing Node.js/TypeScript + Python Backend + Dedicated WebSocket Gateway</option>
                  <option>Existing Next.js / Node.js Backend + Go Realtime Workers</option>
                  <option>Existing Python Backend + Async WebSocket Gateway + PostgreSQL</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  2. Encryption Scope
                </label>
                <select
                  value={decEncryptionScope}
                  onChange={(e) => setDecEncryptionScope(e.target.value)}
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                >
                  <option>1:1 E2EE (`libsignal`) + Private Group E2EE (IETF MLS RFC 9420) at Launch</option>
                  <option>Phase 1: 1:1 E2EE First → Phase 4: Private Group MLS E2EE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  3. Group Calls
                </label>
                <select
                  value={decGroupCalls}
                  onChange={(e) => setDecGroupCalls(e.target.value)}
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                >
                  <option>1:1 WebRTC + Redundant TURN at Launch → SFU Group Calls with E2EE Media Keys in Phase 3</option>
                  <option>Full 1:1 + SFU Group Calls at Launch</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  4. Device Model
                </label>
                <select
                  value={decDeviceModel}
                  onChange={(e) => setDecDeviceModel(e.target.value)}
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                >
                  <option>Multi-Device (Web, Android, iOS) with Independent Device Keys &amp; Authenticated QR Linking</option>
                  <option>Primary Mobile + Linked Web/Desktop Sessions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  5. Scale &amp; SLOs
                </label>
                <select
                  value={decScaleTarget}
                  onChange={(e) => setDecScaleTarget(e.target.value)}
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-700"
                >
                  <option>99.9% Availability · Acceptance p95 &lt; 300ms · Online Delivery p95 &lt; 1s · RPO &lt;= 5m · RTO &lt;= 1h</option>
                  <option>High-Scale 100k+ Concurrent Sockets · Partitioned comm_messages</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 text-emerald-100 p-5 border border-emerald-500/30 overflow-x-auto">
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {engineeringDirectiveMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default VibeUnifiedCommunicationsView
