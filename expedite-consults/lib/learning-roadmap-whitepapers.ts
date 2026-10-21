import { CareerLearningPath, LearningPathStep } from "./learning-platform-data"

export interface SkillDeepDiveSpec {
  skillName: string
  categoryBadge: string
  standardCode: string
  technicalSummary: string
  governingEquation: string
  fieldProtocol: string[]
  criticalTolerance: string
  toolingRequired: string
  failureMode: string
  pageNumber: number
}

export interface WhitePaperPageSection {
  heading: string
  body: string[]
  calloutTitle?: string
  calloutBody?: string
  codeOrFormulaBlock?: string
  tableData?: {
    headers: string[]
    rows: string[][]
  }
}

export interface WhitePaperPage {
  pageNumber: number
  pageTitle: string
  runningHeader: string
  wordCountEst: number
  summaryBadge: string
  sections: WhitePaperPageSection[]
}

export interface RoadmapStepWhitePaper {
  docId: string
  pathId: string
  pathTitle: string
  stepNumber: number
  stepTitle: string
  duration: string
  status: 'Completed' | 'In Progress' | 'Up Next'
  standardsBody: string
  authors: string
  publicationDate: string
  peerReviewId: string
  executiveSummary: string
  keyMetrics: {
    label: string
    value: string
    subtext: string
  }[]
  skillDeepDives: SkillDeepDiveSpec[]
  pages: WhitePaperPage[]
  fullMarkdown: string
}

interface StepDomainProfile {
  standardsBody: string
  peerReviewId: string
  executiveSummary: string
  governingEquations: string
  blueprintSchematic: string
  keyMetrics: { label: string; value: string; subtext: string }[]
  skillSpecs: Record<
    string,
    {
      categoryBadge: string
      standardCode: string
      technicalSummary: string
      governingEquation: string
      fieldProtocol: string[]
      criticalTolerance: string
      toolingRequired: string
      failureMode: string
    }
  >
  benchmarkTable: {
    headers: string[]
    rows: string[][]
  }
  troubleshootingMatrix: {
    headers: string[]
    rows: string[][]
  }
  citations: string[]
}

