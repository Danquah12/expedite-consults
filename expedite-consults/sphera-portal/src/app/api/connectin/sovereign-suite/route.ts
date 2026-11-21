import { NextRequest, NextResponse } from "next/server"
import { firebaseKvGetItem, firebaseKvSetItem } from "@/lib/connectin-firebase-kv"

export const dynamic = "force-dynamic"
export const revalidate = 0

const SOVEREIGN_MAP = "connectln_sovereign_suite_v1"
const STATE_KEY = "global_state_v1"

export type HaloStatusCode = "AFT" | "SCO" | "FAC" | "LOCK"

export interface PeerVouchSkill {
  id: string
  skill: string
  category: string
  vouchCount: number
  vouchers: string[]
}

export interface WorkCitationDossier {
  id: string
  ticketRef: string
  authorName: string
  authorHeadline: string
  authorTvRadius: "TVR-L1" | "TVR-L2"
  targetMember: string
  citationText: string
  verifiedDeliverable: string
  createdAtIso: string
}

export interface ProfileRadarEvent {
  id: string
  viewerName: string
  viewerHeadline: string
  viewerOrg: string
  entryVector: "TVR Graph Bridge" | "Enclave Search" | "Pulse Broadcast" | "Calling Directory"
  tvrLevel: "TVR-L1" | "TVR-L2" | "TVR-L3"
  sharedBridgeNodes: number
  timestampLabel: string
}

export interface FastTrackTicketCandidate {
  id: string
  ticketId: string
  ticketTitle: string
  enterpriseName: string
  candidateName: string
  candidateHeadline: string
  candidatePhone?: string
  pvrScore: number
  tvrLevel: "TVR-L1" | "TVR-L2" | "TVR-L3"
  sharedBridgeNodes: number
  stage: "Ticket Filed" | "Dossier Vetted" | "Technical Trial" | "Ticket Awarded"
  CompensationBand: string
  updatedAtIso: string
}

export interface EnterpriseSovereignHub {
  id: string
  code: string
  name: string
  sector: string
  headquarters: string
  verifiedOperatorsCount: number
  openFttTicketsCount: number
  trustIndexScore: number
  tagline: string
  subscribers: string[]
  featuredOperators: Array<{ name: string; role: string; tvr: string; halo: HaloStatusCode }>
}

export interface BlueprintDeckCarouselItem {
  id: string
  code: string
  title: string
  authorName: string
  authorHeadline: string
  enclaveLabel: string
  slides: Array<{
    slideNumber: number
    heading: string
    metricBadge: string
    body: string
    keySpec: string
  }>
  savesCount: number
  createdAtIso: string
}

export interface ExecutiveDispatchWireItem {
  id: string
  wireCode: string
  title: string
  authorName: string
  cadence: string
  subscribersCount: number
  subscribedBy: string[]
  summary: string
  latestIssueHeadline: string
  publishedAtLabel: string
}

export interface BountyExpertExchangeItem {
  id: string
  bexCode: string
  expertName: string
  expertHeadline: string
  halo: HaloStatusCode
  tvrLevel: "TVR-L1" | "TVR-L2"
  sharedBridgeNodes: number
  specialty: string
  rateBand: string
  completedTickets: number
  pvrVouches: number
  rfpInquiries: Array<{
    id: string
    clientName: string
    projectScope: string
    budgetBand: string
    createdAtIso: string
  }>
}

export interface WisdomNoteItem {
  id: string
  topic: string
  promptQuestion: string
  contributions: Array<{
    id: string
    authorName: string
    authorRole: string
    tipText: string
    helpfulCount: number
  }>
}

export interface CheersMilestoneItem {
  id: string
  memberName: string
  memberHeadline: string
  milestoneType: "Work Anniversary" | "New Certification" | "Project Launch" | "New Team Role"
  title: string
  cheersCount: number
  cheeredBy: string[]
}

export interface LaterPostItem {
  id: string
  authorName: string
  content: string
  scheduledForLabel: string
  status: "Scheduled" | "Published"
}

export interface CohortAlumniItem {
  id: string
  name: string
  program: string
  classYear: string
  city: string
  currentRole: string
  halo: HaloStatusCode
}

export interface SpotBoostCampaign {
  id: string
  ownerName: string
  title: string
  targetProfession: string
  targetCity: string
  dailyBudget: string
  estimatedReach: string
  status: "Active Boost"
}

