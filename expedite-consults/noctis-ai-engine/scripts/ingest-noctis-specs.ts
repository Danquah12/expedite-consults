/**
 * NOCTIS AUTOMATED SPECIFICATION & TAXONOMY BATCH TRAINER (`npm run ingest:specs`)
 * ================================================================================
 * Drop any `.md`, `.txt`, or `.json` specification files into `specs/inbox/`
 * (or pass file paths on the command line) and run:
 *   npm run ingest:specs
 *
 * This script automatically:
 * 1. Scans all specification files in `specs/inbox/` (or CLI arguments)
 * 2. Extracts profession taxonomies, specialist engines, calculation rules, and workflows
 * 3. Trains Noctis's persistent training store (`data/vibe-training.json` + Postgres `vibe_training_pair`)
 * 4. Runs the 10-point Professional Intelligence Acceptance Suite (`PROF-AC-01`..`PROF-AC-10`)
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  autoIngestRawSpecification,
  runProfessionalIntelligenceTestSuite,
  NOCTIS_42_PROFESSION_CATEGORIES,
  NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES,
  NOCTIS_20_ADVANCED_EXECUTION_ENGINES,
  NOCTIS_6_SHARED_TECHNICAL_ENGINES,
} from "../src/lib/noctis-professional-engine.ts";
import { trainNoctisFromRawDocument } from "../src/lib/noctis-train.server.ts";

const inboxDir = path.join(process.cwd(), "specs", "inbox");
mkdirSync(inboxDir, { recursive: true });

// Ensure a default README/seed spec exists in specs/inbox so running `npm run ingest:specs` works out of the box
const seedSpecFile = path.join(inboxDir, "01-professional-intelligence-and-42-professions.md");
if (!existsSync(seedSpecFile)) {
  writeFileSync(
    seedSpecFile,
    [
      "# Noctis Professional Intelligence Engine & 42-Category Global Professions Directory",
      "## 1. Six Initial Specialist Engines",
      "- Construction & Building Intelligence Engine (BOQ, drawing takeoff, missing foundation/soil refusal)",
      "- Mechanical Engineering Engine (Torque, shear stress, bearings, pumps, thermodynamics, vibration)",
      "- Automotive Engineering & Diagnostics Engine (Diesel cranks-no-start fault tree, OBD-II/J1939, high-pressure rail safety)",
      "- Civil & Structural Engineering Engine (ASCE 7 / ACI 318 / AISC 360 loads & beams, Licensed PE boundary)",
      "- Electrical, Electronics & Energy Engine (3-phase voltage drop, solar/BESS microgrids, PLC controls)",
      "- Manufacturing & Industrial Engineering Engine (Cycle time, bottlenecks, SPC Cp/Cpk, FMEA, digital twin)",
      "## 2. 42-Category Professions & Skilled Trades Taxonomy",
      ...NOCTIS_42_PROFESSION_CATEGORIES.map(
        (c) => `- Category #${c.categoryNumber} (${c.industryGroup}): ${c.representativeProfessions.slice(0, 3).join(", ")}`
      ),
    ].join("\n"),
    "utf8"
  );
}

const cliFiles = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const targetFiles =
  cliFiles.length > 0
    ? cliFiles.map((f) => path.resolve(process.cwd(), f))
    : readdirSync(inboxDir)
        .filter((f) => /\.(md|txt|json)$/i.test(f))
        .map((f) => path.join(inboxDir, f));

console.log("================================================================================");
console.log("NOCTIS AUTOMATED SPECIFICATION & TAXONOMY TRAINER (`npm run ingest:specs`)");
console.log("================================================================================");
console.log(`Scanning ${targetFiles.length} specification file(s) from ${cliFiles.length ? "CLI args" : "specs/inbox/"}...`);

let totalTrainedPairs = 0;
for (const filePath of targetFiles) {
  const rawText = readFileSync(filePath, "utf8");
  const title = path.basename(filePath, path.extname(filePath));
  const ingested = autoIngestRawSpecification({
    title,
    rawText,
    sourceChannel: "cli_batch_folder",
  });
  const trained = await trainNoctisFromRawDocument({
    title,
    rawText,
    domain: "engineering",
  });
  totalTrainedPairs += trained.trainedPairsCount;
  console.log(
    `INGESTED ✓ | ${ingested.specId} | File=${path.basename(filePath)} | Sections=${ingested.sections.length} | TrainedPairs=${trained.trainedPairsCount} | Professions=${ingested.extractedProfessionsCount}`
  );
}

const profSuite = runProfessionalIntelligenceTestSuite();
console.log("--------------------------------------------------------------------------------");
console.log(
  `Active Registry: ${NOCTIS_42_PROFESSION_CATEGORIES.length} Profession Groups (Cat #1–#42) | ${NOCTIS_22_SPECIALIST_PROFESSIONAL_ENGINES.length} Specialist Engines | ${NOCTIS_20_ADVANCED_EXECUTION_ENGINES.length} Advanced Execution Engines | ${NOCTIS_6_SHARED_TECHNICAL_ENGINES.length} Shared Technical Engines`
);
console.log(
  `Total New/Updated Training Lessons Saved: ${totalTrainedPairs} | Acceptance Suite: ${profSuite.passedCount}/${profSuite.totalCount} PASS`
);
console.log("================================================================================");
