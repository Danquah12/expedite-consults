/**
 * ConnectLn "Work & Business" Unified Data & Persistence Engine
 * Powers:
 *  - My workspace & Grow with ConnectLn (14 menu items + role/interest personalization)
 *  - Services & Inquiries (Offer your services, Find a professional, My services & inquiries)
 *  - Work Opportunities & Applications (Employment, Contract projects, Apprenticeships, status pipeline)
 *  - Communities (Trades & professions, Location, Veterans, Apprentices & learners, Organizations & franchises)
 *  - Business Pages (Public page + Private management workspace + Franchise parent/location hierarchy)
 *  - Real Activity & Business Insights (Profile visits, Content reach, Directory discovery, Service activity, Hiring activity)
 */

export type WorkBusinessItemId =
  | 'my_work_applications'
  | 'my_services_inquiries'
  | 'my_communities'
  | 'my_learning'
  | 'my_business_pages'
  | 'activity_insights'
  | 'billing_settings'
  | 'find_work'
  | 'post_job_project'
  | 'find_professional'
  | 'offer_services'
  | 'explore_communities'
  | 'learn_practical_skills'
  | 'create_business_page'

export type MemberInterestRole =
  | 'find_work'
  | 'offer_services'
  | 'hire_people'
  | 'learn'
  | 'manage_business'

export interface WorkBusinessMenuEntry {
  id: WorkBusinessItemId
  column: 'workspace' | 'grow'
  title: string
  subtitle: string
  footerDescription: string
  isBottomDividerItem?: boolean
  relatedInterests: MemberInterestRole[]
}

export const WORK_BUSINESS_MENU_ITEMS: WorkBusinessMenuEntry[] = [
  // LEFT COLUMN: My workspace (manages existing activity)
  {
    id: 'my_work_applications',
    column: 'workspace',
    title: 'My work & applications',
    subtitle: 'Saved work, applications & replies',
    footerDescription: 'Review saved opportunities, track employment applications from Submitted to Offer, and manage contract quotes or apprenticeship applications.',
    relatedInterests: ['find_work']
  },
  {
    id: 'my_services_inquiries',
    column: 'workspace',
    title: 'My services & inquiries',
    subtitle: 'Listings, requests & quotes',
    footerDescription: 'Manage your published trade or professional service listings, respond to customer inquiries, send quotes, and track booked jobs.',
    relatedInterests: ['offer_services', 'manage_business']
  },
  {
    id: 'my_communities',
    column: 'workspace',
    title: 'My communities',
    subtitle: 'Trade, local & veteran networks',
    footerDescription: 'Return to the trade, regional, veteran, apprentice, and franchise communities you have joined to participate in discussions and events.',
    relatedInterests: ['find_work', 'offer_services', 'learn']
  },
  {
    id: 'my_learning',
    column: 'workspace',
    title: 'My learning',
    subtitle: 'Saved lessons & skills progress',
    footerDescription: 'Continue saved video lessons, review completed practice notes, and manage uploaded certificates and verified credentials separately.',
    relatedInterests: ['learn', 'find_work']
  },
  {
    id: 'my_business_pages',
    column: 'workspace',
    title: 'My business pages',
    subtitle: 'Pages, people & locations',
    footerDescription: 'Open your private management workspace for businesses, practices, and franchise locations to handle inquiries, applicants, and team access.',
    relatedInterests: ['manage_business', 'hire_people']
  },
  {
    id: 'activity_insights',
    column: 'workspace',
    title: 'Activity & insights',
    subtitle: 'Profile visits, reach & discovery',
    footerDescription: 'Inspect real recorded activity: profile viewers (with shortcut to Who viewed my profile), content reach, directory discovery, service inquiries, and hiring actions.',
    relatedInterests: ['find_work', 'offer_services', 'hire_people', 'manage_business']
  },
  {
    id: 'billing_settings',
    column: 'workspace',
    title: 'Billing & settings',
    subtitle: 'Plans, receipts & preferences',
    footerDescription: 'Manage account security, privacy settings, role interests, payment methods, invoices, and Desk Note / Noctis workspace links.',
    isBottomDividerItem: true,
    relatedInterests: ['manage_business']
  },

  // RIGHT COLUMN: Grow with ConnectLn (starts a new action)
  {
    id: 'find_work',
    column: 'grow',
    title: 'Find work',
    subtitle: 'Jobs, projects & apprenticeships',
    footerDescription: 'Search by trade, location, work type, schedule and pay. Save opportunities, apply and follow your application status.',
    relatedInterests: ['find_work']
  },
  {
    id: 'post_job_project',
    column: 'grow',
    title: 'Post a job or project',
    subtitle: 'Hire employees, crews or specialists',
    footerDescription: 'Choose between Employment, Contract project, or Apprenticeship with tailored forms so candidates or contractors respond with the right information.',
    relatedInterests: ['hire_people', 'manage_business']
  },
  {
    id: 'find_professional',
    column: 'grow',
    title: 'Find a professional',
    subtitle: 'Discover services near you',
    footerDescription: 'Search verified tradespeople, mechanics, painters, and independent specialists near you, inspect work samples, and request a quote.',
    relatedInterests: ['hire_people', 'manage_business']
  },
  {
    id: 'offer_services',
    column: 'grow',
    title: 'Offer your services',
    subtitle: 'Show your skills & receive inquiries',
    footerDescription: 'Publish your trade or professional service with completed work photos, service area, pricing approach, and clearly labeled qualifications.',
    relatedInterests: ['offer_services']
  },
  {
    id: 'explore_communities',
    column: 'grow',
    title: 'Explore communities',
    subtitle: 'Connect through work & shared goals',
    footerDescription: 'Discover communities organized around trades and professions, local regions, veterans, apprentices and learners, and franchise networks.',
    relatedInterests: ['find_work', 'offer_services', 'learn']
  },
  {
    id: 'learn_practical_skills',
    column: 'grow',
    title: 'Learn practical skills',
    subtitle: 'Trade lessons, mentoring & training',
    footerDescription: 'Explore practical training organized by goal: improve a trade skill, price and quote a job, prepare for interviews, or start a service business.',
    relatedInterests: ['learn', 'find_work']
  },
  {
    id: 'create_business_page',
    column: 'grow',
    title: 'Create a business page',
    subtitle: 'Businesses, franchises & organizations',
    footerDescription: 'Create a public page and private management workspace for an independent business, professional practice, franchise location, training provider, or association.',
    isBottomDividerItem: true,
    relatedInterests: ['manage_business', 'offer_services', 'hire_people']
  }
]

