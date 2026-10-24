import { matchStudy } from "./study-pass.ts";
import { APPROVED_SOURCES } from "./approved-sources.ts";

export type JourneyLevel = "Beginner" | "Intermediate" | "Advanced";
export type JourneyGoal = "understand" | "project" | "career" | "exam";
export type JourneyTimeCommitment = "15 min/day" | "30 min/day" | "1 hr/day";
export type JourneyStageName =
  | "Foundations"
  | "Core Concepts"
  | "Guided Practice"
  | "Advanced Topics"
  | "Final Project";

export type LessonSlide = {
  heading: string;
  bullets: string[];
  takeaway: string;
};

export type LessonDiagram = {
  title: string;
  nodes: { label: string; detail: string }[];
  flowCaption: string;
};

export type WorkedExample = {
  scenario: string;
  steps: string[];
  result: string;
};

export type VocabularyItem = {
  term: string;
  definition: string;
};

export type AdaptiveExplanation = {
  analogy: string;
  stepByStep: string;
  visualWalkthrough: string;
};

export type PracticalActivity = {
  prompt: string;
  hint: string;
  expectedKeywords: string[];
};

export type JourneySourceRef = {
  id: string;
  title: string;
  publisher: string;
  href: string;
  license: string;
  verifiedClaim: string;
};

/**
 * Reusable Lesson-Content Schema (Section 4 of Spec)
 * Video, slides, notes, diagram, worked example, vocabulary, quiz, and practical activity
 * are generated from this shared lesson specification so they stay 100% consistent.
 */
export type JourneyLesson = {
  id: string;
  title: string;
  kind: "Video" | "Slides" | "Notes" | "Practice";
  doThis: string;
  durationMinutes?: number;
  objectives?: string[];
  notes?: string;
  videoScript?: {
    hook: string;
    narration: string[];
    visualCue: string;
    durationSec: number;
  };
  slides?: LessonSlide[];
  diagram?: LessonDiagram;
  workedExample?: WorkedExample;
  vocabulary?: VocabularyItem[];
  adaptiveExplanations?: AdaptiveExplanation;
  practicalTask?: PracticalActivity;
  sourceRefs?: string[];
  version?: string;
};

export type JourneyCheck = {
  prompt: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  why: string;
  remediation?: string;
};

export type JourneyModule = {
  id: string;
  title: string;
  summary: string;
  stage?: JourneyStageName;
  lessonCountLabel?: string;
  prerequisites?: string[];
  objectives?: string[];
  lessons: JourneyLesson[];
  check: JourneyCheck;
  retentionCheck?: JourneyCheck;
};

export type JourneyStagePreview = {
  step: number;
  title: string;
  description: string;
  totalLessons: number;
  icon: "code" | "file" | "devices" | "cloud";
};

export type ProjectRubricItem = {
  id: string;
  criterion: string;
  description: string;
  keywords: string[];
};

export type JourneyPath = {
  id: string;
  subject: string;
  title: string;
  blurb: string;
  tagline?: string;
  cover?: string;
  intendedLearner?: string;
  entryRequirements?: string[];
  outcome: string;
  objectives?: string[];
  project: string;
  projectRubric?: ProjectRubricItem[];
  completionCriteria?: string[];
  nextSteps?: string[];
  masteryThresholdPct?: number;
  sources?: JourneySourceRef[];
  stagePreviews?: JourneyStagePreview[];
  keywords: string[];
  modules: JourneyModule[];
};

export type AgentRoleId =
  | "orchestrator"
  | "research"
  | "curriculum"
  | "teaching"
  | "media"
  | "assessment"
  | "coach"
  | "quality"
  | "project";

export type LearningAgentSpec = {
  id: AgentRoleId;
  number: number;
  name: string;
  role: string;
  responsibility: string;
  outputs: string[];
};

export const LEARNING_AGENTS: LearningAgentSpec[] = [
  {
    id: "orchestrator",
    number: 0,
    name: "Vibe / Noctis Learning Orchestrator",
    role: "Central Coordinator",
    responsibility:
      "Understands learner goal, delegates workflows, enforces stage gates, and verifies completion criteria before advancing.",
    outputs: ["Shared Course Plan", "Stage Gate Decisions", "Learner Journey State"],
  },
  {
    id: "research",
    number: 1,
    name: "Research Agent",
    role: "Source Discovery & Verification",
    responsibility:
      "Finds trustworthy textbooks, official documentation, university courses, and open educational resources with licensing provenance.",
    outputs: ["Verified Source Library", "Extracted Evidence Passages", "License & Attribution Record"],
  },
  {
    id: "curriculum",
    number: 2,
    name: "Curriculum Agent",
    role: "Roadmap & Prerequisite Planner",
    responsibility:
      "Organises the topic into Beginner Foundations, Core Concepts, Guided Practice, Advanced Topics, and Final Project.",
    outputs: ["Ordered Module Roadmap", "Prerequisite Graph", "Measurable Learning Objectives"],
  },
  {
    id: "teaching",
    number: 3,
    name: "Teaching Agent",
    role: "Explanations & Adaptive Tutor",
    responsibility:
      "Turns verified research into plain-language notes, worked examples, key vocabulary, and alternative explanations when confused.",
    outputs: ["Plain-Language Notes", "Worked Examples & Vocabulary", "Adaptive Re-explanations (Analogy / Step-by-Step / Visual)"],
  },
  {
    id: "media",
    number: 4,
    name: "Media Agent",
    role: "Video, Slides & Diagrams",
    responsibility:
      "Produces synchronized lesson scripts, structured slide decks, concept diagrams, and narrated slide playback from the shared lesson spec.",
    outputs: ["Narrated Video Script", "Structured Slide Deck", "Concept Flow Diagram"],
  },
  {
    id: "assessment",
    number: 5,
    name: "Assessment Agent",
    role: "Quizzes, Tasks & Mastery Checks",
    responsibility:
      "Creates concept checks, practical tasks, answer rationales, and spaced retention questions aligned to lesson objectives.",
    outputs: ["Module Mastery Checks", "Answer Rationales", "Spaced Retention Checks"],
  },
  {
    id: "coach",
    number: 6,
    name: "Progress Coach",
    role: "Mastery & Remediation Tracker",
    responsibility:
      "Distinguishes exposure from proficiency and mastery, identifies weak concepts, and schedules targeted revisions.",
    outputs: ["6 Verifiable Progress Indicators", "Weak-Concept Revision Queue", "Next-Level Readiness Verdict"],
  },
  {
    id: "quality",
    number: 7,
    name: "Quality & Safety Agent",
    role: "Accuracy, Citations & Safety Gate",
    responsibility:
      "Validates factual claims against sources, checks slide-to-script consistency, enforces licensing, and applies subject safety rules.",
    outputs: ["Provenance Audit", "Slide-to-Script Consistency Pass", "Subject Safety & Licensing Notice"],
  },
  {
    id: "project",
    number: 8,
    name: "Project Agent",
    role: "Capstone Design & Rubric Evaluator",
    responsibility:
      "Designs the subject-specific final practical challenge and evaluates the learner's submitted work against explicit rubric criteria.",
    outputs: ["Practical Final Challenge", "Rubric Evaluation Report", "Verified Completion Certificate"],
  },
];

export type ContentPipelineStep = {
  code: "A" | "B" | "C" | "D" | "E";
  title: string;
  summary: string;
  agentId: AgentRoleId;
  artifact: string;
};

export const CONTENT_PIPELINE_STEPS: ContentPipelineStep[] = [
  {
    code: "A",
    title: "Discover sources",
    summary:
      "Search approved textbooks, university repositories, official documentation, scientific datasets, and primary sources.",
    agentId: "research",
    artifact: "Approved Source Registry & Licensing Rules",
  },
  {
    code: "B",
    title: "Extract and verify",
    summary:
      "Retrieve relevant passages, record source URLs and publication details, cross-check claims, and flag uncertainty.",
    agentId: "quality",
    artifact: "Verified Claim Ledger & Citation Provenance",
  },
  {
    code: "C",
    title: "Structure the knowledge",
    summary:
      "Organise into prerequisites, learning objectives, foundations, core concepts, guided practice, and final project.",
    agentId: "curriculum",
    artifact: "5-Stage Curriculum & Lesson Specification",
  },
  {
    code: "D",
    title: "Generate the lesson package",
    summary:
      "Create the video script, slide outline, diagram, plain-language notes, worked example, vocabulary, quiz, and practical task from one spec.",
    agentId: "media",
    artifact: "Unified Multi-Format Lesson Package",
  },
  {
    code: "E",
    title: "Quality check and publish",
    summary:
      "Validate citations, slide-to-script consistency, answer keys, accessibility, and attribution before learner access.",
    agentId: "quality",
    artifact: "QA-Approved Published Course Version",
  },
];

