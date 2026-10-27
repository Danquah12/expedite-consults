export interface VideoChapter {
  timestamp: string
  seconds: number
  title: string
  description?: string
}

export interface VideoTranscriptSegment {
  timestamp: string
  seconds: number
  speaker: string
  text: string
}

export interface MediaVideoItem {
  id: string
  title: string
  channelName: string
  channelAvatar: string
  channelRole: string
  channelFollowers: string
  isVerifiedChannel: boolean
  duration: string
  durationSeconds: number
  views: string
  uploadTimeAgo: string
  category: 'Product Demo' | 'Technical Walkthrough' | 'Live Stream' | 'Webinar' | 'Podcast' | 'Learning' | 'Threat Intelligence'
  thumbnail: string
  videoUrl?: string
  youtubeId?: string
  visibility: 'Public' | 'Connections Only' | 'Company Internal' | 'Subscriber Only'
  description: string
  likesCount: number
  commentsCount: number
  chapters: VideoChapter[]
  transcript: VideoTranscriptSegment[]
  embeddedProduct?: {
    id: string
    name: string
    icon: string
    price: string
    tagline: string
    trialAvailable: boolean
    liveUrl?: string
  }
  resources?: {
    type: 'github' | 'whitepaper' | 'docs' | 'course' | 'cert'
    label: string
    url: string
  }[]
  relatedJobs?: {
    id: string
    title: string
    company: string
    location: string
    salary: string
  }[]
  attributionMetrics?: {
    views: number
    productVisits: number
    trialStarts: number
    demoRequests: number
    purchasesCount: number
    attributedRevenue: string
  }
}

export interface MediaClipItem {
  id: string
  title: string
  creatorName: string
  creatorAvatar: string
  creatorRole: string
  duration: string
  views: string
  likes: string
  thumbnail: string
  topic: string
  actionType: 'Try Product' | 'Take Lab' | 'Follow Expert' | 'View Job'
  actionLabel: string
  actionTargetTab: string
  externalUrl?: string
}

export interface LiveStreamEvent {
  id: string
  title: string
  hostName: string
  hostAvatar: string
  hostRole: string
  company: string
  status: 'LIVE NOW' | 'SCHEDULED' | 'RECORDING_AVAILABLE'
  liveViewersCount: number
  scheduledTime: string
  description: string
  youtubeId?: string
  featuredProduct: {
    name: string
    icon: string
    price: string
    liveUrl?: string
  }
}

export interface PodcastEpisode {
  id: string
  showId: string
  title: string
  seasonNumber: number
  episodeNumber: number
  duration: string
  durationSeconds: number
  releaseDate: string
  listensCount: string
  rating: string
  isVideoPodcast: boolean
  audioUrl?: string
  videoThumbnail?: string
  description: string
  guest?: {
    name: string
    role: string
    company: string
    avatar: string
    profileId: string
  }
  chapters: VideoChapter[]
  transcript: VideoTranscriptSegment[]
  connectedEntityGraph: {
    person: { name: string; role: string; avatar: string }
    company: { name: string; tier: string }
    product: { name: string; icon: string; trialAction: string }
    job: { title: string; salary: string; company: string }
    course: { title: string; badge: string }
  }
  sponsors?: {
    brandName: string
    offerText: string
    promoCode: string
  }[]
}

export interface PodcastShow {
  id: string
  title: string
  tagline: string
  hostName: string
  hostRole: string
  hostAvatar: string
  coverImage: string
  category: 'Cybersecurity' | 'AI & LLM Systems' | 'Cloud & DevSecOps' | 'Leadership & CISO'
  subscribersCount: string
  rating: string
  reviewsCount: number
  totalEpisodes: number
  isMonetized: boolean
  monthlyMembershipPrice?: string
  episodes: PodcastEpisode[]
}

export const FEATURED_VIDEOS_DATA: MediaVideoItem[] = [
  {
    id: 'vid_axiom_demo',
    title: 'AXIOM 4.0 Deep Dive: Autonomous Zero-Trust Micro-Segmentation & Continuous cATO',
    channelName: 'Expedite Consults Product Lab',
    channelAvatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Autonomous Cyber Defense & AI AppSec Engineering',
    channelFollowers: '48.2K Followers',
    isVerifiedChannel: true,
    duration: '22:45',
    durationSeconds: 1365,
    views: '42.8K views',
    uploadTimeAgo: '2 days ago',
    category: 'Product Demo',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    visibility: 'Public',
    description: 'In this technical walkthrough, Alex Taylor (Fellow) breaks down the new eBPF packet-tracing engine inside AXIOM AI Cyber Suite and demonstrates real-time continuous OSCAL machine telemetry export for FedRAMP High authorizations.',
    likesCount: 1840,
    commentsCount: 142,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Introduction & Enterprise Threat Landscape' },
      { timestamp: '03:15', seconds: 195, title: 'Multi-Account AWS Landing Zone Architecture' },
      { timestamp: '08:40', seconds: 520, title: 'Live eBPF Socket Filtering & Micro-Segmentation' },
      { timestamp: '14:20', seconds: 860, title: 'AI-BOM Scanning & Token Guardrail Validation' },
      { timestamp: '18:50', seconds: 1130, title: 'Automated OSCAL JSON Continuous ATO (cATO) Export' },
      { timestamp: '21:10', seconds: 1270, title: '1-Click Trial Activation & Summary' }
    ],
    transcript: [
      { timestamp: '00:15', seconds: 15, speaker: 'Alex Taylor', text: 'Welcome everyone. Today we are exploring autonomous Zero Trust enforcement across AWS GovCloud.' },
      { timestamp: '08:42', seconds: 522, speaker: 'Alex Taylor', text: 'Notice how the Cilium eBPF probe attaches directly to the cgroup kernel socket without requiring iptables proxy overhead.' },
      { timestamp: '14:25', seconds: 865, speaker: 'Alex Taylor', text: 'For AI safety, the Model Context Protocol (MCP) gateway validates Ed25519 nonces to eliminate prompt injection attacks.' },
      { timestamp: '18:55', seconds: 1135, speaker: 'Alex Taylor', text: 'Our automated cATO pipeline generates machine-readable OSCAL JSON matching 340+ NIST 800-53 Rev 5 statutory controls.' }
    ],
    embeddedProduct: {
      id: 'axiom-cyber-suite',
      name: 'AXIOM AI Cyber Suite',
      icon: '🛡️',
      price: '$499 / mo',
      tagline: 'Autonomous zero-trust verification and continuous cATO pipeline.',
      trialAvailable: true
    },
    resources: [
      { type: 'github', label: 'GitHub: AWS Multi-Account Terraform Repo', url: '#' },
      { type: 'whitepaper', label: 'OSCAL cATO Telemetry Implementation Whitepaper', url: '#' },
      { type: 'course', label: 'Course: AWS GovCloud Zero-Trust Masterclass', url: '#' }
    ],
    relatedJobs: [
      { id: 'job_1', title: 'Principal Cloud & Zero Trust Architect', company: 'Expedite Consults', location: 'DC Metro / Remote', salary: '$245K TC' },
      { id: 'job_2', title: 'Senior Offensive AppSec Engineer', company: 'Defense Tech Labs', location: 'Remote (US)', salary: '$220K TC' }
    ],
    attributionMetrics: {
      views: 42800,
      productVisits: 3200,
      trialStarts: 840,
      demoRequests: 127,
      purchasesCount: 43,
      attributedRevenue: '$92,400'
    }
  },
  {
    id: 'vid_ebpf_k8s',
    title: 'Kubernetes Cilium eBPF Zero Trust Security Masterclass',
    channelName: 'Alex Taylor (Fellow)',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Principal Cloud Security Architect @ Expedite Consults',
    channelFollowers: '82.4K Followers',
    isVerifiedChannel: true,
    duration: '38:10',
    durationSeconds: 2290,
    views: '68.5K views',
    uploadTimeAgo: '5 days ago',
    category: 'Learning',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    visibility: 'Public',
    description: 'Learn how to inspect kernel socket telemetry, enforce least-privilege pod network policies, and drop cross-namespace lateral movement in microsecond speed.',
    likesCount: 3420,
    commentsCount: 289,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Why Iptables Fails in High-Density Kubernetes' },
      { timestamp: '05:40', seconds: 340, title: 'Linux eBPF Kernel Probes & Socket Hooking' },
      { timestamp: '15:20', seconds: 920, title: 'Deploying Cilium ClusterMesh with Helm' },
      { timestamp: '28:10', seconds: 1690, title: 'Zero-Trust Network Policy Testing & Lab Walkthrough' }
    ],
    transcript: [
      { timestamp: '01:10', seconds: 70, speaker: 'Alex Taylor', text: 'When scaling to 5,000 pods, standard iptables rules create severe latency. eBPF solves this by compiling bytecode directly in kernel space.' },
      { timestamp: '15:30', seconds: 930, speaker: 'Alex Taylor', text: 'Here is the ClusterMesh YAML configuration connecting multi-region AWS and on-prem clusters securely.' }
    ],
    resources: [
      { type: 'github', label: 'eBPF Kubernetes YAML Manifests', url: 'https://cilium.io/' },
      { type: 'cert', label: 'Claim Verified ConnectIn eBPF Badge', url: 'https://www.cncf.io/' }
    ]
  }
]

