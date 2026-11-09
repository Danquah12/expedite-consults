const fs = require('fs');
const path = require('path');

const testPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
let testCode = fs.readFileSync(testPath, 'utf8');

testCode = testCode.replace(
  '  verifyMatterAccess,\n} from "./noctis-legal-engine.ts";',
  '  verifyMatterAccess,\n  parseAndAuditLegalDocument,\n  resolveStateJurisprudencePack,\n  calculateLitigationDeadlines,\n  applyFirmNegotiationPlaybook,\n} from "./noctis-legal-engine.ts";'
);

const newTests = `
  it("LIP-005: should parse contracts and audit indemnification, liability caps, and restrictive covenants", () => {
    const docSample = "Contractor shall indemnify Client. Limitation of liability shall not apply to breach of Section 7. Contractor covenants not to compete for 24 months.";
    const audit = parseAndAuditLegalDocument(docSample, "Enterprise Master Agreement");
    assert.strictEqual(audit.documentType, "COMMERCIAL_AGREEMENT");
    assert.ok(audit.clausesAudited.length >= 3);
    assert.ok(audit.clausesAudited.some(c => c.clauseType === "INDEMNIFICATION" && c.riskRating === "UNACCEPTABLE"));
    assert.ok(audit.clausesAudited.some(c => c.clauseType === "LIMITATION_OF_LIABILITY" && c.riskRating === "HIGH"));
    assert.ok(audit.statutoryComplianceViolations.some(v => v.includes("California Bus. & Prof. Code § 16600.5")));
  });

  it("LIP-006: should retrieve state jurisprudence packs for DE, NY, VA, and CA", () => {
    const dePack = resolveStateJurisprudencePack("DELAWARE");
    assert.ok(dePack.governingStatutes.some(s => s.citation.includes("8 Del. C. § 102(b)(7)")));
    assert.ok(dePack.pivotalDoctrines.some(d => d.includes("Business Judgment Rule")));

    const nyPack = resolveStateJurisprudencePack("NEW_YORK");
    assert.ok(nyPack.governingStatutes.some(s => s.citation.includes("N.Y. Gen. Oblig. Law § 5-1401")));
    assert.ok(nyPack.pivotalDoctrines.some(d => d.includes("Truck Rent-A-Center")));

    const vaPack = resolveStateJurisprudencePack("VIRGINIA");
    assert.ok(vaPack.governingStatutes.some(s => s.citation.includes("8.01-38.1")));
    assert.ok(vaPack.pivotalDoctrines.some(d => d.includes("Dillon's Rule")));

    const caPack = resolveStateJurisprudencePack("CALIFORNIA");
    assert.ok(caPack.governingStatutes.some(s => s.citation.includes("16600")));
    assert.ok(caPack.pivotalDoctrines.some(d => d.includes("Edwards v. Arthur Andersen")));
  });

  it("LIP-007: should calculate federal and state litigation deadlines accounting for service method and Rule 6(d)", () => {
    // Federal Electronic Service
    const fedElec = calculateLitigationDeadlines("2026-03-01", "ELECTRONIC", "FEDERAL");
    assert.strictEqual(fedElec.deadlines.length >= 4, true);
    const answerElec = fedElec.deadlines.find(d => d.eventTitle.includes("Answer"));
    assert.strictEqual(answerElec?.daysAllowed, 21);

    // Federal Mail Service (+3 days under Rule 6(d))
    const fedMail = calculateLitigationDeadlines("2026-03-01", "MAIL_OR_CARRIER", "FEDERAL");
    const answerMail = fedMail.deadlines.find(d => d.eventTitle.includes("Answer"));
    assert.strictEqual(answerMail?.daysAllowed, 24);

    // Maryland State Service
    const mdState = calculateLitigationDeadlines("2026-03-01", "ELECTRONIC", "MARYLAND_STATE");
    const mdAnswer = mdState.deadlines.find(d => d.ruleCitation.includes("Md. Rule 2-321"));
    assert.strictEqual(mdAnswer?.daysAllowed, 30);
  });

  it("LIP-008: should apply firm negotiation playbook fallbacks and walk-away thresholds", () => {
    const playbook = applyFirmNegotiationPlaybook();
    assert.ok(playbook["INDEMNITY"]);
    assert.ok(playbook["LIABILITY_CAP"]);
    assert.ok(playbook["GOVERNING_LAW"]);
    assert.ok(playbook["INDEMNITY"].walkAwayCondition.includes("Uncapped, unilateral indemnity"));
    assert.ok(playbook["LIABILITY_CAP"].fallbackLevel1.includes("2.0x annual fees"));
  });
`;

const lastIdx = testCode.lastIndexOf('});');
if (lastIdx !== -1 && !testCode.includes('LIP-005')) {
  testCode = testCode.slice(0, lastIdx) + newTests + '\n' + testCode.slice(lastIdx);
  fs.writeFileSync(testPath, testCode, 'utf8');
  console.log('Appended tests LIP-005 through LIP-008');
} else {
  console.log('Tests already present');
}