export const JOURNEY_PATHS: JourneyPath[] = [
  {
    id: "web",
    subject: "Web Design",
    title: "Become a Web Designer",
    blurb: "Learn the foundations, practise each skill, and build a website you can publish.",
    tagline: "Beginner level · 6 modules · Final project",
    cover: "/media/hall/developer.jpg",
    intendedLearner: "Complete beginners who want to build and publish a clean, responsive website from scratch.",
    entryRequirements: ["No prior coding experience required", "A web browser and text editor"],
    outcome: "A working website you can open on a phone and desktop and explain in your own words.",
    objectives: [
      "Explain how browsers, servers, URLs, and HTTP work together to load a web page",
      "Structure semantic HTML documents with headings, paragraphs, links, lists, and media",
      "Design readable layouts, typography, colour palettes, and box-model spacing with CSS",
      "Add interactive user-interface behaviour using JavaScript events and DOM updates",
      "Build responsive layouts that adapt cleanly across mobile phones, tablets, and desktops",
      "Assemble, test, and publish a complete working webpage and explain its architecture",
    ],
    project:
      "Publish one working responsive webpage with semantic HTML (heading, narrative paragraph, image/media), custom CSS layout & typography that adapts to mobile screens, and one interactive JavaScript action, then explain how each layer works.",
    projectRubric: [
      {
        id: "web-r1",
        criterion: "Semantic HTML structure",
        description: "Names the HTML elements used (e.g., heading, paragraph, image, link, or section).",
        keywords: ["html", "heading", "h1", "paragraph", "page", "structure", "element", "tag", "link", "image"],
      },
      {
        id: "web-r2",
        criterion: "CSS visual & layout styling",
        description: "Describes how CSS controls typography, colour, spacing, or layout.",
        keywords: ["css", "style", "colour", "color", "font", "layout", "spacing", "flex", "grid", "margin", "padding"],
      },
      {
        id: "web-r3",
        criterion: "Mobile responsiveness",
        description: "Explains how the page stays readable and usable on a narrow phone screen.",
        keywords: ["phone", "mobile", "responsive", "screen", "width", "stack", "narrow", "desktop", "media"],
      },
      {
        id: "web-r4",
        criterion: "Published output & explanation",
        description: "States where/how the page is opened or published and what the user sees or clicks.",
        keywords: ["publish", "browser", "url", "live", "click", "open", "work", "site", "website", "server"],
      },
    ],
    completionCriteria: [
      "Pass all 6 module mastery checks (80%+ mastery threshold)",
      "Complete guided practice activities across HTML, CSS, JavaScript, and responsive layout",
      "Submit a final project description meeting the 4 Web Design rubric criteria",
    ],
    nextSteps: [
      "Build a multi-page portfolio site with accessible forms and CSS Grid",
      "Learn version control with Git and automated deployment on GitHub Pages or Vercel",
      "Explore modern component frameworks (React & TypeScript) and Web Accessibility (WCAG)",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-mdn-web",
        title: "MDN Web Docs — Learn Web Development",
        publisher: "Mozilla Developer Network",
        href: "https://developer.mozilla.org/en-US/docs/Learn",
        license: "CC-BY-SA 2.5 (Attribution Required)",
        verifiedClaim: "Browsers request resources via HTTP/HTTPS using URLs; HTML defines semantic structure, CSS controls presentation, and JavaScript provides client-side behaviour.",
      },
      {
        id: "src-w3c-html",
        title: "W3C / WHATWG HTML Living Standard & CSS Specifications",
        publisher: "W3C / WHATWG",
        href: "https://html.spec.whatwg.org/",
        license: "Open Web Standard Documentation",
        verifiedClaim: "Semantic HTML elements convey meaning and accessibility structure independent of visual styling.",
      },
      {
        id: "src-fcc-rwd",
        title: "Responsive Web Design Curriculum",
        publisher: "freeCodeCamp",
        href: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        license: "Open Educational Resource (BSD-3 / CC-BY-SA)",
        verifiedClaim: "Fluid layouts, flexible images, and CSS media queries allow a single document to adapt across mobile and desktop viewports.",
      },
    ],
    stagePreviews: [
      {
        step: 1,
        title: "Foundations",
        description: "Learn the basics of HTML, CSS and how the web works.",
        totalLessons: 8,
        icon: "code",
      },
      {
        step: 2,
        title: "Build your first page",
        description: "Create a simple, real web page from scratch.",
        totalLessons: 6,
        icon: "file",
      },
      {
        step: 3,
        title: "Make it responsive",
        description: "Learn to design for phones, tablets and desktops.",
        totalLessons: 6,
        icon: "devices",
      },
      {
        step: 4,
        title: "Publish a project",
        description: "Put it online and share your work with the world.",
        totalLessons: 5,
        icon: "cloud",
      },
    ],
    keywords: ["web", "html", "css", "javascript", "website", "site", "frontend", "web design"],
    modules: [
      mod(
        "web-1",
        "How the web works",
        "Understand browsers, servers, URLs, and HTTP.",
        [
          ["web-1a", "Video", "What a browser asks for", "Say what a browser sends and what a server sends back."],
          ["web-1b", "Slides", "URL, HTTP, and a response", "Name the parts of a URL."],
          ["web-1c", "Practice", "Trace one page load", "Write the order: address, request, response, page."],
        ],
        {
          prompt: "What happens when you open a web address?",
          choices: [
            "The browser requests that page from a server.",
            "The page is stored inside the keyboard.",
            "CSS goes to the server and HTML stays on the phone.",
          ],
          answer: 0,
          why: "The browser asks a server for the resource named by the URL. HTML then structures what comes back.",
          remediation: "Review how the client (browser) sends an HTTP request to a server hosting the document at that URL.",
        },
        {
          stage: "Foundations",
          lessonCountLabel: "5 lessons",
          prerequisites: ["None — entry module"],
          objectives: ["Trace an HTTP request/response cycle", "Identify scheme, domain, and path in a URL"],
        },
      ),
      mod(
        "web-2",
        "HTML foundations",
        "Build the structure of a web page.",
        [
          ["web-2a", "Notes", "What HTML is for", "Mark a heading, a paragraph, and a link. Do not style them yet."],
          ["web-2b", "Practice", "Write a tiny page", "Use a heading, a paragraph, and one link."],
        ],
        {
          prompt: "What is HTML for?",
          choices: [
            "It paints the colours.",
            "It marks what each part of the page is.",
            "It is the same thing as a picture.",
          ],
          answer: 1,
          why: "HTML is structure. Colour and layout belong to CSS.",
          remediation: "Remember the building analogy: HTML is the structural frame (headings, paragraphs, links), not the paint.",
        },
        {
          stage: "Foundations",
          lessonCountLabel: "8 lessons",
          prerequisites: ["1. How the web works"],
          objectives: ["Use semantic tags (h1, p, a, img) accurately", "Separate document structure from visual styling"],
        },
      ),
      mod(
        "web-3",
        "CSS and visual design",
        "Style layouts, typography, colours, and components.",
        [
          ["web-3a", "Slides", "Selectors and the box", "Change one heading's size and one box's spacing."],
          ["web-3b", "Practice", "Style the tiny page", "Set a readable type size, spacing, and one colour."],
        ],
        {
          prompt: "What does CSS control?",
          choices: [
            "The server's password.",
            "Layout, colour, and type.",
            "The meaning of a heading.",
          ],
          answer: 1,
          why: "CSS presents the HTML. It does not decide what the words mean.",
          remediation: "Focus on the CSS box model: content, padding, border, and margin, plus typography and colour rules.",
        },
        {
          stage: "Core Concepts",
          lessonCountLabel: "10 lessons",
          prerequisites: ["2. HTML foundations"],
          objectives: ["Apply CSS selectors, typography, and colour contrast", "Control spacing with the CSS box model"],
        },
      ),
      mod(
        "web-4",
        "JavaScript basics",
        "Add interactivity and dynamic behaviour.",
        [
          ["web-4a", "Notes", "A click can change the page", "Describe one thing a button could change."],
          ["web-4b", "Practice", "Plan the button", "Write what the user clicks and what should happen next."],
        ],
        {
          prompt: "What can JavaScript add?",
          choices: [
            "A response when someone clicks.",
            "A replacement for every heading.",
            "The only way to write a paragraph.",
          ],
          answer: 0,
          why: "JavaScript adds behaviour. The page should still make sense if the script does not run.",
          remediation: "JavaScript listens for user events (like a button click) and updates the DOM dynamically.",
        },
        {
          stage: "Guided Practice",
          lessonCountLabel: "10 lessons",
          prerequisites: ["2. HTML foundations", "3. CSS and visual design"],
          objectives: ["Attach an event listener to a button", "Update page state or text cleanly when triggered"],
        },
      ),
      mod(
        "web-5",
        "Responsive design",
        "Make the site work on phones, tablets, and desktops.",
        [
          ["web-5a", "Slides", "One page, two widths", "Name what must stay readable on a narrow screen."],
          ["web-5b", "Practice", "Check the narrow view", "Say what you would stack, and what you would not hide."],
        ],
        {
          prompt: "A responsive page is one that…",
          choices: [
            "Only works on a large monitor.",
            "Stays usable on a phone and on a desktop.",
            "Removes the words on a phone.",
          ],
          answer: 1,
          why: "The same content should remain usable. Hiding the words is not a layout.",
          remediation: "Use flexible widths and stack multi-column rows vertically on narrow mobile viewports.",
        },
        {
          stage: "Advanced Topics",
          lessonCountLabel: "6 lessons",
          prerequisites: ["3. CSS and visual design"],
          objectives: ["Design fluid mobile-first layouts", "Verify readability across phone, tablet, and desktop widths"],
        },
      ),
      mod(
        "web-6",
        "Build and publish",
        "Publish a working website and demonstrate the skills learned.",
        [
          ["web-6a", "Practice", "Assemble the page", "Heading, paragraph, picture, and a phone-friendly style."],
          ["web-6b", "Notes", "Say how it works", "Explain HTML, CSS, and where the page is published."],
        ],
        {
          prompt: "When is this journey complete?",
          choices: [
            "After watching every title.",
            "When a working page is published and you can explain how it was built.",
            "When the clock shows one hour.",
          ],
          answer: 1,
          why: "Time and plays are not the outcome. A published page you can explain is.",
          remediation: "Completion requires verified understanding plus a working artifact you can explain.",
        },
        {
          stage: "Final Project",
          lessonCountLabel: "Final project",
          prerequisites: ["1–5. All foundation, core, and responsive modules"],
          objectives: ["Publish a complete responsive web page", "Explain the HTML structure, CSS layout, and live URL"],
        },
      ),
    ],
  },
  {
    id: "science",
    subject: "Science",
    title: "How Electricity Works",
    blurb: "Start from a closed path, then voltage, current, resistance, and Ohm's law calculations.",
    tagline: "Beginner level · 4 modules · Circuit investigation project",
    cover: "/media/posts/calc.jpg",
    intendedLearner: "Curious learners who want a physical and mathematical grasp of electrical circuits without guesswork.",
    entryRequirements: ["Basic multiplication and division"],
    outcome: "Explain a simple circuit and use Ohm's law on one example without guessing the units.",
    objectives: [
      "Explain why electric current requires a closed conductive loop and a voltage source",
      "Distinguish voltage (volts), current (amperes), and resistance (ohms) without mixing units",
      "Calculate unknown voltage, current, or resistance using Ohm's Law (V = I × R)",
      "Separate verified circuit measurements from unsupported extrapolations",
    ],
    project: "Draw or describe one closed circuit, label voltage (V), current (A), and resistance (Ω), and calculate one unknown quantity using Ohm's law.",
    projectRubric: [
      {
        id: "sci-r1",
        criterion: "Closed circuit path",
        description: "Describes the source, load, and complete conductive path.",
        keywords: ["circuit", "closed", "path", "loop", "battery", "source", "bulb", "switch", "resistor"],
      },
      {
        id: "sci-r2",
        criterion: "Correct physical units",
        description: "Uses volts (V), amperes (A), and ohms (Ω) accurately.",
        keywords: ["volt", "amp", "ampere", "ohm", "v", "a", "r"],
      },
      {
        id: "sci-r3",
        criterion: "Ohm's Law calculation",
        description: "Shows a consistent V = I × R calculation.",
        keywords: ["=", "multiply", "divide", "ohm", "law", "current", "voltage", "resistance"],
      },
      {
        id: "sci-r4",
        criterion: "Scope & assumptions",
        description: "Notes what was calculated vs. what is not claimed.",
        keywords: ["ideal", "measured", "example", "limit", "simple", "loss", "calculated"],
      },
    ],
    completionCriteria: [
      "Pass all 4 electricity & Ohm's Law mastery checks",
      "Complete the numerical circuit practice exercises",
      "Submit a verified circuit calculation and explanation for the final project",
    ],
    nextSteps: [
      "Series vs. parallel circuits and Kirchhoff's circuit laws",
      "Electrical power (P = V × I) and energy consumption in kWh",
      "Introduction to AC power, transformers, and solar microgrids",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-openstax-phys",
        title: "OpenStax University Physics Volume 2 — Current and Resistance",
        publisher: "OpenStax (Rice University)",
        href: "https://openstax.org/details/books/university-physics-volume-2",
        license: "CC-BY 4.0",
        verifiedClaim: "Electric current requires a complete closed path; in an ohmic material, potential difference V equals current I times resistance R (V = I × R).",
      },
      {
        id: "src-khan-circuits",
        title: "Khan Academy — Circuits & Ohm's Law",
        publisher: "Khan Academy",
        href: "https://www.khanacademy.org/science/physics/circuits-topic",
        license: "Open Educational Resource (CC-BY-NC-SA)",
        verifiedClaim: "Voltage is measured in volts (J/C), current in amperes (C/s), and resistance in ohms (V/A).",
      },
    ],
    stagePreviews: [
      { step: 1, title: "A closed path", description: "Understand why current requires a complete loop.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Volts, Amps & Ohms", description: "Master the three quantities and their exact units.", totalLessons: 5, icon: "file" },
      { step: 3, title: "Ohm's Law in action", description: "Calculate V = I × R on real circuit examples.", totalLessons: 5, icon: "devices" },
      { step: 4, title: "Circuit investigation", description: "Design, label, and verify a complete simple circuit.", totalLessons: 4, icon: "cloud" },
    ],
    keywords: ["science", "electric", "electricity", "physics", "circuit", "ohm", "solar", "biology", "energy"],
    modules: [
      mod("sci-1", "A closed path", "A circuit needs a complete path.", [
        ["sci-1a", "Video", "Why a bulb lights", "Say what has to be connected before the bulb can light."],
        ["sci-1b", "Practice", "Open and closed", "Point at what changes when the switch opens."],
      ], {
        prompt: "A bulb in a simple circuit lights when…",
        choices: ["The path from the source, through the bulb, and back is closed.", "The bulb is near a magnet of any size.", "The switch is open."],
        answer: 0,
        why: "Current needs a closed path. An open switch breaks that path.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("sci-2", "Voltage, current, resistance", "Three different quantities.", [
        ["sci-2a", "Slides", "Do not mix them", "Give the unit for each: volt, ampere, ohm."],
        ["sci-2b", "Notes", "One sentence each", "Say what each quantity describes."],
      ], {
        prompt: "Which unit matches current?",
        choices: ["Volt.", "Ampere.", "Ohm."],
        answer: 1,
        why: "Current is measured in amperes. Voltage is volts. Resistance is ohms.",
      }, { stage: "Core Concepts", lessonCountLabel: "5 lessons", prerequisites: ["1. A closed path"] }),
      mod("sci-3", "Ohm's law", "Voltage, current, and resistance are related.", [
        ["sci-3a", "Notes", "V = I × R", "Name what each letter stands for."],
        ["sci-3b", "Practice", "One number", "If R is 2 ohms and I is 3 amperes, find V."],
      ], {
        prompt: "A resistor is 2 ohms and the current is 3 amperes. The voltage is…",
        choices: ["1.5 volts.", "5 volts.", "6 volts."],
        answer: 2,
        why: "V = I × R = 3 × 2 = 6 volts. This is the ideal relationship, not every real loss.",
      }, { stage: "Guided Practice", lessonCountLabel: "5 lessons", prerequisites: ["2. Voltage, current, resistance"] }),
      mod("sci-4", "Explain it", "Teach the idea back.", [
        ["sci-4a", "Practice", "Say it simply", "Explain a circuit without using a new number you did not calculate."],
        ["sci-4b", "Notes", "What you are not claiming", "Separate the measured example from a guess about a whole house."],
      ], {
        prompt: "Which claim is fair after this journey?",
        choices: ["I can size a national grid.", "I can explain a simple circuit and one Ohm's-law example.", "Watching the title means I have mastered electricity."],
        answer: 1,
        why: "This path covers a simple circuit. It does not size a grid.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["3. Ohm's law"] }),
    ],
  },
  {
    id: "geo",
    subject: "Geography",
    title: "Read and Analyse a Map",
    blurb: "See what a map shows, then scale, direction, spatial patterns, and evidence-based analysis.",
    tagline: "Beginner level · 3 modules · Regional map analysis project",
    cover: "/media/covers/harmattan.jpg",
    intendedLearner: "Learners who want to read physical, political, and thematic maps critically and analyse regional patterns.",
    entryRequirements: ["None"],
    outcome: "Read a map well enough to say what is where, measure scale, and separate observed spatial patterns from unproved causes.",
    objectives: [
      "Read a map's title, legend/key, and frame before interpreting symbols or colours",
      "Use map scale and compass orientation to compare ground distance and direction",
      "Describe a spatial pattern using visible map evidence without inventing unverified causes",
    ],
    project: "Analyse one regional map: state what the title and key show, the scale you used, one spatial pattern you can point at, and one question the map alone cannot prove.",
    projectRubric: [
      { id: "geo-r1", criterion: "Title & Legend/Key", description: "Identifies what the map represents and what its symbols/colours mean.", keywords: ["title", "key", "legend", "symbol", "colour", "color", "shows", "map"] },
      { id: "geo-r2", criterion: "Scale & Orientation", description: "States the distance scale or directional reference used.", keywords: ["scale", "distance", "km", "mile", "north", "south", "east", "west", "direction", "compass"] },
      { id: "geo-r3", criterion: "Observed Spatial Pattern", description: "Points to a concrete spatial distribution or cluster visible on the map.", keywords: ["pattern", "region", "coast", "river", "cluster", "area", "where", "north", "south", "dense"] },
      { id: "geo-r4", criterion: "Evidence Boundary", description: "Distinguishes what the map shows from causes that require extra evidence.", keywords: ["cause", "why", "evidence", "not", "cannot", "prove", "missing"] },
    ],
    completionCriteria: [
      "Pass all 3 Geography mastery checks",
      "Complete map key, scale, and pattern exercises",
      "Submit a regional map analysis meeting the 4 Geography rubric criteria",
    ],
    nextSteps: [
      "Topographic contours, elevation profiles, and watershed analysis",
      "Climate zones, precipitation patterns, and human settlement geography",
      "Introduction to Geographic Information Systems (GIS) and spatial datasets",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-usgs-maps",
        title: "USGS — Exploring Maps and Scale",
        publisher: "U.S. Geological Survey",
        href: "https://www.usgs.gov/educational-resources",
        license: "U.S. Public Domain",
        verifiedClaim: "Map scale defines the mathematical ratio between a distance on the map and the corresponding distance on the ground.",
      },
      {
        id: "src-noaa-earth",
        title: "NOAA Education — Earth & Spatial Literacy",
        publisher: "National Oceanic and Atmospheric Administration",
        href: "https://www.noaa.gov/education",
        license: "U.S. Public Domain",
        verifiedClaim: "Thematic maps encode specific variables via a legend; spatial correlation on a single map does not by itself establish causation.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "Title, Key & Frame", description: "Read what a map encodes and what it leaves out.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Scale & Direction", description: "Convert map distance to ground distance and orient accurately.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Spatial Patterns", description: "Spot real geographic distributions without guessing causes.", totalLessons: 4, icon: "devices" },
      { step: 4, title: "Analyse a Region", description: "Complete a verified map analysis report for a real region.", totalLessons: 3, icon: "cloud" },
    ],
    keywords: ["geo", "geography", "map", "place", "country", "region", "earth", "atlas", "climate"],
    modules: [
      mod("geo-1", "What a map shows", "A map is a choice, not the whole place.", [
        ["geo-1a", "Slides", "Title, key, and frame", "Name three things you read before the colours."],
        ["geo-1b", "Practice", "What is missing", "Say one fact this kind of map cannot prove."],
      ], {
        prompt: "Before trusting a colour on a map, you should read…",
        choices: ["The title and the key.", "Only the largest label.", "The compass instead of the key."],
        answer: 0,
        why: "The title says what is mapped. The key says what the marks mean.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("geo-2", "Scale and direction", "Distance and which way is which.", [
        ["geo-2a", "Notes", "Scale", "Say what a scale lets you compare."],
        ["geo-2b", "Practice", "Direction", "Use the compass, not the edge of the screen."],
      ], {
        prompt: "A map scale lets you…",
        choices: ["Know the population by looking at the colour.", "Compare distance on the map with distance on the ground.", "Skip the key."],
        answer: 1,
        why: "Scale converts map distance to ground distance. It is not a population count.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. What a map shows"] }),
      mod("geo-3", "One pattern", "Describe only what you can point to.", [
        ["geo-3a", "Practice", "Point, then say", "Name the pattern and the marks that support it."],
        ["geo-3b", "Notes", "Do not invent a cause", "A pattern on a map is not yet a cause."],
      ], {
        prompt: "A pattern on a map means…",
        choices: ["The cause is already proved.", "You can describe what the marks show, and you still need evidence for why.", "Every region works the same way."],
        answer: 1,
        why: "Reading a map is not the same as proving a cause.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. Scale and direction"] }),
    ],
  },
  {
    id: "cyber",
    subject: "Cybersecurity",
    title: "Stop a SQL Injection & Defend Input",
    blurb: "See how untrusted input can become a command, then how parameterized queries keep input strictly as data.",
    tagline: "Beginner level · 3 modules · Defensive remediation project",
    cover: "/media/covers/ctf.jpg",
    intendedLearner: "Beginners in cybersecurity and software development learning how injection flaws happen and how to remediate them safely.",
    entryRequirements: ["Basic understanding of a login form or database query"],
    outcome: "Explain a SQL injection in plain language and name the defensive control that stops it.",
    objectives: [
      "Identify what a database query protects and how untrusted user input enters an application",
      "Explain how string concatenation allows untrusted input to alter SQL command structure",
      "Remediate injection vulnerabilities using parameterized queries (prepared statements) and defense-in-depth",
    ],
    project: "Write the unsafe query pattern (concatenating untrusted input), the safer remediation pattern (parameterized query), and explain why parameterization keeps user input strictly as data.",
    projectRubric: [
      { id: "cy-r1", criterion: "Unsafe concatenation pattern", description: "Explains how mixing user input directly into SQL text lets input act as a command.", keywords: ["unsafe", "concatenate", "string", "input", "command", "query", "mix", "untrusted"] },
      { id: "cy-r2", criterion: "Parameterized query remediation", description: "Names parameterized queries or prepared statements as the primary fix.", keywords: ["parameter", "parameterized", "prepared", "placeholder", "bind", "safe"] },
      { id: "cy-r3", criterion: "Data vs. command separation", description: "Explains that the database treats the parameter as a literal value, not executable SQL.", keywords: ["data", "value", "literal", "not sql", "obey", "separate", "structure"] },
      { id: "cy-r4", criterion: "Authorized & layered defense", description: "Notes that safe queries pair with authentication, least privilege, and authorized testing.", keywords: ["permission", "password", "auth", "least privilege", "access", "check", "authorized"] },
    ],
    completionCriteria: [
      "Pass all 3 Cybersecurity mastery checks",
      "Complete the defensive query analysis practice steps",
      "Submit a remediation analysis meeting the 4 Cybersecurity rubric criteria",
    ],
    nextSteps: [
      "OWASP Top 10 Web Application Security Risks (Broken Access Control, XSS, SSRF)",
      "NIST Cybersecurity Framework (Govern, Identify, Protect, Detect, Respond, Recover)",
      "Identity & Access Management (IAM), Least Privilege, and Phishing-Resistant MFA",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-owasp-sqli",
        title: "OWASP SQL Injection Prevention Cheat Sheet",
        publisher: "OWASP Foundation",
        href: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        license: "CC-BY-SA 4.0",
        verifiedClaim: "Prepared statements with parameterized queries ensure the database treats user input strictly as data parameters and never as executable SQL commands.",
      },
      {
        id: "src-nist-csf",
        title: "NIST Cybersecurity Framework (CSF) 2.0",
        publisher: "National Institute of Standards and Technology",
        href: "https://www.nist.gov/cyberframework",
        license: "U.S. Public Domain",
        verifiedClaim: "Defensive controls combine secure coding (Protect) with least-privilege access control and continuous monitoring.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "What is protected", description: "Understand how apps ask databases questions about data and identity.", totalLessons: 4, icon: "code" },
      { step: 2, title: "How injection works", description: "See how untrusted text mixed into a command alters query logic.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Parameterized defense", description: "Keep user input strictly as data values with prepared statements.", totalLessons: 4, icon: "devices" },
      { step: 4, title: "Remediation brief", description: "Document the flaw, the parameterized fix, and layered controls.", totalLessons: 3, icon: "cloud" },
    ],
    keywords: ["cyber", "cybersecurity", "security", "sql", "hack", "owasp", "nist", "infosec"],
    modules: [
      mod("cy-1", "What is being protected", "Data, and who is allowed to change it.", [
        ["cy-1a", "Notes", "A login is a question", "Say what the application is asking the database."],
        ["cy-1b", "Practice", "Name the risk", "Say what goes wrong if the typed text becomes part of the command."],
      ], {
        prompt: "SQL injection is possible when…",
        choices: ["The database is turned off.", "Text a person types is treated as part of the command.", "The screen uses a dark colour."],
        answer: 1,
        why: "The failure is mixing untrusted input into the query as if it were instructions.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("cy-2", "How the attack works", "One extra condition can change the question.", [
        ["cy-2a", "Slides", "Data versus command", "Point at the part an attacker wants the database to obey."],
        ["cy-2b", "Notes", "What you will not do", "This lesson does not ask you to attack a system you do not own."],
      ], {
        prompt: "Which description is the attack, not the fix?",
        choices: ["The typed text is stored only as a value.", "The typed text changes the meaning of the query.", "The query is written before the value arrives."],
        answer: 1,
        why: "The attack changes the query. The fix keeps the typed text as a value.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. What is being protected"] }),
      mod("cy-3", "The control", "A parameter is data, not SQL.", [
        ["cy-3a", "Practice", "Say the fix", "Name parameterized queries in one sentence."],
        ["cy-3b", "Notes", "What else still matters", "A safe query does not replace a password or a permission check."],
      ], {
        prompt: "What stops this class of injection?",
        choices: ["Hiding the login button.", "A parameterized query, so input stays data.", "A longer password only."],
        answer: 1,
        why: "The database then receives the input as a value. It does not obey it as SQL.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. How the attack works"] }),
    ],
  },
  {
    id: "bible",
    subject: "Bible Study",
    title: "Read One Passage Carefully",
    blurb: "Read the words first, observe speaker and context, and separate the text from your personal application.",
    tagline: "Beginner level · 3 modules · Passage study & observation project",
    cover: "/media/desk/pulpit.jpg",
    intendedLearner: "Readers who want a disciplined, text-first method for studying Scripture accurately.",
    entryRequirements: ["None"],
    outcome: "Retell one short passage in plain language and separate what the text says from your application.",
    objectives: [
      "Read a passage slowly and identify its central sentence and stated speaker",
      "Summarise the passage accurately in plain language without importing outside claims",
      "Formulate context-grounded questions and distinguish textual observation from personal application",
    ],
    project: "Write a 3-part study note on one passage: (1) what the text explicitly states, (2) one question the passage raises in its context, and (3) your personal reflection clearly labeled as your own application.",
    projectRubric: [
      { id: "bib-r1", criterion: "Direct textual observation", description: "Quotes or states what the verses explicitly say.", keywords: ["verse", "passage", "says", "text", "words", "speaker", "wrote", "read"] },
      { id: "bib-r2", criterion: "Plain-language summary", description: "Retells the core claim accurately without inventing a new doctrine.", keywords: ["summary", "means", "claim", "plain", "context", "chapter"] },
      { id: "bib-r3", criterion: "Context-grounded question", description: "Asks a question that can be checked against the surrounding verses.", keywords: ["question", "ask", "next", "context", "surrounding", "why", "who", "how"] },
      { id: "bib-r4", criterion: "Labeled application", description: "Clearly separates personal application from what the text itself states.", keywords: ["application", "my", "added", "separate", "own", "reflection", "label"] },
    ],
    completionCriteria: [
      "Pass all 3 Bible Study mastery checks",
      "Complete the close-reading and summary practice tasks",
      "Submit a passage study note meeting all 4 rubric criteria",
    ],
    nextSteps: [
      "Tracing literary context across a full chapter and book (Gospels & Epistles)",
      "Comparing cross-references and historical setting responsibly",
      "Leading a small-group passage study using observation, meaning, and application",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-kjv-local",
        title: "King James Version (KJV) Scripture Library",
        publisher: "Noctis Stored Scripture Library",
        href: "/hall",
        license: "Public Domain",
        verifiedClaim: "Careful exegesis begins with what the text explicitly states in its immediate literary context before drawing personal application.",
      },
      {
        id: "src-bibleproject",
        title: "BibleProject — How to Read the Bible",
        publisher: "BibleProject",
        href: "https://bibleproject.com/",
        license: "Free Educational Resource",
        verifiedClaim: "Understanding biblical literature requires attention to speaker, audience, literary genre, and surrounding narrative flow.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "Read the words", description: "Observe the passage, speaker, and key sentence first.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Say it back", description: "Summarise in plain language and label anything you add.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Context & questions", description: "Check surrounding verses before jumping to conclusions.", totalLessons: 3, icon: "devices" },
      { step: 4, title: "Passage study note", description: "Write a complete, honest study note separating text from application.", totalLessons: 3, icon: "cloud" },
    ],
    keywords: ["bible", "bible study", "scripture", "faith", "ephesians", "gospel", "verse", "word"],
    modules: [
      mod("bib-1", "Read the words", "The passage comes before the explanation.", [
        ["bib-1a", "Notes", "Read it once slowly", "Copy the sentence that the rest of the passage depends on."],
        ["bib-1b", "Practice", "Who is speaking", "Name the speaker only if the passage says so."],
      ], {
        prompt: "What belongs in the first reading?",
        choices: ["A theme you like, even if the verses never say it.", "What those verses actually say.", "A different chapter you have not opened."],
        answer: 1,
        why: "The first job is the passage in front of you.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("bib-2", "Say it back", "Plain language, still the same claim.", [
        ["bib-2a", "Practice", "One paragraph", "Retell the passage without adding a new doctrine."],
        ["bib-2b", "Notes", "Mark what you added", "If a sentence is yours, label it as yours."],
      ], {
        prompt: "A fair summary…",
        choices: ["Can add any lesson that sounds useful.", "Stays inside what the passage said, and labels anything added.", "Replaces the passage with a slogan."],
        answer: 1,
        why: "A summary that adds a new claim is no longer a summary of that passage.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. Read the words"] }),
      mod("bib-3", "One next step", "A question, not a speech.", [
        ["bib-3a", "Practice", "Ask one question", "Ask something the passage itself can answer."],
        ["bib-3b", "Notes", "Where to go next", "Open the next verses in the same book before jumping away."],
      ], {
        prompt: "The next study step is…",
        choices: ["Open the next verses of the same passage.", "Start a new topic that the verses never mention.", "Count the page as mastered because it was opened."],
        answer: 0,
        why: "Stay with the text. Opening the page is not mastery.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. Say it back"] }),
    ],
  },
  {
    id: "eng",
    subject: "Engineering",
    title: "Check a Simple Structural Load",
    blurb: "Say what is known, what is assumed, how load transfers to a support, and what would make the design fail.",
    tagline: "Beginner level · 3 modules · Load & failure-mode check project",
    cover: "/media/hall/builders.jpg",
    intendedLearner: "Aspiring engineers, builders, and problem-solvers learning rigorous engineering verification.",
    entryRequirements: ["Basic arithmetic and unit awareness"],
    outcome: "Separate a known load from an assumption, trace load transfer into a support, and name one way the design fails.",
    objectives: [
      "Identify the exact asked quantity and separate given inputs from missing/unknown parameters",
      "Trace the load path from an applied force through structural members into the support reaction",
      "Specify the governing failure condition and refuse to call a design feasible when critical inputs are missing",
    ],
    project: "State one applied load with units, one support reaction path, the calculated result from given inputs, and one specific condition that would make the structure unsafe or fail.",
    projectRubric: [
      { id: "eng-r1", criterion: "Given load & units", description: "States the applied load with explicit physical units (e.g., N, kN, kg, MW) and labels any assumption.", keywords: ["load", "force", "kn", "newton", "kg", "weight", "given", "known", "unit", "assumed"] },
      { id: "eng-r2", criterion: "Support & load path", description: "Explains how the support carries the load into the foundation or next member.", keywords: ["support", "beam", "column", "ground", "foundation", "reaction", "carry", "path"] },
      { id: "eng-r3", criterion: "Calculated check", description: "Shows the quantitative relationship between load and capacity.", keywords: ["calculate", "capacity", "limit", "margin", "factor", "check", "result", "="] },
      { id: "eng-r4", criterion: "Failure mode named", description: "Names what breaks first if the load exceeds capacity or if an input is missing.", keywords: ["fail", "failure", "unsafe", "break", "exceed", "overload", "buckl", "yield", "missing"] },
    ],
    completionCriteria: [
      "Pass all 3 Engineering mastery checks",
      "Complete the givens/unknowns and load-path practice exercises",
      "Submit a structural load & failure-mode check meeting all 4 Engineering rubric criteria",
    ],
    nextSteps: [
      "Free-body diagrams, static equilibrium (∑F = 0, ∑M = 0), and safety factors",
      "Stress, strain, and material yield strength in beams and columns",
      "Multi-domain infrastructure resilience and capacity-vs-peak power verification",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-mit-statics",
        title: "MIT OpenCourseWare — Engineering Mechanics & Statics",
        publisher: "MIT OpenCourseWare",
        href: "https://ocw.mit.edu/",
        license: "CC-BY-NC-SA 4.0",
        verifiedClaim: "Every applied force must be balanced by support reactions along a continuous load path; feasibility requires verifying both member strength and support capacity.",
      },
      {
        id: "src-openstax-statics",
        title: "OpenStax University Physics Volume 1 — Static Equilibrium and Elasticity",
        publisher: "OpenStax (Rice University)",
        href: "https://openstax.org/details/books/university-physics-volume-1",
        license: "CC-BY 4.0",
        verifiedClaim: "When an applied stress exceeds a material's yield or ultimate limit, permanent deformation or structural failure occurs.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "Givens vs. Unknowns", description: "Write what is asked and never invent missing engineering numbers.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Load & Support Path", description: "Trace how forces travel through members into the ground.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Failure Modes", description: "Identify the limiting component before calling a design safe.", totalLessons: 4, icon: "devices" },
      { step: 4, title: "Verify a Load Check", description: "Produce a complete load, support, and failure-condition brief.", totalLessons: 3, icon: "cloud" },
    ],
    keywords: ["engineer", "engineering", "bridge", "load", "force", "structure", "mechanics", "civil"],
    modules: [
      mod("eng-1", "What the problem asks", "Do not answer a different question.", [
        ["eng-1a", "Notes", "Write the asked quantity", "Is it a force, a size, or a yes-or-no?"],
        ["eng-1b", "Practice", "List the givens", "Mark each number known or missing."],
      ], {
        prompt: "Before calculating, you should…",
        choices: ["Invent every missing number.", "Write what is asked and which inputs are actually given.", "Skip the units."],
        answer: 1,
        why: "A missing input is unknown. It is not a chance to invent a precise number.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("eng-2", "Load and support", "A force needs a path into a support.", [
        ["eng-2a", "Slides", "Down and back up", "Say where the load goes."],
        ["eng-2b", "Practice", "One sketch", "Draw the load and the support. Label only what you know."],
      ], {
        prompt: "A support is there to…",
        choices: ["Decorate the drawing.", "Carry the load into the ground or the next member.", "Replace the need for units."],
        answer: 1,
        why: "If the support cannot carry the load, the member's size does not save it.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. What the problem asks"] }),
      mod("eng-3", "What would make it fail", "Name the limit before you call it safe.", [
        ["eng-3a", "Notes", "One failure", "Say the first thing that breaks if the load grows."],
        ["eng-3b", "Practice", "Do not say feasible", "If a needed number is missing, say the check is not finished."],
      ], {
        prompt: "When can you call this check finished?",
        choices: ["When the sketch looks tidy.", "When the asked quantity is calculated from the given inputs and the failure case is named.", "When a video title mentions engineering."],
        answer: 1,
        why: "A tidy picture is not a check. A missing input means the result is not demonstrated.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. Load and support"] }),
    ],
  },
  {
    id: "ai",
    subject: "AI",
    title: "Understand AI Systems & Grounded Verification",
    blurb: "Learn how language models predict tokens, why hallucinations happen, and how source retrieval and evaluation rubrics keep AI answers trustworthy.",
    tagline: "Beginner level · 3 modules · Verified AI workflow project",
    cover: "/media/covers/hall.jpg",
    intendedLearner: "Learners who want to understand how modern AI works and how to verify AI outputs against primary sources.",
    entryRequirements: ["None"],
    outcome: "Explain how an AI model generates text, distinguish token prediction from verified truth, and design a source-grounded verification check.",
    objectives: [
      "Distinguish statistical next-token prediction from verified factual knowledge",
      "Use retrieval-augmented grounding (RAG) and explicit citations to reduce hallucination",
      "Evaluate AI outputs with a rubric that checks accuracy, citations, and uncertainty boundaries",
    ],
    project: "Design a Verified AI Study Workflow: state the task prompt, the trusted source repository used for grounding, one failure/hallucination risk, and the verification rubric used before trusting the output.",
    projectRubric: [
      { id: "ai-r1", criterion: "Prediction vs. truth distinction", description: "Explains that AI models predict probable tokens and require external verification.", keywords: ["token", "predict", "model", "probability", "hallucinat", "verify", "fact"] },
      { id: "ai-r2", criterion: "Trusted source grounding", description: "Names the approved source or retrieval step used to ground the answer.", keywords: ["source", "citation", "retrieve", "ground", "reference", "evidence", "document"] },
      { id: "ai-r3", criterion: "Evaluation & uncertainty rule", description: "Defines how wrong or uncertain claims are caught and refused.", keywords: ["rubric", "check", "uncertain", "refuse", "missing", "accuracy", "test"] },
    ],
    completionCriteria: [
      "Pass all 3 AI mastery checks",
      "Complete the prompt & citation verification exercises",
      "Submit a Verified AI Workflow brief meeting all 3 rubric criteria",
    ],
    nextSteps: [
      "Embeddings, vector search, and Retrieval-Augmented Generation (RAG) architecture",
      "Multi-agent orchestration (Research, Curriculum, Assessment, and Quality & Safety agents)",
      "NIST AI Risk Management Framework (AI RMF) and evaluation benchmarks",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-nist-airmf",
        title: "NIST AI Risk Management Framework (AI RMF 1.0)",
        publisher: "National Institute of Standards and Technology",
        href: "https://www.nist.gov/itl/ai-risk-management-framework",
        license: "U.S. Public Domain",
        verifiedClaim: "Trustworthy AI systems require measurable validity, reliability, transparency, and human-verifiable provenance for generated outputs.",
      },
      {
        id: "src-mit-introml",
        title: "MIT OpenCourseWare — Introduction to Machine Learning",
        publisher: "MIT OpenCourseWare",
        href: "https://ocw.mit.edu/",
        license: "CC-BY-NC-SA 4.0",
        verifiedClaim: "Statistical models generalize from training distributions and can produce confident errors when queried outside verified evidence.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "How Models Predict", description: "Why fluent text is not automatically a verified fact.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Source Grounding", description: "Attach real citations and separate retrieved evidence from guesses.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Verify & Evaluate", description: "Design a rubric that catches hallucinations before publishing.", totalLessons: 4, icon: "cloud" },
    ],
    keywords: ["ai", "artificial intelligence", "machine learning", "llm", "prompt", "agent", "rag", "deep learning"],
    modules: [
      mod("ai-1", "Prediction vs. verified fact", "Fluent language is not proof.", [
        ["ai-1a", "Video", "How next-token prediction works", "State in one sentence why a fluent AI paragraph can still contain a false number."],
        ["ai-1b", "Practice", "Spot the unverified claim", "Separate the verifiable claim from the confident guess."],
      ], {
        prompt: "Why can a language model produce a confident but false statement?",
        choices: [
          "Because it predicts likely word sequences rather than automatically verifying every claim against a primary source.",
          "Because the screen resolution is too low.",
          "Because longer answers are always true.",
        ],
        answer: 0,
        why: "Language models predict probable tokens. Factual accuracy requires grounding in verified sources.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("ai-2", "Source grounding & citations", "Never fabricate a source.", [
        ["ai-2a", "Slides", "Retrieval before generation", "Explain why retrieving a trusted passage first reduces hallucination."],
        ["ai-2b", "Practice", "Check the citation", "Verify that a cited claim actually appears in the named source."],
      ], {
        prompt: "When an AI learning guide cannot find a verified source for a disputed fact, it should…",
        choices: [
          "Invent a realistic-looking book title.",
          "State clearly what is uncertain or unverified and avoid fabricating a citation.",
          "Repeat the claim louder.",
        ],
        answer: 1,
        why: "Honest AI systems state uncertainty explicitly and never fabricate citations.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. Prediction vs. verified fact"] }),
      mod("ai-3", "Evaluation & quality gates", "Check accuracy before publishing.", [
        ["ai-3a", "Notes", "The Quality & Safety rubric", "List three checks an output must pass before a learner relies on it."],
        ["ai-3b", "Practice", "Design your verification rule", "Write one rule that blocks an unverified claim."],
      ], {
        prompt: "What makes an AI-assisted learning workflow trustworthy?",
        choices: [
          "Assuming the first draft is always right.",
          "Combining approved sources, explicit citations, and a verification check that flags unsupported claims.",
          "Hiding the sources from the learner.",
        ],
        answer: 1,
        why: "Provenance + verification rubrics keep AI outputs accountable.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. Source grounding & citations"] }),
    ],
  },
  {
    id: "business",
    subject: "Business",
    title: "Unit Economics & Customer Value Model",
    blurb: "Understand customer problems, revenue vs. variable cost, contribution margin, and break-even sustainability.",
    tagline: "Beginner level · 3 modules · 1-page unit economics project",
    cover: "/media/covers/nightmarket.jpg",
    intendedLearner: "Founders, operators, and students learning how a business creates value and sustains positive unit economics.",
    entryRequirements: ["Basic arithmetic"],
    outcome: "Define a real customer problem, calculate contribution margin per unit, and determine break-even volume.",
    objectives: [
      "Define a specific customer segment and the measurable problem they pay to solve",
      "Calculate unit contribution margin (Price minus Variable Cost per unit)",
      "Distinguish fixed costs from variable costs and verify break-even requirements",
    ],
    project: "Write a 1-Page Unit Economics Brief for a product or service: name the customer, the price per unit, the variable cost per unit, the resulting contribution margin, and what would make the model lose money.",
    projectRubric: [
      { id: "biz-r1", criterion: "Customer & value proposition", description: "Names who buys the product/service and what concrete problem it solves.", keywords: ["customer", "buyer", "client", "problem", "solve", "value", "service", "product"] },
      { id: "biz-r2", criterion: "Price & variable cost per unit", description: "States unit price, variable cost, and positive contribution margin.", keywords: ["price", "cost", "margin", "unit", "revenue", "profit", "variable", "$", "cedi", "dollar"] },
      { id: "biz-r3", criterion: "Break-even & risk condition", description: "Identifies fixed costs or the condition under which the model fails to break even.", keywords: ["fixed", "break-even", "breakeven", "risk", "loss", "fail", "volume", "month"] },
    ],
    completionCriteria: [
      "Pass all 3 Business mastery checks",
      "Complete the customer value and unit margin calculations",
      "Submit a 1-Page Unit Economics Brief meeting all 3 rubric criteria",
    ],
    nextSteps: [
      "Cash flow forecasting, working capital, and runway management",
      "Customer Acquisition Cost (CAC) vs. Lifetime Value (LTV)",
      "Financial statements: Income Statement, Balance Sheet, and Cash Flow Statement",
    ],
    masteryThresholdPct: 80,
    sources: [
      {
        id: "src-openstax-biz",
        title: "OpenStax Introduction to Business & Managerial Accounting",
        publisher: "OpenStax (Rice University)",
        href: "https://openstax.org/subjects/business",
        license: "CC-BY 4.0",
        verifiedClaim: "Contribution margin per unit equals selling price per unit minus variable cost per unit; break-even units equal fixed costs divided by unit contribution margin.",
      },
    ],
    stagePreviews: [
      { step: 1, title: "Customer & Problem", description: "Identify who pays and why before estimating revenue.", totalLessons: 4, icon: "code" },
      { step: 2, title: "Unit Economics", description: "Calculate Price - Variable Cost = Contribution Margin.", totalLessons: 4, icon: "file" },
      { step: 3, title: "Break-Even Brief", description: "Verify how many units cover fixed costs and test failure risks.", totalLessons: 4, icon: "cloud" },
    ],
    keywords: ["business", "finance", "economics", "accounting", "startup", "marketing", "entrepreneur", "margin", "profit"],
    modules: [
      mod("biz-1", "Customer problem & value", "Revenue starts with a real problem someone pays to solve.", [
        ["biz-1a", "Notes", "Who is the customer", "Name the exact customer and the problem they face today."],
        ["biz-1b", "Practice", "Why they switch", "Write one sentence explaining why a customer chooses this solution."],
      ], {
        prompt: "A sustainable business model starts by identifying…",
        choices: [
          "A specific customer and a real problem they are willing to pay to solve.",
          "A logo colour before knowing what is sold.",
          "Assuming everyone in the world will buy on day one.",
        ],
        answer: 0,
        why: "Without a clear customer and problem, revenue projections are unverified guesses.",
      }, { stage: "Foundations", lessonCountLabel: "4 lessons", prerequisites: ["None — entry module"] }),
      mod("biz-2", "Unit economics & margin", "Price minus variable cost per unit.", [
        ["biz-2a", "Slides", "Revenue is not profit", "Separate the selling price from the variable cost required to deliver one unit."],
        ["biz-2b", "Practice", "Calculate contribution margin", "If a meal sells for $12 and ingredients cost $5, find the unit contribution margin."],
      ], {
        prompt: "If a product sells for $20 and costs $8 in materials and delivery per unit, the unit contribution margin is…",
        choices: ["$28", "$12", "$20"],
        answer: 1,
        why: "Contribution margin = Selling Price ($20) − Variable Cost ($8) = $12 per unit.",
      }, { stage: "Core Concepts", lessonCountLabel: "4 lessons", prerequisites: ["1. Customer problem & value"] }),
      mod("biz-3", "Break-even & sustainability", "Covering fixed costs honestly.", [
        ["biz-3a", "Notes", "Fixed vs. variable costs", "Name one cost that stays the same each month even if zero units are sold."],
        ["biz-3b", "Practice", "Name the risk", "State what happens if variable cost per unit exceeds the selling price."],
      ], {
        prompt: "If variable cost per unit is higher than the selling price per unit…",
        choices: [
          "Selling more units automatically creates profit.",
          "Every additional unit sold increases total losses until price or unit cost is fixed.",
          "Fixed costs disappear.",
        ],
        answer: 1,
        why: "Negative unit margin means each sale loses money; volume alone cannot fix negative unit economics.",
      }, { stage: "Final Project", lessonCountLabel: "Final project", prerequisites: ["2. Unit economics & margin"] }),
    ],
  },
];

