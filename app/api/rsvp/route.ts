import { NextRequest, NextResponse } from 'next/server';
import { insertRSVP, RSVPData } from '@/lib/db';
import { sendRSVPConfirmation } from '@/lib/email';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid interest types
const VALID_INTEREST_TYPES = ['Volunteer', 'Donate', 'Outreach', 'Awareness'] as const;

// Valid referral sources
const VALID_REFERRAL_SOURCES = ['Friend', 'Social', 'Invite'] as const;

// Valid donation intent values
const VALID_DONATION_INTENT = ['individual', 'company', 'awareness', 'volunteer', 'learn_more'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields - existing validations
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

    // Profession/Organization is now optional
    // Interest types is now optional (can be empty array)

    if (!body.referral_source || !VALID_REFERRAL_SOURCES.includes(body.referral_source)) {
      return NextResponse.json(
        { error: `Referral source is required and must be one of: ${VALID_REFERRAL_SOURCES.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof body.receive_updates !== 'boolean') {
      return NextResponse.json(
        { error: 'Receive updates preference is required (true or false)' },
        { status: 400 }
      );
    }

    // Validate donation_intent (optional field, but if provided must be valid)
    if (body.donation_intent !== undefined) {
      if (!Array.isArray(body.donation_intent)) {
        return NextResponse.json(
          { error: 'Donation intent must be an array' },
          { status: 400 }
        );
      }

      // Validate each donation intent value
      const invalidIntents = body.donation_intent.filter(
        (intent: string) => !VALID_DONATION_INTENT.includes(intent as any)
      );

      if (invalidIntents.length > 0) {
        return NextResponse.json(
          { error: `Invalid donation intent(s): ${invalidIntents.join(', ')}. Must be one of: ${VALID_DONATION_INTENT.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate donation_value (optional field, but if provided must be valid)
    if (body.donation_value !== undefined && body.donation_value !== null) {
      if (typeof body.donation_value !== 'number' || body.donation_value <= 0) {
        return NextResponse.json(
          { error: 'Donation value must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Validate donation_custom (optional field, but if provided must be valid)
    if (body.donation_custom !== undefined && body.donation_custom !== null) {
      if (typeof body.donation_custom !== 'number' || body.donation_custom <= 0) {
        return NextResponse.json(
          { error: 'Custom donation amount must be a positive number greater than zero' },
          { status: 400 }
        );
      }
    }

    // Ensure only one donation value is set
    if (body.donation_value && body.donation_custom) {
      return NextResponse.json(
        { error: 'Cannot set both donation_value and donation_custom. Please choose one.' },
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
      interest_types: body.interest_types || [],
      referral_source: body.referral_source,
      receive_updates: body.receive_updates,
      donation_intent: body.donation_intent || [],
      donation_value: body.donation_value || null,
      donation_custom: body.donation_custom || null,
    };

    // Insert into database
    const result = insertRSVP(rsvpData);

    // Send confirmation email (async, don't wait for it)
    // This runs in background so user doesn't have to wait
    sendRSVPConfirmation(rsvpData, result.referral_id).catch((error) => {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      {
        success: true,
        message: 'RSVP submitted successfully!',
        id: result.lastInsertRowid,
        referral_id: result.referral_id,
        full_name: rsvpData.full_name,
        rsvp_status: rsvpData.rsvp_status,
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