// ─── A. SERVICES & CUSTOMER INQUIRIES ──────────────────────────────────────────

export type PricingApproach = 'hourly' | 'fixed_price' | 'request_quote'
export type QualificationVerification = 'member_supplied' | 'independently_checked'

export interface ServiceQualification {
  id: string
  title: string
  issuer: string
  verificationStatus: QualificationVerification
}

export interface ServiceListing {
  id: string
  providerName: string
  providerHeadline: string
  providerAvatar: string
  tradeOrService: string
  category: string
  description: string
  workSamples: { title: string; imageUrl: string; caption: string }[]
  serviceArea: string
  availability: string
  pricingApproach: PricingApproach
  rateDisplay: string
  qualifications: ServiceQualification[]
  createdAt: string
  isOwner?: boolean
}

export interface ServiceInquiry {
  id: string
  serviceId: string
  serviceTitle: string
  providerName: string
  customerName: string
  customerLocation: string
  projectScope: string
  preferredDates: string
  requirements: string
  status: 'New inquiry' | 'Quote sent' | 'Accepted' | 'Completed'
  quoteAmount?: string
  providerReply?: string
  createdAt: string
}

export const INITIAL_SERVICE_LISTINGS: ServiceListing[] = [
  {
    id: 'srv_laurel_painter',
    providerName: 'Carlos Mendez',
    providerHeadline: 'Master Residential & Commercial Painter · 14 Yrs Experience',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    tradeOrService: 'Interior & Exterior Painting, Cabinet Refinishing & Drywall Prep',
    category: 'Painting & Decorating',
    description: 'Clean-edge interior room painting, zero-VOC Sherwin-Williams finishes, skim-coat drywall repair, and HVLP cabinet spraying for homeowners and general contractors.',
    workSamples: [
      {
        title: 'Laurel Colonial 4-Room Interior & Crown Molding',
        imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80',
        caption: 'Level-5 drywall skim coat and satin trim enamel completed in 3 days.'
      },
      {
        title: 'Kitchen Shaker Cabinet HVLP Enamel Finish',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&auto=format&fit=crop&q=80',
        caption: 'Factory-grade catalyzed lacquer finish with dustless sanding.'
      }
    ],
    serviceArea: 'Laurel, Bowie, Columbia, Silver Spring & Greater DMV (25-mile radius)',
    availability: 'Available next week · Mon–Sat (7:00 AM – 5:00 PM)',
    pricingApproach: 'request_quote',
    rateDisplay: 'Request a quote (Typical room: $380 – $650 incl. prep)',
    qualifications: [
      {
        id: 'q1',
        title: 'Maryland MHIC Licensed Home Improvement Contractor #142890',
        issuer: 'Maryland DLLR',
        verificationStatus: 'independently_checked'
      },
      {
        id: 'q2',
        title: 'EPA Lead-Safe RRP Certified Renovator',
        issuer: 'U.S. EPA',
        verificationStatus: 'independently_checked'
      },
      {
        id: 'q3',
        title: '14 Years Commercial & Residential Finish Painting Portfolio',
        issuer: 'Self-Reported Experience',
        verificationStatus: 'member_supplied'
      }
    ],
    createdAt: '2 days ago'
  },
  {
    id: 'srv_timber_carpenter',
    providerName: 'Kwesi Asiedu',
    providerHeadline: 'Master Carpenter (Heavy Timber & Custom Joinery) · Founder @ Expedite Consults',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    tradeOrService: 'Custom Heavy Timber Framing, Structural Staircases & Architectural Millwork',
    category: 'Carpentry & Joinery',
    description: 'Precision mortise-and-tenon timber bents, custom coffered ceilings, structural beam reinforcement, and commercial blueprint layout.',
    workSamples: [
      {
        title: 'Douglas Fir Hammer-Beam Truss Pavilion',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
        caption: 'Hand-cut white oak pegs and CNC-verified joinery.'
      }
    ],
    serviceArea: 'Maryland, DC & Northern Virginia',
    availability: 'Booking projects for current & next month',
    pricingApproach: 'fixed_price',
    rateDisplay: 'Fixed price per project or $95 / hr master rate',
    qualifications: [
      {
        id: 'q4',
        title: 'OSHA 30-Hour Construction Outreach Card',
        issuer: 'OSHA / Dept. of Labor',
        verificationStatus: 'independently_checked'
      },
      {
        id: 'q5',
        title: 'Master Heavy Timber & Finish Joinery Portfolio',
        issuer: 'Member Supplied',
        verificationStatus: 'member_supplied'
      }
    ],
    createdAt: '5 days ago',
    isOwner: true
  },
  {
    id: 'srv_mobile_mechanic',
    providerName: 'Marcus Miller',
    providerHeadline: 'ASE Master Certified & High-Voltage EV Diagnostic Technician (L1/L3)',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
    tradeOrService: 'On-Site OBD-II / CAN-Bus Diagnostics, Pre-Purchase Inspections & Fleet Repair',
    category: 'Automotive & Diesel',
    description: 'Mobile oscilloscope diagnostics, check-engine fault isolation, parasitic draw testing, and commercial van fleet maintenance.',
    workSamples: [
      {
        title: '4-Channel PicoScope CAN-FD Bus Fault Isolation',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
        caption: 'Pinpointed corroded body control module harness in 25 minutes without parts swapping.'
      }
    ],
    serviceArea: 'Baltimore, Laurel, Annapolis & I-95 Corridor',
    availability: 'Same-day emergency & scheduled fleet slots',
    pricingApproach: 'hourly',
    rateDisplay: '$125 / hr (Diagnostic call-out $140 flat)',
    qualifications: [
      {
        id: 'q6',
        title: 'ASE Master Automobile Technician (A1–A8 + L1 + L3 EV)',
        issuer: 'National Institute for Automotive Service Excellence',
        verificationStatus: 'independently_checked'
      },
      {
        id: 'q7',
        title: 'PicoScope Master Waveform Specialist',
        issuer: 'Member Supplied',
        verificationStatus: 'member_supplied'
      }
    ],
    createdAt: '1 week ago'
  }
]

