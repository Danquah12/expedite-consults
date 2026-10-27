import { createSignedSessionToken, verifySignedSessionToken } from "./connectin-crypto"
import fs from "fs"
import path from "path"
import os from "os"
import crypto from "crypto"

export interface UserRecord {
  id: string
  email: string
  phone?: string
  passwordHash?: string
  role: 'personal' | 'enterprise' | 'creator' | 'seller' | 'developer' | 'admin'
  status: 'Active' | 'Restricted' | 'Suspended' | 'Under Review' | 'Banned'
  mfaEnabled: boolean
  mfaChannel: 'email' | 'sms'
  createdAt: string
  updatedAt: string
}

export interface UserProfileRecord {
  userId: string
  name: string
  headline: string
  avatar: string
  coverImage: string
  location: string
  about: string
  skills: string[]
  clearanceLevel: string
  fido2MfaVerified: boolean
  cryptoVerificationBadge: string
  skillMatrixScore: number
  connectionsCount: number
  followersCount: number
  profileViews: number
  postImpressions: number
  profession?: string
  professionId?: string
  professionCategory?: string
  professionEnclave?: string
}

export interface SessionRecord {
  sessionId: string
  userId: string
  token: string
  ipAddress: string
  userAgent: string
  deviceName: string
  location: string
  createdAt: string
  lastActive: string
  isActive: boolean
}

export interface OTPRecord {
  target: string // email or phone
  code: string
  expiresAt: number
  attempts: number
}

export interface PostRecord {
  id: string
  authorId: string
  authorName: string
  authorHeadline: string
  authorAvatar: string
  authorDegree?: string
  content: string
  timestamp: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  feedCategory: 'for_you' | 'products' | 'research' | 'following'
  feedSubCategory?: string
  hashtags: string[]
  mediaUrl?: string
  isLiked?: boolean
  isSaved?: boolean
}

export interface ConnectInDatabaseSchema {
  users: UserRecord[]
  profiles: UserProfileRecord[]
  sessions: SessionRecord[]
  otps: OTPRecord[]
  posts: PostRecord[]
}

// Initial Anchor Accounts
const INITIAL_USERS: UserRecord[] = [
  {
    id: "USR-89450",
    email: "kofi.agyarko@connectin.com",
    phone: "+233 24 555 0194",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-10-27T19:20:00Z",
    updatedAt: "2026-10-27T19:35:00Z",
    lastLoginAt: "2026-10-27T19:35:00Z",
    authProvider: "Email 2FA"
  } as any,
  {
    id: "USR-89451",
    email: "isaac.boye@connectin.com",
    phone: "+233 20 555 0412",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-10-27T19:22:00Z",
    updatedAt: "2026-10-27T19:35:00Z",
    lastLoginAt: "2026-10-27T19:35:00Z",
    authProvider: "Email 2FA"
  } as any,
  {
    id: "USR-89452",
    email: "patience.addo@connectin.com",
    phone: "+1 (240) 555-0821",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-10-27T19:15:00Z",
    updatedAt: "2026-10-27T19:32:00Z",
    lastLoginAt: "2026-10-27T19:32:00Z",
    authProvider: "Email 2FA"
  } as any,
  {
    id: "USR-85100",
    email: "kasiedu@syneren.com",
    phone: "+1 (240) 555-0614",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-10-27T18:50:00Z",
    updatedAt: "2026-10-27T19:32:00Z",
    lastLoginAt: "2026-10-27T19:32:00Z",
    authProvider: "Email 2FA"
  } as any,
  {
    id: "USR-89400",
    email: "kasiedu@expedite-consults.com",
    phone: "+1 (240) 260-7898",
    role: "admin",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89401",
    email: "asiedudanquah@gmail.com",
    phone: "+1 (240) 260-7898",
    role: "admin",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89410",
    email: "alex.taylor@connectin.com",
    phone: "+1 (240) 555-0192",
    role: "admin",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89411",
    email: "marcus.vance@defense-systems.com",
    phone: "+1 (703) 555-8841",
    role: "enterprise",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-08-05T14:30:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89412",
    email: "sarah.chen@defense-studio.tv",
    phone: "+1 (415) 555-9321",
    role: "creator",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "sms",
    createdAt: "2026-08-10T09:15:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89413",
    email: "david.k@expedite-labs.io",
    phone: "+1 (301) 555-7744",
    role: "seller",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-08-12T11:20:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89414",
    email: "sec-admin@connectin.internal",
    phone: "+1 (202) 555-0001",
    role: "admin",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-07-01T08:00:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89415",
    email: "commander.robert.hayes@connectin.com",
    phone: "+1 (202) 555-0001",
    role: "admin",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-07-01T08:00:00Z",
    updatedAt: "2026-08-29T12:00:00Z"
  },
  {
    id: "USR-89420",
    email: "rhoda.mensah@expedite-consults.com",
    phone: "+1 (240) 555-0318",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-09-13T20:45:00Z",
    updatedAt: "2026-09-13T20:45:00Z"
  },
  {
    id: "USR-89421",
    email: "rhoda@connectin.com",
    phone: "+1 (240) 555-0318",
    role: "personal",
    status: "Active",
    mfaEnabled: true,
    mfaChannel: "email",
    createdAt: "2026-09-13T20:45:00Z",
    updatedAt: "2026-09-13T20:45:00Z"
  }
]

