/**
 * ConnectIn Analytics Engine
 * Manages Profile Viewers (Identity Tracking), Content Reach (Post Impressions), and Directory Discoveries (Search Appearances)
 */

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
    headline: 'Director of Cyber Threat Operations @ Raytheon Intelligence',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    company: 'Raytheon Intelligence',
    location: 'Arlington, VA',
    viewedAt: '3 hours ago',
    viewVector: 'Feed Broadcast: Autonomous Defense Loops',
    clearanceLevel: 'TS/SCI Verified Fellow',
    mutualConnectionsCount: 12,
    isConnected: false,
    isPending: true,
    category: 'peer'
  },
  {
    id: 'viewer_4',
    name: 'Elena Rostova',
    headline: 'Chief AI Research Scientist @ Stanford AI Lab',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    company: 'Stanford AI Lab',
    location: 'Palo Alto, CA',
    viewedAt: 'Yesterday at 4:20 PM',
    viewVector: 'Technical Whitepaper Citation & Research Link',
    clearanceLevel: 'Fellow Grade Level 5',
    mutualConnectionsCount: 45,
    isConnected: true,
    isPending: false,
    category: 'peer'
  },
  {
    id: 'viewer_5',
    name: 'Jonathan Reynolds',
    headline: 'Principal Technical Talent Partner @ AWS Defense & National Security',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    company: 'AWS Defense & National Security',
    location: 'Herndon, VA',
    viewedAt: 'Yesterday at 11:05 AM',
    viewVector: 'Recruiter Search: "Zero Trust + Kubernetes eBPF"',
    clearanceLevel: 'Level 3 Identity Verified',
    mutualConnectionsCount: 22,
    isConnected: false,
    isPending: false,
    category: 'recruiter'
  },
  {
    id: 'viewer_6',
    name: 'Dr. Arthur Vance',
    headline: 'Deputy Director of Cyber Infrastructure @ Johns Hopkins APL',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    company: 'Johns Hopkins Applied Physics Lab',
    location: 'Laurel, MD',
    viewedAt: '2 days ago',
    viewVector: 'Gated Enclave: National Security Architects',
    clearanceLevel: 'Q Clearance / TS-SCI Equivalent',
    mutualConnectionsCount: 19,
    isConnected: false,
    isPending: false,
    category: 'executive'
  },
  {
    id: 'viewer_7',
    name: 'Claire Beauchamp',
    headline: 'Head of Solutions Architecture @ Microsoft Federal Cloud',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    company: 'Microsoft Federal Cloud',
    location: 'Reston, VA',
    viewedAt: '3 days ago',
    viewVector: 'Direct Profile Verification Link',
    clearanceLevel: 'TS/SCI Cleared',
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
      date: 'Sep 12, 2026',
      reach: 4820,
      engagements: 412,
      reposts: 88,
      category: 'Product Launch'
    },
    {
      id: 'post_research_1',
      title: '📑 Deterministic Tool Sandboxing in Autonomous Multi-Agent Swarms',
      date: 'Sep 10, 2026',
      reach: 3120,
      engagements: 328,
      reposts: 65,
      category: 'Technical Whitepaper'
    },
    {
      id: 'post_doc_1',
      title: '📑 Enterprise Next.js & Turbopack 2026 Playbook (Slide Deck)',
      date: 'Sep 8, 2026',
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
