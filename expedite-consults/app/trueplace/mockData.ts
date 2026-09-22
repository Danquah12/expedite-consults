export interface Property {
  id: string;
  mlsId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  listPrice: number;
  trueValue: number;
  confidence: number;
  truthScore: number;
  rangeLow: number;
  rangeHigh: number;
  baseValue: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSizeSqft: number;
  yearBuilt: number;
  effectiveYearBuilt: number;
  propertyType: 'single_family' | 'townhouse' | 'condo';
  status: 'active' | 'pending' | 'sold';
  isVerifiedActive: boolean;
  lastVerifiedHoursAgo: number;
  photoUrl: string;
  gallery: string[];
  schoolRating: number;
  walkScore: number;
  transitScore: number;
  femaFloodZone: string;
  floodRiskLevel: 'Minimal' | 'Moderate' | 'High';
  wildfireScore: number;
  coordinates: { lat: number; lng: number };
  listingAgent: {
    name: string;
    brokerage: string;
    license: string;
    phone: string;
    isVerifiedPartner: boolean;
  };
  shapDrivers: {
    category: string;
    driver: string;
    impact: number;
    description: string;
  }[];
  permits: {
    id: string;
    type: string;
    cost: number;
    year: number;
    status: string;
  }[];
  comparables: {
    id: string;
    address: string;
    price: number;
    distanceMi: number;
    similarity: number;
    soldDate: string;
    sqft: number;
  }[];
  timeline: {
    year: number;
    title: string;
    type: 'built' | 'sale' | 'permit' | 'renovation' | 'listed';
    cost?: number;
    description: string;
  }[];
  healthScores: {
    overall: number;
    structural: number;
    systems: number;
    energy: number;
    risk: number;
    maintenance: number;
  };
  neighborhoodTwin: {
    fcpsCluster: string;
    schoolRating: number;
    metroDistanceMi: number;
    metroStation: string;
    appreciationVelocity1Yr: number;
    infrastructureNotes: string;
  };
  negotiationData: {
    buyerTargetOffer: number;
    buyerLeveragePoints: string[];
    suggestedContingency: string;
    sellerCounterOffer: number;
    sellerDefensePoints: string[];
  };
  homeTruthData: {
    titleStatus: string;
    openLiens: number;
    permittedRepairsCost: number;
    unpermittedFlags: number;
    roofRemainingYears: number;
    hvacAgeYears: number;
    floodZoneCert: string;
  };
  investmentData: {
    estimatedRent: number;
    capRate: number;
    cashOnCash: number;
    netOperatingIncome: number;
    fiveYearAppreciationPct: number;
  };
  trueCostData?: TrueCostBreakdown;
  homeOSData?: {
    appliances: HomeOSAppliance[];
    maintenanceTasks: HomeOSMaintenanceTask[];
  };
  communitySentimentData?: {
    overallScore: number;
    metrics: CommunityVibeMetric[];
    qaThreads: ResidentQuestionAnswer[];
  };
  inspectionRiskData?: {
    riskScore: 'Low' | 'Moderate' | 'High';
    overallConfidence: number;
    defects: InspectionDefectItem[];
  };
  propertyDNA?: PropertyDNARadar;
  sdatDeedUrl?: string;
  countyPermitUrl?: string;
  sslCadastralId?: string;
  deedLiberFolio?: string;
  governmentSource?: string;
  ledgerId?: string;
  lastSyncedAt?: string;
  syncBlockHeight?: number;
}

export interface TrueCostBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  hazardInsurance: number;
  floodInsurance: number;
  hoaFee: number;
  utilities: number;
  maintenanceReserve: number;
  commuteCost: number;
  totalMonthlyTrueCost: number;
  advertisedMortgageOnly: number;
  hiddenMonthlyDifference: number;
}

export interface HomeOSAppliance {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'HVAC' | 'Water' | 'Roof' | 'Electrical' | 'Plumbing' | 'Appliances';
  installedYear: number;
  expectedLifeYears: number;
  remainingLifeYears: number;
  replacementCostLow: number;
  replacementCostHigh: number;
  status: 'optimal' | 'approaching_service' | 'replace_soon' | 'critical';
  impactOnTrueValue: number;
  permitVerified: boolean;
  recommendation: string;
}

export interface HomeOSMaintenanceTask {
  id: string;
  title: string;
  frequency: 'Monthly' | 'Quarterly' | 'Biannual' | 'Annual';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'Year-round';
  estimatedCost: number;
  diyFriendly: boolean;
  dueDate: string;
  description: string;
}

export interface CommunityVibeMetric {
  category: string;
  score: number;
  benchmarkMetro: number;
  summary: string;
}

export interface ResidentQuestionAnswer {
  id: string;
  question: string;
  askedBy: string;
  answer: string;
  answeredBy: string;
  residentType: string;
  yearsInNeighborhood: number;
  upvotes: number;
  verifiedResident: boolean;
}

export interface InspectionDefectItem {
  id: string;
  target: string;
  severity: 'low' | 'medium' | 'high';
  detectedIssue: string;
  imageUrl: string;
  estimatedRepairCost: string;
  trueValueImpact: number;
  inspectorRecommendation: string;
}

export interface PropertyDNARadar {
  investmentPotential: number;
  familySuitability: number;
  futureAppreciation: number;
  riskLevel: number;
  propertyHealth: number;
}

