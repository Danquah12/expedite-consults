// =========================================================================
// CONNECTIN ENTERPRISE ADMIN, IAM, MODERATION & SECURITY DATA ENGINE
// =========================================================================

export interface ActiveUserSession {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrentSession: boolean
}

export interface ConnectedOAuthApp {
  id: string
  name: string
  icon: string
  scope: string[]
  connectedDate: string
}

export interface AccountSecurityProfile {
  accountStatus: 'Good Standing' | 'Restricted' | 'Suspended' | 'Under Review'
  emailVerified: boolean
  mfaEnabled: boolean
  mfaMethod: 'Authenticator App (TOTP)' | 'Passkey (FIDO2 / WebAuthn)' | 'SMS Backup'
  passkeysCount: number
  recoveryCodesCount: number
  riskScore: 'Low (0.02)' | 'Moderate' | 'Elevated' | 'Critical'
  activeSessions: ActiveUserSession[]
  connectedApps: ConnectedOAuthApp[]
}

export const USER_ACCOUNT_SECURITY_DATA: AccountSecurityProfile = {
  accountStatus: 'Good Standing',
  emailVerified: true,
  mfaEnabled: true,
  mfaMethod: 'Passkey (FIDO2 / WebAuthn)',
  passkeysCount: 2,
  recoveryCodesCount: 8,
  riskScore: 'Low (0.02)',
  activeSessions: [
    {
      id: 'sess_1',
      device: 'Windows PC (Desktop)',
      browser: 'Google Chrome 128.0',
      location: 'Laurel, MD, United States',
      ipAddress: '198.51.100.42 (GovCloud Egress)',
      lastActive: 'Active Now',
      isCurrentSession: true
    },
    {
      id: 'sess_2',
      device: 'Apple iPhone 15 Pro',
      browser: 'ConnectIn iOS App',
      location: 'Washington, DC, United States',
      ipAddress: '172.56.21.9',
      lastActive: '2 hours ago',
      isCurrentSession: false
    },
    {
      id: 'sess_3',
      device: 'MacBook Pro 16"',
      browser: 'Apple Safari 17.5',
      location: 'Bethesda, MD, United States',
      ipAddress: '198.51.100.18',
      lastActive: 'Yesterday, 4:20 PM',
      isCurrentSession: false
    }
  ],
  connectedApps: [
    {
      id: 'app_github',
      name: 'GitHub Enterprise Sync',
      icon: '🐙',
      scope: ['read:user', 'read:org', 'repo:status'],
      connectedDate: 'Aug 14, 2026'
    },
    {
      id: 'app_microsoft',
      name: 'Microsoft Entra ID (SSO)',
      icon: '🪟',
      scope: ['User.Read', 'Calendars.Read'],
      connectedDate: 'July 28, 2026'
    },
    {
      id: 'app_google',
      name: 'Google Workspace Enterprise',
      icon: '🔍',
      scope: ['profile', 'email'],
      connectedDate: 'June 10, 2026'
    }
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. USER MANAGEMENT & IAM MODELS
// ─────────────────────────────────────────────────────────────────────────────

export type UserEnforcementStatus =
  | 'Active'
  | 'Restricted'
  | 'Suspended'
  | 'Banned'
  | 'Under Review'
  | 'Deactivated'

export interface AdminUserRecord {
  id: string
  name: string
  email: string
  avatar: string
  headline: string
  roles: string[]
  enforcementStatus: UserEnforcementStatus
  verificationLevel: 'Unverified' | 'Email Verified' | 'Phone Verified' | 'Gov ID Verified' | 'Enterprise Fellow'
  mfaStatus: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe'
  organization: string
  location: string
  connectionsCount: number
  lastLogin: string
  registeredAt: string
  reportsCount: number
  notes?: string
}

export const ADMIN_USERS_DIRECTORY: AdminUserRecord[] = [
  {
    id: 'USR-89410',
    name: 'Alex Taylor (Fellow)',
    email: 'alex.taylor@expedite-consults.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    headline: 'Principal Zero Trust Architect & Fellow @ Expedite Consults',
    roles: ['SUPER_ADMIN', 'Principal Architect', 'Fellow'],
    enforcementStatus: 'Active',
    verificationLevel: 'Enterprise Fellow',
    mfaStatus: 'FIDO2 Passkey ✓',
    riskLevel: 'Low',
    organization: 'Expedite Consults LLC',
    location: 'Laurel, MD',
    connectionsCount: 842,
    lastLogin: 'Active Now',
    registeredAt: 'Jan 15, 2025',
    reportsCount: 0
  },
  {
    id: 'USR-89411',
    name: 'Dmitri Voronov',
    email: 'dmitri.v@unknown-proxy.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    headline: 'Independent Security Researcher',
    roles: ['NORMAL_USER'],
    enforcementStatus: 'Under Review',
    verificationLevel: 'Email Verified',
    mfaStatus: 'SMS Only',
    riskLevel: 'High',
    organization: 'Autonomous Cluster',
    location: 'Frankfurt / Unknown VPN',
    connectionsCount: 42,
    lastLogin: '10 mins ago',
    registeredAt: 'Aug 02, 2026',
    reportsCount: 4,
    notes: 'Impossible travel alert flagged by SIEM rule'
  },
  {
    id: 'USR-89412',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@stanford.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow',
    roles: ['PLATFORM_ADMIN', 'Creator', 'Mentor'],
    enforcementStatus: 'Active',
    verificationLevel: 'Enterprise Fellow',
    mfaStatus: 'Hardware Token ✓',
    riskLevel: 'Low',
    organization: 'Stanford AI Lab / Expedite Research',
    location: 'Palo Alto, CA',
    connectionsCount: 1420,
    lastLogin: '1 hour ago',
    registeredAt: 'Feb 10, 2025',
    reportsCount: 0
  },
  {
    id: 'USR-89413',
    name: 'Bot_Scraper_994',
    email: 'spam_lead_gen@crawler.net',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    headline: 'Mass Lead Generation Bot',
    roles: ['RECRUITER'],
    enforcementStatus: 'Suspended',
    verificationLevel: 'Unverified',
    mfaStatus: 'Disabled',
    riskLevel: 'Severe',
    organization: 'Unverified Lead Agency',
    location: 'Data Center IP (Ashburn, VA)',
    connectionsCount: 8,
    lastLogin: '3 days ago',
    registeredAt: 'Sep 01, 2026',
    reportsCount: 19,
    notes: 'Suspended automatically by WAF rate limiter'
  },
  {
    id: 'USR-89414',
    name: 'Marcus Vance',
    email: 'marcus.vance@cloudscaleglobal.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    headline: 'VP of Engineering @ CloudScale Global · Ex-AWS',
    roles: ['COMPANY_ADMIN', 'RECRUITER'],
    enforcementStatus: 'Active',
    verificationLevel: 'Enterprise Fellow',
    mfaStatus: 'TOTP Authenticator ✓',
    riskLevel: 'Low',
    organization: 'CloudScale Global',
    location: 'Seattle, WA',
    connectionsCount: 650,
    lastLogin: '4 hours ago',
    registeredAt: 'Mar 12, 2025',
    reportsCount: 0
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTENT MANAGEMENT & POSTS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminContentRecord {
  id: string
  authorName: string
  authorEmail: string
  authorAvatar: string
  contentType: 'Post' | 'Article' | 'Media / Video' | 'Document' | 'Poll'
  contentSnippet: string
  publishedAt: string
  status: 'Published' | 'Flagged' | 'Shadow Hidden' | 'Removed'
  toxicityScore: number // 0-100
  spamScore: number // 0-100
  likesCount: number
  commentsCount: number
  reportsCount: number
}

export const ADMIN_CONTENT_DIRECTORY: AdminContentRecord[] = [
  {
    id: 'CNT-901',
    authorName: 'Expedite Consults Product Lab',
    authorEmail: 'product@expedite-consults.com',
    authorAvatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    contentType: 'Post',
    contentSnippet: '🚀 We just released our new AI-powered cloud security platform: Expedite Strike & Fusion 2026!',
    publishedAt: '20m ago',
    status: 'Published',
    toxicityScore: 1,
    spamScore: 2,
    likesCount: 412,
    commentsCount: 56,
    reportsCount: 0
  },
  {
    id: 'CNT-902',
    authorName: 'Dmitri Voronov',
    authorEmail: 'dmitri.v@unknown-proxy.io',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    contentType: 'Post',
    contentSnippet: 'Download zero-day weaponized exploits kit for financial institutions. DM for BTC escrow address.',
    publishedAt: '45m ago',
    status: 'Flagged',
    toxicityScore: 84,
    spamScore: 92,
    likesCount: 0,
    commentsCount: 3,
    reportsCount: 6
  },
  {
    id: 'CNT-903',
    authorName: 'Dr. Elena Rostova',
    authorEmail: 'elena.rostova@stanford.edu',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    contentType: 'Article',
    contentSnippet: '📑 [Technical Whitepaper Released] Deterministic Tool Sandboxing and Memory Poisoning Immunity in Autonomous Multi-Agent Swarms.',
    publishedAt: '3h ago',
    status: 'Published',
    toxicityScore: 0,
    spamScore: 1,
    likesCount: 328,
    commentsCount: 44,
    reportsCount: 0
  },
  {
    id: 'CNT-904',
    authorName: 'Bot_Scraper_994',
    authorEmail: 'spam_lead_gen@crawler.net',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    contentType: 'Post',
    contentSnippet: 'Earn $5000/day working 10 minutes from home! Click here: http://bit.ly/fake-scam-link-994',
    publishedAt: '2 days ago',
    status: 'Removed',
    toxicityScore: 65,
    spamScore: 99,
    likesCount: 1,
    commentsCount: 0,
    reportsCount: 14
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 3. MODERATION CENTER & REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export interface ModerationCase {
  caseId: string
  category: 'Spam' | 'Harassment' | 'Fraud & Scams' | 'Impersonation' | 'Marketplace Violation' | 'Security Anomaly' | 'Copyright / DMCA'
  reportedEntity: string
  reportedEntityType: 'User' | 'Post' | 'Job' | 'Message' | 'Product'
  reportedBy: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  evidenceSummary: string
  status: 'Open / Unassigned' | 'Under Investigation' | 'Resolved' | 'Action Enforced'
  assignedModerator: string
  timestamp: string
  resolutionNotes?: string
}

export const MODERATION_CASES_DATA: ModerationCase[] = [
  {
    caseId: 'CASE-10482',
    category: 'Security Anomaly',
    reportedEntity: 'Dmitri Voronov (USR-89411)',
    reportedEntityType: 'User',
    reportedBy: 'ConnectIn AI Risk Engine',
    severity: 'High',
    evidenceSummary: 'Impossible travel anomaly detected: Login from Laurel, MD followed by Frankfurt, Germany 12 minutes later via Tor exit relay. Offensive exploit solicitation post flagged.',
    status: 'Under Investigation',
    assignedModerator: 'Security Admin 04',
    timestamp: '28 mins ago'
  },
  {
    caseId: 'CASE-10481',
    category: 'Marketplace Violation',
    reportedEntity: 'Unverified Vendor "CyberShield Pro"',
    reportedEntityType: 'Product',
    reportedBy: 'Expedite Trust Desk',
    severity: 'Medium',
    evidenceSummary: 'Vendor claims FedRAMP High In-Process without valid 3PAO cryptographic attestation hash in registry.',
    status: 'Open / Unassigned',
    assignedModerator: 'Unassigned',
    timestamp: '2 hours ago'
  },
  {
    caseId: 'CASE-10480',
    category: 'Spam',
    reportedEntity: 'Bot_Scraper_994 (USR-89413)',
    reportedEntityType: 'User',
    reportedBy: 'Marcus Vance & 12 others',
    severity: 'Critical',
    evidenceSummary: 'Dispatched 480 automated unsolicited recruiter messages in 6 minutes promoting phishing survey landing pages.',
    status: 'Action Enforced',
    assignedModerator: 'Alex Taylor (Super Admin)',
    timestamp: 'Yesterday',
    resolutionNotes: 'Account permanently suspended. IP range blacklisted in WAF.'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMPANIES & ORGANIZATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminCompanyRecord {
  id: string
  name: string
  logo: string
  industry: string
  verificationStatus: 'Verified Enterprise' | 'Gov / Standards Body' | 'Pending Review' | 'Flagged'
  companyAdmins: string[]
  employeesCount: number
  jobOpeningsCount: number
  followersCount: string
  tier: 'Enterprise Suite' | 'Standard' | 'Gov Partner'
}

export const ADMIN_COMPANIES_DIRECTORY: AdminCompanyRecord[] = [
  {
    id: 'CMP-001',
    name: 'Expedite Consults',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    industry: 'Cybersecurity & AI Defense',
    verificationStatus: 'Verified Enterprise',
    companyAdmins: ['alex.taylor@expedite-consults.com', 'admin@expedite-consults.com'],
    employeesCount: 142,
    jobOpeningsCount: 8,
    followersCount: '48.2k',
    tier: 'Enterprise Suite'
  },
  {
    id: 'CMP-002',
    name: 'Palantir Technologies',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    industry: 'Defense Tech & Big Data',
    verificationStatus: 'Verified Enterprise',
    companyAdmins: ['recruiting@palantir.com'],
    employeesCount: 3800,
    jobOpeningsCount: 14,
    followersCount: '410k',
    tier: 'Enterprise Suite'
  },
  {
    id: 'CMP-003',
    name: 'CISA (Cybersecurity & Infrastructure Security Agency)',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    industry: 'Federal Government',
    verificationStatus: 'Gov / Standards Body',
    companyAdmins: ['cisa.admin@cisa.gov'],
    employeesCount: 3200,
    jobOpeningsCount: 19,
    followersCount: '120k',
    tier: 'Gov Partner'
  },
  {
    id: 'CMP-004',
    name: 'DarkMatrix Cyber LLC',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    industry: 'Offensive Security',
    verificationStatus: 'Pending Review',
    companyAdmins: ['devon.hughes@darkmatrix.sec'],
    employeesCount: 24,
    jobOpeningsCount: 3,
    followersCount: '12.4k',
    tier: 'Standard'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 5. JOBS & RECRUITING MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminJobRecord {
  id: string
  title: string
  company: string
  location: string
  salary: string
  postedBy: string
  postedAt: string
  applicantsCount: number
  status: 'Approved & Active' | 'Pending Review' | 'Flagged Suspicious' | 'Expired / Closed'
  fraudRiskScore: number // 0-100
  isFeatured: boolean
}

export const ADMIN_JOBS_DIRECTORY: AdminJobRecord[] = [
  {
    id: 'JOB-501',
    title: 'Lead Cloud Security Architect',
    company: 'Expedite Consults',
    location: 'New York, NY (Hybrid)',
    salary: '$195,000 - $240,000 / yr',
    postedBy: 'alex.taylor@expedite-consults.com',
    postedAt: '2 days ago',
    applicantsCount: 18,
    status: 'Approved & Active',
    fraudRiskScore: 0,
    isFeatured: true
  },
  {
    id: 'JOB-502',
    title: 'Senior Frontend Systems Engineer',
    company: 'Vercel Ecosystem Labs',
    location: 'Remote · Worldwide',
    salary: '$170,000 - $215,000 / yr',
    postedBy: 'talent@vercel.com',
    postedAt: '1 day ago',
    applicantsCount: 64,
    status: 'Approved & Active',
    fraudRiskScore: 2,
    isFeatured: true
  },
  {
    id: 'JOB-503',
    title: 'Data Entry Assistant (High Pay No Exp)',
    company: 'Apex Global Financials (Unverified)',
    location: 'Remote',
    salary: '$80/hour instant wire',
    postedBy: 'bot_lead_gen@crawler.net',
    postedAt: '4 hours ago',
    applicantsCount: 5,
    status: 'Flagged Suspicious',
    fraudRiskScore: 94,
    isFeatured: false
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 6. VERIFICATION QUEUE
// ─────────────────────────────────────────────────────────────────────────────

export interface VerificationRequestItem {
  id: string
  userName: string
  userEmail: string
  userAvatar: string
  verificationType: 'Identity (Gov Passport/ID)' | 'Employment (Work Email)' | 'Professional Credential (CISSP/OSCE/CKS)' | 'Organization Official'
  claimDetails: string
  evidenceDocuments: { name: string; url: string; hash: string }[]
  submittedAt: string
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'More Info Requested'
  assignedReviewer?: string
}

export const ADMIN_VERIFICATION_REQUESTS: VerificationRequestItem[] = [
  {
    id: 'VERIF-83921',
    userName: 'Samantha Wei',
    userEmail: 'samantha.wei@feddefense.gov',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    verificationType: 'Professional Credential (CISSP/OSCE/CKS)',
    claimDetails: 'FedRAMP 3PAO Lead Assessor & CISSP-ISSAP Credential Verification',
    evidenceDocuments: [
      { name: 'ISC2_CISSP_Certificate_2026.pdf', url: '#', hash: 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65d' },
      { name: 'FedRAMP_3PAO_Assessor_Badge.pdf', url: '#', hash: 'SHA256: 9e1c28f09b5a8e1b3d2c1f0a9b8e7d6c' }
    ],
    submittedAt: 'Today, 09:14 EST',
    status: 'Pending Review'
  },
  {
    id: 'VERIF-83922',
    userName: 'David Sterling',
    userEmail: 'david.sterling@apexdefense.sec',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    verificationType: 'Employment (Work Email)',
    claimDetails: 'Principal AI Security & Red Team Lead @ Apex Defense Labs',
    evidenceDocuments: [
      { name: 'Apex_Defense_Employment_Attestation.pdf', url: '#', hash: 'SHA256: 3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d' }
    ],
    submittedAt: 'Yesterday, 16:30 EST',
    status: 'Pending Review'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 7. PLATFORM CONFIGURATION & FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export interface PlatformConfigState {
  allowRegistration: boolean
  requireEmailVerification: boolean
  requirePhoneMFA: boolean
  enableGoogleOAuth: boolean
  enableMicrosoftOAuth: boolean
  enableAIAssistant: boolean
  enableVideoStudio: boolean
  enableMarketplacePurchases: boolean
  enableDirectMessaging: boolean
  maxPostLength: number
  maxAttachmentSizeMB: number
  maintenanceMode: boolean
  maintenanceMessage: string
}

export const INITIAL_PLATFORM_CONFIG: PlatformConfigState = {
  allowRegistration: true,
  requireEmailVerification: true,
  requirePhoneMFA: false,
  enableGoogleOAuth: true,
  enableMicrosoftOAuth: true,
  enableAIAssistant: true,
  enableVideoStudio: true,
  enableMarketplacePurchases: true,
  enableDirectMessaging: true,
  maxPostLength: 10000,
  maxAttachmentSizeMB: 50,
  maintenanceMode: false,
  maintenanceMessage: 'ConnectIn is currently undergoing scheduled cryptographic infrastructure maintenance.'
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ROLES & RBAC PERMISSIONS MATRIX
// ─────────────────────────────────────────────────────────────────────────────

export interface RBACRole {
  roleKey: string
  name: string
  description: string
  userCount: number
  permissions: string[]
}

export const PLATFORM_RBAC_ROLES: RBACRole[] = [
  {
    roleKey: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Unrestricted full access across all platform data, security controls, billing, and IAM permissions.',
    userCount: 2,
    permissions: [
      'users.all', 'content.all', 'jobs.all', 'moderation.all',
      'verification.all', 'analytics.all', 'settings.all', 'audit.all', 'security.all'
    ]
  },
  {
    roleKey: 'PLATFORM_ADMIN',
    name: 'Platform Administrator',
    description: 'System-wide administrative authority excluding destructive database actions.',
    userCount: 6,
    permissions: [
      'users.read', 'users.edit', 'users.suspend', 'content.all',
      'jobs.all', 'moderation.all', 'verification.all', 'analytics.all', 'settings.modify'
    ]
  },
  {
    roleKey: 'MODERATION_ADMIN',
    name: 'Trust & Safety Moderator',
    description: 'Handle user reports, inspect flagged posts/media, issue warnings, and take enforcement actions.',
    userCount: 14,
    permissions: [
      'users.read', 'users.suspend', 'content.remove', 'content.restore',
      'reports.review', 'verification.review'
    ]
  },
  {
    roleKey: 'SUPPORT_ADMIN',
    name: 'Support & Helpdesk Specialist',
    description: 'Assist users with login recovery, profile verification inquiries, and guided troubleshooting.',
    userCount: 22,
    permissions: [
      'users.read', 'users.reset_passkey', 'verification.read', 'analytics.read'
    ]
  },
  {
    roleKey: 'COMPANY_ADMIN',
    name: 'Enterprise Organization Admin',
    description: 'Manage verified company page, post official jobs, and affiliate corporate employees.',
    userCount: 1840,
    permissions: [
      'company.edit', 'company.jobs_post', 'company.analytics'
    ]
  },
  {
    roleKey: 'RECRUITER',
    name: 'Verified Talent Recruiter',
    description: 'Access talent discovery search, post hiring missions, and message prospective candidates.',
    userCount: 4200,
    permissions: [
      'jobs.post', 'talent.search', 'messaging.outbound'
    ]
  },
  {
    roleKey: 'NORMAL_USER',
    name: 'Verified Member',
    description: 'Standard cryptographic member of the ConnectIn professional network.',
    userCount: 2480000,
    permissions: [
      'profile.edit', 'posts.create', 'connections.manage', 'messaging.send'
    ]
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 9. AUDIT LOG LEDGER & ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminAuditLogEntry {
  id: string
  adminEmail: string
  action:
    | 'USER_SUSPENDED'
    | 'USER_ACTIVATED'
    | 'USER_IMPERSONATED'
    | 'ROLE_MODIFIED'
    | 'PASSKEY_RESET'
    | 'CONTENT_REMOVED'
    | 'CONTENT_RESTORED'
    | 'VERIFICATION_APPROVED'
    | 'VERIFICATION_REJECTED'
    | 'JOB_APPROVED'
    | 'JOB_REMOVED'
    | 'SETTINGS_UPDATED'
    | 'BROADCAST_SENT'
    | 'FOUR_EYES_APPROVED'
    | 'ELEVATED_JIT_ACCESS'
  targetEntity: string
  reason: string
  ipAddress: string
  timestamp: string
  status: 'Success' | 'Denied' | 'Pending Review'
}

export const ADMIN_AUDIT_LOG_DATA: AdminAuditLogEntry[] = [
  {
    id: 'LOG-9405',
    adminEmail: 'alex.taylor@expedite-consults.com',
    action: 'SETTINGS_UPDATED',
    targetEntity: 'Platform Global Config',
    reason: 'Updated primary routing and enabled real-time SMS/Call OTP multi-dispatch verification',
    ipAddress: '198.51.100.42 (Internal Admin Enclave)',
    timestamp: 'Just now',
    status: 'Success'
  },
  {
    id: 'LOG-9404',
    adminEmail: 'sec-ops@connectin.internal',
    action: 'USER_SUSPENDED',
    targetEntity: 'Bot_Scraper_994 (USR-89413)',
    reason: 'Mass automated recruiter InMail crawler spam violation',
    ipAddress: '10.240.0.12 (Internal SOC)',
    timestamp: 'Today, 14:22 EST',
    status: 'Success'
  },
  {
    id: 'LOG-9403',
    adminEmail: 'moderator-02@connectin.internal',
    action: 'CONTENT_REMOVED',
    targetEntity: 'Post #CNT-904',
    reason: 'Phishing spam link detected by Automated Heuristic Scanner',
    ipAddress: '10.240.0.19',
    timestamp: 'Today, 12:40 EST',
    status: 'Success'
  },
  {
    id: 'LOG-9402',
    adminEmail: 'alex.taylor@expedite-consults.com',
    action: 'VERIFICATION_APPROVED',
    targetEntity: 'Dr. Elena Rostova (USR-89412)',
    reason: 'Ph.D. credential validated via Stanford cryptographically signed attestation',
    ipAddress: '198.51.100.42',
    timestamp: 'Yesterday, 18:15 EST',
    status: 'Success'
  },
  {
    id: 'LOG-9401',
    adminEmail: 'iam-approver@connectin.internal',
    action: 'FOUR_EYES_APPROVED',
    targetEntity: 'Org Deletion: ShadowTech Inc.',
    reason: 'Company liquidation request verified by 2 authorized directors',
    ipAddress: '10.240.0.8',
    timestamp: 'Yesterday, 11:05 EST',
    status: 'Success'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 10. SECURITY CENTER & SOC TELEMETRY
// ─────────────────────────────────────────────────────────────────────────────

export interface SecurityEventTelemetry {
  id: string
  eventType: 'Failed Login Burst' | 'Impossible Travel' | 'Brute Force Blocked' | 'WAF Rate Limit Breach' | 'Privilege Escalation Attempt'
  sourceIp: string
  targetUser?: string
  geoCountry: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  autoMitigation: string
  timestamp: string
}

export const SOC_SECURITY_EVENTS: SecurityEventTelemetry[] = [
  {
    id: 'SOC-901',
    eventType: 'Impossible Travel',
    sourceIp: '185.220.101.5 (Tor Exit Node)',
    targetUser: 'dmitri.v@unknown-proxy.io',
    geoCountry: 'Germany',
    severity: 'High',
    autoMitigation: 'MFA Step-Up Enforced & Account Placed Under Review',
    timestamp: '28 mins ago'
  },
  {
    id: 'SOC-902',
    eventType: 'Failed Login Burst',
    sourceIp: '45.154.255.88',
    targetUser: 'Multiple Accounts (14 usernames)',
    geoCountry: 'Netherlands',
    severity: 'Critical',
    autoMitigation: 'IP Subnet Banned in Cloudflare Edge WAF (24h)',
    timestamp: '1 hour ago'
  },
  {
    id: 'SOC-903',
    eventType: 'WAF Rate Limit Breach',
    sourceIp: '194.26.29.114',
    targetUser: 'API Route /api/connectin/users',
    geoCountry: 'Russia',
    severity: 'High',
    autoMitigation: 'Rate limited to 0 req/sec; Captcha challenge enforced',
    timestamp: '3 hours ago'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 11. PLATFORM BROADCAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface BroadcastNotificationItem {
  id: string
  title: string
  body: string
  severity: 'Info' | 'Warning' | 'Security Alert' | 'Maintenance'
  targetAudience: 'Everyone' | 'Premium Members' | 'Recruiters' | 'Enterprise Admins'
  channels: ('In-App' | 'Email' | 'Push / SMS')[]
  sentBy: string
  sentAt: string
  deliveredCount: number
}

export const BROADCAST_NOTIFICATIONS_DATA: BroadcastNotificationItem[] = [
  {
    id: 'BRD-01',
    title: 'New Zero-Trust Verification Framework Active',
    body: 'Members can now verify their CISSP, CKS, and FedRAMP 3PAO credentials for official cryptographic badge issuance.',
    severity: 'Info',
    targetAudience: 'Everyone',
    channels: ['In-App', 'Push / SMS'],
    sentBy: 'Alex Taylor (Super Admin)',
    sentAt: '2 days ago',
    deliveredCount: 483200
  },
  {
    id: 'BRD-02',
    title: 'Scheduled Core Database Maintenance Window',
    body: 'ConnectIn infrastructure will undergo performance tuning this Saturday between 02:00 and 02:30 UTC.',
    severity: 'Maintenance',
    targetAudience: 'Enterprise Admins',
    channels: ['In-App', 'Email'],
    sentBy: 'SecOps Team',
    sentAt: '5 days ago',
    deliveredCount: 1840
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 12. FOUR-EYES APPROVALS
// ─────────────────────────────────────────────────────────────────────────────

export interface FourEyesApprovalItem {
  id: string
  requestedBy: string
  actionType: 'Permanent Organization Deletion' | 'High-Profile Account Ban' | 'Security Policy Mutation'
  targetObject: string
  riskLevel: 'Critical'
  justification: string
  requiredApprovals: number
  currentApprovals: number
  status: 'Pending Second Review' | 'Approved & Executed'
  timestamp: string
}

export const FOUR_EYES_APPROVALS_DATA: FourEyesApprovalItem[] = [
  {
    id: 'REQ-4EYES-08',
    requestedBy: 'Sarah Vance (Senior Compliance Officer)',
    actionType: 'Permanent Organization Deletion',
    targetObject: 'Legacy DoD Contractor Enclave #401',
    riskLevel: 'Critical',
    justification: 'Contract lifecycle expired. All stored OSCAL JSON and microVM images to be cryptographically sanitized per NIST SP 800-88.',
    requiredApprovals: 2,
    currentApprovals: 1,
    status: 'Pending Second Review',
    timestamp: '1 hour ago'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// 13. EXECUTIVE ANALYTICS METRICS SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

export interface ExecutiveAnalyticsSummary {
  totalUsers: number
  activeToday: number
  newUsersToday: number
  postsToday: number
  connectionsToday: number
  messagesToday: number
  revenueToday: number
  pendingReports: number
  pendingJobs: number
  pendingVerifications: number
  mfaAdoptionRate: string
  securityHealthScore: string
}

export const EXECUTIVE_ANALYTICS_DATA: ExecutiveAnalyticsSummary = {
  totalUsers: 2483291,
  activeToday: 483201,
  newUsersToday: 8291,
  postsToday: 91382,
  connectionsToday: 142819,
  messagesToday: 318490,
  revenueToday: 182391,
  pendingReports: 381,
  pendingJobs: 129,
  pendingVerifications: 842,
  mfaAdoptionRate: '94.8%',
  securityHealthScore: '99.94% (Zero Violations Detected)'
}
