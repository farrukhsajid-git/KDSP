import { NextRequest, NextResponse } from 'next/server';
import { deleteRSVPs } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!authHeader || authHeader !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get IDs to delete from request body
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Must provide an array of IDs' },
        { status: 400 }
      );
    }

    // Delete the RSVPs
    const deletedCount = await deleteRSVPs(ids);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} RSVP${deletedCount !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    console.error('Error deleting RSVPs:', error);
    return NextResponse.json(
      { error: 'Failed to delete RSVPs' },
      { status: 500 }
    );
  }
}
