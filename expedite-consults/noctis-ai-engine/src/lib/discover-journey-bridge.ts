import {
  JOURNEY_PATHS,
  pathForNamedCourse,
  pathForTopic,
  type JourneyLesson,
  type JourneyModule,
  type JourneyPath,
  type JourneyStore,
} from "./journey-paths.ts";

export type FeedPost = {
  id: string;
  author: { name: string; username?: string };
  mediaType: string;
  mediaUrl: string;
  posterUrl?: string;
  youtubeId?: string;
  caption: string;
  hashtags: string[];
  lane?: string;
  teach?: {
    stamp?: string;
    hook?: string;
    prompt?: string;
  };
};

export type DiscoverContentType =
  | "video"
  | "article"
  | "reel"
  | "slides"
  | "demo"
  | "entertainment";

export type DiscoverContentCategory =
  | "educational"
  | "certification"
  | "skilled-trade"
  | "entertainment";

export type DiscoverActionKind =
  | "Watch"
  | "Read"
  | "Explore topic"
  | "Add to Journey"
  | "Build a Journey";

/**
 * Unified "Learning Actions" menu types that adapt to the content type
 */
export type InteractiveContentTypeId =
  | "video-reel"
  | "article-analysis"
  | "course-certification"
  | "project-demo";

export type AdaptiveLearningAction = {
  id: "open" | "explain" | "journey" | "quiz";
  title: string;
  description: string;
  badge: string;
};

export const CORE_VIBE_PROMISE_STAGES: {
  step: number;
  stage: string;
  promise: string;
}[] = [
  {
    step: 1,
    stage: "Discover",
    promise: "Find useful knowledge and opportunities.",
  },
  {
    step: 2,
    stage: "Journey",
    promise: "Follow a structured route toward a goal.",
  },
  {
    step: 3,
    stage: "Learn",
    promise: "Understand the concepts through multimedia lessons.",
  },
  {
    step: 4,
    stage: "Practise",
    promise: "Apply knowledge in exercises and simulations.",
  },
  {
    step: 5,
    stage: "Prove",
    promise: "Demonstrate skills through assessments and projects.",
  },
  {
    step: 6,
    stage: "Advance",
    promise:
      "Move to the next course, certification, apprenticeship, or career opportunity.",
  },
];

export function getAdaptiveLearningActions(
  contentType: InteractiveContentTypeId,
): AdaptiveLearningAction[] {
  switch (contentType) {
    case "video-reel":
      return [
        {
          id: "open",
          title: "Watch or resume",
          description: "Open the content.",
          badge: "Video / Reel",
        },
        {
          id: "explain",
          title: "Summarise and explain",
          description: "Ask Noctis for an accessible explanation.",
          badge: "Noctis Tutor",
        },
        {
          id: "journey",
          title: "Add to Journey",
          description: "Connect it to a course or create a new path.",
          badge: "Journey Link",
        },
        {
          id: "quiz",
          title: "Create a quiz",
          description: "Test understanding of the content.",
          badge: "80% Check",
        },
      ];
    case "article-analysis":
      return [
        {
          id: "open",
          title: "Read and annotate",
          description: "Open the article or technical analysis with source notes.",
          badge: "Article / Brief",
        },
        {
          id: "explain",
          title: "Summarise and explain",
          description: "Ask Noctis to distil key claims and verify citations.",
          badge: "Source Check",
        },
        {
          id: "journey",
          title: "Add to Journey",
          description: "Attach as recommended reading or build a new learning path.",
          badge: "Journey Link",
        },
        {
          id: "quiz",
          title: "Create a quiz",
          description: "Test comprehension and application of the article.",
          badge: "Comprehension",
        },
      ];
    case "course-certification":
      return [
        {
          id: "open",
          title: "Inspect course & exam objectives",
          description: "Review official domains, prerequisites, and licensing rules.",
          badge: "13-Field Spec",
        },
        {
          id: "explain",
          title: "Summarise and explain",
          description: "Ask Noctis how this credential maps to your career goal.",
          badge: "Career Fit",
        },
        {
          id: "journey",
          title: "Add to Journey",
          description: "Start or connect to a 5-stage certification preparation path.",
          badge: "5-Stage Path",
        },
        {
          id: "quiz",
          title: "Create a quiz",
          description: "Run an exam-readiness check to spot domain gaps.",
          badge: "Readiness Check",
        },
      ];
    case "project-demo":
      return [
        {
          id: "open",
          title: "Watch demonstration & safety brief",
          description: "Open the practical demonstration, PPE checklist, and tolerances.",
          badge: "Shop Demo",
        },
        {
          id: "explain",
          title: "Summarise and explain",
          description: "Ask Noctis for step-by-step method and fault prevention.",
          badge: "Method Guide",
        },
        {
          id: "journey",
          title: "Add to Journey",
          description: "Attach to your practical module or launch the Skills Simulator.",
          badge: "Simulator + Path",
        },
        {
          id: "quiz",
          title: "Create a quiz",
          description: "Verify safety rules, calculations, and rubric competency.",
          badge: "Competency Check",
        },
      ];
  }
}

export function mapDiscoverTypeToInteractiveId(
  type: DiscoverContentType,
  category: DiscoverContentCategory,
): InteractiveContentTypeId {
  if (type === "demo" || category === "skilled-trade") return "project-demo";
  if (category === "certification") return "course-certification";
  if (type === "article" || type === "slides") return "article-analysis";
  return "video-reel";
}

/**
 * 10 Recommended Platform Capabilities (Screenshots 1–3)
 */
export type CareerOccupationPlan = {
  id: string;
  title: string;
  category: string;
  coreSkills: string[];
  structuredTraining: string[];
  practicalExperience: string;
  targetCredentials: string[];
  licensingDistinction: string;
  courseTopic: string;
};

export const CAREER_OCCUPATIONS: CareerOccupationPlan[] = [
  {
    id: "cloud-architect",
    title: "Cloud Architect",
    category: "Technology · Cloud & Infrastructure",
    coreSkills: [
      "VPC network isolation, subnets, routing & security groups",
      "IAM least-privilege roles, federation & KMS encryption",
      "High-availability compute (EC2, ECS/EKS, Lambda) & resilient storage (S3, RDS)",
      "Well-Architected cost, reliability & observability design",
    ],
    structuredTraining: [
      "AWS Cloud Practitioner Foundations",
      "AWS Solutions Architect – Associate Path",
      "Terraform Infrastructure as Code & Kubernetes",
    ],
    practicalExperience:
      "Design and verify a multi-AZ VPC architecture with automated failover and zero wildcard IAM policies.",
    targetCredentials: [
      "AWS Certified Solutions Architect – Associate",
      "AZ-305: Microsoft Azure Solutions Architect Expert",
    ],
    licensingDistinction:
      "Vibe builds your architecture portfolio and exam readiness; official credentials require passing the proctored AWS or Microsoft exam.",
    courseTopic: "AWS Cloud Computing",
  },
  {
    id: "carpenter",
    title: "Structural & Finish Carpenter",
    category: "Skilled Trades · Construction",
    coreSkills: [
      "Blueprint reading, tape measurement to 1/16\" tolerance & square layout",
      "16\" on-center wall framing, headers, cripples & roof rafters/trusses",
      "Stair stringer rise/run geometry, doors, windows & finish trim",
      "Circular saw, miter saw & jobsite PPE / OSHA fall protection",
    ],
    structuredTraining: [
      "Workshop Safety, PPE & Hand/Power Tool Isolation",
      "Wall Framing, Roof Trusses & Structural Layout",
      "Joinery, Finish Carpentry & Blueprint Estimating",
    ],
    practicalExperience:
      "Supervised shop framing of a plumb/square wall section with window header and documented cut list.",
    targetCredentials: [
      "NCCER Carpentry Level 1–4 Craft Credentials",
      "OSHA 10 / OSHA 30 Construction Safety Card",
    ],
    licensingDistinction:
      "OSHA is safety training, not a trade licence. Contractor licensing and apprenticeship sign-offs are issued by state/local boards and accredited trade schools.",
    courseTopic: "Carpentry & Structural Framing",
  },
  {
    id: "cyber-analyst",
    title: "Cybersecurity & SOC Analyst",
    category: "Cybersecurity · Threat Detection & Response",
    coreSkills: [
      "TCP/IP packet inspection, DNS/HTTP triage & firewall rules",
      "SIEM log onboarding, Splunk SPL queries & alert correlation",
      "Vulnerability management, OWASP Top 10 mitigation & IAM hardening",
      "Incident response playbooks & digital forensics chain-of-custody",
    ],
    structuredTraining: [
      "CompTIA Network+ & Security+ Foundations",
      "Splunk Enterprise Security & SIEM Detection Engineering",
      "CompTIA CySA+ & Authorised Incident Response Labs",
    ],
    practicalExperience:
      "Investigate a simulated credential-stuffing and SQLi intrusion in an isolated lab and write a verified remediation report.",
    targetCredentials: [
      "CompTIA Security+ / CySA+",
      "Splunk Certified Cybersecurity Defense Analyst",
      "ISC2 Certified in Cybersecurity (CC)",
    ],
    licensingDistinction:
      "All hands-on labs run in authorised sandboxed environments; official vendor certifications are issued by CompTIA, Splunk, or ISC2.",
    courseTopic: "Cybersecurity",
  },
  {
    id: "auto-technician",
    title: "Automotive Diagnostic Technician",
    category: "Skilled Trades · Automotive & EV Service",
    coreSkills: [
      "OBD-II live data analysis (Short-Term & Long-Term Fuel Trim, misfire counters)",
      "Multimeter voltage-drop testing across battery, starter & ground circuits",
      "Hydraulic braking systems, ABS sensors, steering & suspension geometry",
      "High-voltage EV/hybrid battery isolation & insulated PPE protocols",
    ],
    structuredTraining: [
      "Shop Lift Safety, Jack-Stand Verification & Electrical Fundamentals",
      "OBD-II Engine Performance & Fuel/Ignition Diagnostics",
      "ASE A1–A8 Preparation & EV High-Voltage Safety",
    ],
    practicalExperience:
      "Diagnose a root-cause electrical or fuel-trim fault with measured test values and complete a professional repair order.",
    targetCredentials: [
      "ASE A1–A8 Automotive Technician Certifications",
      "EPA Section 609 Motor Vehicle Air Conditioning (MVAC)",
    ],
    licensingDistinction:
      "Official ASE certification requires passing the proctored ASE exams plus verified hands-on work experience (typically 2 years).",
    courseTopic: "Automotive Diagnostics & ASE Repair",
  },
];

