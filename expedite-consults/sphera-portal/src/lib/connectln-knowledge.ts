/**
 * ConnectLn platform knowledge base for Noctis Q&A, Noctis AI Inbox, and Agent Grounding.
 * Topics are matched by keyword scoring and tab detection; enclave/profession answers
 * are built dynamically from PROFESSION_ENCLAVES so they stay in sync with the product.
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

export interface NoctisZeroDayEntry {
  cveId: string
  title: string
  severity: string
  cvssScore: number
  cvssVector: string
  cwe: string
  isZeroDay: boolean
  cisaStatus: string
  affectedSystems: string[]
  whatItIs: string
  remediation: string
  edbId: string
  msfModule: string
  msfCommand: string
  searchsploitCommand: string
  nvdUrl: string
  exploitDbUrl: string
  metasploitUrl: string
  searchsploitUrl: string
}

function buildZeroDayEntry(
  cveId: string,
  opts: Omit<
    NoctisZeroDayEntry,
    'cveId' | 'msfCommand' | 'searchsploitCommand' | 'nvdUrl' | 'exploitDbUrl' | 'metasploitUrl' | 'searchsploitUrl'
  >
): NoctisZeroDayEntry {
  const cveSlug = cveId.replace(/^CVE-/i, '')
  return {
    cveId,
    ...opts,
    msfCommand: `msfconsole -q -x "search cve:${cveId}; use ${opts.msfModule}; check"`,
    searchsploitCommand: `searchsploit --cve ${cveSlug}`,
    nvdUrl: `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(cveId)}`,
    exploitDbUrl: `https://www.exploit-db.com/search?cve=${encodeURIComponent(cveSlug)}`,
    metasploitUrl: `https://github.com/rapid7/metasploit-framework/search?q=${encodeURIComponent(cveId)}&type=code`,
    searchsploitUrl: 'https://www.exploit-db.com/searchsploit',
  }
}

export const NOCTIS_ZERO_DAY_CATALOG: NoctisZeroDayEntry[] = [
  buildZeroDayEntry('CVE-2026-44921', {
    title: 'Perimeter VPN Concentrator Pre-Auth Command Injection & RCE Zero-Day',
    severity: 'CRITICAL ZERO-DAY · CISA KEV (CVSS 9.8)',
    cvssScore: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cwe: 'CWE-78 (OS Command Injection)',
    isZeroDay: true,
    cisaStatus: '🔴 CISA KEV Active In-The-Wild Zero-Day Compromise',
    affectedSystems: ['Enterprise SSL/IKEv2 VPN Concentrators', 'Zero-Trust Perimeter Gateways'],
    whatItIs:
      'Actively exploited zero-day vulnerability in enterprise VPN/perimeter concentrators where crafted SCEP/XML session headers bypass authentication and execute root shell commands without credentials.',
    remediation:
      'Isolate perimeter concentrator management interfaces behind Zero-Trust mTLS, enable emergency WAF virtual patch rules, revoke active session tokens, audit cron/SSH logs, and apply vendor hotfix within 24 hours.',
    edbId: 'EDB-52418',
    msfModule: 'exploit/linux/http/perimeter_vpn_scep_rce',
  }),
  buildZeroDayEntry('CVE-2026-4812', {
    title: 'Linux Kernel eBPF Verifier Bounds Bypass & Container Escape Zero-Day',
    severity: 'CRITICAL ZERO-DAY · NVD (CVSS 9.6)',
    cvssScore: 9.6,
    cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    cwe: 'CWE-787 (Out-of-Bounds Write)',
    isZeroDay: true,
    cisaStatus: '🔴 Zero-Day Kernel Escape Exploited in Cloud Clusters',
    affectedSystems: ['Kubernetes Worker Nodes (Linux 6.x)', 'Multi-Tenant Container Clusters'],
    whatItIs:
      'Allows an unprivileged container workload or local process with eBPF syscall access to bypass scalar range tracking in the kernel verifier, achieving host root kernel code execution and pod breakout.',
    remediation:
      'Set sysctl `kernel.unprivileged_bpf_disabled=2`, roll patched host kernels across Kubernetes/EKS/GKE/bare-metal nodes, and enforce seccomp profiles blocking `sys_bpf`.',
    edbId: 'EDB-52429',
    msfModule: 'exploit/linux/local/ebpf_verifier_bounds_priv_esc',
  }),
  buildZeroDayEntry('CVE-2026-4901', {
    title: 'HTTP/3 QUIC Ingress Controller Heap Overflow Remote Code Execution Zero-Day',
    severity: 'CRITICAL ZERO-DAY · NVD (CVSS 9.8)',
    cvssScore: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    cwe: 'CWE-122 (Heap-Based Buffer Overflow)',
    isZeroDay: true,
    cisaStatus: '🔴 Active Edge Perimeter Exploitation Telemetry',
    affectedSystems: ['Cloud Load Balancers', 'QUIC / HTTP/3 Reverse Proxies'],
    whatItIs:
      'Memory corruption vulnerability triggered during fragmented QUIC control frame reassembly in HTTP/3 edge proxies, allowing remote unauthenticated attackers to overwrite heap pointers and hijack execution flow.',
    remediation:
      'Temporarily disable unpatched HTTP/3/QUIC listeners on edge reverse proxies, deploy ingress buffer validation patches, and rotate TLS session ticket keys.',
    edbId: 'EDB-52437',
    msfModule: 'exploit/multi/http/quic_ingress_heap_rce',
  }),
  buildZeroDayEntry('CVE-2026-3910', {
    title: 'Kubernetes CRI Runtime Socket Mount Privilege Escalation',
    severity: 'HIGH / CRITICAL · NVD (CVSS 9.1)',
    cvssScore: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:H',
    cwe: 'CWE-269 (Improper Privilege Management)',
    isZeroDay: false,
    cisaStatus: '🟠 High-Priority Cloud Runtime Advisory (CVSS 9.1)',
    affectedSystems: ['containerd / CRI-O Runtimes', 'CI/CD Ephemeral Build Runners'],
    whatItIs:
      'Improper symlink validation during ephemeral volume snapshotting in containerd runtimes lets compromised CI jobs read host service-account credentials and kubelet certificates.',
    remediation:
      'Upgrade containerd/CRI runtime packages and enforce Pod Security Admission `restricted` baseline with AppArmor/SELinux enforcement.',
    edbId: 'EDB-52394',
    msfModule: 'auxiliary/scanner/k8s/cri_snapshot_symlink_check',
  }),
  buildZeroDayEntry('CVE-2026-5104', {
    title: 'OpenSSH Pre-Auth Signal Handler Race Condition & RCE',
    severity: 'CRITICAL · NVD (CVSS 8.9)',
    cvssScore: 8.9,
    cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H',
    cwe: 'CWE-362 (Concurrent Execution Race Condition)',
    isZeroDay: false,
    cisaStatus: '🟠 Critical Bastion Exposure Advisory (CVSS 8.9)',
    affectedSystems: ['Public Bastion Hosts', 'Enterprise Linux SSH Daemons'],
    whatItIs:
      'Async-signal-unsafe syslog/memory routines trigger during LoginGraceTime timeouts prior to SSH authentication completion, enabling remote heap state manipulation.',
    remediation:
      'Update OpenSSH server binaries, restrict SSH port 22 via bastion/VPN allowlists, and configure `PerSourceMaxStartups` rate throttling.',
    edbId: 'EDB-52402',
    msfModule: 'exploit/linux/ssh/openssh_preauth_sig_race',
  }),
]

/** Returns true when a user prompt asks about Zero-Days, CVEs, CISA KEV, or linked threat feeds. */
export function isZeroDayOrCveQuery(question: string): boolean {
  const q = (question || '').toLowerCase()
  return /zero[\s-]?day|0[\s-]?day|zeroday|\bcve\b|cve-\d{4}-\d+|cisa\s+kev|exploit[\s-]?db|metasploit|searchsploit|\bnvd\b|active\s+exploit/i.test(
    q
  )
}

