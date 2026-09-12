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
} from '@/lib/veritaslens/types';

// ── 1. Ghanaian Media Outlets (15 Top National Radio & TV Networks) ───────────
export const GHANA_MEDIA_OUTLETS: MediaOutlet[] = [
  {
    "id": "out-peacefm",
    "name": "Peace 104.3 FM / Peacefmonline",
    "domain": "peacefmonline.com",
    "biasScore": 0.8,
    "biasCategory": "Center",
    "reliabilityScore": 52.1,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Despite Media Group (Osei Kwame Despite & Ernest Ofori Sarpong)",
    "country": "Ghana",
    "description": "Ghana's premier Akan & English mass-market morning agenda setter, home to Kokrokoo Morning Show hosted by Kwami Sefa Kayi ('Chairman General').",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-joyfm",
    "name": "Joy 99.7 FM / JoyNews / MyJoyOnline",
    "domain": "myjoyonline.com",
    "biasScore": 0.2,
    "biasCategory": "Center",
    "reliabilityScore": 58.4,
    "factualityCategory": "Very_High",
    "ownerType": "Conglomerate",
    "ownerName": "Multimedia Group Ghana (Kwasi Twum)",
    "country": "Ghana",
    "description": "Leading independent English broadcast and investigative newsroom (Super Morning Show, Newsfile hosted by Samson Lardy Anyenini, PM Express).",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-citifm",
    "name": "Citi 97.3 FM / Citi TV / Citi Newsroom",
    "domain": "citinewsroom.com",
    "biasScore": -0.4,
    "biasCategory": "Center",
    "reliabilityScore": 57.8,
    "factualityCategory": "Very_High",
    "ownerType": "Independent",
    "ownerName": "Omni Media Limited (Samuel Attah-Mensah & Bernard Avle)",
    "country": "Ghana",
    "description": "Urban data journalism and empirical policy deconstruction powerhouse (Citi Breakfast Show, Eyewitness News with Umaru Sanda, The Point of View).",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-asempa",
    "name": "Asempa 94.7 FM / Ekosii Sen",
    "domain": "adomonline.com",
    "biasScore": 0.5,
    "biasCategory": "Center",
    "reliabilityScore": 53.2,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Multimedia Group Ghana",
    "country": "Ghana",
    "description": "The nation's most listened-to afternoon political combat arena (Ekosii Sen with Philip Osei Bonsu - O.B.), featuring direct clashes between NDC and NPP leadership.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-adomfm",
    "name": "Adom 106.3 FM / Adom TV",
    "domain": "adomonline.com",
    "biasScore": -0.2,
    "biasCategory": "Center",
    "reliabilityScore": 51.5,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Multimedia Group Ghana",
    "country": "Ghana",
    "description": "Highest-reach grassroots Akan station (Dwaso Nsem, Badwam) covering ordinary citizens, market women grievances, and public utility audits.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-omanfm",
    "name": "Oman 107.1 FM / Net2 TV",
    "domain": "omanfm.com",
    "biasScore": 16.5,
    "biasCategory": "Right",
    "reliabilityScore": 46.0,
    "factualityCategory": "High",
    "ownerType": "Private",
    "ownerName": "Kencity Media Limited (Hon. Kennedy Ohene Agyapong)",
    "country": "Ghana",
    "description": "High-impact conservative radio and TV network (National Agenda, Boiling Point) exposing opposition financial scandals, SADA, and GYEEDA.",
    "brandSafetyRisk": "Medium"
  },
  {
    "id": "out-angelfm",
    "name": "Angel 102.9 FM / Angel TV",
    "domain": "angelfmonlinegh.com",
    "biasScore": -1.2,
    "biasCategory": "Center",
    "reliabilityScore": 49.0,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Angel Broadcasting Network - ABN (Dr. Kwaku Oteng)",
    "country": "Ghana",
    "description": "Major multi-regional radio network (Anopa B\u0254fo\u0254) known for field investigative broadcasting, local council oversight, and community ombudsman reporting.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-asaase",
    "name": "Asaase 99.5 FM / Asaase Radio",
    "domain": "asaaseradio.com",
    "biasScore": 12.0,
    "biasCategory": "Right",
    "reliabilityScore": 53.5,
    "factualityCategory": "High",
    "ownerType": "Private",
    "ownerName": "Asaase Broadcasting Company (Gabby Asare Otchere-Darko)",
    "country": "Ghana",
    "description": "Pan-African policy and governance analysis network (Asaase Breakfast Show, Town Hall Talks with Kwaku Sakyi-Addo), specializing in macroeconomic policy.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-tv3",
    "name": "TV3 Ghana / 3FM 92.7 / 3news",
    "domain": "3news.com",
    "biasScore": -2.2,
    "biasCategory": "Lean_Left",
    "reliabilityScore": 50.1,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Media General Ghana",
    "country": "Ghana",
    "description": "High-reach television and radio powerhouse (The KeyPoints with Alfred Ocansey, 3FM Sunrise with Johnnie Hughes) driving social accountability.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-starrfm",
    "name": "Starr 103.5 FM / GHOne TV",
    "domain": "starrfm.com.gh",
    "biasScore": -1.0,
    "biasCategory": "Center",
    "reliabilityScore": 51.0,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "EIB Network (Kwabena Duffuor & Bola Ray)",
    "country": "Ghana",
    "description": "Urban broadcast station (Morning Starr with Francis Abban, State of Affairs) with legal and think-tank policy dialogues.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-radiogold",
    "name": "Radio Gold 90.5 FM",
    "domain": "radiogoldlive.com",
    "biasScore": -22.5,
    "biasCategory": "Left",
    "reliabilityScore": 41.0,
    "factualityCategory": "Mixed",
    "ownerType": "Private",
    "ownerName": "Network Broadcasting Company (Kwasi Sainti Baffoe-Bonnie)",
    "country": "Ghana",
    "description": "Historic partisan pro-NDC radio station (Alhaji & Alhaji Saturday political review) framing opposition narratives on debt, IMF, and governance.",
    "brandSafetyRisk": "High"
  },
  {
    "id": "out-kessben",
    "name": "Kessben 93.3 FM / Kessben TV",
    "domain": "kessbenonline.com",
    "biasScore": 1.5,
    "biasCategory": "Center",
    "reliabilityScore": 48.5,
    "factualityCategory": "High",
    "ownerType": "Conglomerate",
    "ownerName": "Kessben Group of Companies (Stephen Boateng - Kwabena Kesse)",
    "country": "Ghana",
    "description": "Dominant Middle and Northern Belt broadcast network (Breaking News with Omanhene Yaw Adu Boakye) covering regional agriculture and mining.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-graphic",
    "name": "Daily Graphic Online",
    "domain": "graphic.com.gh",
    "biasScore": 1.0,
    "biasCategory": "Center",
    "reliabilityScore": 55.0,
    "factualityCategory": "Very_High",
    "ownerType": "Government-Funded",
    "ownerName": "Graphic Communications Group Ltd",
    "country": "Ghana",
    "description": "State-owned newspaper of record with official ministerial releases, gazetted legislation, and statutory announcements.",
    "brandSafetyRisk": "Low"
  },
  {
    "id": "out-dailyguide",
    "name": "Daily Guide Network",
    "domain": "dailyguidenetwork.com",
    "biasScore": 15.0,
    "biasCategory": "Right",
    "reliabilityScore": 46.5,
    "factualityCategory": "High",
    "ownerType": "Private",
    "ownerName": "Western Publications Ltd (Freddie Blay Family)",
    "country": "Ghana",
    "description": "Leading pro-NPP daily newspaper providing investigative coverage of opposition dockets, Saglemi criminal trial, and SADA procurement.",
    "brandSafetyRisk": "Medium"
  },
  {
    "id": "out-ghanaweb",
    "name": "GhanaWeb",
    "domain": "ghanaweb.com",
    "biasScore": -0.5,
    "biasCategory": "Center",
    "reliabilityScore": 48.0,
    "factualityCategory": "High",
    "ownerType": "Independent",
    "ownerName": "AfricaWeb Holding",
    "country": "Ghana",
    "description": "Ghana's largest digital news aggregator and op-ed platform carrying statements from all political campaigns.",
    "brandSafetyRisk": "Low"
  }
];

