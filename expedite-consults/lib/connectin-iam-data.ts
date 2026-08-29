// =========================================================================
// CONNECTIN IDENTITY & ACCESS MANAGEMENT (IAM) DATA MODELS & MOCKS
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

// =========================================================================
// ADMINISTRATIVE IAM & GOVERNANCE MODELS
// =========================================================================

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
  roles: string[]
  enforcementStatus: UserEnforcementStatus
  mfaStatus: string
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe'
  organization: string
  lastLogin: string
  reportsCount: number
}

export const ADMIN_USERS_DIRECTORY: AdminUserRecord[] = [
  {
    id: 'USR-89410',
    name: 'Alex Taylor (Fellow)',
    email: 'alex.taylor@expedite-consults.com',
    roles: ['Principal Architect', 'Seller', 'Fellow'],
    enforcementStatus: 'Active',
    mfaStatus: 'FIDO2 Passkey ✓',
    riskLevel: 'Low',
    organization: 'Expedite Consults LLC',
    lastLogin: 'Active Now',
    reportsCount: 0
  },
  {
    id: 'USR-89411',
    name: 'Dmitri V.',
    email: 'dmitri.v@unknown-proxy.io',
    roles: ['Individual'],
    enforcementStatus: 'Under Review',
    mfaStatus: 'SMS Only',
    riskLevel: 'High',
    organization: 'Autonomous Cluster',
    lastLogin: '10 mins ago',
    reportsCount: 4
  },
  {
    id: 'USR-89412',
    name: 'Elena Rostova',
    email: 'elena.rostova@defense-tech.org',
    roles: ['AppSec Fellow', 'Creator', 'Mentor'],
    enforcementStatus: 'Active',
    mfaStatus: 'Hardware Token ✓',
    riskLevel: 'Low',
    organization: 'OpenOSCAL Institute',
    lastLogin: '1 hour ago',
    reportsCount: 0
  },
  {
    id: 'USR-89413',
    name: 'Bot_Scraper_994',
    email: 'spam_lead_gen@crawler.net',
    roles: ['Recruiter'],
    enforcementStatus: 'Suspended',
    mfaStatus: 'Disabled',
    riskLevel: 'Severe',
    organization: 'Unverified Lead Agency',
    lastLogin: '3 days ago',
    reportsCount: 19
  }
]

export interface ModerationCase {
  caseId: string
  category: 'Spam' | 'Harassment' | 'Fraud & Scams' | 'Impersonation' | 'Marketplace Violation' | 'Security Anomaly'
  reportedEntity: string
  reportedBy: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  evidenceSummary: string
  status: 'Open / Unassigned' | 'Under Investigation' | 'Resolved' | 'Action Enforced'
  assignedModerator: string
  timestamp: string
}

export const MODERATION_CASES_DATA: ModerationCase[] = [
  {
    caseId: 'CASE-10482',
    category: 'Security Anomaly',
    reportedEntity: 'Dmitri V. (USR-89411)',
    reportedBy: 'ConnectIn AI Risk Engine',
    severity: 'High',
    evidenceSummary: 'Impossible travel anomaly detected: Login from Laurel, MD followed by Frankfurt, Germany 12 minutes later via Tor exit relay.',
    status: 'Under Investigation',
    assignedModerator: 'Security Admin 04',
    timestamp: '28 mins ago'
  },
  {
    caseId: 'CASE-10481',
    category: 'Marketplace Violation',
    reportedEntity: 'Unverified Vendor "CyberShield Pro"',
    reportedBy: 'Expedite Trust Desk',
    severity: 'Medium',
    evidenceSummary: 'Vendor claims FedRAMP High In-Process without valid 3PAO cryptographic attestation hash.',
    status: 'Open / Unassigned',
    assignedModerator: 'Unassigned',
    timestamp: '2 hours ago'
  }
]

export interface AdminAuditLogEntry {
  id: string
  adminEmail: string
  action: 'USER_SUSPENDED' | 'ROLE_MODIFIED' | 'PASSKEY_RESET' | 'FOUR_EYES_APPROVED' | 'ELEVATED_JIT_ACCESS'
  targetEntity: string
  reason: string
  ipAddress: string
  timestamp: string
  status: 'Success' | 'Denied'
}

export const ADMIN_AUDIT_LOG_DATA: AdminAuditLogEntry[] = [
  {
    id: 'LOG-9401',
    adminEmail: 'sec-ops@connectin.internal',
    action: 'USER_SUSPENDED',
    targetEntity: 'Bot_Scraper_994 (USR-89413)',
    reason: 'Mass automated recruiter InMail crawler spam violation',
    ipAddress: '10.240.0.12 (Internal SOC)',
    timestamp: 'Today, 14:22 EST',
    status: 'Success'
  },
  {
    id: 'LOG-9400',
    adminEmail: 'iam-approver@connectin.internal',
    action: 'FOUR_EYES_APPROVED',
    targetEntity: 'Org Deletion: ShadowTech Inc.',
    reason: 'Company liquidation request verified by 2 authorized directors',
    ipAddress: '10.240.0.8',
    timestamp: 'Today, 11:05 EST',
    status: 'Success'
  }
]

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
