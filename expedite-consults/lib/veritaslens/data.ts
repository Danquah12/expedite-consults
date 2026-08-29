import { 
  MediaOutlet, 
  NewsCluster, 
  ClaimRecord, 
  KafkaTopicMessage, 
  DLQRecord, 
  TVStationScorecard, 
  SpinComparisonCase, 
  ModelMetrics, 
  KnowledgeGraphNode, 
  KnowledgeGraphEdge 
} from './types';

export const INITIAL_MEDIA_OUTLETS: MediaOutlet[] = [
  {
    id: 'out-reuters',
    name: 'Reuters',
    domain: 'reuters.com',
    biasScore: 0.0,
    biasCategory: 'Center',
    reliabilityScore: 54.2,
    factualityCategory: 'Very_High',
    ownerType: 'Conglomerate',
    ownerName: 'Thomson Reuters Corporation',
    country: 'International / UK / USA',
    description: 'International wire service considered the global gold standard for neutral, raw reporting. Insulated by syndication licensing models.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-ap',
    name: 'Associated Press (AP)',
    domain: 'apnews.com',
    biasScore: -2.93,
    biasCategory: 'Lean_Left',
    reliabilityScore: 52.8,
    factualityCategory: 'Very_High',
    ownerType: 'Independent',
    ownerName: 'The Associated Press (Not-for-profit Cooperative)',
    country: 'USA',
    description: 'Global news cooperative providing primary fact reports to thousands of news organizations worldwide with stellar factual accuracy.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-bbc',
    name: 'BBC News',
    domain: 'bbc.com',
    biasScore: -1.2,
    biasCategory: 'Center',
    reliabilityScore: 51.5,
    factualityCategory: 'Very_High',
    ownerType: 'Public Trust',
    ownerName: 'British Broadcasting Corporation (Royal Charter)',
    country: 'UK',
    description: 'Publicly funded broadcaster insulated from commercial advertisers and partisan click-incentives.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-pbs',
    name: 'PBS NewsHour',
    domain: 'pbs.org',
    biasScore: -1.8,
    biasCategory: 'Center',
    reliabilityScore: 53.1,
    factualityCategory: 'Very_High',
    ownerType: 'Public Trust',
    ownerName: 'Corporation for Public Broadcasting (CPB)',
    country: 'USA',
    description: 'Consistently recognized as one of the most factual, objective, and minimally biased broadcast hours in the United States.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-wsj-news',
    name: 'The Wall Street Journal (News Desk)',
    domain: 'wsj.com',
    biasScore: +1.89,
    biasCategory: 'Center',
    reliabilityScore: 48.33,
    factualityCategory: 'High',
    ownerType: 'Conglomerate',
    ownerName: 'News Corp / Dow Jones',
    country: 'USA',
    description: 'Global benchmark for financial, economic, and political straight-fact journalism, strictly separated from its opinion board.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-nyt-news',
    name: 'The New York Times (News Desk)',
    domain: 'nytimes.com',
    biasScore: -4.01,
    biasCategory: 'Lean_Left',
    reliabilityScore: 47.5,
    factualityCategory: 'High',
    ownerType: 'Conglomerate',
    ownerName: 'The New York Times Company',
    country: 'USA',
    description: 'Premier investigative reporting capabilities with elite fact standards, though topic selection consistently skews center-left.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-npr',
    name: 'NPR (National Public Radio)',
    domain: 'npr.org',
    biasScore: -4.35,
    biasCategory: 'Lean_Left',
    reliabilityScore: 42.87,
    factualityCategory: 'High',
    ownerType: 'Public Trust',
    ownerName: 'National Public Radio, Inc.',
    country: 'USA',
    description: 'Deep-dive investigative journalism with high factual accuracy, though framing of cultural and social issues skews left-of-center.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-nbc',
    name: 'NBC News',
    domain: 'nbcnews.com',
    biasScore: -6.2,
    biasCategory: 'Lean_Left',
    reliabilityScore: 44.1,
    factualityCategory: 'High',
    ownerType: 'Conglomerate',
    ownerName: 'Comcast / NBCUniversal',
    country: 'USA',
    description: 'High factual standards in national reporting, with slight center-left framing in editorial panel selection.',
    brandSafetyRisk: 'Low'
  },
  {
    id: 'out-cnn',
    name: 'CNN (Cable Network & Digital)',
    domain: 'cnn.com',
    biasScore: -9.8,
    biasCategory: 'Left',
    reliabilityScore: 38.6,
    factualityCategory: 'Mixed',
    ownerType: 'Conglomerate',
    ownerName: 'Warner Bros. Discovery',
    country: 'USA',
    description: 'Cable news broadcaster with elevated opinion-to-news ratios during primetime hours and frequent sensational banner phrasing.',
    brandSafetyRisk: 'Medium'
  },
  {
    id: 'out-msnbc',
    name: 'MSNBC',
    domain: 'msnbc.com',
    biasScore: -14.5,
    biasCategory: 'Left',
    reliabilityScore: 31.2,
    factualityCategory: 'Mixed',
    ownerType: 'Conglomerate',
    ownerName: 'Comcast / NBCUniversal',
    country: 'USA',
    description: 'Cable network with an estimated 60% news and 40% opinion commentary; strongly progressive editorial lens and combative panel formats.',
    brandSafetyRisk: 'Medium'
  },
  {
    id: 'out-fox',
    name: 'Fox News (Cable & Digital)',
    domain: 'foxnews.com',
    biasScore: +15.4,
    biasCategory: 'Right',
    reliabilityScore: 30.5,
    factualityCategory: 'Mixed',
    ownerType: 'Conglomerate',
    ownerName: 'Fox Corporation (Murdoch Family)',
    country: 'USA',
    description: 'Cable network with dominant primetime conservative commentary and opinion panels, with high emotional linguistic load.',
    brandSafetyRisk: 'Medium'
  },
  {
    id: 'out-newsmax',
    name: 'Newsmax',
    domain: 'newsmax.com',
    biasScore: +21.2,
    biasCategory: 'Right',
    reliabilityScore: 23.8,
    factualityCategory: 'Low',
    ownerType: 'Private',
    ownerName: 'Newsmax Media (Christopher Ruddy)',
    country: 'USA',
    description: 'Partisan conservative cable and digital outlet with lower verification rigor during polarized election and cultural events.',
    brandSafetyRisk: 'High'
  },
  {
    id: 'out-dailywire',
    name: 'The Daily Wire',
    domain: 'dailywire.com',
    biasScore: +16.35,
    biasCategory: 'Right',
    reliabilityScore: 24.5,
    factualityCategory: 'Mixed',
    ownerType: 'Private',
    ownerName: 'Bentkey Ventures (Shapiro / Boreing)',
    country: 'USA',
    description: 'Conservative digital commentary outlet with culture-war emphasis, emotionally charged headlines, and omission of opposing arguments.',
    brandSafetyRisk: 'High'
  },
  {
    id: 'out-vox',
    name: 'Vox',
    domain: 'vox.com',
    biasScore: -8.75,
    biasCategory: 'Left',
    reliabilityScore: 41.97,
    factualityCategory: 'High',
    ownerType: 'Private',
    ownerName: 'Vox Media',
    country: 'USA',
    description: 'Explanatory journalism using policy data and research, framed consistently from a progressive center-left ideological perspective.',
    brandSafetyRisk: 'Low'
  }
];

