import { NextResponse } from "next/server";
import FINDINGS from "@/data/findings";
import type { SASTFinding } from "@/types/sast";
import {
  verifyAssessmentV53,
  computeV53FiveDimensionRisk,
  runV53EighteenTestAcceptanceSuite,
  buildCanonicalFindingV53Record,
  XTRIKE_V53_POSTGRES_DDL,
} from "@/lib/xtrike-v53-engine";

export async function GET() {
  const verification = verifyAssessmentV53(FINDINGS);
  const risk5D = computeV53FiveDimensionRisk(FINDINGS);
  const acceptance18 = runV53EighteenTestAcceptanceSuite(FINDINGS);
  const canonicalRegistry = FINDINGS.map((f) => buildCanonicalFindingV53Record(f));

  return NextResponse.json({
    specVersion: "XTRIKE-SAST-DESK-v5.3.0",
    verification,
    fiveDimensionRisk: risk5D,
    acceptanceSuite18: acceptance18,
    canonicalFindingCount: canonicalRegistry.length,
    canonicalRegistrySample: canonicalRegistry.slice(0, 5),
    postgresSchemaDdl: XTRIKE_V53_POSTGRES_DDL,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { findings?: SASTFinding[] };
    const targetFindings =
      Array.isArray(body?.findings) && body.findings.length > 0 ? body.findings : FINDINGS;

    const verification = verifyAssessmentV53(targetFindings);
    const risk5D = computeV53FiveDimensionRisk(targetFindings);
    const acceptance18 = runV53EighteenTestAcceptanceSuite(targetFindings);
    const canonicalRegistry = targetFindings.map((f) => buildCanonicalFindingV53Record(f));

    return NextResponse.json({
      specVersion: "XTRIKE-SAST-DESK-v5.3.0",
      verification,
      fiveDimensionRisk: risk5D,
      acceptanceSuite18: acceptance18,
      canonicalRegistry,
    });
  } catch (err) {
    return NextResponse.json(
      {
        valid: false,
        error: "EVIDENCE_BUNDLE_VERIFICATION_FAILED",
        detail: err instanceof Error ? err.message : "Invalid evidence bundle payload",
      },
      { status: 400 }
    );
  }
}
