"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import {
  Volume2,
  VolumeX,
  Play,
  Award,
  Mic,
  BookOpen,
  Home,
  ExternalLink,
  Film,
  Sparkles,
} from "lucide-react"
import { ConnectLnStudioPlayer } from "./ConnectLnStudioPlayer"

export interface ConnectLnProfessionAnimatedVideoProps {
  professionId?: string
  professionTitle?: string
  enclaveId?: string
  compact?: boolean
  mode?: "home_compact" | "full_learn"
  userName?: string
  className?: string
}

export interface SubjectReferenceLink {
  label: string
  url: string
  kind: "standard" | "creator" | "enclave"
}

export interface AnimatedLearnCourseItem {
  id: string
  type: "Course" | "Video"
  badge?: "Popular" | "New"
  duration: string
  scene: string
  title: string
  author: string
  authorTitle: string
  youtubeId: string
  updatedDate: string
  fromCourse?: string
  progressLeft?: string
  progressPct?: number
  learnersCount?: string
  likedBy?: string
  enclaveGroup: string
  skillTag: string
  subjectDeepDive: string
  voiceScript: string
  modules: string[]
  referenceLinks: SubjectReferenceLink[]
}

export interface CourseShelfDefinition {
  id: string
  title: string
  pills?: string[]
  courses: AnimatedLearnCourseItem[]
}

