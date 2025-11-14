import { NextRequest, NextResponse } from 'next/server';
import { getAllRSVPs } from '@/lib/db';
import { validateAdminAuth } from '@/lib/auth';

interface DonationIntentStats {
  intentType: string;
  count: number;
  estimatedValue: number;
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    if (!validateAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid admin credentials required.' },
        { status: 401 }
      );
    }

    // Fetch all RSVPs
    const rsvps = getAllRSVPs('created_at', 'desc');

    // Initialize statistics
    const intentCounts: Record<string, number> = {
      individual: 0,
      company: 0,
      awareness: 0,
      volunteer: 0,
      learn_more: 0,
    };

    const intentValues: Record<string, number> = {
      individual: 0,
      company: 0,
      awareness: 0,
      volunteer: 0,
      learn_more: 0,
    };

    let totalGuestsWithIntent = 0;
    let totalEstimatedValue = 0;

    // Process each RSVP
    rsvps.forEach((rsvp) => {
      // Parse donation_intent
      let donationIntent: string[] = [];
      try {
        donationIntent = rsvp.donation_intent ? JSON.parse(rsvp.donation_intent) : [];
      } catch {
        donationIntent = [];
      }

      // Skip if no donation intent
      if (!donationIntent || donationIntent.length === 0) {
        return;
      }

      // Count this guest as having donation intent
      totalGuestsWithIntent++;

      // Get donation value for this RSVP
      const donationValue = rsvp.donation_value || rsvp.donation_custom || 0;
      totalEstimatedValue += donationValue;

      // Count each intent type and add value
      donationIntent.forEach((intent) => {
        if (intent in intentCounts) {
          intentCounts[intent]++;
          // Distribute the donation value across all selected intents
          // This is a simplified approach - you might want to adjust this logic
          intentValues[intent] += donationValue / donationIntent.length;
        }
      });
    });

    // Build response data
    const intentStats: DonationIntentStats[] = [
      {
        intentType: 'Individual',
        count: intentCounts.individual,
        estimatedValue: Math.round(intentValues.individual),
      },
      {
        intentType: 'Corporate',
        count: intentCounts.company,
        estimatedValue: Math.round(intentValues.company),
      },
      {
        intentType: 'Awareness',
        count: intentCounts.awareness,
        estimatedValue: Math.round(intentValues.awareness),
      },
      {
        intentType: 'Volunteer',
        count: intentCounts.volunteer,
        estimatedValue: Math.round(intentValues.volunteer),
      },
      {
        intentType: 'Learn More',
        count: intentCounts.learn_more,
        estimatedValue: Math.round(intentValues.learn_more),
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          totalGuestsWithIntent,
          totalEstimatedValue: Math.round(totalEstimatedValue),
          intentStats: intentStats.filter((stat) => stat.count > 0), // Only show intents with data
          allIntentStats: intentStats, // Include all for completeness
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching donation statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation statistics. Please try again.' },
      { status: 500 }
    );
  }
}
