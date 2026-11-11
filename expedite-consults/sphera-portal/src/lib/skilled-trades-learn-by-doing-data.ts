export type SkilledTradesCategory =
  | 'Carpentry'
  | 'Auto Mechanics'
  | 'Painting & Decorating'
  | 'Plumbing'
  | 'Electrical Fundamentals'
  | 'Welding'
  | 'HVAC'

export interface LearnByDoingKnowledgeCheck {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface LearnByDoingLessonVariant {
  id: string
  videoLabel: string
  title: string
  originalCreator: string
  creatorDomain: string
  description: string
  skillsCovered: string[]
  sourceVideoUrl: string
  referenceArticleUrl: string
  youtubeId?: string
  embedAvailable: boolean
  duration: string
  practiceActivity: string
  practiceDeliverablePrompt: string
  knowledgeCheck: LearnByDoingKnowledgeCheck
}

export interface LearnByDoingLesson {
  id: string
  lessonNumber: number
  videoLabel: string
  title: string
  category: SkilledTradesCategory
  enclaveId: 'trades_construction' | 'automotive_mechanics'
  professionId: string
  level: 'Beginner'
  originalCreator: string
  creatorDomain: string
  /** Source spoken language of the video (defaults to 'en' if omitted). Non-English videos are automatically interpreted into English (or any selected language)! */
  sourceLanguage?: string
  sourceLanguageLabel?: string
  description: string
  skillsCovered: string[]
  sourceVideoUrl: string
  referenceArticleUrl: string
  /** Only set when the supplied source video URL has been verified to play in an embedded player. */
  youtubeId?: string
  embedAvailable: boolean
  embedUnavailableReason?: string
  /** Unverified durations must remain blank ("") per ConnectLn content integrity rules. */
  duration: string
  thumbnailUrl: string
  practiceActivity: string
  practiceDeliverablePrompt: string
  knowledgeCheck: LearnByDoingKnowledgeCheck
  detailedStudyNotes?: string[]
  fieldTip?: string
  companionVariant?: LearnByDoingLessonVariant
}

export interface LearnByDoingLessonTelemetry {
  lessonId: string
  verifiedVideoViews: number
  outboundLinkClicks: number
  isSaved: boolean
  savesCount: number
  inLearningJourney: boolean
  videoReviewed: boolean
  practiceNotes: string
  practicePhotoName?: string
  practicePhotoDataUrl?: string
  practiceCompletedAt?: string
  knowledgeCheckSelectedOption?: number
  knowledgeCheckPassed: boolean
  isCompleted: boolean
  progressPercent: number
  interactionsCount: number
  lastUpdatedAt?: string
}

export const SKILLED_TRADES_COLLECTION_META = {
  id: 'collection_skilled_trades_learn_by_doing',
  title: 'Skilled Trades: Learn by Doing',
  subtitle:
    'Hands-on beginner lessons across Carpentry, Auto Mechanics, Painting & Decorating, Plumbing, Electrical Fundamentals, Welding, and HVAC with original creator attribution, guided practice activities, and knowledge checks.',
  categories: [
    'Carpentry',
    'Auto Mechanics',
    'Painting & Decorating',
    'Plumbing',
    'Electrical Fundamentals',
    'Welding',
    'HVAC'
  ] as SkilledTradesCategory[]
}

export const SKILLED_TRADES_LEARN_BY_DOING_LESSONS: LearnByDoingLesson[] = [
  // ─── CATEGORY 1: CARPENTRY (2 Beginner Lessons) ──────────────────────────
  {
    id: 'lbd_carpentry_speed_square_1',
    lessonNumber: 1,
    videoLabel: 'Video 1: Using a Speed Square',
    title: 'Carpentry Basics: Marking and Checking Angles',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'This Old House',
    creatorDomain: 'thisoldhouse.com',
    description:
      'Learners explore how a speed square helps mark angles and check whether corners are square. This is a useful starting lesson before moving into cutting and assembly.',
    skillsCovered: [
      'Speed Square Layout',
      'Marking 90° Perpendicular Lines',
      'Marking 45° Miter Angles',
      'Checking Corner Squareness'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=gNhWpuWvtEA',
    referenceArticleUrl: 'https://www.thisoldhouse.com/tools/how-to-use-a-speed-square',
    youtubeId: 'gNhWpuWvtEA',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/gNhWpuWvtEA/hqdefault.jpg',
    practiceActivity:
      'Mark a perpendicular line and a 45-degree line on scrap wood, then photograph the markings.',
    practiceDeliverablePrompt:
      'Describe how you seated the speed square fence against your scrap board edge to scribe the 90° and 45° lines, or attach a photo of your markings.',
    knowledgeCheck: {
      question:
        'When marking a true 90-degree perpendicular cut line or a 45-degree miter line across a board with a speed square, what must you do first?',
      options: [
        'Hold the speed square flat in the center of the board without touching the edge',
        'Press the lip (fence) of the speed square flush and tight against the straight edge of the board',
        'Measure from both ends with a tape measure instead of using the pivot point',
        'Clamp the speed square at a 30-degree angle before scribing'
      ],
      correctIndex: 1,
      explanation:
        'Pressing the speed square’s T-bar lip (fence) flush against the reference edge of the lumber registers the tool so the 90° perpendicular edge and 45° hypotenuse edge are accurate.'
    },
    detailedStudyNotes: [
      'Registering the Fence (T-Bar Lip): Always press the flanged lip of the speed square firmly against the straight reference edge of the board before marking or guiding a saw.',
      'Marking 90° Crosscuts & 45° Miters: Scribe along the perpendicular ruler edge for a square 90° cutoff line, or along the angled hypotenuse edge for an exact 45° miter.',
      'Swinging Custom Angles with the Pivot Point: Hold the corner pivot mark against the board edge, rotate the square until your desired degree mark (0°–90°) aligns with the same board edge, and scribe along the hypotenuse.',
      'Checking Inside & Outside Corners: Place the 90° corner of the square against assembled framing or box corners; any daylight gap indicates the joint is out of square.'
    ],
    fieldTip: 'Keep your pencil sharp (or use a carpenter’s mechanical pencil) and pull the line in a single stroke while keeping constant thumb pressure on the speed square fence.'
  },
  {
    id: 'lbd_carpentry_clamps_2',
    lessonNumber: 2,
    videoLabel: 'Video 2: Choosing and Using Clamps',
    title: 'Carpentry Basics: Choosing the Right Clamp',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'finish_carpenter',
    level: 'Beginner',
    originalCreator: 'This Old House',
    creatorDomain: 'thisoldhouse.com',
    description:
      'This lesson introduces different clamp types and the jobs they suit, including ways to protect the wood’s surface while holding it securely.',
    skillsCovered: [
      'Clamp Type Selection',
      'Workpiece Holding & Glue-Ups',
      'Wood Surface Protection (Scrap Pads)',
      'Even Clamping Pressure'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=GHiOk_8mlq0',
    referenceArticleUrl: 'https://www.thisoldhouse.com/tools/all-about-clamps',
    youtubeId: 'GHiOk_8mlq0',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/GHiOk_8mlq0/hqdefault.jpg',
    practiceActivity:
      'Identify two clamp types and explain which job each would suit best, including how to protect the wood’s surface while clamping.',
    practiceDeliverablePrompt:
      'List two clamp types (e.g., bar/pipe clamp, quick-grip/one-handed clamp, C-clamp, or spring clamp), the carpentry task each suits, and how you protect the workpiece surface.',
    knowledgeCheck: {
      question:
        'How should you prevent metal clamp jaws from denting or marring the surface of finished wood when tightening a clamp?',
      options: [
        'Overtighten the clamp screw as fast as possible so it does not slip',
        'Place protective pads or scrap wood blocks (cauls) between the clamp jaws and the workpiece',
        'Wet the wood surface with water before applying the clamp',
        'Only clamp across the middle of unsupported thin panels'
      ],
      correctIndex: 1,
      explanation:
        'Using slip-on jaw pads or placing clean scrap wood pads (cauls) between the clamp jaws and the workpiece distributes clamping force and prevents bruising the wood grain.'
    },
    detailedStudyNotes: [
      'One-Handed / Trigger Bar Clamps: Ideal for quick positioning, holding workpieces to a bench while drilling or cutting, and light-to-medium assembly.',
      'Pipe & Parallel-Jaw Bar Clamps: Deliver strong, even pressure across wide panel glue-ups, cabinet carcasses, and furniture frames without bowing the stock.',
      'Spring, C-Clamps & Handscrew Clamps: Spring clamps suit fast tack-holds; C-clamps offer high point force for jigs; wooden handscrews conform to angled or delicate workpieces.',
      'Protecting Finished Wood Surfaces: Always place clean scrap wood blocks (cauls) or rubber jaw pads between metal clamp jaws and your workpiece to prevent grain denting and iron glue stains.'
    ],
    fieldTip: 'Dry-fit your clamps and scrap pads before applying wood glue so you know every clamp reaches and pulls square before the glue begins to tack.'
  },

  // ─── CATEGORY 2: AUTO MECHANICS (2 Beginner Lessons) ─────────────────────
  {
    id: 'lbd_auto_engine_oil_3',
    lessonNumber: 3,
    videoLabel: 'Video 3: Checking Engine Oil',
    title: 'Vehicle Maintenance: Checking Your Engine Oil',
    category: 'Auto Mechanics',
    enclaveId: 'automotive_mechanics',
    professionId: 'mechanic',
    level: 'Beginner',
    originalCreator: 'CAA-Quebec',
    creatorDomain: 'caaquebec.com',
    description:
      'The video demonstrates locating the dipstick, checking the oil level, and reading it against the dipstick’s markings.',
    skillsCovered: [
      'Locating the Engine Oil Dipstick',
      'Wiping & Re-Inserting Procedure',
      'Reading Min / Max Dipstick Markings',
      'Owner Manual Fluid Procedure Lookup'
    ],
    sourceVideoUrl:
      'https://www.caaquebec.com/en/advices/videos/how-to-take-proper-care-of-your-vehicle/vehicle-maintenance-how-to-check-oil',
    referenceArticleUrl:
      'https://www.caaquebec.com/en/advices/videos/how-to-take-proper-care-of-your-vehicle/vehicle-maintenance-how-to-check-oil',
    youtubeId: 'TQYhIhaDsl8',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/TQYhIhaDsl8/hqdefault.jpg',
    practiceActivity:
      'Find the oil-check instructions in a vehicle’s owner manual and identify the procedure specified for that vehicle.',
    practiceDeliverablePrompt:
      'Record the vehicle make/model/year from the owner manual and note its specified oil-check conditions (e.g., level ground, warm vs. cold engine wait time, dipstick markings, and oil viscosity).',
    knowledgeCheck: {
      question:
        'Why must you pull the dipstick out, wipe it clean with a lint-free cloth or paper towel, and reinsert it fully before reading the oil level?',
      options: [
        'To warm up the dipstick metal before it touches the oil pan',
        'Because oil splashes onto the dipstick tube during engine operation, so wiping first ensures an accurate reading of the actual sump level against the markings',
        'To permanently magnetize the tip of the dipstick',
        'So you can read the oil level while the vehicle is parked on a steep hill'
      ],
      correctIndex: 1,
      explanation:
        'Oil splashed along the dipstick tube gives a false high or smeared reading. Wiping the dipstick clean, reinserting it all the way, and pulling it out again shows the true oil level between the minimum and maximum markings.'
    },
    detailedStudyNotes: [
      'Park on Level Ground & Allow Drain-Back: Park on a flat surface with the engine off and wait several minutes (or check cold per the owner manual) so oil drains back into the oil pan.',
      'Locate & Pull the Dipstick: Identify the brightly colored engine oil dipstick loop (typically yellow or orange), pull it out smoothly, and hold a cloth or paper towel underneath.',
      'Wipe Clean, Reinsert Fully & Withdraw: Wipe all splashed oil from the tip, push the dipstick all the way back into its tube until seated, and pull it out a second time.',
      'Read Against Min/Max Markings: Verify the oil film sits between the lower (MIN/ADD) and upper (MAX/FULL) pinholes or crosshatched safe zone, and note oil color and clarity.'
    ],
    fieldTip: 'Never overfill past the MAX mark—excess oil can be whipped into foam by the crankshaft, reducing oil pressure and fouling spark plugs or catalytic converters.'
  },
  {
    id: 'lbd_auto_check_engine_scan_4',
    lessonNumber: 4,
    videoLabel: 'Video 4: Reading Check-Engine Information',
    title: 'Auto Diagnostics: Your First Diagnostic Scan',
    category: 'Auto Mechanics',
    enclaveId: 'automotive_mechanics',
    professionId: 'mechanic',
    level: 'Beginner',
    originalCreator: 'AutoZone',
    creatorDomain: 'autozone.com',
    description:
      'This demonstration shows how AutoZone’s reader retrieves trouble-code information and produces a report for further diagnosis. It introduces the diagnostic connector and the scanner workflow.',
    skillsCovered: [
      'OBD-II Data Link Connector (DLC) Location',
      'Scanner Connection & Ignition Sequence',
      'Diagnostic Trouble Code (DTC) Retrieval',
      'Retaining Diagnostic Report Data'
    ],
    sourceVideoUrl: 'https://www.autozone.com/diy/videos/fixfinder-selfservice-224015421',
    referenceArticleUrl: 'https://www.autozone.com/diy/videos/fixfinder-selfservice-224015421',
    youtubeId: '9FV2L7btUEE',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/9FV2L7btUEE/hqdefault.jpg',
    practiceActivity:
      'Write down the demonstrated scan sequence and the information you would retain for further diagnosis.',
    practiceDeliverablePrompt:
      'Document the step-by-step OBD-II scan sequence (locating the DLC port, ignition state, plugging in the reader, retrieving codes) and list the exact report details you would keep for further troubleshooting.',
    knowledgeCheck: {
      question:
        'When performing an initial check-engine diagnostic scan, how should a technician treat the retrieved Diagnostic Trouble Code (DTC) report?',
      options: [
        'As a starting point that identifies the affected circuit or system and guides further diagnosis, rather than skipping verification tests',
        'As proof that the vehicle never needs maintenance again',
        'By immediately unplugging the scanner while cranking the starter with the hood closed',
        'By discarding the code number and only guessing which sensor to replace'
      ],
      correctIndex: 0,
      explanation:
        'A diagnostic scanner retrieves trouble codes and freeze-frame/report data from the vehicle’s computer through the OBD-II connector, providing structured information to guide further pinpointed diagnosis.'
    },
    detailedStudyNotes: [
      'Locating the 16-Pin OBD-II Port (DLC): Look underneath the driver-side dashboard near the steering column for the trapezoidal 16-pin Data Link Connector.',
      'Connecting the Code Reader: With the vehicle parked safely, plug the scanner cable firmly into the OBD-II port and turn the ignition to the ON/RUN position (or as prompted by the tool).',
      'Retrieving DTCs & Freeze-Frame Context: Read stored, pending, and permanent Diagnostic Trouble Codes (e.g., P0xxx powertrain codes) along with the system description.',
      'Using the Report to Guide Diagnosis: Record the exact alphanumeric code, code definition, and secondary fault codes before clearing anything—a DTC identifies an affected circuit or system test failure, not automatically a bad part.'
    ],
    fieldTip: 'A steady Check Engine Light indicates an emissions or sensor fault to inspect soon, whereas a flashing Check Engine Light warns of an active misfire that can rapidly overheat the catalytic converter.'
  },

  // ─── CATEGORY 3: PAINTING & DECORATING (2 Beginner Lessons) ──────────────
  {
    id: 'lbd_painting_prep_walls_5',
    lessonNumber: 5,
    videoLabel: 'Video 5: Preparing Walls for Painting',
    title: 'Painting Basics: Preparing the Surface',
    category: 'Painting & Decorating',
    enclaveId: 'trades_construction',
    professionId: 'painter',
    level: 'Beginner',
    originalCreator: 'Sherwin-Williams',
    creatorDomain: 'sherwin-williams.com',
    description:
      'Learners see how cleaning walls, masking trim, protecting floors, and preparing surfaces contribute to a successful painting job.',
    skillsCovered: [
      'Wall Cleaning & Dust Removal',
      'Masking Trim & Baseboards',
      'Floor & Furniture Drop-Cloth Protection',
      'Surface Preparation Checklist'
    ],
    sourceVideoUrl: 'https://www.sherwin-williams.com/en-us/project-center/paint/how-to-prep-walls',
    referenceArticleUrl:
      'https://www.sherwin-williams.com/en-us/project-center/paint/how-to-prep-walls',
    youtubeId: 'f_23fk6aEHA',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/f_23fk6aEHA/hqdefault.jpg',
    practiceActivity:
      'Create a preparation checklist for one room, including the surfaces and furniture that need protection.',
    practiceDeliverablePrompt:
      'Write your room preparation checklist below covering wall cleaning, patching/sanding, trim/outlet masking, and floor/furniture protection.',
    knowledgeCheck: {
      question:
        'Why is thorough surface preparation—cleaning walls, masking trim, and protecting floors—essential before applying paint?',
      options: [
        'Paint adheres poorly to dust, grease, or grime, and proper masking and drop cloths prevent splatter damage while ensuring crisp trim lines',
        'Surface preparation allows you to paint directly over loose cobwebs and wet grease',
        'Masking tape is only applied after the final coat of wall paint has dried',
        'Cleaning walls makes the room darker so lap marks cannot be seen'
      ],
      correctIndex: 0,
      explanation:
        'Clean, dull, dry walls ensure strong paint adhesion and uniform sheen, while masking trim and laying drop cloths protect adjacent surfaces and speed up brush and roller work.'
    },
    detailedStudyNotes: [
      'Clear, Cover & Protect the Room: Move furniture to the center of the room, cover with plastic sheeting, lay canvas drop cloths along floors, and remove switch/outlet cover plates.',
      'Wash & Dust Wall Surfaces: Wipe down walls, baseboards, and trim with a damp sponge or mild cleaner to remove dust, cobwebs, hand oils, and kitchen grease that block paint adhesion.',
      'Fill Imperfections & Sand Smooth: Patch nail holes and dings with spackling compound, let dry completely, sand flush with fine-grit sandpaper, and wipe away sanding dust.',
      'Mask Trim & Spot-Prime Repairs: Apply painter’s tape neatly along baseboards, window casings, and door trim, and spot-prime bare drywall patches so they do not flash through the topcoat.'
    ],
    fieldTip: 'Professional painters spend up to 60–70% of a room project on surface preparation—the quality of your finish coat is determined before you open the paint can.'
  },
  {
    id: 'lbd_painting_brush_roller_6',
    lessonNumber: 6,
    videoLabel: 'Video 6: Painting a Room with a Brush and Roller',
    title: 'Painting Technique: Clean Edges and an Even Finish',
    category: 'Painting & Decorating',
    enclaveId: 'trades_construction',
    professionId: 'painter',
    level: 'Beginner',
    originalCreator: 'Sherwin-Williams',
    creatorDomain: 'sherwin-williams.com',
    description:
      'This lesson covers room-painting order, painting edges with a brush, and using a roller while maintaining a wet edge to reduce visible lap marks.',
    skillsCovered: [
      'Room-Painting Order',
      'Cutting In Edges with a Brush',
      'Rolling Technique & Wet-Edge Control',
      'Applying & Removing Painter’s Tape Cleanly'
    ],
    sourceVideoUrl:
      'https://www.sherwin-williams.com/en-us/project-center/paint/best-order-painting-room',
    referenceArticleUrl:
      'https://www.sherwin-williams.com/en-us/project-center/paint/best-order-painting-room',
    youtubeId: 'HNefCphXHoc',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/HNefCphXHoc/hqdefault.jpg',
    practiceActivity:
      'Use a practice panel to demonstrate a brushed edge and an adjacent rolled section (and practice applying painter’s tape along a short straight edge and noting the steps for removing it cleanly).',
    practiceDeliverablePrompt:
      'Describe your practice panel sequence: cutting in the brushed edge, rolling the adjacent section while maintaining a wet edge, and applying/removing painter’s tape cleanly.',
    knowledgeCheck: {
      question:
        'Why is it important to maintain a "wet edge" when brushing edges (cutting in) and rolling adjacent wall sections?',
      options: [
        'Maintaining a wet edge blends the freshly brushed border and rolled passes together before the paint sets, reducing visible lap marks and picture-framing',
        'A wet edge makes the paint dry in 30 seconds without ventilation',
        'It allows you to skip using a brush near corners and ceilings',
        'You should wait three days between cutting in the edges and rolling the center of the wall'
      ],
      correctIndex: 0,
      explanation:
        'Rolling into a still-wet brushed edge and overlapping roller passes while the paint remains wet prevents double-thickness buildup, sheen flashing, and visible lap marks.'
    },
    detailedStudyNotes: [
      'Top-to-Bottom Room Sequence: Paint the ceiling first, then cut in and roll the walls one wall at a time, and finish with the trim, doors, and baseboards (or paint trim first and mask once cured).',
      'Cutting In with an Angled Sash Brush: Load the bottom third of a 2"–2.5" angled brush, tap (do not wipe) excess paint, and brush a 2–3 inch border along ceiling lines, corners, and trim.',
      'Rolling in a W/M Pattern with a Wet Edge: Immediately roll the adjacent wall area in a 3×3 ft "W" pattern while your brushed border is still wet, then finish with light vertical lay-off strokes.',
      'Clean Tape Application & 45° Removal (FrogTape Companion): Apply tape in short unstretched sections, burnish the edge firmly to activate edge-sealing, and pull back at a 45° angle while paint is still damp.'
    ],
    fieldTip: 'Cut in and roll one wall completely before moving to the next wall so your brushed border never dries before your roller blends into it.',
    companionVariant: {
      id: 'lbd_painting_frogtape_6b',
      videoLabel: 'Video 6 (Companion): Using Painter’s Tape Cleanly',
      title: 'Painting Basics: Getting Clean Paint Edges',
      originalCreator: 'FrogTape',
      creatorDomain: 'frogtape.com',
      description:
        'This video focuses on applying and removing tape carefully to help achieve cleaner paint lines around trim and borders.',
      skillsCovered: [
        'Applying Painter’s Tape Without Stretching',
        'Sealing Tape Edges Around Trim',
        'Clean Tape Removal Angle & Timing'
      ],
      sourceVideoUrl: 'https://www.frogtape.com/application-advice/video-library',
      referenceArticleUrl: 'https://www.frogtape.com/application-advice/video-library',
      youtubeId: 'GNvhciYDbt4',
      embedAvailable: true,
      duration: '',
      practiceActivity:
        'Practice applying tape along a short straight edge and note the steps for removing it cleanly.',
      practiceDeliverablePrompt:
        'Note the steps you followed to press down the tape along a clean straight edge and remove it at a 45-degree angle for a crisp paint line.',
      knowledgeCheck: {
        question:
          'What is the recommended technique for applying and removing painter’s tape to achieve clean paint edges without tearing the fresh paint film?',
        options: [
          'Stretch the tape tightly around corners and rip it straight upward two weeks later',
          'Apply tape in manageable sections onto a clean, dry surface, press the edge firmly to seal it, and pull it back gently at a 45-degree angle while the paint is still damp/wet',
          'Apply tape over dusty baseboards without pressing the edge down',
          'Paint underneath the tape adhesive side first'
        ],
        correctIndex: 1,
        explanation:
          'Pressing the tape edge firmly on a clean surface prevents bleed-under, and removing the tape back onto itself at a 45-degree angle before the paint cures into a brittle skin prevents bridging and peeling.'
      }
    }
  },

  // ─── CATEGORY 4: PLUMBING (2 Beginner Lessons) ───────────────────────────
  {
    id: 'lbd_plumbing_water_shutoff_7',
    lessonNumber: 7,
    videoLabel: 'Video 7: How to Shut-Off Your Water',
    title: 'Plumbing Basics: Emergency Main Water Shutoff',
    category: 'Plumbing',
    enclaveId: 'trades_construction',
    professionId: 'plumber',
    level: 'Beginner',
    originalCreator: 'Roto-Rooter',
    creatorDomain: 'rotorooter.com',
    description:
      'Recognize the household main water shutoff and understand its role when a plumbing emergency occurs.',
    skillsCovered: [
      'Main Water Shutoff Valve Identification',
      'Fixture Stop Valves vs. Main Valve',
      'Ball Valve (Quarter-Turn) vs. Gate Valve Operation',
      'Plumbing Flooding Emergency Response'
    ],
    sourceVideoUrl:
      'https://www.rotorooter.com/plumbing-videos/flooding/how-to-shut-off-your-water/',
    referenceArticleUrl:
      'https://www.rotorooter.com/plumbing-videos/flooding/how-to-shut-off-your-water/',
    youtubeId: 'fFMBzVv-5Zs',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/fFMBzVv-5Zs/hqdefault.jpg',
    practiceActivity:
      'Locate the main water shutoff valve in a home or building, identify whether it uses a wheel handle (gate valve) or lever handle (ball valve), and document the shutoff direction.',
    practiceDeliverablePrompt:
      'Describe the exact location of the main water shutoff valve, the valve handle type, and the steps to stop water flow during a plumbing leak or emergency.',
    knowledgeCheck: {
      question:
        'Why is it critical to know the location and operation of the household main water shutoff valve before a plumbing emergency happens?',
      options: [
        'Shutting off the main water valve immediately stops pressurized water supply to the entire building when a pipe bursts or a fixture valve fails, preventing severe flooding damage',
        'The main water shutoff valve only controls hot water to the kitchen dishwasher',
        'Turning the main water valve clockwise increases municipal water pressure',
        'You only need the main shutoff valve when painting interior bedroom walls'
      ],
      correctIndex: 0,
      explanation:
        'While individual fixture stop valves isolate a single sink or toilet, the main water shutoff valve cuts pressurized flow to the entire household plumbing system during a burst pipe or major leak.'
    },
    detailedStudyNotes: [
      'Fixture Angle Stops vs. Main House Shut-Off: Individual sinks and toilets have local stop valves underneath, but a burst supply pipe requires closing the building’s main water shut-off valve.',
      'Common Main Valve Locations: Look where the municipal water line enters the home—typically in the basement along the front foundation wall, inside a utility closet, near the water heater, or in an exterior underground meter box.',
      'Ball Valve (Lever) vs. Gate Valve (Wheel): A quarter-turn ball valve closes by rotating the straight lever 90° so it sits perpendicular to the pipe; a round wheel gate valve closes by turning clockwise ("righty-tighty") until snug.',
      'Relieving Residual Pipe Pressure: After closing the main shut-off valve, open the lowest faucet in the building to drain standing water and relieve line pressure.'
    ],
    fieldTip: 'Attach a bright high-visibility tag to the main water shut-off valve today so anyone in the household or shop can locate and close it within seconds during a leak.'
  },
  {
    id: 'lbd_plumbing_pipe_fittings_8',
    lessonNumber: 8,
    videoLabel: 'Video 8: Types of Pipe Fittings',
    title: 'Plumbing Basics: Types of Pipe Fittings & Terminology',
    category: 'Plumbing',
    enclaveId: 'trades_construction',
    professionId: 'plumber',
    level: 'Beginner',
    originalCreator: 'The Home Depot',
    creatorDomain: 'videos.homedepot.com',
    description:
      'Become familiar with common pipe fittings and plumbing terminology.',
    skillsCovered: [
      'Elbows (90° & 45° Direction Changes)',
      'Tees, Wyes & Cross Fittings',
      'Couplings, Reducers & Adapters',
      'Caps, Plugs & Union Terminology'
    ],
    sourceVideoUrl:
      'https://videos.homedepot.com/detail/video/6049169514001/types-of-pipe-fittings',
    referenceArticleUrl:
      'https://videos.homedepot.com/detail/video/6049169514001/types-of-pipe-fittings',
    youtubeId: 'FM2j9zy_s18',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/FM2j9zy_s18/hqdefault.jpg',
    practiceActivity:
      'Identify three common pipe fittings (such as an elbow, tee, coupling, or reducer) and explain how each is used in a plumbing run.',
    practiceDeliverablePrompt:
      'List three pipe fittings, their connection types (e.g., slip, threaded, compression, or push-to-connect), and the plumbing layout task each performs.',
    knowledgeCheck: {
      question:
        'In standard plumbing terminology, which pipe fitting is used to join two straight pipes of the same diameter in a continuous line versus branching a line into three directions?',
      options: [
        'A coupling joins two straight pipes in line, while a tee fitting connects three pipe sections at a 90-degree branch',
        'A cap joins two pipes together, while an elbow seals the end of a pipe',
        'A plug branches three pipes, while a tee blocks water flow',
        'All pipe fittings have the exact same shape and angle'
      ],
      correctIndex: 0,
      explanation:
        'A coupling connects two straight pipe sections of the same size in a continuous run, whereas a T-shaped tee fitting combines or splits fluid flow across three ports.'
    },
    detailedStudyNotes: [
      'Elbows (90° & 45° Sweeps): Change the direction of a pipe run around corners or framing obstacles; street elbows have one male (spigot) end and one female (hub) end to save space.',
      'Tees & Wyes: Tee fittings branch a supply line at 90° across three ports; Wye (Y) fittings enter at 45° to keep drainage waste flowing smoothly without clogging.',
      'Couplings, Reducers & Bushings: Couplings join two straight pipes of equal diameter; reducers and bushings transition cleanly between larger and smaller pipe diameters.',
      'Adapters, Unions, Caps & Plugs: Male/female adapters transition between smooth slip/solder pipe and threaded NPT ends; caps fit over pipe ends while plugs thread inside fittings.'
    ],
    fieldTip: 'Match both nominal pipe size (ID/OD schedule) and material compatibility (Copper, PEX, CPVC, PVC, or Brass) before assembling any fitting.'
  },

  // ─── CATEGORY 5: ELECTRICAL FUNDAMENTALS ─────────────────────────────────
  {
    id: 'lbd_electrical_multimeter_9',
    lessonNumber: 9,
    videoLabel: 'Video 9: How to Use a Multimeter',
    title: 'Electrical Fundamentals: Measuring Voltage, Resistance, Current & Continuity',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'DigiKey / Becky Stern',
    creatorDomain: 'digikey.com',
    description:
      'Understand the meter’s functions for voltage, resistance, current, and continuity checks.',
    skillsCovered: [
      'DC & AC Voltage Measurement',
      'Continuity Testing (Audible Beep Check)',
      'Resistance (Ohms Ω) Measurement',
      'Series Current (Amps) & Probe Port Safety'
    ],
    sourceVideoUrl:
      'https://www.digikey.com/en/videos/d/digi-key-electronics/how-to-use-a-multimeter-electronics-with-becky-stern-digikey',
    referenceArticleUrl:
      'https://www.digikey.com/en/videos/d/digi-key-electronics/how-to-use-a-multimeter-electronics-with-becky-stern-digikey',
    youtubeId: 'DLO1LMjQN34',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/DLO1LMjQN34/hqdefault.jpg',
    practiceActivity:
      'Perform a probe touch continuity check on a multimeter, measure the voltage of a common household battery (e.g., AA or 9V), and record your dial setting and reading.',
    practiceDeliverablePrompt:
      'Write down which port the black (COM) and red leads are plugged into, the dial symbol selected, and the voltage/continuity readings you observed.',
    knowledgeCheck: {
      question:
        'When performing a continuity check or measuring resistance (Ohms Ω) with a digital multimeter, what condition must the circuit be in?',
      options: [
        'The circuit must be powered OFF (de-energized) so external circuit voltage does not skew the meter’s internal test signal or damage the meter',
        'The circuit must be connected to live high-voltage AC power while the probes are in the 10A current jack',
        'Both test probes must be unplugged from the multimeter',
        'You must touch both probes to the same single point on an insulator'
      ],
      correctIndex: 0,
      explanation:
        'Resistance and continuity modes send a small internal test current from the multimeter through the component; testing resistance or continuity on a live, energized circuit gives false readings and can blow the meter fuse.'
    },
    detailedStudyNotes: [
      'Probe Lead Port Setup: Plug the black test lead into the COM (Common) jack and the red test lead into the VΩmA jack for voltage, resistance, and continuity checks.',
      'Measuring DC & AC Voltage (Parallel Test): Select V⎓ (DC) for batteries/electronics or V~ (AC) for household power and touch probes across (in parallel with) the two test points.',
      'Continuity & Resistance (De-Energized Only): Power OFF the circuit, select the sound-wave continuity symbol or Ω (Ohms), and touch probes across a wire, switch, or fuse—an audible beep confirms an unbroken path.',
      'Measuring Current (Series Test): Current (Amps) requires breaking the circuit so current flows in series through the meter; never place probes across a voltage source while plugged into the Amps jack.'
    ],
    fieldTip: 'Touch the two probe tips together in Continuity mode before every diagnostic session to verify your test leads and internal meter fuse are intact.'
  },

  // ─── CATEGORY 6: WELDING (2 Beginner Lessons) ────────────────────────────
  {
    id: 'lbd_welding_basics_miller_10',
    lessonNumber: 10,
    videoLabel: 'Video 10: Welding Basics for Beginners',
    title: 'Welding Basics: Comparing MIG, Stick & TIG Welding',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Beginner',
    originalCreator: 'Miller Welders',
    creatorDomain: 'youtube.com',
    description:
      'Compare MIG, stick, and TIG welding and the applications discussed in the introduction.',
    skillsCovered: [
      'MIG (GMAW) Wire-Feed Welding',
      'Stick (SMAW) Outdoor & Structural Welding',
      'TIG (GTAW) Precision Thin-Metal Welding',
      'Process & Application Selection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=OWThL97tq3k',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=OWThL97tq3k',
    youtubeId: 'OWThL97tq3k',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/OWThL97tq3k/hqdefault.jpg',
    practiceActivity:
      'Compare MIG, stick, and TIG welding in your practice notes and identify which process suits indoor sheet-metal fabrication, outdoor structural steel repair, and precision stainless or aluminum work.',
    practiceDeliverablePrompt:
      'Summarize the differences between MIG, Stick, and TIG welding and match each process to its primary application discussed in the video.',
    knowledgeCheck: {
      question:
        'When comparing MIG, Stick, and TIG welding for beginner applications, which process uses a flux-coated consumable electrode that works well outdoors in windy or dirty conditions without external shielding gas?',
      options: [
        'Stick welding (SMAW)',
        'TIG welding (GTAW) with pure argon gas',
        'Plastic hot-air welding',
        'Ultrasonic spot soldering'
      ],
      correctIndex: 0,
      explanation:
        'Stick welding (Shielded Metal Arc Welding) uses a flux-coated electrode that generates its own protective gas shield and slag as it melts, making it ideal for outdoor, windy, or thicker structural steel applications.'
    },
    detailedStudyNotes: [
      'MIG Welding (GMAW — Wire Feed + Shielding Gas): Feeds continuous solid wire through a trigger gun with shielding gas; easiest for beginners to learn and ideal for clean indoor fabrication, auto body, and mild steel.',
      'Stick Welding (SMAW — Flux-Coated Electrode): Uses a consumable flux-coated rod without an external gas cylinder; performs reliably outdoors in wind, on rusty/painted structural steel, and heavy repair jobs.',
      'TIG Welding (GTAW — Non-Consumable Tungsten + Filler Rod): Uses a sharp tungsten electrode, foot/finger amperage control, and hand-fed filler rod with pure argon for surgical precision on thin stainless steel, aluminum, and chromoly.',
      'Matching Process to Metal Thickness & Environment: Choose MIG for high-productivity shop work, Stick for outdoor/field structural work, and TIG for cosmetic, thin-gauge, or non-ferrous metals.'
    ],
    fieldTip: 'Clean base metal to bright shiny steel before MIG or TIG welding—mill scale, oil, and rust cause porosity and weak weld penetration.'
  },
  {
    id: 'lbd_welding_safety_cwb_11',
    lessonNumber: 11,
    videoLabel: 'Video 11: Electric Welding Safety',
    title: 'Welding Safety: Protective Equipment, Bystander Shielding & Work Area Prep',
    category: 'Welding',
    enclaveId: 'trades_construction',
    professionId: 'welder',
    level: 'Beginner',
    originalCreator: 'Way of the Wrench, featured by CWB Group',
    creatorDomain: 'cwbgroup.org',
    description:
      'Learn about protective equipment, protecting nearby people, and preparing the work area.',
    skillsCovered: [
      'Welding Helmet Shade & Flame-Resistant PPE',
      'Welding Curtains & Protecting Nearby People',
      'Removing Flammables & Work Area Preparation',
      'Fume Ventilation & Electrical Ground Safety'
    ],
    sourceVideoUrl:
      'https://www.cwbgroup.org/resources/videos/electric-welding-safety-how-to-be-safe',
    referenceArticleUrl:
      'https://www.cwbgroup.org/resources/videos/electric-welding-safety-how-to-be-safe',
    youtubeId: 'A14OejQiDvQ',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/A14OejQiDvQ/hqdefault.jpg',
    practiceActivity:
      'Create a pre-weld safety inspection checklist covering personal protective equipment (PPE), welding screens to protect nearby people, ventilation, and clearing flammable materials from the work area.',
    practiceDeliverablePrompt:
      'List your pre-weld PPE items, how you shield bystanders from UV/IR arc rays and sparks, and how you prepare the work zone before striking an arc.',
    knowledgeCheck: {
      question:
        'In addition to wearing proper personal protective equipment (welding helmet, flame-resistant clothing, and leather gauntlets), what must a welder do to protect nearby people and prepare the work area?',
      options: [
        'Erect UV-filtering welding screens/curtains to shield bystanders from arc flash, clear flammable materials from the spark zone, and ensure adequate fume ventilation',
        'Leave solvent containers open next to the welding table to cool sparks',
        'Ask nearby coworkers to look directly at the arc without eye protection',
        'Weld on wet floors with frayed electrode cables'
      ],
      correctIndex: 0,
      explanation:
        'Safe electric welding requires full operator PPE, UV/spark curtains or screens to protect nearby workers from arc eye, proper fume extraction/ventilation, and clearing all combustibles from the work area.'
    },
    detailedStudyNotes: [
      'Head-to-Toe Flame-Resistant PPE: Wear an auto-darkening welding helmet (Shade 9–13), ANSI Z87.1 safety glasses underneath, flame-resistant cotton/leather jacket, gauntlet leather gloves, and high-top leather boots.',
      'Protecting Nearby People & Bystanders: Position UV-filtering welding curtains/screens around the booth, warn coworkers before striking an arc ("Cover!"), and prevent bystander arc-eye flash.',
      'Preparing the Work Area & Fire Prevention: Remove all flammable liquids, rags, paper, and butane lighters within a 35-foot spark radius, and keep a rated ABC fire extinguisher within immediate reach.',
      'Electrical & Fume Safety: Inspect leads and ground clamp insulation, keep floor dry, position fume extraction or cross-ventilation to keep your breathing zone clear of weld plume.'
    ],
    fieldTip: 'Never wear synthetic fabrics (polyester/nylon) or cuffed pants when welding—sparks melt synthetics onto skin and can lodge inside pant cuffs.'
  },

  // ─── CATEGORY 7: HVAC (2 Beginner Lessons) ───────────────────────────────
  {
    id: 'lbd_hvac_furnace_filter_12',
    lessonNumber: 12,
    videoLabel: 'Video 12: How to Change a Furnace Filter',
    title: 'HVAC Maintenance: Locating & Changing a Furnace Filter',
    category: 'HVAC',
    enclaveId: 'trades_construction',
    professionId: 'hvac_refrigeration_tech',
    level: 'Beginner',
    originalCreator: 'Trane',
    creatorDomain: 'trane.com',
    description:
      'Understand filter location and the demonstrated replacement task.',
    skillsCovered: [
      'Furnace Filter Compartment Location',
      'Airflow Direction Arrow Alignment',
      'Filter Dimensions & Replacement Steps',
      'Blower Protection & Airflow Efficiency'
    ],
    sourceVideoUrl:
      'https://www.trane.com/residential/how-to-change-a-furnace-filter-video/',
    referenceArticleUrl:
      'https://www.trane.com/residential/how-to-change-a-furnace-filter-video/',
    youtubeId: 'uKneslTwJdY',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/uKneslTwJdY/hqdefault.jpg',
    practiceActivity:
      'Locate the air filter on a residential furnace or air handler, record its printed dimensions (length × width × depth), and note the direction the airflow arrow must point when sliding the new filter in.',
    practiceDeliverablePrompt:
      'Record the furnace filter dimensions, where the filter rack is located, and which way the airflow arrow points relative to the blower motor.',
    knowledgeCheck: {
      question:
        'When sliding a replacement air filter into a furnace return slot, which direction must the printed airflow arrow on the filter frame point?',
      options: [
        'Pointing toward the furnace / blower motor (in the direction of the moving return air stream)',
        'Pointing backward into the living room return grille against the airflow',
        'Pointing straight up through the roof regardless of ductwork layout',
        'The arrow only applies if the filter is installed outdoors'
      ],
      correctIndex: 0,
      explanation:
        'The airflow arrow on a furnace filter frame indicates the structurally reinforced side of the filter media and must always point in the direction of air travel—from the return duct toward the furnace blower.'
    },
    detailedStudyNotes: [
      'Power Down the Furnace First: Switch the thermostat to OFF and flip the furnace service disconnect switch off so the blower fan does not pull dust in while the filter slot is open.',
      'Locate the Filter Rack & Read Dimensions: Find the filter slot between the return-air drop duct and the furnace blower cabinet, slide out the old filter, and note the nominal size printed on the frame (e.g., 16×25×1).',
      'Orient the Airflow Arrow Toward the Furnace: Locate the printed "AIRFLOW →" arrow on the new filter’s cardboard frame and point the arrow toward the blower motor/furnace cabinet.',
      'Close the Access Cover & Restore Power: Slide the new filter smoothly into the track, refit the filter door to prevent unfiltered basement air bypass, and turn the furnace switch back on.'
    ],
    fieldTip: 'Write the installation date on the cardboard edge of the new filter with a permanent marker so anyone inspecting the unit knows exactly when it was last changed.'
  },
  {
    id: 'lbd_hvac_refrigeration_cycle_13',
    lessonNumber: 13,
    videoLabel: 'Video 13: Refrigeration Cycle 101',
    title: 'HVAC Fundamentals: The 4 Core Components of the Refrigeration Cycle',
    category: 'HVAC',
    enclaveId: 'trades_construction',
    professionId: 'hvac_refrigeration_tech',
    level: 'Beginner',
    originalCreator: 'HVAC School / Bryan Orr',
    creatorDomain: 'hvacrschool.com',
    description:
      'Identify the compressor, condenser, metering device, and evaporator and understand their basic roles.',
    skillsCovered: [
      'Compressor (Vapor Pump & Pressure Increase)',
      'Condenser Coil (Heat Rejection to Outdoor Air)',
      'Metering Device / TXV (Pressure & Temperature Drop)',
      'Evaporator Coil (Indoor Heat Absorption)'
    ],
    sourceVideoUrl: 'https://www.hvacrschool.com/videos/refrigeration-cycle-101/',
    referenceArticleUrl: 'https://www.hvacrschool.com/videos/refrigeration-cycle-101/',
    youtubeId: 'VJX0LyxRV0E',
    embedAvailable: true,
    duration: '', // Unverified duration intentionally left blank
    thumbnailUrl: 'https://i.ytimg.com/vi/VJX0LyxRV0E/hqdefault.jpg',
    practiceActivity:
      'List the four core components of the vapor-compression refrigeration cycle in sequence and write one sentence explaining the role of each component.',
    practiceDeliverablePrompt:
      'Write out the roles of the Compressor, Condenser, Metering Device, and Evaporator in moving heat from inside a building to the outside.',
    knowledgeCheck: {
      question:
        'In the basic four-component refrigeration cycle, what are the respective roles of the evaporator coil and the condenser coil?',
      options: [
        'The evaporator absorbs heat from the indoor air as low-pressure refrigerant boils into vapor, while the condenser rejects heat to the outdoor air as high-pressure vapor condenses into liquid',
        'The evaporator compresses high-pressure gas, while the condenser meters liquid pressure down',
        'Both the evaporator and condenser only filter dust without changing refrigerant state',
        'The condenser cools indoor air directly while the compressor sits inside the thermostat'
      ],
      correctIndex: 0,
      explanation:
        'In the refrigeration cycle, the compressor pumps high-temperature vapor to the condenser (which rejects heat and condenses refrigerant to liquid), the metering device drops its pressure/temperature, and the evaporator absorbs indoor heat as the refrigerant boils back into vapor.'
    },
    detailedStudyNotes: [
      '1. Compressor (The Heart / Vapor Pump): Takes in low-pressure, low-temperature superheated refrigerant vapor from the suction line and compresses it into high-pressure, high-temperature vapor.',
      '2. Condenser Coil (Outdoor Heat Rejection): Hot high-pressure vapor flows through the outdoor condenser coil where outdoor fan air removes heat, condensing the refrigerant into a warm high-pressure subcooled liquid.',
      '3. Metering Device / TXV (Pressure Drop): The high-pressure liquid passes through a restriction (piston, capillary tube, or Thermostatic Expansion Valve), causing a sharp drop in pressure and boiling temperature.',
      '4. Evaporator Coil (Indoor Heat Absorption): Cold low-pressure liquid/vapor mixture enters the indoor evaporator coil, absorbs heat from indoor room air blowing across the fins, boils completely into vapor, and returns to the compressor.'
    ],
    fieldTip: 'Remember the dividing line of the refrigeration loop: the Compressor and Metering Device separate the High-Pressure (Condensing) side from the Low-Pressure (Evaporating) side.'
  },
  // ─── INTERNATIONAL MULTI-LANGUAGE MASTERCLASSES (Interpreted Across All 46 Languages) ───
  {
    id: 'lbd_intl_es_carpentry_speedsquare_14',
    lessonNumber: 14,
    videoLabel: 'Global Training (Español): Escuadra Rápida en Carpintería',
    title: 'Escuadra Rápida y Funciones de Trazado (Spanish Carpentry Masterclass)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'Taller de Ideas de Erick · Red SENA / Formación Técnica',
    creatorDomain: 'tallerdeideas.com',
    sourceLanguage: 'es',
    sourceLanguageLabel: '🇪🇸 Español',
    description:
      'Authentic Spanish-language carpentry training demonstrating how master Latin American woodworkers use the speed square (escuadra rápida) as a saw guide, protractor, and layout tool—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Speed Square Saw-Guide Fence (Guía de Corte)',
      '90° & 45° Layout Scribing (Trazado de Ángulos)',
      'Rafter Pitch & Pivot Marking (Uso del Pivote)',
      'Cross-Language Technical Terminology'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=vLBRNuzVTHg',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=vLBRNuzVTHg',
    youtubeId: 'vLBRNuzVTHg',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/vLBRNuzVTHg/hqdefault.jpg',
    practiceActivity:
      'Follow the Spanish masterclass with live Noctis audio interpretation in your preferred language to scribe a 90° crosscut and guide a circular saw base along the speed square fence.',
    practiceDeliverablePrompt:
      'Record your key takeaway from the Spanish carpentry demonstration and how the speed square lip acts as a straight-edge track.',
    knowledgeCheck: {
      question:
        'In this Spanish carpentry training, how does the speed square ("escuadra rápida") double as a circular saw guide?',
      options: [
        'By pressing the T-bar fence tightly against the board edge and running the circular saw baseplate flush along the 90° body edge',
        'By removing the fence lip from the square',
        'By placing the square underneath the board while cutting',
        'Speed squares can only be used on drywall'
      ],
      correctIndex: 0,
      explanation:
        'When the speed square fence is held firmly against the lumber edge, its thick aluminum 90° edge serves as a rigid straight-edge fence for a circular saw shoe.'
    },
    detailedStudyNotes: [
      'Guía de Corte Recto (Straight Saw Guide): Hold the T-fence flush against the board edge so your circular saw baseplate rides smoothly along the square for a dead-square 90° cut.',
      'Transportador de Ángulos (Angle Protractor): Anchor the corner pivot pin ("pivote") and rotate the square until the desired degree graduation aligns with the board edge.',
      'Trazado Paralelo (Parallel Ripping Marks): Use the notched slots inside the triangle cutout to hold your pencil tip and slide the square along the board edge for parallel rip lines.'
    ],
    fieldTip: 'Global Trade Insight: Knowing both English ("Speed Square / Rafter Square") and Spanish ("Escuadra Rápida") terms improves safety and coordination on multilingual jobsites.'
  },
  {
    id: 'lbd_intl_fr_carpentry_joinery_15',
    lessonNumber: 15,
    videoLabel: 'Global Training (Français): Assemblages d’Ébénisterie',
    title: '8 Techniques d’Assemblage du Bois (French Cabinetry & Joinery)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'finish_carpenter',
    level: 'Beginner',
    originalCreator: 'Astuces Design · Compagnons & Ébénisterie France',
    creatorDomain: 'astucesdesign.com',
    sourceLanguage: 'fr',
    sourceLanguageLabel: '🇫🇷 Français',
    description:
      'French woodworking and cabinetmaking ("ébénisterie") training covering 8 core wood joinery techniques—including mortise-and-tenon, dowel, biscuit, and half-lap joints—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'French Cabinetmaking Joinery (Assemblages Bois)',
      'Half-Lap & Miter Joints (Mi-Bois & Coupe d’Onglet)',
      'Dowel & Domino Alignment (Tourillons & Lamello)',
      'Mortise & Tenon Structural Strength (Tenon et Mortaise)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=eSXgnV8WKw8',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=eSXgnV8WKw8',
    youtubeId: 'eSXgnV8WKw8',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/eSXgnV8WKw8/hqdefault.jpg',
    practiceActivity:
      'Compare two of the 8 French joinery methods (such as half-lap vs. dowel joinery) and select which fits a cabinet frame.',
    practiceDeliverablePrompt:
      'Note which French wood joinery method from the video provides the best alignment and glue surface area for your project.',
    knowledgeCheck: {
      question:
        'Why do French cabinetmakers ("ébénistes") reinforce butt or miter joints with dowels ("tourillons"), biscuits ("lamellos"), or tenons?',
      options: [
        'End-grain glue joints alone are weak; internal splines, dowels, or tenons add long-grain glue surface and mechanical shear resistance',
        'Dowels are only used so you do not have to measure the wood',
        'Glue is never used in woodworking',
        'Miter joints cannot be clamped'
      ],
      correctIndex: 0,
      explanation:
        'End grain absorbs glue rapidly and forms a brittle bond; adding dowels, biscuits, or mortise-and-tenon joinery introduces strong long-grain-to-long-grain bonding and mechanical registration.'
    }
  },
  {
    id: 'lbd_intl_ja_carpentry_joinery_16',
    lessonNumber: 16,
    videoLabel: 'Global Training (日本語): 日本建築の継手と仕口',
    title: '継手と仕口の違い｜木造の組み方の基本 (Japanese Timber Joinery)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: '建築現場の教科書 · Japanese Timber Craft Portal',
    creatorDomain: 'kenchiku-genba.jp',
    sourceLanguage: 'ja',
    sourceLanguageLabel: '🇯🇵 日本語',
    description:
      'Japanese architectural carpentry training explaining the fundamental difference between "Tsugite" (継手 — lengthening splice joints) and "Shikuchi" (仕口 — angled intersection joints) in traditional timber framing, with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Tsugite Timber Splicing (継手 · Longitudinal Beam Splices)',
      'Shikuchi Angled Framing Joints (仕口 · Post-to-Beam Intersections)',
      'Interlocking Load Transfer Without Fasteners',
      'Precision Marking & Chisel Layout'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=4iGL2mh2Qf4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=4iGL2mh2Qf4',
    youtubeId: '4iGL2mh2Qf4',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/4iGL2mh2Qf4/hqdefault.jpg',
    practiceActivity:
      'Listen to the Noctis interpretation of this Japanese timber framing lesson and sketch the difference between a longitudinal splice (Tsugite) and a right-angle corner joint (Shikuchi).',
    practiceDeliverablePrompt:
      'Explain in your own words the difference between Tsugite (継手) and Shikuchi (仕口) from the Japanese masterclass.',
    knowledgeCheck: {
      question:
        'In Japanese timber framing, what is the distinction between "Tsugite" (継手) and "Shikuchi" (仕口)?',
      options: [
        'Tsugite joins two timbers end-to-end in the same direction to lengthen a beam/post, while Shikuchi joins two timbers at an angle (such as a post meeting a beam)',
        'Tsugite is a type of paint, while Shikuchi is a saw blade',
        'Both terms refer only to concrete foundations',
        'Shikuchi only applies to plumbing pipes'
      ],
      correctIndex: 0,
      explanation:
        'In Japanese carpentry, Tsugite (継手) splices timbers longitudinally along the same axis, whereas Shikuchi (仕口) connects members intersecting at an angle (such as column-to-beam connections).'
    }
  },
  {
    id: 'lbd_intl_pt_carpentry_marcenaria_17',
    lessonNumber: 17,
    videoLabel: 'Global Training (Português): Ferramentas de Marcenaria',
    title: 'Ferramentas Essenciais para Começar na Marcenaria (Portuguese Workshop Guide)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'Oficina Empoeirados · SENAI / Marcenaria Brasil',
    creatorDomain: 'empoeirados.com.br',
    sourceLanguage: 'pt',
    sourceLanguageLabel: '🇧🇷 Português',
    description:
      'Brazilian Portuguese woodworking ("marcenaria") workshop guide introducing the essential hand and power tools for accurate measuring, clamping, sawing, and finishing—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Measuring & Layout Tools (Esquadro, Trena e Graminho)',
      'Hand Saws & Chisels (Serrote Japonês e Formões)',
      'Clamping & Workholding (Grampos e Sargentos)',
      'Workshop Safety & Dust Control (EPIs)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=HoaKf6pQQgw',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=HoaKf6pQQgw',
    youtubeId: 'HoaKf6pQQgw',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/HoaKf6pQQgw/hqdefault.jpg',
    practiceActivity:
      'Watch the Portuguese workshop guide with live Noctis interpretation and list the 5 foundational layout and clamping tools recommended before buying large stationary machines.',
    practiceDeliverablePrompt:
      'List the starter woodworking tools highlighted in the Portuguese session and why precision measuring tools come first.',
    knowledgeCheck: {
      question:
        'According to the Brazilian woodworking ("marcenaria") training, why should a beginner invest in quality measuring squares and clamps before expensive stationary machinery?',
      options: [
        'Because accurate layout markings and rigid clamping determine whether joints fit squarely, regardless of which saw cuts the wood',
        'Because clamps can cut wood without a saw',
        'Because measuring tools never need to be checked',
        'Stationary machines do not require layout lines'
      ],
      correctIndex: 0,
      explanation:
        'Accurate layout tools (squares, marking gauges, tape measures) and reliable clamps ("grampos/sargentos") are the foundation of clean joinery and safe cutting.'
    }
  },
  {
    id: 'lbd_intl_sw_carpentry_veta_18',
    lessonNumber: 18,
    videoLabel: 'Global Training (Kiswahili): Mafunzo ya Ufundi Seremala (VETA)',
    title: 'Fani ya Ufundi Seremala na Ukaguzi wa Mbao (East African VETA Carpentry)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'VETA Tanzania · Vocational Education & Training Authority',
    creatorDomain: 'veta.go.tz',
    sourceLanguage: 'sw',
    sourceLanguageLabel: '🇹🇿 Kiswahili',
    description:
      'Official East African Vocational Education and Training Authority (VETA) Kiswahili training on hardwood selection, timber planing, mortising, and furniture assembly—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Hardwood Timber Inspection & Seasoning (Ukaguzi wa Mbao)',
      'Workshop Planing & Thicknessing (Urandaji wa Mbao)',
      'Mortise & Tenon Frame Assembly (Uunganishaji wa Samani)',
      'Vocational Workshop Safety Standards (Usalama Karakana)'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=plet8C6DtN0',
    referenceArticleUrl: 'https://www.veta.go.tz/',
    youtubeId: 'plet8C6DtN0',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/plet8C6DtN0/hqdefault.jpg',
    practiceActivity:
      'Listen to the Kiswahili VETA vocational briefing in your preferred language and identify the steps used to prepare rough-sawn hardwood into square, planed furniture stock.',
    practiceDeliverablePrompt:
      'Summarize the timber preparation and joint-fitting steps taught in the VETA Kiswahili carpentry lesson.',
    knowledgeCheck: {
      question:
        'In the VETA Kiswahili vocational carpentry training, what must be verified on rough timber before cutting joinery?',
      options: [
        'That the timber is properly seasoned/dry and planed flat and square on its reference face and edge',
        'That the wood is soaked in water immediately before gluing',
        'That knots are placed directly inside thin tenons',
        'That measurements are estimated by eye without a rule'
      ],
      correctIndex: 0,
      explanation:
        'Preparing a flat reference face and square reference edge on properly seasoned timber ensures that all layout lines and joints remain true without warping.'
    }
  },
  {
    id: 'lbd_intl_fr_plumbing_copper_19',
    lessonNumber: 19,
    videoLabel: 'Global Training (Français): Brasure Cuivre en Plomberie',
    title: 'Brasure Cuivre : Réaliser une Bonne Brasure Sans Fuite (French Plumbing)',
    category: 'Plumbing',
    enclaveId: 'trades_construction',
    professionId: 'plumber',
    level: 'Beginner',
    originalCreator: 'Mister MALLEKH · Génie Climatique & Plomberie France',
    creatorDomain: 'afpa.fr',
    sourceLanguage: 'fr',
    sourceLanguageLabel: '🇫🇷 Français',
    description:
      'French plumbing and thermal engineering ("plomberie / génie climatique") demonstration on copper pipe deburring, flux application, flame control, and capillary brazing ("brasure cuivre")—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Copper Tube Cutting & Deburring (Coupe et Ébavurage)',
      'Mechanical Abrasion & Fluxing (Décapage et Flux)',
      'Even Torch Heating & Capillary Action (Chauffe et Capillarité)',
      'Avoiding Overheating & Cold Joints'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=b2jdJ3yGdmI',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=b2jdJ3yGdmI',
    youtubeId: 'b2jdJ3yGdmI',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/b2jdJ3yGdmI/hqdefault.jpg',
    practiceActivity:
      'Watch the French copper brazing tutorial with live Noctis interpretation and write down the 4 preparation steps required before lighting the torch.',
    practiceDeliverablePrompt:
      'List the critical copper pipe cleaning, fluxing, and heating rules explained in the French plumbing lesson.',
    knowledgeCheck: {
      question:
        'In the French copper brazing ("brasure cuivre") lesson, why should the torch flame heat the copper fitting socket rather than melting the filler rod directly in the flame?',
      options: [
        'Heating the copper tube and fitting evenly draws the molten filler alloy into the joint gap by capillary action for a leak-free seal',
        'Because filler rod only melts when dipped in cold water',
        'So the flux burns into black carbon before the rod touches the pipe',
        'Copper fittings do not need to be cleaned before brazing'
      ],
      correctIndex: 0,
      explanation:
        'Capillary brazing relies on the heated copper tube and fitting socket reaching brazing temperature so the filler metal is drawn uniformly throughout the entire socket.'
    }
  },
  {
    id: 'lbd_intl_es_electrical_20',
    lessonNumber: 20,
    videoLabel: 'Global Training (Español): Curso de Electricidad Básica',
    title: 'Curso de Electricidad Residencial Desde Cero (Spanish Electrical Portal)',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'Universo Eléctrico · Instituto Técnico de Electricidad',
    creatorDomain: 'universoelectrico.com',
    sourceLanguage: 'es',
    sourceLanguageLabel: '🇪🇸 Español',
    description:
      'Spanish residential electrical engineering lesson covering phase (fase), neutral (neutro), protective earth ground (tierra física), thermomagnetic circuit breakers, and safe wiring schematics—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Phase, Neutral & Earth Ground Identification (Fase, Neutro y Tierra)',
      'Thermomagnetic Breaker Protection (Interruptor Termomagnético)',
      'Residual Current / GFCI Safety (Interruptor Diferencial)',
      'Residential Branch Circuit Wiring'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BhgBXZdHWhU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=BhgBXZdHWhU',
    youtubeId: 'BhgBXZdHWhU',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/BhgBXZdHWhU/hqdefault.jpg',
    practiceActivity:
      'Follow the Spanish electrical briefing in your preferred language and diagram how the main differential switch and thermomagnetic breakers protect lighting and receptacle branch circuits.',
    practiceDeliverablePrompt:
      'Explain the difference between a thermomagnetic breaker ("termomagnético") and a differential/GFCI switch ("diferencial") from the interpreted lesson.',
    knowledgeCheck: {
      question:
        'In this Spanish residential electrical lesson, how do the thermomagnetic breaker ("interruptor termomagnético") and differential switch ("interruptor diferencial") work together?',
      options: [
        'The thermomagnetic breaker protects wires against overloads and short circuits, while the differential switch (RCD/GFCI) protects people from earth-leakage electric shock',
        'Both devices only measure monthly utility billing',
        'The neutral wire is never connected to the load',
        'Protective earth ground is used to carry normal return current instead of neutral'
      ],
      correctIndex: 0,
      explanation:
        'Thermomagnetic breakers trip on thermal overload or magnetic short-circuit current, while differential (RCD/GFCI) switches detect current leakage to earth to prevent electrocution.'
    }
  },
  {
    id: 'lbd_intl_ar_electrical_schematics_21',
    lessonNumber: 21,
    videoLabel: 'Global Training (العربية): شرح مخططات أنظمة الكهرباء',
    title: 'شرح مخططات جميع أنظمة الكهرباء (Arabic Electrical Distribution Schematics)',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'Eng. Haytham Saeid · Arab Electrical Engineering Academy',
    creatorDomain: 'haythamsaeid.com',
    sourceLanguage: 'ar',
    sourceLanguageLabel: '🇪🇬 العربية',
    description:
      'Comprehensive Arabic electrical engineering training explaining how to read single-line and three-line power distribution diagrams, panelboard schedules, and earthing layouts—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Reading Single-Line Diagrams (المخططات الأحادية)',
      'Distribution Panelboard Load Balancing',
      'Circuit Breaker Sizing & Cable Cross-Sections',
      'Protective Earthing & Bonding Schematics'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=UcqnZnFnz8I',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=UcqnZnFnz8I',
    youtubeId: 'UcqnZnFnz8I',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/UcqnZnFnz8I/hqdefault.jpg',
    practiceActivity:
      'Listen to the Arabic electrical schematics briefing in your preferred language and trace the path from the incoming main breaker through the busbars to individual branch loads.',
    practiceDeliverablePrompt:
      'Describe how single-line schematics indicate breaker amperage ratings and cable conductor sizes as explained in the Arabic lesson.',
    knowledgeCheck: {
      question:
        'When reading an architectural or industrial electrical schematic, why must cable cross-sectional area (mm² or AWG) always be matched to the circuit breaker rating?',
      options: [
        'So the circuit breaker trips before the cable insulation overheats under sustained overload current',
        'Because thicker cables decrease voltage to zero',
        'Circuit breakers are chosen only by the color of the wall',
        'Schematics do not specify conductor sizes'
      ],
      correctIndex: 0,
      explanation:
        'Coordinating conductor ampacity (cross-sectional area) with the overcurrent protective device ensures the breaker interrupts excessive current before conductor insulation is damaged.'
    }
  },
  {
    id: 'lbd_intl_it_painting_22',
    lessonNumber: 22,
    videoLabel: 'Global Training (Italiano): Imbiancare con Pennello e Rullo',
    title: 'Imbiancare Pareti con Pennello e Rullo (Italian Decorating Masterclass)',
    category: 'Painting & Decorating',
    enclaveId: 'trades_construction',
    professionId: 'painter_decorator',
    level: 'Beginner',
    originalCreator: 'Leroy Merlin Italia · Scuola del Fai da Te',
    creatorDomain: 'leroymerlin.it',
    sourceLanguage: 'it',
    sourceLanguageLabel: '🇮🇹 Italiano',
    description:
      'Italian architectural painting and decorating tutorial from Leroy Merlin Italia demonstrating when to cut in with an angled brush ("pennello"), roll large wall planes ("rullo"), or spray—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Cutting In Corners & Trim with a Brush (Profilatura a Pennello)',
      'Cross-Rolling Wall Planes Evenly (Stesura a Rullo Incrociata)',
      'Selecting Nap Length by Wall Texture',
      'Masking & Drop-Cloth Surface Protection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=uQsdjJLkqiA',
    referenceArticleUrl: 'https://www.leroymerlin.it/guide/decorare/come-imbiancare-casa-con-il-rullo.html',
    youtubeId: 'uQsdjJLkqiA',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/uQsdjJLkqiA/hqdefault.jpg',
    practiceActivity:
      'Watch the Italian painting guide with live Noctis interpretation and note how cutting in perimeter edges with a brush pairs with cross-rolling the main wall.',
    practiceDeliverablePrompt:
      'Summarize the Italian masterclass rules for combining brush ("pennello") perimeter cutting-in with roller ("rullo") passes.',
    knowledgeCheck: {
      question:
        'In the Leroy Merlin Italia painting tutorial, why do professional decorators cut in corners and perimeter trim with a brush ("pennello") before rolling the wall ("rullo")?',
      options: [
        'A cylindrical roller cannot reach tight inside corners without bumping adjacent walls or trim, so a brush creates a clean border that the roller blends into while wet',
        'Because rollers can only be used on floors',
        'Because brushes dry in 5 seconds',
        'Walls should never be primed before painting'
      ],
      correctIndex: 0,
      explanation:
        'Cutting in corners and edges with a brush first—and immediately rolling into the wet border—produces uniform coverage without lap marks or paint splatters on adjacent ceilings.'
    }
  },
  {
    id: 'lbd_intl_es_hvac_23',
    lessonNumber: 23,
    videoLabel: 'Global Training (Español): Ciclo de Refrigeración HVAC',
    title: 'Cómo Funciona el Ciclo de Refrigeración en Aire Acondicionado (Spanish HVAC)',
    category: 'HVAC',
    enclaveId: 'trades_construction',
    professionId: 'hvac_refrigeration_tech',
    level: 'Beginner',
    originalCreator: 'Electrotec · Instituto Tecnológico de Climatización',
    creatorDomain: 'electrotec.pe',
    sourceLanguage: 'es',
    sourceLanguageLabel: '🇵🇪 Español',
    description:
      'Spanish HVAC and climate engineering lesson from Electrotec visually tracing refrigerant pressure, temperature, phase change, superheat, and subcooling across a split air-conditioning system—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Split-System Refrigerant Flow (Compresor, Condensador, Capilar, Evaporador)',
      'High-Side vs. Low-Side Pressure Gauges (Manómetros de Alta y Baja)',
      'Latent Heat of Vaporization & Condensation',
      'Indoor Blower & Outdoor Condenser Airflow'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=W8GEdpDWSIQ',
    referenceArticleUrl: 'https://electrotec.pe/',
    youtubeId: 'W8GEdpDWSIQ',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/W8GEdpDWSIQ/hqdefault.jpg',
    practiceActivity:
      'Follow the Spanish HVAC briefing in your preferred language and trace the refrigerant state (vapor vs. liquid) at the inlet and outlet of each of the four components.',
    practiceDeliverablePrompt:
      'Write down the refrigerant pressure and phase state entering and leaving the compressor and expansion device as interpreted from the Electrotec HVAC lesson.',
    knowledgeCheck: {
      question:
        'In the Spanish Electrotec HVAC training, why must refrigerant enter the compressor suction port as a low-pressure vapor rather than a liquid?',
      options: [
        'Liquids are non-compressible; liquid refrigerant entering the compressor cylinders ("liquid slugging") can severely damage valves and pistons',
        'Because compressors are designed to pump solid ice',
        'Because the evaporator coil heats the outdoor air',
        'Refrigerant never changes phase in an air conditioner'
      ],
      correctIndex: 0,
      explanation:
        'Vapor compressors are designed strictly to compress gas; ensuring complete vaporization (proper superheat) in the evaporator protects the compressor from liquid slugging.'
    }
  },
  {
    id: 'lbd_intl_hi_automech_24',
    lessonNumber: 24,
    videoLabel: 'Global Training (हिन्दी): Automobile Powertrain & Chassis',
    title: 'Automobile Engineering: Engine, Transmission & Chassis Systems (Hindi Auto Portal)',
    category: 'Auto Mechanics',
    enclaveId: 'automotive_mechanics',
    professionId: 'auto_mechanic',
    level: 'Beginner',
    originalCreator: 'Indian Automobile Engineer · ITI Automotive Portal',
    creatorDomain: 'ncvtmis.gov.in',
    sourceLanguage: 'hi',
    sourceLanguageLabel: '🇮🇳 हिन्दी',
    description:
      'Hindi automotive engineering lesson breaking down the core subsystems of a motor vehicle—internal combustion engine, clutch/transmission drivetrain, suspension, steering, braking, and electrical—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Powertrain Architecture (Engine, Clutch, Gearbox, Differential)',
      'Chassis Frame, Suspension & Braking Subsystems',
      'Cooling, Lubrication & Fuel Delivery Loops',
      'Systematic Multi-Point Vehicle Inspection'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=bEBU-hytsxU',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=bEBU-hytsxU',
    youtubeId: 'bEBU-hytsxU',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/bEBU-hytsxU/hqdefault.jpg',
    practiceActivity:
      'Listen to the Hindi automotive engineering briefing in your preferred language and trace how mechanical torque travels from the engine crankshaft to the driven road wheels.',
    practiceDeliverablePrompt:
      'List the drivetrain components in order from the engine flywheel to the wheels as explained in the automotive lesson.',
    knowledgeCheck: {
      question:
        'In the Hindi automotive engineering lesson, what is the correct sequence of drivetrain components that transmit power from the engine to the driven wheels?',
      options: [
        'Engine Crankshaft → Flywheel / Clutch (or Torque Converter) → Transmission Gearbox → Driveshaft → Differential → Axle Shafts → Wheels',
        'Radiator → Steering Wheel → Exhaust Pipe → Headlights',
        'Alternator → Windshield Wiper → Brake Caliper',
        'Battery → Air Filter → Muffler'
      ],
      correctIndex: 0,
      explanation:
        'Rotational torque generated by the engine passes through the clutch/torque converter to the transmission (for gear reduction), then via the driveshaft and differential to the axle shafts and wheels.'
    }
  },
  {
    id: 'lbd_intl_vi_carpentry_25',
    lessonNumber: 25,
    videoLabel: 'Global Training (Tiếng Việt): Kỹ Thuật Ghép Mộng Góc Vuông',
    title: 'Cách Ghép Mộng Góc Vuông Trong Nghề Mộc (Vietnamese Joinery Masterclass)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: 'Mộc GO DND · Vietnamese Woodworking & Craft Academy',
    creatorDomain: 'mocgodnd.vn',
    sourceLanguage: 'vi',
    sourceLanguageLabel: '🇻🇳 Tiếng Việt',
    description:
      'Authentic Vietnamese woodworking ("nghề mộc") field demonstration showing how to lay out, chisel, and fit a right-angle interlocking corner mortise-and-tenon joint ("ghép mộng góc vuông")—with live multilingual audio translation into French, Chinese, Spanish, Polish, English, or any of 46 languages.',
    skillsCovered: [
      'Vietnamese Corner Joinery (Ghép Mộng Góc Vuông)',
      'Precision Marking & Gauge Scribing (Lấy Dấu Mộng Gỗ)',
      'Clean Chisel Parings & Shoulder Fit (Đục Mộng Khít)',
      'Squareness Verification Under Clamp Load'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=wtbjRB9ewik',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=wtbjRB9ewik',
    youtubeId: 'wtbjRB9ewik',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/wtbjRB9ewik/hqdefault.jpg',
    practiceActivity:
      'Watch this Vietnamese carpentry demonstration while listening in French, Chinese, Spanish, or English via Noctis, and note how the shoulder cuts lock the corner at 90 degrees.',
    practiceDeliverablePrompt:
      'Describe how the Vietnamese corner mortise-and-tenon joint prevents racking and twisting compared to a simple butt joint.',
    knowledgeCheck: {
      question:
        'In the Vietnamese woodworking lesson ("Cách Ghép Mộng Góc Vuông"), what gives the interlocking right-angle mortise-and-tenon joint its superior mechanical rigidity?',
      options: [
        'Precisely mated shoulder cheeks and interlocking tenon walls resist twisting and provide large long-grain glue surfaces on all faces',
        'Leaving a 10 mm gap between the boards',
        'Only painting the outside of the wood without cutting a joint',
        'Cutting the wood without measuring'
      ],
      correctIndex: 0,
      explanation:
        'Interlocking right-angle mortise-and-tenon shoulders register the two members at 90° mechanically while maximizing long-grain bonding surface.'
    }
  },
  {
    id: 'lbd_intl_vi_electrical_26',
    lessonNumber: 26,
    videoLabel: 'Global Training (Tiếng Việt): Lắp Mạch Điện Khởi Động Từ',
    title: 'Hướng Dẫn Lắp Mạch Điện Khởi Động Từ (Vietnamese Contactor & Motor Control)',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'Kỹ Thuật Điện Việt Nam · Industrial Electrical Portal',
    creatorDomain: 'kythuatdien.vn',
    sourceLanguage: 'vi',
    sourceLanguageLabel: '🇻🇳 Tiếng Việt',
    description:
      'Vietnamese electrical engineering training demonstrating how to wire a magnetic contactor ("khởi động từ"), start/stop push-button control circuit, and latching auxiliary contact ("tiếp điểm duy trì")—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Magnetic Contactor Coil & Power Poles (Cuộn Hút A1-A2 & Tiếp Điểm Động Lực)',
      'Start/Stop Push-Button Control Loop (Mạch Điều Khiển Nút Nhấn ON/OFF)',
      'Auxiliary Holding Contact Wiring (Tiếp Điểm Thường Mở NO Duy Trì)',
      'Thermal Overload Relay Integration'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=HIL5QCQ6pRQ',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=HIL5QCQ6pRQ',
    youtubeId: 'HIL5QCQ6pRQ',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/HIL5QCQ6pRQ/hqdefault.jpg',
    practiceActivity:
      'Listen to this Vietnamese electrical control lesson in French, Chinese, Spanish, or English and trace the holding contact loop parallel to the momentary START button.',
    practiceDeliverablePrompt:
      'Explain why the normally open (NO) auxiliary contact (13-14) is wired in parallel with the START button on a magnetic contactor.',
    knowledgeCheck: {
      question:
        'In the Vietnamese magnetic contactor ("khởi động từ") wiring lesson, what is the role of the normally open (NO) auxiliary holding contact wired in parallel with the START push-button?',
      options: [
        'It latches the control circuit closed so the contactor coil remains energized after you release the momentary START button, until the STOP button is pressed',
        'It permanently disconnects the ground wire',
        'It increases voltage from 220V to 10,000V',
        'It replaces the need for circuit breakers'
      ],
      correctIndex: 0,
      explanation:
        'When the momentary START button is pressed, the coil pulls in and closes the parallel NO auxiliary contact (13-14), maintaining coil current until interrupted by the NC STOP button or overload relay.'
    }
  },
  {
    id: 'lbd_intl_pl_electrical_27',
    lessonNumber: 27,
    videoLabel: 'Global Training (Polski): Jak Podłączyć Rozdzielnię Elektryczną',
    title: 'Jak Podłączyć Rozdzielnię Elektryczną (Polish Distribution Panel Masterclass)',
    category: 'Electrical Fundamentals',
    enclaveId: 'trades_construction',
    professionId: 'electrician',
    level: 'Beginner',
    originalCreator: 'Akademia Dobrych Instalacji · Polish Electrical Institute',
    creatorDomain: 'akademiadobrychinstalacji.pl',
    sourceLanguage: 'pl',
    sourceLanguageLabel: '🇵🇱 Polski',
    description:
      'Polish electrical installation training ("Akademia Dobrych Instalacji") demonstrating DIN-rail distribution board assembly, residual-current devices (RCD / wyłącznik różnicowoprądowy), comb busbars, and neutral/PE terminal blocks—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'DIN-Rail Switchgear Layout (Montaż Osprzętu w Rozdzielnicy)',
      'RCD & Overcurrent Breaker Grouping (Wyłączniki Różnicowoprądowe i Nadprądowe)',
      'Insulated Comb Busbar Connections (Szyny Łączeniowe Grzebieniowe)',
      'Neutral (N) & Protective Earth (PE) Busbar Termination'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=1AMM9co45r4',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=1AMM9co45r4',
    youtubeId: '1AMM9co45r4',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/1AMM9co45r4/hqdefault.jpg',
    practiceActivity:
      'Watch the Polish electrical panelboard tutorial in Spanish, French, English, or Polish and note how separate Neutral (N) bars are assigned to each RCD group.',
    practiceDeliverablePrompt:
      'Explain why circuits protected by different RCDs ("wyłączniki różnicowoprądowe") must use separate isolated Neutral (N) busbars.',
    knowledgeCheck: {
      question:
        'In the Polish distribution board ("rozdzielnia elektryczna") training, why must each RCD group have its own dedicated Neutral (N) terminal bar?',
      options: [
        'Connecting neutrals from different RCDs together causes nuisance tripping because return current divides between the RCDs, creating an imbalance',
        'Because neutral wires are never used in Europe',
        'So the panel door cannot close',
        'Busbars are only decorative'
      ],
      correctIndex: 0,
      explanation:
        'An RCD monitors the exact balance of phase and neutral current passing through its own toroidal transformer; sharing neutrals across RCDs causes immediate nuisance tripping.'
    }
  },
  {
    id: 'lbd_intl_zh_carpentry_28',
    lessonNumber: 28,
    videoLabel: 'Global Training (简体中文): 传统木工榫卯结构实操',
    title: '中国传统木工榫卯结构与精准开榫 (Chinese Mortise & Tenon Joinery)',
    category: 'Carpentry',
    enclaveId: 'trades_construction',
    professionId: 'carpenter',
    level: 'Beginner',
    originalCreator: '传统木工非遗传承 · Chinese Timber Joinery Academy',
    creatorDomain: 'woodcraft.cn',
    sourceLanguage: 'zh',
    sourceLanguageLabel: '🇨🇳 简体中文',
    description:
      'Chinese traditional woodworking ("榫卯结构" — Sunmao interlocking mortise-and-tenon joinery) demonstrating how structural wood joints lock together in three dimensions without nails or screws—with live multilingual audio interpretation by Noctis.',
    skillsCovered: [
      'Sunmao Interlocking Joinery (传统榫卯结构)',
      'Three-Way Mitered Mortise & Tenon Layout',
      'Sliding Dovetail & Keyed Tenon Locking',
      'Precision Chisel & Saw Kerf Fit'
    ],
    sourceVideoUrl: 'https://www.youtube.com/watch?v=kaMGOVfuzlY',
    referenceArticleUrl: 'https://www.youtube.com/watch?v=kaMGOVfuzlY',
    youtubeId: 'kaMGOVfuzlY',
    embedAvailable: true,
    duration: '',
    thumbnailUrl: 'https://i.ytimg.com/vi/kaMGOVfuzlY/hqdefault.jpg',
    practiceActivity:
      'Watch this Chinese mortise-and-tenon ("榫卯") masterclass interpreted into your preferred language and trace the insertion order of the interlocking members.',
    practiceDeliverablePrompt:
      'Describe how Chinese Sunmao (榫卯) joinery resists pulling forces in all three axes without metal fasteners.',
    knowledgeCheck: {
      question:
        'How does traditional Chinese "Sunmao" (榫卯) joinery achieve structural strength without nails or screws?',
      options: [
        'Through complementary interlocking geometry (tenons "榫" and mortises "卯") that mechanically trap each member against tension and shear while accommodating seasonal wood movement',
        'By taping the outside of the boards with paper',
        'By leaving the joints loose so they fall apart',
        'By using only wet bark'
      ],
      correctIndex: 0,
      explanation:
        'Sunmao (榫卯) joinery uses interlocking geometric shoulders, keyed tenons, and dovetail profiles so structural loads tighten the joint mechanically.'
    }
  }
]

const TELEMETRY_STORAGE_KEY = 'connectln_skilled_trades_learn_by_doing_telemetry_v1'
export const SAVED_LESSONS_STORAGE_KEY = 'connectln_saved_learn_by_doing_lessons_v1'
export const LEARNING_JOURNEY_STORAGE_KEY = 'connectln_learning_journey_lessons_v1'

export function createInitialLessonTelemetry(lessonId: string): LearnByDoingLessonTelemetry {
  return {
    lessonId,
    verifiedVideoViews: 0,
    outboundLinkClicks: 0,
    isSaved: false,
    savesCount: 0,
    inLearningJourney: false,
    videoReviewed: false,
    practiceNotes: '',
    knowledgeCheckPassed: false,
    isCompleted: false,
    progressPercent: 0,
    interactionsCount: 0
  }
}

export function computeLessonProgress(t: LearnByDoingLessonTelemetry): {
  progressPercent: number
  isCompleted: boolean
} {
  let pct = 0
  if (t.videoReviewed || t.verifiedVideoViews > 0) pct += 34
  if (Boolean(t.practiceCompletedAt) || t.practiceNotes.trim().length >= 10 || Boolean(t.practicePhotoDataUrl)) {
    pct += 33
  }
  if (t.knowledgeCheckPassed) pct += 33

  const isCompleted = pct >= 100
  return {
    progressPercent: Math.min(100, pct),
    isCompleted
  }
}

export function loadAllLearnByDoingTelemetry(): Record<string, LearnByDoingLessonTelemetry> {
  const initialMap: Record<string, LearnByDoingLessonTelemetry> = {}
  for (const lesson of SKILLED_TRADES_LEARN_BY_DOING_LESSONS) {
    initialMap[lesson.id] = createInitialLessonTelemetry(lesson.id)
  }

  if (typeof window === 'undefined') return initialMap

  try {
    const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY)
    if (!raw) return initialMap
    const parsed = JSON.parse(raw) as Record<string, Partial<LearnByDoingLessonTelemetry>>
    for (const lesson of SKILLED_TRADES_LEARN_BY_DOING_LESSONS) {
      const saved = parsed[lesson.id]
      if (saved) {
        const merged: LearnByDoingLessonTelemetry = {
          ...createInitialLessonTelemetry(lesson.id),
          ...saved,
          lessonId: lesson.id
        }
        const computed = computeLessonProgress(merged)
        merged.progressPercent = computed.progressPercent
        merged.isCompleted = computed.isCompleted
        initialMap[lesson.id] = merged
      }
    }
    return initialMap
  } catch {
    return initialMap
  }
}

export function saveAllLearnByDoingTelemetry(
  map: Record<string, LearnByDoingLessonTelemetry>
): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(map))
    const savedIds = Object.values(map)
      .filter(t => t.isSaved)
      .map(t => t.lessonId)
    const journeyIds = Object.values(map)
      .filter(t => t.inLearningJourney)
      .map(t => t.lessonId)
    localStorage.setItem(SAVED_LESSONS_STORAGE_KEY, JSON.stringify(savedIds))
    localStorage.setItem(LEARNING_JOURNEY_STORAGE_KEY, JSON.stringify(journeyIds))
  } catch (e) {
    console.error('Failed to persist Skilled Trades Learn by Doing telemetry:', e)
  }
}

/**
 * Normalizes a video URL or YouTube ID to prevent duplicate entries for the same source video.
 */
export function normalizeSourceVideoKey(urlOrId?: string): string {
  if (!urlOrId) return ''
  const trimmed = urlOrId.trim()
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) return `yt:${ytMatch[1]}`
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return `yt:${trimmed}`
  try {
    const u = new URL(trimmed)
    return `url:${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/+$/, '').toLowerCase()}`
  } catch {
    return trimmed.toLowerCase()
  }
}

