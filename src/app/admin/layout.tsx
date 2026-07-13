'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Logout request failed', err);
    }
  };

  const navLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: '⚡' },
    { name: 'Leads & Inquiries', path: '/admin/leads', icon: '👤' },
    { name: 'Demo Bookings', path: '/admin/demo-bookings', icon: '📅' },
    { name: 'Products Catalog', path: '/admin/products', icon: '📦' },
    { name: 'Brand Collaborations', path: '/admin/partners', icon: '🤝' },
    { name: 'Job Candidates', path: '/admin/candidates', icon: '💼' },
    { name: 'Newsletter list', path: '/admin/newsletter', icon: '✉' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col md:flex-row font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[HSL(220,25%,7%)] border-r border-zinc-900/60 flex flex-col select-none shrink-0 relative z-25">
        
        {/* Brand identity header */}
        <div className="p-6 border-b border-zinc-900/60 flex items-center justify-between">
          <Link href="/" className="group block outline-none">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold group-hover:text-white transition-colors duration-200 block">
              QUANTUM LIVING
            </span>
            <span className="text-sm font-light text-white tracking-widest block mt-0.5 font-mono">
              SYSTEMS PORTAL
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`w-full text-left px-4 py-3 rounded-sm text-xs font-mono tracking-wider uppercase transition-all duration-150 cursor-pointer outline-none flex items-center gap-3 relative ${
                  isActive
                    ? 'bg-[HSL(35,30%,45%)]/10 text-[HSL(35,30%,45%)] border-l border-[HSL(35,30%,45%)] font-semibold shadow-[inset_1px_0_0_0_rgba(197,160,89,0.2)]'
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
                }`}
              >
                <span className="text-sm shrink-0 opacity-75">{link.icon}</span>
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & sign out */}
        <div className="p-4 border-t border-zinc-900/60 space-y-4">
          <div className="px-4 font-mono text-[10px] text-zinc-500">
            <p>Node Environment</p>
            <p className="text-zinc-400 mt-0.5 uppercase tracking-wider">{process.env.NODE_ENV}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-zinc-900/50 hover:bg-red-950/20 hover:text-red-400 border border-zinc-800 hover:border-red-900/40 text-zinc-400 text-xs font-mono tracking-wider uppercase py-3 rounded-sm transition-all duration-200 outline-none cursor-pointer"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main viewport panels */}
      <main className="flex-grow min-h-screen bg-zinc-950/45 p-6 md:p-10 relative z-10 overflow-y-auto">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_top_right,rgba(35,30,25,0.06),transparent_60%)] pointer-events-none z-0" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
