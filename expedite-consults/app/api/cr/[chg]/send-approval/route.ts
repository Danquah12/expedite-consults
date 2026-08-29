import { NextRequest, NextResponse } from "next/server";
import { writeClient, crReadClient } from "@/sanity/lib/write-client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateToken(): string {
	return crypto.randomUUID().replace(/-/g, "");
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ chg: string }> }
) {
	try {
		const { chg } = await params;
		const body = await req.json();
		const { approvers } = body as {
			approvers: { name: string; email: string }[];
		};

		if (!approvers?.length) {
			return NextResponse.json({ error: "No approvers provided" }, { status: 400 });
		}

		// Fetch the CR
		const cr = await crReadClient.fetch(
			`*[_type == "changeRequest" && chgNumber == $chg][0]`,
			{ chg }
		);
		if (!cr) return NextResponse.json({ error: "CR not found" }, { status: 404 });

		const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

		const results = [];

		for (const approver of approvers) {
			const token = generateToken();

			// Check if approval already exists for this approver on this CR
			const existing = await crReadClient.fetch(
				`*[_type == "crApproval" && chgNumber == $chg && approverEmail == $email][0]._id`,
				{ chg, email: approver.email.toLowerCase() }
			);

			// Create or replace the approval token in Sanity
			if (existing) {
				await writeClient
					.patch(existing)
					.set({ token, decision: "pending", expiresAt, votedAt: null, comments: null })
					.commit();
			} else {
				await writeClient.create({
					_type: "crApproval",
					chgNumber: chg,
					approverName: approver.name,
					approverEmail: approver.email.toLowerCase(),
					token,
					decision: "pending",
					createdAt: new Date().toISOString(),
					expiresAt,
				});
			}

			// Build the review URL with the token
			const reviewUrl = `${baseUrl}/review/${chg}?token=${token}`;

			// Send the approval request email
			await resend.emails.send({
				from: process.env.RESEND_FORM_EMAIL ?? "onboarding@resend.dev",
				to: approver.email,
				subject: `Action Required: CAB Approval for ${chg} — ${cr.shortDescription}`,
				html: buildApprovalEmail({ cr, approver, reviewUrl, expiresAt }),
			});

			results.push({ email: approver.email, token, reviewUrl });
		}

		// Add a work note to the CR
		await writeClient
			.patch(cr._id)
			.append("workNotes", [{
				_key: `approval-sent-${Date.now()}`,
				author: "System",
				authorEmail: "system@cr-portal",
				note: `CAB approval request sent to: ${approvers.map(a => a.email).join(", ")}`,
				timestamp: new Date().toISOString(),
				type: "status_update",
			}])
			.commit();

		return NextResponse.json({ success: true, results });
	} catch (e) {
		console.error("[POST /api/cr/[chg]/send-approval]", e);
		return NextResponse.json({ error: String(e) }, { status: 500 });
	}
}

// ── Email HTML builder ────────────────────────────────────────────────────────

function riskBg(score: number) {
	if (score >= 7) return "#dc2626";
	if (score >= 4) return "#d97706";
	return "#16a34a";
}

