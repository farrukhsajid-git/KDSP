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
  referral_id: string;
  profession_organization: string;
  interest_types: string[];
  referral_source: 'Friend' | 'Social' | 'Invite';
  receive_updates: boolean;
  created_at: string;
}

interface Stats {
  totalRSVPs: number;
  byStatus: Record<string, number>;
  byReferralSource: Record<string, number>;
  wantsUpdates: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try to fetch RSVPs with the password
      const response = await fetch(`/api/admin/rsvps?sortBy=${sortBy}&order=${sortOrder}`, {
        headers: {
          Authorization: password,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRsvps(data.data);
        setIsAuthenticated(true);
        // Also fetch stats
        await fetchStats(password);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (authPassword: string) => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: authPassword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">KDSP Admin Dashboard</h1>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Export CSV
            </button>
          </div>

          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Total RSVPs</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRSVPs}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-900 mb-1">Yes</h3>
                <p className="text-2xl font-bold text-green-600">{stats.byStatus.Yes || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-900 mb-1">Maybe</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.Maybe || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-900 mb-1">No</h3>
                <p className="text-2xl font-bold text-red-600">{stats.byStatus.No || 0}</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('id')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                    Status {sortBy === 'rsvp_status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profession/Org
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interests
                  </th>
                  <th
                    onClick={() => handleSort('referral_source')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Referral {sortBy === 'referral_source' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updates
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{rsvp.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rsvp.full_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{rsvp.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {rsvp.phone_number || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{rsvp.number_of_guests}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rsvp.rsvp_status === 'Yes'
                            ? 'bg-green-100 text-green-800'
                            : rsvp.rsvp_status === 'No'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {rsvp.rsvp_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {rsvp.profession_organization || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {rsvp.interest_types?.map((type, idx) => (
                          <span
                            key={idx}
                            className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {rsvp.referral_source || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {rsvp.receive_updates ? '✓' : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rsvp.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rsvps.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">No RSVPs yet.</div>
            )}

            {loading && (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