const INITIAL_PROFILES: UserProfileRecord[] = [
  {
    userId: "USR-89450",
    name: "Kofi Agyarko",
    headline: "Senior Cloud Infrastructure & Enterprise Systems Specialist · ConnectIn Verified Member",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kofi+Agyarko&backgroundColor=0a66c2",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Accra, Ghana 🇬🇭 · Global Verified Enclave",
    about: "Verified member on ConnectIn Global Network specializing in enterprise systems, cloud security, and cross-border engineering operations.",
    skills: ["Cloud Infrastructure", "Enterprise Systems", "Zero Trust Security", "Project Operations"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_KOFI_AGYARKO",
    skillMatrixScore: 94.2,
    connectionsCount: 380,
    followersCount: 940,
    profileViews: 210,
    postImpressions: 4200,
    profession: "Full-Stack & Cloud Systems Engineer",
    professionId: "software_engineer",
    professionCategory: "Technology, Software & AI",
    professionEnclave: "tech_cybersecurity"
  },
  {
    userId: "USR-89451",
    name: "Isaac Boye",
    headline: "Operations & Technical Specialist · ConnectIn Verified Network",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Isaac+Boye&backgroundColor=0f766e",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Accra, Ghana 🇬🇭 · Global Verified Enclave",
    about: "Verified professional on ConnectIn Global Network driving operational excellence, technical systems delivery, and quality assurance.",
    skills: ["Technical Operations", "Systems Engineering", "Quality Assurance", "Field Compliance"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_ISAAC_BOYE",
    skillMatrixScore: 93.5,
    connectionsCount: 315,
    followersCount: 820,
    profileViews: 185,
    postImpressions: 3600,
    profession: "Licensed Master Electrician",
    professionId: "electrician",
    professionCategory: "Skilled Trades & Construction",
    professionEnclave: "trades_construction"
  },
  {
    userId: "USR-89452",
    name: "Patience Addo",
    headline: "Doctor of Veterinary Medicine (DVM) · Small Animal Surgery, Pharmacology & Preventive Care",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Patience+Addo&backgroundColor=4338ca",
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · Verified Identity",
    about: "Doctor of Veterinary Medicine (DVM) operating in the Healthcare & Clinical Medicine Enclave on ConnectIn.",
    skills: ["Veterinary Surgery", "Pharmacology", "Preventive Care", "Clinical Diagnostics"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_PATIENCE_ADDO",
    skillMatrixScore: 95.0,
    connectionsCount: 410,
    followersCount: 1120,
    profileViews: 260,
    postImpressions: 5100,
    profession: "Doctor of Veterinary Medicine (DVM)",
    professionId: "veterinarian",
    professionCategory: "Healthcare & Medicine",
    professionEnclave: "healthcare_medicine"
  },
  {
    userId: "USR-85100",
    name: "Yaw Appiah",
    headline: "Certified Structural Welder (AWS D1.1 / ASME IX) · TIG Exotic Alloys, Pipe & Ironwork",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · Verified Enclave",
    about: "Certified Structural Welder (AWS D1.1 / ASME IX) specializing in TIG exotic alloys, high-pressure pipefitting, and structural ironwork.",
    skills: ["TIG (GTAW)", "MIG (GMAW)", "Pipe 6G Position", "AWS D1.1 Code", "NDT Testing"],
    clearanceLevel: "Master Tradesman & Site Superintendent (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_YAW_APPIAH",
    skillMatrixScore: 96.0,
    connectionsCount: 490,
    followersCount: 1340,
    profileViews: 310,
    postImpressions: 6400,
    profession: "Certified Master Welder & Structural Fabricator",
    professionId: "welder",
    professionCategory: "Skilled Trades & Construction",
    professionEnclave: "trades_construction"
  },
  {
    userId: "USR-89400",
    name: "Kwesi Asiedu",
    headline: "Founder & Chief Security Officer @ Expedite Consults · Lead AI & GovCloud Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · TS/SCI Cleared",
    about: "Founder of Expedite Consults and ConnectIn. Leading autonomous cyber defense, zero-trust cloud infrastructure, enterprise DevSecOps, and cleared talent systems.",
    skills: ["Zero Trust Architecture", "GovCloud Security", "Enterprise IAM", "eBPF Kernel Defense", "AI AppSec"],
    clearanceLevel: "TS/SCI with Full Scope Polygraph",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_FOUNDER_ROOT_VERIFIED",
    skillMatrixScore: 99.4,
    connectionsCount: 28400,
    followersCount: 82000,
    profileViews: 19400,
    postImpressions: 520000
  },
  {
    userId: "USR-89410",
    name: "Alex Taylor",
    headline: "Lead AI & Cloud Security Architect @ ConnectIn · Top Voice",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · TS/SCI Polygraph Cleared",
    about: "Principal architect specializing in Autonomous Cyber Defense, eBPF Zero Trust kernel enclaves, FedRAMP High authorizations, and next-gen AI systems.",
    skills: ["AWS GovCloud Security", "Kubernetes Zero Trust", "cATO OSCAL Automation", "eBPF Security Probes"],
    clearanceLevel: "TS/SCI with Full Scope Polygraph",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_GOVCLOUD_AUTH_VERIFIED",
    skillMatrixScore: 94.8,
    connectionsCount: 14820,
    followersCount: 38910,
    profileViews: 4120,
    postImpressions: 128900
  },
  {
    userId: "USR-89411",
    name: "Marcus Vance",
    headline: "VP Enterprise Procurement & Spend @ Defense Systems Group",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Reston, VA · Enterprise GovCloud Desk",
    about: "Leading $2.4M enterprise procurement portfolios across defense, aerospace, and mission-critical cloud infrastructure.",
    skills: ["Enterprise Procurement", "FAR / DFARS Compliance", "GovCloud RFPs", "Vendor Risk Management"],
    clearanceLevel: "Secret (DoD Tier 3)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_ENTERPRISE_BUYER_VERIFIED",
    skillMatrixScore: 91.2,
    connectionsCount: 8400,
    followersCount: 19200,
    profileViews: 2840,
    postImpressions: 74200
  },
  {
    userId: "USR-89412",
    name: "Sarah Chen",
    headline: "Executive Producer & Host @ ConnectIn TV · Creator Studio",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "San Francisco, CA · Media Enclave",
    about: "Hosting high-impact deep dives on AI, cyber security, defense innovation, and developer platforms.",
    skills: ["Video Production", "Tech Podcasting", "Developer Advocacy", "AI Journalism"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_CREATOR_VERIFIED",
    skillMatrixScore: 92.5,
    connectionsCount: 11200,
    followersCount: 45000,
    profileViews: 6300,
    postImpressions: 184000
  },
  {
    userId: "USR-89413",
    name: "David K.",
    headline: "Head of Commercial Marketplace @ Expedite Labs · Verified Seller",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Austin, TX · Commercial Hub",
    about: "Managing verified enterprise software products, SaaS subscriptions, and compliance add-ons with $122.7K MRR.",
    skills: ["SaaS Operations", "B2B Sales", "Stripe Connect Escrow", "Product Marketing"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_SELLER_VERIFIED",
    skillMatrixScore: 89.7,
    connectionsCount: 9600,
    followersCount: 22400,
    profileViews: 3950,
    postImpressions: 98000
  },
  {
    userId: "USR-89414",
    name: "Commander Robert Hayes",
    headline: "Platform IAM & Super Administrator · ConnectIn Master Control",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington, DC · Top Secret Security Operations Center",
    about: "Lead Platform IAM Architect and Master Administrator. Managing 14 enterprise control modules, 4.28M user accounts, automated AI moderation, cryptographic audit trails, and zero-trust SIEM telemetry.",
    skills: ["SOC 2 Type II Auditing", "RBAC / ABAC Matrix", "Four-Eyes Approvals", "eBPF SIEM Telemetry", "FedRAMP High IAM"],
    clearanceLevel: "TS/SCI Polygraph (Level 5 Top Secret Enclave)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_SUPER_ADMIN_ROOT_KEY",
    skillMatrixScore: 99.9,
    connectionsCount: 25000,
    followersCount: 95000,
    profileViews: 14200,
    postImpressions: 485000
  },
  {
    userId: "USR-89401",
    name: "Kwesi Asiedu",
    headline: "Founder & Chief Security Officer @ Expedite Consults · Lead AI & GovCloud Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · TS/SCI Cleared",
    about: "Founder of Expedite Consults and ConnectIn. Leading autonomous cyber defense, zero-trust cloud infrastructure, enterprise DevSecOps, and cleared talent systems.",
    skills: ["Zero Trust Architecture", "GovCloud Security", "Enterprise IAM", "eBPF Kernel Defense", "AI AppSec"],
    clearanceLevel: "TS/SCI with Full Scope Polygraph",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_FOUNDER_ROOT_VERIFIED",
    skillMatrixScore: 99.4,
    connectionsCount: 28400,
    followersCount: 82000,
    profileViews: 19400,
    postImpressions: 520000
  },
  {
    userId: "USR-89415",
    name: "Commander Robert Hayes",
    headline: "Platform IAM & Super Administrator · ConnectIn Master Control",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington, DC · Top Secret Security Operations Center",
    about: "Lead Platform IAM Architect and Master Administrator. Managing 14 enterprise control modules, 4.28M user accounts, automated AI moderation, cryptographic audit trails, and zero-trust SIEM telemetry.",
    skills: ["SOC 2 Type II Auditing", "RBAC / ABAC Matrix", "Four-Eyes Approvals", "eBPF SIEM Telemetry", "FedRAMP High IAM"],
    clearanceLevel: "TS/SCI Polygraph (Level 5 Top Secret Enclave)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_SUPER_ADMIN_ROOT_KEY",
    skillMatrixScore: 99.9,
    connectionsCount: 25000,
    followersCount: 95000,
    profileViews: 14200,
    postImpressions: 485000
  },
  {
    userId: "USR-89420",
    name: "Rhoda Mensah",
    headline: "Senior Cyber Compliance & Risk Analyst · ConnectIn Member",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "Washington DC-Baltimore Area · Verified Identity",
    about: "Verified Member on ConnectIn Zero-Trust Network. Specialized in Governance, Risk & Compliance (GRC), FedRAMP audits, and Zero Trust security controls.",
    skills: ["FedRAMP Compliance", "NIST SP 800-53", "Risk Management", "SOC 2 Type II"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_MEMBER_VERIFIED",
    skillMatrixScore: 88.5,
    connectionsCount: 140,
    followersCount: 320,
    profileViews: 95,
    postImpressions: 1200
  },
  {
    userId: "USR-89421",
    name: "Rhoda",
    headline: "Cybersecurity & Technology Professional · ConnectIn Member",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Rhoda&backgroundColor=0a66c2",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: "United States · Cryptographically Verified",
    about: "Verified member on ConnectIn Zero-Trust Network.",
    skills: ["Cloud Security", "Enterprise IAM"],
    clearanceLevel: "Standard Verified Identity (Level 2)",
    fido2MfaVerified: true,
    cryptoVerificationBadge: "0xED25519_SESSION_INITIALIZED",
    skillMatrixScore: 75.0,
    connectionsCount: 12,
    followersCount: 45,
    profileViews: 28,
    postImpressions: 450
  }
]

const INITIAL_POSTS: PostRecord[] = [
  {
    id: "post_live_1",
    authorId: "USR-89410",
    authorName: "Alex Taylor",
    authorHeadline: "Lead AI & Cloud Security Architect @ ConnectIn",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    authorDegree: "1st",
    content: "🚀 We are excited to announce that ConnectIn is now officially live for real technical professionals and defense engineers worldwide! Register your account with 2FA email/SMS verification, test the live Firecracker Linux sandbox, and explore verified bounties.",
    timestamp: "2 hours ago",
    likesCount: 148,
    commentsCount: 32,
    sharesCount: 19,
    feedCategory: "for_you",
    feedSubCategory: "AI discussions",
    hashtags: ["#ConnectIn", "#GovCloud", "#ZeroTrust", "#AIArchitecture"]
  },
  {
    id: "post_live_2",
    authorId: "USR-89411",
    authorName: "Marcus Vance",
    authorHeadline: "VP Enterprise Procurement & Spend @ Defense Systems Group",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    authorDegree: "2nd",
    content: "🏢 We have just funded a new $25,000 Zero-Trust eBPF Kernel Policy Bounty in escrow on ConnectIn. Looking for cleared kernel engineers to submit verified pull requests!",
    timestamp: "4 hours ago",
    likesCount: 94,
    commentsCount: 18,
    sharesCount: 12,
    feedCategory: "products",
    feedSubCategory: "Deals",
    hashtags: ["#Bounties", "#eBPF", "#CyberSecurity", "#GovCloud"]
  }
]

// In-Memory Database Store (with /tmp & file persistence for Vercel + local dev)
class ConnectInDatabase {
  private data: ConnectInDatabaseSchema
  private dbFilePath: string
  private tmpFilePath: string

  constructor() {
    const primaryDir = path.join(process.cwd(), "data", "db")
    try {
      if (!fs.existsSync(primaryDir)) fs.mkdirSync(primaryDir, { recursive: true })
    } catch {}
    this.dbFilePath = path.join(primaryDir, "connectin_db.json")
    this.tmpFilePath = path.join(os.tmpdir(), "connectin_db.json")
    this.data = this.loadData()
  }

  private getReadableDbPaths(): string[] {
    const paths: string[] = []
    try {
      if (fs.existsSync(this.tmpFilePath)) paths.push(this.tmpFilePath)
    } catch {}
    try {
      if (fs.existsSync(this.dbFilePath)) paths.push(this.dbFilePath)
    } catch {}
    return paths
  }

  private loadData(): ConnectInDatabaseSchema {
    try {
      const userMap = new Map<string, UserRecord>()
      const profileMap = new Map<string, UserProfileRecord>()
      let sessions: SessionRecord[] = []
      let otps: OTPRecord[] = []
      let posts: PostRecord[] = INITIAL_POSTS
      let activityLogs: any[] = []

      for (const filePath of this.getReadableDbPaths()) {
        try {
          const raw = fs.readFileSync(filePath, "utf8")
          const parsed = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.users)) {
            for (const u of parsed.users) {
              if (u && u.id && !userMap.has(u.id)) userMap.set(u.id, u)
            }
            for (const p of (parsed.profiles || [])) {
              if (p && p.userId && !profileMap.has(p.userId)) profileMap.set(p.userId, p)
            }
            if (sessions.length === 0 && Array.isArray(parsed.sessions)) sessions = parsed.sessions
            if (otps.length === 0 && Array.isArray(parsed.otps)) otps = parsed.otps
            if (Array.isArray(parsed.posts) && parsed.posts.length > 0) posts = parsed.posts
            if (activityLogs.length === 0 && Array.isArray(parsed.activityLogs)) activityLogs = parsed.activityLogs
          }
        } catch {}
      }

      for (const u of INITIAL_USERS) {
        if (!userMap.has(u.id)) userMap.set(u.id, u)
      }
      for (const p of INITIAL_PROFILES) {
        if (!profileMap.has(p.userId)) profileMap.set(p.userId, p)
      }

      const result: any = {
        users: Array.from(userMap.values()),
        profiles: Array.from(profileMap.values()),
        sessions,
        otps,
        posts,
        activityLogs
      }
      return result
    } catch (e) {
      console.warn("Could not read persistent DB file, initializing fresh store:", e)
    }

    return {
      users: [...INITIAL_USERS],
      profiles: [...INITIAL_PROFILES],
      sessions: [],
      otps: [],
      posts: [...INITIAL_POSTS]
    }
  }

  public refreshFromDisk() {
    try {
      const userMap = new Map<string, UserRecord>()
      const profileMap = new Map<string, UserProfileRecord>()

      // 1. Put current in-memory users FIRST (newest at index 0)
      for (const u of this.data.users) {
        if (u && u.id && !userMap.has(u.id)) userMap.set(u.id, u)
      }
      for (const p of this.data.profiles) {
        if (p && p.userId && !profileMap.has(p.userId)) profileMap.set(p.userId, p)
      }

      // 2. Merge persisted disk users (/tmp first, then project data/db)
      for (const filePath of this.getReadableDbPaths()) {
        try {
          const raw = fs.readFileSync(filePath, "utf8")
          const parsed = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.users)) {
            for (const u of parsed.users) {
              if (u && u.id && !userMap.has(u.id)) userMap.set(u.id, u)
            }
            for (const p of (parsed.profiles || [])) {
              if (p && p.userId && !profileMap.has(p.userId)) profileMap.set(p.userId, p)
            }
            if (Array.isArray(parsed.activityLogs)) {
              const existingLogs = (this.data as any).activityLogs || []
              const logMap = new Map<string, any>()
              ;[...existingLogs, ...parsed.activityLogs].forEach((l: any) => {
                if (l && l.id && !logMap.has(l.id)) logMap.set(l.id, l)
              })
              ;(this.data as any).activityLogs = Array.from(logMap.values()).slice(0, 500)
            }
          }
        } catch {}
      }

      // 3. Ensure anchor users exist at the end
      for (const u of INITIAL_USERS) {
        if (!userMap.has(u.id)) userMap.set(u.id, u)
      }
      for (const p of INITIAL_PROFILES) {
        if (!profileMap.has(p.userId)) profileMap.set(p.userId, p)
      }

      this.data.users = Array.from(userMap.values())
      this.data.profiles = Array.from(profileMap.values())
    } catch (e) {
      // keep in-memory
    }
  }

  private saveData() {
    const serialized = JSON.stringify(this.data, null, 2)
    try {
      fs.writeFileSync(this.tmpFilePath, serialized, "utf8")
    } catch {}
    try {
      fs.writeFileSync(this.dbFilePath, serialized, "utf8")
    } catch {}
  }

  // ─── USER & AUTH OPERATIONS ───

  public getUsers(): UserRecord[] {
    this.refreshFromDisk()
    return this.data.users
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    this.refreshFromDisk()
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
  }

  public findUserByPhone(phone: string): UserRecord | undefined {
    this.refreshFromDisk()
    const clean = phone.replace(/[^\d]/g, "")
    if (!clean) return undefined
    return this.data.users.find(u => u.phone && u.phone.replace(/[^\d]/g, "") === clean)
  }

  public findUserById(id: string): UserRecord | undefined {
    this.refreshFromDisk()
    return this.data.users.find(u => u.id === id)
  }

  public findProfileByUserId(userId: string): UserProfileRecord | undefined {
    this.refreshFromDisk()
    return this.data.profiles.find(p => p.userId === userId)
  }

  public createUser(user: Omit<UserRecord, "id" | "createdAt" | "updatedAt">, profile: Omit<UserProfileRecord, "userId">): { user: UserRecord; profile: UserProfileRecord } {
    this.refreshFromDisk()
    const userId = `USR-${Math.floor(10000 + Math.random() * 90000)}`
    const now = new Date().toISOString()

    const newUser: UserRecord = {
      ...user,
      id: userId,
      createdAt: now,
      updatedAt: now
    }

    const newProfile: UserProfileRecord = {
      ...profile,
      userId
    }

    this.data.users.unshift(newUser)
    this.data.profiles.unshift(newProfile)
    this.saveData()

    return { user: newUser, profile: newProfile }
  }

  public touchUserLogin(userId: string, authProvider?: string): void {
    this.refreshFromDisk()
    const idx = this.data.users.findIndex(u => u.id === userId)
    if (idx === -1) return
    const now = new Date().toISOString()
    const user = this.data.users[idx]
    user.updatedAt = now
    ;(user as any).lastLoginAt = now
    if (authProvider) {
      ;(user as any).authProvider = authProvider
    }
    if (idx > 0) {
      this.data.users.splice(idx, 1)
      this.data.users.unshift(user)
    }
    this.saveData()
  }

  public mergeCloudUsers(items: any[]): void {
    this.refreshFromDisk()
    let modified = false

    for (const item of items) {
      if (!item || !item.email) continue
      const cleanEmail = String(item.email).toLowerCase().trim()
      const cleanName = String(item.name || cleanEmail.split("@")[0]).trim()

      let existingUser = this.data.users.find(u => {
        const p = this.data.profiles.find(pr => pr.userId === u.id)
        const pName = (p?.name || "").toLowerCase().trim()
        const targetName = cleanName.toLowerCase().trim()
        if (pName && targetName && pName !== targetName) {
          return false
        }
        if (item.id && u.id === item.id) return true
        return u.email.toLowerCase().trim() === cleanEmail && (!pName || pName === targetName)
      })

      if (!existingUser) {
        const newId = item.id && !this.findUserById(item.id)
          ? item.id
          : `USR-${Math.floor(10000 + Math.random() * 90000)}`
        const newUser: any = {
          id: newId,
          email: cleanEmail,
          phone: item.phone || "",
          role: item.role || "personal",
          status: item.status || "Active",
          mfaEnabled: true,
          mfaChannel: item.mfaChannel || "email",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || item.lastLoginAt || new Date().toISOString(),
          lastLoginAt: item.lastLoginAt || item.updatedAt || new Date().toISOString(),
          authProvider: item.authProvider,
          countryName: item.countryName,
          countryCode: item.countryCode,
          isOutsideUS: item.isOutsideUS,
          ipAddress: item.ipAddress
        }
        const newProfile: UserProfileRecord = {
          userId: newId,
          name: cleanName,
          headline: item.headline || item.profession || "Verified ConnectIn Member",
          avatar:
            item.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName + "-" + cleanEmail)}&backgroundColor=0a66c2`,
          coverImage:
            item.coverImage ||
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
          location: item.location || "Global Verified Member",
          about: item.about || `Verified professional on ConnectIn.`,
          skills: Array.isArray(item.skills) ? item.skills : [],
          clearanceLevel: "Standard Verified Identity (Level 2)",
          fido2MfaVerified: true,
          cryptoVerificationBadge: `0xED25519_${newId}`,
          skillMatrixScore: 92.0,
          connectionsCount: 0,
          followersCount: 0,
          profileViews: 1,
          postImpressions: 0,
          profession: item.profession,
          professionId: item.professionId,
          professionCategory: item.professionCategory,
          professionEnclave: item.professionEnclave
        }
        this.data.users.unshift(newUser)
        this.data.profiles.unshift(newProfile)
        modified = true
      } else {
        const uAny = existingUser as any
        if (item.lastLoginAt && (!uAny.lastLoginAt || new Date(item.lastLoginAt) >= new Date(uAny.lastLoginAt))) {
          uAny.lastLoginAt = item.lastLoginAt
          uAny.updatedAt = item.updatedAt || item.lastLoginAt
          modified = true
        }
        if (item.authProvider && !uAny.authProvider) {
          uAny.authProvider = item.authProvider
          modified = true
        }
        if (item.countryName) uAny.countryName = item.countryName
        if (item.countryCode) uAny.countryCode = item.countryCode
        if (item.isOutsideUS !== undefined) uAny.isOutsideUS = item.isOutsideUS
        if (item.ipAddress) uAny.ipAddress = item.ipAddress

        const existingProf = this.data.profiles.find(p => p.userId === existingUser!.id)
        if (existingProf) {
          if (item.location && (!existingProf.location || existingProf.location.includes("United States"))) {
            existingProf.location = item.location
            modified = true
          }
          if (item.headline && (!existingProf.headline || existingProf.headline.includes("ConnectIn Member"))) {
            existingProf.headline = item.headline
            modified = true
          }
          if (item.profession && !existingProf.profession) {
            existingProf.profession = item.profession
            existingProf.professionId = item.professionId
            existingProf.professionCategory = item.professionCategory
            existingProf.professionEnclave = item.professionEnclave
            modified = true
          }
          if (item.avatar && (!existingProf.avatar || existingProf.avatar.includes("api.dicebear.com"))) {
            existingProf.avatar = item.avatar
            modified = true
          }
        }
      }
    }

    if (modified) {
      this.saveData()
    }
  }

  public updateUser(userId: string, updates: Partial<UserRecord>): boolean {
    const user = this.data.users.find(u => u.id === userId)
    if (!user) return false
    Object.assign(user, updates, { updatedAt: new Date().toISOString() })
    this.saveData()
    return true
  }

  public updateUserStatus(userId: string, status: UserRecord["status"]): boolean {
    const user = this.data.users.find(u => u.id === userId)
    if (!user) return false
    user.status = status
    user.updatedAt = new Date().toISOString()
    this.saveData()
    return true
  }

  public updateUserProfile(
    identifier: { userId?: string; email?: string; name?: string; role?: UserRecord["role"] },
    updates: Partial<UserProfileRecord>
  ): UserProfileRecord | null {
    this.refreshFromDisk()
    const cleanEmail = String(identifier.email || "").toLowerCase().trim()
    const cleanName = String(updates.name || identifier.name || "").trim()

    let user: UserRecord | undefined
    let profile: UserProfileRecord | undefined

    if (identifier.userId) {
      const candidateUser = this.findUserById(identifier.userId)
      const candidateProfile = this.findProfileByUserId(identifier.userId)
      if (
        candidateUser &&
        candidateProfile &&
        (!cleanName || candidateProfile.name.toLowerCase().trim() === cleanName.toLowerCase())
      ) {
        user = candidateUser
        profile = candidateProfile
      }
    }

    if (!profile && cleanEmail) {
      const matchingUsers = this.data.users.filter(u => u.email.toLowerCase().trim() === cleanEmail)
      for (const u of matchingUsers) {
        const p = this.findProfileByUserId(u.id)
        if (p && (!cleanName || p.name.toLowerCase().trim() === cleanName.toLowerCase())) {
          user = u
          profile = p
          break
        }
      }
    }

    if (!profile && cleanName) {
      const p = this.data.profiles.find(
        item => item.name.toLowerCase().trim() === cleanName.toLowerCase()
      )
      if (p) {
        const u = this.findUserById(p.userId)
        if (!cleanEmail || (u && u.email.toLowerCase().trim() === cleanEmail)) {
          user = u
          profile = p
        }
      }
    }

    if (profile) {
      Object.assign(profile, {
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.headline ? { headline: updates.headline } : {}),
        ...(updates.avatar ? { avatar: updates.avatar } : {}),
        ...(updates.coverImage ? { coverImage: updates.coverImage } : {}),
        ...(updates.location ? { location: updates.location } : {}),
        ...(updates.about ? { about: updates.about } : {}),
        ...(updates.skills ? { skills: updates.skills } : {}),
        ...(updates.profession ? { profession: updates.profession } : {}),
        ...(updates.professionId ? { professionId: updates.professionId } : {}),
        ...(updates.professionCategory ? { professionCategory: updates.professionCategory } : {}),
        ...(updates.professionEnclave ? { professionEnclave: updates.professionEnclave } : {})
      })
      if (user) {
        user.updatedAt = new Date().toISOString()
      }
      this.saveData()
      return profile
    }

    // Auto-register new user & profile if not yet present in server store
    if (cleanEmail || cleanName) {
      const resolvedId =
        identifier.userId && !this.findUserById(identifier.userId)
          ? identifier.userId
          : `USR-${Math.floor(10000 + Math.random() * 90000)}`
      const now = new Date().toISOString()
      const resolvedEmail = cleanEmail || `${cleanName.toLowerCase().replace(/\s+/g, ".")}@connectin.app`
      const resolvedName = cleanName || resolvedEmail.split("@")[0]

      const newUser: UserRecord = {
        id: resolvedId,
        email: resolvedEmail,
        role: identifier.role || "personal",
        status: "Active",
        mfaEnabled: true,
        mfaChannel: "email",
        createdAt: now,
        updatedAt: now
      }

      const newProfile: UserProfileRecord = {
        userId: resolvedId,
        name: resolvedName,
        headline: updates.headline || updates.profession || "Verified ConnectIn Member",
        avatar: updates.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName + "-" + resolvedEmail)}&backgroundColor=0a66c2`,
        coverImage: updates.coverImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
        location: updates.location || "United States · Verified",
        about: updates.about || `Verified professional on ConnectIn.`,
        skills: updates.skills || [],
        clearanceLevel: "Standard Verified Identity (Level 2)",
        fido2MfaVerified: true,
        cryptoVerificationBadge: `0xED25519_${resolvedId}`,
        skillMatrixScore: 92.0,
        connectionsCount: 0,
        followersCount: 0,
        profileViews: 1,
        postImpressions: 0,
        profession: updates.profession,
        professionId: updates.professionId,
        professionCategory: updates.professionCategory,
        professionEnclave: updates.professionEnclave
      }

      this.data.users.unshift(newUser)
      this.data.profiles.unshift(newProfile)
      this.saveData()
      return newProfile
    }

    return null
  }

  // ─── OTP OPERATIONS ───

  public setOTP(target: string, code: string, ttlMinutes = 10): void {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000
    this.data.otps = this.data.otps.filter(o => o.target.toLowerCase() !== target.toLowerCase())
    this.data.otps.push({ target: target.toLowerCase(), code, expiresAt, attempts: 0 })
    this.saveData()
  }

  public verifyOTP(target: string, code: string): boolean {
    const record = this.data.otps.find(o => o.target.toLowerCase() === target.toLowerCase())
    if (!record) return false

    if (Date.now() > record.expiresAt) {
      this.data.otps = this.data.otps.filter(o => o.target.toLowerCase() !== target.toLowerCase())
      this.saveData()
      return false
    }

    if (record.code !== code.trim()) {
      record.attempts += 1
      this.saveData()
      return false
    }

    // Success: consume OTP
    this.data.otps = this.data.otps.filter(o => o.target.toLowerCase() !== target.toLowerCase())
    this.saveData()
    return true
  }

  // ─── SESSION OPERATIONS ───

  public createSession(userId: string, metadata: { ipAddress: string; userAgent: string; location?: string }): SessionRecord {
    const user = this.findUserById(userId)
    const profile = this.findProfileByUserId(userId)

    let session: SessionRecord

    if (user && profile) {
      const signed = createSignedSessionToken(user, profile, metadata)
      session = signed.sessionRecord
    } else {
      const sessionId = `sess_live_${crypto.randomBytes(16).toString("hex")}`
      const token = crypto.randomBytes(32).toString("hex")
      const now = new Date().toISOString()
      const deviceName = metadata.userAgent.includes("Mac")
        ? "Safari / macOS"
        : metadata.userAgent.includes("iPhone")
        ? "ConnectIn iOS App"
        : metadata.userAgent.includes("Android")
        ? "ConnectIn Android App"
        : "Chrome / Windows Desktop"

      session = {
        sessionId,
        userId,
        token,
        ipAddress: metadata.ipAddress || "127.0.0.1",
        userAgent: metadata.userAgent || "Unknown Browser",
        deviceName,
        location: metadata.location || "United States · Secure Enclave",
        createdAt: now,
        lastActive: now,
        isActive: true
      }
    }

    // Deactivate previous active markers for this user
    this.data.sessions.forEach(s => {
      if (s.userId === userId) s.isActive = false
    })

    this.data.sessions.unshift(session)
    this.saveData()
    return session
  }

  public findSessionByToken(token: string): SessionRecord | undefined {
    // 1. Check in-memory store
    const existing = this.data.sessions.find(s => s.token === token && s.isActive)
    if (existing) return existing

    // 2. Decode and verify cryptographically signed token (cross-lambda stateless support)
    try {
      const payload = verifySignedSessionToken(token)
      if (payload) {
        // Auto-hydrate user if missing on this lambda
        let user = this.findUserById(payload.userId)
        if (!user) {
          user = {
            id: payload.userId,
            email: payload.email,
            phone: payload.phone || "",
            role: payload.role || "personal",
            status: payload.status || "Active",
            mfaEnabled: true,
            mfaChannel: "email",
            createdAt: payload.createdAt,
            updatedAt: payload.createdAt
          }
          this.data.users.unshift(user)
        }

        // Auto-hydrate profile if missing on this lambda
        let profile = this.findProfileByUserId(payload.userId)
        if (!profile) {
          profile = payload.profile || {
            userId: payload.userId,
            name: payload.email.split("@")[0],
            headline: "Verified ConnectIn Member",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.email)}`,
            coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
            location: "United States · Cryptographically Verified",
            about: "Verified member on ConnectIn Zero-Trust Network.",
            skills: [],
            clearanceLevel: "Standard Verified Identity (Level 2)",
            fido2MfaVerified: true,
            cryptoVerificationBadge: "0xED25519_SESSION_ACTIVE",
            skillMatrixScore: 50.0,
            connectionsCount: 0,
            followersCount: 0,
            profileViews: 0,
            postImpressions: 0
          }
          this.data.profiles.unshift(profile)
        }

        const restoredSession: SessionRecord = {
          sessionId: payload.sessionId,
          userId: payload.userId,
          token,
          ipAddress: payload.ipAddress,
          userAgent: "Decoded Authenticated Client",
          deviceName: payload.deviceName,
          location: payload.location,
          createdAt: payload.createdAt,
          lastActive: new Date().toISOString(),
          isActive: true
        }

        this.data.sessions.unshift(restoredSession)
        this.saveData()
        return restoredSession
      }
    } catch (e) {
      console.warn("[findSessionByToken] Decode notice:", e)
    }

    return undefined
  }

  public revokeSession(sessionId: string): boolean {
    const session = this.data.sessions.find(s => s.sessionId === sessionId)
    if (!session) return false
    session.isActive = false
    this.saveData()
    return true
  }

  public getUserSessions(userId: string): SessionRecord[] {
    return this.data.sessions.filter(s => s.userId === userId)
  }

  // ─── POST OPERATIONS ───

  public getPosts(): PostRecord[] {
    return this.data.posts
  }

  public createPost(post: Omit<PostRecord, "id" | "timestamp" | "likesCount" | "commentsCount" | "sharesCount">): PostRecord {
    const newPost: PostRecord = {
      ...post,
      id: `post_live_${Date.now()}`,
      timestamp: "Just Now",
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0
    }
    this.data.posts.unshift(newPost)
    this.saveData()
    return newPost
  }

  public likePost(postId: string): boolean {
    const post = this.data.posts.find(p => p.id === postId)
    if (!post) return false
    post.likesCount = post.isLiked ? post.likesCount - 1 : post.likesCount + 1
    post.isLiked = !post.isLiked
    this.saveData()
    return true
  }

  // ─── ADMIN DIRECTORY & ACTIVITY LOGS ───

  public recordActivity(event: any) {
    this.refreshFromDisk()
    const logs = (this.data as any).activityLogs || []
    ;(this.data as any).activityLogs = [event, ...logs.filter((e: any) => e.id !== event.id)].slice(0, 500)
    this.saveData()
    return event
  }

  public getActivityLogs(): any[] {
    this.refreshFromDisk()
    return (this.data as any).activityLogs || []
  }

  public getAllUsersWithProfiles() {
    this.refreshFromDisk()
    return this.data.users.map(user => {
      const profile = this.data.profiles.find(p => p.userId === user.id)
      return {
        id: user.id,
        name: profile?.name || user.email.split("@")[0],
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        headline: profile?.headline || "ConnectIn Member",
        avatar: profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=0a66c2`,
        clearanceLevel: profile?.clearanceLevel || "Standard Identity",
        createdAt: user.createdAt,
        skills: profile?.skills || [],
        profession: profile?.profession,
        professionId: profile?.professionId,
        professionCategory: profile?.professionCategory,
        professionEnclave: profile?.professionEnclave,
        cryptoVerificationBadge: profile?.cryptoVerificationBadge
      }
    })
  }
}

// Global Singleton Instance
declare global {
  var __connectinDb: ConnectInDatabase | undefined
}

export const connectinDb = globalThis.__connectinDb || new ConnectInDatabase()
globalThis.__connectinDb = connectinDb