export type PracticalSimulationScenario = {
  id: string;
  title: string;
  domain: string;
  prompt: string;
  contextData: string;
  options: {
    id: string;
    label: string;
    correct: boolean;
    feedback: string;
  }[];
};

export const PRACTICAL_SIMULATIONS: PracticalSimulationScenario[] = [
  {
    id: "sim-cloud-vpc",
    title: "Cloud Architecture Simulator: Production RDS Database Isolation",
    domain: "AWS Cloud Computing",
    prompt:
      "You are deploying a production PostgreSQL RDS database behind an Application Load Balancer and EC2 web tier. How should subnets and security groups be configured?",
    contextData:
      "VPC CIDR: 10.0.0.0/16 · Web Tier: Public/App Subnets across 2 AZs · Database Port: 5432",
    options: [
      {
        id: "a",
        label:
          "Place RDS in private subnets across 2 AZs with Multi-AZ enabled, and restrict the RDS Security Group inbound port 5432 strictly to the Application Tier Security Group ID.",
        correct: true,
        feedback:
          "Verified Pass: RDS has no public IP, spans 2 Availability Zones for automatic failover, and accepts TCP 5432 only from the application tier security group.",
      },
      {
        id: "b",
        label:
          "Place RDS in a public subnet with 0.0.0.0/0 on port 5432 so developers can connect directly from home.",
        correct: false,
        feedback:
          "Security Failure: Exposing port 5432 to 0.0.0.0/0 in a public subnet exposes production data to brute-force and network exploits.",
      },
      {
        id: "c",
        label:
          "Attach an IAM policy with Action '*' and Resource '*' to the EC2 instance profile so it never hits permission errors.",
        correct: false,
        feedback:
          "Least-Privilege Failure: Wildcard IAM permissions violate cloud security guardrails.",
      },
    ],
  },
  {
    id: "sim-carpentry-wall",
    title: "Construction Estimator: 16-Foot Wall Stud & Plate Material Takeoff",
    domain: "Carpentry & Building Trades",
    prompt:
      "Calculate the required 16-inch on-center common studs (including starter stud + 2 corner/end studs) and 16-foot plates (1 sole plate + 2 double top plates) for a straight 16-foot framed wall with no openings.",
    contextData:
      "Wall length = 16 ft (192 inches) · Spacing = 16 inches on-center · Top plate = double · Bottom plate = single",
    options: [
      {
        id: "a",
        label:
          "13 regular spaced studs (192 ÷ 16 + 1) plus 2 extra end/corner assembly studs = 15 studs total, and three 16-ft plates (1 sole + 2 top).",
        correct: true,
        feedback:
          "Verified Pass: 16 ft × 12 = 192 in; 192 ÷ 16 = 12 spaces + 1 starter stud = 13 layout studs (+2 corner backing studs = 15) and 3 plates (1 bottom + 2 top).",
      },
      {
        id: "b",
        label: "8 studs spaced 24 inches apart and a single top plate with no sole plate.",
        correct: false,
        feedback:
          "Specification Mismatch: The structural drawing specifies 16-inch on-center spacing, a treated/anchored sole plate, and a double top plate.",
      },
      {
        id: "c",
        label: "Cut all studs without checking crown direction or wearing ANSI Z87.1 eye protection.",
        correct: false,
        feedback:
          "Safety & Quality Failure: Stud crowns must face the same direction to prevent a wavy wall, and eye/hearing PPE is mandatory.",
      },
    ],
  },
  {
    id: "sim-auto-obd2",
    title: "Automotive Fault Simulator: P0171 System Too Lean (Bank 1)",
    domain: "Automotive Diagnostics (ASE A8)",
    prompt:
      "A 4-cylinder engine logs code P0171. At idle (750 RPM), Long-Term Fuel Trim (LTFT) is +22% (adding fuel). When you hold engine speed at 2,500 RPM, LTFT drops back to +3% (normal). What is the most likely root cause?",
    contextData:
      "Idle LTFT: +22% · 2,500 RPM LTFT: +3% · Battery Voltage: 14.1V · Fuel Pressure: 58 PSI (in spec)",
    options: [
      {
        id: "a",
        label:
          "An intake manifold vacuum leak downstream of the MAF sensor (unmetered air is a large fraction of airflow at closed-throttle idle, but negligible at 2,500 RPM).",
        correct: true,
        feedback:
          "Verified Diagnostic Pass: When fuel trim corrects at higher RPM while fuel pressure is normal, unmetered air entering via a cracked vacuum hose or intake gasket is confirmed.",
      },
      {
        id: "b",
        label: "A failing fuel pump that starves the engine at high speed.",
        correct: false,
        feedback:
          "Incorrect: A weak fuel pump worsens under high load/RPM, whereas this vehicle’s fuel trim returns to normal (+3%) at 2,500 RPM and fuel pressure is 58 PSI.",
      },
      {
        id: "c",
        label: "Clear the code immediately and replace all four oxygen sensors without testing.",
        correct: false,
        feedback:
          "Parts-Swapping Error: The O2 sensor is accurately reporting a lean exhaust condition; clearing codes without fixing the leak will cause P0171 to return.",
      },
    ],
  },
  {
    id: "sim-web-responsive",
    title: "Web Design Simulator: Fixing 390px Mobile Horizontal Overflow",
    domain: "Web Design",
    prompt:
      "A 3-card feature row has `width: 1100px; display: flex;` and causes horizontal scrolling on a 390×844 phone viewport. Which CSS fix makes it responsive?",
    contextData:
      "Target viewports: 390×844 mobile & 1440×900 desktop · Minimum tap target: 44×44px",
    options: [
      {
        id: "a",
        label:
          "Replace fixed `width: 1100px` with `width: 100%; max-width: 72rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem;`.",
        correct: true,
        feedback:
          "Verified Pass: Fluid `max-width` with auto-fit CSS Grid stacks cleanly in 1 column on 390px phones and expands to 3 columns on desktop.",
      },
      {
        id: "b",
        label: "Keep `width: 1100px` and add `overflow-x: hidden` on `<body>` so the right two cards are clipped off-screen.",
        correct: false,
        feedback:
          "Accessibility Failure: Clipping off-screen cards hides content from mobile users instead of reflowing the layout.",
      },
    ],
  },
];

export type CertificationExamTrack = {
  id: string;
  provider: string;
  credential: string;
  officialUrl: string;
  domains: {
    name: string;
    weightPct: number;
    mappedLessonTopic: string;
  }[];
};

