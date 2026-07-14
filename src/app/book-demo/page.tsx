'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MotionPresencePanel, MotionReveal } from '../../components/ui/motion';
import { useToast } from '../../components/utils/toast';
import { PRIVATE_SITE_VISIT } from '../../lib/config/business';

type Step = 1 | 2 | 3;
type AutomationCategory = 'Home Automation' | 'Industrial Automation' | 'Creative Automation';

interface DemoSlotData {
  id: string;
  startTime: string;
  endTime: string;
}

const automationOptions: Record<Exclude<AutomationCategory, 'Creative Automation'>, string[]> = {
  'Home Automation': [
    'Lighting Automation',
    'Curtains & Blinds',
    'Climate Control',
    'Security & Surveillance',
    'Audio / Video',
    'Energy Management',
  ],
  'Industrial Automation': [
    'Automatic Changeover Switch',
    'Genset Automation',
    'Power Management',
    'Source Selector',
    'Solar Liability Management',
  ],
};

export default function BookDemoPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [automationCategory, setAutomationCategory] = useState<AutomationCategory | null>(null);
  const [automationSelections, setAutomationSelections] = useState<string[]>([]);
  const [creativeRequirement, setCreativeRequirement] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' });
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, location: false, creativeRequirement: false });
  const [stepError, setStepError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [slots, setSlots] = useState<DemoSlotData[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

  useEffect(() => {
    fetch('/api/book-demo/slots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.slots) {
          setSlots(data.slots);
          if (data.slots.length > 0) setSelectedSlotId(data.slots[0].id);
        }
      })
      .catch(() => setErrorMessage('Unable to load available visit dates. Please try again shortly.'));
  }, []);

  const errors = useMemo(() => ({
    name: formData.name.trim().length < 2 ? 'Name must be at least 2 characters.' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Enter a valid email address.' : '',
    phone: !/^\+?[0-9\s\-()]{10,15}$/.test(formData.phone) ? 'Enter a valid phone number.' : '',
    location: formData.location.trim().length < 3 ? 'Enter the site location.' : '',
    creativeRequirement: automationCategory === 'Creative Automation' && creativeRequirement.trim().length < 10
      ? 'Describe your automation requirement in at least 10 characters.'
      : '',
  }), [automationCategory, creativeRequirement, formData]);

  const selectionIsValid = automationCategory === 'Creative Automation'
    ? !errors.creativeRequirement
    : automationSelections.length > 0;

  const toggleSelection = (option: string) => {
    setAutomationSelections((current) => current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]);
  };

  const handleCategoryChange = (category: AutomationCategory) => {
    setAutomationCategory(category);
    setAutomationSelections([]);
    setCreativeRequirement('');
    setStepError('');
  };

  const handleNextStep = () => {
    if (step === 1 && !automationCategory) {
      setStepError('Choose an automation category to continue.');
      return;
    }
    if (step === 2 && !selectionIsValid) {
      setTouched((current) => ({ ...current, creativeRequirement: true }));
      setStepError(automationCategory === 'Creative Automation'
        ? 'Describe your automation requirement before continuing.'
        : 'Select at least one automation requirement before continuing.');
      return;
    }
    setStepError('');
    setStep((current) => (current + 1) as Step);
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const resetForm = () => {
    setStep(1);
    setAutomationCategory(null);
    setAutomationSelections([]);
    setCreativeRequirement('');
    setFormData({ name: '', email: '', phone: '', location: '' });
    setTouched({ name: false, email: false, phone: false, location: false, creativeRequirement: false });
    setStepError('');
    setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, email: true, phone: true, location: true, creativeRequirement: true });

    if (!automationCategory || !selectionIsValid || !selectedSlotId || Object.values(errors).some(Boolean)) {
      const message = !selectedSlotId
        ? 'Select an available visit date and time.'
        : 'Please complete the required booking details.';
      setErrorMessage(message);
      setStatus('error');
      showToast(message, 'error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
      const slotTimeText = selectedSlot
        ? new Date(selectedSlot.startTime).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
        : 'N/A';
      const requestDetail = automationCategory === 'Creative Automation'
        ? creativeRequirement.trim()
        : automationSelections.join(', ');

      const response = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          automationCategory,
          automationSelections,
          creativeRequirement: automationCategory === 'Creative Automation' ? creativeRequirement : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to book the private site visit.');
      }

      const details = [
        `Name: ${formData.name}`,
        `Phone: ${formData.phone}`,
        `Email: ${formData.email}`,
        `Location: ${formData.location}`,
        `Automation Category: ${automationCategory}`,
        `Requirement: ${requestDetail}`,
        `Preferred Visit: ${slotTimeText}`,
        `Visit Charge: ${PRIVATE_SITE_VISIT.priceLabel}`,
      ].join('\n');
      setWhatsappUrl(`https://wa.me/918130856575?text=${encodeURIComponent(`Hello Quantum Living Solutions,\n\nI would like to request a ${PRIVATE_SITE_VISIT.label}.\n\n${details}`)}`);
      setStatus('success');
      showToast('Private site visit request logged successfully.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setErrorMessage(message);
      setStatus('error');
      showToast(message, 'error');
    }
  };

  return (
    <div className="qls-page max-w-5xl">
      <MotionReveal className="qls-hero text-center md:text-left">
        <span className="qls-eyebrow">PRIVATE SITE VISIT</span>
        <h1 className="qls-title mb-5">Plan Your Visit</h1>
        <p className="qls-lead mx-auto md:mx-0">
          Share your automation requirements and choose a convenient consultation time with our engineering team.
        </p>
        <div className="mt-6 inline-flex flex-col border-l-2 border-[HSL(35,30%,45%)] pl-4 text-left">
          <span className="font-mono text-sm text-[HSL(35,30%,62%)]">{PRIVATE_SITE_VISIT.label} · {PRIVATE_SITE_VISIT.priceLabel}</span>
          <span className="mt-1 max-w-xl text-xs leading-relaxed text-foreground/65">{PRIVATE_SITE_VISIT.adjustmentNote}</span>
        </div>
      </MotionReveal>

      <div className="max-w-md mx-auto mb-12 select-none" aria-label={`Booking step ${step} of 3`}>
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-800 -translate-y-1/2" />
          {[1, 2, 3].map((number) => {
            const isComplete = step > number || status === 'success';
            const isActive = step === number && status === 'idle';
            return <div key={number} className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono ${isComplete ? 'border-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)] text-white' : isActive ? 'border-[HSL(210,80%,60%)] bg-zinc-950 text-[HSL(210,80%,60%)]' : 'border-zinc-800 bg-zinc-950 text-zinc-500'}`}>0{number}</div>;
          })}
        </div>
        <div className="mt-2 flex justify-between px-1 text-[10px] font-mono text-zinc-500"><span>CATEGORY</span><span>REQUIREMENTS</span><span>CONTACT</span></div>
      </div>

      <MotionReveal className="qls-card relative mx-auto max-w-2xl p-6 md:p-8">
        {status === 'success' ? (
          <MotionPresencePanel className="space-y-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-900/60 bg-emerald-950/40 text-emerald-400">✓</div>
            <h2 className="text-2xl font-light text-foreground tracking-tight">Private Site Visit Requested</h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">
              Your preferred time has been reserved. The visit charge is {PRIVATE_SITE_VISIT.priceLabel}. {PRIVATE_SITE_VISIT.adjustmentNote}
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="qls-button qls-button-primary">Continue in WhatsApp</a>
              <button type="button" onClick={resetForm} className="qls-button qls-button-secondary cursor-pointer">Submit Another</button>
            </div>
          </MotionPresencePanel>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {status === 'error' && <div className="flex items-start justify-between gap-4 border border-red-900/60 bg-red-950/20 p-4 text-xs font-mono text-red-400"><span>{errorMessage}</span><button type="button" onClick={() => setStatus('idle')} className="cursor-pointer text-zinc-500 hover:text-white" aria-label="Dismiss error">×</button></div>}
            {stepError && <p className="text-xs font-mono text-red-400" role="alert">{stepError}</p>}

            {step === 1 && (
              <section className="space-y-6" aria-labelledby="category-title">
                <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[HSL(210,80%,60%)]">Step 01 — Choose Category</span>
                <h2 id="category-title" className="text-xl font-light text-foreground">Choose automation category</h2>
                <div className="space-y-3">
                  {(['Home Automation', 'Industrial Automation', 'Creative Automation'] as AutomationCategory[]).map((category) => (
                    <button key={category} type="button" onClick={() => handleCategoryChange(category)} className={`w-full rounded-sm border p-4 text-left text-xs font-mono uppercase tracking-wider transition-colors ${automationCategory === category ? 'border-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/10 text-[HSL(35,30%,62%)]' : 'border-zinc-800 text-foreground/75 hover:border-zinc-700'}`} aria-pressed={automationCategory === category}>{category}</button>
                  ))}
                </div>
                <button type="button" onClick={handleNextStep} className="qls-button qls-button-primary w-full cursor-pointer">Continue</button>
              </section>
            )}

            {step === 2 && automationCategory && (
              <section className="space-y-6" aria-labelledby="requirements-title">
                <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[HSL(210,80%,60%)]">Step 02 — Requirements</span>
                <h2 id="requirements-title" className="text-xl font-light text-foreground">{automationCategory === 'Creative Automation' ? 'Describe your automation requirement' : 'Select the systems you need'}</h2>
                {automationCategory === 'Creative Automation' ? (
                  <div>
                    <label htmlFor="creative-requirement" className="qls-label">Describe Your Automation Requirement</label>
                    <textarea id="creative-requirement" rows={7} required value={creativeRequirement} onBlur={() => handleBlur('creativeRequirement')} onChange={(event) => { setCreativeRequirement(event.target.value); setStepError(''); }} placeholder={'Tell us your idea...\nExplain your requirement...\nMention your goals...\nUpload references during consultation.'} className={`qls-field resize-none ${touched.creativeRequirement && errors.creativeRequirement ? 'border-red-900/80 focus:border-red-500' : ''}`} />
                    {touched.creativeRequirement && errors.creativeRequirement && <p className="mt-1.5 text-[10px] font-mono text-red-400">{errors.creativeRequirement}</p>}
                  </div>
                ) : (
                  <fieldset className="space-y-3">
                    <legend className="sr-only">{automationCategory} systems</legend>
                    {automationOptions[automationCategory].map((option) => <label key={option} className="flex cursor-pointer items-center gap-3 rounded-sm border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-zinc-700"><input type="checkbox" checked={automationSelections.includes(option)} onChange={() => { toggleSelection(option); setStepError(''); }} className="h-4 w-4 rounded-sm border-zinc-700 bg-zinc-950" />{option}</label>)}
                  </fieldset>
                )}
                <div className="flex gap-4"><button type="button" onClick={() => setStep(1)} className="qls-button qls-button-secondary w-1/3 cursor-pointer">Back</button><button type="button" onClick={handleNextStep} className="qls-button qls-button-primary w-2/3 cursor-pointer">Continue</button></div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6" aria-labelledby="contact-title">
                <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[HSL(210,80%,60%)]">Step 03 — Contact & Scheduling</span>
                <h2 id="contact-title" className="text-xl font-light text-foreground">Choose a time and share the site details</h2>
                <div className="border-l-2 border-[HSL(35,30%,45%)] bg-[HSL(35,30%,45%)]/5 px-4 py-3 text-sm text-foreground/85"><span className="font-medium text-[HSL(35,30%,62%)]">{PRIVATE_SITE_VISIT.priceLabel}</span><span className="mx-2 text-zinc-600">·</span>{PRIVATE_SITE_VISIT.adjustmentNote}</div>
                <div>
                  <label htmlFor="slot" className="qls-label">Available Private Site Visit Dates</label>
                  {slots.length === 0 ? <div className="qls-empty py-6 text-xs font-mono text-zinc-500">No future visit times are currently scheduled. Please check back later.</div> : <select id="slot" required value={selectedSlotId} onChange={(event) => setSelectedSlotId(event.target.value)} className="qls-field">{slots.map((slot) => <option key={slot.id} value={slot.id}>{new Date(slot.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</option>)}</select>}
                </div>
                <div><label htmlFor="name" className="qls-label">Name</label><input id="name" required value={formData.name} onBlur={() => handleBlur('name')} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className={`qls-field ${touched.name && errors.name ? 'border-red-900/80 focus:border-red-500' : ''}`} />{touched.name && errors.name && <p className="mt-1.5 text-[10px] font-mono text-red-400">{errors.name}</p>}</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="email" className="qls-label">Email Address</label><input id="email" type="email" required value={formData.email} onBlur={() => handleBlur('email')} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className={`qls-field ${touched.email && errors.email ? 'border-red-900/80 focus:border-red-500' : ''}`} />{touched.email && errors.email && <p className="mt-1.5 text-[10px] font-mono text-red-400">{errors.email}</p>}</div><div><label htmlFor="phone" className="qls-label">Phone Number</label><input id="phone" type="tel" required value={formData.phone} onBlur={() => handleBlur('phone')} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className={`qls-field ${touched.phone && errors.phone ? 'border-red-900/80 focus:border-red-500' : ''}`} />{touched.phone && errors.phone && <p className="mt-1.5 text-[10px] font-mono text-red-400">{errors.phone}</p>}</div></div>
                <div><label htmlFor="location" className="qls-label">Site Location</label><textarea id="location" rows={3} required value={formData.location} onBlur={() => handleBlur('location')} onChange={(event) => setFormData({ ...formData, location: event.target.value })} placeholder="Area, city and site address" className={`qls-field resize-none ${touched.location && errors.location ? 'border-red-900/80 focus:border-red-500' : ''}`} />{touched.location && errors.location && <p className="mt-1.5 text-[10px] font-mono text-red-400">{errors.location}</p>}</div>
                <div className="flex gap-4"><button type="button" disabled={status === 'submitting'} onClick={() => setStep(2)} className="qls-button qls-button-secondary w-1/3 cursor-pointer disabled:opacity-45">Back</button><button type="submit" disabled={status === 'submitting' || slots.length === 0} className="qls-button qls-button-primary flex w-2/3 items-center justify-center gap-2 cursor-pointer disabled:opacity-45">{status === 'submitting' ? 'Reserving visit...' : `Request Visit · ${PRIVATE_SITE_VISIT.priceLabel}`}</button></div>
              </section>
            )}
          </form>
        )}
      </MotionReveal>
    </div>
  );
}