export const MEDIA_CLIPS_DATA: MediaClipItem[] = [
  {
    id: 'clip_pharm_1',
    title: '60-Second Clinical Pearl: Vancomycin AUC/MIC vs Trough Monitoring & USP <797> IV Checks',
    creatorName: 'Dr. Kwame Mensah, PharmD, BCPS',
    creatorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Director of Clinical Pharmacy · Johns Hopkins Medicine',
    duration: '0:56',
    views: '148.2K',
    likes: '12.4K',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=80',
    topic: 'Clinical Pharmacy & PharmD',
    actionType: 'Try Product',
    actionLabel: 'Open NIH DailyMed Live ↗',
    actionTargetTab: 'marketplace',
    externalUrl: 'https://dailymed.nlm.nih.gov/dailymed/'
  },
  {
    id: 'clip_md_2',
    title: 'Attending Physician Rapid Triage: Sepsis SOFA Score, Lactate Clearance & Vasopressor Timing',
    creatorName: 'Dr. Sophia Chen, MD, FACP',
    creatorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Chief of Internal Medicine · Mayo Clinic',
    duration: '0:59',
    views: '164.8K',
    likes: '14.1K',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80',
    topic: 'Physicians & Internal Medicine',
    actionType: 'Try Product',
    actionLabel: 'Launch MDCalc Live ↗',
    actionTargetTab: 'marketplace',
    externalUrl: 'https://www.mdcalc.com/'
  },
  {
    id: 'clip_rn_3',
    title: 'ICU Nurse Shift Handoff: Norepinephrine Titration, Arterial Line Zeroing & BCMA Safety',
    creatorName: 'Evelyn Boateng, BSN, RN, CCRN',
    creatorAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Critical Care ICU Charge Nurse · Kaiser Permanente',
    duration: '0:55',
    views: '132.0K',
    likes: '10.8K',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=80',
    topic: 'ICU & ER Nursing (RN/CCRN)',
    actionType: 'View Job',
    actionLabel: 'View Nursing & Clinical Jobs →',
    actionTargetTab: 'jobs'
  },
  {
    id: 'clip_ma_4',
    title: 'Medical Assistant & CNA Mastery: 12-Lead ECG Lead Placement & Phlebotomy Order of Draw',
    creatorName: 'Samuel Tetteh, CCMA, CNA, CPT',
    creatorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Lead Certified Medical Assistant & CNA · Mount Sinai',
    duration: '0:52',
    views: '119.4K',
    likes: '9.6K',
    thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
    topic: 'Medical Assistants & CNAs',
    actionType: 'Try Product',
    actionLabel: 'Open OpenEMR Live ↗',
    actionTargetTab: 'marketplace',
    externalUrl: 'https://www.open-emr.org/'
  },
  {
    id: 'clip_admin_5',
    title: 'Hospital Administrator Briefing: Reducing ED Boarding by 34% with Real-Time Bed Telemetry',
    creatorName: 'Richard Danquah, MHA, MBA, FACHE',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Chief Hospital Administrator · Mass General Brigham',
    duration: '0:58',
    views: '98.7K',
    likes: '7.9K',
    thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80',
    topic: 'Hospital Administration (MHA)',
    actionType: 'View Job',
    actionLabel: 'View Healthcare Admin Roles →',
    actionTargetTab: 'jobs'
  },
  {
    id: 'clip_1',
    title: '3 Common AWS IAM Mistakes That Expose GovCloud S3 Buckets',
    creatorName: 'Alex Taylor (Fellow)',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Cloud Security Architect',
    duration: '0:58',
    views: '124.5K',
    likes: '8.9K',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    topic: 'AWS Cloud Defense',
    actionType: 'Try Product',
    actionLabel: 'Scan IAM in AXIOM →',
    actionTargetTab: 'marketplace'
  }
]

