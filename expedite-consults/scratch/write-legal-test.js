const fs = require('fs');
const path = require('path');

const testContent = `import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  handleNaturalLegalQuery,
  isLegalQuery,
  buildFederalContractLawDossier,
  buildLitigationDefenseDossier,
  buildHipaaCybersecurityDossier,
  buildAdministrativeLawDossier,
  buildTortCulpabilityDossier,
} from "./noctis-legal-engine.ts";

describe("Noctis Legal Intelligence & Attorney Persona Engine (NOCTIS-LEGAL-001)", () => {
  it("should accurately identify legal and jurisprudence queries", () => {
    assert.strictEqual(isLegalQuery("What are the remedies for breach of contract under FAR Part 49?"), true);
    assert.strictEqual(isLegalQuery("Opposing party filed a motion alleging breach without documentary evidence"), true);
    assert.strictEqual(isLegalQuery("Assess ePHI breach under HIPAA Security Rule"), true);
    assert.strictEqual(isLegalQuery("Administrative Procedure Act APA challenge under 5 U.S.C. 706 post-Chevron Loper Bright"), true);
    assert.strictEqual(isLegalQuery("Differentiate negligence, gross negligence, recklessness, and intentional misconduct in tort law"), true);
    assert.strictEqual(isLegalQuery("Calculate the voltage drop on a 3-phase feeder"), false);
  });

  it("should generate formal IRAC dossier for Federal Contract Law (FAR Part 49)", () => {
    const res = handleNaturalLegalQuery("Federal government contract breach remedies under FAR Part 49");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("STATEMENT OF THE ISSUE"));
    assert.ok(res.includes("CONTROLLING LEGAL RULES & AUTHORITIES"));
    assert.ok(res.includes("FAR Part 49"));
    assert.ok(res.includes("APPLICATION & LEGAL ANALYSIS"));
    assert.ok(res.includes("CONCLUSION & RECOMMENDED DISPOSITION"));
    assert.ok(res.includes("Cure Notice"));
    assert.ok(res.includes("Show Cause Notice"));
    assert.ok(res.includes("Excess Reprocurement Costs"));
  });

  it("should generate formal litigation defense dossier for lack of documentary evidence (FRCP 56)", () => {
    const res = handleNaturalLegalQuery("Commercial litigation opposing party alleging breach without documentary evidence response");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("Federal Rule of Civil Procedure 56"));
    assert.ok(res.includes("Celotex Corp. v. Catrett"));
    assert.ok(res.includes("Rule 12(b)(6)"));
    assert.ok(res.includes("Twombly / Iqbal"));
    assert.ok(res.includes("Cross-Motion for Summary Judgment"));
  });

  it("should generate regulatory & cybersecurity dossier for HIPAA ePHI breach", () => {
    const res = handleNaturalLegalQuery("Assess ePHI unauthorized access breach under HIPAA Security Rule");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("45 CFR Part 160"));
    assert.ok(res.includes("45 CFR Part 164"));
    assert.ok(res.includes("Four-Factor Risk Assessment"));
    assert.ok(res.includes("60 Calendar Days"));
    assert.ok(res.includes("HHS Office for Civil Rights"));
  });

  it("should generate administrative law dossier under APA § 706 and Loper Bright", () => {
    const res = handleNaturalLegalQuery("Administrative Procedure Act APA challenge under 5 U.S.C. 706 federal agency action Loper Bright");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("5 U.S.C. § 706"));
    assert.ok(res.includes("Loper Bright Enterprises v. Raimondo"));
    assert.ok(res.includes("Motor Vehicle Mfrs. Ass'n v. State Farm"));
    assert.ok(res.includes("Arbitrary and Capricious"));
    assert.ok(res.includes("De Novo Judicial Review"));
  });

  it("should generate tort law culpability spectrum dossier", () => {
    const res = handleNaturalLegalQuery("Analyze tort law culpability tiers: negligence vs gross negligence vs recklessness vs intentional misconduct");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("Restatement (Second) of Torts"));
    assert.ok(res.includes("Restatement (Third) of Torts"));
    assert.ok(res.includes("Negligence (Ordinary Breach)"));
    assert.ok(res.includes("Gross Negligence"));
    assert.ok(res.includes("Recklessness (Conscious Disregard)"));
    assert.ok(res.includes("Intentional Misconduct / Malice"));
    assert.ok(res.includes("Limitation of Liability"));
    assert.ok(res.includes("Punitive Damages"));
  });
});
\`;

const targetPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
fs.writeFileSync(targetPath, testContent, 'utf8');
console.log('Successfully written noctis-legal-engine.test.ts');
`;

fs.writeFileSync(path.resolve('scratch/write-legal-test.js'), testContent, 'utf8');
