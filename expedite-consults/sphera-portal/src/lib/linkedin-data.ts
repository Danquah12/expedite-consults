export interface UserProfile {
  email?: string
  userId?: string
  role?: string
  roles?: string[]
  profession?: string
  professionId?: string
  professionCategory?: string
  professionEnclave?: string
  id: string
  name: string
  headline: string
  avatar: string
  coverImage: string
  location: string
  connectionsCount: number
  followersCount: number
  profileViews: number
  postImpressions: number
  searchAppearances: number
  profileStrength: number // e.g. 100 for All-Star
  about: string
  openToWork: {
    isOpen: boolean
    roles: string[]
    jobTypes: string[]
    locations: string[]
  }
  featured: {
    id: string
    title: string
    type: 'article' | 'link' | 'post' | 'media'
    description: string
    thumbnail: string
    link?: string
    engagement?: string
  }[]
  experience: {
    id: string
    role: string
    company: string
    companyLogo: string
    employmentType: string
    duration: string
    location: string
    description: string
    skills: string[]
  }[]
  education: {
    id: string
    school: string
    schoolLogo: string
    degree: string
    fieldOfStudy: string
    duration: string
    grade?: string
  }[]
  certifications: {
    id: string
    title: string
    issuer: string
    issuerLogo: string
    issueDate: string
    credentialId: string
    credentialUrl: string
  }[]
  skills: {
    name: string
    endorsements: number
  }[]
  recommendations: {
    id: string
    authorName: string
    authorHeadline: string
    authorAvatar: string
    relationship: string
    date: string
    text: string
    type: 'received' | 'given'
  }[]
}

export type ReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny'

export interface Comment {
  id: string
  author: {
    name: string
    headline: string
    avatar: string
    connectionDegree: '1st' | '2nd' | '3rd' | 'Following' | 'You'
  }
  content: string
  timestamp: string
  likesCount: number
  isLiked?: boolean
  replies?: Comment[]
}

export interface PollData {
  id: string
  question: string
  options: {
    id: string
    text: string
    votes: number
  }[]
  totalVotes: number
  userVotedOptionId?: string | null
  timeRemaining: string
}

export interface DocumentSlide {
  slideNumber: number
  title: string
  content: string
  visualTag?: string
  bgColor?: string
}

export interface EmbeddedProductData {
  id: string
  name: string
  tagline: string
  icon: string
  badge: string
  category: string
  pricing: string
  demoUrl?: string
  docsUrl?: string
  buyUrl?: string
  trialDuration?: string
  description: string
  keyFeatures: string[]
  screenshots?: string[]
  rating?: number
  reviewsCount?: number
}

export interface Post {
  id: string
  professionEnclave?: string
  targetProfessions?: string[]
  author: {
    id: string
    name: string
    headline: string
    avatar: string
    connectionDegree: '1st' | '2nd' | '3rd' | 'You' | 'Following'
    isFollowing?: boolean
  }
  timestamp: string
  visibility: 'Public' | 'Connections'
  content: string
  hashtags?: string[]
  postType?: 'standard' | 'poll' | 'document' | 'celebration' | 'product_announcement'
  feedCategory?: 'for_you' | 'products' | 'research' | 'following'
  feedSubCategory?: string
  embeddedProduct?: EmbeddedProductData
  poll?: PollData
  document?: {
    title: string
    totalPages: number
    slides: DocumentSlide[]
  }
  celebration?: {
    type: 'new_job' | 'anniversary' | 'certificate' | 'project'
    badge: string
    headline: string
  }
  quotedPost?: {
    id: string
    authorName: string
    authorHeadline: string
    authorAvatar: string
    timestamp: string
    content: string
  }
  media?: {
    type: 'image' | 'article' | 'video'
    url: string
    aspectRatio?: string
    title?: string
    domain?: string
    description?: string
    youtubeId?: string
    thumbnailUrl?: string
    duration?: string
    serialPlate?: string
    brandName?: string
    takeaways?: string[]
  }
  stats: {
    likesCount: number
    commentsCount: number
    repostsCount: number
    reactionsBreakdown: {
      like: number
      celebrate: number
      support: number
      love: number
      insightful: number
      funny: number
    }
  }
  userReaction?: ReactionType | null
  isSaved?: boolean
  comments: Comment[]
}

export interface NewsItem {
  id: string
  headline: string
  timeAgo: string
  readersCount: string
  category: string
}

export interface SuggestedConnection {
  id: string
  name: string
  headline: string
  avatar: string
  coverImage?: string
  mutualConnections: number
  mutualName?: string
  capabilities: string[]
  verifiedBadges?: string[]
  circle?: string
  matchScore?: number
  isConnected?: boolean
  isPending?: boolean
}

export interface ConnectedMember {
  id: string
  name: string
  headline: string
  avatar: string
  coverImage?: string
  connectedSince: string
  capabilities: string[]
  verifiedBadges?: string[]
  mutualCount: number
  isOnline?: boolean
  company?: string
  location?: string
  email?: string
}

export interface OutboundInvitation {
  id: string
  name: string
  headline: string
  avatar: string
  sentAt: string
  customNote?: string
  status: 'pending' | 'accepted' | 'withdrawn'
  type?: 'person' | 'email' | 'sms'
  recipient?: string
}

export interface CompanyNetworkItem {
  id: string
  name: string
  tagline: string
  logo: string
  industry: string
  followersCount: string
  capabilities: string[]
  jobOpeningsCount: number
  isFollowing?: boolean
}

export interface OrganizationNetworkItem {
  id: string
  name: string
  tagline: string
  logo: string
  type: 'Federal Agency' | 'Standards Body' | 'Non-Profit Consortium' | 'Defense Entity'
  capabilities: string[]
  membersCount: string
  isFollowing?: boolean
}

export interface ProfessionalCircleItem {
  id: string
  name: string
  icon: string
  description: string
  primaryCapability: string
  membersCount: string
  recentActivity: string
  isJoined?: boolean
}

export interface FollowedTopicItem {
  id: string
  name: string
  hashtag: string
  followersCount: string
  category: string
  isFollowing?: boolean
}

export interface JobItem {
  id: string
  title: string
  company: string
  companyLogo: string
  location: string
  workplaceType: 'Remote' | 'Hybrid' | 'On-site'
  employmentType: 'Full-time' | 'Contract'
  postedTime: string
  applicantsCount: number
  salaryRange?: string
  easyApply: boolean
  isSaved?: boolean
  description: string
  requirements: string[]
  applyUrl?: string
  source?: string
  tags?: string[]
}

export interface MessageThread {
  id: string
  user: {
    name: string
    headline: string
    avatar: string
    status: 'online' | 'offline' | 'away'
  }
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  messages: {
    id: string
    senderId: 'me' | 'other'
    text: string
    timestamp: string
  }[]
}

export interface CourseItem {
  id: string
  title: string
  provider?: 'O\'Reilly' | 'Coursera' | 'Udemy' | 'Pluralsight' | 'ConnectIn Masterclass'
  externalUrl?: string
  instructor: {
    name: string
    role: string
    avatar: string
  }
  thumbnail: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  skillsCovered: string[]
  learnersCount: number
  rating: number
  previewVideoUrl?: string
  description: string
  isEnrolled?: boolean
  certificateEarned?: boolean
}

export interface CatchUpEvent {
  id: string
  person: {
    name: string
    headline: string
    avatar: string
  }
  eventType: 'new_job' | 'anniversary' | 'birthday' | 'promotion'
  details: string
  timeAgo: string
  hasCongratulated?: boolean
}

export interface AnalyticsData {
  weeklyProfileViews: { day: string; views: number }[]
  topViewerCompanies: { name: string; percentage: number; logo: string }[]
  topSearchKeywords: { keyword: string; count: number }[]
  searchOccurrencesCount: number
}

export const currentUser: UserProfile = {
  id: 'user_alex_taylor',
  name: 'Alex Taylor',
  headline: 'Principal Cloud & Security Architect | AI Infrastructure & Zero Trust Lead @ Expedite Consults',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  location: 'Greater New York City Area · Contact info',
  connectionsCount: 842,
  followersCount: 3120,
  profileViews: 1428,
  postImpressions: 9840,
  searchAppearances: 342,
  profileStrength: 100,
  about: `Passionate Technology Leader with 10+ years specializing in Autonomous Defense Loops, Cloud Security Posture Management, Enterprise Zero Trust architecture, and Distributed Multi-Agent Systems.

Proven track record of scaling high-availability Next.js, Kubernetes, and AWS/GCP cloud platforms while securing critical infrastructure. Currently spearheading advanced cybersecurity resilience and digital transformation at Expedite Consults.`,
  openToWork: {
    isOpen: true,
    roles: ['Chief Information Security Officer (CISO)', 'VP of Cloud Infrastructure', 'Principal Solutions Architect'],
    jobTypes: ['Full-time', 'Advisory', 'Contract'],
    locations: ['New York, NY', 'Remote', 'San Francisco, CA']
  },
  featured: [
    {
      id: 'feat_1',
      title: 'Autonomous Cyber Defense Loops: A Formal Multi-Agent Containment Architecture',
      type: 'article',
      description: 'Comprehensive research paper analyzing deterministic containment surfaces in generative agent tool-chains.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      engagement: '1,420 reactions · 94 comments'
    },
    {
      id: 'feat_2',
      title: 'Enterprise Zero Trust Blueprint 2026 (Open Source Slide Deck)',
      type: 'media',
      description: 'A 24-slide technical guide to deploying mutual TLS, ephemeral service tokens, and continuous policy evaluation.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      engagement: '890 downloads'
    }
  ],
  experience: [
    {
      id: 'exp_1',
      role: 'Principal Cloud & Security Architect',
      company: 'Expedite Consults',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Full-time',
      duration: 'Jan 2023 - Present · 2 yrs 8 mos',
      location: 'New York, United States · Hybrid',
      description: 'Architecting resilient defense automation, SOC integration, and secure enterprise cloud foundations for Fortune 500 financial and healthcare partners.',
      skills: ['Cloud Security (CSPM)', 'Next.js / TypeScript', 'Zero Trust', 'Kubernetes', 'AI Defense Loops']
    },
    {
      id: 'exp_2',
      role: 'Senior Enterprise Security Consultant',
      company: 'Sphera Cyber Defense',
      companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Full-time',
      duration: 'May 2020 - Dec 2022 · 2 yrs 8 mos',
      location: 'Boston, MA · Remote',
      description: 'Designed automated threat modeling frameworks and guided C-suite leaders on DevSecOps transformations.',
      skills: ['SOC 2 Compliance', 'Threat Modeling', 'AWS Security', 'Python Automation']
    },
    {
      id: 'exp_3',
      role: 'Cloud Infrastructure Engineer',
      company: 'Nexus Tech Systems',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
      employmentType: 'Full-time',
      duration: 'Aug 2017 - Apr 2020 · 2 yrs 9 mos',
      location: 'Austin, TX',
      description: 'Maintained microservice clusters on AWS EKS and built CI/CD pipelines reducing deployment friction by 70%.',
      skills: ['Docker', 'Terraform', 'CI/CD', 'Linux Kernel']
    }
  ],
  education: [
    {
      id: 'edu_1',
      school: 'Columbia University in the City of New York',
      schoolLogo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&auto=format&fit=crop&q=80',
      degree: 'Master of Science (M.S.)',
      fieldOfStudy: 'Computer Science & Cybersecurity Systems',
      duration: '2015 - 2017',
      grade: '3.9 GPA'
    },
    {
      id: 'edu_2',
      school: 'University of Michigan',
      schoolLogo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=80',
      degree: 'Bachelor of Science (B.S.)',
      fieldOfStudy: 'Software Engineering',
      duration: '2011 - 2015'
    }
  ],
  certifications: [
    {
      id: 'cert_1',
      title: 'Certified Information Systems Security Professional (CISSP)',
      issuer: '(ISC)²',
      issuerLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
      issueDate: 'Issued Mar 2023 · Expires Mar 2029',
      credentialId: 'CISSP-894218',
      credentialUrl: 'https://isc2.org/verify'
    },
    {
      id: 'cert_2',
      title: 'AWS Certified Solutions Architect – Professional (SAP-C02)',
      issuer: 'Amazon Web Services (AWS)',
      issuerLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      issueDate: 'Issued Jan 2024 · Expires Jan 2027',
      credentialId: 'AWS-PSA-90214',
      credentialUrl: 'https://aws.amazon.com/verification'
    }
  ],
  skills: [
    { name: 'Cloud Architecture (AWS / GCP / Azure)', endorsements: 94 },
    { name: 'Zero Trust & Autonomous Cyber Defense', endorsements: 88 },
    { name: 'Next.js, React & TypeScript Ecosystem', endorsements: 76 },
    { name: 'Kubernetes & Container Orchestration', endorsements: 65 },
    { name: 'DevSecOps & Threat Modeling', endorsements: 59 },
    { name: 'AI Multi-Agent Workflow Optimization', endorsements: 48 }
  ],
  recommendations: [
    {
      id: 'rec_1',
      authorName: 'Dr. Elena Rostova',
      authorHeadline: 'Chief AI Research Scientist | Stanford Fellow',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      relationship: 'Elena worked with Alex on joint cybersecurity research initiatives',
      date: 'January 14, 2026',
      text: 'Alex possesses a rare combination of deep security rigor and visionary system architecture. His work on autonomous defense loops is groundbreaking. Any executive leadership team would be fortunate to have him leading security strategy.',
      type: 'received'
    },
    {
      id: 'rec_2',
      authorName: 'Marcus Vance',
      authorHeadline: 'VP of Engineering at CloudScale Global · Ex-AWS',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      relationship: 'Marcus was senior to Alex at Nexus Tech Systems',
      date: 'November 2, 2025',
      text: 'Alex was instrumental in scaling our container microservices with zero downtime during unprecedented traffic spikes. His problem-solving velocity is unmatched.',
      type: 'received'
    }
  ]
}

