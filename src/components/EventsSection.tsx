import React from 'react';
import { useInView } from '../hooks/useInView';
import type { WeddingEvent } from '../types';
import { EventCard } from './EventCard';

interface EventsSectionProps {
  events: WeddingEvent[];
  heading?: string;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events, heading = 'Wedding Festivities' }) => {
  const [headRef, headSeen] = useInView<HTMLDivElement>(0.4, true);
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="mt-14 w-full sm:mt-16">
      <div ref={headRef} className={`reveal-head ${headSeen ? 'is-in' : ''}`}>
        <p className="text-center font-serifSc text-xs tracking-[0.35em] text-[#e9d9b8] uppercase">Join us for</p>
        <h2 id="events-heading" className="mt-1 text-center font-script text-5xl font-bold text-[#f7e7a9] drop-shadow-[0_2px_12px_rgba(247,231,169,0.35)] sm:text-6xl">
          {heading}
        </h2>
        <div className="ornament ornament-light mt-3" aria-hidden="true"><span /><i>✦</i><span /></div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-7">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
};
