'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '../../components/utils/toast';
import { MotionReveal, MotionPresencePanel } from '../../components/ui/motion';

export default function CareersPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'Installer', message: '', resumeUrl: '' });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, message: false, resumeUrl: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Dynamic Inline Validation
  const errors = useMemo(() => {
    return {
      name: formData.name.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email address.' : '',
      phone: !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone) ? 'Enter a valid phone number.' : '',
      resumeUrl: !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.resumeUrl) ? 'Enter a valid URL (https://...).' : '',
      message: formData.message.trim().length < 15 ? 'Experience summary must be at least 15 characters.' : '',
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

    setTouched({ name: true, email: true, phone: true, message: true, resumeUrl: true });

    if (!isFormValid) {
      showToast('Please correct form errors before submitting.', 'error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to submit application');
      }

      setStatus('success');
      showToast('Application submitted successfully!', 'success');
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
          JOIN OUR TEAM
        </span>
        <h1 className="qls-title mb-5">
          Careers & Open Opportunities
        </h1>
        <p className="qls-lead">
          We are always looking to connect with skilled automation integrators, low-voltage electricians, and designers who share our passion for premium smart living systems.
        </p>
      </MotionReveal>

      <MotionReveal className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
        {/* Recruitment copy (Left) */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              WHO WE ARE LOOKING FOR
            </h3>
            <p className="text-base text-foreground/80 leading-relaxed font-normal mb-4">
              At Quantum Living Solutions, we focus on delivering dependable smart home and commercial automation setups. Our technical team values quality, precision wiring, and customer care.
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed font-normal">
              If you have experience in programming control processors, setting up motorized window shading grids, configuring dynamic lighting loops, or running architectural audio/video matrix cabling, we want to hear from you.
            </p>
          </div>

          <div className="border-t border-zinc-800/80 pt-8">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 select-none">
              GENERAL INTAKE DIRECTORY
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed font-normal mb-4">
              If you prefer to submit your credentials directly without using the form, send your cover letter and CV to:
            </p>
            <p className="font-mono text-sm">
              <a href="mailto:rajkumarsharma@quantumlivingsolutions.com" className="text-[HSL(210,80%,60%)] hover:text-white transition-colors">
                rajkumarsharma@quantumlivingsolutions.com
              </a>
            </p>
          </div>
        </div>

        {/* Application Form (Right) */}
        <div className="qls-card lg:col-span-7 p-6 md:p-8 relative">
          <span className="text-xs font-mono uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold mb-6 block select-none">
            EXPRESSION OF INTEREST
          </span>

          {status === 'success' ? (
            <MotionPresencePanel className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">
                Submission Received
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-sm mx-auto uppercase">
                Thank you for expressing interest. Our management team will review your application soon.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setFormData({ name: '', email: '', phone: '', role: 'Installer', message: '', resumeUrl: '' });
                    setTouched({ name: false, email: false, phone: false, message: false, resumeUrl: false });
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
                  <button type="button" onClick={() => setStatus('idle')} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">✕</button>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="applicant-name" className="qls-label">
                  Full Name
                </label>
                <input
                  id="applicant-name"
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
                  <label htmlFor="applicant-email" className="qls-label">
                    Email Address
                  </label>
                  <input
                    id="applicant-email"
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
                  <label htmlFor="applicant-phone" className="qls-label">
                    Phone Number
                  </label>
                  <input
                    id="applicant-phone"
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

              {/* Area of Expertise */}
              <div>
                <label htmlFor="role" className="qls-label">
                  Area of Expertise
                </label>
                <select
                  id="role"
                  disabled={status === 'submitting'}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="qls-field"
                >
                  <option value="Installer">Low-Voltage Installer & Cable Specialist</option>
                  <option value="Programmer">Smart Home Control Programmer</option>
                  <option value="Electrician">Licensed Automation Electrician</option>
                  <option value="Sales">Consultant / Account Lead</option>
                </select>
              </div>

              {/* Resume URL */}
              <div>
                <label htmlFor="resume" className="qls-label">
                  Resume Link / Portfolio Link (Dropbox, Drive, LinkedIn, etc.)
                </label>
                <input
                  id="resume"
                  type="url"
                  required
                  placeholder="https://..."
                  disabled={status === 'submitting'}
                  value={formData.resumeUrl}
                  onBlur={() => handleBlur('resumeUrl')}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className={`qls-field ${
                    touched.resumeUrl && errors.resumeUrl
                      ? 'border-red-900/80 focus:border-red-500'
                      : 'border-zinc-800 focus:border-zinc-550'
                  }`}
                />
                {touched.resumeUrl && errors.resumeUrl && (
                  <p className="text-[10px] font-mono text-red-400 mt-1.5">{errors.resumeUrl}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="qls-label">
                  Tell Us About Your Experience
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
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
                {status === 'submitting' ? 'Uploading portfolio...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </MotionReveal>
    </div>
  );
}