export interface SovereignSuiteCloudState {
  haloByUser: Record<string, HaloStatusCode>
  stealthCloakByUser: Record<string, boolean>
  pvrSkills: PeerVouchSkill[]
  wcdCitations: WorkCitationDossier[]
  prtRadarEvents: ProfileRadarEvent[]
  torPipeline: FastTrackTicketCandidate[]
  eshEnterprises: EnterpriseSovereignHub[]
  bdpDecks: BlueprintDeckCarouselItem[]
  edwDispatches: ExecutiveDispatchWireItem[]
  bexExperts: BountyExpertExchangeItem[]
  wisdomNotes: WisdomNoteItem[]
  goldVoiceMembers: string[]
  cheersMilestones: CheersMilestoneItem[]
  laterPosts: LaterPostItem[]
  cohortAlumni: CohortAlumniItem[]
  dailyBrainStreaks: Record<string, number>
  spotBoosts: SpotBoostCampaign[]
  instantPingByUser: Record<string, { dms: boolean; kudos: boolean; matches: boolean }>
}

const DEFAULT_STATE: SovereignSuiteCloudState = {
  haloByUser: {
    "kwesi asiedu": "SCO",
    "esther boa asiedu": "AFT",
    "patience addo": "FAC",
    "isaac boye": "AFT",
    "adwoa larbi": "AFT",
  },
  stealthCloakByUser: {},
  pvrSkills: [
    {
      id: "pvr-1",
      skill: "Zero-Trust Architecture & Cloud Infrastructure",
      category: "Engineering & Security",
      vouchCount: 28,
      vouchers: ["Esther Boa Asiedu", "Patience Addo", "Isaac Boye", "Commander Robert Hayes"],
    },
    {
      id: "pvr-2",
      skill: "Master Blueprint Estimation & Field Execution",
      category: "Skilled Trades & Field Ops",
      vouchCount: 22,
      vouchers: ["Isaac Boye", "Marcus Vance", "Sarah Chen"],
    },
    {
      id: "pvr-3",
      skill: "Clinical Protocol Compliance & Diagnostic Triage",
      category: "Medical & Healthcare",
      vouchCount: 19,
      vouchers: ["Adwoa larbi", "Esther Boa Asiedu", "Elena Rostova"],
    },
    {
      id: "pvr-4",
      skill: "Enterprise RFP Procurement & Escrow Governance",
      category: "Executive & Operations",
      vouchCount: 24,
      vouchers: ["Patience Addo", "Alex Taylor", "David K."],
    },
  ],
  wcdCitations: [
    {
      id: "wcd-101",
      ticketRef: "TCK-8841-CLN",
      authorName: "Esther Boa Asiedu",
      authorHeadline: "Principal Operations & Healthcare Systems Lead",
      authorTvRadius: "TVR-L1",
      targetMember: "Kwesi Asiedu",
      verifiedDeliverable: "Zero-Cost Global WebRTC + Firebase FCM Calling Fabric",
      citationText:
        "Delivered the end-to-end ConnectLn Internet Calling & 2FA Verification architecture on schedule with zero carrier dependency and instant multi-device ringing.",
      createdAtIso: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    },
    {
      id: "wcd-102",
      ticketRef: "TCK-8790-CLN",
      authorName: "Isaac Boye",
      authorHeadline: "Senior Field Engineering & Infrastructure Lead",
      authorTvRadius: "TVR-L1",
      targetMember: "Kwesi Asiedu",
      verifiedDeliverable: "48-Program Career Mastery & Trade Blueprint Suite",
      citationText:
        "Architected a field-ready learning and execution pipeline with real-time Noctis voice interpretation across 8 global languages.",
      createdAtIso: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
    },
  ],
  prtRadarEvents: [
    {
      id: "prt-1",
      viewerName: "Esther Boa Asiedu",
      viewerHeadline: "Principal Healthcare & Clinical Operations Lead",
      viewerOrg: "Expedite Consults Medical Enclave",
      entryVector: "Calling Directory",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 14,
      timestampLabel: "12m ago",
    },
    {
      id: "prt-2",
      viewerName: "Isaac Boye",
      viewerHeadline: "Senior Infrastructure & Field Systems Specialist",
      viewerOrg: "Accra-Helsinki Engineering Guild",
      entryVector: "TVR Graph Bridge",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 11,
      timestampLabel: "41m ago",
    },
    {
      id: "prt-3",
      viewerName: "Patience Addo",
      viewerHeadline: "Director of Enterprise Procurement & Escrow",
      viewerOrg: "Sovereign Capital & Advisory",
      entryVector: "Enclave Search",
      tvrLevel: "TVR-L2",
      sharedBridgeNodes: 9,
      timestampLabel: "2h ago",
    },
    {
      id: "prt-4",
      viewerName: "Adwoa larbi",
      viewerHeadline: "Clinical Specialist · NHS Acute Care",
      viewerOrg: "UK NHS Clinical Network",
      entryVector: "Pulse Broadcast",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 8,
      timestampLabel: "4h ago",
    },
  ],
  torPipeline: [
    {
      id: "tor-1",
      ticketId: "FTT-901",
      ticketTitle: "Principal Cloud & Zero-Trust Systems Architect",
      enterpriseName: "Expedite Consults Sovereign Cloud",
      candidateName: "Kwesi Asiedu",
      candidateHeadline: "Founder & Chief Architect · ConnectLn",
      candidatePhone: "+1 (240) 260-7898",
      pvrScore: 98,
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 16,
      stage: "Ticket Awarded",
      CompensationBand: "$240K – $290K · Equity + Escrow",
      updatedAtIso: new Date().toISOString(),
    },
    {
      id: "tor-2",
      ticketId: "FTT-904",
      ticketTitle: "Lead Clinical Informatics & Triage Coordinator",
      enterpriseName: "Atlantic Medical & Surgical Enclave",
      candidateName: "Esther Boa Asiedu",
      candidateHeadline: "Principal Healthcare Operations Lead",
      candidatePhone: "+1 (410) 841-8358",
      pvrScore: 95,
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 14,
      stage: "Technical Trial",
      CompensationBand: "$175K – $210K · Direct Contract",
      updatedAtIso: new Date().toISOString(),
    },
    {
      id: "tor-3",
      ticketId: "FTT-908",
      ticketTitle: "Master Electrical & Smart-Grid Commissioning Lead",
      enterpriseName: "B1M Infrastructure & Trade Guild",
      candidateName: "Isaac Boye",
      candidateHeadline: "Senior Field Engineering Lead",
      candidatePhone: "+233 20 555 0412",
      pvrScore: 93,
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 11,
      stage: "Dossier Vetted",
      CompensationBand: "$145K – $180K · Milestone Escrow",
      updatedAtIso: new Date().toISOString(),
    },
    {
      id: "tor-4",
      ticketId: "FTT-912",
      ticketTitle: "Acute Care Clinical Protocol Advisor (UK / US)",
      enterpriseName: "Global Clinical Standards Hub",
      candidateName: "Adwoa larbi",
      candidateHeadline: "NHS Clinical Specialist",
      candidatePhone: "+44 7534 700899",
      pvrScore: 94,
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 8,
      stage: "Ticket Filed",
      CompensationBand: "$155K – $185K · Hybrid Advisory",
      updatedAtIso: new Date().toISOString(),
    },
  ],
  eshEnterprises: [
    {
      id: "esh-1",
      code: "ESH-EXPEDITE",
      name: "Expedite Consults Sovereign Group",
      sector: "Zero-Trust Cloud, AI & Skilled Trade Enclaves",
      headquarters: "Maryland, USA · Global Edge",
      verifiedOperatorsCount: 48,
      openFttTicketsCount: 7,
      trustIndexScore: 99.4,
      tagline: "Tickets, Vouches & Real Work — Zero-Trust Enterprise Execution.",
      subscribers: ["Kwesi Asiedu", "Esther Boa Asiedu", "Patience Addo", "Isaac Boye"],
      featuredOperators: [
        { name: "Kwesi Asiedu", role: "Chief Architect", tvr: "TVR-L1", halo: "SCO" },
        { name: "Esther Boa Asiedu", role: "Healthcare Lead", tvr: "TVR-L1", halo: "AFT" },
        { name: "Patience Addo", role: "Escrow Director", tvr: "TVR-L1", halo: "FAC" },
      ],
    },
    {
      id: "esh-2",
      code: "ESH-TRADES",
      name: "Master Craftsmen & Field Builders Guild",
      sector: "Commercial Carpentry, Electrical, HVAC & Heavy Civil",
      headquarters: "Baltimore / Washington Metro",
      verifiedOperatorsCount: 112,
      openFttTicketsCount: 14,
      trustIndexScore: 97.8,
      tagline: "Verified field blueprints, OSHA-30 operators, and milestone-backed draws.",
      subscribers: ["Kwesi Asiedu", "Isaac Boye"],
      featuredOperators: [
        { name: "Isaac Boye", role: "Lead Field Engineer", tvr: "TVR-L1", halo: "AFT" },
        { name: "Marcus Vance", role: "Master Electrician", tvr: "TVR-L2", halo: "AFT" },
      ],
    },
    {
      id: "esh-3",
      code: "ESH-CLINICAL",
      name: "Atlantic & NHS Clinical Triage Directorate",
      sector: "Hospital Operations, Nursing Leadership & Clinical AI",
      headquarters: "Maryland, USA · London, UK",
      verifiedOperatorsCount: 76,
      openFttTicketsCount: 9,
      trustIndexScore: 98.9,
      tagline: "Cross-border clinical protocols, rapid triage, and credentialed medical talent.",
      subscribers: ["Esther Boa Asiedu", "Adwoa larbi"],
      featuredOperators: [
        { name: "Esther Boa Asiedu", role: "Clinical Systems Lead", tvr: "TVR-L1", halo: "AFT" },
        { name: "Adwoa larbi", role: "NHS Specialist", tvr: "TVR-L1", halo: "AFT" },
      ],
    },
  ],
  bdpDecks: [
    {
      id: "bdp-1",
      code: "BDP-2026-01",
      title: "Zero-Carrier Internet Calling & Firebase FCM Ringing Blueprint",
      authorName: "Kwesi Asiedu",
      authorHeadline: "Chief Architect · ConnectLn Sovereign Platform",
      enclaveLabel: "Cloud & Telecom Architecture",
      savesCount: 64,
      createdAtIso: new Date().toISOString(),
      slides: [
        {
          slideNumber: 1,
          heading: "1. 2FA Identity Binding & Anti-Impersonation Gate",
          metricBadge: "100% 2FA Verified",
          body: "Every account—including Google & Microsoft Entra ID SSO—binds a cryptographically verified E.164 phone number stored in Firebase Cloud KV.",
          keySpec: "Zero SIM spoofing · Multi-device token fan-out · Wi-Fi No-SIM instant code fallback",
        },
        {
          slideNumber: 2,
          heading: "2. Dual-Engine Wakeup: Web Push (VAPID) + Native Android FCM",
          metricBadge: "< 400ms Wakeup",
          body: "Incoming calls dispatch high-priority FCM data payloads to native Android devices and VAPID Web Push + Pusher signals to desktop & mobile browsers.",
          keySpec: "Full-screen lock-screen notification · Automatic background media pause during call",
        },
        {
          slideNumber: 3,
          heading: "3. 30 FPS WebRTC Mesh + Cloudflare Global TURN Relay",
          metricBadge: "$0.00 Carrier Cost",
          body: "Audio and HD video flow over encrypted peer-to-peer WebRTC with Cloudflare TURN fallback and mid-call '+ Add Person' group grid expansion.",
          keySpec: "Dual caller/recipient hardware ringtones · Instant Admin phone reset for testing",
        },
      ],
    },
    {
      id: "bdp-2",
      code: "BDP-2026-02",
      title: "Commercial Framing, NEC 2026 Load Calc & Field Inspection Deck",
      authorName: "Isaac Boye",
      authorHeadline: "Senior Field Engineering Lead",
      enclaveLabel: "Skilled Trades & Construction",
      savesCount: 49,
      createdAtIso: new Date().toISOString(),
      slides: [
        {
          slideNumber: 1,
          heading: "1. Structural Layout & Laser Elevation Benchmarks",
          metricBadge: "±1.5mm Tolerance",
          body: "Establish primary control lines and moisture-tested sill plates before anchoring structural load walls.",
          keySpec: "OSHA-30 compliant · Verified in ConnectLn Trade Mastery Lesson #04",
        },
        {
          slideNumber: 2,
          heading: "2. Rough-In Mechanical, Electrical & Plumbing Clearances",
          metricBadge: "NEC / IPC Verified",
          body: "Keep stud boring within 40% depth limits on load-bearing members and install 16-gauge nail plates on all penetrations < 1.25 in.",
          keySpec: "Zero rework inspection checklist · Milestone escrow sign-off ready",
        },
      ],
    },
  ],
  edwDispatches: [
    {
      id: "edw-1",
      wireCode: "EDW-SOVEREIGN-01",
      title: "The Sovereign Operator Wire: Tickets Over Titles",
      authorName: "Kwesi Asiedu",
      cadence: "Twice-Weekly Executive Dispatch",
      subscribersCount: 1420,
      subscribedBy: ["Kwesi Asiedu", "Esther Boa Asiedu", "Patience Addo"],
      summary:
        "Why verifiable work tickets (WCD), peer skill vouches (PVR), and direct internet communication are replacing legacy resume keyword walls.",
      latestIssueHeadline: "Issue #18: Building a Zero-Cost Global Calling & Verification Network",
      publishedAtLabel: "Published Today",
    },
    {
      id: "edw-2",
      wireCode: "EDW-CLINICAL-02",
      title: "Cross-Atlantic Clinical & Healthcare Operations Brief",
      authorName: "Esther Boa Asiedu",
      cadence: "Weekly Clinical Briefing",
      subscribersCount: 890,
      subscribedBy: ["Esther Boa Asiedu", "Adwoa larbi"],
      summary:
        "Actionable acute-care triage protocols, staffing resiliency, and AI-assisted clinical documentation across US and UK hospital networks.",
      latestIssueHeadline: "Issue #11: Reducing Shift Handoff Latency with Verified Mobile Alerts",
      publishedAtLabel: "Published Yesterday",
    },
  ],
  bexExperts: [
    {
      id: "bex-1",
      bexCode: "BEX-ARCH-01",
      expertName: "Kwesi Asiedu",
      expertHeadline: "Principal Cloud, Zero-Trust & Real-Time Systems Architect",
      halo: "SCO",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 16,
      specialty: "Full-Stack Cloud Architecture, WebRTC/FCM Telecom, & AI Systems",
      rateBand: "$250/hr · Fixed-Milestone Escrow Available",
      completedTickets: 42,
      pvrVouches: 96,
      rfpInquiries: [],
    },
    {
      id: "bex-2",
      bexCode: "BEX-MED-02",
      expertName: "Esther Boa Asiedu",
      expertHeadline: "Principal Healthcare Operations & Clinical Workflow Consultant",
      halo: "AFT",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 14,
      specialty: "Clinical Triage Systems, Hospital Accreditation & Care Coordination",
      rateBand: "$195/hr · Retainer or Ticket Basis",
      completedTickets: 31,
      pvrVouches: 74,
      rfpInquiries: [],
    },
    {
      id: "bex-3",
      bexCode: "BEX-TRD-03",
      expertName: "Isaac Boye",
      expertHeadline: "Senior Field Engineering & Commercial Trade Estimator",
      halo: "AFT",
      tvrLevel: "TVR-L1",
      sharedBridgeNodes: 11,
      specialty: "Blueprint Takeoffs, Commercial MEP Coordination & Site Inspections",
      rateBand: "$155/hr · Per-Blueprint Package",
      completedTickets: 38,
      pvrVouches: 68,
      rfpInquiries: [],
    },
  ],
  wisdomNotes: [
    {
      id: "wn-1",
      topic: "Zero-Rework Field & Cloud Handoffs",
      promptQuestion: "What is your #1 rule for keeping multi-team projects on schedule without costly rework?",
      contributions: [
        {
          id: "wnc-1",
          authorName: "Kwesi Asiedu",
          authorRole: "Chief Architect",
          tipText: "Verify every dependency and mobile contact point upfront with a live 2-minute video check before work starts.",
          helpfulCount: 34,
        },
        {
          id: "wnc-2",
          authorName: "Isaac Boye",
          authorRole: "Senior Field Engineering Lead",
          tipText: "Always benchmark laser elevations and snap photos of rough-in clearances before closing any wall or trench.",
          helpfulCount: 27,
        },
      ],
    },
    {
      id: "wn-2",
      topic: "Rapid Clinical & Shift Handoff Excellence",
      promptQuestion: "How do you prevent critical details from being lost during busy shift transitions?",
      contributions: [
        {
          id: "wnc-3",
          authorName: "Esther Boa Asiedu",
          authorRole: "Principal Healthcare Operations Lead",
          tipText: "Use a structured 3-point SBAR voice summary paired with an instant read-receipt checklist.",
          helpfulCount: 29,
        },
      ],
    },
  ],
  goldVoiceMembers: ["Kwesi Asiedu", "Esther Boa Asiedu", "Isaac Boye"],
  cheersMilestones: [
    {
      id: "ch-1",
      memberName: "Esther Boa Asiedu",
      memberHeadline: "Principal Healthcare Operations Lead",
      milestoneType: "Project Launch",
      title: "Launched Cross-Atlantic Clinical Triage & Direct Calling Hub",
      cheersCount: 42,
      cheeredBy: ["Kwesi Asiedu", "Patience Addo", "Adwoa larbi"],
    },
    {
      id: "ch-2",
      memberName: "Isaac Boye",
      memberHeadline: "Senior Field Engineering Lead",
      milestoneType: "New Certification",
      title: "Completed Master NEC 2026 & Commercial Grid Commissioning Certification",
      cheersCount: 31,
      cheeredBy: ["Kwesi Asiedu", "Esther Boa Asiedu"],
    },
    {
      id: "ch-3",
      memberName: "Patience Addo",
      memberHeadline: "Director of Enterprise Procurement & Escrow",
      milestoneType: "Work Anniversary",
      title: "Celebrating 5 Years Leading High-Trust Enterprise Procurement",
      cheersCount: 38,
      cheeredBy: ["Kwesi Asiedu", "Isaac Boye"],
    },
  ],
  laterPosts: [
    {
      id: "lp-1",
      authorName: "Kwesi Asiedu",
      content: "Weekly Blueprint & Calling Network Digest: 100% Free Wi-Fi Calling is now live across all enclaves.",
      scheduledForLabel: "Tomorrow · 9:00 AM EST",
      status: "Scheduled",
    },
  ],
  cohortAlumni: [
    {
      id: "coh-1",
      name: "Kwesi Asiedu",
      program: "ConnectLn Cloud & Cybersecurity Mastery",
      classYear: "2026",
      city: "Maryland / DC Metro",
      currentRole: "Founder & Chief Architect",
      halo: "SCO",
    },
    {
      id: "coh-2",
      name: "Esther Boa Asiedu",
      program: "Johns Hopkins / Clinical Leadership Cohort",
      classYear: "2025",
      city: "Baltimore, MD",
      currentRole: "Principal Healthcare Operations Lead",
      halo: "AFT",
    },
    {
      id: "coh-3",
      name: "Isaac Boye",
      program: "Master Builders & Electrical Guild",
      classYear: "2025",
      city: "Accra / Helsinki",
      currentRole: "Senior Field Engineering Lead",
      halo: "AFT",
    },
    {
      id: "coh-4",
      name: "Adwoa larbi",
      program: "UK NHS Acute Care Fellowship",
      classYear: "2025",
      city: "London, UK",
      currentRole: "NHS Clinical Specialist",
      halo: "AFT",
    },
  ],
  dailyBrainStreaks: {
    "kwesi asiedu": 7,
    "esther boa asiedu": 5,
    "isaac boye": 6,
  },
  spotBoosts: [
    {
      id: "sb-1",
      ownerName: "Kwesi Asiedu",
      title: "Hiring Master Trades, Clinical Leads & Cloud Engineers",
      targetProfession: "All Skilled Trades, Healthcare & Cloud",
      targetCity: "Maryland, London & Accra",
      dailyBudget: "$25/day",
      estimatedReach: "4,800 – 9,200 Verified Pros/day",
      status: "Active Boost",
    },
  ],
  instantPingByUser: {
    "kwesi asiedu": { dms: true, kudos: true, matches: true },
  },
}