export const INITIAL_SERVICE_INQUIRIES: ServiceInquiry[] = [
  {
    id: 'inq_laurel_1',
    serviceId: 'srv_timber_carpenter',
    serviceTitle: 'Custom Heavy Timber Framing, Structural Staircases & Architectural Millwork',
    providerName: 'Kwesi Asiedu',
    customerName: 'Rachel Thornton (Homeowner · Laurel, MD)',
    customerLocation: 'Laurel, MD 20707',
    projectScope: 'Custom white oak open-riser staircase and living room exposed ceiling beams (3 rooms total).',
    preferredDates: 'Nov 18 – Nov 29, 2026',
    requirements: 'Need site measurement, structural load check, and dust containment.',
    status: 'New inquiry',
    createdAt: '2 hours ago'
  }
]

// ─── B. JOBS, PROJECTS & APPRENTICESHIPS ───────────────────────────────────────

export type OpportunityKind = 'employment' | 'contract_project' | 'apprenticeship'

export type EmploymentStage = 'Submitted' | 'Under review' | 'Interview' | 'Offer'
export type ProjectQuoteStage = 'Quote submitted' | 'Scope discussion' | 'Accepted' | 'Completed'
export type ApprenticeshipStage = 'Submitted' | 'Aptitude review' | 'Shop interview' | 'Accepted to program'

