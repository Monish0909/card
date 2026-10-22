import { useState, useRef, useEffect } from 'react';
import { FallingPetals } from './components/FallingPetals';
import { Opener } from './components/Opener';
import { AudioPlayer } from './components/AudioPlayer';
import { weddingContent } from './content';

export function App() {
  const [isOpenerOpen, setIsOpenerOpen] = useState(false);
  const [isOpenerUnmounted, setIsOpenerUnmounted] = useState(false);
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start bg-blush text-slate-800 font-sans selection:bg-gold-light selection:text-maroon-900">
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
          envelopeImage={weddingContent.assets.envelopeImage}
          envelopeVideo={weddingContent.assets.envelopeVideo}
          coupleNames={`${weddingContent.bride.name} & ${weddingContent.groom.name}`}
          hashtag={weddingContent.hashtag}
          onOpenStarted={handleStartAudio}
          onComplete={() => setIsOpenerUnmounted(true)}
        />
      )}

      {/* Background Watercolor Wash */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center opacity-85 z-0"
        style={{ backgroundImage: `url(${weddingContent.assets.bgWatercolor})` }}
        aria-hidden="true"
      />

      {/* Falling Petals Layer */}
      <FallingPetals />

      {/* Floating Mute/Unmute Control (44px tap target, appears once opener opens) */}
      <AudioPlayer
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        visible={isOpenerOpen}
      />

      {/* Main Invitation Container - Mobile-first 390px, centered max-w-2xl on desktop */}
      <main className="relative z-20 w-full max-w-2xl min-h-screen px-4 py-12 flex flex-col items-center">
        {/* Main Invitation Card Preview */}
        <section className="w-full max-w-md bg-white/75 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gold/40 shadow-gold-card text-center my-auto space-y-6">
          {/* Ganpati Icon */}
          <div className="mx-auto w-24 h-24">
            <img 
              src={weddingContent.assets.ganpatiLogo} 
              alt="Shree Ganesha Logo"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Mantra in Devanagari */}
          <p className="text-maroon-800 font-serifSc text-xs sm:text-sm tracking-widest leading-relaxed px-2">
            {weddingContent.mantraDevanagari}
          </p>

          <div className="w-20 h-[1px] bg-gold/50 mx-auto" />

          {/* Elder Invitation */}
          <div className="space-y-1">
            <h2 className="font-script text-2xl sm:text-3xl text-gold-deep font-semibold">
              {weddingContent.elder.name}
            </h2>
            <p className="font-serifSc text-[11px] sm:text-xs text-navy-deep/70 tracking-widest uppercase">
              {weddingContent.elder.subtext}
            </p>
          </div>

          <p className="font-serifSc text-xs text-navy-deep/80 tracking-[0.18em] uppercase">
            {weddingContent.invitationLines.line1} <br />
            {weddingContent.invitationLines.line2}
          </p>

          {/* Couple Presentation */}
          <div className="space-y-4 py-2">
            <div>
              <h3 className="font-script text-4xl sm:text-5xl text-gold-foil font-bold tracking-wide">
                {weddingContent.bride.name}
              </h3>
              <p className="font-serifSc text-[11px] text-navy-deep/75 tracking-wider mt-1">
                {weddingContent.bride.parentage}
              </p>
            </div>

            <p className="font-script text-2xl text-gold-deep italic">&amp;</p>

            <div>
              <h3 className="font-script text-4xl sm:text-5xl text-gold-foil font-bold tracking-wide">
                {weddingContent.groom.name}
              </h3>
              <p className="font-serifSc text-[11px] text-navy-deep/75 tracking-wider mt-1">
                {weddingContent.groom.parentage}
              </p>
            </div>
          </div>

          <div className="w-20 h-[1px] bg-gold/50 mx-auto" />

          <p className="font-serifSc text-xs tracking-[0.25em] text-maroon-900 font-semibold uppercase">
            {weddingContent.weddingDateFormatted}
          </p>

          <p className="text-[11px] text-slate-500 font-serifSc tracking-wider">
            {weddingContent.hashtag}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
