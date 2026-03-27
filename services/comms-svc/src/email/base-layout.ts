// AIVO Learning branded email wrapper — Section 7B.4
// 600px max, 12px border-radius, purple gradient header, Inter font, WCAG AA
// Dark mode overrides, CAN-SPAM footer, UTM parameters on all CTAs

export interface BaseLayoutOptions {
  title: string;
  preheader?: string;
  body: string;
  unsubscribeUrl?: string;
}

export function baseLayout(options: BaseLayoutOptions): string {
  const { title, preheader, body, unsubscribeUrl } = options;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(title)}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>` : ""}
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0; mso-table-rspace: 0; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f8; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; }

    /* Container */
    .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }

    /* Header */
    .email-header { background: linear-gradient(135deg, #915ee3 0%, #8143e1 100%); padding: 32px 24px; text-align: center; }
    .email-header h1 { color: #FFFFFF; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
    .email-header .logo-text { color: #FFFFFF; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.03em; }

    /* Body */
    .email-body { padding: 32px 24px; color: #212529; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; }
    .email-body h2 { font-size: 20px; font-weight: 600; color: #212529; margin: 0 0 16px; }
    .email-body p { margin: 0 0 16px; }

    /* CTA Button */
    .cta-button { display: inline-block; background-color: #7C3AED; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; min-height: 44px; min-width: 44px; line-height: 1; text-align: center; }
    .cta-button:hover { background-color: #6D28D9; }
    .cta-wrapper { text-align: center; margin: 24px 0; }

    /* Footer */
    .email-footer { background-color: #f4f4f8; padding: 24px; text-align: center; font-size: 12px; line-height: 1.5; color: #6C757D; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; }
    .email-footer a { color: #7C3AED; text-decoration: none; }
    .email-footer .divider { border: none; border-top: 1px solid #E9ECEF; margin: 0 0 16px; }

    /* Utility */
    .text-muted { color: #6C757D; font-size: 14px; }
    .text-small { font-size: 14px; }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      body { background-color: #1A1A2E !important; }
      .email-container { background-color: #2D2D44 !important; }
      .email-body { color: #E0E0E0 !important; }
      .email-body h2 { color: #F0F0F0 !important; }
      .email-body p { color: #D0D0D0 !important; }
      .email-footer { background-color: #1A1A2E !important; color: #9E9E9E !important; }
      .email-footer .divider { border-top-color: #3D3D5C !important; }
      .text-muted { color: #9E9E9E !important; }
    }

    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .email-body { padding: 24px 16px !important; }
      .email-header { padding: 24px 16px !important; }
      .email-footer { padding: 20px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f8;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td class="email-header" style="background: linear-gradient(135deg, #915ee3 0%, #8143e1 100%); padding: 32px 24px; text-align: center;">
              <p class="logo-text" style="color: #FFFFFF; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.03em;">AIVO</p>
              <p style="color: rgba(255,255,255,0.9); font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 14px; margin: 0; font-weight: 500;">Learning Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-body" style="padding: 32px 24px; color: #212529; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color: #f4f4f8; padding: 24px; text-align: center; font-size: 12px; line-height: 1.5; color: #6C757D; font-family: 'Inter', 'Segoe UI', Arial, Helvetica, sans-serif;">
              <hr class="divider" style="border: none; border-top: 1px solid #E9ECEF; margin: 0 0 16px;">
              <p style="margin: 0 0 8px;">&copy; ${year} AIVO Learning. All rights reserved.</p>
              <p style="margin: 0 0 8px;">AIVO Learning Inc. &bull; 123 Education Way &bull; San Francisco, CA 94105</p>
              ${unsubscribeUrl ? `<p style="margin: 0;"><a href="${escapeHtml(unsubscribeUrl)}" style="color: #7C3AED; text-decoration: none;">Unsubscribe</a> &bull; <a href="\${APP_URL}/settings/notifications" style="color: #7C3AED; text-decoration: none;">Notification Preferences</a></p>` : `<p style="margin: 0;"><a href="\${APP_URL}/settings/notifications" style="color: #7C3AED; text-decoration: none;">Manage notification preferences</a></p>`}
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
  return `<div class="cta-wrapper" style="text-align: center; margin: 24px 0;">
  <a href="${escapeHtml(url)}" class="cta-button" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; min-height: 44px; line-height: 1;" role="button">${escapeHtml(text)}</a>
</div>`;
}

export function utmUrl(baseUrl: string, campaign: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}utm_source=aivo&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`;
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding: 8px 0; color: #6C757D; font-size: 14px; width: 140px; vertical-align: top;">${escapeHtml(label)}</td>
  <td style="padding: 8px 0; color: #212529; font-size: 14px; font-weight: 500;">${escapeHtml(value)}</td>
</tr>`;
}

export function infoTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
  ${rows}
</table>`;
}
