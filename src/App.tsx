import { useState, useRef, useEffect } from 'react';
import { FallingPetals } from './components/FallingPetals';
import { Opener } from './components/Opener';
import { AudioPlayer } from './components/AudioPlayer';
import { ScratchCard } from './components/ScratchCard';
import { Countdown } from './components/Countdown';
import { EventsSection } from './components/EventsSection';
import { Footer } from './components/Footer';
import { weddingContent } from './content';

export function App() {
  const [isOpenerOpen, setIsOpenerOpen] = useState(false);
  const [isOpenerUnmounted, setIsOpenerUnmounted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and handle background music safely
  const handleStartAudio = () => {
    setIsOpenerOpen(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.45;
      audioRef.current.play().catch(() => {
        // Autoplay policy or corrupt audio stream caught gracefully
        console.warn('Audio playback not permitted or stream failed gracefully.');
      });
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
    if (!nextMuted && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-maroon-900 text-slate-800 font-sans selection:bg-gold-light selection:text-maroon-900">
      {/* Background Audio element */}
      <audio
        ref={audioRef}
        src={weddingContent.assets.bgMusic}
        loop
        preload="auto"
      />

      {/* 1) Full-screen Opener Overlay */}
      {!isOpenerUnmounted && (
        <Opener
          envelopeVideo={weddingContent.assets.envelopeVideo}
          brideName={weddingContent.bride.name}
          groomName={weddingContent.groom.name}
          hashtag={weddingContent.hashtag}
          dateFormatted={weddingContent.weddingDateFormatted}
          onOpenStarted={handleStartAudio}
          onRevealStart={() => setIsRevealed(true)}
          onComplete={() => {
            setIsRevealed(true);
            setIsOpenerUnmounted(true);
          }}
        />
      )}

      {/* Background Watercolor Wash */}
      <div className="royal-bg fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <svg className="royal-mandala" viewBox="-200 -200 400 400">
          <g fill="none" stroke="#f5e08b" strokeWidth="0.6">
            {[40, 70, 110, 150, 190].map((r) => (
              <circle key={r} r={r} />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <ellipse key={i} cx="0" cy="-95" rx="14" ry="44" transform={`rotate(${i * 15})`} />
            ))}
          </g>
        </svg>
      </div>

      {/* Falling Petals Layer */}
      <FallingPetals />

      {/* Floating Mute/Unmute Control (44px tap target, appears once opener opens) */}
      <AudioPlayer
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        visible={isOpenerOpen}
      />

      {/* Main Invitation Container - Mobile-first 390px, centered max-w-2xl on desktop */}
      <main
        inert={!isOpenerUnmounted}
        data-revealed={isRevealed ? '' : undefined}
        className="page-settle relative z-20 w-full max-w-2xl min-h-screen px-4 py-8 sm:py-12 flex flex-col items-center"
      >
        {/* Main Invitation Card */}
        <article className="paper w-full max-w-md rounded-[28px] px-6 py-10 sm:px-9 sm:py-12 text-center space-y-6 animate-entrance">
          <span className="paper-corner tl" aria-hidden="true" />
          <span className="paper-corner tr" aria-hidden="true" />
          <span className="paper-corner bl" aria-hidden="true" />
          <span className="paper-corner br" aria-hidden="true" />
          {/* Step 1: Ganpati Icon */}
          <div className="halo mx-auto w-24 h-24 sm:w-28 sm:h-28 animate-entrance delay-step-1">
            <img 
              src={weddingContent.assets.ganpatiLogo} 
              alt="Shree Ganesha Logo"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Step 2: Mantra in Devanagari */}
          <p lang="sa" className="text-maroon-900 font-deva font-semibold text-[15px] sm:text-base tracking-normal leading-loose px-1 animate-entrance delay-step-2">
            {weddingContent.mantraDevanagari}
          </p>

          <div className="ornament animate-entrance delay-step-2" aria-hidden="true"><span /><i>✦</i><span /></div>

          {/* Step 3: Elder Invitation */}
          <div className="space-y-1 animate-entrance delay-step-3">
            <h2 className="font-script text-3xl sm:text-4xl text-maroon-800 font-bold">
              {weddingContent.elder.name}
            </h2>
            <p className="font-serifSc text-xs sm:text-[13px] text-[#4a2a30] tracking-[0.12em] uppercase">
              {weddingContent.elder.subtext}
            </p>
          </div>

          {/* Step 4: Cordially Invites You */}
          <p className="font-serifSc text-[13px] text-[#2f1a1e] tracking-[0.16em] uppercase animate-entrance delay-step-4 leading-loose">
            {weddingContent.invitationLines.line1} <br />
            {weddingContent.invitationLines.line2}
          </p>

          {/* Step 5: Couple Presentation */}
          <div className="space-y-4 py-1 animate-entrance delay-step-5">
            <div>
              <h3 className="couple-name font-script text-6xl sm:text-7xl leading-[1.15] font-bold tracking-wide">
                {weddingContent.bride.name}
              </h3>
              <p className="font-serifSc text-xs text-[#4a2a30] tracking-wider mt-1">
                {weddingContent.bride.parentage}
              </p>
            </div>

            <p className="font-script text-4xl text-[#9a6b14]">&amp;</p>

            <div>
              <h3 className="couple-name font-script text-6xl sm:text-7xl leading-[1.15] font-bold tracking-wide">
                {weddingContent.groom.name}
              </h3>
              <p className="font-serifSc text-xs text-[#4a2a30] tracking-wider mt-1">
                {weddingContent.groom.parentage}
              </p>
            </div>
          </div>

          <div className="ornament animate-entrance delay-step-5" aria-hidden="true"><span /><i>✦</i><span /></div>

          {/* Step 6: Scratch-to-reveal Wedding Date with reserved height & accessibility */}
          <section aria-label="Wedding Date Section" className="animate-entrance delay-step-6">
            <ScratchCard weddingDateFormatted={weddingContent.weddingDateFormatted} />
          </section>

          {/* Step 7: Live Countdown Timer to 2026-12-20T19:30:00+05:30 */}
          <section aria-label="Countdown Timer" className="animate-entrance delay-step-7">
            <Countdown
              targetDateISO={weddingContent.weddingDateISO}
              coupleNames={`${weddingContent.bride.name} & ${weddingContent.groom.name}`}
            />
          </section>

          {/* Step 8: Hashtag */}
          <footer className="pt-2 animate-entrance delay-step-8">
            <p className="text-xs sm:text-[13px] text-maroon-800 font-serifSc tracking-[0.2em] uppercase">
              {weddingContent.hashtag}
            </p>
          </footer>
        </article>

        {/* Wedding Festivities: one flip card per event (videos, venue, maps, style guide) */}
        <EventsSection events={weddingContent.events} />

        <Footer
          regards={weddingContent.footer.regards}
          credit={weddingContent.footer.credit}
          contact={weddingContent.footer.creditContactPlaceholder}
        />
      </main>
    </div>
  );
}

export default App;
