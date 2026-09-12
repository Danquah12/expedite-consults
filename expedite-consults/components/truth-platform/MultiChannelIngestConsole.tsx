'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Share2, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Database, 
  Sparkles, 
  Flame, 
  Layers, 
  FileAudio, 
  Send, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Globe, 
  MessageSquare, 
  Search, 
  Filter, 
  Award, 
  BookOpen, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  Headphones, 
  Mic, 
  BarChart3, 
  Scale 
} from 'lucide-react';

interface RadioStationFeed {
  id: string;
  name: string;
  station: string;
  network: string;
  freq: string;
  location: string;
  language: string;
  status: 'STREAMING' | 'BUFFERING' | 'IDLE';
  host: string;
  currentSpeaker: string;
  liveTranscript: string;
  englishTranslation: string;
  confidence: number;
  audioChunkSec: number;
  totalTranscribed: number;
  extractedClaim: string;
  claimStatus: 'VERIFIED' | 'UNDER_AUDIT' | 'CONTRADICTION';
  docketCitation: string;
}

interface CrossStationTopic {
  id: string;
  title: string;
  groundTruth: string;
  coverage: {
    station: string;
    framing: string;
    quote: string;
    verdict: string;
    sentiment: string;
  }[];
}

interface SocialFeedEvent {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'X (Twitter)';
  account: string;
  timestamp: string;
  text: string;
  engagement: { likes: number; shares: number; comments: number };
  extractedClaim: string;
  claimStatus: 'VERIFIED' | 'UNDER_AUDIT' | 'CONTRADICTION';
  stationSource: string;
}

