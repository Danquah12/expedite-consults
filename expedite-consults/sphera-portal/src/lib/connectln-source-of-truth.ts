import type { SkilledTradesCategory } from "./skilled-trades-learn-by-doing-data"

export interface PrimaryTruthReference {
  title: string
  authority: string
  url: string
  kind:
    | "Regulatory Code"
    | "Open Textbook / OER"
    | "Official Standard"
    | "Government Labor Data"
    | "Certification Blueprint"
}

export interface MasteryStageSpec {
  stage: number
  title: string
  duration: string
  outcomes: string[]
  deliverable: string
}

export interface ProfessionTruthBlueprint {
  category: SkilledTradesCategory
  onetSocCode: string
  onetTitle: string
  onetUrl: string
  blsMedianPay: string
  blsGrowth2025_2035: string
  blsUrl: string
  entryPathway: string
  careerLadder: [string, string, string]
  prerequisites: string[]
  starterKitSummary: string
  governingStandards: PrimaryTruthReference[]
  openTextbooksAndOer: PrimaryTruthReference[]
  officialCredentials: Array<{
    name: string
    code: string
    authority: string
    url: string
  }>
  masteryStages: MasteryStageSpec[]
  lastAuditedLabel: string
}

const AUDITED_DATE = "Audited Nov 2026 · BLS OOH / O*NET / Primary Standards"

function fourStageTemplate(
  trade: string,
  safetyCode: string,
  coreSkill: string,
  advancedSkill: string,
  businessOutcome: string
): MasteryStageSpec[] {
  return [
    {
      stage: 1,
      title: `Foundations, PPE & ${safetyCode} Compliance`,
      duration: "Weeks 1–2",
      outcomes: [
        `Pass live ${safetyCode} safety lockout and PPE inspection before tool contact`,
        `Master foundational measurement, layout units, and ${trade} tool nomenclature`,
      ],
      deliverable: `Signed jobsite hazard checklist + calibrated measurement worksheet`,
    },
    {
      stage: 2,
      title: `Core Execution: ${coreSkill}`,
      duration: "Weeks 3–6",
      outcomes: [
        `Execute repeatable ${coreSkill.toLowerCase()} workflows within strict inspection tolerances`,
        "Diagnose first-attempt defects and recover cleanly without material waste",
      ],
      deliverable: `Photo-verified Proof-of-Work + Peer Technique Vouch in ${trade}`,
    },
    {
      stage: 3,
      title: `Systems Troubleshooting & ${advancedSkill}`,
      duration: "Weeks 7–10",
      outcomes: [
        `Read multi-trade schematics/blueprints and isolate faults in ${advancedSkill.toLowerCase()}`,
        "Pass inspection testing under realistic load, pressure, code, or security stress",
      ],
      deliverable: "Multi-step scenario drill sign-off & inspection pass log",
    },
    {
      stage: 4,
      title: `Field Supervision, Estimating & ${businessOutcome}`,
      duration: "Weeks 11–12",
      outcomes: [
        "Price materials, waste allowance, loaded labor, and compliant Change Orders",
        `Operate independently or lead crews delivering ${businessOutcome.toLowerCase()}`,
      ],
      deliverable: "Verified Master-Ready Credential + client quote & scope package",
    },
  ]
}

export const PROFESSION_TRUTH_BLUEPRINTS: Record<
  SkilledTradesCategory,
  ProfessionTruthBlueprint
