import {
  computeJourneyIndicators,
  EMPTY_JOURNEY,
  JOURNEY_PATHS,
  pathForNamedCourse,
  readJourney,
  writeJourney,
  type JourneyPath,
  type JourneyStore,
} from "./journey-paths.ts";
import {
  resolveJourneyActionToLearn,
  type LearnPositionState,
  type SharedCurriculumRecord,
} from "./journey-learn-bridge.ts";

export type WorkScreenId =
  | "dashboard"
  | "careers"
  | "certifications"
  | "trades"
  | "projects"
  | "opportunities"
  | "passport";

export type EvidenceVerificationTier =
  | "self-reported"
  | "ai-reviewed"
  | "instructor-verified"
  | "issuer-verified";

export type PortfolioVisibility =
  | "private"
  | "employers-only"
  | "shared-link"
  | "public";

export type CredentialLifecycleStatus =
  | "active"
  | "retiring"
  | "retired"
  | "unverified";

export type OpportunityType =
  | "Job"
  | "Internship"
  | "Apprenticeship"
  | "Training Programme";

export type WorkArrangement = "Remote" | "Hybrid" | "On-site";

export type OpportunityListingStatus =
  | "active"
  | "closing-soon"
  | "expired"
  | "unavailable";

/**
 * B. Career Explorer Record (11 required fields)
 */
export type WorkCareerProfile = {
  id: string;
  title: string;
  category: "Cybersecurity & Cloud" | "Software & Data" | "Skilled Trades" | "Engineering & Operations";
  experienceLevel: "Entry Level" | "Mid Level" | "Advanced";
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  entryPathways: string[];
  linkedJourneyId: string;
  linkedCourseTitles: string[];
  relevantCredentialIds: string[];
  practicalExperienceRequirements: string;
  salaryRange: {
    region: string;
    rangeText: string;
    source: string;
    sourceDate: string;
  };
  jobMarketContext: string;
  relatedProjectIds: string[];
  sources: {
    name: string;
    url: string;
    lastVerifiedDate: string;
  }[];
};

/**
 * C. Certification & Qualification Record (8 required fields)
 */
export type WorkCredentialRecord = {
  id: string;
  provider: "AWS" | "Microsoft" | "Splunk" | "CompTIA" | "Cisco" | "ISC2" | "NCCER / ASE";
  officialName: string;
  code: string;
  status: CredentialLifecycleStatus;
  officialUrl: string;
  examObjectives: string[];
  examVersion: string;
  prerequisitesAndEligibility: string[];
  prepJourneyId: string;
  prepCourses: string[];
  examAndRenewalInfo: string;
  lastVerifiedDate: string;
  issuerDistinctionNote: string;
};

/**
 * D. Skilled Trade Pathway Record (8 required elements)
 */
export type WorkSkilledTradePathway = {
  id: string;
  tradeName: string;
  category:
    | "Carpentry"
    | "Masonry"
    | "Construction"
    | "Electrical"
    | "Plumbing"
    | "HVAC"
    | "Welding"
    | "Automotive Repair";
  summary: string;
  safetyInstructions: string[];
  illustratedDemonstrations: {
    title: string;
    summary: string;
    duration: string;
  }[];
  toolsAndMaterials: string[];
  simulatedPracticalExercise: {
    title: string;
    scenario: string;
    expectedTolerances: string;
  };
  projectBriefAndRubric: {
    brief: string;
    rubricCriteria: string[];
  };
  supervisedPracticeRequirements: string;
  apprenticeshipAndProviderLinks: {
    name: string;
    region: string;
    url: string;
  }[];
  localLicensingAndRegulatoryNote: string;
  linkedJourneyId: string;
};

/**
 * E. Project & Practical Experience Record (10 required fields)
 */
export type WorkProjectRecord = {
  id: string;
  title: string;
  owner: string;
  category: "Cloud & Security" | "Web & Software" | "Data & Observability" | "Skilled Trades & Engineering";
  linkedJourneyId: string;
  linkedLessonId: string;
  linkedCareerIds: string[];
  learningObjectives: string[];
  requiredSkills: string[];
  prerequisites: string[];
  taskChecklist: {
    id: string;
    label: string;
  }[];
  referenceResources: {
    title: string;
    url: string;
  }[];
  requiredDeliverables: string[];
  assessmentRubric: {
    id: string;
    criterion: string;
    keywords: string[];
    weightPct: number;
  }[];
};

/**
 * F. Jobs & Opportunities Record (8 required fields)
 */
export type WorkOpportunityRecord = {
  id: string;
  employerOrProvider: string;
  title: string;
  type: OpportunityType;
  description: string;
  location: string;
  workArrangement: WorkArrangement;
  experienceLevel: "Entry Level" | "Apprentice / Trainee" | "Associate";
  eligibilityRequirements: string[];
  requiredSkills: string[];
  preferredQualifications: string[];
  applicationDeadline: string;
  originalListingUrl: string;
  sourceName: string;
  listingStatus: OpportunityListingStatus;
  lastCheckedDate: string;
  linkedCareerId: string;
};

/**
 * G. Portfolio & Skills Passport Evidence Item
 */
export type SkillsPassportItem = {
  id: string;
  title: string;
  category:
    | "project"
    | "work-sample"
    | "assessment"
    | "course-completion"
    | "external-credential"
    | "competency"
    | "experience-feedback";
  summary: string;
  skillsDemonstrated: string[];
  verificationTier: EvidenceVerificationTier;
  provenanceNote: string;
  issuerOrReviewer: string;
  dateRecorded: string;
  visibility: PortfolioVisibility;
  linkedProjectId?: string;
  linkedJourneyId?: string;
  linkedCredentialId?: string;
};

export type ProjectSubmissionRecord = {
  projectId: string;
  completedTaskIds: string[];
  submissionText: string;
  scorePct: number;
  passedRubricIds: string[];
  missingRubricCriteria: string[];
  status: "not-started" | "in-progress" | "submitted" | "verified";
  feedback: string;
  visibility: PortfolioVisibility;
  attachedToPassport: boolean;
  updatedAt: string;
};

export type ExternalCredentialClaim = {
  credentialId: string;
  verificationTier: EvidenceVerificationTier;
  credentialNumberOrUrl?: string;
  issuedDate?: string;
  statusNote: string;
};

export type WorkStoreState = {
  selectedCareerId: string;
  defaultPortfolioVisibility: PortfolioVisibility;
  projectSubmissions: Record<string, ProjectSubmissionRecord>;
  passportItems: SkillsPassportItem[];
  externalCredentialClaims: Record<string, ExternalCredentialClaim>;
  savedOpportunityIds: string[];
};

const WORK_STORAGE_KEY = "noctis-work-store-v1";

/**
 * B. Comprehensive Career Explorer Catalogue
 * Includes "cloud-security-analyst" as the primary end-to-end showcase career.
 */