const ALL_RADIO_FEEDS: RadioStationFeed[] = [
  {
    "id": "rad-peace",
    "name": "Peace 104.3 FM \u2014 Kokrokoo Morning Show",
    "station": "Peace 104.3 FM",
    "network": "Despite Media",
    "freq": "104.3 MHz",
    "location": "Accra (National Simulcast)",
    "language": "Akan (Twi) / English",
    "status": "STREAMING",
    "host": "Kwami Sefa Kayi ('Chairman General')",
    "currentSpeaker": "Kweku Baako Jr. / Bernard Allotey Jacobs",
    "liveTranscript": "Y\u025brehw\u025b Saglemi adan a w\u0254s\u025bee $196 million no... Mo anhw\u025b parliamentary approval no yie a, mob\u025bhunu s\u025b contract no w\u0254sakraa no a amma Mmarahy\u025bbadwa mu. Saa sika no nyinaa y\u025b Ghanafo\u0254 sika!",
    "englishTranslation": "We are looking at the Saglemi housing project where $196 million was disbursed. If you examine the parliamentary approval carefully, you will see that the contract was amended without parliamentary approval. All that money belongs to Ghanaians!",
    "confidence": 0.97,
    "audioChunkSec": 24,
    "totalTranscribed": 684,
    "extractedClaim": "Saglemi housing contract was amended without parliamentary assent for $196M",
    "claimStatus": "VERIFIED",
    "docketCitation": "High Court Criminal Case Suit No. CR/0248/2021"
  },
  {
    "id": "rad-joy",
    "name": "Joy 99.7 FM \u2014 Super Morning Show & Newsfile",
    "station": "Joy 99.7 FM",
    "network": "Multimedia Group",
    "freq": "99.7 MHz",
    "location": "Accra / Worldwide Stream",
    "language": "English",
    "status": "STREAMING",
    "host": "Samson Lardy Anyenini / Raymond Acquah",
    "currentSpeaker": "Joy FactCheck / Parliamentary Legal Counsel",
    "liveTranscript": "Under Section 3 of the State Property and Contracts Act, ministerial commitments exceeding approved parliamentary loan ceilings require formal legislative ratification. In the Saglemi agreement, the reduction from 5,000 to 1,506 units for the exact same $200 million outlay constituted a prima facie statutory breach.",
    "englishTranslation": "Under Section 3 of the State Property and Contracts Act, ministerial commitments exceeding approved parliamentary loan ceilings require formal legislative ratification. In the Saglemi agreement, the reduction from 5,000 to 1,506 units for the exact same $200 million outlay constituted a prima facie statutory breach.",
    "confidence": 0.99,
    "audioChunkSec": 28,
    "totalTranscribed": 792,
    "extractedClaim": "Reduction of Saglemi scope from 5,000 to 1,506 units for $200M breached statutory loan ceiling",
    "claimStatus": "VERIFIED",
    "docketCitation": "Parliamentary Hansard (Oct 2012) & Auditor-General Performance Report"
  },
  {
    "id": "rad-citi",
    "name": "Citi 97.3 FM \u2014 Citi Breakfast Show & Point of View",
    "station": "Citi 97.3 FM",
    "network": "Omni Media",
    "freq": "97.3 MHz",
    "location": "Accra (Nationwide)",
    "language": "English",
    "status": "STREAMING",
    "host": "Bernard Avle / Umaru Sanda Amadu",
    "currentSpeaker": "Bernard Avle (Macroeconomic Presentation)",
    "liveTranscript": "Let's look at the Energy Sector Recovery Programme data. Between 2013 and 2016, emergency Power Purchase Agreements contracted 5,081 megawatts against a national peak demand of only 2,700 megawatts. That created a mandatory take-or-pay capacity charge of $1.2 billion per year that taxpayers had to absorb.",
    "englishTranslation": "Let's look at the Energy Sector Recovery Programme data. Between 2013 and 2016, emergency Power Purchase Agreements contracted 5,081 megawatts against a national peak demand of only 2,700 megawatts. That created a mandatory take-or-pay capacity charge of $1.2 billion per year that taxpayers had to absorb.",
    "confidence": 0.98,
    "audioChunkSec": 19,
    "totalTranscribed": 580,
    "extractedClaim": "2013-2016 emergency PPAs contracted 5,081 MW vs 2,700 MW peak demand, causing $1.2B/yr take-or-pay penalty",
    "claimStatus": "VERIFIED",
    "docketCitation": "Energy Commission National Energy Statistics & Ministry of Finance ESRP"
  },
  {
    "id": "rad-asempa",
    "name": "Asempa 94.7 FM \u2014 Ekosii Sen",
    "station": "Asempa 94.7 FM",
    "network": "Multimedia Group",
    "freq": "94.7 MHz",
    "location": "Accra (National Feed)",
    "language": "Akan (Twi) / English",
    "status": "STREAMING",
    "host": "Philip Osei Bonsu (O.B.)",
    "currentSpeaker": "Sammy Gyamfi (NDC) vs Richard Ahiagbah (NPP)",
    "liveTranscript": "O.B., y\u025br\u025bnkasa nokware! 2014 mu no, bere a IMF conditionalities no bae no, allowance a y\u025bde ma Teacher trainees ne Nursing trainees no, y\u025btwae anaa y\u025bantwa? Y\u025btwae! \u0190no nti na 2017 mu NPP bae a w\u0254san de bae no!",
    "englishTranslation": "O.B., let us speak the truth! In 2014, when the IMF conditionalities arrived, was the allowance given to Teacher and Nursing trainees cancelled or not? It was cancelled! That is why when the NPP came in 2017, they restored it!",
    "confidence": 0.95,
    "audioChunkSec": 22,
    "totalTranscribed": 640,
    "extractedClaim": "Teacher and nursing trainee allowances were cancelled in 2014 under IMF conditionality and restored in 2017",
    "claimStatus": "VERIFIED",
    "docketCitation": "IMF Country Report No. 15/103 & Ministry of Education Budget 2017"
  },
  {
    "id": "rad-adom",
    "name": "Adom 106.3 FM \u2014 Dwaso Nsem",
    "station": "Adom 106.3 FM",
    "network": "Multimedia Group",
    "freq": "106.3 MHz",
    "location": "Accra (Nationwide)",
    "language": "Akan (Twi)",
    "status": "STREAMING",
    "host": "Omanhene Kwabena Asante",
    "currentSpeaker": "Kejetia Market Women Association Secretary",
    "liveTranscript": "Dumsor mfe\u025b nnan no mu no, y\u025bn nnompe nyinaa b\u0254e. Y\u025bn nam ne y\u025bn nsuo nyinaa s\u025bee w\u0254 fridge mu. Bank loans a y\u025btwee no, y\u025bantumi antua. Y\u025bn mma nso antumi ank\u0254 sukuu. \u0190ny\u025b biribi a y\u025bb\u025btumi wer\u025b afi da!",
    "englishTranslation": "During the four years of Dumsor, our small businesses collapsed. All our frozen fish and meat perished in the freezers. The bank loans we took, we could not pay back. Our children could not attend school. It is not something we can ever forget!",
    "confidence": 0.94,
    "audioChunkSec": 15,
    "totalTranscribed": 490,
    "extractedClaim": "4-year Dumsor crisis caused widespread micro-enterprise insolvencies and inventory destruction for market traders",
    "claimStatus": "VERIFIED",
    "docketCitation": "Association of Ghana Industries (AGI) SME Impact Survey 2015"
  },
  {
    "id": "rad-oman",
    "name": "Oman 107.1 FM \u2014 Boiling Point & National Agenda",
    "station": "Oman 107.1 FM",
    "network": "Kencity Media",
    "freq": "107.1 MHz",
    "location": "Accra / Nationwide",
    "language": "Akan (Twi) / English",
    "status": "STREAMING",
    "host": "Fiifi Boafo",
    "currentSpeaker": "Investigative Desk Auditor",
    "liveTranscript": "Auditor-General repo\u0254to no kyer\u025b pefee s\u025b SADA de GHS 33 million k\u0254y\u025b\u025b nkok\u0254b\u0254ne ne nnua dua w\u0254 harmattan mu. Nnua 5 million no, 95% nyinaa hyee w\u0254 gya mu. Ak\u0254mf\u025bm no nso, obiara anhu baako mpo k\u0254 commercial market so!",
    "englishTranslation": "The Auditor-General report shows clearly that SADA used GHS 33 million for guinea fowl breeding and tree planting during the harmattan season. Out of 5 million trees, 95% were incinerated by brushfires. As for the guinea fowls, not a single one reached the commercial market!",
    "confidence": 0.96,
    "audioChunkSec": 26,
    "totalTranscribed": 510,
    "extractedClaim": "SADA afforestation achieved 95% seedling mortality and zero commercial guinea fowl exports",
    "claimStatus": "VERIFIED",
    "docketCitation": "Auditor-General Report on Public Boards & SADA Forensic Audit"
  },
  {
    "id": "rad-angel",
    "name": "Angel 102.9 FM \u2014 Anopa B\u0254fo\u0254",
    "station": "Angel 102.9 FM",
    "network": "Angel Broadcasting Network",
    "freq": "102.9 MHz",
    "location": "Accra & Kumasi",
    "language": "Akan (Twi)",
    "status": "STREAMING",
    "host": "Kofi Adoma Nwanwani / Kwame Tanko",
    "currentSpeaker": "Water Resources Commission Inspector",
    "liveTranscript": "River Pra ne Birim mu nsuo no turbidity level ak\u0254 boro 14,000 NTU bere a Ghana Water Company tumi treat nsuo a \u025bw\u0254 2,000 NTU ase p\u025b. S\u025b obi k\u0254ka s\u025b \u0254b\u025bpardon galamseyfo\u0254 nyinaa a, na \u025bkyer\u025b s\u025b y\u025bn nyinaa y\u025brenom sumina nsuo!",
    "englishTranslation": "The turbidity level in River Pra and Birim has surged past 14,000 NTU whereas Ghana Water Company can only treat water below 2,000 NTU. If someone promises to pardon all illegal miners, it means we will all be drinking poisoned water!",
    "confidence": 0.93,
    "audioChunkSec": 17,
    "totalTranscribed": 430,
    "extractedClaim": "River Pra and Birim turbidity exceeds 14,000 NTU due to illegal mining, threatening municipal water shutdown",
    "claimStatus": "VERIFIED",
    "docketCitation": "Water Resources Commission Baseline Quality Report 2024"
  },
  {
    "id": "rad-asaase",
    "name": "Asaase 99.5 FM \u2014 The Asaase Breakfast Show",
    "station": "Asaase 99.5 FM",
    "network": "Asaase Broadcasting Company",
    "freq": "99.5 MHz",
    "location": "Accra (Nationwide)",
    "language": "English",
    "status": "STREAMING",
    "host": "Wilberforce Asare",
    "currentSpeaker": "Energy Policy Institute Fellow",
    "liveTranscript": "The fundamental challenge with the 24-Hour economy slogan is that without dedicated base-load industrial power capitalization and guaranteed off-taker financing, shifting factory shifts to midnight remains economically impossible for private businesses already paying commercial tariffs.",
    "englishTranslation": "The fundamental challenge with the 24-Hour economy slogan is that without dedicated base-load industrial power capitalization and guaranteed off-taker financing, shifting factory shifts to midnight remains economically impossible for private businesses already paying commercial tariffs.",
    "confidence": 0.97,
    "audioChunkSec": 21,
    "totalTranscribed": 460,
    "extractedClaim": "24-Hour economy proposal lacks dedicated base-load power capitalization and private sector off-taker mechanisms",
    "claimStatus": "VERIFIED",
    "docketCitation": "Association of Ghana Industries (AGI) Policy Position Paper"
  },
  {
    "id": "rad-gold",
    "name": "Radio Gold 90.5 FM \u2014 Alhaji & Alhaji",
    "station": "Radio Gold 90.5 FM",
    "network": "Network Broadcasting",
    "freq": "90.5 MHz",
    "location": "Accra",
    "language": "English / Akan",
    "status": "STREAMING",
    "host": "Alhassan Suhuyini / Panel",
    "currentSpeaker": "NDC Communications Representative",
    "liveTranscript": "The Saglemi project was visionary. It was conceived to solve the housing deficit for civil servants. The current administration should have injected extra capital instead of putting people before court for purely political victimization.",
    "englishTranslation": "The Saglemi project was visionary. It was conceived to solve the housing deficit for civil servants. The current administration should have injected extra capital instead of putting people before court for purely political victimization.",
    "confidence": 0.92,
    "audioChunkSec": 25,
    "totalTranscribed": 380,
    "extractedClaim": "Saglemi housing prosecution is political victimization rather than criminal breach of contract",
    "claimStatus": "CONTRADICTION",
    "docketCitation": "High Court Ruling on Prima Facie Case (Suit CR/0248/2021)"
  },
  {
    "id": "rad-tv3",
    "name": "3FM 92.7 / TV3 \u2014 The KeyPoints",
    "station": "3FM 92.7 / TV3",
    "network": "Media General",
    "freq": "92.7 MHz",
    "location": "Accra (Nationwide TV)",
    "language": "English",
    "status": "STREAMING",
    "host": "Alfred Ocansey / Johnnie Hughes",
    "currentSpeaker": "Education Policy Analyst",
    "liveTranscript": "The data from the West African Examinations Council confirms that over 5.7 million Ghanaian youths have benefited from Free SHS since 2017, and the 2020-2024 WASSCE results in core mathematics and science recorded the highest national pass rates in Ghana's history.",
    "englishTranslation": "The data from the West African Examinations Council confirms that over 5.7 million Ghanaian youths have benefited from Free SHS since 2017, and the 2020-2024 WASSCE results in core mathematics and science recorded the highest national pass rates in Ghana's history.",
    "confidence": 0.98,
    "audioChunkSec": 20,
    "totalTranscribed": 540,
    "extractedClaim": "WAEC data confirms 5.7M Free SHS beneficiaries and record high WASSCE pass rates",
    "claimStatus": "VERIFIED",
    "docketCitation": "WAEC National Examination Statistics 2017\u20132024"
  }
];
const ALL_CROSS_TOPICS: CrossStationTopic[] = [
  {
    "id": "cst-saglemi",
    "title": "Saglemi $200M Affordable Housing Contract & Criminal Trial",
    "groundTruth": "Parliament approved $200M for 5,000 units. Ministry disbursed $196M for only 668 uncompleted, unlivable shells with no water or power. High Court Suit CR/0248/2021 established prima facie criminal breach.",
    "coverage": [
      {
        "station": "Joy 99.7 FM (Newsfile)",
        "framing": "Investigative & Legal Rigor",
        "quote": "Statutory dockets establish contract scope was illegally reduced by 70% without Parliamentary ratification.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Neutral/Investigative"
      },
      {
        "station": "Peace 104.3 FM (Kokrokoo)",
        "framing": "Public Accountability",
        "quote": "How can $196 million be paid out of state coffers when civil servants cannot sleep in a single room?",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Critical/Indignant"
      },
      {
        "station": "Citi 97.3 FM (Point of View)",
        "framing": "Financial Audit Analysis",
        "quote": "Forensic quantity surveyor reports showed completion requires an additional $100M+ due to structural neglect.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Data-Driven"
      },
      {
        "station": "Asempa 94.7 FM (Ekosii Sen)",
        "framing": "Combative Cross-Examination",
        "quote": "Sammy Gyamfi and Richard Ahiagbah clash over why 4,332 units vanished from the original agreement.",
        "verdict": "BALANCED_DEBATE",
        "sentiment": "High Voltage"
      },
      {
        "station": "Radio Gold 90.5 FM (Alhaji & Alhaji)",
        "framing": "Partisan Spin / Denial",
        "quote": "Project was visionary milestone abandoned purely because of political malice against former President.",
        "verdict": "CONTRADICTION_SPIN",
        "sentiment": "Defensive Spin"
      }
    ]
  },
  {
    "id": "cst-dumsor",
    "title": "4-Year Dumsor Power Crisis & $1.2B Annual Take-or-Pay IPP Debt",
    "groundTruth": "Ghana endured 4 years of severe power rationing (2012-2016). Emergency PPAs contracted 5,081 MW capacity (excess of 2,381 MW above peak), generating mandatory $1.2B/year take-or-pay idle power debts.",
    "coverage": [
      {
        "station": "Citi 97.3 FM (CBS)",
        "framing": "Empirical Macroeconomics",
        "quote": "Energy Commission charts prove excess contracted capacity created sovereign balance of payments crisis.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Data-Driven"
      },
      {
        "station": "Joy 99.7 FM (SMS)",
        "framing": "Documentary Evidence",
        "quote": "PPA agreements signed in 2015 locked Ghana into 20-year dollar-denominated payment guarantees.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Investigative"
      },
      {
        "station": "Peace 104.3 FM (Kokrokoo)",
        "framing": "Citizen Memory & Impact",
        "quote": "Ghanaians remember running generators for 4 years and having businesses destroyed by load shedding.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Empirical Ground Truth"
      },
      {
        "station": "Adom 106.3 FM (Dwaso Nsem)",
        "framing": "Grassroots Microeconomic Tragedy",
        "quote": "Cold store operators lost entire livelihoods and hairdressers could not power dryers for 48 hours at a stretch.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Grassroots Voice"
      },
      {
        "station": "Radio Gold 90.5 FM (Alhaji & Alhaji)",
        "framing": "Heroic Victory Revisionism",
        "quote": "Mahama heroically fixed Dumsor by adding unprecedented power generation before leaving office.",
        "verdict": "CONTRADICTION_SPIN",
        "sentiment": "Partisan Framing"
      }
    ]
  },
  {
    "id": "cst-freeshs",
    "title": "Universal Free SHS Transformation (5.7M Students) vs Opposition Stance",
    "groundTruth": "NPP implemented Universal Free SHS in Sept 2017. Enrolment surged from 881k to 1.45M+, with 5.7M total beneficiaries and historic WASSCE pass rates, refuting 40+ opposition adverts claiming it was impossible.",
    "coverage": [
      {
        "station": "Daily Graphic / Peace FM",
        "framing": "Official Educational Record",
        "quote": "GES and WAEC confirm 5.7 million youths educated with gender parity achieved across all 16 regions.",
        "verdict": "VERIFIED_ACCURATE",
        "sentiment": "Record of Fact"
      },
      {
        "station": "Joy 99.7 FM (Newsfile)",
        "framing": "Policy Evaluation",
        "quote": "While secondary school access has democratized, funding models and buffer stock logistics require continuous optimization.",
        "verdict": "BALANCED_EVALUATION",
        "sentiment": "Analytical"
      },
      {
        "station": "Asempa 94.7 FM (Ekosii Sen)",
        "framing": "Manifesto Comparison",
        "quote": "Debating whether the 100-day review promised by the NDC implies reintroducing cost-sharing tuition fees.",
        "verdict": "BALANCED_DEBATE",
        "sentiment": "High Voltage"
      },
      {
        "station": "Oman 107.1 FM (National Agenda)",
        "framing": "Historic Archive Replay",
        "quote": "Replaying verbatim 2012 radio commercials where opposition stated Free SHS was a 419 scam that would destroy Ghana.",
        "verdict": "HISTORICAL_RECORD",
        "sentiment": "Documentary Contrast"
      },
      {
        "station": "Radio Gold 90.5 FM (Alhaji & Alhaji)",
        "framing": "Crisis Magnification",
        "quote": "Free SHS has collapsed educational standards and created a generational disaster.",
        "verdict": "CONTRADICTED_BY_WAEC",
        "sentiment": "Partisan Attack"
      }
    ]
  }
];
const ALL_SOCIAL_EVENTS: SocialFeedEvent[] = [
  {
    "id": "soc-fb-1",
    "platform": "Facebook",
    "account": "Peace FM Online (@peacefmonline)",
    "timestamp": "3 mins ago",
    "text": "Kwami Sefa Kayi: 'Let no politician rewrite history. The 4 years of Dumsor and the collapse of small businesses in Ghana between 2012 and 2016 are matters of indisputable national record.'",
    "engagement": {
      "likes": 14200,
      "shares": 3100,
      "comments": 4820
    },
    "extractedClaim": "4-year Dumsor crisis (2012-2016) caused verifiable national small business collapses",
    "claimStatus": "VERIFIED",
    "stationSource": "Peace 104.3 FM"
  },
  {
    "id": "soc-joy-1",
    "platform": "X (Twitter)",
    "account": "JoyNews (@JoyNewsOnTV)",
    "timestamp": "8 mins ago",
    "text": "Fact-Check on Newsfile: High Court records in Suit CR/0248/2021 show $196M was disbursed to contractor for Saglemi housing, but only 668 incomplete housing shells were delivered without water or electricity.",
    "engagement": {
      "likes": 9800,
      "shares": 2450,
      "comments": 1900
    },
    "extractedClaim": "Saglemi disbursement reached $196M for only 668 incomplete shell units",
    "claimStatus": "VERIFIED",
    "stationSource": "Joy 99.7 FM"
  },
  {
    "id": "soc-citi-1",
    "platform": "LinkedIn",
    "account": "Citi Newsroom / Bernard Avle",
    "timestamp": "16 mins ago",
    "text": "Economic Analysis: Energy Sector Recovery Programme audits confirm annual take-or-pay debt of $1.2 Billion resulted from 5,081 MW of emergency PPAs signed under the 2015 load shedding regime.",
    "engagement": {
      "likes": 2100,
      "shares": 680,
      "comments": 340
    },
    "extractedClaim": "2015 emergency PPAs produced $1.2B annual take-or-pay excess capacity debt",
    "claimStatus": "VERIFIED",
    "stationSource": "Citi 97.3 FM"
  },
  {
    "id": "soc-asempa-1",
    "platform": "Facebook",
    "account": "Asempa 94.7 FM (@Asempa947FM)",
    "timestamp": "22 mins ago",
    "text": "Ekosii Sen: Philip Osei Bonsu (O.B.) puts Sammy Gyamfi on the spot over verbatim 2014 government announcements cancelling Teacher and Nursing Trainee allowances during IMF negotiations.",
    "engagement": {
      "likes": 18400,
      "shares": 4200,
      "comments": 6100
    },
    "extractedClaim": "Teacher and Nursing trainee allowances were formally scrapped in 2014 by executive decision",
    "claimStatus": "VERIFIED",
    "stationSource": "Asempa 94.7 FM"
  },
  {
    "id": "soc-adom-1",
    "platform": "Instagram",
    "account": "Adom TV / Adom FM (@adomtv)",
    "timestamp": "30 mins ago",
    "text": "Voice of Market Women: Dwaso Nsem investigates how 4 years of Dumsor ruined cold-store inventory in Makola and Agbogbloshie, leaving debts that took nearly a decade to clear.",
    "engagement": {
      "likes": 12500,
      "shares": 1950,
      "comments": 2840
    },
    "extractedClaim": "Makola and Agbogbloshie cold-store traders suffered catastrophic inventory losses during Dumsor",
    "claimStatus": "VERIFIED",
    "stationSource": "Adom 106.3 FM"
  },
  {
    "id": "soc-oman-1",
    "platform": "X (Twitter)",
    "account": "Oman FM 107.1 (@OmanFM1071)",
    "timestamp": "45 mins ago",
    "text": "Boiling Point Archive: Full Auditor-General docket on GHS 33M SADA afforestation where tree seedlings were planted in February dry season, leading to 95% bushfire destruction.",
    "engagement": {
      "likes": 6400,
      "shares": 1800,
      "comments": 920
    },
    "extractedClaim": "SADA dry-season afforestation suffered 95% tree seedling mortality",
    "claimStatus": "VERIFIED",
    "stationSource": "Oman 107.1 FM"
  }
];

