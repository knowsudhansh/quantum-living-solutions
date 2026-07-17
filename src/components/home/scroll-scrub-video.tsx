'use client';

import Image from 'next/image';
import React, { useRef, useEffect, useState } from 'react';

interface ScrollScrubVideoProps {
  videoUrl?: string;
  progress: number; // 0 to 1 scroll position
  activeAct: number;
  isReducedMotion: boolean;
  posterImage?: string;
}

const actImages = [
  '/images/evening.jpg',      // Act 01: Arrival
  '/images/security.jpg',     // Act 02: Intelligent Entry
  '/images/morning.jpg',      // Act 03: Welcome Home
  '/images/kitchen.jpg',      // Act 04: Light
  '/images/morning.jpg',      // Act 05: Privacy
  '/images/workspace.jpg',    // Act 06: Comfort
  '/images/entertaining.jpg', // Act 07: Entertainment
  '/images/security.jpg',     // Act 08: Security
  '/images/workspace.jpg',    // Act 09: Energy
  '/images/evening.jpg',      // Act 10: Complete Home
];

export function ScrollScrubVideo({
  videoUrl,
  progress,
  activeAct,
  isReducedMotion,
  posterImage = '/images/evening.jpg'
}: ScrollScrubVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(!!videoUrl);
  const [videoError, setVideoError] = useState(false);

  const targetTimeRef = useRef(0);

  // RequestAnimationFrame scrub loop
  useEffect(() => {
    if (!videoUrl || videoError || isReducedMotion) return;

    let animationFrameId: number;

    const scrub = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const targetTime = progress * video.duration;
        targetTimeRef.current = targetTime;

        // Smooth time interpolation (easing factor: 0.1)
        const timeDiff = targetTimeRef.current - video.currentTime;
        if (Math.abs(timeDiff) > 0.01) {
          video.currentTime += timeDiff * 0.1;
        }
      }
      animationFrameId = requestAnimationFrame(scrub);
    };

    animationFrameId = requestAnimationFrame(scrub);
    return () => cancelAnimationFrame(animationFrameId);
  }, [videoUrl, videoError, progress, isReducedMotion]);

  const handleCanPlayThrough = () => {
    setLoading(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setLoading(false);
  };

  // Fallback view: static image frames that crossfade based on activeAct index
  const renderFallback = () => {
    return (
      <div className="absolute inset-0 w-full h-full bg-zinc-950">
        {actImages.map((src, idx) => {
          const isActive = idx === activeAct;
          return (
            <Image
              key={idx}
              src={src}
              alt={`Act transition frame ${idx + 1}`}
              fill
              sizes="100vw"
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                isActive ? 'opacity-40' : 'opacity-0'
              }`}
            />
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 opacity-90" />
      </div>
    );
  };

  if (isReducedMotion || !videoUrl || videoError) {
    return renderFallback();
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden select-none">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        preload="auto"
        muted
        playsInline
        webkit-playsinline="true"
        onCanPlayThrough={handleCanPlayThrough}
        onError={handleVideoError}
        poster={posterImage}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          loading ? 'opacity-0' : 'opacity-35'
        }`}
      />

      {/* Loading indicator Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-[HSL(35,30%,45%)] rounded-full animate-spin" />
        </div>
      )}

      {/* Atmosphere overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 opacity-90" />
    </div>
  );
}