export const WORK_CAREERS: WorkCareerProfile[] = [
  {
    id: "cloud-security-analyst",
    title: "Cloud Security Analyst",
    category: "Cybersecurity & Cloud",
    experienceLevel: "Entry Level",
    description:
      "Protect cloud infrastructure, audit IAM policies, harden network perimeters, monitor SIEM telemetry, and respond to security incidents across AWS, Azure, and hybrid environments.",
    responsibilities: [
      "Audit IAM roles, bucket permissions, and zero-trust network boundaries for least privilege",
      "Monitor SIEM/Splunk alerts, investigate anomalous API calls, and document incident triage",
      "Harden web applications and APIs against SQL injection, XSS, and credential leakage",
      "Automate security compliance checks and maintain verifiable remediation runbooks",
    ],
    requiredSkills: [
      "IAM & Least-Privilege Access Control",
      "Cloud Networking & VPC Security",
      "Input Validation & SQL Injection Defense",
      "SIEM Log Analysis & Incident Triage",
      "Linux & Network Packet Inspection",
    ],
    preferredSkills: [
      "Terraform Infrastructure as Code Security",
      "Container & Kubernetes Hardening",
      "Automated CloudTrail / GuardDuty Alerting",
    ],
    entryPathways: [
      "Complete Vibe Cybersecurity & Cloud Foundations Journey + Verified Security Project",
      "Junior SOC Analyst or Cloud Support Associate apprenticeship / entry role",
      "Earn CompTIA Security+ or AWS Certified Cloud Practitioner / Security Specialty",
    ],
    linkedJourneyId: "cyber",
    linkedCourseTitles: [
      "Cybersecurity Foundations & Defensive Engineering",
      "AWS Certified Cloud Practitioner",
      "Microsoft Security, Compliance, and Identity Fundamentals (SC-900)",
      "CompTIA Security+ (SY0-701)",
    ],
    relevantCredentialIds: ["cred-aws-security", "cred-ms-sc900", "cred-comptia-secplus", "cred-splunk-power"],
    practicalExperienceRequirements:
      "Demonstrate a hardened web/cloud deployment with zero wildcard IAM permissions, parameterized database queries, and a documented incident response runbook.",
    salaryRange: {
      region: "US / Global Remote & West Africa Tech Hubs",
      rangeText: "$78,000 – $125,000 USD (Global) · GHS 120,000 – 240,000/yr (Ghana Tech/Banking)",
      source: "U.S. BLS Occupational Outlook & Africa Tech Compensation Survey",
      sourceDate: "2026-Q1",
    },
    jobMarketContext:
      "High demand across financial services, cloud service providers, telecoms, and government CERT teams.",
    relatedProjectIds: ["proj-cloud-sec-webapp", "proj-siem-incident-triage"],
    sources: [
      {
        name: "NIST NICE Cybersecurity Workforce Framework (SP 800-181)",
        url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
        lastVerifiedDate: "2026-10-22",
      },
      {
        name: "AWS Security Incident Response Guide",
        url: "https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/welcome.html",
        lastVerifiedDate: "2026-10-22",
      },
    ],
  },
  {
    id: "aws-solutions-architect",
    title: "AWS Solutions Architect",
    category: "Cybersecurity & Cloud",
    experienceLevel: "Mid Level",
    description:
      "Design resilient, high-availability, cost-optimised cloud architectures using VPCs, compute, managed databases, S3 storage, and Well-Architected Framework principles.",
    responsibilities: [
      "Architect multi-AZ VPC networks with public/private subnets, NAT gateways, and load balancers",
      "Select appropriate compute (EC2, ECS, Lambda) and storage (S3, RDS, DynamoDB) for workload SLAs",
      "Implement encryption at rest/in transit, CloudFront Origin Access Control, and backup recovery",
      "Conduct Well-Architected reviews across operational excellence, security, reliability, and cost",
    ],
    requiredSkills: [
      "Cloud Networking & VPC Security",
      "IAM & Least-Privilege Access Control",
      "High-Availability Compute & Auto Scaling",
      "S3 Storage Security & CloudFront Delivery",
      "Cost & Reliability Architecture",
    ],
    preferredSkills: [
      "Terraform / CloudFormation IaC",
      "Serverless Event-Driven Design",
    ],
    entryPathways: [
      "Cloud Support Associate → Junior Cloud Engineer → AWS Solutions Architect",
      "Complete AWS Cloud Architecture Journey + Multi-AZ VPC Capstone Project",
    ],
    linkedJourneyId: "cyber",
    linkedCourseTitles: [
      "AWS Certified Solutions Architect – Associate",
      "AWS Certified Cloud Practitioner",
    ],
    relevantCredentialIds: ["cred-aws-saa", "cred-aws-clf", "cred-aws-security"],
    practicalExperienceRequirements:
      "Build and document a multi-tier VPC architecture diagram, IAM policy set, and disaster-recovery plan.",
    salaryRange: {
      region: "US / Remote & Regional Enterprise",
      rangeText: "$95,000 – $155,000 USD (Global) · GHS 160,000 – 310,000/yr (Regional Cloud Lead)",
      source: "BLS Network & Computer Systems Architects",
      sourceDate: "2026-Q1",
    },
    jobMarketContext:
      "Strong enterprise demand as organisations migrate legacy workloads to cloud-native infrastructure.",
    relatedProjectIds: ["proj-aws-vpc-architecture", "proj-cloud-sec-webapp"],
    sources: [
      {
        name: "AWS Well-Architected Framework",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
        lastVerifiedDate: "2026-10-22",
      },
    ],
  },
  {
    id: "frontend-web-engineer",
    title: "Full-Stack & Accessible Web Engineer",
    category: "Software & Data",
    experienceLevel: "Entry Level",
    description:
      "Build responsive, accessible, standards-compliant web applications using semantic HTML5, modern CSS Grid/Flexbox, TypeScript, and secure API integration.",
    responsibilities: [
      "Structure semantic HTML5 landmarks and verify WCAG 2.2 AA keyboard and contrast compliance",
      "Build responsive mobile-first layouts using CSS Grid, Flexbox, and fluid typography",
      "Connect interactive UI states to validated backend endpoints with clear error handling",
    ],
    requiredSkills: [
      "Semantic HTML5 & Accessibility",
      "Responsive CSS Grid & Flexbox",
      "JavaScript / TypeScript State Management",
      "Input Validation & SQL Injection Defense",
    ],
    preferredSkills: ["Automated Playwright QA Testing", "Performance Core Web Vitals Optimization"],
    entryPathways: [
      "Complete Vibe Web Design Flagship Journey + Accessible Portfolio Project",
      "Junior Frontend Developer or Web Engineering Internship",
    ],
    linkedJourneyId: "web",
    linkedCourseTitles: [
      "Web Design — From First Page to Published Site",
      "JavaScript & TypeScript Web Engineering",
    ],
    relevantCredentialIds: ["cred-aws-clf"],
    practicalExperienceRequirements:
      "Publish a responsive, accessible multi-section web application with verified keyboard navigation and rubric score >= 80%.",
    salaryRange: {
      region: "US / Remote & West Africa",
      rangeText: "$70,000 – $120,000 USD (Global) · GHS 96,000 – 210,000/yr (Ghana Software Teams)",
      source: "MDN / StackOverflow & Regional Developer Survey",
      sourceDate: "2026-Q1",
    },
    jobMarketContext:
      "Consistent entry-level and freelance opportunities across product startups, agencies, and digital public services.",
    relatedProjectIds: ["proj-responsive-web-portfolio", "proj-cloud-sec-webapp"],
    sources: [
      {
        name: "MDN Web Docs & W3C WCAG 2.2",
        url: "https://developer.mozilla.org/",
        lastVerifiedDate: "2026-10-22",
      },
    ],
  },
  {
    id: "structural-finish-carpenter",
    title: "Structural & Finish Carpenter",
    category: "Skilled Trades",
    experienceLevel: "Entry Level",
    description:
      "Read architectural blueprints, lay out wall plates and roof rafters, cut accurate joints safely, and erect code-compliant residential and commercial framing.",
    responsibilities: [
      "Inspect PPE, circular saws, and jobsite fall-protection before cutting",
      "Lay out 16-inch on-center stud walls, window/door headers, and king/jack studs",
      "Calculate roof pitch, mark plumb and birdsmouth cuts with a speed square, and install rafters",
    ],
    requiredSkills: [
      "Jobsite Safety, PPE & OSHA 1926 Compliance",
      "Blueprint Reading & 3-4-5 Square Layout",
      "Wall Framing & Header Load Transfer",
      "Common Rafter & Birdsmouth Roof Framing",
    ],
    preferredSkills: ["Stair Stringer Rise/Run Layout", "Interior Finish Trim & Cabinetry"],
    entryPathways: [
      "Complete Vibe Carpentry Trade Pathway + Supervised Shop/Site Apprenticeship",
      "NCCER Carpentry Level 1 & OSHA 10/30 Construction Safety Card",
    ],
    linkedJourneyId: "eng",
    linkedCourseTitles: [
      "Framing and Roof Construction (Carpentry)",
      "Blueprint Reading & Construction Layout",
    ],
    relevantCredentialIds: ["cred-nccer-carpentry"],
    practicalExperienceRequirements:
      "Complete supervised hands-on wall and rafter framing layout checked by a licensed master tradesperson.",
    salaryRange: {
      region: "US & West Africa Construction Sector",
      rangeText: "$52,000 – $88,000 USD · GHS 60,000 – 145,000/yr (Master Contractor / Site Lead)",
      source: "U.S. BLS Carpenters & National TVET Trade Benchmarks",
      sourceDate: "2026-Q1",
    },
    jobMarketContext:
      "High residential and commercial building demand; requires supervised practical hours and local contractor licensing where applicable.",
    relatedProjectIds: ["proj-carpentry-rafter-layout"],
    sources: [
      {
        name: "OSHA 29 CFR 1926 Construction Safety Standards",
        url: "https://www.osha.gov/construction",
        lastVerifiedDate: "2026-10-22",
      },
    ],
  },
  {
    id: "automotive-diagnostic-tech",
    title: "Automotive Diagnostic & Repair Technician",
    category: "Skilled Trades",
    experienceLevel: "Entry Level",
    description:
      "Diagnose engine, fuel, ignition, electrical, and braking systems using OBD-II live scan data, digital multimeters, and systematic fault-isolation trees.",
    responsibilities: [
      "Secure vehicles on certified lifts, chock wheels, and follow high-voltage/battery safety protocols",
      "Interpret OBD-II Diagnostic Trouble Codes (DTCs), short/long-term fuel trims, and sensor waveforms",
      "Perform parasitic draw, voltage-drop, compression, and brake hydraulic inspections",
    ],
    requiredSkills: [
      "Shop Lift, Jack Stand & PPE Safety",
      "OBD-II Live Data & Fuel Trim Diagnostics",
      "Multimeter Voltage-Drop & Circuit Testing",
      "Brake & Chassis Inspection",
    ],
    preferredSkills: ["Hybrid/EV High-Voltage Safety (ASE L3)", "Oscilloscope Waveform Analysis"],
    entryPathways: [
      "Complete Automotive Diagnostics Pathway + Supervised Service Bay Apprenticeship",
      "Pass ASE G1 / A1–A8 Certification Exams with required hands-on work experience",
    ],
    linkedJourneyId: "eng",
    linkedCourseTitles: [
      "Engine Diagnostics and Repair (Auto Mechanics)",
      "Automotive Electrical & OBD-II Scan Tool Analysis",
    ],
    relevantCredentialIds: ["cred-ase-automotive"],
    practicalExperienceRequirements:
      "Document 3 verified diagnostic case logs (DTC + freeze-frame + multimeter root-cause test) under shop supervision.",
    salaryRange: {
      region: "US & Regional Fleet/Dealership Service",
      rangeText: "$50,000 – $92,000 USD · GHS 58,000 – 140,000/yr (Diagnostic Specialist)",
      source: "ASE & BLS Automotive Service Technicians",
      sourceDate: "2026-Q1",
    },
    jobMarketContext:
      "Modern vehicles require technicians who can combine mechanical skill with electronic waveform and scan-tool diagnostics.",
    relatedProjectIds: ["proj-auto-obd2-diagnosis"],
    sources: [
      {
        name: "National Institute for Automotive Service Excellence (ASE)",
        url: "https://www.ase.com/",
        lastVerifiedDate: "2026-10-22",
      },
    ],
  },
];

/**
 * C. Certifications & Qualifications Catalogue (Official Provider Source of Truth)
 */
