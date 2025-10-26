import { NextRequest, NextResponse } from 'next/server';
import { getRSVPStats } from '@/lib/db';
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

    // Fetch statistics
    const stats = getRSVPStats();

    return NextResponse.json(
      {
        success: true,
        data: {
          totalRSVPs: stats.total,
          byStatus: stats.byStatus,
          byReferralSource: stats.byReferralSource,
          wantsUpdates: stats.wantsUpdates,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching RSVP stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics. Please try again.' },
      { status: 500 }
    );
  }
}
