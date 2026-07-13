'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Slot {
  startTime: string;
  endTime: string;
}

interface Lead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  slot: Slot;
  lead: Lead;
}

const ITEMS_PER_PAGE = 10;

export default function AdminDemoBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'slot-asc' | 'slot-desc' | 'booked-desc'>('slot-asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/admin/demo-bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
      })
      .catch((err) => console.error('Error fetching bookings list', err))
      .finally(() => setLoading(false));
  }, []);

  // Filtered & Sorted Bookings
  const processedBookings = useMemo(() => {
    let result = [...bookings];

    // 1. Text Search Filter (name, email, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.lead.firstName.toLowerCase().includes(query) ||
          b.lead.lastName.toLowerCase().includes(query) ||
          b.lead.email.toLowerCase().includes(query) ||
          b.lead.phone.includes(query)
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // 3. Sort Order
    result.sort((a, b) => {
      if (sortBy === 'slot-asc') {
        return new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime();
      }
      if (sortBy === 'slot-desc') {
        return new Date(b.slot.startTime).getTime() - new Date(a.slot.startTime).getTime();
      }
      if (sortBy === 'booked-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [bookings, searchQuery, statusFilter, sortBy]);

  // Paginated Slice
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedBookings, currentPage]);

  const totalPages = Math.ceil(processedBookings.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Showroom Demo Bookings</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Scheduled demonstration reservations and client calendars
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Total: <span className="text-white font-semibold">{processedBookings.length}</span> of {bookings.length} reservations
        </div>
      </div>

      {/* Control rail: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-5">
          <label htmlFor="search-booking" className="sr-only">Search Bookings</label>
          <input
            id="search-booking"
            type="text"
            placeholder="Search visitor, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-foreground outline-none transition-colors duration-200"
          />
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-3">
          <label htmlFor="status-select" className="sr-only">Filter by Status</label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-4">
          <label htmlFor="sort-bookings" className="sr-only">Sort Order</label>
          <select
            id="sort-bookings"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'slot-asc' | 'slot-desc' | 'booked-desc');
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="slot-asc">Schedule Time (Nearest First)</option>
            <option value="slot-desc">Schedule Time (Furthest First)</option>
            <option value="booked-desc">Booking Creation Date</option>
          </select>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm overflow-hidden shadow-xl">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-6 divide-y divide-zinc-900 animate-pulse">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-6">
                <div className="w-1/3 space-y-2">
                  <div className="h-3 bg-zinc-850 rounded w-2/3" />
                  <div className="h-2 bg-zinc-850 rounded w-1/3" />
                </div>
                <div className="w-1/4 h-3 bg-zinc-850 rounded" />
                <div className="w-1/6 h-4 bg-zinc-850 rounded" />
              </div>
            ))}
          </div>
        ) : processedBookings.length === 0 ? (
          /* Empty state view */
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border border-dashed border-zinc-700 rounded-full flex items-center justify-center mx-auto text-zinc-500">
              📅
            </div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              No matching reservations found
            </h3>
            <p className="text-xs font-mono text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Refine your filter options or clear search strings to view all scheduled session bookings.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setSortBy('slot-asc');
                }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer outline-none"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          /* Bookings ledger table */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] bg-zinc-950/40 select-none">
                  <th className="py-4 px-6 font-semibold">Visitor Profile</th>
                  <th className="py-4 px-6 font-semibold">Scheduled Date & Time</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Booked Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-900/40 transition-colors duration-150">
                    <td className="py-4 px-6 text-white font-medium">
                      <div className="text-white font-medium">{booking.lead.firstName} {booking.lead.lastName}</div>
                      <div className="text-[10px] text-zinc-500 font-normal mt-1 break-all">{booking.lead.email} | {booking.lead.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">
                      {new Date(booking.slot.startTime).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded border tracking-widest font-semibold uppercase ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-950/30 text-red-400 border-red-900/50'
                          : 'bg-zinc-900/50 text-zinc-400 border-zinc-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                        dateStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination rail */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center select-none font-mono text-xs text-zinc-500 pt-4">
          <div>
            Page <span className="text-white">{currentPage}</span> of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-zinc-800 disabled:opacity-30 hover:border-zinc-700 disabled:hover:border-zinc-800 text-[10px] uppercase tracking-wider transition-colors duration-200 cursor-pointer outline-none"
            >
              &larr; Prev
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-zinc-800 disabled:opacity-30 hover:border-zinc-700 disabled:hover:border-zinc-800 text-[10px] uppercase tracking-wider transition-colors duration-200 cursor-pointer outline-none"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