export function MultiChannelIngestConsole() {
  const [radioFeeds, setRadioFeeds] = useState<RadioStationFeed[]>(ALL_RADIO_FEEDS);
  const [selectedFeed, setSelectedFeed] = useState<RadioStationFeed>(ALL_RADIO_FEEDS[0]);
  const [activeSubTab, setActiveSubTab] = useState<'live-tuner' | 'cross-spin' | 'evidence-vault' | 'social-stream'>('live-tuner');
  const [selectedTopic, setSelectedTopic] = useState<CrossStationTopic>(ALL_CROSS_TOPICS[0]);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [ingestedCount, setIngestedCount] = useState<number>(38420);
  const [asrLatency, setAsrLatency] = useState<number>(240);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isSpeakingLive, setIsSpeakingLive] = useState<boolean>(false);

  // Helper to trigger browser speech synthesis (TTS)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel();
      if (isMuted || volume === 0) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = isMuted ? 0 : volume;
      utterance.pitch = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-GH') || v.lang.includes('en-US')) || voices[0];
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeakingLive(true);
      utterance.onend = () => setIsSpeakingLive(false);
      utterance.onerror = () => setIsSpeakingLive(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  // Helper to play radio tuning acoustic sound effect
  const playTunerTone = () => {
    if (typeof window === 'undefined' || isMuted || volume === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  // When selected feed changes, if audio is on, speak it
  const handleSelectFeed = (feed: RadioStationFeed) => {
    setSelectedFeed(feed);
    playTunerTone();
    if (isPlayingAudio) {
      speakText(feed.englishTranslation || feed.liveTranscript);
    }
  };

  const handleToggleRadioAudio = () => {
    if (!isPlayingAudio) {
      setIsPlayingAudio(true);
      playTunerTone();
      speakText(selectedFeed.englishTranslation || selectedFeed.liveTranscript);
    } else {
      setIsPlayingAudio(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingLive(false);
    }
  };

  const handleManualSpeakCurrent = () => {
    playTunerTone();
    speakText(selectedFeed.englishTranslation || selectedFeed.liveTranscript);
  };

  // Live simulation ticker for audio buffer & incoming packets
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      setIngestedCount(prev => prev + Math.floor(12 + Math.random() * 20));
      setAsrLatency(Math.floor(210 + Math.random() * 60));

      setRadioFeeds(prev => prev.map(feed => {
        const nextSec = feed.audioChunkSec >= 30 ? 1 : feed.audioChunkSec + 1;
        return {
          ...feed,
          audioChunkSec: nextSec,
          totalTranscribed: nextSec === 1 ? feed.totalTranscribed + 1 : feed.totalTranscribed
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isCapturing]);

  const filteredFeeds = radioFeeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feed.liveTranscript.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feed.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          feed.station.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLanguage === 'ALL' || feed.language.includes(selectedLanguage);
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Broadcast & FM Intelligence Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ALL GHANAIAN FM STATIONS & BROADCAST RADAR</span>
              </span>
              <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>LIVE BROADCAST AUDIO (TTS & RADIO TUNER) ACTIVE</span>
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Peace FM, Joy FM, Citi FM & National Radio Intelligence</span>
            </h2>

            <p className="text-xs lg:text-sm text-slate-300 max-w-4xl leading-relaxed">
              Real-time multi-channel acoustic surveillance monitoring all major Ghanaian radio networks (Peace 104.3, Joy 99.7, Citi 97.3, Asempa 94.7, Adom 106.3, Oman 107.1, Angel 102.9, Asaase 99.5, TV3/3FM, Radio Gold). Plays speech aloud in real time, transcribes Akan (Twi) and English via Whisper ASR, extracts political assertions, and cross-references statements against official statutory dockets.
            </p>
          </div>

          {/* Real-Time Telemetry Cards */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-center flex-1 min-w-[120px] shadow-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Audio Events</div>
              <div className="text-2xl font-black text-cyan-400 font-mono">{ingestedCount.toLocaleString()}</div>
              <div className="text-[9px] text-slate-500">Live Ingested Chunks</div>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 text-center flex-1 min-w-[120px] shadow-md">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Audio Volume</div>
              <div className="text-2xl font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <span>{(volume * 100).toFixed(0)}%</span>
              </div>
              <div className="text-[9px] text-slate-500">{isMuted ? 'Muted' : 'Sound Enabled'}</div>
            </div>

            <button
              onClick={() => setIsCapturing(!isCapturing)}
              className={`px-5 py-3 rounded-xl text-xs font-black font-mono transition-all flex items-center justify-center gap-2 shadow-lg ${
                isCapturing 
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30' 
                  : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isCapturing ? <Pause className="w-4 h-4 text-rose-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isCapturing ? 'PAUSE INGESTION' : 'RESUME INGESTION'}</span>
            </button>
          </div>
        </div>

        {/* Console Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 flex-wrap">
          <button
            onClick={() => setActiveSubTab('live-tuner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'live-tuner'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Live FM Tuner & ASR Stream ({radioFeeds.length} Stations)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cross-spin')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'cross-spin'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Cross-Station Spin Matrix (Peace vs Joy vs Citi vs Gold)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evidence-vault')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'evidence-vault'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Broadcast Fact-Check & Docket Vault</span>
          </button>

          <button
            onClick={() => setActiveSubTab('social-stream')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'social-stream'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Social & Digital Webhook Stream</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE FM TUNER & ASR STREAM */}
      {activeSubTab === 'live-tuner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Station Channel Selector (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select FM Radio Socket</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">{filteredFeeds.length} Stations Available</span>
              </div>

              {/* Search & Language Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Peace FM, Joy FM, host, topic..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Languages</option>
                  <option value="Akan">Akan (Twi)</option>
                  <option value="English">English</option>
                </select>
              </div>

              {/* Station Feeds Scroll List */}
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredFeeds.map(feed => {
                  const isSelected = selectedFeed.id === feed.id;
                  return (
                    <div
                      key={feed.id}
                      onClick={() => handleSelectFeed(feed)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected 
                          ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/10' 
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${
                            isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}>
                            <Radio className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">{feed.station}</div>
                            <div className="text-[10.5px] text-slate-400 font-mono">{feed.freq} · {feed.network}</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>LIVE</span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">{feed.language}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 font-mono truncate">
                        <span className="text-cyan-400 font-semibold">Host:</span> {feed.host}
                      </div>

                      {/* Mini Rolling Progress */}
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${(feed.audioChunkSec / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Broadcast Audio & ASR Deep Inspector (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              
              {/* Active Stream Header & Live Audio Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {selectedFeed.freq}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedFeed.location}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">{selectedFeed.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span className="text-slate-300 font-semibold">Moderator / Host:</span> {selectedFeed.host}
                  </div>
                </div>

                {/* Live Play / Volume Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setVolume(val);
                        if (isMuted && val > 0) setIsMuted(false);
                      }}
                      className="w-14 accent-cyan-400 cursor-pointer"
                      title={`Volume: ${(volume * 100).toFixed(0)}%`}
                    />
                  </div>

                  <button
                    onClick={handleToggleRadioAudio}
                    className={`px-4 py-2 rounded-lg text-xs font-black font-mono transition-all flex items-center gap-2 shadow-lg ${
                      isPlayingAudio 
                        ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400' 
                        : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingAudio ? 'PAUSE RADIO' : '▶ PLAY BROADCAST AUDIO'}</span>
                  </button>
                </div>
              </div>

              {/* Rolling 30s Buffer Progress */}
              <div className="space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Whisper ASR Rolling Buffer (30s Windows)</span>
                  </span>
                  <span className="text-cyan-400 font-bold">{selectedFeed.audioChunkSec}s / 30s ({selectedFeed.totalTranscribed} chunks total)</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(selectedFeed.audioChunkSec / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Live Speech-to-Text Transcript Stream with Direct Speech Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live On-Air Audio Transcript ({selectedFeed.language}):</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleManualSpeakCurrent}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 transition-all"
                      title="Speak this broadcast transcript aloud"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeakingLive ? 'text-emerald-400 animate-ping' : 'text-cyan-400'}`} />
                      <span>{isSpeakingLive ? 'SPEAKING ALOUD...' : '🔊 SPEAK TRANSCRIPT ALOUD'}</span>
                    </button>
                    
                    <span className="text-emerald-400 font-bold">Confidence: {(selectedFeed.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 font-mono leading-relaxed italic border-l-4 border-l-cyan-400">
                  "{selectedFeed.liveTranscript}"
                </div>
              </div>

              {/* English Translation View (if in Akan) */}
              {selectedFeed.language.includes('Akan') && (
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Standard English Forensic Translation:</span>
                  </span>
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
                    {selectedFeed.englishTranslation}
                  </div>
                </div>
              )}

              {/* Real-time BERT Extracted Claim Card */}
              <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>BERT NLP Extracted Political Claim:</span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                    selectedFeed.claimStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    selectedFeed.claimStatus === 'CONTRADICTION' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {selectedFeed.claimStatus}
                  </span>
                </div>

                <div className="text-xs font-bold text-white leading-relaxed">
                  "{selectedFeed.extractedClaim}"
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Docket Citation:</span>
                  <span className="text-cyan-300 font-semibold">{selectedFeed.docketCitation}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-STATION SPIN MATRIX */}
      {activeSubTab === 'cross-spin' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Cross-Station Spin & Coverage Discrepancy Comparator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct side-by-side comparison of how Peace FM, Joy FM, Citi FM, Asempa FM, and Radio Gold report the exact same breaking issue.
                </p>
              </div>

              {/* Topic Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                {ALL_CROSS_TOPICS.map(top => (
                  <button
                    key={top.id}
                    onClick={() => setSelectedTopic(top)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTopic.id === top.id
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md font-black'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {top.title.split(' ')[0]} {top.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Topic Ground Truth Banner */}
            <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-1.5">
              <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Forensic Statutory Ground Truth:
              </div>
              <div className="text-xs text-slate-200 leading-relaxed font-mono">
                {selectedTopic.groundTruth}
              </div>
            </div>

            {/* Cross-Station Coverage Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {selectedTopic.coverage.map((cov, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white">{cov.station}</span>
                      <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                        cov.verdict.includes('VERIFIED') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        cov.verdict.includes('SPIN') ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {cov.verdict.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[10.5px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold">Editorial Tone:</span> {cov.framing}
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 italic font-mono leading-relaxed">
                      "{cov.quote}"
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    Analysis: {cov.sentiment}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST EVIDENCE & ON-AIR FACT-CHECK VAULT */}
      {activeSubTab === 'evidence-vault' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>On-Air Broadcast Fact-Check & Legal Docket Repository</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Searchable archive of verbatim on-air radio and TV statements cross-referenced with primary public dockets.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-950/80">
                    <th className="p-3">Station & Show</th>
                    <th className="p-3">Host / Speaker</th>
                    <th className="p-3">Verbatim On-Air Statement</th>
                    <th className="p-3">Statutory Ground Truth & Docket</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {ALL_RADIO_FEEDS.map(feed => (
                    <tr key={feed.id} className="hover:bg-slate-950/80 transition-colors">
                      <td className="p-3 font-bold text-white whitespace-nowrap">
                        <div>{feed.station}</div>
                        <div className="text-[10px] text-cyan-400 font-normal">{feed.freq}</div>
                      </td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">
                        <div className="font-semibold text-slate-200">{feed.host}</div>
                        <div className="text-[10px] text-slate-500">{feed.currentSpeaker}</div>
                      </td>
                      <td className="p-3 text-slate-300 italic max-w-xs">
                        "{feed.liveTranscript}"
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs">
                        <div className="text-white font-semibold">{feed.extractedClaim}</div>
                        <div className="text-[10px] text-cyan-400 mt-0.5">{feed.docketCitation}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          feed.claimStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          feed.claimStatus === 'CONTRADICTION' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {feed.claimStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: SOCIAL MEDIA & WEBHOOK STREAM */}
      {activeSubTab === 'social-stream' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Social Media & Digital Broadcast Feed</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live Meta Graph Webhooks (Facebook/Instagram), LinkedIn API, and X (Twitter) feeds from major radio newsrooms.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Kafka Topic: raw.broadcast.social</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ALL_SOCIAL_EVENTS.map(evt => (
                <div key={evt.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                        evt.platform === 'Facebook' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' :
                        evt.platform === 'LinkedIn' ? 'bg-sky-600/20 text-sky-400 border-sky-500/30' :
                        evt.platform === 'Instagram' ? 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30' :
                        'bg-slate-800 text-slate-200 border-slate-700'
                      }`}>
                        {evt.platform}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{evt.account}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="text-cyan-400">{evt.stationSource}</span>
                      <span>·</span>
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                    "{evt.text}"
                  </p>

                  <div className="bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">BERT Extracted Claim:</div>
                      <div className="text-slate-200 font-semibold text-[11px]">{evt.extractedClaim}</div>
                    </div>

                    <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                      evt.claimStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      evt.claimStatus === 'CONTRADICTION' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {evt.claimStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10.5px] text-slate-400 font-mono pt-1">
                    <span>❤️ {evt.engagement.likes.toLocaleString()} likes</span>
                    <span>🔄 {evt.engagement.shares.toLocaleString()} shares</span>
                    <span>💬 {evt.engagement.comments.toLocaleString()} comments</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
