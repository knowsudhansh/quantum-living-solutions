'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Invalid email or password');
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(35,30,25,0.15),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold mb-2 block select-none">
            QUANTUM LIVING SOLUTIONS
          </span>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">
            Administrator Access
          </h1>
          <p className="text-sm text-zinc-500 font-mono">
            Secure administrative control console
          </p>
        </div>

        <div className="bg-[HSL(220,25%,7%)] border border-zinc-800 p-8 rounded-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-sm text-xs font-mono text-red-400">
                Authentication Failed: {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="admin-email" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 select-none">
                Security Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-sm text-foreground outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 select-none">
                Password PIN
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-4 py-3 rounded-sm text-sm text-foreground outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] disabled:bg-zinc-850 disabled:text-zinc-600 text-white text-xs font-mono tracking-wider uppercase py-4 rounded-sm transition-colors duration-200 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[HSL(210,80%,60%)] cursor-pointer"
            >
              {status === 'submitting' ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Seed hint for local deployment */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-zinc-600 font-mono">
              Note: Database auto-seeds credentials on first submit if empty.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-mono tracking-wider uppercase text-zinc-500 hover:text-white transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
          >
            &larr; Back to home website
          </Link>
        </div>
      </div>
    </div>
  );
}
