import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDateISO: string;
  coupleNames: string; // e.g. "Aanya & Veer" - comes from content.ts
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const calculateTimeLeft = (targetISO: string): TimeLeft => {
  const diff = new Date(targetISO).getTime() - new Date().getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isPast: false };
};

export const Countdown: React.FC<CountdownProps> = ({ targetDateISO, coupleNames }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDateISO));

  useEffect(() => {
    // Update immediately when targetDateISO changes
    setTimeLeft(calculateTimeLeft(targetDateISO));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDateISO));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateISO]);

  if (timeLeft.isPast) {
    return (
      <div 
        id="countdown-past" 
        className="mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-gold/10 via-blush to-gold/10 border border-gold/40 text-center shadow-inner"
      >
        <p className="font-script text-3xl text-maroon-800 font-bold tracking-wide">
          Celebrated with love
        </p>
        <p className="font-serifSc text-xs text-[#2f1a1e] tracking-[0.15em] uppercase mt-1">
          Thank you for showering your blessings upon {coupleNames}
        </p>
      </div>
    );
  }

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <div id="countdown-section" className="mt-6 w-full flex flex-col items-center">
      <p className="font-serifSc text-xs sm:text-[13px] uppercase tracking-[0.22em] text-maroon-900 font-semibold mb-3">
        Countdown to the Auspicious Hour
      </p>

      {/* 4 Countdown Boxes */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm">
        {timeUnits.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-gradient-to-b from-maroon-700 to-maroon-900 border border-[#d4af37]/70 shadow-md"
          >
            <span key={value} className="tick font-serifSc text-2xl sm:text-3xl font-bold text-[#f7e7a9] tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-serifSc tracking-[0.15em] text-[#e9d9b8] font-medium mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
