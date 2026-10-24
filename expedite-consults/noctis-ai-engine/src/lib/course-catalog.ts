export type ReleaseWaveId = "wave-1" | "wave-2" | "wave-3" | "wave-4";

export type ReleaseWave = {
  id: ReleaseWaveId;
  label: string;
  shortLabel: string;
  focus: string;
  groupIds: string[];
};

export const RELEASE_WAVES: ReleaseWave[] = [
  {
    id: "wave-1",
    label: "Wave 1 — Professional technology",
    shortLabel: "Wave 1 · Tech & Cloud",
    focus: "AWS, Microsoft, Splunk, CompTIA, networking, cybersecurity, programming, AI and data.",
    groupIds: ["tech", "cyber", "dev", "data", "observe"],
  },
  {
    id: "wave-2",
    label: "Wave 2 — Skilled trades",
    shortLabel: "Wave 2 · Skilled Trades",
    focus: "Carpentry, masonry, construction, plumbing, electrical, HVAC, welding and automotive mechanics.",
    groupIds: ["build", "auto", "mep", "make", "energy"],
  },
  {
    id: "wave-3",
    label: "Wave 3 — Professional careers",
    shortLabel: "Wave 3 · Careers & Health",
    focus: "Business, finance, project management, healthcare, logistics, design, education, law and hospitality.",
    groupIds: ["business", "health", "move", "design", "hosp", "edu", "law"],
  },
  {
    id: "wave-4",
    label: "Wave 4 — Academic and specialist learning",
    shortLabel: "Wave 4 · Academic & Specialist",
    focus: "Science, engineering, mathematics, web design, geography, agriculture, environment, languages, history, arts and Bible studies.",
    groupIds: ["agri", "env", "math", "science", "eng", "web", "geo", "bible", "lang", "history", "arts"],
  },
];

export type CourseTrack = { name: string; courses: string[] };
export type CourseGroup = {
  id: string;
  sectionTag: string;
  name: string;
  summary: string;
  credentialNote: string;
  waveId: ReleaseWaveId;
  tracks: CourseTrack[];
};
export type CourseHit = { groupId: string; group: string; track: string; course: string };

function g(
  id: string,
  sectionTag: string,
  name: string,
  summary: string,
  credentialNote: string,
  tracks: [string, string[]][],
): CourseGroup {
  const wave =
    RELEASE_WAVES.find((w) => w.groupIds.includes(id))?.id ?? "wave-4";
  return {
    id,
    sectionTag,
    name,
    summary,
    credentialNote,
    waveId: wave,
    tracks: tracks.map(([track, courses]) => ({ name: track, courses })),
  };
}

