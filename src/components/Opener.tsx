import React, { useCallback, useEffect, useRef, useState } from 'react';

interface OpenerProps {
  envelopeVideo: string; // optional upgrade: if this video loads, it replaces the built-in CSS animation
  brideName: string;
  groomName: string;
  hashtag: string;
  dateFormatted: string; // printed on the card that slides out of the envelope
  onOpenStarted: () => void; // fires inside the tap (starts the music)
  onRevealStart: () => void; // fires when the page behind should start its entrance
  onComplete: () => void; // fires when the overlay is fully gone
}

/*
  Opening sequence (CSS path), ms after the tap:
    0     seal      wax seal presses and breaks, text around the envelope fades
    550   flap      flap swings open (3D) and drops behind the card
    1450  card      card slides up out of the envelope
    2650  zoom      camera pushes in on the card (envelope falls away)
    3750  fade      overlay fades, the invitation page settles in
    5050  done      overlay unmounted
*/
type Stage = 'idle' | 'seal' | 'flap' | 'card' | 'zoom' | 'fade' | 'done';
const ORDER: Stage[] = ['idle', 'seal', 'flap', 'card', 'zoom', 'fade', 'done'];

const FADE_MS = 1300;
const ZOOM_TO_FADE_MS = 1100;
const VIDEO_WATCHDOG_MS = 3500;
const CSS_SAFETY_MS = 9000;

// Fixed positions so the render stays pure (no Math.random during render).
const DUST = [
  [8, 12, 5, 0.2, 4.2], [22, 30, 3, 1.6, 5.1], [78, 9, 4, 0.9, 4.6], [90, 26, 3, 2.4, 5.4],
  [14, 58, 4, 1.1, 4.8], [86, 52, 5, 0.4, 4.1], [30, 82, 3, 2.0, 5.6], [70, 86, 4, 1.4, 4.4],
  [50, 6, 3, 2.8, 5.0], [6, 88, 3, 0.7, 4.9], [94, 78, 4, 1.9, 4.3], [42, 94, 3, 3.1, 5.2],
] as const;

const Emboss: React.FC<{ id: string }> = ({ id }) => (
  <pattern id={id} width="46" height="46" patternUnits="userSpaceOnUse">
    <g fill="rgba(0,0,0,0.12)" stroke="rgba(247,224,139,0.17)" strokeWidth="0.7">
      <path d="M23 7 C32 16 32 30 23 39 C14 30 14 16 23 7 Z" />
      <path d="M23 11 L23 36" fill="none" />
      <path d="M23 20 L28 16 M23 26 L29 21 M23 20 L18 16 M23 26 L17 21" fill="none" />
    </g>
    <g fill="rgba(247,224,139,0.2)">
      <circle cx="0" cy="0" r="1.4" />
      <circle cx="46" cy="0" r="1.4" />
      <circle cx="0" cy="46" r="1.4" />
      <circle cx="46" cy="46" r="1.4" />
    </g>
  </pattern>
);

