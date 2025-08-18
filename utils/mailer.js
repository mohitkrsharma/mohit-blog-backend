// Create reusable transporter object using SMTP transport
function createTransporter() {
  if (!process.env.SMTP_HOST) {
    // Fallback: no SMTP configured, use a stub that logs emails
    return null;
  }
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (e) {
    console.warn('Nodemailer not installed; falling back to console logger for emails');
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

function buildPasswordResetTemplate({ name, email, resetUrl, expiresInMinutes = 15 }) {
  const appName = process.env.APP_NAME || 'Mohit Blogs';
  const year = new Date().getFullYear();
  return {
    subject: `${appName} • Reset your password`,
    html: `
    <div style="font-family:Arial,sans-serif;background:#f6f9fc;padding:24px;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table width="600" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
              <tr>
                <td style="padding:24px 28px;border-bottom:1px solid #eef2f7;">
                  <h1 style="margin:0;font-size:20px;color:#111827;">${appName}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 12px 0;font-size:16px;">Hi ${name || email},</p>
                  <p style="margin:0 0 16px 0;line-height:1.6;color:#334155;">
                    We received a request to reset your password. Click the button below to set a new password.
                  </p>
                  <div style="margin:24px 0;">
                    <a href="${resetUrl}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600;">Reset Password</a>
                  </div>
                  <p style="margin:0 0 8px 0;line-height:1.6;color:#475569;">This link will expire in ${expiresInMinutes} minutes.</p>
                  <p style="margin:0 0 8px 0;line-height:1.6;color:#64748b;">If you didn’t request this, you can safely ignore this email.</p>
                  <p style="margin:16px 0 0 0;line-height:1.6;color:#334155;">Thanks,<br/>The ${appName} Team</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px;">
                  <p style="margin:0;">&copy; ${year} ${appName}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>`
  };
}

async function sendMail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
  const transporter = createTransporter();

  if (!transporter) {
    // Log-only fallback
    console.log('[MAIL:LOG-ONLY]');
    console.log('To:', to);
    console.log('From:', from);
    console.log('Subject:', subject);
    console.log('HTML:\n', html);
    return { accepted: [to], rejected: [] };
  }

  try {
    console.log('[MAILER] Attempting to send email to:', to);
    const result = await transporter.sendMail({ from, to, subject, html });
    console.log('[MAILER] Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('[MAILER] Failed to send email:', error);
    throw error;
  }
}

async function sendPasswordResetEmail({ to, name, resetUrl, expiresInMinutes }) {
  const tpl = buildPasswordResetTemplate({ name, email: to, resetUrl, expiresInMinutes });
  return sendMail({ to, subject: tpl.subject, html: tpl.html });
}

module.exports = {
  sendPasswordResetEmail
};
