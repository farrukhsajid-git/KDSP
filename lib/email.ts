import nodemailer from 'nodemailer';
import { RSVPData } from './db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

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
      'Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email sending.'
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
  const transporter = getTransporter();

  if (!transporter) {
    console.log('Email not sent - transporter not configured');
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

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateConfirmationEmail(
  rsvpData: RSVPData,
  referralId: string
): { html: string; text: string; subject: string } {
  const { full_name, rsvp_status, number_of_guests, profession_organization, interest_types } = rsvpData;

  const subject =
    rsvp_status === 'Yes'
      ? `RSVP Confirmed: KDSP Annual Gala - December 14, 2025`
      : rsvp_status === 'Maybe'
      ? `RSVP Received: KDSP Annual Gala - December 14, 2025`
      : `Thank You for Your Response - KDSP Annual Gala`;

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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">KDSP Events</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Annual Gala Celebration</p>
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
                    ? `We're thrilled to confirm your attendance at the KDSP Annual Gala Celebration! This promises to be an unforgettable evening.`
                    : rsvp_status === 'Maybe'
                    ? `Thank you for your response. We've received your RSVP and hope you'll be able to join us for the KDSP Annual Gala Celebration.`
                    : `Thank you for letting us know you won't be able to attend. We'll miss you at the event!`
                }
              </p>

              <!-- Event Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #1f2937; font-weight: 600; width: 120px;">Event:</td>
                        <td style="color: #4b5563;">Annual Gala Celebration</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Date:</td>
                        <td style="color: #4b5563;">Saturday, December 14, 2025</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Time:</td>
                        <td style="color: #4b5563;">6:00 PM - 11:00 PM</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; font-weight: 600;">Venue:</td>
                        <td style="color: #4b5563;">Grand Ballroom, Convention Center</td>
                      </tr>
                      ${
                        rsvp_status === 'Yes'
                          ? `<tr>
                        <td style="color: #1f2937; font-weight: 600;">Guests:</td>
                        <td style="color: #4b5563;">${number_of_guests}</td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Referral ID -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 4px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">Your Referral ID</h3>
                    <p style="color: #6b21a8; margin: 0 0 10px 0; font-size: 14px;">Share this with friends to track your referrals!</p>
                    <div style="background-color: #ffffff; border: 2px solid #c084fc; border-radius: 4px; padding: 12px; text-align: center; font-family: monospace; font-size: 20px; font-weight: 700; color: #7c3aed;">
                      ${referralId}
                    </div>
                  </td>
                </tr>
              </table>

              ${
                rsvp_status === 'Yes'
                  ? `
              <!-- Important Information -->
              <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px;">Important Information</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Dress code: Formal attire</li>
                <li>Complimentary valet parking available</li>
                <li>Dinner and drinks will be provided</li>
                <li>Please arrive by 6:15 PM for check-in</li>
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
                <li>Share your referral ID with friends and family</li>
                <li>Follow us on social media for updates</li>
                `
                    : `
                <li>We'll keep you updated on KDSP activities</li>
                <li>Follow us on social media</li>
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
                <a href="mailto:events@kdsp.com" style="color: #60a5fa; text-decoration: none;">events@kdsp.com</a>
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                &copy; 2025 KDSP Events. All rights reserved.
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
KDSP RSVP Confirmation

${rsvp_status === 'Yes' ? `Thank You, ${full_name}!` : `Hello ${full_name},`}

${
  rsvp_status === 'Yes'
    ? `We're thrilled to confirm your attendance at the KDSP Annual Gala Celebration!`
    : rsvp_status === 'Maybe'
    ? `Thank you for your response. We've received your RSVP and hope you'll be able to join us.`
    : `Thank you for letting us know you won't be able to attend. We'll miss you!`
}

EVENT DETAILS
Event: Annual Gala Celebration
Date: Saturday, December 14, 2025
Time: 6:00 PM - 11:00 PM
Venue: Grand Ballroom, Convention Center
${rsvp_status === 'Yes' ? `Number of Guests: ${number_of_guests}` : ''}

YOUR REFERRAL ID
${referralId}
Share this with friends to track your referrals!

${
  rsvp_status === 'Yes'
    ? `
IMPORTANT INFORMATION
- Dress code: Formal attire
- Complimentary valet parking available
- Dinner and drinks will be provided
- Please arrive by 6:15 PM for check-in
`
    : ''
}

Questions? Contact us at events@kdsp.com

© 2025 KDSP Events. All rights reserved.
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
