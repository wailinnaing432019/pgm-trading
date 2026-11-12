/**
 * PGM Transactional & Broadcast Email Service
 *
 * Supports company email via standard SMTP (e.g., Gmail/Google Workspace with App Password),
 * with fallback to Resend API, and dev console logging when neither is configured.
 */

import nodemailer from "nodemailer";

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

export function getAdminLoginUrl(): string {
  return `${getSiteUrl()}/admin/login`;
}

export function getUnsubscribeUrl(email: string): string {
  return `${getSiteUrl()}/unsubscribe?email=${encodeURIComponent(email.trim().toLowerCase())}`;
}

export function getSmtpTransporter() {
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const host =
    process.env.SMTP_HOST?.trim() ||
    (user?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);

  if (!host || !user || !rawPass) {
    return null;
  }

  // Google App Passwords are commonly 16 chars with spaces (e.g. "abcd efgh ijkl mnop"). Strip spaces.
  const pass = rawPass.replace(/\s+/g, "");
  const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
  const secure =
    process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

type SendEmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  headers,
}: SendEmailPayload): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : [to];
  const transporter = getSmtpTransporter();

  // 1. Prioritize Company Mail via SMTP (e.g. Google Workspace / Gmail App Password)
  if (transporter && process.env.SMTP_USER) {
    const defaultFrom =
      from ||
      process.env.SMTP_FROM ||
      `Pacific Global Myanmar <${process.env.SMTP_USER}>`;

    try {
      await transporter.sendMail({
        from: defaultFrom,
        to: recipients,
        subject,
        html,
        text,
        replyTo: replyTo || process.env.TRADE_DESK_EMAIL || undefined,
        headers,
      });
      return true;
    } catch (err) {
      console.error("[email] SMTP send error:", err);
      // Fall through to try Resend if available
    }
  }

  // 2. Fallback to Resend API if configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const fromEmail =
      from ||
      process.env.ADMIN_EMAIL_FROM ||
      process.env.SMTP_FROM ||
      "PGM Trading <onboarding@resend.dev>";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipients,
          subject,
          html,
          text,
          reply_to: replyTo,
          headers,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn("[email] Resend API error:", res.status, errText);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[email] Resend send error:", err);
      return false;
    }
  }

  // 3. Local development fallback logger
  console.log(`\n============================================================`);
  console.log(`[EMAIL DISPATCH (DEV FALLBACK)] To: ${recipients.join(", ")}`);
  console.log(`[EMAIL DISPATCH (DEV FALLBACK)] Subject: ${subject}`);
  if (headers) console.log(`[EMAIL DISPATCH (DEV FALLBACK)] Headers:`, headers);
  console.log(`------------------------------------------------------------`);
  console.log(text);
  console.log(`============================================================\n`);
  return true;
}

// ---------------------------------------------------------------------------
// Admin Account Notifications
// ---------------------------------------------------------------------------

