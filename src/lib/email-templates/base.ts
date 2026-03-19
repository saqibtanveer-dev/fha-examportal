/**
 * Base email template with school branding.
 * Wraps all email content in a consistent layout.
 */

type BaseTemplateParams = {
  content: string;
  schoolName?: string;
  schoolLogo?: string;
  primaryColor?: string;
  footerText?: string;
};

export function baseEmailTemplate({
  content,
  schoolName = 'Faith Horizon Portal',
  primaryColor = '#2563eb',
  footerText,
}: BaseTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schoolName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%; background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${schoolName}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                ${footerText ?? `&copy; ${new Date().getFullYear()} ${schoolName}. All rights reserved.`}
              </p>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">
                This is an automated email. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(text: string, url: string, color = '#2563eb'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="border-radius: 6px; background-color: ${color};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

export function emailInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${value}</td>
    </tr>`;
}

export function emailInfoTable(rows: { label: string; value: string }[]): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0;">
      ${rows.map((r) => emailInfoRow(r.label, r.value)).join('')}
    </table>`;
}