export const CERTIFICATION_READINESS_TRACKS: CertificationExamTrack[] = [
  {
    id: "cert-aws-saa",
    provider: "Amazon Web Services",
    credential: "AWS Certified Solutions Architect – Associate (SAA-C03)",
    officialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    domains: [
      {
        name: "Domain 1: Design Secure Architectures",
        weightPct: 30,
        mappedLessonTopic: "IAM roles, VPC security groups, KMS & least privilege",
      },
      {
        name: "Domain 2: Design Resilient Architectures",
        weightPct: 26,
        mappedLessonTopic: "Multi-AZ, ALB, Auto Scaling & decoupled SQS/SNS queues",
      },
      {
        name: "Domain 3: Design High-Performing Architectures",
        weightPct: 24,
        mappedLessonTopic: "CloudFront caching, EBS/S3 storage tiers & RDS read replicas",
      },
      {
        name: "Domain 4: Design Cost-Optimized Architectures",
        weightPct: 20,
        mappedLessonTopic: "Right-sizing, Savings Plans & S3 lifecycle policies",
      },
    ],
  },
  {
    id: "cert-comptia-secplus",
    provider: "CompTIA",
    credential: "CompTIA Security+ (SY0-701)",
    officialUrl: "https://www.comptia.org/certifications/security",
    domains: [
      {
        name: "Domain 1: General Security Concepts",
        weightPct: 12,
        mappedLessonTopic: "CIA triad, Zero Trust, cryptography & change management",
      },
      {
        name: "Domain 2: Threats, Vulnerabilities, and Mitigations",
        weightPct: 22,
        mappedLessonTopic: "OWASP Top 10, SQLi, phishing, malware & vulnerability triage",
      },
      {
        name: "Domain 3: Security Architecture",
        weightPct: 18,
        mappedLessonTopic: "Network segmentation, cloud security & resilient infrastructure",
      },
      {
        name: "Domain 4: Security Operations",
        weightPct: 28,
        mappedLessonTopic: "SIEM log correlation, incident response & digital forensics",
      },
      {
        name: "Domain 5: Security Program Management and Oversight",
        weightPct: 20,
        mappedLessonTopic: "Risk assessment, compliance audits & third-party governance",
      },
    ],
  },
  {
    id: "cert-splunk-defense",
    provider: "Splunk",
    credential: "Splunk Certified Cybersecurity Defense Analyst",
    officialUrl: "https://www.splunk.com/en_us/training.html",
    domains: [
      {
        name: "Domain 1: Threat & Attack Frameworks (MITRE ATT&CK / Kill Chain)",
        weightPct: 25,
        mappedLessonTopic: "Mapping telemetry to attacker tactics and techniques",
      },
      {
        name: "Domain 2: SPL Search, Data Onboarding & Field Extraction",
        weightPct: 30,
        mappedLessonTopic: "SPL stats, eval, lookup & CIM normalization",
      },
      {
        name: "Domain 3: Notable Event Triage & Incident Investigation",
        weightPct: 25,
        mappedLessonTopic: "Splunk Enterprise Security risk-based alerting",
      },
      {
        name: "Domain 4: Dashboards, Threat Intelligence & Reporting",
        weightPct: 20,
        mappedLessonTopic: "Executive & SOC operational reporting",
      },
    ],
  },
  {
    id: "cert-ms-az104",
    provider: "Microsoft",
    credential: "AZ-104: Microsoft Azure Administrator Associate",
    officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
    domains: [
      {
        name: "Domain 1: Manage Azure identities and governance",
        weightPct: 20,
        mappedLessonTopic: "Microsoft Entra ID, RBAC, subscriptions & Azure Policy",
      },
      {
        name: "Domain 2: Implement and manage storage",
        weightPct: 15,
        mappedLessonTopic: "Storage accounts, blob lifecycle & SAS tokens",
      },
      {
        name: "Domain 3: Deploy and manage Azure compute resources",
        weightPct: 20,
        mappedLessonTopic: "VMs, availability sets, App Service & containers",
      },
      {
        name: "Domain 4: Implement and manage virtual networking",
        weightPct: 20,
        mappedLessonTopic: "VNets, NSGs, peering, DNS & load balancing",
      },
      {
        name: "Domain 5: Monitor and maintain Azure resources",
        weightPct: 25,
        mappedLessonTopic: "Azure Monitor, Log Analytics & Azure Backup",
      },
    ],
  },
];

/**
 * Entity: content_items
 * Stores Discover videos, articles, reels, slide decks, trade demonstrations, and general social/entertainment items.
 */
export type DiscoverContentItem = {
  id: string;
  title: string;
  summary: string;
  type: DiscoverContentType;
  category: DiscoverContentCategory;
  isEducational: boolean;
  topic: string;
  courseId: string;
  suggestedModuleIndex: number;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  durationOrLength: string;
  primaryAction: "Watch" | "Read" | "Explore topic";
  source: {
    name: string;
    author: string;
    url: string;
    license: string;
    verified: boolean;
  };
  mediaUrl: string;
  posterUrl: string;
  learningObjectives: string[];
  prerequisites: string[];
  safetyAndSupervisionNote?: string;
  regionalExamples?: {
    ghana: string;
    unitedStates: string;
  };
  quickQuiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  accessible?: boolean;
};

/**
 * Entity: content_lesson_links
 * Connects relevant Discover items to journeys, modules, and lessons, including their role and relevance.
 */
export type ContentLessonLink = {
  linkId: string;
  contentId: string;
  journeyId: string;
  journeyTitle: string;
  moduleId: string;
  lessonId: string;
  role:
    | "primary-watch"
    | "recommended-reading"
    | "slide-walkthrough"
    | "practical-demo"
    | "supplementary";
  relevanceReason: string;
  status: "linked" | "saved-for-later" | "reviewed";
  addedAt: string;
};

/**
 * Entities: user_journeys + user_content_activity + navigation preservation
 */
export type DiscoverJourneyBridgeState = {
  links: ContentLessonLink[];
  customItems?: DiscoverContentItem[];
  bookmarkedContentIds: string[];
  viewedContentIds: string[];
  savedForLaterIds: string[];
  reviewedContentIds: string[];
  completedSimulationIds: string[];
  activeResourceModalContentId: string | null;
  resumeSnapshot: {
    journeyId: string;
    screen: string;
    moduleId: string;
    lessonId: string;
  } | null;
};

export const EMPTY_DISCOVER_JOURNEY_STATE: DiscoverJourneyBridgeState = {
  links: [],
  customItems: [],
  bookmarkedContentIds: [],
  viewedContentIds: [],
  savedForLaterIds: [],
  reviewedContentIds: [],
  completedSimulationIds: [],
  activeResourceModalContentId: null,
  resumeSnapshot: null,
};

const BRIDGE_STORAGE_KEY = "vibe-discover-journey-bridge-v1";

/**
 * Curated Discover Content Catalogue spanning Cloud/IT Certifications, Cybersecurity,
 * Web Design, Skilled Trades (Carpentry, Masonry, Auto Mechanics), Science, Geography,
 * Bible Study, and separate Entertainment/Social items.
 */
