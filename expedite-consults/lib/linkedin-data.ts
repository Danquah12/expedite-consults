export interface UserProfile {
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
    connectionDegree: '1st' | '2nd' | '3rd' | 'Following'
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
  isConnected?: boolean
  isPending?: boolean
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
  {
    id: 'post_product_strike',
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
    id: 'sug_1',
    name: 'Kavita Patel',
    headline: 'Director of Cloud Governance & Zero Trust @ CyberNova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 24,
    mutualName: 'Elena Rostova',
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_2',
    name: 'David Sterling',
    headline: 'Principal AI Security Engineer @ Apex Defense Labs',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 18,
    mutualName: 'Marcus Vance',
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
    isConnected: false,
    isPending: false
  },
  {
    id: 'sug_4',
    name: 'Alexander Novak',
    headline: 'Head of Infrastructure Security @ Quantico Capital',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    mutualConnections: 12,
    mutualName: 'Samantha Wei',
    isConnected: false,
    isPending: false
  }
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
