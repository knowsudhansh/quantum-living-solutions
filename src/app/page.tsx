import React from 'react';
import { StructuralCanvasContainer } from '../components/cinematic/canvas-container';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="w-full h-full min-h-[500px]">
      <StructuralCanvasContainer />
    </div>
  );
}
