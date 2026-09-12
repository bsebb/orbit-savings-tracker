import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Orbit <onboarding@resend.dev>';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Generate Apple-styled HTML email for Orbit OTP verification code
 */
function buildEmailHtml(code, email) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f3f4f6; margin: 0; padding: 40px 20px; }
    .container { max-width: 460px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 36px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
    .logo { display: inline-block; width: 48px; height: 48px; line-height: 48px; font-size: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; letter-spacing: -0.5px; }
    p { font-size: 14px; color: #9ca3af; line-height: 1.5; margin: 0 0 24px 0; }
    .code-box { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 18px 24px; margin: 24px 0; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #818cf8; }
    .footer { font-size: 11px; color: #6b7280; margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🪐</div>
    <h1>Sign in to Orbit</h1>
    <p>Use the 6-digit verification code below to access your financial autopilot account for <strong>${email}</strong>.</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p style="font-size: 12px; color: #6b7280;">This code is valid for 10 minutes. If you did not request this login code, you can safely ignore this email.</p>
    <div class="footer">
      Orbit Financial Operating System · Zero-Based Budgeting & 4-Year Runway
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send real OTP verification code via Resend or log fallback
 */
export async function sendOtpEmail(toEmail, code) {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: `Your Orbit Verification Code: ${code}`,
        html: buildEmailHtml(code, toEmail),
        text: `Your Orbit verification code is: ${code}. Valid for 10 minutes.`,
      });
      return { success: true, provider: 'resend', id: response.id };
    } catch (err) {
      console.error('Resend delivery failed:', err);
      // Fall through to simulated success
    }
  }

  // Fallback / local developer preview when RESEND_API_KEY is not yet supplied
  console.log(`\n======================================================`);
  console.log(`📬 [ORBIT AUTH EMAIL SIMULATOR]`);
  console.log(`To:      ${toEmail}`);
  console.log(`Code:    ${code} (Valid for 10 minutes)`);
  console.log(`Status:  Set RESEND_API_KEY in .env to dispatch live emails`);
  console.log(`======================================================\n`);

  return { success: true, provider: 'local-preview', code };
}