export interface WorkOpportunityItem {
  id: string
  kind: OpportunityKind
  title: string
  organization: string
  location: string
  tradeCategory: string
  createdAt: string
  // Employment fields
  payRange?: string
  schedule?: string
  employmentType?: string
  requiredSkills: string[]
  // Contract project fields
  scopeOfWork?: string
  timing?: string
  optionalBudget?: string
  // Apprenticeship fields
  trainingProviderOrEmployer?: string
  compensation?: string
  trainingStructure?: string
  entryRequirements?: string[]
}

export interface TrackedWorkSubmission {
  id: string
  opportunityId: string
  opportunityKind: OpportunityKind
  opportunityTitle: string
  organization: string
  location: string
  applicantName: string
  submittedAt: string
  currentStage: string
  stageHistory: { stage: string; timestamp: string; note: string }[]
  proposalOrNote: string
  proposedAmount?: string
}

export const INITIAL_WORK_OPPORTUNITIES: WorkOpportunityItem[] = [
  {
    id: 'opp_emp_carpenter',
    kind: 'employment',
    title: 'Lead Commercial Finish Carpenter & Millwork Foreman',
    organization: 'Chesapeake Heritage Builders LLC',
    location: 'Laurel / Columbia, MD (On-site)',
    tradeCategory: 'Carpentry & Joinery',
    payRange: '$42 – $54 / hr + Overtime & Benefits',
    schedule: 'Mon–Fri · 6:30 AM – 3:00 PM (40 hrs/wk)',
    employmentType: 'Full-time Direct Employment',
    requiredSkills: ['Blueprint Reading', 'Crown & Coffered Ceilings', 'OSHA 30', 'Cabinet Installation'],
    createdAt: '1 day ago'
  },
  {
    id: 'opp_proj_painting',
    kind: 'contract_project',
    title: '3,800 Sq. Ft. Dental Clinic Interior Repaint & Epoxy Flooring Prep',
    organization: 'Patuxent Dental & Oral Surgery Group',
    location: 'Bowie, MD',
    tradeCategory: 'Painting & Decorating',
    scopeOfWork: 'Prime and paint 8 treatment rooms, reception lobby, and hallway wainscoting using zero-VOC antimicrobial scrubbable enamel during weekend/evening hours.',
    timing: 'Start within 10 days · 5-day completion window',
    optionalBudget: '$7,500 – $9,200 Fixed Contract Budget',
    requiredSkills: ['Commercial Airless Spraying', 'Zero-VOC Healthcare Coatings', 'Drywall Level-4 Patching', 'COI Insured'],
    createdAt: '4 hours ago'
  },
  {
    id: 'opp_app_electrical',
    kind: 'apprenticeship',
    title: '1st-Year Inside Wireman & Solar Microgrid Apprenticeship (Earn While You Learn)',
    organization: 'Mid-Atlantic IBEW / NECA Joint Training Center',
    location: 'Lanham, MD',
    tradeCategory: 'Electrical & Solar',
    trainingProviderOrEmployer: 'Mid-Atlantic Electrical JATC + 14 Partner Contractors',
    compensation: '$22.50 / hr starting wage + full health & pension from Day 1 (scales to $52/hr Journeyman)',
    schedule: '36 hrs/wk paid jobsite OJT + 1 evening/wk classroom lab',
    trainingStructure: '4-Year NCCER & State Registered Apprenticeship (8,000 OJT hours + 576 classroom hours)',
    entryRequirements: ['High school diploma or GED', 'Pass basic algebra & reading check', 'Valid driver license', 'Reliable transportation'],
    requiredSkills: ['Hand Tool Safety', 'Basic DC/AC Math', 'Conduit Bending Intro'],
    createdAt: '3 days ago'
  },
  {
    id: 'opp_emp_mechanic',
    kind: 'employment',
    title: 'Master Automotive & Light-Duty Diesel Diagnostic Technician',
    organization: 'Capitol Fleet & EV Service Center',
    location: 'Silver Spring, MD',
    tradeCategory: 'Automotive & Diesel',
    payRange: '$95,000 – $128,000 / yr (Guaranteed Base + Flat-Rate Bonus)',
    schedule: 'Mon–Fri · 7:30 AM – 4:30 PM (No Sundays)',
    employmentType: 'Full-time Direct Employment',
    requiredSkills: ['ASE A1–A8', 'OBD-II / CAN-Bus Oscilloscope', 'Brake & Suspension', 'EV High-Voltage Safety'],
    createdAt: '2 days ago'
  }
]

