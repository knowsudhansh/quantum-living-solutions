'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Check, Loader2, Upload } from 'lucide-react';
import { useToast } from '../utils/toast';
import { MotionPresencePanel } from '../ui/motion';

type CareerApplicationFormProps = {
  role: string;
  positionSlug: string;
  compact?: boolean;
  introMessage?: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: string;
  currentCompany: string;
  portfolioUrl: string;
  linkedinUrl: string;
  skills: string;
  availability: string;
  message: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  location: '',
  experienceYears: '',
  currentCompany: '',
  portfolioUrl: '',
  linkedinUrl: '',
  skills: '',
  availability: '',
  message: '',
};

const MAX_RESUME_SIZE = 4 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^\+?[0-9\s\-()]{10,18}$/.test(phone);
}

function isValidOptionalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidResume(file: File | null) {
  if (!file) return 'Resume is required.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtension = extension === 'pdf' || extension === 'doc' || extension === 'docx';
  if (!ALLOWED_RESUME_TYPES.includes(file.type) && !allowedExtension) return 'Upload a PDF, DOC, or DOCX resume.';
  if (file.size > MAX_RESUME_SIZE) return 'Resume must be 4MB or smaller.';
  return '';
}

export function CareerApplicationForm({ role, positionSlug, compact = false, introMessage }: CareerApplicationFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const errors = useMemo(() => ({
    name: formData.name.trim().length < 2 ? 'Enter your full name.' : '',
    email: !isValidEmail(formData.email.trim()) ? 'Enter a valid email address.' : '',
    phone: !isValidPhone(formData.phone.trim()) ? 'Enter a valid phone number.' : '',
    location: !compact && formData.location.trim().length < 2 ? 'Enter your city or preferred work location.' : '',
    experienceYears:
      !compact && (formData.experienceYears === '' || Number(formData.experienceYears) < 0)
        ? 'Enter years of experience.'
        : '',
    portfolioUrl: !isValidOptionalUrl(formData.portfolioUrl) ? 'Enter a valid portfolio URL starting with http:// or https://.' : '',
    linkedinUrl: !isValidOptionalUrl(formData.linkedinUrl) ? 'Enter a valid LinkedIn URL starting with http:// or https://.' : '',
    message: compact
      ? ''
      : formData.message.trim().length < 20
        ? 'Share at least 20 characters about your experience.'
        : '',
    resume: isValidResume(resume),
  }), [compact, formData, resume]);

  const isValid = Object.values(errors).every((value) => value === '');

  const update = (field: keyof FormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setFormData(initialState);
    setResume(null);
    setSubmitted(false);
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isValid) {
      showToast(Object.values(errors).find(Boolean) || 'Please complete the application.', 'error');
      return;
    }

    const payload = new FormData();
    payload.set('role', role);
    payload.set('positionSlug', positionSlug);
    payload.set('source', compact ? 'OTHER_OPPORTUNITY_MODAL' : 'IOT_EXPERT_PAGE');
    Object.entries(formData).forEach(([key, value]) => payload.set(key, value));
    if (resume) payload.set('resume', resume);

    setSubmitting(true);
    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to submit application');

      setSubmitted(true);
      showToast('Application submitted successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit application';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <MotionPresencePanel className="border border-emerald-900/50 bg-emerald-950/15 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-800/70 bg-emerald-950/40 text-emerald-300">
          <Check className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-light text-white">Application Received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-foreground/70">
          Thank you for applying. If your profile matches the requirement, our team will contact you shortly.
        </p>
        <button type="button" onClick={reset} className="qls-button qls-button-secondary mt-6">
          Submit Another
        </button>
      </MotionPresencePanel>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {introMessage && (
        <div className="border border-[color:var(--gold)]/35 bg-[color:var(--gold)]/10 p-4 text-sm leading-7 text-foreground/80">
          {introMessage}
        </div>
      )}

      {error && (
        <div className="border border-red-900/60 bg-red-950/20 p-4 text-xs font-mono text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={`${positionSlug}-name`} className="qls-label">Full Name</label>
          <input id={`${positionSlug}-name`} className="qls-field" value={formData.name} onChange={(event) => update('name', event.target.value)} required />
        </div>
        <div>
          <label htmlFor={`${positionSlug}-email`} className="qls-label">Email Address</label>
          <input id={`${positionSlug}-email`} type="email" className="qls-field" value={formData.email} onChange={(event) => update('email', event.target.value)} required />
        </div>
        <div>
          <label htmlFor={`${positionSlug}-phone`} className="qls-label">Phone Number</label>
          <input id={`${positionSlug}-phone`} type="tel" className="qls-field" value={formData.phone} onChange={(event) => update('phone', event.target.value)} required />
        </div>
        {!compact && (
          <div>
            <label htmlFor={`${positionSlug}-location`} className="qls-label">Current Location</label>
            <input id={`${positionSlug}-location`} className="qls-field" value={formData.location} onChange={(event) => update('location', event.target.value)} required />
          </div>
        )}
      </div>

      {!compact && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor={`${positionSlug}-experience`} className="qls-label">Experience Years</label>
              <input id={`${positionSlug}-experience`} type="number" min="0" max="60" className="qls-field" value={formData.experienceYears} onChange={(event) => update('experienceYears', event.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${positionSlug}-company`} className="qls-label">Current Company</label>
              <input id={`${positionSlug}-company`} className="qls-field" value={formData.currentCompany} onChange={(event) => update('currentCompany', event.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor={`${positionSlug}-skills`} className="qls-label">Key Skills</label>
            <input id={`${positionSlug}-skills`} className="qls-field" placeholder="Zigbee, KNX, WiFi cameras, sensors, commissioning..." value={formData.skills} onChange={(event) => update('skills', event.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor={`${positionSlug}-portfolio`} className="qls-label">Portfolio / Website <span className="text-zinc-500">(Optional)</span></label>
              <input id={`${positionSlug}-portfolio`} type="text" inputMode="url" className="qls-field" value={formData.portfolioUrl} onChange={(event) => update('portfolioUrl', event.target.value)} />
              {errors.portfolioUrl && <p className="mt-2 text-[10px] font-mono text-red-400">{errors.portfolioUrl}</p>}
            </div>
            <div>
              <label htmlFor={`${positionSlug}-linkedin`} className="qls-label">LinkedIn Profile <span className="text-zinc-500">(Optional)</span></label>
              <input id={`${positionSlug}-linkedin`} type="text" inputMode="url" className="qls-field" value={formData.linkedinUrl} onChange={(event) => update('linkedinUrl', event.target.value)} />
              {errors.linkedinUrl && <p className="mt-2 text-[10px] font-mono text-red-400">{errors.linkedinUrl}</p>}
            </div>
          </div>

          <div>
            <label htmlFor={`${positionSlug}-availability`} className="qls-label">Availability</label>
            <select id={`${positionSlug}-availability`} className="qls-field" value={formData.availability} onChange={(event) => update('availability', event.target.value)}>
              <option value="">Select availability</option>
              <option value="Immediate">Immediate</option>
              <option value="Within 15 days">Within 15 days</option>
              <option value="Within 30 days">Within 30 days</option>
              <option value="Project-based only">Project-based only</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label htmlFor={`${positionSlug}-message`} className="qls-label">
          {compact ? 'Message' : 'Professional Summary'}
        </label>
        <textarea
          id={`${positionSlug}-message`}
          rows={compact ? 3 : 5}
          className="qls-field resize-none"
          value={formData.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder={compact ? 'Tell us what kind of opportunity fits you.' : 'Tell us about automation systems you have installed, programmed, commissioned, or supported.'}
          required={!compact}
        />
      </div>

      <div>
        <label htmlFor={`${positionSlug}-resume`} className="qls-label">Resume Upload</label>
        <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-zinc-700 bg-zinc-950/40 p-6 text-center transition-colors hover:border-[color:var(--gold-bright)]">
          <Upload className="h-6 w-6 text-[color:var(--gold-bright)]" aria-hidden="true" />
          <span className="mt-3 text-sm text-white">{resume ? resume.name : 'Upload PDF, DOC, or DOCX resume'}</span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Maximum 4MB</span>
          <input
            id={`${positionSlug}-resume`}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => setResume(event.target.files?.[0] ?? null)}
            required
          />
        </label>
        {errors.resume && <p className="mt-2 text-[10px] font-mono text-red-400">{errors.resume}</p>}
      </div>

      <button type="submit" disabled={submitting} className="qls-button qls-button-primary w-full justify-center disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {submitting ? 'Submitting Application...' : 'Submit Application'}
      </button>
    </form>
  );
}
