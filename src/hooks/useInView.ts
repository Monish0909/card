import { useEffect, useRef, useState } from 'react';

/**
 * Tells you whether an element is currently (or, with `once`, has ever been) visible in the viewport.
 * Used for scroll-in entrances and to play/pause the event videos only while on screen.
 */
export function useInView<T extends Element = HTMLDivElement>(threshold = 0.3, once = false) {
  const ref = useRef<T | null>(null);
  // Very old browsers without IntersectionObserver: treat everything as visible.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, inView] as const;
}
