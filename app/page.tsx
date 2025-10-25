import RSVPForm from '@/components/RSVPForm';

export default function Home() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Event Information Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Annual Gala Celebration
          </h2>
          <div className="inline-block bg-white rounded-lg shadow-md px-8 py-4 mb-6">
            <p className="text-xl text-gray-700">
              <span className="font-semibold">Date:</span> Saturday, December 14, 2025
            </p>
            <p className="text-xl text-gray-700 mt-2">
              <span className="font-semibold">Time:</span> 6:00 PM - 11:00 PM
            </p>
            <p className="text-xl text-gray-700 mt-2">
              <span className="font-semibold">Venue:</span> Grand Ballroom, Convention Center
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              Join us for an unforgettable evening of celebration, networking, and entertainment.
              We are excited to bring together our community for this special occasion.
              Please fill out the form below to confirm your attendance and help us plan for a spectacular event.
            </p>
          </div>
        </div>

        {/* RSVP Form Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Reserve Your Spot
          </h3>
          <RSVPForm />
        </div>

        {/* Additional Information */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Important Information</h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Dress code: Formal attire</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Complimentary valet parking available</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Dinner and drinks will be provided</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Please RSVP by December 1, 2025</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-300">
              For questions, please contact us at{' '}
              <a href="mailto:events@kdsp.com" className="text-blue-400 hover:text-blue-300">
                events@kdsp.com
              </a>
            </p>
            <p className="text-gray-400 mt-4">
              &copy; 2025 KDSP Events. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
