'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/tiwa/supabase';
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/types/enums';

interface AdminBooking {
  id: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  date: string;
  startTime: string;
  location: string;
  address: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  service: {
    name: string;
    slug: string;
    durationMin: number;
    price: number;
    currency: string;
  };
  child: { name: string } | null;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency || 'GHS',
  }).format(minor / 100);
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/bookings', {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Could not load bookings');
      }
      setBookings(json.bookings ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Could not load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: BookingStatus) => {
    setUpdatingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  );

  const stats = BOOKING_STATUSES.map((status) => ({
    status,
    count: bookings.filter((b) => b.status === status).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salon Bookings</h1>
          <p className="text-gray-600 mt-2">
            Appointments from the website booking form. Customers also see these under{' '}
            <span className="font-medium">Account → Bookings</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ status, count }) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                statusFilter === status
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{STATUS_LABELS[status]}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading bookings…</div>
          ) : error ? (
            <div className="py-16 px-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                type="button"
                onClick={fetchBookings}
                className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              {bookings.length === 0
                ? 'No bookings yet — they appear here when someone books on the site.'
                : 'No bookings match this filter.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Guest</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((b) => {
                    const dateStr = new Date(b.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });
                    const status = b.status as BookingStatus;

                    return (
                      <tr key={b.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-gray-900">
                            {b.guestName || 'Guest'}
                          </p>
                          <p className="text-gray-500">{b.guestEmail}</p>
                          {b.guestPhone ? (
                            <p className="text-gray-500">{b.guestPhone}</p>
                          ) : null}
                          {b.child ? (
                            <p className="text-xs text-gray-400 mt-1">For {b.child.name}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium text-gray-900">{b.service.name}</p>
                          <p className="text-gray-500">
                            {formatMoney(b.service.price, b.service.currency)} ·{' '}
                            {b.service.durationMin} min
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-gray-700">
                          {dateStr}
                          <br />
                          <span className="font-medium">{b.startTime}</span>
                        </td>
                        <td className="px-4 py-4 align-top text-gray-700">
                          {b.location === 'HOME_SERVICE' ? 'Home service' : 'In boutique'}
                          {b.address ? (
                            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{b.address}</p>
                          ) : null}
                          {b.notes ? (
                            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">{b.notes}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold mb-2 ${
                              STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {STATUS_LABELS[status] ?? b.status}
                          </span>
                          <select
                            value={b.status}
                            disabled={updatingId === b.id}
                            onChange={(e) =>
                              updateStatus(b.id, e.target.value as BookingStatus)
                            }
                            className="block w-full max-w-[140px] rounded-lg border border-gray-300 px-2 py-1.5 text-xs disabled:opacity-50"
                          >
                            {BOOKING_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
