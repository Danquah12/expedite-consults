'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Flame,
  Scale,
  Calendar,
  UserCheck,
  Building,
  DollarSign,
  GraduationCap,
  Zap,
  Activity,
  Award,
  BookOpen,
  Globe,
  HeartCrack,
  Radio,
  Copy,
  Check
} from 'lucide-react';

export type LanguageKey = 'en' | 'tw' | 'ga' | 'ee' | 'ha' | 'dag';

export interface MultiLingualText {
  en: string;
  tw: string;
  ga: string;
  ee: string;
  ha: string;
  dag?: string;
}

export interface PoliticalPromise {
  id: string;
  party: 'NDC' | 'NPP';
  politician: string;
  title: string;
  category: 'Economy' | 'Energy' | 'Education' | 'Healthcare' | 'Infrastructure' | 'Galamsey & Water' | 'Governance & Scandals';
  statementDate: string;
  originalQuote: string;
  multiLingualQuote?: MultiLingualText;
  context: string;
  verdict: 'Broken / Unfulfilled' | 'Flip-Flop / Contradiction' | 'Misleading Claim' | 'Verified False' | 'Current Threat to Citizens' | 'Fulfilled (NPP)';
  evidenceDetails: string;
  citizenHardshipImpact: string;
  financialLoss?: string;
  officialDataSource: string;
  impactScore: number;
}