// ── 2. 100% Ghanaian News Clusters & Blindspots ───────────────────────────────
export const GHANA_NEWS_CLUSTERS: NewsCluster[] = [
  {
    "id": "gh-cluster-1",
    "representativeTitle": "Forensic Audit of $200M Saglemi Housing Contract: Only 668 Incomplete Shells Delivered for 5,000-Unit Loan",
    "category": "Legal",
    "year": 2026,
    "firstReportedAt": "2026-08-28T08:00:00Z",
    "leftCoveragePct": 8,
    "centerCoveragePct": 34,
    "rightCoveragePct": 58,
    "totalArticlesCount": 46,
    "blindspotType": "Left_Blindspot",
    "asymmetryReason": "Pro-NDC media omitted the unilateral scaling down from 5,000 to 1,506 units without parliamentary re-approval, while pro-NPP outlets highlighted the full $200M disbursement and missing infrastructure.",
    "rawWireFactSummary": "Parliament in 2012 approved $200M for 5,000 housing units. The contract was amended without parliamentary assent to build 1,506 units for the same $200M. Only 668 uninhabitable shells were constructed by 2016 without water or electricity connections.",
    "rawWireSource": "Associated Press",
    "articles": [
      {
        "id": "art-gh-01",
        "outletId": "out-dailyguide",
        "outletName": "Daily Guide Network",
        "title": "Saglemi Scandal: How $200M Vanished with Zero Livable Homes Under NDC",
        "url": "https://dailyguidenetwork.com/saglemi-scandal-audit",
        "publishedAt": "2026-08-28T09:15:00Z",
        "author": "Kofi Mensah",
        "cleanedContent": "Parliamentary and court records reveal the NDC administration disbursed $196M for only 668 incomplete shells, leaving taxpayers to shoulder the debt burden.",
        "lexicalLoad": 0.78,
        "sentimentScore": -0.65,
        "biasAlignment": "Right",
        "clusterId": "gh-cluster-1",
        "primarySubject": "Saglemi Housing"
      },
      {
        "id": "art-gh-02",
        "outletId": "out-joyfm",
        "outletName": "Joy 99.7 FM / JoyNews",
        "title": "Fact-Check: The True Numbers Behind the $200M Saglemi Affordable Housing Project",
        "url": "https://myjoyonline.com/news/saglemi-factcheck",
        "publishedAt": "2026-08-28T10:30:00Z",
        "author": "Evans Mensah",
        "cleanedContent": "The original 2012 parliamentary agreement mandated 5,000 units. Ministry records confirm contract revisions reduced scope without legislative approval.",
        "lexicalLoad": 0.12,
        "sentimentScore": -0.05,
        "biasAlignment": "Center",
        "clusterId": "gh-cluster-1",
        "primarySubject": "Saglemi Housing"
      }
    ]
  },
  {
    "id": "gh-cluster-2",
    "representativeTitle": "The 4-Year Dumsor Power Crisis & $1.2B Annual Take-or-Pay IPP Capacity Debt Legacy",
    "category": "Energy",
    "year": 2026,
    "firstReportedAt": "2026-08-25T11:00:00Z",
    "leftCoveragePct": 12,
    "centerCoveragePct": 38,
    "rightCoveragePct": 50,
    "totalArticlesCount": 52,
    "blindspotType": "Left_Blindspot",
    "asymmetryReason": "Opposition outlets focus on current tariff rates while completely omitting that emergency Power Purchase Agreements (PPAs) signed between 2013-2016 created a $1.2B annual excess capacity penalty.",
    "rawWireFactSummary": "Between 2012 and 2016, Ghana experienced widespread load shedding (Dumsor) for over 4 continuous years. Emergency PPAs contracted 5,081 MW of capacity against a peak national demand of 2,700 MW, resulting in mandatory take-or-pay financial obligations.",
    "rawWireSource": "Reuters",
    "articles": [
      {
        "id": "art-gh-03",
        "outletId": "out-citifm",
        "outletName": "Citi 97.3 FM / Citi Newsroom",
        "title": "Energy Sector Recovery Programme: Auditing Ghana's $1.2B Take-or-Pay Debt",
        "url": "https://citinewsroom.com/energy-take-or-pay-audit",
        "publishedAt": "2026-08-25T12:00:00Z",
        "author": "Bernard Avle",
        "cleanedContent": "Energy Ministry data indicates excess power contracted under emergency 2015 PPAs created long-term fiscal liabilities that required sovereign restructuring.",
        "lexicalLoad": 0.15,
        "sentimentScore": -0.1,
        "biasAlignment": "Center",
        "clusterId": "gh-cluster-2",
        "primarySubject": "Energy Sector"
      }
    ]
  },
  {
    "id": "gh-cluster-3",
    "representativeTitle": "Free SHS Policy Transformation (5.7 Million Beneficiaries) vs 2012\u20132016 Opposition Abolition Adverts",
    "category": "Education",
    "year": 2026,
    "firstReportedAt": "2026-08-20T07:30:00Z",
    "leftCoveragePct": 14,
    "centerCoveragePct": 36,
    "rightCoveragePct": 50,
    "totalArticlesCount": 68,
    "blindspotType": "Left_Blindspot",
    "asymmetryReason": "NDC communications pivot to claiming credit for progressively free concept while omitting over 40 radio/TV adverts aired in 2012 and 2016 calling universal Free SHS a dangerous impossibility.",
    "rawWireFactSummary": "NPP launched universal Free SHS in September 2017. Total senior high school enrolment surged from 881,600 in 2016 to over 1.45 million in 2024, graduating 5.7+ million students with all-time high WASSCE pass rates in core subjects.",
    "rawWireSource": "Associated Press",
    "articles": [
      {
        "id": "art-gh-04",
        "outletId": "out-graphic",
        "outletName": "Daily Graphic Online",
        "title": "Free SHS Turns 7: Record 5.7 Million Ghanaian Youth Educated Under Universal Scheme",
        "url": "https://graphic.com.gh/education/free-shs-milestone",
        "publishedAt": "2026-08-20T08:15:00Z",
        "author": "Severious Kale-Dery",
        "cleanedContent": "GES statistics confirm enrolment parity achieved between male and female students across all 16 regions with free tuition, boarding, and textbooks.",
        "lexicalLoad": 0.08,
        "sentimentScore": 0.55,
        "biasAlignment": "Center",
        "clusterId": "gh-cluster-3",
        "primarySubject": "Free SHS"
      }
    ]
  },
  {
    "id": "gh-cluster-4",
    "representativeTitle": "Auditor-General Indictment: SADA Afforestation & Guinea Fowl Expenditures ($33M) With Zero Returns",
    "category": "Governance",
    "year": 2026,
    "firstReportedAt": "2026-08-15T09:00:00Z",
    "leftCoveragePct": 5,
    "centerCoveragePct": 30,
    "rightCoveragePct": 65,
    "totalArticlesCount": 38,
    "blindspotType": "Left_Blindspot",
    "asymmetryReason": "Pro-NDC media completely blacked out the Auditor-General report on SADA dry-season tree planting and missing poultry exports.",
    "rawWireFactSummary": "The Auditor-General confirmed GHS 200M+ allocated to SADA for afforestation resulted in dead burnt trees planted in harmattan season, and guinea fowl joint ventures collapsed without commercial production.",
    "rawWireSource": "Reuters",
    "articles": [
      {
        "id": "art-gh-05",
        "outletId": "out-dailyguide",
        "outletName": "Daily Guide Network",
        "title": "SADA Ghost Trees and Missing Birds: The Tragic Mismanagement of Northern Development Funds",
        "url": "https://dailyguidenetwork.com/sada-forensic-report",
        "publishedAt": "2026-08-15T10:00:00Z",
        "author": "Alhaji Baba",
        "cleanedContent": "Forensic audits proved tree seedlings were planted in February dry season in the north, leading to 95% mortality rate of saplings.",
        "lexicalLoad": 0.82,
        "sentimentScore": -0.72,
        "biasAlignment": "Right",
        "clusterId": "gh-cluster-4",
        "primarySubject": "SADA Governance"
      }
    ]
  }
];