export const COURSE_GROUPS: CourseGroup[] = [
  g(
    "tech",
    "Section 01",
    "Cloud Computing & IT Certifications",
    "AWS, Microsoft Azure & 365, Splunk observability, Cisco networking, CompTIA infrastructure, Linux & ITIL.",
    "Official vendor exams via AWS, Microsoft Learn, Splunk, Cisco & CompTIA",
    [
      [
        "Amazon Web Services (AWS)",
        [
          "AWS Certified Cloud Practitioner",
          "AWS Certified AI Practitioner",
          "AWS Certified Solutions Architect – Associate",
          "AWS Certified Developer – Associate",
          "AWS Certified CloudOps Engineer – Associate",
          "AWS Certified Data Engineer – Associate",
          "AWS Certified Machine Learning Engineer – Associate",
          "AWS Certified Security – Specialty",
          "AWS Certified Solutions Architect – Professional",
          "AWS Certified DevOps Engineer – Professional",
        ],
      ],
      [
        "Microsoft Certifications",
        [
          "AZ-900: Azure Fundamentals",
          "AZ-104: Azure Administrator Associate",
          "AZ-204: Azure Developer Associate",
          "AZ-305: Azure Solutions Architect Expert",
          "AZ-500: Azure Security Engineer Associate",
          "SC-900: Security, Compliance, and Identity Fundamentals",
          "SC-300: Identity and Access Administrator",
          "SC-200: Security Operations Analyst",
          "DP-900: Azure Data Fundamentals",
          "PL-300: Power BI Data Analyst",
          "AI-900: Azure AI Fundamentals",
          "Microsoft 365 Fundamentals",
          "Microsoft 365 Administrator Pathway",
        ],
      ],
      [
        "Splunk & Security Operations",
        [
          "Splunk Search Expert",
          "Splunk Enterprise Administration",
          "Splunk Enterprise Security",
          "Splunk Cloud Administration",
          "Data Onboarding and Log Analysis",
          "SPL Search Language",
          "Security Monitoring and Incident Investigation",
          "Splunk Dashboards and Reporting",
          "Splunk O11y Cloud Certified Metrics User",
          "Splunk Certified Cybersecurity Defense Analyst",
          "Splunk Certified Cybersecurity Defense Engineer",
          "Splunk Core Certified User (Legacy / Verification)",
          "Splunk Core Certified Power User (Legacy / Verification)",
          "Splunk Enterprise Certified Admin (Legacy / Verification)",
          "Splunk Enterprise Certified Architect (Legacy / Verification)",
        ],
      ],
      [
        "Networking & Infrastructure",
        [
          "Cisco CCST Networking",
          "Cisco CCNA",
          "Cisco CCNP Enterprise",
          "Cisco CCIE Pathway Overview",
          "CompTIA A+",
          "CompTIA Network+",
          "CompTIA Server+",
          "Linux Foundation System Administration",
          "Red Hat Certified System Administrator (RHCSA)",
          "VMware & Virtualisation Infrastructure",
          "ITIL 4 Foundation",
        ],
      ],
    ],
  ),
  g(
    "cyber",
    "Section 02",
    "Cybersecurity, Pentesting & Digital Forensics",
    "CompTIA, ISC2, ISACA, EC-Council, OffSec, GIAC, Palo Alto, Fortinet, cloud security & defensive labs.",
    "Proctored exams via CompTIA, ISC2, ISACA, OffSec, GIAC & vendor academies",
    [
      [
        "CompTIA Security",
        [
          "CompTIA Security+",
          "CompTIA CySA+ (Cybersecurity Analyst)",
          "CompTIA PenTest+",
          "CompTIA CASP+ / SecurityX",
          "CompTIA Linux+",
          "CompTIA Network+ Security Foundations",
        ],
      ],
      [
        "ISC2",
        [
          "Certified in Cybersecurity (CC)",
          "CISSP (Certified Information Systems Security Professional)",
          "SSCP (Systems Security Certified Practitioner)",
          "CCSP (Certified Cloud Security Professional)",
          "CGRC (Governance, Risk and Compliance)",
        ],
      ],
      [
        "ISACA",
        [
          "CISA (Certified Information Systems Auditor)",
          "CISM (Certified Information Security Manager)",
          "CRISC (Certified in Risk and Information Systems Control)",
          "CDPSE (Certified Data Privacy Solutions Engineer)",
        ],
      ],
      [
        "EC-Council",
        [
          "CEH (Certified Ethical Hacker)",
          "CHFI (Computer Hacking Forensic Investigator)",
          "CND (Certified Network Defender)",
        ],
      ],
      [
        "OffSec",
        [
          "OSCP (Offensive Security Certified Professional)",
          "OSWA (Offensive Security Web Assessor)",
          "OSEP (Experienced Penetration Tester)",
          "OSWE (Web Expert)",
        ],
      ],
      [
        "GIAC",
        [
          "GSEC (Security Essentials)",
          "GCIH (Certified Incident Handler)",
          "GCIA (Certified Intrusion Analyst)",
          "GPEN (Penetration Tester)",
          "GCFA (Certified Forensic Analyst)",
        ],
      ],
      [
        "Cisco, Palo Alto & Fortinet",
        [
          "Cisco CyberOps Associate",
          "Cisco CCNP Security",
          "Palo Alto Networks Network Security",
          "Palo Alto Networks Security Operations",
          "Palo Alto Networks Cloud Security",
          "Fortinet Fundamentals",
          "Fortinet Associate",
          "Fortinet Professional",
          "Fortinet Expert",
        ],
      ],
      [
        "Cloud & Linux Security",
        [
          "AWS Cloud Security & Incident Response",
          "Google Cloud Security Engineering & Operations",
          "Microsoft Information Protection & Identity Security",
          "Linux Foundation Kubernetes & Cloud-Native Security",
        ],
      ],
      [
        "Hands-On Security Labs",
        [
          "Ethical Hacking and Penetration Testing Lab",
          "Vulnerability Management & Remediation",
          "Incident Response & Triage Playbooks",
          "Digital Forensics & Evidence Preservation",
          "Threat Hunting & Detection Engineering",
          "Secure Coding & OWASP Top 10 Mitigation",
          "Malware Analysis (Defensive Controlled Lab)",
          "Identity and Access Management (IAM) Architecture",
          "SIEM Engineering & Log Correlation",
          "Enterprise Security Architecture",
        ],
      ],
    ],
  ),
  g(
    "dev",
    "Section 03",
    "Programming, Software Development & DevOps",
    "Languages, web/mobile apps, algorithms, DevOps CI/CD, Docker, Kubernetes, Terraform, databases, QA & enterprise apps.",
    "Portfolio-verified code + GitHub, CNCF Kubernetes, HashiCorp & cloud developer credentials",
    [
      [
        "Programming Languages",
        [
          "Python Programming",
          "Java Development",
          "JavaScript Foundations",
          "TypeScript Engineering",
          "C Systems Programming",
          "C++ Software Development",
          "C# and .NET Development",
          "Go (Golang) Backend Systems",
          "Rust Systems & Memory Safety",
          "PHP Web Backend",
          "Ruby & Scripting",
        ],
      ],
      [
        "Web Development",
        [
          "HTML5 & Semantic Structure",
          "CSS3 & Modern Responsive Layouts",
          "React Frontend Engineering",
          "Angular Enterprise Applications",
          "Vue.js Frontend Development",
          "Next.js Full-Stack Applications",
          "Node.js Backend Services",
          "REST & GraphQL API Design",
        ],
      ],
      [
        "Mobile Development",
        [
          "Android Development",
          "Kotlin for Mobile & Server",
          "Swift Programming",
          "iOS Application Engineering",
          "Flutter Cross-Platform Apps",
          "React Native Mobile Engineering",
        ],
      ],
      [
        "Software Engineering & Architecture",
        [
          "Algorithms & Complexity",
          "Data Structures in Practice",
          "Automated Software Testing",
          "Software Design Patterns",
          "Distributed Systems & Software Architecture",
        ],
      ],
      [
        "DevOps, Containers & Platform Engineering",
        [
          "Git & Version Control Workflows",
          "GitHub Actions & CI/CD Pipelines",
          "Jenkins Automation Server",
          "Infrastructure as Code (IaC)",
          "Docker Containerisation",
          "Kubernetes Orchestration (CKA / CKAD / CKS Prep)",
          "Helm Package Management",
          "Container Runtime & Supply-Chain Security",
          "Terraform (HashiCorp Certified Associate Prep)",
          "Ansible Configuration Management",
          "Observability & Site Reliability Engineering (SRE)",
        ],
      ],
      [
        "Cloud & Database Engineering",
        [
          "AWS Cloud Engineering",
          "Azure Cloud Engineering",
          "Google Associate Cloud Engineer Preparation",
          "Google Professional Cloud Architect Preparation",
          "Hybrid & Multi-Cloud Architecture",
          "SQL & Relational Database Design",
          "PostgreSQL Administration & Performance",
          "MySQL Database Operations",
          "MongoDB Document Databases",
          "Redis Caching & Real-Time Data",
          "Enterprise Data Modelling",
        ],
      ],
      [
        "Developer Credentials, QA & Enterprise Apps",
        [
          "GitHub Foundations Certification Prep",
          "GitHub Actions Certification Prep",
          "GitHub Administration Certification Prep",
          "Software Testing & QA Fundamentals",
          "Test Automation with Playwright",
          "Selenium WebDriver Automation",
          "API Contract & Load Testing",
          "SAP Enterprise Fundamentals",
          "Salesforce Administration & Development",
          "ServiceNow Platform Administration",
          "Microsoft Power Platform Maker & Architect",
        ],
      ],
    ],
  ),
  g(
    "data",
    "Section 04",
    "Artificial Intelligence, Data Science & Analytics",
    "GenAI, LLMs, RAG, AI agents, machine learning, Python/R data science, ETL, Power BI, Tableau, Spark & MLOps.",
    "Vendor credentials via Databricks, Snowflake, Microsoft, AWS, Google Cloud, Tableau & SAS",
    [
      [
        "AI, LLMs & Agentic Workflows",
        [
          "Artificial Intelligence Fundamentals",
          "Generative AI Foundations",
          "Machine Learning Engineering",
          "Deep Learning & Neural Networks",
          "Large Language Models (LLMs)",
          "Prompt Engineering and Evaluation",
          "AI Agents and Workflow Automation",
          "Retrieval-Augmented Generation (RAG)",
          "Vector Databases and Knowledge Graphs",
        ],
      ],
      [
        "Data Science & Data Engineering",
        [
          "Data Science with Python",
          "Data Science with R",
          "Data Engineering and ETL Pipelines",
          "Data Governance and Data Quality",
          "Statistical Analysis and Experimentation",
          "Big Data Processing with Apache Spark",
          "Event Streaming with Apache Kafka",
        ],
      ],
      [
        "Business Intelligence & Analytics",
        [
          "Business Intelligence with Power BI",
          "Visual Analytics with Tableau",
          "Advanced Excel for Data & Finance",
          "Quantitative Financial Modelling",
        ],
      ],
      [
        "MLOps, AI Safety & Applied Vision/NLP",
        [
          "MLOps and Production AI Deployment",
          "AI Safety, Governance, and Evaluation",
          "Computer Vision Systems",
          "Natural Language Processing (NLP)",
          "Geographic Information Systems (GIS) Analytics",
        ],
      ],
      [
        "Data & AI Vendor Credentials",
        [
          "Microsoft Data and AI Certifications",
          "AWS Data and Machine Learning Certifications",
          "Google Cloud Data and ML Certifications",
          "Databricks Lakehouse & Data Engineer Prep",
          "Snowflake SnowPro Core Preparation",
          "Tableau Certified Data Analyst Prep",
          "SAS Statistical & Analytics Credentials",
        ],
      ],
    ],
  ),
  g(
    "build",
    "Section 05",
    "Construction & Building Trades",
    "Carpentry, masonry, bricklaying, general contracting, blueprint reading, estimating, 20+ specialist trades & OSHA/NCCER.",
    "NCCER craft training & OSHA safety awareness · State/local board issues contractor licences",
    [
      [
        "Carpentry & Woodworking",
        [
          "Carpentry Fundamentals",
          "Measuring, Marking, and Cutting Timber",
          "Hand Tools and Power Tools",
          "Joinery and Cabinetmaking",
          "Door, Window, and Trim Installation",
          "Wall Framing",
          "Roof Framing and Trusses",
          "Staircase Construction",
          "Furniture Making",
          "Finish Carpentry",
          "Reading Construction Drawings",
          "Workshop and Jobsite Safety",
          "Carpentry Apprenticeship and Trade Exam Preparation",
        ],
      ],
      [
        "Masonry & Bricklaying",
        [
          "Bricklaying Fundamentals",
          "Block Laying and Concrete Masonry",
          "Mortar Mixing and Material Selection",
          "Foundation and Wall Construction",
          "Stone Masonry",
          "Plastering and Rendering",
          "Tiling and Surface Finishing",
          "Chimneys, Arches, and Retaining Walls",
          "Reading Masonry Drawings",
          "Estimating Bricks, Blocks, and Mortar",
          "Repair and Restoration of Masonry Structures",
        ],
      ],
      [
        "Building & General Contracting",
        [
          "Building Construction Fundamentals",
          "Construction Methods and Materials",
          "Foundation and Concrete Work",
          "Steel Reinforcement and Formwork",
          "Structural Framing",
          "Roof Systems and Installation",
          "Waterproofing and Insulation",
          "Blueprint Reading and Technical Drawings",
          "Construction Estimating and Bidding",
          "Site Supervision and Safety",
          "Construction Project Management",
          "Building Inspection Fundamentals",
          "Quantity Surveying",
          "Building Codes and Permits Overview",
        ],
      ],
      [
        "Structural, Exterior & Heavy Site Trades",
        [
          "Roofing Systems, Shingles, Metal & Flashing",
          "Concrete Finishing, Placement & Curing",
          "Reinforcing Iron and Rebar Work",
          "Structural Steel & On-Site Welding",
          "Heavy Equipment Operation Fundamentals",
          "Crane, Rigging, and Signal-Person Fundamentals",
          "Scaffolding Safety & Inspection",
          "Surveying and Site Layout",
          "Landscape Construction, Grading & Drainage",
        ],
      ],
      [
        "Interior Finish & Building Systems Trades",
        [
          "Drywall and Ceiling Installation",
          "Painting and Decorating",
          "Flooring and Tiling Installation",
          "Glazing and Glass Installation",
          "Insulation and Weatherisation",
          "Elevator and Escalator Technician Fundamentals",
          "Solar Panel Roof Mounting & Layout",
          "Fire Sprinkler and Life-Safety Systems",
          "Building Maintenance and Facilities Management",
        ],
      ],
      [
        "OSHA Safety & NCCER Craft Pathways",
        [
          "OSHA 10 & OSHA 30 Construction Safety Awareness",
          "NCCER Core Curriculum & Craft Training Pathways",
          "Apprenticeship Readiness & Trade Licensing Guide",
        ],
      ],
    ],
  ),
  g(
    "auto",
    "Section 06",
    "Automotive, Diesel & Mechanical Trades",
    "Auto mechanics, OBD-II diagnostics, diesel & heavy equipment, ASE A1–A8 exam prep, EV high-voltage safety, body & marine.",
    "ASE A1–A8 exam prep · Official ASE credential requires passing tests + verified shop experience",
    [
      [
        "Automotive Mechanic",
        [
          "Automotive Fundamentals",
          "Engine Operation and Repair",
          "Braking Systems",
          "Steering and Suspension",
          "Transmission and Drivetrain",
          "Automotive Electrical Systems",
          "Battery, Starting, and Charging Systems",
          "Electronic Fuel Injection and Engine Management",
          "OBD-II Diagnostics and Fault Codes",
          "Cooling and Lubrication Systems",
          "Preventive Maintenance and Servicing",
          "Vehicle Inspection and Safety Checks",
          "Air Conditioning and Climate Control",
          "Workshop Safety and Tool Use",
          "Customer Service and Repair-Order Documentation",
        ],
      ],
      [
        "Diesel & Heavy Equipment Mechanics",
        [
          "Diesel Engine Diagnostics",
          "Fuel Injection and Turbocharging",
          "Heavy Truck Maintenance",
          "Hydraulic Systems Diagnostics",
          "Earthmoving and Heavy Machinery",
          "Generator and Industrial Engine Maintenance",
          "Agricultural Equipment Repair",
          "Construction Equipment Maintenance",
          "Preventive Maintenance Planning",
        ],
      ],
      [
        "ASE Automotive Certification Preparation",
        [
          "ASE A1: Engine Repair",
          "ASE A2: Automatic Transmission/Transaxle",
          "ASE A3: Manual Drive Train and Axles",
          "ASE A4: Suspension and Steering",
          "ASE A5: Brakes",
          "ASE A6: Electrical/Electronic Systems",
          "ASE A7: Heating and Air Conditioning",
          "ASE A8: Engine Performance",
          "ASE Work-Experience & Certification Eligibility Guide",
        ],
      ],
      [
        "Electric Vehicle (EV), Hybrid & Electronics",
        [
          "Electric Vehicle (EV) Maintenance",
          "Hybrid Vehicle Systems",
          "EV High-Voltage Battery Safety & Isolation",
          "Automotive Electronics & ADAS Calibration",
          "Emissions Systems & Diagnostics",
        ],
      ],
      [
        "Collision, Specialty Vehicles & Fleet Service",
        [
          "Auto Body and Collision Repair",
          "Automotive Painting and Refinishing",
          "Automotive Welding & Frame Straightening",
          "Motorcycle Mechanics",
          "Small-Engine Repair",
          "Marine Engine Maintenance",
          "Aircraft Maintenance Fundamentals",
          "Parts and Service Advising",
          "Fleet Maintenance Management",
          "Vehicle Detailing",
          "Tire, Wheel, and Alignment Service",
        ],
      ],
    ],
  ),
  g(
    "mep",
    "Section 07",
    "Electrical, Plumbing & HVAC Certifications",
    "Residential/commercial electrical, PLCs, solar PV, plumbing, pipefitting, HVACR, building controls & EPA Section 608.",
    "NCCER, NATE, HVAC Excellence, RSES & EPA Section 608 prep · State boards issue trade licences",
    [
      [
        "Electrical & Industrial Automation",
        [
          "Electrical Theory & Ohm’s Law",
          "Residential Wiring",
          "Commercial Wiring",
          "Electric Motors & Transformers",
          "Control Panels & Switchgear",
          "Electrical Troubleshooting",
          "Industrial PLCs (Programmable Logic Controllers)",
          "Industrial Sensors & Actuators",
          "Motor Controls & VFDs",
          "Electrical Schematics & Wiring Diagrams",
          "Industrial Automation Systems",
        ],
      ],
      [
        "Renewable Energy & Microgrids",
        [
          "Solar PV Installation",
          "Battery Energy Storage Systems",
          "Inverters & Charge Controllers",
          "Microgrids & Off-Grid Power",
          "Wind Energy Technician Fundamentals",
        ],
      ],
      [
        "Plumbing & Pipefitting",
        [
          "Pipe Installation & Joining",
          "Drainage, Waste, and Vent (DWV) Systems",
          "Potable Water Supply Distribution",
          "Plumbing Fixtures & Appliances",
          "Leak Detection & Pressure Testing",
          "Plumbing Codes & Blueprint Reading",
          "Industrial Piping Systems",
          "Pipe Fabrication & Layout",
          "Valves, Actuators & Steam Traps",
          "High-Pressure Piping Systems",
          "Isometric Piping Drawings",
        ],
      ],
      [
        "HVAC, Refrigeration & Building Controls",
        [
          "HVAC Refrigeration Cycle Fundamentals",
          "Heating Systems (Gas, Hydronic & Heat Pumps)",
          "Ventilation, Ductwork & Indoor Air Quality",
          "Air Conditioning Systems",
          "HVAC System Diagnostics & Airflow Balancing",
          "Energy Efficiency & Load Calculation",
          "Commercial Refrigeration & Walk-In Cold Rooms",
          "Refrigerant Handling & Recovery",
          "Refrigeration Fault Diagnosis",
          "Building Automation Systems (BAS)",
          "Smart Thermostats, DDC Sensors & Energy Management",
        ],
      ],
      [
        "Fire Protection, Facilities & Licensing",
        [
          "Fire Alarm Systems Inspection & Wiring",
          "Fire Sprinkler Systems Maintenance",
          "Facilities Preventive Maintenance & Operations",
          "EPA Section 608 Refrigerant Handling Preparation",
          "NATE & HVAC Excellence Exam Preparation",
          "NCCER Electrical, Plumbing & HVAC Pathways",
          "RSES & State Trade Licensing Requirements",
        ],
      ],
    ],
  ),
  g(
    "make",
    "Section 08",
    "Manufacturing, Welding & Industrial Engineering",
    "MIG/TIG/Stick/Flux-cored welding, pipe welding, CNC machining, hydraulics, robotics, Lean Six Sigma, NDT & CAD.",
    "American Welding Society (AWS Welding), ASME, SME & SolidWorks/Autodesk credential pathways",
    [
      [
        "Welding & Metal Fabrication",
        [
          "MIG Welding (GMAW)",
          "TIG Welding (GTAW)",
          "Stick Welding (SMAW)",
          "Flux-Cored Arc Welding (FCAW)",
          "Pipe Welding & Position Qualification",
          "Sheet Metal Fabrication",
          "Welding Inspection & Weld Symbol Reading",
          "American Welding Society (AWS) Qualification Guide",
        ],
      ],
      [
        "CNC Machining & Industrial Maintenance",
        [
          "Machining and Metal Cutting Fundamentals",
          "CNC Machining Setup & Operation",
          "CNC G-Code & CAM Programming",
          "Mechanical Engineering Fundamentals for Maintenance",
          "Hydraulics and Pneumatics",
          "Industrial Instrumentation & Calibration",
          "Factory Safety, Lockout/Tagout (LOTO) & Machine Guarding",
          "Maintenance Planning & Reliability",
        ],
      ],
      [
        "Robotics, Quality & Production",
        [
          "Industrial Robotics and Automation",
          "Programmable Logic Controllers (PLCs) in Manufacturing",
          "Quality Control and Metrology Inspection",
          "Lean Manufacturing Principles",
          "Six Sigma Process Control",
          "Nondestructive Testing (NDT) Fundamentals",
          "Packaging and Production Line Operations",
          "Supply Chain and Production Planning",
        ],
      ],
      [
        "CAD, Additive Manufacturing & Credentials",
        [
          "CAD and Technical Engineering Drawing",
          "SolidWorks 3D CAD Design",
          "AutoCAD Drafting & Annotation",
          "Autodesk Fusion CAD/CAM",
          "3D Printing and Additive Manufacturing",
          "Materials Science & Metallurgy",
          "ASME & SME Manufacturing Credential Overview",
        ],
      ],
    ],
  ),
  g(
    "business",
    "Section 09",
    "Business, Management & Professional Certifications",
    "PMP, CAPM, PRINCE2, Scrum, IIBA business analysis, Lean Six Sigma, SHRM HR, accounting, CFA/CFP finance, sales & leadership.",
    "Prepares for PMI, Scrum.org, IIBA, SHRM, CFA Institute & CFP Board syllabus and eligibility rules",
    [
      [
        "Project Management, Scrum & Agile",
        [
          "PMP (Project Management Professional) Preparation",
          "CAPM (Certified Associate in Project Management) Prep",
          "PRINCE2 Foundation & Practitioner Overview",
          "Agile Project Management",
          "Certified ScrumMaster (CSM) Preparation",
          "Professional Scrum Master (PSM) Preparation",
          "Scrum Product Owner",
        ],
      ],
      [
        "Business Analysis & Process Improvement",
        [
          "ECBA (Entry Certificate in Business Analysis)",
          "CCBA (Certification of Capability in Business Analysis)",
          "CBAP (Certified Business Analysis Professional)",
          "Lean Six Sigma Yellow Belt",
          "Lean Six Sigma Green Belt",
          "Lean Six Sigma Black Belt",
        ],
      ],
      [
        "Human Resources & People Leadership",
        [
          "SHRM-CP Preparation",
          "SHRM-SCP Preparation",
          "PHR (Professional in Human Resources) Prep",
          "SPHR (Senior Professional in Human Resources) Prep",
          "People Management & Coaching",
          "Strategic Planning & Change Management",
          "Workplace Conflict Resolution",
        ],
      ],
      [
        "Accounting, Finance & Investment",
        [
          "Bookkeeping & Double-Entry Accounting",
          "Payroll Administration",
          "Financial Reporting & Statements",
          "QuickBooks Accounting",
          "Xero Cloud Accounting",
          "Financial Analysis & Budgeting",
          "Corporate Finance & Valuation",
          "CFA (Chartered Financial Analyst) Programme Prep",
          "Investment Analysis & Portfolio Management",
          "Personal Finance and CFP Preparation",
        ],
      ],
      [
        "Procurement, Sales, Marketing & Entrepreneurship",
        [
          "Supply Chain Management & Sourcing",
          "Contract Management & Vendor Negotiation",
          "Inventory, Warehouse & Transport Planning",
          "Consultative Selling & Account Management",
          "CRM Administration",
          "Digital Marketing, SEO & Paid Media Analytics",
          "Content Strategy",
          "Customer Service & Contact Centre Operations",
          "Entrepreneurship, Business Planning & Startup Finance",
          "Corporate Governance, Risk & Regulatory Compliance",
        ],
      ],
    ],
  ),
  g(
    "health",
    "Section 10",
    "Healthcare & Allied Health",
    "Medical terminology, anatomy, public health, billing & coding, EHR, phlebotomy/CNA/EMT/pharmacy tech prep & CPR/AED.",
    "Educational preparation only · Regulated clinical practice requires accredited in-person training & state licensure",
    [
      [
        "Healthcare Foundations & Public Health",
        [
          "Medical Terminology",
          "Human Anatomy and Physiology",
          "Public Health Fundamentals",
          "Epidemiology & Disease Surveillance",
          "Nutrition and Wellness",
          "Mental Health Awareness",
          "Patient Communication & Medical Ethics",
        ],
      ],
      [
        "Healthcare Administration, Billing & Informatics",
        [
          "Healthcare Administration",
          "Medical Office Management",
          "Medical Billing and Coding (ICD-10 / CPT Foundations)",
          "Electronic Health Records (EHR)",
          "Health Informatics & Health Data Analysis",
          "Healthcare Quality and Patient Safety",
        ],
      ],
      [
        "Allied Health & Clinical Exam Preparation",
        [
          "Medical Laboratory Fundamentals",
          "Phlebotomy Preparation",
          "Pharmacy Technician Preparation",
          "Nursing Prerequisites",
          "Certified Nursing Assistant (CNA) Preparation",
          "Emergency Medical Responder / EMT Preparation",
          "Dental Assisting Fundamentals",
          "Caregiving and Elder Care",
        ],
      ],
      [
        "Emergency Care, Infection Control & Biomedical Equipment",
        [
          "CPR, AED, and First Aid Preparation (Red Cross / AHA Guide)",
          "Infection Prevention & Sterile Technique",
          "Occupational Safety in Healthcare",
          "Medical Equipment Maintenance Fundamentals",
        ],
      ],
    ],
  ),
  g(
    "move",
    "Section 11",
    "Transportation, Logistics & Aviation",
    "CDL commercial driving theory, fleet & dispatch, warehouse/forklift safety, freight brokerage, maritime, aviation & FAA drone pilot.",
    "Theory & inspection prep · Official CDL and FAA Part 107 certificates issued by state DMV / FAA",
    [
      [
        "Commercial Driving (CDL) & Fleet Operations",
        [
          "Commercial Driving (CDL) Theory Preparation",
          "Heavy Truck Pre-Trip Inspection and Safety",
          "School Bus and Passenger Transport Theory",
          "Defensive Driving & Hazard Perception",
          "Fleet Operations Management",
          "Dispatch and Route Planning",
        ],
      ],
      [
        "Warehouse, Freight & Cold-Chain Logistics",
        [
          "Warehouse and Distribution Management",
          "Forklift and Material-Handling Safety",
          "Inventory Control Systems",
          "Supply Chain Analytics",
          "Freight Brokerage and Customs Fundamentals",
          "Cold-Chain Logistics & Temperature Control",
        ],
      ],
      [
        "Aviation, Drone Pilot (FAA Part 107), Maritime & Rail",
        [
          "Drone Pilot / Unmanned Aircraft Prep (FAA Part 107)",
          "Aviation Maintenance Fundamentals",
          "Aircraft Systems Overview",
          "Ground Operations and Airport Management",
          "Maritime Operations Fundamentals",
          "Port and Shipping Management",
          "Railway Operations and Maintenance Fundamentals",
        ],
      ],
    ],
  ),
  g(
    "agri",
    "Section 12",
    "Agriculture, Environment & Natural Resources",
    "Crop production, soil science, irrigation, greenhouse/hydroponics, livestock, agribusiness, forestry, GIS & water treatment.",
    "Field-ready agricultural, water & environmental management pathways",
    [
      [
        "Crop Production, Soil & Controlled-Environment Farming",
        [
          "Crop Production & Agronomy",
          "Farm Management",
          "Soil Science & Fertility",
          "Irrigation Systems Design & Maintenance",
          "Greenhouse Management",
          "Hydroponics and Vertical Farming",
          "Sustainable Agriculture & Agroecology",
          "Post-Harvest Handling and Food Storage",
        ],
      ],
      [
        "Livestock, Aquaculture & Agribusiness",
        [
          "Poultry Farming",
          "Livestock Management",
          "Aquaculture and Fisheries",
          "Veterinary Assistant Fundamentals",
          "Agricultural Machinery Operation and Repair",
          "Agribusiness and Farm Finance",
        ],
      ],
      [
        "Forestry, Water, GIS & Environmental Stewardship",
        [
          "Forestry and Timber Management",
          "Wildlife Conservation",
          "Geographic Information Systems (GIS) for Land Use",
          "Environmental Monitoring & Field Sampling",
          "Water and Wastewater Treatment",
          "Waste Management and Recycling",
          "Environmental Health and Safety (EHS)",
          "Climate Adaptation & Renewable Energy Systems",
        ],
      ],
    ],
  ),
  g(
    "design",
    "Section 13",
    "Design, Media & Creative Professions",
    "Graphic design, UI/UX, product/interior/fashion design, 3D animation, video/audio production, game design & Adobe/Autodesk prep.",
    "Portfolio-driven creative studio projects + Adobe Certified Professional & Autodesk prep",
    [
      [
        "Visual, UI/UX, Product & Spatial Design",
        [
          "Graphic Design & Visual Communication",
          "UI and UX Design",
          "Web Design & Design Systems",
          "Product Design",
          "Industrial Design",
          "Interior Design",
          "Architecture Software & BIM",
          "Fashion Design",
        ],
      ],
      [
        "3D, Film, Photography & Audio Production",
        [
          "3D Modelling and Animation",
          "Video Editing & Post-Production",
          "Motion Graphics",
          "Photography & Lighting",
          "Audio Engineering",
          "Music Production",
          "Broadcast Media",
          "Digital Illustration",
        ],
      ],
      [
        "Craft, Interactive Media & Software Credentials",
        [
          "Sewing and Garment Construction",
          "Printing and Signmaking",
          "Game Design",
          "Copywriting and Digital Storytelling",
          "Adobe Certified Professional Preparation",
          "Autodesk Certification Preparation",
        ],
      ],
    ],
  ),
  g(
    "hosp",
    "Section 14",
    "Hospitality, Food & Personal Services",
    "Culinary arts, baking, food safety & sanitation, hotel/restaurant management, events, barbering, cosmetology & esthetics.",
    "Food-handler & hospitality prep · Cosmetology, barbering & massage require state board practical hours",
    [
      [
        "Culinary Arts, Baking & Food Safety",
        [
          "Culinary Arts and Professional Cooking",
          "Baking and Pastry Arts",
          "Food Safety and Sanitation (Food Handler / Manager Prep)",
          "Restaurant Management",
          "Catering Operations",
          "Barista and Beverage Preparation",
        ],
      ],
      [
        "Hotel, Event & Travel Management",
        [
          "Hotel and Front-Desk Operations",
          "Customer Service in Hospitality",
          "Event Planning and Management",
          "Travel and Tourism Operations",
          "Housekeeping and Facility Care",
        ],
      ],
      [
        "Cosmetology, Barbering, Wellness & Textiles",
        [
          "Hairdressing and Barbering Foundations",
          "Cosmetology Theory & Salon Safety",
          "Nail Technology",
          "Esthetics and Skincare",
          "Massage Therapy Educational Foundations",
          "Tailoring and Garment Alterations",
          "Laundry and Dry-Cleaning Operations",
        ],
      ],
    ],
  ),
  g(
    "edu",
    "Section 15",
    "Education, Research & Academic Pathways",
    "Early childhood, classroom management, special education, STEM instruction, instructional design, research methods & statistics.",
    "Curriculum, pedagogy & research design pathways (state teacher licensure governed by education boards)",
    [
      [
        "Teaching, Classroom & Learner Support",
        [
          "Early Childhood Education",
          "Teaching Assistant Training",
          "Classroom Management",
          "Special Education Support",
          "Literacy and Numeracy Instruction",
          "STEM Education Methods",
          "Adult Education and Workplace Training",
          "Educational Leadership",
        ],
      ],
      [
        "Instructional Design & E-Learning",
        [
          "Educational Technology",
          "Instructional Design",
          "Online Course Development",
          "Curriculum Development",
          "Assessment Design & Rubrics",
        ],
      ],
      [
        "Academic Research, Writing & Lab Safety",
        [
          "Academic Writing & Citation Integrity",
          "Research Methods",
          "Statistics for Research",
          "Laboratory Safety",
        ],
      ],
    ],
  ),
  g(
    "law",
    "Section 16",
    "Law, Public Safety & Government",
    "Paralegal studies, legal research, contracts, compliance, privacy (CIPP), emergency management, firefighting, CFE fraud & AML.",
    "Prepares for ACFE CFE & IAPP CIPP exams · Does not grant bar admission or sworn peace-officer licensure",
    [
      [
        "Legal Support, Contracts & Privacy Compliance",
        [
          "Paralegal Studies",
          "Legal Research and Writing",
          "Contract Administration",
          "Corporate Compliance",
          "Privacy and Data Protection (CIPP Preparation)",
          "Records Management",
          "Public Administration",
        ],
      ],
      [
        "Emergency Management & Public Safety",
        [
          "Emergency Management",
          "Disaster Preparedness",
          "Occupational Health and Safety",
          "Firefighter Preparation",
          "Emergency Dispatch and Communications",
          "Security Guard and Loss-Prevention Training",
        ],
      ],
      [
        "Financial Crime, Fraud & Digital Evidence",
        [
          "Fraud Examination (CFE Preparation)",
          "Anti-Money Laundering (AML)",
          "Digital Evidence and Investigation Fundamentals",
          "Business Continuity and Risk Management",
        ],
      ],
    ],
  ),
  g(
    "math",
    "Section 17A",
    "Mathematics & Quantitative Sciences",
    "Arithmetic, algebra, geometry, trigonometry, calculus, linear algebra, differential equations, statistics & operations research.",
    "Rigorous step-by-step derivations, proofs & quantitative problem solving",
    [
      [
        "Foundational & Pure Mathematics",
        [
          "Arithmetic & Number Sense",
          "Algebra",
          "Geometry",
          "Trigonometry",
          "Single & Multivariable Calculus",
          "Linear Algebra",
          "Differential Equations",
          "Discrete Mathematics",
        ],
      ],
      [
        "Probability, Statistics & Operations Research",
        [
          "Statistics",
          "Probability Theory",
          "Operations Research & Optimisation",
          "Computational Modelling",
        ],
      ],
    ],
  ),
  g(
    "science",
    "Section 17B",
    "Natural, Physical & Earth Sciences",
    "Physics, chemistry, biology, genetics, biotechnology, ecology, geology, meteorology, oceanography, astronomy & nuclear science.",
    "Evidence-based scientific inquiry, laboratory reasoning & worked calculations",
    [
      [
        "Physics, Chemistry & Materials",
        [
          "Physics (Mechanics, Electromagnetism & Thermodynamics)",
          "Chemistry (General, Organic & Analytical)",
          "Materials Science",
          "Nuclear Science Fundamentals",
          "Astronomy & Astrophysics",
        ],
      ],
      [
        "Biology, Genetics & Life Sciences",
        [
          "Biology",
          "Genetics",
          "Biotechnology",
          "Ecology",
          "Human Anatomy",
        ],
      ],
      [
        "Earth, Ocean & Atmospheric Sciences",
        [
          "Earth Science",
          "Geology",
          "Meteorology",
          "Oceanography",
          "Scientific Method & Experimental Design",
        ],
      ],
    ],
  ),
  g(
    "eng",
    "Section 17C",
    "Engineering & Advanced Technical Disciplines",
    "Mechanical, electrical, civil, chemical, software, industrial, systems, aerospace, biomedical, environmental & robotics engineering.",
    "Engineering design checks, unit analysis, free-body diagrams & systems verification",
    [
      [
        "Core Engineering Disciplines",
        [
          "Mechanical Engineering",
          "Electrical Engineering",
          "Civil Engineering",
          "Chemical Engineering",
          "Software Engineering",
          "Industrial Engineering",
          "Systems Engineering",
        ],
      ],
      [
        "Specialist & Emerging Engineering",
        [
          "Aerospace Engineering",
          "Biomedical Engineering",
          "Environmental Engineering",
          "Robotics",
          "Energy Systems and Microgrids",
        ],
      ],
    ],
  ),
  g(
    "observe",
    "Wave 1 · Specialist",
    "Data & Observability (SIEM & Telemetry)",
    "Focused Splunk search, Enterprise Security, telemetry onboarding, alerting hygiene & operational dashboards.",
    "Splunk Education & Observability Cloud tracks",
    [
      [
        "Splunk Core & Enterprise",
        [
          "Splunk Search Expert",
          "Splunk Enterprise Administration",
          "Splunk Enterprise Security",
          "Splunk Cloud Administration",
          "SPL Search Language",
        ],
      ],
      [
        "Telemetry, Logs & Alerting",
        [
          "Data Onboarding and Log Analysis",
          "Security Monitoring and Incident Investigation",
          "Splunk Dashboards and Reporting",
          "Service Reliability & Alert Fatigue Reduction",
        ],
      ],
    ],
  ),
  g(
    "energy",
    "Wave 2 · Specialist",
    "Clean Energy, Solar PV & Grid Storage",
    "Solar PV roof layout, inverters, battery storage, microgrids, wind turbine safety & building energy efficiency.",
    "Renewable energy technician & microgrid design pathways",
    [
      [
        "Solar PV & Battery Storage",
        [
          "Solar PV Installation",
          "Roof Layout & Structural Mounting",
          "Inverters & Charge Sizing",
          "Battery Energy Storage Systems",
          "Microgrids & Islanding Controls",
        ],
      ],
      [
        "Wind & Energy Efficiency",
        [
          "Wind Energy & Turbine Safety",
          "Home & Commercial Energy Auditing",
        ],
      ],
    ],
  ),
  g(
    "env",
    "Wave 4 · Specialist",
    "Environment, Water & Climate Systems",
    "Climate science, weather systems, municipal water treatment, wastewater, soil conservation & ecosystem monitoring.",
    "Environmental field notes & quantitative resource balance verification",
    [
      [
        "Climate, Water & Ecosystems",
        [
          "Climate Science & Adaptation",
          "Water Treatment & Potable Supply",
          "Wastewater & Sanitation Systems",
          "Ecosystems & Biodiversity Monitoring",
        ],
      ],
    ],
  ),
  g(
    "web",
    "Wave 4 · Flagship",
    "Web Design (Complete Sample Course)",
    "Flagship 6-module end-to-end journey: HTML structure, CSS layout, responsive design, typography/colour, JavaScript interactivity & live publication.",
    "Includes complete 6-module roadmap, interactive code practice & verified final website rubric",
    [
      [
        "Flagship Web Design Pathway",
        [
          "HTML Semantic Structure",
          "CSS Flexbox & Grid Layout",
          "Responsive Mobile-First Design",
          "Typography, Colour & WCAG Contrast",
          "JavaScript DOM Interactivity",
          "Publish a Multi-Section Responsive Website",
        ],
      ],
    ],
  ),
  g(
    "geo",
    "Wave 4 · Academic",
    "Geography & Spatial Literacy",
    "World maps, African & Ghana geography, physical landforms, climate regions, oceans, demographics & GIS map reading.",
    "Map scale, coordinates, spatial analysis & regional case studies",
    [
      [
        "Physical, Regional & GIS Geography",
        [
          "World Maps & Coordinate Systems",
          "African & Ghana Regional Geography",
          "Physical Geography & Landforms",
          "Climate Regions & Oceans",
          "Population, Cities & Borders",
          "Geographic Information Systems (GIS) Mapping",
        ],
      ],
    ],
  ),
  g(
    "bible",
    "Wave 4 · Academic",
    "Bible Study & Textual Context",
    "Hermeneutics, reading a passage in historical and literary context, Genesis, Psalms, Proverbs, Gospels, Acts & Epistles.",
    "Context-grounded scripture study with chapter-and-verse citation checks",
    [
      [
        "Contextual Reading & Biblical Books",
        [
          "How to Read a Passage in Context",
          "Genesis & Torah Foundations",
          "Psalms & Wisdom Literature (Proverbs)",
          "The Gospels (Matthew, Mark, Luke, John)",
          "Acts of the Apostles",
          "Pauline Epistles (Romans & Ephesians)",
        ],
      ],
    ],
  ),
  g(
    "lang",
    "Wave 4 · Academic",
    "Languages & Professional Communication",
    "Technical English for charts and presentations, plus everyday French, Spanish, German, Arabic & Twi.",
    "Practical speaking, reading & technical writing fluency",
    [
      [
        "Professional English & World Languages",
        [
          "English for Charts, Reports & Presentations",
          "Everyday French",
          "Everyday Spanish",
          "Everyday German",
          "Everyday Arabic",
          "Everyday Twi",
        ],
      ],
    ],
  ),
  g(
    "history",
    "Wave 4 · Academic",
    "History & Primary Source Analysis",
    "Primary vs. secondary source evaluation, African & Ghana history, world history & historical evidence.",
    "Source-verified historical inquiry",
    [
      [
        "Historical Inquiry & Regional History",
        [
          "How to Read a Primary Historical Source",
          "African & Ghana History",
          "World History & Civilisations",
        ],
      ],
    ],
  ),
  g(
    "arts",
    "Wave 4 · Academic",
    "Arts, Literature & Critical Writing",
    "Clear argumentative writing, close reading, visual art analysis, music listening & literary analysis.",
    "Structured writing & critical analysis",
    [
      [
        "Critical Writing, Literature & Visual Arts",
        [
          "Clear Argumentative Writing",
          "Close Reading of Poetry & Short Fiction",
          "Visual Art & Music Appreciation",
        ],
      ],
    ],
  ),
];

