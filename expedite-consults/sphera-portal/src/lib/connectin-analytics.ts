/**
 * ConnectIn Analytics Engine
 * Dynamically tailors Profile Viewers (Identity Tracking), Content Reach (Post Impressions),
 * and Directory Discoveries (Search Appearances) to any UserProfile, Profession, Skills & Enclave.
 */

import { UserProfile } from "./connectln-data"
import { findEnclaveById } from "./connectin-professions"

export interface ProfileViewerItem {
  id: string
  name: string
  headline: string
  avatar: string
  company: string
  companyLogo?: string
  location: string
  viewedAt: string
  viewVector: string // Inbound channel: e.g. "Enterprise Talent Search", "Post: AI Defense", "RFP Procurement"
  clearanceLevel: string
  mutualConnectionsCount: number
  mutualConnectionName?: string
  isConnected: boolean
  isPending: boolean
  category: 'recruiter' | 'buyer' | 'peer' | 'executive'
}

export interface ContentReachData {
  totalReach: number
  weeklyChangePercent: number
  uniqueViewers: number
  engagementRate: number
  dailyTrends: {
    day: string
    reach: number
    uniqueViewers: number
  }[]
  topPosts: {
    id: string
    title: string
    date: string
    reach: number
    engagements: number
    reposts: number
    category: string
  }[]
  topCompanies: {
    name: string
    percentage: number
    count: number
    logo: string
  }[]
  topJobRoles: {
    role: string
    percentage: number
  }[]
}

export interface DirectoryDiscoveryData {
  totalDiscoveries: number
  weeklyChangePercent: number
  searcherCount: number
  topSearchKeywords: {
    keyword: string
    occurrences: number
    growth: string
  }[]
  searchingCompanies: {
    name: string
    percentage: number
    searchesCount: number
    logo: string
  }[]
  searcherSeniority: {
    level: string
    percentage: number
  }[]
}

export interface ProfileTailoredAnalytics {
  effectiveProfileViews: number
  effectiveTotalReach: number
  effectiveUniqueViewers: number
  effectiveDiscoveries: number
  decisionMakerRatio: string
  standingBadge: string
  peakTrafficNote: string
  credentialTiers: {
    label: string
    percent: number
  }[]
  viewers: ProfileViewerItem[]
  reachData: ContentReachData
  discoveryData: DirectoryDiscoveryData
}

export const INITIAL_PROFILE_VIEWERS: ProfileViewerItem[] = [
  {
    id: 'viewer_1',
    name: 'Sarah Jenkins',
    headline: 'Chief Technology Officer @ Defense Systems Global',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    company: 'Defense Systems Global',
    location: 'Washington, DC Metro',
    viewedAt: '15 minutes ago',
    viewVector: 'Enterprise Talent Directory Search',
    clearanceLevel: 'TS/SCI Polygraph Verified',
    mutualConnectionsCount: 18,
    mutualConnectionName: 'Dr. Elena Rostova',
    isConnected: false,
    isPending: false,
    category: 'executive'
  },
  {
    id: 'viewer_2',
    name: 'Marcus Vance',
    headline: 'VP Enterprise Procurement & Global Spend @ Lockheed Cloud Systems',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    company: 'Lockheed Cloud Systems',
    location: 'Boston, MA',
    viewedAt: '1 hour ago',
    viewVector: 'RFP Proposal & Vendor Roster Desk',
    clearanceLevel: 'Secret Clearance · Enterprise Buyer',
    mutualConnectionsCount: 34,
    mutualConnectionName: 'Alex Taylor',
    isConnected: true,
    isPending: false,
    category: 'buyer'
  },
  {
    id: 'viewer_3',
    name: 'David Kim',
    headline: 'Director of Operations & Technical Strategy @ Apex Systems',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    company: 'Apex Systems',
    location: 'Arlington, VA',
    viewedAt: '3 hours ago',
    viewVector: 'Feed Broadcast & Technical Portfolio',
    clearanceLevel: 'Verified Fellow',
    mutualConnectionsCount: 12,
    isConnected: false,
    isPending: true,
    category: 'peer'
  },
  {
    id: 'viewer_4',
    name: 'Elena Rostova',
    headline: 'Lead Clinical & Research Specialist @ Johns Hopkins',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    company: 'Johns Hopkins Medicine',
    location: 'Baltimore, MD',
    viewedAt: 'Yesterday at 4:20 PM',
    viewVector: 'Verified Skill & Credential Endorsement Link',
    clearanceLevel: 'Fellow Grade Level 5',
    mutualConnectionsCount: 45,
    isConnected: true,
    isPending: false,
    category: 'peer'
  },
  {
    id: 'viewer_5',
    name: 'Jonathan Reynolds',
    headline: 'Principal Technical Talent Partner @ Global Enterprise Recruiting',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    company: 'Global Enterprise Recruiting',
    location: 'Herndon, VA',
    viewedAt: 'Yesterday at 11:05 AM',
    viewVector: 'Recruiter Search: Verified Domain Specialist',
    clearanceLevel: 'Level 3 Identity Verified',
    mutualConnectionsCount: 22,
    isConnected: false,
    isPending: false,
    category: 'recruiter'
  },
  {
    id: 'viewer_6',
    name: 'Dr. Arthur Vance',
    headline: 'VP of Engineering & Field Infrastructure @ Applied Physics Lab',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    company: 'Johns Hopkins Applied Physics Lab',
    location: 'Laurel, MD',
    viewedAt: '2 days ago',
    viewVector: 'Gated Professional Enclave Directory',
    clearanceLevel: 'Executive Verified',
    mutualConnectionsCount: 19,
    isConnected: false,
    isPending: false,
    category: 'executive'
  },
  {
    id: 'viewer_7',
    name: 'Claire Beauchamp',
    headline: 'Head of Solutions & Partner Architecture @ Microsoft Enterprise',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    company: 'Microsoft Enterprise',
    location: 'Reston, VA',
    viewedAt: '3 days ago',
    viewVector: 'Direct Profile Verification Link',
    clearanceLevel: 'Verified Enterprise Lead',
    mutualConnectionsCount: 29,
    isConnected: false,
    isPending: false,
    category: 'peer'
  }
]