const STEP_DOMAIN_PROFILES: Record<string, StepDomainProfile> = {
  "path-trades-carpentry:1": {
    standardsBody: "AF&PA National Design Specification (NDS) · WCLIB Rule #17 · ASTM D4444 / D2395",
    peerReviewId: "TFG-WP-2026-STEP01",
    executiveSummary:
      "This 10-page monograph establishes the definitive wood science, cellular anatomy, hygroscopic moisture equilibrium, and slope-of-grain structural grading engineering required for heavy timber framing. Focusing on Free-of-Heart-Center (FOHC) Coastal Douglas Fir (Pseudotsuga menziesii), pin vs. dielectric moisture diagnostics below the 14% equilibrium threshold, and longitudinal tracheid grain deflection mechanics, this treatise equips Master Timber Joiners to eliminate post-erection seasonal checking, torsional twist, and brittle shear failure at mortise-and-tenon shoulders.",
    governingEquations: `// 1. Hygroscopic Dimensional Shrinkage Below Fiber Saturation Point (FSP ≈ 28%)
ΔD = D_initial × [ (MC_initial - MC_target) / FSP ] × S_coeff
// Coastal Douglas Fir Coefficients:
// Tangential Shrinkage (S_T) = 7.6% (0.076) | Radial Shrinkage (S_R) = 4.8% (0.048)
// Anisotropy Ratio (T/R) = 7.6 / 4.8 = 1.583

// 2. Hankinson's Formula for Compressive Strength at Angle θ to Grain
F_theta = (F_c * F_c_perp) / (F_c * sin²(theta) + F_c_perp * cos²(theta))

// 3. Adjusted Extreme Fiber Bending Design Value (NDS Section 4.3)
F'_b = F_b × C_D × C_M × C_t × C_L × C_F × C_fu × C_i × C_r
// Where for #1 FOHC Coastal Douglas Fir (MC < 19%):
// F_b = 1,500 psi | F_v (Horizontal Shear) = 180 psi | E = 1,700,000 psi`,
    blueprintSchematic: `===================================================================================
   CROSS-SECTIONAL ANATOMY: FREE-OF-HEART-CENTER (FOHC) COASTAL DOUGLAS FIR
===================================================================================
          [ OLD-GROWTH / SECOND-GROWTH LOG CANT (DIA > 28") ]
                   . - ~ ~ ~ - .
               . '   SAPWOOD     ' .
             /   . - ~ ~ ~ ~ - .     \\
            |  /  HEARTWOOD      \\    |  <-- Cut #1 FOHC Structural Cant
            | |   +-----------+   |   |      strictly outside juvenile pith zone
            | |   |8x12 FOHC  |   |   |      (Zero boxed heart; rings 8-16/inch)
            | |   +-----------+   |   |
            | |       ( * ) <-- PITH (Juvenile Wood Core: High Fibril Angle,
            | |   +-----------+   |   |       Severe Tangential Checking Risk)
            |  \\  |8x12 FOHC  |  /    |
             \\   '+-----------+'     /
               .    RING ORIENT    .
                 ' - . _ _ . - '

   MOISTURE GRADIENT DIAGNOSTIC PROFILE (8x12 TIMBER — KILN/AIR SEASONED):
   Surface Shell (Depth 1/2"):  11.8% MC  ]
   Quarter-Depth Zone (2.0"):   13.4% MC  ] --> PASS (< 14.0% Target Equilibrium)
   Core Geometric Center (4"):  14.9% MC  ]     Differential ΔMC = 3.1% (Safe)
===================================================================================`,
    keyMetrics: [
      { label: "Target Core Moisture", value: "< 14.0% MC", subtext: "ASTM D4444 Insulated Pin Depth @ 1/4 Thickness" },
      { label: "FOHC Design Bending (Fb)", value: "1,500 PSI", subtext: "WCLIB #1 Dense FOHC Douglas Fir (E = 1.7×10⁶ psi)" },
      { label: "Max Slope of Grain", value: "1 : 12 Ratio", subtext: "Max 4.76° Fiber Deflection Across Structural Zone" },
      { label: "Tangential / Radial Ratio", value: "1.58 T/R", subtext: "7.6% Tangential vs. 4.8% Radial Shrinkage to 0% MC" }
    ],
    skillSpecs: {
      "FOHC Douglas Fir": {
        categoryBadge: "STRUCTURAL TIMBER ANATOMY",
        standardCode: "WCLIB Rule #17 Para. 123-b / NDS Table 4D",
        technicalSummary:
          "Free-of-Heart-Center (FOHC) Coastal Douglas Fir (Pseudotsuga menziesii var. menziesii) is side-cut completely outside the central juvenile pith cylinder of large-diameter logs. Unlike boxed-heart timbers—where tangential shrinkage (7.6%) exceeds radial shrinkage (4.8%) around a stationary pith and forces a massive V-shaped relief check toward the nearest face—FOHC timbers exhibit uniform planar shrinkage, 35% lower torsional warp, and superior horizontal shear integrity (Fv = 180 psi) across mortise-and-tenon housing shoulders.",
        governingEquation: "Specific Gravity G_12% = 0.48 | E = 1.70 × 10^6 psi | F_b = 1,500 psi | F_c = 1,150 psi",
        fieldProtocol: [
          "Inspect both end-grain faces of every incoming cant to verify complete exclusion of the juvenile pith center and inner 10 growth rings.",
          "Count annual latewood/earlywood rings across a radial 3-inch gauge line: require 8 to 20 rings per inch with ≥ 33% dense summerwood for Dense #1 Select Structural certification.",
          "Orient the bark side (convex growth rings) toward the top compression face on horizontal tie beams and purlins, and orient the clearest heartwood face as the reference layout faces (Reference Face 1 & Reference Edge 2).",
          "Seal all freshly crosscut end-grain within 20 minutes of milling using high-solids microcrystalline wax emulsion (Anchorseal 2) to prevent rapid longitudinal tracheid capillary moisture loss and end checking."
        ],
        criticalTolerance: "0% Boxed Pith Permitted; ≥ 8 Growth Rings/Inch; End-Coat Within 20 Mins of Crosscut",
        toolingRequired: "10x End-Grain Hand Lens, WCLIB Grade Stamp Verification Gauge, Anchorseal 2 Pressure Sprayer",
        failureMode: "Boxed-heart timbers undergo differential circumferential tension as MC drops below 28% FSP, splitting directly through mortise walls and peg shear planes."
      },
      "Moisture Meters (<14%)": {
        categoryBadge: "HYGROSCOPIC DIAGNOSTICS",
        standardCode: "ASTM D4444 / ASTM D4933 / FPL GTR-190 Ch. 4",
        technicalSummary:
          "Wood is a hygroscopic, orthotropic biopolymer composed of cellulose, hemicellulose, and lignin. Bound water resides within cell walls up to the Fiber Saturation Point (FSP ≈ 28%–30% MC); free water occupies cell lumens above FSP. Dimensional shrinkage occurs strictly below FSP. Validating timber at <14% MC prior to layout ensures the timber is within 2%–3% of conditioned interior Equilibrium Moisture Content (EMC ≈ 8%–11%), preventing tenon shoulder loosening and mortise cheek gap formation.",
        governingEquation: "R_electrical ∝ exp(-b × MC) for 6% ≤ MC ≤ 28% | ΔDimension = D_0 × [(MC_i - MC_f) / 28] × S_T",
        fieldProtocol: [
          "Drive Teflon-insulated slide-hammer resistance pins (Delmhorst RDM-3 / 26-ES) parallel to the grain at a distance ≥ 20 inches from timber ends to avoid end-drying bias.",
          "Take three depth profile readings per timber: Shell (0.5 in), Quarter-Depth (T/4, standard average MC depth), and Core (T/2) to map the internal drying gradient.",
          "Apply ASTM D4444 species conductivity calibration for Coastal Douglas Fir and compensate for timber temperature (subtract ~0.1% MC per +1°C above 21°C / 70°F; add ~0.1% MC per -1°C below 21°C).",
          "Cross-scan full member lengths using a dual-depth electromagnetic dielectric capacitance meter (Wagner Orion 950) at 0.75-inch and 1.50-inch field depths to spot wet pockets around encased knots."
        ],
        criticalTolerance: "Quarter-Depth Average MC ≤ 14.0%; Core-to-Shell Gradient ΔMC ≤ 3.5%",
        toolingRequired: "Delmhorst RDM-3 with 26-ES Insulated Slide-Hammer Electrodes & Wagner Orion 950 Dielectric Scanner",
        failureMode: "Uninsulated pins short-circuit on damp surface condensation or kiln case-hardening, masking a 22% wet core that later shrinks 3.2 mm inside a finished joint."
      },
      "Grain Deflection Diagnostics": {
        categoryBadge: "MECHANICAL STRESS GRADING",
        standardCode: "ASTM D245 / NDS Clause 4.3.2 Slope-of-Grain",
        technicalSummary:
          "Because Douglas Fir tensile strength parallel to the grain (Ft) is nearly 40 times greater than tensile strength perpendicular to the grain (Ft⊥), even minor angular deviations between the longitudinal tracheid fiber axis and the geometric edge of the timber drastically degrade bending (Fb) and longitudinal shear (Fv) capacity. Grain deflection comprises both diagonal grain (from sawing crooked logs) and spiral grain (helical tree growth).",
        governingEquation: "Slope of Grain S = 1 / tan(θ) = L_run / 1_unit_rise | @ 1:12 Slope, Strength Ratio = 76% F_b",
        fieldProtocol: [
          "Draw a swivel-handle pivot scribe (fixed needle aligned to timber fibers) along a 24-inch section of both radial and tangential faces to trace true biological fiber flow rather than false growth-ring washout lines.",
          "Measure the perpendicular deviation (in inches) over a 12-inch longitudinal run: verify slope of grain is flatter than 1:12 (≤ 1 inch deviation in 12 inches) in Select Structural / #1 bending zones.",
          "Combine radial (diagonal) slope S_R and tangential (spiral) slope S_T using the vector root-sum-square formula: S_combined = √(S_R² + S_T²).",
          "Ensure zero knots > 1.5 inches or grain runout > 1:10 exist within 12 inches of any mortise housing, pegged tenon relish zone, or tension-face scarf joint."
        ],
        criticalTolerance: "Combined Slope of Grain ≤ 1:12 (Structural Posts/Braces) and ≤ 1:15 (Bottom Chord Tension Ties)",
        toolingRequired: "Swivel-Bit Timber Grain Scribe, 24-Inch Starrett Combination Square, Acoustic Stress-Wave Timer",
        failureMode: "Spiral grain exceeding 1:8 induces severe rotational wind (twist) during seasoning and precipitates sudden cross-grain tension fracture under snow load."
      }
    },
    benchmarkTable: {
      headers: ["Timber Grade / Condition", "Slope of Grain Limit", "Bending Fb (PSI)", "Shear Fv (PSI)", "Modulus E (PSI)", "Max Target MC (%)"],
      rows: [
        ["Dense Select Structural FOHC", "1 : 14 (4.08°)", "1,900 psi", "180 psi", "1,900,000 psi", "≤ 12.0% MC"],
        ["Select Structural FOHC", "1 : 12 (4.76°)", "1,600 psi", "180 psi", "1,800,000 psi", "≤ 14.0% MC"],
        ["No. 1 Dense FOHC (Guild Spec)", "1 : 12 (4.76°)", "1,500 psi", "180 psi", "1,700,000 psi", "≤ 14.0% MC"],
        ["No. 1 FOHC Timber", "1 : 10 (5.71°)", "1,350 psi", "180 psi", "1,600,000 psi", "≤ 15.0% MC"],
        ["No. 2 Boxed Heart (Non-Arch)", "1 : 8 (7.12°)", "900 psi", "180 psi", "1,300,000 psi", "≤ 19.0% MC (Reject)"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Deep V-Check Opening on Face", "Tangential vs. radial shrinkage stress around boxed juvenile pith", "Inspect end-grain for concentric ring closure", "Reject boxed heart for primary bents; cut Kerf relief on concealed upper face"],
        ["Pin Meter Reads 11%, Joint Shrinks", "Surface shell dried while core remained at 21% MC (Case-hardening)", "Drive insulated 26-ES pins to 2.0-inch quarter-depth", "Condition timber in equalizing kiln chamber (RH 55% @ 140°F) for 72 hours"],
        ["Splintering Tearout on Mortise Cheek", "Spiral grain runout > 1:8 across tangential face", "Pull swivel scribe 24 in along face to measure S_T", "Re-orient timber so grain rises into chisel cut or downgrade to non-tensile strut"],
        ["False High MC Reading (>18%)", "Surface condensation or water-borne borate preservative salts", "Compare dielectric scan vs. insulated core pin reading", "Wipe surface, use insulated pins below 0.25 in borate shell, apply temp offset"]
      ]
    },
    citations: [
      "USDA Forest Products Laboratory (FPL). Wood Handbook: Wood as an Engineering Material, General Technical Report FPL-GTR-282, Madison, WI.",
      "American Wood Council (AWC). National Design Specification (NDS) for Wood Construction & Supplement: Design Values for Wood Construction, 2024 Ed.",
      "West Coast Lumber Inspection Bureau (WCLIB). Standard Grading Rules for West Coast Lumber No. 17 (Beams, Stringers, Posts & Timbers).",
      "ASTM D4444-23: Standard Test Method for Laboratory Standardization and Calibration of Hand-Held Moisture Meters.",
      "Timber Framers Guild (TFG). Timber Frame Engineering Council (TFEC) Standard 1-2023: Structural Design of Heavy Timber Frames."
    ]
  },

  "path-trades-carpentry:2": {
    standardsBody: "TFEC 1-2023 · ANSI/AWC NDS Chapter 11 · Guild Traditional Joinery Standard",
    peerReviewId: "TFG-WP-2026-STEP02",
    executiveSummary:
      "This 10-page white paper details the structural mechanics and precision hand/machine execution of traditional mortise-and-tenon joinery locked via eccentric draw-boring. Covering riven White Oak (Quercus alba) octagonal trunnels, 1.5 mm to 3.0 mm offset draw-bore tensioning mechanics, chisel bevel geometry, tenon relish and edge distance calculations, and sub-1 mm housing shoulder tolerances, this guide establishes zero-slop structural timber connections.",
    governingEquations: `// 1. Peg / Trunnel Double-Shear Yield Modes (NDS Johansen Yield Model)
Z_parallel = D_peg² × F_em × k_y   (Bearing in Main & Side Members)
// Required Edge Distance (e_min) ≥ 4 × D_peg | Required End Relish (L_relish) ≥ 5 × D_peg

// 2. Eccentric Draw-Bore Clamping Pre-Load Force (F_draw)
F_draw = (3 × E_peg × I_peg × δ_offset) / L_shear³
// Optimal Draw-Bore Offset (δ_offset):
// Softwood Timber (Douglas Fir) + White Oak Peg: δ = 1.5 mm to 2.4 mm (1/16" to 3/32")`,
    blueprintSchematic: `===================================================================================
   ECCENTRIC DRAW-BORE MORTISE & TENON JOINT GEOMETRY (SUB-1MM SHOULDER FIT)
===================================================================================
         POST (8x8 FOHC DOUGLAS FIR)               TIE BEAM TENON (2" x 7.5" x 5.5")
        +---------------------------+             +-------------------------------+
        |       MORTISE CHEEK       |             |  HOUSED SHOULDER (0.5" Deep)  |
        |     +---------------+     |             |  +-------------------------+  |
        |     |   ( O )       | <---|-------------|->|    ( O )  <-- Offset    |  |
        |     |  Mortise Bore |     |             |  |  Tenon Bore shifted     |  |
        |     |  @ 2.000" Ref |     |             |  |  @ 1.906" (-3/32" /     |  |
        |     |               |     |             |  |  -2.4mm toward shoulder)|  |
        |     +---------------+     |             |  +-------------------------+  |
        +---------------------------+             +-------------------------------+
   WHITE OAK RIVEN OCTAGONAL TRUNNEL (1.00" Dia, 8% MC):
   - Tapered Nose (1.5" Lead) pulls offset tenon bore into concentricity,
     clamping housing shoulder under >1,800 lbf axial pre-tension.
===================================================================================`,
    keyMetrics: [
      { label: "Draw-Bore Eccentric Offset", value: "1.5 – 2.4 mm", subtext: "1/16\" to 3/32\" Shift Toward Tenon Shoulder" },
      { label: "Trunnel Moisture Target", value: "6% – 8% MC", subtext: "Kiln-Dried Riven White Oak (Swellets in 13% Timber)" },
      { label: "Shoulder Gap Tolerance", value: "< 0.50 mm", subtext: "Feeler Gauge Rejection Limit > 0.020 in Around Housing" },
      { label: "Minimum Tenon Relish", value: "≥ 5 × D_peg", subtext: "≥ 5.0 Inches Behind 1.0\" Peg to Prevent Relish Shear-Out" }
    ],
    skillSpecs: {
      "White Oak Octagonal Trunnels": {
        categoryBadge: "FASTENER METALLURGY / WOOD SCIENCE",
        standardCode: "TFEC Standard 1-2023 Sec. 6.4 / ASTM D143",
        technicalSummary:
          "Riven (split along natural medullary rays rather than sawn across grain) White Oak (Quercus alba) octagonal trunnels provide continuous end-to-end fiber continuity, yielding a bending modulus of rupture > 15,200 psi and specific gravity G = 0.68. Planing the peg to an octagonal cross-section circumscribed around the drilled hole diameter allows the eight arrises to crush slightly and lock into the Douglas Fir bore walls without splitting the mortise cheeks.",
        governingEquation: "D_octagon_flat_to_flat = D_bore + 0.4 mm (0.015 in) | L_relish ≥ 5.0 × D_bore",
        fieldProtocol: [
          "Split straight-grained White Oak billets radially along medullary rays using a froe and mallet so zero fiber runout crosses the peg shaft.",
          "Shave billets on a shaving horse with a drawknife or drive through an octagonal sizing plate to achieve uniform flat-to-flat dimension matching bore size.",
          "Condition finished White Oak pegs to 6%–8% MC in a warm drying box prior to installation so they absorb moisture from the 12%–14% Douglas Fir and swell tightly in situ.",
          "Chamfer the striking head at 30° to prevent mushrooming during sledge driving and taper the leading 1.5 inches of the nose to 0.75 × D_bore."
        ],
        criticalTolerance: "Zero Grain Runout Along Shaft; Moisture Content 6.0%–8.0% MC at Drive Time",
        toolingRequired: "Riving Froe, Drawknife, Starrett Dial Caliper, 1.00-Inch Brad-Point Auger Bit",
        failureMode: "Sawn pegs with diagonal grain shear cleanly in double-shear bending during draw-bore driving, leaving the joint unpinned internally."
      },
      "Mortise Chisel Work": {
        categoryBadge: "PRECISION HAND JOINERY",
        standardCode: "Guild Master Joiner Benchmark Spec MJ-02",
        technicalSummary:
          "Executing plumb, flat-walled mortises and crisp housing shoulders requires razor-honed Japanese Slick (Oire Nomi / Tsukinomis) and heavy framing chisels ground at a 30°–35° primary bevel for softwood end-grain shearing and 25° for paring long-grain cheeks. Proper relief chopping prevents levering against the visible mortise arris.",
        governingEquation: "Bevel Angle α = 30° (Chopping) / 25° (Paring) | Hollow Grind Back Flatness ≤ 0.0005 in",
        fieldProtocol: [
          "Score all layout shoulder lines deeply with a single-bevel striking knife before sawing or routing so surface fibers cannot tear beyond the gauge line.",
          "Evacuate 85% of mortise waste via chain mortiser or plunge auger bits stopped 2.0 mm shy of layout end walls and 1.5 mm shy of cheek lines.",
          "Chop end walls vertically using a 1.5-inch framing chisel held strictly plumb (verified against a polished steel square block), levering waste solely toward the center of the cavity.",
          "Pare mortise cheeks down to the knife line in two progressive passes, undercutting interior housing bottoms by 0.5°–1.0° so the perimeter shoulder bears with 100% contact."
        ],
        criticalTolerance: "Cheek Plumbness ±0.15° over 6.0 in Depth; Zero Levering Bruises on Show Arris",
        toolingRequired: "Barr Quarton 1.5\" & 2.0\" Framing Chisels, 2-3/8\" Timber Slick, Shapton 1000/8000 Waterstones",
        failureMode: "Convex mortise cheeks or bruised arrises force the tenon out of axial alignment and create visible gaps along the show shoulder."
      },
      "Sub-1mm Tolerances": {
        categoryBadge: "METROLOGY & QUALITY CONTROL",
        standardCode: "ISO 2768-m / TFEC Millwork Class A",
        technicalSummary:
          "Because heavy timber changes dimension slightly across the shop floor, layout is executed from two orthogonal Reference Faces (Face 1 & Edge 2) rather than measuring from opposite faces (Square Rule / Mill Rule). Controlling tenon thickness and shoulder plane coplanarity to < 0.50 mm ensures full compressive load transfer through the housing shoulders rather than overloading the wooden pegs.",
        governingEquation: "T_tenon = W_mortise - 0.25 mm (+0.00 / -0.25 mm) | Shoulder Coplanarity ≤ 0.40 mm",
        fieldProtocol: [
          "Establish Reference Face 1 and Reference Edge 2 on every timber using winding sticks to verify zero twist prior to snapping chalk lines.",
          "Reference all mortise depth, tenon cheek thickness, and shoulder depth measurements strictly from Reference Face 1 using a locking combination square and vernier depth gauge.",
          "Test tenon fit with an calibrated hardwood sizing block (Go/No-Go gauge) machined to 2.000 inches before moving the 400-lb beam for test assembly.",
          "Verify assembled shoulder closure around all four edges using a 0.015-inch (0.38 mm) steel feeler gauge after driving draw-bore trunnels."
        ],
        criticalTolerance: "Feeler Gauge Rejection > 0.50 mm (0.020 in) at Any Load-Bearing Shoulder Line",
        toolingRequired: "Winding Sticks, Starrett 12\" Combination Square, Mitutoyo Digital Calipers, Feeler Gauge Set",
        failureMode: "Cumulative layout errors from non-reference faces cause frame wracking and compound roof purlin misalignment."
      }
    },
    benchmarkTable: {
      headers: ["Timber Section", "Tenon Thickness", "Mortise Depth", "Peg Diameter", "Draw-Bore Offset", "Min End Relish"],
      rows: [
        ["6x6 Brace / Strut", "1.50 in (38.1 mm)", "3.50 in", "0.75 in (19 mm)", "1.5 mm (1/16\")", "3.75 in"],
        ["8x8 Principal Post", "2.00 in (50.8 mm)", "4.50 in", "1.00 in (25.4 mm)", "2.0 mm (5/64\")", "5.00 in"],
        ["8x12 Tie Beam", "2.00 in (50.8 mm)", "5.50 in", "1.00 in (25.4 mm)", "2.4 mm (3/32\")", "5.50 in"],
        ["10x14 Principal Rafter", "2.50 in (63.5 mm)", "6.50 in", "1.25 in (31.8 mm)", "2.4 mm (3/32\")", "6.25 in"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Peg Nose Shears Off During Drive", "Draw-bore offset > 3.5 mm or un-tapered peg tip", "Measure bore offset with pin gauge before assembly", "Ream transition step slightly with tapered pod auger; use 1.5\" nose taper"],
        ["Tenon Relish Splits Out End", "Peg placed < 4×D from tenon end or high driving velocity", "Measure relish length from bore center to tenon end", "Minimum 5×D relish required; install concealed cross-grain hardwood spline"],
        ["Shoulder Top Tight, Bottom Open", "Tenon shoulder cut out-of-square to Reference Edge", "Check shoulder with precision machinist square", "Undercut interior shoulder slightly and hand-plane high heel to knife line"]
      ]
    },
    citations: [
      "Brungraber, R. J. (1985). Traditional Timber Joinery: A Modern Analysis. Ph.D. Dissertation, Stanford University.",
      "Sobon, J. (2014). Timber Frame Construction: All About Post-and-Beam Building. Storey Publishing.",
      "TFEC 1-2023: Standard for Design of Timber Frame Structures, Timber Frame Engineering Council."
    ]
  },

  "path-trades-carpentry:3": {
    standardsBody: "Hawthorne Roof Framing Trigonometry · DIN 1052 · Cadwork 3D Timber CAM",
    peerReviewId: "TFG-WP-2026-STEP03",
    executiveSummary:
      "This 10-page white paper codifies compound 3D roof geometry, regular and irregular hip-valley pitch trigonometry, backing bevel and cheek cut derivations, Festool Domino XL DF 700 compound loose-tenon joinery, and 3D CAD/CAM timber takeoffs. Master framers learn to derive every roof angle from fundamental directional cosines without trial-and-error.",
    governingEquations: `// 1. Common Rafter Pitch Angle (θ_c) & Regular Hip/Valley Pitch Angle (θ_hv)
θ_c = arctan(Rise / Run_common)
θ_hv = arctan( sin(Plan_Angle) × tan(θ_c) )   // For 90° corner, Plan_Angle = 45°, Run_hv = √(12² + 12²) = 16.97"

// 2. Hip / Valley Backing Bevel Angle (β_back)
tan(β_back) = sin(θ_hv) / tan(Plan_Angle)

// 3. Jack Rafter Side / Cheek Cut Angle (α_cheek) & Saw Blade Tilt (ψ_tilt)
cos(α_cheek) = cos(θ_c) × sin(Plan_Angle) / √(1 - (cos(θ_c) × cos(Plan_Angle))²)
sin(ψ_tilt)  = sin(Plan_Angle) × cos(θ_c)`,
    blueprintSchematic: `===================================================================================
   COMPOUND HIP-VALLEY ROOF KERNEL TETRAHEDRON & BACKING BEVEL DEVELOPMENT
===================================================================================
                        [ RIDGE PEAK (Z = +Rise) ]
                                  /|\\
                                 / | \\
       Common Rafter Slope      /  |  \\     Hip Rafter Length = √(Run_X² + Run_Y² + Rise²)
       L_c = √(Run² + Rise²)   /   |   \\     Pitch θ_hv = arctan(Rise / 16.9706")
                              /    |    \\
                             /_____|_____\\
                       Run_Y (12")   Run_X (12" @ 45° Plan)

   HIP RAFTER BACKING BEVEL PROFILE:
        \\      /   <-- Unbacked Square Top Edge (Interferes with Roof Sheathing Plane)
      ___\\____/___ <-- Backed Top Plane (Beveled at Angle β_back = arctan(sin θ_hv))
     |            |    Drops Hip Centerline by: Drop = (W_hip / 2) × tan(β_back)
===================================================================================`,
    keyMetrics: [
      { label: "8:12 Common Pitch Angle", value: "33.69°", subtext: "Secant Factor = 1.2019 (14.42\" per 12\" Run)" },
      { label: "8:12 Regular Hip Pitch", value: "25.24°", subtext: "8\" Rise per 16.97\" Hip Run (18.76\" Length/ft)" },
      { label: "8:12 Hip Backing Bevel", value: "23.09°", subtext: "tan(β) = sin(25.24°) / tan(45°) — Zero Sheathing Gap" },
      { label: "Jack Rafter Compound Cut", value: "39.8° / 35.8°", subtext: "Miter Angle 39.8° · Saw Blade Bevel 35.8°" }
    ],
    skillSpecs: {
      "Compound Miter Angles": {
        categoryBadge: "3D ROOF TRIGONOMETRY",
        standardCode: "Chappell Universal Roof Framing Equations",
        technicalSummary:
          "Whenever an inclined purlin or jack rafter intersects a hip or valley rafter at an oblique plan angle, the resulting joint requires simultaneous control of the plumb cut, level seat cut, layout cheek angle on the timber face, and circular saw blade tilt angle. Mastering the roof kernel tetrahedron eliminates cumulative compound miter errors on heavy 16-inch circular beam saws.",
        governingEquation: "Miter M = arctan(cos(θ_c) / tan(Plan)) | Blade Bevel B = arcsin(sin(Plan) × sin(θ_c))",
        fieldProtocol: [
          "Construct the fundamental right-triangular roof kernel for both main and intersecting roof slopes before touching a framing square.",
          "Calculate true rafter line length per foot of common run and deduct half the perpendicular diagonal thickness of the ridge or hip timber.",
          "Lay out both top plumb line and side cheek bevel on all four faces using an Chappell Universal Square and digital angle protractor.",
          "Make test compound cuts on a sacrificial 4x8 offcut block to verify saw blade heel alignment and digital bevel zero prior to cutting prime FOHC rafters."
        ],
        criticalTolerance: "Compound Angular Accuracy ±0.10°; Line Length ±0.8 mm Over 24-Foot Rafter",
        toolingRequired: "Chappell Master Framing Square, Mafell MKS 185 Ec Beam Saw, Construction Master Pro",
        failureMode: "Forgetting to deduct the diagonal half-thickness of the hip at 45° leaves every jack rafter 0.414 × W_hip too long."
      },
      "Backing Bevels": {
        categoryBadge: "HIP & VALLEY PLANE GEOMETRY",
        standardCode: "Traditional Stereotomy & French Trait (L'Art du Trait)",
        technicalSummary:
          "Because a hip or valley rafter sits diagonally in plan view (typically 45° to the wall plates), its rectangular top surface rises higher on its outside edges (hip) or centerline (valley) than the intersecting roof sheathing planes. Planing the backing bevel (or dropping the hip vertically by the corresponding housing drop) brings the upper edges flush with both roof planes.",
        governingEquation: "tan(β_back) = sin(θ_hip) / tan(Plan_Angle) | Vertical Hip Drop = (Thickness / 2) × tan(β_back)",
        fieldProtocol: [
          "Compute backing bevel angle β1 and β2 independently for asymmetric (irregular pitch) roofs where Main Pitch ≠ Intersecting Pitch.",
          "Snap gauge lines along both upper arrises of the hip rafter at depth d = (W_hip / 2) × tan(β_back) measured parallel to the plumb cut.",
          "Plane the two upper chamfers to meet at the ridge centerline using a 12-inch power timber planer (Makita KP312) set on a beveled guide shoe.",
          "Verify backing accuracy by laying a 4-foot straightedge across two adjacent jack rafters and confirming full planar contact across the backed hip face."
        ],
        criticalTolerance: "Sheathing Plane Coplanarity ≤ 1.0 mm Across Hip/Valley Intersection",
        toolingRequired: "Makita KP312 12-1/4\" Timber Planer, Starrett Bevel Protractor, 6-Foot Aluminum Straightedge",
        failureMode: "Unbacked hip rafters hump the structural insulated panels (SIPs) along the hip line, breaking airtight panel splines."
      },
      "Timber CAD Takeoffs": {
        categoryBadge: "3D BIM / CAM DIGITAL TWIN",
        standardCode: "IFC4 / BTLx 1.1 CNC Timber Exchange Format",
        technicalSummary:
          "Modern heavy timber fabrication bridges traditional layout with 3D parametric CAD/CAM (Cadwork 3D, Dietrich's, HSBCAD). Modeling every joint in 3D generates collision-checked single-piece shop drawings, board-foot optimization nests, center-of-gravity crane pick coordinates, and Festool Domino XL / Hundegger K2i CNC toolpaths.",
        governingEquation: "Board Feet (BF) = (Nominal_T_in × Nominal_W_in × Length_ft) / 12 | Waste Factor = +12% to +18%",
        fieldProtocol: [
          "Model reference axes (System Lines) at top-of-plate and outside-of-post reference planes before extruding 3D timber volumes.",
          "Assign BTLx parametric boolean joinery macros (housed mortise-and-tenon, birdsmouth, compound valley seat, Festool Domino 14x140mm twin tenons) with 0.25 mm clearance.",
          "Run automated 3D clash detection on all draw-bore peg paths, steel knife plates, and through-bolts to verify zero fastener collision inside compound corner posts.",
          "Export single-timber piece drawings (1:10 scale) with cumulative layout dimensions referenced strictly from End 0 and Reference Face 1."
        ],
        criticalTolerance: "0.0 mm Fastener Clash; 100% Cumulative Dimensioning from Single Datum End",
        toolingRequired: "Cadwork 3D Timber CAD, Leica 3D Disto Total Station, Festool Domino XL DF 700",
        failureMode: "Chain-dimensioning piece drawings causes rounding errors to stack up, shifting ridge mortises by >6 mm."
      }
    },
    benchmarkTable: {
      headers: ["Common Roof Pitch", "Common Angle (θc)", "Regular Hip Angle (θhv)", "Hip Backing Bevel (β)", "Jack Cheek Miter", "Jack Saw Tilt"],
      rows: [
        ["6 : 12 Pitch", "26.57°", "19.47°", "18.43°", "41.81°", "30.00°"],
        ["8 : 12 Pitch", "33.69°", "25.24°", "23.09°", "39.81°", "35.79°"],
        ["10 : 12 Pitch", "39.81°", "30.51°", "26.92°", "37.54°", "40.09°"],
        ["12 : 12 Pitch", "45.00°", "35.26°", "30.00°", "35.26°", "45.00°"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Compound Cut Opens on Bottom Cheek", "Circular saw blade deflected outward on entry or bevel calibration off by 0.5°", "Check blade perpendicularity with digital angle cube", "Score entry kerf 3 mm deep first, then feed saw steadily at constant amperage"],
        ["Irregular Valley Wanders Off Plan Corner", "Equal overhang kept on unequal pitches without plate height offset", "Verify plan angle arctan(Pitch_A / Pitch_B)", "Raise lower-pitch wall plate or shift valley seat centerline per kernel math"],
        ["Domino XL Mortises Misaligned on Hip", "Referenced from unbacked top arris instead of plumb cheek scribe", "Check gauge distance from Reference Face 1", "Always register Domino XL fence against true plumb layout line"]
      ]
    },
    citations: [
      "Chappell, S. (2012). A Timber Framer's Workshop: Joinery, Design & Construction of Traditional Timber Frames. Fox Maple Press.",
      "Simmonds, P. (2021). Stereotomy & L'Art du Trait in Heavy Timber Roof Framing. Guild Monograph Series.",
      "Festool GmbH. Domino XL DF 700 EQ Structural Sipo/Beech Loose-Tenon Pullout Technical Dossier."
    ]
  },

  "path-trades-carpentry:4": {
    standardsBody: "OSHA 29 CFR 1926 Subpart CC & H · ASME B30.5 Mobile Cranes · ASME B30.9 Slings",
    peerReviewId: "TFG-WP-2026-STEP04",
    executiveSummary:
      "This 10-page white paper governs heavy timber structural rigging, crane pick center-of-gravity (CG) physics, spreader bar sling tension calculations, ASME B30.5 hand/radio crane signaling, and multi-bent erection sequencing. Master framers learn to calculate dynamic boom load charts, eliminate inward compressive chord crushing on timber tie beams using spreader beams, and safely land 4,500-lb pre-assembled Douglas Fir bents onto anchor pockets.",
    governingEquations: `// 1. Sling Leg Tension Force as Function of Horizontal Sling Angle (θ)
T_leg = (W_total_bent / N_active_legs) / sin(θ_horizontal)
// At θ = 60°: T_leg = 0.577 × W_total  (Safe Guild Standard)
// At θ = 30°: T_leg = 1.000 × W_total  (100% Bent Weight in EACH Leg — Prohibited without Spreader!)

// 2. Timber Bent Mass & Center of Gravity (CG) Coordinate Calculation
W_timber = Volume_ft³ × 38.5 lb/ft³ (Coastal Douglas Fir @ 14% MC)
X_CG = ∑(W_i × X_i) / ∑W_i   |   Z_CG = ∑(W_i × Z_i) / ∑W_i`,
    blueprintSchematic: `===================================================================================
   HEAVY TIMBER BENT CRANE PICK & SPREADER BAR RIGGING GEOMETRY (ASME B30.9)
===================================================================================
                        [ CRANE MAIN HOOK BLOCK ]
                                  /   \\
            Top Bridle Slings    / 60° \\   T_leg = (W / 2) / sin(60°) = 0.577 W
                                /       \\
            +==================O=========O==================+
            |      STEEL SPREADER BAR (W8x24 — 20 FT)       |
            +==================O=========O==================+
            |  Vertical Drop   |         |  Vertical Drop   |
            |  Synthetic Choker|         |  Synthetic Choker| (Zero Horizontal Crush)
            v                  v         v                  v
         +-----------------------------------------------------+
         |              8x12 TOP TIE / PRINCIPAL RAFTER        |
         |    [CG *]                                           |
         |   8x8 POST                               8x8 POST   |
         +-----------------------------------------------------+`,
    keyMetrics: [
      { label: "Min Horizontal Sling Angle", value: "≥ 60.0°", subtext: "Tension Multiplier ≤ 1.155 (Never Rig Below 45°)" },
      { label: "Synthetic Sling Safety Factor", value: "5 : 1 WLL", subtext: "ASME B30.9 Choker Hitch Derated to 80% Vertical WLL" },
      { label: "Douglas Fir Unit Density", value: "38.5 lb/ft³", subtext: "3.21 lbs per Board Foot at 14% Moisture Content" },
      { label: "Max Wind Speed for Picks", value: "≤ 20 MPH", subtext: "Mandatory Crane Stand-Down Above 20 MPH Gusts" }
    ],
    skillSpecs: {
      "OSHA Rigging": {
        categoryBadge: "STRUCTURAL RIGGING & SLING PHYSICS",
        standardCode: "OSHA 29 CFR 1926.251 / ASME B30.9",
        technicalSummary:
          "Rigging finished architectural heavy timbers requires non-marring Endless Polyester Roundslings (EN 1492-2 / ASME B30.9) protected by Cordura wear sleeves and leather corner softening pads at every timber arris. Calculating choker hitch derating (0.80 × Vertical WLL) and sling angle tension amplification prevents catastrophic strap rupture during bent rotation from horizontal to vertical.",
        governingEquation: "WLL_effective = WLL_vertical × C_hitch (0.80 Choker) × N_legs × sin(θ_horizontal)",
        fieldProtocol: [
          "Inspect every polyester roundsling and shackle prior to shift for UV degradation, acid burns, cut outer jackets, or illegible WLL tags; immediately cut in half any rejected sling.",
          "Wrap timber pick points with 1/4-inch vulcanized rubber or heavy leather corner protectors so sharp 90° timber arrises cannot sever load-bearing polyester yarn fibers.",
          "Place choker bites strictly at calculated X_CG equidistant points above the bent Center of Gravity so the bent hangs within ±1.0° of plumb.",
          "Attach two independent 5/8-inch braided polypropylene taglines (minimum length 1.5 × bent height) to bottom post bases for ground-crew rotational control."
        ],
        criticalTolerance: "5:1 Working Load Limit Factor of Safety; 0° Uncontrolled Load Spin",
        toolingRequired: "Lift-All Tuflex Polyester Roundslings, Crosby G-209 Screw-Pin Shackles, Digital Crane Load Cell",
        failureMode: "Choking directly around unprotected 90° timber arrises without corner pads reduces sling breaking strength by >45%."
      },
      "Spreader Bars": {
        categoryBadge: "BELOW-THE-HOOK LIFTING DEVICES",
        standardCode: "ASME B30.20 / BTH-1 Design of Below-the-Hook Lifting Devices",
        technicalSummary:
          "When lifting wide-span timber bents or long King-Post trusses (spans > 20 ft), a simple two-legged bridle attached directly to the crane hook induces severe inward horizontal compressive forces (F_horiz = W / (2 × tan θ)) that can buckle upper chords or pop joinery pegs before the plates are pinned. A certified steel spreader bar converts below-bar drops to pure 90° vertical tension.",
        governingEquation: "F_compression_bar = (W_load / 2) × cot(θ_top_bridle) | Below-Bar Sling Angle = 90.0°",
        fieldProtocol: [
          "Select an ASME B30.20 PE-stamped modular tubular or wide-flange steel spreader beam matched to the principal post spacing of the timber bent.",
          "Rig the upper wire-rope bridle at ≥ 60° horizontal angle between the crane hook and top spreader shackles; rig lower polyester slings vertically (90°) to the timber tie beam.",
          "Verify that upper shackle pins seat against the shackle bow (never load shackle pins in bending across asymmetrical straps).",
          "Perform a 6-inch static 'Test Lift & Hold' for 60 seconds to verify brake holding, CG balance, and zero timber deflection before booming up."
        ],
        criticalTolerance: "90° ± 2° Vertical Lower Drop Slings; Zero Inward Chord Bending Moment",
        toolingRequired: "Modular ASME B30.20 Spreader Bar (10-Ton WLL), Crosby Alloy Bolt-Type Shackles",
        failureMode: "Bridle lifting a 32-ft timber truss at a 30° sling angle without a spreader bar subjects the upper chords to 86% of total truss weight in lateral compression."
      },
      "Bent Erection Sequencing": {
        categoryBadge: "CRANE OPERATIONS & ERECTION ENGINEERING",
        standardCode: "OSHA 1926.1400 Cranes & Derricks / TFEC Erection Manual",
        technicalSummary:
          "Safe heavy timber frame raising follows a deterministic three-dimensional stability sequence: Bent 1 and Bent 2 are raised first and immediately tied together with wall plates, girts, and knee braces to create a self-supporting 3D structural bay before the crane unhooks from Bent 2.",
        governingEquation: "Temporary Guy Bracing Capacity ≥ 1.5 × Wind_Load_25mph_on_Exposed_Bent_Area",
        fieldProtocol: [
          "Conduct pre-lift tailgate briefing establishing a single designated Qualified Signal Person (ASME B30.5 hand and dedicated VHF channel signals).",
          "Raise Bent 1, seat post base tenons/steel knife plates, and secure with two opposing pairs of 5/8-inch wire-rope come-along guy lines anchored at 45° to deadman ground anchors.",
          "Fly Connecting Bay 1-2 girts, wall plates, and diagonal knee braces immediately upon raising Bent 2; drive and pin all structural White Oak trunnels before releasing crane tension.",
          "Continuously monitor post plumbness in both X and Y axes using a dual-axis Leica laser total station as sequential bents are tied in."
        ],
        criticalTolerance: "Frame Plumbness ≤ H / 500 (≤ 3.0 mm per 5m Post Height); Zero Unbraced Free-Standing Bents",
        toolingRequired: "40-Ton Hydraulic Truck Crane, 3-Ton Lug-All Cable Ratchet Winches, Dedicated VHF Headsets",
        failureMode: "Uncoupling the crane hook from an un-guyed or un-braced single bent causes catastrophic domino collapse under a 12 mph wind gust."
      }
    },
    benchmarkTable: {
      headers: ["Horizontal Sling Angle (θ)", "Tension Factor (1 / sin θ)", "Load per Leg (4,000 lb Bent)", "Inward Crush Force", "Guild Rigging Status"],
      rows: [
        ["90° (With Spreader Bar)", "1.000 × (W/2)", "2,000 lbf", "0 lbf", "OPTIMAL (Preferred for Trusses)"],
        ["60° Bridle Angle", "1.155 × (W/2)", "2,310 lbf", "1,155 lbf", "APPROVED (Standard Minimum)"],
        ["45° Bridle Angle", "1.414 × (W/2)", "2,828 lbf", "2,000 lbf", "CAUTION (Engineering Approval Req)"],
        ["30° Bridle Angle", "2.000 × (W/2)", "4,000 lbf", "3,464 lbf", "PROHIBITED (Critical Crush Risk)"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Bent Tilts >5° During Test Pick", "Pick points asymmetric to true X_CG due to heavy knee braces on one side", "Lower to cribbing; measure horizontal distance from CG", "Shift choker hitch 4–8 inches toward heavy side and re-test 6-inch hover"],
        ["Post Base Tenons Bind in Sill Mortise", "Bent hanging slightly out-of-level during vertical drop", "Check tie beam level with 6-ft spirit level", "Adjust chain fall micro-hoist on one spreader drop leg for ±1 mm parallel entry"],
        ["Girt Tenons Won't Seat Between Bents", "Bent 1 guyed out-of-plumb by over-tensioned come-along", "Shoot post top with laser transit", "Ease turnbuckle on high-side guy cable while drawing joint home with timber Come-Along"]
      ]
    },
    citations: [
      "ASME B30.5-2024: Mobile and Locomotive Cranes & ASME B30.9-2024: Slings Safety Standard.",
      "OSHA 29 CFR 1926 Subpart CC: Cranes and Derricks in Construction.",
      "Timber Framers Guild. Heavy Timber Frame Raising & Rigging Field Safety Manual."
    ]
  },

  "path-trades-carpentry:5": {
    standardsBody: "ASCE/SEI 7-22 Minimum Design Loads · IBC 2024 · AWC NDS Special Wind & Seismic Provisions",
    peerReviewId: "TFG-WP-2026-STEP05",
    executiveSummary:
      "This 10-page white paper covers structural PE-stamped load path engineering for heavy timber structures subjected to 45 PSF ground/roof snow loads, 115 MPH ultimate wind uplift envelopes, and seismic lateral drift demands. Practitioners master tributary load tracing, concealed steel knife-plate dowel bearing equations, and hold-down anchor tie installations.",
    governingEquations: `// 1. ASCE 7-22 Balanced & Drifted Flat Roof Snow Load (p_f)
p_f = 0.7 × C_e × C_t × I_s × p_g   (For p_g = 45 psf, C_e = 1.0, C_t = 1.1, I_s = 1.1 => p_f = 38.1 psf; Min Design = 45 psf)

// 2. ASCE 7-22 Wind Velocity Pressure (q_z) at 115 MPH Ultimate Wind Speed (V)
q_z = 0.00256 × K_z × K_zt × K_d × K_e × V²   (@ V = 115 mph, q_h ≈ 28.8 psf; Net Roof Corner Uplift ≈ -54.2 psf)

// 3. LRFD / ASD Load Combinations & Net Uplift Hold-Down Tension (T_net)
Uplift Combination (ASD): 0.6 Dead (D) + 0.6 Wind_Uplift (W)  =>  T_anchor ≥ F_uplift - 0.6 × W_dead`,
    blueprintSchematic: `===================================================================================
   CONTINUOUS VERTICAL & LATERAL LOAD PATH: ROOF PEAK TO FOUNDATION PEDESTAL
===================================================================================
      [ 45 PSF SNOW LOAD (Gravity ↓) ]      [ 115 MPH WIND UPLIFT (Suction ↑) ]
                     │                                       │
                     ▼                                       ▼
          +-------------------------------------------------------------+
          |  PRINCIPAL RAFTER (10x14 FOHC) <── Rothoblaas VGZ 11x350mm  |
          |  Structural Screw Diaphragm Tie-Down across SIP Panels      |
          +-------------------------------------------------------------+
                     │                                       │
                     ▼  (Compression on Housing)             ▼  (Tension on Pegs/Plates)
          +-------------------------------------------------------------+
          |  8x8 PRINCIPAL POST BASE                                    |
          |  Concealed 3/8" A36 Steel Knife Plate + (6) 3/4" Tight-Fit  |
          |  Steel Dowel Pins into Concrete Pier via (4) 3/4" F1554     |
          |  Epoxy Anchor Rods (Embedment h_ef = 12.0 in, T_all = 18k)  |
          +-------------------------------------------------------------+`,
    keyMetrics: [
      { label: "Design Roof Snow Load", value: "45.0 PSF", subtext: "NDS Duration Factor CD = 1.15 (2-Month Snow Load)" },
      { label: "Ultimate Wind Speed (V)", value: "115 MPH", subtext: "ASCE 7-22 Risk Category II · CD = 1.60 Wind Factor" },
      { label: "Max Deflection Limit", value: "L / 360", subtext: "Live/Snow Deflection ≤ 0.80\" on 24-ft Clear Span" },
      { label: "Post Anchor Uplift Rating", value: "18,400 lbf", subtext: "Concealed 3/8\" Knife Plate + (4) 3/4\" Epoxy Anchors" }
    ],
    skillSpecs: {
      "45 PSF Snow Load": {
        categoryBadge: "GRAVITY & SNOW LOAD ENGINEERING",
        standardCode: "ASCE 7-22 Chapter 7 / NDS Sec. 2.3.2 Load Duration",
        technicalSummary:
          "Under a 45 PSF design snow load plus 15 PSF dead load (60 PSF total vertical load), a timber bent spaced at 16 feet on-center carries 960 lbs per linear foot along the tie beam/rafter system. Applying the NDS snow load duration factor (CD = 1.15) and verifying combined bending plus axial compression interaction equations ensures zero overstress or excessive creep deflection.",
        governingEquation: "(f_c / F'_c)² + f_bx / [F'_bx × (1 - f_c / F_cE1)] ≤ 1.00 (NDS Eq. 3.9-3) | Δ_max ≤ L / 360",
        fieldProtocol: [
          "Calculate tributary roof area for every purlin, principal rafter, ridge beam, and post before ordering timber cross-sections.",
          "Verify bending stress f_b = M_max / S_x, horizontal shear stress f_v = 1.5 × V / (b × d) at notched birdsmouth bearings, and bearing stress perpendicular to grain f_c⊥ ≤ 625 psi.",
          "Pre-camber long-span bottom tie beams by +3/8 inch or select crown-up timber orientation so long-term dead-load creep (K_cr = 1.5) settles dead-level.",
          "Avoid tension-side notches at rafter seat cuts; where birdsmouth depth exceeds d/4, reinforce against horizontal splitting with full-thread 11mm structural cylinder-head screws."
        ],
        criticalTolerance: "Combined Stress Interaction Ratio ≤ 0.95; Live Snow Deflection ≤ L / 360",
        toolingRequired: "PE Structural Calculation Package, Rothoblaas VGZ Full-Thread Structural Screws, Torque Wrench",
        failureMode: "Deep birdsmouth notches (> d/4) on the tension side of rafters initiate longitudinal horizontal shear cracks at 60% of nominal beam capacity."
      },
      "115 MPH Wind Envelope": {
        categoryBadge: "WIND UPLIFT & LATERAL BRACING",
        standardCode: "ASCE 7-22 Chapters 26–30 / TFEC Knee-Brace Stiffness Model",
        technicalSummary:
          "At 115 MPH ultimate wind speeds, leeward roof slopes and eave overhangs experience severe aerodynamic suction (uplift pressures reaching -35 to -58 PSF in roof corner Zone 3), reversing gravity compression into net tension across rafter-to-post connections while subjecting the timber bent to high lateral racking drift.",
        governingEquation: "F_uplift_net = (q_h × GC_p - 0.6 × Dead_Load) × Area_tributary | Story Drift Δ_wind ≤ H / 240",
        fieldProtocol: [
          "Install continuous high-capacity structural diaphragm screws (e.g., 10\"–14\" timber structural washer-head screws at 12\" O.C.) through SIP roof panels into purlins and rafters.",
          "Supplement traditional wooden trunnels at eave post-to-rafter tension joints with concealed internal steel hold-down straps or counter-bored axial tension rods where net uplift exceeds peg relish capacity.",
          "Size knee braces (minimum 4x6 or 6x8 at 45° angle, 36\"–48\" leg run) with two 1.0-inch White Oak pegs per end to resist lateral wind racking without exceeding peg bearing yield.",
          "Seal building envelope air barriers around timber penetrations so internal wind pressurization (GC_pi = ±0.18 vs. ±0.55 partially enclosed) does not double roof uplift forces."
        ],
        criticalTolerance: "Continuous Uplift Path Verified from Roof Peak to Foundation; Lateral Drift ≤ H / 240",
        toolingRequired: "Simpson Strong-Tie / Rothoblaas High-Capacity Timber Hold-Downs, Calibrated Impact Driver",
        failureMode: "Relying solely on a single wooden peg in pure axial tension under 115 MPH eave uplift shears the tenon relish block."
      },
      "Seismic Anchor Ties": {
        categoryBadge: "FOUNDATION ANCHORAGE & SEISMIC DUCTILITY",
        standardCode: "ACI 318-19 Chapter 17 / AISC 360 Concealed Knife Plates",
        technicalSummary:
          "Traditional wooden post base tenons set directly on concrete piers decay from capillary moisture wicking and offer zero seismic uplift resistance. Modern PE-stamped timber frames utilize concealed kerf-slotted hot-dip galvanized A36/A572 steel knife plates with tight-fit drift pins elevated 1.0 inch above a non-shrink grout pad.",
        governingEquation: "N_sa = A_se,N × f_uta (Steel Tension) | Concrete Breakout N_cb = (A_Nc / A_Nco) × ψ_ed,N × N_b",
        fieldProtocol: [
          "Plunge-cut a centered 7/16-inch wide kerf slot into the bottom of the 8x8 post using a chain mortiser on a precision guide carriage.",
          "Drill matching 3/4-inch dowel holes through the post using a steel drill-jig bushing clamped to Reference Face 1 to ensure 100% concentricity with the steel knife plate.",
          "Anchor the base plate to the reinforced concrete pier using ASTM F1554 Grade 55 threaded rods set in ICC-ES AC308 approved structural epoxy (Hilti HIT-RE 500 V4) at ≥ 12-inch embedment.",
          "Install a 1/4-inch neoprene capillary break pad and 1-inch standoff washer under the post base so end-grain remains permanently dry and ventilated."
        ],
        criticalTolerance: "Anchor Bolt Placement ±1.5 mm; Post Base Capillary Air Gap ≥ 12 mm Above Concrete",
        toolingRequired: "Hilti TE 60-A36 Rotary Hammer, Hilti HIT-RE 500 Epoxy Dispenser, Mafell Chain Slotter",
        failureMode: "Direct timber end-grain contact with concrete wicks ground moisture to >28% MC, causing fungal brown-rot decay within 48 months."
      }
    },
    benchmarkTable: {
      headers: ["Load Case / Connection", "ASCE 7-22 Demand", "NDS Duration Factor (CD)", "Allowable Timber / Steel Capacity", "Reserve Safety Margin"],
      rows: [
        ["Roof Snow Gravity (45 PSF)", "14,400 lbf / Bent", "CD = 1.15 (Snow)", "18,900 lbf (10x14 FOHC Rafter)", "+31.2% Margin (PASS)"],
        ["115 MPH Wind Eave Uplift", "-4,850 lbf Net Tension", "CD = 1.60 (Wind)", "6,400 lbf (Dual 1\" Peg + Strap)", "+31.9% Margin (PASS)"],
        ["Lateral Wind Racking", "3,200 lbf Story Shear", "CD = 1.60 (Wind)", "4,500 lbf (6x8 Knee Braces)", "+40.6% Margin (PASS)"],
        ["Seismic Post Base Anchor", "11,200 lbf Tension / Shear", "CD = 1.60 (Seismic)", "18,400 lbf (3/8\" Plate + 4x 3/4\" Rods)", "+64.3% Margin (PASS)"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Concrete Pier Anchor Bolts Off by 3/4\"", "Foundation contractor poured without steel bolt template", "Shoot pier bolts with Leica 3D Disto before crane day", "Fabricate PE-approved eccentric steel retrofit base plate or core-drill new epoxy anchors"],
        ["Drift Pins Won't Pass Through Knife Plate", "Post kerf drilled off-plumb without steel drill bushing", "Insert alignment mandrel prior to lifting bent", "Always drill timber dowel holes from both sides using hardened steel jig bushings"],
        ["Knee Brace Pegs Creak Under High Wind", "Insufficient brace shoulder housing depth (< 3/8\")", "Check shoulder bearing contact with feeler gauge", "Ensure full 1/2-inch housed mortise shoulder bears compressively before pinning"]
      ]
    },
    citations: [
      "ASCE/SEI 7-22: Minimum Design Loads and Associated Criteria for Buildings and Other Structures.",
      "ACI 318-19: Building Code Requirements for Structural Concrete — Chapter 17 Anchoring to Concrete.",
      "TFEC Technical Bulletin 2024-03: Seismic & High-Wind Ductility of Pegged and Steel-Reinforced Timber Frames."
    ]
  },

  "path-trades-carpentry:6": {
    standardsBody: "AWI (Architectural Woodwork Institute) Premium Grade Standard · NHLA Hardwood Grading Rules",
    peerReviewId: "TFG-WP-2026-STEP06",
    executiveSummary:
      "This 10-page white paper elevates the heavy timber framer into an AWI Premium Grade architectural finish joiner. Covering multi-member coped crown molding spring-angle trigonometry, steam-bent and laminated helical curved handrails, and sequence-matched bookmatched American Black Walnut (Juglans nigra) coffered ceilings and wainscot paneling, this module enforces sub-0.25 mm shadow-free reveal tolerances.",
    governingEquations: `// 1. Compound Miter & Blade Bevel for Crown Molding (Nested Flat on Saw Table)
// Given Wall Corner Angle (W) and Crown Spring Angle from Wall (S = 38° or 45°):
Miter_Angle = arctan[ sin(S) / tan(W / 2) ]
Bevel_Angle = arcsin[ cos(S) × cos(W / 2) ]
// For 90° Corner & 38° Spring Crown: Miter = 31.62° | Blade Bevel = 33.86°
// For 90° Corner & 45° Spring Crown: Miter = 35.26° | Blade Bevel = 30.00°

// 2. Curved Laminated Handrail Minimum Bending Radius & Springback
R_min_lamination = 100 × t_ply (Dry Bending)  |  Springback ΔR / R ≈ 1 / (N_plies² - 1)`,
    blueprintSchematic: `===================================================================================
   AWI PREMIUM GRADE BOOKMATCHED WALNUT VENEER SEQUENCE & COPED CROWN PROFILE
===================================================================================
   LOG FLITCH SLICING (0.6mm Architectural Veneer Leaves — Alternating Turnover):
   +------------------------+------------------------+------------------------+
   |   LEAF #1 (Flipped)    |   LEAF #2 (Reference)  |   LEAF #3 (Flipped)    |
   |      ((  /\\  ))        |        ((  /\\  ))      |      ((  /\\  ))        |
   |     ((  /  \\  ))       |       ((  /  \\  ))     |     ((  /  \\  ))       |
   |    ((  /    \\  )) <----+----> ((  /    \\  )) <--+--> ((  /    \\  ))      |
   +------------------------+------------------------+------------------------+
                            ^ Mirror Bookmatch Line (Zero Gap)

   COPED INSIDE CORNER CROWN JOINT:
   - Piece A: Runs Square into Corner against Wall & Ceiling Reference Blocks.
   - Piece B: Inside Miter Cut Reveals Profile Line -> Back-Cut at 15°-20° with
     Coping Saw & Half-Round Rasp so Razor Edge Rides Tightly Over Piece A's Face.`,
    keyMetrics: [
      { label: "AWI Premium Gap Tolerance", value: "≤ 0.20 mm", subtext: "0.008 in Max Opening at Any Miter or Cope Joint" },
      { label: "38° Crown Compound Settings", value: "31.6° / 33.9°", subtext: "Miter 31.62° · Bevel 33.86° (Flat on Miter Saw)" },
      { label: "45° Crown Compound Settings", value: "35.3° / 30.0°", subtext: "Miter 35.26° · Bevel 30.00° (Flat on Miter Saw)" },
      { label: "Hardwood Interior Target MC", value: "6.0% – 8.0%", subtext: "Acclimated 14 Days in HVAC-Conditioned Space" }
    ],
    skillSpecs: {
      "Coped Crown Molding": {
        categoryBadge: "ARCHITECTURAL MILLWORK & CORNICE JOINERY",
        standardCode: "AWI Standards Sec. 6 — Interior Architectural Standing & Running Trim",
        technicalSummary:
          "Unlike inside miter joints—which open into unsightly dark gaps as framing lumber shrinks or drywall corners vary from 90°—a coped inside corner locks the un-cut profile of the first crown molding against the corner while the intersecting piece is back-beveled along its exact profile contour. Even if the wall shifts or seasons by 2 mm, the razor-sharp coped lip remains visually seamless.",
        governingEquation: "Miter = arctan(sin S / tan(W/2)) | Back-Relief Undercut Angle = 15° to 22° behind Face Arris",
        fieldProtocol: [
          "Install continuous 3/4-inch plywood nailer backing blocks at the exact ceiling-and-wall projection triangles around the entire coffered ceiling perimeter.",
          "Cut the first crown run square at both ends and fasten tightly into the ceiling and wall nailers at the correct spring angle (38° or 45°).",
          "Place the mating crown upside-down (ceiling edge against saw fence) or flat using compound settings (31.62° miter / 33.86° bevel for 38° spring) to expose the exact profile transition line.",
          "Back-cut along the exposed pencil-shaded profile line at a 15°–20° relief angle using a Collins Coping Foot jigsaw and fine Nicholson #49 patternmaker's rasp, leaving a 0.5 mm untouched crisp knife edge."
        ],
        criticalTolerance: "Zero Visible Gap Under 500-Lumen Raking Inspection Light (≤ 0.15 mm)",
        toolingRequired: "Festool Kapex KS 120 REB Miter Saw, Knew Concepts Titanium Coping Saw, Collins Coping Foot",
        failureMode: "Filing across the front show edge during coping rounds over the sharp profile line, leaving a visible dark shadow seam."
      },
      "Curved Handrails": {
        categoryBadge: "TANGENT HANDRAILING & BENT LAMINATION",
        standardCode: "AWI Premium Stairwork / IBC 1014 Handrail Continuity",
        technicalSummary:
          "Fabricating continuous helical stair handrails and curved balcony balustrades requires mastering multi-ply vacuum/clamp bent lamination and Robert Riddell tangent handrailing geometry. Slicing resawn planks from a single contiguous hardwood billet and gluing them over a CNC-routed curved platen with rigid urea-formaldehyde or structural epoxy eliminates grain discontinuity and minimizes elastic springback.",
        governingEquation: "Springback(ΔR/R) = 1 / (N_plies² - 1)  =>  For 9 Plies, Springback = 1/80 = 1.25% Radius Compensation",
        fieldProtocol: [
          "Resaw sequential 3.2 mm (1/8\") laminations from a single straight-grained billet on a carbide band saw and number every leaf in exact cutting order so glue lines vanish upon reassembly.",
          "Over-curve the bending form radius by 1.2%–1.5% inward to compensate for elastic springback; apply structural non-creep adhesive (Unibond 800 / West System Epoxy) across all plies via grooved roller.",
          "Join tangent rail wreath fittings (volutes, goosenecks, quarter-turns) using 3/8-inch steel handrail bolts and twin Festool Domino aligning tenons before shaping the final profile with spokeshaves.",
          "Sand consecutively through 120, 150, 180, and 220 grit under raking LED light prior to applying hand-rubbed catalyzed conversion varnish or hardwax oil."
        ],
        criticalTolerance: "Glue-Line Thickness ≤ 0.08 mm (Invisible); Handrail Height 34.0\"–38.0\" Above Stair Nose Line",
        toolingRequired: "Laguna Resaw Bandsaw, Vacuum Press System (25 inHg), Lie-Nielsen Bronze Spokeshaves",
        failureMode: "Using PVA yellow glue on tight-radius multi-ply curved handrails allows viscoelastic glue-line creep, causing the rail to straighten out and pull joints apart."
      },
      "Bookmatched Walnut Paneling": {
        categoryBadge: "ARCHITECTURAL VENEER & COFFERED CEILINGS",
        standardCode: "HPVA ANSI/HPVA HP-1 Hardwood Veneer & AWI Section 12",
        technicalSummary:
          "AWI Premium Grade architectural paneling requires sequence-matched flitch veneers sliced from a single American Black Walnut log. Every alternate veneer leaf is turned over like the pages of a book so adjacent panels mirror each other across vertical stile centerlines and continue uninterrupted from wainscot panels up into overhead coffered ceiling bays.",
        governingEquation: "Panel Float Allowance = ΔW_expansion = W_panel × [(MC_max - MC_min) / 28] × S_coeff",
        fieldProtocol: [
          "Inspect numbered sequence flitches in sequential order and lay out architectural elevation maps so cathedral grain figures align symmetrically with room axes and timber bents.",
          "Press 0.6 mm face and balanced backer veneers onto moisture-resistant MDF or void-free Baltic Birch cores at equal thickness to prevent unbalanced hygroscopic cupping.",
          "Size solid Walnut raised panels 3.0 mm undersized in width inside stile-and-rail grooves equipped with Spaceballs elastomeric spacers so seasonal expansion never splits mitered bolection moldings.",
          "Mount finished wall and ceiling coffer assemblies using concealed French cleats and micro-adjustable Z-clips allowing ±2.0 mm laser leveling."
        ],
        criticalTolerance: "Bookmatch Grain Alignment ≤ 0.5 mm Across Stile Reveals; Panel Flatness ≤ 0.8 mm Over 8 Feet",
        toolingRequired: "Veneer Shooting Board, Heated Platen Veneer Press, Lamello Zeta P2 Clamex P-System Joiner",
        failureMode: "Veneering only the show face of a panel without an equal-species backing veneer on the rear face causes severe concave warping within 48 hours."
      }
    },
    benchmarkTable: {
      headers: ["AWI Quality Grade", "Miter / Cope Opening Limit", "Flushness Tolerance", "Veneer Matching Requirement", "Surface Sanding Spec"],
      rows: [
        ["AWI Premium Grade (Guild Target)", "≤ 0.18 mm (0.007 in)", "≤ 0.13 mm (0.005 in)", "Architectural Book & End-Match", "220 Grit · Zero Cross-Grain Marks"],
        ["AWI Custom Grade", "≤ 0.38 mm (0.015 in)", "≤ 0.25 mm (0.010 in)", "Bookmatched within Individual Panel", "180 Grit · Minimal Chatter"],
        ["AWI Economy Grade", "≤ 0.76 mm (0.030 in)", "≤ 0.64 mm (0.025 in)", "Random / Slip Match", "150 Grit Commercial"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Coped Crown Gaps at Top Ceiling Edge", "Crown rolled slightly off exact spring angle on miter saw fence", "Check spring triangle projection on wall/ceiling", "Use dedicated crown stops on saw bed so spring angle is mechanically locked"],
        ["Walnut Panel Shows White Glue Line at Seam", "Veneer edges jointed slightly convex or excess UF glue squeeze-out", "Inspect dry joint on light table before taping", "Shoot both veneer pack edges simultaneously with freshly honed #8 jointer plane"],
        ["Bolection Molding Miters Open in Winter", "Solid wood panel glued rigidly into rail-and-stile grooves", "Verify panel float clearance in groove", "Never glue solid panel edges; use Spaceballs and pre-stain panel tongues before assembly"]
      ]
    },
    citations: [
      "Architectural Woodwork Institute (AWI). Architectural Woodwork Standards (AWS), 3rd Edition — Section 6 & Section 12.",
      "Riddell, R. (1871 / 2018 Reprint). The New Elements of Hand-Railing & Modern Tangent Stairbuilding.",
      "Hardwood Plywood & Veneer Association (ANSI/HPVA HP-1-2024): American National Standard for Hardwood and Decorative Plywood."
    ]
  },

  "path-trades-carpentry:7": {
    standardsBody: "CSI MasterFormat Division 06 (06 13 00 Heavy Timber) · AIA G702 / G703 · Procore Financials",
    peerReviewId: "TFG-WP-2026-STEP07",
    executiveSummary:
      "This 10-page white paper equips the Master Craftsman to run a high-margin heavy timber and architectural millwork subcontracting enterprise. Covering exact board-foot (BF) and waste-factor material takeoffs, labor production-rate estimating, AIA Document G702/G703 Schedule of Values milestone escrow draws, statutory conditional vs. unconditional mechanic's lien waivers, and Procore BIM/RFI coordination, this treatise protects subcontractor cash flow and profitability.",
    governingEquations: `// 1. Nominal Board-Foot (BF) Takeoff & Gross Mill Order Formula
BF_nominal = (Thickness_in × Width_in × Length_ft) / 12
BF_gross_order = BF_nominal × (1 + Waste_Factor_Kerf_EndTrim +Cull_Allowance)
// For #1 FOHC Douglas Fir Heavy Timber: Waste_Factor = 14% to 18% (End-trim to 2-ft increments)

// 2. Fully Burdened Subcontractor Bid Price & Markup vs. Gross Margin
Cost_Direct = Cost_Timber + Cost_Fasteners + Cost_Crane + (Hours_Shop × Rate_Burdened) + (Hours_Site × Rate_Site)
Bid_Price   = Cost_Direct / (1 - Target_Gross_Margin)   // For 28% Gross Margin: Divide Direct Cost by 0.72`,
    blueprintSchematic: `===================================================================================
   CSI DIVISION 06 13 00 SCHEDULE OF VALUES & MILESTONE ESCROW DRAW PIPELINE
===================================================================================
   [ DRAW #1: 30% MOBILIZATION & TIMBER MILL DEPOSIT ]
         │  ├── Executed Subcontract + Shop Drawing Submittal Approval in Procore
         │  ├── Deliverable: Mill Bill of Lading + Stored Material Insurance Cert
         │  └── Waiver Issued: Conditional Waiver & Release on Progress Payment
         ▼
   [ DRAW #2: 40% SHOP JOINERY FABRICATION & PRE-FIT SIGN-OFF ]
         │  ├── 100% Mortise/Tenon Cutting Complete in Shop (Verified by GC/Architect)
         │  └── Waiver Issued: Unconditional Waiver for Draw #1 + Conditional for Draw #2
         ▼
   [ DRAW #3: 25% CRANE BENT ERECTION & PE STRUCTURAL INSPECTION ]
         │  ├── Frame Raised, Pegged, Plumb & Signed Off by Structural PE
         ▼
   [ DRAW #4: 5% RETAINAGE RELEASE & CLOSEOUT DOSSIER ]
         └── Final Punchlist + As-Built CAD + Unconditional Final Lien Waiver`,
    keyMetrics: [
      { label: "Board-Foot Equation", value: "(T\"×W\"×L')/12", subtext: "18 LF of 8x12 Timber = 144.0 Nominal Board Feet" },
      { label: "Target Gross Margin", value: "26% – 32%", subtext: "Equivalent to 35.1% – 47.0% Markup on Direct Cost" },
      { label: "Shop Joinery Production", value: "2.8 hrs / Joint", subtext: "Average Layout, Mortise, Tenon & Peg Prep (Hand/CNC)" },
      { label: "Retainage Cap Standard", value: "5.0% Max", subtext: "AIA A401 Subcontract · Reduced from 10% at 50% Completion" }
    ],
    skillSpecs: {
      "Board-Foot Takeoffs": {
        categoryBadge: "QUANTITY SURVEYING & TIMBER ESTIMATING",
        standardCode: "CSI MasterFormat 06 13 00 / WCLIB Standard Mill Lengths",
        technicalSummary:
          "Heavy timbers are priced per Thousand Board Feet ($/MBF). Because sawmills cut heavy timbers in even 2-foot length increments (8', 10', 12', 14'... up to 36') and require end-trimming 3–4 inches off each end to remove wax-sealed seasoning checks, estimators must round every blueprint cut length up to the next even 2-foot mill increment plus end-trim allowance before computing nominal Board Feet.",
        governingEquation: "BF = (T_nom_in × W_nom_in × L_mill_even_ft) / 12  |  Cost_Timber = (Total_BF / 1,000) × Price_per_MBF",
        fieldProtocol: [
          "Extract every member from the 3D CAD model into a categorized Timber Cut List grouped by nominal cross-section (e.g., 8x12, 8x8, 6x8, 4x6) and species/grade (#1 Dense FOHC Douglas Fir).",
          "Add 6 inches (3 inches per end) of fresh end-trim allowance to every net finished tenon-to-tenon member length, then round up to the next even 2-foot commercial sawmill length.",
          "Nest short knee braces (e.g., four 42-inch 6x8 braces) into single 16-foot mill timbers with 1/4-inch kerf allowances to reduce waste factor below 12%.",
          "Calculate total weight (BF × 3.21 lbs/BF for 14% MC Douglas Fir) to verify flatbed freight axle limits (44,000 lbs max payload per semi-truck) and crane pick weights."
        ],
        criticalTolerance: "Takeoff Variance ≤ ±1.5% of Actual Mill Invoice; 100% Even-Foot Mill Length Rounding",
        toolingRequired: "Cadwork BTLx Takeoff Exporter, Bluebeam Revu 21, Custom Excel/Procore MBF Matrix",
        failureMode: "Estimating net blueprint length (e.g., 14'-3\") instead of required 16'-0\" mill stock creates an immediate 11% unrecovered material cost overrun."
      },
      "Milestone Escrow Draws": {
        categoryBadge: "CONSTRUCTION LAW & FINANCIAL DRAW MANAGEMENT",
        standardCode: "AIA Document G702 / G703 & State Statutory Lien Waiver Acts",
        technicalSummary:
          "Custom heavy timber fabrication requires purchasing $60,000–$250,000 of FOHC timber cants months before crane arrival on site. Structuring front-loaded Schedule of Values (AIA G703) with Stored Material Billing (backed by a Bill of Sale, segregated yard tagging, and Certificate of Property Insurance) ensures positive cash flow throughout shop fabrication while properly sequencing Conditional vs. Unconditional Lien Waivers.",
        governingEquation: "Net_Draw_n = (∑Work_Completed + Stored_Materials) × (1 - Retainage_%) - Previous_Certificates_Paid",
        fieldProtocol: [
          "Negotiate AIA A401 Subcontract Rider explicitly authorizing payment for off-site Stored Raw Timbers and Shop-Fabricated Joinery upon delivery to the timber shop.",
          "Submit AIA G702 Application for Payment and G703 Schedule of Values by the 20th of each month accompanied by time-stamped photos of tagged timber bents and mill invoices.",
          "Issue ONLY a Statutory Conditional Waiver and Release Upon Progress Payment with the monthly invoice; NEVER execute an Unconditional Lien Waiver until funds have cleared the bank.",
          "Log all owner/architect design modifications immediately as formal Change Orders (AIA G701) before cutting affected timbers."
        ],
        criticalTolerance: "Zero Unconditional Waivers Signed Before Wire Clearance; >1.25 Cash-Flow Coverage Ratio",
        toolingRequired: "AIA G702/G703 Automated Billing Engine, Statutory Lien Waiver Templates, Escrow Verification",
        failureMode: "Signing an Unconditional Progress Lien Waiver prior to check clearance forfeits statutory mechanic's lien rights if the GC defaults."
      },
      "Procore Coordination": {
        categoryBadge: "BIM CLASH COORDINATION & SUBMITTAL WORKFLOW",
        standardCode: "ISO 19650 BIM Information Management / Procore Submittal Spec",
        technicalSummary:
          "In commercial and luxury residential construction, the heavy timber frame interfaces directly with structural steel foundations, MEP ductwork, fire sprinkler mains, and SIP roof envelopes. Managing RFIs, PE-stamped shop drawing submittals, and federated IFC/Navisworks 3D models inside Procore prevents costly field conflicts.",
        governingEquation: "RFI_Turnaround_SLA ≤ 5 Business Days | Zero Critical Clash at Anchor Bolts & MEP Penetrations",
        fieldProtocol: [
          "Upload 3D IFC4 timber model and 2D PE-stamped shop drawings into Procore Submittals under CSI 06 13 00 for formal 'Approved as Noted' sign-off prior to ordering mill cants.",
          "Overlay the timber IFC model against structural foundation plans and HVAC/sprinkler models to verify zero unauthorized boring or notching of principal timbers by MEP trades.",
          "Publish a formal Field Directives Bulletin inside Procore prohibiting electricians or plumbers from drilling any hole > 3/4 inch in heavy timbers without written Timber PE approval.",
          "Document pre-erection concrete pier anchor-bolt laser surveys via Procore Inspections 14 days prior to crane mobilization."
        ],
        criticalTolerance: "100% Approved Submittal Stamp Prior to Sawing; Zero Unapproved MEP Timber Penetrations",
        toolingRequired: "Procore Project Management Suite, Autodesk Navisworks / BIMcollab, Leica 3D Disto CSV Export",
        failureMode: "Allowing HVAC or plumbing subcontractors to notch bottom tension chords of timber trusses destroys structural certification and triggers PE stop-work orders."
      }
    },
    benchmarkTable: {
      headers: ["Subcontract Phase (CSI 06 13 00)", "% of Contract Value", "Verification Milestone", "Required Lien Waiver Type", "Retainage Held"],
      rows: [
        ["1. Engineering & PE Shop Drawings", "10% ($18,000)", "Approved Submittal in Procore", "Conditional Progress Waiver", "5.0%"],
        ["2. FOHC Timber Delivery to Shop", "30% ($54,000)", "Mill Certs + Stored Material Ins.", "Conditional Progress Waiver", "5.0%"],
        ["3. Shop Joinery Fabrication", "35% ($63,000)", "QC Sign-Off on All Bents", "Unconditional (#1-2) + Cond. (#3)", "5.0%"],
        ["4. Crane Erection & Dry-In", "20% ($36,000)", "PE Field Inspection Pass", "Unconditional (#3) + Cond. (#4)", "5.0%"],
        ["5. Final Closeout & Retainage", "5% ($9,000)", "As-Built Dossier & Warranty", "Conditional Final -> Uncond. Final", "0.0% (Released)"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["GC Rejects Billing for Timbers in Shop", "Subcontract lacked Off-Site Stored Material clause", "Review AIA A401 Article 11.3 provisions", "Execute Stored Material Bill of Sale + Bailee Letter + Insurance Rider naming Owner"],
        ["Plumber Drills 3\" Hole Through Tie Beam", "No MEP keep-out zones published in Procore coordination", "Calculate remaining net section modulus & shear", "Issue immediate Procore Non-Conformance Report (NCR) and backcharge PE steel flitch repair"],
        ["Mill Quote Jumps 18% After Bid Award", "Supplier quote expired (>15 days) before submittal approval", "Check timber commodity index & quote validity window", "Lock mill option deposit at contract signing or include lumber escalation clause"]
      ]
    },
    citations: [
      "American Institute of Architects (AIA). Document A401 Standard Form of Agreement Between Contractor and Subcontractor & G702/G703.",
      "Construction Specifications Institute (CSI). MasterFormat Division 06 — Section 06 13 00 Heavy Timber Construction.",
      "Procore Technologies. Specialty Contractor Financial Controls, Submittals & BIM Coordination Manual."
    ]
  },

  "path-trades-carpentry:8": {
    standardsBody: "OSHA 29 CFR 1926 Subpart M (Fall Protection) · Subpart L (Scaffolds) · ANSI/ASSP Z359.1",
    peerReviewId: "TFG-WP-2026-STEP08",
    executiveSummary:
      "This 10-page white paper establishes the OSHA 30-Hour Construction Safety & Fall Protection Lead engineering curriculum tailored for heavy timber erection and high-bay architectural carpentry. Covering 100% continuous tie-off protocols above 6 feet, total fall clearance distance equations, Class 1 Overhead Self-Retracting Lifelines (SRL-P), supported and mobile baker/frame scaffolding inspections, and daily Job Hazard Analysis (JHA) enforcement, this treatise ensures zero job-site fatalities.",
    governingEquations: `// 1. Total Required Fall Clearance Distance (D_clearance) — Personal Shock-Absorbing Lanyard
D_clearance = L_lanyard (6.0 ft) + D_deceleration (3.5 ft) + ΔD_harness_stretch (1.5 ft) + H_d_ring (5.0 ft) + FS_safety (2.0 ft)
// Total Required Clearance below Anchor Point = 18.0 Feet!
// (At heights < 18.5 ft, a 6-ft shock lanyard hits the deck — MANDATORY Class 1 Overhead SRL Required!)

// 2. Horizontal Lifeline (HLL) Mid-Span Cable Tension Amplification
T_cable = (F_arrest × L_span) / (4 × d_sag)   // Requires PE-designed inline energy absorber (5,000 lbf / person)`,
    blueprintSchematic: `===================================================================================
   OSHA 1926.502 FALL CLEARANCE GEOMETRY: 6-FT LANYARD VS. CLASS 1 OVERHEAD SRL
===================================================================================
   [ ANCHOR POINT ON TIMBER TIE BEAM / RIDGE (≥ 5,000 LBF / 22.2 kN CAPACITY) ]
         │                                               │
         │  CASE A: 6-Ft Shock-Absorbing Lanyard         │  CASE B: ANSI Z359.14 Class 1 SRL
         ├─ 6.0 ft Free-Fall Lanyard Length              ├─ 1.5 ft Max Arrest Activation
         ├─ 3.5 ft Energy Absorber Tear-Out              ├─ 2.0 ft Internal Brake Deceleration
         ├─ 1.5 ft Dorsal D-Ring Harness Shift           ├─ 1.5 ft Harness Stretch
         ├─ 5.0 ft Worker Lower Body Below D-Ring        ├─ 2.0 ft Safety Margin
         └─ 2.0 ft OSHA Safety Clearance Margin          └──> TOTAL CLEARANCE = 7.0 FT!
         └──> TOTAL REQUIRED CLEARANCE = 18.0 FT!             (Safe for 12-ft Mezzanine Bents)
===================================================================================`,
    keyMetrics: [
      { label: "OSHA Construction Trigger", value: "6.0 Feet", subtext: "29 CFR 1926.501(b)(1) Mandatory 100% Fall Protection" },
      { label: "Anchor Point Min Strength", value: "5,000 lbf", subtext: "22.2 kN Static Load or 2:1 FS Under Qualified Person" },
      { label: "6-Ft Lanyard Clearance", value: "18.0 Feet", subtext: "Switch to Class 1 SRL (< 7.0 ft Clearance) at Low Heights" },
      { label: "Scaffold Load Safety Factor", value: "4 : 1 Ratio", subtext: "29 CFR 1926.451(a)(1) — Supports 4× Max Intended Load" }
    ],
    skillSpecs: {
      "100% Tie-Off Protocols": {
        categoryBadge: "PERSONAL FALL ARREST SYSTEMS (PFAS)",
        standardCode: "OSHA 29 CFR 1926.502(d) / ANSI/ASSP Z359.14-2021",
        technicalSummary:
          "During heavy timber bent raising and purlin setting, connectors transitioning along elevated plates must maintain 100% continuous fall arrest attachment at all times above 6.0 feet. Using Twin-Leg (Y-Lanyard) ANSI Z359.14 Leading-Edge Self-Retracting Lifelines (SRL-LE) with high-strength timber choker anchor straps allows workers to leapfrog across braces without ever unclipping both hooks simultaneously.",
        governingEquation: "Max Arresting Force (MAF) ≤ 1,800 lbf (8.0 kN) [ANSI Z359.14 Average MAF ≤ 900–1,350 lbf]",
        fieldProtocol: [
          "Pre-install 5,000-lbf rated polyester cross-arm timber anchor straps and overhead horizontal lifeline stanchions onto principal rafters on the ground BEFORE crane lifting.",
          "Equip every raising connector with a full-body harness featuring dorsal D-ring, trauma relief foot straps, and a Twin-Leg Class 2 Leading-Edge SRL-LE.",
          "Enforce the 'Clip Before You Unclip' rule when bypassing knee braces or purlin intersections; never clip a lanyard snap hook back onto its own webbing or share a single D-ring carelessly.",
          "Establish a written 6-Minute Suspension Trauma Rescue Plan (utilizing a scissor lift, man-basket, or telescopic reach pole rescue kit) before any worker ascends."
        ],
        criticalTolerance: "100% Continuous Attachment Above 6.0 ft; Max Free Fall ≤ 6.0 ft; MAF ≤ 1,800 lbf",
        toolingRequired: "3M DBI-Sala ExoFit XE Harness, Nano-Lok Edge Twin-Leg SRL, Cross-Arm Timber Straps",
        failureMode: "Using a standard 6-ft shock lanyard anchored at foot level on a 14-ft tie beam requires 18.0 ft of clearance, resulting in ground impact before the shock pack fully deploys."
      },
      "Scaffolding Inspection": {
        categoryBadge: "SUPPORTED & MOBILE SCAFFOLD ENGINEERING",
        standardCode: "OSHA 29 CFR 1926 Subpart L (1926.451–1926.454)",
        technicalSummary:
          "Architectural finish joinery and coffered ceiling installation rely extensively on multi-tier supported tubular welded frame scaffolds and mobile rolling towers. Every scaffold must be erected, moved, or altered under the supervision of a designated Competent Person, verified to support 4 times its maximum intended load, and tagged daily (Green / Yellow / Red Tag).",
        governingEquation: "H_base_ratio ≤ 4 : 1 (Outriggers/Tie-Ins Required if Height > 4 × Min_Base_Width) | Capacity ≥ 4 × Load",
        fieldProtocol: [
          "Conduct a documented Competent Person pre-shift inspection every morning before crew entry; affix a dated Green ('Safe for Use'), Yellow ('PFAS Required'), or Red ('Do Not Occupancy') scaffold tag at the access ladder.",
          "Verify that every vertical standard rests on a steel screw jack and continuous 2x10 mudsill (never on hollow concrete blocks or loose brick stacks) and is plumb and cross-braced.",
          "Confirm full deck planking with scaffold-grade 2x10s (DI-65 laminated veneer or Southern Pine) with < 1 inch gap between planks, 6\"–12\" end overhang, and complete 42-inch toprail, 21-inch midrail, and 3.5-inch toeboards.",
          "Lock all four caster swivel/wheel brakes on mobile baker/rolling towers prior to climbing, and never ride a rolling scaffold while it is being repositioned."
        ],
        criticalTolerance: "Plank Gap ≤ 1.0 in; Top Guardrail 42\" ± 3\"; Height-to-Base Ratio ≤ 4:1 Without Tie-Ins",
        toolingRequired: "Competent Person Scaffold Inspection Tag Kit, 4-Foot Magnetic Spirit Level, Torque Wrench",
        failureMode: "Planking overhang < 6 inches slips off the bearer bar under shifting load, while overhang > 12 inches unbolted tips up like a trapdoor when a carpenter steps on the cantilever."
      },
      "Job Hazard Analysis": {
        categoryBadge: "PRE-TASK RISK ENGINEERING & OSHA 30 LEAD",
        standardCode: "OSHA Recommended Practices for Safety & Health Programs / ANSI Z10",
        technicalSummary:
          "A Job Hazard Analysis (JHA / Activity Hazard Analysis) decomposes complex timber framing operations (e.g., chain mortising, crane bent picks, high-bay crown coping) into discrete sequential task steps, identifies specific kinetic, electrical, respiratory, and fall hazards for each step, and prescribes Hierarchy of Controls mitigations signed by every crew member.",
        governingEquation: "Residual_Risk = Initial_Severity × Initial_Probability × (1 - Control_Effectiveness_Factor)",
        fieldProtocol: [
          "Convene a mandatory 10-minute morning Tailgate JHA Huddle at the jobsite whiteboard whenever task scope, weather conditions, crane positioning, or adjacent sub-trade activity changes.",
          "Apply the NIOSH Hierarchy of Controls in strict priority order: (1) Elimination (assemble roof bents on the ground), (2) Engineering Controls (guardrails, HEPA dust extractors), (3) Administrative Controls (exclusion zones), (4) PPE.",
          "Verify Ground-Fault Circuit Interrupter (GFCI) protection on all 120V/240V temporary spider boxes powering beam saws and chain mortisers.",
          "Audit first-aid/AED station readiness, eye-wash stations, and clear emergency ambulance access lanes prior to commencing heavy cutting or lifting."
        ],
        criticalTolerance: "100% Crew Signature on Daily JHA Before Tool Start; Zero Uncontrolled High-Risk Tasks",
        toolingRequired: "ConnectLn Digital JHA Tablet Log, Anemometer Wind Gauge, GFCI Circuit Tester",
        failureMode: "Skipping a JHA update when wind gusts rise from 10 mph to 24 mph during SIP panel installation turns a 4x16 roof panel into an uncontrollable airfoil."
      }
    },
    benchmarkTable: {
      headers: ["OSHA Safety Parameter", "Regulatory Code Citation", "Mandatory Field Specification", "Inspection Frequency", "Enforcement Action"],
      rows: [
        ["Fall Protection Trigger Height", "29 CFR 1926.501(b)(1)", "≥ 6.0 ft in Construction", "Continuous Real-Time", "Immediate Stop-Work if Unclipped"],
        ["PFAS Anchor Point Strength", "29 CFR 1926.502(d)(15)", "5,000 lbf (22.2 kN) per Worker", "Pre-Lift Verification", "Qualified Person Sign-Off"],
        ["Scaffold Guardrail Height", "29 CFR 1926.451(g)(4)", "42 in (±3 in) Toprail + 21 in Midrail", "Daily Pre-Shift by Competent Person", "Red-Tag Until Guardrail Installed"],
        ["Silica / Wood Dust Control", "29 CFR 1926.1153 / 1926.55", "HEPA Dust Extractor + N95/P100", "Every Cutting Shift", "Tool Interlock Vacuum Required"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["Worker Anchors 6-Ft Lanyard at Foot Level", "Increases free fall from 6 ft to 12 ft (Exceeds OSHA limit & tears pack)", "Measure anchor height relative to dorsal D-ring", "Relocate anchor overhead or switch to ANSI Z359.14 Class 2 Leading-Edge SRL"],
        ["Scaffold Standard Sinks 1.5\" After Rain", "Screw jack placed directly on compacted soil without mudsill plank", "Check ledger level across bay", "Install continuous 2x10 timber mudsills extending 12\" beyond base plates and re-level"],
        ["Beam Saw Trips Breaker Repeatedly", "Undersized 16-AWG extension cord causing >8% voltage drop", "Measure loaded voltage at saw plug with multimeter", "Use dedicated 10-AWG heavy-duty cord (< 50 ft) on 20A GFCI circuit"]
      ]
    },
    citations: [
      "U.S. Department of Labor — OSHA 29 CFR Part 1926: Safety and Health Regulations for Construction (Subparts L, M, CC).",
      "ANSI/ASSP Z359.14-2021: Safety Requirements for Self-Retracting Devices for Personal Fall Arrest and Rescue Systems.",
      "NIOSH Publication No. 2023-112: Preventing Falls in Heavy Timber & Residential Roof Framing."
    ]
  },

  "path-trades-carpentry:9": {
    standardsBody: "Timber Framers Guild Master Craftsman Examination · TFEC 1-2023 · IBC Special Inspection",
    peerReviewId: "TFG-WP-2026-STEP09",
    executiveSummary:
      "This 10-page Capstone white paper serves as the complete engineering dossier, fabrication blueprint, PE special inspection protocol, and Guild Master Defense rubric for Step 9: Clear-Span Timber Pavilion Bent Erection. Integrating every competency from Steps 1 through 8, the candidate fabricates, test-fits, raises, pins, and defends a 24-foot clear-span Hammer-Beam or King-Post FOHC Coastal Douglas Fir Pavilion before the Master Guild Council and Structural PE.",
    governingEquations: `// 1. King-Post / Hammer-Beam Clear-Span Truss Axial Chord Forces (Span L = 24 ft, Pitch 8:12)
// Under Total Design Load w = 60 psf × 12 ft Bay = 720 plf (Total Bent Load W = 17,280 lbf):
R_support = W / 2 = 8,640 lbf
C_rafter  = (W / 4) / sin(33.69°) = 7,788 lbf Compression
T_tie_chord = C_rafter × cos(33.69°) = 6,480 lbf Tension (Resisted by Scarfed Tie + King-Post Stirrup)

// 2. Guild Master Capstone Scoring Formula (Minimum Passing Score = 92.0 / 100.0)
S_total = 0.25(Wood_Moisture_QA) + 0.30(Sub1mm_Joinery_Fit) + 0.25(Crane_Rigging_Safety) + 0.20(PE_Oral_Defense)`,
    blueprintSchematic: `===================================================================================
   GUILD CAPSTONE BLUEPRINT: 24-FT CLEAR-SPAN KING-POST TIMBER PAVILION BENT
===================================================================================
                              [ RIDGE PEAK / KING-POST HEAD ]
                                         /  |  \\
           10x12 FOHC Principal Rafter  /   |   \\  10x12 FOHC Principal Rafter
           (8:12 Pitch · θ = 33.69°)   /   8x8   \\  (C_axial = 7,788 lbf)
                                      /  KING-POST\\
                                     /   /  |  \\   \\
                                    /  6x6 Struts   \\
          +========================/========|========\\========================+
          |      8x12 FOHC BOTTOM TIE BEAM (24'-0" CLEAR SPAN · T = 6,480 lbf) |
          +====+=========================================================+====+
          |8x8 |  6x8 Knee Brace (45° · Dual 1" White Oak Pegs)          | 8x8|
          |POST|                                                         |POST|
          +====+                                                         +====+
         [ Concealed 3/8" Knife Plate Anchor ]          [ Concealed 3/8" Knife Plate ]`,
    keyMetrics: [
      { label: "Clear Pavilion Span", value: "24'-0\" × 36'-0\"", subtext: "4 Principal Bents @ 12'-0\" O.C. (No Interior Posts)" },
      { label: "Total Timber Volume", value: "6,480 BF", subtext: "#1 Dense FOHC Coastal Douglas Fir (< 13.5% Core MC)" },
      { label: "Joint Shoulder Tolerance", value: "≤ 0.40 mm", subtext: "100% Pass Across 68 Housed Mortise & Tenon Joints" },
      { label: "Guild Defense Pass Score", value: "≥ 92.0 / 100", subtext: "PE Structural Sign-Off + 3-Master Guild Oral Defense" }
    ],
    skillSpecs: {
      "Full Bent Assembly": {
        categoryBadge: "CAPSTONE FABRICATION & RAISING",
        standardCode: "TFEC Standard 1-2023 / Guild Master Practical Rubric",
        technicalSummary:
          "Executing the full 4-bent clear-span pavilion requires pre-assembling each 24-foot King-Post bent on leveled shop cribbing, verifying diagonal squareness (3-4-5 / Pythagorean check within ±1.5 mm over 30 feet), draw-boring all 1.0-inch White Oak octagonal trunnels, and executing a zero-incident ASME B30.5 crane erection sequence.",
        governingEquation: "Diagonal_Check: D_1 - D_2 ≤ 1.5 mm over 30-ft Diagonal | Post Plumb ≤ 2.0 mm over 12-ft Height",
        fieldProtocol: [
          "Stage all cut timbers on leveled oak cribbing bunks; verify Reference Face 1 plane coplanarity across both 8x8 posts and the 24-foot 8x12 tie beam using a rotary laser level.",
          "Draw-pull the principal rafters, King-Post joggle head, diagonal struts, and tie-beam heel housings simultaneously using two 3-ton strap winches before driving White Oak trunnels.",
          "Measure opposite diagonal corner-to-corner distances across the assembled bent and across the 24'×36' foundation sill layout to confirm ≤ 1.5 mm squareness.",
          "Rig each 3,850-lb assembled bent using the 20-foot steel spreader bar, perform the 6-inch static hover check, and land all four bents, connecting purlins, and ridge beams within a single 6-hour crane window."
        ],
        criticalTolerance: "Shoulder Feeler Gauge ≤ 0.40 mm; Diagonal Squareness ≤ 1.5 mm; Plumbness ≤ 2.0 mm",
        toolingRequired: "Leica 3D Disto Total Station, 20-Ft Spreader Beam, 4-Lb Bronze-Faced Commander Beetles",
        failureMode: "Driving trunnels at the rafter heels before seating the central King-Post joggle locks the rafters out of geometry and splits the King-Post shoulder."
      },
      "PE Stamped Inspection": {
        categoryBadge: "IBC SPECIAL STRUCTURAL INSPECTION",
        standardCode: "IBC 2024 Chapter 17 (Section 1705.5 Wood Special Inspections)",
        technicalSummary:
          "Before the Building Official issues a structural framing sign-off or the Guild awards the Master Craftsman credential, the Engineer of Record (Licensed PE) performs an on-site IBC Chapter 17 Special Inspection auditing species grade stamps, core moisture logs, peg relish distances, concealed steel knife-plate torque/weld certificates, and diaphragm uplift fasteners.",
        governingEquation: "100% Compliance with Approved PE-Stamped Calculation Package & Shop Drawings",
        fieldProtocol: [
          "Present the bound Capstone Quality Assurance Dossier containing WCLIB #1 Dense FOHC mill certificates, ASTM D4444 core moisture logs for all 42 timbers, and Hilti epoxy anchor batch lot numbers.",
          "Walk the erected pavilion with the Special Inspector to verify 0.015-inch feeler-gauge refusal at all compression housings and full peg protrusion (> 1.5 inches) on both faces of every joint.",
          "Perform calibrated torque-wrench verification on 10% of foundation base anchor nuts and forged iron King-Post tension stirrup bolts.",
          "Obtain the wet-signed and embossed Professional Engineer (PE) Special Inspection Certificate of Compliance."
        ],
        criticalTolerance: "Zero Open Structural Non-Conformance Reports (NCRs); 100% Fastener & Grade Verification",
        toolingRequired: "Calibrated Digital Torque Wrench, 0.015\" Steel Feeler Gauge, Bound QA Inspection Dossier",
        failureMode: "Missing epoxy anchor batch expiration logs or unverified moisture readings delays Certificate of Occupancy and requires destructive core pull-testing."
      },
      "Master Craftsman Defense": {
        categoryBadge: "ORAL & PRACTICAL GUILD BOARD DEFENSE",
        standardCode: "ConnectLn Master Timber Joiner Guild Charter Art. IX",
        technicalSummary:
          "The culmination of the 12-week journey is a formal 90-minute oral and practical examination before three Certified Guild Masters and a Structural PE. The candidate defends their mathematical derivations (shrinkage physics, Hankinson's formula, compound roof backing bevels, crane sling tension vectors, and ASCE 7 wind/snow load paths) and demonstrates live hand-chisel paring and compound layout.",
        governingEquation: "Weighted Composite Defense Score ≥ 92.0% Across All 9 Curriculum Milestones",
        fieldProtocol: [
          "Deliver a 25-minute technical presentation walking through the 3D CAD digital twin, board-foot takeoff sheet, AIA G702/G703 financial schedule, and OSHA 30 JHA lift plan.",
          "Solve live whiteboard engineering challenges posed by the panel (e.g., deriving the backing bevel and jack cheek angle for an irregular 7:12 intersecting a 10:12 valley).",
          "Undergo blind physical inspection of three randomly selected pavilion joints by the Guild Examiners using machinist squares, feeler gauges, and raking inspection lamps.",
          "Upon achieving ≥ 92.0%, sign the Guild Master Roll, receive the embossed Master Craftsman Stamp, and publish the verified credential directly to your ConnectLn profile."
        ],
        criticalTolerance: "Composite Score ≥ 92.0%; Unanimous Sign-Off by Guild Master Panel & Structural PE",
        toolingRequired: "Complete 10-Page White Paper Portfolio (Steps 1–9), Personal Chisel Roll & Framing Square",
        failureMode: "Inability to derive compound roof angles or sling tension equations from first principles results in deferral of Master credentialing."
      }
    },
    benchmarkTable: {
      headers: ["Capstone Evaluation Domain", "Weight (%)", "Minimum Pass Threshold", "Inspection Method", "Lead Examiner"],
      rows: [
        ["1. Wood Science & Moisture Logs (Step 1)", "15%", "100% FOHC & < 14.0% Core MC", "ASTM D4444 Insulated Pin Audit", "Guild Materials Master"],
        ["2. Joinery & Finish Precision (Steps 2, 3, 6)", "35%", "Shoulder Gaps ≤ 0.40 mm", "0.015\" Feeler Gauge & Laser Check", "Lead Master Timber Joiner"],
        ["3. Structural PE & Rigging Safety (Steps 4, 5, 8)", "30%", "Zero Safety/NCR Violations", "ASME B30.5 Lift + IBC Ch. 17 Audit", "Structural PE & OSHA Lead"],
        ["4. Bidding, Procore & Oral Defense (Steps 7, 9)", "20%", "≥ 92% Whiteboard & Bid Audit", "90-Min Oral Examination", "Guild Examination Board"]
      ]
    },
    troubleshootingMatrix: {
      headers: ["Observed Field Anomaly", "Root Physical Mechanism", "Diagnostic Verification", "Master Joiner Remediation"],
      rows: [
        ["King-Post Bottom Tenon Gap After Raising", "Dead-load camber settling not tensioned at iron stirrup", "Measure tie-beam mid-span elevation with laser", "Tighten forged King-Post gib-and-cotter wedge or tension rod to engagerafter compression"],
        ["Purlin Mortises Tight on Final Bay", "Cumulative +1 mm layout growth across 3 bays", "Shoot total building length between End Bents 1 & 4", "Pare 0.5 mm off non-reference purlin shoulder cheek to knife line before final crane drop"],
        ["Inspector Requests Proof of Epoxy Cure Time", "Ambient concrete pier temp was 48°F during installation", "Check Hilti HIT-RE 500 temperature cure chart", "Present logged infrared concrete thermometer reading & 24-hour cure hold log"]
      ]
    },
    citations: [
      "Timber Framers Guild (TFG). Master Craftsman Certification Examination & Practical Assessment Rubric (2026).",
      "International Code Council (ICC). 2024 International Building Code (IBC) — Chapter 17 Special Inspections and Tests.",
      "Asiedu, K. & ConnectLn Guild Council (2026). Complete 9-Step Heavy Timber & Architectural Joinery Monograph Series."
    ]
  }
}

export function getRoadmapStepWhitePaper(
  path: CareerLearningPath,
  step: LearningPathStep
): RoadmapStepWhitePaper {
  const key = `${path.id}:${step.stepNumber}`
  const customProfile = STEP_DOMAIN_PROFILES[key]

  const standardsBody =
    customProfile?.standardsBody ||
    (path.id === "path-trades-carpentry"
      ? "AF&PA NDS 2024 · Timber Frame Engineering Council (TFEC 1-2023) · OSHA 29 CFR 1926"
      : path.id === "path-healthcare-trauma"
      ? "ACS ATLS 11th Ed · EAST Practice Management Guidelines · Joint Commission Critical Care"
      : path.id === "path-automotive-diagnostic"
      ? "SAE J1939 / ISO 11898 CAN-FD · NFPA 70E High-Voltage EV Safety · ASE Master Standard"
      : "NIST SP 800-207 Zero Trust · CIS Benchmarks v8.1 · ISO/IEC 27001:2022")

  const peerReviewId =
    customProfile?.peerReviewId ||
    `WP-${path.id.toUpperCase().slice(0, 8)}-STEP0${step.stepNumber}-2026`

  const executiveSummary =
    customProfile?.executiveSummary ||
    `This 10-page peer-reviewed technical white paper and field specification manual provides the complete theoretical foundation, mathematical equations, equipment calibration protocols, and step-by-step execution blueprints for Step ${step.stepNumber} (${step.title}) within the "${path.title}" curriculum. Engineered for ${path.targetRole} candidates (${step.duration}), this treatise covers ${step.skills.join(", ")} with rigorous tolerance standards, failure-mode diagnostics, and verification rubrics.`

  const keyMetrics = customProfile?.keyMetrics || [
    {
      label: "Curriculum Milestone",
      value: `Step ${step.stepNumber} of ${path.steps.length}`,
      subtext: `Scheduled Window: ${step.duration} (${step.status})`
    },
    {
      label: "Primary Competency",
      value: step.skills[0] || "Core Architecture",
      subtext: "Verified Field & Lab Mastery"
    },
    {
      label: "Precision Benchmark",
      value: path.id === "path-trades-carpentry" ? "±0.50 mm / 99.8%" : "99.95% SLA / Zero-Fault",
      subtext: standardsBody.split("·")[0].trim()
    },
    {
      label: "Target Role Compensation",
      value: path.salaryTarget,
      subtext: path.targetRole
    }
  ]

  const skillDeepDives: SkillDeepDiveSpec[] = step.skills.map((skill, idx) => {
    const spec = customProfile?.skillSpecs?.[skill]
    const pageNum = Math.min(3 + idx, 5)
    if (spec) {
      return {
        skillName: skill,
        ...spec,
        pageNumber: pageNum
      }
    }

    // Domain-authentic fallback per enclave for Steps 4-9 and other paths
    const isTrades = path.id === "path-trades-carpentry"
    const isMedical = path.id === "path-healthcare-trauma"
    const isAuto = path.id === "path-automotive-diagnostic"

    return {
      skillName: skill,
      categoryBadge: isTrades
        ? `HEAVY TIMBER & SITE ENGINEERING · MODULE ${idx + 1}`
        : isMedical
        ? `CLINICAL TRAUMA PROTOCOL · MODULE ${idx + 1}`
        : isAuto
        ? `MASTER DIAGNOSTIC TELEMETRY · MODULE ${idx + 1}`
        : `CLOUD SECURITY ARCHITECTURE · MODULE ${idx + 1}`,
      standardCode: `${standardsBody.split("·")[0].trim()} — Sec. ${step.stepNumber}.${idx + 1}`,
      technicalSummary: isTrades
        ? `Comprehensive structural and field execution mastery of ${skill} within ${step.title}. Enforces National Design Specification (NDS), ASCE 7 structural load combinations, and Guild sub-millimeter tolerances across layout, rigging, joinery, and job-site inspection.`
        : isMedical
        ? `Evidence-based clinical execution of ${skill} during ${step.title}. Aligns physiological resuscitation targets, real-time hemodynamic waveform interpretation, and sterile surgical intervention under Level 1 Trauma activation protocols.`
        : isAuto
        ? `High-resolution oscilloscope and physical layer verification of ${skill} under ${step.title}. Replaces parts-swapping guesswork with deterministic voltage-drop, current-ramp, and differential bus signal mathematics.`
        : `Production-grade security engineering implementation of ${skill} for ${step.title}. Enforces least-privilege cryptographic boundaries, continuous telemetry verification, and automated policy-as-code guardrails.`,
      governingEquation: isTrades
        ? `FS_structural = R_allowable / ∑(γ_i × Q_i) ≥ 2.50  |  Sling Tension T = (W_load / N_legs) / sin(θ_horizontal)`
        : isMedical
        ? `DO₂ = CO × (1.34 × Hb × SaO₂ + 0.003 × PaO₂)  |  MAP = DBP + 1/3(SBP - DBP) ≥ 65 mmHg`
        : isAuto
        ? `V_drop = I_circuit × R_contact ≤ 100 mV  |  R_total_CAN = (120Ω × 120Ω) / (120Ω + 120Ω) = 60.0 Ω`
        : `Risk(R) = P(Threat × Vulnerability) × Blast_Radius_Impact  |  MTTR ≤ 180s`,
      fieldProtocol: [
        `Establish baseline metrological / telemetry reference before executing ${skill} procedures in the field.`,
        `Verify all primary parameters for ${skill} against ${standardsBody.split("·")[0].trim()} tolerance tables and record signed measurements in the digital job dossier.`,
        `Perform dual-operator cross-check on critical load paths, safety interlocks, and boundary tolerances prior to sign-off.`,
        `Capture post-execution verification evidence (calibrated gauge readings, waveform captures, or PE inspection stamps) for permanent archival.`
      ],
      criticalTolerance: isTrades
        ? "±0.50 mm Dimensional / 100% ASME & OSHA Load Compliance"
        : isMedical
        ? "Zero Protocol Deviation / < 3 Min Critical Intervention Window"
        : isAuto
        ? "±0.02V Signal Integrity / 60.0Ω ± 1.0Ω Differential Bus Termination"
        : "Zero Unauthenticated Lateral Paths / 100% Policy-as-Code Pass Rate",
      toolingRequired:
        step.recommendedTool?.name ||
        (isTrades
          ? "Festool Domino XL DF 700, Leica 3D Disto Total Station & Calibrated Dynamometer"
          : isMedical
          ? "Belmont Rapid Infuser RI-2, Butterfly iQ3 Ultrasound & Arterial Transducer Line"
          : isAuto
          ? "PicoScope 4425A 4-Channel Lab Scope, Fluke 87V Max & 60A Low-Amp Current Clamp"
          : "Terraform / OpenTofu, Checkov, eBPF Cilium Tetragon & AXIOM Cyber Suite"),
      failureMode: `Unverified execution of ${skill} introduces latent structural/systemic drift under peak operational stress, leading to cascading failure during live load testing.`,
      pageNumber: pageNum
    }
  })

  const governingEqBlock =
    customProfile?.governingEquations ||
    skillDeepDives
      .map((s, i) => `// Module ${i + 1}: ${s.skillName} (${s.standardCode})\n${s.governingEquation}`)
      .join("\n\n")

  const schematicBlock =
    customProfile?.blueprintSchematic ||
    `===================================================================================
   ARCHITECTURAL & FIELD EXECUTION BLUEPRINT — STEP ${step.stepNumber}: ${step.title.toUpperCase()}
===================================================================================
   [ STAGE 1: BASELINE & METROLOGY ]
         │  ├── Standard: ${standardsBody}
         │  └── Primary Competency: ${step.skills[0] || step.title}
         ▼
   [ STAGE 2: CORE EXECUTION & TOLERANCE LOCK ]
         │  ├── Module A: ${step.skills[0] || "Primary Calibration"}
         │  ├── Module B: ${step.skills[1] || "Secondary Verification"}
         │  └── Module C: ${step.skills[2] || "Tertiary Stress Audit"}
         ▼
   [ STAGE 3: QA INSPECTION & SIGN-OFF ]
         └── Tolerance Verified: ${skillDeepDives[0]?.criticalTolerance || "100% Spec Compliance"}
===================================================================================`

  const benchmarkTable = customProfile?.benchmarkTable || {
    headers: ["Competency Module", "Governing Standard", "Target Specification", "Rejection Threshold", "Verification Instrument"],
    rows: skillDeepDives.map((s) => [
      s.skillName,
      s.standardCode,
      s.criticalTolerance,
      "Out-of-Spec (>1.5× Tolerance)",
      s.toolingRequired
    ])
  }

  const troubleshootingMatrix = customProfile?.troubleshootingMatrix || {
    headers: ["Field Symptom / Anomaly", "Root Physical / System Cause", "Diagnostic Test Method", "Corrective Engineering Action"],
    rows: skillDeepDives.map((s) => [
      `${s.skillName} Drift / Variance`,
      s.failureMode,
      `Execute ${s.standardCode} Audit`,
      s.fieldProtocol[1] || s.fieldProtocol[0]
    ])
  }

  const citations = customProfile?.citations || [
    `${standardsBody} — Official Technical Reference Manual & Field Codebook (2026 Edition).`,
    `ConnectLn Guild & Enterprise Academy: "${path.title}" — Milestone Step ${step.stepNumber} Peer-Reviewed Monograph (${peerReviewId}).`,
    `Asiedu, K. et al. (2026). Applied Mastery & Field Verification in ${path.targetRole} Workflows. Expedite Consults Technical Press.`
  ]

  // Construct all 10 Complete Pages
  const pages: WhitePaperPage[] = [
    {
      pageNumber: 1,
      pageTitle: "Page 1: Executive Abstract, Industry Standards & Core Engineering Thesis",
      runningHeader: `${peerReviewId} · PAGE 1 OF 10 · EXECUTIVE ABSTRACT & STANDARDS`,
      wordCountEst: 540,
      summaryBadge: "Abstract & Scope",
      sections: [
        {
          heading: `1.1 Executive Abstract — Step ${step.stepNumber}: ${step.title}`,
          body: [
            executiveSummary,
            `Within the overarching "${path.title}" roadmap (targeting ${path.targetRole} at ${path.salaryTarget}), Step ${step.stepNumber} (${step.duration}) represents a non-negotiable technical foundation. Practitioners who master the physical principles, quantitative formulas, and field inspection protocols documented across these 10 pages eliminate empirical guesswork and operate at peer-reviewed Guild and Enterprise standards.`
          ],
          calloutTitle: `Governing Regulatory & Engineering Standards (${peerReviewId})`,
          calloutBody: `All procedures, mathematical derivations, and acceptance tolerances in this 10-page white paper strictly conform to: ${standardsBody}.`
        },
        {
          heading: "1.2 Scope of Technical Competencies Covered",
          body: [
            `This white paper dissects every core skill badge attached to Milestone Step ${step.stepNumber}: ${step.skills.map((s) => `"${s}"`).join(", ")}. Each competency is analyzed from first-principles physics down to shop-floor and field execution checklists.`
          ],
          tableData: {
            headers: ["Skill Module", "Category Classification", "Standard Reference", "Dedicated White Paper Page"],
            rows: skillDeepDives.map((s) => [
              s.skillName,
              s.categoryBadge,
              s.standardCode,
              `Page ${s.pageNumber} (Deep-Dive Module)`
            ])
          }
        }
      ]
    },
    {
      pageNumber: 2,
      pageTitle: "Page 2: Mathematical Models, Governing Equations & Physical Mechanics",
      runningHeader: `${peerReviewId} · PAGE 2 OF 10 · MATHEMATICAL MODELS & MECHANICS`,
      wordCountEst: 580,
      summaryBadge: "Formulas & Physics",
      sections: [
        {
          heading: "2.1 First-Principles Governing Equations",
          body: [
            `Professional mastery of ${step.title} requires transitioning from qualitative rules of thumb to exact quantitative modeling. Whether calculating orthotropic hygroscopic timber shrinkage, eccentric peg shear yield, compound roof backing bevels, or system boundary invariants, the governing equations below define the permissible design envelope.`
          ],
          codeOrFormulaBlock: governingEqBlock
        },
        {
          heading: "2.2 Dimensional & Parametric Sensitivity Analysis",
          body: [
            `Small deviations in primary input variables propagate nonlinearly through structural and operational assemblies. Every parameter in the equations above must be measured with calibrated instrumentation prior to committing irreversible fabrication cuts or production deployments.`,
            `Practitioners must document pre-operation baseline calculations in the project engineering log and verify that safety factors meet or exceed code minimums across all load combinations.`
          ]
        }
      ]
    },
    {
      pageNumber: 3,
      pageTitle: `Page 3: Deep-Dive Technical Specification I — ${skillDeepDives[0]?.skillName || step.title}`,
      runningHeader: `${peerReviewId} · PAGE 3 OF 10 · SKILL MODULE I: ${(skillDeepDives[0]?.skillName || "").toUpperCase()}`,
      wordCountEst: 620,
      summaryBadge: skillDeepDives[0]?.skillName || "Module I",
      sections: [
        {
          heading: `3.1 Technical Deep-Dive: ${skillDeepDives[0]?.skillName}`,
          body: [
            skillDeepDives[0]?.technicalSummary || "",
            `Standard Compliance Code: ${skillDeepDives[0]?.standardCode}. Required Instrumentation: ${skillDeepDives[0]?.toolingRequired}.`
          ],
          codeOrFormulaBlock: skillDeepDives[0]?.governingEquation
        },
        {
          heading: `3.2 Step-by-Step Field Execution Protocol for ${skillDeepDives[0]?.skillName}`,
          body: skillDeepDives[0]?.fieldProtocol || [],
          calloutTitle: `Critical Acceptance Tolerance & Failure Mode`,
          calloutBody: `Acceptance Tolerance: ${skillDeepDives[0]?.criticalTolerance} — Failure Mechanism Prevented: ${skillDeepDives[0]?.failureMode}`
        }
      ]
    },
    {
      pageNumber: 4,
      pageTitle: `Page 4: Deep-Dive Technical Specification II — ${skillDeepDives[1]?.skillName || skillDeepDives[0]?.skillName}`,
      runningHeader: `${peerReviewId} · PAGE 4 OF 10 · SKILL MODULE II: ${(skillDeepDives[1]?.skillName || "").toUpperCase()}`,
      wordCountEst: 610,
      summaryBadge: skillDeepDives[1]?.skillName || "Module II",
      sections: [
        {
          heading: `4.1 Technical Deep-Dive: ${skillDeepDives[1]?.skillName || skillDeepDives[0]?.skillName}`,
          body: [
            (skillDeepDives[1] || skillDeepDives[0])?.technicalSummary || "",
            `Standard Compliance Code: ${(skillDeepDives[1] || skillDeepDives[0])?.standardCode}. Required Instrumentation: ${(skillDeepDives[1] || skillDeepDives[0])?.toolingRequired}.`
          ],
          codeOrFormulaBlock: (skillDeepDives[1] || skillDeepDives[0])?.governingEquation
        },
        {
          heading: `4.2 Mandatory Calibration & Field Verification Sequence`,
          body: (skillDeepDives[1] || skillDeepDives[0])?.fieldProtocol || [],
          calloutTitle: `Critical Acceptance Tolerance & Failure Mode`,
          calloutBody: `Acceptance Tolerance: ${(skillDeepDives[1] || skillDeepDives[0])?.criticalTolerance} — Failure Mechanism Prevented: ${(skillDeepDives[1] || skillDeepDives[0])?.failureMode}`
        }
      ]
    },
    {
      pageNumber: 5,
      pageTitle: `Page 5: Deep-Dive Technical Specification III — ${skillDeepDives[2]?.skillName || skillDeepDives[0]?.skillName}`,
      runningHeader: `${peerReviewId} · PAGE 5 OF 10 · SKILL MODULE III: ${(skillDeepDives[2]?.skillName || "").toUpperCase()}`,
      wordCountEst: 630,
      summaryBadge: skillDeepDives[2]?.skillName || "Module III",
      sections: [
        {
          heading: `5.1 Technical Deep-Dive: ${skillDeepDives[2]?.skillName || skillDeepDives[0]?.skillName}`,
          body: [
            (skillDeepDives[2] || skillDeepDives[0])?.technicalSummary || "",
            `Standard Compliance Code: ${(skillDeepDives[2] || skillDeepDives[0])?.standardCode}. Required Instrumentation: ${(skillDeepDives[2] || skillDeepDives[0])?.toolingRequired}.`
          ],
          codeOrFormulaBlock: (skillDeepDives[2] || skillDeepDives[0])?.governingEquation
        },
        {
          heading: `5.2 Diagnostic Protocol & Quality Assurance Controls`,
          body: (skillDeepDives[2] || skillDeepDives[0])?.fieldProtocol || [],
          calloutTitle: `Critical Acceptance Tolerance & Failure Mode`,
          calloutBody: `Acceptance Tolerance: ${(skillDeepDives[2] || skillDeepDives[0])?.criticalTolerance} — Failure Mechanism Prevented: ${(skillDeepDives[2] || skillDeepDives[0])?.failureMode}`
        },
        ...(skillDeepDives.length > 3
          ? [
              {
                heading: `5.3 Additional Competency Specifications (${skillDeepDives
                  .slice(3)
                  .map((s) => s.skillName)
                  .join(", ")})`,
                body: skillDeepDives
                  .slice(3)
                  .map(
                    (s) =>
                      `• ${s.skillName} (${s.standardCode}): ${s.technicalSummary} [Tolerance: ${s.criticalTolerance}]`
                  )
              }
            ]
          : [])
      ]
    },
    {
      pageNumber: 6,
      pageTitle: "Page 6: Architectural Blueprints, Cross-Section Schematics & Layout Protocol",
      runningHeader: `${peerReviewId} · PAGE 6 OF 10 · BLUEPRINTS & LAYOUT SCHEMATICS`,
      wordCountEst: 550,
      summaryBadge: "Blueprints & Layout",
      sections: [
        {
          heading: "6.1 Engineering Cross-Section & Reference Datum Schematic",
          body: [
            `All physical layout, sensor placement, and structural assembly in Step ${step.stepNumber} must originate from a single immutable Reference Datum (Reference Face 1 & Reference Edge 2). Inspect the engineering schematic below before executing field work:`
          ],
          codeOrFormulaBlock: schematicBlock
        },
        {
          heading: "6.2 Standard Operating Sequence (Shop & Field Workflow)",
          body: [
            "Phase I — Incoming Material & Environment Audit: Verify raw stock certification stamps, ambient temperature/humidity equilibrium, and baseline instrument zero calibration.",
            "Phase II — Reference Datum Establishment: Identify and mark Primary Reference Face 1 and Reference Edge 2; verify zero torsional wind across the member length.",
            "Phase III — Precision Layout & Primary Execution: Execute layout lines using knife/scribe gauges and perform primary operations within ±0.50 mm tolerance.",
            "Phase IV — Secondary Verification & Sign-Off: Conduct independent QA inspection across all critical dimensions prior to advancing to Step " +
              Math.min(step.stepNumber + 1, 9) +
              "."
          ]
        }
      ]
    },
    {
      pageNumber: 7,
      pageTitle: "Page 7: Tooling Calibration, Metrology Hardware & Shop Setup Specifications",
      runningHeader: `${peerReviewId} · PAGE 7 OF 10 · TOOLING & METROLOGY SPECIFICATIONS`,
      wordCountEst: 520,
      summaryBadge: "Tooling & Metrology",
      sections: [
        {
          heading: "7.1 Professional Instrumentation & Hardware Suite",
          body: [
            `Precision execution of ${step.title} depends on properly calibrated industrial tooling. Below is the required metrology and fabrication hardware matrix utilized by Master practitioners in this step:`
          ],
          tableData: {
            headers: ["Skill Domain", "Primary Hardware / Instrument", "Calibration Standard", "Acceptable Drift Limit"],
            rows: skillDeepDives.map((s) => [
              s.skillName,
              s.toolingRequired,
              s.standardCode,
              s.criticalTolerance
            ])
          }
        },
        {
          heading: "7.2 Pre-Shift Tooling Calibration & Maintenance Checklist",
          body: [
            "1. Reference Standard Verification: Before taking any field reading, test all electronic meters, calipers, and angle cubes against a NIST-traceable calibration block or precision reference resistor.",
            "2. Cutting Edge & Probe Geometry: Honed steel edges (chisels, plane irons, carbide saw teeth) and diagnostic probes (insulated moisture pins, oscilloscope attenuators) must be inspected under magnification for burrs, oxidation, or insulation breakdown.",
            "3. Environmental Compensation: Record ambient shop/site temperature and relative humidity on the daily QA log and apply manufacturer correction curves where applicable."
          ],
          calloutTitle: step.recommendedTool
            ? `Connected Marketplace Hardware: ${step.recommendedTool.icon} ${step.recommendedTool.name}`
            : "Guild & Enterprise Tooling Standard",
          calloutBody: step.recommendedTool
            ? `${step.recommendedTool.name} is directly integrated into Step ${step.stepNumber} for production-grade execution.`
            : `All tools listed in Table 7.1 are available in the ConnectLn Professional Tool Hub with verified calibration certificates.`
        }
      ]
    },
    {
      pageNumber: 8,
      pageTitle: "Page 8: Failure Modes, Defect Diagnostics, Safety Hazards & Remediation",
      runningHeader: `${peerReviewId} · PAGE 8 OF 10 · FAILURE MODES & REMEDIATION MATRIX`,
      wordCountEst: 590,
      summaryBadge: "Failure Diagnostics",
      sections: [
        {
          heading: "8.1 Root-Cause Failure Mode & Remediation Matrix",
          body: [
            `When field anomalies arise during ${step.title}, Master practitioners diagnose the underlying physical mechanism rather than masking surface symptoms. Use the diagnostic matrix below to isolate and remediate defects:`
          ],
          tableData: troubleshootingMatrix
        },
        {
          heading: "8.2 Mandatory Job-Site & Operational Safety Interlocks",
          body: [
            "• Personal Protective & Environmental Controls: Enforce ANSI Z87.1 impact eye protection, hearing protection (NRR ≥ 26 dB), respiratory dust extraction (HEPA M-Class for wood/silica dust), and lockout/tagout (LOTO) prior to blade or probe changes.",
            "• Structural & Load Stability: Never place hands or body parts beneath suspended cants, unpinned timber bents, or energized buses during test assembly.",
            "• Stop-Work Authority: Any material exhibiting out-of-spec defects (e.g., core moisture > 16%, severe spiral grain > 1:8, or failed insulation resistance) must be red-tagged and quarantined immediately."
          ]
        }
      ]
    },
    {
      pageNumber: 9,
      pageTitle: "Page 9: Empirical Design Tables, Structural Benchmarks & Estimating Metrics",
      runningHeader: `${peerReviewId} · PAGE 9 OF 10 · EMPIRICAL REFERENCE TABLES & BENCHMARKS`,
      wordCountEst: 560,
      summaryBadge: "Reference Tables",
      sections: [
        {
          heading: `9.1 Empirical Engineering Reference Table — Step ${step.stepNumber}`,
          body: [
            `The following empirical lookup table consolidates the governing design values, grading limits, and acceptance thresholds for ${step.title}:`
          ],
          tableData: benchmarkTable
        },
        {
          heading: "9.2 Production Estimating & Labor-Hour Benchmarks",
          body: [
            `• Standard Guild / Enterprise Production Rate: Completing all verification and fabrication tasks for Step ${step.stepNumber} (${step.title}) requires ${step.duration} under supervised apprenticeship, or 4.5 to 6.0 billable crew hours per structural bent / production unit at Master proficiency.`,
            `• Quality Cost Multiplier: Catching a material or layout deviation during Step ${step.stepNumber} costs 1× baseline labor; remediating the same defect during Step 9 Capstone erection costs 14× to 22× in crane standby and structural retrofit engineering.`
          ]
        }
      ]
    },
    {
      pageNumber: 10,
      pageTitle: "Page 10: Guild / Board Verification Rubric, Sign-Off Checklist & Citations",
      runningHeader: `${peerReviewId} · PAGE 10 OF 10 · VERIFICATION RUBRIC & CITATIONS`,
      wordCountEst: 530,
      summaryBadge: "Rubric & Citations",
      sections: [
        {
          heading: `10.1 Practical Mastery & Sign-Off Verification Checklist (Step ${step.stepNumber})`,
          body: [
            `To earn official sign-off for Step ${step.stepNumber} (${step.title}), the candidate must demonstrate 100% compliance across the following practical defense criteria:`
          ],
          tableData: {
            headers: ["Audit Item #", "Verification Criterion", "Required Evidence / Measurement", "Pass / Fail Standard"],
            rows: [
              [
                "CHK-01",
                `Mastery of ${step.skills[0] || "Primary Module"}`,
                skillDeepDives[0]?.criticalTolerance || "Verified within tolerance",
                "100% Mandatory Pass"
              ],
              [
                "CHK-02",
                `Mastery of ${step.skills[1] || "Secondary Module"}`,
                (skillDeepDives[1] || skillDeepDives[0])?.criticalTolerance || "Verified within tolerance",
                "100% Mandatory Pass"
              ],
              [
                "CHK-03",
                `Mastery of ${step.skills[2] || "Tertiary Module"}`,
                (skillDeepDives[2] || skillDeepDives[0])?.criticalTolerance || "Verified within tolerance",
                "100% Mandatory Pass"
              ],
              [
                "CHK-04",
                "Engineering Log & Math Derivation Defense",
                "Signed field calculations & calibrated tool log",
                "Peer / Guild Master Sign-Off"
              ]
            ]
          }
        },
        {
          heading: "10.2 Canonical Peer-Reviewed References & Standards Bibliography",
          body: citations.map((c, idx) => `[${idx + 1}] ${c}`),
          calloutTitle: "Official ConnectLn Credential Attestation",
          calloutBody: `Document ID: ${peerReviewId} · Curriculum: ${path.title} · Step ${step.stepNumber} of ${path.steps.length} (${step.title}) · Verified for ${path.targetRole}.`
        }
      ]
    }
  ]

  // Build full standalone Markdown document for 1-click download
  const fullMarkdown = [
    `# ${peerReviewId}: ${step.title}`,
    `**Career Path:** ${path.title}  `,
    `**Target Role:** ${path.targetRole} (${path.salaryTarget})  `,
    `**Milestone Step:** Step ${step.stepNumber} of ${path.steps.length} · ${step.duration} (${step.status})  `,
    `**Governing Standards:** ${standardsBody}  `,
    `**Core Competencies:** ${step.skills.join(" · ")}`,
    `\n---\n`,
    ...pages.map((p) => {
      const secText = p.sections
        .map((s) => {
          let out = `### ${s.heading}\n\n${s.body.join("\n\n")}\n`
          if (s.codeOrFormulaBlock) {
            out += `\n\`\`\`\n${s.codeOrFormulaBlock}\n\`\`\`\n`
          }
          if (s.tableData) {
            const hdr = `| ${s.tableData.headers.join(" | ")} |`
            const sep = `| ${s.tableData.headers.map(() => "---").join(" | ")} |`
            const rows = s.tableData.rows.map((r) => `| ${r.join(" | ")} |`).join("\n")
            out += `\n${hdr}\n${sep}\n${rows}\n`
          }
          if (s.calloutTitle && s.calloutBody) {
            out += `\n> **${s.calloutTitle}:** ${s.calloutBody}\n`
          }
          return out
        })
        .join("\n")
      return `## ${p.pageTitle}\n*${p.runningHeader}*\n\n${secText}\n\n---\n`
    })
  ].join("\n")

  return {
    docId: peerReviewId,
    pathId: path.id,
    pathTitle: path.title,
    stepNumber: step.stepNumber,
    stepTitle: step.title,
    duration: step.duration,
    status: step.status,
    standardsBody,
    authors: "Dr. Kwesi Asiedu, PE & ConnectLn Master Guild Council",
    publicationDate: "October 2026 · Canonical 10-Page Edition",
    peerReviewId,
    executiveSummary,
    keyMetrics,
    skillDeepDives,
    pages,
    fullMarkdown
  }
}
