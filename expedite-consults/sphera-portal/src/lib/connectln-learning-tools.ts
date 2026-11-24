import type {
  LearnByDoingLesson,
  SkilledTradesCategory,
} from "./skilled-trades-learn-by-doing-data"
import { LEARN_CATEGORY_META } from "./skilled-trades-learn-by-doing-data"

export function formatSecondsLabel(rawSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(rawSeconds) ? rawSeconds : 0))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export interface LessonChecklistPack {
  ppe: string[]
  tools: string[]
  steps: string[]
}

const CATEGORY_CHECKLIST_PRESETS: Record<
  SkilledTradesCategory,
  { ppe: string[]; tools: string[]; steps: string[] }
> = {
  Carpentry: {
    ppe: ["ANSI Z87+ safety glasses", "Hearing protection", "Work gloves for rough lumber", "Dust mask / N95 for cutting"],
    tools: ["25 ft / 8m lockable tape measure", "Speed square & sharp carpenter pencil", "Circular saw or hand saw + clamps", "Spirit / torpedo level"],
    steps: ["Verify rough measurements twice before marking", "Clamp stock securely and confirm clear cut path", "Dry-fit joints and check square/level", "Clean shavings and verify fastener flush finish"],
  },
  "Auto Mechanics": {
    ppe: ["Oil-resistant nitrile gloves", "Safety glasses / face shield", "Closed-toe composite/steel boots"],
    tools: ["OBD-II diagnostic scanner / multimeter", "Torque wrench & 6-point metric/SAE socket set", "Wheel chocks & rated jack stands"],
    steps: ["Chock wheels & support vehicle on rated stands before crawling under", "Inspect fluid levels, belts & connectors visually first", "Torque critical fasteners to factory spec in crisscross order", "Clear fault codes & test-verify repair"],
  },
  "Painting & Decorating": {
    ppe: ["Safety glasses for ceiling work", "Organic vapor respirator / N95 for sanding", "Washable coveralls"],
    tools: ["2.5 in angled sash brush & 9 in roller frame", "Low-tack painter's tape & drop cloths", "Putty knife, sanding sponge & paint tray"],
    steps: ["Mask trim cleanly and lay canvas/poly drop cloths", "Clean, dull-sand glossy surfaces and spot-prime", "Cut in edges first with steady wet-edge control", "Roll in overlapping W-patterns and inspect under raking light"],
  },
  Plumbing: {
    ppe: ["Safety glasses (overhead drip protection)", "Waterproof nitrile gloves", "Kneepads & heat shield cloth (if soldering)"],
    tools: ["Basin & slip-joint pliers / pipe wrench", "Tubing cutter, reamer & deburring tool", "PTFE tape, flux/solder or crimper & bucket"],
    steps: ["Shut off branch/main isolation valve and drain residual pressure", "Square-cut, deburr and clean pipe ends dry before joining", "Verify pitch/slope and hanger spacing", "Pressurize slowly and dry-wipe every joint to inspect for weeping"],
  },
  "Electrical Fundamentals": {
    ppe: ["Rated insulating gloves", "Safety glasses", "Non-conductive footwear"],
    tools: ["CAT III True-RMS multimeter & non-contact voltage tester (NCVT)", "Insulated wire strippers & torquescrewdriver", "Lockout/Tagout (LOTO) lock & circuit breaker finder"],
    steps: ["Confirm live-dead-live on known live source, then test isolated circuit at zero volts", "Verify conductor gauge matches breaker ampacity", "Make tight mechanical & torque-verified terminations with no exposed copper", "Confirm ground continuity & GFCI/AFCI trip before re-energizing"],
  },
  Welding: {
    ppe: ["Auto-darkening welding helmet (shade 10-13)", "Leather welding jacket, gauntlets & boots", "Welding respirator / fume extraction"],
    tools: ["Angle grinder with flap & wire wheels", "Welding clamps, magnets & chipping hammer", "Proper filler rod / MIG spool & shielding gas regulator"],
    steps: ["Clear flammables within 35 ft (11 m) radius & verify fire extinguisher", "Clean base metal to bright steel and check ground clamp contact", "Run tack welds first to control distortion before full pass", "Deslag, inspect bead fusion/undercut & let cool safely"],
  },
  HVAC: {
    ppe: ["Refrigerant-rated gloves (frostbite protection)", "Safety glasses", "Lockout-tagout safety tag"],
    tools: ["Manifold gauges & micron vacuum gauge", "Multimeter with capacitor microfarad & temp clamp", "Flaring/torque tools & leak detector"],
    steps: ["Disconnect high & low voltage power and discharge run capacitors safely", "Inspect airflow/filters/coils before condemning refrigerant charge", "Pressure-test with dry nitrogen before evacuating below 500 microns", "Verify superheat, subcooling & delta-T across indoor coil"],
  },
  "Masonry & Tile": {
    ppe: ["Dust mask / P100 respirator for dry mixes & cutting", "Safety glasses", "Heavy latex/rubber masonry gloves"],
    tools: ["Margin & notched trowels", "Tile spacers, rubber mallet & brick jointer", "4 ft level, chalk line & wet saw / grinder"],
    steps: ["Check substrate flatness, moisture barrier & dry-lay pattern for balanced cuts", "Mix mortar/thinset to peanut-butter consistency and allow slake time", "Key thinset flat then comb uniform parallel ridges", "Back-butter large format tiles and verify flush lippage"],
  },
  "Roofing & Drywall": {
    ppe: ["Fall harness / anchor check (roof work)", "Safety glasses & dust mask (gypsum dust)", "Cut-resistant gloves & slip-resistant boots"],
    tools: ["Utility knife, T-square & drywall screw gun / hammer tacker", "6 in / 10 in taping knives & mud pan", "Chalk line & pry bar"],
    steps: ["Inspect deck sheathing & underlayment integrity before covering", "Stagger vertical seams and drive fasteners flush without tearing paper/shingles", "Respect flashing overlap order (water sheds downhill)", "Feather compound coats cleanly to minimize dusty sanding"],
  },
  "Solar & Energy": {
    ppe: ["Class 00 / 1000V DC arc-rated PPE", "Fall arrest harness (rooftop array)", "Safety glasses"],
    tools: ["True-RMS 1000V DC clamp meter & irradiance check", "MC4 torque & crimp kit", "Roof flashing & torque wrench"],
    steps: ["Cover PV modules or disconnect DC isolator before breaking MC4 connectors under load", "Verify array open-circuit voltage (Voc) adjusted for cold-temp factor", "Torque structural lag bolts & rack bonding lugs to spec", "Verify rapid-shutdown initiation and reverse-polarity check"],
  },
  "Machining & Repair": {
    ppe: ["ANSI safety glasses (no loose sleeves/jewelry around spindles!)", "Steel-toe shoes", "Deburring gloves (static handling only)"],
    tools: ["Calipers (0.001 in / 0.02 mm) & micrometer", "Dial indicator & torque wrench", "Cutting fluid & deburring tool"],
    steps: ["Verify chuck key removed and workholding rigidly clamped", "Zero datum axes carefully and double-check feeds/speeds", "Measure first article dimensionally before batch run", "Deburr sharp edges & wipe/oil precision ways after cleanup"],
  },
  "Agriculture & Landscaping": {
    ppe: ["Ear & eye protection", "Long sleeves & sun/chemical protection", "Reinforced boots & leather gloves"],
    tools: ["Bypass pruners / loppers / soil auger", "Soil pH / moisture meter & grading rake", "Line trimmer / spreader calibrated for rate"],
    steps: ["Identify underground irrigation/utility lines before digging", "Test soil drainage & pH before amending or planting", "Set root flare cleanly at grade height (never bury trunks)", "Deep-water & apply 2-3 in mulch ring leaving trunk clear"],
  },
  "Culinary & Hospitality": {
    ppe: ["Clean apron & non-slip kitchen shoes", "Cut-resistant glove for mandoline/oysters", "Hair restraint"],
    tools: ["Calibrated instant-read thermometer", "Honed chef knife & stabilized cutting board (damp towel under)", "Color-coded sanitation buckets"],
    steps: ["Wash hands 20s and sanitize prep surface", "Separate raw proteins from ready-to-eat produce (mise en place)", "Verify internal cook & chill holding temperatures outside 40-140°F zone", "Clean as you go & label date dots"],
  },
  "Barbering & Beauty": {
    ppe: ["Barbicide / EPA disinfectant compliance", "Fresh neck strip / single-use drape", "Gloves when mixing color or straight-razor work"],
    tools: ["Clippers & detachable guards (sanitized)", "Shear-over-comb shears & clean combs", "Alcohol / disinfectant jar & spray bottle"],
    steps: ["Sanitize blades, combs & station thoroughly before client sits", "Consult client hairline, crown growth direction & length goal", "Blend weight lines gradually using lever & corner-of-blade work", "Brush loose hair & finish outline cleanly without skin irritation"],
  },
  "Tailoring & Sewing": {
    ppe: ["Thimble / finger guard", "Iron heat-safety mat awareness", "Pin cushion wrist strap (never hold pins in mouth!)"],
    tools: ["Fabric shears & seam ripper", "Flexible measuring tape & tailor chalk", "Universal/ballpoint needles & pressing ham"],
    steps: ["Check grainline & pre-shrink fabric before cutting", "Baste or pin perpendicular to seam allowance line", "Match needle & thread weight to fabric stretch", "Press every seam open/flat before intersecting the next seam"],
  },
  "Healthcare & Nursing": {
    ppe: ["Medical exam gloves", "Surgical mask / face shield per isolation protocol", "Alcohol-based hand rub / sanitizer"],
    tools: ["Stethoscope & blood pressure cuff (properly sized)", "Pulse oximeter, watch with second hand & thermometer", "Sterile barrier supplies / tourniquet"],
    steps: ["Perform two-identifier patient check & hand hygiene at point of care", "Zero/calibrate cuff at heart level and observe full 60s if irregular", "Maintain sterile field margins and immediate sharps disposal", "Document objective readings clearly with timestamp & clinical context"],
  },
  "Software & AI": {
    ppe: ["Ergonomic posture & 20-20-20 eye break check", "No production secrets in prompts/logs"],
    tools: ["Terminal / Git + VS Code", "Local dev runtime & curl / API inspector", "Type-checker & automated test runner"],
    steps: ["Reproduce issue or define input/output contract & edge cases first", "Read surrounding module conventions before editing", "Keep functions focused with explicit error handling", "Verify with type-check, unit/smoke test & diff review"],
  },
  "Cybersecurity & IT": {
    ppe: ["Written scope / authorization check (isolated lab only)", "MFA hardware key & encrypted credentials vault"],
    tools: ["Packet analyzer / log SIEM console", "Browser DevTools / HTTP proxy & curl", "Dependency scanner & least-privilege IAM checklist"],
    steps: ["Confirm written authorization and isolate test environment", "Identify asset boundary, input vectors & auth controls", "Validate exploitability/remediation without destructive payloads", "Verify fix closes root cause & review audit logs"],
  },
  "Finance & Business": {
    ppe: ["Written client estimate / signed scope approval", "Separate business & personal receipt trail"],
    tools: ["Job-costing spreadsheet / quoting calculator", "Invoicing & tax reserve ledger", "Materials + labor hours tracker"],
    steps: ["Measure exact quantities + 10% realistic waste allowance", "Price loaded labor (wages + insurance + drive time), not bare wage", "Add overhead recovery & healthy target net profit margin", "Present written milestones (deposit, progress, final completion)"],
  },
  "Law & Legal": {
    ppe: ["Confidential client data handling", "Accurate timestamped evidence log"],
    tools: ["Contract template & local jurisdiction checklist", "Scope-of-work & change-order addendum", "Notice / lien / permit deadline calendar"],
    steps: ["Clarify parties, exact deliverables, exclusions & payment triggers", "Verify state/national licensing, permit & statutory notice windows", "Put all scope changes in signed written addenda before work", "Archive signed copies and completion sign-offs safely"],
  },
  "Creative Media & Design": {
    ppe: ["Hearing-safe monitor levels (<80 dB)", "Color-calibrated display brightness & surge-protected rig"],
    tools: ["Camera/mic kit + backup batteries & SD cards", "Key/fill lighting & acoustic dampening", "Color/NLE workstation & backup drive"],
    steps: ["Check audio levels (-12 dB peak) & white balance before rolling", "Lock manual exposure & rule-of-thirds framing", "Backup media across 2 separate drives immediately (3-2-1 rule)", "Export master file & platform-appropriate aspect ratio preview"],
  },
  "Telecom & Fiber Optics": {
    ppe: ["Safety glasses (microscopic glass fiber shards are hazardous!)", "Dedicated locked sharps container for cleaved fiber scraps", "Tower/ladder PPE if aerial"],
    tools: ["Fusion splicer / cleaver & fiber strippers", "Optical power meter / VFL (Visual Fault Locator) & OTDR", "99% isopropyl lint-free wipes & one-click cleaner"],
    steps: ["Clean & inspect ferrules before every mating ('Clean Twice, Test Once')", "Dispose ALL bare cleaved fiber offcuts directly into locked bin", "Check bend-radius limits (>10x cable OD) along trays & closures", "Record baseline dB insertion loss & OTDR trace per strand"],
  },
  "Aviation & Maritime": {
    ppe: ["High-vis vest / hearing muffs (ramp/engine bay)", "FOD-free pockets checklist", "PFD life jacket on open decks"],
    tools: ["Calibrated torque wrench & safety-wire pliers", "Current OEM Maintenance Manual / Navigation chart", "Inspection mirror, flashlight & logbook"],
    steps: ["Count tools out & count tools back in (zero FOD tolerance)", "Work strictly from approved current revision checklist/manual", "Dual-verify flight-critical or hull/seacock integrity fasteners", "Complete legible airworthiness / sea-trial sign-off"],
  },
  "Science & Lab Tech": {
    ppe: ["Chemical splash goggles", "Lab coat & task-matched nitrile/neoprene gloves", "Closed-toe shoes & fume hood sash check"],
    tools: ["Calibrated analytical balance / micropipette", "pH / conductivity meter & Class A glassware", "SDS binder & secondary spill tray"],
    steps: ["Review Safety Data Sheets (SDS) & incompatibility hazards before mixing", "Verify balance zero & pipette calibration against known water weight", "Label every flask/vial immediately (chemical, concentration, date, initials)", "Neutralize/segregate waste streams cleanly & log results"],
  },
  "Education & Training": {
    ppe: ["Clear emergency exit & first-aid awareness", "Safe shop/classroom machine guards demonstrated first"],
    tools: ["5-minute hook demo / visual props", "Step-by-step rubric & printed field checklist", "Formative check questions"],
    steps: ["State the exact real-world skill outcome in 1 clear sentence", "Demonstrate full safe workflow silently, then narrate why", "Guide hands-on learner attempt with immediate positive correction", "Verify independent execution & issue concrete next-step feedback"],
  },
  "Safety & Civic Ops": {
    ppe: ["ANSI Class 2/3 high-visibility vest", "Hard hat, ANSI eyewear & work boots", "4-gas monitor (if confined space)"],
    tools: ["OSHA JSA / hazard assessment sheet", "Lockout-tagout locks, cones & barrier tape", "First-aid kit & calibrated GFCI tester"],
    steps: ["Walk perimeter to flag overhead, electrical, trench & pinch hazards", "Establish exclusion zone & communication protocol before work starts", "Verify emergency shutoff locations & nearest AED/first-aid access", "Conduct post-shift debrief & log near-misses immediately"],
  },
}

