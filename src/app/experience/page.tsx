import React from 'react';
import { EnvironmentViewer } from '../../components/experience/environment-viewer';
import { MotionReveal } from '../../components/ui/motion';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Experience Room | Quantum Living Solutions',
  description: 'Interactive smart space presets selectors overview.',
};

export default function ExperiencePage() {
  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">
          LIVING SCENES
        </span>
        <h1 className="qls-title mb-5">
          One Home. Every Mood.
        </h1>
        <p className="qls-lead">
          See how lighting, curtains, climate, security, and entertainment can move together with a single scene.
        </p>
      </MotionReveal>

      <EnvironmentViewer />
    </div>
  );
}
