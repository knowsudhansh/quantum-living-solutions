'use client';

import dynamic from 'next/dynamic';

const LuxuryVillaExperience = dynamic(
  () => import('./luxury-villa-experience').then((module) => module.LuxuryVillaExperience),
  { ssr: false, loading: () => null },
);

export default function LuxuryVillaHeroDynamic() {
  return <LuxuryVillaExperience />;
}
