"use client";

import { useState, useMemo, useEffect } from "react";
import { MALWARE_SAMPLES } from "@/data/samples";
import {
  Radar,
  Globe,
  Compass,
  Shield,
  Activity,
  Server,
  Network,
  Radio,
  Layers,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Flame,
  Zap,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Clock,
  Building,
  Key,
  ShieldAlert,
  Sliders,
  RefreshCw,
  Eye,
  Crosshair,
  TrendingUp,
  Share2
} from "lucide-react";

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type ThreatActorGroup = "LAZARUS" | "SANDWORM" | "COZY_BEAR" | "FIN7" | "LOCKBIT" | "VOLT_TYPHOON" | "CHARMING_KITTEN";

export interface APTCampaign {
  id: string;
  name: string;
  actor: ThreatActorGroup;
  actorName: string;
  sponsorState: string;
  yearRange: string;
  status: "ACTIVE" | "ELEVATED" | "DORMANT" | "HISTORICAL";
  targetedSectors: string[];
  targetedRegions: string[];
  malwarePayloads: string[];
  mitreTTPs: Array<{ id: string; name: string }>;
  description: string;
  financialImpact: string;
  initialAccessVector: string;
  c2InfrastructureType: "FAST_FLUX_DNS" | "DOUBLE_FLUX" | "TOR_HIDDEN_SERVICE" | "MALLEABLE_CDN" | "P2P_MESH";
  fastFluxTelemetry: {
    domainCount: number;
    activeIpPool: string[];
    meanTtlSeconds: number;
    nameservers: string[];
    asns: Array<{ asn: string; org: string; country: string }>;
    ja3Hash: string;
    sslCertSerial: string;
    sslIssuer: string;
  };
}

export interface FastFluxNode {
  id: string;
  type: "DOMAIN" | "MOTHERSHIP" | "FAST_FLUX_IP" | "BULLETPROOF_ASN" | "SSL_CERT";
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  status: "ACTIVE_RESOLVING" | "EXPIRED_TTL" | "SINKHOLED" | "FLAGGED";
  ttlRemaining?: number;
  country?: string;
  asn?: string;
}

export interface FastFluxEdge {
  from: string;
  to: string;
  type: "RESOLVES_TO" | "ROUTED_VIA" | "ENCRYPTED_WITH" | "AUTH_NS";
}

export interface IOCCorrelationItem {
  id: string;
  iocValue: string;
  iocType: "IP" | "DOMAIN" | "JA3" | "IMPHASH" | "MUTEX" | "RICH_HEADER" | "PDB_PATH";
  campaignsInvolved: string[];
  actorsInvolved: string[];
  firstObserved: string;
  confidenceScore: number;
  overlapRating: "HIGH" | "CRITICAL" | "MODERATE";
}

// ==========================================
// MOCK THREAT DATASET
// ==========================================

