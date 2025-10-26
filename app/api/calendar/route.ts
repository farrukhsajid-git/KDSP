import { NextResponse } from 'next/server';
import { createEvents } from 'ics';

export async function GET() {
  try {
    // Event details
    const eventDate = new Date('2025-12-14T18:00:00');
    const eventEndDate = new Date('2025-12-14T23:00:00');

    const event = {
      start: [
        eventDate.getFullYear(),
        eventDate.getMonth() + 1,
        eventDate.getDate(),
        eventDate.getHours(),
        eventDate.getMinutes(),
      ] as [number, number, number, number, number],
      end: [
        eventEndDate.getFullYear(),
        eventEndDate.getMonth() + 1,
        eventEndDate.getDate(),
        eventEndDate.getHours(),
        eventEndDate.getMinutes(),
      ] as [number, number, number, number, number],
      title: 'KDSP Annual Gala Celebration',
      description:
        'Join us for an unforgettable evening of celebration, networking, and entertainment. ' +
        'Dress code: Formal attire. Complimentary valet parking available. Dinner and drinks will be provided.',
      location: 'Grand Ballroom, Convention Center',
      url: 'https://kdsp.com/events',
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const,
      organizer: { name: 'KDSP Events', email: 'events@kdsp.com' },
      categories: ['Event', 'Gala', 'Celebration'],
      alarms: [
        {
          action: 'display' as const,
          description: 'KDSP Annual Gala - Tomorrow!',
          trigger: { hours: 24, before: true },
        },
        {
          action: 'display' as const,
          description: 'KDSP Annual Gala - In 2 hours',
          trigger: { hours: 2, before: true },
        },
      ],
    };

    const { error, value } = createEvents([event]);

    if (error) {
      console.error('Error creating calendar event:', error);
      return NextResponse.json(
        { error: 'Failed to create calendar event' },
        { status: 500 }
      );
    }

    // Return the .ics file
    return new NextResponse(value, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="kdsp-annual-gala-2025.ics"',
      },
    });
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    );
  }
}