function enrichLesson(
  lessonId: string,
  kind: JourneyLesson["kind"],
  lessonTitle: string,
  doThis: string,
  moduleTitle: string,
  moduleSummary: string,
): JourneyLesson {
  return {
    id: lessonId,
    title: lessonTitle,
    kind,
    doThis,
    durationMinutes: kind === "Practice" ? 10 : 6,
    objectives: [
      `Understand the core principle behind "${lessonTitle}"`,
      `Complete the practical action: ${doThis}`,
    ],
    notes: `${moduleSummary} In this step (${lessonTitle}), focus on what you can verify directly: ${doThis}`,
    videoScript: {
      hook: `${moduleTitle} — ${lessonTitle}`,
      narration: [
        `Welcome to "${lessonTitle}" inside ${moduleTitle}.`,
        `Core idea: ${moduleSummary}`,
        `Your active task in this lesson: ${doThis}`,
        `Remember: watching or reading this step builds exposure, while completing the practice and passing the module check proves understanding.`,
      ],
      visualCue: `Animated concept diagram illustrating ${moduleTitle.toLowerCase()} → ${lessonTitle.toLowerCase()}`,
      durationSec: 95,
    },
    slides: [
      {
        heading: `1. Why "${lessonTitle}" matters`,
        bullets: [
          moduleSummary,
          `This step prepares you to ${doThis.charAt(0).toLowerCase() + doThis.slice(1)}`,
          "Focus on plain, verifiable reasoning before moving to the next concept.",
        ],
        takeaway: moduleSummary,
      },
      {
        heading: `2. How to apply "${lessonTitle}"`,
        bullets: [
          `Action to perform: ${doThis}`,
          "Separate what is explicitly given from what you are assuming.",
          "Check your work against the module mastery question.",
        ],
        takeaway: doThis,
      },
      {
        heading: `3. Self-check before advancing`,
        bullets: [
          "Can you explain this concept in your own words without repeating jargon?",
          "Have you completed the hands-on practice prompt below?",
          "If anything is unclear, use the Adaptive Tutor buttons to see an analogy or step-by-step breakdown.",
        ],
        takeaway: "Mastery requires explanation + practice + verification.",
      },
    ],
    diagram: {
      title: `${moduleTitle}: Concept Flow`,
      nodes: [
        { label: "1. Input / Principle", detail: moduleSummary },
        { label: `2. ${lessonTitle}`, detail: doThis },
        { label: "3. Verified Output", detail: "Demonstrated understanding ready for the module check" },
      ],
      flowCaption: `Structured progression for ${lessonTitle}`,
    },
    workedExample: {
      scenario: `Applying "${lessonTitle}" in a real beginner scenario`,
      steps: [
        `Identify the core question in ${moduleTitle}.`,
        `Follow the lesson action: ${doThis}`,
        `Verify the result against the definition so no step is guessed.`,
      ],
      result: `A clear, verifiable demonstration of ${lessonTitle}.`,
    },
    vocabulary: [
      { term: moduleTitle, definition: moduleSummary },
      { term: lessonTitle, definition: doThis },
    ],
    adaptiveExplanations: {
      analogy: `Think of "${lessonTitle}" like building with labeled blocks: ${moduleSummary} You first place the block (${doThis}) and then test that it holds weight before stacking the next layer.`,
      stepByStep: `Step 1: Read the core rule (${moduleSummary}). Step 2: Do the concrete action (${doThis}). Step 3: State in one sentence why your result works.`,
      visualWalkthrough: `Picture a 3-box diagram: [Concept: ${moduleTitle}] ➔ [Action: ${lessonTitle} — ${doThis}] ➔ [Check: Prove why the answer is right].`,
    },
    practicalTask: {
      prompt: doThis,
      hint: `Keep your answer specific to "${lessonTitle}". One or two clear sentences are enough.`,
      expectedKeywords: lessonTitle
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3),
    },
    version: "2026.10-v2",
  };
}

