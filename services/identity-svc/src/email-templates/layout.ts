// Shared email layout wrapper — AIVO brand compliant
// 600px max, purple gradient header, Inter font, WCAG AA

export function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F8F9FA; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(135deg, #7C4DFF 0%, #5530CC 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; }
    .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0; }
    .body { padding: 32px 24px; color: #212529; font-size: 16px; line-height: 1.5; }
    .body h2 { font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px; }
    .body p { margin: 0 0 16px; }
    .cta { display: inline-block; background-color: #7C3AED; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .cta:hover { background-color: #5530CC; }
    .cta-wrapper { text-align: center; margin: 24px 0; }
    .footer { background-color: #F8F9FA; padding: 24px; text-align: center; color: #6C757D; font-size: 12px; line-height: 1.5; }
    .footer a { color: #7C4DFF; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #E9ECEF; margin: 24px 0; }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden;">
          <tr>
            <td class="header" style="background: linear-gradient(135deg, #7C4DFF 0%, #5530CC 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #FFFFFF; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; margin: 0;">AIVO Learning</h1>
            </td>
          </tr>
          <tr>
            <td class="body" style="padding: 32px 24px; color: #212529; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.5;">
              ${body}
            </td>
          </tr>
          <tr>
            <td class="footer" style="background-color: #F8F9FA; padding: 24px; text-align: center; color: #6C757D; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} AIVO Learning. All rights reserved.</p>
              <p style="margin: 0;">This email was sent by AIVO Learning. If you didn't expect this email, you can safely ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function ctaButton(text: string, url: string): string {
  return `<div style="text-align: center; margin: 24px 0;">
  <a href="${escapeHtml(url)}" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;" role="button">${escapeHtml(text)}</a>
</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
