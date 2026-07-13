'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string | null;
  resumeUrl: string;
  status: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected candidate for detail viewing modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetch('/api/admin/candidates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCandidates(data.candidates);
        }
      })
      .catch((err) => console.error('Error fetching candidates list', err))
      .finally(() => setLoading(false));
  }, []);

  // Unique list of expertise areas
  const rolesList = useMemo(() => {
    const set = new Set(candidates.map((c) => c.role));
    return Array.from(set).sort();
  }, [candidates]);

  // Filtered & Sorted candidates
  const processedCandidates = useMemo(() => {
    let result = [...candidates];

    // 1. Text Search Filter (name, email, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    // 2. Role Filter
    if (roleFilter !== 'ALL') {
      result = result.filter((c) => c.role === roleFilter);
    }

    // 3. Sort by date desc (Always newest first for candidate intake)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [candidates, searchQuery, roleFilter]);

  // Paginated Slice
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedCandidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedCandidates, currentPage]);

  const totalPages = Math.ceil(processedCandidates.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight">Job Candidates</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Registered candidate application forms and cover profiles
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          Total: <span className="text-white font-semibold">{processedCandidates.length}</span> of {candidates.length} profiles
        </div>
      </div>

      {/* Control rail: Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Input */}
        <div className="md:col-span-6">
          <label htmlFor="search-candidate" className="sr-only">Search Candidates</label>
          <input
            id="search-candidate"
            type="text"
            placeholder="Search candidate name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-foreground outline-none transition-colors duration-200"
          />
        </div>

        {/* Role Dropdown */}
        <div className="md:col-span-6">
          <label htmlFor="role-select" className="sr-only">Filter by Role</label>
          <select
            id="role-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[HSL(220,25%,7%)] border border-zinc-800 focus:border-zinc-550 px-4 py-3 rounded-sm text-xs font-mono text-zinc-400 outline-none transition-colors duration-200"
          >
            <option value="ALL">All Specialties</option>
            {rolesList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Grid Table */}
      <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm overflow-hidden shadow-xl">
        {loading ? (
          /* Loading Skeletons */
          <div className="p-6 divide-y divide-zinc-900 animate-pulse">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-6">
                <div className="w-1/3 space-y-2">
                  <div className="h-3 bg-zinc-850 rounded w-2/3" />
                  <div className="h-2 bg-zinc-850 rounded w-1/2" />
                </div>
                <div className="w-1/4 h-3 bg-zinc-850 rounded" />
                <div className="w-1/6 h-4 bg-zinc-850 rounded" />
              </div>
            ))}
          </div>
        ) : processedCandidates.length === 0 ? (
          /* Empty state view */
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border border-dashed border-zinc-700 rounded-full flex items-center justify-center mx-auto text-zinc-500">
              💼
            </div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              No candidates found
            </h3>
            <p className="text-xs font-mono text-zinc-600 max-w-xs mx-auto leading-relaxed">
              Refine your active search criteria or check back later for new candidate submissions.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                }}
                className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer outline-none"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          /* Candidates list table */
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest text-[9px] bg-zinc-950/40 select-none">
                  <th className="py-4 px-6 font-semibold">Candidate Profile</th>
                  <th className="py-4 px-6 font-semibold">Area of Expertise</th>
                  <th className="py-4 px-6 font-semibold text-center">Resume link</th>
                  <th className="py-4 px-6 font-semibold text-right">Apply Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className="hover:bg-zinc-900/40 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-white font-medium">
                      <div className="text-white font-medium group-hover:text-[HSL(35,30%,50%)] transition-colors">
                        {candidate.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-normal mt-1 break-all">
                        {candidate.email} | {candidate.phone}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-300 font-medium">
                      {candidate.role}
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[10px] text-[HSL(210,80%,60%)] hover:text-white hover:underline transition-colors"
                      >
                        Open Resume &rarr;
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right text-zinc-500">
                      {new Date(candidate.createdAt).toLocaleDateString('en-IN', {
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

      {/* Detail viewer modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 select-none animate-toast-slide-in"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="w-full max-w-lg border border-zinc-800 bg-[HSL(220,25%,7%)] p-8 rounded-sm space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer outline-none font-sans text-xl"
            >
              ✕
            </button>

            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold block mb-1">
                Candidate Profile Detail
              </span>
              <h3 className="text-2xl font-light text-white tracking-tight">
                {selectedCandidate.name}
              </h3>
              <p className="text-xs font-mono text-zinc-500 mt-1 uppercase">
                Expertise: {selectedCandidate.role}
              </p>
            </div>

            <div className="space-y-3 border-t border-b border-zinc-800/80 py-4 font-mono text-xs">
              <p className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-300 select-all">{selectedCandidate.email}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500">Phone:</span>
                <span className="text-zinc-300 select-all">{selectedCandidate.phone}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500">Applied Date:</span>
                <span className="text-zinc-300">
                  {new Date(selectedCandidate.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                  })}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block select-none">
                Cover Note / Message
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950 p-4 border border-zinc-900 rounded max-h-40 overflow-y-auto whitespace-pre-wrap select-text">
                {selectedCandidate.message || 'No additional note provided by applicant.'}
              </p>
            </div>

            <div className="pt-4 flex gap-4">
              <a
                href={selectedCandidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-1/2 bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white text-xs font-mono text-center tracking-wider uppercase py-3.5 rounded-sm transition-colors duration-200 outline-none"
              >
                Download CV
              </a>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="w-1/2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs font-mono tracking-wider uppercase py-3.5 rounded-sm transition-colors duration-200 cursor-pointer outline-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