function mod(
  id: string,
  title: string,
  summary: string,
  lessons: [string, JourneyLesson["kind"], string, string][],
  check: JourneyCheck,
  extra?: {
    stage?: JourneyStageName;
    lessonCountLabel?: string;
    prerequisites?: string[];
    objectives?: string[];
  },
): JourneyModule {
  return {
    id,
    title,
    summary,
    stage: extra?.stage ?? "Core Concepts",
    lessonCountLabel: extra?.lessonCountLabel ?? `${lessons.length} lessons`,
    prerequisites: extra?.prerequisites ?? [],
    objectives: extra?.objectives ?? [summary],
    lessons: lessons.map(([lessonId, kind, lessonTitle, doThis]) =>
      enrichLesson(lessonId, kind, lessonTitle, doThis, title, summary),
    ),
    check,
    retentionCheck: {
      prompt: `Retention check for "${title}": ${check.prompt}`,
      choices: check.choices,
      answer: check.answer,
      why: check.why,
    },
  };
}

export function pathForTopic(raw: string): JourneyPath {
  const q = raw.trim().toLowerCase();
  if (!q) return JOURNEY_PATHS[0]!;
  const exact = JOURNEY_PATHS.find(
    (path) =>
      path.id === q ||
      path.subject.toLowerCase() === q ||
      path.title.toLowerCase() === q,
  );
  if (exact) return exact;
  const hit = JOURNEY_PATHS.find(
    (path) =>
      path.keywords.some((word) => q.includes(word)) ||
      q.includes(path.subject.toLowerCase()) ||
      q.includes(path.title.toLowerCase()),
  );
  if (hit) return hit;
  const topic = raw.trim().replace(/\s+/g, " ").slice(0, 80) || "this subject";
  return customPath(topic);
}

