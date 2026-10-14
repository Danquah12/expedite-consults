import { isSuperAdminUser } from "./connectin-profile"
import { findEnclaveById } from "./connectin-professions"

export interface MoreMenuItem {
  id: string
  label: string
  desc: string
}

export interface MoreMenuGroup {
  category: string
  items: MoreMenuItem[]
}

export function getCategorizedMoreMenu(
  enclaveId?: string,
  isAdminUser: boolean = false,
  profession?: string
): MoreMenuGroup[] {
  const encId = enclaveId || 'trades_construction'

  if (encId === 'trades_construction') {
    return [
      {
        category: "Job Site & Subcontractor Hub 🔨",
        items: [
          { id: "procurement", label: "📋 Subcontractor Bids & RFPs", desc: "$340K commercial framing & timber bids" },
          { id: "marketplace", label: "📐 Blueprint Takeoff & Spec Viewer", desc: "Interactive architectural plan markups" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "company", label: "🏛️ General Contractor Directory", desc: "Licensed GC & builder registry" },
          { id: "marketplace", label: "🪵 Lumber & Materials Center", desc: "Douglas Fir, hardwood futures & suppliers" },
          { id: "wallet", label: "💳 Trade Draws & Retainage Escrow", desc: "Milestone payments & lien waivers" },
        ]
      },
      {
        category: "Craftsmanship & Tools 🧰",
        items: [
          { id: "learning", label: "📐 CAD & Joinery Sandbox", desc: "Compound miter & mortise geometry" },
          { id: "learning", label: "🪵 Cut-List & Board-Foot Optimizer", desc: "Zero-waste timber layout calculator" },
          { id: "missions", label: "🔨 Master Craftsman Journey", desc: "Apprentice to Master Joiner lifecycle" },
          { id: "mentorship", label: "👨‍🏫 Master Joiner 1:1 Mentorship", desc: "Book timber framing master craftsmen" },
        ]
      },
      {
        category: "Safety & Trade Standards 🦺",
        items: [
          { id: "pulserooms", label: "🦺 OSHA 30 & Job-Site Safety", desc: "Fall protection, scaffolding & ANSI" },
          { id: "guilds", label: "🛡️ Timber Framers & Joiners Guild", desc: "Heritage guild verified master enclave" },
          { id: "peerreview", label: "⭐ Trade Superintendent Reviews", desc: "Structural PE & superintendent reviews" },
          { id: "compensation", label: "💰 Prevailing Trade Wages", desc: "Union scales & prevailing contractor rates" },
          { id: "accountsecurity", label: "🔐 Trade Identity & Safety Passes", desc: "OSHA cards, FIDO2 & digital credentials" },
        ]
      }
    ]
  }

  if (encId === 'healthcare_medicine') {
    return [
      {
        category: "Clinical & Hospital Hub 🏥",
        items: [
          { id: "procurement", label: "🏥 Hospital Equipment & Implant RFPs", desc: "Surgical hardware & clinical device bids" },
          { id: "pulserooms", label: "🧬 Clinical Trials & Research Grants", desc: "NIH & multi-center surgical trials" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "company", label: "🏛️ Academic Medical Centers", desc: "Level 1 Trauma & Magnet Hospital directory" },
          { id: "jobs", label: "🩺 Nurse Shift Exchange", desc: "PRN & travel shift bidding" },
          { id: "wallet", label: "💳 Clinical Retainers & Escrow", desc: "Locum tenens & expert testimony disbursements" },
        ]
      },
      {
        category: "Surgical & Evidence Suite 🔬",
        items: [
          { id: "learning", label: "🔬 PubMed & Case Evidence Sandbox", desc: "Peer-reviewed clinical decision support" },
          { id: "pulserooms", label: "🩺 ICU & OR Protocol Library", desc: "MTP, hemodynamic & ventilator pathways" },
          { id: "missions", label: "🩺 Board Specialty Milestones", desc: "Residency, fellowship & CME credits" },
          { id: "mentorship", label: "👨‍🏫 Attending Preceptor Mentorship", desc: "1:1 surgical & clinical mentorship" },
        ]
      },
      {
        category: "HIPAA & Clinical Standards 🩺",
        items: [
          { id: "trustcenter", label: "🛡️ HIPAA BAA Compliance Center", desc: "Zero-knowledge PHI & audit logging" },
          { id: "guilds", label: "🛡️ College of Surgeons & AACN Guild", desc: "Board-certified physician & nurse enclave" },
          { id: "peerreview", label: "⭐ Clinical Peer Review & M&M", desc: "Double-blind morbidity & mortality review" },
          { id: "compensation", label: "💰 Physician & Nurse Wage Index", desc: "MGMA salary benchmarks & per-diem rates" },
          { id: "accountsecurity", label: "🔐 EPCS DEA & FIDO2 Medical Pass", desc: "Prescription signing & clinical passkeys" },
        ]
      }
    ]
  }

  if (encId === 'automotive_mechanics') {
    return [
      {
        category: "Shop & Fleet Hub 🔧",
        items: [
          { id: "procurement", label: "🚛 Commercial Fleet Maintenance RFPs", desc: "Municipal & heavy diesel fleet bids" },
          { id: "bounties", label: "🏆 Master Tech Diagnostic Bounties", desc: "Unsolved CAN-bus & intermittent DTCs" },
          ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
          { id: "company", label: "🏛️ Fleet & Transport Directory", desc: "Certified repair facilities & OEM dealers" },
          { id: "marketplace", label: "🧰 Diagnostic Tool & Equipment Hub", desc: "Snap-on, PicoScope & Autel scan tools" },
          { id: "wallet", label: "💳 Flat-Rate Labor Draws & Escrow", desc: "Shop invoicing, warranty claims & payouts" },
        ]
      },
      {
        category: "Diagnostics & Powertrain Labs ⚡",
        items: [
          { id: "learning", label: "⚡ OBD-II & Scope Waveform Simulator", desc: "4-channel CAN-FD signal generator" },
          { id: "marketplace", label: "🔌 Mitchell 1 & ALLDATA Wiring Suite", desc: "OEM interactive schematics & pinouts" },
          { id: "missions", label: "🔧 ASE Master Technician Journey", desc: "A1–A8 + L1 Advanced Engine track" },
          { id: "mentorship", label: "👨‍🏫 Lead Master Diagnostic Mentorship", desc: "1:1 advanced EV & diesel mentoring" },
        ]
      },
      {
        category: "Safety & ASE Guilds 🦺",
        items: [
          { id: "pulserooms", label: "⚡ NFPA 70E High-Voltage EV Safety", desc: "800V de-energization & PPE protocols" },
          { id: "guilds", label: "🛡️ ASE Master Technicians Guild", desc: "World Class Master Technicians enclave" },
          { id: "peerreview", label: "⭐ Shop Foreman Peer Endorsements", desc: "Verified diagnostic accuracy ratings" },
          { id: "compensation", label: "💰 Flat-Rate & Flag-Hour Wage Index", desc: "Regional hourly rates & warranty labor times" },
          { id: "accountsecurity", label: "🔐 Shop Keyring & FIDO2 Passkeys", desc: "OEM flashing access & security gateway credentials" },
        ]
      }
    ]
  }

  // tech_cybersecurity or default
  return [
    {
      category: "Business & Enterprise 🏢",
      items: [
        { id: "procurement", label: "🏢 Procurement & RFPs", desc: "$2.4M enterprise spend & bids" },
        { id: "bounties", label: "🏆 Enterprise Bounties", desc: "$15K–$50K hackathons in escrow" },
        ...(isAdminUser ? [{ id: "adminiam", label: "🛡️ Admin & IAM Console", desc: "User enforcement, 4-eyes & audit log" }] : []),
        { id: "company", label: "🏛️ Company Hub", desc: "Expedite Consults enterprise profile" },
        { id: "sellercenter", label: "💼 Seller Center", desc: "Manage software & $122.7K MRR" },
        { id: "wallet", label: "💳 Pay, Wallet & Invoicing", desc: "$2,430 Balance & SOWs" },
      ]
    },
    {
      category: "AI & Innovation 🤖",
      items: [
        { id: "aiagents", label: "🤖 AI Agents Marketplace", desc: "Test & deploy autonomous agents" },
        { id: "missions", label: "🔥 Career Missions & Journey", desc: "10-step lifecycle & +1,850 XP" },
        { id: "collaboration", label: "🤝 Co-Founders & Ideas", desc: "Incubator & crowdsourced pilots" },
        { id: "mentorship", label: "👨‍🏫 Mentorship & Creators", desc: "1:1 CISO bookings & brand briefs" },
      ]
    },
    {
      category: "Developer & Defense Labs 🧪",
      items: [
        { id: "code", label: "🧑‍💻 ConnectIn Code", desc: "GitHub repo sync & recruit by code" },
        { id: "labs", label: "🧪 Security Labs Sandbox", desc: "Firecracker microVM sandboxes" },
        { id: "ecosystem", label: "🌐 Ecosystem Platform", desc: "APIs, SDKs & multi-cloud connectors" },
      ]
    },
    {
      category: "Trust & Community 🛡️",
      items: [
        { id: "accountsecurity", label: "🔐 Account Security & Passkeys", desc: "FIDO2, sessions & privacy" },
        { id: "guilds", label: "🛡️ Gated Guilds & Enclaves", desc: "TS/SCI & Founder roundtables" },
        { id: "trustcenter", label: "🛡️ Trust Center", desc: "SOC 2, FedRAMP & 99.99% uptime" },
        { id: "peerreview", label: "⭐ Peer Review", desc: "Verified expert validation ($150/hr)" },
        { id: "compensation", label: "💰 Compensation Intelligence", desc: "Salary benchmarks & contractor rates" },
        { id: "events", label: "📅 Events & Live Demos", desc: "Webinars & live teardowns" },
      ]
    }
  ]
}

