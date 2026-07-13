'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../components/utils/toast';
import { MotionReveal, MotionPresencePanel } from '../../components/ui/motion';

type Step = 1 | 2 | 3;

interface DemoSlotData {
  id: string;
  startTime: string;
  endTime: string;
}

export default function BookDemoPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [interest, setInterest] = useState<string>('Home Automation');
  const [projectType, setProjectType] = useState<string>('Residence');

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const [slots, setSlots] = useState<DemoSlotData[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  useEffect(() => {
    fetch('/api/book-demo/slots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.slots) {
          setSlots(data.slots);
          if (data.slots.length > 0) {
            setSelectedSlotId(data.slots[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load slots', err));
  }, []);

  // Inline Validation
  const errors = useMemo(() => {
    return {
      name: formData.name.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email address.' : '',
      phone: !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone) ? 'Enter a valid phone number.' : '',
    };
  }, [formData]);

  const isFormValid = useMemo(() => {
    return Object.values(errors).every((err) => err === '');
  }, [errors]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleNextStep = () => {
    setStep((prev) => (prev + 1) as Step);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });

    if (!selectedSlotId) {
      setErrorMessage('Please select a demonstration time slot');
      setStatus('error');
      showToast('Please select a demonstration time slot.', 'error');
      return;
    }

    if (!isFormValid) {
      showToast('Please correct form errors before booking.', 'error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const selectedSlot = slots.find((s) => s.id === selectedSlotId);
      const slotTimeText = selectedSlot
        ? new Date(selectedSlot.startTime).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
        : 'N/A';

      const payload = {
        slotId: selectedSlotId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest,
        notes: formData.message,
      };

      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Failed to complete booking');
      }

      // Construct pre-filled WhatsApp message
      const baseText = `Hello Quantum Living Solutions,\n\nI would like to request a showroom demo and consultation.`;
      const details = `\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nSelected Subsystem: ${interest}\nProject Type: ${projectType}\nScheduled Time: ${slotTimeText}\nNotes: ${formData.message || 'None'}\n\nSource: Quantum Living Solutions Website Demo Request`;
      const fullMessage = encodeURIComponent(baseText + details);
      const url = `https://wa.me/918130856575?text=${fullMessage}`;

      setWhatsappUrl(url);
      setStatus('success');
      showToast('Demo booking request logged successfully!', 'success');
      window.open(url, '_blank');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(msg);
      setStatus('error');
      showToast(msg, 'error');
    }
  };

  const interests = [
    'Home Automation',
    'Lighting Automation',
    'Curtains & Blinds',
    'Climate Control',
    'Security & Surveillance',
    'Audio / Video',
    'Energy Management',
  ];

  return (
    <div className="qls-page max-w-5xl">
      <MotionReveal className="qls-hero text-center md:text-left">
        <span className="qls-eyebrow">
          SHOWROOM DEMONSTRATION
        </span>
        <h1 className="qls-title mb-5">
          Request a Consultation
        </h1>
        <p className="qls-lead mx-auto md:mx-0">
          Select your automation interests below to configure a direct consultation request. We will coordinate details with you on WhatsApp.
        </p>
      </MotionReveal>

      {/* Progress timeline bar */}
      <div className="max-w-md mx-auto mb-12 select-none">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-zinc-800 -translate-y-1/2 z-0" />

          {[1, 2, 3].map((num) => {
            const isCompleted = step > num || status === 'success';
            const isActive = step === num && status === 'idle';
            return (
              <div
                key={num}
                className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[HSL(35,30%,45%)] border-[HSL(35,30%,45%)] text-white'
                    : isActive
                    ? 'bg-zinc-950 border-[HSL(210,80%,60%)] text-[HSL(210,80%,60%)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                0{num}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2 px-1">
          <span>INTEREST</span>
          <span>PROJECT</span>
          <span>CONTACT</span>
        </div>
      </div>

      <MotionReveal className="qls-card p-6 md:p-8 max-w-2xl mx-auto relative">
        {status === 'success' ? (
          <MotionPresencePanel className="py-12 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-foreground tracking-tight">
              Request Ready
            </h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-sm mx-auto uppercase">
              Your session time slot is saved. Continue in WhatsApp to send details.
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
                  setFormData({ name: '', email: '', phone: '', message: '' });
                  setTouched({ name: false, email: false, phone: false });
                  setStep(1);
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
            {/* STEP 1: Interest */}
            {step === 1 && (
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold block select-none">
                  STEP 01 — SELECT INTEREST
                </span>
                <h2 className="text-xl font-light text-foreground mb-4">
                  What subsystems are you planning?
                </h2>
                <div className="flex flex-col gap-3">
                  {interests.map((item) => {
                    const isSelected = interest === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setInterest(item)}
                        className={`w-full text-left p-4 rounded border text-xs font-mono tracking-wider uppercase transition-all duration-200 outline-none cursor-pointer ${
                          isSelected
                            ? 'border-[HSL(35,30%,45%)] text-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/5 font-semibold'
                            : 'border-zinc-800 text-foreground/75 hover:border-zinc-700'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="qls-button qls-button-primary w-full cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2: Project Type */}
            {step === 2 && (
              <div className="space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold block select-none">
                  STEP 02 — SELECT PROJECT TYPE
                </span>
                <h2 className="text-xl font-light text-foreground mb-4">
                  What is the scale of the environment?
                </h2>
                <div className="flex flex-col gap-3">
                  {['Residence', 'Workspace / Commercial', 'Other'].map((type) => {
                    const isSelected = projectType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectType(type)}
                        className={`w-full text-left p-4 rounded border text-xs font-mono tracking-wider uppercase transition-all duration-200 outline-none cursor-pointer ${
                          isSelected
                            ? 'border-[HSL(35,30%,45%)] text-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/5 font-semibold'
                            : 'border-zinc-800 text-foreground/75 hover:border-zinc-700'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="qls-button qls-button-secondary w-1/3 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="qls-button qls-button-primary w-2/3 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Contact details & Slot Selector */}
            {step === 3 && (
              <div className="space-y-6 animate-act-fade-in">
                <span className="text-xs font-mono uppercase tracking-widest text-[HSL(210,80%,60%)] font-semibold block select-none">
                  STEP 03 — CONTACT & SCHEDULING
                </span>
                <h2 className="text-xl font-light text-foreground mb-4">
                  Select a time and provide details
                </h2>

                {status === 'error' && (
                  <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-sm text-xs font-mono text-red-400 flex justify-between items-center gap-4">
                    <span>Error: {errorMessage}</span>
                    <button type="button" onClick={() => setStatus('idle')} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">✕</button>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="slot" className="qls-label">
                      Available Showroom Time Slots
                    </label>
                    {slots.length === 0 ? (
                      <div className="qls-empty py-6 text-xs font-mono text-zinc-500">
                        No future slots currently scheduled. Please check back later.
                      </div>
                    ) : (
                      <select
                        id="slot"
                        required
                        disabled={status === 'submitting'}
                        value={selectedSlotId}
                        onChange={(e) => setSelectedSlotId(e.target.value)}
                        className="qls-field"
                      >
                        {slots.map((s) => {
                          const dateStr = new Date(s.startTime).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          });
                          return (
                            <option key={s.id} value={s.id}>
                              {dateStr}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
                    <label htmlFor="message" className="qls-label">
                      Additional details (Optional)
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      disabled={status === 'submitting'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="qls-field resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={status === 'submitting'}
                    onClick={handlePrevStep}
                    className="qls-button qls-button-secondary w-1/3 disabled:opacity-45 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'submitting' || slots.length === 0}
                    className="qls-button qls-button-primary w-2/3 disabled:opacity-45 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {status === 'submitting' && (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {status === 'submitting' ? 'Reserving slot...' : 'Book Demo & WhatsApp \u2192'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </MotionReveal>
    </div>
  );
}
