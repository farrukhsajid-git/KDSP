'use client';

import { FaWhatsapp, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

export default function ShareKDSP() {
  const eventUrl = typeof window !== 'undefined' ? window.location.href : 'https://kdsp-events.com';
  const shareMessage = `Support KDSP Virginia's Fundraising Gala for Down syndrome services in Pakistan! Join us December 14, 2025. RSVP: ${eventUrl}`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=600');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=600');
  };

  return (
    <section id="share" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Share KDSP
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Help us spread the word about this event!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp size={24} />
            <span className="font-semibold">WhatsApp</span>
          </button>

          {/* LinkedIn Button */}
          <button
            onClick={handleLinkedInShare}
            className="flex items-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin size={24} />
            <span className="font-semibold">LinkedIn</span>
          </button>

          {/* Twitter/X Button */}
          <button
            onClick={handleTwitterShare}
            className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 min-w-[200px] justify-center"
            aria-label="Share on X/Twitter"
          >
            <FaXTwitter size={24} />
            <span className="font-semibold">X / Twitter</span>
          </button>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">Share this message:</p>
          <p className="text-gray-800 italic">
            &ldquo;{shareMessage.replace(eventUrl, '[event-link]')}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