export function getEnclaveSearchPlaceholder(enclaveId?: string): string {
  switch (enclaveId) {
    case 'trades_construction':
      return "Search blueprints, timber framing jobs, subcontractor bids, tools..."
    case 'healthcare_medicine':
      return "Search clinical trials, surgical cases, hospital jobs, equipment..."
    case 'automotive_mechanics':
      return "Search OBD-II codes, ASE jobs, fleet diagnostics, Snap-on..."
    case 'tech_cybersecurity':
      return "Search zero-days, GovCloud jobs, exploit POCs, CISSP..."
    default:
      return "Search people, jobs, hubs..."
  }
}

export function getEnclaveModules(enclaveId?: string, isAdminUser: boolean = false) {
  switch (enclaveId) {
    case 'trades_construction':
      return [
        { id: "jobs", label: "Trades & Carpentry Jobs", desc: "Active commercial framing & finish roles", icon: "🔨" },
        { id: "marketplace", label: "Tools & Lumber Marketplace", desc: "Festool, total stations & timber stock", icon: "🧰" },
        { id: "procurement", label: "Subcontractor Bids & RFPs", desc: "Commercial framing & finish buildouts", icon: "📋" },
        { id: "media", label: "ConnectIn Trade TV", desc: "Timber framing & site teardowns", icon: "🎥" },
        { id: "pulserooms", label: "OSHA & Code Pulse", desc: "Live job-site safety roundtables", icon: "🦺" },
        { id: "learning", label: "Master Craftsman Academy", desc: "Joinery, CAD & OSHA 30 certifications", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Trade Passkeys & OSHA Cards", desc: "Digital safety credentials & FIDO2", icon: "🔐" }
      ]
    case 'healthcare_medicine':
      return [
        { id: "jobs", label: "Surgical & Nursing Jobs", desc: "Level 1 Trauma, ICU & Attending requisitions", icon: "🏥" },
        { id: "marketplace", label: "Clinical & Surgical Marketplace", desc: "Ultrasounds, implants & surgical tools", icon: "🩺" },
        { id: "procurement", label: "Hospital Equipment RFPs", desc: "Medical device & implant tenders", icon: "📋" },
        { id: "media", label: "ConnectIn Clinical TV", desc: "Surgical case streams & Grand Rounds", icon: "🎥" },
        { id: "pulserooms", label: "FDA & Clinical Pulse", desc: "Live trauma & resuscitation audio stages", icon: "💉" },
        { id: "learning", label: "CME & Board Specialty Academy", desc: "ATLS, CCRN & Surgical Fellowship tracks", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "EPCS DEA & FIDO2 Passes", desc: "Prescription signing & clinical passkeys", icon: "🔐" }
      ]
    case 'automotive_mechanics':
      return [
        { id: "jobs", label: "Master Tech & Fleet Jobs", desc: "Dealership master diagnostics & heavy diesel", icon: "🔧" },
        { id: "marketplace", label: "Snap-on & Scope Marketplace", desc: "PicoScopes, scan tools & EV PPE", icon: "⚡" },
        { id: "procurement", label: "Commercial Fleet RFPs", desc: "Municipal & logistics fleet contracts", icon: "🚛" },
        { id: "media", label: "ConnectIn Auto TV", desc: "CAN-FD waveform teardowns & EV repairs", icon: "🎥" },
        { id: "pulserooms", label: "NHTSA & TSB Pulse", desc: "Live master diagnostic case studies", icon: "📻" },
        { id: "learning", label: "ASE Master Tech Academy", desc: "A1–A8, L1 & L3 EV training modules", icon: "🎓" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Shop Keyring & FIDO2 Passkeys", desc: "OEM flashing access & security gateway", icon: "🔐" }
      ]
    default:
      return [
        { id: "jobs", label: "Jobs Hub & Requisitions", desc: "Active cleared & enterprise tech roles", icon: "💼" },
        { id: "marketplace", label: "Enterprise Marketplace", desc: "Software, tools & cATO packs", icon: "🛍️" },
        { id: "procurement", label: "Procurement & RFPs", desc: "$2.4M enterprise spend & bids", icon: "🏢" },
        { id: "bounties", label: "Enterprise Bounties", desc: "$15K–$50K hackathons in escrow", icon: "🏆" },
        { id: "media", label: "ConnectIn TV & Media", desc: "Live streams & tech podcasts", icon: "🎥" },
        { id: "pulserooms", label: "Pulse Rooms", desc: "Live audio roundtables & news", icon: "📰" },
        { id: "learning", label: "Learning & Certifications", desc: "Defense labs & credentials", icon: "🎓" },
        { id: "labs", label: "Security Labs Sandbox", desc: "Firecracker microVM sandboxes", icon: "🧪" },
        ...(isAdminUser ? [{ id: "adminiam", label: "Admin & IAM Console", desc: "User enforcement & audit log", icon: "🛡️" }] : []),
        { id: "accountsecurity", label: "Account Security & Passkeys", desc: "FIDO2, sessions & privacy", icon: "🔐" }
      ]
  }
}
