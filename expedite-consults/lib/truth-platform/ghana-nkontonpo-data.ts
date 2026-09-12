export interface MultiLingualQuote {
  en: string;
  tw: string; // Twi / Akan
  ga: string; // Ga
  ee: string; // Ewe
  ha: string; // Hausa
  dag?: string; // Dagbani
}

export interface NkontonpoNode {
  id: string;
  label: string;
  category: 'POLITICIAN' | 'DECEPTIVE_PROMISE' | 'STATUTORY_REALITY' | 'NPP_DELIVERY';
  politicianId: 'mahama' | 'current2024' | 'terkper' | 'housing' | 'sada' | 'bawumia';
  party?: 'NDC' | 'NPP';
  year: string;
  impactScore: number; // 0 - 100
  speaker: string;
  speakerRole: string;
  speakerParty: 'NDC' | 'NPP';
  venueContext: string;
  electionContext?: string;
  verbatimQuote?: string;
  multiLingualQuote?: MultiLingualQuote;
  statutoryOutcome: string;
  discrepancyDelta?: string;
  financialLoss?: string;
  citizenHardshipImpact?: string;
  officialDocket: string;
  evidencePoints?: string[];
  mediaOutlets?: string[];
  x: number;
  y: number;
}

export interface NkontonpoEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  type: 'DECEPTION_LINK' | 'FAILURE_LINK' | 'RESOLUTION_LINK';
}

