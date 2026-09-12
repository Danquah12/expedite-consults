export interface GhanaHotTopicDossier {
  id: string;
  topicTitle: string;
  category: string;
  viralIndex: number; // 0 - 100
  polarizationScore: number; // 0 - 100
  summary: string;
  undisputedFacts: string[];
  ndcNarrative: {
    coreArgument: string;
    keyEmphases: string[];
    blindspotOmission: string;
    sampleHeadlines: { outlet: string; headline: string; url: string }[];
  };
  nppNarrative: {
    coreArgument: string;
    keyEmphases: string[];
    blindspotOmission: string;
    sampleHeadlines: { outlet: string; headline: string; url: string }[];
  };
  unbiasedVerdict: string;
  primaryDockets: {
    name: string;
    type: string;
    url: string;
    citation: string;
  }[];
  tags: string[];
}

export const GHANA_CURATED_HOT_TOPICS: GhanaHotTopicDossier[] = [
  // ── 1. FREE SHS POLICY TRANSFORMATION ──
  {
    id: 'gh-hot-freeshs',
    topicTitle: 'Universal Free SHS Policy vs. 2012–2016 Opposition Abolition Adverts',
    category: 'Education & Human Capital',
    viralIndex: 98,
    polarizationScore: 92,
    summary: 'A defining national debate on universal free secondary education in Ghana, contrasting the NPP implementation of Free SHS (5.7M beneficiaries) with the historical NDC opposition advertisements in 2012-2016.',
    undisputedFacts: [
      'NPP implemented universal Free SHS in September 2017, eliminating tuition, admission, library, science, computer lab, examination, and boarding/feeding fees.',
      'Total senior high school enrolment expanded from 881,600 in 2016 to over 1.45 million in 2024 (5.7+ million total graduates to date).',
      'During the 2012 and 2016 election cycles, the NDC broadcast over 40 radio and television adverts claiming universal Free SHS was an impossible gimmick that would destroy education.'
    ],
    ndcNarrative: {
      coreArgument: 'The 1992 Constitution mandates "progressively free" education; the sudden universal rollout caused severe infrastructure congestion (Gold/Green tracks) and compromised food quality in schools.',
      keyEmphases: ['Need for a comprehensive 90-day review', 'Expanding subsidies to private secondary schools', 'Decentralizing food procurement to headmasters'],
      blindspotOmission: 'Completely omits the intensive multi-year media campaign between 2012-2016 that opposed the feasibility of universal Free SHS.',
      sampleHeadlines: [
        { outlet: 'The Herald Ghana', headline: 'Free SHS Facing Logistics Crisis as PTA Demands Decentralized Food Supply', url: 'https://theheraldghana.com' },
        { outlet: 'TV3 Ghana', headline: 'Mahama Pledges 90-Day Review of Free SHS Implementation', url: 'https://3news.com' }
      ]
    },
    nppNarrative: {
      coreArgument: 'Free SHS is the greatest social equalizer in Ghana since independence, removing financial barriers for millions of underprivileged students while delivering historic high WASSCE pass rates.',
      keyEmphases: ['5.7 million beneficiaries with gender parity', 'Record WASSCE core subject performance', 'Guaranteed state budget protection through ABFA oil revenues'],
      blindspotOmission: 'Minimizes occasional localized delays in food buffer stock distribution to boarding schools in rural districts.',
      sampleHeadlines: [
        { outlet: 'Daily Guide Network', headline: 'Free SHS Success: 5.7M Educated as Ghana Beats WASSCE Records', url: 'https://dailyguidenetwork.com' },
        { outlet: 'Daily Graphic Online', headline: 'Education Transformation: How Free SHS Closed Gender Gap in Ghanaian Schools', url: 'https://graphic.com.gh' }
      ]
    },
    unbiasedVerdict: 'The data conclusively proves Free SHS dramatically democratized secondary school access, lifting enrollment by over 65% with higher WASSCE pass rates than the pre-Free SHS era. The political controversy centers on historical opposition versus execution model.',
    primaryDockets: [
      { name: 'Ministry of Education / GES', type: 'Administrative Audit', url: 'https://ges.gov.gh', citation: 'GES Annual Education Sector Performance Report (2017-2024)' },
      { name: 'West African Examinations Council (WAEC)', type: 'Statistical Gazette', url: 'https://waecgh.org', citation: 'WAEC WASSCE Ghana National Performance Statistics' }
    ],
    tags: ['Free SHS', 'Education', 'WASSCE', 'GES', 'Mahama', 'Bawumia', 'NPP', 'NDC']
  },

  // ── 2. DUMSOR CRISIS & TAKE-OR-PAY ARREARS ──
  {
    id: 'gh-hot-dumsor',
    topicTitle: 'The 4-Year Dumsor Load Shedding Crisis & $1.2B Annual Take-or-Pay Debt',
    category: 'Energy & National Infrastructure',
    viralIndex: 95,
    polarizationScore: 89,
    summary: 'A critical audit of Ghana\'s energy sector evaluating the causes and management of the 2012-2016 4-year power crisis (Dumsor) and the resulting emergency Power Purchase Agreements.',
    undisputedFacts: [
      'Ghana suffered severe rolling blackouts (Dumsor) continuously from 2012 through late 2016, collapsing thousands of SMEs and cold-store businesses.',
      'Emergency PPAs signed during 2013-2016 contracted over 5,081 MW of installed capacity against a peak national demand of only 2,700 MW.',
      'The take-or-pay contractual clauses obligated the Ghanaian government to pay over $1.2 Billion annually for unconsumed, idle electricity generation capacity.'
    ],
    ndcNarrative: {
      coreArgument: 'The NDC administration added generational power capacity to the national grid, resolving the structural generation deficit before exiting office in 2016.',
      keyEmphases: ['Procured emergency Karpowership and Ameri plants', 'Expanded generation installed capacity', 'Resolved fuel supply bottlenecks with Atuabo Gas Plant'],
      blindspotOmission: 'Completely ignores the catastrophic fiscal burden of take-or-pay contracts that saddled subsequent governments with $1.2B in annual unconsumed capacity penalties.',
      sampleHeadlines: [
        { outlet: 'The Herald Ghana', headline: 'NDC Energy Policy Ended Generation Shortfall with Karpower and Ameri', url: 'https://theheraldghana.com' },
        { outlet: 'GhanaWeb Politics', headline: 'We Left Enough Installed Capacity for the Nation — NDC Energy Team', url: 'https://ghanaweb.com' }
      ]
    },
    nppNarrative: {
      coreArgument: 'The NDC mismanaged energy procurement into a predatory take-or-pay debt trap that cost the country billions, which the NPP had to renegotiate through the Energy Sector Recovery Programme.',
      keyEmphases: ['4 years of business collapse under Dumsor', '$1.2B annual take-or-pay waste', 'Clearing legacy energy debt and securing gas supply'],
      blindspotOmission: 'Minimizes occasional distribution network maintenance outages managed by ECG.',
      sampleHeadlines: [
        { outlet: 'Daily Guide Network', headline: 'Dumsor Legacy: How 2015 Take-or-Pay Contracts Drained Ghana\'s Treasury', url: 'https://dailyguidenetwork.com' },
        { outlet: 'Citi Newsroom', headline: 'Energy Sector Recovery: Government Restructures Expensive 2015 PPAs', url: 'https://citinewsroom.com' }
      ]
    },
    unbiasedVerdict: 'Independent grid data confirms the 4-year crisis was generational, but the emergency procurement response resulted in severe over-capacity contracts with take-or-pay clauses that severely damaged Ghana\'s fiscal stability.',
    primaryDockets: [
      { name: 'Energy Commission of Ghana', type: 'Energy Balance Gazette', url: 'http://www.energycom.gov.gh', citation: 'National Energy Statistics 2000-2024' },
      { name: 'Ministry of Finance / ESRP', type: 'Fiscal Policy Document', url: 'https://mofep.gov.gh', citation: 'Energy Sector Recovery Programme (ESRP) Debt Audit' }
    ],
    tags: ['Dumsor', 'Energy', 'Take-or-Pay', 'ECG', 'GRIDCo', 'Power Crisis', 'SMEs']
  },

  // ── 3. SAGLEMI $200M HOUSING AUDIT ──
  {
    id: 'gh-hot-saglemi',
    topicTitle: '$200M Saglemi Affordable Housing Scandal: 668 Incomplete Shells Delivered',
    category: 'Public Procurement & Governance',
    viralIndex: 94,
    polarizationScore: 91,
    summary: 'Forensic dissection of the $200 million Saglemi housing contract where a parliamentary approval for 5,000 completed units was scaled down without approval to 1,506 units with only 668 uninhabitable shells built.',
    undisputedFacts: [
      'Parliament in 2012 approved a $200M Credit Suisse loan facility for 5,000 completed housing units for Ghanaian civil servants and low-income workers.',
      'The NDC Ministry of Works & Housing signed an amended contract reducing the scope to 1,506 units for the exact same $200M without parliamentary approval.',
      'By 2016, approximately $196M was disbursed but only 668 incomplete, empty shells were erected, lacking water, sewage, electricity, and access roads.'
    ],
    ndcNarrative: {
      coreArgument: 'Saglemi was structured as a phased multi-stage project; the NPP administration deliberately abandoned a national asset for 8 years out of partisan malice.',
      keyEmphases: ['Phased project execution', 'Accusing government of asset decay', 'Calling for completion rather than prosecution'],
      blindspotOmission: 'Blacks out the illegal contract amendment that spent $196M on 668 incomplete shells instead of 5,000 completed homes.',
      sampleHeadlines: [
        { outlet: 'The Herald Ghana', headline: 'Government Sits on Saglemi Housing While Ghanaians Face Rent Deficit', url: 'https://theheraldghana.com' },
        { outlet: 'TV3 Ghana', headline: 'NDC Minority Inspects Saglemi, Condemns 8 Years of Asset Abandonment', url: 'https://3news.com' }
      ]
    },
    nppNarrative: {
      coreArgument: 'Saglemi represents massive state financial loss where $200M was paid out for zero livable homes; the site requires an additional $100M+ just to build off-site water and electrical infrastructure.',
      keyEmphases: ['Criminal trial of former ministers', 'Unapproved contract variation from 5,000 to 1,506', 'Private developer concession to salvage taxpayers funds'],
      blindspotOmission: 'Minimizes the 8-year delay in arriving at a private developer concession solution to salvage the site.',
      sampleHeadlines: [
        { outlet: 'Daily Guide Network', headline: 'Saglemi Fraud: How $200M Was Paid for Empty Concrete Shells', url: 'https://dailyguidenetwork.com' },
        { outlet: 'Joy Online', headline: 'Saglemi Housing: Government Initiates Private Sector Concession to Complete Units', url: 'https://myjoyonline.com' }
      ]
    },
    unbiasedVerdict: 'Parliamentary records and Auditor-General reports verify that the state paid $196M for 668 uninhabitable shells without basic utilities, representing one of the most severe procurement value-for-money failures in Ghana\'s history.',
    primaryDockets: [
      { name: 'High Court of Ghana (Criminal Division)', type: 'Court Docket', url: 'https://judicial.gov.gh', citation: 'Suit No. CR/0248/2021 (The Republic v. Collins Dauda & 4 Others)' },
      { name: 'Auditor-General Department', type: 'Special Audit', url: 'https://ghaudit.org', citation: 'Special Audit Report on the Saglemi Affordable Housing Project' }
    ],
    tags: ['Saglemi', 'Housing', 'Corruption', 'Procurement', 'Auditor-General', 'Collins Dauda']
  },

  // ── 4. TEACHER & NURSING TRAINEE ALLOWANCES ──
  {
    id: 'gh-hot-allowances',
    topicTitle: 'Teacher & Nursing Trainee Allowances (2015 Scrapping vs. 2017 Restoration)',
    category: 'Social Welfare & Health',
    viralIndex: 91,
    polarizationScore: 86,
    summary: 'Examining the political and economic battle over trainee allowances, scrapped by the NDC in 2015 under IMF conditionalities and restored by the NPP in 2017.',
    undisputedFacts: [
      'In 2015, the NDC administration completely abolished Teacher and Nursing trainee allowances, forcing students onto the Student Loan scheme.',
      'In the 2016 campaign, the NPP promised to restore all trainee allowances within its first budget.',
      'In September 2017, the NPP restored trainee allowances across all 46 Public Colleges of Education and over 90 Nursing Training Colleges nationwide.'
    ],
    ndcNarrative: {
      coreArgument: 'Abolishing the quota system and allowances allowed training colleges to expand admission intake by over 60%, opening doors for thousands of qualified applicants.',
      keyEmphases: ['Expanding college enrollment quotas', 'Migrating to Student Loan Trust Fund', 'Fiscal sustainability'],
      blindspotOmission: 'Omits the massive economic hardship inflicted on rural teacher trainees who relied on allowances for basic feeding and book fees.',
      sampleHeadlines: [
        { outlet: 'The Herald Ghana', headline: 'Student Loan Model More Sustainable Than Allowance Quotas — NDC', url: 'https://theheraldghana.com' }
      ]
    },
    nppNarrative: {
      coreArgument: 'Restoring trainee allowances fulfilled a solemn covenant with Ghanaian youth, supporting healthcare and education human capital development.',
      keyEmphases: ['Promise kept in 2017', 'Financial relief for 100,000+ trainees annually', 'Revitalizing teacher and nursing workforce'],
      blindspotOmission: 'Minimizes occasional multi-month payment arrears caused by MoF warrant processing cycles.',
      sampleHeadlines: [
        { outlet: 'Daily Guide Network', headline: 'Promise Kept: Trainee Allowances Disbursed to 100,000 Nursing Students', url: 'https://dailyguidenetwork.com' },
        { outlet: 'Graphic Online', headline: 'Government Releases GHS 240M for Teacher Trainee Allowances', url: 'https://graphic.com.gh' }
      ]
    },
    unbiasedVerdict: 'The policy trajectory is clear: the NDC scrapped the allowances in 2015 as part of IMF fiscal consolidation, and the NPP fulfilled its campaign pledge to reinstate them in 2017.',
    primaryDockets: [
      { name: 'Ministry of Finance', type: 'Annual Budget Statement', url: 'https://mofep.gov.gh', citation: '2017 Budget Statement and Economic Policy (Section on Trainee Grants)' }
    ],
    tags: ['Trainee Allowances', 'Nursing', 'Teachers', 'Colleges of Education', 'IMF 2015']
  }
];
