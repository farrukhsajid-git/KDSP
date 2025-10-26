import { NextRequest, NextResponse } from 'next/server';
import { insertRSVP, RSVPData } from '@/lib/db';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.full_name || typeof body.full_name !== 'string' || body.full_name.trim() === '') {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!body.number_of_guests || typeof body.number_of_guests !== 'number' || body.number_of_guests < 1) {
      return NextResponse.json(
        { error: 'Number of guests must be at least 1' },
        { status: 400 }
      );
    }

    if (!body.rsvp_status || !['Yes', 'No', 'Maybe'].includes(body.rsvp_status)) {
      return NextResponse.json(
        { error: 'Valid RSVP status is required (Yes, No, or Maybe)' },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const rsvpData: RSVPData = {
      full_name: body.full_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone_number: body.phone_number?.trim() || undefined,
      number_of_guests: body.number_of_guests,
      rsvp_status: body.rsvp_status,
      message: body.message?.trim() || undefined,
    };

    // Insert into database
    const result = insertRSVP(rsvpData);

    return NextResponse.json(
      {
        success: true,
        message: 'RSVP submitted successfully!',
        id: result.lastInsertRowid,
        referral_id: result.referral_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json(
      { error: 'Failed to process RSVP. Please try again.' },
      { status: 500 }
    );
  }
}