const APT_CAMPAIGNS: APTCampaign[] = [
  {
    id: "CAMP-LAZ-01",
    name: "Operation Troy / AppleJeus Cryptocurrency Thefts",
    actor: "LAZARUS",
    actorName: "Lazarus Group (APT38 / BlueNoroff)",
    sponsorState: "North Korea (DPRK RGB)",
    yearRange: "2018 - 2026",
    status: "ACTIVE",
    targetedSectors: ["Cryptocurrency Exchanges", "DeFi Protocols", "Cross-Chain Bridges", "Defense"],
    targetedRegions: ["Global", "United States", "South Korea", "Singapore", "Japan"],
    malwarePayloads: ["AppleJeus Trojan", "Fallchill", "Manuscrypt", "TraderTraitor", "CTrack"],
    mitreTTPs: [
      { id: "T1204.002", name: "User Execution: Malicious File" },
      { id: "T1566.002", name: "Spearphishing Link" },
      { id: "T1071.001", name: "Web Protocols C2" },
      { id: "T1027.002", name: "Software Packing" }
    ],
    description: "Lazarus spearphishes crypto executives with trojanized trading applications (e.g. Celas Trade / J speed Hex). Uses multi-tiered fast-flux proxy relays and weaponized MSI installers to siphon private keys and seed phrases, responsible for the $620M Axie Infinity Ronin Bridge heist.",
    financialImpact: "$2.4 Billion USD Total Stolen",
    initialAccessVector: "Trojanized Crypto Trading Desktop Apps & Fake LinkedIn Job Recruiters",
    c2InfrastructureType: "FAST_FLUX_DNS",
    fastFluxTelemetry: {
      domainCount: 42,
      activeIpPool: ["185.193.124.9", "194.36.191.12", "45.148.10.88", "193.29.13.104"],
      meanTtlSeconds: 120,
      nameservers: ["ns1.celastrade.com", "ns2.celastrade.com", "ns1.chain-update.org"],
      asns: [
        { asn: "AS200052", org: "FlokiNET ICELAND", country: "IS" },
        { asn: "AS44050", org: "Alexhost SRL", country: "MD" },
        { asn: "AS48693", org: "Offshore Racks S.A.", country: "PA" }
      ],
      ja3Hash: "e7d705a3286e19ea42f587b344ee6865",
      sslCertSerial: "04:5b:91:2a:ff:c0:39:18",
      sslIssuer: "Let's Encrypt Authority X3 (Rotated every 60 days)"
    }
  },
  {
    id: "CAMP-SAND-01",
    name: "Industroyer2 & AcidRain Grid Sabotage",
    actor: "SANDWORM",
    actorName: "Sandworm Team (APT44 / Unit 74455)",
    sponsorState: "Russian Federation (GRU)",
    yearRange: "2015 - 2026",
    status: "ACTIVE",
    targetedSectors: ["Electrical Power Grids (OT)", "Satellite Telecoms", "Rail Logistics", "Government"],
    targetedRegions: ["Ukraine", "NATO Members", "Eastern Europe"],
    malwarePayloads: ["Industroyer2", "AcidRain MIPS Wiper", "CaddyWiper", "HermeticWiper", "BlackEnergy3"],
    mitreTTPs: [
      { id: "T0855", name: "Unauthorized Command Message (IEC-104)" },
      { id: "T0837", name: "Modify Parameter" },
      { id: "T1485", name: "Data Destruction (Wiper)" },
      { id: "T1078", name: "Valid Accounts" }
    ],
    description: "Sandworm executes targeted disruption of electrical sub-stations using custom OT malware crafted for IEC-60870-5-104 and OPC DA protocol execution. AcidRain wiper targets Linux/MIPS satellite modems (KA-SAT) to sever command and control during military maneuvers.",
    financialImpact: "Critical Regional Infrastructure Outages",
    initialAccessVector: "Compromised Domain Admin VPN Credentials & MicroTik Router Botnet Pivots",
    c2InfrastructureType: "DOUBLE_FLUX",
    fastFluxTelemetry: {
      domainCount: 28,
      activeIpPool: ["91.240.118.14", "185.220.101.5", "195.123.245.89", "89.248.165.11"],
      meanTtlSeconds: 60,
      nameservers: ["ns1.dnsprotect-guard.net", "ns2.dnsprotect-guard.net"],
      asns: [
        { asn: "AS204957", org: "Green Floid LLC", country: "RU" },
        { asn: "AS51852", org: "Private Layer INC", country: "CH" },
        { asn: "AS200588", org: "Biterika Hosting LLC", country: "RU" }
      ],
      ja3Hash: "a0e9f5d64349fb13191bc781f81f42e1",
      sslCertSerial: "51:c8:33:10:98:fa:e1:00",
      sslIssuer: "ZeroSSL RSA Domain Secure CA"
    }
  },
  {
    id: "CAMP-COZY-01",
    name: "Nobelium Sunburst & Token Forgery Operations",
    actor: "COZY_BEAR",
    actorName: "Cozy Bear (APT29 / Nobelium / Midnight Blizzard)",
    sponsorState: "Russian Federation (SVR)",
    yearRange: "2020 - 2026",
    status: "ELEVATED",
    targetedSectors: ["IT Supply Chain", "Cloud Service Providers", "Federal Agencies", "Think Tanks"],
    targetedRegions: ["United States", "European Union", "United Kingdom"],
    malwarePayloads: ["Sunburst Backdoor", "Teardrop", "Raindrop", "GoldMax", "MagicWeb"],
    mitreTTPs: [
      { id: "T1195.002", name: "Supply Chain Compromise: Software Dependencies" },
      { id: "T1606.002", name: "Forge Web Credentials: SAML Tokens (Golden SAML)" },
      { id: "T1071.004", name: "DNS C2 Protocol" },
      { id: "T1550.001", name: "Application Access Token Hijacking" }
    ],
    description: "APT29 breached the SolarWinds Orion build system to deploy Sunburst to 18,000+ organizations. Advanced operations pivoted to Microsoft 365 tenants via Golden SAML token forgery and credential theft targeting senior government email accounts.",
    financialImpact: "$100M+ Incident Response & Federal Investigation Cost",
    initialAccessVector: "Build Pipeline Compromise (SolarMarker) & Cloud Password Spraying",
    c2InfrastructureType: "MALLEABLE_CDN",
    fastFluxTelemetry: {
      domainCount: 65,
      activeIpPool: ["13.107.246.10", "20.190.159.2", "104.18.21.90", "151.101.65.140"],
      meanTtlSeconds: 300,
      nameservers: ["ns1.avsvmcloud.com", "ns2.avsvmcloud.com", "ns3.avsvmcloud.com"],
      asns: [
        { asn: "AS13335", org: "Cloudflare Inc.", country: "US" },
        { asn: "AS8075", org: "Microsoft Corp CDN", country: "US" },
        { asn: "AS16509", org: "Amazon AWS Global", country: "US" }
      ],
      ja3Hash: "b32309a61ce4e65d1150f1b33238b770",
      sslCertSerial: "28:77:ac:01:92:44:88:22",
      sslIssuer: "DigiCert Global Root G2 (Masqueraded Domain Fronting)"
    }
  },
  {
    id: "CAMP-FIN7-01",
    name: "Carbanak ATM & Baston Ransomware Syndicates",
    actor: "FIN7",
    actorName: "FIN7 (Carbanak / ELBRUS / Sangria Tempest)",
    sponsorState: "Eastern European Cybercrime Syndicate",
    yearRange: "2014 - 2026",
    status: "ACTIVE",
    targetedSectors: ["Retail POS", "Banking & Financial Services", "Hospitality", "RaaS Partners"],
    targetedRegions: ["United States", "United Kingdom", "France", "Australia"],
    malwarePayloads: ["Carbanak", "Baston Backdoor", "Griffon JS", "DiceLoader", "BlackCat/ALPHV"],
    mitreTTPs: [
      { id: "T1059.007", name: "JavaScript / JScript Interpreter" },
      { id: "T1053.005", name: "Scheduled Task" },
      { id: "T1003.001", name: "LSASS Memory Dump" },
      { id: "T1486", name: "Data Encrypted for Impact" }
    ],
    description: "Financially motivated cartel behind multi-billion dollar payment card heists and modern Ransomware-as-a-Service partnerships. Operates shell IT security firms (e.g. 'Combi Security') to recruit unwitting penetration testers to deploy Baston and DarkSide/BlackCat lockers.",
    financialImpact: "$1.2 Billion USD in Credit Card Thefts & Ransom Payouts",
    initialAccessVector: "Mailed Malicious BadUSB Devices & Fake SEC Filings Maldocs",
    c2InfrastructureType: "FAST_FLUX_DNS",
    fastFluxTelemetry: {
      domainCount: 34,
      activeIpPool: ["185.161.248.42", "193.106.191.24", "45.154.255.88", "194.26.29.110"],
      meanTtlSeconds: 180,
      nameservers: ["ns1.secure-payment-gateway.co", "ns2.secure-payment-gateway.co"],
      asns: [
        { asn: "AS48693", org: "Offshore Racks S.A.", country: "PA" },
        { asn: "AS200052", org: "FlokiNET ICELAND", country: "IS" }
      ],
      ja3Hash: "7b4c91837192a0e98129381928301928",
      sslCertSerial: "19:88:22:fe:a1:44:99:bc",
      sslIssuer: "cPanel, Inc. Certification Authority"
    }
  },
  {
    id: "CAMP-LOCK-01",
    name: "LockBit 3.0 Black & Green RaaS Cartel",
    actor: "LOCKBIT",
    actorName: "LockBit Supporter (LockBit Cartel)",
    sponsorState: "Transnational Cybercrime RaaS",
    yearRange: "2019 - 2026",
    status: "ACTIVE",
    targetedSectors: ["Healthcare", "Critical Manufacturing", "Municipalities", "Financial Services"],
    targetedRegions: ["United States", "United Kingdom", "Japan", "Germany", "Canada"],
    malwarePayloads: ["LockBit 3.0 (Black)", "LockBit Green (Conti Fork)", "StealBit Exfiltration Tool", "LB3 Linux ESXi"],
    mitreTTPs: [
      { id: "T1486", name: "Data Encrypted for Impact (Multi-threaded AES-256)" },
      { id: "T1070.004", name: "File Deletion / VSS Shadow Wiping" },
      { id: "T1489", name: "Service Stop (Exchange/SQL/EDR)" },
      { id: "T1562.001", name: "Disable Security Tools" }
    ],
    description: "The world's highest-volume Ransomware-as-a-Service operator. Employs StealBit for 10Gbps automated exfiltration followed by kernel-driver EDR blinding (BYOVD) and sub-minute encryption across thousands of network shares and ESXi hypervisors.",
    financialImpact: "$500M+ Total Ransom Demands & Extortion Payments",
    initialAccessVector: "Initial Access Broker (IAB) VPN/RDP Credentials & Citrix Bleed Exploitation",
    c2InfrastructureType: "TOR_HIDDEN_SERVICE",
    fastFluxTelemetry: {
      domainCount: 18,
      activeIpPool: ["185.220.101.5", "109.70.100.28", "185.195.236.44", "195.123.245.19"],
      meanTtlSeconds: 300,
      nameservers: ["tor-relay-ns1.onion", "tor-relay-ns2.onion"],
      asns: [
        { asn: "AS44050", org: "Alexhost SRL", country: "MD" },
        { asn: "AS204957", org: "Green Floid LLC", country: "RU" }
      ],
      ja3Hash: "6c781928371928301928371928301928",
      sslCertSerial: "33:19:bb:aa:22:99:cc:dd",
      sslIssuer: "LockBit Custom Onion Self-Signed Cert"
    }
  },
  {
    id: "CAMP-VOLT-01",
    name: "KV-Botnet SOHO Mesh & LotL Pre-Positioning",
    actor: "VOLT_TYPHOON",
    actorName: "Volt Typhoon (Bronze Silhouette / Vanguard Panda)",
    sponsorState: "People's Republic of China (MSS / PLA)",
    yearRange: "2021 - 2026",
    status: "ACTIVE",
    targetedSectors: ["Water Treatment Facilities", "Port Authorities", "Power Grids", "Defense Communications"],
    targetedRegions: ["United States (Guam / Continental US)", "Taiwan", "Indo-Pacific"],
    malwarePayloads: ["KV-Botnet MIPS Proxy", "Fast Reverse Proxies (FRP)", "Earthworm", "Living-off-the-Land Scripts"],
    mitreTTPs: [
      { id: "T1090.002", name: "External Proxy: Multi-hop SOHO Router Mesh" },
      { id: "T1059.001", name: "Command and Scripting: PowerShell/WMI" },
      { id: "T1078.002", name: "Domain Accounts (Pre-positioned)" },
      { id: "T1046", name: "Network Service Discovery" }
    ],
    description: "Volt Typhoon pre-positions access inside critical infrastructure subnets. Never drops compiled disk malware; exclusively uses built-in administrative tools (netsh, ntdsutil, wmic) routed through thousands of compromised Fortinet/Cisco/Netgear SOHO routers (KV-Botnet) to evade anomaly telemetry.",
    financialImpact: "Geopolitical Deterrence & Critical Infrastructure Pre-positioning",
    initialAccessVector: "Zero-Day Exploitation of Edge VPN Appliances (FortiOS, Ivanti, Citrix)",
    c2InfrastructureType: "P2P_MESH",
    fastFluxTelemetry: {
      domainCount: 50,
      activeIpPool: ["72.14.201.88", "162.243.14.9", "198.199.112.4", "104.248.55.190"],
      meanTtlSeconds: 120,
      nameservers: ["dynamic-p2p.kvmesh.internal"],
      asns: [
        { asn: "AS7018", org: "AT&T Residential SOHO", country: "US" },
        { asn: "AS7922", org: "Comcast Cable SOHO", country: "US" },
        { asn: "AS20115", org: "Charter Communications", country: "US" }
      ],
      ja3Hash: "e1928371928371928371928371928371",
      sslCertSerial: "77:88:99:aa:bb:cc:dd:ee",
      sslIssuer: "Standard Residential TLS Certificate"
    }
  }
];