export const MOCK_PROPERTIES: Property[] = [
  {
    "id": "nova-001",
    "mlsId": "BRIGHT-VAAR-2026-101",
    "title": "Restored Craftsman in Clarendon / Lyon Village",
    "address": "1204 N Hartford St",
    "city": "Arlington",
    "state": "VA",
    "zip": "22201",
    "county": "Arlington County",
    "listPrice": 1495000,
    "trueValue": 1475000,
    "confidence": 94,
    "truthScore": 96,
    "rangeLow": 1440000,
    "rangeHigh": 1515000,
    "baseValue": 1390000,
    "beds": 4,
    "baths": 3.5,
    "sqft": 3120,
    "lotSizeSqft": 6800,
    "yearBuilt": 1928,
    "effectiveYearBuilt": 2023,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 1,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_5.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_5.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_1.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_2.jpg"
    ],
    "schoolRating": 9.4,
    "walkScore": 92,
    "transitScore": 84,
    "femaFloodZone": "Zone X (Minimal Risk)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.8872,
      "lng": -77.0965
    },
    "listingAgent": {
      "name": "David Sterling",
      "brokerage": "Compass Arlington Real Estate",
      "license": "VA-0225194",
      "phone": "(703) 555-0144",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Clarendon Metro Walkshed (0.35 mi)",
        "impact": 48000,
        "description": "High demand transit corridor to Amazon HQ2 and Downtown DC."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Permitted Two-Story Rear Addition & Chef Kitchen",
        "impact": 42500,
        "description": "Arlington County ePlan Permit #BLD-2023-881 signed off by structural engineer."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Yorktown High School Attendance Boundary",
        "impact": 24000,
        "description": "Top-tier Arlington Public Schools (APS) cluster rating 9.5/10."
      },
      {
        "category": "Renovation & Condition",
        "driver": "16-Year-Old Dual-Zone HVAC Compressors",
        "impact": -11000,
        "description": "SEER 13 units approaching end of rated lifecycle; recommended heat pump upgrade."
      },
      {
        "category": "Property Characteristics",
        "driver": "Detached 1-Car Garage (Shared Driveway)",
        "impact": -14000,
        "description": "Shared easement common in Lyon Village; slight deduction vs private drive."
      }
    ],
    "permits": [
      {
        "id": "ARL-BLD-2023-881",
        "type": "Two-Story Addition & Electrical Upgrade",
        "cost": 115000,
        "year": 2023,
        "status": "Finaled"
      },
      {
        "id": "ARL-PLM-2021-419",
        "type": "Tankless Gas Water Heater Installation",
        "cost": 6200,
        "year": 2021,
        "status": "Finaled"
      },
      {
        "id": "ARL-ROF-2018-092",
        "type": "Architectural Shingle Roof Replacement",
        "cost": 14800,
        "year": 2018,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-101",
        "address": "1218 N Hartford St",
        "price": 1490000,
        "distanceMi": 0.05,
        "similarity": 0.96,
        "soldDate": "2026-08-04",
        "sqft": 3080
      },
      {
        "id": "c-102",
        "address": "1304 N Highland St",
        "price": 1520000,
        "distanceMi": 0.18,
        "similarity": 0.93,
        "soldDate": "2026-07-15",
        "sqft": 3200
      }
    ],
    "timeline": [
      {
        "year": 1928,
        "title": "Original Construction",
        "type": "built",
        "cost": 12000,
        "description": "Classic brick & cedar shake American Craftsman home completed."
      },
      {
        "year": 2004,
        "title": "Arms-Length Transfer",
        "type": "sale",
        "cost": 710000,
        "description": "Deed recorded in Arlington County Land Records."
      },
      {
        "year": 2014,
        "title": "Second Ownership Transfer",
        "type": "sale",
        "cost": 995000,
        "description": "Sold with multiple offers in 8 days."
      },
      {
        "year": 2018,
        "title": "CertainTeed Landmark Roof",
        "type": "permit",
        "cost": 14800,
        "description": "Architectural shingle replacement with lifetime ice/water shield."
      },
      {
        "year": 2021,
        "title": "Rinnai Tankless Water Heater",
        "type": "permit",
        "cost": 6200,
        "description": "Energy efficiency mechanical upgrade, finaled by Arlington county."
      },
      {
        "year": 2023,
        "title": "Major Two-Story Rear Addition",
        "type": "renovation",
        "cost": 115000,
        "description": "Expanded primary suite, custom walk-in closet, and open chef's kitchen."
      },
      {
        "year": 2026,
        "title": "Listed for Sale on Bright MLS",
        "type": "listed",
        "cost": 1495000,
        "description": "48h verified active listing on TruePlace."
      }
    ],
    "healthScores": {
      "overall": 91,
      "structural": 95,
      "systems": 86,
      "energy": 89,
      "risk": 96,
      "maintenance": 92
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Arlington Public Schools (APS)",
      "schoolRating": 9.4,
      "metroDistanceMi": 0.35,
      "metroStation": "Clarendon Metro (Orange/Silver Line)",
      "appreciationVelocity1Yr": 5.4,
      "infrastructureNotes": "Direct access to Amazon HQ2 National Landing; high tenant and executive demand."
    },
    "negotiationData": {
      "buyerTargetOffer": 1465000,
      "buyerLeveragePoints": [
        "Dual-zone HVAC systems are 16 years old ($12,000 replacement credit leverage)",
        "Shared driveway easement provides negotiation precedent vs private driveway comps",
        "Property has been on market 28 days compared to Lyon Village median of 11 days"
      ],
      "suggestedContingency": "Buyer requests a $10,000 credit at settlement toward HVAC mechanical modernization in lieu of repair.",
      "sellerCounterOffer": 1485000,
      "sellerDefensePoints": [
        "2023 two-story addition fully permitted with Arlington County LDS final sign-off",
        "Clarendon Metro walkability (0.35 mi) commands 7% premium over North Arlington baseline",
        "Roof is only 8 years into a 30-year architectural shingle certified warranty"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Chain of Title (Zero Unresolved Liens)",
      "openLiens": 0,
      "permittedRepairsCost": 136000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 22,
      "hvacAgeYears": 16,
      "floodZoneCert": "FEMA Zone X - 500-Year Plain, Zero Flood Insurance Mandate"
    },
    "investmentData": {
      "estimatedRent": 6200,
      "capRate": 4.1,
      "cashOnCash": 5.8,
      "netOperatingIncome": 54200,
      "fiveYearAppreciationPct": 26.5
    }
  },
  {
    "id": "nova-002",
    "mlsId": "BRIGHT-VAFX-2026-202",
    "title": "Modern Hilltop Villa in McLean / Langley Forest",
    "address": "6812 Sorrel St",
    "city": "McLean",
    "state": "VA",
    "zip": "22101",
    "county": "Fairfax County",
    "listPrice": 3250000,
    "trueValue": 3320000,
    "confidence": 95,
    "truthScore": 98,
    "rangeLow": 3220000,
    "rangeHigh": 3440000,
    "baseValue": 3050000,
    "beds": 6,
    "baths": 6.5,
    "sqft": 6450,
    "lotSizeSqft": 36000,
    "yearBuilt": 2021,
    "effectiveYearBuilt": 2024,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 2,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_1.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_1.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_5.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_2.jpg"
    ],
    "schoolRating": 9.9,
    "walkScore": 34,
    "transitScore": 28,
    "femaFloodZone": "Zone X (Elevated Plateau)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9432,
      "lng": -77.1654
    },
    "listingAgent": {
      "name": "Sarah Van Metre",
      "brokerage": "TTR Sotheby's International Realty McLean",
      "license": "VA-0221940",
      "phone": "(703) 555-0182",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Langley High School Pyramid (FCPS #1 Tier)",
        "impact": 110000,
        "description": "Highest ranked public secondary school in Virginia."
      },
      {
        "category": "Property Characteristics",
        "driver": "0.83-Acre Private Wooded Buffer & Heated Pool",
        "impact": 92000,
        "description": "Complete natural privacy in gated grounds with stone summer pavilion."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Custom Steel & Glass Pivot Entry + Sub-Zero/Wolf Suite",
        "impact": 68000,
        "description": "Commercial architectural finishes certified by Fairfax County LDS."
      }
    ],
    "permits": [
      {
        "id": "FFX-2021-9941",
        "type": "Custom Residential Estate New Construction",
        "cost": 1450000,
        "year": 2021,
        "status": "Finaled"
      },
      {
        "id": "FFX-2023-1120",
        "type": "Gunite Heated Pool & Spa Pavilion",
        "cost": 95000,
        "year": 2023,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-201",
        "address": "6820 Sorrel St",
        "price": 3350000,
        "distanceMi": 0.08,
        "similarity": 0.95,
        "soldDate": "2026-07-22",
        "sqft": 6400
      }
    ],
    "timeline": [
      {
        "year": 2021,
        "title": "New Construction Completed",
        "type": "built",
        "cost": 1450000,
        "description": "Architect-designed estate with commercial grade framing and spray foam insulation."
      },
      {
        "year": 2023,
        "title": "Pool & Outdoor Living Pavilion",
        "type": "permit",
        "cost": 95000,
        "description": "Heated saltwater pool with automatic safety cover and gas fireplace."
      },
      {
        "year": 2026,
        "title": "Listed on Bright MLS",
        "type": "listed",
        "cost": 3250000,
        "description": "Verified active luxury estate."
      }
    ],
    "healthScores": {
      "overall": 98,
      "structural": 100,
      "systems": 97,
      "energy": 96,
      "risk": 99,
      "maintenance": 98
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Langley High School / Cooper Middle (FCPS)",
      "schoolRating": 9.9,
      "metroDistanceMi": 2.4,
      "metroStation": "McLean Metro (Silver Line)",
      "appreciationVelocity1Yr": 6.8,
      "infrastructureNotes": "Prestigious diplomatic and executive corridor near CIA Headquarters and GW Parkway."
    },
    "negotiationData": {
      "buyerTargetOffer": 3195000,
      "buyerLeveragePoints": [
        "List price vs TrueValue shows reasonable valuation, but competing comps closed with 3% seller subsidy",
        "High real estate transfer taxes in Fairfax County provides negotiation lever"
      ],
      "suggestedContingency": "Standard appraisal contingency with a $35,000 gap guarantee given high model confidence (95%).",
      "sellerCounterOffer": 3250000,
      "sellerDefensePoints": [
        "Langley Forest inventory velocity is currently under 18 days of supply",
        "Replacement cost of 0.83-acre McLean parcel and custom construction exceeds $3.6M"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clear Title (First American Title Guaranty)",
      "openLiens": 0,
      "permittedRepairsCost": 1545000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 27,
      "hvacAgeYears": 3,
      "floodZoneCert": "FEMA Zone X - High Elevation Bedrock"
    },
    "investmentData": {
      "estimatedRent": 13500,
      "capRate": 3.8,
      "cashOnCash": 4.9,
      "netOperatingIncome": 118000,
      "fiveYearAppreciationPct": 29.8
    }
  },
  {
    "id": "nova-003",
    "mlsId": "BRIGHT-VAAL-2026-303",
    "title": "Historic Brick Townhouse in Old Town Alexandria",
    "address": "314 S St Asaph St",
    "city": "Alexandria",
    "state": "VA",
    "zip": "22314",
    "county": "City of Alexandria",
    "listPrice": 1385000,
    "trueValue": 1410000,
    "confidence": 93,
    "truthScore": 95,
    "rangeLow": 1365000,
    "rangeHigh": 1450000,
    "baseValue": 1320000,
    "beds": 3,
    "baths": 2.5,
    "sqft": 2480,
    "lotSizeSqft": 2100,
    "yearBuilt": 1885,
    "effectiveYearBuilt": 2022,
    "propertyType": "townhouse",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 1,
    "photoUrl": "https://photos.zillowstatic.com/fp/70faa542af47d0775cde9d18a855efde-cc_ft_1536.jpg",
    "gallery": [
      "https://photos.zillowstatic.com/fp/70faa542af47d0775cde9d18a855efde-cc_ft_1536.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/192/VAFX2323192_3.jpg"
    ],
    "schoolRating": 8.8,
    "walkScore": 96,
    "transitScore": 79,
    "femaFloodZone": "Zone X (Historic Bluff)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.8021,
      "lng": -77.0451
    },
    "listingAgent": {
      "name": "Harrison Wells",
      "brokerage": "McEnearney Associates Old Town",
      "license": "VA-0219401",
      "phone": "(703) 555-0133",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Historic Old Town Historic District Corridor",
        "impact": 64000,
        "description": "Two blocks to King Street retail, restaurants, and waterfront park."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Certified Historic Masonry Repointing & Copper Flashings",
        "impact": 34000,
        "description": "Alexandria Board of Architectural Review (BAR) approved restoration."
      },
      {
        "category": "Property Characteristics",
        "driver": "Private Brick Walled Courtyard Garden",
        "impact": 18000,
        "description": "Rare private outdoor space with brick herringbone paver patio."
      }
    ],
    "permits": [
      {
        "id": "ALX-BAR-2022-41",
        "type": "Historic Facade & Masonry Restoration",
        "cost": 48000,
        "year": 2022,
        "status": "Finaled"
      },
      {
        "id": "ALX-MEC-2020-19",
        "type": "High-Efficiency Mitsubishi Mini-Split Heat Pumps",
        "cost": 18500,
        "year": 2020,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-301",
        "address": "322 S St Asaph St",
        "price": 1395000,
        "distanceMi": 0.03,
        "similarity": 0.96,
        "soldDate": "2026-08-01",
        "sqft": 2450
      }
    ],
    "timeline": [
      {
        "year": 1885,
        "title": "Victorian Townhome Construction",
        "type": "built",
        "cost": 4500,
        "description": "Original hand-molded brick townhouse built in Old Town core."
      },
      {
        "year": 2008,
        "title": "Arms-Length Sale",
        "type": "sale",
        "cost": 890000,
        "description": "Recorded in City of Alexandria Clerk's Office."
      },
      {
        "year": 2020,
        "title": "Zoned Mini-Split Heat Pumps",
        "type": "permit",
        "cost": 18500,
        "description": "Preserved historic plaster while adding modern zoned cooling."
      },
      {
        "year": 2022,
        "title": "BAR Historic Masonry Sign-Off",
        "type": "renovation",
        "cost": 48000,
        "description": "Tuckpointing with lime mortar to preserve historic structural integrity."
      },
      {
        "year": 2026,
        "title": "Active Listing on TruePlace",
        "type": "listed",
        "cost": 1385000,
        "description": "Verified active with clean HomeTruth title report."
      }
    ],
    "healthScores": {
      "overall": 92,
      "structural": 94,
      "systems": 91,
      "energy": 86,
      "risk": 95,
      "maintenance": 94
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Alexandria City Public Schools (ACPS)",
      "schoolRating": 8.8,
      "metroDistanceMi": 0.65,
      "metroStation": "King St-Old Town Metro (Blue/Yellow Line)",
      "appreciationVelocity1Yr": 4.9,
      "infrastructureNotes": "Potomac River waterfront master plan enhancements with continuous walking promenade."
    },
    "negotiationData": {
      "buyerTargetOffer": 1360000,
      "buyerLeveragePoints": [
        "Street parking only (no dedicated garage space accounts for -$16,500 market deduction)",
        "Age of historic cast-iron sewer lateral pipe suggests sewer scope inspection contingency"
      ],
      "suggestedContingency": "Includes specialized historic home & sewer scope inspection contingency with 5-day resolution period.",
      "sellerCounterOffer": 1380000,
      "sellerDefensePoints": [
        "Alexandria BAR approval is rare and difficult; all masonry is certified for the next 25 years",
        "TrueValue AVM shows $1,410,000 baseline, indicating the property is priced under fair market value"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Historical Title (Recorded Alexandria Land Court)",
      "openLiens": 0,
      "permittedRepairsCost": 66500,
      "unpermittedFlags": 0,
      "roofRemainingYears": 19,
      "hvacAgeYears": 4,
      "floodZoneCert": "FEMA Zone X - High Elevation Bluff outside Waterfront Surge"
    },
    "investmentData": {
      "estimatedRent": 5400,
      "capRate": 3.9,
      "cashOnCash": 5.1,
      "netOperatingIncome": 47500,
      "fiveYearAppreciationPct": 24.2
    }
  },
  {
    "id": "nova-004",
    "mlsId": "BRIGHT-VAFX-2026-404",
    "title": "Custom Stone Country Residence in Great Falls",
    "address": "9814 Walker Lake Dr",
    "city": "Great Falls",
    "state": "VA",
    "zip": "22066",
    "county": "Fairfax County",
    "listPrice": 2890000,
    "trueValue": 2940000,
    "confidence": 93,
    "truthScore": 97,
    "rangeLow": 2850000,
    "rangeHigh": 3030000,
    "baseValue": 2740000,
    "beds": 5,
    "baths": 5.5,
    "sqft": 5800,
    "lotSizeSqft": 87120,
    "yearBuilt": 2019,
    "effectiveYearBuilt": 2023,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 3,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/VAAX2062464_2.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/VAAX2062464_2.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/VAAX2062464_1.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/VAAX2062464_3.jpg"
    ],
    "schoolRating": 9.8,
    "walkScore": 22,
    "transitScore": 15,
    "femaFloodZone": "Zone X (Elevated)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 39.0012,
      "lng": -77.2912
    },
    "listingAgent": {
      "name": "Evelyn Ross",
      "brokerage": "Long & Foster Great Falls",
      "license": "VA-0211822",
      "phone": "(703) 555-0177",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Property Characteristics",
        "driver": "2.0-Acre Private Wooded Parcel with Pond Views",
        "impact": 98000,
        "description": "Large acreage estate zoning in Great Falls near Georgetown Pike."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Langley High / Cooper Middle School Catchment",
        "impact": 65000,
        "description": "Premier FCPS public school district ranking."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Geothermal Ground-Source Heat Pump System",
        "impact": 42000,
        "description": "Zero net energy heating and cooling with $3,200/yr annual utility savings."
      }
    ],
    "permits": [
      {
        "id": "FFX-2019-4412",
        "type": "Single Family Residence & Septic Engineered Field",
        "cost": 1200000,
        "year": 2019,
        "status": "Finaled"
      },
      {
        "id": "FFX-2023-0911",
        "type": "Geothermal Well Drilling & Heat Pump Integration",
        "cost": 54000,
        "year": 2023,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-401",
        "address": "9820 Walker Lake Dr",
        "price": 2950000,
        "distanceMi": 0.12,
        "similarity": 0.94,
        "soldDate": "2026-06-18",
        "sqft": 5750
      }
    ],
    "timeline": [
      {
        "year": 2019,
        "title": "Estate Construction",
        "type": "built",
        "cost": 1200000,
        "description": "Full stone exterior construction with 3-car heated garage."
      },
      {
        "year": 2023,
        "title": "Geothermal System Upgrade",
        "type": "renovation",
        "cost": 54000,
        "description": "Closed-loop geothermal heat pumps installed with tax credits."
      },
      {
        "year": 2026,
        "title": "Listed Active",
        "type": "listed",
        "cost": 2890000,
        "description": "Priced competitively below TrueValue estimate."
      }
    ],
    "healthScores": {
      "overall": 97,
      "structural": 98,
      "systems": 98,
      "energy": 99,
      "risk": 96,
      "maintenance": 96
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Langley High School (FCPS)",
      "schoolRating": 9.8,
      "metroDistanceMi": 4.8,
      "metroStation": "Reston Town Center Metro (Silver Line)",
      "appreciationVelocity1Yr": 5.9,
      "infrastructureNotes": "Scenic parkway protection under Georgetown Pike Historic Byway statute."
    },
    "negotiationData": {
      "buyerTargetOffer": 2840000,
      "buyerLeveragePoints": [
        "Septic field inspection and well water potability testing required",
        "High square footage carrying costs provide price adjustment leverage"
      ],
      "suggestedContingency": "Includes specialized septic, well, and geothermal system operational certification.",
      "sellerCounterOffer": 2890000,
      "sellerDefensePoints": [
        "Geothermal system saves buyer $3,200 annually in operating expenses",
        "2.0-acre estate lots in Great Falls have zero future supply elasticity due to zoning restrictions"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Title & Boundary Survey Certified",
      "openLiens": 0,
      "permittedRepairsCost": 1254000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 24,
      "hvacAgeYears": 3,
      "floodZoneCert": "Zone X - Natural Rolling Topography"
    },
    "investmentData": {
      "estimatedRent": 11500,
      "capRate": 4.0,
      "cashOnCash": 4.8,
      "netOperatingIncome": 102000,
      "fiveYearAppreciationPct": 28.1
    }
  },
  {
    "id": "nova-005",
    "mlsId": "BRIGHT-VAFX-2026-505",
    "title": "Town of Vienna Modern Farmhouse Infill",
    "address": "412 Lawyers Rd NW",
    "city": "Vienna",
    "state": "VA",
    "zip": "22180",
    "county": "Fairfax County",
    "listPrice": 1150000,
    "trueValue": 1180000,
    "confidence": 92,
    "truthScore": 94,
    "rangeLow": 1145000,
    "rangeHigh": 1215000,
    "baseValue": 1090000,
    "beds": 4,
    "baths": 3.5,
    "sqft": 3200,
    "lotSizeSqft": 10500,
    "yearBuilt": 2017,
    "effectiveYearBuilt": 2023,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 2,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/192/VAFX2323192_3.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/192/VAFX2323192_3.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/192/VAFX2323192_1.jpg"
    ],
    "schoolRating": 9.3,
    "walkScore": 79,
    "transitScore": 54,
    "femaFloodZone": "Zone X (Minimal)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9054,
      "lng": -77.2712
    },
    "listingAgent": {
      "name": "Marcus Vance",
      "brokerage": "Redfin Premier Vienna",
      "license": "VA-0229412",
      "phone": "(703) 555-0155",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Madison High School & Town of Vienna Amenities",
        "impact": 45000,
        "description": "Walking distance to Church Street dining and W&OD recreational trail."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Finished Walk-Out Basement Suite with Wet Bar",
        "impact": 28000,
        "description": "Full permitted legal lower-level living suite with full egress window."
      },
      {
        "category": "Property Characteristics",
        "driver": "Attached 2-Car Garage with 240V Level 2 EV Charger",
        "impact": 17000,
        "description": "Pre-wired dedicated electric vehicle circuit."
      }
    ],
    "permits": [
      {
        "id": "TOV-2017-101",
        "type": "New Construction Infill Residence",
        "cost": 540000,
        "year": 2017,
        "status": "Finaled"
      },
      {
        "id": "TOV-2022-81",
        "type": "Basement Buildout & EV Charging Circuit",
        "cost": 42000,
        "year": 2022,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-501",
        "address": "418 Lawyers Rd NW",
        "price": 1165000,
        "distanceMi": 0.04,
        "similarity": 0.95,
        "soldDate": "2026-07-29",
        "sqft": 3150
      }
    ],
    "timeline": [
      {
        "year": 2017,
        "title": "Construction Finaled",
        "type": "built",
        "cost": 540000,
        "description": "Custom modern farmhouse built in Town of Vienna."
      },
      {
        "year": 2022,
        "title": "Finished Basement & EV Charger",
        "type": "renovation",
        "cost": 42000,
        "description": "Full lower-level suite added with town permits."
      },
      {
        "year": 2026,
        "title": "Active Listing",
        "type": "listed",
        "cost": 1150000,
        "description": "Listed at advantageous valuation relative to model."
      }
    ],
    "healthScores": {
      "overall": 94,
      "structural": 96,
      "systems": 93,
      "energy": 92,
      "risk": 96,
      "maintenance": 95
    },
    "neighborhoodTwin": {
      "fcpsCluster": "James Madison High School (FCPS)",
      "schoolRating": 9.3,
      "metroDistanceMi": 1.5,
      "metroStation": "Vienna/Fairfax-GMU Metro (Orange Line)",
      "appreciationVelocity1Yr": 5.1,
      "infrastructureNotes": "Town of Vienna municipal trash, leaf collection, and local police force services."
    },
    "negotiationData": {
      "buyerTargetOffer": 1135000,
      "buyerLeveragePoints": [
        "Town of Vienna property tax add-on rate ($0.12/$100) adds annual holding cost",
        "Competing homes along Lawyers Rd sold with 2% average seller concession"
      ],
      "suggestedContingency": "Includes standard 7-day home inspection with $5,000 deductible threshold.",
      "sellerCounterOffer": 1150000,
      "sellerDefensePoints": [
        "Model TrueValue indicates $1,180,000; listing is already under-priced by $30,000",
        "W&OD trail proximity commands strong buyer premium in Vienna"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Title Guarantee",
      "openLiens": 0,
      "permittedRepairsCost": 582000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 21,
      "hvacAgeYears": 6,
      "floodZoneCert": "Zone X - Zero Special Flood Hazard"
    },
    "investmentData": {
      "estimatedRent": 4800,
      "capRate": 4.3,
      "cashOnCash": 5.4,
      "netOperatingIncome": 44200,
      "fiveYearAppreciationPct": 25.1
    }
  },
  {
    "id": "nova-006",
    "mlsId": "BRIGHT-VAFX-2026-606",
    "title": "Mid-Century Lakefront Townhome in Reston / Lake Anne",
    "address": "11412 Waterview Cluster",
    "city": "Reston",
    "state": "VA",
    "zip": "20190",
    "county": "Fairfax County",
    "listPrice": 780000,
    "trueValue": 795000,
    "confidence": 91,
    "truthScore": 92,
    "rangeLow": 765000,
    "rangeHigh": 820000,
    "baseValue": 745000,
    "beds": 3,
    "baths": 2.5,
    "sqft": 2100,
    "lotSizeSqft": 1600,
    "yearBuilt": 1968,
    "effectiveYearBuilt": 2023,
    "propertyType": "townhouse",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 4,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/663/1001783663_21_2.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/663/1001783663_21_2.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/663/1001783663_21_1.jpg"
    ],
    "schoolRating": 8.9,
    "walkScore": 88,
    "transitScore": 72,
    "femaFloodZone": "Zone X (Lake Buffer)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9681,
      "lng": -77.3412
    },
    "listingAgent": {
      "name": "David Hayes",
      "brokerage": "Compass Reston",
      "license": "VA-0219941",
      "phone": "(703) 555-0188",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Property Characteristics",
        "driver": "Direct Lake Anne Water View & Private Dock",
        "impact": 44000,
        "description": "Rare waterfront dock mooring for electric boat or kayak."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Reston Town Center Silver Line Metro Access",
        "impact": 22000,
        "description": "Fast mass-transit link to Dulles Airport and Tysons."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Reston Association (RA) Certified Cedar Siding Resto",
        "impact": 15000,
        "description": "Complete exterior envelope restoration complying with RA design covenants."
      }
    ],
    "permits": [
      {
        "id": "FFX-2022-771",
        "type": "Interior Kitchen & Bath Gut Remodel",
        "cost": 65000,
        "year": 2022,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-601",
        "address": "11418 Waterview Cluster",
        "price": 790000,
        "distanceMi": 0.02,
        "similarity": 0.96,
        "soldDate": "2026-08-10",
        "sqft": 2080
      }
    ],
    "timeline": [
      {
        "year": 1968,
        "title": "Lake Anne Townhome Built",
        "type": "built",
        "cost": 28000,
        "description": "Iconic Robert E. Simon planned community architectural townhome."
      },
      {
        "year": 2011,
        "title": "Sale Transfer",
        "type": "sale",
        "cost": 495000,
        "description": "Recorded in Fairfax County deed office."
      },
      {
        "year": 2022,
        "title": "Complete Modern Interior Gut",
        "type": "renovation",
        "cost": 65000,
        "description": "Open concept kitchen, quartz center island, luxury bathrooms."
      },
      {
        "year": 2026,
        "title": "Listed on Market",
        "type": "listed",
        "cost": 780000,
        "description": "Verified active 48h listing."
      }
    ],
    "healthScores": {
      "overall": 90,
      "structural": 91,
      "systems": 89,
      "energy": 87,
      "risk": 93,
      "maintenance": 92
    },
    "neighborhoodTwin": {
      "fcpsCluster": "South Lakes High School (FCPS)",
      "schoolRating": 8.9,
      "metroDistanceMi": 1.1,
      "metroStation": "Reston Town Center Metro (Silver Line)",
      "appreciationVelocity1Yr": 4.8,
      "infrastructureNotes": "Reston Association provides 15 pools, 55 miles of paved pathways, and tennis complexes."
    },
    "negotiationData": {
      "buyerTargetOffer": 765000,
      "buyerLeveragePoints": [
        "Reston Association annual fee + Cluster HOA dues impact monthly DTI ratio",
        "Cluster exterior maintenance rules restrict exterior modifications"
      ],
      "suggestedContingency": "Standard HOA / Cluster document review contingency with 3-day right of rescission.",
      "sellerCounterOffer": 778000,
      "sellerDefensePoints": [
        "Waterfront townhomes on Lake Anne have less than 1% annual inventory turnover",
        "Renovated interior is 100% turnkey with zero deferred maintenance"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Title with Reston Association Certification",
      "openLiens": 0,
      "permittedRepairsCost": 65000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 17,
      "hvacAgeYears": 5,
      "floodZoneCert": "Zone X - Non-Special Flood Hazard Area"
    },
    "investmentData": {
      "estimatedRent": 3600,
      "capRate": 4.6,
      "cashOnCash": 6.1,
      "netOperatingIncome": 32500,
      "fiveYearAppreciationPct": 23.4
    }
  },
  {
    "id": "nova-007",
    "mlsId": "BRIGHT-VAFC-2026-707",
    "title": "Victorian Revival in City of Falls Church",
    "address": "208 E Columbia St",
    "city": "Falls Church",
    "state": "VA",
    "zip": "22046",
    "county": "City of Falls Church",
    "listPrice": 1275000,
    "trueValue": 1250000,
    "confidence": 93,
    "truthScore": 94,
    "rangeLow": 1220000,
    "rangeHigh": 1285000,
    "baseValue": 1180000,
    "beds": 4,
    "baths": 3.5,
    "sqft": 3050,
    "lotSizeSqft": 7500,
    "yearBuilt": 2012,
    "effectiveYearBuilt": 2022,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 1,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/912/MDMC2086912_3.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/912/MDMC2086912_3.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/912/MDMC2086912_1.jpg"
    ],
    "schoolRating": 9.7,
    "walkScore": 91,
    "transitScore": 68,
    "femaFloodZone": "Zone X (Minimal)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.8821,
      "lng": -77.1698
    },
    "listingAgent": {
      "name": "Elena Sterling",
      "brokerage": "Compass Falls Church",
      "license": "VA-0220194",
      "phone": "(703) 555-0166",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Falls Church City Schools (Meridian High Tier)",
        "impact": 58000,
        "description": "Independent municipal school district ranked #2 in Virginia."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Broad Street / Downtown Falls Church Walkability",
        "impact": 32000,
        "description": "Walking distance to farmers market, Whole Foods, and state theater."
      },
      {
        "category": "Property Characteristics",
        "driver": "Wraparound Front Porch & Detached 2-Car Garage",
        "impact": 21000,
        "description": "Historic aesthetic with modern garage convenience."
      }
    ],
    "permits": [
      {
        "id": "FCC-2022-19",
        "type": "Screened Rear Porch & Paver Patio",
        "cost": 38000,
        "year": 2022,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-701",
        "address": "216 E Columbia St",
        "price": 1260000,
        "distanceMi": 0.03,
        "similarity": 0.95,
        "soldDate": "2026-07-11",
        "sqft": 3000
      }
    ],
    "timeline": [
      {
        "year": 2012,
        "title": "Craftsman Construction Completed",
        "type": "built",
        "cost": 490000,
        "description": "Quality modern construction honoring historic architecture."
      },
      {
        "year": 2022,
        "title": "Screened Porch & Landscape",
        "type": "permit",
        "cost": 38000,
        "description": "Outdoor living space addition with municipal permit finaled."
      },
      {
        "year": 2026,
        "title": "Listed Active",
        "type": "listed",
        "cost": 1275000,
        "description": "Verified active listing in Falls Church City."
      }
    ],
    "healthScores": {
      "overall": 95,
      "structural": 97,
      "systems": 94,
      "energy": 93,
      "risk": 98,
      "maintenance": 95
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Falls Church City Public Schools (FCCPS)",
      "schoolRating": 9.7,
      "metroDistanceMi": 0.9,
      "metroStation": "East Falls Church Metro (Orange/Silver Line)",
      "appreciationVelocity1Yr": 5.6,
      "infrastructureNotes": "Independent jurisdiction status with high-efficiency municipal services."
    },
    "negotiationData": {
      "buyerTargetOffer": 1245000,
      "buyerLeveragePoints": [
        "List price ($1,275k) is slightly above TrueValue model valuation ($1,250k)",
        "Independent city real estate tax rate ($1.30/$100) provides leverage on net monthly payment"
      ],
      "suggestedContingency": "Includes appraisal contingency structured at fair TrueValue estimate.",
      "sellerCounterOffer": 1265000,
      "sellerDefensePoints": [
        "FCCPS school rankings drive exceptional long-term capital retention",
        "TruePlace Health Score is 95/100, certifying zero immediate capital expense needed"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clear Title Guaranteed",
      "openLiens": 0,
      "permittedRepairsCost": 528000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 18,
      "hvacAgeYears": 7,
      "floodZoneCert": "Zone X - Zero Flood Insurance Mandate"
    },
    "investmentData": {
      "estimatedRent": 5200,
      "capRate": 4.1,
      "cashOnCash": 5.2,
      "netOperatingIncome": 46800,
      "fiveYearAppreciationPct": 27.0
    }
  },
  {
    "id": "nova-008",
    "mlsId": "BRIGHT-VALD-2026-808",
    "title": "Solar Smart Estate in Ashburn Tech Corridor",
    "address": "42890 Creighton Rd",
    "city": "Ashburn",
    "state": "VA",
    "zip": "20148",
    "county": "Loudoun County",
    "listPrice": 895000,
    "trueValue": 885000,
    "confidence": 92,
    "truthScore": 93,
    "rangeLow": 860000,
    "rangeHigh": 910000,
    "baseValue": 840000,
    "beds": 5,
    "baths": 4,
    "sqft": 3650,
    "lotSizeSqft": 11500,
    "yearBuilt": 2020,
    "effectiveYearBuilt": 2024,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 2,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_1.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_1.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_2.jpg"
    ],
    "schoolRating": 9.2,
    "walkScore": 62,
    "transitScore": 48,
    "femaFloodZone": "Zone X (Minimal)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9912,
      "lng": -77.5121
    },
    "listingAgent": {
      "name": "David Hayes",
      "brokerage": "Keller Williams Loudoun Gateway",
      "license": "VA-0218820",
      "phone": "(703) 555-0199",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Renovation & Condition",
        "driver": "10.8kW Solar Array & Enphase Battery Storage",
        "impact": 32000,
        "description": "Near-zero net utility bills with certified interconnection permit."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Loudoun County Data Center & Tech Corridor Employment",
        "impact": 26000,
        "description": "High tech executive employment base near Ashburn data alley."
      },
      {
        "category": "Property Characteristics",
        "driver": "Main Level Guest In-Law Suite with Full Bath",
        "impact": 18000,
        "description": "High demand multi-generational living configuration."
      }
    ],
    "permits": [
      {
        "id": "LOU-2023-110",
        "type": "Rooftop Solar & Electrical Battery Backup",
        "cost": 38000,
        "year": 2023,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-801",
        "address": "42910 Creighton Rd",
        "price": 890000,
        "distanceMi": 0.08,
        "similarity": 0.94,
        "soldDate": "2026-07-19",
        "sqft": 3600
      }
    ],
    "timeline": [
      {
        "year": 2020,
        "title": "Brambleton Master Planned Home Built",
        "type": "built",
        "cost": 420000,
        "description": "Modern energy-efficient construction."
      },
      {
        "year": 2023,
        "title": "Solar & Battery Interconnection",
        "type": "permit",
        "cost": 38000,
        "description": "Clean energy installation finaled by Loudoun County inspectors."
      },
      {
        "year": 2026,
        "title": "Listed on Bright MLS",
        "type": "listed",
        "cost": 895000,
        "description": "48-hour active verified property."
      }
    ],
    "healthScores": {
      "overall": 96,
      "structural": 98,
      "systems": 97,
      "energy": 99,
      "risk": 96,
      "maintenance": 95
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Briar Woods High School (Loudoun County)",
      "schoolRating": 9.2,
      "metroDistanceMi": 2.1,
      "metroStation": "Ashburn Metro (Silver Line)",
      "appreciationVelocity1Yr": 5.7,
      "infrastructureNotes": "Broadband fiber to every home included in community master association."
    },
    "negotiationData": {
      "buyerTargetOffer": 875000,
      "buyerLeveragePoints": [
        "Brambleton community HOA fee includes high-speed fiber internet but adds to monthly carrying cost",
        "3 active competing townhome and single family homes within 0.5 miles"
      ],
      "suggestedContingency": "Solar lease/loan verification clause verifying system is 100% owned free and clear.",
      "sellerCounterOffer": 888000,
      "sellerDefensePoints": [
        "Solar array produces 13,500 kWh/year, cutting electric costs by $1,900/year",
        "Main level guest bedroom suite is rare in this price bracket"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Title & Solar System Owned Free & Clear",
      "openLiens": 0,
      "permittedRepairsCost": 38000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 24,
      "hvacAgeYears": 6,
      "floodZoneCert": "Zone X - Zero Special Hazard"
    },
    "investmentData": {
      "estimatedRent": 4100,
      "capRate": 4.5,
      "cashOnCash": 5.9,
      "netOperatingIncome": 38200,
      "fiveYearAppreciationPct": 26.2
    }
  },
  {
    "id": "nova-009",
    "mlsId": "BRIGHT-MDMC-2026-909",
    "title": "Custom Colonial in Bethesda / Edgemoor Corridor",
    "address": "7104 Exfair Rd",
    "city": "Bethesda",
    "state": "MD",
    "zip": "20814",
    "county": "Montgomery County",
    "listPrice": 1650000,
    "trueValue": 1690000,
    "confidence": 94,
    "truthScore": 96,
    "rangeLow": 1640000,
    "rangeHigh": 1740000,
    "baseValue": 1580000,
    "beds": 5,
    "baths": 4.5,
    "sqft": 3950,
    "lotSizeSqft": 9200,
    "yearBuilt": 2015,
    "effectiveYearBuilt": 2023,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 1,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/232/MDMC2153232_6.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/232/MDMC2153232_6.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/232/MDMC2153232_1.jpg"
    ],
    "schoolRating": 9.6,
    "walkScore": 86,
    "transitScore": 74,
    "femaFloodZone": "Zone X (Minimal)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9812,
      "lng": -77.1054
    },
    "listingAgent": {
      "name": "Jonathan Chen",
      "brokerage": "Compass Bethesda",
      "license": "MD-651120",
      "phone": "(301) 555-0144",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Bethesda Row Walkshed & Red Line Metro Access",
        "impact": 68000,
        "description": "Premier dining, shopping, and NIH/Walter Reed medical center access."
      },
      {
        "category": "Neighborhood Trends",
        "driver": "Walt Whitman / BCC High School Cluster",
        "impact": 44000,
        "description": "Top-tier Montgomery County Public Schools (MCPS) ranking."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Custom Screened Deck with Outdoor Gas Fireplace",
        "impact": 22000,
        "description": "Architectural outdoor living space permitted in 2023."
      }
    ],
    "permits": [
      {
        "id": "MC-DPS-2023-41",
        "type": "Screened Porch & Outdoor Fireplace",
        "cost": 44000,
        "year": 2023,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-901",
        "address": "7112 Exfair Rd",
        "price": 1680000,
        "distanceMi": 0.05,
        "similarity": 0.95,
        "soldDate": "2026-07-28",
        "sqft": 3900
      }
    ],
    "timeline": [
      {
        "year": 2015,
        "title": "Custom Infill Completed",
        "type": "built",
        "cost": 680000,
        "description": "High-end custom construction in prime Bethesda location."
      },
      {
        "year": 2023,
        "title": "Screened Porch & Deck",
        "type": "permit",
        "cost": 44000,
        "description": "Outdoor entertainment pavilion finaled by Montgomery County DPS."
      },
      {
        "year": 2026,
        "title": "Active Listing on Bright MLS",
        "type": "listed",
        "cost": 1650000,
        "description": "Maryland companion property to Northern Virginia corridor."
      }
    ],
    "healthScores": {
      "overall": 95,
      "structural": 97,
      "systems": 94,
      "energy": 93,
      "risk": 97,
      "maintenance": 96
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Walt Whitman / Bethesda-Chevy Chase (MCPS)",
      "schoolRating": 9.6,
      "metroDistanceMi": 0.8,
      "metroStation": "Bethesda Metro (Red Line / Purple Line Connection)",
      "appreciationVelocity1Yr": 5.8,
      "infrastructureNotes": "Direct access to capital beltway (I-495) and Capital Crescent Trail."
    },
    "negotiationData": {
      "buyerTargetOffer": 1625000,
      "buyerLeveragePoints": [
        "Montgomery County transfer and recordation taxes are among highest in DMV",
        "Days on market is 22 days vs sub-10 day median for prime Edgemoor"
      ],
      "suggestedContingency": "Includes standard 7-day home inspection with radon testing contingency.",
      "sellerCounterOffer": 1650000,
      "sellerDefensePoints": [
        "TrueValue ($1,690,000) indicates home is already offered at a $40,000 discount",
        "Walking distance to Bethesda Row provides permanent lifestyle value"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clean Title & Boundary Recorded",
      "openLiens": 0,
      "permittedRepairsCost": 724000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 19,
      "hvacAgeYears": 6,
      "floodZoneCert": "Zone X - Zero Special Flood Hazard"
    },
    "investmentData": {
      "estimatedRent": 6800,
      "capRate": 4.1,
      "cashOnCash": 5.2,
      "netOperatingIncome": 61500,
      "fiveYearAppreciationPct": 27.8
    }
  },
  {
    "id": "nova-010",
    "mlsId": "BRIGHT-VAFX-2026-1010",
    "title": "High-Tech Modern Infill in Tysons / Pimmit Hills",
    "address": "1918 Leonard Rd",
    "city": "Falls Church",
    "state": "VA",
    "zip": "22043",
    "county": "Fairfax County",
    "listPrice": 1050000,
    "trueValue": 1075000,
    "confidence": 92,
    "truthScore": 93,
    "rangeLow": 1040000,
    "rangeHigh": 1110000,
    "baseValue": 1010000,
    "beds": 4,
    "baths": 3.5,
    "sqft": 3100,
    "lotSizeSqft": 7800,
    "yearBuilt": 2021,
    "effectiveYearBuilt": 2024,
    "propertyType": "single_family",
    "status": "active",
    "isVerifiedActive": true,
    "lastVerifiedHoursAgo": 1,
    "photoUrl": "https://ssl.cdn-redfin.com/photo/235/bigphoto/886/MDMC2230886_1.jpg",
    "gallery": [
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/886/MDMC2230886_1.jpg",
      "https://ssl.cdn-redfin.com/photo/235/bigphoto/886/MDMC2230886_2.jpg"
    ],
    "schoolRating": 9.0,
    "walkScore": 72,
    "transitScore": 64,
    "femaFloodZone": "Zone X (Minimal)",
    "floodRiskLevel": "Minimal",
    "wildfireScore": 1,
    "coordinates": {
      "lat": 38.9112,
      "lng": -77.2054
    },
    "listingAgent": {
      "name": "Chloe Lindqvist",
      "brokerage": "Compass Tysons",
      "license": "VA-0228190",
      "phone": "(703) 555-0172",
      "isVerifiedPartner": true
    },
    "shapDrivers": [
      {
        "category": "Neighborhood Trends",
        "driver": "Tysons Corner Tech Hub & Silver Line Proximity (1.2 mi)",
        "impact": 42000,
        "description": "Direct access to Capital One HQ, shopping, and Metro rail."
      },
      {
        "category": "Renovation & Condition",
        "driver": "Pimmit Hills Infill Modern Architecture & 9ft Ceilings",
        "impact": 31000,
        "description": "Contemporary floor plan replacing original 1950s footprint."
      },
      {
        "category": "Property Characteristics",
        "driver": "Full Smart Home & Commercial EV Charging Ready",
        "impact": 14000,
        "description": "Lutron smart switches, dual zone Wi-Fi thermostats, and 50A garage outlet."
      }
    ],
    "permits": [
      {
        "id": "FFX-LDS-2021-99",
        "type": "Single Family Infill Construction",
        "cost": 490000,
        "year": 2021,
        "status": "Finaled"
      }
    ],
    "comparables": [
      {
        "id": "c-1001",
        "address": "1924 Leonard Rd",
        "price": 1065000,
        "distanceMi": 0.03,
        "similarity": 0.95,
        "soldDate": "2026-08-01",
        "sqft": 3050
      }
    ],
    "timeline": [
      {
        "year": 2021,
        "title": "Infill Replacement Completed",
        "type": "built",
        "cost": 490000,
        "description": "Replaced original 1952 rambler with contemporary 3-level residence."
      },
      {
        "year": 2026,
        "title": "Listed Active on Bright MLS",
        "type": "listed",
        "cost": 1050000,
        "description": "Priced below TrueValue estimate with 48h broker verification."
      }
    ],
    "healthScores": {
      "overall": 95,
      "structural": 97,
      "systems": 96,
      "energy": 94,
      "risk": 96,
      "maintenance": 95
    },
    "neighborhoodTwin": {
      "fcpsCluster": "Marshall High School (FCPS)",
      "schoolRating": 9.0,
      "metroDistanceMi": 1.2,
      "metroStation": "McLean Metro / Tysons Metro (Silver Line)",
      "appreciationVelocity1Yr": 6.2,
      "infrastructureNotes": "Pimmit Hills is undergoing the highest infill replacement velocity in Fairfax County."
    },
    "negotiationData": {
      "buyerTargetOffer": 1030000,
      "buyerLeveragePoints": [
        "Nearby neighborhood transition means some adjacent original 1950s homes remain",
        "Opportunity for closing cost concession in exchange for fast 21-day settlement"
      ],
      "suggestedContingency": "Standard 7-day inspection and financing contingency with pre-approved local lender.",
      "sellerCounterOffer": 1045000,
      "sellerDefensePoints": [
        "Tysons corridor is adding 15,000 corporate jobs over next 36 months",
        "TrueValue indicates $1,075,000 fair value, offering immediate built-in equity"
      ]
    },
    "homeTruthData": {
      "titleStatus": "Clear Infill Title Certified",
      "openLiens": 0,
      "permittedRepairsCost": 490000,
      "unpermittedFlags": 0,
      "roofRemainingYears": 25,
      "hvacAgeYears": 5,
      "floodZoneCert": "Zone X - Minimal Flood Risk Area"
    },
    "investmentData": {
      "estimatedRent": 4500,
      "capRate": 4.4,
      "cashOnCash": 5.7,
      "netOperatingIncome": 41200,
      "fiveYearAppreciationPct": 27.5
    }
  }
];

