import { NextRequest, NextResponse } from 'next/server';
import { insertRSVP, RSVPData } from '@/lib/db';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid interest types
const VALID_INTEREST_TYPES = ['Volunteer', 'Donate', 'Outreach', 'Awareness'] as const;

// Valid referral sources
const VALID_REFERRAL_SOURCES = ['Friend', 'Social', 'Invite'] as const;

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

    // Validate new required fields
    if (!body.profession_organization || typeof body.profession_organization !== 'string' || body.profession_organization.trim() === '') {
      return NextResponse.json(
        { error: 'Profession/Organization is required' },
        { status: 400 }
      );
    }

    if (!body.interest_types || !Array.isArray(body.interest_types) || body.interest_types.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest type must be selected' },
        { status: 400 }
      );
    }

    // Validate each interest type
    const invalidInterests = body.interest_types.filter(
      (type: string) => !VALID_INTEREST_TYPES.includes(type as any)
    );

    if (invalidInterests.length > 0) {
      return NextResponse.json(
        { error: `Invalid interest type(s): ${invalidInterests.join(', ')}. Must be one of: ${VALID_INTEREST_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

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

    // Prepare data for insertion
    const rsvpData: RSVPData = {
      full_name: body.full_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone_number: body.phone_number?.trim() || undefined,
      number_of_guests: body.number_of_guests,
      rsvp_status: body.rsvp_status,
      message: body.message?.trim() || undefined,
      profession_organization: body.profession_organization.trim(),
      interest_types: body.interest_types,
      referral_source: body.referral_source,
      receive_updates: body.receive_updates,
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