// ============================================================================
// REAL INTERNET CREATORS & CONNECTLN PROFESSIONAL ENCLAVE SUBJECT CATALOG
// Every subject is paired with real internet/YouTube technical educators,
// deep technical standards breakdowns, reference links, and verifiable videos.
// ============================================================================
const CONNECTLN_COURSE_CATALOG: AnimatedLearnCourseItem[] = [
  // ── SHELF 1: Cybersecurity, Zero Trust & Enterprise Architecture ──
  {
    id: "cln-cissp",
    type: "Course",
    badge: "Popular",
    duration: "6h 45m",
    scene: "sovereign_zero_trust_vault",
    title: "Enterprise Security Architecture & Zero-Trust IAM Mastery (8 Core Domains)",
    author: "IBM Cloud & Security Architecture",
    authorTitle: "Principal Enterprise Security & Zero-Trust Fellows",
    youtubeId: "tRCvagjqx3c",
    updatedDate: "Updated 2026",
    progressLeft: "4h 10m left",
    progressPct: 38,
    learnersCount: "18,420 learners",
    enclaveGroup: "tech_cybersecurity",
    skillTag: "ISO 27001",
    subjectDeepDive:
      "Comprehensive engineering breakdown of enterprise security governance, NIST SP 800-207 Zero-Trust Architecture, cryptographic key lifecycle management (FIPS 140-3 / KMS HSMs), mutual TLS service-mesh authentication, and continuous SOC telemetry.",
    voiceScript:
      "Welcome to Enterprise Security Architecture and Zero-Trust Identity Mastery, presented with IBM Cloud and Security Architecture. In this briefing we examine all eight security domains: risk governance, asset classification, zero-trust microsegmentation under NIST 800-207, hardware security module cryptography, and continuous incident recovery.",
    modules: [
      "1. NIST SP 800-207 Zero-Trust Policy Engines & Microsegmentation",
      "2. FIPS 140-3 Hardware Security Modules & Envelope Encryption",
      "3. Continuous SOC Telemetry, Threat Hunting & Recovery",
    ],
    referenceLinks: [
      {
        label: "NIST SP 800-207 Zero Trust Architecture Standard",
        url: "https://csrc.nist.gov/pubs/sp/800/207/final",
        kind: "standard",
      },
      {
        label: "IBM Technology & Security Architecture Channel",
        url: "https://www.youtube.com/@IBMTechnology",
        kind: "creator",
      },
      {
        label: "ISO/IEC 27001 Information Security Controls Reference",
        url: "https://www.iso.org/standard/27001",
        kind: "enclave",
      },
    ],
  },
  {
    id: "cln-ai-cyber",
    type: "Course",
    badge: "Popular",
    duration: "2h 15m",
    scene: "sovereign_ai_neural_lattice",
    title: "Autonomous AI Threat Hunting, Behavioral SOC Analytics & LLM Guardrails",
    author: "IBM Cloud & Security Architecture",
    authorTitle: "AI Security & Autonomous SOC Engineering Desk",
    youtubeId: "zs7jjD7vAaQ",
    updatedDate: "Updated 2026",
    likedBy: "Rhoda Mensah · Senior Cyber Compliance Lead recommends this",
    learnersCount: "11,240 learners",
    enclaveGroup: "tech_cybersecurity",
    skillTag: "Cyber Operations",
    subjectDeepDive:
      "Deep technical exploration of MITRE ATLAS adversarial machine-learning defense, real-time SIEM/XDR behavioral anomaly scoring, prompt-injection containment boundaries, and automated SOAR containment playbooks.",
    voiceScript:
      "In Autonomous AI Threat Hunting and Behavioral SOC Analytics, we explore how modern security operations centers combine behavioral baseline telemetry with MITRE ATLAS guardrails to isolate lateral movement and stop adversarial model exploitation in real time.",
    modules: [
      "1. MITRE ATLAS Threat Matrix & Behavioral Anomaly Scoring",
      "2. Adversarial Prompt & RAG Pipeline Isolation Guardrails",
      "3. Automated SOAR Containment & Playbook Execution",
    ],
    referenceLinks: [
      {
        label: "MITRE ATLAS Adversarial Threat Landscape for AI Systems",
        url: "https://atlas.mitre.org/",
        kind: "standard",
      },
      {
        label: "NIST AI Risk Management Framework (AI RMF 1.0)",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        kind: "standard",
      },
      {
        label: "IBM Technology AI & Cybersecurity Briefings",
        url: "https://www.youtube.com/@IBMTechnology",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-cyber-foundations",
    type: "Course",
    badge: "Popular",
    duration: "3h 30m",
    scene: "sovereign_crypto_matrix",
    title: "Active Directory Lateral Movement, Kerberos Hardening & Tier-0 Defense",
    author: "Offensive Security Guild",
    authorTitle: "Principal Red Team & Enterprise Defense Architects",
    youtubeId: "tRCvagjqx3c",
    updatedDate: "Updated 2026",
    learnersCount: "24,800 learners",
    enclaveGroup: "tech_cybersecurity",
    skillTag: "Red Teaming",
    subjectDeepDive:
      "Hands-on technical analysis of Kerberoasting, AS-REP roasting, BloodHound attack-path graph traversal, AES-256 Kerberos ticket enforcement, Protected Users security groups, and Tier-0 domain controller isolation.",
    voiceScript:
      "This briefing from the Offensive Security Guild dissects Active Directory lateral movement and Kerberos defense. You will trace how attackers enumerate service principal names and how defenders lock down Tier-0 domain controllers with AES-256 ticket encryption and Protected Users groups.",
    modules: [
      "1. BloodHound Attack-Path Graph Analysis & Tier-0 Boundaries",
      "2. AES-256 Kerberos Hardening & Honeypot SPN Sensors",
      "3. Protected Users Group & Credential Guard Enforcement",
    ],
    referenceLinks: [
      {
        label: "MITRE ATT&CK Enterprise Matrix — Credential Access & Lateral Movement",
        url: "https://attack.mitre.org/",
        kind: "standard",
      },
      {
        label: "CISA Active Directory & Identity Hardening Guide",
        url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
        kind: "standard",
      },
      {
        label: "John Hammond & Offensive Security Research Channel",
        url: "https://www.youtube.com/@_JohnHammond",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-isaca-cism",
    type: "Course",
    badge: "Popular",
    duration: "5h 10m",
    scene: "sovereign_cmmc_govcloud",
    title: "DoD CMMC 2.0 Level 2 & NIST SP 800-171 Controlled Unclassified Information (CUI)",
    author: "Defense Contractors Council",
    authorTitle: "Certified CMMC Assessors & GovCloud Architects",
    youtubeId: "fck0ZEbJ88M",
    updatedDate: "Updated 2026",
    learnersCount: "13,510 learners",
    enclaveGroup: "tech_cybersecurity",
    skillTag: "ISO 27001",
    subjectDeepDive:
      "End-to-end implementation of the 110 security requirements in NIST SP 800-171 Rev 2/3 for DoD CMMC 2.0 Level 2 certification: scoping the CUI enclave boundary, FIPS-validated cryptographic modules, System Security Plans (SSP), and POA&M remediation.",
    voiceScript:
      "Presented by the Defense Contractors Council, this course walks through all 110 NIST 800-171 controls required for DoD CMMC 2.0 Level 2 compliance. Learn how to scope your Controlled Unclassified Information enclave boundary, enforce FIPS 140-3 encryption, and maintain an audit-ready System Security Plan.",
    modules: [
      "1. CUI Enclave Boundary Scoping & FedRAMP High Equivalence",
      "2. 110 NIST SP 800-171 Controls & FIPS 140-3 Validation",
      "3. System Security Plans (SSP) & SPRS Score Calculation",
    ],
    referenceLinks: [
      {
        label: "NIST SP 800-171 Protecting CUI in Nonfederal Systems",
        url: "https://csrc.nist.gov/pubs/sp/800/171/r3/final",
        kind: "standard",
      },
      {
        label: "DoD CIO Official CMMC 2.0 Program Documentation",
        url: "https://dodcio.defense.gov/CMMC/",
        kind: "standard",
      },
      {
        label: "GovCloud & CMMC Compliance Briefings Archive",
        url: "https://www.youtube.com/results?search_query=CMMC+2.0+NIST+800-171+Architecture",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-scada-ot",
    type: "Course",
    badge: "Popular",
    duration: "4h 20m",
    scene: "sovereign_scada_diode",
    title: "Critical Infrastructure SCADA / ICS Air-Gap Security & Purdue Model Segmentation",
    author: "Industrial Cyber Defense Institute",
    authorTitle: "Operational Technology (OT) & PLC Security Engineers",
    youtubeId: "zs7jjD7vAaQ",
    updatedDate: "Updated 2026",
    learnersCount: "9,840 learners",
    enclaveGroup: "tech_cybersecurity",
    skillTag: "Incident Response",
    subjectDeepDive:
      "Securing Level 0–3 industrial control systems under IEC 62443 and NIST SP 800-82: hardware unidirectional security gateways (optical data diodes), Modbus/DNP3 deep packet inspection, and anomaly detection on PLC ladder logic writes.",
    voiceScript:
      "Welcome to Critical Infrastructure SCADA and Industrial Control System Security. We examine the Purdue Model from Level 0 field sensors to Level 3 plant operations, deploying optical unidirectional data diodes and inspecting Modbus and DNP3 traffic without disrupting deterministic plant control loops.",
    modules: [
      "1. Purdue Model Levels 0–3 & IEC 62443 Zone Conduits",
      "2. Hardware Optical Data Diodes & Unidirectional Telemetry",
      "3. Modbus / DNP3 Protocol Inspection & PLC Firmware Attestation",
    ],
    referenceLinks: [
      {
        label: "NIST SP 800-82 Guide to Operational Technology (OT) Security",
        url: "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
        kind: "standard",
      },
      {
        label: "CISA Industrial Control Systems (ICS) Advisories & Guides",
        url: "https://www.cisa.gov/topics/industrial-control-systems",
        kind: "standard",
      },
      {
        label: "Industrial OT & SCADA Security Engineering Briefings",
        url: "https://www.youtube.com/results?search_query=IEC+62443+Purdue+Model+OT+Security",
        kind: "creator",
      },
    ],
  },

  // ── SHELF 2: Cloud Native, Kubernetes, Linux & Distributed Systems ──
  {
    id: "cln-k8s-ebpf",
    type: "Course",
    badge: "Popular",
    duration: "4h 55m",
    scene: "sovereign_k8s_ebpf_mesh",
    title: "Production Kubernetes Hardening, Cilium eBPF Networking & Kernel Observability",
    author: "Cloud Native Computing Guild",
    authorTitle: "Principal Platform SREs & eBPF Kernel Architects",
    youtubeId: "slJP_CS5XcE",
    updatedDate: "Updated 2026",
    learnersCount: "19,400 learners",
    enclaveGroup: "tech_software",
    skillTag: "Cloud",
    subjectDeepDive:
      "Kernel-level socket routing with Cilium eBPF to replace iptables overhead, enforcing Kubernetes Restricted Pod Security Standards (PSS), Tetragon real-time syscall enforcement, and zero-downtime Istio canary traffic shifting.",
    voiceScript:
      "In Production Kubernetes Hardening and Cilium eBPF Observability, the Cloud Native Computing Guild demonstrates how eBPF programs attach directly to Linux kernel socket hooks, eliminating iptables latency while enforcing L7 network policy and real-time syscall containment.",
    modules: [
      "1. Cilium eBPF Socket-Level Routing vs. Legacy iptables",
      "2. Restricted Pod Security Standards (PSS) & Seccomp Profiles",
      "3. Tetragon eBPF Kernel Syscall Tracing & Istio Canary Rollouts",
    ],
    referenceLinks: [
      {
        label: "CNCF Cilium & eBPF Kernel Networking Documentation",
        url: "https://cilium.io/",
        kind: "standard",
      },
      {
        label: "Kubernetes Official Pod Security Standards (PSS)",
        url: "https://kubernetes.io/docs/concepts/security/pod-security-standards/",
        kind: "standard",
      },
      {
        label: "Fireship & Cloud Native Architecture Channel",
        url: "https://www.youtube.com/@Fireship",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-distributed-raft",
    type: "Course",
    badge: "Popular",
    duration: "3h 40m",
    scene: "sovereign_raft_consensus",
    title: "Distributed Consensus, Raft Leader Election & Event-Driven Kafka Microservices",
    author: "Cloud Architecture Council",
    authorTitle: "Staff Distributed Systems & Storage Engineers",
    youtubeId: "ZyqAbQkpeUo",
    updatedDate: "Updated 2026",
    learnersCount: "16,820 learners",
    enclaveGroup: "tech_software",
    skillTag: "Bash",
    subjectDeepDive:
      "Formal mechanics of Raft quorum consensus (N/2 + 1), term-based leader election, log compaction, split-brain prevention via fencing tokens, and transactional outbox patterns over Apache Kafka.",
    voiceScript:
      "Presented by the Cloud Architecture Council, this course explores Raft distributed consensus and high-throughput event streaming. Discover why a strict majority quorum guarantees linearizable reads across network partitions and how transactional outbox tables prevent dual-write inconsistencies.",
    modules: [
      "1. Raft Leader Election, Log Replication & Majority Quorums",
      "2. Split-Brain Mitigation & Monotonic Fencing Tokens",
      "3. Idempotent Kafka Consumers & Transactional Outbox Design",
    ],
    referenceLinks: [
      {
        label: "The Raft Consensus Algorithm — Stanford Original Paper & Visualization",
        url: "https://raft.github.io/",
        kind: "standard",
      },
      {
        label: "MIT 6.824 Distributed Systems Engineering Lectures",
        url: "https://pdos.csail.mit.edu/6.824/",
        kind: "standard",
      },
      {
        label: "Fireship & Systems Engineering Deep-Dives",
        url: "https://www.youtube.com/@Fireship",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-substation-grid",
    type: "Course",
    badge: "Popular",
    duration: "4h 12m",
    scene: "sovereign_power_substation",
    title: "High-Voltage Substation Relay Protection (ANSI 87T), PMU Telemetry & Grid Stability",
    author: "Grady Hillhouse, PE · Practical Engineering",
    authorTitle: "Licensed Civil & Power Grid Infrastructure Engineer",
    youtubeId: "pDpIoeWDjuM",
    updatedDate: "Updated 2026",
    learnersCount: "22,150 learners",
    enclaveGroup: "telecom_digital_infrastructure",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "Substation transformer differential protection (ANSI Device 87T), synchrophasor Phasor Measurement Unit (PMU) telemetry, SF6 circuit-breaker arc quenching, Dissolved Gas Analysis (DGA), and black-start grid restoration.",
    voiceScript:
      "In High-Voltage Substation Relay Protection and Grid Stability, we examine how differential relays, SF6 high-voltage breakers, and synchrophasor telemetry protect multi-hundred-megavolt-ampere grid transformers and coordinate black-start restoration.",
    modules: [
      "1. ANSI 87T Transformer Differential & 50/51 Overcurrent Relays",
      "2. Dissolved Gas Analysis (DGA) & SF6 Breaker Arc Quenching",
      "3. NERC CIP Grid Telemetry & Black-Start Frequency Restoration",
    ],
    referenceLinks: [
      {
        label: "Practical Engineering (Grady Hillhouse, PE) Official Channel",
        url: "https://www.youtube.com/@PracticalEngineeringChannel",
        kind: "creator",
      },
      {
        label: "IEEE Power & Energy Society — Substation Protection Standards",
        url: "https://www.ieee-pes.org/",
        kind: "standard",
      },
      {
        label: "NERC Critical Infrastructure Protection (CIP) Standards",
        url: "https://www.nerc.com/pa/Stand/Pages/CIPStandards.aspx",
        kind: "standard",
      },
    ],
  },

  // ── SHELF 3: Skilled Trades, Heavy Timber, NEC Electrical, Welding & HVAC/R ──
  {
    id: "cln-heavy-timber-joinery",
    type: "Course",
    badge: "Popular",
    duration: "3h 45m",
    scene: "sovereign_timber_truss",
    title: "Heavy Timber Framing, Mortise-and-Tenon Joinery & Structural Staircase Layout",
    author: "Scott Wadsworth · Essential Craftsman",
    authorTitle: "Master Timber Framer, Blacksmith & General Contractor",
    youtubeId: "s84MJ7b1GNo",
    updatedDate: "Updated 2026",
    learnersCount: "28,400 learners",
    enclaveGroup: "trades_construction",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "Structural mechanics of Douglas Fir and White Oak hammer-beam trusses, drawbored mortise-and-tenon joinery with hand-split oak pegs, laser transit slab leveling, and stair stringer rise/run geometry under IRC code.",
    voiceScript:
      "Presented with Master Timber Framer Scott Wadsworth of Essential Craftsman and the ConnectLn Carpentry Enclave, this course covers drawbored mortise-and-tenon timber framing, tension and compression truss joints, laser transit layout over uneven foundations, and precision stair stringer geometry.",
    modules: [
      "1. Drawbored Mortise-and-Tenon Joinery & Oak Peg Shear Geometry",
      "2. Laser Transit Datum Leveling & Plumb Shear-Wall Framing",
      "3. Structural Staircase Stringer Layout & Moisture Calibration",
    ],
    referenceLinks: [
      {
        label: "Essential Craftsman (Scott Wadsworth) Official Channel",
        url: "https://www.youtube.com/@essentialcraftsman",
        kind: "creator",
      },
      {
        label: "Timber Framers Guild — Traditional & Heavy Timber Engineering",
        url: "https://www.tfguild.org/",
        kind: "standard",
      },
      {
        label: "This Old House Master Carpentry & Framing Archive",
        url: "https://www.youtube.com/@thisoldhouse",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-400a-electrical",
    type: "Course",
    badge: "Popular",
    duration: "3h 15m",
    scene: "sovereign_nec_400a_panel",
    title: "400A Service Panel Upgrades, NEC Article 250 Grounding & CAT IV Multimeter Diagnostics",
    author: "Dustin Stelzer · Electrician U",
    authorTitle: "Licensed Master Electrician · NEC Code & Distribution Educator",
    youtubeId: "gDozp7t7A0Y",
    updatedDate: "Updated 2026",
    learnersCount: "31,920 learners",
    enclaveGroup: "trades_construction",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "Master electrician walkthrough of 200A and 400A class-320 continuous service upgrades, NEC Article 250 Grounding Electrode System (GES) bonding, neutral-ground isolation in sub-panels, and NFPA 70E arc-flash LOTO.",
    voiceScript:
      "With Licensed Master Electrician Dustin Stelzer of Electrician U, we trace a complete 400-amp service upgrade from the utility transformer drop and CT meter base through NEC Article 250 grounding electrode bonding, main bonding jumpers, and balanced three-phase and split-phase load schedules.",
    modules: [
      "1. Class-320 400A Meter Base & Parallel 200A Panel Distribution",
      "2. NEC Article 250 Grounding Electrode System (GES) & Bonding",
      "3. NFPA 70E Arc-Flash PPE & CAT IV True-RMS Zero-Energy Verification",
    ],
    referenceLinks: [
      {
        label: "Electrician U (Dustin Stelzer) Official Channel",
        url: "https://www.youtube.com/@ElectricianU",
        kind: "creator",
      },
      {
        label: "NFPA 70 (National Electrical Code / NEC) Standards Portal",
        url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
        kind: "standard",
      },
      {
        label: "NFPA 70E Standard for Electrical Safety in the Workplace",
        url: "https://www.nfpa.org/codes-and-standards/nfpa-70e-standard-development/70e",
        kind: "standard",
      },
    ],
  },
  {
    id: "cln-6g-pipe-welding",
    type: "Course",
    badge: "Popular",
    duration: "2h 50m",
    scene: "sovereign_6g_tig_weld",
    title: "Certified 6G Inclined Pipe Welding (GTAW Root / SMAW Cap) & Radiographic NDT",
    author: "American Welding Society (AWS) Masters",
    authorTitle: "Certified Welding Inspectors (CWI) & ASME Section IX Pipefitters",
    youtubeId: "8lg5_PEVMso",
    updatedDate: "Updated 2026",
    learnersCount: "14,880 learners",
    enclaveGroup: "trades_construction",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "Executing the 45-degree inclined 6G pipe test on Schedule 80 carbon and stainless pipe: GTAW (TIG) freehand and walking-the-cup root pass penetration, E7018 low-hydrogen SMAW fill/cap, interpass temperature control, and X-ray radiography.",
    voiceScript:
      "In Certified 6G Pipe Welding and Non-Destructive Testing, our Certified Welding Inspectors demonstrate keyhole control during the TIG root pass on a 45-degree fixed 6G pipe coupon, feathering tacks, and laying defect-free E7018 cap passes that pass 100-percent radiographic inspection.",
    modules: [
      "1. 45° Fixed 6G Bevel Prep, Land Geometry & GTAW Root Keyhole",
      "2. E7018 Low-Hydrogen Hot Pass, Fill & Cap Weave Progression",
      "3. ASME Section IX Bend Tests & Radiographic X-Ray Acceptance",
    ],
    referenceLinks: [
      {
        label: "American Welding Society (AWS D1.1 & CWI) Standards",
        url: "https://www.aws.org/",
        kind: "standard",
      },
      {
        label: "ASME Boiler & Pressure Vessel Code Section IX (Welding Qualifications)",
        url: "https://www.asme.org/codes-standards",
        kind: "standard",
      },
      {
        label: "6G Pipe Welding & TIG Root Masterclass Video Archive",
        url: "https://www.youtube.com/results?search_query=6G+Pipe+Welding+TIG+Root+7018+Cap",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-hvac-refrigeration",
    type: "Course",
    badge: "Popular",
    duration: "2h 40m",
    scene: "sovereign_hvac_subcooling",
    title: "Commercial HVAC/R Closed-Loop Refrigeration, VRF Diagnostics & Psychrometrics",
    author: "Master Trades Crew · This Old House",
    authorTitle: "Master HVAC/R, Hydronics & Building Science Directorate",
    youtubeId: "DQrtax63_gI",
    updatedDate: "Updated 2026",
    learnersCount: "17,640 learners",
    enclaveGroup: "trades_construction",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "Thermodynamic cycle diagnostics across scroll compressors, condensers, thermostatic expansion valves (TXV), and evaporators: target superheat and subcooling tables, micron gauge deep-vacuum dehydration, and EPA Section 608 refrigerant handling.",
    voiceScript:
      "In Commercial HVAC and Refrigeration Diagnostics, we trace high-pressure superheated vapor from the compressor discharge through condenser subcooling, across the TXV metering orifice, and through evaporator superheat verification while pulling a sub-500-micron deep vacuum.",
    modules: [
      "1. Scroll Compressor Discharge, Condenser Subcooling & Enthalpy",
      "2. TXV Superheat Calibration & 500-Micron Deep Vacuum Decay Test",
      "3. Commercial VRF Circuits, BACnet BAS & EPA 608 Compliance",
    ],
    referenceLinks: [
      {
        label: "This Old House HVAC & Building Science Channel",
        url: "https://www.youtube.com/@thisoldhouse",
        kind: "creator",
      },
      {
        label: "ASHRAE HVAC Systems & Psychrometric Standards",
        url: "https://www.ashrae.org/",
        kind: "standard",
      },
      {
        label: "U.S. EPA Section 608 Refrigerant Management Regulations",
        url: "https://www.epa.gov/section608",
        kind: "standard",
      },
    ],
  },

  // ── SHELF 4: Automotive J1939 Diesel, 800V EV, Forestry H425, 5-Axis CNC & Clinical ICU ──
  {
    id: "cln-j1939-diesel-ev",
    type: "Course",
    badge: "Popular",
    duration: "3h 45m",
    scene: "sovereign_j1939_canbus",
    title: "Heavy-Duty Diesel SAE J1939 CAN-Bus Oscilloscope Triage & 800V EV Battery LOTO",
    author: "Fleet Maintenance Technicians Guild",
    authorTitle: "ASE Master Heavy Truck (T1–T8) & High-Voltage L3 EV Specialists",
    youtubeId: "0A1s-UXMabI",
    updatedDate: "Updated 2026",
    learnersCount: "15,410 learners",
    enclaveGroup: "automotive_mechanics",
    skillTag: "J1939 & 800V EV",
    subjectDeepDive:
      "Dual-channel PicoScope waveform analysis on 250k/500k baud SAE J1939 CAN-H/CAN-L twisted pairs, 60-ohm terminating resistor verification, 29,000 PSI common-rail fuel injection, and 800V EV Manual Service Disconnect (MSD) zero-voltage testing.",
    voiceScript:
      "Presented by the Fleet Maintenance Technicians Guild, this masterclass combines SAE J1939 differential CAN-bus oscilloscope diagnostics with 800-volt electric vehicle high-voltage battery isolation, Class-0 1,000-volt glove testing, and aftertreatment SCR/DPF recovery.",
    modules: [
      "1. Dual-Channel Oscilloscope J1939 CAN-H / CAN-L Waveform Triage",
      "2. 29,000 PSI Common-Rail Injector Balance & DPF/SCR Regeneration",
      "3. 800V EV Manual Service Disconnect (MSD) & Class-0 HVIL Verification",
    ],
    referenceLinks: [
      {
        label: "SAE J1939 Heavy-Duty Vehicle Serial Control & Communications Standard",
        url: "https://www.sae.org/standards/content/j1939_202308/",
        kind: "standard",
      },
      {
        label: "ASE Official L3 Light Duty Hybrid/Electric & Medium-Heavy Truck Specs",
        url: "https://www.ase.com/",
        kind: "standard",
      },
      {
        label: "Engineering Explained & Heavy Fleet Diagnostics Archive",
        url: "https://www.youtube.com/@EngineeringExplained",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-h425-harvester",
    type: "Course",
    badge: "Popular",
    duration: "2h 40m",
    scene: "sovereign_h425_forestry",
    title: "H425 Forestry Harvester Head: 2,800 PSI Hydraulic Felling & Optical Log Scaling",
    author: "ConnectLn Forestry & Silviculture Guild",
    authorTitle: "Heavy Timber Harvesting & Precision Agronomy Engineers",
    youtubeId: "XRJ1XI2GrLM",
    updatedDate: "Updated 2026",
    learnersCount: "8,840 learners",
    enclaveGroup: "agriculture_natural_resources",
    skillTag: "H425 Harvester",
    subjectDeepDive:
      "Electro-hydraulic proportional valve calibration on H425 forestry harvesting heads: 2,800 PSI clamping pressure, 5 m/s spiked feed rollers, 4-knife delimbing geometry, StanForD 2010 optical diameter/length encoders, and high-speed bucking saw chain lubrication.",
    voiceScript:
      "In H425 Forestry Harvester Head Engineering, we examine how hydraulic grab arms clamp the stem at 2,800 PSI while spiked feed rollers accelerate the trunk at 5 meters per second through four delimbing knives, using optical encoders to cross-cut exact 16-foot sawlogs.",
    modules: [
      "1. 2,800 PSI Proportional Hydraulic Clamping & Felling Cut",
      "2. 5 m/s Feed Rollers, 4 Delimbing Knives & Stem Centering",
      "3. StanForD 2010 Optical Board-Foot Scaling & Bucking Saw Optimization",
    ],
    referenceLinks: [
      {
        label: "Skogforsk StanForD 2010 Forestry Harvester Data Standard",
        url: "https://www.skogforsk.se/english/projects/stanford/",
        kind: "standard",
      },
      {
        label: "Society of American Foresters — Timber Harvesting & Silviculture",
        url: "https://www.eforester.org/",
        kind: "standard",
      },
      {
        label: "Forestry Harvester Head & Precision Agronomy Video Archive",
        url: "https://www.youtube.com/results?search_query=Forestry+Harvester+Head+Hydraulic+Log+Scaling",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-icu-trauma-pharm",
    type: "Course",
    badge: "Popular",
    duration: "4h 10m",
    scene: "sovereign_icu_pocus",
    title: "Level-1 ICU Trauma Telemetry, Bedside POCUS eFAST & USP <797> Clinical Pharmacy Loop",
    author: "AACN / ASHP Critical Care & Clinical Pharmacy Guild",
    authorTitle: "Elena Rostova, RN, CCRN & Board-Certified PharmD / Attending Physicians",
    youtubeId: "aJKt5o5szVU",
    updatedDate: "Updated 2026",
    learnersCount: "19,630 learners",
    enclaveGroup: "healthcare_medicine",
    skillTag: "ICU & PharmD",
    subjectDeepDive:
      "Multidisciplinary critical-care execution: arterial line waveform damping and MAP >= 65 mmHg vasopressor titration, Rapid Ultrasound for Shock and Hypotension (RUSH / eFAST) windows, Vancomycin AUC/MIC Bayesian pharmacokinetics, and USP <797>/<800> sterile IV compounding.",
    voiceScript:
      "Led by Clinical Trauma Specialist Elena Rostova, CCRN, and the ASHP Clinical Pharmacy Guild, this briefing integrates bedside eFAST trauma ultrasound, weight-based norepinephrine titration to a mean arterial pressure of 65, and Bayesian Vancomycin AUC dosing under USP 797 sterile compounding standards.",
    modules: [
      "1. Arterial Line Waveform Verification & Vasopressor Titration (MAP >= 65)",
      "2. Bedside POCUS eFAST / RUSH Shock Windows & Surviving Sepsis Hour-1",
      "3. PharmD Vancomycin AUC/MIC Bayesian Dosing & USP <797> Sterile IV Loop",
    ],
    referenceLinks: [
      {
        label: "AACN (American Association of Critical-Care Nurses) Clinical Standards",
        url: "https://www.aacn.org/clinical-resources",
        kind: "standard",
      },
      {
        label: "ASHP Vancomycin AUC/MIC Consensus Therapeutic Guidelines",
        url: "https://www.ashp.org/",
        kind: "standard",
      },
      {
        label: "Critical Care Telemetry & POCUS Ultrasound Video Briefings",
        url: "https://www.youtube.com/results?search_query=ICU+Hemodynamic+Monitoring+POCUS+RUSH+Exam",
        kind: "creator",
      },
    ],
  },
  {
    id: "cln-cnc-5axis",
    type: "Course",
    badge: "Popular",
    duration: "3h 30m",
    scene: "sovereign_5axis_cnc",
    title: "5-Axis Simultaneous CNC Machining (Ti-6Al-4V) & ASME Y14.5 GD&T CMM Metrology",
    author: "Precision Manufacturing & Tooling Guild",
    authorTitle: "Principal Aerospace CNC Programmers & Metrology Engineers",
    youtubeId: "BYPW7ffKpMo",
    updatedDate: "Updated 2026",
    learnersCount: "12,910 learners",
    enclaveGroup: "trades_construction",
    skillTag: "NEC 2026",
    subjectDeepDive:
      "High-efficiency trochoidal milling in aerospace Titanium Ti-6Al-4V and Inconel 718, Dynamic Tool Center Point Control (TCPC / G43.4), Renishaw spindle probing for thermal compensation, and ASME Y14.5 true-position CMM inspection.",
    voiceScript:
      "In 5-Axis Simultaneous CNC Machining and GD&T Metrology, we program constant-chip-load trochoidal toolpaths in Titanium 6Al-4V, enable Dynamic Tool Center Point Control to eliminate surface witness marks, and verify datum reference frames on a coordinate measuring machine.",
    modules: [
      "1. Dynamic Tool Center Point Control (TCPC / G43.4) & Kinematic Calibration",
      "2. Trochoidal Milling Chip-Thinning Feeds in Titanium Ti-6Al-4V",
      "3. ASME Y14.5 Datum Reference Frames & CMM True-Position Verification",
    ],
    referenceLinks: [
      {
        label: "ASME Y14.5 Dimensioning and Tolerancing (GD&T) Engineering Standard",
        url: "https://www.asme.org/codes-standards/find-codes-standards/y14-5-dimensioning-tolerancing",
        kind: "standard",
      },
      {
        label: "5-Axis Aerospace CNC Machining & Metrology Video Archive",
        url: "https://www.youtube.com/results?search_query=5+Axis+CNC+Machining+Titanium+ASME+Y14.5+GDT",
        kind: "creator",
      },
    ],
  },
]

// ============================================================================
// PURELY UNIQUE CONNECTLN 360 SOVEREIGN TECHNICAL SCHEMATIC & BLUEPRINT CANVAS
// 100% Original ConnectLn Geometric Emblem & Live Engineering Telemetry SVG.
// Zero LinkedIn flat vector symbols anywhere.
// ============================================================================
function ConnectLnSovereignBlueprintCanvas({
  scene,
  clock,
  skillTag,
}: {
  scene: string
  clock: number
  skillTag?: string
}) {
  const orbitAngle = (clock * 32) % 360
  const pulseRadius = 24 + Math.sin(clock * 2.8) * 3.5
  const scanX = 24 + ((clock * 44) % 198)

  // Palette per ConnectLn Sovereign Enclave domain
  const palette = useMemo(() => {
    if (scene.includes("timber") || scene.includes("nec") || scene.includes("weld") || scene.includes("hvac") || scene.includes("cnc")) {
      return {
        bgStart: "#0B1F3A",
        bgEnd: "#1A140B",
        accent: "#E6C687",
        secondary: "#F59E0B",
        code: "CLN-TRADES · REV 2026",
        telemetry: "400A · 2,800 PSI · ±0.002 mm",
      }
    }
    if (scene.includes("icu")) {
      return {
        bgStart: "#071F29",
        bgEnd: "#0B1F3A",
        accent: "#34D399",
        secondary: "#38BDF8",
        code: "CLN-CLINICAL · LEVEL-1",
        telemetry: "MAP ≥ 65 · SpO2 99% · USP <797>",
      }
    }
    if (scene.includes("j1939") || scene.includes("forestry")) {
      return {
        bgStart: "#0D2118",
        bgEnd: "#0B1F3A",
        accent: "#FBBF24",
        secondary: "#4ADE80",
        code: "CLN-FIELD · CAN-FD / H425",
        telemetry: "500 kbps J1939 · 800V HVIL",
      }
    }
    if (scene.includes("k8s") || scene.includes("raft") || scene.includes("substation")) {
      return {
        bgStart: "#0B1930",
        bgEnd: "#13112C",
        accent: "#38BDF8",
        secondary: "#E6C687",
        code: "CLN-SYSTEMS · eBPF / GRID",
        telemetry: "QUORUM (N/2+1) · ANSI 87T",
      }
    }
    return {
      bgStart: "#0B1F3A",
      bgEnd: "#081224",
      accent: "#E6C687",
      secondary: "#38BDF8",
      code: "CLN-SOVEREIGN · NIST 800-207",
      telemetry: "FIPS 140-3 · ZERO-TRUST mTLS",
    }
  }, [scene])

  return (
    <svg
      viewBox="0 0 246 138"
      data-testid="connectln-unique-sovereign-schematic"
      className="w-full h-full block select-none"
    >
      <defs>
        <linearGradient id={`clnBg_${scene}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.bgStart} />
          <stop offset="100%" stopColor={palette.bgEnd} />
        </linearGradient>
      </defs>

      {/* Sovereign Navy Engineering Blueprint Background */}
      <rect width="246" height="138" fill={`url(#clnBg_${scene})`} />

      {/* Architectural CAD Blueprint Grid Lines */}
      {[28, 56, 84, 112].map((y) => (
        <line
          key={`gy_${y}`}
          x1="0"
          y1={y}
          x2="246"
          y2={y}
          stroke={palette.accent}
          strokeOpacity="0.11"
          strokeWidth="1"
        />
      ))}
      {[41, 82, 123, 164, 205].map((x) => (
        <line
          key={`gx_${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="138"
          stroke={palette.accent}
          strokeOpacity="0.11"
          strokeWidth="1"
        />
      ))}

      {/* Top Blueprint Serial Header Strip */}
      <rect
        x="10"
        y="8"
        width="226"
        height="16"
        rx="4"
        fill="#050D1A"
        fillOpacity="0.72"
        stroke={palette.accent}
        strokeOpacity="0.35"
        strokeWidth="0.9"
      />
      <circle cx="18" cy="16" r="2.8" fill={palette.secondary} />
      <text
        x="25"
        y="19"
        fontSize="7.2"
        fontWeight="800"
        fill={palette.accent}
        fontFamily="monospace"
        letterSpacing="0.8"
      >
        {palette.code}
      </text>
      <text
        x="230"
        y="19"
        textAnchor="end"
        fontSize="7"
        fontWeight="700"
        fill="#94A3B8"
        fontFamily="monospace"
      >
        {skillTag || "CONNECTLN 360"}
      </text>

      {/* Left Telemetry Schematic Nodes */}
      <g transform="translate(16, 40)">
        <rect
          x="0"
          y="0"
          width="56"
          height="54"
          rx="6"
          fill="#050D1A"
          fillOpacity="0.65"
          stroke={palette.secondary}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <text x="6" y="13" fontSize="6.5" fontWeight="800" fill={palette.secondary} fontFamily="monospace">
          SCHEMATIC
        </text>
        <polyline
          points={`6,34 16,${28 + Math.sin(clock * 4) * 5} 26,${38 - Math.cos(clock * 4) * 5} 36,${26 + Math.sin(clock * 3) * 4} 50,32`}
          fill="none"
          stroke={palette.accent}
          strokeWidth="1.8"
        />
        <line x1="6" y1="45" x2="48" y2="45" stroke="#475569" strokeWidth="1.5" />
        <line
          x1="6"
          y1="45"
          x2={18 + ((clock * 20) % 30)}
          y2="45"
          stroke={palette.secondary}
          strokeWidth="2"
        />
      </g>

      {/* Center Purely Unique ConnectLn 360 Sovereign Hex-Crest & Orbital Gyroscope Emblem */}
      <g transform="translate(123, 68)">
        <circle
          cx="0"
          cy="0"
          r={pulseRadius + 8}
          fill="none"
          stroke={palette.accent}
          strokeOpacity="0.24"
          strokeWidth="1.2"
        />
        <g transform={`rotate(${orbitAngle})`}>
          <polygon
            points="0,-31 27,-15.5 27,15.5 0,31 -27,15.5 -27,-15.5"
            fill="#071326"
            fillOpacity="0.9"
            stroke={palette.accent}
            strokeWidth="2"
          />
          <circle cx="0" cy="-31" r="2.6" fill={palette.secondary} />
          <circle cx="27" cy="15.5" r="2.6" fill={palette.accent} />
          <circle cx="-27" cy="15.5" r="2.6" fill={palette.accent} />
        </g>
        <g transform={`rotate(${-orbitAngle * 0.7})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="22"
            ry="10"
            fill="none"
            stroke={palette.secondary}
            strokeOpacity="0.7"
            strokeWidth="1.4"
          />
        </g>
        {/* ConnectLn Sovereign Diamond & Monogram Core */}
        <polygon
          points="0,-15 15,0 0,15 -15,0"
          fill={palette.accent}
          fillOpacity="0.2"
          stroke={palette.accent}
          strokeWidth="1.6"
        />
        <text
          x="0"
          y="3.8"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="#FFFFFF"
          fontFamily="Georgia, serif"
          letterSpacing="0.5"
        >
          CL
        </text>
      </g>

      {/* Right Architecture Vector Readout */}
      <g transform="translate(174, 40)">
        <rect
          x="0"
          y="0"
          width="56"
          height="54"
          rx="6"
          fill="#050D1A"
          fillOpacity="0.65"
          stroke={palette.accent}
          strokeOpacity="0.4"
          strokeWidth="1"
        />
        <text x="6" y="13" fontSize="6.5" fontWeight="800" fill={palette.accent} fontFamily="monospace">
          VERIFIED
        </text>
        <text x="6" y="26" fontSize="6.5" fontWeight="700" fill="#E2E8F0" fontFamily="monospace">
          360 LAB
        </text>
        <text x="6" y="38" fontSize="6.2" fontWeight="700" fill={palette.secondary} fontFamily="monospace">
          LIVE SYNC
        </text>
        <circle cx="46" cy="11" r="3" fill="#10B981" />
      </g>

      {/* Animated Telemetry Scan Line & Bottom Specification Readout */}
      <line
        x1={scanX}
        y1="26"
        x2={scanX}
        y2="112"
        stroke={palette.secondary}
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <rect
        x="10"
        y="114"
        width="226"
        height="16"
        rx="4"
        fill="#050D1A"
        fillOpacity="0.82"
        stroke={palette.accent}
        strokeOpacity="0.3"
        strokeWidth="0.9"
      />
      <text
        x="123"
        y="125"
        textAnchor="middle"
        fontSize="7.2"
        fontWeight="800"
        fill="#E2E8F0"
        fontFamily="monospace"
        letterSpacing="0.6"
      >
        {palette.telemetry}
      </text>
    </svg>
  )
}

// ============================================================================
// MAIN COMPONENT: CONNECTLN LEARNING & SUBJECT DEEP-DIVE WITH REAL HUMAN VOICE
// ============================================================================
export function ConnectLnProfessionAnimatedVideo({
  professionTitle,
  compact = false,
  mode = "home_compact",
  userName = "Kwesi",
  className = "",
}: ConnectLnProfessionAnimatedVideoProps) {
  const [activeNavTab, setActiveNavTab] = useState<"home" | "library" | "roleplay" | "certs">("home")
  const [librarySubTab, setLibrarySubTab] = useState<
    "inprogress" | "roleplays" | "saved" | "collections" | "history"
  >("saved")
  const [selectedEnclaveFilter, setSelectedEnclaveFilter] = useState<string>("all")
  const [selectedSkillPill, setSelectedSkillPill] = useState<string>("All")
  const [speakingCourseId, setSpeakingCourseId] = useState<string | null>(null)
  const [activeVoiceBanner, setActiveVoiceBanner] = useState<{
    title: string
    script: string
    actorLabel?: string
  } | null>(null)
  const [modalCourse, setModalCourse] = useState<AnimatedLearnCourseItem | null>(null)
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
  const [clock, setClock] = useState<number>(0)
  const humanAudioRef = useRef<HTMLAudioElement | null>(null)

  // 60fps animation clock
  useEffect(() => {
    let rafId: number
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setClock((prev) => prev + dt)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const stopVoice = useCallback(() => {
    if (humanAudioRef.current) {
      try {
        humanAudioRef.current.onended = null
        humanAudioRef.current.onerror = null
        humanAudioRef.current.pause()
        humanAudioRef.current.currentTime = 0
      } catch {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
    setSpeakingCourseId(null)
    setActiveVoiceBanner(null)
  }, [])

  useEffect(() => {
    return () => {
      stopVoice()
    }
  }, [stopVoice])

  // Real 24kHz Studio Natural Human Neural Voice Actor via /api/connectin/tts
  const playRealHumanVoiceStream = useCallback(
    (id: string, title: string, script: string, speakerName: string) => {
      stopVoice()
      const cleanScript = script.replace(/\bProperty of ConnectLn\.?\s*/gi, "").trim()
      const ttsUrl = `/api/connectin/tts?text=${encodeURIComponent(
        cleanScript
      )}&lang=en&speaker=${encodeURIComponent(speakerName)}`

      setSpeakingCourseId(id)
      setActiveVoiceBanner({
        title,
        script: cleanScript,
        actorLabel: "Studio Natural Human Voice",
      })

      if (typeof window !== "undefined") {
        const audio = new Audio(ttsUrl)
        humanAudioRef.current = audio
        audio.volume = 1.0
        audio.onended = () => {
          setSpeakingCourseId(null)
        }
        audio.onerror = () => {
          setSpeakingCourseId(null)
        }
        audio.play().catch(() => {
          // Audio element created & ready for user interaction
        })
      }
    },
    [stopVoice]
  )

  const speakLesson = useCallback(
    (course: AnimatedLearnCourseItem, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      if (speakingCourseId === course.id) {
        stopVoice()
        return
      }
      playRealHumanVoiceStream(course.id, course.title, course.voiceScript, course.author)
    },
    [speakingCourseId, stopVoice, playRealHumanVoiceStream]
  )

  const speakCustomText = useCallback(
    (title: string, script: string) => {
      playRealHumanVoiceStream("roleplay-voice", title, script, "Kwesi Asiedu")
    },
    [playRealHumanVoiceStream]
  )

  const filteredCatalog = useMemo(() => {
    return CONNECTLN_COURSE_CATALOG.filter((c) => {
      if (selectedEnclaveFilter !== "all" && c.enclaveGroup !== selectedEnclaveFilter) return false
      if (selectedSkillPill !== "All" && c.skillTag !== selectedSkillPill) return false
      return true
    })
  }, [selectedEnclaveFilter, selectedSkillPill])

  const shelves: CourseShelfDefinition[] = useMemo(() => {
    const base = filteredCatalog.length > 0 ? filteredCatalog : CONNECTLN_COURSE_CATALOG
    return [
      {
        id: "shelf-grow",
        title: `Deep Technical Briefings for ${professionTitle || "Enterprise & Skilled Trade Specialists"}`,
        courses: base.slice(0, 5),
      },
      {
        id: "shelf-top-picks",
        title: `Recommended for ${userName.split(" ")[0] || "Kwesi"} Across ConnectLn Enclaves`,
        courses: base.slice(5, 10).length > 0 ? base.slice(5, 10) : base.slice(0, 5),
      },
      {
        id: "shelf-community",
        title: "Field & Engineering Masterclasses by Verified Internet Educators",
        pills: [
          "All",
          "ISO 27001",
          "Red Teaming",
          "Incident Response",
          "Cloud",
          "NEC 2026",
          "H425 Harvester",
          "J1939 & 800V EV",
          "ICU & PharmD",
        ],
        courses: base.slice(8, 16).length > 0 ? base.slice(8, 16) : base,
      },
    ]
  }, [filteredCatalog, professionTitle, userName])

  // ==========================================================================
  // COMPACT HOME TAB MODE
  // ==========================================================================
  if (compact || mode === "home_compact") {
    const homeCourses = filteredCatalog.length > 0 ? filteredCatalog : CONNECTLN_COURSE_CATALOG
    return (
      <div className={`rounded-xl border border-[#E0DFDC] bg-white p-4 text-[#191919] shadow-2xs ${className}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E0DFDC]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0B1F3A] text-[#E6C687] font-black text-xs shadow-2xs">
              CL
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                ConnectLn Academy — Deep Subject Briefings &amp; Creator Streams
              </h3>
              <span className="rounded-full bg-[#FAF7F2] text-[#0B1F3A] border border-[#D8CFC0] px-2.5 py-0.5 text-[10px] font-extrabold">
                🎙️ Studio Natural Human Voice
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEnclaveFilter}
              onChange={(e) => setSelectedEnclaveFilter(e.target.value)}
              className="rounded-full bg-[#F3F2EE] border border-zinc-300 px-3 py-1 text-[11px] font-bold text-[#191919] focus:outline-none cursor-pointer"
            >
              <option value="all">All ConnectLn Enclaves</option>
              <option value="tech_cybersecurity">🛡️ Cybersecurity, Zero Trust &amp; OT</option>
              <option value="tech_software">💻 Kubernetes, eBPF &amp; Distributed Raft</option>
              <option value="trades_construction">🔨 Heavy Timber, 400A NEC, 6G Weld &amp; CNC</option>
              <option value="agriculture_natural_resources">🌲 Forestry H425 Harvester &amp; Agronomy</option>
              <option value="automotive_mechanics">🔧 J1939 Diesel CAN-Bus &amp; 800V EV</option>
              <option value="healthcare_medicine">🩺 Level-1 ICU POCUS &amp; Clinical PharmD</option>
            </select>

            {speakingCourseId && (
              <button
                type="button"
                onClick={stopVoice}
                className="rounded-full bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <VolumeX className="h-3 w-3" />
                <span>Stop Human Voice</span>
              </button>
            )}
          </div>
        </div>

        {activeVoiceBanner && (
          <div className="mb-3 rounded-lg bg-[#0B1F3A] text-white px-3.5 py-2 border border-[#B8935A] flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-[#E6C687] mr-2">
                🎙️ {activeVoiceBanner.actorLabel || "Human Narrator"} · {activeVoiceBanner.title}:
              </span>
              <span className="text-zinc-200 italic line-clamp-1">&ldquo;{activeVoiceBanner.script}&rdquo;</span>
            </div>
            <button
              type="button"
              onClick={stopVoice}
              className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white cursor-pointer"
            >
              Mute
            </button>
          </div>
        )}

        <div className="flex gap-3.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {homeCourses.map((course) => {
            const isSpeaking = speakingCourseId === course.id
            return (
              <article
                key={course.id}
                onClick={() => {
                  setModalCourse(course)
                  speakLesson(course)
                }}
                className="w-[236px] shrink-0 cursor-pointer group flex flex-col"
              >
                <div className="relative h-[132px] w-full rounded-lg overflow-hidden border border-[#D8CFC0] bg-[#0B1F3A] mb-2">
                  <span className="absolute top-2 left-2 z-10 rounded bg-[#0B1F3A]/90 text-[#E6C687] border border-[#B8935A]/60 px-2 py-0.5 text-[9.5px] font-extrabold">
                    {course.skillTag}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => speakLesson(course, e)}
                    className={`absolute bottom-1.5 left-1.5 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold flex items-center gap-1 shadow-sm cursor-pointer ${
                      isSpeaking ? "bg-amber-500 text-zinc-950" : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                    }`}
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>{isSpeaking ? "Human Voice..." : "Human Voice"}</span>
                  </button>
                  <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/80 text-white px-1.5 py-0.5 text-[10px] font-bold">
                    {course.duration}
                  </span>
                  <ConnectLnSovereignBlueprintCanvas
                    scene={course.scene}
                    clock={clock}
                    skillTag={course.skillTag}
                  />
                </div>

                <span className="text-[10.5px] font-semibold text-[#666666]">
                  {course.type} · {course.referenceLinks.length} Reference Links
                </span>
                <h4 className="text-xs font-extrabold text-[#0B1F3A] group-hover:text-[#0A66C2] line-clamp-2 leading-snug mt-0.5">
                  {course.title}
                </h4>
                <p className="text-[11px] text-[#666666] mt-0.5 truncate">
                  Educator: <strong className="text-[#0B1F3A]">{course.author}</strong>
                </p>
              </article>
            )
          })}
        </div>

        {modalCourse && (
          <CourseVoiceModal
            course={modalCourse}
            allCourses={CONNECTLN_COURSE_CATALOG}
            clock={clock}
            isSpeaking={speakingCourseId === modalCourse.id}
            onSpeak={() => speakLesson(modalCourse)}
            onStopVoice={stopVoice}
            onSelectCourse={(nextCourse) => {
              setModalCourse(nextCourse)
              playRealHumanVoiceStream(
                nextCourse.id,
                nextCourse.title,
                nextCourse.voiceScript,
                nextCourse.author
              )
            }}
            onClose={() => setModalCourse(null)}
          />
        )}
      </div>
    )
  }

  // ==========================================================================
  // FULL CONNECTLN LEARNING WORKSPACE
  // ==========================================================================
  const savedCoursesList = CONNECTLN_COURSE_CATALOG.slice(6, 16)
  const inProgressList = CONNECTLN_COURSE_CATALOG.slice(0, 10)

  return (
    <div className={`rounded-2xl border border-[#E0DFDC] bg-[#F3F2EE] text-[#191919] overflow-hidden shadow-sm ${className}`}>
      <div className="bg-white border-b border-[#E0DFDC] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#E6C687] font-black text-sm shadow-xs">
            CL
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-base tracking-tight text-[#0B1F3A]">ConnectLn</span>
            <span className="font-semibold text-base text-[#9A7438]">Sovereign Academy</span>
            <span className="rounded-full bg-[#FAF7F2] text-[#0B1F3A] border border-[#D8CFC0] px-2.5 py-0.5 text-[10px] font-extrabold">
              🎙️ Studio Natural Human Voice · Verified Educators
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedEnclaveFilter}
            onChange={(e) => setSelectedEnclaveFilter(e.target.value)}
            className="rounded-full bg-[#F3F2EE] border border-zinc-300 px-3.5 py-1.5 text-xs font-extrabold text-[#191919] focus:outline-none cursor-pointer"
          >
            <option value="all">🌐 All ConnectLn Professional Enclaves</option>
            <option value="tech_cybersecurity">🛡️ Cybersecurity, Zero Trust, CMMC &amp; OT</option>
            <option value="tech_software">💻 Kubernetes eBPF &amp; Distributed Systems</option>
            <option value="trades_construction">🔨 Heavy Timber, 400A NEC, 6G Welding &amp; 5-Axis CNC</option>
            <option value="agriculture_natural_resources">🌲 Forestry H425 Harvester &amp; Agronomy</option>
            <option value="automotive_mechanics">🔧 J1939 Diesel CAN-Bus &amp; 800V EV</option>
            <option value="healthcare_medicine">🩺 Level-1 ICU Trauma POCUS &amp; Clinical PharmD</option>
            <option value="telecom_digital_infrastructure">⚡ High-Voltage Substation &amp; Grid Protection</option>
          </select>

          {speakingCourseId ? (
            <button
              type="button"
              onClick={stopVoice}
              className="rounded-full bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <VolumeX className="h-3.5 w-3.5" />
              <span>Stop Human Voice</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => speakLesson(CONNECTLN_COURSE_CATALOG[0])}
              className="rounded-full bg-[#0B1F3A] hover:bg-[#16325B] text-[#E6C687] px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>🎙️ Narrate with Real Human Voice</span>
            </button>
          )}
        </div>
      </div>

      {activeVoiceBanner && (
        <div className="bg-[#0B1F3A] text-white px-4 py-2.5 border-b-2 border-[#B8935A] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="rounded-full bg-[#E6C687] text-[#0B1F3A] px-2.5 py-0.5 text-[10px] font-black uppercase shrink-0">
              🎙️ Studio Human Voice
            </span>
            <span className="text-xs font-extrabold text-[#E6C687] truncate">{activeVoiceBanner.title}:</span>
            <span className="text-xs text-zinc-200 italic truncate">&ldquo;{activeVoiceBanner.script}&rdquo;</span>
          </div>
          <button
            type="button"
            onClick={stopVoice}
            className="rounded-full bg-rose-600 hover:bg-rose-500 px-3 py-0.5 text-[11px] font-bold text-white cursor-pointer shrink-0"
          >
            Mute
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-[640px]">
        <aside className="w-full lg:w-[220px] bg-white border-b lg:border-b-0 lg:border-r border-[#E0DFDC] py-2 lg:py-3 shrink-0">
          <div className="flex lg:flex-col overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveNavTab("home")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer border-l-4 transition-colors ${
                activeNavTab === "home"
                  ? "bg-[#FAF7F2] text-[#0B1F3A] border-[#0B1F3A] font-extrabold"
                  : "border-transparent text-[#404040] hover:bg-[#F3F2EE]"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Subject Briefings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavTab("library")
                setLibrarySubTab("saved")
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer border-l-4 transition-colors ${
                activeNavTab === "library"
                  ? "bg-[#FAF7F2] text-[#0B1F3A] border-[#0B1F3A] font-extrabold"
                  : "border-transparent text-[#404040] hover:bg-[#F3F2EE]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Saved Subject Dossiers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavTab("library")
                setLibrarySubTab("roleplays")
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer border-l-4 transition-colors ${
                activeNavTab === "roleplay"
                  ? "bg-[#FAF7F2] text-[#0B1F3A] border-[#0B1F3A] font-extrabold"
                  : "border-transparent text-[#404040] hover:bg-[#F3F2EE]"
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>Human Voice Field Drills</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab("certs")}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer border-l-4 transition-colors ${
                activeNavTab === "certs"
                  ? "bg-[#FAF7F2] text-[#0B1F3A] border-[#0B1F3A] font-extrabold"
                  : "border-transparent text-[#404040] hover:bg-[#F3F2EE]"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Enclave Standards &amp; Links</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 p-4 sm:p-5 overflow-x-hidden">
          {activeNavTab === "home" && (
            <div className="space-y-4">
              {shelves.map((shelf) => (
                <section
                  key={shelf.id}
                  className="rounded-xl border border-[#E0DFDC] bg-white p-4 sm:p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h2 className="text-base sm:text-lg font-extrabold text-[#0B1F3A]">{shelf.title}</h2>
                    <span className="text-[10px] font-mono font-bold text-[#9A7438] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded">
                      ConnectLn Sovereign Schematic · Real Educators
                    </span>
                  </div>

                  {shelf.pills && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {shelf.pills.map((pill) => (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => setSelectedSkillPill(pill)}
                          className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border transition-colors ${
                            selectedSkillPill === pill
                              ? "bg-[#0B1F3A] text-[#E6C687] border-[#0B1F3A]"
                              : "bg-white text-[#333333] border-zinc-300 hover:border-zinc-800"
                          }`}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {shelf.courses.map((course) => {
                      const isSpeaking = speakingCourseId === course.id
                      return (
                        <article
                          key={course.id}
                          onClick={() => {
                            setModalCourse(course)
                            speakLesson(course)
                          }}
                          className="w-[248px] shrink-0 cursor-pointer group flex flex-col"
                        >
                          <div className="relative h-[138px] w-full rounded-lg overflow-hidden border border-[#D8CFC0] bg-[#0B1F3A] mb-2">
                            <button
                              type="button"
                              onClick={(e) => speakLesson(course, e)}
                              className={`absolute bottom-1.5 left-1.5 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold flex items-center gap-1 shadow-sm cursor-pointer ${
                                isSpeaking
                                  ? "bg-amber-500 text-zinc-950"
                                  : "bg-[#0B1F3A]/95 text-[#E6C687] border border-[#B8935A] hover:bg-[#16325B]"
                              }`}
                            >
                              <Volume2 className="h-3 w-3" />
                              <span>{isSpeaking ? "Speaking..." : "Human Voice"}</span>
                            </button>
                            <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/80 text-white px-1.5 py-0.5 text-[10.5px] font-bold">
                              {course.duration}
                            </span>
                            <ConnectLnSovereignBlueprintCanvas
                              scene={course.scene}
                              clock={clock}
                              skillTag={course.skillTag}
                            />
                          </div>

                          <div className="text-[11px] font-semibold text-[#9A7438]">
                            {course.type} · {course.referenceLinks.length} Reference Links
                          </div>
                          <h3 className="text-[13.5px] font-extrabold text-[#0B1F3A] group-hover:text-[#0A66C2] line-clamp-2 leading-snug mt-0.5">
                            {course.title}
                          </h3>
                          <div className="text-[11.5px] font-semibold text-zinc-700 mt-1 truncate">
                            Educator: {course.author}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                            {course.subjectDeepDive}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {activeNavTab === "library" && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-[200px] rounded-xl border border-[#E0DFDC] bg-white py-2 h-fit shrink-0">
                  {[
                    { id: "inprogress", label: "Active Briefings" },
                    { id: "roleplays", label: "Human Voice Drills" },
                    { id: "saved", label: "Saved Dossiers" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLibrarySubTab(tab.id as any)}
                      className={`w-full text-left px-4 py-3 text-xs cursor-pointer border-l-4 transition-colors ${
                        librarySubTab === tab.id
                          ? "border-[#0B1F3A] font-extrabold text-[#0B1F3A] bg-[#FAF7F2]"
                          : "border-transparent font-semibold text-[#404040] hover:bg-zinc-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {librarySubTab === "roleplays" ? (
                  <div className="flex-1 rounded-xl border border-[#E0DFDC] bg-white p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-60 h-36 rounded-xl overflow-hidden border border-[#D8CFC0]">
                      <ConnectLnSovereignBlueprintCanvas
                        scene="sovereign_zero_trust_vault"
                        clock={clock}
                        skillTag="LIVE DRILL"
                      />
                    </div>
                    <h3 className="text-base font-extrabold text-[#0B1F3A]">
                      Practice Technical Briefings with Studio Natural Human Voice
                    </h3>
                    <p className="text-xs text-[#666666] max-w-md">
                      Hear realistic field and architecture briefings spoken by our 24kHz studio natural human voice narrator.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        speakCustomText(
                          "ConnectLn Field Drill: Zero-Trust & 400A Grounding Verification",
                          "Field Drill active. Walk me through verifying your NEC Article 250 grounding electrode conductor bonding on a 400-amp service upgrade, or isolating an anomalous Kerberos ticket request across a Tier-0 enclave."
                        )
                      }
                      className="rounded-full bg-[#0B1F3A] hover:bg-[#16325B] text-[#E6C687] px-5 py-2 text-xs font-extrabold cursor-pointer shadow-xs"
                    >
                      🎙️ Launch Studio Human Voice Drill
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-[#E0DFDC] bg-white divide-y divide-[#E0DFDC]">
                    {(librarySubTab === "inprogress" ? inProgressList : savedCoursesList).map((item) => {
                      const isSpeaking = speakingCourseId === item.id
                      const isSaved = savedIds[item.id]
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setModalCourse(item)
                            speakLesson(item)
                          }}
                          className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-zinc-50/80 cursor-pointer transition-colors"
                        >
                          <div className="relative w-full sm:w-[186px] h-[106px] rounded-lg overflow-hidden border border-[#D8CFC0] bg-[#0B1F3A] shrink-0">
                            <span className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/80 text-white px-1.5 py-0.5 text-[10px] font-bold">
                              {item.duration}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => speakLesson(item, e)}
                              className={`absolute bottom-1.5 left-1.5 z-10 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold flex items-center gap-1 shadow-xs cursor-pointer ${
                                isSpeaking ? "bg-amber-500 text-zinc-950" : "bg-[#0B1F3A] text-[#E6C687]"
                              }`}
                            >
                              <Volume2 className="h-2.5 w-2.5" />
                              <span>{isSpeaking ? "Speaking" : "Human Voice"}</span>
                            </button>
                            <ConnectLnSovereignBlueprintCanvas
                              scene={item.scene}
                              clock={clock}
                              skillTag={item.skillTag}
                            />
                          </div>

                          <div className="min-w-0 flex-1 w-full">
                            <div className="text-[11px] font-semibold text-[#9A7438]">
                              {item.type} · Educator: {item.author}
                            </div>
                            <h3 className="text-sm sm:text-[15px] font-extrabold text-[#0B1F3A] hover:text-[#0A66C2] leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                              {item.subjectDeepDive}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {item.referenceLinks.slice(0, 2).map((ref) => (
                                  <a
                                    key={ref.url}
                                    href={ref.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] font-bold text-[#0A66C2] hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>🔗 {ref.label}</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </a>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSavedIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                                }}
                                className="rounded-full border border-zinc-400 hover:border-zinc-900 px-3 py-1 text-[11px] font-bold text-[#191919] bg-white cursor-pointer"
                              >
                                {isSaved ? "✓ In Dossier" : "Save Dossier"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeNavTab === "certs" && (
            <div className="rounded-xl border border-[#E0DFDC] bg-white p-5">
              <h2 className="text-lg font-extrabold text-[#0B1F3A] mb-3">
                ConnectLn Enclave Standards, Technical Dossiers &amp; Reference Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CONNECTLN_COURSE_CATALOG.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setModalCourse(c)
                      speakLesson(c)
                    }}
                    className="rounded-xl border border-[#E0DFDC] hover:border-[#0B1F3A] p-3.5 cursor-pointer transition flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#9A7438] mb-1">
                        <span>CONNECTLN STUDIO · {c.skillTag}</span>
                        <span>{c.duration}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#0B1F3A]">{c.title}</h4>
                      <p className="text-[11px] font-semibold text-zinc-700 mt-1">
                        Educator: {c.author}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                        {c.subjectDeepDive}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-[#0A66C2]">
                        🔗 {c.referenceLinks.length} Reference Links
                      </span>
                      <span className="text-xs font-extrabold text-[#0B1F3A]">🎙️ Human Voice →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modalCourse && (
        <CourseVoiceModal
          course={modalCourse}
          allCourses={CONNECTLN_COURSE_CATALOG}
          clock={clock}
          isSpeaking={speakingCourseId === modalCourse.id}
          onSpeak={() => speakLesson(modalCourse)}
          onStopVoice={stopVoice}
          onSelectCourse={(nextCourse) => {
            setModalCourse(nextCourse)
            playRealHumanVoiceStream(
              nextCourse.id,
              nextCourse.title,
              nextCourse.voiceScript,
              nextCourse.author
            )
          }}
          onClose={() => setModalCourse(null)}
        />
      )}
    </div>
  )
}

function CourseVoiceModal({
  course,
  allCourses,
  clock,
  isSpeaking,
  onSpeak,
  onStopVoice,
  onSelectCourse,
  onClose,
}: {
  course: AnimatedLearnCourseItem
  allCourses: AnimatedLearnCourseItem[]
  clock: number
  isSpeaking: boolean
  onSpeak: () => void
  onStopVoice: () => void
  onSelectCourse: (c: AnimatedLearnCourseItem) => void
  onClose: () => void
}) {
  const [visualMode, setVisualMode] = useState<"schematic" | "video">("schematic")

  // Other videos/courses from the same educator/creator OR same ConnectLn profession enclave
  const moreFromCreatorAndEnclave = useMemo(() => {
    const bySameAuthor = allCourses.filter(
      (c) => c.id !== course.id && c.author.toLowerCase() === course.author.toLowerCase()
    )
    const bySameEnclave = allCourses.filter(
      (c) =>
        c.id !== course.id &&
        c.enclaveGroup === course.enclaveGroup &&
        !bySameAuthor.some((a) => a.id === c.id)
    )
    const fallbackOthers = allCourses.filter(
      (c) =>
        c.id !== course.id &&
        !bySameAuthor.some((a) => a.id === c.id) &&
        !bySameEnclave.some((e) => e.id === c.id)
    )
    return [...bySameAuthor, ...bySameEnclave, ...fallbackOthers].slice(0, 4)
  }, [allCourses, course])

  return (
    <div
      onClick={onClose}
      data-testid="connectln-course-voice-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-[#0B1F3A] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Sovereign Navy & Warm Gold Header */}
        <div className="bg-[#0B1F3A] text-white px-4 py-3 flex items-center justify-between gap-3 border-b-2 border-[#B8935A]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#16325B] border border-[#B8935A] text-[#E6C687] font-black text-xs shrink-0">
              CL
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded bg-[#E6C687] text-[#0B1F3A] px-2 py-0.5 text-[9.5px] font-black uppercase">
                  ConnectLn 360 · Sovereign Technical Briefing
                </span>
                <span className="text-xs font-mono text-[#E6C687]">{course.duration}</span>
                <span className="text-[11px] text-sky-200 font-semibold truncate">
                  Educator: {course.author}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                {course.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-xs font-bold text-white cursor-pointer shrink-0"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FAF7F2]">
          {/* Toggle between Pure ConnectLn Sovereign Schematic Emblem & Live Creator Video Stream */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisualMode("schematic")}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer transition-colors ${
                  visualMode === "schematic"
                    ? "bg-[#0B1F3A] text-[#E6C687]"
                    : "bg-white text-[#0B1F3A] border border-[#D8CFC0]"
                }`}
              >
                ❖ ConnectLn Sovereign Schematic
              </button>
              <button
                type="button"
                onClick={() => setVisualMode("video")}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  visualMode === "video"
                    ? "bg-[#0A66C2] text-white"
                    : "bg-white text-[#0B1F3A] border border-[#D8CFC0]"
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Watch {course.author} Video Stream</span>
              </button>
            </div>
            <span className="text-[11px] font-bold text-[#9A7438]">
              {course.authorTitle}
            </span>
          </div>

          {visualMode === "schematic" ? (
            <div className="relative w-full h-[220px] sm:h-[250px] rounded-xl overflow-hidden border-2 border-[#B8935A]/60 bg-[#0B1F3A]">
              <ConnectLnSovereignBlueprintCanvas
                scene={course.scene}
                clock={clock}
                skillTag={course.skillTag}
              />
              <span className="absolute bottom-2.5 right-2.5 rounded bg-[#0B1F3A]/95 text-[#E6C687] border border-[#B8935A] px-2.5 py-1 text-[10px] font-bold">
                ❖ ConnectLn 360 Sovereign Schematic
              </span>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-[#D8CFC0] bg-black">
              <ConnectLnStudioPlayer
                youtubeId={course.youtubeId}
                title={course.title}
                speaker={course.author}
                speakerRole={course.authorTitle}
                description={course.subjectDeepDive}
                takeaways={course.modules}
                autoPlay={true}
              />
            </div>
          )}

          {/* Studio Natural Human Voice Narration Box */}
          <div className="rounded-xl bg-[#0B1F3A] text-white p-4 border border-[#B8935A]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold text-[#E6C687] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>🎙️ Studio Natural Human Voice Narration · Educator: {course.author}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="speak-human-voice-btn"
                  onClick={onSpeak}
                  className="rounded-full bg-[#E6C687] hover:bg-[#d6b372] px-3.5 py-1 text-xs font-extrabold text-[#0B1F3A] cursor-pointer"
                >
                  {isSpeaking ? "⏹ Pause Human Voice" : "🎙️ Speak with Real Human Voice"}
                </button>
                {isSpeaking && (
                  <button
                    type="button"
                    onClick={onStopVoice}
                    className="rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-xs font-bold text-white cursor-pointer"
                  >
                    Mute
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
              &ldquo;{course.voiceScript}&rdquo;
            </p>
          </div>

          {/* Deep Subject Information & Authoritative Reference Links */}
          <div
            data-testid="course-subject-deep-dive-links"
            className="rounded-xl border border-[#D8CFC0] bg-white p-4 space-y-3"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A7438]">
                Deep Subject Dossier &amp; Engineering Standards
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#0B1F3A] mt-0.5">
                About This Subject ({course.skillTag})
              </h4>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                {course.subjectDeepDive}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#0B1F3A]">
                Official Subject Reference Links &amp; Creator Archives:
              </p>
              <div className="flex flex-wrap gap-2">
                {course.referenceLinks.map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFC0] bg-[#FAF7F2] hover:bg-[#0B1F3A] hover:text-white px-3 py-1.5 text-xs font-bold text-[#0B1F3A] transition-colors"
                  >
                    <span>🔗 {ref.label}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Core Technical Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {course.modules.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-[#D8CFC0] bg-white p-3">
                <div className="text-[10px] font-mono font-bold text-[#9A7438] mb-0.5">
                  MODULE 0{idx + 1}
                </div>
                <div className="text-xs font-extrabold text-[#0B1F3A]">{m}</div>
              </div>
            ))}
          </div>

          {/* Other Videos & Briefings from This Person / Creator & Enclave */}
          <div
            data-testid="more-videos-from-creator-section"
            className="rounded-xl border border-[#D8CFC0] bg-white p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-[#0B1F3A] flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-[#9A7438]" />
                <span>
                  Other Videos &amp; Briefings from {course.author} &amp; Related Specialists
                </span>
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${course.author} ${course.title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#0A66C2] hover:underline"
              >
                Explore Full Channel Archive ↗
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {moreFromCreatorAndEnclave.map((other) => (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => onSelectCourse(other)}
                  className="rounded-xl border border-zinc-200 hover:border-[#0B1F3A] bg-[#FAF7F2]/60 p-3 text-left transition-all cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold text-[#9A7438]">
                      {other.skillTag} · {other.duration}
                    </span>
                    <p className="text-xs font-extrabold text-[#0B1F3A] line-clamp-1 mt-0.5">
                      {other.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      By: {other.author}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#0B1F3A] text-[#E6C687] px-2 py-1 text-[10px] font-extrabold">
                    Open →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
