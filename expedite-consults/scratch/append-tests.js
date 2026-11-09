const fs = require('fs');
const path = require('path');

const testPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
let testCode = fs.readFileSync(testPath, 'utf8');

const advancedTests = `
  it("LEG-010: should execute Courtroom Advocacy oral argument and objection simulation", () => {
    const courtroom = runCourtroomAdvocacyEngine("Breach of Contract Motion for Summary Judgment", "DEFENSE");
    assert.ok(courtroom.oralArgumentPreamble.includes("May it please the Court"));
    assert.ok(courtroom.benchQuestions.length > 0);
    assert.ok(courtroom.evidentiaryObjections.some(o => o.legalGround.includes("FRE 802")));
    assert.ok(courtroom.closingArgumentDraft.includes("Members of the Jury"));
  });

  it("LEG-011: should audit evidence contradictions and gaps", () => {
    const evidenceAudit = runEvidenceIntelligenceEngine(["Exhibit A", "Exhibit B"]);
    assert.ok(evidenceAudit.materialContradictions.length > 0);
    assert.ok(evidenceAudit.admissibilityRisks.some(r => r.includes("FRE 902(11)")));
    assert.ok(evidenceAudit.evidentiaryGaps.length > 0);
  });

  it("LEG-012: should generate deposition examination batteries and impeachment lines", () => {
    const depo = runDepositionIntelligenceEngine("John Doe", "VP of Engineering");
    assert.ok(depo.examinationOutline.length > 0);
    assert.ok(depo.trapQuestions.length > 0);
  });

  it("LEG-013: should analyze contracts for unfavorable clauses and generate redlines", () => {
    const contract = runContractNegotiationEngine(["indemnity", "consequential damages"]);
    assert.ok(contract.riskScore > 50);
    assert.ok(contract.unfavorableTerms.some(t => t.clause.includes("Indemnification")));
  });

  it("LEG-014: should execute 4-agent adversarial legal simulation with auditor validation", () => {
    const adversarial = runMultiAgentLegalAdversarialAnalysis("Software vendor delay dispute under supply agreement");
    assert.ok(adversarial.claimantAgentArgument.includes("AGENT A"));
    assert.ok(adversarial.defenseAgentArgument.includes("AGENT B"));
    assert.ok(adversarial.judicialAnalystEvaluation.includes("AGENT C"));
    assert.ok(adversarial.legalCitationAuditorReport.citatorIntegrityScore === 100);
    assert.ok(adversarial.consensusSynthesis.includes("LEGAL SYNTHESIS"));
  });

  it("LEG-015: should generate attorney spoken voice in multiple registers", () => {
    const courtroomVoice = generateLegalVoiceResponse("Why should the court dismiss?", "COURTROOM_ADVOCACY");
    assert.ok(courtroomVoice.includes("May it please the Court"));
    assert.ok(courtroomVoice.includes("Your Honor"));

    const benchVoice = generateLegalVoiceResponse("Why should the court dismiss?", "JUDICIAL_DELIBERATION");
    assert.ok(benchVoice.includes("MEMORANDUM DECISION"));

    const advisoryVoice = generateLegalVoiceResponse("Should we file suit?", "ATTORNEY_CONVERSATION");
    assert.ok(advisoryVoice.includes("Counsel Assessment"));
  });
`;

// Insert the advanced tests before the last closing bracket
testCode = testCode.replace(
  '  PRIMARY_AUTHORITY_VAULT,\n} from "./noctis-legal-engine.ts";',
  '  PRIMARY_AUTHORITY_VAULT,\n  runCourtroomAdvocacyEngine,\n  runEvidenceIntelligenceEngine,\n  runDepositionIntelligenceEngine,\n  runContractNegotiationEngine,\n  runMultiAgentLegalAdversarialAnalysis,\n  generateLegalVoiceResponse,\n} from "./noctis-legal-engine.ts";'
);

const lastIndex = testCode.lastIndexOf('});');
if (lastIndex !== -1 && !testCode.includes('LEG-010')) {
  testCode = testCode.slice(0, lastIndex) + advancedTests + '\n' + testCode.slice(lastIndex);
  fs.writeFileSync(testPath, testCode, 'utf8');
  console.log('Appended advanced tests LEG-010 through LEG-015');
} else {
  console.log('Tests already appended');
}
