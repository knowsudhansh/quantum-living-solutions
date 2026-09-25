'use client';

import { MAX_MEDIA_FILE_SIZE, MEDIA_FILE_SIZE_ERROR } from '@/lib/config/uploads';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPartnerCreatePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [overview, setOverview] = useState('');
  const [partnership, setPartnership] = useState('');
  const [servicesRaw, setServicesRaw] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [showOnAbout, setShowOnAbout] = useState(true);
  const [showOnFooter, setShowOnFooter] = useState(false);

  // Logo upload
  const [logoId, setLogoId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_MEDIA_FILE_SIZE) {
      setMessage({ type: 'error', text: MEDIA_FILE_SIZE_ERROR });
      return;
    }
    setUploadingLogo(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json() as { media: { id: string; fileUrl: string } };
        setLogoId(data.media.id);
        setLogoUrl(data.media.fileUrl);
      } else {
        const err = await res.json() as { error?: string };
        throw new Error(err.error || 'Upload failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const services = servicesRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, tagline, overview, partnership,
          services, websiteUrl,
          logoId: logoId || undefined,
          displayOrder: parseInt(displayOrder) || 0,
          isActive, showOnHome, showOnAbout, showOnFooter,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Partner created successfully.' });
        setTimeout(() => router.push('/admin/partners'), 800);
      } else {
        const d = await res.json() as { error?: string };
        throw new Error(d.error || 'Failed to create partner');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error creating partner' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-2xl">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] font-semibold select-none">
          Website CMS › Brand Collaborations
        </span>
        <h1 className="text-3xl font-light text-white tracking-tight mt-1">Add Partner</h1>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-sm text-xs font-mono border ${message.type === 'success' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' : 'bg-red-950/20 border-red-900/50 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-[HSL(220,25%,7%)] border border-zinc-800 p-8 rounded-sm">
        {/* Logo */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Partner Logo</label>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo preview" className="w-32 h-20 object-contain rounded-sm border border-zinc-800 bg-zinc-900 mb-3 p-2" />
          )}
          <label htmlFor="logo-upload" className="inline-flex items-center gap-2 cursor-pointer bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-zinc-400 text-xs font-mono uppercase px-4 py-2 rounded-sm transition-colors">
            {uploadingLogo ? 'Uploading...' : logoId ? 'Replace Logo' : 'Upload Logo'}
            <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
          </label>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Company Name *</label>
          <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none" />
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Tagline / Subtitle</label>
          <input id="tagline" type="text" value={tagline} onChange={e => setTagline(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none" />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Website URL *</label>
          <input id="website" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} required
            placeholder="https://example.com"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none" />
        </div>

        {/* Overview */}
        <div>
          <label htmlFor="overview" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Company Overview *</label>
          <textarea id="overview" value={overview} onChange={e => setOverview(e.target.value)} required rows={4}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none resize-y" />
        </div>

        {/* Partnership */}
        <div>
          <label htmlFor="partnership" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Engineering Partnership Description *</label>
          <textarea id="partnership" value={partnership} onChange={e => setPartnership(e.target.value)} required rows={4}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none resize-y" />
        </div>

        {/* Services */}
        <div>
          <label htmlFor="services" className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Services (one per line)</label>
          <p className="text-[9px] text-zinc-600 font-mono mb-2">Each line becomes a service bullet point.</p>
          <textarea id="services" value={servicesRaw} onChange={e => setServicesRaw(e.target.value)} rows={5}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none resize-y font-mono" />
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="order" className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Display Order</label>
          <input id="order" type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} min="0"
            className="w-32 bg-zinc-950 border border-zinc-800 focus:border-zinc-500 px-3 py-2.5 text-sm text-white rounded-sm outline-none" />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <p className="text-[10px] font-mono uppercase text-zinc-500 pt-2">Visibility &amp; Status</p>
          {([
            ['isActive', 'Active (visible)', isActive, setIsActive],
            ['showOnHome', 'Show on Home page', showOnHome, setShowOnHome],
            ['showOnAbout', 'Show on About page', showOnAbout, setShowOnAbout],
            ['showOnFooter', 'Show on Footer', showOnFooter, setShowOnFooter],
          ] as [string, string, boolean, (v: boolean) => void][]).map(([id, label, val, setter]) => (
            <label key={id} className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" id={id} checked={val} onChange={e => setter(e.target.checked)}
                className="w-4 h-4 cursor-pointer" />
              <span className="text-sm text-zinc-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={submitting}
            className="bg-[HSL(35,30%,45%)] hover:bg-[HSL(35,30%,50%)] text-white text-xs font-mono uppercase px-6 py-3 rounded-sm transition-colors cursor-pointer disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Partner'}
          </button>
          <button type="button" onClick={() => router.push('/admin/partners')}
            className="border border-zinc-800 hover:border-zinc-600 text-zinc-400 text-xs font-mono uppercase px-6 py-3 rounded-sm transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
