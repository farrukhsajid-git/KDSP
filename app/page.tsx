import RSVPForm from '@/components/RSVPForm';
import { FaCalendarAlt, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-r from-blue-500 to-blue-400 pt-12 pb-20 px-4 overflow-hidden">
        {/* Mobile: Images at top split 50/50 */}
        <div className="lg:hidden flex absolute top-0 left-0 right-0 h-64 z-10">
          <div className="w-1/2">
            <img
              src="/left-hero.jpeg"
              alt="KDSP Left"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="w-1/2">
            <img
              src="/right-hero.jpeg"
              alt="KDSP Right"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Desktop: Left Image - Vertical side */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1/6 md:w-1/5 lg:w-1/4 z-10">
          <img
            src="/left-hero.jpeg"
            alt="KDSP Left"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Desktop: Right Image - Vertical side */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/6 md:w-1/5 lg:w-1/4 z-10">
          <img
            src="/right-hero.jpeg"
            alt="KDSP Right"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-20 pt-64 lg:pt-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Us for an Evening of<br />Purpose & Awareness
          </h1>
          <p className="text-white text-lg mb-8">
            Launching the Virginia Chapter of KDSP<br />
            <span className="text-sm">(Karwan-e-Dastan Special Persons)</span>
          </p>

          {/* Save the Date Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save the Date</h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <FaCalendarAlt className="text-blue-500 text-xl" />
              <span className="text-2xl font-bold text-gray-900">January 18</span>
            </div>
            <div className="flex items-start justify-center gap-2 text-gray-600">
              <FaMapMarkerAlt className="text-blue-500 text-lg mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Location to be announced soon</p>
                <p>(Northern Virginia area)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 pb-16">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
          {/* Description */}
          <p className="text-gray-700 text-center mb-8 leading-relaxed">
            We're excited to bring KDSP to Virginia! Join us for an introductory evening
            to learn about KDSP's inspiring work supporting children on the autism
            spectrum and their families and how you can help us build a strong Virginia Chapter dedicated to inclusion, education, and empowerment.
          </p>

          {/* RSVP Form */}
          <RSVPForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/kdsp-logo.png"
              alt="KDSP Logo"
              className="h-8 w-auto"
            />
            <span className="font-semibold">KDSP</span>
            <span>—</span>
            <span>Empowering Kids on the Spectrum</span>
          </div>
          <a
            href="https://www.kdsp.org.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
          >
            www.kdsp.org.pk
          </a>
        </div>
      </main>
    </div>
  );
}