export const INITIAL_TRACKED_SUBMISSIONS: TrackedWorkSubmission[] = [
  {
    id: 'sub_init_1',
    opportunityId: 'opp_emp_carpenter',
    opportunityKind: 'employment',
    opportunityTitle: 'Lead Commercial Finish Carpenter & Millwork Foreman',
    organization: 'Chesapeake Heritage Builders LLC',
    location: 'Laurel / Columbia, MD',
    applicantName: 'Kwesi Asiedu',
    submittedAt: 'Yesterday at 2:15 PM',
    currentStage: 'Interview',
    stageHistory: [
      { stage: 'Submitted', timestamp: 'Yesterday, 2:15 PM', note: 'Application and portfolio submitted.' },
      { stage: 'Under review', timestamp: 'Yesterday, 5:40 PM', note: 'Reviewed by Hiring Superintendent.' },
      { stage: 'Interview', timestamp: 'Today, 9:10 AM', note: 'On-site blueprint walkthrough scheduled for Thursday 10:00 AM.' }
    ],
    proposalOrNote: 'Attached 15-year heavy timber & custom coffered ceiling portfolio with OSHA 30 verification.'
  }
]

// ─── C. COMMUNITIES BUILT AROUND WORK & SHARED NEEDS ───────────────────────────

export type CommunityCategoryType =
  | 'trades_professions'
  | 'location'
  | 'veterans'
  | 'apprentices_learners'
  | 'organizations_franchises'

export interface WorkCommunityItem {
  id: string
  name: string
  categoryType: CommunityCategoryType
  categoryLabel: string
  icon: string
  membersCount: number
  locationOrScope: string
  description: string
  isJoined: boolean
  practicalVideosCount: number
  openOpportunitiesCount: number
  mentorsAvailableCount: number
  recentDiscussionTitle: string
  recentDiscussionAuthor: string
  upcomingEventTitle: string
}

