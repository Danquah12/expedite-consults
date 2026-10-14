export interface ProfessionTool {
  name: string
  icon: string
  description: string
  badge?: string
}

export interface ProfessionDefinition {
  id: string
  title: string
  enclaveId: string
  categoryName: string
  defaultHeadline: string
  typicalSkills: string[]
  tools: ProfessionTool[]
}

export interface ProfessionEnclave {
  id: string
  name: string
  shortName: string
  icon: string
  tagline: string
  description: string
  themeColor: string
  accentBorder: string
  badgeBg: string
  badgeText: string
  feedTags: string[]
  securityClearanceTier: string
  professions: ProfessionDefinition[]
}

export const PROFESSION_ENCLAVES: ProfessionEnclave[] = [
  // ─── 1. SKILLED TRADES, CONSTRUCTION & CRAFTSMANSHIP ───────────
  {
    id: "trades_construction",
    name: "Skilled Trades, Construction & Craftsmanship",
    shortName: "Trades & Craftsmanship",
    icon: "🔨",
    tagline: "Job site blueprints, custom millwork, subcontractor RFPs, OSHA compliance & material markets",
    description: "Dedicated workspace for carpenters, master joiners, general contractors, electricians, plumbers, and craftspeople. Isolated from corporate tech environments.",
    themeColor: "from-amber-600 to-orange-700",
    accentBorder: "border-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badgeText: "text-amber-800 dark:text-amber-300",
    securityClearanceTier: "Master Tradesman & Site Superintendent (Level 2)",
    feedTags: ["#Carpentry", "#Construction", "#Woodworking", "#Framing", "#TradeTools", "#OSHAGuidelines", "#SubcontractorBids", "#LumberMarket", "#Millwork", "#Welding"],
    professions: [
      {
        id: "carpenter",
        title: "Master Carpenter (Heavy Timber & Joinery)",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Carpenter · Heavy Timber Framing, Custom Joinery & Job-Site Superintendent",
        typicalSkills: ["Timber Framing", "Architectural Joinery", "CNC Woodworking", "Blueprints & CAD", "OSHA 30", "Cabinetry", "Tool Rigging"],
        tools: [
          { name: "Blueprint & CAD Spec Viewer", icon: "📐", description: "Architectural drawings, load-bearing specs & timber takeoff sheets", badge: "Active" },
          { name: "Lumber & Material Cost Index", icon: "🌲", description: "Real-time 2x4 framing, plywood & exotic hardwood market futures", badge: "Live Data" },
          { name: "Subcontractor RFP & Job Board", icon: "📋", description: "Residential framing bids, commercial millwork & punch lists", badge: "8 Bids Open" },
          { name: "Tool & Equipment Vault", icon: "🧰", description: "Festool Domino, DeWalt rig calibrations & tool maintenance logs", badge: "Verified" },
          { name: "OSHA Fall Protection Locker", icon: "🦺", description: "Daily job-site safety checklists, harness inspections & toolbox talks", badge: "OSHA 30" }
        ]
      },
      {
        id: "finish_carpenter",
        title: "Master Finish & Architectural Trim Carpenter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Finish Carpenter · Custom Coffered Ceilings, Wainscoting & Curved Staircases",
        typicalSkills: ["Architectural Millwork", "Crown Molding", "Coped Joints", "Curved Staircases", "Festool Miter Rig", "Wainscoting", "Veneer Inlay"],
        tools: [
          { name: "Custom Millwork Angle & Crown Calc", icon: "📐", description: "Compound miter pitch, bevel settings & spring angle tables", badge: "Precision" },
          { name: "Festool Precision Tool Locker", icon: "🧰", description: "Track saws, Domino tenons, dust extraction & laser guide calibration", badge: "Calibrated" },
          { name: "Fine Hardwood Species Specifier", icon: "🪵", description: "Moisture content meters, expansion allowances & stain matching logs", badge: "Specs" }
        ]
      },
      {
        id: "commercial_framing_carpenter",
        title: "Heavy Commercial Framing & Formwork Carpenter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Commercial Framing Superintendent · Glulam Trusses, Heavy Timber & Gang Forms",
        typicalSkills: ["Heavy Timber Glulam", "Symons Concrete Forms", "Metal Stud Framing", "Laser Transit Leveling", "OSHA Scaffold Rigging"],
        tools: [
          { name: "Total Station & Laser Transit", icon: "🔭", description: "3D datum elevation leveling and structural column plumb verification", badge: "Millimeter Accuracy" },
          { name: "Glulam & Truss Load Calculator", icon: "🏗️", description: "Moment capacity, deflection limits & hurricane uplift tie-down schedule", badge: "Calculators" }
        ]
      },
      {
        id: "cabinetmaker",
        title: "Master Cabinetmaker & Architectural Millwork Artisan",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Cabinetmaker · Hand-Cut Dovetails, Custom Kitchen Islands & CNC Joinery",
        typicalSkills: ["Mortise & Tenon", "Dovetail Joinery", "CNC Wood Carving", "Vacuum Press Veneering", "High-End Finishes", "Hardware Geometry"],
        tools: [
          { name: "Joinery & Cut-List Optimizer", icon: "🪚", description: "Automated sheet yield, kerf allowance & grain-matched layout engine", badge: "CAD/CAM" },
          { name: "Blum Hardware & Runner Template", icon: "🔩", description: "Undermount soft-close slide clearances & concealed hinge bore patterns", badge: "Templates" }
        ]
      },
      {
        id: "general_contractor",
        title: "General Contractor / Construction Superintendent",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Licensed General Contractor · Commercial Buildouts, Permits & Subcontractor PM",
        typicalSkills: ["General Contracting", "OSHA Safety", "Subcontractor Vetting", "Cost Estimation", "Permit Acquisition", "Schedule Management"],
        tools: [
          { name: "Job-Site Manifest & Permits", icon: "🏗️", description: "City permit inspection scheduling, structural sign-offs & municipal approvals", badge: "Active" },
          { name: "Subcontractor Escrow & Draws", icon: "💳", description: "Milestone-based progress disbursements & lien waiver tracker", badge: "Escrow" },
          { name: "Commercial Bid Estimator", icon: "📊", description: "RSMeans cost index and takeoff spreadsheets for commercial bids", badge: "RSMeans" }
        ]
      },
      {
        id: "electrician",
        title: "Licensed Master Electrician",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Electrician · High-Voltage Distribution, Industrial Panels & Automation",
        typicalSkills: ["NEC Code Compliance", "Panel Upgrades", "Industrial Conduit", "Three-Phase Power", "Safety Lockout", "VFD Programming"],
        tools: [
          { name: "NEC 2026 Code Lookup & Calculator", icon: "⚡", description: "Conduit fill, voltage drop calculations & single-line schematics", badge: "NEC 2026" },
          { name: "Arc-Flash Safety Boundaries", icon: "⚠️", description: "NFPA 70E compliance calculation and PPE requirement matrix", badge: "NFPA 70E" }
        ]
      },
      {
        id: "plumber",
        title: "Master Plumber & Pipefitter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Plumber · Commercial Hydronics, Gas Lines & Backflow Prevention",
        typicalSkills: ["Commercial Plumbing", "Hydronics", "Medical Gas Lines", "PEX/Copper Systems", "Backflow Certification"],
        tools: [
          { name: "Hydronic Sizing & Pressure Calc", icon: "🚰", description: "Flow rate (GPM), friction loss and pump head sizing calculator", badge: "Calculators" },
          { name: "Backflow Certification Log", icon: "📋", description: "Annual RPZ device inspection records and municipal reporting", badge: "Compliant" }
        ]
      },
      {
        id: "hvac_technician",
        title: "HVAC/R Master Technician & Controls Lead",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "HVAC/R Specialist · Commercial Chillers, VRF Systems & Building Automation",
        typicalSkills: ["EPA Universal 608", "Chillers", "VRF Heat Recovery", "BACnet Controls", "Psychrometrics"],
        tools: [
          { name: "Psychrometric & Load Calc", icon: "❄️", description: "Manual J/N commercial cooling tonnage & airflow diagnostics", badge: "ASHRAE" }
        ]
      },
      {
        id: "welder_fabricator",
        title: "AWS Certified Master Welder & Structural Fabricator",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Certified Structural Welder (AWS D1.1 / ASME IX) · TIG Exotic Alloys & Ironwork",
        typicalSkills: ["TIG (GTAW)", "MIG (GMAW)", "Stick (SMAW)", "Pipe 6G Position", "Chromoly/Titanium", "NDT Testing", "AWS D1.1 Code"],
        tools: [
          { name: "WPS Welding Procedure Spec Vault", icon: "🔥", description: "Preheated joint geometry, shielding gas mix & heat input logs", badge: "AWS Code" },
          { name: "Non-Destructive Testing (NDT) Log", icon: "🛡️", description: "Radiographic, ultrasonic & dye penetrant joint inspection records", badge: "Certified" }
        ]
      },
      {
        id: "heavy_equipment_operator",
        title: "Heavy Equipment & Crane Rigging Operator",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "NCCCO Certified Crane & Heavy Machinery Operator · Earthmoving & Deep Trenching",
        typicalSkills: ["NCCCO Mobile Crane", "GPS Grade Lasers", "Excavator Trenching", "Load Moment Charts", "OSHA Subpart CC", "Rigging Math"],
        tools: [
          { name: "Crane Radius & Load Moment Chart", icon: "🚜", description: "Boom angle, counterweight deductions & gross capacity calculator", badge: "NCCCO" }
        ]
      }
    ]
  },

  // ─── 2. AUTOMOTIVE TECHNOLOGY & FLEET MECHANICS ───────────────
  {
    id: "automotive_mechanics",
    name: "Automotive Technology, Master Diagnostics & Fleet Maintenance",
    shortName: "Auto & Fleet Mechanics",
    icon: "🔧",
    tagline: "OBD-II CAN bus telemetry, Snap-on diagnostics, EV powertrain safety & heavy diesel fleet repairs",
    description: "Dedicated workspace for ASE master mechanics, diesel fleet technicians, EV powertrain specialists, and collision reconstruction experts. Completely omitted by traditional corporate platforms.",
    themeColor: "from-rose-600 via-red-700 to-amber-700",
    accentBorder: "border-rose-500",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    badgeText: "text-rose-800 dark:text-rose-300",
    securityClearanceTier: "ASE Master Diagnostic Specialist (Level 2)",
    feedTags: ["#AutoMechanic", "#ASEMasterTech", "#DieselMechanic", "#EVPowertrain", "#CANBusDiagnostics", "#SnapOn", "#FleetMaintenance", "#CollisionRepair", "#Cummins"],
    professions: [
      {
        id: "master_auto_mechanic",
        title: "ASE Master Automotive Technician / Diagnostic Specialist",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive Technology & Mechanics",
        defaultHeadline: "ASE Master Auto Technician (A1-A9) · Advanced CAN-Bus Oscilloscope & Engine Diagnostics",
        typicalSkills: ["CAN-Bus Diagnostics", "OBD-II Scopes", "Engine Rebuilds", "Snap-on Modis", "Transmission Overhaul", "ALLDATA Schematics", "Emissions"],
        tools: [
          { name: "OBD-II CAN-Bus Oscilloscope", icon: "💻", description: "Live waveform analysis, sensor jitter & module communication bus decoding", badge: "Scope Live" },
          { name: "Snap-on / Bosch Modis Telemetry", icon: "🔍", description: "DTC fault code clearing, bi-directional component actuation & fuel trim logs", badge: "Bi-Directional" },
          { name: "ALLDATA & Mitchell 1 Wiring Vault", icon: "📖", description: "Interactive pinout diagrams, OEM factory service bulletins & torque specs", badge: "ALLDATA OEM" },
          { name: "AC & R1234yf Refrigerant Vault", icon: "❄️", description: "EPA 609 certified recovery, vacuum decay leak test & manifold pressures", badge: "EPA 609" }
        ]
      },
      {
        id: "diesel_fleet_mechanic",
        title: "Heavy Duty Diesel & Commercial Fleet Master Mechanic",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive Technology & Mechanics",
        defaultHeadline: "Heavy Duty Diesel Technician · Cummins, Detroit Diesel, DPF/SCR & Air Brakes",
        typicalSkills: ["Cummins Insite", "Detroit Diesel DDL", "DPF/SCR Systems", "Air Brakes (FMCSA)", "Hydraulic PTOs", "Allison Transmissions"],
        tools: [
          { name: "Cummins Insite / J1939 Telemetry", icon: "🚚", description: "Commercial ECU flashing, injector calibration & forced DPF regen triggers", badge: "J1939 Live" },
          { name: "FMCSA Commercial Fleet Safety Locker", icon: "📋", description: "Annual DOT inspection logs, brake chamber stroke & slack adjuster checks", badge: "FMCSA DOT" },
          { name: "Hydraulic & PTO Pressure Bench", icon: "⚙️", description: "5,000 PSI high-pressure line test and valve manifold rebuild records", badge: "Hydraulics" }
        ]
      },
      {
        id: "ev_powertrain_technician",
        title: "High-Voltage EV & Hybrid Master Powertrain Technician",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive Technology & Mechanics",
        defaultHeadline: "EV/HEV Powertrain Specialist · 800V High-Voltage Battery Packs & Thermal Loops",
        typicalSkills: ["High-Voltage Safety (NFPA 70E)", "Lithium-Ion Cell Balancing", "Inverter Diagnostics", "Thermal Heat Pumps", "Megohmmeter Insulation"],
        tools: [
          { name: "800V High-Voltage Lockout Box", icon: "⚡", description: "Category IV 1000V insulation meter & manual service disconnect verification", badge: "NFPA 70E Safe" },
          { name: "Battery Cell Degradation & SOH", icon: "🔋", description: "Individual pouch/prismatic cell voltage variance & battery state of health", badge: "Telemetry" }
        ]
      },
      {
        id: "auto_body_collision_tech",
        title: "Collision Master Structural Repair & Refinish Specialist",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive Technology & Mechanics",
        defaultHeadline: "I-CAR Platinum Collision Technician · 3D Laser Frame Measuring & ADAS Calibration",
        typicalSkills: ["Laser Frame Alignment", "Structural Aluminum Welding", "ADAS Radar Calibration", "Waterborne Paint Refinish", "OEM Pull Specs"],
        tools: [
          { name: "Chief Laser 3D Frame Measurement", icon: "🚗", description: "Unibody datum point laser triangulation & frame bench hydraulic pull specs", badge: "3D Laser" },
          { name: "ADAS Dynamic Target Calibration", icon: "🎯", description: "Front radar, blind spot radar & windshield LiDAR sensor optical realignment", badge: "I-CAR Platinum" }
        ]
      }
    ]
  },

  // ─── 3. CLINICAL HEALTHCARE, MEDICINE & NURSING ───────────────
  {
    id: "healthcare_medicine",
    name: "Clinical Healthcare, Medicine, Nursing & Surgery",
    shortName: "Healthcare & Medicine",
    icon: "🩺",
    tagline: "Trauma triage, ICU protocols, sterile surgical rosters, PubMed trials & verified shift bidding",
    description: "Dedicated workspace for bedside registered nurses, trauma surgeons, nurse practitioners, anesthesiologists, and physicians. Designed for clinical shift workers without corporate social fluff.",
    themeColor: "from-emerald-600 via-teal-700 to-cyan-800",
    accentBorder: "border-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "HIPAA Clinical Practitioner Verified (Level 3)",
    feedTags: ["#Healthcare", "#Medicine", "#Nursing", "#TraumaSurgery", "#ERNurse", "#ClinicalTrials", "#Pharmacology", "#PatientCare", "#Cardiology", "#CRNA"],
    professions: [
      {
        id: "registered_nurse",
        title: "Critical Care Registered Nurse (CCRN / ICU)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Critical Care Registered Nurse (CCRN) · ICU Hemodynamics & Patient Advocacy",
        typicalSkills: ["Critical Care", "Patient Triage", "Emergency Response", "Medication Admin", "Clinical Documentation", "Ventilator Titration"],
        tools: [
          { name: "Shift Exchange & Scheduling", icon: "🕒", description: "Verified peer hospital shift marketplace with credential cross-checks", badge: "Hospital" },
          { name: "ICU Protocol Reference & Titration", icon: "📋", description: "Evidence-based ventilator weaning, sepsis bundles & pressor titration charts", badge: "Clinical" },
          { name: "State Nursing Board CEU Locker", icon: "🎖️", description: "Automated CEU contact hour tracking for state RN compact licenses", badge: "Active" }
        ]
      },
      {
        id: "er_trauma_nurse",
        title: "Emergency Room (ER) & Trauma Certified Nurse (TNCC)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "TNCC Trauma Nurse · Level 1 Trauma Center, Rapid Triage & Resuscitation",
        typicalSkills: ["TNCC Certified", "Rapid Sequence Intubation", "Massive Transfusion Protocol", "ACLS/PALS", "Ultrasound IV", "Cardiac Arrhythmia"],
        tools: [
          { name: "Level 1 Trauma Triage & ESI Matrix", icon: "🚨", description: "Emergency Severity Index 1-5 triage and trauma team mobilization", badge: "Trauma Ready" },
          { name: "Massive Transfusion & ACLS Timer", icon: "⏱️", description: "1:1:1 blood product ratio tracker & code blue epinephrine interval timer", badge: "Timer Live" }
        ]
      },
      {
        id: "nurse_practitioner",
        title: "Family Nurse Practitioner (FNP-BC / APRN)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Autonomous Practice Family Nurse Practitioner · Primary Care Diagnostics & Minor Surgery",
        typicalSkills: ["Primary Care Diagnostics", "Prescriptive Authority", "EHR Documentation", "Chronic Disease Management", "Joint Injections", "Suturing"],
        tools: [
          { name: "Prescription & DEA Formulary Guide", icon: "💊", description: "Renal adjustments, black-box warnings & multi-drug interaction checks", badge: "DEA Formulary" },
          { name: "Clinical Encounter Note Generator", icon: "📝", description: "SOAP note voice-to-text with automatic ICD-10 and CPT billing codes", badge: "SOAP Notes" }
        ]
      },
      {
        id: "crna_nurse_anesthetist",
        title: "Certified Registered Nurse Anesthetist (CRNA)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Doctor of Nurse Anesthesia Practice (CRNA) · General Anesthesia, Nerve Blocks & Airway",
        typicalSkills: ["General Anesthesia", "Ultrasound Nerve Blocks", "Arterial Lines", "Epidural Placement", "TEE Monitoring", "Anesthetic Gas Titration"],
        tools: [
          { name: "Anesthesia Vaporizer & MAC Calc", icon: "🫁", description: "Minimum alveolar concentration, tidal volume & gas flow analytics", badge: "Gas Analytics" },
          { name: "Hemodynamic FlowTrac Monitor", icon: "📈", description: "Continuous cardiac output, stroke volume variation & vasopressor titration", badge: "Hemodynamics" }
        ]
      },
      {
        id: "physician",
        title: "Board-Certified Attending Physician / Internist",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Board-Certified Physician · Clinical Research & Evidence-Based Therapeutics",
        typicalSkills: ["Internal Medicine", "Clinical Diagnostics", "Patient Care Protocols", "Medical Imaging", "HIPAA Compliance"],
        tools: [
          { name: "HIPAA Secure Case Consults", icon: "🏥", description: "Anonymized peer case reviews and differential diagnostic boards", badge: "HIPAA BAA" },
          { name: "Clinical Trials & PubMed Radar", icon: "📑", description: "Live ingestion of double-blind trial results and FDA approvals", badge: "PubMed" },
          { name: "CEU Credential Locker", icon: "🎖️", description: "Automated CME/CEU tracking for state medical board licenses", badge: "Active" }
        ]
      },
      {
        id: "trauma_orthopedic_surgeon",
        title: "Orthopedic Trauma & Reconstructive Surgeon (MD/DO)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Attending Orthopedic Trauma Surgeon · Complex Reconstruction, Arthroplasty & Limb Salvage",
        typicalSkills: ["Orthopedic Trauma", "Open Reduction Internal Fixation (ORIF)", "Total Joint Arthroplasty", "Fluoroscopy Guidance", "Surgical Navigation"],
        tools: [
          { name: "Surgical Implant & Plate Template", icon: "🔩", description: "Pre-operative digital templating for titanium plates, screws & intramedullary nails", badge: "Digital CAD" },
          { name: "OR Surgical Roster & Instrument Tray", icon: "🔪", description: "Sterile processing checklist, C-arm fluoroscopy protocol & surgeon card", badge: "OR Verified" }
        ]
      },
      {
        id: "interventional_cardiologist",
        title: "Interventional Cardiologist (MD, FACC, FSCAI)",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Interventional Cardiologist · Coronary Stenting, TAVR Valve & Acute STEMI Emergency",
        typicalSkills: ["Coronary Angiography", "PCI Stenting", "TAVR Valve Replacement", "Impella LV Assist", "IVUS & FFR Imaging"],
        tools: [
          { name: "Cath Lab Hemodynamic Tracer", icon: "🫀", description: "Simultaneous aortic and LV pressure gradients & FFR fractional flow reserve", badge: "Cath Lab" },
          { name: "STEMI Door-to-Balloon Timer", icon: "🚨", description: "Emergency cath lab mobilization, heparin bolus & time-to-perfusion telemetry", badge: "< 60 min" }
        ]
      },
      {
        id: "pharmacist",
        title: "Doctor of Pharmacy (PharmD) / Clinical Pharmacist",
        enclaveId: "healthcare_medicine",
        categoryName: "Clinical Healthcare & Medicine",
        defaultHeadline: "Clinical Pharmacist (PharmD) · Pharmacokinetics, Drug Interactions & Formulary",
        typicalSkills: ["Pharmacotherapy", "Drug Interaction Checks", "Formulary Management", "Sterile Compounding", "Oncology Protocols"],
        tools: [
          { name: "Drug Interaction Analyzer", icon: "💊", description: "Real-time CYP450 contraindication and renal dosing adjustor", badge: "FDA Daily" }
        ]
      }
    ]
  },

  // ─── 4. ZERO-TRUST CYBERSECURITY & CRITICAL INFRASTRUCTURE ─────
  {
    id: "tech_cybersecurity",
    name: "Cybersecurity, Offensive Red Teaming & Critical Infrastructure (OT/SCADA)",
    shortName: "Cybersecurity & DefSec",
    icon: "🛡️",
    tagline: "Active Directory exploitation, ICS/SCADA PLC defense, Ghidra decompilation, DFIR memory analysis & zero-trust IAM",
    description: "Dedicated workspace for red team operators, SCADA/ICS engineers, malware reverse engineers, and incident responders. Rigorous enclave isolation for mission-critical defenders.",
    themeColor: "from-slate-900 via-indigo-950 to-blue-900",
    accentBorder: "border-indigo-500",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    badgeText: "text-indigo-800 dark:text-indigo-300",
    securityClearanceTier: "DoD 8570 / 8140 Master Cyber Operator (Level 4 TS/SCI)",
    feedTags: ["#CyberSecurity", "#RedTeaming", "#SCADA", "#OTSecurity", "#MalwareAnalysis", "#DFIR", "#ZeroTrust", "#OffensiveSecurity", "#OSCP", "#ReverseEngineering"],
    professions: [
      {
        id: "red_team_operator",
        title: "Red Team Lead & Offensive Adversary Simulation Specialist",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Lead Red Team Operator (OSCP/CRTO) · Active Directory Exploitation, C2 & EDR Evasion",
        typicalSkills: ["Active Directory Attacks", "Kerberoasting", "EDR Evasion", "Cobalt Strike / Sliver C2", "Living off the Land (LOLBins)", "AMSI Bypass", "Payload Obfuscation"],
        tools: [
          { name: "C2 Adversary Simulation Console", icon: "🎯", description: "Emulated nation-state beacon profiles, DNS tunneling & sleep mask obfuscation", badge: "Offensive" },
          { name: "BloodHound Active Directory Graph", icon: "🕸️", description: "Kerberos attack path visualizer and tier-0 domain admin compromise routes", badge: "BloodHound" },
          { name: "EDR & Hooking Bypass Generator", icon: "⚡", description: "Direct syscalls, unhooking ntdll, process injection & APC execution payloads", badge: "Bypass Lab" }
        ]
      },
      {
        id: "scada_ics_security",
        title: "SCADA / ICS Operational Technology (OT) Security Engineer",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Critical Infrastructure OT/SCADA Cyber Engineer · Modbus/DNP3, PLC Hardening & Substation Security",
        typicalSkills: ["Modbus/TCP", "DNP3 Protocol", "IEC 62443 Standard", "Siemens S7 PLC Hardening", "NERC CIP Compliance", "OT Air-Gap"],
        tools: [
          { name: "ICS / SCADA Protocol Analyzer", icon: "🏭", description: "Modbus, BACnet, and DNP3 payload anomaly inspector and function code filters", badge: "OT Live" },
          { name: "NERC CIP & IEC 62443 Matrix", icon: "🛡️", description: "Electronic Security Perimeter (ESP) and physical access control verification", badge: "NERC CIP" },
          { name: "PLC Ladder Logic Integrity Check", icon: "🔌", description: "Siemens/Rockwell ladder logic hash comparison and unauthorized diff alerts", badge: "PLC Vault" }
        ]
      },
      {
        id: "malware_reverse_engineer",
        title: "Principal Malware Reverse Engineer & Exploit Analyst",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Malware Analyst · IDA Pro & Ghidra Decompilation, Kernel Rootkits & Ransomware Dissection",
        typicalSkills: ["IDA Pro", "Ghidra", "x64dbg", "Kernel Rootkits", "Memory Injection", "Ransomware Decryption", "YARA Rule Engineering"],
        tools: [
          { name: "Ghidra / IDA Decompilation Workbench", icon: "🔬", description: "Interactive disassembly, function call graphs & automated deobfuscation", badge: "Ghidra" },
          { name: "Dynamic Detonation Hypervisor", icon: "☣️", description: "Bare-metal hypervisor detonation with kernel API tracing & memory dumps", badge: "Sandbox" },
          { name: "YARA & Sigma Rule Generator", icon: "📜", description: "Threat signature authoring with automated false-positive regression testing", badge: "Sigma" }
        ]
      },
      {
        id: "incident_responder_dfir",
        title: "Digital Forensics & Incident Response (DFIR) Principal",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Lead Incident Commander (DFIR) · Memory Forensics (Volatility), Timeline & Ransomware Recovery",
        typicalSkills: ["Volatility Memory Analysis", "KAPE Triage", "Velociraptor", "Disk Forensics", "Master File Table (MFT)", "Chain of Custody"],
        tools: [
          { name: "Live Velociraptor Endpoint Hunter", icon: "🔍", description: "Parallel endpoint artifact collection, shimcache extraction & autorun queries", badge: "Hunting" },
          { name: "Volatility 3 RAM Memory Analyzer", icon: "💾", description: "Malicious injected DLL identification, hidden processes & network sockets", badge: "Volatility 3" }
        ]
      },
      {
        id: "zero_trust_iam_architect",
        title: "Zero-Trust IAM & Cryptographic Enclave Architect",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Zero-Trust IAM Architect · FIDO2 WebAuthn, SPIFFE/SPIRE Identity & Hardware Security Modules",
        typicalSkills: ["FIDO2 / WebAuthn", "SPIFFE / SPIRE", "OAuth 2.1 / OIDC", "mTLS Zero Trust", "HSM & PKI Enclaves", "ABAC / RBAC Policy"],
        tools: [
          { name: "SPIRE Workload Attestation Console", icon: "🔑", description: "Hardware cryptographic node attestation & SVID x509 automatic rotation", badge: "SPIFFE" },
          { name: "FIDO2 Passkey Policy Enforcer", icon: "🪪", description: "Hardware authenticator attestation, biometric requirements & token audit logs", badge: "FIDO2" }
        ]
      },
      {
        id: "soc_threat_hunter",
        title: "Senior SOC Lead & Threat Intelligence Hunter",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Defense",
        defaultHeadline: "Lead Threat Hunter · MITRE ATT&CK Matrix, SIEM Telemetry & APT Actor Attribution",
        typicalSkills: ["MITRE ATT&CK", "Splunk/Elastic SIEM", "Threat Hunting", "IOC Feed Fusion", "Suricata/Zeek", "EDR Telemetry"],
        tools: [
          { name: "MITRE ATT&CK Heatmap Visualizer", icon: "🗺️", description: "Enterprise technique coverage, detection gaps & red team emulation mapping", badge: "MITRE" },
          { name: "Strike & Fusion Vulnerability Radar", icon: "⚡", description: "Autonomous pentest, ASPM & real-time zero-day CVE correlation feeds", badge: "Active" }
        ]
      }
    ]
  },

  // ─── 5. SOFTWARE ENGINEERING, CLOUD & DISTRIBUTED SYSTEMS ──────
  {
    id: "tech_software",
    name: "Software Engineering, Cloud & Distributed Systems",
    shortName: "Software & Cloud",
    icon: "🧑‍💻",
    tagline: "Autonomous compilers, GitHub auto-PRs, eBPF microVMs, distributed systems & cloud architectures",
    description: "Dedicated workspace for developers, kernel engineers, and cloud architects. Strict segregation from trades/clinical environments.",
    themeColor: "from-sky-600 to-indigo-700",
    accentBorder: "border-sky-500",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    badgeText: "text-sky-800 dark:text-sky-300",
    securityClearanceTier: "Software & DevSecOps Verified (Level 3)",
    feedTags: ["#SoftwareEngineering", "#Kubernetes", "#NextJS", "#GitHubActions", "#RustLang", "#eBPF", "#CloudArchitecture", "#TypeScript"],
    professions: [
      {
        id: "software_engineer",
        title: "Full-Stack / Systems Software Engineer",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "Senior Software Engineer · Distributed Systems, Next.js 16 & Rust microVMs",
        typicalSkills: ["TypeScript", "Next.js", "Rust", "Go", "Docker", "PostgreSQL", "Kafka", "CI/CD Hardening"],
        tools: [
          { name: "Proof of Work Sandbox", icon: "🧪", description: "Isolated WebAssembly & Firecracker microVM test execution", badge: "Sub-4ms" },
          { name: "GitHub Auto-PR Assist", icon: "🐙", description: "Automated vulnerability remediation PRs with unit test verification", badge: "Connected" },
          { name: "Architecture Diagram Engine", icon: "🏛️", description: "Live C4 and system dependency graph visualizer", badge: "Realtime" }
        ]
      },
      {
        id: "cloud_architect",
        title: "Cloud & DevSecOps Solutions Architect",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "Principal Cloud Architect · Multi-Tenant Terraform & Zero-Trust Enclaves",
        typicalSkills: ["AWS GovCloud", "Kubernetes", "Terraform", "OpenTofu", "eBPF", "Istio Service Mesh"],
        tools: [
          { name: "Terraform Enclave Generator", icon: "☁️", description: "Automated NIST 800-53 compliant infrastructure manifests", badge: "Production" },
          { name: "Kubernetes Cluster Telemetry", icon: "☸️", description: "Real-time node pod density, ingress policies & mesh latency", badge: "Live" }
        ]
      },
      {
        id: "ai_researcher",
        title: "AI & Machine Learning Research Scientist",
        enclaveId: "tech_software",
        categoryName: "Software Engineering & Cloud",
        defaultHeadline: "AI Research Scientist · Multi-Agent Swarms, LLM Fine-Tuning & Memory Safety",
        typicalSkills: ["PyTorch", "Transformers", "RLHF", "Agentic Swarms", "CUDA Kernels", "Vector DBs"],
        tools: [
          { name: "Agent Swarm Sandbox", icon: "🤖", description: "Deterministic tool sandboxing and multi-agent coordination benchmark", badge: "Wasm" }
        ]
      }
    ]
  },

  // ─── 6. LEGAL, DEFENSE INTELLIGENCE & GOVERNANCE ───────────────
  {
    id: "law_gov_defense",
    name: "Legal, Defense Intelligence & Governance",
    shortName: "Law & Defense",
    icon: "⚖️",
    tagline: "Classified enclave briefs, CMMC compliance audits, federal RFP proposals & legal briefs",
    description: "Dedicated workspace for attorneys, defense contractors, and policy leaders. Strict segregation from trades/developer environments.",
    themeColor: "from-purple-600 to-slate-800",
    accentBorder: "border-purple-500",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badgeText: "text-purple-800 dark:text-purple-300",
    securityClearanceTier: "DoD Secret / TS Clearance Enclave",
    feedTags: ["#GovCloud", "#DefenseIntelligence", "#LegalCompliance", "#CMMC", "#FederalProcurement", "#NationalSecurity"],
    professions: [
      {
        id: "corporate_attorney",
        title: "Corporate & Regulatory Attorney",
        enclaveId: "law_gov_defense",
        categoryName: "Legal & Governance",
        defaultHeadline: "Partner / Corporate Counsel · Cross-Border M&A, Intellectual Property & Tech Policy",
        typicalSkills: ["Corporate Law", "Contract Negotiation", "IP Protection", "Regulatory Compliance", "Dispute Resolution"],
        tools: [
          { name: "Legal Brief & Precedent Vault", icon: "📚", description: "Automated SEC & federal court ruling citation cross-referencing", badge: "Fast Search" },
          { name: "Contract Redline Engine", icon: "🖋️", description: "Deterministic liability exposure and indemnity audit engine", badge: "Automated" }
        ]
      },
      {
        id: "defense_analyst",
        title: "Defense Intelligence & CMMC Compliance Lead",
        enclaveId: "law_gov_defense",
        categoryName: "Defense & GovCloud",
        defaultHeadline: "Senior Defense Analyst · TS/SCI Cleared · CMMC 2.0 Level 3 & FedRAMP High",
        typicalSkills: ["CMMC 2.0", "FedRAMP High", "OSCAL", "NIST 800-171", "Defense Intelligence", "GovCloud Security"],
        tools: [
          { name: "Federal SAM.gov RFP Feed", icon: "🏛️", description: "Direct cleared defense contracting bids and award telemetry", badge: "SAM.gov Live" },
          { name: "CMMC 2.0 Audit Workspace", icon: "🛡️", description: "Level 3 control artifact evidence package and SPRS score calculator", badge: "Audit Ready" }
        ]
      }
    ]
  },

  // ─── 7. FINANCE, ACCOUNTING & PRIVATE EQUITY ───────────────────
  {
    id: "finance_accounting",
    name: "Finance, Accounting & Private Equity",
    shortName: "Finance & Accounting",
    icon: "📊",
    tagline: "GAAP audits, valuation DCF models, private equity deal flow & corporate treasury",
    description: "Dedicated workspace for CPAs, investment bankers, and controllers. Strict segregation from trades/developer environments.",
    themeColor: "from-emerald-700 to-green-900",
    accentBorder: "border-emerald-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "Financial Fiduciary / SEC Clearance (Level 2)",
    feedTags: ["#Finance", "#Accounting", "#CPA", "#PrivateEquity", "#Valuation", "#CorporateTreasury", "#GAAP"],
    professions: [
      {
        id: "cpa_accountant",
        title: "Certified Public Accountant (CPA) / Controller",
        enclaveId: "finance_accounting",
        categoryName: "Finance & Accounting",
        defaultHeadline: "CPA · Corporate Financial Controller, Forensic Audit & Tax Strategy",
        typicalSkills: ["GAAP Audit", "Tax Strategy", "Forensic Accounting", "ERP Systems", "Financial Reporting", "IFRS"],
        tools: [
          { name: "GAAP Ledger Reconciler", icon: "📑", description: "Automated bank feed anomaly detection and tax schedule export", badge: "GAAP Ready" },
          { name: "Valuation DCF Engine", icon: "📈", description: "Monte Carlo simulated cash flow and enterprise multiplier modeler", badge: "Realtime" },
          { name: "SEC EDGAR 10-K Ingestion", icon: "🏛️", description: "Automated financial statement comparison across peer groups", badge: "EDGAR Live" }
        ]
      },
      {
        id: "investment_banker",
        title: "Investment Banking & Private Equity Analyst",
        enclaveId: "finance_accounting",
        categoryName: "Finance & Accounting",
        defaultHeadline: "Private Equity Associate · LBO Modeling, Deal Sourcing & Portfolio Operations",
        typicalSkills: ["LBO Modeling", "M&A Diligence", "Capital Markets", "Term Sheets", "EBITDA Bridge"],
        tools: [
          { name: "LBO & Returns Sensitivity Matrix", icon: "💼", description: "IRR and MOIC waterfall modeling with debt schedule sensitivity", badge: "Financial" }
        ]
      }
    ]
  }
]

export const ALL_PROFESSIONS: ProfessionDefinition[] = PROFESSION_ENCLAVES.flatMap(e => e.professions)

export function findEnclaveById(enclaveId: string): ProfessionEnclave | undefined {
  return PROFESSION_ENCLAVES.find(e => e.id === enclaveId)
}

export function findProfessionById(professionId: string): ProfessionDefinition | undefined {
  return ALL_PROFESSIONS.find(p => p.id === professionId)
}

export function getEnclaveForProfession(professionId: string): ProfessionEnclave {
  const profession = findProfessionById(professionId)
  if (profession) {
    const enclave = findEnclaveById(profession.enclaveId)
    if (enclave) return enclave
  }
  return PROFESSION_ENCLAVES[0] // Default to trades/construction
}

export function getProfessionsByEnclave(enclaveId: string): ProfessionDefinition[] {
  const enclave = findEnclaveById(enclaveId)
  return enclave ? enclave.professions : []
}