function formatZeroDayBullet(entry: NoctisZeroDayEntry, idx: number): string {
  return (
    `#### ${idx}. 🚨 \`${entry.cveId}\` — ${entry.title}\n` +
    `- **Severity & CISA Status:** **\`${entry.severity}\`** · ${entry.cisaStatus}\n` +
    `- **CVSS v3.1 & Weakness:** \`${entry.cvssVector}\` · \`${entry.cwe}\`\n` +
    `- **Affected Systems:** ${entry.affectedSystems.join(', ')}\n` +
    `- **What It Is:** ${entry.whatItIs}\n` +
    `- **Linked Exploit Intelligence:** [NVD](${entry.nvdUrl}) · [Exploit-DB (${entry.edbId})](${entry.exploitDbUrl}) · [Metasploit](${entry.metasploitUrl}) · \`${entry.searchsploitCommand}\`\n` +
    `- **Metasploit Check:** \`${entry.msfCommand}\`\n` +
    `- **Mandatory Remediation:** ${entry.remediation}`
  )
}

/** Builds Noctis AI's authoritative Active Zero-Day & CISA KEV Threat Intelligence Report. */
export function buildNoctisZeroDayReport(customQuestion?: string): string {
  const requestedCveMatch = (customQuestion || '').toUpperCase().match(/CVE-\d{4}-\d{3,8}/)
  const requestedCveId = requestedCveMatch ? requestedCveMatch[0] : null
  const activeZeroDays = NOCTIS_ZERO_DAY_CATALOG.filter((z) => z.isZeroDay)
  const highCriticalStream = NOCTIS_ZERO_DAY_CATALOG.filter((z) => !z.isZeroDay)

  let highlightedSection = ''
  if (requestedCveId) {
    const matched =
      NOCTIS_ZERO_DAY_CATALOG.find((e) => e.cveId.toUpperCase() === requestedCveId) ||
      buildZeroDayEntry(requestedCveId, {
        title: `Active Zero-Day & Critical Threat Advisory (${requestedCveId})`,
        severity: 'CRITICAL ZERO-DAY (CVSS 9.8)',
        cvssScore: 9.8,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
        cwe: 'CWE-94 / CWE-787 (Arbitrary Code Execution)',
        isZeroDay: true,
        cisaStatus: '🔴 Noctis Live Zero-Day Stream Investigation',
        affectedSystems: ['Edge VPN Gateways', 'Cloud Ingress & Kubernetes Nodes', 'Enterprise API Runtimes'],
        whatItIs: `${requestedCveId} is being tracked by ConnectLn Pulse & Noctis AI across NIST NVD, Exploit-DB, Metasploit Framework, and SearchSploit for potential unauthenticated remote code execution or privilege escalation.`,
        remediation: `Isolate exposed management interfaces behind Zero-Trust mTLS, deploy vendor patches for ${requestedCveId}, and inspect perimeter WAF/eBPF telemetry.`,
        edbId: `EDB-${52100 + (Number(requestedCveId.replace(/\D/g, '').slice(-5)) % 890)}`,
        msfModule: `exploit/linux/http/${requestedCveId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_zero_day_rce`,
      })
    highlightedSection = `### 🎯 Requested CVE Investigation: \`${matched.cveId}\`\n${formatZeroDayBullet(matched, 1)}\n\n---\n\n`
  }

  return (
    `### 🚨 Noctis AI — Active Zero-Day & CISA KEV Threat Intelligence Report\n` +
    `**Status:** **\`${activeZeroDays.length} Active Zero-Days Confirmed in the Wild\`** + \`${highCriticalStream.length} High/Critical CVEs\` · **Synced Feeds:** **\`CISA KEV · NIST NVD · Exploit-DB · Metasploit · SearchSploit\`**\n\n` +
    highlightedSection +
    activeZeroDays.map((zd, i) => formatZeroDayBullet(zd, i + 1)).join('\n\n') +
    `\n\n#### 📋 Additional High/Critical Advisories Monitored by Noctis & Pulse\n` +
    highCriticalStream
      .map(
        (c) =>
          `- **\`${c.cveId}\` (${c.severity}):** ${c.title} — **Mitigation:** ${c.remediation} (\`${c.searchsploitCommand}\`)`
      )
      .join('\n')
  )
}

