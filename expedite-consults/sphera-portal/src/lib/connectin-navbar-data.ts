import { isSuperAdminUser } from "./connectin-profile"
import { findEnclaveById } from "./connectin-professions"

export interface MoreMenuItem {
  id: string
  label: string
  desc: string
  url?: string
  isExternal?: boolean
  badge?: string
}

export interface MoreMenuGroup {
  category: string
  items: MoreMenuItem[]
}

export interface EnclaveModuleItem {
  id: string
  label: string
  desc: string
  icon: string
  url?: string
  isExternal?: boolean
  badge?: string
}

export function getCategorizedMoreMenu(
  enclaveId?: string,
  isAdminUser: boolean = false,
  profession?: string
): MoreMenuGroup[] {
  const encId = enclaveId || 'trades_construction'

  // ─── 1. SKILLED TRADES, CONSTRUCTION & CRAFTSMANSHIP ───────────
  if (encId === 'trades_construction') {
    return [
      {
        category: "Job Site & Subcontractor Hub 🔨",
        items: [
          {
            id: "skillhands_app",
            label: "🛠️ SkillHands Vocational Trade Hub",
            desc: "Vocational marketplace & verified artisan contractor network",
            url: "https://skillhands-client.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          {
            id: "desknote_app",
            label: "📓 DeskNote Jobsite & Field Notebook",
            desc: "Digital trade dossiers, cut-list notes & takeoff records",
            url: "https://desk-note-kwesi-asiedus-projects.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          { id: "procurement", label: "📋 Subcontractor Bids & RFPs", desc: "$340K commercial framing, plumbing & electrical bids" },
          { id: "marketplace", label: "📐 Blueprint Takeoff & Spec Viewer", desc: "Interactive architectural plan markups" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "company", label: "🏛️ General Contractor Directory", desc: "Licensed GC & builder registry" },
          { id: "marketplace", label: "🪵 Lumber & Materials Center", desc: "Framing lumber, conduit, piping & steel futures" },
          { id: "wallet", label: "💳 Trade Draws & Retainage Escrow", desc: "Milestone payments & lien waivers" },
        ]
      },
      {
        category: "Craftsmanship & Tools 🧰",
        items: [
          {
            id: "vibetok_trades",
            label: "🎥 VibeTok Trade Video Masterclasses",
            desc: "Joinery, electrical rough-in & welding video hub",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          {
            id: "bazaar_trades",
            label: "🛍️ Bazaar Tooling & Hardware Marketplace",
            desc: "Commercial woodworking tools, Festool rigs & heavy equipment",
            url: "https://bazaar-standalone.vercel.app",
            isExternal: true,
            badge: "COMMERCE"
          },
          { id: "learning", label: "📐 CAD, NEC & Piping Sandbox", desc: "Compound miter, wire conduit & pump head sizing" },
          { id: "missions", label: "🔨 Master Craftsman Journey", desc: "Apprentice to Master Tradesman lifecycle" },
          { id: "mentorship", label: "👨‍🏫 Master Tradesman 1:1 Mentorship", desc: "Book master plumbers, electricians & joiners" },
        ]
      },
      {
        category: "Safety & Trade Standards 🦺",
        items: [
          {
            id: "csrta_initiative",
            label: "🌱 CSRTA Green Tech & E-Waste Recycling",
            desc: "Sustainable jobsite practices & circular scrap recycling",
            url: "https://csrtainitiative.org",
            isExternal: true,
            badge: "CSRTA"
          },
          { id: "pulserooms", label: "🦺 OSHA 30 & Job-Site Safety", desc: "Fall protection, arc flash NFPA 70E & rigging" },
          { id: "guilds", label: "🛡️ Master Trades & Joiners Guild", desc: "Heritage guild verified master enclave" },
          { id: "peerreview", label: "⭐ Trade Superintendent Reviews", desc: "Structural PE & superintendent reviews" },
          { id: "compensation", label: "💰 Prevailing Trade Wages", desc: "Union scales & prevailing contractor rates" },
          { id: "accountsecurity", label: "🔐 Trade Identity & Safety Passes", desc: "OSHA cards, state licenses & digital credentials" },
        ]
      }
    ]
  }

  // ─── 2. AUTOMOTIVE, TRANSPORT & LOGISTICS ───────────────────────
  if (encId === 'automotive_mechanics') {
    return [
      {
        category: "Diagnostics & Fleet Dispatch 🔧",
        items: [
          {
            id: "desknote_auto",
            label: "📓 DeskNote Diagnostic Logs & Bay Notebook",
            desc: "Digital vehicle inspection logs & scope waveform records",
            url: "https://desk-note-kwesi-asiedus-projects.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          {
            id: "skillhands_auto",
            label: "🛠️ SkillHands Automotive & Fleet Network",
            desc: "ASE certified technician & fleet mechanic trade network",
            url: "https://skillhands-client.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          { id: "procurement", label: "🚛 Commercial Fleet & Route RFPs", desc: "Freight logistics & municipal fleet maintenance tenders" },
          { id: "marketplace", label: "📦 Parts & Heavy Freight Exchange", desc: "OEM rebuild kits, Cummins parts & CDL load boards" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "company", label: "🏛️ Freight Carrier & Dealership Directory", desc: "DOT motor carriers & verified repair facilities" },
          { id: "wallet", label: "💳 Freight Pay & Flat-Rate Disbursements", desc: "QuickPay fuel advances & warranty labor escrow" },
        ]
      },
      {
        category: "Equipment & Technical Labs ⚡",
        items: [
          {
            id: "vibetok_auto",
            label: "🎥 VibeTok Auto & Diesel Teardowns",
            desc: "PicoScope CAN-FD waveforms & 800V EV battery teardown videos",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          {
            id: "bazaar_auto",
            label: "🛍️ Bazaar Automotive Tools & Machinery",
            desc: "Snap-on diagnostic scanners, vehicle lifts & shop air equipment",
            url: "https://bazaar-standalone.vercel.app",
            isExternal: true,
            badge: "COMMERCE"
          },
          { id: "learning", label: "💻 PicoScope CAN-FD Waveform Lab", desc: "Interactive 4-channel oscilloscope & sensor decoding" },
          { id: "missions", label: "⚡ ASE World Class Master Path", desc: "Master automobile, truck & EV certification tracks" },
        ]
      },
      {
        category: "Safety & Carrier Compliance 🦺",
        items: [
          { id: "pulserooms", label: "⚡ NFPA 70E High-Voltage EV Safety", desc: "800V de-energization & PPE protocols" },
          { id: "guilds", label: "🛡️ ASE Master Technicians & CDL Guild", desc: "Commercial drivers & master technicians enclave" },
          { id: "peerreview", label: "⭐ Shop Foreman Peer Endorsements", desc: "Verified diagnostic accuracy & safety ratings" },
          { id: "compensation", label: "💰 Flat-Rate & Per-Mile Wage Index", desc: "Regional hourly rates & freight mileage pay" },
          { id: "accountsecurity", label: "🔐 Shop Keyring & CDL Medical Card", desc: "FMCSA medical examiner certs & passkeys" },
        ]
      }
    ]
  }

  // ─── 3. AGRICULTURE, FARMING, FISHERIES & NATURAL RESOURCES ────
  if (encId === 'agriculture_natural_resources') {
    return [
      {
        category: "Agri-Market & Soil Telemetry 🌾",
        items: [
          {
            id: "desknote_agri",
            label: "📓 DeskNote Farm & Field Journal",
            desc: "Soil NPK records, irrigation timings & harvest yield logs",
            url: "https://desk-note-kwesi-asiedus-projects.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          {
            id: "bazaar_agri",
            label: "🛍️ Bazaar Farm & Marine Equipment",
            desc: "Tractors, combine harvesters, aquaculture pumps & winches",
            url: "https://bazaar-standalone.vercel.app",
            isExternal: true,
            badge: "COMMERCE"
          },
          { id: "procurement", label: "🌾 Grain Elevator & Livestock Tenders", desc: "Contract harvesting & bulk commodity bids" },
          { id: "marketplace", label: "📈 CBOT Grain Futures & Livestock Index", desc: "Live corn, soybean, cattle & timber spot prices" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "wallet", label: "💳 Agri-Escrow & Harvest Settlement", desc: "Direct crop buyer settlements & USDA payments" },
        ]
      },
      {
        category: "Husbandry & Ecology Systems 🐟",
        items: [
          {
            id: "vibetok_agri",
            label: "🎥 VibeTok Agriculture & Agronomy Hub",
            desc: "Precision tractor guidance, queen bee rearing & soil science",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          { id: "learning", label: "🌱 Soil Moisture & RAS Tank Simulator", desc: "Simulated dissolved oxygen & NPK nutrient balancing" },
          { id: "guilds", label: "🛡️ Independent Farmers & Harvesters Guild", desc: "Regenerative agriculture & marine fishery guild" },
        ]
      }
    ]
  }

  // ─── 4. PERSONAL CARE, GROOMING, BEAUTY & FITNESS ──────────────
  if (encId === 'personal_services_wellness') {
    return [
      {
        category: "Studio & Client Desk ✂️",
        items: [
          {
            id: "skillhands_craft",
            label: "🛠️ SkillHands Personal Stylists Network",
            desc: "Master barbers, custom tailors & fitness coaches",
            url: "https://skillhands-client.vercel.app",
            isExternal: true,
            badge: "LIVE APP"
          },
          {
            id: "vibetok_beauty",
            label: "🎥 VibeTok Grooming & Fitness Masterclasses",
            desc: "Skin fades, draping bespoke suits & hypertrophy programming",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          { id: "procurement", label: "💈 Salon & Spa Commercial Lease RFPs", desc: "Chair rentals, studio spaces & salon equipment" },
          { id: "marketplace", label: "🛍️ Professional Shears, Rigs & Cosmetics", desc: "Japanese steel shears, Barbicide & INCI bases" },
          { id: "wallet", label: "💳 Chair Bookings & Client Retainers", desc: "Instant contactless tips & appointment deposits" },
        ]
      },
      {
        category: "Standards & Health Safety 🧴",
        items: [
          { id: "pulserooms", label: "🧴 State Cosmetology Board & Safety", desc: "Autoclave compliance, sanitation & bloodborne protocols" },
          { id: "learning", label: "🏋️ Strength Periodization & Color Labs", desc: "1RM progression engines & color formulation chemistry" },
          { id: "guilds", label: "🛡️ Master Barbers & Bespoke Guild", desc: "Verified artisan clothiers & salon masters" },
        ]
      }
    ]
  }

  // ─── 5. CULINARY, HOSPITALITY, EVENTS & SERVICES ─────────────────
  if (encId === 'culinary_hospitality_events') {
    return [
      {
        category: "Hospitality & Event Desk 🍽️",
        items: [
          {
            id: "bazaar_culinary",
            label: "🛍️ Bazaar Commercial Kitchen Equipment",
            desc: "Combi ovens, walk-in refrigeration & banquet chaffing",
            url: "https://bazaar-standalone.vercel.app",
            isExternal: true,
            badge: "COMMERCE"
          },
          {
            id: "vibetok_culinary",
            label: "🎥 VibeTok Culinary & Hospitality Masterclasses",
            desc: "Banquet scaling, wedding timing & hotel concierge masterclasses",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          { id: "procurement", label: "🍷 Catering & Gala Event Tenders", desc: "Corporate retreats, weddings & banquet RFPs" },
          { id: "marketplace", label: "📋 ServSafe Food & Recipe Costing Sizer", desc: "Per-plate cost yield & allergen matrices" },
          { id: "wallet", label: "💳 Event Deposits & Vendor Escrow", desc: "Milestone wedding retainers & catering draws" },
        ]
      },
      {
        category: "Sanitation & Property Care 🌿",
        items: [
          { id: "pulserooms", label: "🌿 ServSafe & Health Department Standards", desc: "Commercial inspection readiness & sanitation protocols" },
          { id: "learning", label: "📅 Run-of-Show & Irrigation Calculator", desc: "Event timelines & commercial landscape sizers" },
          { id: "guilds", label: "🛡️ Executive Chefs & Hospitality Guild", desc: "Master banquet directors & hotel leads" },
        ]
      }
    ]
  }

  // ─── 6. COMMERCE, REAL ESTATE & SMALL BUSINESS ───────────────────
  if (encId === 'commerce_small_business') {
    return [
      {
        category: "Real Estate & Commerce Hub 🏢",
        items: [
          {
            id: "bazaar_commerce",
            label: "🛍️ Bazaar Small Business Marketplace",
            desc: "Industrial fixtures, POS hardware & commercial equipment",
            url: "https://bazaar-standalone.vercel.app",
            isExternal: true,
            badge: "COMMERCE"
          },
          {
            id: "careerorbit_smb",
            label: "🪐 CareerOrbit Business Navigator",
            desc: "Broker credential verification & commercial network",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          { id: "procurement", label: "🏡 Commercial Real Estate & Storefront RFPs", desc: "Lease listings, tenant rep & property deals" },
          { id: "marketplace", label: "📊 MLS Search & Comparative Market Comps", desc: "Active listings, tax records & property comps" },
          { id: "wallet", label: "💳 Earnest Money Escrow & Closing Desk", desc: "Real estate escrow, commission disbursements" },
        ]
      },
      {
        category: "Merchant Growth & Consulting 📈",
        items: [
          { id: "pulserooms", label: "📈 National Association of Realtors (NAR) Pulse", desc: "Mortgage rate trends & local zoning board updates" },
          { id: "learning", label: "📦 DTC Shipping & Inventory Academy", desc: "E-commerce fulfillment & wholesale margin math" },
          { id: "guilds", label: "🛡️ Real Estate Brokers & Retail Merchant Guild", desc: "Verified commercial fiduciaries & founders" },
        ]
      }
    ]
  }

  // ─── 7. CREATIVE MEDIA, ARTS, WRITING & PERFORMANCE ─────────────
  if (encId === 'creative_media_arts') {
    return [
      {
        category: "Creative Production & Studio 🎭",
        items: [
          {
            id: "vibetok_creative",
            label: "🎥 VibeTok Creative Video & Acting Hub",
            desc: "Cinematography teardowns, voice acting & screenwriting",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          {
            id: "careerorbit_creative",
            label: "🪐 CareerOrbit Creative Skill Passport",
            desc: "Verified portfolio, acting reel & literary credentials",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          { id: "procurement", label: "🎬 Film Commissions & Commercial Audio RFPs", desc: "Scoring gigs, commercial photo shoots & book deals" },
          { id: "marketplace", label: "🎵 Audio Split Sheets & Proof Galleries", desc: "Copyright split sheets, proofing galleries & model releases" },
          { id: "wallet", label: "💳 Royalties, Licensing & Client Advances", desc: "BMI/ASCAP payouts & commercial usage licenses" },
        ]
      },
      {
        category: "Performance & Language Services 🌐",
        items: [
          { id: "pulserooms", label: "🤟 RID ASL & Translation Standards", desc: "Conference interpreting ethics & Deaf community standards" },
          { id: "learning", label: "📝 Storyboard & CAT Translation Memory Desk", desc: "Film shot lists & translation memory concordance" },
          { id: "guilds", label: "🛡️ Artists, Writers & Performers Guild", desc: "Verified creative professionals & interpreters" },
        ]
      }
    ]
  }

  // ─── 8. HEALTHCARE, CLINICAL, DENTAL & CAREGIVING ───────────────
  if (encId === 'healthcare_medicine') {
    return [
      {
        category: "Clinical & Dental Care Desk 🩺",
        items: [
          {
            id: "vibetok_med",
            label: "🎥 VibeTok Clinical & Surgical Grand Rounds",
            desc: "Procedural surgery, nursing & emergency trauma streams",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          {
            id: "careerorbit_med",
            label: "🪐 CareerOrbit Clinical CME Passport",
            desc: "CME hours, nursing CEUs & specialty credential matrix",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          { id: "procurement", label: "🏥 Hospital Equipment & Dental RFPs", desc: "Surgical hardware, CBCT scanners & clinical device bids" },
          { id: "marketplace", label: "🦷 Dental CBCT & Radiograph DICOM Viewer", icon: "🦷", desc: "3D panoramic radiograph analysis & implant mapping" },
          { id: "wallet", label: "💳 Medical Billing & Caregiver Escrow", desc: "Insurance claims, private duty caregiver payments" },
        ]
      },
      {
        category: "Protocols & Caregiving Support ❤️",
        items: [
          { id: "pulserooms", label: "💉 UpToDate Clinical Evidence & Caregiving", desc: "Peer-reviewed guidelines & elderly care safety" },
          { id: "learning", label: "🎓 Board Specialty & Caregiver Academy", desc: "DDS/DMD prep, CCRN exams & home health aide credentials" },
          { id: "guilds", label: "🛡️ Physicians, Dentists & Caregivers Enclave", desc: "HIPAA verified medical and nursing practitioners" },
        ]
      }
    ]
  }

  // ─── 9. EDUCATION, TRAINING & WORKFORCE DEVELOPMENT ────────────
  if (encId === 'education_workforce') {
    return [
      {
        category: "Teaching, Tutoring & CTE Hub 🎓",
        items: [
          {
            id: "careerorbit_edu",
            label: "🪐 CareerOrbit Reskilling & Skill Navigator",
            desc: "Cross-industry skills translator & apprentice progress",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          {
            id: "vibetok_edu",
            label: "🎥 VibeTok Vocational & STEM Micro-Lessons",
            desc: "Calculus proofs, trade theory & job interview coaching",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          { id: "procurement", label: "📚 School District & Tutoring Contract RFPs", desc: "CTE curriculum tenders & adult education grants" },
          { id: "marketplace", label: "📐 Interactive STEM Whiteboard & Rubrics", desc: "Digital problem solvers & NCCER hands-on rubrics" },
          { id: "wallet", label: "💳 Tutoring Escrow & Apprentice Stipends", desc: "Session billing, GI Bill & OJT wage disbursements" },
        ]
      },
      {
        category: "Apprenticeship & Career Transition 🔄",
        items: [
          { id: "pulserooms", label: "🔄 Workforce Transition & Career Changers", desc: "Mid-career cross-skilling & apprenticeship roundtables" },
          { id: "learning", label: "🚗 Driver Ed & Adult Literacy Workshop", desc: "DMV test checklists & conversational ESL pacing" },
          { id: "guilds", label: "🛡️ Professional Educators & Apprentices Guild", desc: "Certified vocational instructors & emerging scholars" },
        ]
      }
    ]
  }

  // ─── 10. COMMUNITY, CIVIC, VETERANS & PUBLIC SAFETY ────────────
  if (encId === 'community_civic_security') {
    return [
      {
        category: "Veterans, Civic & Protective Desk 🎖️",
        items: [
          {
            id: "careerorbit_vet",
            label: "🪐 CareerOrbit Military MOS Translator",
            desc: "Direct translation of military occupational skills into civilian jobs",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          {
            id: "vibetok_civic",
            label: "🎥 VibeTok Veteran & Community Stories",
            desc: "Transition stories, non-profit spotlights & disaster relief",
            url: "https://vibetok-learning-hub.vercel.app",
            isExternal: true,
            badge: "LIVE HUB"
          },
          { id: "procurement", label: "🏛️ Non-Profit & Municipal Security Tenders", desc: "Federal grants, protective guard contracts & civic bids" },
          { id: "marketplace", label: "🛡️ Guard Tour Verification & Patrol Checkpoints", desc: "NFC patrol logs, incident reports & 5S production audits" },
          { id: "wallet", label: "💳 Civic Grants & Veteran Benefit Escrow", desc: "501(c)(3) donations, disaster relief funds" },
        ]
      },
      {
        category: "Community Impact & Faith Leadership 🕊️",
        items: [
          { id: "pulserooms", label: "🤝 Community Organizing & Mutual Aid Board", desc: "Volunteer mobilization & faith leader roundtables" },
          { id: "learning", label: "🏭 Lean 5S & Guard Certification Academy", desc: "Security guard licensing & manufacturing takt time" },
          { id: "guilds", label: "🛡️ Veterans & Community Leaders Enclave", desc: "Honorable service veterans & civic organizers" },
        ]
      }
    ]
  }

  // ─── 11. SOFTWARE ENGINEERING & CLOUD SYSTEMS ───────────────────
  if (encId === 'tech_software') {
    return [
      {
        category: "DevSecOps & Code Analysis Suite 🧑‍💻",
        items: [
          {
            id: "sast_platform",
            label: "🔍 05-SAST Static Code Analyzer",
            desc: "AST static code analysis & automated fix pull requests",
            url: "https://05-sast-platform.vercel.app",
            isExternal: true,
            badge: "LIVE SAST"
          },
          {
            id: "sca_platform",
            label: "📦 06-SCA & AI-BOM Dependency Guard",
            desc: "Software composition analysis & SBOM supply-chain auditing",
            url: "https://06-sca-platform.vercel.app",
            isExternal: true,
            badge: "LIVE SCA"
          },
          {
            id: "iac_platform",
            label: "☁️ 10-IaC Terraform & Cloud Guard",
            desc: "Infrastructure as Code policy-as-code & drift verification",
            url: "https://10-iac-security-platform.vercel.app",
            isExternal: true,
            badge: "LIVE IAC"
          },
          {
            id: "api_platform",
            label: "⚡ 12-API Security & Attack Shield",
            desc: "REST & GraphQL attack surface discovery & schema protection",
            url: "https://12-api-security-platform.vercel.app",
            isExternal: true,
            badge: "LIVE API"
          },
          {
            id: "integration_layer",
            label: "🌐 18-Unified Integration Bus",
            desc: "Universal SIEM/SOAR bus & real-time webhook connectors",
            url: "https://18-unified-integration-layer.vercel.app",
            isExternal: true,
            badge: "LIVE BUS"
          },
          {
            id: "careerorbit_app",
            label: "🪐 CareerOrbit Skill Passport",
            desc: "AI technical skills passport, Git contributions & career benchmarking",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          },
          { id: "code", label: "🧑‍💻 ConnectIn Code & Repositories", desc: "GitHub repository sync & algorithmic recruiting" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "wallet", label: "💳 Developer Invoicing & Milestone Escrow", desc: "Contractor SOW billing & technical escrow" }
        ]
      }
    ]
  }

  // ─── 12. LAW, GOVERNMENT & NATIONAL DEFENSE ─────────────────────
  if (encId === 'law_gov_defense') {
    return [
      {
        category: "cATO & Compliance Systems 🏛️",
        items: [
          {
            id: "aegis_rmf_platform",
            label: "🛡️ Aegis RMF Continuous ATO Platform",
            desc: "NIST SP 800-53 OSCAL continuous compliance & POAM automation",
            url: "https://aegis-rmf.vercel.app",
            isExternal: true,
            badge: "LIVE cATO"
          },
          {
            id: "threat_modeling_platform",
            label: "📐 15-Threat Modeling Suite",
            desc: "STRIDE automated threat model vectors & mitigation catalog",
            url: "https://15-threat-modeling-platform.vercel.app",
            isExternal: true,
            badge: "LIVE STRIDE"
          },
          {
            id: "secrets_platform",
            label: "🔐 07-Secrets Detection Platform",
            desc: "Enterprise token leak scanner & hardware credential vault",
            url: "https://07-secrets-platform.vercel.app",
            isExternal: true,
            badge: "LIVE SECRETS"
          }
        ]
      },
      {
        category: "Federal Procurement & Legal Briefs ⚖️",
        items: [
          { id: "sam_gov", label: "🏛️ Federal SAM.gov RFP Feed", desc: "Direct cleared defense contracting bids" },
          { id: "procurement", label: "🏢 Defense Procurement", desc: "$2.4M enterprise spend & bids" },
          { id: "guilds", label: "⚖️ Cleared Counsel & Defense Guild", desc: "TS/SCI & Founder roundtables" },
          { id: "accountsecurity", label: "🔐 Top Secret CAC / Passkeys", desc: "FIDO2 hardware credentials" }
        ]
      }
    ]
  }

  // ─── 13. FINANCE, ACCOUNTING & PRIVATE EQUITY ───────────────────
  if (encId === 'finance_accounting') {
    return [
      {
        category: "Treasury & Corporate Ledger 📊",
        items: [
          { id: "gaap_ledger", label: "📑 GAAP Ledger Reconciler", desc: "Automated bank feed anomaly detection & tax export" },
          { id: "dcf_engine", label: "📈 Valuation DCF Engine", desc: "Monte Carlo simulated cash flow & multipliers" },
          { id: "procurement", label: "🏢 M&A RFPs & Advisory Bids", desc: "Capital advisory & transaction spend" },
          { id: "guilds", label: "📊 Fiduciary CPA & PE Guild", desc: "AICPA certified partners & PE associates" },
          { id: "accountsecurity", label: "🔐 SEC Compliant FIDO2 Auth", desc: "Hardware keys & audit logging" }
        ]
      }
    ]
  }

  // ─── 14. HIGHER EDUCATION & CAMPUS ──────────────────────────────
  if (encId === 'campus_students') {
    return [
      {
        category: "University & Student Living OS 🎓",
        items: [
          {
            id: "salisbury_app",
            label: "🏫 Salisbury University Campus OS",
            desc: "Student course rosters, event calendars & dining portal",
            url: "https://20-salisbury-campus-kwesi-asiedus-projects.vercel.app",
            isExternal: true,
            badge: "LIVE CAMPUS"
          },
          {
            id: "tuhousing_app",
            label: "🏠 TU Housing & Roommate Matching",
            desc: "Off-campus apartment placement & roommate matching portal",
            url: "https://tuhousing.vercel.app",
            isExternal: true,
            badge: "LIVE HOUSING"
          },
          {
            id: "careerorbit_student",
            label: "🪐 CareerOrbit Student Passport",
            desc: "Verified student projects, tech internships & portfolio",
            url: "https://careerorbit-standalone.vercel.app",
            isExternal: true,
            badge: "LIVE ORBIT"
          }
        ]
      }
    ]
  }

  // ─── 15. TECH_CYBERSECURITY (DEFAULT CYBER ENCLAVE) ─────────────
  return [
    {
      category: "Offensive Pentest & Adversary Suite 🎯",
      items: [
        {
          id: "dast_platform",
          label: "🎯 11-DAST Dynamic Pentesting Platform",
          desc: "Dynamic application security testing & automated pentest scans",
          url: "https://11-dast-security-platform.vercel.app",
          isExternal: true,
          badge: "LIVE PENTEST"
        },
        {
          id: "exploit_platform",
          label: "🕸️ 14-Exploitability & Weaponization Graph",
          desc: "Attack path validation & weaponized exploit simulation",
          url: "https://14-exploitability-platform.vercel.app",
          isExternal: true,
          badge: "LIVE GRAPH"
        },
        {
          id: "malware_platform",
          label: "🔬 16-Malware Analysis Sandbox",
          desc: "Automated bare-metal detonation & Ghidra reverse engineering",
          url: "https://16-malware-analysis-platform.vercel.app",
          isExternal: true,
          badge: "LIVE SANDBOX"
        },
        {
          id: "ransomware_platform",
          label: "☣️ 17-Ransomware Recovery Console",
          desc: "Blast radius containment & cryptographic recovery engine",
          url: "https://17-ransomware-recovery-platform.vercel.app",
          isExternal: true,
          badge: "LIVE RECOVERY"
        },
        {
          id: "cloud_security_platform",
          label: "☁️ 19-Cloud Security CSPM Platform",
          desc: "Multi-cloud CSPM & GovCloud Kubernetes micro-segmentation",
          url: "https://19-cloud-security-platform.vercel.app",
          isExternal: true,
          badge: "LIVE CSPM"
        },
        {
          id: "k8s_security_platform",
          label: "☸️ 09-Kubernetes Security Posture",
          desc: "K8s cluster posture, pod density & admission guardrails",
          url: "https://09-k8s-security-platform.vercel.app",
          isExternal: true,
          badge: "LIVE K8S"
        },
        {
          id: "container_security_platform",
          label: "🐳 08-Container Image Security",
          desc: "Docker & OCI container image vulnerability scanning",
          url: "https://08-container-security-platform.vercel.app",
          isExternal: true,
          badge: "LIVE OCI"
        }
      ]
    },
    {
      category: "Learning, Skills & Defense Labs 🧪",
      items: [
        {
          id: "careerorbit_cyber",
          label: "🪐 CareerOrbit Cyber Skills Passport",
          desc: "Offensive security competencies, exploit proofs & role navigator",
          url: "https://careerorbit-standalone.vercel.app",
          isExternal: true,
          badge: "LIVE ORBIT"
        },
        {
          id: "vibetok_cyber",
          label: "🎥 VibeTok Cyber Labs Video Hub",
          desc: "Interactive breach teardowns & adversary simulation videos",
          url: "https://vibetok-learning-hub.vercel.app",
          isExternal: true,
          badge: "LIVE HUB"
        },
        { id: "code", label: "🧑‍💻 ConnectIn Code", desc: "GitHub repo sync & recruit by code" },
        { id: "labs", label: "🧪 Security Labs Sandbox", desc: "Firecracker microVM sandboxes" },
        { id: "accountsecurity", label: "🔐 Account Security & Passkeys", desc: "FIDO2, sessions & privacy" }
      ]
    }
  ]
}

export function getEnclaveSearchPlaceholder(enclaveId?: string): string {
  switch (enclaveId) {
    case 'trades_construction':
      return "Search SkillHands, DeskNote, blueprints, electricians, plumbers, welders..."
    case 'automotive_mechanics':
      return "Search DeskNote, OBD-II codes, ASE mechanics, truck drivers, Snap-on..."
    case 'agriculture_natural_resources':
      return "Search crop agronomy, livestock breeders, aquaculture, beekeeping..."
    case 'personal_services_wellness':
      return "Search master barbers, hairstylists, bespoke tailors, personal trainers..."
    case 'culinary_hospitality_events':
      return "Search catering menus, event planners, hospitality, cleaners, landscaping..."
    case 'commerce_small_business':
      return "Search realtors, MLS listings, small shop owners, market merchants..."
    case 'creative_media_arts':
      return "Search musicians, photographers, filmmakers, actors, graphic design, ASL..."
    case 'healthcare_medicine':
      return "Search dentists, veterinarians, caregivers, home health, clinical trials..."
    case 'education_workforce':
      return "Search tutors, vocational trainers, driving instructors, apprenticeships..."
    case 'community_civic_security':
      return "Search veterans, community organizers, non-profits, security guards, clergy..."
    case 'campus_students':
      return "Search Salisbury Campus OS, TU housing, college coursework, fellowships..."
    case 'tech_software':
      return "Search 05-SAST, 06-SCA, CareerOrbit, microservices, GitHub PRs..."
    case 'law_gov_defense':
      return "Search Aegis RMF, SAM.gov, CMMC 2.0, cleared defense bids..."
    case 'finance_accounting':
      return "Search GAAP ledgers, DCF models, SEC EDGAR 10-K, PE deals..."
    case 'tech_cybersecurity':
    default:
      return "Search 11-DAST pentest, 16-Malware, 17-Ransomware, zero-days, CISSP..."
  }
}

export function getEnclaveModules(enclaveId?: string, isAdminUser: boolean = false): EnclaveModuleItem[] {
  switch (enclaveId) {
    case 'trades_construction':
      return [
        { id: "skillhands", label: "SkillHands Vocational Hub", desc: "Hands-on trade tasks & artisan network", icon: "🛠️", url: "https://skillhands-client.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "desknote", label: "DeskNote Field Notebook", desc: "Digital jobsite dossiers & cut-lists", icon: "📓", url: "https://desk-note-kwesi-asiedus-projects.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "jobs", label: "Trades & Construction Jobs", desc: "Active commercial framing, plumbing & electrical roles", icon: "🔨" },
        { id: "marketplace", label: "Tools & Lumber Marketplace", desc: "Festool, total stations & timber stock", icon: "🧰" },
        { id: "bazaar", label: "Bazaar Machinery Marketplace", desc: "Heavy trade tooling & hardware", icon: "🛍️", url: "https://bazaar-standalone.vercel.app", isExternal: true, badge: "COMMERCE" },
        { id: "procurement", label: "Subcontractor Bids & RFPs", desc: "Commercial framing, plumbing & finish buildouts", icon: "📋" },
        { id: "vibetok_trades", label: "VibeTok Trade Masterclasses", desc: "Joinery & woodworking video lessons", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "pulserooms", label: "OSHA & Code Pulse", desc: "Live job-site safety roundtables", icon: "🦺" },
        { id: "learning", label: "Master Craftsman Academy", desc: "Joinery, CAD & OSHA 30 certifications", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Trade Passkeys & OSHA Cards", desc: "Digital safety credentials & FIDO2", icon: "🔐" }
      ]

    case 'automotive_mechanics':
      return [
        { id: "desknote_auto", label: "DeskNote Diagnostic Logs", desc: "OBD-II telemetry notes & shop records", icon: "📓", url: "https://desk-note-kwesi-asiedus-projects.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "skillhands_auto", label: "SkillHands Auto Technicians", desc: "Verified master technicians network", icon: "🛠️", url: "https://skillhands-client.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "jobs", label: "Master Tech & Fleet Jobs", desc: "Dealership master diagnostics & heavy diesel", icon: "🔧" },
        { id: "marketplace", label: "Snap-on & Scope Marketplace", desc: "PicoScopes, scan tools & EV PPE", icon: "⚡" },
        { id: "procurement", label: "Commercial Fleet RFPs", desc: "Municipal & logistics fleet contracts", icon: "🚛" },
        { id: "vibetok_auto", label: "VibeTok Auto Teardowns", desc: "Waveform teardowns & powertrain videos", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "pulserooms", label: "NHTSA & TSB Pulse", desc: "Live master diagnostic case studies", icon: "📻" },
        { id: "learning", label: "ASE Master Tech Academy", desc: "A1–A8, L1 & L3 EV training modules", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Shop Keyring & FIDO2 Passkeys", desc: "OEM flashing access & security gateway", icon: "🔐" }
      ]

    case 'agriculture_natural_resources':
      return [
        { id: "desknote_agri", label: "DeskNote Farm Journal", desc: "Field logs & crop agronomy notes", icon: "📓", url: "https://desk-note-kwesi-asiedus-projects.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "bazaar_agri", label: "Bazaar Farm Equipment", desc: "Tractors, combine machinery & marine gear", icon: "🛍️", url: "https://bazaar-standalone.vercel.app", isExternal: true, badge: "COMMERCE" },
        { id: "jobs", label: "Agri & Natural Resource Jobs", desc: "Ranch managers, agronomists & forestry roles", icon: "🌾" },
        { id: "marketplace", label: "Grain Futures & Livestock Desk", desc: "Real-time CBOT prices & cattle indexes", icon: "📈" },
        { id: "procurement", label: "Crop & Commodity RFPs", desc: "Grain contracts & bulk produce bids", icon: "📋" },
        { id: "vibetok_agri", label: "VibeTok Agronomy Lessons", desc: "Tractor GPS & queen bee masterclasses", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "learning", label: "Sustainable Agriculture Hub", desc: "Soil NPK & aquaculture RAS simulations", icon: "🌱" },
        { id: "accountsecurity", label: "USDA Organic Credentials", desc: "Producer certifications & passkeys", icon: "🔐" }
      ]

    case 'personal_services_wellness':
      return [
        { id: "skillhands_craft", label: "SkillHands Stylists Network", desc: "Barbers, tailors & personal trainers", icon: "🛠️", url: "https://skillhands-client.vercel.app", isExternal: true, badge: "LIVE APP" },
        { id: "jobs", label: "Salon, Studio & Fitness Jobs", desc: "Master barber chairs, trainer & styling roles", icon: "✂️" },
        { id: "marketplace", label: "Shears, Rigs & Fitness Gear", desc: "Japanese steel shears & strength equipment", icon: "🛍️" },
        { id: "vibetok_beauty", label: "VibeTok Grooming Masterclasses", desc: "Skin fades & periodization workout streams", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "pulserooms", label: "State Cosmetology & Board Pulse", desc: "Sanitation protocols & Barbicide standards", icon: "🧴" },
        { id: "learning", label: "Wellness Mastery Academy", desc: "Color chemistry & NSCA strength credentials", icon: "🎓" },
        { id: "accountsecurity", label: "State License Credentials", desc: "Verified practitioner passkeys", icon: "🔐" }
      ]

    case 'culinary_hospitality_events':
      return [
        { id: "bazaar_culinary", label: "Bazaar Commercial Kitchens", desc: "Banquet equipment, ovens & food trucks", icon: "🛍️", url: "https://bazaar-standalone.vercel.app", isExternal: true, badge: "COMMERCE" },
        { id: "jobs", label: "Hospitality & Event Roles", desc: "Catering chefs, event planners & hotel leads", icon: "🍽️" },
        { id: "marketplace", label: "Recipe Costing & Menu Sizer", desc: "Food cost percentages & allergen matrices", icon: "📋" },
        { id: "procurement", label: "Event & Catering RFPs", desc: "Gala banquets & corporate conference bids", icon: "🍷" },
        { id: "vibetok_culinary", label: "VibeTok Culinary Masterclasses", desc: "Banquet food prep & event timelines", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "pulserooms", label: "ServSafe & Health Standards", desc: "Inspection readiness & kitchen safety", icon: "🌿" },
        { id: "learning", label: "Run-of-Show & Timeline Lab", desc: "Minute-by-minute wedding & event cues", icon: "📅" },
        { id: "accountsecurity", label: "Health Permits & Passkeys", desc: "ServSafe certificates & venue security", icon: "🔐" }
      ]

    case 'commerce_small_business':
      return [
        { id: "bazaar_smb", label: "Bazaar Merchant Exchange", desc: "B2B commercial equipment & store fixtures", icon: "🛍️", url: "https://bazaar-standalone.vercel.app", isExternal: true, badge: "COMMERCE" },
        { id: "careerorbit_smb", label: "CareerOrbit Business Matrix", desc: "Broker licenses & business credentials", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "jobs", label: "Realtor & Merchant Roles", desc: "Commercial brokers & retail manager openings", icon: "💼" },
        { id: "marketplace", label: "MLS Property Comps & Valuation", desc: "Active listings, tax data & property comps", icon: "🏡" },
        { id: "procurement", label: "Commercial Storefront RFPs", desc: "Retail leases & procurement tenders", icon: "🏢" },
        { id: "pulserooms", label: "NAR & Commercial Market Pulse", desc: "Interest rate trends & local commerce news", icon: "📈" },
        { id: "learning", label: "E-Commerce & Retail Academy", desc: "Inventory management & POS logistics", icon: "📦" },
        { id: "accountsecurity", label: "Broker Escrow & Passkeys", desc: "Title escrow access & verified fiduciaries", icon: "🔐" }
      ]

    case 'creative_media_arts':
      return [
        { id: "careerorbit_creative", label: "CareerOrbit Creative Passport", desc: "Verified portfolios, acting reels & credits", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_reels", label: "VibeTok 9:16 Reels Studio", desc: "Vertical HD studio, HTML5 player & 1-click MP4 export", icon: "🎬", url: "https://vibetok-learning-hub.vercel.app/reels", isExternal: true, badge: "REELS HD" },
        { id: "vibetok_creative", label: "VibeTok Media Masterclasses", desc: "Filmmaking, lighting & audio mixing videos", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Creative & Audition Roles", desc: "Commercial photo, voiceover & scoring gigs", icon: "🎭" },
        { id: "marketplace", label: "Audio Splits & Proof Galleries", desc: "Copyright split sheets & photo licenses", icon: "🎵" },
        { id: "procurement", label: "Media & Translation RFPs", desc: "Commercial scoring & conference ASL bids", icon: "🎬" },
        { id: "pulserooms", label: "SAG & ASL Interpreting Pulse", desc: "Deaf community standards & copyright law", icon: "🤟" },
        { id: "learning", label: "CAT Translation & Script Studio", desc: "Concordance search & teleprompter drills", icon: "📝" },
        { id: "accountsecurity", label: "Copyright Seals & Passkeys", desc: "BMI/ASCAP badges & verified artists", icon: "🔐" }
      ]

    case 'healthcare_medicine':
      return [
        { id: "careerorbit_med", label: "CareerOrbit Clinical Passport", desc: "CME tracking & specialty board credentials", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_med", label: "VibeTok Clinical Grand Rounds", desc: "Procedural surgery & nursing streams", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Clinical & Dental Roles", desc: "Dentists, veterinarians, RNs & caregivers", icon: "🏥" },
        { id: "marketplace", label: "Dental CBCT & Medical Tools", desc: "3D dental radiograph DICOM analysis", icon: "🦷" },
        { id: "procurement", label: "Hospital Equipment RFPs", desc: "Medical device & implant tenders", icon: "📋" },
        { id: "pulserooms", label: "FDA & Clinical Evidence Pulse", desc: "Live surgical & caregiver roundtables", icon: "💉" },
        { id: "learning", label: "Board & Caregiver Academy", desc: "DDS, CCRN & home health aide modules", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "EPCS DEA & Clinical Passkeys", desc: "Prescription signing & HIPAA passes", icon: "🔐" }
      ]

    case 'education_workforce':
      return [
        { id: "careerorbit_edu", label: "CareerOrbit Reskilling Matrix", desc: "Apprentice competency & career cross-walks", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_edu", label: "VibeTok CTE Micro-Lessons", desc: "STEM problem solving & trade theory", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Education & Apprentice Openings", desc: "Academic tutors, CTE instructors & trainees", icon: "🎓" },
        { id: "marketplace", label: "STEM Whiteboard & Rubrics", desc: "Interactive formula solvers & NCCER tasks", icon: "📐" },
        { id: "procurement", label: "School District Tutoring RFPs", desc: "Workforce development & literacy grants", icon: "📚" },
        { id: "pulserooms", label: "Career Reskilling Roundtables", desc: "Mid-career cross-skilling discussions", icon: "🔄" },
        { id: "learning", label: "Apprentice OJT Passbook", desc: "Verified shop hours & journeyman sign-offs", icon: "📘" },
        { id: "accountsecurity", label: "Verified Educator Credentials", desc: "State teaching certificates & passkeys", icon: "🔐" }
      ]

    case 'community_civic_security':
      return [
        { id: "careerorbit_vet", label: "CareerOrbit Military MOS Desk", desc: "Military skill translation & civilian paths", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_civic", label: "VibeTok Veteran Stories", desc: "Service transition & community impact", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Civic, Veteran & Security Jobs", desc: "Protective guards, non-profit & manufacturing", icon: "🎖️" },
        { id: "marketplace", label: "Guard Patrol & 5S Tools", desc: "NFC patrol scans & lean manufacturing takt", icon: "🛡️" },
        { id: "procurement", label: "Non-Profit & Security RFPs", desc: "Federal community grants & security tenders", icon: "🏛️" },
        { id: "pulserooms", label: "Mutual Aid & Veteran Support", desc: "Disaster relief & volunteer mobilization", icon: "🤝" },
        { id: "learning", label: "Public Safety & Lean Academy", desc: "Security guard licensing & 5S methods", icon: "🏭" },
        { id: "accountsecurity", label: "Security Clearance Passes", desc: "VA credentials & FIDO2 passkeys", icon: "🔐" }
      ]

    case 'tech_software':
      return [
        { id: "sast", label: "05-SAST Static Code Analyzer", desc: "Real-time AST code analysis & automated PRs", icon: "🔍", url: "https://05-sast-platform.vercel.app", isExternal: true, badge: "LIVE SAST" },
        { id: "sca", label: "06-SCA & AI-BOM Scanner", desc: "Software composition & AI-BOM supply-chain scan", icon: "📦", url: "https://06-sca-platform.vercel.app", isExternal: true, badge: "LIVE SCA" },
        { id: "iac", label: "10-IaC Terraform Guard", desc: "Infrastructure as Code policy compliance", icon: "☁️", url: "https://10-iac-security-platform.vercel.app", isExternal: true, badge: "LIVE IAC" },
        { id: "api_sec", label: "12-API Security Platform", desc: "REST & GraphQL attack surface defense", icon: "⚡", url: "https://12-api-security-platform.vercel.app", isExternal: true, badge: "LIVE API" },
        { id: "integration", label: "18-Unified Integration Bus", desc: "SIEM/SOAR unified event bus", icon: "🌐", url: "https://18-unified-integration-layer.vercel.app", isExternal: true, badge: "LIVE BUS" },
        { id: "careerorbit", label: "CareerOrbit Skill Passport", desc: "Verified coding competencies & career matrix", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_dev", label: "VibeTok Dev Masterclasses", desc: "Next.js 16, Rust microVMs & system design", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Engineering Roles", desc: "Distributed systems & Staff+ software openings", icon: "💼" },
        { id: "code", label: "ConnectIn Code", desc: "GitHub repo sync & recruit by code", icon: "🧑‍💻" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Security & Passkeys", desc: "FIDO2, sessions & privacy", icon: "🔐" }
      ]

    case 'law_gov_defense':
      return [
        { id: "aegis_rmf", label: "Aegis RMF Continuous ATO", desc: "NIST SP 800-53 Rev 5 compliance platform", icon: "🛡️", url: "https://aegis-rmf.vercel.app", isExternal: true, badge: "LIVE cATO" },
        { id: "threat_modeling", label: "15-Threat Modeling Suite", desc: "STRIDE threat modeling & architectural risk", icon: "📐", url: "https://15-threat-modeling-platform.vercel.app", isExternal: true, badge: "LIVE STRIDE" },
        { id: "secrets_vault", label: "07-Secrets Detection Platform", desc: "Enterprise token leak & credential vault", icon: "🔐", url: "https://07-secrets-platform.vercel.app", isExternal: true, badge: "LIVE SECRETS" },
        { id: "expedite_gov", label: "Expedite Consults Portal", desc: "Classified engineering & defense advisory", icon: "🏛️", url: "https://expedite-consults.vercel.app", isExternal: true, badge: "ADVISORY" },
        { id: "procurement", label: "Federal SAM.gov & RFPs", desc: "Cleared defense contracting tenders", icon: "📋" },
        { id: "jobs", label: "Cleared Legal & Defense Roles", desc: "Active Secret & TS/SCI positions", icon: "💼" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Top Secret CAC Passkeys", desc: "FIDO2 hardware credentials", icon: "🔐" }
      ]

    case 'finance_accounting':
      return [
        { id: "jobs", label: "CPA & Private Equity Jobs", desc: "Corporate Controller & PE associate roles", icon: "💼" },
        { id: "procurement", label: "M&A Advisory RFPs", desc: "Corporate financial tenders", icon: "🏢" },
        { id: "marketplace", label: "Financial Modeling Tools", desc: "DCF engines & GAAP automation", icon: "🛍️" },
        { id: "learning", label: "CPA & CFA Academy", desc: "Financial modeling & GAAP audit tracks", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "SEC Compliant Passkeys", desc: "FIDO2 security gateway", icon: "🔐" }
      ]

    case 'campus_students':
      return [
        { id: "salisbury", label: "Salisbury University Campus OS", desc: "Course schedules & student life portal", icon: "🏫", url: "https://20-salisbury-campus-kwesi-asiedus-projects.vercel.app", isExternal: true, badge: "LIVE CAMPUS" },
        { id: "tuhousing", label: "TU Housing & Roommate Matching", desc: "Campus housing & roommate matching", icon: "🏠", url: "https://tuhousing.vercel.app", isExternal: true, badge: "LIVE HOUSING" },
        { id: "careerorbit_student", label: "CareerOrbit Student Passport", desc: "Student internships & portfolio badges", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "jobs", label: "Internships & Research Jobs", desc: "On-campus & corporate internships", icon: "💼" },
        { id: "learning", label: "University Curriculum Hub", desc: "Academic resources & lecture notes", icon: "🎓" },
        { id: "accountsecurity", label: "Student ID & Passkeys", desc: "Campus credentials & FIDO2", icon: "🔐" }
      ]

    // Default: tech_cybersecurity
    default:
      return [
        { id: "dast", label: "11-DAST Pentest Platform", desc: "Automated dynamic web & API pentesting", icon: "🎯", url: "https://11-dast-security-platform.vercel.app", isExternal: true, badge: "LIVE PENTEST" },
        { id: "exploit", label: "14-Exploitability Platform", desc: "Attack graph & weaponization validator", icon: "🕸️", url: "https://14-exploitability-platform.vercel.app", isExternal: true, badge: "LIVE GRAPH" },
        { id: "malware", label: "16-Malware Analysis Sandbox", desc: "Bare-metal hypervisor detonation & Ghidra", icon: "🔬", url: "https://16-malware-analysis-platform.vercel.app", isExternal: true, badge: "LIVE SANDBOX" },
        { id: "ransomware", label: "17-Ransomware Recovery", desc: "Blast radius containment & recovery", icon: "☣️", url: "https://17-ransomware-recovery-platform.vercel.app", isExternal: true, badge: "LIVE RECOVERY" },
        { id: "cloud_sec", label: "19-Cloud Security CSPM", desc: "Multi-cloud CSPM & Kubernetes guardrails", icon: "☁️", url: "https://19-cloud-security-platform.vercel.app", isExternal: true, badge: "LIVE CSPM" },
        { id: "k8s_sec", label: "09-Kubernetes Security", desc: "K8s cluster posture & pod isolation", icon: "☸️", url: "https://09-k8s-security-platform.vercel.app", isExternal: true, badge: "LIVE K8S" },
        { id: "careerorbit_cyber", label: "CareerOrbit Cyber Passport", desc: "Offensive security skill passport", icon: "🪐", url: "https://careerorbit-standalone.vercel.app", isExternal: true, badge: "LIVE ORBIT" },
        { id: "vibetok_cyber", label: "VibeTok Cyber Labs", desc: "Breach teardowns & red team video masterclasses", icon: "🎥", url: "https://vibetok-learning-hub.vercel.app", isExternal: true, badge: "LIVE HUB" },
        { id: "jobs", label: "Jobs Hub & Requisitions", desc: "Active cleared & enterprise tech roles", icon: "💼" },
        { id: "marketplace", label: "Enterprise Marketplace", desc: "Software, tools & cATO packs", icon: "🛍️" },
        { id: "bounties", label: "Enterprise Bounties", desc: "$15K–$50K hackathons in escrow", icon: "🏆" },
        { id: "labs", label: "Security Labs Sandbox", desc: "Firecracker microVM sandboxes", icon: "🧪" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Account Security & Passkeys", desc: "FIDO2, sessions & privacy", icon: "🔐" }
      ]
  }
}