export function getGroupCourseCount(group: CourseGroup): number {
  return group.tracks.reduce((sum, t) => sum + t.courses.length, 0);
}

export function getTotalCatalogCourseCount(): number {
  return COURSE_GROUPS.reduce((sum, group) => sum + getGroupCourseCount(group), 0);
}

/**
 * Section 19: Additional information every course record displays
 */
export type CourseRecordDetails = {
  title: string;
  category: string;
  providerOrOccupation: string;
  waveLabel: string;
  certificationProvider: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Beginner → Advanced";
  prerequisites: string;
  estimatedHours: string;
  formatsIncluded: string;
  assessmentMethod: string;
  finalDemonstration: string;
  officialExamOrLicensingRequirements: string;
  coursePrice: string;
  officialRegistrationUrl: string;
  validityAndRenewal: string;
  lastVerifiedDate: string;
};

export function getCourseRecordDetails(
  groupId: string,
  trackName: string,
  courseName: string,
): CourseRecordDetails {
  const group = COURSE_GROUPS.find((item) => item.id === groupId) ?? COURSE_GROUPS[0]!;
  const wave = RELEASE_WAVES.find((w) => w.id === group.waveId) ?? RELEASE_WAVES[0]!;
  const lower = `${groupId} ${group.name} ${trackName} ${courseName}`.toLowerCase();

  let certificationProvider = "Vibe / Noctis Verified Course Record (Self-directed skill pathway)";
  let officialRegistrationUrl = "";
  let officialExamOrLicensingRequirements =
    "Vibe provides training, practical exercises, and a Vibe learning completion certificate. Official industry certifications or state/local trade licences must be obtained from the relevant certifying body or licensing authority.";
  let validityAndRenewal = "Vibe learning record does not expire; verify external vendor renewal rules where applicable.";
  let prerequisites = "No specialist prerequisites required for foundational modules.";
  let estimatedHours = "18–30 hrs (video lessons, slide decks, notes & practical lab)";
  let level: CourseRecordDetails["level"] = "Beginner → Advanced";

  if (lower.includes("aws") && !lower.includes("welding") && !lower.includes("weld") && groupId !== "make") {
    certificationProvider = "Amazon Web Services (AWS Training & Certification)";
    officialRegistrationUrl = "https://aws.amazon.com/certification/";
    officialExamOrLicensingRequirements =
      "Official AWS certification requires passing a proctored exam via AWS Training & Certification. Vibe provides structured exam preparation and architecture labs.";
    validityAndRenewal = "AWS certifications are valid for 3 years; renewal requires recertification or qualifying AWS steps.";
    estimatedHours = "30–45 hrs guided study + architecture labs";
    level =
      lower.includes("professional") || lower.includes("specialty")
        ? "Advanced"
        : lower.includes("practitioner")
          ? "Beginner"
          : "Intermediate";
  } else if (
    lower.includes("azure") ||
    lower.includes("microsoft") ||
    lower.includes("az-") ||
    lower.includes("sc-") ||
    lower.includes("dp-") ||
    lower.includes("pl-") ||
    lower.includes("ai-900")
  ) {
    certificationProvider = "Microsoft Learn Credentials";
    officialRegistrationUrl = "https://learn.microsoft.com/credentials/";
    officialExamOrLicensingRequirements =
      "Official Microsoft role-based and fundamentals credentials are issued by Microsoft after passing the official exam.";
    validityAndRenewal =
      "Fundamentals certifications do not expire; Associate/Expert role-based credentials require annual free online renewal on Microsoft Learn.";
    estimatedHours = "24–40 hrs guided study + practice assessments";
    level = lower.includes("900") || lower.includes("fundamentals") ? "Beginner" : lower.includes("305") ? "Advanced" : "Intermediate";
  } else if (lower.includes("splunk")) {
    certificationProvider = "Splunk Education & Certification";
    officialRegistrationUrl = "https://www.splunk.com/en_us/training.html";
    officialExamOrLicensingRequirements =
      "Official Splunk certification names and exam availability must be verified against the current Splunk Certification programme (some older credentials are designated legacy).";
    validityAndRenewal = "Splunk certifications typically valid for 3 years; check current Splunk recertification policy.";
    estimatedHours = "25–35 hrs SPL & SIEM lab practice";
    level = lower.includes("architect") || lower.includes("engineer") || lower.includes("security") ? "Advanced" : "Intermediate";
  } else if (
    lower.includes("comptia") ||
    lower.includes("security+") ||
    lower.includes("network+") ||
    lower.includes("cysa+") ||
    lower.includes("pentest+") ||
    lower.includes("casp+") ||
    lower.includes("a+")
  ) {
    certificationProvider = "CompTIA";
    officialRegistrationUrl = "https://www.comptia.org/certifications";
    officialExamOrLicensingRequirements =
      "Official CompTIA certification requires passing the Pearson VUE proctored exam mapped to current CompTIA exam objectives.";
    validityAndRenewal = "Valid for 3 years; renewed via CompTIA Continuing Education Units (CEUs) or CertMaster CE.";
    estimatedHours = "35–50 hrs objective-by-objective study + labs";
    level = lower.includes("casp") || lower.includes("securityx") ? "Advanced" : lower.includes("a+") ? "Beginner" : "Intermediate";
  } else if (lower.includes("isc2") || lower.includes("cissp") || lower.includes("ccsp") || lower.includes("sscp") || lower.includes("cgrc")) {
    certificationProvider = "ISC2";
    officialRegistrationUrl = "https://www.isc2.org/certifications";
    prerequisites = "CISSP and CCSP require 5 years of cumulative paid work experience in 2+ domains (or Associate of ISC2 pathway).";
    officialExamOrLicensingRequirements =
      "Official ISC2 certification requires passing the ISC2 Pearson VUE exam, endorsement, and adherence to the ISC2 Code of Ethics.";
    validityAndRenewal = "3-year certification cycle requiring Annual Maintenance Fees (AMF) and CPE credits.";
    estimatedHours = "40–65 hrs domain study & scenario review";
    level = lower.includes("certified in cybersecurity") ? "Beginner" : "Advanced";
  } else if (lower.includes("isaca") || lower.includes("cisa") || lower.includes("cism") || lower.includes("crisc") || lower.includes("cdpse")) {
    certificationProvider = "ISACA";
    officialRegistrationUrl = "https://www.isaca.org/credentialing";
    prerequisites = "Official ISACA certification requires passing the exam plus verified professional work experience in audit, security, risk, or privacy.";
    officialExamOrLicensingRequirements =
      "Issued by ISACA upon passing the proctored exam and submitting verified domain experience.";
    validityAndRenewal = "Requires 20 CPE hours annually and 120 CPE hours over a 3-year period.";
    estimatedHours = "35–55 hrs governance, risk & audit case practice";
    level = "Advanced";
  } else if (lower.includes("offsec") || lower.includes("oscp") || lower.includes("oswa") || lower.includes("osep") || lower.includes("oswe")) {
    certificationProvider = "OffSec (Offensive Security)";
    officialRegistrationUrl = "https://www.offsec.com/courses-and-certifications/";
    prerequisites = "Solid networking, Linux, and scripting foundations; all labs must be run strictly inside authorised sandboxed environments.";
    officialExamOrLicensingRequirements =
      "Official OffSec certification requires passing a 24-to-48-hour hands-on proctored practical exploitation & report exam.";
    validityAndRenewal = "OffSec certifications do not expire.";
    estimatedHours = "60–90 hrs hands-on lab range & report writing";
    level = "Advanced";
  } else if (lower.includes("giac") || lower.includes("gsec") || lower.includes("gcih") || lower.includes("gcia") || lower.includes("gpen") || lower.includes("gcfa")) {
    certificationProvider = "GIAC / SANS";
    officialRegistrationUrl = "https://www.giac.org/certifications/";
    officialExamOrLicensingRequirements =
      "Official GIAC certification requires passing the proctored GIAC exam (including CyberLive hands-on items).";
    validityAndRenewal = "Valid for 4 years; renewed via 36 CPE credits.";
    estimatedHours = "40–60 hrs incident handling & forensic labs";
    level = "Advanced";
  } else if (lower.includes("ec-council") || lower.includes("ceh") || lower.includes("chfi") || lower.includes("cnd") || lower.includes("ethical hacker")) {
    certificationProvider = "EC-Council";
    officialRegistrationUrl = "https://www.eccouncil.org/programs/";
    prerequisites = "All offensive security techniques must be practised strictly in authorised lab environments.";
    officialExamOrLicensingRequirements =
      "Official EC-Council credential requires passing the EC-Council knowledge/practical exam and meeting eligibility requirements.";
    validityAndRenewal = "3-year ECE (EC-Council Continuing Education) cycle.";
    estimatedHours = "40–55 hrs defensive & authorised lab exercises";
    level = "Intermediate";
  } else if (lower.includes("cisco") || lower.includes("ccna") || lower.includes("ccnp") || lower.includes("ccst") || lower.includes("ccie") || lower.includes("cyberops")) {
    certificationProvider = "Cisco Learning & Certifications";
    officialRegistrationUrl = "https://www.cisco.com/site/us/en/learn/training-certifications/index.html";
    officialExamOrLicensingRequirements =
      "Official Cisco certification requires passing the Pearson VUE Cisco exam(s).";
    validityAndRenewal = "Valid for 3 years; renewed via Cisco Continuing Education credits or recertification exam.";
    estimatedHours = "35–55 hrs packet-tracer & routing/switching labs";
    level = lower.includes("ccst") ? "Beginner" : lower.includes("ccnp") || lower.includes("ccie") ? "Advanced" : "Intermediate";
  } else if (
    lower.includes("welding") ||
    lower.includes("weld") ||
    lower.includes("mig") ||
    lower.includes("tig") ||
    lower.includes("smaw") ||
    lower.includes("fcaw")
  ) {
    certificationProvider = "American Welding Society (AWS — Welding, distinct from Amazon Web Services) / ASME";
    officialRegistrationUrl = "https://www.aws.org/certification/";
    prerequisites = "Workshop PPE, arc/fume safety, and supervised booth access required before physical welding.";
    officialExamOrLicensingRequirements =
      "Official welder performance qualification (e.g., AWS Certified Welder) requires an inspected physical weld test at an accredited test facility.";
    validityAndRenewal = "Welder continuity logs required every 6 months under AWS codes; CWI renews every 3 years.";
    estimatedHours = "40–60 hrs theory + supervised shop practice";
    level = lower.includes("inspection") || lower.includes("pipe") ? "Advanced" : "Beginner → Advanced";
  } else if (groupId === "build" || groupId === "mep") {
    certificationProvider = "NCCER / OSHA / State & Local Licensing Board (ICC / NASCLA / EPA Section 608)";
    officialRegistrationUrl = "https://www.nccer.org/programs-crafts/";
    prerequisites = "OSHA jobsite safety awareness and tool isolation prerequisites before physical fieldwork.";
    officialExamOrLicensingRequirements =
      lower.includes("refriger") || lower.includes("hvac") || lower.includes("608")
        ? "In the United States, handling refrigerants requires U.S. EPA Section 608 certification (NATE / HVAC Excellence / RSES for technician credentials). Electrical, plumbing, and contractor licences are issued by the relevant state or municipality. OSHA safety training is not itself a professional trade licence."
        : "OSHA 10/30 is safety training, not a professional trade licence. Craft training follows NCCER/apprenticeship standards; electrical, plumbing, and general contractor licences are issued by state or local licensing authorities.";
    validityAndRenewal = "State trade licences require periodic code-cycle continuing education (e.g., NFPA NEC updates).";
    estimatedHours = "30–50 hrs trade theory, drawings, and practical verification";
    level = lower.includes("fundamentals") || lower.includes("measuring") || lower.includes("hand tools") ? "Beginner" : "Beginner → Advanced";
  } else if (groupId === "auto") {
    certificationProvider = "National Institute for Automotive Service Excellence (ASE)";
    officialRegistrationUrl = "https://www.ase.com/";
    prerequisites =
      lower.includes("ev") || lower.includes("hybrid") || lower.includes("electric vehicle")
        ? "High-voltage EV battery isolation, insulated PPE, lifting equipment safety, and supervised practical training required."
        : "Shop lifting safety, jack-stand verification, fuel/exhaust safety, and rotating-machinery precautions required.";
    officialExamOrLicensingRequirements =
      "Official ASE certification requires passing the current ASE test category (A1–A8, etc.) plus verified hands-on work experience (typically 2 years or trade school + 1 year).";
    validityAndRenewal = "ASE certifications are valid for 5 years; recertification available via the official ASE app or test center.";
    estimatedHours = "30–45 hrs diagnostics, schematics & repair order practice";
    level = lower.includes("fundamentals") ? "Beginner" : "Intermediate";
  } else if (groupId === "make") {
    certificationProvider = "SME / NIMS / ASME / SolidWorks & Autodesk Certifications";
    officialRegistrationUrl = "https://www.sme.org/training/certifications/";
    prerequisites = "Machine guarding, lockout/tagout (LOTO), eye/hearing protection, and shop supervision required for physical machining.";
    officialExamOrLicensingRequirements =
      "Vibe provides CAD, CNC, PLC, and quality control training; official NIMS, SME, ASME, or SolidWorks (CSWA/CSWP) credentials are issued by their respective bodies.";
    validityAndRenewal = "SME certifications renew every 3 years via recertification credits.";
    estimatedHours = "30–45 hrs CAD/CAM, metrology & process labs";
  } else if (groupId === "business") {
    certificationProvider = "PMI / Scrum.org / IIBA / SHRM / CFA Institute / CFP Board";
    officialRegistrationUrl = "https://www.pmi.org/certifications";
    prerequisites =
      "Official credentials such as PMP, CFA, CFP, SHRM, and CBAP have specific education, documented experience hours, ethics, or membership eligibility rules.";
    officialExamOrLicensingRequirements =
      "Vibe explains eligibility and prepares learners for the syllabus; the official credential is granted only by the issuing institute upon passing their exam and audit.";
    validityAndRenewal = "Requires Continuing Professional Education (PDUs / PDCs / CE credits) on a 2–3 year cycle.";
    estimatedHours = "25–45 hrs case studies, calculations & portfolio work";
    level = lower.includes("pmp") || lower.includes("cbap") || lower.includes("cfa") || lower.includes("black belt") ? "Advanced" : "Beginner → Advanced";
  } else if (groupId === "health") {
    certificationProvider = "Educational Preparation (Regulated Clinical Authorities / American Red Cross / AHA)";
    officialRegistrationUrl = "https://www.redcross.org/take-a-class";
    prerequisites = "Separated strictly into educational preparation vs. regulated clinical qualifications.";
    officialExamOrLicensingRequirements =
      "IMPORTANT: A Vibe course alone does NOT authorise anyone to practise a regulated healthcare occupation or treat patients. Clinical licences/cards (CNA, EMT, Phlebotomy, Pharmacy Tech, CPR/AED) require accredited in-person clinical hours and state board examination.";
    validityAndRenewal = "CPR/AED cards typically renew every 2 years; state clinical licences follow state board renewal rules.";
    estimatedHours = "20–35 hrs terminology, anatomy & case review";
  } else if (groupId === "move") {
    certificationProvider = "FMCSA / State DMV (CDL) / FAA Part 107 (Remote Pilot)";
    officialRegistrationUrl =
      lower.includes("drone") || lower.includes("pilot") || lower.includes("aviation")
        ? "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot"
        : "https://www.fmcsa.dot.gov/registration/commercial-drivers-license";
    prerequisites = "Distinguishes theory preparation from medical certificates (DOT physical), endorsements, and behind-the-wheel practical exams.";
    officialExamOrLicensingRequirements =
      "Commercial driving licences (CDL) and FAA Remote Pilot certificates are issued only by state motor vehicle agencies or the FAA after official knowledge, medical, and practical road/flight tests.";
    validityAndRenewal = "FAA Part 107 requires recurrent training every 24 calendar months; CDL follows state & DOT medical renewal cycles.";
    estimatedHours = "20–30 hrs inspection, regulations & route planning";
  } else if (groupId === "hosp") {
    certificationProvider = "ServSafe / National Restaurant Association / State Cosmetology & Barbering Boards";
    officialRegistrationUrl = "https://www.servsafe.com/";
    prerequisites = "Food hygiene and salon sanitation rules apply to all practical exercises.";
    officialExamOrLicensingRequirements =
      "Official food-handler/manager cards and cosmetology, barbering, esthetics, or massage therapy licences require accredited practical hours and state licensing exams where regulated.";
    validityAndRenewal = "Food Protection Manager certifications typically valid for 5 years; state personal-service licences renew every 1–2 years.";
    estimatedHours = "20–35 hrs culinary/hospitality or salon theory";
  } else if (groupId === "design") {
    certificationProvider = "Portfolio Assessment + Adobe Certified Professional / Autodesk Certification";
    officialRegistrationUrl = "https://certifiedprofessional.adobe.com/";
    officialExamOrLicensingRequirements =
      "Vibe evaluates your practical design portfolio; official Adobe Certified Professional or Autodesk credentials require passing Certiport proctored exams.";
    validityAndRenewal = "Adobe Certified Professional credentials are valid for 3 years.";
    estimatedHours = "24–40 hrs studio briefs & critique";
  } else if (groupId === "law") {
    certificationProvider = "Educational Preparation (ACFE CFE / IAPP CIPP / Emergency Management)";
    officialRegistrationUrl = "https://www.acfe.com/";
    prerequisites = "Distinguishes legal/public-safety education from licensed legal practice or sworn public-service eligibility.";
    officialExamOrLicensingRequirements =
      "Vibe provides compliance, research, and fraud-examination study. It does not grant bar admission, peace-officer commission, or state security guard licensure.";
    validityAndRenewal = "CFE and CIPP credentials require annual CPE credits with ACFE or IAPP.";
    estimatedHours = "20–30 hrs case analysis & compliance documentation";
  } else if (groupId === "dev") {
    certificationProvider = "GitHub / Cloud Native Computing Foundation (CNCF) / HashiCorp / Vibe Portfolio";
    officialRegistrationUrl = "https://training.linuxfoundation.org/certification-catalog/";
    officialExamOrLicensingRequirements =
      "Vibe verifies working code and architecture projects; official CKA/CKAD, Terraform Associate, or GitHub certifications require passing the vendor’s proctored exam.";
    validityAndRenewal = "CNCF and HashiCorp certifications typically valid for 2–3 years.";
    estimatedHours = "30–50 hrs coding, testing & deployment labs";
  } else if (groupId === "data") {
    certificationProvider = "Databricks / Snowflake / Microsoft / AWS / Google Cloud / Tableau";
    officialRegistrationUrl = "https://www.databricks.com/learn/certification";
    officialExamOrLicensingRequirements =
      "Vibe verifies notebooks, SQL/ETL pipelines, and model evaluations; official vendor data/AI credentials require passing the issuing vendor’s exam.";
    validityAndRenewal = "Databricks and Snowflake certifications are valid for 2 years.";
    estimatedHours = "30–45 hrs notebooks, pipelines & evaluation labs";
  }

  return {
    title: courseName,
    category: group.name,
    providerOrOccupation: trackName,
    waveLabel: wave.label,
    certificationProvider,
    level,
    prerequisites,
    estimatedHours,
    formatsIncluded: "Short video lesson, structured slide deck, plain-language notes, concept diagram, worked example & hands-on practice lab",
    assessmentMethod: "Module mastery checks (80% threshold) + practical rubric evaluation (Exposure → Practice → Proficiency → Mastery)",
    finalDemonstration: `Complete and verify a practical ${courseName} project or diagnostic brief in your portfolio`,
    officialExamOrLicensingRequirements,
    coursePrice: "Free on Vibe · Official exam or licensing fee set by issuing authority",
    officialRegistrationUrl,
    validityAndRenewal,
    lastVerifiedDate: "2026-10-22",
  };
}

export function searchCourses(query: string, limit = 8): CourseHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: CourseHit[] = [];
  for (const group of COURSE_GROUPS) {
    for (const track of group.tracks) {
      for (const course of track.courses) {
        if (`${group.name} ${track.name} ${course}`.toLowerCase().includes(q)) {
          hits.push({ groupId: group.id, group: group.name, track: track.name, course });
          if (hits.length >= limit) return hits;
        }
      }
    }
  }
  return hits;
}
