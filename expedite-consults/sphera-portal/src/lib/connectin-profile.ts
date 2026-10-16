import { UserProfile } from "./linkedin-data"
import { findProfessionById, findEnclaveById, getEnclaveForProfession } from "./connectin-professions"
import { KWESI_ASIEDU_PARSED_DATA } from "./resume-parser"

export interface UserInitParams {
  id?: string
  name?: string
  email: string
  role?: 'personal' | 'enterprise' | 'creator' | 'seller' | 'developer' | 'admin'
  avatar?: string
  coverImage?: string
  headline?: string
  location?: string
  phone?: string
  about?: string
  profession?: string
  professionId?: string
  professionCategory?: string
  professionEnclave?: string
  skills?: any[]
  experience?: any[]
  education?: any[]
  certifications?: any[]
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

  // 1. Determine Profession & Enclave intelligently
  let professionId = params.professionId
  let enclaveId = params.professionEnclave

  const searchTarget = `${cleanName} ${cleanEmail} ${params.headline || ''} ${params.profession || ''}`.toLowerCase()

  if (!professionId) {
    if (searchTarget.includes("realtor") || searchTarget.includes("real estate") || searchTarget.includes("broker")) {
      professionId = "realtor"
    } else if (searchTarget.includes("veteran") || searchTarget.includes("veterance") || searchTarget.includes("military") || searchTarget.includes("army") || searchTarget.includes("navy")) {
      professionId = "military_veteran"
    } else if (searchTarget.includes("dentist") || searchTarget.includes("dental") || searchTarget.includes("dds") || searchTarget.includes("dmd")) {
      professionId = "dentist"
    } else if (searchTarget.includes("electrician") || searchTarget.includes("electrical") || searchTarget.includes("nec")) {
      professionId = "electrician"
    } else if (searchTarget.includes("plumber") || searchTarget.includes("plumbing") || searchTarget.includes("pipefitter")) {
      professionId = "plumber"
    } else if (searchTarget.includes("welder") || searchTarget.includes("welding") || searchTarget.includes("fabricator")) {
      professionId = "welder"
    } else if (searchTarget.includes("painter") || searchTarget.includes("painting")) {
      professionId = "painter"
    } else if (searchTarget.includes("roofer") || searchTarget.includes("roofing")) {
      professionId = "roofer"
    } else if (searchTarget.includes("barber") || searchTarget.includes("fade")) {
      professionId = "barber"
    } else if (searchTarget.includes("hairstylist") || searchTarget.includes("hair stylist") || searchTarget.includes("colorist")) {
      professionId = "hairstylist"
    } else if (searchTarget.includes("tailor") || searchTarget.includes("clothier")) {
      professionId = "tailor"
    } else if (searchTarget.includes("beautician") || searchTarget.includes("esthetician")) {
      professionId = "beautician"
    } else if (searchTarget.includes("personal trainer") || searchTarget.includes("fitness")) {
      professionId = "personal_trainer"
    } else if (searchTarget.includes("caterer") || searchTarget.includes("catering")) {
      professionId = "caterer"
    } else if (searchTarget.includes("farmer") || searchTarget.includes("farming") || searchTarget.includes("agri")) {
      professionId = "farmer"
    } else if (searchTarget.includes("livestock") || searchTarget.includes("ranch")) {
      professionId = "livestock_breeder"
    } else if (searchTarget.includes("fish farmer") || searchTarget.includes("aquaculture")) {
      professionId = "fish_farmer"
    } else if (searchTarget.includes("beekeeper") || searchTarget.includes("apiary")) {
      professionId = "beekeeper"
    } else if (searchTarget.includes("truck driver") || searchTarget.includes("trucking") || searchTarget.includes("cdl")) {
      professionId = "truck_driver"
    } else if (searchTarget.includes("delivery") || searchTarget.includes("courier")) {
      professionId = "delivery_driver"
    } else if (searchTarget.includes("rideshare") || searchTarget.includes("uber") || searchTarget.includes("lyft")) {
      professionId = "rideshare_driver"
    } else if (searchTarget.includes("warehouse") || searchTarget.includes("forklift")) {
      professionId = "warehouse_worker"
    } else if (searchTarget.includes("musician") || searchTarget.includes("music") || searchTarget.includes("song")) {
      professionId = "musician"
    } else if (searchTarget.includes("photographer") || searchTarget.includes("photo")) {
      professionId = "photographer"
    } else if (searchTarget.includes("actor") || searchTarget.includes("acting")) {
      professionId = "actor"
    } else if (searchTarget.includes("filmmaker") || searchTarget.includes("film") || searchTarget.includes("director")) {
      professionId = "filmmaker"
    } else if (searchTarget.includes("writer") || searchTarget.includes("author") || searchTarget.includes("journalist")) {
      professionId = "independent_writer"
    } else if (searchTarget.includes("graphic designer") || searchTarget.includes("designer")) {
      professionId = "graphic_designer"
    } else if (searchTarget.includes("home health") || searchTarget.includes("chha")) {
      professionId = "home_health_aide"
    } else if (searchTarget.includes("caregiver")) {
      professionId = "caregiver"
    } else if (searchTarget.includes("childcare") || searchTarget.includes("daycare")) {
      professionId = "childcare_worker"
    } else if (searchTarget.includes("elderly care") || searchTarget.includes("geriatric")) {
      professionId = "elderly_care_worker"
    } else if (searchTarget.includes("tutor") || searchTarget.includes("tutoring")) {
      professionId = "tutor"
    } else if (searchTarget.includes("driving instructor")) {
      professionId = "driving_instructor"
    } else if (searchTarget.includes("apprentice")) {
      professionId = "apprentice"
    } else if (searchTarget.includes("security guard") || searchTarget.includes("security officer")) {
      professionId = "security_guard"
    } else if (searchTarget.includes("cleaner") || searchTarget.includes("cleaning")) {
      professionId = "cleaner"
    } else if (searchTarget.includes("landscaper") || searchTarget.includes("landscaping")) {
      professionId = "landscaper"
    } else if (searchTarget.includes("veterinarian") || searchTarget.includes("vet") || searchTarget.includes("dvm")) {
      professionId = "veterinarian"
    } else if (searchTarget.includes("translator") || searchTarget.includes("interpreter")) {
      professionId = "translator_interpreter"
    } else if (searchTarget.includes("sign language") || searchTarget.includes("asl")) {
      professionId = "sign_language_interpreter"
    } else if (searchTarget.includes("trauma nurse") || searchTarget.includes("er nurse") || searchTarget.includes("ccrn") || searchTarget.includes("elena.nurse")) {
      professionId = "er_trauma_nurse"
    } else if (searchTarget.includes("nurse") || searchTarget.includes("rn") || searchTarget.includes("fnp") || searchTarget.includes("crna")) {
      professionId = "registered_nurse"
    } else if (searchTarget.includes("orthopedic") || searchTarget.includes("surgeon") || searchTarget.includes("angela.vance") || searchTarget.includes("dr.")) {
      professionId = "orthopedic_trauma_surgeon"
    } else if (searchTarget.includes("cardiologist") || searchTarget.includes("thorne") || searchTarget.includes("physician") || searchTarget.includes("doctor")) {
      professionId = "physician"
    } else if (searchTarget.includes("diesel") || searchTarget.includes("cummins") || searchTarget.includes("carlos.diesel")) {
      professionId = "diesel_fleet_mechanic"
    } else if (searchTarget.includes("mechanic") || searchTarget.includes("auto tech") || searchTarget.includes("ase") || searchTarget.includes("marcus.mechanic")) {
      professionId = "mechanic"
    } else if (searchTarget.includes("ev tech") || searchTarget.includes("powertrain")) {
      professionId = "ev_powertrain_technician"
    } else if (searchTarget.includes("finish carpenter") || searchTarget.includes("joiner") || searchTarget.includes("lindqvist")) {
      professionId = "finish_carpenter"
    } else if (searchTarget.includes("framing") || searchTarget.includes("formwork")) {
      professionId = "commercial_framing_carpenter"
    } else if (searchTarget.includes("cabinet") || searchTarget.includes("woodworking")) {
      professionId = "cabinetmaker"
    } else if (searchTarget.includes("carpenter") || searchTarget.includes("timber") || searchTarget.includes("david.miller")) {
      professionId = "carpenter"
    } else if (searchTarget.includes("scada") || searchTarget.includes("ics") || searchTarget.includes("kowalski") || searchTarget.includes("ot security")) {
      professionId = "scada_ics_security"
    } else if (searchTarget.includes("red team") || searchTarget.includes("oscp") || searchTarget.includes("crto") || searchTarget.includes("tariq.cyber") || searchTarget.includes("exploit")) {
      professionId = "red_team_operator"
    } else if (searchTarget.includes("malware") || searchTarget.includes("reverse engineer") || searchTarget.includes("ghidra")) {
      professionId = "malware_reverse_engineer"
    } else if (searchTarget.includes("cpa") || searchTarget.includes("controller") || searchTarget.includes("accountant")) {
      professionId = "cpa_accountant"
    } else if (searchTarget.includes("counsel") || searchTarget.includes("attorney") || searchTarget.includes("cmmc")) {
      professionId = "corporate_attorney"
    } else if (role === "developer" || searchTarget.includes("developer") || searchTarget.includes("software") || searchTarget.includes("code")) {
      professionId = "software_engineer"
    } else {
      professionId = isAdmin ? "corporate_attorney" : "carpenter"
    }
  }

