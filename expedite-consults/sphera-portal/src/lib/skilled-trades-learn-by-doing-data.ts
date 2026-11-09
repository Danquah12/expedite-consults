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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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

