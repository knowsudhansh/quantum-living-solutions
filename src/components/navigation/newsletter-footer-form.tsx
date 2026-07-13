'use client';

import React, { useState } from 'react';
import { useToast } from '../utils/toast';

export default function NewsletterFooterForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setStatus('submitting');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Subscription failed');
      }

      setStatus('success');
      showToast('Successfully subscribed to newsletter!', 'success');
      setEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setStatus('error');
      showToast(msg, 'error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-2 text-xs font-mono text-emerald-400 uppercase tracking-widest animate-act-fade-in flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>Subscribed successfully</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm w-full">
      <label htmlFor="newsletter-email" className="sr-only">Email Address</label>
      <input
        id="newsletter-email"
        type="email"
        required
        disabled={status === 'submitting'}
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-550 px-3.5 py-2.5 rounded-sm text-xs font-mono text-foreground outline-none transition-colors duration-200"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-4 py-2.5 bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-[10px] font-mono tracking-wider uppercase rounded-sm transition-colors duration-200 outline-none cursor-pointer flex items-center justify-center min-w-[80px]"
      >
        {status === 'submitting' ? '...' : 'Join'}
      </button>
    </form>
  );
}
