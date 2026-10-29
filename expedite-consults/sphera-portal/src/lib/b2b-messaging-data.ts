import { PROFESSION_ENCLAVES } from "./connectin-professions"

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
  /** Full ISO time the message was sent; used to keep conversations in time order. */
  createdAtIso?: string
  attachments?: { name: string; type: string; url?: string }[]
}

export interface B2BConversationThread {
  id: string
  professionEnclave?: string
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

export const TRADES_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_trade_people_gus',
    professionEnclave: 'trades_construction',
    channelType: 'People',
    subType: 'DM',
    title: 'Gus Vandermeer, PE',
    subtitle: 'Cascade Structural Engineering · Timber Bent Specialist',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🌲',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'The PE-stamped engineering calculation packet for the 40-foot Douglas Fir bents is ready for crane pick.',
    lastMessageTime: '5m ago',
    messages: [
      {
        id: 'm_trade_4',
        sender: {
          id: 'gus_pe',
          name: 'Gus Vandermeer, PE',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
          role: 'Principal Structural Wood Engineer',
          isVerified: true
        },
        text: 'PE calculations for the 40-foot Douglas Fir bents are stamped. Drawbore white-oak peg shear capacity is rated at 4,200 lbs per mortise-and-tenon joint.',
        timestamp: '18m ago',
        attachments: [{ name: 'Douglas_Fir_40ft_Bent_PE_Stamped_Specs.pdf', type: 'PDF Blueprint' }]
      },
      {
        id: 'm_trade_4b',
        sender: {
          id: 'me',
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
          role: 'Master Tradesman & Superintendent'
        },
        text: 'Received the stamped drawings, Gus! Our rigging crew has the spreader bar set for tomorrow morning’s 7:00 AM crane pick.',
        timestamp: '5m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_builder',
    professionEnclave: 'trades_construction',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Markus Thorne (Turner & Skanska Mass Timber)',
    subtitle: 'Commercial Framing & Craft Superintendent Search',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'We are reviewing your portfolio for the Lead Mass Timber Superintendent role ($125k–$155k + Per Diem).',
    lastMessageTime: '22m ago',
    companyMetadata: {
      companyName: 'Turner & Skanska Mass Timber Alliance',
      industry: 'Commercial Construction & Craft',
      openJobsCount: 14
    },
    messages: [
      {
        id: 'm_trade_3',
        sender: {
          id: 'recruiter_markus',
          name: 'Markus Thorne',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          role: 'Senior Craft & Superintendent Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Hello! We have an upcoming 14-story Cross-Laminated Timber (CLT) commercial tower and need a Lead Timber Superintendent ($125k–$155k + $140/day per diem). Your OSHA 30 and heavy timber bents background is a top match. Are you open to a quick site briefing call?',
        timestamp: '22m ago'
      }
    ]
  },
  {
    id: 'thread_prod_festool',
    professionEnclave: 'trades_construction',
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
      vendorName: 'Festool Commercial Pro',
      price: '$1,650',
      licenseType: 'Pro Commercial Kit + 3-Yr Jobsite Warranty',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_trade_1',
        sender: {
          id: 'me',
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
          role: 'Master Carpenter'
        },
        text: 'Can you confirm if the XL mortiser includes the 14mm carbide cutter and cross-stop pins for heavy timber bents?',
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
        text: 'Yes! The commercial kit includes the 14mm carbide cutter, cross stop, trim stop accessory, and Systainer³ case. Your job-site shipment tracking is activated.',
        timestamp: '10m ago'
      }
    ]
  },
  {
    id: 'thread_comm_timber',
    professionEnclave: 'trades_construction',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'Timber Framing, Electrical & MEP Master Guild',
    subtitle: '3,240 Master Craftsmen · Job-Site Methods Channel',
    avatar: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🌐',
    unreadCount: 2,
    lastMessage: 'Frank: Has anyone checked the moisture meter readings on the coastal Douglas Fir shipment?',
    lastMessageTime: '8m ago',
    communityMetadata: {
      membersCount: 3240,
      topic: 'Mortise & tenon joinery, NEC 2026 conduit fill, AWS 6G welding & crane lift safety'
    },
    messages: [
      {
        id: 'm_trade_5',
        sender: {
          id: 'frank_gc',
          name: 'Frank Gallagher (Site Superintendent)',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          role: 'Construction Superintendent'
        },
        text: 'Has anyone checked the Wagner pinless moisture meter readings on the coastal Douglas Fir shipment? Ours tested at 13.5% across the core — ready for layout and joinery.',
        timestamp: '8m ago'
      }
    ]
  }
]

export const HEALTHCARE_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_people_elena_nurse',
    professionEnclave: 'healthcare_medicine',
    channelType: 'People',
    subType: 'DM',
    title: 'Elena Rostova, RN, CCRN',
    subtitle: 'Trauma Resuscitation Nurse Lead · Level 1 Shock Trauma',
    avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🩸',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Level 1 trauma transfer incoming. Belmont RI-2 rapid infuser primed with low-titer O whole blood.',
    lastMessageTime: '6m ago',
    messages: [
      {
        id: 'm_hm_4',
        sender: {
          id: 'elena_rn',
          name: 'Elena Rostova, RN, CCRN',
          avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
          role: 'Trauma Resuscitation Nurse Lead',
          isVerified: true
        },
        text: 'MedEvac flight team dispatched for unstable pelvic fracture. Blood bank released 4 units low-titer O-whole blood and Belmont RI-2 rapid infuser is on standby in Trauma Bay 1.',
        timestamp: '6m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_hospital',
    professionEnclave: 'healthcare_medicine',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Patricia Morales (Johns Hopkins & MGH Clinical Search)',
    subtitle: 'Academic Surgical & Critical Care Staffing Lead',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'We have an open Attending Trauma & Critical Care leadership role ($480k–$690k + Academic Chair).',
    lastMessageTime: '35m ago',
    companyMetadata: {
      companyName: 'Johns Hopkins & Mass General Clinical Network',
      industry: 'Academic Medicine & Level 1 Trauma',
      openJobsCount: 28
    },
    messages: [
      {
        id: 'm_hm_3',
        sender: {
          id: 'recruiter_patricia',
          name: 'Patricia Morales',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
          role: 'Academic Clinical Faculty Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'Our Level 1 Trauma Center is expanding our Surgical & Critical Care service ($480k–$690k base + RVU incentive). We would love to schedule a Grand Rounds & faculty leadership briefing with you.',
        timestamp: '35m ago'
      }
    ]
  },
  {
    id: 'thread_prod_butterfly',
    professionEnclave: 'healthcare_medicine',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'Butterfly iQ3 & Stryker Surgical Desk',
    subtitle: 'Point-of-Care Ultrasound Systems & Hospital PACS Telemetry',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🩺',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Your Butterfly iQ3 clinical license key with Hospital Cloud DICOM auto-sync is now active.',
    lastMessageTime: '15m ago',
    productMetadata: {
      productName: 'Butterfly iQ3 Point-of-Care Ultrasound',
      vendorName: 'Butterfly Network Clinical',
      price: '$2,899',
      licenseType: 'Institutional HIPAA DICOM Edition',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_hm_1',
        sender: {
          id: 'me',
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
          role: 'Attending Clinician'
        },
        text: 'Does the iQ3 firmware upgrade support eFAST trauma presets and Biplane needle guidance with Epic PACS sync?',
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
        text: 'Yes! The iQ3 includes dedicated eFAST trauma presets, Biplane vascular access needle tracking, and automatic HL7/DICOM archive push to Epic.',
        timestamp: '15m ago'
      }
    ]
  },
  {
    id: 'thread_comm_trauma_board',
    professionEnclave: 'healthcare_medicine',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'Level 1 Trauma, ICU & Clinical Case Board',
    subtitle: '6,410 Verified Physicians, Surgeons, RNs & Dentists',
    avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🏥',
    unreadCount: 2,
    lastMessage: 'Dr. Chen: Updated viscoelastic TEG-guided massive transfusion ratios posted for review.',
    lastMessageTime: '14m ago',
    communityMetadata: {
      membersCount: 6410,
      topic: 'ATLS resuscitation, ECMO cannulation, orthopedic fixation & clinical trials'
    },
    messages: [
      {
        id: 'm_hm_5',
        sender: {
          id: 'dr_chen',
          name: 'Dr. Raymond Chen, MD, FACS',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80',
          role: 'Chief of Trauma Surgery'
        },
        text: 'Colleagues, I just uploaded our updated TEG-guided 1:1:1 Massive Transfusion Protocol and REBOA Zone 1 deployment outcomes from Q3.',
        timestamp: '14m ago'
      }
    ]
  }
]

