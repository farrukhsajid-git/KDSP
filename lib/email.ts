import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { RSVPData } from './db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;
let resend: Resend | null = null;

function getResend() {
  if (resend) {
    return resend;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    resend = new Resend(apiKey);
    return resend;
  }

  return null;
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');

  if (!emailUser || !emailPassword) {
    console.warn(
      'SMTP credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to enable SMTP sending.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try Resend first (preferred for cloud deployments)
  const resendClient = getResend();
  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: 'KDSP Events <kdspdmv@gmail.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error('Resend error:', error);
        // Fall back to SMTP
      } else {
        console.log('Email sent via Resend:', data?.id);
        return true;
      }
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      // Fall back to SMTP
    }
  }

  // Fall back to SMTP (Gmail)
  const transporter = getTransporter();

  if (!transporter) {
    console.log('Email not sent - no email service configured (tried Resend and SMTP)');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"KDSP Events" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent via SMTP:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return false;
  }
}

export function generateConfirmationEmail(
  rsvpData: RSVPData,
  referralId: string
): { html: string; text: string; subject: string } {
  const { full_name, rsvp_status, number_of_guests } = rsvpData;

  const subject =
    rsvp_status === 'Yes'
      ? `RSVP Confirmed: KDSP Virginia Chapter Launch - January 18, 2026`
      : rsvp_status === 'Maybe'
      ? `RSVP Received: KDSP Virginia Chapter Launch - January 18, 2026`
      : `Thank You for Your Interest - KDSP Virginia Chapter`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KDSP RSVP Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">KDSP Virginia Chapter</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Supporting Children on the Autism Spectrum</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                ${rsvp_status === 'Yes' ? `Thank You, ${full_name}!` : `Hello ${full_name},`}
              </h2>

              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                ${
                  rsvp_status === 'Yes'
                    ? `We're thrilled to confirm your attendance at the KDSP Virginia Chapter Launch event! Join us for an inspiring evening to learn about KDSP's work supporting children on the autism spectrum and their families.`
                    : rsvp_status === 'Maybe'
                    ? `Thank you for your response. We've received your interest and hope you'll be able to join us for the KDSP Virginia Chapter Launch event.`
                    : `Thank you for your interest in KDSP Virginia Chapter. We'll keep you updated about our work and future events!`
                }
              </p>

              ${rsvp_status === 'Yes' ? `
              <!-- Event Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #1f2937; font-weight: 600; width: 120px;">Event:</td>
                        <td style="color: #4b5563;">KDSP Virginia Chapter Launch</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Date:</td>
                        <td style="color: #4b5563;">Sunday, January 18, 2026</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Time:</td>
                        <td style="color: #4b5563;">6:00 PM - 9:00 PM</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Venue:</td>
                        <td style="color: #4b5563;">To Be Announced (Northern Virginia area)</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Guests:</td>
                        <td style="color: #4b5563;">${number_of_guests}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Confirmation ID -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Your Confirmation ID</h3>
                    <p style="color: #6b21a8; margin: 0 0 10px 0; font-size: 14px;">Please save this for your records.</p>
                    <div style="background-color: #ffffff; border: 2px solid #c084fc; border-radius: 4px; padding: 12px; text-align: center; font-family: monospace; font-size: 20px; font-weight: 700; color: #7c3aed;">
                      ${referralId}
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${
                rsvp_status === 'Yes'
                  ? `
              <!-- Important Information -->
              <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px;">Important Information</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Event details including venue location will be sent via email closer to the date</li>
                <li>Refreshments will be provided</li>
                <li>This is an introductory evening to learn about KDSP's mission and the Virginia Chapter</li>
                <li>Opportunities to get involved and support the cause will be discussed</li>
              </ul>
              `
                  : ''
              }

              <!-- What's Next -->
              <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px;">What's Next?</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${
                  rsvp_status === 'Yes'
                    ? `
                <li>Add the event to your calendar</li>
                <li>Save your confirmation ID for reference</li>
                <li>We'll send venue details closer to the date</li>
                <li>Visit www.kdsp.org.pk to learn more about KDSP's work</li>
                `
                    : `
                <li>We'll keep you updated on KDSP Virginia Chapter activities</li>
                <li>Visit www.kdsp.org.pk to learn more about our mission</li>
                `
                }
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
                Questions? Contact us at
                <a href="mailto:kdspdmv@gmail.com" style="color: #60a5fa; text-decoration: none;">kdspdmv@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
KDSP Virginia Chapter - RSVP Confirmation

${rsvp_status === 'Yes' ? `Thank You, ${full_name}!` : `Hello ${full_name},`}

${
  rsvp_status === 'Yes'
    ? `We're thrilled to confirm your attendance at the KDSP Virginia Chapter Launch event! Join us for an inspiring evening to learn about KDSP's work supporting children on the autism spectrum and their families.`
    : rsvp_status === 'Maybe'
    ? `Thank you for your response. We've received your interest and hope you'll be able to join us for the KDSP Virginia Chapter Launch event.`
    : `Thank you for your interest in KDSP Virginia Chapter. We'll keep you updated about our work and future events!`
}

${rsvp_status === 'Yes' ? `
EVENT DETAILS
Event: KDSP Virginia Chapter Launch
Date: Sunday, January 18, 2026
Time: 6:00 PM - 9:00 PM
Venue: To Be Announced (Northern Virginia area)
Number of Guests: ${number_of_guests}

YOUR CONFIRMATION ID
${referralId}
Please save this for your records.
` : ''}

${
  rsvp_status === 'Yes'
    ? `
IMPORTANT INFORMATION
- Event details including venue location will be sent via email closer to the date
- Refreshments will be provided
- This is an introductory evening to learn about KDSP's mission and the Virginia Chapter
- Opportunities to get involved and support the cause will be discussed

WHAT'S NEXT?
- Add the event to your calendar
- Save your confirmation ID for reference
- We'll send venue details closer to the date
- Visit www.kdsp.org.pk to learn more about KDSP's work
`
    : `
WHAT'S NEXT?
- We'll keep you updated on KDSP Virginia Chapter activities
- Visit www.kdsp.org.pk to learn more about our mission
`
}

Questions? Contact us at kdspdmv@gmail.com
`;

  return { html, text, subject };
}

export async function sendRSVPConfirmation(
  rsvpData: RSVPData,
  referralId: string
): Promise<boolean> {
  const { html, text, subject } = generateConfirmationEmail(rsvpData, referralId);

  return await sendEmail({
    to: rsvpData.email,
    subject,
    html,
    text,
  });
}
