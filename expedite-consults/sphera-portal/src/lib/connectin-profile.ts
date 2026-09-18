import { UserProfile } from "./linkedin-data"

export interface UserInitParams {
  id?: string
  name?: string
  email: string
  role?: 'personal' | 'enterprise' | 'creator' | 'seller' | 'developer' | 'admin'
  avatar?: string
  headline?: string
  location?: string
  phone?: string
  about?: string
}

export function resolveDisplayName(rawName?: string, email?: string): string {
  if (rawName && rawName.trim().length > 0) {
    return rawName.trim()
  }
  const cleanEmail = (email || "").toLowerCase().trim()
  if (cleanEmail === "asiedudanquah@gmail.com" || cleanEmail.includes("asiedudanquah")) {
    return "Kwesi Asiedu"
  }
  if (cleanEmail === "kasiedu@expedite-consults.com" || cleanEmail === "kasiedu@expediteconsults.com" || cleanEmail.includes("kasiedu")) {
    return "Emmanuel Asiedu"
  }
  const prefix = cleanEmail.split("@")[0] || ""
  if (prefix.includes(".") || prefix.includes("_") || prefix.includes("-")) {
    return prefix.split(/[._-]/).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
  }
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "ConnectIn Member"
}

export function isSuperAdminUser(userOrEmailOrName?: any): boolean {
  if (!userOrEmailOrName) return false

  if (typeof userOrEmailOrName === "string") {
    const s = userOrEmailOrName.toLowerCase().trim()
    return (
      s === "sec-admin@connectin.internal" ||
      s.includes("admin") ||
      s.includes("commander") ||
      s.includes("robert.hayes") ||
      s.includes("robert hayes") ||
      s.includes("kasiedu") ||
      s.includes("asiedudanquah") ||
      s.includes("alex.taylor") ||
      s.includes("alex taylor") ||
      s.includes("kwesi asiedu") ||
      s.includes("emmanuel asiedu")
    )
  }

  const role = String(userOrEmailOrName.role || "").toLowerCase()
  const roles: string[] = Array.isArray(userOrEmailOrName.roles)
    ? userOrEmailOrName.roles.map((r: any) => String(r).toUpperCase())
    : []
  const email = String(userOrEmailOrName.email || "").toLowerCase().trim()
  const name = String(userOrEmailOrName.name || "").toLowerCase().trim()

  if (
    role === "admin" ||
    roles.includes("SUPER_ADMIN") ||
    roles.includes("PLATFORM_ADMIN") ||
    roles.includes("FOUNDER & CSO") ||
    roles.some((r) => r.includes("ADMIN"))
  ) {
    return true
  }

  if (
    email === "sec-admin@connectin.internal" ||
    email.includes("admin") ||
    email.includes("commander") ||
    email.includes("robert.hayes") ||
    email.includes("kasiedu") ||
    email.includes("asiedudanquah") ||
    email.includes("alex.taylor")
  ) {
    return true
  }

  if (
    name.includes("commander") ||
    name.includes("robert hayes") ||
    name.includes("kwesi asiedu") ||
    name.includes("emmanuel asiedu") ||
    name.includes("alex taylor")
  ) {
    return true
  }

  return false
}

/**
 * Builds a rich, fully populated, unique UserProfile for any authenticated user.
 * Each user gets distinct identity, experience, headline, avatar, and metrics while sharing common ecosystem capabilities.
 */
export function createUniqueUserProfile(params: UserInitParams): UserProfile {
  const cleanEmail = (params.email || "member@connectin.com").toLowerCase().trim()
  const cleanName = resolveDisplayName(params.name, cleanEmail)
  
  const isAdmin = isSuperAdminUser({ ...params, name: cleanName, email: cleanEmail })
  const role = isAdmin ? "admin" : (params.role || "personal")
  const userId = params.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`

  // If Commander Robert Hayes or specific seeded personas, provide official portraits
  let avatarUrl = params.avatar
  if (!avatarUrl) {
    if (cleanName.includes("Commander Robert Hayes") || cleanEmail.includes("robert.hayes") || cleanEmail === "sec-admin@connectin.internal") {
      avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
    } else if (cleanName.includes("Kwesi Asiedu") || cleanEmail.includes("kasiedu") || cleanEmail.includes("asiedudanquah")) {
      avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
    } else if (cleanName.includes("Alex Taylor") || cleanEmail.includes("alex.taylor")) {
      avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
    } else {
      const avatarSeed = encodeURIComponent(`${cleanName}-${cleanEmail}`)
      avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`
    }
  }

  const roleTitle = isAdmin ? "Platform Super Administrator" : (role.charAt(0).toUpperCase() + role.slice(1))
  const headline = params.headline || (
    isAdmin
      ? "Platform IAM & Super Administrator · ConnectIn Master Control"
      : `${roleTitle} Professional · ConnectIn Member`
  )
  const about = params.about || (
    isAdmin
      ? "Lead Platform IAM Architect and Master Administrator. Managing enterprise control modules, user directories, automated moderation, cryptographic audit trails, and zero-trust SIEM telemetry."
      : `Verified ${roleTitle} member on ConnectIn Zero-Trust Network.`
  )

  const profile: any = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    role,
    roles: isAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"],
    clearanceLevel: isAdmin ? "TS/SCI Polygraph (Level 5 Top Secret Enclave)" : "Standard Verified Identity (Level 2)",
    headline,
    avatar: avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: params.location || (isAdmin ? "Washington, DC · Top Secret Security Operations Center" : "United States · Cryptographically Verified"),
    connectionsCount: isAdmin ? 42800 : 0,
    followersCount: isAdmin ? 98400 : 0,
    profileViews: isAdmin ? 19400 : 0,
    postImpressions: isAdmin ? 520000 : 0,
    searchAppearances: 0,
    profileStrength: isAdmin ? 100 : 45,
    about,
    openToWork: {
      isOpen: false,
      roles: [],
      jobTypes: ["Full-time", "Contract"],
      locations: ["Remote", "United States"]
    },
    featured: [],
    experience: [],
    education: [],
    certifications: [
      {
        id: `cert_${userId}_1`,
        title: isAdmin ? "VeritasLens™ Root Level 5 Cryptographic Authority" : "VeritasLens™ Cryptographic Identity Verification (Level 2)",
        issuer: "Expedite Consults Identity Authority",
        issuerLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80",
        issueDate: "Current",
        credentialId: `0xED25519_${userId.toUpperCase().slice(0, 8)}`,
        credentialUrl: "/veritaslens"
      }
    ],
    skills: isAdmin ? [
      { name: "Zero Trust IAM", endorsementsCount: 84 },
      { name: "eBPF SIEM Telemetry", endorsementsCount: 72 },
      { name: "SOC 2 Type II Auditing", endorsementsCount: 65 }
    ] : [],
    recommendations: []
  }

  return profile
}