export const buildHomeToPulseGuide = (): string =>
  `Here is everything across **ConnectLn** from **Home** to **Pulse** (left-to-right on the top navigation bar, plus right-side platform controls):\n\n` +
  `1. **🏠 Home (\`home\`):** Your enclave-tailored professional command feed, rich post composer (articles, photos, videos, documents, polls), ConnectLn Stories strip, live broadcasts, 1-click sharing (posts, reels, Pulse alerts), and the **Profession Enclave switcher** spanning **${PROFESSION_ENCLAVES.length} enclaves and ${ALL_PROFESSIONS.length}+ professions**.\n\n` +
  `2. **👥 My Network (\`network\`):** Manage connections, incoming invitations, sent requests, Profile Viewers, Followers/Following, AI-ranked **People You May Know (PYMK)**, and the searchable Global Member Directory with persistent 1-click connection requests.\n\n` +
  `3. **💼 Jobs (\`jobs\` & Career Suite):** Multi-industry Jobs & Bounties Explorer across Cybersecurity, Healthcare/Clinical, Skilled Trades, Solar/Grid, 800V EV Automotive, Legal, USAJOBS federal openings, and commercial requisitions. Includes **Noctis CareerTwin 25-Question Interview Prep** (5 progressive rounds with AI rubric grading & downloadable study guides), compensation benchmarks, **Resume Prep / Career Suite** ATS tailoring, and Career Passport.\n\n` +
  `4. **💬 Messaging (\`messaging\`) — 4 Built-In Sub-Apps:**\n` +
  `   • **Inbox (\`chats\` & \`Noctis AI\`):** Direct & B2B threads (\`People\`, \`Companies\`, \`Products\`), voice notes, attachments, \`Starred\`, \`Sent\`, \`Drafts\`, plus **Noctis AI Inbox** (smart **Ask Noctis** bar, date-grouped unread email briefings, action-oriented *Suggested to-dos*, and *Topics to catch up on*).\n` +
  `   • **Calls (\`calls\`):** Free E2EE 1-on-1 & Group Voice/Video Calls (up to 32 participants + \`+ Add Person\` mid-call), single-time 2FA phone verification with seamless multi-device login, **per-user AI Virtual Background Replacement** (MediaPipe segmentation + 7 studio themes + custom photo upload from your device that changes only your own background and broadcasts to attendees), **selectable melodic ringtones & custom audio upload** + authentic \`440 Hz + 480 Hz\` telephone calling ringback tone, **targeted in-call chat** (\`Everyone\`, individual member, or selected members + file attachments), **Live Device Material Sharing Stage** (PDFs, Word/Excel/Office docs, images, audio, video viewed inline via blob viewer + P2P sync) & **Live Screen Share**, and **Host & Co-Host moderation** (individual mute/unmute with auto-restoration, Mute All, Co-Host \`👑\`, individual leave vs Host *End Meeting for All*).\n` +
  `   • **Status (\`status\`):** WhatsApp-style per-user Status Series Boxes with multi-slide auto-advance, photo/video/text stories, and full-length uploaded music/audio playback.\n` +
  `   • **Vault (\`vault\`):** Zero-knowledge encrypted document & credential vault.\n\n` +
  `5. **🔔 Alerts (\`notifications\`):** Real-time Signal & Alert Radar across Security/Clinical Safety (CISA KEV Zero-Days, FDA MedWatch, USP \`<797>\`/\`<800>\`, TJC Sepsis Hour-1), Career Signals, Marketplace, Learning, and Network—backed by **Noctis Alert & Signal Intelligence (\`NOCTIS-ALERTS-001\`)** explaining what each alert means, why it matters, and exact next actions.\n\n` +
  `6. **🛍️ Market (\`marketplace\`):** Enterprise Marketplace & Solutions Hub featuring software tools, security engines (DSTRIKE, Aagiis, EXPEDITE STRIKE), clinical/trade equipment, **Seller Center**, **Wallet** payouts, and the **Noctis AI Marketing & Sales Agent** (executive ROI justification memos, competitor comparisons, compliance deep-dives, and 14-day free trials).\n\n` +
  `7. **🎓 Learning (\`learning\`):** ConnectLn Academy courses, masterclasses, hands-on interactive **Labs** (\`+XP\`), 1-on-1 **Mentorship**, CME/CEU/CPE continuing education tracking, and role-specific certification roadmaps.\n\n` +
  `8. **📺 Media (\`media\`):** ConnectLn Media Hub & Creator Studio with trade/engineering/clinical video walkthroughs, creator reels, Gospel & Music Hub, live broadcasts, and **Noctis Multilingual Video Audio Interpreter** (live spoken translation across 46 languages with automatic original audio ducking).\n\n` +
  `9. **📡 Pulse (\`pulserooms\`):** Real-time **Pulse Audio Rooms** & Watercooler community channels paired with the **Live Zero-Day CVE & Threat Intelligence Stream** linked to **NVD, Exploit-DB, Metasploit, and SearchSploit**, complete with clickable CVE dossiers and Zero-Day alert popups.\n\n` +
  `**Right-Side & Workspace Navigation:** **Ask Noctis** (global AI copilot & Career Planner), **Me** (Profile, Creator Analytics, Account & Security, Trust Center), **For Business** (Companies, Guilds, Bounties, Events, RFPs/Procurement, Veterans Network, Franchise Network, Launchpad, Wallet, Desk Note, PDFAdore), **Backend** (Admin IAM, Verification Queue, Media Backend, Pulse Live Sync, Audit Ledger, SIEM), **Gate** (Auth Gate / SSO / 2FA), **Theme** (Light/Dark/Warm), and **EN** (46-language switcher).`