export const INITIAL_NEWS_CLUSTERS: NewsCluster[] = [
  {
    id: 'clust-001',
    representativeTitle: 'Tom Homan Warns New York City Officials Over Sanctuary City Enforcement',
    category: 'Politics',
    year: 2026,
    firstReportedAt: '2026-08-24T14:20:00Z',
    leftCoveragePct: 0.0,
    centerCoveragePct: 15.0,
    rightCoveragePct: 85.0,
    totalArticlesCount: 14,
    blindspotType: 'Left_Blindspot',
    asymmetryReason: 'Right-leaning outlets heavily highlighted former ICE director Tom Homan warning municipal leaders of federal immigration authority, while Left-leaning outlets largely bypassed the remarks as conservative rhetoric.',
    rawWireFactSummary: 'Former federal immigration official Tom Homan delivered remarks at a conference stating that federal immigration authorities possess statutory jurisdiction to carry out enforcement actions in New York City regardless of municipal non-cooperation policies.',
    rawWireSource: 'Associated Press',
    articles: [
      {
        id: 'art-101',
        outletId: 'out-fox',
        outletName: 'Fox News',
        title: 'ICE Chief Puts Sanctuary City Politicians on Notice: Federal Law Will Be Enforced in NYC',
        url: 'https://foxnews.com/politics/homan-warns-nyc-sanctuary',
        publishedAt: '2026-08-24T14:30:00Z',
        author: 'Staff Reporter',
        cleanedContent: 'Tom Homan declared that progressive New York politicians will not prevent federal agents from doing their constitutional duty to enforce border laws.',
        lexicalLoad: 0.28,
        sentimentScore: -0.45,
        biasAlignment: 'Right',
        clusterId: 'clust-001',
        primarySubject: 'Tom Homan'
      },
      {
        id: 'art-102',
        outletId: 'out-dailywire',
        outletName: 'The Daily Wire',
        title: 'Homan Tears Into Radical NYC Sanctuary Policies: "We Are Coming to Clean It Up"',
        url: 'https://dailywire.com/news/homan-nyc-sanctuary-crackdown',
        publishedAt: '2026-08-24T15:10:00Z',
        author: 'Editorial Desk',
        cleanedContent: 'Tom Homan shredded city officials who harbor illegal migrants, promising an aggressive lawful enforcement wave across the five boroughs.',
        lexicalLoad: 0.36,
        sentimentScore: -0.65,
        biasAlignment: 'Right',
        clusterId: 'clust-001',
        primarySubject: 'Tom Homan'
      },
      {
        id: 'art-103',
        outletId: 'out-ap',
        outletName: 'Associated Press (AP)',
        title: 'Former ICE Director Homan Reasserts Federal Immigration Authority in New York Address',
        url: 'https://apnews.com/article/homan-nyc-speech-immigration',
        publishedAt: '2026-08-24T16:00:00Z',
        author: 'Sarah Jenkins',
        cleanedContent: 'Speaking at a law enforcement gathering, former acting ICE director Tom Homan stated that federal officers will continue apprehension operations in New York City despite local sanctuary designations.',
        lexicalLoad: 0.04,
        sentimentScore: 0.02,
        biasAlignment: 'Center',
        clusterId: 'clust-001',
        primarySubject: 'Tom Homan'
      }
    ]
  },
  {
    id: 'clust-002',
    representativeTitle: 'Nationwide Surge in ICE Apprehensions Reaches Multi-Year High',
    category: 'Politics',
    year: 2026,
    firstReportedAt: '2026-08-24T11:00:00Z',
    leftCoveragePct: 73.0,
    centerCoveragePct: 18.0,
    rightCoveragePct: 9.0,
    totalArticlesCount: 22,
    blindspotType: 'Right_Blindspot',
    asymmetryReason: 'Left-leaning outlets extensively focused on civil liberties, community anxiety, and humanitarian impact of detention surges, while major national Right-leaning networks preferred to focus on border crossing tallies rather than interior detention conditions.',
    rawWireFactSummary: 'Department of Homeland Security statistical releases confirm that interior immigration apprehensions increased by 23% in the latest fiscal quarter, bringing total monthly detentions to their highest volume since 2021.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-201',
        outletId: 'out-msnbc',
        outletName: 'MSNBC',
        title: 'Surge in ICE Arrests Sparks Humanitarian Panic and Raises Deep Civil Rights Concerns',
        url: 'https://msnbc.com/opinion/ice-arrest-surge-civil-rights',
        publishedAt: '2026-08-24T11:45:00Z',
        author: 'Marcus Cole',
        cleanedContent: 'Aggressive sweep tactics are tearing families apart in immigrant neighborhoods as civil rights watchdogs sound the alarm over inhumane processing protocols.',
        lexicalLoad: 0.32,
        sentimentScore: -0.72,
        biasAlignment: 'Left',
        clusterId: 'clust-002',
        primarySubject: 'ICE Arrests'
      },
      {
        id: 'art-202',
        outletId: 'out-nyt-news',
        outletName: 'The New York Times',
        title: 'ICE Apprehensions Rise Sharply, Straining Municipal Resources and Legal Aid Groups',
        url: 'https://nytimes.com/2026/08/24/us/ice-arrest-statistics.html',
        publishedAt: '2026-08-24T12:30:00Z',
        author: 'Elena Rodriguez',
        cleanedContent: 'Federal detention figures show a 23% jump in interior apprehensions, creating bottleneck delays across regional immigration courts.',
        lexicalLoad: 0.08,
        sentimentScore: -0.21,
        biasAlignment: 'Lean_Left',
        clusterId: 'clust-002',
        primarySubject: 'ICE Arrests'
      },
      {
        id: 'art-203',
        outletId: 'out-reuters',
        outletName: 'Reuters',
        title: 'US Interior Immigration Apprehensions Rise 23% in Latest Quarter, DHS Data Shows',
        url: 'https://reuters.com/world/us/ice-apprehensions-quarterly-data-2026',
        publishedAt: '2026-08-24T13:00:00Z',
        author: 'David Wright',
        cleanedContent: 'Official Department of Homeland Security records indicate interior apprehensions totaled 41,200 individuals over the prior 90-day accounting window.',
        lexicalLoad: 0.02,
        sentimentScore: 0.00,
        biasAlignment: 'Center',
        clusterId: 'clust-002',
        primarySubject: 'ICE Arrests'
      }
    ]
  },
  {
    id: 'clust-003',
    representativeTitle: 'Kyiv Secures €22 Billion Municipal Resilience and Reconstruction Package',
    category: 'Foreign Affairs',
    year: 2026,
    firstReportedAt: '2026-08-23T09:15:00Z',
    leftCoveragePct: 82.0,
    centerCoveragePct: 18.0,
    rightCoveragePct: 0.0,
    totalArticlesCount: 16,
    blindspotType: 'Right_Blindspot',
    asymmetryReason: 'Center-left European and American digital press covered long-term sustainable urban grid rebuilding in Ukraine in detail, whereas conservative outlets prioritized war spending debates and domestic inflation.',
    rawWireFactSummary: 'The Ukrainian National Security and Defense Council approved an international funding blueprint allocating €22 billion toward decentralized energy grids, water filtration, and emergency infrastructure repair.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-301',
        outletId: 'out-vox',
        outletName: 'Vox',
        title: 'Kyiv Secures Vital Green Infrastructure Funds to Support War-Torn Communities',
        url: 'https://vox.com/world/kyiv-resilience-fund-green-transition',
        publishedAt: '2026-08-23T10:00:00Z',
        author: 'Clara Vance',
        cleanedContent: 'The €22B green rebuilding package creates decentralized solar microgrids to guarantee hospital power through winter bombardments.',
        lexicalLoad: 0.22,
        sentimentScore: 0.48,
        biasAlignment: 'Left',
        clusterId: 'clust-003',
        primarySubject: 'Kyiv Resilience Plan'
      },
      {
        id: 'art-302',
        outletId: 'out-reuters',
        outletName: 'Reuters',
        title: 'Ukraine Approves €22 Billion Multi-Year Infrastructure and Energy Resilience Plan',
        url: 'https://reuters.com/world/europe/ukraine-resilience-plan-approved-2026',
        publishedAt: '2026-08-23T10:45:00Z',
        author: 'Anna Kovalenko',
        cleanedContent: 'The security council ratified a framework outlining €22B in partnered loans and grants aimed at winterization and power distribution protection.',
        lexicalLoad: 0.03,
        sentimentScore: 0.05,
        biasAlignment: 'Center',
        clusterId: 'clust-003',
        primarySubject: 'Kyiv Resilience Plan'
      }
    ]
  },
  {
    id: 'clust-004',
    representativeTitle: 'Supreme Court Clears Mail-In Voting Executive Order Injunction with Jackson Dissent',
    category: 'Legal',
    year: 2026,
    firstReportedAt: '2026-08-25T01:10:00Z',
    leftCoveragePct: 48.0,
    centerCoveragePct: 12.0,
    rightCoveragePct: 40.0,
    totalArticlesCount: 38,
    blindspotType: 'Balanced',
    asymmetryReason: 'Both sides covered the Supreme Court order heavily, but framing diverged sharply: progressive outlets spotlighted Justice Jackson’s warning of election chaos, while conservative outlets celebrated an executive victory for voter list integrity.',
    rawWireFactSummary: 'The Supreme Court lifted a preliminary federal injunction in a 6-3 emergency ruling, permitting implementation of executive directives directing the Postal Service regarding pre-approved voter registry verification prior to ballot delivery.',
    rawWireSource: 'Associated Press',
    articles: [
      {
        id: 'art-401',
        outletId: 'out-msnbc',
        outletName: 'MSNBC',
        title: 'Jackson Blasts Conservative Majority for "Needlessly Injecting Chaos" into Elections',
        url: 'https://msnbc.com/scotus/jackson-dissent-mail-in-ballots',
        publishedAt: '2026-08-25T01:30:00Z',
        author: 'Lawrence O’Donnell Team',
        cleanedContent: 'Justice Ketanji Brown Jackson issued a blistering 18-page dissent lambasting the court for gutting mail-in ballot protections weeks before votes are cast.',
        lexicalLoad: 0.34,
        sentimentScore: -0.81,
        biasAlignment: 'Left',
        clusterId: 'clust-004',
        primarySubject: 'Supreme Court Mail-in Order'
      },
      {
        id: 'art-402',
        outletId: 'out-fox',
        outletName: 'Fox News',
        title: 'Supreme Court Clears Trump Mail-In Ballot Security Order in Major Election Integrity Victory',
        url: 'https://foxnews.com/politics/scotus-trump-mail-ballots-ruling',
        publishedAt: '2026-08-25T01:45:00Z',
        author: 'Shannon Bream Team',
        cleanedContent: 'The high court cleared the way for common-sense federal ballot verification protocols after liberal lower judges blocked the executive measure.',
        lexicalLoad: 0.29,
        sentimentScore: 0.62,
        biasAlignment: 'Right',
        clusterId: 'clust-004',
        primarySubject: 'Supreme Court Mail-in Order'
      },
      {
        id: 'art-403',
        outletId: 'out-ap',
        outletName: 'Associated Press',
        title: 'Supreme Court Allows Enforcement of Mail-In Ballot Order as Jackson Pens Dissent',
        url: 'https://apnews.com/scotus-mail-ballots-jackson-dissent',
        publishedAt: '2026-08-25T02:00:00Z',
        author: 'Mark Sherman',
        cleanedContent: 'The Supreme Court on Monday dissolved an injunction against the administration’s mail-in ballot directive over sharp dissents from Justices Jackson, Sotomayor, and Kagan.',
        lexicalLoad: 0.05,
        sentimentScore: -0.05,
        biasAlignment: 'Center',
        clusterId: 'clust-004',
        primarySubject: 'Supreme Court Mail-in Order'
      }
    ]
  },

  // ── 2024 LANDMARK CLUSTERS ──
  {
    id: 'clust-2024-01',
    representativeTitle: 'Presidential Debate Fallout & Biden Campaign Transition to Harris',
    category: 'Politics',
    year: 2024,
    firstReportedAt: '2024-07-21T18:00:00Z',
    leftCoveragePct: 65.0,
    centerCoveragePct: 15.0,
    rightCoveragePct: 20.0,
    totalArticlesCount: 45,
    blindspotType: 'Balanced',
    asymmetryReason: 'Conservative networks had warned of cognitive fatigue for months while progressive media initially dismissed footage as cheap fakes; post-debate, progressive media pivoted swiftly to party unity behind Vice President Harris.',
    rawWireFactSummary: 'President Joe Biden announced he would not seek re-election and endorsed Vice President Kamala Harris, who secured delegate pledges within 48 hours to clinch the Democratic nomination.',
    rawWireSource: 'Associated Press',
    articles: [
      {
        id: 'art-2024-01',
        outletId: 'out-nyt-news',
        outletName: 'The New York Times',
        title: 'Biden Exits 2024 Race in Historic Move, Endorsing Kamala Harris for President',
        url: 'https://nytimes.com/2024/07/21/us/politics/biden-drops-out.html',
        publishedAt: '2024-07-21T18:15:00Z',
        author: 'Peter Baker',
        cleanedContent: 'President Biden ended his reelection bid, yielding to weeks of pressure from party leaders who feared his candidacy would lead to catastrophic losses.',
        lexicalLoad: 0.12,
        sentimentScore: -0.15,
        biasAlignment: 'Lean_Left',
        clusterId: 'clust-2024-01',
        primarySubject: '2024 Election'
      },
      {
        id: 'art-2024-02',
        outletId: 'out-fox',
        outletName: 'Fox News',
        title: 'Biden Bows to Party Coup After Elite Donors and Leaders Force Him from 2024 Ticket',
        url: 'https://foxnews.com/politics/biden-drops-out-party-coup-harris',
        publishedAt: '2024-07-21T18:30:00Z',
        author: 'Fox News Editorial',
        cleanedContent: 'In a stunning admission of weakness, President Biden was forced out of the race following a coordinated rebellion by top party oligarchs and Hollywood donors.',
        lexicalLoad: 0.38,
        sentimentScore: -0.68,
        biasAlignment: 'Right',
        clusterId: 'clust-2024-01',
        primarySubject: '2024 Election'
      },
      {
        id: 'art-2024-03',
        outletId: 'out-ap',
        outletName: 'Associated Press',
        title: 'Biden Drops Out of 2024 Presidential Race and Endorses Kamala Harris',
        url: 'https://apnews.com/article/biden-drops-out-2024-election-harris',
        publishedAt: '2024-07-21T18:05:00Z',
        author: 'Zeke Miller',
        cleanedContent: 'President Joe Biden dropped out of the 2024 race for the White House on Sunday, ending his bid for reelection following a disastrous debate performance.',
        lexicalLoad: 0.04,
        sentimentScore: 0.00,
        biasAlignment: 'Center',
        clusterId: 'clust-2024-01',
        primarySubject: '2024 Election'
      }
    ]
  },
  {
    id: 'clust-2024-02',
    representativeTitle: 'Butler PA Campaign Rally Security Failure & Secret Service Congressional Investigation',
    category: 'Politics',
    year: 2024,
    firstReportedAt: '2024-07-13T22:30:00Z',
    leftCoveragePct: 15.0,
    centerCoveragePct: 15.0,
    rightCoveragePct: 70.0,
    totalArticlesCount: 52,
    blindspotType: 'Left_Blindspot',
    asymmetryReason: 'Conservative media gave continuous live coverage to institutional negligence and security lapses, while progressive networks focused more quickly on condemning political violence and debating assault weapon regulations.',
    rawWireFactSummary: 'A 20-year-old gunman fired multiple rounds from an unsecured AGR building roof 147 yards from the stage at a Butler, Pennsylvania rally, grazing Donald Trump, killing one attendee, and critically injuring two others before being eliminated by counter-snipers.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-2024-11',
        outletId: 'out-dailywire',
        outletName: 'The Daily Wire',
        title: 'Massive Secret Service Incompetence: Unsecured Roof Left Wide Open in Assassination Attempt',
        url: 'https://dailywire.com/news/secret-service-failure-butler-rally',
        publishedAt: '2024-07-14T02:00:00Z',
        author: 'Ben Shapiro Team',
        cleanedContent: 'How was an armed sniper allowed to crawl onto an unobstructed warehouse roof 150 yards from Donald Trump despite multiple rally attendees shouting warnings to police?',
        lexicalLoad: 0.35,
        sentimentScore: -0.85,
        biasAlignment: 'Right',
        clusterId: 'clust-2024-02',
        primarySubject: 'Butler Rally'
      },
      {
        id: 'art-2024-12',
        outletId: 'out-reuters',
        outletName: 'Reuters',
        title: 'US Secret Service Faces Bipartisan Scrutiny Following Assassination Attempt on Trump',
        url: 'https://reuters.com/world/us/trump-rally-shooting-investigation-2024',
        publishedAt: '2024-07-14T03:30:00Z',
        author: 'Sarah N. Lynch',
        cleanedContent: 'Lawmakers demanded emergency oversight hearings after an armed individual accessed a rooftop within rifle range of former President Donald Trump.',
        lexicalLoad: 0.05,
        sentimentScore: -0.15,
        biasAlignment: 'Center',
        clusterId: 'clust-2024-02',
        primarySubject: 'Butler Rally'
      }
    ]
  },

  // ── 2023 LANDMARK CLUSTERS ──
  {
    id: 'clust-2023-01',
    representativeTitle: 'Silicon Valley Bank (SVB) Collapse & $42 Billion Uninsured Deposit Run',
    category: 'Economy',
    year: 2023,
    firstReportedAt: '2023-03-10T16:00:00Z',
    leftCoveragePct: 45.0,
    centerCoveragePct: 20.0,
    rightCoveragePct: 35.0,
    totalArticlesCount: 36,
    blindspotType: 'Balanced',
    asymmetryReason: 'Left-leaning outlets attributed the bank collapse to 2018 banking deregulation and reckless venture capitalists, while conservative outlets blamed bank focus on ESG criteria and Federal Reserve interest rate mismanagement.',
    rawWireFactSummary: 'California regulators closed Silicon Valley Bank following a $42 billion deposit withdrawal in 24 hours driven by unhedged long-term Treasury bond losses, prompting the FDIC and Federal Reserve to invoke the systemic risk exception to guarantee all deposits.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-2023-01',
        outletId: 'out-wsj',
        outletName: 'The Wall Street Journal',
        title: 'SVB Runs Aground on Unhedged Bond Losses as Tech Startups Pull $42 Billion in a Single Day',
        url: 'https://wsj.com/finance/banking/svb-collapse-treasuries-bank-run',
        publishedAt: '2023-03-10T18:00:00Z',
        author: 'Rachel Louise Ensign',
        cleanedContent: 'Silicon Valley Bank suffered the second-largest bank failure in US history after higher interest rates eroded the value of its massive long-duration bond portfolio.',
        lexicalLoad: 0.06,
        sentimentScore: -0.32,
        biasAlignment: 'Center',
        clusterId: 'clust-2023-01',
        primarySubject: 'SVB Collapse'
      },
      {
        id: 'art-2023-02',
        outletId: 'out-msnbc',
        outletName: 'MSNBC',
        title: 'Trump-Era Banking Deregulation Exposed as SVB Collapses in Greedy Venture Capital Chaos',
        url: 'https://msnbc.com/opinion/svb-trump-deregulation-disaster',
        publishedAt: '2023-03-11T12:00:00Z',
        author: 'Chris Hayes Team',
        cleanedContent: 'The rollback of Dodd-Frank stress tests in 2018 directly paved the way for Silicon Valley Bank executives to gamble on uninsured tech deposits without oversight.',
        lexicalLoad: 0.36,
        sentimentScore: -0.79,
        biasAlignment: 'Left',
        clusterId: 'clust-2023-01',
        primarySubject: 'SVB Collapse'
      }
    ]
  },

  // ── 2022 LANDMARK CLUSTERS ──
  {
    id: 'clust-2022-01',
    representativeTitle: 'Supreme Court Overturns Roe v. Wade in Historic Dobbs v. Jackson Ruling',
    category: 'Legal',
    year: 2022,
    firstReportedAt: '2022-06-24T14:15:00Z',
    leftCoveragePct: 52.0,
    centerCoveragePct: 10.0,
    rightCoveragePct: 38.0,
    totalArticlesCount: 78,
    blindspotType: 'Balanced',
    asymmetryReason: 'Left-leaning coverage centered entirely on maternal healthcare access, state bans, and reproductive rights, while Right-leaning coverage highlighted constitutional originalism, the protection of unborn life, and democratic state legislative authority.',
    rawWireFactSummary: 'The Supreme Court ruled 5-4 to overturn the 1973 Roe v. Wade decision (and 6-3 to uphold Mississippi’s 15-week ban), returning statutory authority to regulate or prohibit abortion to individual state legislatures and voters.',
    rawWireSource: 'Associated Press',
    articles: [
      {
        id: 'art-2022-01',
        outletId: 'out-ap',
        outletName: 'Associated Press',
        title: 'Supreme Court Overturns Roe v. Wade, Ending 50 Years of Constitutional Abortion Rights',
        url: 'https://apnews.com/article/supreme-court-overturns-roe-v-wade',
        publishedAt: '2022-06-24T14:20:00Z',
        author: 'Mark Sherman',
        cleanedContent: 'The Supreme Court on Friday ended constitutional protections for abortion that had been in place for nearly 50 years in a decision by its conservative majority.',
        lexicalLoad: 0.05,
        sentimentScore: -0.10,
        biasAlignment: 'Center',
        clusterId: 'clust-2022-01',
        primarySubject: 'Dobbs Decision'
      },
      {
        id: 'art-2022-02',
        outletId: 'out-fox',
        outletName: 'Fox News',
        title: 'Supreme Court Overturns Roe v. Wade in Historic Triumph for Unborn Life and the Constitution',
        url: 'https://foxnews.com/politics/supreme-court-overturns-roe-v-wade-dobbs',
        publishedAt: '2022-06-24T14:35:00Z',
        author: 'Fox News Politics',
        cleanedContent: 'In a monumental ruling for the pro-life movement, the high court struck down Roe v. Wade, correcting five decades of judicial overreach and returning power to the people.',
        lexicalLoad: 0.31,
        sentimentScore: 0.74,
        biasAlignment: 'Right',
        clusterId: 'clust-2022-01',
        primarySubject: 'Dobbs Decision'
      }
    ]
  },

  // ── 2021 LANDMARK CLUSTERS ──
  {
    id: 'clust-2021-01',
    representativeTitle: 'Kabul Airport Suicide Bombing & Final U.S. Military Withdrawal from Afghanistan',
    category: 'Foreign Affairs',
    year: 2021,
    firstReportedAt: '2021-08-26T15:00:00Z',
    leftCoveragePct: 15.0,
    centerCoveragePct: 15.0,
    rightCoveragePct: 70.0,
    totalArticlesCount: 64,
    blindspotType: 'Left_Blindspot',
    asymmetryReason: 'Conservative networks gave continuous 24-hour focus to tactical blunders, abandoned equipment, and the 13 fallen service members, while progressive networks emphasized the long-overdue termination of a 20-year multi-trillion dollar endless war.',
    rawWireFactSummary: 'An ISIS-K suicide bomber detonated an explosive vest at Abbey Gate outside Hamid Karzai International Airport during the US evacuation, killing 13 US service members and at least 170 Afghan civilians before the final C-17 departed on August 30.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-2021-01',
        outletId: 'out-reuters',
        outletName: 'Reuters',
        title: 'Suicide Bomber Kills 13 US Troops and Dozens of Afghans Outside Kabul Airport',
        url: 'https://reuters.com/world/asia-pacific/kabul-airport-explosion-evacuation-2021',
        publishedAt: '2021-08-26T16:00:00Z',
        author: 'Idrees Ali',
        cleanedContent: 'A suicide bomber struck crowds thronging Kabul airport on Thursday, killing 13 American troops and dozens of Afghans in the deadliest day for US forces in Afghanistan in a decade.',
        lexicalLoad: 0.04,
        sentimentScore: -0.80,
        biasAlignment: 'Center',
        clusterId: 'clust-2021-01',
        primarySubject: 'Afghanistan Withdrawal'
      },
      {
        id: 'art-2021-02',
        outletId: 'out-fox',
        outletName: 'Fox News',
        title: 'Biden Administration Surrenders Afghanistan in Catastrophic, Humiliating Kabul Retreat',
        url: 'https://foxnews.com/politics/afghanistan-disaster-biden-kabul-retreat',
        publishedAt: '2021-08-26T17:15:00Z',
        author: 'Bret Baier Team',
        cleanedContent: 'America watched in horror as the Biden administration botched the withdrawal from Afghanistan, leaving billions in high-tech military hardware in the hands of Taliban terrorists.',
        lexicalLoad: 0.42,
        sentimentScore: -0.92,
        biasAlignment: 'Right',
        clusterId: 'clust-2021-01',
        primarySubject: 'Afghanistan Withdrawal'
      }
    ]
  },

  // ── 2020 LANDMARK CLUSTERS ──
  {
    id: 'clust-2020-01',
    representativeTitle: 'COVID-19 Origin Debate: Wuhan Institute Lab-Leak vs Zoonotic Spillover Scientific Inquiry',
    category: 'Social',
    year: 2020,
    firstReportedAt: '2020-05-15T12:00:00Z',
    leftCoveragePct: 10.0,
    centerCoveragePct: 10.0,
    rightCoveragePct: 80.0,
    totalArticlesCount: 58,
    blindspotType: 'Left_Blindspot',
    asymmetryReason: 'In 2020, mainstream left-leaning outlets aggressively labeled the laboratory origin theory as a debunked conspiracy theory; in subsequent years, the US Department of Energy and FBI both formally assessed a lab origin with low/moderate confidence.',
    rawWireFactSummary: 'The World Health Organization (WHO) and international virologists conducted investigations into the origins of SARS-CoV-2, evaluating both animal zoonotic transmission at the Huanan Seafood Market and a potential laboratory research incident at the Wuhan Institute of Virology.',
    rawWireSource: 'Reuters',
    articles: [
      {
        id: 'art-2020-01',
        outletId: 'out-reuters',
        outletName: 'Reuters',
        title: 'Scientists and Intelligence Agencies Examine Competing Theories on COVID-19 Origins',
        url: 'https://reuters.com/article/us-health-coronavirus-origin-science',
        publishedAt: '2020-05-15T14:00:00Z',
        author: 'Stephanie Nebehay',
        cleanedContent: 'Global health officials are reviewing genetic epidemiology data to ascertain whether the novel coronavirus jumped from bats to humans through an intermediate animal host or escaped from a biological laboratory.',
        lexicalLoad: 0.03,
        sentimentScore: 0.00,
        biasAlignment: 'Center',
        clusterId: 'clust-2020-01',
        primarySubject: 'COVID Origins'
      },
      {
        id: 'art-2020-02',
        outletId: 'out-nyt-news',
        outletName: 'The New York Times',
        title: 'Trump Administration Pushes Unsubstantiated Theory Linking Coronavirus to Wuhan Lab',
        url: 'https://nytimes.com/2020/05/15/us/politics/trump-wuhan-lab-coronavirus.html',
        publishedAt: '2020-05-15T15:30:00Z',
        author: 'Julian E. Barnes',
        cleanedContent: 'Senior administration officials have pressed American spy agencies to find evidence supporting the disputed theory that the virus originated in a Wuhan laboratory.',
        lexicalLoad: 0.26,
        sentimentScore: -0.45,
        biasAlignment: 'Lean_Left',
        clusterId: 'clust-2020-01',
        primarySubject: 'COVID Origins'
      }
    ]
  },
  {
    id: 'clust-2020-02',
    representativeTitle: 'Hunter Biden Laptop Disclosure & The 51 Intelligence Officials Public Statement',
    category: 'Politics',
    year: 2020,
    firstReportedAt: '2020-10-19T20:00:00Z',
    leftCoveragePct: 5.0,
    centerCoveragePct: 15.0,
    rightCoveragePct: 80.0,
    totalArticlesCount: 42,
    blindspotType: 'Left_Blindspot',
    asymmetryReason: 'Major digital platforms and left-leaning networks suppressed and bypassed the laptop contents in October 2020 after 51 former intelligence officials claimed it had all the earmarks of Russian disinformation; the FBI and DOJ later verified the laptop in federal court in 2023.',
    rawWireFactSummary: 'A group of 51 former intelligence officials published a public letter stating the publication of emails attributed to Hunter Biden had all the classic earmarks of a Russian information operation, while the FBI took custody of the physical hardware for authentication.',
    rawWireSource: 'Associated Press',
    articles: [
      {
        id: 'art-2020-11',
        outletId: 'out-dailywire',
        outletName: 'The Daily Wire',
        title: 'Big Tech and Liberal Media Censor Explosive Hunter Biden Laptop Expose to Protect Campaign',
        url: 'https://dailywire.com/news/hunter-biden-laptop-censorship-october',
        publishedAt: '2020-10-20T01:00:00Z',
        author: 'Daily Wire Editorial',
        cleanedContent: 'Twitter locked the accounts of major news outlets and journalists in an unprecedented coordinated blackout to bury damaging financial records concerning the Biden family.',
        lexicalLoad: 0.39,
        sentimentScore: -0.88,
        biasAlignment: 'Right',
        clusterId: 'clust-2020-02',
        primarySubject: 'Hunter Biden Laptop'
      },
      {
        id: 'art-2020-12',
        outletId: 'out-ap',
        outletName: 'Associated Press',
        title: 'Former Intelligence Officials Warn Biden Laptop Story Resembles Russian Disinformation',
        url: 'https://apnews.com/article/intel-officials-biden-laptop-warning-2020',
        publishedAt: '2020-10-20T03:00:00Z',
        author: 'Eric Tucker',
        cleanedContent: 'More than 50 former senior intelligence officials signed a letter cautioning that the public emergence of emails purporting to belong to Hunter Biden bore the classic characteristics of foreign covert influence.',
        lexicalLoad: 0.08,
        sentimentScore: -0.15,
        biasAlignment: 'Center',
        clusterId: 'clust-2020-02',
        primarySubject: 'Hunter Biden Laptop'
      }
    ]
  }
];

