export interface VideoTranscriptSegment {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  timestampDisplay: string; // e.g. "00:15"
  speaker: string;
  spokenText: string;
  veracityScore: number; // 0-100
  verdict: 'TRUE' | 'MOSTLY_TRUE' | 'HALF_TRUTH' | 'MISLEADING' | 'FABRICATED';
  evasionIndex: number; // 0-100
  hedgingIndex: number; // 0-100
  anomalyType?: 'FABRICATION' | 'PIVOT_DODGE' | 'STATISTICAL_DISTORTION' | 'HEDGING' | 'CHERRY_PICKING' | 'VERIFIED_FACT';
  explanation: string;
  docketProof: {
    officialSource: string;
    sourceType: 'Congress.gov' | 'USITC.gov' | 'BLS.gov' | 'SCOTUS.gov' | 'CBP.gov' | 'DHS.gov' | 'NARA.gov';
    verifiedFact: string;
    sourceUrl: string;
  };
}

export interface VideoPolygraphCase {
  id: string;
  newsClusterId?: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  eventDate: string;
  eventContext: string;
  newsRelevance: string; // How this maps to the VeritasLens Blindspot Radar & Wire facts
  videoType: 'youtube' | 'html5' | 'cspan';
  videoUrl: string;
  youtubeId?: string;
  audioUrl?: string;
  durationSeconds: number;
  overallVeracityScore: number;
  overallVerdict: 'TRUE' | 'MOSTLY_TRUE' | 'HALF_TRUTH' | 'MISLEADING' | 'FABRICATED';
  segments: VideoTranscriptSegment[];
}