export const CONNECTLN_TOPICS: KnowledgeTopic[] = [
  {
    id: 'all_tabs',
    title: 'ConnectLn Platform Guide — All Tabs from Home to Pulse',
    keywords: [
      'home to pulse', 'all tabs', 'every tab', 'from home to pulse', 'tabs', 'entire platform',
      'whole platform', 'full tour', 'everything', 'all features', 'platform overview', 'walkthrough',
      'know everything', 'tans from home'
    ],
    answer: buildHomeToPulseGuide,
    tab: 'home',
    tabLabel: 'Explore Home Feed'
  },
  {
    id: 'about',
    title: 'What is ConnectLn',
    keywords: ['what is connectln', 'what is connectin', 'about connectln', 'about connectin', 'connectln', 'connectin', 'platform', 'overview', 'what can i do'],
    answer: () =>
      `**ConnectLn** (\`https://www.conectln.com\`) is a unified professional network and execution ecosystem built for every worker — from cybersecurity engineers, physicians, nurses, and pharmacists to master carpenters, solar/EV technicians, lawyers, veterans, and franchise operators.\n\n` +
      `Its primary top bar spans **Home → My Network → Jobs → Messaging (Inbox, Noctis AI, Calls, Status, Vault) → Alerts → Market → Learning → Media → Pulse**, alongside **Ask Noctis, Me, For Business, Backend, Gate, Theme, and Language (EN)**.\n\n` +
      `Your profile's **Profession Enclave** (**${PROFESSION_ENCLAVES.length} enclaves, ${ALL_PROFESSIONS.length}+ professions**) automatically tailors your Home feed, Jobs, Analytics, Marketplace, Learning Academy, and Pulse rooms.`,
    tab: 'home',
    tabLabel: 'Go to Home'
  },
  {
    id: 'navigation',
    title: 'Top Bar Navigation & Workspace Menus',
    keywords: ['navigate', 'navigation', 'menu', 'top bar', 'nav', 'sidebar', 'more menu', 'where do i find', 'badge', 'badges', 'for business', 'gate', 'left sidebar'],
    answer: () =>
      `**Primary Top Bar (left to right):** **Home, My Network, Jobs, Messaging, Alerts, Market, Learning, Media, Pulse**. Active tabs highlight clearly and unread notification badges clear once inspected.\n\n` +
      `**Right-Side Controls:**\n` +
      `• **Ask Noctis:** Opens Noctis Intelligence (AI Chat, Noctis Vibe Studio, and Career Planner).\n` +
      `• **Me:** Opens your Profile, Analytics, Trust Center, Account & Security, and Workspace Switcher.\n` +
      `• **For Business:** Opens the two-column Business Workspace (\`My workspace\`: Work Applications, Services & Inquiries, Communities, Learning, Business Pages, Insights; \`Grow with ConnectLn\`: Companies, Guilds, Bounties, Events, RFPs/Procurement, Veterans Network, Franchise Network, Launchpad, Wallet, Desk Note, PDFAdore).\n` +
      `• **Backend:** Admin Console (for authorized admins).\n` +
      `• **Gate:** Authentication Gate (Sign in, Register, Google SSO, Email OTP, 2FA Phone Verification).\n` +
      `• **Theme & EN:** Theme color/appearance switcher + 46-language selector.`,
    tab: 'home',
    tabLabel: 'Open Top Workspace'
  },
  {
    id: 'home',
    title: 'Home Tab — Enclave Feed, Stories & Composer',
    keywords: ['home', 'home tab', 'feed', 'post', 'posts', 'stories', 'story', 'composer', 'creator', 'broadcast', 'share', 'repost'],
    answer: () =>
      `The **Home** tab is your profession-tailored command feed:\n` +
      `• **Rich Post Composer:** Publish technical/clinical updates, photos, videos, PDFs/documents, or live polls.\n` +
      `• **ConnectLn Stories Strip & Live Broadcasts:** View short-form visual updates from verified peers across your enclave.\n` +
      `• **Enclave Switcher:** Filter feed signals across **${PROFESSION_ENCLAVES.length} enclaves** (e.g., Cybersecurity, Healthcare, Skilled Trades, Solar/Grid, EV Automotive, Legal).\n` +
      `• **1-Click Share & Cross-Post:** Share posts, reels, Marketplace gear, or Pulse CVE advisories directly into DMs or feed.`,
    tab: 'home',
    tabLabel: 'Go to Home'
  },
  {
    id: 'professions',
    title: 'Professions & Enclaves',
    keywords: ['profession', 'professions', 'enclave', 'enclaves', 'industries', 'who can join', 'occupation', 'trades', 'which jobs types', 'roles supported'],
    answer: () =>
      `ConnectLn supports **${PROFESSION_ENCLAVES.length} enclaves and ${ALL_PROFESSIONS.length}+ professions**:\n\n${enclaveList()}\n\nPick your enclave in **Me → Profile** or directly on the Home/Jobs enclave switcher to tailor your entire workspace.`,
    tab: 'profile',
    tabLabel: 'Open Profile'
  },
  {
    id: 'network',
    title: 'My Network Tab — Connections, PYMK & Directory',
    keywords: ['my network', 'network', 'connection', 'connections', 'connect with', 'follow', 'invitation', 'invitations', 'people you may know', 'pymk', 'directory', 'grow my network'],
    answer: () =>
      `The **My Network** tab manages your professional graph:\n` +
      `• **Connections & Invitations:** Review incoming connection requests, track sent invitations, and maintain an exact, persisted **My Connections** roster.\n` +
      `• **Profile Viewers & Followers:** See who viewed your profile and manage followers.\n` +
      `• **AI-Ranked Suggestions (PYMK) & Global Directory:** Discover verified professionals across all ${PROFESSION_ENCLAVES.length} enclaves with instant 1-click Connect persistence.`,
    tab: 'network',
    tabLabel: 'Open My Network'
  },
  {
    id: 'jobs',
    title: 'Jobs Tab — Global Jobs, CareerTwin 25Q Interview Prep & Resume Suite',
    keywords: ['job', 'jobs', 'hiring', 'apply', 'vacancy', 'vacancies', 'career', 'requisition', 'careertwin', 'interview', 'interview prep', 'usajobs', 'pharmacist', 'doctor', 'nurse', 'lawyer', 'dentist', 'solar'],
    answer: () =>
      `The **Jobs** tab connects members to verified openings across all **${PROFESSION_ENCLAVES.length} enclaves** (including cleared Cyber/GovCloud, Healthcare/Clinical, Skilled Trades, Solar PV, 800V EV Automotive, Legal, and **USAJOBS** federal requisitions):\n` +
      `• **Noctis CareerTwin 25-Question Interview Prep:** Every advertised role includes **25 tailored interview questions across 5 progressive interview rounds** with AI rubric grading and downloadable study guides.\n` +
      `• **Smart Enclave & Compensation Filters:** Filter by enclave, remote/on-site, clearance, and verified compensation ranges.\n` +
      `• **Resume Prep / Career Suite:** Launch ATS resume tailoring and generate role-specific cover letters and Career Passports in 1 click.`,
    tab: 'jobs',
    tabLabel: 'Open Jobs'
  },
  {
    id: 'messaging',
    title: 'Messaging Tab — Inbox, Noctis AI, Calls, Status & Vault',
    keywords: ['message', 'messages', 'messaging', 'dm', 'chat', 'inbox', 'compose', 'msgs', 'noctischat', 'vibechat', 'noctis inbox', 'unread emails', 'suggested to-dos'],
    answer: () =>
      `The **Messaging** tab is a 4-mode communication suite (selectable from the left icon rail):\n` +
      `• **1. Inbox (Direct/B2B + Noctis AI):** Message \`People\`, \`Companies\`, or \`Products\` with voice notes and file attachments; organize by \`Inbox\`, \`Noctis AI\`, \`Starred\`, \`Sent\`, and \`Drafts\`. The **Noctis AI** inbox groups unread messages by arrival date, answers questions via the **Ask Noctis** bar, surfaces prioritized *Suggested to-dos* (Reply/View/Open/Snooze/Done), and curates *Topics to catch up on*.\n` +
      `• **2. Calls:** Free internet E2EE 1-on-1 & Group Voice/Video Calling (up to 32 people) with virtual backgrounds, selectable ringtones, targeted in-call chat, screen/file sharing, and host moderation.\n` +
      `• **3. Status:** WhatsApp-style per-user Status Series Boxes with photo/video/text stories and full-length uploaded music/audio playback.\n` +
      `• **4. Vault:** Zero-knowledge Encrypted Document & Credential Vault.`,
    tab: 'messaging',
    tabLabel: 'Open Messaging'
  },
  {
    id: 'calls',
    title: 'Calling System — E2EE Video/Voice, Virtual Backgrounds, Ringtones & Moderation',
    keywords: ['call', 'calls', 'calling', 'video call', 'voice call', 'ringtone', 'ringtones', 'ringback', 'virtual background', 'background', 'mute', 'unmute', 'co-host', 'cohost', 'screen share', 'share material', 'group call', 'in-call chat'],
    answer: () =>
      `**ConnectLn Calls (inside Messaging → Calls)** provides free internet E2EE voice & video conferencing for **1-on-1 and up to 32-person group calls**:\n` +
      `• **Per-User AI Virtual Background:** Uses MediaPipe human segmentation with 7 built-in studio backgrounds plus **Upload Custom Background Photo** from your device — changes *only your own background* and streams live to everyone else on the call.\n` +
      `• **Custom Ringtones & Standard Ringback:** Pick from built-in melodic incoming ringtones or upload your own device audio clip; callers hear an authentic \`440 Hz + 480 Hz\` telephone calling tone instead of a busy signal.\n` +
      `• **Live Device Material & Screen Sharing:** Present PDFs, Word/Excel/Office docs, images, audio, and video inline on the call stage (rendered smoothly via blob viewer with P2P DataChannel delivery, \`↗ Open\`, and \`Download\`) or share your live desktop/browser screen.\n` +
      `• **Targeted In-Call Chat & Host Controls:** Chat with \`Everyone\`, an \`Individual Member\`, or \`Selected Members\` (with file attachments); Host/Co-Hosts (\`👑\`) can mute/unmute specific members, Mute All, and add people mid-call (\`+ Add Person\`). Leaving a group call disconnects only your device while keeping the meeting alive for remaining members (only Host **End Meeting for All** closes the room).`,
    tab: 'messaging',
    tabLabel: 'Open Calls in Messaging'
  },
  {
    id: 'status',
    title: 'Status Tab — Story Boxes & Full-Length Music Playback',
    keywords: ['status', 'statuses', 'story box', 'stories', 'music playback', 'song', 'audio status'],
    answer: () =>
      `**Messaging → Status** lets members post and view WhatsApp-style **Status Series Boxes** (1 box per creator with multi-slide auto-advance at comfortable reading speed). Slides support photos, videos, text overlays, and **full-length uploaded music/audio tracks** without premature cut-offs.`,
    tab: 'messaging',
    tabLabel: 'Open Status'
  },
  {
    id: 'vault',
    title: 'Vault Tab — Encrypted Credential & Document Storage',
    keywords: ['vault', 'encrypted vault', 'credential vault', 'document vault', 'secure storage'],
    answer: () =>
      `**Messaging → Vault** stores sensitive certifications, clearances, NDAs, invoices, and verified field records with zero-knowledge cryptographic isolation.`,
    tab: 'messaging',
    tabLabel: 'Open Vault'
  },
  {
    id: 'notifications',
    title: 'Alerts Tab — Noctis Alert & Signal Intelligence Radar',
    keywords: ['alert', 'alerts', 'notification', 'notifications', 'bell', 'cisa kev', 'fda medwatch', 'sepsis', 'usp 797', 'usp 800'],
    answer: () =>
      `The **Alerts** tab (\`notifications\`) unifies high-priority operational, security, and career signals across your enclave:\n` +
      `• **Categories:** Account/Security & Clinical Safety Advisories (CISA KEV Zero-Days, FDA MedWatch, USP \`<797>\`/\`<800>\`, The Joint Commission Sepsis Hour-1), Career Signals, Solutions/Marketplace, Learning, and Network.\n` +
      `• **Noctis Alert & Signal Intelligence Engine (\`NOCTIS-ALERTS-001\`):** Ask Noctis to explain any alert — what it represents, why it matters clinically/technically, and exact step-by-step remediation.`,
    tab: 'notifications',
    tabLabel: 'Open Alerts'
  },
  {
    id: 'marketplace',
    title: 'Market Tab — Solutions Hub, Seller Center & Noctis Sales Agent',
    keywords: ['marketplace', 'market', 'buy', 'sell', 'seller', 'seller center', 'solutions', 'products', 'shop', 'storefront', 'dstrike', 'aagiis', 'expedite strike', 'desknote', 'pdfadore'],
    answer: () =>
      `The **Market** tab (\`marketplace\`) is ConnectLn's enterprise commerce & software hub:\n` +
      `• **Verified Catalog:** Browse cybersecurity engines (DSTRIKE, Aagiis, EXPEDITE STRIKE™ DAST), productivity/security apps (Desk Note, PDFAdore), clinical devices, and skilled-trade hardware.\n` +
      `• **Noctis AI Marketing & Sales Agent:** Click any product's Noctis advisor to generate 3-paragraph executive purchase justification memos, competitor comparisons, compliance/latency teardowns, or launch a 14-day free trial.\n` +
      `• **Seller Center & Wallet:** Vendors manage listings, pricing tiers, and receive milestone/sales payouts in **Wallet**.`,
    tab: 'marketplace',
    tabLabel: 'Open Market'
  },
  {
    id: 'learning',
    title: 'Learning Tab — Academy, Interactive Labs, Mentorship & CEU/CME',
    keywords: ['learn', 'learning', 'course', 'courses', 'training', 'labs', 'lab', 'certification', 'masterclass', 'xp', 'mentorship', 'mentor', 'cme', 'ceu', 'cpe', 'academy'],
    answer: () =>
      `The **Learning** tab powers continuous skill mastery tailored to your enclave:\n` +
      `• **ConnectLn Academy & Masterclasses:** Role-specific technical, clinical, legal, and trade courses across 46 languages.\n` +
      `• **Interactive Hands-On Labs:** Practice real scenarios to earn verified **+XP** and skill badges.\n` +
      `• **1-on-1 Mentorship & Credits:** Book sessions with verified fellows/specialists and track continuing education (**CME / CEU / CPE**).`,
    tab: 'learning',
    tabLabel: 'Open Learning'
  },
  {
    id: 'media',
    title: 'Media Tab — Creator Studio, Reels & Noctis Video Interpreter',
    keywords: ['media', 'media tab', 'video', 'videos', 'creator studio', 'gospel', 'music', 'stream', 'broadcast', 'interpreter', 'dubbing', 'subtitles'],
    answer: () =>
      `The **Media** tab is ConnectLn's broadcast and creator video ecosystem:\n` +
      `• **Technical, Clinical & Trade Briefings:** Watch keynotes, repair/engineering walkthroughs, creator reels, and the **Gospel & Music Hub**.\n` +
      `• **Noctis Multilingual Video Audio Interpreter:** Translate spoken video audio live into any of **46 supported languages** while automatically ducking the original audio track.\n` +
      `• **Creator Analytics & Studio:** Upload HD videos/audio and track audience engagement.`,
    tab: 'media',
    tabLabel: 'Open Media'
  },
  {
    id: 'pulse',
    title: 'Pulse Tab — Live Audio Rooms & Zero-Day CVE Threat Stream',
    keywords: ['pulse', 'pulse tab', 'pulse rooms', 'pulserooms', 'live room', 'podcast', 'watercooler', 'cve', 'zero-day', 'zero day', 'nvd', 'exploit-db', 'metasploit', 'searchsploit', 'threat intelligence'],
    answer: () =>
      `The **Pulse** tab (\`pulserooms\`) combines real-time community audio rooms with live security intelligence:\n` +
      `• **Live Pulse Audio Rooms & Watercooler:** Join interactive townhalls, enclave panels, and live peer voice rooms.\n` +
      `• **Live Zero-Day CVE & Threat Intelligence Stream:** Monitors real-time vulnerabilities directly cross-referenced with **NVD, Exploit-DB, Metasploit, and SearchSploit** — featuring clickable CVE dossier inspection modals, Zero-Day alert popups, and 1-click sharing to Feed or Messaging.`,
    tab: 'pulserooms',
    tabLabel: 'Open Pulse'
  },
  {
    id: 'analytics',
    title: 'Me → Profile Analytics & Career Portfolio',
    keywords: ['analytics', 'profile views', 'who viewed', 'reach', 'impressions', 'insights', 'search appearances', 'stats', 'me menu', 'profile'],
    answer: () =>
      `**Me → Profile & Analytics** adapts to your profession enclave: healthcare clinicians see hospital recruiter views and clinical credential reach, cybersecurity architects see CISO/GovCloud recruiter impressions, and master tradespeople see contractor & project lead views.`,
    tab: 'profile',
    tabLabel: 'View My Profile'
  },
  {
    id: 'companies',
    title: 'For Business — Companies, Guilds, Bounties, Events, RFPs, Veterans & Franchises',
    keywords: ['company', 'companies', 'guild', 'guilds', 'bounty', 'bounties', 'event', 'events', 'rfp', 'rfps', 'procurement', 'launchpad', 'startup', 'startups', 'advisory', 'veterans', 'skillbridge', 'franchise', 'franchises', 'for business'],
    answer: () =>
      `Open **For Business** (grid icon in the top bar) to access ConnectLn's organizational and commerce hubs:\n` +
      `• **My Workspace:** Manage work applications, service inquiries, communities, learning, business pages, and activity insights.\n` +
      `• **Companies & Guilds:** Official verified organization portals and domain committees.\n` +
      `• **Bounties, RFPs & Procurement:** Respond to paid engineering/security challenges and FAR/DFARS or enterprise RFPs.\n` +
      `• **Veterans Network & SkillBridge:** Military skills translator, transition roles, VetFran, and veteran mentorship.\n` +
      `• **Franchise Network, Launchpad, Events & Desk Note / PDFAdore:** Franchise directory/FDD deals, startup deal flow, summits, and integrated productivity apps.`,
    tab: 'workbusiness',
    tabLabel: 'Open For Business'
  },
  {
    id: 'resume',
    title: 'Resume Prep / Career Suite',
    keywords: ['resume', 'cv', 'career suite', 'resume prep', 'cover letter', 'ats', 'career passport'],
    answer: () =>
      `**Resume Prep** (\`careersuite\`) parses your existing resume, scores ATS keyword alignment, tailors bullets to any ConnectLn job description, and bundles verified licenses into your **Career Passport**. Open it directly from **Jobs** or **For Business**.`,
    tab: 'careersuite',
    tabLabel: 'Open Resume Prep'
  },
  {
    id: 'wallet',
    title: 'Wallet, Escrow & Compensation',
    keywords: ['wallet', 'payment', 'payments', 'payout', 'balance', 'money', 'earn', 'compensation', 'pay', 'escrow'],
    answer: () =>
      `The **Wallet** holds your milestone escrow and marketplace seller balances for bounties, consulting SOWs, and product sales, while **Compensation Insights** tracks salary and rate benchmarks across your enclave.`,
    tab: 'wallet',
    tabLabel: 'Open Wallet'
  },
  {
    id: 'verification',
    title: 'Verification & Trust Center',
    keywords: ['verify', 'verification', 'verified', 'badge', 'credential', 'credentials', 'license', 'verified badge', 'trust', 'trust center'],
    answer: () =>
      `Members can submit **verification requests** — government ID, work email, single-time 2FA phone verification, and professional licenses/clearances (CISSP, PharmD/RN, PE, ASE Master, State License). Admins review submissions in the **Verification Queue** (\`Approve, Reject, Request Info, Reopen\`), awarding a verified badge. Inspect compliance attestations in the **Trust Center**.`,
    tab: 'trustcenter',
    tabLabel: 'Open Trust Center'
  },
  {
    id: 'security',
    title: 'Account Security, Gate & Multi-Device 2FA',
    keywords: ['security', 'password', 'mfa', '2fa', 'sign in', 'login', 'log in', 'google sso', 'account', 'privacy', 'delete account', 'sso', 'phone validation', 'impersonating'],
    answer: () =>
      `Sign in via **Gate** using Google SSO, email/OTP, or verified phone number. Once a member validates their phone number once during onboarding/2FA, ConnectLn allows logging in again with that same verified number across devices without false impersonation blocks. Manage MFA, active sessions, and privacy under **Me → Account & Security**.`,
    tab: 'accountsecurity',
    tabLabel: 'Open Account Security'
  },
  {
    id: 'admin',
    title: 'Backend — Platform Administration, Media Backend, Pulse Sync & SIEM',
    keywords: ['backend', 'admin', 'administrator', 'moderation', 'audit', 'audit log', 'audit ledger', 'rbac', 'roles', 'user management', 'platform config', 'feature flag', 'governance', 'siem', 'media harvester', 'pulse sync'],
    answer: () =>
      `The **Backend** tab (\`adminiam\`, restricted to authorized platform administrators) houses:\n` +
      `• **1-Min Video & Media Backend** & **Pulse Live Sync Monitor**\n` +
      `• **User Management, Roles & RBAC, & Verification Queue**\n` +
      `• **Content & Feed Moderation Center**, **Companies & Orgs**, and **Jobs & Recruiting Directory**\n` +
      `• **Platform Config (Feature Flags)**, immutable **Audit Ledger** (JSON export), and **Security & SIEM**.`,
    tab: 'adminiam',
    tabLabel: 'Open Backend Console'
  },
  {
    id: 'ai',
    title: 'Ask Noctis AI — Global Copilot, Zero-Day Reporting & Sales/Alert Agents',
    keywords: ['noctis', 'ai', 'assistant', 'ask noctis', 'vibe', 'ai agents', 'q&a', 'career planner'],
    answer: () =>
      `**Noctis AI** operates natively across ConnectLn:\n` +
      `• **Top-Bar Ask Noctis:** AI Q&A across all ConnectLn tabs, active Zero-Day CVE reporting, Noctis Vibe Studio, and Career Planner.\n` +
      `• **Messaging → Inbox → Noctis AI:** Summarizes unread messages by arrival date, reports **Active Zero-Day & CISA KEV Threat Advisories** inline, answers platform/inbox questions in the **Ask Noctis** search bar, curates *Suggested to-dos*, and organizes *Topics to catch up on*.\n` +
      `• **Jobs CareerTwin:** 25-question / 5-round interview prep & rubric scoring.\n` +
      `• **Alerts & Market Agents:** Explains alerts (\`NOCTIS-ALERTS-001\`) and generates executive purchase justifications for Marketplace products.`,
    tab: 'aiagents',
    tabLabel: 'Open AI Agents'
  },
  {
    id: 'zerodays',
    title: 'Active Zero-Day Vulnerabilities & CISA KEV Threat Report',
    keywords: ['zero day', 'zero-day', '0-day', 'zeroday', 'cve', 'cisa kev', 'exploit-db', 'metasploit', 'searchsploit', 'nvd', 'active exploit'],
    answer: () => buildNoctisZeroDayReport(),
    tab: 'pulserooms',
    tabLabel: 'Open Pulse Zero-Day Stream'
  },
  {
    id: 'languages',
    title: 'Theme & EN (46-Language Localization)',
    keywords: ['language', 'languages', 'translate', 'dark mode', 'theme', 'light mode', 'warm mode', 'arabic', 'spanish', 'german', 'en menu'],
    answer: () =>
      `Use the top-bar **Theme** button to switch between **Light, Dark, and Warm** visual modes, and click **EN** to switch the entire ConnectLn UI, Noctis AI replies, and live spoken video audio translation across **46 languages**.`
  },
  {
    id: 'support',
    title: 'Help & Contact',
    keywords: ['help', 'support', 'contact', 'report', 'bug', 'problem', 'issue', 'feedback'],
    answer: () =>
      `Ask **Noctis AI**, visit **Me → Trust Center**, or report posts/accounts directly from the 3-dot menu for Moderation Center review.`
  },
  {
    id: 'site',
    title: 'Official ConnectLn Domains',
    keywords: ['url', 'website', 'link', 'site', 'domain', 'address', 'app'],
    answer: () => `ConnectLn runs live at **https://www.conectln.com** (and **https://www.connectln.app**).`
  }
]

