import { UserProfile } from "./linkedin-data"

export interface UserInitParams {
  id?: string
  name: string
  email: string
  role?: 'personal' | 'enterprise' | 'creator' | 'seller' | 'developer' | 'admin'
  avatar?: string
  headline?: string
  location?: string
  phone?: string
}

export function resolveDisplayName(rawName?: string, email?: string): string {
  if (rawName && rawName.trim().length > 0 && rawName.trim().toLowerCase() !== "kasiedu") {
    return rawName.trim()
  }
  const cleanEmail = (email || "").toLowerCase().trim()
  if (cleanEmail.includes("kasiedu") || cleanEmail.includes("asiedudanquah") || cleanEmail.includes("asiedu") || cleanEmail.includes("emmanuel")) {
    return "Emmanuel Asiedu"
  }
  const prefix = cleanEmail.split("@")[0] || ""
  if (prefix.includes(".") || prefix.includes("_") || prefix.includes("-")) {
    return prefix.split(/[._-]/).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
  }
  if (rawName && rawName.trim().length > 0) {
    return rawName.trim()
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

  // Role-tailored headline and about details
  let headline = params.headline
  let about = ""
  let primaryCompany = "Expedite Consults"
  let primaryRole = "Senior Technology Consultant"
  let clearance = "Standard Identity (Level 2 Verified)"
  let defaultSkills = ["Zero Trust Architecture", "Cloud Engineering", "Enterprise Systems", "Cyber Security", "Next.js"]

  if (role === "enterprise") {
    headline = headline || `VP Enterprise Procurement & Spend · Defense Systems & GovCloud Partner`
    about = `Executive procurement leader with 12+ years directing institutional acquisitions, GovCloud infrastructure, and multi-million dollar defense IT vendor contracts.`
    primaryRole = "VP Enterprise Procurement"
    primaryCompany = "Defense Systems Group"
    clearance = "Secret (DoD Tier 3 Verified)"
    defaultSkills = ["Enterprise Procurement", "FAR / DFARS Compliance", "GovCloud RFPs", "Vendor Risk Management", "Capital Allocation"]
  } else if (role === "creator") {
    headline = headline || `Host @ Defense & Tech Pulse · Executive Content Producer · Top Voice`
    about = `Digital media host and technical storyteller covering AI autonomy, government cloud modernization, and deep-tech founder interviews.`
    primaryRole = "Executive Producer & Host"
    primaryCompany = "ConnectIn Studio Labs"
    defaultSkills = ["Tech Podcasting", "Keynote Production", "Developer Evangelism", "Media Syndication"]
  } else if (role === "seller") {
    headline = headline || `Enterprise Solutions Architect & Marketplace Advisory Partner ($120K+ MRR)`
    about = `Monetizing enterprise-grade software licenses, cybersecurity audit suites, and fractional CTO advisory across Fortune 500 defense and finance sectors.`
    primaryRole = "Managing Partner & Solutions Lead"
    primaryCompany = "Expedite Advisory Services"
    defaultSkills = ["Advisory Marketplace", "Software Licensing", "Cloud Architecture Audits", "SOC 2 Readiness"]
  } else if (role === "developer") {
    headline = headline || `Principal Systems & Kernel Security Engineer · eBPF & Zero-Trust Enclaves`
    about = `Low-level systems architect specializing in Linux kernel security probes, Firecracker microVM enclaves, Rust, and cATO automation.`
    primaryRole = "Principal Systems Engineer"
    primaryCompany = "Cyber Defense Research Labs"
    clearance = "TS/SCI with Polygraph"
    defaultSkills = ["eBPF Kernel Probes", "Rust / C++", "Kubernetes Enclaves", "Firecracker microVM", "cATO Automation"]
  } else {
    headline = headline || `Principal Technology Leader & Security Architect @ Expedite Consults`
    about = `Passionate technology consultant specializing in autonomous systems, enterprise security posture, digital transformation, and resilient cloud architectures.`
  }

  return {
    id: userId,
    name: cleanName,
    headline,
    avatar: avatarUrl,
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    location: params.location || "Washington DC-Baltimore Area · Cryptographically Verified",
    connectionsCount: Math.floor(120 + Math.random() * 850),
    followersCount: Math.floor(450 + Math.random() * 3200),
    profileViews: Math.floor(180 + Math.random() * 1400),
    postImpressions: Math.floor(1200 + Math.random() * 8500),
    searchAppearances: Math.floor(45 + Math.random() * 320),
    profileStrength: 95,
    about,
    openToWork: {
      isOpen: true,
      roles: [primaryRole, "Principal Architect", "Executive Advisor"],
      jobTypes: ["Full-time", "Advisory", "Contract"],
      locations: ["Washington, DC", "Remote", "New York, NY"]
    },
    featured: [
      {
        id: `feat_${userId}_1`,
        title: `${cleanName}'s Verified Portfolio: Enterprise Architecture & Security Blueprint`,
        type: "article",
        description: "Official published research on zero-trust enclaves, FedRAMP authorizations, and enterprise AI modernization.",
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
        engagement: "482 reactions · 38 comments"
      },
      {
        id: `feat_${userId}_2`,
        title: "2026 GovCloud & Enterprise Systems Guide",
        type: "media",
        description: "Comprehensive deck on automated continuous authorization and vendor governance.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        engagement: "310 downloads"
      }
    ],
    experience: [
      {
        id: `exp_${userId}_1`,
        role: primaryRole,
        company: primaryCompany,
        companyLogo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
        employmentType: "Full-time",
        duration: "Jan 2024 - Present · 2 yrs 9 mos",
        location: "Washington, DC · Hybrid",
        description: `Leading high-impact initiatives, zero-trust infrastructure, and enterprise client engagements at ${primaryCompany}.`,
        skills: defaultSkills
      },
      {
        id: `exp_${userId}_2`,
        role: "Senior Solutions Consultant",
        company: "Apex Cyber Systems",
        companyLogo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
        employmentType: "Full-time",
        duration: "Jun 2021 - Dec 2023 · 2 yrs 7 mos",
        location: "Reston, VA · Remote",
        description: "Delivered cloud governance frameworks, SOC 2 compliance, and distributed architecture modernization.",
        skills: ["Cloud Security", "Enterprise Systems", "Compliance", "Threat Modeling"]
      }
    ],
    education: [
      {
        id: `edu_${userId}_1`,
        school: "University of Maryland, College Park",
        schoolLogo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&auto=format&fit=crop&q=80",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science & Information Systems",
        duration: "2016 - 2020",
        grade: "Honors Graduate"
      }
    ],
    certifications: [
      {
        id: `cert_${userId}_1`,
        title: "VeritasLens™ Cryptographic Identity Verification (Level 2)",
        issuer: "Expedite Consults Identity Authority",
        issuerLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80",
        issueDate: "Aug 2026",
        credentialId: `0xED25519_${userId.toUpperCase().slice(0, 8)}`,
        credentialUrl: "https://expedite-consults.vercel.app/veritaslens"
      },
      {
        id: `cert_${userId}_2`,
        title: "Certified Information Systems Security Professional (CISSP)",
        issuer: "(ISC)²",
        issuerLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
        issueDate: "Jan 2024",
        credentialId: "CISSP-98412-VERIFIED",
        credentialUrl: "https://www.isc2.org"
      }
    ],
    skills: defaultSkills.map((s, idx) => ({
      name: s,
      endorsements: 18 + (idx * 6)
    })),
    recommendations: [
      {
        id: `rec_${userId}_1`,
        authorName: "Marcus Vance",
        authorHeadline: "VP Enterprise Procurement @ Defense Systems",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        relationship: "Managed directly at Enterprise Desk",
        date: "July 2026",
        text: `${cleanName} is an exceptional leader who consistently executes at the highest standard. Technical acumen and operational rigor are second to none.`,
        type: "received"
      }
    ]
  }
}