export async function sendAdminCreatedNotification({
  admin,
  createdBy,
}: {
  admin: { name: string; email: string; isActive: boolean };
  createdBy: { name: string; email: string };
}) {
  const loginUrl = getAdminLoginUrl();
  const subject = `Welcome to PGM Admin — Your Account Has Been Created`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f2; margin: 0; padding: 30px 15px; color: #111f17;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ebdfc9; overflow: hidden; box-shadow: 0 4px 20px rgba(17,31,23,0.06);">
    <tr>
      <td style="background-color: #111f17; padding: 28px 32px; text-align: left;">
        <h1 style="color: #faf8f2; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em;">
          PGM Trading CMS
        </h1>
        <p style="color: #e9c65f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">
          Pacific Global Myanmar
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 20px; color: #111f17; margin: 0 0 12px 0;">Welcome, ${admin.name}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #30543d; margin: 0 0 20px 0;">
          An administrator account has been created for you on the Pacific Global Myanmar Management Portal.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fbf9f4; border: 1px solid #ebdfc9; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 16px 20px;">
              <table width="100%" style="font-size: 13px; color: #284332;">
                <tr>
                  <td style="padding: 6px 0; color: #744734; width: 120px;"><strong>Created By:</strong></td>
                  <td style="padding: 6px 0;"><strong>${createdBy.name}</strong> (${createdBy.email})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #744734;"><strong>Login Email:</strong></td>
                  <td style="padding: 6px 0;"><strong>${admin.email}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #744734;"><strong>Role:</strong></td>
                  <td style="padding: 6px 0;">Admin</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #744734;"><strong>Status:</strong></td>
                  <td style="padding: 6px 0;"><span style="color: ${admin.isActive ? "#166534" : "#991b1b"}; font-weight: 600;">${admin.isActive ? "Active" : "Inactive"}</span></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="background-color: #30543d; color: #faf8f2; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
                Log In to PGM Admin &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 12px; color: #5f3b2e; text-align: center; margin: 0 0 16px 0;">
          Direct login link: <a href="${loginUrl}" style="color: #a87320;">${loginUrl}</a>
        </p>

        <p style="font-size: 12px; color: #8f5b3d; line-height: 1.5; border-top: 1px solid #ebdfc9; padding-top: 16px; margin: 24px 0 0 0;">
          Security Notice: If you were not expecting this account, please immediately reach out to <strong>${createdBy.email}</strong>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to PGM Admin, ${admin.name}!

Your administrator account has been created on the Pacific Global Myanmar Management Portal.

ACCOUNT DETAILS:
- Created By: ${createdBy.name} (${createdBy.email})
- Login Email: ${admin.email}
- Role: Admin
- Status: ${admin.isActive ? "Active" : "Inactive"}

LOG IN HERE:
${loginUrl}

Security Notice: If you were not expecting this account, please contact ${createdBy.email}.
  `.trim();

  await sendEmail({ to: admin.email, subject, html, text });
}

export type AdminAccountChanges = {
  oldName: string;
  newName: string;
  oldEmail: string;
  newEmail: string;
  oldIsActive: boolean;
  newIsActive: boolean;
  passwordChanged: boolean;
};

export async function sendAdminUpdatedNotification({
  changes,
  updatedBy,
}: {
  changes: AdminAccountChanges;
  updatedBy: { name: string; email: string };
}) {
  const loginUrl = getAdminLoginUrl();
  const emailChanged = changes.oldEmail.trim().toLowerCase() !== changes.newEmail.trim().toLowerCase();
  const nameChanged = changes.oldName.trim() !== changes.newName.trim();
  const statusChanged = changes.oldIsActive !== changes.newIsActive;

  const changeItems: string[] = [];
  if (emailChanged) {
    changeItems.push(`Email: Previous: <strong>${changes.oldEmail}</strong> &rarr; New: <strong>${changes.newEmail}</strong>`);
  }
  if (nameChanged) {
    changeItems.push(`Name: Previous: <strong>${changes.oldName}</strong> &rarr; New: <strong>${changes.newName}</strong>`);
  }
  if (statusChanged) {
    const oldStatus = changes.oldIsActive ? "Active" : "Inactive";
    const newStatus = changes.newIsActive ? "Active" : "Inactive";
    changeItems.push(`Status: Previous: <strong>${oldStatus}</strong> &rarr; New: <strong>${newStatus}</strong>`);
  }
  if (changes.passwordChanged) {
    changeItems.push(`Password: <strong>Account password was reset/updated by administrator</strong>`);
  }

  // 1. If email changed, send security notice to OLD address
  if (emailChanged) {
    const oldSubject = `Important: Your PGM Admin Email Was Changed`;
    const oldHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${oldSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f2; margin: 0; padding: 30px 15px; color: #111f17;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ebdfc9; overflow: hidden; box-shadow: 0 4px 20px rgba(17,31,23,0.06);">
    <tr>
      <td style="background-color: #111f17; padding: 28px 32px; text-align: left;">
        <h1 style="color: #faf8f2; margin: 0; font-size: 20px; font-weight: 600;">PGM Trading Security Alert</h1>
        <p style="color: #e9c65f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">Admin Account Update</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 18px; color: #991b1b; margin: 0 0 12px 0;">Notice of Email Address Change</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #284332; margin: 0 0 20px 0;">
          The email address associated with your PGM Admin account has been modified.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px; font-size: 13px; color: #7f1d1d; line-height: 1.7;">
              <div><strong>Updated By:</strong> ${updatedBy.name} (${updatedBy.email})</div>
              <div><strong>Old Email:</strong> <strong>${changes.oldEmail}</strong></div>
              <div><strong>New Email:</strong> <strong>${changes.newEmail}</strong></div>
              <div><strong>Date & Time:</strong> ${new Date().toUTCString()}</div>
            </td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">
          You can <strong>no longer log in</strong> using this email address (${changes.oldEmail}). Please use the new email address <strong>${changes.newEmail}</strong> going forward.
        </p>

        <p style="font-size: 12px; color: #991b1b; border-top: 1px solid #ebdfc9; padding-top: 16px; margin-top: 24px;">
          Security Alert: If you did not authorize this change, please immediately contact your administrator at <strong>${updatedBy.email}</strong>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const oldText = `
SECURITY ALERT: PGM Admin Email Was Changed

The email address associated with your PGM Admin account has been changed:
- Updated By: ${updatedBy.name} (${updatedBy.email})
- Old Email: ${changes.oldEmail}
- New Email: ${changes.newEmail}
- Date: ${new Date().toUTCString()}

You can no longer log in using ${changes.oldEmail}. Use ${changes.newEmail} to log in.
If you did not authorize this change, contact ${updatedBy.email} immediately.
    `.trim();

    await sendEmail({ to: changes.oldEmail, subject: oldSubject, html: oldHtml, text: oldText });
  }

  // 2. Send update notification to the new/current address
  const activeSubject = emailChanged
    ? `Your PGM Admin Account Email Has Been Changed`
    : `Your PGM Admin Account Details Were Updated`;

  const activeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${activeSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f2; margin: 0; padding: 30px 15px; color: #111f17;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ebdfc9; overflow: hidden; box-shadow: 0 4px 20px rgba(17,31,23,0.06);">
    <tr>
      <td style="background-color: #111f17; padding: 28px 32px; text-align: left;">
        <h1 style="color: #faf8f2; margin: 0; font-size: 20px; font-weight: 600;">PGM Trading CMS</h1>
        <p style="color: #e9c65f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">Admin Account Notification</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 18px; color: #111f17; margin: 0 0 12px 0;">Hello ${changes.newName},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #30543d; margin: 0 0 20px 0;">
          Your administrator account details on the Pacific Global Myanmar Management Portal have been updated.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fbf9f4; border: 1px solid #ebdfc9; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px; font-size: 13px; color: #284332;">
              <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #ebdfc9;">
                <span style="color: #744734;"><strong>Updated By:</strong></span> <strong>${updatedBy.name}</strong> (${updatedBy.email})
              </div>
              <div style="margin-bottom: 6px; color: #744734;"><strong>Recorded Changes:</strong></div>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; line-height: 1.8;">
                ${changeItems.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </td>
          </tr>
        </table>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="${loginUrl}" target="_blank" style="background-color: #30543d; color: #faf8f2; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
                Log In to PGM Admin &rarr;
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 12px; color: #5f3b2e; text-align: center; margin: 0 0 16px 0;">
          Login URL: <a href="${loginUrl}" style="color: #a87320;">${loginUrl}</a>
        </p>

        <p style="font-size: 12px; color: #8f5b3d; line-height: 1.5; border-top: 1px solid #ebdfc9; padding-top: 16px; margin: 24px 0 0 0;">
          If you have any questions regarding these changes, please contact <strong>${updatedBy.email}</strong>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const plainChanges = [
    emailChanged ? `Email changed: Previous: ${changes.oldEmail} -> New: ${changes.newEmail}` : null,
    nameChanged ? `Name changed: Previous: ${changes.oldName} -> New: ${changes.newName}` : null,
    statusChanged ? `Status changed: Previous: ${changes.oldIsActive ? "Active" : "Inactive"} -> New: ${changes.newIsActive ? "Active" : "Inactive"}` : null,
    changes.passwordChanged ? `Password: Password was reset/updated by administrator` : null,
  ]
    .filter(Boolean)
    .join("\n- ");

  const activeText = `
Hello ${changes.newName},

Your administrator account details on the Pacific Global Myanmar Management Portal have been updated.

UPDATED BY:
${updatedBy.name} (${updatedBy.email})

CHANGES APPLIED:
- ${plainChanges}

LOG IN HERE:
${loginUrl}

If you have questions regarding these changes, contact ${updatedBy.email}.
  `.trim();

  await sendEmail({ to: changes.newEmail, subject: activeSubject, html: activeHtml, text: activeText });
}

// ---------------------------------------------------------------------------
// Newsletter Welcome & Broadcast Notifications
// ---------------------------------------------------------------------------

export async function sendNewsletterWelcomeEmail(email: string) {
  const siteUrl = getSiteUrl();
  const unsubscribeUrl = getUnsubscribeUrl(email);
  const subject = "Welcome to Pacific Global Myanmar Market Insights";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f2; margin: 0; padding: 30px 15px; color: #111f17;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ebdfc9; overflow: hidden; box-shadow: 0 4px 20px rgba(17,31,23,0.06);">
    <tr>
      <td style="background-color: #111f17; padding: 28px 32px; text-align: left;">
        <h1 style="color: #faf8f2; margin: 0; font-size: 20px; font-weight: 600;">Pacific Global Myanmar</h1>
        <p style="color: #e9c65f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">Agricultural Export & Commodity Trading</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 20px; color: #111f17; margin: 0 0 12px 0;">Subscription Confirmed</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #30543d; margin: 0 0 16px 0;">
          Thank you for subscribing to PGM Trade Insights. You will receive periodic harvest updates, FOB commodity export prices, and agricultural seasonal reports directly from Yangon.
        </p>

        <div style="background-color: #fbf9f4; border: 1px solid #ebdfc9; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #111f17;">What to expect:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #284332; line-height: 1.7;">
            <li>Current crop season availability (Sesame, Beans & Pulses, Spices).</li>
            <li>Export quality specifications and FOB Yangon pricing benchmarks.</li>
            <li>New product arrivals and direct trade inquiries.</li>
          </ul>
        </div>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="${siteUrl}/products" target="_blank" style="background-color: #30543d; color: #faf8f2; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
                Explore Current Export Catalog &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Anti-Spam Footer & Unsubscribe -->
        <div style="font-size: 12px; color: #744734; border-top: 1px solid #ebdfc9; padding-top: 20px; margin-top: 32px; text-align: center; line-height: 1.6;">
          <p style="margin: 0 0 6px 0;">
            You are receiving this email because you subscribed on <a href="${siteUrl}" style="color: #30543d;">${siteUrl}</a>.
          </p>
          <p style="margin: 0;">
            If you no longer want to receive these updates, you can
            <a href="${unsubscribeUrl}" style="color: #991b1b; text-decoration: underline; font-weight: 600;">unsubscribe at any time</a>.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Welcome to Pacific Global Myanmar Market Insights!

Thank you for subscribing. You will receive periodic harvest updates, export prices, and agricultural seasonal reports.

Explore our products catalog: ${siteUrl}/products

If you no longer wish to receive these updates, you can unsubscribe anytime:
${unsubscribeUrl}
  `.trim();

  await sendEmail({
    to: email,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export type BroadcastProductItem = {
  id: string;
  title: string;
  summary: string;
  price?: number | null;
  unit?: string | null;
  currency?: string | null;
  image?: string | null;
};

export async function sendNewsletterBroadcast({
  subject,
  headline,
  message,
  products = [],
  recipients,
}: {
  subject: string;
  headline: string;
  message: string;
  products?: BroadcastProductItem[];
  recipients: string[];
}): Promise<{ total: number; sent: number; failed: number }> {
  const siteUrl = getSiteUrl();
  let sentCount = 0;
  let failedCount = 0;

  // Render product showcase HTML block
  const productsHtml =
    products.length > 0
      ? `
      <div style="margin: 28px 0 16px 0;">
        <h3 style="font-size: 16px; color: #111f17; margin: 0 0 16px 0; border-bottom: 1px solid #ebdfc9; padding-bottom: 8px;">
          Featured Export Products
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${products
            .map((p) => {
              const productUrl = `${siteUrl}/products/${p.id}`;
              const priceDisplay =
                p.price !== undefined && p.price !== null
                  ? `${p.currency || "USD"} ${p.price}${p.unit ? ` / ${p.unit}` : ""}`
                  : null;

              return `
              <tr>
                <td style="padding: 14px 16px; background-color: #fbf9f4; border: 1px solid #ebdfc9; border-radius: 12px; margin-bottom: 12px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      ${
                        p.image
                          ? `<td width="80" valign="top" style="padding-right: 14px;">
                              <img src="${p.image}" alt="${p.title}" width="80" height="80" style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #ebdfc9;" />
                            </td>`
                          : ""
                      }
                      <td valign="top">
                        <h4 style="margin: 0 0 4px 0; font-size: 15px; color: #111f17;">
                          <a href="${productUrl}" style="color: #111f17; text-decoration: none;">${p.title}</a>
                        </h4>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #30543d; line-height: 1.4;">${p.summary}</p>
                        ${
                          priceDisplay
                            ? `<div style="font-size: 13px; font-weight: 600; color: #166534; margin-bottom: 8px;">${priceDisplay}</div>`
                            : ""
                        }
                        <div>
                          <a href="${productUrl}" target="_blank" style="display: inline-block; font-size: 12px; font-weight: 600; color: #faf8f2; background-color: #30543d; padding: 6px 14px; border-radius: 20px; text-decoration: none;">
                            View Specifications &rarr;
                          </a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td height="10"></td></tr>
              `;
            })
            .join("")}
        </table>
      </div>
      `
      : "";

  // Plaintext products summary
  const productsText = products.length > 0
    ? `\nFEATURED PRODUCTS:\n` +
      products
        .map((p) => {
          const price = p.price ? ` (${p.currency || "USD"} ${p.price}${p.unit ? ` / ${p.unit}` : ""})` : "";
          return `- ${p.title}${price}: ${siteUrl}/products/${p.id}\n  ${p.summary}`;
        })
        .join("\n\n")
    : "";

  // Send to subscribers with a slight throttle (120ms) to respect SMTP rate limits
  for (const recipient of recipients) {
    const unsubUrl = getUnsubscribeUrl(recipient);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf8f2; margin: 0; padding: 30px 15px; color: #111f17;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ebdfc9; overflow: hidden; box-shadow: 0 4px 20px rgba(17,31,23,0.06);">
    <tr>
      <td style="background-color: #111f17; padding: 24px 32px; text-align: left;">
        <h1 style="color: #faf8f2; margin: 0; font-size: 20px; font-weight: 600;">Pacific Global Myanmar</h1>
        <p style="color: #e9c65f; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">Agricultural Trade & Export Updates</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 20px; color: #111f17; margin: 0 0 14px 0; line-height: 1.3;">${headline}</h2>
        <div style="font-size: 14px; line-height: 1.7; color: #284332; white-space: pre-line; margin-bottom: 24px;">
          ${message}
        </div>

        ${productsHtml}

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 20px 0;">
          <tr>
            <td align="center">
              <a href="${siteUrl}/products" target="_blank" style="background-color: #30543d; color: #faf8f2; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">
                Browse Complete Export Catalog &rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Mandatory One-Click Unsubscribe & Compliance Footer -->
        <div style="font-size: 12px; color: #744734; border-top: 1px solid #ebdfc9; padding-top: 20px; margin-top: 32px; text-align: center; line-height: 1.6;">
          <p style="margin: 0 0 6px 0;">
            Pacific Global Myanmar Co., Ltd. &middot; Yangon, Myanmar
          </p>
          <p style="margin: 0 0 6px 0;">
            You are receiving this update because you subscribed to PGM trade updates.
          </p>
          <p style="margin: 0;">
            Don't want to receive these emails?
            <a href="${unsubUrl}" style="color: #991b1b; text-decoration: underline; font-weight: 600;">Unsubscribe with one click</a>.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `
${headline}
============================================================
${message}
${productsText}

View complete catalog: ${siteUrl}/products

------------------------------------------------------------
Pacific Global Myanmar Co., Ltd. · Yangon, Myanmar
You subscribed to PGM trade updates.
Unsubscribe link: ${unsubUrl}
    `.trim();

    try {
      const ok = await sendEmail({
        to: recipient,
        subject,
        html: emailHtml,
        text: emailText,
        headers: {
          "List-Unsubscribe": `<${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (ok) sentCount++;
      else failedCount++;
    } catch {
      failedCount++;
    }

    // Rate-limit pause (120ms)
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  return { total: recipients.length, sent: sentCount, failed: failedCount };
}