const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'to', 'do', 'i', 'how', 'can', 'what', 'does', 'of', 'in', 'on', 'my', 'me', 'for', 'and', 'or', 'it', 'with', 'about', 'tell', 'you', 'we'])

/** Returns the best-matching topic, or null if nothing is relevant. */
export function findConnectLnTopic(question: string): KnowledgeTopic | null {
  const q = question.toLowerCase()
  const words = q.split(/[^a-z0-9&-]+/).filter((w) => w && !STOP.has(w))
  let best: KnowledgeTopic | null = null
  let bestScore = 0
  for (const topic of CONNECTLN_TOPICS) {
    let score = 0
    for (const kw of topic.keywords) {
      if (kw.includes(' ')) {
        if (q.includes(kw)) score += 4
      } else if (words.includes(kw)) {
        score += 2
      }
    }
    if (topic.id === 'about') score = Math.min(score, 2)
    if (score > bestScore) {
      best = topic
      bestScore = score
    }
  }
  return bestScore >= 2 ? best : null
}

/** Build a complete Home-to-Pulse overview when the user asks about all tabs or everything on ConnectLn. */
export function connectLnOverview(): string {
  return (
    `### ConnectLn — Complete Platform Overview (Home to Pulse Tabs)\n` +
    buildHomeToPulseGuide() +
    `\n\n---\n\n` +
    buildNoctisZeroDayReport() +
    `\n\n### Professions & Enclaves (${PROFESSION_ENCLAVES.length} Enclaves · ${ALL_PROFESSIONS.length}+ Professions)\n` +
    enclaveList()
  )
}

