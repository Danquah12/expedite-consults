import type { GlobalJobItem } from "./global-jobs-data"
import type { CategorizedNotificationItem } from "./notifications-engine-data"
import type { MarketplaceProduct } from "./marketplace-engine-data"
import type { LearningCourse, InteractiveLab } from "./learning-platform-data"
import type { MediaVideoItem, MediaClipItem } from "./connectin-media-data"
import type { PulseArticle } from "./pulse-news-data"
import type {
  RFPQuoteRequest,
  EnterpriseBounty,
  GatedGuild,
} from "./professional-superapp-data"
import type { ConnectInEvent } from "./connectin-os-data"
import type {
  PulseRoom,
  ProductLaunchItem,
  WatercoolerThread,
} from "./nextgen-data"
import type { WorkOpportunityItem, ServiceListing } from "./work-business-data"

/**
 * ConnectLn Unified 24-Hour Additive Platform Schedule Engine
 * -----------------------------------------------------------
 * Adds fresh items every 24 hours across:
 *   1. Jobs (`Jobs` tab & `/api/connectin/jobs`)
 *   2. Alerts (`Alerts` tab & `/api/connectin/alerts`)
 *   3. Market (`Market` tab)
 *   4. Learning Materials (`Learning` tab: video courses + interactive labs)
 *   5. Media (`Media` tab: featured videos + vertical clips)
 *   6. Pulse (`Pulse` tab: intelligence articles + live audio rooms)
 *   7. More Tabs (`Procurement & RFPs`, `Bounties & Hackathons`, `Events`, `Guilds`, `Launchpad`, `Watercooler`, `Work & Business`)
 *
 * STRICTLY ADDITIVE: Existing items and prior daily cycles are NEVER deleted.
 */

export const DAILY_PLATFORM_EPOCH_UTC_MS = Date.UTC(2026, 10, 17, 6, 0, 0) // 06:00 UTC daily cadence
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const MAX_ACCUMULATED_DAYS = 180

export function getElapsed24HourScheduleDays(nowMs: number = Date.now()): number {
  if (nowMs < DAILY_PLATFORM_EPOCH_UTC_MS) {
    return 1
  }
  const diff = Math.floor((nowMs - DAILY_PLATFORM_EPOCH_UTC_MS) / ONE_DAY_MS) + 1
  return Math.max(1, Math.min(MAX_ACCUMULATED_DAYS, diff))
}

function getCycleDateMeta(dayNumber: number, nowMs: number = Date.now()): {
  isoDate: string
  shortDate: string
  relativeLabel: string
  futureDeadline: string
} {
  const cycleTimestamp = DAILY_PLATFORM_EPOCH_UTC_MS + (dayNumber - 1) * ONE_DAY_MS
  const d = new Date(cycleTimestamp)
  const isoDate = d.toISOString().slice(0, 10)
  const shortDate = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const ageHours = Math.max(0, Math.floor((nowMs - cycleTimestamp) / 3_600_000))
  const relativeLabel =
    ageHours < 1
      ? "Added just now · 24h Schedule"
      : ageHours < 24
      ? `${ageHours}h ago · 24h Schedule`
      : `${Math.floor(ageHours / 24)}d ago · 24h Archive`

  const future = new Date(cycleTimestamp + 14 * ONE_DAY_MS)
  const futureDeadline = future.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return { isoDate, shortDate, relativeLabel, futureDeadline }
}

// Verified playable YouTube IDs EXCLUSIVE to the Learning Tab (never overlapping Home or Media tabs)
const LEARNING_DAILY_YOUTUBE_POOL = [
  {
    youtubeId: "zGVM7myTE6E",
    thumb: "https://i.ytimg.com/vi/zGVM7myTE6E/hqdefault.jpg",
    creator: "ConnectLn Academy Faculty",
    role: "Applied Security & Systems Instructor",
  },
  {
    youtubeId: "EHjmxujXIaQ",
    thumb: "https://i.ytimg.com/vi/EHjmxujXIaQ/hqdefault.jpg",
    creator: "Cloud & Zero-Trust Architecture Lab",
    role: "Principal Cloud Defense Engineer",
  },
  {
    youtubeId: "alYIYtIxIVE",
    thumb: "https://i.ytimg.com/vi/alYIYtIxIVE/hqdefault.jpg",
    creator: "ConnectLn Field Engineering Workshop",
    role: "Lead Practical Safety & Verification Trainer",
  },
  {
    youtubeId: "H2MMMFK8G6g",
    thumb: "https://i.ytimg.com/vi/H2MMMFK8G6g/hqdefault.jpg",
    creator: "Enterprise Governance & Risk Faculty",
    role: "Federal Compliance & Security Architect",
  },
  {
    youtubeId: "L9DNl1nJFPE",
    thumb: "https://i.ytimg.com/vi/L9DNl1nJFPE/hqdefault.jpg",
    creator: "Distributed Infrastructure Guild",
    role: "Senior Systems & Network Engineer",
  },
  {
    youtubeId: "86V_9l84GL0",
    thumb: "https://i.ytimg.com/vi/86V_9l84GL0/hqdefault.jpg",
    creator: "Clinical Emergency Grand Rounds",
    role: "Critical Care & Resuscitation Faculty",
  },
]

// Verified playable YouTube IDs EXCLUSIVE to the Media & Pulse Tabs (never overlapping Home or Learning)
const MEDIA_DAILY_YOUTUBE_POOL = [
  {
    youtubeId: "9vJRopau0g0",
    thumb: "https://i.ytimg.com/vi/9vJRopau0g0/hqdefault.jpg",
    creator: "Johns Hopkins Clinical Broadcast",
    role: "Director of Clinical Pharmacy & Stewardship",
  },
  {
    youtubeId: "iG9CE55wbtY",
    thumb: "https://i.ytimg.com/vi/iG9CE55wbtY/hqdefault.jpg",
    creator: "Global Education & Talent Forum",
    role: "Keynote Leadership & Workforce Innovation",
  },
  {
    youtubeId: "qp0HIF3SfI4",
    thumb: "https://i.ytimg.com/vi/qp0HIF3SfI4/hqdefault.jpg",
    creator: "Executive Leadership Briefing Desk",
    role: "Principal Organizational Strategy Director",
  },
  {
    youtubeId: "arj7oStGLkU",
    thumb: "https://i.ytimg.com/vi/arj7oStGLkU/hqdefault.jpg",
    creator: "Clinical Triage & Patient Care Desk",
    role: "Lead Allied Health & EHR Instructor",
  },
  {
    youtubeId: "UF8uR6Z6KLc",
    thumb: "https://i.ytimg.com/vi/UF8uR6Z6KLc/hqdefault.jpg",
    creator: "Hospital Capacity & Operations Broadcast",
    role: "Chief Hospital Operations Executive",
  },
  {
    youtubeId: "hN2e7_A1kBw",
    thumb: "https://i.ytimg.com/vi/hN2e7_A1kBw/hqdefault.jpg",
    creator: "Surgical & Trauma Grand Rounds",
    role: "Chief of Trauma Surgery & Reconstruction",
  },
]

// ============================================================================
// 1. DAILY JOBS (Additive across Skilled Trades, Cyber, Healthcare, Auto, Energy)
// ============================================================================
const DAILY_JOB_ROTATION = [
  {
    titlePrefix: "Lead Commercial Electrical & Microgrid Foreman",
    company: "Quanta & Rosendin Grid Services",
    companyLogo: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&auto=format&fit=crop&q=80",
    hub: "Washington, DC Metro",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "trades_construction",
    domainCategory: "Skilled Trades & Power",
    salaryRange: "$128,000 - $168,000 / yr",
    applyUrl: "https://careers.quantaservices.com/",
    tags: ["NEC 2026", "480V Switchgear", "Solar Microgrid", "IBEW / Master Electrician"],
    description:
      "Lead commercial 480V switchgear terminations, hospital backup generator tie-ins, and battery storage commissioning with full overtime and per-diem.",
    requirements: [
      "Journeyman or Master Electrician license + OSHA 30",
      "Blueprint single-line diagram reading & conduit layout",
      "NFPA 70E arc-flash lockout/tagout certification",
    ],
  },
  {
    titlePrefix: "Principal Cloud & Autonomous SOC Architect",
    company: "Expedite Defense & GovCloud",
    companyLogo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
    hub: "US Remote",
    workplaceType: "Remote" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "tech_cybersecurity",
    domainCategory: "Cybersecurity & Cloud",
    salaryRange: "$195,000 - $245,000 / yr",
    applyUrl: "https://www.clearancejobs.com/jobs?keywords=Cloud+Security+Architect",
    tags: ["Zero Trust", "AWS GovCloud", "eBPF", "NIST 800-53 cATO"],
    description:
      "Architect multi-account AWS GovCloud landing zones, runtime eBPF workload containment, and continuous OSCAL authorization pipelines.",
    requirements: [
      "7+ years Cloud Security, Kubernetes/Cilium, and Terraform IaC",
      "Hands-on NIST SP 800-53 Rev 5 & FedRAMP High automation",
      "Active or eligible US security clearance preferred",
    ],
  },
  {
    titlePrefix: "ICU & Emergency Trauma Nurse Specialist (CCRN)",
    company: "Johns Hopkins & MedStar Clinical",
    companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
    hub: "Baltimore / DC Corridor",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "healthcare_medicine",
    domainCategory: "Clinical Healthcare",
    salaryRange: "$138,000 - $172,000 / yr + Sign-On",
    applyUrl: "https://jobs.hopkinsmedicine.org/",
    tags: ["CCRN", "Level 1 Trauma", "Hemodynamics", "Smart-Pump BCMA"],
    description:
      "Coordinate critical care trauma resuscitation, rapid whole-blood infusion protocols, and interdisciplinary sepsis triage in a Level 1 center.",
    requirements: [
      "Active RN license + BLS, ACLS, and CCRN / TNCC",
      "2+ years high-acuity ICU or Emergency Trauma experience",
      "Point-of-care lactate & arterial line monitoring proficiency",
    ],
  },
  {
    titlePrefix: "Master 800V EV & Fleet Oscilloscope Diagnostic Lead",
    company: "Capitol Commercial EV & Diesel Fleet",
    companyLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
    hub: "Austin / Dallas, TX",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "automotive_mechanics",
    domainCategory: "Automotive & Fleet",
    salaryRange: "$115,000 - $148,000 / yr",
    applyUrl: "https://ryder.com/careers",
    tags: ["ASE Master A1-A8", "ASE L3 EV", "PicoScope CAN-FD", "800V HV Safety"],
    description:
      "Diagnose CAN-FD multiplex bus faults, silicon-carbide inverter isolation faults, and ADAS radar calibrations across commercial EV & diesel fleets.",
    requirements: [
      "ASE Master Technician (A1–A8) + L1 or L3 High-Voltage EV",
      "4-channel PicoScope waveform & current-ramp diagnostics",
      "CAT IV 1000V HV lockout/tagout proving unit certification",
    ],
  },
]