export const INITIAL_CLAIMS: ClaimRecord[] = [
  {
    id: 'clm-001',
    articleId: 'art-101',
    outletName: 'Fox News',
    sentence: 'The Senate passed HR101.',
    primaryLabel: 'FACTUAL_CLAIM',
    secondaryLabel: 'ATTRIBUTED_CLAIM',
    confidence: 0.97,
    extractedTriplet: {
      subject: 'US_SENATE',
      predicate: 'PASSED',
      object: 'HR101',
      context: 'Legislative passage claim'
    },
    resolvedEntities: [
      { entity: 'Senate', matchedId: 'ent-senate-us', type: 'Agency', canonicalName: 'United States Senate' },
      { entity: 'HR101', matchedId: 'bill-118-hr101', type: 'Legislation', canonicalName: 'H.R. 101: Return to Work Act (118th Congress)' }
    ],
    evidenceScore: 32,
    evidenceStatus: 'Contradicted',
    evidenceDetails: [
      { source: 'Congress.gov (118th US Congress)', qualityScore: 100, notes: 'H.R. 101 Return to Work Act was referred to House Committee on Oversight and Accountability; it never passed the Senate or House.', isOfficialRecord: true },
      { source: 'Public Law 111-290 (111th Congress, 2010)', qualityScore: 100, notes: 'Historical H.R. 101 Continuing Appropriations did pass the Senate in 2010, confirming context confusion.', isOfficialRecord: true }
    ],
    reviewStatus: 'Reviewed',
    lineage: {
      originArticleUrl: 'https://foxnews.com/politics/homan-warns-nyc-sanctuary',
      originOutlet: 'Fox News',
      ingestionTimestamp: '2026-08-25T14:02:11Z',
      tokenizer: 'microsoft/deberta-v3-base-tokenizer',
      classificationModel: 'DeBERTa-v3-claim-v1.4',
      extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
      entityModel: 'VeritasEntityResolver-v2.1',
      confidenceContributions: [
        { factor: 'Official Congressional Database Lookup', weight: -60 },
        { factor: 'Historical 111th Session Match Context', weight: +15 },
        { factor: 'Linguistic Predicate Extraction Confidence', weight: +37 }
      ],
      lastAuditTimestamp: '2026-08-25T14:15:00Z',
      auditorId: 'AuditBot-Verifier-01'
    }
  },
  {
    id: 'clm-002',
    articleId: 'art-201',
    outletName: 'MSNBC',
    sentence: 'Experts predict inflation will fall next year.',
    primaryLabel: 'PREDICTION',
    secondaryLabel: 'ATTRIBUTED_CLAIM',
    confidence: 0.94,
    extractedTriplet: {
      subject: 'INFLATION_RATE',
      predicate: 'WILL_DECREASE',
      object: 'NEXT_YEAR',
      context: 'Macroeconomic forecast'
    },
    resolvedEntities: [
      { entity: 'Experts', matchedId: 'ent-unnamed-economists', type: 'Person', canonicalName: 'Consensus Macroeconomic Economists' },
      { entity: 'Inflation', matchedId: 'ent-cpi-us', type: 'Metric', canonicalName: 'US Consumer Price Index (CPI)' }
    ],
    evidenceScore: 68,
    evidenceStatus: 'Unverified',
    evidenceDetails: [
      { source: 'Federal Reserve Summary of Economic Projections (SEP)', qualityScore: 95, notes: 'Median PCE projection indicates trajectory toward 2.1% by late 2027.', isOfficialRecord: true },
      { source: 'IMF World Economic Outlook', qualityScore: 90, notes: 'Forecasts global disinflationary glidepath.', isOfficialRecord: true }
    ],
    reviewStatus: 'Auto_Accepted',
    lineage: {
      originArticleUrl: 'https://msnbc.com/opinion/ice-arrest-surge-civil-rights',
      originOutlet: 'MSNBC',
      ingestionTimestamp: '2026-08-25T14:05:00Z',
      tokenizer: 'microsoft/deberta-v3-base-tokenizer',
      classificationModel: 'DeBERTa-v3-claim-v1.4',
      extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
      entityModel: 'VeritasEntityResolver-v2.1',
      confidenceContributions: [
        { factor: 'Future tense modal verb detection (will fall)', weight: +45 },
        { factor: 'Attributed actor token (Experts predict)', weight: +35 },
        { factor: 'Non-falsifiable temporal horizon', weight: +14 }
      ],
      lastAuditTimestamp: '2026-08-25T14:05:01Z'
    }
  },
  {
    id: 'clm-003',
    articleId: 'art-102',
    outletName: 'The Daily Wire',
    sentence: 'The federal immigration bill is terrible and destructive to workers.',
    primaryLabel: 'OPINION',
    confidence: 0.98,
    extractedTriplet: {
      subject: 'IMMIGRATION_BILL',
      predicate: 'IS_EVALUATED_AS',
      object: 'DESTRUCTIVE_TERRIBLE'
    },
    evidenceScore: 10,
    evidenceStatus: 'Unverified',
    evidenceDetails: [
      { source: 'Lexical Evaluator', qualityScore: 80, notes: 'Subjective normative value judgment with no verifiable empirical predicate.', isOfficialRecord: false }
    ],
    reviewStatus: 'Auto_Accepted',
    lineage: {
      originArticleUrl: 'https://dailywire.com/news/homan-nyc-sanctuary-crackdown',
      originOutlet: 'The Daily Wire',
      ingestionTimestamp: '2026-08-25T14:08:22Z',
      tokenizer: 'microsoft/deberta-v3-base-tokenizer',
      classificationModel: 'DeBERTa-v3-claim-v1.4',
      extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
      entityModel: 'VeritasEntityResolver-v2.1',
      confidenceContributions: [
        { factor: 'Normative affective adjective detection', weight: +60 },
        { factor: 'Lack of quantitative metrics', weight: +38 }
      ],
      lastAuditTimestamp: '2026-08-25T14:08:23Z'
    }
  },
  {
    id: 'clm-004',
    articleId: 'art-401',
    outletName: 'MSNBC',
    sentence: 'Justice Jackson warned that the court ruling injects chaos into upcoming elections.',
    primaryLabel: 'FACTUAL_CLAIM',
    secondaryLabel: 'ATTRIBUTED_CLAIM',
    confidence: 0.96,
    extractedTriplet: {
      subject: 'JUSTICE_KETANJI_BROWN_JACKSON',
      predicate: 'WARNED_IN_DISSENT',
      object: 'ELECTION_CHAOS'
    },
    resolvedEntities: [
      { entity: 'Justice Jackson', matchedId: 'ent-scotus-kbj', type: 'Person', canonicalName: 'Associate Justice Ketanji Brown Jackson' },
      { entity: 'court ruling', matchedId: 'ent-scotus-docket-26a100', type: 'Legislation', canonicalName: 'Supreme Court Emergency Application 26A100' }
    ],
    evidenceScore: 98,
    evidenceStatus: 'Supported',
    evidenceDetails: [
      { source: 'Supreme Court Official Dissent Transcript', qualityScore: 100, notes: 'Direct quote verified on page 14 of official Supreme Court published slip opinion.', isOfficialRecord: true }
    ],
    reviewStatus: 'Auto_Accepted',
    lineage: {
      originArticleUrl: 'https://msnbc.com/scotus/jackson-dissent-mail-in-ballots',
      originOutlet: 'MSNBC',
      ingestionTimestamp: '2026-08-25T14:10:00Z',
      tokenizer: 'microsoft/deberta-v3-base-tokenizer',
      classificationModel: 'DeBERTa-v3-claim-v1.4',
      extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
      entityModel: 'VeritasEntityResolver-v2.1',
      confidenceContributions: [
        { factor: 'Direct text match in Supreme Court Slip Opinion', weight: +70 },
        { factor: 'High authority primary judicial record', weight: +26 }
      ],
      lastAuditTimestamp: '2026-08-25T14:10:02Z'
    }
  },
  {
    id: 'clm-005',
    articleId: 'art-101',
    outletName: 'Fox News',
    sentence: 'Abdul El-Sayed openly called for Sharia law to replace American legal statutes.',
    primaryLabel: 'RUMOR',
    secondaryLabel: 'ATTRIBUTED_CLAIM',
    confidence: 0.58, // Low confidence -> Active Learning candidate!
    extractedTriplet: {
      subject: 'ABDUL_EL_SAYED',
      predicate: 'CALLED_FOR',
      object: 'SHARIA_LAW_SUPREMACY'
    },
    resolvedEntities: [
      { entity: 'Abdul El-Sayed', matchedId: 'ent-el-sayed', type: 'Person', canonicalName: 'Abdul El-Sayed (Michigan Senate Candidate)' }
    ],
    evidenceScore: 12,
    evidenceStatus: 'Contradicted',
    evidenceDetails: [
      { source: 'PolitiFact Fact-Check Archive', qualityScore: 95, notes: 'Rated "Pants on Fire!". 2022 speech audio confirms El-Sayed criticized discriminatory ballot language, reiterating fidelity to the US Constitution.', isOfficialRecord: true },
      { source: 'CAIR 2022 Keynote Video Transcript', qualityScore: 100, notes: 'Primary transcript records no statement advocating replacement of American law.', isOfficialRecord: true }
    ],
    reviewStatus: 'Pending_Review',
    lineage: {
      originArticleUrl: 'https://foxnews.com/video/6403986645112',
      originOutlet: 'Fox News',
      ingestionTimestamp: '2026-08-25T14:12:00Z',
      tokenizer: 'microsoft/deberta-v3-base-tokenizer',
      classificationModel: 'DeBERTa-v3-claim-v1.4',
      extractionModel: 'Azure-OpenAI-GPT-5-Extractor',
      entityModel: 'VeritasEntityResolver-v2.1',
      confidenceContributions: [
        { factor: 'PolitiFact Verified Contradiction', weight: -70 },
        { factor: 'Ad Hominem Interview Framing Flag', weight: -18 }
      ],
      lastAuditTimestamp: '2026-08-25T14:12:05Z'
    }
  }
];

