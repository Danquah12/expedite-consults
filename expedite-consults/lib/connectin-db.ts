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
    id: "USR-89400",
    email: "kasiedu@expedite-consults.com",
    phone: "+1 (240) 262-3543",
    role: "personal",
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
    role: "personal",
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
  }
]

const INITIAL_PROFILES: UserProfileRecord[] = [
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

// In-Memory Database Store (with file persistence fallback for local dev)
class ConnectInDatabase {
  private data: ConnectInDatabaseSchema
  private dbFilePath: string

  constructor() {
    try {
      this.dbFilePath = path.join(os.tmpdir(), "connectin_db.json")
    } catch {
      this.dbFilePath = path.join(process.cwd(), ".connectin_db.json")
    }
    this.data = this.loadData()
  }

  private loadData(): ConnectInDatabaseSchema {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, "utf8")
        return JSON.parse(raw)
      }
    } catch (e) {
      console.warn("Could not read persistent DB file, initializing fresh store:", e)
    }

    return {
      users: INITIAL_USERS,
      profiles: INITIAL_PROFILES,
      sessions: [],
      otps: [],
      posts: INITIAL_POSTS
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data, null, 2), "utf8")
    } catch (e) {
      // In serverless read-only environments (Vercel lambdas), memory stays hot
    }
  }

  // ─── USER & AUTH OPERATIONS ───

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
  }

  public findUserByPhone(phone: string): UserRecord | undefined {
    const clean = phone.replace(/[^\d]/g, "")
    if (!clean) return undefined
    return this.data.users.find(u => u.phone && u.phone.replace(/[^\d]/g, "") === clean)
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id)
  }

  public findProfileByUserId(userId: string): UserProfileRecord | undefined {
    return this.data.profiles.find(p => p.userId === userId)
  }

  public createUser(user: Omit<UserRecord, "id" | "createdAt" | "updatedAt">, profile: Omit<UserProfileRecord, "userId">): { user: UserRecord; profile: UserProfileRecord } {
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

  public updateUserStatus(userId: string, status: UserRecord["status"]): boolean {
    const user = this.data.users.find(u => u.id === userId)
    if (!user) return false
    user.status = status
    user.updatedAt = new Date().toISOString()
    this.saveData()
    return true
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

  // ─── ADMIN DIRECTORY ───

  public getAllUsersWithProfiles() {
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
        avatar: profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`,
        clearanceLevel: profile?.clearanceLevel || "Standard Identity",
        createdAt: user.createdAt
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