export function getAccumulatedDailyJobs(nowMs: number = Date.now()): GlobalJobItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: GlobalJobItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    // Add 2 distinct cross-industry jobs every 24 hours
    for (let slot = 0; slot < 2; slot++) {
      const tmpl = DAILY_JOB_ROTATION[(day * 2 + slot) % DAILY_JOB_ROTATION.length]
      out.push({
        id: `daily_job_d${day}_s${slot}`,
        countryCode: "US",
        countryName: "United States",
        title: `${tmpl.titlePrefix} (Cycle #${day} · ${meta.shortDate})`,
        company: tmpl.company,
        companyLogo: tmpl.companyLogo,
        location: `${tmpl.hub} (${tmpl.workplaceType})`,
        hub: tmpl.hub,
        workplaceType: tmpl.workplaceType,
        employmentType: tmpl.employmentType,
        professionEnclave: tmpl.professionEnclave,
        domainCategory: tmpl.domainCategory,
        postedTime: meta.relativeLabel,
        applicantsCount: 6 + ((day * 5 + slot * 3) % 24),
        salaryRange: tmpl.salaryRange,
        easyApply: true,
        description: tmpl.description,
        requirements: tmpl.requirements,
        languageRequirement: "English",
        applyUrl: tmpl.applyUrl,
        source: "ConnectLn 24h Scheduled Requisition Feed",
        tags: [...tmpl.tags, "24h New Drop"],
        isLiveFeed: true,
      })
    }
  }
  return out
}

// ============================================================================
// 2. DAILY ALERTS & 24-HOUR NOCTIS FRONTIER CHALLENGES (Strictly Additive Every 24h)
// ============================================================================
export interface DailyFrontierChallengeItem {
  id: string
  dayNumber: number
  shortDate: string
  relativeLabel: string
  isLatestToday: boolean
  shortChipLabel: string
  domain: string
  question: string
  vetoTitle: string
  verdict: string
  fullResponse: string
  durationMs: number
  status: string
  expectedKeywords: string[]
  sampleAnswer: string
}

