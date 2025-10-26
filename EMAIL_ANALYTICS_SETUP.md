# Email & Analytics Setup Guide

This guide explains how to set up email confirmations and analytics for the KDSP RSVP Portal.

## Features Added

### 1. Thank You Page
- Personalized thank you message with user's name
- Event details summary
- Referral ID display
- Download calendar invite (.ics) button
- Download "Meet KDSP Quick Facts" PDF button
- Automatic redirect after form submission

### 2. Email Confirmations
- Automatic confirmation emails sent after RSVP submission
- Beautiful HTML email templates
- Different messages based on RSVP status (Yes/No/Maybe)
- Includes event details and referral ID
- Works with Gmail, SendGrid, Brevo, or any SMTP service

### 3. Analytics Integration
- Plausible Analytics support (privacy-friendly)
- Easy to switch to Google Analytics if needed
- Configurable via environment variables

## Email Setup Instructions

### Option 1: Gmail (Recommended for Testing)

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Create an app password for "Mail"
   - Copy the 16-character password

3. Update your `.env` file:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Option 2: SendGrid

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API Key in SendGrid dashboard
3. Update your `.env` file:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Option 3: Brevo (formerly Sendinblue)

1. Sign up at https://brevo.com (free tier: 300 emails/day)
2. Get your SMTP credentials from Settings > SMTP & API
3. Update your `.env` file:
```bash
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-brevo-email@example.com
EMAIL_PASSWORD=your-smtp-key
```

## Analytics Setup Instructions

### Plausible Analytics (Recommended - Privacy-Friendly)

1. Sign up at https://plausible.io
2. Add your domain/site
3. Update your `.env` file:
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

That's it! Plausible automatically tracks page views without cookies.

### Google Analytics (Alternative)

To use Google Analytics instead:

1. Get your GA4 Measurement ID from Google Analytics
2. Update `app/layout.tsx` to use the Google Analytics script instead of Plausible
3. Add your measurement ID to environment variables

## Testing Email Functionality

### 1. Local Testing Without Real Emails

If you don't configure email credentials, the system will:
- Still accept RSVPs successfully
- Log "Email not sent - transporter not configured" to console
- NOT fail the RSVP submission

This allows you to develop and test without setting up email.

### 2. Testing with Real Emails

1. Configure your email settings in `.env`
2. Submit a test RSVP
3. Check the server console for email logs
4. Check your email inbox for the confirmation

### 3. Email Preview

The confirmation email includes:
- Personalized greeting
- RSVP status confirmation
- Event details in a styled box
- Referral ID in a highlighted section
- Important information (for "Yes" responses)
- Next steps checklist

## File Structure

```
app/
├── api/
│   ├── calendar/
│   │   └── route.ts          # .ics file generation
│   └── rsvp/
│       └── route.ts           # Updated with email sending
├── thank-you/
│   └── page.tsx               # Thank you page
└── layout.tsx                 # Updated with analytics

lib/
└── email.ts                   # Email sending utilities

public/
└── kdsp-quick-facts.pdf       # Placeholder PDF (replace with real PDF)

components/
└── RSVPForm.tsx               # Updated with redirect logic
```

## Important Notes

### Email Best Practices

1. **Gmail Limits**: Gmail has sending limits (~500 emails/day). For production, use SendGrid or Brevo.

2. **Spam Filters**:
   - Use a verified sender domain
   - Include an unsubscribe link in production
   - Don't send too many emails at once

3. **Error Handling**: Email sending happens in the background and won't fail the RSVP submission if it fails.

### PDF Customization

Replace `/public/kdsp-quick-facts.pdf` with your actual PDF file. The placeholder is a basic PDF that should be replaced with:
- Professional design
- KDSP mission and values
- Impact statistics
- Contact information
- Social media links

### Calendar Invite Details

The `.ics` file includes:
- Event title: "KDSP Annual Gala Celebration"
- Date: December 14, 2025
- Time: 6:00 PM - 11:00 PM
- Location: Grand Ballroom, Convention Center
- Reminders: 24 hours before and 2 hours before

To customize, edit `app/api/calendar/route.ts`

## Troubleshooting

### Emails Not Sending

1. Check environment variables are set correctly
2. Verify SMTP credentials
3. Check server console for error messages
4. Test SMTP connection manually
5. Ensure your email provider allows SMTP access

### Analytics Not Working

1. Verify `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
2. Check that domain is added in Plausible dashboard
3. Disable ad blockers for testing
4. Check browser console for script loading errors

### Thank You Page Issues

1. Ensure form redirects after successful submission
2. Check URL parameters are being passed correctly
3. Verify Suspense wrapper is working (no hydration errors)

## Production Deployment

Before deploying to production:

1. ✅ Replace placeholder PDF with real content
2. ✅ Set up production email service (SendGrid/Brevo)
3. ✅ Configure analytics (Plausible/GA)
4. ✅ Test email delivery thoroughly
5. ✅ Update event details if needed
6. ✅ Set proper environment variables on hosting platform
7. ✅ Test calendar invite downloads
8. ✅ Verify all links work

## Support

For issues or questions:
- Email configuration: Check your email provider's SMTP documentation
- Analytics: Refer to Plausible or Google Analytics documentation
- General issues: Check server logs and browser console

---

**Created**: 2025-10-26
**Branch**: email-analytics
**Features**: Email confirmations, Thank you page, Calendar invites, Analytics tracking
