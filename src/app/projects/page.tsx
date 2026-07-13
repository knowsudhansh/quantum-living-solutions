import React from 'react';
import { EnvironmentShowcase } from '../../components/projects/environment-showcase';
import { MotionReveal } from '../../components/ui/motion';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Environments | Quantum Living Solutions',
  description: 'View custom architectural system environments and integration topologies.',
};

export default function ProjectsPage() {
  return (
    <div className="qls-page">
      <MotionReveal className="qls-hero">
        <span className="qls-eyebrow">
          SPACES WE TRANSFORM
        </span>
        <h1 className="qls-title mb-5">
          Designed Around the Way You Live
        </h1>
        <p className="qls-lead">
          From private residences to modern workspaces, Quantum Living Solutions brings lighting, climate, security, entertainment, and energy control together in one considered experience.
        </p>
      </MotionReveal>

      <EnvironmentShowcase />
    </div>
  );
}
