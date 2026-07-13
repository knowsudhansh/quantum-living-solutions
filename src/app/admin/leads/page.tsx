'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interest: string;
  source: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [interestFilter, setInterestFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeads(data.leads);
        }
      })
      .catch((err) => console.error('Error fetching leads list', err))
      .finally(() => setLoading(false));
  }, []);

  // Unique lists of interests for dropdown
  const interestsList = useMemo(() => {
    const set = new Set(leads.map((l) => l.interest));
    return Array.from(set).sort();
  }, [leads]);

  // Filtered & Sorted Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(query) ||
          lead.lastName.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    // 2. Interest Category Filter
    if (interestFilter !== 'ALL') {
      result = result.filter((lead) => lead.interest === interestFilter);
    }

    // 3. Source Origin Filter
    if (sourceFilter !== 'ALL') {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    // 4. Sort Ordering
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name-asc') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [leads, searchQuery, interestFilter, sourceFilter, sortBy]);

  // Pagination Slice
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedLeads, currentPage]);

  const totalPages = Math.ceil(processedLeads.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Leads & Inquiries</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Registered client inquiry and demonstration contact leads
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Total: <span className="text-white font-semibold">{processedLeads.length}</span> of {leads.length} entries
        </div>
      </div>

      {/* Control rail: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-4">
          <label htmlFor="search-input" className="sr-only">Search Leads</label>
          <input
            id="search-input"
            type="text"
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-xs font-mono text-foreground outline-none transition-colors duration-200"
          />
        </div>

        {/* Interest Dropdown */}
        <div className="md:col-span-3">
          <label htmlFor="interest-select" className="sr-only">Filter by Interest</label>
          <select
            id="interest-select"
            value={interestFilter}
            onChange={(e) => {
              setInterestFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="ALL">All Subsystems</option>
            {interestsList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Source Dropdown */}
        <div className="md:col-span-2">
          <label htmlFor="source-select" className="sr-only">Filter by Source</label>
          <select
            id="source-select"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="ALL">All Origins</option>
            <option value="contact">Contact form</option>
            <option value="demo">Demo booking</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-3">
          <label htmlFor="sort-select" className="sr-only">Sort Order</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'name-asc');
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm overflow-hidden shadow-xl">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-6 divide-y divide-zinc-900 animate-pulse">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-6">
                <div className="w-1/3 space-y-2">
                  <div className="h-3 bg-zinc-850 rounded w-3/4" />
                  <div className="h-2 bg-zinc-850 rounded w-1/2" />
                </div>
                <div className="w-1/4 h-2.5 bg-zinc-850 rounded" />
                <div className="w-1/6 h-4 bg-zinc-850 rounded" />
              </div>
            ))}
          </div>
        ) : processedLeads.length === 0 ? (
          /* Empty state view */
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border border-dashed border-zinc-700 rounded-full flex items-center justify-center mx-auto text-zinc-500">
              ?
            </div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              No matching leads found
            </h3>
            <p className="text-xs font-mono text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Refine your active search criteria or clear filters to view all logged lead rows.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setInterestFilter('ALL');
                  setSourceFilter('ALL');
                  setSortBy('date-desc');
                }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer outline-none"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          /* Directory leads list */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] bg-zinc-950/40 select-none">
                  <th className="py-4 px-6 font-semibold">Client Name</th>
                  <th className="py-4 px-6 font-semibold">Contact Channels</th>
                  <th className="py-4 px-6 font-semibold">Subsystem Interest</th>
                  <th className="py-4 px-6 font-semibold text-center">Source</th>
                  <th className="py-4 px-6 font-semibold text-right">Log Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-900/40 group transition-colors duration-150">
                    <td className="py-4 px-6 text-white font-medium">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="break-all">{lead.email}</div>
                      <div className="text-zinc-500">{lead.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-300 font-semibold">
                        {lead.interest}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded-full border tracking-widest font-semibold uppercase ${
                        lead.source === 'demo'
                          ? 'bg-amber-950/30 text-amber-400 border-amber-900/50'
                          : 'bg-zinc-900/50 text-zinc-400 border-zinc-800'
                      }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500">
                      {new Date(lead.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
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
