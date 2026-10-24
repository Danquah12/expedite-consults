import { FACE } from "@/lib/feed-data";
import { HYMNS } from "@/lib/hymn-desk";
import { CLINIC_DESKS } from "@/lib/ingest-sources";
import { HIRE_SEATS } from "@/lib/hire-desk";

export type ClinicMember = {
  id: string;
  name: string;
  username: string;
  title: string;
  campus: string;
  kind: "clinic" | "registered";
  avatar: string;
};

export const CLINIC_MEMBERS: ClinicMember[] = [
  { id: "kwesi", name: "Kwesi Asiedu", username: "kwesi", title: "Founder", campus: "University of Ghana", kind: "clinic", avatar: FACE.kwesi },
  { id: "ama", name: "Ama Boateng", username: "ama", title: "Nursing student", campus: "University of Ghana", kind: "clinic", avatar: FACE.ama },
  { id: "kofi", name: "Kofi Mensah", username: "kofi", title: "Cyber clinic", campus: "Ashesi", kind: "clinic", avatar: FACE.kofi },
  { id: "nia", name: "Nia Okonkwo", username: "nia", title: "CTF lead", campus: "KNUST", kind: "clinic", avatar: FACE.nia },
  { id: "yaw", name: "Yaw Boateng", username: "yaw", title: "Faculty", campus: "University of Ghana", kind: "clinic", avatar: FACE.yaw },
  { id: "efua", name: "Efua Addo", username: "efua", title: "Designer", campus: "Ashesi", kind: "clinic", avatar: FACE.efua },
  { id: "tunde", name: "Tunde Adebayo", username: "tunde", title: "SOC analyst", campus: "University of Lagos", kind: "clinic", avatar: FACE.tunde },
  { id: "zainab", name: "Zainab Diallo", username: "zainab", title: "Research", campus: "Cheikh Anta Diop", kind: "clinic", avatar: FACE.zainab },
  { id: "kwame", name: "Kwame Asante", username: "kwame", title: "Carpenter / trades", campus: "Accra Technical", kind: "clinic", avatar: FACE.kwame },
  { id: "adwoa", name: "Adwoa Boat", username: "adwoa", title: "Campus radio", campus: "University of Ghana", kind: "clinic", avatar: FACE.adwoa },
];

export const SAFETY_CATS = [
  { id: "spam", label: "Spam", seed: 18 },
  { id: "harassment", label: "Harassment", seed: 7 },
  { id: "fraud", label: "Fraud", seed: 4 },
  { id: "copyright", label: "Copyright", seed: 6 },
  { id: "impersonation", label: "Impersonation", seed: 3 },
  { id: "scam", label: "Scams", seed: 5 },
  { id: "abuse", label: "Hate / abuse", seed: 2 },
  { id: "other", label: "Other", seed: 3 },
] as const;

export const SEED_CASES = [
  { caseNo: "SN-10421", category: "spam", priority: "normal" as const, targetKind: "post" as const, targetId: "feed-1", reason: "Repeated unsolicited clinic promo", ai: 72, reports: 6, assigned: "Queue" },
  { caseNo: "SN-10488", category: "copyright", priority: "high" as const, targetKind: "post" as const, targetId: "mu-hymn-grace", reason: "Claim on a recording — embed-only check", ai: 64, reports: 2, assigned: "Queue" },
  { caseNo: "SN-10502", category: "impersonation", priority: "high" as const, targetKind: "user" as const, targetId: "kofi", reason: "Username mimics a faculty clinic", ai: 81, reports: 4, assigned: "Queue" },
  { caseNo: "SN-10519", category: "fraud", priority: "urgent" as const, targetKind: "job" as const, targetId: "h-cisa", reason: "Off-board recruiter asking for fees", ai: 90, reports: 9, assigned: "Queue" },
  { caseNo: "SN-10540", category: "harassment", priority: "high" as const, targetKind: "user" as const, targetId: "nia", reason: "Targeted comments after a CTF drop", ai: 77, reports: 11, assigned: "Queue" },
];

export const HEALTH = [
  { id: "api", label: "API", state: "healthy" as const },
  { id: "auth", label: "Auth", state: "healthy" as const },
  { id: "db", label: "Database", state: "healthy" as const },
  { id: "ingest", label: "Ledger ingest", state: "healthy" as const },
  { id: "video", label: "Video embed", state: "healthy" as const },
  { id: "notify", label: "Notifications", state: "watch" as const },
];

export function rangeFactor(range: "1" | "7" | "30" | "90") {
  if (range === "1") return 1;
  if (range === "7") return 6;
  if (range === "30") return 22;
  return 58;
}

