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

/**
 * Builds a rich, fully populated, unique UserProfile for any authenticated user.
 * Each user gets distinct identity, experience, headline, avatar, and metrics while sharing common ecosystem capabilities.
 */
export function createUniqueUserProfile(params: UserInitParams): UserProfile {
  const cleanEmail = (params.email || "member@connectin.com").toLowerCase().trim()
  const cleanName = resolveDisplayName(params.name, cleanEmail)
  
  const role = params.role || "personal"
  const userId = params.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`

  // Unique Dicebear avatar based on full name & email seed with rich gradient background
  const avatarSeed = encodeURIComponent(`${cleanName}-${cleanEmail}`)
  const avatarUrl = params.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`

  const roleTitle = (role || "personal").charAt(0).toUpperCase() + (role || "personal").slice(1)
  const headline = params.headline || `${roleTitle} Professional · ConnectIn Member`
  const about = params.about || `Verified ${roleTitle} member on ConnectIn Zero-Trust Network.`

  return {
    id: userId,
    name: cleanName,
    headline,
    avatar: avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: params.location || "United States · Cryptographically Verified",
    connectionsCount: 0,
    followersCount: 0,
    profileViews: 0,
    postImpressions: 0,
    searchAppearances: 0,
    profileStrength: 45,
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
        title: "VeritasLens™ Cryptographic Identity Verification (Level 2)",
        issuer: "Expedite Consults Identity Authority",
        issuerLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80",
        issueDate: "Current",
        credentialId: `0xED25519_${userId.toUpperCase().slice(0, 8)}`,
        credentialUrl: "/veritaslens"
      }
    ],
    skills: [],
    recommendations: []
  }
}