const globalForSovereign = globalThis as unknown as {
  __connectlnSovereignState?: SovereignSuiteCloudState
}

async function loadSovereignState(): Promise<SovereignSuiteCloudState> {
  const fromCloud = await firebaseKvGetItem<SovereignSuiteCloudState>(SOVEREIGN_MAP, STATE_KEY).catch(
    () => null
  )
  if (fromCloud && typeof fromCloud === "object" && Array.isArray(fromCloud.pvrSkills)) {
    const merged: SovereignSuiteCloudState = {
      ...DEFAULT_STATE,
      ...fromCloud,
      haloByUser: { ...DEFAULT_STATE.haloByUser, ...(fromCloud.haloByUser || {}) },
      stealthCloakByUser: {
        ...DEFAULT_STATE.stealthCloakByUser,
        ...(fromCloud.stealthCloakByUser || {}),
      },
    }
    globalForSovereign.__connectlnSovereignState = merged
    return merged
  }
  if (!globalForSovereign.__connectlnSovereignState) {
    globalForSovereign.__connectlnSovereignState = structuredClone(DEFAULT_STATE)
  }
  return globalForSovereign.__connectlnSovereignState
}

async function saveSovereignState(state: SovereignSuiteCloudState): Promise<void> {
  globalForSovereign.__connectlnSovereignState = state
  await firebaseKvSetItem(SOVEREIGN_MAP, STATE_KEY, state).catch(() => {})
}