export const INITIAL_CONTENT_REACH_DATA: ContentReachData = {
  totalReach: 9840,
  weeklyChangePercent: 24.6,
  uniqueViewers: 6420,
  engagementRate: 8.4,
  dailyTrends: [
    { day: 'Mon', reach: 1120, uniqueViewers: 890 },
    { day: 'Tue', reach: 1480, uniqueViewers: 1140 },
    { day: 'Wed', reach: 2190, uniqueViewers: 1620 },
    { day: 'Thu', reach: 1840, uniqueViewers: 1390 },
    { day: 'Fri', reach: 1610, uniqueViewers: 1200 },
    { day: 'Sat', reach: 890, uniqueViewers: 650 },
    { day: 'Sun', reach: 710, uniqueViewers: 530 }
  ],
  topPosts: [
    {
      id: 'post_product_strike',
      title: '🚀 Expedite Strike & Fusion 2026 Release Announcement',
      date: 'Recent Broadcast',
      reach: 4820,
      engagements: 412,
      reposts: 88,
      category: 'Product Launch'
    },
    {
      id: 'post_research_1',
      title: '📑 Field Standards & Verified Execution Playbook',
      date: 'Recent Publication',
      reach: 3120,
      engagements: 328,
      reposts: 65,
      category: 'Technical Playbook'
    },
    {
      id: 'post_doc_1',
      title: '📑 2026 Architecture & Operational Compliance Guide',
      date: 'Featured Deck',
      reach: 1900,
      engagements: 520,
      reposts: 92,
      category: 'Slide Deck'
    }
  ],
  topCompanies: [
    { name: 'Lockheed Martin & Defense Labs', percentage: 26, count: 2558, logo: '🏢' },
    { name: 'Amazon Web Services (AWS)', percentage: 22, count: 2164, logo: '☁️' },
    { name: 'Northrop Grumman', percentage: 18, count: 1771, logo: '🛡️' },
    { name: 'Microsoft Federal & Azure', percentage: 16, count: 1574, logo: '💻' },
    { name: 'Raytheon Technologies', percentage: 12, count: 1180, logo: '🛰️' },
    { name: 'Other Federal & Fortune 500', percentage: 6, count: 593, logo: '🌐' }
  ],
  topJobRoles: [
    { role: 'Chief Information Security Officers (CISOs)', percentage: 32 },
    { role: 'Cloud & Infrastructure Architects', percentage: 28 },
    { role: 'Enterprise Procurement & VP Buyers', percentage: 22 },
    { role: 'Senior AppSec & DevSecOps Engineers', percentage: 18 }
  ]
}

export const INITIAL_DIRECTORY_DISCOVERIES_DATA: DirectoryDiscoveryData = {
  totalDiscoveries: 342,
  weeklyChangePercent: 18.2,
  searcherCount: 280,
  topSearchKeywords: [
    { keyword: 'Zero Trust Architect', occurrences: 114, growth: '+38%' },
    { keyword: 'AI Multi-Agent Containment', occurrences: 86, growth: '+52%' },
    { keyword: 'TS/SCI Cloud Security', occurrences: 68, growth: '+14%' },
    { keyword: 'Next.js AppSec Engineering', occurrences: 42, growth: '+20%' },
    { keyword: 'Kubernetes eBPF Defense', occurrences: 32, growth: '+9%' }
  ],
  searchingCompanies: [
    { name: 'DARPA & Strategic Defense Enclaves', percentage: 30, searchesCount: 102, logo: '🏛️' },
    { name: 'Lockheed Martin Space & Cyber', percentage: 24, searchesCount: 82, logo: '🛡️' },
    { name: 'AWS National Security Systems', percentage: 20, searchesCount: 68, logo: '☁️' },
    { name: 'Johns Hopkins Applied Physics Lab', percentage: 15, searchesCount: 51, logo: '🔬' },
    { name: 'Booz Allen Hamilton & GDIT', percentage: 11, searchesCount: 39, logo: '💼' }
  ],
  searcherSeniority: [
    { level: 'Executive Leadership (CTO / CISO / VP)', percentage: 42 },
    { level: 'Technical Recruiting & Talent Search', percentage: 34 },
    { level: 'Enterprise RFP & Procurement Leads', percentage: 24 }
  ]
}

/**
 * Generates dynamic, accurate Analytics tailored to the specific UserProfile (`user`),
 * their enclave, headline, profession, skills, experience, location, and connections.
 */