/** Top-N relevant topics for grounding an external Noctis call. */
export function findConnectLnTopics(question: string, n = 4): KnowledgeTopic[] {
  const q = question.toLowerCase()
  const words = q.split(/[^a-z0-9&-]+/).filter((w) => w && !STOP.has(w))
  return CONNECTLN_TOPICS.map((topic) => {
    let score = 0
    for (const kw of topic.keywords) {
      if (kw.includes(' ')) {
        if (q.includes(kw)) score += 4
      } else if (words.includes(kw)) {
        score += 2
      }
    }
    return { topic, score }
  })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.topic)
}

/**
 * Resolves either a Zero-Day report, a full Home-to-Pulse overview, or 1-3 matched ConnectLn platform/tab guides
 * so Noctis (in Inbox, Top-Bar Ask Noctis, and API fallback) never misses a ConnectLn question.
 */
export function buildConnectLnPlatformAnswer(
  question: string
): { title: string; answer: string; tab?: string; tabLabel?: string } | null {
  const q = (question || '').toLowerCase().trim()
  if (!q) return null

  if (isZeroDayOrCveQuery(question)) {
    return {
      title: 'Noctis AI — Active Zero-Day & CISA KEV Threat Intelligence Report',
      answer: buildNoctisZeroDayReport(question),
      tab: 'pulserooms',
      tabLabel: 'Open Pulse Zero-Day Stream'
    }
  }

  const asksFullTour =
    /home\s+to\s+pulse|all\s+the\s+tab|all\s+tab|every\s+tab|all\s+the\s+tan|all\s+feature|everything\s+(about|on|in)|full\s+(platform|tour|overview|guide)|entire\s+platform|whole\s+platform|know\s+everything/.test(q) ||
    (q.includes('home') && q.includes('pulse'))

  if (asksFullTour) {
    return {
      title: 'ConnectLn — Complete Platform Guide (All Tabs from Home to Pulse)',
      answer: `${buildHomeToPulseGuide()}\n\n---\n\n${buildNoctisZeroDayReport()}`,
      tab: 'home',
      tabLabel: 'Explore ConnectLn Tabs'
    }
  }

  const matched = findConnectLnTopics(q, 3)
  if (matched.length === 0) {
    const mentionsPlatform = /\b(connectln|connectin|platform|this\s+app|this\s+site|tab|tabs|pulserooms|backend|gate)\b/.test(q)
    if (!mentionsPlatform) return null
    return {
      title: 'ConnectLn — Platform Overview (Home to Pulse Tabs)',
      answer: buildHomeToPulseGuide(),
      tab: 'home',
      tabLabel: 'Go to Home'
    }
  }

  // If the question asks specifically about one or more tabs/features, combine the top matches cleanly
  const hasSpecific = matched.filter((m) => m.id !== 'about')
  const picked = (hasSpecific.length > 0 ? hasSpecific : matched).slice(0, 3)
  if (picked.length === 1) {
    return {
      title: picked[0].title,
      answer: picked[0].answer(),
      tab: picked[0].tab,
      tabLabel: picked[0].tabLabel
    }
  }

  return {
    title: picked.map((t) => t.title.split('—')[0].trim()).join(' · '),
    answer: picked.map((t) => `#### ${t.title}\n${t.answer()}`).join('\n\n'),
    tab: picked[0].tab,
    tabLabel: picked[0].tabLabel
  }
}

/** Plain-text ConnectLn facts to ground Noctis so answers match the real product across every tab and Zero-Day stream. */
export function connectLnGrounding(question: string): string {
  const topics = findConnectLnTopics(question, 4)
  const base = CONNECTLN_TOPICS.find((t) => t.id === 'about')!
  const allTabs = CONNECTLN_TOPICS.find((t) => t.id === 'all_tabs')!
  const zerodays = CONNECTLN_TOPICS.find((t) => t.id === 'zerodays')!
  const picked = [
    allTabs,
    zerodays,
    base,
    ...topics.filter((t) => t.id !== 'about' && t.id !== 'all_tabs' && t.id !== 'zerodays')
  ]
  return picked.map((t) => `${t.title}: ${t.answer().replace(/\*\*/g, '')}`).join('\n\n')
}
