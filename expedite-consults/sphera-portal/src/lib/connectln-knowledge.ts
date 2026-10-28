/**
 * ConnectLn platform knowledge base for Noctis Q&A.
 * Topics are matched by keyword scoring; enclave/profession answers are built
 * from PROFESSION_ENCLAVES so they stay in sync with the product.
 */
import { PROFESSION_ENCLAVES, ALL_PROFESSIONS } from '@/lib/connectin-professions'

export interface KnowledgeTopic {
  id: string
  title: string
  keywords: string[]
  answer: () => string
  tab?: string
  tabLabel?: string
}

const enclaveList = () =>
  PROFESSION_ENCLAVES.map((e) => `• **${e.name}** — ${e.professions.length} professions`).join('\n')

export const CONNECTLN_TOPICS: KnowledgeTopic[] = [
  {
    id: 'about',
    title: 'What is ConnectLn',
    keywords: ['what is connectln', 'what is connectin', 'about connectln', 'about connectin', 'connectln', 'connectin', 'platform', 'overview', 'what can i do'],
    answer: () =>
      `**ConnectLn** is a professional network for every kind of worker — from cybersecurity engineers and doctors to electricians, farmers, barbers, drivers and artisans.\n\nCore areas: **Home feed, Network, Jobs, Messaging, Alerts, Marketplace, Learning, Media and Pulse Rooms**, plus Companies, Guilds, Bounties, Events, RFPs/Procurement, Launchpad, Resume Prep, Wallet and VibeChat in the **More** menu.\n\nYour profile's profession ("enclave") tailors your jobs, analytics, tools and suggestions.`,
    tab: 'home',
    tabLabel: 'Go to Home'
  },
  {
    id: 'navigation',
    title: 'Navigation & menus',
    keywords: ['navigate', 'navigation', 'menu', 'tabs', 'top bar', 'nav', 'sidebar', 'more menu', 'where do i find', 'badge', 'badges'],
    answer: () =>
      `**Top bar:** Home, Network, Jobs, Msgs, Alerts, Market, Learn, Media, Pulse. The active tab is underlined in blue; red badges clear once you open that tab.\n\n**More menu** (grid icon) holds the rest: Companies, Guilds, Bounties, Events, RFPs, Launchpad, Resume Prep, Wallet, VibeChat and admin tools.\n\n**Me menu** (your avatar) opens your profile, settings, security and sign-out.\n\n**Left sidebar** shows your profile card and role-specific shortcuts; each shortcut opens the closest matching tab.`
  },
  {
    id: 'professions',
    title: 'Professions & enclaves',
    keywords: ['profession', 'professions', 'enclave', 'enclaves', 'industries', 'who can join', 'occupation', 'trades', 'which jobs types', 'roles supported'],
    answer: () =>
      `ConnectLn supports **${PROFESSION_ENCLAVES.length} enclaves and ${ALL_PROFESSIONS.length}+ professions**:\n\n${enclaveList()}\n\nRecent additions include Lawyers & Judges, Herbal Medicine practitioners, Dentists, Solar PV Technicians and DirecTV / satellite / broadband / AV technicians. Pick yours in Profile to tailor the platform.`,
    tab: 'profile',
    tabLabel: 'Open Profile'
  },
  {
    id: 'jobs',
    title: 'Jobs',
    keywords: ['job', 'jobs', 'hiring', 'apply', 'vacancy', 'vacancies', 'career', 'requisition', 'pharmacist', 'doctor', 'nurse', 'nursing', 'lawyer', 'judge', 'dentist', 'solar', 'directv', 'herbal'],
    answer: () =>
      `The **Jobs** tab lists openings across all enclaves. It defaults to **All** with filter pills per profession group — including healthcare (pharmacists, doctors, nurses, nursing techs, dentists, herbal medicine), legal (lawyers & judges), solar technicians and DirecTV/satellite/AV techs.\n\nYou can filter by enclave, search, and apply directly. Use **Resume Prep** to tailor your resume to a posting.`,
    tab: 'jobs',
    tabLabel: 'Open Jobs'
  },
  {
    id: 'analytics',
    title: 'Profile analytics',
    keywords: ['analytics', 'profile views', 'who viewed', 'reach', 'impressions', 'insights', 'search appearances', 'stats'],
    answer: () =>
      `**Analytics** is tailored to your profile: metrics, viewer types, search queries and reach change with your profession (for example, a nurse sees healthcare recruiters and clinical search terms, while an electrician sees contractors and trade queries).`,
    tab: 'profile',
    tabLabel: 'View My Profile'
  },
  {
    id: 'messaging',
    title: 'Messaging',
    keywords: ['message', 'messages', 'messaging', 'dm', 'chat', 'inbox', 'compose', 'msgs', 'vibechat'],
    answer: () =>
      `**Messaging** supports direct messages with real-time delivery between members and a floating **New Message** compose popup (LinkedIn-style). Unread incoming DMs pop up automatically. **VibeChat** (More menu) is the team/community chat space.`,
    tab: 'messaging',
    tabLabel: 'Open Messaging'
  },
  {
    id: 'network',
    title: 'Network & connections',
    keywords: ['network', 'connection', 'connections', 'connect with', 'follow', 'invitation', 'invitations', 'people you may know', 'grow my network'],
    answer: () =>
      `The **Network** tab shows your connections, invitations and suggested people. The **My Connections** count always matches your actual connection list, and adding or removing a connection is saved.`,
    tab: 'network',
    tabLabel: 'Open Network'
  },
  {
    id: 'notifications',
    title: 'Alerts / notifications',
    keywords: ['alert', 'alerts', 'notification', 'notifications', 'bell'],
    answer: () =>
      `**Alerts** collects activity on your posts, connection requests, job matches and system notices. The red badge on the bell clears after you open the tab.`,
    tab: 'notifications',
    tabLabel: 'Open Alerts'
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    keywords: ['marketplace', 'market', 'buy', 'sell', 'seller', 'seller center', 'solutions', 'products', 'shop', 'storefront'],
    answer: () =>
      `The **Marketplace** lets members and companies list and buy tools, equipment, services and enterprise solutions. Sellers manage listings in **Seller Center**; payments and payouts run through your **Wallet**.`,
    tab: 'marketplace',
    tabLabel: 'Open Marketplace'
  },
  {
    id: 'learning',
    title: 'Learning & labs',
    keywords: ['learn', 'learning', 'course', 'courses', 'training', 'labs', 'lab', 'certification', 'masterclass', 'xp', 'mentorship', 'mentor'],
    answer: () =>
      `**Learning** has courses and masterclasses, hands-on **Labs** (with XP), and **Mentorship**. Content is tailored to your profession enclave.`,
    tab: 'learning',
    tabLabel: 'Open Learning'
  },
  {
    id: 'media',
    title: 'Media & Pulse',
    keywords: ['media', 'video', 'videos', 'pulse', 'pulse rooms', 'pulserooms', 'live room', 'podcast', 'watercooler', 'studio'],
    answer: () =>
      `**Media** hosts videos and creator content (with a video studio). **Pulse Rooms** are live community rooms for real-time discussion, and the **Watercooler** is the casual hangout space.`,
    tab: 'media',
    tabLabel: 'Open Media'
  },
  {
    id: 'companies',
    title: 'Companies, Guilds, Bounties, Events, RFPs',
    keywords: ['company', 'companies', 'guild', 'guilds', 'bounty', 'bounties', 'event', 'events', 'rfp', 'rfps', 'procurement', 'launchpad', 'startup', 'startups', 'advisory'],
    answer: () =>
      `From the **More** menu:\n• **Companies** — company pages and verification.\n• **Guilds** — professional communities.\n• **Bounties** — paid tasks and challenges.\n• **Events** — webinars and meetups.\n• **RFPs / Procurement** — publish and respond to requests for proposals.\n• **Launchpad / Startups** — founders and early-stage ventures.\n• **Advisory** — expert consulting.`,
    tab: 'company',
    tabLabel: 'Open Companies'
  },
  {
    id: 'resume',
    title: 'Resume Prep / Career Suite',
    keywords: ['resume', 'cv', 'career suite', 'resume prep', 'cover letter', 'ats'],
    answer: () =>
      `**Resume Prep** (Career Suite) tailors your resume to a job description with ATS-friendly keywords. Open it from the More menu or Jobs.`,
    tab: 'careersuite',
    tabLabel: 'Open Resume Prep'
  },
  {
    id: 'wallet',
    title: 'Wallet & payments',
    keywords: ['wallet', 'payment', 'payments', 'payout', 'balance', 'money', 'earn', 'compensation', 'pay'],
    answer: () =>
      `The **Wallet** holds your balance for marketplace sales, bounties and services, and lets you manage payouts. **Compensation** tools show pay benchmarks for your profession.`,
    tab: 'wallet',
    tabLabel: 'Open Wallet'
  },
  {
    id: 'verification',
    title: 'Verification',
    keywords: ['verify', 'verification', 'verified', 'badge', 'credential', 'credentials', 'license', 'verified badge', 'trust'],
    answer: () =>
      `Members can submit **verification** requests — government ID, employer/work email, professional credentials (e.g., CISSP, state licenses) or organization official status. Admins review them in the **Verification Queue** and can **Approve, Reject, Request Info or Reopen**. Approved members get a verified badge. The **Trust Center** explains how verification works.`,
    tab: 'trustcenter',
    tabLabel: 'Open Trust Center'
  },
  {
    id: 'security',
    title: 'Account & security',
    keywords: ['security', 'password', 'mfa', '2fa', 'sign in', 'login', 'log in', 'google sso', 'account', 'privacy', 'delete account', 'sso'],
    answer: () =>
      `Sign in with Google SSO, email or phone. Manage security, sessions and privacy under **Me → Account & Security**. Admins can require email OTP verification and phone MFA.`,
    tab: 'accountsecurity',
    tabLabel: 'Open Account Security'
  },
  {
    id: 'admin',
    title: 'Admin & governance',
    keywords: ['admin', 'administrator', 'moderation', 'audit', 'audit log', 'audit ledger', 'rbac', 'roles', 'user management', 'platform config', 'feature flag', 'governance', 'siem'],
    answer: () =>
      `**Platform Administration & Governance** (admins only) includes: Dashboard & Metrics, User Activity Log, User Management, Content & Feed, Moderation Center, Companies & Orgs, Jobs & Recruiting, **Verification Queue**, Platform Config (feature flags), Roles & RBAC, an immutable **Audit Ledger** (exportable as JSON) and Security/SIEM.`,
    tab: 'adminiam',
    tabLabel: 'Open Admin Console'
  },
  {
    id: 'ai',
    title: 'Noctis AI',
    keywords: ['noctis', 'ai', 'assistant', 'ask noctis', 'vibe', 'ai agents', 'q&a'],
    answer: () =>
      `**Noctis** is the built-in AI assistant (Q&A, prediction desk and technical analysis). Ask it about ConnectLn features, your profession, jobs, resumes, compliance or technical topics. **AI Agents** and the **Vibe** studio offer deeper automation.`,
    tab: 'aiagents',
    tabLabel: 'Open AI Agents'
  },
  {
    id: 'languages',
    title: 'Languages & theme',
    keywords: ['language', 'languages', 'translate', 'dark mode', 'theme', 'light mode', 'arabic', 'spanish', 'german'],
    answer: () =>
      `ConnectLn is multilingual (the language switcher updates the UI and Noctis) and supports light and dark themes from the top bar.`
  },
  {
    id: 'support',
    title: 'Help & contact',
    keywords: ['help', 'support', 'contact', 'report', 'bug', 'problem', 'issue', 'feedback'],
    answer: () =>
      `For help, ask Noctis, visit the **Trust Center**, or contact a platform admin. You can report posts or members from their menu, and moderators review reports in the Moderation Center.`
  },
  {
    id: 'site',
    title: 'Where to use it',
    keywords: ['url', 'website', 'link', 'site', 'domain', 'address', 'app'],
    answer: () => `ConnectLn lives at **https://www.connectln.app**.`
  }
]

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'do', 'i', 'how', 'can', 'what', 'does', 'of', 'in', 'on', 'my', 'me', 'for', 'and', 'or', 'it', 'with', 'about', 'tell', 'you', 'we'])

