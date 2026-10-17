export interface MarketplaceProduct {
  id: string
  name: string
  tagline: string
  category: 'Software' | 'Services' | 'Training' | 'Enterprise Solutions'
  professionEnclave?: string
  subCategory: string
  icon: string
  badge?: string
  rating: number
  reviewsCount: number
  activeUsersCount?: string
  pricing: {
    displayPrice: string
    billingPeriod: string
    hasFreeTrial: boolean
    trialDays?: number
  }
  vendor: {
    name: string
    logo: string
    isVerified: boolean
    isFellow?: boolean
  }
  overview: string
  features: { title: string; desc: string }[]
  screenshots: string[]
  demoUrl?: string
  liveUrl?: string
  isVercelLive?: boolean
  isLaunchpadDeployed?: boolean
  launchpadCategory?: 'security' | 'ai' | 'marketplace' | 'career' | 'campus' | 'trades' | 'orchestration'
  livePort?: number
  architecture: {
    title: string
    summary: string
    layers: string[]
    latency: string
    dataPrivacy: string
  }
  integrations: string[]
  security: {
    compliance: string[]
    encryption: string
    isolation: string
  }
  pricingTiers: {
    name: string
    price: string
    period: string
    description: string
    features: string[]
    recommended?: boolean
    ctaText: string
  }[]
  reviews: {
    author: string
    role: string
    company: string
    avatar: string
    rating: number
    text: string
    date: string
  }[]
  documentation: {
    quickstart: string
    apiEndpoints: string[]
    sdkSupport: string[]
  }
  caseStudies: {
    customer: string
    logo: string
    headline: string
    results: string[]
  }[]
  support: {
    sla: string
    channel: string
    responseHours: string
  }
}

export const MARKETPLACE_CATEGORIES_CONFIG = [
  {
    id: 'Software',
    label: '💻 Software',
    subCategories: ['All Software', 'Cybersecurity', 'AI', 'Cloud', 'DevSecOps', 'Data', 'Productivity', 'Business']
  },
  {
    id: 'Services',
    label: '🛠️ Services',
    subCategories: ['All Services', 'Consulting', 'Penetration Testing', 'Security Assessments', 'Cloud Assessments', 'Compliance', 'Architecture']
  },
  {
    id: 'Training',
    label: '🎓 Training',
    subCategories: ['All Training', 'Courses', 'Certifications', 'Labs', 'Bootcamps']
  },
  {
    id: 'Enterprise Solutions',
    label: '🏢 Enterprise Solutions',
    subCategories: ['All Enterprise', 'SaaS', 'APIs', 'Security platforms', 'Enterprise software']
  }
]