// ── 3. Ghanaian BERT Claims & Factuality Database ─────────────────────────────
export const GHANA_CLAIMS: ClaimRecord[] = [
  {
    id: "cl-gh-1",
    articleId: "art-joy-1",
    outletName: "Joy 99.7 FM",
    sentence: "The Ministry of Finance confirms $1.2B annual power debt legacy from the 2013-2016 take-or-pay energy contracts.",
    primaryLabel: "FACTUAL_CLAIM",
    confidence: 0.96,
    evidenceScore: 94,
    extractedTriplet: {
      subject: "Ministry of Finance",
      predicate: "confirms",
      object: "$1.2B annual take-or-pay debt"
    },
    evidenceStatus: "VERIFIED",
    evidenceDetails: {
      source: "Parliamentary Hansard & Finance Ministry Mid-Year Review",
      title: "Public Accounts and Take-or-Pay Power Sector Audit",
      url: "https://parliament.gh"
    },
    reviewStatus: "Audited",
    lineage: {
      speaker: "Minister for Finance",
      entityModel: "Parliament Hansard",
      confidenceContributions: [
        { factor: "Official Hansard Order Paper", weight: 30 },
        { factor: "Ministry of Finance Statement", weight: 25 },
        { factor: "Independent Energy Commission Data", weight: 20 }
      ],
      lastAuditTimestamp: "2026-09-04T12:00:00Z"
    }
  },
  {
    id: "cl-gh-2",
    articleId: "art-citi-2",
    outletName: "Citi 97.3 FM",
    sentence: "Under the original $200M Saglemi Housing contract, 5,000 units were to be built, but only 1,506 were partially executed.",
    primaryLabel: "FACTUAL_CLAIM",
    confidence: 0.98,
    evidenceScore: 98,
    extractedTriplet: {
      subject: "Saglemi Contract",
      predicate: "delivered",
      object: "1,506 units out of 5,000"
    },
    evidenceStatus: "VERIFIED",
    evidenceDetails: {
      source: "Auditor-General & High Court Proceedings",
      title: "State vs. Collins Dauda & 4 Others Record",
      url: "https://ghaudit.org"
    },
    reviewStatus: "Audited",
    lineage: {
      speaker: "Auditor-General Report",
      entityModel: "Judicial Record",
      confidenceContributions: [
        { factor: "Auditor-General Audit", weight: 35 },
        { factor: "High Court Docket", weight: 30 },
        { factor: "Ministry of Works and Housing Physical Inspection", weight: 25 }
      ],
      lastAuditTimestamp: "2026-09-04T12:00:00Z"
    }
  },
  {
    id: "cl-gh-3",
    articleId: "art-peace-3",
    outletName: "Peace 104.3 FM",
    sentence: "Teacher and Nursing trainee allowances were abolished in 2015 and later restored in 2017.",
    primaryLabel: "FACTUAL_CLAIM",
    confidence: 0.99,
    evidenceScore: 99,
    extractedTriplet: {
      subject: "Trainee Allowances",
      predicate: "cancelled in 2015, restored in 2017",
      object: "Teacher & Nursing Students"
    },
    evidenceStatus: "VERIFIED",
    evidenceDetails: {
      source: "Ministry of Education Gazette & National Budget Statements",
      title: "Trainee Allowance Payroll Subvention Record",
      url: "https://mofep.gov.gh"
    },
    reviewStatus: "Audited",
    lineage: {
      speaker: "Ministry of Education",
      entityModel: "Budget Statement",
      confidenceContributions: [
        { factor: "National Budget Statement 2015/2017", weight: 40 },
        { factor: "CAGD Payroll Telemetry", weight: 30 }
      ],
      lastAuditTimestamp: "2026-09-04T12:00:00Z"
    }
  }
];

