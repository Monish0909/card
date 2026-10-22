import React, { useMemo } from 'react';

interface PetalConfig {
  id: number;
  left: number; // percentage (0 - 100)
  size: number; // px (12 - 30)
  duration: number; // seconds (9 - 19)
  delay: number; // negative seconds (-15 - 0)
  swayStart: number; // px
  swayEnd: number; // px
  tintClass: string;
}

export const FallingPetals: React.FC = () => {
  // Generate 24 fixed petal configurations once
  const petals = useMemo<PetalConfig[]>(() => {
    const tints = [
      'bg-[#f6d58a]', // Marigold
      'bg-[#fbcfe8]', // Soft rose
      'bg-[#fda4af]', // Rose-300
    ];

    return Array.from({ length: 24 }).map((_, index) => {
      const size = 12 + Math.floor(Math.random() * 19); // 12px to 30px
      const duration = 9 + Math.random() * 10; // 9s to 19s
      const delay = -(Math.random() * 15); // negative delay for immediate presence
      const swayDistance = 40 + Math.random() * 60; // 40px to 100px sway
      const swayDirection = index % 2 === 0 ? 1 : -1;
      const tintClass = tints[index % tints.length];

      return {
        id: index,
        left: (index * 4.2 + (Math.random() * 3)) % 100, // evenly distributed across width
        size,
        duration,
        delay,
        swayStart: -swayDistance * 0.5 * swayDirection,
        swayEnd: swayDistance * swayDirection,
        tintClass,
      };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      {petals.map((petal) => (
        <div
          key={petal.id}
          className={`absolute top-0 opacity-40 animate-petal ${petal.tintClass} shadow-sm`}
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            borderRadius: '50% 0 50% 50%',
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            ['--sway-start' as any]: `${petal.swayStart}px`,
            ['--sway-end' as any]: `${petal.swayEnd}px`,
          }}
        />
      ))}
    </div>
  );
};
