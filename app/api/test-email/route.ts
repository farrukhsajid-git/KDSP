import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT;

    if (!emailUser || !emailPassword) {
      return NextResponse.json({
        success: false,
        error: 'Email credentials not configured',
        config: {
          EMAIL_USER: emailUser ? 'Set' : 'Not set',
          EMAIL_PASSWORD: emailPassword ? 'Set' : 'Not set',
          EMAIL_HOST: emailHost || 'Not set',
          EMAIL_PORT: emailPort || 'Not set',
        }
      });
    }

    // Try to send a test email
    const result = await sendEmail({
      to: emailUser, // Send to yourself
      subject: 'KDSP Test Email',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
      text: 'Test Email - If you receive this, email is working!',
    });

    return NextResponse.json({
      success: result,
      message: result ? 'Test email sent successfully!' : 'Failed to send test email',
      config: {
        EMAIL_USER: emailUser,
        EMAIL_HOST: emailHost,
        EMAIL_PORT: emailPort,
      }
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: error.toString(),
    }, { status: 500 });
  }
}
