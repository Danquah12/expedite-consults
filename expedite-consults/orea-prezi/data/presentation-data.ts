import { ClusterData, SlideData } from "@/lib/types";

export const CLUSTERS: ClusterData[] = [
  {
    id: "cluster-vision",
    title: "Strategic Vision & Governance",
    tagline: "Redefining Organized Real Estate for 100,000+ Members",
    description: "Modernizing association leadership, championing homeownership, and setting the benchmark for professional excellence.",
    icon: "Compass",
    accentColor: "#3b82f6", // Blue
    badge: "Pillar 01",
    x: -850,
    y: -480,
    radius: 340,
    slides: [
      {
        id: "s-vision-thesis",
        clusterId: "cluster-vision",
        kicker: "Executive Vision",
        title: "The 2030 Horizon: Transforming Ontario Real Estate",
        subtitle: "A digital-first paradigm built for consumer trust, member growth, and market velocity.",
        x: -950,
        y: -580,
        scale: 1.6,
        presenterNotes:
          "Welcome leadership and board members. Today we unveil the OREA-PREZI strategic blueprint. Highlight that Ontario's real estate ecosystem is facing regulatory shifts under TRESA, rapid AI adoption, and evolving consumer expectations. Our mission is delivering proactive, frictionless tools for every Realtor.",
        metrics: [
          { label: "Active Members", value: "102,400+", change: "+4.8% YoY", trend: "up", description: "Across 34 local boards" },
          { label: "Transactions Backed", value: "$138B", change: "Annual Volume", trend: "neutral", description: "Secured through standard forms" },
          { label: "Digital Adoption", value: "94.2%", change: "+12.4%", trend: "up", description: "Mobile-first engagement rate" },
          { label: "Advocacy Impact", value: "31 Acts", change: "Policies shaped", trend: "up", description: "Provincial & municipal wins" }
        ],
        bullets: [
          {
            title: "Realtor-Centric Digital Infrastructure",
            text: "Equipping every professional with modern, cloud-native transaction and compliance suites.",
            iconName: "ShieldCheck"
          },
          {
            title: "Consumer Confidence & Market Transparency",
            text: "Setting the gold standard for disclosures, fair competition, and accessible housing data.",
            iconName: "Eye"
          },
          {
            title: "Legislative Leadership",
            text: "Leading the province on housing supply reform, land transfer tax relief, and homebuyer protections.",
            iconName: "Scale"
          }
        ],
        callout: {
          text: "“Organized real estate must not simply respond to change; it must architect the future of property exchange in Canada.”",
          author: "OREA Executive Steering Committee",
          badge: "Strategic North Star"
        }
      },
      {
        id: "s-vision-pillars",
        clusterId: "cluster-vision",
        kicker: "Strategic Framework",
        title: "Three Core Modernization Pillars",
        subtitle: "Synthesizing member value, regulatory compliance, and cutting-edge digital experiences.",
        x: -750,
        y: -380,
        scale: 1.6,
        presenterNotes:
          "Walk through the three strategic pillars: Standard Forms Modernization, MLS Unified Interoperability, and Member Intelligence. Each pillar drives measurable savings and reduces liability for Ontario brokers.",
        metrics: [
          { label: "Hours Saved / Deal", value: "3.5 hrs", change: "-65% Admin time", trend: "up" },
          { label: "Audit Accuracy", value: "99.94%", change: "TRESA Compliant", trend: "up" },
          { label: "Platform Uptime", value: "99.99%", change: "Target SLA", trend: "up" }
        ],
        bullets: [
          {
            title: "Pillar A: Digital Transaction Sovereignty",
            text: "Unified API pipelines for automated clause generation, e-signatures, and instant FINTRAC compliance.",
            iconName: "Cpu"
          },
          {
            title: "Pillar B: Unified Knowledge & Licensing",
            text: "Continuous real-time accreditation, automated CE tracking, and micro-learning modules.",
            iconName: "GraduationCap"
          },
          {
            title: "Pillar C: Consumer Market Intelligence",
            text: "Authoritative, verified market statistics delivered directly into member presentation decks and client portals.",
            iconName: "BarChart3"
          }
        ]
      }
    ]
  },
  {
    id: "cluster-forms",
    title: "Standard Forms 2.0 & TRESA Suite",
    tagline: "Automated, Zero-Error Real Estate Contracts",
    description: "Transforming Ontario's legal forms into intelligent, API-driven workflows compliant with the Trust in Real Estate Services Act.",
    icon: "FileCheck2",
    accentColor: "#10b981", // Emerald
    badge: "Pillar 02",
    x: 850,
    y: -480,
    radius: 340,
    slides: [
      {
        id: "s-forms-smart",
        clusterId: "cluster-forms",
        kicker: "Next-Gen Documents",
        title: "OREA Standard Forms 2.0: Dynamic Smart Contracts",
        subtitle: "Eliminating manual clause entry with intelligent condition validators and instant legal verification.",
        x: 750,
        y: -580,
        scale: 1.6,
        presenterNotes:
          "Highlight how Standard Forms 2.0 eliminates 80% of drafting errors. Point out the dynamic condition generator that automatically adjusts financing and inspection clauses based on property type and municipality.",
        metrics: [
          { label: "Active Forms", value: "140+", change: "Standardized", trend: "neutral" },
          { label: "Drafting Speed", value: "< 4 mins", change: "From 24 mins", trend: "up" },
          { label: "Error Reductions", value: "92%", change: "Omissions prevented", trend: "up" },
          { label: "Mobile Completion", value: "78%", change: "Via Phone & Tablet", trend: "up" }
        ],
        widgetType: "comparison-matrix",
        widgetData: {
          comparisons: [
            { feature: "Clause Generation", legacy: "Manual copy-paste from clause books", oreaNext: "Contextual AI suggestions & verified legal clauses", status: "superior" },
            { feature: "TRESA Disclosures", legacy: "Separate paper sheets & multiple sign-offs", oreaNext: "One-click integrated disclosure bundle & audit trail", status: "superior" },
            { feature: "Mobile Signing", legacy: "Third-party redirect & document re-upload", oreaNext: "Native embedded biometric & e-signature flow", status: "superior" },
            { feature: "Amendment Tracking", legacy: "Redlining across messy PDF versions", oreaNext: "Live collaborative diffing with immutable change logs", status: "superior" }
          ]
        }
      },
      {
        id: "s-forms-compliance",
        clusterId: "cluster-forms",
        kicker: "Regulatory Defense",
        title: "TRESA Compliance Engine & Audit Assurance",
        subtitle: "Automating mandatory disclosures, open-offer transparent options, and FINTRAC verification.",
        x: 950,
        y: -380,
        scale: 1.6,
        presenterNotes:
          "Stress that TRESA compliance is the single highest concern for brokerages. Our engine validates open offer opt-ins, designated agency agreements, and buyer representation disclosures prior to submission.",
        bullets: [
          {
            title: "Automated Self-Represented Party (SRP) Safeguards",
            text: "Instant mandatory warnings and proof-of-delivery receipts protecting member brokerages from regulatory disputes.",
            iconName: "ShieldAlert"
          },
          {
            title: "Transparent Offer Registry Integration",
            text: "Standardized open bidding disclosure tracking complying fully with Ontario Ministry and RECO regulations.",
            iconName: "Layers"
          },
          {
            title: "Automated FINTRAC & Identity Verification",
            text: "Instant Canadian driver's license and passport biometric validation with encrypted compliance storage.",
            iconName: "KeyRound"
          }
        ],
        callout: {
          text: "“By baking compliance directly into the keystrokes of every contract, we protect Ontario Realtors against inadvertent infractions.”",
          author: "OREA Legal & Standard Forms Advisory Council"
        }
      }
    ]
  },
  {
    id: "cluster-mls",
    title: "Unified MLS & PropTech Interoperability",
    tagline: "Connecting 34 Real Estate Boards into One Seamless Data Hub",
    description: "Bridging provincial MLS systems, syndication pipelines, and proptech partners with high-speed GraphQL and REST APIs.",
    icon: "Network",
    accentColor: "#06b6d4", // Cyan
    badge: "Pillar 03",
    x: 0,
    y: 0,
    radius: 360,
    slides: [
      {
        id: "s-mls-architecture",
        clusterId: "cluster-mls",
        kicker: "Data Architecture",
        title: "The Ontario Real Estate Unified Data Fabric",
        subtitle: "Eliminating data silos between TRREB, RAHB, Ottawa, London-St. Thomas, and regional boards.",
        x: 0,
        y: -80,
        scale: 1.7,
        presenterNotes:
          "This is the core technical architecture slide. Walk through how the unified data fabric normalizes listings, historical sold data, and tax records across all Ontario real estate boards in under 200 milliseconds.",
        widgetType: "architecture-diagram",
        widgetData: {
          techPillars: [
            {
              layer: "Layer 1: Ingestion & Feeds",
              title: "RESO Web API & Board Connectors",
              tags: ["RESO Data Dictionary 2.0", "Webhooks", "Kafka Streams"],
              details: "Real-time sync capturing 100% of Ontario active, pending, and sold property records with instant deduplication."
            },
            {
              layer: "Layer 2: Normalization Engine",
              title: "Proprietary Data Standardizer & Geocoder",
              tags: ["PostGIS", "MPAC Land Registry", "Terranet Link"],
              details: "Resolves parcel bounds, municipal zoning codes, and school catchment zones with sub-meter spatial accuracy."
            },
            {
              layer: "Layer 3: Developer & Partner Gateway",
              title: "Secure Member & PropTech Open API",
              tags: ["GraphQL", "OAuth2 / PKCE", "Rate Limiter", "Zero Trust"],
              details: "Enables verified brokerages, CRM vendors, and virtual tour providers to integrate approved listing data securely."
            }
          ]
        },
        metrics: [
          { label: "Sync Latency", value: "< 180ms", change: "Near Real-Time", trend: "up" },
          { label: "Listings Processed", value: "3.2M", change: "Annual Records", trend: "neutral" },
          { label: "API Availability", value: "99.995%", change: "Zero downtime", trend: "up" }
        ]
      },
      {
        id: "s-mls-experience",
        clusterId: "cluster-mls",
        kicker: "Member Experience",
        title: "Universal Member Search & Comparative Market Tool",
        subtitle: "Giving every Ontario Realtor instant access to province-wide historical data and neighborhood analytics.",
        x: 0,
        y: 120,
        scale: 1.7,
        presenterNotes:
          "Show how Realtors can generate high-gloss, client-facing CMA reports in seconds, complete with school rankings, transit scores, and past sales comparisons.",
        bullets: [
          {
            title: "Province-Wide Historical Sold Archive",
            text: "30-year property transaction history indexed with micro-neighborhood appreciation trajectories.",
            iconName: "History"
          },
          {
            title: "Interactive Client Presentation Pitch Decks",
            text: "Branded interactive CMA decks that clients can explore on smartphones, tablets, or in listing presentations.",
            iconName: "Presentation"
          },
          {
            title: "Direct Synergies with Municipal Open Data",
            text: "Real-time overlays for flood risk maps, transit expansions, building permits, and planned zoning alterations.",
            iconName: "MapPin"
          }
        ]
      }
    ]
  },
  {
    id: "cluster-ai",
    title: "OreaAI & Advanced Member Analytics",
    tagline: "Responsible, High-Impact AI for Realtors",
    description: "Equipping agents with generative listing tools, predictive pricing intelligence, and automated market sentiment reports.",
    icon: "Sparkles",
    accentColor: "#8b5cf6", // Purple
    badge: "Pillar 04",
    x: -850,
    y: 480,
    radius: 340,
    slides: [
      {
        id: "s-ai-copilot",
        clusterId: "cluster-ai",
        kicker: "Next-Gen AI",
        title: "OreaAI Listing Copilot: From Notes to Staged Marketing",
        subtitle: "Generate compelling MLS descriptions, social assets, and video walk-through scripts in seconds.",
        x: -950,
        y: 380,
        scale: 1.6,
        presenterNotes:
          "OreaAI is trained specifically on Canadian real estate law and advertising guidelines. It flags non-compliant claims, prevents fair housing wording issues, and crafts bilingual listing copy in French and English.",
        metrics: [
          { label: "Copy Generation", value: "30 sec", change: "From 45 mins", trend: "up" },
          { label: "Compliance Filter", value: "100%", change: "RECO & Ad Standards", trend: "up" },
          { label: "Bilingual Ready", value: "EN / FR", change: "Instant Localization", trend: "neutral" }
        ],
        bullets: [
          {
            title: "Context-Aware Architectural Tagging",
            text: "Upload listing photos to automatically detect quartz countertops, crown moldings, and energy-star features.",
            iconName: "Image"
          },
          {
            title: "Proactive Fair Housing & Advertising Guardrails",
            text: "Built-in automated audit preventing non-compliant claims or discriminatory terminology before publishing.",
            iconName: "CheckCircle2"
          },
          {
            title: "Omni-Channel Marketing Automation",
            text: "Generates tailored Instagram reels scripts, email blast blurbs, and open house collateral with one click.",
            iconName: "Share2"
          }
        ]
      },
      {
        id: "s-ai-predictive",
        clusterId: "cluster-ai",
        kicker: "Market Science",
        title: "Predictive Pricing & Ontario Liquidity Radar",
        subtitle: "Empower clients with hyper-local probabilistic pricing models and days-on-market forecasting.",
        x: -750,
        y: 580,
        scale: 1.6,
        presenterNotes:
          "Demonstrate that OreaAI doesn't just look at past comparables; it evaluates interest rate trajectories, inventory absorption rates, and seasonal micro-trends to predict listing velocity with 94% precision.",
        bullets: [
          {
            title: "Absorption Velocity Forecasting",
            text: "Analyzes current active inventory versus buyer showing velocity to calculate expected days on market.",
            iconName: "TrendingUp"
          },
          {
            title: "Confidence Band Pricing Matrix",
            text: "Provides sellers with three calculated strategy tiers: Aggressive List, Market Equilibrium, and Swift Sale.",
            iconName: "Target"
          },
          {
            title: "Bank of Canada & Macroeconomic Linkages",
            text: "Correlates regional mortgage affordability thresholds directly with buyer purchasing power indices.",
            iconName: "DollarSign"
          }
        ]
      }
    ]
  },
  {
    id: "cluster-advocacy",
    title: "Advocacy, Housing Supply & Education",
    tagline: "Championing Affordable Homeownership in Ontario",
    description: "Driving provincial housing legislation, expanding supply, and modernizing professional real estate education.",
    icon: "Megaphone",
    accentColor: "#f59e0b", // Amber
    badge: "Pillar 05",
    x: 850,
    y: 480,
    radius: 340,
    slides: [
      {
        id: "s-advocacy-policy",
        clusterId: "cluster-advocacy",
        kicker: "Government Relations",
        title: "The Housing Affordability & Supply Agenda",
        subtitle: "Policy proposals accelerating 1.5 million homes, cutting red tape, and protecting first-time buyers.",
        x: 750,
        y: 380,
        scale: 1.6,
        presenterNotes:
          "Highlight OREA's leadership in Queen's Park and Ottawa. We've championed ending exclusionary zoning, allowing fourplexes as-of-right, and expanding municipal infrastructure funding to unblock home building.",
        metrics: [
          { label: "Housing Target", value: "1.5M Homes", change: "Ontario 10-Yr Plan", trend: "up" },
          { label: "Municipal Red Tape", value: "-40%", change: "Target approval speed", trend: "up" },
          { label: "First-Time Relief", value: "$4,000+", change: "LTT Rebate Expansion", trend: "up" }
        ],
        bullets: [
          {
            title: "As-Of-Right Gentle Density",
            text: "Championed zoning reforms enabling garden suites, duplexes, and multi-generational housing across Ontario.",
            iconName: "Home"
          },
          {
            title: "Land Transfer Tax Modernization",
            text: "Advocating for indexed tax brackets reflecting contemporary home valuations to lower closing burdens.",
            iconName: "FileSpreadsheet"
          },
          {
            title: "Brownfield & Transit-Oriented Communities",
            text: "Partnering with infrastructure ministries to streamline transit corridor high-density residential development.",
            iconName: "Train"
          }
        ]
      },
      {
        id: "s-advocacy-academy",
        clusterId: "cluster-advocacy",
        kicker: "Professional Standards",
        title: "OREA Leadership Academy & Continuing Education",
        subtitle: "Next-generation professional development empowering Realtors to thrive in an AI and advisory era.",
        x: 950,
        y: 580,
        scale: 1.6,
        presenterNotes:
          "Discuss the transformation of OREA continuing education into on-demand micro-credentials, executive commercial diplomas, and ethical advisory workshops.",
        bullets: [
          {
            title: "On-Demand Micro-Credential Badges",
            text: "Verified digital credentials in commercial lease negotiation, green building certifications, and luxury marketing.",
            iconName: "Award"
          },
          {
            title: "TRESA Masterclasses & Live Q&A Clinics",
            text: "Weekly interactive briefings with top legal counsels to answer real-time deal scenarios and contract edge-cases.",
            iconName: "HelpCircle"
          },
          {
            title: "Young Professionals & Mentorship Incubator",
            text: "Pairing emerging agents with veteran industry leaders to foster sustainable brokerage management and ethics.",
            iconName: "Users"
          }
        ]
      }
    ]
  },
  {
    id: "cluster-roadmap",
    title: "Transformation Roadmap & ROI Delivery",
    tagline: "Execution Strategy & Value Realization (2026-2028)",
    description: "A disciplined, four-phase rollout delivering tangible efficiency, regulatory peace-of-mind, and economic returns.",
    icon: "Rocket",
    accentColor: "#ec4899", // Pink
    badge: "Pillar 06",
    x: 0,
    y: 920,
    radius: 360,
    slides: [
      {
        id: "s-roadmap-phases",
        clusterId: "cluster-roadmap",
        kicker: "Implementation Timeline",
        title: "The 3-Year Modernization Master Plan",
        subtitle: "Phased architecture deployment ensuring zero disruption to daily real estate operations.",
        x: -120,
        y: 840,
        scale: 1.6,
        presenterNotes:
          "Walk through the phased schedule. Phase 1 delivers Standard Forms 2.0 and TRESA automation by Q4 2026, followed by the MLS Unified Data Fabric in 2027 and OreaAI Enterprise rollout in 2028.",
        widgetType: "timeline-flow",
        widgetData: {
          timeline: [
            {
              phase: "Phase 1: Foundation",
              period: "Q3 2026 - Q4 2026",
              title: "Standard Forms 2.0 & TRESA Compliance Engine",
              status: "in-progress",
              items: [
                "Launch dynamic forms editor with real-time clause validator",
                "Deploy RECO-compliant SRP mandatory disclosure workflows",
                "Beta pilot with 5,000 agents across 6 regional boards"
              ]
            },
            {
              phase: "Phase 2: Interoperability",
              period: "Q1 2027 - Q3 2027",
              title: "Ontario Unified MLS Data Fabric & API Gateway",
              status: "planned",
              items: [
                "Deploy RESO-compliant high-speed GraphQL listings gateway",
                "Integrate MPAC property registry and cadastral boundary layer",
                "Launch unified search portal and interactive CMA builder"
              ]
            },
            {
              phase: "Phase 3: Intelligence",
              period: "Q4 2027 - Q2 2028",
              title: "OreaAI Listing Copilot & Predictive Liquidity Hub",
              status: "planned",
              items: [
                "Deploy context-aware bilingual listing description generator",
                "Roll out absorption velocity and confidence-band pricing tools",
                "Launch Realtor mobile assistant with voice-to-contract dictation"
              ]
            },
            {
              phase: "Phase 4: Optimization",
              period: "Q3 2028 - Beyond",
              title: "Autonomous Transactions & Ecosystem Expansion",
              status: "planned",
              items: [
                "End-to-end digital escrow, deposit tracking, and closing sync",
                "AI-driven municipal building permit prediction engine",
                "Continuous member credentialing and digital identity wallet"
              ]
            }
          ]
        }
      },
      {
        id: "s-roadmap-roi",
        clusterId: "cluster-roadmap",
        kicker: "Value Realization",
        title: "Economic Impact & Member ROI Model",
        subtitle: "Interactive value assessment modeling hours saved, risk mitigation, and member retention dividends.",
        x: 120,
        y: 960,
        scale: 1.6,
        presenterNotes:
          "Conclude the presentation with the member ROI impact. Use the interactive calculator to show how an average brokerage of 50 agents saves over $240,000 annually in administrative and legal review overhead.",
        widgetType: "roi-calculator",
        widgetData: {
          calculatorDefaults: {
            agents: 40,
            avgTransactions: 14,
            complianceSavings: 420
          }
        },
        callout: {
          text: "“This transformation represents more than technology—it is our definitive commitment to safeguarding the future of the Realtor profession in Ontario.”",
          author: "OREA Board of Directors Resolution",
          badge: "Executive Consensus"
        }
      }
    ]
  }
];

// Flat list of all slides in presentation sequence
export const ALL_SLIDES: SlideData[] = CLUSTERS.flatMap((cluster) => cluster.slides);

export const PRESENTATION_META = {
  title: "OREA-PREZI",
  fullTitle: "Ontario Real Estate Association — Strategic Platform & Digital Horizon",
  author: "OREA Digital Transformation Taskforce",
  year: "2026-2028",
  overviewCoordinates: { x: 0, y: 150, zoom: 0.38 }
};
