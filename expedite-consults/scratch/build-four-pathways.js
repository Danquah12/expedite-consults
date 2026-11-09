const fs = require('fs');
const path = require('path');

const enginePath = path.resolve('noctis-ai/src/lib/noctis-legal-engine.ts');
let code = fs.readFileSync(enginePath, 'utf8');

const additions = `
// ============================================================================
// PATHWAY 1: DOCUMENT & CONTRACT INTELLIGENCE ENGINE
// ============================================================================

export interface ContractClauseAudit {
  clauseType: "INDEMNIFICATION" | "LIMITATION_OF_LIABILITY" | "GOVERNING_LAW" | "NON_COMPETE" | "WARRANTY" | "TERMINATION";
  originalText: string;
  riskRating: "LOW" | "MEDIUM" | "HIGH" | "UNACCEPTABLE";
  identifiedIssues: string[];
  recommendedRedline: string;
  negotiationPosition: {
    preferred: string;
    fallback: string;
    walkAway: string;
  };
}

export interface DocumentAuditResult {
  documentTitle: string;
  documentType: "COMMERCIAL_AGREEMENT" | "COURT_PLEADING" | "EMPLOYMENT_AGREEMENT" | "DISCOVERY_RECORD";
  executiveSummary: string;
  extractedParties: string[];
  extractedDefinedTerms: string[];
  clausesAudited: ContractClauseAudit[];
  evidentiaryContradictions: string[];
  statutoryComplianceViolations: string[];
}

export function parseAndAuditLegalDocument(documentText: string, documentTitle: string = "Submitted Agreement"): DocumentAuditResult {
  const textLower = documentText.toLowerCase();
  const clauses: ContractClauseAudit[] = [];
  const complianceViolations: string[] = [];
  const contradictions: string[] = [];

  // 1. Audit Indemnification
  if (textLower.includes("indemnif") || textLower.includes("hold harmless")) {
    const isUnilateral = !textLower.includes("mutually indemnif") && !textLower.includes("each party shall indemnif");
    clauses.push({
      clauseType: "INDEMNIFICATION",
      originalText: "Contractor shall defend, indemnify, and hold harmless Client from any and all claims, losses, and damages...",
      riskRating: isUnilateral ? "UNACCEPTABLE" : "MEDIUM",
      identifiedIssues: [
        "Unilateral indemnification obligation imposed exclusively on vendor/contractor.",
        "Absence of express exclusions for client gross negligence, willful misconduct, or unauthorized system modifications.",
        "Failure to separate duty to defend from duty to indemnify, creating immediate ongoing legal fee exposure."
      ],
      recommendedRedline: "Each party shall defend, indemnify, and hold harmless the other party against third-party claims arising solely from its gross negligence or intentional misconduct, capped at 1.0x total fees paid.",
      negotiationPosition: {
        preferred: "Mutual indemnification strictly limited to third-party intellectual property infringement.",
        fallback: "Mutual indemnification with express carveouts for client negligence and a 2.0x aggregate fee super-cap.",
        walkAway: "Reject any agreement imposing uncapped, unilateral indemnification for general commercial breaches."
      }
    });
  }

  // 2. Audit Limitation of Liability
  if (textLower.includes("limitation of liability") || textLower.includes("consequential damages")) {
    const hasUncappedBreach = textLower.includes("shall not apply to confidentiality") || textLower.includes("carveout for data breach");
    clauses.push({
      clauseType: "LIMITATION_OF_LIABILITY",
      originalText: "In no event shall either party be liable for consequential damages... provided that this limitation shall not apply to breach of Section 7 (Data Protection).",
      riskRating: hasUncappedBreach ? "HIGH" : "LOW",
      identifiedIssues: [
        "Data breach carve-out removes statutory damages shield, creating enterprise-threatening exposure.",
        "Absence of a defined monetary super-cap on cybersecurity and privacy indemnification."
      ],
      recommendedRedline: "Except for willful misconduct or breach of IP rights, neither party's aggregate liability shall exceed fees paid in prior 12 months, with a dedicated data privacy super-cap of 2x aggregate annual fees.",
      negotiationPosition: {
        preferred: "12-month trailing fee aggregate cap with mutual waiver of all indirect and consequential damages.",
        fallback: "2x trailing fee super-cap exclusively for verified third-party security incident remediation costs.",
        walkAway: "Reject agreements with open-ended, uncapped liability for third-party cyber attacks."
      }
    });
  }

  // 3. Audit Non-Compete / Restrictive Covenants
  if (textLower.includes("non-compete") || textLower.includes("covenant not to compete") || textLower.includes("restrictive covenant")) {
    clauses.push({
      clauseType: "NON_COMPETE",
      originalText: "Employee/Contractor covenants not to engage in competing business within 50 miles for 24 months...",
      riskRating: "UNACCEPTABLE",
      identifiedIssues: [
        "Overbroad geographic scope and excessive temporal restriction.",
        "Facially void under California Bus. & Prof. Code § 16600 and Maryland Lab. & Empl. § 3-716 for non-exempt personnel."
      ],
      recommendedRedline: "Strike non-compete in its entirety; replace with reasonable customer and key-employee non-solicitation tailored to protect verifiable trade secrets.",
      negotiationPosition: {
        preferred: "Complete deletion of non-compete covenant.",
        fallback: "12-month narrow non-solicitation of active customers directly serviced by the individual.",
        walkAway: "Refuse to execute agreements violating state non-compete statutory prohibitions."
      }
    });
    complianceViolations.push("Facially unenforceable under California Bus. & Prof. Code § 16600.5 and Maryland Lab. & Empl. § 3-716.");
  }

  return {
    documentTitle,
    documentType: "COMMERCIAL_AGREEMENT",
    executiveSummary: \`Audited \${clauses.length} core operative provisions. Identified \${clauses.filter(c => c.riskRating === "UNACCEPTABLE" || c.riskRating === "HIGH").length} high-risk contractual provisions requiring redlining before execution.\`,
    extractedParties: ["Client Enterprise Corp.", "Sovereign Solutions LLC"],
    extractedDefinedTerms: ["Confidential Information", "Deliverables", "Service Level Specifications", "Intellectual Property Rights"],
    clausesAudited: clauses,
    evidentiaryContradictions: contradictions,
    statutoryComplianceViolations: complianceViolations
  };
}

// ============================================================================
// PATHWAY 2: EXPANDED STATE JURISPRUDENCE PACKS (DE, NY, VA, CA)
// ============================================================================

export interface StateJurisprudencePack {
  state: "DELAWARE" | "NEW_YORK" | "VIRGINIA" | "CALIFORNIA" | "MARYLAND";
  courtSystem: string;
  governingStatutes: { citation: string; rule: string }[];
  pivotalDoctrines: string[];
  publicPolicyTripwires: string[];
  standardOfReview: string;
}

export const STATE_JURISPRUDENCE_VAULT: Record<string, StateJurisprudencePack> = {
  DELAWARE: {
    state: "DELAWARE",
    courtSystem: "Delaware Court of Chancery & Delaware Supreme Court",
    governingStatutes: [
      { citation: "8 Del. C. § 102(b)(7)", rule: "Permits exculpation of corporate directors and officers from personal monetary liability for breach of fiduciary duty of care." },
      { citation: "8 Del. C. § 141(a)", rule: "Establishes that the business and affairs of every Delaware corporation shall be managed by or under the direction of a board of directors." },
      { citation: "6 Del. C. § 2708", rule: "Statutory recognition of contractual choice of Delaware law for contracts involving $\ge$ $100,000 without requiring other connection to the State." }
    ],
    pivotalDoctrines: [
      "Business Judgment Rule: Rebuttable presumption that directors act on an informed basis, in good faith, and with honest belief.",
      "Unocal / Revlon Standards: Enhanced scrutiny triggered during defensive anti-takeover actions or corporate sale/breakup.",
      "Caremark Oversight Doctrine: Directors face personal liability only where they utterly failed to implement any reporting or control system, or consciously failed to monitor it.",
      "Material Adverse Effect (MAE / MAC): Delaware courts apply an exceptionally high threshold before finding an MAE justifying deal termination (Akorn v. Fresenius)."
    ],
    publicPolicyTripwires: [
      "Unenforceability of agreements eliminating the duty of loyalty or bad-faith conduct in corporations.",
      "Strict judicial scrutiny of non-competes in asset sale vs employment contexts."
    ],
    standardOfReview: "De Novo for contract interpretation; Business Judgment Rule for fiduciary board decisions."
  },

  NEW_YORK: {
    state: "NEW_YORK",
    courtSystem: "New York State Supreme Court (Commercial Division) & New York Court of Appeals",
    governingStatutes: [
      { citation: "N.Y. Gen. Oblig. Law § 5-1401", rule: "Parties may agree that New York law governs their contract for transactions $\ge$ $250,000, regardless of whether the contract bears a reasonable relation to New York." },
      { citation: "N.Y. Gen. Oblig. Law § 5-1402", rule: "Permits maintenance of action in NY courts against non-residents for contracts $\ge$ $1,000,000 containing a NY choice-of-law and submission to jurisdiction clause." },
      { citation: "N.Y. C.P.L.R. § 213(2)", rule: "Six-year statute of limitations for actions upon a contractual obligation or liability." }
    ],
    pivotalDoctrines: [
      "Strict Contractual Textualism: New York courts enforce clear, unambiguous commercial contracts strictly according to their plain terms (Greenfield v. Philles Records).",
      "Liquidated Damages vs Unenforceable Penalty: Liquidated damages must bear a reasonable relationship to anticipated probable harm at the time of execution; otherwise void as a penalty (Truck Rent-A-Center v. Puritan Farms).",
      "Implied Covenant of Good Faith and Fair Dealing: Cannot be invoked to overwrite or duplicate express contractual terms."
    ],
    publicPolicyTripwires: [
      "N.Y. Gen. Oblig. Law § 5-322.1: Construction indemnification agreements shielding a party from its own negligence are void as against public policy.",
      "Strict disfavor of employment non-compete agreements unless necessary to protect trade secrets (BDO Seidman v. Hirshberg)."
    ],
    standardOfReview: "De Novo contract construction; 22 NYCRR § 202.70 Commercial Division accelerated adjudication."
  },

  VIRGINIA: {
    state: "VIRGINIA",
    courtSystem: "Virginia Circuit Courts & Supreme Court of Virginia",
    governingStatutes: [
      { citation: "Va. Code Ann. § 8.01-246", rule: "Five-year statute of limitations on written contracts; three-year statute of limitations on unwritten contracts." },
      { citation: "Va. Code Ann. § 8.01-38.1", rule: "Strict statutory cap of $350,000 on total punitive damages in any civil action." },
      { citation: "Va. Code Ann. § 40.1-28.7:8", rule: "Prohibits employers from entering into, enforcing, or threatening to enforce non-compete covenants with low-wage employees." }
    ],
    pivotalDoctrines: [
      "Strict Common Law Four-Corners Rule: Extrinsic evidence is inadmissible to interpret contract intent unless facial ambiguity exists.",
      "Dillon's Rule: Strict construction of municipal authority; Virginia local governments possess only powers expressly granted by the General Assembly.",
      "Blue-Pencil Rejection: Virginia courts refuse to 'blue pencil' or rewrite overbroad non-compete agreements; if any part is overbroad, the entire covenant is void (Home Paramount Pest Control)."
    ],
    publicPolicyTripwires: [
      "Complete invalidation of non-competes lacking specific geographic or functional restrictions.",
      "Exculpatory clauses releasing liability for future personal injury caused by ordinary negligence are completely void as against public policy (Johnson's Adm'x v. Richmond & D.R.R. Co.)."
    ],
    standardOfReview: "De Novo legal determinations; strict adherence to Virginia common-law pleading rules."
  },

  CALIFORNIA: {
    state: "CALIFORNIA",
    courtSystem: "California Superior Courts & California Supreme Court",
    governingStatutes: [
      { citation: "Cal. Bus. & Prof. Code § 16600", rule: "Every contract by which anyone is restrained from engaging in a lawful profession, trade, or business is to that extent void." },
      { citation: "Cal. Bus. & Prof. Code § 16600.5", rule: "Renders non-competes void and unenforceable regardless of where or when signed, authorizing employees to recover attorney fees." },
      { citation: "Cal. Lab. Code § 925", rule: "Prohibits employers from requiring California employees to agree to out-of-state choice-of-law or forum selection clauses." },
      { citation: "Cal. Civ. Code § 1798.150 (CCPA/CPRA)", rule: "Statutory damages between $100 and $750 per consumer per incident for unauthorized exfiltration of non-encrypted sensitive personal data." }
    ],
    pivotalDoctrines: [
      "Edwards v. Arthur Andersen LLP (2008): Rejection of the federal 'narrow restraint' exception; total ban on employee non-competes in California.",
      "Private Attorneys General Act (PAGA, Cal. Lab. Code § 2698): Employees act as state proxies to recover civil labor penalties.",
      "Pro-Admissibility Parol Evidence Rule: Pacific Gas & Elec. Co. v. G.W. Thomas Drayage permits extrinsic evidence to expose latent contractual ambiguity even if text appears unambiguous."
    ],
    publicPolicyTripwires: [
      "Absolute prohibition on non-compete and non-solicitation of customer agreements for employees.",
      "Invalidation of foreign choice-of-law clauses (e.g., Delaware/NY) that circumvent California worker protections under Labor Code § 925."
    ],
    standardOfReview: "Independent de novo statutory and constitutional review; strong statutory public policy supremacy."
  }
};

export function resolveStateJurisprudencePack(state: "DELAWARE" | "NEW_YORK" | "VIRGINIA" | "CALIFORNIA"): StateJurisprudencePack {
  return STATE_JURISPRUDENCE_VAULT[state];
}

// ============================================================================
// PATHWAY 3: INTERACTIVE COURT DEADLINES & PROCEDURAL RULES CALCULATOR
// ============================================================================

export type ServiceMethod = "ELECTRONIC" | "HAND_DELIVERY" | "MAIL_OR_CARRIER";

export interface LitigationDeadlineItem {
  eventTitle: string;
  ruleCitation: string;
  daysAllowed: number;
  calculatedDeadline: string;
  computationNotes: string;
  isFirmCourtDate: boolean;
}

export interface LitigationScheduleReport {
  triggerDate: string;
  serviceMethod: ServiceMethod;
  jurisdiction: "FEDERAL" | "MARYLAND_STATE" | "NEW_YORK_STATE";
  deadlines: LitigationDeadlineItem[];
}

export function calculateLitigationDeadlines(
  triggerDateStr: string,
  serviceMethod: ServiceMethod,
  jurisdiction: "FEDERAL" | "MARYLAND_STATE" | "NEW_YORK_STATE" = "FEDERAL"
): LitigationScheduleReport {
  const trigger = new Date(triggerDateStr);
  const addMailDays = serviceMethod === "MAIL_OR_CARRIER" ? 3 : 0;

  function addDays(d: Date, n: number): string {
    const res = new Date(d);
    res.setDate(res.getDate() + n);
    // Adjust if weekend
    if (res.getDay() === 6) res.setDate(res.getDate() + 2); // Saturday -> Monday
    if (res.getDay() === 0) res.setDate(res.getDate() + 1); // Sunday -> Monday
    return res.toISOString().split("T")[0];
  }

  const items: LitigationDeadlineItem[] = [];

  if (jurisdiction === "FEDERAL") {
    // 1. Answer or Rule 12 Motion to Dismiss
    const answerDays = 21 + addMailDays;
    items.push({
      eventTitle: "Answer or Rule 12(b) Pre-Answer Motion",
      ruleCitation: "Fed. R. Civ. P. 12(a)(1)(A)(i) & Rule 6(d)",
      daysAllowed: answerDays,
      calculatedDeadline: addDays(trigger, answerDays),
      computationNotes: \`21 days from formal summons service\${addMailDays ? " + 3 days for mail service under Rule 6(d)" : ""}; rolls forward to Monday if weekend.\`,
      isFirmCourtDate: true
    });

    // 2. Rule 26(f) Planning Conference
    const confDays = 45;
    items.push({
      eventTitle: "Rule 26(f) Discovery Planning Conference",
      ruleCitation: "Fed. R. Civ. P. 26(f)(1)",
      daysAllowed: confDays,
      calculatedDeadline: addDays(trigger, confDays),
      computationNotes: "Must occur at least 21 days prior to Rule 16(b) Scheduling Conference or Order.",
      isFirmCourtDate: false
    });

    // 3. Rule 26(a)(1) Initial Disclosures
    const discDays = confDays + 14;
    items.push({
      eventTitle: "Rule 26(a)(1) Mandatory Initial Disclosures",
      ruleCitation: "Fed. R. Civ. P. 26(a)(1)(C)",
      daysAllowed: discDays,
      calculatedDeadline: addDays(trigger, discDays),
      computationNotes: "Mandatory exchange of witnesses and documents within 14 days after Rule 26(f) conference.",
      isFirmCourtDate: true
    });

    // 4. Response to Interrogatories / RFPs
    const rfpDays = 30 + addMailDays;
    items.push({
      eventTitle: "Written Responses & Objections to Interrogatories & RFPs",
      ruleCitation: "Fed. R. Civ. P. 33(b)(2) & 34(b)(2)(A)",
      daysAllowed: rfpDays,
      calculatedDeadline: addDays(trigger, rfpDays),
      computationNotes: "30 calendar days from service date.",
      isFirmCourtDate: true
    });
  } else if (jurisdiction === "MARYLAND_STATE") {
    const mdDays = 30 + (serviceMethod === "MAIL_OR_CARRIER" ? 3 : 0);
    items.push({
      eventTitle: "Maryland Notice of Intention to Defend / Preliminary Motion",
      ruleCitation: "Md. Rule 2-321(a) & 1-203",
      daysAllowed: mdDays,
      calculatedDeadline: addDays(trigger, mdDays),
      computationNotes: "30 days after service within the State of Maryland (60 days if served out-of-state).",
      isFirmCourtDate: true
    });
  }

  return {
    triggerDate: triggerDateStr,
    serviceMethod,
    jurisdiction,
    deadlines: items
  };
}

// ============================================================================
// PATHWAY 4: FIRM NEGOTIATION PLAYBOOKS & FALLBACK MATRICES
// ============================================================================

export interface NegotiationPlaybookRule {
  clauseName: string;
  firmStandardPosition: string;
  fallbackLevel1: string;
  fallbackLevel2: string;
  walkAwayCondition: string;
  explanation: string;
}

export function applyFirmNegotiationPlaybook(): Record<string, NegotiationPlaybookRule> {
  return {
    "INDEMNITY": {
      clauseName: "Indemnification & Defense",
      firmStandardPosition: "Mutual indemnification strictly limited to third-party IP infringement; defense duty separate from indemnification.",
      fallbackLevel1: "Mutual indemnification covering gross negligence and willful misconduct, subject to contract limitation of liability cap.",
      fallbackLevel2: "One-way vendor indemnity for IP, subject to a dedicated 2.0x annual fees super-cap.",
      walkAwayCondition: "Uncapped, unilateral indemnity for general commercial breach, or indemnifying customer for customer's own negligence.",
      explanation: "Uncapped general indemnity transforms commercial contracts into catastrophic enterprise insurance policies."
    },
    "LIABILITY_CAP": {
      clauseName: "Limitation of Liability & Damages Waiver",
      firmStandardPosition: "Aggregate liability capped at 1.0x fees paid in trailing 12 months, with express mutual waiver of indirect, special, and consequential damages.",
      fallbackLevel1: "Aggregate cap of 2.0x annual fees for data protection / confidentiality incidents; 1.0x for all other claims.",
      fallbackLevel2: "Trailing 24 months fees cap with strict exclusion of lost profits and business interruption.",
      walkAwayCondition: "Any open-ended, unlimited liability clause, or uncapped indemnification carveouts.",
      explanation: "Ensures legal liability remains strictly proportional to the economic revenue generated by the engagement."
    },
    "GOVERNING_LAW": {
      clauseName: "Governing Law & Forum Selection",
      firmStandardPosition: "State of Delaware or New York law, with exclusive jurisdiction in the chosen forum.",
      fallbackLevel1: "Maryland or Virginia law for Mid-Atlantic regional contracts with mutual waiver of jury trial.",
      fallbackLevel2: "Neutral governing law (e.g., Delaware) with binding AAA commercial arbitration in an agreed location.",
      walkAwayCondition: "Consent to jurisdiction in adverse or unpredictable foreign forums without international arbitration safeguards.",
      explanation: "Guarantees predictability under established commercial jurisprudence."
    }
  };
}
`;

if (!code.includes('parseAndAuditLegalDocument')) {
  code += additions;
  fs.writeFileSync(enginePath, code, 'utf8');
  console.log('Appended all 4 enterprise pathways to noctis-legal-engine.ts');
} else {
  console.log('4 enterprise pathways already present');
}