export const DISCOVER_CONTENT_ITEMS: DiscoverContentItem[] = [
  {
    id: "disc-aws-intro",
    title: "Introduction to AWS Cloud Computing & Core Architecture",
    summary:
      "Walk through regions, availability zones, VPC boundaries, EC2 compute, S3 object storage, and IAM least-privilege roles with architecture diagrams.",
    type: "video",
    category: "certification",
    isEducational: true,
    topic: "AWS Cloud Computing",
    courseId: "aws-cloud",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "14 min video",
    primaryAction: "Watch",
    source: {
      name: "AWS Architecture & Cloud Clinic",
      author: "Kwesi Danquah · Cloud Architect",
      url: "https://docs.aws.amazon.com/",
      license: "CC BY 4.0 / Official Vendor Reference",
      verified: true,
    },
    mediaUrl: "/media/hall/developer.mp4",
    posterUrl: "/media/hall/developer.jpg",
    learningObjectives: [
      "Explain how AWS Regions, Availability Zones, and VPC subnets isolate workloads",
      "Choose between EC2, Lambda, S3, and RDS for a beginner cloud architecture",
      "Apply IAM least-privilege policies and MFA before deploying cloud resources",
    ],
    prerequisites: ["Basic understanding of how a web browser talks to a server"],
    regionalExamples: {
      ghana:
        "Deploying a low-latency fintech API for Accra & Kumasi users using CloudFront edge caching and af-south-1 / eu-west-1 failover.",
      unitedStates:
        "Designing a multi-region HIPAA-aligned healthcare portal across us-east-1 (N. Virginia) and us-west-2 (Oregon).",
    },
    quickQuiz: {
      question:
        "Why do production AWS architectures deploy databases across at least two Availability Zones (Multi-AZ) inside private subnets?",
      options: [
        "So any internet user can query the database without a load balancer",
        "To survive a single data-center power or flood outage automatically while keeping the database off the public internet",
        "To eliminate the need for IAM roles",
      ],
      correctIndex: 1,
      explanation:
        "Availability Zones are physically separate data centers within a Region; Multi-AZ private subnets provide high availability and network isolation.",
    },
  },
  {
    id: "disc-aws-iam-article",
    title: "IAM Policies, Roles & Guardrails: Why Root Keys Stay Locked",
    summary:
      "Step-by-step analysis of AWS JSON policy evaluation, temporary STS role assumption, and real-world misconfiguration post-mortems.",
    type: "article",
    category: "certification",
    isEducational: true,
    topic: "AWS Cloud Computing",
    courseId: "aws-cloud",
    suggestedModuleIndex: 2,
    skillLevel: "Intermediate",
    durationOrLength: "9 min article",
    primaryAction: "Read",
    source: {
      name: "Noctis Cloud Security Brief",
      author: "Ama Mensah · Principal Security Engineer",
      url: "https://aws.amazon.com/iam/",
      license: "Vibe Verified Technical Analysis",
      verified: true,
    },
    mediaUrl: "/media/covers/ctf.jpg",
    posterUrl: "/media/covers/ctf.jpg",
    learningObjectives: [
      "Audit an IAM policy for wildcard actions and overly broad resource ARNs",
      "Configure role-based access with explicit deny guardrails",
    ],
    prerequisites: ["AWS Cloud Computing Fundamentals"],
    quickQuiz: {
      question:
        "In AWS IAM policy evaluation, what happens when an explicit Deny and an explicit Allow both match the same request?",
      options: [
        "The explicit Deny always wins and blocks the request",
        "The explicit Allow overrides the Deny",
        "AWS prompts the user to choose",
      ],
      correctIndex: 0,
      explanation:
        "In AWS IAM evaluation logic, an explicit Deny in any applicable policy unconditionally overrides any Allow.",
    },
  },
  {
    id: "disc-web-semantic-video",
    title: "Semantic HTML5 & Flexbox Layout: From Blank File to Responsive Page",
    summary:
      "Watch how landmarks (<header>, <main>, <nav>, <section>, <footer>) and CSS Flexbox create accessible, mobile-ready web pages.",
    type: "video",
    category: "educational",
    isEducational: true,
    topic: "Web Design",
    courseId: "web",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "12 min video",
    primaryAction: "Watch",
    source: {
      name: "MDN & W3C Web Studio",
      author: "Kofi Boateng · Frontend Lead",
      url: "https://developer.mozilla.org/en-US/docs/Learn",
      license: "CC BY-SA 2.5 (MDN Web Docs aligned)",
      verified: true,
    },
    mediaUrl: "/media/hall/developer.mp4",
    posterUrl: "/media/hall/developer.jpg",
    learningObjectives: [
      "Structure a web document with semantic HTML5 landmarks",
      "Align navigation and card rows using CSS Flexbox and gap tokens",
    ],
    prerequisites: ["None — suitable for first-time web builders"],
    regionalExamples: {
      ghana:
        "Building a fast, lightweight mobile-first directory for a Cape Coast or Tamale cooperative that loads cleanly on 3G connections.",
      unitedStates:
        "Structuring an ADA / Section 508 accessible municipal service portal with keyboard-friendly landmarks.",
    },
    quickQuiz: {
      question:
        "Which HTML element should wrap the primary unique content of a web page so screen readers can jump directly to it?",
      options: ["<div class='wrapper'>", "<main>", "<span id='top'>"],
      correctIndex: 1,
      explanation:
        "The <main> landmark identifies the primary content of the <body> for assistive technologies and document outlines.",
    },
  },
  {
    id: "disc-web-responsive-slides",
    title: "Mobile-First Breakpoints, Typography & WCAG Contrast Slide Deck",
    summary:
      "Interactive slide deck covering 390px mobile viewports, fluid clamp() type scales, and 4.5:1 contrast verification.",
    type: "slides",
    category: "educational",
    isEducational: true,
    topic: "Web Design",
    courseId: "web",
    suggestedModuleIndex: 2,
    skillLevel: "Intermediate",
    durationOrLength: "16 slides",
    primaryAction: "Explore topic",
    source: {
      name: "W3C WAI Design Systems",
      author: "Efua Asante · Design Systems Architect",
      url: "https://www.w3.org/WAI/standards-guidelines/wcag/",
      license: "W3C Educational Reference",
      verified: true,
    },
    mediaUrl: "/media/covers/chalkboard.jpg",
    posterUrl: "/media/covers/chalkboard.jpg",
    learningObjectives: [
      "Design mobile-first CSS Grid and Flexbox layouts without horizontal overflow",
      "Verify body and heading contrast ratios against WCAG AA standards",
    ],
    prerequisites: ["HTML Semantic Structure", "CSS Layout Basics"],
  },
  {
    id: "disc-carpentry-framing-demo",
    title: "Carpentry Shop Demo: Measuring, Crown Marking & 16-Inch On-Center Wall Framing",
    summary:
      "Practical trade demonstration of tape layout, square marking, circular saw guard checks, stud crowning, and header assembly.",
    type: "demo",
    category: "skilled-trade",
    isEducational: true,
    topic: "Carpentry & Woodworking",
    courseId: "carpentry",
    suggestedModuleIndex: 1,
    skillLevel: "Beginner",
    durationOrLength: "18 min practical demo",
    primaryAction: "Watch",
    source: {
      name: "NCCER & Master Trade Shop",
      author: "Master Carpenter Yaw Osei",
      url: "https://www.nccer.org/programs-crafts/",
      license: "Vibe Trade Demonstration · OSHA Aligned",
      verified: true,
    },
    mediaUrl: "/media/covers/hall.jpg",
    posterUrl: "/media/covers/hall.jpg",
    learningObjectives: [
      "Measure and mark timber within 1/16-inch tolerance using a framing square",
      "Lay out 16-inch on-center wall studs with king studs, jack studs, and cripples",
      "Verify eye, hearing, dust, and blade-guard safety before cutting",
    ],
    prerequisites: ["Workshop PPE and hand/power tool safety orientation"],
    safetyAndSupervisionNote:
      "Requires ANSI Z87.1 eye protection, hearing protection, unplugged blade-guard inspection, and supervised shop access before operating power saws.",
    regionalExamples: {
      ghana:
        "Hardwood roof truss layout and moisture-seasoned timber framing for coastal and tropical rainfall loads.",
      unitedStates:
        "IRC residential 2×4 / 2×6 stud framing at 16 inches on-center with seismic/hurricane tie-down connectors.",
    },
    quickQuiz: {
      question:
        "In a framed wall window opening, which vertical framing member directly supports the ends of the horizontal header?",
      options: [
        "The jack stud (trimmer stud) nailed alongside the full-height king stud",
        "The drywall corner bead",
        "The baseboard trim",
      ],
      correctIndex: 0,
      explanation:
        "Jack (trimmer) studs transfer the load from the window/door header down to the sole plate while king studs frame the full height.",
    },
  },
  {
    id: "disc-masonry-mortar-demo",
    title: "Masonry Field Guide: Mortar Batching, Buttering Joints & Plumb Corner Leads",
    summary:
      "Learn sand-to-cement-to-lime proportions, trowel buttering, 3/8-inch bed joints, and checking plumb and level on a corner lead.",
    type: "demo",
    category: "skilled-trade",
    isEducational: true,
    topic: "Masonry & Bricklaying",
    courseId: "masonry",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "15 min practical demo",
    primaryAction: "Watch",
    source: {
      name: "Masonry Craft & Structural Guild",
      author: "Tunde Bakare · Senior Mason",
      url: "https://www.nccer.org/",
      license: "Vibe Skilled Trades Library",
      verified: true,
    },
    mediaUrl: "/media/covers/nightmarket.jpg",
    posterUrl: "/media/covers/nightmarket.jpg",
    learningObjectives: [
      "Proportion and mix consistent mortar to workable board life",
      "Build a plumb, level, and square brick or block corner lead",
    ],
    prerequisites: ["Alkaline cement skin/eye protection and safe lifting posture"],
    safetyAndSupervisionNote:
      "Wet mortar is alkaline; wear alkali-resistant gloves, eye protection, and dust protection when mixing dry bags.",
    regionalExamples: {
      ghana:
        "Laying 6-inch sandcrete blocks with continuous bond-beam reinforcement and damp-proof course (DPC) protection.",
      unitedStates:
        "ASTM C270 Type N and Type S mortar selection for brick veneer and structural CMU block foundations.",
    },
  },
  {
    id: "disc-auto-obd2-video",
    title: "Automotive Diagnostics: Reading OBD-II Fuel Trim, Misfire Counts & Wiring Drop",
    summary:
      "How to combine scan-tool live data (STFT/LTFT) with a digital multimeter voltage-drop test instead of guessing and swapping parts.",
    type: "video",
    category: "skilled-trade",
    isEducational: true,
    topic: "Automotive Mechanics & ASE Prep",
    courseId: "auto-mechanics",
    suggestedModuleIndex: 1,
    skillLevel: "Intermediate",
    durationOrLength: "16 min video",
    primaryAction: "Watch",
    source: {
      name: "ASE Diagnostic Bay",
      author: "Engr. Kwame Mensah · ASE Master Tech",
      url: "https://www.ase.com/",
      license: "Vibe Automotive Training",
      verified: true,
    },
    mediaUrl: "/media/hall/realtor.mp4",
    posterUrl: "/media/hall/realtor.jpg",
    learningObjectives: [
      "Interpret OBD-II fault codes alongside Short-Term and Long-Term Fuel Trim data",
      "Perform a 12V starter and ground circuit voltage-drop test safely",
    ],
    prerequisites: ["Shop jack-stand safety, wheel chocks, and exhaust ventilation"],
    safetyAndSupervisionNote:
      "Never work under a vehicle supported only by a hydraulic jack; verify rated jack stands, wheel chocks, eye protection, and high-voltage isolation on hybrid/EV bays.",
  },
  {
    id: "disc-cyber-packets-reel",
    title: "Packet Ghost & SQL Injection Triage: How Parameterised Queries Stop Exploits",
    summary:
      "Short diagnostic reel and lab breakdown showing why string-concatenated SQL fails and how prepared statements and least-privilege DB roles block injection.",
    type: "reel",
    category: "certification",
    isEducational: true,
    topic: "Cybersecurity & CompTIA Security+",
    courseId: "cyber",
    suggestedModuleIndex: 1,
    skillLevel: "Beginner",
    durationOrLength: "6 min lab reel",
    primaryAction: "Watch",
    source: {
      name: "Cyber Clinic · OWASP & NIST",
      author: "Zainab Bello · SOC Lead",
      url: "https://owasp.org/www-project-top-ten/",
      license: "OWASP CC BY-SA 4.0",
      verified: true,
    },
    mediaUrl: "/media/covers/ctf.jpg",
    posterUrl: "/media/covers/ctf.jpg",
    learningObjectives: [
      "Identify untrusted user input entering a query or shell command",
      "Replace string concatenation with parameterised prepared statements",
    ],
    prerequisites: ["Basic HTTP request/response flow"],
    safetyAndSupervisionNote:
      "All security testing must be performed strictly inside authorised, isolated lab environments.",
  },
  {
    id: "disc-science-solar-article",
    title: "Solar Microgrids, Peak-Sun-Hours & Battery Usable Storage Calculations",
    summary:
      "Worked engineering article showing how to convert kW nameplate capacity into daily kWh generation and size usable battery storage.",
    type: "article",
    category: "educational",
    isEducational: true,
    topic: "Science & Clean Energy",
    courseId: "science",
    suggestedModuleIndex: 1,
    skillLevel: "Beginner",
    durationOrLength: "10 min article",
    primaryAction: "Read",
    source: {
      name: "Noctis Energy & Physics Bench",
      author: "Dr. Nia Ofori · Energy Systems",
      url: "https://openstax.org/subjects/science",
      license: "CC BY 4.0 (OpenStax aligned)",
      verified: true,
    },
    mediaUrl: "/media/posts/calc.jpg",
    posterUrl: "/media/posts/calc.jpg",
    learningObjectives: [
      "Distinguish power (kW) from energy (kWh) over a 24-hour load curve",
      "Compute usable battery discharge duration from round-trip efficiency",
    ],
    prerequisites: ["Basic arithmetic and unit conversion"],
  },
  {
    id: "disc-geo-harmattan-article",
    title: "Harmattan Winds, West African River Basins & Reading Topographic Scale",
    summary:
      "Explore how seasonal trade winds, elevation contours, and river catchments shape settlement and agriculture across Ghana and West Africa.",
    type: "article",
    category: "educational",
    isEducational: true,
    topic: "Geography",
    courseId: "geo",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "8 min article",
    primaryAction: "Read",
    source: {
      name: "Spatial & Regional Atlas",
      author: "Adwoa Koomson · Geographer",
      url: "https://earthobservatory.nasa.gov/",
      license: "Public Domain / NASA Earth Observatory",
      verified: true,
    },
    mediaUrl: "/media/covers/harmattan.jpg",
    posterUrl: "/media/covers/harmattan.jpg",
    learningObjectives: [
      "Read map scale, contour intervals, and compass bearings accurately",
      "Connect seasonal wind patterns and river basins to regional land use",
    ],
    prerequisites: ["None"],
  },
  {
    id: "disc-bible-context-article",
    title: "Reading a Passage in Context: Literary Frame, Historical Setting & Cross-References",
    summary:
      "How to read the verses before and after a text, check who is speaking to whom, and verify claims directly against chapter and verse.",
    type: "article",
    category: "educational",
    isEducational: true,
    topic: "Bible Study",
    courseId: "bible",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "11 min article",
    primaryAction: "Read",
    source: {
      name: "Pulpit & Textual Context Desk",
      author: "Rev. Samuel Mensah",
      url: "https://bibleproject.com/",
      license: "Educational Study Guide",
      verified: true,
    },
    mediaUrl: "/media/desk/pulpit.jpg",
    posterUrl: "/media/desk/pulpit.jpg",
    learningObjectives: [
      "Trace the surrounding literary unit before interpreting a single verse",
      "Distinguish what the text states from unverified commentary",
    ],
    prerequisites: ["None"],
  },
  // Entertainment / General Social items (kept available in Discover, separate from formal learning unless user explicitly chooses)
  {
    id: "disc-ent-nightmarket-vibes",
    title: "Friday Night Market Acoustic Session — Two Speakers & A Pavement",
    summary:
      "Community live music reel from the campus night market. Pure entertainment and social hangouts after evening lectures.",
    type: "entertainment",
    category: "entertainment",
    isEducational: false,
    topic: "Campus Music & Social",
    courseId: "",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "3 min social reel",
    primaryAction: "Watch",
    source: {
      name: "Night Market Crew",
      author: "@nightmarket_live",
      url: "https://back-vibtook-3.vercel.app/reels",
      license: "Community Social Post",
      verified: false,
    },
    mediaUrl: "/media/covers/nightmarket.jpg",
    posterUrl: "/media/covers/nightmarket.jpg",
    learningObjectives: [],
    prerequisites: [],
  },
  {
    id: "disc-ent-hall-football",
    title: "Commonwealth Hall Inter-Hall Penalty Shootout Highlights",
    summary:
      "Weekend campus sports highlights and crowd reactions from the Great Hall steps.",
    type: "entertainment",
    category: "entertainment",
    isEducational: false,
    topic: "Campus Sports & Entertainment",
    courseId: "",
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "4 min highlight clip",
    primaryAction: "Watch",
    source: {
      name: "Commonwealth Hall TV",
      author: "@vandals_sport",
      url: "https://back-vibtook-3.vercel.app/reels",
      license: "Community Social Post",
      verified: false,
    },
    mediaUrl: "/media/covers/hall.jpg",
    posterUrl: "/media/covers/hall.jpg",
    learningObjectives: [],
    prerequisites: [],
  },
  {
    id: "disc-aws-s3-reel",
    title: "Hall Reel: Blocking Public S3 Buckets & Bucket Policies in 90 Seconds",
    summary:
      "Short hall clip showing why public S3 buckets leak data and how S3 Block Public Access + least-privilege bucket policies lock down cloud storage.",
    type: "reel",
    category: "certification",
    isEducational: true,
    topic: "AWS Cloud Computing",
    courseId: "aws-cloud",
    suggestedModuleIndex: 1,
    skillLevel: "Beginner",
    durationOrLength: "90 sec reel",
    primaryAction: "Watch",
    source: {
      name: "AWS S3 Security Documentation",
      author: "Noctis Cloud Hall",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html",
      license: "Official Vendor Documentation Reference",
      verified: true,
    },
    mediaUrl: "/media/hall/developer.mp4",
    posterUrl: "/media/hall/developer.jpg",
    learningObjectives: [
      "Enable all four S3 Block Public Access settings at the account and bucket level",
      "Serve private S3 assets through CloudFront Origin Access Control (OAC) instead of public ACLs",
    ],
    prerequisites: ["Basic cloud storage concepts"],
    quickQuiz: {
      question:
        "How should a static website or media app serve private S3 objects securely to users?",
      options: [
        "Keep S3 Block Public Access enabled and serve objects through CloudFront with Origin Access Control (OAC).",
        "Make the entire S3 bucket world-writable so browsers can fetch files directly.",
        "Put root access keys inside client-side JavaScript.",
      ],
      correctIndex: 0,
      explanation:
        "CloudFront Origin Access Control (OAC) allows CloudFront to fetch objects from a private S3 bucket while keeping S3 Block Public Access turned on.",
    },
  },
  {
    id: "disc-carpentry-rafter-reel",
    title: "Hall Reel: Marking Common Rafter Plumb & Birdsmouth Cuts with a Speed Square",
    summary:
      "Short workshop reel demonstrating how to pivot a 7-inch speed square on the 6-in-12 pitch mark and lay out a clean birdsmouth seat cut without over-notching.",
    type: "reel",
    category: "skilled-trade",
    isEducational: true,
    topic: "Carpentry & Roof Framing",
    courseId: "carpentry",
    suggestedModuleIndex: 2,
    skillLevel: "Intermediate",
    durationOrLength: "90 sec reel",
    primaryAction: "Watch",
    source: {
      name: "NCCER Carpentry Roof Framing & OSHA 1926",
      author: "Master Carpenter Kofi Mensah",
      url: "https://www.osha.gov/construction",
      license: "Verified Trade & Safety Reference",
      verified: true,
    },
    mediaUrl: "/media/hall/builders.jpg",
    posterUrl: "/media/hall/builders.jpg",
    learningObjectives: [
      "Pivot a speed square accurately to scribe ridge plumb cuts and birdsmouth seat cuts",
      "Keep birdsmouth notch depth within one-third of the rafter depth to preserve structural strength",
    ],
    prerequisites: ["Tape measure reading and circular saw safety"],
    safetyAndSupervisionNote:
      "Always clamp rafters on stable sawhorses, wear ANSI Z87.1 eye protection, and keep both hands clear of the saw blade path.",
    quickQuiz: {
      question:
        "Why must the birdsmouth cut on a common rafter never exceed one-third of the rafter’s depth?",
      options: [
        "Over-notching weakens the rafter at the wall plate support point and can cause splitting under roof load.",
        "It makes the roof shingles change colour.",
        "A deeper notch makes the speed square heavier.",
      ],
      correctIndex: 0,
      explanation:
        "Building codes limit birdsmouth notches so at least two-thirds of the rafter depth remains continuous above the top plate.",
    },
  },
];