// ── 4. Ghanaian Knowledge Graph Nodes & Edges ─────────────────────────────────
export const GHANA_GRAPH_NODES: KnowledgeGraphNode[] = [
  {
    id: "node-mahama",
    label: "John Dramani Mahama",
    type: "Entity",
    properties: {
      mentionsCount: 420,
      biasAffinity: "Left",
      role: "Former President & NDC Presidential Candidate"
    }
  },
  {
    id: "node-bawumia",
    label: "Dr. Mahamudu Bawumia",
    type: "Entity",
    properties: {
      mentionsCount: 450,
      biasAffinity: "Right",
      role: "Vice President & NPP Presidential Candidate"
    }
  },
  {
    id: "node-freeshs",
    label: "Free SHS Policy",
    type: "Evidence",
    properties: {
      mentionsCount: 680,
      biasAffinity: "Center",
      category: "Education Policy"
    }
  },
  {
    id: "node-dumsor",
    label: "4-Year Dumsor Crisis (2012-2016)",
    type: "Evidence",
    properties: {
      mentionsCount: 520,
      biasAffinity: "Left",
      category: "Energy & Infrastructure"
    }
  },
  {
    id: "node-saglemi",
    label: "Saglemi $200M Housing Project",
    type: "Evidence",
    properties: {
      mentionsCount: 380,
      biasAffinity: "Left",
      category: "Housing & Public Funds"
    }
  },
  {
    id: "node-sada",
    label: "SADA Afforestation & Guinea Fowl",
    type: "Evidence",
    properties: {
      mentionsCount: 290,
      biasAffinity: "Left",
      category: "Agriculture & Governance"
    }
  },
  {
    id: "node-eblocks",
    label: "200 Community Day E-Blocks",
    type: "Evidence",
    properties: {
      mentionsCount: 310,
      biasAffinity: "Left",
      category: "Secondary Education"
    }
  },
  {
    id: "node-trainee",
    label: "Teacher & Nursing Trainee Allowances",
    type: "Evidence",
    properties: {
      mentionsCount: 340,
      biasAffinity: "Right",
      category: "Tertiary Allowances"
    }
  }
];

