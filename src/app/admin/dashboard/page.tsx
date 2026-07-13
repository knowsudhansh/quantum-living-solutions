'use client';

import React, { useEffect, useState } from 'react';

interface DashboardStats {
  leads: number;
  bookings: number;
  candidates: number;
  subscribers: number;
}

interface RecentLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interest: string;
  source: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ leads: 0, bookings: 0, candidates: 0, subscribers: 0 });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setRecentLeads(data.recentLeads);
        }
      })
      .catch((err) => console.error('Error loading dashboard stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-xs text-zinc-500">
        Loading analytics metadata...
      </div>
    );
  }

  const statCards = [
    { title: 'Contact Leads', value: stats.leads, desc: 'Logged contact form inquiries' },
    { title: 'Demo Bookings', value: stats.bookings, desc: 'Scheduled experience sessions' },
    { title: 'Job Applications', value: stats.candidates, desc: 'Expressed career interests' },
    { title: 'Mailing list', value: stats.subscribers, desc: 'Active newsletter emails' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-light text-white tracking-tight">Overview & Performance</h1>
        <p className="text-sm text-zinc-500 font-mono mt-1">
          Real-time aggregates from PostgreSQL ledger
        </p>
      </div>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {statCards.map((card) => (
          <div key={card.title} className="p-6 border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
              {card.title}
            </h3>
            <p className="text-4xl font-light text-white tracking-tight mb-2">
              {card.value}
            </p>
            <p className="text-[10px] font-mono text-zinc-600">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Recent submissions list */}
      <div className="border border-zinc-800 bg-[HSL(220,25%,7%)] rounded-sm p-6">
        <h3 className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-6">
          RECENT INQUIRIES REGISTER
        </h3>

        {recentLeads.length === 0 ? (
          <p className="text-xs font-mono text-zinc-600 py-4 text-center">
            No contacts or demo sign-ups recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-zinc-400">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 font-semibold">Name</th>
                  <th className="py-3 font-semibold">Email</th>
                  <th className="py-3 font-semibold">Interest</th>
                  <th className="py-3 font-semibold">Origin</th>
                  <th className="py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-900/40">
                    <td className="py-4 text-white">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="py-4 break-all">{lead.email}</td>
                    <td className="py-4 uppercase text-[10px] tracking-wider">{lead.interest}</td>
                    <td className="py-4 uppercase text-[10px] tracking-wider text-zinc-500">{lead.source}</td>
                    <td className="py-4">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
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
    </div>
  );
}
