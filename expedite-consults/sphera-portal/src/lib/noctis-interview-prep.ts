import { ALL_PROFESSIONS, PROFESSION_ENCLAVES } from "./connectin-professions"
import { getJobFlywheelRecommendation } from "./global-jobs-data"

export interface NoctisInterviewQuestion {
  id: string
  number: number
  round: 'technical_clinical' | 'scenario_troubleshooting' | 'compliance_safety' | 'behavioral_star' | 'employer_strategy'
  roundLabel: string
  difficulty: 'Core' | 'Advanced' | 'Panel Deep-Dive'
  question: string
  interviewerIntent: string
  keyTalkingPoints: string[]
  sampleAnswer: string
}

export interface NoctisJobPrepPack {
  jobTitle: string
  company: string
  location: string
  salaryRange: string
  enclaveName: string
  enclaveIcon: string
  matchScore: number
  primarySkills: string
  secondarySkills: string
  badgeText: string
  executiveBriefing: string
  questions: NoctisInterviewQuestion[]
}

function detectJobDomain(job: any): {
  domainKey:
    | 'nursing_lpn_rn'
    | 'physician_surgeon'
    | 'pharmacy'
    | 'dental_herbal_allied'
    | 'trades_construction'
    | 'electrical_solar_telecom'
    | 'automotive_fleet'
    | 'law_judiciary'
    | 'finance_accounting'
    | 'veterans_franchise'
    | 'cyber_cloud_software'
    | 'general_professional'
  roleLabel: string
  coreTools: string[]
  standards: string[]
} {
  const title = String(job?.title || '').toLowerCase()
  const desc = String(job?.description || '').toLowerCase()
  const enclave = String(job?.professionEnclave || '').toLowerCase()
  const tags = Array.isArray(job?.tags) ? job.tags.join(' ').toLowerCase() : ''
  const combined = `${title} ${desc} ${enclave} ${tags}`

  if (
    /\b(lpn|lvn|licensed practical nurse|registered nurse|\brn\b|ccrn|nurse practitioner|aprn|nursing|pct|patient care tech|cna|med-surg|ltc|skilled nursing|charge nurse|triage)\b/.test(
      combined
    )
  ) {
    const isLPN = /\b(lpn|lvn|licensed practical nurse)\b/.test(combined)
    return {
      domainKey: 'nursing_lpn_rn',
      roleLabel: isLPN ? 'Licensed Practical Nurse (LPN)' : 'Clinical Nursing Specialist (RN / LPN)',
      coreTools: [
        'PointClickCare / Epic MAR & Barcode Medication Administration (BCMA)',
        'SBAR Clinical Handoff & Head-to-Toe Assessment',
        'Wound Care, IV/G-Tube Management & Telemetry Monitoring',
        'Delegation to CNAs / PCTs & Fall/Pressure Injury Prevention'
      ],
      standards: [
        'State Nurse Practice Act & Scope of Practice',
        'Five Rights of Medication Administration & High-Alert Med Safety',
        'HIPAA Privacy, Infection Control (CDC/OSHA) & Joint Commission Standards'
      ]
    }
  }

  if (/\b(physician|doctor|\bmd\b|\bdo\b|surgeon|hospitalist|cardiolog|orthoped|attending|residency|clinical trial)\b/.test(combined)) {
    return {
      domainKey: 'physician_surgeon',
      roleLabel: 'Attending Physician / Surgeon (MD/DO)',
      coreTools: [
        'Epic EHR / Cerner CPOE & Diagnostic Workups',
        'Differential Diagnosis, Hemodynamic Stabilization & Procedural Safety',
        'Multidisciplinary Rounds, Informed Consent & Peer Case Review'
      ],
      standards: [
        'ACGME / Specialty Board Guidelines & Evidence-Based Medicine',
        'WHO Surgical / Procedural Time-Out & Patient Safety Protocols',
        'HIPAA, CMS Quality Measures & Morbidity/Mortality Root-Cause Review'
      ]
    }
  }

  if (/\b(pharmac|pharmd|cpht|compounding|formulary|dispens)\b/.test(combined)) {
    return {
      domainKey: 'pharmacy',
      roleLabel: 'Pharmacist / Pharmacy Specialist (PharmD / CPhT)',
      coreTools: [
        'Drug Utilization Review (DUR) & Renal/Hepatic Dosing Adjustment',
        'USP <797>/<800> Sterile Compounding & Automated Dispensing Cabinets (Pyxis/Omnicell)',
        'Anticoagulation, Antimicrobial Stewardship & Patient Counseling'
      ],
      standards: [
        'DEA Controlled Substance Inventory & State Board of Pharmacy Law',
        'ISMP High-Alert Medication Safeguards & Tall-Man Lettering',
        'REMS Compliance, Immunization Protocols & Medication Reconciliation'
      ]
    }
  }

  if (
    enclave === 'healthcare_medicine' ||
    /\b(dentist|dds|dmd|hygienist|herbal|botanical|phytotherapy|radiology|respiratory|lab tech|phlebotom|paramedic|emt|medical assistant|ccma|hospital admin)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'dental_herbal_allied',
      roleLabel: job?.title || 'Healthcare & Clinical Specialist',
      coreTools: [
        'Electronic Health Records (Epic / Dentrix / Clinical Charting)',
        'Patient Intake, Diagnostic Assessment & Care Plan Execution',
        'Sterilization, Specimen/Imaging Quality Control & Patient Education'
      ],
      standards: [
        'HIPAA Privacy & Security Rule Compliance',
        'OSHA Bloodborne Pathogens & CDC Sterilization / Infection Control',
        'Clinical Documentation Integrity & Informed Consent'
      ]
    }
  }

  if (
    enclave === 'energy_utilities_environment' ||
    enclave === 'telecom_digital_infrastructure' ||
    /\b(electrician|solar|photovoltaic|nabcep|inverter|substation|directv|satellite|fiber|coax|av tech|nec|high voltage|microgrid)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'electrical_solar_telecom',
      roleLabel: job?.title || 'Electrical, Solar PV & Telecom Field Specialist',
      coreTools: [
        'Fluke True-RMS Multimeter, Insulation Tester (Megger) & Clamp Meter',
        'Spectrum Analyzer / OTDR Fiber Splicer / Solar IV-Curve Tracer',
        'Conduit Bending, Load Calculation, Inverter/Dish Commissioning & Blueprint Takeoff'
      ],
      standards: [
        'NFPA 70 (National Electrical Code / NEC 2026) & Articles 690/705/250',
        'NFPA 70E Arc Flash PPE, Lockout/Tagout (LOTO) & Zero-Energy Verification',
        'OSHA 1926 Fall Protection, Ladder/Roof Safety & Grounding/Bonding'
      ]
    }
  }

  if (
    enclave === 'trades_construction' ||
    enclave === 'manufacturing_industrial' ||
    /\b(carpenter|timber|general contractor|superintendent|welder|plumb|hvac|masonry|cnc|machinist|plc|robotics|estimating|bim)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'trades_construction',
      roleLabel: job?.title || 'Skilled Trades, Construction & Field Engineering Lead',
      coreTools: [
        'Procore / Bluebeam Revu Blueprints, Laser Total Station & Layout Tools',
        'Structural Framing, MEP Coordination, Welding/Fabrication & Tolerances',
        'Critical Path Method (CPM) Scheduling, RFIs, Submittals & Subcontractor QA/QC'
      ],
      standards: [
        'OSHA 30-Hour 29 CFR 1926 Construction Safety & Fall Protection',
        'IBC / IRC Building Codes, AWS D1.1 / ASME Specs & Municipal Inspections',
        'Job Hazard Analysis (JHA), Crane/Rigging Safety & Punch-List Closeout'
      ]
    }
  }

  if (
    enclave === 'automotive_mechanics' ||
    enclave === 'aviation_aerospace_maritime' ||
    /\b(automotive|mechanic|ase master|diesel|ev powertrain|can-bus|picoscope|aircraft|faa a&p|avionics|fleet|heavy equipment)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'automotive_fleet',
      roleLabel: job?.title || 'Master Diagnostic & Powertrain Technician',
      coreTools: [
        'PicoScope 4-Channel Lab Scope, OEM Scan Tools & J2534 Pass-Thru Programming',
        'CAN-FD Differential Bus Diagnostics, 800V EV Isolation Testing & Fuel/Air Metering',
        'Preventive Maintenance, Hydraulic/Pneumatic Overhaul & Torque-to-Yield Specs'
      ],
      standards: [
        'ASE Master (A1–A8 / L1–L3) / FAA Part 43 Maintenance Standards',
        'NFPA 70E High-Voltage EV Depowering & Class 0 Insulating Glove Protocol',
        'EPA Section 609 Refrigerant, DOT Fleet Inspection & Shop LOTO Safety'
      ]
    }
  }

  if (
    enclave === 'law_gov_defense' ||
    /\b(lawyer|attorney|counsel|judge|magistrate|litigat|paralegal|legal|court|prosecut|defense|bar|juris)\b/.test(combined)
  ) {
    return {
      domainKey: 'law_judiciary',
      roleLabel: job?.title || 'Legal Counsel, Trial Attorney & Judicial Specialist',
      coreTools: [
        'Westlaw / LexisNexis Legal Research, PACER Docket & E-Discovery Platforms',
        'Rule 56 Summary Judgment Motions, Daubert (FRE 702) Challenges & Oral Advocacy',
        'Contract Redlining, Regulatory Compliance, Depositions & Evidentiary Hearings'
      ],
      standards: [
        'Federal Rules of Civil/Criminal Procedure (FRCP) & Federal Rules of Evidence (FRE)',
        'ABA Model Rules of Professional Conduct, Attorney-Client Privilege & Conflicts Check',
        'Bluebook Citation Accuracy, Judicial Canon Ethics & Statutory Interpretation'
      ]
    }
  }

  if (
    enclave === 'finance_accounting' ||
    /\b(cpa|accountant|controller|audit|tax|gaap|ifrs|financial|investment|fp&a|bookkeep|underwrit|valuation)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'finance_accounting',
      roleLabel: job?.title || 'Finance, Accounting & Audit Specialist (CPA / CFA)',
      coreTools: [
        'NetSuite / SAP ERP General Ledger, Three-Statement DCF Modeling & Variance Analysis',
        'ASC 606 Revenue Recognition, ASC 842 Leases & Month-End Close Reconciliation',
        'Internal Controls, Cash Flow Forecasting & Executive Board Reporting'
      ],
      standards: [
        'US GAAP / IFRS Accounting Standards & PCAOB Audit Guidelines',
        'Sarbanes-Oxley (SOX 404) Internal Control Testing & Segregation of Duties',
        'Fiduciary Duty, AML/KYC Compliance & Tax Regulatory Accuracy'
      ]
    }
  }

  if (
    enclave === 'veterans_military' ||
    enclave === 'franchise_networks' ||
    /\b(veteran|skillbridge|sdvosb|military|franchise|multi-unit|fdd|area developer|store manager|operations director)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'veterans_franchise',
      roleLabel: job?.title || 'Operations, Military Transition & Multi-Unit Leadership',
      coreTools: [
        'Multi-Unit P&L Management, Labor/COGS Optimization & KPI Dashboards',
        'Standard Operating Procedures (SOPs), Operational Readiness & Team Training',
        'Supply Chain Vendor Management, Territory Expansion & Customer Retention'
      ],
      standards: [
        'FTC Franchise Rule (FDD Item 19) / DoD SkillBridge & Federal FAR Compliance',
        'OSHA Workplace Safety, Quality Assurance Audits & Brand Standard Compliance',
        'After-Action Reviews (AAR), Disciplined Execution & Servant Leadership'
      ]
    }
  }

  if (
    enclave === 'tech_cybersecurity' ||
    enclave === 'tech_software' ||
    /\b(software|engineer|developer|architect|cloud|cyber|security|zero trust|ai|machine learning|sre|devops|scada|red team|soc|full-stack)\b/.test(
      combined
    )
  ) {
    return {
      domainKey: 'cyber_cloud_software',
      roleLabel: job?.title || 'Cloud, Cybersecurity & Systems Architecture Lead',
      coreTools: [
        'Kubernetes, Terraform IaC, Next.js/TypeScript & Distributed Microservices',
        'Zero Trust IAM (mTLS/OIDC), EDR/SIEM Telemetry & Threat Hunting',
        'CI/CD Automated Pipelines, Observability (OpenTelemetry) & High-Availability SLAs'
      ],
      standards: [
        'NIST SP 800-53 / 800-207 Zero Trust, SOC 2 Type II & ISO 27001',
        'OWASP Top 10, CMMC 2.0 / FedRAMP & Least-Privilege Access Control',
        'Incident Response Playbooks, Chaos Engineering & Post-Mortem Blameless Reviews'
      ]
    }
  }

  return {
    domainKey: 'general_professional',
    roleLabel: job?.title || 'Verified Professional Specialist',
    coreTools: [
      'Domain-Specific Operational Workflows, Diagnostics & Quality Assurance',
      'Project Scheduling, Stakeholder Communication & KPI Performance Tracking',
      'Cross-Functional Collaboration, Documentation & Continuous Improvement'
    ],
    standards: [
      'Industry Licensing, Regulatory Compliance & Workplace Safety Protocols',
      'Quality Control Verification, Data Integrity & Ethical Practice',
      'Standard Operating Procedures (SOPs) & Customer/Client Service Excellence'
    ]
  }
}