export const INITIAL_WORK_COMMUNITIES: WorkCommunityItem[] = [
  {
    id: 'comm_carpenters_millwork',
    name: 'Master Heavy Timber, Framing & Finish Carpenters',
    categoryType: 'trades_professions',
    categoryLabel: 'Trades & Professions',
    icon: '🔨',
    membersCount: 4820,
    locationOrScope: 'National & Regional Chapters',
    description: 'Structural timber framing, stair building, cabinet installation, jobsite estimating, and practical video teardowns.',
    isJoined: true,
    practicalVideosCount: 18,
    openOpportunitiesCount: 24,
    mentorsAvailableCount: 19,
    recentDiscussionTitle: 'Best moisture meter & acclimating schedule for 5-inch white oak stair treads?',
    recentDiscussionAuthor: 'John Sianaa · Master Finish Carpenter',
    upcomingEventTitle: 'Live Shop Demo: Compound Miter Crown & Scarf Joint Layout (Thu 7 PM)'
  },
  {
    id: 'comm_dmv_contractors_local',
    name: 'Laurel, Baltimore & DMV Local Trades & Small Business Network',
    categoryType: 'location',
    categoryLabel: 'Location & Regional Work',
    icon: '📍',
    membersCount: 2190,
    locationOrScope: 'Maryland · Washington DC · Northern Virginia',
    description: 'Local subcontractor crew sharing, homeowner referrals, permit office updates, and regional commercial project bids.',
    isJoined: true,
    practicalVideosCount: 9,
    openOpportunitiesCount: 31,
    mentorsAvailableCount: 11,
    recentDiscussionTitle: 'Need a licensed MHIC painter for a 3-room Laurel colonial repaint next week',
    recentDiscussionAuthor: 'Marcus Vance · Project Superintendent',
    upcomingEventTitle: 'Laurel & PG County Subcontractor Breakfast & Bid Exchange (Sat 8:30 AM)'
  },
  {
    id: 'comm_veterans_transition',
    name: 'Veterans in Skilled Trades, Cyber & Service Business Ownership',
    categoryType: 'veterans',
    categoryLabel: 'Veterans Network',
    icon: '🎖️',
    membersCount: 3640,
    locationOrScope: 'U.S. Military Veterans & SkillBridge',
    description: 'Civilian career transition, MOS-to-trade credit translation, GI Bill apprenticeship stipends, and VetFran business ownership.',
    isJoined: true,
    practicalVideosCount: 14,
    openOpportunitiesCount: 29,
    mentorsAvailableCount: 34,
    recentDiscussionTitle: 'How I used Navy Seabee construction experience to fast-track my Maryland master license',
    recentDiscussionAuthor: 'Commander Robert Hayes · USNR (Ret.)',
    upcomingEventTitle: 'DoD SkillBridge & VetFran Multi-Unit Franchise Q&A (Tue 6 PM)'
  },
  {
    id: 'comm_apprentices_learners',
    name: 'Apprentices, Trade Learners & First-Year Journeymen',
    categoryType: 'apprentices_learners',
    categoryLabel: 'Apprentices & Learners',
    icon: '🎓',
    membersCount: 5410,
    locationOrScope: 'Entry-Level & Reskilling',
    description: 'Ask mentors questions without judgment, review math & blueprint prep, practice job pricing, and find paid apprenticeships.',
    isJoined: false,
    practicalVideosCount: 27,
    openOpportunitiesCount: 42,
    mentorsAvailableCount: 28,
    recentDiscussionTitle: 'First week on a commercial framing crew—what hand tools should I carry in my belt on Day 1?',
    recentDiscussionAuthor: 'Devon Brooks · 1st-Year Apprentice',
    upcomingEventTitle: 'Mentor Office Hours: Pricing Your First Side Job Without Losing Money (Wed 8 PM)'
  },
  {
    id: 'comm_franchise_orgs',
    name: 'Service Franchise Owners, Multi-Location Operators & Associations',
    categoryType: 'organizations_franchises',
    categoryLabel: 'Organizations & Franchises',
    icon: '🏪',
    membersCount: 1480,
    locationOrScope: 'Authorized Operators & Trade Associations',
    description: 'Multi-territory operations, technician recruiting, local marketing benchmarks, and parent-to-location SOP governance.',
    isJoined: false,
    practicalVideosCount: 11,
    openOpportunitiesCount: 17,
    mentorsAvailableCount: 14,
    recentDiscussionTitle: 'Structuring territory manager incentives across 3 residential painting & restoration locations',
    recentDiscussionAuthor: 'Elena Rostova · Multi-Unit Operator',
    upcomingEventTitle: 'Franchise Location Manager Onboarding & Local Service Dispatch Workshop'
  }
]

// ─── D. BUSINESS PAGES WITH SEPARATE MANAGEMENT WORKSPACE ──────────────────────

export type BusinessPageType =
  | 'independent_business'
  | 'professional_practice'
  | 'franchise_location'
  | 'training_provider'
  | 'association_organization'

export interface FranchiseLocationUnit {
  id: string
  name: string
  territory: string
  managerName: string
  managerEmail: string
  activeServicesCount: number
  openOpportunitiesCount: number
  openInquiriesCount: number
}

export interface ManagedBusinessPage {
  id: string
  name: string
  pageType: BusinessPageType
  pageTypeLabel: string
  tagline: string
  location: string
  servicesOffered: string[]
  workSamplesCount: number
  openOpportunitiesCount: number
  customerInquiriesCount: number
  applicantCount: number
  authorizedTeam: { name: string; role: string; accessLevel: 'Owner' | 'Location Manager' | 'Billing Admin' }[]
  parentOrganizationName?: string
  linkedLocations?: FranchiseLocationUnit[]
  billingPlan: string
}

