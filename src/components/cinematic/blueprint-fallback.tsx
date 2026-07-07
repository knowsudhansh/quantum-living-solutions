import React from 'react';

export function BlueprintFallback() {
  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-full min-h-[500px] bg-[hsl(220,25%,7%)] text-[hsl(210,15%,85%)] overflow-hidden"
      role="img"
      aria-label="High-contrast blueprint architectural layout showing structural system nodes interconnected on a 3D isometric coordinate grid"
      data-testid="blueprint-fallback"
    >
      {/* SVG Isometric Grid Backdrop */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(210, 50%, 20%)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        
        {/* Isometric Blueprint lines representing system nodes */}
        <g stroke="hsl(210, 80%, 40%)" strokeWidth="1.5" fill="none" opacity="0.8">
          {/* Floor grid bounds */}
          <polygon points="400,150 650,300 400,450 150,300" strokeDasharray="5,5" />
          
          {/* Connectivity pathways */}
          <line x1="400" y1="150" x2="400" y2="450" />
          <line x1="150" y1="300" x2="650" y2="300" />
          
          {/* Vertical Node pillars */}
          <line x1="400" y1="300" x2="400" y2="200" strokeWidth="2.5" stroke="hsl(210, 80%, 60%)" />
          <line x1="275" y1="225" x2="275" y2="175" />
          <line x1="525" y1="375" x2="525" y2="325" />
          
          {/* Glow spots representing controller nodes */}
          <circle cx="400" cy="200" r="8" fill="hsl(210, 80%, 60%)" />
          <circle cx="275" cy="175" r="4" fill="hsl(210, 50%, 50%)" />
          <circle cx="525" cy="325" r="4" fill="hsl(210, 50%, 50%)" />
        </g>
      </svg>

      {/* Typography Overlay Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        <span className="text-xs uppercase tracking-widest text-[hsl(210,80%,60%)] font-semibold mb-2 block">
          Fallback Backdrop
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
          Act 8: Structural Grid Node
        </h2>
        <p className="text-sm text-[hsl(210,15%,70%)] leading-relaxed">
          The real-time 3D experience has been disabled. The system is operating in high-contrast static mode to ensure accessibility and conserve system resources.
        </p>
      </div>
    </div>
  );
}