export const AUTOMOTIVE_MESSAGING_THREADS: B2BConversationThread[] = [
  {
    id: 'thread_auto_people_foreman',
    professionEnclave: 'automotive_mechanics',
    channelType: 'People',
    subType: 'DM',
    title: 'Carlos Mendez (ASE L1/L3 Master Diagnostic Lead)',
    subtitle: '800V EV Powertrain & CAN-FD Waveform Specialist',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🔧',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Check Channel B on the PicoScope capture — the rear SiC inverter gate driver had a 12V reference drop.',
    lastMessageTime: '11m ago',
    messages: [
      {
        id: 'm_am_0',
        sender: {
          id: 'carlos_l3',
          name: 'Carlos Mendez, ASE L1/L3',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
          role: 'Master Diagnostic Lead',
          isVerified: true
        },
        text: 'I uploaded the 4-channel PicoScope waveform from the 800V dual-motor pack. Notice the CAN-FD dominant low glitch right when the HV contactor closes.',
        timestamp: '11m ago'
      }
    ]
  },
  {
    id: 'thread_comp_recruiter_rivian',
    professionEnclave: 'automotive_mechanics',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Tony DeLuca (Rivian & Penske Service Talent Lead)',
    subtitle: 'High-Voltage EV & Master Technician Staffing',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Seeking an ASE Master L3 EV & Diagnostic Foreman ($125k–$165k + Flag Guarantee).',
    lastMessageTime: '2h ago',
    companyMetadata: {
      companyName: 'Rivian & Penske Service Operations',
      industry: 'Automotive & 800V EV Fleet',
      openJobsCount: 19
    },
    messages: [
      {
        id: 'm_am_3',
        sender: {
          id: 'recruiter_tony',
          name: 'Tony DeLuca',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          role: 'EV & Fleet Technical Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'We are staffing our flagship EV & diagnostic service center and need an ASE Master L1/L3 Shop Foreman ($125k–$165k + equity + tool relocation allowance). Would you be open to a quick call?',
        timestamp: '2h ago'
      }
    ]
  },
  {
    id: 'thread_prod_snapon',
    professionEnclave: 'automotive_mechanics',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'Snap-on ZEUS+ & PicoScope Equipment Desk',
    subtitle: 'Diagnostic Scopes, J2534 Pass-Thru & ADAS Calibration',
    avatar: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '⚡',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'Your Snap-on ZEUS+ workstation firmware update with CAN-FD decoding is ready for install.',
    lastMessageTime: '20m ago',
    productMetadata: {
      productName: 'Snap-on ZEUS+ & PicoScope 4425A EV Kit',
      vendorName: 'Snap-on Diagnostics',
      price: '$11,495',
      licenseType: 'Master Shop Diagnostic Station',
      directProductLink: '/marketplace'
    },
    messages: [
      {
        id: 'm_am_1',
        sender: {
          id: 'me',
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
          role: 'ASE Master Technician'
        },
        text: 'Does the 2026.2 software release include guided high-voltage inverter test plans and 1000V insulation test logs?',
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
        text: 'Yes! Release 2026.2 includes step-by-step NFPA 70E Live-Dead-Live de-energization flows and Cummins/Detroit DPF regen overrides.',
        timestamp: '20m ago'
      }
    ]
  },
  {
    id: 'thread_comm_ase_guild',
    professionEnclave: 'automotive_mechanics',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'ASE Master Techs, EV High-Voltage & Heavy Diesel Guild',
    subtitle: '4,150 Master Technicians · Waveform & Tear-Down Exchange',
    avatar: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🔩',
    unreadCount: 2,
    lastMessage: 'Dave: Shared the J2534 pass-thru calibration sequence for Bosch radar alignment.',
    lastMessageTime: '9m ago',
    communityMetadata: {
      membersCount: 4150,
      topic: 'CAN-FD bus diagnostics, 800V EV battery service, and Cummins X15 SCR troubleshooting'
    },
    messages: [
      {
        id: 'm_am_5',
        sender: {
          id: 'dave_tech',
          name: 'Dave Kowalski (Shop Foreman)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          role: 'ASE World Class Tech'
        },
        text: 'Just posted the Autel IA900 static optical target distances for the 2026 millimeter-wave front radar calibration.',
        timestamp: '9m ago'
      }
    ]
  }
]

export const B2B_MESSAGING_THREADS_DATA: B2BConversationThread[] = [
  {
    id: 'thread_people_elena',
    professionEnclave: 'tech_cybersecurity',
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
    id: 'thread_comp_recruiter_northrop',
    professionEnclave: 'tech_cybersecurity',
    channelType: 'Companies',
    subType: 'Recruiter',
    title: 'Sarah Jenkins (Palantir & Northrop Defense Talent Lead)',
    subtitle: 'Lead Technical Recruiter · Defense & Cyber Mission Systems',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '💼',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 1,
    lastMessage: 'Your zero-trust & eBPF credentials look exceptional for our Principal Architect role ($210k–$285k).',
    lastMessageTime: '1h ago',
    companyMetadata: {
      companyName: 'Palantir & Northrop Grumman Defense',
      industry: 'Defense & Cybersecurity',
      openJobsCount: 42
    },
    messages: [
      {
        id: 'm_3',
        sender: {
          id: 'recruiter_sarah',
          name: 'Sarah Jenkins',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
          role: 'Lead Defense Technical Recruiter',
          isCompany: true,
          isVerified: true
        },
        text: 'I saw your recent publication on Cilium eBPF mesh security and your verified ConnectIn Peer Review score. We are currently recruiting for a Principal Security Architect ($210k–$285k TC). Would you be open to an executive briefing call this Thursday?',
        timestamp: '1h ago'
      }
    ]
  },
  {
    id: 'thread_prod_axiom',
    professionEnclave: 'tech_cybersecurity',
    channelType: 'Products',
    subType: 'Product Inquiry',
    title: 'AXIOM AI-Powered Cyber Suite (Vendor Desk)',
    subtitle: 'Expedite Consults Core Labs · Enterprise Security Software',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    badgeIcon: '🛡️',
    isVerified: true,
    onlineStatus: 'online',
    unreadCount: 0,
    lastMessage: 'AXIOM has native FedRAMP High Ready deployment templates for AWS GovCloud...',
    lastMessageTime: '5m ago',
    productMetadata: {
      productName: 'AXIOM AI Suite & Expedite Launchpad',
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
          name: 'You',
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
        text: 'Yes! AXIOM has native FedRAMP High Ready deployment templates for AWS GovCloud with FIPS 140-3 enclave isolation and exports OSCAL JSON machine-readable evidence directly for continuous ATO audits.',
        timestamp: '5m ago'
      }
    ]
  },
  {
    id: 'thread_community_zt_guild',
    professionEnclave: 'tech_cybersecurity',
    channelType: 'Communities',
    subType: 'Community Chat',
    title: 'Zero Trust, Cloud Security & AI Red-Team Guild',
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
          role: 'VP of Security Engineering'
        },
        text: 'Who has benchmarked Cilium ClusterMesh on Graviton4 vs AMD Genoa? We saw 18% lower socket latency on ARM64.',
        timestamp: '12m ago'
      }
    ]
  }
]

