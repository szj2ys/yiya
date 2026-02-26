import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "YiYa <noreply@updates.yiya.app>";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Send an email via Resend. Gracefully no-ops when RESEND_API_KEY is missing.
 * Returns true if the email was sent, false otherwise.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured — skipping email send");
    return false;
  }

  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    return false;
  }
}
