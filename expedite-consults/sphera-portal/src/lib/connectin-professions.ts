import { EXPANSION_PROFESSIONS } from './connectin-professions-expansion'
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
    description: "Dedicated workspace for carpenters, electricians, plumbers, welders, painters, roofers, maintenance technicians, and craftspeople. Isolated from corporate tech environments.",
    themeColor: "from-amber-600 to-orange-700",
    accentBorder: "border-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badgeText: "text-amber-800 dark:text-amber-300",
    securityClearanceTier: "Master Tradesman & Site Superintendent (Level 2)",
    feedTags: ["#Carpentry", "#Construction", "#Woodworking", "#Electrician", "#Plumbing", "#Welding", "#Roofing", "#Painting", "#TradeTools", "#OSHAGuidelines"],
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
          { name: "Subcontractor RFP & Job Board", icon: "📋", description: "Residential framing bids, commercial millwork & punch lists", badge: "8 Bids Open" }
        ]
      },
      {
        id: "finish_carpenter",
        title: "Master Finish & Trim Carpenter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Finish Carpenter · Custom Coffered Ceilings, Wainscoting & Curved Staircases",
        typicalSkills: ["Architectural Millwork", "Crown Molding", "Coped Joints", "Curved Staircases", "Festool Miter Rig", "Veneer Inlay"],
        tools: [
          { name: "Custom Millwork Angle & Crown Calc", icon: "📐", description: "Compound miter pitch, bevel settings & spring angle tables", badge: "Precision" },
          { name: "Festool Precision Tool Locker", icon: "🧰", description: "Track saws, Domino tenons, dust extraction & laser guide calibration", badge: "Calibrated" }
        ]
      },
      {
        id: "commercial_framing_carpenter",
        title: "Commercial Framing & Formwork Carpenter",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Commercial Framing Superintendent · Glulam Trusses, Heavy Timber & Gang Forms",
        typicalSkills: ["Heavy Timber Glulam", "Symons Concrete Forms", "Metal Stud Framing", "Laser Transit Leveling", "Scaffold Rigging"],
        tools: [
          { name: "Total Station & Laser Transit", icon: "🔭", description: "3D datum elevation leveling and structural column plumb verification", badge: "Millimeter" },
          { name: "Glulam & Truss Load Calculator", icon: "🏗️", description: "Moment capacity, deflection limits & hurricane uplift tie-down schedule", badge: "Calculators" }
        ]
      },
      {
        id: "cabinetmaker",
        title: "Master Cabinetmaker & Millwork Artisan",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Cabinetmaker · Hand-Cut Dovetails, Custom Kitchen Islands & CNC Joinery",
        typicalSkills: ["Mortise & Tenon", "Dovetail Joinery", "CNC Wood Carving", "Vacuum Press Veneering", "Hardware Geometry"],
        tools: [
          { name: "Joinery & Cut-List Optimizer", icon: "🪚", description: "Automated sheet yield, kerf allowance & grain-matched layout engine", badge: "CAD/CAM" },
          { name: "Blum Hardware & Runner Template", icon: "🔩", description: "Undermount soft-close slide clearances & concealed hinge bore patterns", badge: "Templates" }
        ]
      },
      {
        id: "electrician",
        title: "Licensed Master Electrician",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Electrician · High-Voltage Distribution, Industrial Panels & NEC Code Compliance",
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
        id: "welder",
        title: "Certified Master Welder & Structural Fabricator",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Certified Structural Welder (AWS D1.1 / ASME IX) · TIG Exotic Alloys, Pipe & Ironwork",
        typicalSkills: ["TIG (GTAW)", "MIG (GMAW)", "Stick (SMAW)", "Pipe 6G Position", "Chromoly/Titanium", "NDT Testing", "AWS D1.1 Code"],
        tools: [
          { name: "WPS Welding Procedure Spec Vault", icon: "🔥", description: "Preheated joint geometry, shielding gas mix & heat input logs", badge: "AWS Code" },
          { name: "Non-Destructive Testing (NDT) Log", icon: "🛡️", description: "Radiographic, ultrasonic & dye penetrant joint inspection records", badge: "Certified" }
        ]
      },
      {
        id: "painter",
        title: "Commercial & Architectural Painting Specialist",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Professional Painting Contractor · Airless Spray Rigging, Epoxy Coatings & Historic Restoration",
        typicalSkills: ["Airless Spray Systems", "Epoxy Flooring", "Color Matching", "Drywall Level 5 Finish", "Lead Paint Abatement", "Surface Prep"],
        tools: [
          { name: "Coating Coverage & Mil Thickness Calc", icon: "🎨", description: "Wet film vs dry film mil thickness and square foot yield formulas", badge: "Coating Calc" },
          { name: "Spectrophotometer Color Matcher", icon: "🌈", description: "Digital tint formulation and historic architectural palette catalog", badge: "Color Lab" }
        ]
      },
      {
        id: "roofer",
        title: "Commercial & Residential Roofing Specialist",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Roofing Contractor · Standing Seam Metal, TPO Membrane & Slate Installation",
        typicalSkills: ["Standing Seam Metal", "TPO/EPDM Flat Roofing", "Architectural Shingles", "Flashing & Drainage", "OSHA Fall Arrest", "Thermal Drone Scans"],
        tools: [
          { name: "Roof Pitch & Square Estimator", icon: "🏠", description: "Rake, ridge, valley takeoff and waste factor square footage calculator", badge: "Aerial Takeoff" },
          { name: "Flashing & Wind Uplift Spec", icon: "💨", description: "ANSI/SPRI ES-1 edge metal wind uplift standards and thermal leak detection", badge: "ANSI Ready" }
        ]
      },
      {
        id: "construction_worker",
        title: "Construction Craftsman & Site Lead",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Construction Site Craftsman · Foundation Pouring, Scaffolding, Rigging & Framing",
        typicalSkills: ["Rebar & Concrete", "Scaffold Assembly", "Laser Transit", "Power Tools", "Demolition", "OSHA 10/30"],
        tools: [
          { name: "Jobsite Daily Log & Safety Walk", icon: "🦺", description: "Daily superintendent logs, weather delays and toolbox safety talks", badge: "Daily Report" },
          { name: "Material Delivery Dispatch", icon: "🚚", description: "Concrete truck batch timing, crane drop-off and laydown yard manifest", badge: "Logistics" }
        ]
      },
      {
        id: "maintenance_technician",
        title: "Facilities & Industrial Maintenance Technician",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Senior Maintenance Technician · Preventive Maintenance, Pneumatics, Pumps & Facilities",
        typicalSkills: ["Preventive Maintenance", "Pneumatics & Hydraulics", "Electrical Troubleshooting", "Centrifugal Pumps", "CMMS Software"],
        tools: [
          { name: "CMMS Work Order Queue", icon: "📋", description: "Preventive maintenance scheduling, PM checklists and work orders", badge: "Live CMMS" },
          { name: "Vibration & Thermography Log", icon: "🌡️", description: "Motor bearing vibration trends and infrared thermal anomaly maps", badge: "Diagnostics" }
        ]
      },
      {
        id: "repair_technician",
        title: "Diagnostic Equipment & Appliance Repair Specialist",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Certified Repair Technician · Commercial Appliance, Small Engine & Circuit Diagnostics",
        typicalSkills: ["Component-Level Repair", "Multimeter Diagnostics", "Motor Rewinding", "Micro-soldering", "Schematic Reading"],
        tools: [
          { name: "Interactive Schematic Explorer", icon: "🔌", description: "OEM wiring diagrams, wire trace pinouts and fault tree trees", badge: "Schematics" }
        ]
      },
      {
        id: "local_artisan",
        title: "Local Heritage Artisan & Architectural Craftsman",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Local Heritage Artisan · Custom Wrought Ironwork, Stone Masonry & Restorative Carving",
        typicalSkills: ["Blacksmithing", "Stone Masonry", "Wood Carving", "Stained Glass", "Heritage Preservation"],
        tools: [
          { name: "Artisan Material & Foundry Index", icon: "⚒️", description: "Forging steels, lime mortars, stone quarries and traditional pigments", badge: "Heritage" }
        ]
      },
      {
        id: "handicraft_maker",
        title: "Bespoke Handicraft Maker & Traditional Goods Artisan",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Master Handicraft Artisan · Bespoke Leathercraft, Turned Woodware & Ceramic Arts",
        typicalSkills: ["Hand Stitching", "Leather Carving", "Wood Turning", "Ceramic Glazing", "Custom Commission Work"],
        tools: [
          { name: "Custom Commission & Spec Manager", icon: "🧵", description: "Client bespoke briefs, leather hide yields and firing schedules", badge: "Artisan Portal" }
        ]
      },
      {
        id: "independent_inventor",
        title: "Independent Hardware Inventor & Prototype Fabricator",
        enclaveId: "trades_construction",
        categoryName: "Skilled Trades & Construction",
        defaultHeadline: "Independent Inventor · Rapid Hardware Prototyping, 3D CAD, CNC Machining & Patent Engineering",
        typicalSkills: ["Rapid Prototyping", "Additive Manufacturing", "Patent Engineering", "Fusion 360", "Microcontroller Integration"],
        tools: [
          { name: "USPTO Patent Prior Art Search", icon: "💡", description: "Patent claim searches, provisional filing checklists and design logs", badge: "USPTO Live" },
          { name: "3D CAD & G-Code Slicer Vault", icon: "⚙️", description: "Direct export of STEP files, CNC toolpaths and SLA/FDM build files", badge: "CAD/CAM" }
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
          { name: "Subcontractor Escrow & Draws", icon: "💳", description: "Milestone-based progress disbursements & lien waiver tracker", badge: "Escrow" }
        ]
      },
      {
        id: "bricklayer_mason",
        title: "Master Bricklayer, Block Mason & Concrete Finisher",
        enclaveId: "trades_construction",
        categoryName: "Construction & Building Trades",
        defaultHeadline: "Master Structural Mason · Bricklaying, CMU Blockwork, Architectural Stone & Foundation Concrete",
        typicalSkills: ["CMU Blockwork", "Mortar Mix Chemistry", "Laser Leveling", "Reinforced Foundations", "Stamped Concrete", "Scaffolding"],
        tools: [
          { name: "Masonry Course & Mortar Batch Calc", icon: "🧱", description: "Brick/CMU block count, Type N/S/M mortar yield and rebar spacing calculator", badge: "ASTM Spec" }
        ]
      },
      {
        id: "crane_heavy_equipment_operator",
        title: "NCCCO Tower Crane, Rigger & Heavy Equipment Operator",
        enclaveId: "trades_construction",
        categoryName: "Construction & Heavy Rigging",
        defaultHeadline: "NCCCO Certified Crane & Excavator Operator · Structural Steel Picks, Load Charts & GPS Earthmoving",
        typicalSkills: ["NCCCO Crane Cert", "Critical Lift Plans", "Signalperson Rigging", "CAT Excavator", "Laser Grading", "Trench Shoring"],
        tools: [
          { name: "Crane Load Radius & Wind Speed Matrix", icon: "🏗️", description: "Boom angle capacity charts, outrigger ground pressure and critical lift sign-offs", badge: "NCCCO Safe" }
        ]
      },
      {
        id: "surveyor_building_inspector",
        title: "Land Surveyor, Geomatics & Building Code Inspector",
        enclaveId: "trades_construction",
        categoryName: "Surveying & Code Compliance",
        defaultHeadline: "Licensed Land Surveyor (PLS) & ICC Building Inspector · GNSS RTK Rover, Boundary Plats & Code Sign-Offs",
        typicalSkills: ["GNSS RTK Surveying", "Leica Total Station", "ICC Building Codes", "ALTA Boundary Plats", "Structural Inspection"],
        tools: [
          { name: "ICC Code Compliance & GNSS Traverse Log", icon: "🔭", description: "IBC/IRC structural code checklists and millimeter GNSS coordinate logs", badge: "ICC Verified" }
        ]
      },
      {
        id: "hvac_refrigeration_tech",
        title: "Master HVAC, Chiller & Commercial Refrigeration Technician",
        enclaveId: "trades_construction",
        categoryName: "Mechanical, Electrical & Building Systems (MEP)",
        defaultHeadline: "EPA 608 Universal HVAC/R Technician · VRF Heat Pumps, Centrifugal Chillers & Cold-Storage Rack Systems",
        typicalSkills: ["EPA 608 Universal", "Superheat/Subcooling", "VRF Systems", "Commercial Walk-In Freezers", "Brazing", "Psychrometrics"],
        tools: [
          { name: "Psychrometric & Superheat/Subcooling Calc", icon: "❄️", description: "PT charts for R-410A/R-454B/CO2, airflow CFM sizer and compressor amp log", badge: "EPA 608" }
        ]
      },
      {
        id: "elevator_boiler_sprinkler_tech",
        title: "Elevator Mechanic, Steam Boiler & Fire Sprinkler Specialist",
        enclaveId: "trades_construction",
        categoryName: "Mechanical, Electrical & Building Systems (MEP)",
        defaultHeadline: "QEI Certified Elevator & Life-Safety Systems Technician · Traction Hoistways, High-Pressure Boilers & NFPA 13 Sprinklers",
        typicalSkills: ["ASME A17.1 Elevators", "NFPA 13 Fire Sprinklers", "High-Pressure Steam Boilers", "BACnet Building Controls", "PLC Relay Logic"],
        tools: [
          { name: "BACnet Building Automation & NFPA 13 Riser Log", icon: "🏢", description: "Hydrostatic fire pump test logs, elevator safety circuit diagnostics & boiler pressure gauges", badge: "NFPA / ASME" }
        ]
      },
      {
        id: "locksmith_home_inspector",
        title: "Licensed Locksmith, Glazier & Certified Home Inspector",
        enclaveId: "trades_construction",
        categoryName: "Property & Building Services",
        defaultHeadline: "ALOA Certified Locksmith & InterNACHI Home Inspector · Access Control Master Keying, Fenestration & Property Audits",
        typicalSkills: ["Master Key Systems", "Electronic Access Control", "Thermal Envelope Inspection", "Window/Door Glazing", "Radon/Mold Testing"],
        tools: [
          { name: "Property Inspection & Master Pinning Matrix", icon: "🔑", description: "120-point residential/commercial inspection report generator and bitting chart vault", badge: "InterNACHI" }
        ]
      }
    ]
  },

  // ─── 2. AUTOMOTIVE, TRANSPORT & LOGISTICS ───────────────────────
  {
    id: "automotive_mechanics",
    name: "Automotive, Transport & Logistics",
    shortName: "Auto, Fleet & Transport",
    icon: "🔧",
    tagline: "OBD-II CAN bus telemetry, CDL freight corridors, dispatch logistics & diesel diagnostics",
    description: "Dedicated workspace for mechanics, truck drivers, couriers, delivery drivers, rideshare operators, and warehouse logistics specialists.",
    themeColor: "from-rose-600 via-red-700 to-amber-700",
    accentBorder: "border-rose-500",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    badgeText: "text-rose-800 dark:text-rose-300",
    securityClearanceTier: "ASE Master & CDL Commercial Operator (Level 2)",
    feedTags: ["#AutoMechanic", "#Trucking", "#CDL", "#FreightLogistics", "#FleetMaintenance", "#DieselMechanic", "#WarehouseOps", "#DeliveryDrivers", "#EVPowertrain"],
    professions: [
      {
        id: "mechanic",
        title: "ASE Master Automotive Technician",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive & Fleet Technology",
        defaultHeadline: "ASE Master Auto Technician (A1-A9) · Advanced CAN-Bus Oscilloscope & Engine Diagnostics",
        typicalSkills: ["CAN-Bus Diagnostics", "OBD-II Scopes", "Engine Rebuilds", "Snap-on Modis", "Transmission Overhaul", "Emissions"],
        tools: [
          { name: "OBD-II CAN-Bus Oscilloscope", icon: "💻", description: "Live waveform analysis, sensor jitter & module communication bus decoding", badge: "Scope Live" },
          { name: "Snap-on / Bosch Modis Telemetry", icon: "🔍", description: "DTC fault code clearing, bi-directional component actuation & fuel trim logs", badge: "Bi-Directional" }
        ]
      },
      {
        id: "truck_driver",
        title: "Class A CDL Long-Haul & Freight Truck Driver",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Professional Class A CDL Driver · Heavy Haul, HazMat Endorsed & Interstate Freight Logistics",
        typicalSkills: ["Class A CDL", "Hours of Service (ELD)", "HazMat Transport", "Pre-Trip Inspections", "Logistics Routing", "Air Brakes"],
        tools: [
          { name: "DOT ELD & Hours of Service (HOS) Log", icon: "⏱️", description: "FMCSA compliant electronic logging device with rest break timers", badge: "FMCSA" },
          { name: "National Freight Corridor Map", icon: "🗺️", description: "Low bridge clearance alerts, weigh station statuses and diesel price indexes", badge: "Live GPS" }
        ]
      },
      {
        id: "delivery_driver",
        title: "Commercial Delivery & Final-Mile Route Driver",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Commercial Route Delivery Driver · High-Density Urban Logistics & Package Verification",
        typicalSkills: ["Multi-Drop Routing", "Proof of Delivery", "Defensive Driving", "Manifest Management", "Time Windows"],
        tools: [
          { name: "Dynamic Multi-Stop Route Optimizer", icon: "📦", description: "AI optimized package drop order, geofenced proof-of-delivery & gate code vault", badge: "Optimal Route" }
        ]
      },
      {
        id: "rideshare_driver",
        title: "Professional Rideshare & Fleet Operator",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Full-Time Professional Rideshare & Passenger Chauffeur · 5-Star Driver & Fleet Efficiency",
        typicalSkills: ["Customer Experience", "Defensive Driving", "Vehicle Maintenance", "Surge Timing", "City Navigation"],
        tools: [
          { name: "Multi-Platform Surge Heatmap", icon: "📱", description: "Consolidated airport queues, event dismissal spikes and hourly earnings analytics", badge: "Surge Live" }
        ]
      },
      {
        id: "courier",
        title: "Express Logistics & Medical Courier",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Medical & Critical Document Courier · Chain of Custody, HIPAA & Cold-Chain Transport",
        typicalSkills: ["Cold-Chain Storage", "Chain of Custody", "HIPAA Compliance", "Urgent Expediting", "Biohazard Transport"],
        tools: [
          { name: "Chain-of-Custody Digital Ledger", icon: "📑", description: "Biometric sign-offs, specimen temperature tracking & tamper-evident logs", badge: "Secure" }
        ]
      },
      {
        id: "warehouse_worker",
        title: "Warehouse Logistics & Fulfillment Specialist",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Warehouse Operations Specialist · Forklift Certified (OSHA), Inventory Management & Picking",
        typicalSkills: ["Forklift Operations", "WMS Software", "RF Scanner", "Pallet Ingestion", "OSHA Safety", "Order Fulfillment"],
        tools: [
          { name: "WMS Inventory & Bin Locator", icon: "🏷️", description: "Real-time pick path optimization, pallet slotting and cross-dock manifests", badge: "Live WMS" }
        ]
      },
      {
        id: "taxi_operator",
        title: "Licensed Taxi Operator & Livery Fleet Driver",
        enclaveId: "automotive_mechanics",
        categoryName: "Transport & Logistics",
        defaultHeadline: "Licensed Municipal Taxi Operator · Metered Transit, Medallion Compliance & Passenger Safety",
        typicalSkills: ["Medallion Regulations", "City Transit", "Fare Meter Calibrations", "Vehicle Sanitation", "Accessibility"],
        tools: [
          { name: "Municipal Fare & Medallion Logbook", icon: "🚕", description: "TLC meter sync, trip receipts and municipal inspection records", badge: "Compliant" }
        ]
      },
      {
        id: "diesel_fleet_mechanic",
        title: "Heavy Diesel & Fleet Maintenance Technician",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive & Fleet Technology",
        defaultHeadline: "Master Diesel Technician · Cummins, Detroit Diesel, Allison Transmissions & Air Brakes",
        typicalSkills: ["Cummins Insite", "DEF/SCR Systems", "Air Brakes", "Hydraulic Liftgates", "Fleet Preventive Maintenance"],
        tools: [
          { name: "Cummins Insite & DDEC Diagnostic Interface", icon: "🚛", description: "ECM recalibration, DPF soot loading diagnostics & high-pressure common rail telemetry", badge: "ECM Connect" }
        ]
      },
      {
        id: "ev_powertrain_technician",
        title: "High-Voltage EV Powertrain & Battery Technician",
        enclaveId: "automotive_mechanics",
        categoryName: "Automotive & Fleet Technology",
        defaultHeadline: "EV Master Specialist · 800V Architecture, Battery Module Balancing & Inverter Diagnostics",
        typicalSkills: ["800V Safety Lockout", "CAN-FD", "Inverter Testing", "Thermal Management", "BMS Module Balancing"],
        tools: [
          { name: "High-Voltage Battery Module Balancer", icon: "🔋", description: "Real-time cell delta voltage, pack internal resistance & thermal runaway mitigation", badge: "HV Safe" }
        ]
      }
    ]
  },

  // ─── 3. AGRICULTURE, FARMING, FISHERIES & NATURAL RESOURCES ────
  {
    id: "agriculture_natural_resources",
    name: "Agriculture, Farming, Fisheries & Natural Resources",
    shortName: "Agri, Food & Natural Resources",
    icon: "🌾",
    tagline: "Soil agronomy, livestock genetics, aquaculture tanks, honey apiaries & sustainable harvesting",
    description: "Dedicated workspace for farmers, livestock ranchers, aquaculture fish farmers, beekeepers, commercial fishermen, foresters, and miners.",
    themeColor: "from-lime-600 via-emerald-700 to-green-900",
    accentBorder: "border-lime-500",
    badgeBg: "bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-800",
    badgeText: "text-lime-800 dark:text-lime-300",
    securityClearanceTier: "Agricultural Producer & Natural Resource Lead (Level 2)",
    feedTags: ["#Agriculture", "#Farming", "#Livestock", "#Aquaculture", "#Beekeeping", "#Forestry", "#Fisheries", "#Agronomy", "#SoilHealth"],
    professions: [
      {
        id: "farmer",
        title: "Crop & Precision Agriculture Farmer",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Agriculture & Crop Farming",
        defaultHeadline: "Crop Producer & Agronomist · Precision Soil Health, Drip Irrigation & Regenerative Yields",
        typicalSkills: ["Soil Agronomy", "GPS Tractor Guidance", "Crop Rotation", "Drip Irrigation", "Pest Management", "Harvest Logistics"],
        tools: [
          { name: "Precision Soil & Moisture Telemetry", icon: "🌱", description: "Soil nitrogen-phosphorus-potassium (NPK) sensors and evapotranspiration data", badge: "Real-Time" },
          { name: "Commodity Grain & Futures Exchange", icon: "📈", description: "Corn, soybean, wheat cash prices and forward contract locking", badge: "CBOT Live" }
        ]
      },
      {
        id: "livestock_breeder",
        title: "Livestock Breeder & Ranch Manager",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Livestock & Animal Husbandry",
        defaultHeadline: "Livestock Rancher · Beef Cattle & Equine Genetics, Herd Health & Rotational Grazing",
        typicalSkills: ["Herd Health", "Artificial Insemination", "Nutritional Formulation", "Pedigree Records", "BQA Certification"],
        tools: [
          { name: "Herd Genetics & Lineage Database", icon: "🐄", description: "Expected Progeny Differences (EPDs), calving records & vaccination logs", badge: "EPD Index" }
        ]
      },
      {
        id: "fish_farmer",
        title: "Aquaculture Specialist & Fish Farm Operator",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Aquaculture & Marine Farming",
        defaultHeadline: "Aquaculture Manager · Recirculating Aquaculture Systems (RAS), Water Chemistry & Hatcheries",
        typicalSkills: ["RAS Systems", "Dissolved Oxygen Control", "Feed Conversion Ratios", "Water Quality", "Fish Pathology"],
        tools: [
          { name: "Water Quality & Dissolved Oxygen Monitor", icon: "🐟", description: "Continuous dissolved oxygen, pH, salinity, and ammonia telemetry", badge: "Continuous" }
        ]
      },
      {
        id: "beekeeper",
        title: "Master Beekeeper & Commercial Apiarist",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Apiculture & Honey Production",
        defaultHeadline: "Master Beekeeper · Queen Rearing, Varroa Mite Integrated Pest Management & Pollination Contracts",
        typicalSkills: ["Queen Rearing", "Varroa IPM", "Pollination Services", "Honey Extraction", "Hive Splitting", "Propolis Harvest"],
        tools: [
          { name: "Apiary Hive Sensor & Swarm Monitor", icon: "🐝", description: "Hive acoustic frequencies, internal brood nest temperature and weight scales", badge: "Acoustic AI" }
        ]
      },
      {
        id: "agricultural_worker",
        title: "Agricultural Field Operations Specialist",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Agriculture & Crop Farming",
        defaultHeadline: "Agricultural Field Specialist · Harvester Operations, Irrigation Rigging & Produce Safety",
        typicalSkills: ["Combine Operation", "Irrigation Lines", "Crop Scouting", "Post-Harvest Handling", "GAP Safety"],
        tools: [
          { name: "Harvest Yield & Labor Manifest", icon: "🚜", description: "Daily acreage harvested, bin counts and post-harvest cooling verification", badge: "Daily Log" }
        ]
      },
      {
        id: "fisherman",
        title: "Commercial Marine Fisherman & Trawler",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Maritime & Commercial Fisheries",
        defaultHeadline: "Commercial Fisherman · Offshore Longlining, Gillnetting & NOAA Quota Compliance",
        typicalSkills: ["Marine Navigation", "Seamanship", "Catch Preservation", "NOAA Compliance", "Sonar Fishfinding", "Winch Rigging"],
        tools: [
          { name: "NOAA Catch Quota & Bathymetric Sonar", icon: "⚓", description: "Electronic Vessel Trip Reporting (eVTR), sea surface temperature & quota tracking", badge: "NOAA Sync" }
        ]
      },
      {
        id: "forestry_worker",
        title: "Forester, Timber Harvester & Certified Arborist",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Forestry & Timber Management",
        defaultHeadline: "Consulting Forester & Arborist · Sustainable Timber Cruising, Firebreak Ecology & Tree Care",
        typicalSkills: ["Timber Cruising", "Tree Felling", "Chainsaw Safety", "Prescribed Fire", "Silviculture", "Aerial Climbing"],
        tools: [
          { name: "Timber Cruise & Board-Foot Volume Calc", icon: "🌲", description: "Doyle, Scribner, and International 1/4 log scale stand calculators", badge: "Cruising" }
        ]
      },
      {
        id: "miner",
        title: "Geotechnical Mining & Extraction Specialist",
        enclaveId: "agriculture_natural_resources",
        categoryName: "Extraction & Natural Resources",
        defaultHeadline: "Mining Technician · Underground Boring, Blasting Safety & Mineral Ore Assay",
        typicalSkills: ["MSHA Safety", "Blasting Protocols", "Ore Grade Analysis", "Subsurface Ventilation", "Heavy Machinery"],
        tools: [
          { name: "MSHA Safety & Ventilation Monitor", icon: "⛏️", description: "Subsurface air quality, methane gas sensors and structural rock bolt logs", badge: "MSHA Live" }
        ]
      }
    ]
  },

  // ─── 4. PERSONAL CARE, GROOMING, BEAUTY & FITNESS ──────────────
  {
    id: "personal_services_wellness",
    name: "Personal Care, Grooming, Beauty & Fitness",
    shortName: "Beauty, Wellness & Fitness",
    icon: "✂️",
    tagline: "Salon bookings, custom tailoring, aesthetic skincare, strength conditioning & pet grooming",
    description: "Dedicated workspace for barbers, hairstylists, tailors, beauticians, personal trainers, fitness instructors, pet groomers, and athletic coaches.",
    themeColor: "from-pink-600 via-rose-600 to-purple-800",
    accentBorder: "border-pink-500",
    badgeBg: "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800",
    badgeText: "text-pink-800 dark:text-pink-300",
    securityClearanceTier: "Certified Wellness & Personal Care Practitioner (Level 2)",
    feedTags: ["#Barber", "#HairStylist", "#Tailoring", "#Beautician", "#PersonalTrainer", "#Fitness", "#PetGrooming", "#Coaching", "#Wellness"],
    professions: [
      {
        id: "barber",
        title: "Master Barber & Traditional Grooming Specialist",
        enclaveId: "personal_services_wellness",
        categoryName: "Grooming & Hair Styling",
        defaultHeadline: "Master Barber · Precision Fades, Hot Towel Straight Razor Shaves & Beard Sculpting",
        typicalSkills: ["Straight Razor Shaves", "Skin Fades", "Beard Sculpting", "Sanitation (Barbicide)", "Shear Over Comb"],
        tools: [
          { name: "Barber Chair Appointment & Client Book", icon: "💈", description: "Recurring bookings, haircut preferences, guard lengths & tip logs", badge: "Bookings" },
          { name: "State Board Sanitation Checklist", icon: "🧴", description: "Autoclave cycles, disinfectant logs & state cosmetology compliance", badge: "Sanitized" }
        ]
      },
      {
        id: "hairstylist",
        title: "Professional Hair Stylist & Master Colorist",
        enclaveId: "personal_services_wellness",
        categoryName: "Grooming & Hair Styling",
        defaultHeadline: "Senior Hair Stylist & Balayage Colorist · Precision Cutting, Extensions & Hair Health",
        typicalSkills: ["Balayage", "Color Formulation", "Precision Bob Cutting", "Hair Extensions", "Keratin Treatments"],
        tools: [
          { name: "Color Formulation & Developer Chemistry", icon: "🎨", description: "Pigment ratios, lift formulas, developer volumes and patch test logs", badge: "Color Lab" }
        ]
      },
      {
        id: "tailor",
        title: "Bespoke Master Tailor & Custom Clothier",
        enclaveId: "personal_services_wellness",
        categoryName: "Apparel & Garment Design",
        defaultHeadline: "Master Bespoke Tailor · Hand-Drafted Patterns, Custom Suiting & Fine Alterations",
        typicalSkills: ["Pattern Drafting", "Garment Fitting", "Hand Basting", "Wool Canvas Construction", "Alterations"],
        tools: [
          { name: "Anatomical Measurement & Pattern Sizer", icon: "📏", description: "32-point client measurement profiles, posture corrections & drape charts", badge: "Bespoke" }
        ]
      },
      {
        id: "beautician",
        title: "Licensed Esthetician & Medical Spa Beautician",
        enclaveId: "personal_services_wellness",
        categoryName: "Beauty & Aesthetics",
        defaultHeadline: "Licensed Medical Esthetician · Chemical Peels, HydraFacials & Advanced Skin Analysis",
        typicalSkills: ["Chemical Peels", "HydraFacials", "Dermaplaning", "Skin Fitzpatrick Scoring", "Sanitation"],
        tools: [
          { name: "Fitzpatrick Skin Analysis & Treatment Plan", icon: "✨", description: "Client contraindication screen, exfoliation protocols and post-care logs", badge: "Clinical Skin" }
        ]
      },
      {
        id: "sewer_garment_maker",
        title: "Apparel Patternmaker & Garment Sewer",
        enclaveId: "personal_services_wellness",
        categoryName: "Apparel & Garment Design",
        defaultHeadline: "Garment Fabricator & Production Sewer · Industrial Overlock, Sample Sewing & Couture Finish",
        typicalSkills: ["Industrial Serger", "French Seams", "Grading Patterns", "Fabric Stretch Math", "Quality Control"],
        tools: [
          { name: "Fabric Yardage & Seam Allowance Sizer", icon: "🧵", description: "Grainline placement, pattern grading tolerances and yardage consumption calculator", badge: "Pattern Maker" }
        ]
      },
      {
        id: "beauty_product_seller",
        title: "Beauty & Cosmetic Product Brand Founder",
        enclaveId: "personal_services_wellness",
        categoryName: "Beauty & Aesthetics",
        defaultHeadline: "Cosmetics Brand Founder · Organic Skincare Formulations, Packaging & Retail Distribution",
        typicalSkills: ["Clean Cosmetic Formulation", "FDA Labeling", "Batch Testing", "DTC Retail", "Supply Chain"],
        tools: [
          { name: "Cosmetic Batch & INCI Ingredient Vault", icon: "💄", description: "FDA compliant INCI ingredient lists, stability test records and batch COAs", badge: "FDA Compliant" }
        ]
      },
      {
        id: "pet_groomer",
        title: "Certified Professional Pet Groomer & Stylist",
        enclaveId: "personal_services_wellness",
        categoryName: "Animal Care & Grooming",
        defaultHeadline: "Certified Master Pet Groomer · Breed Standard Cuts, Hand Stripping & Fear-Free Handling",
        typicalSkills: ["Breed Standard Trims", "Hand Stripping", "De-Shedding", "Nail Dremel", "Fear-Free Handling"],
        tools: [
          { name: "Breed Coat Spec & Handling Notes", icon: "🐕", description: "Coat type care guides, behavior sensitivity flags and vaccination expirations", badge: "Pet Safe" }
        ]
      },
      {
        id: "personal_trainer",
        title: "Certified Personal Trainer & Strength Coach",
        enclaveId: "personal_services_wellness",
        categoryName: "Fitness & Strength Conditioning",
        defaultHeadline: "NSCA-CPT Personal Trainer · Periodized Strength Training, Hypertrophy & Functional Movement",
        typicalSkills: ["Periodization", "Biomechanics Screen", "Nutrition Coaching", "1RM Math", "Injury Prevention"],
        tools: [
          { name: "Client Periodization & 1RM Progression", icon: "🏋️", description: "Linear and undulating periodization planner, RPE calculators and body composition logs", badge: "Strength Engine" }
        ]
      },
      {
        id: "fitness_instructor",
        title: "Group Fitness, Pilates & Yoga Instructor",
        enclaveId: "personal_services_wellness",
        categoryName: "Fitness & Strength Conditioning",
        defaultHeadline: "Group Fitness Lead · Reformer Pilates, High-Energy HIIT & Mindfulness Flow",
        typicalSkills: ["Class Cueing", "Reformer Pilates", "Breathwork", "Music BPM Sequencing", "Injury Modifications"],
        tools: [
          { name: "Class Choreography & BPM Playlist Sync", icon: "🧘", description: "Cadence pacing, circuit interval timers and movement modification charts", badge: "Class Ready" }
        ]
      },
      {
        id: "sports_coach",
        title: "Athletic Coach & Sports Development Director",
        enclaveId: "personal_services_wellness",
        categoryName: "Sports & Athletics",
        defaultHeadline: "Head Sports Coach · Player Development, Tactical Film Breakdown & Tournament Strategy",
        typicalSkills: ["Tactical Playbooks", "Film Breakdown", "NCAA/USSF Regulations", "Athlete Recovery", "Team Culture"],
        tools: [
          { name: "Interactive Playbook & Film Session", icon: "📋", description: "Chalkboard whiteboard, scouting reports and game-clock scenario simulator", badge: "Tactics" }
        ]
      },
      {
        id: "sports_official",
        title: "Certified Sports Referee & Match Official",
        enclaveId: "personal_services_wellness",
        categoryName: "Sports & Athletics",
        defaultHeadline: "Certified Sports Official · Game Management, Rulebook Enforcement & Conflict De-escalation",
        typicalSkills: ["Rulebook Interpretation", "Field Positioning", "Game Clock", "Conflict Resolution", "Disciplinary Reports"],
        tools: [
          { name: "Rulebook & Match Report Vault", icon: "⚖️", description: "Official foul reports, card citations and governing league score submissions", badge: "Official" }
        ]
      }
    ]
  },

  // ─── 5. CULINARY, HOSPITALITY, EVENTS & FACILITY SERVICES ───────
  {
    id: "culinary_hospitality_events",
    name: "Culinary, Hospitality, Events & Facility Services",
    shortName: "Culinary, Events & Services",
    icon: "🍽️",
    tagline: "Banquet catering, guest lodging, wedding productions, commercial cleaning & culinary craft",
    description: "Dedicated workspace for caterers, chefs, food sellers, restaurant servers, event planners, wedding directors, tour guides, landscapers, cleaners, and laundry operators.",
    themeColor: "from-amber-600 via-orange-600 to-yellow-700",
    accentBorder: "border-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badgeText: "text-amber-800 dark:text-amber-300",
    securityClearanceTier: "Hospitality & Facility Operations Specialist (Level 2)",
    feedTags: ["#Catering", "#Hospitality", "#EventPlanning", "#ChefLife", "#WeddingPlanner", "#Landscaping", "#CleaningServices", "#CulinaryArts"],
    professions: [
      {
        id: "caterer",
        title: "Executive Event Caterer & Banquet Chef",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Culinary & Food Services",
        defaultHeadline: "Executive Caterer · High-Volume Galas, Farm-to-Table Menus & Commercial Kitchen Logistics",
        typicalSkills: ["Banquet Operations", "Recipe Scaling", "ServSafe Food Safety", "Portion Costing", "Dietary Restrictions"],
        tools: [
          { name: "Event Menu Scaling & Food Costing Calc", icon: "🍲", description: "Ingredient batch multiplication, per-plate cost breakdowns and allergen matrix", badge: "ServSafe" }
        ]
      },
      {
        id: "food_seller",
        title: "Artisan Food Producer & Specialty Merchant",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Culinary & Food Services",
        defaultHeadline: "Artisan Food Producer · Small-Batch Specialty Foods, Fermentation & Farmers Market Sales",
        typicalSkills: ["Food Preservation", "Commercial Packaging", "Health Department Permitting", "Barcoding", "Shelf Life Testing"],
        tools: [
          { name: "Cottage Food & Commercial Kitchen Permits", icon: "🥖", description: "Health inspection certificates, nutritional facts panel generator and batch logs", badge: "Certified" }
        ]
      },
      {
        id: "restaurant_server",
        title: "Fine Dining Server & Hospitality Lead",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Culinary & Food Services",
        defaultHeadline: "Head Server & Dining Captain · Wine Pairings, Michelin-Grade Service & Guest Experience",
        typicalSkills: ["Table Service", "Wine Pairings", "POS Systems", "POS Order Routing", "Guest Hospitality"],
        tools: [
          { name: "Table Mapping & Wine Pairing Reference", icon: "🍷", description: "Vintage tasting notes, cellar inventory and dietary allergy alerts", badge: "Sommelier Guide" }
        ]
      },
      {
        id: "event_planner",
        title: "Professional Event & Conference Planner",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Events & Entertainment",
        defaultHeadline: "Senior Event Producer · Corporate Conferences, Non-Profit Galas & Large-Scale Festivals",
        typicalSkills: ["Vendor Negotiations", "Budget Reconciliation", "Run of Show", "AV Coordination", "Municipal Permits"],
        tools: [
          { name: "Run-of-Show & Timeline Master", icon: "📅", description: "Minute-by-minute cue sheets, staging load-in schedules and vendor contracts", badge: "Production Master" }
        ]
      },
      {
        id: "wedding_service_provider",
        title: "Wedding Coordinator & Bridal Service Director",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Events & Entertainment",
        defaultHeadline: "Luxury Wedding Coordinator · Seamless Ceremony Timelines, Decor Styling & Rehearsals",
        typicalSkills: ["Bridal Party Management", "Floral Design Coordination", "Emergency Kit Kits", "Contract Review"],
        tools: [
          { name: "Bridal Suite & Ceremony Layout Planner", icon: "💍", description: "Seating charts, procession walk timings and vendor deposit trackers", badge: "Bridal Desk" }
        ]
      },
      {
        id: "tour_guide",
        title: "Cultural Heritage & Eco Tour Guide",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Tourism & Travel",
        defaultHeadline: "Certified Professional Tour Guide · Historic Walking Tours, Wilderness Eco-Guides & Storytelling",
        typicalSkills: ["Storytelling", "Wilderness First Aid", "Historic Research", "Guest Safety", "Multilingual Delivery"],
        tools: [
          { name: "Tour Route Audio & Historical Dossier", icon: "🗺️", description: "Stop-by-stop talking points, historic photographic archives and emergency GPS points", badge: "Guide System" }
        ]
      },
      {
        id: "hospitality_worker",
        title: "Hotel Operations & Guest Service Associate",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Tourism & Travel",
        defaultHeadline: "Hotel Hospitality Associate · Front Desk Operations, Concierge Recommendations & Guest Loyalty",
        typicalSkills: ["PMS Property Systems", "Guest Concierge", "VIP Handling", "Service Recovery", "Room Assignment"],
        tools: [
          { name: "PMS Room Turnover & Concierge Vault", icon: "🏨", description: "VIP arrival manifests, housekeeping turnaround status and city partner reservations", badge: "PMS Connect" }
        ]
      },
      {
        id: "landscaper",
        title: "Commercial Landscape Contractor & Horticulturalist",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Facility & Property Services",
        defaultHeadline: "Landscape Contractor · Hardscaping, Commercial Irrigation, Native Turf & Arbor Care",
        typicalSkills: ["Hardscape Pavers", "Irrigation Backflow", "Soil pH", "Landscape Lighting", "Excavation"],
        tools: [
          { name: "Irrigation Zone & Turf Square Foot Sizer", icon: "🌿", description: "Head-to-head sprinkler coverage, pump pressure loss and sod yardage estimator", badge: "Design Calc" }
        ]
      },
      {
        id: "cleaner",
        title: "Commercial Sanitation & Cleaning Specialist",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Facility & Property Services",
        defaultHeadline: "Commercial Cleaning Specialist · Medical Office Sanitization, Floor Strip/Wax & Green Clean",
        typicalSkills: ["OSHA Bloodborne Pathogens", "Floor Buffing", "HEPA Filtration", "Chemical Dilution Ratios"],
        tools: [
          { name: "Sanitation Protocol & Chemical SDS Vault", icon: "🧹", description: "OSHA Safety Data Sheets (SDS), dwell time charts and room inspection checklists", badge: "OSHA Safe" }
        ]
      },
      {
        id: "domestic_worker",
        title: "Household Operations Specialist & Estate Staff",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Facility & Property Services",
        defaultHeadline: "Estate Household Operations Specialist · Family Support, Wardrobe Care & Fine Surface Care",
        typicalSkills: ["Fine Surface Care", "Pantry Inventory", "Meal Preparation", "Discretion & Privacy", "Household Safety"],
        tools: [
          { name: "Estate Inventory & Maintenance Schedule", icon: "🏡", description: "Appliance service warranties, fine silver/marble protocols and household supply orders", badge: "Private Ledger" }
        ]
      },
      {
        id: "laundry_service_provider",
        title: "Commercial Laundry & Dry Cleaning Operator",
        enclaveId: "culinary_hospitality_events",
        categoryName: "Facility & Property Services",
        defaultHeadline: "Commercial Laundry Operator · Industrial Steam Presses, Fabric Stain Chemistry & Wash Delivery",
        typicalSkills: ["Fabric Spotting Chemistry", "Steam Finishing", "Water Softening", "Dry Cleaning Solvents", "Batch Sorter"],
        tools: [
          { name: "Fabric Care & Solvent Temperature Matrix", icon: "🧺", description: "Stain extraction chemistry guide, fabric care symbol decoder and load tracking", badge: "Fabric Lab" }
        ]
      }
    ]
  },

  // ─── 6. COMMERCE, REAL ESTATE & SMALL BUSINESS ───────────────────
  {
    id: "commerce_small_business",
    name: "Commerce, Real Estate & Small Business",
    shortName: "Commerce, Real Estate & Business",
    icon: "💼",
    tagline: "MLS real estate listings, boutique shop inventory, market merchant escrow & SMB consulting",
    description: "Dedicated workspace for licensed realtors, small shop owners, market traders, street vendors, home-based business founders, and independent business consultants.",
    themeColor: "from-blue-600 via-indigo-700 to-sky-800",
    accentBorder: "border-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeText: "text-blue-800 dark:text-blue-300",
    securityClearanceTier: "Commercial Merchant & Real Estate Fiduciary (Level 2)",
    feedTags: ["#Realtor", "#RealEstate", "#SmallBusiness", "#ShopOwner", "#MarketTrader", "#StreetVendor", "#Entrepreneur", "#Consulting"],
    professions: [
      {
        id: "realtor",
        title: "Licensed Realtor & Real Estate Broker",
        enclaveId: "commerce_small_business",
        categoryName: "Real Estate & Property Commerce",
        defaultHeadline: "Licensed Real Estate Broker (NAR) · Residential Closings, Commercial Leases & Comparative Market Analysis",
        typicalSkills: ["MLS Databases", "Comparative Market Analysis (CMA)", "Purchase Agreements", "Title Review", "Escrow Coordination", "Open Houses"],
        tools: [
          { name: "MLS Live Search & CMA Valuation Engine", icon: "🏡", description: "Active listings, recent comps, price-per-square-foot and property tax records", badge: "MLS Live" },
          { name: "Digital Closing & Escrow Tracker", icon: "📑", description: "DocuSign earnest money deposits, title contingency deadlines and closing statements", badge: "Escrow Ready" }
        ]
      },
      {
        id: "small_shop_owner",
        title: "Independent Retail & Boutique Shop Owner",
        enclaveId: "commerce_small_business",
        categoryName: "Retail & Local Commerce",
        defaultHeadline: "Independent Boutique Owner · Curated Merchandising, Point-of-Sale & Local Customer Loyalty",
        typicalSkills: ["Inventory Control", "Retail POS", "Merchandising", "Supplier Terms", "Visual Window Displays"],
        tools: [
          { name: "Retail POS & Stock Replenishment", icon: "🏪", description: "Real-time inventory levels, barcode scanning, margin calculations and reorder alerts", badge: "POS Hub" }
        ]
      },
      {
        id: "market_trader",
        title: "Marketplace Merchant & Wholesale Trader",
        enclaveId: "commerce_small_business",
        categoryName: "Retail & Local Commerce",
        defaultHeadline: "Wholesale & Marketplace Trader · Bulk Goods Sourcing, Pop-Up Market Stalls & Wholesale Margin",
        typicalSkills: ["Wholesale Sourcing", "Cash Reconciliation", "Stall Setup", "Margin Optimization", "B2B Negotiations"],
        tools: [
          { name: "Wholesale Pricing & Stall Sales Log", icon: "🪙", description: "Cost of goods sold (COGS), daily stall fee amortization and fast invoice generation", badge: "Trade Log" }
        ]
      },
      {
        id: "street_vendor",
        title: "Street Vendor & Mobile Concessionaire",
        enclaveId: "commerce_small_business",
        categoryName: "Retail & Local Commerce",
        defaultHeadline: "Mobile Street Concessionaire · Permitted Food Cart Operations, High-Footfall Locations & Quick Serve",
        typicalSkills: ["Mobile Permits", "Food Cart Sanitation", "Square/Clover POS", "Footfall Timing", "Propane Safety"],
        tools: [
          { name: "Municipal Vending Permit & Location Tracker", icon: "🌭", description: "City vendor zone maps, seasonal permits and peak pedestrian traffic alerts", badge: "City Permit" }
        ]
      },
      {
        id: "home_based_business_owner",
        title: "Home-Based Business Entrepreneur",
        enclaveId: "commerce_small_business",
        categoryName: "Entrepreneurship & Small Business",
        defaultHeadline: "Home-Based Business Owner · Direct-to-Consumer E-Commerce, Custom Goods & Fulfillment",
        typicalSkills: ["DTC Shipping", "Shopify/Etsy", "Social Selling", "Bookkeeping", "Customer Service"],
        tools: [
          { name: "DTC Orders & Shipping Label Station", icon: "📦", description: "USPS/UPS label discounts, order packing slips and tracking notifications", badge: "Shipping Hub" }
        ]
      },
      {
        id: "independent_consultant",
        title: "Independent Business & Operations Consultant",
        enclaveId: "commerce_small_business",
        categoryName: "Entrepreneurship & Small Business",
        defaultHeadline: "Independent Operations Consultant · Business Process Reengineering, Revenue Growth & Change Management",
        typicalSkills: ["Process Mapping", "Financial Modeling", "Strategic Roadmaps", "Client Diagnostic Audits", "Proposal Writing"],
        tools: [
          { name: "Consulting Retainer & Deliverables Dashboard", icon: "📊", description: "Client milestone sign-offs, billable hours tracking and executive presentation deck vault", badge: "Client Desk" }
        ]
      }
    ]
  },

  // ─── 7. CREATIVE MEDIA, ARTS, WRITING & PERFORMANCE ─────────────
  {
    id: "creative_media_arts",
    name: "Creative Media, Arts, Writing & Performance",
    shortName: "Creative Arts, Media & Writing",
    icon: "🎭",
    tagline: "Audio production, cinematography, stage acting, graphic design, ghostwriting & language translation",
    description: "Dedicated workspace for musicians, photographers, actors, filmmakers, dancers, independent writers, content creators, graphic designers, fine artists, translators, and ASL interpreters.",
    themeColor: "from-purple-600 via-violet-700 to-indigo-800",
    accentBorder: "border-purple-500",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badgeText: "text-purple-800 dark:text-purple-300",
    securityClearanceTier: "Creative Professional & Media Artisan (Level 2)",
    feedTags: ["#MusicProduction", "#Photography", "#Filmmaking", "#Acting", "#GraphicDesign", "#Writing", "#ContentCreator", "#Translation", "#ASL"],
    professions: [
      {
        id: "musician",
        title: "Professional Musician, Songwriter & Producer",
        enclaveId: "creative_media_arts",
        categoryName: "Music & Audio Arts",
        defaultHeadline: "Professional Musician & Composer · Session Instrumentalist, Songwriting & Studio Production",
        typicalSkills: ["Sight Reading", "Audio Engineering (DAW)", "Arrangement", "Live Performance", "Music Licensing"],
        tools: [
          { name: "DAW Audio Session & Split Sheet Vault", icon: "🎵", description: "Songwriter copyright split sheets, stem downloads and royalty distribution sheets", badge: "BMI / ASCAP" }
        ]
      },
      {
        id: "photographer",
        title: "Commercial & Editorial Photographer",
        enclaveId: "creative_media_arts",
        categoryName: "Visual Media & Photography",
        defaultHeadline: "Commercial Photographer · Studio Lighting, Architectural Framing & High-End Retouching",
        typicalSkills: ["Studio Strobe Lighting", "Lightroom/Capture One", "Color Grading", "Commercial Licensing", "Model Releases"],
        tools: [
          { name: "Client Proofing Gallery & Licensing Contract", icon: "📷", description: "Digital watermarked proofs, commercial usage rights certificates and EXIF metadata logs", badge: "Proof Gallery" }
        ]
      },
      {
        id: "actor",
        title: "Stage, Screen & Voice Actor",
        enclaveId: "creative_media_arts",
        categoryName: "Performing Arts & Drama",
        defaultHeadline: "Actor (SAG-AFTRA Eligible) · Classical Theatre, Film/Television & Commercial Voiceover",
        typicalSkills: ["Script Analysis", "Voice Modulation", "Dialect Mastery", "Improvisation", "Audition Self-Tapes"],
        tools: [
          { name: "Audition Self-Tape & Sides Teleprompter", icon: "🎬", description: "Script side teleprompter, casting notice submissions and reel showcase", badge: "Casting Link" }
        ]
      },
      {
        id: "filmmaker",
        title: "Independent Filmmaker & Director",
        enclaveId: "creative_media_arts",
        categoryName: "Film & Video Production",
        defaultHeadline: "Filmmaker & Director · Narrative Short Films, Documentary Production & Cinematography",
        typicalSkills: ["Directing", "Cinematography", "Color Timing", "Screenwriting", "Film Festival Distribution"],
        tools: [
          { name: "Shot List & Storyboard Generator", icon: "🎥", description: "Camera angles, focal length specs, lighting setups and call sheet schedules", badge: "Pre-Pro" }
        ]
      },
      {
        id: "dancer",
        title: "Professional Dancer & Choreographer",
        enclaveId: "creative_media_arts",
        categoryName: "Performing Arts & Drama",
        defaultHeadline: "Choreographer & Performing Artist · Contemporary Dance, Stage Musicals & Movement Direction",
        typicalSkills: ["Choreography", "Contemporary Technique", "Stage Staging", "Kinesthetic Awareness", "Audition Coaching"],
        tools: [
          { name: "Movement Score & Rehearsal Floorplan", icon: "🩰", description: "Stage formation diagrams, count sheets and rehearsal video markers", badge: "Staging" }
        ]
      },
      {
        id: "independent_writer",
        title: "Author, Ghostwriter & Independent Journalist",
        enclaveId: "creative_media_arts",
        categoryName: "Writing & Journalism",
        defaultHeadline: "Independent Author & Investigative Writer · Non-Fiction Books, Long-Form Essays & Ghostwriting",
        typicalSkills: ["Investigative Research", "Manuscript Editing", "Publishing Proposals", "Interviewing", "Fact Checking"],
        tools: [
          { name: "Manuscript Chapter Outline & Word Count Target", icon: "✍️", description: "Daily writing sprint goals, character bible and reference citation index", badge: "Writer Desk" }
        ]
      },
      {
        id: "content_creator",
        title: "Digital Content Creator & Video Producer",
        enclaveId: "creative_media_arts",
        categoryName: "Digital Media & Video",
        defaultHeadline: "Digital Content Creator · High-Engagement Short-Form Video, Brand Partnerships & Podcasting",
        typicalSkills: ["Short-Form Video", "Thumbnail Psychology", "Brand Integration", "Community Building", "Analytics"],
        tools: [
          { name: "Multi-Platform Creator Analytics & Media Kit", icon: "📱", description: "Live engagement metrics, brand partnership rate cards and content calendar", badge: "Media Kit" }
        ]
      },
      {
        id: "graphic_designer",
        title: "Brand Identity & Graphic Designer",
        enclaveId: "creative_media_arts",
        categoryName: "Design & Visual Arts",
        defaultHeadline: "Senior Graphic Designer · Brand Identity, Typography Systems, Packaging & Visual Storytelling",
        typicalSkills: ["Vector Typography", "Brand Guidelines", "Packaging Dielines", "Adobe Illustrator", "Color Theory"],
        tools: [
          { name: "Vector Brand Guide & Dieline Inspector", icon: "🎨", description: "Color contrast ratios, CMYK print separations and typography scale charts", badge: "Vector Spec" }
        ]
      },
      {
        id: "artist_craftsperson",
        title: "Fine Artist, Sculptor & Ceramicist",
        enclaveId: "creative_media_arts",
        categoryName: "Fine Arts & Sculpture",
        defaultHeadline: "Contemporary Fine Artist · Mixed-Media Canvas, Sculptural Bronze & Gallery Exhibitions",
        typicalSkills: ["Oil/Acrylic Painting", "Bronze Casting", "Clay Ceramics", "Curatorial Statements", "Gallery Representation"],
        tools: [
          { name: "Gallery Catalog & Provenance Certificate", icon: "🖼️", description: "Certificate of Authenticity generator, exhibition history and gallery sales ledger", badge: "Provenance" }
        ]
      },
      {
        id: "translator_interpreter",
        title: "Certified Professional Translator & Interpreter",
        enclaveId: "creative_media_arts",
        categoryName: "Language & Translation Services",
        defaultHeadline: "ATA-Certified Translator · Legal & Medical Document Translation, Simultaneous Conference Interpreting",
        typicalSkills: ["Simultaneous Interpreting", "Legal Terminology", "Medical Translation", "Localization", "CAT Tools"],
        tools: [
          { name: "CAT Glossary & Terminology Memory Base", icon: "🌐", description: "Translation memory alignment, bilingual concordances and sworn certification seals", badge: "ATA Certified" }
        ]
      },
      {
        id: "sign_language_interpreter",
        title: "Certified American Sign Language (ASL) Interpreter",
        enclaveId: "creative_media_arts",
        categoryName: "Language & Translation Services",
        defaultHeadline: "RID-Certified ASL Interpreter · Educational, Legal & Healthcare Deaf Community Interpreting",
        typicalSkills: ["American Sign Language (ASL)", "Deaf Culture Competency", "RID Code of Conduct", "Educational Interpreting"],
        tools: [
          { name: "RID Interpreting Assignment & Ethics Log", icon: "🤟", description: "Assignment prep briefs, ethical boundary records and continuing education (CEU) tracker", badge: "RID Certified" }
        ]
      }
    ]
  },

  // ─── 8. HEALTHCARE, CLINICAL, DENTAL & CAREGIVING ───────────────
  {
    id: "healthcare_medicine",
    name: "Healthcare, Pharmacy, Nursing, Clinical & Medical Administration",
    shortName: "Healthcare & Medicine",
    icon: "🩺",
    tagline: "Clinical pharmacy, physicians, nursing, medical aides, hospital administration, surgical suites & allied health",
    description: "Dedicated workspace for pharmacists, physicians, surgeons, nurse practitioners, registered nurses, LPNs, certified medical assistants & aides, hospital administrators, paramedics, dentists, and caregivers.",
    themeColor: "from-teal-600 via-emerald-700 to-cyan-800",
    accentBorder: "border-teal-500",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    badgeText: "text-teal-800 dark:text-teal-300",
    securityClearanceTier: "HIPAA Clinical Credential & Medical Board Licensed (Level 3)",
    feedTags: ["#Healthcare", "#Pharmacy", "#Doctors", "#Nursing", "#MedicalAides", "#HealthcareAdmin", "#ClinicalMedicine", "#HospitalOps", "#PublicHealth"],
    professions: [
      {
        id: "pharmacist",
        title: "Doctor of Pharmacy & Clinical Pharmacist (PharmD, BCPS)",
        enclaveId: "healthcare_medicine",
        categoryName: "Pharmacy & Pharmacology",
        defaultHeadline: "Doctor of Pharmacy (PharmD, BCPS) · Clinical Pharmacotherapy, Antimicrobial Stewardship, USP <797>/<800> Sterile IV Compounding & Medication Safety",
        typicalSkills: ["Pharmacokinetics (AUC/MIC)", "Antimicrobial Stewardship", "USP <797>/<800> IV Compounding", "Drug Interaction Verification", "Oncology & ICU Dosing", "Immunization Delivery"],
        tools: [
          { name: "NIH DailyMed & OpenFDA Clinical Formulary", icon: "💊", description: "Live FDA drug monographs, renal CrCl dosing adjustments, IV compatibility and black-box safety alerts", badge: "NIH DailyMed Live" },
          { name: "Barcode Medication Administration (BCMA) Verifier", icon: "🧬", description: "High-alert anticoagulant, insulin and chemotherapy order verification and PharmD consult log", badge: "USP <797> Ready" }
        ]
      },
      {
        id: "pharmacy_technician",
        title: "Certified Pharmacy Technician (CPhT, CSPT)",
        enclaveId: "healthcare_medicine",
        categoryName: "Pharmacy & Pharmacology",
        defaultHeadline: "Certified Compounded Sterile Preparation Pharmacy Technician (CPhT, CSPT) · Pyxis/Omnicell Automation, Cleanroom Aseptic IV Admixture & Narcotic Vault Control",
        typicalSkills: ["Sterile IV Admixture", "Pyxis / Omnicell Restocking", "DEA Controlled Substance Logs", "Third-Party Prior Authorization", "Unit-Dose Packaging"],
        tools: [
          { name: "Cleanroom Hood & Automated Dispensing Log", icon: "🧪", description: "ISO Class 5 laminar airflow pressure logs, beyond-use date (BUD) labels and narcotic cycle counts", badge: "CPhT Verified" }
        ]
      },
      {
        id: "physician",
        title: "Board-Certified Attending Physician (MD / DO)",
        enclaveId: "healthcare_medicine",
        categoryName: "Physicians & Surgeons",
        defaultHeadline: "Board-Certified Attending Physician (MD, FACP) · Internal Medicine, Point-of-Care Ultrasound (POCUS), Complex Diagnostics & Evidence-Based Care",
        typicalSkills: ["Clinical Diagnostics", "Differential Diagnosis", "Point-of-Care Ultrasound (POCUS)", "Inpatient Rounding", "Pharmacotherapy", "Medical Research"],
        tools: [
          { name: "PubMed & MDCalc Clinical Decision Support", icon: "📚", description: "Peer-reviewed treatment algorithms, sepsis SOFA/HEART scores, clinical trial data and drug interaction checker", badge: "MDCalc Live" },
          { name: "HL7 FHIR Inpatient Order Set & H&P Builder", icon: "🩺", description: "Admission history & physicals, ICD-10 diagnostic coding and multidisciplinary consult orders", badge: "FHIR R4" }
        ]
      },
      {
        id: "surgeon_specialist_md",
        title: "Trauma & Surgical Attending Specialist (MD, FACS, FACEP)",
        enclaveId: "healthcare_medicine",
        categoryName: "Physicians & Surgeons",
        defaultHeadline: "Attending Trauma Surgeon & Emergency Medicine Specialist (MD, FACS) · Level 1 Trauma Resuscitation, Robotic Laparoscopy & Surgical ICU",
        typicalSkills: ["ATLS Level 1 Trauma", "Robotic & Laparoscopic Surgery", "eFAST Ultrasound", "Massive Transfusion Protocol", "Critical Care Airway Management"],
        tools: [
          { name: "Surgical WHO Safe Checklist & Intraoperative Log", icon: "🔪", description: "Pre-incision time-out verification, robotic port mapping, blood loss tracking and post-op ICU orders", badge: "ACS Trauma" }
        ]
      },
      {
        id: "nurse_practitioner_pa",
        title: "Nurse Practitioner & Physician Assistant (APRN, DNP, PA-C)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Advanced Practice",
        defaultHeadline: "Board-Certified Family & Acute Care Nurse Practitioner (DNP, APRN, FNP-BC) · Autonomous Prescribing, Chronic Disease Management & Telehealth",
        typicalSkills: ["Advanced Physical Assessment", "DEA Schedule II-V Prescribing", "Chronic Disease Management", "Minor Office Procedures", "Diagnostic Interpretation"],
        tools: [
          { name: "Advanced Practice e-Prescribe & Telehealth Workbench", icon: "📋", description: "Electronic prescribing (EPCS), lab panel interpretation and outpatient care pathway templates", badge: "APRN / PA-C" }
        ]
      },
      {
        id: "registered_nurse",
        title: "Registered Nurse — Inpatient & Med-Surg (BSN, RN)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Advanced Practice",
        defaultHeadline: "Registered Nurse (BSN, RN) · Inpatient Telemetry, High-Alert IV Medication Administration, Wound Care & SBAR Shift Handoffs",
        typicalSkills: ["IV Therapy & Central Lines", "Cardiac Telemetry Monitoring", "5-Rights Medication Admin", "SBAR Clinical Handoffs", "Patient & Family Advocacy"],
        tools: [
          { name: "Clinical EHR & MAR Medication Administration Record", icon: "💉", description: "Real-time barcode MAR verification, intake/output balance and SBAR shift handoff board", badge: "EHR Ready" }
        ]
      },
      {
        id: "critical_care_er_nurse",
        title: "ICU Critical Care & Emergency Trauma Nurse (RN, CCRN, CEN)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Advanced Practice",
        defaultHeadline: "Critical Care & Emergency Trauma Nurse (BSN, RN, CCRN, CEN) · Hemodynamic Vasopressor Titration, CRRT, Mechanical Ventilation & ESI Triage",
        typicalSkills: ["Vasopressor Titration", "Mechanical Ventilation & ABGs", "TNCC / ACLS / PALS", "Continuous Renal Replacement (CRRT)", "Emergency Severity Index (ESI) Triage"],
        tools: [
          { name: "ICU Hemodynamic & Drip Titration Flowsheet", icon: "❤️‍🩹", description: "Norepinephrine/propofol weight-based mcg/kg/min calculators, arterial line MAP tracking and ventilator weaning logs", badge: "CCRN / CEN" }
        ]
      },
      {
        id: "licensed_practical_nurse",
        title: "Licensed Practical / Vocational Nurse (LPN / LVN)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Advanced Practice",
        defaultHeadline: "Licensed Practical Nurse (LPN / LVN) · Subacute Rehab, Complex Wound Dressing, Tracheostomy Care & Long-Term Medication Pass",
        typicalSkills: ["Subacute Medication Pass", "Stage I-IV Wound Care", "Tracheostomy & G-Tube Care", "Blood Glucose & Insulin Protocols", "CNA Team Supervision"],
        tools: [
          { name: "Subacute Wound & Skilled Nursing Flowsheet", icon: "🩹", description: "Braden scale pressure injury scoring, dressing change schedules and physician notification logs", badge: "LPN Skilled Care" }
        ]
      },
      {
        id: "nursing_technician",
        title: "Certified Nursing Technician & Patient Care Tech (PCT, CNA, Nursing Tech)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Advanced Practice",
        defaultHeadline: "Certified Nursing Technician & Inpatient Patient Care Technician (PCT, CNA, CPCT-A) · Bedside Vitals Telemetry, 12-Lead ECG, Venipuncture Phlebotomy, Foley/Wound Assist & Acute Nursing Support",
        typicalSkills: ["Bedside Nursing Support", "12-Lead ECG & Telemetry Lead Placement", "Blood Glucose & Ortho Vitals", "Venipuncture Phlebotomy", "Foley Catheter & Sterile Dressing Assist", "Patient Mobility & Fall Prevention"],
        tools: [
          { name: "Inpatient Nursing Tech & PCT Bedside Flowsheet", icon: "🩺", description: "Hourly Q4H vitals, intake/output (I&O) fluid balance, blood glucose fingerstick logs and RN stat escalation alerts", badge: "PCT / CNA Live" }
        ]
      },
      {
        id: "medical_assistant_aide",
        title: "Certified Medical Assistant & Clinical Nursing Aide (CCMA, CNA)",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical Aides & Clinical Support",
        defaultHeadline: "Certified Clinical Medical Assistant & Nursing Aide (CCMA, CNA, CPT) · Venipuncture Phlebotomy, 12-Lead ECG, Vitals Triage & Bedside Patient Care",
        typicalSkills: ["Venipuncture Phlebotomy", "12-Lead ECG Acquisition", "Vital Signs & Rooming Triage", "CLIA-Waived Point-of-Care Testing", "Sterile Autoclave Instrument Prep", "Patient Mobility & ADLs"],
        tools: [
          { name: "Ambulatory Rooming, Vitals & Phlebotomy Triage Board", icon: "🩺", description: "Rapid outpatient rooming queue, orthostatic vitals, CLIA point-of-care strep/flu/A1c logs and vaccine cold-chain tracking", badge: "CCMA / CNA" }
        ]
      },
      {
        id: "surgical_sterile_tech",
        title: "Certified Surgical Technologist & Sterile Processing Tech (CST, CRCST)",
        enclaveId: "healthcare_medicine",
        categoryName: "Diagnostic Imaging & Allied Health",
        defaultHeadline: "Certified Surgical Technologist & Sterile Processing Specialist (CST, CRCST) · Operating Room Scrub, DaVinci Robotic Draping, Laparoscopic Tray Assembly & Autoclave Biological Sterilization",
        typicalSkills: ["OR Sterile Scrub & Mayo Stand Setup", "DaVinci Xi Robotic Instrument Draping", "Sponge, Sharp & Instrument Counts", "Steam & V-PRO Sterilization (CRCST)", "AAMI ST79 Compliance"],
        tools: [
          { name: "OR Surgical Preference Card & Sterile Tray Tracker", icon: "🔪", description: "Surgeon instrument preference cards, autoclave biological indicator logs and intraoperative count verification", badge: "CST / CRCST" }
        ]
      },
      {
        id: "respiratory_therapist",
        title: "Registered Respiratory Therapist & Cardiopulmonary Specialist (RRT, CRT)",
        enclaveId: "healthcare_medicine",
        categoryName: "Diagnostic Imaging & Allied Health",
        defaultHeadline: "Registered Respiratory Therapist (RRT, ACCS) · ICU Mechanical Ventilation, Arterial Blood Gas (ABG) Interpretation, High-Flow Nasal Cannula, Bronchoscopy Assist & Neonatal/Adult Airway Management",
        typicalSkills: ["ICU Mechanical Ventilation ( Hamilton / Puritan Bennett )", "Arterial Blood Gas (ABG) Analysis", "BiPAP / CPAP & High-Flow O2", "Endotracheal Intubation Assist", "Pulmonary Function Testing (PFT)"],
        tools: [
          { name: "ICU Ventilator Weaning & ABG Oxygenation Calculator", icon: "🫁", description: "P/F ratio, A-a gradient, rapid shallow breathing index (RSBI) and ARDSnet lung-protective tidal volume calculator", badge: "RRT / ACCS" }
        ]
      },
      {
        id: "clinical_lab_phlebotomy_tech",
        title: "Medical Laboratory Scientist & Phlebotomy Technician (MLS, MLT, CPT)",
        enclaveId: "healthcare_medicine",
        categoryName: "Diagnostic Imaging & Allied Health",
        defaultHeadline: "ASCP Medical Laboratory Scientist & Phlebotomy Specialist (MLS, MLT, CPT) · Hematology Flow Cytometry, Blood Bank Crossmatching, Mass Spec Chemistry & STAT Venipuncture",
        typicalSkills: ["Blood Bank Type & Crossmatch", "Hematology & Coagulation Assays", "Clinical Microbiology & PCR", "CLSI Venipuncture Order of Draw", "CAP / CLIA Quality Control"],
        tools: [
          { name: "LIS Critical Value & Blood Bank Crossmatch Console", icon: "🧪", description: "STAT troponin/lactate critical value callback log, Westgard QC rules and massive transfusion blood bank inventory", badge: "ASCP / CLIA" }
        ]
      },
      {
        id: "medical_administrator",
        title: "Hospital & Healthcare System Administrator (MHA, FACHE)",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical & Hospital Administration",
        defaultHeadline: "Fellow of the American College of Healthcare Executives (MHA, MBA, FACHE) · Hospital Operations, Joint Commission Accreditation, HIPAA Governance & Clinical Staffing",
        typicalSkills: ["Hospital Operations & Bed Flow", "Joint Commission (TJC) Accreditation", "HIPAA & CMS Regulatory Compliance", "Value-Based Care & Revenue Cycle", "Physician/Nurse Recruitment & Retention"],
        tools: [
          { name: "Hospital Command Center: Census, ED Boarding & CMS Quality Radar", icon: "🏥", description: "Real-time inpatient bed occupancy, ICU nurse-to-patient staffing ratios, HCAHPS scores and Joint Commission audit readiness", badge: "FACHE Command" }
        ]
      },
      {
        id: "medical_billing_him",
        title: "Health Information & Medical Coding Administrator (RHIA, CPC)",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical & Hospital Administration",
        defaultHeadline: "Registered Health Information Administrator & Certified Professional Coder (RHIA, CPC) · ICD-10-CM/PCS, CPT Revenue Integrity & HIPAA Privacy",
        typicalSkills: ["ICD-10-CM / CPT-4 / HCPCS Coding", "DRG Clinical Documentation Improvement (CDI)", "HIPAA Release of Information", "Claims Denial Management", "EHR Interoperability"],
        tools: [
          { name: "CMS ICD-10 / CPT Revenue Cycle & DRG Auditor", icon: "📊", description: "Automated clinical documentation query generator, NCCI edits validator and clean-claim scrubber", badge: "RHIA / CPC" }
        ]
      },
      {
        id: "paramedic_emt",
        title: "Critical Care Paramedic & EMS Specialist (NRP, FP-C, EMT)",
        enclaveId: "healthcare_medicine",
        categoryName: "Emergency Medical Services (EMS)",
        defaultHeadline: "National Registered Critical Care Paramedic (NRP, FP-C) · Pre-Hospital 12-Lead STEMI Telemetry, RSI Airway Management & Helicopter/Ground EMS",
        typicalSkills: ["Pre-Hospital ACLS / PALS / PHTLS", "12-Lead ECG STEMI Recognition", "Endotracheal Intubation & Cricothyrotomy", "Field Trauma Triage", "Mobile ICU Interfacility Transport"],
        tools: [
          { name: "NEMSIS ePCR Field Telemetry & Hospital Pre-Alert", icon: "🚑", description: "Live 12-lead ECG transmission to cath lab, trauma center ETA pre-alerts and controlled medication box sign-off", badge: "NRP / EMS" }
        ]
      },
      {
        id: "radiology_imaging_tech",
        title: "Radiologic, CT/MRI & Diagnostic Ultrasound Technologist (RT, RDMS)",
        enclaveId: "healthcare_medicine",
        categoryName: "Diagnostic Imaging & Allied Health",
        defaultHeadline: "Registered Radiologic & MRI Technologist (ARRT RT(R)(CT)(MR), RDMS) · High-Resolution Cross-Sectional Imaging, Contrast Safety & PACS DICOM",
        typicalSkills: ["CT Stroke Perfusion & Angiography", "3T MRI Safety Screening", "Vascular & Abdominal Sonography", "ALARA Radiation Protection", "IV Power Injector Contrast"],
        tools: [
          { name: "PACS DICOM Modality Worklist & MRI Zone IV Safety Screener", icon: "🩻", description: "Ferromagnetic implant screening, eGFR contrast nephropathy checks and STAT stroke CT protocol timer", badge: "ARRT / RDMS" }
        ]
      },
      {
        id: "physical_occupational_therapist",
        title: "Doctor of Physical & Occupational Therapy (DPT, OTR/L)",
        enclaveId: "healthcare_medicine",
        categoryName: "Rehabilitation & Allied Health",
        defaultHeadline: "Doctor of Physical Therapy (DPT, OCS) · Post-Operative Orthopedic Rehabilitation, Neuro-Motor Gait Recovery & Functional Mobility",
        typicalSkills: ["Orthopedic Manual Therapy", "Post-Stroke Neuro Rehabilitation", "Gait & Balance Biomechanics", "Therapeutic Exercise Prescription", "Adaptive ADL Equipment"],
        tools: [
          { name: "Goniometric Range-of-Motion (ROM) & Functional Outcome Tracker", icon: "🏃", description: "Joint ROM progression charts, Berg Balance scoring and return-to-work/sport milestones", badge: "DPT / OTR" }
        ]
      },
      {
        id: "herbal_medicine_practitioner",
        title: "Clinical Herbalist, Phytotherapy & Botanical Medicine Practitioner (RH-AHG / ND)",
        enclaveId: "healthcare_medicine",
        categoryName: "Herbal, Botanical & Integrative Medicine",
        defaultHeadline: "Registered Clinical Herbalist (RH-AHG) & Naturopathic Botanical Specialist · Phytotherapy Formulation, Pharmacognosy, cGMP Herbal Extraction & Herb-Drug Safety",
        typicalSkills: ["Clinical Phytotherapy & Herbal Compounding", "Pharmacognosy & Botanical Extraction", "WHO / cGMP Herbal Standardization", "Herb-Drug Interaction Screening", "Tinctures, Decoctions & Phyto-Formulation", "Naturopathic & Traditional Medicine"],
        tools: [
          { name: "Herbal Pharmacopoeia & Herb-Drug Interaction Checker", icon: "🌿", description: "Clinical botanical monographs, cytochrome P450 herb-drug interaction matrix and phyto-dosage calculator", badge: "RH-AHG / WHO" },
          { name: "cGMP Botanical Extraction & Phytochemical Assay Log", icon: "🧪", description: "Solvent ratio extraction logs, HPTLC/HPLC alkaloid standardization and herbal batch COA vault", badge: "cGMP Verified" }
        ]
      },
      {
        id: "dentist",
        title: "Dentist, Orthodontist & Oral-Maxillofacial Surgeon (DDS / DMD)",
        enclaveId: "healthcare_medicine",
        categoryName: "Dentistry & Oral Surgery",
        defaultHeadline: "Doctor of Dental Surgery (DDS / DMD) · Restorative & Cosmetic Dentistry, Digital CBCT Diagnostics, Orthodontics & Oral Implant Surgery",
        typicalSkills: ["Digital CBCT 3D Scans", "Dental Implants & Oral Surgery", "Orthodontics & Invisalign", "Crown, Bridge & Veneers", "Endodontics (Root Canal)", "Periodontal Surgery & Local Anesthesia"],
        tools: [
          { name: "Dental CBCT 3D Radiograph & Implant Planner", icon: "🦷", description: "3D panoramic radiograph analysis, mandibular nerve tracing, implant angulation and caries mapping", badge: "DICOM Live" },
          { name: "ADA Dental Procedure Code (CDT) & Periodontal Vault", icon: "📋", description: "CDT billing codes, orthodontic cephalometric tracing and 6-point periodontal chart logs", badge: "ADA / DDS" }
        ]
      },
      {
        id: "dental_hygienist_assistant",
        title: "Registered Dental Hygienist (RDH), EFDA & Certified Dental Assistant (CDA)",
        enclaveId: "healthcare_medicine",
        categoryName: "Dentistry & Oral Surgery",
        defaultHeadline: "Registered Dental Hygienist (RDH, BS) & Certified Dental Assistant (CDA) · Ultrasonic Periodontal Scaling, Digital Intraoral X-Rays & Chairside Surgical Assisting",
        typicalSkills: ["Ultrasonic Scaling & Root Planing", "Digital Intraoral Radiography (DANB RHS)", "Periodontal Probing & Charting", "Four-Handed Chairside Dentistry", "Autoclave Sterilization & OSHA Infection Control", "Local Block Anesthesia & Nitrous Oxide Monitoring"],
        tools: [
          { name: "Periodontal Probing & Ultrasonic Prophylaxis Console", icon: "🪥", description: "Six-point pocket depth charting, gingival bleeding indices and DANB radiation safety logs", badge: "RDH / DANB" }
        ]
      },
      {
        id: "veterinarian",
        title: "Doctor of Veterinary Medicine (DVM)",
        enclaveId: "healthcare_medicine",
        categoryName: "Veterinary Medicine",
        defaultHeadline: "Doctor of Veterinary Medicine (DVM) · Small Animal Surgery, Pharmacology & Preventive Care",
        typicalSkills: ["Veterinary Surgery", "Ultrasound Diagnostics", "Anesthesia Monitoring", "Zoonotic Diseases", "Vaccination Protocols"],
        tools: [
          { name: "Veterinary Drug Dosimeter & Formulary", icon: "🐾", description: "Weight-based species drug calculations (canine, feline, equine) and anesthesia logs", badge: "Formulary" }
        ]
      },
      {
        id: "animal_trainer",
        title: "Certified Behavioral Animal Trainer",
        enclaveId: "healthcare_medicine",
        categoryName: "Veterinary Medicine",
        defaultHeadline: "Certified Animal Behaviorist · Positive Reinforcement, Service Dog Task Training & Aggression Rehab",
        typicalSkills: ["Positive Reinforcement", "Operant Conditioning", "Service Dog Protocols", "Canine Good Citizen", "Desensitization"],
        tools: [
          { name: "Behavior Conditioning & Task Log", icon: "🦮", description: "Counter-conditioning milestone charts, trigger threshold logs and client video homework", badge: "Behavior Log" }
        ]
      },
      {
        id: "home_health_aide",
        title: "Certified Home Health Aide (CHHA)",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical Aides & Clinical Support",
        defaultHeadline: "Certified Home Health Aide · Activities of Daily Living (ADLs), Vital Signs & In-Home Patient Dignity",
        typicalSkills: ["ADL Assistance", "Vital Signs Monitoring", "Bed Transfer Mechanics", "Medication Reminders", "Infection Control"],
        tools: [
          { name: "In-Home Care Plan & Vitals Log", icon: "🏠", description: "Blood pressure, glucose monitoring, hygiene checklists and nurse care coordinator notes", badge: "Care Plan" }
        ]
      },
      {
        id: "caregiver",
        title: "Professional Caregiver & Family Support Specialist",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical Aides & Clinical Support",
        defaultHeadline: "Professional Caregiver · Compassionate Respite Care, Mobility Assistance & Daily Life Enrichment",
        typicalSkills: ["Compassionate Care", "Fall Prevention", "Nutritional Meals", "Emergency Response", "Companionship"],
        tools: [
          { name: "Daily Care Shift & Medication Schedule", icon: "❤️", description: "Medication adherence log, emergency contacts and family update bulletin", badge: "Daily Log" }
        ]
      },
      {
        id: "childcare_worker",
        title: "Early Childhood Educator & Childcare Specialist",
        enclaveId: "healthcare_medicine",
        categoryName: "Caregiving & Home Support",
        defaultHeadline: "Early Childhood Specialist · Age-Appropriate Developmental Milestones, Safety & Creative Learning",
        typicalSkills: ["Child Development", "Pediatric First Aid/CPR", "Sensory Play", "Positive Redirection", "Parent Communication"],
        tools: [
          { name: "Developmental Milestone Tracker", icon: "🧸", description: "Fine motor milestones, nap/feeding logs and emergency parent contact matrix", badge: "Child Safety" }
        ]
      },
      {
        id: "elderly_care_worker",
        title: "Geriatric & Memory Care Specialist",
        enclaveId: "healthcare_medicine",
        categoryName: "Medical Aides & Clinical Support",
        defaultHeadline: "Memory Care Specialist · Dementia Support, Fall Prevention Protocols & Palliative Comfort",
        typicalSkills: ["Dementia Validation Therapy", "Transfer Safety", "Sundowning Mitigation", "Palliative Care", "Skin Integrity"],
        tools: [
          { name: "Memory Care Routine & Cognitive Log", icon: "👵", description: "Cognitive orientation exercises, hydration tracking and behavioral trigger notes", badge: "Memory Care" }
        ]
      },
      {
        id: "community_health_worker",
        title: "Community Health Outreach Navigator",
        enclaveId: "healthcare_medicine",
        categoryName: "Public Health & Outreach",
        defaultHeadline: "Community Health Worker · Social Determinants of Health (SDOH), Healthcare Access & Immunization Drives",
        typicalSkills: ["SDOH Assessment", "Healthcare Navigation", "Bilingual Outreach", "Cultural Competency", "Public Health"],
        tools: [
          { name: "Community Resource & Benefit Directory", icon: "🤝", description: "Food security programs, Medicaid enrollment guides and clinic transportation vouchers", badge: "Public Health" }
        ]
      }
    ]
  },

  // ─── 9. EDUCATION, TRAINING & WORKFORCE DEVELOPMENT ────────────
  {
    id: "education_workforce",
    name: "Education, Training & Workforce Development",
    shortName: "Education & Workforce",
    icon: "🎓",
    tagline: "Curriculum pacing, vocational CTE credentials, trade apprenticeships & career reskilling",
    description: "Dedicated workspace for academic tutors, vocational trainers, driving instructors, literacy specialists, apprentices, trade school students, and career changers.",
    themeColor: "from-blue-700 via-indigo-800 to-slate-900",
    accentBorder: "border-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeText: "text-blue-800 dark:text-blue-300",
    securityClearanceTier: "Certified Educator & Workforce Facilitator (Level 2)",
    feedTags: ["#Education", "#VocationalTraining", "#Apprenticeship", "#TradeSchool", "#CareerChange", "#Tutoring", "#LifelongLearning", "#JobSeeker"],
    professions: [
      {
        id: "tutor",
        title: "Academic & STEM Learning Specialist",
        enclaveId: "education_workforce",
        categoryName: "Education & Tutoring",
        defaultHeadline: "Professional STEM Tutor · Calculus, Physics, Chemistry & Standardized Test Prep (SAT/ACT)",
        typicalSkills: ["STEM Pedagogy", "Differentiated Instruction", "Diagnostic Assessments", "Curriculum Alignment", "Test Prep"],
        tools: [
          { name: "Interactive Whiteboard & STEM Problem Solver", icon: "📐", description: "Step-by-step mathematical proofs, session recordings and formula cheat sheets", badge: "Live Tutor" }
        ]
      },
      {
        id: "vocational_trainer",
        title: "Vocational & Technical Trade Instructor",
        enclaveId: "education_workforce",
        categoryName: "Vocational & Technical Education",
        defaultHeadline: "CTE Vocational Instructor · Hands-On Shop Safety, NCCER Curriculum & Practical Competency Testing",
        typicalSkills: ["NCCER Standards", "Shop Safety Audits", "Hands-On Rubrics", "Skill Demonstration", "Apprentice Mentorship"],
        tools: [
          { name: "NCCER Trade Competency Rubric", icon: "🛠️", description: "Practical hands-on task evaluations, certification pass slips and shop hours log", badge: "NCCER Sync" }
        ]
      },
      {
        id: "driving_instructor",
        title: "Certified Driver Education Instructor",
        enclaveId: "education_workforce",
        categoryName: "Education & Tutoring",
        defaultHeadline: "State-Licensed Driving Instructor · Behind-the-Wheel Training, Parallel Parking & Defensive Driving",
        typicalSkills: ["Behind-the-Wheel Coaching", "Dual-Control Braking", "State DMV Road Test Prep", "Defensive Driving"],
        tools: [
          { name: "Behind-The-Wheel Hour Log & Road Test Checklist", icon: "🚗", description: "State mandated night/highway hours, maneuver grading and DMV test readiness checklist", badge: "DMV Approved" }
        ]
      },
      {
        id: "literacy_instructor",
        title: "Adult Literacy & ESL Instructor",
        enclaveId: "education_workforce",
        categoryName: "Education & Tutoring",
        defaultHeadline: "Adult Literacy & ESL Specialist · Functional Reading, Conversational English & Citizenship Prep",
        typicalSkills: ["ESL Pedagogy", "Phonics", "Conversational English", "Citizenship Exam Prep", "Adult Learning"],
        tools: [
          { name: "ESL Pacing & Civics Test Flashcards", icon: "📖", description: "Audio pronunciation models, 100 civics question drills and vocabulary lists", badge: "Civics Prep" }
        ]
      },
      {
        id: "apprentice",
        title: "Registered Technical Trade Apprentice",
        enclaveId: "education_workforce",
        categoryName: "Apprenticeship & Career Entry",
        defaultHeadline: "Registered Union Trade Apprentice · On-the-Job Learning, Shop Theory & Tool Proficiency",
        typicalSkills: ["Shop Theory", "Tool Safety", "Print Reading", "Measurement Accuracy", "OSHA 10"],
        tools: [
          { name: "Apprentice OJT Hours & Skill Passbook", icon: "📘", description: "Journeyman sign-offs, verified classroom hours and pay-scale progression tracker", badge: "OJT Verified" }
        ]
      },
      {
        id: "trade_school_student",
        title: "Vocational & Trade Technical Student",
        enclaveId: "education_workforce",
        categoryName: "Apprenticeship & Career Entry",
        defaultHeadline: "Trade Technical Student · Practical Lab Certifications, Tool Mastery & Industry Placement",
        typicalSkills: ["Hands-On Lab Work", "Safety Compliance", "Technical Math", "Troubleshooting"],
        tools: [
          { name: "Student Technical Portfolio & Lab Log", icon: "🎒", description: "Completed project photos, welding coupons, circuit boards and resume exporter", badge: "Portfolio" }
        ]
      },
      {
        id: "school_leaver",
        title: "School Leaver & Emerging Young Professional",
        enclaveId: "education_workforce",
        categoryName: "Career Transitions & Workforce Entry",
        defaultHeadline: "Emerging Young Professional · Eager to Learn, High Work Ethic & Ready for Professional Training",
        typicalSkills: ["Communication", "Digital Literacy", "Punctuality", "Team Collaboration", "Problem Solving"],
        tools: [
          { name: "Entry-Level Skills Passport & Resume Builder", icon: "🌟", description: "One-click resume builder, soft skills badges and interview practice simulator", badge: "Career Start" }
        ]
      },
      {
        id: "unemployed_job_seeker",
        title: "Active Job Seeker & Career Candidate",
        enclaveId: "education_workforce",
        categoryName: "Career Transitions & Workforce Entry",
        defaultHeadline: "Professional Candidate · Open to Work, Cross-Industry Transferable Skills & Immediate Availability",
        typicalSkills: ["Transferable Skills", "Adaptability", "Professionalism", "Rapid Onboarding", "Continuous Learning"],
        tools: [
          { name: "Automated Job Match & Application Tracker", icon: "🎯", description: "Tailored job opening recommendations, hiring manager direct message channels", badge: "Immediate Hire" }
        ]
      },
      {
        id: "career_changer",
        title: "Mid-Career Transitioner & Cross-Skiller",
        enclaveId: "education_workforce",
        categoryName: "Career Transitions & Workforce Entry",
        defaultHeadline: "Mid-Career Transitioner · Bringing 10+ Years of Professional Experience into New Technical Sectors",
        typicalSkills: ["Leadership", "Project Management", "Analytical Thinking", "Strategic Alignment", "Resilience"],
        tools: [
          { name: "Skills Gap Analysis & Transition Blueprint", icon: "🔄", description: "Transferable skill mapping, accelerated credential roadmaps and peer transition network", badge: "Blueprint" }
        ]
      }
    ]
  },

  // ─── 10. COMMUNITY, CIVIC, VETERANS & PUBLIC SAFETY ────────────
  {
    id: "community_civic_security",
    name: "Community, Civic, Veterans & Public Safety",
    shortName: "Civic, Veterans & Security",
    icon: "🎖️",
    tagline: "Veterans transition, non-profit outreach, grassroots organizing, security defense & civic impact",
    description: "Dedicated workspace for military veterans, volunteers, community organizers, youth mentors, non-profit directors, clergy, security officers, waste management technicians, and manufacturing workers.",
    themeColor: "from-slate-700 via-blue-900 to-indigo-950",
    accentBorder: "border-slate-500",
    badgeBg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
    badgeText: "text-slate-800 dark:text-slate-300",
    securityClearanceTier: "Civic Leadership & Public Safety Verification (Level 2)",
    feedTags: ["#Veterans", "#MilitaryTransition", "#CivicImpact", "#SecurityGuards", "#Nonprofit", "#CommunityOrganizer", "#YouthMentorship", "#Manufacturing"],
    professions: [
      {
        id: "military_veteran",
        title: "Military Veteran & Transitioning Service Member",
        enclaveId: "community_civic_security",
        categoryName: "Veterans & Military Transition",
        defaultHeadline: "Honorable Military Veteran · Operational Leadership, Crisis Management & Civilian Career Transition",
        typicalSkills: ["Operational Leadership", "Mission Planning", "Cross-Functional Logistics", "Crisis Response", "Security Clearance"],
        tools: [
          { name: "Military MOS to Civilian Skill Translator", icon: "🎖️", description: "Direct translation of military occupational specialties into corporate and trade job roles", badge: "DoD Sync" },
          { name: "VA Benefits & Career Transition Portal", icon: "🇺🇸", description: "GI Bill trade school funding, VA home loan guides and veteran hiring preferences", badge: "VA Benefits" }
        ]
      },
      {
        id: "volunteer",
        title: "Civic Volunteer & Disaster Relief Worker",
        enclaveId: "community_civic_security",
        categoryName: "Civic & Community Engagement",
        defaultHeadline: "Dedicated Community Volunteer · Disaster Relief, Food Bank Operations & Mutual Aid Coordination",
        typicalSkills: ["Mutual Aid", "Disaster Response", "Food Distribution", "Compassion", "Community Mobilization"],
        tools: [
          { name: "Volunteer Shift & Mutual Aid Board", icon: "🤝", description: "Emergency relief shifts, supply depot volunteer calls and community service hour logs", badge: "Volunteer Hub" }
        ]
      },
      {
        id: "community_organizer",
        title: "Grassroots Community Organizer & Civic Advocate",
        enclaveId: "community_civic_security",
        categoryName: "Civic & Community Engagement",
        defaultHeadline: "Grassroots Community Organizer · Coalition Building, Civic Action & Public Policy Advocacy",
        typicalSkills: ["Canvassing", "Public Speaking", "Coalition Building", "Town Hall Organizing", "Policy Writing"],
        tools: [
          { name: "Civic Campaign & Action Canvas", icon: "📢", description: "Petition trackers, town hall attendance maps and voter education resource library", badge: "Civic Desk" }
        ]
      },
      {
        id: "youth_mentor",
        title: "Youth Guidance Mentor & Leadership Coach",
        enclaveId: "community_civic_security",
        categoryName: "Civic & Community Engagement",
        defaultHeadline: "Youth Mentor · Academic Motivation, Life Skills Coaching & At-Risk Youth Guidance",
        typicalSkills: ["Active Listening", "Youth Development", "Goal Setting", "Conflict Resolution", "Safety Protocol"],
        tools: [
          { name: "Youth Goal Map & Session Tracker", icon: "🌱", description: "Goal achievement ladders, positive behavior milestones and parent feedback loops", badge: "Mentorship" }
        ]
      },
      {
        id: "nonprofit_worker",
        title: "Nonprofit Program Manager & Development Lead",
        enclaveId: "community_civic_security",
        categoryName: "Civic & Community Engagement",
        defaultHeadline: "Nonprofit Program Director · Grant Writing, Impact Metrics & Community Outreach",
        typicalSkills: ["Grant Writing", "Donor Management", "Program Evaluation", "501(c)(3) Compliance", "Fundraising"],
        tools: [
          { name: "Grant Application & Impact Metric Log", icon: "📊", description: "Federal grant compliance, donor acknowledgment templates and social impact dashboards", badge: "501(c)(3)" }
        ]
      },
      {
        id: "religious_worker_clergy",
        title: "Pastor, Minister, Rabbi, Imam & Chaplain",
        enclaveId: "community_civic_security",
        categoryName: "Civic & Community Engagement",
        defaultHeadline: "Faith Leader & Community Chaplain · Pastoral Counseling, Interfaith Dialogue & Spiritual Guidance",
        typicalSkills: ["Pastoral Counseling", "Homiletics", "Grief Support", "Hospital Ministry", "Interfaith Leadership"],
        tools: [
          { name: "Pastoral Care & Visitation Schedule", icon: "🕊️", description: "Hospital visitation logs, confidential counseling schedules and memorial service plans", badge: "Pastoral Care" }
        ]
      },
      {
        id: "security_guard",
        title: "Licensed Physical Security & Protective Guard",
        enclaveId: "community_civic_security",
        categoryName: "Public Safety & Security",
        defaultHeadline: "Licensed Security Professional · Access Control, CCTV Surveillance, De-escalation & Incident Reports",
        typicalSkills: ["Access Control", "CCTV Monitoring", "Incident Reports", "De-escalation", "First Aid/CPR", "Patrol Protocols"],
        tools: [
          { name: "Incident Report & Guard Tour Verification", icon: "🛡️", description: "NFC checkpoint patrol scans, daily incident logs and visitor badge logging", badge: "Patrol Verified" }
        ]
      },
      {
        id: "waste_management_worker",
        title: "Environmental Services & Waste Management Technician",
        enclaveId: "community_civic_security",
        categoryName: "Public Safety & Security",
        defaultHeadline: "Waste Management Specialist · Municipal Sanitation, Heavy Compactor Operations & Recycling Sort",
        typicalSkills: ["Commercial Compactor", "HazMat Safety", "Route Navigation", "Recycling Stream Sorting", "OSHA Compliance"],
        tools: [
          { name: "Municipal Route & Waste Stream Tonnage", icon: "♻️", description: "Curbside route maps, transfer station scale receipts and recycling contamination logs", badge: "Eco Route" }
        ]
      },
      {
        id: "factory_worker",
        title: "Precision Manufacturing & Assembly Technician",
        enclaveId: "community_civic_security",
        categoryName: "Industrial Manufacturing & Production",
        defaultHeadline: "Manufacturing Technician · High-Speed Assembly Line, Lean 5S, Quality Inspection & Safety",
        typicalSkills: ["Assembly Line Operations", "Lean 5S", "Caliper Inspection", "Poka-Yoke Assembly", "Safety Lockout"],
        tools: [
          { name: "Lean 5S Audit & Production Takt Time", icon: "🏭", description: "Hourly production takt time, scrap rate monitoring and 5S workstation checklist", badge: "Lean 5S" }
        ]
      },
      {
        id: "firefighter_search_rescue",
        title: "Firefighter, HazMat & Search-and-Rescue Specialist",
        enclaveId: "community_civic_security",
        categoryName: "Public Safety & Emergency Services",
        defaultHeadline: "NFPA 1001 Certified Firefighter & USAR Technician · Structural Suppression, Technical Rope Rescue & Incident Command",
        typicalSkills: ["NFPA 1001 Suppression", "Technical Rope Rescue", "HazMat Operations", "FEMA ICS-300", "Thermal Imaging"],
        tools: [
          { name: "ICS Incident Command & Hydrant Tactical Map", icon: "🚒", description: "Pre-incident building layouts, hydrant flow rates and MAYDAY LUNAR telemetry", badge: "NFPA 1001" }
        ]
      },
      {
        id: "emergency_dispatcher_resilience",
        title: "911 Emergency Dispatcher & Disaster Recovery Coordinator",
        enclaveId: "community_civic_security",
        categoryName: "Disaster Recovery & Infrastructure Resilience",
        defaultHeadline: "APCO Certified Public Safety Telecommunicator & Flood/Dam Resilience Planner · CAD Dispatch & Hazard Mitigation",
        typicalSkills: ["APCO CAD Dispatch", "Emergency Medical Dispatch (EMD)", "Dam & Flood Control", "FEMA Continuity Planning"],
        tools: [
          { name: "Multi-Agency CAD & Flood Telemetry Console", icon: "🚨", description: "Real-time unit AVL routing, floodgate telemetry and emergency power generator status", badge: "CAD Live" }
        ]
      },
      {
        id: "municipal_public_works_inspector",
        title: "Municipal Public Works, Bridge & Code Enforcement Specialist",
        enclaveId: "community_civic_security",
        categoryName: "Government, Civic & Municipal Services",
        defaultHeadline: "Municipal Infrastructure & Code Enforcement Officer · Bridge Inspection, Roadways, Building Permits & GIS Mapping",
        typicalSkills: ["NBIS Bridge Inspection", "Municipal Code Enforcement", "ArcGIS Field Maps", "Asphalt/Paving Specs", "Public Transit Ops"],
        tools: [
          { name: "Municipal GIS Asset & Permit Ledger", icon: "🏙️", description: "Right-of-way permits, bridge deck condition ratings and municipal work order dispatch", badge: "GovGIS" }
        ]
      },
      {
        id: "private_investigator_executive_protection",
        title: "Licensed Private Investigator, Loss Prevention & Executive Protection",
        enclaveId: "community_civic_security",
        categoryName: "Security, Investigations & Protective Services",
        defaultHeadline: "Licensed Private Investigator & CPP Physical Security Assessor · OSINT, Surveillance, Fire Alarm & Access Control",
        typicalSkills: ["ASIS CPP Physical Security", "Surveillance & Chain of Evidence", "NICET Fire Alarm Inspection", "Loss Prevention", "Close Protection"],
        tools: [
          { name: "Physical Security & Investigative Case Vault", icon: "🕵️", description: "Chain-of-custody evidence logs, perimeter vulnerability audits and NICET alarm checklists", badge: "ASIS CPP" }
        ]
      }
    ]
  },

  // ─── 11. CYBERSECURITY & OFFENSIVE SECURITY ─────────────────────
  {
    id: "tech_cybersecurity",
    name: "Cybersecurity, OT/ICS Industrial Security & Threat Ops",
    shortName: "Cybersecurity & OT Security",
    icon: "🛡️",
    tagline: "Live DAST sandboxes, OT/SCADA industrial defense, malware hypervisors & ransomware recovery",
    description: "Dedicated workspace for red teamers, OT/ICS industrial cybersecurity technicians, penetration testers, reverse engineers, DFIR responders, and threat hunters.",
    themeColor: "from-cyan-600 via-blue-700 to-indigo-900",
    accentBorder: "border-cyan-500",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
    badgeText: "text-cyan-800 dark:text-cyan-300",
    securityClearanceTier: "TS/SCI Red Team & GICSP OT Operator (Level 4)",
    feedTags: ["#Cybersecurity", "#RedTeam", "#OTSecurity", "#SCADA", "#DFIR", "#Pentest", "#ZeroTrust"],
    professions: [
      {
        id: "red_team_operator",
        title: "Principal Red Team Operator & Exploit Developer",
        enclaveId: "tech_cybersecurity",
        categoryName: "Cybersecurity & Infosec",
        defaultHeadline: "Principal Red Team Lead · Adversary Emulation, Zero-Day Weaponization & Kernel EDR Evasion",
        typicalSkills: ["Adversary Emulation", "EDR Evasion", "Active Directory Attacks", "C2 Infrastructure", "OSCP/OSCE3"],
        tools: [
          { name: "11-DAST Dynamic Pentest Platform", icon: "⚡", description: "Automated black-box web vulnerability scanner & fuzzing engine", badge: "LIVE VERCEL" },
          { name: "16-Malware Detonation Hypervisor", icon: "☣️", description: "Live binary detonation, API hooking & memory dump triage", badge: "LIVE VERCEL" }
        ]
      },
      {
        id: "industrial_ot_cyber_technician",
        title: "Industrial Cybersecurity (OT / ICS / SCADA) Technician",
        enclaveId: "tech_cybersecurity",
        categoryName: "Emerging Industrial Cybersecurity",
        defaultHeadline: "GICSP Certified Industrial Cybersecurity Specialist · Modbus/DNP3 Deep Packet Inspection, PLC Hardening & Air-Gap Defense",
        typicalSkills: ["IEC 62443", "GICSP Certification", "Modbus/PROFINET Security", "Purdue Model Segmentation", "Nozomi/Claroty"],
        tools: [
          { name: "OT/SCADA Purdue Network Diode Monitor", icon: "🏭", description: "PLC firmware integrity verification and industrial protocol anomaly detection", badge: "IEC 62443" }
        ]
      }
    ]
  },

  // ─── 12. SOFTWARE, CLOUD, DIGITAL CREATORS & AI ENGINEERING ─────
  {
    id: "tech_software",
    name: "Software, Cloud Architecture, No-Code & AI Engineering",
    shortName: "Software, Cloud & AI",
    icon: "💻",
    tagline: "AST static analysis, AI workflow engineering, no-code builders, technical writing & open-source",
    description: "Dedicated workspace for software engineers, cloud architects, AI workflow specialists, no-code builders, technical writers, and digital knowledge professionals.",
    themeColor: "from-blue-600 via-indigo-700 to-purple-800",
    accentBorder: "border-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeText: "text-blue-800 dark:text-blue-300",
    securityClearanceTier: "Staff Cloud & AI Systems Engineer (Level 3)",
    feedTags: ["#SoftwareEngineering", "#CloudArchitecture", "#AIWorkflows", "#NoCode", "#TechnicalWriting", "#OpenSource"],
    professions: [
      {
        id: "software_engineer",
        title: "Staff Software Engineer / Full-Stack Architect",
        enclaveId: "tech_software",
        categoryName: "Software & Cloud Engineering",
        defaultHeadline: "Staff Software Engineer · Distributed Systems, Next.js Fullstack, Rust & High-Concurrency APIs",
        typicalSkills: ["TypeScript / Next.js", "Distributed Systems", "PostgreSQL / Redis", "CI/CD Pipelines", "Docker & K8s"],
        tools: [
          { name: "05-SAST Static Code Analyzer", icon: "🔍", description: "AST security vulnerability detection with automated GitHub PR generation", badge: "LIVE VERCEL" },
          { name: "18-Unified Integration Bus", icon: "🌐", description: "Enterprise event-driven microservices & API integration layer", badge: "LIVE VERCEL" }
        ]
      },
      {
        id: "ai_workflow_nocode_specialist",
        title: "AI Implementation Technician, No-Code Builder & Technical Writer",
        enclaveId: "tech_software",
        categoryName: "Emerging Digital & Knowledge Professions",
        defaultHeadline: "AI Workflow Specialist & Technical Documentation Lead · RAG Pipelines, No-Code Automation, WCAG Accessibility & API Docs",
        typicalSkills: ["AI Agent Workflows", "Prompt Engineering", "No-Code Automation", "Docs-as-Code", "WCAG 2.2 Accessibility"],
        tools: [
          { name: "AI Agent Workflow & WCAG Accessibility Auditor", icon: "🤖", description: "Automated LLM evaluation benchmarks, localization memory and accessibility testing", badge: "AI Ops" }
        ]
      }
    ]
  },

  // ─── 13. LAWYERS, JUDGES, COURTS, PARALEGAL & NATIONAL DEFENSE ──
  {
    id: "law_gov_defense",
    name: "Lawyers, Judges, Courts, Paralegal & Defense",
    shortName: "Lawyers, Judges & Legal",
    icon: "⚖️",
    tagline: "Trial lawyers, federal & state judges, judicial chambers, litigation dockets, appellate briefs, paralegals & defense",
    description: "Dedicated workspace for trial lawyers, corporate & IP attorneys, criminal defense lawyers, prosecutors, federal & state judges, administrative law judges (ALJs), magistrates, arbitrators, judicial law clerks, paralegals, court reporters, notaries, and defense counsel.",
    themeColor: "from-slate-700 via-indigo-900 to-zinc-950",
    accentBorder: "border-indigo-500",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    badgeText: "text-indigo-800 dark:text-indigo-300",
    securityClearanceTier: "Bar Admission (JD / Esq.) & Judicial Chambers Credential (Level 4)",
    feedTags: ["#Lawyer", "#Judge", "#Judiciary", "#TrialAttorney", "#Litigation", "#AppellateLaw", "#CriminalDefense", "#Paralegal", "#CourtReporter", "#Arbitration", "#Compliance"],
    professions: [
      {
        id: "trial_litigation_lawyer",
        title: "Trial Lawyer & Civil/Commercial Litigation Attorney (JD / Esq.)",
        enclaveId: "law_gov_defense",
        categoryName: "Lawyers & Legal Counsel",
        defaultHeadline: "Lead Trial Lawyer & Litigation Partner (JD / Esq.) · Complex Commercial Trials, Jury Voir Dire, Appellate Briefs & Class Actions",
        typicalSkills: ["First-Chair Jury Trials", "Civil Procedure (FRCP)", "Appellate Oral Argument", "Westlaw / LexisNexis Research", "Depositions & Cross-Examination", "Summary Judgment Briefs"],
        tools: [
          { name: "PACER / CM-ECF Federal Court Docket & Brief Vault", icon: "⚖️", description: "Live federal/state case docket alerts, Bluebook citation checker & trial exhibit binder", badge: "Bar Verified" },
          { name: "Westlaw Precision & Lexis+ Case Law Shepardizer", icon: "📚", description: "KeyCite/Shepard's precedent validation, judicial motion analytics & jury verdict database", badge: "Litigation" }
        ]
      },
      {
        id: "judge_judicial_magistrate",
        title: "Federal & State Court Judge, Magistrate & Appellate Justice",
        enclaveId: "law_gov_defense",
        categoryName: "Judges, Judiciary & Magistrates",
        defaultHeadline: "Honorable Presiding Judge & Judicial Magistrate · Civil & Criminal Bench Trials, Constitutional Rulings, Evidentiary Hearings & Sentencing",
        typicalSkills: ["Judicial Opinion Drafting", "Federal Rules of Evidence (FRE)", "Bench Trials & Injunctions", "Constitutional Interpretation", "Case Management Orders", "Sentencing Guidelines"],
        tools: [
          { name: "Judicial Chambers Benchbook & Evidentiary Ruling Console", icon: "👩‍⚖️", description: "FRE 403/702 Daubert admissibility checklists, bench memorandum templates & docket calendar", badge: "Judiciary" },
          { name: "Sentencing Guidelines & Opinion Citation Verifier", icon: "🏛️", description: "U.S. Sentencing Commission guideline matrix, statutory construction & chambers clerk workflow", badge: "Chambers" }
        ]
      },
      {
        id: "criminal_defense_prosecutor_lawyer",
        title: "Criminal Defense Lawyer, Prosecutor (ADA / AUSA) & Public Defender",
        enclaveId: "law_gov_defense",
        categoryName: "Lawyers & Legal Counsel",
        defaultHeadline: "Trial Attorney · White-Collar & Felony Criminal Defense, Constitutional 4th/5th/6th Amendment Litigation & Brady Discovery",
        typicalSkills: ["Felony Jury Trials", "Brady / Giglio Discovery", "4th Amendment Suppression Motions", "Grand Jury Practice", "Forensic Evidence Cross-Exam", "Plea & Sentencing Advocacy"],
        tools: [
          { name: "Criminal Discovery, Body-Cam & Suppression Motion Desk", icon: "🛡️", description: "Brady disclosure tracker, evidentiary chain-of-custody audit & bail/sentencing calculator", badge: "Trial Bar" }
        ]
      },
      {
        id: "administrative_law_judge_arbitrator",
        title: "Administrative Law Judge (ALJ), Arbitrator & Certified Mediator",
        enclaveId: "law_gov_defense",
        categoryName: "Judges, Judiciary & Magistrates",
        defaultHeadline: "Administrative Law Judge (ALJ) & JAMS/AAA Neutral Arbitrator · Regulatory Adjudication, Commercial Arbitration Awards & Settlement Mediation",
        typicalSkills: ["Administrative Procedure Act (APA)", "AAA / JAMS / ICC Arbitration", "Evidentiary Administrative Hearings", "Mediation & ADR Settlement", "Final Agency Decisions"],
        tools: [
          { name: "APA Adjudication & Arbitration Award Drafting Suite", icon: "📜", description: "Administrative record indexing, evidentiary weight findings & binding arbitration award builder", badge: "ALJ / JAMS" }
        ]
      },
      {
        id: "family_immigration_humanrights_lawyer",
        title: "Immigration, Family Law, Civil Rights & Constitutional Lawyer (JD)",
        enclaveId: "law_gov_defense",
        categoryName: "Lawyers & Legal Counsel",
        defaultHeadline: "Managing Attorney · Employment/Family Immigration (EB-1/O-1/H-1B), Domestic Relations, Civil Rights (§ 1983) & Asylum Advocacy",
        typicalSkills: ["USCIS / EOIR Immigration Filings", "Family Law & Child Custody", "42 U.S.C. § 1983 Civil Rights", "Equitable Asset Division", "Appellate Habeas Corpus"],
        tools: [
          { name: "USCIS Visa Priority & Family Support Guideline Calculator", icon: "🌎", description: "Visa Bulletin priority tracker, I-140/I-485 petition assembly & state domestic support worksheets", badge: "AILA / Family" }
        ]
      },
      {
        id: "ip_patent_tax_estate_lawyer",
        title: "Intellectual Property (USPTO Patent), Tax, Real Estate & Estate Lawyer",
        enclaveId: "law_gov_defense",
        categoryName: "Lawyers & Legal Counsel",
        defaultHeadline: "USPTO Registered Patent Attorney & Tax/Trusts Counsel (JD / LL.M.) · Patent Prosecution, PTAB IPRs, Commercial Real Estate & Estate Planning",
        typicalSkills: ["USPTO Patent Prosecution", "Trademark & Copyright Litigation", "IRS Tax Controversy (LL.M.)", "Fiduciary Trusts & Estates", "Commercial Real Estate Closings"],
        tools: [
          { name: "USPTO Patent Claim Chart & Fiduciary Estate Modeler", icon: "💡", description: "Prior art claim construction matrix, PTAB docket tracker & generation-skipping trust calculator", badge: "USPTO Bar" }
        ]
      },
      {
        id: "judicial_law_clerk_court_counsel",
        title: "Judicial Law Clerk, Appellate Chambers Counsel & Clerk of Court",
        enclaveId: "law_gov_defense",
        categoryName: "Judges, Judiciary & Magistrates",
        defaultHeadline: "Federal Judicial Law Clerk & Appellate Staff Attorney · Bench Memoranda, Certiorari Petitions, Opinion Drafting & Court Administration",
        typicalSkills: ["Bench Memoranda Drafting", "Bluebook Law Review Editing", "Statutory & Constitutional Research", "Oral Argument Prep", "Court Docket Administration"],
        tools: [
          { name: "Chambers Bench Memo & Bluebook Citation Engine", icon: "✒️", description: "Record cite verification, circuit split tracker & chambers opinion workflow", badge: "Chambers Clerk" }
        ]
      },
      {
        id: "corporate_attorney",
        title: "General Counsel, M&A & Regulatory Compliance Lawyer (JD)",
        enclaveId: "law_gov_defense",
        categoryName: "Corporate & Gov Counsel",
        defaultHeadline: "General Counsel & Corporate M&A Partner (JD) · SEC Governance, Federal Contracting, CMMC Cybersecurity Defense & Cross-Border Deals",
        typicalSkills: ["Corporate M&A & Venture Deals", "SEC Governance & Compliance", "Federal Acquisition Regs (FAR)", "ITAR / Export Controls", "CMMC Level 2"],
        tools: [
          { name: "Aegis RMF Continuous ATO Platform", icon: "📜", description: "NIST SP 800-53 OSCAL machine-readable compliance & continuous POAM engine", badge: "LIVE cATO" },
          { name: "15-Threat Modeling Suite", icon: "🛡️", description: "STRIDE automated threat vector analysis & architectural mitigation catalog", badge: "LIVE VERCEL" }
        ]
      },
      {
        id: "paralegal_court_reporter",
        title: "Certified Paralegal, Court Reporter & E-Discovery Specialist",
        enclaveId: "law_gov_defense",
        categoryName: "Paralegal & Court Ops",
        defaultHeadline: "NALA Certified Paralegal & RPR Realtime Court Reporter · Litigation Docketing, Stenography, Relativity E-Discovery & Subpoenas",
        typicalSkills: ["NALA CP Certification", "225 WPM Stenography", "Relativity E-Discovery", "PACER E-Filing", "Process Service"],
        tools: [
          { name: "Litigation Docket, E-Discovery & Transcript Vault", icon: "⚖️", description: "Bates numbering, deposition realtime stenography feed and court filing deadline calculator", badge: "NALA / NCRA" }
        ]
      },
      {
        id: "notary_contract_licensing_specialist",
        title: "Notary Signing Agent, Contract Administrator & Permit Coordinator",
        enclaveId: "law_gov_defense",
        categoryName: "Paralegal & Court Ops",
        defaultHeadline: "NNA Certified Notary Signing Agent & Contract Administrator · Loan Closings, CLM Redlines, Records Management & Municipal Licensing",
        typicalSkills: ["NNA Loan Signing", "Remote Online Notarization (RON)", "Contract Lifecycle (CLM)", "IAPP CIPP Privacy", "Permit Coordination"],
        tools: [
          { name: "RON Digital Seal & Contract Redline Matrix", icon: "🖋️", description: "Tamper-evident electronic notary journal, SLA obligation tracker and permit status board", badge: "NNA Verified" }
        ]
      }
    ]
  },

  // ─── 14. FINANCE, BOOKKEEPING, INSURANCE & MICROFINANCE ─────────
  {
    id: "finance_accounting",
    name: "Finance, Bookkeeping, Insurance, Claims & Microfinance",
    shortName: "Finance, Tax & Insurance",
    icon: "📊",
    tagline: "Bookkeeping ledgers, payroll, tax prep, insurance claims adjusting, procurement & credit unions",
    description: "Dedicated workspace for bookkeepers, payroll clerks, tax preparers, AP/AR specialists, insurance claims adjusters, loan officers, procurement agents, microfinance officers, and CPAs.",
    themeColor: "from-emerald-700 to-green-900",
    accentBorder: "border-emerald-600",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "Financial Fiduciary & Claims Licensing (Level 2)",
    feedTags: ["#Bookkeeping", "#Payroll", "#TaxPrep", "#ClaimsAdjuster", "#Procurement", "#Microfinance", "#CPA"],
    professions: [
      {
        id: "cpa_accountant",
        title: "Certified Public Accountant (CPA) / Controller",
        enclaveId: "finance_accounting",
        categoryName: "Finance & Accounting",
        defaultHeadline: "CPA · Corporate Financial Controller, Forensic Audit & Tax Strategy",
        typicalSkills: ["GAAP Audit", "Tax Strategy", "Forensic Accounting", "ERP Systems", "Financial Reporting", "IFRS"],
        tools: [
          { name: "GAAP Ledger Reconciler", icon: "📑", description: "Automated bank feed anomaly detection and tax schedule export", badge: "GAAP Ready" }
        ]
      },
      {
        id: "bookkeeper_payroll_tax_specialist",
        title: "Certified Bookkeeper, Payroll Specialist & Enrolled Agent Tax Preparer",
        enclaveId: "finance_accounting",
        categoryName: "Bookkeeping, Payroll & Tax Operations",
        defaultHeadline: "AIPB Certified Bookkeeper, CPP Payroll Lead & IRS Enrolled Agent · AP/AR Three-Way Match, Multi-State Payroll & Tax Filings",
        typicalSkills: ["QuickBooks / Xero", "CPP Multi-State Payroll", "IRS Enrolled Agent", "AP/AR Reconciliation", "Cost Accounting"],
        tools: [
          { name: "Three-Way AP/AR Match & Payroll Tax Calculator", icon: "🧮", description: "Automated PO-invoice-receipt matching, W-2/1099 compliance and trial balance audit", badge: "AIPB / CPP" }
        ]
      },
      {
        id: "insurance_claims_loan_microfinance",
        title: "Catastrophe Insurance Claims Adjuster, Loan Officer & Microfinance Lead",
        enclaveId: "finance_accounting",
        categoryName: "Insurance, Lending & Cooperative Finance",
        defaultHeadline: "Licensed Catastrophe Claims Adjuster (AIC) & NMLS Mortgage Processor · Xactimate Property Estimates, Underwriting & Credit Union Lending",
        typicalSkills: ["Xactimate Claims Estimating", "AIC Adjuster License", "NMLS Mortgage Processing", "CFE Fraud Investigation", "Microfinance Cooperatives"],
        tools: [
          { name: "Xactimate Property Loss & Loan Underwriting Desk", icon: "🏠", description: "Drone roof damage scope estimator, DTI credit scoring and cooperative micro-loan ledger", badge: "AIC / NMLS" }
        ]
      }
    ]
  },

  // ─── 15. HIGHER EDUCATION & CAMPUS ──────────────────────────────
  {
    id: "campus_students",
    name: "Higher Education & Campus OS",
    shortName: "Higher Ed & Campus",
    icon: "🎓",
    tagline: "Salisbury University Campus OS, TU Housing portal, university research & student fellowships",
    description: "Dedicated workspace for undergraduate/graduate students, academic researchers, and campus residential life.",
    themeColor: "from-rose-600 via-pink-700 to-purple-800",
    accentBorder: "border-rose-500",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    badgeText: "text-rose-800 dark:text-rose-300",
    securityClearanceTier: "Verified Student & Faculty Scholar (Level 1)",
    feedTags: ["#CampusLife", "#University", "#HigherEd", "#SalisburyUniversity", "#StudentHousing", "#CareerOrbit"],
    professions: [
      {
        id: "college_student",
        title: "University Undergraduate & Research Fellow",
        enclaveId: "campus_students",
        categoryName: "Higher Education & Campus",
        defaultHeadline: "Honors Scholar & Computer Science Student · Salisbury University Campus OS Fellow",
        typicalSkills: ["Academic Research", "Peer Collaboration", "Algorithms", "Campus Leadership", "Internship Ready"],
        tools: [
          { name: "Salisbury University Campus OS", icon: "🏫", description: "Student course rosters, event calendars, dining hours & campus directory", badge: "LIVE VERCEL" },
          { name: "TU Housing & Dorm Roommate Portal", icon: "🏠", description: "Off-campus apartment placement, roommate personality matching & sublease contracts", badge: "LIVE VERCEL" }
        ]
      }
    ]
  },

  // ─── 16. MANUFACTURING, INDUSTRIAL, TEXTILE & PACKAGING OPS ─────
  {
    id: "manufacturing_industrial",
    name: "Manufacturing, Precision Machining, Textile & Packaging Ops",
    shortName: "Manufacturing & Machining",
    icon: "🏭",
    tagline: "5-axis CNC machining, tool & die, industrial robotics, NDT testing, glass/ceramics & packaging",
    description: "Dedicated workspace for CNC machinists, tool and die makers, robotics technicians, NDT inspectors, injection molding techs, 3D additive manufacturing specialists, textile/footwear makers, glass blowers, print operators, and equipment lifecycle refurbishers.",
    themeColor: "from-orange-600 via-amber-700 to-stone-900",
    accentBorder: "border-orange-500",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
    badgeText: "text-orange-800 dark:text-orange-300",
    securityClearanceTier: "NIMS Master Machinist & ASNT NDT Level III (Level 3)",
    feedTags: ["#CNCMachining", "#ToolAndDie", "#IndustrialRobotics", "#NDTTesting", "#InjectionMolding", "#AdditiveManufacturing", "#Packaging", "#TextileProduction"],
    professions: [
      {
        id: "cnc_machinist_tool_die",
        title: "5-Axis CNC Machinist, Programmer & Tool-and-Die Maker",
        enclaveId: "manufacturing_industrial",
        categoryName: "Precision Machining & Tooling",
        defaultHeadline: "NIMS Certified 5-Axis CNC Programmer & Master Toolmaker · Mastercam, Fanuc G-Code, GD&T & Progressive Stamping Dies",
        typicalSkills: ["5-Axis CNC Milling", "Mastercam / Siemens NX", "GD&T (ASME Y14.5)", "CMM Metrology", "Progressive Die Design", "Wire EDM"],
        tools: [
          { name: "G-Code Speeds/Feeds & GD&T Tolerance Calc", icon: "⚙️", description: "Chip load, surface feet per minute (SFM) and CMM coordinate inspection report log", badge: "NIMS Certified" }
        ]
      },
      {
        id: "robotics_automation_ndt_tech",
        title: "Industrial Robotics, PLC Automation & ASNT NDT Inspector",
        enclaveId: "manufacturing_industrial",
        categoryName: "Industrial Automation & Quality Assurance",
        defaultHeadline: "FANUC/KUKA Robotics Maintenance Specialist & ASNT Level III NDT Inspector · Ultrasonic Phased Array, Allen-Bradley PLCs & Six Sigma",
        typicalSkills: ["FANUC / ABB Robotics", "Allen-Bradley Studio 5000", "Ultrasonic & X-Ray NDT", "Six Sigma Green Belt", "Hydraulic/Pneumatic Servo"],
        tools: [
          { name: "PLC Ladder Logic & NDT Phased-Array Scan Vault", icon: "🤖", description: "Robot axis zeroing logs, ultrasonic weld flaw scans and OEE downtime analytics", badge: "ASNT Level III" }
        ]
      },
      {
        id: "molding_additive_packaging_tech",
        title: "Injection Molding, 3D Additive, Glass, Print & Packaging Specialist",
        enclaveId: "manufacturing_industrial",
        categoryName: "Polymers, Additive, Glass & Packaging Production",
        defaultHeadline: "RJG Master Molder & Additive DMLS Technician · Scientific Injection Molding, High-Speed Packaging Lines, Offset Press & Kiln Ops",
        typicalSkills: ["RJG Scientific Molding", "Metal 3D Printing (DMLS)", "Packaging Line Changeover", "Glass/Ceramic Kiln Firing", "Flexographic Prepress"],
        tools: [
          { name: "Cavity Pressure & Packaging Line OEE Console", icon: "📦", description: "Melt temperature viscosity curves, DMLS laser sinter logs and carton die-cut templates", badge: "RJG Master" }
        ]
      },
      {
        id: "leather_footwear_equipment_lifecycle",
        title: "Master Cobbler, Leatherworker & Industrial Equipment Refurbisher",
        enclaveId: "manufacturing_industrial",
        categoryName: "Textile, Footwear & Equipment Lifecycle Management",
        defaultHeadline: "Bespoke Goodyear-Welt Shoemaker & Industrial Asset Lifecycle Specialist · Pattern Grading, Spare Parts MRO & Reverse Logistics",
        typicalSkills: ["Goodyear Welt Construction", "Leather Pattern Grading", "Industrial Sewing Tech", "MRO Spare Parts", "Equipment Refurbishment"],
        tools: [
          { name: "MRO Spare Parts & Equipment Lifecycle Ledger", icon: "🥾", description: "Preventive overhaul schedules, serialized asset refurbishment logs and footwear last sizing", badge: "ISO 55000" }
        ]
      }
    ]
  },

  // ─── 17. ENERGY, UTILITIES, MINING, WATER & SANITATION OPS ──────
  {
    id: "energy_utilities_environment",
    name: "Solar Energy, Utilities, Mining, Water & Environmental Ops",
    shortName: "Solar, Energy & Utilities",
    icon: "☀️",
    tagline: "Solar PV technicians, microgrids, wind turbines, high-voltage substations, mining geology & water treatment",
    description: "Dedicated workspace for NABCEP solar PV technicians, rooftop/utility solar installers, solar inverter & battery storage (BESS) specialists, wind turbine technicians, grid substation operators, miners, geotechnical/blasting specialists, water/wastewater operators, well drillers, and hazardous waste sanitation crews.",
    themeColor: "from-emerald-600 via-teal-700 to-slate-900",
    accentBorder: "border-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    securityClearanceTier: "NABCEP PV / NERC Grid Operator & MSHA / GWO Certified (Level 3)",
    feedTags: ["#SolarTechnician", "#SolarPV", "#NABCEP", "#RenewableEnergy", "#WindTurbine", "#Substation", "#Mining", "#WaterTreatment"],
    professions: [
      {
        id: "solar_pv_microgrid_technician",
        title: "NABCEP Solar PV Technician, Rooftop/Utility Installer & Solar Inverter Specialist",
        enclaveId: "energy_utilities_environment",
        categoryName: "Solar Energy & Photovoltaic Systems",
        defaultHeadline: "NABCEP Certified Solar PV Installation Professional · Rooftop & Utility-Scale Arrays, Enphase/SolarEdge Inverters, NEC 690 & Tesla Powerwall BESS Commissioning",
        typicalSkills: ["NABCEP PV Installation Professional", "Enphase / SolarEdge / SMA String & Micro-Inverters", "NEC Article 690 Solar Electrical Code", "Tesla Powerwall & Solar BESS Commissioning", "IV-Curve Tracing & Thermal Drone Inspection", "Rooftop Racking & Ground-Mount Arrays"],
        tools: [
          { name: "Solar PV String Sizer, NEC 690 & IV-Curve Analyzer", icon: "☀️", description: "Voc temperature coefficient calculations, MPPT inverter string sizing, IV-curve fill factor and shade irradiance maps", badge: "NABCEP PVIP" },
          { name: "Inverter Telemetry & Battery Storage Commissioning Console", icon: "🔋", description: "Enphase/SolarEdge microinverter grid-tie diagnostics, rapid shutdown (RSD) verification and BESS state-of-charge balancing", badge: "NEC 690 / 706" }
        ]
      },
      {
        id: "wind_solar_battery_tech",
        title: "GWO Wind Turbine, Solar Microgrid & Utility Battery Storage Technician",
        enclaveId: "energy_utilities_environment",
        categoryName: "Renewable Energy & Grid Storage",
        defaultHeadline: "GWO Certified Wind Turbine Technician & NABCEP PV Installer · 300ft Nacelle Pitch Hydraulics, BESS Megapacks & EV Fast Chargers",
        typicalSkills: ["NABCEP PV Installation", "GWO Working at Heights", "Utility BESS Storage", "EVITP Charger Commissioning", "BPI Energy Auditing"],
        tools: [
          { name: "Solar String Sizing & Wind Turbine Pitch Telemetry", icon: "☀️", description: "IV-curve tracer logs, nacelle gearbox vibration spectra and BESS state-of-charge balancer", badge: "NABCEP / GWO" }
        ]
      },
      {
        id: "grid_substation_powerplant_operator",
        title: "NERC Electrical Grid, High-Voltage Substation & Power Plant Operator",
        enclaveId: "energy_utilities_environment",
        categoryName: "Electric Utilities & Power Generation",
        defaultHeadline: "NERC Certified System Operator & 500kV Substation Relay Technician · SF6 Breakers, Hydro/Nuclear Steam Turbines & SCADA EMS",
        typicalSkills: ["NERC System Operator", "500kV Substation Relays", "SEL Protection Schemes", "Transformer Dissolved Gas Analysis", "LOTO High-Voltage"],
        tools: [
          { name: "SCADA EMS Grid Load & Transformer DGA Analyzer", icon: "⚡", description: "Real-time MVA substation load flow, relay trip oscillography and SF6 breaker logs", badge: "NERC CIP" }
        ]
      },
      {
        id: "mining_geology_blasting_tech",
        title: "Mining Engineer, Drilling Operator, Blasting Tech & Gemologist",
        enclaveId: "energy_utilities_environment",
        categoryName: "Mining, Geology & Natural Resources",
        defaultHeadline: "MSHA Certified Underground Miner, Blasting Specialist & GIA Gemologist · Core Drilling, Geotechnical Slope Stability & Land Reclamation",
        typicalSkills: ["MSHA Part 48", "Controlled Blasting", "Diamond Core Drilling", "Flotation Mineral Processing", "GIA Gemstone Grading", "Mine Rescue"],
        tools: [
          { name: "Blast Pattern, Assay Grade & Mine Ventilation Log", icon: "⛏️", description: "Powder factor calculations, drill core gold/lithium g/t assays and airflow CFM maps", badge: "MSHA Verified" }
        ]
      },
      {
        id: "water_wastewater_sanitation_tech",
        title: "Water/Wastewater Plant Operator, Well Driller & HazMat Sanitation Tech",
        enclaveId: "energy_utilities_environment",
        categoryName: "Water Infrastructure & Environmental Sanitation",
        defaultHeadline: "Grade IV Water/Wastewater Treatment Operator & HAZWOPER 40 Technician · Membrane Bioreactors, CCTV Sewer Inspection & Spill Response",
        typicalSkills: ["Grade IV Water/Wastewater", "NGWA Well Drilling", "NASSCO PACP Sewer CCTV", "40-Hr HAZWOPER", "Industrial Decontamination"],
        tools: [
          { name: "EPA NPDES Effluent & Sewer CCTV Inspection Console", icon: "💧", description: "Turbidity, residual chlorine, BOD/TSS lab logs and NASSCO pipe defect coding", badge: "EPA / HAZWOPER" }
        ]
      }
    ]
  },

  // ─── 18. SCIENCE, LABORATORY, METROLOGY & FIELD RESEARCH ────────
  {
    id: "science_laboratory_research",
    name: "Science, Laboratory, Biotech, Metrology & Field Research",
    shortName: "Science, Lab & Biotech",
    icon: "🔬",
    tagline: "GMP biotech cleanrooms, HPLC/GC-MS chromatography, forensic DNA, materials testing & archaeology",
    description: "Dedicated workspace for laboratory technicians, chemical processing techs, materials/metallurgical testers, forensic scientists, soil/water analysts, microbiology & pharmaceutical GMP manufacturing techs, metrology calibration specialists, and archaeological/museum conservators.",
    themeColor: "from-indigo-600 via-purple-700 to-slate-900",
    accentBorder: "border-indigo-500",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    badgeText: "text-indigo-800 dark:text-indigo-300",
    securityClearanceTier: "ISO 17025 / cGMP Cleanroom Credential (Level 3)",
    feedTags: ["#LabTech", "#Biotech", "#PharmaceuticalGMP", "#ForensicScience", "#Metrology", "#MaterialsTesting", "#Archaeology", "#MuseumConservation"],
    professions: [
      {
        id: "biotech_pharma_microbiology_tech",
        title: "Biotechnology, cGMP Pharmaceutical & Microbiology Lab Technician",
        enclaveId: "science_laboratory_research",
        categoryName: "Biotech, Pharma & Clinical Laboratory",
        defaultHeadline: "cGMP Bioprocess Technician & ASCP Microbiologist · Upstream Bioreactors, HPLC/GC-MS, CRISPR PCR Assays & ISO Class 5 Cleanrooms",
        typicalSkills: ["cGMP Cleanroom", "HPLC / GC-MS", "Upstream Bioreactor Cell Culture", "ELISA / qPCR", "LIMS Documentation", "AALAS Animal Care"],
        tools: [
          { name: "LIMS Electronic Lab Notebook & Chromatogram Viewer", icon: "🧬", description: "21 CFR Part 11 compliant batch records, molarity calculators and bioreactor DO/pH curves", badge: "cGMP / ISO" }
        ]
      },
      {
        id: "chemical_materials_forensic_tech",
        title: "Chemical Processing, Materials Metallurgy & Forensic Lab Specialist",
        enclaveId: "science_laboratory_research",
        categoryName: "Materials, Chemical & Forensic Science",
        defaultHeadline: "ISO 17025 Materials Testing & Forensic Trace Analyst · Tensile/Charpy Impact Metallurgy, FTIR Spectroscopy & Chain-of-Custody DNA",
        typicalSkills: ["ASTM Tensile/Hardness Testing", "SEM Metallography", "Forensic STR DNA Profiling", "NIST Traceable Metrology", "ICP-MS Water/Soil"],
        tools: [
          { name: "ISO 17025 Metrology Calibration & Stress-Strain Lab", icon: "🧪", description: "Gauge R&R uncertainty budgets, Charpy impact curves and forensic evidence seals", badge: "ISO 17025" }
        ]
      },
      {
        id: "archaeology_museum_conservator",
        title: "Archaeological Field Technician & Museum Artifact Conservator",
        enclaveId: "science_laboratory_research",
        categoryName: "Cultural Heritage, Archaeology & Conservation",
        defaultHeadline: "Registered Professional Archaeologist (RPA) & Museum Conservator · Section 106 Cultural Surveys, Stratigraphy & Artifact Stabilization",
        typicalSkills: ["Section 106 Compliance", "Total Station Trench Mapping", "XRF Non-Destructive Pigment Analysis", "Archival Climate Control", "Provenance Cataloging"],
        tools: [
          { name: "Stratigraphic Harris Matrix & Artifact Conservation Log", icon: "🏺", description: "Trench context sheets, radiocarbon C-14 calibration and museum relative humidity logs", badge: "AIC / RPA" }
        ]
      }
    ]
  },

  // ─── 19. AVIATION, AEROSPACE, MARITIME & UNDERWATER OPS ─────────
  {
    id: "aviation_aerospace_maritime",
    name: "Aviation, Aerospace, Space, Maritime & Underwater Ops",
    shortName: "Aviation, Space & Maritime",
    icon: "✈️",
    tagline: "FAA A&P airframes, avionics, spacecraft cleanrooms, merchant marine, port cranes & commercial diving",
    description: "Dedicated workspace for FAA A&P aircraft mechanics, avionics techs, flight dispatchers, air traffic controllers, commercial drone pilots, spacecraft assembly techs, merchant mariners, shipbuilders, port crane operators, commercial divers, underwater welders, and oceanographers.",
    themeColor: "from-sky-600 via-blue-800 to-slate-950",
    accentBorder: "border-sky-500",
    badgeBg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    badgeText: "text-sky-800 dark:text-sky-300",
    securityClearanceTier: "FAA Airframe & Powerplant / USCG STCW / ADCI Diver (Level 4)",
    feedTags: ["#Aviation", "#AircraftMechanic", "#Avionics", "#Aerospace", "#Maritime", "#Shipbuilding", "#CommercialDiving", "#UnderwaterWelding"],
    professions: [
      {
        id: "aircraft_mechanic_avionics_atc",
        title: "FAA A&P Aircraft Mechanic, Avionics Tech & Flight Dispatcher",
        enclaveId: "aviation_aerospace_maritime",
        categoryName: "Aviation Maintenance & Flight Operations",
        defaultHeadline: "FAA Airframe & Powerplant (A&P) Mechanic w/ Inspection Authorization (IA) · Turbofan Borescopes, Garmin/Honeywell Avionics & Part 121 Dispatch",
        typicalSkills: ["FAA A&P / IA License", "FCC GROL Avionics", "Turbofan Hot-Section Inspection", "FAA Aircraft Dispatch", "ARFF Airport Rescue"],
        tools: [
          { name: "FAA Airworthiness Directive (AD) & Mel Logbook", icon: "✈️", description: " Airframe cycle tracking, borescope turbine blade logs and weight-and-balance calculators", badge: "FAA Part 145" }
        ]
      },
      {
        id: "aerospace_spacecraft_drone_tech",
        title: "Spacecraft Assembly, Satellite Ops & Part 107 LiDAR Drone Specialist",
        enclaveId: "aviation_aerospace_maritime",
        categoryName: "Aerospace, Satellite & Unmanned Systems",
        defaultHeadline: "NASA STD-8739 Certified Spacecraft Technician & FAA Part 107 UAV Pilot · Carbon-Epoxy Autoclaves, Satellite Telemetry & Photogrammetry",
        typicalSkills: ["NASA-STD-8739 Soldering", "AS9100 Aerospace Quality", "Cleanroom Satellite Integration", "FAA Part 107 Drone LiDAR", "Composite Layup"],
        tools: [
          { name: "Orbital Telemetry & UAV Photogrammetry Mission Planner", icon: "🛰️", description: "Satellite TLE pass schedules, cleanroom FOD checklists and UAV orthomosaic flight grids", badge: "AS9100 / NASA" }
        ]
      },
      {
        id: "maritime_shipbuilder_harbor_pilot",
        title: "Marine Engineer, Shipbuilder, Port Crane Operator & Harbor Pilot",
        enclaveId: "aviation_aerospace_maritime",
        categoryName: "Maritime, Shipbuilding & Port Operations",
        defaultHeadline: "USCG STCW Chief Marine Engineer & ABS Certified Shipyard Welder · Slow-Speed Marine Diesels, Ship-to-Shore Gantry Cranes & Marine Surveying",
        typicalSkills: ["USCG STCW Endorsement", "ABS Marine Welding", "Marine High-Voltage Electric", "STS Port Gantry Crane", "NAMS Marine Surveying"],
        tools: [
          { name: "Vessel Engine Room & Port Container Stowage Console", icon: "🚢", description: "Bunker fuel consumption, hull ultrasonic thickness gauges and TEU bay plan stability", badge: "USCG / ABS" }
        ]
      },
      {
        id: "commercial_diver_underwater_welder",
        title: "ADCI Commercial Diver, Underwater Welder & Oceanographer",
        enclaveId: "aviation_aerospace_maritime",
        categoryName: "Underwater Engineering & Marine Science",
        defaultHeadline: "ADCI Surface-Supplied Commercial Diver & AWS D3.6 Underwater Welder · Subsea Pipeline Hyperbaric Repair, ROV Ops & Coral Reef Restoration",
        typicalSkills: ["ADCI Commercial Diver", "AWS D3.6 Wet/Hyperbaric Welding", "Mixed-Gas Decompression", "Work-Class ROV Pilot", "Bathymetric Sonar"],
        tools: [
          { name: "US Navy Dive Decompression Table & Subsea NDT Log", icon: "🤿", description: "No-decompression limit calculators, chamber treatment tables and cathodic protection readings", badge: "ADCI / AWS D3.6" }
        ]
      }
    ]
  },

  // ─── 20. TELECOM, DIRECTV / SATELLITE, BROADBAND, AV & FRONTIER TECH ───
  {
    id: "telecom_digital_infrastructure",
    name: "DirecTV, Satellite Dish, Fiber, Broadband, Pro-AV & Frontier Tech",
    shortName: "DirecTV, Satellite, Fiber & AV",
    icon: "📡",
    tagline: "DirecTV & satellite dish technicians, Starlink/VSAT, cable broadband, fiber splicing, Pro-AV & 5G towers",
    description: "Dedicated workspace for DirecTV & Dish Network satellite installers, Starlink/VSAT techs, coaxial/DOCSIS cable broadband technicians, CCTV & commercial/home theater AV integrators, fiber-optic splicers, 5G tower climbers, data center hardware techs, and PCB micro-soldering specialists.",
    themeColor: "from-violet-600 via-purple-800 to-indigo-950",
    accentBorder: "border-violet-500",
    badgeBg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
    badgeText: "text-violet-800 dark:text-violet-300",
    securityClearanceTier: "SBCA Satellite / DirecTV SWM / FOA Master Fiber / CEDIA Certified (Level 3)",
    feedTags: ["#DirecTV", "#SatelliteTechnician", "#StarlinkInstaller", "#CableBroadband", "#ProAV", "#FiberOptics", "#TowerClimber", "#CCTVSecurity"],
    professions: [
      {
        id: "directv_satellite_broadband_av_tech",
        title: "DirecTV / Satellite Dish Technician, Starlink/VSAT Installer, Cable Broadband & Pro-AV Specialist",
        enclaveId: "telecom_digital_infrastructure",
        categoryName: "DirecTV, Satellite Dish, Cable & AV Systems",
        defaultHeadline: "SBCA Certified DirecTV & Satellite Dish Master Technician · SWM Multiswitch & Commercial SMATV Headends, Ku/Ka-Band Dish Alignment, Starlink/VSAT, DOCSIS 3.1/4.0 Coax & CEDIA Home Theater / CCTV",
        typicalSkills: ["DirecTV SWM Multiswitch & Commercial SMATV/MATV", "Ku/Ka-Band Satellite Dish Azimuth/Elevation Alignment", "Starlink & VSAT Satellite Terminal Commissioning", "RG-6/RG-11 Coax Compression & dBmV Signal Meters", "DOCSIS 3.1/4.0 Cable Broadband & Fiber ONT", "Home Theater, Commercial Pro-AV & IP CCTV Installation"],
        tools: [
          { name: "DirecTV SWM & Satellite Transponder Azimuth/dBmV Meter", icon: "📡", description: "99°/101°/103° orbital slot look-angle calculator, LNB transponder MER/BER signal lock and SWM-30 multiswitch port allocation", badge: "DirecTV / SBCA" },
          { name: "DOCSIS Coax/Fiber Signal Analyzer & Commercial AV Matrix", icon: "📺", description: "RG-6/RG-11 dBmV ingress/SNR spectrum analyzer, HDMI-over-IP commercial bar/hotel headend matrix and PoE NVR camera commissioning", badge: "NCTI / CEDIA" }
        ]
      },
      {
        id: "fiber_optic_tower_datacenter_tech",
        title: "FOA Fiber-Optic Splicer, 5G Tower Climber & Data Center Hardware Tech",
        enclaveId: "telecom_digital_infrastructure",
        categoryName: "Telecommunications & Physical Digital Infrastructure",
        defaultHeadline: "FOA CFOT Fiber Splicer, NWSA Tower Climber & Hyperscale Data Center Technician · OTDR Loss Testing, 5G Massive MIMO & Liquid-Cooled GPU Racks",
        typicalSkills: ["FOA CFOT Fusion Splicing", "OTDR Trace Analysis", "NWSA Telecom Tower Rescue", "BICSI RCDD Cabling", "Data Center UPS / Liquid Cooling"],
        tools: [
          { name: "OTDR Optical Link Loss & Rack Power/Cooling Console", icon: "📡", description: "dB splice loss budgets, RF PIM sweep logs and hyperscale server rack PUE telemetry", badge: "FOA / BICSI" }
        ]
      },
      {
        id: "pcb_microsoldering_horologist_tech",
        title: "IPC Micro-Soldering Specialist, Semiconductor Tech & Master Watchmaker",
        enclaveId: "telecom_digital_infrastructure",
        categoryName: "Electronics, Precision Instruments & Horology",
        defaultHeadline: "IPC-7711/7721 BGA Micro-Soldering Technician & AWCI Certified Watchmaker · Multilayer PCB Rework, Oscilloscope Fault Tracing & Mechanical Escapements",
        typicalSkills: ["IPC-7711 BGA Reballing", "Altium PCB Schematics", "Semiconductor Photolithography", "AWCI Mechanical Horology", "Optical Alignment"],
        tools: [
          { name: "PCB Boardview Schematic & Horology Beat-Error Analyzer", icon: "🔬", description: "Thermal camera short detection, SMD pad diode-mode readings and mechanical watch timing traces", badge: "IPC / AWCI" }
        ]
      },
      {
        id: "digital_twin_autonomous_green_tech",
        title: "Digital Twin, 3D Reality Capture, Autonomous Fleet & Carbon/Battery Tech",
        enclaveId: "telecom_digital_infrastructure",
        categoryName: "Emerging Frontier & Sustainability Professions",
        defaultHeadline: "3D LiDAR Reality Capture Specialist, Autonomous Vehicle Sensor Tech & GHG Carbon Accountant · Matterport/NavVis SLAM, Li-Ion Hydrometallurgy & ISO 14064",
        typicalSkills: ["Terrestrial LiDAR (BIM Scan-to-CAD)", "Autonomous LiDAR/Radar Calibration", "Li-Ion Black Mass Battery Recycling", "GHG Scope 1-3 Carbon Accounting", "Assistive Robotics"],
        tools: [
          { name: "Point-Cloud BIM Deviation & Scope 1-3 Carbon Ledger", icon: "🌐", description: "Millimeter scan-to-BIM clash detection, autonomous sensor intrinsics and ISO 14064 carbon calculator", badge: "Frontier 2026" }
        ]
      }
    ]
  }
]