interface EnclaveConversationBlueprint {
  enclaveId: string
  dmName: string
  dmRole: string
  dmAvatar: string
  dmText: string
  recruiterName: string
  recruiterCompany: string
  recruiterRoleTitle: string
  recruiterSalary: string
  vendorDeskName: string
  vendorProduct: string
  vendorPrice: string
  vendorLicense: string
  vendorReply: string
  guildName: string
  guildTopic: string
  guildMemberMsg: string
  quickReplies: {
    People: string[]
    Companies: string[]
    Products: string[]
    Communities: string[]
  }
}

const ENCLAVE_BLUEPRINTS: Record<string, EnclaveConversationBlueprint> = {
  agriculture_natural_resources: {
    enclaveId: 'agriculture_natural_resources',
    dmName: 'Dr. Caleb Hendrickson, CCA',
    dmRole: 'Senior Precision Agronomist · Midwest Soil & Yield Lab',
    dmAvatar: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format&fit=crop&q=80',
    dmText: 'The variable-rate nitrogen prescription map and NDVI drone orthomosaic for Section 14 are uploaded to Operations Center.',
    recruiterName: 'Hannah Sterling (Corteva & John Deere Talent Lead)',
    recruiterCompany: 'Corteva Agriscience & John Deere ISG',
    recruiterRoleTitle: 'Senior Precision Agronomy & Autonomous RTK Lead',
    recruiterSalary: '$110k–$145k + Field Vehicle',
    vendorDeskName: 'John Deere Operations Center & RTK Desk',
    vendorProduct: 'StarFire 7000 RTK & See & Spray™ Telemetry Suite',
    vendorPrice: '$4,200 / season',
    vendorLicense: 'Sub-Inch RTK Fleet License',
    vendorReply: 'Your StarFire 7000 RTK differential correction activation and ISOBUS combine yield calibration files are live.',
    guildName: 'Precision Agronomy, Ranching & Forestry Guild',
    guildTopic: 'Soil cec analytics, rotational grazing, RTK guidance & timber cruising',
    guildMemberMsg: 'Has anyone compared variable-rate seeding emergence rates on no-till cover crop strips this season?',
    quickReplies: {
      People: ['Thanks! I loaded the shapefile into the tractor terminal.', 'Can you share the soil grid nitrate test results?'],
      Companies: ['I would love to discuss the Precision Agronomy Lead role this week.', 'Please send over the territory spec and compensation breakdown.'],
      Products: ['Please activate the 14-day StarFire RTK fleet demo.', 'Does this include ISOBUS 11783 prescription sync?'],
      Communities: ['We saw 9% higher emergence using variable-rate downforce.', 'Sharing our soil moisture probe telemetry logs now.']
    }
  },
  personal_services_wellness: {
    enclaveId: 'personal_services_wellness',
    dmName: 'julian Vance, CSCS, DPT',
    dmRole: 'Director of Sports Performance & Biomechanics',
    dmAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80',
    dmText: 'Updated the post-ACL return-to-sport force-plate asymmetry protocol and client velocity blocks for Monday.',
    recruiterName: 'Lauren Camille (Equinox & Ulta Flagship Talent)',
    recruiterCompany: 'Equinox Tier X & Luxury Studio Group',
    recruiterRoleTitle: 'Studio Director / Master Performance & Wellness Lead',
    recruiterSalary: '$98k–$145k + Performance Bonus',
    vendorDeskName: 'Boulevard & VALD ForceDecks Studio Desk',
    vendorProduct: 'VALD ForceDecks Dual Force Plate & Studio CRM',
    vendorPrice: '$299 / mo',
    vendorLicense: 'Multi-Chair / Performance Clinic Pro',
    vendorReply: 'Your client booking retention automation and biometric assessment dashboard are provisioned and active.',
    guildName: 'Master Stylists, CSCS Coaches & Physical Therapy Guild',
    guildTopic: 'Color chemistry, strength periodization, DPT manual rehab & client retention',
    guildMemberMsg: 'What booking deposit workflow has given your studio the lowest no-show rate on weekend appointments?',
    quickReplies: {
      People: ['Reviewed the force-plate progression — looks ready for Monday.', 'Let’s sync on the client hypertrophy block at 2 PM.'],
      Companies: ['I am available for a flagship studio tour and interview this Thursday.', 'Can you share the commission tier and bonus structure?'],
      Products: ['Please enable the automated SMS appointment reminder workflow.', 'Can we add 4 additional practitioner seats?'],
      Communities: ['Requiring a 25% card-on-file hold cut our no-shows to under 1.5%.', 'Happy to share our 12-week client onboarding template!']
    }
  },
  culinary_hospitality_events: {
    enclaveId: 'culinary_hospitality_events',
    dmName: 'Chef Jean-Luc Moreau (Executive Chef)',
    dmRole: 'Culinary Director · Michelin & Luxury Hotel Group',
    dmAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
    dmText: 'The autumn tasting menu costing sheet is locked at 25.4% prime food cost. Dry-aged ribeye purveyor delivery confirmed for 5:30 AM.',
    recruiterName: 'Claire Beaumont (Four Seasons & Marriott Luxury Search)',
    recruiterCompany: 'Four Seasons & Marriott Luxury Collection',
    recruiterRoleTitle: 'Executive Chef & Director of Culinary Operations',
    recruiterSalary: '$140k–$185k + Executive Bonus',
    vendorDeskName: 'Rational iCombi Pro & Opera Cloud PMS Desk',
    vendorProduct: 'Rational iCombi Pro Kitchen Telemetry & HACCP Suite',
    vendorPrice: '$1,850 / unit',
    vendorLicense: 'Commercial Brigade & HACCP Automated Log',
    vendorReply: 'Your walk-in cooler wireless HACCP temperature sensors and banquet BEO prep sheets are synced.',
    guildName: 'Executive Chefs, Hotel GMs & Event Directors Guild',
    guildTopic: 'Sub-28% food cost engineering, Forbes 5-Star service, RevPAR & 1,000-guest BEOs',
    guildMemberMsg: 'How is everyone structuring prep brigade shifts for back-to-back 600-cover Saturday gala banquets?',
    quickReplies: {
      People: ['Menu costing approved! Let’s brief the sous-chefs before 4 PM service.', 'Confirmed the purveyor invoice and HACCP logs.'],
      Companies: ['I would be honored to schedule an executive tasting and interview.', 'Please share the F&B outlet scope and banquet volume.'],
      Products: ['Please export our monthly HACCP digital temperature audit report.', 'Can we schedule a kitchen equipment demo?'],
      Communities: ['We stagger garde-manger and pastry prep 6 hours ahead with blast-chiller staging.', 'Sharing our BEO plating timeline sheet!']
    }
  },
  commerce_small_business: {
    enclaveId: 'commerce_small_business',
    dmName: 'Richard Sterling, CCIM',
    dmRole: 'Senior Managing Director · Industrial & Retail Capital Markets',
    dmAvatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    dmText: 'The ARGUS cash-flow underwriting and 6.4% cap-rate sensitivity model for the 180,000 sq. ft. logistics center are ready.',
    recruiterName: 'Victoria Grant (CBRE & Costco Executive Search)',
    recruiterCompany: 'CBRE Capital Markets & Multi-Unit Retail Ops',
    recruiterRoleTitle: 'VP Commercial Real Estate & Regional Operations Director',
    recruiterSalary: '$155k–$280k Total Comp',
    vendorDeskName: 'CoStar, ARGUS & NetSuite Omnichannel Desk',
    vendorProduct: 'ARGUS Enterprise & NetSuite Multi-Unit ERP',
    vendorPrice: '$590 / mo',
    vendorLicense: 'Commercial Portfolio & Supply Chain Edition',
    vendorReply: 'Your 10-year DCF lease rollover model and 3PL warehouse SKU velocity feed are live.',
    guildName: 'Commercial Realtors, Multi-Unit Operators & Supply Chain Guild',
    guildTopic: 'NNN cap rates, 1031 exchanges, retail EBITDA margins & freight forwarding',
    guildMemberMsg: 'Seeing strong tenant absorption in cold-storage and last-mile flex industrial spaces this quarter.',
    quickReplies: {
      People: ['Underwriting looks solid — sending the LOI to the institutional buyer today.', 'Can we run a sensitivity table at 6.75% exit cap?'],
      Companies: ['Let’s schedule an executive call to review the regional portfolio.', 'Happy to share my multi-unit P&L track record.'],
      Products: ['Please sync the CoStar comp feed with our ARGUS model.', 'Can we enable real-time 3PL inventory alerts?'],
      Communities: ['Last-mile industrial under 50k sq. ft. is leasing in under 30 days in our market.', 'Agreed — NNN industrial renewals are up 14%.']
    }
  },
  creative_media_arts: {
    enclaveId: 'creative_media_arts',
    dmName: ' Maya Lin-Vance (Supervising Producer & Colorist)',
    dmRole: 'Lead Post-Production Showrunner · 8K HDR & Dolby Atmos',
    dmAvatar: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=100&auto=format&fit=crop&q=80',
    dmText: 'Uploaded the DaVinci Resolve 16-bit ACES color reel and Dolby Atmos 7.1.4 master stem to Frame.io.',
    recruiterName: 'Jordan Vance (Netflix, Spotify & Sorenson Talent Lead)',
    recruiterCompany: 'Netflix Studios, Adobe & Sorenson Communications',
    recruiterRoleTitle: 'Senior Producer / Creative Director / NIC ASL Interpreter',
    recruiterSalary: '$145k–$215k / yr',
    vendorDeskName: 'Frame.io, DaVinci Resolve & Avid Pro Tools Desk',
    vendorProduct: 'DaVinci Resolve Studio + Pro Tools HDX Cloud',
    vendorPrice: '$395 / license',
    vendorLicense: 'Studio Mastering & Broadcast Suite',
    vendorReply: 'Your 4K/8K camera-to-cloud proxy workflow and SMPTE timecode review room are active.',
    guildName: 'Directors, Sound Engineers, Designers & ASL Interpreters Guild',
    guildTopic: 'RED/ARRI cinema workflows, Figma design tokens, Dolby Atmos & RID NIC ASL interpreting',
    guildMemberMsg: 'Anyone using camera-to-cloud proxy LUTs directly into DaVinci Resolve live timelines on set?',
    quickReplies: {
      People: ['Reviewed the HDR grade on Frame.io — skin tones and shadow roll-off look incredible!', 'Stems are locked at -14 LUFS for broadcast delivery.'],
      Companies: ['I would love to share my latest production reel and schedule a call.', 'Available this week for a creative director / interpreting briefing.'],
      Products: ['Please provision 5 additional Frame.io review seats for our editors.', 'Does this include Dolby Atmos Renderer 7.1.4 support?'],
      Communities: ['Camera-to-cloud proxies saved our documentary edit bay 6 hours per shoot day!', 'Happy to share our Figma token JSON export pipeline.']
    }
  },
  education_workforce: {
    enclaveId: 'education_workforce',
    dmName: 'Prof. Alistair Finch, Ph.D.',
    dmRole: 'Department Chair & NSF Principal Investigator',
    dmAvatar: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=100&auto=format&fit=crop&q=80',
    dmText: 'The $1.8M NSF curriculum & workforce grant proposal and ABET accreditation syllabus packet passed committee review!',
    recruiterName: 'Dr. Simone Carter (Academic & CTE Faculty Search)',
    recruiterCompany: 'MIT / BASIS STEM / Lincoln Tech Workforce Alliance',
    recruiterRoleTitle: 'Faculty Professor, STEM Lead & Master Trade Instructor',
    recruiterSalary: '$105k–$195k / yr',
    vendorDeskName: 'Canvas LMS & Labster Virtual STEM Lab Desk',
    vendorProduct: 'Canvas Enterprise LMS + NCCER / STEM Lab Suite',
    vendorPrice: '$1,200 / dept',
    vendorLicense: 'Accredited University & CTE Campus License',
    vendorReply: 'Your automated rubric grading, IEP differentiation modules, and hands-on lab safety checklists are live.',
    guildName: 'University Faculty, K-12 STEM & CTE Trade Instructors Guild',
    guildTopic: 'NSF/NIH grants, AP STEM pedagogy, IEP accommodations & NCCER apprentice labs',
    guildMemberMsg: 'How are fellow departments integrating AI literacy and hands-on capstone verification this semester?',
    quickReplies: {
      People: ['Wonderful news on the NSF grant! I will finalize the budget justification today.', 'Syllabus and lab safety rubrics are uploaded.'],
      Companies: ['I would be delighted to schedule a faculty teaching demonstration and interview.', 'Please share the research startup package and course load.'],
      Products: ['Please import our ABET & NCCER competency rubrics into the LMS.', 'Can we enable student portfolio export?'],
      Communities: ['Oral defense + live lab practicums have worked brilliantly for our capstone students.', 'Sharing our project-based STEM rubric template!']
    }
  },
  community_civic_security: {
    enclaveId: 'community_civic_security',
    dmName: 'Commander Robert Vance, CEM (Ret. USMC)',
    dmRole: 'Emergency Operations Director · NIMS ICS-400 Incident Commander',
    dmAvatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=100&auto=format&fit=crop&q=80',
    dmText: 'The joint Emergency Operations Center (EOC) Continuity of Operations Plan (COOP) and mutual-aid comms matrix are green.',
    recruiterName: 'Col. Dana Holloway (DoD SkillBridge & Protective Services)',
    recruiterCompany: 'Hiring Our Heroes, FEMA & Allied Universal Executive Protection',
    recruiterRoleTitle: 'Emergency Management Director / Veterans Ops / VP Security (CPP)',
    recruiterSalary: '$125k–$175k / yr',
    vendorDeskName: 'WebEOC & Genetec GSOC Command Desk',
    vendorProduct: 'WebEOC Incident Command & GSOC Threat Intelligence',
    vendorPrice: '$850 / mo',
    vendorLicense: 'Municipal & Corporate GSOC Enterprise',
    vendorReply: 'Your multi-agency GIS situational awareness feed and executive travel risk alerts are active.',
    guildName: 'Public Safety, Veterans Transition & ASIS CPP Security Guild',
    guildTopic: 'FEMA ICS-300/400, DoD SkillBridge fellowships, executive protection & GSOC ops',
    guildMemberMsg: 'Fellow veterans: sharing our MOS-to-Corporate Operations Director resume translation guide!',
    quickReplies: {
      People: ['Copy that, Commander. Mutual-aid frequency check and EOC staffing roster are locked.', 'Reviewed the COOP annexes — ready for the tabletop exercise.'],
      Companies: ['I am a transitioning veteran / cleared leader and would love to schedule a briefing.', 'Please share the GSOC / emergency management scope.'],
      Products: ['Please enable real-time NOAA/FEMA GIS overlays on our WebEOC dashboard.', 'Can we export the ICS-201 incident briefing packet?'],
      Communities: ['DoD SkillBridge was a game-changer for our transitioning NCOs and officers.', 'Happy to mentor anyone preparing for the ASIS CPP board exam!']
    }
  },
  campus_students: {
    enclaveId: 'campus_students',
    dmName: 'Dr. Priya Nair (University Fellowship Advisor)',
    dmRole: 'Director of Undergraduate Research & Early Career Placements',
    dmAvatar: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    dmText: 'Your capstone project repository and research poster abstract received top marks from the faculty review panel!',
    recruiterName: 'Evan Chen (Google, NASA Pathways & Microsoft University Recruiting)',
    recruiterCompany: 'Google Early Career, NASA JPL & Microsoft Aspire',
    recruiterRoleTitle: '2026 Summer Intern / STEM Research Fellow / New Grad Rotational',
    recruiterSalary: '$115k–$148k (or $58/hr + Housing Stipend)',
    vendorDeskName: 'Expedite CareerSuite™ Student & Capstone Desk',
    vendorProduct: 'CareerSuite ATS Resume Tailor + GitHub Capstone Verifier',
    vendorPrice: 'Free for Verified Students',
    vendorLicense: 'University & Early Career Edition',
    vendorReply: 'Your ATS-optimized student resume and technical interview prep flashcards are ready in the Resume Prep App.',
    guildName: 'Internships, Research Fellows & Class of 2026/2027 Guild',
    guildTopic: 'Return offers, technical interviews, NASA/NSF fellowships & new-grad rotational cohorts',
    guildMemberMsg: 'Just received my full-time return offer after completing my summer engineering internship! Happy to review resumes.',
    quickReplies: {
      People: ['Thank you so much, Dr. Nair! Excited to present at the symposium on Friday.', 'I just updated my capstone GitHub link and slides.'],
      Companies: ['I would love to schedule my first-round university recruiting interview!', 'Attached my transcript, capstone portfolio, and tailored resume.'],
      Products: ['Can you run an ATS keyword check on my New Grad resume?', 'Launching the Resume Prep App now!'],
      Communities: ['Congrats on the return offer! What technical interview topics came up most?', 'Would love feedback on my capstone project portfolio!']
    }
  },
  tech_software: {
    enclaveId: 'tech_software',
    dmName: 'Linus Vestergaard (Principal Systems Architect)',
    dmRole: 'Staff Distributed Systems & Rust/Next.js 16 Lead',
    dmAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    dmText: 'Merged your PR! Moving the streaming SSR cache and vLLM tool-calling router to Rust cut p99 latency from 140ms to 19ms.',
    recruiterName: 'Chloe Zhang (Vercel, OpenAI & Stripe Staff Engineering Search)',
    recruiterCompany: 'Vercel, OpenAI & Stripe Core Infrastructure',
    recruiterRoleTitle: 'Staff Full-Stack / AI Systems / Distributed Ledger Engineer',
    recruiterSalary: '$220k–$340k + Equity',
    vendorDeskName: 'Expedite Launchpad & Vercel Enterprise Desk',
    vendorProduct: 'Expedite Ecosystem Launchpad & Multi-Agent MCP SDK',
    vendorPrice: '$299 / mo',
    vendorLicense: 'Enterprise Engineering Team License',
    vendorReply: 'Your multi-region Kubernetes edge deployment and MCP agent tool-calling endpoints are provisioned.',
    guildName: 'Distributed Systems, Next.js 16 & AI/ML Engineers Guild',
    guildTopic: 'Rust/Go microservices, PyTorch vLLM inference, React 19 Server Actions & Kubernetes SRE',
    guildMemberMsg: 'Benchmarked Next.js 16 Turbopack incremental builds on our 400k-LOC monorepo — cold start is 4.2x faster.',
    quickReplies: {
      People: ['Awesome latency win! Let’s roll out canary traffic to 25% of regions.', 'Pushed the updated OpenTelemetry traces for the router.'],
      Companies: ['I’d love to chat about the Staff AI / Distributed Systems role this week.', 'Happy to share my GitHub architecture docs and system design portfolio.'],
      Products: ['Please provision an enterprise sandbox key for our engineering team.', 'Does the SDK support streaming MCP tool calls?'],
      Communities: ['Turbopack HMR on large monorepos has been a massive productivity boost.', 'Sharing our vLLM quantization benchmark script!']
    }
  },
  law_gov_defense: {
    enclaveId: 'law_gov_defense',
    dmName: 'Jonathan Vance, JD, CISSP-ISSAP',
    dmRole: 'Managing Partner — Federal Procurement, FAR/DFARS & Cyber Law',
    dmAvatar: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=100&auto=format&fit=crop&q=80',
    dmText: 'The eMASS Continuous ATO package (NIST SP 800-53 Rev 5) and DFARS 252.204-7012 compliance memo are signed.',
    recruiterName: 'Margaret Sterling (Booz Allen & Lockheed Martin Cleared Search)',
    recruiterCompany: 'Booz Allen Hamilton & Lockheed Martin Legal/Defense',
    recruiterRoleTitle: 'Principal DoD RMF Architect (TS/SCI) / Senior Corporate Counsel (JD)',
    recruiterSalary: '$185k–$275k + Clearance Bonus',
    vendorDeskName: 'Xacta 360 & PDFAdore Legal Document Desk',
    vendorProduct: 'eMASS / OSCAL Automation & PDFAdore Legal Redaction Suite',
    vendorPrice: '$650 / mo',
    vendorLicense: 'FedRAMP High / DoD IL5-IL6 Ready',
    vendorReply: 'Your automated System Security Plan (SSP), POA&M generator, and Bates-stamped PDF legal bundle are ready.',
    guildName: 'Cleared Defense Contractors, RMF Assessors & Corporate Counsel Guild',
    guildTopic: 'NIST 800-53 Rev 5, CMMC 2.0 Level 3, FAR/DFARS bid protests & USAJOBS GS-15 ECQs',
    guildMemberMsg: 'What timelines are fellow ISSOs seeing for DoD IL5 reciprocity reviews in eMASS this quarter?',
    quickReplies: {
      People: ['Received the signed DFARS memo and SSP package — submitting to the Authorizing Official today.', 'Let’s review the POA&M milestones at 11 AM.'],
      Companies: ['My TS/SCI clearance and CISSP/Bar credentials are active — happy to schedule a briefing.', 'Please share the contract vehicle and clearance requirements.'],
      Products: ['Please export the NIST 800-53 Rev 5 control traceability matrix in OSCAL JSON.', 'Can we batch-redact privileged exhibits in PDFAdore?'],
      Communities: ['OSCAL machine-readable SSPs cut our 3PAO assessment review time by 40%.', 'Happy to share our USAJOBS GS-15 ECQ narrative checklist!']
    }
  },
  finance_accounting: {
    enclaveId: 'finance_accounting',
    dmName: 'Victoria Chen, CPA, CFA',
    dmRole: 'VP Corporate Controller & M&A Valuation Director',
    dmAvatar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&auto=format&fit=crop&q=80',
    dmText: 'Q3 multi-entity GAAP consolidation, ASC 606 revenue schedules, and the 3-statement LBO debt waterfall model are reconciled.',
    recruiterName: 'Arthur Pendelton (JPMorgan, BlackRock & Deloitte Executive Search)',
    recruiterCompany: 'JPMorgan Chase, BlackRock & Deloitte Advisory',
    recruiterRoleTitle: 'VP Corporate Controller (CPA) / Private Equity VP (CFA) / FP&A Director',
    recruiterSalary: '$190k–$320k + Performance Bonus',
    vendorDeskName: 'Bloomberg Terminal, Workiva SEC & Anaplan Desk',
    vendorProduct: 'Workiva SEC 10-K/10-Q & Anaplan Strategic FP&A Suite',
    vendorPrice: '$790 / mo',
    vendorLicense: 'SOX 404 Audited Enterprise License',
    vendorReply: 'Your automated SOX 404 internal control sign-off matrix and live ERP general ledger sync are active.',
    guildName: 'CPAs, CFA Charterholders, Controllers & Private Equity Guild',
    guildTopic: 'US GAAP / IFRS close, SOX 404 audits, LBO/DCF valuation & SaaS ARR unit economics',
    guildMemberMsg: 'How are fellow controllers automating ASC 842 lease accounting and multi-currency FX eliminations during month-end close?',
    quickReplies: {
      People: ['Reconciliation ties out to the penny — ready for Audit Committee sign-off.', 'Can you send the EBITDA bridge and working capital peg tab?'],
      Companies: ['I hold an active CPA / CFA and would be glad to discuss the leadership role.', 'Please send the fund size / controllership scope and compensation details.'],
      Products: ['Please enable automated SOX 404 audit trail exports for our external auditors.', 'Can we sync NetSuite GL actuals into the Anaplan rolling forecast?'],
      Communities: ['Automated intercompany eliminations shaved 3 full days off our global month-end close.', 'Sharing our SaaS Rule-of-40 and NRR cohort board template!']
    }
  },
  manufacturing_industrial: {
    enclaveId: 'manufacturing_industrial',
    dmName: 'Klaus Weber (Master 5-Axis CNC & Toolmaker)',
    dmRole: 'Lead Precision Machinist · AS9100D & Zeiss CMM Metrology',
    dmAvatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=80',
    dmText: 'First-article inspection (FAI) on the Inconel 718 impeller passed Zeiss CMM at ±0.0002" true position. Mastercam G-code post is locked.',
    recruiterName: 'Hannah Vance (Siemens, Honeywell & DMG MORI Talent Lead)',
    recruiterCompany: 'Siemens Industrial Automation & DMG MORI',
    recruiterRoleTitle: 'Master 5-Axis CNC Programmer / PLC Mechatronics Lead',
    recruiterSalary: '$112k–$155k + Overtime & Shift Premium',
    vendorDeskName: 'Mastercam, Siemens Sinumerik & Zeiss CMM Desk',
    vendorProduct: 'Mastercam 2026 5-Axis Suite + Rockwell Studio 5000',
    vendorPrice: '$480 / mo',
    vendorLicense: 'AS9100D Shop-Floor Production License',
    vendorReply: 'Your 5-axis collision-avoidance kinematic post-processor and SCADA OPC-UA telemetry tags are active.',
    guildName: 'CNC Machinists, Tool & Die Makers & PLC Robotics Guild',
    guildTopic: '5-axis simultaneous toolpaths, GD&T Y14.5, Allen-Bradley PLCs & Six Sigma',
    guildMemberMsg: 'What trochoidal milling feed rates are fellow machinists running on Titanium Ti-6Al-4V thin-wall pockets?',
    quickReplies: {
      People: ['Awesome CMM report! Loading the pallet changer for the 50-piece production run now.', 'Can you share the Mastercam tool library file?'],
      Companies: ['I hold NIMS Master CNC & Rockwell PLC credentials — happy to schedule a shop walkthrough.', 'Please share the shift structure and overtime policy.'],
      Products: ['Please send the Sinumerik 840D 5-axis post-processor update.', 'Does this include Zeiss Calypso STEP-NC import?'],
      Communities: ['High-efficiency milling at 8% radial engagement doubled our carbide endmill life on Ti-6Al-4V.', 'Sharing our AS9102 First Article Inspection template!']
    }
  },
  energy_utilities_environment: {
    enclaveId: 'energy_utilities_environment',
    dmName: 'Henrik Lindqvist (GWO Offshore Wind & Substation Lead)',
    dmRole: 'High-Voltage 400kV Commissioning & Turbine Controls Specialist',
    dmAvatar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&auto=format&fit=crop&q=80',
    dmText: 'Completed SF6 switchgear dissolved-gas analysis and nacelle yaw converter commissioning on Turbine Array B-14.',
    recruiterName: 'Elena Rostova (Ørsted, NextEra & Rio Tinto Talent Search)',
    recruiterCompany: 'Ørsted Offshore Wind, NextEra & Rio Tinto',
    recruiterRoleTitle: 'Lead Wind Turbine Technician / Substation Relay Engineer / Mine Safety Lead',
    recruiterSalary: '$118k–$168k + Offshore Rotation Bonus',
    vendorDeskName: 'OMICRON Relay, SCADA EMS & Surpac Mine Desk',
    vendorProduct: 'OMICRON CMC 356 Protection Suite + SCADA DNP3 EMS',
    vendorPrice: '$620 / mo',
    vendorLicense: 'NERC CIP Grid & Utility Field License',
    vendorReply: 'Your IEC 61850 GOOSE relay test profiles and BESS battery rack thermal telemetry dashboard are synced.',
    guildName: 'Grid Linemen, Wind/Solar Techs, Miners & Water Operators Guild',
    guildTopic: 'GWO blade repair, NABCEP PV microgrids, MSHA mine safety & Grade IV water plants',
    guildMemberMsg: 'How are fellow utility crews managing NERC CIP cold-weather readiness on 230kV transformer bushings?',
    quickReplies: {
      People: ['Substation protection settings verified — ready to energize Feeder 12.', 'Received the SCADA historian logs and LOTO permit.'],
      Companies: ['My GWO / NABCEP / MSHA certifications are current — open to discussing the rotation schedule.', 'Please share the site location and per-diem package.'],
      Products: ['Please export the IEC 61850 SCD substation configuration file.', 'Can we add 3 field ruggedized tablets to our SCADA license?'],
      Communities: ['Online partial-discharge monitoring caught two degraded bushings before winter peak load.', 'Sharing our LOTO high-voltage switching checklist!']
    }
  },
  science_laboratory_research: {
    enclaveId: 'science_laboratory_research',
    dmName: 'Dr. Nadia Al-Mansoor (Lead Analytical & GMP Bioprocess Scientist)',
    dmRole: 'Principal HPLC/LC-MS Method Developer & cGMP Cleanroom Lead',
    dmAvatar: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100&auto=format&fit=crop&q=80',
    dmText: 'The 2,000L bioreactor harvest titer hit 6.8 g/L and passed USP <71> sterility and Waters Empower 3 LC-MS purity release!',
    recruiterName: 'Marcus Sterling (Genentech, Thermo Fisher & Eurofins Search)',
    recruiterCompany: 'Genentech, Thermo Fisher Scientific & Eurofins',
    recruiterRoleTitle: 'Senior Biomanufacturing Specialist / Analytical Chemist / Forensic DNA Analyst',
    recruiterSalary: '$105k–$152k + Annual Bonus',
    vendorDeskName: 'Waters Empower 3, LabWare LIMS & Illumina Desk',
    vendorProduct: 'LabWare LIMS v8 + Waters Empower 3 Chromatography Suite',
    vendorPrice: '$540 / mo',
    vendorLicense: 'FDA 21 CFR Part 11 & ISO 17025 Validated',
    vendorReply: 'Your electronic batch record (eBR) audit trail and ICP-MS calibration curve templates are validated.',
    guildName: 'Lab Technicians, Bioprocess Techs, Forensics & Field Scientists Guild',
    guildTopic: 'HPLC/GC-MS troubleshooting, GMP Grade A/B aseptic fill, STR forensics & GIS archaeology',
    guildMemberMsg: 'What column chemistry is giving everyone the best peak resolution on hydrophobic peptide impurities?',
    quickReplies: {
      People: ['Batch record signed in LIMS — releasing the lot to Quality Assurance today.', 'Can you send the LC-MS chromatogram overlay?'],
      Companies: ['I have 6+ years of cGMP & ISO 17025 analytical lab experience — let’s schedule an interview.', 'Please share the lab instrumentation stack and team structure.'],
      Products: ['Please generate the 21 CFR Part 11 electronic signature validation packet.', 'Can we sync our Sartorius bioreactor probes with LabWare LIMS?'],
      Communities: ['Switching to a C18 core-shell 2.7µm column at 45°C cut our run time by 35%.', 'Sharing our ISO 17025 equipment calibration SOP!']
    }
  },
  aviation_aerospace_maritime: {
    enclaveId: 'aviation_aerospace_maritime',
    dmName: 'Capt. Erik Lindholm (FAA A&P / IA & Chief Marine Engineer)',
    dmRole: 'Lead Widebody Line Maintenance & Subsea ROV Operations Director',
    dmAvatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=100&auto=format&fit=crop&q=80',
    dmText: 'GE9X borescope inspection and ARINC 429 flight-control airworthiness release (EASA Form 1 / FAA 8130-3) are signed off for Gate B12.',
    recruiterName: 'Samantha Vance (SpaceX, Delta TechOps & Maersk Talent Lead)',
    recruiterCompany: 'SpaceX, Airbus, Delta TechOps & Maersk Offshore',
    recruiterRoleTitle: 'FAA A&P Avionics Lead / Spacecraft Propulsion Tech / IMCA Commercial Diver',
    recruiterSalary: '$118k–$172k + Flight & Offshore Allowances',
    vendorDeskName: 'AMOS MRO, Garmin G1000 NXi & Kongsberg Maritime Desk',
    vendorProduct: 'Swiss-AS AMOS MRO + Kongsberg Dynamic Positioning Suite',
    vendorPrice: '$690 / mo',
    vendorLicense: 'FAA Part 145 / EASA & IMO Class Approved',
    vendorReply: 'Your digital aircraft technical logbook (eTechLog) and AS9100D torque-wrench calibration sync are live.',
    guildName: 'A&P Mechanics, Avionics, Spacecraft Techs & Maritime Mariners Guild',
    guildTopic: 'FAA A&P/IA & EASA B1/B2, NASA IPC-J-STD-001S, Part 107 LiDAR drones & ADCI diving',
    guildMemberMsg: 'Any fellow A&P/B1 engineers seeing faster turnaround using phased-array ultrasonic NDT on composite wing spars?',
    quickReplies: {
      People: ['Airworthiness release logged — aircraft is cleared for pushback on schedule.', 'Confirmed the orbital tube weld Helium leak-check at 10⁻⁹ sccs.'],
      Companies: ['My FAA A&P with Inspection Authorization (IA) and FCC GROL are active — happy to connect!', 'Please share the hangar base location and shift rotation.'],
      Products: ['Please sync the FAA Airworthiness Directives (AD) feed into our AMOS MRO dashboard.', 'Can we export the EASA Form 1 component release certificates?'],
      Communities: ['Phased-array UT cut our composite fuselage inspection time in half during C-check.', 'Sharing our NASA-STD-8739.4 harness crimping reference sheet!']
    }
  },
  telecom_digital_infrastructure: {
    enclaveId: 'telecom_digital_infrastructure',
    dmName: 'Marcus Thorne (OSP Fiber Splicing, 5G RF & Micro-Soldering Lead)',
    dmRole: 'Principal OTDR Metrology, Hyperscale Data Center & IPC-7711 Rework Specialist',
    dmAvatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&auto=format&fit=crop&q=80',
    dmText: '864-count ribbon fiber trunk spliced with <0.02dB bidirectional OTDR loss; Tier IV data center 100kW liquid-cooled AI rack is online.',
    recruiterName: 'Devon Brooks (Equinix, Crown Castle & TSMC Talent Search)',
    recruiterCompany: 'Equinix, Crown Castle, Corning & iFixit Pro Network',
    recruiterRoleTitle: 'Lead Fiber Splicer / Hyperscale Data Center Tech / PCB Micro-Soldering Specialist',
    recruiterSalary: '$98k–$148k + On-Call & Per-Diem',
    vendorDeskName: 'EXFO OTDR, Fujikura 90S+ & Hakko BGA Rework Desk',
    vendorProduct: 'EXFO FastReporter 3 OTDR Cloud + Schneider EcoStruxure DCIM',
    vendorPrice: '$340 / mo',
    vendorLicense: 'BICSI RCDD & Tier IV Data Center Edition',
    vendorReply: 'Your automated OTDR splice-loss certification reports and 400G/800G OSFP optical power telemetry are live.',
    guildName: 'Fiber Splicers, Tower Climbers, Data Center & PCB Micro-Repair Guild',
    guildTopic: 'Fujikura ribbon splicing, NWSA tower rigging, 800G liquid cooling, BGA micro-soldering & horology',
    guildMemberMsg: 'What splice-loss average are fellow OSP splicers getting on spiderweb ribbon (SWR) 1,728-fiber cables?',
    quickReplies: {
      People: ['OTDR bidirectional traces uploaded — every splice is under 0.03dB.', 'BGA reball and multilayer trace repair passed thermal camera stress test!'],
      Companies: ['I hold FOA CFOT, BICSI, and IPC-7711/7721 certifications — ready to discuss the role.', 'Please share the territory / data center campus and compensation details.'],
      Products: ['Please export the EXFO .sor bidirectional trace bundle in PDF and JSON.', 'Can we add 4 field splicer seats to FastReporter Cloud?'],
      Communities: ['Fujikura 90R12 mass fusion splicer is averaging 0.015dB for our metro ring crew.', 'Sharing our IPC J-STD-001 BGA reflow thermal profile!']
    }
  }
}

