export type PowerAppCategory =
  | "All"
  | "Productivity"
  | "Services & Markets"
  | "Business & Talent"
  | "Intelligence & Files"
  | "Security & Ops"

export type PowerAppIconKey =
  | "sign"
  | "invoice"
  | "boards"
  | "forms"
  | "fetch"
  | "services"
  | "studio"
  | "shield"
  | "leadgen"
  | "mobility"
  | "venues"
  | "talent"
  | "cards"
  | "fitness"
  | "markets"
  | "openindex"
  | "motors"
  | "pulse"
  | "social"
  | "devhub"

export interface ConnectLnPowerApp {
  id: string
  name: string
  tagline: string
  category: Exclude<PowerAppCategory, "All">
  kind: "studio" | "external"
  studioTab?: "sign" | "invoice" | "boards" | "forms"
  liveUrl?: string
  localPort?: number
  iconKey: PowerAppIconKey
  emoji: string
  tintClass: string
  solidBgClass: string
  keywords: string[]
}

export const POWER_APP_CATEGORIES: PowerAppCategory[] = [
  "All",
  "Productivity",
  "Services & Markets",
  "Business & Talent",
  "Intelligence & Files",
  "Security & Ops",
]

export const PINNED_POWER_APPS_STORAGE_KEY = "connectln_pinned_power_apps_v1"
export const DEFAULT_PINNED_POWER_APP_IDS = ["sign", "invoice", "fetch", "services"]