export async function GET(req: NextRequest) {
  try {
    const state = await loadSovereignState()
    const viewerName = (req.nextUrl.searchParams.get("viewerName") || "Kwesi Asiedu")
      .trim()
      .toLowerCase()
    const myHalo: HaloStatusCode = state.haloByUser[viewerName] || "AFT"
    const myStealthCloak = Boolean(state.stealthCloakByUser[viewerName])

    return NextResponse.json({
      ok: true,
      myHalo,
      myStealthCloak,
      state,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load ConnectLn Sovereign Suite" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || "")
    const actorName = String(body?.actorName || "Kwesi Asiedu").trim()
    const actorKey = actorName.toLowerCase()
    const state = await loadSovereignState()

    // 1. Toggle AFT / SCO / FAC / LOCK Avatar Halo Ring
    if (action === "set_halo") {
      const halo = String(body?.halo || "AFT").toUpperCase() as HaloStatusCode
      if (["AFT", "SCO", "FAC", "LOCK"].includes(halo)) {
        state.haloByUser[actorKey] = halo
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, myHalo: state.haloByUser[actorKey], state })
    }

    // 2. Toggle SCM (Stealth Cloaking Mode) on PRT Profile Radar
    if (action === "toggle_stealth_cloak") {
      state.stealthCloakByUser[actorKey] = !state.stealthCloakByUser[actorKey]
      await saveSovereignState(state)
      return NextResponse.json({
        ok: true,
        myStealthCloak: Boolean(state.stealthCloakByUser[actorKey]),
        state,
      })
    }

    // 3. Issue a PVR (Peer Vouch Record) on a skill (or add a new skill to vouch)
    if (action === "vouch_pvr_skill") {
      const skillId = String(body?.skillId || "")
      const customSkill = String(body?.customSkill || "").trim()
      if (customSkill) {
        state.pvrSkills.unshift({
          id: `pvr-${Date.now()}`,
          skill: customSkill,
          category: String(body?.category || "Verified Field Capability"),
          vouchCount: 1,
          vouchers: [actorName],
        })
      } else {
        const target = state.pvrSkills.find((s) => s.id === skillId)
        if (target) {
          if (!target.vouchers.includes(actorName)) {
            target.vouchers.unshift(actorName)
          }
          target.vouchCount += 1
        }
      }
      await saveSovereignState(state)
      return NextResponse.json({ ok: true, state })
    }

    // 4. File a WCD (Work Citation Dossier)
    if (action === "file_wcd_citation") {
      const targetMember = String(body?.targetMember || "Esther Boa Asiedu").trim()
      const verifiedDeliverable = String(body?.verifiedDeliverable || "").trim()
      const citationText = String(body?.citationText || "").trim()
      if (verifiedDeliverable && citationText) {
        state.wcdCitations.unshift({
          id: `wcd-${Date.now()}`,
          ticketRef: `TCK-${Math.floor(1000 + Math.random() * 9000)}-CLN`,
          authorName: actorName,
          authorHeadline: String(body?.authorHeadline || "Verified ConnectLn Operator"),
          authorTvRadius: "TVR-L1",
          targetMember,
          verifiedDeliverable,
          citationText,
          createdAtIso: new Date().toISOString(),
        })
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 5. Submit 1-Tap FTT (Fast-Track Ticket) or advance stage in TOR (Talent Operations Radar)
    if (action === "file_ftt_ticket") {
      const ticketTitle = String(body?.ticketTitle || "Sovereign Systems Operator").trim()
      const enterpriseName = String(body?.enterpriseName || "Expedite Consults Sovereign Group").trim()
      state.torPipeline.unshift({
        id: `tor-${Date.now()}`,
        ticketId: `FTT-${Math.floor(915 + Math.random() * 80)}`,
        ticketTitle,
        enterpriseName,
        candidateName: actorName,
        candidateHeadline: String(body?.actorHeadline || "2FA-Verified ConnectLn Operator"),
        candidatePhone: String(body?.actorPhone || "+1 (240) 260-7898"),
        pvrScore: 97,
        tvrLevel: "TVR-L1",
        sharedBridgeNodes: 14,
        stage: "Ticket Filed",
        CompensationBand: String(body?.compensationBand || "$185K – $225K · Direct Escrow"),
        updatedAtIso: new Date().toISOString(),
      })
      await saveSovereignState(state)
      return NextResponse.json({ ok: true, state })
    }

    if (action === "advance_tor_stage") {
      const candidateId = String(body?.candidateId || "")
      const stages: FastTrackTicketCandidate["stage"][] = [
        "Ticket Filed",
        "Dossier Vetted",
        "Technical Trial",
        "Ticket Awarded",
      ]
      const item = state.torPipeline.find((c) => c.id === candidateId)
      if (item) {
        const nextIdx = (stages.indexOf(item.stage) + 1) % stages.length
        item.stage = stages[nextIdx]
        item.updatedAtIso = new Date().toISOString()
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 6. Subscribe to an ESH (Enterprise Sovereign Hub)
    if (action === "toggle_esh_subscribe") {
      const eshId = String(body?.eshId || "")
      const hub = state.eshEnterprises.find((e) => e.id === eshId)
      if (hub) {
        if (hub.subscribers.includes(actorName)) {
          hub.subscribers = hub.subscribers.filter((n) => n !== actorName)
        } else {
          hub.subscribers.push(actorName)
        }
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 7. Publish a new BDP (Blueprint Deck Carousel)
    if (action === "publish_bdp_deck") {
      const title = String(body?.title || "").trim()
      const slide1 = String(body?.slide1 || "").trim()
      const slide2 = String(body?.slide2 || "").trim()
      if (title && slide1) {
        state.bdpDecks.unshift({
          id: `bdp-${Date.now()}`,
          code: `BDP-2026-0${state.bdpDecks.length + 1}`,
          title,
          authorName: actorName,
          authorHeadline: String(body?.authorHeadline || "Verified ConnectLn Operator"),
          enclaveLabel: String(body?.enclaveLabel || "Sovereign Engineering Brief"),
          savesCount: 1,
          createdAtIso: new Date().toISOString(),
          slides: [
            {
              slideNumber: 1,
              heading: "1. Core Execution Specification",
              metricBadge: "Verified Spec",
              body: slide1,
              keySpec: `Filed by ${actorName} · ConnectLn BDP Deck`,
            },
            ...(slide2
              ? [
                  {
                    slideNumber: 2,
                    heading: "2. Field Verification & Delivery Milestone",
                    metricBadge: "Production Ready",
                    body: slide2,
                    keySpec: "Backed by PVR & WCD Attestation",
                  },
                ]
              : []),
          ],
        })
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 8. Subscribe / Publish on EDW (Executive Dispatch Wire)
    if (action === "toggle_edw_subscribe") {
      const edwId = String(body?.edwId || "")
      const wire = state.edwDispatches.find((w) => w.id === edwId)
      if (wire) {
        if (wire.subscribedBy.includes(actorName)) {
          wire.subscribedBy = wire.subscribedBy.filter((n) => n !== actorName)
          wire.subscribersCount = Math.max(1, wire.subscribersCount - 1)
        } else {
          wire.subscribedBy.push(actorName)
          wire.subscribersCount += 1
        }
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 9. File an RFP Commission Ticket in BEX (Bounty & Expert Exchange)
    if (action === "commission_bex_expert") {
      const bexId = String(body?.bexId || "")
      const projectScope = String(body?.projectScope || "").trim()
      const budgetBand = String(body?.budgetBand || "$5,000 – $15,000 Escrow").trim()
      const expert = state.bexExperts.find((x) => x.id === bexId)
      if (expert && projectScope) {
        expert.rfpInquiries.unshift({
          id: `rfp-${Date.now()}`,
          clientName: actorName,
          projectScope,
          budgetBand,
          createdAtIso: new Date().toISOString(),
        })
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 10. WISDOM-NOTES & GOLD-VOICE Badge: Contribute a tip
    if (action === "add_wisdom_note") {
      const noteId = String(body?.noteId || "wn-1")
      const tipText = String(body?.tipText || "").trim()
      const target = (state.wisdomNotes || []).find((n) => n.id === noteId)
      if (target && tipText) {
        target.contributions.unshift({
          id: `wnc-${Date.now()}`,
          authorName: actorName,
          authorRole: String(body?.actorHeadline || "Verified ConnectLn Pro"),
          tipText,
          helpfulCount: 1,
        })
        if (!state.goldVoiceMembers) state.goldVoiceMembers = []
        if (!state.goldVoiceMembers.includes(actorName)) {
          state.goldVoiceMembers.push(actorName)
        }
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 11. CHEERS Milestone Celebration: Send 1-Tap Cheers
    if (action === "send_cheers") {
      const cheersId = String(body?.cheersId || "")
      const item = (state.cheersMilestones || []).find((c) => c.id === cheersId)
      if (item) {
        if (!item.cheeredBy.includes(actorName)) {
          item.cheeredBy.push(actorName)
        }
        item.cheersCount += 1
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 12. LATER-POST: Schedule a post
    if (action === "schedule_later_post") {
      const content = String(body?.content || "").trim()
      const scheduledForLabel = String(body?.scheduledForLabel || "Tomorrow · 9:00 AM").trim()
      if (content) {
        if (!state.laterPosts) state.laterPosts = []
        state.laterPosts.unshift({
          id: `lp-${Date.now()}`,
          authorName: actorName,
          content,
          scheduledForLabel,
          status: "Scheduled",
        })
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 13. DAILY-BRAIN: Record a solved daily challenge & increment streak
    if (action === "solve_daily_brain") {
      if (!state.dailyBrainStreaks) state.dailyBrainStreaks = {}
      state.dailyBrainStreaks[actorKey] = (state.dailyBrainStreaks[actorKey] || 1) + 1
      await saveSovereignState(state)
      return NextResponse.json({
        ok: true,
        myStreak: state.dailyBrainStreaks[actorKey],
        state,
      })
    }

    // 14. SPOT-BOOST: Launch a promoted post or job boost
    if (action === "create_spot_boost") {
      const title = String(body?.title || "").trim()
      const targetProfession = String(body?.targetProfession || "Skilled Trades & Engineering").trim()
      const targetCity = String(body?.targetCity || "Global / Metro").trim()
      const dailyBudget = String(body?.dailyBudget || "$20/day").trim()
      if (title) {
        if (!state.spotBoosts) state.spotBoosts = []
        state.spotBoosts.unshift({
          id: `sb-${Date.now()}`,
          ownerName: actorName,
          title,
          targetProfession,
          targetCity,
          dailyBudget,
          estimatedReach: "3,500 – 7,800 Verified Pros/day",
          status: "Active Boost",
        })
        await saveSovereignState(state)
      }
      return NextResponse.json({ ok: true, state })
    }

    // 15. INSTANT-PING: Toggle push preferences for DMs, Kudos & Matches
    if (action === "update_instant_ping") {
      if (!state.instantPingByUser) state.instantPingByUser = {}
      const cur = state.instantPingByUser[actorKey] || { dms: true, kudos: true, matches: true }
      const field = String(body?.field || "dms") as "dms" | "kudos" | "matches"
      cur[field] = !cur[field]
      state.instantPingByUser[actorKey] = cur
      await saveSovereignState(state)
      return NextResponse.json({ ok: true, state })
    }

    return NextResponse.json({ ok: true, state })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update Sovereign Suite" },
      { status: 500 }
    )
  }
}