function buildThreadsFromBlueprint(bp: EnclaveConversationBlueprint): B2BConversationThread[] {
  return [
    {
      id: `thread_${bp.enclaveId}_people`,
      professionEnclave: bp.enclaveId,
      channelType: 'People',
      subType: 'DM',
      title: bp.dmName,
      subtitle: bp.dmRole,
      avatar: bp.dmAvatar,
      badgeIcon: '💬',
      isVerified: true,
      onlineStatus: 'online',
      unreadCount: 1,
      lastMessage: bp.dmText,
      lastMessageTime: '8m ago',
      messages: [
        {
          id: `msg_${bp.enclaveId}_1`,
          sender: {
            id: `peer_${bp.enclaveId}`,
            name: bp.dmName,
            avatar: bp.dmAvatar,
            role: bp.dmRole,
            isVerified: true
          },
          text: bp.dmText,
          timestamp: '8m ago'
        }
      ]
    },
    {
      id: `thread_${bp.enclaveId}_recruiter`,
      professionEnclave: bp.enclaveId,
      channelType: 'Companies',
      subType: 'Recruiter',
      title: bp.recruiterName,
      subtitle: `Executive Talent Search · ${bp.recruiterCompany}`,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      badgeIcon: '💼',
      isVerified: true,
      onlineStatus: 'online',
      unreadCount: 1,
      lastMessage: `Recruiting for ${bp.recruiterRoleTitle} (${bp.recruiterSalary}). Would love to connect!`,
      lastMessageTime: '32m ago',
      companyMetadata: {
        companyName: bp.recruiterCompany,
        industry: bp.recruiterRoleTitle,
        openJobsCount: 16
      },
      messages: [
        {
          id: `msg_${bp.enclaveId}_2`,
          sender: {
            id: `rec_${bp.enclaveId}`,
            name: bp.recruiterName,
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
            role: 'Executive Talent Lead',
            isCompany: true,
            isVerified: true
          },
          text: `Hello! Your verified ConnectIn credentials stood out to our hiring panel at ${bp.recruiterCompany}. We are currently hiring for a ${bp.recruiterRoleTitle} (${bp.recruiterSalary}). Are you open to an introductory briefing call this week?`,
          timestamp: '32m ago'
        }
      ]
    },
    {
      id: `thread_${bp.enclaveId}_vendor`,
      professionEnclave: bp.enclaveId,
      channelType: 'Products',
      subType: 'Product Inquiry',
      title: bp.vendorDeskName,
      subtitle: `${bp.vendorProduct} · Verified Solutions Desk`,
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      badgeIcon: '⚡',
      isVerified: true,
      onlineStatus: 'online',
      unreadCount: 0,
      lastMessage: bp.vendorReply,
      lastMessageTime: '19m ago',
      productMetadata: {
        productName: bp.vendorProduct,
        vendorName: bp.vendorDeskName,
        price: bp.vendorPrice,
        licenseType: bp.vendorLicense,
        directProductLink: '/marketplace'
      },
      messages: [
        {
          id: `msg_${bp.enclaveId}_3`,
          sender: {
            id: `ven_${bp.enclaveId}`,
            name: bp.vendorDeskName,
            avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
            role: 'Verified Solutions Desk',
            isCompany: true,
            isProduct: true,
            isVerified: true
          },
          text: bp.vendorReply,
          timestamp: '19m ago'
        }
      ]
    },
    {
      id: `thread_${bp.enclaveId}_guild`,
      professionEnclave: bp.enclaveId,
      channelType: 'Communities',
      subType: 'Community Chat',
      title: bp.guildName,
      subtitle: '3,850 Verified Professionals · Active Specialty Guild',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
      badgeIcon: '🌐',
      unreadCount: 2,
      lastMessage: bp.guildMemberMsg,
      lastMessageTime: '12m ago',
      communityMetadata: {
        membersCount: 3850,
        topic: bp.guildTopic
      },
      messages: [
        {
          id: `msg_${bp.enclaveId}_4`,
          sender: {
            id: `guild_member_${bp.enclaveId}`,
            name: 'Verified Guild Lead',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            role: 'Guild Moderator'
          },
          text: bp.guildMemberMsg,
          timestamp: '12m ago'
        }
      ]
    }
  ]
}

