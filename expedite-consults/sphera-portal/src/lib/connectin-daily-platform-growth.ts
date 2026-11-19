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

// Verified playable YouTube IDs used across Learning & Media daily drops
const PLAYABLE_DAILY_YOUTUBE_POOL = [
  {
    youtubeId: "gNhWpuWvtEA",
    thumb: "https://i.ytimg.com/vi/gNhWpuWvtEA/hqdefault.jpg",
    creator: "This Old House",
    role: "Master Carpentry & Layout Lead",
  },
  {
    youtubeId: "OWThL97tq3k",
    thumb: "https://i.ytimg.com/vi/OWThL97tq3k/hqdefault.jpg",
    creator: "Miller Welders · Field Craft",
    role: "Certified Structural Welding Instructor",
  },
  {
    youtubeId: "GHiOk_8mlq0",
    thumb: "https://i.ytimg.com/vi/GHiOk_8mlq0/hqdefault.jpg",
    creator: "This Old House · Joinery",
    role: "Finish Carpentry & Clamping Specialist",
  },
  {
    youtubeId: "L_Guz73e6fw",
    thumb: "https://i.ytimg.com/vi/L_Guz73e6fw/hqdefault.jpg",
    creator: "IBM & Cloud Security Cadre",
    role: "Principal Zero-Trust & AI Security Architect",
  },
  {
    youtubeId: "zu6p3_df20A",
    thumb: "https://i.ytimg.com/vi/zu6p3_df20A/hqdefault.jpg",
    creator: "Essential Infrastructure Desk",
    role: "500kV Grid, Heavy-Haul & Civil Engineering",
  },
  {
    youtubeId: "86V_9l84GL0",
    thumb: "https://i.ytimg.com/vi/86V_9l84GL0/hqdefault.jpg",
    creator: "Clinical Emergency Grand Rounds",
    role: "Critical Care & Resuscitation Faculty",
  },
]

// ============================================================================
// 1. DAILY JOBS (Additive across Skilled Trades, Cyber, Healthcare, Auto, Energy)
// ============================================================================
const DAILY_JOB_ROTATION = [
  {
    titlePrefix: "Lead Commercial Electrical & Microgrid Foreman",
    company: "Quanta & Rosendin Grid Services",
    companyLogo: "⚡",
    hub: "Washington, DC Metro",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "trades_construction",
    domainCategory: "Skilled Trades & Power",
    salaryRange: "$128,000 - $168,000 / yr",
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
    companyLogo: "🛡️",
    hub: "US Remote",
    workplaceType: "Remote" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "tech_cybersecurity",
    domainCategory: "Cybersecurity & Cloud",
    salaryRange: "$195,000 - $245,000 / yr",
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
    companyLogo: "🩺",
    hub: "Baltimore / DC Corridor",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "healthcare_medicine",
    domainCategory: "Clinical Healthcare",
    salaryRange: "$138,000 - $172,000 / yr + Sign-On",
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
    companyLogo: "🔧",
    hub: "Austin / Dallas, TX",
    workplaceType: "On-site" as const,
    employmentType: "Full-time" as const,
    professionEnclave: "automotive_mechanics",
    domainCategory: "Automotive & Fleet",
    salaryRange: "$115,000 - $148,000 / yr",
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
        applyUrl: "https://conectln.com/connectin?tab=jobs",
        source: "ConnectLn 24h Scheduled Requisition Feed",
        tags: [...tmpl.tags, "24h New Drop"],
        isLiveFeed: true,
      })
    }
  }
  return out
}

// ============================================================================
// 2. DAILY ALERTS (Additive across Security, Career, Marketplace, Learning)
// ============================================================================
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
]

export function getAccumulatedDailyAlerts(
  nowMs: number = Date.now()
): CategorizedNotificationItem[] {
  const days = getElapsed24HourScheduleDays(nowMs)
  const out: CategorizedNotificationItem[] = []
  for (let day = days; day >= 1; day--) {
    const meta = getCycleDateMeta(day, nowMs)
    const tmpl = DAILY_ALERT_ROTATION[(day - 1) % DAILY_ALERT_ROTATION.length]
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
      title: `${tmpl.titlePrefix} (${meta.shortDate})`,
      description: `${tmpl.descPrefix} [Schedule Cycle #${day}]`,
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
    const vid = PLAYABLE_DAILY_YOUTUBE_POOL[tmpl.vidIdx % PLAYABLE_DAILY_YOUTUBE_POOL.length]
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
    const vid = PLAYABLE_DAILY_YOUTUBE_POOL[(day - 1) % PLAYABLE_DAILY_YOUTUBE_POOL.length]
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
    const vid = PLAYABLE_DAILY_YOUTUBE_POOL[(day + 1) % PLAYABLE_DAILY_YOUTUBE_POOL.length]
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
    const vid = PLAYABLE_DAILY_YOUTUBE_POOL[(day + 2) % PLAYABLE_DAILY_YOUTUBE_POOL.length]
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
    const vid = PLAYABLE_DAILY_YOUTUBE_POOL[(day - 1) % PLAYABLE_DAILY_YOUTUBE_POOL.length]
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
