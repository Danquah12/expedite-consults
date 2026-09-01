import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export const FROM_EMAIL = "Sphera <noreply@sphera.app>";

/**
 * Send a welcome email after sign-up.
 */
export async function sendWelcomeEmail(to: string, displayName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] Skipping sendWelcomeEmail — RESEND_API_KEY is not set.");
    return;
  }
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to Sphera 🌐",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Welcome to Sphera, ${displayName}!</h1>
        <p>Your account is ready. Start exploring, connecting, and creating.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/feed"
           style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Open Sphera
        </a>
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">
          You received this email because you signed up for Sphera.
        </p>
      </div>
    `,
  });
}

/**
 * Send a notification email for key events.
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  bodyHtml: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] Skipping sendNotificationEmail — RESEND_API_KEY is not set.");
    return;
  }
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        ${bodyHtml}
        <p style="color:#6b7280;font-size:12px;margin-top:32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/settings">Manage email preferences</a>
        </p>
      </div>
    `,
  });
}