function customPath(topic: string): JourneyPath {
  const id = `custom-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "topic"}`;
  const pack = matchStudy(topic);
  const practice = pack.free[0]?.name;
  const steps: [string, string, string, JourneyStageName, string][] = pack.vendor
    ? [
        [
          "Foundations & Official Scope",
          `${pack.vendor} issues the official ${topic} credential. Noctis builds your study path.`,
          `Write who issues ${topic}, what prerequisite foundations apply, and where official objectives live on ${pack.vendor}.`,
          "Foundations",
          "4 lessons",
        ],
        [
          "Core Concepts & Domain Breakdown",
          `Master the core concepts that ${pack.vendor} tests for ${topic}.`,
          "Summarise two core domains in plain language and work through one concrete example.",
          "Core Concepts",
          "6 lessons",
        ],
        [
          "Guided Practice",
          practice ? `Practise hands-on with ${practice} and structured exercises.` : "Practise each skill with worked problems.",
          pack.pass,
          "Guided Practice",
          "6 lessons",
        ],
        [
          "Capstone & Readiness Check",
          `Finish one practical artifact for ${topic} that you can explain and verify.`,
          "Write three skills you practised, show one worked example, and name one boundary or limitation.",
          "Final Project",
          "Final project",
        ],
      ]
    : [
        [
          "Foundations",
          `The prerequisite ideas and vocabulary in ${topic}, in plain language.`,
          `Name the foundational principle that the rest of ${topic} depends on.`,
          "Foundations",
          "5 lessons",
        ],
        [
          "Core Concepts",
          `How the main mechanisms and models in ${topic} fit together.`,
          `Explain one core mechanism in ${topic} and trace an example from input to output.`,
          "Core Concepts",
          "6 lessons",
        ],
        [
          "Guided Practice",
          `Apply ${topic} on a concrete problem rather than only reading about it.`,
          `Work through one practical scenario in ${topic} and write the result in your own words.`,
          "Guided Practice",
          "6 lessons",
        ],
        [
          "Build & Verify a Real Result",
          `Produce a tangible outcome in ${topic} and explain how to verify it.`,
          `Create one real project or analysis in ${topic} and state what evidence proves it works.`,
          "Final Project",
          "Final project",
        ],
      ];

  const sources: JourneySourceRef[] = [
    ...(pack.vendor && pack.href
      ? [
          {
            id: `${id}-vendor`,
            title: `${pack.vendor} — Official ${topic} Guide`,
            publisher: pack.vendor,
            href: pack.href,
            license: "Official Vendor Documentation (Attribution)",
            verifiedClaim: pack.pass,
          },
        ]
      : []),
    ...pack.free.map((link, idx) => ({
      id: `${id}-free-${idx}`,
      title: `${link.name} — ${topic}`,
      publisher: link.name,
      href: link.href,
      license: "Open / Free Educational Resource",
      verifiedClaim: `Verified study reference for ${topic}: ${pack.pass}`,
    })),
  ];

  return {
    id,
    subject: topic,
    title: `Learn ${topic}`,
    blurb: pack.vendor
      ? `${topic}: foundations, core concepts, guided practice with ${practice || pack.vendor}, and a practical project you can show.`
      : `A structured path for ${topic}: beginner foundations, core concepts, guided practice, and a real project you can show.`,
    tagline: `Beginner to Confident · ${steps.length} modules · Final project`,
    cover: "/media/covers/chalkboard.jpg",
    intendedLearner: `Learners starting ${topic} who want a clear step-by-step path from foundations to a verified project.`,
    entryRequirements: ["No prior specialist background required"],
    outcome: `Explain ${topic} clearly at your chosen level, pass every module mastery check, and complete one real practical project.`,
    objectives: steps.map(([title, summary]) => `${title}: ${summary}`),
    project: `Produce one practical project or worked analysis in ${topic}, explain the core concepts used, and state how you verified your result.`,
    projectRubric: [
      {
        id: `${id}-r1`,
        criterion: "Core concept explained",
        description: `States the main principle or mechanism in ${topic} in plain language.`,
        keywords: [topic.toLowerCase().split(/\s+/)[0] || "concept", "because", "works", "principle", "foundation", "means"],
      },
      {
        id: `${id}-r2`,
        criterion: "Practical example or artifact",
        description: `Shows a concrete example, calculation, or artifact built for ${topic}.`,
        keywords: ["example", "built", "made", "created", "calculated", "step", "practice", "result", "test"],
      },
      {
        id: `${id}-r3`,
        criterion: "Verification & limits",
        description: "Explains how to check whether the result is right and what would make it fail.",
        keywords: ["check", "verify", "wrong", "fail", "limit", "evidence", "prove", "test"],
      },
    ],
    completionCriteria: [
      `Pass all ${steps.length} module mastery checks`,
      `Complete the guided practice tasks for ${topic}`,
      `Submit a final project description meeting the ${topic} rubric`,
    ],
    nextSteps: [
      `Apply ${topic} to a larger real-world case study`,
      pack.vendor ? `Review official ${pack.vendor} registration and exam blueprint requirements` : `Explore intermediate and advanced modules in ${topic}`,
      `Complete a spaced retention check after 7 days to verify long-term recall`,
    ],
    masteryThresholdPct: 80,
    sources,
    stagePreviews: steps.map(([title, summary], index) => ({
      step: index + 1,
      title,
      description: summary,
      totalLessons: index === 0 ? 5 : index === 3 ? 4 : 6,
      icon: (["code", "file", "devices", "cloud"] as const)[index] ?? "code",
    })),
    keywords: [],
    modules: steps.map(([title, summary, doThis, stage, lessonCountLabel], index) =>
      mod(
        `${id}-${index + 1}`,
        title,
        summary,
        [
          [`${id}-${index + 1}a`, "Video", `${title} — Visual Overview`, `Watch/read the overview of ${title.toLowerCase()} in ${topic} and note the main idea.`],
          [`${id}-${index + 1}b`, "Slides", `${title} — Key Slides & Notes`, `Review the structured slides and vocabulary for ${title.toLowerCase()}.`],
          [`${id}-${index + 1}c`, "Practice", `${title} — Hands-On Practice`, doThis],
        ],
        pack.vendor && index === 0
          ? {
              prompt: `Who issues the official ${topic} exam or credential?`,
              choices: [pack.vendor, "Noctis", "Whoever wrote this lesson"] as [string, string, string],
              answer: 0,
              why: `${pack.vendor} issues ${topic}. Noctis provides your guided study path and practice.`,
            }
          : {
              prompt: `What proves you have mastered “${title}” in ${topic}?`,
              choices: [
                "Opening the page or playing a video title.",
                "You can perform the step, explain why it works, and state what would make the answer wrong.",
                "A timer reaching one hour on the page.",
              ],
              answer: 1,
              why: "A module counts when you can do the step and verify it. Watching a video alone is exposure, not mastery.",
            },
        {
          stage,
          lessonCountLabel,
          prerequisites: index === 0 ? ["None — entry module"] : [`${index}. ${steps[index - 1]![0]}`],
        },
      ),
    ),
  };
}

