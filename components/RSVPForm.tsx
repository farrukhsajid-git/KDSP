'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function RSVPForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    number_of_guests: 1,
    excited_about: '',
    interested_in: [] as string[],
    receive_whatsapp_updates: false,
    will_attend_event: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate full name has at least first and last name
    const nameParts = formData.full_name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setMessage({ type: 'error', text: 'Please enter your full name (first and last name)' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rsvp_status: formData.will_attend_event === 'yes_attend_in_person' ? 'Yes' : 'No',
          interest_types: [...formData.interested_in, ...(formData.excited_about ? [formData.excited_about] : [])],
          referral_source: 'Invite',
          receive_updates: formData.receive_whatsapp_updates,
          donation_intent: [],
          donation_value: null,
          donation_custom: null,
          message: formData.will_attend_event === 'no_but_stay_updated' ? 'Cannot attend but wants updates about future events' : '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to thank-you page with query parameters
        const actualStatus = formData.will_attend_event === 'yes_attend_in_person' ? 'Yes' : 'No';
        const params = new URLSearchParams({
          name: data.full_name || formData.full_name,
          referralId: data.referral_id || '',
          status: actualStatus,
        });
        router.push(`/thank-you?${params.toString()}`);
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
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      if (name === 'interested_in') {
        // Handle multi-select checkboxes
        setFormData((prev) => ({
          ...prev,
          interested_in: checked
            ? [...prev.interested_in, value]
            : prev.interested_in.filter((item) => item !== value),
        }));
      } else {
        // Handle single checkbox
        setFormData((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'number_of_guests' ? parseInt(value) || 1 : value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          required
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="First and Last Name"
        />
      </div>

      {/* Email and Phone in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Email Address"
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Phone Number"
          />
        </div>
      </div>

      {/* Number of Guests */}
      <div>
        <label htmlFor="number_of_guests" className="block text-sm font-semibold text-gray-900 mb-2">
          Number of Guests (including you)
        </label>
        <select
          id="number_of_guests"
          name="number_of_guests"
          required
          value={formData.number_of_guests}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* I'm Excited the Most To */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          I&apos;m Excited the Most To:
        </label>
        <div className="space-y-2.5">
          <label className="flex items-start">
            <input
              type="radio"
              name="excited_about"
              value="learn_about_impact"
              checked={formData.excited_about === 'learn_about_impact'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Learn about KDSP&apos;s mission impact
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="excited_about"
              value="meet_team"
              checked={formData.excited_about === 'meet_team'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Meet the team behind the advocates, and supporters
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="excited_about"
              value="connect_and_help"
              checked={formData.excited_about === 'connect_and_help'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Connect with local families, advocates, and supporters
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="excited_about"
              value="explore_volunteer"
              checked={formData.excited_about === 'explore_volunteer'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Explore how you can help shape Virginia Chapter
            </span>
          </label>
        </div>
      </div>

      {/* I'm Interested In */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          I&apos;m Interested In: (select all that applies)
        </label>
        <div className="space-y-2.5">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="interested_in"
              value="joining_chapter_team"
              checked={formData.interested_in.includes('joining_chapter_team')}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Joining the Virginia Chapter team
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="interested_in"
              value="volunteering_events"
              checked={formData.interested_in.includes('volunteering_events')}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Volunteering for future events
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="interested_in"
              value="donating_sponsoring"
              checked={formData.interested_in.includes('donating_sponsoring')}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Donating or sponsoring
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              name="interested_in"
              value="attending_future_events"
              checked={formData.interested_in.includes('attending_future_events')}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Attending future events
            </span>
          </label>
        </div>
      </div>

      {/* WhatsApp Updates */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            name="receive_whatsapp_updates"
            checked={formData.receive_whatsapp_updates}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
          />
          <span className="ml-3 text-sm text-gray-700">
            Yes, I&apos;d like to receive updates and event reminders via Whatsapp.
          </span>
        </label>
      </div>

      {/* Will you be attending */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Will you be attending the January 18 event?
        </label>
        <div className="space-y-2.5">
          <label className="flex items-start">
            <input
              type="radio"
              name="will_attend_event"
              value="yes_attend_in_person"
              checked={formData.will_attend_event === 'yes_attend_in_person'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              Yes, I&apos;ll attend in person
            </span>
          </label>

          <label className="flex items-start">
            <input
              type="radio"
              name="will_attend_event"
              value="no_but_stay_updated"
              checked={formData.will_attend_event === 'no_but_stay_updated'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
            />
            <span className="ml-3 text-sm text-gray-700">
              No, I can&apos;t attend but would like to stay updated about future events
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-base shadow-md"
      >
        {loading ? 'Submitting...' : 'Share My Interest'}
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
        </div>
      )}
    </form>
  );
}