export interface RunningYourBusinessMilestone {
  id: string
  stepNumber: number
  title: string
  summary: string
  skillsCovered: string[]
  practiceActivity: string
  knowledgeCheck: LearnByDoingKnowledgeCheck
}

export const RUNNING_YOUR_TRADE_BUSINESS_PATH: RunningYourBusinessMilestone[] = [
  {
    id: 'ryb_1_estimates',
    stepNumber: 1,
    title: 'Preparing a Clear Service Estimate',
    summary:
      'Itemize materials, labor hours, scope boundaries, exclusions, and payment terms so clients understand exactly what is included before work starts.',
    skillsCovered: [
      'Material & Labor Line-Item Estimation',
      'Defining Scope Boundaries & Exclusions',
      'Contingency & Change-Order Clauses'
    ],
    practiceActivity:
      'Draft a one-page service estimate for a beginner job in your trade listing scope of work, materials, labor, timeline, and what requires a written change order.',
    knowledgeCheck: {
      question:
        'Why should a professional trade estimate clearly separate materials, labor scope, and exclusions before work begins?',
      options: [
        'It sets transparent expectations with the customer and prevents scope creep or billing disputes if hidden site conditions are discovered',
        'So the customer is surprised by hidden fees after the job is finished',
        'Because written estimates replace the need to perform the work safely',
        'Estimates should only contain a single unitemized guess written on scrap paper'
      ],
      correctIndex: 0,
      explanation:
        'Clear, itemized estimates build client trust and establish a baseline for written change orders if unexpected repairs arise.'
    }
  },
  {
    id: 'ryb_2_communication',
    stepNumber: 2,
    title: 'Customer Communication & Site Etiquette',
    summary:
      'Communicate arrival windows, walk the client through the work plan, explain unexpected findings in plain language, and leave the workspace clean.',
    skillsCovered: [
      'Pre-Job Walkthrough & Confirmation',
      'Plain-Language Technical Explanations',
      'Proactive Delay & Change Notification'
    ],
    practiceActivity:
      'Write a short 3-sentence update message to a client explaining a discovered issue, the recommended fix, and the cost/time impact before proceeding.',
    knowledgeCheck: {
      question:
        'If you uncover an unexpected issue during a job that will change the cost or completion time, what is the best professional practice?',
      options: [
        'Pause on that portion, show or photograph the issue for the customer, explain the options clearly, and get approval before performing extra billable work',
        'Complete the extra work silently and double the final invoice without telling the customer',
        'Leave the jobsite without notifying the customer',
        'Hide the defect under paint or trim'
      ],
      correctIndex: 0,
      explanation:
        'Proactive, documented communication before performing out-of-scope work protects both the tradesperson and the client.'
    }
  },
  {
    id: 'ryb_3_scheduling',
    stepNumber: 3,
    title: 'Scheduling, Material Staging & Time Management',
    summary:
      'Sequence tasks logically, verify material and tool availability before mobilization, and build buffer time for curing, drying, or parts delivery.',
    skillsCovered: [
      'Pre-Job Tool & Material Staging',
      'Task Sequencing (Prep, Execution, Cure/Test)',
      'Realistic Arrival & Completion Buffers'
    ],
    practiceActivity:
      'Create a half-day job schedule that includes tool load-out, site protection/prep, main task execution, quality check, and cleanup.',
    knowledgeCheck: {
      question:
        'What is the most effective way to prevent avoidable job delays before arriving at a client’s site?',
      options: [
        'Verify all required materials, fittings, fasteners, and tools against a pre-job checklist before leaving for the site',
        'Wait until you arrive on site to check if you own the needed tools',
        'Book four full-day jobs in different cities at the same hour',
        'Skip surface preparation and safety setup to save 10 minutes'
      ],
      correctIndex: 0,
      explanation:
        'Staging materials and checking tools before dispatch eliminates mid-job supply runs and keeps your schedule reliable.'
    }
  },
  {
    id: 'ryb_4_documentation',
    stepNumber: 4,
    title: 'Job Documentation, Checklists & Records',
    summary:
      'Record before-and-after conditions, measurements, diagnostic codes, materials used, and client sign-offs for warranty and future maintenance.',
    skillsCovered: [
      'Before / During / After Job Logs',
      'Recording Part Numbers, Paint Codes & Readings',
      'Completion Checklist & Client Walkthrough Sign-Off'
    ],
    practiceActivity:
      'Design a 5-item job completion log recording work performed, products/parts installed, test verification results, and maintenance advice for the customer.',
    knowledgeCheck: {
      question:
        'Why is documenting installed part numbers, paint formulas, or test readings valuable after completing a trade job?',
      options: [
        'It provides a verified service history for repeat maintenance, warranty support, and professional accountability',
        'Documentation is only needed if the job fails inspection',
        'Customers never ask what paint sheen, oil grade, or part was used',
        'It replaces the need to test your work before leaving'
      ],
      correctIndex: 0,
      explanation:
        'Thorough job documentation turns one-time repairs into long-term repeat customer relationships and verifies quality workmanship.'
    }
  },
  {
    id: 'ryb_5_portfolio',
    stepNumber: 5,
    title: 'Presenting Completed Work & Building Your Portfolio',
    summary:
      'Photograph completed work cleanly with good lighting and framing, explain the problem solved, and publish verified Proof-of-Work to attract new opportunities on ConnectLn.',
    skillsCovered: [
      'Clean Before-and-After Work Photography',
      'Protecting Client Privacy in Jobsite Photos',
      'Publishing Proof-of-Work & Requesting Peer Vouches'
    ],
    practiceActivity:
      'Take a well-lit photo of a completed practice piece or repair, write a 2-sentence caption describing the tools and technique used, and save it for your ConnectLn portfolio.',
    knowledgeCheck: {
      question:
        'When photographing completed trade work for your professional portfolio on ConnectLn, what should you always ensure?',
      options: [
        'Clear away tools and debris, use good lighting to show clean details, and obtain client permission while avoiding private personal items or addresses in the frame',
        'Take blurry photos in the dark with trash and open containers in the foreground',
        'Include the customer’s private documents and house keys in the photo',
        'Use someone else’s photos from the internet instead of your own work'
      ],
      correctIndex: 0,
      explanation:
        'Clean, well-lit photos of your own authentic work—taken with respect for client privacy—demonstrate pride in craftsmanship and build real trust.'
    }
  }
]

