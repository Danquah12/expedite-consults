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

export const TRADES_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_prod_festool',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'Festool Commercial Tooling Desk',
    subtitle: 'Precision Woodworking & Festool Direct Support',
    avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🪚',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Your Festool Domino XL DF 700 with the 14mm cutter set has shipped with priority job-site delivery.',
    lastMessageTime: '10m ago',
    productMetadata: {
      productName: 'Festool Domino XL DF 700',
      vendorName: 'Festool USA',
      price: '$1,650',
      licenseType: 'Pro Commercial Kit',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_trade_1',
        sender: {
          id: 'me',
          name: 'David Miller',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
          role: 'Master Carpenter'
        },
        text: 'Can you confirm if the XL mortiser includes the 14mm cutter and systolic stop pins for timber bents?',
        timestamp: '25m ago'
      },
      {
        id: 'm_trade_2',
        sender: {
          id: 'festool_desk',
          name: 'Festool Direct Commercial Support',
          avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&auto=format&fit=crop&q=80',
          role: 'Verified Vendor Account',
          isCompany: true,
          isProduct: true,
          isVerified: true
        },
        text: 'Yes David! The commercial kit includes both the 14mm carbide cutter, cross stop, and trim stop accessory. Your shipment tracking is activated.',
        timestamp: '10m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_builder',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Markus Thorne (Skanska Timberworks Recruiter)',
    subtitle: 'Commercial Framing Superintendent Search',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'We are reviewing your portfolio for the Commercial Framing Lead role in Denver ($115k–$135k).',
    lastMessageTime: '1h ago',
    companyMetadata: {
      companyName: 'Skanska Timberworks',
      industry: 'Commercial Construction',
      openJobsCount: 14
    },
    messages: [
      {
        id: 'm_trade_3',
        sender: {
          id: 'recruiter_markus',
          name: 'Markus Thorne',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          role: 'Senior Construction Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Hello David! We have an upcoming 14-story mass timber commercial tower in Denver and need a Lead Timber Superintendent ($115k–$135k + per diem). Would you be available for a superintendent review call?',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'thread_people_gus',
    channelType: 'People',
    subType: 'DM',
    title: 'Gus Vandermeer, PE',
    subtitle: 'Cascade Structural Engineering · Timber Bent Specialist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🌲',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'The stamped engineering calculation packet for the 40-foot Douglas Fir bents is attached.',
    lastMessageTime: '2h ago',
    messages: [
      {
        id: 'm_trade_4',
        sender: {
          id: 'gus_pe',
          name: 'Gus Vandermeer, PE',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
          role: 'Principal Structural Wood Engineer'
        },
        text: 'David, PE calculations for the 40-foot Douglas Fir bents are stamped. Drawbore shear capacity is rated at 4,200 lbs per joint.',
        timestamp: '2h ago'
      }
    ]
  },
  {
    id: 'thread_comm_timber',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'Timber Framing & Heavy Joinery Guild',
    subtitle: '3,200 Master Craftsmen · Job-Site Methods Channel',
    avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🌐',
    unreadCount: 2,
    lastMessage: 'Frank: Has anyone checked the moisture content on the coastal fir shipment?',
    lastMessageTime: '8m ago',
    communityMetadata: {
      membersCount: 3200,
      topic: 'Mortise & tenon joinery, glulam engineering, and crane lift safety'
    },
    messages: [
      {
        id: 'm_trade_5',
        sender: {
          id: 'frank_gc',
          name: 'Frank Gallagher',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          role: 'Construction Superintendent'
        },
        text: 'Has anyone checked the moisture content on the coastal fir shipment? Ours tested at 13.5% across the core.',
        timestamp: '8m ago'
      }
    ]
  }
]

export const HEALTHCARE_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_prod_butterfly',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'Butterfly Network Clinical Desk',
    subtitle: 'Point-of-Care Ultrasound Systems & Hospital Telemetry',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🩺',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Your Butterfly iQ3 clinical license key with Hospital Cloud DICOM auto-sync is now active.',
    lastMessageTime: '15m ago',
    productMetadata: {
      productName: 'Butterfly iQ3 Ultrasound',
      vendorName: 'Butterfly Network Inc.',
      price: '$2,899',
      licenseType: 'Institutional Clinical Edition',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_hm_1',
        sender: {
          id: 'me',
          name: 'Dr. Angela Vance, MD',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
          role: 'Orthopedic Trauma Surgeon'
        },
        text: 'Does the iQ3 firmware upgrade support intraoperative depth presets for musculoskeletal needle guidance?',
        timestamp: '30m ago'
      },
      {
        id: 'm_hm_2',
        sender: {
          id: 'butterfly_desk',
          name: 'Butterfly Clinical Specialist Desk',
          avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
          role: 'Verified Clinical Vendor',
          isCompany: true,
          isProduct: true,
          isVerified: true
        },
        text: 'Yes Dr. Vance! The MSK preset delivers sub-millimeter needle trajectory tracking with enhanced vascular Doppler.',
        timestamp: '15m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_hospital',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Patricia Morales (Metro Health Physician Recruiter)',
    subtitle: 'Academic Surgical Staffing Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'We have an open Attending Orthopedic Trauma Surgeon role in Boston ($580k–$720k).',
    lastMessageTime: '45m ago',
    companyMetadata: {
      companyName: 'Metro Health Academic Trauma Center',
      industry: 'Hospital & Healthcare',
      openJobsCount: 28
    },
    messages: [
      {
        id: 'm_hm_3',
        sender: {
          id: 'recruiter_patricia',
          name: 'Patricia Morales',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
          role: 'Academic Surgical Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Dr. Vance, our Level 1 Trauma Center is expanding our pelvic and acetabular reconstruction service ($580k–$720k base). We would love to discuss faculty leadership opportunities with you.',
        timestamp: '45m ago'
      }
    ]
  },
  {
    id: 'thread_people_elena_nurse',
    channelType: 'People',
    subType: 'DM',
    title: 'Elena Rostova, RN',
    subtitle: 'Trauma Resuscitation Nurse Lead · Emergency Bay',
    avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🩸',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Level 1 trauma transfer incoming. Belmont rapid infuser primed with whole blood.',
    lastMessageTime: '1h ago',
    messages: [
      {
        id: 'm_hm_4',
        sender: {
          id: 'elena_rn',
          name: 'Elena Rostova, RN',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
          role: 'Trauma Resuscitation Nurse Lead'
        },
        text: 'Dr. Vance, flight team dispatched for unstable pelvic trauma. Blood bank released 4 units low-titer O-whole blood and rapid infuser is on standby in Trauma 1.',
        timestamp: '1h ago'
      }
    ]
  }
]

export const AUTOMOTIVE_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_prod_snapon',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'Snap-on Technical Equipment Desk',
    subtitle: 'Diagnostic Scopes & Workshop Master Stations',
    avatar: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '⚡',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Your Snap-on ZEUS+ workstation firmware update with CAN-FD decoding is ready for install.',
    lastMessageTime: '20m ago',
    productMetadata: {
      productName: 'Snap-on ZEUS+ Workstation',
      vendorName: 'Snap-on Tools',
      price: '$14,995',
      licenseType: 'Master Diagnostic Station',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_am_1',
        sender: {
          id: 'me',
          name: 'Marcus Miller',
          avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
          role: 'ASE Master Tech'
        },
        text: 'Does the 2026.2 software release include guided high-voltage inverter test plans for 800V commercial trucks?',
        timestamp: '40m ago'
      },
      {
        id: 'm_am_2',
        sender: {
          id: 'snapon_desk',
          name: 'Snap-on Diagnostic Technical Specialist',
          avatar: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
          role: 'Verified Vendor Desk',
          isCompany: true,
          isProduct: true,
          isVerified: true
        },
        text: 'Yes Marcus! Release 2026.2 includes step-by-step de-energization flows and CAT IV 1000V safe proving checklists.',
        timestamp: '20m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_rivian',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Tony DeLuca (Rivian Fleet Talent Lead)',
    subtitle: 'Commercial EV Powertrain Staffing',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Seeking an ASE Master L3 EV Diagnostic Specialist for our Midwest fleet hub ($115k–$145k).',
    lastMessageTime: '2h ago',
    companyMetadata: {
      companyName: 'Rivian Commercial Fleet Solutions',
      industry: 'Automotive & EV Fleet',
      openJobsCount: 19
    },
    messages: [
      {
        id: 'm_am_3',
        sender: {
          id: 'recruiter_tony',
          name: 'Tony DeLuca',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          role: 'EV Fleet Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Marcus, we are staffing our flagship commercial fleet maintenance hub in Chicago. We need an ASE Master L3 lead ($115k–$145k + equity). Would you be open to discussing the team lead role?',
        timestamp: '2h ago'
      }
    ]
  }
]

export function getEnclaveB2BThreads(enclaveId?: string): B2BConversationThread[] {
  if (enclaveId === 'trades_construction') return TRADES_MESSAGING_THREADS
  if (enclaveId === 'healthcare_medicine') return HEALTHCARE_MESSAGING_THREADS
  if (enclaveId === 'automotive_mechanics') return AUTOMOTIVE_MESSAGING_THREADS
  return B2B_MESSAGING_THREADS_DATA
}
