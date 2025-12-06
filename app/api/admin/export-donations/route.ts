import { NextRequest, NextResponse } from 'next/server';
import { getAllRSVPs } from '@/lib/db';
import { validateAdminAuth } from '@/lib/auth';

/**
 * Escapes CSV field values to handle commas, quotes, and newlines
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const stringValue = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts donation records to CSV format
 */
function convertDonationsToCSV(rsvps: any[]): string {
  // Define CSV headers
  const headers = [
    'ID',
    'Full Name',
    'Email',
    'Phone Number',
    'RSVP Status',
    'Donation Intent',
    'Donation Value',
    'Custom Amount',
    'Total Donation Amount',
    'Created At',
  ];

  // Create CSV rows - only include RSVPs with donation intent
  const rows = rsvps
    .filter((rsvp) => {
      try {
        const donationIntent = rsvp.donation_intent ? JSON.parse(rsvp.donation_intent) : [];
        return donationIntent && donationIntent.length > 0;
      } catch {
        return false;
      }
    })
    .map((rsvp) => {
      // Parse donation_intent JSON array
      let donationIntent = '';
      try {
        const parsed = JSON.parse(rsvp.donation_intent || '[]');
        donationIntent = Array.isArray(parsed) ? parsed.join(', ') : '';
      } catch {
        donationIntent = '';
      }

      // Calculate total donation amount
      const totalAmount = rsvp.donation_value || rsvp.donation_custom || 0;

      return [
        rsvp.id,
        rsvp.full_name,
        rsvp.email,
        rsvp.phone_number || '',
        rsvp.rsvp_status,
        donationIntent,
        rsvp.donation_value || '',
        rsvp.donation_custom || '',
        totalAmount ? `$${totalAmount}` : '',
        rsvp.created_at,
      ].map(escapeCSVField);
    });

  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCSVField).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
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
    const rsvps = await getAllRSVPs('created_at', 'desc');

    // Convert to CSV
    const csvContent = convertDonationsToCSV(rsvps);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `kdsp-donation-data-${timestamp}.csv`;

    // Return CSV file with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting donation data:', error);
    return NextResponse.json(
      { error: 'Failed to export donation data. Please try again.' },
      { status: 500 }
    );
  }
}