export function calculateInstantTrueValue(
  address: string,
  city: string,
  state: string,
  zip: string,
  beds: number,
  baths: number,
  sqft: number,
  listPrice?: number
): Property {
  // Northern Virginia & DMV specific pricing calibration
  const baseRatePerSqft: Record<string, number> = {
    'McLean': 515,
    'Great Falls': 505,
    'Arlington': 480,
    'Alexandria': 460,
    'Bethesda': 425,
    'Falls Church': 415,
    'Vienna': 370,
    'Reston': 375,
    'Tysons': 345,
    'Ashburn': 245,
  };

  const rate = baseRatePerSqft[city] || 380;
  const calculatedBase = sqft * rate;
  const bedBonus = beds >= 5 ? 45000 : beds >= 4 ? 30000 : beds >= 3 ? 18000 : 0;
  const bathBonus = baths >= 4 ? 35000 : baths >= 3 ? 22000 : baths >= 2 ? 14000 : 0;
  const trueVal = Math.round((calculatedBase + bedBonus + bathBonus) / 1000) * 1000;
  const targetPrice = listPrice || Math.round((trueVal * 1.02) / 1000) * 1000;

  return {
    id: `nova-live-${Date.now()}`,
    mlsId: `BRIGHT-VA-${Math.floor(10000 + Math.random() * 90000)}`,
    title: `Verified Northern Virginia Residence in ${city}`,
    address,
    city,
    state,
    zip,
    county: city === 'Arlington' ? 'Arlington County' : city === 'Alexandria' ? 'City of Alexandria' : city === 'Ashburn' ? 'Loudoun County' : city === 'Bethesda' ? 'Montgomery County' : 'Fairfax County',
    listPrice: targetPrice,
    trueValue: trueVal,
    confidence: 93,
    truthScore: 95,
    rangeLow: Math.round(trueVal * 0.97),
    rangeHigh: Math.round(trueVal * 1.03),
    baseValue: Math.round(trueVal * 0.92),
    beds,
    baths,
    sqft,
    lotSizeSqft: sqft * 3,
    yearBuilt: 2018,
    effectiveYearBuilt: 2023,
    propertyType: sqft > 2400 ? 'single_family' : 'townhouse',
    status: 'active',
    isVerifiedActive: true,
    lastVerifiedHoursAgo: 1,
    photoUrl: 'https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_5.jpg',
    gallery: [
      'https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_5.jpg',
      'https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_1.jpg',
      'https://ssl.cdn-redfin.com/photo/235/bigphoto/663/1001783663_21_2.jpg'
    ],
    schoolRating: 9.3,
    walkScore: 82,
    transitScore: 70,
    femaFloodZone: 'Zone X (Minimal)',
    floodRiskLevel: 'Minimal',
    wildfireScore: 1,
    coordinates: { lat: 38.8872, lng: -77.0965 },
    listingAgent: {
      name: 'TruePlace Verified NoVA Broker',
      brokerage: 'Premier Northern Virginia Alliance',
      license: 'VA-0229410',
      phone: '(703) 555-0199',
      isVerifiedPartner: true,
    },
    shapDrivers: [
      {
        category: 'Neighborhood Trends',
        driver: `${city} Metro Commuter Corridor Value`,
        impact: Math.round(trueVal * 0.04),
        description: 'Direct transit link into Washington DC and tech employment centers.',
      },
      {
        category: 'Renovation & Condition',
        driver: 'County Permitted Systems & Envelope Quality',
        impact: Math.round(trueVal * 0.035),
        description: 'Verified mechanical performance and modern insulation.',
      },
      {
        category: 'Comparable Sales',
        driver: 'Micro-Radius Comp Velocity (<0.3 mi)',
        impact: Math.round(trueVal * 0.02),
        description: 'Strong neighborhood comp support within Northern Virginia sub-market.',
      },
    ],
    permits: [
      {
        id: `LDS-${Date.now().toString().slice(-6)}`,
        type: 'Municipal Residential Systems Verification',
        cost: 28000,
        year: 2023,
        status: 'Finaled',
      },
    ],
    comparables: [
      {
        id: `c-${Date.now()}`,
        address: `Adjacent Home on ${address.split(' ')[1] || 'Oak'} St`,
        price: Math.round(targetPrice * 0.99),
        distanceMi: 0.1,
        similarity: 0.94,
        soldDate: '2026-08-01',
        sqft,
      },
    ],
    timeline: [
      { year: 2018, title: 'Construction Completed', type: 'built', cost: 420000, description: 'Engineered residential build finaled by county inspector.' },
      { year: 2023, title: 'Mechanical System Sign-Off', type: 'renovation', cost: 28000, description: 'High-efficiency heat pump and electrical panel upgrade.' },
      { year: 2026, title: 'Active Listing on TruePlace', type: 'listed', cost: targetPrice, description: 'Live verified active inventory.' }
    ],
    healthScores: {
      overall: 94,
      structural: 96,
      systems: 94,
      energy: 93,
      risk: 97,
      maintenance: 95
    },
    neighborhoodTwin: {
      fcpsCluster: `${city} High School Pyramid`,
      schoolRating: 9.3,
      metroDistanceMi: 1.2,
      metroStation: 'Silver/Orange Line Station Access',
      appreciationVelocity1Yr: 5.2,
      infrastructureNotes: 'High capital inflow and ongoing regional transit expansion.'
    },
    negotiationData: {
      buyerTargetOffer: Math.round((targetPrice * 0.98) / 1000) * 1000,
      buyerLeveragePoints: [
        'Model TrueValue provides precise fair market estimate with high confidence',
        'Inspection contingency recommended for sewer lateral and radon levels common in Virginia bedrock'
      ],
      suggestedContingency: 'Includes 7-day home inspection contingency with local certified Northern Virginia inspector.',
      sellerCounterOffer: targetPrice,
      sellerDefensePoints: [
        'TrueValue indicates home is fairly priced with verified mechanical sign-off',
        'Strong buyer absorption in Northern Virginia submarket'
      ]
    },
    homeTruthData: {
      titleStatus: 'Clean Title Chain Recorded',
      openLiens: 0,
      permittedRepairsCost: 28000,
      unpermittedFlags: 0,
      roofRemainingYears: 22,
      hvacAgeYears: 5,
      floodZoneCert: 'Zone X - Minimal Hazard Area'
    },
    investmentData: {
      estimatedRent: Math.round(targetPrice * 0.0045),
      capRate: 4.2,
      cashOnCash: 5.4,
      netOperatingIncome: Math.round(targetPrice * 0.038),
      fiveYearAppreciationPct: 26.0
    }
  };
}

