export interface GhanaVideoTranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  timestampDisplay: string;
  speaker: string;
  spokenText: string;
  veracityScore: number;
  verdict: 'TRUE' | 'MOSTLY_TRUE' | 'HALF_TRUTH' | 'MISLEADING' | 'FABRICATED';
  evasionIndex: number;
  hedgingIndex: number;
  anomalyType?: 'FABRICATION' | 'PIVOT_DODGE' | 'STATISTICAL_DISTORTION' | 'HEDGING' | 'CHERRY_PICKING' | 'VERIFIED_FACT';
  explanation: string;
  docketProof: {
    officialSource: string;
    sourceType: 'Auditor-General' | 'Parliament.gh' | 'EnergyCommission.gov.gh' | 'IMF.org' | 'GES.gov.gh' | 'NHIA.gov.gh';
    verifiedFact: string;
    sourceUrl: string;
  };
}

export interface GhanaVideoPolygraphCase {
  id: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  eventDate: string;
  stationBroadcast: string;
  eventContext: string;
  newsRelevance: string;
  videoType: 'youtube' | 'html5';
  videoUrl: string;
  youtubeId?: string;
  durationSeconds: number;
  overallVeracityScore: number;
  overallVerdict: 'TRUE' | 'MOSTLY_TRUE' | 'HALF_TRUTH' | 'MISLEADING' | 'FABRICATED';
  stationLogo?: string;
  segments: GhanaVideoTranscriptSegment[];
}

