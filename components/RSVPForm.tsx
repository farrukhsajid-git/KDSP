'use client';

import { useState, FormEvent } from 'react';

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    number_of_guests: 1,
    rsvp_status: 'Yes',
    message: '',
    profession_organization: '',
    interest_types: [] as string[],
    referral_source: 'Friend' as 'Friend' | 'Social' | 'Invite',
    receive_updates: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; referralId?: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'RSVP submitted successfully!',
          referralId: data.referral_id
        });
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone_number: '',
          number_of_guests: 1,
          rsvp_status: 'Yes',
          message: '',
          profession_organization: '',
          interest_types: [],
          referral_source: 'Friend',
          receive_updates: false,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit RSVP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'number_of_guests' ? parseInt(value) || 1 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    if (name === 'interest_types') {
      setFormData((prev) => ({
        ...prev,
        interest_types: checked
          ? [...prev.interest_types, value]
          : prev.interest_types.filter((type) => type !== value),
      }));
    } else if (name === 'receive_updates') {
      setFormData((prev) => ({
        ...prev,
        receive_updates: checked,
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Number of Guests */}
        <div>
          <label htmlFor="number_of_guests" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="number_of_guests"
            name="number_of_guests"
            required
            min="1"
            max="10"
            value={formData.number_of_guests}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* RSVP Status */}
        <div>
          <label htmlFor="rsvp_status" className="block text-sm font-medium text-gray-700 mb-2">
            RSVP Status <span className="text-red-500">*</span>
          </label>
          <select
            id="rsvp_status"
            name="rsvp_status"
            required
            value={formData.rsvp_status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Yes">Yes, I will attend</option>
            <option value="No">No, I cannot attend</option>
            <option value="Maybe">Maybe</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special requests or dietary restrictions?"
          />
        </div>

        {/* Profession / Organization */}
        <div>
          <label htmlFor="profession_organization" className="block text-sm font-medium text-gray-700 mb-2">
            Profession / Organization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="profession_organization"
            name="profession_organization"
            required
            value={formData.profession_organization}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Software Engineer at Acme Corp"
          />
        </div>

        {/* Interest Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Type <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Volunteer', 'Donate', 'Outreach', 'Awareness'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  name="interest_types"
                  value={type}
                  checked={formData.interest_types.includes(type)}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referral Source */}
        <div>
          <label htmlFor="referral_source" className="block text-sm font-medium text-gray-700 mb-2">
            How did you hear about us? <span className="text-red-500">*</span>
          </label>
          <select
            id="referral_source"
            name="referral_source"
            required
            value={formData.referral_source}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Friend">Friend</option>
            <option value="Social">Social Media</option>
            <option value="Invite">Direct Invite</option>
          </select>
        </div>

        {/* Receive Updates */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="receive_updates"
              checked={formData.receive_updates}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              I&apos;d like to receive updates about KDSP.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Submitting...' : 'Submit RSVP'}
        </button>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="font-medium">{message.text}</p>
            {message.type === 'success' && message.referralId && (
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="text-sm font-semibold mb-1">Your Referral ID:</p>
                <p className="text-lg font-mono bg-white px-3 py-2 rounded border border-green-300 inline-block">
                  {message.referralId}
                </p>
                <p className="text-xs mt-2 text-green-700">
                  Share this ID with friends to track your referrals!
                </p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