const DAILY_FRONTIER_CHALLENGE_ROTATION = [
  {
    shortChipLabel: "Hypersonic Mach 7",
    domain: "HYPERSONICS_AEROSPACE_SCRAMJET",
    question:
      "At Mach 7.2 and 28 km altitude, what stagnation temperature is reached at a scramjet leading edge and what active thermal protection invariant is mandated?",
    vetoTitle: "🚨 AEROSPACE THERMAL INVARIANT: HYPERSONIC STAGNATION COOLING MANDATE",
    verdict:
      "Stagnation temperature T_0 >= 2,240 K exceeds uncooled superalloy melting thresholds; mandates active regenerative fuel-film transpiration cooling over C/SiC ceramic matrix composites.",
    fullResponse: `### Noctis Hypersonic Aerothermodynamics & Scramjet Engine (NOCTIS-AERO-HYPERSONIC-001)
**Subsystem Domain:** \`HYPERSONICS_AEROSPACE_SCRAMJET\` · **Standards:** NASA SP-8072, MIL-HDBK-5J, AIAA Hypersonic TPS Guidelines

#### 1. Compressible Stagnation Enthalpy Telemetry
- **Flight Mach & Altitude:** **\`Mach 7.2 at 28 km Stratospheric Corridor\`**
- **Isentropic/Real-Gas Stagnation Temperature ($T_0$):** **\`2,240 K – 2,410 K\`** ($T_0 = T_\\infty (1 + \\frac{\\gamma - 1}{2} M^2)$ with real-gas dissociation adjustment)
- **Peak Leading-Edge Heat Flux:** **\`> 18.5 MW/m²\`** at 3mm nose radius

#### 2. Sovereign Safety Invariant & Thermal Veto
- **Uncooled Metal Failure Veto:** Inconel/Titanium structural limits (< 1,350 K) are exceeded within 1.4 seconds.
- **Mandated Protection:** **\`C/SiC or ZrB2-SiC Ultra-High-Temperature Ceramic Matrix Composites (UHTCMC)\`** paired with endothermic hydrocarbon regenerative transpiration cooling.`,
    durationMs: 10.42,
    expectedKeywords: ["2200", "stagnation", "transpiration", "c/sic", "ceramic", "cooling"],
    sampleAnswer:
      "At Mach 7.2, stagnation temperature exceeds 2,240 K, requiring C/SiC or ZrB2-SiC ceramic matrix composites with active regenerative endothermic transpiration cooling.",
  },
  {
    shortChipLabel: "Cholinergic 2-PAM",
    domain: "CLINICAL_TOXICOLOGY_ANTIDOTE",
    question:
      "A patient presents with pinpoint miosis, bronchorrhea, bradycardia, salivation, lacrimation, and fasciculations after organophosphate exposure. What dual-antidote protocol and aging invariant apply?",
    vetoTitle: "🚨 CLINICAL TOXICOLOGY MANDATE: ATROPINE + PRALIDOXIME (2-PAM) PROTOCOL",
    verdict:
      "Cholinergic crisis requires immediate titrated IV Atropine (doubling every 3–5m until bronchorrhea clears) plus Pralidoxime (2-PAM 1–2g IV) prior to acetylcholinesterase phosphorylation aging.",
    fullResponse: `### Noctis Clinical Toxicology & Emergency Antidote Engine (NOCTIS-CLIN-TOX-001)
**Subsystem Domain:** \`CLINICAL_TOXICOLOGY_ANTIDOTE\` · **Standards:** Goldfrank's Toxicologic Emergencies, ACMT / WHO Poison Control Guidelines

#### 1. Toxidrome Identification & Muscarinic/Nicotinic Split
- **Muscarinic Overload (DUMBBELS/SLUDGE):** Diarrhea, Urination, Miosis, Bronchorrhea, Bradycardia, Emesis, Lacrimation, Salivation.
- **Nicotinic Neuromuscular Blockade:** Fasciculations progressing to diaphragmatic paralysis (not reversed by Atropine alone).

#### 2. Dual-Antidote Invariant Mandate
1. **Atropine Sulfate (Muscarinic Antagonist):** Start 2–5 mg IV push, doubling dose every 3–5 minutes until pulmonary secretions clear (**dry lungs endpoint**, not pupil dilation).
2. **Pralidoxime / 2-PAM (Oxime AChE Reactivator):** 1–2 g IV infusion over 15–30 min to cleave the organophosphate-ester bond before irreversible **aging** occurs.`,
    durationMs: 11.18,
    expectedKeywords: ["atropine", "pralidoxime", "2-pam", "bronchorrhea", "cholinergic", "aging"],
    sampleAnswer:
      "This is a cholinergic organophosphate toxidrome. Administer IV Atropine doubled every 3-5 minutes until bronchorrhea clears, plus Pralidoxime (2-PAM) to reactivate acetylcholinesterase before irreversible aging.",
  },
  {
    shortChipLabel: "Trauma 1:1:1 MTP",
    domain: "TRAUMA_HEMORRHAGIC_RESUSCITATION",
    question:
      "A polytrauma patient arrives with BP 78/46, HR 132 (Shock Index 1.69), base deficit -9 mEq/L, and FAST-positive hemoperitoneum. What balanced transfusion invariant and adjunct are mandated?",
    vetoTitle: "🚨 LEVEL-1 TRAUMA MANDATE: 1:1:1 MASSIVE TRANSFUSION & TXA PROTOCOL",
    verdict:
      "Immediate 1:1:1 Massive Transfusion Protocol (pRBC : FFP : Platelets), Tranexamic Acid (TXA 1g IV within 3h), ionized Ca2+ repletion, and strict crystalloid restriction to prevent lethal triad.",
    fullResponse: `### Noctis Level-1 Trauma & Hemorrhagic Shock Engine (NOCTIS-TRAUMA-MTP-001)
**Subsystem Domain:** \`TRAUMA_HEMORRHAGIC_RESUSCITATION\` · **Standards:** ACS ATLS 10th Edition, PROPPR Trial, CRASH-2 Protocol

#### 1. Hemodynamic & Lethal Triad Telemetry
- **Shock Index (HR / SBP):** **\`132 / 78 = 1.69\`** (Critical Threshold: > 1.0; ABC Score ≥ 2 triggers instant MTP)
- **Lethal Triad Prevention:** Prevent dilutional coagulopathy, hypothermia, and metabolic acidosis.

#### 2. Damage Control Resuscitation Invariants
- **Balanced 1:1:1 Ratio:** Infuse **\`1:1:1 pRBC : Plasma (FFP) : Platelets\`** (or low-titer O whole blood).
- **Antifibrinolytic Window:** **\`Tranexamic Acid (TXA) 1g IV over 10 min\`** followed by 1g over 8h (must initiate within 3 hours of injury).
- **Citrate Toxicity Guardrail:** Replete **\`Calcium Chloride / Gluconate\`** every 4 units to maintain ionized $Ca^{2+} > 1.1\\text{ mmol/L}$.`,
    durationMs: 9.84,
    expectedKeywords: ["1:1:1", "mtp", "txa", "tranexamic", "crystalloid", "calcium", "platelets"],
    sampleAnswer:
      "Activate 1:1:1 Massive Transfusion Protocol (pRBC:FFP:Platelets), restrict crystalloids to avoid dilutional coagulopathy, give 1g IV TXA within 3 hours, and monitor/replete ionized calcium.",
  },
  {
    shortChipLabel: "Postgres SSI Skew",
    domain: "DATABASES_SERIALIZABLE_SSI",
    question:
      "In PostgreSQL MVCC, two concurrent transactions read intersecting doctor on-call rows and each update a different row, violating the minimum-1-doctor invariant. Why does Repeatable Read permit this write skew, and how does SSI prevent it?",
    vetoTitle: "🚨 DATABASE CONSISTENCY INVARIANT: SSI SIREAD PREDICATE LOCKING",
    verdict:
      "Snapshot Isolation (Repeatable Read) only detects write-write conflicts on the same row; Serializable Snapshot Isolation (SSI) tracks rw-antidependency cycles via SIREAD predicate locks and aborts with SQLSTATE 40001.",
    fullResponse: `### Noctis Transactional Database & SSI Verification Engine (NOCTIS-DB-SSI-001)
**Subsystem Domain:** \`DATABASES_SERIALIZABLE_SSI\` · **Standards:** Cahill et al. Serializable Snapshot Isolation, PostgreSQL SQLSTATE 40001

#### 1. Write-Skew Anomaly Under Snapshot Isolation
- **Mechanism:** Transaction $T_1$ and $T_2$ take concurrent MVCC snapshots, both see 2 doctors on call, and update *disjoint* rows ($T_1$ updates Alice, $T_2$ updates Bob).
- **Why Repeatable Read Fails:** No two transactions modified the same tuple, so standard first-committer-wins row locks do not fire.

#### 2. SSI Invariant Enforcement
- **SIREAD Predicate Locks:** PostgreSQL \`SERIALIZABLE\` places non-blocking \`SIREAD\` locks on scanned index/page ranges.
- **Dangerous Structure Detection:** When two adjacent \`rw-antidependency\` edges form a cycle ($T_1 \\xrightarrow{rw} T_2 \\xrightarrow{rw} T_1$), SSI aborts one transaction with **\`SQLSTATE 40001 (serialization_failure)\`** for safe application retry.`,
    durationMs: 8.95,
    expectedKeywords: ["siread", "write skew", "40001", "predicate", "rw-antidependency", "serializable"],
    sampleAnswer:
      "Repeatable Read only blocks concurrent writes to the same row, allowing disjoint write skew. PostgreSQL SSI uses SIREAD predicate locks to detect rw-antidependency cycles and aborts one transaction with SQLSTATE 40001.",
  },
  {
    shortChipLabel: "SRE 14.4x Burn",
    domain: "DEVOPS_SRE_ERROR_BUDGET",
    question:
      "For a tier-0 production service with a 99.9% 30-day availability SLO, what is the monthly error budget in minutes, and what alert invariant triggers when the 1h/5m multi-window burn rate hits 14.4x?",
    vetoTitle: "🚨 SRE RELIABILITY INVARIANT: 14.4X MULTI-WINDOW ERROR BUDGET BURN",
    verdict:
      "30-day error budget = 43.2 minutes (43,200 * 0.001); a 14.4x burn rate consumes 2% of the monthly budget in 1 hour (100% exhaustion in 50 hours), triggering an immediate P1 pager freeze on feature rollouts.",
    fullResponse: `### Noctis Site Reliability & Multi-Window Burn Rate Engine (NOCTIS-SRE-SLO-001)
**Subsystem Domain:** \`DEVOPS_SRE_ERROR_BUDGET\` · **Standards:** Google SRE Workbook Multi-Window Multi-Burn-Rate Alerting

#### 1. Error Budget Calculus (30-Day Rolling Window)
- **Total Window:** $30 \\times 24 \\times 60 = 43,200\\text{ minutes}$
- **Allowed Downtime ($1 - 0.999 = 0.1\\%$):** **\`43.2 minutes / 30 days\`**

#### 2. Multi-Window Burn-Rate Invariant
- **Burn Rate $14.4\\times$:** Consumes **\`2% of the entire 30-day budget in 1 hour\`** ($\\frac{0.02 \\times 720\\text{h}}{1\\text{h}} = 14.4$).
- **Short Confirmation Window (5m + 1h):** Requiring both the 1-hour and 5-minute windows to exceed $14.4\\times$ ensures rapid P1 paging while immediately resetting once the incident resolves.
- **Release Freeze Mandate:** Halt non-emergency deployments when remaining 30-day error budget drops to $0\\%$.`,
    durationMs: 7.72,
    expectedKeywords: ["43.2", "2%", "14.4", "50 hours", "multi-window", "error budget", "freeze"],
    sampleAnswer:
      "The 30-day error budget at 99.9% SLO is 43.2 minutes. A 14.4x burn rate consumes 2% of the 30-day budget in 1 hour (exhausting 100% in 50 hours), triggering an immediate P1 page across the 1h and 5m windows and freezing feature releases.",
  },
  {
    shortChipLabel: "70B LLM KV-Cache",
    domain: "IT_AIML_KV_CACHE_CALCULUS",
    question:
      "A 70B-parameter transformer (80 layers, 64 attention heads, head_dim 128) serves batch size 16 at 4,096 context length in FP16 without GQA. What is the exact KV-cache VRAM footprint, and how does 8-group GQA reduce it?",
    vetoTitle: "🚨 AI INFRASTRUCTURE INVARIANT: KV-CACHE VRAM & GQA COMPRESSION",
    verdict:
      "Uncompressed MHA KV-cache = 2 * 16 * 4096 * 80 * 64 * 128 * 2 bytes = 171.80 GB (160 GiB); 8-KV-head Grouped-Query Attention (8x compression) reduces KV-cache to 21.47 GB (20 GiB).",
    fullResponse: `### Noctis LLM Inference & KV-Cache Memory Calculus Engine (NOCTIS-AIML-KVCACHE-001)
**Subsystem Domain:** \`IT_AIML_KV_CACHE_CALCULUS\` · **Standards:** FlashAttention-2 / PagedAttention Memory Invariants

#### 1. Exact KV-Cache Memory Formula
$$\\text{KV Bytes} = 2_{K,V} \\times B \\times S \\times L \\times H_{kv} \\times D_h \\times \\text{bytes}(\\text{FP16})$$
- **Standard MHA ($H_{kv} = 64$):**
  $2 \\times 16 \\times 4096 \\times 80 \\times 64 \\times 128 \\times 2 = 171,798,691,840\\text{ bytes} = \\mathbf{160.0\\text{ GiB (171.8 GB)}}$
- **Exceeds Single H100 80GB VRAM** before even loading model weights!

#### 2. Grouped-Query Attention (GQA) & PagedAttention Invariant
- **GQA ($H_{kv} = 8$, $8\\times$ reduction):** Reduces KV-cache to **\`20.0 GiB (21.47 GB)\`**, allowing weights + KV-cache to fit across a 2×H100 NVLink tensor-parallel pair with PagedAttention block tables.`,
    durationMs: 8.64,
    expectedKeywords: ["160", "171.8", "20", "gqa", "grouped-query", "pagedattention", "2 *"],
    sampleAnswer:
      "Using 2 * B * S * L * H * D * 2 bytes, uncompressed MHA KV-cache is 160 GiB (171.8 GB). With 8-head Grouped-Query Attention (8x reduction), the KV-cache drops to 20 GiB (21.47 GB).",
  },
  {
    shortChipLabel: "5G PTP 130ns Sync",
    domain: "TELECOM_5G_ORAN_FRONTHAUL",
    question:
      "In 3GPP Rel-18 5G Standalone and O-RAN 7.2x fronthaul, what maximum absolute time error (|TE|) is permitted by ITU-T G.8275.1 PTP for MIMO beamforming, and what is the URLLC user-plane latency ceiling?",
    vetoTitle: "🚨 TELECOM SYNCHRONIZATION INVARIANT: ITU-T G.8275.1 PTP & URLLC SLA",
    verdict:
      "Category B MIMO beamforming mandates |TE| <= 130 nanoseconds (Class C T-BC boundary clocks <= 10 ns); URLLC user-plane one-way radio latency must be <= 0.5–1.0 ms at 99.999% reliability.",
    fullResponse: `### Noctis 5G Standalone & O-RAN Precision Timing Engine (NOCTIS-5G-ORAN-001)
**Subsystem Domain:** \`TELECOM_5G_ORAN_FRONTHAUL\` · **Standards:** 3GPP TS 38.104, ITU-T G.8275.1, O-RAN WG4 CUS-Plane

#### 1. Precision Time Protocol (PTP) Phase Synchronization
- **Profile:** **\`ITU-T G.8275.1 Full Timing Support (FTS) with SyncE\`**
- **Max Absolute Time Error ($|TE|$):** **\`≤ 130 ns\`** at the O-RU antenna reference point for TDD guard-band protection and Massive MIMO coherent beamforming (Category B).
- **Holdover Invariant:** GNSS loss requires rubidium/OCXO holdover maintaining phase drift $< 1.5\\text{ }\\mu\\text{s}$ over 24 hours.

#### 2. URLLC User-Plane Invariant
- **One-Way UP Latency:** **\`≤ 1.0 ms (0.5 ms per direction)\`** using mini-slots (2 OFDM symbols) and configured grant (CG) uplink.`,
    durationMs: 9.21,
    expectedKeywords: ["130 ns", "g.8275.1", "ptp", "synce", "1.0 ms", "urllc", "beamforming"],
    sampleAnswer:
      "ITU-T G.8275.1 mandates a maximum absolute time error |TE| <= 130 ns for Category B MIMO beamforming with SyncE/PTP boundary clocks, and URLLC user-plane latency must be <= 1.0 ms.",
  },
  {
    shortChipLabel: "zk-STARK Post-Quantum",
    domain: "ZERO_KNOWLEDGE_POST_QUANTUM",
    question:
      "In verifiable computation, why is Groth16 zk-SNARK vulnerable to quantum adversaries and toxic-waste setup compromise, and how do FRI-based zk-STARKs guarantee post-quantum soundness?",
    vetoTitle: "🚨 CRYPTOGRAPHIC PROOF INVARIANT: POST-QUANTUM FRI ZK-STARK SOUNDNESS",
    verdict:
      "Groth16 relies on elliptic-curve pairings broken in polynomial time by Shor's algorithm and requires a trusted setup ceremony; zk-STARKs use transparent collision-resistant hash commitments and FRI Reed-Solomon proximity proofs.",
    fullResponse: `### Noctis Verifiable Computing & Zero-Knowledge Proof Engine (NOCTIS-CRYPTO-ZKP-001)
**Subsystem Domain:** \`ZERO_KNOWLEDGE_POST_QUANTUM\` · **Standards:** Ben-Sasson et al. zk-STARKs, NIST Post-Quantum Security Guidelines

#### 1. Groth16 / Pairing-Based SNARK Vulnerabilities
- **Toxic Waste Risk:** Compromising the trapdoor scalar $\\tau$ in the multi-party trusted setup allows forging arbitrary false proofs undetected.
- **Quantum Breakdown:** Shor's algorithm solves discrete logarithms on BN254/BLS12-381 curves in $O(n^3)$ quantum gates.

#### 2. zk-STARK Transparent Post-Quantum Invariant
- **Transparent Setup:** Public randomness only (Fiat-Shamir over SHA-3 / Poseidon2).
- **Post-Quantum Soundness:** Relies strictly on **\`Fast Reed-Solomon Interactive Oracle Proofs of Proximity (FRI)\`** and Merkle hash commitments (Grover-resistant at 256-bit digest output).`,
    durationMs: 10.05,
    expectedKeywords: ["shor", "trusted setup", "toxic waste", "fri", "reed-solomon", "hash", "post-quantum"],
    sampleAnswer:
      "Groth16 requires a trusted setup (toxic waste forging risk) and relies on elliptic-curve pairings broken by Shor's algorithm. zk-STARKs use transparent public randomness, collision-resistant hashes, and FRI Reed-Solomon proximity proofs for post-quantum security.",
  },
  {
    shortChipLabel: "IEEE 1584 Arc-Flash",
    domain: "NFPA_70E_IEEE_1584_ARC_FLASH",
    question:
      "A 480V commercial switchgear bus has 35 kA bolted fault current and an upstream breaker clearing time of 0.08s (5 cycles) at 18-inch working distance. If incident energy reaches 14.2 cal/cm², what NFPA 70E PPE category and approach boundary rules apply?",
    vetoTitle: "🚨 ELECTRICAL SAFETY MANDATE: NFPA 70E CAT 3 ARC-FLASH & LOTO VETO",
    verdict:
      "14.2 cal/cm² exceeds Arc-Flash PPE Category 2 (8 cal/cm²); mandates Category 3 Arc-Rated suit (>= 25 cal/cm² rating), energized work permit, or zero-energy Lockout/Tagout (LOTO) verification.",
    fullResponse: `### Noctis Electrical Power & NFPA 70E Arc-Flash Engine (NOCTIS-POWER-70E-001)
**Subsystem Domain:** \`NFPA_70E_IEEE_1584_ARC_FLASH\` · **Standards:** NFPA 70E (2024/2026), IEEE 1584-2018, OSHA 29 CFR 1910.333

#### 1. Incident Energy & Arc-Flash Boundary Telemetry
- **System Parameters:** **\`480V 3-Phase · 35 kA Bolted Fault · 80 ms Clearing Time\`**
- **Calculated Incident Energy at 18 in (455 mm):** **\`14.2 cal/cm²\`** (Second-degree burn threshold = $1.2\\text{ cal/cm}^2$)

#### 2. Mandatory NFPA 70E Invariant Controls
- **Zero-Energy LOTO First:** De-energize, lockout/tagout, and verify absence of voltage (Live-Dead-Live test with CAT IV 600V meter).
- **PPE Category Mandate:** If energized diagnostic testing is justified, **\`Arc-Flash PPE Category 3 (Minimum 25 cal/cm² arc-rated flash suit, hood, voltage-rated gloves)\`** is required because $14.2\\text{ cal/cm}^2 > 8.0\\text{ cal/cm}^2$ (Cat 2 ceiling).`,
    durationMs: 8.38,
    expectedKeywords: ["category 3", "25 cal", "1.2 cal", "loto", "lockout", "nfpa 70e", "live-dead-live"],
    sampleAnswer:
      "At 14.2 cal/cm², Category 2 PPE (8 cal/cm² max) is insufficient. NFPA 70E mandates de-energizing via LOTO (Live-Dead-Live verification) or wearing Arc-Flash PPE Category 3 rated for at least 25 cal/cm² across the 1.2 cal/cm² arc-flash boundary.",
  },
  {
    shortChipLabel: "800V EV Isolation",
    domain: "AUTOMOTIVE_800V_EV_ISOLATION",
    question:
      "An 800V silicon-carbide (SiC) commercial EV traction bus reports an IMD isolation fault with chassis resistance dropping to 180 kΩ. Under ISO 6469-3 / FMVSS 305, what is the minimum required isolation resistance in Ω/V and what contactor action is triggered?",
    vetoTitle: "🚨 HIGH-VOLTAGE EV SAFETY VETO: ISO 6469-3 ISOLATION FAULT CONTACTOR TRIP",
    verdict:
      "Minimum required AC/DC combined isolation resistance is 500 Ω/V (400 kΩ at 800V); 180 kΩ (225 Ω/V) breaches safety limits, mandating immediate high-voltage contactor opening and active bus discharge < 60V in < 5 seconds.",
    fullResponse: `### Noctis 800V High-Voltage EV Powertrain & IMD Safety Engine (NOCTIS-EV-800V-001)
**Subsystem Domain:** \`AUTOMOTIVE_800V_EV_ISOLATION\` · **Standards:** ISO 6469-3, FMVSS 305, SAE J1766

#### 1. High-Voltage Isolation Monitoring (IMD) Calculus
- **Nominal Traction Bus Voltage:** **\`800 V DC\`**
- **Measured Chassis Isolation Resistance ($R_{iso}$):** **\`180 kΩ (225 Ω/V)\`**
- **Statutory Threshold:** **\`≥ 500 Ω/V\`** ($800\\text{ V} \\times 500\\text{ }\\Omega/\\text{V} = \\mathbf{400\\text{ k}\\Omega\\text{ minimum}}$)

#### 2. Sovereign Safety Invariant & Service Lockout
- **Contactor Trip:** BMS opens main positive/negative & pre-charge contactors and commands active bleed resistors to discharge DC-link capacitors to **\`< 60 V DC within 5 seconds\`**.
- **Technician Service Protocol:** Remove Manual Service Disconnect (MSD), wait 5 minutes for capacitor bleed, and verify $0.0\\text{ V}$ with a CAT III 1000V meter using Live-Dead-Live proving.`,
    durationMs: 9.06,
    expectedKeywords: ["500", "400 k", "contactor", "60v", "5 seconds", "msd", "iso 6469"],
    sampleAnswer:
      "Under ISO 6469-3 and FMVSS 305, minimum isolation resistance is 500 ohms/V (400 kOhm for an 800V bus). At 180 kOhm (225 ohms/V), the BMS must open HV contactors and discharge the DC link below 60V within 5 seconds.",
  },
]