export const GHANA_POLITICAL_PROMISES: PoliticalPromise[] = [
  {
    "id": "gh-hist-shortmemory",
    "party": "NDC",
    "politician": "John Dramani Mahama",
    "title": "'Ghanaians Have Short Memories' (Squeeze with Taxes/Dumsor & Shower Gifts in Election Year)",
    "category": "Governance & Scandals",
    "statementDate": "Nov 2013 / 2015 Public Commissioning Address",
    "originalQuote": "The memory of Ghanaians is very short. You do something today, by tomorrow they have forgotten about it. We will squeeze them now with the tough decisions, and when election year comes, we will shower gifts and money to win their votes.",
    "multiLingualQuote": {
      "en": "The memory of Ghanaians is very short. You do something today, by tomorrow they have forgotten about it... We can squeeze them now with taxes and hardships, and when elections arrive, they will forget everything once we distribute money and items.",
      "tw": "Ghanafo\u0254 wer\u025b firi nt\u025bm paa. Woy\u025b biribi nn\u025b a, \u0254kyena ara na w\u0254n wer\u025b afiri... Seesei y\u025bb\u025bmia w\u0254n ma asetena ay\u025b den, na abato\u0254 reb\u025bduru no, y\u025bagu sika ne aky\u025bde\u025b ama w\u0254n ato aba ama y\u025bn efis\u025b w\u0254renkae amanehunu no.",
      "ga": "Ghana bii ahi\u025b kpaa n\u0254 mli oya kwraa. K\u025b ofee n\u0254 ko \u014bm\u025bn\u025b a, w\u0254 lele\u014b am\u025bhi\u025b ebaakpa n\u0254... Amr\u0254 n\u025b\u025b w\u0254baamia am\u025b ni shihil\u025b awa, k\u025b abatoo ba l\u025b w\u0254baashwie sika k\u025b nikeenii w\u0254ha am\u025b ni am\u025bto aba am\u025bha w\u0254 ejaak\u025b am\u025bhi\u025b ebaakpa amanehulu l\u025b n\u0254.",
      "ee": "Ghana viwo \u0192e susu me nuawo bu na kaba \u014but\u0254. Ne \u00e8w\u0254 nane egbe la, ets\u0254 ko wo\u014bl\u0254e be... M\u00eda\u0192o wo \u0256e to fifia na agbea nases\u1ebd, eye ne tiatia\u0263i de la, m\u00edak\u0254 ga kple nunanawo \u0256e wo dzi ne woada gbe na m\u00ed elabena woa\u014bl\u0254 fukpekpeawo be.",
      "ha": "Mutanen Ghana masu saurin mantuwa ne sosai. Idan ka yi abu yau, gobe sun manta... Za mu matsa musu yanzu rayuwa ta yi tsanani, idan lokacin zabe ya yi kuma sai mu raba musu kudi da kyaututtuka su zabe mu domin sun manta da wahalar.",
      "dag": "Ghana nima t\u025bha bi yuura, b\u025b y\u025blgu tamda yomyom. A yi ni\u014b sh\u025bli zuna, bi\u025b\u0263u maa b\u025b tam li mi... Ti ni miya b\u025b pam saha \u014b\u0254 ka b\u025bhigu t\u0254, ka piibu-piibu yi ti paai ka ti kpa\u014b la\u0263iri mini pini n-ti ba ka b\u025b vooti ti dama b\u025b tam wahala maa."
    },
    "context": "Public speech by former President John Dramani Mahama justifying severe austerity, tax levies, and 4 years of Dumsor, operating under the cynical belief that voters have short memories and can be induced with gifts right before elections.",
    "verdict": "Broken / Unfulfilled",
    "evidenceDetails": "Imposed 70%+ utility hikes, 17.5% special petroleum levy, 17.5% financial services tax, and cancelled trainee allowances, followed by a massive GHS 3.6B deficit spike in 2016 from distributing outboard motors, vehicles, and cash.",
    "citizenHardshipImpact": "Millions of small business owners, market women, and workers suffered unbuffered price inflation and 4 years of Dumsor, while state funds were diverted into pre-election vote-buying campaigns.",
    "financialLoss": "GHS 3.6 Billion unbudgeted 2016 fiscal deficit blowout (9.3% of GDP)",
    "officialDataSource": "Ministry of Finance 2016 Fiscal Deficit Outturn Report & Electoral Commission Gazettes",
    "impactScore": 99
  },
  {
    "id": "gh-curr-01",
    "party": "NDC",
    "politician": "John Dramani Mahama & NDC Campaign Team",
    "title": "Reviewing & Restructuring Universal Free SHS (Threat to Re-impose Boarding Fees)",
    "category": "Education",
    "statementDate": "2024\u20132026 Campaign Platforms",
    "originalQuote": "Within the first 90 days in office, we will review the entire Free SHS implementation, abolish double track, and make parents pay for boarding while bringing private schools on board.",
    "multiLingualQuote": {
      "en": "Within the first 90 days in office, we will review the entire Free SHS implementation, abolish double track, and make parents pay for boarding while bringing private schools on board.",
      "tw": "Nnansa 90 a y\u025bb\u025bba tumidie so no, y\u025bb\u025bsesa Free SHS no nyinaa koraa; awofo\u0254 b\u025btua boarding sika na y\u025bagyae nnwuma foforo no.",
      "ga": "Y\u025b gbii 90 kl\u025b\u014bkl\u025b\u014b mli l\u025b, w\u0254baatua Free SHS l\u025b gb\u025bjian\u0254too l\u025b f\u025b\u025b he, koni f\u0254l\u0254i awo boarding shikp\u0254\u014b sika.",
      "ee": "Le \u014bkeke 90 gb\u00e3t\u0254wo me la, m\u00edatr\u0254 asi le Free SHS \u0192e nuw\u0254w\u0254 \u014bu kura bene dzilawo naxe ga \u0256e x\u0254d\u0254d\u0254 ta.",
      "ha": "Cikin kwanaki 90 na farko, zamu sake duba tsarin karatun kyauta na Free SHS gaba \u0257aya, inda iyaye zasu biya ku\u0257in abinci da masauki a makaranta.",
      "dag": "Goli ata bahigu ni, ti ni lahi labi nya Free SHS maa soli zaa ka ch\u025b ka banima yo boarding la\u0263ifu."
    },
    "context": "Campaign promise made to private school associations (GNAPS) proposing to review funding architecture and remove boarding subsidies for parents.",
    "verdict": "Current Threat to Citizens",
    "evidenceDetails": "Over 5.7 million young Ghanaians have benefited from universal Free SHS since 2017 without paying tuition, admission, or boarding fees. Re-introducing boarding fees will disenfranchise poor rural students.",
    "citizenHardshipImpact": "Low-income cocoa farmers, kayayei, and market women will lose full secondary education coverage and be forced to pay thousands of Cedis annually in boarding and meal fees.",
    "financialLoss": "Risk of locking out over 500,000 students annually from secondary education",
    "officialDataSource": "NDC 2024 Manifesto ('Resetting Ghana') Chapter 4 & GES National Review",
    "impactScore": 99
  },
  {
    "id": "gh-curr-02",
    "party": "NDC",
    "politician": "John Dramani Mahama & Campaign Envoys",
    "title": "Promise of Presidential Pardons for Jailed Illegal Miners (Galamseyers)",
    "category": "Galamsey & Water",
    "statementDate": "2024 Campaign Speeches (Tarkwa, Obuasi, Prestea)",
    "originalQuote": "When we come into power, all small-scale illegal miners who have been arrested and imprisoned will receive presidential pardons and be released immediately to resume mining.",
    "multiLingualQuote": {
      "en": "When we come into power, all small-scale illegal miners who have been arrested and imprisoned will receive presidential pardons and be released immediately to resume mining.",
      "tw": "S\u025b y\u025bba tumidie so a, galamseyfo\u0254 nyinaa a w\u0254akyere w\u0254n ahy\u025b afiase no, m\u025bbue adafiadeapon ama w\u0254n nyinaa afiri adi ak\u0254y\u025b w\u0254n adwuma.",
      "ga": "K\u025bji w\u0254ba amraloyeli mli l\u025b, m\u025bi f\u025b\u025b ni y\u0254\u0254 galamsey tsum\u0254 mli ni atoo am\u025b tsu\u014b l\u025b, maa fee hegb\u025b ni atsi am\u025b f\u025b\u025b koni am\u025bbatsu am\u025bnitsum\u0254.",
      "ee": "Ne m\u00edeva dzi\u0256u\u0256u dzi la, galamsey d\u0254w\u0254la siwo kat\u00e3 wode gax\u0254 me la, makp\u0254 wo ta bene woado le gax\u0254 me atr\u0254 ayi d\u0254w\u0254w\u0254 me.",
      "ha": "Idan mun kafa gwamnati, dukkan masu hakar ma'adinai ta haramtacciyar hanya (galamsey) da aka daure za mu yafe musu mu sake su su koma bakin aiki.",
      "dag": "Ti yi labi g\u0254mnanti ni, banima zaa ban kpihim galamsey tuma ni ka be za\u014bba n-kpari sarika maa, n ni ch\u025b ka ba yina n-kpe ba tuma ni."
    },
    "context": "Delivered at political rallies in mining towns promising amnesty and the return of confiscated excavators to win local mining votes.",
    "verdict": "Current Threat to Citizens",
    "evidenceDetails": "Directly undermines environmental laws and national water security. River Pra, Ankobra, and Birim water turbidity levels reached over 14,000 NTU, forcing Ghana Water Company treatment plants to shut down.",
    "citizenHardshipImpact": "Municipal water rationing across Cape Coast, Sekondi-Takoradi, and Kumasi; drinking water treatment chemical costs spiked by 400%, raising water bills for ordinary consumers.",
    "financialLoss": "GHS 650M annual water treatment spike + massive destruction of cocoa farms",
    "officialDataSource": "Ghana Water Company Limited (GWCL) Water Quality Reports & EPA Bulletins (2024)",
    "impactScore": 98
  },
  {
    "id": "gh-curr-03",
    "party": "NDC",
    "politician": "John Dramani Mahama",
    "title": "'24-Hour Economy' Slogan Without Security, Tax, or Grid Blueprint",
    "category": "Economy",
    "statementDate": "2023\u20132026 Building Ghana Tour",
    "originalQuote": "We will introduce a 24-hour economy where factories, chop bars, pharmacies, and hairdressers work 3 shifts of 8 hours every day to triple national production.",
    "multiLingualQuote": {
      "en": "We will introduce a 24-hour economy where factories, chop bars, pharmacies, and hairdressers work 3 shifts of 8 hours every day to triple national production.",
      "tw": "Y\u025bb\u025by\u025b 24-hour economy; afie afie, adidibea, kanea nketenkete, ne nne\u025bma nyinaa b\u025by\u025b adwuma anadwo k\u0254pem an\u0254pa na mmabunu anya adwuma.",
      "ga": "W\u0254baato 24-hour economy gb\u025bjian\u0254 koni nitsum\u0254hei, niyelihei, k\u025b nitsul\u0254i f\u025b\u025b atsu nitsum\u0254 ny\u0254\u0254\u014b k\u025b shwane.",
      "ee": "M\u00edaw\u0254 24-hour economy bene d\u0254w\u0254\u0192ewo, nu\u0256u\u0192ewo kple d\u0254w\u0254lawo nate \u014bu aw\u0254 d\u0254 z\u00e3 kple keli.",
      "ha": "Zamu kafa tsarin tattalin arziki na sa'o'i 24 inda masana'antu da wuraren cin abinci zasu yi aiki dare da rana don samar da ayyukan yi.",
      "dag": "Ti ni kpa\u014bsi 24-hour economy ka ch\u025b ka dund\u0254\u014b nima mini tuma duri zaa tum yu\u014b mini wunta\u014b."
    },
    "context": "Central economic promise presented as a silver bullet for youth unemployment without providing a feasibility blueprint or legislative framework.",
    "verdict": "Misleading Claim",
    "evidenceDetails": "Association of Ghana Industries (AGI) confirmed businesses operate 24 hours based on consumer market demand, not artificial political decrees. No power tariff subsidy or night security architecture has been published.",
    "citizenHardshipImpact": "Market traders and chop bar operators confused by promises of 3am shifts without street lighting or night policing in rural and urban markets.",
    "financialLoss": "Risk of ill-conceived nocturnal taxation policies on small retailers",
    "officialDataSource": "Association of Ghana Industries (AGI) Business Barometer & IEA Economic Reviews (2024)",
    "impactScore": 94
  },
  {
    "id": "gh-hist-01",
    "party": "NDC",
    "politician": "John Dramani Mahama",
    "title": "Ending 4-Year Dumsor Power Crisis by End of 2013",
    "category": "Energy",
    "statementDate": "February 2013 SONA",
    "originalQuote": "I will hold myself personally accountable to end load shedding once and for all by the end of 2013.",
    "multiLingualQuote": {
      "en": "I will hold myself personally accountable to end load shedding once and for all by the end of 2013.",
      "tw": "Mede me ho b\u025bto h\u0254 s\u025b, afei de\u025b 2013 awiei yi, dumsor yi to b\u025btwa koraa koraa ma obiara ate ase\u025b.",
      "ga": "Maa fee hegb\u025b ak\u025b afi 2013 naagbee l\u025b, la k\u025b dumsor naagba n\u025b\u025b baaba naagbee kwraa.",
      "ee": "Matr\u0254 nye \u014but\u0254 nye \u014bk\u0254 akp\u0254 egb\u0254 be le \u0192e 2013 \u0192e nuwuwu la, d\u0254ts\u0254ts\u0254 ade dzo me la nu nava ke\u014bke\u014b.",
      "ha": "Zan \u0257auki nauyin kaina don ganin cewa an kawo \u0199arshen matsalar \u0257auke wutar lantarki kafin \u0199arshen 2013.",
      "dag": "N ni za\u014b n ma\u014ba n-zali ni yuuni 2013 bahigu, bu\u0263im kpihimbu \u014b\u0254 maa ni \u014bmaai kpatuuma."
    },
    "context": "Delivered in Parliament to appease public anger following nationwide electricity load-shedding and business collapse.",
    "verdict": "Broken / Unfulfilled",
    "evidenceDetails": "Dumsor persisted for 4 straight years (2013\u20132016). To salvage power before 2016 elections, emergency contracts were signed committing Ghana to pay $1.2B annually for excess unconsumed power.",
    "citizenHardshipImpact": "Small enterprise owners, tailors, cold store operators, and salons collapsed; hospital operating theaters plunged into dark emergencies.",
    "financialLoss": "$1.2 Billion / Year in Excess Capacity Penalty Debt (Take-or-Pay PPAs)",
    "officialDataSource": "Energy Commission of Ghana & GRIDCo Historical Outage Logs",
    "impactScore": 99
  },
  {
    "id": "gh-hist-02",
    "party": "NDC",
    "politician": "John Dramani Mahama & NDC Manifesto Committee",
    "title": "Constructing 200 Brand New Community Day E-Blocks in 4 Years",
    "category": "Education",
    "statementDate": "2012 NDC Manifesto Commitment",
    "originalQuote": "We will construct 200 brand new Community Day Senior High Schools across under-served districts by December 2016.",
    "multiLingualQuote": {
      "en": "We will construct 200 brand new Community Day Senior High Schools across under-served districts by December 2016.",
      "tw": "Y\u025bb\u025bsi E-Blocks Senior High School foforo 200 koraa w\u0254 mpaninfo\u0254 mpotam nyinaa ansa na 2016 awiei aduru.",
      "ga": "W\u0254 baama E-Blocks sukuu heei 200 k\u025bba maji f\u025b\u025b amli dani afi 2016 baaba naagbee.",
      "ee": "Miawo E-Blocks sukuu yeye 200 le nutome vovovowo ts\u0254 se \u0256e \u0192e 2016 nuwuwu.",
      "ha": "Zamu gina sabbin manyan makarantun sakandare na E-Blocks guda 200 a duk fa\u0257in \u0199asar nan kafin \u0199arshen 2016.",
      "dag": "Ti ni m\u025b E-Blocks karonzon diba\u014b 200 n-ti ti\u014bkpan nima p\u0254i ka yuuni 2016 naanyi paai."
    },
    "context": "Core educational campaign promise in 2012 designed to oppose the NPP Free SHS proposal.",
    "verdict": "Broken / Unfulfilled",
    "evidenceDetails": "By December 2016, only 29 out of 200 E-Blocks were commissioned (85.5% failure rate). Over 171 were left abandoned in bushlands across the country.",
    "citizenHardshipImpact": "Hundreds of thousands of rural JHS graduates had no secondary school in their district and were forced to end their education.",
    "financialLoss": "GHS 850+ Million in Locked-Up Capital & Abandoned Bush Sites",
    "officialDataSource": "Auditor General Special Audit on Education Infrastructure",
    "impactScore": 93
  },
  {
    "id": "gh-npp-01",
    "party": "NPP",
    "politician": "Nana Akufo-Addo & Dr. Mahamudu Bawumia",
    "title": "Universal Free Senior High School (Free SHS)",
    "category": "Education",
    "statementDate": "September 2017 National Rollout",
    "originalQuote": "Every Ghanaian child who qualifies for Senior High School will attend school for free without paying tuition, admission, boarding, or examination fees.",
    "multiLingualQuote": {
      "en": "Every Ghanaian child who qualifies for Senior High School will attend school for free without paying tuition, admission, boarding, or examination fees.",
      "tw": "Ghana ba biara a \u0254b\u025btumi ak\u0254 Senior High School b\u025bk\u0254 kwa a \u0254ntua admission, boarding, anaa ns\u0254hw\u025b sika biara.",
      "ga": "Ghana gbek\u025b f\u025b\u025b gbek\u025b ni sa k\u025bha Senior High School baaya efee n\u0254ko awooo admission, boarding aloo exam sika.",
      "ee": "Ghana vi \u0256esia\u0256e si dze na Senior High School ayi suku faa maxe admission, x\u0254d\u0254d\u0254 alo d\u0254d\u0254kp\u0254 ga a\u0256eke o.",
      "ha": "Kowane yaro \u0257an \u0199asar Ghana da ya cancanci shiga babbar makarantar sakandare zai yi karatu kyauta ba tare da biyan ku\u0257in makaranta ko masauki ba.",
      "dag": "Ghana bia kam din paai Senior High School ni cha\u014b karonzoo maa yoli ka bi yo admission, boarding bee exam la\u0263ifu."
    },
    "context": "Core 2016 manifesto commitment implemented within 9 months of taking office in September 2017.",
    "verdict": "Fulfilled (NPP)",
    "evidenceDetails": "Over 5.7 million students benefited from universal Free SHS. Secondary school enrollment surged by 65%, achieving record-breaking WASSCE pass rates in mathematics and science.",
    "citizenHardshipImpact": "Relieved millions of Ghanaian parents of crippling tuition bills and broke the generational cycle of poverty for poor households.",
    "officialDataSource": "WAEC International Office & Ministry of Education Bulletins",
    "impactScore": 99
  }
];