  const profDef = findProfessionById(professionId)
  if (profDef) {
    enclaveId = profDef.enclaveId
  } else if (!enclaveId) {
    enclaveId = isAdmin ? "law_gov_defense" : "trades_construction"
  }

  const enclaveInfo = findEnclaveById(enclaveId)
  const professionTitle = params.profession || profDef?.title || "Master Carpenter (Heavy Timber & Joinery)"
  const professionCategory = params.professionCategory || profDef?.categoryName || enclaveInfo?.name || "Skilled Trades & Construction"
  const clearanceLevel = isAdmin 
    ? "TS/SCI Polygraph (Level 5 Top Secret Enclave)" 
    : (enclaveInfo?.securityClearanceTier || "Standard Verified Identity (Level 2)")

  // 2. High-Quality Enclave Appropriate Cover Images
  let coverImage = params.coverImage
  if (!coverImage) {
    if (enclaveId === "trades_construction") {
      coverImage = "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80" // High-end woodshop / timber framing
    } else if (enclaveId === "automotive_mechanics") {
      coverImage = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80" // Precision automotive diagnostic bay & lifts
    } else if (enclaveId === "healthcare_medicine") {
      coverImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80" // Modern surgical & clinical suite
    } else if (enclaveId === "agriculture_natural_resources") {
      coverImage = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80" // Golden farmland and agricultural fields
    } else if (enclaveId === "personal_services_wellness") {
      coverImage = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80" // Classic barber shop & grooming studio
    } else if (enclaveId === "culinary_hospitality_events") {
      coverImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80" // Commercial culinary & banquet events
    } else if (enclaveId === "commerce_small_business") {
      coverImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80" // Modern commercial real estate & storefronts
    } else if (enclaveId === "creative_media_arts") {
      coverImage = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80" // Professional creative studio & audio console
    } else if (enclaveId === "education_workforce") {
      coverImage = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80" // Interactive lecture & vocational training
    } else if (enclaveId === "community_civic_security") {
      coverImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80" // Civic operational headquarters & defense
    } else if (enclaveId === "tech_cybersecurity") {
      coverImage = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80" // Cyber terminal & SOC operations
    } else if (enclaveId === "law_gov_defense") {
      coverImage = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80" // Federal defense briefing & appellate law
    } else if (enclaveId === "finance_accounting") {
      coverImage = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80" // Financial markets & analytics terminal
    } else if (enclaveId === "campus_students") {
      coverImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80" // University campus quad
    } else {
      coverImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" // Enterprise architecture
    }
  }

