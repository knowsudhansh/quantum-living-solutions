'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '../../components/utils/toast';
import { MotionReveal, MotionPresencePanel } from '../../components/ui/motion';
import { BUSINESS_CONTACT } from '../../lib/config/business';

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: 'Smart Home', message: '' });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, message: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // 1. Dynamic Inline Validation
  const errors = useMemo(() => {
    return {
      name: formData.name.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email address.' : '',
      phone: !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone) ? 'Enter a valid phone number.' : '',
      message: formData.message.trim().length < 10 ? 'Message must be at least 10 characters.' : '',
    };
  }, [formData]);

  const isFormValid = useMemo(() => {
    return Object.values(errors).every((err) => err === '');
  }, [errors]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, email: true, phone: true, message: true });

    if (!isFormValid) {
      showToast('Please correct form errors before submitting.', 'error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      // Construct pre-filled WhatsApp message
      const baseText = `Hello Quantum Living Solutions,\n\nI would like to discuss an automation project.`;
      const details = `\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nInterest: ${formData.interest}\nMessage: ${formData.message}\n\nSource: Quantum Living Solutions Website Contact Form`;
      const fullMessage = encodeURIComponent(baseText + details);
      const url = `https://wa.me/918130856575?text=${fullMessage}`;

      setWhatsappUrl(url);
      setStatus('success');
      showToast('Inquiry recorded successfully!', 'success');
      window.open(url, '_blank');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      setStatus('error');
      showToast(msg, 'error');
    }
  };

  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">
          GET IN TOUCH
        </span>
        <h1 className="qls-title mb-5">
          Contact Us
        </h1>
        <p className="qls-lead">
          Have questions about our custom lighting, shading, or smart home solutions? Contact us directly or visit our showroom.
        </p>
      </MotionReveal>

      <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
        {/* Contact details (Left) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              SHOWROOM & OFFICE
            </h3>
            <p className="text-sm font-mono text-zinc-400 leading-relaxed">
              Quantum Living Solutions
            </p>
            <p className="text-base text-foreground/90 leading-relaxed font-normal">
              Shravan Nagar, Swarn City Road
            </p>
            <p className="text-base text-foreground/90 leading-relaxed font-normal">
              Singhariya, Kunraghat, Gorakhpur
            </p>
            <p className="text-base text-foreground/90 leading-relaxed font-normal">
              Uttar Pradesh 273008, India
            </p>
            <div className="mt-4">
              <a
                href="https://www.google.com/maps/place/quantumlivingsolutions.com/@26.7378746,83.4347162,16z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-mono tracking-wider uppercase text-[HSL(210,80%,60%)] hover:text-white transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[HSL(210,80%,60%)]"
              >
                View on Google Maps &rarr;
              </a>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              DIRECT CHANNELS
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <p className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Phone</span>
                <a href="tel:+918130856575" className="hover:text-white transition-colors text-foreground">
                  +91 8130856575
                </a>
              </p>
              <p className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">WhatsApp</span>
                <a href="https://wa.me/918130856575" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-foreground">
                  Connect on WhatsApp
                </a>
              </p>
              <p className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Email</span>
                <a href={`mailto:${BUSINESS_CONTACT.supportEmail}`} className="hover:text-white transition-colors text-foreground text-right break-all">
                  {BUSINESS_CONTACT.supportEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              OPERATING HOURS
            </h3>
            <div className="space-y-2 font-mono text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>{BUSINESS_CONTACT.businessDays}</span>
                <span className="text-foreground">{BUSINESS_CONTACT.businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry form (Right) */}
        <div className="qls-card lg:col-span-7 p-6 md:p-8 relative">
          <span className="text-xs font-mono uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold mb-6 block select-none">
            INQUIRY FORM
          </span>

          {status === 'success' ? (
            <MotionPresencePanel className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">
                Inquiry Logged
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-sm mx-auto uppercase">
                Your details are saved. Continue in WhatsApp to send your message.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qls-button qls-button-primary"
                >
                  Continue in WhatsApp
                </a>
                <button
                  onClick={() => {
                    setFormData({ name: '', email: '', phone: '', interest: 'Smart Home', message: '' });
                    setTouched({ name: false, email: false, phone: false, message: false });
                    setStatus('idle');
                  }}
                  className="qls-button qls-button-secondary cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            </MotionPresencePanel>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-sm text-xs font-mono text-red-400 flex justify-between items-start gap-4">
                  <span>Error: {errorMessage}</span>
                  <button type="button" onClick={() => setStatus('idle')} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">âœ•</button>
                </div>
              )}

              {/* Name field */}
              <div>
                <label htmlFor="name" className="qls-label">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  disabled={status === 'submitting'}
                  value={formData.name}
                  onBlur={() => handleBlur('name')}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`qls-field ${
                    touched.name && errors.name
                      ? 'border-red-900/80 focus:border-red-500'
                      : 'border-zinc-800 focus:border-zinc-550'
                  }`}
                />
                {touched.name && errors.name && (
                  <p className="text-[10px] font-mono text-red-400 mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="qls-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={status === 'submitting'}
                    value={formData.email}
                    onBlur={() => handleBlur('email')}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`qls-field ${
                      touched.email && errors.email
                        ? 'border-red-900/80 focus:border-red-500'
                        : 'border-zinc-800 focus:border-zinc-550'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-[10px] font-mono text-red-400 mt-1.5">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="qls-label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    disabled={status === 'submitting'}
                    value={formData.phone}
                    onBlur={() => handleBlur('phone')}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`qls-field ${
                      touched.phone && errors.phone
                        ? 'border-red-900/80 focus:border-red-500'
                        : 'border-zinc-800 focus:border-zinc-550'
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-[10px] font-mono text-red-400 mt-1.5">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Interest */}
              <div>
                <label htmlFor="interest" className="qls-label">
                  Interest / Project Type
                </label>
                <select
                  id="interest"
                  disabled={status === 'submitting'}
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="qls-field"
                >
                  <option value="Smart Home">Smart Home</option>
                  <option value="Lighting Automation">Lighting Automation</option>
                  <option value="Curtains & Blinds">Curtains & Blinds</option>
                  <option value="Climate Control">Climate Control</option>
                  <option value="Security & Surveillance">Security & Surveillance</option>
                  <option value="Audio / Video">Audio / Video</option>
                  <option value="Commercial Automation">Commercial Automation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="qls-label">
                  Project Details / Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  disabled={status === 'submitting'}
                  value={formData.message}
                  onBlur={() => handleBlur('message')}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`qls-field resize-none ${
                    touched.message && errors.message
                      ? 'border-red-900/80 focus:border-red-500'
                      : 'border-zinc-800 focus:border-zinc-550'
                  }`}
                />
                {touched.message && errors.message && (
                  <p className="text-[10px] font-mono text-red-400 mt-1.5">{errors.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="qls-button qls-button-primary w-full disabled:opacity-45 flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === 'submitting' && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {status === 'submitting' ? 'Saving details...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </MotionReveal>
    </div>
  );
}
