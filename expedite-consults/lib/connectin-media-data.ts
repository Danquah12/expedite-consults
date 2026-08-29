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
  featuredProduct: {
    name: string
    icon: string
    price: string
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
      { type: 'github', label: 'eBPF Kubernetes YAML Manifests', url: '#' },
      { type: 'cert', label: 'Claim Verified ConnectIn eBPF Badge', url: '#' }
    ]
  }
]

export const MEDIA_CLIPS_DATA: MediaClipItem[] = [
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
  },
  {
    id: 'clip_2',
    title: '60-Second Explanation: What is Model Context Protocol (MCP) Security?',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'Stanford AI Fellow',
    duration: '0:54',
    views: '89.2K',
    likes: '6.4K',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    topic: 'AI Safety & MCP',
    actionType: 'Take Lab',
    actionLabel: 'Launch MCP Sandbox →',
    actionTargetTab: 'labs'
  },
  {
    id: 'clip_3',
    title: 'How to Answer: "How Do You Handle FedRAMP cATO Drift?" in Security Interviews',
    creatorName: 'Marcus Vance',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    creatorRole: 'VP of Defense Engineering',
    duration: '0:59',
    views: '142.1K',
    likes: '11.2K',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80',
    topic: 'Career & Interview Prep',
    actionType: 'View Job',
    actionLabel: 'View $215K+ Roles →',
    actionTargetTab: 'jobs'
  }
]

export const LIVE_STREAMS_DATA: LiveStreamEvent[] = [
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
    featuredProduct: {
      name: 'Expedite Strike ASPM',
      icon: '⚡',
      price: '$499 / mo'
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
