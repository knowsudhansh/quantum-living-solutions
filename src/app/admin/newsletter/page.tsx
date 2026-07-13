'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubscribers(data.subscribers);
        }
      })
      .catch((err) => console.error('Error fetching subscribers list', err))
      .finally(() => setLoading(false));
  }, []);

  // Filtered & Sorted subscribers
  const processedSubscribers = useMemo(() => {
    let result = [...subscribers];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.email.toLowerCase().includes(query));
    }

    // 2. Status Filter
    if (statusFilter !== 'ALL') {
      const activeMatch = statusFilter === 'ACTIVE';
      result = result.filter((s) => s.isActive === activeMatch);
    }

    // 3. Sort by date desc (Always newest first for subscriber signups)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [subscribers, searchQuery, statusFilter]);

  // Paginated Slice
  const paginatedSubscribers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedSubscribers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedSubscribers, currentPage]);

  const totalPages = Math.ceil(processedSubscribers.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Newsletter Subscribers</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Registered client email newsletter subscription registers
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Total: <span className="text-white font-semibold">{processedSubscribers.length}</span> of {subscribers.length} emails
        </div>
      </div>

      {/* Control rail: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center max-w-3xl">
        {/* Search Input */}
        <div className="md:col-span-8">
          <label htmlFor="search-subscriber" className="sr-only">Search Subscribers</label>
          <input
            id="search-subscriber"
            type="text"
            placeholder="Search subscriber email address..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-foreground outline-none transition-colors duration-200"
          />
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-4">
          <label htmlFor="status-subscriber-select" className="sr-only">Filter by Status</label>
          <select
            id="status-subscriber-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="UNSUBSCRIBED">UNSUBSCRIBED</option>
          </select>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm overflow-hidden shadow-xl max-w-3xl">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-6 divide-y divide-zinc-900 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-6">
                <div className="w-1/2 h-3 bg-zinc-850 rounded" />
                <div className="w-1/6 h-4 bg-zinc-850 rounded" />
                <div className="w-1/5 h-2 bg-zinc-850 rounded" />
              </div>
            ))}
          </div>
        ) : processedSubscribers.length === 0 ? (
          /* Empty state view */
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border border-dashed border-zinc-700 rounded-full flex items-center justify-center mx-auto text-zinc-500">
              ✉
            </div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              No subscribers found
            </h3>
            <p className="text-xs font-mono text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Refine your filter options or wait for visitor email registrations.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer outline-none"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          /* Newsletter list table */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] bg-zinc-950/40 select-none">
                  <th className="py-4 px-6 font-semibold">Subscriber Email</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Signup Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-zinc-900/40 transition-colors duration-150">
                    <td className="py-4 px-6 text-white font-medium break-all">
                      {subscriber.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded border tracking-widest font-semibold uppercase ${
                        subscriber.isActive
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                          : 'bg-red-950/30 text-red-400 border-red-900/50'
                      }`}>
                        {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500">
                      {new Date(subscriber.createdAt).toLocaleDateString('en-IN', {
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
        <div className="flex justify-between items-center select-none font-mono text-xs text-zinc-500 pt-4 max-w-3xl">
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
