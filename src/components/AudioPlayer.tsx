import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  isMuted: boolean;
  onToggleMute: () => void;
  visible: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isMuted,
  onToggleMute,
  visible,
}) => {
  if (!visible) return null;

  return (
    <button
      id="audio-mute-toggle-btn"
      onClick={onToggleMute}
      aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-maroon-800/85 backdrop-blur-md border border-gold/70 text-gold-light shadow-gold-glow hover:bg-maroon-900 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/60"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-gold-light/80" />
      ) : (
        <Volume2 className="w-5 h-5 text-gold-light animate-pulse" />
      )}
    </button>
  );
};