// ----------------------------------------------------------------------------
// Enrichment Functions for Features 6 - 10
// ----------------------------------------------------------------------------

export function getEnrichedTrueCost(p: Property): TrueCostBreakdown {
  if (p.trueCostData) return p.trueCostData;

  // Real Northern Virginia tax rates per $100 assessed value
  let taxRate = 0.0105; // default 1.05%
  if (p.county.includes('Arlington')) taxRate = 0.0103;
  else if (p.county.includes('Fairfax')) taxRate = 0.0111;
  else if (p.county.includes('Alexandria')) taxRate = 0.0111;
  else if (p.county.includes('Loudoun')) taxRate = 0.0089;
  else if (p.county.includes('Montgomery')) taxRate = 0.0104;

  const loanAmount = p.listPrice * 0.8; // 20% down
  const annualRate = 0.06625; // 6.625% 30-year fixed benchmark
  const monthlyRate = annualRate / 12;
  const numPayments = 360;
  
  // Standard P&I formula
  const principalAndInterest = Math.round(
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );

  const monthlyPropertyTax = Math.round((p.listPrice * taxRate) / 12);
  const monthlyHazardInsurance = Math.round((p.listPrice * 0.0035) / 12);
  const monthlyFloodInsurance = p.floodRiskLevel === 'High' ? 240 : (p.floodRiskLevel === 'Moderate' ? 85 : 0);
  const monthlyHoaFee = p.propertyType === 'townhouse' ? 240 : (p.propertyType === 'condo' ? 480 : 45);
  const monthlyUtilities = Math.round(180 + p.sqft * 0.08); // heating, cooling, water, trash, gigabit fiber
  const monthlyMaintenanceReserve = Math.round(p.sqft * (1.0 / 12)); // industry rule: $1/sqft/yr
  const monthlyCommuteCost = p.neighborhoodTwin.metroDistanceMi < 1.0 ? 140 : 285; // Metro vs I-66/Dulles Tolls

  const totalMonthlyTrueCost =
    principalAndInterest +
    monthlyPropertyTax +
    monthlyHazardInsurance +
    monthlyFloodInsurance +
    monthlyHoaFee +
    monthlyUtilities +
    monthlyMaintenanceReserve +
    monthlyCommuteCost;

  const advertisedMortgageOnly = principalAndInterest;
  const hiddenMonthlyDifference = totalMonthlyTrueCost - advertisedMortgageOnly;

  return {
    principalAndInterest,
    propertyTax: monthlyPropertyTax,
    hazardInsurance: monthlyHazardInsurance,
    floodInsurance: monthlyFloodInsurance,
    hoaFee: monthlyHoaFee,
    utilities: monthlyUtilities,
    maintenanceReserve: monthlyMaintenanceReserve,
    commuteCost: monthlyCommuteCost,
    totalMonthlyTrueCost,
    advertisedMortgageOnly,
    hiddenMonthlyDifference
  };
}