export interface ProposedTradeProfessionTopic {
  id: string
  professionOrSkill: string
  enclaveLabel: string
  firstVideoTopic: string
  secondVideoTopic: string
  suggestedPracticePreview: string
  status: 'Proposed Topic · Video Selection Pending'
}

export const PROPOSED_NEXT_TRADE_PROFESSIONS: ProposedTradeProfessionTopic[] = [
  {
    id: 'prop_masonry_bricklaying',
    professionOrSkill: 'Masonry and bricklaying',
    enclaveLabel: 'Trades & Construction',
    firstVideoTopic: 'Tools and common brick bonds',
    secondVideoTopic: 'Understanding mortar and joint finishing',
    suggestedPracticePreview:
      'Dry-lay a running bond and stack bond pattern with bricks or blocks, then identify concave vs. flush mortar joint profiles.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_tile_installation',
    professionOrSkill: 'Tile installation',
    enclaveLabel: 'Trades & Construction',
    firstVideoTopic: 'Planning a tile layout',
    secondVideoTopic: 'Grouting and finishing',
    suggestedPracticePreview:
      'Snap chalk centerlines on a practice board to balance perimeter cut tiles and avoid narrow sliver cuts along edges.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_appliance_maintenance',
    professionOrSkill: 'Appliance maintenance',
    enclaveLabel: 'Repair & Technical Services',
    firstVideoTopic: 'Understanding appliance model labels',
    secondVideoTopic: 'Routine cleaning and maintenance checks',
    suggestedPracticePreview:
      'Locate the model and serial number plate on a household appliance and list its routine filter, coil, or seal maintenance checks.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_landscaping_gardening',
    professionOrSkill: 'Landscaping and gardening',
    enclaveLabel: 'Agri, Grounds & Outdoor',
    firstVideoTopic: 'Preparing soil and planting',
    secondVideoTopic: 'Lawn and garden maintenance',
    suggestedPracticePreview:
      'Assess soil drainage and texture in a planting bed and create a seasonal watering, mulching, and pruning schedule.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_tailoring_sewing',
    professionOrSkill: 'Tailoring and sewing',
    enclaveLabel: 'Apparel & Craftsmanship',
    firstVideoTopic: 'Taking garment measurements',
    secondVideoTopic: 'Basic seams and hemming',
    suggestedPracticePreview:
      'Record key garment measurements with a flexible tape and stitch a straight seam and clean hem on scrap fabric.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_barbering_hairdressing',
    professionOrSkill: 'Barbering and hairdressing',
    enclaveLabel: 'Beauty & Personal Services',
    firstVideoTopic: 'Tool identification and care',
    secondVideoTopic: 'Consultation and hairstyle planning',
    suggestedPracticePreview:
      'Lay out clippers, guards, shears, and combs with their sanitization steps, and write a structured 4-question client consultation checklist.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_professional_cleaning',
    professionOrSkill: 'Professional cleaning',
    enclaveLabel: 'Hospitality & Facility Care',
    firstVideoTopic: 'Choosing tools for different surfaces',
    secondVideoTopic: 'Organizing a room-cleaning workflow',
    suggestedPracticePreview:
      'Match microfiber cloths, non-abrasive pads, and neutral cleaners to glass, wood, stone, and tile, and map a top-to-bottom room workflow.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_cooking_catering',
    professionOrSkill: 'Cooking and catering',
    enclaveLabel: 'Culinary & Hospitality',
    firstVideoTopic: 'Kitchen organization and preparation',
    secondVideoTopic: 'Portion planning and food presentation',
    suggestedPracticePreview:
      'Organize a mise-en-place prep station for a 3-ingredient dish and calculate portion weights for a 10-guest catering tray.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_furniture_restoration',
    professionOrSkill: 'Furniture restoration',
    enclaveLabel: 'Woodworking & Restoration',
    firstVideoTopic: 'Assessing a piece before restoration',
    secondVideoTopic: 'Surface preparation and finishing options',
    suggestedPracticePreview:
      'Inspect a wooden furniture piece for loose joints, veneer lifting, and existing finish type, then outline a gentle prep and finish plan.',
    status: 'Proposed Topic · Video Selection Pending'
  },
  {
    id: 'prop_small_business_trades',
    professionOrSkill: 'Small-business skills for tradespeople',
    enclaveLabel: 'Running Your Business',
    firstVideoTopic: 'Preparing a clear service estimate',
    secondVideoTopic: 'Photographing completed work for a portfolio',
    suggestedPracticePreview:
      'Write a clear customer estimate for a sample trade service and take a clean, well-framed before-and-after portfolio photo.',
    status: 'Proposed Topic · Video Selection Pending'
  }
]