/**
 * Maps any DiscoverContentItem to one of the 3 Discover menu channels shown in the Discover navigation:
 * - "academy": Academy (Discover, practice, and apply — videos, courses, trade demonstrations)
 * - "reels": Reels (Short clips by hall — short educational reels)
 * - "news": News & Analysis (The story, and what to study next — verified articles & technical analysis)
 * - "entertainment": General campus social & entertainment (kept separate from formal learning)
 */
export type DiscoverMenuChannelId = "academy" | "reels" | "news" | "entertainment";

export function getDiscoverMenuChannel(item: DiscoverContentItem): DiscoverMenuChannelId {
  if (!item.isEducational || item.category === "entertainment" || item.type === "entertainment") {
    return "entertainment";
  }
  if (item.type === "reel") {
    return "reels";
  }
  if (item.type === "article") {
    return "news";
  }
  return "academy";
}

/**
 * Converts a KnowledgeAsset (from News & Analysis /news or Hall / Academy) into a DiscoverContentItem
 * so clicking "Add to journey" or "Build a Journey" in News & Analysis or Academy connects directly to JourneyStore.
 */
export function discoverItemFromKnowledgeAsset(asset: {
  assetId: string;
  title: string;
  source?: string;
  creator?: string;
  category?: string;
  summary?: string;
  whyItMatters?: string;
  vibeInsight?: string;
  careerTags?: string[];
  certificationTags?: string[];
}): DiscoverContentItem {
  const cleanId = `asset-${asset.assetId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48)}`;
  const existing = DISCOVER_CONTENT_ITEMS.find((item) => item.id === cleanId);
  if (existing) return existing;

  const text = `${asset.title} ${asset.category ?? ""} ${asset.summary ?? ""} ${(asset.careerTags ?? []).join(" ")} ${(asset.certificationTags ?? []).join(" ")}`.toLowerCase();
  let courseId = "science";
  let topic = asset.category || "News & Analysis";
  let category: DiscoverContentCategory = "educational";

  if (text.includes("aws") || text.includes("cloud") || text.includes("azure")) {
    courseId = "aws-cloud";
    topic = "AWS Cloud Computing";
    category = "certification";
  } else if (text.includes("cyber") || text.includes("security") || text.includes("nist") || text.includes("malware")) {
    courseId = "cyber";
    topic = "Cybersecurity";
    category = "certification";
  } else if (text.includes("carpent") || text.includes("weld") || text.includes("electric") || text.includes("trade") || text.includes("mason")) {
    courseId = "carpentry";
    topic = "Carpentry & Construction";
    category = "skilled-trade";
  } else if (text.includes("web") || text.includes("software") || text.includes("code")) {
    courseId = "web";
    topic = "Web Design & Software";
  } else if (text.includes("climate") || text.includes("harmattan") || text.includes("africa") || text.includes("region") || text.includes("world")) {
    courseId = "geo";
    topic = "Geography & Regional Analysis";
  } else if (text.includes("energy") || text.includes("grid") || text.includes("engineer")) {
    courseId = "eng";
    topic = "Engineering";
  }

  return {
    id: cleanId,
    title: asset.title,
    summary:
      asset.summary ||
      asset.whyItMatters ||
      "Verified News & Analysis report connected to your learning journey.",
    type: "article",
    category,
    isEducational: true,
    topic,
    courseId,
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: "News & Analysis brief",
    primaryAction: "Read",
    source: {
      name: asset.source || "Noctis News & Analysis Desk",
      author: asset.creator || asset.source || "Verified Desk",
      url: "https://back-vibtook-3.vercel.app/news",
      license: "Verified Editorial & Source Analysis",
      verified: true,
    },
    mediaUrl: "/media/covers/harmattan.jpg",
    posterUrl: "/media/covers/harmattan.jpg",
    learningObjectives: [
      asset.whyItMatters || `Connect the report “${asset.title}” to core concepts in ${topic}.`,
      asset.vibeInsight
        ? `Career & skill relevance: ${asset.vibeInsight}`
        : `Verify primary claims and apply them inside your ${topic} learning path.`,
    ],
    prerequisites: ["None"],
  };
}