export const INITIAL_KAFKA_STREAM: KafkaTopicMessage[] = [
  {
    id: 'kfk-msg-1001',
    topic: 'articles.raw',
    timestamp: '2026-08-25T18:00:01Z',
    partition: 1,
    offset: 49201,
    key: 'reuters-art-991',
    payload: {
      articleId: 'A991',
      source: 'Reuters',
      url: 'https://reuters.com/world/us/senate-appropriations-vote',
      content: 'The Senate voted 68-30 to pass the emergency continuing resolution funding package through November.'
    },
    status: 'PROCESSED'
  },
  {
    id: 'kfk-msg-1002',
    topic: 'claims.classified',
    timestamp: '2026-08-25T18:00:03Z',
    partition: 2,
    offset: 38119,
    key: 'claim-classified-991',
    payload: {
      articleId: 'A991',
      sentence: 'The Senate voted 68-30 to pass the emergency continuing resolution funding package.',
      label: 'FACTUAL_CLAIM',
      confidence: 0.98,
      lexicalLoad: 0.03
    },
    status: 'PROCESSED'
  },
  {
    id: 'kfk-msg-1003',
    topic: 'claims.extracted',
    timestamp: '2026-08-25T18:00:05Z',
    partition: 0,
    offset: 21903,
    key: 'claim-extracted-991',
    payload: {
      claimId: 'C991',
      subject: 'US_SENATE',
      predicate: 'VOTED_PASSAGE',
      object: 'CONTINUING_RESOLUTION_PACKAGE',
      voteTally: '68-30'
    },
    status: 'PROCESSED'
  },
  {
    id: 'kfk-msg-1004',
    topic: 'entities.resolved',
    timestamp: '2026-08-25T18:00:07Z',
    partition: 3,
    offset: 19402,
    key: 'entity-res-991',
    payload: {
      claimId: 'C991',
      entities: [
        { alias: 'Senate', canonical: 'United States Senate', id: 'Q1108' },
        { alias: 'continuing resolution', canonical: 'H.R. 9811 (FY2026 Continuing Appropriations)', id: 'BILL-9811' }
      ]
    },
    status: 'PROCESSED'
  },
  {
    id: 'kfk-msg-1005',
    topic: 'deadletter.llm',
    timestamp: '2026-08-25T18:00:09Z',
    partition: 0,
    offset: 894,
    key: 'dlq-art-412',
    payload: {
      articleId: 'A412',
      originalTopic: 'claims.extracted',
      error: 'Token limit exceeded (Prompt 18,400 tokens exceeded 16,000 threshold)',
      retryCount: 3,
      contentSnippet: 'Comprehensive 40-page omnibus amendment text without chunking...'
    },
    status: 'FAILED',
    error: 'Token limit exceeded'
  },
  {
    id: 'kfk-msg-1006',
    topic: 'claims.replay',
    timestamp: '2026-08-25T18:00:15Z',
    partition: 1,
    offset: 310,
    key: 'replay-art-398',
    payload: {
      articleId: 'A398',
      replayedFromDLQ: 'dlq-art-398',
      patchedPayload: { chunked: true, chunkSize: 4000 },
      targetTopic: 'claims.extracted'
    },
    status: 'REPLAYED'
  }
];