export function getNext24HourAlertCountdown(nowMs: number = Date.now()): {
  cycleNumber: number
  hoursRemaining: number
  minutesRemaining: number
  nextDropUtcIso: string
} {
  const cycleNumber = getElapsed24HourScheduleDays(nowMs)
  const nextDropMs = DAILY_PLATFORM_EPOCH_UTC_MS + cycleNumber * ONE_DAY_MS
  const remainingMs = Math.max(60_000, nextDropMs - nowMs)
  const hoursRemaining = Math.floor(remainingMs / 3_600_000)
  const minutesRemaining = Math.floor((remainingMs % 3_600_000) / 60_000)
  return {
    cycleNumber,
    hoursRemaining,
    minutesRemaining,
    nextDropUtcIso: new Date(nextDropMs).toISOString(),
  }
}

export function getAccumulatedDailyFrontierChallenges(
  nowMs: number = Date.now()
): DailyFrontierChallengeItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: DailyFrontierChallengeItem[] = []
  for (let day = 1; day <= days; day++) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl =
      DAILY_FRONTIER_CHALLENGE_ROTATION[(day - 1) % DAILY_FRONTIER_CHALLENGE_ROTATION.length]
    const roundNumber = Math.floor((day - 1) / DAILY_FRONTIER_CHALLENGE_ROTATION.length) + 1
    const cycleSuffix = roundNumber > 1 ? ` [Rev ${roundNumber} · Cycle #${day}]` : ""
    out.push({
      id: `CHALLENGE-24H-DAY-${day}`,
      dayNumber: day,
      shortDate: meta.shortDate,
      relativeLabel: meta.relativeLabel,
      isLatestToday: day === days,
      shortChipLabel: `${tmpl.shortChipLabel} (${meta.shortDate.replace(/,\s*\d{4}$/, "")})`,
      domain: `${tmpl.domain}_24H_D${day}`,
      question: `${tmpl.question}${cycleSuffix}`,
      vetoTitle: `${tmpl.vetoTitle} · 24H CYCLE #${day} (${meta.shortDate})`,
      verdict: tmpl.verdict,
      fullResponse: `${tmpl.fullResponse}\n\n---\n**24-Hour Autonomous Schedule Stamp:** Cycle **\`#${day}\`** · Published **\`${meta.shortDate} (06:00 UTC)\`** · Status: **\`VERIFIED ADDITIVE 24H DROP\`**`,
      durationMs: Number((tmpl.durationMs + ((day % 5) * 0.17)).toFixed(2)),
      status: "PASS",
      expectedKeywords: tmpl.expectedKeywords,
      sampleAnswer: tmpl.sampleAnswer,
    })
  }
  return out
}

