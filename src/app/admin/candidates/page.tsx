'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileText, Loader2, Search, Users } from 'lucide-react';
import { useToast } from '../../../components/utils/toast';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  positionSlug: string;
  source: string;
  location: string | null;
  experienceYears: number | null;
  currentCompany: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  skills: string[];
  availability: string | null;
  message: string | null;
  resumeUrl: string;
  resumeFileName: string | null;
  resumeMimeType: string | null;
  resumeSize: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CandidateSummary {
  total: number;
  filtered: number;
  byStatus: Record<string, number>;
  byRole: Record<string, number>;
  byPosition: Record<string, number>;
}

const STATUSES = ['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED', 'ARCHIVED'];
const ITEMS_PER_PAGE = 10;

function formatFileSize(size: number | null) {
  if (!size) return 'Unknown size';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function statusClass(status: string) {
  if (status === 'HIRED') return 'border-emerald-800/70 text-emerald-300 bg-emerald-950/20';
  if (status === 'REJECTED' || status === 'ARCHIVED') return 'border-red-900/60 text-red-300 bg-red-950/20';
  if (status === 'INTERVIEW' || status === 'SHORTLISTED') return 'border-[color:var(--gold)]/60 text-[color:var(--gold-bright)] bg-[color:var(--gold)]/10';
  return 'border-zinc-800 text-zinc-300 bg-zinc-950/40';
}

export default function AdminCandidatesPage() {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summary, setSummary] = useState<CandidateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (roleFilter !== 'ALL') params.set('role', roleFilter);
    if (positionFilter !== 'ALL') params.set('position', positionFilter);

    try {
      const response = await fetch(`/api/admin/candidates?${params.toString()}`);
      const data = await response.json() as { success?: boolean; candidates?: Candidate[]; summary?: CandidateSummary; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to load candidates');
      setCandidates(data.candidates ?? []);
      setSummary(data.summary ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load candidates';
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [positionFilter, roleFilter, searchQuery, showToast, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => void loadCandidates(), 180);
    return () => clearTimeout(timeout);
  }, [loadCandidates]);

  const roleOptions = useMemo(() => Object.keys(summary?.byRole ?? {}).sort(), [summary]);
  const positionOptions = useMemo(() => Object.keys(summary?.byPosition ?? {}).sort(), [summary]);
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return candidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [candidates, currentPage]);
  const totalPages = Math.max(1, Math.ceil(candidates.length / ITEMS_PER_PAGE));

  const updateCandidate = async (candidate: Candidate, updates: { status?: string; notes?: string }) => {
    setSavingId(candidate.id);
    try {
      const response = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json() as { success?: boolean; candidate?: Candidate; error?: string };
      if (!response.ok || !data.success || !data.candidate) throw new Error(data.error || 'Unable to update candidate');

      setCandidates((current) => current.map((item) => (item.id === candidate.id ? data.candidate! : item)));
      setSelectedCandidate((current) => (current?.id === candidate.id ? data.candidate! : current));
      showToast('Candidate updated.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update candidate';
      showToast(message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const openCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNotesDraft(candidate.notes ?? '');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white">Applicant Dashboard</h1>
          <p className="mt-1 font-mono text-sm text-zinc-500">Career applications, resumes, review notes, and hiring status</p>
        </div>
        <div className="font-mono text-xs text-zinc-500">
          Filtered: <span className="font-semibold text-white">{summary?.filtered ?? candidates.length}</span> / {summary?.total ?? candidates.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Total Applicants</p>
          <p className="mt-3 text-3xl font-light text-white">{summary?.total ?? 0}</p>
        </div>
        <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">New</p>
          <p className="mt-3 text-3xl font-light text-white">{summary?.byStatus.SUBMITTED ?? 0}</p>
        </div>
        <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Shortlisted</p>
          <p className="mt-3 text-3xl font-light text-white">{(summary?.byStatus.SHORTLISTED ?? 0) + (summary?.byStatus.INTERVIEW ?? 0)}</p>
        </div>
        <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">IoT Expert</p>
          <p className="mt-3 text-3xl font-light text-white">{summary?.byPosition['iot-expert'] ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search name, email, phone, skill..."
            className="w-full border border-zinc-800 bg-[HSL(220,25%,7%)] py-3 pl-11 pr-4 font-mono text-xs text-foreground outline-none transition-colors focus:border-zinc-600"
          />
        </div>
        <select value={statusFilter} onChange={(event) => {
          setStatusFilter(event.target.value);
          setCurrentPage(1);
        }} className="border border-zinc-800 bg-[HSL(220,25%,7%)] px-4 py-3 font-mono text-xs text-zinc-400 outline-none focus:border-zinc-600 lg:col-span-2">
          <option value="ALL">All Statuses</option>
          {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={roleFilter} onChange={(event) => {
          setRoleFilter(event.target.value);
          setCurrentPage(1);
        }} className="border border-zinc-800 bg-[HSL(220,25%,7%)] px-4 py-3 font-mono text-xs text-zinc-400 outline-none focus:border-zinc-600 lg:col-span-3">
          <option value="ALL">All Roles</option>
          {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <select value={positionFilter} onChange={(event) => {
          setPositionFilter(event.target.value);
          setCurrentPage(1);
        }} className="border border-zinc-800 bg-[HSL(220,25%,7%)] px-4 py-3 font-mono text-xs text-zinc-400 outline-none focus:border-zinc-600 lg:col-span-3">
          <option value="ALL">All Positions</option>
          {positionOptions.map((position) => <option key={position} value={position}>{position}</option>)}
        </select>
      </div>

      <div className="overflow-hidden border border-zinc-800 bg-[HSL(220,25%,7%)] shadow-xl">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse bg-zinc-900/70" />)}
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="mx-auto h-10 w-10 text-zinc-600" aria-hidden="true" />
            <h2 className="mt-5 font-mono text-sm uppercase tracking-[0.16em] text-zinc-400">No applicants found</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-zinc-600">Adjust filters or wait for new career submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[9px] uppercase tracking-widest text-zinc-500">
                  <th className="px-6 py-4 font-semibold">Applicant</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Resume</th>
                  <th className="px-6 py-4 text-right font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="transition-colors hover:bg-zinc-900/45">
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => openCandidate(candidate)} className="text-left">
                        <span className="block font-medium text-white transition-colors hover:text-[color:var(--gold-bright)]">{candidate.name}</span>
                        <span className="mt-1 block break-all text-[10px] text-zinc-500">{candidate.email} | {candidate.phone}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-zinc-300">{candidate.role}</span>
                      <span className="mt-1 block text-[10px] text-zinc-600">{candidate.positionSlug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={candidate.status}
                        onChange={(event) => void updateCandidate(candidate, { status: event.target.value })}
                        disabled={savingId === candidate.id}
                        className={`border px-3 py-2 font-mono text-[10px] uppercase outline-none ${statusClass(candidate.status)}`}
                      >
                        {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => openCandidate(candidate)} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--gold-bright)] hover:text-white">
                          <Eye className="h-4 w-4" aria-hidden="true" /> Preview
                        </button>
                        <a href={candidate.resumeUrl} download className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-zinc-500 hover:text-white">
                          <Download className="h-4 w-4" aria-hidden="true" /> Download
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {new Date(candidate.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
          <span>Page <span className="text-white">{currentPage}</span> of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="border border-zinc-800 px-3 py-2 disabled:opacity-40">Prev</button>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="border border-zinc-800 px-3 py-2 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}>
          <div className="grid max-h-[92vh] w-full max-w-6xl grid-cols-1 overflow-y-auto border border-zinc-800 bg-[HSL(220,25%,7%)] shadow-2xl lg:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <div className="space-y-6 p-6 md:p-8">
              <div>
                <span className="qls-eyebrow">Applicant Detail</span>
                <h2 className="text-3xl font-light text-white">{selectedCandidate.name}</h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-zinc-500">{selectedCandidate.role}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Email</span>{selectedCandidate.email}</p>
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Phone</span>{selectedCandidate.phone}</p>
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Location</span>{selectedCandidate.location || 'Not provided'}</p>
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Experience</span>{selectedCandidate.experienceYears ?? 'Not provided'} years</p>
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Company</span>{selectedCandidate.currentCompany || 'Not provided'}</p>
                <p><span className="block font-mono text-[10px] uppercase text-zinc-600">Availability</span>{selectedCandidate.availability || 'Not provided'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.length > 0 ? selectedCandidate.skills.map((skill) => (
                  <span key={skill} className="border border-zinc-800 bg-zinc-950/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">{skill}</span>
                )) : <span className="text-sm text-zinc-600">No skills listed.</span>}
              </div>

              <div className="space-y-3">
                {selectedCandidate.portfolioUrl && <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-[color:var(--gold-bright)] hover:text-white">Open portfolio</a>}
                {selectedCandidate.linkedinUrl && <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-[color:var(--gold-bright)] hover:text-white">Open LinkedIn</a>}
              </div>

              <div>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Candidate Message</span>
                <p className="max-h-40 overflow-y-auto border border-zinc-900 bg-zinc-950 p-4 text-sm leading-7 text-zinc-300 whitespace-pre-wrap">{selectedCandidate.message || 'No message provided.'}</p>
              </div>

              <div>
                <label htmlFor="candidate-notes" className="qls-label">Internal Notes</label>
                <textarea id="candidate-notes" rows={5} value={notesDraft} onChange={(event) => setNotesDraft(event.target.value)} className="qls-field resize-none" />
                <button type="button" disabled={savingId === selectedCandidate.id} onClick={() => void updateCandidate(selectedCandidate, { notes: notesDraft })} className="qls-button qls-button-primary mt-4">
                  {savingId === selectedCandidate.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Save Notes
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 bg-zinc-950/45 p-6 lg:border-l lg:border-t-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Resume</span>
                  <p className="mt-1 text-sm text-white">{selectedCandidate.resumeFileName || 'Uploaded resume'}</p>
                  <p className="text-xs text-zinc-600">{formatFileSize(selectedCandidate.resumeSize)}</p>
                </div>
                <a href={selectedCandidate.resumeUrl} download className="qls-button qls-button-secondary">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </a>
              </div>

              {selectedCandidate.resumeMimeType === 'application/pdf' || selectedCandidate.resumeUrl.endsWith('.pdf') ? (
                <iframe src={selectedCandidate.resumeUrl} title={`${selectedCandidate.name} resume preview`} className="h-[34rem] w-full border border-zinc-800 bg-white" />
              ) : (
                <div className="flex h-[34rem] flex-col items-center justify-center border border-zinc-800 bg-zinc-950 text-center">
                  <FileText className="h-12 w-12 text-zinc-600" aria-hidden="true" />
                  <p className="mt-4 text-sm text-zinc-400">Preview is available for PDF resumes.</p>
                  <p className="mt-2 text-xs text-zinc-600">Download this DOC/DOCX resume to review it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
