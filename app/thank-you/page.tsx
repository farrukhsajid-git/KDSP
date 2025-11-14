'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Guest';
  const referralId = searchParams.get('referralId') || '';
  const status = searchParams.get('status') || 'Yes';

  const handleDownloadCalendar = async () => {
    try {
      const response = await fetch('/api/calendar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kdsp-virginia-chapter-launch-2026.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar invite. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-gray-900">KDSP Events</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Thank You, {name}!
          </h2>

          {status === 'Yes' ? (
            <p className="text-lg text-center text-gray-700 mb-8">
              We&apos;re thrilled you&apos;ll be joining us at the KDSP Event!
              A confirmation email with all the details has been sent to your inbox.
            </p>
          ) : (
            <p className="text-lg text-center text-gray-700 mb-8">
              Thank you for your interest in KDSP Virginia Chapter!
              We&apos;ll keep you updated about our work and future events via email.
            </p>
          )}

          {/* Event Details Card - Only for attending guests */}
          {status === 'Yes' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Event:</span> KDSP Virginia Chapter Launch</p>
                <p><span className="font-semibold">Date:</span> Sunday, January 18, 2026</p>
                <p><span className="font-semibold">Time:</span> To be Announced</p>
                <p><span className="font-semibold">Venue:</span> To Be Announced</p>
                <p className="mt-4 text-sm italic">We will be sharing the event details to the email provided in this form</p>
              </div>
            </div>
          )}

          {/* Confirmation ID - Only for attending guests */}
          {status === 'Yes' && referralId && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Confirmation ID</h3>
              <div className="bg-white px-4 py-3 rounded-md border border-purple-300 font-mono text-lg font-bold text-purple-600 text-center">
                {referralId}
              </div>
            </div>
          )}

          {/* Action Buttons - Only for attending guests */}
          {status === 'Yes' && (
            <div className="space-y-4 mb-8">
              <button
                onClick={handleDownloadCalendar}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Download Calendar Invite (.ics)</span>
              </button>
            </div>
          )}

          {/* What's Next */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
            <ul className="space-y-3 text-gray-700">
              {status === 'Yes' ? (
                <>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Check your email for confirmation and event details</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Add the event to your calendar using the button above</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Save your confirmation ID for reference</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Visit www.kdsp.org.pk to learn more about KDSP&apos;s work</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Check your email for confirmation of your interest</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>We&apos;ll send you updates about future KDSP Virginia Chapter events</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">✓</span>
                    <span>Visit www.kdsp.org.pk to learn more about KDSP&apos;s mission</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Questions? Contact us at{' '}
            <a
              href="mailto:kdspdmv@gmail.com"
              className="text-blue-600 hover:text-blue-700"
            >
              kdspdmv@gmail.com
            </a>
          </p>
        </div>
      </main>

    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