export const INITIAL_DLQ_RECORDS: DLQRecord[] = [
  {
    id: 'dlq-rec-001',
    messageId: 'msg-dlq-891',
    originalTopic: 'claims.extracted',
    error: 'Token limit exceeded: Context window overflow on 35-page PDF text',
    errorCategory: 'Token_Limit_Exceeded',
    retryCount: 3,
    timestamp: '2026-08-25T17:40:00Z',
    payload: {
      articleId: 'A891',
      source: 'State Congressional Journal',
      rawTextLength: 124000,
      chunkStatus: 'unpartitioned'
    },
    resolved: false
  },
  {
    id: 'dlq-rec-002',
    messageId: 'msg-dlq-892',
    originalTopic: 'claims.extracted',
    error: 'JSON parse error: LLM generated markdown block outside JSON schema',
    errorCategory: 'JSON_Parse_Error',
    retryCount: 3,
    timestamp: '2026-08-25T17:48:12Z',
    payload: {
      articleId: 'A892',
      model: 'gpt-4o-extract-v1',
      rawLLMOutput: 'Here is the JSON: ```json { "subject": "DOJ" ... } ```'
    },
    resolved: false
  },
  {
    id: 'dlq-rec-003',
    messageId: 'msg-dlq-893',
    originalTopic: 'entities.resolved',
    error: 'Rate Limit (429 Too Many Requests): Azure OpenAI throughput throttle',
    errorCategory: 'Rate_Limit',
    retryCount: 3,
    timestamp: '2026-08-25T17:55:00Z',
    payload: {
      batchSize: 100,
      callerService: 'entity-resolution-worker-03'
    },
    resolved: true,
    replayedAt: '2026-08-25T18:00:15Z'
  }
];