> = {
  Carpentry: {
    category: "Carpentry",
    onetSocCode: "47-2031.00",
    onetTitle: "Carpenters",
    onetUrl: "https://www.onetonline.org/link/summary/47-2031.00",
    blsMedianPay: "$55,000–$58,000 / yr",
    blsGrowth2025_2035: "+4%–5% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/carpenters.htm",
    entryPathway: "Registered U.S. DOL Apprenticeship (4 yrs) or Trade School + Site Helper",
    careerLadder: ["Apprentice Carpenter", "Journeyman Framer / Finish Joiner", "Master Carpenter / GC"],
    prerequisites: ["Fractions/decimals & imperial-metric tape reading", "Pythagorean 3-4-5 squaring", "ANSI eye/ear PPE compliance"],
    starterKitSummary: "25ft lock tape, Speed square, 16oz framer hammer, chisel set, 4ft level, circular saw, PPE",
    governingStandards: [
      { title: "OSHA 29 CFR 1926 Construction Safety", authority: "U.S. Dept. of Labor (OSHA)", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926", kind: "Regulatory Code" },
      { title: "International Residential Code (IRC) Wood Framing", authority: "International Code Council (ICC)", url: "https://codes.iccsafe.org/", kind: "Official Standard" },
      { title: "Registered Apprenticeship Framework", authority: "Apprenticeship.gov (U.S. DOL)", url: "https://www.apprenticeship.gov/", kind: "Government Labor Data" },
    ],
    openTextbooksAndOer: [
      { title: "BCcampus Carpentry & Trades Common Core OER", authority: "BCcampus Open Education", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Construction & Framing Modules", authority: "SkillsCommons (U.S. DOL TAACCCT)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "OSHA 30-Hour Construction Card", code: "OSHA-30", authority: "U.S. DOL / OSHA", url: "https://www.osha.gov/training/outreach" },
      { name: "NCCER Carpentry Levels 1–4", code: "NCCER-CARP", authority: "NCCER", url: "https://www.nccer.org/" },
    ],
    masteryStages: fourStageTemplate("Carpentry", "OSHA 1926", "Layout, Framing & Finish Joinery", "Stair, Roof Rafter & Blueprint Geometry", "Contract Bidding & Punch-List Sign-Off"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Auto Mechanics": {
    category: "Auto Mechanics",
    onetSocCode: "49-3023.00",
    onetTitle: "Automotive Service Technicians and Mechanics",
    onetUrl: "https://www.onetonline.org/link/summary/49-3023.00",
    blsMedianPay: "$49,670+ / yr (Master ASE $75k–$110k+)",
    blsGrowth2025_2035: "+3% (Steady EV/ADAS transition)",
    blsUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/automotive-service-technicians-and-mechanics.htm",
    entryPathway: "ASE Education Foundation Program + Paid Lube/Apprentice Bay Experience",
    careerLadder: ["Maintenance Tech", "ASE Certified Line Technician", "ASE Master / L3 High-Voltage Specialist"],
    prerequisites: ["Shop hydraulic lift & jack-stand lockout rules", "Ohm's Law & DC multimeter fluency", "EPA 609 mobile A/C awareness"],
    starterKitSummary: "CAT III multimeter, bidirectional OBD-II scan tool, 3/8 & 1/2 torque wrenches, 6-pt metric/SAE sockets",
    governingStandards: [
      { title: "ASE Official Certification Study Guides (A1–A9, L1, L3)", authority: "ASE (National Institute for Automotive Service Excellence)", url: "https://ase.com/", kind: "Certification Blueprint" },
      { title: "EPA Section 609 Motor Vehicle Air Conditioning", authority: "U.S. EPA", url: "https://www.epa.gov/mvac", kind: "Regulatory Code" },
      { title: "SAE J1939 & HV EV Safety Practices", authority: "SAE International", url: "https://www.sae.org/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons Automotive & Diesel Curriculum", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "PicoScope Automotive Guided Waveform Library", authority: "Pico Technology", url: "https://www.picoauto.com/library", kind: "Official Standard" },
    ],
    officialCredentials: [
      { name: "ASE Master Automobile Technician", code: "ASE A1–A8", authority: "ASE", url: "https://ase.com/" },
      { name: "Light Duty Hybrid/Electric Specialist", code: "ASE L3", authority: "ASE", url: "https://ase.com/" },
    ],
    masteryStages: fourStageTemplate("Auto Mechanics", "OSHA / HV Lockout", "Brakes, Suspension & Periodic Service", "OBD-II, Oscilloscope & CAN-FD Diagnostics", "Flat-Rate Bay Efficiency & EV Readiness"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Painting & Decorating": {
    category: "Painting & Decorating",
    onetSocCode: "47-2141.00",
    onetTitle: "Painters, Construction and Maintenance",
    onetUrl: "https://www.onetonline.org/link/summary/47-2141.00",
    blsMedianPay: "$48,660+ / yr (Commercial Foremen $68k–$95k)",
    blsGrowth2025_2035: "+3%–4% (Average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/painters-construction-and-maintenance.htm",
    entryPathway: "Apprenticeship / Finishing Crew -> Lead Residential & Commercial Coat Specialist",
    careerLadder: ["Prep & Masking Apprentice", "Journeyman Brush/Spray Finisher", "Commercial Coatings Contractor"],
    prerequisites: ["Ladder & scaffold safety", "EPA RRP pre-1978 lead-safe awareness", "Basic square-footage material takeoff math"],
    starterKitSummary: "2.5in angled sash brush, 9in cage frame & microfiber covers, carbide scraper, respirators, HVLP/airless tips",
    governingStandards: [
      { title: "EPA Lead Renovation, Repair & Painting (RRP)", authority: "U.S. EPA", url: "https://www.epa.gov/lead/lead-renovation-repair-and-painting-program", kind: "Regulatory Code" },
      { title: "AMPP (NACE/SSPC) Coatings & Surface Prep Standards", authority: "Association for Materials Protection & Performance", url: "https://www.ampp.org/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons Finishing & Construction Safety OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "BCcampus Trades Access Common Core", authority: "BCcampus Open Collection", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "EPA Lead-Safe Certified Renovator", code: "EPA-RRP", authority: "U.S. EPA", url: "https://www.epa.gov/lead" },
      { name: "OSHA 10/30 Construction Outreach", code: "OSHA-10/30", authority: "U.S. DOL", url: "https://www.osha.gov/training/outreach" },
    ],
    masteryStages: fourStageTemplate("Painting & Decorating", "EPA RRP / OSHA", "Surface Prep, Deglossing & Crisp Cut-Ins", "HVLP Cabinet Spraying & Coating Chemistry", "Square-Foot Estimating & Zero-Callback Handoffs"),
    lastAuditedLabel: AUDITED_DATE,
  },
  Plumbing: {
    category: "Plumbing",
    onetSocCode: "47-2152.00",
    onetTitle: "Plumbers, Pipefitters, and Steamfitters",
    onetUrl: "https://www.onetonline.org/link/summary/47-2152.00",
    blsMedianPay: "$63,800 / yr",
    blsGrowth2025_2035: "+7% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/plumbers-pipefitters-and-steamfitters.htm",
    entryPathway: "4–5 Yr Registered Apprenticeship (8,000 OJT hrs + State Journeyman Exam)",
    careerLadder: ["Apprentice Plumber", "Licensed Journeyman Plumber", "Master Plumber / Hydronics Contractor"],
    prerequisites: ["Pipe slope math (1/8 & 1/4 in/ft)", "Isometric blueprint reading", "Brazing/soldering heat safety & LOTO"],
    starterKitSummary: "Tubing cutters, deburring reamer, PEX crimper/expander, 2-ft slope level, torch, basin & pipe wrenches",
    governingStandards: [
      { title: "International Plumbing Code (IPC)", authority: "International Code Council (ICC)", url: "https://codes.iccsafe.org/", kind: "Regulatory Code" },
      { title: "Uniform Plumbing Code (UPC)", authority: "IAPMO", url: "https://www.iapmo.org/", kind: "Official Standard" },
      { title: "OSHA 29 CFR 1926 Trenching & Confined Spaces", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "BC Plumbing Apprenticeship Open Textbooks (Levels 1–2)", authority: "TRU Open Press & BCcampus", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Piping & Hydronics Workforce Archive", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Journeyman / Master Plumber License", code: "STATE-MP", authority: "State Plumbing Board", url: "https://www.apprenticeship.gov/" },
      { name: "ASSE Backflow Prevention Tester", code: "ASSE-5110", authority: "ASSE International", url: "https://www.asse-plumbing.org/" },
    ],
    masteryStages: fourStageTemplate("Plumbing", "IPC / OSHA", "Copper Sweat, PEX Joining & Slope Grading", "DWV Venting, Water Heaters & Backflow", "Fixture Rough-In Pricing & Municipal Inspections"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Electrical Fundamentals": {
    category: "Electrical Fundamentals",
    onetSocCode: "47-2111.00",
    onetTitle: "Electricians",
    onetUrl: "https://www.onetonline.org/link/summary/47-2111.00",
    blsMedianPay: "$63,190 / yr",
    blsGrowth2025_2035: "+9% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/electricians.htm",
    entryPathway: "4–5 Yr Apprenticeship (8,000 hrs + 576+ Classroom hrs -> Journeyman License)",
    careerLadder: ["Electrical Apprentice", "Licensed Journeyman Electrician", "Master Electrician / EC Contractor"],
    prerequisites: ["Ohm's Law & Kirchhoff circuit algebra", "NFPA 70E Live-Dead-Live verification discipline", "Color-blindness & ladder safety awareness"],
    starterKitSummary: "CAT III 600V True-RMS multimeter, NCVT, insulated torque screwdriver, strippers, EMT bender, LOTO kit",
    governingStandards: [
      { title: "NFPA 70 / National Electrical Code (NEC)", authority: "National Fire Protection Association (NFPA)", url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70", kind: "Regulatory Code" },
      { title: "NFPA 70E Workplace Electrical Safety", authority: "NFPA / OSHA", url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70e", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "An Electrician's Guide to Single-Phase Transformers & Motor Control", authority: "BCcampus Pressbooks OER", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "MIT 6.002 Circuits & Electronics OpenCourseWare", authority: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Journeyman & Master Electrician License", code: "NEC-JRN / MST", authority: "State Electrical Board", url: "https://www.apprenticeship.gov/" },
      { name: "NFPA 70E Qualified Electrical Worker", code: "NFPA-70E", authority: "NFPA", url: "https://www.nfpa.org/" },
    ],
    masteryStages: fourStageTemplate("Electrical", "NFPA 70E LOTO", "Branch Circuits, Box Fill & GFCI/AFCI", "Service Panels, Load Calcs & 3-Phase Motors", "NEC Load Studies & Permit-Ready Bids"),
    lastAuditedLabel: AUDITED_DATE,
  },
  Welding: {
    category: "Welding",
    onetSocCode: "51-4121.00",
    onetTitle: "Welders, Cutters, Solderers, and Brazers",
    onetUrl: "https://www.onetonline.org/link/summary/51-4121.00",
    blsMedianPay: "$53,750 / yr (Pipe/TIG/Underwater $80k–$120k+)",
    blsGrowth2025_2035: "+2% (Strong replacement demand)",
    blsUrl: "https://www.bls.gov/ooh/production/welders-cutters-solderers-and-brazers.htm",
    entryPathway: "Welding Tech Certificate + AWS D1.1 3G/4G/6G Bend Qualification",
    careerLadder: ["Production Tack Welder", "AWS D1.1 / ASME Certified Welder", "Certified Welding Inspector (CWI)"],
    prerequisites: ["Arc-radiation & fume ventilation setup", "Fire-watch 35ft clearance protocol", "Fraction-to-decimal weld symbol literacy"],
    starterKitSummary: "Auto-darkening helmet (Shade 10-13), FR leather jacket/gauntlets, angle grinder, chipping hammer, fillet gauge",
    governingStandards: [
      { title: "AWS D1.1 Structural Welding Code — Steel", authority: "American Welding Society (AWS)", url: "https://www.aws.org/standards/d1-committee/d11/", kind: "Official Standard" },
      { title: "OSHA 1910.252 Welding, Cutting & Brazing Safety", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/welding-cutting-brazing", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "Basic Blueprint Reading for Welders OER", authority: "BCcampus Open Collection", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Advanced Welding & NDT Syllabi", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "AWS Certified Welder (SMAW/GMAW/GTAW)", code: "AWS-CW (D1.1)", authority: "American Welding Society", url: "https://www.aws.org/" },
      { name: "AWS Certified Welding Inspector", code: "AWS-CWI", authority: "American Welding Society", url: "https://www.aws.org/" },
    ],
    masteryStages: fourStageTemplate("Welding", "OSHA 1910.252", "Flat/Horizontal Stick & MIG Puddle Control", "Overhead/Pipe GTAW & AWS Weld Blueprints", "Bend-Test Qualification & Fabrication Quoting"),
    lastAuditedLabel: AUDITED_DATE,
  },
  HVAC: {
    category: "HVAC",
    onetSocCode: "49-9021.00",
    onetTitle: "Heating, Air Conditioning, and Refrigeration Mechanics and Installers",
    onetUrl: "https://www.onetonline.org/link/summary/49-9021.00",
    blsMedianPay: "$61,010 / yr",
    blsGrowth2025_2035: "+8%–10% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/heating-air-conditioning-and-refrigeration-mechanics-and-installers.htm",
    entryPathway: "HVAC Certificate + EPA Section 608 Universal + Commercial Service Route",
    careerLadder: ["PM Maintenance Tech", "EPA 608 Service Technician", "Commercial Controls / BAS Master Tech"],
    prerequisites: ["Psychrometrics & heat-transfer basics", "24V control schematic reading", "EPA 608 Universal Certification (legally required)"],
    starterKitSummary: "Digital manifold gauges, micron vacuum gauge, clamp multimeter with µF, recovery machine, nitrogen regulator",
    governingStandards: [
      { title: "EPA Section 608 Refrigerant Technician Certification", authority: "U.S. EPA Clean Air Act", url: "https://www.epa.gov/section608", kind: "Regulatory Code" },
      { title: "ASHRAE Standards 15 & 90.1 / IMC Mechanical Code", authority: "ASHRAE / ICC", url: "https://www.ashrae.org/technical-resources/standards-and-guidelines", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons HVACR & Building Automation Modules", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "BCcampus Refrigeration & Sheet Metal OER", authority: "BCcampus Open Collection", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "EPA Section 608 Universal", code: "EPA-608-UNIV", authority: "U.S. EPA", url: "https://www.epa.gov/section608" },
      { name: "NATE Certified HVAC Technician", code: "NATE-CORE", authority: "NATE", url: "https://www.natex.org/" },
    ],
    masteryStages: fourStageTemplate("HVAC", "EPA 608 / LOTO", "Airflow, Superheat/Subcooling & Vacuum Pull", "Heat Pumps, Inverter Drives & Controls", "Manual-J Sizing & Service Agreement Growth"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Masonry & Tile": {
    category: "Masonry & Tile",
    onetSocCode: "47-2021.00",
    onetTitle: "Brickmasons, Blockmasons, and Stonemasons / Tile Setters",
    onetUrl: "https://www.onetonline.org/link/summary/47-2021.00",
    blsMedianPay: "$58,400 / yr",
    blsGrowth2025_2035: "+3%–5% (Steady)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/brickmasons-blockmasons-and-stonemasons.htm",
    entryPathway: "Tender/Hod Carrier Helper -> 3-Yr Apprenticeship -> CTI Certified Tile / Master Mason",
    careerLadder: ["Mortar Tender / Apprentice", "Journeyman Tile Setter / Bricklayer", "CTI Master Contractor"],
    prerequisites: ["OSHA Silica Dust (Table 1) P100 water-suppression safety", "Level/plumb line geometry", "Substrate moisture awareness"],
    starterKitSummary: "Square & Euro-notch trowels, 4ft spirit level, brick hammer, jointer, wet tile saw, rubber mallet, P100 respirator",
    governingStandards: [
      { title: "TCNA Handbook for Ceramic, Glass & Stone Tile", authority: "Tile Council of North America", url: "https://tcnatile.com/", kind: "Official Standard" },
      { title: "OSHA 1926.1153 Respirable Crystalline Silica Standard", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/silica-crystalline", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons Masonry & Concrete Technology OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "BCcampus Masonry Trades Common Core", authority: "BCcampus Open Textbooks", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Certified Tile Installer (CTI)", code: "CTEF-CTI", authority: "Ceramic Tile Education Foundation", url: "https://www.ceramictilefoundation.org/" },
      { name: "OSHA Silica Competent Person", code: "OSHA-1926.1153", authority: "U.S. DOL", url: "https://www.osha.gov/" },
    ],
    masteryStages: fourStageTemplate("Masonry & Tile", "OSHA Silica", "Waterproofing, Substrate Prep & Mortar Slake", "Large-Format Lippage & Flood-Tested Pans", "Square-Foot Coverage Takeoffs & Crew Estimates"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Roofing & Drywall": {
    category: "Roofing & Drywall",
    onetSocCode: "47-2181.00",
    onetTitle: "Roofers & Drywall Ceiling Installers",
    onetUrl: "https://www.onetonline.org/link/summary/47-2181.00",
    blsMedianPay: "$52,800 / yr",
    blsGrowth2025_2035: "+6% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/roofers.htm",
    entryPathway: "Fall-Protection Trained Helper -> Journeyman Envelope & Taper -> Roofing/Drywall Contractor",
    careerLadder: ["Helper / Tear-Off Crew", "Lead Installer & Drywall Taper", "Building Envelope Contractor"],
    prerequisites: ["OSHA Subpart M fall-arrest harness & anchor rules", "Roof pitch geometry", "Shingle-lap water-shedding sequence"],
    starterKitSummary: "PFAS fall-arrest harness, chalk line, drywall screw gun, 6/10/12in taping knives, tin snips, roof brackets",
    governingStandards: [
      { title: "OSHA 29 CFR 1926 Subpart M Fall Protection", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/fall-protection", kind: "Regulatory Code" },
      { title: "NRCA Roofing Manual & GA-216 Gypsum Finish Levels", authority: "NRCA / Gypsum Association", url: "https://www.nrca.net/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons Building Envelope & Carpentry OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "BCcampus Sheet Goods & Framing Manual", authority: "BCcampus Open Education", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NRCA ProCertification Installer", code: "NRCA-PRO", authority: "NRCA", url: "https://www.nrca.net/" },
      { name: "OSHA 30-Hour Fall Prevention", code: "OSHA-SUBPART-M", authority: "U.S. DOL", url: "https://www.osha.gov/" },
    ],
    masteryStages: fourStageTemplate("Roofing & Drywall", "OSHA Subpart M", "Underlayment, Flashing Laps & Board Hang", "Level-4/5 Seam Feathering & Valley Geometry", "Roof Square Estimating & Insurance Scopes"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Solar & Energy": {
    category: "Solar & Energy",
    onetSocCode: "47-2231.00",
    onetTitle: "Solar Photovoltaic Installers",
    onetUrl: "https://www.onetonline.org/link/summary/47-2231.00",
    blsMedianPay: "$52,000–$68,000 / yr",
    blsGrowth2025_2035: "+48% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/construction-and-extraction/solar-photovoltaic-installers.htm",
    entryPathway: "NABCEP PV Associate Exam -> Roof/Battery Installation Crew -> Licensed PVIP",
    careerLadder: ["PV Installer Apprentice", "NABCEP PV Associate", "NABCEP PV Installation Professional (PVIP)"],
    prerequisites: ["DC Voc temperature correction math", "NEC Articles 690 & 706", "Rooftop fall protection & arc-flash PPE"],
    starterKitSummary: "1000V DC clamp meter, MC4 crimper/disconnect wrench, irradiance meter, fall harness, calibrated torque wrench",
    governingStandards: [
      { title: "NABCEP Global Certification Standards", authority: "NABCEP", url: "https://www.nabcep.org/", kind: "Certification Blueprint" },
      { title: "NEC Articles 690 (PV) & 706 (Energy Storage)", authority: "NFPA 70", url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "NREL Open Solar & Microgrid Educational Data", authority: "National Renewable Energy Laboratory (NREL)", url: "https://www.nrel.gov/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Clean Energy & PV Curricula", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NABCEP PV Associate", code: "NABCEP-PVA", authority: "NABCEP", url: "https://www.nabcep.org/" },
      { name: "NABCEP PV Installation Professional", code: "NABCEP-PVIP", authority: "NABCEP", url: "https://www.nabcep.org/" },
    ],
    masteryStages: fourStageTemplate("Solar & Energy", "NEC 690 / OSHA", "Roof Structural Lagging, Racking & Flashing", "String Sizing, Hybrid Inverters & LiFePO4 BMS", "Utility Interconnection & Commercial PV Bids"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Machining & Repair": {
    category: "Machining & Repair",
    onetSocCode: "51-4041.00",
    onetTitle: "Machinists & CNC Programmers",
    onetUrl: "https://www.onetonline.org/link/summary/51-4041.00",
    blsMedianPay: "$54,100–$72,000 / yr",
    blsGrowth2025_2035: "+2%–4% (Strong precision aerospace/medical demand)",
    blsUrl: "https://www.bls.gov/ooh/production/machinists-and-tool-and-die-makers.htm",
    entryPathway: "NIMS Level 1–2 Lab Credential + CNC Lathe/Mill Apprenticeship",
    careerLadder: ["CNC Operator", "CNC Setup Machinist", "Master Toolmaker / CAM Engineer"],
    prerequisites: ["GD&T blueprint tolerance basics", "Spindle entanglement safety (zero loose cloth/gloves)", "Feeds/speeds RPM math"],
    starterKitSummary: "0.001in/0.02mm calipers, 0-1in micrometer, dial test indicator, edge finder, dead-blow hammer, ANSI glasses",
    governingStandards: [
      { title: "ASME Y14.5 Geometric Dimensioning & Tolerancing (GD&T)", authority: "ASME", url: "https://www.asme.org/", kind: "Official Standard" },
      { title: "NIMS Machining Level I–III Skills Standards", authority: "National Institute for Metalworking Skills", url: "https://www.nims-skills.org/", kind: "Certification Blueprint" },
    ],
    openTextbooksAndOer: [
      { title: "BCcampus Metal Fabrication & Machining Common Core", authority: "BCcampus Open Textbooks", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Advanced Manufacturing & CNC Lab Guides", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NIMS CNC Milling & Turning Operator", code: "NIMS-L1/L2", authority: "NIMS", url: "https://www.nims-skills.org/" },
      { name: "Haas Basic Mill & Lathe Certification", code: "HAAS-CNC", authority: "Haas Automation", url: "https://www.haascnc.com/" },
    ],
    masteryStages: fourStageTemplate("Machining", "OSHA Machine Guard", "Micrometer Metrology & Datum Setup", "G-Code CNC Offsets & Tooling Compensation", "Multi-Axis Toolmaking & Batch QA"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Agriculture & Landscaping": {
    category: "Agriculture & Landscaping",
    onetSocCode: "19-1013.00",
    onetTitle: "Soil and Plant Scientists / Landscape Horticulturists",
    onetUrl: "https://www.onetonline.org/link/summary/19-1013.00",
    blsMedianPay: "$45,000–$76,400 / yr",
    blsGrowth2025_2035: "+6%–8% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/life-physical-and-social-science/agricultural-and-food-scientists.htm",
    entryPathway: "Field Nursery / Extension Training + Certified Landscape Technician / Agronomist",
    careerLadder: ["Field Crew / Grower", "Certified Irrigation & Soil Specialist", "Master Agronomist / Design-Build Owner"],
    prerequisites: ["Call-811 underground utility locate before digging", "Soil pH & drainage jar testing", "Safe pruning collar biology"],
    starterKitSummary: "Bypass pruners, soil core probe, pH/EC meter, grading rake, laser transit, PPE boots & ear protection",
    governingStandards: [
      { title: "USDA NRCS Soil Health & Conservation Standards", authority: "USDA", url: "https://www.nrcs.usda.gov/", kind: "Official Standard" },
      { title: "ISA Arborist & Pruning Best Practices (ANSI A300)", authority: "International Society of Arboriculture", url: "https://www.isa-arbor.com/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "OpenStax Biology & Environmental Science Texts", authority: "OpenStax (Rice University)", url: "https://openstax.org/subjects", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Agribusiness & Irrigation OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NALP Landscape Industry Certified Technician", code: "NALP-LICT", authority: "NALP", url: "https://www.landscapeprofessionals.org/" },
      { name: "ISA Certified Arborist", code: "ISA-CA", authority: "ISA", url: "https://www.isa-arbor.com/" },
    ],
    masteryStages: fourStageTemplate("Agriculture & Landscaping", "811 Utility / PPE", "Soil Chemistry, Compost & Drip Irrigation", "Hardscaping Slope & Integrated Pest Control", "Seasonal Maintenance Contracts & Ag Yields"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Culinary & Hospitality": {
    category: "Culinary & Hospitality",
    onetSocCode: "35-1011.00",
    onetTitle: "Chefs and Head Cooks",
    onetUrl: "https://www.onetonline.org/link/summary/35-1011.00",
    blsMedianPay: "$60,990 / yr (Executive Chefs $85k–$130k+)",
    blsGrowth2025_2035: "+8% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/food-preparation-and-serving/chefs-and-head-cooks.htm",
    entryPathway: "ServSafe Food Protection Manager -> Line Station Mastery -> Sous/Executive Chef",
    careerLadder: ["Prep / Line Cook", "Sous Chef / Kitchen Manager", "Executive Chef / Catering Director"],
    prerequisites: ["40°F–140°F Danger Zone mastery", "Cross-contamination color boards", "Knife grip & steel honing safety"],
    starterKitSummary: "8in forged chef knife, honing rod, instant-read probe thermometer, cut glove, non-slip clogs, digital scale",
    governingStandards: [
      { title: "US FDA Food Code (Time/Temperature & HACCP)", authority: "U.S. Food & Drug Administration", url: "https://www.fda.gov/food/fda-food-code/food-code", kind: "Regulatory Code" },
      { title: "ServSafe Food Protection Manager Standard", authority: "National Restaurant Association", url: "https://www.servsafe.com/", kind: "Certification Blueprint" },
    ],
    openTextbooksAndOer: [
      { title: "BC Cook Articulation Committee Open Textbooks", authority: "BCcampus Open Education", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "Applied Math for Food Service OER", authority: "U of Regina / Pressbooks OER", url: "https://www.oercommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "ServSafe Certified Food Protection Manager", code: "CFPM", authority: "ANAB / ServSafe", url: "https://www.servsafe.com/" },
      { name: "ACF Certified Sous Chef", code: "ACF-CSC", authority: "American Culinary Federation", url: "https://www.acfchefs.org/" },
    ],
    masteryStages: fourStageTemplate("Culinary", "FDA Food Code", "Knife Precision, Sauces & Mise en Place", "Line Timing, Protein Control & Allergen HACCP", "Plate Food-Costing (28–32%) & Catering Ops"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Barbering & Beauty": {
    category: "Barbering & Beauty",
    onetSocCode: "39-5011.00",
    onetTitle: "Barbers, Hairstylists, and Cosmetologists",
    onetUrl: "https://www.onetonline.org/link/summary/39-5011.00",
    blsMedianPay: "$38,000–$75,000+ / yr (Shop Owners $90k+)",
    blsGrowth2025_2035: "+7% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/personal-care-and-service/barbers-hairstylists-and-cosmetologists.htm",
    entryPathway: "State-Approved Barber/Cosmetology School (1,000–1,500 hrs) + Practical State Board",
    careerLadder: ["Licensed Barber / Stylist", "Master Fade & Shave Specialist", "Studio Owner / Educator"],
    prerequisites: ["EPA Barbicide hospital-grade disinfection rules", "Blood-exposure single-use blade disposal", "Crown growth mapping"],
    starterKitSummary: "Cordless rotary clippers + zero-gapped detailer, convex Japanese steel shears, textured combs, Barbicide jar, fresh capes",
    governingStandards: [
      { title: "State Board Barber & Cosmetology Sanitation Code", authority: "NIC National-Interstate Council", url: "https://nictesting.org/", kind: "Regulatory Code" },
      { title: "OSHA Bloodborne Pathogens 29 CFR 1910.1030", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/bloodborne-pathogens", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "BCcampus Hairstylist & Trades Common Core", authority: "BCcampus Open Textbooks", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Health & Sanitation Workforce Library", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NIC State Licensed Master Barber", code: "NIC-BARBER", authority: "State Barber Board", url: "https://nictesting.org/" },
      { name: "Barbicide Infection Control Certification", code: "BARB-SAFE", authority: "King Research", url: "https://barbicide.com/" },
    ],
    masteryStages: fourStageTemplate("Barbering", "NIC / OSHA Bloodborne", "Blade Sanitation, Taper Guidelines & Shears", "Skin-Fade Lever Blending & Beard Geometry", "Chair Utilization, Bookings & Shop Economics"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Tailoring & Sewing": {
    category: "Tailoring & Sewing",
    onetSocCode: "51-6052.00",
    onetTitle: "Tailors, Dressmakers, and Custom Sewers",
    onetUrl: "https://www.onetonline.org/link/summary/51-6052.00",
    blsMedianPay: "$39,500–$68,000 / yr (Bespoke Atelier $85k+)",
    blsGrowth2025_2035: "Steady bespoke & luxury alterations demand",
    blsUrl: "https://www.bls.gov/ooh/production/",
    entryPathway: "Apparel Alterations & Pattern Apprenticeship -> Custom Bespoke Atelier",
    careerLadder: ["Alterations Sewer", "Pattern Maker & Master Tailor", "Bespoke Fashion Atelier Owner"],
    prerequisites: ["Grainline & bias stretch literacy", "Exact 36-point body measurement discipline", "Iron heat safety & steam pressing"],
    starterKitSummary: "10in forged fabric shears, fiberglass tape measure, Tailor's ham, steam iron, walking-foot/lockstitch machine, thimble",
    governingStandards: [
      { title: "ASTM D6193 Stitch & Seam Type Classification", authority: "ASTM International", url: "https://www.astm.org/", kind: "Official Standard" },
      { title: "Textile Fiber Care Labeling (FTC Rule)", authority: "U.S. FTC", url: "https://www.ftc.gov/", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "SkillsCommons Apparel & Industrial Sewing OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
      { title: "OER Commons Pattern Drafting & Textiles", authority: "OER Commons", url: "https://www.oercommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Master Custom Tailor & Pattern Specialist", code: "ATELIER-MT", authority: "Custom Tailors & Designers Assoc.", url: "https://www.customtailors.com/" },
      { name: "Industrial Lockstitch & Overlock Safety", code: "OSHA-TEXTILE", authority: "U.S. DOL", url: "https://www.osha.gov/" },
    ],
    masteryStages: fourStageTemplate("Tailoring & Sewing", "Textile Safety", "Hems, Seams & Press-Every-Join Discipline", "Flat Pattern Drafting, Darts & Jacket Canvas", "Bespoke Fittings & Alterations Pricing"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Healthcare & Nursing": {
    category: "Healthcare & Nursing",
    onetSocCode: "29-1141.00",
    onetTitle: "Registered Nurses",
    onetUrl: "https://www.onetonline.org/link/summary/29-1141.00",
    blsMedianPay: "$97,550 / yr",
    blsGrowth2025_2035: "+6% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/healthcare/registered-nurses.htm",
    entryPathway: "ADN or BSN Degree + Clinical Rotations + NCSBN NCLEX-RN Licensure",
    careerLadder: ["CNA / LPN Foundation", "Registered Nurse (BSN, RN)", "Critical Care (CCRN) / Nurse Practitioner"],
    prerequisites: ["Anatomy & Physiology + Microbiology", "AHA BLS CPR certification", "Dosage math & aseptic hand hygiene"],
    starterKitSummary: "Dual-head acoustic stethoscope, sphygmomanometer cuff, penlight, pulse oximeter, watch with second hand, clinical scrubs",
    governingStandards: [
      { title: "NCSBN Next-Gen NCLEX Test Plan", authority: "National Council of State Boards of Nursing", url: "https://www.nclex.com/", kind: "Certification Blueprint" },
      { title: "HIPAA Privacy Rule & CDC Infection Control", authority: "U.S. HHS / CDC", url: "https://www.cdc.gov/infection-control/", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "OpenStax Nursing Pharmacology & Anatomy Texts", authority: "OpenStax (Rice University)", url: "https://openstax.org/subjects/nursing", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Healthcare & Clinical TAACCCT Library", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Registered Nurse Licensure (NCLEX-RN)", code: "RN-NCLEX", authority: "NCSBN / State Board", url: "https://www.nclex.com/" },
      { name: "AACN Critical Care Registered Nurse", code: "CCRN", authority: "AACN", url: "https://www.aacn.org/" },
    ],
    masteryStages: fourStageTemplate("Healthcare & Nursing", "CDC Asepsis / HIPAA", "Vital Signs, Assessment & ABC Triage", "Pharmacology, IV Therapy & Acute Care Labs", "Clinical Leadership & Specialty Board Prep"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Software & AI": {
    category: "Software & AI",
    onetSocCode: "15-1252.00",
    onetTitle: "Software Developers & AI Engineers",
    onetUrl: "https://www.onetonline.org/link/summary/15-1252.00",
    blsMedianPay: "$135,980 / yr",
    blsGrowth2025_2035: "+10%+ (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm",
    entryPathway: "CS / Open Curriculum + Production Git Portfolio + Cloud/AI Certifications",
    careerLadder: ["Junior Engineer / AI Builder", "Senior Full-Stack & Agent Architect", "Principal Engineer / VP AI"],
    prerequisites: ["Git version control & Unix CLI fluency", "Python or TypeScript typed programming", "HTTP/REST & SQL database basics"],
    starterKitSummary: "Git CLI, VS Code / terminal IDE, Python 3.12+ / Node 20+, Docker, unit test runner & curl/OpenAPI",
    governingStandards: [
      { title: "NIST AI Risk Management Framework (AI 100-1 & 600-1)", authority: "NIST Trustworthy & Responsible AI", url: "https://www.nist.gov/itl/ai-risk-management-framework", kind: "Official Standard" },
      { title: "Model Context Protocol (MCP) & OWASP GenAI Top 10", authority: "MCP / OWASP Foundation", url: "https://genai.owasp.org/", kind: "Official Standard" },
      { title: "ISO/IEC 42001 AI Management System Standard", authority: "ISO/IEC", url: "https://www.iso.org/standard/81230.html", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "MIT OpenCourseWare 6.0001 / Deep Learning & Linear Algebra", authority: "MIT OCW", url: "https://ocw.mit.edu/", kind: "Open Textbook / OER" },
      { title: "Stanford CS224N: NLP with Deep Learning", authority: "Stanford University", url: "http://web.stanford.edu/class/cs224n/", kind: "Open Textbook / OER" },
      { title: "Hugging Face LLM & Agents Open Courses", authority: "Hugging Face", url: "https://huggingface.co/learn", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "AWS Certified Machine Learning / AI Practitioner", code: "AIF-C01 / MLS-C01", authority: "AWS", url: "https://aws.amazon.com/certification/" },
      { name: "Anthropic Claude Certified Architect Foundations", code: "CCAR-F", authority: "Anthropic", url: "https://docs.anthropic.com/" },
    ],
    masteryStages: fourStageTemplate("Software & AI", "OWASP / NIST AI RMF", "Algorithms, Python/TS & Git Workflows", "Transformers, Vector RAG & MCP Tool Agents", "Distributed Systems, Eval Benchmarks & Production CI/CD"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Cybersecurity & IT": {
    category: "Cybersecurity & IT",
    onetSocCode: "15-1212.00",
    onetTitle: "Information Security Analysts",
    onetUrl: "https://www.onetonline.org/link/summary/15-1212.00",
    blsMedianPay: "$129,180 / yr",
    blsGrowth2025_2035: "+21% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm",
    entryPathway: "CompTIA Network+/Security+ -> SOC Analyst Tier 1 -> CISSP / CISM Architect",
    careerLadder: ["SOC Tier 1 / SysAdmin", "Penetration Tester / Threat Hunter", "Principal Security Architect / CISO"],
    prerequisites: ["TCP/IP & DNS packet literacy", "Linux & Windows AD CLI basics", "Written lab scope authorization discipline"],
    starterKitSummary: "Wireshark/tshark, Linux VM, Nmap/Burp/OWASP ZAP, OpenSSL, SIEM/KQL query console & hardware FIDO2 key",
    governingStandards: [
      { title: "NIST Cybersecurity Framework (CSF) 2.0 & SP 800-53r5", authority: "NIST CSRC", url: "https://csrc.nist.gov/pubs/sp/800/53/r5/final", kind: "Regulatory Code" },
      { title: "CISA Zero Trust Maturity Model v2.0", authority: "U.S. CISA", url: "https://www.cisa.gov/zero-trust-maturity-model", kind: "Official Standard" },
      { title: "MITRE ATT&CK v16 & MITRE ATLAS", authority: "MITRE Corporation", url: "https://atlas.mitre.org/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "OWASP Top 10 & ASVS Security Guides", authority: "OWASP Foundation", url: "https://owasp.org/www-project-top-ten/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Cybersecurity & Linux TAACCCT Labs", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "ISC2 CISSP (8 Domains)", code: "CISSP-2024", authority: "ISC2", url: "https://www.isc2.org/certifications/cissp" },
      { name: "CompTIA Security+ & SecAI+", code: "SY0-701 / CY0-001", authority: "CompTIA", url: "https://www.comptia.org/certifications" },
    ],
    masteryStages: fourStageTemplate("Cybersecurity & IT", "Rules of Engagement / IAM", "CIA Triad, Packet Analysis & Log Triage", "Zero Trust, Threat Hunting & Red/Blue Labs", "SOC Automation, GRC Audits & Board Advisory"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Finance & Business": {
    category: "Finance & Business",
    onetSocCode: "13-2011.00",
    onetTitle: "Accountants, Financial Analysts & Trade Contractors",
    onetUrl: "https://www.onetonline.org/link/summary/13-2011.00",
    blsMedianPay: "$81,680–$102,000+ / yr",
    blsGrowth2025_2035: "+6%–9% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm",
    entryPathway: "Job Costing & Accounting Foundations -> CPA / CFA / Master Trade Owner",
    careerLadder: ["Bookkeeper / Estimator", "Financial Controller / Project Estimator", "CFO / Multi-Crew Business Owner"],
    prerequisites: ["Spreadsheets (margins vs. markups)", "Cash flow vs. accrual accounting literacy", "Separate business ledger discipline"],
    starterKitSummary: "Double-entry ledger template, job-costing & margin calculator, written Change Order contract, tax reserve account",
    governingStandards: [
      { title: "US GAAP / FASB Codification & NASBA CPE", authority: "FASB / NASBA", url: "https://www.nasbaregistry.org/", kind: "Regulatory Code" },
      { title: "SBA Guide to Small Business Financial Management", authority: "U.S. SBA", url: "https://www.sba.gov/", kind: "Government Labor Data" },
    ],
    openTextbooksAndOer: [
      { title: "OpenStax Principles of Finance & Accounting", authority: "OpenStax (Rice University)", url: "https://openstax.org/subjects/business", kind: "Open Textbook / OER" },
      { title: "MIT OCW Finance & Valuation Lectures", authority: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "AICPA Certified Public Accountant (CPA)", code: "CPA", authority: "AICPA / NASBA", url: "https://www.aicpa-cima.com/" },
      { name: "CFA Charterholder", code: "CFA I–III", authority: "CFA Institute", url: "https://www.cfainstitute.org/" },
    ],
    masteryStages: fourStageTemplate("Finance & Business", "GAAP / Tax Compliance", "Cash Flow, Job Costing & Overhead Recovery", "Valuation, Working Capital & SOW Pricing", "Margin Expansion & Scalable Team Payroll"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Law & Legal": {
    category: "Law & Legal",
    onetSocCode: "23-2011.00",
    onetTitle: "Paralegals, Legal Assistants & Compliance Specialists",
    onetUrl: "https://www.onetonline.org/link/summary/23-2011.00",
    blsMedianPay: "$61,010–$145,760 / yr",
    blsGrowth2025_2035: "+4%–6% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/legal/paralegals-and-legal-assistants.htm",
    entryPathway: "ABA Legal Studies / Paralegal Cert -> JD / Regulatory & Contract Counsel",
    careerLadder: ["Legal Assistant / Contract Coordinator", "Senior Paralegal / Compliance Officer", "Licensed Attorney / General Counsel"],
    prerequisites: ["Primary statutory & case verification discipline", "Zero AI-hallucinated citation check rule", "Strict client confidentiality"],
    starterKitSummary: "Primary statute portal (eCFR/Congress), contract clause checklist, conflict check ledger, verifiable citation index",
    governingStandards: [
      { title: "eCFR Electronic Code of Federal Regulations", authority: "U.S. National Archives / GPO", url: "https://www.ecfr.gov/", kind: "Regulatory Code" },
      { title: "ABA Model Rules of Professional Conduct", authority: "American Bar Association", url: "https://www.americanbar.org/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "OpenStax Business Law I Essentials", authority: "OpenStax (Rice University)", url: "https://openstax.org/subjects/business", kind: "Open Textbook / OER" },
      { title: "Cornell LII Open Law Library", authority: "Cornell Legal Information Institute", url: "https://www.law.cornell.edu/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "NALA Certified Paralegal", code: "CP®", authority: "NALA", url: "https://nala.org/" },
      { name: "IAPP Privacy & AI Governance (AIGP)", code: "CIPP / AIGP", authority: "IAPP", url: "https://iapp.org/certify/" },
    ],
    masteryStages: fourStageTemplate("Law & Legal", "Client Confidentiality", "Contract Formation, Scope & Risk Clauses", "Primary Statute Research & Evidence Trails", "Compliance Governance & Dispute Resolution"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Creative Media & Design": {
    category: "Creative Media & Design",
    onetSocCode: "27-1014.00",
    onetTitle: "Special Effects Artists, Animators & Multimedia Designers",
    onetUrl: "https://www.onetonline.org/link/summary/27-1014.00",
    blsMedianPay: "$65,000–$99,800 / yr",
    blsGrowth2025_2035: "+4%–8% (Strong AI/3D pipeline demand)",
    blsUrl: "https://www.bls.gov/ooh/arts-and-design/special-effects-artists-and-animators.htm",
    entryPathway: "Showreel Portfolio -> Studio / Brand Production Designer -> Creative Director",
    careerLadder: ["Junior Editor / 3D Modeler", "Senior Motion & 3D Artist", "Creative Director / Studio Lead"],
    prerequisites: ["Exposure triangle & 3-point lighting basics", "3-2-1 backup discipline for client media", "Commercial font/music IP licensing"],
    starterKitSummary: "Blender 4.x / NLE suite, color-calibrated monitor, dual SSD backup, audio -12dB meter, C2PA provenance workflow",
    governingStandards: [
      { title: "C2PA Content Credentials & Authenticity Spec", authority: "Coalition for Content Provenance", url: "https://c2pa.org/", kind: "Official Standard" },
      { title: "WCAG 2.2 Visual Contrast & Accessibility", authority: "W3C", url: "https://www.w3.org/WAI/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "Blender Foundation Official Open Manuals & Open Movies", authority: "Blender Foundation", url: "https://docs.blender.org/", kind: "Open Textbook / OER" },
      { title: "OpenStax Design & Media OER Collections", authority: "OpenStax / OER Commons", url: "https://www.oercommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "Adobe Certified Professional", code: "ACP-CC", authority: "Adobe / Certiport", url: "https://certiport.pearsonvue.com/" },
      { name: "WCAG Accessibility & UX Specialist", code: "IAAP-WAS", authority: "IAAP", url: "https://www.accessibilityassociation.org/" },
    ],
    masteryStages: fourStageTemplate("Creative Media", "Copyright & Hearing Safe", "Composition, Exposure & Topology Modeling", "Key/Fill Lighting, Color Grading & Sound", "Client Brand Systems & Retainer Packaging"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Telecom & Fiber Optics": {
    category: "Telecom & Fiber Optics",
    onetSocCode: "49-2022.00",
    onetTitle: "Telecommunications Equipment Installers & Fiber Technicians",
    onetUrl: "https://www.onetonline.org/link/summary/49-2022.00",
    blsMedianPay: "$64,200–$82,000+ / yr",
    blsGrowth2025_2035: "+6%–8% (AI Data Center & FTTH buildout)",
    blsUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/telecommunications-equipment-installers-and-repairers-except-line-installers.htm",
    entryPathway: "FOA CFOT / BICSI Installer 1 -> Fiber Splicer & Data Center Network Engineer",
    careerLadder: ["Structured Cabling Tech", "Fiber Fusion Splicer / NOC Tech", "BICSI RCDD Infrastructure Architect"],
    prerequisites: ["Laser eye safety & locked fiber shard bin protocol", "TIA-568A/B pinout mastery", "TCP/IP subnetting & DNS basics"],
    starterKitSummary: "Cat6/6A crimper, fiber cleaver & locked shard bin, visual fault locator (VFL), optical power meter, one-click cleaners",
    governingStandards: [
      { title: "ANSI/TIA-568 Structured Cabling & FOA Fiber Standards", authority: "TIA / Fiber Optic Association", url: "https://www.thefoa.org/tech/ref/", kind: "Official Standard" },
      { title: "Wireshark & IETF RFC 9293 (TCP/IP) Protocol Specs", authority: "IETF / Wireshark", url: "https://www.wireshark.org/docs/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "The FOA Guide to Fiber Optics & Premises Cabling", authority: "The Fiber Optic Association (Free Online)", url: "https://www.thefoa.org/tech/ref/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Broadband, Fiber & CompTIA Net+ Labs", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "FOA Certified Fiber Optic Technician", code: "FOA-CFOT", authority: "Fiber Optic Association", url: "https://www.thefoa.org/" },
      { name: "CompTIA Network+ & BICSI TECH", code: "N10-009 / BICSI", authority: "CompTIA / BICSI", url: "https://www.bicsi.org/" },
    ],
    masteryStages: fourStageTemplate("Telecom & Fiber", "Fiber Shard & Ladder Safety", "TIA-568 Termination & Clean-Inspect-Test", "Fusion Splicing, OTDR Loss & BGP/VLAN Routing", "Data Center Structured Builds & SLA Sign-Off"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Aviation & Maritime": {
    category: "Aviation & Maritime",
    onetSocCode: "49-3011.00",
    onetTitle: "Aircraft Mechanics, Service Technicians & Maritime Engineers",
    onetUrl: "https://www.onetonline.org/link/summary/49-3011.00",
    blsMedianPay: "$79,140–$98,000+ / yr",
    blsGrowth2025_2035: "+5%–7% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/installation-maintenance-and-repair/aircraft-and-avionics-equipment-mechanics-and-technicians.htm",
    entryPathway: "FAA Part 147 School or 30 Mo OJT -> FAA A&P Mechanic Certificate / USCG MMC",
    careerLadder: ["Airframe Apprentice", "Licensed FAA A&P / Marine Engineer", "Lead IA Inspector / Chief Engineer"],
    prerequisites: ["Zero-FOD tool accountability", "strict adherence to OEM AMM revision", "CRM closed-loop verification"],
    starterKitSummary: "Safety-wire pliers, calibrated torque wrench, inspection mirror/boroscope, FAA 8083 handbooks, ear protection",
    governingStandards: [
      { title: "FAA 14 CFR Part 43 & Aviation Maintenance Handbooks (8083)", authority: "U.S. Federal Aviation Administration", url: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation", kind: "Regulatory Code" },
      { title: "USCG STCW / Maritime Safety Regulations", authority: "U.S. Coast Guard / IMO", url: "https://www.dco.uscg.mil/", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "FAA Official Aviation Maintenance Free PDF Handbooks", authority: "U.S. FAA (Public Domain)", url: "https://www.faa.gov/regulations_policies/handbooks_manuals/aviation", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Aerospace Manufacturing & A&P Courses", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "FAA Airframe & Powerplant Mechanic", code: "FAA-A&P", authority: "U.S. FAA", url: "https://www.faa.gov/mechanics" },
      { name: "Inspection Authorization (IA)", code: "FAA-IA", authority: "U.S. FAA", url: "https://www.faa.gov/" },
    ],
    masteryStages: fourStageTemplate("Aviation & Maritime", "Zero-FOD / 14 CFR 43", "Preflight Checklists, Safety Wiring & Torque", "Powerplant, Avionics & CRM Diagnostics", "Logbook Return-to-Service & IA Leadership"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Science & Lab Tech": {
    category: "Science & Lab Tech",
    onetSocCode: "19-4031.00",
    onetTitle: "Chemical, Biological & Laboratory Technicians",
    onetUrl: "https://www.onetonline.org/link/summary/19-4031.00",
    blsMedianPay: "$56,800–$72,000 / yr",
    blsGrowth2025_2035: "+5% (Faster than average)",
    blsUrl: "https://www.bls.gov/ooh/life-physical-and-social-science/chemical-technicians.htm",
    entryPathway: "Associate Science / Biotech Cert -> QA/QC Lab Analyst -> Senior Research Scientist",
    careerLadder: ["Lab Prep Assistant", "QA/QC Analytical Technician", "Lab Director / Principal Scientist"],
    prerequisites: ["GHS SDS chemical incompatibility reading", "Significant figures & molarity dilution math", "Fume hood & splash PPE"],
    starterKitSummary: "ANSI chemical splash goggles, nitrile gloves, micropipette calibration log, Class A glassware, pH buffer standards",
    governingStandards: [
      { title: "OSHA 29 CFR 1910.1450 Laboratory Chemical Hygiene Plan", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/laboratories", kind: "Regulatory Code" },
      { title: "ISO/IEC 17025 Testing & Calibration Lab Competence", authority: "ISO / NIST", url: "https://www.nist.gov/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "OpenStax Chemistry 2e, Biology 2e & University Physics", authority: "OpenStax (Rice University)", url: "https://openstax.org/subjects/science", kind: "Open Textbook / OER" },
      { title: "MIT OpenCourseWare Quantitative Biology & Lab Sciences", authority: "MIT OCW", url: "https://ocw.mit.edu/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "ASCP Medical Laboratory Technician", code: "MLT(ASCP)", authority: "ASCP Board of Certification", url: "https://www.ascp.org/" },
      { name: "NRCC Chemical Hygiene Officer", code: "NRCC-CHO", authority: "NRCC", url: "https://nrcc6.org/" },
    ],
    masteryStages: fourStageTemplate("Science & Lab Tech", "OSHA 1910.1450", "Pipetting Calibration, Molarity & SDS Handling", "Spectroscopy, Titration & ISO 17025 Controls", "SOP Validation & Reproducible Audit Reports"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Education & Training": {
    category: "Education & Training",
    onetSocCode: "13-1151.00",
    onetTitle: "Training & Development Specialists / CTE Instructors",
    onetUrl: "https://www.onetonline.org/link/summary/13-1151.00",
    blsMedianPay: "$65,850–$84,000 / yr",
    blsGrowth2025_2035: "+11% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/business-and-financial/training-and-development-specialists.htm",
    entryPathway: "Subject-Matter Mastery + ADDIE Instructional Design + Workforce Coaching Credential",
    careerLadder: ["Peer Shop Mentor", "Technical Trainer / CTE Instructor", "Director of Learning & Workforce Development"],
    prerequisites: ["Bloom's Taxonomy measurable objective writing", "Clear visual demonstration without jargon", "Rubric fairness"],
    starterKitSummary: "ADDIE design canvas, formative 1-question check template, printable job-aid guide, workshop timer & facilitation prompts",
    governingStandards: [
      { title: "ATD Talent Development Capability Model & UDL Guidelines", authority: "ATD / CAST UDL", url: "https://udlguidelines.cast.org/", kind: "Official Standard" },
      { title: "Perkins V Career & Technical Education Framework", authority: "U.S. Dept. of Education", url: "https://cte.ed.gov/", kind: "Regulatory Code" },
    ],
    openTextbooksAndOer: [
      { title: "BCcampus Teaching & Instructional Design Open Guides", authority: "BCcampus Open Education", url: "https://open.bccampus.ca/find-open-textbooks/", kind: "Open Textbook / OER" },
      { title: "SkillsCommons Instructor Toolkits & Assessment Banks", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "ATD Certified Professional in Talent Development", code: "CPTD", authority: "ATD", url: "https://www.td.org/certification" },
      { name: "NCCER Certified Trade Instructor", code: "NCCER-INST", authority: "NCCER", url: "https://www.nccer.org/" },
    ],
    masteryStages: fourStageTemplate("Education & Training", "Lab & Workshop Safety", "Outcome Mapping & Micro-Demo Structuring", "Formative Checks, Visual Props & Active Coaching", "Program ROI Metrics & Curriculum Publishing"),
    lastAuditedLabel: AUDITED_DATE,
  },
  "Safety & Civic Ops": {
    category: "Safety & Civic Ops",
    onetSocCode: "19-5011.00",
    onetTitle: "Occupational Health & Safety Specialists & Emergency Responders",
    onetUrl: "https://www.onetonline.org/link/summary/19-5011.00",
    blsMedianPay: "$79,160 / yr",
    blsGrowth2025_2035: "+14% (Much faster than average)",
    blsUrl: "https://www.bls.gov/ooh/healthcare/occupational-health-and-safety-specialists-and-technicians.htm",
    entryPathway: "OSHA 30 / FEMA ICS-100/200 -> ASP/CSP Safety Specialist or Civic Operations Lead",
    careerLadder: ["Safety Monitor / Hazmat Tech", "EHS Specialist (ASP / CHST)", "Certified Safety Professional (CSP)"],
    prerequisites: ["Hierarchy of Controls (Elimination -> PPE)", "JSA Job Hazard Analysis writing", "ICS command chain discipline"],
    starterKitSummary: "JSA clipboard & cone perimeter kit, GFCI tester, calibrated 4-gas O2/LEL/CO/H2S monitor, trauma/AED kit, high-vis ANSI vest",
    governingStandards: [
      { title: "OSHA 29 CFR 1910 General Industry & 1926 Construction", authority: "U.S. DOL (OSHA)", url: "https://www.osha.gov/laws-regs", kind: "Regulatory Code" },
      { title: "FEMA NIMS / ICS Emergency Management Standards", authority: "FEMA EMI", url: "https://training.fema.gov/nims/", kind: "Official Standard" },
    ],
    openTextbooksAndOer: [
      { title: "OSHA Free Training & Hazard Prevention Publications", authority: "U.S. DOL (Public Domain)", url: "https://www.osha.gov/publications", kind: "Open Textbook / OER" },
      { title: "SkillsCommons EHS, First Responder & Sanitation OER", authority: "SkillsCommons (U.S. DOL)", url: "https://www.skillscommons.org/", kind: "Open Textbook / OER" },
    ],
    officialCredentials: [
      { name: "BCSP Certified Safety Professional", code: "CSP / ASP / CHST", authority: "Board of Certified Safety Professionals", url: "https://www.bcsp.org/" },
      { name: "OSHA 30-Hour Authorized Outreach", code: "OSHA-30", authority: "U.S. DOL", url: "https://www.osha.gov/training/outreach" },
    ],
    masteryStages: fourStageTemplate("Safety & Civic Ops", "OSHA 1910/1926 & ICS", "Scene Size-Up, LOTO & Hierarchy of Controls", "JSA Hazard Audits, Air Monitoring & Hygiene", "Site Safety Directorship & Zero-Incident Culture"),
    lastAuditedLabel: AUDITED_DATE,
  },
}

export function getProfessionTruthBlueprint(
  category: SkilledTradesCategory
): ProfessionTruthBlueprint {
  return PROFESSION_TRUTH_BLUEPRINTS[category] || PROFESSION_TRUTH_BLUEPRINTS.Carpentry
}

export function getCrossPlatformStudyLinks(topic: string): Array<{
  id: string
  label: string
  authority: string
  url: string
}> {
  const q = encodeURIComponent((topic || "Skilled Trades Engineering").trim())
  return [
    {
      id: "oreilly",
      label: "O'Reilly Books",
      authority: "O'Reilly Media",
      url: `https://www.oreilly.com/search/?q=${q}`,
    },
    {
      id: "linkedin_learning",
      label: "LinkedIn Learning",
      authority: "LinkedIn",
      url: `https://www.linkedin.com/learning/search?keywords=${q}`,
    },
    {
      id: "coursera",
      label: "Coursera",
      authority: "Coursera",
      url: `https://www.coursera.org/search?query=${q}`,
    },
    {
      id: "edx",
      label: "edX",
      authority: "edX / 2U",
      url: `https://www.edx.org/search?q=${q}`,
    },
    {
      id: "mit_ocw",
      label: "MIT OCW",
      authority: "MIT OpenCourseWare",
      url: `https://ocw.mit.edu/search/?q=${q}`,
    },
    {
      id: "skillscommons",
      label: "SkillsCommons OER",
      authority: "U.S. Dept. of Labor",
      url: `https://www.skillscommons.org/discover?query=${q}`,
    },
    {
      id: "openstax",
      label: "OpenStax Free Texts",
      authority: "Rice University",
      url: `https://openstax.org/subjects`,
    },
    {
      id: "github",
      label: "GitHub Code Labs",
      authority: "GitHub",
      url: `https://github.com/search?q=${q}&type=repositories`,
    },
  ]
}