export function buildLessonChecklist(lesson: LearnByDoingLesson): LessonChecklistPack {
  const preset = CATEGORY_CHECKLIST_PRESETS[lesson.category] || CATEGORY_CHECKLIST_PRESETS.Carpentry
  const skillsTools = (lesson.skillsCovered || [])
    .slice(0, 2)
    .map((s) => `${s} verification check`)
  const studySteps =
    lesson.detailedStudyNotes && lesson.detailedStudyNotes.length >= 2
      ? lesson.detailedStudyNotes.slice(0, 4).map((n) => n.trim())
      : preset.steps

  return {
    ppe: preset.ppe,
    tools: [...preset.tools, ...skillsTools].slice(0, 5),
    steps: studySteps.slice(0, 5),
  }
}

export function escapeHtml(raw: string): string {
  return String(raw || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildPrintableFieldSheetHtml(
  lesson: LearnByDoingLesson,
  viewTitle: string,
  creator: string,
  checklist: LessonChecklistPack,
  notes: Array<{ timeSeconds: number; text: string }> = []
): string {
  const meta = LEARN_CATEGORY_META[lesson.category]
  const safeTitle = escapeHtml(viewTitle)
  const safeCategory = escapeHtml(`${meta?.emoji || ""} ${lesson.category}`.trim())
  const safeCreator = escapeHtml(creator)
  const safePractice = escapeHtml(lesson.practiceActivity)
  const safeTip = escapeHtml(lesson.fieldTip || "Verify PPE, lockout/isolation, and final test measurements before handoff.")
  const safeSkills = (lesson.skillsCovered || [])
    .map((s) => `<span class="pill">${escapeHtml(s)}</span>`)
    .join("")

  const renderBoxes = (items: string[]) =>
    items
      .map(
        (item) =>
          `<li><span class="box">&#9744;</span><span>${escapeHtml(item)}</span></li>`
      )
      .join("")

  const notesBlock =
    notes.length > 0
      ? `<section class="card">
          <h3>Saved Video Timestamp Notes</h3>
          <ul class="list">
            ${notes
              .slice(0, 12)
              .map(
                (n) =>
                  `<li><strong>@${escapeHtml(formatSecondsLabel(n.timeSeconds))}</strong> &mdash; ${escapeHtml(n.text)}</li>`
              )
              .join("")}
          </ul>
        </section>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ConnectLn Field Sheet — ${safeTitle}</title>
  <style>
    @page { size: letter; margin: 0.45in; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #111827;
      margin: 0;
      padding: 20px;
      line-height: 1.4;
      font-size: 12px;
      background: #ffffff;
    }
    .sheet { max-width: 820px; margin: 0 auto; }
    .header {
      border-bottom: 2px solid #01754F;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .brand { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #01754F; }
    h1 { font-size: 18px; margin: 4px 0; color: #0f172a; }
    .meta { font-size: 11px; color: #475569; }
    .print-btn {
      background: #0A66C2;
      color: #fff;
      border: 0;
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      break-inside: avoid;
    }
    h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #0f172a; margin: 0 0 6px; }
    .list { list-style: none; padding: 0; margin: 0; }
    .list li { display: flex; align-items: flex-start; gap: 7px; margin-bottom: 5px; }
    .box { font-size: 14px; line-height: 1.1; color: #01754F; }
    .pill {
      display: inline-block;
      border: 1px solid #bae6fd;
      background: #f0f9ff;
      color: #0369a1;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      margin: 0 4px 4px 0;
    }
    .tip { background: #ecfdf5; border-color: #a7f3d0; }
    .signoff {
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 10px 12px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      font-size: 11px;
      color: #475569;
    }
    .line { border-bottom: 1px solid #64748b; height: 20px; margin-top: 4px; }
    @media print {
      body { padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="header">
      <div>
        <div class="brand">ConnectLn Learn-By-Doing · 1-Page Jobsite Field Sheet</div>
        <h1>${safeTitle}</h1>
        <div class="meta">${safeCategory} · Instructor/Source: ${safeCreator}</div>
      </div>
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
    </header>

    <div class="grid">
      <section class="card">
        <h3>Safety &amp; PPE Pre-Check</h3>
        <ul class="list">${renderBoxes(checklist.ppe)}</ul>
      </section>
      <section class="card">
        <h3>Tools &amp; Materials Needed</h3>
        <ul class="list">${renderBoxes(checklist.tools)}</ul>
      </section>
    </div>

    <section class="card">
      <h3>Step-by-Step Execution Checklist</h3>
      <ul class="list">${renderBoxes(checklist.steps)}</ul>
    </section>

    <section class="card">
      <h3>Hands-On Practice Deliverable</h3>
      <p style="margin:0 0 6px;">${safePractice}</p>
      <div>${safeSkills}</div>
    </section>

    <section class="card tip">
      <h3>Pro Field Tip &amp; Quality Verification</h3>
      <p style="margin:0;">${safeTip}</p>
    </section>

    ${notesBlock}

    <section class="signoff">
      <div>Date &amp; Jobsite<div class="line"></div></div>
      <div>Key Measurement / Torque / Spec<div class="line"></div></div>
      <div>Inspector / Peer Vouch Initials<div class="line"></div></div>
    </section>
  </div>
</body>
</html>`
}

export interface JobsiteScenarioStep {
  prompt: string
  options: string[]
  correctIndex: number
  debrief: string
}

export interface JobsiteScenarioDrill {
  id: string
  title: string
  situation: string
  steps: JobsiteScenarioStep[]
}

const DOMAIN_SCENARIOS: Record<string, JobsiteScenarioDrill> = {
  electrical_energy: {
    id: "scen_elec",
    title: "Live Panel Fault & Ground-Fault Isolation",
    situation:
      "A customer reports a workshop subpanel GFCI breaker tripping intermittently whenever a heavy compressor starts.",
    steps: [
      {
        prompt: "What is your FIRST action before opening the panel cover or touching conductors?",
        options: [
          "Swap out the GFCI breaker immediately for a larger 30A standard breaker",
          "Don rated PPE, test your NCVT/multimeter on a known live source, and shut off/lockout the feeder breaker",
          "Tighten every neutral lug while the panel stays energized to save time",
        ],
        correctIndex: 1,
        debrief:
          "Never upsize a breaker beyond wire ampacity or probe live. Live-Dead-Live verification + Lockout/Tagout prevents arc-flash and shock.",
      },
      {
        prompt: "Testing shows hot-to-ground continuity on the branch circuit while unplugged. What is likely happening?",
        options: [
          "A pinched hot or shared neutral-to-ground contact downstream is causing true ground-fault current leakage",
          "The meter battery is dead",
          "Utility voltage dropped below 100V",
        ],
        correctIndex: 0,
        debrief:
          "A GFCI detects imbalance between hot and neutral (~5 mA threshold). Down-line neutral-ground contact or chafed insulation in metal boxes is the classic culprit.",
      },
    ],
  },
  plumbing_hvac: {
    id: "scen_plumb",
    title: "Drain Pitch & Pressure-Test Leak Diagnosis",
    situation:
      "You finish roughing in a 12-foot bathroom lavatory drain and copper supply stub-outs before drywall closes the wall.",
    steps: [
      {
        prompt: "Before gluing/insulating the horizontal drain line, what check avoids slow clogging years later?",
        options: [
          "Make the pipe dead level so water sits evenly",
          "Verify consistent 1/4 in per foot (2%) fall toward the stack with proper strap support",
          "Slope it steeper than 45 degrees over a short run",
        ],
        correctIndex: 1,
        debrief:
          "1/4 in per ft carries solids cleanly with the water stream. Flat sections collect sludge, and overly steep pipes let water outrun solids.",
      },
      {
        prompt: "After capping the new supply lines, you pressure-test with air/water and see a 2 PSI drop in 10 minutes. What should you do?",
        options: [
          "Proceed with drywall because 2 PSI is tiny",
          "Inspect every new fitting/valve stem with leak-detection soap solution and re-make the weeping joint before closing the wall",
          "Wrap external silicone tape over the wet copper joint",
        ],
        correctIndex: 1,
        debrief:
          "Zero pressure decay is mandatory before closing walls—even a pinhole seep destroys framing and voids inspections.",
      },
    ],
  },
  construction_trades: {
    id: "scen_const",
    title: "Substrate Prep & Tolerance Recovery",
    situation:
      "While prepping a structural layout and finish installation on site, you spot a 3/8-inch bow across a 6-foot span.",
    steps: [
      {
        prompt: "What happens if you install finish material directly over an un-leveled substrate?",
        options: [
          "Adhesive or fasteners automatically straighten structural deflection permanently",
          "Visible lippage, cracked joints, out-of-square doors/trim, and premature callback failure",
          "Humidity removes the bow within 48 hours",
        ],
        correctIndex: 1,
        debrief:
          "Finish trades live or die by substrate flatness. Shim, plane high joists, or skim-level before setting finish stock.",
      },
      {
        prompt: "How do you guarantee cut/layout accuracy before making expensive material cuts?",
        options: [
          "Eyeball from the previous piece without pulling a fresh reference",
          "Measure off a single primary datum edge, check diagonal 3-4-5 square, and dry-fit first",
          "Add 1/2 in extra to every piece and force with a hammer",
        ],
        correctIndex: 1,
        debrief:
          "Cumulative error ruins long runs. Pull from one true datum, verify 3-4-5 square, and dry-fit before glue or fasteners.",
      },
    ],
  },
  auto_welding_mech: {
    id: "scen_auto_weld",
    title: "Vibration, Porosity & Torque Sequence Check",
    situation:
      "During an inspection of a critical hub assembly / welded bracket repair, you see uneven seating and weld spatter.",
    steps: [
      {
        prompt: "If mill scale, paint, or oil remains on steel before welding, what defect appears inside the weld?",
        options: [
          "Stronger grain hardness",
          "Porosity, trapped inclusions, and weak fusion prone to fatigue cracking",
          "Lower electrical consumption",
        ],
        correctIndex: 1,
        debrief:
          "Contaminants vaporize under the arc and trap gas pockets (porosity). Grind to clean bright metal first.",
      },
      {
        prompt: "When tightening multi-bolt wheels, cylinder heads, or structural flanges, why tighten in a star/crisscross sequence?",
        options: [
          "To evenly distribute clamping preload and prevent rotor/gasket warping",
          "Because manufacturers only test odd bolts",
          "It eliminates the need for a torque wrench",
        ],
        correctIndex: 0,
        debrief:
          "Single-side tightening cocks the flange, creating runout and leaks. Step up in 2–3 incremental crisscross passes to final torque.",
      },
    ],
  },
  health_safety_science: {
    id: "scen_health_sci",
    title: "Sterile / Calibration Breach Recovery",
    situation:
      "Midway through setting up instrumentation and clinical/lab prep, a glove brushes a non-sterile edge and calibration reads high.",
    steps: [
      {
        prompt: "Only a fingertip brushed a non-sterile surface outside the field. What is the right protocol?",
        options: [
          "Keep going quickly so time isn't lost",
          "Stop immediately, doff/replace sterile gloves (or re-establish sterile barrier), and protect the patient/sample",
          "Wipe the glove on your coat sleeve",
        ],
        correctIndex: 1,
        debrief:
          "Any break in aseptic or sample containment invalidates safety and results. Speaking up and resetting immediately is core professionalism.",
      },
      {
        prompt: "An instrument reads slightly high before testing. What comes next?",
        options: [
          "Mentally subtract the offset without logging",
          "Perform a two-point zero/calibration verification against a known reference standard before trusting any data",
          "Tap the casing until the reading drops",
        ],
        correctIndex: 1,
        debrief:
          "Zero-check and known-standard verification catch drift before dangerous dosing, clinical errors, or failed assays.",
      },
    ],
  },
  tech_cyber: {
    id: "scen_tech_cyber",
    title: "Production Incident & Auth Input Hardening",
    situation:
      "A newly shipped endpoint slows down under traffic and accepts an unvalidated user string inside a query path.",
    steps: [
      {
        prompt: "Which fix eliminates injection/traversal risk permanently rather than hiding symptoms?",
        options: [
          "Strip a few bad words on the frontend form",
          "Enforce parameterized queries, strict server-side schema validation, and least-privilege access control",
          "Rename the API URL so users cannot guess it",
        ],
        correctIndex: 1,
        debrief:
          "Frontend checks and security-by-obscurity are trivially bypassed via curl. Parameterize queries and validate strictly on the server.",
      },
      {
        prompt: "Before merging the hotfix, what verification prevents regressions?",
        options: [
          "Skip tests to deploy 2 minutes faster",
          "Run typecheck, add a regression test covering the malformed input & normal path, and inspect logs after deploy",
          "Disable error logging in production",
        ],
        correctIndex: 1,
        debrief:
          "Reproducing with an automated test + post-deploy smoke verification proves the fix holds under real production traffic.",
      },
    ],
  },
  business_legal: {
    id: "scen_biz_legal",
    title: "Mid-Project Scope Creep & Margin Protection",
    situation:
      "Halfway through a fixed-price job, a client asks you to 'just add three extra items while you're already here.'",
    steps: [
      {
        prompt: "How do top-earning independent pros handle mid-job extras without losing profit or goodwill?",
        options: [
          "Do all extras free silently and complain later",
          "Pause warmly, issue a quick written Change Order with material + labor cost before performing extra work, and get digital sign-off",
          "Wait until the final invoice to surprise them with an unexpected surcharge",
        ],
        correctIndex: 1,
        debrief:
          "Surprise bills spark disputes, and unbilled extras wipe out net profit. Clear upfront Change Orders protect relationships and margin.",
      },
      {
        prompt: "When quoting the Change Order, what costs belong in your rate?",
        options: [
          "Materials + direct wage only",
          "Materials + waste + loaded labor hours + overhead allocation + target profit margin",
          "Guess a round number under cost to stay busy",
        ],
        correctIndex: 1,
        debrief:
          "Tools, truck, insurance, callbacks, and taxes all cost money. Full job costing ensures every hour builds business equity.",
      },
    ],
  },
  service_media_agri: {
    id: "scen_service_media",
    title: "Quality Consistency & Client Handoff Protocol",
    situation:
      "You are finishing a client project under tight turnaround and spot one subtle flaw in lighting, stitch tension, sanitation, or grading.",
    steps: [
      {
        prompt: "With 10 minutes left before handoff, what separates master practitioners from amateurs?",
        options: [
          "Hope the client doesn't notice until after payment",
          "Correct the single critical detail cleanly now (sanitize/press/check backup/re-level) and document what was done",
          "Blame the raw materials upfront",
        ],
        correctIndex: 1,
        debrief:
          "80% of referrals and 5-star reviews come from catching the final 5% finish detail before the client ever has to ask.",
      },
      {
        prompt: "What closes the job for repeat business & peer vouching?",
        options: [
          "Leave clean-up to the client",
          "Clean workspace completely, walk the client through care/maintenance instructions, and log Proof-of-Work",
          "Disappear without confirming satisfaction",
        ],
        correctIndex: 1,
        debrief:
          "A clean site handoff plus clear maintenance instructions builds trust, eliminates callbacks, and earns strong ConnectLn vouches.",
      },
    ],
  },
}

export function getJobsiteScenarioForLesson(lesson: LearnByDoingLesson): JobsiteScenarioDrill {
  const cat = lesson.category
  let base = DOMAIN_SCENARIOS.construction_trades
  if (["Electrical Fundamentals", "Solar & Energy", "Telecom & Fiber Optics"].includes(cat)) {
    base = DOMAIN_SCENARIOS.electrical_energy
  } else if (["Plumbing", "HVAC"].includes(cat)) {
    base = DOMAIN_SCENARIOS.plumbing_hvac
  } else if (["Auto Mechanics", "Welding", "Machining & Repair", "Aviation & Maritime"].includes(cat)) {
    base = DOMAIN_SCENARIOS.auto_welding_mech
  } else if (["Healthcare & Nursing", "Science & Lab Tech", "Safety & Civic Ops"].includes(cat)) {
    base = DOMAIN_SCENARIOS.health_safety_science
  } else if (["Software & AI", "Cybersecurity & IT"].includes(cat)) {
    base = DOMAIN_SCENARIOS.tech_cyber
  } else if (["Finance & Business", "Law & Legal"].includes(cat)) {
    base = DOMAIN_SCENARIOS.business_legal
  } else if (
    [
      "Culinary & Hospitality",
      "Barbering & Beauty",
      "Tailoring & Sewing",
      "Creative Media & Design",
      "Agriculture & Landscaping",
      "Education & Training",
    ].includes(cat)
  ) {
    base = DOMAIN_SCENARIOS.service_media_agri
  }

  return {
    ...base,
    id: `${base.id}_${lesson.id}`,
  }
}

export type TradeCalculatorMode =
  | "electrical"
  | "area_material"
  | "slope_units"
  | "quote_margin"

export function getDefaultCalculatorForCategory(
  category: SkilledTradesCategory
): TradeCalculatorMode {
  if (["Electrical Fundamentals", "Solar & Energy", "Telecom & Fiber Optics"].includes(category)) {
    return "electrical"
  }
  if (
    [
      "Carpentry",
      "Painting & Decorating",
      "Masonry & Tile",
      "Roofing & Drywall",
      "Agriculture & Landscaping",
      "Tailoring & Sewing",
    ].includes(category)
  ) {
    return "area_material"
  }
  if (
    [
      "Plumbing",
      "HVAC",
      "Auto Mechanics",
      "Welding",
      "Machining & Repair",
      "Aviation & Maritime",
      "Science & Lab Tech",
      "Healthcare & Nursing",
    ].includes(category)
  ) {
    return "slope_units"
  }
  return "quote_margin"
}

export interface BaselineRegionalTip {
  id: string
  region: "US / NEC" | "UK / EU" | "Africa / ECOWAS" | "Global Metric"
  title: string
  detail: string
  authorName: string
}

export function getBaselineRegionalTips(category: SkilledTradesCategory): BaselineRegionalTip[] {
  if (["Electrical Fundamentals", "Solar & Energy", "Telecom & Fiber Optics"].includes(category)) {
    return [
      {
        id: `tip_us_${category}`,
        region: "US / NEC",
        title: "120/240V Split-Phase & Color Code",
        detail: "NEC requires 12 AWG copper on 20A circuits (14 AWG on 15A), black/red hots, white neutral, bare/green ground, and GFCI/AFCI protection in wet/living zones.",
        authorName: "ConnectLn Standards Desk",
      },
      {
        id: `tip_ukeu_${category}`,
        region: "UK / EU",
        title: "230V IEC Harmonized Wiring",
        detail: "BS 7671 / IEC 60364 uses Brown = Line (L), Blue = Neutral (N), Green/Yellow = Earth (PE). Test RCD trip times (30 mA <= 300 ms) cleanly.",
        authorName: "EuroTech Master Guild",
      },
      {
        id: `tip_af_${category}`,
        region: "Africa / ECOWAS",
        title: "230V/400V Surge & Solar Hybrid Protection",
        detail: "Pair main MCBs with Type 2 surge arresters and voltage guard relays to protect motors/inverters against grid sags and generator changeover transients.",
        authorName: "Accra / Lagos Master Electricians",
      },
    ]
  }

  if (["Plumbing", "HVAC"].includes(category)) {
    return [
      {
        id: `tip_us_${category}`,
        region: "US / NEC",
        title: "IPC/UPC Trap & Vent Sizing",
        detail: "Horizontal drains 2.5 in or less require min 1/4 in/ft slope; dielectric unions are mandatory where copper meets galvanized steel.",
        authorName: "ConnectLn Master Plumbers",
      },
      {
        id: `tip_metric_${category}`,
        region: "Global Metric",
        title: "Metric Fall & Pressure Equivalence",
        detail: "1/4 in/ft slope equals ~20 mm per meter (2%). Verify vacuum decay below 500 microns before opening HVAC refrigerant service valves.",
        authorName: "ConnectLn Global Field Standards",
      },
      {
        id: `tip_af_${category}`,
        region: "Africa / ECOWAS",
        title: "Gravity Overhead Tank Non-Return Check",
        detail: "Install brass swing-check valves + sediment pre-filters between booster pumps, rooftop storage tanks, and solar water heaters.",
        authorName: "West Africa Hydronics Collective",
      },
    ]
  }

  if (
    [
      "Carpentry",
      "Masonry & Tile",
      "Roofing & Drywall",
      "Painting & Decorating",
    ].includes(category)
  ) {
    return [
      {
        id: `tip_us_${category}`,
        region: "US / NEC",
        title: "Imperial Sheet Goods & Stud Centers",
        detail: "Standard US framing centers are 16 in (or 24 in) OC matching 4x8 ft (1220x2440 mm) sheets; seal exterior bottom plates over concrete with sill gasket.",
        authorName: "ConnectLn Builders Desk",
      },
      {
        id: `tip_ukeu_${category}`,
        region: "UK / EU",
        title: "Euro Metric Studs & Moisture Vapor",
        detail: "Metric framing typically spaces at 400 mm or 600 mm centers to carry 1200x2400 mm plasterboard cleanly; follow ENVOC low-VOC coating rules indoors.",
        authorName: "European Finish Craftsmen",
      },
      {
        id: `tip_af_${category}`,
        region: "Africa / ECOWAS",
        title: "Tropical Humidity & Mortar Cure Tip",
        detail: "Damp-cure rendered blockwork and keep wood moisture <12% before tight interior joinery so seasonal Harmattan/rain swings don't warp joints.",
        authorName: "ECOWAS Building Trades Network",
      },
    ]
  }

  return [
    {
      id: `tip_global_${category}`,
      region: "Global Metric",
      title: "Standard Documentation & Measurement Check",
      detail: `Always record units explicitly (mm vs inches, N-m vs ft-lb) and verify calibrated tools before signing off ${category} work.`,
      authorName: "ConnectLn Global Standards",
    },
    {
      id: `tip_us_${category}`,
      region: "US / NEC",
      title: "OSHA & Written Scope Best Practice",
      detail: `Keep JSA hazard sign-off and itemized Change Orders documented on every ${category} project to protect both safety and client payment.`,
      authorName: "ConnectLn Pro Advisory",
    },
  ]
}