export const Opener: React.FC<OpenerProps> = ({
  envelopeVideo,
  brideName,
  groomName,
  hashtag,
  dateFormatted,
  onOpenStarted,
  onRevealStart,
  onComplete,
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const [videoActive, setVideoActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Refs mirror state so timers and media events never read stale values.
  const stageRef = useRef<Stage>('idle');
  const startedRef = useRef(false);
  const exitingRef = useRef(false);
  const cssRunningRef = useRef(false);
  const videoStartedRef = useRef(false);
  const videoBrokenRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCompleteRef = useRef(onComplete);
  const onRevealRef = useRef(onRevealStart);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onRevealRef.current = onRevealStart;
  });

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const setStageBoth = useCallback((next: Stage) => {
    stageRef.current = next;
    setStage(next);
  }, []);

  const finish = useCallback(() => {
    setStageBoth('done');
    onCompleteRef.current();
  }, [setStageBoth]);

  // Zoom into the card, then fade the overlay while the page settles in. Safe to call many times.
  const exitSequence = useCallback(
    (zoomMs: number) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      clearAllTimers();
      setStageBoth('zoom');
      later(() => {
        onRevealRef.current();
        setStageBoth('fade');
      }, zoomMs);
      later(finish, zoomMs + FADE_MS);
    },
    [clearAllTimers, later, setStageBoth, finish]
  );

  // Reduced motion: no zoom, just a short fade.
  const quickExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    clearAllTimers();
    later(() => {
      onRevealRef.current();
      setStageBoth('fade');
    }, 100);
    later(finish, 100 + FADE_MS);
  }, [clearAllTimers, later, setStageBoth, finish]);

  const runCssSequence = useCallback(() => {
    if (cssRunningRef.current || exitingRef.current) return;
    cssRunningRef.current = true;
    clearAllTimers();
    setVideoActive(false);

    setStageBoth('seal');
    later(() => setStageBoth('flap'), 550);
    later(() => setStageBoth('card'), 1450);
    later(() => exitSequence(ZOOM_TO_FADE_MS), 2650);
    later(() => exitSequence(300), CSS_SAFETY_MS); // never get stuck
  }, [clearAllTimers, later, setStageBoth, exitSequence]);

  const handleOpenClick = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    onOpenStarted(); // starts the music inside this user gesture

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      quickExit();
      return;
    }

    // A real envelope video that is already loaded replaces the CSS animation.
    const video = videoRef.current;
    if (video && !videoBrokenRef.current && video.readyState >= 3) {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
      later(() => {
        if (!videoStartedRef.current) runCssSequence(); // video would not start -> CSS animation
      }, VIDEO_WATCHDOG_MS);
      later(() => exitSequence(300), Math.round((duration + 3) * 1000)); // hard limit
      video.currentTime = 0;
      video.play().catch(() => runCssSequence());
      return;
    }

    runCssSequence();
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  if (stage === 'done') return null;

  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s);
  const flag = (s: Stage) => (reached(s) ? '' : undefined); // data-* attributes the CSS keys off
  const initials = `${brideName.charAt(0)} & ${groomName.charAt(0)}`.toUpperCase();

  return (
    <div
      id="invitation-opener"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation envelope"
      className={`opener-root fixed inset-0 z-50 overflow-hidden transition-opacity duration-[1300ms] ease-in-out ${
        stage === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      data-seal={flag('seal')}
      data-flap={flag('flap')}
      data-card={flag('card')}
      data-zoom={flag('zoom')}
      data-fade={flag('fade')}
    >
      {/* Atmosphere: slow mandala + drifting gold dust so the screen never feels empty */}
      <svg className="opener-mandala" viewBox="-200 -200 400 400" aria-hidden="true">
        <g fill="none" stroke="#f5e08b" strokeWidth="0.6">
          {[40, 70, 110, 150, 190].map((r) => (
            <circle key={r} r={r} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => (
            <ellipse key={i} cx="0" cy="-95" rx="14" ry="44" transform={`rotate(${i * 15})`} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={`b${i}`} cx="0" cy="-150" rx="9" ry="30" transform={`rotate(${i * 30 + 15})`} />
          ))}
        </g>
      </svg>
      {DUST.map(([left, top, size, delay, dur], i) => (
        <span
          key={i}
          className="opener-dust"
          aria-hidden="true"
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              '--dl': `${delay}s`,
              '--d': `${dur}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Top: names */}
      <header className="opener-chrome absolute inset-x-0 top-0 z-20 px-6 pt-8 text-center sm:pt-10">
        <p className="mb-1 font-serifSc text-[11px] tracking-[0.3em] text-[#d4af37]/85 uppercase sm:text-xs">
          Wedding Invitation
        </p>
        <h1 className="font-script text-[2.6rem] leading-none text-[#f5e08b] drop-shadow-md sm:text-6xl">
          {brideName} <span className="text-[#d4af37]/80">&amp;</span> {groomName}
        </h1>
      </header>

      {/* Centre: the envelope scene */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="opener-stage">
          <div className="env-body">
            <div className="env-shadow" />

            {/* inside of the envelope (seen through the open flap) */}
            <div className="env-back env-part" />

            {/* card that slides out */}
            <div className="env-card">
              <div className="env-card-inner">
                <div className="env-card-om font-deva">ॐ</div>
                <p className="env-card-label font-serifSc">Wedding Invitation</p>
                <p className="env-card-name font-script">{brideName}</p>
                <p className="env-card-amp font-script">&amp;</p>
                <p className="env-card-name font-script">{groomName}</p>
                <div className="env-card-rule" />
                <p className="env-card-date font-serifSc">{dateFormatted}</p>
              </div>
            </div>

            {/* flap: front (embossed) + back (lining), rotates in 3D */}
            <div className="env-flap">
              <div className="env-flap-face env-flap-front">
                <svg viewBox="0 0 300 198" aria-hidden="true">
                  <defs>
                    <linearGradient id="fl-front" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#74182c" />
                      <stop offset="1" stopColor="#541020" />
                    </linearGradient>
                    <Emboss id="fl-emb" />
                    <clipPath id="fl-clip">
                      <polygon points="0,0 300,0 150,198" />
                    </clipPath>
                  </defs>
                  <polygon points="0,0 300,0 150,198" fill="url(#fl-front)" />
                  <rect width="300" height="198" fill="url(#fl-emb)" clipPath="url(#fl-clip)" />
                  <path d="M0 0 L150 198 L300 0" fill="none" stroke="#d9b45a" strokeWidth="1.6" opacity="0.9" />
                  <path d="M14 6 L150 178 L286 6" fill="none" stroke="#d9b45a" strokeWidth="0.6" opacity="0.4" />
                </svg>
                <div className="env-seal font-serifSc" aria-hidden="true">
                  {initials}
                </div>
              </div>
              <div className="env-flap-face env-flap-back">
                <svg viewBox="0 0 300 198" aria-hidden="true">
                  <defs>
                    <linearGradient id="fl-back" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f7ecd2" />
                      <stop offset="1" stopColor="#e6cf9c" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,0 300,0 150,198" fill="url(#fl-back)" />
                  <path d="M0 0 L150 198 L300 0" fill="none" stroke="#c99a38" strokeWidth="1.6" />
                  <path d="M22 8 L150 170 L278 8" fill="none" stroke="#c99a38" strokeWidth="0.6" opacity="0.5" />
                </svg>
              </div>
            </div>

            {/* front pocket: three folds, embossed, gold foil edges */}
            <div className="env-front env-part">
              <svg viewBox="0 0 300 396" aria-hidden="true">
                <defs>
                  <linearGradient id="pk-left" x1="0" y1="0" x2="1" y2="0.2">
                    <stop offset="0" stopColor="#4a0d18" />
                    <stop offset="1" stopColor="#5e1424" />
                  </linearGradient>
                  <linearGradient id="pk-right" x1="1" y1="0" x2="0" y2="0.2">
                    <stop offset="0" stopColor="#3b0a15" />
                    <stop offset="1" stopColor="#521120" />
                  </linearGradient>
                  <linearGradient id="pk-bottom" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#470d1a" />
                    <stop offset="1" stopColor="#6a1829" />
                  </linearGradient>
                  <linearGradient id="pk-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f7e7a9" />
                    <stop offset="0.5" stopColor="#d4a93e" />
                    <stop offset="1" stopColor="#b8862a" />
                  </linearGradient>
                  <Emboss id="pk-emb" />
                  <clipPath id="pk-clip">
                    <polygon points="0,0 150,198 0,396" />
                    <polygon points="300,0 150,198 300,396" />
                    <polygon points="0,396 150,190 300,396" />
                  </clipPath>
                </defs>
                <polygon points="0,0 150,198 0,396" fill="url(#pk-left)" />
                <polygon points="300,0 150,198 300,396" fill="url(#pk-right)" />
                <polygon points="0,396 150,190 300,396" fill="url(#pk-bottom)" />
                <rect width="300" height="396" fill="url(#pk-emb)" clipPath="url(#pk-clip)" />
                <path d="M0 0 L150 198 L300 0" fill="none" stroke="#d9b45a" strokeWidth="1.2" opacity="0.7" />
                <path d="M0 396 L150 190 L300 396" fill="none" stroke="url(#pk-gold)" strokeWidth="1.8" />
                <rect x="4" y="4" width="292" height="388" rx="5" fill="none" stroke="url(#pk-gold)" strokeWidth="1.6" opacity="0.9" />
                <rect x="12" y="12" width="276" height="372" rx="3" fill="none" stroke="#d9b45a" strokeWidth="0.6" opacity="0.4" />
                <text x="150" y="352" textAnchor="middle" fontFamily="'Marcellus SC', serif" fontSize="11.5" letterSpacing="3.2" fill="#e8c96a" opacity="0.95">
                  {hashtag.toUpperCase()}
                </text>
              </svg>
            </div>
            <div className="env-grain env-part" />
          </div>
        </div>

        {/* Optional real video: replaces the CSS animation when it loads and starts playing */}
        <div
          className="absolute inset-0 bg-[#4a0d18] transition-opacity duration-500"
          style={{
            opacity: videoActive ? 1 : 0,
            pointerEvents: 'none',
            transform: reached('zoom') ? 'scale(1.5)' : 'scale(1)',
            transition: 'opacity 500ms ease, transform 1100ms cubic-bezier(0.65, 0, 0.3, 1)',
          }}
        >
          <video
            ref={videoRef}
            src={envelopeVideo}
            playsInline
            muted
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-contain"
            onPlaying={() => {
              videoStartedRef.current = true;
              setVideoActive(true);
              if (stageRef.current === 'idle') setStageBoth('seal');
            }}
            onEnded={() => exitSequence(ZOOM_TO_FADE_MS)}
            onError={() => {
              videoBrokenRef.current = true;
              if (startedRef.current) runCssSequence();
            }}
          />
        </div>
      </div>

      {/* Bottom: pill button */}
      <footer className="opener-chrome absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-6 pb-9 text-center sm:pb-12">
        <button
          id="open-envelope-btn"
          type="button"
          onClick={handleOpenClick}
          disabled={stage !== 'idle'}
          className="group relative inline-flex items-center justify-center rounded-full border border-[#d4af37]/70 bg-black/30 px-8 py-3.5 font-serifSc text-[11px] tracking-[0.2em] text-[#f5e08b] uppercase shadow-lg backdrop-blur-md transition-all duration-300 hover:border-[#d4af37] hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 active:scale-95 sm:text-xs"
        >
          <span className="relative z-10">Click here to open the envelope</span>
          <span className="absolute inset-0 rounded-full bg-[#d4af37]/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        <p className="font-serifSc text-[11px] tracking-[0.2em] text-[#d4af37]/60 sm:text-xs">{hashtag}</p>
      </footer>

      <span className="sr-only" role="status">
        {stage === 'idle' ? '' : 'Opening the invitation'}
      </span>
    </div>
  );
};
