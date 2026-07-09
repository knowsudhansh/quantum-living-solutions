import React from 'react';

interface OperatingStructureProps {
  capabilities: string[];
  integrationNotes: string;
}

export function OperatingStructure({ capabilities, integrationNotes }: OperatingStructureProps) {
  const cap1 = capabilities[0] || 'System configurations matching schedule triggers.';
  const cap2 = capabilities[1] || 'Occupancy-based preset state management.';
  const cap3 = capabilities[2] || 'Silent mechanical actuators and indicators.';

  return (
    <div className="mb-24">
      <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-[HSL(210,15%,50%)] mb-8 select-none">
        Operating Structure
      </h2>

      <div className="space-y-8">
        {/* Layer 1: Management Layer */}
        <div className="p-10 border border-zinc-800 border-l-4 border-l-[HSL(210,80%,60%)] bg-[HSL(220,25%,7%)] rounded-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="md:w-1/3">
              <span className="text-xs font-mono uppercase tracking-wider text-[HSL(210,80%,60%)] select-none">
                Layer 01
              </span>
              <h3 className="text-xl md:text-2xl font-light text-foreground mt-1">
                Management Layer
              </h3>
            </div>
            <div className="md:w-2/3 space-y-4 text-foreground/85 text-base md:text-lg leading-relaxed">
              <p>{cap1}</p>
              <p>{cap2}</p>
            </div>
          </div>
        </div>

        {/* Layer 2: Actuation Layer */}
        <div className="p-10 border border-zinc-800 border-l-4 border-l-[HSL(25,60%,50%)] bg-[HSL(220,25%,7%)] rounded-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="md:w-1/3">
              <span className="text-xs font-mono uppercase tracking-wider text-[HSL(25,60%,50%)] select-none">
                Layer 02
              </span>
              <h3 className="text-xl md:text-2xl font-light text-foreground mt-1">
                Actuation Layer
              </h3>
            </div>
            <div className="md:w-2/3 text-foreground/85 text-base md:text-lg leading-relaxed">
              <p>{cap3}</p>
            </div>
          </div>
        </div>

        {/* Layer 3: Boundary Isolation Layer */}
        <div className="p-10 border border-zinc-800 border-l-4 border-l-[HSL(35,30%,45%)] bg-[HSL(220,25%,7%)] rounded-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="md:w-1/3">
              <span className="text-xs font-mono uppercase tracking-wider text-[HSL(35,30%,45%)] select-none">
                Layer 03
              </span>
              <h3 className="text-xl md:text-2xl font-light text-foreground mt-1">
                Boundary Isolation Layer
              </h3>
            </div>
            <div className="md:w-2/3 text-foreground/85 text-base md:text-lg leading-relaxed">
              <p>{integrationNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
