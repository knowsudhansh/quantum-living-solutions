import React from 'react';

interface FlowData {
  input: string;
  intelligence: string;
  action: string;
  outcome: string;
}

const FLOW_MAP: Record<string, FlowData> = {
  'residential-automation': {
    input: 'Daylight Cycles & Occupancy Routing',
    intelligence: 'Environmental Coordination',
    action: 'Lighting & Actuator Automation',
    outcome: 'Luxury Living Comfort',
  },
  'commercial-automation': {
    input: 'Presence Detection & Display Scheduling',
    intelligence: 'Subsystem Profiles',
    action: 'Grid Coordination',
    outcome: 'Workspace Utility',
  },
  'lighting-automation': {
    input: 'Astronomical Clock & Solar Tracking',
    intelligence: 'Precision Lighting Control',
    action: 'Low-Voltage Driver Illumination',
    outcome: 'Restrained Architectural Illumination',
  },
  'curtains-and-blinds': {
    input: 'Solar Heat Harvesting & Thermal Gains',
    intelligence: 'Automated Blind Positioning',
    action: 'Silent Actuator Motor Alignment',
    outcome: 'Natural Light Entry Optimization',
  },
  'climate-control': {
    input: 'Occupancy Zones & Thermal Sensors',
    intelligence: 'Multi-Zone HVAC Scheduling',
    action: 'BACnet Gateway Dampers & Loops',
    outcome: 'Energy-Efficient Climate Stabilization',
  },
  'security-and-surveillance': {
    input: 'Lock Status Verification',
    intelligence: 'Security Boundary Automation',
    action: 'Decoupled Physical Failsafe Locking',
    outcome: 'Safeguarded Entries & Structural Zones',
  },
  'audio-video-entertainment': {
    input: 'Scenic Environment Triggers',
    intelligence: 'Acoustic Profile Configurations',
    action: 'Fiber-Routed Audio Matrices',
    outcome: 'Disappearing High-Fidelity Distribution',
  },
  'energy-management': {
    input: 'Dormant States & Real-Time Power Monitoring',
    intelligence: 'Energy Conservation Profiles',
    action: 'Modbus Load Shifting & Vampire Isolation',
    outcome: 'Optimized Power Draw',
  },
};

interface SystemFlowDiagramProps {
  slug: string;
}

export function SystemFlowDiagram({ slug }: SystemFlowDiagramProps) {
  const data = FLOW_MAP[slug];

  if (!data) return null;

  return (
    <div className="mb-24">
      <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-[HSL(210,15%,50%)] mb-8 select-none">
        System Flow Architecture
      </h2>

      {/* Screen-reader accessible table */}
      <table className="sr-only">
        <caption>System Flow Architecture for {slug}</caption>
        <thead>
          <tr>
            <th scope="col">Input</th>
            <th scope="col">Intelligence</th>
            <th scope="col">Action</th>
            <th scope="col">Outcome</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.input}</td>
            <td>{data.intelligence}</td>
            <td>{data.action}</td>
            <td>{data.outcome}</td>
          </tr>
        </tbody>
      </table>

      {/* Visual Flex Flow Map */}
      <div className="flex flex-col md:flex-row items-stretch justify-between bg-zinc-950 p-8 border border-zinc-800 rounded-sm gap-4">
        {/* Step 1: Input */}
        <div className="flex-1 flex flex-col items-center text-center p-6 border border-zinc-900 rounded-sm bg-[HSL(220,25%,7%)] min-h-[180px] justify-center">
          <span className="text-xs font-mono tracking-widest uppercase text-[HSL(210,15%,50%)] mb-3 select-none">
            01 / Input
          </span>
          <p className="text-base md:text-lg font-normal text-foreground tracking-tight px-1 leading-snug">
            {data.input}
          </p>
        </div>

        {/* Connector 1 */}
        <div className="flex items-center justify-center select-none h-8 md:h-auto px-1">
          <svg
            className="w-6 h-6 text-zinc-500 transform rotate-90 md:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 2: Intelligence */}
        <div className="flex-1 flex flex-col items-center text-center p-6 border border-zinc-900 rounded-sm bg-[HSL(220,25%,7%)] min-h-[180px] justify-center border-l-[HSL(35,30%,45%)] border-l-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[HSL(35,30%,45%)] mb-3 select-none">
            02 / Intelligence
          </span>
          <p className="text-base md:text-lg font-normal text-foreground tracking-tight px-1 leading-snug">
            {data.intelligence}
          </p>
        </div>

        {/* Connector 2 */}
        <div className="flex items-center justify-center select-none h-8 md:h-auto px-1">
          <svg
            className="w-6 h-6 text-zinc-500 transform rotate-90 md:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 3: Action */}
        <div className="flex-1 flex flex-col items-center text-center p-6 border border-zinc-900 rounded-sm bg-[HSL(220,25%,7%)] min-h-[180px] justify-center border-l-[HSL(25,60%,50%)] border-l-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[HSL(25,60%,50%)] mb-3 select-none">
            03 / Action
          </span>
          <p className="text-base md:text-lg font-normal text-foreground tracking-tight px-1 leading-snug">
            {data.action}
          </p>
        </div>

        {/* Connector 3 */}
        <div className="flex items-center justify-center select-none h-8 md:h-auto px-1">
          <svg
            className="w-6 h-6 text-zinc-500 transform rotate-90 md:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Step 4: Outcome */}
        <div className="flex-1 flex flex-col items-center text-center p-6 border border-zinc-900 rounded-sm bg-[HSL(220,25%,7%)] min-h-[180px] justify-center border-l-[HSL(210,80%,60%)] border-l-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[HSL(210,80%,60%)] mb-3 select-none">
            04 / Outcome
          </span>
          <p className="text-base md:text-lg font-normal text-foreground tracking-tight px-1 leading-snug">
            {data.outcome}
          </p>
        </div>
      </div>
    </div>
  );
}
