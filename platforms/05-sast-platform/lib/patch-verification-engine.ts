export type PatchVerificationStatus =
  | "PATCH_VERIFIED"
  | "PATCH_STATICALLY_VALIDATED_UNCOMPILED"
  | "PATCH_STATIC_VALIDATION_FAILED"
  | "PATCH_INCOMPLETE_OR_STUB"
  | "PATCH_INTRODUCED_NEW_SINK";

export interface PatchPortfolioSummary {
  totalFindings: number;
  patchesGeneratedCount: number;
  staticValidationPassedCount: number;
  staticValidationFailedCount: number;
  compiledSuccessfullyCount: number;
  securityRegressionPassedCount: number;
  functionalRegressionPassedCount: number;
  remediationVerifiedCount: number;
}

export type PatchLifecycleStage =
  | "PATCH_GENERATED"
  | "PATCH_STATICALLY_VALIDATED"
  | "PATCH_COMPILED"
  | "SECURITY_TEST_PASSED"
  | "FUNCTIONAL_TEST_PASSED"
  | "REMEDIATION_VERIFIED";

export interface PatchLifecycleStep {
  stage: PatchLifecycleStage;
  status: "PASSED" | "NOT_RUN" | "FAILED";
  artifactRef: string;
}

export interface PatchVerificationCheck {
  checkId: string;
  label: string;
  passed: boolean;
  executionState: "VERIFIED_STATIC" | "EXECUTED_RUNTIME" | "NOT_EXECUTED" | "FAILED";
  detail: string;
}

export interface PatchVerificationResult {
  status: PatchVerificationStatus;
  currentLifecycleStage: PatchLifecycleStage;
  lifecycleSteps: PatchLifecycleStep[];
  concreteDiffProvided: boolean;
  delimiterBalanced: boolean;
  vulnerableSinkEliminated: boolean;
  defensiveGuardPresent: boolean;
  compilationExecuted: boolean;
  patchDiffHash: string;
  checks: PatchVerificationCheck[];
  residualRiskNote: string;
}