export const NKONTONPO_NODES: NkontonpoNode[] = [
  {
    "id": "prom-shortmemory",
    "label": "Doctrine: 'Ghanaians Have Short Memories' (Squeeze & Shower Strategy)",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "Nov 2013 / 2015",
    "impactScore": 98,
    "speaker": "John Dramani Mahama",
    "speakerRole": "President of the Republic of Ghana (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Public Commissioning Address in Accra (widely reported across Peace FM, Joy FM, Citi FM)",
    "electionContext": "Explaining the political rationale of imposing severe economic hardship early in term and distributing incentives before voting.",
    "verbatimQuote": "The memory of Ghanaians is very short. You do something today, by tomorrow they have forgotten about it. We will make the tough decisions, squeeze them now, and when election year comes, we will shower gifts and money to win their votes.",
    "multiLingualQuote": {
      "en": "The memory of Ghanaians is very short. You do something today, by tomorrow they have forgotten about it... We can squeeze them now with taxes and hardships, and when elections arrive, they will forget everything once we distribute money and items.",
      "tw": "Ghanafo\u0254 wer\u025b firi nt\u025bm paa. Woy\u025b biribi nn\u025b a, \u0254kyena ara na w\u0254n wer\u025b afiri... Seesei y\u025bb\u025bmia w\u0254n ma asetena ay\u025b den, na abato\u0254 reb\u025bduru no, y\u025bagu sika ne aky\u025bde\u025b ama w\u0254n ato aba ama y\u025bn efis\u025b w\u0254renkae amanehunu no.",
      "ga": "Ghana bii ahi\u025b kpaa n\u0254 mli oya kwraa. K\u025b ofee n\u0254 ko \u014bm\u025bn\u025b a, w\u0254 lele\u014b am\u025bhi\u025b ebaakpa n\u0254... Amr\u0254 n\u025b\u025b w\u0254baamia am\u025b ni shihil\u025b awa, k\u025b abatoo ba l\u025b w\u0254baashwie sika k\u025b nikeenii w\u0254ha am\u025b ni am\u025bto aba am\u025bha w\u0254 ejaak\u025b am\u025bhi\u025b ebaakpa amanehulu l\u025b n\u0254.",
      "ee": "Ghana viwo \u0192e susu me nuawo bu na kaba \u014but\u0254. Ne \u00e8w\u0254 nane egbe la, ets\u0254 ko wo\u014bl\u0254e be... M\u00eda\u0192o wo \u0256e to fifia na agbea nases\u1ebd, eye ne tiatia\u0263i de la, m\u00edak\u0254 ga kple nunanawo \u0256e wo dzi ne woada gbe na m\u00ed elabena woa\u014bl\u0254 fukpekpeawo be.",
      "ha": "Mutanen Ghana masu saurin mantuwa ne sosai. Idan ka yi abu yau, gobe sun manta... Za mu matsa musu yanzu rayuwa ta yi tsanani, idan lokacin zabe ya yi kuma sai mu raba musu kudi da kyaututtuka su zabe mu domin sun manta da wahalar.",
      "dag": "Ghana nima t\u025bha bi yuura, b\u025b y\u025blgu tamda yomyom. A yi ni\u014b sh\u025bli zuna, bi\u025b\u0263u maa b\u025b tam li mi... Ti ni miya b\u025b pam saha \u014b\u0254 ka b\u025bhigu t\u0254, ka piibu-piibu yi ti paai ka ti kpa\u014b la\u0263iri mini pini n-ti ba ka b\u025b vooti ti dama b\u025b tam wahala maa."
    },
    "statutoryOutcome": "Cynical political philosophy treating citizens as easily manipulable through temporary election-year hand-outs after years of punitive taxation, Dumsor, and frozen employment.",
    "discrepancyDelta": "Disdain for citizen memory \u2794 Squeezed citizens with 70%+ utility hikes, then blew GHS 3.6B deficit in 2016 election year",
    "citizenHardshipImpact": "Millions of ordinary Ghanaians squeezed through 17.5% special petroleum levy, 17.5% VAT on financial services, cancelled allowances, and unbuffered price inflation.",
    "officialDocket": "Joy FM News Archive (Nov 2013), Peace FM Kokrokoo Broadcast Archive & Ministry of Finance 2016 Deficit Outturn Report",
    "evidencePoints": [
      "Speech delivered live in Accra where former President explicitly stated 'Ghanaians have short memories'.",
      "Followed by massive election-year state procurement of outboard motors, Mahindra vehicles for chiefs, and cash inducements in 2016.",
      "Resulted in a catastrophic 9.3% fiscal deficit overshoot in 2016, leaving an economic hole of GHS 3.6 Billion."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Peace FM",
      "Citi FM",
      "Daily Graphic",
      "Adom FM",
      "Daily Guide"
    ],
    "x": 550,
    "y": 215
  },
  {
    "id": "real-shortmemory",
    "label": "Reality: 4 Years of Severe Squeeze Followed by 2016 State-Funded Vote Buying",
    "category": "STATUTORY_REALITY",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2013\u20132016",
    "impactScore": 99,
    "speaker": "John Dramani Mahama / Ministry of Finance Outturn",
    "speakerRole": "President of Ghana / Auditor-General Audit",
    "speakerParty": "NDC",
    "venueContext": "National Fiscal Outturn & Election Commission Procurement Logs",
    "financialLoss": "GHS 3.6 Billion Unbudgeted Fiscal Hole in 2016 Election Year",
    "citizenHardshipImpact": "Citizens subjected to 4 years of extreme utility hikes, Dumsor, and allowance cancellations, followed by state-sponsored election bribery.",
    "statutoryOutcome": "The 'short memory' doctrine culminated in a massive 9.3% GDP fiscal deficit in 2016 due to unbudgeted election-year expenditure on outboard motors, gifts, and vehicles, which failed to prevent electoral defeat as voters remembered the 4 years of Dumsor and hardship.",
    "discrepancyDelta": "Assumed voters would forget \u2794 Ghanaian voters decisively rejected the squeeze-and-spray strategy in Dec 2016",
    "officialDocket": "Ministry of Finance 2016 Fiscal Deficit Report (9.3% GDP Deficit) & Auditor-General Report on Public Accounts 2016",
    "evidencePoints": [
      "Severe taxes imposed (17.5% Special Petroleum Tax, 17.5% VAT on banking, 70%+ electricity tariff hikes).",
      "2016 budget deficit widened by GHS 3.6B above the IMF ceiling in a last-minute push to shower gifts on voters.",
      "Election outcome proved Ghanaian citizens did not forget the 4 years of economic destruction."
    ],
    "mediaOutlets": [
      "Ministry of Finance",
      "Bank of Ghana",
      "Joy Newsfile",
      "Citi Business News"
    ],
    "x": 940,
    "y": 215
  },
  {
    "id": "p-mahama",
    "label": "John Dramani Mahama",
    "category": "POLITICIAN",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2009\u20132016 / Flagbearer",
    "impactScore": 99,
    "speaker": "John Dramani Mahama",
    "speakerRole": "Former President of Ghana & NDC Presidential Candidate",
    "speakerParty": "NDC",
    "venueContext": "Presidency, State of the Nation Addresses & Campaign Rallies",
    "electionContext": "Main political architect and signatory of campaign pledges spanning 2012, 2016, and recent campaign platforms.",
    "statutoryOutcome": "Former President whose administration presided over the 4-year Dumsor crisis, Saglemi contract variation, SADA scandal, GYEEDA embezzlement, 2015 IMF Extended Credit Facility bailout, and recent threats to repeal Free SHS and cancel trainee allowances.",
    "officialDocket": "Office of the President Gazettes, Parliament Hansard, & Auditor-General Reports (2012-2024)",
    "evidencePoints": [
      "Pledged in 2013 SONA to personally end load shedding by the close of 2013.",
      "Approved 200 E-Blocks manifesto pledge with only 29 operational by end of term in Dec 2016.",
      "Committed to non-interference with homegrown economy before signing 2015 IMF bailout package.",
      "Presided over $200M Saglemi project where $196M was disbursed for 668 incomplete, unlivable shells.",
      "Made infamous 'Dead Goat Syndrome' declaration in Botswana dismissing national strike actions."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "Daily Graphic",
      "Peace FM",
      "Parliamentary Hansard",
      "Adom FM"
    ],
    "x": 160,
    "y": 282
  },
  {
    "id": "prom-dumsor",
    "label": "Pledge: 'End Dumsor by end of 2013'",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "Feb 2013 SONA",
    "impactScore": 99,
    "speaker": "John Dramani Mahama",
    "speakerRole": "President of the Republic of Ghana (NDC)",
    "speakerParty": "NDC",
    "venueContext": "State of the Nation Address, Parliament House, Accra",
    "electionContext": "Delivered immediately after the 2012 election to quell intense public anger over nationwide blackouts and factory shutdowns.",
    "verbatimQuote": "I will hold myself personally accountable to end load shedding once and for all by the end of 2013.",
    "multiLingualQuote": {
      "en": "I will hold myself personally accountable to end load shedding once and for all by the end of 2013.",
      "tw": "Mede me ho b\u025bto h\u0254 s\u025b, afei de\u025b 2013 awiei yi, dumsor yi to b\u025btwa koraa koraa ma obiara ate ase\u025b.",
      "ga": "Maa fee hegb\u025b ak\u025b afi 2013 naagbee l\u025b, la k\u025b dumsor naagba n\u025b\u025b baaba naagbee kwraa.",
      "ee": "Matr\u0254 nye \u014but\u0254 nye \u014bk\u0254 akp\u0254 egb\u0254 be le \u0192e 2013 \u0192e nuwuwu la, d\u0254ts\u0254ts\u0254 ade dzo me la nu nava ke\u014bke\u014b.",
      "ha": "Zan \u0257auki nauyin kaina don ganin cewa an kawo \u0199arshen matsalar \u0257auke wutar lantarki kafin \u0199arshen 2013.",
      "dag": "N ni za\u014b n ma\u014ba n-zali ni yuuni 2013 bahigu, bu\u0263im kpihimbu \u014b\u0254 maa ni \u014bmaai kpatuuma."
    },
    "statutoryOutcome": "A hollow political promise made to calm national outrage, followed by 4 straight years of worsening 24h-48h load-shedding and catastrophic $1.2B/yr take-or-pay emergency contracts.",
    "discrepancyDelta": "Promised 0 blackouts by Dec 2013 \u2794 Reality: 4 continuous years of severe blackouts (2013-2016)",
    "citizenHardshipImpact": "Hairdressers, cold store operators, barbers, and manufacturing plants collapsed; hospital operating theaters ran on unstable generators.",
    "officialDocket": "Parliamentary Hansard (2013 State of the Nation Address) & Energy Commission Reports",
    "evidencePoints": [
      "Speech delivered on February 21, 2013 on national television and recorded in official Hansard.",
      "Dumsor intensified throughout 2013, 2014, 2015, and 2016 despite repeated 'deadline extensions'.",
      "Thousands of small businesses, hairdressers, cold stores, and factories collapsed between 2013 and 2016."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "Peace FM",
      "Daily Graphic",
      "Parliament Hansard"
    ],
    "x": 550,
    "y": 80
  },
  {
    "id": "real-dumsor",
    "label": "Reality: 4 Continuous Years of Dumsor + $1.2B/yr Power Debt",
    "category": "STATUTORY_REALITY",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2013\u20132016",
    "impactScore": 99,
    "speaker": "John Dramani Mahama (Auditor-General & Energy Commission Audit)",
    "speakerRole": "President of Ghana / Energy Commission Audit",
    "speakerParty": "NDC",
    "venueContext": "Official Energy Commission National Grid Records",
    "financialLoss": "$1.2 Billion / Year in Excess Capacity Penalty Debt (Take-or-Pay PPAs)",
    "citizenHardshipImpact": "Taxpayers forced to pay over $100M every month for idle electricity that Ghana could not consume.",
    "statutoryOutcome": "Ghana suffered 4 consecutive years of devastating Dumsor (2012-2016). To salvage power before the 2016 election, emergency contracts (Karpower, Ameri, AKSA) were signed committing Ghana to pay $1.2B every year for unused idle capacity.",
    "discrepancyDelta": "Promised stable power in 2013 \u2794 Crippled economy with $1.2B annual sovereign penalty debt",
    "officialDocket": "Energy Commission National Energy Statistics (2016) & Ministry of Finance Energy Sector Recovery Plan (ESRP)",
    "evidencePoints": [
      "Over 5,081 MW of capacity contracted against a peak national demand of barely 2,700 MW.",
      "Take-or-pay clauses mandated full sovereign payments regardless of whether electricity was transmitted.",
      "Accumulated legacy energy debt exceeded $2.8 Billion by December 2016."
    ],
    "mediaOutlets": [
      "Energy Commission",
      "GRIDCo Technical Log",
      "Joy Newsfile",
      "Citi Business News"
    ],
    "x": 940,
    "y": 80
  },
  {
    "id": "prom-deadgoat",
    "label": "Rhetoric: 'Dead Goat Syndrome' Speech to Striking Workers",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "March 2015",
    "impactScore": 95,
    "speaker": "John Dramani Mahama",
    "speakerRole": "President of Ghana (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Address to the Ghanaian Community in Gaborone, Botswana",
    "electionContext": "Delivered in response to nationwide demonstrations by doctors, nurses, civil servants, and university lecturers complaining about collapsing living conditions.",
    "verbatimQuote": "I have seen more demonstrations and strikes than any other president in Ghana. I have dead goat syndrome, meat of a dead goat does not fear the butcher's knife.",
    "multiLingualQuote": {
      "en": "I have seen more demonstrations and strikes than any other president in Ghana. I have dead goat syndrome, meat of a dead goat does not fear the butcher's knife.",
      "tw": "M'ahunu basabasa ne aperepere bebree sen \u0254mampanyin foforo biara. Mey\u025b abirekyie a wawu (dead goat); abirekyie a wawu nsuro sekan.",
      "ga": "Minaa strike k\u025b basabasa fe amralo f\u025b\u025b amralo. Miets\u0254 to gbo (dead goat); to ni egbo l\u025b esheee kakla gbeyei.",
      "ee": "Mekp\u0254 gbegbl\u1ebd kple d\u0254ts\u0254ts\u0254 gbogbowo wu dukpl\u0254la bubu \u0256esia\u0256e. Metr\u0254 zu gb\u0254\u0303 kuku; gb\u0254\u0303 kuku mesina na h\u025b o.",
      "ha": "Na ga zanga-zangar ma'aikata fiye da kowane shugaba. Na zama kamar matacciyar akuya; matacciyar akuya ba ta jin tsoron wu\u0199a.",
      "dag": "N-ny\u025bla yaa kpihimbu mini zaba gari g\u0254mnanti kam. N-leela bu\u014bkpi\u014b; bu\u014bkpi\u014b bi z\u0254ri sua dabi\u025bm."
    },
    "statutoryOutcome": "Official presidential admission of total indifference and disregard for nationwide labour strikes, university closures, and collapsing public health systems.",
    "discrepancyDelta": "Social Democrat Care \u2794 Public Insensitivity & Total Dismissal of Citizens' Hardship",
    "citizenHardshipImpact": "Doctors stayed off work for 3 weeks; ordinary Ghanaians died in hospital waiting rooms with no emergency care.",
    "officialDocket": "Presidential Speech Audio Archive & Joy FM / Citi FM Live Broadcast Recordings (March 11, 2015)",
    "evidencePoints": [
      "Speech delivered in Gaborone, Botswana to the Ghanaian diaspora community.",
      "Sparked nationwide outrage and condemnation across organized labour and religious bodies.",
      "Demonstrated refusal to address economic distress caused by severe utility hikes and Cedi collapse."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "BBC Africa",
      "Daily Graphic",
      "Peace FM"
    ],
    "x": 550,
    "y": 350
  },
  {
    "id": "real-deadgoat",
    "label": "Reality: Total Breakdown of Public Healthcare & Labour Strikes",
    "category": "STATUTORY_REALITY",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2015\u20132016",
    "impactScore": 95,
    "speaker": "Ghana Medical Association (GMA) & UTAG",
    "speakerRole": "Organized Labour & Medical Professionals",
    "speakerParty": "NDC",
    "venueContext": "Korle-Bu, KATH, and Public University Hospitals",
    "financialLoss": "GHS 450 Million in Lost Economic Productivity & Healthcare Paralysis",
    "statutoryOutcome": "Over 14 nationwide strikes occurred in 2015 alone. Doctors withdrew emergency services for 3 weeks; universities were closed for months as government refused to honor statutory tier-2 pension obligations.",
    "officialDocket": "National Labour Commission (NLC) Dispute Logs (2015-2016)",
    "evidencePoints": [
      "Ghana Medical Association (GMA) nationwide strike paralyzed emergency wards for 21 days.",
      "UTAG and POTAG university lecturers shut down lecture halls over unpaid research and book allowances.",
      "Government froze public sector employment under IMF structural benchmarks."
    ],
    "mediaOutlets": [
      "GMA Bulletin",
      "Joy News",
      "Citi FM",
      "MyJoyOnline"
    ],
    "x": 940,
    "y": 350
  },
  {
    "id": "prom-eblocks",
    "label": "Pledge: 'Construct 200 Brand New E-Blocks in 4 Years'",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2012 Manifesto",
    "impactScore": 93,
    "speaker": "John Dramani Mahama",
    "speakerRole": "NDC Flagbearer & President of Ghana",
    "speakerParty": "NDC",
    "venueContext": "Ho Jubilee Park (2012 NDC Manifesto Launch)",
    "electionContext": "Core educational centerpiece of the 2012 campaign used to counter and undermine the NPP's proposed Free SHS policy.",
    "verbatimQuote": "We will construct 200 brand new Community Day Senior High Schools across under-served districts by December 2016.",
    "multiLingualQuote": {
      "en": "We will construct 200 brand new Community Day Senior High Schools across under-served districts by December 2016.",
      "tw": "Y\u025bb\u025bsi E-Blocks Senior High School foforo 200 koraa w\u0254 mpaninfo\u0254 mpotam nyinaa ansa na 2016 awiei aduru.",
      "ga": "W\u0254 baama E-Blocks sukuu heei 200 k\u025bba maji f\u025b\u025b amli dani afi 2016 baaba naagbee.",
      "ee": "Miawo E-Blocks sukuu yeye 200 le nutome vovovowo ts\u0254 se \u0256e \u0192e 2016 nuwuwu.",
      "ha": "Zamu gina sabbin manyan makarantun sakandare na E-Blocks guda 200 a duk fa\u0257in \u0199asar nan kafin \u0199arshen 2016.",
      "dag": "Ti ni m\u025b E-Blocks karonzon diba\u014b 200 n-ti ti\u014bkpan nima p\u0254i ka yuuni 2016 naanyi paai."
    },
    "statutoryOutcome": "Massive failure in execution. Only 29 out of the 200 promised E-Blocks were commissioned by December 2016 (an 85.5% failure rate), leaving 171 uncompleted in bushes.",
    "discrepancyDelta": "Promised 200 E-Blocks \u2794 Delivered only 29 (85.5% Failure Rate)",
    "citizenHardshipImpact": "Over 100,000 rural JHS graduates had no secondary school placement and were forced to drop out of school.",
    "financialLoss": "GHS 850+ Million in Idle Capital & Abandoned Uncompleted Sites",
    "officialDocket": "Ministry of Education Special Audit on Secondary Infrastructure & Auditor-General Reports",
    "evidencePoints": [
      "Documented in Section 3 of the 2012 NDC Manifesto titled 'Advancing the Better Ghana Agenda'.",
      "By December 2016, only 29 buildings were completed and operational.",
      "Over 171 sites were abandoned in various uncompleted states, trapping over GHS 850 Million in public funds."
    ],
    "mediaOutlets": [
      "Daily Graphic",
      "Joy FM",
      "Citi FM",
      "Ministry of Education Gazettes"
    ],
    "x": 550,
    "y": 485
  },
  {
    "id": "real-eblocks",
    "label": "Reality: Only 29 Completed of 200 (171 Left Abandoned in Bush)",
    "category": "STATUTORY_REALITY",
    "politicianId": "mahama",
    "party": "NDC",
    "year": "2016 Audit",
    "impactScore": 93,
    "speaker": "Auditor-General & Ministry of Education Review",
    "speakerRole": "Statutory Infrastructure Audit Desk",
    "speakerParty": "NDC",
    "venueContext": "Auditor-General Annual Performance Report",
    "financialLoss": "GHS 850+ Million in Idle Capital & Abandoned Uncompleted Sites",
    "statutoryOutcome": "The Auditor-General confirmed that 171 school sites were left abandoned in overgrowth, with contractors unpaid and structures deteriorating without access roads, electricity, or water connections.",
    "discrepancyDelta": "85.5% Infrastructure Failure Rate (29 Delivered / 171 Abandoned)",
    "officialDocket": "Auditor-General Performance Audit Report on Educational Infrastructure (2016/2017)",
    "evidencePoints": [
      "Total contracts awarded far exceeded budgetary allocations.",
      "Massive cost overruns and delays left hundreds of rural communities without secondary education access.",
      "Subsequent administration had to re-allocate funds to complete salvageable sites."
    ],
    "mediaOutlets": [
      "Auditor-General Audit",
      "Joy News Expose",
      "Citi Newsroom"
    ],
    "x": 940,
    "y": 485
  },
  {
    "id": "p-current",
    "label": "NDC 2024 Platform & Campaign Leadership",
    "category": "POLITICIAN",
    "politicianId": "current2024",
    "party": "NDC",
    "year": "2024\u2013Present Campaign",
    "impactScore": 98,
    "speaker": "John Dramani Mahama & NDC National Campaign Team",
    "speakerRole": "NDC Flagbearer & Parliamentary Minority Leadership",
    "speakerParty": "NDC",
    "venueContext": "2024 Campaign Rallies, Town Halls & Parliamentary Opposition Front",
    "electionContext": "Contemporary political promises and parliamentary obstructionism impacting ordinary Ghanaians today.",
    "statutoryOutcome": "Leading campaigns proposing to review Free SHS, scrap teacher/nursing trainee allowances in favor of loans, introduce confusing 24-Hour Economy night tax levies, promised presidential pardons to illegal galamsey miners destroying river bodies, and boycotted national registration exercises.",
    "officialDocket": "NDC 2024 Manifesto ('Resetting Ghana'), Parliamentary Voting Records, & Campaign Speeches (2024)",
    "evidencePoints": [
      "Repeated statements promising to 'review' and restructure Free SHS within 90 days.",
      "Stated commitment to replace trainee allowances with loan repayment burdens.",
      "Promised presidential pardons to arrested galamsey operators destroying water bodies.",
      "Obstructed vital sovereign credit and budget approvals in the hung Parliament."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "TV3 Ghana",
      "Peace FM",
      "Oman FM",
      "Adom TV"
    ],
    "x": 160,
    "y": 707
  },
  {
    "id": "prom-freeshs-repeal",
    "label": "Current Threat: Promise to 'Review' Free SHS & Decouple Boarding Subsidies",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "current2024",
    "party": "NDC",
    "year": "2024 Campaign Platform",
    "impactScore": 99,
    "speaker": "John Dramani Mahama",
    "speakerRole": "NDC Presidential Candidate",
    "speakerParty": "NDC",
    "venueContext": "Ghana National Association of Private Schools (GNAPS) Town Hall & Campaign Speeches",
    "electionContext": "Promised to fundamentally restructure Free SHS within the first 90 days, cancel universal boarding feeding subsidies for affluent parents, and divert funding to private schools.",
    "verbatimQuote": "Within the first 90 days in office, we will review the entire Free SHS implementation, abolish the double track system, and allow parents to pay for boarding while bringing private schools on board.",
    "multiLingualQuote": {
      "en": "Within the first 90 days in office, we will review the entire Free SHS implementation, abolish the double track system, and allow parents to pay for boarding while bringing private schools on board.",
      "tw": "Nnansa 90 a y\u025bb\u025bba tumidie so no, y\u025bb\u025bsesa Free SHS no nyinaa koraa; awofo\u0254 b\u025btua boarding sika na y\u025bagyae nnwuma foforo no.",
      "ga": "Y\u025b gbii 90 kl\u025b\u014bkl\u025b\u014b mli l\u025b, w\u0254baatua Free SHS l\u025b gb\u025bjian\u0254too l\u025b f\u025b\u025b he, koni f\u0254l\u0254i awo boarding shikp\u0254\u014b sika.",
      "ee": "Le \u014bkeke 90 gb\u00e3t\u0254wo me la, m\u00edatr\u0254 asi le Free SHS \u0192e nuw\u0254w\u0254 \u014bu kura bene dzilawo naxe ga \u0256e x\u0254d\u0254d\u0254 ta.",
      "ha": "Cikin kwanaki 90 na farko, zamu sake duba tsarin karatun kyauta na Free SHS gaba \u0257aya, inda iyaye zasu biya ku\u0257in abinci da masauki a makaranta.",
      "dag": "Goli ata bahigu ni, ti ni lahi labi nya Free SHS maa soli zaa ka ch\u025b ka banima yo boarding la\u0263ifu."
    },
    "statutoryOutcome": "Threatens the educational future of over 1.4 million currently enrolled high school students and 5.7 million total beneficiaries, re-introducing school fee barriers for struggling poor parents.",
    "discrepancyDelta": "Guaranteed Universal Free Access \u2794 Re-introducing Boarding Fees & Quotas for Poor Families",
    "citizenHardshipImpact": "Millions of low-income cocoa farmers, market women, and kayayei will lose full secondary education coverage and be forced to pay boarding and tuition fees again.",
    "officialDocket": "NDC 2024 Manifesto ('Resetting Ghana') Chapter 4: Education & Human Capital",
    "evidencePoints": [
      "John Mahama and NDC communication officers confirmed plan to review funding architecture.",
      "Civil society education groups warn that means-testing boarding fees will disenfranchise rural poor students.",
      "Reverses 7 years of unprecedented enrollment growth under Universal Free SHS."
    ],
    "mediaOutlets": [
      "Joy Newsfile",
      "Citi TV Point of View",
      "Daily Graphic",
      "Peace FM"
    ],
    "x": 550,
    "y": 640
  },
  {
    "id": "real-freeshs-repeal",
    "label": "Reality: Free SHS Educated 5.7M Youth with Free Boarding, Meals, and Books",
    "category": "STATUTORY_REALITY",
    "politicianId": "current2024",
    "party": "NDC",
    "year": "2024 GES Verification",
    "impactScore": 99,
    "speaker": "Ministry of Education & Ghana Education Service (GES)",
    "speakerRole": "Statutory Education Regulators",
    "speakerParty": "NDC",
    "venueContext": "GES National Performance Briefing",
    "financialLoss": "Risk of Returning Over 500,000 Poor Children Annually to Financial Exclusion",
    "citizenHardshipImpact": "Parents saved over GHS 7,500 per child per year in boarding, textbook, examination, and feeding costs.",
    "statutoryOutcome": "Under the NPP administration, Free SHS eliminated all fees, expanded secondary school enrollment by 65%, and achieved record WASSCE pass rates exceeding 68% in English and Mathematics in 2023.",
    "discrepancyDelta": "NPP Universal Inclusion \u2794 NDC Proposed Fee Re-imposition on Boarding & Meals",
    "officialDocket": "GES Statistics Review (2024) & WAEC International Examination Council Gazettes",
    "evidencePoints": [
      "Cumulative beneficiaries exceeded 5.7 million students between 2017 and 2024.",
      "Gender parity index in secondary education reached 1:1 for the first time in Ghana's history.",
      "Eliminated dropout rates between Junior High School and Senior High School."
    ],
    "mediaOutlets": [
      "GES Gazette",
      "WAEC Results Portal",
      "Joy FM",
      "Citi FM"
    ],
    "x": 940,
    "y": 640
  },
  {
    "id": "prom-galamsey",
    "label": "Current Threat: Promise to Grant Presidential Pardons to Illegal Miners (Galamseyers)",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "current2024",
    "party": "NDC",
    "year": "2020 & 2024 Campaign Rallies",
    "impactScore": 98,
    "speaker": "John Dramani Mahama",
    "speakerRole": "NDC Flagbearer",
    "speakerParty": "NDC",
    "venueContext": "Campaign Rallies in Mining Communities (Tarkwa, Prestea, Obuasi, Manso Nkwanta)",
    "electionContext": "Promised illegal miners in mining enclaves that all jailed galamsey operators would be pardoned, released from prison, and have their confiscated excavators returned to them.",
    "verbatimQuote": "When we come into power, all small-scale illegal miners who have been arrested and imprisoned will receive presidential pardons and be released immediately to resume mining.",
    "multiLingualQuote": {
      "en": "When we come into power, all small-scale illegal miners who have been arrested and imprisoned will receive presidential pardons and be released immediately to resume mining.",
      "tw": "S\u025b y\u025bba tumidie so a, galamseyfo\u0254 nyinaa a w\u0254akyere w\u0254n ahy\u025b afiase no, m\u025bbue adafiadeapon ama w\u0254n nyinaa afiri adi ak\u0254y\u025b w\u0254n adwuma.",
      "ga": "K\u025bji w\u0254ba amraloyeli mli l\u025b, m\u025bi f\u025b\u025b ni y\u0254\u0254 galamsey tsum\u0254 mli ni atoo am\u025b tsu\u014b l\u025b, maa fee hegb\u025b ni atsi am\u025b f\u025b\u025b koni am\u025bbatsu am\u025bnitsum\u0254.",
      "ee": "Ne m\u00edeva dzi\u0256u\u0256u dzi la, galamsey d\u0254w\u0254la siwo kat\u00e3 wode gax\u0254 me la, makp\u0254 wo ta bene woado le gax\u0254 me atr\u0254 ayi d\u0254w\u0254w\u0254 me.",
      "ha": "Idan mun kafa gwamnati, dukkan masu hakar ma'adinai ta haramtacciyar hanya (galamsey) da aka daure za mu yafe musu mu sake su su koma bakin aiki.",
      "dag": "Ti yi labi g\u0254mnanti ni, banima zaa ban kpihim galamsey tuma ni ka be za\u014bba n-kpari sarika maa, n ni ch\u025b ka ba yina n-kpe ba tuma ni."
    },
    "statutoryOutcome": "Devastating destruction of river bodies (River Pra, Ankobra, Birim, Offin, Black Volta) and cocoa farmlands. Ghana Water Company Limited (GWCL) warned that water treatment costs have surged by 400%, threatening clean drinking water for ordinary citizens in Cape Coast, Sekondi-Takoradi, and Kumasi.",
    "discrepancyDelta": "Populist Vote Buying \u2794 Destruction of National Water Security & Poisoning of Drinking Water",
    "citizenHardshipImpact": "Ordinary Ghanaians face severe water rationing, high municipal water tariffs, and high mercury/heavy metal poisoning in fish and crops.",
    "officialDocket": "Ghana Water Company Limited (GWCL) Water Quality Assessment Reports & EPA Environmental Gazettes (2024)",
    "evidencePoints": [
      "Delivered verbatim during addresses to small-scale mining associations in the Western and Ashanti regions.",
      "Directly sabotages national environmental security and anti-galamsey enforcement.",
      "GWCL treatment plants at Kyebi, Bunso, and Sekyere Hemang forced to shut down due to excessive turbidity exceeding 14,000 NTU."
    ],
    "mediaOutlets": [
      "Joy News (Clean Water Crisis)",
      "Citi Newsroom",
      "Daily Graphic",
      "Peace FM"
    ],
    "x": 550,
    "y": 775
  },
  {
    "id": "real-galamsey",
    "label": "Reality: Polluted Pra, Birim & Ankobra Rivers Threaten National Drinking Water Crisis",
    "category": "STATUTORY_REALITY",
    "politicianId": "current2024",
    "party": "NDC",
    "year": "2024 Water Crisis",
    "impactScore": 98,
    "speaker": "Ghana Water Company Ltd (GWCL) & Water Resources Commission (WRC)",
    "speakerRole": "National Water Utility & Environmental Engineers",
    "speakerParty": "NDC",
    "venueContext": "National Water Treatment Plants & River Basins",
    "financialLoss": "GHS 650 Million Annual Water Treatment Chemical Cost Spike + Lost Farmlands",
    "citizenHardshipImpact": "Municipal water rationing in major cities; water turbidity jumped from normal 50 NTU to over 14,000 NTU.",
    "statutoryOutcome": "Turbidity in major water sources reached catastrophic levels. Political encouragement of galamseyers has endangered municipal water supply for over 6 million citizens across 5 regions.",
    "discrepancyDelta": "Releasing Convicted Environmental Destroyers Directly Threatens Public Health",
    "officialDocket": "GWCL Annual Technical Water Turbidity Report (2024) & Minerals Commission Enforcement Logs",
    "evidencePoints": [
      "GWCL confirmed spending 4x more on aluminum sulphate and chlorine just to make tap water barely potable.",
      "Thousands of hectares of productive cocoa farms destroyed by unregulated open-cast pits.",
      "Health researchers identified dangerous traces of lead, mercury, and cyanide in local food chains."
    ],
    "mediaOutlets": [
      "GWCL Technical Brief",
      "Joy News Environmental Desk",
      "Citi FM",
      "TV3 Ghana"
    ],
    "x": 940,
    "y": 775
  },
  {
    "id": "p-terkper",
    "label": "Seth Terkper (Finance Min)",
    "category": "POLITICIAN",
    "politicianId": "terkper",
    "party": "NDC",
    "year": "2013\u20132016",
    "impactScore": 96,
    "speaker": "Seth Emmanuel Terkper",
    "speakerRole": "Minister for Finance & Economic Planning (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Ministry of Finance & Senchi Economic Forum",
    "electionContext": "Led the macroeconomic management team that declared Ghana would rely strictly on homegrown solutions before signing the 2015 IMF bailout program.",
    "statutoryOutcome": "Oversaw the macroeconomic collapse that necessitated the April 2015 IMF $918M bailout, which imposed a freeze on public sector employment and the cancellation of teacher/nursing trainee allowances.",
    "officialDocket": "Ministry of Finance Gazettes & IMF Executive Board Country Reports (2014-2016)",
    "evidencePoints": [
      "Declared at Senchi that Ghana's sovereign economic model did not require an IMF structural adjustment program.",
      "Signed the $918M IMF Extended Credit Facility (ECF) agreement in April 2015.",
      "Enforced conditionalities that froze civil service hiring and scrapped trainee allowances."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "IMF Country Desk",
      "Daily Graphic"
    ],
    "x": 160,
    "y": 930
  },
  {
    "id": "prom-imf",
    "label": "Pledge: 'Ghana Will Never Go to IMF (Homegrown Solutions Only)'",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "terkper",
    "party": "NDC",
    "year": "May 2014 Senchi",
    "impactScore": 96,
    "speaker": "Seth Terkper & John Dramani Mahama",
    "speakerRole": "Minister of Finance & President of Ghana (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Senchi National Economic Forum (Royal Senchi Hotel)",
    "electionContext": "Issued 22-point 'Senchi Consensus' declaring Ghana would avoid foreign conditionalities and fix the falling Cedi with internal domestic policies.",
    "verbatimQuote": "Ghana is not going to the IMF. We have developed homegrown fiscal consolidation measures that will stabilize the cedi and restore growth without external conditionalities.",
    "multiLingualQuote": {
      "en": "Ghana is not going to the IMF. We have developed homegrown fiscal consolidation measures that will stabilize the cedi and restore growth without external conditionalities.",
      "tw": "Ghana nk\u0254 IMF koraa. Y\u025bw\u0254 y\u025bn ankasa nhyehy\u025be (homegrown solutions) a \u025bb\u025bma cedi no agyina yie a y\u025bnhia amann\u0254nefo\u0254 mmara.",
      "ga": "Ghana eyaa IMF kwraa. W\u0254y\u025b w\u0254 di\u025bnts\u025b w\u0254 gb\u025bjian\u0254too ni baaha cedi l\u025b ada\u014b shi b\u0254 ni w\u0254hiaaa amralo kroko gb\u025bjian\u0254too.",
      "ee": "Ghana mayi IMF o. M\u00eda \u014but\u0254 m\u00edaw\u0254 m\u00eda\u0192e ganyawo \u014buti d\u0254w\u0254nawo bene Cedi nan\u0254 te ses\u0129e ma\u0256o du bubuwo \u0192e se me o.",
      "ha": "Ghana ba za ta je wajen asusun IMF ba. Muna da tsare-tsarenmu na cikin gida da za su daidaita darajar cedi ba tare da sharuddan waje ba.",
      "dag": "Ghana ku cha\u014b IMF kpatuuma. Ti mali ti ma\u014b ma\u014b soli din y\u025bn kpa\u014bsi cedi maa ka ti bi b\u0254ri dabiiligu sh\u025bli."
    },
    "statutoryOutcome": "Direct policy deception. Barely 10 months later in April 2015, Ghana capitulated and signed a 3-year $918M IMF Extended Credit Facility bailout.",
    "discrepancyDelta": "Promised 100% Homegrown Sovereignty \u2794 Surrendered to $918M IMF Structural Program",
    "citizenHardshipImpact": "Graduates faced complete civil service recruitment freeze; trainees lost monthly stipends.",
    "officialDocket": "The Senchi Consensus Communiqu\u00e9 (May 2014) & IMF Executive Board Press Release No. 15/159",
    "evidencePoints": [
      "The Senchi Consensus was widely publicized as an alternative to Bretton Woods intervention.",
      "Inflation surged to 19.2% and the Cedi lost over 40% of its value within 12 months.",
      "In April 2015, government formally signed IMF loan agreement mandating strict austerity."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "Peace FM",
      "Financial Times"
    ],
    "x": 550,
    "y": 930
  },
  {
    "id": "real-imf",
    "label": "Reality: Signed $918M IMF Bailout + Cancelled Trainee Allowances & Hiring Freeze",
    "category": "STATUTORY_REALITY",
    "politicianId": "terkper",
    "party": "NDC",
    "year": "April 2015",
    "impactScore": 96,
    "speaker": "IMF Executive Board & Ministry of Finance",
    "speakerRole": "International Monetary Fund & National Treasury",
    "speakerParty": "NDC",
    "venueContext": "Washington D.C. / Ministry of Finance Press Room",
    "financialLoss": "$918 Million Austerity Debt Package + Loss of Over 50,000 Trainee Allowances",
    "citizenHardshipImpact": "Trainee teachers and nurses went months without food and accommodation support; thousands dropped out.",
    "statutoryOutcome": "The IMF program imposed a complete moratorium on public sector recruitment, capped wage increases, raised utility tariffs by over 70%, and eliminated monthly allowances for all nursing and teacher trainees.",
    "discrepancyDelta": "Severe 3-Year Austerity Imposed on Ghanaian Trainees and Unemployed Graduates",
    "officialDocket": "IMF Country Report No. 15/103 (Ghana: Request for Extended Credit Facility)",
    "evidencePoints": [
      "Moratorium placed on net hiring in education, health, and civil service sectors.",
      "Teacher and nursing trainee allowances abolished, placing severe tuition burdens on families.",
      "Utility tariffs escalated rapidly under PURC quarterly benchmark requirements."
    ],
    "mediaOutlets": [
      "IMF Press Release",
      "Ministry of Finance",
      "Joy Newsfile",
      "Citi Eyewitness News"
    ],
    "x": 940,
    "y": 930
  },
  {
    "id": "p-housing",
    "label": "Alhaji Collins Dauda (Housing Min)",
    "category": "POLITICIAN",
    "politicianId": "housing",
    "party": "NDC",
    "year": "2012\u20132016",
    "impactScore": 97,
    "speaker": "Alhaji Collins Dauda",
    "speakerRole": "Minister of Works & Housing (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Ministry of Works & Housing & Parliament House",
    "electionContext": "Oversaw the $200 Million Saglemi Affordable Housing Project agreements and executive variations.",
    "statutoryOutcome": "Indicted by the Attorney General and standing criminal trial in High Court Suit No. CR/0248/2021 for intentionally causing financial loss to the state by signing unauthorized contract variations that reduced housing units from 5,000 to 1,506 for the same $200M price.",
    "officialDocket": "High Court of Justice (Criminal Division) Suit No. CR/0248/2021: The Republic v. Collins Dauda & 4 Others",
    "evidencePoints": [
      "Secured $200M Credit Suisse loan facility approved by Parliament for 5,000 units.",
      "Signed variation agreements without Parliamentary approval reducing units to 1,506.",
      "Authorized disbursement of $196M for only 668 incomplete, uninhabitable shells."
    ],
    "mediaOutlets": [
      "High Court Docket",
      "Joy FM",
      "Citi FM",
      "Daily Graphic"
    ],
    "x": 160,
    "y": 1065
  },
  {
    "id": "prom-saglemi",
    "label": "Pledge: '$200M Saglemi Loan to Deliver 5,000 Completed Habitable Homes'",
    "category": "DECEPTIVE_PROMISE",
    "politicianId": "housing",
    "party": "NDC",
    "year": "Oct 2012 Parliament",
    "impactScore": 97,
    "speaker": "Alhaji Collins Dauda & Ministry of Works & Housing",
    "speakerRole": "Minister for Works and Housing (NDC)",
    "speakerParty": "NDC",
    "venueContext": "Parliament House, Accra (Loan Approval Debate)",
    "electionContext": "Promised to deliver 5,000 fully finished modern housing units for civil servants, teachers, nurses, and armed forces personnel.",
    "verbatimQuote": "This $200 million project will deliver 5,000 completed habitable housing units with all auxiliary infrastructure for Ghanaian workers.",
    "multiLingualQuote": {
      "en": "This $200 million project will deliver 5,000 completed habitable housing units with all auxiliary infrastructure for Ghanaian workers.",
      "tw": "Saa Saglemi $200M sika yi b\u025bsi afie f\u025bf\u025b\u025bf\u025b 5,000 a nsuo ne anyinam kanea wom ama adwumay\u025bfo\u0254 w\u0254 Ghana.",
      "ga": "Saglemi shikp\u0254\u014b $200M n\u025b\u025b baaha w\u0254tsu tsuji 5,000 ni nu k\u025b la y\u0254\u0254 mli k\u025bha Ghanaian nitsul\u0254i.",
      "ee": "Saglemi x\u0254tutu $200M \u0192e ga n\u025b\u025b atu x\u0254 nyui 5,000 siwo me tsi kple dzo le na Ghana d\u0254w\u0254lawo.",
      "ha": "Wannan aikin Saglemi na Dala Miliyan 200 zai samar da ingantattun gidaje 5,000 masu ruwa da wutar lantarki ga ma'aikatan Ghana.",
      "dag": "Saglemi $200M \u014b\u0254 maa ni m\u025b yiili 5,000 din mali kom mini bu\u0263im n-ti tumtumdiba zaa."
    },
    "statutoryOutcome": "Massive criminal scandal. Unlawfully varied the contract to 1,506 units; disbursed $196M (98% of funds) for only 668 uncompleted, unlivable shells with zero water, electricity, or sewage infrastructure.",
    "discrepancyDelta": "Promised 5,000 Units \u2794 Delivered 668 Incomplete Concrete Shells (Criminal Trial Underway)",
    "citizenHardshipImpact": "Civil servants, nurses, and police officers still pay exorbitant 2-year rent advances in Accra because 5,000 promised units were never built.",
    "financialLoss": "$196 Million Spent on Incomplete Shells + $68M Required for Remediation",
    "officialDocket": "High Court Suit No. CR/0248/2021 & AESL Technical Audit Report on Saglemi Housing",
    "evidencePoints": [
      "Parliamentary approval of Oct 31, 2012 strictly mandated 5,000 units.",
      "Contract amended without Parliamentary assent in violation of Article 181(5) of the Constitution.",
      "Disbursed $196M out of $200M loan to contractor Construtora OAS before project abandonment."
    ],
    "mediaOutlets": [
      "Parliamentary Hansard",
      "Joy News",
      "Citi FM",
      "Daily Guide"
    ],
    "x": 550,
    "y": 1065
  },
  {
    "id": "real-saglemi",
    "label": "Reality: $196M Paid for 668 Incomplete Shells (High Court Suit CR/0248/2021)",
    "category": "STATUTORY_REALITY",
    "politicianId": "housing",
    "party": "NDC",
    "year": "2021 Criminal Trial",
    "impactScore": 97,
    "speaker": "Attorney General & Minister for Justice (Godfred Dame)",
    "speakerRole": "Attorney General of the Republic of Ghana",
    "speakerParty": "NDC",
    "venueContext": "High Court (Criminal Division), Accra",
    "financialLoss": "$196 Million Spent with Zero Livable Homes & $68M Required for Remediation",
    "citizenHardshipImpact": "Taxpayers still pay debt service on the $200M Credit Suisse loan every year with zero completed apartments.",
    "statutoryOutcome": "The Attorney General indicted 5 officials including Collins Dauda, former Chief Director Kwaku Agyeman-Mensah, and OAS executives for intentionally causing financial loss of $196M to the state.",
    "discrepancyDelta": "Causing Financial Loss to the State & Gross Misappropriation of Public Funds",
    "officialDocket": "Charge Sheet & Facts in High Court Suit No. CR/0248/2021 (The Republic v. Collins Dauda & 4 Others)",
    "evidencePoints": [
      "AESL engineering audit confirmed the 668 shells cannot be occupied without an additional $68M investment in roads, sewage, and water.",
      "4,332 houses completely vanished from the contract scope.",
      "Taxpayers continue paying Credit Suisse loan amortization with zero housing benefit."
    ],
    "mediaOutlets": [
      "High Court Docket",
      "Joy FM",
      "Citi Newsroom",
      "Daily Graphic"
    ],
    "x": 940,
    "y": 1065
  },
  {
    "id": "p-bawumia",
    "label": "Dr. Mahamudu Bawumia (VP, NPP)",
    "category": "POLITICIAN",
    "politicianId": "bawumia",
    "party": "NPP",
    "year": "2017\u2013Present",
    "impactScore": 99,
    "speaker": "Dr. Mahamudu Bawumia",
    "speakerRole": "Vice President of the Republic of Ghana & Head of Economic Management Team",
    "speakerParty": "NPP",
    "venueContext": "Presidency, National Policy Summits, Digital Economy Launches",
    "electionContext": "Key architect of NPP macroeconomic reforms, digital public infrastructure, Free SHS financing, and social intervention restorations.",
    "statutoryOutcome": "Delivered Universal Free SHS (5.7M beneficiaries), restored Teacher & Nursing Trainee allowances cancelled by NDC, built Mobile Money Interoperability (17M+ users), Digital Address System, and Medical Drone Delivery Network.",
    "officialDocket": "Office of the Vice President Gazettes, Ministry of Finance Budget Statements (2017-2024)",
    "evidencePoints": [
      "Successfully rolled out Universal Free SHS within 9 months of taking office in Sept 2017.",
      "Restored Teacher & Nursing Trainee allowances in 2017 budget after NDC IMF abolition.",
      "Engineered Mobile Money Interoperability linking 17M+ mobile wallets to bank accounts."
    ],
    "mediaOutlets": [
      "Joy FM",
      "Citi FM",
      "Peace FM",
      "Bank of Ghana Archives"
    ],
    "x": 160,
    "y": 1287
  },
  {
    "id": "deliv-freeshs",
    "label": "NPP Delivery: Universal Free SHS (5.7M Beneficiaries & Record WASSCE Passes)",
    "category": "NPP_DELIVERY",
    "politicianId": "bawumia",
    "party": "NPP",
    "year": "2017\u2013Present",
    "impactScore": 99,
    "speaker": "Nana Akufo-Addo & Dr. Mahamudu Bawumia",
    "speakerRole": "President & Vice President of the Republic of Ghana",
    "speakerParty": "NPP",
    "venueContext": "West Africa Senior High School (Free SHS Launch, Sept 2017)",
    "electionContext": "Core manifesto promise fulfilled in first term despite intense NDC skepticism and claims that it was impossible.",
    "statutoryOutcome": "Implemented universal Free SHS in September 2017 covering tuition, boarding, meals, and textbooks for over 5.7 million students with record-breaking WASSCE pass rates in mathematics and science.",
    "discrepancyDelta": "NDC Claimed Impossible & Unaffordable \u2794 NPP Delivered Universal Free Access to 5.7M Youth",
    "citizenHardshipImpact": "Saved poor Ghanaian families billions of Cedis in school fees, expanding secondary enrollment by 65%.",
    "officialDocket": "Ghana Education Service (GES) Performance Review & WAEC National Examination Gazettes (2017-2024)",
    "evidencePoints": [
      "Secondary school enrollment surged by over 65% across all 16 regions.",
      "Over 5.7 million young Ghanaians benefited without paying a single cedi in school fees.",
      "Ghana achieved highest WASSCE aggregate scores in West Africa for 4 consecutive years (2020-2023)."
    ],
    "mediaOutlets": [
      "GES Gazette",
      "WAEC International Office",
      "Daily Graphic",
      "Joy FM"
    ],
    "x": 940,
    "y": 1220
  },
  {
    "id": "deliv-allowance",
    "label": "NPP Delivery: Trainee Allowances Fully Restored across 46 Colleges",
    "category": "NPP_DELIVERY",
    "politicianId": "bawumia",
    "party": "NPP",
    "year": "Sept 2017\u2013Present",
    "impactScore": 96,
    "speaker": "Dr. Mahamudu Bawumia & Ministry of Education",
    "speakerRole": "Vice President of the Republic of Ghana",
    "speakerParty": "NPP",
    "venueContext": "Sunyani Coronation Park (National Trainee Allowance Restoration Ceremony)",
    "electionContext": "Campaign commitment made to trainee nurses and teachers after the NDC government cancelled all allowances under IMF dictates.",
    "statutoryOutcome": "Restored monthly allowance payouts to over 100,000 teacher and nursing trainees across 46 public Colleges of Education and nursing training institutions nationwide, funded from the consolidated budget.",
    "discrepancyDelta": "NDC Abolished in 2015 under IMF \u2794 NPP Fully Restored and Maintained from Sept 2017",
    "citizenHardshipImpact": "Restored monthly living stipends for over 100,000 students, allowing poor rural youth to pursue nursing and teaching degrees.",
    "officialDocket": "Ministry of Finance National Budget Statements & Ministry of Health Expenditure Reports",
    "evidencePoints": [
      "Direct monthly allowances disbursed via SLTF (Students Loan Trust Fund) and consolidated fund.",
      "Relieved financial burden for thousands of rural families and boosted teacher trainee enrollment.",
      "Maintained continuously since September 2017."
    ],
    "mediaOutlets": [
      "Ministry of Finance",
      "Joy News",
      "Citi FM",
      "Peace FM"
    ],
    "x": 940,
    "y": 1355
  }
];

