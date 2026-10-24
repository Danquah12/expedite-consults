export type CertPath = {
  id: string;
  title: string;
  board: string;
  href: string;
  outlineHref: string;
  blurb: string;
  facts: { label: string; value: string }[];
  steps: { title: string; line: string }[];
};

export const CERT_PATHS: CertPath[] = [
  {
    id: "cissp",
    title: "CISSP exam details",
    board: "(ISC)²",
    href: "https://www.isc2.org/certifications/cissp",
    outlineHref: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
    blurb: "Official outline lives at ISC2. We map the eight domains. We do not copy items or dumps.",
    facts: [
      { label: "Outline", value: "April 15, 2024 (as published by ISC2)" },
      { label: "Delivery", value: "CAT · 100–150 items · 3 hours" },
      { label: "Pass", value: "700 / 1000" },
      { label: "Experience", value: "5 years paid, in 2+ domains (degree or approved credential may waive 1 year)" },
    ],
    steps: [
      { title: "Security and Risk Management", line: "16% · ethics, governance, compliance, BIA." },
      { title: "Asset Security", line: "10% · classification, lifecycle, retention." },
      { title: "Security Architecture and Engineering", line: "13% · models, crypto, resilience." },
      { title: "Communication and Network Security", line: "13% · segmentation, transit, Zero Trust." },
      { title: "Identity and Access Management", line: "13% · MFA, authz, PAM." },
      { title: "Security Assessment and Testing", line: "12% · audits, metrics, pentest." },
      { title: "Security Operations", line: "13% · detect, respond, recover." },
      { title: "Software Development Security", line: "10% · SSDLC, supply chain." },
    ],
  },
  {
    id: "nccer",
    title: "NCCER certification paths",
    board: "NCCER",
    href: "https://www.nccer.org/programs-crafts/",
    outlineHref: "https://www.nccer.org/programs-crafts/",
    blurb: "Over 40 crafts. Each path is modules + knowledge test + performance test. Stackable credentials. We send you to NCCER — we do not host the exams.",
    facts: [
      { label: "Model", value: "Competency modules → knowledge + performance test" },
      { label: "Registry", value: "Credentials sit in the NCCER Registry" },
      { label: "Electrical", value: "Levels 1–4 · 12th edition aligns to 2026 NEC" },
    ],
    steps: [
      { title: "Electrical", line: "Level 1 theory and boxes → Level 2 lighting/motors → Levels 3–4. 2026 NEC." },
      { title: "Carpentry", line: "Levels 1–4. Form carpentry available separately." },
      { title: "HVAC", line: "Levels 1–4. Knowledge + performance per level." },
      { title: "Plumbing", line: "Stackable modules. Open the craft catalog for the current edition." },
      { title: "Welding", line: "Process and performance tests. Official NCCER." },
      { title: "Heavy equipment", line: "Operations levels. Assessment + training prescription." },
      { title: "Construction technology", line: "Core, then a craft. Apprenticeship-ready." },
      { title: "NCACP assessments", line: "National Craft Assessment and Certification Program — workforce competence, not a dump." },
    ],
  },
  {
    id: "cisa",
    title: "ISACA CISA requirements",
    board: "ISACA",
    href: "https://www.isaca.org/credentialing/cisa",
    outlineHref: "https://www.isaca.org/credentialing/cisa/cisa-exam-content-outline",
    blurb: "CISA here is ISACA’s Certified Information Systems Auditor — not CISA.gov (the U.S. cyber agency). We map the official requirements. We do not copy exam items.",
    facts: [
      { label: "Exam", value: "150 questions · 5 job-practice domains · PSI center or remote proctor" },
      { label: "Window", value: "6 months from registration to sit" },
      { label: "Experience", value: "5 years IS audit, control, or security (within 10 years of applying)" },
      { label: "Waivers", value: "Education and other certs may substitute some years — never all. Official substitutions live at ISACA." },
      { label: "After pass", value: "Apply within 5 years · US$50 application · ethics · CPE 20/year, 120/3 years" },
    ],
    steps: [
      { title: "Sit the exam (you may sit before the years)", line: "Anyone may take it. Certification waits on experience." },
      { title: "Domain 1 — IS auditing process (18%)", line: "Standards, ethics, risk-based planning, testing, sampling." },
      { title: "Domain 2 — Governance and management of IT", line: "IT strategy, risk, resources." },
      { title: "Domain 3 — Acquisition, development, implementation", line: "Build and change, controlled." },
      { title: "Domain 4 — Operations and business resilience", line: "Run, recover, evidence." },
      { title: "Domain 5 — Protection of information assets", line: "Identity, data, incident, forensics." },
      { title: "Apply + CPE", line: "Pass → fee → experience evidence → ethics → 20 CPE a year." },
    ],
  },
];

export function certPathById(id: string) {
  return CERT_PATHS.find((p) => p.id === id);
}