export const MASTER_MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // ================= SKILLED TRADES & CARPENTRY =================
  {
    id: 'prod_festool_domino',
    professionEnclave: 'trades_construction',
    name: 'Festool Domino XL DF 700 Joiner System',
    tagline: 'Precision mortise and tenon joinery system for heavy timber and architectural finish wood',
    category: 'Software',
    subCategory: 'Tools & Joinery',
    icon: '🧰',
    badge: '🔨 Guild Verified Spec',
    rating: 4.99,
    reviewsCount: 384,
    activeUsersCount: '4,200+ Master Craftsmen',
    pricing: {
      displayPrice: '$1,650',
      billingPeriod: 'per unit',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Festool USA Pro Center',
      logo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'The Festool Domino XL DF 700 produces rock-solid mortise and tenon joints up to 140mm depth. Mortising without templates in solid oak, Douglas fir, and exotic hardwoods with sub-millimeter tolerances.',
    features: [
      { title: 'Patented Pendulum Routing', desc: 'Continuous oscillating mortise bit produces flawless slot walls without tearout.' },
      { title: 'Variable Depth Stops', desc: 'Instant adjustment from 15mm to 70mm mortise depth per plunge.' },
      { title: 'Dust Extraction Port', desc: '99.9% dust capture when coupled with Festool CT extractors.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'Precision Mechanical Routing',
      summary: 'High-torque direct-drive motor with rack-and-pinion height adjustment.',
      layers: ['720W High-Torque Motor', 'Precision Fence Pivot 0-90°', 'Cross Stop Index Pins'],
      latency: 'Instant Setup',
      dataPrivacy: 'Industrial Tooling'
    },
    integrations: ['Festool CT Series Extractors', 'Festool MFS Routing Templates'],
    security: {
      compliance: ['UL / CSA Certified', 'OSHA Dust Standards'],
      encryption: 'N/A',
      isolation: 'Tooling Hardware'
    },
    pricingTiers: [
      {
        name: 'Domino XL DF 700 Set',
        price: '$1,650',
        period: 'one-time',
        description: 'Complete joiner with 12mm cutter, support bracket, and trim stop in Systainer SYS 5.',
        features: ['12mm mortise bit included', 'Trim stop for narrow timber', 'Systainer SYS 5 case', '3-year Festool Service All-Inclusive'],
        ctaText: 'Buy Verified Unit'
      }
    ],
    reviews: [
      {
        author: 'David Miller',
        role: 'Master Timber Carpenter',
        company: 'Heritage Guild',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The Domino XL cut our compound bent fabrication time in half while keeping our joinery tolerances well under 1mm.',
        date: 'October 2, 2026'
      }
    ],
    documentation: {
      quickstart: 'Calibrate fence height against board centerline and set mortise depth stops.',
      apiEndpoints: [],
      sdkSupport: []
    },
    caseStudies: [],
    support: {
      sla: '3-Year All-Inclusive Warranty',
      channel: 'Festool Pro Dealer Network',
      responseHours: '24 Business Hours'
    }
  },
  {
    id: 'prod_leica_disto',
    professionEnclave: 'trades_construction',
    name: 'Leica 3D Disto Total Station Laser Scanner',
    tagline: 'Capture 3D room geometries, uneven walls, and roof rafters directly to CAD DXF',
    category: 'Software',
    subCategory: 'CAD & Measurement',
    icon: '📐',
    badge: '📐 Millimeter Precision',
    rating: 4.95,
    reviewsCount: 160,
    activeUsersCount: '1,800+ Commercial Builders',
    pricing: {
      displayPrice: '$7,800',
      billingPeriod: 'per scanner',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'Leica Geosystems Commercial',
      logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'The Leica 3D Disto measures coordinates, angles, and distances in 3D. Projects layout points onto walls and ceilings for timber posts, steel columns, and coffered ceilings.',
    features: [
      { title: 'Real-time DXF/DWG Export', desc: 'Direct wireless export to AutoCAD, Revit, and Chief Architect.' },
      { title: 'Projector Function', desc: 'Projects layout grid lines directly onto concrete slabs and ceiling joists.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'Laser Distance & Angular Encoding',
      summary: 'Dual-axis electronic tilt compensation with high-precision optical laser.',
      layers: ['High-Accuracy Laser Distancer', 'Optical Viewfinder Camera', 'Tablet Control Software'],
      latency: 'Real-time telemetry',
      dataPrivacy: 'Local encrypted CAD storage'
    },
    integrations: ['AutoCAD', 'Revit', 'PlanGrid', 'Procore'],
    security: {
      compliance: ['ISO 17123-4 Calibration', 'Class 2 Laser Safety'],
      encryption: 'WPA3 Wireless',
      isolation: 'Local Hardware Enclave'
    },
    pricingTiers: [
      {
        name: 'Commercial Builder Kit',
        price: '$7,800',
        period: 'one-time',
        description: 'Complete 3D Disto unit with tablet, tripod, target marks, and carry case.',
        features: ['Full 3D scan capability', 'Ruggedized Windows tablet', 'Leica calibration certificate'],
        ctaText: 'Request Demo Unit'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Level tripod and calibrate base reference marks using digital optical camera.',
      apiEndpoints: [],
      sdkSupport: []
    },
    caseStudies: [],
    support: {
      sla: '24/7 Field Technical Support',
      channel: 'Leica Geosystems Direct',
      responseHours: '4 Hours'
    }
  },

  // ================= HEALTHCARE & MEDICINE =================
  {
    id: 'prod_butterfly_iq',
    professionEnclave: 'healthcare_medicine',
    name: 'Butterfly iQ3 Whole-Body Handheld Ultrasound',
    tagline: 'Single-probe bedside ultrasound for FAST trauma exams, vascular access, and cardiac sweeps',
    category: 'Software',
    subCategory: 'Diagnostic Devices',
    icon: '🩺',
    badge: '🩺 FDA 510(k) Cleared',
    rating: 4.98,
    reviewsCount: 512,
    activeUsersCount: '28,000+ Physicians & Nurses',
    pricing: {
      displayPrice: '$2,890',
      billingPeriod: 'per probe',
      hasFreeTrial: true,
      trialDays: 30
    },
    vendor: {
      name: 'Butterfly Network Inc.',
      logo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Powered by Ultrasound-on-Chip technology, the Butterfly iQ3 replaces curved, linear, and phased array probes with a single semiconductor transducer. Ideal for trauma bay FAST exams and bedside vascular cannulation.',
    features: [
      { title: 'Ultrasound-on-Chip™', desc: 'Single silicon probe scans from deep abdominal aorta to superficial radial artery.' },
      { title: 'iQ Slice Automated Biplane', desc: 'Steer scan planes in real-time without moving the physical probe.' },
      { title: 'HIPAA Compliant Cloud Vault', desc: 'Zero-knowledge PHI storage with direct PACS / Epic EHR integration.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'Semiconductor Ultrasound Array',
      summary: 'CMOS micro-machined capacitive ultrasound transducers with on-die beamforming.',
      layers: ['9,000 Micromachined Transducers', 'Hardware Beamformer ASIC', 'iOS/Android Secure App Engine'],
      latency: '<30ms display latency',
      dataPrivacy: 'HIPAA BAA Compliant & SOC 2 Type II'
    },
    integrations: ['Epic Systems EHR', 'Cerner', 'GE Centricity PACS', 'Philips Vue PACS'],
    security: {
      compliance: ['FDA Cleared', 'CE Mark', 'HIPAA BAA', 'SOC 2 Type II'],
      encryption: 'AES-256 in transit & at rest',
      isolation: 'Zero-Knowledge PHI Enclave'
    },
    pricingTiers: [
      {
        name: 'Clinical Practitioner Edition',
        price: '$2,890',
        period: 'one-time probe + $420/yr cloud',
        description: 'Includes Butterfly iQ3 probe, charging dock, unlimited PACS cloud storage, and biplane imaging.',
        features: ['Full ultrasound presets', 'Needle Viz biplane tracking', 'Unlimited secure DICOM uploads'],
        ctaText: 'Deploy Clinical Probe'
      }
    ],
    reviews: [
      {
        author: 'Dr. Angela Vance, MD',
        role: 'Orthopedic Trauma Surgeon',
        company: 'Johns Hopkins Shock Trauma',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The iQ3 needle tracking makes guided articular injections and bedside hematoma blocks effortless in our Level 1 bay.',
        date: 'October 11, 2026'
      }
    ],
    documentation: {
      quickstart: 'Plug probe into USB-C mobile device and select FAST Abdomen preset.',
      apiEndpoints: ['/api/dicom/upload', '/api/pacs/sync'],
      sdkSupport: ['Butterfly Mobile SDK']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Cloud Uptime SLA',
      channel: 'Clinical Hotline 24/7',
      responseHours: '1 Hour'
    }
  },
  {
    id: 'prod_belmont_infuser',
    professionEnclave: 'healthcare_medicine',
    name: 'Belmont Rapid Infuser RI-2',
    tagline: 'High-speed warmed blood and fluid delivery up to 500 mL/min for trauma resuscitations',
    category: 'Enterprise Solutions',
    subCategory: 'Trauma & Resuscitation',
    icon: '🩸',
    badge: '🏥 Trauma Center RFP',
    rating: 4.99,
    reviewsCount: 198,
    activeUsersCount: '850+ Level 1 Trauma Bays',
    pricing: {
      displayPrice: '$24,500',
      billingPeriod: 'per workstation',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Belmont Medical Technologies',
      logo: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'The gold standard in rapid fluid resuscitation. Infuses warmed blood products from 2.5 to 500 mL/min at precise 37.5°C temperature while automatically detecting and venting micro-air bubbles.',
    features: [
      { title: 'Patented Electromagnetic Induction Heating', desc: 'Instantaneous fluid warming without hot spots or hemolysis risk.' },
      { title: 'Two Ultrasonic Air Detectors', desc: 'Failsafe automated line clamping eliminates air embolism risks at high flow rates.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'Electromagnetic Induction Fluid Warming',
      summary: 'Dual microprocessor closed-loop control monitoring temperature, pressure, and air bubble formation.',
      layers: ['High-Frequency Induction Coils', 'Dual Ultrasonic Air Sensors', 'Positive Displacement Roller Pump'],
      latency: 'Sub-second response',
      dataPrivacy: 'Medical Device Hardware'
    },
    integrations: ['Hospital Central Supply', 'Blood Bank Barcode Scanners'],
    security: {
      compliance: ['FDA PMA Approved', 'IEC 60601-1 Medical Electrical Safety'],
      encryption: 'N/A',
      isolation: 'Isolated Bedside System'
    },
    pricingTiers: [
      {
        name: 'Hospital Trauma Bay Package',
        price: '$24,500',
        period: 'system price',
        description: 'Complete Belmont RI-2 console with IV pole mount, pressure transducer, and starter consumable cassettes.',
        features: ['500 mL/min flow rate', 'Battery backup for patient transport', 'Full biomedical certification'],
        ctaText: 'Submit Hospital RFP'
      }
    ],
    reviews: [
      {
        author: 'Elena Rostova, RN',
        role: 'Trauma Bay Resuscitation Lead',
        company: 'Shock Trauma',
        avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The Belmont RI-2 is essential for our Massive Transfusion Protocols. It delivers 4 units of whole blood in under 3 minutes.',
        date: 'October 8, 2026'
      }
    ],
    documentation: {
      quickstart: 'Install disposable cassette and perform 45-second automated saline prime.',
      apiEndpoints: [],
      sdkSupport: []
    },
    caseStudies: [],
    support: {
      sla: 'Biomedical Emergency Response',
      channel: 'Clinical Engineering Support',
      responseHours: '2 Hours'
    }
  },

  // ================= AUTOMOTIVE & FLEET MECHANICS =================
  {
    id: 'prod_snapon_zeus',
    professionEnclave: 'automotive_mechanics',
    name: 'Snap-on ZEUS+ Diagnostic Workstation',
    tagline: 'Flagship scan tool with Fast-Track intelligent diagnostics, OEM cloud flashing, and 4-channel scope',
    category: 'Software',
    subCategory: 'Scan Tools',
    icon: '🧰',
    badge: '🔧 Master Tech Choice',
    rating: 4.97,
    reviewsCount: 420,
    activeUsersCount: '9,200+ Master Technicians',
    pricing: {
      displayPrice: '$11,995',
      billingPeriod: 'per console',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Snap-on Diagnostics Division',
      logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'ZEUS+ combines comprehensive multi-brand OEM scan tool diagnostics with Fast-Track Intelligent Diagnostics that filters millions of repair records down to the exact verified component test for the vehicle code.',
    features: [
      { title: 'Fast-Track Intelligent Diagnostics', desc: 'Automatically displays known fixes, TSBs, and guided component tests for active DTC.' },
      { title: 'Integrated 4-Channel Lab Scope', desc: 'High-speed waveform capture with automated signal presets for sensors and actuators.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'Automotive Embedded Diagnostic OS',
      summary: 'Dual core quad-threaded processing unit with CAN-FD and DoIP (Diagnostics over Internet Protocol) transceivers.',
      layers: ['CAN-FD / DoIP Multiplexer', 'High-Speed Lab Scope A/D', 'Snap-on Cloud Database Engine'],
      latency: '<5ms OBD PID query',
      dataPrivacy: 'Enterprise repair cloud'
    },
    integrations: ['Mitchell 1 ProDemand', 'Snap-on Cloud Portal', 'SureTrack Real Fixes'],
    security: {
      compliance: ['SAE J2534 Pass-thru', 'ISO 13400 DoIP', 'FCA Secure Gateway Authorized'],
      encryption: 'TLS 1.3 OEM Gateway Authentication',
      isolation: 'Hardware Enclave'
    },
    pricingTiers: [
      {
        name: 'Master Tech Complete Kit',
        price: '$11,995',
        period: 'one-time console + software update',
        description: 'Includes ZEUS+ workstation, wireless scan module, 4-channel lead set, capacitive probe, and docking cradle.',
        features: ['Full European, Asian, and Domestic coverage', 'FCA & Ford Security Gateway access', '2-year software warranty'],
        ctaText: 'Order Diagnostic Station'
      }
    ],
    reviews: [
      {
        author: 'Marcus Miller, ASE Master Tech',
        role: 'Shop Foreman',
        company: 'Penske Auto Group',
        avatar: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The Fast-Track diagnostics on ZEUS+ pinpoints bad grounds and intermittently sticking solenoids faster than any tool on the market.',
        date: 'October 10, 2026'
      }
    ],
    documentation: {
      quickstart: 'Plug wireless VCI into OBD-II port, select vehicle VIN decode, and view intelligent code results.',
      apiEndpoints: [],
      sdkSupport: []
    },
    caseStudies: [],
    support: {
      sla: 'Snap-on Tech Rep On-Site Visits',
      channel: 'Snap-on Diagnostic Hotline',
      responseHours: 'Instant Call-In'
    }
  },
  {
    id: 'prod_pico_4425a',
    professionEnclave: 'automotive_mechanics',
    name: 'PicoScope 4425A 4-Channel Master Diagnostic Kit',
    tagline: 'High-speed oscilloscope with Connect-Detect smart probes for CAN-FD, sensors, and secondary ignition',
    category: 'Software',
    subCategory: 'Oscilloscopes',
    icon: '⚡',
    badge: '⚡ Waveform Master Kit',
    rating: 4.99,
    reviewsCount: 310,
    activeUsersCount: '6,400+ Diagnostic Specialists',
    pricing: {
      displayPrice: '$3,850',
      billingPeriod: 'per master kit',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Pico Technology Automotive',
      logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'The PicoScope 4425A is the global benchmark for oscilloscope diagnostics. Features 400 MS/s sample rates, 12-bit resolution, and PicoBNC+ intelligent probes that automatically configure voltage ranges and scales in PicoScope 7.',
    features: [
      { title: 'PicoBNC+ Smart Probe Recognition', desc: 'The software instantly sets up scales and probes when clicked into the BNC connector.' },
      { title: 'CAN-FD Serial Bus Decoding', desc: 'Hardware decoding of packet arbitration, payload bytes, and CRC error flags in real-time.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80'],
    architecture: {
      title: 'High-Speed Analog Waveform Digitizer',
      summary: '4 floating input channels with 250M buffer memory and 12-bit vertical resolution.',
      layers: ['High-Bandwidth 20MHz Analog Front-End', 'Deep Memory Buffer', 'PicoScope 7 Cloud Waveform Library'],
      latency: 'Real-time oscilloscope capture',
      dataPrivacy: 'Local scope data'
    },
    integrations: ['PicoScope 7 Automotive', 'WPS500X Pressure Transducer', 'NVH Optical Balance Sensor'],
    security: {
      compliance: ['CE / UKCA Certified', 'CAT I 100V Floating Inputs'],
      encryption: 'N/A',
      isolation: 'Galvanically Isolated BNC Probes'
    },
    pricingTiers: [
      {
        name: '4-Channel Master Diagnostic Kit',
        price: '$3,850',
        period: 'complete kit',
        description: 'Includes PicoScope 4425A, 4 smart leads, 2000A/200A AC/DC current clamp, 60A current clamp, secondary ignition pickup, and heavy-duty case.',
        features: ['4x PicoBNC+ test leads', 'Current clamps included', 'Lifetime software updates'],
        ctaText: 'Acquire Master Kit'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Install PicoScope 7 software, connect USB cable, and attach PicoBNC+ smart probe to Channel A.',
      apiEndpoints: [],
      sdkSupport: []
    },
    caseStudies: [],
    support: {
      sla: 'Lifetime Free Software Updates',
      channel: 'Pico Auto Support Team',
      responseHours: '24 Hours'
    }
  },

  // ================= CYBERSECURITY & TECH =================
  {
    id: 'prod_axiom',
    name: 'AXIOM AI-Powered Cyber Suite',
    tagline: 'Autonomous AI Threat Detection, Posture Correlation & Exploit Neutralization',
    category: 'Software',
    subCategory: 'Cybersecurity',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    livePort: 9012,
    icon: '⚡',
    badge: '⚡ PORT 9012 · ASPM Flagship',
    rating: 4.98,
    reviewsCount: 218,
    activeUsersCount: '14,800+ Active Nodes',
    pricing: {
      displayPrice: '$499',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Core Labs',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'AXIOM is an enterprise-grade agentic AI security platform combining continuous ASPM telemetry, real-time eBPF microVM monitoring, and automated remediation PR generation to secure hybrid cloud ecosystems.',
    features: [
      { title: 'Autonomous Multi-Agent Pentesting', desc: 'Weaponized exploit validation safely sandboxed to verify zero false positives.' },
      { title: 'AI-BOM & LLM Guardrails', desc: 'Scan training pipelines, tokenized prompts, and third-party AI agents for prompt injections and nonce bypasses.' },
      { title: 'Checkmarx MCP & GitHub Auto-PR Assist', desc: 'Generates secure pull requests with unit tests directly in your CI/CD repository.' },
      { title: 'Neo4j Blast Radius Graphing', desc: 'Visualizes attack choke points and identity privilege escalation paths in real time.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'http://localhost:9012/',
    liveUrl: 'http://localhost:9012',
    architecture: {
      title: 'Decentralized MicroVM Agent Mesh',
      summary: 'Runs telemetry collectors in lightweight WebAssembly enclaves while aggregating cryptographic attack graphs via Rust distributed workers.',
      layers: ['Next.js 16 Web Dashboard', 'GraphQL & MCP Server Gateway', 'Neo4j Blast Radius Engine', 'eBPF Kernel Telemetry'],
      latency: '< 18ms real-time event pipeline',
      dataPrivacy: 'Zero customer source code retention, 100% on-prem / sovereign VPC capable.'
    },
    integrations: ['AWS Security Hub', 'Checkmarx MCP', 'Slack', 'Jira Software', 'GitHub Actions', 'Datadog', 'Splunk SIEM', 'Kubernetes'],
    security: {
      compliance: ['SOC 2 Type II', 'FedRAMP High Ready', 'HIPAA BAA Compliant', 'ISO 27001'],
      encryption: 'AES-256-GCM at rest · TLS 1.3 mTLS with hardware TPM keys',
      isolation: 'Dedicated tenant enclave per enterprise deployment'
    },
    pricingTiers: [
      {
        name: 'Starter Cloud',
        price: '$499',
        period: '/ month',
        description: 'Ideal for fast-scaling engineering teams securing up to 50 cloud repositories.',
        features: ['Up to 50 Repositories', 'Continuous AI-BOM Scanning', 'Checkmarx MCP Integration', 'Slack & Jira Realtime Alerts', '14-Day Free Trial'],
        ctaText: 'Start 14-Day Free Trial'
      },
      {
        name: 'Enterprise Scale',
        price: '$1,850',
        period: '/ month',
        description: 'Full autonomous offensive validation, blast radius choke point graphs, and auto-PR assists.',
        recommended: true,
        features: ['Unlimited Repositories & MicroVMs', 'Autonomous Weaponized Exploit Queue', 'Neo4j Blast Radius Attack Graphs', 'Custom MCP Tool Server Connectors', '24/7 Dedicated Cyber Engineer SLA'],
        ctaText: 'Buy Enterprise License'
      },
      {
        name: 'Defense Enclave (On-Prem)',
        price: 'Custom',
        period: 'annual contract',
        description: 'Air-gapped sovereign deployment with FIPS 140-3 hardware enclave support.',
        features: ['Air-Gapped / IL-5 / IL-6 Ready', 'Dedicated Custom LLM Fine-Tuning', 'Continuous ATO Compliance Pack', 'Direct Engineering Hotline'],
        ctaText: 'Contact Defense Solutions'
      }
    ],
    reviews: [
      {
        author: 'Marcus Vance',
        role: 'VP of Information Security',
        company: 'CloudScale Global',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'AXIOM cut our vulnerability triage time by 78%. The auto-PR generator writes cleaner code and tests than our tier 2 security analysts.',
        date: 'August 2026'
      },
      {
        author: 'Dr. Elena Rostova',
        role: 'Chief AI Safety Scientist',
        company: 'Stanford AI Labs',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The AI-BOM and prompt injection validation features are lightyears ahead of standard static scanners. Essential for agentic systems.',
        date: 'July 2026'
      }
    ],
    documentation: {
      quickstart: 'npm install @expedite/axiom-agent && npx axiom init --token=$EXPEDITE_KEY',
      apiEndpoints: ['POST /api/v1/scan/hybrid', 'POST /api/v1/exploit/sandbox-verify', 'GET /api/v1/graph/blast-radius'],
      sdkSupport: ['TypeScript / Node.js', 'Python 3.12+', 'Go 1.23+', 'Rust']
    },
    caseStudies: [
      {
        customer: 'Horizon FinTech Group',
        logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated 100% of SOC2 Type II AppSec Evidence for Series B Audit',
        results: ['Zero critical vulnerabilities in production', '600+ engineer hours saved annually', 'Instant board PDF reports']
      }
    ],
    support: {
      sla: '99.99% Availability Guarantee',
      channel: 'Dedicated Slack Connect Channel & Encrypted Ticket Terminal',
      responseHours: '< 15 Minutes for P1 Security Incidents'
    }
  },
  {
    id: 'prod_11_dast',
    professionEnclave: 'tech_cybersecurity',
    name: '11-DAST Dynamic Pentesting Platform',
    tagline: 'Autonomous dynamic vulnerability scanner, API fuzzing engine & attack surface analyzer',
    category: 'Software',
    subCategory: 'Cybersecurity',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    icon: '🎯',
    badge: '⚡ Live Vercel Pentest',
    rating: 4.97,
    reviewsCount: 182,
    activeUsersCount: '9,200+ Scans Completed',
    pricing: {
      displayPrice: '$499',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Offensive Red Team',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Production-ready dynamic application security testing (DAST) platform for enterprise APIs, single-page web applications, and authenticated user flows with automated exploit verification.',
    features: [
      { title: 'Automated Web & API Crawling', desc: 'Discovers REST, GraphQL, and WebSocket endpoints with authenticated token injection.' },
      { title: 'Active Exploitation Verification', desc: 'Tests SQLi, SSRF, XSS, and command injections in safe microVM sandboxes.' },
      { title: 'Zero False Positive Proofs', desc: 'Attaches executable cURL reproduction commands and response traces to every finding.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'https://11-dast-security-platform.vercel.app',
    liveUrl: 'https://11-dast-security-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Distributed Asynchronous Scanning Engine',
      summary: 'Stateless scanning workers executed on serverless edge nodes.',
      layers: ['Next.js App Router', 'Playwright Headless Browser Fleet', 'PostgreSQL Vulnerability DB'],
      latency: '< 15ms endpoint probe',
      dataPrivacy: 'All target data encrypted in transit and at rest with customer-managed keys.'
    },
    integrations: ['GitHub Actions', 'GitLab CI', 'Jira', 'Slack', 'DefectDojo'],
    security: {
      compliance: ['SOC 2 Type II', 'OWASP Top 10', 'FedRAMP High'],
      encryption: 'TLS 1.3 / AES-256',
      isolation: 'Ephemeral container isolation'
    },
    pricingTiers: [
      {
        name: 'Starter Pentest',
        price: '$499',
        period: '/ month',
        description: 'Continuous DAST scanning for up to 5 web apps and 20 APIs.',
        features: ['5 Web Applications', '20 API Endpoints', 'Weekly Automated Scans', 'PDF Audit Reports'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Enterprise Defense',
        price: '$1,499',
        period: '/ month',
        recommended: true,
        description: 'Unlimited continuous scans, custom header auth, and CI/CD gating.',
        features: ['Unlimited Targets', 'CI/CD Break-Build Gates', 'Real-time Webhook Alerts', 'Dedicated AppSec Specialist'],
        ctaText: 'Launch Enterprise'
      }
    ],
    reviews: [
      {
        author: 'Marcus Vance',
        role: 'VP Defense Systems',
        company: 'Defense Systems Group',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The automated proof-of-concept verification saved our team dozens of hours of manual verification.',
        date: 'September 2026'
      }
    ],
    documentation: {
      quickstart: 'npx dast-cli scan --target=https://api.yourdomain.com --auth=Bearer token',
      apiEndpoints: ['POST /api/v1/scan', 'GET /api/v1/scan/:id/status'],
      sdkSupport: ['TypeScript', 'Python', 'Go']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Uptime',
      channel: 'Slack Connect & Portal Ticket',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_16_malware',
    professionEnclave: 'tech_cybersecurity',
    name: '16-Malware Analysis & Detonation Hypervisor',
    tagline: 'Automated bare-metal detonation sandbox, Ghidra reverse engineering & YARA generator',
    category: 'Software',
    subCategory: 'Cybersecurity',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    icon: '🔬',
    badge: '☣️ Live Sandboxing',
    rating: 4.96,
    reviewsCount: 142,
    activeUsersCount: '3,800+ Samples Analyzed',
    pricing: {
      displayPrice: '$650',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'Expedite DFIR Labs',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'High-security dynamic malware detonation and reverse engineering platform with automated memory forensics, syscall tracing, and Ghidra decompilation in isolated hypervisors.',
    features: [
      { title: 'Bare-Metal Detonation', desc: 'Traces kernel-level hooking, hollowed processes, and reflective DLL injection in isolated microVMs.' },
      { title: 'Interactive Ghidra Decompiler', desc: 'Browse decompiled C pseudocode and control-flow graphs directly in your browser.' },
      { title: 'Automated YARA Authoring', desc: 'Produces production-ready YARA rules for newly unpacked payload signatures.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'https://16-malware-analysis-platform.vercel.app',
    liveUrl: 'https://16-malware-analysis-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Hypervisor Detonation Engine',
      summary: 'Air-gapped Firecracker microVMs with kernel-level eBPF tracing.',
      layers: ['Web Hypervisor UI', 'Kernel eBPF Telemetry', 'Ghidra Headless Analyzer'],
      latency: '< 20ms instruction tracing',
      dataPrivacy: 'Samples automatically sanitized and encrypted in air-gapped enclaves.'
    },
    integrations: ['MISP', 'OpenCTI', 'Elastic SIEM', 'Splunk'],
    security: {
      compliance: ['NIST SP 800-61', 'DoD 8570'],
      encryption: 'AES-256 GCM',
      isolation: 'Hardware virtualized air-gap'
    },
    pricingTiers: [
      {
        name: 'DFIR Tier',
        price: '$650',
        period: '/ month',
        description: 'Up to 50 sample detonations per day with full Ghidra disassembly reports.',
        features: ['50 Detonations / Day', 'Full Memory Dumps', 'Automated YARA Rules', 'MITRE ATT&CK Mapping'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'curl -X POST https://16-malware-analysis-platform.vercel.app/api/analyze -F "sample=@malware.bin"',
      apiEndpoints: ['POST /api/analyze', 'GET /api/report/:id'],
      sdkSupport: ['Python', 'REST']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Dedicated DFIR Channel',
      responseHours: '< 30 Minutes'
    }
  },
  {
    id: 'prod_17_ransomware',
    professionEnclave: 'tech_cybersecurity',
    name: '17-Ransomware Blast Radius & Recovery Console',
    tagline: 'Automated lateral blast radius isolation, shadow copy decryption & recovery orchestration',
    category: 'Software',
    subCategory: 'Cybersecurity',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    icon: '☣️',
    badge: '⚡ Live Recovery',
    rating: 4.98,
    reviewsCount: 96,
    activeUsersCount: '450+ Enclaves Protected',
    pricing: {
      displayPrice: '$890',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Incident Recovery',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Enterprise incident containment system for simulated and real ransomware attacks. Automatically calculates the lateral infection graph and generates immutable recovery orchestrations.',
    features: [
      { title: 'Blast Radius Mapping', desc: 'Identifies infected domain controllers, backup repositories, and tier-0 credentials in seconds.' },
      { title: 'Zero-Data Loss Recovery', desc: 'Orchestrates point-in-time immutable snapshot restores across AWS, Azure, and on-prem VMware.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://17-ransomware-recovery-platform.vercel.app',
    liveUrl: 'https://17-ransomware-recovery-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Immutable Recovery Bus',
      summary: 'Air-gapped vault orchestration engine with hardware key verification.',
      layers: ['Incident Commander Console', 'Immutable Object Storage', 'Active Directory Restorer'],
      latency: 'Sub-second blast radius calculation',
      dataPrivacy: 'Zero-knowledge encrypted key vault.'
    },
    integrations: ['CrowdStrike Falcon', 'SentinelOne', 'Veeam', 'AWS Backup'],
    security: {
      compliance: ['CMMC 2.0 Level 3', 'NIST SP 800-34'],
      encryption: 'FIPS 140-3 Validated Cryptography',
      isolation: 'Cryptographic air-gap'
    },
    pricingTiers: [
      {
        name: 'Enterprise Shield',
        price: '$890',
        period: '/ month',
        description: 'Continuous blast radius monitoring and disaster recovery automation.',
        features: ['Automated AD Recovery', 'Immutable Snapshots', 'Blast Radius Graphing', '24/7 War Room Access'],
        ctaText: 'Activate Console'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'npx ransomware-guard init --enclave=prod-us-east',
      apiEndpoints: ['POST /api/incident/isolate', 'GET /api/incident/blast-radius'],
      sdkSupport: ['TypeScript', 'Python']
    },
    caseStudies: [],
    support: {
      sla: '99.999% Incident Readiness',
      channel: '24/7 Red Alert Hotline & Signal',
      responseHours: '< 5 Minutes'
    }
  },
  {
    id: 'prod_aegis_rmf',
    professionEnclave: 'law_gov_defense',
    name: 'Aegis RMF Continuous ATO Platform',
    tagline: 'Automated NIST SP 800-53 Rev 5 compliance, eMASS artifact sync & continuous authorization',
    category: 'Enterprise Solutions',
    subCategory: 'cATO & Governance',
    icon: '🛡️',
    badge: '🏛️ Live NIST SP 800-53',
    rating: 4.99,
    reviewsCount: 312,
    activeUsersCount: '48 Federal Systems Authorized',
    pricing: {
      displayPrice: '$1,200',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 30
    },
    vendor: {
      name: 'Expedite Consults Defense Advisory',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Aegis RMF transforms months of manual NIST SP 800-53 Rev 5 and DoD RMF compliance paperwork into real-time machine-readable OSCAL and eMASS evidence packages for automated continuous ATO.',
    features: [
      { title: 'Automated 800-53 Rev 5 Controls', desc: 'Maps telemetry directly to AC, AU, IA, SC, and SI control requirements.' },
      { title: 'Direct eMASS & OSCAL Export', desc: 'One-click generation of System Security Plans (SSP) and SAR test evidence.' },
      { title: 'Continuous Assessment', desc: 'Real-time drift detection flags unapproved config alterations before audit cycles.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'https://aegis-rmf.vercel.app',
    liveUrl: 'https://aegis-rmf.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'OSCAL Policy-as-Code Engine',
      summary: 'Deterministic compliance telemetry pipeline parsing cloud infrastructure manifests.',
      layers: ['eMASS REST Gateway', 'NIST SP 800-53 Engine', 'Audit Log Attestation Enclave'],
      latency: 'Continuous real-time compliance score',
      dataPrivacy: 'FedRAMP High & ITAR compliant data sovereignty.'
    },
    integrations: ['AWS GovCloud', 'Azure Government', 'eMASS', 'Jira Service Desk', 'GitLab'],
    security: {
      compliance: ['NIST SP 800-53 Rev 5', 'FedRAMP High', 'CMMC 2.0 Level 3', 'DoD IL5/IL6'],
      encryption: 'FIPS 140-3 Level 2 HSM',
      isolation: 'Dedicated VPC Enclave'
    },
    pricingTiers: [
      {
        name: 'Federal System Pack',
        price: '$1,200',
        period: '/ month',
        description: 'Complete continuous ATO automation for 1 federal system boundary.',
        features: ['Full NIST 800-53 Rev 5 Controls', 'eMASS OSCAL Sync', 'Automated POAM Tracking', 'Continuous Evidence Collector'],
        ctaText: 'Schedule cATO Demo'
      }
    ],
    reviews: [
      {
        author: 'Commander Robert Hayes',
        role: 'Platform IAM & Super Administrator',
        company: 'ConnectIn Master Control',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Aegis reduced our cATO preparation from 9 months to under 3 weeks with automated OSCAL evidence generation.',
        date: 'October 2026'
      }
    ],
    documentation: {
      quickstart: 'npx aegis-rmf audit --boundary=fedramp-high --oscal-out=./ssp.json',
      apiEndpoints: ['POST /api/v1/controls/validate', 'GET /api/v1/emass/package'],
      sdkSupport: ['TypeScript', 'Python', 'Go']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Government SLA',
      channel: 'TS/SCI Cleared Advisory Hotline & Encrypted Chat',
      responseHours: '< 15 Minutes'
    }
  },
  {
    id: 'prod_05_sast',
    professionEnclave: 'tech_software',
    name: '05-SAST Static Application Security Testing',
    tagline: 'Sub-4ms AST static code analysis, real-time vulnerability detection & automated fix PR dispatch',
    category: 'Software',
    subCategory: 'DevSecOps & Code Analysis',
    icon: '🔍',
    badge: '⚡ Live AST Analysis',
    rating: 4.97,
    reviewsCount: 228,
    activeUsersCount: '64,000+ Repos Analyzed',
    pricing: {
      displayPrice: '$199',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite DevSecOps Labs',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Ultra-fast static code security analysis engine for TypeScript, Rust, Go, Python, and Java. Parses Abstract Syntax Trees to catch tainted user input and automatically drafts verified GitHub remediation PRs.',
    features: [
      { title: 'Sub-4ms Incremental AST Parsing', desc: 'Runs seamlessly in CI/CD pipelines without delaying developer pull requests.' },
      { title: 'Automated Fix PR Dispatch', desc: 'Dispatches ready-to-merge GitHub pull requests with passing unit tests to fix identified bugs.' },
      { title: 'Taint Flow Tracking', desc: 'Traces data flow from unauthenticated HTTP inputs straight to database execution sinks.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://05-sast-platform.vercel.app',
    liveUrl: 'https://05-sast-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'WebAssembly AST Parsing Engine',
      summary: 'High-speed Rust WebAssembly core executing in memory without source code persistence.',
      layers: ['GitHub App Webhook', 'Wasm Taint Analyzer', 'Auto-PR Code Transformer'],
      latency: '< 4ms per 1,000 LOC',
      dataPrivacy: 'Source code is parsed in memory and never stored on remote servers.'
    },
    integrations: ['GitHub', 'GitLab', 'Bitbucket', 'VS Code', 'JetBrains'],
    security: {
      compliance: ['SOC 2 Type II', 'OWASP Top 10', 'CWE/SANS Top 25'],
      encryption: 'Ephemeral in-memory execution',
      isolation: 'Zero code retention policy'
    },
    pricingTiers: [
      {
        name: 'Developer Pro',
        price: '$199',
        period: '/ month',
        description: 'Unlimited static scans for up to 20 developer seats and 50 repositories.',
        features: ['50 Repositories', 'Auto-PR Remediation', 'IDE Extension', 'CI/CD Break-Build Gates'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'npx sast-scan --repo=current --auto-pr=true',
      apiEndpoints: ['POST /api/scan/ast', 'GET /api/scan/report'],
      sdkSupport: ['Node.js', 'Python', 'CLI']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Availability',
      channel: 'Discord & GitHub Support',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_06_sca',
    professionEnclave: 'tech_software',
    name: '06-SCA Software Composition Analysis & AI-BOM',
    tagline: 'Dependency vulnerability scanner, AI-BOM supply-chain auditing & license risk scoring',
    category: 'Software',
    subCategory: 'Software Composition Analysis',
    icon: '📦',
    badge: '⚡ Live SBOM Scanner',
    rating: 4.95,
    reviewsCount: 190,
    activeUsersCount: '1.2M Dependencies Tracked',
    pricing: {
      displayPrice: '$179',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite DevSecOps Labs',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Enterprise software composition analysis (SCA) and AI Bill of Materials (AI-BOM) platform. Audits NPM, Cargo, PyPI, and Go dependencies for malicious maintainer takeovers and license conflicts.',
    features: [
      { title: 'AI-BOM & LLM Guardrails', desc: 'Inspects HuggingFace weights, tokenizers, and model dependencies for poisoned checkpoints.' },
      { title: 'Zero-Day Supply Chain Alerts', desc: 'Notifies within seconds of malicious packages published to open-source registries.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://06-sca-platform.vercel.app',
    liveUrl: 'https://06-sca-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'CycloneDX / SPDX Parsing Bus',
      summary: 'High-speed package graph traversal resolving nested dependency trees.',
      layers: ['Registry Ingestion Pipeline', 'CVE Vulnerability Knowledgebase', 'License Engine'],
      latency: '< 500ms full lockfile scan',
      dataPrivacy: 'Lockfiles analyzed in ephemeral memory.'
    },
    integrations: ['npm', 'Cargo', 'pip', 'Maven', 'GitHub Actions'],
    security: {
      compliance: ['Executive Order 14028', 'NIST SP 800-161'],
      encryption: 'TLS 1.3 / AES-256',
      isolation: 'Stateless container'
    },
    pricingTiers: [
      {
        name: 'Team SCA',
        price: '$179',
        period: '/ month',
        description: 'Comprehensive dependency security and license compliance.',
        features: ['Full AI-BOM Generation', 'License Risk Audit', 'Automated Patch PRs', 'Registry Poisoning Alerts'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'npx sca-audit generate-sbom --format=cyclonedx',
      apiEndpoints: ['POST /api/sbom/generate', 'POST /api/sbom/verify'],
      sdkSupport: ['TypeScript', 'CLI']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Dev Support Portal',
      responseHours: '< 2 Hours'
    }
  },
  {
    id: 'prod_10_iac',
    professionEnclave: 'tech_software',
    name: '10-IaC Terraform & Cloud Guard',
    tagline: 'Infrastructure as Code security scanner, drift detector & policy-as-code validator',
    category: 'Software',
    subCategory: 'Infrastructure as Code',
    icon: '☁️',
    badge: '⚡ Live IaC Guard',
    rating: 4.96,
    reviewsCount: 165,
    activeUsersCount: '320k Cloud Resources Guarded',
    pricing: {
      displayPrice: '$249',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Cloud Security',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Pre-deployment Infrastructure as Code (IaC) verification engine for Terraform, OpenTofu, Pulumi, and CloudFormation. Catches publicly exposed S3 buckets, open security groups, and unencrypted EBS volumes.',
    features: [
      { title: 'Static Terraform Analysis', desc: 'Validates HCL2 AST against CIS Benchmarks, NIST SP 800-53, and custom OPA Rego policies.' },
      { title: 'Real-Time Drift Detection', desc: 'Compares live AWS/Azure state against Git master branch commits.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://10-iac-security-platform.vercel.app',
    liveUrl: 'https://10-iac-security-platform.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Open Policy Agent (OPA) Evaluation',
      summary: 'Rego policy evaluation engine integrated into Git commit hooks.',
      layers: ['HCL2 Parser', 'OPA Policy Engine', 'Cloud Provider State Diff'],
      latency: '< 80ms per plan evaluation',
      dataPrivacy: 'Manifests analyzed locally or in dedicated tenant VPC.'
    },
    integrations: ['Terraform Cloud', 'Spacelift', 'Atlantis', 'GitHub Actions'],
    security: {
      compliance: ['CIS Cloud Benchmarks', 'NIST SP 800-53', 'PCI DSS 4.0'],
      encryption: 'AES-256 GCM',
      isolation: 'Dedicated policy runner'
    },
    pricingTiers: [
      {
        name: 'Cloud Guard',
        price: '$249',
        period: '/ month',
        description: 'Unlimited Terraform plans evaluation and automated drift alerts.',
        features: ['Unlimited Plan Reviews', 'Pre-Commit Hooks', 'CIS Benchmark Audit', 'Slack Notifications'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'npx iac-guard check ./terraform --policy=cis-aws',
      apiEndpoints: ['POST /api/iac/evaluate', 'GET /api/iac/policies'],
      sdkSupport: ['CLI', 'Node.js']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Cloud Security Slack',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_careerorbit',
    professionEnclave: 'tech_software',
    name: 'CareerOrbit AI Career Navigator & Skill Passport',
    tagline: 'AI-guided career trajectory, cryptographic skill passport & job role competency matrix',
    category: 'Training',
    subCategory: 'Career Navigation & Skill Passports',
    launchpadCategory: 'career',
    isLaunchpadDeployed: true,
    icon: '🪐',
    badge: '⚡ Live Career Passport',
    rating: 4.98,
    reviewsCount: 420,
    activeUsersCount: '28,000+ Career Passports',
    pricing: {
      displayPrice: '$49',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'CareerOrbit Labs',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Next-generation AI career roadmap and portable skill passport. Evaluates GitHub code proofs, verified certifications, and technical milestones to recommend hyper-targeted promotion tracks and salaries.',
    features: [
      { title: 'Cryptographic Skill Proofs', desc: 'Verifies real code submissions, pull requests, and architecture reviews as immutable credentials.' },
      { title: 'Salary Intelligence & Benchmarking', desc: 'Accurate real-time compensation data cross-referenced against equity, clearance, and skill sets.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://careerorbit-standalone.vercel.app',
    liveUrl: 'https://careerorbit-standalone.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Competency Graph Vector DB',
      summary: 'Embeds job requisitions and candidate code artifacts into high-dimensional vector space.',
      layers: ['Profile Vectorizer', 'Career Trajectory Predictor', 'Salary Benchmark Engine'],
      latency: '< 10ms match resolution',
      dataPrivacy: 'Candidate identity anonymized until formal employer introduction.'
    },
    integrations: ['LinkedIn', 'GitHub', 'ConnectIn Identity', 'Greenhouse', 'Lever'],
    security: {
      compliance: ['SOC 2 Type II', 'GDPR Compliant'],
      encryption: 'Ed25519 Cryptographic Signatures',
      isolation: 'Zero-knowledge candidate encryption'
    },
    pricingTiers: [
      {
        name: 'Pro Career Passport',
        price: '$49',
        period: '/ month',
        description: 'Full AI skill roadmap, salary benchmark calculator, and employer discovery.',
        features: ['Verified Skill Passport', 'Salary Benchmark Engine', '1-Click Warm Introductions', 'Weekly Requisition Matching'],
        ctaText: 'Claim Your Passport'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Sign in at https://careerorbit-standalone.vercel.app to sync your GitHub repositories.',
      apiEndpoints: ['GET /api/passport/:id', 'POST /api/skills/verify'],
      sdkSupport: ['Web', 'API']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Member Helpdesk',
      responseHours: '< 4 Hours'
    }
  },
  {
    id: 'prod_skillhands',
    professionEnclave: 'trades_construction',
    name: 'SkillHands Vocational Trade Hub',
    tagline: 'Hands-on trade task platform, verified craftsman matching & vocational apprenticeships',
    category: 'Services',
    subCategory: 'Trades & Vocational Network',
    launchpadCategory: 'trades',
    isLaunchpadDeployed: true,
    icon: '🛠️',
    badge: '🔨 Live Trade Hub',
    rating: 4.97,
    reviewsCount: 380,
    activeUsersCount: '12,500+ Verified Craftsmen',
    pricing: {
      displayPrice: '$79',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'SkillHands Vocational Guild',
      logo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'SkillHands is the dedicated marketplace connecting verified carpenters, electricians, plumbers, masons, and mechanics with high-value residential and commercial contracts.',
    features: [
      { title: 'Verified Trade Credentials', desc: 'Validates state licensing, OSHA cards, insurance certificates, and photographic proof of prior builds.' },
      { title: 'Direct Subcontractor Matching', desc: 'General contractors post commercial bid packages and book specialized craft crews directly.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://skillhands-client.vercel.app',
    liveUrl: 'https://skillhands-client.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Real-Time Job Dispatch Bus',
      summary: 'Geolocation-based matching engine pairing certified tradesmen with local project specifications.',
      layers: ['Craftsman Mobile Client', 'Contractor Dispatch Engine', 'Escrow Payment Pipeline'],
      latency: 'Instant contractor bidding',
      dataPrivacy: 'Encrypted trade credentials.'
    },
    integrations: ['Procore', 'QuickBooks', 'Buildertrend', 'Stripe Connect'],
    security: {
      compliance: ['OSHA Compliant', 'State Licensing Boards Verified'],
      encryption: 'AES-256',
      isolation: 'Secure Escrow Accounts'
    },
    pricingTiers: [
      {
        name: 'Master Craftsman Listing',
        price: '$79',
        period: '/ month',
        description: 'Unlimited bid submissions, featured artisan directory placement, and instant milestone escrow.',
        features: ['Unlimited Bid Submissions', 'Verified Guild Badge', 'Lien Waiver Automation', 'Fast-Pay Escrow Draws'],
        ctaText: 'Join Trade Hub'
      }
    ],
    reviews: [
      {
        author: 'David Miller',
        role: 'Master Timber Carpenter',
        company: 'Heritage Guild',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'SkillHands brought our timber framing crew two $300k+ custom home contracts within our first month.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'Register your license and submit three photographic portfolio builds to unlock verified status.',
      apiEndpoints: ['POST /api/bids/create', 'GET /api/contractors/:id'],
      sdkSupport: ['Web', 'Mobile App']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Trade Dispatch Helpline & SMS',
      responseHours: '< 15 Minutes'
    }
  },
  {
    id: 'prod_desknote',
    professionEnclave: 'trades_construction',
    name: 'DeskNote Digital Field Notebook & Jobsite Logs',
    tagline: 'Jobsite cut-lists, structural takeoff notes, daily foreman logs & diagnostic records',
    category: 'Software',
    subCategory: 'Productivity & Field Notes',
    launchpadCategory: 'trades',
    isLaunchpadDeployed: true,
    icon: '📓',
    badge: '📝 Live Field App',
    rating: 4.95,
    reviewsCount: 260,
    activeUsersCount: '18,000+ Field Notes Recorded',
    pricing: {
      displayPrice: '$29',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'DeskNote Field Systems',
      logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Ruggedized, offline-first digital field notebook built for trade superintendents, framing foremen, and field diagnostic technicians. Captures punch-lists, audio memos, board-foot cut tables, and weather logs.',
    features: [
      { title: 'Offline-First Sync', desc: 'Works with zero cellular reception in deep basements and rural jobsites; automatically syncs on reconnect.' },
      { title: 'Voice-to-Cut-List', desc: 'Dictate lumber dimensions or automotive DTC codes; DeskNote parses them into structured spreadsheets.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://desk-note-kwesi-asiedus-projects.vercel.app',
    liveUrl: 'https://desk-note-kwesi-asiedus-projects.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Local-First CRDT Storage',
      summary: 'Conflict-free replicated data types (CRDT) storing notes in IndexedDB with cloud synchronization.',
      layers: ['Progressive Web App (PWA)', 'IndexedDB Offline Cache', 'WebSocket Live Sync'],
      latency: '< 1ms local keystroke latency',
      dataPrivacy: 'End-to-end encrypted notes.'
    },
    integrations: ['Google Drive', 'Dropbox', 'PlanGrid', 'Procore'],
    security: {
      compliance: ['SOC 2 Type II'],
      encryption: 'AES-256 On-Device Encryption',
      isolation: 'Local SQLite Sandbox'
    },
    pricingTiers: [
      {
        name: 'Foreman Pro',
        price: '$29',
        period: '/ month',
        description: 'Unlimited offline notes, voice transcription, and PDF export.',
        features: ['Offline-First Sync', 'Unlimited Audio Notes', 'PDF Takeoff Export', 'Team Collaboration'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Launch https://desk-note-kwesi-asiedus-projects.vercel.app on your tablet or smartphone.',
      apiEndpoints: ['GET /api/notes', 'POST /api/notes/sync'],
      sdkSupport: ['PWA', 'REST']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Email & WhatsApp Field Desk',
      responseHours: '< 2 Hours'
    }
  },
  {
    id: 'prod_vibetok',
    professionEnclave: 'trades_construction',
    name: 'VibeTok Interactive Learning & Video Masterclasses',
    tagline: 'Bite-sized video masterclasses, practical trade demonstrations & interactive lessons',
    category: 'Training',
    subCategory: 'Video Masterclasses & Tutorials',
    launchpadCategory: 'campus',
    isLaunchpadDeployed: true,
    icon: '🎥',
    badge: '🎓 Live Learning Hub',
    rating: 4.99,
    reviewsCount: 840,
    activeUsersCount: '45,000+ Students & Apprentices',
    pricing: {
      displayPrice: '$39',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'VibeTok Education Network',
      logo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'High-engagement micro-learning platform delivering 60-second to 5-minute video tutorials from verified master craftsmen, doctors, and security researchers. Includes interactive comprehension quizzes and code/cut sandboxes.',
    features: [
      { title: 'Interactive Video Sandboxes', desc: 'Code editors, miter angle calculators, and ECG waveforms rendered directly below tutorial videos.' },
      { title: 'Verified Creator Guilds', desc: 'Every instructor is verified for authentic industry experience (Master Joiner, Attending MD, OSCP).' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://vibetok-learning-hub.vercel.app',
    liveUrl: 'https://vibetok-learning-hub.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Global HLS Video CDN',
      summary: 'Adaptive bitrate video streaming optimized for mobile and jobsite field conditions.',
      layers: ['Cloudflare Stream CDN', 'Next.js Interactive Layer', 'Supabase Progress Tracking'],
      latency: '< 100ms video start time',
      dataPrivacy: 'Strict privacy controls.'
    },
    integrations: ['ConnectIn Profile', 'CareerOrbit', 'Google Classroom'],
    security: {
      compliance: ['FERPA Compliant', 'SOC 2 Type II'],
      encryption: 'DRM / TLS 1.3',
      isolation: 'Encrypted user metrics'
    },
    pricingTiers: [
      {
        name: 'All-Access Learning Pass',
        price: '$39',
        period: '/ month',
        description: 'Unlimited access to all 500+ masterclass video tracks and interactive sandboxes.',
        features: ['500+ Video Lessons', 'Interactive Quizzes', 'Certificate of Completion', 'Direct Q&A with Master Instructors'],
        ctaText: 'Start Learning'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Access masterclasses at https://vibetok-learning-hub.vercel.app',
      apiEndpoints: ['GET /api/courses', 'POST /api/progress/sync'],
      sdkSupport: ['Web', 'iOS', 'Android']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Discord Community & In-App Chat',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_bazaar',
    professionEnclave: 'trades_construction',
    name: 'Bazaar Industrial Tooling & Commerce Platform',
    tagline: 'Decentralized trade machinery marketplace, heavy timber tools & industrial equipment',
    category: 'Enterprise Solutions',
    subCategory: 'Trade Machinery & Commerce',
    launchpadCategory: 'marketplace',
    isLaunchpadDeployed: true,
    icon: '🛍️',
    badge: '📦 Live B2B Commerce',
    rating: 4.94,
    reviewsCount: 155,
    activeUsersCount: '$4.2M Tooling Transacted',
    pricing: {
      displayPrice: '$120',
      billingPeriod: '/ month',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Bazaar Trade Network',
      logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Specialized commercial equipment exchange for contractors, machine shops, and fabrication facilities. Purchase or lease high-end CNC routers, total stations, heavy excavators, and commercial framing tools with verified escrow.',
    features: [
      { title: 'Verified Tooling Escrow', desc: 'Buyer inspection window guarantees equipment condition before funds release to seller.' },
      { title: 'Freight & Rigging Logistics', desc: 'Integrated heavy-freight shipping quotes and jobsite crane drop-off scheduling.' }
    ],
    screenshots: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'],
    demoUrl: 'https://bazaar-standalone.vercel.app',
    liveUrl: 'https://bazaar-standalone.vercel.app',
    isVercelLive: true,
    architecture: {
      title: 'Decentralized Escrow Ledger',
      summary: 'Milestone escrow protocol ensuring zero-fraud transactions for industrial assets.',
      layers: ['B2B Product Catalog', 'Milestone Escrow Smart Contracts', 'Freight Dispatch API'],
      latency: 'Real-time inventory lookup',
      dataPrivacy: 'Enterprise financial privacy.'
    },
    integrations: ['Stripe Treasury', 'FreightQuote', 'QuickBooks Enterprise'],
    security: {
      compliance: ['FinCEN Compliant', 'SOC 2 Type II'],
      encryption: 'AES-256 GCM',
      isolation: 'Segregated Escrow Accounts'
    },
    pricingTiers: [
      {
        name: 'Equipment Dealer Listing',
        price: '$120',
        period: '/ month',
        description: 'Unlimited heavy machinery and tool listings with verified seller badge.',
        features: ['Unlimited Equipment Listings', 'Verified Escrow Checkout', 'Freight Logistics Automation', 'Priority Placement'],
        ctaText: 'List Your Equipment'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Explore industrial equipment at https://bazaar-standalone.vercel.app',
      apiEndpoints: ['GET /api/inventory', 'POST /api/escrow/order'],
      sdkSupport: ['REST', 'Web']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Equipment Escrow Hotline',
      responseHours: '< 30 Minutes'
    }
  },
  {
    id: 'serv_fractional_ciso',
    name: 'Fractional CISO & Zero Trust Transformation',
    tagline: 'Executive Cyber Leadership, Zero-Trust Roadmaps & Regulatory Defense',
    category: 'Services',
    subCategory: 'Consulting',
    icon: '👔',
    badge: '⭐ Premier Advisory',
    rating: 5.0,
    reviewsCount: 48,
    pricing: {
      displayPrice: '$350',
      billingPeriod: '/ hr (or $5,000 retainer)',
      hasFreeTrial: false
    },
    vendor: {
      name: 'Alex Taylor (Expedite Senior Fellow)',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Retain a verified Principal Security Architect and former Fortune 500 CISO to lead your executive security strategy, prepare for Series B/C cyber due diligence, and eliminate perimeter VPNs.',
    features: [
      { title: 'Zero Trust Multi-Cloud Architecture Review', desc: 'Comprehensive micro-segmentation blueprint across AWS, GCP, and Kubernetes.' },
      { title: 'SOC 2 Type II & FedRAMP Readiness', desc: 'End-to-end policy, evidence mapping, and auditor defense sessions.' },
      { title: 'Board Cyber Deck & Investor Briefings', desc: 'Quarterly executive board slides translating technical telemetry into business risk.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Zero Trust Governance Framework',
      summary: 'Architectural blueprints following NIST SP 800-207 and DoD Zero Trust Reference Architecture.',
      layers: ['Identity (Okta / Entra)', 'Edge Micro-segmentation (Cloudflare / Zscaler)', 'eBPF Workload Telemetry'],
      latency: 'Advisory Cadence: Weekly Sprint Alignment',
      dataPrivacy: 'Strict NDA & Attorney-Client Privilege Protection Available'
    },
    integrations: ['AWS', 'GCP', 'Okta', 'Jira', 'Notion', 'Google Workspace'],
    security: {
      compliance: ['CISSP Certified', 'CCSP Certified', 'FedRAMP 3PAO Lead'],
      encryption: 'Encrypted Enclave Delivery',
      isolation: 'Dedicated Consulting Workspace'
    },
    pricingTiers: [
      {
        name: 'Advisory Retainer',
        price: '$5,000',
        period: '/ month',
        description: '15 Hours of monthly executive leadership, weekly syncs, and architecture reviews.',
        features: ['Weekly 1:1 Executive Sync', 'Architecture Review of up to 4 Systems', 'Quarterly Board Deck Preparation', 'Slack Hotline Access'],
        recommended: true,
        ctaText: 'Book Advisory Retainer'
      },
      {
        name: 'Hourly Deep-Dive',
        price: '$350',
        period: '/ hour',
        description: 'Targeted architectural consultation for specific cloud migrations or audit fire drills.',
        features: ['1-on-1 Deep-Dive Session', 'Written Architectural Decision Record', 'Vulnerability Assessment Review'],
        ctaText: 'Book Consultation Hour'
      }
    ],
    reviews: [
      {
        author: 'Victoria Hastings',
        role: 'CTO',
        company: 'Horizon FinTech Systems',
        avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Alex navigated our SOC 2 Type II audit in under 60 days with zero non-conformances. Highly recommended.',
        date: 'June 2026'
      }
    ],
    documentation: {
      quickstart: 'Schedule initial 30-min discovery call via ConnectIn Calendar.',
      apiEndpoints: ['N/A (Human Executive Service)'],
      sdkSupport: ['Direct Slack / Google Meet']
    },
    caseStudies: [
      {
        customer: 'CyberNova Infrastructure',
        logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        headline: 'Migrated 12,000 corporate seats to Zero Trust in 4 months',
        results: ['Eliminated legacy VPN costs by $420k/yr', 'Zero credential stuffing breaches']
      }
    ],
    support: {
      sla: 'Same-day response for retained clients',
      channel: 'Direct WhatsApp / Slack Hotline',
      responseHours: '< 2 Hours'
    }
  },
  {
    id: 'train_zerotrust_masterclass',
    name: 'Zero Trust & Cloud Defense Masterclass',
    tagline: 'Hands-on Weaponized Lab Certification for Senior Architects & Engineers',
    category: 'Training',
    subCategory: 'Certifications',
    icon: '🎓',
    badge: '🏆 Verified Certificate',
    rating: 4.97,
    reviewsCount: 312,
    activeUsersCount: '4,200+ Enrolled Engineers',
    pricing: {
      displayPrice: '$199',
      billingPeriod: 'one-time (Lifetime Access)',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'ConnectIn Academy & O\'Reilly Partner',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Comprehensive hands-on training with 12 interactive cloud sandbox labs, eBPF telemetry engineering, and NIST 800-207 Zero Trust architectural blueprints.',
    features: [
      { title: '12 Live Interactive Sandbox Terminals', desc: 'Practice real exploit attacks and mitigation directly in your browser.' },
      { title: 'Verifiable ConnectIn Credential Badge', desc: 'Automatically embeds into your ConnectIn profile and signals to recruiters.' },
      { title: 'Production Terraform & Kubernetes Blueprints', desc: 'Downloadable open-source modules ready to deploy into enterprise environments.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Browser-Based WebAssembly Terminals',
      summary: 'Instant microVM spinning up in < 2 seconds with live attack generation.',
      layers: ['Next.js Video Player', 'Xterm.js Web Terminal', 'Docker Cloud Enclave'],
      latency: '< 10ms browser interaction',
      dataPrivacy: 'Individual sandbox isolation'
    },
    integrations: ['GitHub Classroom', 'ConnectIn Profile Badge Sync', 'LinkedIn Credential URL'],
    security: {
      compliance: ['NIST 800-207 Aligned', 'DoD Zero Trust Pillars Aligned'],
      encryption: 'TLS 1.3 Streaming',
      isolation: 'Student Sandbox Enclave'
    },
    pricingTiers: [
      {
        name: 'Individual Masterclass',
        price: '$199',
        period: 'one-time',
        description: 'Lifetime access to all 12 modules, interactive labs, and verified certificate.',
        features: ['12 High-Definition Video Modules', '12 Interactive Sandbox Labs', 'Verifiable Profile Credential', 'Community Discord Access'],
        recommended: true,
        ctaText: 'Enroll Now ($199)'
      },
      {
        name: 'Enterprise Team Pass',
        price: '$1,499',
        period: 'up to 10 seats',
        description: 'Upskill your entire engineering squad with team progress dashboards and instructor Q&A.',
        features: ['10 Student Licenses', 'Manager Progress Dashboard', 'Monthly Live Instructor Office Hours', 'Custom Enterprise Labs'],
        ctaText: 'Get Team Pass'
      }
    ],
    reviews: [
      {
        author: 'Kavita Patel',
        role: 'Director of Cloud Governance',
        company: 'CyberNova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'The best Zero Trust masterclass available. The hands-on eBPF labs gave me the exact skills needed to lead our company-wide migration.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'Instant access after enrollment. No software install required.',
      apiEndpoints: ['GET /api/academy/progress', 'POST /api/academy/sandbox/start'],
      sdkSupport: ['Browser (Any OS)']
    },
    caseStudies: [
      {
        customer: 'Atlassian Cyber Labs',
        logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80',
        headline: 'Upskilled 40+ staff architects across 3 continents',
        results: ['100% passing rate on Zero Trust architecture assessments', 'Immediate application to cloud products']
      }
    ],
    support: {
      sla: 'Instructor Q&A in community forums',
      channel: 'Academy Student Discord & Help Desk',
      responseHours: '< 6 Hours'
    }
  },
  {
    id: 'veritaslens_enterprise',
    name: 'VeritasLens Media Intelligence & Bias Radar',
    tagline: 'Clustered Media Bias, Blindspot Intelligence & Statutory Fact Verification',
    category: 'Enterprise Solutions',
    subCategory: 'SaaS',
    launchpadCategory: 'ai',
    isLaunchpadDeployed: true,
    icon: '🔍',
    badge: '🌐 Global Newsroom Suite',
    rating: 4.96,
    reviewsCount: 189,
    activeUsersCount: '14 Newsrooms & 52k Readers',
    pricing: {
      displayPrice: '$149',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Information Lab',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Real-time clustering across 14 newsrooms, blindspot detection, statutory fact verification, and LLM-powered narrative discrepancy scoring.',
    features: [
      { title: '14-Newsroom Real-Time Clustering', desc: 'Aggregates Reuters, AP, WSJ, BBC, and independent publishers with automatic duplicate event clustering.' },
      { title: 'Blindspot Radar Matrix', desc: 'Pinpoints critical stories covered exclusively by left-leaning or right-leaning outlets.' },
      { title: 'Statutory Claim Verifier', desc: 'Cross-checks politician and executive quotes against official regulatory and legal records.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: '/veritaslens',
    liveUrl: '/veritaslens',
    architecture: {
      title: 'Semantic Vector Clustering Pipeline',
      summary: 'Processes 40,000+ articles daily using cosine similarity clustering and automated bias extraction.',
      layers: ['Next.js 16 Interface', 'Vector Similarity Microservice', 'PostgreSQL TimescaleDB'],
      latency: '< 400ms cluster latency',
      dataPrivacy: 'Public newsroom syndication with RSS & API connectors'
    },
    integrations: ['Slack', 'Reuters API', 'Bloomberg Terminal', 'Notion', 'Zapier'],
    security: {
      compliance: ['Statutory Fact Checking Standards', 'GDPR Compliant'],
      encryption: 'TLS 1.3 Transport',
      isolation: 'Multi-Tenant Cloud'
    },
    pricingTiers: [
      {
        name: 'Professional Newsroom',
        price: '$149',
        period: '/ month',
        description: 'Full access to bias clustering, blindspot radar, and statutory claim search.',
        features: ['14 Newsrooms Clustered', 'Blindspot Matrix Alerts', 'Statutory Fact Checker', 'Daily AI Executive Briefing'],
        recommended: true,
        ctaText: 'Start 14-Day Trial'
      },
      {
        name: 'Enterprise Media Syndication',
        price: '$650',
        period: '/ month',
        description: 'Direct API feeds, custom newsroom scrapers, and white-label widget embedding.',
        features: ['Full REST API Access', 'Custom Feed Ingestion', 'White-Label Embeds', 'Unlimited Team Seats'],
        ctaText: 'Activate API Access'
      }
    ],
    reviews: [
      {
        author: 'Sarah Lin',
        role: 'Senior Investigative Editor',
        company: 'Global Policy Review',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'VeritasLens has become indispensable for our morning editorial meetings. The blindspot radar instantly exposes stories our competitors are missing.',
        date: 'August 2026'
      }
    ],
    documentation: {
      quickstart: 'curl -H "Authorization: Bearer $VL_KEY" https://expedite-consults.vercel.app/api/veritaslens',
      apiEndpoints: ['GET /api/veritaslens/clusters', 'POST /api/veritaslens/verify'],
      sdkSupport: ['REST', 'Python', 'Node.js']
    },
    caseStudies: [
      {
        customer: 'Atlantic Intelligence Consortium',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated Daily Geopolitical Bias Tracking Across 8 Nations',
        results: ['Real-time discrepancy alerts', '85% faster statutory quote verification']
      }
    ],
    support: {
      sla: '99.9% API Uptime',
      channel: 'Developer Support Portal & Dedicated Email',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'expedite_fusion',
    name: 'Expedite Strike & Fusion 2026',
    tagline: 'Autonomous Pentest, ASPM & Hybrid AI Offensive Security Suite',
    category: 'Software',
    subCategory: 'Cybersecurity',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    livePort: 9012,
    icon: '⚡',
    badge: '⚡ PORT 9012 · ASPM Flagship',
    rating: 4.99,
    reviewsCount: 284,
    activeUsersCount: '22,400+ Repos Secured',
    pricing: {
      displayPrice: '$499',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Consults Enterprise',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Enterprise offensive security suite with hybrid scanning, AI-BOM LLM scanner, Checkmarx MCP server, Triage auto-PR assist, XM Cyber choke point graphs, and 10-section board PDF dossiers.',
    features: [
      { title: 'Autonomous Multi-Target Discovery', desc: 'Instant discovery across AWS, GCP, Azure, and on-prem IP ranges.' },
      { title: 'AI-BOM & LLM Tool Security', desc: 'Inspects third-party AI agents and tool bindings for prompt injections and data leaks.' },
      { title: 'Checkmarx MCP Server', desc: 'Syncs findings directly to Anthropic Claude & Gemini agent developer workflows.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    demoUrl: 'http://localhost:9012/',
    liveUrl: 'http://localhost:9012',
    architecture: {
      title: 'Hybrid Offensive Orchestrator',
      summary: 'Connects DAST, SAST, and real-time eBPF sensors into a unified event bus with automated PR mitigation.',
      layers: ['Cloud Dashboard', 'MCP Tool Bus', 'Neo4j Graph Core', 'eBPF Sensor Agents'],
      latency: '< 15ms stream latency',
      dataPrivacy: 'Enterprise tenant VPC boundary isolation'
    },
    integrations: ['AWS Security Hub', 'Checkmarx MCP', 'Slack', 'Jira', 'Splunk', 'Datadog'],
    security: {
      compliance: ['SOC 2 Type II', 'FedRAMP High Ready', 'NIST SP 800-53'],
      encryption: 'FIPS 140-3 Cryptographic Core',
      isolation: 'Sovereign Tenant Enclaves'
    },
    pricingTiers: [
      {
        name: 'Enterprise Cloud',
        price: '$499',
        period: '/ month',
        description: 'Full hybrid offensive scanning, AI-BOM guardrails, and Auto-PR assist.',
        features: ['50 Cloud Repositories', 'AI-BOM Scanner', 'Checkmarx MCP Server', '14-Day Free Trial'],
        recommended: true,
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Defense Enclave',
        price: '$2,400',
        period: '/ month',
        description: 'Unlimited repositories, on-prem hardware enclaves, and 24/7 Red Team escalation.',
        features: ['Unlimited Targets', 'Air-Gapped Sovereign Deployment', 'Continuous ATO Pack', 'Dedicated Cyber Architect'],
        ctaText: 'Deploy Defense Enclave'
      }
    ],
    reviews: [
      {
        author: 'Dr. Liam O’Connor',
        role: 'Head of Quantum Cryptography',
        company: 'DARPA Partner Group',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Expedite Strike & Fusion replaced 4 separate scanning vendors and gave our leadership instant board dossiers.',
        date: 'July 2026'
      }
    ],
    documentation: {
      quickstart: 'npm install @expedite/strike-fusion && npx expedite auth',
      apiEndpoints: ['POST /api/v1/strike/scan', 'GET /api/v1/fusion/dossier'],
      sdkSupport: ['Node.js', 'Python', 'Go', 'Rust']
    },
    caseStudies: [
      {
        customer: 'Apex Defense Labs',
        logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        headline: 'Automated 100% of Continuous Pentesting Across 85 Microservices',
        results: ['Zero breached credentials', '94% automated PR remediation']
      }
    ],
    support: {
      sla: '99.99% Availability Guarantee',
      channel: 'Dedicated Slack Connect & Encrypted Ticket Terminal',
      responseHours: '< 15 Minutes'
    }
  },
  {
    id: 'prod_aegis_soc_pentest',
    name: 'ÆGIS · SOC Autonomous PenTest',
    tagline: 'Autonomous Agentic AI Penetration Testing & Weaponized Exploit Hub',
    category: 'Software',
    subCategory: 'Autonomous Red Teaming',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    livePort: 9011,
    liveUrl: 'http://localhost:9011/app/?standalone=1',
    demoUrl: 'http://localhost:9011/app/?standalone=1',
    icon: '🎯',
    badge: '🎯 PORT 9011 · SOC Red Team',
    rating: 4.98,
    reviewsCount: 210,
    activeUsersCount: '1,450+ Automated Campaigns',
    pricing: {
      displayPrice: '$850',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'ÆGIS Autonomous Security Labs',
      logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Full-featured SOC Autonomous PenTest console featuring multi-target asset discovery, weaponized auto-exploit queue, PoC interactive evidence terminal, and Neo4j blast radius attack graphs.',
    features: [
      { title: 'Autonomous Multi-Target Discovery', desc: 'Scan and fingerprint enterprise domains, subnets, and Kubernetes clusters in parallel.' },
      { title: 'Interactive PoC Terminal', desc: 'Execute and observe sandboxed exploits with live terminal feedback and replayable traces.' },
      { title: 'Neo4j Blast Radius Graphs', desc: 'Map transitive domain compromises and active directory privilege escalation paths.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Decentralized Exploit Dispatcher',
      summary: 'Isolated Docker execution runners controlled via gRPC worker pool with live output streaming.',
      layers: ['Next.js Tactical UI', 'gRPC Exploit Orchestrator', 'Neo4j Attack Graph', 'Isolated MicroVM Sandbox'],
      latency: '< 12ms command execution',
      dataPrivacy: 'Target payloads encrypted in isolated memory buffers.'
    },
    integrations: ['Metasploit RPC', 'Nuclei Fleet', 'Burp Suite Pro', 'Nmap Scripting Engine'],
    security: {
      compliance: ['SOC 2 Type II', 'NIST SP 800-115', 'DoD 8570'],
      encryption: 'mTLS 1.3 / AES-256 GCM',
      isolation: 'Ephemeral execution sandboxes'
    },
    pricingTiers: [
      {
        name: 'SOC Team License',
        price: '$850',
        period: '/ month',
        description: 'Autonomous Red Team campaigns with up to 5 concurrent target ranges.',
        features: ['5 Concurrent Ranges', 'Full PoC Terminal', 'Neo4j Attack Graphs', 'Continuous Target Discovery'],
        recommended: true,
        ctaText: 'Start 7-Day Trial'
      }
    ],
    reviews: [
      {
        author: 'Julian Cross',
        role: 'Lead Penetration Tester',
        company: 'Vanguard Cyber Defense',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'ÆGIS SOC cuts discovery and weaponized proof generation from days to under 45 minutes.',
        date: 'September 2026'
      }
    ],
    documentation: {
      quickstart: 'Launch standalone at http://localhost:9011/app/?standalone=1 or connect via REST API.',
      apiEndpoints: ['POST /api/v1/targets/discover', 'POST /api/v1/exploit/queue'],
      sdkSupport: ['Python', 'Node.js', 'Go']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime SLA',
      channel: 'Dedicated SOC Red Team Channel',
      responseHours: '< 30 Minutes'
    }
  },
  {
    id: 'prod_strike_console_9020',
    name: 'Expedite Strike Console (Port 9020)',
    tagline: 'Autonomous 5-Stage Attack Pipeline & Multi-Scanner Execution Engine',
    category: 'Software',
    subCategory: 'Attack Orchestration',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    livePort: 9020,
    liveUrl: 'http://localhost:9020',
    demoUrl: 'http://localhost:9020',
    icon: '⚡',
    badge: '⚡ PORT 9020 · 5-Stage Pipeline',
    rating: 4.97,
    reviewsCount: 176,
    activeUsersCount: '3,800+ Targets Enumerated',
    pricing: {
      displayPrice: '$650',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Offensive Red Team',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Autonomous offensive security testing workstation chaining Assessment → Enumeration → Exploitation → Post-Ex → Reporting, with concurrent multi-scanner execution (Nmap, Nuclei, ZAP, AegisProbe, Burp, SCAP).',
    features: [
      { title: 'Autonomous 5-Stage Attack Chaining', desc: 'Seamlessly pipes port scan findings into exploit engines and post-exploitation reporting.' },
      { title: 'Concurrent Multi-Scanner Execution', desc: 'Runs Nmap, Nuclei, ZAP, and AegisProbe in parallel with unified deduplication.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Stage Chaining DAG Pipeline',
      summary: 'Directed Acyclic Graph orchestrator dispatching scanners and correlating findings into structured dossiers.',
      layers: ['Web Console', 'Pipeline Orchestrator', 'Unified Vulnerability DB'],
      latency: '< 10ms pipeline dispatch',
      dataPrivacy: 'Target credentials zero-retention.'
    },
    integrations: ['Nmap', 'Nuclei', 'ZAP', 'Burp Suite', 'AegisProbe'],
    security: {
      compliance: ['FedRAMP High Ready', 'NIST SP 800-115'],
      encryption: 'AES-256 GCM',
      isolation: 'Ephemeral container isolation'
    },
    pricingTiers: [
      {
        name: 'Strike Workstation',
        price: '$650',
        period: '/ month',
        description: 'Complete 5-stage attack pipeline with unlimited scans.',
        features: ['5-Stage Chained Pipeline', 'Multi-Scanner Deduplication', 'Executive PDF Dossiers', 'Local Port 9020 Web Console'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Access http://localhost:9020 to begin assessment pipeline.',
      apiEndpoints: ['POST /api/pipeline/start', 'GET /api/pipeline/status'],
      sdkSupport: ['REST', 'CLI']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Red Team Portal',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_axiom_cloud_paths',
    name: 'AXIOM Cloud Security (Product 4)',
    tagline: 'Multi-Cloud Attack Path Analysis, IAM Privesc & Authorized PenTest Engine',
    category: 'Software',
    subCategory: 'Cloud Security & IAM',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    liveUrl: 'https://19-cloud-security-platform.vercel.app',
    demoUrl: 'https://19-cloud-security-platform.vercel.app/attack-paths',
    isVercelLive: true,
    icon: '☁️',
    badge: '☁️ Vercel Live · Multi-Cloud Paths',
    rating: 4.98,
    reviewsCount: 342,
    activeUsersCount: '48,000+ Cloud Resources',
    pricing: {
      displayPrice: '$599',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Cloud Defense Labs',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Enterprise multi-cloud security assessment, IAM privilege escalation graphing, and authorized penetration testing across AWS, Azure, GCP, and Kubernetes clusters with automated remediation.',
    features: [
      { title: 'Chained Exploit Paths', desc: 'Identifies lateral movement across AWS STS, Azure RBAC roles, and GCP service accounts.' },
      { title: '28+ Cloud IAM Privesc Vectors', desc: 'Detects PassRole, AssumeRole, and actAs escalation vulnerabilities before attackers exploit them.' },
      { title: 'Multi-Cloud CSPM Engine', desc: 'Real-time compliance checks against CIS AWS/Azure/GCP v3.0, NIST 800-53, and ISO 27001.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Multi-Cloud Graph Evaluator',
      summary: 'High-throughput cloud asset ingestion evaluating graph paths across 10,000s of cloud IAM nodes in real time.',
      layers: ['Next.js Cloud Portal', 'IAM Privesc Graph Engine', 'Cloud Provider API Connectors'],
      latency: '< 25ms graph traversal',
      dataPrivacy: 'Read-only least-privilege cloud IAM audit roles.'
    },
    integrations: ['AWS Organizations', 'Azure Tenant Graph', 'Google Cloud Resource Manager', 'Kubernetes RBAC'],
    security: {
      compliance: ['CIS Cloud Benchmarks v3.0', 'SOC 2 Type II', 'FedRAMP High'],
      encryption: 'AWS KMS / TLS 1.3',
      isolation: 'Zero-knowledge cross-tenant isolation'
    },
    pricingTiers: [
      {
        name: 'Multi-Cloud Professional',
        price: '$599',
        period: '/ month',
        description: 'Complete cloud security and attack path analysis for up to 50 cloud accounts.',
        features: ['50 Cloud Accounts', 'IAM Privesc Analyzer', 'Attack Path Graphing', 'Continuous CIS Benchmarks'],
        recommended: true,
        ctaText: 'Deploy Cloud Defense'
      }
    ],
    reviews: [
      {
        author: 'Elena Gomez',
        role: 'Head of Cloud Infrastructure',
        company: 'Apex Cloud Solutions',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        rating: 5,
        text: 'Product 4 caught a multi-cloud STS AssumeRole bypass that would have allowed cross-tenant access between AWS and Azure.',
        date: 'October 2026'
      }
    ],
    documentation: {
      quickstart: 'Connect AWS / Azure credentials at https://19-cloud-security-platform.vercel.app',
      apiEndpoints: ['GET /api/attack-paths', 'POST /api/iam/audit'],
      sdkSupport: ['Terraform', 'Python', 'Go']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Uptime',
      channel: 'Cloud Security Slack Channel',
      responseHours: '< 15 Minutes'
    }
  },
  {
    id: 'prod_18_unified_nexus',
    name: 'Unified Integration Layer & SOAR Nexus (Product 3)',
    tagline: 'Cross-Platform Ecosystem Hub Federating CERBERUS-RE, Aegis & AXIOM with 24.5k Evt/s',
    category: 'Enterprise Solutions',
    subCategory: 'Cross-Platform SOAR',
    launchpadCategory: 'orchestration',
    isLaunchpadDeployed: true,
    liveUrl: 'https://18-unified-integration-layer.vercel.app',
    demoUrl: 'https://18-unified-integration-layer.vercel.app/cross-platform-playbooks',
    isVercelLive: true,
    icon: '🌐',
    badge: '🌐 Vercel Live · 24.5k Evt/s',
    rating: 4.99,
    reviewsCount: 195,
    activeUsersCount: '18 Global Clusters',
    pricing: {
      displayPrice: '$1,200',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'Expedite Enterprise Nexus',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Enterprise orchestration layer federating CERBERUS-RE, Aegis Recovery, and AXIOM DAST with 24,500 evt/s streaming telemetry, STIX 2.1 bi-directional threat intel, and automated SOAR playbooks.',
    features: [
      { title: 'Cross-Platform SOAR Engine', desc: 'Execute automated workflow DAGs across incident response, reverse engineering, and threat containment.' },
      { title: 'Federated Telemetry Bus', desc: 'Streams gRPC and Kafka telemetry at 24.5k events/second with sub-millisecond serialization.' },
      { title: 'STIX 2.1 / TAXII 2.1 Intel Sync', desc: 'Automates threat actor and IOC synchronization across enterprise SIEMs and firewalls.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'High-Throughput gRPC/Kafka Bus',
      summary: 'Distributed pub/sub messaging layer federating security signals and dispatching mitigation playbooks.',
      layers: ['Web Nexus Console', 'Kafka Streaming Engine', 'gRPC Microservice Mesh'],
      latency: '< 4ms message dispatch',
      dataPrivacy: 'Cryptographic payload hashing with zero-knowledge verification.'
    },
    integrations: ['Kafka', 'gRPC', 'Splunk', 'CrowdStrike', 'Microsoft Sentinel', 'Palo Alto Cortex'],
    security: {
      compliance: ['SOC 2 Type II', 'ISO 27001', 'STIX 2.1 Spec'],
      encryption: 'mTLS 1.3 / Hardware HSM',
      isolation: 'Dedicated enterprise partition'
    },
    pricingTiers: [
      {
        name: 'Enterprise Orchestration Hub',
        price: '$1,200',
        period: '/ month',
        description: 'Complete cross-platform SOAR hub with 24.5k evt/s telemetry stream.',
        features: ['Full SOAR Playbook DAG', 'Kafka & gRPC Event Bus', 'STIX 2.1 Intel Sync', 'Unlimited Microservice Connectors'],
        recommended: true,
        ctaText: 'Deploy Nexus Hub'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Access orchestration playbooks at https://18-unified-integration-layer.vercel.app',
      apiEndpoints: ['POST /api/soar/playbook/run', 'GET /api/telemetry/stream'],
      sdkSupport: ['gRPC', 'Kafka', 'Python', 'Go']
    },
    caseStudies: [],
    support: {
      sla: '99.999% Bus Uptime SLA',
      channel: 'Enterprise Nexus Hotline',
      responseHours: '< 10 Minutes'
    }
  },
  {
    id: 'prod_veritaslens_shield',
    name: 'VeritasLens Media Credibility & Fact Shield',
    tagline: 'AI Deepfake Optical Frequency Detection, BERT Claim Classifier & Reuters Lineage',
    category: 'Software',
    subCategory: 'AI & Media Integrity',
    launchpadCategory: 'ai',
    isLaunchpadDeployed: true,
    liveUrl: '/veritaslens',
    demoUrl: '/veritaslens',
    icon: '🛡️',
    badge: '🛡️ In-App Live · AI Deepfake Shield',
    rating: 4.98,
    reviewsCount: 310,
    activeUsersCount: '52,000+ Verified Claims',
    pricing: {
      displayPrice: '$149',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'VeritasLens Media Intelligence',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Bloomberg Terminal + Ground News + Reuters + Knowledge Graph. Real-time Kafka stream ingestion, DeBERTa sentence claim classification, 7-Day TV scorecard & B2B Brand Safety ad-shield with OpenLineage provenance.',
    features: [
      { title: 'Deepfake Optical Frequency Detection', desc: 'Analyzes synthetic frame anomalies, eye reflections, and audio spectrogram artifacts.' },
      { title: 'BERT Claim Classifier', desc: 'DeBERTa neural inference extracting and validating factual assertions in real time.' },
      { title: 'VeritasGraph Lineage', desc: 'OpenLineage provenance graph tracking origin story Reuters wires and citation trees.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'OpenLineage & BERT Scoring Core',
      summary: 'Kafka-driven newsroom ingest pipeline evaluating text, audio, and video payloads.',
      layers: ['VeritasLens Web Terminal', 'DeBERTa NLP Engine', 'Neo4j Provenance Graph'],
      latency: '< 180ms claim analysis',
      dataPrivacy: 'Public newsroom syndication with zero user tracking.'
    },
    integrations: ['Reuters News API', 'Slack', 'Bloomberg Terminal', 'Chrome Extension'],
    security: {
      compliance: ['GDPR Compliant', 'Fact Checking Standards'],
      encryption: 'TLS 1.3 Streaming',
      isolation: 'Multi-Tenant Enclave'
    },
    pricingTiers: [
      {
        name: 'Newsroom Terminal',
        price: '$149',
        period: '/ month',
        description: 'Complete access to Deepfake Shield, Claim Classifier, and Bias Radar.',
        features: ['Real-Time Claim Verification', 'Deepfake Video Scanner', 'Brand Safety Shield', 'Lineage Provenance Graph'],
        ctaText: 'Activate VeritasLens'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Launch /veritaslens or query the verification API directly.',
      apiEndpoints: ['POST /api/verify/claim', 'POST /api/scan/deepfake'],
      sdkSupport: ['REST', 'Python', 'Node.js']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Editorial Support Desk',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_spheracut_ai',
    name: 'SpheraCut Creative AI Suite',
    tagline: 'AI-Powered Video, Character Generator, Motion Sync & Broadcast Studio',
    category: 'Software',
    subCategory: 'Generative AI Studio',
    launchpadCategory: 'ai',
    isLaunchpadDeployed: true,
    liveUrl: 'https://spheracut.expediteconsults.com',
    demoUrl: 'https://spheracut.expediteconsults.com',
    icon: '✂️',
    badge: '✂️ Live Cloud · AI Video & Voice',
    rating: 4.95,
    reviewsCount: 420,
    activeUsersCount: '8,400+ Creators',
    pricing: {
      displayPrice: '$49',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 7
    },
    vendor: {
      name: 'SPHERA Creative Studios',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'All-in-one AI creative powerhouse for filmmakers, creators, and marketers: Text-to-Video generation, 3D Character Builder, Voice Cloning, and automated Motion Sync editing.',
    features: [
      { title: 'Text-to-Video Engine', desc: 'Render cinematic 4K video clips from text prompts in seconds with multi-camera perspective.' },
      { title: 'Character Builder & Motion Sync', desc: 'Create persistent digital avatars with automatic lip-sync and expressive gestures.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'GPU Video Rendering Mesh',
      summary: 'Distributed GPU worker pool processing parallel diffusion and NeRF video rendering tasks.',
      layers: ['SpheraCut Studio Web', 'Diffusion Video Pipeline', 'Audio Lip-Sync Model'],
      latency: '< 2 minutes per 4K scene',
      dataPrivacy: 'Private cloud render instances.'
    },
    integrations: ['Adobe Premiere', 'Final Cut Pro', 'YouTube', 'TikTok'],
    security: {
      compliance: ['SOC 2 Type II', 'Content Authenticity Initiative (C2PA)'],
      encryption: 'AES-256 Cloud Storage',
      isolation: 'Private creative workspace'
    },
    pricingTiers: [
      {
        name: 'Creator Studio Pro',
        price: '$49',
        period: '/ month',
        description: 'Unlimited 4K renders, voice cloning, and custom character models.',
        features: ['4K Video Generation', 'Custom 3D Avatars', 'Voice Cloning Engine', 'Commercial Rights Included'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Launch https://spheracut.expediteconsults.com to begin generating clips.',
      apiEndpoints: ['POST /api/video/render', 'POST /api/avatar/sync'],
      sdkSupport: ['Web', 'REST']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Creator Community Discord',
      responseHours: '< 2 Hours'
    }
  },
  {
    id: 'prod_sphera_sovereign_social',
    name: 'SpheraNet Sovereign Social Network',
    tagline: 'Flagship Sovereign Campus Graph, 4K Reels FYP, SpheraChat & Creator Channels',
    category: 'Software',
    subCategory: 'Social & Campus Graph',
    launchpadCategory: 'campus',
    isLaunchpadDeployed: true,
    liveUrl: '/feed',
    demoUrl: '/feed',
    icon: '🌐',
    badge: '🌐 Sovereign Social Flagship',
    rating: 4.99,
    reviewsCount: 1240,
    activeUsersCount: '100k+ Active Orbits',
    pricing: {
      displayPrice: '$0',
      billingPeriod: 'Free Community Access',
      hasFreeTrial: true
    },
    vendor: {
      name: 'SpheraNet Sovereign Core',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Next-generation sovereign social network: Feed & Stories, 4K Reels video player, SpheraChat WebSockets, Multi-Channel Spaces, P2P Bazaar Escrow, VeritasLens Deepfake Shield, Careers Matrix, Esports Arena, and Financial Vault.',
    features: [
      { title: 'Sovereign Home Feed & Reels', desc: 'Algorithmic freedom FYP, 4K vertical streaming, and interactive polls.' },
      { title: 'End-to-End SpheraChat', desc: 'Real-time WebSockets direct messages, voice notes, and collaborative channels.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Decentralized Social Graph',
      summary: 'Edge-rendered graph with real-time WebSocket messaging and decentralized identity passkeys.',
      layers: ['Next.js 16 Edge UI', 'Pusher WebSockets', 'Prisma Edge Database'],
      latency: '< 15ms messaging latency',
      dataPrivacy: 'User-owned data enclaves with FIDO2 passkeys.'
    },
    integrations: ['FIDO2 Passkeys', 'ConnectIn Matrix', 'Bazaar Escrow', 'VeritasLens'],
    security: {
      compliance: ['GDPR Compliant', 'FIDO2 Certified'],
      encryption: 'AES-256-GCM / TLS 1.3',
      isolation: 'User Data Enclaves'
    },
    pricingTiers: [
      {
        name: 'Community Access',
        price: '$0',
        period: 'free forever',
        description: 'Full access to feeds, reels, spaces, messaging, and career network.',
        features: ['Unlimited Messaging', '4K Reels Uploads', 'Community Spaces Access', 'Decentralized Vault'],
        ctaText: 'Enter SpheraNet'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Navigate to /feed to start exploring SpheraNet.',
      apiEndpoints: ['GET /api/feed', 'POST /api/chat/send'],
      sdkSupport: ['Web', 'PWA']
    },
    caseStudies: [],
    support: {
      sla: '99.99% Uptime',
      channel: 'Sphera Community Hub',
      responseHours: '< 15 Minutes'
    }
  },
  {
    id: 'prod_14_ai_security',
    name: 'AXIOM AI/LLM Security Sandbox & Red Teaming (Product 14)',
    tagline: 'Meta Llama Guard 3, NeMo Guardrail Defense & Autonomous Adversary Simulation',
    category: 'Software',
    subCategory: 'AI Security & LLM Guardrails',
    launchpadCategory: 'ai',
    isLaunchpadDeployed: true,
    liveUrl: 'https://14-exploitability-platform.vercel.app/ai-security',
    demoUrl: 'https://14-exploitability-platform.vercel.app/ai-security',
    isVercelLive: true,
    icon: '🧠',
    badge: '🧠 Product 14 · AI Red Teaming',
    rating: 4.97,
    reviewsCount: 164,
    activeUsersCount: '1,200+ Prompt Injections Blocked',
    pricing: {
      displayPrice: '$690',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'AXIOM AI Safety Labs',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true,
      isFellow: true
    },
    overview: 'Evaluates production LLMs, multi-agent LangGraph swarms, and MCP tool servers against prompt injections, system prompt extraction, jailbreaks, and data exfiltration using Meta Llama Guard 3 and NVIDIA NeMo guardrails.',
    features: [
      { title: 'Automated AI Red Teaming', desc: 'Autonomous adversary agents simulate multi-turn social engineering against your AI models.' },
      { title: 'Llama Guard 3 & NeMo Evaluator', desc: 'Real-time safety scoring for input prompts and generated output responses.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Inference Interceptor Proxy',
      summary: 'Low-latency reverse proxy inspecting prompts and completions with microsecond tensor inference.',
      layers: ['AI Security Gateway', 'Llama Guard MicroVM', 'Adversary Simulation Swarm'],
      latency: '< 14ms inference overhead',
      dataPrivacy: 'Zero prompt data retention.'
    },
    integrations: ['OpenAI', 'Anthropic Claude', 'Google Gemini', 'LangChain', 'LangGraph', 'MCP Servers'],
    security: {
      compliance: ['EU AI Act Aligned', 'ISO 42001', 'NIST AI RMF'],
      encryption: 'TLS 1.3 Transport',
      isolation: 'Air-gapped evaluation microVMs'
    },
    pricingTiers: [
      {
        name: 'LLM Defense Gateway',
        price: '$690',
        period: '/ month',
        description: 'Complete guardrails and automated red-teaming for enterprise AI swarms.',
        features: ['Real-time Prompt Inspection', 'Automated Red Teaming Swarm', 'EU AI Act Compliance Reports', 'MCP Tool Security'],
        ctaText: 'Start Free Trial'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Test guardrails live at https://14-exploitability-platform.vercel.app/ai-security',
      apiEndpoints: ['POST /api/ai/inspect', 'POST /api/redteam/run'],
      sdkSupport: ['Python', 'TypeScript', 'LangChain']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'AI Defense Hotline',
      responseHours: '< 30 Minutes'
    }
  },
  {
    id: 'prod_15_threat_modeler',
    name: 'AXIOM Threat Modeler & Attack Chain Visualizer (Product 15)',
    tagline: 'PyTorch GraphSAGE Blast Radius Visualizer & LLM-Synthesized STRIDE Threat Modeling',
    category: 'Software',
    subCategory: 'Threat Modeling',
    launchpadCategory: 'security',
    isLaunchpadDeployed: true,
    liveUrl: 'https://15-threat-modeling-platform.vercel.app',
    demoUrl: 'https://15-threat-modeling-platform.vercel.app/attack-chain',
    isVercelLive: true,
    icon: '🗺️',
    badge: '🗺️ Product 15 · GraphSAGE Core',
    rating: 4.96,
    reviewsCount: 145,
    activeUsersCount: '5,600+ Threat Models Generated',
    pricing: {
      displayPrice: '$550',
      billingPeriod: '/ month',
      hasFreeTrial: true,
      trialDays: 14
    },
    vendor: {
      name: 'AXIOM Threat Architecture',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Automated architecture threat analysis combining PyTorch GNN GraphSAGE blast radius modeling with LLM-synthesized STRIDE threat mapping and instant SOC2 / ISO 27001 export.',
    features: [
      { title: 'Attack Chain Visualizer', desc: 'Interactive 3D graph visualizer tracing adversary movement across systems.' },
      { title: 'Automated STRIDE Modeler', desc: 'Parses architecture diagrams and code repos into full STRIDE risk matrices.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Graph Neural Network Engine',
      summary: 'PyTorch GraphSAGE predicting unobserved attack choke points across complex microservice graphs.',
      layers: ['Graph Visualizer Canvas', 'PyTorch GNN Core', 'STRIDE LLM Generator'],
      latency: '< 50ms graph inference',
      dataPrivacy: 'Encrypted topology models.'
    },
    integrations: ['Terraform', 'AWS CloudFormation', 'GitHub Architecture Diagrams', 'Lucidchart'],
    security: {
      compliance: ['SOC 2 Type II', 'NIST SP 800-53', 'ISO 27001'],
      encryption: 'AES-256 Storage',
      isolation: 'Tenant Graph Enclave'
    },
    pricingTiers: [
      {
        name: 'Threat Modeler Pro',
        price: '$550',
        period: '/ month',
        description: 'Unlimited automated STRIDE threat models and GraphSAGE blast radius predictions.',
        features: ['Interactive 3D Attack Chain Graph', 'Automated STRIDE Reports', 'Architecture Ingestion', 'Compliance PDF Export'],
        ctaText: 'Model Your Architecture'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Explore threat models at https://15-threat-modeling-platform.vercel.app',
      apiEndpoints: ['POST /api/model/generate', 'GET /api/graph/attack-chain'],
      sdkSupport: ['REST', 'Python']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Threat Modeling Desk',
      responseHours: '< 1 Hour'
    }
  },
  {
    id: 'prod_salisbury_campus_os',
    name: 'Salisbury Campus Operating OS',
    tagline: 'Decoupled Student OS, Collegiate Hackathons, Academic Calendars & .EDU Verification',
    category: 'Software',
    subCategory: 'Campus OS',
    launchpadCategory: 'campus',
    isLaunchpadDeployed: true,
    liveUrl: '/campus',
    demoUrl: '/campus',
    icon: '🎓',
    badge: '🎓 Collegiate Campus OS',
    rating: 4.94,
    reviewsCount: 520,
    activeUsersCount: '12,000+ Salisbury Students',
    pricing: {
      displayPrice: '$0',
      billingPeriod: 'Free for .EDU Students',
      hasFreeTrial: true
    },
    vendor: {
      name: 'Salisbury University Collegiate Enclave',
      logo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&auto=format&fit=crop&q=80',
      isVerified: true
    },
    overview: 'Decoupled collegiate student OS providing university event schedules, hackathon team formation, authenticated .EDU verification, GPA verified badges, and campus dining marketplace.',
    features: [
      { title: 'Campus Hackathons & RSVPs', desc: 'Register for student hackathons, career workshops, and technical seminars with 1-click.' },
      { title: 'Verified .EDU Credential Badge', desc: 'Validates active student enrollment and academic honors directly on ConnectIn.' }
    ],
    screenshots: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ],
    architecture: {
      title: 'Collegiate Identity Enclave',
      summary: 'SAML / OAuth2 federation with university single-sign-on and student directory sync.',
      layers: ['Campus OS Portal', 'SAML SSO Connector', 'Collegiate Event Bus'],
      latency: '< 20ms page load',
      dataPrivacy: 'Strict FERPA privacy compliance.'
    },
    integrations: ['Canvas LMS', 'Blackboard', 'ConnectIn Profile', 'Google Calendar'],
    security: {
      compliance: ['FERPA Compliant', 'SOC 2 Type II'],
      encryption: 'TLS 1.3 / AES-256',
      isolation: 'Student Privacy Enclave'
    },
    pricingTiers: [
      {
        name: 'Student & Faculty Access',
        price: '$0',
        period: 'free forever',
        description: 'Free for all verified .EDU students, researchers, and campus faculty.',
        features: ['Campus Event RSVPs', 'Hackathon Team Builder', 'Verified Student Badge', 'Dining Marketplace'],
        ctaText: 'Access Campus OS'
      }
    ],
    reviews: [],
    documentation: {
      quickstart: 'Access collegiate hub at /campus with your student login.',
      apiEndpoints: ['GET /api/campus/events', 'POST /api/campus/rsvp'],
      sdkSupport: ['Web', 'Mobile']
    },
    caseStudies: [],
    support: {
      sla: '99.9% Uptime',
      channel: 'Campus IT Helpdesk',
      responseHours: '< 2 Hours'
    }
  }
]

export function getEnclaveMarketplaceProducts(enclaveId?: string): MarketplaceProduct[] {
  const userEnclave = enclaveId || 'tech_cybersecurity'
  return MASTER_MARKETPLACE_PRODUCTS.filter(p => {
    if (userEnclave === 'trades_construction') {
      if (p.professionEnclave && p.professionEnclave !== 'trades_construction') return false
      if (!p.professionEnclave && !['Tools & Joinery', 'CAD & Measurement', 'Lumber & Materials', 'Hardware', 'Trades & Vocational Network', 'Productivity & Field Notes', 'Trade Machinery & Commerce', 'Video Masterclasses & Tutorials'].includes(p.subCategory)) return false
      return true
    }
    if (userEnclave === 'healthcare_medicine') {
      if (p.professionEnclave && p.professionEnclave !== 'healthcare_medicine') return false
      if (!p.professionEnclave && !['Diagnostic Devices', 'Trauma & Resuscitation', 'Surgical Implants', 'Clinical Gear'].includes(p.subCategory)) return false
      return true
    }
    if (userEnclave === 'automotive_mechanics') {
      if (p.professionEnclave && p.professionEnclave !== 'automotive_mechanics') return false
      if (!p.professionEnclave && !['Scan Tools', 'Oscilloscopes', 'EV Safety Gear', 'OEM Repair Data', 'Productivity & Field Notes'].includes(p.subCategory)) return false
      return true
    }
    if (userEnclave === 'tech_software') {
      if (p.professionEnclave && p.professionEnclave !== 'tech_software') return false
      return true
    }
    if (userEnclave === 'law_gov_defense') {
      if (p.professionEnclave && p.professionEnclave !== 'law_gov_defense') return false
      return true
    }
    if (userEnclave === 'finance_accounting') {
      if (p.professionEnclave && p.professionEnclave !== 'finance_accounting') return false
      return true
    }
    // tech_cybersecurity or default
    return p.professionEnclave === userEnclave || (!p.professionEnclave && !['Tools & Joinery', 'Diagnostic Devices', 'Scan Tools', 'Trades & Vocational Network'].includes(p.subCategory))
  })
}

export const LAUNCHPAD_DEPLOYED_PRODUCTS: MarketplaceProduct[] = MASTER_MARKETPLACE_PRODUCTS.filter(
  (p) => p.isLaunchpadDeployed === true
)
