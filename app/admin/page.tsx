'use client';

import { useState, useEffect } from 'react';

interface RSVP {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
  interest_types: string[];
  receive_updates: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Check for saved session on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('kdsp_admin_session');
    if (savedPassword) {
      setPassword(savedPassword);
      // Verify the saved password
      fetch(`/api/admin/rsvps?sortBy=created_at&order=desc`, {
        headers: { Authorization: savedPassword },
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            localStorage.removeItem('kdsp_admin_session');
            throw new Error('Invalid session');
          }
        })
        .then(data => {
          setRsvps(data.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setPassword('');
        });
    }
  }, []);

  // Calculate stats from RSVPs
  const stats = {
    totalRSVPs: rsvps.length,
    attendingInPerson: rsvps.filter(r => r.rsvp_status === 'Yes').length,
    notAttending: rsvps.filter(r => r.rsvp_status === 'No').length,
    totalGuests: rsvps
      .filter(r => r.rsvp_status === 'Yes') // Only count guests who are actually attending
      .reduce((sum, r) => sum + r.number_of_guests, 0),
    whatsappUpdates: rsvps.filter(r => r.receive_updates).length,
  };

  // Get interested in breakdown
  const getInterestedInStats = () => {
    const stats: Record<string, number> = {};
    rsvps.forEach(rsvp => {
      rsvp.interest_types?.forEach((interest: string) => {
        if (interest === 'joining_chapter_team' ||
            interest === 'volunteering_events' ||
            interest === 'donating_sponsoring' ||
            interest === 'attending_future_events') {
          stats[interest] = (stats[interest] || 0) + 1;
        }
      });
    });
    return stats;
  };

  const interestedInStats = getInterestedInStats();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/rsvps?sortBy=${sortBy}&order=${sortOrder}`, {
        headers: {
          Authorization: password,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRsvps(data.data);
        setIsAuthenticated(true);
        // Save password to localStorage for session persistence
        localStorage.setItem('kdsp_admin_session', password);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const fetchRSVPs = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/rsvps?sortBy=${sortBy}&order=${sortOrder}`, {
        headers: {
          Authorization: password,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRsvps(data.data);
      } else {
        setError('Failed to fetch RSVPs');
      }
    } catch (err) {
      setError('Failed to fetch RSVPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRSVPs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, isAuthenticated]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        headers: {
          Authorization: password,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kdsp-rsvps-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export CSV');
      }
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kdsp_admin_session');
    setIsAuthenticated(false);
    setPassword('');
    setRsvps([]);
    setSelectedIds([]);
  };

  const formatInterestLabel = (interest: string) => {
    const labels: Record<string, string> = {
      'joining_chapter_team': 'Joining Chapter Team',
      'volunteering_events': 'Volunteering for Events',
      'donating_sponsoring': 'Donating/Sponsoring',
      'attending_future_events': 'Attending Future Events',
      'learn_about_impact': 'Learn About Impact',
      'meet_team': 'Meet the Team',
      'connect_and_help': 'Connect with Families',
      'explore_volunteer': 'Help Shape Chapter',
    };
    return labels[interest] || interest;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(rsvps.map(rsvp => rsvp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} record${selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: password,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the list
        await fetchRSVPs();
        setSelectedIds([]);
        alert(data.message || 'Records deleted successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete records');
      }
    } catch (err) {
      setError('Failed to delete records');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">KDSP Admin</h1>
            <p className="text-gray-600">January 18 Event Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KDSP Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Virginia Chapter - January 18 Event</p>
              {selectedIds.length > 0 && (
                <p className="text-blue-600 mt-1 text-sm font-medium">
                  {selectedIds.length} record{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🗑️ Delete Selected ({selectedIds.length})
                </button>
              )}
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
              >
                📥 Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Interests Submitted</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRSVPs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Attending In Person</h3>
            <p className="text-3xl font-bold text-green-600">{stats.attendingInPerson}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Guests In Person</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalGuests}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">WhatsApp Updates</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.whatsappUpdates}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Want to Stay Updated</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.notAttending}</p>
          </div>
        </div>

        {/* Interested In Breakdown */}
        {Object.keys(interestedInStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Interest Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(interestedInStats).map(([key, count]) => (
                <div key={key} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">{formatInterestLabel(key)}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === rsvps.length && rsvps.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('full_name')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Name {sortBy === 'full_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th
                    onClick={() => handleSort('rsvp_status')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Attending {sortBy === 'rsvp_status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excited About
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interested In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Submitted {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rsvp.id)}
                        onChange={() => handleSelectRow(rsvp.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rsvp.full_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {rsvp.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {rsvp.phone_number || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                      {rsvp.number_of_guests}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          rsvp.rsvp_status === 'Yes'
                            ? 'bg-green-100 text-green-800'
                            : rsvp.rsvp_status === 'No'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rsvp.rsvp_status === 'Yes' ? '✓ Yes, In Person' : '✉️ Stay Updated'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {rsvp.interest_types
                          ?.filter((type: string) =>
                            ['learn_about_impact', 'meet_team', 'connect_and_help', 'explore_volunteer'].includes(type)
                          )
                          .map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-md font-medium"
                            >
                              {formatInterestLabel(type)}
                            </span>
                          ))}
                        {!rsvp.interest_types?.some((type: string) =>
                          ['learn_about_impact', 'meet_team', 'connect_and_help', 'explore_volunteer'].includes(type)
                        ) && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {rsvp.interest_types
                          ?.filter((type: string) =>
                            ['joining_chapter_team', 'volunteering_events', 'donating_sponsoring', 'attending_future_events'].includes(type)
                          )
                          .map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md font-medium"
                            >
                              {formatInterestLabel(type)}
                            </span>
                          ))}
                        {!rsvp.interest_types?.some((type: string) =>
                          ['joining_chapter_team', 'volunteering_events', 'donating_sponsoring', 'attending_future_events'].includes(type)
                        ) && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      {rsvp.receive_updates ? (
                        <span className="text-green-600 font-bold text-lg">✓</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rsvp.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rsvps.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No RSVPs yet.</p>
                <p className="text-sm mt-2">Submissions will appear here once people start RSVPing.</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