export const LIVE_STREAMS_DATA: LiveStreamEvent[] = [
  {
    id: 'live_health_grand_rounds',
    title: 'LIVE Multi-Profession Grand Rounds: Clinical Pharmacy, Attending Physicians, ICU Nursing, Medical Aides & Hospital Command',
    hostName: 'Dr. Kwame Mensah (PharmD), Dr. Sophia Chen (MD), Evelyn Boateng (RN) & Richard Danquah (MHA)',
    hostAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    hostRole: 'Interdisciplinary Clinical Pharmacy, Medicine, Nursing & Hospital Admin Panel',
    company: 'Johns Hopkins · Mayo Clinic · Mass General Brigham',
    status: 'LIVE NOW',
    liveViewersCount: 1428,
    scheduledTime: 'Streaming Live · Interdisciplinary Hospital Command Broadcast',
    description: 'Live interactive clinical walkthrough connecting Sterile Compounding Pharmacists (USP <797>/<800>), Attending Physicians, Critical Care Nurses, Certified Medical Assistants (CCMA/CNA), and Hospital Administrators with live NIH DailyMed and MDCalc telemetry.',
    youtubeId: '9vJRopau0g0',
    featuredProduct: {
      name: 'NIH DailyMed & MDCalc Clinical Suite',
      icon: '🏥',
      price: 'Free Live Clinical Portals',
      liveUrl: 'https://dailymed.nlm.nih.gov/dailymed/'
    }
  },
  {
    id: 'live_1',
    title: 'AXIOM 4.0 & Expedite Strike: Live Zero-Trust & cATO Interactive Teardown',
    hostName: 'Alex Taylor & Expedite Consults Cadre',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    hostRole: 'Principal Cloud Security Architect (Fellow)',
    company: 'Expedite Consults Product Lab',
    status: 'LIVE NOW',
    liveViewersCount: 842,
    scheduledTime: 'Streaming Live · Started 15 mins ago',
    description: 'Watch live red team adversary emulation against an AWS GovCloud multi-tenant cluster with automated GitHub fix PR dispatch and OSCAL assertion generation.',
    youtubeId: 'L_Guz73e6fw',
    featuredProduct: {
      name: 'Expedite Strike ASPM',
      icon: '⚡',
      price: '$499 / mo',
      liveUrl: 'https://dstrike-app.vercel.app'
    }
  }
]

export const PODCAST_SHOWS_DATA: PodcastShow[] = [
  {
    id: 'show_ciso_directive',
    title: 'The CISO Directive: Federal & Enterprise Security',
    tagline: 'Deep-dive conversations on cATO, Zero Trust architecture, defense procurement, and board-level risk.',
    hostName: 'Dr. Sarah Jenkins',
    hostRole: 'Former Federal CISO & Senior Fellow',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    category: 'Leadership & CISO',
    subscribersCount: '34.8K Subscribers',
    rating: '4.9 ★',
    reviewsCount: 384,
    totalEpisodes: 24,
    isMonetized: true,
    monthlyMembershipPrice: '$19 / mo (VIP Dossiers & Live Q&A)',
    episodes: [
      {
        id: 'ep_18',
        showId: 'show_ciso_directive',
        title: 'Episode 18: FedRAMP High Authorization Accelerators & Automated OSCAL Telemetry',
        seasonNumber: 1,
        episodeNumber: 18,
        duration: '48:30',
        durationSeconds: 2910,
        releaseDate: 'August 28, 2026',
        listensCount: '24.1K Listens',
        rating: '4.98 ★',
        isVideoPodcast: true,
        videoThumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80',
        description: 'Dr. Sarah Jenkins and Col. Raymond Sterling (Ret.) break down how automated machine-readable OSCAL JSON is replacing static 800-page system security plans and reducing authorization timelines from 18 months to 3 weeks.',
        guest: {
          name: 'Col. Raymond Sterling (Ret.)',
          role: 'DoD Authorizing Official Liaison',
          company: 'Expedite Consults Defense Taskforce',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          profileId: 'raymond-sterling'
        },
        chapters: [
          { timestamp: '00:00', seconds: 0, title: 'Introduction & New Federal cATO Mandates' },
          { timestamp: '12:15', seconds: 735, title: 'Why 3PAO Audits Are Moving to Real-Time Telemetry' },
          { timestamp: '24:50', seconds: 1490, title: 'Continuous Machine Control Assertion via AXIOM' },
          { timestamp: '36:10', seconds: 2170, title: 'Budget Allocation & GovCloud Procurement Strategies' }
        ],
        transcript: [
          { timestamp: '00:45', seconds: 45, speaker: 'Dr. Sarah Jenkins', text: 'Welcome to Episode 18. Today we are addressing the major shift from static paper audits to continuous automated authorization to operate (cATO).' },
          { timestamp: '12:20', seconds: 740, speaker: 'Col. Raymond Sterling', text: 'In GovCloud enclaves, 3PAOs now expect cryptographically signed OSCAL JSON machine exports rather than Word documents.' },
          { timestamp: '25:00', seconds: 1500, speaker: 'Col. Raymond Sterling', text: 'Tools like AXIOM AI Cyber Suite poll configuration telemetry every 60 seconds, proving zero drift against NIST 800-53 Rev 5.' }
        ],
        connectedEntityGraph: {
          person: { name: 'Col. Raymond Sterling (Ret.)', role: 'DoD Authorizing Official Liaison', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
          company: { name: 'Expedite Consults Product Lab', tier: 'FedRAMP High In-Process' },
          product: { name: 'AXIOM AI Cyber Suite ($499/mo)', icon: '🛡️', trialAction: 'Start Free Evaluation' },
          job: { title: 'Lead FedRAMP Compliance Architect ($235K)', salary: '$235K TC', company: 'Expedite Consults' },
          course: { title: 'DoD Continuous ATO (cATO) Architecture Masterclass', badge: 'Certified Fellow' }
        },
        sponsors: [
          { brandName: 'AXIOM AI Cyber Suite', offerText: 'Get 30 days free evaluation with promo code CISO18', promoCode: 'CISO18' }
        ]
      },
      {
        id: 'ep_17',
        showId: 'show_ciso_directive',
        title: 'Episode 17: Securing Agentic AI & Model Context Protocol (MCP) in the Enterprise',
        seasonNumber: 1,
        episodeNumber: 17,
        duration: '42:15',
        durationSeconds: 2535,
        releaseDate: 'August 14, 2026',
        listensCount: '31.2K Listens',
        rating: '4.95 ★',
        isVideoPodcast: true,
        videoThumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
        description: 'How to build cryptographically isolated token firewalls and prevent prompt injection in autonomous LLM tool agents.',
        guest: {
          name: 'Elena Rostova',
          role: 'Stanford AI Security Fellow',
          company: 'AI Safety Labs',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          profileId: 'elena-rostova'
        },
        chapters: [
          { timestamp: '00:00', seconds: 0, title: 'The Rise of Agentic AI Security Risks' },
          { timestamp: '14:20', seconds: 860, title: 'MCP Boundary Sandboxing & Ed25519 Nonces' },
          { timestamp: '31:00', seconds: 1860, title: 'Building Automated AI-BOM Inventories' }
        ],
        transcript: [
          { timestamp: '01:05', seconds: 65, speaker: 'Dr. Sarah Jenkins', text: 'When LLMs are given shell and API access, prompt injection becomes arbitrary code execution unless strict tool isolation is enforced.' }
        ],
        connectedEntityGraph: {
          person: { name: 'Elena Rostova', role: 'Stanford AI Security Fellow', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
          company: { name: 'AI Safety Labs', tier: 'Verified Research Org' },
          product: { name: 'Expedite Strike ASPM ($499/mo)', icon: '⚡', trialAction: 'Test MCP Guardrails' },
          job: { title: 'Staff AI Security Engineer ($385K)', salary: '$385K TC', company: 'Stripe' },
          course: { title: 'LLM Prompt Defense & MCP Isolation Lab', badge: '+400 XP' }
        }
      }
    ]
  },
  {
    id: 'show_cloud_kernel',
    title: 'The Cloud & Kernel: eBPF, Cilium & Linux Architecture',
    tagline: 'Technical deep dives into low-level Linux performance, micro-segmentation, and cloud native networking.',
    hostName: 'Alex Taylor',
    hostRole: 'Principal Cloud Security Architect (Fellow)',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    category: 'Cloud & DevSecOps',
    subscribersCount: '52.1K Subscribers',
    rating: '4.99 ★',
    reviewsCount: 612,
    totalEpisodes: 32,
    isMonetized: true,
    monthlyMembershipPrice: '$15 / mo (Source Code & Labs Access)',
    episodes: []
  }
]

export const TRADES_VIDEOS_DATA: MediaVideoItem[] = [
  {
    id: 'vid_timber_joinery',
    title: 'Heavy Timber Frame Joinery Masterclass: Compound Bents, Mortise & Tenon Layout',
    channelName: 'David Miller Timber Guild',
    channelAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Master Carpenter & Timber Frame Guild Director',
    channelFollowers: '36.5K Followers',
    isVerifiedChannel: true,
    duration: '28:40',
    durationSeconds: 1720,
    views: '54.2K views',
    uploadTimeAgo: '3 days ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'zu6p3_df20A',
    visibility: 'Public',
    description: 'Master carpenter David Miller demonstrates traditional draw-bored mortise and tenon joinery layout on 10x10 Douglas Fir posts with white oak octagonal trunnels and Festool Domino XL DF 700 integration.',
    likesCount: 2940,
    commentsCount: 184,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Timber Sourcing & Moisture Meter Verification' },
      { timestamp: '06:15', seconds: 375, title: 'Squaring 10x10 Douglas Fir Principal Posts' },
      { timestamp: '14:20', seconds: 860, title: 'Mortise & Tenon Drawbore Layout (1/8" Offset)' },
      { timestamp: '22:10', seconds: 1330, title: 'Festool Domino XL DF 700 Compound Bracing' }
    ],
    transcript: [
      { timestamp: '00:30', seconds: 30, speaker: 'David Miller', text: 'Welcome craftsmen. Today we are laying out heavy timber mortise-and-tenon joinery for a 40-foot clear span bent.' },
      { timestamp: '14:30', seconds: 870, speaker: 'David Miller', text: 'Notice the drawbore hole offset of exactly 1/8 inch. When we drive the octagonal oak peg, it pulls the shoulder air-tight.' }
    ],
    embeddedProduct: {
      id: 'festool-domino-xl',
      name: 'Festool Domino XL DF 700 Joiner',
      icon: '🪚',
      price: '$1,650',
      tagline: 'Heavy timber mortise joinery system with 14mm cutter.',
      trialAvailable: false
    },
    relatedJobs: [
      { id: 'job_carp_1', title: 'Heavy Timber Framing Lead', company: 'Pacific Timberworks', location: 'Portland, OR', salary: '$95K - $125K' }
    ]
  },
  {
    id: 'vid_osha_rigging',
    title: 'OSHA 1926 Crane Rigging & Clear-Span Truss Erection Safety Protocol',
    channelName: 'Commercial Construction Guild',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    channelRole: 'General Contracting & OSHA 30 Safety Administration',
    channelFollowers: '41.8K Followers',
    isVerifiedChannel: true,
    duration: '22:15',
    durationSeconds: 1335,
    views: '38.1K views',
    uploadTimeAgo: '1 week ago',
    category: 'Learning',
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'f4cT6_t7690',
    visibility: 'Public',
    description: 'Job-site superintendent Frank Gallagher breaks down OSHA Subpart M fall protection anchorages, spreader bar rigging, and 100% tie-off lifelines during commercial bent lifts.',
    likesCount: 1840,
    commentsCount: 92,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'OSHA 1926 Subpart M Crane Lift Overview' },
      { timestamp: '07:30', seconds: 450, title: 'Calculating Sling Angles & Shackle Deflection' },
      { timestamp: '16:00', seconds: 960, title: '100% Tie-Off Horizontal Lifelines on Open Trusses' }
    ],
    transcript: [
      { timestamp: '00:45', seconds: 45, speaker: 'Frank Gallagher', text: 'Safety is non-negotiable. When picking a 3,500-lb timber bent, sling angles must never drop below 60 degrees.' }
    ]
  }
]