/**
 * Converts a FeedPost from the existing Discover feed into a DiscoverContentItem
 * while preserving its original ID and source metadata.
 */
export function feedPostToDiscoverItem(post: FeedPost): DiscoverContentItem {
  const existing = DISCOVER_CONTENT_ITEMS.find((item) => item.id === post.id);
  if (existing) return existing;

  const text = `${post.teach?.stamp ?? ""} ${post.teach?.hook ?? ""} ${post.caption} ${post.hashtags.join(" ")}`.toLowerCase();
  const isEnt =
    post.lane === "vibe" &&
    !post.teach?.prompt &&
    !text.includes("clinic") &&
    !text.includes("study");

  let courseId = "science";
  let topic = post.teach?.stamp || "General Discovery";
  let category: DiscoverContentCategory = isEnt ? "entertainment" : "educational";

  if (text.includes("aws") || text.includes("cloud")) {
    courseId = "aws-cloud";
    topic = "AWS Cloud Computing";
    category = "certification";
  } else if (text.includes("cyber") || text.includes("packet") || text.includes("sql") || text.includes("security")) {
    courseId = "cyber";
    topic = "Cybersecurity";
    category = "certification";
  } else if (text.includes("web") || text.includes("html") || text.includes("css") || text.includes("react") || text.includes("compile")) {
    courseId = "web";
    topic = "Web Design & Software";
  } else if (text.includes("carpentr") || text.includes("mason") || text.includes("shop") || text.includes("weld")) {
    courseId = "carpentry";
    topic = "Skilled Trades & Construction";
    category = "skilled-trade";
  } else if (text.includes("luke") || text.includes("pulpit") || text.includes("bible") || text.includes("psalm")) {
    courseId = "bible";
    topic = "Bible Study";
  } else if (text.includes("harmattan") || text.includes("map") || text.includes("geo")) {
    courseId = "geo";
    topic = "Geography";
  }

  return {
    id: post.id,
    title: post.teach?.hook || post.caption.slice(0, 72) || "Discover Clip",
    summary: post.caption,
    type: post.mediaType === "video" || post.youtubeId ? "video" : "article",
    category,
    isEducational: !isEnt,
    topic,
    courseId: isEnt ? "" : courseId,
    suggestedModuleIndex: 0,
    skillLevel: "Beginner",
    durationOrLength: post.mediaType === "video" ? "Short video lesson" : "Illustrated note",
    primaryAction: post.mediaType === "video" || post.youtubeId ? "Watch" : "Read",
    source: {
      name: post.teach?.stamp || "Vibe Discover",
      author: post.author.name,
      url: post.mediaUrl,
      license: "Vibe Community & Clinic Verified",
      verified: true,
    },
    mediaUrl: post.mediaUrl,
    posterUrl: post.posterUrl || post.mediaUrl,
    learningObjectives: post.teach?.prompt
      ? [post.teach.prompt]
      : [`Understand the core concept in ${post.teach?.stamp || "this topic"}`],
    prerequisites: ["None"],
  };
}

/**
 * Builds the 5-stage AWS Cloud Computing journey or Trade journeys with demonstrations,
 * safety instruction, supervised practice requirements, and competency checks.
 */