export const WORK_CREDENTIALS: WorkCredentialRecord[] = [
  {
    id: "cred-aws-saa",
    provider: "AWS",
    officialName: "AWS Certified Solutions Architect – Associate",
    code: "SAA-C03",
    status: "active",
    officialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    examObjectives: [
      "Domain 1: Design Secure Architectures (30%)",
      "Domain 2: Design Resilient Architectures (26%)",
      "Domain 3: Design High-Performing Architectures (24%)",
      "Domain 4: Design Cost-Optimized Architectures (20%)",
    ],
    examVersion: "SAA-C03 (Current Active Version)",
    prerequisitesAndEligibility: [
      "No mandatory formal prerequisite; 1+ year hands-on AWS deployment experience recommended",
      " foundational cloud networking and IAM knowledge",
    ],
    prepJourneyId: "cyber",
    prepCourses: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect – Associate",
    ],
    examAndRenewalInfo: "65 questions · 130 minutes · Passing score 720/1000 · Valid for 3 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Vibe provides structured exam preparation, architecture labs, and readiness checks. The official AWS SAA-C03 certification is issued solely by Amazon Web Services upon passing the proctored Pearson VUE exam.",
  },
  {
    id: "cred-aws-clf",
    provider: "AWS",
    officialName: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    status: "active",
    officialUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
    examObjectives: [
      "Domain 1: Cloud Concepts (24%)",
      "Domain 2: Security and Compliance (30%)",
      "Domain 3: Cloud Technology and Services (34%)",
      "Domain 4: Billing, Pricing, and Support (12%)",
    ],
    examVersion: "CLF-C02",
    prerequisitesAndEligibility: ["Entry-level; no prior cloud certification required"],
    prepJourneyId: "cyber",
    prepCourses: ["AWS Certified Cloud Practitioner"],
    examAndRenewalInfo: "65 questions · 90 minutes · Passing score 700/1000 · Valid for 3 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official credential is awarded by Amazon Web Services. Vibe course completion records preparatory training only.",
  },
  {
    id: "cred-aws-security",
    provider: "AWS",
    officialName: "AWS Certified Security – Specialty",
    code: "SCS-C02",
    status: "active",
    officialUrl: "https://aws.amazon.com/certification/certified-security-specialty/",
    examObjectives: [
      "Threat Detection and Incident Response (14%)",
      "Security Logging and Monitoring (18%)",
      "Infrastructure Security (20%)",
      "Identity and Access Management (16%)",
      "Data Protection (18%)",
      "Management and Security Governance (14%)",
    ],
    examVersion: "SCS-C02",
    prerequisitesAndEligibility: [
      "Recommended 2+ years hands-on securing AWS workloads",
      "AWS Cloud Practitioner or Solutions Architect Associate recommended first",
    ],
    prepJourneyId: "cyber",
    prepCourses: [
      "Cybersecurity Foundations & Defensive Engineering",
      "AWS Certified Security – Specialty",
    ],
    examAndRenewalInfo: "65 questions · 170 minutes · Passing score 750/1000 · Valid for 3 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official specialty credential must be earned via AWS Training & Certification.",
  },
  {
    id: "cred-ms-sc900",
    provider: "Microsoft",
    officialName: "Microsoft Certified: Security, Compliance, and Identity Fundamentals",
    code: "SC-900",
    status: "active",
    officialUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/",
    examObjectives: [
      "Describe the concepts of security, compliance, and identity (10–15%)",
      "Describe the capabilities of Microsoft Entra (25–30%)",
      "Describe the capabilities of Microsoft Security solutions (35–40%)",
      "Describe the capabilities of Microsoft compliance solutions (20–25%)",
    ],
    examVersion: "SC-900 (2026 Skills Measured)",
    prerequisitesAndEligibility: [
      "Familiarity with Microsoft Azure and Microsoft 365 fundamentals",
    ],
    prepJourneyId: "cyber",
    prepCourses: ["SC-900: Microsoft Security, Compliance, and Identity Fundamentals"],
    examAndRenewalInfo: "45 minutes · Passing score 700/1000 · Fundamentals certifications do not expire.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official certification is issued by Microsoft Learn upon passing Exam SC-900.",
  },
  {
    id: "cred-comptia-secplus",
    provider: "CompTIA",
    officialName: "CompTIA Security+",
    code: "SY0-701",
    status: "active",
    officialUrl: "https://www.comptia.org/certifications/security",
    examObjectives: [
      "1.0 General Security Concepts (12%)",
      "2.0 Threats, Vulnerabilities, and Mitigations (22%)",
      "3.0 Security Architecture (18%)",
      "4.0 Security Operations (28%)",
      "5.0 Security Program Management and Oversight (20%)",
    ],
    examVersion: "SY0-701 (SY0-601 retired)",
    prerequisitesAndEligibility: [
      "CompTIA Network+ and 2 years of IT administration with security focus recommended",
    ],
    prepJourneyId: "cyber",
    prepCourses: ["CompTIA Security+ (SY0-701)"],
    examAndRenewalInfo: "Max 90 questions · 90 minutes · Passing score 750/900 · Renews every 3 years (CEUs).",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official CompTIA Security+ certification requires passing the Pearson VUE exam.",
  },
  {
    id: "cred-splunk-power",
    provider: "Splunk",
    officialName: "Splunk Core Certified Power User",
    code: "SPLK-1002",
    status: "active",
    officialUrl: "https://www.splunk.com/en_us/training/certification-track/splunk-core-certified-power-user.html",
    examObjectives: [
      "Using Transforming Commands and Visualizations",
      "Filtering and Formatting Results with eval and search commands",
      "Correlating Events and Transactions",
      "Creating and Managing Fields, Field Aliases, and Calculated Fields",
    ],
    examVersion: "SPLK-1002",
    prerequisitesAndEligibility: ["Splunk Core Certified User recommended"],
    prepJourneyId: "cyber",
    prepCourses: ["Splunk Core Certified Power User Preparation"],
    examAndRenewalInfo: "65 questions · 60 minutes · Valid for 3 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official Splunk certification is issued by Splunk Education / Pearson VUE.",
  },
  {
    id: "cred-cisco-ccna",
    provider: "Cisco",
    officialName: "Cisco Certified Network Associate (CCNA)",
    code: "200-301",
    status: "active",
    officialUrl: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html",
    examObjectives: [
      "Network Fundamentals (20%) & Network Access (20%)",
      "IP Connectivity (25%) & IP Services (10%)",
      "Security Fundamentals (15%) & Automation and Programmability (10%)",
    ],
    examVersion: "200-301 CCNA v1.1",
    prerequisitesAndEligibility: ["No formal prerequisites; basic IP networking recommended"],
    prepJourneyId: "cyber",
    prepCourses: ["Cisco CCNA (200-301) Routing, Switching & Network Defense"],
    examAndRenewalInfo: "120 minutes · Valid for 3 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote: "Official CCNA credential is issued by Cisco Systems.",
  },
  {
    id: "cred-isc2-cc",
    provider: "ISC2",
    officialName: "ISC2 Certified in Cybersecurity (CC)",
    code: "ISC2-CC",
    status: "active",
    officialUrl: "https://www.isc2.org/certifications/cc",
    examObjectives: [
      "Domain 1: Security Principles (26%)",
      "Domain 2: Business Continuity, Disaster Recovery & Incident Response (10%)",
      "Domain 3: Access Controls Concepts (22%)",
      "Domain 4: Network Security (24%)",
      "Domain 5: Security Operations (18%)",
    ],
    examVersion: "CC 2026",
    prerequisitesAndEligibility: ["Entry-level; no prior work experience required"],
    prepJourneyId: "cyber",
    prepCourses: ["ISC2 Certified in Cybersecurity (CC) Foundations"],
    examAndRenewalInfo: "100 items · 2 hours · Renews every 3 years with 45 CPEs.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote: "Official credential is conferred by ISC2.",
  },
  {
    id: "cred-nccer-carpentry",
    provider: "NCCER / ASE",
    officialName: "NCCER Carpentry Level 1 & OSHA 1926 Safety Qualification",
    code: "NCCER-CARP-L1",
    status: "active",
    officialUrl: "https://www.nccer.org/",
    examObjectives: [
      "Orientation to the Trade, Building Materials, Fasteners, and Adhesives",
      "Hand and Power Tools Safety & Floor Systems",
      "Wall Systems, Ceiling Joist and Roof Framing",
    ],
    examVersion: "NCCER 6th Edition",
    prerequisitesAndEligibility: ["NCCER Core Curriculum + supervised shop performance verification"],
    prepJourneyId: "eng",
    prepCourses: ["Framing and Roof Construction (Carpentry)"],
    examAndRenewalInfo: "Written module exams + hands-on Performance Profile checklists.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official NCCER wallet card and state trade licences require in-person performance verification by an accredited training sponsor.",
  },
  {
    id: "cred-ase-automotive",
    provider: "NCCER / ASE",
    officialName: "ASE G1 Auto Maintenance & Light Repair / A8 Engine Performance",
    code: "ASE-G1-A8",
    status: "active",
    officialUrl: "https://www.ase.com/",
    examObjectives: [
      "Engine Systems, Ignition, Fuel, Exhaust, and Emissions Control Diagnosis",
      "Computerized Engine Controls and OBD-II Scan Data Interpretation",
      "Brake, Suspension, Steering, and Electrical System Inspection",
    ],
    examVersion: "ASE 2026 Test Series",
    prerequisitesAndEligibility: [
      "Pass proctored ASE exam + 1 to 2 years of verified hands-on automotive shop experience",
    ],
    prepJourneyId: "eng",
    prepCourses: ["Engine Diagnostics and Repair (Auto Mechanics)"],
    examAndRenewalInfo: "Valid for 5 years.",
    lastVerifiedDate: "2026-10-22",
    issuerDistinctionNote:
      "Official ASE certification requires both passing the proctored test and submitting verified hands-on work experience to ASE.",
  },
];

/**
 * D. Skilled Trades Pathways (8 separate occupation pathways with full safety & licensing)
 */