/**
 * Resolves either a curated journey (if the topic matches Web Design, Science, Geography,
 * Cybersecurity, Bible Study, or Engineering) or generates a structured 5-stage course path.
 */
export function pathForNamedCourse(name: string): JourneyPath {
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 80) || "this subject";
  return pathForTopic(clean);
}

export type JourneyStore = {
  activeId: string;
  subjectId?: string;
  topic: string;
  level: JourneyLevel;
  goal?: JourneyGoal;
  timeCommitment?: JourneyTimeCommitment;
  checks: Record<string, string[]>;
  projects: Record<string, string>;
  lessonsViewed?: Record<string, string[]>;
  practicesDone?: Record<string, string[]>;
  practiceDrafts?: Record<string, Record<string, string>>;
  retentionPassed?: Record<string, string[]>;
  revisionQueue?: Record<string, string[]>;
  custom?: JourneyPath;
  activeJourneys?: string[];
  seen: boolean;
};

const KEY = "noctis-journey-v1";

export const EMPTY_JOURNEY: JourneyStore = {
  activeId: "web",
  topic: "",
  level: "Beginner",
  goal: "project",
  timeCommitment: "30 min/day",
  checks: {},
  projects: {},
  lessonsViewed: {},
  practicesDone: {},
  practiceDrafts: {},
  retentionPassed: {},
  revisionQueue: {},
  activeJourneys: ["web"],
  seen: false,
};