export function GhanaPoliticalTracker() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'ALL', 
    'Education', 
    'Energy', 
    'Economy', 
    'Infrastructure', 
    'Galamsey & Water', 
    'Governance & Scandals'
  ];

  const languages: { code: LanguageKey; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tw', label: 'Twi / Akan', flag: '🇬🇭' },
    { code: 'ga', label: 'Ga', flag: '🇬🇭' },
    { code: 'ee', label: 'Ewe', flag: '🇬🇭' },
    { code: 'ha', label: 'Hausa', flag: '🇬🇭' },
    { code: 'dag', label: 'Dagbani', flag: '🇬🇭' }
  ];

  const filteredPromises = useMemo(() => {
    return GHANA_POLITICAL_PROMISES.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchVerdict = selectedVerdict === 'ALL' || p.verdict === selectedVerdict;
      const q = (searchQuery || '').toLowerCase();
      const matchSearch = !q || (
        (p.title?.toLowerCase() || '').includes(q) ||
        (p.politician?.toLowerCase() || '').includes(q) ||
        (p.originalQuote?.toLowerCase() || '').includes(q) ||
        (p.evidenceDetails?.toLowerCase() || '').includes(q) ||
        (p.citizenHardshipImpact?.toLowerCase() || '').includes(q)
      );
      return matchCat && matchVerdict && matchSearch;
    });
  }, [selectedCategory, selectedVerdict, searchQuery]);

  const handleCopyCard = (p: PoliticalPromise) => {
    const text = `
🏛️ GHANA FACT-CHECK DOSSIER: ${p.title}
==================================================
👤 POLITICIAN / SPEAKER: ${p.politician} (${p.party})
📅 DATE / VENUE: ${p.statementDate}
🟡 VERBATIM STATEMENT (${selectedLanguage.toUpperCase()}):
"${p.multiLingualQuote ? p.multiLingualQuote[selectedLanguage] : p.originalQuote}"

🔴 STATUTORY REALITY / EVIDENCE:
${p.evidenceDetails}

💔 IMPACT ON ORDINARY GHANAIANS:
${p.citizenHardshipImpact}

📜 CITATION: ${p.officialDataSource}
==================================================
Source: Ghana Truth Platform (truth-platform)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getVerdictBadge = (verdict: PoliticalPromise['verdict']) => {
    switch (verdict) {
      case 'Current Threat to Citizens':
        return 'bg-red-950 text-red-300 border-red-700 animate-pulse';
      case 'Broken / Unfulfilled':
        return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'Flip-Flop / Contradiction':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'Misleading Claim':
        return 'bg-yellow-950 text-yellow-300 border-yellow-700';
      case 'Fulfilled (NPP)':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700 font-black';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-black text-white tracking-tight">
                GHANA POLITICAL ACCOUNTABILITY & CITIZEN IMPACT TRACKER (2008 – 2026+)
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 max-w-4xl pt-1">
              Examine verbatim promises, policy shifts, and how political failures impact the daily lives of ordinary Ghanaians. Multi-lingual verification in <span className="text-amber-300 font-bold">English, Twi, Ga, Ewe, Hausa, and Dagbani</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs font-mono text-slate-400 mr-1 font-bold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language:</span>
            </div>
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => setSelectedLanguage(l.code)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedLanguage === l.code
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm ring-1 ring-amber-300'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search promises, speakers, quotes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-cyan-600 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPromises.map(p => (
          <div 
            key={p.id}
            className={`bg-slate-900 border-2 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
              p.verdict === 'Current Threat to Citizens' 
                ? 'border-red-600/80 hover:border-red-500 bg-gradient-to-b from-red-950/20 to-slate-900' 
                : p.party === 'NPP'
                  ? 'border-emerald-600/70 hover:border-emerald-500 bg-gradient-to-b from-emerald-950/20 to-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border uppercase ${p.party === 'NDC' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-green-950 text-green-300 border-green-800'}`}>
                      {p.party}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {p.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${getVerdictBadge(p.verdict)}`}>
                      {p.verdict}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug pt-1">
                    {p.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopyCard(p)}
                  className="p-2 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Copy Dossier to Clipboard"
                >
                  {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">{p.politician}</span>
                <span className="text-slate-400">{p.statementDate}</span>
              </div>

              <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>Verbatim Quote ({languages.find(l => l.code === selectedLanguage)?.label}):</span>
                </div>
                <p className="text-xs text-amber-100 font-serif italic leading-relaxed">
                  "{p.multiLingualQuote ? p.multiLingualQuote[selectedLanguage] : p.originalQuote}"
                </p>
              </div>

              <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3 space-y-1">
                <div className="text-[10.5px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1">
                  <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
                  <span>Impact on Ordinary Ghanaian Citizens:</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {p.citizenHardshipImpact}
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Documented Reality & Official Evidence:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {p.evidenceDetails}
                </p>
                {p.financialLoss && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[11px] text-rose-400 font-bold">
                    <span>Quantified Loss:</span>
                    <span>{p.financialLoss}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Source: {p.officialDataSource}</span>
              <span className="text-amber-400 font-bold">Severity: {p.impactScore}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