export function getEnrichedHomeOS(p: Property): { appliances: HomeOSAppliance[]; maintenanceTasks: HomeOSMaintenanceTask[]; } {
  if (p.homeOSData) return p.homeOSData;

  const hvacInstalled = 2026 - p.homeTruthData.hvacAgeYears;
  const hvacRemaining = Math.max(0, 15 - p.homeTruthData.hvacAgeYears);
  const roofRemaining = p.homeTruthData.roofRemainingYears;
  const waterHeaterAge = Math.min(10, Math.max(2, p.homeTruthData.hvacAgeYears - 1));
  const waterHeaterRemaining = Math.max(0, 10 - waterHeaterAge);

  const appliances: HomeOSAppliance[] = [
    {
      id: 'app-hvac',
      name: 'Central Heat Pump & Air Handler',
      brand: 'Carrier Infinity 19 SEER2',
      model: '25VNA836A003',
      category: 'HVAC',
      installedYear: hvacInstalled,
      expectedLifeYears: 15,
      remainingLifeYears: hvacRemaining,
      replacementCostLow: 8200,
      replacementCostHigh: 11500,
      status: hvacRemaining <= 2 ? 'replace_soon' : (hvacRemaining <= 5 ? 'approaching_service' : 'optimal'),
      impactOnTrueValue: hvacRemaining <= 2 ? -4800 : (hvacRemaining <= 5 ? -1900 : 0),
      permitVerified: true,
      recommendation: hvacRemaining <= 2
        ? 'Unit approaching end-of-life. Begin replacement planning; deferred replacement will depress resale appraisal by ~$4,800.'
        : 'System in prime operational window. Maintain biannual coil cleaning and filter swaps.'
    },
    {
      id: 'app-roof',
      name: 'Architectural Shingle Roofing & Flashing',
      brand: 'GAF Timberline HDZ Class 4',
      model: 'High-Wind Dual Shadow',
      category: 'Roof',
      installedYear: 2026 - (25 - roofRemaining),
      expectedLifeYears: 25,
      remainingLifeYears: roofRemaining,
      replacementCostLow: 11000,
      replacementCostHigh: 16500,
      status: roofRemaining <= 3 ? 'replace_soon' : (roofRemaining <= 7 ? 'approaching_service' : 'optimal'),
      impactOnTrueValue: roofRemaining <= 3 ? -8500 : 0,
      permitVerified: true,
      recommendation: roofRemaining <= 3
        ? 'Shingle granular degradation flagged. Schedule drone inspection before winter freeze cycles.'
        : 'Good shingle adhesion and valley flashing integrity. Clear valley debris biannually.'
    },
    {
      id: 'app-water',
      name: 'Hybrid Electric Heat Pump Water Heater (50 Gal)',
      brand: 'Rheem Performance Platinum',
      model: 'PROPH50 T2 RH375-SO',
      category: 'Water',
      installedYear: 2026 - waterHeaterAge,
      expectedLifeYears: 10,
      remainingLifeYears: waterHeaterRemaining,
      replacementCostLow: 1800,
      replacementCostHigh: 2600,
      status: waterHeaterRemaining <= 2 ? 'replace_soon' : 'optimal',
      impactOnTrueValue: waterHeaterRemaining <= 2 ? -1200 : 0,
      permitVerified: true,
      recommendation: waterHeaterRemaining <= 2
        ? 'Internal sacrificial anode depleted. Replace within 18 months to prevent tank rupture.'
        : 'Optimal efficiency. Annual sediment flush recommended each October.'
    },
    {
      id: 'app-panel',
      name: 'Main Electrical Service Panel (200 Amp)',
      brand: 'Square D QO Breaker Center',
      model: 'QO142M200P',
      category: 'Electrical',
      installedYear: Math.max(p.yearBuilt, p.effectiveYearBuilt),
      expectedLifeYears: 35,
      remainingLifeYears: Math.max(12, 35 - (2026 - Math.max(p.yearBuilt, p.effectiveYearBuilt))),
      replacementCostLow: 3200,
      replacementCostHigh: 4600,
      status: 'optimal',
      impactOnTrueValue: 0,
      permitVerified: true,
      recommendation: 'Modern 200A copper bus panel verified with whole-home surge suppression and EV charger conduit.'
    }
  ];

  const maintenanceTasks: HomeOSMaintenanceTask[] = [
    {
      id: 'task-1',
      title: 'High-MERV HVAC Filter Replacement',
      frequency: 'Quarterly',
      season: 'Year-round',
      estimatedCost: 35,
      diyFriendly: true,
      dueDate: 'November 15, 2026',
      description: 'Swap MERV-13 air filter to maintain motor efficiency and air quality.'
    },
    {
      id: 'task-2',
      title: 'Fall Gutter & Downspout Cleanout',
      frequency: 'Biannual',
      season: 'Fall',
      estimatedCost: 150,
      diyFriendly: false,
      dueDate: 'December 1, 2026',
      description: 'Clear Virginia oak/pine needles and verify downspout discharge 6ft from foundation.'
    },
    {
      id: 'task-3',
      title: 'Exterior Hose Bib Frost-Free Winterization',
      frequency: 'Annual',
      season: 'Winter',
      estimatedCost: 0,
      diyFriendly: true,
      dueDate: 'November 20, 2026',
      description: 'Disconnect garden hoses and close interior shutoff valves before first freeze.'
    },
    {
      id: 'task-4',
      title: 'Sump Pump & Check Valve Diagnostics',
      frequency: 'Biannual',
      season: 'Spring',
      estimatedCost: 45,
      diyFriendly: true,
      dueDate: 'March 10, 2027',
      description: 'Pour 5 gallons of water into pit to test float switch and battery backup.'
    }
  ];

  return { appliances, maintenanceTasks };
}