export function getEnclaveB2BThreads(enclaveId?: string): B2BConversationThread[] {
  if (!enclaveId || enclaveId === 'all') {
    const all: B2BConversationThread[] = [
      ...TRADES_MESSAGING_THREADS,
      ...HEALTHCARE_MESSAGING_THREADS,
      ...AUTOMOTIVE_MESSAGING_THREADS,
      ...B2B_MESSAGING_THREADS_DATA
    ]
    for (const bp of Object.values(ENCLAVE_BLUEPRINTS)) {
      all.push(...buildThreadsFromBlueprint(bp))
    }
    return all
  }

  if (enclaveId === 'trades_construction') return TRADES_MESSAGING_THREADS
  if (enclaveId === 'healthcare_medicine') return HEALTHCARE_MESSAGING_THREADS
  if (enclaveId === 'automotive_mechanics') return AUTOMOTIVE_MESSAGING_THREADS
  if (enclaveId === 'tech_cybersecurity') return B2B_MESSAGING_THREADS_DATA

  const blueprint = ENCLAVE_BLUEPRINTS[enclaveId]
  if (blueprint) {
    return buildThreadsFromBlueprint(blueprint)
  }

  return TRADES_MESSAGING_THREADS
}

export function getThreadQuickReplies(
  thread: B2BConversationThread,
  enclaveId?: string
): string[] {
  const enc = thread.professionEnclave || enclaveId || 'trades_construction'

  if (enc === 'trades_construction') {
    if (thread.channelType === 'Products') {
      return [
        'Please confirm job-site delivery tracking & warranty registration.',
        'Can you include the 14mm carbide cutter & cross-stop kit quote?'
      ]
    }
    if (thread.channelType === 'Companies') {
      return [
        'I am available for a site superintendent walkthrough this week!',
        'Please share the project schedule, per-diem rate, and crew size.'
      ]
    }
    if (thread.channelType === 'Communities') {
      return [
        'Our moisture meter tested at 12.8% — ready for mortise layout.',
        'Sharing our OSHA 30 crane rigging checklist with the guild!'
      ]
    }
    return [
      'Stamped PE calculations received — rigging crew is ready for 7 AM pick.',
      'Can you send the updated CAD shop drawings for the west elevation?'
    ]
  }

  if (enc === 'healthcare_medicine') {
    if (thread.channelType === 'Products') {
      return [
        'Please enable Epic PACS DICOM auto-archive on our clinical license.',
        'Can we schedule an in-service clinical demo for our trauma bay?'
      ]
    }
    if (thread.channelType === 'Companies') {
      return [
        'I would be glad to schedule a Grand Rounds & clinical faculty call.',
        'Please share the trauma call schedule and RVU compensation tier.'
      ]
    }
    if (thread.channelType === 'Communities') {
      return [
        'Reviewed the updated 1:1:1 MTP protocol — great outcome metrics.',
        'Sharing our perioperative ERAS pathway notes with the board.'
      ]
    }
    return [
      'Patient transfer accepted — Trauma Bay 1 and OR team are scrubbed and ready.',
      'Please page anesthesia and blood bank for immediate standby.'
    ]
  }

  if (enc === 'automotive_mechanics') {
    if (thread.channelType === 'Products') {
      return [
        'Please push the 2026.2 CAN-FD & 800V EV diagnostic update to our bay.',
        'Does this include J2534 OEM pass-thru calibration access?'
      ]
    }
    if (thread.channelType === 'Companies') {
      return [
        'I hold ASE Master A1–A8 & L1/L3 certifications — let’s schedule a call!',
        'What is the flat-rate guarantee and tool relocation allowance?'
      ]
    }
    return [
      'Checked the 4-channel PicoScope waveform — confirmed HV contactor drop.',
      'Sharing the static ADAS radar calibration target specs now.'
    ]
  }

  const bp = ENCLAVE_BLUEPRINTS[enc]
  if (bp && bp.quickReplies[thread.channelType]) {
    return bp.quickReplies[thread.channelType]
  }

  // Default tech_cybersecurity
  if (thread.channelType === 'Products') {
    return [
      'Yes, please generate a 14-day GovCloud trial key!',
      'What is the licensing cost for 500+ enterprise seats?'
    ]
  }
  if (thread.channelType === 'Companies') {
    return [
      "I'd be glad to jump on a briefing call this Thursday!",
      'Please send the architecture role specification and compensation band.'
    ]
  }
  return [
    'Reviewed the technical spec — looks solid and ready to deploy!',
    'Let’s jump on a quick 10-minute huddle to finalize.'
  ]
}