export const INITIAL_BUSINESS_PAGES: ManagedBusinessPage[] = [
  {
    id: 'biz_expedite_consults',
    name: 'Expedite Consults & Heritage Timber Works',
    pageType: 'independent_business',
    pageTypeLabel: 'Independent Business & Advisory Practice',
    tagline: 'Enterprise Cybersecurity, GovCloud RMF & Master Heavy Timber Craftsmanship',
    location: 'Laurel, MD & Washington, D.C. Metro',
    servicesOffered: [
      'Custom Heavy Timber Framing & Architectural Joinery',
      'Penetration Testing & Autonomous ASPM (05-SAST & Trepath 2.0)',
      'DoD RMF / Continuous ATO Engineering'
    ],
    workSamplesCount: 12,
    openOpportunitiesCount: 3,
    customerInquiriesCount: 4,
    applicantCount: 7,
    authorizedTeam: [
      { name: 'Kwesi Asiedu', role: 'Founder & Principal', accessLevel: 'Owner' },
      { name: 'Rhoda Asiedu', role: 'Operations & Client Intake', accessLevel: 'Location Manager' }
    ],
    billingPlan: 'Standard Business Workspace (No paid upgrade required)',
    linkedLocations: [
      {
        id: 'loc_laurel_hq',
        name: 'Laurel / Baltimore Field Operations',
        territory: 'Central Maryland & I-95 Corridor',
        managerName: 'Kwesi Asiedu',
        managerEmail: 'kwesi@expediteconsults.com',
        activeServicesCount: 3,
        openOpportunitiesCount: 2,
        openInquiriesCount: 3
      },
      {
        id: 'loc_dc_northern_va',
        name: 'Washington D.C. & Northern Virginia Branch',
        territory: 'DC Metro & Fairfax / Arlington',
        managerName: 'David Sterling',
        managerEmail: 'dsterling@expediteconsults.com',
        activeServicesCount: 2,
        openOpportunitiesCount: 1,
        openInquiriesCount: 1
      }
    ]
  }
]

// ─── E. PRACTICAL LEARNING GOALS ───────────────────────────────────────────────

export interface PracticalLearningGoal {
  id: string
  title: string
  subtitle: string
  icon: string
  lessonsCount: number
  relatedOpportunityFilter: string
  sampleLessonTitle: string
  evidenceKind: 'lesson_completion' | 'uploaded_certificate' | 'verified_credential'
}

export const PRACTICAL_LEARNING_GOALS: PracticalLearningGoal[] = [
  {
    id: 'goal_trade_skill',
    title: 'Improve a trade skill',
    subtitle: 'Step-by-step carpentry, electrical, plumbing, auto diagnostics, welding, HVAC & painting video lessons',
    icon: '🛠️',
    lessonsCount: 13,
    relatedOpportunityFilter: 'Carpentry & Joinery',
    sampleLessonTitle: 'Carpentry Basics: Measuring, Marking & Cutting Square (This Old House)',
    evidenceKind: 'lesson_completion'
  },
  {
    id: 'goal_price_quote',
    title: 'Learn to price and quote a job',
    subtitle: 'Calculate materials, labor hours, overhead, and contingency so every quote protects your margin',
    icon: '📋',
    lessonsCount: 6,
    relatedOpportunityFilter: 'contract_project',
    sampleLessonTitle: 'Room-by-Room Painting & Trim Estimating Without Underbidding',
    evidenceKind: 'lesson_completion'
  },
  {
    id: 'goal_interviews',
    title: 'Prepare for interviews & shop tests',
    subtitle: 'Walk through practical foreman questions, blueprint reading checks, and diagnostic bay evaluations',
    icon: '🤝',
    lessonsCount: 5,
    relatedOpportunityFilter: 'employment',
    sampleLessonTitle: 'Passing the Commercial Foreman Blueprint & Safety Walkthrough',
    evidenceKind: 'lesson_completion'
  },
  {
    id: 'goal_start_business',
    title: 'Start or manage a service business',
    subtitle: 'Licensing, COI insurance, customer agreements, draw schedules, and managing multi-crew dispatch',
    icon: '🏪',
    lessonsCount: 7,
    relatedOpportunityFilter: 'contract_project',
    sampleLessonTitle: 'From Solo Tradesperson to Licensed 3-Crew Service Business',
    evidenceKind: 'uploaded_certificate'
  },
  {
    id: 'goal_customer_comms',
    title: 'Build customer communication skills',
    subtitle: 'Write clear scope proposals, handle change orders professionally, and earn repeat homeowner referrals',
    icon: '💬',
    lessonsCount: 4,
    relatedOpportunityFilter: 'contract_project',
    sampleLessonTitle: 'Handling Scope Changes & Homeowner Walkthroughs with Confidence',
    evidenceKind: 'lesson_completion'
  },
  {
    id: 'goal_certification',
    title: 'Prepare for a relevant certification',
    subtitle: 'OSHA 30, ASE Master A1–A8, EPA 608, MHIC Contractor, and CompTIA / OSCP exam readiness',
    icon: '🛡️',
    lessonsCount: 9,
    relatedOpportunityFilter: 'employment',
    sampleLessonTitle: 'OSHA Fall Protection, NEC Grounding & EPA 608 Core Prep',
    evidenceKind: 'verified_credential'
  },
  {
    id: 'goal_mentor_apprenticeship',
    title: 'Find a mentor or apprenticeship',
    subtitle: 'Connect with master tradespeople and enter paid Earn-While-You-Learn apprenticeship programs',
    icon: '🧭',
    lessonsCount: 5,
    relatedOpportunityFilter: 'apprenticeship',
    sampleLessonTitle: 'Apprentice Readiness: First 90 Days on a Commercial Jobsite',
    evidenceKind: 'lesson_completion'
  }
]

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  SERVICES: 'connectln_wb_services_v1',
  INQUIRIES: 'connectln_wb_inquiries_v1',
  OPPORTUNITIES: 'connectln_wb_opportunities_v1',
  SUBMISSIONS: 'connectln_wb_submissions_v1',
  COMMUNITIES: 'connectln_wb_communities_v1',
  BUSINESS_PAGES: 'connectln_wb_biz_pages_v1',
  INTERESTS: 'connectln_wb_interests_v1',
  SAVED_LESSONS: 'connectln_wb_saved_lessons_v1'
}

