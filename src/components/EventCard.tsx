import React, { useEffect, useRef, useState } from 'react';
import type { WeddingEvent } from '../types';
import { useInView } from '../hooks/useInView';

interface EventCardProps {
  event: WeddingEvent;
}

// When the content file still has the "#" placeholder, fall back to a Google Maps search so the button works in the sample.
const resolveMapsUrl = (event: WeddingEvent): string => {
  if (event.mapsUrl && event.mapsUrl !== '#') return event.mapsUrl;
  const query = encodeURIComponent(`${event.venueName} ${event.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const pillClasses =
  'block w-full rounded-full border border-[#d4af37] bg-maroon-800 px-4 py-2.5 text-center text-[11px] sm:text-xs font-serifSc uppercase tracking-[0.16em] text-[#f7e7a9] shadow-md hover:bg-maroon-700 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70';

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [flipped, setFlipped] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const [cardRef, cardSeen] = useInView<HTMLElement>(0.12, true); // scroll-in entrance (once)
  const [mediaRef, mediaVisible] = useInView<HTMLDivElement>(0.4); // video only plays while visible
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const styleBtnRef = useRef<HTMLButtonElement | null>(null);
  const backBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstRender = useRef(true);

  // Play the video only while it is on screen and the front face is showing.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (mediaVisible && !flipped && !reduceMotion) {
      video.play().catch(() => {
        /* autoplay blocked or unplayable file: the onError fallback handles broken files */
      });
    } else {
      video.pause();
    }
  }, [mediaVisible, flipped, videoFailed]);

  // Keyboard users: move focus to the button on the face that just became visible.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      (flipped ? backBtnRef : styleBtnRef).current?.focus({ preventScroll: true });
    }, 350);
    return () => clearTimeout(id);
  }, [flipped]);

  const faceBase =
    'col-start-1 row-start-1 flex flex-col overflow-hidden rounded-3xl border border-gold/40 bg-ivory shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(212,175,55,0.5)] backface-hidden';

  return (
    <article
      ref={cardRef}
      id={`event-${event.id}`}
      aria-label={event.name}
      className={`w-full max-w-sm transition-all duration-700 ease-out ${
        cardSeen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="perspective-1000">
        {/* Both faces share one grid cell, so the card height never jumps while flipping. */}
        <div
          className="grid transform-style-preserve-3d"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 650ms cubic-bezier(0.4, 0.2, 0.2, 1)',
          }}
        >
          {/* ---------- FRONT ---------- */}
          <div className={faceBase} inert={flipped} aria-hidden={flipped}>
            <div
              ref={mediaRef}
              className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-maroon-900 via-maroon-800 to-[#2a050b]"
            >
              {!videoFailed ? (
                <video
                  ref={videoRef}
                  src={event.videoPath}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setVideoFailed(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <div className="absolute h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28)_0%,rgba(212,175,55,0)_70%)]" />
                  <div className="absolute h-[58%] w-[78%] rounded-full border border-gold/30" />
                  <div className="absolute h-[44%] w-[60%] rounded-full border border-gold/20" />
                  <span className="text-6xl text-gold/60">✦</span>
                </div>
              )}

              {/* Gold plaque with the event name, date and time */}
              <div className="absolute left-1/2 top-[10%] w-[80%] -translate-x-1/2 rounded-md border-2 border-[#8a6a2f] bg-gradient-to-br from-[#ecd9a6] via-[#d8b979] to-[#b98f4b] px-3 py-3 text-center shadow-xl">
                <p className="font-script text-2xl sm:text-[1.7rem] font-semibold leading-tight text-maroon-900">
                  {event.name}
                </p>
                <p className="mt-1 font-serifSc text-sm tracking-[0.08em] text-maroon-900/90">{event.date}</p>
                <p className="font-serifSc text-xs tracking-[0.12em] text-maroon-900/80">{event.time}</p>
              </div>
            </div>

            <div className="space-y-2 bg-gradient-to-b from-white to-ivory px-5 pb-5 pt-4 text-center">
              <h3 className="font-script text-3xl font-semibold text-[#7a5614]">{event.name}</h3>
              <p className="font-serifSc text-xs leading-relaxed tracking-[0.14em] text-[#2f1a1e] uppercase sm:text-[13px]">
                {event.shortDescription}
              </p>

              <div className="space-y-1 pt-1">
                <p className="font-serifSc text-sm tracking-[0.1em] text-[#7a5614] uppercase">{event.date}</p>
                <p className="font-serifSc text-sm tracking-[0.1em] text-[#7a5614] uppercase">{event.time} Onwards</p>
                {event.extraLines?.map((line) => (
                  <p key={line} className="font-serifSc text-xs tracking-[0.1em] text-maroon-800 uppercase">
                    {line}
                  </p>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <p className="font-script text-2xl text-[#7a5614]">Venue</p>
                <p className="font-serifSc text-sm tracking-[0.1em] text-navy-deep uppercase">{event.venueName}</p>
                <p className="font-serifSc text-[11px] tracking-[0.1em] text-[#3a2328] uppercase">{event.address}</p>
              </div>

              <div className="space-y-2 pt-3">
                <a href={resolveMapsUrl(event)} target="_blank" rel="noopener noreferrer" className={pillClasses}>
                  Click here for the google location
                </a>
                <button ref={styleBtnRef} type="button" onClick={() => setFlipped(true)} className={pillClasses}>
                  Click here for the Style Guide
                </button>
              </div>
            </div>
          </div>

          {/* ---------- BACK (style guide) ---------- */}
          <div className={`${faceBase} rotate-y-180`} inert={!flipped} aria-hidden={!flipped}>
            <div className="relative min-h-[200px] flex-1 bg-maroon-900">
              <img
                src={event.styleGuideImagePath}
                alt={`${event.name} style guide inspiration`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2 bg-gradient-to-b from-white to-ivory px-5 pb-5 pt-4 text-center">
              <p className="font-serifSc text-[10px] tracking-[0.3em] text-maroon-800 uppercase">Wardrobe details</p>
              <h4 className="font-script text-3xl font-semibold text-[#7a5614]">{event.wardrobeTitle}</h4>
              <p className="font-serifSc text-xs leading-relaxed tracking-[0.12em] text-[#2f1a1e] uppercase sm:text-[13px]">
                {event.wardrobeText}
              </p>
              <div className="pt-3">
                <button
                  ref={backBtnRef}
                  type="button"
                  onClick={() => setFlipped(false)}
                  className={`${pillClasses} mx-auto !w-auto px-8`}
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
