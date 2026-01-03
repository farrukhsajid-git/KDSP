import { NextResponse } from 'next/server';
import { createEvents } from 'ics';

export async function GET() {
  try {
    // Event details
    const eventDate = new Date('2026-01-24T19:00:00');
    const eventEndDate = new Date('2026-01-24T22:00:00');

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
      title: 'KDSP Virginia Chapter Launch',
      description:
        'Join us for an introductory evening to learn about KDSP\'s inspiring work supporting children with Down syndrome and their families. ' +
        'Help us build a strong Virginia Chapter focused on inclusion, education, and empowerment.',
      location: 'CHA Street Food (Sterling), 45633 Dulles Eastern Plaza #100, Sterling, VA 20166',
      url: 'https://www.kdsp.org.pk',
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const,
      organizer: { name: 'KDSP Events', email: 'kdspdmv@gmail.com' },
      categories: ['Event', 'Launch', 'KDSP'],
      alarms: [
        {
          action: 'display' as const,
          description: 'KDSP Virginia Chapter Launch - Tomorrow!',
          trigger: { hours: 24, before: true },
        },
        {
          action: 'display' as const,
          description: 'KDSP Virginia Chapter Launch - In 2 hours',
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
        'Content-Disposition': 'attachment; filename="kdsp-virginia-chapter-launch-2026.ics"',
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