export const INITIAL_TV_SCORECARDS: TVStationScorecard[] = [
  {
    id: 'sc-pbs',
    networkName: 'PBS NewsHour',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 0,
        pointsDeducted: 0,
        details: ['Covered 10/10 national blindspot clusters during weekly broadcast']
      },
      factToOpinionRatio: {
        opinionPercentage: 14,
        pointsDeducted: 0,
        details: '14% opinion/commentary vs 86% straight reporting (Well below 40% threshold)'
      },
      linguisticLoad: {
        persistentSpinDetected: false,
        pointsDeducted: 0,
        flaggedTerms: []
      },
      correctionTransparency: {
        unretractedErrors: 0,
        pointsDeducted: 0,
        details: 'Immediate proactive on-air correction issued for statistics erratum'
      }
    },
    finalScore: 100,
    grade: 'A',
    keyAnalyticalFindings: 'Highest standard of broadcast integrity in the United States. Minimal linguistic load, balanced story selection, and strict separation between reporting and panel reflections.'
  },
  {
    id: 'sc-nbc',
    networkName: 'NBC News (Nightly Broadcast)',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 1,
        pointsDeducted: 5,
        details: ['Omitted federal oversight audit on municipal grant allocation']
      },
      factToOpinionRatio: {
        opinionPercentage: 22,
        pointsDeducted: 0,
        details: '22% opinion/analysis vs 78% straight news'
      },
      linguisticLoad: {
        persistentSpinDetected: false,
        pointsDeducted: 0,
        flaggedTerms: []
      },
      correctionTransparency: {
        unretractedErrors: 0,
        pointsDeducted: 0,
        details: 'Transparent online correction logs maintained'
      }
    },
    finalScore: 95,
    grade: 'A',
    keyAnalyticalFindings: 'High factual standards in main nightly news block. Slight center-left framing in secondary guest selections.'
  },
  {
    id: 'sc-cnn',
    networkName: 'CNN (Primetime Cable)',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 2,
        pointsDeducted: 10,
        details: ['Omitted 2 trending Right-leaning federal audit stories']
      },
      factToOpinionRatio: {
        opinionPercentage: 58,
        pointsDeducted: 10,
        details: '58% panel debate & host commentary vs 42% straight factual reporting (>40% threshold)'
      },
      linguisticLoad: {
        persistentSpinDetected: true,
        pointsDeducted: 10,
        flaggedTerms: ['"bombshell"', '"scathing takedown"', '"crisis spiral"']
      },
      correctionTransparency: {
        unretractedErrors: 0,
        pointsDeducted: 0,
        details: 'Standard editorial correction protocols followed'
      }
    },
    finalScore: 70,
    grade: 'C',
    keyAnalyticalFindings: 'Heavy primetime reliance on political panels rather than investigative field reports. Banners feature sensational lexical priming.'
  },
  {
    id: 'sc-fox',
    networkName: 'Fox News (Primetime Cable)',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 3,
        pointsDeducted: 15,
        details: ['Ignored 3 Left-leaning climate and civil liberties statistical updates']
      },
      factToOpinionRatio: {
        opinionPercentage: 68,
        pointsDeducted: 10,
        details: '68% host monologue and partisan panel commentary vs 32% straight news (>40% threshold)'
      },
      linguisticLoad: {
        persistentSpinDetected: true,
        pointsDeducted: 10,
        flaggedTerms: ['"radical agenda"', '"dodge"', '"lawless takeover"']
      },
      correctionTransparency: {
        unretractedErrors: 1,
        pointsDeducted: 25,
        details: 'Failed to correct out-of-context audio claim regarding Sharia law on air after fact-check release'
      }
    },
    finalScore: 40,
    grade: 'F',
    keyAnalyticalFindings: 'Primetime line-up operates overwhelmingly as ideological commentary rather than news reporting, with heavy ad hominem on-screen branding.'
  },
  {
    id: 'sc-msnbc',
    networkName: 'MSNBC (Primetime Cable)',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 3,
        pointsDeducted: 15,
        details: ['Omitted 3 stories regarding border enforcement metrics and energy costs']
      },
      factToOpinionRatio: {
        opinionPercentage: 62,
        pointsDeducted: 10,
        details: '62% opinion/commentary vs 38% straight reporting (>40% threshold)'
      },
      linguisticLoad: {
        persistentSpinDetected: true,
        pointsDeducted: 10,
        flaggedTerms: ['"existential threat"', '"systemic destruction"', '"blistering assault"']
      },
      correctionTransparency: {
        unretractedErrors: 0,
        pointsDeducted: 0,
        details: 'Standard correction policy'
      }
    },
    finalScore: 65,
    grade: 'D',
    keyAnalyticalFindings: 'Strong progressive ideological framing during evening broadcast hours with high emotive adjectives and selective story prioritization.'
  },
  {
    id: 'sc-newsmax',
    networkName: 'Newsmax',
    trackingPeriod: 'Aug 18 - Aug 25, 2026 (7-Day Sample)',
    baseScore: 100,
    deductions: {
      storyOmissions: {
        count: 5,
        pointsDeducted: 25,
        details: ['Omitted 5 major bipartisan congressional compromises and legal dismissals']
      },
      factToOpinionRatio: {
        opinionPercentage: 74,
        pointsDeducted: 10,
        details: '74% partisan opinion discourse vs 26% news'
      },
      linguisticLoad: {
        persistentSpinDetected: true,
        pointsDeducted: 10,
        flaggedTerms: ['"corrupt elite"', '"weaponized"', '"collusion"']
      },
      correctionTransparency: {
        unretractedErrors: 1,
        pointsDeducted: 25,
        details: 'No on-air clarification for disputed election tabulation claims'
      }
    },
    finalScore: 30,
    grade: 'F',
    keyAnalyticalFindings: 'Extreme commentary-to-news ratio with systematic omission of unfavorable political realities and persistent inflammatory rhetoric.'
  }
];