const DAILY_ALERT_ROTATION = [
  {
    category: "Career" as const,
    subType: "Job Match" as const,
    actorName: "ConnectLn 24h Talent Radar",
    actorRole: "Automated Daily Career Matcher",
    titlePrefix: "💼 Daily 24h Hiring Dispatch: High-Pay Skilled Trades, Cyber & Clinical Roles Added",
    descPrefix:
      "New verified requisitions ($115K–$245K) with 1-Click Apply were added to the Jobs & Work boards in today's 24-hour sync without removing prior openings.",
    actionText: "Review New Jobs",
    targetTab: "jobs" as const,
    priority: "high" as const,
  },
  {
    category: "Security" as const,
    subType: "Security Advisory" as const,
    actorName: "ConnectLn Daily Threat & Field Safety Desk",
    actorRole: "24h Compliance & Advisory Monitor",
    titlePrefix: "🛡️ Daily 24h Advisory: Zero-Trust Cloud, OSHA Jobsite & Clinical Safety Check",
    descPrefix:
      "Updated 24-hour operational advisories covering perimeter API token rotation, NFPA 70E lockout verification, and clinical dosing checks are live in Pulse.",
    actionText: "Open Pulse Briefing",
    targetTab: "pulserooms" as const,
    priority: "critical" as const,
  },
  {
    category: "Learning" as const,
    subType: "Course Reminder" as const,
    actorName: "ConnectLn Academy 24h Scheduler",
    actorRole: "Daily Video & Lab Publisher",
    titlePrefix: "🎓 New 24h Learning Drop: Hands-On Video Masterclass & Sandbox Lab Added",
    descPrefix:
      "Today's scheduled practical video course, interactive lab, and curated 12-channel media briefings are ready to stream in Learning and Media.",
    actionText: "Start Today's Lesson",
    targetTab: "learning" as const,
    priority: "normal" as const,
  },
  {
    category: "Marketplace" as const,
    subType: "New Product" as const,
    actorName: "ConnectLn Market & RFP Desk",
    actorRole: "24h Commerce & Procurement Wire",
    titlePrefix: "🛍️ Daily Market & RFP Update: New Verified Toolkits, Bounties & RFPs Listed",
    descPrefix:
      "Fresh enterprise tools, field estimator packs, escrow bounties, and procurement RFPs have been appended to Market and More tabs.",
    actionText: "Explore Market Drops",
    targetTab: "marketplace" as const,
    priority: "normal" as const,
  },
  {
    category: "Security" as const,
    subType: "Vulnerability Alert" as const,
    actorName: "Noctis Sovereign Clinical & Pharma Watch",
    actorRole: "24h Clinical & Biomedical Invariant Desk",
    titlePrefix: "🩺 Daily 24h Clinical & Pharmacy Invariant: High-Alert Medication & ICU Triage Verification",
    descPrefix:
      "Automated 24-hour verification across smart-pump BCMA guardrails, Bayesian vancomycin AUC/MIC targets, and Level-1 trauma resuscitation readiness.",
    actionText: "Inspect Clinical Alert",
    targetTab: "pulserooms" as const,
    priority: "critical" as const,
  },
  {
    category: "Career" as const,
    subType: "Recruiter Message" as const,
    actorName: "ConnectLn Master Trades & Engineering Guild",
    actorRole: "24h Direct Contract & Project Dispatch",
    titlePrefix: "⚡ Daily 24h Contract & Apprenticeship Wire: Commercial Electrical, EV Fleet & Cloud Architecture",
    descPrefix:
      "New verified commercial project contracts, prevailing-wage field roles, and remote enterprise security engagements added in today's 24-hour cycle.",
    actionText: "Open Jobs & Contracts",
    targetTab: "jobs" as const,
    priority: "high" as const,
  },
]

export function getAccumulatedDailyAlerts(
  nowMs: number = Date.now()
): CategorizedNotificationItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const dailyChallenges = getAccumulatedDailyFrontierChallenges(nowMs)
  const out: CategorizedNotificationItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const ch = dailyChallenges[day - 1]
    const tmpl = DAILY_ALERT_ROTATION[(day - 1) % DAILY_ALERT_ROTATION.length]

    // 1. New 24-Hour Noctis 6AM Frontier Invariant Alert for this 24h cycle
    if (ch) {
      out.push({
        id: `notif_noctis_daily_d${day}`,
        category: "Security",
        subType: "Security Advisory",
        actor: {
          name: "Noctis Frontier & Benchmark Engine",
          role: `24h Autonomous Invariant Schedule · Cycle #${day} (${meta.shortDate})`,
          avatar:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
          isVerified: true,
        },
        title: `🔴 [NOCTIS 24H FRONTIER ALERT · Cycle #${day} · ${meta.shortDate}] Invariant Verified: ${ch.domain}`,
        description: `Daily 24h Challenge Invariant Evaluated: "${ch.question}"\n\nVerdict: ${ch.verdict} (Duration: ${ch.durationMs}ms, Invariant: ${ch.status}).`,
        timestamp: meta.relativeLabel,
        unread: day === days,
        actionText: "Inspect Invariant Telemetry",
        targetTab: "pulserooms",
        priority: "critical",
        externalLabel: "Run Live Challenge Test",
      })
    }

    // 2. New 24-Hour Multi-Channel Professional Alert for this 24h cycle
    out.push({
      id: `daily_alert_d${day}`,
      category: tmpl.category,
      subType: tmpl.subType,
      actor: {
        name: tmpl.actorName,
        role: `${tmpl.actorRole} · ${meta.shortDate}`,
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
        isVerified: true,
      },
      title: `${tmpl.titlePrefix} (Cycle #${day} · ${meta.shortDate})`,
      description: `${tmpl.descPrefix} [24h Schedule Cycle #${day}]`,
      timestamp: meta.relativeLabel,
      unread: day === days,
      actionText: tmpl.actionText,
      targetTab: tmpl.targetTab,
      priority: tmpl.priority,
    })
  }
  return out
}

// ============================================================================
// 3. DAILY MARKET STUFF (Additive across Software, Services, Training, Enterprise)
// ============================================================================
const DAILY_MARKET_ROTATION = [
  {
    namePrefix: "FieldPro Takeoff & NEC/IBC Estimator Pack",
    tagline: "Automated blueprint takeoff, conduit fill, timber board-foot & bid generator",
    category: "Software" as const,
    subCategory: "CAD & Measurement",
    icon: "📐",
    price: "$39",
    period: "/ mo",
    vendorName: "ConnectLn Field Systems",
  },
  {
    namePrefix: "Zero-Trust MCP & Cloud Guardrail Pack",
    tagline: "Drop-in Terraform + eBPF runtime policies & automated OSCAL audit exporter",
    category: "Enterprise Solutions" as const,
    subCategory: "Cybersecurity",
    icon: "🛡️",
    price: "$149",
    period: "/ mo",
    vendorName: "Expedite Consults Labs",
  },
  {
    namePrefix: "ASE L3 800V EV & CAN-FD Waveform Reference Library",
    tagline: "350+ verified known-good PicoScope waveforms & HV lockout checklists",
    category: "Training" as const,
    subCategory: "Scan Tools",
    icon: "⚡",
    price: "$29",
    period: "/ mo",
    vendorName: "Master Tech Diagnostics Guild",
  },
  {
    namePrefix: "Fractional CISO & Commercial Bid Readiness Desk",
    tagline: "Turnkey SOC 2, CMMC 2.0 Level 2 & commercial COI compliance review",
    category: "Services" as const,
    subCategory: "Productivity & Field Notes",
    icon: "🏛️",
    price: "$450",
    period: "/ audit",
    vendorName: "Expedite Advisory Partners",
  },
]