export const NKONTONPO_EDGES: NkontonpoEdge[] = [
  {
    "id": "e-mahama-shortmemory",
    "source": "p-mahama",
    "target": "prom-shortmemory",
    "relationship": "DECLARED_DOCTRINE",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e-shortmemory-real",
    "source": "prom-shortmemory",
    "target": "real-shortmemory",
    "relationship": "RESULTED_IN_DEFICIT_BLOWOUT",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e1",
    "source": "p-mahama",
    "target": "prom-dumsor",
    "relationship": "PROMISED_TO_GET_POWER",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e2",
    "source": "p-mahama",
    "target": "prom-eblocks",
    "relationship": "PROMISED_IN_MANIFESTO",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e3",
    "source": "p-mahama",
    "target": "prom-deadgoat",
    "relationship": "DECLARED_DEAD_GOAT",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e11",
    "source": "prom-dumsor",
    "target": "real-dumsor",
    "relationship": "FAILED_FOR_4_YEARS",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e12",
    "source": "prom-eblocks",
    "target": "real-eblocks",
    "relationship": "DELIVERED_ONLY_29_OF_200",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e15",
    "source": "prom-deadgoat",
    "target": "real-deadgoat",
    "relationship": "HEALTHCARE_PARALYSIS",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e201",
    "source": "p-current",
    "target": "prom-freeshs-repeal",
    "relationship": "PROPOSES_FREE_SHS_REPEAL",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e202",
    "source": "p-current",
    "target": "prom-galamsey",
    "relationship": "PROMISES_GALAMSEY_PARDONS",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e211",
    "source": "prom-freeshs-repeal",
    "target": "real-freeshs-repeal",
    "relationship": "THREATENS_5_7M_STUDENTS",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e212",
    "source": "prom-galamsey",
    "target": "real-galamsey",
    "relationship": "POLLUTES_DRINKING_WATER",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e21",
    "source": "p-terkper",
    "target": "prom-imf",
    "relationship": "PROMISED_NO_BAILOUT",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e22",
    "source": "prom-imf",
    "target": "real-imf",
    "relationship": "SIGNED_IMF_FREEZE",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e31",
    "source": "p-housing",
    "target": "prom-saglemi",
    "relationship": "CONTRACTED_5000_HOMES",
    "type": "DECEPTION_LINK"
  },
  {
    "id": "e32",
    "source": "prom-saglemi",
    "target": "real-saglemi",
    "relationship": "DELIVERED_668_EMPTY_SHELLS",
    "type": "FAILURE_LINK"
  },
  {
    "id": "e91",
    "source": "p-bawumia",
    "target": "deliv-freeshs",
    "relationship": "DELIVERED_UNIVERSAL_FREE_SHS",
    "type": "RESOLUTION_LINK"
  },
  {
    "id": "e92",
    "source": "p-bawumia",
    "target": "deliv-allowance",
    "relationship": "RESTORED_TRAINEE_ALLOWANCES",
    "type": "RESOLUTION_LINK"
  },
  {
    "id": "e93",
    "source": "real-imf",
    "target": "deliv-allowance",
    "relationship": "REVERSAL_OF_NDC_2015_SCRAP",
    "type": "RESOLUTION_LINK"
  },
  {
    "id": "e94",
    "source": "prom-eblocks",
    "target": "deliv-freeshs",
    "relationship": "NPP_BUILT_CLASSROOMS_AND_FREE_SHS",
    "type": "RESOLUTION_LINK"
  }
];