export const HEALTHCARE_VIDEOS_DATA: MediaVideoItem[] = [
  {
    id: 'vid_pharmacy_stewardship',
    title: 'Clinical Pharmacy Masterclass: USP <797>/<800> IV Sterile Compounding, Pharmacokinetics & Antimicrobial Stewardship',
    channelName: 'Dr. Kwame Mensah, PharmD, BCPS',
    channelAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Director of Clinical Pharmacy & Antimicrobial Stewardship · Johns Hopkins Medicine',
    channelFollowers: '84.6K Followers',
    isVerifiedChannel: true,
    duration: '29:45',
    durationSeconds: 1785,
    views: '92.4K views',
    uploadTimeAgo: '1 day ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1000&auto=format&fit=crop&q=80',
    youtubeId: '9vJRopau0g0',
    visibility: 'Public',
    description: 'Board-certified clinical pharmacist Dr. Kwame Mensah (PharmD, BCPS) and Lead CPhT sterile compounding technicians demonstrate ISO Class 5 laminar airflow hood IV admixture verification, Vancomycin AUC/MIC Bayesian dosing, Cockcroft-Gault renal clearance adjustments, and live FDA/NIH DailyMed drug interaction verification.',
    likesCount: 5420,
    commentsCount: 418,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'USP <797> & <800> Cleanroom Gowning & ISO Class 5 Hood Verification' },
      { timestamp: '07:20', seconds: 440, title: 'Vancomycin AUC/MIC & Aminoglycoside Renal Dosing Calculations' },
      { timestamp: '15:45', seconds: 945, title: 'IV Y-Site Compatibility & Vasopressor Admixture Stability' },
      { timestamp: '23:10', seconds: 1390, title: 'Live NIH DailyMed & OpenFDA Boxed Warning Telemetry Check' }
    ],
    transcript: [
      { timestamp: '00:30', seconds: 30, speaker: 'Dr. Kwame Mensah, PharmD', text: 'Welcome pharmacists, pharmacy technicians, nurses, and physicians. Every IV admixture leaving our cleanroom undergoes barcode gravimetric verification.' },
      { timestamp: '07:25', seconds: 445, speaker: 'Dr. Kwame Mensah, PharmD', text: 'For septic shock patients on piperacillin-tazobactam and vancomycin, we target an AUC24/MIC ratio between 400 and 600 mg·hr/L to prevent acute kidney injury.' },
      { timestamp: '23:15', seconds: 1395, speaker: 'Dr. Kwame Mensah, PharmD', text: 'Use our embedded NIH DailyMed and OpenFDA links below to cross-check National Drug Codes (NDC) and lot recalls in real time.' }
    ],
    embeddedProduct: {
      id: 'prod_nih_dailymed_pharmacy',
      name: 'NIH DailyMed & RxNorm Clinical Formulary Portal',
      icon: '💊',
      price: 'Free Live NIH Portal',
      tagline: 'Live FDA Structured Product Labeling, NDC lookup & IV compatibility.',
      trialAvailable: true,
      liveUrl: 'https://dailymed.nlm.nih.gov/dailymed/'
    },
    resources: [
      { type: 'docs', label: 'Live Portal: NIH DailyMed Drug & NDC Lookup ↗', url: 'https://dailymed.nlm.nih.gov/dailymed/' },
      { type: 'whitepaper', label: 'Live Portal: OpenFDA Drug Adverse Event & Recall API ↗', url: 'https://open.fda.gov/' },
      { type: 'course', label: 'Live Portal: MDCalc Creatinine Clearance (Cockcroft-Gault) ↗', url: 'https://www.mdcalc.com/' }
    ],
    relatedJobs: [
      { id: 'health_pharmacist_1', title: 'Director of Clinical Pharmacy & Antimicrobial Stewardship (PharmD, BCPS)', company: 'Johns Hopkins Medicine', location: 'Baltimore, MD / Hybrid', salary: '$168K - $205K' },
      { id: 'health_pharmtech_2', title: 'Lead IV Sterile Compounding Pharmacy Technician (CPhT, CSPT)', company: 'Cleveland Clinic Health System', location: 'Cleveland, OH', salary: '$68K - $86K' }
    ]
  },
  {
    id: 'vid_physician_rounds',
    title: 'Attending Physician & Internal Medicine Grand Rounds: Sepsis Resuscitation, Differential Diagnosis & MDCalc Bedside Scores',
    channelName: 'Dr. Sophia Chen, MD, FACP',
    channelAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Chief of Internal Medicine & Clinical Informatics · Mayo Clinic',
    channelFollowers: '96.2K Followers',
    isVerifiedChannel: true,
    duration: '32:10',
    durationSeconds: 1930,
    views: '108.5K views',
    uploadTimeAgo: '2 days ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'iG9CE55wbtY',
    visibility: 'Public',
    description: 'Dr. Sophia Chen, MD, FACP leads interdisciplinary inpatient rounds with Resident Physicians, Nurse Practitioners (DNP/PA-C), Clinical Pharmacists, and Bedside RNs—covering rapid shock differentiation with POCUS, SOFA/HEART score stratification on MDCalc, and evidence-based PubMed literature integration.',
    likesCount: 6380,
    commentsCount: 492,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Morning Interdisciplinary Huddle (MD, NP/PA, PharmD, RN, CNA)' },
      { timestamp: '08:10', seconds: 490, title: 'Bedside POCUS Inferior Vena Cava & Cardiac Contractility Exam' },
      { timestamp: '17:30', seconds: 1050, title: 'Live MDCalc Stratification: SOFA, Wells PE & CHA2DS2-VASc' },
      { timestamp: '25:40', seconds: 1540, title: 'CPOE Order Sets & Pharmacy Med-Rec Sign-Off' }
    ],
    transcript: [
      { timestamp: '00:40', seconds: 40, speaker: 'Dr. Sophia Chen, MD', text: 'Great inpatient medicine relies on tight closed-loop communication between the attending physician, nurse practitioner, clinical pharmacist, bedside nurse, and medical assistant.' },
      { timestamp: '17:35', seconds: 1055, speaker: 'Dr. Sophia Chen, MD', text: 'Let us pull up MDCalc live at the bedside to compute the Sequential Organ Failure Assessment (SOFA) score and adjust our vasopressor and antibiotic targets.' }
    ],
    embeddedProduct: {
      id: 'prod_mdcalc_clinical_decision',
      name: 'MDCalc Clinical Decision Support (700+ Calculators)',
      icon: '🩺',
      price: 'Free Live Bedside Tool',
      tagline: '700+ peer-reviewed medical calculators for Physicians, NPs, PAs, RNs & Pharmacists.',
      trialAvailable: true,
      liveUrl: 'https://www.mdcalc.com/'
    },
    resources: [
      { type: 'docs', label: 'Live Portal: MDCalc Clinical Calculators (700+ Tools) ↗', url: 'https://www.mdcalc.com/' },
      { type: 'whitepaper', label: 'Live Portal: NIH PubMed & MEDLINE Clinical Research ↗', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    relatedJobs: [
      { id: 'health_physician_3', title: 'Attending Physician — Internal Medicine & Hospitalist Lead (MD / DO)', company: 'Mayo Clinic Health System', location: 'Rochester, MN', salary: '$310K - $395K' },
      { id: 'health_np_pa_4', title: 'Lead Acute Care Nurse Practitioner / Physician Assistant (DNP, APRN, PA-C)', company: 'Kaiser Permanente Medical Group', location: 'Oakland, CA', salary: '$175K - $215K' }
    ]
  },
  {
    id: 'vid_icu_nursing_telemetry',
    title: 'Critical Care & ER Nursing (BSN, RN, CCRN): Hemodynamic Telemetry, Vasopressor Titration & Sepsis Hour-1 Bundle',
    channelName: 'Evelyn Boateng, BSN, RN, CCRN',
    channelAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Critical Care ICU Charge Nurse & Trauma Resuscitation Lead',
    channelFollowers: '74.1K Followers',
    isVerifiedChannel: true,
    duration: '26:30',
    durationSeconds: 1590,
    views: '83.7K views',
    uploadTimeAgo: '3 days ago',
    category: 'Learning',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'qp0HIF3SfI4',
    visibility: 'Public',
    description: 'ICU Charge Nurse Evelyn Boateng (BSN, RN, CCRN) walks Registered Nurses, LPNs, and Nursing Aides through arterial line phlebostatic axis leveling, Alaris smart-pump DERS guardrails, dual-RN high-alert insulin/heparin checks, and SBAR shift handoffs.',
    likesCount: 4890,
    commentsCount: 365,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Sepsis Hour-1 Bundle: Blood Cultures, Lactate & Broad-Spectrum IVs' },
      { timestamp: '08:45', seconds: 525, title: 'Zeroing the Arterial Line at the 4th Intercostal Phlebostatic Axis' },
      { timestamp: '16:20', seconds: 980, title: 'Smart Infusion Pump DERS Guardrails & Barcode Medication Scan (BCMA)' },
      { timestamp: '22:00', seconds: 1320, title: 'Delegating Vital Signs & I&O Tracking to CNAs & Medical Assistants' }
    ],
    transcript: [
      { timestamp: '00:50', seconds: 50, speaker: 'Evelyn Boateng, BSN, RN', text: 'In the ICU, nurses are the 24/7 defensive radar for the patient. Always draw two sets of blood cultures prior to starting IV piperacillin-tazobactam.' }
    ],
    embeddedProduct: {
      id: 'prod_nih_pubmed_medline',
      name: 'NIH PubMed & CDC Clinical Nursing Guidelines',
      icon: '🧬',
      price: 'Free Federal Portal',
      tagline: 'Evidence-based nursing practice guidelines, sepsis bundles & MEDLINE.',
      trialAvailable: true,
      liveUrl: 'https://pubmed.ncbi.nlm.nih.gov/'
    },
    resources: [
      { type: 'docs', label: 'Live Portal: NIH PubMed Nursing & Critical Care Evidence ↗', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
      { type: 'course', label: 'Live Portal: NIH DailyMed IV Medication Administration Guide ↗', url: 'https://dailymed.nlm.nih.gov/dailymed/' }
    ],
    relatedJobs: [
      { id: 'health_trauma_nurse_1', title: 'Trauma Resuscitation & ICU Charge Nurse (BSN, RN, CCRN)', company: 'Johns Hopkins Medicine', location: 'Baltimore, MD', salary: '$118K - $152K' }
    ]
  },
  {
    id: 'vid_medical_aide_cna',
    title: 'Certified Medical Assistants & Nursing Aides (CCMA, CNA, CPT): 12-Lead ECG, Venipuncture & EHR Triage Flowsheets',
    channelName: 'Samuel Tetteh, CCMA, CNA, CPT',
    channelAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Lead Certified Clinical Medical Assistant & Phlebotomy Instructor · Mount Sinai',
    channelFollowers: '53.8K Followers',
    isVerifiedChannel: true,
    duration: '23:15',
    durationSeconds: 1395,
    views: '64.2K views',
    uploadTimeAgo: '4 days ago',
    category: 'Learning',
    thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'arj7oStGLkU',
    visibility: 'Public',
    description: 'Complete practical field guide for Certified Medical Assistants (CCMA), Certified Nursing Assistants (CNA), Patient Care Technicians (PCT), and Phlebotomists: accurate precordial V1-V6 12-lead ECG placement, CLSI venipuncture order of draw, orthostatic vitals, and OpenEMR/Epic intake documentation.',
    likesCount: 3910,
    commentsCount: 274,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Patient Rooming, Orthostatic Vitals & Early Warning Score Escalation' },
      { timestamp: '06:40', seconds: 400, title: '12-Lead ECG Anatomical Landmarks (V1-V6 Intercostal Placement)' },
      { timestamp: '13:50', seconds: 830, title: 'CLSI Venipuncture Order of Draw (Blood Culture → Blue → Gold → Lavender)' },
      { timestamp: '19:10', seconds: 1150, title: 'Point-of-Care CLIA-Waived A1c/Strep Testing & EHR Flowsheet Entry' }
    ],
    transcript: [
      { timestamp: '00:35', seconds: 35, speaker: 'Samuel Tetteh, CCMA, CNA', text: 'Medical Assistants and CNAs are the frontline eyes and ears of the entire clinical care team. Accurate vitals and medication allergies caught during rooming save lives.' }
    ],
    embeddedProduct: {
      id: 'prod_openemr_hospital_admin',
      name: 'OpenEMR ONC-Certified Clinical Intake & Triage Suite',
      icon: '🏥',
      price: 'Free Live EHR Demo',
      tagline: 'Vital signs flowsheets, ECG/Lab orders, immunization tracking & HL7 FHIR.',
      trialAvailable: true,
      liveUrl: 'https://www.open-emr.org/'
    },
    resources: [
      { type: 'docs', label: 'Live Portal: OpenEMR Clinical Intake & Flowsheet Platform ↗', url: 'https://www.open-emr.org/' },
      { type: 'cert', label: 'Live Portal: MDCalc Pediatric & Orthostatic Vitals Reference ↗', url: 'https://www.mdcalc.com/' }
    ],
    relatedJobs: [
      { id: 'health_medaide_5', title: 'Senior Certified Clinical Medical Assistant & Patient Care Tech (CCMA / CNA)', company: 'Mount Sinai Health System', location: 'New York, NY', salary: '$56K - $72K' }
    ]
  },
  {
    id: 'vid_hospital_admin_command',
    title: 'Medical & Hospital Administration (MHA, FACHE): Inpatient Capacity Command, Joint Commission & Revenue Cycle',
    channelName: 'Richard Danquah, MHA, MBA, FACHE',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Chief Hospital Administrator & VP of Clinical Operations · Mass General Brigham',
    channelFollowers: '61.5K Followers',
    isVerifiedChannel: true,
    duration: '27:50',
    durationSeconds: 1670,
    views: '59.3K views',
    uploadTimeAgo: '5 days ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'UF8uR6Z6KLc',
    visibility: 'Public',
    description: 'Fellow of the American College of Healthcare Executives Richard Danquah (MHA, MBA, FACHE) presents an executive walkthrough of real-time Hospital Bed Capacity Command Centers, nurse-to-patient staffing matrices, Joint Commission (TJC) survey readiness, CMS Star Ratings, and ICD-10/DRG revenue cycle governance.',
    likesCount: 3640,
    commentsCount: 219,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Hospital Capacity Command Center: Eliminating ED Boarding Bottlenecks' },
      { timestamp: '08:15', seconds: 495, title: 'Balancing Nurse, Pharmacist, Physician & CNA Staffing Acuity Ratios' },
      { timestamp: '16:30', seconds: 990, title: 'Joint Commission Accreditation, CMS Star Ratings & HIPAA 45 CFR § 164.312' },
      { timestamp: '22:45', seconds: 1365, title: 'ICD-10-CM/PCS Coding, MS-DRG Case Mix Index & 340B Pharmacy Compliance' }
    ],
    transcript: [
      { timestamp: '00:45', seconds: 45, speaker: 'Richard Danquah, MHA, FACHE', text: 'When medical administrators align pharmacy verification turnaround, environmental bed turnover, and nursing discharge lounges, ED boarding drops by over 30%.' }
    ],
    embeddedProduct: {
      id: 'prod_openemr_hospital_admin',
      name: 'OpenEMR & HL7 FHIR Hospital Administration & Revenue Cycle Suite',
      icon: '🏥',
      price: 'Free Live Portal',
      tagline: 'Inpatient bed census, ICD-10/CPT claims clearinghouse & HIPAA audit controls.',
      trialAvailable: true,
      liveUrl: 'https://www.open-emr.org/'
    },
    resources: [
      { type: 'docs', label: 'Live Portal: OpenEMR Hospital Practice & Revenue Cycle ↗', url: 'https://www.open-emr.org/' },
      { type: 'whitepaper', label: 'Live Portal: OpenFDA Hospital Recall & Risk Surveillance ↗', url: 'https://open.fda.gov/' }
    ],
    relatedJobs: [
      { id: 'health_medadmin_6', title: 'Vice President of Hospital Operations & Medical Administration (MHA, FACHE)', company: 'Mass General Brigham', location: 'Boston, MA', salary: '$210K - $275K' }
    ]
  },
  {
    id: 'vid_pelvic_orif',
    title: 'Orthopedic Trauma Masterclass: Unstable Pelvic Ring Reconstruction & Anterior Column ORIF',
    channelName: 'Dr. Angela Vance, MD, FACS',
    channelAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Chief of Orthopedic Trauma Surgery · Level 1 Trauma Center',
    channelFollowers: '62.4K Followers',
    isVerifiedChannel: true,
    duration: '34:20',
    durationSeconds: 2060,
    views: '71.5K views',
    uploadTimeAgo: '4 days ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'hN2e7_A1kBw',
    visibility: 'Public',
    description: 'Dr. Angela Vance provides an operative surgical walkthrough of an anterior column and posterior hemitransverse acetabular fracture repair using 3D anatomical templating and anatomical curved reconstruction plates.',
    likesCount: 4210,
    commentsCount: 312,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'Pelvic CT 3D Reconstruction & Fracture Classification' },
      { timestamp: '08:15', seconds: 495, title: 'Ilioinguinal Surgical Approach & Vessel Mobilization' },
      { timestamp: '19:40', seconds: 1180, title: 'Anatomical Reduction Clamp Placement & Fluoroscopy' },
      { timestamp: '28:10', seconds: 1690, title: 'Plate Contouring & 3.5mm Cortical Screw Fixation' }
    ],
    transcript: [
      { timestamp: '00:25', seconds: 25, speaker: 'Dr. Angela Vance', text: 'Welcome colleagues. Today we are addressing a high-energy polytrauma pelvic ring disruption.' },
      { timestamp: '19:45', seconds: 1185, speaker: 'Dr. Angela Vance', text: 'Fluoroscopic inlet and outlet views verify anatomical restoration of the articular surface before permanent screw locking.' }
    ],
    embeddedProduct: {
      id: 'butterfly-iq3',
      name: 'Butterfly iQ3 Handheld Ultrasound',
      icon: '🩺',
      price: '$2,899',
      tagline: 'Whole-body single-probe clinical ultrasound with cloud DICOM.',
      trialAvailable: true,
      liveUrl: 'https://www.mdcalc.com/'
    },
    relatedJobs: [
      { id: 'job_surg_1', title: 'Attending Orthopedic Trauma Surgeon', company: 'Academic Health Network', location: 'Chicago, IL', salary: '$580K - $750K' }
    ]
  }
]