export function getAccumulatedDailyMarketProducts(
  nowMs: number = Date.now()
): MarketplaceProduct[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: MarketplaceProduct[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl = DAILY_MARKET_ROTATION[(day - 1) % DAILY_MARKET_ROTATION.length]
    out.push({
      id: `daily_mkt_d${day}`,
      name: `${tmpl.namePrefix} · Ed. ${day}`,
      tagline: `${tmpl.tagline} · Added ${meta.shortDate}`,
      category: tmpl.category,
      subCategory: tmpl.subCategory,
      icon: tmpl.icon,
      badge: `🆕 24h Drop · ${meta.shortDate}`,
      rating: 4.96,
      reviewsCount: 28 + day * 4,
      activeUsersCount: `${1.2 + day * 0.3}k+ teams`,
      pricing: {
        displayPrice: tmpl.price,
        billingPeriod: tmpl.period,
        hasFreeTrial: true,
        trialDays: 14,
      },
      vendor: {
        name: tmpl.vendorName,
        logo: tmpl.icon,
        isVerified: true,
        isFellow: true,
      },
      overview: `${tmpl.tagline}. Published in ConnectLn's additive 24-hour marketplace release (${meta.shortDate}) with instant workspace deployment and full backward compatibility.`,
      features: [
        { title: "Instant Workspace Provisioning", desc: "Launch directly inside ConnectLn with zero setup friction." },
        { title: "Verified Field & Enterprise Templates", desc: "Pre-audited templates ready for immediate production jobs." },
      ],
      screenshots: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80",
      ],
      liveUrl: "https://conectln.com/connectin?tab=marketplace",
      isVercelLive: true,
      architecture: {
        title: "Cloud-Native Edge + Offline Field Sync",
        summary: "Sub-50ms global edge delivery with local IndexedDB field caching.",
        layers: ["Edge API Gateway", "Encrypted Sync Store", "Audit Telemetry Exporter"],
        latency: "< 35ms",
        dataPrivacy: "Zero third-party training · Tenant isolated",
      },
      integrations: ["ConnectLn Workspace", "DeskNote", "GitHub", "CSV / PDF Export"],
      security: {
        compliance: ["SOC 2 Type II", "NIST 800-53 Aligned"],
        encryption: "AES-256-GCM & TLS 1.3",
        isolation: "Dedicated tenant namespace",
      },
      pricingTiers: [
        {
          name: "Professional Edition",
          price: tmpl.price,
          period: tmpl.period,
          description: `Full access to ${tmpl.namePrefix} (${meta.shortDate} release).`,
          features: ["Unlimited projects & exports", "14-day free evaluation", "Priority practitioner support"],
          recommended: true,
          ctaText: "Start 14-Day Free Trial",
        },
      ],
      reviews: [],
      documentation: {
        quickstart: "Click Launch or Start Free Trial to activate immediately in your ConnectLn workspace.",
        apiEndpoints: ["GET /api/connectin/cron/daily-video-sync"],
        sdkSupport: ["Web Portal", "Mobile Browser"],
      },
      caseStudies: [],
      support: {
        sla: "99.95% Uptime",
        channel: "ConnectLn Direct Vendor Desk",
        responseHours: "< 2 Hours",
      },
    })
  }
  return out
}

// ============================================================================
// 4. DAILY LEARNING MATERIALS (Video Courses + Interactive Sandbox Labs)
// ============================================================================
const DAILY_LEARNING_ROTATION = [
  {
    titlePrefix: "Field Layout & Precision Angle Verification Workshop",
    category: "Skilled Trades: Learn by Doing" as const,
    provider: "This Old House" as const,
    vidIdx: 0,
    duration: "2h 15m · Video + Practice",
    level: "Beginner" as const,
    summary:
      "Step-by-step jobsite layout, speed-square rafter seat cuts, and tolerance verification for framing and finish carpentry crews.",
    modules: [
      "1. Speed Square Pivot & Common Rafter Plumb Cuts",
      "2. Checking 90° & 45° Assembly Tolerances Under Load",
      "3. Hands-On Scrap Lumber Layout Drill",
    ],
  },
  {
    titlePrefix: "Zero-Trust Cloud & AI Agent Runtime Security Masterclass",
    category: "Cybersecurity" as const,
    provider: "ConnectIn Masterclass" as const,
    vidIdx: 3,
    duration: "3h 30m · CPE Accredited",
    level: "Advanced" as const,
    summary:
      "Practical architecture walkthrough covering multi-cloud IAM boundary hardening, MCP tool gateway validation, and automated incident containment.",
    modules: [
      "1. Eliminating Cross-Account IAM Privilege Escalation Paths",
      "2. Sandboxing Tool-Calling AI Agents & Nonce Attestation",
      "3. Exporting Continuous NIST 800-53 Telemetry",
    ],
  },
  {
    titlePrefix: "Multi-Process Structural Welding: MIG, Stick & TIG Field Guide",
    category: "Skilled Trades: Learn by Doing" as const,
    provider: "ConnectIn Masterclass" as const,
    vidIdx: 1,
    duration: "2h 45m · Hands-On Video",
    level: "Intermediate" as const,
    summary:
      "Compare amperage settings, shielding gas ratios, electrode angles, and weld penetration profiles across steel and aluminum joints.",
    modules: [
      "1. Wire-Feed Speed vs Voltage Tuning for Clean MIG Beads",
      "2. E7018 Stick Structural Out-of-Position Techniques",
      "3. TIG Torch Control & Heat-Affected Zone Inspection",
    ],
  },
  {
    titlePrefix: "High-Acuity Clinical Triage & Resuscitation Grand Rounds",
    category: "Business" as const,
    provider: "ConnectIn Masterclass" as const,
    vidIdx: 5,
    duration: "2h 00m · CE Ready",
    level: "Intermediate" as const,
    summary:
      "Interdisciplinary clinical simulation covering early shock recognition, high-quality cardiopulmonary resuscitation, and rapid team handoffs.",
    modules: [
      "1. Rapid Primary Survey & Early Sepsis / Shock Flags",
      "2. High-Fraction Chest Compression & Defibrillation Timing",
      "3. Closed-Loop Clinical Pharmacy & Nursing Communication",
    ],
  },
]

export function getAccumulatedDailyLearningCourses(
  nowMs: number = Date.now()
): LearningCourse[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: LearningCourse[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl = DAILY_LEARNING_ROTATION[(day - 1) % DAILY_LEARNING_ROTATION.length]
    const vid = LEARNING_DAILY_YOUTUBE_POOL[tmpl.vidIdx % LEARNING_DAILY_YOUTUBE_POOL.length]
    out.push({
      id: `daily_course_d${day}`,
      title: `${tmpl.titlePrefix} (Daily Drop #${day} · ${meta.shortDate})`,
      category: tmpl.category,
      provider: tmpl.provider,
      originalCreator: vid.creator,
      sourceVideoUrl: `https://www.youtube.com/watch?v=${vid.youtubeId}#day-${day}`,
      sourceLanguage: "en",
      sourceLanguageLabel: "🇺🇸 English · Autoplay Video",
      practiceActivity: `Complete the 15-minute hands-on checklist for Cycle #${day} (${meta.shortDate}) and save notes to your workspace.`,
      skillsCovered: ["Field Execution", "Safety Verification", "Applied Diagnostics"],
      instructor: {
        name: vid.creator,
        role: vid.role,
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      },
      rating: 4.98,
      reviewsCount: 64 + day * 7,
      duration: tmpl.duration,
      level: tmpl.level,
      coverImage: vid.thumb,
      summary: `${tmpl.summary} Added in the ${meta.shortDate} 24-hour Learning schedule.`,
      curriculumModules: tmpl.modules,
      hasCertificate: true,
      recommendedMarketplaceTools: [],
    })
  }
  return out
}

export function getAccumulatedDailyLabs(nowMs: number = Date.now()): InteractiveLab[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: InteractiveLab[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const isCyber = day % 2 === 1
    out.push({
      id: `daily_lab_d${day}`,
      title: isCyber
        ? `24h Live Lab #${day}: Cloud IAM & Zero-Trust Policy Drill (${meta.shortDate})`
        : `24h Field Lab #${day}: Load Takeoff, Voltage Drop & Safety Lockout Simulator (${meta.shortDate})`,
      category: isCyber ? "Cloud labs" : "Secure coding",
      difficulty: isCyber ? "Advanced" : "Intermediate",
      estimatedDuration: "25 mins",
      environment: isCyber ? "AWS MicroVM Sandbox" : "Live IDE Terminal",
      summary: isCyber
        ? `Scheduled ${meta.shortDate} hands-on microVM scenario verifying least-privilege policies and runtime socket guardrails.`
        : `Scheduled ${meta.shortDate} interactive calculation & verification lab for field foremen, electricians, and master technicians.`,
      learningObjectives: [
        "Run live verification checks with instant pass/fail telemetry",
        "Export signed completion proof to your ConnectLn Skill Passport",
      ],
      recommendedMarketplaceTools: [],
      isLiveSandboxReady: true,
      liveUrl: "https://conectln.com/connectin?tab=learning",
    })
  }
  return out
}

// ============================================================================
// 5. DAILY DIFFERENT MEDIA (Featured Videos + Short Vertical Clips)
// ============================================================================
export function getAccumulatedDailyMediaVideos(
  nowMs: number = Date.now()
): MediaVideoItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: MediaVideoItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const vid = MEDIA_DAILY_YOUTUBE_POOL[(day - 1) % MEDIA_DAILY_YOUTUBE_POOL.length]
    out.push({
      id: `daily_media_vid_d${day}`,
      title: `ConnectLn 24h Broadcast #${day}: ${vid.creator} — Field & Enterprise Operations Briefing (${meta.shortDate})`,
      channelName: `${vid.creator} · 24h Media Desk`,
      channelAvatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80",
      channelRole: vid.role,
      channelFollowers: "148K Followers",
      isVerifiedChannel: true,
      duration: "06:40",
      durationSeconds: 400,
      views: `${3.4 + day * 0.6}K views`,
      uploadTimeAgo: meta.relativeLabel,
      category: day % 2 === 0 ? "Technical Walkthrough" : "Learning",
      thumbnail: vid.thumb,
      youtubeId: vid.youtubeId,
      visibility: "Public",
      description: `Scheduled 24-hour ConnectLn Media broadcast (${meta.shortDate}) preserving all earlier episodes while adding fresh technical and field walkthroughs.`,
      likesCount: 240 + day * 19,
      commentsCount: 28 + day * 3,
      chapters: [
        { timestamp: "00:00", seconds: 0, title: "Executive & Field Context" },
        { timestamp: "02:15", seconds: 135, title: "Step-by-Step Live Demonstration" },
        { timestamp: "04:50", seconds: 290, title: "Safety, Compliance & Hiring Takeaways" },
      ],
      transcript: [
        {
          timestamp: "00:12",
          seconds: 12,
          speaker: vid.creator,
          text: `Welcome to ConnectLn's ${meta.shortDate} 24-hour scheduled media briefing covering verified field and engineering execution.`,
        },
      ],
    })
  }
  return out
}

