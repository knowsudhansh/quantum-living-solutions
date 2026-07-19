'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CareerApplicationForm } from './career-application-form';
import { otherOpportunity } from '../../lib/config/careers';

type OtherOpportunitiesModalProps = {
  open: boolean;
  onClose: () => void;
};

export function OtherOpportunitiesModal({ open, onClose }: OtherOpportunitiesModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="other-opportunities-title" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-zinc-800 bg-[HSL(220,25%,7%)] p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="qls-eyebrow">Career Intake</span>
            <h2 id="other-opportunities-title" className="text-3xl font-light text-white">
              {otherOpportunity.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-foreground/70">{otherOpportunity.summary}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm border border-zinc-800 p-2 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white" aria-label="Close other opportunities form">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <CareerApplicationForm
          role={otherOpportunity.title}
          positionSlug={otherOpportunity.slug}
          compact
          introMessage={otherOpportunity.message}
        />
      </div>
    </div>
  );
}
