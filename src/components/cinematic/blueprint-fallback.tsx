import React from 'react';

export function BlueprintFallback() {
  return (
    <div
      className="relative w-full h-full min-h-[500px] bg-background overflow-hidden"
      role="img"
      aria-label="Static blueprint architectural layout showing structural system nodes on an isometric coordinate grid"
      data-testid="blueprint-fallback"
    >
      {/* SVG Isometric Grid & Blueprint Backdrop */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(220, 15%, 15%)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        
        {/* Mapped Showroom Floor Plan Walls (Warm Bronze Accent matching HSL(35, 30%, 45%)) */}
        <g stroke="hsl(35, 30%, 45%)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6">
          {/* Outer Bounding Loop */}
          <line x1="365" y1="160" x2="645" y2="320" />
          <line x1="645" y1="320" x2="435" y2="440" />
          <line x1="435" y1="440" x2="155" y2="280" />
          <line x1="155" y1="280" x2="365" y2="160" />

          {/* Foyer Partition Wall 1 */}
          <line x1="435" y1="200" x2="365" y2="240" />
          {/* Foyer Partition Wall 2 */}
          <line x1="295" y1="280" x2="225" y2="320" />

          {/* Bedroom Divider Wall */}
          <line x1="575" y1="280" x2="435" y2="360" />

          {/* Utility Divider Wall */}
          <line x1="295" y1="280" x2="505" y2="400" />
        </g>

        {/* Communication Bus Grid (Dashed Steel Blue Line matching HSL(210, 80%, 60%)) */}
        <polyline
          points="295,240 365,280 435,280 487.5,310 540,340 365,360 295,240"
          stroke="hsl(210, 80%, 60%)"
          strokeWidth="1.2"
          strokeDasharray="4,4"
          fill="none"
          opacity="0.5"
        />

        {/* Emitter Controller Nodes (Steel Blue & Copper Clay) */}
        <g opacity="0.8">
          {/* Climate Nodes (Copper Clay) */}
          <circle cx="540" cy="340" r="5" fill="hsl(25, 60%, 50%)" />
          <circle cx="435" cy="280" r="5" fill="hsl(25, 60%, 50%)" />

          {/* Security Nodes (Copper Clay) */}
          <circle cx="347.5" cy="190" r="5" fill="hsl(25, 60%, 50%)" />
          <circle cx="505" cy="240" r="5" fill="hsl(25, 60%, 50%)" />
          <circle cx="610" cy="300" r="5" fill="hsl(25, 60%, 50%)" />

          {/* Presence Nodes (Steel Blue) */}
          <circle cx="295" cy="240" r="5" fill="hsl(210, 80%, 60%)" />
          <circle cx="365" cy="280" r="5" fill="hsl(210, 80%, 60%)" />

          {/* Media Nodes (Steel Blue) */}
          <circle cx="487.5" cy="310" r="5" fill="hsl(210, 80%, 60%)" />
          <circle cx="417.5" cy="230" r="5" fill="hsl(210, 80%, 60%)" />

          {/* Energy Node (Warm Bronze) */}
          <circle cx="365" cy="360" r="5" fill="hsl(35, 30%, 45%)" />
        </g>
      </svg>
    </div>
  );
}