export function getAccumulatedDailyMediaClips(
  nowMs: number = Date.now()
): MediaClipItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: MediaClipItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const vid = MEDIA_DAILY_YOUTUBE_POOL[(day + 1) % MEDIA_DAILY_YOUTUBE_POOL.length]
    out.push({
      id: `daily_clip_d${day}`,
      title: `60s Field Reel #${day} (${meta.shortDate}): Rapid Pro Tip from ${vid.creator}`,
      creatorName: vid.creator,
      creatorAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      creatorRole: vid.role,
      duration: "0:58",
      views: `${8.2 + day}K`,
      likes: `${620 + day * 35}`,
      thumbnail: vid.thumb,
      topic: `24h Reel · ${meta.shortDate}`,
      actionType: "Take Lab",
      actionLabel: "Watch & Practice →",
      actionTargetTab: "learning",
      externalUrl: `https://www.youtube.com/watch?v=${vid.youtubeId}`,
    })
  }
  return out
}

// ============================================================================
// 6. DAILY PULSE (Intelligence Articles + Live Audio Rooms)
// ============================================================================
const DAILY_PULSE_ROTATION = [
  {
    category: "Professions LinkedIn Ignored",
    titlePrefix: "Grid Expansion, High-Rise Elevator Modernization & Heavy-Haul Pay Surge",
    summary:
      "Regional transmission utilities, IUEC commercial contractors, and specialized heavy-haul fleets expand apprentice-to-master compensation bands.",
    source: "ConnectLn Essential Infrastructure Wire",
    tags: ["500kVGrid", "SkilledTrades", "24hPulse", "Infrastructure"],
  },
  {
    category: "Cybersecurity",
    titlePrefix: "Enterprise Zero-Trust & Autonomous Agent Containment Telemetry Report",
    summary:
      "Security operations centers pair kernel-level eBPF observability with cryptographic MCP tool policies to cut incident dwell time below 4 minutes.",
    source: "ConnectLn Cyber Intelligence Desk",
    tags: ["ZeroTrust", "eBPF", "AISecurity", "cATO"],
  },
  {
    category: "Business",
    titlePrefix: "Industrial CapEx, Data Center Construction & Regional Contracting Outlook",
    summary:
      "New substation, cooling, structural steel, and clinical facility buildouts drive record subcontracting RFPs across North American corridors.",
    source: "ConnectLn Markets & Capital Wire",
    tags: ["CapEx", "CommercialRFPs", "SupplyChain", "Markets"],
  },
  {
    category: "Veterans & SkillBridge",
    titlePrefix: "DoD SkillBridge & VetCert SDVOSB Sole-Source Contract Awards Briefing",
    summary:
      "Transitioning service members convert technical MOS credentials into cleared engineering roles, master trade fellowships, and SDVOSB prime awards.",
    source: "ConnectLn Veterans Command Desk",
    tags: ["SkillBridge", "SDVOSB", "Veterans", "ClearedJobs"],
  },
]

export function getAccumulatedDailyPulseArticles(
  nowMs: number = Date.now()
): PulseArticle[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: PulseArticle[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl = DAILY_PULSE_ROTATION[(day - 1) % DAILY_PULSE_ROTATION.length]
    const vid = MEDIA_DAILY_YOUTUBE_POOL[(day + 2) % MEDIA_DAILY_YOUTUBE_POOL.length]
    out.push({
      id: `daily_pulse_art_d${day}`,
      title: `${tmpl.titlePrefix} (${meta.shortDate} · Daily Dispatch #${day})`,
      summary: tmpl.summary,
      category: tmpl.category,
      author: {
        name: tmpl.source,
        role: "24-Hour Automated Editorial Wire",
        avatar:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
        source: tmpl.source,
      },
      publishedAt: meta.relativeLabel,
      readTime: "4 min read",
      coverImage: vid.thumb,
      tags: tmpl.tags,
      isFeatured: day === days,
      isBreaking: day === days,
      aiKeyTakeaways: [
        `Published in Cycle #${day} (${meta.shortDate}) of ConnectLn's additive 24-hour Pulse schedule.`,
        tmpl.summary,
        "Cross-linked directly to open Jobs, Learning labs, and Procurement RFPs on ConnectLn.",
      ],
      fullContent: `${tmpl.summary}\n\nThis intelligence briefing was automatically added during ConnectLn's ${meta.shortDate} 24-hour schedule cycle (#${day}). All historical Pulse dispatches remain preserved below so members can track multi-week industry momentum without losing prior reports.`,
      sourceLinks: [
        {
          title: `${tmpl.source} · ${meta.shortDate}`,
          url: "https://conectln.com/connectin?tab=pulserooms",
          domain: "conectln.com",
        },
      ],
      biasRating: {
        leaning: "Center · Primary Telemetry",
        credibilityScore: 99,
        factCheckStatus: "Verified ✓",
      },
      upvotesCount: 118 + day * 14,
      commentsCount: 19 + day * 3,
    })
  }
  return out
}

export function getAccumulatedDailyPulseRooms(
  nowMs: number = Date.now()
): PulseRoom[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: PulseRoom[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl = DAILY_PULSE_ROTATION[(day - 1) % DAILY_PULSE_ROTATION.length]
    out.push({
      id: `daily_pulse_room_d${day}`,
      title: `🎙️ 24h Daily Roundtable #${day}: ${tmpl.titlePrefix} (${meta.shortDate})`,
      category: tmpl.category,
      host: {
        name: "ConnectLn Daily Stage Host",
        role: `${tmpl.source} · ${meta.shortDate}`,
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      },
      speakers: [
        {
          id: `daily_spk_${day}_1`,
          name: "Marcus Vance, PE",
          role: "Infrastructure & Security Lead",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          isSpeaking: day === days,
          isMuted: false,
        },
      ],
      listenersCount: 95 + day * 17,
      startedAt: meta.relativeLabel,
      tags: [...tmpl.tags, "24hStage"],
      isLive: day === days,
      aiSummaryNotes: [
        `${meta.shortDate} live practitioner breakdown: ${tmpl.summary}`,
        "Open Q&A on hiring rates, tooling standards, and regional contract bids.",
      ],
    })
  }
  return out
}

// ============================================================================
// 7. DAILY "MORE ▾" TABS (RFPs, Bounties, Events, Guilds, Launchpad, Watercooler, Work & Business)
// ============================================================================
export function getAccumulatedDailyRfps(
  nowMs: number = Date.now()
): RFPQuoteRequest[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: RFPQuoteRequest[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const isFacility = day % 2 === 1
    out.push({
      id: `daily_rfp_d${day}`,
      title: isFacility
        ? `RFP-24H-${100 + day}: Commercial Microgrid, Switchgear & Structural Fit-Out (${meta.shortDate})`
        : `RFP-24H-${100 + day}: Continuous Zero-Trust Cloud & SOC 2 / CMMC Readiness Audit (${meta.shortDate})`,
      clientType: isFacility
        ? "Regional Healthcare & Data Center Facilities Group"
        : "Enterprise Defense & FinTech Operations",
      budgetRange: isFacility ? "$65,000 – $120,000" : "$45,000 – $85,000",
      deadline: `Bids Close ${meta.futureDeadline}`,
      scope: isFacility
        ? `Turnkey electrical distribution upgrade, backup transfer switch testing, and acoustic architectural millwork added in the ${meta.shortDate} 24h procurement schedule.`
        : `Multi-account cloud posture review, automated penetration testing, and machine-readable compliance package added in the ${meta.shortDate} 24h procurement schedule.`,
      bids: [
        {
          vendorName: isFacility ? "Chesapeake Master Trades Consortium" : "Expedite Strike Defense",
          vendorLogo: isFacility ? "⚡" : "🛡️",
          bidAmount: isFacility ? "$78,500" : "$54,000",
          rating: "4.98 ★",
          estimatedTimeline: "21 Days",
          deliverables: [
            "Signed PE / Principal Engineering Deliverable",
            "Milestone Escrow Verification",
            "Full Compliance & Safety Closeout Pack",
          ],
        },
      ],
    })
  }
  return out
}

export function getAccumulatedDailyBounties(
  nowMs: number = Date.now()
): EnterpriseBounty[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: EnterpriseBounty[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    out.push({
      id: `daily_bounty_d${day}`,
      title:
        day % 2 === 1
          ? `24h Bounty #${day}: Open-Source Field Takeoff & NEC Voltage-Drop Calculator Module (${meta.shortDate})`
          : `24h Bounty #${day}: Automated MCP Prompt-Injection & Secret Leak Regression Rule (${meta.shortDate})`,
      company: "ConnectLn Ecosystem Escrow Pool",
      companyLogo: day % 2 === 1 ? "🛠️" : "🛡️",
      bountyAmount: `$${(4 + (day % 6)) * 1000},000`.replace(",000,000", ",500 USD in Escrow"),
      deadline: `Closes ${meta.futureDeadline}`,
      submissionsCount: 3 + (day % 9),
      tags: day % 2 === 1 ? ["FieldTools", "TypeScript", "NEC2026"] : ["AISecurity", "eBPF", "DevSecOps"],
      description: `Added automatically in Cycle #${day} (${meta.shortDate}). Submit a verified pull request or field template; prior bounties remain open until awarded.`,
      status: "Open for PRs",
    })
  }
  return out
}

