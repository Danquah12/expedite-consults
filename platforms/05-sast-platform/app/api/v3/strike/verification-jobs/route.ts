import { NextResponse } from "next/server";
import FINDINGS from "@/data/findings";
import {
  executeAuthorizedStrikeVerificationJobV53,
  type StrikeVerificationJobRequestV53,
} from "@/lib/xtrike-v53-engine";

export async function GET() {
  const sampleJob = executeAuthorizedStrikeVerificationJobV53(
    {
      assessment_id: "a8098c1a-f86e-11da-bd1a-00112444be1e",
      finding_id: "F-001",
      target_environment: "ISOLATED_SANDBOX",
      target_url_or_harness: "http://127.0.0.1:18080/owasp-benchmark-harness",
      authorization_token: "XTRIKE-AUTH-TOKEN-V53-SANDBOX",
      payload_policy: "SAFE_CANARY",
      max_requests: 5,
      timeout_seconds: 30,
      approved_by: "AppSec Release Gate Authority",
    },
    FINDINGS[0]
  );

  return NextResponse.json({
    specVersion: "XTRIKE-STRIKE-CONTRACT-v5.3",
    gatewayStatus: "ONLINE_FAIL_CLOSED",
    supportedEnvironments: ["ISOLATED_SANDBOX", "AUTHORIZED_STAGING"],
    supportedPayloadPolicies: ["SAFE_CANARY"],
    sampleVerificationJob: sampleJob,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<StrikeVerificationJobRequestV53>;
    const findingId = body.finding_id || "F-001";
    const matchedFinding = FINDINGS.find((f) => f.id.toUpperCase() === findingId.toUpperCase());

    const jobRequest: StrikeVerificationJobRequestV53 = {
      assessment_id: body.assessment_id || "a8098c1a-f86e-11da-bd1a-00112444be1e",
      finding_id: findingId,
      target_environment: body.target_environment || "ISOLATED_SANDBOX",
      target_url_or_harness: body.target_url_or_harness || "http://127.0.0.1:18080/isolated-harness",
      authorization_token: body.authorization_token || "",
      payload_policy: body.payload_policy || "SAFE_CANARY",
      max_requests: typeof body.max_requests === "number" ? body.max_requests : 5,
      timeout_seconds: typeof body.timeout_seconds === "number" ? body.timeout_seconds : 30,
      approved_by: body.approved_by,
      time_window_valid: body.time_window_valid,
      waf_interception_simulated: body.waf_interception_simulated,
    };

    const result = executeAuthorizedStrikeVerificationJobV53(jobRequest, matchedFinding);
    return NextResponse.json(result, {
      status: result.authorization_status === "AUTHORIZED" ? 200 : 403,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "INVALID_STRIKE_VERIFICATION_REQUEST",
        detail: err instanceof Error ? err.message : "Malformed request payload",
      },
      { status: 400 }
    );
  }
}