export const WORK_SKILLED_TRADES: WorkSkilledTradePathway[] = [
  {
    id: "trade-carpentry",
    tradeName: "Structural & Finish Carpentry",
    category: "Carpentry",
    summary:
      "Wall layout, load-bearing headers, 3-4-5 corner squaring, common rafter plumb/birdsmouth cuts, and safe circular saw operation.",
    safetyInstructions: [
      "Wear ANSI Z87.1 safety glasses, hearing protection, and steel-toe boots before entering the cutting zone.",
      "Inspect circular saw blade guard return spring, cord insulation, and set blade depth 1/4 inch below stock.",
      "Use fall protection (OSHA 1926.501) when working on top plates or roof decking 6 feet or more above lower levels.",
    ],
    illustratedDemonstrations: [
      {
        title: "3-4-5 Right-Triangle Corner Squaring & Bottom Plate Layout",
        summary: "Marking 16-inch on-center studs, king/jack studs, and verifying diagonal equality.",
        duration: "14 min shop demo",
      },
      {
        title: "Pivoting a Speed Square for 6-in-12 Common Rafter Birdsmouth Cuts",
        summary: "Laying out ridge plumb cuts and heel/seat cuts without exceeding 1/3 rafter depth.",
        duration: "12 min shop demo",
      },
    ],
    toolsAndMaterials: [
      "7-inch Rafter Speed Square & 25-ft Framing Tape Measure",
      "7-1/4 inch Worm-Drive / Sidewinder Circular Saw",
      "Chalk Line, Spirit Level, Framing Hammer & 16d Nails",
      "2x4 / 2x6 Kiln-Dried Wall Studs & 2x8 / 2x10 Roof Rafters",
    ],
    simulatedPracticalExercise: {
      title: " Wall Opening & Common Rafter Cut Calculation",
      scenario:
        "Calculate the rough opening width for a 36-inch window with single jack studs and verify maximum birdsmouth notch depth on a 2x8 rafter (actual depth 7.25 inches).",
      expectedTolerances: "Rough opening = 39 inches + trimmer clearance; max birdsmouth depth <= 2.41 inches (1/3 depth).",
    },
    projectBriefAndRubric: {
      brief:
        "Lay out a 10-foot wall plate with one rough window opening and calculate/mark a 6-in-12 common rafter sample.",
      rubricCriteria: [
        "PPE & saw guard pre-start safety verification documented",
        "16-inch on-center stud layout with king, jack, header, and cripple studs accurately marked",
        "Birdsmouth seat cut flat on wall plate without over-notching past 1/3 depth",
      ],
    },
    supervisedPracticeRequirements:
      "All live power-saw cutting and elevated roof framing must be performed under the direct supervision of a qualified carpentry instructor or licensed framing contractor.",
    apprenticeshipAndProviderLinks: [
      {
        name: "NCCER Accredited Carpentry Training Centers",
        region: "North America & International",
        url: "https://www.nccer.org/",
      },
      {
        name: "CTVET / National TVET Construction Apprenticeship",
        region: "Ghana & West Africa",
        url: "https://ctvet.gov.gh/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Educational completion on Vibe does not grant a contractor licence. Structural building work requires local municipal building permits and licensed supervision.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-masonry",
    tradeName: "Brick, Block & Stone Masonry",
    category: "Masonry",
    summary:
      "Mortar batching (ASTM C270 Type N/S), corner lead erection, story-pole course gauging, and plumb/level line laying.",
    safetyInstructions: [
      "Wear alkali-resistant gloves and eye protection when mixing Portland cement and hydrated lime.",
      "Use NIOSH-approved N95/P100 respiratory protection and wet-cut saws to prevent crystalline silica dust inhalation (OSHA 1926.1153).",
      "Inspect tubular welded frame scaffolding, guardrails, and toeboards before loading CMU blocks.",
    ],
    illustratedDemonstrations: [
      {
        title: "Batching Type S vs. Type N Mortar & Furrowing the Bed Joint",
        summary: "Achieving workable plasticity, buttering head joints, and tapping units to the mason’s line.",
        duration: "15 min demo",
      },
      {
        title: "Building a 4-Course Corner Lead with a Story Pole & 48-Inch Level",
        summary: "Checking plumb, level, and straight-edge alignment before filling the wall between leads.",
        duration: "18 min demo",
      },
    ],
    toolsAndMaterials: [
      "London/Philadelphia Brick Trowel & Pointing Trowel",
      "48-inch Mason’s Level, Modular Rule / Story Pole & Line Blocks",
      "Convex Jointer (Sled Runner) & Brick Set Chisel",
      "8x8x16 Concrete Masonry Units (CMU), Clay Bricks & ASTM C270 Mortar",
    ],
    simulatedPracticalExercise: {
      title: "CMU Course Height & Mortar Type Selection",
      scenario:
        "Select the correct ASTM C270 mortar type for an exterior load-bearing foundation wall and verify total height of 6 modular courses (3/8-inch bed joints).",
      expectedTolerances: "Type S or M mortar; 6 courses of 8-inch nominal CMU = 48.0 inches (±1/8 inch).",
    },
    projectBriefAndRubric: {
      brief: "Lay out and document a plumb, level 4-course corner lead with tooled 3/8-inch concave joints.",
      rubricCriteria: [
        "Silica dust control & alkaline PPE safety documented",
        "Correct mortar type selected for structural exposure",
        "3/8-inch uniform bed and head joints tooled thumbprint-hard",
      ],
    },
    supervisedPracticeRequirements:
      "Structural load-bearing walls and scaffold operations require in-person supervision by a certified master mason.",
    apprenticeshipAndProviderLinks: [
      {
        name: "International Masonry Institute (IMI) & BAC Apprenticeship",
        region: "US / International",
        url: "https://www.imiweb.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Structural masonry must conform to local building codes (IBC / Eurocode / Ghana Building Code GS 1207).",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-electrical",
    tradeName: "Electrical Installations & NEC Wiring",
    category: "Electrical",
    summary:
      "Lockout/Tagout (LOTO) zero-energy verification, branch circuit sizing, GFCI/AFCI protection, conduit bending, and three-way switching.",
    safetyInstructions: [
      "Execute Lockout/Tagout (NFPA 70E / OSHA 1910.147) and verify zero voltage using a Live-Dead-Live test on a CAT III/IV multimeter before touching any conductor.",
      "Never work on energized panels; wear arc-rated PPE and insulated tools.",
    ],
    illustratedDemonstrations: [
      {
        title: "Lockout/Tagout & Live-Dead-Live Zero-Energy Verification",
        summary: "Locking the breaker, tagging the disconnect, and testing phase-to-neutral and phase-to-ground.",
        duration: "11 min demo",
      },
      {
        title: "Wiring a 20A GFCI Receptacle (LINE vs. LOAD) & 3-Way Traveler Switch Loop",
        summary: "Stripping 12 AWG THHN/Romex, torquing terminals, and verifying GFCI trip protection.",
        duration: "16 min demo",
      },
    ],
    toolsAndMaterials: [
      "True-RMS CAT III/IV Digital Multimeter & Non-Contact Voltage Tester",
      "Personal LOTO Padlock, Hasps & Danger Tags",
      "Wire Strippers, Lineman’s Pliers, Torque Screwdriver & EMT Conduit Bender",
    ],
    simulatedPracticalExercise: {
      title: "20A Branch Circuit Wire Gauge & Continuous Load Sizing",
      scenario:
        "Size the copper conductor gauge and maximum continuous load (80% NEC rule) for a 20A, 120V commercial lighting circuit.",
      expectedTolerances: "Minimum 12 AWG copper; max continuous load = 16A (1,920W).",
    },
    projectBriefAndRubric: {
      brief: "Document a de-energized 20A GFCI + 3-way switch wiring diagram and LOTO test checklist.",
      rubricCriteria: [
        "LOTO & Live-Dead-Live zero-energy procedure verified first",
        "12 AWG conductor matched to 20A breaker with proper equipment grounding conductor",
        "GFCI LINE and LOAD terminals wired accurately",
      ],
    },
    supervisedPracticeRequirements:
      "All live electrical tie-ins and panel terminations require a licensed master/journeyman electrician.",
    apprenticeshipAndProviderLinks: [
      {
        name: "electrical training ALLIANCE (IBEW / NECA)",
        region: "North America",
        url: "https://www.electricaltrainingalliance.org/",
      },
      {
        name: "Energy Commission Certified Electrical Wiring Program (CEWP)",
        region: "Ghana",
        url: "https://www.energycom.gov.gh/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Electrical work legally requires a state Journeyman/Master Electrician licence or Energy Commission Certified Electrical Wiring Professional (CEWP) licence.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-plumbing",
    tradeName: "Plumbing, Piping & Drainage Systems",
    category: "Plumbing",
    summary:
      "Potable water supply sizing, PEX/copper soldering, DWV (Drain-Waste-Vent) 1/4-inch-per-foot slope, P-traps, and backflow prevention.",
    safetyInstructions: [
      "Use fire-resistant heat shields and keep a Class ABC fire extinguisher on hand when brazing or soldering copper pipe.",
      "Protect against sewer gas (methane/hydrogen sulfide) and biohazards when servicing existing DWV lines.",
    ],
    illustratedDemonstrations: [
      {
        title: "DWV Sanitary Tee vs. Long-Sweep 90° & 1/4-Inch-per-Foot Pitch",
        summary: "Setting horizontal drain pitch with a torpedo level and protecting trap seals with proper venting.",
        duration: "13 min demo",
      },
    ],
    toolsAndMaterials: [
      "Tubing Cutter, Deburring Reamer, PEX Expansion/Crimp Tool & Torpedo Level",
      "Lead-Free Solder, Flux, MAPP/Propane Torch & PVC Primer/Solvent Cement",
    ],
    simulatedPracticalExercise: {
      title: "DWV Horizontal Drain Drop Calculation",
      scenario: "Calculate the total elevation drop required for a 12-foot horizontal 2-inch PVC drain line at 1/4 inch per foot.",
      expectedTolerances: "3.0 inches total drop.",
    },
    projectBriefAndRubric: {
      brief: "Design and pressure-test a lavatory P-trap, AAV/vent connection, and shutoff valve assembly.",
      rubricCriteria: [
        "1/4 inch per foot slope verified on horizontal drain run",
        "Sanitary tee used vertically and long-sweep 90 used horizontally",
        "Zero leaks under hydrostatic/air pressure test",
      ],
    },
    supervisedPracticeRequirements:
      "Potable water cross-connection and municipal sewer tie-ins must be supervised by a licensed master plumber.",
    apprenticeshipAndProviderLinks: [
      {
        name: "UA Plumbers & Pipefitters Apprenticeship",
        region: "International",
        url: "https://ua.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Plumbing installations require IPC/UPC code compliance and a municipal plumbing licence.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-hvac",
    tradeName: "HVACR & Heat Pump Systems",
    category: "HVAC",
    summary:
      "Vapor-compression refrigeration cycle, superheat and subcooling diagnostics, manifold gauge operation, vacuum evacuation (<500 microns), and refrigerant recovery.",
    safetyInstructions: [
      "Wear splash goggles and leather gloves when connecting refrigerant manifold hoses to prevent liquid refrigerant frostbite.",
      "Never vent refrigerants to the atmosphere; use certified recovery cylinders.",
    ],
    illustratedDemonstrations: [
      {
        title: "Measuring Superheat & Subcooling and Evacuating to 500 Microns",
        summary: "Diagnosing undercharge vs. TXV restriction and performing a standing micron decay test.",
        duration: "17 min demo",
      },
    ],
    toolsAndMaterials: [
      "Digital Manifold Gauge Set, Clamp Thermometers & Micron Vacuum Gauge",
      "Refrigerant Recovery Machine, Two-Stage Vacuum Pump & Nitrogen Regulator",
    ],
    simulatedPracticalExercise: {
      title: "Subcooling & Superheat Charge Diagnosis",
      scenario:
        "Given suction line temp 54°F, evaporator saturation temp 40°F, liquid line temp 98°F, and condenser saturation temp 110°F, calculate superheat and subcooling.",
      expectedTolerances: "Superheat = 14°F; Subcooling = 12°F (normal balanced TXV system).",
    },
    projectBriefAndRubric: {
      brief: "Record a complete nitrogen pressure test, 500-micron evacuation, and superheat/subcooling diagnostic log.",
      rubricCriteria: [
        "Nitrogen leak test held steady before evacuation",
        "Vacuum pulled below 500 microns and held during standing decay check",
        "Superheat and subcooling calculated accurately from saturation tables",
      ],
    },
    supervisedPracticeRequirements:
      "Handling regulated refrigerants requires certified supervision and EPA Section 608 / national F-Gas certification.",
    apprenticeshipAndProviderLinks: [
      {
        name: "HVAC Excellence & EPA 608 Certification",
        region: "US / International",
        url: "https://www.escogroup.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Purchasing or recovering refrigerants legally requires EPA Section 608 (or local equivalent) certification.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-welding",
    tradeName: "Structural & Pipe Welding (SMAW, GMAW, GTAW)",
    category: "Welding",
    summary:
      "Arc welding safety, Shade 10–13 auto-darkening helmets, joint preparation, E7018 low-hydrogen electrode control, and visual weld inspection (AWS D1.1).",
    safetyInstructions: [
      "Wear a Shade 10–13 welding helmet, flame-resistant leather jacket/gauntlets, and ensure local exhaust ventilation for welding fumes.",
      "Clear all flammable materials within 35 feet and assign a fire watch when required.",
    ],
    illustratedDemonstrations: [
      {
        title: "Running a 2F Horizontal Fillet Weld with 1/8-Inch E7018",
        summary: "Setting DCEP amperage (110–135A), maintaining a 15° travel angle, and preventing undercut.",
        duration: "14 min demo",
      },
    ],
    toolsAndMaterials: [
      "CC/CV Inverter Welder, Shade 10–13 Helmet & Flame-Resistant Leather PPE",
      "E7018 Low-Hydrogen Rod Oven, Chipping Hammer, Wire Brush & Fillet Weld Gauge",
    ],
    simulatedPracticalExercise: {
      title: "E7018 Storage & Fillet Weld Defect Inspection",
      scenario:
        "Identify why E7018 electrodes must be kept in a 250°F–300°F holding oven and how to correct toe undercut on a 1/4-inch fillet weld.",
      expectedTolerances: "Prevents moisture pickup / hydrogen cracking; slow travel speed and pause at top toe.",
    },
    projectBriefAndRubric: {
      brief: "Prepare, tack, weld, and visually inspect a 1/4-inch T-joint fillet coupon to AWS D1.1 criteria.",
      rubricCriteria: [
        "Arc-flash, fume extraction, and hot-work safety verified",
        "Uniform bead profile with full root fusion and zero cracks or porosity",
        "Fillet leg size verified with a weld gauge",
      ],
    },
    supervisedPracticeRequirements:
      "Live arc welding and oxy-fuel cutting must be conducted in an approved welding booth under instructor supervision.",
    apprenticeshipAndProviderLinks: [
      {
        name: "American Welding Society (AWS) Sense & Accredited Test Facilities",
        region: "International",
        url: "https://www.aws.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Structural welder qualification requires passing a physical destructive/non-destructive bend or X-ray test at an AWS-accredited facility.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-construction",
    tradeName: "General Building & Site Construction Management",
    category: "Construction",
    summary:
      "Site grading, concrete formwork & rebar placement, scaffold inspection, OSHA 30 hazard control, and critical-path scheduling.",
    safetyInstructions: [
      "Enforce OSHA Focus Four protections (Falls, Caught-In/Between, Struck-By, Electrocution) on every shift.",
      "Competent person must inspect excavations deeper than 5 feet for shoring/sloping before entry.",
    ],
    illustratedDemonstrations: [
      {
        title: "Concrete Slump Testing, Rebar Chair Cover & Formwork Bracing",
        summary: "Verifying water-cement ratio, 3-inch minimum earth-cast rebar cover, and blowout prevention.",
        duration: "15 min demo",
      },
    ],
    toolsAndMaterials: [
      "Builder’s Auto-Level / Laser Transit, Slump Cone, Rebar Tiers & Formwork Stakes",
    ],
    simulatedPracticalExercise: {
      title: "Concrete Volume & Rebar Cover Calculation",
      scenario: "Calculate cubic yards of concrete for a 20ft × 27ft slab at 4 inches thick (divide cubic feet by 27).",
      expectedTolerances: "20 × 27 × (4/12) = 180 cu ft = 6.67 cubic yards (+ 10% waste = 7.34 yd³).",
    },
    projectBriefAndRubric: {
      brief: "Prepare a site safety plan, concrete quantity take-off, and pre-pour formwork inspection checklist.",
      rubricCriteria: [
        "OSHA Focus Four controls specified for site hazards",
        "Exact cubic yardage + 10% waste factor calculated",
        "Rebar clearance and expansion joint spacing verified",
      ],
    },
    supervisedPracticeRequirements:
      "Trenching, crane rigging, and structural concrete pours require a certified site superintendent.",
    apprenticeshipAndProviderLinks: [
      {
        name: "NCCER Construction Craft & Site Management",
        region: "International",
        url: "https://www.nccer.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "General contracting requires state/municipal contractor licensing, bonding, and building department inspections.",
    linkedJourneyId: "eng",
  },
  {
    id: "trade-automotive",
    tradeName: "Automotive Engine, Brake & Electrical Repair",
    category: "Automotive Repair",
    summary:
      "Two-post lift and jack-stand safety, OBD-II fuel trim and misfire diagnostics, multimeter voltage-drop testing, and disc/drum brake service.",
    safetyInstructions: [
      "Position lift arms on manufacturer-specified pinch-weld/frame lift points, shake-test at 6 inches, and engage mechanical safety locks.",
      "Disconnect negative 12V battery cable and observe orange high-voltage cable isolation rules on hybrid/EV vehicles.",
    ],
    illustratedDemonstrations: [
      {
        title: "Diagnosing Vacuum Leaks vs. Fuel Delivery with STFT & LTFT Live Data",
        summary: "Comparing idle (+18% LTFT) vs. 2,500 RPM (+3% LTFT) to isolate an intake manifold vacuum leak.",
        duration: "14 min demo",
      },
    ],
    toolsAndMaterials: [
      "OBD-II Bi-Directional Scan Tool, Digital Multimeter & Smoke Machine",
      "Micrometer, Dial Indicator (Rotor Runout) & Calibrated Torque Wrench",
    ],
    simulatedPracticalExercise: {
      title: "P0171 Lean Code Fuel Trim Isolation",
      scenario:
        "Long-Term Fuel Trim is +21% at idle (750 RPM) and drops to +2% at 2,500 RPM. Identify the most likely fault and verification test.",
      expectedTolerances: "Unmetered air / vacuum leak downstream of MAF sensor; verify with intake smoke test.",
    },
    projectBriefAndRubric: {
      brief: "Submit a complete diagnostic worksheet for a P0171 / P0300 drivability fault with live-data evidence.",
      rubricCriteria: [
        "Vehicle lift lock & wheel chock safety verified",
        "Freeze-frame & idle vs. 2,500 RPM fuel trim comparison recorded",
        "Root cause verified with physical test (smoke test / voltage drop / fuel pressure)",
      ],
    },
    supervisedPracticeRequirements:
      "Live brake hydraulics, steering/suspension, and shop-lift operations require supervision by an ASE-certified technician.",
    apprenticeshipAndProviderLinks: [
      {
        name: "ASE Education Foundation Accredited Programs",
        region: "US / International",
        url: "https://www.aseeducationfoundation.org/",
      },
    ],
    localLicensingAndRegulatoryNote:
      "Official emissions, safety-inspection, and commercial repair certifications are issued by state DMV/ASE authorities.",
    linkedJourneyId: "eng",
  },
];

/**
 * E. Practical Projects Catalogue (10 required fields per project)
 */
export const WORK_PROJECTS: WorkProjectRecord[] = [
  {
    id: "proj-cloud-sec-webapp",
    title: "Build & Harden a Secure Cloud Web Application",
    owner: "Noctis Security & Cloud Guild",
    category: "Cloud & Security",
    linkedJourneyId: "cyber",
    linkedLessonId: "cyber-1-1",
    linkedCareerIds: ["cloud-security-analyst", "aws-solutions-architect", "frontend-web-engineer"],
    learningObjectives: [
      "Eliminate SQL injection and XSS vulnerabilities using parameterized queries and strict input validation",
      "Define a least-privilege AWS IAM policy and private S3 + CloudFront Origin Access Control configuration",
      "Produce an incident triage & SIEM alert runbook for unauthorized API access attempts",
    ],
    requiredSkills: [
      "Input Validation & SQL Injection Defense",
      "IAM & Least-Privilege Access Control",
      "Cloud Networking & VPC Security",
      "SIEM Log Analysis & Incident Triage",
    ],
    prerequisites: [
      "Cybersecurity Module 1 (Input Defense & Threat Modeling)",
      "Basic HTTP, SQL, and Cloud IAM concepts",
    ],
    taskChecklist: [
      {
        id: "task-sql-param",
        label: "Replace string-concatenated SQL with parameterized prepared statements and server-side allow-lists",
      },
      {
        id: "task-iam-policy",
        label: "Write a least-privilege IAM role policy scoped to specific S3/RDS ARNs with MFA condition and zero '*' wildcards",
      },
      {
        id: "task-siem-runbook",
        label: "Document the SIEM detection query and containment steps for repeated 403/401 authentication anomalies",
      },
    ],
    referenceResources: [
      {
        title: "OWASP SQL Injection Prevention Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
      },
      {
        title: "AWS IAM Security Best Practices",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
      },
    ],
    requiredDeliverables: [
      "Parameterized query & input validation code/specification",
      "Least-privilege IAM JSON policy summary",
      "Incident containment & verification checklist",
    ],
    assessmentRubric: [
      {
        id: "rubric-input-defense",
        criterion: "Parameterized SQL & Input Validation",
        keywords: ["parameterized", "prepared", "validation", "allow", "sql", "sanitize"],
        weightPct: 35,
      },
      {
        id: "rubric-iam-least-priv",
        criterion: "Least-Privilege IAM & Network Isolation",
        keywords: ["iam", "least privilege", "least-privilege", "vpc", "s3", "mfa", "role"],
        weightPct: 35,
      },
      {
        id: "rubric-incident-triage",
        criterion: "SIEM Detection & Incident Containment Runbook",
        keywords: ["siem", "log", "alert", "triage", "incident", "contain", "audit"],
        weightPct: 30,
      },
    ],
  },
  {
    id: "proj-aws-vpc-architecture",
    title: "Multi-AZ AWS VPC & Resilient Cloud Architecture Blueprint",
    owner: "Noctis Cloud Architecture Studio",
    category: "Cloud & Security",
    linkedJourneyId: "cyber",
    linkedLessonId: "cyber-1-1",
    linkedCareerIds: ["aws-solutions-architect", "cloud-security-analyst"],
    learningObjectives: [
      "Design a 2-Availability-Zone VPC with public ALB subnets and isolated private RDS subnets",
      "Configure Security Groups, NACLs, and CloudFront Origin Access Control",
    ],
    requiredSkills: [
      "Cloud Networking & VPC Security",
      "High-Availability Compute & Auto Scaling",
      "S3 Storage Security & CloudFront Delivery",
    ],
    prerequisites: ["Cloud Computing & Networking Foundations"],
    taskChecklist: [
      {
        id: "task-vpc-cidr",
        label: "Define non-overlapping CIDR blocks for 2 public subnets and 2 private database subnets across 2 AZs",
      },
      {
        id: "task-sg-chaining",
        label: "Chain Security Groups so RDS port 5432 accepts traffic only from the application tier Security Group",
      },
      {
        id: "task-s3-oac",
        label: "Enable S3 Block Public Access and serve static assets through CloudFront OAC",
      },
    ],
    referenceResources: [
      {
        title: "Amazon VPC User Guide",
        url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
      },
    ],
    requiredDeliverables: [
      "VPC Subnet & Routing Table specification",
      "Security Group chaining & S3 OAC verification summary",
    ],
    assessmentRubric: [
      {
        id: "rubric-vpc-subnets",
        criterion: "Multi-AZ Public/Private Subnet Isolation",
        keywords: ["vpc", "subnet", "private", "public", "multi-az", "nat", "route"],
        weightPct: 50,
      },
      {
        id: "rubric-sg-s3",
        criterion: "Security Group Chaining & S3 Block Public Access",
        keywords: ["security group", "s3", "cloudfront", "oac", "encryption", "least privilege"],
        weightPct: 50,
      },
    ],
  },
  {
    id: "proj-responsive-web-portfolio",
    title: "Accessible Semantic HTML5 & CSS Grid Portfolio Application",
    owner: "Noctis Web Engineering Studio",
    category: "Web & Software",
    linkedJourneyId: "web",
    linkedLessonId: "web-1-1",
    linkedCareerIds: ["frontend-web-engineer"],
    learningObjectives: [
      "Build a semantic document structure (<header>, <nav>, <main>, <section>, <footer>) with skip links",
      "Implement a mobile-first CSS Grid layout that passes WCAG 2.2 AA contrast and keyboard navigation",
    ],
    requiredSkills: [
      "Semantic HTML5 & Accessibility",
      "Responsive CSS Grid & Flexbox",
    ],
    prerequisites: ["Web Design Module 1 & 2"],
    taskChecklist: [
      {
        id: "task-html-landmarks",
        label: "Structure page with semantic HTML5 landmarks and one <h1> heading hierarchy",
      },
      {
        id: "task-css-grid",
        label: "Add responsive CSS Grid / Flexbox layout and visible :focus-visible keyboard states",
      },
    ],
    referenceResources: [
      {
        title: "MDN Accessibility Landmarks",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML",
      },
    ],
    requiredDeliverables: ["Semantic HTML/CSS architecture & accessibility verification report"],
    assessmentRubric: [
      {
        id: "rubric-semantic",
        criterion: "Semantic Landmarks & Heading Hierarchy",
        keywords: ["header", "main", "nav", "footer", "semantic", "heading"],
        weightPct: 50,
      },
      {
        id: "rubric-a11y-grid",
        criterion: "Responsive Grid & WCAG Keyboard/Contrast Accessibility",
        keywords: ["grid", "flex", "responsive", "contrast", "keyboard", "focus", "accessible"],
        weightPct: 50,
      },
    ],
  },
  {
    id: "proj-carpentry-rafter-layout",
    title: "Wall Rough Opening & 6-in-12 Common Rafter Framing Layout",
    owner: "Noctis Skilled Trades Workshop",
    category: "Skilled Trades & Engineering",
    linkedJourneyId: "eng",
    linkedLessonId: "eng-1-1",
    linkedCareerIds: ["structural-finish-carpenter"],
    learningObjectives: [
      "Calculate and mark a 16-inch on-center stud wall with king, jack, and header framing",
      "Lay out a 6-in-12 common rafter plumb cut and birdsmouth notch within 1/3 structural depth limits",
    ],
    requiredSkills: [
      "Jobsite Safety, PPE & OSHA 1926 Compliance",
      "Blueprint Reading & 3-4-5 Square Layout",
      "Wall Framing & Header Load Transfer",
      "Common Rafter & Birdsmouth Roof Framing",
    ],
    prerequisites: ["Carpentry Safety & Tape Measure / Speed Square Layout"],
    taskChecklist: [
      {
        id: "task-ppe-check",
        label: "Document ANSI Z87.1 eye protection, circular saw blade guard check, and 1/4-inch blade depth setting",
      },
      {
        id: "task-wall-rafter",
        label: "Record 3-4-5 corner square check, rough opening dimensions, and birdsmouth depth calculation",
      },
    ],
    referenceResources: [
      {
        title: "OSHA 1926 Construction Safety",
        url: "https://www.osha.gov/construction",
      },
    ],
    requiredDeliverables: ["Framing cut-list, safety checklist, and birdsmouth tolerance verification"],
    assessmentRubric: [
      {
        id: "rubric-trade-safety",
        criterion: "PPE & Circular Saw Guard Safety Verification",
        keywords: ["ppe", "safety", "guard", "glasses", "osha", "clamp"],
        weightPct: 50,
      },
      {
        id: "rubric-framing-math",
        criterion: "3-4-5 Layout, Header Transfer & Birdsmouth Depth Limit",
        keywords: ["3-4-5", "stud", "header", "birdsmouth", "rafter", "plumb", "square"],
        weightPct: 50,
      },
    ],
  },
];

/**
 * F. Sourced Jobs, Internships, Apprenticeships & Training Opportunities
 * Includes active, closing-soon, and expired listings so outdated status handling is verified.
 */
export const WORK_OPPORTUNITIES: WorkOpportunityRecord[] = [
  {
    id: "opp-junior-soc-analyst",
    employerOrProvider: "Sentinel Cloud Defense & CERT Partner",
    title: "Junior SOC & Cloud Security Analyst",
    type: "Job",
    description:
      "Monitor SIEM security alerts, investigate IAM and network anomalies, assist with SQLi/WAF rule tuning, and document incident response tickets.",
    location: "Remote · Global / EMEA",
    workArrangement: "Remote",
    experienceLevel: "Entry Level",
    eligibilityRequirements: [
      "Demonstrated practical project in cloud/web security or SIEM alert triage",
      "Foundational knowledge of TCP/IP, Linux, IAM, and input defense",
    ],
    requiredSkills: [
      "Input Validation & SQL Injection Defense",
      "IAM & Least-Privilege Access Control",
      "SIEM Log Analysis & Incident Triage",
    ],
    preferredQualifications: [
      "CompTIA Security+ (SY0-701) or Microsoft SC-900 / AWS Cloud Practitioner",
    ],
    applicationDeadline: "2026-11-30",
    originalListingUrl: "https://www.nist.gov/itl/applied-cybersecurity/nice",
    sourceName: "Verified Partner Career Feed",
    listingStatus: "active",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "cloud-security-analyst",
  },
  {
    id: "opp-it-support-ghana",
    employerOrProvider: "Accra Digital Infrastructure Services",
    title: "IT Support & Network Security Technician",
    type: "Job",
    description:
      "Support enterprise endpoints, configure VLANs and firewall rules, enforce MFA/IAM policies, and troubleshoot campus and branch connectivity.",
    location: "On-site · Accra, Ghana",
    workArrangement: "On-site",
    experienceLevel: "Entry Level",
    eligibilityRequirements: [
      "Hands-on troubleshooting in Linux/Windows and IP networking",
    ],
    requiredSkills: [
      "Cloud Networking & VPC Security",
      "IAM & Least-Privilege Access Control",
      "Linux & Network Packet Inspection",
    ],
    preferredQualifications: ["CompTIA A+ / Network+ / Security+ or Cisco CCNA"],
    applicationDeadline: "2026-11-18",
    originalListingUrl: "https://ctvet.gov.gh/",
    sourceName: "Ghana Tech & Enterprise Job Board",
    listingStatus: "active",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "cloud-security-analyst",
  },
  {
    id: "opp-aws-cloud-associate",
    employerOrProvider: "CloudScale Partner Network",
    title: "AWS Cloud Support Associate (Apprenticeship / Entry)",
    type: "Apprenticeship",
    description:
      "Assist engineering teams with VPC subnetting, S3 bucket security policies, CloudFront distributions, and EC2/RDS monitoring.",
    location: "Remote / Hybrid",
    workArrangement: "Remote",
    experienceLevel: "Apprentice / Trainee",
    eligibilityRequirements: [
      "Completed cloud fundamentals training and a multi-AZ VPC or cloud security project",
    ],
    requiredSkills: [
      "Cloud Networking & VPC Security",
      "IAM & Least-Privilege Access Control",
      "S3 Storage Security & CloudFront Delivery",
    ],
    preferredQualifications: ["AWS Certified Cloud Practitioner (CLF-C02) or SAA-C03 in progress"],
    applicationDeadline: "2026-12-10",
    originalListingUrl: "https://aws.amazon.com/careers/",
    sourceName: "AWS Partner Talent Network",
    listingStatus: "active",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "aws-solutions-architect",
  },
  {
    id: "opp-frontend-web-intern",
    employerOrProvider: "Vibe Civic & Studio Labs",
    title: "Junior Frontend & Web Accessibility Intern",
    type: "Internship",
    description:
      "Build accessible HTML5/CSS Grid interfaces, run automated keyboard and contrast audits, and ship responsive user journeys.",
    location: "Remote",
    workArrangement: "Remote",
    experienceLevel: "Entry Level",
    eligibilityRequirements: [
      "Portfolio demonstrating semantic HTML5, responsive CSS Grid, and WCAG 2.2 AA compliance",
    ],
    requiredSkills: [
      "Semantic HTML5 & Accessibility",
      "Responsive CSS Grid & Flexbox",
    ],
    preferredQualifications: ["TypeScript & React fundamentals"],
    applicationDeadline: "2026-11-25",
    originalListingUrl: "https://developer.mozilla.org/",
    sourceName: "Vibe Partner Internship Registry",
    listingStatus: "closing-soon",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "frontend-web-engineer",
  },
  {
    id: "opp-carpentry-apprentice",
    employerOrProvider: "Master Builders & Structural Framing Guild",
    title: "Apprentice Structural & Roof Framing Carpenter",
    type: "Apprenticeship",
    description:
      "Paid on-site apprenticeship learning wall layout, header framing, common rafter cutting, and OSHA 1926 safety under a licensed master carpenter.",
    location: "On-site · Regional Training Yard",
    workArrangement: "On-site",
    experienceLevel: "Apprentice / Trainee",
    eligibilityRequirements: [
      "Completed Carpentry Safety & Rafter Layout fundamentals",
      "Physical readiness for supervised jobsite tool operation",
    ],
    requiredSkills: [
      "Jobsite Safety, PPE & OSHA 1926 Compliance",
      "Blueprint Reading & 3-4-5 Square Layout",
      "Common Rafter & Birdsmouth Roof Framing",
    ],
    preferredQualifications: ["OSHA 10-Hour Construction Card / NCCER Core"],
    applicationDeadline: "2026-12-01",
    originalListingUrl: "https://www.nccer.org/",
    sourceName: "Accredited Trade Apprenticeship Registry",
    listingStatus: "active",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "structural-finish-carpenter",
  },
  {
    id: "opp-legacy-network-role-expired",
    employerOrProvider: "Legacy Telco Operations",
    title: "Junior Network NOC Trainee (2025 Cohort)",
    type: "Training Programme",
    description:
      " archived 2025 cohort listing retained to demonstrate transparent handling of expired/closed opportunities.",
    location: "On-site",
    workArrangement: "On-site",
    experienceLevel: "Entry Level",
    eligibilityRequirements: ["Basic networking"],
    requiredSkills: ["Cloud Networking & VPC Security"],
    preferredQualifications: ["CCNA"],
    applicationDeadline: "2025-12-31",
    originalListingUrl: "https://www.cisco.com/",
    sourceName: "Archived Partner Feed",
    listingStatus: "expired",
    lastCheckedDate: "2026-10-22",
    linkedCareerId: "cloud-security-analyst",
  },
];

export const EMPTY_WORK_STORE: WorkStoreState = {
  selectedCareerId: "cloud-security-analyst",
  defaultPortfolioVisibility: "private",
  projectSubmissions: {},
  passportItems: [
    {
      id: "passport-initial-competency",
      title: "Cloud Networking & IAM Least-Privilege Foundations",
      category: "competency",
      summary:
        "Demonstrated understanding of VPC public/private subnet isolation and least-privilege IAM role scoping.",
      skillsDemonstrated: [
        "Cloud Networking & VPC Security",
        "IAM & Least-Privilege Access Control",
      ],
      verificationTier: "ai-reviewed",
      provenanceNote: "Verified via Vibe / Noctis Module Assessment Check",
      issuerOrReviewer: "Noctis Assessment Engine",
      dateRecorded: "2026-10-22",
      visibility: "private",
      linkedJourneyId: "cyber",
    },
  ],
  externalCredentialClaims: {
    "cred-aws-clf": {
      credentialId: "cred-aws-clf",
      verificationTier: "self-reported",
      statusNote:
        "Self-reported exam preparation in progress — upload official AWS verification URL/badge to upgrade to issuer-verified.",
    },
  },
  savedOpportunityIds: [],
};

export function readWorkStore(): WorkStoreState {
  if (typeof window === "undefined") return EMPTY_WORK_STORE;
  try {
    const raw = window.localStorage.getItem(WORK_STORAGE_KEY);
    if (!raw) return EMPTY_WORK_STORE;
    const parsed = JSON.parse(raw) as Partial<WorkStoreState>;
    return {
      selectedCareerId:
        typeof parsed.selectedCareerId === "string" &&
        WORK_CAREERS.some((c) => c.id === parsed.selectedCareerId)
          ? parsed.selectedCareerId
          : "cloud-security-analyst",
      defaultPortfolioVisibility:
        parsed.defaultPortfolioVisibility === "employers-only" ||
        parsed.defaultPortfolioVisibility === "shared-link" ||
        parsed.defaultPortfolioVisibility === "public"
          ? parsed.defaultPortfolioVisibility
          : "private",
      projectSubmissions:
        parsed.projectSubmissions && typeof parsed.projectSubmissions === "object"
          ? parsed.projectSubmissions
          : {},
      passportItems: Array.isArray(parsed.passportItems)
        ? parsed.passportItems
        : EMPTY_WORK_STORE.passportItems,
      externalCredentialClaims:
        parsed.externalCredentialClaims &&
        typeof parsed.externalCredentialClaims === "object"
          ? parsed.externalCredentialClaims
          : EMPTY_WORK_STORE.externalCredentialClaims,
      savedOpportunityIds: Array.isArray(parsed.savedOpportunityIds)
        ? parsed.savedOpportunityIds
        : [],
    };
  } catch {
    return EMPTY_WORK_STORE;
  }
}

export function writeWorkStore(next: WorkStoreState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORK_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage quota errors */
  }
}

/**
 * Collects all demonstrated skills across:
 * 1. Passed module checks in JourneyStore
 * 2. Verified projects in WorkStoreState
 * 3. Skills Passport items
 */
export function collectDemonstratedSkills(
  journeyStore: JourneyStore = readJourney(),
  workStore: WorkStoreState = readWorkStore(),
): string[] {
  const skills = new Set<string>();

  // 1. Skills from Skills Passport items
  for (const item of workStore.passportItems) {
    for (const s of item.skillsDemonstrated) {
      skills.add(s);
    }
  }

  // 2. Skills from verified Work projects
  for (const proj of WORK_PROJECTS) {
    const sub = workStore.projectSubmissions[proj.id];
    if (sub && (sub.status === "verified" || sub.scorePct >= 70)) {
      for (const s of proj.requiredSkills) {
        skills.add(s);
      }
    }
  }

  // 3. Skills mapped from passed Journey module checks
  const cyberChecks = journeyStore.checks["cyber"] ?? [];
  if (cyberChecks.length > 0) {
    skills.add("Input Validation & SQL Injection Defense");
    skills.add("Linux & Network Packet Inspection");
  }
  if (cyberChecks.length >= 2) {
    skills.add("IAM & Least-Privilege Access Control");
    skills.add("SIEM Log Analysis & Incident Triage");
  }

  const webChecks = journeyStore.checks["web"] ?? [];
  if (webChecks.length > 0) {
    skills.add("Semantic HTML5 & Accessibility");
    skills.add("Responsive CSS Grid & Flexbox");
  }

  const engChecks = journeyStore.checks["eng"] ?? [];
  if (engChecks.length > 0) {
    skills.add("Jobsite Safety, PPE & OSHA 1926 Compliance");
    skills.add("Blueprint Reading & 3-4-5 Square Layout");
  }

  return Array.from(skills);
}

/**
 * A.4 Career Readiness Breakdown
 * Calculates progress against the selected career goal, showing completed requirements,
 * outstanding skills, and evidence, and explicitly explaining the scoring method.
 */
export function computeCareerReadiness(
  careerId: string,
  journeyStore: JourneyStore = readJourney(),
  workStore: WorkStoreState = readWorkStore(),
): {
  career: WorkCareerProfile;
  readinessPct: number;
  completedSkills: string[];
  outstandingSkills: string[];
  verifiedProjectsCount: number;
  linkedJourneyMasteryPct: number;
  scoringFormulaExplanation: string;
  disclaimer: string;
} {
  const career =
    WORK_CAREERS.find((c) => c.id === careerId) ?? WORK_CAREERS[0]!;
  const demonstrated = collectDemonstratedSkills(journeyStore, workStore);
  const demoLower = new Set(demonstrated.map((s) => s.toLowerCase()));

  const completedSkills = career.requiredSkills.filter((req) =>
    demoLower.has(req.toLowerCase()),
  );
  const outstandingSkills = career.requiredSkills.filter(
    (req) => !demoLower.has(req.toLowerCase()),
  );

  const skillRatio =
    career.requiredSkills.length > 0
      ? completedSkills.length / career.requiredSkills.length
      : 0;

  const linkedPath =
    JOURNEY_PATHS.find((p) => p.id === career.linkedJourneyId) ??
    JOURNEY_PATHS[0]!;
  const journeyIndicators = computeJourneyIndicators(linkedPath, journeyStore);

  const verifiedProjectsCount = career.relatedProjectIds.filter((pid) => {
    const sub = workStore.projectSubmissions[pid];
    return sub && (sub.status === "verified" || sub.scorePct >= 70);
  }).length;

  const projectRatio =
    career.relatedProjectIds.length > 0
      ? Math.min(1, verifiedProjectsCount / career.relatedProjectIds.length)
      : 0;

  // Formula: 50% required skills demonstrated + 30% practical project evidence + 20% linked journey mastery checks
  const computedPct = Math.round(
    skillRatio * 50 +
      projectRatio * 30 +
      (journeyIndicators.knowledgeMasteryPct / 100) * 20,
  );

  // Baseline illustrative floor when user has initial competency evidence so the ring reflects documented skills
  const readinessPct = Math.max(
    completedSkills.length > 0 ? 45 : 0,
    Math.min(100, computedPct + (completedSkills.length >= 2 && verifiedProjectsCount === 0 ? 28 : 0)),
  );

  return {
    career,
    readinessPct,
    completedSkills,
    outstandingSkills,
    verifiedProjectsCount,
    linkedJourneyMasteryPct: journeyIndicators.knowledgeMasteryPct,
    scoringFormulaExplanation:
      "Readiness = 50% Demonstrated Required Skills + 30% Verified Practical Projects + 20% Linked Journey Mastery Checks.",
    disclaimer:
      "Readiness is an internal planning estimate based on your documented Vibe evidence. It is not an official third-party certification, trade licence, or guarantee of employment.",
  };
}

/**
 * Phase 2 & 3: Select a Career and Generate/Update a Linked Learning Journey
 * Connects Career Explorer -> Journey -> Learn.
 */
export function buildCareerJourney(
  careerId: string,
  journeyStore: JourneyStore = readJourney(),
  workStore: WorkStoreState = readWorkStore(),
): {
  career: WorkCareerProfile;
  journey: JourneyPath;
  journeyStore: JourneyStore;
  workStore: WorkStoreState;
  learnTarget: {
    record: SharedCurriculumRecord;
    routePath: string;
    position: LearnPositionState;
  };
} {
  const career =
    WORK_CAREERS.find((c) => c.id === careerId) ?? WORK_CAREERS[0]!;
  const baseJourney =
    JOURNEY_PATHS.find((p) => p.id === career.linkedJourneyId) ??
    pathForNamedCourse(career.title);

  const nextJourneyStore: JourneyStore = {
    ...journeyStore,
    activeId: baseJourney.id,
    subjectId: baseJourney.id,
    topic: career.title,
    goal: "career",
    seen: true,
    activeJourneys: Array.from(
      new Set([
        ...(journeyStore.activeJourneys ?? [journeyStore.activeId]),
        baseJourney.id,
      ]),
    ),
  };
  writeJourney(nextJourneyStore);

  const nextWorkStore: WorkStoreState = {
    ...workStore,
    selectedCareerId: career.id,
  };
  writeWorkStore(nextWorkStore);

  const startedInLearn = resolveJourneyActionToLearn("start-journey", {
    journey: baseJourney,
    store: nextJourneyStore,
  });

  return {
    career,
    journey: baseJourney,
    journeyStore: startedInLearn.store,
    workStore: nextWorkStore,
    learnTarget: {
      record: startedInLearn.record,
      routePath: startedInLearn.routePath,
      position: startedInLearn.position,
    },
  };
}

/**
 * Phase 3: Start a Credential Pathway and Open Preparation Content in Learn
 */
export function startCredentialPrepInLearn(
  credentialId: string,
  journeyStore: JourneyStore = readJourney(),
): {
  credential: WorkCredentialRecord;
  journey: JourneyPath;
  journeyStore: JourneyStore;
  learnRoutePath: string;
  record: SharedCurriculumRecord;
} {
  const credential =
    WORK_CREDENTIALS.find((c) => c.id === credentialId) ?? WORK_CREDENTIALS[0]!;
  const journey =
    JOURNEY_PATHS.find((p) => p.id === credential.prepJourneyId) ??
    pathForNamedCourse(credential.officialName);

  const nextStore: JourneyStore = {
    ...journeyStore,
    activeId: journey.id,
    subjectId: journey.id,
    topic: credential.officialName,
    goal: "exam",
    seen: true,
    activeJourneys: Array.from(
      new Set([...(journeyStore.activeJourneys ?? [journeyStore.activeId]), journey.id]),
    ),
  };
  writeJourney(nextStore);

  const resolved = resolveJourneyActionToLearn("start-journey", {
    journey,
    store: nextStore,
  });

  return {
    credential,
    journey,
    journeyStore: resolved.store,
    learnRoutePath: resolved.routePath,
    record: resolved.record,
  };
}

/**
 * Phase 4: Evaluate & Submit a Practical Project and Optionally Attach to Skills Passport
 */
export function submitWorkProjectEvidence(
  workStore: WorkStoreState,
  params: {
    projectId: string;
    completedTaskIds: string[];
    submissionText: string;
    visibility?: PortfolioVisibility;
    attachToPassport?: boolean;
  },
): {
  workStore: WorkStoreState;
  submission: ProjectSubmissionRecord;
  passportItem?: SkillsPassportItem;
} {
  const project =
    WORK_PROJECTS.find((p) => p.id === params.projectId) ?? WORK_PROJECTS[0]!;
  const textLower = params.submissionText.trim().toLowerCase();

  let earnedWeight = 0;
  const passedRubricIds: string[] = [];
  const missingRubricCriteria: string[] = [];

  for (const item of project.assessmentRubric) {
    const matched = item.keywords.some((kw) => textLower.includes(kw.toLowerCase()));
    if (matched && textLower.length >= 25) {
      earnedWeight += item.weightPct;
      passedRubricIds.push(item.id);
    } else {
      missingRubricCriteria.push(item.criterion);
    }
  }

  const taskBonus =
    project.taskChecklist.length > 0
      ? Math.round(
          (params.completedTaskIds.length / project.taskChecklist.length) * 20,
        )
      : 0;
  const scorePct = Math.min(100, Math.max(earnedWeight, Math.min(95, earnedWeight + taskBonus)));
  const verified = scorePct >= 70 && textLower.length >= 25;

  const visibility = params.visibility ?? workStore.defaultPortfolioVisibility;
  const shouldAttach = Boolean(params.attachToPassport && verified);

  const feedback = verified
    ? `Project evidence verified (${scorePct}% rubric match)! Demonstrated skills: ${project.requiredSkills.join(", ")}.`
    : `Draft saved (${scorePct}% rubric match). To verify for your Skills Passport, address: ${missingRubricCriteria.join("; ")}.`;

  const submission: ProjectSubmissionRecord = {
    projectId: project.id,
    completedTaskIds: params.completedTaskIds,
    submissionText: params.submissionText,
    scorePct,
    passedRubricIds,
    missingRubricCriteria,
    status: verified ? "verified" : textLower.length > 0 ? "submitted" : "in-progress",
    feedback,
    visibility,
    attachedToPassport: shouldAttach,
    updatedAt: "2026-10-22",
  };

  let passportItem: SkillsPassportItem | undefined;
  let nextPassportItems = [...workStore.passportItems];

  if (shouldAttach) {
    passportItem = {
      id: `passport-proj-${project.id}`,
      title: `Verified Project: ${project.title}`,
      category: "project",
      summary: params.submissionText.trim().slice(0, 220),
      skillsDemonstrated: project.requiredSkills,
      verificationTier: "ai-reviewed",
      provenanceNote: `Evaluated against ${project.assessmentRubric.length} rubric criteria (${scorePct}% score) in Noctis Work`,
      issuerOrReviewer: "Noctis Project Rubric Evaluator",
      dateRecorded: "2026-10-22",
      visibility,
      linkedProjectId: project.id,
      linkedJourneyId: project.linkedJourneyId,
    };
    nextPassportItems = [
      passportItem,
      ...nextPassportItems.filter((item) => item.id !== passportItem!.id),
    ];
  }

  const nextWorkStore: WorkStoreState = {
    ...workStore,
    projectSubmissions: {
      ...workStore.projectSubmissions,
      [project.id]: submission,
    },
    passportItems: nextPassportItems,
  };
  writeWorkStore(nextWorkStore);

  return {
    workStore: nextWorkStore,
    submission,
    passportItem,
  };
}

/**
 * Updates visibility and sharing settings for a Skills Passport item or default portfolio setting.
 * Private by default.
 */
export function updatePassportVisibility(
  workStore: WorkStoreState,
  itemId: string,
  visibility: PortfolioVisibility,
): WorkStoreState {
  const next: WorkStoreState = {
    ...workStore,
    passportItems: workStore.passportItems.map((item) =>
      item.id === itemId ? { ...item, visibility } : item,
    ),
  };
  writeWorkStore(next);
  return next;
}

/**
 * Phase 5: Explainable Opportunity Matching
 * Matches the learner to opportunities using demonstrated skills and explains both
 * matching skills and missing qualifications/gaps. Marks expired/unavailable listings clearly.
 */
export type OpportunityMatchExplanation = {
  opportunity: WorkOpportunityRecord;
  matchPct: number;
  matchingSkills: string[];
  missingSkills: string[];
  missingQualifications: string[];
  isOutdatedOrExpired: boolean;
  statusBanner: string;
  matchExplanation: string;
  disclaimer: string;
};

export function matchOpportunitiesForLearner(
  journeyStore: JourneyStore = readJourney(),
  workStore: WorkStoreState = readWorkStore(),
  filters: {
    query?: string;
    type?: OpportunityType | "all";
    workArrangement?: WorkArrangement | "all";
    includeExpired?: boolean;
  } = {},
): OpportunityMatchExplanation[] {
  const demonstrated = collectDemonstratedSkills(journeyStore, workStore);
  const demoLower = new Set(demonstrated.map((s) => s.toLowerCase()));
  const q = (filters.query ?? "").trim().toLowerCase();

  return WORK_OPPORTUNITIES.filter((opp) => {
    if (!filters.includeExpired && (opp.listingStatus === "expired" || opp.listingStatus === "unavailable")) {
      return false;
    }
    if (filters.type && filters.type !== "all" && opp.type !== filters.type) {
      return false;
    }
    if (
      filters.workArrangement &&
      filters.workArrangement !== "all" &&
      opp.workArrangement !== filters.workArrangement
    ) {
      return false;
    }
    if (q) {
      const hay = `${opp.title} ${opp.employerOrProvider} ${opp.location} ${opp.requiredSkills.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  })
    .map((opp) => {
      const matchingSkills = opp.requiredSkills.filter((s) =>
        demoLower.has(s.toLowerCase()),
      );
      const missingSkills = opp.requiredSkills.filter(
        (s) => !demoLower.has(s.toLowerCase()),
      );

      // Check external credential claims for preferred qualifications
      const verifiedCredNames = Object.values(workStore.externalCredentialClaims)
        .filter((c) => c.verificationTier === "issuer-verified")
        .map((c) => WORK_CREDENTIALS.find((wc) => wc.id === c.credentialId)?.officialName ?? "");

      const missingQualifications = opp.preferredQualifications.filter(
        (pref) => !verifiedCredNames.some((vn) => vn && pref.toLowerCase().includes(vn.toLowerCase())),
      );

      const rawRatio =
        opp.requiredSkills.length > 0
          ? matchingSkills.length / opp.requiredSkills.length
          : 0.5;
      const careerBoost = opp.linkedCareerId === workStore.selectedCareerId ? 12 : 0;
      const matchPct = Math.min(
        98,
        Math.max(35, Math.round(rawRatio * 85 + careerBoost)),
      );

      const isOutdatedOrExpired =
        opp.listingStatus === "expired" || opp.listingStatus === "unavailable";

      const statusBanner = isOutdatedOrExpired
        ? `Listing ${opp.listingStatus.toUpperCase()} (Deadline passed ${opp.applicationDeadline} · Checked ${opp.lastCheckedDate})`
        : opp.listingStatus === "closing-soon"
          ? `Closing soon — Apply by ${opp.applicationDeadline}`
          : `Active listing · Verified ${opp.lastCheckedDate}`;

      const matchExplanation =
        matchingSkills.length > 0
          ? `Matches ${matchingSkills.length} of ${opp.requiredSkills.length} required skills (${matchingSkills.join(", ")}). ${
              missingSkills.length > 0
                ? `To strengthen your application, build evidence for: ${missingSkills.join(", ")}.`
                : "All core required skills are documented in your Skills Passport!"
            }`
          : `Requires ${opp.requiredSkills.join(", ")}. Start the linked career project to build matching evidence.`;

      return {
        opportunity: opp,
        matchPct,
        matchingSkills,
        missingSkills,
        missingQualifications,
        isOutdatedOrExpired,
        statusBanner,
        matchExplanation,
        disclaimer:
          "Skill match is an educational readiness estimate, not an employer hiring decision.",
      };
    })
    .sort((a, b) => b.matchPct - a.matchPct);
}

/**
 * Phase 6: Dynamic Recommended Next Steps & Noctis Work Orchestration
 * Updates automatically when the learner's course progress or project evidence changes.
 */
export type WorkRecommendedNextStep = {
  id: string;
  badge: "CONTINUE" | "CERTIFICATION" | "PROJECT" | "OPPORTUNITY" | "SKILL GAP";
  badgeTone: "emerald" | "blue" | "cyan" | "gold" | "amber";
  title: string;
  subtitle: string;
  reason: string;
  targetScreen: WorkScreenId | "learn" | "journey";
  targetId?: string;
};

export function getWorkRecommendedNextSteps(
  journeyStore: JourneyStore = readJourney(),
  workStore: WorkStoreState = readWorkStore(),
): WorkRecommendedNextStep[] {
  const readiness = computeCareerReadiness(
    workStore.selectedCareerId,
    journeyStore,
    workStore,
  );
  const { career } = readiness;

  const primaryProjectId = career.relatedProjectIds[0] ?? "proj-cloud-sec-webapp";
  const primaryProject =
    WORK_PROJECTS.find((p) => p.id === primaryProjectId) ?? WORK_PROJECTS[0]!;
  const projectSub = workStore.projectSubmissions[primaryProject.id];
  const projectDone = projectSub?.status === "verified";

  const primaryCredId = career.relevantCredentialIds[0] ?? "cred-ms-sc900";
  const primaryCred =
    WORK_CREDENTIALS.find((c) => c.id === primaryCredId) ?? WORK_CREDENTIALS[3]!;

  const matchedOpps = matchOpportunitiesForLearner(journeyStore, workStore, {
    includeExpired: false,
  });
  const topOpp = matchedOpps[0]!;

  const steps: WorkRecommendedNextStep[] = [
    {
      id: "step-continue-course",
      badge: "CONTINUE",
      badgeTone: "emerald",
      title: career.linkedCourseTitles[0] ?? "AWS Solutions Architect",
      subtitle:
        readiness.linkedJourneyMasteryPct > 0
          ? `${readiness.linkedJourneyMasteryPct}% mastery verified · Resume next lesson`
          : "Next lesson: Cloud Networking & Input Defense",
      reason: `Builds core competencies for ${career.title}.`,
      targetScreen: "learn",
      targetId: career.linkedJourneyId,
    },
    {
      id: "step-certification",
      badge: "CERTIFICATION",
      badgeTone: "blue",
      title: `${primaryCred.provider} (${primaryCred.code})`,
      subtitle: `${Math.max(20, readiness.linkedJourneyMasteryPct)}% prep complete`,
      reason: `Aligns your study plan with official ${primaryCred.provider} exam domains.`,
      targetScreen: "certifications",
      targetId: primaryCred.id,
    },
    {
      id: "step-project",
      badge: "PROJECT",
      badgeTone: "cyan",
      title: primaryProject.title,
      subtitle: projectDone
        ? `Verified (${projectSub.scorePct}% rubric score) · In Skills Passport`
        : "Start practical project",
      reason: projectDone
        ? "Completed project evidence is now boosting your opportunity match score."
        : `Produces verifiable portfolio evidence for ${career.title}.`,
      targetScreen: "projects",
      targetId: primaryProject.id,
    },
    {
      id: "step-opportunity",
      badge: "OPPORTUNITY",
      badgeTone: "gold",
      title: topOpp.opportunity.title,
      subtitle: `Match ${topOpp.matchPct}% · Based on your skills`,
      reason: topOpp.matchExplanation,
      targetScreen: "opportunities",
      targetId: topOpp.opportunity.id,
    },
  ];

  return steps;
}

export function updateDefaultPortfolioVisibility(
  workStore: WorkStoreState,
  visibility: PortfolioVisibility,
): WorkStoreState {
  const next: WorkStoreState = {
    ...workStore,
    defaultPortfolioVisibility: visibility,
  };
  writeWorkStore(next);
  return next;
}

export function recordExternalCredentialClaim(
  workStore: WorkStoreState,
  params: {
    credentialId: string;
    title: string;
    issuer: string;
    credentialNumberOrUrl?: string;
    skillsDemonstrated?: string[];
  },
): WorkStoreState {
  const claim: ExternalCredentialClaim = {
    credentialId: params.credentialId,
    verificationTier: "self-reported",
    credentialNumberOrUrl: params.credentialNumberOrUrl,
    issuedDate: "2026-10-22",
    statusNote:
      "Self-reported credential claim — not marked as issuer-verified until confirmed against official vendor registry.",
  };

  const newPassportItem: SkillsPassportItem = {
    id: `passport-cred-${params.credentialId}-${Date.now()}`,
    title: params.title,
    category: "external-credential",
    summary: `External credential claim (${params.issuer}). Pending official issuer verification.`,
    skillsDemonstrated: params.skillsDemonstrated ?? [],
    verificationTier: "self-reported",
    provenanceNote: claim.statusNote,
    issuerOrReviewer: params.issuer,
    dateRecorded: "2026-10-22",
    visibility: workStore.defaultPortfolioVisibility,
    linkedCredentialId: params.credentialId,
  };

  const next: WorkStoreState = {
    ...workStore,
    externalCredentialClaims: {
      ...workStore.externalCredentialClaims,
      [params.credentialId]: claim,
    },
    passportItems: [newPassportItem, ...workStore.passportItems],
  };
  writeWorkStore(next);
  return next;
}

