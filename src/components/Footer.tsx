import React from 'react';

interface FooterProps {
  regards: string;
  credit: string;
  contact: string;
}

export const Footer: React.FC<FooterProps> = ({ regards, credit, contact }) => (
  // Extra bottom padding keeps the last lines clear of the floating mute button.
  <footer className="mt-16 w-full px-4 pb-28 text-center">
    <div className="ornament ornament-light mb-6" aria-hidden="true"><span /><i>✦</i><span /></div>
    <p className="mx-auto max-w-xs font-script text-3xl leading-relaxed text-[#f7e7a9]">{regards}</p>
    <p className="mt-8 font-serifSc text-[11px] tracking-[0.2em] text-[#e9d9b8] uppercase">{credit}</p>
    <p className="mt-1 font-serifSc text-[11px] tracking-[0.14em] text-[#e9d9b8]/80">{contact}</p>
  </footer>
);