/** Returns the best-matching topic, or null if nothing is relevant. */
export function findConnectLnTopic(question: string): KnowledgeTopic | null {
  const q = question.toLowerCase()
  const words = q.split(/[^a-z0-9&]+/).filter((w) => w && !STOP.has(w))
  let best: KnowledgeTopic | null = null
  let bestScore = 0
  for (const topic of CONNECTLN_TOPICS) {
    let score = 0
    for (const kw of topic.keywords) {
      if (kw.includes(' ')) {
        if (q.includes(kw)) score += 3
      } else if (words.includes(kw)) {
        score += 2
      }
    }
    // Generic brand-only topic should not beat specific ones
    if (topic.id === 'about') score = Math.min(score, 2)
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  return bestScore >= 2 ? best : null
}

/** Build a full overview used when the user asks "everything" about ConnectLn. */
export function connectLnOverview(): string {
  return CONNECTLN_TOPICS.filter((t) => ['about', 'navigation', 'professions', 'jobs', 'messaging', 'marketplace', 'learning', 'verification'].includes(t.id))
    .map((t) => `### ${t.title}\n${t.answer()}`)
    .join('\n\n')
}

/** Top-N relevant topics for grounding an external Noctis call. */
export function findConnectLnTopics(question: string, n = 3): KnowledgeTopic[] {
  const q = question.toLowerCase()
  const words = q.split(/[^a-z0-9&]+/).filter((w) => w && !STOP.has(w))
  return CONNECTLN_TOPICS.map((topic) => {
    let score = 0
    for (const kw of topic.keywords) {
      if (kw.includes(' ')) { if (q.includes(kw)) score += 3 } else if (words.includes(kw)) score += 2
    }
    return { topic, score }
  })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.topic)
}

/** Plain-text ConnectLn facts to ground Noctis so answers match the real product. */
export function connectLnGrounding(question: string): string {
  const topics = findConnectLnTopics(question, 3)
  const base = CONNECTLN_TOPICS.find((t) => t.id === 'about')!
  const nav = CONNECTLN_TOPICS.find((t) => t.id === 'navigation')!
  const picked = [base, ...(topics.some((t) => t.id === 'navigation') ? [] : [nav]), ...topics.filter((t) => t.id !== 'about')]
  return picked.map((t) => `${t.title}: ${t.answer().replace(/\*\*/g, '')}`).join('\n\n')
}