export function getEnrichedCommunitySentiment(p: Property): { overallScore: number; metrics: CommunityVibeMetric[]; qaThreads: ResidentQuestionAnswer[]; } {
  if (p.communitySentimentData) return p.communitySentimentData;

  const overallScore = Math.min(97, Math.max(82, Math.round((p.schoolRating * 7) + (p.walkScore * 0.3))));

  const metrics: CommunityVibeMetric[] = [
    { category: 'Safety & Street Lighting', score: 94, benchmarkMetro: 86, summary: 'Very low incident rate; active civic association and neighborhood watch.' },
    { category: 'Traffic & Arterial Flow', score: p.walkScore > 80 ? 82 : 89, benchmarkMetro: 78, summary: 'Manageable peak rush volume; direct ingress onto parkways or Metro connectors.' },
    { category: 'Quiet & Nighttime Serenity', score: p.walkScore > 85 ? 84 : 95, benchmarkMetro: 80, summary: 'Sound buffer from major flight paths and minimal commercial cut-through.' },
    { category: 'Neighbor Warmth & Community', score: 92, benchmarkMetro: 83, summary: 'Frequent block parties, Halloween parades, and friendly active dog-walkers.' },
    { category: 'School Administration Responsiveness', score: Math.round(p.schoolRating * 10), benchmarkMetro: 84, summary: 'Strong PTA engagement and dedicated teacher-to-student ratios in FCPS/APS.' },
    { category: 'Parks, Trails & Green Space', score: 93, benchmarkMetro: 81, summary: 'Direct access to W&OD Trail, county community centers, and forested stream valleys.' }
  ];

  const qaThreads: ResidentQuestionAnswer[] = [
    {
      id: 'qa-1',
      question: 'How congested is morning street parking during elementary school drop-off?',
      askedBy: 'Prospective Buyer (Vienna, VA)',
      answer: 'Congestion is concentrated to an 18-minute window (8:25 - 8:43 AM). Crossing guards keep traffic moving smoothly, and the side streets remain 100% passable with dedicated driveway clearance.',
      answeredBy: 'Marcus E. (Verified Deed Owner, 7 yrs)',
      residentType: 'Verified Homeowner',
      yearsInNeighborhood: 7,
      upvotes: 24,
      verifiedResident: true
    },
    {
      id: 'qa-2',
      question: 'Are overhead power lines prone to outages during severe summer thunderstorms?',
      askedBy: 'Relocating Defense Tech Lead',
      answer: 'Dominion Energy buried the secondary feeder lines 3 years ago under county undergrounding grants. Since then, we have experienced zero flickers even during the July 2025 windstorms.',
      answeredBy: 'Sarah K. (Verified Resident)',
      residentType: 'Verified Homeowner',
      yearsInNeighborhood: 4,
      upvotes: 31,
      verifiedResident: true
    },
    {
      id: 'qa-3',
      question: 'Is it easy to bike or walk to the Metro station year-round?',
      askedBy: 'Federal Consultant',
      answer: 'Yes! The protected multi-use trail connects directly to the station platform without crossing any high-speed 4-lane boulevards. Sidewalks are plowed within 4 hours by county crews during snow.',
      answeredBy: 'Dave & Linda T.',
      residentType: 'Verified Resident',
      yearsInNeighborhood: 11,
      upvotes: 19,
      verifiedResident: true
    }
  ];

  return { overallScore, metrics, qaThreads };
}

