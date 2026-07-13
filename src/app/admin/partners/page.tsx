'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Logo {
  fileUrl: string;
}

interface Partner {
  id: string;
  name: string;
  tagline: string | null;
  websiteUrl: string;
  isActive: boolean;
  showOnHome: boolean;
  showOnAbout: boolean;
  showOnFooter: boolean;
  displayOrder: number;
  logo: Logo | null;
}

export default function AdminPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/partners');
        if (res.ok && active) {
          const data = await res.json() as { partners: Partner[] };
          setPartners(data.partners);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPartners();
    return () => { active = false; };
  }, [refreshTrigger]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Partner deleted successfully' });
        setRefreshTrigger(t => t + 1);
      } else {
        const d = await res.json() as { error?: string };
        throw new Error(d.error || 'Failed to delete');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Delete failed' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/partners/seed', { method: 'POST' });
      const d = await res.json() as { message?: string; seeded?: boolean };
      if (res.ok) {
        setMessage({
          type: 'success',
          text: d.seeded ? 'RCS Electricals seeded successfully.' : (d.message || 'Already seeded.'),
        });
        setRefreshTrigger(t => t + 1);
      } else {
        throw new Error('Seed failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Seed failed' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold select-none">
            Website CMS
          </span>
          <h1 className="text-3xl font-light text-white tracking-tight mt-1">
            Brand Collaborations
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Manage partner logos and descriptions displayed on the public website.
          </p>
        </div>
        <div className="flex gap-3">
          {partners.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase px-4 py-2.5 rounded-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : 'Seed RCS Electricals'}
            </button>
          )}
          <Link
            href="/admin/partners/create"
            className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white text-xs font-mono uppercase px-5 py-2.5 rounded-sm transition-colors"
          >
            + Add Partner
          </Link>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-sm text-xs font-mono border ${message.type === 'success' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' : 'bg-red-950/20 border-red-900/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-[10px] font-mono uppercase tracking-wider text-zinc-500 select-none">
                <th className="px-6 py-4 font-normal">Logo</th>
                <th className="px-6 py-4 font-normal">Partner</th>
                <th className="px-6 py-4 font-normal">Placements</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Order</th>
                <th className="px-6 py-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs animate-pulse">
                    Loading partners...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-600 font-mono text-xs">
                    No partners yet. Click &quot;Seed RCS Electricals&quot; or &quot;Add Partner&quot;.
                  </td>
                </tr>
              ) : (
                partners.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-950/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      {p.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logo.fileUrl} alt={p.name} className="w-14 h-10 object-contain rounded-sm border border-zinc-800 bg-zinc-900" />
                      ) : (
                        <div className="w-14 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[8px] font-mono text-zinc-700 uppercase">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white text-sm">{p.name}</div>
                      {p.tagline && <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.tagline}</div>}
                      <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[HSL(35,30%,45%)] hover:underline font-mono mt-0.5 block">
                        {p.websiteUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {p.showOnHome && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-sm">Home</span>}
                        {p.showOnAbout && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-sm">About</span>}
                        {p.showOnFooter && <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-sm">Footer</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold border ${p.isActive ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/60' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs">{p.displayOrder}</td>
                    <td className="px-6 py-4 text-right space-x-3 font-mono text-xs">
                      <button
                        onClick={() => router.push(`/admin/partners/edit/${p.id}`)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="text-red-500 hover:text-red-400 transition-colors disabled:text-zinc-700 cursor-pointer"
                      >
                        {deletingId === p.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