  // 3. Official & Verified Avatars
  let avatarUrl = params.avatar
  if (!avatarUrl) {
    if (cleanName.includes("Commander Robert Hayes") || cleanEmail.includes("robert.hayes") || cleanEmail === "sec-admin@connectin.internal") {
      avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80"
    } else if (cleanName.includes("Kwesi Asiedu") || cleanEmail.includes("kasiedu") || cleanEmail.includes("asiedudanquah")) {
      avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
    } else if (cleanName.includes("Alex Taylor") || cleanEmail.includes("alex.taylor")) {
      avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
    } else if (cleanName.includes("Elena Rostova") || cleanEmail.includes("elena.nurse")) {
      avatarUrl = "https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80" // Trauma nurse in scrubs
    } else if (cleanName.includes("Angela Vance") || cleanEmail.includes("angela.vance")) {
      avatarUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80" // Attending surgeon in white coat
    } else if (cleanName.includes("David Miller") || cleanEmail.includes("david.miller")) {
      avatarUrl = "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80" // Master timber craftsman
    } else if (cleanName.includes("Marcus Miller") || cleanEmail.includes("marcus.mechanic")) {
      avatarUrl = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80" // Diagnostic master auto tech
    } else if (cleanName.includes("Tariq Al-Mansoor") || cleanEmail.includes("tariq.cyber")) {
      avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" // Red team security lead
    } else if (cleanName.includes("James Kowalski") || cleanEmail.includes("kowalski")) {
      avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" // SCADA OT engineer
    } else {
      const avatarSeed = encodeURIComponent(`${cleanName}-${cleanEmail}`)
      avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}&backgroundColor=0a66c2,4338ca,0070f3&textColor=ffffff&fontWeight=700`
    }
  }

  // 4. Headline
  let headline = params.headline || (
    isAdmin
      ? "Platform IAM & Super Administrator · ConnectIn Master Control"
      : (profDef?.defaultHeadline || `${professionTitle} · Verified ConnectIn Member`)
  )

  // 5. Inbuilt Domain-Specific Experience, Education, Certifications, Skills & About
  let about = params.about
  let experience = params.experience || []
  let education = params.education || []
  let certifications = params.certifications || []
  let skills = params.skills || []
  let featured = []

  const isKwesiUser =
    cleanName.toLowerCase().includes("kwesi") ||
    cleanEmail.includes("asiedudanquah") ||
    cleanEmail.includes("kasiedu") ||
    searchTarget.includes("syneren") ||
    searchTarget.includes("pentagon") ||
    searchTarget.includes("dtsa")

  if (isKwesiUser) {
    if (experience.length === 0 || !params.experience) {
      experience = KWESI_ASIEDU_PARSED_DATA.experiences
    }
    if (!params.headline || params.headline.includes("Master Carpenter") || params.headline.includes("Verified ConnectIn Member")) {
      headline = KWESI_ASIEDU_PARSED_DATA.headline
    }
    if (!about || about.includes("Practicing") || about.length < 50) {
      about = KWESI_ASIEDU_PARSED_DATA.about
    }
    if (skills.length === 0) {
      skills = KWESI_ASIEDU_PARSED_DATA.skills.map(s => ({
        name: s,
        endorsements: 95 + Math.floor(Math.random() * 5),
        endorsers: ['DoD Cyber Command', 'Pentagon DTSA', 'FBI CISO']
      }))
    }
    if (education.length === 0) {
      education = [
        {
          id: `edu_${userId}_1`,
          school: "Johns Hopkins University",
          schoolLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
          degree: "Master of Science in Cybersecurity",
          fieldOfStudy: "Enterprise Security Architecture & Information Assurance",
          duration: "Graduated"
        }
      ]
    }
  } else if (enclaveId === "healthcare_medicine") {
    const isDoctor = professionId.includes("surgeon") || professionId.includes("physician") || cleanName.includes("Dr.")
    if (isDoctor) {
      about = about || `Board-Certified Attending Orthopedic Trauma Surgeon (MD, FACS) with 12+ years of surgical experience leading Level 1 trauma resuscitation, complex pelvic ring reductions, periprosthetic reconstruction, and multi-fragment articular reconstruction.\n\nDedicated to surgical excellence, sub-millimeter anatomical reduction, intraoperative fluoroscopy guidance, and mentoring surgical residents in modern limb salvage techniques.`
      if (experience.length === 0) {
        experience = [
          {
            id: `exp_${userId}_1`,
            role: "Attending Orthopedic Trauma Surgeon",
            company: "Johns Hopkins Medicine · Division of Orthopaedic Trauma",
            companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            employmentType: "Full-time",
            duration: "2018 - Present · 8 yrs",
            location: "Baltimore, MD · On Site",
            description: "Leading emergent surgical interventions for high-energy polytrauma, Schatzker IV-VI plateau fractures, and complex acetabular reconstruction. Directing OR trauma surgical teams with 99.2% union rates.",
            skills: ["Intra-Articular ORIF", "Pelvic Ring Reconstruction", "Fluoroscopic Navigation", "ATLS Level 1"]
          },
          {
            id: `exp_${userId}_2`,
            role: "Chief Surgical Resident, Orthopaedic Surgery",
            company: "Mass General Brigham / Harvard Orthopedic Residency",
            companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            employmentType: "Full-time",
            duration: "2013 - 2018 · 5 yrs",
            location: "Boston, MA",
            description: "Completed 1,800+ accredited surgical procedures spanning adult reconstruction, trauma fixations, and microsurgical limb revascularization.",
            skills: ["Surgical Oncology", "Arthroplasty", "Orthopedic Trauma", "Microvascular Surgery"]
          }
        ]
      }
      if (education.length === 0) {
        education = [
          {
            id: `edu_${userId}_1`,
            school: "Johns Hopkins University School of Medicine",
            schoolLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            degree: "Doctor of Medicine (MD)",
            fieldOfStudy: "Medicine & Surgery · Alpha Omega Alpha (AOA) Honors",
            duration: "2009 - 2013"
          }
        ]
      }
      if (certifications.length === 0) {
        certifications = [
          {
            id: `cert_${userId}_1`,
            title: "Board Certified in Orthopaedic Surgery (ABOS)",
            issuer: "American Board of Orthopaedic Surgery",
            issuerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            issueDate: "2019 · Active",
            credentialId: `ABOS-${userId.toUpperCase().slice(0, 7)}`,
            credentialUrl: "https://abos.org"
          },
          {
            id: `cert_${userId}_2`,
            title: "Fellow of the American College of Surgeons (FACS)",
            issuer: "American College of Surgeons",
            issuerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            issueDate: "2021 · Active",
            credentialId: `FACS-TRAUMA-${userId.toUpperCase().slice(0, 6)}`,
            credentialUrl: "https://facs.org"
          }
        ]
      }
      if (skills.length === 0) {
        skills = [
          { name: "Complex Pelvic & Acetabular Reconstruction", endorsements: 89 },
          { name: "Intra-Articular Fracture ORIF", endorsements: 76 },
          { name: "Dual-Plate Tibial Plateau Fixation", endorsements: 68 },
          { name: "Damage Control Orthopedics (DCO)", endorsements: 64 },
          { name: "Intraoperative 3D Fluoroscopic Navigation", endorsements: 58 }
        ]
      }
    } else {
      // Nurse (CCRN / Trauma / FNP)
      about = about || `Critical Care Registered Nurse (CCRN) & Emergency Trauma Nurse (TNCC) with 9+ years of frontline experience in high-acuity Level 1 trauma resuscitation, surgical ICUs, and rapid response code teams.\n\nExpert in closed-loop hemodynamic monitoring, arterial lines, Belmont rapid blood warmer infusion during Massive Transfusion Protocols (MTP), and continuous ventilator ARDS lung protective ventilation.`
      if (experience.length === 0) {
        experience = [
          {
            id: `exp_${userId}_1`,
            role: "Emergency Trauma Resuscitation Nurse Lead",
            company: "Johns Hopkins Hospital · Adult Emergency & Trauma Center",
            companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            employmentType: "Full-time",
            duration: "2020 - Present · 6 yrs",
            location: "Baltimore, MD · On Site",
            description: "Charge nurse overseeing Level 1 trauma resuscitations, managing Belmont rapid blood warmers, central venous pressure telemetry, and guiding bedside ultrasound-guided peripheral IV insertions.",
            skills: ["Level 1 Trauma Triage", "TNCC Protocol", "Massive Transfusion (MTP)", "Hemodynamic Telemetry"]
          },
          {
            id: `exp_${userId}_2`,
            role: "Critical Care ICU Staff Nurse (CCRN)",
            company: "Inova Fairfax Hospital · Medical & Surgical ICU",
            companyLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            employmentType: "Full-time",
            duration: "2016 - 2020 · 4 yrs",
            location: "Falls Church, VA",
            description: "Titrated multi-pressor cardiovascular support (Levophed, Vasopressin), managed continuous renal replacement therapy (CRRT), and executed ARDS prone-positioning protocols.",
            skills: ["CCRN Critical Care", "CRRT Dialysis", "Multi-Pressor Titration", "Ventilator Weaning"]
          }
        ]
      }
      if (education.length === 0) {
        education = [
          {
            id: `edu_${userId}_1`,
            school: "Johns Hopkins University School of Nursing",
            schoolLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            degree: "Bachelor of Science in Nursing (BSN)",
            fieldOfStudy: "Registered Nursing & Critical Care · Magna Cum Laude",
            duration: "2012 - 2016"
          }
        ]
      }
      if (certifications.length === 0) {
        certifications = [
          {
            id: `cert_${userId}_1`,
            title: "Critical Care Registered Nurse (CCRN)",
            issuer: "American Association of Critical-Care Nurses (AACN)",
            issuerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            issueDate: "2018 · Active",
            credentialId: `AACN-CCRN-${userId.toUpperCase().slice(0, 6)}`,
            credentialUrl: "https://aacn.org"
          },
          {
            id: `cert_${userId}_2`,
            title: "Trauma Nursing Core Course (TNCC)",
            issuer: "Emergency Nurses Association (ENA)",
            issuerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            issueDate: "2020 · Active",
            credentialId: `ENA-TNCC-${userId.toUpperCase().slice(0, 6)}`,
            credentialUrl: "https://ena.org"
          },
          {
            id: `cert_${userId}_3`,
            title: "ACLS & PALS Instructor Certification",
            issuer: "American Heart Association (AHA)",
            issuerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80",
            issueDate: "2024 · Active",
            credentialId: `AHA-ACLS-PALS-9982`,
            credentialUrl: "https://heart.org"
          }
        ]
      }
      if (skills.length === 0) {
        skills = [
          { name: "Emergency Trauma Resuscitation (ESI Level 1)", endorsements: 94 },
          { name: "Massive Transfusion Protocol (MTP)", endorsements: 86 },
          { name: "Arterial Line & Central Venous Telemetry", endorsements: 79 },
          { name: "Multi-Pressor Cardiovascular Titration", endorsements: 74 },
          { name: "Ventilator ARDS Prone Positioning", endorsements: 69 },
          { name: "Ultrasound-Guided Vascular Access", endorsements: 63 }
        ]
      }
    }
  } else if (enclaveId === "automotive_mechanics") {
    about = about || `ASE World Class Master Diagnostic Technician (A1-A8, L1, L2, L3) and Commercial Fleet Specialist with 16+ years diagnosing high-voltage 800V EV powertrains, complex CAN-FD bus networks, and Cummins/Detroit Diesel industrial heavy transport.\n\nEquipped with Snap-on ZEUS+ diagnostics, PicoScope 4-channel oscilloscopes, and Mitchell 1 / ALLDATA ProDemand. Dedicated to first-time fix accuracy and NFPA 70E high-voltage safety standards.`
    if (experience.length === 0) {
      experience = [
        {
          id: `exp_${userId}_1`,
          role: "Shop Foreman & Master Diagnostic Specialist",
          company: "Precision Euro & Fleet Performance Center",
          companyLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2017 - Present · 9 yrs",
          location: "Denver, CO · Shop Bay 1",
          description: "Supervising 14 bays, managing Snap-on ZEUS+ CAN-FD diagnostics, executing 800V EV battery pack teardowns, and certifying commercial fleet DOT compliance.",
          skills: ["CAN-FD Oscilloscope", "800V EV Lockout", "Cummins INSITE", "Snap-on ZEUS+"]
        },
        {
          id: `exp_${userId}_2`,
          role: "Lead Commercial Fleet & Diesel Technician",
          company: "Intermountain Cummins & Freightliner Service",
          companyLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2011 - 2017 · 6 yrs",
          location: "Salt Lake City, UT",
          description: "Overhauled 300+ Cummins ISX15 and Detroit DD15 heavy diesel engines, calibrated SCR aftertreatment DEF systems, and maintained FMCSA logs.",
          skills: ["Diesel Aftertreatment SCR", "Allison Transmissions", "FMCSA DOT Inspections"]
        }
      ]
    }
    if (education.length === 0) {
      education = [
        {
          id: `edu_${userId}_1`,
          school: "Universal Technical Institute (UTI)",
          schoolLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          degree: "Master Automotive & Heavy Diesel Technology",
          fieldOfStudy: "Powertrains, Electrical Diagnostician & High-Voltage EV",
          duration: "2008 - 2010"
        }
      ]
    }
    if (certifications.length === 0) {
      certifications = [
        {
          id: `cert_${userId}_1`,
          title: "ASE Master Automobile Technician (A1-A8)",
          issuer: "National Institute for Automotive Service Excellence (ASE)",
          issuerLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          issueDate: "2012 · Recertified Current",
          credentialId: `ASE-MASTER-${userId.toUpperCase().slice(0, 6)}`,
          credentialUrl: "https://ase.com"
        },
        {
          id: `cert_${userId}_2`,
          title: "ASE L1 Advanced Engine Performance Specialist",
          issuer: "National Institute for Automotive Service Excellence",
          issuerLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          issueDate: "2015 · Active",
          credentialId: `ASE-L1-PERF-9021`,
          credentialUrl: "https://ase.com"
        },
        {
          id: `cert_${userId}_3`,
          title: "ASE L3 Light Duty Hybrid/Electric Vehicle Specialist (800V)",
          issuer: "National Institute for Automotive Service Excellence",
          issuerLogo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80",
          issueDate: "2022 · Active",
          credentialId: `ASE-L3-EV-800V-441`,
          credentialUrl: "https://ase.com"
        }
      ]
    }
    if (skills.length === 0) {
      skills = [
        { name: "PicoScope 4-Channel CAN-FD Bus Waveforms", endorsements: 96 },
        { name: "800V High-Voltage EV Lockout/Tagout (NFPA 70E)", endorsements: 88 },
        { name: "Snap-on ZEUS+ Diagnostic Hub & Lab Scope", endorsements: 82 },
        { name: "Cummins ISX15 / Detroit Diesel Fleet Engine Rebuilds", endorsements: 79 },
        { name: "Mitchell 1 & ALLDATA ProDemand Wiring Tracing", endorsements: 75 },
        { name: "DEF Doser & SCR Aftertreatment Diagnostics", endorsements: 70 }
      ]
    }
  } else if (enclaveId === "trades_construction") {
    about = about || `Master Carpenter & Timber Framing Superintendent with 20+ years of craft leadership spanning heavy timber mortise-and-tenon pavilions, historic post-and-beam restoration, compound curved finish staircases, and custom architectural millwork.\n\nCombines traditional hand-cut draw-bored timber framing with modern Festool precision woodworking systems, total station layout verification, and strict OSHA 30 job-site safety.`
    if (experience.length === 0) {
      experience = [
        {
          id: `exp_${userId}_1`,
          role: "Master Carpenter & Job-Site Superintendent",
          company: "Heritage Craftsmen & Timberworks Guild",
          companyLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2015 - Present · 11 yrs",
          location: "Bozeman, MT · On Site",
          description: "Leading $4.2M heavy timber commercial & luxury residential builds. Directing cut-lists for 12x12 coastal fir bents, hand-cut mortise and tenon joinery, and crane erection plans.",
          skills: ["Timber Framing", "Mortise & Tenon", "Festool Systems", "OSHA 30"]
        },
        {
          id: `exp_${userId}_2`,
          role: "Lead Finish Carpenter & Millwork Artisan",
          company: "Apex Architectural Joinery & Millwork",
          companyLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2008 - 2015 · 7 yrs",
          location: "Seattle, WA",
          description: "Built custom coffered walnut ceilings, curved spiral staircases, and hand-cut dovetailed millwork with sub-0.5mm tolerances.",
          skills: ["Architectural Millwork", "Compound Miters", "Curved Staircases"]
        }
      ]
    }
    if (education.length === 0) {
      education = [
        {
          id: `edu_${userId}_1`,
          school: "North Bennet Street School (NBSS)",
          schoolLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          degree: "Master Diploma in Preservation Carpentry & Architectural Woodworking",
          fieldOfStudy: "Traditional Timber Framing, Mortise & Tenon Joinery",
          duration: "2004 - 2007"
        }
      ]
    }
    if (certifications.length === 0) {
      certifications = [
        {
          id: `cert_${userId}_1`,
          title: "Master Craftsman Guild Seal (Timber Framing)",
          issuer: "Timber Framers Guild of North America",
          issuerLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          issueDate: "2014 · Lifetime Fellow",
          credentialId: `TFG-MASTER-${userId.toUpperCase().slice(0, 6)}`,
          credentialUrl: "https://tfguild.org"
        },
        {
          id: `cert_${userId}_2`,
          title: "OSHA 30 Construction Safety & Fall Protection Lead",
          issuer: "Occupational Safety and Health Administration (OSHA)",
          issuerLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          issueDate: "2023 · Active",
          credentialId: `OSHA-30-CONST-8812`,
          credentialUrl: "https://osha.gov"
        },
        {
          id: `cert_${userId}_3`,
          title: "Festool Certified System Technician",
          issuer: "Festool USA Technical Academy",
          issuerLogo: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80",
          issueDate: "2021 · Certified",
          credentialId: `FESTOOL-SYS-DOMINO-51`,
          credentialUrl: "https://festoolusa.com"
        }
      ]
    }
    if (skills.length === 0) {
      skills = [
        { name: "Heavy Timber Mortise & Tenon Joinery", endorsements: 98 },
        { name: "Architectural Finish Woodworking & Crown Angles", endorsements: 87 },
        { name: "Festool Domino XL Joinery Systems", endorsements: 83 },
        { name: "Total Station & Laser Transit Elevation Leveling", endorsements: 76 },
        { name: "Glulam & Crane Erection Rigging Plans", endorsements: 71 },
        { name: "OSHA 30 Job-Site Fall Protection", endorsements: 68 }
      ]
    }
  } else if (enclaveId === "tech_cybersecurity") {
    about = about || `Principal Red Team Operator & Adversary Emulation Specialist (OSCP, CRTO, OSCE) with 11+ years executing full-scope covert offensive cyber operations, custom Command & Control (C2) infrastructure design, kernel-level EDR evasion via indirect syscalls, and SCADA/ICS critical infrastructure vulnerability research.\n\nProven track record leading red team engagements across cleared defense industrial bases, nuclear/power generation OT networks, and Fortune 50 cloud providers.`
    if (experience.length === 0) {
      experience = [
        {
          id: `exp_${userId}_1`,
          role: "Principal Red Team Lead & Adversary Emulation",
          company: "Apex Cyber Defense Labs · Cleared Operations",
          companyLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2021 - Present · 5 yrs",
          location: "Washington, DC · Top Secret Enclave",
          description: "Directing tier-1 adversary simulation campaigns modeling nation-state APT TTPs. Authoring custom Sliver/Havoc C2 payloads, unhooking ntdll in memory, and bypassing tier-1 EDR heuristics.",
          skills: ["Sliver C2", "Indirect Syscalls", "EDR Evasion", "Active Directory BloodHound"]
        },
        {
          id: `exp_${userId}_2`,
          role: "Senior SCADA / ICS OT Cyber Defense Engineer",
          company: "National Critical Infrastructure Security Directorate",
          companyLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          employmentType: "Full-time",
          duration: "2016 - 2021 · 5 yrs",
          location: "Arlington, VA",
          description: "Conducted hardware firmware extraction, Modbus TCP deep packet inspection, and reverse engineering of Purdue Model Level 2/3 PLC ladder logic on electric power grids.",
          skills: ["SCADA / Modbus TCP", "Ghidra Reverse Engineering", "Purdue Model OT", "PLC Firmware"]
        }
      ]
    }
    if (education.length === 0) {
      education = [
        {
          id: `edu_${userId}_1`,
          school: "Carnegie Mellon University",
          schoolLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          degree: "B.S. in Information Security & Applied Cryptography",
          fieldOfStudy: "Kernel Systems, Vulnerability Research & Reverse Engineering",
          duration: "2012 - 2016"
        }
      ]
    }
    if (certifications.length === 0) {
      certifications = [
        {
          id: `cert_${userId}_1`,
          title: "Offensive Security Certified Professional (OSCP)",
          issuer: "OffSec",
          issuerLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          issueDate: "2018 · Active",
          credentialId: `OSCP-${userId.toUpperCase().slice(0, 6)}`,
          credentialUrl: "https://offsec.com"
        },
        {
          id: `cert_${userId}_2`,
          title: "Certified Red Team Operator (CRTO)",
          issuer: "Zero-Point Security",
          issuerLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          issueDate: "2022 · Active",
          credentialId: `CRTO-ADV-C2-4011`,
          credentialUrl: "https://zeropointsecurity.co.uk"
        },
        {
          id: `cert_${userId}_3`,
          title: "GIAC Reverse Engineering Malware (GREM)",
          issuer: "SANS GIAC",
          issuerLogo: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80",
          issueDate: "2023 · Active",
          credentialId: `GIAC-GREM-90144`,
          credentialUrl: "https://giac.org"
        }
      ]
    }
    if (skills.length === 0) {
      skills = [
        { name: "C2 Frameworks (Sliver, Havoc, Mythic)", endorsements: 99 },
        { name: "Kernel-Level EDR Evasion & Indirect Syscalls", endorsements: 94 },
        { name: "SCADA / ICS Modbus & DNP3 Security", endorsements: 87 },
        { name: "Ghidra & IDA Pro x86_64 Reverse Engineering", endorsements: 84 },
        { name: "Velociraptor DFIR Live Memory Forensics", endorsements: 78 },
        { name: "Active Directory BloodHound Attack Graphs", endorsements: 75 }
      ]
    }
  } else {
    // Rich domain generation for all professional enclaves (Realtors, Veterans, Dentists, Farmers, Barbers, Tutors, etc.)
    about = about || `Practicing ${professionTitle} operating within the ${enclaveInfo?.name || "ConnectIn"} Enclave with verified credentials, industry compliance, and professional excellence.`
    if (experience.length === 0 && profDef) {
      experience = [
        {
          id: `exp_${userId}_1`,
          role: profDef.title,
          company: `${profDef.categoryName} Professional Group`,
          companyLogo: coverImage,
          employmentType: "Full-time",
          duration: "2019 - Present · 7 yrs",
          location: "United States · On Site",
          description: `Leading domain execution in ${profDef.title.toLowerCase()}. Specializing in ${profDef.typicalSkills.slice(0, 4).join(', ')} with verified professional execution, safety compliance, and client satisfaction.`,
          skills: profDef.typicalSkills.slice(0, 4)
        }
      ]
    }
    if (certifications.length === 0 && profDef) {
      certifications = [
        {
          id: `cert_${userId}_1`,
          title: `Verified ${profDef.title} License & Professional Credentials`,
          issuer: `${profDef.categoryName} National Accreditation Board`,
          issuerLogo: coverImage,
          issueDate: "2021 · Active",
          credentialId: `VERIF-${professionId.toUpperCase().slice(0, 8)}-${userId.slice(0, 4).toUpperCase()}`,
          credentialUrl: "https://connectin.expediteconsults.com"
        }
      ]
    }
    if (skills.length === 0 && profDef?.typicalSkills) {
      skills = profDef.typicalSkills.map((s, idx) => ({ name: s, endorsements: 54 + (idx * 7) }))
    }
  }

  const profile: UserProfile = {
    id: userId,
    name: cleanName,
    email: cleanEmail,
    role,
    roles: isAdmin ? ["SUPER_ADMIN", "Platform IAM Architect", "Root Authority"] : ["NORMAL_USER"],
    clearanceLevel,
    profession: professionTitle,
    professionId,
    professionCategory,
    professionEnclave: enclaveId,
    headline,
    avatar: avatarUrl,
    coverImage,
    location: params.location || (isAdmin ? "Washington, DC · Top Secret Security Operations Center" : "United States · Cryptographically Verified"),
    connectionsCount: isAdmin ? 42800 : (enclaveId === 'trades_construction' ? 342 : enclaveId === 'healthcare_medicine' ? 512 : enclaveId === 'automotive_mechanics' ? 284 : enclaveId === 'tech_cybersecurity' ? 740 : 410),
    followersCount: isAdmin ? 98400 : 1240,
    profileViews: isAdmin ? 19400 : 890,
    postImpressions: isAdmin ? 520000 : 6400,
    searchAppearances: 180,
    profileStrength: isAdmin ? 100 : 92,
    about,
    openToWork: {
      isOpen: false,
      roles: [],
      jobTypes: ["Full-time", "Contract"],
      locations: ["Remote", "United States"]
    },
    featured,
    experience,
    education,
    certifications: certifications.length > 0 ? certifications : [
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
    skills,
    recommendations: []
  }

  return profile
}