export function readJourney(): JourneyStore {
  if (typeof window === "undefined") return EMPTY_JOURNEY;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "") as Partial<JourneyStore>;
    const resolvedActiveId =
      typeof raw.activeId === "string"
        ? raw.activeId
        : typeof raw.subjectId === "string"
          ? raw.subjectId
          : "web";
    return {
      activeId: resolvedActiveId,
      subjectId: resolvedActiveId,
      topic: typeof raw.topic === "string" ? raw.topic : "",
      level: raw.level === "Intermediate" || raw.level === "Advanced" ? raw.level : "Beginner",
      goal:
        raw.goal === "understand" || raw.goal === "project" || raw.goal === "career" || raw.goal === "exam"
          ? raw.goal
          : "project",
      timeCommitment:
        raw.timeCommitment === "15 min/day" || raw.timeCommitment === "30 min/day" || raw.timeCommitment === "1 hr/day"
          ? raw.timeCommitment
          : "30 min/day",
      checks: raw.checks && typeof raw.checks === "object" ? raw.checks : {},
      projects: raw.projects && typeof raw.projects === "object" ? raw.projects : {},
      lessonsViewed: raw.lessonsViewed && typeof raw.lessonsViewed === "object" ? raw.lessonsViewed : {},
      practicesDone: raw.practicesDone && typeof raw.practicesDone === "object" ? raw.practicesDone : {},
      practiceDrafts: raw.practiceDrafts && typeof raw.practiceDrafts === "object" ? raw.practiceDrafts : {},
      retentionPassed: raw.retentionPassed && typeof raw.retentionPassed === "object" ? raw.retentionPassed : {},
      revisionQueue: raw.revisionQueue && typeof raw.revisionQueue === "object" ? raw.revisionQueue : {},
      custom: raw.custom && typeof raw.custom === "object" ? raw.custom : undefined,
      activeJourneys: Array.isArray(raw.activeJourneys) ? raw.activeJourneys : [resolvedActiveId],
      seen: raw.seen === true || Object.values(raw.checks ?? {}).some((rows) => Array.isArray(rows) && rows.length > 0),
    };
  } catch {
    return EMPTY_JOURNEY;
  }
}

export function writeJourney(store: JourneyStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage quota or private browsing */
  }
}

export function depthLine(level: JourneyLevel) {
  if (level === "Advanced") return "Go further: name the limit, the exception, and what would change the answer.";
  if (level === "Intermediate") return "Use the proper terms, then show one worked example.";
  return "Plain language first. One example. No extra theory.";
}

export type RubricEvaluation = {
  passedCriteria: string[];
  missingCriteria: ProjectRubricItem[];
  scorePct: number;
  verified: boolean;
};

export function evaluateProjectSubmission(path: JourneyPath, submission: string): RubricEvaluation {
  const text = submission.trim().toLowerCase();
  const rubric = path.projectRubric ?? [];
  if (!rubric.length) {
    const ok = text.length >= 40;
    return {
      passedCriteria: ok ? ["default"] : [],
      missingCriteria: [],
      scorePct: ok ? 100 : Math.min(90, Math.round((text.length / 40) * 100)),
      verified: ok,
    };
  }
  const passedCriteria: string[] = [];
  const missingCriteria: ProjectRubricItem[] = [];
  for (const item of rubric) {
    const matched = item.keywords.some((kw) => text.includes(kw.toLowerCase()));
    if (matched && text.length >= 25) {
      passedCriteria.push(item.id);
    } else {
      missingCriteria.push(item);
    }
  }
  const scorePct = Math.round((passedCriteria.length / rubric.length) * 100);
  const verified = text.length >= 40 && scorePct >= 75;
  return { passedCriteria, missingCriteria, scorePct, verified };
}

export type MasteryTier = "Not started" | "Exposure" | "Practice" | "Proficiency" | "Mastery";

export type JourneyIndicators = {
  learningProgressPct: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  knowledgeMasteryPct: number;
  passedChecksCount: number;
  totalModulesCount: number;
  skillsDemonstrated: string[];
  practicesCompletedCount: number;
  retentionPct: number;
  retentionCount: number;
  projectsCompletedCount: number;
  projectEvaluation: RubricEvaluation;
  readinessLabel: string;
  readinessPct: number;
  masteryTier: MasteryTier;
  needsRevision: string[];
};

/**
 * Verifiable Progress Engine (Section 4 & 6 of Spec)
 * Distinguishes Exposure (viewed), Practice (hands-on activity), Proficiency (passed checks), and Mastery (checks + project + retention).
 * Watching a video alone never counts as mastery.
 */
export function computeJourneyIndicators(path: JourneyPath, store: JourneyStore): JourneyIndicators {
  const totalModulesCount = path.modules.length;
  const allLessons = path.modules.flatMap((m) => m.lessons);
  const totalLessonsCount = allLessons.length;

  const viewedSet = new Set(store.lessonsViewed?.[path.id] ?? []);
  const practiceSet = new Set(store.practicesDone?.[path.id] ?? []);
  const passedSet = new Set(store.checks[path.id] ?? []);
  const retentionSet = new Set(store.retentionPassed?.[path.id] ?? []);
  const revisionList = store.revisionQueue?.[path.id] ?? [];

  // A lesson counts as completed when either its module check is passed, its practice is done, or it was studied
  const completedLessonsCount = allLessons.filter(
    (l) => viewedSet.has(l.id) || practiceSet.has(l.id) || path.modules.some((m) => passedSet.has(m.id) && m.lessons.some((ml) => ml.id === l.id)),
  ).length;

  const passedChecksCount = path.modules.filter((m) => passedSet.has(m.id)).length;
  const practicesCompletedCount = allLessons.filter((l) => practiceSet.has(l.id)).length + passedChecksCount;

  // Knowledge mastery is strictly based on verified checks & practical demonstration, NEVER video views alone
  const knowledgeMasteryPct = totalModulesCount
    ? Math.round((passedChecksCount / totalModulesCount) * 100)
    : 0;

  const learningProgressPct = totalModulesCount
    ? Math.round(((passedChecksCount * 0.7 + (completedLessonsCount / Math.max(1, totalLessonsCount)) * totalModulesCount * 0.3) / totalModulesCount) * 100)
    : 0;

  const projectDraft = store.projects[path.id] ?? "";
  const projectEvaluation = evaluateProjectSubmission(path, projectDraft);
  const projectComplete = projectEvaluation.verified && passedChecksCount === totalModulesCount;
  const projectsCompletedCount = projectComplete ? 1 : 0;

  const skillsDemonstrated = path.modules
    .filter((m) => passedSet.has(m.id))
    .map((m) => m.title);

  const retentionCount = path.modules.filter((m) => retentionSet.has(m.id) || passedSet.has(m.id)).length;
  const retentionPct = totalModulesCount ? Math.round((retentionCount / totalModulesCount) * 100) : 0;

  const readinessPct = Math.round(
    knowledgeMasteryPct * 0.65 + (projectEvaluation.verified ? 35 : Math.min(25, projectEvaluation.scorePct * 0.25)),
  );

  let masteryTier: MasteryTier = "Not started";
  if (projectComplete && knowledgeMasteryPct === 100) {
    masteryTier = "Mastery";
  } else if (passedChecksCount > 0) {
    masteryTier = "Proficiency";
  } else if (practicesCompletedCount > 0) {
    masteryTier = "Practice";
  } else if (viewedSet.size > 0) {
    masteryTier = "Exposure";
  }

  const threshold = path.masteryThresholdPct ?? 80;
  const readinessLabel =
    masteryTier === "Mastery"
      ? "Ready for next level (Mastery verified)"
      : knowledgeMasteryPct >= threshold
        ? "Threshold met — submit final project"
        : passedChecksCount > 0
          ? `In progress (${knowledgeMasteryPct}% of ${threshold}% mastery threshold)`
          : viewedSet.size > 0
            ? "Exposure only — pass a check to prove understanding"
            : "Ready to start Module 1";

  const needsRevision = path.modules
    .filter((m) => revisionList.includes(m.id) && !passedSet.has(m.id))
    .map((m) => m.title);

  return {
    learningProgressPct,
    completedLessonsCount,
    totalLessonsCount,
    knowledgeMasteryPct,
    passedChecksCount,
    totalModulesCount,
    skillsDemonstrated,
    practicesCompletedCount,
    retentionPct,
    retentionCount,
    projectsCompletedCount,
    projectEvaluation,
    readinessLabel,
    readinessPct,
    masteryTier,
    needsRevision,
  };
}

export function orchestratorBrief(path: JourneyPath, store: JourneyStore) {
  const indicators = computeJourneyIndicators(path, store);
  const passed = new Set(store.checks[path.id] ?? []);
  const nextModule = path.modules.find((m) => !passed.has(m.id)) ?? null;
  const connectedSources = APPROVED_SOURCES.filter((s) => s.state === "Connected").length;

  return {
    activeStage: !store.seen
      ? "Step 1 — Choose an idea & calibrate"
      : nextModule
        ? `Step 3 & 4 — Study & prove "${nextModule.title}"`
        : indicators.projectsCompletedCount === 0
          ? "Step 5 — Complete & verify final project"
          : "Journey Complete — Verified Mastery",
    nextActionLabel: nextModule
      ? `Start "${nextModule.title}" (${nextModule.lessons[0]?.title ?? "Lesson 1"})`
      : indicators.projectsCompletedCount === 0
        ? `Submit final project: ${path.project}`
        : `Review completion certificate & next steps`,
    connectedSourcesCount: connectedSources,
    indicators,
  };
}

/**
 * Developer Implementation Specification v1.0 — Section 8: Learning-state rules
 */
export type JourneyLifecycleState =
  | "Draft"
  | "Generating"
  | "Ready"
  | "Active"
  | "Completed"
  | "Archived"
  | "Failed";

export type ModuleStatusState =
  | "Locked"
  | "Available"
  | "In Progress"
  | "Needs Revision"
  | "Completed";

export type LessonStatusState =
  | "Available"
  | "In Progress"
  | "Awaiting Assessment"
  | "Completed"
  | "Needs Revision";

export type GenerationJobState =
  | "Queued"
  | "Running"
  | "Reviewing"
  | "Published"
  | "Failed";

export function getJourneyLifecycleState(
  path: JourneyPath,
  store: JourneyStore,
  jobState?: GenerationJobState,
): JourneyLifecycleState {
  if (jobState === "Failed") return "Failed";
  if (jobState === "Queued" || jobState === "Running" || jobState === "Reviewing") return "Generating";
  const indicators = computeJourneyIndicators(path, store);
  if (indicators.masteryTier === "Mastery" && indicators.projectsCompletedCount > 0) return "Completed";
  if (
    indicators.completedLessonsCount > 0 ||
    indicators.passedChecksCount > 0 ||
    indicators.practicesCompletedCount > 0 ||
    (store.lessonsViewed?.[path.id]?.length ?? 0) > 0 ||
    (store.projects[path.id]?.trim().length ?? 0) > 0
  ) {
    return "Active";
  }
  if (store.seen || jobState === "Published") return "Ready";
  return "Draft";
}

export function getModuleStatusState(
  path: JourneyPath,
  modIndex: number,
  store: JourneyStore,
  allowOverride = false,
): ModuleStatusState {
  const modItem = path.modules[modIndex];
  if (!modItem) return "Locked";
  const passedSet = new Set(store.checks[path.id] ?? []);
  const revisionList = store.revisionQueue?.[path.id] ?? [];
  const viewedSet = new Set(store.lessonsViewed?.[path.id] ?? []);
  const practiceSet = new Set(store.practicesDone?.[path.id] ?? []);

  if (passedSet.has(modItem.id)) return "Completed";
  if (revisionList.includes(modItem.id)) return "Needs Revision";

  const hasActivity = modItem.lessons.some((l) => viewedSet.has(l.id) || practiceSet.has(l.id));
  if (hasActivity) return "In Progress";

  if (modIndex === 0 || allowOverride) return "Available";
  const prevMod = path.modules[modIndex - 1];
  if (prevMod && passedSet.has(prevMod.id)) return "Available";
  return "Locked";
}

export function getLessonStatusState(
  path: JourneyPath,
  modItem: JourneyModule,
  lesson: JourneyLesson,
  store: JourneyStore,
): LessonStatusState {
  const passedSet = new Set(store.checks[path.id] ?? []);
  const revisionList = store.revisionQueue?.[path.id] ?? [];
  const viewedSet = new Set(store.lessonsViewed?.[path.id] ?? []);
  const practiceSet = new Set(store.practicesDone?.[path.id] ?? []);

  if (passedSet.has(modItem.id) && (practiceSet.has(lesson.id) || viewedSet.has(lesson.id))) {
    return "Completed";
  }
  if (revisionList.includes(modItem.id)) return "Needs Revision";
  if (practiceSet.has(lesson.id)) return "Awaiting Assessment";
  if (viewedSet.has(lesson.id)) return "In Progress";
  return "Available";
}