export const GHANA_GRAPH_EDGES: KnowledgeGraphEdge[] = [
  {
    id: "edge-1",
    source: "node-mahama",
    target: "node-saglemi",
    relation: "CONTRIBUTES_TO",
    confidence: 0.95
  },
  {
    id: "edge-2",
    source: "node-mahama",
    target: "node-dumsor",
    relation: "CONTRIBUTES_TO",
    confidence: 0.98
  },
  {
    id: "edge-3",
    source: "node-mahama",
    target: "node-eblocks",
    relation: "SUPPORTED_BY",
    confidence: 0.92
  },
  {
    id: "edge-4",
    source: "node-bawumia",
    target: "node-freeshs",
    relation: "SUPPORTED_BY",
    confidence: 0.96
  },
  {
    id: "edge-5",
    source: "node-bawumia",
    target: "node-trainee",
    relation: "SUPPORTED_BY",
    confidence: 0.94
  }
];

// ── 5. Ghanaian TV & Radio Station Scorecards ─────────────────────────────────
export const GHANA_TV_SCORECARDS: TVStationScorecard[] = [
  {
    "id": "sc-joynews",
    "networkName": "Joy 99.7 FM / JoyNews \u2014 Newsfile & SMS",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 1,
        "pointsDeducted": 5,
        "details": [
          "Minor delay in breaking initial local government audit annexes"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 30,
        "pointsDeducted": 0,
        "details": "30% legal & political commentary vs 70% primary documentary & statutory evidence"
      },
      "linguisticLoad": {
        "persistentSpinDetected": false,
        "pointsDeducted": 0,
        "flaggedTerms": []
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Immediate on-air clarifications and legal retractions enforced by Samson Lardy Anyenini"
      }
    },
    "finalScore": 95,
    "grade": "A",
    "keyAnalyticalFindings": "Gold standard of evidentiary journalism in Ghana. Newsfile rigorously cites High Court dockets, Auditor-General reports, and Parliamentary Hansards with balanced cross-examination of NDC and NPP representatives."
  },
  {
    "id": "sc-cititv",
    "networkName": "Citi 97.3 FM / Citi TV \u2014 Point of View & CBS",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 1,
        "pointsDeducted": 5,
        "details": [
          "Omitted preliminary sub-district council revenue allocations"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 25,
        "pointsDeducted": 0,
        "details": "25% commentary vs 75% macroeconomic data trends, BoG tables, and fiscal charts"
      },
      "linguisticLoad": {
        "persistentSpinDetected": false,
        "pointsDeducted": 0,
        "flaggedTerms": []
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Transparent digital corrections logged on Citi Newsroom"
      }
    },
    "finalScore": 95,
    "grade": "A",
    "keyAnalyticalFindings": "Unrivaled leader in data visualization and empirical macroeconomic policy analysis led by Bernard Avle. Cites official Bank of Ghana, Energy Commission, and IMF staff reports."
  },
  {
    "id": "sc-peacefm",
    "networkName": "Peace 104.3 FM \u2014 Kokrokoo Morning Show",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 2,
        "pointsDeducted": 10,
        "details": [
          "Trimmed complex statutory audit tables in favor of high-energy morning political debate"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 52,
        "pointsDeducted": 10,
        "details": "52% panelist political sparring vs 48% news bulletins (>40% opinion threshold)"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"gargantuan deceit\"",
          "\"pure political mischief\"",
          "\"unbelievable propaganda\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Host Kwami Sefa Kayi strictly enforces right of reply and live on-air caller fact checks"
      }
    },
    "finalScore": 70,
    "grade": "C",
    "keyAnalyticalFindings": "Ghana's most powerful mass-market morning agenda setter. Highly engaging Akan dialogue with regular veterans (Kweku Baako, Kwesi Pratt, Nana Akomea, Allotey Jacobs), but carries high rhetorical spin from partisan spokespersons."
  },
  {
    "id": "sc-asempa",
    "networkName": "Asempa 94.7 FM \u2014 Ekosii Sen",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 1,
        "pointsDeducted": 5,
        "details": [
          "Condensed parliamentary select committee annexes"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 48,
        "pointsDeducted": 10,
        "details": "48% combative studio debate vs 52% investigative interviews (>40% threshold)"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"total disaster\"",
          "\"masterstroke\"",
          "\"empty promise\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Host Philip Osei Bonsu (O.B.) conducts real-time live telephone cross-examinations of ministers"
      }
    },
    "finalScore": 75,
    "grade": "C",
    "keyAnalyticalFindings": "The supreme afternoon political cockpit. Rapid-fire cross-examinations of NDC Communications Officer Sammy Gyamfi and NPP Communications Director Richard Ahiagbah. Sharp fact-checking by host O.B."
  },
  {
    "id": "sc-adomfm",
    "networkName": "Adom 106.3 FM / Adom TV \u2014 Dwaso Nsem & Badwam",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 2,
        "pointsDeducted": 10,
        "details": [
          "Prioritized street vox-pops over macro-fiscal debt sustainability models"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 45,
        "pointsDeducted": 10,
        "details": "45% grassroots opinion vs 55% news and investigative segments"
      },
      "linguisticLoad": {
        "persistentSpinDetected": false,
        "pointsDeducted": 0,
        "flaggedTerms": []
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Standard corrections logged on Adomonline"
      }
    },
    "finalScore": 80,
    "grade": "B",
    "keyAnalyticalFindings": "Strong voice for the ordinary Ghanaian citizen, capturing ground truth from Makola and Kejetia market women, hairdressers, and rural health clinics."
  },
  {
    "id": "sc-omanfm",
    "networkName": "Oman 107.1 FM / Net2 TV \u2014 National Agenda & Boiling Point",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 3,
        "pointsDeducted": 15,
        "details": [
          "Omitted opposition macroeconomic counter-arguments and social vulnerability concerns"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 65,
        "pointsDeducted": 10,
        "details": "65% partisan monologue & conservative political analysis (>40% threshold)"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"incompetent thieves\"",
          "\"unpatriotic sabotage\"",
          "\"monumental looting\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Editorial clarifications provided by host Fiifi Boafo"
      }
    },
    "finalScore": 65,
    "grade": "D",
    "keyAnalyticalFindings": "Aggressive, unfiltered anti-opposition investigative broadcasts. Unmatched documentation on SADA, GYEEDA, Bus Branding, and Saglemi procurement, but heavily partisan tone."
  },
  {
    "id": "sc-radiogold",
    "networkName": "Radio Gold 90.5 FM \u2014 Alhaji & Alhaji",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 4,
        "pointsDeducted": 20,
        "details": [
          "Completely omitted High Court Saglemi criminal charge sheets, 4-year Dumsor take-or-pay debt, and Free SHS 5.7M graduation data"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 75,
        "pointsDeducted": 10,
        "details": "75% partisan anti-government commentary vs 25% news (>40% threshold)"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"oppressive regime\"",
          "\"economic collapse\"",
          "\"stolen mandate\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 1,
        "pointsDeducted": 25,
        "details": "Failed to retract false assertion that Free SHS pass rates had declined"
      }
    },
    "finalScore": 35,
    "grade": "F",
    "keyAnalyticalFindings": "Extreme partisan pro-NDC framing on Saturday flagship Alhaji & Alhaji. Consistently suppresses statutory audit findings against past NDC ministers and amplifies unverified economic assertions."
  },
  {
    "id": "sc-tv3",
    "networkName": "TV3 Ghana / 3FM \u2014 The KeyPoints & 3FM Sunrise",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 2,
        "pointsDeducted": 10,
        "details": [
          "Omitted historical PPA debt comparisons when critiquing current energy utility tariffs"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 55,
        "pointsDeducted": 10,
        "details": "55% studio cross-fire debate vs 45% straight documentary news"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"collapsing healthcare\"",
          "\"betrayal of youth\"",
          "\"fiscal wreck\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Standard on-air editorial errata logged"
      }
    },
    "finalScore": 70,
    "grade": "C",
    "keyAnalyticalFindings": "High-production national political programming on The KeyPoints. Robust debate moderated by Alfred Ocansey, but occasionally allows unverified claims from panel partisans to pass without immediate fact-check correction."
  },
  {
    "id": "sc-asaase",
    "networkName": "Asaase 99.5 FM \u2014 The Asaase Breakfast Show",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 1,
        "pointsDeducted": 5,
        "details": [
          "Light coverage of rural food inflation indices"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 32,
        "pointsDeducted": 0,
        "details": "32% editorial commentary vs 68% expert macroeconomic and policy briefings"
      },
      "linguisticLoad": {
        "persistentSpinDetected": false,
        "pointsDeducted": 0,
        "flaggedTerms": []
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "Transparent policy corrections logged"
      }
    },
    "finalScore": 95,
    "grade": "A",
    "keyAnalyticalFindings": "High intellectual caliber and deep policy focus on sovereign debt, Gold-for-Oil, and energy infrastructure led by Wilberforce Asare."
  },
  {
    "id": "sc-angelfm",
    "networkName": "Angel 102.9 FM \u2014 Anopa B\u0254fo\u0254",
    "trackingPeriod": "August 2026 (Live Ghana Broadcast Monitor)",
    "baseScore": 100,
    "deductions": {
      "storyOmissions": {
        "count": 2,
        "pointsDeducted": 10,
        "details": [
          "Omitted parliamentary minority committee rejoinders on road infrastructure funds"
        ]
      },
      "factToOpinionRatio": {
        "opinionPercentage": 44,
        "pointsDeducted": 10,
        "details": "44% host monologue vs 56% investigative field reporting"
      },
      "linguisticLoad": {
        "persistentSpinDetected": true,
        "pointsDeducted": 10,
        "flaggedTerms": [
          "\"heartbreaking neglect\"",
          "\"shocking expose\"",
          "\"hopeless leadership\""
        ]
      },
      "correctionTransparency": {
        "unretractedErrors": 0,
        "pointsDeducted": 0,
        "details": "On-air telephone corrections provided by public PROs"
      }
    },
    "finalScore": 70,
    "grade": "C",
    "keyAnalyticalFindings": "Sensationalist yet high-impact grassroots ombudsman reporting. Breaks critical ground-level investigations into local district corruption, hospital shortages, and road contracts."
  }
];

