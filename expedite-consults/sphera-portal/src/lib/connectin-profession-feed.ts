import { Post, UserProfile } from './connectln-data'
import { ALL_PROFESSIONS, PROFESSION_ENCLAVES } from './connectin-professions'
import { getTieredVideosForUser, resolveProfessionForUser } from './connectin-videos'

interface ProfessionVisualPack {
  actionPhotos: string[]
  peerAuthors: {
    name: string
    rolePrefix: string
    avatar: string
    followersText: string
  }[]
  fieldStoryLead: string
  secondStoryLead: string
  guideTitle: string
}

const PROFESSION_SPECIFIC_PHOTOS: Record<string, string[]> = {
  carpenter: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=1200&auto=format&fit=crop&q=85'
  ],
  finish_carpenter: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=85'
  ],
  cabinetmaker: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=85'
  ],
  electrician: [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=85'
  ],
  plumber: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=85'
  ],
  welder: [
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&auto=format&fit=crop&q=85'
  ],
  hvac_technician: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&auto=format&fit=crop&q=85'
  ],
  general_contractor: [
    'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=85'
  ]
}

const ENCLAVE_VISUAL_PACKS: Record<string, ProfessionVisualPack> = {
  trades_construction: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Caleb Vance',
        rolePrefix: 'Master Guild Lead & Field Inspector',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        followersText: '48,920 followers'
      },
      {
        name: 'Hank Sterling',
        rolePrefix: 'Senior Structural & Field Superintendent',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        followersText: '31,400 followers'
      }
    ],
    fieldStoryLead: 'Precision on the jobsite starts long before the first cut or layout line is struck.',
    secondStoryLead: 'Walking the site with our crew this morning—nothing replaces hands-on craftsmanship and tight tolerances.',
    guideTitle: '7 Field Layout, Safety & Blueprint Execution Standards [Free Guide]'
  },
  automotive_mechanics: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Marcus Vance, ASE-L1',
        rolePrefix: 'Master Diagnostic & Fleet Lead',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        followersText: '29,850 followers'
      },
      {
        name: 'Kenji Sato',
        rolePrefix: 'High-Voltage EV & Powertrain Specialist',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        followersText: '19,420 followers'
      }
    ],
    fieldStoryLead: 'In the bay today running 4-channel oscilloscope waveforms before touching a single wrench.',
    secondStoryLead: 'Shop floor excellence comes down to clean diagnostics, torque specs, and mentoring the next generation of techs.',
    guideTitle: '7 Bay Diagnostic & High-Voltage Shop Workflows [Free Guide]'
  },
  healthcare_medicine: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Dr. Elena Rostova, MD, FACS',
        rolePrefix: 'Chief of Clinical Operations',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
        followersText: '64,110 followers'
      },
      {
        name: 'Maya Lin-Vasquez, BSN, RN',
        rolePrefix: 'Level-1 Trauma & Clinical Charge Lead',
        avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&auto=format&fit=crop&q=80',
        followersText: '42,300 followers'
      }
    ],
    fieldStoryLead: 'On the clinical floor today—clear team communication during rapid handoffs saves lives every single shift.',
    secondStoryLead: 'Bedside precision and calm interdisciplinary coordination remain the foundation of patient outcomes.',
    guideTitle: '7 Clinical Triage, Handoff & Patient Safety Protocols [Free Guide]'
  },
  tech_cybersecurity: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Kwesi Asiedu, CISSP',
        rolePrefix: 'Cybersecurity | RMF Lifecycle & Zero-Trust Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        followersText: '53,400 followers'
      },
      {
        name: 'Marcus Vance, GXPN',
        rolePrefix: 'Principal Offensive Security & SOC Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        followersText: '38,900 followers'
      }
    ],
    fieldStoryLead: 'Inside the SOC war room today validating continuous ATO controls and zero-trust identity boundaries.',
    secondStoryLead: 'Purple-team exercises with our analysts this week proved why identity telemetry beats perimeter assumptions.',
    guideTitle: '7 Zero-Trust RMF & Continuous ATO Defense Controls [Free Guide]'
  },
  tech_software: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Devon Hughes',
        rolePrefix: 'Principal Distributed Systems Architect',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        followersText: '71,200 followers'
      },
      {
        name: 'Priya Nair',
        rolePrefix: 'Staff Platform & AI Reliability Lead',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        followersText: '44,800 followers'
      }
    ],
    fieldStoryLead: 'Whiteboarding distributed state boundaries with the engineering team before shipping to production.',
    secondStoryLead: 'Pair-programming through p99 latency bottlenecks—observability always tells the real story.',
    guideTitle: '7 Production Architecture & High-Reliability Systems Playbook [Free Guide]'
  },
  finance_accounting: {
    actionPhotos: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=85'
    ],
    peerAuthors: [
      {
        name: 'Victoria Sterling, CPA, CFA',
        rolePrefix: 'Managing Partner & Institutional Advisory Lead',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        followersText: '321,003 followers'
      },
      {
        name: 'Arthur Pendelton',
        rolePrefix: 'Senior Wealth & Audit Strategy Director',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        followersText: '89,400 followers'
      }
    ],
    fieldStoryLead: 'Life and markets can be complex—but disciplined capital allocation and audit rigor make the difference.',
    secondStoryLead: 'Reviewing Q4 balance-sheet resilience with our advisory team today.',
    guideTitle: '7 Institutional Capital & Advisory Strategies [Free Guide]'
  }
}

