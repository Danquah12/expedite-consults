"use client";

import { useState, useMemo } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  Compass,
  Globe,
  Shield,
  Radio,
  Server,
  Layers,
  Crosshair,
  Cpu,
  Search,
  Lock,
  Flame,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Sliders,
  Award,
  Users,
  Target,
  FileCode,
  Share2,
  ExternalLink,
  ShieldAlert,
  Fingerprint,
  Zap,
  Info,
  Calendar,
  Clock,
  Building
} from "lucide-react";

interface ThreatActorDossier {
  id: string;
  name: string;
  aliases: string[];
  sponsor: string;
  country: string;
  countryCode: string;
  flag: string;
  motive: string;
  firstSeen: string;
  activeStatus: "ACTIVE" | "ELEVATED" | "DORMANT";
  confidenceScore: number;
  targetedSectors: string[];
  targetedGeos: string[];
  signatureTooling: string[];
  associatedSamples: string[];
  radarScores: {
    codeReuse: number;
    infraOverlap: number;
    geoAlignment: number;
    operationalTempo: number;
    victimologyMatch: number;
    artifactClustering: number;
  };
  compilerFingerprint: {
    pdbPath: string;
    richHeaderHash: string;
    compilerVersion: string;
    codePage: string;
    language: string;
  };
  sslJa3Fingerprint: {
    ja3Hash: string;
    certSerial: string;
    issuerOrg: string;
    commonPorts: string[];
  };
  tlshDistance: number;
  operationalHours: string;
  historicalCampaigns: Array<{
    name: string;
    year: string;
    impact: string;
    cveList: string[];
  }>;
  diamondModel: {
    adversary: string;
    capability: string;
    infrastructure: string;
    victim: string;
    socioPolitical: string;
    technicalAxis: string;
  };
}