export function commandSnapshot(range: "1" | "7" | "30" | "90", live: { users: number; clips: number; mods: number; cases: number; hymns?: number }) {
  const f = rangeFactor(range);
  return {
    users: live.users,
    active: Math.max(1, Math.round(live.users * 0.62)),
    posts: live.clips * f,
    reels: Math.round(live.clips * 0.4 * f),
    comments: Math.round(live.clips * 2.1 * f),
    reports: Math.max(live.cases, 5) * Math.max(1, Math.round(f / 4)),
    holds: live.mods,
    hymns: live.hymns ?? HYMNS.length,
    halls: CLINIC_DESKS.length,
    jobs: HIRE_SEATS.length,
    likes: Math.round(live.clips * 8 * f),
    shares: Math.round(live.clips * 1.2 * f),
    messages: Math.round(live.clips * 3.4 * f),
    traffic: Math.round(live.users * 14 * f),
  };
}

export const LEARN_TRACKS = [
  { id: "rmf", label: "NIST RMF", objects: "SSP · POA&M · ATO" },
  { id: "pentest", label: "Penetration testing", objects: "Lab · Quiz · Range" },
  { id: "cloud", label: "Cloud security", objects: "AWS · Azure · GCP" },
  { id: "care", label: "Health & nursing", objects: "Clinic · Academy" },
  { id: "faith", label: "Hymn learning", objects: `${HYMNS.length} lessons` },
];

export const GEO = [
  { label: "Ghana", n: 42 },
  { label: "Nigeria", n: 18 },
  { label: "United States", n: 14 },
  { label: "United Kingdom", n: 9 },
  { label: "Kenya", n: 7 },
  { label: "Other", n: 10 },
];

export const VERIFY_QUEUE = [
  { id: "yaw", name: "Yaw Boateng", kind: "Faculty", campus: "University of Ghana", evidence: "Faculty domain · lecture posts" },
  { id: "kofi", name: "Kofi Mensah", kind: "Professional", campus: "Ashesi", evidence: "Cyber clinic lead · CTF drops" },
  { id: "zainab", name: "Zainab Diallo", kind: "Researcher", campus: "Cheikh Anta Diop", evidence: "Research hall · publications" },
  { id: "kwame", name: "Kwame Asante", kind: "Trade", campus: "Accra Technical", evidence: "Shop clinic · trade stamp" },
];

export const NOTIFY_TEMPLATES = [
  { id: "welcome", label: "Welcome to the clinic", channel: "email" },
  { id: "mfa", label: "Staff MFA reminder", channel: "email" },
  { id: "report", label: "Report received", channel: "in-app" },
  { id: "hold", label: "Account hold notice", channel: "email" },
  { id: "stamp", label: "Stamp earned", channel: "in-app" },
  { id: "job", label: "Opening matches your stamp", channel: "in-app" },
];

export const COMMAND_MAP = [
  {
    group: "People",
    items: [
      { label: "Users 360°", to: "/desk/users", state: "live" as const },
      { label: "Identity & verification", to: "/desk/identity", state: "live" as const },
      { label: "Operators / RBAC", to: "/desk/people", state: "live" as const },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "CMS · hide / feature / pin", to: "/desk/content", state: "live" as const },
      { label: "Hall ledger", to: "/desk/ledger", state: "live" as const },
      { label: "Music / hymns", to: "/desk/music", state: "live" as const },
      { label: "Learning", to: "/desk/learn", state: "live" as const },
      { label: "Jobs / openings", to: "/desk/jobs", state: "live" as const },
      { label: "Crews / communities", to: "/desk/crews", state: "live" as const },
    ],
  },
  {
    group: "Trust & safety",
    items: [
      { label: "Reports & cases", to: "/desk/safety", state: "live" as const },
      { label: "Moderation queue", to: "/desk/mod", state: "live" as const },
      { label: "AI scores on cases", to: "/desk/safety", state: "live" as const },
      { label: "Appeals / enforcement", to: "/desk/safety", state: "live" as const },
      { label: "Security & MFA", to: "/desk/security", state: "live" as const },
      { label: "Notifications", to: "/desk/notify", state: "live" as const },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Feature flags", to: "/desk/platform", state: "live" as const },
      { label: "Autoplay and video", to: "/desk/playback", state: "live" as const },
      { label: "Configuration", to: "/desk/platform", state: "live" as const },
      { label: "Audit log", to: "/desk/audit", state: "live" as const },
      { label: "System health", to: "/desk", state: "live" as const },
    ],
  },
  {
    group: "Later — flagged off",
    items: [
      { label: "Bazaar marketplace", to: "/desk/platform", state: "flag" as const },
      { label: "Bazaar Eats", to: "/desk/platform", state: "flag" as const },
      { label: "Payments", to: "/desk/platform", state: "flag" as const },
      { label: "Advertising", to: "/desk/platform", state: "flag" as const },
      { label: "Live streaming", to: "/desk/platform", state: "flag" as const },
      { label: "Public APIs", to: "/desk/platform", state: "flag" as const },
    ],
  },
];