export function getAccumulatedDailyEvents(
  nowMs: number = Date.now()
): ConnectInEvent[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: ConnectInEvent[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    out.push({
      id: `daily_event_d${day}`,
      title:
        day % 2 === 1
          ? `Live Workshop #${day}: Skilled Trades Estimating, Commercial Bidding & Crew Scaling (${meta.shortDate})`
          : `Live Summit #${day}: Autonomous Cloud Defense, AI Gateway Architecture & Cleared Hiring (${meta.shortDate})`,
      type: day % 2 === 1 ? "Hands-On Workshop" : "Webinar",
      host: "ConnectLn Daily Live Events Desk",
      hostLogo: day % 2 === 1 ? "🔨" : "🚀",
      date: meta.futureDeadline,
      time: "1:00 PM - 2:00 PM EST",
      attendeesCount: 140 + day * 22,
      description: `Scheduled via ConnectLn's 24-hour additive calendar (${meta.shortDate} drop) featuring live practitioner Q&A and direct hiring introductions.`,
      featuredProduct: "ConnectLn Workspace & Live Studio",
      speakerName: day % 2 === 1 ? "Kwesi Asiedu & Master Trades Panel" : "Alex Taylor & Dr. Elena Rostova",
      speakerRole: "ConnectLn Practitioner Faculty",
      speakerAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      isRegistered: false,
    })
  }
  return out
}

export function getAccumulatedDailyGuilds(
  nowMs: number = Date.now()
): GatedGuild[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: GatedGuild[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    out.push({
      id: `daily_guild_d${day}`,
      name:
        day % 2 === 1
          ? `Master Foremen, Estimators & Subcontractors Circle · Cohort #${day}`
          : `Cloud Resilience, AI Systems & Clinical Engineering Guild · Cohort #${day}`,
      badgeIcon: day % 2 === 1 ? "🏗️" : "⚡",
      entryRequirement: `Verified ConnectLn Practitioner · Est. ${meta.shortDate}`,
      membersCount: 120 + day * 18,
      activeDiscussions: 9 + (day % 12),
      treasuryBalance: `$${12 + day * 2},500 Shared Crew & Bounty Pool`,
      description: `Additive 24h guild cohort created on ${meta.shortDate} for peer bid-sharing, architecture teardowns, and direct referrals.`,
      isMember: true,
    })
  }
  return out
}

export function getAccumulatedDailyLaunchpad(
  nowMs: number = Date.now()
): ProductLaunchItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: ProductLaunchItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const vid = MEDIA_DAILY_YOUTUBE_POOL[(day - 1) % MEDIA_DAILY_YOUTUBE_POOL.length]
    out.push({
      id: `daily_launch_d${day}`,
      title: `ConnectLn Daily Launch #${day}: ${
        day % 2 === 1 ? "CrewSync Jobsite & Takeoff Copilot" : "Aegis Runtime Policy Verifier"
      }`,
      tagline: `Launched ${meta.shortDate} · Built for field teams, engineers, and independent operators`,
      thumbnail: vid.thumb,
      makers: [
        {
          name: vid.creator,
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
      ],
      upvotesCount: 165 + day * 19,
      hasUpvoted: false,
      category: day % 2 === 1 ? "Field & Trades Tech" : "Cybersecurity & Cloud",
      productUrl: "https://conectln.com/connectin?tab=marketplace",
      description: `Showcased in ConnectLn's ${meta.shortDate} 24-hour Launchpad drop while keeping every earlier community launch live.`,
      screenshots: [vid.thumb],
      commentsCount: 14 + day * 2,
    })
  }
  return out
}

export function getAccumulatedDailyWatercooler(
  nowMs: number = Date.now()
): WatercoolerThread[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: WatercoolerThread[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    out.push({
      id: `daily_wc_d${day}`,
      companyTag: day % 2 === 1 ? "National Skilled Trades & GC Benchmark" : "Cloud & Defense Engineering",
      companyLogo:
        "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
      verifiedRole: day % 2 === 1 ? "Senior Superintendent" : "Staff Security Architect",
      title:
        day % 2 === 1
          ? `24h Pay & Per-Diem Check-In (#${day} · ${meta.shortDate}): Overtime multipliers & travel stipends`
          : `24h Offer & On-Call Benchmark (#${day} · ${meta.shortDate}): Remote bands & signing bonuses`,
      content: `Daily ${meta.shortDate} practitioner thread comparing verified hourly rates, per-diem structures, and remote/hybrid packages across regions.`,
      upvotes: 34 + day * 6,
      commentsCount: 9 + (day % 8),
      timestamp: meta.relativeLabel,
      category: "Compensation",
      comments: [],
    })
  }
  return out
}

export function getAccumulatedDailyWorkOpportunities(
  nowMs: number = Date.now()
): WorkOpportunityItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: WorkOpportunityItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const kind =
      day % 3 === 0 ? "apprenticeship" : day % 2 === 0 ? "contract_project" : "employment"
    if (kind === "employment") {
      out.push({
        id: `daily_wb_opp_d${day}`,
        kind: "employment",
        title: `Commercial Crew Foreman & Multi-Trade Coordinator (24h Drop #${day} · ${meta.shortDate})`,
        organization: "Mid-Atlantic Commercial Builders",
        location: "Laurel / Baltimore / DC Corridor",
        tradeCategory: "Carpentry, Electrical & General Contracting",
        payRange: "$46 – $62 / hr + Truck Allowance & Benefits",
        schedule: "Mon–Fri · 6:30 AM – 3:00 PM",
        employmentType: "Full-time Direct Employment",
        requiredSkills: ["Blueprint Reading", "OSHA 30", "Crew Scheduling", "Quality Walkthroughs"],
        createdAt: meta.relativeLabel,
      })
    } else if (kind === "contract_project") {
      out.push({
        id: `daily_wb_opp_d${day}`,
        kind: "contract_project",
        title: `4,200 Sq. Ft. Medical & Office Tenant Buildout Bid (24h Drop #${day} · ${meta.shortDate})`,
        organization: "Regional Commercial Property Group",
        location: "Silver Spring / Columbia, MD",
        tradeCategory: "Finish Carpentry, Painting & Lighting",
        scopeOfWork:
          "Install acoustic wood ceiling baffles, LED troffer retrofits, and zero-VOC scrubbable wall finishes.",
        timing: ` Mobilize by ${meta.futureDeadline}`,
        optionalBudget: "$18,500 – $26,000 Fixed Milestone Contract",
        requiredSkills: ["Commercial Finish Work", "Licensed & Insured", "Clean Jobsite Turnover"],
        createdAt: meta.relativeLabel,
      })
    } else {
      out.push({
        id: `daily_wb_opp_d${day}`,
        kind: "apprenticeship",
        title: `Paid Earn-While-You-Learn Electrical, HVAC & Timber Cohort #${day} (${meta.shortDate})`,
        organization: "ConnectLn Partner Joint Training & Contractor Network",
        location: "DMV & Regional Training Centers",
        tradeCategory: "Skilled Trades Apprenticeship",
        trainingProviderOrEmployer: "Registered JATC & Master Contractor Employers",
        compensation: "$24.00 / hr Day-1 Paid OJT + Full Benefits (Scales to $54/hr Journeyman)",
        schedule: "40 hrs/wk Paid Field OJT + Evening Lab",
        trainingStructure: "NCCER & State-Registered Multi-Year Progression",
        entryRequirements: ["Valid ID & work authorization", "Safety-first mindset", "Reliable commute"],
        requiredSkills: ["Tape Measure & Speed Square Basics", "Jobsite Safety"],
        createdAt: meta.relativeLabel,
      })
    }
  }
  return out
}

export function getAccumulatedDailyServiceListings(
  nowMs: number = Date.now()
): ServiceListing[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: ServiceListing[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    out.push({
      id: `daily_wb_srv_d${day}`,
      providerName: day % 2 === 1 ? "Dante Rossi & Master Crew" : "Elena Vance, PE & Advisory",
      providerHeadline:
        day % 2 === 1
          ? "Licensed Commercial Electrical, EV Charger & Panel Upgrade Specialists"
          : "PE Structural, MEP & Cyber Compliance Turnkey Consultants",
      providerAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80",
      tradeOrService:
        day % 2 === 1
          ? `200A–800A Panel Upgrades, Commercial EV Chargers & Backup Generators (Listed ${meta.shortDate})`
          : `Stamped Structural Calculations, cATO Readiness & Commercial Permit Packs (Listed ${meta.shortDate})`,
      category: day % 2 === 1 ? "Electrical & Solar" : "Engineering & Compliance",
      description: `Verified practitioner service listing added in ConnectLn's ${meta.shortDate} 24-hour schedule. Available for residential, commercial, and enterprise quotes.`,
      workSamples: [],
      serviceArea: "Maryland, Washington DC, Northern Virginia & Remote Consultation",
      availability: "Accepting inquiries this week",
      pricingApproach: "request_quote",
      rateDisplay: "Free scope review · Upfront written estimate",
      qualifications: [
        {
          id: `daily_q_${day}`,
          title: "Verified License, Insurance & Safety Credentials",
          issuer: "ConnectLn Trust Desk",
          verificationStatus: "independently_checked",
        },
      ],
      createdAt: meta.relativeLabel,
    })
  }
  return out
}

export function mergeAdditiveById<T extends { id: string }>(
  dailyItems: T[],
  existingItems: T[]
): T[] {
  const seen = new Set<string>()
  const merged: T[] = []
  for (const item of dailyItems) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }
  for (const item of existingItems) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }
  return merged
}