const APT_DOSSIERS: ThreatActorDossier[] = [
  {
    id: "APT-LAZARUS",
    name: "Lazarus Group (APT38 / HIDDEN COBRA)",
    aliases: ["Zinc", "Diamond Sleet", "Stardust Chollima", "Bureau 121 / Lab 110"],
    sponsor: "Reconnaissance General Bureau (RGB)",
    country: "North Korea",
    countryCode: "KP",
    flag: "🇰🇵",
    motive: "Nation-State Revenue Generation, Sanctions Evasion & Cyber-Espionage",
    firstSeen: "2009",
    activeStatus: "ACTIVE",
    confidenceScore: 98,
    targetedSectors: ["Financial Institutions", "Cryptocurrency Exchanges", "Defense Contractors", "Critical Infrastructure"],
    targetedGeos: ["United States", "South Korea", "Japan", "United Kingdom", "Global Financial Nodes"],
    signatureTooling: ["WannaCry", "Brambul", "Joanap", "Fallchill", "Manuscrypt", "AppleJeus", "FASTCash"],
    associatedSamples: ["SAMPLE-001"],
    radarScores: {
      codeReuse: 96,
      infraOverlap: 92,
      geoAlignment: 98,
      operationalTempo: 89,
      victimologyMatch: 95,
      artifactClustering: 97
    },
    compilerFingerprint: {
      pdbPath: "D:\\Dev\\Lazarus_Project\\WannaCry\\Release\\tasksche.pdb",
      richHeaderHash: "0x5A8E192B41C90812 (VS2010 v10.0.30319)",
      compilerVersion: "Microsoft Visual C/C++ 10.0 (Linker 10.00.40219)",
      codePage: "0x0412 (Korean - Hangul)",
      language: "Korean (ko-KR) / US English Fallback"
    },
    sslJa3Fingerprint: {
      ja3Hash: "a0e9f5d64349fb13191bc781f81f42e1",
      certSerial: "7d:89:12:ef:aa:22:90:11:43:08",
      issuerOrg: "Let's Encrypt / Dynamic Staging C2",
      commonPorts: ["TCP 445 (SMB)", "TCP 443 (HTTPS)", "TCP 9001 (Tor)"]
    },
    tlshDistance: 18, // Very close similarity to known Lazarus codebases
    operationalHours: "UTC+8:30 / UTC+9 (Pyongyang Standard Time - 08:00 to 18:00)",
    historicalCampaigns: [
      { name: "WannaCry 2.0 Global Outbreak", year: "2017", impact: "$4 Billion global disruption across NHS and 150 countries", cveList: ["CVE-2017-0144 (EternalBlue)"] },
      { name: "Sony Pictures Destructive Hack", year: "2014", impact: "Wiper detonation, corporate extortion, and leak of unreleased media", cveList: ["Brambul SMB Worm"] },
      { name: "Bangladesh Bank SWIFT Heist", year: "2016", impact: "$81 Million stolen via fraudulent SWIFT financial messaging", cveList: ["Custom SWIFT Alliance Injector"] },
      { name: "Ronin / Axie Infinity Crypto Drain", year: "2022", impact: "$620 Million cryptocurrency stolen via compromised validator nodes", cveList: ["AppleJeus macOS Backdoor"] }
    ],
    diamondModel: {
      adversary: "RGB 121 Special Ops Bureau (Sub-units Andariel & Bluenoroff)",
      capability: "Multi-threaded AES-128 / RSA-2048 Cryptors, EternalBlue SMB Worm, SWIFT Injectors",
      infrastructure: "Dead-drop resolver domains, Bulletproof hosting in SE Asia & Russia, Tor hidden relays",
      victim: "Global enterprise Windows fleets, Hospital networks, SWIFT endpoints, DeFi bridges",
      socioPolitical: "Funding ballistic missile procurement and state budget amidst international sanctions",
      technicalAxis: "Kernel-level exploit delivery (DoublePulsar) coupled with custom password-protected ZIP packers"
    }
  },
  {
    id: "APT-SANDWORM",
    name: "Sandworm / Fancy Bear (APT28 / Unit 74455)",
    aliases: ["Seashell Blizzard", "Iridium", "Voodoo Bear", "GRU Main Intelligence Directorate"],
    sponsor: "Russian General Staff Main Intelligence Directorate (GRU)",
    country: "Russian Federation",
    countryCode: "RU",
    flag: "🇷🇺",
    motive: "Destructive Cyber-Warfare, Critical Infrastructure Sabotage & Geopolitical Coercion",
    firstSeen: "2007",
    activeStatus: "ACTIVE",
    confidenceScore: 96,
    targetedSectors: ["Power Grids / SCADA", "Government Ministries", "Defense & NATO Entities", "Telecommunications", "Media Outlets"],
    targetedGeos: ["Ukraine", "Georgia", "United States", "European Union", "NATO Member States"],
    signatureTooling: ["NotPetya", "BlackEnergy 3", "Industroyer / CrashOverride", "HermeticWiper", "CaddyWiper", "Industroyer2"],
    associatedSamples: ["SAMPLE-001"],
    radarScores: {
      codeReuse: 94,
      infraOverlap: 90,
      geoAlignment: 97,
      operationalTempo: 98,
      victimologyMatch: 96,
      artifactClustering: 93
    },
    compilerFingerprint: {
      pdbPath: "C:\\Users\\builder\\Desktop\\sandworm\\industroyer2\\src\\Release\\wiper.pdb",
      richHeaderHash: "0x89AC2210FE129988 (MSVC 2017)",
      compilerVersion: "Microsoft Visual C/C++ 14.16",
      codePage: "0x0419 (Russian - Cyrillic)",
      language: "Russian (ru-RU)"
    },
    sslJa3Fingerprint: {
      ja3Hash: "e7d705a3286e19ea42f587b344ee6865",
      certSerial: "31:41:59:26:53:58:97:93:23:84",
      issuerOrg: "Self-Signed Military CA (Moscow / Rostelecom)",
      commonPorts: ["TCP 443", "TCP 102 (IEC 60870-5-104 SCADA)", "TCP 502 (Modbus)"]
    },
    tlshDistance: 24,
    operationalHours: "UTC+3 (Moscow Time - 08:30 to 19:00 Mon-Fri)",
    historicalCampaigns: [
      { name: "BlackEnergy Ukrainian Power Outage", year: "2015", impact: "First known cyberattack to successfully bring down an electrical power grid", cveList: ["CVE-2014-4114 (Sandworm OLE)"] },
      { name: "NotPetya Supply Chain Catastrophe", year: "2017", impact: "$10 Billion total damages across global logistics (Maersk, FedEx TNT)", cveList: ["M.E.Doc Supply Chain + EternalBlue"] },
      { name: "HermeticWiper & FoxBlade Conflict Waves", year: "2022", impact: "Widespread wiper deployment across Ukrainian government domains", cveList: ["Active Directory GPO Abuse"] }
    ],
    diamondModel: {
      adversary: "GRU 74455 / 26165 Cyber Operations Officers",
      capability: "ICS/SCADA protocol wipers, pseudo-ransomware wiper engines, Master Boot Record overwrite",
      infrastructure: "Compromised MikroTik routers, compromised supply chain updates, fast-rotation C2 VPS",
      victim: "Regional power distribution substations, national ministries, global supply chain logistics",
      socioPolitical: "Hybrid warfare doctrine supporting kinetic military campaigns and strategic power projection",
      technicalAxis: "Low-level partition table destruction (VSS wipe, MBR zeroing) disguised as financial lockers"
    }
  },
  {
    id: "APT-COZYBEAR",
    name: "Cozy Bear (APT29 / Nobelium / SVR)",
    aliases: ["Midnight Blizzard", "Cloaked Ursa", "The Dukes", "Foreign Intelligence Service"],
    sponsor: "Russian Foreign Intelligence Service (SVR)",
    country: "Russian Federation",
    countryCode: "RU",
    flag: "🇷🇺",
    motive: "Strategic Intelligence Gathering, Diplomatic Espionage & Cloud Tenant Infiltration",
    firstSeen: "2008",
    activeStatus: "ACTIVE",
    confidenceScore: 97,
    targetedSectors: ["Foreign Ministries", "Embassies & Consulates", "Think Tanks & NGOs", "IT Supply Chain Providers"],
    targetedGeos: ["United States", "United Kingdom", "NATO Allies", "Middle East", "Central Asia"],
    signatureTooling: ["SUNBURST", "TEARDROP", "WellMess", "GoldFinder", "SillyPutty Backdoor", "MagicWeb"],
    associatedSamples: ["SAMPLE-002"],
    radarScores: {
      codeReuse: 92,
      infraOverlap: 95,
      geoAlignment: 94,
      operationalTempo: 88,
      victimologyMatch: 99,
      artifactClustering: 96
    },
    compilerFingerprint: {
      pdbPath: "C:\\Workspace\\SVR_Ops\\Deploy\\SillyPutty_Trojan.pdb",
      richHeaderHash: "0x12FE9948BC310022",
      compilerVersion: "Microsoft Visual C/C++ 14.28",
      codePage: "0x0419 (Russian - Cyrillic) / 0x0409 (US English)",
      language: "Russian (ru-RU)"
    },
    sslJa3Fingerprint: {
      ja3Hash: "51c64c77e60f39ac3e3e230a34b51040",
      certSerial: "55:aa:bb:cc:dd:ee:ff:00:11:22",
      issuerOrg: "Amazon CloudFront Masquerade CA",
      commonPorts: ["TCP 443 (HTTPS)", "TCP 4444 (Raw Shell)", "TCP 8443"]
    },
    tlshDistance: 14,
    operationalHours: "UTC+3 (Moscow Standard Time - 09:00 to 18:30)",
    historicalCampaigns: [
      { name: "SolarWinds SUNBURST Supply Chain", year: "2020", impact: "Compromised SolarWinds Orion build system affecting 18,000+ organizations", cveList: ["SUNBURST DLL Hijacking"] },
      { name: "Trojanized SSH Clients Campaign", year: "2021", impact: "Backdoored PuTTY & WinSCP binaries distributed via watering-hole domains", cveList: ["T1036.005 Masquerading"] },
      { name: "Microsoft Corporate Email Infiltration", year: "2024", impact: "OAuth application privilege escalation accessing executive correspondence", cveList: ["Cloud Token Impersonation"] }
    ],
    diamondModel: {
      adversary: "SVR Special Operations Unit (Nobelium Cyber Wing)",
      capability: "In-memory stealth DLL injection, OAuth token hijacking, steganography, living-off-the-land",
      infrastructure: "Cloud hosting environments (Azure, AWS), compromised domestic residential IP proxies",
      victim: "Federal agencies, State Department, cybersecurity vendor executive mailboxes",
      socioPolitical: "Long-term persistent strategic intelligence collection on foreign policy and military alliances",
      technicalAxis: "Meticulous OPSEC: single-use C2 domains, customized compile flags, zero disk footprint"
    }
  },
  {
    id: "APT-FIN7",
    name: "FIN7 (Carbanak / Sangria Tempest)",
    aliases: ["Carbanak Group", "Gold Niagara", "Navigator Group", "ELBRUS"],
    sponsor: "Transnational Cybercrime Syndicate (Eastern Europe)",
    country: "Transnational Cybercrime",
    countryCode: "EU",
    flag: "🏴‍☠️",
    motive: "Massive Financial Extortion, Payment Card Harvesting & Enterprise Ransomware",
    firstSeen: "2013",
    activeStatus: "ACTIVE",
    confidenceScore: 94,
    targetedSectors: ["Retail Chains", "Hospitality & Restaurant Groups", "Commercial Banking", "Casinos & Gaming"],
    targetedGeos: ["United States", "United Kingdom", "Australia", "Western Europe"],
    signatureTooling: ["Carbanak", "SikoMode Nim Stealer", "RedLine Stealer", "GRIFFON", "Lizar / Tirion", "DarkSide / BlackMatter"],
    associatedSamples: ["SAMPLE-003", "SAMPLE-004"],
    radarScores: {
      codeReuse: 95,
      infraOverlap: 93,
      geoAlignment: 88,
      operationalTempo: 94,
      victimologyMatch: 92,
      artifactClustering: 91
    },
    compilerFingerprint: {
      pdbPath: "C:\\Users\\dev_ivan\\nim_projects\\sikomode\\src\\nimcache\\sikomode.pdb",
      richHeaderHash: "0x44FE10A9832011BB (GCC Nim Backend)",
      compilerVersion: "Nim Compiler v1.4.8 (MinGW-w64 x86_64)",
      codePage: "0x0419 (Russian) / 0x0409 (English)",
      language: "Russian / English"
    },
    sslJa3Fingerprint: {
      ja3Hash: "b32309a26951912be7dba376398abcde",
      certSerial: "99:88:77:66:55:44:33:22:11:00",
      issuerOrg: "Hostinger International / Private Bulletproof CA",
      commonPorts: ["TCP 80 (HTTP)", "TCP 443 (HTTPS)", "TCP 18342 (Net.Tcp WCF)"]
    },
    tlshDistance: 20,
    operationalHours: "UTC+2 / UTC+3 (09:00 to 20:00 UTC)",
    historicalCampaigns: [
      { name: "Hospitality PoS Scraping Heist", year: "2015-2018", impact: "Over 15 Million payment cards stolen from 3,600+ merchant locations", cveList: ["Carbanak PoS Memory Scraper"] },
      { name: "SikoMode Nim Exfiltration Wave", year: "2021", impact: "Targeted enterprise credential harvesting via esoteric programming language", cveList: ["T1027 Obfuscation"] },
      { name: "BlackMatter / DarkSide Ransomware Extortion", year: "2021", impact: "Multi-million dollar extortion demands against industrial supply chains", cveList: ["Double Extortion Portal"] }
    ],
    diamondModel: {
      adversary: "FIN7 Core Syndicate (Front companies e.g. Combi Security)",
      capability: "Nim/Go cross-platform stealers, .NET DPAPI master key decryptors, POS memory scrapers",
      infrastructure: "Hostinger Seychelles VPS, compromised WordPress sites for staging, dynamic DNS",
      victim: "Point-of-Sale merchant registers, browser credential stores, enterprise active directory",
      socioPolitical: "Commercial cybercrime monetization, ransomware affiliate revenue distribution",
      technicalAxis: "Multi-language pivot (C++ -> C# .NET -> Nim -> Rust) to systematically degrade AV signatures"
    }
  },
  {
    id: "APT-VOLTTYPHOON",
    name: "Volt Typhoon (Vanguard Panda / Bronze Silhouette)",
    aliases: ["Volt Typhoon", "Insidious Taurus", "Dev-0391", "PLA Strategic Support Force"],
    sponsor: "People's Republic of China (PRC - PLA SSF)",
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    motive: "Pre-positioning for Disruptive Cyber-Sabotage against US Critical Infrastructure",
    firstSeen: "2021",
    activeStatus: "ELEVATED",
    confidenceScore: 95,
    targetedSectors: ["Ports & Maritime Logistics", "Telecommunications", "Water Treatment Facilities", "Energy Grids", "Aviation"],
    targetedGeos: ["United States", "Guam (Pacific Military Hub)", "Taiwan", "Indo-Pacific Partners"],
    signatureTooling: ["KV-Botnet", "Living-off-the-Land (LOTL)", "wmic / netsh / ntdsutil", "Fast-Reverse-Proxy (FRP)"],
    associatedSamples: ["SAMPLE-005"],
    radarScores: {
      codeReuse: 82,
      infraOverlap: 96,
      geoAlignment: 98,
      operationalTempo: 86,
      victimologyMatch: 99,
      artifactClustering: 90
    },
    compilerFingerprint: {
      pdbPath: "E:\\Project_Vanguard\\SOHO_Proxy\\Release\\frp_client.pdb",
      richHeaderHash: "0x67BA109284110033",
      compilerVersion: "Go Compiler 1.21 / MSVC 19.30",
      codePage: "0x0804 (Chinese Simplified - GB2312)",
      language: "Chinese Simplified (zh-CN)"
    },
    sslJa3Fingerprint: {
      ja3Hash: "8b230198ca83109a8239019283019283",
      certSerial: "12:34:56:78:90:ab:cd:ef:12:34",
      issuerOrg: "Let's Encrypt / Compromised SOHO Routers",
      commonPorts: ["TCP 443", "TCP 8080", "TCP 7000 (FRP Proxy)"]
    },
    tlshDistance: 32,
    operationalHours: "UTC+8 (Beijing Standard Time - 08:00 to 18:00)",
    historicalCampaigns: [
      { name: "Guam & US Critical Infrastructure Infiltration", year: "2023", impact: "Stealth pre-positioning across power, water, and maritime transportation hubs", cveList: ["Fortinet / Cisco SOHO Exploits"] },
      { name: "KV-Botnet SOHO Router Swarm", year: "2023-2024", impact: "Swarm of hijacked Netgear/Cisco routers used to route undetectable C2 commands", cveList: ["End-of-Life SOHO Vulnerabilities"] }
    ],
    diamondModel: {
      adversary: "PRC PLA Unit 61398 / 61486 & SSF Network Systems Department",
      capability: "Zero-disk Living-off-the-Land (LOTL), SOHO Router Firmware Hijacking, Web Shells",
      infrastructure: "KV-Botnet of compromised domestic SOHO routers inside the victim's geographic region",
      victim: "Subsea fiber optic landing stations, Pacific military logistical ports, municipal water utilities",
      socioPolitical: "Pre-positioning destructive capability to delay US response in the event of a Taiwan conflict",
      technicalAxis: "Zero binary malware on disk; relies exclusively on built-in Windows admin binaries (WMI, PowerShell)"
    }
  },
  {
    id: "APT-LOCKBIT",
    name: "LockBit Syndicate (LockBit 3.0 / Gold Mystic)",
    aliases: ["LockBit Black", "LockBit Green", "Bitwise Spider", "RaaS Operator"],
    sponsor: "Transnational Cybercrime (Ransomware-as-a-Service)",
    country: "Transnational Cybercrime",
    countryCode: "EU",
    flag: "🏴‍☠️",
    motive: "High-Yield Corporate Extortion & Exfiltration of Intellectual Property",
    firstSeen: "2019",
    activeStatus: "ACTIVE",
    confidenceScore: 99,
    targetedSectors: ["Healthcare & Hospitals", "Aerospace & Defense", "Financial Services", "Manufacturing"],
    targetedGeos: ["Global (Excluding CIS Nations)"],
    signatureTooling: ["LockBit 3.0 Locker", "StealBit Exfiltration Tool", "Cobalt Strike Beacon", "Mimikatz"],
    associatedSamples: ["SAMPLE-005"],
    radarScores: {
      codeReuse: 98,
      infraOverlap: 94,
      geoAlignment: 89,
      operationalTempo: 99,
      victimologyMatch: 91,
      artifactClustering: 97
    },
    compilerFingerprint: {
      pdbPath: "C:\\LockBit\\Locker_v3.0\\Source\\Release\\LockBit3.pdb",
      richHeaderHash: "0xDEADBEEF90218844 (MSVC 2019)",
      compilerVersion: "Microsoft Visual C/C++ 16.0",
      codePage: "0x0419 (Russian) / 0x0409 (English)",
      language: "Russian (ru-RU)"
    },
    sslJa3Fingerprint: {
      ja3Hash: "c02f8319082319082310928301928301",
      certSerial: "44:55:66:77:88:99:aa:bb:cc:dd",
      issuerOrg: "Tor Hidden Service Onion Proxy CA",
      commonPorts: ["TCP 443", "TCP 80", "TCP 4444"]
    },
    tlshDistance: 12,
    operationalHours: "UTC+3 (Moscow / St. Petersburg - 10:00 to 22:00)",
    historicalCampaigns: [
      { name: "Boeing & Royal Mail Ransomware Attacks", year: "2023", impact: "Exfiltration of enterprise engineering schematics and operational disruption", cveList: ["CitrixBleed CVE-2023-4966"] },
      { name: "Operation Cronos Law Enforcement Takedown", year: "2024", impact: "FBI/NCA infrastructure seizure; gang re-emerged with decentralized lockers", cveList: ["LockBit 3.0 Bug Bounty"] }
    ],
    diamondModel: {
      adversary: "LockBitSupp & Global Affiliate Network (Gold Mystic)",
      capability: "Fast multi-threaded ChaCha20/AES locker, anti-debug hooks, StealBit exfiltrator",
      infrastructure: "Bulletproof Tor darknet leak sites, Mega.nz cloud storage exfiltration buckets",
      victim: "Fortune 500 corporations, municipal governments, hospital healthcare networks",
      socioPolitical: "Maximizing Bitcoin/Monero ransom payouts through double-extortion public data leaks",
      technicalAxis: "Disables Windows Defender via token manipulation, deletes Volume Shadow Copies, encrypts local shares"
    }
  }
];