// ─── 42-CATEGORY UNIVERSAL TAXONOMY & 3 WORKER PILLARS ──────────────────────
export interface WorkerPillar {
  id: 'hands_on' | 'independent' | 'emerging_stars'
  title: string
  icon: string
  subtitle: string
  exampleEnclaves: string[]
  enclaveIds: string[]
  keyCapabilities: string[]
}

export const CONNECTIN_WORKER_PILLARS: WorkerPillar[] = [
  {
    id: 'hands_on',
    title: 'Hands-On & Practical Professionals',
    icon: '🛠️',
    subtitle: 'Demonstrate mastery through physical projects, blueprints, diagnostics, lab runs & field evidence rather than corporate slide decks.',
    exampleEnclaves: ['trades_construction', 'automotive_mechanics', 'manufacturing_industrial', 'energy_utilities_environment', 'aviation_aerospace_maritime', 'healthcare_medicine'],
    enclaveIds: ['trades_construction', 'automotive_mechanics', 'manufacturing_industrial', 'energy_utilities_environment', 'aviation_aerospace_maritime', 'healthcare_medicine'],
    keyCapabilities: ['Verified Trade Licenses', 'Before/After Project Portfolios', 'Equipment & Machinery Hours', 'Safety & Code Certifications']
  },
  {
    id: 'independent',
    title: 'Independent Earners & Service Businesses',
    icon: '🏪',
    subtitle: 'Win direct client bookings, local RFPs, service area discovery, commercial contracts & verified customer reviews.',
    exampleEnclaves: ['personal_services_wellness', 'culinary_hospitality_events', 'commerce_small_business', 'creative_media_arts', 'agriculture_natural_resources', 'finance_accounting', 'law_gov_defense'],
    enclaveIds: ['personal_services_wellness', 'culinary_hospitality_events', 'commerce_small_business', 'creative_media_arts', 'agriculture_natural_resources', 'finance_accounting', 'law_gov_defense'],
    keyCapabilities: ['Instant Client Quote Requests', 'Service Radius & Availability', 'Verified Customer Reviews', 'Escrow & Milestone Draws']
  },
  {
    id: 'emerging_stars',
    title: 'Emerging Specialists & STARs (Alternative Routes)',
    icon: '🚀',
    subtitle: 'Skilled Through Alternative Routes (Apprenticeships, Military Transition, Bootcamps, Lab Techs & Frontier Industries — No 4-Year Degree Gatekeeping).',
    exampleEnclaves: ['education_workforce', 'telecom_digital_infrastructure', 'science_laboratory_research', 'community_civic_security', 'tech_cybersecurity', 'tech_software', 'campus_students'],
    enclaveIds: ['education_workforce', 'telecom_digital_infrastructure', 'science_laboratory_research', 'community_civic_security', 'tech_cybersecurity', 'tech_software', 'campus_students'],
    keyCapabilities: ['Skills-First Job Matching', 'Registered Apprenticeships (OJT)', 'Military MOS Skill Translation', 'Frontier Tech Micro-Credentials']
  }
]

