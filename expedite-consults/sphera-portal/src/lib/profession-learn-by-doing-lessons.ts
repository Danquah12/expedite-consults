import type { LearnByDoingLesson } from './skilled-trades-learn-by-doing-data'

export const PROFESSION_LEARN_BY_DOING_LESSONS: LearnByDoingLesson[] = [
  // ─── WELDING (#29) ────────────────────────────────────────────────────────
  {
    id: 'lbd_welding_stick_basics_29',
    lessonNumber: 29,
    videoLabel: 'Video 29: Stick Welding Basics (SMAW)',
    title: 'Stick Welding Basics: Full Tutorial',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Beginner',
    originalCreator: 'TimWelds',
    creatorDomain: 'youtube.com',
    description:
      'Step-by-step beginner guide to Shielded Metal Arc Welding (SMAW), covering polarity setup, E6010/E6011 vs. E7018 electrode selection, arc length control, and reading the molten weld puddle.',
    skillsCovered: [
      'SMAW Polarity & Amperage Setup',
      'Striking & Maintaining Arc Length',
      'Electrode Drag Angle & Travel Speed',
      'Slag Removal & Bead Inspection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Dybrlx-BTXk',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Dybrlx-BTXk',
    youtubeId: 'Dybrlx-BTXk',
    embedAvailable: true,
    duration: '14:37',
    thumbnailUrl: 'https://i.ytimg.com/vi/Dybrlx-BTXk/hqdefault.jpg',
    practiceActivity:
      'Set your stick welder polarity (DCEP for E7018), dial in amperage per rod diameter (~90–125A for 1/8"), and run three overlapping stringer beads on 1/4" mild steel plate.',
    practiceDeliverablePrompt:
      'Note your electrode type (e.g., 7018 or 6011), amperage setting, travel speed observations, and inspect the chipped bead for uniform ripples and lack of undercut.',
    knowledgeCheck: {
      question:
        'Why is a tight, consistent arc length (roughly equal to the diameter of the electrode core) essential when stick welding with E7018 rods?',
      options: [
        'It stabilizes arc voltage, concentrates heat in the puddle, and lets shielding gas from the flux protect the molten weld from porosity',
        'It makes the slag stick permanently so it cannot be chipped off',
        'It increases spatter so the bead spreads wider across cold metal',
        'It lowers amperage automatically when the work clamp is disconnected'
      ],
      correctIndex: 0,
      explanation:
        'Holding a short, steady arc keeps the localized flux shielding cloud over the molten pool, preventing atmospheric nitrogen/oxygen porosity and arc blow.'
    },
    detailedStudyNotes: [
      'Polarity & Amperage Rule of Thumb: Run DCEP (Electrode Positive) for most E7018/E6010 beads and set starter amps close to the decimal thickness of the rod core (e.g., 3/32" ≈ 90–100A, 1/8" ≈ 115–130A).',
      'Scratch vs. Tap Start: Scratch like striking a match on thick mill scale, lift briefly to establish the arc, then drop back down to a tight arc length.',
      'Push vs. Pull (Drag): Stick welding drags ("if there is slag, you drag") at a 10°–20° travel angle to keep molten slag trailing behind the solidified weld metal.',
      'Peeling Slag & Post-Weld Check: Wait a few seconds before chipping slag with safety glasses on; even, self-lifting E7018 slag signals balanced heat and travel speed.'
    ],
    fieldTip: 'Keep E7018 low-hydrogen electrodes stored in a dry rod oven so moisture never introduces hydrogen cracking into structural steel welds.'
  },

  // ─── MASONRY & TILE (#30–31) ──────────────────────────────────────────────
  {
    id: 'lbd_masonry_bricklaying_30',
    lessonNumber: 30,
    videoLabel: 'Video 30: Bricklaying & Mortar Bed Spread',
    title: 'Bricklaying Lesson 1: Spreading Mortar & Laying Your First Course',
    category: 'Masonry & Tile',
    enclaveId: 'trades_construction',
    professionId: 'local_artisan',
    level: 'Beginner',
    originalCreator: 'stu crompton',
    creatorDomain: 'youtube.com',
    description:
      'Master bricklayer demonstration showing how to load a brick trowel, furrow a consistent mortar bed, butter head joints (perps), and lay bricks level to a string line.',
    skillsCovered: [
      'Loading the Brick Trowel Cleanly',
      'Spreading & Furrowing the Mortar Bed',
      'Buttering Perpendicular Head Joints',
      'Level, Plumb & Line Alignment'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=DoMFFPvp4oc',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=DoMFFPvp4oc',
    youtubeId: 'DoMFFPvp4oc',
    embedAvailable: true,
    duration: '12:39',
    thumbnailUrl: 'https://i.ytimg.com/vi/DoMFFPvp4oc/hqdefault.jpg',
    practiceActivity:
      'Practice picking mortar off a mortar board and laying a 5-brick dry/wet running bond row aligned level and flush to a mason line.',
    practiceDeliverablePrompt:
      'Describe how you furrowed the mortar bed without scraping all the mortar off the base and kept your 10mm (3/8") head and bed joints uniform.',
    knowledgeCheck: {
      question:
        'Why do bricklayers lightly furrow the mortar bed with the point of the trowel before setting a brick down?',
      options: [
        'It spreads the mortar toward the brick edges so pressing the brick seats evenly to the gauge line without trapping hollow voids at the face',
        'It removes all moisture from the mortar so it hardens instantly',
        'It replaces the need for buttering head joints between bricks',
        'It prevents mortar from adhering to the lower course'
      ],
      correctIndex: 0,
      explanation:
        'Furrowing distributes mortar across the bearing surface so gentle tapping beds the brick level cleanly without excessive squeeze-out.'
    },
    detailedStudyNotes: [
      'Consistency Test: Properly tempered Type N/S mortar clings smoothly to an upside-down trowel edge without slumping off like soup.',
      'Rolled Wrist Spread: Glide the trowel blade smoothly to leave a 15–18mm cushion that compresses down to a standard 10mm (3/8") finished bed joint.',
      'Buttering Perps cleanly: Scrape a neat wedge of mortar onto the leading edge of each brick so vertical head joints fill completely front-to-back.',
      'Never Drag After Initial Set: If a brick sits crooked after mortar begins stiffening, lift it off cleanly and relay fresh mortar instead of hammering a drying joint.'
    ],
    fieldTip: 'Wait until mortar reaches "thumbprint hard" before tooling joints with a brick jointer—tooling wet mortar smears the brick face and weakens the surface.'
  },
  {
    id: 'lbd_tile_floor_layout_31',
    lessonNumber: 31,
    videoLabel: 'Video 31: Floor & Wall Tile Installation',
    title: 'Tile Installation 101: Step-by-Step Layout, Thinset & Grouting',
    category: 'Masonry & Tile',
    enclaveId: 'trades_construction',
    professionId: 'construction_worker',
    level: 'Beginner',
    originalCreator: 'DIYTyler',
    creatorDomain: 'youtube.com',
    description:
      'Complete walkthrough of residential and commercial tiling: subfloor deflection prep, snapping balanced chalk layout lines, selecting trowel notch sizes, back-buttering tiles, and grouting.',
    skillsCovered: [
      'Subfloor Prep & Decoupling Membrane',
      'Balanced Chalk Grid & Dry-Fit Layout',
      'Directional Thinset Troweling & Back-Buttering',
      'Tile Spacers, Leveling Clips & Grouting'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=qs03sgG8wu0',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=qs03sgG8wu0',
    youtubeId: 'qs03sgG8wu0',
    embedAvailable: true,
    duration: '16:41',
    thumbnailUrl: 'https://i.ytimg.com/vi/qs03sgG8wu0/hqdefault.jpg',
    practiceActivity:
      'Snap perpendicular chalk reference lines on a test board or floor room to calculate border tile widths and verify zero awkward narrow sliver cuts.',
    practiceDeliverablePrompt:
      'Share your room measurements, chosen starting center offset, notch trowel dimension, and how you collapsed thinset ridges perpendicularly.',
    knowledgeCheck: {
      question:
        'Why should thinset mortar ridges be combed in straight parallel lines rather than swirls, followed by pressing the tile slightly back and forth perpendicular to the ridges?',
      options: [
        'Straight parallel ridges collapse cleanly as trapped air escapes sideways, achieving near-100% mortar coverage underneath the tile',
        'Swirls look prettier through opaque ceramic tile',
        'Perpendicular movement dries out the thinset before contact',
        'Parallel ridges eliminate the need to ever cut edge tiles'
      ],
      correctIndex: 0,
      explanation:
        'Straight combed ridges vent trapped air out the ends when the tile is embedded perpendicularly, eliminating hollow weak spots that crack under load.'
    },
    detailedStudyNotes: [
      'Layout First (No Slivers): Shift centerlines by half a tile width whenever calculations show perimeter border cuts smaller than half a tile.',
      'Notch Sizing by Tile Format: Small mosaics use 3/16" V-notch, medium tiles 1/4"x3/8" square notch, and large-format planks require 1/2"x1/2" notch plus back-buttering.',
      'Check Mortar Coverage: Pull up one sample tile after bedding it—you want full mortar transfer across the back (≥80% dry areas, ≥95% wet/heavy traffic).',
      'Grout Cleanup Discipline: Rinse sponge in clean water frequently and wipe diagonally across joints so you do not scoop wet grout out of the recessed lines.'
    ],
    fieldTip: 'Always use a clean damp sponge to clear squeeze-out thinset from grout channels immediately after setting each course—hardened thinset is brutal to scrape later.'
  },

  // ─── ROOFING & DRYWALL (#32–33) ───────────────────────────────────────────
  {
    id: 'lbd_drywall_install_32',
    lessonNumber: 32,
    videoLabel: 'Video 32: Drywall Hanging Fundamentals',
    title: 'Drywall Installation Fundamentals: Measuring, Hanging & Fastening',
    category: 'Roofing & Drywall',
    enclaveId: 'trades_construction',
    professionId: 'construction_worker',
    level: 'Beginner',
    originalCreator: 'The Home Depot Canada',
    creatorDomain: 'youtube.com',
    description:
      'Essential drywall hanging techniques including scoring and snapping gypsum sheets accurately, cutting electrical box openings, setting proper screw dimple depth, and staggering wall seams.',
    skillsCovered: [
      'Scoring & Snapping Gypsum Sheets',
      'Outlet Box & Obstacle Cutouts',
      'Proper Screw Dimple Depth Setting',
      'Staggering Horizontal Butt & Tapered Joints'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=S39Rd8pGcDk',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=S39Rd8pGcDk',
    youtubeId: 'S39Rd8pGcDk',
    embedAvailable: true,
    duration: '3:10',
    thumbnailUrl: 'https://i.ytimg.com/vi/S39Rd8pGcDk/hqdefault.jpg',
    practiceActivity:
      'Score, snap cleanly along a T-square, rasp the cut edge smooth, and drive test drywall screws using a dimpler bit into stud framing without tearing the face paper.',
    practiceDeliverablePrompt:
      'Note your blade-to-T-square measuring method, screw spacing along field vs. perimeter studs, and how you inspected screw heads for unbroken paper.',
    knowledgeCheck: {
      question:
        'What happens if a drywall screw is driven too deep and tears through the outer paper facing of the gypsum board?',
      options: [
        'It loses holding strength against the gypsum core and risks future nail pops or loose panels',
        'It makes the joint tape bond twice as strongly',
        'It eliminates the need for joint compound over that fastener',
        'It automatically fireproofs the stud cavity'
      ],
      correctIndex: 0,
      explanation:
        'Drywall screws rely on clamping the intact front paper face against the core; puncturing that paper removes structural holding strength.'
    },
    detailedStudyNotes: [
      'Ceiling First, Walls Top-Down: Always hang ceiling sheets before walls so upper wall sheets lock tightly against the ceiling perimeter and support edge framing.',
      'Screw Depth Calibration: A proper dimpler bit sets the screw head just below the surface paper (roughly 1/32") without breaking the paper fibers.',
      'Stagger Vertical Butt Joints: Never stack vertical panel seams continuously floor-to-ceiling; stagger adjacent rows onto different studs.',
      'Clean Routs Around Receptacles: Leave a clean 1/8" margin around electrical boxes so switch plates cover cleanly without hitting torn paper.'
    ],
    fieldTip: 'Keep a 1/2" lift gap between bottom wall sheets and bare concrete slabs using a foot lifter pry bar so slab moisture never wicks up into the drywall.'
  },
  {
    id: 'lbd_roofing_shingles_33',
    lessonNumber: 33,
    videoLabel: 'Video 33: Asphalt Shingle Roofing Basics',
    title: 'Roofing Basics: Installing Asphalt Roof Shingles & Starter Courses',
    category: 'Roofing & Drywall',
    enclaveId: 'trades_construction',
    professionId: 'roofer',
    level: 'Beginner',
    originalCreator: 'CCX Roofing',
    creatorDomain: 'youtube.com',
    description:
      'Clear field breakdown of asphalt shingle roof assembly: drip edge sequencing, synthetic underlayment, starter strip alignment, 6-inch offset stair-stepping, and nail-zone accuracy.',
    skillsCovered: [
      'Drip Edge & Starter Course Placement',
      'Staggered Shingle Stair-Stepping Pattern',
      'Four-to-Six Nail Zone Placement',
      'Eave Overhang & Valley Weatherproofing'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=4z0_QHE7a4w',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=4z0_QHE7a4w',
    youtubeId: '4z0_QHE7a4w',
    embedAvailable: true,
    duration: '6:35',
    thumbnailUrl: 'https://i.ytimg.com/vi/4z0_QHE7a4w/hqdefault.jpg',
    practiceActivity:
      'Draft an eave-to-ridge roof layer diagram showing roof deck, eave drip edge, ice/water shield, underlayment, rake drip edge, starter course, and first staggered field course.',
    practiceDeliverablePrompt:
      'Identify the correct nail zone target strip on an architectural shingle and explain why high-nailing voids manufacturer wind warranties.',
    knowledgeCheck: {
      question:
        'On an eave edge versus a rake edge, in what order are drip edge flashing and roof underlayment installed to shed water outward?',
      options: [
        'At the eave, drip edge goes UNDER the underlayment; along the rakes, drip edge goes OVER the underlayment',
        'Both eave and rake drip edges are nailed directly on top of the finished shingles',
        'Drip edge goes only along the ridge cap',
        'Underlayment is glued underneath the plywood decking inside the attic'
      ],
      correctIndex: 0,
      explanation:
        'Water draining down the underlayment runs onto the eave drip edge and off into the gutter, while rake drip edge laps over the underlayment edge to keep wind-driven rain out.'
    },
    detailedStudyNotes: [
      'Nail Zone Accuracy: Roofing nails must sit squarely in the double-layer reinforced nail line—too high misses the bottom shingle layer; too low leaves exposed nail heads.',
      'Overdrive Prevention: Tune pneumatic nailer pressure to seat nail heads flush against the shingle mat without cutting through fiberglass reinforcement.',
      'Stair-Step Seams: Offset sequential shingle courses cleanly (commonly 6" per course) so vertical end joints never align vertically down a slope.',
      'Fall Protection First: Always anchor harnesses cleanly to rated ridge anchors before stepping onto any pitched deck.'
    ],
    fieldTip: 'Snap vertical and horizontal chalk lines every few courses on broad roof planes so shingle reveals stay razor-straight all the way to the ridge.'
  },

  // ─── SOLAR & ENERGY (#34–35) ──────────────────────────────────────────────
  {
    id: 'lbd_solar_setup_34',
    lessonNumber: 34,
    videoLabel: 'Video 34: Complete Solar PV Step-by-Step Setup',
    title: 'Solar PV Setup: Step-by-Step Panel, Controller & Battery Assembly',
    category: 'Solar & Energy',
    enclaveId: 'energy_utilities_environment',
    professionId: 'solar_installer',
    level: 'Beginner',
    originalCreator: 'City Prepping',
    creatorDomain: 'youtube.com',
    description:
      'Hands-on walkthrough connecting solar PV arrays through DC breakers and MPPT charge controllers to lithium battery banks and pure-sine inverters with safe load sizing.',
    skillsCovered: [
      'Series vs. Parallel PV String Wiring',
      'MPPT Charge Controller Commissioning Sequence',
      'Battery-to-Inverter Fuse & Breaker Protection',
      'Wire Gauge ampacity & Voltage Drop Sizing'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=M89LDaTzgmo',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=M89LDaTzgmo',
    youtubeId: 'M89LDaTzgmo',
    embedAvailable: true,
    duration: '13:42',
    thumbnailUrl: 'https://i.ytimg.com/vi/M89LDaTzgmo/hqdefault.jpg',
    practiceActivity:
      'Draw a single-line wiring schematic from two solar panels (400W, 36V Voc each) through an MPPT controller to a 24V battery bank, listing breaker/fuse ratings and connection order.',
    practiceDeliverablePrompt:
      'Explain why the battery must always be connected to the MPPT charge controller BEFORE connecting the solar array PV leads.',
    knowledgeCheck: {
      question:
        'When commissioning an MPPT solar charge controller, what is the safe electrical connection sequence?',
      options: [
        'Connect the battery bank to the charge controller first (so it auto-detects system voltage), then turn on or connect the solar PV input',
        'Connect live unshielded solar panels first under bright midday sun, then hook up the battery later',
        'Wire panels directly to AC household outlets before adding a controller',
        'Short-circuit the positive and negative battery busbars together first'
      ],
      correctIndex: 0,
      explanation:
        'Connecting the battery first powers the controller logic and locks system voltage (12V/24V/48V) before high open-circuit PV voltage is applied.'
    },
    detailedStudyNotes: [
      'Never Disconnect MC4 Under Load: Always switch off the DC PV isolator/breaker before unplugging MC4 connectors to avoid hazardous DC arcs.',
      'Series vs. Parallel Stringing: Series adds Voltage (Voc) while Amps stay equal; Parallel adds Amps while Voltage stays constant—stay below controller Max Voc even in winter cold.',
      'Overcurrent Protection Closest to Battery: Place Class-T fuses or DC circuit breakers close to positive battery terminals to protect main cables.',
      'Cold-Temperature Voc Correction: Cold winter mornings spike open-circuit panel voltage upward; always keep a 15–20% voltage headroom below controller ratings.'
    ],
    fieldTip: 'Check MC4 crimps by tugging firmly on every lug and tightening torque-rated busbar lugs twice before energizing.'
  },
  {
    id: 'lbd_solar_components_35',
    lessonNumber: 35,
    videoLabel: 'Video 35: Solar System Architecture & Components',
    title: 'Solar Energy Fundamentals: Panels, Inverters & Battery Architecture',
    category: 'Solar & Energy',
    enclaveId: 'energy_utilities_environment',
    professionId: 'solar_installer',
    level: 'Beginner',
    originalCreator: 'The Solar Lab',
    creatorDomain: 'youtube.com',
    description:
      'Deep foundational explanation of how photovoltaic cells generate DC electricity, how MPPT controllers harvest peak power, how pure sine inverters convert to AC loads, and how storage banks buffer runtime.',
    skillsCovered: [
      'PV Array Generation & Irradiance Factors',
      'PWM vs. MPPT Conversion Efficiency',
      'Battery Bank Watt-Hour (Wh) Capacity Math',
      'Pure Sine vs. Modified Sine Inverter Selection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=EYeHB3CC9L8',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=EYeHB3CC9L8',
    youtubeId: 'EYeHB3CC9L8',
    embedAvailable: true,
    duration: '10:26',
    thumbnailUrl: 'https://i.ytimg.com/vi/EYeHB3CC9L8/hqdefault.jpg',
    practiceActivity:
      'Calculate daily watt-hours for 3 essential loads (e.g., 120W fridge 8h/day, 60W laptop 5h/day, 30W LED lights 6h/day) and size a 48V LiFePO4 battery bank with 20% reserve.',
    practiceDeliverablePrompt:
      'Submit your load table (Watts × Hours = Wh) and show why MPPT outperforms PWM when panel voltage exceeds battery bank voltage.',
    knowledgeCheck: {
      question:
        'How does an MPPT (Maximum Power Point Tracking) solar charge controller outperform an older PWM controller?',
      options: [
        'It acts like a high-efficiency DC-DC converter, stepping down excess panel voltage into additional charging current at peak panel power',
        'It spins a mechanical flywheel inside the solar panel frame',
        'It eliminates the need for wires between the array and inverter',
        'It boosts 12V batteries into grid-tie 480V three-phase directly'
      ],
      correctIndex: 0,
      explanation:
        'MPPT continuously tracks the panel Vmp/Imp sweet spot and converts higher panel voltage into extra amps into the battery bank, typically capturing 15–30% more energy.'
    },
    detailedStudyNotes: [
      'Watts, Volts, Amps & Watt-Hours: Remember Power (W) = Volts × Amps, and Energy stored or consumed equals Watts × Hours (Wh).',
      'Battery Depth of Discharge (DoD): Lead-acid batteries tolerate ~50% usable DoD before accelerated wear, while LiFePO4 banks safely deliver 80–90%+ usable capacity.',
      'Why Pure Sine Matters: Sensitive motors, variable-speed HVAC boards, and medical/electronics supplies run cooler and quieter on true Pure Sine Wave inverters.',
      'Tilt Angle & Shading Losses: Even partial leaf or chimney shade across one series panel cell group can sharply drag down string production without bypass diodes or microinverters.'
    ],
    fieldTip: 'Keep all high-current DC inverter cables identical in length across parallel battery pairs so every battery charges and discharges evenly.'
  },

  // ─── MACHINING & REPAIR (#36–37) ──────────────────────────────────────────
  {
    id: 'lbd_cnc_lathe_basics_36',
    lessonNumber: 36,
    videoLabel: 'Video 36: CNC Lathe Machining Foundations',
    title: 'CNC Lathe Machining for Beginners: Tooling, Offsets & Turning Basics',
    category: 'Machining & Repair',
    enclaveId: 'manufacturing_industrial',
    professionId: 'cnc_machinist',
    level: 'Beginner',
    originalCreator: 'Practical Machinist',
    creatorDomain: 'youtube.com',
    description:
      'Shop-floor introduction to CNC turning centers covering X and Z coordinate axes, workholding chucks, carbide insert tooling, touching off geometry offsets, and first safe dry-runs.',
    skillsCovered: [
      'CNC Lathe X (Diameter) & Z (Length) Axes',
      'Carbide Insert Tooling & Tool Turrets',
      'Work Offset (G54) & Tool Geometry Touch-Off',
      'Single-Block Dry Run & Feeds/Speeds Safety'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=cJYRuzNlloY',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=cJYRuzNlloY',
    youtubeId: 'cJYRuzNlloY',
    embedAvailable: true,
    duration: '14:16',
    thumbnailUrl: 'https://i.ytimg.com/vi/cJYRuzNlloY/hqdefault.jpg',
    practiceActivity:
      'Map out a simple turning operation sheet on paper: OD facing (Z0), rough turning to Ø1.000", finish pass, and grooving/parting sequence with X/Z coordinates.',
    practiceDeliverablePrompt:
      'Explain the difference between Machine Home, Work Coordinate Zero (G54 Z0 at part face), and Individual Tool Geometry Offsets.',
    knowledgeCheck: {
      question:
        'When facing the front of cylindrical bar stock on a 2-axis CNC lathe, which coordinate axis moves the cutting tool along the length toward or away from the chuck, and which controls diameter?',
      options: [
        'Z-axis moves longitudinally along the spindle centerline (part length), while X-axis moves radially perpendicular to control part diameter',
        'X-axis moves along the chuck depth and Z-axis spins the cooling fan',
        'Y-axis sets thread pitch while A-axis sets cutting fluid temperature',
        'Both X and Z only operate during manual tailstock drilling'
      ],
      correctIndex: 0,
      explanation:
        'Standard lathe turning uses Z along the spindle axis (Z0 at the finished part face) and X across the diameter (X0 at spindle centerline).'
    },
    detailedStudyNotes: [
      'Remove the Chuck Key & Secure Jaws: Always verify proper jaw clamping pressure, minimum chuck grip engagement, and clear spindle stick-out length before pressing Cycle Start.',
      'Touch-Off Accuracy: After facing a skim cut, record Z0; turn a test diameter, stop spindle, measure with a calibrated micrometer, and input X-offset without nudging the cross-slide prematurely.',
      'Constant Surface Speed (G96) + Max RPM Clamp (G50): Clamp maximum spindle RPM whenever turning small diameters toward centerline so chuck speed stays safe.',
      'Prove Programs Slowly: Use 5–25% Rapid override and Single Block with "Distance to Go" displayed when proving out a new setup.'
    ],
    fieldTip: 'Check tool center height immediately on cutoff/parting blades and boring bars—an off-center tool leaves a nub and risks snapping inserts.'
  },
  {
    id: 'lbd_appliance_repair_multimeter_37',
    lessonNumber: 37,
    videoLabel: 'Video 37: Appliance Diagnostics & Multimeter Mastery',
    title: 'Appliance Repair Diagnostics: Pro Multimeter Troubleshooting',
    category: 'Machining & Repair',
    enclaveId: 'trades_construction',
    professionId: 'repair_technician',
    level: 'Beginner',
    originalCreator: 'AppliancePartsPros',
    creatorDomain: 'youtube.com',
    description:
      'Master technician guide to diagnosing dryers, washers, ovens, and refrigerators safely using a digital multimeter: continuity checks on thermal fuses, resistance tests on heating elements, and live AC supply verification.',
    skillsCovered: [
      'Unplugged Continuity & Thermal Fuse Tests',
      'Heating Element & Motor Winding Resistance (Ω)',
      'Split-Phase 120V/240V Live Voltage Verification',
      'Isolating Wires Before Ohm Readings'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=8p0uj2tnDlg',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=8p0uj2tnDlg',
    youtubeId: '8p0uj2tnDlg',
    embedAvailable: true,
    duration: '21:52',
    thumbnailUrl: 'https://i.ytimg.com/vi/8p0uj2tnDlg/hqdefault.jpg',
    practiceActivity:
      'Practice isolating one terminal lead on a de-energized switch or resistive load and verifying open ("OL") vs. closed (~0.2Ω) vs. rated resistance values.',
    practiceDeliverablePrompt:
      'Explain why you must disconnect at least one wire harness connector before measuring component resistance (Ω) or continuity inside an appliance.',
    knowledgeCheck: {
      question:
        'Why must you pull off at least one wire spade terminal from a heating element or thermostat before testing its resistance (Ohms / Continuity)?',
      options: [
        'To isolate the part so parallel circuit paths or control board traces do not give false "good" continuity readings (and ensure power is off)',
        'To increase household AC line frequency to 120 Hz',
        'Because steel probe tips melt unless terminals are pulled',
        'To clear error codes from mechanical bimetal thermostats permanently'
      ],
      correctIndex: 0,
      explanation:
        'Testing resistance in-circuit can read back through parallel motors, timers, or board relays, masking an open element or blown switch.'
    },
    detailedStudyNotes: [
      'Zero Out Test Leads First: Touch meter probes together on Ω mode to note baseline lead resistance (usually 0.1–0.3Ω) before diagnosing low-ohm heating coils.',
      'Continuity ≠ Power Check: Never use continuity or Ω mode on an energized circuit—voltage tests happen plugged in with strict PPE and one-hand rule; Ω tests happen strictly UNPLUGGED.',
      'Check Ground Fault Shorts: Measure from element terminals to the bare metal housing/bracket on high-Ω range; anything less than OL indicates a grounded element causing GFCI/breaker trips or constant heating.',
      'Thermal Fuse Root Cause: If a dryer thermal fuse reads OL (open), always inspect lint venting and cycling thermostats before simply swapping the fuse.'
    ],
    fieldTip: 'Photograph wire harness colors and terminal numbers on your phone before disconnecting multiple spades on timers, switches, or control boards.'
  },

  // ─── AGRICULTURE & LANDSCAPING (#38–39) ───────────────────────────────────
  {
    id: 'lbd_agri_soil_prep_38',
    lessonNumber: 38,
    videoLabel: 'Video 38: Soil Composition & Bed Preparation',
    title: 'Landscaping & Soil Preparation: Testing, Amending & Planting Basics',
    category: 'Agriculture & Landscaping',
    enclaveId: 'agriculture_natural_resources',
    professionId: 'farmer',
    level: 'Beginner',
    originalCreator: 'Gardenary',
    creatorDomain: 'youtube.com',
    description:
      'Clear breakdown of soil structure (sand, silt, clay, and organic loam), drainage testing, compost blending ratios, and preparing productive raised or in-ground planting beds.',
    skillsCovered: [
      'Evaluating Soil Texture & Drainage',
      'Organic Matter & Compost Blending',
      'Root-Zone Aeration Without Compaction',
      'Mulch Moisture Retention Layers'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Y4pxtaFV3FA',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Y4pxtaFV3FA',
    youtubeId: 'Y4pxtaFV3FA',
    embedAvailable: true,
    duration: '6:37',
    thumbnailUrl: 'https://i.ytimg.com/vi/Y4pxtaFV3FA/hqdefault.jpg',
    practiceActivity:
      'Perform a simple jar-settle soil texture test and percolation drainage test on a planting site, recording sand/silt/clay fractions and drain time.',
    practiceDeliverablePrompt:
      'Summarize your sample soil texture (sandy, loamy, or heavy clay) and recommend the compost and drainage amendments suited to that bed.',
    knowledgeCheck: {
      question:
        'Why should heavy clay soils NEVER be tilled or heavily worked while saturated/muddy, and why does compost improve both clay and sandy soils?',
      options: [
        'Working wet clay destroys soil pore structure into hard brick-like clods; organic compost opens drainage channels in clay and boosts water/nutrient holding in sand',
        'Saturated clay permanently turns into quartz gravel',
        'Compost blocks all air movement around plant roots',
        'Working wet clay sterilizes rainwater pH to 14'
      ],
      correctIndex: 0,
      explanation:
        'Soil microbes and organic humus bind fine clay particles into breathable aggregates while acting like a sponge inside coarse sandy soils.'
    },
    detailedStudyNotes: [
      'Jar Texture Test: Shake soil + water + a drop of dish soap in a clear jar; sand settles in 1 minute, silt in ~2 hours, clay over 24–48 hours.',
      'Loam Balance Target: Ideal horticultural soil mixes mineral particles (sand/silt/clay) with 5–10% thriving organic matter plus 25% air space and 25% moisture.',
      'No-Dig Layering Advantage: Top-dressing with finished compost preserves fungal mycorrhizal networks and avoids waking dormant buried weed seeds.',
      'Mulch Spacing Rule: Leave a 2–3 inch breathable ring around tree trunks and woody stems ("donut, not volcano") to prevent collar rot.'
    ],
    fieldTip: 'Squeeze a handful of soil before digging: if it crumbles cleanly when poked, soil moisture is right to work; if it forms a slick mud ball, wait.'
  },
  {
    id: 'lbd_agri_irrigation_39',
    lessonNumber: 39,
    videoLabel: 'Video 39: Agricultural Irrigation Engineering',
    title: 'Modern Farming & Irrigation Systems: Pivot Engineering & Water Management',
    category: 'Agriculture & Landscaping',
    enclaveId: 'agriculture_natural_resources',
    professionId: 'agronomist',
    level: 'Beginner',
    originalCreator: 'SmarterEveryDay',
    creatorDomain: 'youtube.com',
    description:
      'Field engineering deep dive into large-scale agricultural center-pivot irrigation, nozzle flow grading along radial spans, alignment switches, pressure regulation, and precision crop water stewardship.',
    skillsCovered: [
      'Center-Pivot Span Mechanics & Alignment',
      'Nozzle Sizing by Swept Acreage Ring',
      'Pressure Regulation & Evapotranspiration',
      'Preventive Field Inspection & Water Uniformity'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=7j1lMs7fcIQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=7j1lMs7fcIQ',
    youtubeId: '7j1lMs7fcIQ',
    embedAvailable: true,
    duration: '19:58',
    thumbnailUrl: 'https://i.ytimg.com/vi/7j1lMs7fcIQ/hqdefault.jpg',
    practiceActivity:
      'Compare inner-tower swept area versus outer-tower swept area on a circular irrigated field and outline how sprinkler GPM changes from pivot center to end gun.',
    practiceDeliverablePrompt:
      'Explain why outer spans of a center-pivot irrigation boom require higher nozzle flow rates than inner spans near the center well.',
    knowledgeCheck: {
      question:
        'Why do sprinkler nozzles mounted near the outer tower of a center-pivot system discharge much more GPM than nozzles mounted close to the center pivot?',
      options: [
        'Each outer span sweeps a dramatically larger circular area (area grows with radius squared) and moves at higher linear ground speed',
        'Water loses all minerals before reaching the end of the pipe',
        'Inner spans only spray fertilizer while outer spans spray rainwater',
        'Crops planted along the outer ring have deeper taproots that repel water'
      ],
      correctIndex: 0,
      explanation:
        'Because circumference scales with radius (2πr), an outer span covers far more acreage per rotation and must match application depth uniformly.'
    },
    detailedStudyNotes: [
      'Alignment & Tower Microswitches: Leading outer tower motors drive continuously on percentage timers while inner towers pace cleanly via hinged alignment arms and safety shutoff switches.',
      'Drops Over High-Impact Sprays: Hanging low-energy precision drop nozzles closer to the crop canopy minimizes wind drift and evaporation loss.',
      'Pressure Regulators Keep Flow Even: Field elevation climbs and drops change pipe pressure; individual 10–15 PSI regulators guarantee consistent droplet size.',
      'Soil Moisture Sensors Pair With Scheduling: Running irrigation when root-zone moisture probes show depletion saves pumping diesel/kWh and avoids nutrient leaching.'
    ],
    fieldTip: 'Perform a quick catch-can uniformity test across spans each spring before peak summer demand—worn nozzle orifices silently over-water near towers.'
  },

  // ─── CULINARY & HOSPITALITY (#40–41) ──────────────────────────────────────
  {
    id: 'lbd_culinary_knife_skills_40',
    lessonNumber: 40,
    videoLabel: 'Video 40: Essential Culinary Knife Skills',
    title: 'Culinary Foundations: 9 Essential Chef Knife Skills to Master',
    category: 'Culinary & Hospitality',
    enclaveId: 'culinary_hospitality_events',
    professionId: 'chef',
    level: 'Beginner',
    originalCreator: 'Epicurious',
    creatorDomain: 'youtube.com',
    description:
      'Classic culinary school technique breakdown covering the pinch grip, claw-hand safety, uniform brunoise/julienne/batonnet cuts, chiffonade, and stabilizing round produce cleanly.',
    skillsCovered: [
      'Pinch Grip & Non-Dominant Claw Safety',
      'Brunoise, Medium Dice & Julienne Cuts',
      'Stable Flat-Side Prep for Round Produce',
      'Chiffonade Herb & Chive Precision Slicing'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=YrHpeEwk_-U',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=YrHpeEwk_-U',
    youtubeId: 'YrHpeEwk_-U',
    embedAvailable: true,
    duration: '13:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/YrHpeEwk_-U/hqdefault.jpg',
    practiceActivity:
      'Anchor your cutting board with a damp towel, trim one flat stability face on a carrot or onion, and produce uniform medium dice (1/2") and julienne strips using the claw grip.',
    practiceDeliverablePrompt:
      'Describe how the pinch grip and tucked knuckles ("the claw") work together to give control while keeping fingertips behind the blade bevel.',
    knowledgeCheck: {
      question:
        'Why do professional chefs emphasize uniform cut sizes (such as consistent 1/4" or 1/2" dice) beyond visual presentation?',
      options: [
        'Uniform pieces cook evenly at the exact same rate so small pieces do not burn while large chunks remain raw inside',
        'Randomly shaped chunks always taste sweeter than diced vegetables',
        'Uniform dice eliminates the need to season food with salt',
        'Cutting evenly dulls high-carbon stainless steel blades faster'
      ],
      correctIndex: 0,
      explanation:
        'Heat penetrates uniformly when pieces share the same thickness, guaranteeing even caramelization, texture, and timing on the line.'
    },
    detailedStudyNotes: [
      'Pinch Grip Over Handle-Only Grip: Grip the blade heel between thumb and index finger knuckle for balance right above the fulcrum.',
      'The Claw Hand Position: Curl fingertips inward vertically and rest the flat side of the knife blade gently against the middle knuckles as a fence.',
      'Cut a Flat Base First: Always slice a thin slab off cylindrical carrots, potatoes, or squash so produce sits dead-still before squaring into planks.',
      'Clean Wipe & Honing Rod Routine: Wipe acids off quickly and use a honing steel smoothly between prep sessions—a dull knife slips more dangerously than a sharp one.'
    ],
    fieldTip: 'Slide a damp folded side towel or rubber mat flat under every cutting board before lifting a knife—a sliding board is the #1 line-prep injury hazard.'
  },
  {
    id: 'lbd_culinary_mise_en_place_41',
    lessonNumber: 41,
    videoLabel: 'Video 41: Commercial Kitchen Mise en Place',
    title: 'Commercial Kitchen Workflow: The 5 Steps of Mise en Place',
    category: 'Culinary & Hospitality',
    enclaveId: 'culinary_hospitality_events',
    professionId: 'caterer',
    level: 'Beginner',
    originalCreator: "Christine's Natural Kitchen",
    creatorDomain: 'youtube.com',
    description:
      'Learn how commercial line cooks, pastry chefs, and caterers apply the 5 pillars of "Mise en Place" ("everything in its place") for calm, sanitary, zero-error service execution.',
    skillsCovered: [
      'Full Recipe Read-Through & Station Audit',
      'Ingredient Pre-Measuring & Pre-Prepping',
      'Sanitary Zone & Tool Organization',
      'Continuous Clean-as-You-Go Discipline'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=67JR7XIi_3k',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=67JR7XIi_3k',
    youtubeId: '67JR7XIi_3k',
    embedAvailable: true,
    duration: '4:21',
    thumbnailUrl: 'https://i.ytimg.com/vi/67JR7XIi_3k/hqdefault.jpg',
    practiceActivity:
      'Set up a full mise-en-place station sheet before cooking a multi-step dish: tools mapped, proteins/produce prepped and labeled, sauces portioned, and sanitizer bucket ready.',
    practiceDeliverablePrompt:
      'List the 5 steps of mise en place you applied and note how much faster and cleaner actual cook time ran once all prep was staged.',
    knowledgeCheck: {
      question:
        'In culinary and catering operations, what does "Mise en Place" prevent during high-volume service or timed cooking?',
      options: [
        'Missing ingredients mid-cook, burning items while hunting for tools, cross-contamination rushing, and inconsistent portion ratios',
        'Having too many clean mixing bowls on the prep table',
        'Measuring temperatures with calibrated digital probes',
        'Preheating ovens or sauté pans before adding proteins'
      ],
      correctIndex: 0,
      explanation:
        'Staging every ingredient, tool, and container beforehand allows uninterrupted attention to heat, timing, and food safety once cooking starts.'
    },
    detailedStudyNotes: [
      '1. Read Twice, Check Inventory First: Verify every allergen note, yield factor, and pan size before thawing or trimming expensive ingredients.',
      '2. Gather Equipment Within Arm’s Reach: Stage tongs, tasting spoons, thermometer, scrap bowl ("trash/compost bain"), and sheet trays before lighting burners.',
      '3. Group by Cook Order (Timing Waves): Organize mirepoix, spices, deglazing liquids, and finishing herbs sequentially on your station.',
      '4. Clean-As-You-Go Sanitization: Switch boards/knives cleanly between raw proteins and ready-to-eat garnishes (HACCP color-coding) and keep wiping surfaces.'
    ],
    fieldTip: 'Keep a dedicated "scrap bowl" on your right-hand edge during prep—dropping peels cleanly once beats dozens of trips to the floor bin.'
  },

  // ─── BARBERING & BEAUTY (#42–43) ──────────────────────────────────────────
  {
    id: 'lbd_barber_skin_fade_42',
    lessonNumber: 42,
    videoLabel: 'Video 42: Clipper Guards & Skin Fade Technique',
    title: 'Barbering Fundamentals: Step-by-Step Clipper Guards & Skin Fade',
    category: 'Barbering & Beauty',
    enclaveId: 'personal_services_wellness',
    professionId: 'barber',
    level: 'Beginner',
    originalCreator: 'Scutzz Studio',
    creatorDomain: 'youtube.com',
    description:
      'Structured barbering tutorial breaking down guideline placement, taper lever open/half/closed blending, #1.5 / #1 / #0.5 guard transitions, and clipper-over-comb debulking.',
    skillsCovered: [
      'Clean Bald & Guard Guideline Mapping',
      'Taper Lever Micro-Blending (Closed/Half/Open)',
      'Flick-Out Motion to Prevent Harsh Weight Lines',
      'Equipment Disinfection & Neck Taper Symmetry'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=T9iOlD5fojs',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=T9iOlD5fojs',
    youtubeId: 'T9iOlD5fojs',
    embedAvailable: true,
    duration: '8:03',
    thumbnailUrl: 'https://i.ytimg.com/vi/T9iOlD5fojs/hqdefault.jpg',
    practiceActivity:
      'On a practice mannequin or fade chart, map a 4-stage guideline progression (Bald → Lever Open → #1 Guard → #1.5/#2 Blend) and specify lever positions for erasing each line.',
    practiceDeliverablePrompt:
      'Describe the order of clipper guards and lever open/half/closed adjustments used to soften the transition line between skin and #1 guard.',
    knowledgeCheck: {
      question:
        'When erasing a guideline between bare clipper blade (lever closed = 000) and a #1 guard, how does using the "flick-out" wrist motion with lever half-open help?',
      options: [
        'It gradually tapers hair length out of the scalp contour along the line rather than punching a sharp new horizontal notch above it',
        'It cuts every hair on the crown completely flat to the bone',
        'It replaces Barbicide sanitation between clients',
        'It forces thick curl patterns to grow downward automatically'
      ],
      correctIndex: 0,
      explanation:
        'Pivoting the blade away from the head ("C-motion flick") paired with incremental lever adjustment diffuses weight lines seamlessly.'
    },
    detailedStudyNotes: [
      'Symmetry Before Fading: Stand directly behind the chair and check ear/temple height landmarks on both sides before cutting any bald guideline.',
      'Clean the Canvas Continuously: Brush loose clippings downward with a soft fade brush every few passes so you read true density rather than shadow clumps.',
      'Corner Blending ("Point Cutting with the Blade Edge"): Use just the outer 3–4 teeth of the clipper blade to detail dark shadow spots without creating a wide step.',
      'State Board Sanitation Rule: Brush hair out of blades, spray EPA-registered disinfectant for full wet-contact dwell time, and apply blade oil cleanly between appointments.'
    ],
    fieldTip: 'Keep the lighting overhead and slightly in front of the client—harsh shadows from the back can fool your eyes into over-fading one temple.'
  },
  {
    id: 'lbd_beauty_skin_consult_43',
    lessonNumber: 43,
    videoLabel: 'Video 43: Client Consultation & Skin Analysis',
    title: 'Esthetics & Beauty Practice: Mastering Client Consultation & Skin Analysis',
    category: 'Barbering & Beauty',
    enclaveId: 'personal_services_wellness',
    professionId: 'esthetician',
    level: 'Beginner',
    originalCreator: 'Tess Zolly',
    creatorDomain: 'youtube.com',
    description:
      'Licensed esthetician clinic training covering intake contraindication screening, Fitzpatricks & skin type classification, magnifying lamp hydration/sebum zones, and honest home-care treatment plans.',
    skillsCovered: [
      'Medical & Contraindication Intake Screening',
      'Skin Type vs. Temporary Skin Condition Assessment',
      'Zone-by-Zone Magnified Visual & Tactile Analysis',
      'Customized Protocol & Home Care Planning'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=ZNbOgdCdNjw',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=ZNbOgdCdNjw',
    youtubeId: 'ZNbOgdCdNjw',
    embedAvailable: true,
    duration: '30:45',
    thumbnailUrl: 'https://i.ytimg.com/vi/ZNbOgdCdNjw/hqdefault.jpg',
    practiceActivity:
      'Build a structured 6-question client consultation & skin contraindication form covering retinoids, exfoliants, sun exposure, medications, allergies, and barrier goals.',
    practiceDeliverablePrompt:
      'Explain the difference between genetic Skin Type (oily, dry, combination) and treatable Skin Conditions (dehydration, barrier sensitivity, hyperpigmentation).',
    knowledgeCheck: {
      question:
        'Why is screening a client for recent topical retinoid, AHA/BHA acid, or prescription isotretinoin use critical before performing chemical exfoliation or waxing?',
      options: [
        'Those actives thin or sensitize the stratum corneum barrier, creating high risk of chemical burns, skin lifting, and post-inflammatory hyperpigmentation',
        'They permanently dye synthetic facial sponges bright blue',
        'They prevent clients from washing their face for six months',
        'They convert dry skin into genetic oily skin overnight'
      ],
      correctIndex: 0,
      explanation:
        'Thorough contraindication screening prevents painful skin lifting, irritation, and scarring when selecting peels, wax, or thermal modalities.'
    },
    detailedStudyNotes: [
      'Cleanse Before Analyzing: Makeup, tinted SPF, and surface dust mask true erythema, pore congestion, and lipid balance—always observe skin cleansed under cool daylight/loupe light.',
      'Skin Type vs. Condition: You cannot permanently change genetic sebaceous gland density (Skin Type), but you CAN treat barrier dehydration and sensitivity (Condition).',
      'Active Listening Builds Retention: Ask what products are currently sitting on the client’s bathroom counter rather than pitching an overwhelming 10-step kit.',
      'Sanitation & Gloves Always: Change gloves immediately after touching non-sterile cabinet handles, pens, or phones before returning hands to the client’s face.'
    ],
    fieldTip: 'Prioritize barrier repair ("calm, hydrate, protect with SPF 30+") before aggressive active resurfacing on any new client.'
  },

  // ─── TAILORING & SEWING (#44–45) ──────────────────────────────────────────
  {
    id: 'lbd_sewing_machine_hem_44',
    lessonNumber: 44,
    videoLabel: 'Video 44: Sewing Machine Seams & Clean Hemming',
    title: 'Sewing Machine Basics: Straight Seams & Clean Garment Hemming',
    category: 'Tailoring & Sewing',
    enclaveId: 'trades_construction',
    professionId: 'tailor',
    level: 'Beginner',
    originalCreator: 'Vintage Coach Restoration | Jann Newton',
    creatorDomain: 'youtube.com',
    description:
      'Practical sewing workshop lesson showing clean fabric folding, pressing a double-turned hem, maintaining even throat-plate seam allowances, and backstitching cleanly at starts and stops.',
    skillsCovered: [
      'Double-Fold Pressing for Clean Edges',
      'Seam Allowance Alignment on Needle Plate',
      'Balanced Top & Bobbin Stitch Tension',
      'Backstitch Locking & Thread Trimming'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=uysxdddDmNE',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=uysxdddDmNE',
    youtubeId: 'uysxdddDmNE',
    embedAvailable: true,
    duration: '3:11',
    thumbnailUrl: 'https://i.ytimg.com/vi/uysxdddDmNE/hqdefault.jpg',
    practiceActivity:
      'Press a 1/4" then 1/2" double-turn hem cleanly with an iron on cotton or denim scrap fabric, pin perpendicular to the seam line, and stitch smoothly using throat plate guides.',
    practiceDeliverablePrompt:
      'Record your chosen seam allowance guide mark, stitch length (mm), and inspect both top and underside bobbin stitches for balanced lock knots.',
    knowledgeCheck: {
      question:
        'Why do tailors press fabric folds crisply with an iron and track the edge of the fabric against the needle plate seam-guide lines rather than staring straight at the needle point?',
      options: [
        'Watching the throat plate guide keeps the stitch line straight and parallel to the garment edge while crisp pressing prevents fabric shifting',
        'Looking at the needle causes upper thread spools to spin backwards',
        'An iron permanently glues cotton without requiring thread',
        'Throat plate lines cut excess seam allowance automatically'
      ],
      correctIndex: 0,
      explanation:
        'Pre-pressing locks geometry flat and watching the throat-plate guide mark ensures dead-straight hems and structural seams.'
    },
    detailedStudyNotes: [
      'Check Threading First: Most messy bottom "bird-nest" tangles come from forgetting to raise the presser foot when threading upper tension discs!',
      'Double-Fold Encases Raw Edges: Folding twice hides raw fraying fabric cleanly inside the garment hem.',
      'Backstitch 3–4 Stitches Cleanly: Lock both ends of structural seams cleanly inside the line of stitching.',
      'Match Needle to Fabric: Use ballpoint/jersey needles for stretch knits and sharp/universal 80/12–100/16 needles for wovens and heavy canvas.'
    ],
    fieldTip: 'Keep a small magnetic seam guide or piece of bright painter’s tape on the exact throat-plate seam line (e.g., 5/8" or 1/2") when stitching long panels.'
  },
  {
    id: 'lbd_tailoring_measurements_45',
    lessonNumber: 45,
    videoLabel: 'Video 45: Accurate Garment & Body Measurements',
    title: 'Tailoring Foundations: Taking Accurate Garment & Body Measurements',
    category: 'Tailoring & Sewing',
    enclaveId: 'trades_construction',
    professionId: 'tailor',
    level: 'Beginner',
    originalCreator: 'Sew Addicts',
    creatorDomain: 'youtube.com',
    description:
      'Tailor’s measurement clinic explaining relaxed standing posture, key circumference landmarks (chest/bust, natural waist, full hip), back length, and sleeve/inseam allowances.',
    skillsCovered: [
      'Finding Natural Waist & High-Hip Landmarks',
      'Keeping Flexible Tape Level Front-to-Back',
      'Two-Finger Breathing Ease vs. Skin-Tight Fit',
      'Standardized Alteration Client Spec Sheet'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=jvGEVbgIXPU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=jvGEVbgIXPU',
    youtubeId: 'jvGEVbgIXPU',
    embedAvailable: true,
    duration: '3:37',
    thumbnailUrl: 'https://i.ytimg.com/vi/jvGEVbgIXPU/hqdefault.jpg',
    practiceActivity:
      'Complete a structured client tailoring spec sheet recording shoulder width, chest/bust, natural waist, full hip, sleeve length (elbow slightly bent), and outseam/inseam.',
    practiceDeliverablePrompt:
      'Explain why body measurements differ from finished garment pattern measurements ("wearing ease + design ease").',
    knowledgeCheck: {
      question:
        'When measuring sleeve length for a tailored jacket or dress shirt, why should the client stand relaxed with a slight natural bend at the elbow?',
      options: [
        'Bending the arm smoothly pulls the sleeve along the outer elbow curve so cuffs do not ride painfully high up the wrist in real movement',
        'It makes the chest circumference grow by 4 inches',
        'It stretches elastic tape measures permanently',
        'Tailored sleeves are only worn at 90-degree salutes'
      ],
      correctIndex: 0,
      explanation:
        'Measuring around the slightly bent elbow tracks the real dynamic reach of the arm so sleeve cuffs hit the wrist bone accurately.'
    },
    detailedStudyNotes: [
      'Natural Waist Tie Trick: Tie a slim elastic ribbon comfortably around the waist and let the person bend sideways once—it settles squarely into the anatomical natural waist.',
      'Tape Level Check: Look in a full mirror or step to the side—dipping the tape down in back adds false inches and mis-cuts torso proportions.',
      'Snug, Never Compressed: Pull flexible fiberglass tape snug against light undergarments without indenting flesh; pattern makers add movement ease afterward.',
      'Note Posture Nuances: Record sloped shoulders, forward head tilt, or asymmetrical hem clearance during intake fittings.'
    ],
    fieldTip: 'Replace stretched cloth tape measures every year against a rigid metal yardstick—old cloth tapes stretch by up to half an inch over 60 inches!'
  },

  // ─── HEALTHCARE & NURSING (#46–47) ────────────────────────────────────────
  {
    id: 'lbd_nursing_blood_pressure_46',
    lessonNumber: 46,
    videoLabel: 'Video 46: Clinical Vital Signs & Manual BP',
    title: 'Clinical Nursing Skill: Manual Blood Pressure & Vital Signs Assessment',
    category: 'Healthcare & Nursing',
    enclaveId: 'healthcare_medicine',
    professionId: 'nurse',
    level: 'Beginner',
    originalCreator: 'RegisteredNurseRN',
    creatorDomain: 'youtube.com',
    description:
      'Clinical nurse educator demonstration covering proper cuff sizing, brachial artery palpation, Korotkoff Phase I systolic and Phase V diastolic sounds, and patient positioning.',
    skillsCovered: [
      'Correct Cuff Bladder Sizing & Arm Heart-Level',
      'Brachial Pulse & Radial Palpation Method',
      'Identifying Korotkoff Phase I & Phase V Sounds',
      'Controlled Valve Deflation (2–3 mmHg/sec)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=soR8THwQzBw',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=soR8THwQzBw',
    youtubeId: 'soR8THwQzBw',
    embedAvailable: true,
    duration: '3:02',
    thumbnailUrl: 'https://i.ytimg.com/vi/soR8THwQzBw/hqdefault.jpg',
    practiceActivity:
      'Audit proper manual BP workflow step by step: patient seated 5 minutes with feet flat on floor, arm supported at heart height, correct cuff artery arrow placement, and estimation of systolic obliteration pressure.',
    practiceDeliverablePrompt:
      'Summarize how an oversized cuff vs. an undersized cuff skews blood pressure readings and state the target cuff deflation rate (mmHg/sec).',
    knowledgeCheck: {
      question:
        'What clinical reading error typically occurs when a blood pressure cuff bladder is TOO SMALL (narrow) for the patient’s upper arm?',
      options: [
        'Falsely HIGH reading because excessive cuff pressure is needed to compress the brachial artery',
        'Falsely LOW reading of 0/0',
        'Zero pulse waves are transmitted through any stethoscope',
        'It reverses systolic and diastolic numeric order'
      ],
      correctIndex: 0,
      explanation:
        'Too small a cuff artificially elevates BP readings; too large a cuff can produce artificially low readings. Always fit the bladder width ~40% of arm circumference.'
    },
    detailedStudyNotes: [
      'Patient Positioning Standard: Feet flat (legs uncrossed), back supported, arm resting at mid-sternal heart height after ~5 minutes quiet rest.',
      'Estimate Systolic First (Auscultatory Gap Protection): Palpate radial pulse while inflating until pulse vanishes, add 30 mmHg for target inflation ceiling to avoid missing an auscultatory gap.',
      'Smooth Deflation Speed: Open valve slowly at 2–3 mmHg per second—deflating too fast skips systolic beats, too slow causes painful venous congestion.',
      'Record Exact Context: Document numeric reading (e.g., 118/76 mmHg), extremity used, position (sitting/supine/standing), and cuff size.'
    ],
    fieldTip: 'Wait at least 1–2 full minutes with the cuff completely deflated before re-checking blood pressure on the same arm so venous engorgement clears.'
  },
  {
    id: 'lbd_healthcare_cpr_bls_47',
    lessonNumber: 47,
    videoLabel: 'Video 47: Adult & Infant CPR Fundamentals',
    title: 'Emergency Clinical Care: Adult & Infant CPR Fundamentals',
    category: 'Healthcare & Nursing',
    enclaveId: 'healthcare_medicine',
    professionId: 'paramedic',
    level: 'Beginner',
    originalCreator: 'Mass General Brigham',
    creatorDomain: 'youtube.com',
    description:
      'Hospital clinical resuscitation briefing walking through responsiveness and 911/AED activation, proper adult vs. infant hand placement, compression depth, full chest recoil, and rate control.',
    skillsCovered: [
      'Scene Safety & Emergency Response Activation',
      'Adult Two-Hand Sternum Compression Depth',
      'Infant Two-Finger / Thumb-Encircling CPR',
      '100–120 BPM Cadence & Full Chest Recoil'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BUhUiPeEX-8',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=BUhUiPeEX-8',
    youtubeId: 'BUhUiPeEX-8',
    embedAvailable: true,
    duration: '2:51',
    thumbnailUrl: 'https://i.ytimg.com/vi/BUhUiPeEX-8/hqdefault.jpg',
    practiceActivity:
      'Review and compare adult vs. infant compression depth, hand/finger landmarks on a training manikin or chart, target compression rate (100–120/min), and AED readiness priorities.',
    practiceDeliverablePrompt:
      'Explain why allowing complete chest recoil after each downward compression is just as critical to coronary perfusion as compression depth.',
    knowledgeCheck: {
      question:
        'During high-quality adult cardiopulmonary resuscitation (CPR), what are the recommended compression rate and compression depth targets?',
      options: [
        '100–120 compressions per minute at a depth of at least 2 inches (5 cm), allowing full chest recoil between pushes',
        '30 compressions per minute at a depth of 0.5 inches with constant leaning on the chest',
        '200 compressions per minute only on the left shoulder',
        'Compressions are withheld for 10 minutes before calling 911'
      ],
      correctIndex: 0,
      explanation:
        'Pushing hard (~2–2.4 inches / 5–6 cm) and fast (100–120/min) while allowing full chest recoil refills the heart chambers with venous blood.'
    },
    detailedStudyNotes: [
      'Minimize Interruptions: Keep chest compression pauses under 10 seconds when switching compressors or applying AED pads.',
      'Adult Hand Landmark: Place heel of one hand on the lower half of the sternum (center of chest), interlock second hand on top, lock elbows, and press using upper body weight.',
      'Infant Technique Differentiation: Use two fingers (or two-thumb encircling hands technique with 2 rescuers) just below the nipple line to ~1.5 inches (4 cm) depth.',
      'Hands-Only Saves Lives: Untrained or solo lay responders should begin immediate continuous hands-only chest compressions as soon as 911 and an AED are requested.'
    ],
    fieldTip: 'Rotate compressors roughly every 2 minutes (when the AED re-analyzes rhythm) because fatigue subtly degrades compression depth after 120 seconds.'
  },

  // ─── SOFTWARE & AI (#48–49) ───────────────────────────────────────────────
  {
    id: 'lbd_software_python_48',
    lessonNumber: 48,
    videoLabel: 'Video 48: Python Software Engineering Basics',
    title: 'Software Engineering Foundations: Core Python Programming Basics',
    category: 'Software & AI',
    enclaveId: 'tech_software',
    professionId: 'software_engineer',
    level: 'Beginner',
    originalCreator: 'Indently',
    creatorDomain: 'youtube.com',
    description:
      'Concise, practical coding session introducing core Python building blocks: variables and type hints, control flow, clean reusable functions, data structures, and readable debugging.',
    skillsCovered: [
      'Variables, Data Types & Type Hints',
      'Conditional Logic & Iteration Loops',
      'Modular Functions & Clean Signatures',
      'Lists, Dictionaries & Basic Error Checks'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=fWjsdhR3z3c',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=fWjsdhR3z3c',
    youtubeId: 'fWjsdhR3z3c',
    embedAvailable: true,
    duration: '10:30',
    thumbnailUrl: 'https://i.ytimg.com/vi/fWjsdhR3z3c/hqdefault.jpg',
    practiceActivity:
      'Write a clean 20-line Python script defining a reusable function that takes a list of work-order costs, computes total + average + tax, and formats an itemized summary dictionary.',
    practiceDeliverablePrompt:
      'Share your Python function signature with type hints and explain why separating pure computation functions from I/O improves testing.',
    knowledgeCheck: {
      question:
        'In Python, what is the primary difference between a mutable `list` and a key-value `dict` (dictionary)?',
      options: [
        'A list stores ordered items accessed by integer index (`items[0]`), whereas a dictionary maps unique keys to values for fast O(1) lookup (`prices["pipe"]`)',
        'A list can only hold numbers while dictionaries can only store audio files',
        'Dictionaries execute twice as slowly and cannot be modified once created',
        'Both types forbid looping with `for` statements'
      ],
      correctIndex: 0,
      explanation:
        'Choosing ordered lists vs. hash-mapped dictionaries is foundational for writing clean, fast data transformations in Python.'
    },
    detailedStudyNotes: [
      'Descriptive Names & Type Hints: Write `def compute_estimate(hours: float, rate: float) -> float:` so tooling and teammates see contracts immediately.',
      'Indentation IS Structure: Consistent 4-space indentation defines blocks in Python; never mix tabs and spaces.',
      'Prefer `f-strings` cleanly: `f"Total due: ${total:.2f}"` formats values concisely without brittle string concatenation.',
      'Guard Edge Cases Early: Handle empty lists (`if not items: return 0.0`) at the top of functions to prevent `ZeroDivisionError` surprises in production.'
    ],
    fieldTip: 'Keep every business-logic function small enough to test directly with known sample inputs before wiring it into API routes or UI handlers.'
  },
  {
    id: 'lbd_software_ai_ml_49',
    lessonNumber: 49,
    videoLabel: 'Video 49: AI, Machine Learning & GenAI Architecture',
    title: 'AI & Machine Learning Architecture: ML, Deep Learning & Generative AI',
    category: 'Software & AI',
    enclaveId: 'tech_software',
    professionId: 'ai_engineer',
    level: 'Beginner',
    originalCreator: 'IBM Technology',
    creatorDomain: 'youtube.com',
    description:
      'Engineering architecture overview from IBM Technology comparing classical Artificial Intelligence, Supervised/Unsupervised Machine Learning, Deep Neural Networks, and Transformer-based Generative AI.',
    skillsCovered: [
      'AI vs. ML vs. Deep Learning Hierarchy',
      'Training Data, Features & Model Inference',
      'Foundation Models & Transformer Context',
      'Applying GenAI vs. Deterministic Workflows'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=qYNweeDHiyU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=qYNweeDHiyU',
    youtubeId: 'qYNweeDHiyU',
    embedAvailable: true,
    duration: '10:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/qYNweeDHiyU/hqdefault.jpg',
    practiceActivity:
      'Classify 3 workplace tasks into the right automation fit: (a) deterministic tax calculation, (b) structured numerical forecasting, and (c) drafting & summarizing unstructured field reports.',
    practiceDeliverablePrompt:
      'Explain when classical tabular ML or plain deterministic code outperforms an LLM, and how RAG grounds Generative AI answers in verified records.',
    knowledgeCheck: {
      question:
        'How does Deep Learning differ structurally from traditional classical Machine Learning approaches?',
      options: [
        'Deep Learning uses multi-layered artificial neural networks capable of learning complex feature representations automatically from large unstructured data (images, text, audio)',
        'Deep Learning runs exclusively without electricity or GPUs',
        'Traditional ML requires handwritten poetry while Deep Learning only uses Excel formulas',
        'Deep Learning eliminates the need for training datasets or validation metrics'
      ],
      correctIndex: 0,
      explanation:
        'Multi-layer neural architectures learn hierarchical representations automatically across unstructured domains where manual feature engineering falls short.'
    },
    detailedStudyNotes: [
      'Use the Simplest Tool That Works: Never deploy a heavy generative model for strict arithmetic or policy validation that deterministic code handles deterministically at 0ms.',
      'Supervised vs. Unsupervised Learning: Supervised predicts labeled outcomes (churn, failure risk); Unsupervised clusters unknown patterns (anomaly detection).',
      'Foundation Models + Grounding: Large Language Models predict tokens probabilistically—pair them with Retrieval-Augmented Generation (RAG) and strict evaluation tests to avoid hallucinations.',
      'Data Quality Governs Ceiling: Clean, unbiased, representative labeled evaluation sets remain the highest-leverage investment in any AI engineering team.'
    ],
    fieldTip: 'Always define an offline evaluation set of real edge cases before upgrading prompts or swapping foundation models.'
  },

  // ─── CYBERSECURITY & IT (#50–51) ──────────────────────────────────────────
  {
    id: 'lbd_cyber_fundamentals_50',
    lessonNumber: 50,
    videoLabel: 'Video 50: Cybersecurity Foundations & Defense',
    title: 'Cybersecurity Career Foundations: Core Defense & Network Principles',
    category: 'Cybersecurity & IT',
    enclaveId: 'tech_cybersecurity',
    professionId: 'security_analyst',
    level: 'Beginner',
    originalCreator: 'Tech with Jono',
    creatorDomain: 'youtube.com',
    description:
      'Practical cybersecurity career briefing introducing the CIA Triad (Confidentiality, Integrity, Availability), network ports/protocols, MFA & least privilege, and building hands-on home labs.',
    skillsCovered: [
      'CIA Triad & Threat Modeling Basics',
      'Core TCP/UDP Network Ports & Protocols',
      'Least Privilege, MFA & Patch Hygiene',
      'Blue Team vs. Red Team Practical Pathways'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=X-O1-l0gP5Q',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=X-O1-l0gP5Q',
    youtubeId: 'X-O1-l0gP5Q',
    embedAvailable: true,
    duration: '5:36',
    thumbnailUrl: 'https://i.ytimg.com/vi/X-O1-l0gP5Q/hqdefault.jpg',
    practiceActivity:
      'Map 5 real services in an office network (HTTPS, SSH, DNS, RDP, SMB) to their port numbers and describe one hardening control for each.',
    practiceDeliverablePrompt:
      'Explain how Confidentiality, Integrity, and Availability each apply to protecting customer payroll and authentication databases.',
    knowledgeCheck: {
      question:
        'In cybersecurity architecture, what does enforcing the "Principle of Least Privilege" accomplish?',
      options: [
        'Each user, service account, and process receives only the minimum permissions required to perform its job, limiting blast radius if credentials are compromised',
        'Every employee receives global administrator rights on day one for faster onboarding',
        'All external firewall rules are deleted to simplify troubleshooting',
        'Passwords are stored in plain text inside shared spreadsheets'
      ],
      correctIndex: 0,
      explanation:
        'Least privilege restricts lateral movement and unauthorized access when an endpoint or user token is phished or breached.'
    },
    detailedStudyNotes: [
      'Networking Comes First: You cannot defend or hunt malware on networks you don’t understand—master IP subnetting, DNS resolution, TLS handshakes, and core ports.',
      'Defense in Depth: Layer MFA + EDR + network segmentation + offline immutable backups rather than trusting any single perimeter firewall.',
      'Identity IS the Modern Perimeter: Phishing-resistant MFA and tight IAM session scoping stop most commodity credential attacks.',
      'Build & Document Real Labs: Spinning up VMs, packet captures, and log pipelines teaches vastly more than memorizing acronym flashcards alone.'
    ],
    fieldTip: 'Practice reading raw HTTP headers and DNS query logs cleanly—half of real triage starts by checking where a host resolved and connected.'
  },
  {
    id: 'lbd_cyber_soc_logs_51',
    lessonNumber: 51,
    videoLabel: 'Video 51: SOC Analyst Log Analysis & Triage',
    title: 'SOC Analyst Field Skills: Reading & Triaging Security Logs',
    category: 'Cybersecurity & IT',
    enclaveId: 'tech_cybersecurity',
    professionId: 'soc_analyst',
    level: 'Beginner',
    originalCreator: 'Tech with Jono',
    creatorDomain: 'youtube.com',
    description:
      'Hands-on Security Operations Center (SOC) walkthrough demonstrating how analysts dissect Windows/Linux authentication logs, process trees, network proxy telemetry, and timelines to confirm real incidents.',
    skillsCovered: [
      'Reading Auth & Process Creation Logs',
      'Correlating Source IPs & User Agents',
      'Distinguishing False Positives vs. Real Incidents',
      'Timeline Reconstruction & Escalation Notes'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=TlB-vGW-xLQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=TlB-vGW-xLQ',
    youtubeId: 'TlB-vGW-xLQ',
    embedAvailable: true,
    duration: '8:29',
    thumbnailUrl: 'https://i.ytimg.com/vi/TlB-vGW-xLQ/hqdefault.jpg',
    practiceActivity:
      'Trace a simulated alert timeline: 14 failed SSH/login attempts from an unfamiliar ASN followed by 1 successful login and PowerShell/curl execution—write a crisp 4-line SOC triage note.',
    practiceDeliverablePrompt:
      'List the key fields (timestamp UTC, host, user, parent process, source IP, action) you must extract before closing or escalating any SIEM alert.',
    knowledgeCheck: {
      question:
        'When investigating a suspicious process alert in an endpoint or SIEM log, why should a SOC analyst always inspect the PARENT process (e.g., `winword.exe` spawning `powershell.exe`)?',
      options: [
        'Unusual parent-child execution chains expose living-off-the-land attacks (like malicious macros launching shells) even when the binary itself is built-in',
        'Parent processes show which monitor brand is plugged into the workstation',
        'It automatically decrypts ransomware files without backups',
        'Parent processes are identical for every legitimate and malicious executable'
      ],
      correctIndex: 0,
      explanation:
        'Context matters—`powershell.exe` spawned by IT automation tools may be benign, whereas `powershell.exe` spawned by Microsoft Word or a PDF reader is high-confidence malicious.'
    },
    detailedStudyNotes: [
      'Pivot Across 5 Anchors: Always connect Timestamp (UTC) → User Identity → Hostname → Process Lineage → External IP/Domain.',
      'Check Before Closing False Positives: Verify approved change tickets or maintenance windows before dismissing repeated script alerts.',
      'Correlate Successful Logins After Failures: A burst of 4625 (failed login) events followed immediately by 4624 (successful login) warrants immediate session review.',
      'Write Crisp Escalations: State what happened, what evidence confirmed it, impacted scope, and recommended containment in the first 3 lines.'
    ],
    fieldTip: 'Normalize all log timestamps to UTC during multi-source investigations so firewall, cloud IdP, and endpoint events line up cleanly.'
  },

  // ─── FINANCE & BUSINESS (#52–54) ──────────────────────────────────────────
  {
    id: 'lbd_finance_bookkeeping_52',
    lessonNumber: 52,
    videoLabel: 'Video 52: Small Business Bookkeeping Basics',
    title: 'Bookkeeping & Accounting Basics: Ledgers, Cash Flow & Reconciliation',
    category: 'Finance & Business',
    enclaveId: 'finance_accounting',
    professionId: 'accountant',
    level: 'Beginner',
    originalCreator: 'LYFE Accounting',
    creatorDomain: 'youtube.com',
    description:
      'Clear accounting walkthrough covering the 5 core account buckets (Assets, Liabilities, Equity, Revenue, Expenses), Chart of Accounts setup, monthly bank reconciliation, and reading P&L statements.',
    skillsCovered: [
      'Chart of Accounts & 5 Account Buckets',
      'Revenue vs. Profit vs. Cash Flow Clarity',
      'Monthly Bank & Card Reconciliation',
      'Reading Income Statements & Balance Sheets'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=pKpdibyljR4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=pKpdibyljR4',
    youtubeId: 'pKpdibyljR4',
    embedAvailable: true,
    duration: '13:56',
    thumbnailUrl: 'https://i.ytimg.com/vi/pKpdibyljR4/hqdefault.jpg',
    practiceActivity:
      'Categorize 8 sample business transactions into Assets, Liabilities, Revenue, Cost of Goods Sold (COGS), or Operating Expenses and compute gross margin.',
    practiceDeliverablePrompt:
      'Explain why a profitable small business on an Income Statement can still run short of cash if accounts receivable or inventory spikes.',
    knowledgeCheck: {
      question:
        'Why should every contractor or business owner perform a monthly bank reconciliation comparing bookkeeping records against official bank statements?',
      options: [
        'It catches duplicate entries, missing invoices, unauthorized fees, and bank errors early so tax filings and profit figures stay accurate',
        'It doubles gross sales revenue every 30 days automatically',
        'It eliminates the need to save vendor receipts',
        'It converts operating expenses into permanent equity'
      ],
      correctIndex: 0,
      explanation:
        'Monthly reconciliation keeps ledgers synchronized with actual bank cash so tax estimates, cash reserves, and financial decisions remain reliable.'
    },
    detailedStudyNotes: [
      'Separate Business & Personal Accounts Cleanly: Commingling personal groceries with tool purchases destroys tax clarity and pierces corporate liability protection.',
      'Accounting Equation Foundation: Assets = Liabilities + Owner’s Equity must always stay in balance.',
      'Separate COGS From Overhead: Track direct job materials/subcontractors under Cost of Goods Sold so you know true Gross Profit per job.',
      'Reserve Tax Money Weekly: Move estimated income & payroll tax percentages into a dedicated tax sub-account as invoices clear.'
    ],
    fieldTip: 'Snap digital receipts immediately with job names tagged on them—three months later nobody remembers what a $184 hardware store run belonged to.'
  },
  {
    id: 'lbd_business_estimating_53',
    lessonNumber: 53,
    videoLabel: 'Video 53: Contracting & Service Job Estimating',
    title: 'Trade & Small Business Estimating: Pricing Labor, Materials & Overhead',
    category: 'Finance & Business',
    enclaveId: 'commerce_small_business',
    professionId: 'business_owner',
    level: 'Beginner',
    originalCreator: 'SoCal Contracting Academy',
    creatorDomain: 'youtube.com',
    description:
      'Field-tested contracting guide on calculating true fully burdened labor costs, material waste contingencies, overhead recovery, and healthy profit margins so tradespeople never underbid work.',
    skillsCovered: [
      'Fully Burdened Labor Rate Calculation',
      'Accurate Material Takeoffs & Waste Factors',
      'Overhead Recovery & Markup vs. Margin',
      'Clear Scope Boundaries & Change Orders'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=cbCZbaIoBm4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=cbCZbaIoBm4',
    youtubeId: 'cbCZbaIoBm4',
    embedAvailable: true,
    duration: '7:08',
    thumbnailUrl: 'https://i.ytimg.com/vi/cbCZbaIoBm4/hqdefault.jpg',
    practiceActivity:
      'Build a complete sample job estimate including burdened labor hours, materials + 10% waste/consumables, vehicle/tool overhead allocation, and target profit margin.',
    practiceDeliverablePrompt:
      'Calculate the selling price of a $1,000 direct-cost job when targeting a 25% gross MARGIN (vs. a 25% MARKUP) and explain the dollar difference.',
    knowledgeCheck: {
      question:
        'If a job costs $1,000 in direct materials and burdened labor, and you want a true 25% Gross Profit MARGIN on the final invoice price, what should you charge?',
      options: [
        '$1,333.33 ($1,000 ÷ 0.75 = $1,333.33, leaving $333.33 which is 25% of revenue)',
        '$1,250.00 (which is only a 20% gross profit margin)',
        '$1,025.00',
        '$900.00'
      ],
      correctIndex: 0,
      explanation:
        'Confusing Markup with Margin quietly shrinks profit by 5–10+ points. Margin = (Price - Cost) / Price; divide Direct Cost by (1 - Target Margin).'
    },
    detailedStudyNotes: [
      'Pay vs. Burdened Labor Rate: A technician paid $30/hr often costs $42–$50/hr once payroll taxes, workers comp, vehicle, tools, and non-billable drive time are included.',
      'Price Unforeseen Conditions Explicitly: Specify clear exclusions (e.g., concealed rot behind drywall or outdated electrical panels) and written change-order pricing upfront.',
      'Include Consumables & Mobilization: Blades, fasteners, adhesives, permits, and cleanup hours add up fast across dozens of small jobs.',
      'Review Estimated vs. Actual Hours Every Job: Post-job costing reveals which task types consistently overrun estimates.'
    ],
    fieldTip: 'Always send estimates itemized by clear deliverables and schedule milestones—never give a one-sentence guess verbally in a driveway.'
  },
  {
    id: 'lbd_real_estate_basics_54',
    lessonNumber: 54,
    videoLabel: 'Video 54: Real Estate & Property Fundamentals',
    title: 'Real Estate & Property Operations: Market Analysis & Deal Fundamentals',
    category: 'Finance & Business',
    enclaveId: 'commerce_small_business',
    professionId: 'real_estate_agent',
    level: 'Beginner',
    originalCreator: 'Kris Krohn',
    creatorDomain: 'youtube.com',
    description:
      'Foundational real estate operations overview covering comparable market valuation ("comps"), net operating income (NOI), cash-flow stress testing, inspection contingencies, and client representation.',
    skillsCovered: [
      'Comparable Sales Valuation (Comps)',
      'Cash Flow, Expenses & CapEx Reserves',
      'Inspection & Financing Contingencies',
      'Risk Assessment Before Closing'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=D69VhdRNok0',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=D69VhdRNok0',
    youtubeId: 'D69VhdRNok0',
    embedAvailable: true,
    duration: '11:18',
    thumbnailUrl: 'https://i.ytimg.com/vi/D69VhdRNok0/hqdefault.jpg',
    practiceActivity:
      'Evaluate a sample residential rental listing by estimating gross rent minus 5% vacancy, property tax, insurance, maintenance/CapEx reserves (10%), and debt service to check net cash flow.',
    practiceDeliverablePrompt:
      'List 4 major physical systems (roof, HVAC, electrical panel, plumbing/foundation) you inspect on every walkthrough to avoid hidden CapEx shocks.',
    knowledgeCheck: {
      question:
        'When underwriting a rental or commercial property, why must operating reserves explicitly include Vacancy and Capital Expenditures (CapEx) alongside mortgage principal and interest?',
      options: [
        'Because periodic roof/HVAC replacements, turnover cleanouts, taxes, and empty months always occur over multi-year ownership and erode naive cash-flow estimates',
        'Because mortgage interest never gets charged to property owners',
        'Because local property taxes decrease automatically every year',
        'Because tenants legally replace structural foundations on day one'
      ],
      correctIndex: 0,
      explanation:
        'True Net Operating Income accounts for taxes, insurance, management, maintenance, vacancy, and long-term capital replacements before claiming profit.'
    },
    detailedStudyNotes: [
      'Match Like-for-Like Comps: Pull sold properties within 0.5–1 mile closed in the last 90 days matching square footage, era, lot size, and bed/bath count.',
      'Never Skip Due Diligence: Structural, sewer-scope, and title searches during contingency windows protect buyers from catastrophic hidden defects.',
      'Look at Gross Multiplier AND Net Cash Flow: High rent neighborhoods with skyrocketing taxes/HOA dues can deliver poorer net yield than modest properties.',
      'Partner With Trade Specialists: Having reliable licensed plumbers, electricians, and roofers walk distressed properties turns guesses into firm repair budgets.'
    ],
    fieldTip: 'Pull city permit history online before making an offer—unpermitted garage conversions or structural wall removals create huge appraisal and insurance headaches.'
  },

  // ─── LAW & LEGAL (#55–56) ─────────────────────────────────────────────────
  {
    id: 'lbd_law_contracts_55',
    lessonNumber: 55,
    videoLabel: 'Video 55: Contract Law Offer & Acceptance',
    title: 'Contract Law Fundamentals: Offer, Acceptance & Binding Agreements',
    category: 'Law & Legal',
    enclaveId: 'law_gov_defense',
    professionId: 'lawyer',
    level: 'Beginner',
    originalCreator: 'Harvard Online',
    creatorDomain: 'youtube.com',
    description:
      'University-level legal lecture explaining the core elements forming an enforceable contract: clear Offer, unequivocal Acceptance, mutual assent, Consideration, and avoiding premature obligations.',
    skillsCovered: [
      'Distinguishing Invitations vs. Binding Offers',
      'Mirror-Image Acceptance vs. Counteroffers',
      'Bargained-For Consideration Basics',
      'Clear Written Terms & Risk Allocation'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=AvsM819br94',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=AvsM819br94',
    youtubeId: 'AvsM819br94',
    embedAvailable: true,
    duration: '5:52',
    thumbnailUrl: 'https://i.ytimg.com/vi/AvsM819br94/hqdefault.jpg',
    practiceActivity:
      'Review a sample vendor service agreement and annotate: (1) who makes the offer, (2) what triggers binding acceptance, (3) consideration on each side, and (4) any counteroffer modifications.',
    practiceDeliverablePrompt:
      'Explain under classic contract principles what legally happens to an original offer the moment the recipient responds by changing the price or delivery date.',
    knowledgeCheck: {
      question:
        'In contract formation, what legal effect does replying to an offer with modified payment terms or price have?',
      options: [
        'It generally operates as a rejection of the original offer and creates a new Counteroffer that the original party may accept or decline',
        'It forces both parties onto the highest of the two prices automatically',
        'It makes the original offer irrevocable for 99 years',
        'It converts the negotiation into a criminal arbitration order'
      ],
      correctIndex: 0,
      explanation:
        'A conditional acceptance or changed material term rejects the initial offer and puts a counteroffer on the table.'
    },
    detailedStudyNotes: [
      'Offer vs. Advertisement: Price tags and general catalogs are normally invitations to treat, not enforceable standalone offers until specific commitment manifests.',
      'Consideration Must Flow Both Ways: Each side must promise something of legal value (money, services, goods, or forbearance)—one-sided gift promises generally aren’t contracts.',
      'Specify Revocation & Expiration Deadlines: Always attach clear acceptance deadlines on service proposals so old quotes cannot be resurrected months after material prices change.',
      'Put Essential Terms in Writing: Scope, price, payment schedule, warranty/liability limits, and termination clauses prevent costly memory disputes.'
    ],
    fieldTip: 'Add "This proposal expires 14 days from issue and becomes binding upon signed acceptance + deposit" to keep commercial terms unambiguous.'
  },
  {
    id: 'lbd_law_legal_research_56',
    lessonNumber: 56,
    videoLabel: 'Video 56: Legal Research & Problem Analysis',
    title: 'Legal Research & Paralegal Workflow: Analyzing Legal Problems',
    category: 'Law & Legal',
    enclaveId: 'law_gov_defense',
    professionId: 'paralegal',
    level: 'Beginner',
    originalCreator: 'Michigan Law',
    creatorDomain: 'youtube.com',
    description:
      'University of Michigan Law faculty instruction on dissecting fact patterns systematically, framing legal issues, separating controlling primary authority from secondary commentary, and validating citations.',
    skillsCovered: [
      'Extracting Legally Relevant Facts & Issues',
      'Primary Authority vs. Secondary Sources',
      'Jurisdictional & Statutory Verification',
      'Checking Good-Law Status (Citator Hygiene)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Y_Lg2OFUNuI',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Y_Lg2OFUNuI',
    youtubeId: 'Y_Lg2OFUNuI',
    embedAvailable: true,
    duration: '17:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/Y_Lg2OFUNuI/hqdefault.jpg',
    practiceActivity:
      'Apply the IRAC framework (Issue, Rule, Application, Conclusion) to a 1-paragraph workplace safety or contract dispute fact pattern, listing jurisdiction and governing statutes to check first.',
    practiceDeliverablePrompt:
      'Distinguish primary legal authority (statutes, regulations, binding appellate opinions) from secondary sources (treatises, law reviews, legal encyclopedias) and explain when to use each.',
    knowledgeCheck: {
      question:
        'Why do experienced attorneys and paralegals often begin an unfamiliar legal research topic with Secondary Sources before pulling individual court opinions?',
      options: [
        'Secondary sources orient you quickly to governing terminology, statutory frameworks, and leading cases in the right jurisdiction—saving hours of blind keyword searches',
        'Secondary sources automatically overrule Supreme Court precedent',
        'Judges forbid reading statutes before citing law blogs',
        'Primary statutes contain zero legal rules'
      ],
      correctIndex: 0,
      explanation:
        'Practitioner guides and treatises point straight to controlling statutes and landmark cases, though final briefs always cite primary authority verified as still good law.'
    },
    detailedStudyNotes: [
      'Start With Jurisdiction & Parties: Before reading any case, confirm federal vs. state law and which appellate circuit controls.',
      'Check Statutory Definitions Word-for-Word: A single statutory threshold or definition clause often resolves half the dispute before case law is even needed.',
      'Primary vs. Secondary Role: Use treatises/ALRs to understand doctrine and find citations, then read and cite the verified primary text itself.',
      'Citator Verification Is Mandatory: Never cite an opinion without verifying via a citator (e.g., Shepard’s / KeyCite) that it hasn’t been overruled or superseded by statute.'
    ],
    fieldTip: 'Organize research memos chronologically by Issue using clear IRAC headings so supervising attorneys can scan authority and counterarguments in under a minute.'
  },

  // ─── CREATIVE MEDIA & DESIGN (#57–58) ─────────────────────────────────────
  {
    id: 'lbd_media_photography_57',
    lessonNumber: 57,
    videoLabel: 'Video 57: Photography Lighting & Exposure',
    title: 'Photography Foundations: Exposure Triangle, Lighting & Composition',
    category: 'Creative Media & Design',
    enclaveId: 'creative_media_arts',
    professionId: 'photographer',
    level: 'Beginner',
    originalCreator: 'IMAZINE',
    creatorDomain: 'youtube.com',
    description:
      'Visual crash course mastering Aperture, Shutter Speed, and ISO tradeoffs alongside three-point lighting, color temperature, rule-of-thirds framing, and sharp client portfolio photography.',
    skillsCovered: [
      'Exposure Triangle (Aperture, Shutter, ISO)',
      'Controlling Depth of Field & Motion Freeze',
      'Natural & Soft Key-Light Direction',
      'Rule of Thirds & Leading Lines Composition'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=bF5cKZFPbgY',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=bF5cKZFPbgY',
    youtubeId: 'bF5cKZFPbgY',
    embedAvailable: true,
    duration: '7:37',
    thumbnailUrl: 'https://i.ytimg.com/vi/bF5cKZFPbgY/hqdefault.jpg',
    practiceActivity:
      'Capture two comparison photos of the same subject: (1) wide aperture (f/2.8 or Portrait mode) separating subject from background, and (2) balanced window key light with clean negative space.',
    practiceDeliverablePrompt:
      'Record your Aperture, Shutter Speed, and ISO choices and explain why raising ISO is normally your last resort after adjusting aperture and shutter speed.',
    knowledgeCheck: {
      question:
        'If you want a sharp subject with a smoothly blurred background (shallow depth of field) while avoiding motion blur on a moving person, how should you set Aperture and Shutter Speed?',
      options: [
        'Use a wide aperture (smaller f-number like f/2.0–f/2.8) paired with a fast shutter speed (such as 1/250s or faster)',
        'Set f/22 with a 2-second handheld shutter exposure',
        'Max out ISO 25600 indoors under bright midday sun at f/16',
        'Leave lens cap partially covering half the front element'
      ],
      correctIndex: 0,
      explanation:
        'Lower f-stop numbers open the iris wider (letting in more light and narrowing depth of field), allowing faster shutter speeds to freeze motion cleanly.'
    },
    detailedStudyNotes: [
      'Three Pillars, Tradeoffs Every Time: Aperture controls depth-of-field blur, Shutter Speed controls motion freeze/blur, and ISO amplifies sensor sensitivity (at the cost of grain).',
      'Quality & Direction of Light Beats Megapixels: Position subjects angled toward soft indirect window light or diffused softboxes rather than harsh overhead fixtures.',
      'Protect Your Highlights: Slightly underexposed RAW highlights recover cleanly in post, whereas clipped white blown skies lose detail forever.',
      'Declutter Edges Before Pressing Shutter: Scan all 4 corners of the viewfinder for distracting cables, trash cans, or poles sticking out behind heads.'
    ],
    fieldTip: 'Keep handheld shutter speed at least `1 / (focal_length_mm)` (e.g., ≥ 1/100s for an 85mm lens) to eliminate subtle handshake softness.'
  },
  {
    id: 'lbd_media_video_editing_58',
    lessonNumber: 58,
    videoLabel: 'Video 58: Video Editing & Visual Storytelling',
    title: 'Video Editing & Visual Storytelling: Pacing, Cuts & Portfolio Polish',
    category: 'Creative Media & Design',
    enclaveId: 'creative_media_arts',
    professionId: 'video_editor',
    level: 'Beginner',
    originalCreator: 'Tim Runia',
    creatorDomain: 'youtube.com',
    description:
      'Practical editor’s guide on J-cuts and L-cuts, editing on natural action/emotion, audio clarity priority, b-roll pacing, and cutting fat so viewers stay hooked through the final frame.',
    skillsCovered: [
      'Smooth J-Cut & L-Cut Audio Leads',
      'Cutting on Action & Visual Motivation',
      'Vocal Clarity & Balanced Music Ducking',
      'Pacing & Trimming Dead Air Cleanly'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=dhpazqW_OaU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=dhpazqW_OaU',
    youtubeId: 'dhpazqW_OaU',
    embedAvailable: true,
    duration: '12:35',
    thumbnailUrl: 'https://i.ytimg.com/vi/dhpazqW_OaU/hqdefault.jpg',
    practiceActivity:
      'Take a 60-second talking/demo clip in any timeline editor and apply 2 J-cuts/L-cuts leading into b-roll plus balanced voice-over levels (-12 to -6 dBFS dialogue, music -24 dB under voice).',
    practiceDeliverablePrompt:
      'Describe how an L-cut (letting audio carry into the next shot) and J-cut (hearing the next scene’s audio before the cut) change perceived pacing.',
    knowledgeCheck: {
      question:
        'Why do professional editors prioritize clean dialogue audio normalization and J-cuts/L-cuts before adding flashy video transitions?',
      options: [
        'Audiences forgive minor camera imperfections far sooner than distorted audio or jarring hard audio-video cuts; overlapping sound bridges scenes naturally',
        'J-cuts erase all video frames from the project timeline',
        'Music tracks should always overpower speaking voices at +6 dB clipping',
        'Transitions replace the need to record story or interview content'
      ],
      correctIndex: 0,
      explanation:
        'Sound drives emotional continuity—leading or trailing audio across visual cuts hides edits smoothly while intelligible dialogue holds viewer retention.'
    },
    detailedStudyNotes: [
      'Rough Assembly Story First: Lock narrative flow cleanly with zero music/FX first; if the story works dry, polish elevates it—no gloss fixes a boring middle.',
      'Cut on Movement: Switching wide-to-close mid-gesture (turning a wrench, opening a door) guides the viewer’s eye seamlessly across the cut.',
      'Audio Levels Discipline: Aim spoken dialogue cleanly around -12 dB to -6 dB peaks with gentle compression, tucking background score cleanly underneath.',
      'Kill Your Darlings: Remove pretty shots that slow momentum or repeat information already stated visually.'
    ],
    fieldTip: 'Watch your final cut back once with eyes closed (listening only for audio pops/dips) and once muted (checking purely visual pacing).'
  },

  // ─── TELECOM & FIBER OPTICS (#59–60) ──────────────────────────────────────
  {
    id: 'lbd_telecom_fiber_59',
    lessonNumber: 59,
    videoLabel: 'Video 59: Fiber Optic Stripping & Termination',
    title: 'Fiber Optic Field Craft: Stripping, Cleaving & Terminating Fiber',
    category: 'Telecom & Fiber Optics',
    enclaveId: 'telecom_digital_infrastructure',
    professionId: 'fiber_technician',
    level: 'Beginner',
    originalCreator: 'CableWholesale.com',
    creatorDomain: 'youtube.com',
    description:
      'Field demonstration showing fiber jacket removal, 900µm/250µm buffer stripping, 99% isopropyl cleaning, precision diamond-blade cleaving, and field connector termination with zero glass shards lost.',
    skillsCovered: [
      'Buffer & Acrylate Coating Stripping',
      '99% Isopropyl Alcohol Fiber Cleaning',
      'Precision One-Step Cleaving Geometry',
      'Safe Glass Scrap Shard Disposal (Sharps Bin)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=EFWet-QnxcA',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=EFWet-QnxcA',
    youtubeId: 'EFWet-QnxcA',
    embedAvailable: true,
    duration: '3:50',
    thumbnailUrl: 'https://i.ytimg.com/vi/EFWet-QnxcA/hqdefault.jpg',
    practiceActivity:
      'Sequence all 6 stages of a mechanical/splice-on fiber LC termination: strip outer jacket → strip 250µm coating → clean lint-free with IPA → cleave exact strip length → inspect cleave angle → crimp/cam.',
    practiceDeliverablePrompt:
      'Explain why technicians must NEVER touch cleaved bare glass with fingers and must store every fiber offcut immediately in a dedicated fiber sharps container.',
    knowledgeCheck: {
      question:
        'After wiping stripped bare optical fiber cleanly with 99% isopropyl alcohol and precision-cleaving it, why must it be inserted directly into the connector/splicer without wiping again or touching it?',
      options: [
        'Microscopic skin oils, dust particles, or cloth fibers contaminate the cleaved end-face, causing high dB insertion loss and back-reflection faults',
        'Bare fiber evaporates within three seconds in room air',
        'Touching the tip changes single-mode yellow jackets into multimode aqua',
        'Skin contact doubles optical transmission bandwidth'
      ],
      correctIndex: 0,
      explanation:
        'A singlemode fiber core is only ~9 microns wide (1/10th a human hair)—tiny oil smears scatter optical laser power across the termination.'
    },
    detailedStudyNotes: [
      'Cleaver Angle Matters: Clean perpendicular 90° cleaves (< 1° variance) are essential before camming mechanical connectors or firing a fusion arc.',
      'Fiber Shard Safety First: Microscopic silica glass scraps pierce skin effortlessly and never show on standard X-rays—work over a dark fiber mat and tape/bin every scrap immediately.',
      'Verify With VFL & Light Meter: Use a Visual Fault Locator (red laser) cleanly to confirm no macro-bend breaks, followed by dBm optical loss testing.',
      'Respect Minimum Bend Radius: Never kink or zip-tie fiber patches tightly inside IDF/MDF racks; use proper waterfall bend-radius spools.'
    ],
    fieldTip: 'Keep lint-free Kimwipes and fresh 99%+ optical IPA stocked cleanly—never clean fiber end-faces with shirt tails or compressed shop air.'
  },
  {
    id: 'lbd_telecom_cat6_60',
    lessonNumber: 60,
    videoLabel: 'Video 60: Structured Cat6/6A RJ45 Termination',
    title: 'Structured Network Cabling: Terminating Cat6/6A RJ45 Connectors',
    category: 'Telecom & Fiber Optics',
    enclaveId: 'telecom_digital_infrastructure',
    professionId: 'network_technician',
    level: 'Beginner',
    originalCreator: 'trueCABLE',
    creatorDomain: 'youtube.com',
    description:
      'Network installer breakdown demonstrating TIA/EIA-568B vs. 568A color pinouts, keeping twisted pairs intact right to the plug collar, spline trimming, strain-relief seating, and pin verification.',
    skillsCovered: [
      'T568B Pair Ordering (W-O/O, W-G/B, W-B/G, W-Br/Br)',
      'Minimizing Pair Untwist (< 0.5 Inch / 13mm)',
      'Outer Jacket Seating Inside Crimp Strain Relief',
      'Cable Continuity & Wiremap Certification'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=mYYVhimigYM',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=mYYVhimigYM',
    youtubeId: 'mYYVhimigYM',
    embedAvailable: true,
    duration: '8:43',
    thumbnailUrl: 'https://i.ytimg.com/vi/mYYVhimigYM/hqdefault.jpg',
    practiceActivity:
      'Write out both T568A and T568B 8-pin color sequences side-by-side and trace which pairs swap between pins 1-2 and 3-6, noting why consistent jacket strain-relief crimping matters.',
    practiceDeliverablePrompt:
      'State the complete T568B pin 1 through pin 8 color sequence from memory and explain why untwisting pairs too far breaks 10GbE / PoE++ signal integrity.',
    knowledgeCheck: {
      question:
        'When terminating Cat6 or Cat6A Ethernet cables for Gigabit/10-Gigabit networks, why should wire pairs remain twisted as close to the RJ45 gold pins as possible (maximum 1/2 inch untwist)?',
      options: [
        'Differential pair twists cancel electromagnetic interference and near-end crosstalk (NEXT) between adjacent pairs',
        'Untwisting pairs prevents copper from melting at 70°F',
        'Pairs only pass DC voltage when untwisted for 6 inches',
        'T568B standards require cutting off pairs 4-5 and 7-8 completely'
      ],
      correctIndex: 0,
      explanation:
        'Balanced twists protect high-frequency Ethernet signaling against crosstalk; excessive untwist creates packet retries and link negotiation drops.'
    },
    detailedStudyNotes: [
      'T568B Standard Pinout (1→8): White/Orange, Orange, White/Green, Blue, White/Blue, Green, White/Brown, Brown.',
      'Seat Jacket Under Strain Bar: Always push the outer PVC/CMP jacket cleanly inside the rear plug wedge before crimping so pulling tension never tugs bare copper conductors.',
      'Inspect Gold Blade Depth: Before testing, visually inspect the plug face/side to confirm all 8 wires hit the front wall and brass pins pierced straight.',
      'Solid vs. Stranded Rules: Use keystone punchdown jacks in walls for solid-core riser/plenum cable, reserving RJ45 plugs cleanly for patch/field-plug specs.'
    ],
    fieldTip: 'Keep your jacket ring-stripper depth calibrated so you never nick the thin HDPE wire insulation underneath—even a tiny copper nick fails PoE+ load checks.'
  },

  // ─── AVIATION & MARITIME (#61–62) ─────────────────────────────────────────
  {
    id: 'lbd_aviation_preflight_61',
    lessonNumber: 61,
    videoLabel: 'Video 61: Aircraft Exterior Preflight Inspection',
    title: 'Aviation Maintenance & Flight Ops: Exterior Preflight Inspection',
    category: 'Aviation & Maritime',
    enclaveId: 'aviation_aerospace_maritime',
    professionId: 'pilot',
    level: 'Beginner',
    originalCreator: "Sporty's Pilot Shop",
    creatorDomain: 'youtube.com',
    description:
      'Structured FAA walkaround preflight inspection demonstrating control-surface freedom/hinge checks, pitot/static port clearance, fuel sumping for water/grade color, and landing gear strut/tire verification.',
    skillsCovered: [
      'Checklist-Driven 360° Walkaround Sequence',
      'Flight Control Hinges, Counterweights & Safety Wire',
      'Fuel Sumping (Grade Color & Zero Water)',
      'Pitot-Static Unobstructed Sensor Check'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=_v61LFpZ5CE',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=_v61LFpZ5CE',
    youtubeId: '_v61LFpZ5CE',
    embedAvailable: true,
    duration: '4:33',
    thumbnailUrl: 'https://i.ytimg.com/vi/_v61LFpZ5CE/hqdefault.jpg',
    practiceActivity:
      'Walk through an 8-point aviation preflight flow (Cockpit Master/Arrow Docs → Right Wing → Empennage → Left Wing → Nose/Prop/Oil → Fuel Sumps → Undercarriage → Final Walkback) with red flags to check at each station.',
    practiceDeliverablePrompt:
      'Explain how to spot water contamination inside an aviation fuel sump cup (e.g., 100LL blue avgas vs. water) and why checklists are ALWAYS read mechanically, never purely from memory.',
    knowledgeCheck: {
      question:
        'During an exterior preflight fuel sump check on a piston aircraft fueled with 100LL Avgas, what visual sign reveals dangerous water contamination in the transparent tester cup?',
      options: [
        'Water is heavier than aviation fuel and settles as a clear separated bubble or layer at the bottom of the cup beneath the light-blue 100LL fuel',
        'Water floats gently as bright green foam on top of the fuel',
        'Water instantly dissolves blue dye so the entire tank evaporates',
        'Fuel sump cups only test hydraulic brake fluid'
      ],
      correctIndex: 0,
      explanation:
        'Sumping from the lowest tank and strainer drains removes condensed water droplets that sink below lighter fuel before takeoff.'
    },
    detailedStudyNotes: [
      'Never Walk Away Mid-Preflight: If an interruption occurs halfway through inspecting cowling latches, fuel caps, or tie-downs, restart that station cleanly.',
      'Controls Must Be Checked Visually + Tactilely: Inspect rod ends, cotter pins, security of trim tabs, and smooth movement without binding or metal-on-metal play.',
      'Verify Prop Nicks & Oil Quantity: Run light fingers carefully across propeller blade leading edges for stone chips that concentrate fatigue stress.',
      'Pitot Cover & Gust Locks Removed: Confirm bright "REMOVE BEFORE FLIGHT" pitot covers, static port tape, and wheel chocks are completely stowed.'
    ],
    fieldTip: 'Keep the physical Pilot’s Operating Handbook (POH) checklist in hand for every walkaround—fatigue and familiarity cause skipped steps when relying strictly on memory.'
  },
  {
    id: 'lbd_maritime_diesel_62',
    lessonNumber: 62,
    videoLabel: 'Video 62: Marine Diesel Systems & Maintenance',
    title: 'Marine Diesel Engineering: Fuel Systems, Spares & Preventive Service',
    category: 'Aviation & Maritime',
    enclaveId: 'aviation_aerospace_maritime',
    professionId: 'marine_mechanic',
    level: 'Beginner',
    originalCreator: 'practicalboatowner',
    creatorDomain: 'youtube.com',
    description:
      'Marine diesel maintenance masterclass covering primary/secondary fuel filter water separation, diesel bug prevention, raw-water impeller spares, emergency stop cables, and critical sea-trial engine spares.',
    skillsCovered: [
      'Primary Racor & Engine Fuel Filter Service',
      'Water/Air Bleeding & Fuel Contamination Control',
      'Raw-Water Pump Impeller & Belt Inspection',
      'Emergency Mechanical Air/Fuel Cutoff Check'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=y3PkOE5WWF0',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=y3PkOE5WWF0',
    youtubeId: 'y3PkOE5WWF0',
    embedAvailable: true,
    duration: '18:27',
    thumbnailUrl: 'https://i.ytimg.com/vi/y3PkOE5WWF0/hqdefault.jpg',
    practiceActivity:
      'Build an underway marine diesel spares & pre-departure check sheet covering oil/coolant levels, primary fuel filter bowl inspection, raw-water sea strainer, belt dust check, and spares kit.',
    practiceDeliverablePrompt:
      'Explain why running a marine engine dry or sucking air into high-pressure diesel injection lines shuts down propulsion cleanly offshore—and how bleeding screws restore fuel prime.',
    knowledgeCheck: {
      question:
        'Why are spare raw-water pump rubber impellers, fuel filter elements, and alternator belts considered mandatory onboard spares for any diesel marine vessel?',
      options: [
        'Seaweed/mud blockage or momentary dry startup shreds rubber impellers within seconds (causing rapid overheating), and rough seas stir tank sediment that clogs primary fuel filters offshore',
        'Diesel engines require swapping rubber impellers every 10 minutes underway',
        'Primary filters increase propeller pitch mechanically',
        'Saltwater sea strainers turn into fresh drinking water reserves automatically'
      ],
      correctIndex: 0,
      explanation:
        'Unlike cars on highways, vessels cannot pull onto a shoulder—overheating from torn impellers and choked fuel filters account for most preventable offshore engine failures.'
    },
    detailedStudyNotes: [
      'Two-Stage Filtration Matters: Inspect transparent primary Racor water-separator bowls before every departure for water beads or black microbial "diesel bug" sludge.',
      'Check Exhaust Raw-Water Flow Immediately: Always confirm steady seawater discharge out the transom exhaust within 10 seconds of cranking.',
      'Look for Black Belt Dust Under Pulleys: Fine rubber soot signals belt misalignment or worn pulley sheaves well before the belt snaps.',
      'Know Your Mechanical Fuel Shutoff: If the dashboard stop solenoid fails electronically, locate and test the mechanical stop lever directly on the injection pump.'
    ],
    fieldTip: 'Write the exact filter, belt, and impeller OEM cross-reference numbers directly inside the engine bay cover with permanent marker before an emergency ever happens.'
  },

  // ─── SCIENCE & LAB TECH (#63–64) ──────────────────────────────────────────
  {
    id: 'lbd_science_micropipette_63',
    lessonNumber: 63,
    videoLabel: 'Video 63: Precision Lab Micropipetting',
    title: 'Biotech & Lab Technique: Precision Micropipetting Fundamentals',
    category: 'Science & Lab Tech',
    enclaveId: 'science_laboratory_research',
    professionId: 'lab_technician',
    level: 'Beginner',
    originalCreator: 'Carolina Science',
    creatorDomain: 'youtube.com',
    description:
      'Analytical wet-lab instruction covering selecting P20/P200/P1000 volume ranges safely, tactile first-stop aspiration vs. second-stop blowout dispensing, pre-wetting tips, and cross-contamination hygiene.',
    skillsCovered: [
      'Selecting Proper Micropipette Volume Range',
      'First-Stop Aspiration & Second-Stop Dispensing',
      'Pre-Wetting Tip Interior for Accuracy',
      'Keeping Pipette Vertical & Never Laying Wet Tips Flat'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Jfqafjt4q6U',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Jfqafjt4q6U',
    youtubeId: 'Jfqafjt4q6U',
    embedAvailable: true,
    duration: '3:38',
    thumbnailUrl: 'https://i.ytimg.com/vi/Jfqafjt4q6U/hqdefault.jpg',
    practiceActivity:
      'Review micropipette calibration ranges (e.g., dialing 150 µL on a P200 instead of P1000) and map the exact plunger sequence for Forward Pipetting without drawing liquid into the shaft barrel.',
    practiceDeliverablePrompt:
      'Explain the crucial functional difference between pressing to the FIRST stop vs. pressing to the SECOND stop during aspiration vs. dispensing.',
    knowledgeCheck: {
      question:
        'During standard forward micropipetting, what mistake occurs if you press the plunger all the way to the SECOND stop BEFORE immersing the tip to aspirate liquid?',
      options: [
        'You aspirate a larger volume of sample than the dialed microliter setting, ruining assay dilution accuracy',
        'Nothing enters the pipette tip at all',
        'It automatically sterilizes the tip interior with UV light',
        'It triples sample precision across PCR reaction plates'
      ],
      correctIndex: 0,
      explanation:
        'Always press only to the FIRST stop to draw up the exact calibrated volume; save the SECOND stop blowout exclusively to expel residual droplets when dispensing.'
    },
    detailedStudyNotes: [
      'Stay Inside Valid Operating Windows: Never dial a pipette above its max rating or below ~10% of max capacity—turning past stops damages internal micrometer springs.',
      'Controlled Plunger Release Prevents Aerosols: Snapping your thumb off quickly aspirates bubbles and slings reagent straight up into the pipette nose cone.',
      'Hold Vertical During Draw, Angle 30–45° When Dispensing: Touch the plastic tip lightly against the receiving microtube wall cleanly during blowout.',
      'Reset to Highest Volume or Hang Upright: Never lay a loaded micropipette flat on the bench where sample can seep back inside the shaft.'
    ],
    fieldTip: 'Pre-wet a fresh tip cleanly once with volatile solvents or viscous buffers before taking the analytical aliquot—it equalizes vapor pressure and improves repeatability.'
  },
  {
    id: 'lbd_science_lab_safety_64',
    lessonNumber: 64,
    videoLabel: 'Video 64: Laboratory Safety & Compliance',
    title: 'Laboratory Safety & Compliance: PPE, Chemical Handling & Protocols',
    category: 'Science & Lab Tech',
    enclaveId: 'science_laboratory_research',
    professionId: 'research_scientist',
    level: 'Beginner',
    originalCreator: 'Forsyth Tech CTLE',
    creatorDomain: 'youtube.com',
    description:
      'Foundational wet-lab safety orientation covering lab coats, splash goggles, nitrile glove hygiene, locating eyewash/safety showers, SDS sheets, fume hood sash height, and zero-clutter bench protocols.',
    skillsCovered: [
      'Required Lab PPE & Footwear Compliance',
      'Safety Data Sheet (SDS) Hazard Lookups',
      'Fume Hood Sash Calibration & Airflow',
      'Emergency Eyewash, Shower & Spill Response'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=pOkPE1hnMdQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=pOkPE1hnMdQ',
    youtubeId: 'pOkPE1hnMdQ',
    embedAvailable: true,
    duration: '3:47',
    thumbnailUrl: 'https://i.ytimg.com/vi/pOkPE1hnMdQ/hqdefault.jpg',
    practiceActivity:
      'Conduct a 7-point safety walk checklist for a laboratory bench: PPE availability, unobstructed eyewash/shower path, labeled secondary containers, working fume hood sash height, and sharps/chemical waste segregation.',
    practiceDeliverablePrompt:
      'Explain the rule for diluting strong concentrated acids in water ("Add Acid to Water / AA") and state how long an emergency eyewash flush must run after chemical splash.',
    knowledgeCheck: {
      question:
        'When working with volatile or corrosive liquids inside a chemical fume hood, why is there a marked target sash height indicator along the frame?',
      options: [
        'Keeping the glass sash at or below that line maintains safe face-velocity airflow inward so toxic vapors do not eddy back out into the operator’s breathing zone',
        'Raising the sash all the way above your head doubles vacuum suction',
        'The sash acts as a decorative magnifying lens for microscopes',
        'Lowering the sash turns off building exhaust fans permanently'
      ],
      correctIndex: 0,
      explanation:
        'Certified fume hoods depend on proper sash height to balance airflow velocity cleanly and also put shatter-resistant safety glass between reactions and your face.'
    },
    detailedStudyNotes: [
      'Strictly No Food, Drink, Cosmetics, or Open Shoes: Never store snacks inside lab refrigerators or wear shorts/sandals where broken glass or splashes land.',
      'Check SDS Before Mixing Anything: Verify incompatibility (e.g., acids near cyanides or strong oxidizers near flammables) via Safety Data Sheets upfront.',
      'Clean Labeling Rule: Every beaker, transfer bottle, and sample tube needs clear chemical name, concentration, hazard pictogram, date, and initials—never "clear liquid #2".',
      'Know Every Exit & Shower Unblinded: Verify unimpeded paths to emergency eyewash stations (15-minute continuous rinse standard) before touching hazardous reagents.'
    ],
    fieldTip: 'Keep one ungloved "clean hand" or remove gloves completely before touching shared door knobs, elevator buttons, and lab laptops.'
  },

  // ─── EDUCATION & TRAINING (#65–66) ────────────────────────────────────────
  {
    id: 'lbd_education_id_65',
    lessonNumber: 65,
    videoLabel: 'Video 65: Instructional Design Foundations',
    title: 'Instructional Design Foundations: Building Structured Training Programs',
    category: 'Education & Training',
    enclaveId: 'education_workforce',
    professionId: 'educator',
    level: 'Beginner',
    originalCreator: 'Devlin Peck',
    creatorDomain: 'youtube.com',
    description:
      'Industry walkthrough of Instructional Design (ADDIE & backward design), defining observable performance objectives rather than information dumps, and designing practice activities that change real workplace behavior.',
    skillsCovered: [
      'ADDIE Lifecycle & Backward Design',
      'Needs Analysis vs. Information Dumping',
      'Writing Observable Performance Objectives',
      'Aligning Assessments With Real-World Tasks'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=5n-ea5gIEMk',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=5n-ea5gIEMk',
    youtubeId: '5n-ea5gIEMk',
    embedAvailable: true,
    duration: '11:21',
    thumbnailUrl: 'https://i.ytimg.com/vi/5n-ea5gIEMk/hqdefault.jpg',
    practiceActivity:
      'Design a 1-page module blueprint for teaching any trade or software task using Backward Design: (1) measurable job outcome, (2) hands-on check criteria, (3) 10-minute focused practice plan.',
    practiceDeliverablePrompt:
      'Rewrite a vague objective ("Understand multimeter safety") into a measurable behavioral objective specifying Action, Condition, and Passing Standard.',
    knowledgeCheck: {
      question:
        'In instructional design, what is the biggest difference between building effective skills training versus simply creating an informational slide deck ("information dump")?',
      options: [
        'Effective training starts with what learners must DO on the job and builds guided practice and realistic decision scenarios with feedback around those exact skills',
        'Effective training always uses 200+ dense text slides without pauses or checks',
        'Information dumps eliminate the need for instructors or assessments',
        'Skills training forbids learners from asking questions or practicing'
      ],
      correctIndex: 0,
      explanation:
        'Backward design ties every lesson element directly to real workplace execution, scenarios, and measurable skill mastery rather than passive reading.'
    },
    detailedStudyNotes: [
      'Analyze Before Building: Always verify first whether a performance problem stems from lack of skill vs. unclear tools/SOPs vs. missing incentives.',
      'Measurable Verbs Over Vague Verbs: Replace "know/understand" with demonstrable actions: diagnose, calibrate, assemble, triage, draft, calculate.',
      'Chunk Complex Topics Tightly: Teach one procedure cleanly, practice immediately, then layer exceptions rather than cramming 90 minutes straight.',
      'Provide Timely Specific Feedback: Explain WHY distractors fail rather than merely flashing "Incorrect".'
    ],
    fieldTip: 'Keep every lesson lean by applying a strict filter: if an extra paragraph doesn’t directly help the learner perform the real task safely, move it to optional reference docs.'
  },
  {
    id: 'lbd_education_facilitation_66',
    lessonNumber: 66,
    videoLabel: 'Video 66: Workforce Coaching & Facilitation',
    title: 'Workforce Coaching & Facilitation: Leading High-Engagement Workshops',
    category: 'Education & Training',
    enclaveId: 'education_workforce',
    professionId: 'workforce_trainer',
    level: 'Beginner',
    originalCreator: 'Chad Littlefield',
    creatorDomain: 'youtube.com',
    description:
      'Practical trainer’s playbook for structuring high-trust workshops, designing meaningful open questions, managing silent vs. dominant participants cleanly, and closing sessions with concrete commitments.',
    skillsCovered: [
      'Psychological Safety & Structured Check-Ins',
      'Open vs. Closed Question Framing',
      'Small-Group Breakout Rotation Discipline',
      'Actionable Session Close & Follow-Up Loop'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=PwEp0kUNW5o',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=PwEp0kUNW5o',
    youtubeId: 'PwEp0kUNW5o',
    embedAvailable: true,
    duration: '16:27',
    thumbnailUrl: 'https://i.ytimg.com/vi/PwEp0kUNW5o/hqdefault.jpg',
    practiceActivity:
      'Plan a 30-minute trade or team training workshop outline integrating: a 3-minute hook question, 10-minute live demo, 12-minute paired hands-on drill, and 5-minute teach-back reflection.',
    practiceDeliverablePrompt:
      'Draft two "Connection Before Content" prompts suited to your profession that quickly surface real jobsite challenges at the start of training.',
    knowledgeCheck: {
      question:
        'When a workshop trainer asks "Any questions?" to a quiet room and gets dead silence, what facilitation shift reliably produces authentic participation?',
      options: [
        'Use a specific low-stakes prompt plus 60-second paired/small-group think time ("Turn to a partner and name one step that feels tricky") before inviting group share-out',
        'Scold the entire class silently for 5 full minutes',
        'Talk twice as fast through the remaining 40 slides without pausing',
        'Cancel all practice exercises permanently'
      ],
      correctIndex: 0,
      explanation:
        'Specific prompts + 1-2-4-All / Think-Pair-Share remove public risk so quiet practitioners organize thoughts safely before speaking to the room.'
    },
    detailedStudyNotes: [
      'Connection Before Content: Two minutes surfacing participants’ real on-the-job goals wakes up adult learners faster than reading bios and housekeeping rules.',
      'Hold 5–7 Seconds of Wait Time: Avoid answering your own question two seconds in—people need genuine processing time.',
      'Move From Presenter to Guide: Adult apprentices retain far more when they troubleshoot a realistic snag and teach the solution back.',
      'End With Specific First Actions: Ask each learner what one habit they will apply on their next shift.'
    ],
    fieldTip: 'Give clear physical cues when wrapping a group exercise ("15 seconds to finish your last thought") rather than shouting cold over loud table discussions.'
  },

  // ─── SAFETY & CIVIC OPS (#67) ─────────────────────────────────────────────
  {
    id: 'lbd_safety_osha_hazards_67',
    lessonNumber: 67,
    videoLabel: 'Video 67: OSHA Hazard Identification & Risk Control',
    title: 'OSHA Workplace Safety: Hazard Identification & Risk Assessment',
    category: 'Safety & Civic Ops',
    enclaveId: 'community_civic_security',
    professionId: 'safety_officer',
    level: 'Beginner',
    originalCreator: 'Safelyio',
    creatorDomain: 'youtube.com',
    description:
      'Essential OSHA safety briefing on conducting Job Hazard Analyses (JHA), classifying physical/chemical/biological/ergonomic hazards, and applying the 5-tier Hierarchy of Controls cleanly.',
    skillsCovered: [
      'Job Hazard Analysis (JHA) Inspection Walkthrough',
      'OSHA Focus Four & Workplace Hazard Categories',
      'Hierarchy of Controls (Eliminate → PPE)',
      'Proactive Near-Miss Reporting Culture'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=1AoHMOQsESo',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=1AoHMOQsESo',
    youtubeId: '1AoHMOQsESo',
    embedAvailable: true,
    duration: '6:21',
    thumbnailUrl: 'https://i.ytimg.com/vi/1AoHMOQsESo/hqdefault.jpg',
    practiceActivity:
      'Complete a sample Job Hazard Analysis (JHA) table for a common site activity (ladder access, grinder operation, or trench work) detailing task steps, hazards, and engineering/PPE controls.',
    practiceDeliverablePrompt:
      'List all 5 levels of the OSHA/NIOSH Hierarchy of Controls in order from MOST effective to LEAST effective and explain why PPE is the final defense.',
    knowledgeCheck: {
      question:
        'According to the standard OSHA/NIOSH Hierarchy of Controls, why is PPE (gloves, respirators, harnesses) positioned as the LAST line of defense rather than the first?',
      options: [
        'Because PPE does not remove the underlying hazard—if equipment fits poorly, tears, or is forgotten once, the worker still suffers exposure, whereas Elimination or Engineering Controls protect everyone reliably',
        'Because steel-toe boots are banned on construction jobsites',
        'Because PPE automatically doubles airborne silica concentrations',
        'Because administrative signs physically block falling objects'
      ],
      correctIndex: 0,
      explanation:
        'Always strive from top to bottom: Elimination → Substitution → Engineering Controls (guards/ventilation) → Administrative Controls → PPE.'
    },
    detailedStudyNotes: [
      'OSHA Focus Four Awareness: Falls, Struck-By, Caught-In/Between, and Electrocution account for the vast majority of severe field fatalities—guard against these daily.',
      'Pre-Task 5-Minute Safety Huddle: Walk changes in weather, overhead crane picks, live energized panels, and adjacent trades before tools start spinning.',
      'Lockout / Tagout (LOTO) Is Non-Negotiable: Isolate, lock, bleed stored energy, and test zero-voltage before reaching inside any guarded machine.',
      'Log Near Misses Immediately: Almost every severe injury was preceded by minor unaddressed near misses—fixing the root trap saves lives.'
    ],
    fieldTip: 'Do a 30-second "SLAM" check before every task (Stop, Look, Assess hazards, Manage safely)—no schedule rush justifies bypassing guards or fall tie-offs.'
  },

  // ─── EXPANDED VERIFIED TRADE & PROFESSION LESSONS (#68–102) ───────────────
  {
    id: 'lbd_welding_walk_cup_68',
    lessonNumber: 68,
    videoLabel: 'Video 68: Pipe & Plate TIG Walk the Cup',
    title: 'How to Walk the Cup on Plate and Pipe (TIG Welding)',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Intermediate',
    originalCreator: 'weldingtipsandtricks',
    creatorDomain: 'youtube.com',
    description:
      'Step-by-step Jody Collier shop demonstration breaking down tungsten extension, alumina cup angle, wrist pivot rhythm, and consistent bead weave while walking the cup on carbon steel plate and pipe.',
    skillsCovered: [
      'Alumina Cup Sizing & Stick-Out Setup',
      'Synchronized Wrist Pivot Weaving Motion',
      'Root & Cap Puddle Wet-In Control',
      'Avoiding Undercut Along Pipe Bevels'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=lPeV7i56qSU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=lPeV7i56qSU',
    youtubeId: 'lPeV7i56qSU',
    embedAvailable: true,
    duration: '8:45',
    thumbnailUrl: 'https://i.ytimg.com/vi/lPeV7i56qSU/hqdefault.jpg',
    practiceActivity:
      'Practice walking a #6 or #7 alumina cup along a dry soapstone line on scrap pipe or angle iron before striking an arc to dial in uniform step spacing.',
    practiceDeliverablePrompt:
      'Record your cup size, tungsten stick-out length, and how stepping too wide vs. too narrow changes weave spacing and edge fusion.',
    knowledgeCheck: {
      question:
        'Why should you maintain light, balanced cup pressure against the bevel or fillet walls while walking the cup?',
      options: [
        'Controlled two-point cup contact pivots smoothly edge-to-edge, maintaining steady arc length and repeatable heat distribution',
        'Locking the cup with maximum force snaps the tungsten tip on every weave',
        'Floating the cup 2 inches above the weld removes shielding gas coverage',
        'Shaking rapidly forward prevents filler metal from melting'
      ],
      correctIndex: 0,
      explanation:
        'Resting the ceramic nozzle gently against the bevel shoulders lets you trace tiny figure-8 or side-to-side arcs with constant tungsten stand-off.'
    }
  },
  {
    id: 'lbd_welding_aluminum_corner_69',
    lessonNumber: 69,
    videoLabel: 'Video 69: Aluminum TIG 1F & 2F Corners',
    title: 'Aluminum TIG Welding 1F & 2F Outside Corner Joints',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Intermediate',
    originalCreator: 'weldingtipsandtricks',
    creatorDomain: 'youtube.com',
    description:
      'AC TIG aluminum training covering oxide removal, AC balance settings, torch angle on outside corner joints, and feeding ER4043/ER5356 filler cleanly into bright molten aluminum.',
    skillsCovered: [
      'AC Balance & Cleaning Action Tuning',
      'Stainless Wire Brushing & Acetone Prep',
      'Feeding Aluminum Filler Without Freezing',
      '1F Flat vs. 2F Horizontal Heat Control'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=UCFmhUChDws',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=UCFmhUChDws',
    youtubeId: 'UCFmhUChDws',
    embedAvailable: true,
    duration: '10:15',
    thumbnailUrl: 'https://i.ytimg.com/vi/UCFmhUChDws/hqdefault.jpg',
    practiceActivity:
      'Tack a pair of 1/8" 6061 aluminum strips at 90 degrees for an outside corner joint, establish a dime-sized bright puddle, and dab filler rhythmically before aluminum heatsinks away.',
    practiceDeliverablePrompt:
      'Explain why tapering amperage slightly near the end of an aluminum pass prevents crater cracks.',
    knowledgeCheck: {
      question:
        'What surface prep step must be performed with a dedicated stainless brush before AC TIG welding aluminum?',
      options: [
        'Break up the high-melting-point aluminum oxide layer (>2000°C) with clean stainless bristles and degrease joints with acetone',
        'Coat the aluminum seam with heavy machine oil before striking an arc',
        'Use a carbon steel grinder wheel contaminated with mild steel sparks',
        'Preheat aluminum cherry-red at 900°C before brushing'
      ],
      correctIndex: 0,
      explanation:
        'Removing surface grease and thick oxide films ensures smooth AC cathodic cleaning, bright puddles, and contamination-free aluminum welds.'
    }
  },
  {
    id: 'lbd_plumbing_venting_70',
    lessonNumber: 70,
    videoLabel: 'Video 70: Plumbing Drain Venting Principles',
    title: 'Why Your Plumbing Needs to Be Vented (DWV Science)',
    category: 'Plumbing',
    enclaveId: 'trades_construction',
    professionId: 'plumber',
    level: 'Beginner',
    originalCreator: 'Got2Learn',
    creatorDomain: 'youtube.com',
    description:
      'Clear cutaway demonstration showing how Drain-Waste-Vent (DWV) piping equalizes air pressure behind flowing wastewater so P-trap water seals are never siphoned dry into living spaces.',
    skillsCovered: [
      'Preventing P-Trap Siphonage via Venting',
      'Wet Venting vs. Dry Vent Stacks',
      'Sanitary Tee vs. Wye Vent Orientation',
      'Eliminating Sewer Gas & Gurgling Drains'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=l8x3LrgHn9Y',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=l8x3LrgHn9Y',
    youtubeId: 'l8x3LrgHn9Y',
    embedAvailable: true,
    duration: '9:12',
    thumbnailUrl: 'https://i.ytimg.com/vi/l8x3LrgHn9Y/hqdefault.jpg',
    practiceActivity:
      'Sketch a bathroom group layout (sink, toilet, tub/shower) tracing how atmospheric vent air feeds behind each trap weir before tying above the flood-level rim.',
    practiceDeliverablePrompt:
      'Identify why S-traps lose their water seal quickly and how a vented P-trap with a vent connection above trap grade prevents suction.',
    knowledgeCheck: {
      question:
        'What hazardous condition occurs when an unvented fixture drain siphons the water seal out of a P-trap?',
      options: [
        'Sewer gases (including methane and hydrogen sulfide) can enter the building freely through the open dry trap',
        'Supply water pressure doubles above 160 PSI',
        'Copper supply manifolds immediately freeze',
        'Roof flashing seals tighter automatically'
      ],
      correctIndex: 0,
      explanation:
        'A vented DWV system admits air behind draining slugs of water so every P-trap retains its protective 2-inch water barrier against sewer odor and gas.'
    }
  },
  {
    id: 'lbd_electrical_multimeter_71',
    lessonNumber: 71,
    videoLabel: 'Video 71: Master Multimeter Selection & Safety',
    title: 'Before You Buy Your First Multimeter: CAT Ratings & Testing',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'Electrician U',
    creatorDomain: 'youtube.com',
    description:
      'Dustin Stelzer walks through True-RMS accuracy, CAT III/CAT IV overvoltage safety classifications, fuse protection, and Live-Dead-Live voltage verification every field electrician relies on.',
    skillsCovered: [
      'CAT III & CAT IV Safety Ratings Explained',
      'True-RMS Voltage & Continuity Mode',
      'Live-Dead-Live Three-Step Verification',
      'Lead Port Selection (V/Ω vs. Amperage Jacks)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=A7lu-27bj1U',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=A7lu-27bj1U',
    youtubeId: 'A7lu-27bj1U',
    embedAvailable: true,
    duration: '12:04',
    thumbnailUrl: 'https://i.ytimg.com/vi/A7lu-27bj1U/hqdefault.jpg',
    practiceActivity:
      'Inspect a multimeter dial, verify CAT rating stamps on both body and probes, and document the exact Live-Dead-Live test order before touching any branch conductors.',
    practiceDeliverablePrompt:
      'Explain why plugging test leads into an Amperage (A) jack and measuring across a live voltage source blows the internal HRC fuse or causes an arc flash.',
    knowledgeCheck: {
      question:
        'What does the "Live-Dead-Live" multimeter procedure verify before servicing an isolated circuit?',
      options: [
        'Test a known live source first, confirm zero voltage on the isolated circuit, then re-test the known live source to prove the meter didn’t fail mid-check',
        'Leave circuits energized while cutting sheathing',
        'Measure resistance on live 480V busbars',
        'Short hot to neutral twice before removing PPE'
      ],
      correctIndex: 0,
      explanation:
        'Proving your meter works before and after checking dead protects against dead meter batteries or blown probe fuses showing a false zero-volt reading.'
    }
  },
  {
    id: 'lbd_hvac_multi_rtu_diag_72',
    lessonNumber: 72,
    videoLabel: 'Video 72: Commercial AC Multi-Unit Troubleshooting',
    title: 'Commercial Dining HVAC Multi-Unit Down Diagnostics',
    category: 'HVAC',
    enclaveId: 'trades_construction',
    professionId: 'hvac_technician',
    level: 'Intermediate',
    originalCreator: 'HVACR VIDEOS',
    creatorDomain: 'youtube.com',
    description:
      'Real commercial field troubleshooting on a restaurant rooftop where multiple cooling units tripped out—tracing 24VAC control power, thermostat interlocks, safeties, and condenser faults systematically.',
    skillsCovered: [
      'Tracing Shared 24VAC Control Power Issues',
      'Isolating Low-Voltage Thermostat & Board Faults',
      'High/Low Pressure & Float Switch Interlocks',
      'Subcooling & Superheat Verification Under Load'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Q60_aRbd5Lo',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Q60_aRbd5Lo',
    youtubeId: 'Q60_aRbd5Lo',
    embedAvailable: true,
    duration: '18:20',
    thumbnailUrl: 'https://i.ytimg.com/vi/Q60_aRbd5Lo/hqdefault.jpg',
    practiceActivity:
      'Build a step-by-step RTU no-cool flowchart checking primary supply power (L1/L2/L3), secondary 24V transformer output (R-C), and safety switch loop continuity (Y1/Y2).',
    practiceDeliverablePrompt:
      'Identify why a technician checks R-to-C 24VAC control voltage before swapping thermostats or contactors blindly.',
    knowledgeCheck: {
      question:
        'If four rooftop units connected through a shared zone panel or breaker simultaneously show zero thermostat display power, what should a tech inspect first?',
      options: [
        'Verify incoming line power, low-voltage transformer secondary voltage (R-to-C), and any shared safety/EMS interlock relays before ordering compressors',
        'Immediately add extra R-410A refrigerant to all four condensers',
        'Replace every indoor TXV valve simultaneously',
        'Disconnect condenser fan motors permanently'
      ],
      correctIndex: 0,
      explanation:
        'Checking common supply feeds, control transformers, and building interlocks isolates shared root causes in minutes.'
    }
  },
  {
    id: 'lbd_masonry_shower_pan_73',
    lessonNumber: 73,
    videoLabel: 'Video 73: Dry Pack Shower Pan & Screed Slope',
    title: 'How to Dry Pack a Sloped Shower Pan Using Screed Guides',
    category: 'Masonry & Tile',
    enclaveId: 'trades_construction',
    professionId: 'construction_worker',
    level: 'Intermediate',
    originalCreator: 'TileCoach',
    creatorDomain: 'youtube.com',
    description:
      'Precision tile installation training demonstrating deck mud water-to-sand mix ratios, perimeter screed leveling, 1/4-inch-per-foot drainage slope, and packing a rock-solid shower mortar bed.',
    skillsCovered: [
      'Deck Mud Hydration ("Snowball" Consistency)',
      'Setting Perimeter Screed Strips Level',
      'Checking 1/4" per Foot Drain Pitch',
      'Wood Float Compacting Around Drain Flange'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=ORGngcaJXi4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=ORGngcaJXi4',
    youtubeId: 'ORGngcaJXi4',
    embedAvailable: true,
    duration: '14:15',
    thumbnailUrl: 'https://i.ytimg.com/vi/ORGngcaJXi4/hqdefault.jpg',
    practiceActivity:
      'Calculate perimeter mortar heights around a shower footprint so every wall corner sits level while pitching cleanly at 1/4" per foot toward an off-center drain.',
    practiceDeliverablePrompt:
      'Explain why tile shower "deck mud" uses far less water than concrete pour mixes.',
    knowledgeCheck: {
      question:
        'What is the standard code drainage slope target across a tiled shower pan mortar bed toward the drain?',
      options: [
        'Approximately 1/4 inch drop per linear foot (about 2%) uniformly around the perimeter to the drain',
        'Dead-flat 0 slope everywhere',
        '2 inches up per inch near the drain',
        'Slope away from the drain toward the bathroom carpet'
      ],
      correctIndex: 0,
      explanation:
        'Consistent 1/4" per foot pitch guarantees positive drainage to the clamping drain weep holes without making footing feel steep.'
    }
  },
  {
    id: 'lbd_masonry_parging_stucco_74',
    lessonNumber: 74,
    videoLabel: 'Video 74: Rules of Parging, Render & Stucco',
    title: 'Rules of Parging, Plaster, Rendering & Stucco Over Block',
    category: 'Masonry & Tile',
    enclaveId: 'trades_construction',
    professionId: 'local_artisan',
    level: 'Beginner',
    originalCreator: 'Mike Haduck Masonry',
    creatorDomain: 'youtube.com',
    description:
      'Veteran masonry field guide explaining substrate prep, damp-pre-wetting masonry block, scratch/finish coat layering, and avoiding bond failure when parging foundation walls.',
    skillsCovered: [
      'Cleaning & Pre-Dampening Block Substrates',
      'Bonding Slurry vs. Scratch Coat Mechanics',
      'Avoiding Trowel Overworking & Crazing Cracks',
      'Sponge Floating Smooth Exterior Finishes'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Eyaag6y5fb0',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Eyaag6y5fb0',
    youtubeId: 'Eyaag6y5fb0',
    embedAvailable: true,
    duration: '11:40',
    thumbnailUrl: 'https://i.ytimg.com/vi/Eyaag6y5fb0/hqdefault.jpg',
    practiceActivity:
      'Detail a 4-step parging checklist for an exterior concrete block foundation covering wire brushing loose paint, misting suction, applying thin scratch keys, and damp curing.',
    practiceDeliverablePrompt:
      'Explain why bone-dry concrete block steals moisture from fresh parge mortar and weakens bond strength.',
    knowledgeCheck: {
      question:
        'Why should dry masonry block or brick be lightly pre-dampened (never dripping wet) before troweling on parge mortar?',
      options: [
        'So dry masonry suction doesn’t pull mix water instantly out of the cement before hydration and bond crystal formation occur',
        'So mortar slides straight onto the dirt without touching the wall',
        'To prevent Portland cement from ever curing',
        'To dissolve aggregates out of sand'
      ],
      correctIndex: 0,
      explanation:
        'Controlling substrate suction prevents powdery flashing and delamination, creating a dense, durable parged seal.'
    }
  },
  {
    id: 'lbd_roofing_metal_panel_75',
    lessonNumber: 75,
    videoLabel: 'Video 75: Standing Seam Metal Roof Installation',
    title: 'Installing Lifetime Standing-Seam Metal Roof Panels',
    category: 'Roofing & Drywall',
    enclaveId: 'trades_construction',
    professionId: 'roofer',
    level: 'Intermediate',
    originalCreator: 'RR Buildings',
    creatorDomain: 'youtube.com',
    description:
      'Step-by-step post-frame and residential roofing execution covering eave trim squaring, concealed clip fastening, ridge closure ventilation, and checking panel creep across long runs.',
    skillsCovered: [
      'Squaring First Eave Panel Layout',
      'Thermal Expansion & Fastener Placement',
      'Synthetic Underlayment & Eave Drip Flashings',
      'Checking Parallel Overlap Every 4–5 Panels'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=US2n29hLsHk',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=US2n29hLsHk',
    youtubeId: 'US2n29hLsHk',
    embedAvailable: true,
    duration: '19:45',
    thumbnailUrl: 'https://i.ytimg.com/vi/US2n29hLsHk/hqdefault.jpg',
    practiceActivity:
      'Outline a 3-4-5 square check method on a gable roof plane to guarantee the first metal panel drops perpendicular to the eave before fastening.',
    practiceDeliverablePrompt:
      'Explain how "growth" (panel creep) happens across a 40-foot metal roof run and how periodic tape checks stop saw-tooth eaves.',
    knowledgeCheck: {
      question:
        'Why do metal roofers measure from the gable edge to both eave and ridge every 3–5 panels during installation?',
      options: [
        'To catch slight seam width "creep" early and keep panels running parallel instead of opening a wedge gap at the finish rake',
        'Because steel sheets shrink in half every hour',
        'So fasteners miss purlins completely',
        'To eliminate overlap seams completely'
      ],
      correctIndex: 0,
      explanation:
        'Even 1/16" rib spread per sheet adds over an inch across 20 panels; periodic parallel checks ensure crisp trims and watertight seams.'
    }
  },
  {
    id: 'lbd_roofing_window_snaploc_76',
    lessonNumber: 76,
    videoLabel: 'Video 76: Window Flashing & Snap-Loc Roof Prep',
    title: 'Window Framing, Flashing Integration & Snap-Loc Roofing',
    category: 'Roofing & Drywall',
    enclaveId: 'trades_construction',
    professionId: 'construction_worker',
    level: 'Beginner',
    originalCreator: 'RR Buildings',
    creatorDomain: 'youtube.com',
    description:
      'Weatherproofing details linking window sill pans, shingle-style flashing tape lapping, J-channel perimeter drainage, and structural framing alignment ahead of steel roofing.',
    skillsCovered: [
      'Bottom-to-Top Shingle-Lap Flashing Tape',
      'Sloped Sill Pan Water Management',
      'Window J-Channel & Rake Alignment',
      'Structural Frame Opening Squareness'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=O0DmefOdnSI',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=O0DmefOdnSI',
    youtubeId: 'O0DmefOdnSI',
    embedAvailable: true,
    duration: '16:30',
    thumbnailUrl: 'https://i.ytimg.com/vi/O0DmefOdnSI/hqdefault.jpg',
    practiceActivity:
      'Sequence window flashing tape application (sill pan → jamb strips → head flashing → WRB housewrap flap) in gravity-shedding order.',
    practiceDeliverablePrompt:
      'Identify what happens if the top housewrap flap is taped BEHIND the top window flange instead of lapped OVER it.',
    knowledgeCheck: {
      question:
        'In what order must flashing tapes and weather-resistive barrier flaps be layered around an exterior window opening?',
      options: [
        'Bottom sill pan first, then side jambs, then head flashing with top WRB lapped shingle-style OVER the top flange',
        'Top flange taped behind bottom tape so water drains inside wall framing',
        'Seal the bottom flange completely airtight so trapped water cannot weep out',
        'Skip sill flashing altogether on south walls'
      ],
      correctIndex: 0,
      explanation:
        'Water obeys gravity: every upper layer sheds outside the layer below it, while an unsealed lower weep gap lets any wind-driven moisture escape.'
    }
  },
  {
    id: 'lbd_solar_mobile_10kw_77',
    lessonNumber: 77,
    videoLabel: 'Video 77: 10kW Modular Off-Grid Solar Build',
    title: 'Building a 10kW Modular Off-Grid Solar & Inverter System',
    category: 'Solar & Energy',
    enclaveId: 'energy_utilities_environment',
    professionId: 'solar_installer',
    level: 'Intermediate',
    originalCreator: 'DIY Solar Power with Will Prowse',
    creatorDomain: 'youtube.com',
    description:
      'Hands-on high-output off-grid system wiring walkthrough covering 48V LiFePO4 battery sizing, inverter-charger MPPT limits, DC overcurrent breakers, and safe copper lug torque.',
    skillsCovered: [
      '48V DC Busbar & Overcurrent Sizing',
      'Hybrid Inverter PV Voc Margin Limits',
      'Torque-Calibrated Copper Lugs',
      'Portable Split-Phase Backup Wiring'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=f7Mxbc8p3es',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=f7Mxbc8p3es',
    youtubeId: 'f7Mxbc8p3es',
    embedAvailable: true,
    duration: '15:10',
    thumbnailUrl: 'https://i.ytimg.com/vi/f7Mxbc8p3es/hqdefault.jpg',
    practiceActivity:
      'Size a main Class-T DC fuse and copper cable gauge for a 48V 10kW inverter operating at full continuous surge.',
    practiceDeliverablePrompt:
      'Explain why PV Open-Circuit Voltage (Voc) rises in freezing morning temperatures and how much headroom you must keep below an MPPT input limit.',
    knowledgeCheck: {
      question:
        'Why are 48V battery banks preferred over 12V banks for high-wattage (5kW–10kW) solar inverters?',
      options: [
        'Higher voltage quarters DC amperage for the same power, allowing thinner copper cables, lower resistive losses, and cooler terminals',
        '48V batteries hold zero stored energy',
        '12V systems do not require fuses or breakers',
        '48V inverters bypass MPPT voltage ratings automatically'
      ],
      correctIndex: 0,
      explanation:
        'Because Watts = Volts × Amps, jumping from 12V to 48V drops current by 4x and resistive I²R cable heat by 16x.'
    }
  },
  {
    id: 'lbd_solar_battery_safety_78',
    lessonNumber: 78,
    videoLabel: 'Video 78: LiFePO4 Battery Cell Health & BMS',
    title: 'Inspecting Swollen Energy Storage Cells & BMS Safety Cutoffs',
    category: 'Solar & Energy',
    enclaveId: 'energy_utilities_environment',
    professionId: 'solar_installer',
    level: 'Intermediate',
    originalCreator: 'DIY Solar Power with Will Prowse',
    creatorDomain: 'youtube.com',
    description:
      'Technical safety inspection showing how overcharge/compression failure affects stationary solar battery packs, how BMS cell-balance monitors catch early drift, and safe isolation procedures.',
    skillsCovered: [
      'Cell Delta Voltage & Compression Fixture Check',
      'Battery Management System (BMS) Protection Trips',
      'Isolating & Depowering Faulty ESS Modules',
      'Proper Torque & Busbar Thermal Inspection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=komkFokUdPo',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=komkFokUdPo',
    youtubeId: 'komkFokUdPo',
    embedAvailable: true,
    duration: '13:20',
    thumbnailUrl: 'https://i.ytimg.com/vi/komkFokUdPo/hqdefault.jpg',
    practiceActivity:
      'Write a preventative quarterly inspection sheet for a stationary lithium battery cabinet covering cell voltage delta (mV), ambient cooling clearance, and IR thermometer terminal spot-checks.',
    practiceDeliverablePrompt:
      'State two early warning indicators that a stationary LiFePO4 battery module needs immediate service or isolation.',
    knowledgeCheck: {
      question:
        'What does an unusually large voltage difference ("high delta") across cells inside a solar battery pack at top-of-charge indicate?',
      options: [
        'At least one cell is out of balance, aged, or failing and needs diagnostic inspection before high-current cycling continues',
        'The solar panels are pointed too cleanly at noon sun',
        'The DC disconnect handle was painted yellow',
        'Inverter AC output frequency changed from 60Hz to 120Hz'
      ],
      correctIndex: 0,
      explanation:
        'Tracking per-cell millivolt spread exposes weak cells and premature BMS high-voltage cutoffs well before thermal stress occurs.'
    }
  },
  {
    id: 'lbd_auto_coolant_leak_79',
    lessonNumber: 79,
    videoLabel: 'Video 79: Cooling System Leak Diagnostics & Fix',
    title: 'How to Safely Diagnose & Repair an Automotive Coolant Leak',
    category: 'Auto Mechanics',
    enclaveId: 'automotive_mechanics',
    professionId: 'auto_mechanic',
    level: 'Beginner',
    originalCreator: 'ChrisFix',
    creatorDomain: 'youtube.com',
    description:
      'Practical cooling system inspection by ChrisFix walking through safe cold depressurization, radiator/hose leak tracing, emergency clamp repairs, and proper coolant burping to prevent overheating.',
    skillsCovered: [
      'Safe Cold Radiator Cap Depressurization',
      'Tracing Pinholes in Hoses, Clamps & Plastic T-Fittings',
      'Emergency Roadside Hose/Bypass Containment',
      'Proper Coolant Refill & Air-Pocket Bleed'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=dbqXDnLlsf4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=dbqXDnLlsf4',
    youtubeId: 'dbqXDnLlsf4',
    embedAvailable: true,
    duration: '12:50',
    thumbnailUrl: 'https://i.ytimg.com/vi/dbqXDnLlsf4/hqdefault.jpg',
    practiceActivity:
      'Inspect a cold engine bay by hand and flashlight: trace upper/lower radiator hoses, heater core T-fittings, and water pump weep holes for crusty dried coolant residue.',
    practiceDeliverablePrompt:
      'Explain why opening a pressurized radiator cap on a hot engine is severely dangerous and causes flash boiling.',
    knowledgeCheck: {
      question:
        'Why must you NEVER twist open a radiator pressure cap while the engine cooling system is still hot and pressurized?',
      options: [
        'Dropping pressure suddenly causes superheated coolant above 100°C to boil violently and spray scald burns upward',
        'Cold air causes steel cylinder heads to melt instantly',
        'It reverses alternator charging polarity',
        'Power steering fluid leaks out of the tailpipe'
      ],
      correctIndex: 0,
      explanation:
        'Cooling system pressure raises coolant boiling point; releasing pressure while hot triggers explosive steam flash burns.'
    }
  },
  {
    id: 'lbd_machining_shaper_setup_80',
    lessonNumber: 80,
    videoLabel: 'Video 80: Precision Shaper Machining & Workholding',
    title: 'Precision Metal Shaper Machining, Feeds & Squaring Stock',
    category: 'Machining & Repair',
    enclaveId: 'manufacturing_industrial',
    professionId: 'cnc_machinist',
    level: 'Intermediate',
    originalCreator: 'Blondihacks',
    creatorDomain: 'youtube.com',
    description:
      'Hands-on machine shop walkthrough demonstrating clapper-box relief, single-point HSS tool grinding geometry, vise tramming with a dial test indicator, and dialing flat mechanical slides.',
    skillsCovered: [
      'Vise Jaw Squaring & Dial Indicator Tramming',
      'Single-Point High-Speed Steel Tool Geometry',
      'Clapper Box Relief & Return-Stroke Protection',
      'Reading Micrometer Chips & Surface Finish'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=7M1DpsWCEQs',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=7M1DpsWCEQs',
    youtubeId: '7M1DpsWCEQs',
    embedAvailable: true,
    duration: '22:15',
    thumbnailUrl: 'https://i.ytimg.com/vi/7M1DpsWCEQs/hqdefault.jpg',
    practiceActivity:
      'Document a 4-step machine vise alignment checklist using a dial test indicator across the fixed jaw before taking a finishing cut on steel bar stock.',
    practiceDeliverablePrompt:
      'Explain why machinists reference off the FIXED jaw of a vise rather than the movable jaw when precision-squaring parts.',
    knowledgeCheck: {
      question:
        'Which jaw of a precision milling or shaping vise is used as the true datum surface when seating parallels and dialing parts square?',
      options: [
        'The stationary fixed jaw bolted directly to the rigid vise casting',
        'The loose movable jaw that tilts slightly under screw load',
        'A plastic shop hammer handle',
        'The floor chip pan beneath the machine'
      ],
      correctIndex: 0,
      explanation:
        'Only the fixed vise jaw remains rigid relative to the machine table ways; clamping against it guarantees repeatable squareness.'
    }
  },
  {
    id: 'lbd_agri_compost_soil_81',
    lessonNumber: 81,
    videoLabel: 'Video 81: Organic Composting & Soil Enrichment',
    title: 'Carbon-to-Nitrogen Soil Building Using Kitchen & Yard Waste',
    category: 'Agriculture & Landscaping',
    enclaveId: 'agriculture_natural_resources',
    professionId: 'agronomist',
    level: 'Beginner',
    originalCreator: 'Epic Gardening',
    creatorDomain: 'youtube.com',
    description:
      'Agronomy breakdown of aerobic hot composting, balancing carbon "browns" and nitrogen "greens", moisture target checks, and feeding vigorous garden beds without synthetic salt buildup.',
    skillsCovered: [
      'Carbon-to-Nitrogen (30:1) Compost Ratios',
      'Aerobic Turning & Pile Core Temperature',
      'Squeeze-Test Soil & Compost Moisture Check',
      'Top-Dressing Vegetable & Landscape Beds'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Ye3OEDeZn5w',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Ye3OEDeZn5w',
    youtubeId: 'Ye3OEDeZn5w',
    embedAvailable: true,
    duration: '10:35',
    thumbnailUrl: 'https://i.ytimg.com/vi/Ye3OEDeZn5w/hqdefault.jpg',
    practiceActivity:
      'Audit available green waste (scraps, fresh grass) and brown waste (shredded leaves, cardboard) on a property and balance them cleanly into a breathable aerobic pile.',
    practiceDeliverablePrompt:
      'Explain why an overly wet, un-turned pile smelling like rotten eggs needs coarse dry carbon browns and aeration.',
    knowledgeCheck: {
      question:
        'What is the ideal moisture level of an active aerobic compost pile when squeezed firmly in your gloved hand?',
      options: [
        'Like a wrung-out sponge: damp to the touch without dripping streams of water between your fingers',
        'Bone-dry dust that blows away in light wind',
        'Submerged completely underwater like a stagnant pond',
        'Mixed 50/50 with asphalt shingle grit'
      ],
      correctIndex: 0,
      explanation:
        'Microbes need moisture films and oxygen pores simultaneously; wrung-out sponge dampness fuels rapid thermophilic breakdown without anaerobic odor.'
    }
  },
  {
    id: 'lbd_tailoring_patch_pocket_82',
    lessonNumber: 82,
    videoLabel: 'Video 82: Pattern Drafting & Patch Pocket Assembly',
    title: 'Patch Pocket Pattern Drafting, Pressing & Precision Topstitch',
    category: 'Tailoring & Sewing',
    enclaveId: 'trades_construction',
    professionId: 'tailor',
    level: 'Beginner',
    originalCreator: 'Professor Pincushion',
    creatorDomain: 'youtube.com',
    description:
      'Clear garment construction walkthrough covering custom cardboard pressing templates, mitered top hem allowances, crisp curved corner shaping, and symmetrical bar-tacked topstitching.',
    skillsCovered: [
      'Drafting Seam-Allowance Cardboard Templates',
      'Double-Turned Upper Pocket Hemming',
      'Steaming Curves Smooth With Ease Stitches',
      'Reinforced Corner Back-Tacks / Triangles'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=MPufcrqJpFU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=MPufcrqJpFU',
    youtubeId: 'MPufcrqJpFU',
    embedAvailable: true,
    duration: '13:45',
    thumbnailUrl: 'https://i.ytimg.com/vi/MPufcrqJpFU/hqdefault.jpg',
    practiceActivity:
      'Cut a rigid cardstock pattern finished-size template, press seam allowances crisply around it with steam, and practice edgestitching a balanced patch pocket at 1/8" margin.',
    practiceDeliverablePrompt:
      'Explain why adding triangle or bar-tack reinforcement at the two top corners prevents shirt and workwear pockets from tearing down.',
    knowledgeCheck: {
      question:
        'Why do tailors fold and steam-press patch pocket edges around a cardstock template before pinning them onto the garment?',
      options: [
        'The rigid template produces perfectly crisp, symmetrical folded edges and identical left-right pocket curves before topstitching',
        'To melt polyester thread completely away',
        'So you never have to thread the bobbin',
        'To stretch knit fabric randomly in every direction'
      ],
      correctIndex: 0,
      explanation:
        'Pressing over an exact finished-dimension template locks symmetry and prevents uneven raw seams from peeking out along curves.'
    }
  },
  {
    id: 'lbd_barber_360waves_83',
    lessonNumber: 83,
    videoLabel: 'Video 83: Textured Grain Cutting & 360 Waves Care',
    title: 'Barber Tutorial: Cutting 360 Waves Along the Natural Crown',
    category: 'Barbering & Beauty',
    enclaveId: 'personal_services_wellness',
    professionId: 'barber',
    level: 'Beginner',
    originalCreator: '360Jeezy',
    creatorDomain: 'youtube.com',
    description:
      'Detailed master barber breakdown showing how to map crown swirl patterns, select safe "with-the-grain" guard lengths, blend temple tapers evenly, and finish razor-sharp hairlines cleanly.',
    skillsCovered: [
      'Mapping Crown Swirl & Hair Grain Direction',
      'With-the-Grain Lever & Guard Selection',
      'Blending Temple & Nape Taper Zones',
      'Sanitized Foil Shaver & Liner Finishing'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=8CEXjpBOgMc',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=8CEXjpBOgMc',
    youtubeId: '8CEXjpBOgMc',
    embedAvailable: true,
    duration: '11:28',
    thumbnailUrl: 'https://i.ytimg.com/vi/8CEXjpBOgMc/hqdefault.jpg',
    practiceActivity:
      'Inspect a textured hair growth pattern in 4 quadrants around the crown swirl and note how cutting direction shifts around the swirl center.',
    practiceDeliverablePrompt:
      'Explain why cutting against the grain on wave-patterned hair cuts shorter than the same guard used with the grain.',
    knowledgeCheck: {
      question:
        'When shaping wave-trained hair on top, why should clippers follow the exact brush/growth pattern out from the crown rather than cutting against it?',
      options: [
        'Cutting with the grain preserves wave definition and depth at an even uniform height without accidentally gapping thin areas',
        'Cutting against the grain makes hair grow faster',
        'Guards only latch onto clippers backward',
        'Brushing always starts from the chin upward'
      ],
      correctIndex: 0,
      explanation:
        'Respecting radial crown grain keeps wave curls laid down smoothly and avoids uneven patches around natural swirls.'
    }
  },
  {
    id: 'lbd_barber_highlow_taper_84',
    lessonNumber: 84,
    videoLabel: 'Video 84: Step-by-Step High-Low Taper Blending',
    title: 'Full Beginner Barber Tutorial: Clean High-Low Taper Fade',
    category: 'Barbering & Beauty',
    enclaveId: 'personal_services_wellness',
    professionId: 'esthetician',
    level: 'Beginner',
    originalCreator: '360Jeezy',
    creatorDomain: 'youtube.com',
    description:
      'Structured guideline-by-guideline tutorial walking beginners through setting even bald lines, lever-open fades, corner-of-blade detail flicking, and natural neck taper symmetry.',
    skillsCovered: [
      'Establishing Symmetrical Baseline Guidelines',
      'Clipper Lever Half-Click Blend Progression',
      'Corner-Blade Detailing Dark Weight Spots',
      'Clipper Disinfection Between Every Client'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=Y3yj3wsLQms',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=Y3yj3wsLQms',
    youtubeId: 'Y3yj3wsLQms',
    embedAvailable: true,
    duration: '14:05',
    thumbnailUrl: 'https://i.ytimg.com/vi/Y3yj3wsLQms/hqdefault.jpg',
    practiceActivity:
      'Map out a 4-guideline fade sequence (Trimmer Zero → 0.5 Open → #1 Guard → 1.5 Blend) and document how blade-corner flicking erases stubborn horizontal weight lines.',
    practiceDeliverablePrompt:
      'Describe how using the outer 2–3 teeth corner of your clipper blade removes small dark patches without digging a hole higher into the blend.',
    knowledgeCheck: {
      question:
        'How does tilting and cutting with only the outer corner of the clipper blade improve a fade transition?',
      options: [
        'It softens concentrated dark spots selectively over a narrow area without pushing the entire fade guideline higher up the head',
        'It doubles blade motor speed immediately',
        'It eliminates the need to sterilize metal guards',
        'It pulls scalp skin away from guards'
      ],
      correctIndex: 0,
      explanation:
        'Precision corner work lets you polish small shadow patches locally while keeping your overall fade silhouette crisp and even.'
    }
  },
  {
    id: 'lbd_cleaning_bathroom_sanitation_85',
    lessonNumber: 85,
    videoLabel: 'Video 85: Surface Chemistry & Restroom Sanitation',
    title: 'Professional Surface Cleaning & Restroom Sanitation Workflow',
    category: 'Safety & Civic Ops',
    enclaveId: 'community_civic_security',
    professionId: 'safety_officer',
    level: 'Beginner',
    originalCreator: 'Clean My Space',
    creatorDomain: 'youtube.com',
    description:
      'Structured facility-care workflow matching color-coded microfiber tools, neutral vs. acidic cleaners, disinfectant dwell time, and safe high-to-low restroom sanitation sequencing.',
    skillsCovered: [
      'Color-Coded Cloth Cross-Contamination Control',
      'Disinfectant Wet Dwell Time Compliance',
      'Matching Neutral vs. Descaling Chemistry',
      'Dry Dusting Before Wet Wipe-Down Order'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=9rDdFV1M3PE',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=9rDdFV1M3PE',
    youtubeId: '9rDdFV1M3PE',
    embedAvailable: true,
    duration: '6:10',
    thumbnailUrl: 'https://i.ytimg.com/vi/9rDdFV1M3PE/hqdefault.jpg',
    practiceActivity:
      'Design a 4-color microfiber kit (blue = glass/mirrors, green = general surfaces, yellow = sinks, red = toilets) plus required wet contact dwell times before wiping dry.',
    practiceDeliverablePrompt:
      'Explain why acidic cleaners should NEVER touch natural marble/travertine stone or be mixed with chlorine bleach.',
    knowledgeCheck: {
      question:
        'What is "dwell time" (contact time) when using a commercial EPA-registered disinfectant spray on high-touch fixtures?',
      options: [
        'The number of minutes the surface must stay visibly wet with solution before wiping so pathogens are reliably inactivated',
        'The time spent driving to the jobsite',
        'Mixing two random chemicals inside a hot bucket',
        'Buffing dry mirrors immediately after misting within 1 second'
      ],
      correctIndex: 0,
      explanation:
        'Wiping disinfectant off instantly prevents it from working; clean soil off first, then allow full label dwell time before drying.'
    }
  },
  {
    id: 'lbd_cleaning_room_workflow_86',
    lessonNumber: 86,
    videoLabel: 'Video 86: Commercial Room Turnover Workflow',
    title: 'Organizing a Hospitality-Standard Room Cleaning Workflow',
    category: 'Safety & Civic Ops',
    enclaveId: 'community_civic_security',
    professionId: 'safety_officer',
    level: 'Beginner',
    originalCreator: 'Clean My Space',
    creatorDomain: 'youtube.com',
    description:
      'Time-saving top-to-bottom, clockwise room workflow combining pre-soak chemical staging, crisp linen folding, dust-capture sequence, and final inspection from the doorway.',
    skillsCovered: [
      'Top-to-Bottom Clockwise Room Circuit',
      'Staging Pre-Treat Dwelling Before Scrubbing',
      'Linen Handling & Corner Tension Checks',
      'Doorway Lighting Inspection Scan'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=jG7gmU8MO7A',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=jG7gmU8MO7A',
    youtubeId: 'jG7gmU8MO7A',
    embedAvailable: true,
    duration: '5:45',
    thumbnailUrl: 'https://i.ytimg.com/vi/jG7gmU8MO7A/hqdefault.jpg',
    practiceActivity:
      'Time yourself executing a strict top-to-bottom clockwise room pass: air/trash out, spray wet zones to dwell, high-dust, polish glass/surfaces, then vacuum/mop out the door.',
    practiceDeliverablePrompt:
      'Explain why vacuuming and mopping are always the FINAL physical step when exiting a room.',
    knowledgeCheck: {
      question:
        'In a systematic professional room-cleaning workflow, why should floor vacuuming and mopping always wait until upper dusting and counters are finished?',
      options: [
        'Because upper dust and crumbs drop downward—doing floors last captures fallen debris in a single exit pass without re-dirtying wet floors',
        'Because mops scratch ceiling fans',
        'Because trash should be emptied onto clean wet tile',
        'So streaks dry unevenly across footprints'
      ],
      correctIndex: 0,
      explanation:
        'Top-to-bottom, back-to-door sequencing eliminates wasted double-work and prevents footprints across freshly mopped floors.'
    }
  },
  {
    id: 'lbd_safety_airway_checklist_87',
    lessonNumber: 87,
    videoLabel: 'Video 87: Emergency Response Checklists & Protocols',
    title: 'Critical Airway & Post-Intervention Safety Checklist Training',
    category: 'Safety & Civic Ops',
    enclaveId: 'community_civic_security',
    professionId: 'safety_officer',
    level: 'Intermediate',
    originalCreator: 'PrepMedic',
    creatorDomain: 'youtube.com',
    description:
      'Structured pre-hospital & critical-care safety training emphasizing spoken team checklists, continuous waveform capnography confirmation, equipment readiness, and calm handover briefings.',
    skillsCovered: [
      'Challenge-Response Safety Checklists',
      'Backup Contingency Equipment Staging',
      'Post-Intervention Vital Re-Verification',
      'Clear Closed-Loop Team Communication'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=dIfgMkQcGcQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=dIfgMkQcGcQ',
    youtubeId: 'dIfgMkQcGcQ',
    embedAvailable: true,
    duration: '12:40',
    thumbnailUrl: 'https://i.ytimg.com/vi/dIfgMkQcGcQ/hqdefault.jpg',
    practiceActivity:
      'Write a 6-point challenge-response pre-action checklist and rehearse speaking verbal call-and-readback confirmations with a teammate.',
    practiceDeliverablePrompt:
      'Explain why closed-loop verbal readbacks prevent critical step omissions during high-stress emergency operations.',
    knowledgeCheck: {
      question:
        'Why do emergency medical, aviation, and civic safety teams rely on standardized challenge-response checklists under pressure?',
      options: [
        'Structured checklists prevent stress-induced memory slips and synchronize closed-loop team verification across critical steps',
        'Checklists slow down teams intentionally past safe windows',
        'Paperwork replaces primary equipment readiness',
        'Teams should improvise unverified steps silently'
      ],
      correctIndex: 0,
      explanation:
        'Even elite specialists miss steps under cognitive overload—standard checklists protect life-safety consistency.'
    }
  },
  {
    id: 'lbd_carpentry_furniture_restoration_88',
    lessonNumber: 88,
    videoLabel: 'Video 88: Antique Chair & Furniture Restoration',
    title: 'Furniture Restoration: Assessing Joints, Repairs & Finishes',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Intermediate',
    originalCreator: 'Thomas Johnson Antique Furniture Restoration',
    creatorDomain: 'youtube.com',
    description:
      'Master furniture conservator diagnostic walkthrough showing how to evaluate unstable past repairs, gently disassemble loose mortise joints, clean old glue lines, and match period shellac/lacquer finishes.',
    skillsCovered: [
      'Inspecting Old Glue & Splint Repairs Safely',
      'Disassembling Loose Tenons Without Splitting Grain',
      'Cleaning Old Adhesive for Tight Wood-to-Wood Reglue',
      'Color Toning & Patina-Preserving Topcoats'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=paJCj43oEB8',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=paJCj43oEB8',
    youtubeId: 'paJCj43oEB8',
    embedAvailable: true,
    duration: '24:10',
    thumbnailUrl: 'https://i.ytimg.com/vi/paJCj43oEB8/hqdefault.jpg',
    practiceActivity:
      'Assess an older wooden chair or side table from top to bottom: log loose dowels/tenons, prior nail/screw hacks, veneer bubbles, and test solvent compatibility on an inconspicuous underside spot.',
    practiceDeliverablePrompt:
      'Explain why hammering dry nails or squirting PVA glue over old dried hide glue fails to hold structural furniture joints.',
    knowledgeCheck: {
      question:
        'When regluing a wobbly antique chair mortise-and-tenon joint, why must old brittle adhesive residue be carefully scraped clean before clamping?',
      options: [
        'Modern wood glues bond cleanly only to bare wood fibers—gluing directly over old cured glue or oil creates a weak failure plane',
        'Scraping glue away makes joints twice as loose',
        'New glue dissolves solid oak tenons on contact',
        'Clamps should never touch furniture frames'
      ],
      correctIndex: 0,
      explanation:
        'Removing failed adhesive and shimming sloppy tenons restores tight wood-to-wood contact that lasts decades without destructive screws.'
    }
  },
  {
    id: 'lbd_carpentry_combo_square_89',
    lessonNumber: 89,
    videoLabel: 'Video 89: Layout Square Tuning & Calibration',
    title: 'Maintaining & Truing Your Combination Square (Paul Sellers)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'Paul Sellers',
    creatorDomain: 'youtube.com',
    description:
      'Fine joinery bench lesson teaching how to test a combination square with the flip-line check, safely file internal anvil burs, lubricate locking threads, and scribe laser-accurate layout lines.',
    skillsCovered: [
      'Performing the Reversible Flip-Line Square Test',
      'Filing Cast-Iron Seat Burs Without Overshooting',
      'Blade Cleaning & Rust-Prevention Waxing',
      'Knife-Wall & Pencil Accuracy on Rough Stock'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=k7U1w9duv50',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=k7U1w9duv50',
    youtubeId: 'k7U1w9duv50',
    embedAvailable: true,
    duration: '12:55',
    thumbnailUrl: 'https://i.ytimg.com/vi/k7U1w9duv50/hqdefault.jpg',
    practiceActivity:
      'Test your own try square or combination square against a jointed straight board edge by striking a fine knife line, flipping 180°, and inspecting any divergence.',
    practiceDeliverablePrompt:
      'Calculate why a 1/32" error on a square flip test equals a 1/64" true square error—and how Paul Sellers corrects it.',
    knowledgeCheck: {
      question:
        'How does flipping a square 180° along a straight edge expose whether the tool is truly 90°?',
      options: [
        'Any out-of-square angle doubles visually between the two flipped pencil/knife lines, revealing exact error direction',
        'Flipping bends the hardened steel blade back flat',
        'Wood grain moves 90 degrees overnight automatically',
        'It sharpens dull chisels automatically'
      ],
      correctIndex: 0,
      explanation:
        'The classic flip-line calibration test magnifies tiny square errors by 2x, letting craftspeople verify layout tools in 10 seconds.'
    }
  },
  {
    id: 'lbd_culinary_technique_90',
    lessonNumber: 90,
    videoLabel: 'Video 90: Master Kitchen Technique & Emulsions',
    title: '60 Years of Culinary Mastery: Texture, Emulsion & Seasoning',
    category: 'Culinary & Hospitality',
    enclaveId: 'culinary_hospitality_events',
    professionId: 'chef',
    level: 'Beginner',
    originalCreator: 'Chef Jean-Pierre',
    creatorDomain: 'youtube.com',
    description:
      'Master Chef Jean-Pierre demonstrates moisture evaporation control, warm fat/dairy emulsion timing, food-mill smoothness vs. overworking starches, and layered tasting calibration.',
    skillsCovered: [
      'Steam-Drying Moisture Before Emulsifying',
      'Controlling Starch Shear vs. Creamy Texture',
      'Tempering Warm Butter & Cream Slowly',
      'Layered Salt & Acid Tasting Calibration'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=NGdq6lCRZFY',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=NGdq6lCRZFY',
    youtubeId: 'NGdq6lCRZFY',
    embedAvailable: true,
    duration: '15:18',
    thumbnailUrl: 'https://i.ytimg.com/vi/NGdq6lCRZFY/hqdefault.jpg',
    practiceActivity:
      'Prepare a classic puree side while testing two critical variables: evaporating surface water off hot cooked produce for 60 seconds and folding in warm rather than ice-cold dairy.',
    practiceDeliverablePrompt:
      'Explain why tearing high-starch cells aggressively in a food processor produces a gummy glue texture compared to passing through a ricer or food mill.',
    knowledgeCheck: {
      question:
        'Why should boiled root vegetables be steam-dried briefly before folding in warm butter and cream?',
      options: [
        'Driving off excess surface water prevents soggy wateriness and lets lipids coat dry starch cleanly for a rich, silky emulsion',
        'Because butter boils at 10°C above ice',
        'So salt granules never dissolve into the dish',
        'To turn starch into cold raw crystals'
      ],
      correctIndex: 0,
      explanation:
        'Managing residual steam and temperature makes simple staple ingredients taste restaurant-quality every service.'
    }
  },
  {
    id: 'lbd_nursing_maternity_91',
    lessonNumber: 91,
    videoLabel: 'Video 91: Clinical Maternal Assessment & Fetal Lie',
    title: 'Maternity Nursing Review: Fetal Lie, Presentation & Assessment',
    category: 'Healthcare & Nursing',
    enclaveId: 'healthcare_medicine',
    professionId: 'nurse',
    level: 'Intermediate',
    originalCreator: 'RegisteredNurseRN',
    creatorDomain: 'youtube.com',
    description:
      'RegisteredNurseRN clinical teaching clarifying longitudinal, transverse, and oblique fetal lie, Leopold’s maneuvers assessment landmarks, and safe labor-triage communication.',
    skillsCovered: [
      'Longitudinal vs. Transverse vs. Oblique Lie',
      'Distinguishing Fetal Lie from Presentation',
      'Clinical Triage Charting Terminology',
      'Safe Labor & Delivery Nursing Escalation'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=pD7RJa-EUS4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=pD7RJa-EUS4',
    youtubeId: 'pD7RJa-EUS4',
    embedAvailable: true,
    duration: '9:32',
    thumbnailUrl: 'https://i.ytimg.com/vi/pD7RJa-EUS4/hqdefault.jpg',
    practiceActivity:
      'Create a concise visual flashcard chart comparing maternal spine orientation vs. fetal spine alignment for Longitudinal, Transverse, and Oblique lies.',
    practiceDeliverablePrompt:
      'Explain the difference between fetal "Lie" (spine-to-spine axis) and fetal "Presentation" (which anatomical part enters the pelvic inlet first).',
    knowledgeCheck: {
      question:
        'In clinical obstetric nursing terminology, what defines a "Longitudinal" fetal lie?',
      options: [
        'The fetal spine runs parallel (vertical axis) alongside the maternal spine—covering either cephalic or breech presentations',
        'The fetus lies completely horizontal across the abdomen at 90 degrees',
        'Only multiple-gestation deliveries qualify',
        'It describes placental edge curvature only'
      ],
      correctIndex: 0,
      explanation:
        'Distinguishing axis alignment ("lie") from presenting part ("cephalic/breech/shoulder") ensures exact multidisciplinary shift communication.'
    }
  },
  {
    id: 'lbd_software_dsa_python_92',
    lessonNumber: 92,
    videoLabel: 'Video 92: Data Structures & Algorithms in Python',
    title: 'Learn Data Structures & Algorithms in Python with Visualizations',
    category: 'Software & AI',
    enclaveId: 'tech_software',
    professionId: 'software_engineer',
    level: 'Intermediate',
    originalCreator: 'freeCodeCamp.org',
    creatorDomain: 'youtube.com',
    description:
      'Visual engineering course breaking down Big-O time/space complexity, arrays, hash maps, linked lists, trees, and graph traversal patterns for reliable production software.',
    skillsCovered: [
      'Big-O Time & Space Tradeoff Reasoning',
      'Hash Tables vs. Binary Search Lookup Speed',
      'Queue (BFS) & Stack/Recursion (DFS) Traversals',
      'Clean Python Implementation & Edge Cases'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=ybe6EGe_wjo',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=ybe6EGe_wjo',
    youtubeId: 'ybe6EGe_wjo',
    embedAvailable: true,
    duration: '1:58:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/ybe6EGe_wjo/hqdefault.jpg',
    practiceActivity:
      'Benchmark a list linear scan (`O(n)`) against a dictionary/set lookup (`O(1)`) on 100,000 IDs in Python and document the speedup.',
    practiceDeliverablePrompt:
      'Describe a real UI or backend endpoint scenario where switching from nested loops (`O(n^2)`) to a Map lookup (`O(n)`) eliminates request timeouts.',
    knowledgeCheck: {
      question:
        'Which data structure provides average O(1) constant-time membership checks when deduplicating 100,000 user or video IDs?',
      options: [
        'A Hash Set / Dictionary (`set` or `Map`) keyed cleanly by ID',
        'An unsorted singly linked list scanned end-to-end per lookup',
        'Bubble sort re-run inside every loop iteration',
        'Writing temporary CSV files per record comparison'
      ],
      correctIndex: 0,
      explanation:
        'Hash-based Sets and Maps reduce deduplication across large datasets from quadratic `O(n²)` to fast linear `O(n)` time.'
    }
  },
  {
    id: 'lbd_ai_vector_databases_93',
    lessonNumber: 93,
    videoLabel: 'Video 93: Vector Databases & Semantic Search (RAG)',
    title: 'Vector Databases Full Course: Embeddings, Similarity & RAG',
    category: 'Software & AI',
    enclaveId: 'tech_software',
    professionId: 'ai_engineer',
    level: 'Intermediate',
    originalCreator: 'freeCodeCamp.org',
    creatorDomain: 'youtube.com',
    description:
      'Practical AI engineering course teaching dense text embeddings, cosine similarity vs. Euclidean distance, chunking strategies, metadata filtering, and grounded Retrieval-Augmented Generation (RAG).',
    skillsCovered: [
      'Text Embeddings & Latent Semantic Space',
      'Cosine Similarity vs. Dot Product Search',
      'Document Chunking & Overlap Tuning',
      'Hybrid Metadata + Vector Filtering'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=lR931Iz8Z6U',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=lR931Iz8Z6U',
    youtubeId: 'lR931Iz8Z6U',
    embedAvailable: true,
    duration: '2:12:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/lR931Iz8Z6U/hqdefault.jpg',
    practiceActivity:
      'Design a chunking and metadata schema for a technical manual RAG pipeline (including `docId`, `sectionTitle`, `version`, and `chunkIndex`) so search stays accurate and cited.',
    practiceDeliverablePrompt:
      'Explain why splitting documents arbitrarily mid-sentence degrades retrieval precision compared to semantic section chunking with overlap.',
    knowledgeCheck: {
      question:
        'In a Retrieval-Augmented Generation (RAG) architecture, why do engineers combine semantic vector search with structured metadata filters?',
      options: [
        'To retrieve conceptually matching passages while strictly scoping results to valid permissions, dates, categories, or product versions',
        'To force LLMs to hallucinate unverified citations',
        'Because embeddings erase every numeric digit permanently',
        'To turn vectors back into unindexed GIF images'
      ],
      correctIndex: 0,
      explanation:
        'Hybrid retrieval (semantic similarity + metadata pre-filtering) keeps AI answers both context-aware and permission-safe.'
    }
  },
  {
    id: 'lbd_cyber_zero_trust_94',
    lessonNumber: 94,
    videoLabel: 'Video 94: Zero Trust Security Architecture',
    title: 'Zero Trust Architecture Explained (CompTIA Security+)',
    category: 'Cybersecurity & IT',
    enclaveId: 'tech_cybersecurity',
    professionId: 'security_analyst',
    level: 'Beginner',
    originalCreator: 'Professor Messer',
    creatorDomain: 'youtube.com',
    description:
      'Clear Professor Messer CompTIA Security+ module dissecting "Never Trust, Always Verify", control-plane vs. data-plane separation, microsegmentation, and adaptive device-posture policies.',
    skillsCovered: [
      'Explicit Continuous Identity & Device Verification',
      'Control Plane Policy Engine vs. Data Plane PEP',
      'East-West Lateral Microsegmentation',
      'Eliminating Implicit Internal VPN Trust'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=JQo9OBdKJsw',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=JQo9OBdKJsw',
    youtubeId: 'JQo9OBdKJsw',
    embedAvailable: true,
    duration: '7:48',
    thumbnailUrl: 'https://i.ytimg.com/vi/JQo9OBdKJsw/hqdefault.jpg',
    practiceActivity:
      'Diagram how a Policy Engine and Policy Enforcement Point verify user identity, MFA state, and device patch compliance before permitting access to a production database.',
    practiceDeliverablePrompt:
      'Explain why legacy "castle-and-moat" perimeter networks fail once an attacker compromises a single internal laptop.',
    knowledgeCheck: {
      question:
        'What is the core guiding premise of Zero Trust network architecture?',
      options: [
        'Never implicitly trust any user or device by network location alone—continuously authenticate, verify device posture, and enforce least-privilege access per request',
        'Turn off all firewalls inside company Wi-Fi',
        'Share one root administrator password across every department',
        'Disable HTTPS TLS encryption internally to boost ping'
      ],
      correctIndex: 0,
      explanation:
        'Zero Trust contains blast radius by demanding explicit, least-privilege verification across every microservice, user, and API call.'
    }
  },
  {
    id: 'lbd_cyber_cia_triad_95',
    lessonNumber: 95,
    videoLabel: 'Video 95: The CIA Triad & Security Controls',
    title: 'Confidentiality, Integrity & Availability: The CIA Triad',
    category: 'Cybersecurity & IT',
    enclaveId: 'tech_cybersecurity',
    professionId: 'soc_analyst',
    level: 'Beginner',
    originalCreator: 'Professor Messer',
    creatorDomain: 'youtube.com',
    description:
      'Foundational security operations briefing explaining Confidentiality (encryption & ACLs), Integrity (hashes & digital signatures), Availability (redundancy & DDoS resilience), plus non-repudiation.',
    skillsCovered: [
      'Confidentiality via Encryption & Least Privilege',
      'Integrity Verification with Cryptographic Hashes',
      'Availability via Failover & Backup Resilience',
      'Mapping Controls During Incident Triage'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=dtxmcv1lBKk',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=dtxmcv1lBKk',
    youtubeId: 'dtxmcv1lBKk',
    embedAvailable: true,
    duration: '6:12',
    thumbnailUrl: 'https://i.ytimg.com/vi/dtxmcv1lBKk/hqdefault.jpg',
    practiceActivity:
      'Classify 6 real security controls (AES-256 TLS, SHA-256 checksums, multi-AZ replicas, RBAC permissions, immutable backups, HMAC signatures) into C, I, or A.',
    practiceDeliverablePrompt:
      'Identify which pillar of the CIA Triad is primarily violated by ransomware file tampering vs. a pure volumetric DDoS flood.',
    knowledgeCheck: {
      question:
        'When downloading a critical firmware update, checking its published SHA-256 checksum directly protects which CIA Triad pillar?',
      options: [
        'Integrity—confirming the binary has not been altered or corrupted in transit',
        'Confidentiality only',
        'Physical generator wattage',
        'Cooling fan RPM tuning'
      ],
      correctIndex: 0,
      explanation:
        'Cryptographic digests prove data integrity by changing completely if even a single bit of the payload is tampered with.'
    }
  },
  {
    id: 'lbd_telecom_terminal_protocols_96',
    lessonNumber: 96,
    videoLabel: 'Video 96: Network Protocols & SSH Terminal Streams',
    title: 'Terminal Network Protocols, Sockets & Real-Time Streaming',
    category: 'Telecom & Fiber Optics',
    enclaveId: 'telecom_digital_infrastructure',
    professionId: 'network_technician',
    level: 'Intermediate',
    originalCreator: 'NetworkChuck',
    creatorDomain: 'youtube.com',
    description:
      'NetworkChuck deep-dive exploring TCP socket communication, ANSI frame transport, bandwidth efficiency, and remote SSH stream architectures that engineers debug across real networks.',
    skillsCovered: [
      'TCP Socket Connections & Stream Framing',
      'SSH Encrypted Remote Tunnel Operations',
      'Throughput vs. Packet Latency Measurement',
      'Troubleshooting Port Binding & Firewalls'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=oHLQj750M9U',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=oHLQj750M9U',
    youtubeId: 'oHLQj750M9U',
    embedAvailable: true,
    duration: '14:20',
    thumbnailUrl: 'https://i.ytimg.com/vi/oHLQj750M9U/hqdefault.jpg',
    practiceActivity:
      'Trace open listening TCP sockets on a workstation or lab server and inspect round-trip latency (`ping`/`ss`/`netstat`) while streaming data.',
    practiceDeliverablePrompt:
      'Explain why stateful firewall timeouts and MTU fragmentation affect long-lived TCP/SSH streams over WAN links.',
    knowledgeCheck: {
      question:
        'What standard port and encrypted transport protocol allow system and network engineers to administer remote Linux infrastructure securely over untrusted networks?',
      options: [
        'SSH (Secure Shell) over encrypted TCP port 22',
        'Unencrypted Telnet over port 23 in plain text',
        'Cleartext HTTP port 80 for root shells',
        'Open anonymous FTP uploads'
      ],
      correctIndex: 0,
      explanation:
        'SSH provides public-key authentication and encrypted session channels, replacing insecure cleartext remote management protocols.'
    }
  },
  {
    id: 'lbd_finance_valuation_metrics_97',
    lessonNumber: 97,
    videoLabel: 'Video 97: Equity Valuation & Financial Ratios',
    title: 'How to Evaluate Market Valuations: P/E, Cash Flow & Risk',
    category: 'Finance & Business',
    enclaveId: 'finance_accounting',
    professionId: 'accountant',
    level: 'Intermediate',
    originalCreator: 'The Plain Bagel',
    creatorDomain: 'youtube.com',
    description:
      'Clear financial analyst breakdown comparing trailing vs. forward P/E ratios, Shiller CAPE cyclically adjusted multiples, interest-rate discount effects, and free cash flow durability.',
    skillsCovered: [
      'Trailing vs. Forward Earnings Multiples',
      'Interest Rate Impact on Discounted Cash Flows',
      'Comparing Historical CAPE Ratios Accurately',
      'Distinguishing Speculation From Cash Yield'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=0ZCVKL_PDsg',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=0ZCVKL_PDsg',
    youtubeId: '0ZCVKL_PDsg',
    embedAvailable: true,
    duration: '13:05',
    thumbnailUrl: 'https://i.ytimg.com/vi/0ZCVKL_PDsg/hqdefault.jpg',
    practiceActivity:
      'Compare two businesses in the same industry using Price-to-Free-Cash-Flow, debt-to-equity, and gross operating margin to decide which multiple reflects stronger fundamentals.',
    practiceDeliverablePrompt:
      'Explain why looking purely at headline share price ($5 vs. $500) tells you nothing without share count and market capitalization.',
    knowledgeCheck: {
      question:
        'Why can a high Price-to-Earnings (P/E) multiple sometimes look artificially elevated right after a temporary earnings dip?',
      options: [
        'Because trailing 12-month earnings ("E" in the denominator) shrink temporarily during one-off restructuring or downturns, inflating the P/E ratio',
        'Because stock splits triple revenue instantly',
        'Because zero-debt companies lose balance sheets automatically',
        'Because dividends erase all market capitalization'
      ],
      correctIndex: 0,
      explanation:
        'Pair P/E ratios with Normalized Free Cash Flow, Forward Margins, and balance sheet leverage so temporary distortions never mislead analysis.'
    }
  },
  {
    id: 'lbd_law_citation_verification_98',
    lessonNumber: 98,
    videoLabel: 'Video 98: Legal Citation & Rule 11 Sanctions Ethics',
    title: 'Courtroom Citation Verification, AI Risk & Legal Ethics',
    category: 'Law & Legal',
    enclaveId: 'law_gov_defense',
    professionId: 'lawyer',
    level: 'Intermediate',
    originalCreator: 'LegalEagle',
    creatorDomain: 'youtube.com',
    description:
      'Attorney analysis of real federal courtroom sanctions involving unverified citations, Rule 11 duty of candor to the tribunal, and mandatory human citator review before filing briefs.',
    skillsCovered: [
      'Federal Rule 11 Verification Duties',
      'Checking Primary Reporters & Reporter Pins',
      'Duty of Supervision Over Draft Filings',
      'Mitigating AI Hallucination Malpractice Risk'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=skb3Zr5i-Xg',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=skb3Zr5i-Xg',
    youtubeId: 'skb3Zr5i-Xg',
    embedAvailable: true,
    duration: '16:15',
    thumbnailUrl: 'https://i.ytimg.com/vi/skb3Zr5i-Xg/hqdefault.jpg',
    practiceActivity:
      'Build a 4-point pre-filing verification checklist requiring counsel or paralegals to pull full-text opinions and confirm every pinpoint quote and Shepard’s/KeyCite status.',
    practiceDeliverablePrompt:
      'Explain why an attorney remains personally accountable under ethics rules even if a junior tool or external vendor drafted an erroneous motion.',
    knowledgeCheck: {
      question:
        'Under legal ethics and Federal Rule of Civil Procedure 11, what duty does signing a court brief impose on counsel?',
      options: [
        'Counsel certifies after reasonable inquiry that factual contentions and legal citations exist, are warranted by law, and are accurately represented',
        'Signing waives all responsibility for nonexistent case citations',
        'Judges must accept fabricated quotes if an AI generated them',
        'Only appellate briefs require real statutes'
      ],
      correctIndex: 0,
      explanation:
        'Every legal professional signing a filing must independently read and verify every cited authority in official reporters or trusted legal databases.'
    }
  },
  {
    id: 'lbd_media_3d_blender_99',
    lessonNumber: 99,
    videoLabel: 'Video 99: 3D Hard-Surface & Industrial Modeling',
    title: '3D Industrial & Aviation Hard-Surface Modeling in Blender',
    category: 'Creative Media & Design',
    enclaveId: 'creative_media_arts',
    professionId: 'video_editor',
    level: 'Intermediate',
    originalCreator: 'Blender Guru',
    creatorDomain: 'youtube.com',
    description:
      'Andrew Price demonstrates professional reference-plane alignment, clean quad edge-flow topology, Subdivision Surface bevel weighting, and Cycles lighting for realistic industrial renders.',
    skillsCovered: [
      'Orthographic Reference Alignment & Blocking',
      'Clean Quad Topology & Edge-Flow Loops',
      'Subdivision Surface Supporting Bevels',
      'Physical PBR Materials & HDRI Studio Light'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=4wxmKLDhsnQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=4wxmKLDhsnQ',
    youtubeId: '4wxmKLDhsnQ',
    embedAvailable: true,
    duration: '18:30',
    thumbnailUrl: 'https://i.ytimg.com/vi/4wxmKLDhsnQ/hqdefault.jpg',
    practiceActivity:
      'Block out a streamlined product silhouette from side/top orthographic views using clean quad loops before applying Subdivision Surface modifiers.',
    practiceDeliverablePrompt:
      'Explain why starting with coarse primitive forms and locking primary proportions first prevents messy mesh artifacts later.',
    knowledgeCheck: {
      question:
        'Why do 3D hard-surface artists rely on supporting edge loops or bevel modifiers before applying Subdivision Surface smoothing?',
      options: [
        'Without holding edges near corners, subdivision collapses crisp mechanical lines into soft blobs and creates shading pinching',
        'Bevels delete all UV texture coordinates automatically',
        'Subdivision requires triangles with zero edge loops',
        'Supporting edges disable light shadows in Cycles'
      ],
      correctIndex: 0,
      explanation:
        'Controlled edge spacing dictates curve tightness cleanly while preserving smooth metallic specular highlights.'
    }
  },
  {
    id: 'lbd_aviation_takeoff_safety_100',
    lessonNumber: 100,
    videoLabel: 'Video 100: Commercial Flight Deck Takeoff Safety',
    title: 'Flight Deck Case Study: Takeoff Performance, V1 & CRM',
    category: 'Aviation & Maritime',
    enclaveId: 'aviation_aerospace_maritime',
    professionId: 'pilot',
    level: 'Intermediate',
    originalCreator: 'Mentour Pilot',
    creatorDomain: 'youtube.com',
    description:
      'Captain Petter breaks down Crew Resource Management (CRM), flight-management-computer weight cross-checks, thrust setting verification, and why independent human crosschecks prevent takeoff incidents.',
    skillsCovered: [
      'Takeoff Weight & V-Speed Crosscheck Discipline',
      'Crew Resource Management (CRM) Mutual Verification',
      'Runway Length vs. Flex Thrust Margins',
      'Standard Operating Callouts During Roll'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=D2QmaOglMb4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=D2QmaOglMb4',
    youtubeId: 'D2QmaOglMb4',
    embedAvailable: true,
    duration: '24:00',
    thumbnailUrl: 'https://i.ytimg.com/vi/D2QmaOglMb4/hqdefault.jpg',
    practiceActivity:
      'Draft a two-crew pre-takeoff verification flow comparing independent load-sheet calculations (`ZFW`, `TOW`, `V1/VR/V2`) before brake release.',
    practiceDeliverablePrompt:
      'Explain why entering zero-fuel weight instead of takeoff gross weight into a performance computer creates dangerous under-calculated rotation speeds.',
    knowledgeCheck: {
      question:
        'Why must both flight crew members verify takeoff weight and V-speeds independently from primary dispatch figures before takeoff?',
      options: [
        'Independent crosschecking catches fat-finger data entry or wrong runway performance numbers before runway acceleration begins',
        'Because airspeed indicators turn off above V1',
        'Fuel weight drops to zero during boarding',
        'Crew should never question computer presets'
      ],
      correctIndex: 0,
      explanation:
        'Cross-verification between Pilot Flying and Pilot Monitoring is a core pillar of modern aviation safety.'
    }
  },
  {
    id: 'lbd_science_materials_viscosity_101',
    lessonNumber: 101,
    videoLabel: 'Video 101: MIT Materials Science & Lab Measurement',
    title: 'MIT Lab Lecture: Glass Viscosity, Thermal Curves & Testing',
    category: 'Science & Lab Tech',
    enclaveId: 'science_laboratory_research',
    professionId: 'lab_technician',
    level: 'Intermediate',
    originalCreator: 'MIT OpenCourseWare',
    creatorDomain: 'youtube.com',
    description:
      'MIT laboratory materials lecture demonstrating viscosity measurement across decades of temperature change, Arrhenius activation behavior, annealing stress relief, and precision lab instrumentation.',
    skillsCovered: [
      'Dynamic Viscosity Units (Poise & Pascal-Seconds)',
      'Working, Softening & Annealing Temperature Points',
      'Linearizing Arrhenius Exponential Lab Data',
      'Thermal Stress Testing & Lab Recording'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=8hiGWBQ94WU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=8hiGWBQ94WU',
    youtubeId: '8hiGWBQ94WU',
    embedAvailable: true,
    duration: '28:15',
    thumbnailUrl: 'https://i.ytimg.com/vi/8hiGWBQ94WU/hqdefault.jpg',
    practiceActivity:
      'Plot log(viscosity) vs. `1/T` (Kelvin) for two industrial silicate compositions and identify the safe annealing strain-relief band vs. hot-working range.',
    practiceDeliverablePrompt:
      'Explain why glass cools into an amorphous solid without a sharp crystalline melting jump and why slow controlled annealing prevents thermal shattering.',
    knowledgeCheck: {
      question:
        'Why do laboratory glassblowers and industrial optics technicians anneal shaped glassware inside a controlled kiln before room-temperature handling?',
      options: [
        'Holding at the annealing temperature lets internal thermal stresses relax evenly before slow cooling prevents spontaneous cracking',
        'Annealing lowers refractive index to zero',
        'Kilns freeze moisture onto cold glass edges',
        'It melts finished optical lenses back into sand'
      ],
      correctIndex: 0,
      explanation:
        'Even cooling through the glass transition prevents frozen residual tension gradients from fracturing laboratory vessels.'
    }
  },
  {
    id: 'lbd_edu_instructional_design_102',
    lessonNumber: 102,
    videoLabel: 'Video 102: Visual Systems Storytelling & Curriculum',
    title: 'Visual Curriculum Design: Teaching Complex Earth Systems Clearly',
    category: 'Education & Training',
    enclaveId: 'education_workforce',
    professionId: 'educator',
    level: 'Beginner',
    originalCreator: 'CrashCourse',
    creatorDomain: 'youtube.com',
    description:
      'Structured instructional modeling showcasing how great technical educators turn abstract evidence—like planetary stratigraphy, crater dating, and core samples—into memorable visual mental models.',
    skillsCovered: [
      'Teaching Through Comparative Evidence & Models',
      'Pacing Micro-Segments for Active Retention',
      'Connecting Observable Features to Underlying Process',
      'Checking Learner Intuition With Real Examples'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=TMTLNFv5MQE',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=TMTLNFv5MQE',
    youtubeId: 'TMTLNFv5MQE',
    embedAvailable: true,
    duration: '12:25',
    thumbnailUrl: 'https://i.ytimg.com/vi/TMTLNFv5MQE/hqdefault.jpg',
    practiceActivity:
      'Break a complex technical trade concept into 3 progressive visual explanations: (1) everyday physical analogy, (2) labeled diagram, and (3) real troubleshooting example.',
    practiceDeliverablePrompt:
      'Explain why pairing physical evidence comparisons with clear conceptual analogies cuts beginner comprehension time in half.',
    knowledgeCheck: {
      question:
        'What instructional technique keeps learners engaged when explaining dense scientific or trade systems?',
      options: [
        'Anchor abstract rules immediately to concrete observable examples, visual comparisons, and short structured segments',
        'Read unformatted regulations straight aloud for 90 minutes with zero diagrams',
        'Skip foundational definitions and jump straight to obscure exceptions',
        'Avoid checking understanding until end-of-year exams'
      ],
      correctIndex: 0,
      explanation:
        'Concrete comparisons and well-paced visuals give apprentices intuitive hooks to remember technical principles on the job.'
    }
  },

  // ─── MULTI-SOURCE VERIFIED LESSONS (#103–116: VIMEO, ARCHIVE.ORG/MIT, PEERTUBE, DAILYMOTION) ──
  {
    id: 'lbd_vimeo_timber_craft_103',
    lessonNumber: 103,
    videoLabel: 'Vimeo Craft 103: Timber Retreat Joinery & Architecture',
    title: 'Jens Risom’s Block Island Timber Craft Retreat',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Intermediate',
    originalCreator: 'Gary Nadeau · Vimeo Craft',
    creatorDomain: 'vimeo.com',
    sourceProvider: 'vimeo',
    sourceVideoUrl: 'https://vimeo.com/53942891',
    referenceArticleUrl: 'https://vimeo.com/53942891',
    embedUrl: 'https://player.vimeo.com/video/53942891',
    licenseLabel: 'Standard Vimeo Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '4:15',
    thumbnailUrl: 'https://i.vimeocdn.com/video/372786473-fb6ea711b175c500976fb7054e4362bc8f5ef8eb3e51dee428f997e99d0f69cc-d_640?region=us',
    description:
      'Vimeo Craft profile exploring mid-century prefab timber joinery, coastal wind-braced framing proportions, and functional interior wood detailing.',
    skillsCovered: [
      'Modular Timber Framing Proportions',
      'Coastal Weathering & Wood Selection',
      'Built-In Millwork & Space Optimization',
      'Craftsman Design Thinking'
    ],
    practiceActivity:
      'Sketch a compact timber workspace or studio layout prioritizing natural daylight capture, cross-ventilation, and built-in millwork storage.',
    practiceDeliverablePrompt:
      'Explain why consistent module dimensions speed framing assembly and reduce off-cut lumber waste.',
    knowledgeCheck: {
      question:
        'What advantage does standardized modular timber layout bring to compact frame buildings?',
      options: [
        'Repeatable span grids match standard lumber lengths cleanly, accelerating assembly and cutting site waste',
        'Every wall stud is cut to an incompatible random angle',
        'Timber beams cannot support roof live loads',
        'Millwork must wait until furniture dissolves'
      ],
      correctIndex: 0,
      explanation:
        'Modular structural grids align sheathing, glazing, and cabinet spacing seamlessly.'
    }
  },
  {
    id: 'lbd_vimeo_lighting_design_104',
    lessonNumber: 104,
    videoLabel: 'Vimeo Design 104: Culinary Craft & Serviceware Design',
    title: 'Alinea & Crucial Detail: Culinary Craft & Industrial Serviceware Design',
    category: 'Creative Media & Design',
    enclaveId: 'creative_media_arts',
    professionId: 'photographer',
    level: 'Intermediate',
    originalCreator: 'Crucial Detail · Vimeo Design',
    creatorDomain: 'vimeo.com',
    sourceProvider: 'vimeo',
    sourceVideoUrl: 'https://vimeo.com/6184730',
    referenceArticleUrl: 'https://vimeo.com/6184730',
    embedUrl: 'https://player.vimeo.com/video/6184730',
    licenseLabel: 'Standard Vimeo Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '3:46',
    thumbnailUrl: 'https://i.vimeocdn.com/video/22555355-bc10c05ba8bd7d4f41843da0a517acead87761419bee18f68862fcac7ca4b181-d_640?region=us',
    description:
      'Industrial & experiential design study hosted on Vimeo showing precision metal, ceramic, and sensory prototyping between culinary chefs and industrial fabricators.',
    skillsCovered: [
      'Cross-Disciplinary Industrial Prototyping',
      'Material Finish & Tactile Ergonomics',
      'Human-Scale Experiential Design',
      'Iterative Studio Fabrication Review'
    ],
    practiceActivity:
      'Pick one everyday tool or client touchpoint in your trade and sketch two material or grip refinements that reduce friction and improve precision.',
    practiceDeliverablePrompt:
      'Explain how matching surface finish, balance weight, and presentation upgrades real-world usability.',
    knowledgeCheck: {
      question:
        'Why do industrial designers iterate physical prototypes directly inside the real working studio or kitchen environment?',
      options: [
        'Testing under real heat, grip, weight, and workflow pace uncovers ergonomic issues CAD drawings never show',
        'Physical mockups replace safety and durability standards permanently',
        'Studio prototypes remove the need for material selection',
        'Visual gloss alone guarantees comfortable tool balance'
      ],
      correctIndex: 0,
      explanation:
        'Observing tools under authentic working stress reveals balance, cleaning, and workflow improvements immediately.'
    }
  },
  {
    id: 'lbd_archive_mit_mechanics_105',
    lessonNumber: 105,
    videoLabel: 'MIT OCW / Internet Archive 105: Lab Physics & Units',
    title: 'MIT 8.01 Classical Mechanics: Measurement Units & Lab Physics',
    category: 'Science & Lab Tech',
    enclaveId: 'science_laboratory_research',
    professionId: 'research_scientist',
    level: 'Beginner',
    originalCreator: 'MIT OpenCourseWare · Internet Archive',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/MIT8.01F99',
    referenceArticleUrl: 'https://archive.org/details/MIT8.01F99',
    directVideoUrl: 'https://archive.org/download/MIT8.01F99/00intro.mp4',
    embedUrl: 'https://archive.org/embed/MIT8.01F99',
    licenseLabel: 'CC BY-NC-SA 4.0 · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '40:00',
    thumbnailUrl: 'https://archive.org/services/img/MIT8.01F99',
    description:
      'Open-licensed MIT physics lecture streamed directly via Internet Archive MP4 covering SI dimensional analysis, experimental uncertainty bounds, and verifiable lab scaling laws.',
    skillsCovered: [
      'Dimensional Analysis & Unit Consistency',
      'Experimental Uncertainty Bounds',
      'Physical Scaling & Stress Checks',
      'Controlled Lab Observation'
    ],
    practiceActivity:
      'Check a physical jobsite or lab formula by matching units on both sides and calculating +/- measurement tolerance bounds cleanly.',
    practiceDeliverablePrompt:
      'Explain why unit dimensional checks catch fatal calculation errors before hardware is built or tested.',
    knowledgeCheck: {
      question:
        'Why do engineers and lab technicians perform dimensional analysis on every formula before trusting numeric output?',
      options: [
        'Consistent SI/imperial unit cancellation immediately exposes missing conversion factors or inverted ratios',
        'Dimensional analysis deletes significant figures permanently',
        'Units automatically adjust calibrated sensors',
        'SI meters and inches never require explicit conversion'
      ],
      correctIndex: 0,
      explanation:
        'Confirming matching physical units guarantees formulas make physical sense and prevents catastrophic scaling errors.'
    }
  },
  {
    id: 'lbd_vimeo_food_rules_106',
    lessonNumber: 106,
    videoLabel: 'Vimeo Culinary 106: Whole-Ingredient Craft Standards',
    title: "Michael Pollan's Food Rules: Culinary Whole-Ingredient Standards",
    category: 'Culinary & Hospitality',
    enclaveId: 'culinary_hospitality_events',
    professionId: 'chef',
    level: 'Beginner',
    originalCreator: 'Ant House Studio · Vimeo Culinary',
    creatorDomain: 'vimeo.com',
    sourceProvider: 'vimeo',
    sourceVideoUrl: 'https://vimeo.com/35444471',
    referenceArticleUrl: 'https://vimeo.com/35444471',
    embedUrl: 'https://player.vimeo.com/video/35444471',
    licenseLabel: 'Standard Vimeo Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '2:13',
    thumbnailUrl: 'https://i.vimeocdn.com/video/242308225-2e0ff6f10ebd36452ad4c7b1b909b224a25593c357738463f2a1f5c06ea6b3c2-d_295x166?region=us',
    description:
      'Concise visual kitchen & procurement briefing hosted on Vimeo distilling core whole-ingredient sourcing rules, label discipline, and scratch-preparation standards.',
    skillsCovered: [
      'Whole-Ingredient Menu Procurement',
      'Label & Additive Screening',
      'Scratch Kitchen Quality Control',
      'Client Nutrition Transparency'
    ],
    practiceActivity:
      'Audit three pantry or catering supply items by checking ingredient list length, shelf turnover, and scratch-cooked alternatives.',
    practiceDeliverablePrompt:
      'Explain how cooking from clean primary ingredients improves plate consistency, flavor clarity, and allergen control.',
    knowledgeCheck: {
      question:
        'Why do professional kitchens audit vendor ingredient labels instead of relying on ultra-processed premixes?',
      options: [
        'Primary whole ingredients give exact allergen control, repeatable seasoning balance, and cleaner food-cost forecasting',
        'Unlabeled industrial additives lower preparation hygiene',
        'Scratch prep prevents FIFO inventory rotation',
        'Whole ingredients cannot be portion-measured accurately'
      ],
      correctIndex: 0,
      explanation:
        'Knowing every raw input protects guest safety, allergens, and consistent culinary quality across shifts.'
    }
  },
  {
    id: 'lbd_archive_mit_cs_107',
    lessonNumber: 107,
    videoLabel: 'MIT OCW / Internet Archive 107: Intro CS & Python',
    title: 'MIT 6.00SC: Computational Thinking & Python Engineering',
    category: 'Software & AI',
    enclaveId: 'tech_software',
    professionId: 'software_engineer',
    level: 'Beginner',
    originalCreator: 'MIT OpenCourseWare · Prof. John Guttag',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/MIT6.00SCS11',
    referenceArticleUrl: 'https://archive.org/details/MIT6.00SCS11',
    directVideoUrl: 'https://archive.org/download/MIT6.00SCS11/MIT6_00SCS11_lec01_300k.mp4',
    embedUrl: 'https://archive.org/embed/MIT6.00SCS11',
    licenseLabel: 'CC BY-NC-SA 4.0 · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '51:15',
    thumbnailUrl: 'https://archive.org/services/img/MIT6.00SCS11',
    description:
      'Open-licensed MIT OpenCourseWare lecture streamed directly from Internet Archive MP4 covering declarative vs. imperative knowledge, algorithms, and systematic program debugging.',
    skillsCovered: [
      'Declarative vs. Imperative Problem Decomposition',
      'Stored-Program Architecture Fundamentals',
      'Syntax vs. Static Semantics vs. Runtime Bugs',
      'Engineering Structured Control Flow'
    ],
    practiceActivity:
      'Outline an imperative step-by-step recipe in Python pseudocode to approximate square roots iteratively using error tolerance thresholds.',
    practiceDeliverablePrompt:
      'Distinguish a syntax error from a semantic logic bug and explain why semantic errors are harder to catch automatically.',
    knowledgeCheck: {
      question:
        'What is the key difference between a syntactic error and a semantic logic error in Python code?',
      options: [
        'Syntax errors violate grammar rules before running; semantic errors execute cleanly without crashing yet compute the wrong result',
        'Syntax errors only occur in dark theme editors',
        'Semantic errors cannot be fixed without replacing monitors',
        'Python compiles code only on leap years'
      ],
      correctIndex: 0,
      explanation:
        'Systematic unit tests catch subtle semantic mistakes where programs run without throwing tracebacks yet return incorrect logic.'
    }
  },
  {
    id: 'lbd_archive_mit_circuits_108',
    lessonNumber: 108,
    videoLabel: 'MIT OCW / Archive 108: Circuits & Electronics',
    title: 'MIT 6.002: Electrical Circuits, Lumped Models & Engineering',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Intermediate',
    originalCreator: 'MIT OpenCourseWare · Prof. Anant Agarwal',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/MIT6.002S07',
    referenceArticleUrl: 'https://archive.org/details/MIT6.002S07',
    directVideoUrl: 'https://archive.org/download/MIT6.002S07/mit-6.002-lec-mit-10250-04sep2003-0000-220k.mp4',
    embedUrl: 'https://archive.org/embed/MIT6.002S07',
    licenseLabel: 'CC BY-NC-SA 4.0 · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '50:00',
    thumbnailUrl: 'https://archive.org/services/img/MIT6.002S07',
    description:
      'MIT Electrical Engineering open lecture streamed via Internet Archive introducing engineering abstraction, KVL/KCL circuit laws, lumped element modeling, and practical resistive loads.',
    skillsCovered: [
      'Lumped Circuit Abstraction Discipline',
      'Kirchhoff Voltage & Current Conservation',
      'Ohm’s Law Power Dissipation Limits',
      'Bridging Maxwell Physics to Field Circuits'
    ],
    practiceActivity:
      'Solve a two-loop DC resistive divider using KVL and KCL, then verify power dissipation (`I²R`) fits standard 1/4W vs. 2W resistor ratings.',
    practiceDeliverablePrompt:
      'Explain why engineering abstraction treats long wires as ideal nodes only when signal wavelengths far exceed circuit length.',
    knowledgeCheck: {
      question:
        'Under Kirchhoff’s Current Law (KCL) inside a steady DC junction node, what must equal zero?',
      options: [
        'The algebraic sum of all electrical currents entering and leaving the node (charge cannot accumulate infinitely)',
        'Every resistor ohm rating in parallel',
        'Panel ground bonding conductivity',
        'Circuit breaker interrupt capacity'
      ],
      correctIndex: 0,
      explanation:
        'Total current flowing into any junction equals total current leaving—essential for diagnosing split-phase neutral loads.'
    }
  },
  {
    id: 'lbd_archive_mit_physics_109',
    lessonNumber: 109,
    videoLabel: 'MIT OCW / Archive 109: Electricity & Magnetism Lab',
    title: 'MIT 8.02: Electrostatics, Induction & Lab Demonstration',
    category: 'Science & Lab Tech',
    enclaveId: 'science_laboratory_research',
    professionId: 'lab_technician',
    level: 'Intermediate',
    originalCreator: 'MIT OpenCourseWare · Internet Archive',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/MIT8.02S02',
    referenceArticleUrl: 'https://archive.org/details/MIT8.02S02',
    directVideoUrl: 'https://archive.org/download/MIT8.02S02/OCW-8.02-Course-Intro-Lewin-220k.mp4',
    embedUrl: 'https://archive.org/embed/MIT8.02S02',
    licenseLabel: 'CC BY-NC-SA 4.0 · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '45:00',
    thumbnailUrl: 'https://archive.org/services/img/MIT8.02S02',
    description:
      'Classic open-access MIT laboratory physics walkthrough streamed directly in HTML5 MP4 illustrating electrostatic induction, electric fields, measurement precision, and lab bench safety.',
    skillsCovered: [
      'Electrostatic Charge Induction & Shielding',
      'Lab Measurement Error & Precision Discipline',
      'Grounding High-Voltage Lab Apparatus Safely',
      'Experimental Physical Evidence Checks'
    ],
    practiceActivity:
      'Log every step required to discharge a high-voltage capacitor bank via an insulated bleed resistor before handling lab probes.',
    practiceDeliverablePrompt:
      'Explain why ESD wrist straps and proper ground bonds protect sensitive semiconductor lab sensors.',
    knowledgeCheck: {
      question:
        'Why do laboratory technicians perform high-voltage grounding via rated discharge sticks instead of bare metal screwdrivers?',
      options: [
        'Rated discharge paths bleed stored capacitive energy safely without arcing flashes or lethal shock exposure',
        'Screwdrivers increase capacitive charge tenfold indefinitely',
        'Ground straps erase optical microscope lenses',
        'Static electricity cannot arc through humid lab air'
      ],
      correctIndex: 0,
      explanation:
        'Controlled energy discharge protects both researchers and precision bench instruments.'
    }
  },
  {
    id: 'lbd_archive_mit_linear_alg_110',
    lessonNumber: 110,
    videoLabel: 'MIT OCW / Archive 110: Linear Systems Pedagogy',
    title: 'MIT 18.06: Teaching Linear Equations Geometrically',
    category: 'Education & Training',
    enclaveId: 'education_workforce',
    professionId: 'workforce_trainer',
    level: 'Intermediate',
    originalCreator: 'MIT OpenCourseWare · Prof. Gilbert Strang',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/MIT18.06S05_MP4',
    referenceArticleUrl: 'https://archive.org/details/MIT18.06S05_MP4',
    directVideoUrl: 'https://archive.org/download/MIT18.06S05_MP4/01.ia.mp4',
    embedUrl: 'https://archive.org/embed/MIT18.06S05_MP4',
    licenseLabel: 'CC BY-NC-SA 4.0 · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '39:50',
    thumbnailUrl: 'https://archive.org/services/img/MIT18.06S05_MP4',
    description:
      'Renowned MIT pedagogy example on Internet Archive teaching linear systems through dual row-picture vs. column-picture visual geometry—a masterclass in technical instruction.',
    skillsCovered: [
      'Dual Row vs. Column Visual Intuition',
      'Teaching Quantitative Concepts Clearly',
      'Chalkboard Pacing & Concept Repetition',
      'Linear Combination Intuition for AI & Engineering'
    ],
    practiceActivity:
      'Explain a 2x2 equation system twice to a peer: first as intersecting lines (row picture) and second as weighted vector combinations (column picture).',
    practiceDeliverablePrompt:
      'Describe why multiple visual representations help technical learners overcome symbol overload.',
    knowledgeCheck: {
      question:
        'How does Prof. Strang recommend visualizing matrix multiplication `Ax = b` cleanly?',
      options: [
        'As linear combinations of the columns of matrix `A` weighted by entries of vector `x` to reach target `b`',
        'Memorizing 100 unrelated phone numbers without diagrams',
        'Converting integers into random colors permanently',
        'Removing column vectors from matrices completely'
      ],
      correctIndex: 0,
      explanation:
        'Column-space intuition bridges classic engineering math directly into modern machine learning embeddings.'
    }
  },
  {
    id: 'lbd_archive_auto_service_111',
    lessonNumber: 111,
    videoLabel: 'Internet Archive 111: Mechanical Drivetrain Service',
    title: 'Automotive Service Foundations: Drivetrain & Shop Safety',
    category: 'Auto Mechanics',
    enclaveId: 'automotive_mechanics',
    professionId: 'auto_mechanic',
    level: 'Beginner',
    originalCreator: 'Internet Archive · Vocational Film Vault',
    creatorDomain: 'archive.org',
    sourceProvider: 'archive_org',
    sourceVideoUrl: 'https://archive.org/details/Automoti1940',
    referenceArticleUrl: 'https://archive.org/details/Automoti1940',
    directVideoUrl: 'https://archive.org/download/Automoti1940/Automoti1940.mp4',
    embedUrl: 'https://archive.org/embed/Automoti1940',
    licenseLabel: 'Public Domain · Internet Archive Open MP4',
    youtubeId: '',
    embedAvailable: true,
    duration: '10:30',
    thumbnailUrl: 'https://archive.org/services/img/Automoti1940',
    description:
      'Public-domain vocational automotive service briefing streamed directly from Internet Archive explaining bay organization, systematic chassis lubrication, brake/clutch clearances, and tool care.',
    skillsCovered: [
      'Systematic Chassis & Drivetrain Inspection',
      'Lubrication Interval Discipline',
      'Tool Cleaning & Shop Bay Ergonomics',
      'Mechanical Linkage Clearance Checks'
    ],
    practiceActivity:
      'Draft a multi-point undercarriage preventive inspection sheet covering ball joints, tie-rod boots, brake line corrosion, and fluid seepage checks.',
    practiceDeliverablePrompt:
      'Explain why wiping grease fittings clean BEFORE pumping fresh grease prevents grit contamination inside bearings.',
    knowledgeCheck: {
      question:
        'Why should a mechanic wipe every Zerk grease fitting spotless with a clean rag before attaching a grease gun coupler?',
      options: [
        'Pumping grease through dirty dust forces abrasive sand straight into precision joint bearings, accelerating premature wear',
        'Clean metal turns steel shafts into plastic',
        'Greasing bearings removes all lubrication',
        'It doubles tire tread depth automatically'
      ],
      correctIndex: 0,
      explanation:
        'Contamination prevention adds tens of thousands of trouble-free miles to suspension and drivetrain joints.'
    }
  },
  {
    id: 'lbd_peertube_linux_sec_112',
    lessonNumber: 112,
    videoLabel: 'PeerTube 112: Debian Linux Security & Patch Lifecycle',
    title: 'Enterprise Security Support & Vulnerability Patching in Linux',
    category: 'Cybersecurity & IT',
    enclaveId: 'tech_cybersecurity',
    professionId: 'security_analyst',
    level: 'Intermediate',
    originalCreator: 'DebConf · PeerTube Federated',
    creatorDomain: 'makertube.net',
    sourceProvider: 'peertube',
    sourceVideoUrl: 'https://makertube.net/w/4RqxFNEZg4efxaxLF7d7Vj',
    referenceArticleUrl: 'https://makertube.net/w/4RqxFNEZg4efxaxLF7d7Vj',
    embedUrl: 'https://makertube.net/videos/embed/4RqxFNEZg4efxaxLF7d7Vj',
    licenseLabel: 'Creative Commons Attribution · MakerTube PeerTube',
    youtubeId: '',
    embedAvailable: true,
    duration: '1:58:16',
    thumbnailUrl: 'https://makertube.net/lazy-static/thumbnails/e2422352-43e7-49d5-9f7a-f81e65431ced.jpg',
    description:
      'Open-source federated PeerTube engineering session detailing CVE severity triage, security advisory signing, stable backport patching without breaking production ABI, and mirror verification.',
    skillsCovered: [
      'CVE Severity Triage & Backport Patching',
      'Cryptographically Signed Package Advisories',
      'Staged Rollout & Regression Testing',
      'Maintaining Stable Production Servers'
    ],
    practiceActivity:
      'Review an unpatched production package manifest, rank critical vs. low CVEs by internet exposure, and outline a staged security patch verification plan.',
    practiceDeliverablePrompt:
      'Explain why enterprise Linux maintainers backport targeted security patches instead of jumping major software versions mid-release.',
    knowledgeCheck: {
      question:
        'Why do enterprise security teams verify GPG signatures on package repositories before deploying updates?',
      options: [
        'Cryptographic signatures guarantee packages originated authentically from trusted maintainers and weren’t altered on mirrors',
        'Signatures convert encrypted firewalls into plain text',
        'Unverified unsigned binaries speed CPU clock speeds twice as fast',
        'Advisory keys delete audit logs automatically'
      ],
      correctIndex: 0,
      explanation:
        'Signed repository metadata blocks supply-chain mirror tampering cleanly.'
    }
  },
  {
    id: 'lbd_peertube_routing_hex_113',
    lessonNumber: 113,
    videoLabel: 'PeerTube 113: Wired Enterprise Router Architecture',
    title: 'Wired Gigabit Router Hardware, Switching & Packet Flow',
    category: 'Telecom & Fiber Optics',
    enclaveId: 'telecom_digital_infrastructure',
    professionId: 'network_technician',
    level: 'Intermediate',
    originalCreator: 'MikroTik News · MakerTube PeerTube',
    creatorDomain: 'makertube.net',
    sourceProvider: 'peertube',
    sourceVideoUrl: 'https://makertube.net/w/1RsyDgwQqsFzUnCzoMoreZ',
    referenceArticleUrl: 'https://makertube.net/w/1RsyDgwQqsFzUnCzoMoreZ',
    embedUrl: 'https://makertube.net/videos/embed/1RsyDgwQqsFzUnCzoMoreZ',
    licenseLabel: 'MakerTube Federated Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '3:52',
    thumbnailUrl: 'https://makertube.net/lazy-static/thumbnails/56fe1d59-9c56-4133-978b-13aa5f4511d6.jpg',
    description:
      'Federated PeerTube hardware overview examining multi-port wired routing architecture, switch-chip VLAN offloading vs. CPU firewall routing, and compact field rack deployment.',
    skillsCovered: [
      'Switch-Chip Hardware Offloading vs. CPU Routing',
      'Wired VLAN Segmentation Basics',
      'IPsec Hardware Acceleration Planning',
      'Reliable SOHO & Edge Telecom Installations'
    ],
    practiceActivity:
      'Diagram how LAN VLAN traffic stays inside wire-speed switch chips while only inter-VLAN/WAN packets cross the router CPU bottleneck.',
    practiceDeliverablePrompt:
      'Explain why saturating router CPU bridges drops gigabit WAN throughput compared to hardware-offloaded fast-path forwarding.',
    knowledgeCheck: {
      question:
        'What performance advantage does switch-chip hardware offloading provide on modern field routers?',
      options: [
        'Layer-2 switched traffic moves at full wire speed in silicon without pegging the general router CPU',
        'Offloading disconnects Ethernet RJ45 latches physically',
        'Switch chips convert fiber strands into analog radio static',
        'It doubles ISP latency intentionally'
      ],
      correctIndex: 0,
      explanation:
        'Keeping local switching offloaded preserves router CPU headroom cleanly for VPNs and firewall filtering.'
    }
  },
  {
    id: 'lbd_dailymotion_cabinet_joinery_114',
    lessonNumber: 114,
    videoLabel: 'Dailymotion 114: Cabinet Anatomy & Joinery',
    title: 'Woodworking Craft: Cabinet Carcass Anatomy & Joinery',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'Tutorials Arena · Dailymotion',
    creatorDomain: 'dailymotion.com',
    sourceProvider: 'dailymotion',
    sourceVideoUrl: 'https://www.dailymotion.com/video/x8itt0a',
    referenceArticleUrl: 'https://www.dailymotion.com/video/x8itt0a',
    embedUrl: 'https://geo.dailymotion.com/player.html?video=x8itt0a',
    licenseLabel: 'Standard Dailymotion Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '8:45',
    thumbnailUrl: 'https://www.dailymotion.com/thumbnail/video/x8itt0a',
    description:
      'Detailed cabinetry walkthrough hosted on Dailymotion breaking down face-frame vs. frameless Euro-box joinery, dado/rabbet back panels, and checking corner diagonals square.',
    skillsCovered: [
      'Face-Frame vs. Frameless Cabinet Construction',
      'Rabbet & Dado Carcass Panel Alignment',
      'Checking Carcass Square via Cross Diagonals',
      'Flush Scribing Walls During Installation'
    ],
    practiceActivity:
      'Sketch an exploded cabinet box labeling side panels, fixed stretcher rails, recessed back panel rabbet, and diagonal square check.',
    practiceDeliverablePrompt:
      'Explain why cabinet makers pull cross-corner diagonals immediately after clamping before driving final fasteners.',
    knowledgeCheck: {
      question:
        'How does a recessed cabinet back panel lock a carcass square against racking?',
      options: [
        'Once fitted into tight dadoes or rabbets and checked for equal cross diagonals, the rigid back plane acts as a structural diaphragm',
        'It makes doors swing backward inside the box',
        'It eliminates the need for bottom toe-kicks everywhere',
        'Thin backs allow side walls to twist freely 15 degrees'
      ],
      correctIndex: 0,
      explanation:
        'Equal diagonal measurements plus a well-fastened back diaphragm guarantee smooth, bind-free doors and drawers.'
    }
  },
  {
    id: 'lbd_dailymotion_mig_vs_tig_115',
    lessonNumber: 115,
    videoLabel: 'Dailymotion 115: MIG vs. TIG Welding Trade Guide',
    title: 'MIG Welding vs. TIG Welding: Process Selection & Weld Quality',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Beginner',
    originalCreator: 'Engineering Career · Dailymotion',
    creatorDomain: 'dailymotion.com',
    sourceProvider: 'dailymotion',
    sourceVideoUrl: 'https://www.dailymotion.com/video/x8h7sly',
    referenceArticleUrl: 'https://www.dailymotion.com/video/x8h7sly',
    embedUrl: 'https://geo.dailymotion.com/player.html?video=x8h7sly',
    licenseLabel: 'Standard Dailymotion Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '4:38',
    thumbnailUrl: 'https://www.dailymotion.com/thumbnail/video/x8h7sly',
    description:
      'Clear shop comparison hosted on Dailymotion contrasting GMAW (MIG) wire-feed deposition speed with GTAW (TIG) thin-gauge precision, shielding gas mixes, and cost tradeoffs.',
    skillsCovered: [
      'GMAW (MIG) Constant-Voltage Wire Speed Balance',
      'GTAW (TIG) Constant-Current Puddle Precision',
      'C25 vs. Pure Argon Gas Cylinder Selection',
      'Matching Process to Plate Thickness & Finish'
    ],
    practiceActivity:
      'Create a fabrication selection matrix matching steel frame production, sanitary stainless piping, and thin aluminum enclosures to MIG vs. TIG.',
    practiceDeliverablePrompt:
      'Explain why shop fabricators pick MIG for long structural mild steel production seams and TIG for critical sanitary or exotic thin-wall alloys.',
    knowledgeCheck: {
      question:
        'Which shielding gas cylinder is used with standard GTAW (TIG) torches on both steel and aluminum?',
      options: [
        '100% Pure Argon—whereas steel MIG typically uses 75% Argon / 25% CO2 (never use CO2 mix in TIG, it burns up tungsten rapidly)',
        'Pure oxygen propellant',
        'Unfiltered shop compressed air',
        'Acetylene gas fed through the TIG cup'
      ],
      correctIndex: 0,
      explanation:
        'Inert pure argon protects white-hot TIG tungsten electrodes cleanly without oxidation.'
    }
  },
  {
    id: 'lbd_dailymotion_pipe_fittings_116',
    lessonNumber: 116,
    videoLabel: 'Dailymotion 116: Residential Plumbing Pipe Fittings',
    title: 'Top 5 Residential Plumbing Pipe Fittings & Joint Selection',
    category: 'Plumbing',
    enclaveId: 'trades_construction',
    professionId: 'plumber',
    level: 'Beginner',
    originalCreator: 'suhen.dyb · Dailymotion',
    creatorDomain: 'dailymotion.com',
    sourceProvider: 'dailymotion',
    sourceVideoUrl: 'https://www.dailymotion.com/video/xbq3pg6',
    referenceArticleUrl: 'https://www.dailymotion.com/video/xbq3pg6',
    embedUrl: 'https://geo.dailymotion.com/player.html?video=xbq3pg6',
    licenseLabel: 'Standard Dailymotion Embed · Creator Attributed',
    youtubeId: '',
    embedAvailable: true,
    duration: '3:00',
    thumbnailUrl: 'https://www.dailymotion.com/thumbnail/video/xbq3pg6',
    description:
      'Practical plumbing hardware tutorial hosted on Dailymotion identifying couplings, unions, dielectric transition fittings, valves, and proper PTFE thread sealing directions.',
    skillsCovered: [
      'Couplings vs. Serviceable Unions',
      'Preventing Galvanic Corrosion With Dielectric Unions',
      'Clockwise PTFE Tape & Pipe Dope Wrapping',
      'Quarter-Turn Ball Valve Isolation Placement'
    ],
    practiceActivity:
      'Lay out five real pipe fittings (slip coupling, service union, 90° street elbow, reducing tee, full-port ball valve) and label each service role.',
    practiceDeliverablePrompt:
      'Explain why joining copper directly to galvanized steel without a dielectric union or brass nipple accelerates pinhole pipe leaks.',
    knowledgeCheck: {
      question:
        'In which direction should PTFE thread seal tape be wrapped around male tapered pipe threads?',
      options: [
        'Clockwise when looking straight at the open pipe end, so screwing the female fitting tightens the tape into threads instead of bunching it off',
        'Counterclockwise loosely around smooth outer pipe paint',
        'Only over slip-fit sweat copper solder joints',
        'Wrapped completely across compression ferrules'
      ],
      correctIndex: 0,
      explanation:
        'Clockwise wrapping follows male thread pitch so tightening seats the tape cleanly into tapered NPT valleys.'
    }
  }
]
