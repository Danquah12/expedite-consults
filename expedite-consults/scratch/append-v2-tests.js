const fs = require('fs');
const path = require('path');

const testPath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.test.ts');
let testCode = fs.readFileSync(testPath, 'utf8');

// Update imports
testCode = testCode.replace(
  '  generateLegalVoiceResponse,\n} from "./noctis-legal-engine.ts";',
  '  generateLegalVoiceResponse,\n  TWENTY_FOUR_LEGAL_AGENTS,\n  executeAutonomousLegalWorkflow,\n  queryHistoricalLegalVersion,\n  verifyMatterAccess,\n} from "./noctis-legal-engine.ts";'
);

const v2Tests = `
  it("LIP-001: should register all 24 autonomous specialist legal agents across 6 teams", () => {
    const agents = Object.values(TWENTY_FOUR_LEGAL_AGENTS);
    assert.strictEqual(agents.length, 24);

    const teams = new Set(agents.map(a => a.team));
    assert.strictEqual(teams.size, 6);
    assert.ok(teams.has("TEAM_A_RESEARCH"));
    assert.ok(teams.has("TEAM_B_ADVOCACY"));
    assert.ok(teams.has("TEAM_C_LITIGATION"));
    assert.ok(teams.has("TEAM_D_TRANSACTIONS"));
    assert.ok(teams.has("TEAM_E_REGULATORY"));
    assert.ok(teams.has("TEAM_F_GOVERNANCE"));
  });

  it("LIP-002: should execute all 5 autonomous end-to-end legal workflows", () => {
    const wf1 = executeAutonomousLegalWorkflow("RESEARCH_AND_OPINION", "MATTER-101", "ORG-Alpha", "Breach query");
    assert.strictEqual(wf1.status, "COMPLETED");
    assert.strictEqual(wf1.humanApprovalRequired, false);
    assert.ok(wf1.participatingAgents.includes("A1_RESEARCH"));

    const wf2 = executeAutonomousLegalWorkflow("LITIGATION_PREPARATION", "MATTER-101", "ORG-Alpha", "Case prep");
    assert.strictEqual(wf2.status, "COMPLETED");
    assert.ok(wf2.participatingAgents.includes("C1_EVIDENCE"));

    const wf3 = executeAutonomousLegalWorkflow("CONTRACT_REVIEW_REDLINE", "MATTER-101", "ORG-Alpha", "SLA contract");
    assert.strictEqual(wf3.status, "COMPLETED");
    assert.ok(wf3.participatingAgents.includes("D2_CONTRACTS"));

    const wf4 = executeAutonomousLegalWorkflow("REGULATORY_CHANGE_INTELLIGENCE", "MATTER-101", "ORG-Alpha", "eCFR change");
    assert.strictEqual(wf4.status, "COMPLETED");
    assert.ok(wf4.participatingAgents.includes("E1_REGULATORY"));

    const wf5 = executeAutonomousLegalWorkflow("COURT_FILING_PREPARATION", "MATTER-101", "ORG-Alpha", "Motion filing");
    assert.strictEqual(wf5.status, "PENDING_HUMAN_APPROVAL");
    assert.strictEqual(wf5.humanApprovalRequired, true);
    assert.ok(wf5.findingsSummary.includes("HOLD"));
  });

  it("LIP-003: should perform legal knowledge time travel across historical statutory amendments", () => {
    const historicalPre = queryHistoricalLegalVersion("5 U.S.C. § 706", "2023-01-15");
    assert.ok(historicalPre.governingVersionText.includes("Chevron"));
    assert.ok(historicalPre.subsequentHistoryNote.includes("Chevron deference active"));

    const historicalPost = queryHistoricalLegalVersion("5 U.S.C. § 706", "2024-07-01");
    assert.ok(historicalPost.governingVersionText.includes("Loper Bright"));
    assert.ok(historicalPost.subsequentHistoryNote.includes("Loper Bright Enterprises v. Raimondo"));
  });

  it("LIP-004: should enforce multi-tenant matter isolation and ethical wall conflict screening", () => {
    const context = {
      tenantId: "FIRM_A",
      matterId: "MATTER_101",
      authorizedAttorneys: ["USER_1", "USER_2"],
      classificationLevel: "CONFIDENTIAL" as const,
      ethicalWallActive: true,
      walledParties: ["USER_3"]
    };

    // 1. Cross-tenant attempt
    const res1 = verifyMatterAccess(context, { tenantId: "COMPANY_B", userId: "USER_X", assignedMatters: ["MATTER_101"] });
    assert.strictEqual(res1.accessGranted, false);
    assert.ok(res1.reason.includes("Cross-tenant access strictly forbidden"));

    // 2. Matter mismatch attempt
    const res2 = verifyMatterAccess(context, { tenantId: "FIRM_A", userId: "USER_4", assignedMatters: ["MATTER_999"] });
    assert.strictEqual(res2.accessGranted, false);
    assert.ok(res2.reason.includes("User not authorized on this matter docket"));

    // 3. Ethical wall conflict
    const res3 = verifyMatterAccess(context, { tenantId: "FIRM_A", userId: "USER_3", assignedMatters: ["MATTER_101"] });
    assert.strictEqual(res3.accessGranted, false);
    assert.ok(res3.reason.includes("ETHICAL_WALL_BARRIER"));

    // 4. Authorized access
    const res4 = verifyMatterAccess(context, { tenantId: "FIRM_A", userId: "USER_1", assignedMatters: ["MATTER_101"] });
    assert.strictEqual(res4.accessGranted, true);
  });
`;

const lastIdx = testCode.lastIndexOf('});');
if (lastIdx !== -1 && !testCode.includes('LIP-001')) {
  testCode = testCode.slice(0, lastIdx) + v2Tests + '\n' + testCode.slice(lastIdx);
  fs.writeFileSync(testPath, testCode, 'utf8');
  console.log('Appended Version 2.0 tests LIP-001 through LIP-004');
} else {
  console.log('Tests already present');
}
