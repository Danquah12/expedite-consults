export interface WheelVideoTalk {
  id: string
  serialPlate: string
  title: string
  speaker: string
  speakerTitle: string
  youtubeId: string
  duration: string
  category: 'finance' | 'trade' | 'compliance' | 'security'
  categoryLabel: string
  thumbnailUrl: string
  summary: string
  takeaways: string[]
  tags: string[]
}

export interface OnboardingGuideChapter {
  id: string
  stepNumber: number
  title: string
  subtitle: string
  description: string
  youtubeId: string
  duration: string
  targetTab?: string
  featureActionLabel?: string
  highlights: string[]
}

export const EDUCATIONAL_WHEEL_TALKS: WheelVideoTalk[] = [
  {
    id: "wheel-deposit-ins",
    serialPlate: "CLN-EXP01",
    title: "Deposit Insurance & Liquidity Safeguards",
    speaker: "Expedite Consults Financial Advisory",
    speakerTitle: "Treasury & Risk Management",
    youtubeId: "VM8DODp68Oc",
    duration: "4:52",
    category: "finance",
    categoryLabel: "Treasury & Finance",
    thumbnailUrl: "https://i.ytimg.com/vi/VM8DODp68Oc/hqdefault.jpg",
    summary: "Comprehensive guide to FDIC, DIF, and private commercial deposit insurance limits, sweep accounts, and protecting business operating liquidity.",
    takeaways: [
      "Understand the \$250,000 baseline per depositor per ownership category",
      "How multi-institution CDARS/ICS sweeps protect balances up to \$50M",
      "Mitigating counterparty exposure for contractor payroll reserves"
    ],
    tags: ["#DepositInsurance", "#Treasury", "#RiskManagement", "#PayrollSecurity"]
  },
  {
    id: "wheel-broker-adviser",
    serialPlate: "CLN-EXP02",
    title: "Broker vs. Investment Adviser: Fiduciary Standard",
    speaker: "Expedite Consults Corporate Counsel",
    speakerTitle: "Fiduciary Compliance Practice",
    youtubeId: "FZNCce1spHQ",
    duration: "4:15",
    category: "finance",
    categoryLabel: "Fiduciary Standards",
    thumbnailUrl: "https://i.ytimg.com/vi/FZNCce1spHQ/hqdefault.jpg",
    summary: "Clear legal breakdown of the suitability standard governing broker-dealers versus the strict fiduciary duty binding registered investment advisers (RIAs).",
    takeaways: [
      "Fiduciary duty legally requires putting the client's interests first at all times",
      "Suitability standard only requires reasonable suitability at the time of sale",
      "Fee-only vs commission-based advisory compensation disclosure"
    ],
    tags: ["#FiduciaryDuty", "#InvestmentAdviser", "#BrokerDealer", "#Compliance"]
  },
  {
    id: "wheel-life-insurance",
    serialPlate: "CLN-EXP03",
    title: "Understanding Business & Key-Person Insurance",
    speaker: "Expedite Consults Underwriting",
    speakerTitle: "Enterprise Risk Solutions",
    youtubeId: "zM61V4PuQ8w",
    duration: "5:08",
    category: "finance",
    categoryLabel: "Executive Protection",
    thumbnailUrl: "https://i.ytimg.com/vi/zM61V4PuQ8w/hqdefault.jpg",
    summary: "Structuring key-person life insurance, buy-sell agreements, and executive term policies to ensure uninterrupted business continuity.",
    takeaways: [
      "How key-person insurance protects bank lines of credit and bonding capacity",
      "Funding cross-purchase buy-sell agreements among business partners",
      "Tax treatment of corporate life insurance premiums vs benefit proceeds"
    ],
    tags: ["#KeyPersonInsurance", "#BusinessContinuity", "#BuySell", "#CommercialCoverage"]
  },
  {
    id: "wheel-free-tax-prep",
    serialPlate: "CLN-EXP04",
    title: "Tax Credits, Section 179 & Contractor Write-Offs",
    speaker: "Expedite Tax Intelligence",
    speakerTitle: "Corporate Tax Strategist",
    youtubeId: "3zmzQgWs-YI",
    duration: "4:40",
    category: "finance",
    categoryLabel: "Tax Strategy",
    thumbnailUrl: "https://i.ytimg.com/vi/3zmzQgWs-YI/hqdefault.jpg",
    summary: "Maximizing Section 179 depreciation for heavy machinery, tool write-offs, mileage tracking, and qualifying for federal clean energy commercial credits.",
    takeaways: [
      "Immediate 100% write-offs for capital equipment under Section 179",
      "Segregating personal and business vehicle mileage for IRS audit defense",
      "State-specific pass-through entity (PTE) tax credits"
    ],
    tags: ["#Section179", "#TaxDeductions", "#TradeMachinery", "#IRSCompliance"]
  },
  {
    id: "wheel-loan-approval",
    serialPlate: "CLN-EXP05",
    title: "The Commercial Loan Underwriting Process",
    speaker: "Expedite Lending Desk",
    speakerTitle: "Commercial Credit Syndicate",
    youtubeId: "RkmWCI-JtL8",
    duration: "5:12",
    category: "finance",
    categoryLabel: "Lending & Capital",
    thumbnailUrl: "https://i.ytimg.com/vi/RkmWCI-JtL8/hqdefault.jpg",
    summary: "Behind-the-scenes view of credit committees: Debt Service Coverage Ratio (DSCR), personal guarantees, and building an unassailable loan package.",
    takeaways: [
      "Targeting a minimum 1.25x DSCR for commercial lines of credit",
      "Presenting audited work-in-progress (WIP) schedules to bank underwriters",
      "SBA 7(a) vs 504 financing for contractor real estate acquisition"
    ],
    tags: ["#CommercialLending", "#DSCR", "#Underwriting", "#CreditLines"]
  },
  {
    id: "wheel-lineman-apprentice",
    serialPlate: "CLN-TRD01",
    title: "Lineman Apprenticeship & High-Voltage Linework",
    speaker: "Master Lineworker Brotherhood",
    speakerTitle: "IBEW / NECA Journeyman Trainer",
    youtubeId: "Tsok2MiPtHY",
    duration: "5:20",
    category: "trade",
    categoryLabel: "Electrical & High Voltage",
    thumbnailUrl: "https://i.ytimg.com/vi/Tsok2MiPtHY/hqdefault.jpg",
    summary: "Rigorous standards of the union electrical lineman apprenticeship: climbing certification, hot-stick training, substation safety, and storm restoration.",
    takeaways: [
      "Minimum 7,000 on-the-job training hours required for Journeyman ticket",
      "Zero-tolerance arc flash PPE standards (NFPA 70E)",
      "Emergency bucket truck rescue and pole-top CPR protocol"
    ],
    tags: ["#Lineman", "#HighVoltage", "#IBEW", "#ElectricalTrade", "#Apprenticeship"]
  },
  {
    id: "wheel-service-panel",
    serialPlate: "CLN-TRD02",
    title: "200A & 400A Electrical Service Panel Upgrades",
    speaker: "Master Electrician Institute",
    speakerTitle: "NEC Code Authority",
    youtubeId: "Xo284DSmZto",
    duration: "4:35",
    category: "trade",
    categoryLabel: "Electrical Trades",
    thumbnailUrl: "https://i.ytimg.com/vi/Xo284DSmZto/hqdefault.jpg",
    summary: "Step-by-step master electrician walkthrough of upgrading aging 100A panels to 200A/400A with whole-home surge suppression and EV charger capacity.",
    takeaways: [
      "Proper grounding electrode system (GES) bonding per NEC Article 250",
      "Load calculation worksheets for heat pumps and Level 2 EV charging",
      "Safe coordination with utility drop crews for hot service disconnects"
    ],
    tags: ["#ElectricalPanel", "#NEC2023", "#Grounding", "#Electrician"]
  },
  {
    id: "wheel-hvac-commercial",
    serialPlate: "CLN-TRD03",
    title: "Commercial HVAC Blueprint & Chiller Diagnostics",
    speaker: "Advanced Mechanical Guild",
    speakerTitle: "HVAC/R Senior Superintendent",
    youtubeId: "Pe3n9-r8TP0",
    duration: "5:04",
    category: "trade",
    categoryLabel: "Mechanical & HVAC",
    thumbnailUrl: "https://i.ytimg.com/vi/Pe3n9-r8TP0/hqdefault.jpg",
    summary: "Reading complex MEP mechanical schematics, troubleshooting variable refrigerant flow (VRF) circuits, and EPA 608 universal compliance.",
    takeaways: [
      "Psychrometric chart analysis for commercial enthalpy optimization",
      "Superheat and subcooling verification on dual-stage compressor systems",
      "Building automation system (BAS) BACnet protocol commissioning"
    ],
    tags: ["#HVAC", "#CommercialRefrigeration", "#MEPBlueprints", "#EPA608"]
  },
  {
    id: "wheel-joinery-framing",
    serialPlate: "CLN-TRD04",
    title: "Master Carpenter Joinery & Heavy Timber Framing",
    speaker: "Craftsman Timber & Joinery",
    speakerTitle: "Master Joiner & Framer",
    youtubeId: "g6lcLQMy42E",
    duration: "4:48",
    category: "trade",
    categoryLabel: "Carpentry & Framing",
    thumbnailUrl: "https://i.ytimg.com/vi/g6lcLQMy42E/hqdefault.jpg",
    summary: "Precision mortise and tenon timber framing, laser layout techniques for plumb shear walls, and custom architectural finish millwork.",
    takeaways: [
      "Tension and compression joint engineering in timber truss construction",
      "Laser transit leveling for framing straight walls over uneven slabs",
      "Moisture meter reading calibration before high-end hardwood installs"
    ],
    tags: ["#Carpentry", "#TimberFraming", "#Woodworking", "#FinishJoinery"]
  },
  {
    id: "wheel-pipe-welding",
    serialPlate: "CLN-TRD05",
    title: "Certified 6G Pipe Welding & Non-Destructive Testing",
    speaker: "American Welding Society (AWS) Masters",
    speakerTitle: "Certified Welding Inspector (CWI)",
    youtubeId: "VMCdHzpmy1I",
    duration: "5:15",
    category: "trade",
    categoryLabel: "Welding & Metallurgy",
    thumbnailUrl: "https://i.ytimg.com/vi/VMCdHzpmy1I/hqdefault.jpg",
    summary: "Mastering the 6G inclined pipe test with GTAW (TIG) root pass and SMAW (stick) fill and cap, passing 100% radiographic x-ray inspection.",
    takeaways: [
      "Feathering tack welds and managing keyhole penetration on schedule 80 pipe",
      "Interpass temperature control to prevent grain boundary embrittlement",
      "Passing AWS D1.1 and ASME Section IX hydrostatic pressure tests"
    ],
    tags: ["#PipeWelding", "#6GTest", "#AWS", "#TIGWelding", "#Metallurgy"]
  },
  {
    id: "wheel-solar-interconnect",
    serialPlate: "CLN-TRD06",
    title: "Utility-Scale Solar PV Inverter & Grid Interconnection",
    speaker: "Clean Energy Electrical Engineers",
    speakerTitle: "Renewable Interconnection Lead",
    youtubeId: "RVITn9lWfOY",
    duration: "4:58",
    category: "trade",
    categoryLabel: "Clean Energy Trades",
    thumbnailUrl: "https://i.ytimg.com/vi/RVITn9lWfOY/hqdefault.jpg",
    summary: "Connecting multi-megawatt string inverters, rapid shutdown compliance, utility interconnect studies, and battery energy storage system (BESS) integration.",
    takeaways: [
      "NEC 690 and 705 grid-tied interconnect protection protocols",
      "Commissioning IEEE 1547 compliant anti-islanding relays",
      "BESS thermal runaway suppression and NFPA 855 life-safety integration"
    ],
    tags: ["#SolarEnergy", "#Inverters", "#GridInterconnect", "#CleanTech"]
  },
  {
    id: "wheel-osha30-fall",
    serialPlate: "CLN-CMP01",
    title: "OSHA 30 Jobsite Fall Protection & Subpart M Compliance",
    speaker: "Expedite Safety Directorate",
    speakerTitle: "Authorized OSHA 500 Instructor",
    youtubeId: "OWNXI09WI14",
    duration: "4:22",
    category: "compliance",
    categoryLabel: "Safety Compliance",
    thumbnailUrl: "https://i.ytimg.com/vi/OWNXI09WI14/hqdefault.jpg",
    summary: "Complete review of OSHA Subpart M requirements: 6-foot trigger height, 5,000-lb anchor points, daily harness inspection, and leading-edge guardrails.",
    takeaways: [
      "Calculating total fall clearance including deceleration distance and stretch",
      "Daily pre-shift inspection checklist for synthetic harnesses and lanyards",
      "Competent person site authority to stop work on unsafe scaffolds"
    ],
    tags: ["#OSHA30", "#FallProtection", "#SafetyCompliance", "#JobsiteSuperintendent"]
  }
]