export const AUTOMOTIVE_VIDEOS_DATA: MediaVideoItem[] = [
  {
    id: 'vid_800v_inverter',
    title: '800-Volt EV Powertrain Diagnostics: Silicon Carbide Inverter & Battery Isolation',
    channelName: 'Marcus Miller ASE Master Diagnostics',
    channelAvatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    channelRole: 'World Class Master Tech & L3 Hybrid Diagnostics Lead',
    channelFollowers: '58.7K Followers',
    isVerifiedChannel: true,
    duration: '31:15',
    durationSeconds: 1875,
    views: '63.9K views',
    uploadTimeAgo: '3 days ago',
    category: 'Technical Walkthrough',
    thumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'b7_G-tA5sP0',
    visibility: 'Public',
    description: 'Marcus Miller demonstrates high-voltage CAT IV 1000V de-energization, capacitor discharge verification, and oscilloscope diagnosis of Silicon Carbide (SiC) PWM gate driver circuits on commercial EV powertrains.',
    likesCount: 3890,
    commentsCount: 245,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'NFPA 70E High-Voltage PPE & Proving Dead' },
      { timestamp: '08:45', seconds: 525, title: 'Manual Service Disconnect (MSD) Lockout' },
      { timestamp: '17:20', seconds: 1040, title: 'Oscilloscope Differential Voltage on Gate Drivers' },
      { timestamp: '26:00', seconds: 1560, title: 'Resolving Intermittent High-Voltage Isolation DTCs' }
    ],
    transcript: [
      { timestamp: '00:35', seconds: 35, speaker: 'Marcus Miller', text: 'Safety first: we always test our multimeter on a known live source before and after probing the 800V DC bus.' },
      { timestamp: '17:30', seconds: 1050, speaker: 'Marcus Miller', text: 'Observe this gate-driver ring-down waveform: excessive ringing indicates gate resistance breakdown.' }
    ],
    embeddedProduct: {
      id: 'snap-on-zeus-plus',
      name: 'Snap-on ZEUS+ Diagnostic Workstation',
      icon: '⚡',
      price: '$14,995',
      tagline: 'Flagship automotive scan tool with 4-channel high-speed scope.',
      trialAvailable: false
    },
    relatedJobs: [
      { id: 'job_auto_1', title: 'ASE Master EV Diagnostic Specialist', company: 'Rivian Fleet Services', location: 'Austin, TX', salary: '$110K - $145K' }
    ]
  },
  {
    id: 'vid_canfd_pico',
    title: 'CAN-FD Physical Layer Signal Troubleshooting with 4-Channel PicoScope',
    channelName: 'Automotive Electronics Lab',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    channelRole: 'Master Scope Instructor · Advanced Multiplex Networks',
    channelFollowers: '39.4K Followers',
    isVerifiedChannel: true,
    duration: '26:40',
    durationSeconds: 1600,
    views: '44.3K views',
    uploadTimeAgo: '1 week ago',
    category: 'Learning',
    thumbnail: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1000&auto=format&fit=crop&q=80',
    youtubeId: 'r-qQ_5jX8c0',
    visibility: 'Public',
    description: 'Diagnosing CAN-FD baud rate transitions, termination resistance reflections, and terminal pin fretting on central gateway body control modules.',
    likesCount: 2310,
    commentsCount: 118,
    chapters: [
      { timestamp: '00:00', seconds: 0, title: 'CAN Classic vs CAN Flexible Data-Rate Waveforms' },
      { timestamp: '09:10', seconds: 550, title: 'Probing DLC Pins 6 and 14 with Math Channels' },
      { timestamp: '18:30', seconds: 1110, title: 'Locating 120-Ohm Terminating Resistor Failure' }
    ],
    transcript: [
      { timestamp: '00:50', seconds: 50, speaker: 'Kenji Sato', text: 'When CAN-FD shifts into the 5 Mbps data phase, any harness defect creates impedance reflections that corrupt the CRC.' }
    ]
  }
]