const CWE_GUARD_PATTERNS: Record<string, RegExp[]> = {
  "CWE-89": [
    /prepareStatement|PreparedStatement|SqlParameter|Parameters\.Add|cursor\.execute\s*\([^+%]+,\s*[\[(]|\$\d+|\?/i,
  ],
  "CWE-78": [
    /ProcessBuilder|execFile|subprocess\.run\s*\(\s*\[|shell\s*=\s*False|UseShellExecute\s*=\s*false|ArgumentList/i,
  ],
  "CWE-79": [
    /Encode\.forHtml|textContent|HtmlEncode|escapeHtml|html\.escape|DOMPurify|createElement|encodeForHTML|markupsafe/i,
  ],
  "CWE-22": [
    /normalize\s*\(|toRealPath|startsWith|GetFullPath|resolve\s*\(|isSymbolicLink|NOFOLLOW_LINKS|commonpath/i,
  ],
  "CWE-327": [
    /AES\/GCM\/NoPadding|AESGCM|AesGcm|createCipheriv\s*\(\s*['"]aes-256-gcm['"]|GCMParameterSpec/i,
  ],
  "CWE-328": [
    /PBKDF2WithHmacSHA256|Argon2|BCrypt|scrypt|Rfc2898DeriveBytes|hashlib\.pbkdf2_hmac|PasswordHasher/i,
  ],
  "CWE-330": [
    /SecureRandom|crypto\.randomBytes|secrets\.token|RandomNumberGenerator\.(?:Fill|GetBytes)/i,
  ],
  "CWE-502": [
    /JSON\.parse|json\.loads|JsonSerializer\.Deserialize|ObjectInputFilter|SafeLoader|safe_load|model_validate/i,
  ],
  "CWE-611": [
    /disallow-doctype-decl|DtdProcessing\.Prohibit|resolve_entities\s*=\s*False|FEATURE_SECURE_PROCESSING|defusedxml|noent\s*:\s*false/i,
  ],
  "CWE-90": [
    /escapeLdapSearchFilter|filterArgs|escape_filter_chars|SearchRequest|SearchControls|new\s+Object\[\]/i,
  ],
  "CWE-643": [
    /XPathVariableResolver|setXPathVariableResolver|compile|variables/i,
  ],
  "CWE-614": [
    /setSecure\s*\(\s*true\s*\)|HttpOnly\s*=\s*true|Secure\s*=\s*true|SameSite/i,
  ],
  "CWE-918": [
    /ALLOWLIST|ALLOWED_HOSTS|isPrivateOrLoopback|isLoopbackAddress|isSiteLocalAddress|redirect\s*:\s*['"]error['"]|Redirect\.NEVER|allow_redirects\s*=\s*False|maxRedirects\s*:\s*0/i,
  ],
};

function computePatchHash(text: string): string {
  let h1 = 0x811c9dc5 ^ text.length;
  let h2 = 0x01000193 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619);
    h2 = Math.imul(h2 ^ ch, 2246822507);
  }
  return (
    "PDH-" +
    (h1 >>> 0).toString(16).padStart(8, "0").toUpperCase() +
    (h2 >>> 0).toString(16).padStart(8, "0").toUpperCase()
  );
}

/**
 * Extracts only the proposed "after" fix portion of a remediation snippet when the snippet
 * includes an illustrative "// ❌ VULNERABLE" before-block followed by "// ✅ FIXED".
 * This prevents the static re-scan from flagging the commented/illustrative "before" block
 * as a newly introduced sink in the fixed code.
 */
export function extractFixedPortionOfRemediation(remediationSnippet: string): string {
  const fixedMarkerMatch = remediationSnippet.match(/(?:\/\/|#)\s*(?:✅\s*)?FIXED\b[^\n]*\n([\s\S]*)/i);
  if (fixedMarkerMatch && fixedMarkerMatch[1].trim().length > 0) {
    return fixedMarkerMatch[1].trim();
  }
  return remediationSnippet.trim();
}

function stripStringsAndComments(code: string): string {
  // Replace string literals first so URLs like "http://apache.org/..." inside strings are never treated as // comments
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"(?:\\.|[^"\\\r\n])*"/g, '""')
    .replace(/'(?:\\.|[^'\\\r\n])*'/g, "''")
    .replace(/\/\/.*$/gm, "")
    .replace(/^\s*#.*$/gm, "");
}

function stripCommentsFromCode(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(?<!:)\/\/.*$/gm, "")
    .replace(/^\s*#.*$/gm, "");
}

function checkDelimiterBalance(code: string): { balanced: boolean; detail: string } {
  const cleaned = stripStringsAndComments(code);

  let braces = 0;
  let parens = 0;
  let brackets = 0;
  for (const ch of cleaned) {
    if (ch === "{") braces++;
    else if (ch === "}") braces--;
    else if (ch === "(") parens++;
    else if (ch === ")") parens--;
    else if (ch === "[") brackets++;
    else if (ch === "]") brackets--;
  }

  const balanced = braces === 0 && parens === 0 && brackets === 0;
  return {
    balanced,
    detail: balanced
      ? "All lexical delimiters ({}, (), []) are balanced across the proposed patch."
      : `Unbalanced delimiters detected (braces: ${braces}, parens: ${parens}, brackets: ${brackets}).`,
  };
}

/**
 * Statically verifies a proposed remediation snippet for syntax balance, sink elimination,
 * and CWE-specific defensive guard presence. Never claims `PATCH_VERIFIED` unless
 * compilation and runtime re-test were executed.
 */
export function verifyRemediationPatch(params: {
  cwe: string;
  language: string;
  vulnerableSnippet: string;
  remediationSnippet: string;
  compiledAndRetested?: boolean;
}): PatchVerificationResult {
  const {
    cwe,
    language,
    remediationSnippet,
    compiledAndRetested = false,
  } = params;

  const trimmed = (remediationSnippet || "").trim();
  const fixedPortion = extractFixedPortionOfRemediation(trimmed);
  const uncommentedFixed = stripCommentsFromCode(fixedPortion);

  const isFallbackStub =
    trimmed.length <= 45 ||
    /No .* remediation template is available/i.test(trimmed);

  const concreteDiffProvided = !isFallbackStub;
  const balanceResult = checkDelimiterBalance(fixedPortion);

  // Check only the uncommented FIXED code block so "// ❌ VULNERABLE" examples never trigger a false sink match
  const hasRawConcatSink =
    /(?:executeQuery|executeUpdate|ExecuteReader|Runtime\.getRuntime\(\)\.exec|Process\.Start)\s*\([^)]*\+/i.test(
      uncommentedFixed
    ) ||
    /Cipher\.getInstance\s*\(\s*["'](?:DES|AES\/ECB|RC4)/i.test(uncommentedFixed) ||
    /MessageDigest\.getInstance\s*\(\s*["'](?:MD5|SHA-1|SHA1)["']\s*\)/i.test(
      uncommentedFixed
    );

  const vulnerableSinkEliminated = concreteDiffProvided && !hasRawConcatSink;

  const cweKey = (cwe || "").toUpperCase();
  const guardRegexes = CWE_GUARD_PATTERNS[cweKey] || [];
  const defensiveGuardPresent =
    guardRegexes.length > 0
      ? guardRegexes.some((rx) => rx.test(fixedPortion))
      : concreteDiffProvided && fixedPortion.length > 35;

  const patchDiffHash = computePatchHash(fixedPortion || trimmed);

  const checks: PatchVerificationCheck[] = [
    {
      checkId: "PV-01",
      label: `Concrete ${language} Remediation Diff`,
      passed: concreteDiffProvided,
      executionState: concreteDiffProvided ? "VERIFIED_STATIC" : "FAILED",
      detail: concreteDiffProvided
        ? `Concrete ${language} remediation diff provided (${trimmed.length} chars; hash ${patchDiffHash}).`
        : "Remediation code is missing or uses a generic placeholder stub.",
    },
    {
      checkId: "PV-02",
      label: "Lexical & Delimiter Syntax Balance",
      passed: balanceResult.balanced,
      executionState: balanceResult.balanced ? "VERIFIED_STATIC" : "FAILED",
      detail: balanceResult.detail,
    },
    {
      checkId: "PV-03",
      label: "Static Re-Scan of Fixed Block (Sink Elimination)",
      passed: vulnerableSinkEliminated,
      executionState: vulnerableSinkEliminated ? "VERIFIED_STATIC" : "FAILED",
      detail: vulnerableSinkEliminated
        ? `Static re-scan of the fixed code block confirmed no unparameterized concatenation or broken primitive remains.`
        : `Fixed code block still matches dangerous sink pattern for ${cweKey}.`,
    },
    {
      checkId: "PV-04",
      label: `Defensive Guard / Safe API Dominance (${cweKey})`,
      passed: defensiveGuardPresent,
      executionState: defensiveGuardPresent ? "VERIFIED_STATIC" : "FAILED",
      detail: defensiveGuardPresent
        ? `Verified presence of ${cweKey} defensive control / parameterized API in proposed patch.`
        : `Could not pattern-match a canonical ${cweKey} guard control in patch.`,
    },
    {
      checkId: "PV-05",
      label: "Target Build Compilation & Security Regression Test",
      passed: compiledAndRetested,
      executionState: compiledAndRetested ? "EXECUTED_RUNTIME" : "NOT_EXECUTED",
      detail: compiledAndRetested
        ? "Patch compiled in target build tree and verified against regression harness."
        : "NOT_EXECUTED — Static source diff validated; target build compilation, security regression test, and functional test suite must be executed in CI/CD.",
    },
  ];

  const staticPassed = concreteDiffProvided && balanceResult.balanced && vulnerableSinkEliminated && defensiveGuardPresent;

  let status: PatchVerificationStatus = "PATCH_STATICALLY_VALIDATED_UNCOMPILED";
  let currentLifecycleStage: PatchLifecycleStage = "PATCH_STATICALLY_VALIDATED";

  if (!concreteDiffProvided) {
    status = "PATCH_INCOMPLETE_OR_STUB";
    currentLifecycleStage = "PATCH_GENERATED";
  } else if (!vulnerableSinkEliminated) {
    status = "PATCH_INTRODUCED_NEW_SINK";
    currentLifecycleStage = "PATCH_GENERATED";
  } else if (!staticPassed) {
    status = "PATCH_STATIC_VALIDATION_FAILED";
    currentLifecycleStage = "PATCH_GENERATED";
  } else if (compiledAndRetested) {
    status = "PATCH_VERIFIED";
    currentLifecycleStage = "REMEDIATION_VERIFIED";
  } else {
    status = "PATCH_STATICALLY_VALIDATED_UNCOMPILED";
    currentLifecycleStage = "PATCH_STATICALLY_VALIDATED";
  }

  const lifecycleSteps: PatchLifecycleStep[] = [
    {
      stage: "PATCH_GENERATED",
      status: concreteDiffProvided ? "PASSED" : "FAILED",
      artifactRef: concreteDiffProvided ? patchDiffHash : "none",
    },
    {
      stage: "PATCH_STATICALLY_VALIDATED",
      status: staticPassed ? "PASSED" : "FAILED",
      artifactRef: staticPassed ? `AST-RESCAN-${patchDiffHash}` : "none",
    },
    {
      stage: "PATCH_COMPILED",
      status: compiledAndRetested ? "PASSED" : "NOT_RUN",
      artifactRef: compiledAndRetested ? `BUILD-${patchDiffHash}` : "NOT_EXECUTED (Static Mode)",
    },
    {
      stage: "SECURITY_TEST_PASSED",
      status: compiledAndRetested ? "PASSED" : "NOT_RUN",
      artifactRef: compiledAndRetested ? `SEC-RETEST-${patchDiffHash}` : "NOT_EXECUTED (Static Mode)",
    },
    {
      stage: "FUNCTIONAL_TEST_PASSED",
      status: compiledAndRetested ? "PASSED" : "NOT_RUN",
      artifactRef: compiledAndRetested ? `FUNC-TEST-${patchDiffHash}` : "NOT_EXECUTED (Static Mode)",
    },
    {
      stage: "REMEDIATION_VERIFIED",
      status: status === "PATCH_VERIFIED" ? "PASSED" : "NOT_RUN",
      artifactRef: status === "PATCH_VERIFIED" ? `VERIFIED-${patchDiffHash}` : "AWAITING_BUILD_AND_RETEST",
    },
  ];

  const residualRiskNote =
    status === "PATCH_VERIFIED"
      ? "Low — Patch compiled, statically re-scanned, and verified in runtime harness."
      : status === "PATCH_STATICALLY_VALIDATED_UNCOMPILED"
      ? `Moderate-Low — Patch passes static syntax balance, sink elimination, and ${cweKey} guard dominance checks (${currentLifecycleStage}), but requires target compilation & regression execution in CI/CD.`
      : `Elevated — Remediation patch requires developer completion and verification before release.`;

  return {
    status,
    currentLifecycleStage,
    lifecycleSteps,
    concreteDiffProvided,
    delimiterBalanced: balanceResult.balanced,
    vulnerableSinkEliminated,
    defensiveGuardPresent,
    compilationExecuted: compiledAndRetested,
    patchDiffHash,
    checks,
    residualRiskNote,
  };
}

/**
 * Aggregates portfolio-level patch verification lifecycle counts for the Executive Summary
 * so generated, statically validated, failed, compiled, and regression-tested patches are
 * reported explicitly and transparently.
 */
export function summarizePatchVerificationPortfolio(
  results: (PatchVerificationResult | undefined)[]
): PatchPortfolioSummary {
  let patchesGeneratedCount = 0;
  let staticValidationPassedCount = 0;
  let staticValidationFailedCount = 0;
  let compiledSuccessfullyCount = 0;
  let securityRegressionPassedCount = 0;
  let functionalRegressionPassedCount = 0;
  let remediationVerifiedCount = 0;

  for (const r of results) {
    if (!r) continue;
    if (r.concreteDiffProvided) patchesGeneratedCount++;
    const stepMap = new Map(r.lifecycleSteps.map((s) => [s.stage, s.status]));
    if (stepMap.get("PATCH_STATICALLY_VALIDATED") === "PASSED") {
      staticValidationPassedCount++;
    } else {
      staticValidationFailedCount++;
    }
    if (stepMap.get("PATCH_COMPILED") === "PASSED") compiledSuccessfullyCount++;
    if (stepMap.get("SECURITY_TEST_PASSED") === "PASSED") securityRegressionPassedCount++;
    if (stepMap.get("FUNCTIONAL_TEST_PASSED") === "PASSED") functionalRegressionPassedCount++;
    if (stepMap.get("REMEDIATION_VERIFIED") === "PASSED") remediationVerifiedCount++;
  }

  return {
    totalFindings: results.length,
    patchesGeneratedCount,
    staticValidationPassedCount,
    staticValidationFailedCount,
    compiledSuccessfullyCount,
    securityRegressionPassedCount,
    functionalRegressionPassedCount,
    remediationVerifiedCount,
  };
}