/**
 * Generates 25 deeply tailored, job-specific interview questions with Noctis AI coaching,
 * interviewer intent, key talking points, and full STAR/technical sample answers for ANY job on ConnectLn.
 */
export function generateNoctisInterviewPrepForJob(job: any): NoctisJobPrepPack {
  const jobTitle = job?.title || 'Licensed Practical Nurse (LPN) / Verified Specialist'
  const company = job?.company || 'Partner Employer'
  const location = job?.location || 'United States'
  const salaryRange = job?.salaryRange || 'Competitive Compensation'
  const enclaveObj = PROFESSION_ENCLAVES.find((e) => e.id === job?.professionEnclave)
  const flywheel = getJobFlywheelRecommendation(
    job || {
      id: 'default_job',
      title: jobTitle,
      company,
      location,
      description: '',
      tags: []
    }
  )

  const domain = detectJobDomain(job)
  const primarySkill = flywheel.primarySkill || domain.coreTools[0]
  const secondarySkill = flywheel.secondarySkill || domain.coreTools[1]
  const rawRequirements: string[] =
    Array.isArray(job?.requirements) && job.requirements.length > 0
      ? job.requirements
      : [
          `Demonstrated proficiency in ${primarySkill}`,
          `Hands-on experience with ${secondarySkill}`,
          `Commitment to safety, compliance, and team collaboration at ${company}`
        ]

  // Build specialized questions for Round 1 (Questions 1-6) & Round 2 (Questions 7-12)
  let round1Questions: Omit<NoctisInterviewQuestion, 'id' | 'number' | 'round' | 'roundLabel'>[] = []
  let round2Questions: Omit<NoctisInterviewQuestion, 'id' | 'number' | 'round' | 'roundLabel'>[] = []

  if (domain.domainKey === 'nursing_lpn_rn') {
    round1Questions = [
      {
        difficulty: 'Core',
        question: `Walk us through your shift-start routine as a ${jobTitle} at ${company}, from receiving SBAR shift report to prioritizing your medication pass and high-acuity patients.`,
        interviewerIntent: `Evaluates clinical organization, SBAR communication, time management across multi-patient assignments, and immediate identification of unstable patients.`,
        keyTalkingPoints: [
          `Review SBAR handoff notes: code status, recent vitals trends, labs/blood glucose, fall risk, and new provider orders`,
          `Perform rapid eyeball walk-through ("doorway safety sweep") on all assigned residents/patients before starting med pass`,
          `Prioritize time-critical medications (insulin, cardiac/BP meds, scheduled antibiotics, acute pain) within the +/- 30–60 minute window`
        ],
        sampleAnswer: `"At the start of every shift, I take a structured SBAR report focusing on acute changes in condition, abnormal vitals or fingerstick glucoses, skin/wound updates, and pending provider orders. Before pulling my first medication, I do a quick 5-minute safety walk-through of my assigned hall to visually assess breathing, IV/oxygen lines, and fall alarms. I then organize my MAR pass by clinical priority—administering time-critical medications like insulin, anti-parkinsonian agents, and scheduled IV/PO antibiotics first, while delegating vital signs and positioning tasks clearly to my CNAs/PCTs."`
      },
      {
        difficulty: 'Core',
        question: `How do you execute the Five (or Six) Rights of Medication Administration using EHR/EMAR (${primarySkill}) and prevent medication errors during interruptions?`,
        interviewerIntent: `Tests strict adherence to medication safety protocols, barcode scanning compliance, and clinical vigilance.`,
        keyTalkingPoints: [
          `Verify Right Patient (2 identifiers), Right Drug, Right Dose, Right Route, Right Time, and Right Documentation`,
          `Perform 3-point label checks (pulling from cart/Pyxis, preparing/pouring, and at bedside prior to administration)`,
          `Check required parameters (apical HR & BP before beta-blockers/digoxin; blood glucose before insulin; pain score before PRN narcotics)`
        ],
        sampleAnswer: `"I treat the medication pass as a sterile cockpit zone. For every medication, I verify two patient identifiers against the EMAR, perform three visual checks of the medication label and expiration date, and never pre-chart before the patient actually swallows or receives the dose. For medications with clinical hold parameters—such as holding metoprolol for an apical heart rate under 60 or verifying sliding-scale blood glucose before insulin—I take those vitals fresh and document them directly in the MAR."`
      },
      {
        difficulty: 'Advanced',
        question: `Explain your scope of practice as a ${jobTitle} regarding patient assessments, IV therapy/wound care, and collaborating with the RN Supervisor, Nurse Practitioner, or Attending Physician.`,
        interviewerIntent: `Ensures the candidate understands legal scope of practice under the State Nurse Practice Act and escalates findings appropriately.`,
        keyTalkingPoints: [
          `Distinguish focused data collection/monitoring vs. initial comprehensive nursing diagnosis where state law requires RN sign-off`,
          `Highlight hands-on competencies: sterile wound vacuum/dressing changes, G-tube/PEG feedings, Foley catheters, tracheostomy suctioning, and IV maintenance`,
          `Demonstrate proactive escalation to the Charge RN or MD/NP whenever a patient's baseline shifts`
        ],
        sampleAnswer: `"I operate strictly within my state Nurse Practice Act and ${company}'s clinical policies. I perform thorough focused head-to-toe assessments—auscultating lung and bowel sounds, evaluating neurological baseline, staging wounds, and managing G-tubes, catheters, and complex dressings. Whenever I detect a deviation from baseline, I immediately notify the RN Supervisor and contact the Attending Physician or NP with a complete SBAR package so orders can be updated without delay."`
      },
      {
        difficulty: 'Advanced',
        question: `How do you delegating tasks effectively to Certified Nursing Assistants (CNAs) and Patient Care Technicians (PCTs) while maintaining accountability on a busy unit?`,
        interviewerIntent: `Assesses bedside leadership, Five Rights of Delegation, and team morale on skilled nursing or hospital units.`,
        keyTalkingPoints: [
          `Use the Five Rights of Delegation: Right Task, Right Circumstance, Right Person, Right Direction, and Right Supervision`,
          `Give specific parameters (e.g., "Please notify me immediately if Mr. Smith's BP is over 160/90 or O2 sat drops below 92%")`,
          `Follow up mid-shift to verify completion, assist with heavy two-person turns, and recognize CNA teammates`
        ],
        sampleAnswer: `"Effective delegation starts with mutual respect and clear clinical thresholds. At the beginning of the shift, I huddle with my CNAs for 3 minutes to review who is a two-assist transfer, who requires strict I&Os, and who has skin breakdown precautions. Instead of just saying 'get vitals,' I give clear parameters—such as 'let me know right away if room 204's respiratory rate is over 22.' I also jump in to help with heavy boosts and peri-care because a nurse who helps their CNAs builds a team that never misses a warning sign."`
      },
      {
        difficulty: 'Core',
        question: `What is your protocol for wound care assessment, pressure injury staging (Stages 1–4 / Unstageable), and nutritional/repositioning interventions?`,
        interviewerIntent: `Checks hands-on wound care competency, Braden Scale scoring, and quality measure protection in acute and post-acute care.`,
        keyTalkingPoints: [
          `Measure length × width × depth (cm), inspect undermining/tunneling using clock-face method, and describe wound bed (granulation, slough, eschar) and exudate`,
          `Maintain sterile or clean technique per order (hydrocolloid, alginate, negative-pressure wound therapy / Wound VAC)`,
          `Implement Braden Scale interventions: Q2H offloading, heel floatation boots, moisture barrier creams, and dietary protein/albumin consults`
        ],
        sampleAnswer: `"During every dressing change, I assess and document exact wound dimensions—length, width, depth, any tunneling or undermining by clock position—along with tissue type, peri-wound integrity, and drainage amount/odor. I follow strict aseptic technique, date and initial the dressing, and pair topical treatment with root-cause prevention: strict 2-hour turning schedules, pressure-redistribution air mattresses, moisture management, and coordinating with the dietitian for high-protein wound-healing supplements."`
      },
      {
        difficulty: 'Panel Deep-Dive',
        question: `How do you manage complex patients with comorbidities such as brittle diabetes, CHF fluid overload, COPD exacerbations, and post-surgical orthopedic rehab?`,
        interviewerIntent: `Evaluates clinical critical thinking across the most common high-risk diagnoses at ${company}.`,
        keyTalkingPoints: [
          `CHF: monitor daily weights (>2 lbs in 24h or >5 lbs in a week), bilateral pitting edema, JVD, crackles, and diuretic electrolytes (Potassium)`,
          `Diabetes: recognize early hypoglycemia (diaphoresis, tremor, confusion — Rule of 15) vs. DKA/HHS and sliding-scale insulin timing`,
          `COPD/Ortho: titrate oxygen to target SpO2 (88–92% for CO2 retainers), encourage incentive spirometry, and monitor DVT prophylaxis`
        ],
        sampleAnswer: `"For complex multi-system patients, I look for early subtle trends before they become emergencies. In CHF patients, I verify that daily weights are taken on the same scale before breakfast and compare them against dry weight, listening to lung bases for new crackles. For diabetic patients, I time blood glucose checks and insulin closely with meal tray delivery and keep oral glucose / glucagon immediately accessible. For post-op orthopedic patients, I stay ahead of pain prior to physical therapy sessions and perform neurovascular checks (5 Ps) and DVT/anticoagulation monitoring every shift."`
      }
    ]

    round2Questions = [
      {
        difficulty: 'Advanced',
        question: `Scenario: You enter a patient's room at ${company} and find them pale, diaphoretic, confused, with a blood pressure of 84/50 and SpO2 of 86%. Walk us through your exact first 5 minutes.`,
        interviewerIntent: `Tests acute clinical triage, ABCs (Airway, Breathing, Circulation), Rapid Response activation, and SBAR reporting.`,
        keyTalkingPoints: [
          `Stay with the patient and call for help / activate Rapid Response or unit emergency call bell immediately`,
          `Assess ABCs: elevate head of bed (or Trendelenburg/flat if hypotensive without respiratory distress), apply oxygen per protocol, check carotid/radial pulse and fingerstick glucose`,
          `Prepare SBAR + recent MAR/labs for the responding RN Supervisor / Provider and document timestamped interventions`
        ],
        sampleAnswer: `"First, I never leave an unstable patient alone—I pull the emergency call cord to bring help to the bedside immediately. Second, I assess ABCs: I check airway patency, apply supplemental oxygen to bring SpO2 above 92%, obtain a full set of manual vitals, and check a stat fingerstick blood glucose to rule out severe hypoglycemia. While a colleague grabs the crash cart and notifies the Charge RN and provider, I review the last medications administered (checking for narcotics, antihypertensives, or sepsis signs) so I can deliver a crisp 30-second SBAR report the moment the provider arrives."`
      },
      {
        difficulty: 'Core',
        question: `Scenario: A patient or resident is found on the floor next to their bed (unwitnessed fall). What step-by-step protocol do you follow before and after moving them?`,
        interviewerIntent: `Verifies fall-management safety, head-injury / anticoagulation precautions, neurological checks, and post-fall documentation.`,
        keyTalkingPoints: [
          `Assess BEFORE moving: check responsiveness, neck/spine pain, external bleeding, and extremity rotation/shortening (hip fracture signs)`,
          `Check if the patient is on anticoagulants (Eliquis, Xarelto, Warfarin, Heparin) and initiate Q15m -> Q30m -> Q1h neuro checks (72-hour protocol)`,
          `Notify RN Supervisor, Attending Provider, and Family/POA; update care plan and complete incident report without blame`
        ],
        sampleAnswer: `"Before anyone lifts the patient, I kneel at their level and perform a rapid trauma and head-to-toe assessment—checking consciousness, pupil reactivity, neck or back tenderness, and looking for external rotation or shortening of the legs that would indicate a hip fracture. If there is any suspected fracture or spinal injury, we immobilize and call EMS. Once cleared to transfer safely using a mechanical lift, I check their MAR for anticoagulants, initiate our 72-hour neurological check protocol, notify the physician and family, and conduct a root-cause huddle to prevent a repeat fall."`
      },
      {
        difficulty: 'Advanced',
        question: `Scenario: A cognitively intact patient refuses a critical scheduled medication (e.g., antihypertensive or anticoagulant), or a patient with dementia becomes agitated during care. How do you handle both?`,
        interviewerIntent: `Evaluates patient autonomy, therapeutic communication, de-escalation, and clinical documentation.`,
        keyTalkingPoints: [
          `For intact patients: respect their legal right to refuse, explore the 'why' (side effects, swallowing difficulty, cost/confusion), educate in plain language, and notify the provider if refused`,
          `For dementia/sundowning: use non-pharmacological redirection, calm tone, familiar cues, or return in 15–20 minutes rather than forcing care`,
          `Document the refusal, patient education provided, and provider notification in the EHR`
        ],
        sampleAnswer: `"When an alert patient refuses a medication, I never argue—I sit down at eye level and ask what concerns them about the pill. Often they are experiencing dizziness, GI upset, or don't recognize a generic tablet shape. After explaining why the medication protects their heart or prevents stroke, most patients agree to take it; if they still decline, I respect their right to refuse, document the education in the MAR, and notify the provider. For a resident with dementia who is agitated, I step back, lower environmental noise, validate their feelings, and re-approach 15 minutes later with a snack or favourite beverage."`
      },
      {
        difficulty: 'Core',
        question: `Scenario: Three call lights are ringing, a new admission just arrived from the hospital, and a family member is at the desk demanding an update. How do you triage and communicate?`,
        interviewerIntent: `Tests real-world clinical prioritization (Maslow's / ABCs / Acute vs. Chronic) under pressure.`,
        keyTalkingPoints: [
          `Triage by clinical acuity first: breathing/chest pain/high-fall-risk bathroom alarm > new admission safety check > routine status update`,
          `Delegate call lights to CNAs with clear instructions while personally checking the highest-acuity patient`,
          `Acknowledge the family member warmly ("I want to give you my full attention in 10 minutes as soon as I stabilize a new admission") and follow through`
        ],
        sampleAnswer: `"I triage strictly by clinical safety and ABCs. First, I ask my CNA to answer the active call lights and immediately alert me if anyone is in distress or attempting to get out of bed unassisted. Second, I warmly acknowledge the family member at the desk—letting them know I value their questions and will meet with them in 10 minutes right after I settle an incoming patient. Third, I perform a rapid 3-minute safety and vital-signs check on the new admission to ensure they are stable before completing the full chart reconciliation."`
      },
      {
        difficulty: 'Advanced',
        question: `Scenario: You notice a subtle change in an elderly patient—new onset confusion, lethargy, and decreased appetite, even though they have no fever. What do you suspect and what actions do you take?`,
        interviewerIntent: `Assesses geriatric clinical acumen (atypical presentation of UTI/urosepsis, electrolyte imbalance, hypoxia, or polypharmacy).`,
        keyTalkingPoints: [
          `Recognize that older adults frequently present with acute delirium/confusion rather than classic fever during a UTI, pneumonia, sepsis, or dehydration`,
          `Obtain full vitals (including SpO2, orthostatic BP, and blood glucose), assess urine color/odor/output, and review recent medication changes`,
          `Contact the provider via SBAR to request a UA with culture & sensitivity, CBC, and CMP`
        ],
        sampleAnswer: `"In geriatric and post-acute patients, acute mental status change is our earliest red flag for infection or metabolic derangement, even with a normal temperature. I immediately check a full set of vitals including pulse oximetry and blood glucose, inspect their urine output/color/odor, auscultate lungs, and check the MAR for any new sedatives or anticholinergics. I then call the provider using SBAR to report the baseline shift and recommend a urinalysis with reflex culture, CBC, and BMP so we catch a UTI or early sepsis before hospitalization is needed."`
      },
      {
        difficulty: 'Panel Deep-Dive',
        question: `Scenario: During narcotic count at shift change, the controlled substance count is off by 1 tablet of oxycodone. What is your exact procedure?`,
        interviewerIntent: `Tests integrity, DEA controlled substance compliance, and chain-of-custody investigation.`,
        keyTalkingPoints: [
          `Never sign off an inaccurate narcotic count; keep both oncoming and offgoing nurses at the cart/cabinet`,
          `Audit the MAR administration records, waste logs, and physical blister packs/pockets for undocumented doses or math errors`,
          `If unresolved within minutes, escalate immediately to the Nursing Supervisor / Director of Nursing and Pharmacy per DEA policy`
        ],
        sampleAnswer: `"Both nurses stay right at the narcotic cabinet—we never sign a discrepancy sheet until it is investigated. First, we recount the physical cassette together to rule out a simple miscount. Second, we cross-reference every administration timestamp in the EMAR over the past shift against the paper or electronic narcotic log to see if a PRN dose was administered at bedside but not yet logged in the book. If the tablet is still unaccounted for, we immediately notify the House Supervisor and Director of Nursing before either nurse leaves the building."`
      }
    ]
  } else {
    // Dynamic generation for all other professions (Engineering, Trades, Cyber/Cloud, Legal, Finance, Auto, Solar, etc.)
    round1Questions = [
      {
        difficulty: 'Core',
        question: `Walk us through your end-to-end daily operational workflow as a ${jobTitle} at ${company}, and how you use ${primarySkill} to deliver zero-defect results.`,
        interviewerIntent: `Evaluates hands-on mastery of ${primarySkill}, structured execution, and day-one readiness for ${company}.`,
        keyTalkingPoints: [
          `Describe pre-shift / pre-project planning, blueprint or specification review, and tool/system calibration`,
          `Detail how you apply ${primarySkill} and ${secondarySkill} in live production environments`,
          `Explain your quality verification checklist before signing off on any deliverable`
        ],
        sampleAnswer: `"In my role as a ${jobTitle}, I start every engagement by reviewing the technical specifications, safety parameters, and critical-path milestones. Using ${primarySkill} alongside ${secondarySkill}, I validate baseline conditions before executing changes, document every measurement or configuration state, and run a 3-point quality verification check prior to handoff. That disciplined workflow has allowed me to maintain a 99.4% first-time pass rate across high-stakes projects."`
      },
      {
        difficulty: 'Core',
        question: `Looking at ${company}'s core requirements (${rawRequirements[0] || primarySkill}), what is the most complex project or case you have led using these exact capabilities?`,
        interviewerIntent: `Verifies depth of real-world experience against the #1 requirement in the job advertisement.`,
        keyTalkingPoints: [
          `State the project scope, budget/scale, and technical or clinical complexity`,
          `Detail your personal hands-on contribution using ${domain.coreTools[0]}`,
          `Quantify the outcome (uptime, safety record, cost savings, inspection pass rate, or client satisfaction)`
        ],
        sampleAnswer: `"On my most complex recent deployment, I was responsible for leading ${rawRequirements[0] || primarySkill} under a tight deadline where failure would have halted operations. I established a clear diagnostic and execution plan using ${domain.coreTools[0]}, coordinated directly with cross-functional stakeholders, and resolved two critical bottlenecks ahead of schedule—resulting in zero safety incidents and a 22% improvement in turnaround time."`
      },
      {
        difficulty: 'Advanced',
        question: `How do you apply ${domain.coreTools[1]} when diagnosing a root-cause failure that other team members have not been able to solve?`,
        interviewerIntent: `Assesses systematic troubleshooting methodology rather than guesswork or parts/code swapping.`,
        keyTalkingPoints: [
          `Isolate variables systematically: establish known-good baselines vs. fault conditions`,
          `Use instrumentation / telemetry (${domain.coreTools[0]}) to capture empirical evidence`,
          `Document the root cause and implement a permanent corrective action so the issue never recurs`
        ],
        sampleAnswer: `"When called in on an intermittent or complex failure, I never guess—I isolate the system into testable segments and measure against baseline specifications using ${domain.coreTools[0]} and ${domain.coreTools[1]}. By reproducing the fault under load and capturing live telemetry, I pinpoint the exact root cause, verify the fix under full operating conditions, and publish a concise troubleshooting brief so the entire team benefits."`
      },
      {
        difficulty: 'Advanced',
        question: `What are the most critical quality tolerances or performance benchmarks you enforce when working with ${secondarySkill}?`,
        interviewerIntent: `Distinguishes seasoned senior practitioners from entry-level applicants by testing precision standards.`,
        keyTalkingPoints: [
          `Cite industry standards (${domain.standards[0]}) and OEM/regulatory tolerances`,
          `Explain how you verify work in-process rather than waiting for final inspection`,
          `Describe how you mentor junior colleagues on maintaining those tolerances`
        ],
        sampleAnswer: `"Precision comes from checking work at every critical hold point rather than waiting for final sign-off. When working with ${secondarySkill}, I benchmark every step against ${domain.standards[0]}, record baseline and post-completion metrics, and perform peer cross-checks on high-consequence connections or configurations."`
      },
      {
        difficulty: 'Core',
        question: `How do you stay current with evolving standards, tools, and regulations in ${enclaveObj?.name || domain.roleLabel} (such as ${domain.standards[0]})?`,
        interviewerIntent: `Checks continuous learning mindset, active certifications, and commitment to professional excellence.`,
        keyTalkingPoints: [
          `Reference active licenses, continuing education units (CEUs), and code/protocol updates`,
          `Highlight participation in professional guilds, hands-on labs, and peer case reviews`,
          `Share how you recently translated a new regulatory or technical update into daily practice`
        ],
        sampleAnswer: `"I treat continuing education as a core part of my craft. I actively maintain my credentials in ${primarySkill}, review updates to ${domain.standards[0]}, and run tabletop walkthroughs with my team whenever new code cycles, clinical guidelines, or tool releases take effect."`
      },
      {
        difficulty: 'Panel Deep-Dive',
        question: `If you joined ${company} in ${location} tomorrow as our ${jobTitle}, how would you audit and optimize our current workflow in your first 30 days?`,
        interviewerIntent: `Tests strategic thinking, humility, and practical 30-60-90 day onboarding impact.`,
        keyTalkingPoints: [
          `Days 1–10: Shadow current team workflows, review SOPs, safety logs, and active backlogs without disrupting operations`,
          `Days 11–20: Identify the top 2–3 recurring bottlenecks or rework points using data`,
          `Days 21–30: Deliver quick-win improvements while earning the trust of peers and leadership`
        ],
        sampleAnswer: `"In my first two weeks at ${company}, my priority is listening, learning your existing SOPs, and delivering rock-solid execution on my assigned workload. Concurrently, I map out where the team loses time—whether in handoffs, documentation, or recurring equipment/system issues—and by Day 30 I present practical, low-friction improvements backed by real metrics."`
      }
    ]

    round2Questions = [
      {
        difficulty: 'Advanced',
        question: `Scenario: Halfway through a time-critical assignment at ${company}, you discover a safety or compliance violation that would delay delivery by 4 hours if halted. What do you do?`,
        interviewerIntent: `Tests unwavering commitment to safety and regulatory integrity under schedule pressure.`,
        keyTalkingPoints: [
          `Exercise Stop-Work Authority immediately if life safety, patient safety, or legal compliance is at risk`,
          `Communicate transparently with the supervisor/client with both the risk and a concrete mitigation plan`,
          `Execute the remediation safely and document the corrective action per ${domain.standards[1]}`
        ],
        sampleAnswer: `"Safety and compliance are non-negotiable—a 4-hour delay is always preferable to a catastrophic injury, patient harm, or regulatory shutdown. I immediately secure the hazard, notify my supervisor with a clear explanation of the violation under ${domain.standards[1]}, and propose the fastest compliant remediation path so we resolve the issue and resume work safely."`
      },
      {
        difficulty: 'Core',
        question: `Scenario: You are handed an urgent turn-over from a previous shift where documentation is incomplete and deadlines are tight. How do you proceed?`,
        interviewerIntent: `Evaluates composure, verification discipline ("trust but verify"), and risk mitigation.`,
        keyTalkingPoints: [
          `Never assume unverified work is safe or complete—perform a rapid physical/system audit of current state`,
          `Establish what is verified vs. what requires re-inspection using ${domain.coreTools[0]}`,
          `Update the status log clearly and communicate realistic timelines to stakeholders`
        ],
        sampleAnswer: `"Whenever I inherit an incomplete handoff, I follow the rule 'verify before proceeding.' I spend the first 10 minutes performing a rapid baseline inspection using ${domain.coreTools[0]} to confirm what has actually been completed and what safety or quality checks remain open. Once I have ground truth, I prioritize the critical path and update leadership with an accurate timeline."`
      },
      {
        difficulty: 'Advanced',
        question: `Scenario: Multiple high-priority requests arrive simultaneously at ${company}—an urgent client/patient escalation, a routine scheduled task, and an equipment/system warning alarm. How do you triage?`,
        interviewerIntent: `Tests real-time prioritization framework under high cognitive load.`,
        keyTalkingPoints: [
          `Triage by severity and irreversibility: Life/System Safety Alarm > Acute Escalation > Routine Scheduled Work`,
          `Contain the immediate hazard or alarm first, delegate or reschedule routine tasks, and keep stakeholders informed`,
          `Close the loop on all three items with complete documentation`
        ],
        sampleAnswer: `"I triage strictly by safety and operational impact. First, I address the active warning alarm to ensure there is no immediate safety or system-wide failure. Second, I resolve the acute escalation while delegating or re-sequencing the routine scheduled task with a colleague, ensuring every stakeholder knows the exact ETA."`
      },
      {
        difficulty: 'Core',
        question: `Scenario: A colleague or subcontractor is taking a shortcut that violates ${domain.standards[0]}. How do you intervene constructively without creating hostility?`,
        interviewerIntent: `Assesses peer leadership, psychological safety, and upholding professional standards.`,
        keyTalkingPoints: [
          `Intervene immediately in a respectful, peer-to-peer coaching tone ("Let's pause for a second so we both stay safe/compliant")`,
          `Explain the 'why' behind the standard (${domain.standards[0]}) and offer to help set up the proper procedure`,
          `Escalate to leadership if the unsafe behavior persists`
        ],
        sampleAnswer: `"I address it immediately at the peer level with respect rather than accusation. I step in and say, 'Hey, let's take two minutes to set this up per ${domain.standards[0]} so neither of us gets hurt or cited.' Nine times out of ten, offering an extra pair of hands solves it on the spot and builds mutual respect; if someone refuses to work safely, I escalate per company policy."`
      },
      {
        difficulty: 'Advanced',
        question: `Scenario: A client, patient family member, or external inspector is frustrated and questioning the timeline or approach on your assignment. How do you de-escalate and win their confidence?`,
        interviewerIntent: `Evaluates emotional intelligence, executive presence, and customer/patient advocacy.`,
        keyTalkingPoints: [
          `Listen actively without interrupting, validate their concern, and maintain a calm, authoritative tone`,
          `Share transparent facts on what is being done right now to protect quality and safety`,
          `Give a specific follow-up commitment and deliver on it early`
        ],
        sampleAnswer: `"When someone is frustrated, they want to know they are heard and that a competent professional is in control. I listen without interrupting, acknowledge their concern directly, and walk them through the exact steps we are taking to ensure a safe, high-quality outcome. I then set a concrete check-in time—such as updating them in 20 minutes—and make sure I beat that promise."`
      },
      {
        difficulty: 'Panel Deep-Dive',
        question: `Scenario: Describe a situation where a standard procedure failed to resolve an issue and you had to adapt safely within regulatory boundaries.`,
        interviewerIntent: `Tests adaptability, deep domain mastery, and collaborative problem-solving with supervisors/engineers/providers.`,
        keyTalkingPoints: [
          `Recognize early when standard Tier-1 troubleshooting isn't working`,
          `Gather empirical diagnostic data and consult with senior leadership / engineering / clinical leads`,
          `Execute an approved alternative protocol and update the team playbook`
        ],
        sampleAnswer: `"When a standard protocol doesn't resolve the issue, I resist the urge to force it. Instead, I capture exact diagnostic readings, consult technical schematics or clinical/engineering leadership with a concise summary of what we've ruled out, and implement a verified secondary approach that solves the root cause safely."`
      }
    ]
  }

  // Round 3: Credentials, Compliance, Safety & Quality Standards (Questions 13–17)
  const round3Questions: Omit<NoctisInterviewQuestion, 'id' | 'number' | 'round' | 'roundLabel'>[] = [
    {
      difficulty: 'Core',
      question: `Which active licenses, certifications, and hands-on credentials (${primarySkill}) do you bring to ${company}, and how do you maintain 100% audit readiness?`,
      interviewerIntent: `Confirms credential verification, regulatory compliance, and readiness for external inspections/audits.`,
      keyTalkingPoints: [
        `List your primary licenses, certifications, and renewals relevant to ${jobTitle}`,
        `Explain how you document every shift/project so records pass state, federal, or Joint Commission/OSHA audits`,
        `Highlight your familiarity with ${domain.standards[0]}`
      ],
      sampleAnswer: `"I keep all of my required credentials, continuing education, and competency verifications current and audit-ready. In daily practice, I document contemporaneously—ensuring every action, measurement, and sign-off complies with ${domain.standards[0]} and ${company}'s internal quality standards so we are always ready for an unannounced inspection."`
    },
    {
      difficulty: 'Core',
      question: `How do you enforce ${domain.standards[1]} during high-volume shifts when the team is under pressure to move faster?`,
      interviewerIntent: `Tests whether the candidate cuts corners on safety or infection/hazard control when busy.`,
      keyTalkingPoints: [
        `Treat safety/infection/LOTO protocols as muscle memory that never changes based on workload`,
        `Prepare PPE, sterile supplies, or lockout equipment before starting the task to save time safely`,
        `Lead by example so junior staff see that speed comes from organization, not shortcuts`
      ],
      sampleAnswer: `"Speed in our profession comes from preparation and smooth habits, never from skipping safety steps. Under ${domain.standards[1]}, I stage my equipment and protective gear before beginning the task so following the full protocol takes zero extra time and keeps everyone protected."`
    },
    {
      difficulty: 'Advanced',
      question: `Walk us through how you handle confidential data, documentation accuracy, and regulatory reporting (${domain.standards[2]}).`,
      interviewerIntent: `Assesses documentation integrity, legal/regulatory protection, and attention to detail.`,
      keyTalkingPoints: [
        `Chart/log objective, timestamped facts rather than vague assumptions`,
        `Protect sensitive patient/client/company data on screens, printouts, and verbal handoffs`,
        `Perform end-of-shift reconciliation to ensure zero missing signatures or unverified orders/tickets`
      ],
      sampleAnswer: `"If it isn't documented accurately and objectively, it didn't happen. I record clear, timestamped observations in real time, lock workstations whenever stepping away in compliance with ${domain.standards[2]}, and run a 5-minute end-of-shift audit to verify every order, note, and handoff is 100% complete."`
    },
    {
      difficulty: 'Advanced',
      question: `If you make or discover a near-miss or operational error on your unit/site, what is your immediate response and reporting process?`,
      interviewerIntent: `Evaluates honesty, ethical accountability, Just Culture mindset, and patient/worksite safety priority.`,
      keyTalkingPoints: [
        `First: assess and protect the patient, client, or system immediately`,
        `Second: report the error or near-miss transparently to the supervisor/provider right away—never conceal it`,
        `Third: complete the incident/variance report and participate in root-cause prevention`
      ],
      sampleAnswer: `"Integrity is everything in this role. If a near-miss or error occurs, my immediate first step is ensuring the safety of the patient or system. Second, I notify my supervisor and relevant lead immediately with the exact facts. Third, I document the event accurately and help implement a process safeguard so the same error cannot happen to another team member."`
    },
    {
      difficulty: 'Panel Deep-Dive',
      question: `What does 'High-Reliability Organization' (HRO) culture mean to you in the context of ${jobTitle} at ${company}?`,
      interviewerIntent: `Tests senior-level safety culture: preoccupation with failure, sensitivity to operations, and deference to expertise.`,
      keyTalkingPoints: [
        `Preoccupation with small weak signals before they cascade into major incidents`,
        `Closed-loop communication (repeat-back verification on critical orders/instructions)`,
        `Speaking up respectfully across hierarchy whenever something doesn't look right`
      ],
      sampleAnswer: `"To me, high reliability means never becoming complacent with routine tasks. It means using closed-loop repeat-backs on critical instructions, paying attention to subtle early warning signs, and creating a team culture where anyone—from a new aide/apprentice to a senior director—is thanked for speaking up about a safety concern."`
    }
  ]

  // Round 4: Behavioral, Leadership, Teamwork & STAR Method (Questions 18–21)
  const round4Questions: Omit<NoctisInterviewQuestion, 'id' | 'number' | 'round' | 'roundLabel'>[] = [
    {
      difficulty: 'Core',
      question: `Tell me about a time (using the STAR method) when you stepped into a short-staffed or high-stress shift and kept the team calm and productive.`,
      interviewerIntent: `Behavioral assessment of resilience, teamwork, and practical leadership during staffing or surge challenges.`,
      keyTalkingPoints: [
        `Situation & Task: Describe the staffing shortage or surge and what was at stake`,
        `Action: How you huddled the team, re-prioritized essential tasks, and shared the load`,
        `Result: Quantifiable safety, quality, and morale outcome`
      ],
      sampleAnswer: `"Situation: On a busy weekend shift, two team members called out unexpectedly right as we received three high-acuity arrivals. Task: We needed to maintain 100% safety and on-time care without burning out the remaining staff. Action: I called a 2-minute standup huddle, divided the floor into zones to minimize footsteps, prioritized safety-critical tasks first, and cross-covered break times. Result: We completed the shift with zero safety incidents, 100% on-time critical completions, and our supervisor commended the team's coordination."`
    },
    {
      difficulty: 'Core',
      question: `Describe a time you had a professional disagreement with a supervisor, physician/engineer, or teammate regarding the best approach to a problem. How did you resolve it?`,
      interviewerIntent: `Evaluates collaborative advocacy, respect for chain of command, and fact-based communication.`,
      keyTalkingPoints: [
        `Focus on objective data and patient/project safety rather than ego`,
        `Use structured communication (SBAR / technical data) in a private, respectful conversation`,
        `Commit to the final verified decision and document appropriately`
      ],
      sampleAnswer: `"When I noticed an order/plan that conflicted with a recent change in baseline data, I approached the lead privately with the updated vitals/metrics in hand and said, 'I want to make sure you have this latest reading before we proceed.' By presenting objective facts respectfully, the lead thanked me, adjusted the plan immediately, and our working relationship grew even stronger."`
    },
    {
      difficulty: 'Advanced',
      question: `Tell us about a time you mentored or onboarded a new hire, student, or support team member who was struggling with confidence or speed.`,
      interviewerIntent: `Assesses precepting ability, patience, and team-building value for ${company}.`,
      keyTalkingPoints: [
        `Break complex workflows into repeatable checklists ("See one, do one, teach one")`,
        `Provide constructive feedback in private and praise progress in public`,
        `Verify competency without hovering or taking over unnecessarily`
      ],
      sampleAnswer: `"When precepting a new teammate who felt overwhelmed by shift pacing, I helped them build a simple hour-by-hour organization grid and walked side-by-side with them through their two most stressful procedures. Within two weeks, their confidence and accuracy soared, and they became one of the most reliable members on our rotation."`
    },
    {
      difficulty: 'Advanced',
      question: `What is the toughest piece of constructive feedback you have received in your career, and how did it make you a stronger ${jobTitle}?`,
      interviewerIntent: `Tests coachability, self-awareness, and growth mindset.`,
      keyTalkingPoints: [
        `Share a genuine early-career lesson (e.g., trying to do everything yourself instead of delegating early)`,
        `Explain the concrete habit you built in response to that feedback`,
        `Show how that improvement now benefits your team every day`
      ],
      sampleAnswer: `"Early in my career, a charge supervisor pointed out that I was taking on every task myself instead of delegating routine items early in the shift, which left me rushed at end-of-shift charting. I took that to heart, started holding a 3-minute delegation huddle at the top of every shift, and now finish both my hands-on care and documentation ahead of schedule."`
    }
  ]

  // Round 5: Employer Fit, Compensation & Strategic Questions to Ask the Panel (Questions 22–25)
  const round5Questions: Omit<NoctisInterviewQuestion, 'id' | 'number' | 'round' | 'roundLabel'>[] = [
    {
      difficulty: 'Core',
      question: `Why did you apply specifically for this ${jobTitle} position at ${company} in ${location}, and what makes our organization the right fit for your next chapter?`,
      interviewerIntent: `Checks genuine motivation for ${company}, retention likelihood, and alignment with the team's mission.`,
      keyTalkingPoints: [
        `Connect your hands-on background in ${primarySkill} directly to ${company}'s reputation and needs in ${location}`,
        `Express enthusiasm for long-term stability, team culture, and delivering measurable impact`,
        `Reference specific details from the job posting (${salaryRange} / shift & team structure)`
      ],
      sampleAnswer: `"I applied to ${company} because of your strong reputation for clinical/operational excellence in ${location} and your commitment to supporting frontline professionals. My background in ${primarySkill} and ${secondarySkill} aligns directly with what your team needs right now, and I am looking for a long-term home where I can contribute immediately and grow with the organization."`
    },
    {
      difficulty: 'Core',
      question: `How do you prevent burnout, maintain physical and mental stamina across demanding shifts, and ensure consistent attendance and reliability?`,
      interviewerIntent: `Evaluates dependability, shift readiness, and sustainable work habits.`,
      keyTalkingPoints: [
        `Highlight your track record of punctuality, attendance, and shift preparation`,
        `Explain how organization during the shift prevents end-of-day exhaustion`,
        `Emphasize clear communication with scheduling/leadership`
      ],
      sampleAnswer: `"Reliability is one of my strongest traits—my teammates know that when I am on the schedule, I arrive early, prepared, and ready to hit the ground running. During the shift, staying organized and working collaboratively with my team keeps stress low, and outside of work I prioritize rest and recovery so I bring 100% focus every day."`
    },
    {
      difficulty: 'Advanced',
      question: `The advertised compensation band for this role is ${salaryRange} (plus applicable sign-on or shift differentials). What are your expectations regarding compensation, shift availability, and start date?`,
      interviewerIntent: `Confirms alignment on salary range, shift flexibility, notice period, and onboarding timeline.`,
      keyTalkingPoints: [
        `Confirm comfort with the posted range (${salaryRange}) while highlighting the value of your verified credentials`,
        `State your exact availability (full-time / shift preferences) and earliest start date`,
        `Inquire professionally about sign-on bonus milestones, differentials, and benefits`
      ],
      sampleAnswer: `"The advertised range of ${salaryRange} aligns well with my expectations given my active credentials in ${primarySkill} and my hands-on track record. I have all of my licensing and onboarding documents ready for immediate verification, and I can begin orientation as soon as my standard notice period is complete. Could you share how the sign-on bonus or shift differentials are structured?"`
    },
    {
      difficulty: 'Panel Deep-Dive',
      question: `At the end of the interview, the hiring manager asks: "What questions do you have for us?" — How should you answer to close the interview like a top 1% candidate?`,
      interviewerIntent: `Demonstrates executive engagement, genuine curiosity about the unit/site, and forward-looking ownership.`,
      keyTalkingPoints: [
        `Ask 1 question about what success looks like in the first 60–90 days for this specific unit/team`,
        `Ask 1 question about day-to-day team dynamics, staffing ratios/support, or upcoming technology/facility initiatives`,
        `Close by reaffirming your strong interest in joining ${company} and asking about the next steps in the hiring timeline`
      ],
      sampleAnswer: `"I always ask three targeted questions: 1) 'Thinking about the top performers on your unit/team at ${company}, what habits set them apart in their first 60 days?' 2) 'How are support staff and interdisciplinary huddles structured on a typical shift here in ${location}?' and 3) 'Based on our conversation today, is there anything in my background or credentials I can clarify before you make your decision?'"`
    }
  ]

  const allQuestions: NoctisInterviewQuestion[] = [
    ...round1Questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 1}`,
      number: idx + 1,
      round: 'technical_clinical' as const,
      roundLabel: 'Round 1 · Core Role & Technical/Clinical Mastery'
    })),
    ...round2Questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 7}`,
      number: idx + 7,
      round: 'scenario_troubleshooting' as const,
      roundLabel: 'Round 2 · Live Scenarios & Emergency Decision-Making'
    })),
    ...round3Questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 13}`,
      number: idx + 13,
      round: 'compliance_safety' as const,
      roundLabel: 'Round 3 · Credentials, Safety & Regulatory Compliance'
    })),
    ...round4Questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 18}`,
      number: idx + 18,
      round: 'behavioral_star' as const,
      roundLabel: 'Round 4 · Behavioral Leadership & STAR Method'
    })),
    ...round5Questions.map((q, idx) => ({
      ...q,
      id: `q_${idx + 22}`,
      number: idx + 22,
      round: 'employer_strategy' as const,
      roundLabel: 'Round 5 · Employer Fit, Compensation & Closing Questions'
    }))
  ]

  return {
    jobTitle,
    company,
    location,
    salaryRange,
    enclaveName: enclaveObj?.name || domain.roleLabel,
    enclaveIcon: enclaveObj?.icon || '💼',
    matchScore: 96,
    primarySkills: primarySkill,
    secondarySkills: secondarySkill,
    badgeText: flywheel.badgeText || '✓ Verified Role Fit',
    executiveBriefing: `Noctis™ has analyzed "${jobTitle}" at ${company} (${location}) and prepared ${allQuestions.length} role-specific interview questions across 5 rounds—covering ${primarySkill}, real-world scenarios, regulatory safety (${domain.standards[0]}), STAR behavioral leadership, and salary/closing strategy.`,
    questions: allQuestions
  }
}
