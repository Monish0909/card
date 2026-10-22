import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ScratchCardProps {
  weddingDateFormatted: string;
  onRevealed?: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  weddingDateFormatted,
  onRevealed,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const isDrawingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const revealedRef = useRef(false);

  // Trigger celebration and reveal sequence
  const handleReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setIsRevealed(true);

    // Burst ~14 CSS sparkles around the card
    const colors = ['#d4af37', '#f7e7a9', '#fae29c', '#cf9937', '#ffffff', '#e6b800'];
    const newSparkles: Sparkle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // 5% to 95%
      y: Math.random() * 80 + 10,
      size: Math.random() * 14 + 10, // 10px - 24px
      delay: Math.random() * 250, // 0 - 250ms
      color: colors[i % colors.length],
    }));
    setSparkles(newSparkles);

    if (onRevealed) {
      onRevealed();
    }
  }, [onRevealed]);

  // Check the percentage of cleared scratch area (throttled)
  const checkScratchPercentage = useCallback(() => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use a downsampled check for optimal performance (sample every 8th pixel)
    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparentPixels = 0;
    let totalSamples = 0;

    // Step by 32 (8 pixels * 4 channels)
    for (let i = 3; i < data.length; i += 32) {
      totalSamples++;
      if (data[i] === 0) {
        transparentPixels++;
      }
    }

    const clearedPercentage = totalSamples > 0 ? (transparentPixels / totalSamples) * 100 : 0;

    // Reveal at about 50% cleared
    if (clearedPercentage >= 48) {
      handleReveal();
    }
  }, [handleReveal]);

  // Scratch drawing logic
  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      if (revealedRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = (clientX - rect.left) * dpr;
      const y = (clientY - rect.top) * dpr;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      // Generous circular scratch radius
      ctx.arc(x, y, 22 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Throttle cleared percentage check: max once every 120ms
      const now = Date.now();
      if (now - lastCheckTimeRef.current > 120) {
        lastCheckTimeRef.current = now;
        checkScratchPercentage();
      }
    },
    [checkScratchPercentage]
  );

  // Setup / re-paint canvas with DPR support and window resize
  const setupCanvas = useCallback(() => {
    if (revealedRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Setup physical and CSS pixels accurately
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Reset composite operation to paint scratch layer
    ctx.globalCompositeOperation = 'source-over';

    // Rich metallic gold scratch coating
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#f9e7b2');
    grad.addColorStop(0.25, '#d4af37');
    grad.addColorStop(0.5, '#aa820a');
    grad.addColorStop(0.75, '#e4c45b');
    grad.addColorStop(1, '#9b740e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle decorative pattern / border line inside scratch foil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2 * dpr;
    ctx.strokeRect(8 * dpr, 8 * dpr, canvas.width - 16 * dpr, canvas.height - 16 * dpr);

    // Callout text on the scratch surface
    ctx.fillStyle = '#4a0d18';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(12, Math.round(13 * dpr))}px "Marcellus SC", serif`;
    ctx.fillText('✦ SCRATCH TO REVEAL DATE ✦', canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      // Re-initialize if not yet revealed
      if (!revealedRef.current) {
        setupCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Pointer event handlers with touch-action: none
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;
    isDrawingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isRevealed) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback if pointer wasn't captured
    }
    // Check one final time on release
    checkScratchPercentage();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 
        Reserved height container to avoid any layout jump!
        Fixed height 90px (sm: 100px) with absolute underlying date and overlay canvas
      */}
      <div
        ref={containerRef}
        id="scratch-card-container"
        className="relative w-full max-w-xs sm:max-w-sm h-[90px] sm:h-[100px] rounded-2xl overflow-hidden border border-gold/50 shadow-gold-card bg-gradient-to-r from-ivory via-white to-ivory select-none flex items-center justify-center"
      >
        {/* Underlying revealed content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-0">
          <p className="font-serifSc text-[11px] tracking-[0.25em] text-maroon-900 uppercase font-semibold">
            The Wedding Day
          </p>
          <p className="font-serifSc text-xl sm:text-2xl tracking-[0.12em] text-[#7a5614] font-bold mt-0.5">
            {weddingDateFormatted}
          </p>
          <p className="font-serifSc text-[11px] tracking-wider text-[#4a2a30] mt-0.5">
            Save the Auspicious Date
          </p>
        </div>

        {/* Scratch Canvas Overlay */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute inset-0 w-full h-full cursor-crosshair z-10 transition-opacity duration-700 ease-out ${
            isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{
            touchAction: 'none',
            willChange: 'opacity',
          }}
        />

        {/* CSS Sparkle Burst Animation Overlay (~14 sparkles) */}
        {sparkles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {sparkles.map((sparkle) => (
              <span
                key={sparkle.id}
                className="absolute animate-sparkle"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  animationDelay: `${sparkle.delay}ms`,
                  color: sparkle.color,
                }}
              >
                ✦
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Accessible "Reveal date" text button for keyboard / non-touch users */}
      <button
        id="accessible-reveal-date-btn"
        type="button"
        onClick={handleReveal}
        disabled={isRevealed}
        className={`mt-2.5 text-[13px] font-serifSc tracking-[0.15em] transition-all duration-300 focus:outline-none focus:underline ${
          isRevealed
            ? 'text-[#7a5614] cursor-default'
            : 'text-maroon-900 hover:text-maroon-800 underline underline-offset-4 cursor-pointer hover:scale-105 active:scale-95'
        }`}
        aria-label={isRevealed ? 'Wedding date revealed' : 'Reveal wedding date'}
      >
        {isRevealed ? '✦ Date Revealed ✦' : 'Reveal date'}
      </button>
    </div>
  );
};