export const INITIAL_SPIN_CASES: SpinComparisonCase[] = [
  {
    id: 'spin-001',
    topic: 'Tom Homan Speech on NYC Immigration Policies',
    groundTruthText: 'Former acting ICE director Tom Homan gave a speech stating federal immigration agents have constitutional authority to conduct operations in NYC regardless of municipal sanctuary laws.',
    leftHeadline: 'Former Trump Official Issues Threats to NYC Sanctuary Status, Escalating Federal-Local Clashes',
    leftOutlet: 'Progressive Digital Press (NYT/MSNBC Style)',
    leftFramingAnalysis: 'Uses villainizing verbs ("threats", "escalating") to frame lawful statutory enforcement as an aggressive partisan attack.',
    leftLoadedWords: ['threats', 'escalating', 'clashes', 'hostile'],
    rightHeadline: 'ICE Chief Puts Sanctuary City Politicians on Notice: Federal Law Will Be Enforced in NYC',
    rightOutlet: 'Conservative Cable / Digital (Fox/Daily Wire Style)',
    rightFramingAnalysis: 'Uses authoritative, heroic verbs ("puts on notice", "enforced") to portray federal agents as law-and-order defenders against defiant politicians.',
    rightLoadedWords: ['puts on notice', 'defiant', 'law and order', 'clean up'],
    omissionsAnalysis: 'The Left omits federal supremacy statutes; the Right omits local police chief concerns regarding community trust.'
  },
  {
    id: 'spin-002',
    topic: 'Interior ICE Apprehensions Surge',
    groundTruthText: 'Department of Homeland Security quarterly data shows a 23% increase in interior non-citizen detentions across the United States.',
    leftHeadline: 'Surge in ICE Arrests Sparks Humanitarian Panic and Raises Deep Civil Rights Concerns',
    leftOutlet: 'Left-Leaning Digital (MSNBC/Guardian Style)',
    leftFramingAnalysis: 'Focuses entirely on emotional and humanitarian distress ("panic", "civil rights concerns"), implying immediate administrative misconduct.',
    leftLoadedWords: ['humanitarian panic', 'deep concerns', 'family separation', 'sweeps'],
    rightHeadline: 'ICE Crackdowns Successfully Remove Thousands of Criminal Aliens Under Law Enforcement Surge',
    rightOutlet: 'Right-Leaning Digital (Fox/Daily Wire Style)',
    rightFramingAnalysis: 'Frames the raw numerical increase as an unambiguous "success" and universally classifies all detainees with the descriptor "criminal aliens".',
    rightLoadedWords: ['successfully remove', 'criminal aliens', 'crackdown', 'surge victory'],
    omissionsAnalysis: 'The Left omits the proportion of detainees with existing felony warrants; the Right omits detainees with only civil immigration infractions.'
  },
  {
    id: 'spin-003',
    topic: 'Supreme Court Ketanji Brown Jackson Mail-In Voting Dissent',
    groundTruthText: 'The Supreme Court voted 6-3 to dissolve a lower court injunction, allowing administration verification requirements on postal ballot registries while litigation continues.',
    leftHeadline: 'Jackson Blasts Conservative Majority for "Needlessly Injecting Chaos" into Elections',
    leftOutlet: 'Left-Leaning Press (MSNBC/Vox Style)',
    leftFramingAnalysis: 'Centers the story entirely on Justice Jackson\'s emotional posture ("blasts", "rips") and highlights potential disenfranchisement fears.',
    leftLoadedWords: ['blasts', 'injecting chaos', 'disenfranchisement', 'unprecedented overreach'],
    rightHeadline: 'Supreme Court Clears Trump Mail-In Ballot Security Order as Liberal Justices Dissent',
    rightOutlet: 'Right-Leaning Press (WSJ Op-Ed/Daily Wire Style)',
    rightFramingAnalysis: 'Frames the decision as institutional legal validation for "security" and groups the three dissenting judges into an ideological minority label.',
    rightLoadedWords: ['security order', 'clears victory', 'liberal outcry', 'routine verification'],
    omissionsAnalysis: 'The Left minimizes the standing and procedural jurisdictional basis of the order; the Right omits bipartisan postal union warnings of delivery disruptions.'
  },
  {
    id: 'spin-004',
    topic: 'Abdul El-Sayed Interview on Taxation & Sharia Law',
    groundTruthText: 'Michigan Senate candidate Abdul El-Sayed proposed higher taxes on corporations and top earners, and defended his 2022 speech against anti-sharia ballot measures as a defense of the First Amendment.',
    leftHeadline: 'Republicans Smear Abdul El-Sayed by Distorting 2022 Video on Religious Freedom',
    leftOutlet: 'Fact-Check / Center-Left (PolitiFact / MSNBC Style)',
    leftFramingAnalysis: 'Frames the candidate as the target of bad-faith misinformation, emphasizing First Amendment protections and verified transcripts.',
    leftLoadedWords: ['smear', 'distorting', 'bad-faith', 'religious freedom'],
    rightHeadline: 'El-Sayed Grilled on Taxing the Rich and Past Statements on Sharia Law: "It\'s Another Dodge, Abdul!"',
    rightOutlet: 'Conservative Broadcast (Fox News Style)',
    rightFramingAnalysis: 'Employs aggressive ad hominem framing in the headline to pre-judge the candidate as evasive and extremist before the viewer hears the answer.',
    rightLoadedWords: ['grilled', 'another dodge', 'radical', 'extremist'],
    omissionsAnalysis: 'Conservative hosts omit that the ballot measure in question was struck down as unconstitutional by federal judges in 2010.'
  }
];