export function getProfileTailoredAnalytics(
  user?: UserProfile | null,
  customViewers?: ProfileViewerItem[]
): ProfileTailoredAnalytics {
  const safeName = user?.name?.trim() || "Verified ConnectIn Member"
  const enclaveId = user?.professionEnclave || "trades_construction"
  const enclaveInfo = findEnclaveById(enclaveId)

  // Extract clean skills array from user.skills
  const rawSkills: string[] = Array.isArray(user?.skills)
    ? user!.skills
        .map((s: any) => (typeof s === "string" ? s.trim() : String(s?.name || "").trim()))
        .filter(Boolean)
    : []

  const defaultEnclaveSkills = enclaveInfo?.defaultSkills || [
    "Domain Architecture",
    "Operational Excellence",
    "Safety & Compliance",
    "Project Leadership"
  ]

  const skill1 = rawSkills[0] || defaultEnclaveSkills[0] || "Domain Operations"
  const skill2 = rawSkills[1] || defaultEnclaveSkills[1] || "Field Verification"
  const skill3 = rawSkills[2] || defaultEnclaveSkills[2] || "Quality Assurance"
  const skill4 = rawSkills[3] || defaultEnclaveSkills[3] || "Technical Leadership"

  // Extract clean profession / primary role from user.profession or user.headline
  const rawHeadlineRole = user?.headline
    ? user.headline.split("·")[0]?.split("|")[0]?.split("@")[0]?.trim()
    : ""
  const primaryRole =
    user?.profession?.trim() ||
    rawHeadlineRole ||
    enclaveInfo?.shortName ||
    "Verified Specialist"

  const primaryCompany =
    user?.experience?.[0]?.company ||
    (user?.headline?.includes("@") ? user.headline.split("@")[1]?.split("·")[0]?.trim() : "") ||
    `${enclaveInfo?.shortName || "ConnectIn"} Enterprise Partner`

  const cleanLocation =
    user?.location?.split("·")[0]?.trim() || "United States"

  // Deterministic seed from user name + enclave so metrics feel organic and personalized
  const seedText = `${safeName.toLowerCase()}::${enclaveId}::${primaryRole.toLowerCase()}`
  let hash = 0
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 31 + seedText.charCodeAt(i)) >>> 0
  }

  const viewerCount = (customViewers && customViewers.length > 0) ? customViewers.length : INITIAL_PROFILE_VIEWERS.length
  const connectionsCount = user?.connectionsCount && user.connectionsCount > 0 ? user.connectionsCount : 14
  const expCount = Array.isArray(user?.experience) ? user!.experience.length : 2
  const certCount = Array.isArray(user?.certifications) ? user!.certifications.length : 2

  // Ensure Profile Views NEVER shows 0!
  const computedBaseViews =
    180 +
    (hash % 240) +
    Math.min(connectionsCount * 4, 1200) +
    rawSkills.length * 24 +
    expCount * 38 +
    certCount * 25 +
    viewerCount * 18

  const effectiveProfileViews =
    user?.profileViews && user.profileViews > 0
      ? Math.max(user.profileViews, viewerCount * 16)
      : computedBaseViews

  const computedBaseReach =
    Math.round(effectiveProfileViews * 6.4) + (hash % 850)

  const effectiveTotalReach =
    user?.postImpressions && user.postImpressions > 0
      ? user.postImpressions
      : computedBaseReach

  const effectiveUniqueViewers = Math.round(effectiveTotalReach * 0.65)

  const computedBaseDiscoveries =
    Math.max(96, Math.round(effectiveProfileViews * 0.38) + rawSkills.length * 14 + (hash % 45))

  const effectiveDiscoveries =
    user?.searchAppearances && user.searchAppearances > 0
      ? user.searchAppearances
      : computedBaseDiscoveries

  // Enclave-specific organizations, job roles, viewers, and credentials
  type EnclaveTemplate = {
    companies: { name: string; percentage: number; logo: string }[]
    jobRoles: { role: string; percentage: number }[]
    credentialTiers: { label: string; percent: number }[]
    peakNote: string
    viewers: Omit<ProfileViewerItem, 'id' | 'isConnected' | 'isPending'>[]
  }

  const templates: Record<string, EnclaveTemplate> = {
    telecom_electronics_tech: {
      companies: [
        { name: 'Corning Optical & Fiber Systems', percentage: 27, logo: '📡' },
        { name: 'Verizon Global Fiber & 5G Core', percentage: 23, logo: '🗼' },
        { name: 'AT&T FirstNet & Telecom Ops', percentage: 18, logo: '📶' },
        { name: 'Honeywell Micro-Electronics & PCB Labs', percentage: 15, logo: '🔬' },
        { name: 'Crown Castle & Ericsson Infrastructure', percentage: 11, logo: '⚡' },
        { name: 'Regional ISP & Avionics Integrators', percentage: 6, logo: '🌐' }
      ],
      jobRoles: [
        { role: 'VP & Directors of Fiber / Telecom Engineering', percentage: 34 },
        { role: 'LeadOSP / FTTH Splicing & OTDR Superintendents', percentage: 28 },
        { role: 'Micro-Electronics & IPC BGA Diagnostics Leads', percentage: 21 },
        { role: 'Telecom Infrastructure & Spectrum Buyers', percentage: 17 }
      ],
      credentialTiers: [
        { label: 'FOA CFOT / CFOS', percent: 54 },
        { label: 'FCC GROL / IPC', percent: 31 },
        { label: 'BICSI / OSHA', percent: 15 }
      ],
      peakNote: `Telecom, Fiber OSP & Electronics Engineering inspections for ${safeName} peak +44% mid-week following field deployment updates.`,
      viewers: [
        {
          name: 'Marcus Thorne, RCDD',
          headline: 'VP of Global Fiber & OSP Engineering @ Corning Optical Communications',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          company: 'Corning Optical Communications',
          location: 'Charlotte, NC',
          viewedAt: '14 minutes ago',
          viewVector: `Directory Search: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'BICSI RCDD & FOA Fellow',
          mutualConnectionsCount: 19,
          mutualConnectionName: 'Kwesi Asiedu',
          category: 'executive'
        },
        {
          name: 'Elena Vance, PE',
          headline: 'Director of 5G RAN & Fiber Backhaul Procurement @ Verizon Global Networks',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          company: 'Verizon Global Networks',
          location: 'Basking Ridge, NJ',
          viewedAt: '1 hour ago',
          viewVector: `Vendor & Contractor Roster: "${skill2}"`,
          clearanceLevel: 'Enterprise Telecom Buyer',
          mutualConnectionsCount: 27,
          category: 'buyer'
        },
        {
          name: 'David Kowalski',
          headline: 'Principal Micro-Electronics & BGA Rework Lead @ Honeywell Aerospace',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          company: 'Honeywell Aerospace',
          location: 'Phoenix, AZ',
          viewedAt: '3 hours ago',
          viewVector: `Verified Skill Match: "${skill1} + ${skill3}"`,
          clearanceLevel: 'IPC-J-STD-001 Master',
          mutualConnectionsCount: 14,
          category: 'peer'
        },
        {
          name: 'Rachel Sterling',
          headline: 'Senior Technical Talent Partner (Telecom, Fiber & Hardware) @ AT&T FirstNet',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          company: 'AT&T FirstNet',
          location: 'Dallas, TX',
          viewedAt: 'Yesterday at 3:45 PM',
          viewVector: `Recruiter Query: "${primaryRole}" in ${cleanLocation}`,
          clearanceLevel: 'Verified Talent Partner',
          mutualConnectionsCount: 22,
          category: 'recruiter'
        },
        {
          name: 'Carlos Mendez, CFOT',
          headline: 'Regional OSP Fiber Splicing & OTDR Superintendent @ Crown Castle',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
          company: 'Crown Castle Fiber',
          location: 'Houston, TX',
          viewedAt: 'Yesterday at 11:10 AM',
          viewVector: `Enclave Inspection: ${enclaveInfo?.name || 'Telecom & Tech'}`,
          clearanceLevel: 'FOA CFOT / OSHA 30',
          mutualConnectionsCount: 16,
          category: 'peer'
        },
        {
          name: 'Dr. Aris Chen',
          headline: 'SVP of RF Systems & Photonics Architecture @ Nokia Bell Labs',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
          company: 'Nokia Bell Labs',
          location: 'Murray Hill, NJ',
          viewedAt: '2 days ago',
          viewVector: `Portfolio & Experience Inspection (${primaryCompany})`,
          clearanceLevel: 'IEEE Fellow · Level 5',
          mutualConnectionsCount: 31,
          category: 'executive'
        },
        {
          name: 'Claire Beauchamp',
          headline: 'National Director of Field Operations & Dispatch @ Ericsson North America',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
          company: 'Ericsson North America',
          location: 'Plano, TX',
          viewedAt: '3 days ago',
          viewVector: `Direct Profile Passport Link`,
          clearanceLevel: 'Verified Enterprise Director',
          mutualConnectionsCount: 18,
          category: 'buyer'
        }
      ]
    },
    healthcare_medicine: {
      companies: [
        { name: 'Mayo Clinic & Academic Medical Centers', percentage: 28, logo: '🏥' },
        { name: 'Johns Hopkins Medicine & Surgery', percentage: 23, logo: '🩺' },
        { name: 'Cleveland Clinic Health System', percentage: 19, logo: '🫀' },
        { name: 'Kaiser Permanente & Clinical Pharmacy', percentage: 15, logo: '💊' },
        { name: 'HCA Healthcare & Trauma Networks', percentage: 10, logo: '🚑' },
        { name: 'Regional Hospitals & Specialty Clinics', percentage: 5, logo: '🔬' }
      ],
      jobRoles: [
        { role: 'Chief Medical Officers (CMOs) & Department Chairs', percentage: 33 },
        { role: 'Directors of Nursing (DON) & ICU / ER Nurse Leaders', percentage: 29 },
        { role: 'Directors of Pharmacy & Clinical Pharmacists (PharmD)', percentage: 22 },
        { role: 'Hospital Clinical Recruiters & Credentialing Leads', percentage: 16 }
      ],
      credentialTiers: [
        { label: 'NPI & State Board', percent: 58 },
        { label: 'HIPAA / Joint Comm.', percent: 28 },
        { label: 'Board Certified', percent: 14 }
      ],
      peakNote: `Hospital Department Chairs, Pharmacy Directors & Clinical Recruiters inspecting ${safeName}'s credentials spike +48% mid-week.`,
      viewers: [
        {
          name: 'Dr. Angela Vance, MD, FACS',
          headline: 'Chief of Trauma Surgery & Clinical Operations @ Cleveland Clinic',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
          company: 'Cleveland Clinic',
          location: 'Cleveland, OH',
          viewedAt: '12 minutes ago',
          viewVector: `Clinical Directory Search: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'NPI & Board Certified Fellow',
          mutualConnectionsCount: 24,
          mutualConnectionName: 'Elena Rostova, RN',
          category: 'executive'
        },
        {
          name: 'Dr. Samuel Osei, PharmD, BCPS',
          headline: 'Director of Inpatient Pharmacy & Clinical Formulary @ Johns Hopkins Hospital',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
          company: 'Johns Hopkins Hospital',
          location: 'Baltimore, MD',
          viewedAt: '45 minutes ago',
          viewVector: `Credential & Skill Match: "${skill1} + ${skill2}"`,
          clearanceLevel: 'Board Certified Pharmacist',
          mutualConnectionsCount: 19,
          category: 'executive'
        },
        {
          name: 'Elena Rostova, BSN, RN, CCRN',
          headline: 'Lead Trauma & Critical Care Nurse Manager @ Massachusetts General Hospital',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80',
          company: 'Massachusetts General Hospital',
          location: 'Boston, MA',
          viewedAt: '2 hours ago',
          viewVector: `Healthcare Enclave Broadcast & Clinical Endorsement`,
          clearanceLevel: 'CCRN / TNCC Verified',
          mutualConnectionsCount: 32,
          category: 'peer'
        },
        {
          name: 'Rebecca Lin, MHA',
          headline: 'VP of Physician, Pharmacy & Nursing Talent Acquisition @ Kaiser Permanente',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          company: 'Kaiser Permanente',
          location: 'Oakland, CA',
          viewedAt: 'Yesterday at 4:10 PM',
          viewVector: `Recruiter Search: "${primaryRole}" (${cleanLocation})`,
          clearanceLevel: 'Verified Clinical Recruiter',
          mutualConnectionsCount: 15,
          category: 'recruiter'
        },
        {
          name: 'Marcus Sterling, FACHE',
          headline: 'Chief Hospital Administrator & Medical Staffing Buyer @ Mayo Clinic',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          company: 'Mayo Clinic',
          location: 'Rochester, MN',
          viewedAt: '2 days ago',
          viewVector: `Clinical Staffing & Privileges Roster: "${skill3}"`,
          clearanceLevel: 'FACHE · Hospital Buyer',
          mutualConnectionsCount: 21,
          category: 'buyer'
        }
      ]
    },
    trades_construction: {
      companies: [
        { name: 'Turner Construction & Commercial Builders', percentage: 27, logo: '🏗️' },
        { name: 'Bechtel Infrastructure & Industrial Corp', percentage: 22, logo: '🔨' },
        { name: 'Kiewit Heavy Civil & Structural Group', percentage: 19, logo: '📐' },
        { name: 'Skanska USA & Architectural Millwork', percentage: 15, logo: '🪵' },
        { name: 'AECOM & National Subcontractor Network', percentage: 11, logo: '🦺' },
        { name: 'Private Estate & Heritage Commissions', percentage: 6, logo: '🏛️' }
      ],
      jobRoles: [
        { role: 'General Superintendents & Construction Directors', percentage: 35 },
        { role: 'VP of Preconstruction & Subcontractor Procurement', percentage: 27 },
        { role: 'Master Craftsmen, Foremen & Project Estimators', percentage: 22 },
        { role: 'Commercial Trade & Union Staffing Partners', percentage: 16 }
      ],
      credentialTiers: [
        { label: 'OSHA 30 / Master', percent: 56 },
        { label: 'Bonded & Insured', percent: 30 },
        { label: 'Guild Fellow', percent: 14 }
      ],
      peakNote: `General Contractors, Preconstruction Buyers & Superintendents inspecting ${safeName}'s bid credentials spike +45% mid-week.`,
      viewers: [
        {
          name: 'walkerdean Miller, PE',
          headline: 'VP of Field Operations & Heavy Timber Construction @ Turner Construction',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
          company: 'Turner Construction',
          location: 'Denver, CO',
          viewedAt: '18 minutes ago',
          viewVector: `Subcontractor Bid Directory: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'OSHA 30 · General Contractor',
          mutualConnectionsCount: 22,
          category: 'executive'
        },
        {
          name: 'Marcus Vance',
          headline: 'Director of Subcontractor Procurement & Commercial Bids @ Bechtel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          company: 'Bechtel Infrastructure',
          location: 'Reston, VA',
          viewedAt: '2 hours ago',
          viewVector: `RFP Pre-Qualification: "${skill1} + ${skill2}"`,
          clearanceLevel: 'Bonded Enterprise Buyer',
          mutualConnectionsCount: 17,
          category: 'buyer'
        },
        {
          name: 'Sarah Jenkins',
          headline: 'National Trade & Superintendent Talent Partner @ Kiewit Corporation',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          company: 'Kiewit Corporation',
          location: 'Omaha, NE',
          viewedAt: 'Yesterday at 2:15 PM',
          viewVector: `Recruiter Search: "${primaryRole}" in ${cleanLocation}`,
          clearanceLevel: 'Verified Trade Recruiter',
          mutualConnectionsCount: 14,
          category: 'recruiter'
        },
        {
          name: 'James Kowalski',
          headline: 'Master Structural Foreman & Crane Rigging Lead @ Skanska USA',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          company: 'Skanska USA',
          location: 'Seattle, WA',
          viewedAt: '2 days ago',
          viewVector: `Portfolio Inspection: ${primaryCompany}`,
          clearanceLevel: 'Master Guild Fellow',
          mutualConnectionsCount: 28,
          category: 'peer'
        }
      ]
    },
    law_gov_defense: {
      companies: [
        { name: 'U.S. Federal Judiciary, Supreme & Superior Courts', percentage: 28, logo: '👩‍⚖️' },
        { name: 'Cravath, Kirkland & Ellis & AmLaw 100 Trial Firms', percentage: 24, logo: '⚖️' },
        { name: 'JAMS Arbitration, AAA & Chambers Panels', percentage: 18, logo: '🏛️' },
        { name: 'U.S. Department of Justice (DOJ) & Public Defenders', percentage: 14, logo: '📜' },
        { name: 'Fortune 500 General Counsel & Legal Operations', percentage: 10, logo: '💼' },
        { name: 'Veritext, Lexis+ & Westlaw Legal Network', percentage: 6, logo: '🖋️' }
      ],
      jobRoles: [
        { role: 'Presiding Judges, Magistrates & Administrative Law Judges', percentage: 32 },
        { role: 'Managing Partners, Trial Lawyers & Litigation Chairs (JD/Esq.)', percentage: 30 },
        { role: 'General Counsel, Corporate M&A & Patent Attorneys', percentage: 22 },
        { role: 'Judicial Nominations & Legal Executive Search Partners', percentage: 16 }
      ],
      credentialTiers: [
        { label: 'Active Bar (JD/Esq.)', percent: 58 },
        { label: 'Judicial Chambers', percent: 27 },
        { label: 'Supreme Court Bar', percent: 15 }
      ],
      peakNote: `Presiding Judges, AmLaw 100 Managing Partners & General Counsel inspecting ${safeName}'s Bar & Chambers credentials spike +51% mid-week.`,
      viewers: [
        {
          name: 'Hon. Justice Eleanor Vance, JD',
          headline: 'Presiding Judge, U.S. Magistrate & JAMS Neutral Arbitrator @ Federal & State Courts',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          company: 'U.S. Courts & JAMS Chambers',
          location: 'Washington, DC',
          viewedAt: '10 minutes ago',
          viewVector: `Judicial Chambers & Bar Directory: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'Presiding Judge · Chambers Verified',
          mutualConnectionsCount: 31,
          mutualConnectionName: 'Kwame Boateng, JD, Esq.',
          category: 'executive'
        },
        {
          name: 'Kwame Boateng, JD, Esq.',
          headline: 'Senior Trial Lawyer & Chair of Commercial Litigation @ Cravath / Trial Bar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          company: 'AmLaw 100 Trial Litigation',
          location: 'New York, NY',
          viewedAt: '42 minutes ago',
          viewVector: `Co-Counsel & Trial Brief Match: "${skill1} + ${skill2}"`,
          clearanceLevel: 'Supreme Court & State Bar Verified',
          mutualConnectionsCount: 27,
          category: 'peer'
        },
        {
          name: 'Victoria Sterling, JD',
          headline: 'General Counsel & VP of Legal Retention @ Fortune 100 Enterprise',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
          company: 'Lockheed & Fortune 100 Legal',
          location: 'Washington, DC / NY',
          viewedAt: '2 hours ago',
          viewVector: `Outside Counsel & Arbitration Panel Roster: "${skill3}"`,
          clearanceLevel: 'General Counsel · Legal Buyer',
          mutualConnectionsCount: 19,
          category: 'buyer'
        },
        {
          name: 'Jonathan Reynolds, Esq.',
          headline: 'Managing Director — Partner, Judge & Judicial Clerk Recruiting @ Major, Lindsey & Africa',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
          company: 'Major, Lindsey & Africa Legal Search',
          location: 'Boston, MA / DC',
          viewedAt: 'Yesterday at 3:40 PM',
          viewVector: `Legal Search: "${primaryRole}" (${cleanLocation})`,
          clearanceLevel: 'Verified Bar Search Partner',
          mutualConnectionsCount: 22,
          category: 'recruiter'
        }
      ]
    },
    energy_utilities_environment: {
      companies: [
        { name: 'Sunrun, Tesla Energy & First Solar Microgrids', percentage: 29, logo: '☀️' },
        { name: 'NextEra Energy & SOLV Utility Solar O&M', percentage: 24, logo: '⚡' },
        { name: 'Enphase, SolarEdge & SMA Inverter Network', percentage: 18, logo: '🔋' },
        { name: 'Duke Energy & NERC High-Voltage Grid Ops', percentage: 14, logo: '🗼' },
        { name: 'Freeport-McMoRan & Veolia Environmental', percentage: 9, logo: '💧' },
        { name: 'Commercial EPC & Municipal Microgrid Buyers', percentage: 6, logo: '🏢' }
      ],
      jobRoles: [
        { role: 'Solar EPC Directors, NABCEP Leads & Microgrid Superintendents', percentage: 36 },
        { role: 'Utility O&M Managers & Battery Storage (BESS) Commissioning Leads', percentage: 28 },
        { role: 'Commercial Solar Project Buyers & Grid Interconnection Engineers', percentage: 21 },
        { role: 'Clean Energy & Utility Technical Talent Recruiters', percentage: 15 }
      ],
      credentialTiers: [
        { label: 'NABCEP PVIP / NEC 690', percent: 59 },
        { label: 'Tesla / Enphase Cert.', percent: 27 },
        { label: 'NFPA 70E / NERC', percent: 14 }
      ],
      peakNote: `Solar EPC Superintendents, Tesla/Enphase Commissioning Leads & Clean Energy Buyers inspecting ${safeName}'s profile spike +49% mid-week.`,
      viewers: [
        {
          name: 'Diego Alvarez, NABCEP PVIP',
          headline: 'Director of Solar PV Field Operations & Tesla Powerwall Microgrids @ Sunrun / Tesla Energy',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          company: 'Sunrun & Tesla Energy Partner',
          location: 'Austin, TX',
          viewedAt: '14 minutes ago',
          viewVector: `NABCEP Solar & Microgrid Directory: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'NABCEP PVIP · Master Solar Installer',
          mutualConnectionsCount: 25,
          category: 'executive'
        },
        {
          name: 'Marcus Vance, PE',
          headline: 'VP of Utility Solar EPC Procurement & BESS Commissioning @ NextEra Energy',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          company: 'NextEra Energy Resources',
          location: 'Juno Beach, FL / Austin, TX',
          viewedAt: '1 hour ago',
          viewVector: `Solar Subcontractor & O&M Roster: "${skill1} + ${skill2}"`,
          clearanceLevel: 'Utility EPC Buyer',
          mutualConnectionsCount: 18,
          category: 'buyer'
        }
      ]
    },
    telecom_digital_infrastructure: {
      companies: [
        { name: 'DIRECTV, Dish Commercial SMATV & Mastec Advanced Tech', percentage: 28, logo: '📡' },
        { name: 'Starlink Commercial, HughesNet & VSAT Integrators', percentage: 23, logo: '🛰️' },
        { name: 'Comcast Xfinity, Charter Spectrum & DOCSIS Broadband', percentage: 19, logo: '📺' },
        { name: 'CEDIA Pro-AV, Crestron/Control4 & IP CCTV Integrators', percentage: 15, logo: '🔊' },
        { name: 'Equinix Data Centers & Crown Castle Fiber Ops', percentage: 10, logo: '🗼' },
        { name: 'Hospitality, Stadium & Multi-Family AV Buyers', percentage: 5, logo: '🏨' }
      ],
      jobRoles: [
        { role: 'DirecTV / Satellite Field Operations Managers & SMATV Headend Leads', percentage: 35 },
        { role: 'Starlink/VSAT, Cable Broadband (DOCSIS) & Fiber Superintendents', percentage: 28 },
        { role: 'Commercial Pro-AV, Home Theater & CCTV Integration Buyers', percentage: 22 },
        { role: 'Telecom, Satellite & AV Field Recruiting Partners', percentage: 15 }
      ],
      credentialTiers: [
        { label: 'SBCA / DirecTV SWM', percent: 57 },
        { label: 'CEDIA / NCTI DOCSIS', percent: 29 },
        { label: 'FOA Fiber / BICSI', percent: 14 }
      ],
      peakNote: `DirecTV Field Regional Managers, Starlink/Broadband Contractors & Commercial AV Buyers inspecting ${safeName}'s profile spike +47% mid-week.`,
      viewers: [
        {
          name: 'Darnell Jackson, SBCA, CEDIA',
          headline: 'Regional Field Director — DirecTV Commercial SMATV, Starlink & Pro-AV @ DIRECTV / Mastec',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
          company: 'DIRECTV & Mastec Field Ops',
          location: 'Atlanta, GA / Dallas, TX',
          viewedAt: '11 minutes ago',
          viewVector: `Satellite, Broadband & Pro-AV Search: "${primaryRole} · ${skill1}"`,
          clearanceLevel: 'SBCA / DirecTV Master Certified',
          mutualConnectionsCount: 23,
          category: 'executive'
        },
        {
          name: 'Carlos Mendez, RCDD',
          headline: 'VP of Commercial Hospitality AV, Sports Bar SMATV & Fiber Procurement @ Encore / Comcast',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          company: 'Commercial AV & Broadband Network',
          location: 'Denver, CO',
          viewedAt: '55 minutes ago',
          viewVector: `Commercial Dish, Coax & AV Work Order Desk: "${skill1} + ${skill2}"`,
          clearanceLevel: 'Commercial AV & Telecom Buyer',
          mutualConnectionsCount: 16,
          category: 'buyer'
        }
      ]
    }
  }

  const activeTemplate = templates[enclaveId]

  // Build customized viewers list that ALWAYS reflects the user's actual profession, skills, and location
  const baseViewersSource = activeTemplate
    ? activeTemplate.viewers.map((v, idx) => ({
        ...v,
        id: `viewer_${enclaveId}_${idx + 1}`,
        isConnected: idx === 1 || idx === 3,
        isPending: idx === 2
      }))
    : (customViewers && customViewers.length > 0 ? customViewers : INITIAL_PROFILE_VIEWERS).map((v, idx) => {
        const vectorByIdx =
          idx === 0
            ? `Directory Search: "${primaryRole} · ${skill1}"`
            : idx === 1
            ? `Procurement & Partner Roster: "${skill2}"`
            : idx === 2
            ? `Broadcast & Portfolio: "${skill1} + ${skill3}"`
            : idx === 3
            ? `Verified Skill Endorsement: "${skill4}"`
            : idx === 4
            ? `Recruiter Search: "${primaryRole}" (${cleanLocation})`
            : v.viewVector
        return {
          ...v,
          viewVector: vectorByIdx
        }
      })

  // Build dynamic Top Search Keywords strictly from the user's own profile!
  const dynamicKeywords = [
    {
      keyword: primaryRole.length > 34 ? primaryRole.slice(0, 34).trim() : primaryRole,
      occurrences: Math.max(48, Math.round(effectiveDiscoveries * 0.34)),
      growth: '+38%'
    },
    {
      keyword: skill1,
      occurrences: Math.max(34, Math.round(effectiveDiscoveries * 0.25)),
      growth: '+52%'
    },
    {
      keyword: skill2,
      occurrences: Math.max(24, Math.round(effectiveDiscoveries * 0.19)),
      growth: '+24%'
    },
    {
      keyword: `${skill3} · ${cleanLocation.split(',')[0]}`,
      occurrences: Math.max(16, Math.round(effectiveDiscoveries * 0.13)),
      growth: '+19%'
    },
    {
      keyword: skill4 || enclaveInfo?.shortName || 'Verified Specialist',
      occurrences: Math.max(11, Math.round(effectiveDiscoveries * 0.09)),
      growth: '+15%'
    }
  ]

  // Build dynamic Top Performing Posts reflecting the user's name, profession, and skills
  const dynamicPosts = [
    {
      id: 'post_user_1',
      title: `${enclaveInfo?.icon || '🚀'} ${safeName}: ${skill1} & ${skill2} Field Implementation Playbook`,
      date: '3 days ago · Verified Broadcast',
      reach: Math.round(effectiveTotalReach * 0.48),
      engagements: Math.max(64, Math.round(effectiveTotalReach * 0.042)),
      reposts: Math.max(14, Math.round(effectiveTotalReach * 0.009)),
      category: `${enclaveInfo?.shortName || 'Domain'} Showcase`
    },
    {
      id: 'post_user_2',
      title: `📑 Case Study: Delivering High-Reliability ${primaryRole} Operations at ${primaryCompany}`,
      date: '1 week ago · Technical Publication',
      reach: Math.round(effectiveTotalReach * 0.32),
      engagements: Math.max(48, Math.round(effectiveTotalReach * 0.034)),
      reposts: Math.max(11, Math.round(effectiveTotalReach * 0.007)),
      category: 'Case Study'
    },
    {
      id: 'post_user_3',
      title: `🛡️ 2026 ${skill3} & ${skill4} Verification Standards (${cleanLocation})`,
      date: '2 weeks ago · Enclave Briefing',
      reach: Math.round(effectiveTotalReach * 0.20),
      engagements: Math.max(36, Math.round(effectiveTotalReach * 0.028)),
      reposts: Math.max(8, Math.round(effectiveTotalReach * 0.005)),
      category: 'Best Practices'
    }
  ]

  // Build dynamic Top Inspecting Companies (incorporating user's experience company if present)
  const baseCompanies = activeTemplate
    ? activeTemplate.companies
    : [
        {
          name: primaryCompany && !primaryCompany.includes("ConnectIn")
            ? primaryCompany
            : `${enclaveInfo?.shortName || 'Enterprise'} Partner Network`,
          percentage: 26,
          logo: enclaveInfo?.icon || '🏢'
        },
        { name: 'Global Enterprise & Fortune 500 Buyers', percentage: 22, logo: '🌐' },
        { name: 'National Accreditation & Guild Partners', percentage: 18, logo: '🛡️' },
        { name: 'Regional Operations & Field Integrators', percentage: 16, logo: '⚡' },
        { name: 'Executive Talent & Advisory Search', percentage: 12, logo: '💼' },
        { name: 'Direct Client & Referral Network', percentage: 6, logo: '🤝' }
      ]

  const dynamicTopCompanies = baseCompanies.map(c => ({
    name: c.name,
    percentage: c.percentage,
    count: Math.max(18, Math.round((effectiveTotalReach * c.percentage) / 100)),
    logo: c.logo
  }))

  const dynamicSearchingCompanies = baseCompanies.slice(0, 5).map((c, idx) => {
    const pct = [30, 24, 20, 15, 11][idx] || c.percentage
    return {
      name: c.name,
      percentage: pct,
      searchesCount: Math.max(8, Math.round((effectiveDiscoveries * pct) / 100)),
      logo: c.logo
    }
  })

  const dynamicJobRoles = activeTemplate
    ? activeTemplate.jobRoles
    : [
        { role: `VP & Directors of ${enclaveInfo?.shortName || 'Operations'}`, percentage: 33 },
        { role: `Lead ${primaryRole}s & Senior Peers`, percentage: 28 },
        { role: 'Enterprise Procurement & Contract Buyers', percentage: 22 },
        { role: 'Principal Talent & Recruiting Partners', percentage: 17 }
      ]

  const dailyWeights = [
    { day: 'Mon', rPct: 0.115, uPct: 0.135 },
    { day: 'Tue', rPct: 0.150, uPct: 0.175 },
    { day: 'Wed', rPct: 0.222, uPct: 0.250 },
    { day: 'Thu', rPct: 0.188, uPct: 0.215 },
    { day: 'Fri', rPct: 0.164, uPct: 0.185 },
    { day: 'Sat', rPct: 0.090, uPct: 0.100 },
    { day: 'Sun', rPct: 0.071, uPct: 0.080 }
  ]

  const dynamicDailyTrends = dailyWeights.map(w => ({
    day: w.day,
    reach: Math.max(60, Math.round(effectiveTotalReach * w.rPct)),
    uniqueViewers: Math.max(40, Math.round(effectiveUniqueViewers * w.uPct))
  }))

  const reachData: ContentReachData = {
    totalReach: effectiveTotalReach,
    weeklyChangePercent: 24.6,
    uniqueViewers: effectiveUniqueViewers,
    engagementRate: 8.8,
    dailyTrends: dynamicDailyTrends,
    topPosts: dynamicPosts,
    topCompanies: dynamicTopCompanies,
    topJobRoles: dynamicJobRoles
  }

  const discoveryData: DirectoryDiscoveryData = {
    totalDiscoveries: effectiveDiscoveries,
    weeklyChangePercent: 19.4,
    searcherCount: Math.max(42, Math.round(effectiveDiscoveries * 0.82)),
    topSearchKeywords: dynamicKeywords,
    searchingCompanies: dynamicSearchingCompanies,
    searcherSeniority: [
      { level: `Executive & Department Leadership (${enclaveInfo?.shortName || 'Domain'})`, percentage: 42 },
      { level: 'Specialized Recruiting & Talent Partners', percentage: 34 },
      { level: 'Enterprise RFP, Contracting & Procurement Leads', percentage: 24 }
    ]
  }

  return {
    effectiveProfileViews,
    effectiveTotalReach,
    effectiveUniqueViewers,
    effectiveDiscoveries,
    decisionMakerRatio: `${Math.min(78, 62 + (rawSkills.length % 12)).toFixed(1)}%`,
    standingBadge: `Top 1% ${enclaveInfo?.shortName || 'Verified'}`,
    peakTrafficNote:
      activeTemplate?.peakNote ||
      `Activity from ${enclaveInfo?.name || 'Enterprise'} decision-makers inspecting ${safeName}'s profile spikes +46% mid-week.`,
    credentialTiers: activeTemplate?.credentialTiers || [
      { label: user?.profession?.split(' ')[0] || 'Verified ID', percent: 57 },
      { label: 'Enterprise Buyer', percent: 29 },
      { label: 'Fellow Grade', percent: 14 }
    ],
    viewers: baseViewersSource,
    reachData,
    discoveryData
  }
}

// Storage helpers
const VIEWERS_STORAGE_KEY = 'connectin_profile_viewers_v1'
const REACH_STORAGE_KEY = 'connectin_content_reach_v1'
const DISCOVERIES_STORAGE_KEY = 'connectin_directory_discoveries_v1'

export function loadStoredProfileViewers(): ProfileViewerItem[] {
  if (typeof window === 'undefined') return INITIAL_PROFILE_VIEWERS
  try {
    const raw = localStorage.getItem(VIEWERS_STORAGE_KEY)
    if (!raw) {
      saveStoredProfileViewers(INITIAL_PROFILE_VIEWERS)
      return INITIAL_PROFILE_VIEWERS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_PROFILE_VIEWERS
  }
}

export function saveStoredProfileViewers(viewers: ProfileViewerItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(VIEWERS_STORAGE_KEY, JSON.stringify(viewers))
  } catch (e) {
    console.warn('[saveStoredProfileViewers error]', e)
  }
}

export function recordProfileView(viewer: Partial<ProfileViewerItem>): ProfileViewerItem[] {
  const current = loadStoredProfileViewers()
  const newViewer: ProfileViewerItem = {
    id: 'view_' + Date.now(),
    name: viewer.name || 'Verified ConnectIn Member',
    headline: viewer.headline || 'Enterprise Technical Leader',
    avatar: viewer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    company: viewer.company || 'Enterprise Network',
    location: viewer.location || 'United States',
    viewedAt: 'Just now',
    viewVector: viewer.viewVector || 'Direct Workspace Inspection',
    clearanceLevel: viewer.clearanceLevel || 'Cryptographically Verified',
    mutualConnectionsCount: viewer.mutualConnectionsCount || 1,
    isConnected: false,
    isPending: false,
    category: viewer.category || 'peer'
  }

  const updated = [newViewer, ...current.filter(v => v.id !== newViewer.id)]
  saveStoredProfileViewers(updated)
  return updated
}

export function loadStoredContentReach(): ContentReachData {
  if (typeof window === 'undefined') return INITIAL_CONTENT_REACH_DATA
  try {
    const raw = localStorage.getItem(REACH_STORAGE_KEY)
    if (!raw) {
      saveStoredContentReach(INITIAL_CONTENT_REACH_DATA)
      return INITIAL_CONTENT_REACH_DATA
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_CONTENT_REACH_DATA
  }
}

export function saveStoredContentReach(data: ContentReachData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(REACH_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[saveStoredContentReach error]', e)
  }
}

export function loadStoredDirectoryDiscoveries(): DirectoryDiscoveryData {
  if (typeof window === 'undefined') return INITIAL_DIRECTORY_DISCOVERIES_DATA
  try {
    const raw = localStorage.getItem(DISCOVERIES_STORAGE_KEY)
    if (!raw) {
      saveStoredDirectoryDiscoveries(INITIAL_DIRECTORY_DISCOVERIES_DATA)
      return INITIAL_DIRECTORY_DISCOVERIES_DATA
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_DIRECTORY_DISCOVERIES_DATA
  }
}

export function saveStoredDirectoryDiscoveries(data: DirectoryDiscoveryData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DISCOVERIES_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[saveStoredDirectoryDiscoveries error]', e)
  }
}