const EXTRA_SPECIALIZED_PROFESSIONS: ProfessionDefinition[] = [
  // ── Category 1 & 26: Construction, MEP, Architecture, Surveying & Built Environment ──
  {
    id: 'drywall_plasterer_scaffolding_specialist',
    title: 'Drywall Finisher, Ornamental Plasterer & Scaffolding Specialist',
    enclaveId: 'trades_construction',
    categoryName: 'Construction & Building Trades',
    defaultHeadline: 'Level 5 Drywall Finisher, Venetian Plaster Artisan & SAIA Certified Suspended Scaffolding Rigger',
    typicalSkills: ['Level 5 Drywall Finishing', 'Ornamental Lime Plaster', 'SAIA Scaffolding Rigging', 'Acoustical Grid Ceilings', 'OSHA Fall Protection'],
    tools: [{ name: 'Drywall Sheet Takeoff & Scaffold Load Calc', icon: '🧱', description: 'Square-footage board count, joint compound mud estimator & scaffold tie-in schedule', badge: 'SAIA / OSHA' }]
  },
  {
    id: 'bim_cad_quantity_surveyor',
    title: 'Architectural Technologist, BIM Coordinator & Quantity Surveyor',
    enclaveId: 'trades_construction',
    categoryName: 'Architecture, Surveying & Built Environment',
    defaultHeadline: 'RICS Chartered Quantity Surveyor & Revit BIM Coordinator · Clash Detection, Facade Envelope Specs, Historic Restoration & Cost Takeoffs',
    typicalSkills: ['Revit BIM Coordination', 'RICS Cost Estimation', 'Curtain Wall Facades', 'Historic Lime Restoration', 'EnergyPlus Modeling'],
    tools: [{ name: 'Revit Clash Detection & RICS Bill of Quantities', icon: '📐', description: 'Navisworks MEP clash matrix and CSI MasterFormat cost estimator', badge: 'RICS / BIM' }]
  },
  {
    id: 'facade_envelope_historic_restoration_tech',
    title: 'Building Envelope, Curtain Wall Facade & Historic Restoration Specialist',
    enclaveId: 'trades_construction',
    categoryName: 'Architecture, Surveying & Built Environment',
    defaultHeadline: 'Building Envelope & Historic Preservation Specialist · Infrared Blower-Door Testing, Unitized Glass Facades, Accessibility Compliance & Energy Modeling',
    typicalSkills: ['ASTM E1186 Air Barrier Testing', 'Curtain Wall Glazing', 'Historic Stone/Timber Preservation', 'ADA Accessibility Audits', 'Building Energy Modeling'],
    tools: [{ name: 'Blower-Door Envelope & Thermal Bridge Scanner', icon: '🏛️', description: 'ACH50 air-leakage calculator, curtain-wall wind-load anchor checks & ADA slope gauge', badge: 'BPI / RICS' }]
  },
  {
    id: 'industrial_instrumentation_controls_tech',
    title: 'Building Automation (BAS) & Industrial Instrumentation Controls Technician',
    enclaveId: 'trades_construction',
    categoryName: 'Mechanical, Electrical & Building Systems (MEP)',
    defaultHeadline: 'ISA Certified Control Systems Technician (CCST) & BACnet/Niagara N4 Integrator · 4-20mA Hart Transmitters, PID Loop Tuning & Smart Chiller Plants',
    typicalSkills: ['Niagara N4 / BACnet IP', 'ISA CCST Instrumentation', '4-20mA HART Calibration', 'VFD & Chiller Plant Sequencing', 'Pneumatic-to-DDC Retrofits'],
    tools: [{ name: '4-20mA Loop Calibrator & BACnet Object Browser', icon: '🎛️', description: 'PID loop tuning simulator, differential pressure scaling & DDC point checkout sheet', badge: 'ISA CCST' }]
  },

  // ── Category 2, 10 & 41: Automotive, Heavy Machinery, Rail, Cold-Chain & Customs ──
  {
    id: 'auto_electrician_collision_refinish_tech',
    title: 'Automotive Electrician, Collision Frame & Custom Refinish Specialist',
    enclaveId: 'automotive_mechanics',
    categoryName: 'Automotive & Vehicle Engineering',
    defaultHeadline: 'I-CAR Platinum Collision Structural Tech & Automotive Master Electrician · ADAS Radar Calibration, Celette Frame Straightening & Spectrophotometer Paint',
    typicalSkills: ['I-CAR Platinum Structural', 'ADAS LiDAR/Radar Calibration', 'CAN-FD Wiring Harness', 'Downdraft Booth Refinishing', 'Aluminum MIG Brazing'],
    tools: [{ name: 'ADAS Calibration Target & Frame Datum Spec', icon: '🚗', description: '3D chassis millimeter measuring points and OEM ADAS static/dynamic target distances', badge: 'I-CAR Platinum' }]
  },
  {
    id: 'heavy_machinery_rail_signal_tech',
    title: 'Heavy Equipment Mechanic, Locomotive Tech & Rail Signal Inspector',
    enclaveId: 'automotive_mechanics',
    categoryName: 'Heavy Machinery, Rail & Transport',
    defaultHeadline: 'CAT Heavy Equipment Diagnostic Specialist & FRA Rail Signal Technician · Hydraulic Excavators, Locomotive Traction Motors & Positive Train Control (PTC)',
    typicalSkills: ['CAT ET Diagnostics', 'FRA Part 236 Rail Signals', 'Locomotive Diesel-Electric', 'Agricultural Combine Hydraulics', 'Forklift Material Handling'],
    tools: [{ name: 'CAT Hydraulic & FRA Rail Signal Telemetry', icon: '🚂', description: 'Positive Train Control (PTC) track circuit diagnostics and hydraulic pressure logs', badge: 'FRA / ASE' }]
  },
  {
    id: 'freight_forwarder_customs_coldchain',
    title: 'Licensed Customs Broker, Freight Forwarder & Cold-Chain Operator',
    enclaveId: 'automotive_mechanics',
    categoryName: 'Logistics, Warehousing & Supply Chain',
    defaultHeadline: 'US Customs Broker (LCB) & GDP Cold-Chain Logistics Coordinator · Harmonized Tariff (HTS) Clearance, Reefer Telemetry & Intermodal Dispatch',
    typicalSkills: ['HTS Customs Classification', 'Incoterms 2020', 'GDP Cold-Chain Monitoring', 'Bill of Lading', 'Port Terminal Dispatch'],
    tools: [{ name: 'ACE Customs Manifest & Reefer Cold-Chain Monitor', icon: '🚢', description: 'Live -20°C container telemetry and automated Harmonized Tariff lookup', badge: 'LCB / GDP' }]
  },
  {
    id: 'bus_coach_maritime_drone_delivery_operator',
    title: 'Commercial Bus/Coach Captain, River Barge Crew & Drone Delivery Operator',
    enclaveId: 'automotive_mechanics',
    categoryName: 'Transport, Transit & Autonomous Delivery',
    defaultHeadline: 'CDL Passenger Coach Operator, Inland Waterway Mate & Part 135 Drone Delivery Dispatcher · Zero-Incident Transit, Towboat Rigging & BVLOS Medical Delivery',
    typicalSkills: ['CDL Passenger Endorsement', 'Inland Tug & Barge Line Handling', 'FAA Part 135 BVLOS Drone Delivery', 'Transit Dispatch Scheduling', 'ADA Passenger Securement'],
    tools: [{ name: 'Multimodal Transit & BVLOS Delivery Corridor Console', icon: '🚌', description: 'Route headway telemetry, river lock schedules and autonomous delivery payload logs', badge: 'DOT / FAA' }]
  },

  // ── Category 3, 29 & 41: Hydroponics, Ag-Drone, Food Science, Wildlife & Vet Tech ──
  {
    id: 'hydroponics_agdrone_food_scientist',
    title: 'Hydroponics Specialist, Ag-Drone Operator & Food Technologist',
    enclaveId: 'agriculture_natural_resources',
    categoryName: 'Controlled Environment Ag & Food Science',
    defaultHeadline: 'Controlled Environment Vertical Farmer & IFT Food Scientist · Nutrient Film Hydroponics, Multispectral Ag-Drones, Fermentation & HACCP Audits',
    typicalSkills: ['Vertical Hydroponics', 'NDVI Multispectral Drones', 'HACCP / SQF Food Safety', 'Sensory & Fermentation Science', 'Irrigation Telemetry'],
    tools: [{ name: 'Hydroponic EC/pH Dosing & HACCP Food Safety Lab', icon: '🌱', description: 'Automated nutrient dosing curves and SQF microbial shelf-life logs', badge: 'HACCP / FAA' }]
  },
  {
    id: 'dairy_grain_milling_postharvest_tech',
    title: 'Dairy Processing Specialist, Grain Mill Operator & Post-Harvest Inspector',
    enclaveId: 'agriculture_natural_resources',
    categoryName: 'Food Processing & Agricultural Quality',
    defaultHeadline: 'Pasteurization Dairy Technologist, Roller-Mill Grain Operator & USDA Post-Harvest Cold-Storage Inspector · HTST Pasteurization, Mycotoxin Screening & Silo Aeration',
    typicalSkills: ['HTST Dairy Pasteurization', 'Flour & Feed Milling', 'USDA Grain Grading', 'Controlled Atmosphere Storage', 'Cheese & Culture Fermentation'],
    tools: [{ name: 'Dairy Pasteurization & Grain Moisture Silo Console', icon: '🌾', description: 'Somatic cell counts, milkfat standardization and grain bin equilibrium moisture curves', badge: 'USDA / SQF' }]
  },
  {
    id: 'wildlife_ranger_vettech_arborist',
    title: 'Veterinary Technician, Wildlife Park Ranger & Habitat Restoration Specialist',
    enclaveId: 'agriculture_natural_resources',
    categoryName: 'Forestry, Wildlife & Animal Care',
    defaultHeadline: 'Credentialed Veterinary Technician (CVT), ISA Certified Arborist & Wildlife Conservation Ranger · Telemetry Tracking, Zookeeping & Invasive Species Control',
    typicalSkills: ['CVT Veterinary Anesthesia', 'ISA Tree Climbing', 'Wildlife GPS Collaring', 'Riparian Habitat Restoration', 'Shelter & Zoo Animal Care'],
    tools: [{ name: 'Wildlife Biodiversity & Vet Triage Tracker', icon: '🦌', description: 'Camera-trap species counts, invasive plant GIS maps and veterinary anesthesia sheets', badge: 'ISA / CVT' }]
  },

  // ── Category 4, 28 & 37: Manufacturing, Footwear, Textile, Reverse Logistics ──
  {
    id: 'textile_weaving_dyeing_garment_tech',
    title: 'Textile Production Technician, Master Weaver & Fabric Dyeing Specialist',
    enclaveId: 'manufacturing_industrial',
    categoryName: 'Textile, Leather & Footwear Industries',
    defaultHeadline: 'AATCC Certified Textile Colorist, Jacquard Loom Technician & Industrial Sewing Machine Mechanic · Spectrophotometer Dye Recipes, Pattern Grading & Textile Recycling',
    typicalSkills: ['Jacquard & Rapier Looms', 'AATCC Colorfastness Dyeing', 'Juki/Brother Sewing Machine Repair', 'Gerber AccuMark Pattern Grading', 'Circular Textile Recycling'],
    tools: [{ name: 'Pantone Lab Dip & Loom Picks-Per-Inch Console', icon: '🧵', description: 'Delta-E spectrophotometer color matching, warp tension logs and marker yield optimizer', badge: 'AATCC' }]
  },
  {
    id: 'reverse_logistics_ewaste_refurbishment_tech',
    title: 'Reverse Logistics Coordinator, E-Waste Recycler & Warranty Repair Tech',
    enclaveId: 'manufacturing_industrial',
    categoryName: 'Supply Chain Support & Equipment Lifecycle',
    defaultHeadline: 'R2v3 Certified Electronics Recycler, Warranty RMA Repair Specialist & Cold-Storage Inventory Auditor · NIST 800-88 Data Sanitization, Component Harvesting & Refurbishment',
    typicalSkills: ['R2v3 / e-Stewards Recycling', 'NIST 800-88 Media Sanitization', 'Warranty RMA Root-Cause', 'Board-Level Refurbishment', 'Cycle Count Auditing'],
    tools: [{ name: 'RMA Triage, Serialized Refurb & E-Waste Recovery Log', icon: '♻️', description: 'IMEI/Serial erasure certificates, refurbishment grade scoring and precious metal yield', badge: 'R2v3 Certified' }]
  },

  // ── Category 5, 19, 31 & 42: Energy, Mining, Water, Sanitation & Carbon ──
  {
    id: 'well_driller_radon_mold_remediation_tech',
    title: 'NGWA Water Well Driller, Radon Mitigation & Mold/Asbestos Remediation Tech',
    enclaveId: 'energy_utilities_environment',
    categoryName: 'Water Infrastructure & Environmental Remediation',
    defaultHeadline: 'NGWA Certified Master Well Driller (CWD) & IICRC/NRPP Environmental Remediation Specialist · Rotary Mud Drilling, Sub-Slab Radon Depressurization & HEPA Abatement',
    typicalSkills: ['NGWA Rotary & Cable-Tool Drilling', 'Submersible Pump Sizing', 'NRPP Radon Mitigation', 'IICRC S520 Mold Remediation', 'EPA Asbestos Abatement'],
    tools: [{ name: 'Aquifer Drawdown & Radon/IAQ Continuous Monitor', icon: '💧', description: 'Well specific-capacity GPM curves, pCi/L radon logs and negative-air HEPA pressure records', badge: 'NGWA / NRPP' }]
  },

  // ── Category 6 & 39: Healthcare Support, EMT, Radiology, Surgical Tech, Prosthetics & BMET ──
  {
    id: 'surgical_radiology_phlebotomy_emt',
    title: 'Surgical Technologist, Radiologic Tech, Phlebotomist & Paramedic (NRP)',
    enclaveId: 'healthcare_medicine',
    categoryName: 'Allied Health, Diagnostic & Emergency Care',
    defaultHeadline: 'NBSTSA Certified Surgical Technologist, ARRT Radiographer & NREMT Paramedic · Sterile Field Instrumentation, MRI/CT Imaging & 12-Lead ACLS Triage',
    typicalSkills: ['NBSTSA Sterile Field', 'ARRT CT/MRI Positioning', 'ASCP Phlebotomy Venipuncture', 'NREMT Paramedic ACLS', 'PTCB Pharmacy Compounding'],
    tools: [{ name: 'Perioperative Count, DICOM Dose & EMS Run Sheet', icon: '🚑', description: 'WHO surgical Sponge/Sharps counter, ALARA radiation logs and NEMSIS paramedic PCR', badge: 'ARRT / NREMT' }]
  },
  {
    id: 'biomedical_bmet_sterile_medcoding',
    title: 'Biomedical Equipment Tech (CBET), Medical Gas & CPC Medical Coder',
    enclaveId: 'healthcare_medicine',
    categoryName: 'Specialized Healthcare Technology & Operations',
    defaultHeadline: 'AAMI Certified Biomedical Equipment Technician (CBET), ASSE 6030 Medical Gas Verifier & AAPC CPC Coder · Ventilator Calibration, Autoclaves & ICD-10-CM',
    typicalSkills: ['AAMI CBET Defibrillator/Ventilator PM', 'NFPA 99 Medical Gas', 'CRCST Sterile Processing', 'ICD-10 / CPT Medical Coding', 'CCHI Medical Interpreting'],
    tools: [{ name: 'BMET Electrical Safety & Sterilization Spore Log', icon: '🩺', description: 'IEC 60601 leakage current tester, autoclave biological indicator logs & ICD-10 encoder', badge: 'CBET / AAPC' }]
  },
  {
    id: 'prosthetics_orthotics_hyperbaric_sleep_tech',
    title: 'Prosthetics/Orthotics Tech, Hyperbaric Chamber Operator & Sleep Polysomnographer',
    enclaveId: 'healthcare_medicine',
    categoryName: 'Specialized Clinical & Rehabilitation Technology',
    defaultHeadline: 'ABC Certified Prosthetic/Orthotic Technician, CHT Hyperbaric Technologist & RPSGT Sleep Lab Specialist · Carbon-Fiber Socket Lamination, 3-ATA Wound Therapy & EEG Scoring',
    typicalSkills: ['ABC Carbon-Fiber Prosthetics', '3D Limb Scanning', 'UHMS Hyperbaric Oxygen (CHT)', 'BRPT Polysomnography (RPSGT)', 'Cardiovascular Cath Lab (RCIS)'],
    tools: [{ name: '3D Socket Alignment, Hyperbaric Dive & Sleep Stage Console', icon: '🦿', description: 'Dynamic gait load alignment, hyperbaric O2 transcutaneous tension & AHI sleep apnea scorer', badge: 'ABC / RPSGT' }]
  },
  {
    id: 'dental_hygienist_pta_ota_rehab_specialist',
    title: 'Registered Dental Hygienist (RDH), Physical Therapy (PTA) & Occupational Therapy Assistant',
    enclaveId: 'healthcare_medicine',
    categoryName: 'Allied Health & Rehabilitation Care',
    defaultHeadline: 'Licensed Dental Hygienist (RDH) & APTA Physical Therapy Assistant (PTA) · Ultrasonic Periodontal Scaling, Post-Op Gait Rehabilitation & Neuromuscular Re-education',
    typicalSkills: ['Periodontal Scaling & Root Planing', 'Local Anesthesia & Nitrous Oxide', 'Therapeutic Exercise & Gait Rehab', 'Goniometric ROM Measurement', 'Adaptive ADL Splinting'],
    tools: [{ name: 'Periodontal Pocket & Joint ROM Goniometer Log', icon: '🦷', description: '6-point periodontal probing chart and post-surgical functional mobility tracker', badge: 'RDH / PTA' }]
  },

  // ── Category 7, 30 & 34: Tattoo, Massage, Spa, Sports Turf, Outdoor Guide & Funeral Services ──
  {
    id: 'tattoo_massage_nail_spa_specialist',
    title: 'Licensed Massage Therapist, Tattoo Artist, Nail Tech & Spa Director',
    enclaveId: 'personal_services_wellness',
    categoryName: 'Beauty, Body Art & Therapeutic Wellness',
    defaultHeadline: 'NCBTMB Licensed Massage Therapist (LMT) & Bloodborne-Pathogen Certified Tattoo Artist · Myofascial Release, Custom Stencil Art & Medical Spa Ops',
    typicalSkills: ['Myofascial & Deep Tissue LMT', 'OSHA Bloodborne Pathogens', 'Autoclave Spore Testing', 'Gel/Acrylic Nail Architecture', 'Bridal Makeup'],
    tools: [{ name: 'SOAP Bodywork Chart & Consent Portfolio Vault', icon: '💆', description: 'Anatomical trigger-point SOAP notes and client-consented before/after gallery', badge: 'NCBTMB / OSHA' }]
  },
  {
    id: 'outdoor_guide_turf_funeral_director',
    title: 'Outdoor Adventure Guide, Sports Turf Manager & Licensed Funeral Director',
    enclaveId: 'personal_services_wellness',
    categoryName: 'Outdoor Recreation, Sports Ops & Memorial Services',
    defaultHeadline: 'AMGA Mountain Guide, GCSAA Sports Turf Superintendent & Licensed Funeral Director · Pitch Agronomy, Ski-Lift Rigging & Compassionate Bereavement Care',
    typicalSkills: ['AMGA Alpine Rigging', 'GCSAA Stadium Turf Agronomy', 'NFDA Funeral Directing & Embalming', 'Monument Stone Engraving', 'Adaptive Sports'],
    tools: [{ name: 'Turf Moisture, Alpine Route & Memorial Arrangement Desk', icon: '🏔️', description: 'Pitch firmness Clegg hammer readings, avalanche forecasts & memorial service planner', badge: 'GCSAA / NFDA' }]
  },
  {
    id: 'embalmer_crematory_monument_bereavement_specialist',
    title: 'Licensed Embalmer, Crematory Operator, Monument Engraver & Grief Counselor',
    enclaveId: 'personal_services_wellness',
    categoryName: 'Funeral, Memorial & End-of-Life Services',
    defaultHeadline: 'CANA Certified Crematory Operator, Restorative Embalmer & Monument Stone Mason · Dignity Chain-of-Custody, Granite Sandblast Lettering & Bereavement Support',
    typicalSkills: ['Restorative Art & Embalming', 'CANA Crematory Operations', 'Granite Monument Sandblasting', 'Cemetery Perpetual Care', 'Grief & Bereavement Facilitation'],
    tools: [{ name: 'Dignity Chain-of-Custody & Monument Stencil CAD', icon: '🕊️', description: 'Biometric identification tracking, permit registry and memorial inscription layout', badge: 'NFDA / CANA' }]
  },

  // ── Category 8, 11, 35 & 41: Baker, Butcher, Coffee Roaster, Live Stage Rigging & Pest/Pool ──
  {
    id: 'baker_butcher_safari_cruise_specialist',
    title: 'Artisan Baker, Master Butcher, Safari Tracker & Cruise Hospitality Lead',
    enclaveId: 'culinary_hospitality_events',
    categoryName: 'Culinary Craft, Tourism & Maritime Hospitality',
    defaultHeadline: 'RBA Certified Master Baker, Whole-Animal Butcher & FGASA Safari Guide · Sourdough Fermentation, Dry-Aged Seam Cuts & Eco-Tourism Expeditions',
    typicalSkills: ['Artisan Sourdough & Viennoiserie', 'Whole-Carcass Butchery', 'HACCP Food Safety Auditing', 'FGASA Wildlife Tracking', 'STCW Cruise Hospitality'],
    tools: [{ name: 'Baker Percentage, Carcass Yield & Expedition Manifest', icon: '🥐', description: 'Flour hydration/fermentation timers, primal cut yield calculator and guest safari logs', badge: 'RBA / HACCP' }]
  },
  {
    id: 'coffee_roaster_sommelier_brewer_distiller',
    title: 'Specialty Coffee Roaster (Q-Grader), Sommelier, Brewmaster & Craft Distiller',
    enclaveId: 'culinary_hospitality_events',
    categoryName: 'Food Craft, Fermentation & Beverage Science',
    defaultHeadline: 'CQI Licensed Q-Arabica Grader, Court of Master Sommeliers & IBD Certified Brewmaster · Roast Rate-of-Rise (RoR) Curves, Wort Gravity & Barrel Aging',
    typicalSkills: ['CQI Q-Grader Cupping', 'Cropster Roast Curve Profiling', 'IBD Brewing & Mash Chemistry', 'CMS Wine Cellar Curation', 'Distillation Proof Gauging'],
    tools: [{ name: 'Roast Rate-of-Rise (RoR) & Fermentation Plato Log', icon: '☕', description: 'First-crack exothermic curves, Specific Gravity/Brix attenuation & cellar vintage ledger', badge: 'Q-Grader / CMS' }]
  },
  {
    id: 'stage_rigger_sound_lighting_pest_pool',
    title: 'ETCP Stage Rigger, Live Sound/Pyrotechnics Tech & Pest/Pool Specialist',
    enclaveId: 'culinary_hospitality_events',
    categoryName: 'Live Entertainment Production & Property Services',
    defaultHeadline: 'ETCP Certified Arena Rigger, FOH Live Sound Engineer & Licensed Pest/Pool Operator · Line-Array Acoustics, DMX Lighting, CPO Pool Chemistry & IPM',
    typicalSkills: ['ETCP Arena Rigging', 'Dante Live Sound & DMX Lighting', 'APA Pyrotechnics Safety', 'CPO Langelier Pool Index', 'Structural Pest IPM'],
    tools: [{ name: 'Truss Point-Load, DMX Patch & Langelier Pool Calc', icon: '🎛️', description: 'Chain-hoist bridle load vectors, 64-channel stage patch and pool chlorine/pH index', badge: 'ETCP / CPO' }]
  },

  // ── Category 9, 35, 38 & 41: Furniture, Upholstery, Signage, Luthier & Museum Framing ──
  {
    id: 'upholsterer_signmaker_setbuilder_florist',
    title: 'Master Upholsterer, Sign Installer, Film Set Builder & Floral Designer',
    enclaveId: 'creative_media_arts',
    categoryName: 'Practical Design, Set Construction & Signage',
    defaultHeadline: 'Master Furniture Upholsterer, UL-Listed Sign Fabricator & IATSE Set Carpenter · 8-Way Hand-Tied Springs, Vehicle Wraps, CNC Channel Letters & Floral Installations',
    typicalSkills: ['8-Way Hand-Tied Upholstery', 'CNC Channel Letter Signage', '3M Vinyl Vehicle Wraps', 'IATSE Stage Carpentry', 'AIFD Floral Architecture'],
    tools: [{ name: 'Upholstery Yardage, Sign Wind-Load & Set Cut-List', icon: '🪑', description: 'Pattern-repeat fabric estimator, crane sign anchorage calc and stage flat blueprints', badge: 'IATSE / AIFD' }]
  },
  {
    id: 'piano_tuner_luthier_conservation_framer',
    title: 'Registered Piano Technician (RPT), Master Luthier & Archival Picture Framer',
    enclaveId: 'creative_media_arts',
    categoryName: 'Cultural Heritage, Musical Instruments & Fine Craft',
    defaultHeadline: 'PTG Registered Piano Technician, Acoustic Guitar Luthier & PPFA Certified Picture Framer · Concert Pitch Voicing, Fretboard Plek Leveling & Museum UV Conservation',
    typicalSkills: ['PTG A440 Aural Piano Tuning', 'Soundboard & Action Regulation', 'Acoustic/Electric Luthier Setup', 'PPFA Archival Rag Matting', 'Bookbinding & Gilding'],
    tools: [{ name: 'Inharmonicity Temperament & Archival Matting Sizer', icon: '🎻', description: 'Stretch-tuning cent offset analyzer, neck relief gauge and museum frame rabbet calculator', badge: 'PTG / PPFA' }]
  },

  // ── Category 10, 23 & 37: Retail, Merchandising, Customer Support & Reverse Logistics ──
  {
    id: 'retail_merchandiser_customer_support_lead',
    title: 'Retail Store Supervisor, Visual Merchandiser & Technical Support Specialist',
    enclaveId: 'commerce_small_business',
    categoryName: 'Retail, Sales & Customer Experience',
    defaultHeadline: 'Multi-Unit Retail Supervisor, Planogram Merchandiser & Tier-3 Technical Support Lead · POS Shrink Reduction, Field Sales & E-Commerce Returns RMA',
    typicalSkills: ['Planogram Visual Merchandising', 'POS Inventory & Loss Prevention', 'Omnichannel CRM Support', 'B2B Field Sales', 'Reverse Logistics RMA'],
    tools: [{ name: 'Planogram Conversion & RMA Returns Triage Desk', icon: '🛍️', description: 'Sales-per-square-foot heatmaps, SLA ticket escalation and warranty repair routing', badge: 'NRF Certified' }]
  },

  // ── Category 12, 13, 25 & 33: Accessibility, Braille, Archivist & STARs Pathways ──
  {
    id: 'accessibility_braille_archivist_specialist',
    title: 'Braille Transcriber, Assistive Tech Specialist & Digital Archivist',
    enclaveId: 'education_workforce',
    categoryName: 'Accessibility, Inclusion & Knowledge Preservation',
    defaultHeadline: 'Library of Congress Certified Braille Transcriber, RESNA Assistive Technology Practitioner (ATP) & Certified Archivist · UEB Braille, AAC Devices & Cultural Preservation',
    typicalSkills: ['LOC Unified English Braille (UEB)', 'RESNA Assistive Tech (ATP)', 'IAAP CPACC Accessibility', 'Archival EAD Metadata', 'Special Education IEP Support'],
    tools: [{ name: 'UEB Braille Translation & Assistive Tech Fit Matrix', icon: '♿', description: 'Tactile graphics embosser preview, wheelchair/AAC seating matrix and archival catalog', badge: 'RESNA / LOC' }]
  },
  {
    id: 'stars_retiree_freelancer_newcomer',
    title: 'STARs Non-Degree Specialist, Retiree Mentor, Seasonal & Newcomer Pro',
    enclaveId: 'education_workforce',
    categoryName: 'Nontraditional & Alternative Career Pathways (STARs)',
    defaultHeadline: 'Skilled Through Alternative Routes (STAR) Professional & Senior Master Advisor · Verified Practical Portfolio, Cross-Border Credential Equivalency & Fractional Consulting',
    typicalSkills: ['Verified Practical Portfolio', 'Prior Learning Assessment (PLA)', 'Fractional Mentorship', 'Seasonal Contract Agility', 'Multilingual Transferable Skills'],
    tools: [{ name: 'STARs Competency Equivalence & Prior Learning Vault', icon: '🌟', description: 'Maps hands-on work evidence and international licenses to employer skill requirements', badge: 'STARs Verified' }]
  },

  // ── Category 21 & 22: OT/ICS Industrial Cybersecurity & AI Workflow / No-Code Tech ──
  {
    id: 'ot_ics_scada_physical_cyber_tech',
    title: 'OT/ICS Industrial Cybersecurity & SCADA Network Defense Specialist',
    enclaveId: 'tech_cybersecurity',
    categoryName: 'Industrial OT Security & Critical Infrastructure Defense',
    defaultHeadline: 'GIAC GICSP Industrial Cybersecurity Specialist · IEC 62443 Purdue Model Zoning, Modbus/DNP3 Deep Packet Inspection & Substations/Plant Floor Incident Response',
    typicalSkills: ['IEC 62443 / NERC CIP', 'Claroty / Dragos / Nozomi OT IDS', 'Modbus TCP & DNP3 Protocol Analysis', 'Data Diode Unidirectional Gateways', 'PLC Firmware Integrity'],
    tools: [{ name: 'Purdue Model OT/IT Conduit & DNP3 Packet Inspector', icon: '🛡️', description: 'Level 0–3 industrial asset inventory, PLC logic diffing and unidirectional gateway verification', badge: 'GICSP / IEC 62443' }]
  },
  {
    id: 'ai_workflow_nocode_prompt_data_tech',
    title: 'AI Workflow Automation Specialist, No-Code Builder & RLHF Data Evaluator',
    enclaveId: 'tech_software',
    categoryName: 'Emerging AI Operations, No-Code & Digital Documentation',
    defaultHeadline: 'AI Agent Workflow Architect, Bubble/Retool No-Code Developer & RLHF Domain Evaluator · n8n/Make Orchestration, RAG Knowledge Bases & API Documentation',
    typicalSkills: ['n8n / Zapier / Make AI Workflows', 'Retool / Bubble Internal Tools', 'RLHF & Red-Team Annotation', 'Docs-as-Code Technical Writing', 'CRM Revenue Operations'],
    tools: [{ name: 'Multi-Agent Webhook Canvas & RLHF Eval Rubric', icon: '🤖', description: 'JSON schema tool-calling tester, prompt regression benchmark and automated SOP builder', badge: 'AI Ops Verified' }]
  }
]

// Automatically attach all specialized professions to their parent enclaves
for (const extraProf of [...EXTRA_SPECIALIZED_PROFESSIONS, ...EXPANSION_PROFESSIONS]) {
  const targetEnclave = PROFESSION_ENCLAVES.find(e => e.id === extraProf.enclaveId)
  if (targetEnclave && !targetEnclave.professions.some(p => p.id === extraProf.id)) {
    targetEnclave.professions.push(extraProf)
  }
}

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