export function loadWorkBusinessState() {
  if (typeof window === 'undefined') {
    return {
      services: INITIAL_SERVICE_LISTINGS,
      inquiries: INITIAL_SERVICE_INQUIRIES,
      opportunities: INITIAL_WORK_OPPORTUNITIES,
      submissions: INITIAL_TRACKED_SUBMISSIONS,
      communities: INITIAL_WORK_COMMUNITIES,
      businessPages: INITIAL_BUSINESS_PAGES,
      interests: ['find_work', 'offer_services', 'hire_people', 'learn', 'manage_business'] as MemberInterestRole[],
      savedLessons: [
        {
          id: 'lbd_carpentry_1',
          title: 'Carpentry Basics: Measuring, Marking & Cutting Square',
          category: 'Carpentry',
          status: 'Completed',
          evidenceType: 'Lesson completion'
        },
        {
          id: 'lbd_auto_4',
          title: 'Auto Diagnostics: Your First Diagnostic Scan (AutoZone)',
          category: 'Auto Mechanics',
          status: 'In progress (65%)',
          evidenceType: 'Lesson completion'
        }
      ]
    }
  }

  const readJson = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }

  return {
    services: readJson(STORAGE_KEYS.SERVICES, INITIAL_SERVICE_LISTINGS),
    inquiries: readJson(STORAGE_KEYS.INQUIRIES, INITIAL_SERVICE_INQUIRIES),
    opportunities: readJson(STORAGE_KEYS.OPPORTUNITIES, INITIAL_WORK_OPPORTUNITIES),
    submissions: readJson(STORAGE_KEYS.SUBMISSIONS, INITIAL_TRACKED_SUBMISSIONS),
    communities: readJson(STORAGE_KEYS.COMMUNITIES, INITIAL_WORK_COMMUNITIES),
    businessPages: readJson(STORAGE_KEYS.BUSINESS_PAGES, INITIAL_BUSINESS_PAGES),
    interests: readJson<MemberInterestRole[]>(STORAGE_KEYS.INTERESTS, [
      'find_work',
      'offer_services',
      'hire_people',
      'learn',
      'manage_business'
    ]),
    savedLessons: readJson(STORAGE_KEYS.SAVED_LESSONS, [
      {
        id: 'lbd_carpentry_1',
        title: 'Carpentry Basics: Measuring, Marking & Cutting Square',
        category: 'Carpentry',
        status: 'Completed',
        evidenceType: 'Lesson completion'
      },
      {
        id: 'lbd_auto_4',
        title: 'Auto Diagnostics: Your First Diagnostic Scan (AutoZone)',
        category: 'Auto Mechanics',
        status: 'In progress (65%)',
        evidenceType: 'Lesson completion'
      }
    ])
  }
}

export function saveWorkBusinessSlice(key: keyof typeof STORAGE_KEYS, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('connectln-work-business-updated'))
  } catch {
    // ignore storage quota errors
  }
}
