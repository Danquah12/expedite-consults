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
    name: "Healthcare, Clinical, Dental & Caregiving",
    shortName: "Healthcare & Caregiving",
    icon: "🩺",
    tagline: "Electronic health records, surgical suites, dental radiology, home health & palliative care",
    description: "Dedicated workspace for dentists, veterinarians, animal trainers, home health aides, caregivers, elderly care workers, childcare leads, nurses, and physicians.",
    themeColor: "from-teal-600 via-emerald-700 to-cyan-800",
    accentBorder: "border-teal-500",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    badgeText: "text-teal-800 dark:text-teal-300",
    securityClearanceTier: "HIPAA Clinical Credential & Medical Board Licensed (Level 3)",
    feedTags: ["#Healthcare", "#Dentistry", "#Veterinary", "#Nursing", "#HomeHealth", "#Caregivers", "#ElderlyCare", "#Childcare", "#Medicine"],
    professions: [
      {
        id: "dentist",
        title: "General & Cosmetic Dentist (DDS / DMD)",
        enclaveId: "healthcare_medicine",
        categoryName: "Dentistry & Oral Health",
        defaultHeadline: "Doctor of Dental Surgery (DDS) · Restorative Dentistry, Digital CBCT Diagnostics & Implantology",
        typicalSkills: ["Digital CBCT Scans", "Crown & Bridge", "Composite Restorations", "Endodontics", "Local Anesthesia", "Periodontal Care"],
        tools: [
          { name: "Dental CBCT & Radiograph Viewer", icon: "🦷", description: "3D panoramic radiograph analysis, implant angulation and caries mapping", badge: "DICOM Live" },
          { name: "ADA Dental Procedure Code (CDT) Vault", icon: "📋", description: "CDT billing codes, insurance pre-authorizations and periodontal chart logs", badge: "ADA Code" }
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
        categoryName: "Caregiving & Home Support",
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
        categoryName: "Caregiving & Home Support",
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
        categoryName: "Caregiving & Home Support",
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
        categoryName: "Caregiving & Home Support",
        defaultHeadline: "Community Health Worker · Social Determinants of Health (SDOH), Healthcare Access & Immunization Drives",
        typicalSkills: ["SDOH Assessment", "Healthcare Navigation", "Bilingual Outreach", "Cultural Competency", "Public Health"],
        tools: [
          { name: "Community Resource & Benefit Directory", icon: "🤝", description: "Food security programs, Medicaid enrollment guides and clinic transportation vouchers", badge: "Public Health" }
        ]
      },
      {
        id: "registered_nurse",
        title: "Registered Nurse (BSN, RN)",
        enclaveId: "healthcare_medicine",
        categoryName: "Nursing & Clinical Care",
        defaultHeadline: "Registered Nurse (BSN, RN) · Inpatient Telemetry, Medication Administration & Patient Advocacy",
        typicalSkills: ["IV Infusions", "Telemetry Monitoring", "Medication Admin", "Patient Education", "EHR Documentation"],
        tools: [
          { name: "Clinical EHR & MAR Medication Log", icon: "💊", description: "Medication administration records, dosage checks and clinical shift handoff notes", badge: "EHR Ready" }
        ]
      },
      {
        id: "physician",
        title: "Board-Certified Attending Physician (MD / DO)",
        enclaveId: "healthcare_medicine",
        categoryName: "Physician & Clinical Specialties",
        defaultHeadline: "Board-Certified Attending Physician · Internal Medicine, Diagnostic Workups & Evidence-Based Protocols",
        typicalSkills: ["Clinical Diagnostics", "Differential Diagnosis", "Pharmacotherapy", "Patient Management", "Medical Research"],
        tools: [
          { name: "UpToDate & PubMed Clinical Evidence", icon: "📚", description: "Peer-reviewed treatment algorithms, clinical trial summaries and drug interaction checker", badge: "UpToDate" }
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
        id: "textile_worker",
        title: "Industrial Textile & Fabric Fabricator",
        enclaveId: "community_civic_security",
        categoryName: "Industrial Manufacturing & Production",
        defaultHeadline: "Textile Machine Technician · Automated Loom Operation, Thread Tensioning & Fabric Inspection",
        typicalSkills: ["Loom Operations", "Thread Tension", "Dye Batch Matching", "Defect Mapping", "Machine Maintenance"],
        tools: [
          { name: "Loom Tension & Fabric Defect Counter", icon: "🧶", description: "Picks-per-inch verification, roll defect tags and yarn inventory balances", badge: "Textile Spec" }
        ]
      }
    ]
  },

  // ─── 11. CYBERSECURITY & OFFENSIVE SECURITY ─────────────────────
  {
    id: "tech_cybersecurity",
    name: "Cybersecurity, Threat Intelligence & Offensive Ops",
    shortName: "Cybersecurity & Infosec",
    icon: "🛡️",
    tagline: "Live DAST sandboxes, exploit graphs, malware hypervisors, GovCloud CSPM & ransomware recovery",
    description: "Dedicated workspace for red teamers, penetration testers, reverse engineers, DFIR responders, and threat hunters. Features live external hypervisors and exploit platforms.",
    themeColor: "from-cyan-600 via-blue-700 to-indigo-900",
    accentBorder: "border-cyan-500",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
    badgeText: "text-cyan-800 dark:text-cyan-300",
    securityClearanceTier: "TS/SCI Red Team Operator (Level 4)",
    feedTags: ["#Cybersecurity", "#RedTeam", "#DFIR", "#MalwareAnalysis", "#Pentest", "#ZeroTrust", "#SCADA"],
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
      }
    ]
  },

  // ─── 12. SOFTWARE, CLOUD & AI ENGINEERING ───────────────────────
  {
    id: "tech_software",
    name: "Software, Cloud Architecture & AI Engineering",
    shortName: "Software & Cloud",
    icon: "💻",
    tagline: "AST static analysis, AI-BOM software supply chain, IaC Terraform guard & API security shields",
    description: "Dedicated workspace for software engineers, cloud architects, DevSecOps leads, and AI researchers. Features live automated code analyzers and integration layers.",
    themeColor: "from-blue-600 via-indigo-700 to-purple-800",
    accentBorder: "border-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeText: "text-blue-800 dark:text-blue-300",
    securityClearanceTier: "Staff Cloud Engineer (Level 3)",
    feedTags: ["#SoftwareEngineering", "#CloudArchitecture", "#DevSecOps", "#Kubernetes", "#AIResearch", "#IaC"],
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
      }
    ]
  },

  // ─── 13. LAW, GOVERNMENT & NATIONAL DEFENSE ─────────────────────
  {
    id: "law_gov_defense",
    name: "Law, Government Compliance & Defense",
    shortName: "Law, Gov & Defense",
    icon: "🏛️",
    tagline: "NIST SP 800-53 cATO, OSCAL compliance, STRIDE threat models & federal defense procurements",
    description: "Dedicated workspace for corporate attorneys, compliance officers, and defense policy analysts. Featuring the live Aegis RMF continuous ATO platform.",
    themeColor: "from-slate-700 via-slate-800 to-zinc-950",
    accentBorder: "border-slate-500",
    badgeBg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
    badgeText: "text-slate-800 dark:text-slate-300",
    securityClearanceTier: "TS/SCI Polygraph (Level 5 Federal)",
    feedTags: ["#Defense", "#GovCloud", "#NIST80053", "#cATO", "#Compliance", "#Legal", "#CMMC"],
    professions: [
      {
        id: "corporate_attorney",
        title: "General Counsel & Regulatory Compliance Attorney",
        enclaveId: "law_gov_defense",
        categoryName: "Law, Gov & Defense",
        defaultHeadline: "General Counsel · Federal Contracting, CMMC Cybersecurity Defense & M&A Governance",
        typicalSkills: ["Federal Acquisition Regs (FAR)", "ITAR Compliance", "CMMC Level 2", "Export Controls", "Corporate M&A"],
        tools: [
          { name: "Aegis RMF Continuous ATO Platform", icon: "📜", description: "NIST SP 800-53 OSCAL machine-readable compliance & continuous POAM engine", badge: "LIVE cATO" },
          { name: "15-Threat Modeling Suite", icon: "🛡️", description: "STRIDE automated threat vector analysis & architectural mitigation catalog", badge: "LIVE VERCEL" }
        ]
      }
    ]
  },

  // ─── 14. FINANCE, ACCOUNTING & PRIVATE EQUITY ───────────────────
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
          { name: "GAAP Ledger Reconciler", icon: "📑", description: "Automated bank feed anomaly detection and tax schedule export", badge: "GAAP Ready" }
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