function buildApprovalEmail({
	cr, approver, reviewUrl, expiresAt,
}: {
	cr: any;
	approver: { name: string; email: string };
	reviewUrl: string;
	expiresAt: string;
}) {
	const approveUrl  = `${reviewUrl}&decision=approved`;
	const rejectUrl   = `${reviewUrl}&decision=rejected`;
	const deferUrl    = `${reviewUrl}&decision=deferred`;
	const expireDate  = new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

	return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

  <!-- Header -->
  <div style="background:#030c1d;padding:28px 32px;text-align:center;">
    <p style="color:#43bbd1;font-size:24px;margin:0;">⚙️</p>
    <h1 style="color:#fff;font-size:18px;margin:8px 0 4px;">CAB Approval Required</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">IT Change Management Portal · ITIL v4</p>
  </div>

  <!-- Body -->
  <div style="padding:28px 32px;">
    <p style="color:#374151;font-size:14px;margin:0 0 20px;">
      Hi <strong>${approver.name}</strong>, you have been requested to review and vote on the following change request.
    </p>

    <!-- CR Summary card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <p style="margin:0 0 4px;"><span style="background:#030c1d;color:#43bbd1;font-family:monospace;font-size:13px;font-weight:700;padding:3px 8px;border-radius:4px;">${cr.chgNumber}</span></p>
          <h2 style="color:#111827;font-size:16px;font-weight:700;margin:8px 0 4px;">${cr.shortDescription}</h2>
          <p style="color:#6b7280;font-size:12px;margin:0;">Submitted by ${cr.requestor?.name ?? "Unknown"}</p>
        </div>
        <div style="text-align:center;background:${riskBg(cr.riskScore ?? 1)};color:#fff;border-radius:8px;padding:8px 16px;">
          <p style="font-size:10px;margin:0;opacity:0.8;">RISK</p>
          <p style="font-size:24px;font-weight:900;margin:0;">${cr.riskScore ?? "—"}</p>
          <p style="font-size:10px;margin:0;opacity:0.8;">/10</p>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">

      <table style="width:100%;font-size:12px;color:#374151;">
        <tr>
          <td style="padding:4px 0;"><strong>Category:</strong></td>
          <td>${cr.category ?? "—"}</td>
          <td style="padding:4px 0;"><strong>Priority:</strong></td>
          <td>${cr.priority ?? "—"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Planned Start:</strong></td>
          <td>${cr.plannedStartDate ? new Date(cr.plannedStartDate).toLocaleString() : "TBD"}</td>
          <td style="padding:4px 0;"><strong>Planned End:</strong></td>
          <td>${cr.plannedEndDate ? new Date(cr.plannedEndDate).toLocaleString() : "TBD"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Affected Users:</strong></td>
          <td colspan="3">${cr.affectedUsers ?? "—"} ${cr.impactDescription ? "— " + cr.impactDescription : ""}</td>
        </tr>
      </table>
    </div>

    <!-- One-click vote buttons -->
    <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 12px;">Cast your vote with one click:</p>
    <table style="width:100%;border-collapse:separate;border-spacing:8px;">
      <tr>
        <td style="width:33%;">
          <a href="${approveUrl}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:14px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">✅ Approve</a>
        </td>
        <td style="width:33%;">
          <a href="${rejectUrl}" style="display:block;background:#dc2626;color:#fff;text-align:center;padding:14px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">❌ Reject</a>
        </td>
        <td style="width:33%;">
          <a href="${deferUrl}" style="display:block;background:#d97706;color:#fff;text-align:center;padding:14px;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">⏸ Defer</a>
        </td>
      </tr>
    </table>

    <p style="color:#9ca3af;font-size:11px;text-align:center;margin:16px 0 24px;">
      Or <a href="${reviewUrl}" style="color:#43bbd1;">view full CR details</a> before voting · Vote expires ${expireDate}
    </p>

    <!-- Implementation plan preview -->
    ${cr.implementationPlan ? `
    <div style="background:#f8fafc;border-left:3px solid #43bbd1;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:16px;">
      <p style="color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;margin:0 0 6px;">Implementation Plan</p>
      <p style="color:#374151;font-size:13px;margin:0;white-space:pre-wrap;">${cr.implementationPlan.slice(0, 400)}${cr.implementationPlan.length > 400 ? "…" : ""}</p>
    </div>` : ""}

    ${cr.backoutPlan ? `
    <div style="background:#fef2f2;border-left:3px solid #f87171;padding:12px 16px;border-radius:0 8px 8px 0;">
      <p style="color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;margin:0 0 6px;">Backout Plan</p>
      <p style="color:#374151;font-size:13px;margin:0;white-space:pre-wrap;">${cr.backoutPlan.slice(0, 300)}${cr.backoutPlan.length > 300 ? "…" : ""}</p>
    </div>` : ""}
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;">
      IT Change Management Portal · Expedite Consults · ITIL v4<br/>
      This approval request was sent to ${approver.email}
    </p>
  </div>
</div>
</body>
</html>`;
}
