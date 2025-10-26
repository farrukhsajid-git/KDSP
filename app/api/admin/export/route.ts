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
 * Converts RSVP records to CSV format
 */
function convertToCSV(rsvps: any[]): string {
  // Define CSV headers
  const headers = [
    'ID',
    'Full Name',
    'Email',
    'Phone Number',
    'Number of Guests',
    'RSVP Status',
    'Message',
    'Referral ID',
    'Profession/Organization',
    'Interest Types',
    'Referral Source',
    'Receive Updates',
    'Created At',
  ];

  // Create CSV rows
  const rows = rsvps.map((rsvp) => {
    // Parse interest_types JSON array
    let interestTypes = '';
    try {
      const parsed = JSON.parse(rsvp.interest_types || '[]');
      interestTypes = Array.isArray(parsed) ? parsed.join(', ') : '';
    } catch {
      interestTypes = '';
    }

    return [
      rsvp.id,
      rsvp.full_name,
      rsvp.email,
      rsvp.phone_number || '',
      rsvp.number_of_guests,
      rsvp.rsvp_status,
      rsvp.message || '',
      rsvp.referral_id,
      rsvp.profession_organization || '',
      interestTypes,
      rsvp.referral_source || '',
      rsvp.receive_updates === 1 ? 'Yes' : 'No',
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
    const rsvps = getAllRSVPs('created_at', 'desc');

    // Convert to CSV
    const csvContent = convertToCSV(rsvps);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `kdsp-rsvps-${timestamp}.csv`;

    // Return CSV file with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to export RSVPs. Please try again.' },
      { status: 500 }
    );
  }
}