export const initialPosts: Post[] = [
  // ─── 1. SKILLED TRADES & CRAFTSMANSHIP ENCLAVE (CARPENTER, CONTRACTOR, TRADES) ───
  {
    id: 'post_carpenter_timber_frame',
    professionEnclave: 'trades_construction',
    targetProfessions: ['carpenter', 'general_contractor'],
    author: {
      id: 'author_miller_timber',
      name: 'David Miller',
      headline: 'Master Carpenter · Timber Framing & Architectural Finish Joinery',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '15m ago · 🔨 Timber Craftsmanship · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Craftsmanship',
    content: `🌲 Completed the heavy timber mortise-and-tenon bents for this 6,400 sq.ft. Douglas Fir vaulted pavilion.

Key craftsmanship notes for the framing crew:
• All 10x10 posts and 8x12 principal rafters milled from #1 FOHC (Free of Heart Center) coastal fir, seasoned to sub-14% moisture before cutting.
• Traditional draw-bored mortise & tenon joints secured with 1" white oak octagonal trunnels.
• Tolerances held to sub-1mm using the Festool Domino XL DF 700 mortiser on the compound bracing.
• Structural engineer PE stamped load calculations: 45 PSF snow load and 115 MPH wind uplift envelope.

Blueprints and timber takeoff sheets are now available in the Trades Blueprint Spec Viewer for our subcontractor team. 👇`,
    hashtags: ['#Carpentry', '#TimberFraming', '#Woodworking', '#FinishJoinery', '#Festool', '#Construction'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
      title: 'Vaulted Heavy Timber Douglas Fir Frame',
      description: 'Precision mortise & tenon joinery with draw-bored white oak pegs.'
    },
    stats: {
      likesCount: 384,
      commentsCount: 42,
      repostsCount: 29,
      reactionsBreakdown: { like: 210, celebrate: 95, support: 30, love: 45, insightful: 4, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: [
      {
        id: 'c_carp_1',
        author: {
          name: 'Frank Gallagher',
          headline: 'General Contractor & Construction Superintendent · OSHA 30',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          connectionDegree: '1st'
        },
        content: 'Clean mortise work David. The structural deflection looks rock solid under the live load test. We just scheduled the city framing inspection for Thursday 9 AM.',
        timestamp: '8m ago',
        likesCount: 16
      }
    ]
  },
  {
    id: 'post_general_contractor_rfp',
    professionEnclave: 'trades_construction',
    targetProfessions: ['general_contractor', 'carpenter', 'electrician', 'plumber'],
    author: {
      id: 'author_frank_gc',
      name: 'Frank Gallagher',
      headline: 'Licensed General Contractor · Commercial Buildouts & Subcontractor PM',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '40m ago · 📋 Subcontractor RFP Open · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Subcontractor Bids',
    content: `📋 [Subcontractor RFP Open] Phase 2 Framing, Mechanical & Electrical Buildout — Baltimore Commercial Tech Center ($285,000 Escrow).

We are accepting sealed subcontractor bids for:
1. Rough-in framing & structural fire-blocking (24,000 board feet 2x6 SPF).
2. 480V 3-phase industrial power distribution & conduit rough-ins.
3. Commercial hydronic supply & backflow certification.

Requirements:
✓ Active Maryland trade license & verified ConnectIn Trade ID
✓ OSHA 30 supervisor on site + 100% fall protection compliance
✓ Escrow funded milestone progress draws with unconditional lien releases.

Submit bids directly through the ConnectIn Subcontractor Board.`,
    hashtags: ['#Construction', '#SubcontractorBids', '#GeneralContractor', '#Framing', '#OSHAGuidelines'],
    stats: {
      likesCount: 198,
      commentsCount: 31,
      repostsCount: 18,
      reactionsBreakdown: { like: 110, celebrate: 40, support: 28, love: 12, insightful: 8, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_electrician_nec',
    professionEnclave: 'trades_construction',
    targetProfessions: ['electrician'],
    author: {
      id: 'author_sarah_spark',
      name: 'Sarah Jenkins',
      headline: 'Licensed Master Electrician · High-Voltage Distribution & Industrial Automation',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      connectionDegree: '2nd'
    },
    timestamp: '2h ago · ⚡ NEC Code Compliance · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Code Compliance',
    content: `⚡ NEC 2026 update on commercial arc-flash boundary calculations (NFPA 70E):

When commissioning 480V/277V switchgear with available fault currents exceeding 65kA, remember that instantaneous trip settings on upstream electronic trip units directly govern the incident energy (cal/cm²).

Calibrated the single-line protection coordinates today — lowered incident energy from 18.2 cal/cm² to 3.4 cal/cm² (Category 2 PPE), saving both lives and downtime. Always verify with calibrated secondary injection test sets!`,
    hashtags: ['#Electrician', '#NEC2026', '#ArcFlash', '#HighVoltage', '#TradeTools'],
    stats: {
      likesCount: 154,
      commentsCount: 22,
      repostsCount: 14,
      reactionsBreakdown: { like: 92, celebrate: 24, support: 18, love: 8, insightful: 12, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },
  {
    id: 'post_finish_carpenter_crown',
    professionEnclave: 'trades_construction',
    targetProfessions: ['finish_carpenter', 'cabinetmaker', 'carpenter'],
    author: {
      id: 'author_lindqvist_trim',
      name: 'Erik Lindqvist',
      headline: 'Master Finish Carpenter · Custom Curved Handrails & Coffered Ceilings',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '1h ago · 📐 Compound Miter & Joinery · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Finish Trim',
    content: `📐 7-inch solid black walnut crown molding installed across an out-of-square 88.5° vaulted ceiling.

A reminder for the trim crew: when ceiling angles stray from 90°, cutting crown flat on the compound miter requires calculating both spring angle and the true wall corner bisector:
• True corner angle: 88.5° (miter angle = 34.2°, bevel = 30.6° on the Festool Kapex KS 120).
• All inside corners coped by hand using a coping saw with #15 teeth blade for zero gap expansion under seasonal humidity shifts.
• Back-cut relieved at 5° to guarantee hairline surface touch.

Zero caulking, 100% mechanical coped precision. Timber and millwork specifications logged in the Trades Blueprint Locker. 👇`,
    hashtags: ['#FinishCarpentry', '#CustomMillwork', '#CrownMolding', '#CopedJoints', '#Festool', '#Woodworking'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=1200&auto=format&fit=crop&q=80',
      title: 'Solid Black Walnut Coped Crown Joinery',
      description: 'Hand-coped interior joints cut with zero caulking tolerance.'
    },
    stats: {
      likesCount: 278,
      commentsCount: 39,
      repostsCount: 22,
      reactionsBreakdown: { like: 160, celebrate: 68, support: 24, love: 22, insightful: 4, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },

  // ─── 2. AUTOMOTIVE & HEAVY FLEET DIAGNOSTICS ENCLAVE ───
  {
    id: 'post_auto_can_waveform',
    professionEnclave: 'automotive_mechanics',
    targetProfessions: ['ase_master_auto_tech', 'heavy_diesel_mechanic', 'ev_powertrain_technician'],
    author: {
      id: 'author_marcus_auto',
      name: 'Marcus Miller, ASE Master Tech',
      headline: 'World Class Master Diagnostic Tech (L1/L2/L3) · 800V EV & CAN-FD Scope Lead',
      avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '25m ago · 📟 Oscilloscope Waveform Analysis · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'CAN-Bus Diagnostics',
    content: `⚡ Case Study: Phantom U0100 (Lost Comms with ECM) & Limp Mode on a 2024 Duramax 6.6L Diesel.

Two previous shops had replaced the accelerator pedal assembly and ECM. The vehicle would die only after 45 minutes of road operation at operating temperature.

Diagnostic breakdown with PicoScope 4425A:
1. Hooked Channel A to CAN-High (Pin 6) and Channel B to CAN-Low (Pin 14) at the DLC gateway.
2. Under cold idle: perfect differential square wave (2.5V recessive baseline, 3.5V CAN-H, 1.5V CAN-L).
3. At 195°F trans temp, thermal expansion opened a hairline crack across the 120-ohm terminating resistor inside the rear chassis control module.
4. Total bus resistance jumped from 60 ohms to 120 ohms, causing reflection ringing that corrupted high-priority torque arbitration packets.

Replaced terminating module and verified clean 60.1-ohm total circuit resistance. Scope capture and diagnostic pinout shared in the Snap-on Hub! 👇`,
    hashtags: ['#AutoMechanic', '#CANBus', '#PicoScope', '#ASEMaster', '#DieselDiagnostics', '#SnapOn'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80',
      title: 'PicoScope 4-Channel CAN-FD Differential Signal',
      description: 'Waveform showing transmission bus arbitration reflection.'
    },
    stats: {
      likesCount: 395,
      commentsCount: 54,
      repostsCount: 48,
      reactionsBreakdown: { like: 215, celebrate: 110, support: 35, love: 20, insightful: 15, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_auto_ev_inverter',
    professionEnclave: 'automotive_mechanics',
    targetProfessions: ['ev_powertrain_technician', 'ase_master_auto_tech'],
    author: {
      id: 'author_tyler_ev',
      name: 'Tyler Davis',
      headline: 'High-Voltage 800V EV Powertrain Lead · NFPA 70E Safety Certified',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '2nd'
    },
    timestamp: '1h ago · 🔋 800V EV High-Voltage Bay · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'EV Powertrain',
    content: `🔋 Teardown of an 800V Silicon Carbide (SiC) dual-motor traction inverter throwing isolation fault DTC P0AA6.

Safety protocol first:
• Class 0 (1000V rated) rubber insulating gloves inspected and air-tested before touching the high-voltage disconnect.
• Manual service disconnect pulled and locked with personal LOTO hasp.
• Fluke 1587 FC insulation tester verified sub-50V zero energy state across the DC busbar capacitor banks.

Root cause: Coolant seal erosion permitted ethylene glycol mist to cross the gate driver printed circuit board, dropping isolation resistance to 180 kOhms (OEM minimum is 500 kOhms). 

Cleaned, ultrasonic dried, resealed with fluorosilicone gasket, and retested at 1,000V DC — isolation restored to >2.4 GOhms. Always respect high voltage!`,
    hashtags: ['#ElectricVehicles', '#800V', '#NFPA70E', '#EVMiniMechanic', '#HighVoltage', '#ASEL3'],
    stats: {
      likesCount: 312,
      commentsCount: 41,
      repostsCount: 36,
      reactionsBreakdown: { like: 180, celebrate: 72, support: 30, love: 18, insightful: 12, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 3. CLINICAL HEALTHCARE, TRAUMA SURGERY & NURSING ENCLAVE ───
  {
    id: 'post_nurse_trauma_mtp',
    professionEnclave: 'healthcare_medicine',
    targetProfessions: ['er_trauma_nurse', 'registered_nurse', 'physician', 'orthopedic_trauma_surgeon'],
    author: {
      id: 'author_elena_nurse',
      name: 'Elena Rostova, RN, CCRN, TNCC',
      headline: 'Emergency Trauma Resuscitation Nurse Lead · Level 1 Trauma Center',
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '18m ago · 🩺 Level 1 Trauma Resuscitation · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Trauma Nursing',
    content: `🩺 Massive Transfusion Protocol (MTP) execution review from last night’s multi-vehicle roll-over trauma activation (ESI Level 1).

Patient arrived in severe hemorrhagic shock: GCS 7, SBP 62, HR 148, cold extremities, and severe pelvic instability.

Resuscitation Milestones:
1. Bedside ultrasound-guided dual 14G peripheral IV access secured in under 90 seconds.
2. Blood bank dispatched Cooler 1: balanced 1:1:1 ratio (4 Units PRBC, 4 Units FFP, 1 Pack Platelets).
3. Infused via dual Belmont rapid blood warmers at 400 mL/min with inline temperature maintained at 38.5°C to combat the lethal triad of hypothermia, acidosis, and coagulopathy.
4. Calcium gluconate administered concurrently (1g per 4 units PRBC) to counter citrate toxicity.
5. Patient stabilized (MAP > 65, Lactate cleared from 8.4 to 3.1) and transferred to trauma OR within 22 minutes for pelvic embolization.

Huge praise to our trauma nursing and surgical team. Rapid vascular access and balanced ratios save lives.`,
    hashtags: ['#TraumaNursing', '#CCRN', '#TNCC', '#EmergencyMedicine', '#MTP', '#CriticalCare'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80',
      title: 'Level 1 Trauma Resuscitation Bay',
      description: 'Rapid Belmont infusers and continuous hemodynamic telemetry.'
    },
    stats: {
      likesCount: 512,
      commentsCount: 68,
      repostsCount: 74,
      reactionsBreakdown: { like: 280, celebrate: 130, support: 54, love: 38, insightful: 10, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_surgeon_ortho_orif',
    professionEnclave: 'healthcare_medicine',
    targetProfessions: ['orthopedic_trauma_surgeon', 'physician', 'er_trauma_nurse'],
    author: {
      id: 'author_angela_vance',
      name: 'Dr. Angela Vance, MD, FACS',
      headline: 'Attending Orthopedic Trauma Surgeon · Chief of Pelvic & Articular Reconstruction',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '45m ago · 🔪 Orthopedic Trauma Surgery · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Surgical Rounds',
    content: `🔪 Intraoperative Case Review: Open Reduction & Internal Fixation (ORIF) of a High-Energy Schatzker VI Tibial Plateau Fracture with Metaphyseal Dissociation.

Surgical Approach:
• Dual incisions: Anterolateral approach with submeniscal arthrotomy to inspect lateral plateau depression, combined with a posteromedial incision to reduce the coronal split fragment.
• Articular surface elevated under direct visualization and supported with subchondral allograft calcium phosphate bone substitute.
• Fixed with dual low-profile anatomical 3.5mm titanium locking plates to neutralize both varus/valgus collapse and axial shear.
• Intraoperative 3D fluoroscopic scan confirmed articular step-off reduced to <1mm and perfect joint alignment restored.

Patient begins immediate continuous passive motion (CPM) with touchdown weight-bearing. Complete surgical operative report and deidentified DICOM series logged in the Clinical Rounds Enclave.`,
    hashtags: ['#OrthopedicSurgery', '#TraumaSurgeon', '#ORIF', '#SchatzkerVI', '#FACS', '#SurgicalRounds'],
    stats: {
      likesCount: 428,
      commentsCount: 52,
      repostsCount: 61,
      reactionsBreakdown: { like: 230, celebrate: 110, support: 42, love: 34, insightful: 12, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_physician_clinical_trial',
    professionEnclave: 'healthcare_medicine',
    targetProfessions: ['physician', 'registered_nurse', 'pharmacist'],
    author: {
      id: 'author_dr_thorne',
      name: 'Dr. Aris Thorne, MD',
      headline: 'Attending Interventional Cardiologist · Clinical Research & Evidence Therapeutics',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '1h ago · 🩺 Clinical Case Review · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Clinical Research',
    content: `🩺 [Clinical Trial Findings] Phase III Transcatheter Hemodynamic Evaluation in Calcified Aortic Stenosis.

Our cardiology service evaluated 30-day post-TAVR telemetry in 140 high-risk patients. Key findings:
• Mean transvalvular gradient reduced from 48 mmHg to 8.2 mmHg (p < 0.001).
• Zero 30-day paravalvular leaks > mild with self-expanding nitinol frames.
• Continuous remote rhythm monitoring identified sub-clinical atrial fibrillation in 6.4% of asymptomatic patients, prompting immediate anticoagulation.

Full HIPAA-deidentified hemodynamic datasets and peer review discussion are available in our clinical case rounds.`,
    hashtags: ['#Healthcare', '#Medicine', '#Cardiology', '#ClinicalTrials', '#HIPAACompliance'],
    stats: {
      likesCount: 290,
      commentsCount: 38,
      repostsCount: 45,
      reactionsBreakdown: { like: 140, celebrate: 60, support: 35, love: 30, insightful: 25, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4. DEEP OFFENSIVE & OPERATIONAL CYBERSECURITY ENCLAVE ───
  {
    id: 'post_redteam_indirect_syscalls',
    professionEnclave: 'tech_cybersecurity',
    targetProfessions: ['red_team_lead', 'malware_reverse_engineer', 'soc_threat_hunter'],
    author: {
      id: 'author_tariq_redteam',
      name: 'Tariq Al-Mansoor, OSCP/CRTO',
      headline: 'Principal Red Team Operator · Adversary Emulation & Exploit Development',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '12m ago · 🎯 Offensive Cyber TTPs · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Red Teaming',
    content: `🎯 [Adversary Emulation Technical Brief] Evading Userland EDR API Call-Stack Heuristics via Fresh Indirect Syscalls & HalosGate.

Modern EDR agents (CrowdStrike, Defender for Endpoint) monitor synthetic call stacks looking for syscall instructions executing from unbacked heap or RWX memory segments outside ntdll.dll.

Our offensive engineering team developed an evasion stub that:
1. Locates clean Syscall Service Numbers (SSNs) dynamically from disk-mapped \\KnownDlls\\ntdll.dll (bypassing in-memory byte hooks).
2. Sets up RCX, RDX, R8, R9 registers in our payload.
3. Jumps to a legitimate 'syscall; ret' opcode gadget located *inside* the clean export address space of ntdll.
4. Generates an authentic, unwound stack frame that validates perfectly against kernel ETW-TI telemetry.

Result: NtAllocateVirtualMemory and NtCreateThreadEx executed with zero detections across top-tier enterprise sensors.

Deobfuscated C assembly stubs and defensive sigma detection rules are logged in the OSCP/CRTO Guild Vault. 👇`,
    hashtags: ['#RedTeaming', '#EDREvasion', '#IndirectSyscalls', '#OSCP', '#CRTO', '#MalwareAnalysis'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      title: 'Disassembled ntdll.dll Indirect Syscall Gadget',
      description: 'Stack unwinding verification showing legitimate ntdll return pointers.'
    },
    stats: {
      likesCount: 684,
      commentsCount: 92,
      repostsCount: 114,
      reactionsBreakdown: { like: 360, celebrate: 180, support: 44, love: 40, insightful: 60, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_scada_ics_defense',
    professionEnclave: 'tech_cybersecurity',
    targetProfessions: ['scada_ics_engineer', 'soc_threat_hunter'],
    author: {
      id: 'author_james_scada',
      name: 'James Kowalski, CISSP, GICSP',
      headline: 'SCADA / ICS OT Critical Infrastructure Security Lead · Purdue Model Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '50m ago · 🏭 SCADA / OT Defense · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'SCADA / ICS Defense',
    content: `🏭 [Critical Infrastructure Advisory] Hardening Substation Modbus TCP & DNP3 Protocols against Unauthorized PLC Ladder Logic Overwrites.

In Purdue Model Level 2 and Level 3 supervisory networks, standard Modbus TCP lacks native authentication. Function Code 0x05 (Write Single Coil) and Function Code 0x10 (Write Multiple Registers) can directly alter turbine generator speed thresholds or trip circuit breakers.

Mitigations implemented across 12 electrical distribution substations:
1. Deployed inline OT DPI (Deep Packet Inspection) hardware firewalls enforcing strict whitelisting of Function Code 0x03 (Read Holding Registers) from HMI servers only.
2. Programmed physical hardware key switches on Siemens S7-1500 and Allen-Bradley ControlLogix PLCs to 'RUN' mode, mechanically disallowing remote logic uploads.
3. Configured Zeek OT parsers to alert on any non-standard unit IDs or unexpected TCP port 502 connection attempts.

Zero downtime recorded over 180 days with full CIP-005/007 compliance. OT packet capture rules posted in the SCADA Enclave.`,
    hashtags: ['#SCADA', '#ICSOpTech', '#CriticalInfrastructure', '#GICSP', '#Modbus', '#PurdueModel'],
    stats: {
      likesCount: 442,
      commentsCount: 61,
      repostsCount: 52,
      reactionsBreakdown: { like: 260, celebrate: 84, support: 38, love: 22, insightful: 38, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },

  // ─── 3. LEGAL & DEFENSE ENCLAVE ───
  {
    id: 'post_defense_cmmc',
    professionEnclave: 'law_gov_defense',
    targetProfessions: ['corporate_attorney', 'defense_analyst'],
    author: {
      id: 'author_victoria_defense',
      name: 'Victoria Sterling, JD',
      headline: 'Partner / Senior Defense Counsel · CMMC 2.0 Level 3 & FedRAMP High Regulatory Lead',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '55m ago · ⚖️ Regulatory Defense Brief · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'CMMC Compliance',
    content: `⚖️ [Defense Industrial Base Advisory] The Final CMMC 2.0 Rule (32 CFR Part 170) is now live across DoD acquisitions.

Every defense prime and subcontractor handling Controlled Unclassified Information (CUI) must now have DIBCAC third-party assessments (C3PAO) certified for Level 2 and Level 3 contracts.

Crucial counsel points:
1. DFARS 252.204-7012 mandates rapid 72-hour cyber incident reporting to DIBNet.
2. Cloud service providers must meet FedRAMP Moderate or High equivalency with continuous OSCAL telemetry.
3. Liability indemnification clauses across supplier subcontracts must be renegotiated before Q4 SAM.gov RFP awards.`,
    hashtags: ['#GovCloud', '#DefenseIntelligence', '#CMMC', '#LegalCompliance', '#NationalSecurity'],
    stats: {
      likesCount: 312,
      commentsCount: 49,
      repostsCount: 62,
      reactionsBreakdown: { like: 170, celebrate: 40, support: 22, love: 20, insightful: 60, funny: 0 }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },

  // ─── 4. FINANCE & ACCOUNTING ENCLAVE ───
  {
    id: 'post_cpa_gaap_asc606',
    professionEnclave: 'finance_accounting',
    targetProfessions: ['cpa_accountant', 'investment_banker'],
    author: {
      id: 'author_julian_cpa',
      name: 'Julian Hayes, CPA',
      headline: 'Corporate Financial Controller · GAAP Audits, Valuation & Tax Strategy',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '1h ago · 📊 GAAP Technical Memo · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'GAAP Audits',
    content: `📊 [Accounting Advisory] ASC 606 Revenue Recognition on Bundled Multi-Element SaaS & Professional Service Contracts.

When software licenses are bundled with implementation services and ongoing SLA maintenance, determine whether the implementation represents a distinct performance obligation under Step 2 of the 5-step model.

Key audit checklist for the upcoming quarterly close:
• Standalone Selling Price (SSP) allocation using the adjusted market assessment approach.
• Deferred revenue balance rollforwards reconciled against automated ERP billing streams.
• Capitalization of contract acquisition costs (ASC 340-40) with amortized matching.

The automated GAAP Ledger Reconciler spreadsheet model is now shared in the Finance Enclave.`,
    hashtags: ['#Finance', '#Accounting', '#CPA', '#GAAP', '#Valuation', '#RevenueRecognition'],
    stats: {
      likesCount: 224,
      commentsCount: 33,
      repostsCount: 28,
      reactionsBreakdown: { like: 120, celebrate: 34, support: 20, love: 18, insightful: 32, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4b. AGRICULTURE & NATURAL RESOURCES ENCLAVE ───
  {
    id: 'post_ag_precision_farming_soil',
    professionEnclave: 'agriculture_natural_resources',
    targetProfessions: ['farmer', 'beekeeper', 'livestock_breeder', 'agricultural_worker'],
    author: {
      id: 'author_clayton_ag',
      name: 'Clayton Vance',
      headline: '4th Generation Precision Agronomist & Apiary Operations Specialist',
      avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '2h ago · 🌱 Precision Ag & Apiary Report · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Precision Farming',
    content: `🌱 Field update from our 1,200-acre corn & soybean test parcel + 60-hive commercial apiary.

We just completed soil sensor IoT calibration across Zones 1 through 4. Incorporating sub-surface moisture capacitance probes alongside satellite NDVI imagery reduced our scheduled nitrogen runoffs by 22% while boosting pollinator vitality across our honey frames.

Essential takeaways for regenerative growers:
• Varroa mite IPM threshold: Monthly alcohol wash counts remained strictly below 1% using formic acid flash treatments.
• Soil microbiome respiration tests showed a 34% increase in organic active carbon beneath no-till winter rye covers.
• Live Chicago Board of Trade (CBOT) grain futures hedge locked in at $4.85/bushel basis.

Feel free to download our raw soil telemetry and apiary health logbook directly in the Ag Enclave!`,
    hashtags: ['#PrecisionAg', '#RegenerativeFarming', '#Beekeeping', '#SoilHealth', '#Agriculture'],
    stats: {
      likesCount: 284,
      commentsCount: 41,
      repostsCount: 36,
      reactionsBreakdown: { like: 160, celebrate: 48, support: 32, love: 24, insightful: 20, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4c. PERSONAL SERVICES, BEAUTY & WELLNESS ENCLAVE ───
  {
    id: 'post_barber_wellness_technique',
    professionEnclave: 'personal_services_wellness',
    targetProfessions: ['barber', 'hairstylist', 'personal_trainer', 'beautician'],
    author: {
      id: 'author_dante_barber',
      name: 'Dante Rivera',
      headline: 'Master Barber Educator & NSCA Certified Strength & Conditioning Specialist',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '3h ago · ✂️ Master Grooming & Biomechanics · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Professional Grooming',
    content: `✂️ Ergonomics behind the chair & client retention metrics for boutique studios.

After analyzing 250+ haircut appointments and personalized fitness client assessments this month, two critical habits stand out:

1. Scissor & Clipper Wrist Neutrality: Reducing wrist extension through offset crane shear designs eliminated repetitive strain injury (RSI) across 8 team stylists.
2. Form-first progressive overload: In personal training sessions, prioritizing posterior chain stability before loaded spinal squats improved client compliance and decreased lower-back complaints to zero.
3. Client booking frequency: Text-based automated 3-week rebooking prompts boosted recurring chair revenue by 28%.

Access the complete client formula chart and 1RM calculation sheets in the Personal Services Command Center.`,
    hashtags: ['#BarberLife', '#Hairstyling', '#PersonalTraining', '#Biomechanics', '#Wellness'],
    stats: {
      likesCount: 312,
      commentsCount: 52,
      repostsCount: 29,
      reactionsBreakdown: { like: 190, celebrate: 50, support: 34, love: 26, insightful: 12, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4d. CULINARY, HOSPITALITY & EVENTS ENCLAVE ───
  {
    id: 'post_culinary_catering_haccp',
    professionEnclave: 'culinary_hospitality_events',
    targetProfessions: ['caterer', 'event_planner', 'restaurant_server', 'hospitality_worker'],
    author: {
      id: 'author_chef_camille',
      name: 'Chef Camille Dubois',
      headline: 'Executive Catering Director · Large-Scale Event Logistics & HACCP Food Safety',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '4h ago · 🍷 Banquet Operations & Cold Chain · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Catering Operations',
    content: `🍷 Coordinating a 650-guest plated wedding gala: Cold-chain integrity from commissary to plating line.

Executing simultaneous multi-course service under tight timelines requires zero room for temperature drift:
• HACCP Critical Control Point 2: Hot holding above 142°F verified via wireless probe telemetry across 8 Cambro transport carts.
• Food costing & portion yield: Prime protein yield hit 94.6% using precision sous-vide batch searing.
• Front-of-House synchronization: Server table captain briefings reduced kitchen plate turnaround from 14 minutes to 6.5 minutes.

Full Banquet Event Order (BEO) template and portion yield matrix available in the Hospitality Enclave.`,
    hashtags: ['#CateringLogistics', '#ExecutiveChef', '#EventPlanning', '#HACCP', '#Hospitality'],
    stats: {
      likesCount: 245,
      commentsCount: 38,
      repostsCount: 22,
      reactionsBreakdown: { like: 140, celebrate: 42, support: 28, love: 20, insightful: 15, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4e. COMMERCE, RETAIL & SMALL BUSINESS ENCLAVE ───
  {
    id: 'post_commerce_realtor_commercial',
    professionEnclave: 'commerce_small_business',
    targetProfessions: ['realtor', 'small_shop_owner', 'independent_consultant', 'market_trader'],
    author: {
      id: 'author_realtor_marcus',
      name: 'Marcus Sterling',
      headline: 'Principal Broker (CCIM, NAR) · Commercial Real Estate & Retail Portfolio Advisory',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '5h ago · 🏡 Commercial Real Estate & Cap Rates · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Commercial Real Estate',
    content: `🏡 Market Analysis: Cap Rate compression & retail tenant lease structuring in mixed-use developments.

With Q3 transaction volume rising across neighborhood boutique storefronts and medical office plazas:
• Weighted Average Lease Term (WALT) has rebounded to 7.4 years for credit-worthy commercial tenants.
• Net Operating Income (NOI) stress-testing indicates triple-net (NNN) leases are outperforming gross modified leases by 180 basis points amidst fluctuating utility overhead.
• MLS property syndication: 1031 Exchange buyer demand is prioritizing high-walkability urban retail over suburban strip centers.

Run our updated Cap Rate & NOI Sensitivity Spreadsheet in the Commerce Workspace!`,
    hashtags: ['#RealEstate', '#Realtor', '#CommercialRealEstate', '#CapRates', '#SmallBusiness', '#Retail'],
    stats: {
      likesCount: 350,
      commentsCount: 64,
      repostsCount: 47,
      reactionsBreakdown: { like: 210, celebrate: 62, support: 34, love: 24, insightful: 20, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4f. CREATIVE ARTS, MEDIA & ENTERTAINMENT ENCLAVE ───
  {
    id: 'post_creative_audio_mixing_atmos',
    professionEnclave: 'creative_media_arts',
    targetProfessions: ['musician', 'photographer', 'content_creator', 'graphic_designer', 'filmmaker'],
    author: {
      id: 'author_creative_maya',
      name: 'Maya Lin',
      headline: 'Grammy-Nominated Audio Engineer & Documentary Cinematographer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '6h ago · 🎧 Spatial Audio & Film Scoring · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Audio Engineering',
    content: `🎧 Delivering our latest documentary soundtrack in Dolby Atmos 7.1.4: Dynamic binaural rendering notes.

Mixing spatial audio for streaming platforms requires careful management of the binaural render metadata:
• Center channel anchor: Dialogue remains locked at 79 dBC Leq(m) to prevent spatial masking during heavy orchestral swelling.
• Bed vs. Object allocation: Sub-bass LFE elements are restricted to bed tracks to avoid phase cancellation on consumer headphone renders.
• Color grade grading workflow: Synchronized ARRI LogC4 RAW color pipeline ensured seamless delivery for both IMAX and OLED screenings.

Stem packs, LUT color profiles, and ASCAP/BMI sync licensing templates are available in the Creative Hub.`,
    hashtags: ['#AudioEngineering', '#MusicProduction', '#DolbyAtmos', '#Cinematography', '#FilmScoring'],
    stats: {
      likesCount: 298,
      commentsCount: 44,
      repostsCount: 38,
      reactionsBreakdown: { like: 175, celebrate: 52, support: 30, love: 25, insightful: 16, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4g. EDUCATION, TRAINING & WORKFORCE DEVELOPMENT ENCLAVE ───
  {
    id: 'post_education_tutor_curriculum',
    professionEnclave: 'education_workforce',
    targetProfessions: ['tutor', 'vocational_trainer', 'apprentice', 'trade_school_student'],
    author: {
      id: 'author_prof_adams',
      name: 'Dr. Leonard Adams',
      headline: 'Director of Workforce Apprenticeships & STEM Educational Diagnostic Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '7h ago · 📚 Vocational Education & Diagnostic Rubrics · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Vocational Training',
    content: `📚 Bridging trade school apprenticeships and STEM degree pathways: Results from our 2026 cohort.

Over 180 apprentices completed their initial 2,000 On-the-Job Training (OJT) hours across electrical, carpentry, and mechatronics sectors this semester:
• Diagnostic pre-tests vs. midterms: Scaffolded problem-solving rubrics boosted blueprint reading accuracy by 41%.
• High school to trade transition: 96% placement rate within certified union and merit contractors within 30 days of program completion.
• Tutoring diagnostic tools: Individualized SAT/ACT math prep modules improved scores by an average of 190 points.

Curriculum lesson plans, OJT logbooks, and DoL apprenticeship certification guides are live in the Education Enclave.`,
    hashtags: ['#WorkforceDevelopment', '#VocationalTraining', '#Apprenticeship', '#STEM', '#Tutoring'],
    stats: {
      likesCount: 340,
      commentsCount: 49,
      repostsCount: 42,
      reactionsBreakdown: { like: 200, celebrate: 68, support: 36, love: 22, insightful: 14, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 4h. COMMUNITY, CIVIC & SECURITY ENCLAVE ───
  {
    id: 'post_community_veteran_transition',
    professionEnclave: 'community_civic_security',
    targetProfessions: ['military_veteran', 'security_guard', 'community_organizer', 'volunteer'],
    author: {
      id: 'author_sgt_miller',
      name: 'First Sergeant (Ret.) Kenneth Miller',
      headline: 'Military Veteran Transition Director & Physical Security Lead (CPP, PSP)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '8h ago · 🎖️ Veteran Leadership & Asset Protection · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'for_you',
    feedSubCategory: 'Veteran Leadership',
    content: `🎖️ Translating military command and defense operations into corporate physical security and civic leadership.

Veterans possess unmatched operational discipline under pressure. In our corporate security audit across 14 distribution centers:
• Defense-in-Depth access controls: Layered perimeter biometric badging and CCTV thermal tripwires stopped 100% of simulated intrusion breaches.
• DoD SkillBridge & Veteran Mentorship: Placed 48 transitioning service members into supervisory asset protection and emergency response positions.
• 501(c)(3) civic outreach: Coordinated food distribution logistics serving over 3,200 local families in partnership with veteran volunteers.

Access our VA SkillBridge transition checklist and physical security threat assessment matrix in the Civic Enclave.`,
    hashtags: ['#Veterans', '#MilitaryTransition', '#PhysicalSecurity', '#AssetProtection', '#CommunityService'],
    stats: {
      likesCount: 420,
      commentsCount: 67,
      repostsCount: 58,
      reactionsBreakdown: { like: 240, celebrate: 85, support: 45, love: 35, insightful: 15, funny: 0 }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  },

  // ─── 5. SOFTWARE ENGINEERING & CYBER DEFENSE ENCLAVE (ORIGINAL SUITE) ───
  {
    id: 'post_product_strike',
    professionEnclave: 'tech_software',
    targetProfessions: ['software_engineer', 'cloud_architect', 'cybersecurity_analyst'],
    author: {
      id: 'author_expedite',
      name: 'Expedite Consults Product Lab',
      headline: 'Autonomous Cyber Defense & AI AppSec Engineering',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '20m ago · 🚀 Product Launch · 🌐',
    visibility: 'Public',
    postType: 'product_announcement',
    feedCategory: 'products',
    feedSubCategory: 'Launches',
    content: `🚀 We just released our new AI-powered cloud security & offensive AppSec platform: Expedite Strike & Fusion 2026!

Tired of fragmented scanners and 500-page alert noise? Expedite Strike combines autonomous pentesting, hybrid scanning (Fusion™), AI-BOM analysis, Checkmarx MCP servers, and XM Cyber choke point attack graphs into one continuous defense hub.

Explore the capabilities below — view docs, try an interactive demo, or start a free enterprise trial in 1 click! 👇`,
    hashtags: ['#ProductLaunch', '#AppSec', '#CyberSecurity', '#AI', '#CloudSecurity'],
    embeddedProduct: {
      id: 'prod_strike_fusion',
      name: 'Expedite Strike & Fusion 2026',
      tagline: 'Autonomous Pentest, ASPM & Hybrid AI AppSec Platform',
      icon: '⚡',
      badge: '⚡ Flagship AppSec',
      category: 'Cybersecurity & SaaS',
      pricing: '$499 / mo · 14-Day Free Trial',
      demoUrl: 'http://localhost:9012/',
      docsUrl: 'https://portal.expediteconsults.com',
      buyUrl: 'https://portal.expediteconsults.com',
      trialDuration: '14-Day Free Trial',
      description: 'Enterprise offensive security suite with hybrid scanning, AI-BOM LLM scanner, Checkmarx MCP server, Triage auto-PR assist, and 10-section board PDF dossiers.',
      keyFeatures: [
        'Autonomous Multi-Target Asset Discovery',
        'AI-BOM & LLM Tool Security Guardrails',
        'Checkmarx MCP Server & Auto-PR Triage',
        'XM Cyber Blast Radius Choke Point Graphs'
      ],
      rating: 4.98,
      reviewsCount: 142
    },
    stats: {
      likesCount: 412,
      commentsCount: 56,
      repostsCount: 88,
      reactionsBreakdown: {
        like: 230,
        celebrate: 110,
        support: 24,
        love: 38,
        insightful: 10,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: [
      {
        id: 'c_prod_1',
        author: {
          name: 'Marcus Vance',
          headline: 'VP of Engineering at CloudScale Global · Ex-AWS',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          connectionDegree: '1st'
        },
        content: 'The Checkmarx MCP server integration and automated PR triage is a massive time-saver. Spinning up a trial instance today for our staging cluster.',
        timestamp: '10m ago',
        likesCount: 21
      }
    ]
  },
  {
    id: 'post_research_1',
    author: {
      id: 'author_elena',
      name: 'Dr. Elena Rostova',
      headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow | Ex-Google Brain',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '45m ago · 📑 Technical Whitepaper · 🌐',
    visibility: 'Public',
    postType: 'standard',
    feedCategory: 'research',
    feedSubCategory: 'Whitepapers',
    content: `📑 [Technical Whitepaper Released] Deterministic Tool Sandboxing and Memory Poisoning Immunity in Autonomous Multi-Agent Swarms.

Our research team has published the 2026 benchmark evaluating over 10,000 multi-agent tool execution cycles across Kubernetes microVM enclaves and WebAssembly runtimes.

Key findings:
• Zero-trust memory nonces reduce latent vector poisoning by 99.4%.
• MicroVM execution overhead is now sub-4ms per tool call with eBPF hooks.
• Replay-resistant cryptographic tokens prevent cross-agent privilege escalation.

Read the full open-access technical report and architecture blueprint below:`,
    hashtags: ['#ResearchPaper', '#AIContainment', '#AgenticAI', '#CyberSecurity'],
    media: {
      type: 'article',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      title: 'Deterministic Tool Sandboxing in Distributed Agent Trees (IEEE/ACM 2026)',
      domain: 'research.expediteconsults.com',
      description: 'Formal verification, cryptographic token validation, and memory isolation benchmarks for autonomous generative systems.'
    },
    stats: {
      likesCount: 328,
      commentsCount: 44,
      repostsCount: 65,
      reactionsBreakdown: {
        like: 180,
        celebrate: 22,
        support: 14,
        love: 32,
        insightful: 80,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: true,
    comments: []
  },
  {
    id: 'post_poll_1',
    author: {
      id: 'author_alex',
      name: 'Alex Taylor',
      headline: 'Principal Cloud & Security Architect | AI Infrastructure & Zero Trust Lead @ Expedite Consults',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      connectionDegree: 'You'
    },
    timestamp: '1h · 🌐',
    visibility: 'Public',
    postType: 'poll',
    feedCategory: 'for_you',
    feedSubCategory: 'AI discussions',
    content: `📊 Industry Pulse Check for Enterprise Architects & Security Leaders:

When deploying Multi-Agent Generative AI systems in production, what is your team's #1 containment concern for 2026?

Cast your vote below and share your reasoning in the comments! 👇`,
    hashtags: ['#AgenticAI', '#CyberSecurity', '#CloudArchitecture', '#Poll'],
    poll: {
      id: 'poll_1',
      question: 'Primary Multi-Agent AI Containment Concern:',
      options: [
        { id: 'opt_1', text: 'Deterministic tool sandboxing & shell isolation', votes: 142 },
        { id: 'opt_2', text: 'Cryptographic nonces & replay resistance', votes: 89 },
        { id: 'opt_3', text: 'Latent memory poisoning & prompt injection', votes: 215 },
        { id: 'opt_4', text: 'Sub-millisecond global cancelation killswitches', votes: 64 }
      ],
      totalVotes: 510,
      userVotedOptionId: null,
      timeRemaining: '5 days left'
    },
    stats: {
      likesCount: 184,
      commentsCount: 38,
      repostsCount: 19,
      reactionsBreakdown: {
        like: 110,
        celebrate: 12,
        support: 8,
        love: 14,
        insightful: 40,
        funny: 0
      }
    },
    userReaction: null,
    comments: [
      {
        id: 'c_poll_1',
        author: {
          name: 'Samantha Wei',
          headline: 'Director of Cyber Threat Intelligence @ Fortis Global',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
          connectionDegree: '2nd'
        },
        content: 'Voted for Latent Memory Poisoning. Once an autonomous agent stores polluted context in vector memory, subsequent sub-agents inherit the vulnerability invisibly.',
        timestamp: '30m ago',
        likesCount: 14
      }
    ]
  },
  {
    id: 'post_doc_1',
    author: {
      id: 'author_devon',
      name: 'Devon Hughes',
      headline: 'Senior Principal Frontend Architect @ Vercel Ecosystem | Speaker & Author',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '3h · 🌐',
    visibility: 'Public',
    postType: 'document',
    feedCategory: 'for_you',
    feedSubCategory: 'Technology',
    content: `📑 SLIDE DECK: The 2026 Enterprise Next.js & Turbopack Performance Playbook

Swipe through all 4 slides below for the exact micro-optimizations we implemented to achieve sub-50ms TTFB and 100/100 Core Web Vitals at scale.

Save this post 📌 to share with your engineering squad!`,
    hashtags: ['#Nextjs', '#React', '#WebPerformance', '#TechGuide'],
    document: {
      title: 'Nextjs_Enterprise_Performance_Guide_2026.pdf',
      totalPages: 4,
      slides: [
        {
          slideNumber: 1,
          title: '01 / Zero-Bundle React Server Actions',
          content: 'Server actions eliminate heavy client-side REST orchestration. Mutate database state directly without exposing client endpoints or bundling mutation logic.',
          visualTag: 'ARCHITECTURAL PATTERN',
          bgColor: 'from-blue-600 to-indigo-900'
        },
        {
          slideNumber: 2,
          title: '02 / Tailwind CSS v4 Just-In-Time Rust Engine',
          content: 'Zero runtime style injection, unified CSS variables, and 10x faster HMR. Say goodbye to bloated CSS bundles and build-time bottlenecks.',
          visualTag: 'STYLING ENGINE',
          bgColor: 'from-sky-600 to-cyan-900'
        },
        {
          slideNumber: 3,
          title: '03 / Dynamic Edge Caching & Stale-While-Revalidate',
          content: 'Push cache tags to cloud edge PoPs. Invalidate selectively on mutation rather than purging global CDNs.',
          visualTag: 'EDGE STRATEGY',
          bgColor: 'from-emerald-600 to-teal-950'
        },
        {
          slideNumber: 4,
          title: '04 / Optimistic UI Transitions with Rollback Safety',
          content: 'Update UI immediately upon button click, apply error boundaries to smoothly rollback if background execution errors.',
          visualTag: 'UX RESILIENCE',
          bgColor: 'from-purple-600 to-indigo-950'
        }
      ]
    },
    stats: {
      likesCount: 520,
      commentsCount: 64,
      repostsCount: 92,
      reactionsBreakdown: {
        like: 340,
        celebrate: 65,
        support: 15,
        love: 40,
        insightful: 60,
        funny: 0
      }
    },
    userReaction: 'love',
    isSaved: true,
    comments: []
  },
  {
    id: 'post_quote_1',
    author: {
      id: 'author_marcus',
      name: 'Marcus Vance',
      headline: 'VP of Engineering at CloudScale Global · Ex-AWS',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      connectionDegree: '1st'
    },
    timestamp: '5h · 🌐',
    visibility: 'Public',
    content: `Could not agree more with Dr. Rostova here. If your SOC team isn't auditing multi-agent signature nonces, you are flying blind into 2026. Highly recommend reading her breakdown:`,
    hashtags: ['#CyberSecurity', '#AIInfrastructure', '#Leadership'],
    quotedPost: {
      id: 'post_elena_orig',
      authorName: 'Dr. Elena Rostova',
      authorHeadline: 'Chief AI Research Scientist | Stanford AI Lab Fellow',
      authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      timestamp: '6h ago',
      content: 'Autonomous agentic systems are entering production at record speed. But most teams are overlooking the fundamental security surface: autonomous feedback loops without deterministic containment.'
    },
    stats: {
      likesCount: 240,
      commentsCount: 22,
      repostsCount: 16,
      reactionsBreakdown: {
        like: 160,
        celebrate: 20,
        support: 10,
        love: 15,
        insightful: 35,
        funny: 0
      }
    },
    userReaction: null,
    comments: []
  },
  {
    id: 'post_1',
    author: {
      id: 'author_elena',
      name: 'Dr. Elena Rostova',
      headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow | Ex-Google Brain',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      connectionDegree: '1st',
      isFollowing: true
    },
    timestamp: '6h · Edited · 🌐',
    visibility: 'Public',
    content: `Autonomous agentic systems are entering production at record speed. But most teams are overlooking the fundamental security surface: autonomous feedback loops without deterministic containment.

Here are 4 critical architectural guardrails every enterprise AI engineering team should enforce:

1️⃣ Deterministic Sandboxing: Tool calls executing shell or code must run in isolated ephemerality.
2️⃣ Cryptographic Intent Verification: Multi-agent message exchanges require cryptographic nonces and signature guarantees.
3️⃣ Real-Time Anomaly Scoring: Continuous evaluation of latent semantic drift during tool calling.
4️⃣ Kill-Switch State Propagation: Sub-millisecond global cancelation across distributed agent trees.

What guardrails is your team currently prioritizing this quarter? Would love to hear how folks are approaching defense-in-depth for generative agents! 👇`,
    hashtags: ['#ArtificialIntelligence', '#CyberSecurity', '#CloudArchitecture', '#AgenticAI', '#TechLeadership'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      aspectRatio: '16:9'
    },
    stats: {
      likesCount: 384,
      commentsCount: 42,
      repostsCount: 29,
      reactionsBreakdown: {
        like: 210,
        celebrate: 18,
        support: 12,
        love: 34,
        insightful: 104,
        funny: 6
      }
    },
    userReaction: 'insightful',
    isSaved: false,
    comments: [
      {
        id: 'c_1',
        author: {
          name: 'Marcus Vance',
          headline: 'VP of Engineering at CloudScale Global · Ex-AWS',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          connectionDegree: '1st'
        },
        content: 'Spot on Elena. Point #2 (Cryptographic Intent Verification) is what we recently rolled out across our microservices. Without nonces, replay attacks in autonomous loops are a nightmare.',
        timestamp: '5h ago',
        likesCount: 19,
        isLiked: true,
        replies: [
          {
            id: 'c_1_1',
            author: {
              name: 'Dr. Elena Rostova',
              headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
              connectionDegree: '1st'
            },
            content: '100% Marcus. The attack vector is completely distinct from standard API replay because agent memory state accumulates poisoning.',
            timestamp: '4h ago',
            likesCount: 8
          }
        ]
      }
    ]
  },
  {
    id: 'post_3',
    author: {
      id: 'author_expedite',
      name: 'Expedite Consults',
      headline: 'Enterprise Cyber Defense & Strategy Consulting · 45,000+ followers',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&auto=format&fit=crop&q=80',
      connectionDegree: 'Following'
    },
    timestamp: '1d · 🌐',
    visibility: 'Public',
    content: `📢 WE ARE HIRING!

Expedite Consults is expanding our Global Cyber Advisory & AI Resilience practice. We are actively looking for passionate innovators to join our high-impact team:

🔹 Lead Cloud Security Architect (NYC / Hybrid)
🔹 Senior Next.js / TypeScript Systems Engineer (Remote)
🔹 SOC 2 & Zero Trust Strategy Consultant (Boston / Remote)
🔹 Autonomous Loops Cyber Defense Fellow (Ph.D. / Research)

Why Expedite Consults?
✔️ Competitive equity & compensation
✔️ Unlimited learning & certification budget
✔️ Direct partnership with Fortune 100 enterprise leaders
✔️ Remote-first culture with state-of-the-art tooling`,
    hashtags: ['#Hiring', '#CyberSecurityJobs', '#TechCareers', '#CloudEngineering', '#OpenToWork'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80'
    },
    stats: {
      likesCount: 429,
      commentsCount: 35,
      repostsCount: 71,
      reactionsBreakdown: {
        like: 250,
        celebrate: 140,
        support: 25,
        love: 10,
        insightful: 4,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  }
]

export const trendingNews: NewsItem[] = [
  {
    id: 'news_1',
    headline: 'AI Agents transform enterprise DevOps pipelines',
    timeAgo: '3h ago',
    readersCount: '18,429 readers',
    category: 'Technology'
  },
  {
    id: 'news_2',
    headline: 'Cloud security budgets expand 28% in 2026',
    timeAgo: '5h ago',
    readersCount: '9,112 readers',
    category: 'Cybersecurity'
  },
  {
    id: 'news_3',
    headline: 'Next-gen zero trust protocols ratified',
    timeAgo: '8h ago',
    readersCount: '6,780 readers',
    category: 'Standards'
  },
  {
    id: 'news_4',
    headline: 'Tech hiring surges for multi-cloud architects',
    timeAgo: '1d ago',
    readersCount: '24,980 readers',
    category: 'Careers'
  },
  {
    id: 'news_5',
    headline: 'Remote vs Hybrid: Fortune 500 settlement trends',
    timeAgo: '1d ago',
    readersCount: '31,500 readers',
    category: 'Workplace'
  }
]

export const suggestedConnections: SuggestedConnection[] = [
  {
    id: 'sug_carpenter_david',
    name: 'David Miller',
    headline: 'Master Heavy Timber Carpenter & Joinery Superintendent · Heritage Guild',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 38,
    mutualName: 'Frank Gallagher',
    capabilities: ['Carpentry & Timber Framing', 'Heavy Timber', 'Architectural Joinery', 'OSHA 30'],
    verifiedBadges: ['✓ Master Carpenter Guild', '✓ OSHA 30 Lead'],
    circle: 'Master Craftsman & Timber Framing Guild',
    matchScore: 98,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_auto_marcus',
    name: 'Marcus Miller, ASE Master Tech',
    headline: 'World Class Master Diagnostic Specialist · L1 Advanced Engine & CAN-FD Scope',
    avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 29,
    mutualName: 'Carlos Santana',
    capabilities: ['Automotive Diagnostics & EV', 'CAN-Bus Oscilloscope', '800V EV Lockout', 'Cummins Fleet'],
    verifiedBadges: ['✓ ASE Master Tech', '✓ ASE L1 & L3 EV'],
    circle: 'ASE Master Diagnostics & Fleet Guild',
    matchScore: 97,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_nurse_elena',
    name: 'Elena Rostova, RN, CCRN, TNCC',
    headline: 'Emergency Trauma Resuscitation Nurse Lead · Level 1 Trauma Center',
    avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 45,
    mutualName: 'Dr. Angela Vance',
    capabilities: ['Critical Care & Trauma Nursing', 'Level 1 Trauma Triage', 'MTP Rapid Infusion', 'Arterial Lines'],
    verifiedBadges: ['✓ AACN CCRN', '✓ ENA TNCC Lead'],
    circle: 'Critical Care & Emergency Trauma Guild',
    matchScore: 99,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_doctor_angela',
    name: 'Dr. Angela Vance, MD, FACS',
    headline: 'Attending Orthopedic Trauma Surgeon · Chief of Pelvic & Articular Reconstruction',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 52,
    mutualName: 'Dr. Aris Thorne',
    capabilities: ['Orthopedic & Clinical Surgery', 'Pelvic Ring ORIF', 'Joint Reconstruction', 'Trauma Surgery'],
    verifiedBadges: ['✓ ABOS Board Certified', '✓ FACS Fellow'],
    circle: 'American College of Surgeons Enclave',
    matchScore: 96,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_cyber_tariq',
    name: 'Tariq Al-Mansoor, OSCP/CRTO',
    headline: 'Principal Red Team Operator · Adversary Emulation & Exploit Development',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 34,
    mutualName: 'Alex Taylor',
    capabilities: ['Red Teaming & Exploitation', 'Indirect Syscalls', 'C2 Frameworks', 'EDR Evasion'],
    verifiedBadges: ['✓ OffSec OSCP', '✓ CRTO Lead'],
    circle: 'Autonomous AI & Red Teaming Guild',
    matchScore: 99,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_scada_james',
    name: 'James Kowalski, CISSP, GICSP',
    headline: 'SCADA / ICS OT Critical Infrastructure Security Lead · Purdue Model Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 21,
    mutualName: 'Victoria Sterling',
    capabilities: ['SCADA / OT Security', 'Modbus DPI', 'Purdue Model', 'PLC Firmware'],
    verifiedBadges: ['✓ SANS GICSP', '✓ CISSP'],
    circle: 'Critical Infrastructure SCADA Defense',
    matchScore: 95,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_1',
    name: 'Kavita Patel',
    headline: 'Director of Cloud Governance & Zero Trust @ CyberNova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 24,
    mutualName: 'Elena Rostova',
    capabilities: ['Cloud Security', 'Zero Trust', 'DevSecOps', 'RMF'],
    verifiedBadges: ['✓ CISSP', '✓ Zero Trust Architect'],
    circle: 'Zero Trust Defense Circle',
    matchScore: 96,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_2',
    name: 'David Sterling',
    headline: 'Principal AI Security & Red Team Lead @ Apex Defense Labs',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 18,
    mutualName: 'Marcus Vance',
    capabilities: ['AI Security', 'Penetration Testing', 'Cloud Security'],
    verifiedBadges: ['✓ OSCP', '✓ Red Team Lead'],
    circle: 'Autonomous AI Red Teaming Guild',
    matchScore: 92,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_3',
    name: 'Chloe Tremblay',
    headline: 'Senior Full Stack Staff Architect | React & TypeScript Core Contributor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 41,
    mutualName: 'Devon Hughes',
    capabilities: ['DevSecOps', 'Next.js / TypeScript', 'Cloud Security'],
    verifiedBadges: ['✓ Vercel Contributor', '✓ Cloud Architect'],
    circle: 'AppSec & DevSecOps Platform Guild',
    matchScore: 88,
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_4',
    name: 'Alexander Novak',
    headline: 'Head of Infrastructure Security & FedRAMP RMF @ Quantico Capital',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 12,
    mutualName: 'Samantha Wei',
    capabilities: ['RMF', 'Zero Trust', 'Cloud Security', 'Penetration Testing'],
    verifiedBadges: ['✓ RMF Level III', '✓ FedRAMP 3PAO'],
    circle: 'FedRAMP & DoD RMF Practitioners',
    matchScore: 94,
    isConnected: false,
    isPending: false
  }
]

export const initialConnectedMembers: ConnectedMember[] = [
  {
    id: 'conn_1',
    name: 'Dr. Elena Rostova',
    headline: 'Chief AI Research Scientist | Stanford AI Lab Fellow | Ex-Google Brain',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 3 months ago',
    capabilities: ['AI Security', 'Cloud Security', 'DevSecOps'],
    verifiedBadges: ['✓ Ph.D. AI', '✓ Stanford Fellow'],
    mutualCount: 48,
    isOnline: true,
    company: 'Stanford AI Lab / Expedite Research',
    location: 'Palo Alto, CA',
    email: 'e.rostova@stanford.edu'
  },
  {
    id: 'conn_2',
    name: 'Marcus Vance',
    headline: 'VP of Cloud Infrastructure & AppSec @ CloudScale Global · Ex-AWS',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 6 months ago',
    capabilities: ['Cloud Security', 'Zero Trust', 'DevSecOps'],
    verifiedBadges: ['✓ Ex-AWS Staff', '✓ CISO Council'],
    mutualCount: 39,
    isOnline: true,
    company: 'CloudScale Global',
    location: 'Seattle, WA',
    email: 'marcus.vance@cloudscaleglobal.io'
  },
  {
    id: 'conn_3',
    name: 'Samantha Wei',
    headline: 'Lead FedRAMP & DoD 3PAO Assessor @ Federal Defense Advisors',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 1 year ago',
    capabilities: ['RMF', 'Zero Trust', 'Cloud Security'],
    verifiedBadges: ['✓ 3PAO Certified', '✓ CISSP-ISSAP'],
    mutualCount: 52,
    isOnline: false,
    company: 'Federal Defense Advisors',
    location: 'Washington, DC',
    email: 'samantha.wei@feddefense.gov'
  },
  {
    id: 'conn_4',
    name: 'Devon Hughes',
    headline: 'Senior Offensive Security Lead & Red Team Architect @ DarkMatrix',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 4 months ago',
    capabilities: ['Penetration Testing', 'AI Security', 'DevSecOps'],
    verifiedBadges: ['✓ OSCE3', '✓ Exploit Author'],
    mutualCount: 31,
    isOnline: true,
    company: 'DarkMatrix Cyber',
    location: 'Austin, TX',
    email: 'devon.hughes@darkmatrix.sec'
  },
  {
    id: 'conn_5',
    name: 'Aisha Johnson',
    headline: 'Staff Platform Security Engineer @ Kubernetes Foundation',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 8 months ago',
    capabilities: ['DevSecOps', 'Cloud Security', 'Zero Trust'],
    verifiedBadges: ['✓ CNCF Ambassador', '✓ CKS'],
    mutualCount: 44,
    isOnline: false,
    company: 'Cloud Native Computing Foundation',
    location: 'San Francisco, CA',
    email: 'aisha.j@cncf.io'
  },
  {
    id: 'conn_6',
    name: 'Carlos Mendez',
    headline: 'Principal Zero Trust Architect @ SecureEnterprise Solutions',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    connectedSince: 'Connected 5 months ago',
    capabilities: ['Zero Trust', 'Cloud Security', 'RMF'],
    verifiedBadges: ['✓ TOGAF 10', '✓ CCSP'],
    mutualCount: 27,
    isOnline: true,
    company: 'SecureEnterprise Solutions',
    location: 'Denver, CO',
    email: 'carlos.mendez@sec-ent.com'
  }
]

export const initialOutboundInvitations: OutboundInvitation[] = [
  {
    id: 'out_init_1',
    name: 'Victoria Vance-Montgomery',
    headline: 'Director of Cyber Procurement @ Raytheon Intelligence & Space',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    sentAt: '2 days ago',
    customNote: 'Hi Victoria, saw your panel on Zero Trust procurement. Would love to stay connected!',
    status: 'pending',
    type: 'person'
  },
  {
    id: 'out_init_2',
    name: 'Dr. Arthur Pendelton',
    headline: 'Principal AI Safety Fellow @ MIT Lincoln Laboratory',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    sentAt: '4 days ago',
    customNote: 'Dr. Pendelton, following your work on multi-agent sandboxing. Looking forward to connecting.',
    status: 'pending',
    type: 'person'
  },
  {
    id: 'out_init_3',
    name: 'Sarah Chen-O\'Reilly',
    headline: 'Chief Information Security Officer @ Apex HealthTech',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    sentAt: '1 week ago',
    status: 'pending',
    type: 'person'
  }
]

export const companiesNetworkData: CompanyNetworkItem[] = [
  {
    id: 'comp_1',
    name: 'Expedite Consults',
    tagline: 'Enterprise Autonomous Cyber Defense & AI AppSec Suite',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    industry: 'Cybersecurity & AI',
    followersCount: '48.2k followers',
    capabilities: ['Cloud Security', 'Penetration Testing', 'AI Security', 'Zero Trust', 'DevSecOps', 'RMF'],
    jobOpeningsCount: 8,
    isFollowing: true
  },
  {
    id: 'comp_2',
    name: 'Palantir Technologies',
    tagline: 'Foundational Defense & Critical Infrastructure Intelligence',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    industry: 'Defense Tech & Big Data',
    followersCount: '410k followers',
    capabilities: ['RMF', 'Zero Trust', 'Cloud Security'],
    jobOpeningsCount: 14,
    isFollowing: false
  },
  {
    id: 'comp_3',
    name: 'Anthropic',
    tagline: 'AI Safety, Alignment Research & Frontier Red Teaming',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    industry: 'Artificial Intelligence',
    followersCount: '320k followers',
    capabilities: ['AI Security', 'Penetration Testing'],
    jobOpeningsCount: 6,
    isFollowing: true
  },
  {
    id: 'comp_4',
    name: 'CrowdStrike',
    tagline: 'Cloud-Native Endpoint Security & Adversary Threat Intelligence',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
    industry: 'Cybersecurity',
    followersCount: '650k followers',
    capabilities: ['Cloud Security', 'Penetration Testing', 'Zero Trust'],
    jobOpeningsCount: 19,
    isFollowing: false
  }
]

export const organizationsNetworkData: OrganizationNetworkItem[] = [
  {
    id: 'org_1',
    name: 'CISA (Cybersecurity & Infrastructure Security Agency)',
    tagline: 'Defending America\'s Cyber Frontiers & Public Key Infrastructure',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&auto=format&fit=crop&q=80',
    type: 'Federal Agency',
    capabilities: ['RMF', 'Zero Trust', 'Penetration Testing', 'Cloud Security'],
    membersCount: '120k members',
    isFollowing: true
  },
  {
    id: 'org_2',
    name: 'Cloud Security Alliance (CSA)',
    tagline: 'Global Leader in Defining Cloud Security Best Practices & CCM',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80',
    type: 'Non-Profit Consortium',
    capabilities: ['Cloud Security', 'Zero Trust', 'DevSecOps'],
    membersCount: '85k members',
    isFollowing: true
  },
  {
    id: 'org_3',
    name: 'NIST Computer Security Division',
    tagline: 'Custodians of SP 800-53, SP 800-37 (RMF), and Zero Trust SP 800-207',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    type: 'Standards Body',
    capabilities: ['RMF', 'Zero Trust', 'Cloud Security'],
    membersCount: '94k members',
    isFollowing: false
  },
  {
    id: 'org_4',
    name: 'OWASP® Foundation',
    tagline: 'Open Worldwide Application Security Project (Top 10 & LLM Security)',
    logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&auto=format&fit=crop&q=80',
    type: 'Non-Profit Consortium',
    capabilities: ['Penetration Testing', 'AI Security', 'DevSecOps'],
    membersCount: '160k members',
    isFollowing: true
  }
]

export const professionalCirclesData: ProfessionalCircleItem[] = [
  {
    id: 'circle_1',
    name: 'Zero Trust & Edge Defense Circle',
    icon: '🔒',
    description: 'Enterprise architects eliminating perimeter VPNs with micro-segmentation, mTLS, and continuous IAM telemetry.',
    primaryCapability: 'Zero Trust',
    membersCount: '1,420 members',
    recentActivity: 'Active today · 14 new architecture debates',
    isJoined: true
  },
  {
    id: 'circle_2',
    name: 'Autonomous AI Red Teaming Guild',
    icon: '🤖',
    description: 'Researchers and offensive practitioners evaluating LLM tool sandboxing, prompt fuzzing, and agent guardrails.',
    primaryCapability: 'AI Security',
    membersCount: '890 members',
    recentActivity: 'Active today · 9 new PoC exploits shared',
    isJoined: true
  },
  {
    id: 'circle_3',
    name: 'FedRAMP & DoD RMF Practitioners',
    icon: '🏛️',
    description: 'Compliance officers, ISSOs, and assessors navigating NIST 800-53 Rev 5, 3PAO assessments, and Continuous ATO.',
    primaryCapability: 'RMF',
    membersCount: '2,150 members',
    recentActivity: 'Active 2h ago · 26 discussions',
    isJoined: false
  },
  {
    id: 'circle_4',
    name: 'AppSec & DevSecOps Platform Guild',
    icon: '⚡',
    description: 'Engineers embedding SAST/DAST, eBPF telemetry, and policy-as-code into Next.js and Kubernetes CI/CD pipelines.',
    primaryCapability: 'DevSecOps',
    membersCount: '3,400 members',
    recentActivity: 'Active 10m ago · 42 discussions',
    isJoined: false
  },
  {
    id: 'circle_5',
    name: 'Offensive Exploitation & Pentest Hub',
    icon: '🎯',
    description: 'Certified penetration testers, reverse engineers, and bug bounty hunters sharing weaponized automation playbooks.',
    primaryCapability: 'Penetration Testing',
    membersCount: '1,890 members',
    recentActivity: 'Active today · 18 live PoCs',
    isJoined: false
  }
]

export const followedTopicsData: FollowedTopicItem[] = [
  { id: 'topic_1', name: 'Zero Trust Architecture', hashtag: '#ZeroTrust', followersCount: '480k followers', category: 'Security Architecture', isFollowing: true },
  { id: 'topic_2', name: 'Autonomous AI Security', hashtag: '#AISecurity', followersCount: '620k followers', category: 'Artificial Intelligence', isFollowing: true },
  { id: 'topic_3', name: 'Offensive Penetration Testing', hashtag: '#PenetrationTesting', followersCount: '310k followers', category: 'AppSec', isFollowing: true },
  { id: 'topic_4', name: 'Risk Management Framework', hashtag: '#RMF', followersCount: '140k followers', category: 'Governance & GovTech', isFollowing: true },
  { id: 'topic_5', name: 'DevSecOps & Platform Engineering', hashtag: '#DevSecOps', followersCount: '530k followers', category: 'Cloud Infrastructure', isFollowing: false },
  { id: 'topic_6', name: 'Cloud Security Posture Management', hashtag: '#CloudSecurity', followersCount: '780k followers', category: 'Cloud Infrastructure', isFollowing: true }
]

export const initialJobs: JobItem[] = [
  {
    id: 'job_1',
    title: 'Lead Cloud Security Architect',
    company: 'Expedite Consults',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80',
    location: 'New York, NY (Hybrid)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '2 days ago',
    applicantsCount: 18,
    salaryRange: '$195,000 - $240,000 / yr',
    easyApply: true,
    description: 'We are seeking an experienced Cloud Security Architect to design zero-trust multi-cloud blueprints, guide executive stakeholders, and build automated threat mitigation strategies.',
    requirements: [
      '8+ years in AWS/GCP enterprise architectures',
      'Deep expertise in Kubernetes security and CSPM tools',
      'Proven experience mentoring engineering squads'
    ]
  },
  {
    id: 'job_2',
    title: 'Senior Frontend Systems Engineer',
    company: 'Vercel Ecosystem Labs',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'Remote · Worldwide',
    workplaceType: 'Remote',
    employmentType: 'Full-time',
    postedTime: '1 day ago',
    applicantsCount: 64,
    salaryRange: '$170,000 - $215,000 / yr',
    easyApply: true,
    description: 'Help build the next generation of high-speed developer platforms with Next.js, Turbopack, and state-of-the-art interactive micro-interactions.',
    requirements: [
      'Expert proficiency in TypeScript, React Server Components, and Tailwind CSS',
      'Strong eye for accessible UI/UX and micro-animations',
      'Contributions to open source libraries'
    ]
  },
  {
    id: 'job_3',
    title: 'Director of AI Defense Research',
    company: 'Sphera Cyber Defense',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
    location: 'Boston, MA (Hybrid)',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    postedTime: '4 days ago',
    applicantsCount: 11,
    salaryRange: '$220,000 - $275,000 / yr',
    easyApply: false,
    description: 'Lead research on autonomous defense loops, LLM safety guardrails, and cryptographic agent verification.',
    requirements: [
      'Ph.D. or M.S. in Computer Science or related AI field',
      'Peer-reviewed publications in cybersecurity or ML',
      'Demonstrated leadership of research teams'
    ]
  }
]

export const initialMessages: MessageThread[] = [
  {
    id: 'msg_1',
    user: {
      name: 'Dr. Elena Rostova',
      headline: 'Chief AI Research Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      status: 'online'
    },
    lastMessage: 'Let us schedule a sync on the autonomous containment paper this Thursday!',
    lastMessageTime: '12:45 PM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'other',
        text: 'Hi Alex! Loved your comments on the Zero Trust integration framework.',
        timestamp: '10:14 AM'
      },
      {
        id: 'm2',
        senderId: 'me',
        text: 'Thanks Elena! We are seeing great results with deterministic tool containment.',
        timestamp: '10:20 AM'
      },
      {
        id: 'm3',
        senderId: 'other',
        text: 'Let us schedule a sync on the autonomous containment paper this Thursday!',
        timestamp: '12:45 PM'
      }
    ]
  },
  {
    id: 'msg_2',
    user: {
      name: 'Marcus Vance',
      headline: 'VP of Engineering at CloudScale Global',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      status: 'offline'
    },
    lastMessage: 'Will send over the slide deck before our advisory board meeting.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        senderId: 'other',
        text: 'Hey Alex, do you have 10 mins to review our latest Kubernetes audit?',
        timestamp: 'Yesterday'
      },
      {
        id: 'm5',
        senderId: 'me',
        text: 'Absolutely Marcus, shoot it over and I will review tonight.',
        timestamp: 'Yesterday'
      },
      {
        id: 'm6',
        senderId: 'other',
        text: 'Will send over the slide deck before our advisory board meeting.',
        timestamp: 'Yesterday'
      }
    ]
  }
]

export const initialCourses: CourseItem[] = [
  {
    id: 'course_1',
    title: 'Autonomous AI Defense & Deterministic Sandboxing Masterclass',
    provider: 'ConnectIn Masterclass',
    instructor: {
      name: 'Dr. Elena Rostova',
      role: 'Stanford AI Lab Fellow & Chief Scientist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration: '2h 45m · 8 Lessons',
    level: 'Advanced',
    skillsCovered: ['Agent Containment', 'Cryptographic Nonces', 'SOC Automation'],
    learnersCount: 4210,
    rating: 4.9,
    description: 'Learn how to secure distributed agentic LLMs against memory poisoning, prompt injection, and rogue execution loops.',
    isEnrolled: true,
    certificateEarned: true
  },
  {
    id: 'course_2',
    title: 'Architecting Enterprise Zero Trust Networks on AWS & GCP',
    provider: 'O\'Reilly',
    externalUrl: 'https://learning.oreilly.com/library/view/zero-trust-networks/9781491962848/',
    instructor: {
      name: 'Alex Taylor',
      role: 'Principal Cloud & Security Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    duration: '3h 15m · 12 Lessons',
    level: 'Advanced',
    skillsCovered: ['Zero Trust', 'mTLS', 'CSPM', 'Kubernetes Security'],
    learnersCount: 8940,
    rating: 4.95,
    description: 'Complete hands-on blueprint for engineering zero-trust perimeter defenses, IAM privilege boundaries, and VPC isolation.',
    isEnrolled: false,
    certificateEarned: false
  },
  {
    id: 'course_3',
    title: 'High-Performance Next.js 16, React Server Actions & Tailwind v4',
    provider: 'ConnectIn Masterclass',
    instructor: {
      name: 'Devon Hughes',
      role: 'Senior Principal Frontend Architect',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    duration: '1h 50m · 6 Lessons',
    level: 'Intermediate',
    skillsCovered: ['Next.js 16', 'Turbopack', 'RSC', 'Optimistic UI'],
    learnersCount: 6120,
    rating: 4.88,
    description: 'Production architecture masterclass on streaming SSR, cache tags, Server Actions, and Tailwind CSS v4 design tokens.',
    isEnrolled: true,
    certificateEarned: false
  },
  {
    id: 'course_4',
    title: 'Learning eBPF: Programming the Linux Kernel for Fast, Secure Networking',
    provider: 'O\'Reilly',
    externalUrl: 'https://learning.oreilly.com/library/view/learning-ebpf/9781098135119/',
    instructor: {
      name: 'Liz Rice',
      role: 'Chief Open Source Officer & eBPF Pioneer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
    duration: '4h 30m · 14 Lessons',
    level: 'Advanced',
    skillsCovered: ['eBPF', 'Linux Kernel', 'Cilium', 'XDP & Packet Filtering'],
    learnersCount: 11400,
    rating: 4.97,
    description: 'Deep dive into writing eBPF programs, kernel tracing probes, Cilium service mesh networking, and runtime security enforcement.',
    isEnrolled: false,
    certificateEarned: false
  },
  {
    id: 'course_5',
    title: 'Google Cloud Professional Cloud Security Engineer Specialization',
    provider: 'Coursera',
    externalUrl: 'https://www.coursera.org/professional-certificates/google-cloud-security',
    instructor: {
      name: 'Google Cloud Training',
      role: 'Official Google Cloud Security Curriculum',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    duration: '18h · 5 Course Series',
    level: 'Advanced',
    skillsCovered: ['GCP Security', 'IAM Roles', 'Cloud KMS', 'VPC Service Controls'],
    learnersCount: 24500,
    rating: 4.92,
    description: 'Master Google Cloud identity management, data encryption with Cloud KMS, DDoS mitigation with Cloud Armor, and audit logging.',
    isEnrolled: false,
    certificateEarned: false
  },
  {
    id: 'course_6',
    title: 'AWS Certified Solutions Architect – Professional (SAP-C02)',
    provider: 'Udemy',
    externalUrl: 'https://www.udemy.com/course/aws-certified-solutions-architect-professional/',
    instructor: {
      name: 'Stephane Maarek',
      role: 'AWS Hero & Enterprise Cloud Architect',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    },
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    duration: '22h · 185 Lectures',
    level: 'Advanced',
    skillsCovered: ['AWS Transit Gateway', 'AWS Organizations', 'Control Tower', 'Disaster Recovery'],
    learnersCount: 98000,
    rating: 4.91,
    description: 'Comprehensive preparation for the highest AWS architecture certification covering multi-account governance and hybrid networking.',
    isEnrolled: false,
    certificateEarned: false
  }
]

export const initialCatchUpEvents: CatchUpEvent[] = [
  {
    id: 'catch_1',
    person: {
      name: 'Kavita Patel',
      headline: 'Director of Cloud Governance @ CyberNova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    eventType: 'anniversary',
    details: 'Celebrating 3 years at CyberNova',
    timeAgo: 'Today',
    hasCongratulated: false
  },
  {
    id: 'catch_2',
    person: {
      name: 'David Sterling',
      headline: 'Principal AI Security Engineer @ Apex Defense Labs',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    },
    eventType: 'new_job',
    details: 'Started a new position as Principal AI Security Engineer',
    timeAgo: 'Yesterday',
    hasCongratulated: false
  },
  {
    id: 'catch_3',
    person: {
      name: 'Victoria Hastings',
      headline: 'Chief Technology Officer @ Horizon FinTech Systems',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80'
    },
    eventType: 'birthday',
    details: 'Celebrated a birthday yesterday',
    timeAgo: '2d ago',
    hasCongratulated: true
  }
]

export const analyticsData: AnalyticsData = {
  weeklyProfileViews: [
    { day: 'Mon', views: 184 },
    { day: 'Tue', views: 240 },
    { day: 'Wed', views: 310 },
    { day: 'Thu', views: 280 },
    { day: 'Fri', views: 214 },
    { day: 'Sat', views: 110 },
    { day: 'Sun', views: 90 }
  ],
  topViewerCompanies: [
    { name: 'Google / Alphabet', percentage: 28, logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80' },
    { name: 'Amazon Web Services (AWS)', percentage: 24, logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80' },
    { name: 'Expedite Consults', percentage: 19, logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80' },
    { name: 'Microsoft Enterprise', percentage: 16, logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80' },
    { name: 'CrowdStrike', percentage: 13, logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80' }
  ],
  topSearchKeywords: [
    { keyword: 'Zero Trust Architect', count: 142 },
    { keyword: 'Chief Information Security Officer', count: 98 },
    { keyword: 'Next.js 16 Lead', count: 64 },
    { keyword: 'Autonomous AI Defense', count: 38 }
  ],
  searchOccurrencesCount: 342
}

// ─────────────────────────────────────────────────────────────────────────────
// ENCLAVE-SEGREGATED NETWORK COLLECTIONS (LEAST-PRIVILEGE ISOLATION)
// ─────────────────────────────────────────────────────────────────────────────

export function getEnclaveConnectedMembers(enclaveId?: string): ConnectedMember[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'conn_tc_1',
        name: 'Frank Gallagher',
        headline: 'Licensed General Contractor & Superintendent · OSHA 30 Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 5 months ago',
        capabilities: ['Commercial Buildouts', 'OSHA 30', 'Timber Framing'],
        verifiedBadges: ['✓ OSHA 30 Certified', '✓ Licensed GC'],
        mutualCount: 42,
        isOnline: true,
        company: 'Gallagher Commercial Builders',
        location: 'Denver, CO',
        email: 'frank.gallagher@gallagherbuilds.com'
      },
      {
        id: 'conn_tc_2',
        name: 'Lars Lindqvist',
        headline: 'Master Architectural Joiner & Passivhaus Specialist · Guild Member',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 8 months ago',
        capabilities: ['Architectural Joinery', 'Building Enclosures', 'Timber Framing'],
        verifiedBadges: ['✓ Master Guild Joiner', '✓ Passivhaus Tradesperson'],
        mutualCount: 31,
        isOnline: true,
        company: 'Heritage Architectural Joinery',
        location: 'Seattle, WA',
        email: 'lars@heritagewoodwork.com'
      },
      {
        id: 'conn_tc_3',
        name: 'Gus Vandermeer, PE',
        headline: 'Principal Structural Wood Engineer · Mass Timber Bent Specialist',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 1 year ago',
        capabilities: ['Heavy Equipment', 'Timber Framing', 'Commercial Buildouts'],
        verifiedBadges: ['✓ Licensed PE (OR/WA/CO)', '✓ Timber Guild Director'],
        mutualCount: 48,
        isOnline: false,
        company: 'Cascade Structural Engineering',
        location: 'Portland, OR',
        email: 'gus.vandermeer@cascadepes.com'
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'conn_hm_1',
        name: 'Dr. Julian Sterling, MD, FACS',
        headline: 'Chief of Trauma & Acute Care Surgery · ACS Committee on Trauma',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 4 months ago',
        capabilities: ['Trauma Surgery', 'MTP Rapid Infusion', 'Level 1 Trauma Triage'],
        verifiedBadges: ['✓ FACS Fellow', '✓ Board Certified General Surgery'],
        mutualCount: 56,
        isOnline: true,
        company: 'Metro Health Academic Trauma Center',
        location: 'Boston, MA',
        email: 'j.sterling@metrohealth-trauma.org'
      },
      {
        id: 'conn_hm_2',
        name: 'Elena Rostova, RN, CCRN, TNCC',
        headline: 'Trauma Resuscitation Nurse Lead · Emergency Resuscitation Suite',
        avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 6 months ago',
        capabilities: ['Critical Care & Trauma Nursing', 'Level 1 Trauma Triage', 'MTP Rapid Infusion', 'Arterial Lines'],
        verifiedBadges: ['✓ AACN CCRN', '✓ ENA TNCC Lead'],
        mutualCount: 45,
        isOnline: true,
        company: 'St. Jude Level 1 Trauma Center',
        location: 'Chicago, IL',
        email: 'elena.rostova@stjude-trauma.org'
      },
      {
        id: 'conn_hm_3',
        name: 'Dr. Aris Thorne, MD',
        headline: 'Associate Professor of Orthopedic Surgery · Joint Reconstruction Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 1 year ago',
        capabilities: ['Joint Reconstruction', 'Trauma Surgery', 'Level 1 Trauma Triage'],
        verifiedBadges: ['✓ ABOS Board Certified', '✓ AAHKS Fellow'],
        mutualCount: 52,
        isOnline: false,
        company: 'University Medical Center',
        location: 'Philadelphia, PA',
        email: 'aris.thorne@umc-ortho.org'
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'conn_am_1',
        name: 'Kenji Sato',
        headline: 'Master Automotive Scope Diagnostic Lead · PicoScope Automotive Instructor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 3 months ago',
        capabilities: ['CAN-Bus Oscilloscope', 'Automotive Diagnostics & EV', '800V EV Lockout'],
        verifiedBadges: ['✓ PicoScope Master Instructor', '✓ ASE Master L1'],
        mutualCount: 38,
        isOnline: true,
        company: 'Precision Scope Diagnostics',
        location: 'Detroit, MI',
        email: 'kenji.sato@precisionscope.com'
      },
      {
        id: 'conn_am_2',
        name: 'Carlos Santana',
        headline: 'Heavy Fleet Diesel & Hydraulic Specialist · Cummins Certified Master',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
        connectedSince: 'Connected 7 months ago',
        capabilities: ['Cummins Fleet', 'Automotive Diagnostics & EV', 'Transmission Rebuild'],
        verifiedBadges: ['✓ Cummins Master Tech', '✓ ASE T-Series Lead'],
        mutualCount: 29,
        isOnline: true,
        company: 'Interstate Fleet Logistics',
        location: 'Chicago, IL',
        email: 'carlos.santana@interstatefleet.com'
      }
    ]
  }

  return initialConnectedMembers
}

export function getEnclaveCompanies(enclaveId?: string): CompanyNetworkItem[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'comp_tc_1',
        name: 'Festool USA',
        tagline: 'Precision Woodworking, Domino Joiners & Dust Extraction Systems',
        logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
        industry: 'Tooling & Machinery',
        followersCount: '185k followers',
        capabilities: ['Architectural Joinery', 'Timber Framing'],
        jobOpeningsCount: 12,
        isFollowing: true
      },
      {
        id: 'comp_tc_2',
        name: 'Simpson Strong-Tie',
        tagline: 'Structural Building Connectors, Fasteners & Lateral Force Engineering',
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
        industry: 'Building Materials & Engineering',
        followersCount: '95k followers',
        capabilities: ['Timber Framing', 'Commercial Buildouts', 'OSHA 30'],
        jobOpeningsCount: 8,
        isFollowing: false
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'comp_hm_1',
        name: 'American College of Surgeons (ACS)',
        tagline: 'Advancing Surgical Standards, Trauma Verification & Clinical Practice',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=80',
        industry: 'Medical Associations',
        followersCount: '140k followers',
        capabilities: ['Trauma Surgery', 'MTP Rapid Infusion', 'Level 1 Trauma Triage'],
        jobOpeningsCount: 18,
        isFollowing: true
      },
      {
        id: 'comp_hm_2',
        name: 'Butterfly Network Inc.',
        tagline: 'Transforming Care with Handheld Point-of-Care Ultrasound & AI Telemetry',
        logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
        industry: 'Medical Devices & HealthTech',
        followersCount: '88k followers',
        capabilities: ['Level 1 Trauma Triage', 'Critical Care & Trauma Nursing'],
        jobOpeningsCount: 6,
        isFollowing: false
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'comp_am_1',
        name: 'Snap-on Tools & Diagnostics',
        tagline: 'Professional Automotive Diagnostic Scopes, Hand Tools & Shop Equipment',
        logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
        industry: 'Automotive Equipment',
        followersCount: '520k followers',
        capabilities: ['Automotive Diagnostics & EV', 'CAN-Bus Oscilloscope', '800V EV Lockout'],
        jobOpeningsCount: 22,
        isFollowing: true
      },
      {
        id: 'comp_am_2',
        name: 'Pico Technology Auto',
        tagline: 'The Global Standard in PC-Based Oscilloscopes & Vehicle Diagnostics',
        logo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100&auto=format&fit=crop&q=80',
        industry: 'Diagnostic Electronics',
        followersCount: '135k followers',
        capabilities: ['CAN-Bus Oscilloscope', 'Automotive Diagnostics & EV'],
        jobOpeningsCount: 9,
        isFollowing: false
      }
    ]
  }

  return companiesNetworkData
}

export function getEnclaveOrganizations(enclaveId?: string): OrganizationNetworkItem[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'org_tc_1',
        name: 'OSHA (Occupational Safety & Health Administration)',
        tagline: 'Enforcing Job-Site Safety Standards, 1926 Subpart M & Worker Health',
        logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
        type: 'Federal Agency',
        capabilities: ['OSHA 30', 'Commercial Buildouts', 'Timber Framing'],
        membersCount: '210k members',
        isFollowing: true
      },
      {
        id: 'org_tc_2',
        name: 'Timber Framers Guild (TFG)',
        tagline: 'Dedicated to the Art, Science & Practice of Traditional Heavy Timber Craft',
        logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
        type: 'Trade Guild & Standards Body',
        capabilities: ['Timber Framing', 'Architectural Joinery'],
        membersCount: '48k members',
        isFollowing: true
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'org_hm_1',
        name: 'Emergency Nurses Association (ENA)',
        tagline: 'Advancing Emergency Nursing Practice, TNCC & Pediatric Emergency Standards',
        logo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
        type: 'Clinical Nursing Association',
        capabilities: ['Critical Care & Trauma Nursing', 'Level 1 Trauma Triage', 'Arterial Lines'],
        membersCount: '95k members',
        isFollowing: true
      },
      {
        id: 'org_hm_2',
        name: 'American Academy of Orthopaedic Surgeons (AAOS)',
        tagline: 'World Leader in Musculoskeletal Health Standards & Surgical Education',
        logo: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=100&auto=format&fit=crop&q=80',
        type: 'Surgical Specialty Academy',
        capabilities: ['Trauma Surgery', 'Joint Reconstruction'],
        membersCount: '130k members',
        isFollowing: true
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'org_am_1',
        name: 'National Institute for Automotive Service Excellence (ASE)',
        tagline: 'Certifying Master Automotive, Heavy Duty Truck & Advanced EV Technicians',
        logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
        type: 'Credentialing & Standards Body',
        capabilities: ['Automotive Diagnostics & EV', '800V EV Lockout', 'Cummins Fleet'],
        membersCount: '310k members',
        isFollowing: true
      },
      {
        id: 'org_am_2',
        name: 'SAE International',
        tagline: 'Engineering Ground Vehicle Standards, CAN-FD Protocols & High Voltage EV Specs',
        logo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=100&auto=format&fit=crop&q=80',
        type: 'Engineering Standards Organization',
        capabilities: ['CAN-Bus Oscilloscope', '800V EV Lockout'],
        membersCount: '180k members',
        isFollowing: true
      }
    ]
  }

  return organizationsNetworkData
}

export function getEnclaveCircles(enclaveId?: string): ProfessionalCircleItem[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'circle_tc_1',
        name: 'Heavy Timber & Traditional Joinery Guild',
        icon: '🌲',
        description: 'Master craftsmen sharing mortise and tenon layouts, 5-axis CNC timber specs, and clear-span truss calculations.',
        primaryCapability: 'Timber Framing',
        membersCount: '3,200 members',
        recentActivity: 'Active today · 18 new joinery details shared',
        isJoined: true
      },
      {
        id: 'circle_tc_2',
        name: 'Commercial Framing Superintendents & OSHA 30',
        icon: '🦺',
        description: 'Commercial superintendents managing Subpart M tie-off protocols, crane pick plans, and subcontractor safety.',
        primaryCapability: 'OSHA 30',
        membersCount: '4,800 members',
        recentActivity: 'Active 1h ago · 24 discussions',
        isJoined: true
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'circle_hm_1',
        name: 'Level 1 Trauma Resuscitation & MTP Enclave',
        icon: '🩸',
        description: 'Surgeons and emergency trauma nurses discussing low-titer whole blood protocols, TXA timing, and damage control resuscitation.',
        primaryCapability: 'MTP Rapid Infusion',
        membersCount: '2,400 members',
        recentActivity: 'Active today · 14 case discussions',
        isJoined: true
      },
      {
        id: 'circle_hm_2',
        name: 'Emergency Critical Care Nursing (TNCC / CCRN)',
        icon: '🩺',
        description: 'Trauma and ICU nurse leaders sharing point-of-care ultrasound techniques, arterial line monitoring, and sepsis bundles.',
        primaryCapability: 'Critical Care & Trauma Nursing',
        membersCount: '4,100 members',
        recentActivity: 'Active 20m ago · 38 clinical cases',
        isJoined: true
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'circle_am_1',
        name: 'ASE Master Techs & L3 Hybrid Diagnostics Guild',
        icon: '⚡',
        description: 'World-class automotive technicians diagnosing 800-volt high-voltage inverters, DC contactors, and battery thermal circuits.',
        primaryCapability: '800V EV Lockout',
        membersCount: '3,800 members',
        recentActivity: 'Active today · 21 waveform traces shared',
        isJoined: true
      },
      {
        id: 'circle_am_2',
        name: 'PicoScope & CAN-Bus Oscilloscope Specialists',
        icon: '🔧',
        description: 'Master scope instructors analyzing differential CAN-FD signal ring-down, LIN bus shorts, and inductive current ramps.',
        primaryCapability: 'CAN-Bus Oscilloscope',
        membersCount: '2,600 members',
        recentActivity: 'Active 35m ago · 16 diagnostic cases',
        isJoined: true
      }
    ]
  }

  return professionalCirclesData
}

export function getEnclaveTopics(enclaveId?: string): FollowedTopicItem[] {
  if (enclaveId === 'trades_construction') {
    return [
      { id: 'top_tc_1', name: 'Timber Framing & Heavy Timber', hashtag: '#TimberFraming', followersCount: '380k followers', category: 'Craftsmanship', isFollowing: true },
      { id: 'top_tc_2', name: 'OSHA 1926 Job-Site Safety', hashtag: '#OSHA30', followersCount: '450k followers', category: 'Safety Standards', isFollowing: true },
      { id: 'top_tc_3', name: 'Architectural Finish Joinery', hashtag: '#FinishCarpentry', followersCount: '290k followers', category: 'Fine Woodworking', isFollowing: true }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      { id: 'top_hm_1', name: 'Trauma Surgery & Resuscitation', hashtag: '#TraumaSurgery', followersCount: '520k followers', category: 'Surgical Care', isFollowing: true },
      { id: 'top_hm_2', name: 'Critical Care & Emergency Nursing', hashtag: '#EmergencyNursing', followersCount: '480k followers', category: 'Clinical Practice', isFollowing: true },
      { id: 'top_hm_3', name: 'Point-of-Care Ultrasound (POCUS)', hashtag: '#POCUS', followersCount: '310k followers', category: 'Clinical Devices', isFollowing: true }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      { id: 'top_am_1', name: 'ASE Master Diagnostics', hashtag: '#ASEMasterTech', followersCount: '410k followers', category: 'Master Diagnostics', isFollowing: true },
      { id: 'top_am_2', name: '800-Volt EV Powertrains', hashtag: '#800VArchitecture', followersCount: '360k followers', category: 'Electric Vehicles', isFollowing: true },
      { id: 'top_am_3', name: 'PicoScope Waveform Analysis', hashtag: '#PicoScope', followersCount: '280k followers', category: 'Oscilloscope Diagnostics', isFollowing: true }
    ]
  }

  return followedTopicsData
}

export function getEnclaveInvitations(enclaveId?: string) {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'inv_tc_1',
        name: 'Markus Thorne',
        headline: 'Vice President of Commercial Construction @ Skanska Timberworks',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        capabilities: ['Commercial Buildouts', 'Timber Framing'],
        mutualCount: 28,
        timeAgo: '1 day ago',
        email: 'm.thorne@skanska-timber.com'
      },
      {
        id: 'inv_tc_2',
        name: 'Sarah Jenkins',
        headline: 'Senior Architectural Estimator @ Pacific Northwest Joinery',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        capabilities: ['Architectural Joinery', 'Building Enclosures'],
        mutualCount: 16,
        timeAgo: '2 days ago',
        email: 's.jenkins@pnw-joinery.com'
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'inv_hm_1',
        name: 'Dr. Michael Bennett, MD',
        headline: 'Director of Surgical ICU & Trauma Research @ Johns Hopkins Medicine',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        capabilities: ['Trauma Surgery', 'MTP Rapid Infusion'],
        mutualCount: 36,
        timeAgo: '1 day ago',
        email: 'mbennett@jhmi.edu'
      },
      {
        id: 'inv_hm_2',
        name: 'Patricia Morales, RN, MSN',
        headline: 'Clinical Nurse Specialist · Emergency Medicine @ Mayo Clinic',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
        capabilities: ['Critical Care & Trauma Nursing', 'Level 1 Trauma Triage'],
        mutualCount: 22,
        timeAgo: '3 days ago',
        email: 'morales.patricia@mayo.edu'
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'inv_am_1',
        name: 'Tony DeLuca',
        headline: 'Director of Technical Diagnostic Training @ Snap-on Tools',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        capabilities: ['Automotive Diagnostics & EV', 'CAN-Bus Oscilloscope'],
        mutualCount: 34,
        timeAgo: '1 day ago',
        email: 'tony.deluca@snapon.com'
      },
      {
        id: 'inv_am_2',
        name: 'Rachel Green, ASE Master L3',
        headline: 'Lead EV Powertrain Diagnostics Specialist @ Rivian Commercial Fleet',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
        capabilities: ['800V EV Lockout', 'Automotive Diagnostics & EV'],
        mutualCount: 19,
        timeAgo: '2 days ago',
        email: 'rgreen@rivianfleet.com'
      }
    ]
  }

  return [
    {
      id: 'inv_1',
      name: 'Victoria Hastings',
      headline: 'Chief Technology Officer @ Horizon FinTech Systems',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
      capabilities: ['Zero Trust', 'Cloud Security'],
      mutualCount: 31,
      timeAgo: '1 day ago',
      email: 'victoria.hastings@horizonfintech.io'
    },
    {
      id: 'inv_2',
      name: 'Dr. Liam O’Connor',
      headline: 'Head of Quantum Cryptography & RMF @ DARPA Partner Group',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      capabilities: ['RMF', 'AI Security'],
      mutualCount: 14,
      timeAgo: '3 days ago',
      email: 'l.oconnor@darpa-partner.sec'
    }
  ]
}

export function getEnclaveFloatingMessages(enclaveId?: string): MessageThread[] {
  if (enclaveId === 'trades_construction') {
    return [
      {
        id: 'msg_tc_1',
        user: {
          name: 'Frank Gallagher',
          headline: 'General Contractor · Superintendent',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: 'The crane company confirmed 8 AM arrival for the Douglas Fir bents.',
        lastMessageTime: '11:20 AM',
        unreadCount: 1,
        messages: [
          {
            id: 'm_tc_1',
            senderId: 'other',
            text: 'David, the crane company confirmed 8 AM arrival tomorrow for lifting the Douglas Fir principal bents.',
            timestamp: '11:20 AM'
          }
        ]
      },
      {
        id: 'msg_tc_2',
        user: {
          name: 'Lars Lindqvist',
          headline: 'Master Architectural Joiner',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: 'Do you want 14mm tenons or 12mm tenons for the exterior knee braces?',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
          {
            id: 'm_tc_2',
            senderId: 'other',
            text: 'Do you want 14mm tenons or 12mm tenons for the exterior knee braces on the pavilion?',
            timestamp: 'Yesterday'
          }
        ]
      }
    ]
  }

  if (enclaveId === 'healthcare_medicine') {
    return [
      {
        id: 'msg_hm_1',
        user: {
          name: 'Dr. Julian Sterling, MD',
          headline: 'Chief of Trauma Surgery',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: 'OR 4 is ready for the incoming polytrauma laparotomy.',
        lastMessageTime: '10:45 AM',
        unreadCount: 1,
        messages: [
          {
            id: 'm_hm_1',
            senderId: 'other',
            text: 'Dr. Vance, OR 4 is scrubbed and ready for the incoming polytrauma pelvic laparotomy.',
            timestamp: '10:45 AM'
          }
        ]
      },
      {
        id: 'msg_hm_2',
        user: {
          name: 'Elena Rostova, RN',
          headline: 'Trauma Resuscitation Nurse Lead',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: '4 units whole blood ready in the trauma bay infuser.',
        lastMessageTime: '9:15 AM',
        unreadCount: 0,
        messages: [
          {
            id: 'm_hm_2',
            senderId: 'other',
            text: 'Blood bank confirmed: 4 units low-titer whole blood and 1g IV TXA prepped in Trauma 1.',
            timestamp: '9:15 AM'
          }
        ]
      }
    ]
  }

  if (enclaveId === 'automotive_mechanics') {
    return [
      {
        id: 'msg_am_1',
        user: {
          name: 'Kenji Sato',
          headline: 'Master Scope Diagnostic Lead',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: 'CAN-FD waveform traces saved. Looks like harness fretting on pin 14.',
        lastMessageTime: '1:15 PM',
        unreadCount: 1,
        messages: [
          {
            id: 'm_am_1',
            senderId: 'other',
            text: 'Marcus, PicoScope traces on the 2026 delivery van show packet distortion. Terminal pin fretting on harness C2.',
            timestamp: '1:15 PM'
          }
        ]
      },
      {
        id: 'msg_am_2',
        user: {
          name: 'Carlos Santana',
          headline: 'Heavy Fleet Diesel Specialist',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          status: 'online'
        },
        lastMessage: 'The Cummins turbo actuator calibration passed all functional tests.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
          {
            id: 'm_am_2',
            senderId: 'other',
            text: 'The Cummins VGT turbo actuator calibration passed all functional tests. Ready for road testing.',
            timestamp: 'Yesterday'
          }
        ]
      }
    ]
  }

  return initialMessages
}