/**
 * Developer Implementation Specification v1.0 — Section 3: Screen 01–10 Inventory
 */
export type SpecScreenId =
  | "screen-01-home"
  | "screen-02-discover"
  | "screen-03-create"
  | "screen-04-overview"
  | "screen-05-lesson"
  | "screen-06-assessment"
  | "screen-07-projects"
  | "screen-08-progress"
  | "screen-09-noctis"
  | "screen-10-completion";

export const SPEC_SCREENS: {
  id: SpecScreenId;
  number: string;
  label: string;
  shortLabel: string;
  primaryCta: string;
  purpose: string;
}[] = [
  {
    id: "screen-01-home",
    number: "01",
    label: "Learning Home",
    shortLabel: "01 · Home",
    primaryCta: "Start a learning journey",
    purpose: "Topic input, suggested subjects, continue-learning card, recent journeys, and Noctis next action.",
  },
  {
    id: "screen-02-discover",
    number: "02",
    label: "Discover Subjects",
    shortLabel: "02 · Discover",
    primaryCta: "Explore course",
    purpose: "Search and optional filters across Science, Geography, Engineering, Web Design, Cybersecurity, AI, Bible Study, and Business.",
  },
  {
    id: "screen-03-create",
    number: "03",
    label: "Create My Learning Path",
    shortLabel: "03 · Create Path",
    primaryCta: "Review and create my journey",
    purpose: "Configure goal, level, pace, deadline, and formats; inspect prerequisites and generated curriculum draft.",
  },
  {
    id: "screen-04-overview",
    number: "04",
    label: "Journey Overview",
    shortLabel: "04 · Journey",
    primaryCta: "Start or continue the next lesson",
    purpose: "Curriculum outline, module statuses (Locked, Available, In Progress, Needs Revision, Completed), milestones, and override controls.",
  },
  {
    id: "screen-05-lesson",
    number: "05",
    label: "Lesson Player",
    shortLabel: "05 · Lesson",
    primaryCta: "Understand the lesson and complete its learning activity",
    purpose: "Video script, slide deck, transcript, notes, diagram, worked example, vocabulary, and media fallback.",
  },
  {
    id: "screen-06-assessment",
    number: "06",
    label: "Practice & Assessment",
    shortLabel: "06 · Practice & Quiz",
    primaryCta: "Submit answer & verify mastery",
    purpose: "Separates low-stakes practice exercises from formal mastery assessments with answer rationales and remediation.",
  },
  {
    id: "screen-07-projects",
    number: "07",
    label: "Projects & Portfolio",
    shortLabel: "07 · Projects",
    primaryCta: "Build, submit, and improve a real deliverable",
    purpose: "Project brief, deliverables, acceptance criteria, rubric evaluator, revision history, and portfolio sharing controls.",
  },
  {
    id: "screen-08-progress",
    number: "08",
    label: "My Progress",
    shortLabel: "08 · Progress",
    primaryCta: "Identify and close the next learning gap",
    purpose: "Curriculum completion, assessment performance, competency mastery, retention checks, and explicit score formulas.",
  },
  {
    id: "screen-09-noctis",
    number: "09",
    label: "Noctis Learning Guide",
    shortLabel: "09 · Ask Noctis",
    primaryCta: "Resolve confusion and continue learning",
    purpose: "Context-aware AI tutor with simpler explanations, extra examples, revision questions, source comparisons, and citations.",
  },
  {
    id: "screen-10-completion",
    number: "10",
    label: "Journey Completion",
    shortLabel: "10 · Completion",
    primaryCta: "View achievement, share eligible work, or advance to the next level",
    purpose: "Learning report, verified skills, project evidence, outstanding requirements, and gated completion certificate.",
  },
];

/**
 * Developer Implementation Specification v1.0 — Screen 09: Noctis Learning Guide Actions
 */
export type NoctisGuideActionId =
  | "simpler"
  | "example"
  | "summarise"
  | "revision-questions"
  | "wrong-answer"
  | "compare-sources"
  | "plan-project"
  | "next-step";

export const NOCTIS_GUIDE_ACTIONS: {
  id: NoctisGuideActionId;
  label: string;
  description: string;
}[] = [
  { id: "simpler", label: "Explain more simply", description: "Plain-language analogy without jargon" },
  { id: "example", label: "Give another example", description: "Concrete worked scenario step by step" },
  { id: "summarise", label: "Summarise this lesson", description: "Core takeaways and vocabulary in 3 bullets" },
  { id: "revision-questions", label: "Generate revision questions", description: "Self-check questions to test recall" },
  { id: "wrong-answer", label: "Explain a wrong answer", description: "Diagnose misconceptions and how to fix them" },
  { id: "compare-sources", label: "Compare supported sources", description: "Cross-check verified claims and licenses" },
  { id: "plan-project", label: "Help plan a project", description: "Break the final deliverable into milestones" },
  { id: "next-step", label: "Recommend the next learning step", description: "Personalised next action from your progress" },
];

export function generateNoctisTutorResponse(
  action: NoctisGuideActionId,
  path: JourneyPath,
  modItem: JourneyModule,
  lesson: JourneyLesson,
  store: JourneyStore,
): {
  heading: string;
  body: string;
  bullets: string[];
  citations: JourneySourceRef[];
  uncertaintyNote: string;
} {
  const indicators = computeJourneyIndicators(path, store);
  const citations: JourneySourceRef[] = path.sources?.length ? path.sources : [];
  const uncertaintyNote =
    "Grounded in verified course sources. Noctis never fabricates citations; claims outside retrieved sources are explicitly marked as unverified.";

  switch (action) {
    case "simpler":
      return {
        heading: `Simpler Explanation — ${lesson.title}`,
        body: lesson.adaptiveExplanations?.analogy ?? lesson.notes ?? modItem.summary,
        bullets: [
          `In plain words: ${modItem.summary}`,
          `What to do right now: ${lesson.doThis}`,
          `Level calibration (${store.level}): ${depthLine(store.level)}`,
        ],
        citations,
        uncertaintyNote,
      };
    case "example":
      return {
        heading: `Worked Example — ${lesson.workedExample?.scenario ?? lesson.title}`,
        body: `Here is a concrete walkthrough for "${lesson.title}" inside ${modItem.title}:`,
        bullets: [
          ...(lesson.workedExample?.steps ?? [lesson.doThis]),
          `Verified result: ${lesson.workedExample?.result ?? modItem.summary}`,
        ],
        citations,
        uncertaintyNote,
      };
    case "summarise":
      return {
        heading: `Lesson Summary — ${lesson.title}`,
        body: lesson.notes ?? modItem.summary,
        bullets: [
          ...(lesson.objectives ?? [lesson.doThis]),
          ...(lesson.vocabulary ?? []).map((v) => `${v.term}: ${v.definition}`),
        ],
        citations,
        uncertaintyNote,
      };
    case "revision-questions":
      return {
        heading: `Revision Questions — ${modItem.title}`,
        body: "Test your understanding before or after taking the formal module check:",
        bullets: [
          `1. Concept check: ${modItem.check.prompt}`,
          `2. Practical application: How would you demonstrate "${lesson.doThis}" without guessing?`,
          `3. Boundary check: What would make an answer in "${modItem.title}" invalid or incomplete?`,
        ],
        citations,
        uncertaintyNote,
      };
    case "wrong-answer":
      return {
        heading: `Remediation & Answer Rationale — ${modItem.title}`,
        body: `For the mastery question "${modItem.check.prompt}", the verified answer is "${modItem.check.choices[modItem.check.answer]}".`,
        bullets: [
          `Why this is right: ${modItem.check.why}`,
          `Step-by-step fix: ${lesson.adaptiveExplanations?.stepByStep ?? lesson.doThis}`,
          `Visual check: ${lesson.adaptiveExplanations?.visualWalkthrough ?? modItem.summary}`,
        ],
        citations,
        uncertaintyNote,
      };
    case "compare-sources":
      return {
        heading: `Supported Sources Comparison — ${path.subject}`,
        body: citations.length
          ? `Comparing ${citations.length} verified reference source(s) approved for ${path.title}:`
          : "No external vendor source is required for this introductory module; claims rely on internal lesson specifications.",
        bullets: citations.map(
          (s) => `${s.title} (${s.publisher}, ${s.license}): "${s.verifiedClaim}"`,
        ),
        citations,
        uncertaintyNote,
      };
    case "plan-project":
      return {
        heading: `Project Milestone Plan — ${path.title}`,
        body: `Final Deliverable: ${path.project}`,
        bullets: (path.projectRubric ?? []).map(
          (r, idx) => `Milestone ${idx + 1} (${r.criterion}): ${r.description} [Include terms like: ${r.keywords.slice(0, 3).join(", ")}]`,
        ),
        citations,
        uncertaintyNote,
      };
    case "next-step":
    default: {
      const brief = orchestratorBrief(path, store);
      return {
        heading: `Recommended Next Step — ${brief.activeStage}`,
        body: `Current Mastery Tier: ${indicators.masteryTier} (${indicators.knowledgeMasteryPct}% checks passed, ${indicators.practicesCompletedCount} practical tasks completed).`,
        bullets: [
          `Immediate next action: ${brief.nextActionLabel}`,
          ...(indicators.needsRevision.length
            ? [`Priority revision needed: ${indicators.needsRevision.join(", ")}`]
            : ["No modules currently flagged for revision."]),
          `Completion target: ${path.outcome}`,
        ],
        citations,
        uncertaintyNote,
      };
    }
  }
}

/**
 * Developer Implementation Specification v1.0 — Section 7: API Contracts Registry
 */
export const SPEC_API_CONTRACTS: {
  method: "GET" | "POST";
  endpoint: string;
  purpose: string;
  authScope: string;
}[] = [
  { method: "POST", endpoint: "/api/journeys", purpose: "Create a journey draft from a user goal and learning preferences.", authScope: "Authenticated user (owner)" },
  { method: "GET", endpoint: "/api/journeys", purpose: "List the authenticated user's journeys.", authScope: "Authenticated user (owner)" },
  { method: "GET", endpoint: "/api/journeys/:id", purpose: "Return the journey, curriculum, status, and next recommended action.", authScope: "Owner verification required" },
  { method: "POST", endpoint: "/api/journeys/:id/generate", purpose: "Start or resume asynchronous curriculum and lesson-generation work.", authScope: "Owner + rate-limited" },
  { method: "GET", endpoint: "/api/jobs/:jobId", purpose: "Return background job status (Queued, Running, Reviewing, Published, Failed) and actionable errors.", authScope: "Owner verification required" },
  { method: "GET", endpoint: "/api/lessons/:id", purpose: "Return authorised lesson content, version, source references, and media assets.", authScope: "Enrolled learner" },
  { method: "POST", endpoint: "/api/lessons/:id/progress", purpose: "Save activity progress (Exposure / Practice) without awarding mastery automatically.", authScope: "Authenticated user (owner)" },
  { method: "POST", endpoint: "/api/assessments/:id/attempts", purpose: "Submit and evaluate a formal assessment attempt with feedback and remediation.", authScope: "Authenticated user (owner)" },
  { method: "GET", endpoint: "/api/progress", purpose: "Return the authenticated user's progress, separate score formulas, and competency evidence.", authScope: "Authenticated user (owner)" },
  { method: "POST", endpoint: "/api/projects/:id/submissions", purpose: "Create and evaluate a project submission against the course rubric.", authScope: "Authenticated user + safe input validation" },
  { method: "POST", endpoint: "/api/noctis/sessions/:id/messages", purpose: "Send a question to Noctis with authorised journey, module, lesson, and gap context.", authScope: "Authenticated user + grounded citations" },
];