const IOC_CORRELATIONS: IOCCorrelationItem[] = [
  {
    id: "IOC-001",
    iocValue: "185.193.124.9",
    iocType: "IP",
    campaignsInvolved: ["Operation Troy / AppleJeus", "Carbanak ATM Heists"],
    actorsInvolved: ["LAZARUS", "FIN7"],
    firstObserved: "2023-04-12",
    confidenceScore: 0.96,
    overlapRating: "CRITICAL"
  },
  {
    id: "IOC-002",
    iocValue: "e7d705a3286e19ea42f587b344ee6865",
    iocType: "JA3",
    campaignsInvolved: ["AppleJeus Cryptocurrency Thefts", "Fallchill Recon"],
    actorsInvolved: ["LAZARUS"],
    firstObserved: "2022-09-18",
    confidenceScore: 0.99,
    overlapRating: "CRITICAL"
  },
  {
    id: "IOC-003",
    iocValue: "AS44050 (Alexhost SRL)",
    iocType: "IP",
    campaignsInvolved: ["Industroyer2 Grid Sabotage", "LockBit 3.0 Black Cartel", "AppleJeus Thefts"],
    actorsInvolved: ["SANDWORM", "LOCKBIT", "LAZARUS"],
    firstObserved: "2021-02-14",
    confidenceScore: 0.94,
    overlapRating: "HIGH"
  },
  {
    id: "IOC-004",
    iocValue: "f34d5f2d4577ed6d9ceec516c1f5a744",
    iocType: "IMPHASH",
    campaignsInvolved: ["WannaCry SMB Worm", "HermeticWiper Sabotage"],
    actorsInvolved: ["LAZARUS", "SANDWORM"],
    firstObserved: "2017-05-12",
    confidenceScore: 0.91,
    overlapRating: "MODERATE"
  },
  {
    id: "IOC-005",
    iocValue: "Global\\MsWinZonesCacheCounterMutexA",
    iocType: "MUTEX",
    campaignsInvolved: ["WannaCry Ransomware", "AppleJeus Phase 2"],
    actorsInvolved: ["LAZARUS"],
    firstObserved: "2017-05-12",
    confidenceScore: 0.98,
    overlapRating: "CRITICAL"
  },
  {
    id: "IOC-006",
    iocValue: "185.220.101.5",
    iocType: "IP",
    campaignsInvolved: ["Industroyer2 C2 Relay", "LockBit 3.0 Payment Portal"],
    actorsInvolved: ["SANDWORM", "LOCKBIT"],
    firstObserved: "2023-11-05",
    confidenceScore: 0.92,
    overlapRating: "HIGH"
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CampaignTrackerPage() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("CAMP-LAZ-01");
  const [activeTab, setActiveTab] = useState<"TIMELINE" | "FAST_FLUX_RADAR" | "CORRELATION_MATRIX" | "STIX_BUNDLE">("FAST_FLUX_RADAR");
  const [actorFilter, setActorFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fluxRotationIndex, setFluxRotationIndex] = useState<number>(0);
  const [isFluxSimulating, setIsFluxSimulating] = useState<boolean>(true);
  const [copiedStix, setCopiedStix] = useState<boolean>(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<FastFluxNode | null>(null);

  // Selected Campaign
  const currentCampaign = useMemo(() => {
    return APT_CAMPAIGNS.find((c) => c.id === selectedCampaignId) || APT_CAMPAIGNS[0];
  }, [selectedCampaignId]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return APT_CAMPAIGNS.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchActor = actorFilter === "ALL" || c.actor === actorFilter;
      const matchSector = sectorFilter === "ALL" || c.targetedSectors.some((s) => s.toLowerCase().includes(sectorFilter.toLowerCase()));
      return matchSearch && matchActor && matchSector;
    });
  }, [searchQuery, actorFilter, sectorFilter]);

  // Fast-Flux Live Rotation Timer
  useEffect(() => {
    if (!isFluxSimulating) return;
    const interval = setInterval(() => {
      setFluxRotationIndex((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [isFluxSimulating]);

  // Generate Interactive Fast-Flux Nodes based on Active Campaign
  const fluxGraphData = useMemo(() => {
    const pool = currentCampaign.fastFluxTelemetry.activeIpPool;
    const asns = currentCampaign.fastFluxTelemetry.asns;

    const nodes: FastFluxNode[] = [
      // Mothership C2
      { id: "node_mothership", type: "MOTHERSHIP", label: "Hidden Mothership C2", subLabel: "Tor Relay / Bulletproof Origin", x: 400, y: 70, status: "ACTIVE_RESOLVING" },
      // Dynamic Domain
      { id: "node_domain", type: "DOMAIN", label: currentCampaign.fastFluxTelemetry.nameservers[0] || "c2.fastflux-pool.org", subLabel: `TTL: ${currentCampaign.fastFluxTelemetry.meanTtlSeconds}s Dynamic DNS`, x: 400, y: 190, status: "ACTIVE_RESOLVING" },
      // SSL Cert
      { id: "node_ssl", type: "SSL_CERT", label: "Cluster SSL Cert", subLabel: `JA3: ${currentCampaign.fastFluxTelemetry.ja3Hash.slice(0, 8)}...`, x: 160, y: 190, status: "ACTIVE_RESOLVING" }
    ];

    // IP Pool Nodes
    pool.forEach((ip, idx) => {
      const angle = (idx / pool.length) * Math.PI * 0.9 + 0.1 * Math.PI;
      const radius = 170;
      const posX = 400 + Math.cos(angle + Math.PI / 2) * radius;
      const posY = 200 + Math.sin(angle + Math.PI / 2) * radius;
      const isCurrentActive = idx === fluxRotationIndex;

      nodes.push({
        id: `node_ip_${idx}`,
        type: "FAST_FLUX_IP",
        label: ip,
        subLabel: isCurrentActive ? "⚡ ACTIVE (Responding)" : "⏳ TTL Standby",
        x: Math.round(posX),
        y: Math.round(posY),
        status: isCurrentActive ? "ACTIVE_RESOLVING" : "EXPIRED_TTL",
        country: asns[idx % asns.length]?.country || "XX",
        asn: asns[idx % asns.length]?.asn || "AS-UNKNOWN"
      });
    });

    // Bulletproof ASNs
    asns.forEach((asn, aIdx) => {
      nodes.push({
        id: `node_asn_${aIdx}`,
        type: "BULLETPROOF_ASN",
        label: `${asn.asn} (${asn.country})`,
        subLabel: asn.org,
        x: 650,
        y: 120 + aIdx * 90,
        status: "FLAGGED",
        asn: asn.asn,
        country: asn.country
      });
    });

    const edges: FastFluxEdge[] = [
      { from: "node_mothership", to: "node_domain", type: "AUTH_NS" },
      { from: "node_ssl", to: "node_domain", type: "ENCRYPTED_WITH" }
    ];

    pool.forEach((_, idx) => {
      edges.push({ from: "node_domain", to: `node_ip_${idx}`, type: "RESOLVES_TO" });
    });

    asns.forEach((_, aIdx) => {
      edges.push({ from: `node_ip_${aIdx % pool.length}`, to: `node_asn_${aIdx}`, type: "ROUTED_VIA" });
    });

    return { nodes, edges };
  }, [currentCampaign, fluxRotationIndex]);

  // STIX 2.1 JSON Generator
  const stixBundleJson = useMemo(() => {
    const bundle = {
      type: "bundle",
      id: `bundle--${currentCampaign.id.toLowerCase()}-stix21`,
      spec_version: "2.1",
      objects: [
        {
          type: "threat-actor",
          id: `threat-actor--${currentCampaign.actor.toLowerCase()}`,
          name: currentCampaign.actorName,
          description: currentCampaign.description,
          threat_actor_types: ["nation-state", "financial-crime"],
          country: currentCampaign.sponsorState,
          sophistication: "advanced"
        },
        {
          type: "campaign",
          id: `campaign--${currentCampaign.id.toLowerCase()}`,
          name: currentCampaign.name,
          first_seen: currentCampaign.yearRange.split("-")[0].trim(),
          objective: currentCampaign.financialImpact
        },
        ...currentCampaign.fastFluxTelemetry.activeIpPool.map((ip, i) => ({
          type: "indicator",
          id: `indicator--ip-${i}`,
          pattern: `[ipv4-addr:value = '${ip}']`,
          pattern_type: "stix",
          name: `Fast-Flux C2 IP: ${ip}`,
          valid_from: "2026-01-01T00:00:00Z"
        }))
      ]
    };
    return JSON.stringify(bundle, null, 2);
  }, [currentCampaign]);

  const handleCopyStix = () => {
    navigator.clipboard.writeText(stixBundleJson);
    setCopiedStix(true);
    setTimeout(() => setCopiedStix(false), 2000);
  };

  return (
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ================= TOP HEADER & TELEMETRY ================= */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                background: "rgba(6,182,212,0.15)",
                color: "var(--primary)",
                padding: "6px 10px",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.05em"
              }}>
                <Radar size={16} />
                GLOBAL APT &amp; FAST-FLUX RADAR
              </div>
              <span className="badge-critical">PASSIVE DNS TELEMETRY</span>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>BGP Asymmetric Route Tracker</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--fg)" }}>
              Nation-State Campaign Explorer &amp; Dynamic DNS Fast-Flux Radar
            </h1>
            <p style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 2, maxWidth: 950 }}>
              Real-time monitoring of revolving IP pools, double-flux mothership C2 nodes, bulletproof hosting ASNs, and historical IOC correlation matrices across global geopolitical cyber adversaries.
            </p>
          </div>

          {/* Campaign Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Active Campaign:</span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="tool-select"
              style={{ fontWeight: 700, minWidth: 320, borderColor: "var(--primary)" }}
            >
              {APT_CAMPAIGNS.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  [{camp.actor}] {camp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campaign Dossier Banner */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr",
          gap: 12,
          background: "var(--bg-dark)",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid var(--border)"
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Threat Actor &amp; Origin</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>{currentCampaign.actorName}</div>
            <div style={{ fontSize: 11, color: "#38bdf8", fontFamily: "monospace" }}>Sponsor: {currentCampaign.sponsorState}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>Primary Impact &amp; Target</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--red)", marginTop: 2 }}>{currentCampaign.financialImpact}</div>
            <div style={{ fontSize: 11, color: "var(--fg-2)" }}>{currentCampaign.targetedSectors.slice(0, 2).join(", ")}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>C2 Architecture</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginTop: 2 }}>{currentCampaign.c2InfrastructureType}</div>
            <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "monospace" }}>Avg TTL: {currentCampaign.fastFluxTelemetry.meanTtlSeconds}s (Revolving Pool)</div>
          </div>
        </div>
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        paddingBottom: 4,
        gap: 8,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setActiveTab("FAST_FLUX_RADAR")}
            className={activeTab === "FAST_FLUX_RADAR" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Radar size={13} />
            Passive DNS Fast-Flux Radar
          </button>
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={activeTab === "TIMELINE" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Clock size={13} />
            Geopolitical Campaign Timeline
          </button>
          <button
            onClick={() => setActiveTab("CORRELATION_MATRIX")}
            className={activeTab === "CORRELATION_MATRIX" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Share2 size={13} />
            Cross-Campaign IOC Correlation Matrix
          </button>
          <button
            onClick={() => setActiveTab("STIX_BUNDLE")}
            className={activeTab === "STIX_BUNDLE" ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}
          >
            <Download size={13} />
            STIX 2.1 Threat Feed Export
          </button>
        </div>

        {activeTab === "FAST_FLUX_RADAR" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setIsFluxSimulating(!isFluxSimulating)}
              className={isFluxSimulating ? "btn-success" : "btn-secondary"}
              style={{ fontSize: 11 }}
            >
              <RefreshCw size={12} className={isFluxSimulating ? "animate-spin" : ""} />
              {isFluxSimulating ? "Fast-Flux Live Rotation: ON" : "Simulation Paused"}
            </button>
          </div>
        )}
      </div>

      {/* ================= TAB 1: PASSIVE DNS FAST-FLUX RADAR ================= */}
      {activeTab === "FAST_FLUX_RADAR" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          {/* Main Network Graph Visualization Canvas */}
          <div style={{
            background: "#03060c",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            minHeight: 580,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                  Dynamic Infrastructure Topology: {currentCampaign.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  ({currentCampaign.fastFluxTelemetry.activeIpPool.length} Revolving IPs, {currentCampaign.fastFluxTelemetry.asns.length} Bulletproof ASNs)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} /> Mothership
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4" }} /> Fast-Flux Pool
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} /> Bulletproof ASN
                </span>
              </div>
            </div>

            {/* Radar Visualizer Box */}
            <div style={{
              flex: 1,
              position: "relative",
              background: "radial-gradient(circle, #0e1422 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              minHeight: 480,
              overflow: "auto"
            }}>
              <svg width="800" height="480" viewBox="0 0 800 480" style={{ width: "100%", height: "100%" }}>
                {/* Radar Concentric Circles */}
                <circle cx="400" cy="240" r="80" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
                <circle cx="400" cy="240" r="160" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="1" />
                <circle cx="400" cy="240" r="230" fill="none" stroke="rgba(6,182,212,0.05)" strokeWidth="1" />

                {/* Edges */}
                {fluxGraphData.edges.map((edge, eIdx) => {
                  const fromNode = fluxGraphData.nodes.find((n) => n.id === edge.from);
                  const toNode = fluxGraphData.nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  let strokeColor = "rgba(255, 255, 255, 0.15)";
                  let isDashed = false;
                  if (edge.type === "RESOLVES_TO") {
                    strokeColor = toNode.status === "ACTIVE_RESOLVING" ? "#10b981" : "rgba(6,182,212,0.2)";
                  } else if (edge.type === "AUTH_NS") {
                    strokeColor = "#ef4444";
                    isDashed = true;
                  } else if (edge.type === "ROUTED_VIA") {
                    strokeColor = "rgba(245,158,11,0.4)";
                  }

                  return (
                    <line
                      key={eIdx}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={strokeColor}
                      strokeWidth={edge.type === "RESOLVES_TO" && toNode.status === "ACTIVE_RESOLVING" ? 2.5 : 1.2}
                      strokeDasharray={isDashed ? "4 4" : undefined}
                    />
                  );
                })}

                {/* Nodes */}
                {fluxGraphData.nodes.map((node) => {
                  let fillColor = "#1e293b";
                  let strokeColor = "#475569";
                  let radius = 16;

                  if (node.type === "MOTHERSHIP") {
                    fillColor = "rgba(239,68,68,0.2)";
                    strokeColor = "#ef4444";
                    radius = 20;
                  } else if (node.type === "DOMAIN") {
                    fillColor = "rgba(6,182,212,0.2)";
                    strokeColor = "#06b6d4";
                    radius = 18;
                  } else if (node.type === "FAST_FLUX_IP") {
                    fillColor = node.status === "ACTIVE_RESOLVING" ? "rgba(16,185,129,0.25)" : "#0f172a";
                    strokeColor = node.status === "ACTIVE_RESOLVING" ? "#10b981" : "#334155";
                    radius = node.status === "ACTIVE_RESOLVING" ? 18 : 14;
                  } else if (node.type === "BULLETPROOF_ASN") {
                    fillColor = "rgba(245,158,11,0.15)";
                    strokeColor = "#f59e0b";
                    radius = 16;
                  } else if (node.type === "SSL_CERT") {
                    fillColor = "rgba(168,85,247,0.15)";
                    strokeColor = "#a855f7";
                    radius = 15;
                  }

                  const isSelected = selectedNodeDetails?.id === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => setSelectedNodeDetails(node)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Outer pulse for active node */}
                      {node.status === "ACTIVE_RESOLVING" && (
                        <circle
                          r={radius + 8}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="1.5"
                          opacity="0.4"
                          className="animate-ping"
                        />
                      )}

                      <circle
                        r={radius}
                        fill={fillColor}
                        stroke={isSelected ? "#ffffff" : strokeColor}
                        strokeWidth={isSelected ? 3 : 2}
                      />

                      {/* Text Tag Below Node */}
                      <text
                        y={radius + 12}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {node.label}
                      </text>

                      {node.subLabel && (
                        <text
                          y={radius + 23}
                          textAnchor="middle"
                          fill="var(--muted)"
                          fontSize="8"
                          fontFamily="monospace"
                        >
                          {node.subLabel}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Inspector Box */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
              <Server size={14} color="var(--primary)" />
              Infrastructure Inspector
            </div>

            {selectedNodeDetails ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--fg)", fontFamily: "monospace" }}>
                    {selectedNodeDetails.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>
                    Type: {selectedNodeDetails.type}
                  </div>
                </div>

                <div style={{ background: "var(--surface-2)", padding: 10, borderRadius: 6, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--muted)" }}>Status:</span>
                    <span style={{ fontWeight: 700, color: selectedNodeDetails.status === "ACTIVE_RESOLVING" ? "#10b981" : "#f59e0b" }}>
                      {selectedNodeDetails.status}
                    </span>
                  </div>
                  {selectedNodeDetails.country && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--muted)" }}>Country / Jurisdiction:</span>
                      <span style={{ fontFamily: "monospace" }}>{selectedNodeDetails.country}</span>
                    </div>
                  )}
                  {selectedNodeDetails.asn && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--muted)" }}>BGP ASN:</span>
                      <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{selectedNodeDetails.asn}</span>
                    </div>
                  )}
                </div>

                {/* Passive DNS History snippet */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                    Passive DNS Resolution Stream
                  </div>
                  <div style={{
                    background: "#020408",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontFamily: "monospace",
                    fontSize: 10.5,
                    color: "#94a3b8",
                    lineHeight: 1.6
                  }}>
                    <div>[2026-08-24 04:02:11 UTC] A -&gt; 185.193.124.9 (TTL 120)</div>
                    <div>[2026-08-24 04:00:11 UTC] A -&gt; 194.36.191.12 (TTL 120)</div>
                    <div>[2026-08-24 03:58:11 UTC] A -&gt; 45.148.10.88 (TTL 120)</div>
                    <div>[2026-08-24 03:56:11 UTC] A -&gt; 193.29.13.104 (TTL 120)</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 10px", color: "var(--muted)", textAlign: "center", gap: 8 }}>
                <Eye size={24} />
                <span style={{ fontSize: 12 }}>Click any node on the Passive DNS radar to inspect active resolving TTLs, BGP paths, and SSL fingerprints.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GEOPOLITICAL TIMELINE ================= */}
      {activeTab === "TIMELINE" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filters Bar */}
          <div style={{
            background: "var(--surface)",
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 360 }}>
              <Search size={14} color="var(--muted)" />
              <input
                type="text"
                placeholder="Search campaigns, payloads, or actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tool-input"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11 }}
              >
                <option value="ALL">All Threat Groups</option>
                <option value="LAZARUS">Lazarus Group (DPRK)</option>
                <option value="SANDWORM">Sandworm Team (GRU)</option>
                <option value="COZY_BEAR">Cozy Bear (SVR)</option>
                <option value="FIN7">FIN7 Cybercrime</option>
                <option value="LOCKBIT">LockBit RaaS</option>
                <option value="VOLT_TYPHOON">Volt Typhoon (MSS)</option>
              </select>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="tool-select"
                style={{ fontSize: 11 }}
              >
                <option value="ALL">All Sectors</option>
                <option value="Cryptocurrency">Crypto &amp; DeFi</option>
                <option value="Electrical">Critical Infrastructure / Energy</option>
                <option value="Supply Chain">IT &amp; Supply Chain</option>
                <option value="Healthcare">Healthcare &amp; Hospital</option>
              </select>
            </div>
          </div>

          {/* Timeline Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredCampaigns.map((camp) => {
              const isSelected = camp.id === selectedCampaignId;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  style={{
                    background: isSelected ? "rgba(6,182,212,0.06)" : "var(--surface)",
                    border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "16px 20px",
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 220px",
                    gap: 16,
                    cursor: "pointer",
                    transition: "all 0.12s ease"
                  }}
                >
                  {/* Left: Metadata */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span className="badge-critical" style={{ width: "fit-content" }}>
                      {camp.yearRange}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>
                      {camp.actorName}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {camp.sponsorState}
                    </span>
                  </div>

                  {/* Middle: Campaign Overview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isSelected ? "var(--primary)" : "var(--fg)" }}>
                      {camp.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>
                      {camp.description}
                    </div>

                    {/* MITRE TTPs */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {camp.mitreTTPs.map((ttp, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: 10,
                            fontFamily: "monospace",
                            background: "var(--surface-2)",
                            color: "var(--fg)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "1px solid var(--border)"
                          }}
                        >
                          {ttp.id}: {ttp.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Payloads & Access Vector */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                    <div style={{ color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", fontSize: 10 }}>Weaponized Payloads:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {camp.malwarePayloads.map((p, pIdx) => (
                        <span key={pIdx} style={{ fontSize: 10.5, color: "#34d399", background: "rgba(16,185,129,0.1)", padding: "1px 5px", borderRadius: 3, border: "1px solid rgba(16,185,129,0.2)" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 6, color: "var(--red)", fontWeight: 700 }}>
                      {camp.financialImpact}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CROSS-CAMPAIGN IOC CORRELATION MATRIX ================= */}
      {activeTab === "CORRELATION_MATRIX" && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--fg)" }}>
              Historical IOC Reuse &amp; Actor Cross-Pollination Matrix
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Correlates shared infrastructure, identical JA3/TLS fingerprints, bulletproof hosting ASNs, and crypto keys across distinct cyber campaigns.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="cerberus-table">
              <thead>
                <tr>
                  <th>Indicator of Compromise (IOC)</th>
                  <th>IOC Type</th>
                  <th>Campaigns Involved</th>
                  <th>Actors Involved</th>
                  <th>First Observed</th>
                  <th>Confidence</th>
                  <th>Overlap Severity</th>
                </tr>
              </thead>
              <tbody>
                {IOC_CORRELATIONS.map((ioc) => (
                  <tr key={ioc.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                      {ioc.iocValue}
                    </td>
                    <td>
                      <span style={{ fontSize: 10, background: "var(--surface-3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                        {ioc.iocType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {ioc.campaignsInvolved.map((c, idx) => (
                          <span key={idx} style={{ fontSize: 11, color: "var(--fg-2)" }}>• {c}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {ioc.actorsInvolved.map((actor, aIdx) => (
                          <span key={aIdx} className="badge-critical" style={{ fontSize: 9 }}>
                            {actor}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--muted)" }}>{ioc.firstObserved}</td>
                    <td style={{ fontFamily: "monospace", color: "#10b981", fontWeight: 700 }}>
                      {Math.round(ioc.confidenceScore * 100)}%
                    </td>
                    <td>
                      {ioc.overlapRating === "CRITICAL" && <span className="badge-critical">CRITICAL REUSE</span>}
                      {ioc.overlapRating === "HIGH" && <span className="badge-high">HIGH OVERLAP</span>}
                      {ioc.overlapRating === "MODERATE" && <span className="badge-medium">MODERATE</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: STIX 2.1 BUNDLE EXPORT ================= */}
      {activeTab === "STIX_BUNDLE" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 6 }}>
                <Download size={14} color="var(--primary)" />
                Generated STIX 2.1 JSON Threat Bundle
              </div>
              <button
                onClick={handleCopyStix}
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: 11 }}
              >
                {copiedStix ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copiedStix ? "Copied" : "Copy JSON"}
              </button>
            </div>

            <div style={{
              background: "#020408",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 12,
              fontFamily: "monospace",
              fontSize: 11,
              color: "#94a3b8",
              lineHeight: 1.5,
              maxHeight: 480,
              overflowY: "auto",
              whiteSpace: "pre"
            }}>
              {stixBundleJson}
            </div>
          </div>

          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--fg)" }}>SIEM &amp; TAXII Integrations</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              Export this STIX 2.1 intelligence bundle directly into enterprise SOAR or SIEM tools (Splunk, Microsoft Sentinel, Cortex XSOAR, OpenCTI, MISP).
            </div>

            <button
              onClick={() => {
                const blob = new Blob([stixBundleJson], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${currentCampaign.id}_stix21_bundle.json`;
                a.click();
              }}
              className="btn-primary"
              style={{ justifyContent: "center", fontSize: 12 }}
            >
              <Download size={13} /> Download STIX 2.1 JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
