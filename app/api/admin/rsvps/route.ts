import { NextRequest, NextResponse } from 'next/server';
import { getAllRSVPs } from '@/lib/db';
import { validateAdminAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid admin credentials required.' },
        { status: 401 }
      );
    }

    // Get query parameters for sorting
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'created_at';
    const order = request.nextUrl.searchParams.get('order') || 'desc';

    // Validate order parameter
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    // Fetch all RSVPs with sorting
    const rsvps = await getAllRSVPs(sortBy, sortOrder);

    // Parse JSON strings back to arrays for the response
    const rsvpsWithParsedData = rsvps.map((rsvp) => ({
      ...rsvp,
      interest_types: rsvp.interest_types ? JSON.parse(rsvp.interest_types) : [],
      donation_intent: rsvp.donation_intent ? JSON.parse(rsvp.donation_intent) : [],
      receive_updates: rsvp.receive_updates === 1,
    }));

    return NextResponse.json(
      {
        success: true,
        count: rsvpsWithParsedData.length,
        data: rsvpsWithParsedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSVPs. Please try again.' },
      { status: 500 }
    );
  }
}