export default function AptAttributionPage() {
  const [selectedActorId, setSelectedActorId] = useState<string>("APT-LAZARUS");
  const [selectedSampleId, setSelectedSampleId] = useState<string>("SAMPLE-001");
  const [activeDiamondNode, setActiveDiamondNode] = useState<"ADVERSARY" | "CAPABILITY" | "INFRASTRUCTURE" | "VICTIM">("ADVERSARY");
  const [searchQuery, setSearchQuery] = useState("");

  // Scoring Weights (User-adjustable sliders)
  const [weightPdb, setWeightPdb] = useState<number>(25);
  const [weightCodePage, setWeightCodePage] = useState<number>(20);
  const [weightSsl, setWeightSsl] = useState<number>(25);
  const [weightTlsh, setWeightTlsh] = useState<number>(30);

  const selectedActor = APT_DOSSIERS.find(a => a.id === selectedActorId) || APT_DOSSIERS[0];
  const currentSample = MALWARE_SAMPLES.find(s => s.id === selectedSampleId) || MALWARE_SAMPLES[0];

  // Multi-factor calculated aggregate attribution score
  const aggregateScore = useMemo(() => {
    const totalWeight = weightPdb + weightCodePage + weightSsl + weightTlsh;
    if (totalWeight === 0) return 0;

    // Component scores
    const pdbScore = selectedActor.compilerFingerprint.pdbPath ? 98 : 60;
    const codePageScore = selectedActor.compilerFingerprint.codePage.includes("0x0412") || selectedActor.compilerFingerprint.codePage.includes("0x0419") || selectedActor.compilerFingerprint.codePage.includes("0x0804") ? 95 : 70;
    const sslScore = selectedActor.sslJa3Fingerprint.certSerial ? 96 : 65;
    const tlshScore = Math.max(0, 100 - selectedActor.tlshDistance * 2);

    const weighted = (pdbScore * weightPdb + codePageScore * weightCodePage + sslScore * weightSsl + tlshScore * weightTlsh) / totalWeight;
    return Math.min(100, Math.round(weighted * 10) / 10);
  }, [selectedActor, weightPdb, weightCodePage, weightSsl, weightTlsh]);

  const filteredActors = useMemo(() => {
    if (!searchQuery) return APT_DOSSIERS;
    const q = searchQuery.toLowerCase();
    return APT_DOSSIERS.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.sponsor.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.aliases.some(al => al.toLowerCase().includes(q)) ||
      a.signatureTooling.some(t => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Handle sample change to auto-match APT
  const handleSampleChange = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const matchedActor = APT_DOSSIERS.find(a => a.associatedSamples.includes(sampleId));
    if (matchedActor) {
      setSelectedActorId(matchedActor.id);
    }
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 14, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              STAGE 5: ADVERSARY ATTRIBUTION ENGINE
            </span>
            <span className="badge-critical">DIAMOND MODEL OF INTRUSION</span>
            <span className="badge-high">TLSH CODE CLUSTERING</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#f1f5f9", marginTop: 2 }}>
            Diamond Model Threat Actor &amp; Nation-State APT Attribution Studio
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Correlate binary compiler artifacts (PDB, Rich Header), language code pages, SSL/JA3 fingerprints, and TLSH similarity to uncover nation-state threat vectors.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            className="tool-select"
            value={selectedSampleId}
            onChange={(e) => handleSampleChange(e.target.value)}
          >
            {MALWARE_SAMPLES.map(s => (
              <option key={s.id} value={s.id}>Correlate: {s.name} ({s.family})</option>
            ))}
          </select>

          <div style={{ background: "rgba(6,182,212,0.12)", border: "1px solid #06b6d4", padding: "6px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Compass size={14} color="#06b6d4" />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#06b6d4" }}>
              Match: {selectedActor.name.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* TOP SECTION: INTERACTIVE DIAMOND MODEL CANVAS & RADAR ATTRIBUTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16 }}>
        {/* DIAMOND MODEL INTERACTIVE VISUALIZER */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Compass size={16} color="#06b6d4" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>
                Interactive Diamond Model Canvas (Sergio Caltagirone Framework)
              </span>
            </div>
            <span className="badge-low">4-Vertex Intrusion Graph</span>
          </div>

          {/* SVG Diamond Graph */}
          <div style={{
            background: "#020408",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative"
          }}>
            <svg viewBox="0 0 500 280" style={{ width: "100%", maxHeight: 270 }}>
              {/* Diamond connecting lines */}
              <line x1="250" y1="35" x2="80" y2="140" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="250" y1="35" x2="420" y2="140" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="80" y1="140" x2="250" y2="245" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="420" y1="140" x2="250" y2="245" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />

              {/* Cross Axis Lines */}
              <line x1="250" y1="35" x2="250" y2="245" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="80" y1="140" x2="420" y2="140" stroke="#1e293b" strokeWidth="1.5" />

              {/* Central Axis Labels */}
              <text x="255" y="100" fill="#64748b" fontSize="9" fontWeight="700" fontFamily="monospace">Socio-Political Axis</text>
              <text x="280" y="135" fill="#64748b" fontSize="9" fontWeight="700" fontFamily="monospace">Technical Axis</text>

              {/* TOP VERTEX: ADVERSARY */}
              <g onClick={() => setActiveDiamondNode("ADVERSARY")} style={{ cursor: "pointer" }}>
                <circle cx="250" cy="35" r="26" fill={activeDiamondNode === "ADVERSARY" ? "rgba(239, 68, 68, 0.3)" : "rgba(14, 20, 34, 0.9)"} stroke={activeDiamondNode === "ADVERSARY" ? "#ef4444" : "#f87171"} strokeWidth="2" />
                <text x="250" y="32" fill="#f87171" fontSize="10" fontWeight="900" textAnchor="middle">ADVERSARY</text>
                <text x="250" y="44" fill="#cbd5e1" fontSize="8" textAnchor="middle">{selectedActor.flag} {selectedActor.countryCode}</text>
              </g>

              {/* LEFT VERTEX: CAPABILITY */}
              <g onClick={() => setActiveDiamondNode("CAPABILITY")} style={{ cursor: "pointer" }}>
                <circle cx="80" cy="140" r="26" fill={activeDiamondNode === "CAPABILITY" ? "rgba(6, 182, 212, 0.3)" : "rgba(14, 20, 34, 0.9)"} stroke={activeDiamondNode === "CAPABILITY" ? "#06b6d4" : "#38bdf8"} strokeWidth="2" />
                <text x="80" y="137" fill="#38bdf8" fontSize="9" fontWeight="900" textAnchor="middle">CAPABILITY</text>
                <text x="80" y="149" fill="#cbd5e1" fontSize="7.5" textAnchor="middle">Exploits/TTPs</text>
              </g>

              {/* RIGHT VERTEX: INFRASTRUCTURE */}
              <g onClick={() => setActiveDiamondNode("INFRASTRUCTURE")} style={{ cursor: "pointer" }}>
                <circle cx="420" cy="140" r="26" fill={activeDiamondNode === "INFRASTRUCTURE" ? "rgba(168, 85, 247, 0.3)" : "rgba(14, 20, 34, 0.9)"} stroke={activeDiamondNode === "INFRASTRUCTURE" ? "#a855f7" : "#c084fc"} strokeWidth="2" />
                <text x="420" y="137" fill="#c084fc" fontSize="9" fontWeight="900" textAnchor="middle">INFRASTRUCTURE</text>
                <text x="420" y="149" fill="#cbd5e1" fontSize="7.5" textAnchor="middle">C2 / Tor / DNS</text>
              </g>

              {/* BOTTOM VERTEX: VICTIM */}
              <g onClick={() => setActiveDiamondNode("VICTIM")} style={{ cursor: "pointer" }}>
                <circle cx="250" cy="245" r="26" fill={activeDiamondNode === "VICTIM" ? "rgba(245, 158, 11, 0.3)" : "rgba(14, 20, 34, 0.9)"} stroke={activeDiamondNode === "VICTIM" ? "#f59e0b" : "#fbbf24"} strokeWidth="2" />
                <text x="250" y="242" fill="#fbbf24" fontSize="10" fontWeight="900" textAnchor="middle">VICTIM</text>
                <text x="250" y="254" fill="#cbd5e1" fontSize="8" textAnchor="middle">Target Nodes</text>
              </g>
            </svg>

            {/* Selected Node Details Box */}
            <div style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: activeDiamondNode === "ADVERSARY" ? "#ef4444" : activeDiamondNode === "CAPABILITY" ? "#06b6d4" : activeDiamondNode === "INFRASTRUCTURE" ? "#a855f7" : "#f59e0b"
                }}>
                  Selected Diamond Vertex: {activeDiamondNode}
                </span>
                <span className="badge-medium">Active Vector</span>
              </div>
              <p style={{ fontSize: 11.5, color: "#f1f5f9", margin: 0 }}>
                {activeDiamondNode === "ADVERSARY" && selectedActor.diamondModel.adversary}
                {activeDiamondNode === "CAPABILITY" && selectedActor.diamondModel.capability}
                {activeDiamondNode === "INFRASTRUCTURE" && selectedActor.diamondModel.infrastructure}
                {activeDiamondNode === "VICTIM" && selectedActor.diamondModel.victim}
              </p>
            </div>
          </div>
        </div>

        {/* THREAT VECTOR RADAR & CONFIDENCE METER */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={16} color="#10b981" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>
                Nation-State Attribution Vector Radar
              </span>
            </div>
            <span className="badge-critical">{aggregateScore}% CONFIDENCE</span>
          </div>

          {/* SVG Radar Chart */}
          <div style={{ background: "#020408", border: "1px solid var(--border)", borderRadius: 8, padding: 12, display: "flex", justifyContent: "center" }}>
            <svg viewBox="0 0 300 240" style={{ width: "100%", maxHeight: 220 }}>
              {/* Radar Concentric Polygons */}
              <polygon points="150,20 250,75 250,175 150,230 50,175 50,75" fill="none" stroke="#1e293b" strokeWidth="1" />
              <polygon points="150,50 220,88 220,162 150,200 80,162 80,88" fill="none" stroke="#1e293b" strokeWidth="1" />
              <polygon points="150,80 190,102 190,148 150,170 110,148 110,102" fill="none" stroke="#1e293b" strokeWidth="1" />

              {/* Radar Axis Lines */}
              <line x1="150" y1="125" x2="150" y2="20" stroke="#334155" strokeWidth="1" />
              <line x1="150" y1="125" x2="250" y2="75" stroke="#334155" strokeWidth="1" />
              <line x1="150" y1="125" x2="250" y2="175" stroke="#334155" strokeWidth="1" />
              <line x1="150" y1="125" x2="150" y2="230" stroke="#334155" strokeWidth="1" />
              <line x1="150" y1="125" x2="50" y2="175" stroke="#334155" strokeWidth="1" />
              <line x1="150" y1="125" x2="50" y2="75" stroke="#334155" strokeWidth="1" />

              {/* Radar Data Polygon */}
              {(() => {
                const r = selectedActor.radarScores;
                const p1 = `${150},${125 - (r.codeReuse / 100) * 105}`;
                const p2 = `${150 + (r.infraOverlap / 100) * 100},${125 - (r.infraOverlap / 100) * 50}`;
                const p3 = `${150 + (r.geoAlignment / 100) * 100},${125 + (r.geoAlignment / 100) * 50}`;
                const p4 = `${150},${125 + (r.operationalTempo / 100) * 105}`;
                const p5 = `${150 - (r.victimologyMatch / 100) * 100},${125 + (r.victimologyMatch / 100) * 50}`;
                const p6 = `${150 - (r.artifactClustering / 100) * 100},${125 - (r.artifactClustering / 100) * 50}`;
                const points = `${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`;
                return (
                  <polygon
                    points={points}
                    fill="rgba(6, 182, 212, 0.25)"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                  />
                );
              })()}

              {/* Radar Axis Text */}
              <text x="150" y="14" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="middle">Code Reuse ({selectedActor.radarScores.codeReuse}%)</text>
              <text x="255" y="73" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="start">Infra ({selectedActor.radarScores.infraOverlap}%)</text>
              <text x="255" y="180" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="start">Geo Alignment ({selectedActor.radarScores.geoAlignment}%)</text>
              <text x="150" y="238" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="middle">Tempo ({selectedActor.radarScores.operationalTempo}%)</text>
              <text x="45" y="180" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="end">Victimology ({selectedActor.radarScores.victimologyMatch}%)</text>
              <text x="45" y="73" fill="#38bdf8" fontSize="8" fontWeight="700" textAnchor="end">Artifacts ({selectedActor.radarScores.artifactClustering}%)</text>
            </svg>
          </div>

          {/* Operational Hours Heatmap */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={13} color="#f59e0b" />
              <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>OPERATIONAL TEMPO:</span>
            </div>
            <span style={{ fontSize: 11, color: "#fbbf24", fontFamily: "monospace", fontWeight: 700 }}>
              {selectedActor.operationalHours}
            </span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: MULTI-FACTOR ATTRIBUTION SCORING MATRIX */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Fingerprint size={16} color="#06b6d4" />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>
                Multi-Factor Attribution Scoring Matrix &amp; Artifact Evidence Chain
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
              Dynamic weighted evaluation across 4 forensic pillars to calculate forensic attribution certainty against {selectedActor.name}.
            </p>
          </div>

          {/* Weight Adjusters */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "var(--bg)", padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>WEIGHTS:</div>
            <label style={{ fontSize: 10.5, color: "#38bdf8" }}>PDB: {weightPdb}%</label>
            <label style={{ fontSize: 10.5, color: "#10b981" }}>Locale: {weightCodePage}%</label>
            <label style={{ fontSize: 10.5, color: "#a855f7" }}>SSL/JA3: {weightSsl}%</label>
            <label style={{ fontSize: 10.5, color: "#f59e0b" }}>TLSH: {weightTlsh}%</label>
          </div>
        </div>

        {/* 4 Forensic Pillars Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {/* Pillar 1: Compiler & PDB Artifacts */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8" }}>1. Compiler &amp; PDB Artifacts</span>
              <span className="badge-critical">98% Match</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: "monospace" }}>
              <div style={{ color: "var(--muted)" }}>PDB Path:</div>
              <div style={{ color: "#f1f5f9", wordBreak: "break-all", background: "#020408", padding: "4px 6px", borderRadius: 4 }}>
                {selectedActor.compilerFingerprint.pdbPath}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "var(--muted)" }}>Rich Header:</span>
                <span style={{ color: "#38bdf8" }}>{selectedActor.compilerFingerprint.richHeaderHash}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Compiler:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedActor.compilerFingerprint.compilerVersion}</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Language & Locale Code Page */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981" }}>2. Locale &amp; Code Page</span>
              <span className="badge-low">95% Match</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: "monospace" }}>
              <div style={{ color: "var(--muted)" }}>Code Page Fingerprint:</div>
              <div style={{ color: "#10b981", fontWeight: 700, background: "#020408", padding: "4px 6px", borderRadius: 4 }}>
                {selectedActor.compilerFingerprint.codePage}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "var(--muted)" }}>Primary Language:</span>
                <span style={{ color: "#f1f5f9" }}>{selectedActor.compilerFingerprint.language}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>State Sponsor:</span>
                <span style={{ color: "#34d399" }}>{selectedActor.sponsor}</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: SSL Certificate & JA3 */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#a855f7" }}>3. SSL / JA3 Fingerprint</span>
              <span className="badge-medium">96% Match</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: "monospace" }}>
              <div style={{ color: "var(--muted)" }}>JA3 Hash:</div>
              <div style={{ color: "#c084fc", background: "#020408", padding: "4px 6px", borderRadius: 4 }}>
                {selectedActor.sslJa3Fingerprint.ja3Hash}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "var(--muted)" }}>Cert Serial:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedActor.sslJa3Fingerprint.certSerial}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>C2 Ports:</span>
                <span style={{ color: "#f59e0b" }}>{selectedActor.sslJa3Fingerprint.commonPorts.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Pillar 4: TLSH / SSDEEP Similarity */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>4. TLSH Code Reuse Similarity</span>
              <span className="badge-high">Score: {Math.max(0, 100 - selectedActor.tlshDistance * 2)}%</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: "monospace" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>TLSH Distance:</span>
                <span style={{ color: selectedActor.tlshDistance < 20 ? "#10b981" : "#f59e0b", fontWeight: 800 }}>
                  {selectedActor.tlshDistance} (Threshold &lt; 40)
                </span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 10 }}>
                Locality Sensitive Hashing confirms subroutine overlap with known {selectedActor.name} binaries.
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {selectedActor.signatureTooling.slice(0, 3).map((t, idx) => (
                  <span key={idx} className="badge-medium">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: GLOBAL THREAT ACTOR PROFILES & CAMPAIGN DOSSIERS */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Left: Actor Dossier Selector */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={14} color="#06b6d4" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>Global APT Dossiers</span>
            </div>
            <span className="badge-low">{APT_DOSSIERS.length} Groups</span>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={12} color="var(--muted)" style={{ position: "absolute", left: 8, top: 8 }} />
            <input
              type="text"
              placeholder="Search actors, malware, aliases..."
              className="tool-input"
              style={{ width: "100%", paddingLeft: 26, fontSize: 11 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }}>
            {filteredActors.map((actor) => {
              const isSelected = selectedActor.id === actor.id;
              return (
                <div
                  key={actor.id}
                  onClick={() => setSelectedActorId(actor.id)}
                  style={{
                    background: isSelected ? "rgba(6, 182, 212, 0.15)" : "var(--bg)",
                    border: `1px solid ${isSelected ? "#06b6d4" : "var(--border)"}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: isSelected ? "#38bdf8" : "#f1f5f9" }}>
                      {actor.flag} {actor.name.split(" ")[0]}
                    </span>
                    <span className={actor.confidenceScore > 95 ? "badge-critical" : "badge-high"}>
                      {actor.confidenceScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                    {actor.sponsor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Dossier & Campaign History */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{selectedActor.flag}</span>
                <h2 style={{ fontSize: 16, fontWeight: 900, color: "#f1f5f9" }}>{selectedActor.name}</h2>
                <span className="badge-critical">{selectedActor.activeStatus}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#f59e0b", fontWeight: 700, marginTop: 2 }}>
                Sponsor: {selectedActor.sponsor} ({selectedActor.country})
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selectedActor.aliases.map((al, idx) => (
                <span key={idx} className="badge-medium">{al}</span>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.5, background: "var(--bg)", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)" }}>
            <strong style={{ color: "#06b6d4" }}>Strategic Motive: </strong>{selectedActor.motive}
          </div>

          {/* Targets & Tooling */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Targeted Industry Sectors:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selectedActor.targetedSectors.map((s, idx) => (
                  <span key={idx} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, fontSize: 10.5, color: "#f1f5f9" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Signature Malware Arsenal:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {selectedActor.signatureTooling.map((t, idx) => (
                  <span key={idx} className="badge-high">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Campaigns Timeline */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color="#06b6d4" />
              Documented Global Cyber Campaigns
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedActor.historicalCampaigns.map((camp, idx) => (
                <div key={idx} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 11.5 }}>{camp.name}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace" }}>({camp.year})</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{camp.impact}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {camp.cveList.map((cve, i) => (
                      <span key={i} className="badge-critical">{cve}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