export function getEnrichedInspectionRisk(p: Property): { riskScore: 'Low' | 'Moderate' | 'High'; overallConfidence: number; defects: InspectionDefectItem[]; } {
  if (p.inspectionRiskData) return p.inspectionRiskData;

  const isOldRoof = p.homeTruthData.roofRemainingYears <= 4;
  const isOldHvac = p.homeTruthData.hvacAgeYears >= 12;

  let riskScore: 'Low' | 'Moderate' | 'High' = 'Low';
  if (isOldRoof && isOldHvac) riskScore = 'High';
  else if (isOldRoof || isOldHvac || p.yearBuilt < 1960) riskScore = 'Moderate';

  const defects: InspectionDefectItem[] = [];

  if (p.homeTruthData.roofRemainingYears <= 6) {
    defects.push({
      id: 'insp-1',
      target: 'Roof Shingles & Valley Metal',
      severity: p.homeTruthData.roofRemainingYears <= 3 ? 'high' : 'medium',
      detectedIssue: 'Granule erosion and slight cupping detected on southern roof exposure slope.',
      imageUrl: 'https://ssl.cdn-redfin.com/photo/235/bigphoto/588/VAAR2058588_2.jpg',
      estimatedRepairCost: '$2,800 - $4,200',
      trueValueImpact: -3800,
      inspectorRecommendation: 'Request seller credit or replacement contingency prior to financing contingency expiration.'
    });
  }

  defects.push({
    id: 'insp-2',
    target: 'Foundation Perimeter Grading',
    severity: 'low',
    detectedIssue: 'Mulch bed depth on east elevation rests within 4 inches of siding threshold.',
    imageUrl: 'https://ssl.cdn-redfin.com/photo/235/bigphoto/464/1002955464_3.jpg',
    estimatedRepairCost: '$450 - $750',
    trueValueImpact: 0,
    inspectorRecommendation: 'Regrade soil to ensure 1 inch per foot positive fall away from foundation slab.'
  });

  if (p.homeTruthData.hvacAgeYears >= 10) {
    defects.push({
      id: 'insp-3',
      target: 'Heat Pump Exterior Condenser',
      severity: 'medium',
      detectedIssue: 'Condenser cooling fins exhibit surface oxidation; R-410A refrigerant cycle nearing phaseout standard.',
      imageUrl: 'https://ssl.cdn-redfin.com/photo/235/bigphoto/684/MDMC2082684_3.jpg',
      estimatedRepairCost: '$7,500 - $9,200',
      trueValueImpact: -4200,
      inspectorRecommendation: 'Recommend dedicated HVAC trade evaluation and home warranty rider.'
    });
  }

  return {
    riskScore,
    overallConfidence: 93,
    defects
  };
}

export function getEnrichedPropertyDNA(p: Property): PropertyDNARadar {
  if (p.propertyDNA) return p.propertyDNA;

  return {
    investmentPotential: Math.min(95, Math.round(p.investmentData.capRate * 15 + p.investmentData.fiveYearAppreciationPct * 1.2)),
    familySuitability: Math.min(98, Math.round(p.schoolRating * 7.5 + (p.beds >= 4 ? 20 : 12))),
    futureAppreciation: Math.min(96, Math.round(p.neighborhoodTwin.appreciationVelocity1Yr * 12 + 25)),
    riskLevel: p.floodRiskLevel === 'High' ? 48 : (p.floodRiskLevel === 'Moderate' ? 26 : 14),
    propertyHealth: p.healthScores.overall
  };
}
