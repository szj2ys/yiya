const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

type StreakReminderParams = {
  streakCount: number;
  userId: string;
};

export function buildStreakReminderSubject(streakCount: number): string {
  return `Your ${streakCount}-day streak expires at midnight!`;
}

export function buildStreakReminderHtml({ streakCount, userId }: StreakReminderParams): string {
  const learnUrl = `${APP_URL}/learn`;
  const unsubscribeUrl = `${APP_URL}/api/unsubscribe?userId=${encodeURIComponent(userId)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="padding:40px 32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">&#x1F525;</div>
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
            Your ${streakCount}-day streak expires at midnight!
          </h1>
          <p style="margin:0 0 32px;font-size:16px;color:#6b7280;line-height:1.5;">
            Don't let your hard work go to waste. Just one quick lesson keeps your streak alive.
          </p>
          <a href="${learnUrl}" style="display:inline-block;padding:14px 40px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;">
            Continue Learning
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
            <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a> from streak reminders
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