// ── 6. Ghanaian Editorial Spin Deconstruction Cases ───────────────────────────
export const GHANA_SPIN_CASES: SpinComparisonCase[] = [
  {
    "id": "spin-gh-001",
    "topic": "Saglemi Housing $200M Project & Criminal Trial",
    "groundTruthText": "The Republic of Ghana secured a $200M loan to construct 5,000 housing units. The Ministry disbursed $196M but only 668 incomplete, unlivable shells without water or electricity were delivered, leading to High Court Suit No. CR/0248/2021 against former ministers for causing financial loss to the state.",
    "leftHeadline": "NPP Government Abandons Mahama Affordable Housing Milestone Due to Pure Political Petty Jealousy",
    "leftOutlet": "Radio Gold / Pro-NDC Media",
    "leftFramingAnalysis": "Frames the stalled development as vindictive political neglect ('petty jealousy', 'abandons') while completely omitting the $196M disbursement for only 668 uninhabitable shells and the ongoing criminal breach of contract trials.",
    "leftLoadedWords": [
      "pure political jealousy",
      "abandoned milestone",
      "vindictive neglect",
      "depriving citizens"
    ],
    "rightHeadline": "Saglemi Housing Scandal: How NDC Officials Paid $196M for 668 Incomplete Concrete Shells in Criminal Breach",
    "rightOutlet": "Daily Guide / Oman FM / Accountability Desks",
    "rightFramingAnalysis": "Emphasizes the criminal charge sheet and financial dissipation metrics ('scandal', 'criminal breach', 'ghost apartments') to indict former administration leadership.",
    "rightLoadedWords": [
      "monumental fraud",
      "criminal breach",
      "ghost apartments",
      "squandered $196M"
    ],
    "omissionsAnalysis": "NDC framing omits the missing 4,332 houses and court charge sheets; NPP framing omits infrastructure completion cost feasibility studies conducted by subsequent committees."
  },
  {
    "id": "spin-gh-002",
    "topic": "4-Year Dumsor Power Crisis & $1.2B Annual Take-or-Pay Excess Capacity Contracts",
    "groundTruthText": "Between 2012 and 2016, Ghana experienced over 4 years of severe power load shedding (Dumsor). To resolve it, emergency Power Purchase Agreements (PPAs) were contracted for 5,081 MW against peak national demand of 2,700 MW, resulting in mandatory $1.2 Billion annual take-or-pay financial obligations.",
    "leftHeadline": "Mahama Admin Solved Dumsor Before Leaving Office by Contracting Massive Generation Capacity",
    "leftOutlet": "Radio Gold / NDC Communication Bureau",
    "leftFramingAnalysis": "Claims complete heroic victory ('solved Dumsor', 'massive capacity') while concealing that the signed take-or-pay clauses created a catastrophic $1.2B/year debt trap for power the country could not consume.",
    "leftLoadedWords": [
      "solved dumsor",
      "unprecedented capacity",
      "visionary infrastructure",
      "unappreciated fix"
    ],
    "rightHeadline": "NDC Emergency PPA Trap: How Mahama Signed Crippling $1.2B Annual Take-or-Pay Debt for Unused Power",
    "rightOutlet": "Citi FM / Asaase Radio / Energy Briefings",
    "rightFramingAnalysis": "Focuses on sovereign fiscal distress ('crippling debt trap', 'reckless contracts') to demonstrate long-term economic mismanagement inherited by taxpayers.",
    "rightLoadedWords": [
      "crippling debt trap",
      "reckless contracts",
      "bankrupted energy sector",
      "strangled economy"
    ],
    "omissionsAnalysis": "NDC framing omits the $1.2B annual idle power payments and the 4 years of power cuts; NPP framing omits the intense national emergency pressure during 2015 that drove rapid power procurement."
  },
  {
    "id": "spin-gh-003",
    "topic": "Universal Free Senior High School (Free SHS) Rollout vs 2012 Opposition Campaigns",
    "groundTruthText": "In September 2017, the NPP administration implemented Universal Free Senior High School, eliminating tuition, admission, library, science, computer, and boarding fees, expanding secondary enrolment from 881,600 to 1.45+ million students with 5.7+ million cumulative beneficiaries.",
    "leftHeadline": "Free SHS Facing Massive Quality Crisis: Poor Food Supplies and Infrastructure Deficits Compromising Future",
    "leftOutlet": "Joy FM Panellists / NDC Communications",
    "leftFramingAnalysis": "Centering narrative on logistical bottlenecks ('massive quality crisis', 'compromising future') while avoiding acknowledgement of the 40+ opposition adverts aired in 2012 calling Free SHS a dangerous lie.",
    "leftLoadedWords": [
      "massive quality crisis",
      "shambolic implementation",
      "food shortages",
      "compromised education"
    ],
    "rightHeadline": "Free SHS Historic Triumph: 5.7 Million Ghanaian Youths Educated with Record WASSCE Pass Rates Under Bawumia & Akufo-Addo",
    "rightOutlet": "Peace FM / Daily Graphic / Ministry of Education",
    "rightFramingAnalysis": "Frames the policy as an epochal, flawless social revolution ('historic triumph', 'record pass rates') while minimizing regional food distribution challenges.",
    "rightLoadedWords": [
      "historic triumph",
      "generational transformation",
      "record pass rates",
      "broken poverty cycle"
    ],
    "omissionsAnalysis": "NDC framing omits that their 2012 manifesto dismissed Free SHS as unworkable; NPP framing omits persistent Buffer Stock food delivery delays in rural schools."
  },
  {
    "id": "spin-gh-004",
    "topic": "2015 Senchi 'Homegrown' Pledge vs IMF Bailout & Trainee Allowance Cancellations",
    "groundTruthText": "At the May 2014 Senchi Economic Forum, NDC leadership pledged to use homegrown solutions without seeking an IMF program. In April 2015, Ghana signed a $918M IMF Extended Credit Facility mandating public sector hiring freezes and the cancellation of teacher and nursing trainee allowances.",
    "leftHeadline": "IMF Program Was a Prudent Strategic Partnership to Stabilize Economy Against External Commodity Shocks",
    "leftOutlet": "Radio Gold / NDC Finance Team Statements",
    "leftFramingAnalysis": "Re-brands the bailout as a sophisticated 'strategic partnership' caused purely by global oil price drops, omitting the Senchi anti-IMF pledge and trainee allowance cancellations.",
    "leftLoadedWords": [
      "strategic partnership",
      "external commodity shocks",
      "prudent management",
      "macro-stability"
    ],
    "rightHeadline": "The Senchi Deception: How NDC Lied About Homegrown Solutions Before Rushing to IMF and Scrapping Trainee Allowances",
    "rightOutlet": "Oman FM / Peace FM / Economic Analysis",
    "rightFramingAnalysis": "Highlights the direct contradiction between public promises and IMF conditionality ('Senchi Deception', 'scrapping allowances', 'surrendered sovereignty').",
    "rightLoadedWords": [
      "senchi deception",
      "capitulation",
      "crushed trainee nurses",
      "reckless borrowing"
    ],
    "omissionsAnalysis": "NDC framing omits the strict IMF conditions that froze teacher employment; NPP framing omits the severe decline in gold and cocoa commodity prices in 2014."
  },
  {
    "id": "spin-gh-005",
    "topic": "SADA $33M Guinea Fowl and Afforestation Projects Audit",
    "groundTruthText": "The Auditor-General and ministerial forensic inquiries found that GHS 47M ($33M USD) allocated to SADA for afforestation and guinea fowl breeding yielded zero exported poultry and 95% desiccated tree saplings due to dry season bushfires, resulting in criminal convictions of key executives.",
    "leftHeadline": "SADA Northern Development Vision Was Well-Intentioned Initiative Sabotaged by Hostile Climatic Weather",
    "leftOutlet": "Radio Gold / Former SADA Leadership",
    "leftFramingAnalysis": "Blames weather conditions and harmattan fires ('sabotaged by climate') to absolve procurement violations and unverified sole-sourced disbursements.",
    "leftLoadedWords": [
      "well-intentioned vision",
      "hostile climate",
      "unforeseen weather",
      "northern upliftment"
    ],
    "rightHeadline": "The Guinea Fowl Scandal: How Millions Vanished with Phantom Birds Flying to Burkina Faso Under NDC SADA",
    "rightOutlet": "Joy FM Investigations / Daily Guide / Peace FM",
    "rightFramingAnalysis": "Focuses on the satirical and criminal aspects ('phantom birds', 'millions vanished') and court convictions for embezzlement.",
    "rightLoadedWords": [
      "phantom birds",
      "vanished millions",
      "looted public purse",
      "jailed officials"
    ],
    "omissionsAnalysis": "NDC framing omits lack of competitive bidding and Auditor-General disallowances; NPP framing omits early feasibility research conducted for Northern savanna development."
  }
];
