export interface B2BMessageItem {
  id: string
  sender: {
    id: string
    name: string
    avatar: string
    role: string
    isCompany?: boolean
    isProduct?: boolean
    isVerified?: boolean
  }
  text: string
  timestamp: string
  attachments?: { name: string; type: string; url?: string }[]
}

export interface B2BConversationThread {
  id: string
  channelType: 'People' | 'Companies' | 'Products' | 'Communities'
  subType: 'DM' | 'Group' | 'Recruiter' | 'Vendor' | 'Customer' | 'Product Inquiry' | 'Product Support' | 'Community Chat'
  title: string
  subtitle: string
  avatar: string
  badgeIcon?: string
  isVerified?: boolean
  onlineStatus?: 'online' | 'offline' | 'away'
  unreadCount: number
  lastMessage: string
  lastMessageTime: string
  productMetadata?: {
    productName: string
    vendorName: string
    price: string
    licenseType: string
    directProductLink: string
  }
  companyMetadata?: {
    companyName: string
    industry: string
    openJobsCount?: number
  }
  communityMetadata?: {
    membersCount: number
    topic: string
  }
  messages: B2BMessageItem[]
}

export const B2B_MESSAGING_THREADS_DATA: B2BConversationThread[] = [
  {
    id: 'thread_prod_axiom',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'AXIOM AI-Powered Cyber Suite (Vendor Desk)',
    subtitle: 'Expedite Consults Core Labs · Enterprise Security Software',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🛡️',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Yes Alex! AXIOM has native FedRAMP High Ready deployment templates for AWS GovCloud...',
    lastMessageTime: '5m ago',
    productMetadata: {
      productName: 'AXIOM AI Suite',
      vendorName: 'Expedite Consults',
      price: '$499 / mo',
      licenseType: 'Enterprise Cloud & GovCloud',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_1',
        sender: {
          id: 'me',
          name: 'Alex Taylor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          role: 'Principal Cloud & Security Architect'
        },
        text: "I'd like to know if AXIOM supports AWS GovCloud and automated cATO evidence export.",
        timestamp: '15m ago'
      },
      {
        id: 'm_2',
        sender: {
          id: 'axiom_vendor',
          name: 'AXIOM Technical Sales & Architecture Desk',
          avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
          role: 'Verified Vendor Account',
          isCompany: true,
          isProduct: true,
          isVerified: true
        },
        text: 'Yes Alex! AXIOM has native FedRAMP High Ready deployment templates for AWS GovCloud (US-East & US-West) with FIPS 140-3 cryptographic enclave isolation. It exports OSCAL JSON machine-readable evidence directly for continuous ATO audits. Would you like a 14-day GovCloud trial license key?',
        timestamp: '5m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_northrop',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Sarah Jenkins (Northrop Grumman Talent Lead)',
    subtitle: 'Lead Technical Recruiter · Defense Mission Systems',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Your ISSE and zero-trust credentials look exceptional for our Lead Defense Architect role in DC ($195k–$225k TC).',
    lastMessageTime: '1h ago',
    companyMetadata: {
      companyName: 'Northrop Grumman',
      industry: 'Defense & Aerospace',
      openJobsCount: 42
    },
    messages: [
      {
        id: 'm_3',
        sender: {
          id: 'recruiter_sarah',
          name: 'Sarah Jenkins',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
          role: 'Lead Defense Technical Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Hi Alex! I saw your recent publication on Cilium eBPF mesh security and your verified ConnectIn Peer Review score. We are currently recruiting for a Lead Defense Security Architect in the DC Metro area ($195k–$225k TC with TS/SCI clearance bonus). Would you be open to an executive briefing call this Thursday?',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'thread_people_elena',
    channelType: 'People',
    subType: 'DM',
    title: 'Dr. Elena Rostova',
    subtitle: 'Chief AI Safety Scientist · Stanford AI Labs Fellow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🤖',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'I reviewed your MCP cryptographic nonce module. The Ed25519 signature bounds are solid!',
    lastMessageTime: '3h ago',
    messages: [
      {
        id: 'm_4',
        sender: {
          id: 'elena_rostova',
          name: 'Dr. Elena Rostova',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
          role: 'Chief AI Safety Scientist'
        },
        text: 'I reviewed your MCP cryptographic nonce module in the Peer Review queue. The Ed25519 signature bounds are mathematically solid and prevent secondary semantic injection. Approved with full 10/10 marks!',
        timestamp: '3h ago'
      }
    ]
  },
  {
    id: 'thread_community_zt_guild',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'Zero Trust & Cloud Security Guild',
    subtitle: '4,820 Principal Architects · Active Discussion Channel',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🌐',
    unreadCount: 2,
    lastMessage: 'Marcus: Who has benchmarked Cilium ClusterMesh on Graviton4 vs AMD Genoa?',
    lastMessageTime: '12m ago',
    communityMetadata: {
      membersCount: 4820,
      topic: 'NIST 800-207, eBPF telemetry, and multi-region micro-proxies'
    },
    messages: [
      {
        id: 'm_5',
        sender: {
          id: 'user_marcus',
          name: 'Marcus Vance',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          role: 'VP of Engineering'
        },
        text: 'Who has benchmarked Cilium ClusterMesh on Graviton4 vs AMD Genoa? We saw 18% lower socket latency on ARM64.',
        timestamp: '12m ago'
      }
    ]
  }
]