export const CONNECTLN_POWER_APPS: ConnectLnPowerApp[] = [
  {
    id: "sign",
    name: "Sign",
    tagline: "Verified e-signatures and tamper-proof audit certificates.",
    category: "Productivity",
    kind: "studio",
    studioTab: "sign",
    iconKey: "sign",
    emoji: "✍️",
    tintClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    solidBgClass: "bg-[#4338CA]",
    keywords: ["sign", "esign", "signature", "contract", "agreement", "audit"],
  },
  {
    id: "invoice",
    name: "Invoice",
    tagline: "Client invoicing, milestone quotes, and real-time billing ledger.",
    category: "Productivity",
    kind: "studio",
    studioTab: "invoice",
    iconKey: "invoice",
    emoji: "🧾",
    tintClass: "bg-teal-50 text-teal-700 border-teal-200/70",
    solidBgClass: "bg-[#0F766E]",
    keywords: ["invoice", "billing", "quote", "estimate", "ledger", "payment"],
  },
  {
    id: "boards",
    name: "Boards",
    tagline: "Kanban workflows, sprint planning, and milestone tracking.",
    category: "Productivity",
    kind: "studio",
    studioTab: "boards",
    iconKey: "boards",
    emoji: "📋",
    tintClass: "bg-amber-50 text-amber-700 border-amber-200/70",
    solidBgClass: "bg-[#B45309]",
    keywords: ["boards", "kanban", "tasks", "projects", "sprint", "planner"],
  },
  {
    id: "forms",
    name: "Forms",
    tagline: "Structured client intake forms, inspections, and surveys.",
    category: "Productivity",
    kind: "studio",
    studioTab: "forms",
    iconKey: "forms",
    emoji: "📝",
    tintClass: "bg-purple-50 text-purple-700 border-purple-200/70",
    solidBgClass: "bg-[#9333EA]",
    keywords: ["forms", "intake", "survey", "checklist", "questionnaire"],
  },
  {
    id: "fetch",
    name: "Fetch",
    tagline: "Multi-segment download accelerator with pause/resume & Cloud Vault.",
    category: "Intelligence & Files",
    kind: "external",
    liveUrl: "https://connectln-fetch.vercel.app",
    localPort: 3018,
    iconKey: "fetch",
    emoji: "⬇️",
    tintClass: "bg-orange-50 text-orange-700 border-orange-200/70",
    solidBgClass: "bg-orange-600",
    keywords: ["fetch", "download", "manager", "vault", "transfer", "segment"],
  },
  {
    id: "services",
    name: "Services",
    tagline: "Book background-checked local home & business pros in minutes.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://connectln-services.vercel.app",
    localPort: 3022,
    iconKey: "services",
    emoji: "🛠️",
    tintClass: "bg-blue-50 text-blue-700 border-blue-200/70",
    solidBgClass: "bg-blue-600",
    keywords: ["services", "local pros", "home maintenance", "hvac", "booking", "repair"],
  },
  {
    id: "skillhands",
    name: "SkillHands.us",
    tagline: "Trusted local home services — instant booking with no account required.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://skillhands-client.vercel.app/",
    iconKey: "services",
    emoji: "🔨",
    tintClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    solidBgClass: "bg-emerald-600",
    keywords: ["skillhands", "home services", "no account", "local pros", "handyman", "plumber", "electrician"],
  },
  {
    id: "build-studio",
    name: "Build Studio",
    tagline: "Custom software development, mobile apps, AI & digital campaigns.",
    category: "Business & Talent",
    kind: "external",
    liveUrl: "https://connectln-studio.vercel.app",
    localPort: 3023,
    iconKey: "studio",
    emoji: "🚀",
    tintClass: "bg-sky-50 text-sky-700 border-sky-200/70",
    solidBgClass: "bg-sky-600",
    keywords: ["build studio", "software", "agency", "digital solutions", "ai", "marketing"],
  },
  {
    id: "shield",
    name: "Shield",
    tagline: "24/7 managed cybersecurity, VAPT, SOC 2/HIPAA audits & incident response.",
    category: "Security & Ops",
    kind: "external",
    liveUrl: "https://connectln-shield.vercel.app",
    localPort: 3024,
    iconKey: "shield",
    emoji: "🛡️",
    tintClass: "bg-cyan-50 text-cyan-800 border-cyan-200/70",
    solidBgClass: "bg-cyan-700",
    keywords: ["shield", "cybersecurity", "vapt", "pentest", "soc2", "hipaa", "security"],
  },
  {
    id: "leadgen",
    name: "LeadGen AI",
    tagline: "Discover local B2B leads, run domain audits & launch outreach CRM.",
    category: "Business & Talent",
    kind: "external",
    liveUrl: "https://connectln-leads.vercel.app",
    localPort: 3025,
    iconKey: "leadgen",
    emoji: "🎯",
    tintClass: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
    solidBgClass: "bg-indigo-600",
    keywords: ["leadgen", "leads", "crm", "prospecting", "outreach", "domain audit"],
  },
  {
    id: "mobility",
    name: "Mobility",
    tagline: "Certified global talent relocation, work visas & immigration advisory.",
    category: "Business & Talent",
    kind: "external",
    liveUrl: "https://connectln-mobility.vercel.app",
    localPort: 3011,
    iconKey: "mobility",
    emoji: "✈️",
    tintClass: "bg-sky-50 text-sky-800 border-sky-200/70",
    solidBgClass: "bg-sky-700",
    keywords: ["mobility", "immigration", "visa", "relocation", "global talent"],
  },
  {
    id: "venues",
    name: "Venues",
    tagline: "Search iconic US ballrooms by ZIP code & lock celebration dates.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://connectln-venues.vercel.app",
    localPort: 3012,
    iconKey: "venues",
    emoji: "🏛️",
    tintClass: "bg-amber-50 text-amber-800 border-amber-200/70",
    solidBgClass: "bg-amber-700",
    keywords: ["venues", "ballrooms", "wedding", "events", "zip", "resort"],
  },
  {
    id: "talent",
    name: "Talent",
    tagline: "Tech staffing, retained executive search & global HR compliance.",
    category: "Business & Talent",
    kind: "external",
    liveUrl: "https://connectln-talent.vercel.app",
    localPort: 3013,
    iconKey: "talent",
    emoji: "🤝",
    tintClass: "bg-violet-50 text-violet-700 border-violet-200/70",
    solidBgClass: "bg-violet-700",
    keywords: ["talent", "staffing", "recruiting", "executive search", "hr compliance"],
  },
  {
    id: "keepsake",
    name: "Keepsake",
    tagline: "Fine letterpress cards and animated holiday & event invitations.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://connectln-cards.vercel.app",
    localPort: 3014,
    iconKey: "cards",
    emoji: "💌",
    tintClass: "bg-rose-50 text-rose-700 border-rose-200/70",
    solidBgClass: "bg-rose-600",
    keywords: ["keepsake", "cards", "invitations", "letterpress", "greeting"],
  },
  {
    id: "fitcoach",
    name: "FitCoach",
    tagline: "Science-based fitness coaching, nutrition plans & performance tracking.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://connectln-fitness.vercel.app",
    localPort: 3015,
    iconKey: "fitness",
    emoji: "💪",
    tintClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    solidBgClass: "bg-emerald-600",
    keywords: ["fitcoach", "fitness", "nutrition", "workout", "coach", "health"],
  },
  {
    id: "markets-ai",
    name: "Markets AI",
    tagline: "World markets quantitative terminal, FX, crypto & AI forecasting.",
    category: "Intelligence & Files",
    kind: "external",
    liveUrl: "https://connectln-markets.vercel.app/dashboard",
    localPort: 3016,
    iconKey: "markets",
    emoji: "📈",
    tintClass: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
    solidBgClass: "bg-emerald-700",
    keywords: ["markets", "stocks", "trading", "quant", "crypto", "fx", "terminal"],
  },
  {
    id: "openindex",
    name: "OpenIndex",
    tagline: "Search curated open datasets & copy verified magnet links.",
    category: "Intelligence & Files",
    kind: "external",
    liveUrl: "https://connectln-index.vercel.app",
    localPort: 3017,
    iconKey: "openindex",
    emoji: "🧲",
    tintClass: "bg-slate-100 text-slate-800 border-slate-200",
    solidBgClass: "bg-slate-800",
    keywords: ["openindex", "datasets", "open source", "magnet", "archive"],
  },
  {
    id: "motors",
    name: "Motors",
    tagline: "Smart auto marketplace with algorithmic fair pricing & deals.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://connectln-motors.vercel.app",
    localPort: 3019,
    iconKey: "motors",
    emoji: "🚗",
    tintClass: "bg-blue-50 text-blue-800 border-blue-200/70",
    solidBgClass: "bg-blue-700",
    keywords: ["motors", "cars", "vehicles", "auto", "valuation", "deals"],
  },
  {
    id: "opspulse",
    name: "OpsPulse",
    tagline: "Real-time uptime, SSL telemetry, Lighthouse & domain monitoring.",
    category: "Security & Ops",
    kind: "external",
    liveUrl: "https://connectln-pulse.vercel.app",
    localPort: 3020,
    iconKey: "pulse",
    emoji: "📡",
    tintClass: "bg-teal-50 text-teal-800 border-teal-200/70",
    solidBgClass: "bg-teal-700",
    keywords: ["opspulse", "uptime", "ssl", "monitoring", "telemetry", "domains"],
  },
  {
    id: "social",
    name: "Social",
    tagline: "Editorial social community for builders, designers & innovators.",
    category: "Intelligence & Files",
    kind: "external",
    liveUrl: "https://connectln-social.vercel.app",
    localPort: 3021,
    iconKey: "social",
    emoji: "🌐",
    tintClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/70",
    solidBgClass: "bg-fuchsia-600",
    keywords: ["social", "community", "editorial", "builders", "designers"],
  },
  {
    id: "devhub",
    name: "DevHub",
    tagline: "Internal engineering control plane, flags, APIs & release ops.",
    category: "Security & Ops",
    kind: "external",
    liveUrl: "https://connectln-devhub.vercel.app",
    iconKey: "devhub",
    emoji: "🛠️",
    tintClass: "bg-zinc-100 text-zinc-800 border-zinc-200",
    solidBgClass: "bg-zinc-800",
    keywords: ["devhub", "developer", "engineering", "idp", "apis", "control plane"],
  },
  {
    id: "noctis-clinic",
    name: "Noctis Clinic",
    tagline: "Watch a Spark, pass a drill, and earn verified clinical & skill stamps.",
    category: "Intelligence & Files",
    kind: "external",
    liveUrl: "https://comet-fair-turbo-clover.grok.me/start",
    iconKey: "pulse",
    emoji: "⚡",
    tintClass: "bg-cyan-50 text-cyan-700 border-cyan-200/70",
    solidBgClass: "bg-cyan-600",
    keywords: ["noctis", "clinic", "spark", "drill", "stamps", "training", "clinical", "learning"],
  },
  {
    id: "campussync",
    name: "CampusSync",
    tagline: "College community hub for courses, shuttles, dining, clubs & campus housing.",
    category: "Services & Markets",
    kind: "external",
    liveUrl: "https://expedite-consults.vercel.app/campus",
    iconKey: "venues",
    emoji: "🎓",
    tintClass: "bg-amber-50 text-amber-800 border-amber-200/70",
    solidBgClass: "bg-amber-600",
    keywords: ["campussync", "campus", "college", "university", "courses", "shuttles", "dining", "housing"],
  },
]

export function loadPinnedPowerAppIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_PINNED_POWER_APP_IDS
  try {
    const raw = window.localStorage.getItem(PINNED_POWER_APPS_STORAGE_KEY)
    if (!raw) return DEFAULT_PINNED_POWER_APP_IDS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_PINNED_POWER_APP_IDS
    const validIds = new Set(CONNECTLN_POWER_APPS.map((a) => a.id))
    const filtered = parsed.filter((id): id is string => typeof id === "string" && validIds.has(id))
    return filtered.length > 0 ? filtered : DEFAULT_PINNED_POWER_APP_IDS
  } catch {
    return DEFAULT_PINNED_POWER_APP_IDS
  }
}

export function savePinnedPowerAppIds(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PINNED_POWER_APPS_STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new Event("connectln_pinned_power_apps_change"))
  } catch {}
}