export const INITIAL_MODEL_METRICS: ModelMetrics = {
  version: 'DeBERTa-v3-claim-v1.4',
  accuracy: 0.924,
  precision: 0.931,
  recall: 0.910,
  f1Score: 0.920,
  avgLatencyMs: 42.5,
  p95LatencyMs: 118.0,
  p99LatencyMs: 235.0,
  totalEvaluated: 12500,
  perClassMetrics: {
    FACTUAL_CLAIM: { precision: 0.952, recall: 0.941, f1: 0.946, count: 5200 },
    OPINION: { precision: 0.915, recall: 0.902, f1: 0.908, count: 3100 },
    PREDICTION: { precision: 0.884, recall: 0.865, f1: 0.874, count: 1400 },
    ANALYSIS: { precision: 0.891, recall: 0.875, f1: 0.883, count: 1200 },
    QUESTION: { precision: 0.978, recall: 0.985, f1: 0.981, count: 600 },
    ATTRIBUTED_CLAIM: { precision: 0.923, recall: 0.911, f1: 0.917, count: 800 },
    RUMOR: { precision: 0.845, recall: 0.812, f1: 0.828, count: 200 }
  },
  confusionMatrix: {
    labels: ['FACTUAL_CLAIM', 'OPINION', 'PREDICTION', 'ANALYSIS'],
    matrix: [
      [4893, 150, 80, 77],
      [120, 2796, 95, 89],
      [65, 82, 1211, 42],
      [71, 98, 45, 986]
    ]
  },
  driftMetrics: {
    psi: 0.082, // Stable (< 0.1)
    klDivergence: 0.041,
    driftStatus: 'Stable',
    confidenceShiftPct: -2.1,
    timestamp: '2026-08-25T18:00:00Z'
  }
};

export const INITIAL_GRAPH_NODES: KnowledgeGraphNode[] = [
  { id: 'node-art-101', label: 'Fox News: Homan Speech', type: 'Article', properties: { outlet: 'Fox News', date: '2026-08-24' }, x: 120, y: 100 },
  { id: 'node-art-401', label: 'MSNBC: Jackson Dissent', type: 'Article', properties: { outlet: 'MSNBC', date: '2026-08-25' }, x: 120, y: 320 },
  { id: 'node-clm-001', label: 'Claim: Senate Passed HR101', type: 'Claim', properties: { verdict: 'Contradicted', confidence: 0.97 }, x: 380, y: 80 },
  { id: 'node-clm-004', label: 'Claim: Jackson Dissent Warns Chaos', type: 'Claim', properties: { verdict: 'Supported', confidence: 0.96 }, x: 380, y: 340 },
  { id: 'node-ent-senate', label: 'US Senate', type: 'Entity', properties: { type: 'Legislative Chamber' }, x: 620, y: 50 },
  { id: 'node-ent-scotus', label: 'Supreme Court of the US', type: 'Entity', properties: { type: 'Judicial Body' }, x: 620, y: 360 },
  { id: 'node-ev-cong', label: 'Congress.gov 118th Session', type: 'Evidence', properties: { status: 'Official Filing', quality: 100 }, x: 620, y: 150 },
  { id: 'node-ev-slip', label: 'Supreme Court Slip Opinion 26A100', type: 'Evidence', properties: { status: 'Official Docket', quality: 100 }, x: 620, y: 270 },
  { id: 'node-mod-deberta', label: 'DeBERTa-v3 Claim Classifier', type: 'Model', properties: { version: '1.4' }, x: 260, y: 210 },
  { id: 'node-rev-analyst', label: 'Analyst: Lead Verifier', type: 'Reviewer', properties: { role: 'Senior Fact Auditor' }, x: 500, y: 210 }
];

export const INITIAL_GRAPH_EDGES: KnowledgeGraphEdge[] = [
  { id: 'edge-1', source: 'node-art-101', target: 'node-clm-001', relation: 'GENERATED_FROM', confidence: 0.98 },
  { id: 'edge-2', source: 'node-art-401', target: 'node-clm-004', relation: 'GENERATED_FROM', confidence: 0.99 },
  { id: 'edge-3', source: 'node-clm-001', target: 'node-mod-deberta', relation: 'EXTRACTED_BY' },
  { id: 'edge-4', source: 'node-clm-004', target: 'node-mod-deberta', relation: 'EXTRACTED_BY' },
  { id: 'edge-5', source: 'node-clm-001', target: 'node-ent-senate', relation: 'RESOLVED_AS' },
  { id: 'edge-6', source: 'node-clm-004', target: 'node-ent-scotus', relation: 'RESOLVED_AS' },
  { id: 'edge-7', source: 'node-ev-cong', target: 'node-clm-001', relation: 'CONTRADICTED_BY', confidence: 0.99 },
  { id: 'edge-8', source: 'node-ev-slip', target: 'node-clm-004', relation: 'SUPPORTED_BY', confidence: 1.0 },
  { id: 'edge-9', source: 'node-rev-analyst', target: 'node-clm-001', relation: 'REVIEWED_BY' }
];