export function resolveOrGenerateCourseForTopic(
  topicOrCourseId: string,
  sourceContent?: DiscoverContentItem,
): JourneyPath {
  const clean = topicOrCourseId.trim().toLowerCase();

  // Check built-in flagship journeys first
  const builtin = JOURNEY_PATHS.find(
    (p) => p.id.toLowerCase() === clean || p.subject.toLowerCase() === clean,
  );
  if (builtin) return builtin;

  // Example from Section 3 of Spec: AWS Cloud Computing 5-stage plan
  if (clean.includes("aws") || clean.includes("cloud")) {
    const base = pathForNamedCourse("AWS Certified Cloud Practitioner");
    const stages = [
      {
        id: "aws-stage-1",
        title: "1. Cloud computing fundamentals",
        stage: "Foundations" as const,
        summary: "Regions, Availability Zones, shared responsibility model, and on-demand cloud economics.",
      },
      {
        id: "aws-stage-2",
        title: "2. AWS core services",
        stage: "Core Concepts" as const,
        summary: "EC2 compute, Lambda serverless functions, S3 object storage, EBS, and RDS managed databases.",
      },
      {
        id: "aws-stage-3",
        title: "3. Networking, identity and security",
        stage: "Guided Practice" as const,
        summary: "VPC subnets, security groups, IAM users/roles/policies, MFA, and least-privilege guardrails.",
      },
      {
        id: "aws-stage-4",
        title: "4. Architecture and practical labs",
        stage: "Advanced Topics" as const,
        summary: "High-availability load balancing, Auto Scaling, CloudWatch telemetry, and Well-Architected labs.",
      },
      {
        id: "aws-stage-5",
        title: "5. Practice assessment and certification preparation",
        stage: "Final Project" as const,
        summary: "Scenario-based exam readiness check and a verified VPC + IAM architecture brief.",
      },
    ];
    return {
      ...base,
      id: "aws-cloud",
      subject: "AWS Cloud Computing",
      title: "Learn AWS Cloud Computing",
      tagline: "Cloud Computing & IT Certifications · AWS · 5 stages",
      blurb:
        sourceContent?.title ||
        "From cloud fundamentals to VPC security, core services, architecture labs, and AWS certification prep.",
      modules: stages.map((st, idx) => {
        const templateMod = base.modules[idx % base.modules.length]!;
        return {
          ...templateMod,
          id: st.id,
          title: st.title,
          stage: st.stage,
          summary: st.summary,
          lessons: templateMod.lessons.map((l) => ({
            ...l,
            id: `${st.id}-l1`,
            title: st.title.replace(/^\d+\.\s*/, ""),
          })),
        };
      }),
    };
  }

  // Skilled Trades (Carpentry, Masonry, Auto Mechanics, Electrical, Welding)
  if (
    clean.includes("carpentr") ||
    clean.includes("mason") ||
    clean.includes("auto") ||
    clean.includes("mechanic") ||
    sourceContent?.category === "skilled-trade"
  ) {
    const label =
      clean.includes("carpentr")
        ? "Carpentry & Structural Framing"
        : clean.includes("mason")
          ? "Masonry & Bricklaying"
          : clean.includes("auto") || clean.includes("mechanic")
            ? "Automotive Diagnostics & ASE Repair"
            : sourceContent?.topic || topicOrCourseId;

    const base = pathForNamedCourse(label);
    const tradeStages = [
      {
        id: `${base.id}-s1`,
        title: "1. Workshop safety, PPE & tool isolation",
        stage: "Foundations" as const,
        summary:
          sourceContent?.safetyAndSupervisionNote ||
          "Mandatory PPE, hazard identification, safe lifting/jack-stand rules, and tool inspection before any physical work.",
      },
      {
        id: `${base.id}-s2`,
        title: "2. Trade drawings, measurements & material specs",
        stage: "Core Concepts" as const,
        summary: "Reading blueprints/schematics, measuring tolerances, and selecting rated materials.",
      },
      {
        id: `${base.id}-s3`,
        title: "3. Step-by-step demonstration & guided method",
        stage: "Guided Practice" as const,
        summary: "Visual walkthrough of the trade procedure, layout checkpoints, and common fault prevention.",
      },
      {
        id: `${base.id}-s4`,
        title: "4. Supervised hands-on practice requirements",
        stage: "Advanced Topics" as const,
        summary: "Checklist for supervised shop/jobsite execution, tolerances, and quality inspection.",
      },
      {
        id: `${base.id}-s5`,
        title: "5. Competency check & licensing/certification boundary",
        stage: "Final Project" as const,
        summary: "Written + practical competency verification and state/ASE/NCCER licensing guidance.",
      },
    ];
    return {
      ...base,
      subject: label,
      modules: tradeStages.map((st, idx) => {
        const templateMod = base.modules[idx % base.modules.length]!;
        return {
          ...templateMod,
          id: st.id,
          title: st.title,
          stage: st.stage,
          summary: st.summary,
          lessons: templateMod.lessons.map((l) => ({
            ...l,
            id: `${st.id}-l1`,
            title: st.title.replace(/^\d+\.\s*/, ""),
          })),
        };
      }),
    };
  }

  return pathForTopic(sourceContent?.topic || topicOrCourseId);
}

/**
 * Required Operation 1: List and search Discover content
 */
export function listDiscoverContent(
  options: {
    query?: string;
    type?: DiscoverContentType | "all";
    category?: DiscoverContentCategory | "all";
    includeEntertainment?: boolean;
    extraItems?: DiscoverContentItem[];
  } = {},
): DiscoverContentItem[] {
  const {
    query = "",
    type = "all",
    category = "all",
    includeEntertainment = true,
    extraItems = [],
  } = options;

  const byId = new Map<string, DiscoverContentItem>();
  for (const item of [...DISCOVER_CONTENT_ITEMS, ...extraItems]) {
    byId.set(item.id, item);
  }

  const q = query.trim().toLowerCase();
  return Array.from(byId.values()).filter((item) => {
    if (!includeEntertainment && !item.isEducational) return false;
    if (type !== "all" && item.type !== type) return false;
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return `${item.title} ${item.summary} ${item.topic} ${item.source.name} ${item.learningObjectives.join(" ")}`
      .toLowerCase()
      .includes(q);
  });
}

/**
 * Required Operation 2: Match content to existing courses, modules, lessons, and learning objectives
 */
export type NoctisContentMatch = {
  contentId: string;
  identifiedSubject: string;
  learningObjectives: string[];
  missingPrerequisites: string[];
  safetyRequirements?: string;
  hasMatchingActiveJourney: boolean;
  matchedJourney: JourneyPath;
  matchedModule: JourneyModule;
  matchedLesson: JourneyLesson;
  recommendedAction: "Add to active Journey" | "Build a new Journey with Noctis";
  whyRelevant: string;
};

export function matchContentToJourney(
  content: DiscoverContentItem,
  activeJourney: JourneyPath,
): NoctisContentMatch {
  const activeMatches =
    Boolean(content.courseId) &&
    (activeJourney.id.toLowerCase() === content.courseId.toLowerCase() ||
      activeJourney.subject.toLowerCase().includes(content.topic.toLowerCase()) ||
      content.topic.toLowerCase().includes(activeJourney.subject.toLowerCase()));

  const targetJourney = activeMatches
    ? activeJourney
    : resolveOrGenerateCourseForTopic(content.courseId || content.topic, content);

  const modIndex = Math.min(
    Math.max(0, content.suggestedModuleIndex),
    Math.max(0, targetJourney.modules.length - 1),
  );
  const matchedModule = targetJourney.modules[modIndex] ?? targetJourney.modules[0]!;
  const matchedLesson = matchedModule.lessons[0]!;

  const whyRelevant = activeMatches
    ? `Directly supports your active ${activeJourney.subject} journey in “${matchedModule.title}” (${matchedLesson.title}): ${content.learningObjectives[0] ?? content.summary}`
    : `Matches the ${targetJourney.subject} learning path under “${matchedModule.title}” — covers ${content.learningObjectives[0] ?? content.topic}.`;

  return {
    contentId: content.id,
    identifiedSubject: content.topic,
    learningObjectives:
      content.learningObjectives.length > 0
        ? content.learningObjectives
        : [`Understand and apply ${content.topic}`],
    missingPrerequisites: content.prerequisites,
    safetyRequirements: content.safetyAndSupervisionNote,
    hasMatchingActiveJourney: activeMatches,
    matchedJourney: targetJourney,
    matchedModule,
    matchedLesson,
    recommendedAction: activeMatches
      ? "Add to active Journey"
      : "Build a new Journey with Noctis",
    whyRelevant,
  };
}

/**
 * Required Operation 3: Link content to a journey or lesson (Add to Journey)
 */
export function linkContentToJourney(
  state: DiscoverJourneyBridgeState,
  contentId: string,
  targetJourney: JourneyPath,
  options: {
    moduleId?: string;
    lessonId?: string;
    role?: ContentLessonLink["role"];
    allowDuplicateInSameLesson?: boolean;
    catalog?: DiscoverContentItem[];
  } = {},
): {
  ok: boolean;
  error?: string;
  link?: ContentLessonLink;
  state: DiscoverJourneyBridgeState;
} {
  const pool = [...(options.catalog ?? DISCOVER_CONTENT_ITEMS), ...(state.customItems ?? [])];
  const item = pool.find((c) => c.id === contentId);

  if (!item || item.accessible === false) {
    return {
      ok: false,
      error:
        "This resource is invalid, inaccessible, or has been removed from the source catalogue. Choose another verified Discover resource.",
      state,
    };
  }

  const match = matchContentToJourney(item, targetJourney);
  const moduleId = options.moduleId || match.matchedModule.id;
  const lessonId = options.lessonId || match.matchedLesson.id;

  const duplicate = state.links.find(
    (existing) =>
      existing.contentId === item.id &&
      existing.journeyId === targetJourney.id &&
      existing.lessonId === lessonId,
  );

  if (duplicate && !options.allowDuplicateInSameLesson) {
    return {
      ok: false,
      error: `“${item.title}” is already linked to this lesson (${match.matchedLesson.title}).`,
      link: duplicate,
      state,
    };
  }

  const role: ContentLessonLink["role"] =
    options.role ??
    (item.type === "video" || item.type === "reel"
      ? "primary-watch"
      : item.type === "article"
        ? "recommended-reading"
        : item.type === "slides"
          ? "slide-walkthrough"
          : "practical-demo");

  const newLink: ContentLessonLink = {
    linkId: `link-${item.id}-${targetJourney.id}-${lessonId}`,
    contentId: item.id,
    journeyId: targetJourney.id,
    journeyTitle: targetJourney.subject,
    moduleId,
    lessonId,
    role,
    relevanceReason: match.whyRelevant,
    status: "linked",
    addedAt: "2026-10-22",
  };

  const isBuiltin = DISCOVER_CONTENT_ITEMS.some((c) => c.id === item.id);
  const existingCustom = state.customItems ?? [];
  const nextCustom =
    !isBuiltin && !existingCustom.some((c) => c.id === item.id)
      ? [item, ...existingCustom]
      : existingCustom;

  return {
    ok: true,
    link: newLink,
    state: {
      ...state,
      links: [newLink, ...state.links],
      customItems: nextCustom,
    },
  };
}

/**
 * Required Operation 4: Remove a user-created link without deleting the original Discover resource
 */