export const ONBOARDING_GUIDE_CHAPTERS: OnboardingGuideChapter[] = [
  {
    id: "ch-enclaves",
    stepNumber: 1,
    title: "Least-Privilege Need-to-Know Enclaves",
    subtitle: "Complete professional isolation and verified trade integrity",
    description: "ConnectIn organizes your professional universe into 12 verified Need-to-Know enclaves. Trade specifications, blueprints, and bids never leak into software sandboxes, and corporate tech jargon stays out of your jobsite workspace.",
    youtubeId: "VM8DODp68Oc",
    duration: "1:45",
    targetTab: "home",
    featureActionLabel: "Auditor Switcher: Test Multi-Enclave View",
    highlights: [
      "12 Verified Professional Disciplines (Trades, Tech, Healthcare, GovCloud, Legal)",
      "Strict data segregation: software developers never see subcontractor bids",
      "Super Admin Auditor Switcher allows cross-discipline multi-highlight viewing"
    ]
  },
  {
    id: "ch-resume",
    stepNumber: 2,
    title: "AI Resume Auto-Builder & Instant Workspace Experience",
    subtitle: "Upload PDF or DOCX to build your career timeline in seconds",
    description: "Skip tedious profile typing. ConnectIn's AI Resume Parser extracts your exact job titles, employers, date ranges, and verified skills, and immediately persists them directly into your Workspace Experience tab with one click.",
    youtubeId: "FZNCce1spHQ",
    duration: "1:30",
    targetTab: "profile",
    featureActionLabel: "Open AI Resume Upload Modal",
    highlights: [
      "PDF, DOCX, and raw text extraction powered by specialized parsing NLP",
      "1-click 'Save & Apply to My Profile Experience'",
      "Automatic return to your workspace with smooth scroll to your new roles"
    ]
  },
  {
    id: "ch-workspaces",
    stepNumber: 3,
    title: "4 Dedicated Active Workspaces",
    subtitle: "Switch between Personal, Enterprise, Creator & Seller personas",
    description: "A single professional wears multiple hats. ConnectIn gives you four completely independent workspaces: Personal for individual networking, Enterprise for procurement & RFPs, Creator for publishing & reels, and Seller for marketplace storefronts.",
    youtubeId: "zM61V4PuQ8w",
    duration: "2:00",
    targetTab: "profile",
    featureActionLabel: "Open Persona Switcher",
    highlights: [
      "Personal: Identity card, vouches, peer recommendations and career timeline",
      "Enterprise: Corporate bidding, verified subcontractor RFPs and ISO/SOC 2 trust",
      "Creator & Seller: Monetized course storefronts, advisory hours and reels"
    ]
  },
  {
    id: "ch-vibe",
    stepNumber: 4,
    title: "Vibe AI Global Assistant & Campus Intelligence",
    subtitle: "Instant interactive Q&A, trade specs, and policy answers",
    description: "Ask Vibe AI anything across all 12 disciplines. Get instant code snippets, OSHA compliance regulations, electrical load calculations, or university campus policies without searching through thousands of pages.",
    youtubeId: "3zmzQgWs-YI",
    duration: "1:15",
    targetTab: "vibe",
    featureActionLabel: "Launch Vibe AI Assistant",
    highlights: [
      "Voice & text interactive intelligence tuned for trades and enterprise IAM",
      "Context-aware answers referencing your active enclave and workspace",
      "Direct action buttons to draft RFPs, create polls, or launch courses"
    ]
  },
  {
    id: "ch-sharing",
    stepNumber: 5,
    title: "Multi-Social 1-Click Sharing & Public Verification",
    subtitle: "Distribute your credentials and posts across WhatsApp, X, Facebook & IG",
    description: "Share your professional accomplishments, jobsite milestones, or profile card instantly with verified direct links to WhatsApp, Facebook, X (Twitter), LinkedIn, Instagram, and Email.",
    youtubeId: "RkmWCI-JtL8",
    duration: "1:20",
    targetTab: "home",
    featureActionLabel: "Explore Post Sharing",
    highlights: [
      "1-click WhatsApp messaging to subcontractor crews and business partners",
      "Branded public credentials preview card for social feeds",
      "Quick link copy with clipboard feedback and audit timestamp"
    ]
  }
]