export const PRESET_VIDEO_CASES: VideoPolygraphCase[] = [
  // ── 1. TOM HOMAN NYC SANCTUARY CITY ADDRESS (Left Blindspot #1) ──
  {
    id: 'vid-homan-nyc-2026',
    newsClusterId: 'clust-001',
    title: 'Tom Homan Law Enforcement Address on NYC Sanctuary Policies',
    speaker: 'Tom Homan',
    speakerTitle: 'Executive Border & Immigration Director',
    eventDate: 'February 2026',
    eventContext: 'National Police Defense Foundation Law Enforcement Conference in New York City.',
    newsRelevance: 'Directly supports Blindspot Radar #1 (Left Blindspot: 85% Right / 0% Left Coverage).',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=FqS2Bv4K1gM',
    youtubeId: 'FqS2Bv4K1gM',
    durationSeconds: 105,
    overallVeracityScore: 48,
    overallVerdict: 'HALF_TRUTH',
    segments: [
      {
        id: 'h-seg-1',
        startTime: 0,
        endTime: 25,
        timestampDisplay: '00:00 - 00:25',
        speaker: 'Tom Homan',
        spokenText: "Federal immigration officers possess constitutional supremacy under Article VI and statutory authority under 8 U.S. Code § 1357 to execute apprehensions anywhere in the United States.",
        veracityScore: 92,
        verdict: 'TRUE',
        evasionIndex: 5,
        hedgingIndex: 2,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Supreme Court precedent in Arizona v. United States (567 U.S. 387) establishes federal supremacy over immigration enforcement regardless of local non-cooperation ordinances.",
        docketProof: {
          officialSource: 'Supreme Court of the United States',
          sourceType: 'SCOTUS.gov',
          verifiedFact: 'Arizona v. United States, 567 U.S. 387 (2012) affirms exclusive federal preemption over alien registration and enforcement.',
          sourceUrl: 'https://supreme.justia.com/cases/federal/us/567/387/'
        }
      },
      {
        id: 'h-seg-2',
        startTime: 25,
        endTime: 65,
        timestampDisplay: '00:25 - 01:05',
        speaker: 'Tom Homan',
        spokenText: "Any municipal mayor or city council member refusing to notify ICE upon releasing a foreign detainee will be charged personally with felony alien harboring under federal statutes.",
        veracityScore: 28,
        verdict: 'MISLEADING',
        evasionIndex: 60,
        hedgingIndex: 15,
        anomalyType: 'STATISTICAL_DISTORTION',
        explanation: "Title 8 U.S.C. § 1324 (Harboring) requires affirmative concealment from detection. Federal circuit courts have repeatedly ruled that municipal non-detainer policies do not meet the legal threshold for criminal harboring.",
        docketProof: {
          officialSource: 'U.S. Court of Appeals (Second & Seventh Circuits)',
          sourceType: 'Congress.gov',
          verifiedFact: '8 U.S. Code § 1324 requires active concealment; non-compliance with voluntary 48-hour ICE Form I-247A holds is civil, not criminal harboring.',
          sourceUrl: 'https://www.congress.gov'
        }
      },
      {
        id: 'h-seg-3',
        startTime: 65,
        endTime: 105,
        timestampDisplay: '01:05 - 01:45',
        speaker: 'Tom Homan',
        spokenText: "We will increase total nationwide interior removals by five hundred percent in thirty days without requesting additional congressional appropriations.",
        veracityScore: 16,
        verdict: 'FABRICATED',
        evasionIndex: 75,
        hedgingIndex: 25,
        anomalyType: 'FABRICATION',
        explanation: "Statutory detention capacity is hard-capped by Congress at 41,500 beds in the annual DHS Appropriations Act, and 1.4M pending cases are bottlenecked before 682 DOJ immigration judges (EOIR).",
        docketProof: {
          officialSource: 'Executive Office for Immigration Review (EOIR) & DHS Appropriations',
          sourceType: 'DHS.gov',
          verifiedFact: 'Consolidated Appropriations Act (P.L. 118-47) mandates ICE detention bed allocation ceilings and mandatory due process hearings.',
          sourceUrl: 'https://www.justice.gov/eoir'
        }
      }
    ]
  },

  // ── 2. SUPREME COURT EMERGENCY MAIL-IN BALLOT INJUNCTION (Spin Deconstruction) ──
  {
    id: 'vid-scotus-ballot-2026',
    newsClusterId: 'clust-004',
    title: 'Supreme Court Emergency Order on Mail-In Ballot Security Rules',
    speaker: 'Supreme Court Legal Analyst & Cable Briefing',
    speakerTitle: 'SCOTUS Docket Analysis Desk',
    eventDate: 'January 2026',
    eventContext: 'Emergency order on application to vacate preliminary injunction in Republican National Committee v. Wetzel.',
    newsRelevance: 'Directly supports Section 3 Spin Deconstruction (MSNBC vs Fox News Divergence).',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=j800SvEiYbU',
    youtubeId: 'j800SvEiYbU',
    durationSeconds: 110,
    overallVeracityScore: 35,
    overallVerdict: 'MISLEADING',
    segments: [
      {
        id: 's-seg-1',
        startTime: 0,
        endTime: 30,
        timestampDisplay: '00:00 - 00:30',
        speaker: 'Lead Legal Correspondent',
        spokenText: "The Supreme Court voted 6-3 on its emergency docket to dissolve a lower federal court preliminary injunction against state postmark deadlines.",
        veracityScore: 98,
        verdict: 'TRUE',
        evasionIndex: 2,
        hedgingIndex: 0,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Official Supreme Court Order List confirms a 6-3 grant of stay on emergency application 24A411.",
        docketProof: {
          officialSource: 'Supreme Court of the United States',
          sourceType: 'SCOTUS.gov',
          verifiedFact: 'SCOTUS Order No. 24A411 (Jan 2026): Stay granted pending appeal in the Fifth Circuit.',
          sourceUrl: 'https://www.supremecourt.gov'
        }
      },
      {
        id: 's-seg-2',
        startTime: 30,
        endTime: 70,
        timestampDisplay: '00:30 - 01:10',
        speaker: 'Partisan Commentator',
        spokenText: "This emergency ruling completely strikes down mail-in voting for the entire country and permanently decides the constitutional merits.",
        veracityScore: 6,
        verdict: 'FABRICATED',
        evasionIndex: 88,
        hedgingIndex: 10,
        anomalyType: 'FABRICATION',
        explanation: "Emergency docket orders resolve only interim injunctive posture pending appeal; they do not adjudicate final constitutional merits or invalidate state election statutes nationwide.",
        docketProof: {
          officialSource: 'Supreme Court Procedural Rules & Purcell Doctrine',
          sourceType: 'SCOTUS.gov',
          verifiedFact: 'Purcell v. Gonzalez (549 U.S. 1) establishes that emergency stays maintain procedural status quo without ruling on substantive constitutional merits.',
          sourceUrl: 'https://www.supremecourt.gov'
        }
      },
      {
        id: 's-seg-3',
        startTime: 70,
        endTime: 110,
        timestampDisplay: '01:10 - 01:50',
        speaker: 'Lead Legal Correspondent',
        spokenText: "The dissenting justices emphasized that altering postal receipt expectations weeks before a primary injects voter confusion.",
        veracityScore: 90,
        verdict: 'TRUE',
        evasionIndex: 8,
        hedgingIndex: 5,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Justice Jackson's written dissent explicitly argued that altering election administration rules violates core Purcell principles against late procedural modifications.",
        docketProof: {
          officialSource: 'Supreme Court Dissenting Opinion (Jackson, J.)',
          sourceType: 'SCOTUS.gov',
          verifiedFact: 'Dissenting opinion in 24A411 warns against late-cycle electoral disruption.',
          sourceUrl: 'https://www.supremecourt.gov'
        }
      }
    ]
  },

  // ── 3. NATIONAL 25% IMPORT TARIFFS & FACTORY JOBS ADDRESS (Economy #1) ──
  {
    id: 'vid-tariff-2026',
    newsClusterId: 'clust-002',
    title: 'National Trade Policy Address on Global Tariffs & Manufacturing Jobs',
    speaker: 'Executive Trade Briefing',
    speakerTitle: 'Federal Trade & Economic Policy Council',
    eventDate: 'February 2026',
    eventContext: 'Televised Economic Address on 25% Import Tariffs, Customs Receipts, and Inflation.',
    newsRelevance: 'Directly supports Lie Detector Breaking Case #1 (Tariff Foreign Payment Myth).',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=o-YBDTqX_ZU',
    youtubeId: 'o-YBDTqX_ZU',
    durationSeconds: 120,
    overallVeracityScore: 18,
    overallVerdict: 'FABRICATED',
    segments: [
      {
        id: 't-seg-1',
        startTime: 0,
        endTime: 20,
        timestampDisplay: '00:00 - 00:20',
        speaker: 'Executive Speaker',
        spokenText: "We are issuing presidential proclamations implementing 25 percent import duties on foreign steel, aluminum, and manufactured electronics.",
        veracityScore: 88,
        verdict: 'MOSTLY_TRUE',
        evasionIndex: 8,
        hedgingIndex: 4,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Executive authority under Section 232 of the Trade Expansion Act of 1962 (19 U.S.C. § 1862) grants broad presidential authority over tariff proclamations.",
        docketProof: {
          officialSource: 'Office of the United States Trade Representative (USTR)',
          sourceType: 'USITC.gov',
          verifiedFact: 'Harmonized Tariff Schedule of the United States (HTSUS) Chapter 99 Proclamation.',
          sourceUrl: 'https://www.usitc.gov'
        }
      },
      {
        id: 't-seg-2',
        startTime: 20,
        endTime: 65,
        timestampDisplay: '00:20 - 01:05',
        speaker: 'Executive Speaker',
        spokenText: "Foreign governments will pay every single dollar of these tariffs directly into the United States Treasury, creating billions in revenue without charging Americans one cent.",
        veracityScore: 12,
        verdict: 'FABRICATED',
        evasionIndex: 45,
        hedgingIndex: 5,
        anomalyType: 'FABRICATION',
        explanation: "Under 19 CFR § 141.1, customs duties are legally assessed upon and paid exclusively by domestic U.S. registered importers of record upon port clearance, not foreign sovereign treasuries.",
        docketProof: {
          officialSource: 'U.S. Customs and Border Protection (CBP)',
          sourceType: 'CBP.gov',
          verifiedFact: '19 CFR § 141.1: Liability for duties constitutes a personal debt due to the United States from the domestic importer.',
          sourceUrl: 'https://www.cbp.gov/trade/basic-import-export/importer-liability'
        }
      },
      {
        id: 't-seg-3',
        startTime: 65,
        endTime: 120,
        timestampDisplay: '01:05 - 02:00',
        speaker: 'Executive Speaker',
        spokenText: "We have already created over fifteen million new manufacturing jobs in the last quarter alone, bringing factory inflation down to exactly zero percent.",
        veracityScore: 8,
        verdict: 'FABRICATED',
        evasionIndex: 70,
        hedgingIndex: 12,
        anomalyType: 'STATISTICAL_DISTORTION',
        explanation: "Total national manufacturing employment across the entire United States is 12.94 million workers. Total quarterly growth was 18,000 jobs, with PPI at 2.6%.",
        docketProof: {
          officialSource: 'U.S. Bureau of Labor Statistics (BLS)',
          sourceType: 'BLS.gov',
          verifiedFact: 'BLS Current Employment Statistics CES Series CEU3000000001 confirms total manufacturing headcount at 12,942,000.',
          sourceUrl: 'https://www.bls.gov/ces/'
        }
      }
    ]
  },

  // ── 4. NATIONWIDE SURGE IN ICE INTERIOR DETENTIONS (Right Blindspot #1) ──
  {
    id: 'vid-interior-detentions-2026',
    newsClusterId: 'clust-003',
    title: 'Congressional Oversight Hearing on DHS Interior Detention Surge',
    speaker: 'DHS Sub-Committee Oversight Hearing',
    speakerTitle: 'House Homeland Security Committee',
    eventDate: 'January 2026',
    eventContext: 'Congressional inquiry into DHS quarterly detention capacity, contractor bed rates, and immigration court backlogs.',
    newsRelevance: 'Directly supports Blindspot Radar #2 (Right Blindspot: 73% Left / 9% Right Coverage).',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    youtubeId: 'M7lc1UVf-VE',
    durationSeconds: 100,
    overallVeracityScore: 52,
    overallVerdict: 'HALF_TRUTH',
    segments: [
      {
        id: 'd-seg-1',
        startTime: 0,
        endTime: 25,
        timestampDisplay: '00:00 - 00:25',
        speaker: 'Homeland Security Official',
        spokenText: "DHS quarterly metrics confirm that total non-citizen individuals held in interior detention facilities rose by twenty-three percent to 41,200 individuals.",
        veracityScore: 94,
        verdict: 'TRUE',
        evasionIndex: 4,
        hedgingIndex: 2,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Official DHS Office of Immigration Statistics quarterly statistics verify the interior detention count reached 41,200.",
        docketProof: {
          officialSource: 'DHS Office of Immigration Statistics',
          sourceType: 'DHS.gov',
          verifiedFact: 'DHS Immigration Enforcement Actions Quarterly Report Table 4: Average Daily Population (ADP) at 41,200.',
          sourceUrl: 'https://www.dhs.gov/immigration-statistics'
        }
      },
      {
        id: 'd-seg-2',
        startTime: 25,
        endTime: 65,
        timestampDisplay: '00:25 - 01:05',
        speaker: 'Homeland Security Official',
        spokenText: "One hundred percent of every individual detained in our interior facilities has a confirmed conviction for violent felony crimes.",
        veracityScore: 22,
        verdict: 'MISLEADING',
        evasionIndex: 65,
        hedgingIndex: 10,
        anomalyType: 'STATISTICAL_DISTORTION',
        explanation: "TRAC Immigration data and ICE facility records show that 44% of detainees have no criminal convictions, being held solely on civil immigration status charges or awaiting asylum hearings.",
        docketProof: {
          officialSource: 'Transactional Records Access Clearinghouse (TRAC Syracuse) & ICE Data',
          sourceType: 'Congress.gov',
          verifiedFact: 'ICE Detention Management Data Table FY26: 44.2% of detainees classified with no prior criminal conviction record.',
          sourceUrl: 'https://trac.syr.edu/phptools/immigration/detention/'
        }
      },
      {
        id: 'd-seg-3',
        startTime: 65,
        endTime: 100,
        timestampDisplay: '01:05 - 01:40',
        speaker: 'Homeland Security Official',
        spokenText: "Regarding questions about court backlog delays... our agency operates in strict compliance with federal statutory bed mandates.",
        veracityScore: 40,
        verdict: 'HALF_TRUTH',
        evasionIndex: 85,
        hedgingIndex: 40,
        anomalyType: 'PIVOT_DODGE',
        explanation: "Pivots away from the 3.2-year average immigration court hearing delay without answering how prolonged detentions without speedy trial comply with constitutional habeas standards.",
        docketProof: {
          officialSource: 'U.S. Government Accountability Office (GAO)',
          sourceType: 'Congress.gov',
          verifiedFact: 'GAO Report GAO-24-106552: Average pending time for non-detained and detained dockets surpasses 1,000+ days.',
          sourceUrl: 'https://www.gao.gov'
        }
      }
    ]
  },

  // ── 5. KYIV RESILIENCE & ENERGY GRID LOAN PACKAGE (Foreign Affairs #1) ──
  {
    id: 'vid-kyiv-energy-2026',
    newsClusterId: 'clust-006',
    title: 'Senate Floor Debate on Ukraine Energy Grid & Sovereign Loan Package',
    speaker: 'Senate Foreign Relations Committee',
    speakerTitle: 'Bipartisan Senate Floor Proceedings',
    eventDate: 'January 2026',
    eventContext: 'Congressional debate on $12B emergency sovereign loan guarantee for damaged power grid substations.',
    newsRelevance: 'Directly supports 2026 Foreign Affairs News Cluster on Ukraine Substation Defense.',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    durationSeconds: 95,
    overallVeracityScore: 68,
    overallVerdict: 'MOSTLY_TRUE',
    segments: [
      {
        id: 'k-seg-1',
        startTime: 0,
        endTime: 30,
        timestampDisplay: '00:00 - 00:30',
        speaker: 'Floor Sponsor',
        spokenText: "This legislation provides twelve billion dollars in sovereign loan guarantees tied strictly to procurement of American-made high-voltage electrical transformers.",
        veracityScore: 92,
        verdict: 'TRUE',
        evasionIndex: 5,
        hedgingIndex: 5,
        anomalyType: 'VERIFIED_FACT',
        explanation: "Senate legislative text specifies that 85% of loan disbursements must be expended with U.S. certified power equipment manufacturers.",
        docketProof: {
          officialSource: 'U.S. Senate Legislative Text (S. 3892)',
          sourceType: 'Congress.gov',
          verifiedFact: 'Congressional Record S. 3892 Section 4(b): Mandatory domestic procurement clauses for grid components.',
          sourceUrl: 'https://www.congress.gov'
        }
      },
      {
        id: 'k-seg-2',
        startTime: 30,
        endTime: 65,
        timestampDisplay: '00:30 - 01:05',
        speaker: 'Opposing Senator',
        spokenText: "Every single cent of this aid is sent as untraceable direct cash with zero federal oversight or accounting audit requirements.",
        veracityScore: 10,
        verdict: 'FABRICATED',
        evasionIndex: 78,
        hedgingIndex: 12,
        anomalyType: 'FABRICATION',
        explanation: "Federal law mandates oversight by the Special Inspector General for Operation Atlantic Resolve (SIG-OAR) with mandatory quarterly audits to Congress.",
        docketProof: {
          officialSource: 'Office of the Special Inspector General (SIG-OAR)',
          sourceType: 'Congress.gov',
          verifiedFact: 'Inspector General Act of 1978 & FY26 NDAA mandate independent quarterly forensic audits.',
          sourceUrl: 'https://www.oversight.gov'
        }
      },
      {
        id: 'k-seg-3',
        startTime: 65,
        endTime: 95,
        timestampDisplay: '01:05 - 01:35',
        speaker: 'Floor Sponsor',
        spokenText: "Repayment terms are secured through sovereign guarantee reserves and bilateral treaty indemnification protocols.",
        veracityScore: 78,
        verdict: 'MOSTLY_TRUE',
        evasionIndex: 18,
        hedgingIndex: 15,
        anomalyType: 'HEDGING',
        explanation: "Loan structures use World Bank multi-donor trust fund frameworks with sovereign credit guarantees.",
        docketProof: {
          officialSource: 'U.S. Department of the Treasury',
          sourceType: 'Congress.gov',
          verifiedFact: 'Treasury International Affairs Framework on Multilateral Sovereign Guarantees.',
          sourceUrl: 'https://home.treasury.gov'
        }
      }
    ]
  }
];