export function removeContentLink(
  state: DiscoverJourneyBridgeState,
  linkId: string,
): DiscoverJourneyBridgeState {
  return {
    ...state,
    links: state.links.filter((l) => l.linkId !== linkId),
  };
}

/**
 * Required Operation 5: Build a Journey from a selected Discover content item
 */
export function buildJourneyFromDiscoverContent(
  state: DiscoverJourneyBridgeState,
  contentId: string,
  catalog: DiscoverContentItem[] = DISCOVER_CONTENT_ITEMS,
): {
  ok: boolean;
  error?: string;
  journey?: JourneyPath;
  attachedLink?: ContentLessonLink;
  state: DiscoverJourneyBridgeState;
} {
  const pool = [...catalog, ...(state.customItems ?? [])];
  const item = pool.find((c) => c.id === contentId);
  if (!item || item.accessible === false) {
    return {
      ok: false,
      error:
        "Cannot build a learning journey: the selected Discover resource is invalid, inaccessible, or deleted.",
      state,
    };
  }

  const journey = resolveOrGenerateCourseForTopic(item.courseId || item.topic, item);
  const targetMod =
    journey.modules[
      Math.min(item.suggestedModuleIndex, Math.max(0, journey.modules.length - 1))
    ] ?? journey.modules[0]!;
  const targetLesson = targetMod.lessons[0]!;

  const linked = linkContentToJourney(state, item.id, journey, {
    moduleId: targetMod.id,
    lessonId: targetLesson.id,
    catalog: pool,
  });

  return {
    ok: true,
    journey,
    attachedLink: linked.link,
    state: linked.state,
  };
}

/**
 * Bookmark / Save for later / Mark as reviewed (Exposure only — never claims Mastery!)
 */
export function toggleBookmarkDiscoverItem(
  state: DiscoverJourneyBridgeState,
  contentId: string,
): DiscoverJourneyBridgeState {
  const exists = state.bookmarkedContentIds.includes(contentId);
  return {
    ...state,
    bookmarkedContentIds: exists
      ? state.bookmarkedContentIds.filter((id) => id !== contentId)
      : [...state.bookmarkedContentIds, contentId],
  };
}

export function toggleSaveForLaterDiscoverItem(
  state: DiscoverJourneyBridgeState,
  contentId: string,
): DiscoverJourneyBridgeState {
  const exists = state.savedForLaterIds.includes(contentId);
  return {
    ...state,
    savedForLaterIds: exists
      ? state.savedForLaterIds.filter((id) => id !== contentId)
      : [...state.savedForLaterIds, contentId],
    links: state.links.map((l) =>
      l.contentId === contentId
        ? { ...l, status: exists ? "linked" : "saved-for-later" }
        : l,
    ),
  };
}

export function markDiscoverItemReviewed(
  state: DiscoverJourneyBridgeState,
  contentId: string,
): DiscoverJourneyBridgeState {
  const viewed = state.viewedContentIds.includes(contentId)
    ? state.viewedContentIds
    : [...state.viewedContentIds, contentId];
  const reviewed = state.reviewedContentIds.includes(contentId)
    ? state.reviewedContentIds
    : [...state.reviewedContentIds, contentId];

  return {
    ...state,
    viewedContentIds: viewed,
    reviewedContentIds: reviewed,
    links: state.links.map((l) =>
      l.contentId === contentId ? { ...l, status: "reviewed" } : l,
    ),
  };
}

/**
 * Required Operation 6: Retrieve journey-specific and lesson-aware recommendations from Discover
 */
export type JourneyRecommendedItem = {
  item: DiscoverContentItem;
  isLinkedToJourney: boolean;
  isLinkedToCurrentLesson: boolean;
  isReviewed: boolean;
  isSavedForLater: boolean;
  linkId?: string;
  whyRecommended: string;
  prerequisiteAlert?: string;
};

export function getJourneyRecommendations(
  activeJourney: JourneyPath,
  activeModule: JourneyModule,
  activeLesson: JourneyLesson,
  store: JourneyStore,
  bridgeState: DiscoverJourneyBridgeState,
  catalog: DiscoverContentItem[] = DISCOVER_CONTENT_ITEMS,
): JourneyRecommendedItem[] {
  const passedModules = new Set(store.checks[activeJourney.id] ?? []);
  const currentModulePassed = passedModules.has(activeModule.id);

  const journeyLinks = bridgeState.links.filter(
    (l) => l.journeyId === activeJourney.id,
  );
  const linkedIds = new Set(journeyLinks.map((l) => l.contentId));

  const mergedById = new Map<string, DiscoverContentItem>();
  for (const c of [...catalog, ...(bridgeState.customItems ?? [])]) {
    mergedById.set(c.id, c);
  }
  const mergedCatalog = Array.from(mergedById.values());

  const candidates = mergedCatalog.filter((item) => {
    if (item.accessible === false) return false;
    if (linkedIds.has(item.id)) return true;
    if (!item.isEducational) return false;

    const jSub = activeJourney.subject.toLowerCase();
    const jId = activeJourney.id.toLowerCase();
    const cId = item.courseId.toLowerCase();
    const cTop = item.topic.toLowerCase();

    return (
      cId === jId ||
      jSub.includes(cId) ||
      cTop.includes(jSub) ||
      jSub.includes(cTop) ||
      (jId.includes("aws") && cId.includes("aws")) ||
      (jId.includes("cloud") && cId.includes("aws"))
    );
  });

  const finalPool =
    candidates.length > 0
      ? candidates
      : catalog.filter((item) => item.isEducational && item.accessible !== false).slice(0, 3);

  const activeModIdx = Math.max(
    0,
    activeJourney.modules.findIndex((m) => m.id === activeModule.id),
  );

  const sorted = [...finalPool].sort((a, b) => {
    const aLink = journeyLinks.find((l) => l.contentId === a.id);
    const bLink = journeyLinks.find((l) => l.contentId === b.id);
    const aLessonMatch = aLink?.lessonId === activeLesson.id ? 1 : 0;
    const bLessonMatch = bLink?.lessonId === activeLesson.id ? 1 : 0;
    if (aLessonMatch !== bLessonMatch) return bLessonMatch - aLessonMatch;

    const aDist = Math.abs(a.suggestedModuleIndex - activeModIdx);
    const bDist = Math.abs(b.suggestedModuleIndex - activeModIdx);
    return aDist - bDist;
  });

  return sorted.map((item) => {
    const link = journeyLinks.find((l) => l.contentId === item.id);
    const isLinkedToCurrentLesson = link?.lessonId === activeLesson.id;
    const isReviewed = bridgeState.reviewedContentIds.includes(item.id);
    const isSavedForLater = bridgeState.savedForLaterIds.includes(item.id);

    const statusReason = currentModulePassed
      ? `You passed the “${activeModule.title}” check — use this ${item.type} to deepen applied fluency for your ${store.goal} goal.`
      : `Supports your current lesson “${activeLesson.title}” in ${activeModule.title} before you take the 80% mastery check: ${item.learningObjectives[0] ?? item.summary}`;

    const prerequisiteAlert =
      item.prerequisites.length > 0 && item.prerequisites[0] !== "None"
        ? `Prerequisite check: ${item.prerequisites.join("; ")}`
        : undefined;

    return {
      item,
      isLinkedToJourney: Boolean(link),
      isLinkedToCurrentLesson,
      isReviewed,
      isSavedForLater,
      linkId: link?.linkId,
      whyRecommended: link?.relevanceReason
        ? `${link.relevanceReason} · Current focus: ${activeLesson.title}`
        : statusReason,
      prerequisiteAlert,
    };
  });
}

export function readDiscoverJourneyState(): DiscoverJourneyBridgeState {
  if (typeof window === "undefined") return EMPTY_DISCOVER_JOURNEY_STATE;
  try {
    const raw = window.localStorage.getItem(BRIDGE_STORAGE_KEY);
    if (!raw) return EMPTY_DISCOVER_JOURNEY_STATE;
    const parsed = JSON.parse(raw) as Partial<DiscoverJourneyBridgeState>;
    return {
      ...EMPTY_DISCOVER_JOURNEY_STATE,
      ...parsed,
      links: Array.isArray(parsed.links) ? parsed.links : [],
      customItems: Array.isArray(parsed.customItems) ? parsed.customItems : [],
      bookmarkedContentIds: Array.isArray(parsed.bookmarkedContentIds)
        ? parsed.bookmarkedContentIds
        : [],
      viewedContentIds: Array.isArray(parsed.viewedContentIds)
        ? parsed.viewedContentIds
        : [],
      savedForLaterIds: Array.isArray(parsed.savedForLaterIds)
        ? parsed.savedForLaterIds
        : [],
      reviewedContentIds: Array.isArray(parsed.reviewedContentIds)
        ? parsed.reviewedContentIds
        : [],
      completedSimulationIds: Array.isArray(parsed.completedSimulationIds)
        ? parsed.completedSimulationIds
        : [],
    };
  } catch {
    return EMPTY_DISCOVER_JOURNEY_STATE;
  }
}

export function writeDiscoverJourneyState(
  next: DiscoverJourneyBridgeState,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BRIDGE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("vibe-discover-journey-sync"));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}