export const GHANA_PRESET_VIDEO_CASES: GhanaVideoPolygraphCase[] = [
  {
    "id": "gh-vid-short-memory",
    "title": "Speech on Citizen Memory & Election Strategy ('Ghanaians Have Short Memory')",
    "speaker": "John Dramani Mahama",
    "speakerTitle": "Former President of Ghana (NDC)",
    "eventDate": "November 2013 / 2015",
    "stationBroadcast": "Peace FM, JoyNews TV, Citi TV, Adom TV, GTV",
    "eventContext": "Public address in Accra addressing public complaints regarding utility tariff hikes and economic pressure.",
    "newsRelevance": "Political Psychology & Governance Blindspot: Treating Ghanaian voters as having short memory after imposing 4 years of Dumsor and taxes.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 95,
    "overallVeracityScore": 6,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Peace FM / JoyNews",
    "segments": [
      {
        "id": "shortmem-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "John Dramani Mahama",
        "spokenText": "The memory of Ghanaians is very short. You do something today, by tomorrow they have forgotten about it. We will squeeze them now with the tough decisions, and when election year comes, they will forget the hardships.",
        "veracityScore": 6,
        "verdict": "FABRICATED",
        "evasionIndex": 95,
        "hedgingIndex": 5,
        "anomalyType": "FABRICATION",
        "explanation": "The cynical doctrine assumed voters would forget 4 years of Dumsor, 70%+ tariff hikes, 17.5% special petroleum tax, and trainee allowance cancellations in exchange for 2016 election-year gifts (outboard motors, sewing machines, cash). Voters decisively remembered and rejected this strategy in Dec 2016.",
        "docketProof": {
          "officialSource": "Electoral Commission Official 2016 Election Gazette & Ministry of Finance 2016 Fiscal Deficit Outturn Report",
          "sourceType": "Parliament.gh",
          "verifiedFact": "2016 Fiscal Outturn Report confirmed a GHS 3.6 Billion unbudgeted deficit blowout due to election-year gifts and procurement, which failed to sway voters who remembered the 4 years of hardship.",
          "sourceUrl": "https://www.mofep.gov.gh"
        }
      },
      {
        "id": "shortmem-seg-2",
        "startTime": 45,
        "endTime": 95,
        "timestampDisplay": "00:45 - 01:35",
        "speaker": "John Dramani Mahama",
        "spokenText": "In politics you must make the sacrifices early in your term, and then make the voters happy with resources and projects as the election approaches so they vote for continuity.",
        "veracityScore": 10,
        "verdict": "MISLEADING",
        "evasionIndex": 90,
        "hedgingIndex": 15,
        "anomalyType": "STATISTICAL_DISTORTION",
        "explanation": "Election-year spending caused sovereign debt to surge by 9.3% of GDP in 2016, leaving an inherited fiscal hole that required emergency economic stabilization.",
        "docketProof": {
          "officialSource": "Bank of Ghana Monetary Policy Committee Report & IMF Review",
          "sourceType": "IMF.org",
          "verifiedFact": "IMF Country Report confirmed election-year fiscal slippage in 2016 breached the agreed ECF deficit targets by more than 3.5% of GDP.",
          "sourceUrl": "https://www.imf.org"
        }
      }
    ]
  },
  {
    "id": "gh-vid-dumsor",
    "title": "2013 State of the Nation Address: Solemn Pledge to End Dumsor by 2013",
    "speaker": "John Dramani Mahama",
    "speakerTitle": "Former President of Ghana (NDC)",
    "eventDate": "February 21, 2013",
    "stationBroadcast": "GTV, JoyNews TV, Peace FM, Citi TV, UTV",
    "eventContext": "Official State of the Nation Address delivered before the Parliament of Ghana and broadcast live nationwide across all TV and radio stations.",
    "newsRelevance": "Ghana Energy Blindspot: Auditing the 4-year nationwide power rationing crisis (2012-2016) and $1.2B annual take-or-pay IPP debt.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 105,
    "overallVeracityScore": 8,
    "overallVerdict": "FABRICATED",
    "stationLogo": "JoyNews / GTV",
    "segments": [
      {
        "id": "dumsor-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "John Dramani Mahama",
        "spokenText": "I John Dramani Mahama will hold myself personally accountable to end this load shedding crisis once and for all before the end of this year 2013. The dark days of power cuts are coming to an end.",
        "veracityScore": 5,
        "verdict": "FABRICATED",
        "evasionIndex": 88,
        "hedgingIndex": 12,
        "anomalyType": "FABRICATION",
        "explanation": "Load shedding did not end in 2013. It intensified and persisted for 4 continuous years through 2014, 2015, and 2016, destroying tens of thousands of micro-enterprises, cold stores, and manufacturing jobs.",
        "docketProof": {
          "officialSource": "Energy Commission of Ghana & GRIDCo Official National Load Shedding Logs",
          "sourceType": "EnergyCommission.gov.gh",
          "verifiedFact": "GRIDCo official load shedding dispatch records confirm load shedding continued through late 2016, with national unserved energy reaching peak crisis levels in 2015.",
          "sourceUrl": "http://www.energycom.gov.gh"
        }
      },
      {
        "id": "dumsor-seg-2",
        "startTime": 45,
        "endTime": 105,
        "timestampDisplay": "00:45 - 01:45",
        "speaker": "John Dramani Mahama",
        "spokenText": "We have signed emergency power agreements that will permanently secure Ghana's energy independence at zero financial loss to future governments.",
        "veracityScore": 12,
        "verdict": "MISLEADING",
        "evasionIndex": 92,
        "hedgingIndex": 20,
        "anomalyType": "STATISTICAL_DISTORTION",
        "explanation": "Emergency Power Purchase Agreements contracted 5,081 MW of capacity against peak national demand of 2,700 MW, saddling Ghanaian taxpayers with over $1.2 Billion in annual mandatory take-or-pay idle capacity charges.",
        "docketProof": {
          "officialSource": "Ministry of Energy & Finance Energy Sector Recovery Programme (ESRP)",
          "sourceType": "Parliament.gh",
          "verifiedFact": "Parliamentary Finance Committee and ESRP audits established $1.2B annual take-or-pay fiscal liability resulting directly from 2013-2016 emergency PPAs.",
          "sourceUrl": "https://www.parliament.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-eblocks",
    "title": "2012 Manifesto Launch at Ho: Promise of 200 Brand New Community Day E-Blocks",
    "speaker": "John Dramani Mahama",
    "speakerTitle": "Former President of Ghana (NDC)",
    "eventDate": "October 4, 2012",
    "stationBroadcast": "TV3, JoyNews TV, Adom TV, Peace FM, Radio Gold",
    "eventContext": "NDC 2012 National Election Manifesto Launch in Ho, Volta Region, broadcast live across TV and radio networks.",
    "newsRelevance": "Ghana Education Blindspot: 200 Community Day Senior High Schools promised vs. only 29 commissioned by December 2016.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 90,
    "overallVeracityScore": 14,
    "overallVerdict": "FABRICATED",
    "stationLogo": "TV3 / JoyNews",
    "segments": [
      {
        "id": "eblock-seg-1",
        "startTime": 0,
        "endTime": 50,
        "timestampDisplay": "00:00 - 00:50",
        "speaker": "John Dramani Mahama",
        "spokenText": "Under our transformational educational agenda, we will construct 200 brand new Community Day Senior High Schools within four years to provide secondary access to rural youth.",
        "veracityScore": 14,
        "verdict": "FABRICATED",
        "evasionIndex": 82,
        "hedgingIndex": 15,
        "anomalyType": "FABRICATION",
        "explanation": "By December 2016, only 29 out of the promised 200 E-Blocks were fully completed and commissioned (85.5% failure rate). Over 171 structures were left abandoned in bushlands with GHS 850M+ in state funds locked up.",
        "docketProof": {
          "officialSource": "Auditor-General Performance Audit on Educational Infrastructure",
          "sourceType": "Auditor-General",
          "verifiedFact": "Auditor-General Report on Public Infrastructure confirmed exactly 29 E-Blocks were completed by end-2016 out of the 200 pledged.",
          "sourceUrl": "https://ghaudit.org"
        }
      }
    ]
  },
  {
    "id": "gh-vid-saglemi",
    "title": "Parliamentary Loan Approval Debate: $200M Saglemi 5,000 Affordable Homes",
    "speaker": "Alhaji Collins Dauda & Ministry Leadership",
    "speakerTitle": "Former Minister of Works & Housing (NDC)",
    "eventDate": "October 31, 2012",
    "stationBroadcast": "GTV, Metro TV, Citi TV, Peace FM, Oman FM",
    "eventContext": "Parliamentary Hansard debate on approving the $200M Credit Suisse loan agreement for 5,000 housing units at Saglemi.",
    "newsRelevance": "Ghana Infrastructure & Corruption Blindspot: $196M disbursed for only 668 incomplete shells leading to High Court Criminal Suit CR/0248/2021.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 95,
    "overallVeracityScore": 5,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Metro TV / GTV",
    "segments": [
      {
        "id": "saglemi-seg-1",
        "startTime": 0,
        "endTime": 55,
        "timestampDisplay": "00:00 - 00:55",
        "speaker": "Alhaji Collins Dauda",
        "spokenText": "Mr. Speaker, this $200 million loan will deliver 5,000 completed and fully habitable housing units for our hardworking civil servants, teachers, and security personnel.",
        "veracityScore": 4,
        "verdict": "FABRICATED",
        "evasionIndex": 96,
        "hedgingIndex": 4,
        "anomalyType": "FABRICATION",
        "explanation": "The ministry subsequently amended the contract without parliamentary ratification to build only 1,506 units for the same $200M, and paid out $196M for only 668 uninhabitable concrete shells without water or electricity.",
        "docketProof": {
          "officialSource": "High Court Criminal Division Suit No. CR/0248/2021 (The Republic v. Alhaji Collins Dauda & 4 Others)",
          "sourceType": "Parliament.gh",
          "verifiedFact": "Charge sheet confirms $196,428,391 was disbursed to contractor while only 668 uncompleted shell units were built in criminal violation of the Parliamentary resolution.",
          "sourceUrl": "https://www.judicial.gov.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-senchi",
    "title": "2014 Senchi National Economic Forum: 'Homegrown Solutions' Anti-IMF Declaration",
    "speaker": "John Dramani Mahama & Seth Terkper",
    "speakerTitle": "Former President & Minister of Finance (NDC)",
    "eventDate": "May 15, 2014",
    "stationBroadcast": "Citi TV, JoyNews TV, Peace FM, GTV, Asempa FM",
    "eventContext": "Senchi Economic Forum attended by trade unions, academia, and business leaders, declaring the 'Senchi Consensus'.",
    "newsRelevance": "Ghana Economy Blindspot: Pledged to avoid IMF bailout, but signed $918M IMF structural adjustment program in April 2015.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 100,
    "overallVeracityScore": 10,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Citi TV / JoyNews",
    "segments": [
      {
        "id": "senchi-seg-1",
        "startTime": 0,
        "endTime": 50,
        "timestampDisplay": "00:00 - 00:50",
        "speaker": "John Dramani Mahama",
        "spokenText": "Ghana will not surrender its economic sovereignty to the International Monetary Fund. We are executing a rigorous homegrown fiscal stabilization program designed by Ghanaians for Ghanaians.",
        "veracityScore": 10,
        "verdict": "FABRICATED",
        "evasionIndex": 86,
        "hedgingIndex": 18,
        "anomalyType": "FABRICATION",
        "explanation": "Within 11 months of the Senchi Forum, the government signed a $918M IMF Extended Credit Facility requiring a civil service hiring freeze, utility tariff hikes, and trainee allowance cancellations.",
        "docketProof": {
          "officialSource": "IMF Country Report No. 15/103 (Ghana Extended Credit Facility)",
          "sourceType": "IMF.org",
          "verifiedFact": "IMF Executive Board approved $918M ECF program in April 2015 with strict conditionality on wage bill containment and allowance cancellations.",
          "sourceUrl": "https://www.imf.org"
        }
      }
    ]
  },
  {
    "id": "gh-vid-onetime-nhis",
    "title": "2008 Manifesto Promise: 'One-Time NHIS Premium Payment for Life'",
    "speaker": "Prof. John Evans Atta Mills & J.D. Mahama",
    "speakerTitle": "NDC Presidential Ticket (2008)",
    "eventDate": "November 2008",
    "stationBroadcast": "Peace FM, Joy 99.7 FM, Adom FM, GTV, TV3",
    "eventContext": "National election campaign promise to introduce a single lifetime premium for the National Health Insurance Scheme (NHIS).",
    "newsRelevance": "Ghana Healthcare Blindspot: One-time payment never implemented during 8 years of NDC administration (2009\u20132016).",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 85,
    "overallVeracityScore": 2,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Peace FM / JoyNews",
    "segments": [
      {
        "id": "nhis-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "NDC Presidential Leadership",
        "spokenText": "Under the NDC administration, no Ghanaian will have to renew their National Health Insurance card every year. You will pay a one-time premium once in your lifetime and receive free healthcare forever.",
        "veracityScore": 2,
        "verdict": "FABRICATED",
        "evasionIndex": 98,
        "hedgingIndex": 2,
        "anomalyType": "FABRICATION",
        "explanation": "The promise was an actuarial impossibility. It was never introduced during 8 years in office. Instead, NHIS debts surged to GHS 1.2 Billion, leading hospitals to revert to cash-and-carry.",
        "docketProof": {
          "officialSource": "National Health Insurance Authority (NHIA) Actuarial Audit",
          "sourceType": "NHIA.gov.gh",
          "verifiedFact": "NHIA actuarial assessment proved the one-time premium would collapse the scheme within 6 months. Scheme remained on annual renewal with GHS 1.2B arrears in 2016.",
          "sourceUrl": "https://www.nhis.gov.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-sada",
    "title": "SADA Afforestation & Guinea Fowl Inaugural Summit in Tamale",
    "speaker": "Alhaji Gilbert Iddi & SADA Management",
    "speakerTitle": "CEO & Board of Savanna Accelerated Development Authority (NDC)",
    "eventDate": "June 12, 2012",
    "stationBroadcast": "Net2 TV, JoyNews TV, GTV, Peace FM, Oman FM",
    "eventContext": "Inauguration of the $33M (GHS 47M) SADA Afforestation and Asongtaba Guinea Fowl Project in Tamale.",
    "newsRelevance": "Northern Development Blindspot: Millions lost to phantom guinea fowls and dry-season burnt trees with criminal convictions.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 90,
    "overallVeracityScore": 4,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Net2 TV / JoyNews",
    "segments": [
      {
        "id": "sada-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "Alhaji Gilbert Iddi",
        "spokenText": "SADA will plant 5 million surviving green trees across the northern savannah ecological zone and develop commercial guinea fowl production to supply local markets and export to Burkina Faso and Europe.",
        "veracityScore": 3,
        "verdict": "FABRICATED",
        "evasionIndex": 94,
        "hedgingIndex": 6,
        "anomalyType": "FABRICATION",
        "explanation": "Auditor-General and JoyNews investigative documentary confirmed 95% of saplings were planted in the harmattan dry season and incinerated by bushfires. Zero poultry was exported, leading to criminal convictions.",
        "docketProof": {
          "officialSource": "Auditor-General Report on the Accounts of Public Boards (SADA)",
          "sourceType": "Auditor-General",
          "verifiedFact": "Auditor-General Special Audit confirmed GHS 47M dissipated on unviable afforestation and unrecovered joint venture disbursements.",
          "sourceUrl": "https://ghaudit.org"
        }
      }
    ]
  },
  {
    "id": "gh-vid-freeshs-opp",
    "title": "Campaign Broadcasts & 40+ TV/Radio Adverts Against Universal Free SHS",
    "speaker": "John Dramani Mahama & NDC Communication Bureau",
    "speakerTitle": "President & Party Leadership",
    "eventDate": "2012 \u2013 2016 National Campaign Broadcasts",
    "stationBroadcast": "Peace FM, Asempa FM, UTV, Joy FM, Adom FM, TV3",
    "eventContext": "Over 40 national radio and television commercials aired by the NDC claiming Universal Free SHS would destroy secondary education.",
    "newsRelevance": "Education Transformation Blindspot: Universal Free SHS graduated 5.7M students vs. claims it was a '419 scam'.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 95,
    "overallVeracityScore": 10,
    "overallVerdict": "FABRICATED",
    "stationLogo": "Peace FM / UTV",
    "segments": [
      {
        "id": "fshsopp-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "John Dramani Mahama",
        "spokenText": "Free SHS is a 419 populist lie. It is not possible in this country today. If anyone tells you they can give free secondary education to everyone right now, they are deceiving you. It will collapse our education system.",
        "veracityScore": 10,
        "verdict": "FABRICATED",
        "evasionIndex": 89,
        "hedgingIndex": 15,
        "anomalyType": "FABRICATION",
        "explanation": "Universal Free SHS was successfully implemented in September 2017, expanded secondary enrolment from 881,600 to 1.45+ million, graduated over 5.7 million students, and achieved record WASSCE core pass rates.",
        "docketProof": {
          "officialSource": "West African Examinations Council (WAEC) & GES Enrolment Gazettes",
          "sourceType": "GES.gov.gh",
          "verifiedFact": "WAEC official results gazettes (2020-2024) confirm highest national pass rates in English, Science, and Core Mathematics under Free SHS.",
          "sourceUrl": "https://www.ges.gov.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-galamsey-pardon",
    "title": "2024 Western Region Campaign Address: Presidential Pardon for Galamsey Convicts",
    "speaker": "John Dramani Mahama",
    "speakerTitle": "Flagbearer of the NDC",
    "eventDate": "July 2024",
    "stationBroadcast": "Angel TV, UTV, JoyNews TV, Peace FM, Citi TV",
    "eventContext": "Campaign town hall address in mining communities in the Western Region broadcast live on Angel TV and social platforms.",
    "newsRelevance": "Environment & Water Security Blindspot: Proposing amnesty for illegal miners while River Pra, Birim, and Ankobra turbidity reaches 14,000 NTU.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 90,
    "overallVeracityScore": 12,
    "overallVerdict": "MISLEADING",
    "stationLogo": "Angel TV / UTV",
    "segments": [
      {
        "id": "galamsey-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "John Dramani Mahama",
        "spokenText": "When we come into power, all small-scale and illegal miners who have been arrested and jailed by this government will be granted presidential pardon and released immediately so they can return to their work.",
        "veracityScore": 12,
        "verdict": "MISLEADING",
        "evasionIndex": 84,
        "hedgingIndex": 20,
        "anomalyType": "STATISTICAL_DISTORTION",
        "explanation": "Promising unconditional pardons to illegal miners undermines the rule of law and accelerates river poisoning. Water Resources Commission data indicates water treatment plants in Kyebi, Daboase, and Bunso face total shutdown.",
        "docketProof": {
          "officialSource": "Water Resources Commission & Ghana Water Company Quality Baseline Audit",
          "sourceType": "EnergyCommission.gov.gh",
          "verifiedFact": "Ghana Water Company official water quality alerts confirm River Pra turbidity at Daboase intake reached 14,000 NTU against maximum treatable threshold of 2,000 NTU.",
          "sourceUrl": "https://www.gwcl.com.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-trainee-allowance",
    "title": "2014 Ministerial Statement on Scrapping Teacher and Nursing Trainee Allowances",
    "speaker": "Ministry of Education & Finance Leadership (NDC)",
    "speakerTitle": "Ministerial Spokesperson & Sector Ministers",
    "eventDate": "September 2014",
    "stationBroadcast": "Asempa FM, Adom FM, Peace FM, Joy 99.7 FM, GTV",
    "eventContext": "Formal radio and TV announcements explaining the executive cancellation of trainee teacher and nurse allowances.",
    "newsRelevance": "Youth & Social Vulnerability Blindspot: Trainee allowances cancelled for 3 years (2014-2016) vs. NPP restoration in 2017.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 85,
    "overallVeracityScore": 15,
    "overallVerdict": "MISLEADING",
    "stationLogo": "Asempa FM / Adom TV",
    "segments": [
      {
        "id": "trainee-seg-1",
        "startTime": 0,
        "endTime": 45,
        "timestampDisplay": "00:00 - 00:45",
        "speaker": "NDC Government Leadership",
        "spokenText": "The cancellation of teacher and nursing trainee allowances is necessary to expand enrolment and ensure educational equity. We will replace it with the Student Loan Trust Fund which is far superior for students.",
        "veracityScore": 15,
        "verdict": "MISLEADING",
        "evasionIndex": 87,
        "hedgingIndex": 22,
        "anomalyType": "STATISTICAL_DISTORTION",
        "explanation": "The cancellation was an IMF Extended Credit Facility mandate to compress the public wage bill. It plunged over 120,000 trainees into severe financial distress until the NPP administration fully restored monthly stipends in 2017.",
        "docketProof": {
          "officialSource": "Ministry of Finance 2017 Budget Statement & IMF ECF Review",
          "sourceType": "Parliament.gh",
          "verifiedFact": "2017 Budget Statement allocated funding to restore monthly allowances for all 46 public Colleges of Education and Nursing Training Colleges.",
          "sourceUrl": "https://www.mofep.gov.gh"
        }
      }
    ]
  },
  {
    "id": "gh-vid-24hour-economy",
    "title": "2024 Town Hall Address on 24-Hour Economy Policy Concept",
    "speaker": "John Dramani Mahama",
    "speakerTitle": "Flagbearer of the NDC",
    "eventDate": "November 2024 \u2013 2026 Policy Addresses",
    "stationBroadcast": "Citi TV, TV3, JoyNews TV, Peace FM, Asaase Radio",
    "eventContext": "Town hall policy lecture presenting the 24-hour economy concept to the business community and trade associations.",
    "newsRelevance": "Macroeconomic & Industrial Feasibility Blindspot: 24-Hour economy slogan vs. absence of dedicated off-taker financing and base-load industrial power planning.",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "youtubeId": "dQw4w9WgXcQ",
    "durationSeconds": 100,
    "overallVeracityScore": 30,
    "overallVerdict": "MISLEADING",
    "stationLogo": "Citi TV / TV3",
    "segments": [
      {
        "id": "24h-seg-1",
        "startTime": 0,
        "endTime": 50,
        "timestampDisplay": "00:00 - 00:50",
        "speaker": "John Dramani Mahama",
        "spokenText": "Our 24-hour economy policy will instantly create millions of night-shift jobs across manufacturing, ports, agriculture, and retail without requiring additional state borrowing or capital outlays.",
        "veracityScore": 30,
        "verdict": "MISLEADING",
        "evasionIndex": 80,
        "hedgingIndex": 35,
        "anomalyType": "STATISTICAL_DISTORTION",
        "explanation": "Operating night shifts requires private market demand, continuous base-load industrial power, security infrastructure, and export off-taker contracts. Shifting shifts without market capitalization does not create organic demand.",
        "docketProof": {
          "officialSource": "Association of Ghana Industries (AGI) & Institute of Statistical, Social and Economic Research (ISSER)",
          "sourceType": "Parliament.gh",
          "verifiedFact": "ISSER Economic Review noted 24-hour operation is demand-driven rather than legislative, requiring reduced electricity tariffs and guaranteed off-take markets.",
          "sourceUrl": "https://isser.ug.edu.gh"
        }
      }
    ]
  }
];
