const fs = require('fs');
const path = require('path');

const testCode = `import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  handleNaturalLegalQuery,
  isLegalQuery,
  resolveJurisdiction,
  verifyLegalCitation,
  PRIMARY_AUTHORITY_VAULT,
} from "./noctis-legal-engine.ts";

describe("Noctis Legal Intelligence & Attorney Persona Engine (NOCTIS-LEGAL-001)", () => {
  it("LEG-001: should accurately identify legal and jurisprudence queries", () => {
    assert.strictEqual(isLegalQuery("What are the remedies for breach of contract under FAR Part 49?"), true);
    assert.strictEqual(isLegalQuery("Opposing party filed a motion alleging breach without documentary evidence"), true);
    assert.strictEqual(isLegalQuery("Assess ePHI breach under HIPAA Security Rule"), true);
    assert.strictEqual(isLegalQuery("Administrative Procedure Act APA challenge under 5 U.S.C. 706 post-Chevron Loper Bright"), true);
    assert.strictEqual(isLegalQuery("Differentiate negligence, gross negligence, recklessness, and intentional misconduct in tort law"), true);
    assert.strictEqual(isLegalQuery("Analyze breach of contract under Maryland state law"), true);
    assert.strictEqual(isLegalQuery("Calculate the voltage drop on a 3-phase feeder"), false);
  });

  it("LEG-002: should generate formal IRAC dossier for Federal Contract Law (FAR Part 49)", () => {
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

  it("LEG-003: should generate formal litigation defense dossier for lack of documentary evidence (FRCP 56)", () => {
    const res = handleNaturalLegalQuery("Commercial litigation opposing party alleging breach without documentary evidence response");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("Federal Rule of Civil Procedure 56"));
    assert.ok(res.includes("Celotex Corp. v. Catrett"));
    assert.ok(res.includes("Bell Atlantic Corp. v. Twombly"));
    assert.ok(res.includes("Ashcroft v. Iqbal"));
    assert.ok(res.includes("Summary Judgment"));
  });

  it("LEG-004: should generate regulatory & cybersecurity dossier for HIPAA ePHI breach", () => {
    const res = handleNaturalLegalQuery("Assess ePHI unauthorized access breach under HIPAA Security Rule");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("45 CFR Part 160"));
    assert.ok(res.includes("45 CFR Part 164"));
    assert.ok(res.includes("Four-Factor Risk Assessment"));
    assert.ok(res.includes("60 calendar days"));
    assert.ok(res.includes("HHS Office for Civil Rights"));
  });

  it("LEG-005: should generate administrative law dossier under APA § 706 and Loper Bright", () => {
    const res = handleNaturalLegalQuery("Administrative Procedure Act APA challenge under 5 U.S.C. 706 federal agency action Loper Bright");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("5 U.S.C. § 706"));
    assert.ok(res.includes("Loper Bright Enterprises v. Raimondo"));
    assert.ok(res.includes("Motor Vehicle Mfrs. Ass'n v. State Farm"));
    assert.ok(res.includes("De Novo"));
    assert.ok(res.includes("Arbitrary and Capricious"));
  });

  it("LEG-006: should generate tort law culpability spectrum dossier", () => {
    const res = handleNaturalLegalQuery("Analyze tort law culpability tiers: negligence vs gross negligence vs recklessness vs intentional misconduct");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("Restatement (Second) of Torts"));
    assert.ok(res.includes("Restatement (Third) of Torts"));
    assert.ok(res.includes("Ordinary Negligence"));
    assert.ok(res.includes("Gross Negligence"));
    assert.ok(res.includes("Recklessness"));
    assert.ok(res.includes("Intentional Misconduct"));
    assert.ok(res.includes("Piercing Contractual Limitations of Liability"));
    assert.ok(res.includes("Punitive Damages"));
  });

  it("LEG-007: should resolve and generate Maryland state jurisprudence dossier", () => {
    const res = handleNaturalLegalQuery("Analyze personal jurisdiction and choice of law under Maryland state law");
    assert.ok(res, "Dossier must not be null");
    assert.ok(res.includes("Maryland Long-Arm Jurisdiction"));
    assert.ok(res.includes("Md. Code Ann., Cts. & Jud. Proc. § 6-103"));
    assert.ok(res.includes("Lex loci contractus"));
    assert.ok(res.includes("Lex loci delicti"));
    assert.ok(res.includes("Adler v. American Standard Corp."));
    assert.ok(res.includes("COMAR"));
    assert.ok(res.includes("Md. Rule 1-104"));
  });

  it("LEG-008: should resolve jurisdictions accurately with procedural rules", () => {
    const mdJuris = resolveJurisdiction("Maryland breach of contract claim");
    assert.strictEqual(mdJuris.primaryJurisdiction, "MARYLAND");
    assert.ok(mdJuris.governingLaw.includes("Maryland State Law"));

    const farJuris = resolveJurisdiction("Federal contract dispute under FAR Part 49");
    assert.strictEqual(farJuris.primaryJurisdiction, "US_FEDERAL");
    assert.ok(farJuris.subjectMatterJurisdiction.includes("Contract Disputes Act"));

    const hipaaJuris = resolveJurisdiction("HIPAA ePHI disclosure to OCR");
    assert.strictEqual(hipaaJuris.primaryJurisdiction, "US_FEDERAL");
    assert.ok(hipaaJuris.governingLaw.includes("45 CFR"));
  });

  it("LEG-009: should verify citations and reject fabricated authorities without hallucination", () => {
    const celotex = verifyLegalCitation("477 U.S. 317");
    assert.strictEqual(celotex.status, "VERIFIED");
    assert.strictEqual(celotex.caseOrStatuteName, "Celotex Corp. v. Catrett");
    assert.strictEqual(celotex.year, 1986);

    const loperBright = verifyLegalCitation("Loper Bright Enterprises v. Raimondo");
    assert.strictEqual(loperBright.status, "VERIFIED");
    assert.strictEqual(loperBright.court, "Supreme Court of the United States");

    const fakeCase = verifyLegalCitation("Fictitious Corp. v. Phantom LLC, 999 F.9th 1234 (2099)");
    assert.strictEqual(fakeCase.status, "UNVERIFIED");
    assert.strictEqual(fakeCase.caseOrStatuteName, "Unindexed / Unverified Legal Authority");
  });
});
`;

const targetPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
fs.writeFileSync(targetPath, testCode, 'utf8');
console.log('Successfully written noctis-legal-engine.test.ts');
