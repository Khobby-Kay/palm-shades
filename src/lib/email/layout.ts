import { siteConfig } from "@/lib/site";

interface LayoutOptions {
  preview?: string;
  heading: string;
  intro?: string;
  /** HTML for the main body content. */
  body: string;
  cta?: { label: string; href: string };
  footerNote?: string;
}

/**
 * Inline-styled, email-client-safe HTML layout. Palm Shades gold & ivory branded.
 * Render content into `body` as HTML strings (use simple tags, table-based
 * spacing if needed). Avoid external CSS, JS, or modern selectors.
 */
export function emailLayout(opts: LayoutOptions): string {
  const { preview = "", heading, intro, body, cta, footerNote } = opts;

  const ctaHtml = cta
    ? `
    <tr>
      <td style="padding: 24px 32px 8px;">
        <a href="${escape(cta.href)}" style="display:inline-block;background:#c5a572;color:#141414;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:600;letter-spacing:0.01em;font-size:14px;font-family:'Helvetica Neue',Arial,sans-serif;">
          ${escape(cta.label)}
        </a>
      </td>
    </tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escape(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:'Helvetica Neue',Arial,sans-serif;color:#141414;">
    <span style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;color:#faf7f2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escape(preview)}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(197,165,114,0.2);">
            <!-- Header -->
            <tr>
              <td style="padding:32px 32px 0;text-align:left;">
                <span style="display:inline-block;font-family:'Georgia','Times New Roman',serif;font-size:22px;font-weight:600;color:#1a1418;letter-spacing:-0.01em;">Palm Shades</span>
                <span style="display:inline-block;margin-left:6px;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#9a7b4f;vertical-align:middle;">Luxury Eyewear</span>
              </td>
            </tr>
            <tr><td style="padding:24px 32px 0;"><div style="border-top:1px solid #e8d5b5;"></div></td></tr>

            <!-- Heading -->
            <tr>
              <td style="padding:24px 32px 0;">
                <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:30px;line-height:1.15;color:#1a1418;letter-spacing:-0.01em;">
                  ${escape(heading)}
                </h1>
                ${
                  intro
                    ? `<p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#4a3c42;">${escape(intro)}</p>`
                    : ""
                }
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 32px 0;font-size:14px;line-height:1.6;color:#1a1418;">
                ${body}
              </td>
            </tr>

            ${ctaHtml}

            <!-- Footer -->
            <tr><td style="padding:32px 32px 0;"><div style="border-top:1px solid #fce7ef;"></div></td></tr>
            <tr>
              <td style="padding:18px 32px 32px;font-size:12px;color:#7a6a70;line-height:1.6;">
                ${
                  footerNote
                    ? `<p style="margin:0 0 12px;">${escape(footerNote)}</p>`
                    : ""
                }
                <p style="margin:0;">${escape(siteConfig.contact.address)}</p>
                <p style="margin:6px 0 0;">
                  <a href="${escape(siteConfig.url)}" style="color:#c87878;text-decoration:none;">${escape(siteConfig.url.replace(/^https?:\/\//, ""))}</a>
                  &nbsp;&middot;&nbsp;
                  <a href="mailto:${escape(siteConfig.contact.email)}" style="color:#c87878;text-decoration:none;">${escape(siteConfig.contact.email)}</a>
                </p>
                <p style="margin:14px 0 0;color:#b8a6ad;">&copy; ${new Date().getFullYear()} Palm Shades. Crafted with care.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