export const TRADES_PODCASTS_DATA: PodcastShow[] = [
  {
    id: 'show_timber_guild',
    title: 'The Master Builder Podcast: Heavy Timber, Joinery & Modern Construction',
    tagline: 'Deep-dive conversations on mass timber architecture, traditional joinery, OSHA safety, and job-site mastery.',
    hostName: 'David Miller',
    hostRole: 'Master Carpenter & Timber Frame Guild Director',
    hostAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    category: 'Leadership & CISO',
    subscribersCount: '28.4K Subscribers',
    rating: '4.98 ★',
    reviewsCount: 290,
    totalEpisodes: 19,
    isMonetized: true,
    monthlyMembershipPrice: '$12 / mo (Blueprint Downloads & Tool Drawings)',
    episodes: []
  }
]

export const HEALTHCARE_PODCASTS_DATA: PodcastShow[] = [
  {
    id: 'show_trauma_rounds',
    title: 'Interdisciplinary Grand Rounds: Pharmacy, Medicine, Nursing, Medical Aides & Hospital Command',
    tagline: 'Evidence-based clinical discussions uniting Clinical Pharmacists (PharmD), Attending Physicians (MD), ICU Nurses (RN), Medical Assistants (CCMA/CNA), and Hospital Administrators (MHA).',
    hostName: 'Dr. Kwame Mensah, PharmD, BCPS & Dr. Sophia Chen, MD, FACP',
    hostRole: 'Director of Clinical Pharmacy & Chief of Internal Medicine',
    hostAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    category: 'Leadership & CISO',
    subscribersCount: '68.4K Subscribers',
    rating: '4.99 ★',
    reviewsCount: 742,
    totalEpisodes: 28,
    isMonetized: true,
    monthlyMembershipPrice: '$19 / mo (ACPE / AMA PRA Category 1 / ANCC CE Credits)',
    episodes: [
      {
        id: 'ep_health_1',
        showId: 'show_trauma_rounds',
        title: 'Episode 28: Closed-Loop Sepsis & Medication Safety — From CNA Vitals Triage to Pharmacy AUC Dosing & ICU Nursing',
        seasonNumber: 2,
        episodeNumber: 28,
        duration: '44:15',
        durationSeconds: 2655,
        releaseDate: 'October 25, 2026',
        listensCount: '39.4K Listens',
        rating: '4.99 ★',
        isVideoPodcast: true,
        videoThumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1000&auto=format&fit=crop&q=80',
        description: 'How Medical Assistants and CNAs flagging early tachypnea during rooming, Attending Physicians ordering rapid point-of-care lactate, Clinical Pharmacists calculating Bayesian Vancomycin AUC/MIC in NIH DailyMed, and ICU Nurses executing smart-pump BCMA infusions cut sepsis mortality by 29%.',
        guest: {
          name: 'Evelyn Boateng, BSN, RN, CCRN & Richard Danquah, MHA, FACHE',
          role: 'ICU Charge Nurse & Chief Hospital Administrator',
          company: 'Kaiser Permanente & Mass General Brigham',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=200&auto=format&fit=crop&q=80',
          profileId: 'evelyn-boateng-rn'
        },
        chapters: [
          { timestamp: '00:00', seconds: 0, title: 'Frontline Triage: Medical Assistants (CCMA) & CNAs Spotting Early Sepsis' },
          { timestamp: '11:20', seconds: 680, title: 'Physician Diagnostic Workup & MDCalc SOFA Stratification' },
          { timestamp: '23:45', seconds: 1425, title: 'Clinical Pharmacist USP <797> Stat Admixture & Renal Dosing' },
          { timestamp: '34:10', seconds: 2050, title: 'Hospital Administrator Bed Command & CMS SEP-1 Quality Governance' }
        ],
        transcript: [
          { timestamp: '00:40', seconds: 40, speaker: 'Dr. Kwame Mensah, PharmD', text: 'Every minute counts in septic shock. When our CNAs and Medical Assistants immediately escalate abnormal shock index vitals, pharmacy and nursing can deliver broad-spectrum antibiotics within 35 minutes.' },
          { timestamp: '11:30', seconds: 690, speaker: 'Dr. Sophia Chen, MD', text: 'Using MDCalc and NIH DailyMed directly inside our EHR workflow eliminates dosing guesswork across the entire care team.' }
        ],
        connectedEntityGraph: {
          person: { name: 'Dr. Kwame Mensah, PharmD, BCPS', role: 'Director of Clinical Pharmacy', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80' },
          company: { name: 'Johns Hopkins & Mayo Clinic Alliance', tier: 'Verified Academic Medical Center' },
          product: { name: 'NIH DailyMed & MDCalc Clinical Suite (Free Live)', icon: '💊', trialAction: 'Launch Live Portals' },
          job: { title: 'Director of Clinical Pharmacy ($205K) & ICU RN ($152K)', salary: '$152K - $205K', company: 'Johns Hopkins Medicine' },
          course: { title: 'Interdisciplinary Sepsis, USP <797> Pharmacy & ICU Masterclass', badge: 'ACPE / AMA / ANCC CE' }
        }
      }
    ]
  }
]

export const AUTOMOTIVE_PODCASTS_DATA: PodcastShow[] = [
  {
    id: 'show_ase_master',
    title: 'The Master Tech Diagnostic Lab: Oscilloscopes, 800V EV & Powertrains',
    tagline: 'Advanced diagnostic techniques for ASE master technicians, fleet directors, and electric vehicle powertrain engineers.',
    hostName: 'Marcus Miller, ASE Master Tech',
    hostRole: 'World Class Master Tech & L3 Hybrid Diagnostics Lead',
    hostAvatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
    category: 'Leadership & CISO',
    subscribersCount: '32.6K Subscribers',
    rating: '4.97 ★',
    reviewsCount: 340,
    totalEpisodes: 22,
    isMonetized: true,
    monthlyMembershipPrice: '$15 / mo (Waveform Library & DTC Case Studies)',
    episodes: []
  }
]

export function getEnclaveMediaVideos(enclaveId?: string): MediaVideoItem[] {
  if (enclaveId === 'trades_construction') return [...TRADES_VIDEOS_DATA, ...HEALTHCARE_VIDEOS_DATA.slice(0, 2)]
  if (enclaveId === 'healthcare_medicine') return HEALTHCARE_VIDEOS_DATA
  if (enclaveId === 'automotive_mechanics') return [...AUTOMOTIVE_VIDEOS_DATA, ...HEALTHCARE_VIDEOS_DATA.slice(0, 2)]
  return [...HEALTHCARE_VIDEOS_DATA, ...FEATURED_VIDEOS_DATA]
}

export function getEnclavePodcasts(enclaveId?: string): PodcastShow[] {
  if (enclaveId === 'trades_construction') return [...TRADES_PODCASTS_DATA, ...HEALTHCARE_PODCASTS_DATA]
  if (enclaveId === 'healthcare_medicine') return [...HEALTHCARE_PODCASTS_DATA, ...PODCAST_SHOWS_DATA]
  if (enclaveId === 'automotive_mechanics') return [...AUTOMOTIVE_PODCASTS_DATA, ...HEALTHCARE_PODCASTS_DATA]
  return [...HEALTHCARE_PODCASTS_DATA, ...PODCAST_SHOWS_DATA]
}
