import React, { useRef, useState, useEffect } from 'react';

interface OpenerProps {
  envelopeImage: string;
  envelopeVideo: string;
  coupleNames: string;
  hashtag: string;
  onOpenStarted: () => void; // Triggered immediately on click (to start audio playback)
  onComplete: () => void;    // Triggered when overlay is fully faded and unmounted
}

export const Opener: React.FC<OpenerProps> = ({
  envelopeImage,
  envelopeVideo,
  coupleNames,
  hashtag,
  onOpenStarted,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'fading' | 'unmounted'>('idle');
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition to fade-out
  const startFadeOut = () => {
    if (phase === 'fading' || phase === 'unmounted') return;
    setPhase('fading');
    
    // Clear any pending timers
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);

    // After 1.6s transition duration, unmount completely
    setTimeout(() => {
      setPhase('unmounted');
      onComplete();
    }, 1600);
  };

  const handleOpenClick = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    onOpenStarted();

    // Guard 1: If video doesn't start playing within 2s, skip straight to fade-out
    fallbackTimerRef.current = setTimeout(() => {
      if (!videoStarted) {
        startFadeOut();
      }
    }, 2000);

    // Guard 2: Hard timeout - under no circumstance should the opener stay stuck past 8s
    hardTimeoutRef.current = setTimeout(() => {
      startFadeOut();
    }, 8000);

    // Attempt video playback
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoStarted(true);
          })
          .catch(() => {
            // Autoplay rejected or corrupted media -> skip to fade-out
            startFadeOut();
          });
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (hardTimeoutRef.current) clearTimeout(hardTimeoutRef.current);
    };
  }, []);

  if (phase === 'unmounted') {
    return null;
  }

  return (
    <div
      id="invitation-opener"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-[#4a0d18] transition-opacity duration-[1600ms] ease-in-out ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
    >
      {/* Top Header: Couple Names in Gold Script */}
      <header className="w-full text-center pt-8 sm:pt-12 z-20">
        <p className="font-serifSc text-xs sm:text-sm tracking-[0.25em] text-[#d4af37]/80 uppercase mb-2">
          Wedding Invitation
        </p>
        <h1 className="font-script text-4xl sm:text-6xl text-[#f5e08b] drop-shadow-md">
          {coupleNames}
        </h1>
      </header>

      {/* Centerpiece: Maroon Envelope with Gold Monogram or Video */}
      <div className="relative w-full max-w-sm sm:max-w-md aspect-square my-auto flex items-center justify-center z-10">
        {/* Envelope Static Image */}
        <img
          src={envelopeImage}
          alt="Royal Wedding Envelope"
          className={`w-full h-full object-contain filter drop-shadow-2xl transition-opacity duration-700 ${
            phase === 'opening' && videoStarted ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Optional Envelope Opening Video */}
        <video
          ref={videoRef}
          src={envelopeVideo}
          playsInline
          muted
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500 ${
            phase === 'opening' && videoStarted ? 'opacity-100' : 'opacity-0'
          }`}
          onPlay={() => {
            setVideoStarted(true);
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
          }}
          onEnded={() => {
            if (phase === 'opening') startFadeOut();
          }}
          onError={() => {
            if (phase === 'opening') startFadeOut();
          }}
          onStalled={() => {
            if (phase === 'opening') startFadeOut();
          }}
        />
      </div>

      {/* Bottom Action Section: Pill Button */}
      <footer className="w-full pb-8 sm:pb-12 text-center z-20 flex flex-col items-center gap-3">
        <p className="font-serifSc text-xs tracking-[0.2em] text-[#d4af37]/70">
          {hashtag}
        </p>
        
        {phase === 'idle' ? (
          <button
            id="open-envelope-btn"
            onClick={handleOpenClick}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-[#d4af37]/70 bg-black/30 backdrop-blur-md text-[#f5e08b] text-[11px] sm:text-xs font-serifSc uppercase tracking-[0.2em] shadow-lg hover:bg-black/50 hover:border-[#d4af37] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
            aria-label="Click here to open the envelope"
          >
            <span className="relative z-10">Click here to open the envelope</span>
            <div className="absolute inset-0 rounded-full bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <div className="text-[11px] font-serifSc tracking-[0.2em] text-[#d4af37]/80 uppercase animate-pulse">
            Opening Envelope...
          </div>
        )}
      </footer>
    </div>
  );
};