const DEFAULT_VISUAL_PACK: ProfessionVisualPack = {
  actionPhotos: [
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=85'
  ],
  peerAuthors: [
    {
      name: 'Jordan Vance',
      rolePrefix: 'Senior Guild Practitioner & Operations Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      followersText: '42,150 followers'
    },
    {
      name: 'Claire Moreau',
      rolePrefix: 'Director of Professional Field Standards',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      followersText: '28,600 followers'
    }
  ],
  fieldStoryLead: 'Hands-on execution in the field today—sharing real workflows from our team on the ground.',
  secondStoryLead: 'Every master practitioner knows that preparation, clean tooling, and peer standards set the bar.',
  guideTitle: '7 Essential Field Execution & Career Mastery Standards [Free Guide]'
}

/**
 * Generates LinkedIn-style Home Feed posts (playable videos of people doing the profession,
 * full-width photography stories of practitioners at work, and downloadable field guides)
 * strictly tiered to the logged-in user's claimed profession.
 */
export function buildProfessionTieredFeedPosts(user?: UserProfile | null): Post[] {
  const resolvedProf = resolveProfessionForUser(user) || ALL_PROFESSIONS[0]
  const enclave =
    PROFESSION_ENCLAVES.find(e => e.id === (resolvedProf.enclaveId || user?.professionEnclave)) ||
    PROFESSION_ENCLAVES[0]

  const tieredVideos = getTieredVideosForUser({
    professionId: resolvedProf.id,
    profession: user?.profession || resolvedProf.title,
    professionEnclave: enclave.id,
    headline: user?.headline
  })

  const primaryVideo = tieredVideos[0]
  const secondaryVideo = tieredVideos[1] || tieredVideos[0]

  const pack = ENCLAVE_VISUAL_PACKS[enclave.id] || DEFAULT_VISUAL_PACK
  const specificPhotos = PROFESSION_SPECIFIC_PHOTOS[resolvedProf.id] || pack.actionPhotos
  const photo1 = specificPhotos[0] || pack.actionPhotos[0]
  const photo2 = specificPhotos[1] || pack.actionPhotos[1] || pack.actionPhotos[0]

  const profTitle = resolvedProf.title
  const cleanShortTitle = profTitle.split('(')[0].trim()
  const skills = resolvedProf.typicalSkills || ['Field Execution', 'Safety Standards', 'Quality Control', 'Master Craftsmanship']
  const primaryTool = resolvedProf.tools?.[0]
  const secondaryTool = resolvedProf.tools?.[1]
  const hashtags = [
    '#' + cleanShortTitle.replace(/[^a-zA-Z0-9]/g, ''),
    ...skills.slice(0, 3).map(s => '#' + s.replace(/[^a-zA-Z0-9]/g, '')),
    ...(enclave.feedTags || []).slice(0, 1)
  ]

  const peer1 = pack.peerAuthors[0]
  const peer2 = pack.peerAuthors[1] || pack.peerAuthors[0]

  // 1. Tier-1 Primary Video Post: Real Video of Professionals Doing the User's Claimed Profession
  const postVideo1: Post = {
    id: 'post_dstrike_wheel_masterclass',
    professionId: resolvedProf.id,
    professionEnclave: enclave.id,
    targetProfessions: [resolvedProf.id],
    isProfessionTiered: true,
    author: {
      id: `guild_lead_${resolvedProf.id}`,
      name: `${peer1.name}`,
      headline: `Master ${cleanShortTitle} · ${peer1.rolePrefix} (${enclave.shortName})`,
      avatar: peer1.avatar,
      connectionDegree: '1st',
      isFollowing: true,
      followersText: peer1.followersText
    },
    timestamp: '28m · 🌐',
    visibility: 'Public',
    feedCategory: 'for_you',
    feedSubCategory: enclave.shortName,
    content: `🎥 LIVE FROM THE FIELD — ${profTitle} Masterclass: "${primaryVideo.title}"\n\nFor everyone logged in across our ${cleanShortTitle} community today: watch how our crew executes ${skills.slice(0, 3).join(', ')} in real time${primaryTool ? ` using ${primaryTool.name}` : ''}.\n\nKey field benchmarks from today's session:\n• ${primaryVideo.takeaways[0] || skills[0]}\n• ${primaryVideo.takeaways[1] || skills[1]}\n• ${primaryVideo.takeaways[2] || skills[2]}\n\nPress play below to watch the full ${cleanShortTitle} demonstration or share with your crew.`,
    hashtags,
    media: {
      type: 'video',
      url: `https://www.youtube.com/watch?v=${primaryVideo.youtubeId}`,
      youtubeId: primaryVideo.youtubeId,
      thumbnailUrl: `https://i.ytimg.com/vi/${primaryVideo.youtubeId}/hqdefault.jpg`,
      aspectRatio: '16/9',
      title: primaryVideo.title,
      domain: `${enclave.shortName.toUpperCase()} · VERIFIED ${cleanShortTitle.toUpperCase()} STREAM`,
      duration: primaryVideo.duration || '5:12',
      serialPlate: primaryVideo.serialPlate,
      brandName: 'ConnectLn',
      description: primaryVideo.summary,
      takeaways: primaryVideo.takeaways
    },
    stats: {
      likesCount: 418,
      commentsCount: 47,
      repostsCount: 86,
      reactionsBreakdown: {
        like: 255,
        celebrate: 78,
        support: 24,
        love: 31,
        insightful: 30,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: [
      {
        id: `c_prof_v1_${resolvedProf.id}`,
        author: {
          name: peer2.name,
          headline: `${cleanShortTitle} · ${peer2.rolePrefix}`,
          avatar: peer2.avatar,
          connectionDegree: '1st'
        },
        content: `Spot-on demonstration for every practicing ${cleanShortTitle}. The breakdown on ${skills[0] || 'field tolerances'} and ${skills[1] || 'safety checks'} is textbook.`,
        timestamp: '14m ago',
        likesCount: 19
      }
    ]
  }

  // 2. Tier-1 Photo & Story Post + Downloadable Guide (Matches LinkedIn Screenshots 2 & 4)
  const postPhotoGuide: Post = {
    id: `post_prof_photo_guide_${resolvedProf.id}`,
    professionId: resolvedProf.id,
    professionEnclave: enclave.id,
    targetProfessions: [resolvedProf.id],
    isProfessionTiered: true,
    author: {
      id: `guild_institute_${resolvedProf.id}`,
      name: `${cleanShortTitle} Guild & Field Standards`,
      headline: `${peer1.followersText} · Official ${enclave.shortName} Directorate`,
      avatar: peer2.avatar,
      connectionDegree: 'Following',
      isFollowing: true,
      followersText: peer1.followersText,
      isPromoted: false
    },
    timestamp: '45m · 🌐',
    visibility: 'Public',
    feedCategory: 'for_you',
    feedSubCategory: enclave.shortName,
    content: `${pack.fieldStoryLead}\n\nWhether you're leading a ${cleanShortTitle} crew on-site or refining your workflow in ${skills[0] || 'field operations'} and ${skills[1] || 'precision layout'}, having the right specification checklist changes everything. Download our free 2026 ${cleanShortTitle} Field Guide below.`,
    hashtags,
    media: {
      type: 'image',
      url: photo1,
      aspectRatio: '4/3',
      title: `7 ${cleanShortTitle} Field Standards & Execution Tips [Free Guide]`,
      domain: `${resolvedProf.id.replace(/_/g, '')}.connectln.org`,
      submitsText: '142 downloads today',
      overlayTitle: `7 ${cleanShortTitle} Standards`,
      overlaySubtitle: `Mastering ${skills.slice(0, 2).join(' & ')} on Every Job`,
      description: `Verified ${profTitle} field handbook covering ${skills.slice(0, 4).join(', ')}.`,
      downloadGuide: {
        title: `7 ${cleanShortTitle} Field Standards & Execution Tips [Free Guide]`,
        subtitle: `142 fellow ${cleanShortTitle} professionals downloaded this guide`,
        ctaLabel: 'Download',
        fileName: `${resolvedProf.id.toUpperCase()}_2026_Field_Standards_Guide.txt`,
        checklist: [
          `1. Primary Competency Standard: ${skills[0] || 'Precision Layout & Verification'}`,
          `2. Field Execution Protocol: ${skills[1] || 'Tolerance & Calibration Checks'}`,
          `3. Quality & Safety Benchmark: ${skills[2] || 'Inspection & Sign-Off'}`,
          `4. Advanced Craftsmanship: ${skills[3] || 'Workflow Optimization'}`,
          primaryTool
            ? `5. Primary Instrument Setup: ${primaryTool.name} — ${primaryTool.description}`
            : `5. Tooling & Material Readiness Verification`,
          secondaryTool
            ? `6. Secondary System Integration: ${secondaryTool.name} — ${secondaryTool.description}`
            : `6. Crew Handoff & Documentation Checklist`,
          `7. ${enclave.securityClearanceTier} Compliance & Guild Verification Sign-Off`
        ]
      }
    },
    stats: {
      likesCount: 284,
      commentsCount: 32,
      repostsCount: 54,
      reactionsBreakdown: {
        like: 190,
        celebrate: 42,
        support: 18,
        love: 14,
        insightful: 20,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  }

  // 3. Tier-1 Second Video Post: Sibling/Career Video Tied to the User's Claimed Profession
  const postVideo2: Post = {
    id: `post_prof_video_secondary_${resolvedProf.id}`,
    professionId: resolvedProf.id,
    professionEnclave: enclave.id,
    targetProfessions: [resolvedProf.id],
    isProfessionTiered: true,
    author: {
      id: `peer_author_2_${resolvedProf.id}`,
      name: peer2.name,
      headline: `${cleanShortTitle} · ${peer2.rolePrefix}`,
      avatar: peer2.avatar,
      connectionDegree: '2nd',
      isFollowing: false,
      followersText: peer2.followersText
    },
    timestamp: '1h · 🌐',
    visibility: 'Public',
    feedCategory: 'for_you',
    feedSubCategory: enclave.shortName,
    content: `Hands-on ${cleanShortTitle} session from this week's field training: "${secondaryVideo.title}"\n\nWe broke down how experienced ${cleanShortTitle} practitioners approach ${skills.slice(1, 4).join(', ')}${secondaryTool ? ` alongside ${secondaryTool.name}` : ''}. Watch the full walkthrough below and let me know how your team handles this in the field!`,
    hashtags,
    media: {
      type: 'video',
      url: `https://www.youtube.com/watch?v=${secondaryVideo.youtubeId}`,
      youtubeId: secondaryVideo.youtubeId,
      thumbnailUrl: `https://i.ytimg.com/vi/${secondaryVideo.youtubeId}/hqdefault.jpg`,
      aspectRatio: '16/9',
      title: secondaryVideo.title,
      domain: `${enclave.shortName.toUpperCase()} · ${cleanShortTitle.toUpperCase()} FIELD VIDEO`,
      duration: secondaryVideo.duration || '4:48',
      serialPlate: secondaryVideo.serialPlate,
      brandName: 'ConnectLn',
      description: secondaryVideo.summary,
      takeaways: secondaryVideo.takeaways
    },
    stats: {
      likesCount: 196,
      commentsCount: 28,
      repostsCount: 39,
      reactionsBreakdown: {
        like: 128,
        celebrate: 31,
        support: 12,
        love: 10,
        insightful: 15,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  }

  // 4. Tier-1 Second Photo & Story Post: Peer Field Story with People Actively Working (Matches LinkedIn Screenshots 1 & 3)
  const postPhotoStory2: Post = {
    id: `post_prof_story_photo_${resolvedProf.id}`,
    professionId: resolvedProf.id,
    professionEnclave: enclave.id,
    targetProfessions: [resolvedProf.id],
    isProfessionTiered: true,
    author: {
      id: `peer_story_${resolvedProf.id}`,
      name: `${peer1.name}`,
      headline: `Senior ${cleanShortTitle} · ${enclave.shortName}`,
      avatar: peer1.avatar,
      connectionDegree: '3rd',
      isFollowing: false
    },
    timestamp: '2h · 🌐',
    visibility: 'Public',
    feedCategory: 'for_you',
    feedSubCategory: enclave.shortName,
    content: `${pack.secondStoryLead}\n\nToday our ${cleanShortTitle} team completed full verification on ${skills[0] || 'structural layout'} and ${skills[2] || 'quality inspection'}. Proud of the dedication and craftsmanship every person brought to the job today.`,
    hashtags,
    media: {
      type: 'image',
      url: photo2,
      aspectRatio: '16/10',
      overlayTitle: `${cleanShortTitle} in Action: Field Craftsmanship & Precision`,
      title: `${profTitle}: Real-World Execution & Team Standards in 2026`,
      domain: `connectln.org/${resolvedProf.id}`
    },
    stats: {
      likesCount: 312,
      commentsCount: 41,
      repostsCount: 27,
      reactionsBreakdown: {
        like: 210,
        celebrate: 54,
        support: 18,
        love: 20,
        insightful: 10,
        funny: 0
      }
    },
    userReaction: null,
    isSaved: false,
    comments: []
  }

  return [postVideo1, postPhotoGuide, postVideo2, postPhotoStory2]
}
